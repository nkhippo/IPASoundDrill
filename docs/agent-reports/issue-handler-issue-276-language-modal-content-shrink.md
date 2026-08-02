# fix(ui): 言語モーダル開閉時に背面コンテンツが縮小する (#276) — 実装レポート

## 関連 Issue / PR

- Issue: #276
- PR: (作成後に追記)
- Agent: claude-code (issue-handler)

## Issue 背景（Issue 本文から要約）

**Complexity Level**: L1（単一ファイル・単一関心の CSS セレクタ修正） / **Change Pattern**: C6（Product behavior / UX）

言語設定モーダル（`#languagePage`）を開くと背面のコンテンツ（hero セクション等）が縮小して見える現象が発生していた。原因は CSS セレクタ `.info-page`（`apps/web/src/index.template.html` line 312 付近）が `<body class="info-page">` と `<section class="info-page">` の両方にマッチしていたこと。`setExclusivePage("language")` が `body.classList.toggle("info-page", true)` を呼ぶと、body に `position:fixed; inset:0`・`overflow:hidden; display:flex`・`padding:56px 16px 24px`・半透明背景が適用され、通常フローの背面コンテンツが崩壊していた。

## 実装内容

- `apps/web/src/index.template.html` 内の `.info-page` セレクタ（line 312, 313, 318, 319, 320, 322, 323, 325, 326）を `section.info-page` に変更し、`<body>` にはマッチしないようスコープを限定。
- line 311 の `body.vocab-page,body.symbol-picker-page,body.progress-page,body.info-page{...}` は意図的な body セレクタのため変更なし。
- JavaScript（`setExclusivePage` 等）は変更なし。

## 変更ファイル

```
- apps/web/src/index.template.html (M)
- docs/agent-reports/issue-handler-issue-276-language-modal-content-shrink.md (A)
```

## デグレ防止検証

- 変更は CSS セレクタのスコープ限定のみ（`.info-page` → `section.info-page`）。プロパティ値・カスケード順序・他ルールとの優先度関係は変更していない。
- `.vocab-page,.symbol-picker-page,.progress-page` は今回のスコープ外（`section` 限定はせず、Issue の非対象範囲どおり据え置き）。
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: なし

## 動作確認

- Issue 完了定義 1〜4（言語モーダル開閉で背面コンテンツのレイアウトが変化しない／「IPAとは？」モーダルも同様／SP・PC 両方）は、Vercel branch preview URL でのブラウザ確認を Naoya に依頼（本エージェントはブラウザ実機確認手段を持たないため、コード上のセレクタスコープ変更の正しさをレビューし、PR コメントでスクリーンショット取得の可否を明記）。
- 既存機能への影響: `body.info-page` を参照する line 311 のルールは変更していないため、body 単体への配色影響（`background:var(--paper);color:var(--ink)`）は維持される。
- データ整合性: 対象外（CSS のみ、i18n・データ契約に触れていない）

## 実装過程での気づき

- 特記事項なし。Issue の修正方針どおり、指定された行の `.info-page` を `section.info-page` に置換するのみで完結した。

## 後続への影響

- なし（Issue 本文の通り）

## 残課題・申し送り

- Change Pattern C6 のためスクショ添付が必須。本エージェントはブラウザ操作手段を持たないため、PR コメントでスクショ未添付である旨を明記し、Naoya の実機/プレビュー確認を Rv の前提とする。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一ファイル（`apps/web/src/index.template.html`）内の CSS セレクタ修正のみで完結し、他ファイル・JS ロジック・データ契約への影響はなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C6（Product behavior / UX）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
