---
id: pj-2026-07-12-a915
aliases:
- pj-2026-07-12-a915
title: F3 sitemap / robots / llms — 実装レポート
created: '2026-07-12'
---

# F3 sitemap / robots / llms — 実装レポート

## 関連 Issue / PR

- Issue: #41
- PR: #42

## Issue 背景（Issue 本文から要約）

F2 で 6 言語 URL 構造が本番化した後、Phase 5 の残りとして sitemap.xml / robots.txt / llms.txt を静的配置する。検索エンジンと AI クローラーが言語別 URL を発見・要約できるようにし、LAUNCH-CHECKLIST Phase 5 を完了させる。llms.txt は英語版のみ（各言語版は Track B Phase B-Lang）。

## 実装内容

- ルートに `sitemap.xml`（6 URL × 各 7 hreflang alternates）を追加
- ルートに `robots.txt`（Allow: / + Sitemap 参照）を追加
- ルートに `llms.txt`（llmstxt.org 形式の英語サマリ）を追加
- `docs/LAUNCH-CHECKLIST.md` で Phase 5 を完了マーク、F3 URL・完了定義を更新

## 変更ファイル

```
- sitemap.xml (A)
- robots.txt (A)
- llms.txt (A)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-f3-sitemap-robots-llms.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショット（生成物ディレクトリ除外、354 ファイル）
- Phase 1: 3 ファイル新規追加のみ（md5 diff = 追加 3 行）
- F2 成果物（`src/index.template.html` / build / middleware / vercel.json）: 不変
- Runtime data contract: 触っていない
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

### grep 確認結果

- `sitemap.xml`: `<url>` × 6、`hreflang=` × 42（6 × 7）
- `robots.txt`: `Sitemap: https://ipasounddrill.app/sitemap.xml`
- `llms.txt`: `# IPA Sound Drill` + Modes / Languages / URLs セクション
- `LAUNCH-CHECKLIST`: `Phase 5: SEO 基本セット ✅`

## 動作確認

- 静的ファイル内容: Issue 仕様どおり
- Production 到達確認: マージ後に `https://ipasounddrill.app/{sitemap.xml,robots.txt,llms.txt}` が 200 であること（Preview は SSO の可能性あり）
- 既存機能への影響: なし
- データ整合性: 対象外

## 実装過程での気づき

- Issue は llms.txt 英語版のみ。LAUNCH-CHECKLIST 旧タスク文言の「6 言語版」は Issue 方針に合わせて英語版完了に更新
- REPOSITORY-STRUCTURE へのツリー追記は Issue で「更新不要」と明示されているため触っていない

## 後続への影響

- Phase 5 完了 → Phase 6（法務）以降へ進める
- Track B Phase B-Lang で言語追加時は sitemap / llms の拡張のみ

## 残課題・申し送り

- Google Search Console への sitemap 登録は Naoya 手動（Phase 11 推奨）
- Twitter / Rich Results の目視は F2 残課題のまま

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 静的 3 ファイル新規 + LAUNCH-CHECKLIST 編集のみ。ビルド・URL 構造変更・ランタイム契約変更なし。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C3, C1（Issue 分類どおり）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし（既存 `/{lang}/` を宣言するだけ）
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（LAUNCH-CHECKLIST のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 6（Phase 0–5）
- 実際の Phase 数: 6
- 相互依存の発生有無: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
