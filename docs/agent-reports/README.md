---
id: pj-2026-07-20-e7a1
aliases:
- pj-2026-07-20-e7a1
title: 'docs/agent-reports/ — AI エージェント実装レポート統合ディレクトリ'
created: '2026-07-20'
---

# `docs/agent-reports/` — AI エージェント実装レポート統合ディレクトリ

すべての AI エージェント (Codex / Cursor / Claude Code / その他) が実装完了時に生成する**実装レポート**を集約するディレクトリ。

## 目的

- エージェント混在時に「どこにレポートを書けばよいか」を明確にする
- レビュー時にエージェント間の実装品質・パターンを横断比較できる
- Complexity Retrospective の追跡と月次レビューを容易にする

## ファイル命名規則

```
docs/agent-reports/<agent>-issue-<N>-<slug>.md
```

- **`<agent>`**: `codex` / `cursor` / `claude-code` など (小文字、ハイフン区切り)
- **`<N>`**: 対応する Issue 番号 (プレフィックスの `#` は含めない)
- **`<slug>`**: Issue タイトルから派生した簡潔な英小文字スラッグ (ハイフン区切り、20 字以内推奨)

### 例

- `codex-issue-94-readme-integration-test.md`
- `cursor-issue-123-tts-latency-fix.md`
- `claude-code-issue-200-i18n-key-audit.md`

## テンプレート

新規レポートは `docs/agent-reports/TEMPLATE.md` をコピーして使用する。すべてのセクションを埋めること (該当なしなら「なし」と明記)。

## 過去レポートとの関係

`docs/cursor/reports/` は 2026-07-20 以前の historical archive として保持。

新規レポート (2026-07-20 以降) はエージェント問わず本ディレクトリに書く。

## 参照ドキュメント

- `AGENTS.md` (repo root): 実装レポート必須要件の正本
- `docs/CHANGE-CLASSIFICATION.md`: Complexity Level / Change Pattern の判定基準
- `docs/DEV-GUARDRAILS.md`: 堅固化パターンと Retrospective テンプレの出典
