# Dedicated MCP on Railway — 実装レポート

## 関連 Issue / PR
- Issue: #12
- PR: #(作成後)
- MCP リポ: https://github.com/nkhippo/ipasounddrill-mcp

## 実装内容
- ThinkGrindAi `backend` から MCP / OAuth / GitHub ツールのみ抽出した専用サーバーを `nkhippo/ipasounddrill-mcp` に配置
- Railway プロジェクト `IPASoundDrill` にデプロイ（ThinkGrindAi とは別プロジェクト）
- IPASoundDrill 専用 GitHub OAuth App + claude.ai コネクタ `IPASoundDrill GitHub` を登録
- `docs/OPERATIONS.md` / `CLAUDE.md` に MCP URL・コネクタ名を反映
- ツール説明文の `thinkgrindai` 表記を IPASoundDrill に修正（mcp リポ）

## 公開エンドポイント
- Service: `https://ipasounddrill-production.up.railway.app`
- MCP: `https://ipasounddrill-production.up.railway.app/mcp`
- Health: `https://ipasounddrill-production.up.railway.app/health`

## 動作確認（Naoya / Claude）
- [x] `/health` HTTP 200
- [x] well-known `issuer` = 本番 URL
- [x] claude.ai コネクタ経由で `create_issue` → Issue #13（試験）成功

## 環境変数（Railway）
- `NODE_ENV=production`
- `GITHUB_OWNER=nkhippo`
- `GITHUB_REPO=IPASoundDrill`
- `MCP_API_BASE_URL=https://ipasounddrill-production.up.railway.app`
- `GITHUB_CLIENT_ID` / `GITHUB_CLIENT_SECRET`（専用 OAuth App）

## 残課題・申し送り
- 試験 Issue #13 を Close（任意）
- OPERATIONS の Hostinger / Vercel 小文字 URL は Issue #10 / PR #11 側で別途統一中
