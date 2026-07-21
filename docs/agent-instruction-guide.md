---
id: pj-2026-07-12-3141
aliases:
- pj-2026-07-12-3141
title: AGENT-INSTRUCTION-GUIDE — AI エージェント指示の抽象度ガイドライン
created: '2026-07-12'
---

# AGENT-INSTRUCTION-GUIDE — AI エージェント指示の抽象度ガイドライン

> **Last updated**: 2026-07-20（Issue #114: agent-agnostic 化、`docs/agent-instruction-guide.md` へリネーム）
> **Purpose**: Claude が AI 実装エージェント (Codex / Cursor / Claude Code 等) に出す指示の抽象度を、コード規模と Issue 性質に応じて適切にコントロールする。

---

## 1. コード規模 → 指示の抽象度 マトリックス

| 規模 | 抽象度 | 具体性の要件 | 例 |
|---|---|---|---|
| **< 20 行、1 ファイル** | 高（機能名レベル） | 「XX 関数の YY 処理を ZZ に変更」で足りる | 「footer に Tally リンク追加」 |
| **20-100 行、1-2 ファイル** | 中（関数シグネチャレベル） | 関数名 + 引数 + 期待動作を明示 | Vercel Analytics script 追加 + カスタムイベント発火 |
| **100-500 行、3-5 ファイル** | 低（行番号 + データ構造レベル） | 対象行番号、対象データ構造、差分パッチ例を含む | i18n 6 言語 meta 追加、hreflang 実装 |
| **500+ 行、5+ ファイル** | 極低（Issue 分割推奨） | 単独では扱わない | React 化（Track B）、大規模リファクタリング、**ファイル移動 + ビルドシステム初導入（例: F2）→ 堅固化パターン C 適用** |

> **本節の抽象度マトリックスは、`docs/CHANGE-CLASSIFICATION.md` § 2 の Complexity Level (L1-L3) に統合された。今後は Complexity Level を主判定軸として使用し、本節は歴史的経緯として保持する。抽象度と Complexity Level の対応: 高 → L1、中 → L2、低 → L3、極低 → L3（Phase 分割 + パターン C 適用、`docs/DEV-GUARDRAILS.md` § 3-alt）。**

## 2. 例外条項: Docs Infrastructure Issue

ドキュメント編集のみで相互参照が強い場合、複数ファイルでも単一 Issue で扱ってよい。ただし以下を厳守:

- 堅固化パターン B の Phase 6（Naoya 目視承認）を必ず実施
- コミット分離（Phase A の新規追加 / Phase B の既存編集 / 実装レポート）を徹底
- Issue 本文に「例外条項適用」の理由を明記

## 3. 判定フロー（Issue 起票前、Claude 実施）

1. 影響ファイル数を推定
2. コード変更行数を推定
3. § 1 のマトリックスから抽象度レベルを決定
4. § 4 の Pre-Issue Recon が必要か判定
5. 抽象度に応じて Issue 本文の詳細度を調整

## 4. Pre-Issue Recon（規模 100 行以上で推奨）

Claude が実装エージェントに「現状調査依頼」を発行:

### 4.1 目的

- Claude が index.html 全行を取得する代わりに、実装エージェントに該当箇所だけスキャンさせて MD 化
- Claude が読むのは Recon MD（数百行程度）のみ
- Claude のトークン節約 + Issue 本文の正確性向上

### 4.2 Recon 依頼の Issue Comment テンプレート

Claude が Issue に Comment で以下を投稿:

```markdown
🤖 **Claude より（Pre-Issue Recon 依頼）**

## 目的

Issue <番号>（<Issue タイトル>）の Issue 本文作成のための現状調査。
コード変更は禁止。以下の情報のみ収集して MD 出力すること。

## 調査項目

1. <対象ファイル> の <該当領域> で以下が既に定義されているか:
   - <項目 1>
   - <項目 2>
2. <関連する既存関数/変数の特定>、行番号を報告
3. <差分実装に必要な既存構造の確認>

## 出力先

`docs/cursor/recon/pre-issue-recon-YYYYMMDD-<topic>.md`

## 中断条件

- 判断が困難な場合、その旨を MD に記載して中断
- 他ファイルへの影響が見えた場合、追加調査せず MD に記載して中断

---
_Claude による自動投稿_
```

### 4.3 Recon MD のフォーマット

実装エージェントが出力する MD:

```markdown
# Pre-Issue Recon — <Issue タイトル>

## 対象 Issue

- Issue: #<番号>
- 実施日: YYYY-MM-DD
- Agent: <codex / cursor / claude-code>

## 調査結果

### 項目 1: <調査項目>

- 発見: <該当の有無、行番号、コード抜粋>

## 影響範囲の推定

- 変更対象ファイル数: N
- 変更対象行数の推定: <推定範囲>
- 他ファイルへの波及: <あれば列挙>

## 判断困難な事項

- <あれば列挙、なければ「なし」>

## Claude への申し送り

- <Issue 本文作成時に注意すべき点>

---
_<agent> による自動投稿_
```

### 4.4 Recon 後のフロー

1. 実装エージェントが Recon MD を `docs/cursor/recon/` に配置、コミット + push
2. Claude が Recon MD を MCP で取得
3. Claude が Issue 本文を作成（Recon MD の内容を反映）
4. Naoya さん承認 → 本 Issue（通常の Issue）を MCP 起票
5. 実装エージェントが実装

## 5. 月次レビュー運用

### 5.1 目的

抽象度マトリックス（§ 1）の見積もり精度を継続的に改善する。

### 5.2 実施フロー

- **Naoya さんが月初に Claude に依頼**: 「先月の Issue と実際の diff サイズを振り返って」
- **Claude が MCP で先月の PR を取得**、以下を分析:
  - 事前見積もり規模 vs 実際の diff サイズ
  - 抽象度レベル vs 実装エージェントの完了率（中断回数、追加コミット数）
- **見積もり精度が甘い場合**、Claude がガイドライン更新提案（Issue 起票）
- **Naoya 承認後、本ファイルを更新**

### 5.3 レビュー観点

- 抽象度「中」で出したのに実装エージェントが完了できなかった Issue（→ 抽象度「低」に格上げが必要）
- 抽象度「低」で出したのに中断しなかった Issue（→ 抽象度「中」で足りる、指示の詳細度が過剰）
- Pre-Issue Recon を実施しなかったが、実装中に何度も質問した Issue（→ 該当規模に Recon 必須ルール追加）

## 6. Naoya さんの Chat 内発言と実装指示の橋渡し

Naoya さんが Chat で語る「意思決定の想い」「経緯」「文脈」は、実装エージェントに直接伝わらない。Claude は以下を実施:

1. Chat 内の Naoya さんの発言を Issue 本文の「背景・目的」5 サブセクションに整理
2. Issue 本文が `docs/agent-reports/` の実装レポートに要約される（`docs/DEV-GUARDRAILS.md` § 7 のテンプレート「Issue 背景」セクション）
3. これにより、Naoya さんの想いが 「Chat → Issue → 実装レポート」の順で自動蓄積
4. Projects / Note での発信素材化が可能に

## 7. 抽象度と指示の詳細度の対応表

| 抽象度 | Issue 本文の詳細度 | 完成形コピペ | 差分パッチ | 行番号明示 |
|---|---|---|---|---|
| 高 | 100-300 字 | 不要 | 不要 | 不要 |
| 中 | 300-1000 字 | 部分的 | 部分的 | 一部 |
| 低 | 1000-5000 字 | 必須 | 必須 | 必須 |
| 極低 | Issue 分割推奨 | - | - | - |

例外条項（§ 2）適用時は「低」に相当する詳細度で複数ファイルを扱う。

## 8. 運用の継続性

- 本ファイルは Category A（常時最新化義務）
- 抽象度マトリックス変更時、必ず Issue で起票
- 月次レビュー結果を「変更履歴」セクション（本ファイル末尾、任意）に記録

## Cursor-specific notes

- Cursor は `.cursor/rules/dev-flow.mdc` を併読（Step 2 コメント format の正本は `AGENTS.md`）
- 実装レポートは `docs/agent-reports/cursor-issue-<N>-<slug>.md`（`docs/cursor/reports/` には新規追加しない）
