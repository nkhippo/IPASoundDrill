# Design Canvas — 更新履歴

**2026-07-28 以降**: このファイルは「現行 UI のスナップショット」更新履歴。旧 Claude Design(SaaS) authoring 履歴ではない。運用ポリシーは `README.md` 参照。

| 日付 | 対象ファイル | 内容 |
|---|---|---|
| 2026-07-29 | sp.dc.html, pc.dc.html, design-system.dc.html | **Phase-3 round-6 拡張**: Naoya フィードバック 4 件反映。(1) モーダル 3 種 (3e/3f/3h) を「背面 1a top を blur+opacity で沈める + スクリム rgba(20,18,15,.42) + 上寄せ padding-top:56px の浮遊カード」の三層構造に。「モーダルであることを視覚的に伝える」。(2) PC ドリルフレームに `body.in-play` の paper 装飾 (外 canvas #E7E1D7 + 内 wrap-card #F3EDE6 max-width:1024px + shadow 0 14px 44px rgba(0,0,0,.07)) を再現。(3) 4 目的 × 3 状態 (pending/correct/incorrect) を PC/SP それぞれ 12 フレームで整備。実データ例: 2a `/ˈhɛd.foʊn/`→headphone、2b real→`/riːl/`、2c `/pɛr/`→pair (mode B study: 「意味を確認する」flow)、2d `/ˌhoʊl.də.nəˈsɛk/`→"hold on a sec"。正解 badge=signal ✓、不正解 badge=accent ×。(4) terms/privacy プレビューフレームを SP/PC 双方に追加 (brand mark 24px + panel カード + 明朝 h1 + teal rule + 6 言語対応の back link)。design-system.dc.html には「モーダル三層クロスセクション」「ドリル 3-STATE 凡例」「legal ブランドカード」の 3 セクションを追加 |
| 2026-07-29 | sp.dc.html, pc.dc.html, design-system.dc.html | **運用切替**: CD SaaS 廃止 → app(`src/index.template.html`) を正本、`.dc.html` はスナップショット化。3 ファイルを Phase-3 round-1〜5 の現行 UI に一致するよう Claude Code が全面書き直し。SP は 17 フレーム(1a-ja/en/ko/zh-CN/zh-TW/fil + 3a/2a/2b/2c/2d/2a-answered/3b/3d/3e/3f/3h)、PC は 11 フレーム、design-system は tokens + Modal placement + Drill accent badge + A-Z card + 2-pane drill + IPA info modal を追加。旧 favicon showcase は削除(favicon.svg は同ディレクトリに残置) |
| 2026-07-27 | sp.dc.html, pc.dc.html | 完全一致プロジェクト CD修正指示書(cd-updates/2026-07-27)適用。CD-1 目的から選ぶ削除(SP/PC 3言語)、CD-2 デバイス枠装飾(9:41/●●●●)削除(SP 全13フレーム。うち #3c は Claude Code が直接パッチ)、CD-3 SRS マーキング縦→横3ボックス(3g)、CD-4 モーダルカード #FFFFFF、CD-5 1a フッターに IPA って何→#3e/言語設定→#3f 導線(3言語)、CD-6 #3f 言語設定ページ導線。語彙リスト(3b/3b-pc)・トークンは不変 |
| 2026-07-27 | sp.dc.html | CD-4 取消(Q10 再決定)。オンボ4スライドカード背景 #FFFFFF→var(--panel)(#FDFBF7)。Claude Code 直接パッチ。※Claude Design ソースでも CD-4 を破棄し panel 色に統一のこと |
| 2026-07-23 | 全ファイル | 初期配置。Phase 1-E 検収後の UI 一括改修に伴い、SP/PC/Design System/favicon の 4 ファイルを配置。閲覧用 `support.js` も同梱 |
