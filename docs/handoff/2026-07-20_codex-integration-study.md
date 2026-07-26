---
aliases:
  - pj-2026-07-20-cdxs
created: 2026-07-20
id: pj-2026-07-20-cdxs
project: IPASoundDrill
status: done
summary: "Codex 導入検証セッション完了 handoff。4 段階すべて完走: (1) PR #95/#96 テスト → (2) PR #110-#113 本番相当比較 → (3) PR #116 governance v2 merged → (4) PR #118 SSoT 総仕上げ merged。AGENTS.md v2 ・agent-reports/・.github/ templates ・agent-instruction-guide.md の一連の governance 体制が確立。次工程は Claude Design 取り込み (roadmap R03) へ移行。"
tags:
  - handoff
  - ipasounddrill
  - codex
  - cursor
  - agents-md
  - background-agent
title: Codex 導入検証 handoff (IPASoundDrill を題材にした PoC)
type: handoff
updated: 2026-07-21T21:50:14+09:00
roadmap_node: R02
---

## Summary

Naoya のバックグラウンド改修運用 (仕事中に物理 MacBook が起動していなくても改修が進むようにする) を実現する目的で、Codex を検証導入し、governance v2 まで完了させた。IPASoundDrill を題材に Codex/Cursor の並行検証を通じて双方の善所を AGENTS.md v2 に codify し、Cursor が governance v2 (PR #116) と SSoT 化総仕上げ (PR #118) を実装・マージ済み。**Codex 整備フェーズ完了**、次工程は Claude Design 取り込み (roadmap R03) の再開。

## Current work

### 完了済み (全4段階)

#### 第1段階: Codex 導入初期検証

- Codex CLI ローカルインストール (`npm install -g @openai/codex`、macOS)
- ChatGPT Plus 契約 (2026-07-20、plus-1-month-free キャンペーン導線経由)
- Codex Web UI で GitHub App 連携、IPASoundDrill リポジトリのアクセスを許可
- `AGENTS.md` 初版を main に配置 (commit `b5e597c`)
- 動作検証 (テスト用): 元 Issue #94 (README 末尾追記) で Codex/Cursor 挙動を掴む。PR #95 (Codex), #96 (Cursor) 共に closed

#### 第2段階: 本番相当比較検証

- 元 Issue #100 (docs update, L2) を Codex/Cursor 並行投入:
  - PR #110 (Cursor): REPOSITORY-STRUCTURE の Canonical documentation 表への統合が深い
  - PR #112 (Codex): Phase 0-3 の md5 検証プロセスを明示、403 フォールバックを report に記録
- 元 Issue #101 (Track B React Phase 1, L3) を Codex/Cursor 並行投入:
  - PR #111 (Cursor): plugin-react/oxlint 込み 19 ファイル、build 成功のみで動作確認とした、create-vite 由来の template ノイズ (icons.svg) を含めた、`npm run dev` によるブラウザ確認は未実施
  - PR #113 (Codex): 最小構成 13 ファイル、実ブラウザで動作確認、React 警告 (state updater 内で親を更新) を発見して修正、Phase 0-4 の md5 baseline 検証プロセス
- 4 PR 比較レビュー完了、テスト用のため全 PR および Issue #100/#101 は closed

#### 第3段階: governance v2 起票と実装 (PR #116)

- **Issue #114 起票・実装完了**:
  - タイトル: `governance v2: AGENTS.md 拡張・DOCUMENT-MAP § 4 縮約・.github/ templates 新設・Step 2 コメント agent-agnostic 化`
  - Cursor が **PR #116 で全 Phase 1-5 を完遂**、Step 2 コメントを新規約通りに投稿するドッグフーディング付き
  - 17 ファイル変更、Runtime code / i18n / URL 影響ゼロ
  - マージ済み

#### 第4段階: governance v2 総仕上げ (PR #118)

- **Issue #117 起票・実装完了**:
  - タイトル: `governance: .cursor/rules/dev-flow.mdc の Step 2 SSoT 化 + CURSOR-INSTRUCTION-GUIDE stub 削除予定日注記`
  - Cursor が Phase 1 で Option B (概要保持型) を採用、Phase 2 で削除予定日 2026-10-21 を注記
  - 2 ファイル修正 + 実装レポート、L1 判定維持
  - マージ済み

### 結果として整った運用体制

- **AGENTS.md v2 が完成**: Runtime UI 動作検証・md5 baseline・Scaffolding cleanup・Step 2 agent-agnostic の 4 セクション追加、PR description template は `.github/` に外出し
- **DOCUMENT-MAP § 4 が縮約**: Category C/D 統合、共通必須参照 6 項目に絞り、付録に特定タイプ追加参照
- **`.github/` templates 新設**: PR template と Issue template (agent-task.md) を GitHub 自動挿入で運用
- **`docs/agent-instruction-guide.md` (旧 CURSOR-INSTRUCTION-GUIDE.md)** が agent-agnostic 化
- **`docs/agent-reports/` が実装レポート統合先**として正式運用開始 (`docs/cursor/reports/` は 2026-07-20 以前の historical archive)
- **役割分担の目安**: React 実装は Codex 有利 (ブラウザ検証・最小構成)、governance/docs は Cursor 有利 (プロジェクト整合・Canonical 表統合)。混在時代に対応

### 未解消の軽微な残課題 (実運用に影響なし)

- **AGENTS.md § Step 2 発動条件の曖昧さ**: 判断ポイントが listed options のみで UX/運用/データ懸念ゼロの場合、Step 2 コメント要否が明確でない。月次レビューで実運用パターンを観察して精緻化余地
- **`docs/CURSOR-INSTRUCTION-GUIDE.md` stub の実削除**: 2026-10-21 以降の follow-up Issue で対応予定
- **Cursor の Step 2 コメント未投稿ケース (#117)**: 上記曖昧さと関連

## Next steps

### 1. [別チャットで並行進行中] 自前 GitHub MCP を Cloudflare Workers へ移植

- 現状: IPASoundDrill GitHub MCP は Railway デプロイ (`https://ipasounddrill-production.up.railway.app/mcp`)
- 目的: Claude / Codex / Cursor の 3 AI で同一 MCP を経由し、GitHub 操作を統一。Codex 公式 GitHub App の 403 問題も回避できる副次効果あり
- 移植完了後: Codex Web UI の Custom MCP 登録画面で登録、公式 GitHub コネクタから切り替え

### 2. [次工程] Claude Design 取り込みの再開 (roadmap R03)

- Codex 整備完了により roadmap R02 → done へ遷移
- 次のアクティブノードは R03 (IPA CD取込 = Claude Design 出力の取り込み)
- 別 Chat で作業継続

### 3. [Track B、将来] React Phase 1 の本番実装

元 PR #113 (Codex 版) を規範として、AGENTS.md v2 のルール下で再実装。Product Hunt launch 後に別 Issue で起票予定。

## Open questions

- **Step 2 発動条件の精緻化タイミング**: 現状のまま運用しながら実発動パターンを月次レビューで観察し、必要になったら精緻化 Issue を起票する方針で問題ないか
- **MCP 統一の副次効果**: Codex の 403 問題は自前 MCP 移植で自動解決するはずだが、Codex 側のフォールバック挙動が壊れないか要確認

## Blockers

- なし (Codex GitHub App の 403 問題は Codex 自身のフォールバックで実運用は成立、自前 MCP 移植で恒久解決予定)

## Related Issues / PRs

### Governance v2 完了サイクル (merged)

- **#114** (governance v2): closed、PR #116 (Cursor) merged
- **#117** (governance SSoT 総仕上げ): closed、PR #118 (Cursor) merged

### Test cycle (closed、参考)

- #94 (test scaffolding): PR #95 (Codex), #96 (Cursor) 双方 closed
- #100 (docs update): PR #110 (Cursor), #112 (Codex) 双方 closed
- #101 (Track B React Phase 1): PR #111 (Cursor), #113 (Codex) 双方 closed

### Commits

- AGENTS.md 初版追加 commit: `b5e597c` (main)
- AGENTS.md v2 commit chain: PR #116 merged
- SSoT 化 commit chain: PR #118 merged

## Rv で判明した「文書化の穴」→ 対処結果

| # | 課題 | 対処 | Status |
|---|---|---|---|
| 1 | UI 動作検証の空白 | AGENTS.md § Runtime UI 動作検証 新設 | 完了 |
| 2 | 既存編集ゼロ保証の空白 | AGENTS.md + DEV-GUARDRAILS § 2 に md5 baseline 明記 | 完了 |
| 3 | Scaffolding template noise | AGENTS.md § Scaffolding tool noise cleanup 新設 | 完了 |
| 4 | PR/Issue テンプレの hardcode 重複 | `.github/PULL_REQUEST_TEMPLATE.md` と `agent-task.md` に外出し | 完了 |
| 5 | Step 2 コメントの agent 依存 | AGENTS.md § Step 2 に agent-agnostic format 明記 | 完了 |
| 6 | DOCUMENT-MAP § 4 の冗長 | Category C/D 統合、共通必須参照 6 項目に縮約 | 完了 |
| 7 | CURSOR-INSTRUCTION-GUIDE.md の位置づけ齟齬 | `agent-instruction-guide.md` にリネーム + agnostic 化 | 完了 |

## Context

### 課題背景

Naoya の現行 3-party workflow (Claude が仕様設計・Cursor 指示書生成 → Cursor が実装 → Naoya がテスト・push) は、Cursor が物理 MacBook 依存であるため、仕事中 (Windows 会社 PC しか使えない時間帯) は改修が停止する。この時間帯にもバックグラウンドで Issue を消化させたい、というのが今回の検討動機。

### 検討した代替案

- **Claude Code GitHub Actions**: 思想的に本命。API 従量課金の初期セットアップが必要
- **GitHub Copilot Coding Agent**: Issue アサインだけで自動着手、操作最小。別サブスク ($10〜) 必要
- **Cursor Background Agent**: 追加コストゼロで Cursor Pro に含まれる。すでに Cursor 資産あり
- **Codex (採用)**: 学習兼ねてこれを試すこととした。ChatGPT Plus $20/月で Cursor Pro と同額入口

### コスト観

- Codex はトークン効率が競合の 2〜4 倍良く、クラウド実行のコスト増ペナルティをモデル側で相殺する設計
- Cursor Background Agent はサブスク定額に含まれるので変動コスト上限が見えやすい
- 「ローカル実行の方が安いが、可用性 (物理 Mac 依存の排除) を買うためにクラウド追加コストを払う」という等式で考えると健全

### 参照アセット

- Vault MCP: Cloudflare Workers デプロイ済み (`https://vault-mcp.nkhippo.workers.dev`)
- IPASoundDrill GitHub MCP: Railway デプロイ (`https://ipasounddrill-production.up.railway.app/mcp`)、Cloudflare 移植中

### 本 handoff の状態

**Codex 整備フェーズ完了、status: done**。次工程 (Claude Design 取り込み) は roadmap R03 として別 Chat で継続。本 handoff は将来的な agent governance の見直し時に一次資料として参照可能。