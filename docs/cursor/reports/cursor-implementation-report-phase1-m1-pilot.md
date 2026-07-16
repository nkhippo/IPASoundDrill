---
id: pj-2026-07-07-01d3
aliases:
- pj-2026-07-07-01d3
title: Phase 1 M1 パイロット実装レポート
created: '2026-07-07'
---

# Phase 1 M1 パイロット実装レポート

- 実施日: 2026-07-07
- 指示書: `docs/combined-instructions-phase1-pilot-and-misc.md`（セクション A）
- ブランチ: `main`

## 1. 実施概要

CEFR-J B1 拡充対象 1,769 語のうち先頭 180 語（アルファベット順）を `phase1_pilot_180.json` から `wordlist_GA_a1a2_plus_phonics.json` にマージした。続けて narrow IPA（`ipa_actual_ga`）と respelling（`respell_ga` / `respell_rp`）を既存スクリプトで生成・反映した。

セクション B（GAS 再デプロイ）・C（fil.json 所見）は Naoya 向けのため Cursor では未実施。

## 2. マージ結果

```
新規追加: 180語
スキップ(既存と重複): 0語 []
マージ後総語数: 3239
```

- `_generation_source` はマージ時に全件削除済み
- `gloss.ja/zh/ko/fil` は `null` のまま（指示通り）
- `neighbors` は空配列のまま

## 3. narrow IPA / respelling 生成

実行コマンド:

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
```

`generate_flap_ipa.py` はリポジトリに未同梱だったため、過去 Phase 2a 添付版を `scripts/generate_flap_ipa.py` として追加して実行。

### 3-1. `generate_flap_ipa.py` 結果（全語彙再スキャン）

```
Auto-generated candidates (R1/R2/R3): 208
Flagged for review (R4 VntV etc.):    58
  R1: 152
  R2: 13
  R3: 43
merged 208 / 208 entries
```

**パイロット 180 語の内訳:**

| 区分 | 語数 |
|---|---:|
| `ipa_actual_ga` 自動生成（flap 候補） | 22 |
| R4 レビュー対象（`phase2a_review_needed.json`） | 6 |
| respelling 生成済み | 174 |
| respelling pending（R4 等） | 6 |

パイロット R4 レビュー対象 6 語: `bandage`, `atlantic`, `antonym`, `agenda`, `anti`, `accidentally`

### 3-2. `generate_respelling.py` 結果

```
Total words:            3239
Confirmed (drafted):    3181
Pending TTS review:     58
Exceptions:             0
merged 3181 / 3181 entries
```

### 3-3. 既存語への影響と復元

`merge_respelling.py` のデフォルト動作（pending 語の respell クリア）により、既存 VntV pending 52 語の `respell_ga`/`respell_rp` が一時的に消えたため、**パイロット 180 語を除く既存語**について HEAD 版から respelling を復元した（104 フィールド）。

確認例:

| 語 | respell_ga | ipa_actual_ga |
|---|---|---|
| `winter` | `WIN-ter`（復元） | `None`（変更なし） |
| `granddaughter` | `GRAN-daw-der`（復元） | `/ˈɡrænˌdɔɾɚ/` |
| `abandon`（新規） | `uh-BAN-dn` | `/əˈbændn̩/` |
| `accidentally`（新規・pending） | `None` | `None` |

## 4. 検証結果

```
総語数: 3239
CEFR分布: {'A1': 1187, 'A2': 1195, 'B1': 527, 'B2': 330}
```

サンプル 4 語:

```
abandon -> ipa=/əˈbændən/, respell_ga=uh-BAN-dn, ipa_actual_ga=/əˈbændn̩/
adverb -> ipa=/ˈædˌvɝb/, respell_ga=AD-vurb, ipa_actual_ga=None
babysitter -> ipa=/ˈbeɪbiˌsɪtɚ/, respell_ga=BAY-bee-si-der, ipa_actual_ga=/ˈbeɪbiˌsɪɾɚ/
biochemistry -> ipa=/ˌbaɪoʊˈkɛməstri/, respell_ga=by-oh-KEH-muh-stree, ipa_actual_ga=None
```

`B1=527`（347+180）を確認。

## 5. ドキュメント更新

- `docs/PURPOSE.md`
  - B1 語数を 527 に更新
  - 変更履歴 v3.5 を追加
- `docs/combined-instructions-phase1-pilot-and-misc.md`（指示書コピー）

## 6. 変更ファイル

- `wordlist_GA_a1a2_plus_phonics.json`（+180 語、flap/respell 反映）
- `phase1_pilot_180.json`（ソースデータ）
- `scripts/generate_flap_ipa.py`（新規追加）
- `phase2a_flap_candidates.json`, `phase2a_review_needed.json`
- `phase2b_respell_draft.json`, `phase2b_respell_pending.json`
- `docs/PURPOSE.md`, 本レポート

## 7. git status（コミット対象前）

```
M  wordlist_GA_a1a2_plus_phonics.json
M  phase2a_flap_candidates.json
M  phase2a_review_needed.json
M  phase2b_respell_draft.json
M  phase2b_respell_pending.json
M  docs/PURPOSE.md
A  phase1_pilot_180.json
A  scripts/generate_flap_ipa.py
A  docs/combined-instructions-phase1-pilot-and-misc.md
A  docs/cursor-implementation-report-phase1-m1-pilot.md
```

## 8. 既知の残作業・懸念

1. パイロット 180 語の `gloss` 多言語翻訳（Opus 別セッション予定）
2. `neighbors` 再計算（項目#6）
3. パイロット R4 対象 6 語の TTS レビュー（narrow IPA / respelling pending）
4. GAS 再デプロイ（セクション B、Naoya 手動）
5. `fil.json` 4 件の en 同一値は意図的借用語の可能性が高く、現状維持で問題なし（セクション C）
