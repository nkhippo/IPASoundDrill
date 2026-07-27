---
name: ux-brief
description: Produce a data-grounded UI/UX brief for a designer (Claude Design or human) BEFORE any mockup. Use when about to design/redesign a screen or feature and you want the design to be realistic — grounded in the project's actual data fields, coverage %, and what is/ isn't derivable. Triggers: "design a screen", "brief for Claude Design", "redesign this feature", "spec a UI", "ux brief".
---

# ux-brief — 現実接地した UX brief を先に作る

デザイナー（Claude Design 含む）は repo のデータ/コードを見られない。だから **設計の前に、実データの実現性を棚卸しして brief に埋め込む**。これをしないと「存在しないフィールド前提」「被覆率不足で空欄」「i18n 漏れ」等の駄作が生まれる。

## 手順
1. **対象を1機能/1画面に絞る**（大きすぎると棚卸しが甘くなる）。
2. **データ&実現性を棚卸し**（この skill の核心。コード/データを実際に開く）:
   - この画面が使うデータの **フィールド名・型・被覆率%** を実測（`grep`/スクリプトで件数を数える。想像で書かない）。
   - **派生できる値**（例: IPA から強勢位置・schwa 有無）。
   - **データに“無い/薄い”もの**を明記（例: 綴り規則 27% しか無い / streak は未追跡）。← 駄作防止の要。
   - すでにロード済なのに**未表示の good データ**が無いか（宝の持ち腐れ探し）。
3. **5節テンプレを埋める**（`references/brief-template.md`）。§A は自分（コード側）が埋める。§B–D は product owner と詰める。§E は査読観点。
4. brief をデザイナー/Claude Design へ渡す。CD へ渡す時は §A を必ず含める（CD はデータを見られないため）。

## 出力
`references/brief-template.md` に沿った Markdown 1枚。§A（データ実現性）が具体的な被覆率%と「無いもの」を含んでいれば合格。抽象語（「適切に」「いい感じに」）は不可。

## 併用
- 出力（デザイン）が返ってきたら `ux-review` skill で叩く。
- 生成の完成度はビジュアル特化ツール（Claude Design）が上。この skill は「生成の前段=現実接地」担当。
