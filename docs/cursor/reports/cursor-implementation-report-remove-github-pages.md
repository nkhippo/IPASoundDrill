# Remove GitHub Pages workflow — 実装レポート

## 関連 Issue / PR
- Issue: #7
- PR: #(作成後)

## 実装内容
- `.github/workflows/static.yml` を削除
- GitHub Pages デプロイの停止（Vercel + カスタムドメインに完全移行）

## 変更ファイル
- `D .github/workflows/static.yml`
- `A docs/cursor/reports/cursor-implementation-report-remove-github-pages.md`

## 動作確認
- 削除以外の変更なし（`git diff --cached --name-status` で確認）
- 他 workflow への影響なし（approval / label-pr-needs-review / trigger-cursor-on-ready を保持）

## 残課題・申し送り
- Naoya さん: Settings > Pages > Source を "None" に変更（手動）
- 旧 URL `https://nkhippo.github.io/IPASoundDrill/` が 404 / redirect になることを確認
- `https://ipasounddrill.app` の動作が継続することを確認
