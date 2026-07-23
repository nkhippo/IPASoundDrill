---
id: pj-2026-07-23-f142
aliases:
- pj-2026-07-23-f142
title: 'Production favicon 配線 (#142) — 実装レポート'
created: '2026-07-23'
---

# Production favicon 配線 (#142) — 実装レポート

## 関連 Issue / PR

- Issue: #142
- PR: draft PR（作成後に GitHub 上で参照）
- Agent: codex

## Issue 背景（Issue 本文から要約）

本番HTMLのheadに favicon 宣言がなく、CD参照用の `docs/claude-design/favicon.svg` も配信経路に接続されていなかった。Issueの事前分類は L1 × C2 + C1、堅固化パターン A + B、CD修正不要。CD正典の意匠を変更せず、全6言語HTMLからルート相対パスで参照できるproduction assetを追加する。

## 実装内容

- CD正典とバイト単位で同一の `favicon.svg` をリポジトリルートへ配置した
- `src/index.template.html` のheadに `rel="icon"` / `type="image/svg+xml"` / `href="/favicon.svg"` を追加した
- `docs/REPOSITORY-STRUCTURE.md` のdirectory treeにproduction faviconを追加した
- PNG fallback、apple-touch-icon、manifestは非対象範囲を広げないため追加しなかった

## 変更ファイル

```
- favicon.svg (A)
- src/index.template.html (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/agent-reports/codex-issue-142-production-favicon.md (A)
```

## デグレ防止検証

- `origin/main` から隔離したworktreeで実装した
- Phase 0で `vercel.json`、build script、`fonts/` のルート配信方式を確認し、配置判断をIssueコメントへ投稿した
- `git diff --name-only origin/main` で変更がIssueホワイトリストと必須実装レポートに限定されることを確認した
- CD正典のmd5は実装前後とも `a4841b81f07ffdd9b37140dcfb3964f4`
- `cmp favicon.svg docs/claude-design/favicon.svg`: 完全一致
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: apply patchで新規SVG末尾に改行が加わりmd5不一致となったため、正典をバイト単位でコピーして解消した

## 動作確認

- `npm run build`: 6言語すべて成功
- 6言語の生成 `index.html` すべてで `rel="icon" type="image/svg+xml" href="/favicon.svg"` を確認
- `python3 tools/validate_i18n.py`: hard errorなし（既存warning 5件）
- ローカルHTTPサーバー上の日本語版・英語版で、favicon linkが `http://localhost:8081/favicon.svg` に解決されることをブラウザ確認
- ブラウザから `GET /favicon.svg` が200で返ることを確認
- 日本語版・英語版ともブラウザconsole error 0件
- `git diff --check`: 成功
- 既存機能への影響: なし
- データ整合性: Runtime data / i18n schemaは変更なし

## 実装過程での気づき

- Vercelはリポジトリルートをoutput directoryとして配信し、言語rewriteは静的な `/favicon.svg` と競合しない
- build scriptはテンプレートを6言語ディレクトリへ複製するため、ルート相対hrefをテンプレートに1回追加すれば全言語へ反映される

## 後続への影響

- PR Previewで6言語のタブアイコンを最終目視できる
- 将来apple-touch-iconやPWA manifestが必要になった場合は、PNG生成・manifest整備を別Issueで扱う

## 残課題・申し送り

- Vercel Preview上での6言語favicon表示確認はPR作成後に実施可能
- モバイルSafariのホーム画面専用アイコンは、PNG fallbackを追加していないため本Issueの対象外

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 新規静的アセット1件、head宣言1件、構成表1行の局所変更で、Runtime data・URL構造・ビルド方式を変更していない

### 事前 Change Pattern vs 実際

- 事前 Pattern: C2 + C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8パスへの影響なし
- [x] i18n schemaへの影響なし
- [x] URL構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI参照ドキュメントCategory Aへの影響を `docs/REPOSITORY-STRUCTURE.md` に反映済み
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 2（新規asset + 既存ファイル編集）
- 実際の Phase 数: 2
- 相互依存の発生有無: favicon hrefとroot assetの対応のみ

### 総合判定

- [x] 事前分類妥当、PR作成可
- [ ] Level昇格提案、Issue Commentで報告して中断
- [ ] Pattern追加提案、Issue Commentで報告して中断

### 昇格・追加提案がある場合の詳細

なし
