---
id: pj-2026-07-21-c114
aliases:
- pj-2026-07-21-c114
title: 'governance v2: AGENTS.md 拡張・DOCUMENT-MAP § 4 縮約・.github/ templates 新設・Step 2 コメント agent-agnostic 化 (#114) — 実装レポート'
created: '2026-07-21'
---

# governance v2: AGENTS.md 拡張・DOCUMENT-MAP § 4 縮約・.github/ templates 新設・Step 2 コメント agent-agnostic 化 (#114) — 実装レポート

## 関連 Issue / PR

- Issue: #114
- PR: #TBD（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #114 は Codex / Cursor 並行検証で見えた governance の穴を埋めるための L2 × C1/C7 改修。PR description template の重複、Runtime UI 動作検証の粒度不足、md5 baseline の明文化不足、Step 2 コメントの Cursor 固定、DOCUMENT-MAP § 4 の参照表過多、CURSOR-INSTRUCTION-GUIDE.md の Cursor 特化を、Runtime code / i18n schema / URL 構造に触れずに整理することが目的だった。

## 実装内容

- `.github/PULL_REQUEST_TEMPLATE.md` を新設し、AGENTS.md 内の PR description template 本文を参照に置換
- `.github/ISSUE_TEMPLATE/agent-task.md` を新設し、改修分類ブロックを pre-fill した classic markdown 形式の Issue template を追加
- AGENTS.md に Runtime UI 動作検証、md5 baseline 検証、Scaffolding tool noise cleanup、Step 2 design concern comment format を追加
- `docs/CURSOR-INSTRUCTION-GUIDE.md` を `docs/agent-instruction-guide.md` にリネームし、本文を agent-agnostic 化
- DOCUMENT-MAP.md § 4 を共通必須参照 + 追加参照に縮約し、Category A/E と § 3 を agent-reports 前提へ更新
- REPOSITORY-STRUCTURE.md / docs/README.md / DEV-GUARDRAILS.md / 関連正本 docs の参照を `docs/agent-reports/` と `docs/agent-instruction-guide.md` に整合

## 変更ファイル

```
- .github/ISSUE_TEMPLATE/agent-task.md (A)
- .github/PULL_REQUEST_TEMPLATE.md (A)
- AGENTS.md (M)
- CLAUDE.md (M)
- docs/CHANGE-CLASSIFICATION.md (M)
- docs/DEV-GUARDRAILS.md (M)
- docs/DOC-SYNC-PLAYBOOK.md (M)
- docs/DOCUMENT-MAP.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/README.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/CURSOR-INSTRUCTION-GUIDE.md -> docs/agent-instruction-guide.md (R/M)
- docs/agent-reports/cursor-issue-114-governance-v2.md (A)
```

## デグレ防止検証

- Phase 0: `/tmp/issue-114/before-tracked.md5` に tracked files の md5 baseline を取得
- Markdown reference validator: `python3 scripts/validate/validate-markdown-refs.py --changed-files /tmp/issue-114/changed-md.txt --broken-refs migration/broken-refs.csv` が PASS
- Runtime contract / i18n / URL / build 設定への net diff がないことを `git diff --name-only origin/main...HEAD` の対象 path 照合で確認
- 実装中の自己判断による追加変更: 参照切れ防止のため、Issue 指定ファイルに加えて `CLAUDE.md`, `docs/CHANGE-CLASSIFICATION.md`, `docs/DOC-SYNC-PLAYBOOK.md`, `docs/LAUNCH-CHECKLIST.md` の旧 `CURSOR-INSTRUCTION-GUIDE.md` 参照を更新
- 実装中に発覚した懸念: validator 実行で生成された `scripts/lib/__pycache__/` が初回コミットに入ったため、直後の追加コミットで net diff から削除済み

## 動作確認

- `.github/PULL_REQUEST_TEMPLATE.md`: AGENTS.md 旧 PR description template と同一構造を保持
- `.github/ISSUE_TEMPLATE/agent-task.md`: 改修分類ブロック、完了定義、検証、非対象範囲、参照 docs を pre-fill
- `AGENTS.md`: Issue 完了定義の 4 セクション追加と PR template 参照化を確認
- `docs/DOCUMENT-MAP.md`: § 4 が縮約版になり、Category A/E と § 3 が AI エージェント汎用化されたことを確認
- `docs/agent-instruction-guide.md`: Option A として rename + agent-agnostic 化、Cursor-specific notes 分離を確認
- 既存機能への影響: なし（docs / GitHub metadata のみ）
- データ整合性: 対象外（wordlist / data / i18n / fonts / GAS 非接触）

## 実装過程での気づき

- `.github/ISSUE_TEMPLATE/agent-task` は classic markdown 形式を採用した。既存テンプレートが markdown 形式で揃っており、Issue #114 のような長文・裁量記述を保持しやすいため。
- md5 baseline の詳細は DEV-GUARDRAILS.md § 4 に寄せ、AGENTS.md は参照 + 必須記録事項に絞った。重複管理を避けるため。
- CURSOR-INSTRUCTION-GUIDE.md は Option A を採用。内容が抽象度・Recon・Issue 指示粒度の汎用ルールであり、Cursor 固有機能は `Cursor-specific notes` に分離できたため。
- Cursor Automation Tools には Issue comment 投稿用 tool がないため、Issue への開始宣言・PR URL 報告は自動投稿できない。PR 本文と最終報告に記録する。

## 後続への影響

- 新規 PR は `.github/PULL_REQUEST_TEMPLATE.md` を正本として使える
- 新規 AI エージェント実装 Issue は `.github/ISSUE_TEMPLATE/agent-task.md` から改修分類ブロックを pre-fill できる
- 新規実装レポートの配置先が `docs/agent-reports/` に統一され、Cursor / Codex / Claude Code の横断レビューがしやすくなる
- Track B React Phase 1 prototype 再実装時に Runtime UI 動作検証と scaffolding noise cleanup の明文化を参照できる

## 残課題・申し送り

- Issue comment 投稿 tool が提供されていないため、automation 経由では Issue への開始宣言・PR URL 報告を実行できなかった
- `docs/cursor/recon/` は historical compatibility として維持した。Recon 出力先の agent-agnostic 化は別 Issue 化が必要

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 複数の governance docs と GitHub metadata を横断したが、Runtime code / i18n schema / URL / build tooling には触れず、既存アーキテクチャ転換も発生しなかった。Category A の内容更新と docs 構造整理の範囲に収まった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1, C7
- 実装中に追加が必要になった Pattern: なし
- Phase 1 の `.github/` templates は GitHub metadata であり、deploy / CI / build tooling を変更しないため C2 追加は不要と判断した

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響は Issue #114 の明示範囲内
- [x] 既存ファイルパスへの依存関係が壊れていない（旧 `CURSOR-INSTRUCTION-GUIDE.md` 参照は historical reports 以外を更新）

### Phase 分割の妥当性

- 想定 Phase 数: 5
- 実際の Phase 数: 5
- 相互依存の発生有無: あり。`.github` template 外出し、AGENTS.md 更新、DOCUMENT-MAP § 4 縮約、guide rename、REPOSITORY-STRUCTURE / README 整合が相互参照していたため、単一 PR 一括対応が妥当だった。

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
