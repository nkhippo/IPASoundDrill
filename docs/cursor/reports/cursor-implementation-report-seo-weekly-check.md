# docs: add SEO weekly check + Track B SEO scope — 実装レポート

## 関連 Issue / PR

- Issue: #52
- PR: #53（open）

## Issue 背景（Issue 本文から要約）

Google Search Console の登録完了を受け、ローンチ後の SEO 観察を Naoya さん個人の記憶に依存させず、既存の週次 / 月次運用に組み込むための docs 更新。Vercel Web Analytics と Search Console の 2 系統を定常的に確認し、Track B 開始時に SEO 分析ダッシュボードや GSC `/` リダイレクトエラー由来の任意改善候補を忘れず再評価できる状態にすることが目的。

## 実装内容

- `docs/OPERATIONS.md` § 8.1 の週次チェックに Google Search Console 関連 5 項目を追加
- `docs/OPERATIONS.md` § 8.2 の月次チェックに SEO / Analytics 累積レビュー 3 項目を追加
- `docs/LAUNCH-CHECKLIST.md` の Track B スコープメモに Phase B-SEO を追加
- Phase B-SEO に SEO 分析ダッシュボードのスコープを記録
- Phase B-SEO に任意改善候補 2 件（sitemap x-default、Bot rewrite）と判断タイミングを記録
- 実施フロー 4 ステップと Track B 移行時の GSC 定常観察ルール 3 項目を記録

## 変更ファイル

```
- docs/OPERATIONS.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-seo-weekly-check.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショットとして tracked file 353 件の md5 ハッシュを `/tmp/issue-52/before-tracked.md5` に記録
- Phase 1: `docs/OPERATIONS.md` § 8.1 / § 8.2 へ Issue 指定項目のみ追記し、コミット `5684b12` で分離
- Phase 2: `docs/LAUNCH-CHECKLIST.md` Track B スコープメモへ Phase B-SEO のみ追記し、コミット `7c6e035` で分離
- Phase 3: `git diff --name-only origin/main...HEAD` で変更ファイルが対象 docs 2 件のみであることを確認（レポート追加前）
- Phase 4: 本レポート内に Complexity Retrospective を記録
- Phase 5: 本レポートを追加し、最終 md5 / grep 相当の静的検証でホワイトリスト外変更 0 件を確認
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

## 動作確認

- `docs/OPERATIONS.md` の diff が § 8.1 / § 8.2 の追記のみ: OK
- `docs/LAUNCH-CHECKLIST.md` の diff が Track B スコープメモへの追記のみ: OK
- Issue 指定の確認文字列（`Google Search Console`, `Phase B-SEO`, `sitemap.xml の x-default`, `Bot 向け middleware.ts を 302`）の存在確認: OK（`Google Search Console` は `docs/OPERATIONS.md` で 5 件）
- 既存機能への影響: なし（docs-only）
- データ整合性: 対象外（wordlist / data / i18n / gas 未変更）

## 実装過程での気づき

- Issue 本文の追記位置と既存ファイルの構造は一致しており、追加位置の解釈分岐は発生しなかった。
- `docs/LAUNCH-CHECKLIST.md` では Track B スコープメモの末尾が `Phase B-Lang` の直後だったため、Issue 指定どおり同セクション内に Phase B-SEO を追加した。
- 現在の自動化環境で利用可能な GitHub 書き込み系 MCP は PR 作成のみで、Issue Comment 投稿用ツールは提供されていなかった。

## 後続への影響

- 週次 / 月次の SEO 運用チェックが `docs/OPERATIONS.md` から参照可能になる。
- Track B の SEO 分析ダッシュボード Issue 起票時に、今回追加した Phase B-SEO 節をスコープメモとして再利用できる。
- sitemap x-default と Bot rewrite の任意改善候補を、ローンチ後の GSC データ蓄積後に独立 Issue として判断できる。

## 残課題・申し送り

- SEO 分析ダッシュボード、sitemap x-default 変更、Bot rewrite 変更は本 Issue の非対象範囲のため未実装。
- Ahrefs Webmaster Tools アカウント作成は Naoya さん手動作業。
- Issue Comment での開始宣言 / Phase 報告 / PR URL 報告は、現在の Cursor Automation Tools に Issue Comment 投稿ツールがないため未実施。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: docs 2 ファイルへの追記と実装レポート追加のみで、ランタイム契約・URL 構造・ビルド・i18n schema・プロダクト挙動への変更は発生しなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響は Issue 指定の `docs/OPERATIONS.md` / `docs/LAUNCH-CHECKLIST.md` 追記のみ
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 6
- 実際の Phase 数: 6
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
