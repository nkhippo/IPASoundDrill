---
id: pj-2026-07-10-6487
aliases:
- pj-2026-07-10-6487
title: Cursor 実装レポート — Phase V (語彙ページ化 + UI 整備)
created: '2026-07-10'
---

# Cursor 実装レポート — Phase V (語彙ページ化 + UI 整備)

- 実施日: 2026-07-10
- 指示書: `docs/cursor/instructions/cursor-instructions-phase-v-vocab-page.md`
- ブランチ: `feat/phase-v-vocab-page` → `main` にマージ済み
- GitHub Pages: https://nkhippo.github.io/IPASoundDrill/

## 1. 実施内容

### V1: モーダル → ページ DOM 移設
- `#vocabModal` を廃止し、`<section id="vocabPage">` に置換
- sticky header（Back / タイトル / Words・Phrases タブ / 検索 / A–Z）+ `#vocabBody`
- モーダル用 scrim・Escape 閉じ・語彙向け `scroll-locked` を削除
- モバイルでも検索欄を常時表示

### V2: Hash routing + Back ボタン
- `ROUTES` / `parseHash` / `navigate` / `onRouteChange` / `hashchange`
- `#/vocab` → Words、`#/vocab/phrases` → Phrases
- `showVocabView(tab)` で他 view を hide、`vocabReturnViews` に復帰先を記録
- Back（`#vocabBackBtn`）→ `navigate("")` → `showSetupOrPractice()`（`renderCard()` は呼ばず reveal 状態を保持）
- Menu（`#backTopBtn`）とは独立
- `initApp()` のデータ load 後に `onRouteChange()` を実行（直リンク空表示を防止）

### V3: UI 整備
- 行を 2 段組グリッド化（上: 単語+バッジ / 下: IPA+gloss、右: checks+play）
- Words / Phrases 双方に CEFR バッジ（A1–B2 配色）
- sticky header・A–Z 横スクロール・hover・gloss clamp
- 空状態（`vocab.no_results`）とタブ切替時のローディング表示

### V4: i18n `vocab.back`
| 言語 | 文言 |
|------|------|
| en | Back |
| ja | 戻る |
| ko | 뒤로 |
| zh-Hant / zh-Hans | 返回 |
| fil | Bumalik |

`vocab.*` は 5 → **6 キー**（×6言語）。`validate_i18n.py` は既存の `t("woff2")` 誤検知 ERROR あり（CSS `format("woff2")`）。`vocab.back` 自体は問題なし。

### V5: ドキュメント
- `docs/PURPOSE.md` v3.23
- `docs/SPECIFICATION.md` §4.8b を `#vocabPage` 向けに改訂
- 本レポート + 指示書コピー + `docs/cursor/README.md` 更新

## 2. commit 一覧

```
f06f5e0 Merge branch 'feat/phase-v-vocab-page' (Phase V vocab page)
2241315 docs(phase-v): update SPEC §4.8b, changelog, implementation report
c65bdc4 i18n(vocab): add vocab.back for all 6 languages
0623ad4 style(vocab): two-line rows, CEFR badges, sticky header polish
62720fa feat(vocab): hash routing (#/vocab, #/vocab/phrases) + back button
8cd23be refactor(vocab): migrate modal to independent page (#vocabPage)
```

## 3. 変更ファイル

| ファイル | 内容 |
|----------|------|
| `index.html` | V1–V3 DOM / routing / UI |
| `i18n/*.json`（6） | `vocab.back` |
| `docs/PURPOSE.md` | v3.23 changelog・ステータス |
| `docs/SPECIFICATION.md` | §4.8b 改訂 |
| `docs/cursor/instructions/cursor-instructions-phase-v-vocab-page.md` | 指示書コピー |
| `docs/cursor/reports/cursor-implementation-report-phase-v.md` | 本レポート |
| `docs/cursor/README.md` | Phase V 行追加 |

## 4. テスト項目チェックリスト

| # | シナリオ | 結果 |
|---|----------|------|
| 1 | URL `#/vocab` 直アクセス | ✓ コード上（load 後 `onRouteChange`） |
| 2 | topbar Vocab → `#/vocab` | ✓ |
| 3 | Words 全件リスト | ✓ 一括描画（従来どおり） |
| 4 | 検索 debounce | ✓ 既存ロジック維持 |
| 5 | 空検索結果 | ✓ `vocab-empty` |
| 6 | A–Z ジャンプ | ✓ |
| 7 | play / progress checks | ✓ 既存ハンドラ維持 |
| 8 | Phrases → `#/vocab/phrases` | ✓ |
| 9 | Back → setup / 直前 view | ✓ `vocabReturnViews` |
| 10 | 練習中 Vocab → Back | ✓ `renderCard()` 非呼び出し |
| 11 | Menu `#backTopBtn` 独立 | ✓ |
| 12 | i18n 6言語 `vocab.back` | ✓ |
| 13 | sticky header / モバイル検索常時 | ✓ CSS |
| 14 | vocab で `scroll-locked` なし | ✓ |

## 5. 未対応事項（スコープ外）

- CEFR / POS フィルタ実機能（プレースホルダーのみ）
- 検索クエリの URL 化（`?q=`）
- 仮想スクロール
- 語彙詳細ページ
- card-top と vocab CEFR バッジ配色の統一
