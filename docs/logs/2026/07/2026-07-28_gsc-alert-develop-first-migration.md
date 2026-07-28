---
created: 2026-07-28T22:00:00+09:00
project: IPASoundDrill
status: published
summary: GSC Coverage アラート分析 → 4 カテゴリ分類 → Issue #190 起票 → issue-handler 委譲 → PR base ブランチ誤り発覚 → 滞留ブランチ整理 → develop-first 移行 → Track A/B 廃止の一連の議論ログ。
tags:
  - ipasounddrill
  - log
  - gsc
  - seo
  - develop-first
  - branching
title: 議論ログ - 2026-07-28 GSC アラート対応 + develop-first 移行
type: log
updated: 2026-07-28T22:00:00+09:00
---

# 議論ログ — 2026-07-28

## 1. GSC Coverage アラート分析

Naoya から GSC Coverage アラート（11 件未インデックス）の報告。CSV データとスクリーンショットを元に分析。

### 分類結果

**カテゴリ 1: リダイレクトのあるページ（3 件）**
- hreflang x-default が `/` を指し、middleware の 302 リダイレクトで Google が「リダイレクトページ」と分類
- 解決: x-default を `/en/` に変更

**カテゴリ 2: 代替ページ（canonical、1 件）**
- `privacy.html` の canonical URL が `.html` 付きだが、Vercel cleanUrls で `.html` なし URL で配信
- 解決: canonical から `.html` を除去（terms.html も同様）

**カテゴリ 3: 404（7 件）**
- IPA 文字（æ, ʃ, oʊ）のクローラー誤認識: 対応不要（IPA 学習サイト特有）
- 存在しない言語パス: 対応不要（正当な 404）
- www サブドメイン: Vercel で 308 リダイレクト設定

**カテゴリ 4: preview デプロイのインデックス**
- Vercel preview URL に noindex 指定なし
- 解決: vercel.json に `X-Robots-Tag: noindex` ヘッダー追加

## 2. Issue 起票と issue-handler 委譲

Issue #190 を起票し、issue-handler エージェントに委譲。PR #192 が作成されたが、base ブランチが `docs/vault-migration-r15-phase2`（滞留ブランチ）になる問題が発生。

### 原因

`origin/HEAD` が `docs/vault-migration-r15-phase2` を指していた。このブランチは Vault からの docs 移行作業で使われたが、main にマージされずに残っていた。

### 解決

1. PR #193: 滞留ブランチを main にマージ（privacy.html / terms.html で Mood B デザイン変更との conflict を手動解決）
2. PR #194: main → develop の同期マージ
3. PR #192: GSC 修正が main 経由で develop に到達

## 3. develop-first 移行の議論

Naoya から以下の方針転換の指示:
- develop を正として運用する（ThinkGrindAi と類似）
- develop で状態確認してから main へマージ
- develop → main の PR は Naoya の明示的指示
- Track A / Track B の概念を完全廃止

### 議論ポイント

**Track A/B 廃止の影響範囲**: grep で 11 ファイルに Track A/B 参照を発見。governance 正本（workflow.md / repo-map.md / CLAUDE.md）を優先的に修正。`docs/LAUNCH-CHECKLIST.md` はヒストリカルな文脈として残存（20 件、別 Issue で対応）。

**Issue クローズタイミング**: 当初は「main マージ時にクローズ」としたが、Naoya の指示で「develop マージ時にクローズ」に変更。`Closes #N` を develop 向け PR でも使用する。

**issue-handler.md の残存参照**: PR #195 で governance 正本は修正済みだったが、`.claude/agents/issue-handler.md` に「Track A は main」の記述が残存していた。これが PR #192 の base ブランチ誤りの間接原因。develop 直接 push で修正。

## 4. GitHub 設定の整備

- デフォルトブランチ: main → develop に変更
- Branch Protection: main-protection / develop-protection の 2 Ruleset を新規作成（PR 必須 + force push 禁止 + 削除禁止）

## 5. 検証完了事項

- Vercel preview noindex: `curl -sI` で `x-robots-tag: noindex` 確認
- www 308 リダイレクト: Naoya が設定・確認済み
- develop-first の全エージェント整合性: issue-handler.md / PR テンプレート / workflow.md を確認・修正
