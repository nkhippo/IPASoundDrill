# VA opt-out — 実装レポート

## 関連 Issue / PR

- Issue: #46
- PR: #47

## Issue 背景（Issue 本文から要約）

E1 で Vercel Web Analytics の script 埋め込み後、開発者自身のアクセスが本番メトリクスを歪める問題が残った。公式オプトアウト UI が無いため、`?va-disable=1` で localStorage を立て `window.va` を no-op 化する機構をテンプレートに追加し、OPERATIONS § 5.6 に手順を書く。

## 実装内容

- `src/index.template.html`: Analytics script 直前に `va-disable` / `va-enable` IIFE を追加
- `docs/OPERATIONS.md`: § 5.5 直後に § 5.6「開発者除外」を追加（有効化・解除・原理・確認・注意・Track B）

## 変更ファイル

```
- src/index.template.html (M)
- docs/OPERATIONS.md (M)
- docs/cursor/reports/cursor-implementation-report-va-opt-out.md (A)
```

## デグレ防止検証

- Phase 0: 事前スナップショット（生成物除外）
- 既存 `<script defer src="/_vercel/insights/script.js">` は不変（直前に IIFE 追加のみ）
- OPERATIONS § 5.1–5.5 / § 6–10: 追記のみで既存文言不変
- LAUNCH-CHECKLIST: 未変更（Issue 指定）
- ローカル `npm run build`: 6 言語に `va-disable` 埋め込み、script 領域 md5 unique = 1
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

### grep 確認結果

- `src/index.template.html`: `va-disable` / `insights/script.js` 存在、IIFE が insights 直前
- `docs/OPERATIONS.md`: `### 5.6 開発者除外` 存在

## 動作確認

- 静的: IIFE 配置・§ 5.6 記述 OK
- 動的: マージ後に各デバイスで `https://ipasounddrill.app/?va-disable=1` を 1 回開き、Local Storage の `va-disable=1` を確認（Naoya）
- 既存機能への影響: Analytics 周辺の script 追加のみ
- データ整合性: 対象外

## 実装過程での気づき

- `defer` の insights スクリプトより先に同期 IIFE を置くことで、`window.va` の先行 no-op が効く構成になっている

## 後続への影響

- Track B の `@vercel/analytics` 導入時も同ロジックを流用可能（Issue 本文どおり追加実装不要）

## 残課題・申し送り

- マージ後: 所有デバイスごとに `?va-disable=1` を 1 回アクセス
- uBlock 等での `/_vercel/insights/*` ブロック併用は任意

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: テンプレートへの短い IIFE 追加 + OPERATIONS § 追記のみ。ビルド・URL・契約変更なし。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C2, C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし（クエリは opt-out 用のみ）
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（OPERATIONS のみ）
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
