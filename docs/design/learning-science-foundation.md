---
created: 2026-07-16 04:10:00+09:00
project: IPASoundDrill
status: draft-for-review
summary: IPA Sound Drill の設計判断を支える学習科学の理論的基盤。音声知覚理論 (Categorical Perception / Motor
  Theory / PAM / SLM)、認知科学理論 (Cognitive Load / SRS / Recall vs Recognition / Encoding
  Specificity)、IPA 教育研究、と 6 言語圏別の音韻学的研究を参照。特に原則 8 (Production-Perception 循環) の理論的裏付けを明示。
tags:
- ipasounddrill
- design
- learning-science
- tier-3
- phase-1-input
title: IPA Sound Drill - Learning Science Foundation
type: reference
updated: 2026-07-16 04:10:00+09:00
id: pj-2026-07-16-dd10
aliases:
- pj-2026-07-16-dd10
---

## 目的

IPA Sound Drill の設計判断を支える **学習科学 (Learning Science) の理論的基盤** を整理。Claude Design が UI/UX を設計するときに、"教育的に正しい" 判断ができるための reference。

**特に P-1 洞察「話せない発音は聞き取れない」(原則 8) の理論的裏付け** を明示することで、この原則の学術的妥当性を確認する。

## このドキュメントの位置づけ

- **性質**: Claude 主導のドラフト。SLA (第二言語習得論) / 認知科学 / 音声学の主要理論を参照
- **完成度目標**: Phase 1 起動前に、主要理論の要約と IPA Sound Drill への含意が明確
- **参照される場面**:
  - Claude Design ブリーフでの理論的根拠の引用
  - Naoya さんが Cursor / 翻訳者 / 将来の共同開発者に "なぜこの設計か" を説明するとき
  - 段階 3 の SPEC 分割時、要件定義書 (requirements/) での "why" の記述

**注意**: 本ドキュメントは各理論の要約と IPA Sound Drill への含意に留める。学術的な深掘りは各理論の原著を参照。

## 中核 1: 音声知覚の理論

### Categorical Perception (Liberman et al., 1957)

**要点**: 人間は連続的に変化する音声刺激を、離散的なカテゴリー (音素) として知覚する。母語で使う音素の境界は敏感、母語で使わない音素の境界は鈍い。

**IPA Sound Drill への含意**:
- L1 (母語) の音素カテゴリーが、L2 (英語) の音の知覚を歪める
- 例: 日本語話者にとって英語の /r/ と /l/ は、両方とも日本語の /ɾ/ カテゴリーに吸収される
- **対策**: 学習者に "自分の L1 カテゴリー" を意識させることが、L2 音素の分離知覚に必要
- **プロダクト設計**: Reveal 画面で narrow IPA + respell を表示することで、L2 音の "身体化された表現" を提示

### Motor Theory of Speech Perception (Liberman & Mattingly, 1985)

**要点**: 音声の知覚は、その音声を発する運動指令 (articulatory gestures) の内部シミュレーションを介して行われる。**話者と聞き手の音声処理は共通のモジュールを使う**。

**IPA Sound Drill への含意 (原則 8 の理論的裏付け)**:
- **話せない音は聞き取れない**: Motor Theory 的には、聞き取りは「自分がその音を出せる」内部シミュレーションを前提とする。出せない音は、内部シミュレーションが不可能で、知覚も精確でない
- **逆も真**: 聞き取れない音は、身体的な模倣ができないため、発音も精確でない
- **プロダクト設計**:
  - Mode A の Decode (音→スペル) と Encode (スペル→音) の両方向設計は、この双方向性を実装
  - Encode を "Decode の対" ではなく "Decode を可能にする基礎" と位置づける
  - Reveal 画面で "口が作れる" 情報 (narrow IPA、respell、将来的に口形図) の重視

**現代的な補足**: Motor Theory 単体では音声知覚を全て説明できないとされる (Rosenblum, 2005 等) が、"Production-Perception loop の重要性" は多くの現代理論 (Direct Realist Theory, Bayesian Speech Perception 等) にも共通。

### Perceptual Assimilation Model (PAM, Best, 1995)

**要点**: L2 の音は、L1 の音素カテゴリーに以下 4 パターンで同化される:

1. **Two-Category Assimilation (TC)**: L2 の 2 音が L1 の 2 音に別々に同化 (聞き分けやすい)
2. **Category-Goodness (CG)**: L2 の 2 音が L1 の同カテゴリーに同化、ただし "良い例" と "悪い例" (難易度中)
3. **Single-Category (SC)**: L2 の 2 音が L1 の同カテゴリーに同一に同化 (聞き分け困難)
4. **Non-Assimilable (NA)**: L2 の音が L1 のどのカテゴリーにも同化されない (難易度高、しかし習得可能性あり)

**IPA Sound Drill への含意**:
- 学習者の L1 に応じて、どの音素の対が SC (困難) か CG (中間) かが変わる
- 例: 日本語話者にとって /r/-/l/ は SC (両方 /ɾ/ に同化)、/f/-/v/ は CG (両方 /ɸ/ 系に同化するが有声性の違いは残る)
- **プロダクト設計**:
  - `focus=trap_sounds` の音素選定は、対象言語圏ごとに調整すべき
  - Track A の 6 言語対応で、"日本語話者向け trap sounds" と "中国語話者向け trap sounds" は異なる可能性
  - 現状の `TRAPSET = θ ð æ ʒ ɝ` は英語話者間の general な難易度、L1 別最適化は Track B 候補

### Speech Learning Model (SLM / SLM-r, Flege, 1995; Flege & Bohn, 2021)

**要点**: 
- 音の産出 (Production) と知覚 (Perception) は、同じ音韻表象 (phonetic categories) を共有する
- L2 の音を新カテゴリーとして獲得できれば、L1 の対応音との "分離" が進む
- **成人でも L2 音の獲得は可能**、しかし L1 の影響は残る

**IPA Sound Drill への含意 (原則 8 の理論的裏付け)**:
- Production と Perception の統一を強く支持
- 大人 (P-1 34歳, P-2 28歳, P-3 22歳 etc.) の学習可能性を保証
- **プロダクト設計**:
  - 学習者に "L1 の音と L2 の音は違う音である" ことを明示的に示す
  - narrow IPA 表示は "L1 では表せない細部" を示すため重要
  - 進捗の測定は "新カテゴリー獲得" ベース (Vocab の再認/再生の正答率変化で近似)

## 中核 2: 認知科学の理論

### Cognitive Load Theory (Sweller, 1988; Kirschner et al., 2006)

**要点**: ワーキングメモリの容量は限定的 (4±1 チャンク)。学習時の認知負荷は 3 種類:

- **Intrinsic load**: 学習内容自体の複雑さ (減らせない)
- **Extraneous load**: 不必要な情報・UI ノイズが加える負荷 (減らすべき)
- **Germane load**: 学習に貢献する追加処理 (スキーマ構築に使う)

**IPA Sound Drill への含意**:
- **原則 6 (1 画面 1 主軸) の理論的裏付け**
- Reveal 画面で情報を "同時" に見せる (原則 3) が、"主軸 + 補助" の階層化で Extraneous load を減らす
- Setup 画面の 12 パラメータは Extraneous load の代表例 (UX 課題 C-1)
- **プロダクト設計**:
  - 情報を密集させても、視覚階層でスキャン可能にする (Germane load として活かす)
  - UI エフェクト・アニメーションは最小限 (Extraneous load 削減)

### Spacing Effect / Spaced Repetition (Ebbinghaus, 1885; Cepeda et al., 2006)

**要点**: 同じ学習内容を時間間隔を空けて繰り返すと、集中学習より長期記憶に定着する。忘却曲線 (Forgetting Curve) が理論の基礎。

**アルゴリズム**:
- **SM-2** (Wozniak, 1990): Anki のオリジナル。答えの難易度で次回間隔を計算
- **FSRS** (Free Spaced Repetition Scheduler, 2022-): 機械学習で忘却確率を予測、より精確

**IPA Sound Drill への含意**:
- 現行の `ept_hist_v1`, `ept_sym_v1`, `ept_checks_v1` + weightedShuffle は簡易版 SRS
- SPEC/DESIGN §1.4 の重み付け 40%/40%/20% は Spacing Effect の実装
- **プロダクト設計**:
  - SRS 履歴は学習者の "資産" (原則 7)
  - 忘れかけたときに再登場するのが SRS の効能
  - Cold start (hist<3) では A1 音節ソート + shuffle (SLA 順序性の暗黙的実装)

### Recall vs Recognition (Tulving, 1974)

**要点**: **再生 (Recall)** = 手がかりなしに情報を思い出す。**再認 (Recognition)** = 提示された情報を "見たことがある" と識別。**再生の方が学習効果が高い**。

**IPA Sound Drill への含意**:
- Decode (音→スペル入力) と Encode (スペル→IPA 入力) は **Recall タスク**
- Mode B Study (音→意味の推測) も Recall
- Mode B Quiz (`MODEB_QUIZ_ENABLED=false` で凍結) は Multiple Choice = Recognition なので、意図的な凍結は SLA 的にも妥当な判断
- **プロダクト設計**:
  - MCQ (Multiple Choice) タイプの Quiz を Track A では実装しない (Track B でも慎重)
  - 入力タスク (Encode) の重要性を UI で示す

### Encoding Specificity Principle (Tulving & Thomson, 1973)

**要点**: 記憶は "覚えた文脈" が再生時に一致すると想起しやすい。学習と使用の文脈の一致が重要。

**IPA Sound Drill への含意**:
- 学習者が実際に英語を使う場面 (会議、映画、洋楽) の文脈を、学習時に想起できるようにする
- **プロダクト設計**:
  - 単語の gloss (意味) は文脈を含む形が理想 (現状は単純な訳、Track B で拡張候補)
  - Connected phrase は実際の使用場面 (連結の起きる状況) を示唆
  - Mode B (音先行) は "新しい単語との出会い" の文脈を作る

## 中核 3: IPA 教育の研究

### IPA in Language Teaching: Research Overview

**要点**:
- IPA (国際音声記号) の教育的効果は 20 世紀初頭から議論
- 現代の主要研究: **Underhill (2005) "Sound Foundations"**、**Kelly (2000) "How to Teach Pronunciation"**
- **結論**: IPA の明示的教育は成人 L2 学習者の発音精度を有意に向上させる (中〜大の effect size)

**IPA Sound Drill への含意**:
- プロダクトの核心 (IPA 主軸) は SLA 研究で支持
- ただし IPA の教え方 (直接教える vs 副次的に触れる) は議論
- **プロダクト設計**:
  - IPA の "怖くない導入" を Guide モーダルで実現 (原則 1)
  - IPA そのものを学習対象にしない、"音を鍛える道具" として位置づける

### 音素インベントリ (Phoneme Inventory) の教育順序

**要点**: 学習者に "難しい音素" から教えるべきか、"簡単な音素" から教えるべきか。

- **難しい順**: 早期に困難を克服、しかし挫折リスク高
- **簡単な順**: 達成感を積み重ねる、しかし核心課題への到達が遅い
- **CEFR 準拠**: A1 → A2 → B1 → B2 の語彙頻度順に音素も自然に遭遇 (現状の IPA Sound Drill)

**IPA Sound Drill への含意**:
- CEFR 順序を採用しているのは SLA 的に穏当な選択
- `focus=trap_sounds` の "難所集中" モードは、上級者向けの難易度順アクセス
- **プロダクト設計**:
  - デフォルトは CEFR 順 (P-3 マニラ CS が "焦らず順序建てて" 学べる)
  - `focus=weak_spots` は SRS 履歴ベースで、個別最適化 (P-1 田中健太が "自分の癖" に集中できる)

## 6 言語圏別の音韻学的研究

### 日本語話者 (Japanese Learners of English)

**主な難所**:
- /r/ vs /l/ (最有名、PAM の SC カテゴリー)
- /θ/ vs /s/, /ð/ vs /z/ (歯間摩擦音)
- /æ/ vs /ʌ/ vs /ɑː/ (open 母音の識別)
- /iː/ vs /ɪ/, /uː/ vs /ʊ/ (母音長 + 質)
- Connected speech の音節脱落 (Wanna, gotta 等)

**参考研究**: Aoyama & Flege (2000), Yamada (1995), MacKain et al. (1981)

**IPA Sound Drill への含意**:
- P-1 の "スッとワードが入ってこない" は connected speech の脱落 + 弱形の未習得が主因の可能性
- Track A で `focus=weak` (弱形) と Connected phrase は日本語話者に特に有効

### 韓国語話者 (Korean Learners)

**主な難所**:
- /f/ vs /p/ (韓国語には /f/ がない、両唇摩擦音 /ɸ/ で代替)
- /v/ vs /b/ (韓国語には /v/ がない)
- /z/ (韓国語には /z/ がない、/ts/ で代替)
- 語末子音の解放 (韓国語は語末子音を unreleased で発音)
- /r/ vs /l/ (韓国語の /ɾ/ は英語の /r/ とも /l/ とも異なる)

**参考研究**: Baker & Trofimovich (2005), Chang (2012)

**IPA Sound Drill への含意**:
- P-2 김서연 の "細かい母音の聞き分け" は Korean L2 English の典型的な残存課題
- Trap sounds に /f/-/p/, /v/-/b/, /z/-/dz/ を含めることが日本語話者向けと違う

### 中国語話者 (Mandarin Speakers)

**主な難所**:
- 音節末子音 (Mandarin は音節末に /n, ŋ/ のみ、英語の複雑な cluster が困難)
- /r/ (Mandarin の retroflex /ʐ/ と英語 /r/ の混同)
- Tone → Stress の転移 (Mandarin は声調言語、英語の強勢と混同)
- /v/ (Mandarin には /v/ がない)
- Voiceless-Voiced 区別 (Mandarin は有気-無気の区別、Voice ではない)

**参考研究**: Chen (2007), Zhang (2016)

**IPA Sound Drill への含意**:
- P-4 陈静 の TOEFL Speaking 課題は、上記の Mandarin 固有問題を含む可能性
- 音節末子音の cluster (asked, texts) の練習が重要

### フィリピン語話者 (Filipino / Tagalog Speakers)

**主な難所**:
- /f/ vs /p/ (フィリピン語には /f/ が borrowed のみ)
- /v/ vs /b/ (フィリピン語には /v/ が borrowed のみ)
- /z/ (フィリピン語には /z/ がない)
- /θ/ vs /t/, /ð/ vs /d/
- Reduced vowels (フィリピン英語は Full vowel、General American の schwa 化と異なる)

**参考研究**: Tayao (2004), Metila et al. (2016)

**IPA Sound Drill への含意**:
- P-3 Maria Santos の "アメリカ人ぽく話したい" 課題の主軸は Reduced vowel (schwa) の獲得
- Weak forms の理解が発音品質を大きく変える (P-1 と共通)

### 中国語話者 (Cantonese, 繁体字圏)

**主な難所**:
- Cantonese は 6-9 声調、tone → stress 転移リスク
- 音節末子音の unreleased 傾向 (Mandarin と類似)
- /n/ と /l/ の混同 (南部方言話者)
- Aspiration vs Voice の混同

**参考研究**: Sung & Chen (2008)

**IPA Sound Drill への含意**:
- 台湾・香港ユーザは Mandarin ペルソナ (P-4) と Cantonese ペルソナで異なる、Track A では簡繁 UI 分岐で対応

## IPA Sound Drill 設計判断への含意 (まとめ)

| 設計判断 | 支持する理論 | Product Principle |
|---|---|---|
| IPA を主軸に据える | IPA 教育研究 (Underhill, Kelly) | 原則 1 |
| Decode + Encode の両方向 | Motor Theory, SLM | **原則 8** |
| Reveal 画面での複数視覚表現 | Cognitive Load (Germane), Categorical Perception | 原則 3, 6 |
| SRS + weightedShuffle | Spacing Effect, SM-2, FSRS | 原則 7 |
| Recall (入力) を Recognition (MCQ) より重視 | Recall vs Recognition (Tulving) | Mode A の設計 |
| CEFR 順 + focus 選択の共存 | 音素インベントリ教育順序 | 原則 2 |
| 音素フォーカス (trap_sounds) | PAM の SC/CG カテゴリー | Focus モードの設計 |
| 6 言語圏別の L1 音韻フィルタ考慮 | 各国音韻学研究 | 原則 5 |

## 参考文献 (主要)

- Best, C. T. (1995). A direct realist view of cross-language speech perception. In Strange (Ed.), *Speech perception and linguistic experience*.
- Cepeda, N. J., Pashler, H., Vul, E., Wixted, J. T., & Rohrer, D. (2006). Distributed practice in verbal recall tasks: A review and quantitative synthesis. *Psychological Bulletin*.
- Flege, J. E. (1995). Second language speech learning: Theory, findings, and problems. In Strange (Ed.), *Speech perception and linguistic experience*.
- Flege, J. E., & Bohn, O.-S. (2021). The Revised Speech Learning Model (SLM-r). In *Second Language Speech Learning*.
- Kelly, G. (2000). *How to Teach Pronunciation*. Longman.
- Liberman, A. M., & Mattingly, I. G. (1985). The motor theory of speech perception revised. *Cognition*.
- Sweller, J. (1988). Cognitive load during problem solving: Effects on learning. *Cognitive Science*.
- Tulving, E., & Thomson, D. M. (1973). Encoding specificity and retrieval processes in episodic memory. *Psychological Review*.
- Underhill, A. (2005). *Sound Foundations: Learning and teaching pronunciation*. Macmillan.
- Wozniak, P. A. (1990). Optimization of learning. *Master's thesis*, University of Technology in Poznan.

## 使い方 (このドキュメントの運用)

### Claude Design ブリーフでの参照

各 Cluster のブリーフで、以下のような引用が可能:

```
このプロトタイプは Cognitive Load Theory (learning-science-foundation.md §Cognitive Load) の
Extraneous Load 削減を主眼とする。

Reveal 画面の情報階層は Germane Load (スキーマ構築) として機能させ、
"主軸 + 補助" の構造を明確にする (原則 6)。
```

### 議論での参照

Naoya さんが Cursor / 翻訳者 / 共同開発者に「なぜこの設計か」を説明するとき、本ドキュメントを引用することで、"個人の好み" ではなく "学術的根拠に基づく判断" として提示できる。

### 段階 3 での参照

`docs/requirements/<topic>.md` (要件定義書) の "why" セクションで、該当する理論を引用。例: `docs/requirements/reveal-screen.md` で "情報階層は Cognitive Load Theory の Extraneous Load 削減の観点で設計" と記述。

## Naoya さんへの依頼

- **理論の妥当性**: 各理論の要約が Naoya さんの理解と整合するか確認
- **L1 音韻フィルタ研究の追加**: 特定の言語 (韓国語、中国語、フィリピン語) について Naoya さんが把握している研究があれば追加
- **参考文献の精査**: 上記文献は主要なもの、Naoya さんが読んだ具体的な研究があれば追加
- **原則 8 の理論的裏付けの妥当性**: Motor Theory + SLM の説明が原則 8 を十分に支えているか確認

## 履歴

- 2026-07-16: 初版 (Claude 主導、SLA / 認知科学 / IPA 教育の主要理論を IPA Sound Drill への含意付きで整理)
