#!/usr/bin/env python3

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths
# -*- coding: utf-8 -*-
"""
gen_neighbors.py  (STEP4-b, v2 — adaptive)
Mode B の MCQ distractor 用に各語へ「音素近傍トップK」を付与する。

設計（docs/DESIGN.md §2.2 準拠）:
- 近傍 = IPAトークン列の編集距離が小さい語（confusable）
- ミニマルペア（距離1 sub）を最優先 → MCQ が知覚テストになる
- 同バンド（CEFR）を優先
- 強勢記号は距離計算では無視（音素紛らわしさが本質）
- 出力: neighbors = [{"w":..., "d":距離, "type":"sub|ins|del|mix|mix3|mix4"}, ...] 上位K

【2026-07-09 v2 変更】
Phase 1 B1 拡充で 12-14 トークンの長い複合語 (misunderstanding,
international, representative 等) が追加され、固定 MAX_DIST=2 では B1 の
29% が近傍 0 になった。以下の適応化で 5% まで改善:

- MAX_DIST を語長で段階化:
    length ≥ 11 → MAX_DIST=4  (very long compound words)
    length ≥  7 → MAX_DIST=3  (long words)
    それ以外   → MAX_DIST=2  (unchanged)
- 長さバケツを ±MAX_DIST に拡大（従来は ±1 固定）
- 長さペナルティを距離同点時のタイブレーカに追加
  （12 トークン語が 9 トークン語より 12 トークン語を優先）

RP neighbors については別途 GA 流用が妥当と決定済み。
参照: docs/reference/rp-neighbors-priority-decision.md
将来トリガー到達時は距離入力を rp_ipa に切替、`neighbors_rp` として出力。

入力: wordlist_GA_a1a2_plus_phonics.json
出力: data/derived/wordlist_with_neighbors.json (元の全フィールド + neighbors)
     data/derived/wordlist_with_neighbors_slim.json (neighbors を string 配列に)
     docs/reference/neighbors_report.md (品質確認用サマリ)
"""
import json
from collections import Counter, defaultdict
from pathlib import Path

K = 8
LONG_THRESHOLD = 7            # ≥7 tokens → MAX_DIST=3
VERY_LONG_THRESHOLD = 11      # ≥11 tokens → MAX_DIST=4
MAX_DIST_SHORT = 2
MAX_DIST_LONG = 3
MAX_DIST_VERY_LONG = 4

INPUT = paths.WORDLIST
OUTPUT = paths.WORDLIST_NEIGHBORS
SLIM_OUTPUT = paths.WORDLIST_NEIGHBORS_SLIM
REPORT = paths.NEIGHBORS_REPORT

MULTI = ['tʃ', 'dʒ', 'eɪ', 'aɪ', 'ɔɪ', 'oʊ', 'aʊ']

def tokenize(ipa):
    """強勢記号を除いた音素トークン列。"""
    s = ipa.replace('/', '').replace('ˈ', '').replace('ˌ', '')
    o = []
    i = 0
    while i < len(s):
        m = None
        for x in MULTI:
            if s.startswith(x, i):
                m = x
                break
        if m:
            o.append(m)
            i += len(m)
        else:
            o.append(s[i])
            i += 1
    return o

def edit_ops(a, b):
    """編集距離と、距離1のときの操作種別を返す。
       returns (dist, type)  type in {sub, ins, del, mix, mix3, mix4, ''}"""
    la, lb = len(a), len(b)
    dp = [[0] * (lb + 1) for _ in range(la + 1)]
    for i in range(la + 1): dp[i][0] = i
    for j in range(lb + 1): dp[0][j] = j
    for i in range(1, la + 1):
        ai = a[i - 1]
        for j in range(1, lb + 1):
            if ai == b[j - 1]:
                dp[i][j] = dp[i - 1][j - 1]
            else:
                dp[i][j] = 1 + min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1])
    d = dp[la][lb]
    if d == 1:
        if la == lb:   t = 'sub'
        elif la > lb:  t = 'del'
        else:          t = 'ins'
    elif d == 2:
        t = 'mix'
    elif d == 3:
        t = 'mix3'
    elif d == 4:
        t = 'mix4'
    else:
        t = ''
    return d, t

def max_dist_for(length):
    if length >= VERY_LONG_THRESHOLD:
        return MAX_DIST_VERY_LONG
    if length >= LONG_THRESHOLD:
        return MAX_DIST_LONG
    return MAX_DIST_SHORT

# type優先度: sub(ミニマルペア) 最優先、次に ins/del、mix、mix3、mix4
TYPE_RANK = {'sub': 0, 'ins': 1, 'del': 1, 'mix': 2, 'mix3': 3, 'mix4': 4}

def main():
    data = json.load(open(INPUT, encoding='utf-8'))
    n = len(data)

    toks = [tokenize(e['ipa']) for e in data]
    tlen = [len(t) for t in toks]
    band = [e.get('cefr') for e in data]
    words = [e['w'] for e in data]

    by_len = defaultdict(list)
    for idx, L in enumerate(tlen):
        by_len[L].append(idx)

    neighbors_all = [[] for _ in range(n)]

    for i in range(n):
        ti = toks[i]
        Li = tlen[i]
        md = max_dist_for(Li)
        cand = []
        # 長さバケツを ±MAX_DIST に拡大
        for L in range(Li - md, Li + md + 1):
            for j in by_len.get(L, []):
                if j == i: continue
                if words[j].lower() == words[i].lower(): continue
                d, t = edit_ops(ti, toks[j])
                if d == 0: continue    # homophone
                if d > md: continue
                same_band = 1 if band[j] == band[i] else 0
                # 距離同点時のタイブレーカに長さペナルティを追加
                len_penalty = abs(len(toks[j]) - Li)
                cand.append((TYPE_RANK.get(t, 9), d, len_penalty, -same_band, j, t))
        cand.sort(key=lambda x: (x[0], x[1], x[2], x[3], words[x[4]]))
        top = cand[:K]
        neighbors_all[i] = [{'w': words[j], 'd': d, 'type': t}
                            for (_, d, _, _, j, t) in top]

    for i, e in enumerate(data):
        e['neighbors'] = neighbors_all[i]
    json.dump(data, open(OUTPUT, 'w', encoding='utf-8'), ensure_ascii=False)
    slim = []
    for e in data:
        row = dict(e)
        row['neighbors'] = [nb['w'] for nb in e['neighbors']]
        slim.append(row)
    json.dump(slim, open(SLIM_OUTPUT, 'w', encoding='utf-8'), ensure_ascii=False)

    # ── レポート ──
    cnt = [len(x) for x in neighbors_all]
    zero = sum(1 for c in cnt if c == 0)
    lt3 = sum(1 for c in cnt if c < 3)
    full = sum(1 for c in cnt if c >= K)
    sub_cnt = sum(1 for x in neighbors_all for nb in x if nb['type'] == 'sub')
    has_sub = sum(1 for x in neighbors_all if any(nb['type'] == 'sub' for nb in x))

    lines = []
    lines.append("# neighbors 生成レポート (STEP4-b, v2 — adaptive)\n")
    lines.append(f"- 総語数: **{n}**")
    lines.append(f"- K (近傍上限): {K}")
    lines.append(f"- MAX_DIST: {MAX_DIST_SHORT} (短 <{LONG_THRESHOLD}) / "
                 f"{MAX_DIST_LONG} ({LONG_THRESHOLD}≤ 長 <{VERY_LONG_THRESHOLD}) / "
                 f"{MAX_DIST_VERY_LONG} (超長 ≥{VERY_LONG_THRESHOLD})")
    lines.append(f"- 近傍0語: **{zero}** ({zero*100//n}%)  ← Mode B実行時はランダム補填")
    lines.append(f"- 近傍3語未満: {lt3} ({lt3*100//n}%)")
    lines.append(f"- 近傍K語フル: {full} ({full*100//n}%)")
    lines.append(f"- 平均近傍数: {sum(cnt)/n:.1f}")
    lines.append(f"- ミニマルペア(sub)を1つ以上持つ語: **{has_sub}** ({has_sub*100//n}%)")

    # CEFR別集計
    lines.append("\n## CEFR別カバー率\n")
    lines.append("| CEFR | 総数 | 0近傍 | 0近傍% | フルK% | sub保有% |")
    lines.append("|---|---:|---:|---:|---:|---:|")
    by_cefr = defaultdict(list)
    for i, w in enumerate(data):
        by_cefr[w.get('cefr') or 'None'].append(i)
    for c in ['A1', 'A2', 'B1', 'B2']:
        idxs = by_cefr.get(c, [])
        if not idxs: continue
        t = len(idxs)
        z = sum(1 for i in idxs if len(neighbors_all[i]) == 0)
        f = sum(1 for i in idxs if len(neighbors_all[i]) >= K)
        s = sum(1 for i in idxs if any(nb['type'] == 'sub' for nb in neighbors_all[i]))
        lines.append(f"| {c} | {t} | {z} | {100*z/t:.0f}% | {100*f/t:.0f}% | {100*s/t:.0f}% |")

    lines.append("\n## サンプル: 主要なミニマルペアが取れているか\n")
    m = {e['w']: i for i, e in enumerate(data)}
    samples = ['three', 'those', 'ship', 'right', 'sink', 'bad', 'vote',
               'seat', 'cot', 'pull']
    for w in samples:
        if w in m:
            i = m[w]
            nb = neighbors_all[i]
            shown = ', '.join(f"{x['w']}/{x['type']}{x['d']}" for x in nb[:6])
            lines.append(f"- **{w}** {data[i]['ipa']} → {shown}")

    lines.append("\n## サンプル: 長い複合語（v2 で新たに近傍を得たもの）\n")
    long_samples = ['basketball', 'submarine', 'rainforest', 'entertainment',
                    'international', 'organization', 'information',
                    'representative', 'advertisement', 'literature']
    for w in long_samples:
        if w in m:
            i = m[w]
            nb = neighbors_all[i]
            shown = ', '.join(f"{x['w']}/{x['type']}{x['d']}" for x in nb[:6])
            lines.append(f"- **{w}** {data[i]['ipa']} ({tlen[i]} tokens) → "
                         f"{shown or '(0 neighbors — genuinely isolated in wordlist)'}")

    lines.append("\n## 近傍数の分布")
    dist = Counter(cnt)
    for k in sorted(dist):
        lines.append(f"  - {k}近傍: {dist[k]}語")

    open(REPORT, 'w', encoding='utf-8').write('\n'.join(lines))

    print(f"完了: {n}語に neighbors 付与 → {OUTPUT}")
    print(f"slim版: {SLIM_OUTPUT}")
    print(f"近傍0語: {zero} ({zero*100//n}%) / "
          f"ミニマルペア保有: {has_sub} ({has_sub*100//n}%)")
    print(f"レポート: {REPORT}")

if __name__ == '__main__':
    main()
