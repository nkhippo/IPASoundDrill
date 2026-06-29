# Cursor 実装レポート — 語彙ブラウザモーダル

> 作成日: 2026-06-29  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-vocab-browser.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

アプリが管理する全語彙（単語 3,059 + 連結句 201）を一覧・検索・音声確認できるモーダルを追加。既存の設定・ガイドモーダルと同パターンで実装。

---

## 2. 実施内容

### 2-1. UI

| 項目 | 内容 |
|------|------|
| 起動 | topbar `#vocabBtn`（リストアイコン） |
| モーダル | `#vocabModal`（max-width 720px） |
| タブ | **Words**（3,059語）/ **Phrases**（201句） |
| Words | A→Z ソート、文字グループヘッダ、検索（debounce 120ms）、A–Z ジャンプ |
| Phrases | linking → assimilation → elision × L1–L3 順、タイプバッジ |
| 各行 | 単語/フレーズ、GA+RP IPA、意味、品詞（Words）、TTS |

### 2-2. 意味表示

`vocabDisplayGloss(c)` を新規追加（`modeBDisplayGloss` と同パターン）:
- 英語 UI + `gloss.en === w` → `def` フィールド優先
- 他言語 → `gloss[LANG]`

`normalizeWord()` に `def` フィールドの取り込みを追加。

### 2-3. i18n

`vocab.*` 5キーを 5言語に追加（**156キー** × 5言語）。

| キー | en |
|------|-----|
| `vocab.title` | Vocabulary |
| `vocab.tab_words` | Words |
| `vocab.tab_phrases` | Phrases |
| `vocab.search` | Search… |
| `vocab.no_results` | No results |

### 2-4. TTS

- Words: `speak(word)`（現在のアクセント設定に追従）
- Phrases: `speak(ipa, { connected: true })`（GA 固定）

---

## 3. 検証

```bash
python3 tools/validate_i18n.py   # ERROR 0（156キー × 5言語）
python3 tools/gen_audit_docs.py
```

| DoD 項目 | 結果 |
|----------|------|
| topbar リストボタン | ✅ |
| Words 3,059語 A→Z | ✅ |
| GA+RP IPA 両方表示 | ✅ |
| 検索・A–Z ジャンプ | ✅ |
| Phrases 201句 cs_type 順 | ✅ |
| 英語 UI で `def` 表示 | ✅ |
| 言語切替で再描画 | ✅ |
| validate_i18n ERROR 0 | ✅ |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `index.html` | DOM・CSS・JS（モーダル全体） |
| `i18n/{en,ja,zh,ko,fil}.json` | `vocab.*` 5キー追加 |
| `docs/SPECIFICATION.md` | §4.8b 追加 |
| `docs/i18n-audit.md` | 再生成 |
| `docs/cursor-vocab-browser.md` | 指示書コピー |

---

## 5. デプロイ

- **ブランチ:** `main` に push
- **GitHub Pages:** https://nkhippo.github.io/English-Pronunciation-Trainer/

---

## 6. 申し送り

- 将来拡張候補: CEFR フィルタ、品詞フィルタ、お気に入り
- Phrases タブは `CONNECTED` のみ（弱形 36 語は含まない。設計どおり）
