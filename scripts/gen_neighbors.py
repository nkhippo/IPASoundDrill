#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_neighbors.py  (STEP4-b)
Mode B の MCQ distractor 用に、各語へ「音素近傍トップK」を付与する。

設計（docs/DESIGN.md §2.2 準拠）:
- 近傍 = IPAトークン列の編集距離が小さい語（confusable）。
- ミニマルペア（距離1の "置換"）を最優先 → 実質ミニマルペア知覚テストになる。
- 同バンド（CEFR）を優先。
- 強勢記号は距離計算では無視（音素の紛らわしさが本質。強勢差は副次）。
- 出力: neighbors = [{"w":..., "d":距離, "type":"sub|ins|del|mix"} ...] 上位K。

入力 : wordlist_GA_a1a2_plus_phonics.json
出力 : wordlist_with_neighbors.json  (元の全フィールド + neighbors)
      neighbors_report.md            (品質確認用サマリ)
"""
import json, sys
from collections import Counter, defaultdict
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
K = 8                    # 近傍トップK
MAX_DIST = 2             # これより遠い語は近傍にしない
INPUT = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
OUTPUT = ROOT / "data" / "wordlist_with_neighbors.json"
REPORT = ROOT / "docs" / "neighbors_report.md"

MULTI = ['tʃ','dʒ','eɪ','aɪ','ɔɪ','oʊ','aʊ']

def tokenize(ipa):
    """強勢記号を除いた音素トークン列。"""
    s = ipa.replace('/','').replace('ˈ','').replace('ˌ','')
    o=[]; i=0
    while i < len(s):
        m=None
        for x in MULTI:
            if s.startswith(x,i): m=x; break
        if m: o.append(m); i+=len(m)
        else: o.append(s[i]); i+=1
    return o

def edit_ops(a, b):
    """編集距離と、距離1のときの操作種別を返す。
       returns (dist, type)  type in {sub, ins, del, mix, ''}"""
    la, lb = len(a), len(b)
    # DP
    dp = [[0]*(lb+1) for _ in range(la+1)]
    for i in range(la+1): dp[i][0]=i
    for j in range(lb+1): dp[0][j]=j
    for i in range(1,la+1):
        ai=a[i-1]
        for j in range(1,lb+1):
            if ai==b[j-1]:
                dp[i][j]=dp[i-1][j-1]
            else:
                dp[i][j]=1+min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1])
    d = dp[la][lb]
    if d==1:
        if la==lb:  t='sub'      # 置換（ミニマルペア核心：ship/chip）
        elif la>lb: t='del'      # aが1音素多い
        else:       t='ins'      # aが1音素少ない
    elif d==2:
        t='mix'
    else:
        t=''
    return d, t

def main():
    data = json.load(open(INPUT, encoding='utf-8'))
    n = len(data)

    # 前計算: トークン列・バンド
    toks = [tokenize(e['ipa']) for e in data]
    tlen = [len(t) for t in toks]
    band = [e.get('cefr') for e in data]
    words = [e['w'] for e in data]

    # 長さでバケツ化 → 長さ±1 のバケツだけ比較（計算削減）
    by_len = defaultdict(list)
    for idx, L in enumerate(tlen):
        by_len[L].append(idx)

    # type優先度: sub(ミニマルペア) を最優先、次に ins/del、最後 mix
    TYPE_RANK = {'sub':0, 'ins':1, 'del':1, 'mix':2}

    neighbors_all = [[] for _ in range(n)]

    for i in range(n):
        ti = toks[i]; Li = tlen[i]
        cand = []
        for L in (Li-1, Li, Li+1):
            for j in by_len.get(L, []):
                if j == i: continue
                # 同一綴り違いの自己類似（A/a 等）も distractor として有効なので除外しない
                if words[j].lower() == words[i].lower(): continue
                d, t = edit_ops(ti, toks[j])
                if d == 0:           # 完全同音（homophone）。distractorに不適なので除外
                    continue
                if d > MAX_DIST: continue
                same_band = 1 if band[j] == band[i] else 0
                cand.append((TYPE_RANK.get(t,9), d, -same_band, j, t))
        # ソート: type優先 → 距離 → 同バンド優先 → 安定化
        cand.sort(key=lambda x:(x[0], x[1], x[2], words[x[3]]))
        top = cand[:K]
        neighbors_all[i] = [{'w':words[j], 'd':d, 'type':t} for (_,d,_,j,t) in top]

    # 書き出し（元フィールド保持 + neighbors 追加）
    for i,e in enumerate(data):
        e['neighbors'] = neighbors_all[i]
    json.dump(data, open(OUTPUT,'w',encoding='utf-8'), ensure_ascii=False)

    # ── レポート ──
    cnt = [len(x) for x in neighbors_all]
    zero = sum(1 for c in cnt if c==0)
    lt3  = sum(1 for c in cnt if c<3)
    full = sum(1 for c in cnt if c>=K)
    sub_cnt = sum(1 for x in neighbors_all for nb in x if nb['type']=='sub')
    has_sub = sum(1 for x in neighbors_all if any(nb['type']=='sub' for nb in x))

    lines = []
    lines.append("# neighbors 生成レポート (STEP4-b)\n")
    lines.append(f"- 総語数: **{n}**")
    lines.append(f"- K (近傍上限): {K} / MAX_DIST: {MAX_DIST}")
    lines.append(f"- 近傍0語: **{zero}** ({zero*100//n}%)  ← Mode B実行時はランダム補填")
    lines.append(f"- 近傍3語未満: {lt3} ({lt3*100//n}%)")
    lines.append(f"- 近傍K語フル: {full} ({full*100//n}%)")
    lines.append(f"- 平均近傍数: {sum(cnt)/n:.1f}")
    lines.append(f"- ミニマルペア(sub)を1つ以上持つ語: **{has_sub}** ({has_sub*100//n}%)")
    lines.append("")
    lines.append("## サンプル: 主要なミニマルペアが取れているか\n")
    m = {e['w']: i for i,e in enumerate(data)}
    samples = ['three','those','ship','right','sink','bad','vote','seat','cot','pull']
    for w in samples:
        if w in m:
            i=m[w]
            nb = neighbors_all[i]
            shown = ', '.join(f"{x['w']}/{x['type']}{x['d']}" for x in nb[:6])
            lines.append(f"- **{w}** {data[i]['ipa']} → {shown}")
    lines.append("")
    lines.append("## 近傍数の分布")
    dist = Counter(cnt)
    for k in sorted(dist):
        lines.append(f"  - {k}近傍: {dist[k]}語")
    open(REPORT,'w',encoding='utf-8').write('\n'.join(lines))

    print(f"完了: {n}語に neighbors 付与 → {OUTPUT}")
    print(f"近傍0語: {zero} / ミニマルペア保有: {has_sub} ({has_sub*100//n}%)")
    print(f"レポート: {REPORT}")

if __name__=='__main__':
    main()
