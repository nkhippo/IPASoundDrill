---
created: 2026-07-16 02:00:00+09:00
project: IPASoundDrill
status: confirmed
summary: Phase 1 (Claude Design プロトタイプ探索) 品質を最大化するための資料強化戦略。現状の資料層分析、追加推奨 8 資料の優先度付き提案、既存資料の強化ポイント、ブリーフ構造化テンプレート、実行順序。Opus
  からの戦略提案 (2026-07-15)、Naoya 判断完了 (2026-07-16)。
tags:
- ipasounddrill
- claude-design
- phase-1
- design-strategy
title: IPA Sound Drill - Claude Design 入力資料強化戦略提案
type: strategy
updated: 2026-07-16 02:30:00+09:00
id: pj-2026-07-16-b8ab
aliases:
- pj-2026-07-16-b8ab
---

## 目的

Phase 1 の Claude Design プロトタイプ探索でアウトプット品質を最大化する。現状の資料は 5 層のうち 2 層しか埋まっていないため、Design AI が IPA Sound Drill 固有の "尖り" を反映できない状態。追加投資すべき資料を優先度付きで示す。

## 現状の資料層分析

Design AI が良い出力を出すには 5 層の資料が必要:

| 層 | 中身 | 現状 | 状態 |
|---|---|---|---|
| **Vision** | なぜ・何を・誰のために | `PURPOSE.md` v3.24 | 部分 (誰にが薄い) |
| **Content** | どんな言葉で・どんな感情で | 分散 (CLAUDE.md タグライン仮案、i18n JSON 182 leaf、Guide モーダル 8 セクション) | 重大な穴 |
| **Design Principles** | 視覚・動き・音の共通言語 | 未整備 | 重大な穴 |
| **Constraints** | 技術・文化・アクセシビリティ | `SPECIFICATION.md` / `DESIGN.md` / `REPOSITORY-STRUCTURE.md` | 十分 |
| **Reference** | 競合・アート方向性・具体例 | 未整備 | 中程度の穴 |

現状で Claude Design に投げると、"音を扱う真面目な学習アプリ" "Duolingo と TOEFL の中間" の generic な出力に落ち着く。IPA Sound Drill 固有の尖りは反映されない。

## IPA Sound Drill 固有の "尖り" (Design AI に伝えるべき)

Naoya が暗黙知として持っているが、資料に落ちていない要素:

1. **IPA (国際音声記号) は "メタ言語"**: 学習者にとって二重の学習コスト。これを "怖くない" と感じさせるデザインが必要
2. **L1 音韻フィルタからの脱却**: 学習者は "英語の音を母語のフィルタで聴いてしまう" 課題。診断的にも治療的にも設計に反映すべき
3. **音先行の語彙獲得 (Mode B)**: 業界に類例が少ない。既存の "単語カード" 系デザインの型は使えない
4. **6 言語対応の重心が非西洋**: ja / ko / zh / fil で、Duolingo 的 US-centric デザインは合わない可能性
5. **単独開発者の Track A 制約**: 静的 HTML + GAS の縛り。派手なインタラクションは Track B 対応

## Tier 別追加資料の提案

### Tier 1: Claude Design 品質への直接的インパクト大

**優先度**: **★★★** (これらを入れずに Phase 1 に進むのは非推奨)

#### 1. `docs/design/user-personas.md` (推奨サイズ: 8-12 KB)

**内容**: 3-5 パターンのペルソナ。各ペルソナに以下:

- **Origin story**: なぜ英語を勉強するに至ったか
- **Current frustration**: 何が壁になっているか
- **Motivation**: 何が動機を持続させるか
- **Success moment**: 何をもって "成功" と感じるか
- **Distraction risk**: 何が離脱を招くか
- **UI/UX 期待値**: どんな見た目・触感を期待するか (国・世代・職業ベース)

**例示ペルソナ (仮案)**:
- **P-1: 田中健太 (34, 東京の SIer 中堅)**: TOEIC 730 で頭打ち、社内英語会議で「音が聞き取れない」自覚。Duolingo 3 ヶ月続けたが手応えなし
- **P-2: 김서연 (28, ソウルの外資広告代理店)**: TOEIC 950、reading OK、L と R の聞き分けが未だ苦手。真面目な学習ツールを好む
- **P-3: Maria Santos (22, マニラ、遠隔外資 CS)**: 職場で必要な英語は喋れるが、"アメリカ人ぽく" 話したい。フィリピン英語との差を意識
- **P-4: 陈静 (19, 上海の大学生)**: 米国大学院進学準備、TOEFL Speaking スコア狙い。既存 TOEFL 対策アプリは硬すぎ
- **P-5: 前田唯 (16, 京都の高校生)**: 洋楽が好きで英語を勉強、音楽と同じくらい "美しい" 学習体験を求める

**Why**: これがないと Claude Design は "generic language learner" を想定する。ペルソナがあると、"あるペルソナがこの画面を見た時どう感じるか" の判断ができる。

#### 2. `docs/design/product-principles.md` (推奨サイズ: 5-8 KB)

**内容**: 5-7 の原則。各原則に「なぜ」「トレードオフ」「反例」を添える。

**候補 (仮案)**:
- **原則 1: メタ言語 (IPA) の露出は最小化するが、主軸として尊重する** — IPA は道具、目的ではない。ただし薄めない
- **原則 2: 学習者の意思決定回数を減らす。目的から入る** — 認知負荷は学習に使わせたい
- **原則 3: 音は視覚化して同時提示する。音だけでは覚えられない** — L1 フィルタの克服には視覚の助けが要る
- **原則 4: 達成の視覚化は禁欲的に。ゲーム的な派手さは真剣さを損なう** — 学習者は "真面目な自分" と対話したい
- **原則 5: 6 言語で "同じ声" にする** — 翻訳ではなく声のロカライズ
- **原則 6: 各画面には 1 つの主軸情報がある** — 情報密度は制御する (C-10 Reveal 画面の教訓)
- **原則 7: 学習履歴は所有物であり、監視物ではない** — SRS の進捗は個人の資産

**Why**: 原則があると、Design AI が判断に迷った時のデフォルトが決まる。ないと "どちらもよさそう" で決めきれず、いつもの答えに落ちる。

#### 3. `docs/design/voice-and-tone.md` (推奨サイズ: 6-10 KB)

**内容**: ThinkGrindAi の `docs/design/voice-and-tone.md` を参照。以下を書く:

- **Product voice** (全体像): 硬派 or 親しみ or 学術? IPA Sound Drill なら "教養ある親しみ" 系か
- **Tone spectrum**: 状況別 (エラー時、成功時、初回訪問、退出確認、Guide 説明) の温度差
- **Vocabulary preferences**: 使う言葉・避ける言葉
- **Cultural tone matrix**: 6 言語圏ごとの "声" の期待値差 (例: 韓国語では敬語レベルの選択、中国語では簡繁の距離感、フィリピン語では家族的親しみ)
- **Taboo list**: 「絶対にやらない」表現 (ゲーム的な祝福、上から目線、幼児向け、Duolingo 的な擬人化キャラクター)

**Why**: 6 言語対応で最も破綻しやすいのが Voice & Tone。ここがないと、翻訳者/Cursor/LLM が各自の解釈で書いてしまい、Design AI がプロダクトの "声" を捉えられない。

### Tier 2: 差別化と一貫性

**優先度**: **★★** (Phase 1 前に望ましい、Phase 1 と並行でもよい)

#### 4. `docs/design/sensory-design.md` (推奨サイズ: 5-8 KB)

**内容**: 音を扱うプロダクトとして、音象徴を視覚化する共通言語を定義。

**問い**:
- 音を線で表現する時、どんな線か? (波形? スペクトログラム? 書道の運筆?)
- 強勢を視覚化する時、何を使うか? (太字? 色? サイズ? 位置?)
- IPA 記号のタイポグラフィックな扱いは?
- 沈黙 (無音) と音の対比をどう見せるか?
- 音の質感 (硬い、柔らかい、鋭い、丸い) と色・形の対応関係は?

**参照可能な視覚方向性の例**:
- 音楽記譜法の系譜 (グレゴリオ聖歌譜 → 現代五線譜 → 図形楽譜)
- 坂本龍一のアルバムアートワーク
- 井上嗣也の書物装丁 (静けさと余白)
- Reactable のような音のオブジェクト化
- 波形の抽象的表現 (ステファン・ザガマイスターのタイポグラフィ実験)

**Why**: 音を扱うプロダクトなのに視覚言語が音と無関係だと、"音アプリらしくない" 見た目になる。Design AI にはこの層の指示が要る。

#### 5. `docs/design/anti-patterns.md` (推奨サイズ: 4-6 KB)

**内容**: 明示的に "やらない" リスト。各項目に「なぜやらないか」を添える。

**候補 (仮案)**:
- **連続正解時のファンファーレ・紙吹雪**: 学習者の内発的動機を外発化する
- **キャラクター (擬人化された助手・先生)**: 学習の主体は自分であるべき
- **バッジ・レベルアップの過剰な演出**: 進捗は個人の資産、監視物ではない
- **TOEIC 対策的な硬派な機械感**: 学習者を "受験者" に固定化する
- **初学者向けの過度に "優しい" イラスト**: 学習者を子供扱いする
- **AI キャラクターの登場 (ELSA Speak 的)**: プロダクトの声が擬人化に吸い取られる
- **プログレスバーの過剰演出**: 学習は距離ではなく質
- **タイマー・カウントダウン**: 焦らせるのは音の学習に逆効果

**Why**: Design AI は "学習アプリのベストプラクティス" として上記を提案してくる可能性が高い。明示的に NG にしておくと排除できる。

### Tier 3: 深化と将来性

**優先度**: **★** (Phase 1 内での即応性は低いが、中長期の質を高める)

#### 6. `docs/reference/learning-science-foundation.md` (推奨サイズ: 8-12 KB)

**内容**: SLA (第二言語習得論)、認知負荷理論、SRS の理論的裏付け。

**扱うべきトピック**:
- L1 音韻フィルタと Categorical Perception (母語音韻カテゴリ)
- Perceptual Assimilation Model (PAM), Speech Learning Model (SLM)
- SRS (Spaced Repetition System) の理論と Anki / SuperMemo 系との比較
- 認知負荷理論 (Cognitive Load Theory) - Intrinsic / Extraneous / Germane
- Recall vs Recognition (再生 vs 再認) の学習効果
- Encoding Specificity Principle (符号化特定性原理)
- 6 言語圏それぞれの英語音韻獲得研究

**Why**: これがあると Design が "教育的に正しい" 判断ができる。ないと Design AI は "使いやすい UI" だけで判断し、学習効果を損なう提案をしうる (例: 選択肢が多すぎる MCQ、正解を早く見せすぎるフィードバック)。

#### 7. `docs/reference/competitive-landscape.md` (推奨サイズ: 6-10 KB)

**内容**: 競合との明示的比較。各競合に:

- **Positioning**: 何を売りにしているか
- **強み**: 学べる点
- **弱み**: 反面教師の点
- **IPA Sound Drill との差別化ポイント**: どこで戦うか

**扱う競合**:
- **Duolingo**: ゲーミフィケーション、多言語、しかし発音は薄い
- **ELSA Speak**: AI 発音矯正、しかし IPA を軽視
- **Speechling**: 人間コーチング、しかし高価
- **YouGlish**: 動画から発音例、しかし体系的学習ではない
- **iTalki**: 人間講師、しかし学習ツール自体は貧弱
- **Cambridge Pronunciation Dictionary**: 権威、しかし紙的
- **Perapera Kun / Yomichan**: メタ言語で助ける Chrome 拡張
- **Anki 発音 deck**: DIY 的、コミュニティ資産あり

**Why**: 「うちはここが違う」の言語化がないと、Design AI は競合のいいとこ取りを提案してくる。差別化ポイントを明示すると軸がぶれない。

#### 8. `docs/design/mood-board.md` (推奨サイズ: 3-6 KB、リンク多め)

**内容**: 参照する視覚方向性のリンク集 + 各リンクへの short comment。

**方向性のカテゴリ**:
- **静けさの参照**: Notion, Kinfolk, Craig Mod, 松岡正剛 千夜千冊
- **音象徴の参照**: 坂本龍一 async, ECM Records ジャケット, 東京 TDC 年鑑
- **タイポグラフィの参照**: 菊地信義, David Carson, Muriel Cooper
- **教育プロダクトの反面教師**: Duolingo (過度なゲーム化), Rosetta Stone (硬派すぎ)
- **6 言語圏の視覚参照**: 韓国 (Kakao デザイン), 中国 (WeChat のシンプル系), フィリピン (Grab の明るさ)

**Why**: Naoya さんの脳内にある美意識を Design AI に伝える手段。テキストだけでは伝わりにくい "気配" を、参照リンクで補う。

## 既存資料の強化ポイント

### `docs/PURPOSE.md`

**追加すべき内容**:
- ペルソナ・ジャーニー要素 (現状は "何を" と "なぜ" しかない、"誰に" が薄い)
- 感情曲線 (最初の 3 秒 → 1 分 → 1 週間 → 3 ヶ月)
- 各 Mode の "成功体験" の具体像

### `CLAUDE.md`

**独立ドキュメント化**:
- タグライン仮案 → `docs/design/tagline-candidates.md` として全候補 + 各候補の感情プロファイル + 6 言語対応の翻訳可能性を書き出す。Claude Design に複数投入して視覚比較可能に

### `ux-issues-2026-07.md` v2

**追加すべき内容**:
- Reveal 画面の "感情設計" (どこで喜び・どこで学習実感を得るか) を C-10 に統合
- 各 Cluster に "感情ゴール" を追加 (例: Cluster 1 = "3 秒で '自分向けだ' と感じる")

## Claude Design ブリーフの構造化テンプレート

上記資料が揃ったら、Cluster 1-4 別のブリーフを以下の構造で書く:

```markdown
# Brief N: <Cluster 名>

## 1. What we're designing
30 秒で伝わる形で、何をデザインしてほしいか

## 2. Who it's for
docs/design/user-personas.md の該当ペルソナ (P-1, P-3 等) を参照

## 3. What success looks like
- 感情面: 各ペルソナが何を感じるか
- 具体的 UI 挙動: どんなインタラクションで成功と分かるか
- 定量: 目標指標 (滞在時間、離脱率、再訪率)

## 4. What we're NOT doing
docs/design/anti-patterns.md 参照 + このブリーフ固有の NG

## 5. Voice & tone constraints
docs/design/voice-and-tone.md 参照 + このブリーフ固有のトーン指定

## 6. Sensory principles
docs/design/sensory-design.md 参照

## 7. Product principles that apply
docs/design/product-principles.md のうち特に関わる原則を明示

## 8. Technical constraints
docs/SPECIFICATION.md / DESIGN.md 参照 + Track A/B の制約

## 9. References
docs/design/mood-board.md 参照 + このブリーフ固有の参照

## 10. Explicit deliverable
- Form factor: モバイル (375px) 主軸、デスクトップ (1440px) 対応
- 何個: プロトタイプ 3 案、各案に "この案の狙い" コメント
- Deliverable format: HTML (Static) / Figma / React component どれか
```

各ブリーフを 5-10 KB 程度、参照はリンクで済ませる形が理想。

## 実行順序 (Opus 判断)

### Phase 0 完結分 (今 turn で草案化可能)

品質が高まる順序:

1. **X-1: SPEC/DESIGN reconciliation** — 段階 2 レポート 60 項目のうち Category A/B/C の docs-only 修正を一括、Phase 1 の SPEC 参照品質を上げる
2. **X-4: モーダル Escape 対応** — 独立、L1、いつでも
3. **X-6: cs_rule 3 言語追加** — 独立、L1、翻訳のみ

これらは Phase 1 の結果に依存しないため、今 turn で一括草案化して品質は変わらない。

### 資料強化 Phase (Naoya + Claude 並行)

Tier 1 の 3 資料を Phase 1 の前に揃える。目安:

1. `docs/design/user-personas.md` — Naoya 主導 + Claude 補助
2. `docs/design/product-principles.md` — Naoya 主導 + Claude 補助
3. `docs/design/voice-and-tone.md` — Claude 主導 + Naoya レビュー

Tier 2-3 は Phase 1 と並行、または Phase 1 中に必要に応じて追加。

### Phase 1: Claude Design 探索

Cluster 1-4 別のブリーフを起草し、Claude Design にプロトタイプ生成を依頼。**この段階で Q-2 (Mode B の情報階層) が確定**。

### Phase 1 の判断反映が必要な Issue (Phase 1 完了後に順次)

品質が高まる順序:

4. **X-3: Reveal respell 表示** — Cluster 3 プロトタイプで Reveal 情報階層 (C-10) を確定してから
5. **X-2: B2 CEFR pill 追加** — Cluster 1 プロトタイプで認知負荷対策 (C-1) を確定してから、`#cefrNote` 復活/削除もここで確定
6. **X-5: 死コード削除** — X-2 完了 (`#cefrNote` 判断) 後、Q-11-C を最終反映

### 起票時期 (Opus 判断)

- **今 turn**: X-1, X-4, X-6 の草案作成 (Phase 0 完結分)
- **Tier 1 資料整備完了後**: Phase 1 起動 (Claude Design ブリーフ Cluster 1-4 起草含む)
- **Phase 1 完了後**: X-3, X-2, X-5 の草案作成 → 起票

## Naoya さんへの判断依頼 (2026-07-15 確定)

- **Tier 1 資料の追加投資**: **Yes** (確定)
- **Tier 2-3 の扱い**: **Phase 1** で対応 (「全 8 資料を完成させてから次に進む」方針)
- **今 turn での X-1, X-4, X-6 草案**: Claude 任せ (品質最大化順序で判断)
- **Tier 1 資料のドラフト担当**:
  - user-personas.md → Naoya 主導 (Claude が骨格提供)
  - product-principles.md → Naoya 主導 (Claude が骨格提供)
  - voice-and-tone.md → Claude 主導 (Naoya レビュー)

## 履歴

- 2026-07-15: 初版 (Opus 提案)
- 2026-07-16: Naoya 判断確定を反映 (Tier 1 Yes、Tier 2-3 Phase 1、全 8 資料完成後 Phase 1 起動)
