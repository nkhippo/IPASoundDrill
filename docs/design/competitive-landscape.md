---
created: 2026-07-16 04:20:00+09:00
project: IPASoundDrill
status: draft-for-review
summary: 英語発音・音声学習の主要プロダクト (Duolingo / ELSA Speak / Speechling / YouGlish / Cambridge
  Dictionary / Anki / iTalki / Rosetta Stone) との比較。IPA Sound Drill の 6 つの差別化ポイントと
  Anti-competitive stance を明確化。Positioning Map で Deep IPA + Structured の稀有なニッチを占めることを確認。
tags:
- ipasounddrill
- design
- competitive-landscape
- tier-3
- phase-1-input
title: IPA Sound Drill - Competitive Landscape
type: reference
updated: 2026-07-16 04:20:00+09:00
id: pj-2026-07-16-2663
aliases:
- pj-2026-07-16-2663
---

## 目的

英語発音・音声学習の主要プロダクトと **明示的に比較** し、IPA Sound Drill の差別化ポイントを言語化。Claude Design が "競合のいいとこ取り" を提案してくることを防ぐ。

## このドキュメントの位置づけ

- **性質**: Claude 主導のドラフト。競合分析は公開情報 + Claude の知識に基づく。詳細な精度は Naoya さんが実際に触ったことがある競合について精緻化
- **完成度目標**: Phase 1 起動前に、8 主要競合との差別化が明確
- **参照される場面**:
  - Claude Design ブリーフの §9 "References"
  - LP コピー・タグライン作成時
  - 新機能検討時の "これは競合の何か" 判断

## 分析フレームワーク

各競合に以下を書く:

- **Positioning**: 何を売りにしているか (自己主張)
- **強み (Strengths)**: 学べる点、優れた設計要素
- **弱み (Weaknesses)**: 反面教師の点、避けるべき設計要素
- **IPA Sound Drill との差別化**: どこで戦うか、共通点と異なる点
- **Anti-competitive stance**: 何を **模倣しない** か

## 主要競合 8 プロダクト

### 1. Duolingo (2011-)

- **Positioning**: 「無料で楽しく多言語学習」— ゲーミフィケーションで学習継続をサポート
- **強み**:
  - 巨大な MAU (5,000万+)、圧倒的な認知度
  - 短時間セッション設計 (1 レッスン 3-5 分)
  - 40+ 言語対応
  - モバイル UX の完成度
- **弱み**:
  - 発音は "選択問題 + tap で聞く" レベル、体系的な音声学的教育なし
  - ゲーミフィケーション (Streak, XP, League) が学習の本質を薄める
  - IPA を扱わない (メタ言語の露出ゼロ)
  - 上級者に物足りない ("A2 レベルで卒業" と言われる)
- **IPA Sound Drill との差別化**:
  - IPA を主軸に据える (Duolingo の対極)
  - ゲーミフィケーションを採用しない (原則 4)
  - 発音の音声学的深さで戦う
  - 6 言語対応で言語数を絞り、発音の深さで勝負
- **Anti-competitive stance**:
  - Streak プッシュ (Anti-pattern A-1)
  - XP / Level up (A-2)
  - キャラクター (Duo the owl、B-1)
  - Leaderboard (A-4)

### 2. ELSA Speak (2016-)

- **Positioning**: 「AI 発音矯正」— スマホで発音を録音、AI が精確な発音スコアリング
- **強み**:
  - 音声認識技術の精度が業界トップクラス
  - 個別の弱点分析 (どの音素が苦手か明示)
  - モバイル最適化
  - 継続的な改善 (AI モデルのアップデート)
- **弱み**:
  - IPA を軽視 (発音矯正ツールとして IPA を扱わない)
  - "AI キャラクター (ELSA)" の擬人化 (Voice が擬人化に吸われる)
  - スコアリング主義 (0-100 点評価、原則 4 違反)
  - 有料 (Premium $12/月)、無料版は制限的
  - 学習者の "意見" よりも AI の "判定" が優先される構造
- **IPA Sound Drill との差別化**:
  - IPA を主軸 (ELSA は IPA を扱わない)
  - 音声認識に依存しない (Track A は静的 HTML の制約でもあるが、原則的に AI 依存を避ける)
  - スコアリング (数値評価) を採用しない (原則 4, 7)
  - AI キャラクター登場なし (Voice 保持)
- **Anti-competitive stance**:
  - AI キャラクター (Anti-pattern B-1)
  - スコアリング UI (F-1)
  - "発音矯正" 語彙 (Voice-and-tone Taboo)

### 3. Speechling (2016-)

- **Positioning**: 「人間コーチによる発音指導」— 学習者の録音を人間コーチがフィードバック
- **強み**:
  - 人間コーチの深いフィードバック (AI 不可能な質)
  - 特定の発音課題に特化
  - 大人の学習者向けの真面目な設計
- **弱み**:
  - 高価 ($20/月)、スケールしない
  - コーチ品質のバラつき
  - フィードバックまでの時間差 (即時ではない)
  - IPA の扱いは副次的
- **IPA Sound Drill との差別化**:
  - スケーラブル (静的 HTML、無料、自習型)
  - IPA を主軸 (Speechling は人間コーチが主軸)
  - 即時フィードバック (Reveal 画面で自己確認)
- **Anti-competitive stance**:
  - 特になし (Speechling は真面目な設計で参考にできる点も多い)、ただし人間コーチモデルは Track A/B 共に採用しない

### 4. YouGlish (2015-)

- **Positioning**: 「動画コーパスから発音例を検索」— YouTube 動画から任意の単語の発音例を集める
- **強み**:
  - リアルな発音の網羅性 (バラエティ豊か、native speaker の生音声)
  - 無料
  - 検索インターフェースがシンプル
- **弱み**:
  - 体系的学習ではない (探して聞くだけ)
  - IPA を表示するが説明はない
  - "音を聞いた後どうする" が学習者任せ
- **IPA Sound Drill との差別化**:
  - 体系的な SRS ベースの学習 (YouGlish は検索ツール)
  - IPA を "使いこなす" ための説明・演習を提供
  - Learning Session の構造化
- **Anti-competitive stance**:
  - 特になし。YouGlish は補完関係 (IPA Sound Drill 学習者が発音例を探す時に使うと良い)

### 5. Cambridge Pronunciation Dictionary (紙 / アプリ)

- **Positioning**: 「発音の権威ある reference」— 学術的に精確な IPA + 音声辞書
- **強み**:
  - 音声学的精度が業界最高
  - IPA の徹底的な使用
  - GA / RP 両方対応
  - 権威性 (Cambridge University Press)
- **弱み**:
  - "使いにくい" (辞書として使うのが主)
  - 学習体験の設計は薄い (単語検索して聞くだけ)
  - UI は古い (アプリも紙世代の翻訳的な UI)
  - IPA の "怖さ" を緩和する設計なし
- **IPA Sound Drill との差別化**:
  - 学習体験の設計 (Session、SRS、Feedback loop)
  - IPA の "怖くない導入" (原則 1)
  - モバイル最適化
  - 動的な学習軌跡 (Cambridge は静的 reference)
- **Anti-competitive stance**:
  - 硬派すぎる UI (C-3 カートゥーンの逆、しかし過度な学術性も避ける)

### 6. Anki (2006-, community pronunciation decks)

- **Positioning**: 「究極の SRS ツール」— DIY 型の柔軟な学習カード + Spaced Repetition
- **強み**:
  - SRS アルゴリズム (SM-2、FSRS) の完成度
  - 完全カスタマイズ可能
  - コミュニティによる pronunciation deck (IPA 含む)
  - オープンソース (無料 + 自由)
- **弱み**:
  - 初心者に不親切 (UI が専門的)
  - 学習コンテンツは自己責任
  - 見た目・UX の設計は薄い (機能主体)
  - コミュニティ deck の品質バラつき
- **IPA Sound Drill との差別化**:
  - 統合されたコンテンツ (5,397 語 + 201 句 + IPA + gloss)
  - UX の完成度 (原則 2 意思決定回数減、原則 6 情報階層)
  - 初心者にも使える (Anki は上級者向け)
- **Anti-competitive stance**:
  - Anki の "機能主体、美意識ゼロ" は反面教師
  - しかし SRS アルゴリズムは学ぶべき

### 7. iTalki (2007-) / Preply (2012-)

- **Positioning**: 「人間講師とのオンライン言語学習」— 実際に話す機会を提供
- **強み**:
  - 会話練習の質 (人間との対話)
  - 講師の多様性
  - 実践的な学習 (実用会話)
- **弱み**:
  - 高価 ($10-30/hour)
  - 発音の体系的学習は講師次第
  - IPA を扱う講師は少ない
- **IPA Sound Drill との差別化**:
  - 発音の体系的学習を IPA で提供 (iTalki の講師個別性を補う)
  - 無料 + セルフサービス
  - "話す前の音の準備" を担う (iTalki は "話す実践")
- **Anti-competitive stance**:
  - 特になし、iTalki は補完関係 (IPA Sound Drill で音を鍛えた後、iTalki で実践すると効果的)

### 8. Rosetta Stone (1992-)

- **Positioning**: 「Immersion 方式で自然に習得」— 母語不使用、画像連想で言語を学ぶ
- **強み**:
  - Immersion 方式の徹底 (歴史的な支持者多数)
  - 学習コンテンツの完成度
  - CI/CD 開発 (継続的な改善)
- **弱み**:
  - 高価 (Lifetime $299)
  - 大人には遅すぎる (Immersion は子供に有効、大人には効率悪い)
  - IPA を扱わない (母語不使用の哲学)
  - Motor Theory / SLM の理論的裏付けを軽視
- **IPA Sound Drill との差別化**:
  - 大人の学習者に最適化 (Rosetta は成人にも子供の学び方を強制)
  - IPA (メタ言語) を活用 (Rosetta は母語不使用主義で対極)
  - 音の Production-Perception 循環を明示 (原則 8)
- **Anti-competitive stance**:
  - Immersion 主義の "母語不使用" は不採用 (Naoya の Design は Guide で日本語説明を含む)

## Positioning Map (2D)

### 縦軸: IPA/発音の扱い (Deep - Shallow)

- Deep: Cambridge Dictionary, IPA Sound Drill
- Middle: Speechling, YouGlish
- Shallow: Duolingo, Rosetta Stone, ELSA (発音扱うが IPA なし)

### 横軸: 学習体験の構造化 (Structured - DIY)

- Structured: Duolingo, ELSA, Speechling, Rosetta Stone, IPA Sound Drill
- DIY: Anki, YouGlish, Cambridge Dictionary

**IPA Sound Drill のポジション**: **Deep IPA + Structured** の右上象限。競合が少ないニッチ。

### 追加軸: 対象言語圏

- 西洋中心: Duolingo, ELSA, Rosetta Stone
- 非西洋対応: IPA Sound Drill (ja/ko/zh/fil)、iTalki (講師の多様性)

**IPA Sound Drill の 6 言語対応 (ja/ko/zh-Hans/zh-Hant/fil)** は独自ポジション。

## IPA Sound Drill の差別化ポイント (総まとめ)

### 1. IPA を主軸として尊重 (原則 1)

- **Deep IPA + Not Scary** の稀有な位置
- Duolingo, ELSA, Rosetta Stone: IPA を扱わない
- Cambridge Dictionary: IPA 主軸だが Not Scary の設計なし
- **IPA Sound Drill 独自**: IPA を主軸にしつつ、"怖くない道具" として扱う設計 (Guide モーダル、視覚的な優しさ)

### 2. Production-Perception 循環の統合設計 (原則 8)

- **業界にほぼ存在しないポジション**
- ELSA: Production (発音) のみ、Perception (聞き取り) は副次
- Duolingo: リスニング / スピーキング独立モジュール
- Rosetta Stone: 音を浴びれば話せると仮定 (Perception → Production の一方向)
- **IPA Sound Drill 独自**: Decode + Encode の両方向設計で循環を実装

### 3. ゲーミフィケーションを採用しない (原則 4)

- 業界の大半は gamification 依存
- 例外: Cambridge Dictionary (機能主体)、YouGlish (検索主体)、iTalki (人間主体)
- **IPA Sound Drill のポジション**: 大人の学習者向けの "禁欲的" プロダクト。P-1, P-2 のペルソナに刺さる

### 4. 非西洋 6 言語対応

- Duolingo, ELSA, Rosetta Stone: 西洋中心 (英語 UI が主軸)
- **IPA Sound Drill 独自**: ja/ko/zh-Hans/zh-Hant/fil の 6 言語で、非西洋圏の学習者を尊重

### 5. 音先行の語彙獲得 (Mode B)

- 業界に類例が非常に少ない
- Anki: DIY で似た使い方が可能だが、コミュニティ deck 依存
- **IPA Sound Drill 独自**: Mode B (音→意味) の明示的な設計

### 6. 無料 + 静的 HTML + 学習者の資産としてのデータ (原則 7)

- Duolingo (Freemium)、ELSA (Premium)、Speechling (Paid)、Rosetta Stone (Premium)、iTalki (Paid) と対照
- Anki は無料 + オープンソースだが、コンテンツは DIY
- **IPA Sound Drill のポジション**: 無料 + 統合コンテンツ + プライバシー配慮 (`va-disable` LS)

## タグライン方向性への含意

競合分析から、以下のポジショニング表現が有効:

### 差別化を強調する候補

- 「IPA で英語の音を練り直す」— IPA + 職人的、Duolingo/ELSA との対比
- 「音を、話せるまで聞く」— 原則 8、Motor Theory-inspired
- 「深い話がしたい人の、発音ドリル」— P-1 の "深い話がしたい" 動機、大人向け明示
- "Drill your English sounds, from IPA up." — 職人性 + IPA 主軸

### 避けるべき (競合と類似)

- "Master English in X minutes a day" (Duolingo 系)
- "AI-powered pronunciation" (ELSA 系)
- "Learn like a native" (Rosetta Stone 系)

## Anti-competitive summary (何を模倣しないか)

| 競合 | 模倣しない要素 |
|---|---|
| Duolingo | Gamification、Streak、キャラクター、Leaderboard、選択問題主義 |
| ELSA Speak | AI キャラクター、スコアリング、"発音矯正" 語彙 |
| Speechling | 人間コーチモデル (スケールしない) |
| YouGlish | 検索型のみ (体系的学習の欠如) |
| Cambridge Dictionary | 硬派な UI、"辞書" 的な使い方 |
| Anki | 機能主体で美意識ゼロ、初心者不親切 |
| iTalki | 人間講師依存 (スケールしない) |
| Rosetta Stone | Immersion 主義、母語不使用、Premium 価格 |

## 使い方 (このドキュメントの運用)

### Claude Design ブリーフでの参照

各 Cluster のブリーフ §9 で:

```
## 9. References

競合分析: competitive-landscape.md

このプロトタイプで参考にする側面:
- Notion 的な情報階層 (Cambridge Dictionary の弱み補完)
- Anki の SRS 表現 (視覚化のインスピレーション、ただし静けさを保つ)

避けるべき側面 (このブリーフで特に注意):
- Duolingo 的な明るさ (C-1 Visual anti-pattern)
- ELSA 的な AI キャラクター (B-1)
```

### LP コピー作成時

タグライン候補の妥当性チェック:
- 「Duolingo と似ていないか?」→ competitive-landscape.md §Duolingo と対比
- 「ELSA と誤解されないか?」→ AI 言及の有無を確認

## Naoya さんへの依頼

- **競合の実感**: Naoya さんが実際に触ったことがある競合について、Claude の分析より精確な描写を追加
- **競合の追加**: 上記 8 プロダクト以外に "似ている / 気になる" 競合があれば追加 (BBC Learning English, English Central, Fluent Forever, Perfect Pronunciation 等)
- **差別化ポイントの絞り込み**: 6 つの差別化ポイントから "特に強調したい" 3 つを選ぶと、タグライン方向性が定まる
- **タグライン方向性の判断**: 上記の "差別化を強調する候補" 4 案から、どれが P-1 の動機に最も響くか判断

## 履歴

- 2026-07-16: 初版 (Claude 主導、8 主要競合と差別化ポイント + Positioning Map + タグライン方向性含意)
