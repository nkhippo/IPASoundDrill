---
id: pj-2026-07-09-1d69
aliases:
- pj-2026-07-09-1d69
title: Phase 1 M3 実装レポート
created: '2026-07-09'
---
# Phase 1 M3 実装レポート

- 実施日: 2026-07-09
- 指示書: `docs/cursor-instructions-phase1-m3.md`
- 前提修正: `docs/cursor-implementation-report-fix-merge-respelling.md`
- ブランチ: `main`

## 1. 実施概要

CEFR-J B1 拡充の第3バッチ 400 語（`entertain`〜`marine`）を、IPA・pos・def・gloss（5言語）完成済みの状態で `wordlist_GA_a1a2_plus_phonics.json` にマージした。続けて narrow IPA（`ipa_actual_ga`）と respelling（`respell_ga` / `respell_rp`）を既存スクリプトで生成・反映した。

## 2. マージ結果

```
新規追加: 400語
スキップ(既存と重複): 0語 []
マージ後総語数: 4039
```

- `_generation_source` はマージ時に全件削除済み
- `neighbors` は空配列のまま
- gloss（en/ja/zh/ko/fil）は提供データどおり完成済み

## 3. `merge_respelling.py` 修正版の効果

M1/M2 と異なり、パイプライン後の**手動 respell 復元は不要**だった。

- HEAD で respell を持っていた VntV pending 52語: **52/52 保持**
- 既存サンプル `abandon` / `biography` / `book` の gloss・respell: **変更なし**

## 4. narrow IPA / respelling 生成

実行コマンド:

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
```

### 4-1. 全語彙再スキャン結果

```
Auto-generated candidates (R1/R2/R3): 327
Flagged for review (R4 VntV etc.):    88
  R1: 240
  R2: 22
  R3: 65
merged 327 / 327 entries

Total words:            4039
Confirmed (drafted):    3950
Pending TTS review:     88
Exceptions:             1
merged 3950 / 3950 entries
```

### 4-2. M3 400語の内訳

| 区分 | 語数 |
|---|---:|
| `ipa_actual_ga` 自動生成（flap 候補） | 64 |
| R4 レビュー対象（respell pending） | 22 |
| `respell_ga` / `respell_rp` 生成済み | 377 |
| respelling 例外 | 1 |
| gloss 5言語完成 | 400 |

M3 R4 レビュー対象 22語: `entertain`, `entertainer`, `environmentalist`, `fantasy`, `finding`, `handy`, `identity`, `independent`, `indirect`, `indirectly`, `individual`, `indoors`, `industry`, `interact`, `interaction`, `intermediate`, `intermission`, `internationally`, `interrupt`, `interval`, `interviewee`, `maintenance`

例外 1語: `friendliness`（`ga: "unknown coda consonant 'ː'"`）

## 5. 検証結果

```
総語数: 4039
CEFR分布: {'A1': 1187, 'A2': 1195, 'B1': 1327, 'B2': 330}
```

`B1=1327`（927+400）を確認。

サンプル（新規）:

| 語 | ipa | respell_ga | gloss.ja |
|---|---|---|---|
| `entertain` | `/ˌɛntɚˈteɪn/` | （R4 pending・未付与） | `楽しませる、もてなす` |
| `lifeguard` | `/ˈlaɪfˌɡɑrd/` | `LYF-gard` | `ライフガード、監視員` |
| `marine` | `/mɚˈin/` | `mer-EEN` | `海の、海兵隊員` |

既存確認:

| 語 | gloss.ja | respell_ga |
|---|---|---|
| `abandon` | `見捨てる、放棄する` | `uh-BAN-dn` |
| `biography` | `伝記` | `by-AH-gruh-fee` |
| `book` | `本、予約する、記帳する` | `BUUK` |

## 6. ドキュメント更新

- `docs/PURPOSE.md` — B1: 1,327語、gloss 合計 4,039語、変更履歴 v3.8
- `docs/cursor-instructions-phase1-m3.md`（指示書コピー）

## 7. 変更ファイル

- `wordlist_GA_a1a2_plus_phonics.json`（+400語、flap/respell 反映）
- `phase1_m3_400_with_gloss.json`（ソースデータ）
- `phase2a_flap_candidates.json`, `phase2a_review_needed.json`
- `phase2b_respell_draft.json`, `phase2b_respell_pending.json`, `phase2b_respell_exceptions.json`
- `scripts/merge_respelling.py`（恒久修正）
- `docs/PURPOSE.md`、本レポート、fix レポート

## 8. 既知の残作業・懸念

1. Phase 1 M4: B1 残り **789** 語（1,189 − 400）
2. `neighbors` 再計算（項目#6）
3. R4 pending 88語（うち M3 新規 22語）の TTS レビュー・narrow IPA 確定
4. `friendliness` の respelling 例外（長母音 coda）の手動対応
