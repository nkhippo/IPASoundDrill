---
id: pj-2026-07-10-183d
aliases:
- pj-2026-07-10-183d
title: Cursor 実装レポート — Phase R (RP パイプライン品質修正)
created: '2026-07-10'
---

# Cursor 実装レポート — Phase R (RP パイプライン品質修正)

- 実施日: 2026-07-10
- 指示書: `docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md`
- ブランチ: `fix/phase-r-rp-pipeline-repair` → `main` にマージ済み
- GitHub Pages: https://nkhippo.github.io/IPASoundDrill/

## 1. 実施内容

### Phase R1: 分類器 dead-code 修正
- `cot_caught`: 基点を `ga_lot` → `ga_goat` に変更（LOT 置換前の `ɑ` を利用）
- `square_near_cure`: `RHOTICITY_MAP` から `ɛr`/`ɪr`/`ʊr` を除去し、判定を rhoticity より前に移動
- `composite_structural v2`: BATH + 第1音節弱化（`advantage` 型）対応

### Phase R2: RP 生成プロンプト修正 + データ是正
- `gen_rp_ipa.py` SYSTEM_PROMPT に happY 例外ルールと `-ee` 例外を明示
- `fix_happy_i.py` 新規作成・実行
- rp_ipa **91語**を修正（`happy_i_over_lengthened` 82 + `jones_notation_drift` 9）

### Phase R3: `ga_to_rp.py` latent bug 修正 + 語彙リスト統一
- `phonology_lexicon.py` 新規作成（`BATH_WORDS_BASE`, `is_bath_word()`, `PALM_WORDS`, `YOD_CORONALS`）
- `ga_to_rp.py`: PALM guard、yod-insertion、happY/i・u 短母音ガード（単音節語は長母音を維持）
- `gen_ga_rp_same.py`: `is_bath_word()` に切替（本番 wordlist のフラグ分布は実質不変）

### Phase R4: 派生データ再生成
- `gen_neighbors.py` + `merge_neighbors.py` 再実行
- `gen_ga_rp_same.py` + `export_batch_words.py` 再実行
- `docs/PURPOSE.md` v3.21、`docs/REPOSITORY-STRUCTURE.md` 更新

## 2. Diff 検証結果

```
rp_ipa changed: 91  (expected ~91)
ga_rp_same flag flipped True->False: 0  (expected 0)
ga_rp_same flag flipped False->True: 5
ga_rp_same_reason changed: 164
```

**`ga_rp_same` フラグ集計（Phase R 前 → 後）**

| 指標 | 前 | 後 |
|------|---:|---:|
| True | 2,669 | **2,674** (+5) |
| False | 2,728 | **2,723** (-5) |

**reason 分布の主な変化**

| reason | 前 | 後 | Δ |
|--------|---:|---:|--:|
| rhoticity | 798 | 691 | -107 |
| square_near_cure | 0 | 105 | +105 |
| cot_caught | 0 | 11 | +11 |
| composite_structural | 0 | 1 | +1 |
| identical | 1,508 | 1,527 | +19 |
| length_marking_only | 574 | 558 | -16 |
| structural_other | 630 | 615 | -15 |

False→True の 5語は happY `/ɪ/`→`/i/` 修正により GA と RP が一致した正当な変化（`factory`, `family`, `february`, `fifty`, `funny`）。

## 3. サンプル検証

| 語 | rp_ipa | reason | 結果 |
|----|--------|--------|------|
| bear | `/beə/` | square_near_cure | OK |
| dear | `/dɪə/` | square_near_cure | OK |
| advantage | `/ədˈvɑːntɪdʒ/` | composite_structural | OK |
| city | `/ˈsɪti/` | ga_allophony | OK（happY 短 /i/） |
| family | `/ˈfæməli/` | identical | OK |
| happy | `/ˈhæpi/` | identical | OK |
| employee | `/emˈplɔɪiː/` | notation_composite | OK（-ee 保持） |
| factory | `/ˈfæktəri/` | rhotic_vowel_notation | OK（/ɪ/→/i/） |

**注記:** `advancement` は GA 主重音位置が RP と異なる（`/ædˈvænsmənt/` vs `/ədvˈɑːnsmənt/`）ため `composite_structural` には到達せず `structural_other` のまま。`poor` は本番 GA が `/pur/`（`/pʊr/` ではない）のため `square_near_cure` ではなく `structural_other`。

**`ga_to_rp.py` unit tests:** 14/14 passed（`father`, `palm`, `new`, `very`, `asking` 等）

## 4. 各 phase の commit 一覧

```
c7591f9 refactor(phonology): unify BATH_WORDS + fix ga_to_rp.py latent bugs (PALM, happY, yod)
fdd9c24 fix(data): correct happY /i/ over-lengthening (82 words) + /ɪ/ notation drift (9 words)
2845560 fix(classifier): activate cot_caught/square_near_cure dead branches + BATH+weak composite
662761a docs(phase-r): update changelog, repository structure, implementation report
```

## 5. テスト項目チェックリスト

| # | 項目 | 結果 |
|---|------|------|
| 1 | `ga_rp_same=True` が Phase R2 前比で微増 | ✓ 2669→2674 |
| 2 | `cot_caught` / `square_near_cure` reason が発火 | ✓ 11 / 105 |
| 3 | `bear`, `dear` → `square_near_cure` | ✓ |
| 4 | `advantage` → `composite_structural` | ✓（`advancement` は stress 差で未達） |
| 5 | `city`, `family`, `happy` の happY `/i/` | ✓ |
| 6 | `employee`, `chimpanzee`, `carefree` は `/iː/` 保持 | ✓ |
| 7 | `factory`, `friday` 末尾 `/i/` | ✓ |
| 8 | `ga_to_rp('father')` → `/ˈfɑːðə/` | ✓ |
| 9 | `ga_to_rp('new')` → `/njuː/` | ✓ |
| 10 | `ga_to_rp('very')` → `/ˈveri/` | ✓ |
| 11 | neighbors zero 率 ±1% 以内 | ✓ 5% 維持 |

## 6. 変更ファイル一覧

| 種別 | ファイル |
|------|----------|
| 新規 | `scripts/fix_happy_i.py`, `scripts/phonology_lexicon.py` |
| 修正 | `scripts/gen_ga_rp_same.py`, `scripts/gen_rp_ipa.py`, `scripts/ga_to_rp.py` |
| データ | `wordlist_GA_a1a2_plus_phonics.json`, `data/pipeline/ga_rp_same_report.json`, `data/derived/wordlist_with_neighbors*.json` |
| ドキュメント | `docs/PURPOSE.md`, `docs/REPOSITORY-STRUCTURE.md`, 本レポート, 指示書コピー |
