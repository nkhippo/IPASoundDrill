---
id: pj-2026-07-21-117c
aliases:
- pj-2026-07-21-117c
title: 'governance: .cursor/rules/dev-flow.mdc の Step 2 SSoT 化 + CURSOR-INSTRUCTION-GUIDE stub 削除予定日注記 (#117) — 実装レポート'
created: '2026-07-21'
---

# governance: .cursor/rules/dev-flow.mdc の Step 2 SSoT 化 + CURSOR-INSTRUCTION-GUIDE stub 削除予定日注記 (#117) — 実装レポート

## 関連 Issue / PR

- Issue: #117
- PR: draft PR（作成後に GitHub 上で参照）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #114 / PR #116 のレビューで、`.cursor/rules/dev-flow.mdc` に Step 2 コメント形式が hardcode されたまま残っている点と、`docs/CURSOR-INSTRUCTION-GUIDE.md` の MOVED stub に削除予定がない点が残課題として指摘された。改修分類は L1 × C1、堅固化パターン B。Runtime code / i18n schema / URL 構造には触れず、governance v2 の SSoT 化と保守性を仕上げることが目的。

## 実装内容

- `.cursor/rules/dev-flow.mdc` の Step 2 詳細フォーマットを削除し、`AGENTS.md` の「Step 2: 設計懸念点検コメント (agent-agnostic)」への参照に置き換えた。
- Phase 1 の置換方針はオプション A を採用した。Cursor 固有に残す必要がある内容は見出し直下の実施タイミングのみで、ヘッダー / 末尾 / セクション構成 / 判定基準は AGENTS.md に集約する方が SSoT 目的に合うため。
- `docs/CURSOR-INSTRUCTION-GUIDE.md` の MOVED 見出し直下に `削除予定: 2026-10-21` の注記を追加した。
- Phase 2 の削除予定日は候補 1 を採用した。Issue #114 のリネームから 90 日後であり、Issue 本文の推奨と Q4 レビュー時期に合うため。

## 変更ファイル

```
- .cursor/rules/dev-flow.mdc (M)
- docs/CURSOR-INSTRUCTION-GUIDE.md (M)
- docs/agent-reports/cursor-issue-117-dev-flow-step2-ssot.md (A)
```

Issue の実装対象ファイルは 2 件。上記 3 件目は AGENTS.md で必須化されている実装レポート。

## デグレ防止検証

- 変更対象を Issue 指定の 2 ファイルと必須実装レポートに限定した。
- 事前に tracked file md5 baseline を `/tmp/issue-117/before-tracked.md5` に取得した。
- ホワイトリスト外の差分がないことを `git diff --name-only` と md5 差分で確認する。
- 実装中の自己判断による追加変更: なし（Issue の判断ポイント 3 件のみ選択）。
- 実装中に発覚した懸念: なし。

## 動作確認

- `.cursor/rules/dev-flow.mdc` の Step 2 hardcode 詳細が `AGENTS.md` 参照に置き換わっていることを確認。
- `docs/CURSOR-INSTRUCTION-GUIDE.md` に「削除予定: 2026-10-21」の注記が追加されていることを確認。
- Runtime code / i18n schema / URL 構造への影響: なし。
- データ整合性: 対象外（wordlist / data / i18n / gas / fonts 非接触）。
- ブラウザ動作確認: 対象外（docs / governance のみ、Runtime UI 非接触）。

## 実装過程での気づき

- この環境の Cursor Automation Tools には Issue Comment 投稿ツールが公開されておらず、`gh` CLI は読み取り専用として扱う必要があるため、Issue への作業開始宣言と PR URL 報告は投稿できなかった。PR 本文と最終報告にその旨を記録する。
- `.cursor/rules/dev-flow.mdc` の Step 2 には Cursor 固有の詳細フォーマットが残っていたが、AGENTS.md に同等かつ agent-agnostic な正本があるため、詳細全削除で重複を解消できた。

## 後続への影響

- Step 2 コメント形式の更新は今後 `AGENTS.md` 側だけを変更すればよくなり、Cursor 固有ルールとの二重管理が解消される。
- `docs/CURSOR-INSTRUCTION-GUIDE.md` stub は 2026-10-21 以降の follow-up Issue で削除可否を判断する。

## 残課題・申し送り

- 実際の `docs/CURSOR-INSTRUCTION-GUIDE.md` 削除は本 Issue のスコープ外。
- Issue Comment 投稿はツール制約により未実施。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 既存 2 ファイルの軽微な docs / governance 文言変更と必須レポート追加のみで、Runtime / i18n / URL / ビルド契約に触れていない。Step 2 の運用再設計ではなく、既存正本への参照化に留まるため L1 で妥当。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への変更は Issue スコープ内（`.cursor/rules/dev-flow.mdc` の Step 2 参照化）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 2
- 実際の Phase 数: 2
- 相互依存の発生有無: なし。Phase 1（Step 2 SSoT 化）と Phase 2（MOVED stub 削除予定注記）は独立して完了した。

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし。
