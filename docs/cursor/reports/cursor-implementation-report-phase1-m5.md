---
id: pj-2026-07-09-b543
aliases:
- pj-2026-07-09-b543
title: Phase 1 M5 実装レポート（B1 拡充・最終バッチ）
created: '2026-07-09'
---
# Phase 1 M5 実装レポート（B1 拡充・最終バッチ）

- 実施日: 2026-07-09
- 指示書: `docs/cursor/instructions/cursor-instructions-phase1-m5.md`
- ブランチ: `main`

## 1. 実施概要

CEFR-J B1 拡充の**最終バッチ** 389 語（`restrict`〜`yoga`）を、IPA・pos・def・gloss（5言語）完成済みの状態で `wordlist_GA_a1a2_plus_phonics.json` にマージした。これにより Phase 1 の B1 語彙拡充（1,769語）が完了した。

## 2. マージ結果

```
新規追加: 389語
スキップ(既存と重複): 0語 []
マージ後総語数: 4828
```

- `_generation_source` はマージ時に全件削除済み
- `neighbors` は空配列のまま
- ソース: `data/batches/phase1_m5_389_with_gloss.json`

## 3. narrow IPA / respelling 生成

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
```

### 3-1. 全語彙再スキャン結果

```
Auto-generated candidates (R1/R2/R3): 434
Flagged for review (R4 VntV etc.):    110
  R1: 328
  R2: 32
  R3: 74
merged 434 / 434 entries

Total words:            4828
Confirmed (drafted):    4718
Pending TTS review:     110
Exceptions:             0
merged 4718 / 4718 entries
```

### 3-2. M5 389語の内訳

| 区分 | 語数 |
|---|---:|
| `ipa_actual_ga` 自動生成（flap 候補） | 43 |
| R4 レビュー対象（respell pending） | 14 |
| `respell_ga` / `respell_rp` 生成済み | 375 |
| respelling 例外 | 0 |
| gloss 5言語完成 | 389 |

M5 R4 レビュー対象 14語: `standard`, `sundial`, `surrounding`, `talented`, `thunder`, `thunderous`, `tremendous`, `uncertainty`, `underage`, `undergo`, `underneath`, `underpants`, `unwanted`, `warranty`

## 4. 既存語への影響確認

- HEAD で respell を持っていた VntV pending 52語: **52/52 保持**
- 既存サンプル `abandon` / `biography` / `entertain` / `marked` の gloss・respell: **変更なし**

## 5. 検証結果

```
総語数: 4828
CEFR分布: {'A1': 1187, 'A2': 1195, 'B1': 2116, 'B2': 330}
```

`B1=2116`（1727+389）を確認。

サンプル（新規）:

| 語 | ipa | respell_ga | gloss.ja |
|---|---|---|---|
| `restrict` | `/riˈstrɪkt/` | `ree-STRIKT` | `制限する` |
| `submarine` | `/ˈsʌbməˌrin/` | `SUHB-muh-reen` | `潜水艦` |
| `yoga` | `/ˈjoʊɡə/` | `YOH-guh` | `ヨガ` |

既存確認:

| 語 | gloss.ja | respell_ga |
|---|---|---|
| `abandon` | `見捨てる、放棄する` | `uh-BAN-dn` |
| `biography` | `伝記` | `by-AH-gruh-fee` |
| `entertain` | `楽しませる、もてなす` | （R4 pending・未付与） |
| `marked` | `顕著な、はっきりした` | `MARKT` |

## 6. Phase 1 B1 拡充完了サマリ

| バッチ | 語数 | 累計 B1（app内） |
|---|---:|---:|
| M1 | 180 | — |
| M2 | 400 | — |
| M3 | 400 | — |
| M4 | 400 | 1,727 |
| M5 | 389 | **2,116** |

CEFR-J B1 単一語 2,332 のうち、227語は app 内で既に A1/A2 としてカバー済みのため、app 内 B1 は 2,116（想定通り）。

## 7. ドキュメント更新

- `docs/PURPOSE.md` — Phase 1 完了セクション、v3.14
- `docs/REPOSITORY-STRUCTURE.md` — 語数更新
- `docs/cursor/instructions/cursor-instructions-phase1-m5.md`（指示書コピー）

## 8. 変更ファイル

- `wordlist_GA_a1a2_plus_phonics.json`（+389語、flap/respell 反映）
- `data/batches/phase1_m5_389_with_gloss.json`
- `data/pipeline/phase2a_*.json`, `data/pipeline/phase2b_*.json`
- `docs/PURPOSE.md`, `docs/REPOSITORY-STRUCTURE.md`, 本レポート

## 9. 既知の残作業

1. **`neighbors` 再計算**（項目#6）— 新規 1,769語分
2. **`gas/BatchWords.gs` 更新** — `export_batch_words.py` + GAS 再デプロイ
3. **R4 pending 110語** — M1–M5 累計の TTS レビュー
4. **B2 語彙拡充** — 要否検討（Phase 2）
