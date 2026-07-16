---
id: pj-2026-07-10-1069
aliases:
- pj-2026-07-10-1069
title: Cursor 実装レポート — Phase B (Phase 2 バッチ品質監査)
created: '2026-07-10'
---

# Cursor 実装レポート — Phase B (Phase 2 バッチ品質監査)

- 実施日: 2026-07-10
- 指示書: `docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md`
- ブランチ: `fix/phase-b-batch-quality-audit` → `main` にマージ済み
- GitHub Pages: https://nkhippo.github.io/IPASoundDrill/
- Opus 監査サマリ: 569 語独立監査、新規 IPA bug 0件、gloss typo 2件、POS 1件、Fil 13件

## 1. 実施内容

### B1: wordlist gloss.zh 的的 + POS
- `comprehensive`: gloss.zh `全面的的` → `全面的`
- `corporal`: gloss.zh `身体的的` → `身体的`
- `damn`: POS `形容詞 / 副詞 / 感嘆詞` → `形容詞 / 副詞 / 間投詞`
- 全 wordlist 走査で残存 `的的` = **0**

### B2: wordlist Fil 翻訳 13 語
- 8 firm: `anchorperson`→tagapagbalita, `antibacterial`→antibakteryal, `barometer`→barometro, `broadcaster`→tagapamahayag, `determiner`→pantukoy, `dilemma`→dilema, `duplicate`→duplikado, `dynamic`→dinamiko
- 5 dual-form: `bookmark`, `carpool`, `compress`, `cyberschool`, `dropout`
- 38 語は正当借用語として現状維持

### B3: バッチ同期 86 語
| バッチ | 件数 |
|--------|-----:|
| pilot | 3 |
| m2a | 29 |
| m2b | 14 |
| m2c | 22 |
| m2d | 18 |
| **合計** | **86** |

内訳: rp_ipa sync 70（dignify/dignity 2 + happy-i 68）+ gloss.zh typo 2 + POS 1 + Fil 13。  
バッチ↔wordlist の IPA / rp_ipa / gloss.zh 残差 = **0**。  
`dignify` rp_ipa = `/ˈdɪɡnəˌfaɪ/`、`dignity` = `/ˈdɪɡnəti/`。

パッチ源: `data/patches/phase2_audit/`

### B4: i18n 複合 POS キー
- `pos["形容詞 / 副詞 / 間投詞"]` を 6 言語に追加（en/ja/ko/zh-Hans/zh-Hant/fil）
- UI キー数: **177**（en 基準）。`validate_i18n.py` は既存の `t("woff2")` 誤検知 ERROR のみ（CSS `format("woff2")`）

### B5: 派生データ再生成 + ドキュメント
- `gen_neighbors.py` + `merge_neighbors.py`（近傍0語 284 = 5%、統計不変）
- `gen_ga_rp_same.py --report`（same=2,674 / different=2,723、統計不変）
- `export_batch_words.py`（5,397 語 → BatchWords.gs）
- PURPOSE v3.24 / REPOSITORY-STRUCTURE / data/README / cursor README

## 2. 検証結果

| # | 項目 | 結果 |
|---|------|------|
| 1 | residual `的的` in gloss.zh | ✓ 0 |
| 2 | comprehensive / corporal zh | ✓ 全面的 / 身体的 |
| 3 | damn POS | ✓ 形容詞 / 副詞 / 間投詞 |
| 4 | i18n 6言語に複合キー | ✓ |
| 5 | validate_i18n（キー整合） | ✓（woff2 誤検知のみ） |
| 6–7 | Fil sample（anchorperson, determiner） | ✓ |
| 8 | batch↔wordlist IPA/zh diffs | ✓ 0 |
| 9–10 | dignify + happy-i in batches | ✓ |
| 11 | Fil keep-as-is 38語 | ✓ 未変更 |

## 3. commit 一覧

```
b653ee1 Merge branch 'fix/phase-b-batch-quality-audit' (Phase B batch quality audit)
ce0ab0d docs(phase-b): update changelog, add implementation report, regenerate derived data
fd1590e i18n(pos): add 形容詞 / 副詞 / 間投詞 compound key across 6 languages (for damn)
81781ed sync(batches): apply Phase R + Phase B fixes to Phase 2 batch source files
1b439c1 i18n(fil): apply Opus-proposed Filipino translations for 13 words
e4bbfa1 fix(data): correct gloss.zh 的的 typos (comprehensive, corporal) + normalize damn POS
```

## 4. 変更ファイル

| ファイル | 内容 |
|----------|------|
| `wordlist_GA_a1a2_plus_phonics.json` | 16 語修正 + neighbors/ga_rp_same 再生成 |
| `data/batches/phase2_*.json`（5） | 86 語同期 |
| `data/patches/phase2_audit/*` | パッチ源 + final_summary |
| `i18n/*.json`（6） | 複合 POS キー |
| `data/derived/wordlist_with_neighbors*.json` | 再生成 |
| `docs/PURPOSE.md` | v3.24 |
| `docs/REPOSITORY-STRUCTURE.md` / `data/README.md` | phase2_audit 記載 |
| `docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md` | 指示書コピー |
| `docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md` | 本レポート |

## 5. スコープ外（今回対応せず）

- Fil カテゴリ A（38 語）の英語 pass-through 維持
- Phase 1 バッチの再監査
- gloss.ja / ko の追加精査
- Fil native speaker レビュー
- TTS / BatchWarm 再走行（IPA 未変更のため不要）
