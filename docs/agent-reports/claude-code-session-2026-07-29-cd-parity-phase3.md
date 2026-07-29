# CD Parity Phase 3: ガバナンス整備 + サービス資料全面同期 — セッションレポート

## 関連 Issue / PR

- PR #203: ガバナンス整備（.dc.html 凍結カタログ化 + Issue-first halt + feature spec 同期）
- Issue #204 → PR #207: Feature spec 全13 ID 実装突合 + screen-inventory.md 作成
- Issue #205 → PR #206: Supporting specs 実装突合 + 資料配置整理
- PR #208: develop → main リリース
- Agent: claude-code（本セッション）+ issue-handler サブエージェント × 2 + pr-reviewer × 2

## セッション概要

Phase 3 UI 改修（PR #195–#202）後に発生していた 3 つの課題を一括で解消したセッション:

1. **.dc.html ワークフロー問題**: Claude Design `.dc.html` ファイルの位置づけを「追随スナップショット」から「凍結フレームカタログ」に転換。更新義務を撤廃し、UI 確認は Vercel branch preview URL に移行。
2. **Issue-first 違反**: PR #195–#202 が全て Issue なしで作成されていた問題。halt トリガー (d) を追加し、壁打ちから実装に移る際の Issue 起票を必須化。
3. **サービス資料の実装乖離**: feature spec 全13 ID + supporting specs（data-contract, CSS-CONVENTIONS, design input docs）を `src/index.template.html` と突合して修正。React 化デグレ確認用の `screen-inventory.md` を新規作成。

## 実施内容

### Phase 1: ガバナンス整備（PR #203、本セッション直接実装）

- `CLAUDE.md`: 絶対ルール #7（Issue-first 必須）、halt (d)、executor モデル更新、タスク種別対応表に凍結カタログ追加
- `AGENTS.md`: #5（凍結カタログ用語）、#6（Issue-first）追加
- `docs/workflow.md`: §2a「Issue-first 原則」追加（root cause 分析 + フロー図 + spec sync 完了条件）
- `docs/guardrails.md` §9: 「追随スナップショット」→「凍結フレームカタログ」
- `docs/claude-design/README.md`: 全面書き直し（凍結カタログポリシー + Vercel preview ワークフロー）
- `.claude/skills/ux-brief/SKILL.md`, `ux-review/SKILL.md`: CD SaaS 参照削除
- `docs/features/_common.md`: 進捗メーター撤廃、info-page モーダル、PC 2-pane レイアウト、btn-reveal 統一デザイン
- `docs/features/1a.md`, `2a.md`, `2b.md`, `2c.md`, `3b.md`: 各種修正
- `docs/design/claude-design-input-strategy.md`, `docs/design/phase-1/brief-cluster-*.md`: archived

### Phase 2: Issue 起票（#204, #205）

サービス関連資料 59 件を 8 Tier に棚卸しした上で、2 Issue に分割:
- Issue #204: Feature spec 全13 ID の実装突合 + screen-inventory.md（L2 × C1,C6）
- Issue #205: Supporting specs 同期 + 資料配置整理（L2 × C1,C7）

### Phase 3: issue-handler 委譲（PR #206, #207）

両 Issue を issue-handler サブエージェントに並行委譲。

**ワークツリー競合問題が発生**: 2 エージェントが同一ワークツリーで別ブランチを切り替え合い、git HEAD の競合が発生。#204 エージェントが検出して halt。#205 エージェントは stash/restore で完走。その後 #204 を単独再起動して完了。

**Issue #205 成果（PR #206）**:
- `data-contract.md`: i18n leaf 数実測(280)、`ga_rp_same_reason` 全18値完全列挙、localStorage キーテーブル修正
- `CSS-CONVENTIONS.md`: legacy CSS var 参照数実測(195)、Phase 3 非legacy クラス一覧
- `design/product-principles.md`, `user-personas.md`: "Mode A" → 現行名称
- `design/ux-issues-2026-07.md`: Phase 0 決定ログ注記
- `doc-map.md`: visual-tokens.md + Tier-5 登録

**Issue #204 成果（PR #207）**:
- 10 feature spec 更新: 2a–2d（accent badge）、3a（accent-card UI）、3b（大幅修正: IPA フィルタバーのみに）、3c（UI 導線不在を known gap として文書化）、3d（大幅修正: progressBtn 起点、4 ドリル卒業カードのみ）、reveal（readout display:none、rPronCard）、summary（画面構造テーブル追加）
- `screen-inventory.md` 新規作成: body 状態クラス、全画面 DOM ルート/表示条件/要素テーブル

### Phase 4: pr-reviewer レビュー

- PR #206: **PASS**（軽微注記: legacy count コマンド記載ミス、PR 本文「17値」→実際18値）
- PR #207: レビュアーが **FAIL** 判定したが、全指摘が誤検出（別ディレクトリのファイルを参照した模様）。独自検証で全セレクタの実在を確認し、実質 **PASS**。

## 変更ファイル（全体）

```
- CLAUDE.md (M)
- AGENTS.md (M)
- docs/workflow.md (M)
- docs/guardrails.md (M)
- docs/change-classification.md (M)
- docs/repo-map.md (M)
- docs/claude-design/README.md (M)
- docs/doc-map.md (M)
- docs/data-contract.md (M)
- docs/CSS-CONVENTIONS.md (M)
- docs/design/claude-design-input-strategy.md (M)
- docs/design/phase-1/brief-cluster-1-top-page.md (M)
- docs/design/phase-1/brief-cluster-2-visual-language.md (M)
- docs/design/product-principles.md (M)
- docs/design/user-personas.md (M)
- docs/design/ux-issues-2026-07.md (M)
- docs/features/_common.md (M)
- docs/features/1a.md (M)
- docs/features/2a.md (M)
- docs/features/2b.md (M)
- docs/features/2c.md (M)
- docs/features/2d.md (M)
- docs/features/3a.md (M)
- docs/features/3b.md (M)
- docs/features/3c.md (M)
- docs/features/3d.md (M)
- docs/features/3h.md (M)
- docs/features/reveal.md (M)
- docs/features/summary.md (M)
- docs/features/README.md (M)
- docs/features/screen-inventory.md (A)
- .claude/skills/ux-brief/SKILL.md (M)
- .claude/skills/ux-review/SKILL.md (M)
```

## 運用上の気づき・申し送り

### ワークツリー共有問題
issue-handler を並行実行する場合、同一ワークツリーでの同時作業は git HEAD 競合を引き起こす。`isolation: 'worktree'` オプションの使用、または直列実行が必要。

### pr-reviewer の誤検出
pr-reviewer（sonnet）がワークツリー内のファイルではなく本リポのファイルを参照し、存在するセレクタを「不在」と誤判定した。レビュアーの grep 対象パスの明示が改善ポイント。

### 3c IPA 記号ピッカーの UI 導線不在
`#/vocab/ipa` route/DOM/JS は全て残存しているが、3b のフィルタ UI 刷新で旧セグメントコントロールが撤去されたため到達手段がない。別 Issue での対応を推奨。

## 後続への影響

- `screen-inventory.md` は React 化時のデグレ確認ベースラインとして使用可能
- Issue-first halt (d) により、今後の壁打ち→実装フローでは必ず Issue が先行する
- 凍結カタログ方針により、`.dc.html` の更新タスクは発生しない
