---
id: pj-2026-07-09-be57
aliases:
- pj-2026-07-09-be57
title: Phase 1 M4 実装レポート
created: '2026-07-09'
---

# Phase 1 M4 実装レポート

- 実施日: 2026-07-09
- 指示書: `docs/cursor-instructions-phase1-m4.md`
- ブランチ: `main`

## 1. 実施概要

CEFR-J B1 拡充の第4バッチ 400 語（`marked`〜`restore`）を、IPA・pos・def・gloss（5言語）完成済みの状態で `wordlist_GA_a1a2_plus_phonics.json` にマージした。続けて narrow IPA（`ipa_actual_ga`）と respelling（`respell_ga` / `respell_rp`）を既存スクリプトで生成・反映した。

## 2. マージ結果

```
新規追加: 400語
スキップ(既存と重複): 0語 []
マージ後総語数: 4439
```

- `_generation_source` はマージ時に全件削除済み
- `neighbors` は空配列のまま
- gloss（en/ja/zh/ko/fil）は提供データどおり完成済み
- 指示書記載の品質検証（GA IPA への `ː` 混入ゼロ等）はソースデータ側で確認済み

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
Auto-generated candidates (R1/R2/R3): 391
Flagged for review (R4 VntV etc.):    96
  R1: 297
  R2: 26
  R3: 68
merged 391 / 391 entries

Total words:            4439
Confirmed (drafted):    4343
Pending TTS review:     96
Exceptions:             0
merged 4343 / 4343 entries
```

### 3-2. M4 400語の内訳

| 区分 | 語数 |
|---|---:|
| `ipa_actual_ga` 自動生成（flap 候補） | 64 |
| R4 レビュー対象（respell pending） | 8 |
| `respell_ga` / `respell_rp` 生成済み | 392 |
| respelling 例外 | 0 |
| gloss 5言語完成 | 400 |

M4 R4 レビュー対象 8語: `mentally`, `misunderstanding`, `mountaintop`, `outstanding`, `phantom`, `quantity`, `remainder`, `representative`

## 4. 既存語への影響確認

`merge_respelling.py` 恒久修正の効果により、手動 respell 復元は**不要**だった。

- HEAD で respell を持っていた VntV pending 52語: **52/52 保持**
- 既存サンプル `abandon` / `biography` / `entertain` の gloss・respell: **変更なし**（`entertain` は引き続き R4 pending で respell 未付与）

## 5. 検証結果

```
総語数: 4439
CEFR分布: {'A1': 1187, 'A2': 1195, 'B1': 1727, 'B2': 330}
```

`B1=1727`（1327+400）を確認。

サンプル（新規）:

| 語 | ipa | respell_ga | gloss.ja |
|---|---|---|---|
| `marked` | `/ˈmɑrkt/` | `MARKT` | `顕著な、はっきりした` |
| `rainforest` | `/ˈreɪnˌfɔrəst/` | `RAYN-faw-ruhst` | `熱帯雨林` |
| `restore` | `/rɪˈstɔr/` | `ri-STOR` | `回復させる、修復する` |

既存確認:

| 語 | gloss.ja | respell_ga |
|---|---|---|
| `abandon` | `見捨てる、放棄する` | `uh-BAN-dn` |
| `biography` | `伝記` | `by-AH-gruh-fee` |
| `entertain` | `楽しませる、もてなす` | （R4 pending・未付与） |

## 6. ドキュメント更新

- `docs/PURPOSE.md` — B1: 1,727語、gloss 合計 4,439語、変更履歴 v3.10
- `docs/cursor-instructions-phase1-m4.md`（指示書コピー）

## 7. 変更ファイル

- `wordlist_GA_a1a2_plus_phonics.json`（+400語、flap/respell 反映）
- `phase1_m4_400_with_gloss.json`（ソースデータ）
- `phase2a_flap_candidates.json`, `phase2a_review_needed.json`
- `phase2b_respell_draft.json`, `phase2b_respell_pending.json`, `phase2b_respell_exceptions.json`
- `docs/PURPOSE.md`、本レポート

## 8. 既知の残作業・懸念

1. Phase 1 M5: B1 残り **389** 語（789 − 400）で CEFR-J B1 拡充分が完了見込み
2. `neighbors` 再計算（項目#6）
3. R4 pending 96語（うち M4 新規 8語）の TTS レビュー・narrow IPA 確定
4. GAS `BatchWords.gs` は 3,059語のまま — M4 分の GA 音声バッチ warm は未反映（別タスク）
