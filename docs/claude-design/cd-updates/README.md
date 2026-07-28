# [アーカイブ] CD 更新指示書

**このディレクトリのファイルは歴史的資料です。参照はできますが、新規作成は禁止です。**

2026-07-28 に Claude Design(外部 SaaS) を UI 仕様の正本として使う運用は廃止しました。UI 仕様の正本は `src/index.template.html`(実装)、リファレンススナップショットは `docs/claude-design/{sp,pc,design-system}.dc.html` です。詳細は `docs/claude-design/README.md` を参照。

新運用では:

- **CD 反映指示書は書かない**（本ディレクトリに新規 md を追加しない）
- **CD への同期・round-trip を計画しない**
- UI 議論は本リポ内の `.dc.html` を見ながら行い、合意したら実装 (`src/index.template.html`) を書き換える

過去指示書は当時の意思決定ログとして残しているので、経緯を追う時のみ参照してください。
