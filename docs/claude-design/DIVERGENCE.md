# Claude Design — 意図的乖離・スコープ外記録

Category F で **B. CD 意図的乖離** と判定したとき、または CD 準拠を意図的にスコープ外にしたとき、Claude が本表に 1 行追記する。  
乖離が Issue merge で解消されたら、Claude が該当行を削除する。

| 画面 | 乖離内容 | 理由 | 追跡 Issue |
|---|---|---|---|
| 5 言語 variant（全体） | CD は ja と一部 en / ko のみ。zh-Hans / zh-Hant / fil の SP / PC variant は完全欠如 | 既存 i18n 6 言語 translation と Design System トークンで実装品質を担保し、Phase 1-G の CDP QA で検証する | #155 Phase 1-G |
| PC 2 系（2a-pc–2d-pc） | en / ko / zh-Hans / zh-Hant / fil の専用 variant がない | ja 正典を基準に共通レスポンシブ実装と各言語 i18n を適用する | #155 Phase 1-G |
| PC 3 系（3a-pc–3d-pc） | en / ko / zh-Hans / zh-Hant / fil の専用 variant がない | ja 正典を基準に共通レスポンシブ実装と各言語 i18n を適用する | #155 Phase 1-G |
| SP 2b | en / ko / zh-Hans / zh-Hant / fil の専用 variant がない | ja 正典を基準に既存の翻訳と Design System トークンでカバーする | #155 Phase 1-G |
| SP 3 系（3a–3d） | en / ko / zh-Hans / zh-Hant / fil の専用 variant がない | ja 正典を基準に共通実装を使い、言語別の overflow / typography / weight をCDPで検証する | #155 Phase 1-G |
| zh-Hans / zh-Hant / fil | SP / PC の全主要画面で専用 CD variant が完全欠如 | Track A では実装 QA を優先し、CD 完全整備は Track B 準備段階で再検討する | #155 Phase 1-G |
