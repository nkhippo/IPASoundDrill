---
id: pj-2026-07-11-4fde
aliases:
- pj-2026-07-11-4fde
title: Vercel migration (docs update) — 実装レポート
created: '2026-07-11'
---
# Vercel migration (docs update) — 実装レポート

## 関連 Issue / PR
- Issue: #4
- PR: #5（マージ済み）

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

## Naoya 手動フェーズ（Phase D–F）— 完了記録（2026-07-11）

Cursor 実装（Phase C / C-2）とは別枠。Naoya が実施し、本番到達を確認済み。

| Phase | 内容 | 結果 |
|-------|------|------|
| D | Vercel プロジェクト作成・`IPASoundDrill` リポ接続・Production デプロイ | OK（`ipa-sound-drill.vercel.app` で UI 確認） |
| E | カスタムドメイン `ipasounddrill.app` / `www.ipasounddrill.app` を Vercel に追加、DNS 設定 | OK |
| F | `https://ipasounddrill.app` で現行 UI 表示を確認 | OK |

### DNS（レジストラ: Namecheap / BasicDNS）

| Type | Host | Value | 備考 |
|------|------|--------|------|
| A | `@` | `216.198.79.1` | Vercel 推奨 IP（旧 `76.76.21.21` から差し替え済み） |
| CNAME | `www` | `52646c530fa600df.vercel-dns-017.com.` | Vercel 表示値どおり |

- Parking / URL Redirect の既存レコードは削除済み
- リポ名は `IPASoundDrill` のまま（`ipasounddrill` へのリネームは実施しない）
- ドメイン登録先は Namecheap（OPERATIONS.md 記載の Hostinger とは異なる。Phase G でマニュアル更新推奨）

## 残課題・申し送り
- GitHub Pages workflow 削除: Issue #7 / PR #8 で完了
- OPERATIONS.md の Namecheap / 実 DNS / ダッシュボード URL: Issue #10 で反映
- Vercel Dashboard の正: `https://vercel.com/nkhippo/ipa-sound-drill`（プロジェクト名はハイフン区切り）
- Branch Protection / Cursor Automation Secrets: **2026-07-12 完了**（Rulesets + Repository secrets。Automation webhook 疎通は `resource_exhausted` のためエージェント起動は見送り・現状 OK）
- 過去レポート内の Pages URL は意図的に未更新（歴史として保持）

## 今後の派生 Issue 候補
- （任意）Cloud Agent 枠に余裕が出たら `ready-for-cursor` end-to-end 再テスト
- （完了）chore: remove GitHub Pages workflow
- （完了）docs: update OPERATIONS with Namecheap DNS（Issue #10）
- （完了）chore: enable branch protection + Cursor automation secrets on main
