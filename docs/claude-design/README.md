# Design Canvas — IPA Sound Drill

**このディレクトリは「UI フレームカタログ」を保管する場所です。**
UI 仕様の正本は `src/index.template.html`(実装)。ここの `.dc.html` は「この画面にはどういう状態がある」を俯瞰する**凍結フレーム一覧**です。

## 運用ポリシー（2026-07-29 改定）

1. **`src/index.template.html` が正、`.dc.html` は凍結フレームカタログ**（pixel-perfect 精度は追求しない。画面一覧としての価値のみ残す）
2. **Claude Design(外部 SaaS) は今後使わない**。更新も参照も反映待ちもしない。
3. **UI 改修の議論・確認は Vercel branch preview URL で行う**。PR/branch ごとに preview が自動生成されるため、develop マージ前に実機確認できる。
4. `.dc.html` は**更新義務なし**。実装より遅れていても許容する。Naoya が「カタログを最新化して」と明示した場合のみ更新する。

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

## 参照方法

- **画面一覧の俯瞰**: `docs/claude-design/{sp,pc}.dc.html` をブラウザで開き、フレーム ID（例: `#1a`, `#2a`, `#3b`）で該当画面を探す。ただし**見た目の正確性は保証しない**（凍結カタログのため実装とズレている場合がある）。
- **正確な見た目の確認**: Vercel branch preview URL（PR 作成時に自動生成）または `npm run build && python3 -m http.server 8080` でローカル確認。
- **トークン確認**: `docs/claude-design/design-system.dc.html`
- **正本コード確認**: `src/index.template.html`（CSS + HTML + JS すべて含む）

Issue 本文で対象画面を示す場合、`docs/claude-design/sp.dc.html#3b` のように書けば足りる。

## カタログ更新のタイミング

- Naoya が「カタログを最新化して」と明示した時のみ更新する。
- 逐一同期は**やらない**。カタログが実装より遅れているのは正常な状態。
- **pixel-perfect は技術的に困難**（Claude が CSS/HTML を読んで再構築する方式のため、必ず視覚的ドリフトが生じる）。カタログの目的は「フレーム一覧」であり「正確なモックアップ」ではない。

## 旧 CD ワークフロー（廃止）

過去には Claude Design SaaS で UI を authoring → export → repo 同期していたが、**このワークフローは 2026-07-28 に廃止**。理由:

- CD → app の同期に文字指示書を使う必要があり、意図の反映漏れが起きやすい
- CD を「正本」扱いすると、実装ずれの解消が Naoya の負担になる
- 現状は静的 HTML の実装が十分軽量で、実装そのものを正にできる

過去の指示書（`cd-updates/*.md`）は歴史的資料として残すが、**新規作成は禁止**。

## Claude / Cursor / Codex への指示

- **UI 改修 Issue で CD 更新・`.dc.html` 更新を要求しない・待たない**
- **CD の URL / 外部リンク / 再開セッションを促さない**
- **`.dc.html` の更新は Naoya が「カタログ最新化」を明示した時のみ**
- **UI 仕様の正本は `src/index.template.html`**。`.dc.html` は画面一覧用で、見た目の正確性は保証しない
- **UI 改修の見た目確認は Vercel branch preview URL で行う**（branch ごとに自動生成される）
