# knowledge/ — 再利用可能な進め方・モデル集

プロジェクト固有の docs（`docs/`）とは別に、**他サービスへ横展開できる「進め方・手法・ケーススタディ」**を置く場所。

- 手法・モデル: `*.md`（例: `ux-data-feasibility-method.md`）
- 具体的な記載例: `examples/*.md`

対応する実行ツール（skill）:
- `.claude/skills/ux-brief/` — 設計前に現実接地した brief を作る
- `.claude/skills/ux-review/` — 出力をデータ/コードで叩く

> このフォルダは意図的に `docs/` の doc-map/front-matter 規約の外に置く（横展開用の一般知識のため）。
