---
id: pj-2026-07-10-7ede
aliases:
- pj-2026-07-10-7ede
title: Phase 2 pilot（B2 拡充 179 語）— 実装レポート
created: '2026-07-10'
---

# Phase 2 pilot（B2 拡充 179 語）— 実装レポート

- 実施日: 2026-07-09
- 指示書: `/Users/naoya.k/Downloads/files 54/cursor-instructions-phase2-pilot.md`
- 設計: `docs/reference/c1-expansion-scope-design.md`
- ブランチ: `main`

## 1. 実施概要

CEFR-J v1.5 B2 先頭 **179 エントリ**（`attribute` 名詞+動詞統合）を wordlist にマージし、narrow IPA / respelling / RP IPA / neighbors / `ga_rp_same` を再計算した。総語数 **5,007**（B2=509）。

## 2. マージ結果

```
新規追加: 179語
スキップ: 0語
マージ後総語数: 5007
CEFR: A1=1187 / A2=1195 / B1=2116 / B2=509
```

ソース: `data/batches/phase2_pilot_180_with_gloss.json`

## 3. パイプライン実行

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
# RP IPA: Britfone lookup + ga_to_rp fallback（§4 参照）
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
```

### narrow IPA / respelling

- flap 候補: **464**（R4 pending: **120**）
- respell 生成: **4,815** 語

## 4. RP IPA 生成（Britfone 実測）

`ANTHROPIC_API_KEY` 未設定のため `gen_rp_ipa.py`（Claude API）は未実行。代わりに **Britfone 3.0.1 直接 lookup + `ga_to_rp` フォールバック** で pilot 179 語に `rp_ipa` を付与。

| ソース | 語数 | 割合 |
|---|---:|---:|
| Britfone 直接一致 | 109 | **60.9%** |
| `ga_to_rp` ルール補完 | 70 | 39.1% |

**Britfone 実測 60.9%** — 設計目標 ≥82% を下回る。B2 pilot は派生語・複合語（`abnormally`, `affectionately`, `Shakespearean` 等）が多く Britfone 未収録。Phase 2 M2 以降は Claude API（`gen_rp_ipa.py`）併用を推奨。

`rp_progress.json` / `rp_complete.json` を 5,007 語分に更新済み。

**注意:** `merge_rp_ipa.py` 実行時、`data/derived/connected_speech_with_rp.json` が古く（15 句）`connected_speech.json` を上書きしてしまったため、**201 句を git から復元**し `gen_ga_rp_same.py` を再実行。wordlist の `rp_ipa` は直接付与済みのため `merge_rp_ipa.py` は再実行していない。

## 5. 品質検証チェックリスト（§4-1）

| # | 項目 | 期待値 | 実測 | 結果 |
|---|---|---|---|---|
| A | 総語数 | 5,007 | 5,007 | PASS |
| B | B2 count | 509 | 509 | PASS |
| C | pilot `rp_ipa` | 179/179 | 179/179 | PASS |
| D | pilot `ga_rp_same` ≠ missing | 179/179 | 179/179 | PASS |
| E | 全体 0 近傍率 | ≤5% | 263 (5%) | PASS |
| F | pilot 0 近傍率 | ≤20% | 25 (14%) | PASS |
| G | Britfone 直接一致率 | ≥82% | **60.9%** | **未達**（API 未使用） |
| H | 既存 4,828 語コアフィールド | 不変 | 0 変更 | PASS |
| I | GA IPA に `ː` 混入 | 0 | 0 | PASS |
| J | 5 言語 gloss 完備 | 179/179 | 179/179 | PASS |

**H 補足:** `ipa` / `rp_ipa` / `gloss` / `respell` 等コアフィールドは不変。`neighbors` は wordlist 拡張に伴い **446 語**で再ランク（v2 再計算の想定内）。

### pilot 近傍統計

- 0 近傍: **25 語（14%）** — 設計期待 13% と近似
- フル K（8 語）: **56 語（31%）** — 設計期待と一致

### 長語サンプル

| 語 | neighbors（先頭） | `ga_rp_same` |
|---|---|---|
| `international` | internationally, intentionally, interaction | false |
| `organization` | organisation, civilisation, organism | false |
| `attribute` | （0 — phonetic island） | false |
| `DNA` | dense, dj | true |

## 6. 配置ファイル

| ファイル | 用途 |
|---|---|
| `docs/reference/c1-expansion-scope-design.md` | Wave 2/3 設計 |
| `data/batches/gap_b2_new.json` | B2 マスタリスト（1,992 語） |
| `data/batches/gap_c1_new.json` | C1 マスタリスト（1,015 語） |
| `data/batches/gap_a2_completion.json` | A2 gap 6 語 |
| `data/batches/pilot_b2_180.json` | pilot 語彙リスト（headword のみ） |
| `data/batches/phase2_pilot_180_with_gloss.json` | pilot 完成データ |

## 7. 変更ファイル一覧

- `wordlist_GA_a1a2_plus_phonics.json`
- `data/batches/phase2_pilot_180_with_gloss.json` + gap/pilot 参照 JSON
- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
- `docs/reference/c1-expansion-scope-design.md`, `neighbors_report.md`

## 8. 未対応・フォローアップ

1. **Britfone カバー率 60.9%** — `gen_rp_ipa.py`（Claude API）で 70 語を再生成し ≥82% を再検証
2. **`gas/BatchWords.gs`** — 5,007 語版更新（別タスク）
3. **`merge_rp_ipa.py`** — `connected_speech_with_rp.json` の更新が必要（現行 15 句は古い）
4. **Phase 2 M2** — pilot 目視レビュー + Britfone 実測判定後に着手
