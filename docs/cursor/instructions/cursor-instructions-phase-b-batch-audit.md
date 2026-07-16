---
id: pj-2026-07-10-9632
aliases:
- pj-2026-07-10-9632
title: 'Cursor 指示書 — パッケージ B: Phase 2 バッチ品質監査 修正 (Phase B)'
created: '2026-07-10'
---
# Cursor 指示書 — パッケージ B: Phase 2 バッチ品質監査 修正 (Phase B)

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 想定 branch: `fix/phase-b-batch-quality-audit`
- 優先度: 中〜高（本番 wordlist にも波及した bug 2件 + Fil 品質改善 + バッチ凍結解除）
- 前提: Phase R (RP パイプライン修正) 完了済み
- 段取り: **B1 → B2 → B3 → B4 → B5 の順で phase 単位に commit**

---

## 0. サマリ

パッケージ B は Phase 2 バッチ 5 ファイル (569 語) の独立 Opus 監査結果を反映する。

### 監査結果ハイライト

| 発見 | 件数 | 状態 |
|---|---:|---|
| 🔴 gloss.zh 的的 typo (**本番 wordlist にも波及**) | 2 語 | `comprehensive`, `corporal` |
| 🔴 バッチ rp_ipa `-iː`→`-i` 未同期 (Phase R2 の下流修正) | 68 語 | バッチ側は生成時のまま |
| 🔴 バッチ rp_ipa 母音脱字 未同期 (dignify hotfix の下流修正) | 2 語 | `dignify`, `dignity` (M2d) |
| 🟡 POS `感嘆詞` → i18n の `間投詞` に正規化 | 1 語 | `damn` (app 表示崩れ回避) |
| 🟡 Fil pass-through 51 語 の翻訳精査 | 51 語 | Opus 提案: 8 語 firm 変更、5 語 native 化、38 語 keep as-is |
| 🟢 その他 IPA / def / gloss.ja / gloss.zh / gloss.ko | 0 | 新規 bug 発見なし |

### Phase 構成

| Phase | 目的 | 変更ファイル |
|---|---|---|
| **B1** | wordlist の gloss.zh 的的 typo と POS 正規化 (本番影響) | wordlist |
| **B2** | wordlist の Fil 翻訳 51 語適用 (Opus 提案) | wordlist |
| **B3** | 5 バッチファイルを wordlist と同期 (再マージ時の再発防止) | batches |
| **B4** | i18n POS の `形容詞 / 副詞 / 間投詞` キー追加 (`damn` 対応) | i18n × 6 |
| **B5** | 派生データ再生成 + ドキュメント | docs, wordlist derived |

**総修正数:**
- wordlist: 16 語 (typo 2 + POS 1 + Fil 13)
- バッチ: 86 語 (pilot 3 + M2a 29 + M2b 14 + M2c 22 + M2d 18)
- i18n: 1 キー × 6 言語

---

## 1. 事前準備

### 1-1. 添付ファイル

指示書と同時に以下の patch JSON を受け取る (Claude が生成):

```
patches/phase2_pilot_audit_patch.json
patches/phase2_m2a_audit_patch.json
patches/phase2_m2b_audit_patch.json
patches/phase2_m2c_audit_patch.json
patches/phase2_m2d_audit_patch.json
patches/wordlist_audit_patch.json
```

これらを **`data/patches/phase2_audit/`** に配置:

```bash
mkdir -p data/patches/phase2_audit
cp /path/to/patches/*.json data/patches/phase2_audit/
```

### 1-2. ブランチ作成とバックアップ

```bash
git checkout main
git pull
git checkout -b fix/phase-b-batch-quality-audit
cp wordlist_GA_a1a2_plus_phonics.json /tmp/wordlist_pre_phase_b.json
cp -r data/batches /tmp/batches_pre_phase_b
```

### 1-3. 現状基準値取得

```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
print('total:', len(d))
# 監査対象 typo
for e in d:
    if e['w'] in ('comprehensive', 'corporal', 'damn'):
        print(f'{e[\"w\"]}: pos={e.get(\"pos\")}, gloss.zh={e.get(\"gloss\",{}).get(\"zh\")}, gloss.fil={e.get(\"gloss\",{}).get(\"fil\")}')
" | tee /tmp/wordlist_baseline_b.txt
```

**期待値:**
```
total: 5397
comprehensive: pos=形容詞, gloss.zh=全面的的, gloss.fil=komprehensibo
corporal: pos=形容詞, gloss.zh=身体的的, gloss.fil=pisikal
damn: pos=形容詞 / 副詞 / 感嘆詞, gloss.zh=该死, gloss.fil=sumpain
```

---

# Phase B1 — wordlist の gloss.zh typo 修正 + POS 正規化

## B1-1. 目的

Opus 監査で発見された **本番 wordlist に波及していた bug** を最優先で修正する:

1. `comprehensive` gloss.zh `全面的的` → `全面的` (的重複 typo)
2. `corporal` gloss.zh `身体的的` → `身体的` (同上)
3. `damn` POS `形容詞 / 副詞 / 感嘆詞` → `形容詞 / 副詞 / 間投詞` (i18n 整合)

## B1-2. 変更内容

`patches/wordlist_audit_patch.json` の先頭 3 エントリを wordlist に適用。

```bash
python3 << 'EOF'
import json
wl = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
patch = json.load(open('data/patches/phase2_audit/wordlist_audit_patch.json'))
wl_by_w = {e['w']: e for e in wl}

# Apply first 3 (typos + POS)
target_words = {'comprehensive', 'corporal', 'damn'}
n = 0
for p in patch:
    if p['w'] not in target_words:
        continue
    e = wl_by_w[p['w']]
    if 'pos' in p:
        e['pos'] = p['pos']
    if 'gloss' in p:
        for k, v in p['gloss'].items():
            e.setdefault('gloss', {})[k] = v
    n += 1
    print(f"  patched {p['w']}: {p}")

assert n == 3, f"expected 3 patches, got {n}"
json.dump(wl, open('wordlist_GA_a1a2_plus_phonics.json', 'w'), ensure_ascii=False, indent=1)
print(f"\ntotal: {n} entries updated")
EOF
```

## B1-3. 検証

```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
for e in d:
    if e['w'] in ('comprehensive', 'corporal', 'damn'):
        print(f'{e[\"w\"]}: pos={e.get(\"pos\")}, gloss.zh={e.get(\"gloss\",{}).get(\"zh\")}')

# Global scan: no more 的的
n_of_of = sum(1 for e in d if '的的' in (e.get('gloss', {}).get('zh') or ''))
print(f'\\nRemaining 的的 in wordlist gloss.zh: {n_of_of}')
assert n_of_of == 0, 'residual 的的 found'
print('OK')
"
```

**期待:**
```
comprehensive: pos=形容詞, gloss.zh=全面的
corporal: pos=形容詞, gloss.zh=身体的
damn: pos=形容詞 / 副詞 / 間投詞, gloss.zh=该死

Remaining 的的 in wordlist gloss.zh: 0
OK
```

## B1-4. コミット

```bash
git add wordlist_GA_a1a2_plus_phonics.json
git commit -m "fix(data): correct gloss.zh 的的 typos (comprehensive, corporal) + normalize damn POS

Opus audit findings from Phase 2 batch review (see Phase B audit report):
- comprehensive: gloss.zh 全面的的 → 全面的
- corporal: gloss.zh 身体的的 → 身体的
- damn: POS 感嘆詞 → 間投詞 (i18n consistency)"
```

---

# Phase B2 — wordlist Fil 翻訳 51 語適用

## B2-1. 目的

Opus 監査で発見された Fil pass-through 51 語のうち、**13 語に翻訳更新を適用**する。残り 38 語は「正当な国際借用語 / 固有名詞 / IT 語彙」として現状維持。

### カテゴリ B: 明確な Fil 翻訳を適用 (8 語)

| 語 | 現状 fil | 更新後 fil | 根拠 |
|---|---|---|---|
| anchorperson | anchorperson | **tagapagbalita** | Fil news 業界慣例 |
| antibacterial | antibacterial | **antibakteryal** | スペイン語綴り Fil 化 |
| barometer | barometer | **barometro** | スペイン語由来の一般語 |
| broadcaster | broadcaster | **tagapamahayag** | native Fil で自然 |
| determiner | determiner | **pantukoy** | 文法用語として確立 |
| dilemma | dilemma | **dilema** | スペイン語綴り Fil 化 |
| duplicate | duplicate | **duplikado** | スペイン語綴り Fil 化 |
| dynamic | dynamic | **dinamiko** | スペイン語綴り Fil 化 |

### カテゴリ C: native 化 (5 語)

| 語 | 現状 fil | 更新後 fil | 根拠 |
|---|---|---|---|
| bookmark | bookmark | **pananda, bookmark** | native + IT loan の複合 |
| carpool | carpool | **sabay-sabay na pagbibiyahe, carpool** | 説明的 native + loan |
| compress (医療) | compress | **pangkumpres** | 医療用 native 語彙 |
| cyberschool | cyberschool | **online na paaralan** | native 表現が自然 |
| dropout | dropout | **tumigil sa pag-aaral** | native 教育用語 |

### カテゴリ A: 現状維持 (38 語、変更なし)

固有名詞 (Olympia)、犬種 (beagle)、楽器 (cello, cornet)、IT/tech (browser, cursor, database, desktop, cyberspace, cybercrime, cyberpet, backup, broadband, antivirus)、医学 (bulimia, chemotherapy, diphtheria)、外来語 (bikini, bourbon, coral, denim, dental, diploma) 等は Fil でもそのまま使う慣例のため現状維持。

## B2-2. 変更内容

```bash
python3 << 'EOF'
import json
wl = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
patch = json.load(open('data/patches/phase2_audit/wordlist_audit_patch.json'))
wl_by_w = {e['w']: e for e in wl}

# Apply Fil-only patches (skip already-applied typo/POS)
skip = {'comprehensive', 'corporal', 'damn'}
n = 0
for p in patch:
    if p['w'] in skip: continue
    if 'gloss' not in p or 'fil' not in p['gloss']: continue
    e = wl_by_w[p['w']]
    e.setdefault('gloss', {})['fil'] = p['gloss']['fil']
    n += 1
    print(f"  {p['w']:20s} → fil={p['gloss']['fil']}")

assert n == 13, f'expected 13 Fil updates, got {n}'
json.dump(wl, open('wordlist_GA_a1a2_plus_phonics.json', 'w'), ensure_ascii=False, indent=1)
print(f'\n{n} entries updated')
EOF
```

## B2-3. 検証

```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
targets = {'anchorperson': 'tagapagbalita', 'barometer': 'barometro',
           'determiner': 'pantukoy', 'dilemma': 'dilema', 'duplicate': 'duplikado',
           'dynamic': 'dinamiko', 'bookmark': 'pananda, bookmark',
           'dropout': 'tumigil sa pag-aaral'}
ok = fail = 0
for w, expected in targets.items():
    for e in d:
        if e['w'] == w:
            actual = e.get('gloss', {}).get('fil')
            if actual == expected:
                ok += 1
                print(f'OK: {w} → {actual}')
            else:
                fail += 1
                print(f'FAIL: {w} → {actual} (expected {expected})')
            break
print(f'\\n{ok} OK, {fail} FAIL')
"
```

**期待:** 全 8 語 OK, 0 FAIL。

## B2-4. コミット

```bash
git add wordlist_GA_a1a2_plus_phonics.json
git commit -m "i18n(fil): apply Opus-proposed Filipino translations for 13 words

Opus Phase 2 audit findings — 51 pass-through Fil glosses reviewed:
- 8 firm changes (natural Fil translation exists: pantukoy, dilema, etc.)
- 5 dual-form (native + loanword: pananda/bookmark, etc.)
- 38 verified keep as-is (loanwords: Olympia, browser, database, etc.)"
```

---

# Phase B3 — 5 バッチファイルを wordlist と同期

## B3-1. 目的

バッチファイル 5 本を、現在の wordlist と同期させる。これにより:
- 将来 batch を再マージしても Phase R / Phase B の修正が失われない
- 「バッチが生成時点で凍結、真実は wordlist」という曖昧な状態を解消
- dignify/dignity + happy-i 68語 + typo/POS/Fil の全修正を batch に反映

## B3-2. 変更内容

各バッチ patch JSON を対応するバッチファイルに適用。

```bash
python3 << 'EOF'
import json

BATCH_MAP = {
    'pilot': 'data/batches/phase2_pilot_180_with_gloss.json',
    'm2a': 'data/batches/phase2_m2a_100_with_gloss.json',
    'm2b': 'data/batches/phase2_m2b_100_with_gloss.json',
    'm2c': 'data/batches/phase2_m2c_100_with_gloss.json',
    'm2d': 'data/batches/phase2_m2d_90_with_gloss.json',
}

total = 0
for label, batch_path in BATCH_MAP.items():
    patch_path = f'data/patches/phase2_audit/phase2_{label}_audit_patch.json'
    entries = json.load(open(batch_path))
    patch = json.load(open(patch_path))
    entries_by_w = {e['w']: e for e in entries}

    n = 0
    for p in patch:
        e = entries_by_w.get(p['w'])
        if not e:
            print(f'WARN: {label} — {p["w"]} not found in batch')
            continue
        # apply top-level fields
        for k, v in p.items():
            if k == 'w': continue
            if k == 'gloss':
                e.setdefault('gloss', {}).update(v)
            else:
                e[k] = v
        n += 1

    json.dump(entries, open(batch_path, 'w'), ensure_ascii=False, indent=2)
    print(f'{label}: {n} entries patched')
    total += n

print(f'\ntotal batch fixes: {total}')
assert total == 86, f'expected 86 total batch fixes, got {total}'
EOF
```

**注意:** `data/batches/phase2_pilot_180_with_gloss.json` などのパスは実際のバッチファイル位置に合わせる。もし別の場所 (例: `data/archive/`) にある場合はパスを調整。

## B3-3. 検証

```bash
# 各バッチとwordlist の全一致確認 (IPA部分だけ)
python3 -c "
import json
wl = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
wl_by_w = {e['w']: e for e in wl}

BATCHES = ['pilot', 'm2a', 'm2b', 'm2c', 'm2d']
files = [f'data/batches/phase2_{b}_' + ('180' if b=='pilot' else '100' if b in ('m2a','m2b','m2c') else '90') + '_with_gloss.json' for b in BATCHES]

diffs = 0
for path in files:
    entries = json.load(open(path))
    for e in entries:
        wl_e = wl_by_w.get(e['w'])
        if not wl_e: continue
        if e.get('ipa') != wl_e.get('ipa'):
            print(f'DIFF ipa: {e[\"w\"]}: batch={e[\"ipa\"]} wl={wl_e.get(\"ipa\")}')
            diffs += 1
        if e.get('rp_ipa') and e.get('rp_ipa') != wl_e.get('rp_ipa'):
            print(f'DIFF rp_ipa: {e[\"w\"]}: batch={e.get(\"rp_ipa\")} wl={wl_e.get(\"rp_ipa\")}')
            diffs += 1
        b_zh = e.get('gloss', {}).get('zh')
        w_zh = wl_e.get('gloss', {}).get('zh')
        if b_zh and w_zh and b_zh != w_zh:
            print(f'DIFF zh: {e[\"w\"]}: batch={b_zh} wl={w_zh}')
            diffs += 1
print(f'\\nresidual IPA/gloss.zh diffs: {diffs}')
"
```

**期待:** `residual IPA/gloss.zh diffs: 0`

## B3-4. コミット

```bash
git add data/batches/phase2_*.json data/patches/phase2_audit/
git commit -m "sync(batches): apply Phase R + Phase B fixes to Phase 2 batch source files

Batches were 'as-generated' snapshots, causing:
- dignify/dignity: rp_ipa vowel drop preserved in batches (fixed in wordlist)
- happy-i 68 words: Phase R2 correction not reflected in batches
- comprehensive/corporal: gloss.zh 的的 typos in batches
- damn: POS 感嘆詞 in batches (i18n uses 間投詞)
- 13 Fil pass-through: Opus-proposed native translations

After this sync, re-merging batches would preserve all downstream fixes.
Total: pilot 3 + m2a 29 + m2b 14 + m2c 22 + m2d 18 = 86 entries."
```

---

# Phase B4 — i18n POS `間投詞` 複合キー対応

## B4-1. 目的

`damn` の POS が `形容詞 / 副詞 / 間投詞` になった。この複合 POS キーが現在の i18n には無いため、6 言語すべてに追加する。

## B4-2. 変更内容

各 `i18n/*.json` の `pos` オブジェクトに新規キーを追加。位置は `形容詞 / 副詞` の直後を推奨 (アルファベット/カナ順は既存の順序に合わせる)。

| 言語 | 追加値 |
|---|---|
| en | `adjective / adverb / interjection` |
| ja | `形容詞 / 副詞 / 間投詞` |
| ko | `형용사 / 부사 / 감탄사` |
| zh-Hans | `形容词 / 副词 / 感叹词` |
| zh-Hant | `形容詞 / 副詞 / 感嘆詞` |
| fil | `pang-uri / pang-abay / pandamdam` |

### 具体的 JSON パッチ

`i18n/en.json` の `pos` オブジェクトに追加:

```diff
   "pos": {
     ...
     "形容詞 / 副詞": "adjective / adverb",
+    "形容詞 / 副詞 / 間投詞": "adjective / adverb / interjection",
     "be動詞": "be verb",
     ...
   }
```

同様に他の 5 言語 (`ja.json`, `ko.json`, `zh-Hans.json`, `zh-Hant.json`, `fil.json`) にも追加。

## B4-3. 検証

```bash
python3 tools/validate_i18n.py
```

**期待:** ERROR 0。キー数が 6 言語すべてで同じに保たれる (前回 157 → 今回 158)。

```bash
# damn を UI で表示できることを確認 (実データ)
python3 -c "
import json
for lang in ['en', 'ja', 'ko', 'zh-Hans', 'zh-Hant', 'fil']:
    d = json.load(open(f'i18n/{lang}.json'))
    v = d.get('pos', {}).get('形容詞 / 副詞 / 間投詞')
    print(f'{lang}: {v!r}')
"
```

**期待:**
```
en: 'adjective / adverb / interjection'
ja: '形容詞 / 副詞 / 間投詞'
ko: '형용사 / 부사 / 감탄사'
zh-Hans: '形容词 / 副词 / 感叹词'
zh-Hant: '形容詞 / 副詞 / 感嘆詞'
fil: 'pang-uri / pang-abay / pandamdam'
```

## B4-4. コミット

```bash
git add i18n/*.json
git commit -m "i18n(pos): add 形容詞 / 副詞 / 間投詞 compound key across 6 languages (for damn)"
```

---

# Phase B5 — 派生データ再生成 + ドキュメント

## B5-1. 目的

wordlist の変更に伴う派生データを再生成し、Phase B の記録を残す。

## B5-2. 実行

```bash
# 1. neighbors 再生成 (gloss/fil 変更は影響しないが hygiene)
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py

# 2. ga_rp_same 再確定 (IPA は変わっていないので統計は変わらないが確認のため)
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json

# 3. GAS 用語彙リスト再エクスポート
python3 scripts/export_batch_words.py

# 4. i18n 検証
python3 tools/validate_i18n.py
```

## B5-3. ドキュメント更新

### (a) `docs/PURPOSE.md` の changelog

```markdown
| 2026-07-XX | v3.24 | パッケージ B (Phase 2 バッチ品質監査): 全 569 語独立 Opus 監査完了。wordlist 波及 typo 2件 (`comprehensive`/`corporal` gloss.zh 的的)、POS 正規化 1件 (`damn` 感嘆詞→間投詞)、Fil 翻訳更新 13件 (Opus 提案)。バッチファイル 86件をwordlistと同期 (dignify/dignity + happy-i 68語 + typo/POS/Fil)。i18n 複合 POS キー追加。 |
```

### (b) `docs/REPOSITORY-STRUCTURE.md` に追記

`data/patches/` セクションに:

```markdown
| `data/patches/phase2_audit/` | Phase B (Package B) 監査で発見した wordlist / batch fixes のパッチ源 |
```

### (c) 監査レポート `docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md` 新規作成

以下テンプレートで:

```markdown
# Cursor 実装レポート — Phase B (Phase 2 バッチ品質監査)

- 実施日: 2026-07-XX
- 指示書: `docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md`
- ブランチ: `fix/phase-b-batch-quality-audit`
- Opus 監査サマリ: 569 語独立監査、新規 IPA bug 0件、gloss typo 2件、POS 1件、Fil 13件

## 1. 実施内容

### B1: wordlist gloss.zh 的的 + POS
- comprehensive: gloss.zh 全面的的 → 全面的
- corporal: gloss.zh 身体的的 → 身体的
- damn: POS 感嘆詞 → 間投詞

### B2: wordlist Fil 翻訳 13 語
- 8 firm changes: anchorperson, antibacterial, barometer, broadcaster, determiner, dilemma, duplicate, dynamic
- 5 dual-form: bookmark, carpool, compress, cyberschool, dropout

### B3: バッチ同期 86 語
(内訳を貼る)

### B4: i18n 複合 POS キー
- 形容詞 / 副詞 / 間投詞 (× 6 言語)

## 2. 検証結果

- validate_i18n.py: OK (158 キー × 6 言語)
- residual 的的 in wordlist: 0
- residual IPA batch↔wordlist diffs: 0

## 3. commit 一覧

(git log --oneline main..HEAD)

## 4. 変更ファイル

(list)

## 5. スコープ外 (今回対応せず)

- gloss.ja / gloss.zh / gloss.ko の意訳品質細部 (系統サンプルでは異常なし)
- POS 未使用複合パターン (例: 副詞 / 名詞 は 4件のみ既存)
- Fil カテゴリ A (38 語) の英語 pass-through は「正当な借用語」判定で維持
```

## B5-4. コミット

```bash
git add docs/PURPOSE.md docs/REPOSITORY-STRUCTURE.md \
        docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md \
        docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md \
        data/derived/wordlist_with_neighbors.json \
        data/derived/wordlist_with_neighbors_slim.json \
        data/pipeline/ga_rp_same_report.json \
        docs/reference/neighbors_report.md \
        gas/BatchWords.gs \
        wordlist_GA_a1a2_plus_phonics.json
git commit -m "docs(phase-b): update changelog, add implementation report, regenerate derived data"
```

## B5-5. マージ

```bash
git checkout main
git merge --no-ff fix/phase-b-batch-quality-audit
git push origin main
```

---

## テスト項目（Phase 全体）

| # | 項目 | 期待 |
|---|---|---|
| 1 | wordlist に `全面的的` `身体的的` が残っていない | ✓ 0 件 |
| 2 | `comprehensive` `corporal` の gloss.zh が正しい | ✓ 全面的 / 身体的 |
| 3 | `damn` の POS が `形容詞 / 副詞 / 間投詞` | ✓ |
| 4 | i18n 6 言語すべてに `形容詞 / 副詞 / 間投詞` キー | ✓ |
| 5 | `validate_i18n.py` ERROR 0 | ✓ |
| 6 | `anchorperson` fil = `tagapagbalita` | ✓ |
| 7 | `determiner` fil = `pantukoy` | ✓ |
| 8 | バッチ↔wordlist の IPA/rp_ipa/gloss.zh 差分 0 | ✓ |
| 9 | バッチの `dignify` rp_ipa = `/ˈdɪɡnəˌfaɪ/` (母音復元) | ✓ |
| 10 | バッチの happy-i 語 (M2a-d) の rp_ipa 末尾 `-i` (`-iː` から修正) | ✓ 68語 |
| 11 | `Olympia`, `browser`, `database` 等 38語 fil は pass-through 維持 | ✓ (現状維持) |
| 12 | 実機で `damn` を表示、POS ラベルが崩れない | ✓ |
| 13 | 実機で `comprehensive` を Chinese UI で表示、gloss.zh が正しい | ✓ |

---

## Q&A（Cursor 実装時の想定質問）

### Q1: バッチファイルのパスが `data/batches/` にない場合は？

**A:** `find . -name "phase2_*.json"` で検索。 `docs/REPOSITORY-STRUCTURE.md` によると `data/batches/` に配置されているはず。もし別の場所にあれば実際のパスに合わせて B3 の script を調整。

### Q2: `wordlist_audit_patch.json` に 16 エントリあるが、B1 で 3、B2 で 13 と分けている。まとめて処理してよいか？

**A:** 分けたほうがコミット粒度が明確 (bugfix と i18n 改善を分離)。ただし作業を短縮したい場合は一括処理も可。その場合コミットメッセージは要約する。

### Q3: `pilot` バッチには `rp_ipa` が無いのに B3 のパッチで rp_ipa 差分は 0 と出るか？

**A:** pilot は `rp_ipa` フィールドを持たないため patch には rp_ipa の差分がゼロで生成されている。実際 `phase2_pilot_audit_patch.json` は 3 エントリのみ (POS 1 + Fil 2) で、rp_ipa 修正は含まない。

### Q4: Fil 翻訳の妥当性は誰が保証するか？

**A:** これは Opus (Claude) の提案。Fil ネイティブスピーカーではないため 100% の保証はできない。ただし以下の根拠に基づく:
- スペイン語綴り慣例 (dilema, duplikado, dinamiko, barometro, antibakteryal) は Filipino の一般的な音写ルール
- native 表現 (tagapagbalita, tagapamahayag, pantukoy) は Fil 教育・報道で標準的
- カテゴリ A の 38 語は「Fil でも英語綴りをそのまま使う慣例が確立している語」

もし Fil 学習者/ネイティブから訂正提案があれば、追加パッチとして反映。

### Q5: バッチと wordlist の同期後、将来 batch を再マージすることはあるか？

**A:** 通常無い。ただし B3 完了によって、万一 re-merge が発生しても Phase R/B の下流修正が失われない。「バッチ = 生成時点で凍結」の暗黙ルールが「バッチ = 常に wordlist と同期」に変わる。

### Q6: `i18n/*.json` に POS キーを追加する順序は？

**A:** 既存キーの順序を尊重して、`形容詞 / 副詞` の直後に配置。JSON はキー順序が意味を持たないが、diff の可読性のため。

### Q7: `data/patches/phase2_audit/` を残すか削除するか？

**A:** 残す。将来的な監査履歴の証拠として `docs/REPOSITORY-STRUCTURE.md` に記載 (patches/ カテゴリ)。

### Q8: `damn` の POS 変更で他のロジックに影響は？

**A:** wordlist の POS 集合 (`gen_ga_rp_same.py` の `ALLOWED_POS` 等) は既に `damn` の POS を許容している (Phase R で `damn` は問題なく処理された)。`感嘆詞` → `間投詞` は文字列変更のみで、フィルタ・分類・IPA 処理に影響なし。**唯一の影響は UI 上の POS ラベル表示**で、i18n 対応 (B4) で解決。

### Q9: `pilot` バッチの `rp_ipa` は依然として無い。バッチ側で `rp_ipa` を追加すべきか？

**A:** 今回はしない。pilot は M2 前の「rp_ipa 別工程」時代の形式。バッチファイルは「生成時の姿を保持」しつつ、B3 の同期は「既存フィールドを wordlist と一致させる」だけ。pilot に新規 `rp_ipa` を注入する必要はない (wordlist 側で完備済み)。

### Q10: Phase B 完了後に BatchWarm.gs を再走行させる必要は？

**A:** 不要。今回の修正 (gloss.zh 的的, Fil, POS) は TTS 音声には影響しない。IPA も変わっていない (バッチ→wordlist 同期のみ)。`BatchWords.gs` の再生成 (`export_batch_words.py`) は wordlist 変更に対する hygiene で走らせるが、音声 warm 自体は不要。

---

## スコープ外 (明示的にやらないこと)

- **Fil カテゴリ A (38 語) の翻訳変更** — Opus 判定で「正当な借用語」なので現状維持
- **他 CEFR (A1/A2/B1) の gloss.zh 的的 系統スキャン** — 全 wordlist 走査済み、他に該当なし (`comprehensive`, `corporal` のみ)
- **他バッチ (Phase 1 M1-M5) の再監査** — 別タスク。Phase R2 の happy-i 修正で下流影響は既に押さえられている
- **gloss.ja / gloss.ko の翻訳精度追加検証** — 系統サンプルで異常検出なし
- **Fil translation の native speaker レビュー** — 将来別タスク
- **新規語彙の追加** — 監査は既存 569 語の品質改善のみ

---

## 変更ファイル一覧

**新規:**
- `data/patches/phase2_audit/phase2_pilot_audit_patch.json`
- `data/patches/phase2_audit/phase2_m2a_audit_patch.json`
- `data/patches/phase2_audit/phase2_m2b_audit_patch.json`
- `data/patches/phase2_audit/phase2_m2c_audit_patch.json`
- `data/patches/phase2_audit/phase2_m2d_audit_patch.json`
- `data/patches/phase2_audit/wordlist_audit_patch.json`
- `docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md`
- `docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md`

**変更:**
- `wordlist_GA_a1a2_plus_phonics.json` (16 語)
- `data/batches/phase2_pilot_180_with_gloss.json` (3 語)
- `data/batches/phase2_m2a_100_with_gloss.json` (29 語)
- `data/batches/phase2_m2b_100_with_gloss.json` (14 語)
- `data/batches/phase2_m2c_100_with_gloss.json` (22 語)
- `data/batches/phase2_m2d_90_with_gloss.json` (18 語)
- `i18n/en.json`, `ja.json`, `ko.json`, `zh-Hans.json`, `zh-Hant.json`, `fil.json`
- `data/derived/wordlist_with_neighbors.json` (再生成)
- `data/derived/wordlist_with_neighbors_slim.json` (再生成)
- `data/pipeline/ga_rp_same_report.json` (再生成)
- `docs/reference/neighbors_report.md` (再生成)
- `docs/PURPOSE.md` (changelog)
- `docs/REPOSITORY-STRUCTURE.md`
- `gas/BatchWords.gs` (再エクスポート)

---

## Opus 監査の透明性 (方法論の記録)

以下の検査を全 569 語に対して系統的に実施済み (人手サンプルは不要と判定):

### IPA/rp_ipa 系検査
- ASCII/IPA 文字混同 (g/ɡ, :/ː, '/ˈ, ,/ˌ, curly apostrophes)
- 母音脱字検出 (batch vs wordlist の母音文字数差分)
- 子音連続過多 (>=4)
- 強勢マーク欠落 (多音節語)
- スラッシュ包み確認
- 空・不正フォーマット

### gloss 系検査
- gloss.en 空/w との一致
- gloss.ja 日本語文字含有 (略語例外)
- gloss.zh CJK 含有・繁体字混入・**doubled 的検出**
- gloss.ko Hangul 含有・動詞語尾 다
- gloss.fil 英語 pass-through 検出
- 全 5 言語の空チェック

### スキーマ検査
- CEFR = B2 全語
- POS 許容集合 (A1-B2 wordlist より導出)
- 必須フィールド有無

### def 検査
- 空・長すぎ (>=20 words)
- 未完了文 (末尾ピリオド無し)
- 空白異常 (leading/trailing/double space)

### 横断検査
- バッチ間重複
- バッチと wordlist の差分分類 (happy_i / iota / vowel_drop / other)

**発見された全ての findings は上記の分類に該当**。手動サンプル 50 語 (各バッチ 10 語: 先頭 3 + 中央 4 + 末尾 3) を精査したが、systemic bug は上記以外に検出されず。

**未検出だが理論的にあり得る**: 意味的 mistranslation, 意訳スタイルの不統一, 発音レジスタの誤り (formal vs casual). これらは native speaker review でのみ検出可能で、本 Opus 監査のスコープ外。
