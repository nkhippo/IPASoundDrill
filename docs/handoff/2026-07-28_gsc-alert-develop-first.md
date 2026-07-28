---
created: 2026-07-28T22:00:00+09:00
project: IPASoundDrill
status: published
summary: GSC Coverage アラート対応（hreflang x-default / canonical / preview noindex / www 308）完了 + develop-first ブランチ運用移行 + Track A/B 概念廃止。Issue は develop マージ時に Closes でクローズする方針に確定。GitHub デフォルトブランチ develop 化・main/develop 両方に Branch Protection 設定済み。
tags:
  - ipasounddrill
  - handoff
  - gsc
  - seo
  - develop-first
  - branching
title: Chat handoff pack - 2026-07-28 (GSC アラート対応 + develop-first 移行)
type: handoff
updated: 2026-07-28T22:00:00+09:00
---

# 📦 Chat 引き継ぎ pack — 2026-07-28

**テーマ**: GSC Coverage アラート対応 + develop-first ブランチ運用移行 + Track A/B 廃止

---

## 次 Chat 起動時の確認事項

### 1. リポジトリから取得（Claude Code はローカル参照）

**正典系**:
- `CLAUDE.md`（router）
- `docs/workflow.md`（develop-first ブランチ運用が反映済み）
- `docs/repo-map.md`（Track A/B → 現行スコープ/将来計画に更新済み）

**本 Chat の成果物**:
- `docs/handoff/2026-07-28_gsc-alert-develop-first.md`（本 pack）
- `docs/logs/2026/07/2026-07-28_gsc-alert-develop-first-migration.md`（議論ログ）

### 2. 確認すべき状態

- [ ] GSC「修正を検証」の再クロール結果（数日〜2 週間後に確認）
- [ ] `docs/LAUNCH-CHECKLIST.md` の Track A/B 残存参照の整理（20 件、別 Issue で対応予定）

---

## この Chat で確定した事項

### A. GSC Coverage アラート対応（Issue #190、PR #192）

**問題**: GSC が 11 件の未インデックスページを報告（7 × 404、3 × redirect、1 × canonical alternative）

**対応済み**:

| 問題 | 原因 | 修正 |
|------|------|------|
| hreflang x-default がリダイレクトページ | x-default が `/` を指し、middleware が 302 リダイレクト | x-default を `/en/` に変更（build-i18n-html.js + sitemap.xml） |
| canonical URL 不一致 | privacy.html / terms.html の canonical が `.html` 付きだが Vercel cleanUrls で `.html` なし URL で配信 | canonical から `.html` を除去 |
| preview デプロイがインデックス対象 | Vercel preview URL に noindex 指定なし | vercel.json に `X-Robots-Tag: noindex` ヘッダー追加（`missing` host matcher で本番以外に適用） |
| www サブドメインが 404 | Vercel で www も Production 環境に接続されていた | Naoya が Vercel で www → apex 308 リダイレクト設定 |

**対応不要と判断した 404（7 件）**:
- IPA 文字（æ, ʃ, oʊ）をクローラーが URL パスと誤認識 — IPA 学習サイト特有、再発しうるが無害
- 存在しない言語パス（`/es/`, `/de/` 等）— 正当な 404
- www サブドメイン — 308 設定済みで次回クロール時に自動解消

### B. develop-first ブランチ運用移行（PR #195 + develop 直接 push）

**方針**:
- 全 PR の base は `develop`
- `develop` → `main` のマージは Naoya の明示的指示で行う
- Issue は develop マージ時に `Closes #N` でクローズする
- Track A / Track B の概念は完全廃止

**修正したファイル（PR #195）**:

| ファイル | 変更内容 |
|---------|---------|
| `CLAUDE.md` | §1 Track A 制約 → 技術スタック制約、§5 Branch 戦略を develop-first に |
| `docs/workflow.md` | Issue type C の Track B 制約除去、ラベル体系から launch-blocker/track-b 除去、PR Closes ルール、Branch 戦略全面書き換え |
| `docs/repo-map.md` | Track A/B スコープ → 現行スコープと将来計画 |
| `docs/CSS-CONVENTIONS.md` | Track A → 現行、Track B → 将来 |
| `docs/data-contract.md` | Track A 確定 → 現行、Track B → 将来対応予定 |
| `docs/product.md` | Track B 参照除去 |
| `docs/OPERATIONS.md` | Track A/B 一括置換 |
| `.github/ISSUE_TEMPLATE/*.md`（4 ファイル） | ローンチブロッカー判定セクション除去 |

**PR #195 外で追加修正（develop 直接 push）**:

| ファイル | 変更内容 |
|---------|---------|
| `.claude/agents/issue-handler.md` | base ブランチ `Track A は main` → `develop`、`Closes #NN` 使用可、直接 push 禁止対象に develop 追加 |
| `.github/PULL_REQUEST_TEMPLATE.md` | `Closes #N` を維持（develop マージでクローズ） |

### C. GitHub 設定（Naoya 対応済み）

- デフォルトブランチ: `main` → `develop` に変更済み
- Branch Protection Rulesets:
  - `main-protection`: PR 必須 + force push 禁止 + 削除禁止
  - `develop-protection`: PR 必須 + force push 禁止 + 削除禁止

### D. PR 経路の問題と解決

PR #192 が `docs/vault-migration-r15-phase2`（滞留ブランチ）を base にして作成された問題が発生。原因は `origin/HEAD` がこのブランチを指していたため。

- PR #193: 滞留ブランチを main にマージ（conflict 解決含む）
- PR #194: main → develop の同期マージ
- デフォルトブランチ変更により根本解消

---

## 残タスク

| タスク | 状態 | 次のアクション |
|--------|------|---------------|
| GSC 再クロール確認 | 待ち（数日〜2 週間） | GSC → ページ → 各カテゴリで結果確認 |
| `docs/LAUNCH-CHECKLIST.md` の Track A/B 参照整理 | 未着手（20 件） | 別 Issue で対応 |
| Vercel preview noindex 検証 | 完了 | `x-robots-tag: noindex` 確認済み |

---

## 関連 PR / Issue

| 番号 | 内容 | 状態 |
|------|------|------|
| Issue #190 | GSC Coverage アラート対応 | Open（PR #192 マージ済み、GSC 再クロール待ち） |
| PR #192 | GSC fix（hreflang / canonical / preview noindex） | Merged |
| PR #193 | 滞留ブランチ（vault-migration-r15-phase2）→ main マージ | Merged |
| PR #194 | main → develop 同期 | Merged |
| PR #195 | develop-first + Track A/B 廃止 | Merged |
