# RP IPA バグ修正 — 実装レポート

- 実施日: 2026-07-10
- 指示書: `/Users/naoya.k/Downloads/files 55/cursor-instructions-rp-ipa-bugfix.md`
- ブランチ: `main`

## 1. 実施概要

Phase 2 pilot で `ga_to_rp` フォールバックが使用された 17 語について、**母音前 /r/（onset・intervocalic r）が誤脱落**していたバグを修正。`scripts/ga_to_rp.py` を v2 に差し替え、wordlist の `rp_ipa` をパッチ適用後、`ga_rp_same` を再計算した。

## 2. バグと修正

### 症状

v1 の `ga_to_rp.py` は文脈を見ず `ɑr→ɑː` 置換や `r` トークン削除を行い、non-rhotic 化すべき coda /r/ 以外も脱落させていた。

### 修正

v2 はトークン先読み方式で、**次トークンが母音なら /r/ を保持**、coda のみ non-rhotic 化。

| 語 | 修正後 `rp_ipa` |
|---|---|
| `barometer` | `/bəˈrɒmətə/` |
| `arrogant` | `/ˈærəɡənt/` |
| `aircrew` | `/ˈeəˌkruː/` |
| `barren` | `/ˈbærən/` |

## 3. 適用内容

| 作業 | 結果 |
|---|---|
| `scripts/ga_to_rp.py` v2 差し替え | 完了 |
| `data/patches/rp_ipa_bugfix_patch.json` 適用 | **17/17** |
| `gen_ga_rp_same.py` 再実行 | 完了 |
| `export_batch_words.py` | **5,007 語**に更新 |
| legacy 削除 | `connected_speech.legacy15.json`, `connected_speech_with_rp.json` |

## 4. 検証チェックリスト

| # | 項目 | 期待 | 実測 | 結果 |
|---|---|---|---|---|
| 1 | `ga_to_rp.py` 差し替え | 完了 | 完了 | PASS |
| 2 | パッチ適用 | 17/17 | 17/17 | PASS |
| 3 | `barometer` rp_ipa | `/bəˈrɒmətə/` | `/bəˈrɒmətə/` | PASS |
| 4 | `arrogant` rp_ipa | `/ˈærəɡənt/` | `/ˈærəɡənt/` | PASS |
| 5 | `barren` ga_rp_same | `true` | `true` (identical) | PASS |
| 6 | `BatchWords.gs` | 5007 語 | 5007 語 | PASS |
| 7 | legacy 削除 | 2 ファイル | 2 ファイル削除 | PASS |
| 8 | pilot 以外 rp_ipa 不変 | 0 変更 | 0 変更 | PASS |

### `ga_rp_same` 反転（10/10 確認）

`Shakespearean`, `admirable`, `admiringly`, `aggressively`, `anchorage`, `antibacterial`, `arrogant`, `attractiveness`, `bankrupt`, `barren` → **`ga_rp_same: true`**

（指示書の 12 語のうち、残り 2 語 `aircrew` / `antiaircraft` / `aristocracy` は引き続き different だが reason は修正済み RP で再分類）

### `ga_to_rp` ユニット確認（修正後）

```
barometer /bəˈrɑmətɚ/ → /bəˈrɒmətə/
arrogant  /ˈærəɡənt/  → /ˈærəɡənt/
aircrew   /ˈɛrˌkru/   → /ˈeəˌkruː/
```

## 5. 変更ファイル

- `scripts/ga_to_rp.py`
- `data/patches/rp_ipa_bugfix_patch.json`（新規）
- `wordlist_GA_a1a2_plus_phonics.json`
- `data/pipeline/ga_rp_same_report.json`
- `data/derived/rp_progress.json`, `rp_complete.json`
- `gas/BatchWords.gs`, `gas/batch_words.csv`
- 削除: `data/derived/connected_speech.legacy15.json`, `connected_speech_with_rp.json`

## 6. 残作業・注意

1. **`merge_rp_ipa.py`** は依然 `paths.CONNECTED_SPEECH_RP` を参照する設計。legacy ファイル削除により誤実行時は即失敗する（意図通り）。将来は `connected_speech.json` 直読みへの改修を推奨。
2. **Phase 2 M2 以降** — バッチ JSON に `rp_ipa` を同梱する方針（指示書 §5）。`gen_rp_ipa.py` API 依存を回避。
