---
id: pj-2026-07-12-8fd8
aliases:
- pj-2026-07-12-8fd8
title: F2 SEO subdirectory prerendering — 実装レポート
created: '2026-07-12'
---
# F2 SEO subdirectory prerendering — 実装レポート

## 関連 Issue / PR

- Issue: #39
- PR: #40

## Issue 背景（Issue 本文から要約）

Track A ローンチに向け、単一 HTML + JS 動的 meta ではクローラーに多言語 SEO が届かない問題を解くため、6 言語サブディレクトリへの静的 HTML プリレンダと Vercel Build / middleware を導入する。先行整備（#33 分類軸、#35 パターン C、#37 Build rollback）の上で、パターン C の初適用として `index.html` を `src/index.template.html` に移動し、生成物は `.gitignore` 管理外とする。

## 実装内容

- Phase 1: `git mv index.html` → `src/index.template.html`（pure move、md5 一致）
- Phase 2: head に BUILD プレースホルダ / OGP / Twitter / JSON-LD / hreflang、`<base href="/">`、URL グラウンドトゥルース用の `langFromPath` / `setLang` ナビ
- Phase 3: `scripts/build-i18n-html.js`、`middleware.ts`、`vercel.json`、`package.json`、`.gitignore` 更新
- Phase 4–5: ローカル `npm run build`、6 言語 body/script md5 一致、head 要素 grep 期待値一致
- Phase 6: Category A 5 ファイル更新（LAUNCH-CHECKLIST / REPOSITORY-STRUCTURE / OPERATIONS / CLAUDE / dev-flow）

## 変更ファイル

```
- index.html → src/index.template.html (R)
- scripts/build-i18n-html.js (A)
- middleware.ts (A)
- vercel.json (A)
- package.json (A)
- .gitignore (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/OPERATIONS.md (M)
- CLAUDE.md (M)
- .cursor/rules/dev-flow.mdc (M)
- docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショット + Runtime data contract 17 パス md5 記録
- Phase 1: 移動先 md5 = 移動元 md5（一致）
- Phase 4: 生成 body md5 unique count = 1、script md5 unique count = 1
- Phase 5: 各言語 title/description/hreflang×7/og/twitter/canonical/jsonld = 期待値
- Runtime data contract: Phase 0 と実装後で diff なし
- 実装中の自己判断による追加変更:
  - `<base href="/">`（サブディレクトリからの相対 fetch/font 解決に必須）
  - `langFromPath` / `persistAppLang` / `setLang` の URL 遷移（完了定義 D1。非対象「script 不変」と緊張関係あり → 全言語同一差分のため言語間 md5 は維持）
  - Bot 向けは Issue 指定の rewrite ではなく 302（`@vercel/functions` 非依存で Hobby 静的サイトでも確実に動く選択）
- 実装中に発覚した懸念: Vercel Preview 上の middleware / 外部 Validator は PR Preview URL で最終確認が必要

### grep 確認結果（抜粋）

| 項目 | 結果 |
|---|---|
| 6 言語 hreflang | 各 7 |
| body md5 unique | 1 |
| script md5 unique | 1 |
| `function initApp` / `applyI18n` / `setLang` / `setAccent` | 各 ≥1 |
| Runtime paths in template | 維持（`<base href="/">` 付き） |
| Category A 参照 | `src/index.template.html` / `build-i18n-html.js` / `middleware.ts` 記載済み |

## 動作確認

- ローカル `npm run build`: 6 言語 HTML 生成 OK
- Preview / Production URL: PR 作成後に確認（middleware Accept-Language、`/en/` 200）
- Twitter / Facebook / Rich Results: Preview URL で Naoya 目視（本レポート時点では未実施）
- 既存機能への影響: body/script は全言語同一。相対アセットは `<base href="/">` でルート解決
- データ整合性: Runtime contract md5 不変

## middleware.ts PoC

- 実装: `matcher: '/'`、Cookie `app_lang` → Accept-Language → `/en/` fallback。Bot は `/en/` へ 302
- Preview デプロイ後に `curl -I -H "Accept-Language: ja"` / `-H "User-Agent: Googlebot"` で確認予定（PR Description / Issue Comment に追記）
- C1 fallback: Preview で middleware が動かない場合のみ実施（本時点では未実施）

## 実装過程での気づき

- Issue 本文の「script 完全不変」と「URL がグラウンドトゥルース」は両立しない。後者を優先し、全言語同一の最小 script 差分を入れた
- ルート `index.html` 削除後、`/` は middleware 必須。matcher を `/` のみにして redirect loop を回避
- Track A 文書の「ビルドプロセス導入は不可」は F2 により静的 HTML 生成ビルドに限り解禁、REPOSITORY-STRUCTURE を更新

## 後続への影響

- F3（sitemap / robots / llms.txt）が 6 URL 構造を前提に起票可能
- 以降の HTML 編集は `src/index.template.html` のみ（dev-flow 追記済み）
- Track B Phase B-Lang で言語追加時は `LANGS` / build スクリプト / middleware を拡張

## 残課題・申し送り

- Preview での middleware PoC 結果と外部 Validator 結果を Issue Comment に追記
- Bot rewrite（URL 維持）が必要なら `@vercel/functions` の `rewrite()` への切替 Issue
- OGP `image` / favicon は Issue H / Phase 10a

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: ファイル物理移動 + Build 初導入 + URL 構造変更 + middleware。L3 条件 2・3 に該当。パターン C Phase 分割が有効だった。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C3, C2
- 実装中に追加が必要になった Pattern: なし（C6 的な setLang UX 変更は C3 URL 構造の付随として実施）

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし（パス文字列維持、md5 不変）
- [x] i18n schema への影響なし（meta 消費のみ）
- [x] URL 構造への影響あり（意図どおり `/{lang}/`）
- [x] ビルドシステムへの影響あり（意図どおり新規導入）
- [x] AI 参照ドキュメント Category A への影響あり（ホワイトリスト 5 ファイル更新）
- [x] 既存ファイルパスへの依存関係が壊れていない（`<base href="/">` で担保）

### Phase 分割の妥当性
- 想定 Phase 数: 9（Phase 0–8）
- 実際の Phase 数: 9
- 相互依存の発生有無: なし（移動 → プレースホルダ → ビルド → 検証 → docs の順で分離できた）

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
