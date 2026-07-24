---
id: pj-2026-07-24-issue153
aliases:
- pj-2026-07-24-issue153
title: '受け入れアサーション精緻化 (#153) — 実装レポート'
created: '2026-07-24'
---

# 受け入れアサーション精緻化 (#153) — 実装レポート

## 関連 Issue / PR

- Issue: #153
- PR: draft PR（本レポート作成後に作成）
- Agent: codex

## Issue 背景（Issue 本文から要約）

Issue #147 の Rv では構造 grep が PASS しても実機で visibility の不備が見つかり、定義存在と動作時表示を分けて検証する必要性が明らかになった。Issue #150 / PR #152 で初めて運用された CDP 検証を共通ルールへ正典化し、過大 regex と多言語検索漏れも同時に防ぐ。事前分類は L1 / C1、Category F は C（CD 修正不要）。

## 実装内容

- Rv 観点 10 を grep と動作時 visibility の結果記録へ拡張した。
- C6 かつ動作時状態を宣言する Issue への適用条件を明文化した。
- matchMedia、querySelector、getComputedStyle、getBoundingClientRect を組み合わせる判定例を追加した。
- Node.js + Playwright と Python HTTP server + CDP のテンプレートを追加した。
- PC 1440 × 900 / SP 390 の結果表フォーマットを追加した。
- SRS 固有語、一般語の分離、意味分類、6 言語漏れチェックを追加した。

## 変更ファイル

```
- docs/dev_project_common.md (M)
- docs/agent-reports/cursor-issue-153-improvement-1.md (A)
```

## デグレ防止検証

- Phase 0: main の対象ファイル SHA とブラックリストを基準化。
- Phase 1-2: GitHub branch 上で対象 2 ファイルだけを更新。
- Phase 3: main と作業 branch の commit / tree 比較で変更ファイルが上記 2 件だけであることを確認する。これによりブラックリストと Runtime data contract の blob が完全不変であることを確認する。
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: PR #152 レポートには評価 API と結果表はあるが完全なスクリプト本文がないため、同じ検証方式を再利用可能な汎用テンプレートへ展開した。

## 動作確認

| 受け入れアサーション | 結果 |
|---|---:|
| `動作時 visibility|Runtime visibility|matchMedia|getComputedStyle|getBoundingClientRect` | 15 |
| `CDP|Puppeteer|Playwright` | 11 |
| `固有語|過大 regex|一般語|SRS 固有|spacedRepetition` | 9 |
| `複習|繁体字|多言語漏れ|複数言語` | 3 |
| `観点 10/13|visibility 検証結果の記録` | 6 |
| `^##` 見出し | 6（変更前 5、増加） |
| 既存 § キーワード | 9（全て残置） |

- Markdown コード例: 4 API と viewport 切替を目視照合済み
- 既存機能への影響: なし（docs のみ）
- データ整合性: 対象外。Runtime data / i18n は不変

## 実装過程での気づき

- 現行文書には Rv 12 観点表そのものはなく観点 13 の参照だけがあるため、既存の Rv 手順内へ「観点 10」を明示して整合させた。
- PR #152 の結果表を、後続 Issue がそのまま使える入力・評価・記録のテンプレートへ一般化した。

## 後続への影響

- Phase 1-G を含む C6 UI Issue で、構造 grep と PC / SP の動作時 visibility を一組の受け入れ検証として利用できる。
- SRS 等の削除掃討で一般語を誤検知せず、6 言語の検索漏れを明示的に点検できる。

## 残課題・申し送り

- なし

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 共通運用文書 1 ファイルへの追記とレポート追加のみで、Runtime / build / schema への影響がない。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A は Issue 指定どおり dev_project_common のみ更新
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 5（Phase 0-4）
- 実際の Phase 数: 5（Phase 0-4）
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
