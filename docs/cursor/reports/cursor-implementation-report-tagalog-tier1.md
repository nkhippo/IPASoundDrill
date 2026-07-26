# Cursor 実装レポート — タガログ語（fil）Tier 1 + Tier 3

> 作成日: 2026-06-26  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tagalog-tier1-v2.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

フィリピン語学習者向けに UI 言語 **fil（Tagalog/Filipino）** を追加。Tier 1（UI 151キー + 音素解説）と Tier 3（学習ガイド本文）のみ実施。Tier 2（gloss 3,059語）・Tier 4（cs_rule 237件）は別タスク。

---

## 2. 実施内容

### 2-1. Tier 1 — UI

| 項目 | 内容 |
|------|------|
| `i18n/fil.json` | Claude 生成版を **そのまま配置**（151キー） |
| `lang_opts.fil` | `en` / `ja` / `zh` / `ko` / `fil` 全5ファイルに `"Filipino"` 追加 |
| 言語ピッカー | `#langOpts` に `data-lang="fil"` ボタン追加 |
| `i18n/phonemes/fil.json` | Claude 生成版（43記号 × 5フィールド）を配置 |

### 2-2. Tier 3 — 学習ガイド

| 項目 | 内容 |
|------|------|
| `data/guide.json` | 6言語版に差し替え（`fil` セクション追加・8セクション） |
| ガイド言語ピル | `#guideLangPills` に `data-guide-lang="fil"` 追加 |

### 2-3. 検証・ツール

| 項目 | 結果 |
|------|------|
| `python3 tools/validate_i18n.py` | **ERROR 0**（WARN: `fil.back_top` = "Menu" は en 同値・許容） |
| キー整合 | en 151 = fil 151（差分なし） |
| `validate_i18n.py` | `ALLOW_EN_IDENTICAL` に `lang_opts.fil` 追加 |

### 2-4. 意図的に未実施（別チャット）

| Tier | 内容 |
|------|------|
| Tier 2 | `wordlist` の `gloss.fil`（3,059語）→ Mode B 意味 MCQ は **en フォールバック** |
| Tier 4 | `connected_speech.json` / `weak_forms.json` の `cs_rule.fil` → reveal ルール文は **en フォールバック** |

---

## 3. DoD

| 項目 | 結果 |
|------|------|
| `i18n/fil.json` 配置 | ✅ |
| 全5 UI ファイル 151キー | ✅ |
| `#langOpts` Filipino ボタン | ✅ |
| `i18n/phonemes/fil.json` | ✅（本格翻訳版） |
| `data/guide.json` 6言語版 | ✅ |
| `#guideLangPills` Filipino ピル | ✅ |
| `validate_i18n.py` ERROR 0 | ✅ |
| gloss / cs_rule フォールバック（クラッシュなし） | ✅（既存 `wordGloss()` / `csRuleText()`） |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `i18n/fil.json` | 新規 |
| `i18n/phonemes/fil.json` | 新規 |
| `i18n/{en,ja,zh,ko}.json` | `lang_opts.fil` 追加 |
| `index.html` | 言語ピッカー・ガイドピル |
| `data/guide.json` | fil 追加版に差し替え |
| `tools/validate_i18n.py` | `lang_opts.fil` 除外 |
| `tools/gen_audit_docs.py` | fil 列対応 |
| `docs/i18n-language-scaling.md` | 5言語に更新 |
| `docs/cursor-tagalog-tier1-v2.md` | 設計指示書 |
| `docs/i18n-audit.md` | 再生成 |

---

## 5. Git / デプロイ

| 項目 | 値 |
|------|-----|
| ブランチ | `main` |
| GitHub Pages | push 後即反映 |

---

## 6. 動作確認手順

1. Settings → **Filipino** を選択
2. Words / Connected Speech / Weak Forms 各タブの UI がタガログ語になること
3. Guide → **Filipino** ピルでガイド本文がタガログ語になること
4. Mode B で意味表示が英語フォールバックでもクラッシュしないこと
5. 連結句・弱形 reveal のルール文が英語フォールバックでも問題ないこと

---

## 7. Claude 申し送り（レビュー推奨）

指示書 §7 のとおり、以下は意味翻訳のため自然さの目視確認を推奨（構造・検証には影響なし）:

1. 長文 HTML リード4件（`lead_*` / `modeb.lead_html`）
2. `brand.name` / `brand.sub` のブランド表記
3. `reveal.ga_note` / `reveal.rp_note` の括弧注記
4. `pos.*`（18件・現状 UI 未配線）
