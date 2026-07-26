---
created: 2026-07-13 02:00:00+09:00
project: IPASoundDrill
source_chat_date: 2026-07-13
status: published
summary: 'Day 4-5 hub Chat の全体記録。当初は Vercel Analytics + SEO を扱う予定だったが、既存 REPOSITORY-STRUCTURE.md
  の存在発見を機に、docs infrastructure 整備（新規 4 MD: DOCUMENT-MAP / DEV-GUARDRAILS / DOC-SYNC-PLAYBOOK
  / CURSOR-INSTRUCTION-GUIDE）を先行実施。あわせて多言語 SEO の方針を JS-dynamic から subdirectory + build-time
  prerendering に転換、Track B に追加言語 7 種（es/pt-BR/vi/id/th/hi/ar）を追記。Issue #17 #19 #20
  #23 #25 #26 #29 #31 の 8 件を完了、F2/F3 実装を新 Chat に引き継ぐ形で終了。'
tags:
- ipa-drill
- cursor
- mcp
- github
- seo
- docs-infrastructure
- chat-handoff
title: 'Day 4-5 hub: docs infrastructure 整備 + 多言語 SEO 方針転換 + F2/F3 引き継ぎ'
type: chat_log
updated: 2026-07-13 02:00:00+09:00
id: pj-2026-07-13-2f36
aliases:
- pj-2026-07-13-2f36
---

## Summary

Day 4-5 hub Chat の全体記録。当初スコープは Issue E（Vercel Analytics）と Issue F（SEO 基本セット）だったが、以下 3 つの大きな軌道修正により、実質的には「Track A ローンチ準備の運用基盤を確立する Chat」として機能した:

1. **既存 REPOSITORY-STRUCTURE.md の存在発見**: Claude が起動時に把握していなかった Category A ドキュメントの発見をきっかけに、docs infrastructure 整備を先行実施
2. **多言語 SEO 方針の根本的転換**: 「JS-dynamic な meta 更新」→「subdirectory + build-time prerendering」への転換（多くの AI クローラーが JS を実行しない事実に基づく）
3. **Track B スコープの拡張**: 追加言語 7 種（es / pt-BR / vi / id / th / hi / ar）の一括対応を Track B に追記

Cursor Haiku レベルでもドキュメント刷新を担える運用体制（DOC-SYNC-PLAYBOOK による 3 分岐マトリックス、CURSOR-INSTRUCTION-GUIDE による抽象度マトリックス、Pre-Issue Recon 運用）が確立され、以降の Issue 起票・実装フローが標準化された。

## 起票・完了 Issue（8 件）

| # | ラベル | タイトル | 状態 |
|---|---|---|---|
| #17 | docs / launch-blocker | LAUNCH-CHECKLIST を Phase 単位に刷新（日付固定廃止） | Merged (PR #18) |
| #19 | chore / launch-blocker | Vercel Web Analytics 有効化（Naoya 手動） | Completed |
| #20 | docs / launch-blocker | docs infrastructure overhaul（4 新規 MD + 3 既存編集） | Merged (PR #21) |
| #23 | chore / launch-blocker | CLAUDE.md から日付固定表現を削除、Analytics スタック同期 | Merged (PR #24) |
| #25 | feature / launch-blocker | i18n meta 6 言語追加（en/ja/ko/zh-Hans/zh-Hant/fil） | Merged (PR #27) |
| #26 | chore / launch-blocker | F2 用 Pre-Issue Recon（meta/OGP architecture） | Merged (PR #28) |
| #29 | docs / launch-blocker | LAUNCH-CHECKLIST 更新（Phase 5 subdirectory 方針、Phase B-Lang、Recon 運用） | Merged |
| #31 | chore / launch-blocker | F2 用 Pre-Issue Recon（build infrastructure） | Merged |

## 確立した運用体制

### 新規 4 MD（Issue #20 で作成）

- **`docs/DOCUMENT-MAP.md`**: 全ドキュメントの Category A-E 分類、更新責任、参照タイミング、新規ドキュメント作成判定フロー
- **`docs/DEV-GUARDRAILS.md`**: 堅固化パターン A/B、md5 検証、Cursor 自己判断禁止事項、REPOSITORY-STRUCTURE 更新義務、Cursor 実装レポートテンプレート
- **`docs/DOC-SYNC-PLAYBOOK.md`**: ソース ⇔ ドキュメント同期の 3 分岐マトリックス（Cursor Haiku 用）
- **`docs/CURSOR-INSTRUCTION-GUIDE.md`**: コード規模 → Cursor 指示の抽象度マトリックス、Pre-Issue Recon 運用、月次レビュー

### Chat 起動時ルールの拡張（Category B）

Claude セッション起動時に MCP 経由取得すべきファイルが 2 個 → 5 個に:

1. `HANDOFF-*.md`（Project Knowledge）
2. `CLAUDE.md`
3. `docs/REPOSITORY-STRUCTURE.md`（新規追加）
4. `docs/LAUNCH-CHECKLIST.md`（新規追加）
5. `docs/DOCUMENT-MAP.md`（新規追加）

### Issue 起票時の運用強化

- **Issue 本文の「背景・目的」は 5 サブセクション構成で書く**（トリガー、文脈 3 観点、選択肢と選定理由、成果 3 観点、後続への影響）
- **Category A ドキュメント（LAUNCH-CHECKLIST、REPOSITORY-STRUCTURE、OPERATIONS 等）の自動更新チェックリスト**を Issue 本文に含める
- **Cursor 実装レポート**に「Issue 背景」「実装過程での気づき」「後続への影響」を必ず記述（Projects / Note での発信素材化のため）

### Pre-Issue Recon 運用の公式化

100 行超の Issue では、Claude が Cursor に「現状調査依頼」を出し、Cursor が Recon MD を出力 → Claude が Issue 本文を作成、というフロー。Issue #26 と #31 で実証済み。

## 多言語 SEO 戦略の転換

### 発見された技術的制約

- SNS クローラー（Twitterbot、facebookexternalhit、LinkedInBot 等）と、多くの AI クローラー（GPTBot、ClaudeBot、PerplexityBot、CCBot 等）は **JavaScript を実行しない**
- 現行の「JS で `document.title` / meta タグを動的更新する」設計では、シェア時のプレビュー・AI クローラーからの認識に効かない

### 採用した方針: サブディレクトリ + ビルド時プリレンダリング

1. 言語別サブディレクトリ: `/en/`, `/ja/`, `/ko/`, `/zh-Hans/`, `/zh-Hant/`, `/fil/`
2. ビルド時プリレンダリング: `scripts/build-i18n-html.js` で各言語別静的 HTML を生成
3. 各言語 HTML の完全な head 埋め込み: meta description / OGP / Twitter Card / canonical / hreflang / og:locale / JSON-LD
4. Vercel の rewrites/redirects と Edge Middleware で URL 制御・Accept-Language 判定
5. sitemap.xml + robots.txt + llms.txt（各言語版含む）

### 却下した選択肢

- **選択肢 A**（当初案）: 単一 HTML + `?lang=xx` パラメータ + JS 動的 meta 更新 → クローラーに届かない
- **選択肢 B**（次善案）: Vercel Edge Middleware で `?lang=xx` ごとに head を書き換え → 保守複雑、キャッシュ戦略の複雑化
- **サブドメイン方式**: ドメインオーソリティが分散する
- **ccTLD 方式**: 実装コスト超高

### Track B: 追加言語 7 種

英語学習市場規模 + IPA 学習親和性で優先順位:

1. `es`（スペイン語）— 表音性が高く IPA 親和性最高
2. `pt-BR`（ブラジルポルトガル語）— 英語学習需要が最大級
3. `vi`（ベトナム語）— 若年層の英語学習需要が急伸
4. `id`（インドネシア語）— 東南アジア最大市場、fil と補完的
5. `th`（タイ語）— 声調言語、発音学習の潜在需要が高い
6. `hi`（ヒンディー語）— 母語干渉学習需要
7. `ar`（アラビア語）— 母音構造が英語と大きく異なる

## 重要な意思決定・気づき

### 意思決定

- **ローンチ日固定を廃止**: Naoya さん方針「日付を特定せず、Phase 単位で進行。早く終わればその分早くローンチ」を LAUNCH-CHECKLIST と CLAUDE.md に反映
- **Issue の背景セクションを記事化前提で詳しく書く**: Projects / Note での発信素材化を意識、意思決定のプロセスと経緯を残す運用を確立
- **Cursor Haiku レベルでもドキュメント刷新を担える設計**: 構造化された指示（DOC-SYNC-PLAYBOOK の 3 分岐マトリックス）で機械的に判定可能に

### 気づき

- **既存資産の把握不足問題**: Claude が起動時に `docs/REPOSITORY-STRUCTURE.md` の存在を認識していなかった。Category B の 5 ファイル起動時取得ルールで解消
- **Issue 対応時の Category A 自動更新チェックリスト運用**が漏れ防止に有効
- **Pre-Issue Recon が Claude のトークン節約と Issue 設計精度の両立に効く**（Issue #26 で `?lang=` パラメータ未実装を発見、当初設計を修正）
- **既存の高品質な REPOSITORY-STRUCTURE.md**（2026-07-10 版、Naoya さんが丁寧に整備）が発見された。自動生成ではなく既存 MD の強化 + 運用ルール化の方向へ舵を切った
- **中国語簡体字の meta description で JSON エスケープ問題**を発見、鉤括弧「」で回避

## MCP で取得できない情報

以下は Chat 内で共有された情報でリポジトリに存在しないため、新 Chat 起動時に Claude が把握できない:

### X アカウント（Issue E2 / Phase 10e で使用予定）

- ハンドル: `@nkhippo123`
- 表示名: かばさん
- Bio: "No AI, No Life. learn, build, live — with AI."

### Naoya さんの意思決定・想い

- 「開発運用そのものをストーリー化して発信素材にする」戦略
- 「早く終わればその分早くローンチ、日付は特定しない」方針
- 「実装コストは少しばかりであれば許容、保守性・検索性を最大化したい」（F2 でサブディレクトリ方式を採用した理由）
- 「日本語の直訳ではなく各言語で最適な表現にしたい」（i18n meta のロケール最適化）

### 未確定・未着手項目

- **Tally アカウント**: 未作成、Issue E2 起票前に Naoya さんが作成予定
- **Product Hunt アカウント**: 状況未確認
- **お問い合わせ用メール**: `hello@ipasounddrill.app` 等の案あり、未確定
- **Namecheap のメール設定**: 未確認

### 外部要因

- Issue #22: 外部からの自動投稿（x402 マイクロペイメント勧め）、無視推奨・Close 可
- Issue #13: 試験 Issue（MCP 疎通確認用）、Close 可

## 新 Chat への引き継ぎ

Day 4-5 hub Chat の Chat コンテキストが重くなったため、F2/F3 の実装を別 Chat に切り出し。以下 2 ファイルを Naoya さんに提示済み:

1. **`HANDOFF-f2-f3-seo-implementation.md`**: 新 Chat 起動時に添付する引き継ぎパック
2. **`project-instructions-latest.md`**: 新 Projects の「手順」欄に貼り付けるシステムプロンプト（当初手順から拡張、記事化前提の詳細背景・Issue 対応時の自動更新チェックリスト・Cursor 実装レポート強化を明記）

## 次アクション

### Naoya さん

1. 新 Projects を作成、「手順」欄に `project-instructions-latest.md` を貼付
2. 新 Chat を起動、`HANDOFF-f2-f3-seo-implementation.md` を添付、起動プロンプトを貼付
3. 新 Chat で F2 の壁打ちから開始
4. 並行して: Tally アカウント作成、Product Hunt アカウント確認、メール設定検討
5. 任意: Issue #13 と #22 の Close

### 新 Chat の Claude

1. Category B の 4 ドキュメントを MCP で取得
2. Recon 結果 2 件（#26 と #31 由来）を MCP で取得
3. F2 の完全版 Issue 本文作成 → MCP 起票
4. F2 マージ後、F3 の壁打ち → 起票 → 実装
5. F3 マージ後、次の Chat 切り出し提案（Issue G / E2 / H / I / J、素材、告知、ローンチ）

## 関連

- リポジトリ: `nkhippo/IPASoundDrill`
- MCP エンドポイント: `https://ipasounddrill-production.up.railway.app/mcp`
- 前セッション: [[2026-07-13_hub-chat-startup]]
- 参照 Category B ドキュメント: `CLAUDE.md`, `docs/REPOSITORY-STRUCTURE.md`, `docs/LAUNCH-CHECKLIST.md`, `docs/DOCUMENT-MAP.md`
