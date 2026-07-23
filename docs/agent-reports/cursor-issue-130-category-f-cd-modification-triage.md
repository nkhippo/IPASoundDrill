---
id: pj-2026-07-23-130f
aliases:
- pj-2026-07-23-130f
title: 'Add Category F (CD modification triage) to DOCUMENT-MAP.md and enforce in CLAUDE.md / AGENTS.md (#130) — 実装レポート'
created: '2026-07-23'
---

# Add Category F (CD modification triage) to DOCUMENT-MAP.md and enforce in CLAUDE.md / AGENTS.md (#130) — 実装レポート

## 関連 Issue / PR

- Issue: #130
- PR: #132（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #128 の Phase 0 で CD と実装の乖離が見つかり、UI 改修 Issue 起票時に CD の状態を事前判定する運用が不足していることが明確になった。事前分類は L1 / C1(Docs)、堅固化パターン B、CD 修正判定は Docs 改修のため該当なし。今回の目的は `docs/DOCUMENT-MAP.md` に Category F を追加し、`CLAUDE.md` / `AGENTS.md` で CD 修正判定を必須化すること。

## 実装内容

- `docs/DOCUMENT-MAP.md` に Category F（CD 修正判定）を追加
- Category 定義表に F 行を追加し、Category A-F 表記へ最小更新
- `CLAUDE.md` の Claude Design 参照運用ルールに CD 修正判定(Category F)を追加
- `CLAUDE.md` の Issue 起票時参照ルールに Category F の改修分類ブロック記載義務を追加
- `AGENTS.md` の Critical constraints と Before any implementation に Category F 参照義務を追加

## 変更ファイル

```
- AGENTS.md (M)
- CLAUDE.md (M)
- docs/DOCUMENT-MAP.md (M)
- docs/agent-reports/cursor-issue-130-category-f-cd-modification-triage.md (A)
```

## デグレ防止検証

- Phase 0: `git ls-files -z | xargs -0 md5sum | sort` で tracked 432 files の md5 baseline を記録
- Phase 1: Issue ホワイトリストの 3 ファイルに Category F 関連の最小追記を実施
- Phase 2: AGENTS.md の現行ルールに従い、実装レポートを `docs/agent-reports/` に追加
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: Issue 本文のホワイトリストは 3 ファイルのみだが、AGENTS.md の現行必須ルールにより実装レポートを追加

## 動作確認

- `docs/DOCUMENT-MAP.md` の Category F セクションが Category E の次に配置されていることを確認
- `CLAUDE.md` / `AGENTS.md` の追記内容が Category F の 3 分類（A/B/C）と整合していることを確認
- Runtime data / i18n / URL / build への変更なし
- 既存機能への影響: なし（docs-only）
- データ整合性: 対象外

## 実装過程での気づき

- `AGENTS_CODEX.md` は存在しなかったため更新対象外。
- Automation Tools には Issue Comment 投稿ツールがなく、開始宣言・PR URL 報告は PR body / final response 側で補足する運用になる。
- `docs/README.md` と `docs/CHANGE-CLASSIFICATION.md` に Category A-E 表記が残るが、Issue のブラックリスト対象のため本 PR では未変更。

## 後続への影響

- 今後の UI 改修 Issue では、改修分類ブロックに CD 修正判定（A. CD 修正必須 / B. CD 意図的乖離 / C. CD 修正不要 / UI 非影響時は該当なし）を明記する運用になる。
- `docs/claude-design/UPDATE-GUIDE.md` 配置後は、Category F から同ガイドを参照する流れが有効になる。

## 残課題・申し送り

- `docs/README.md` と `docs/CHANGE-CLASSIFICATION.md` の Category A-E 表記は、別 Issue で整合更新するか Naoya さん判断が必要。
- `docs/claude-design/UPDATE-GUIDE.md` の配置は Issue #130 の非対象範囲。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 変更は docs-only のルール追記で、Runtime / UI / build / i18n 契約に影響しなかった。既存ファイル編集は堅固化パターン B の範囲内で完了した。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（Issue 明示の Category A docs 更新のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 2（docs 更新 + 実装レポート追加）
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
