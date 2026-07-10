# `dignify` / `dignity` RP IPA ホットフィックス — 実装レポート

- 実施日: 2026-07-10
- 指示書: `/Users/naoya.k/Downloads/files 61/cursor-instructions-dignify-hotfix.md`
- ブランチ: `main`

## 1. バグ内容

M2d で GA IPA の母音 `ɪ` 脱字を修正したが、`rp_ipa` の再導出が漏れ、誤った GA から生成された RP が残存。

| 語 | 修正前 `rp_ipa`（誤） | 修正後 `rp_ipa`（正） |
|---|---|---|
| `dignify` | `/ˈdɡnəˌfaɪ/` | `/ˈdɪɡnəˌfaɪ/` |
| `dignity` | `/ˈdɡnətiː/` | `/ˈdɪɡnətiː/` |

## 2. 適用結果

```
patched 2 words
```

`gen_ga_rp_same.py` 再実行後:

| 語 | `ga_rp_same` | `ga_rp_same_reason` |
|---|---|---|
| `dignify` | **True** | `identical`（different → same に反転） |
| `dignity` | False | `ga_allophony`（narrow flap-T 存在のため仕様通り） |

neighbors 再計算は不要（`rp_ipa` は neighbors 生成に未使用）。

## 3. 変更ファイル

- `wordlist_GA_a1a2_plus_phonics.json`
- `data/patches/dignify_dignity_rp_hotfix.json`
- `data/pipeline/ga_rp_same_report.json`
- `data/derived/rp_progress.json`（wordlist 同期）
- `docs/cursor/instructions/cursor-instructions-dignify-hotfix.md`

## 4. 参考資料（リポジトリ配置）

- `docs/reference/phase2-m2-completion-summary.md`
- `docs/reference/r4-pending-review-guide.md`
- `docs/reference/r4_pending_review_list.csv` / `.json`
