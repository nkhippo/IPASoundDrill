---
name: ux-review
description: Review a UI design/mockup (screenshot, Vercel preview, Figma, or a live screen) against the project's ACTUAL data and code for feasibility and clutter — not just aesthetics. Use when a design comes back and you need to catch infeasible fields, i18n leakage, redundant/cluttered info, fake placeholders, or claim-vs-implementation gaps before building. Triggers: "review this design", "check this mockup", "is this UI feasible", "ux review", "does the data support this".
---

# ux-review — デザインを「データ/コード実装」で叩く

見た目の良し悪しではなく、**その画面が実データ・実コードで成立するか / 雑多でないか**を検証する。正本は `src/index.template.html`。見た目確認は Vercel branch preview URL またはローカルビルドで行う。

## 手順
1. レビュー対象（mockup 画像 / CD フレーム / 実画面）と、対応するデータ/コードを特定。
2. 表示されている**各要素を1つずつデータ源に突合**（想像で OK を出さない。`grep`/スクリプトで被覆率を数える）。
3. 下のチェックリストで指摘。各指摘は **根拠（被覆率%・該当コード行・データ例）** を添える。
4. 「駄作」判定は Severity 付きで（Blocker=実装不能/誤情報 / Major=雑多・i18n漏れ / Minor=磨き）。

## チェックリスト
- [ ] **主張≠実装**: 表示する数値/ステータス/機能は実在するか（例: streak を出すが未追跡 / placeholder のハードコード `7` `312`）
- [ ] **データ被覆率**: そのフィールドは何%の項目にあるか。少数派で空欄・空行にならないか。**空時の見た目**が定義されているか
- [ ] **派生の妥当性**: 「データから導ける」と称する値が本当に導けるか（フィールド名の取り違えに注意。例: `pat` vs `pattern`）
- [ ] **i18n 漏れ**: 生の原文（例: 日本語の品詞 "名詞 / 動詞"）が別言語ユーザーに露出しないか。対応表の未収載率を数える
- [ ] **冗長/重複**: 同じ情報を2回見せていないか（例: "GA=RP" バッジ＋同一の RP 行）
- [ ] **情報の優先順位/雑多さ**: 主役が埋もれていないか。1画面の要素数は妥当か。ノイズになる自動表示（例: 全語に出る schwa 注意 / 要注意音を平均2.7個列挙）が無いか
- [ ] **未活用の good データ**: ロード済なのに未表示の高価値フィールドは無いか（例: respell 98%）

## 出力
Severity 付き指摘リスト（各: 事象 / 根拠 / 修正案）。空なら「データ上成立・雑多なし」を明言。
必要なら次サイクルの対象（未監査の画面/ドリル種別）を提案。

## 併用
`ux-brief` で作った §E をこの skill の観点として流用してよい。設計系の磨き（コピー/a11y/DS 一貫性）は `design-critique` `accessibility-review` `ux-copy` `design-system` skill と併用。
