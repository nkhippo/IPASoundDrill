# Claude Design — IPA Sound Drill

UI/UX の正典 (Source of Truth)。Cursor/Codex は UI 改修 Issue で必ずここを参照する。

## ファイル構成

| ファイル | 内容 |
|---|---|
| `design-system.dc.html` | トークン・タイポ・コンポーネント・設計判断まとめ・ファビコン |
| `sp.dc.html` | SP (モバイル 375px) 全画面: トップ (JA/EN/KO)・4 ドリル・支援画面 |
| `pc.dc.html` | PC (デスクトップ) 全画面: トップ・ドリル・支援画面 |
| `favicon.svg` | アプリマーク / ファビコン SVG |
| `support.js` | Claude Design ランタイム（`.dc.html` をブラウザで開くときに必要） |
| `update-log.md` | 更新履歴 |
| `UPDATE-GUIDE.md` | CD 更新指示書の作成ガイド・Claude Design セッション運用ルール |

## 参照方法

Issue 本文で `docs/claude-design/sp.dc.html` のように指定し、セクション ID（例: `#1a-ja`, `#3a`, `#3c`）で対象画面を特定する。

ローカルでプレビューする場合は、同ディレクトリの `support.js` が相対パス `./support.js` で読まれるため、`docs/claude-design/` 配下をそのまま開くこと。

## 関連ドキュメント

- **CD 更新指示書の作成ガイド**: [`UPDATE-GUIDE.md`](./UPDATE-GUIDE.md) — CD 更新が必要になった時の指示書作成ルール、Claude Design セッション運用ルール、多言語対応方針を定義

## 運用ルール

1. **CD ファイルが添付されていない UI 改修 Issue は着手禁止**
2. **「CD と同じ UI で」指示時、Issue に記載のない差分を発見したら Phase 0 Comment でレポート → Claude/Naoya 判断待ち**
3. CD ファイルの更新は Claude Design セッション → Chat で zip 受領 → Cursor PR の順で行う
4. 部分更新時も該当ファイル丸ごと差し替え（差分パッチ禁止）
