---
id: pj-2026-07-09-f36b
aliases:
- pj-2026-07-09-f36b
title: '`ga_rp_same` フラグ導入 — 実装レポート'
created: '2026-07-09'
---

# `ga_rp_same` フラグ導入 — 実装レポート

- 実施日: 2026-07-09
- 指示書: `/Users/naoya.k/Downloads/files 51/cursor-instructions-ga-rp-same-flag.md`
- 参照設計: `docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md`
- ブランチ: `main`

## 1. 実施概要

GA/RP が学習者にとって実質同じかを、ルールベース分類器 `scripts/gen_ga_rp_same.py` で事前フラグ化し、Reveal 画面・語彙ブラウザの「同じ」表示判定を `c.ga_rp_same` 参照に切り替えた。

## 2. `gen_ga_rp_same.py --dry-run` 出力

```
wordlist_GA_a1a2_plus_phonics.json: 4828 items — 2378 same, 2450 different
  [SAME] identical                  1416
  [DIFF] rhoticity                   717
  [DIFF] structural_other            646
  [SAME] length_marking_only         496
  [DIFF] ga_allophony                434
  [SAME] dress_notation_only         377
  [DIFF] goat_vowel                  258
  [DIFF] lot_vowel                   201
  [DIFF] weak_vowel                   96
  [DIFF] trap_bath                    71
  [SAME] notation_composite           54
  [SAME] stress_marking_only          35
  [DIFF] yod                          21
  [DIFF] stress_placement              6

data/connected_speech.json: 201 items — 94 same, 107 different
  [DIFF] structural_other             62
  [SAME] identical                    48
  [SAME] dress_notation_only          27
  [DIFF] goat_vowel                   17
  [SAME] length_marking_only          16
  [DIFF] rhoticity                    14
  [DIFF] lot_vowel                    10
  [DIFF] trap_bath                     4
  [SAME] notation_composite            3

data/weak_forms.json: 36 items — 30 same, 6 different
  [SAME] identical                    29
  [DIFF] rhoticity                     6
  [SAME] length_marking_only           1
```

指示書の期待分布と一致。

## 3. 28 語テストケース結果

**28/28 PASS**

| 語 | 期待 | 実際 reason | 結果 |
|---|---|---|---|
| about, agree, A, address, magazine, nineteen, july, cassette | same | identical / length_marking_only / dress_notation_only / notation_composite / stress_marking_only | PASS |
| car, path, bath, Z, z | different | rhoticity / trap_bath / structural_other | PASS |
| city, water, butter, body | different (`ga_allophony`) | ga_allophony | PASS |
| baseball | different (`stress_placement`) | stress_placement | PASS |
| boat, hot, also | different | goat_vowel / lot_vowel | PASS |
| new, due, tune | different (`yod`) | yod | PASS |
| bear | different (`rhoticity`) | rhoticity | PASS |
| bought, family, after | different | structural_other / trap_bath | PASS |

★ `city` は phonemic `/ˈsɪti/` が GA/RP で一致するが、`ipa_actual_ga=/ˈsɪɾi/` により `ga_allophony` → different と正しく分類。

## 4. UI 変更後の表示確認（ロジック検証）

`ga_rp_same` フラグに基づく RP 行表示シミュレーション:

| 語 | `ga_rp_same` | RP 行表示 |
|---|---|---|
| `agree` | true | `/əˈɡriː/（同じ）` |
| `city` | false | `/ˈsɪti/`（same 表示なし） |
| `boat` | false | `/bəʊt/`（same 表示なし） |
| `about` | true | `/əˈbaʊt/（同じ）` |

`index.html` 変更箇所:
- `altAccentValue()` — `c.ga_rp_same` 参照（未設定時は文字列一致フォールバック）
- `renderVocabWords()` / `renderVocabPhrases()` — 同上（2 箇所）

## 5. 変更ファイル一覧

| ファイル | 変更内容 |
|---|---|
| `scripts/gen_ga_rp_same.py` | 新規 — ルールベース分類器 |
| `wordlist_GA_a1a2_plus_phonics.json` | 4,828 語に `ga_rp_same` / `ga_rp_same_reason` 付与 |
| `data/connected_speech.json` | 201 句に同フィールド付与 |
| `data/weak_forms.json` | 36 語に同フィールド付与 |
| `data/pipeline/ga_rp_same_report.json` | 分布レポート |
| `index.html` | UI 判定をフラグ参照に切替 |
| `docs/SPECIFICATION.md` | §5.1 に `ga_rp_same` 仕様追記（v3.15） |
| `docs/REPOSITORY-STRUCTURE.md` | 同一表示判定の記述更新 |

## 6. 未対応事項

1. **`structural_other` (646 語)** — 本タスクでは人手再分類なし（指示書 Q1 通り）
2. **`ga_rp_same_reason` の UI 表示** — なし（監査用データ層のみ）
3. **GAS TTS 側** — フラグ参照不要（UI 表示専用）
4. **`docs/DESIGN.md` / `docs/reference/report-alt-accent-display.md`** — 旧「文字列一致」記述が残存（軽微。必要なら別途同期）

## 7. 再生成手順

```bash
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
```

`ipa` / `rp_ipa` / `ipa_actual_ga` を変更した際は上記を再実行してコミット。
