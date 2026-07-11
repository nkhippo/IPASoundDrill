# Vercel migration (docs update) — 実装レポート

## 関連 Issue / PR
- Issue: #4
- PR: #(作成後)

## 実装内容
- ホワイトリスト内ドキュメントに対して調整済み置換ルールを適用
  - 本番 URL: `nkhippo.github.io/IPASoundDrill` → `ipasounddrill.app`
  - GitHub リポ URL: `github.com/nkhippo/ipasounddrill` → `github.com/nkhippo/IPASoundDrill`
  - リポ名の正を `IPASoundDrill` に確定（`ipasounddrill` へのリネームは実施しない）
- README.md を Vercel + カスタムドメイン構成に更新（Live / clone 等）

## 変更ファイル
```
README.md
docs/LAUNCH-CHECKLIST.md
docs/OPERATIONS.md
docs/README.md
docs/SPECIFICATION.md
docs/cursor/reports/cursor-implementation-report-vercel-migration.md
```

## デグレ防止検証
- Phase 1: 事前スナップショット、全ファイル 331 個の md5 ハッシュを記録
- Phase 2: ホワイトリスト外 23 件は Naoya 判断により残置（過去履歴・tests）
- Phase 3: ホワイトリストのみ機械的置換 + LAUNCH-CHECKLIST リネーム方針反映
- Phase 4: ブラックリストのハッシュ検証で不変性を確認
- Phase 5: Naoya さんに diff を目視確認いただき OK 承認
- Phase 6: README C-2 を Naoya 承認後にコミット
- 自己判断による追加変更: 0 件（置換ルールは Naoya の `IPASoundDrill` 正方針で調整）

## 動作確認
- Markdown レンダリング: OK
- 既存機能への影響: なし（index.html / data / scripts / gas/*.gs / i18n / fonts 未変更）
- データ整合性: 対象外（wordlist 未変更）

## 残課題・申し送り
- Vercel 接続後の URL 検証: Naoya さんが Phase D-F で実施
- GitHub Pages workflow 削除は Vercel 動作 24 時間確認後の別 Issue
- OPERATIONS.md への実 URL 記入は Phase G の別 Issue（または手動）
- 過去レポート内の Pages URL は意図的に未更新

## 今後の派生 Issue 候補
- chore: remove GitHub Pages workflow after Vercel stable
- docs: update OPERATIONS with actual URLs
