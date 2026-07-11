# Repo name unification — 実装レポート

## 関連 Issue / PR
- Issue: #10
- PR: #(作成後)

## 実装内容
- Rule 1: `CLAUDE.md` / `.cursor/rules/dev-flow.mdc` の `nkhippo/ipasounddrill` を `nkhippo/IPASoundDrill` に統一
- Rule 2: `docs/OPERATIONS.md` を Namecheap + 実 DNS 値に更新
- Rule 3: `docs/OPERATIONS.md` 主要ダッシュボード URL を実値で更新（Vercel: `ipa-sound-drill`）
- Rule 4: `docs/LAUNCH-CHECKLIST.md` Day 1/2 進捗を反映
- 過去レポート: `cursor-implementation-report-vercel-migration.md` の残課題を現状更新（歴史 before→after 行は保持）

## 変更ファイル
```
.cursor/rules/dev-flow.mdc
CLAUDE.md
docs/LAUNCH-CHECKLIST.md
docs/OPERATIONS.md
docs/cursor/reports/cursor-implementation-report-vercel-migration.md
docs/cursor/reports/cursor-implementation-report-repo-name-unification.md
```

## デグレ防止検証
- Phase 1: 全ファイル 332 個の md5 ハッシュを記録（main 最新化後に再取得）
- Phase 2: Naoya 承認（Vercel=`ipa-sound-drill`、過去レポート更新、BP/Secrets は実態どおり未完了表記）
- Phase 4: 意図編集ファイル以外のブラックリスト不変性を確認
- Phase 6: Naoya さん diff 目視承認済み（diff OK）
- 自己判断による追加変更: 0 件（方針は Naoya Comment に準拠）

## 動作確認
- Markdown レンダリング: OK
- 既存機能への影響: なし（コード / データ / GAS / i18n / fonts 未変更）

## 残課題・申し送り
- Branch Protection on `main`: **未設定**（長期安定のため要設定）
- GitHub Secrets `CURSOR_AUTOMATION_WEBHOOK_*`: **未登録**（要設定）
- Issue D: 専用 MCP サーバー Railway 立ち上げ

## 今後の派生 Issue 候補
- chore: enable branch protection + Cursor automation secrets on main
