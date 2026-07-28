# Design Canvas — IPA Sound Drill

**このディレクトリは「現行 UI のスナップショット」を保管する場所です。**
UI 仕様の正本は `src/index.template.html`(実装)。ここの `.dc.html` は Naoya と UI 議論するための **静的リファレンス** です。

## 運用ポリシー（2026-07-28 以降）

1. **`src/index.template.html` が正、`.dc.html` は追随スナップショット**
2. **Claude Design(外部 SaaS) は今後使わない**。更新も参照も反映待ちもしない。
3. **UI 議論・合意は本ディレクトリの `.dc.html` を見ながら行う**。CD セッションの再開・zip 受領・round-trip 指示書などの旧ワークフローは廃止。
4. `.dc.html` は Claude Code が `src/index.template.html` の変更に合わせて更新する（Naoya が明示的に要求した時のみ）。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `design-system.dc.html` | トークン・タイポ・コンポーネント・設計判断まとめ・ファビコン |
| `sp.dc.html` | SP (モバイル ~375px) 全画面のスナップショット |
| `pc.dc.html` | PC (デスクトップ) 全画面のスナップショット |
| `favicon.svg` | アプリマーク / ファビコン SVG |
| `support.js` | ローカル閲覧時のランタイム（`.dc.html` を素の HTML として開けるようにする） |
| `update-log.md` | スナップショットの更新履歴 |
| `PARITY-CATALOG.md` | 旧 CD-parity 時代の差分カタログ（**歴史的資料**。参照はできるが更新しない） |
| `DIVERGENCE.md` | 旧 CD 意図的乖離の記録（**歴史的資料**） |
| `UPDATE-GUIDE.md` | 旧 CD 更新指示書の作成ガイド（**廃止**、参照禁止） |
| `cd-updates/` | 旧 CD 更新指示書アーカイブ（**廃止**、参照禁止） |

## 参照方法（新運用）

- **見た目確認**: `docs/claude-design/{sp,pc}.dc.html` をブラウザで開き、フレーム ID（例: `#1a`, `#2a`, `#3b`）で該当画面を探す。
- **トークン確認**: `docs/claude-design/design-system.dc.html`
- **正本コード確認**: `src/index.template.html`（CSS + HTML + JS すべて含む）

Issue 本文で対象画面を示す場合、`docs/claude-design/sp.dc.html#3b` のように書けば足りる（従来通り）。

## スナップショット更新のタイミング

- Naoya が「見た目を最新化して」と依頼した時のみ、Claude Code が `src/index.template.html` を read してこの 3 ファイルを再生成する。
- 逐一同期は **やらない**（`.dc.html` が実装より数日遅れているのは許容）。

## 旧 CD ワークフロー（廃止）

過去には Claude Design SaaS で UI を authoring → export → repo 同期していたが、**このワークフローは 2026-07-28 に廃止**。理由:

- CD → app の同期に文字指示書を使う必要があり、意図の反映漏れが起きやすい
- CD を「正本」扱いすると、実装ずれの解消が Naoya の負担になる
- 現状は静的 HTML の実装が十分軽量で、実装そのものを正にできる

過去の指示書（`cd-updates/*.md`）は歴史的資料として残すが、**新規作成は禁止**。

## Claude / Cursor / Codex への指示

- **UI 改修 Issue で CD 更新を要求しない・待たない**
- **CD の URL / 外部リンク / 再開セッションを促さない**
- **`.dc.html` の更新は Naoya が明示的に要求した時のみ**
- **仕様確認は `src/index.template.html` + 本ディレクトリの `.dc.html` の 2 点セット**
