# Design Canvas — 更新履歴

**2026-07-28 以降**: このファイルは「現行 UI のスナップショット」更新履歴。旧 Claude Design(SaaS) authoring 履歴ではない。運用ポリシーは `README.md` 参照。

| 日付 | 対象ファイル | 内容 |
|---|---|---|
| 2026-07-29 | sp.dc.html, pc.dc.html, design-system.dc.html | **運用切替**: CD SaaS 廃止 → app(`src/index.template.html`) を正本、`.dc.html` はスナップショット化。3 ファイルを Phase-3 round-1〜5 の現行 UI に一致するよう Claude Code が全面書き直し。SP は 17 フレーム(1a-ja/en/ko/zh-CN/zh-TW/fil + 3a/2a/2b/2c/2d/2a-answered/3b/3d/3e/3f/3h)、PC は 11 フレーム、design-system は tokens + Modal placement + Drill accent badge + A-Z card + 2-pane drill + IPA info modal を追加。旧 favicon showcase は削除(favicon.svg は同ディレクトリに残置) |
| 2026-07-27 | sp.dc.html, pc.dc.html | 完全一致プロジェクト CD修正指示書(cd-updates/2026-07-27)適用。CD-1 目的から選ぶ削除(SP/PC 3言語)、CD-2 デバイス枠装飾(9:41/●●●●)削除(SP 全13フレーム。うち #3c は Claude Code が直接パッチ)、CD-3 SRS マーキング縦→横3ボックス(3g)、CD-4 モーダルカード #FFFFFF、CD-5 1a フッターに IPA って何→#3e/言語設定→#3f 導線(3言語)、CD-6 #3f 言語設定ページ導線。語彙リスト(3b/3b-pc)・トークンは不変 |
| 2026-07-27 | sp.dc.html | CD-4 取消(Q10 再決定)。オンボ4スライドカード背景 #FFFFFF→var(--panel)(#FDFBF7)。Claude Code 直接パッチ。※Claude Design ソースでも CD-4 を破棄し panel 色に統一のこと |
| 2026-07-23 | 全ファイル | 初期配置。Phase 1-E 検収後の UI 一括改修に伴い、SP/PC/Design System/favicon の 4 ファイルを配置。閲覧用 `support.js` も同梱 |
