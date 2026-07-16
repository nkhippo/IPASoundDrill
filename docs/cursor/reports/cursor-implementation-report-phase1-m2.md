---
id: pj-2026-07-08-5e64
aliases:
- pj-2026-07-08-5e64
title: Phase 1 M2 実装レポート
created: '2026-07-08'
---

# Phase 1 M2 実装レポート

- 実施日: 2026-07-08
- 指示書: `docs/cursor-instructions-phase1-m2.md`
- ブランチ: `main`

## 1. 実施概要

CEFR-J B1 拡充の第2バッチ 400 語（`biography`〜`enrich`）を、IPA・pos・def・gloss（5言語）完成済みの状態で `wordlist_GA_a1a2_plus_phonics.json` にマージした。続けて narrow IPA（`ipa_actual_ga`）と respelling（`respell_ga` / `respell_rp`）を既存スクリプトで生成・反映した。

## 2. マージ結果

```
新規追加: 400語
スキップ(既存と重複): 0語 []
マージ後総語数: 3639
```

- `_generation_source` はマージ時に全件削除済み
- `neighbors` は空配列のまま
- gloss（en/ja/zh/ko/fil）は提供データどおり完成済み

## 3. narrow IPA / respelling 生成

実行コマンド:

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
```

### 3-1. 全語彙再スキャン結果

```
Auto-generated candidates (R1/R2/R3): 263
Flagged for review (R4 VntV etc.):    66
  R1: 192
  R2: 17
  R3: 54
merged 263 / 263 entries

Total words:            3639
Confirmed (drafted):    3573
Pending TTS review:     66
Exceptions:             0
```

### 3-2. M2 400語の内訳

| 区分 | 語数 |
|---|---:|
| `ipa_actual_ga` 自動生成（flap 候補） | 55 |
| R4 レビュー対象 | 8 |
| `respell_ga` / `respell_rp` 生成済み | 392 |
| respelling pending（R4） | 8 |
| gloss 5言語完成 | 400 |

M2 R4 レビュー対象 8 語: `certainty`, `conduct`, `content`, `counter`, `county`, `defender`, `documentary`, `encounter`

## 4. 既存語への影響確認（M1教訓対応）

`merge_respelling.py` のデフォルト動作により、既存 VntV pending 52 語の `respell_ga`/`respell_rp` が一時クリアされた（104 フィールド）。

対応:
- M2 400語以外の既存語について、HEAD 版から respelling を復元（104 フィールド）
- 復元後、既存サンプル（`abandon` / `book` / `winter`）の gloss・respell が保持されていることを確認

## 5. 検証結果

```
総語数: 3639
CEFR分布: {'A1': 1187, 'A2': 1195, 'B1': 927, 'B2': 330}
```

サンプル（新規）:

| 語 | ipa | respell_ga | gloss.ja |
|---|---|---|---|
| `biography` | `/baɪˈɑɡrəfi/` | `by-AH-gruh-fee` | `伝記` |
| `ecosystem` | `/ˈikoʊˌsɪstəm/` | `EE-koh-si-stuhm` | `生態系` |
| `enrich` | `/ɪnˈrɪtʃ/` | `in-RICH` | `豊かにする` |

既存確認:

| 語 | gloss.ja | respell_ga |
|---|---|---|
| `abandon` | `見捨てる、放棄する` | `uh-BAN-dn` |
| `book` | `本、予約する、記帳する` | `BUUK` |
| `winter` | `冬` | `WIN-ter` |

`B1=927`（527+400）を確認。

## 6. ドキュメント更新

- `docs/PURPOSE.md`
  - B1: 927語（M1 180 + M2 400）に更新
  - gloss 合計 3,639語に更新
  - 変更履歴 v3.7 を追加
- `docs/cursor-instructions-phase1-m2.md`（指示書コピー）

## 7. 変更ファイル

- `wordlist_GA_a1a2_plus_phonics.json`（+400語、flap/respell 反映）
- `phase1_m2_400_with_gloss.json`（ソースデータ）
- `phase2a_flap_candidates.json`, `phase2a_review_needed.json`
- `phase2b_respell_draft.json`, `phase2b_respell_pending.json`
- `docs/PURPOSE.md`, 本レポート

## 8. 既知の残作業・懸念

1. Phase 1 M3: 残り B1 1,189 語
2. `neighbors` 再計算（項目#6）
3. M2 R4 対象 8 語の TTS レビュー（narrow IPA / respelling pending）
4. `merge_respelling.py` の pending クリア挙動は今後も同様に復元が必要なため、将来的な改善候補
