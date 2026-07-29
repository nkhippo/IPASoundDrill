---
created: 2026-07-16 02:50:00+09:00
project: IPASoundDrill
status: all-5-personas-elaborated
summary: 'IPA Sound Drill の主要ペルソナ定義。Claude Design が "誰のために作るか" を判断できるようにする。Naoya さん主導のドラフトで、Claude
  が骨格 + 5 候補ペルソナ (P-1: 日本 SIer PM、P-2: 韓国ストラテジスト、P-3: フィリピン CS、P-4: 中国大学生、P-5: 日本高校生)
  の叩きを提供。'
tags:
- ipasounddrill
- design
- user-personas
- tier-1
- phase-1-input
title: IPA Sound Drill - User Personas
type: design
updated: 2026-07-16 17:40:48+09:00
id: pj-2026-07-16-dcc7
aliases:
- pj-2026-07-16-dcc7
---

## 目的

IPA Sound Drill の主要ペルソナを定義。**Claude Design が "誰のために作るか" を判断できるようにする** ためのガイド。Phase 1 のブリーフで各プロトタイプの想定ペルソナを指定する。

## このドキュメントの位置づけ

- **性質**: Naoya さん主導のドラフト。P-1 は Naoya 実感で確定、P-2〜P-5 は Claude が learning-science-foundation.md の音韻学研究 + 各地域の UI/UX 慣習で精緻化
- **完成度目標**: Phase 1 起動前に、5 ペルソナ全てが Design 判断に使えるレベル
- **参照される場面**:
  - Claude Design ブリーフの §2 "Who it's for"
  - UX 課題整理シートの Cluster ごとの想定利用者確認
  - 6 言語対応での UI/UX 調整判断

## ペルソナのフレームワーク

各ペルソナに以下 8 項目を書く:

| 項目 | 内容 |
|---|---|
| **Basic** | 名前、年齢、居住地、職業、英語レベル (TOEIC/TOEFL 等) |
| **Origin story** | なぜ英語を勉強するに至ったか |
| **Current frustration** | 何が壁になっているか (音の側面) |
| **Motivation** | 何が動機を持続させるか |
| **Success moment** | 何をもって "成功" と感じるか (小さな成功と大きな成功) |
| **Distraction risk** | 何が離脱を招くか |
| **UI/UX 期待値** | 見た目・触感・情報密度の好み |
| **Informing Clusters** | このペルソナが特に判断に効く Cluster (1-4) |

## ペルソナ状態管理

| ペルソナ | 状態 | 最終更新 |
|---|---|---|
| **P-1: 田中健太** | ✅ **確定 (Naoya 実感反映)** | 2026-07-16 |
| **P-2: 김서연** | ✅ **精緻化済 (音韻学 + 韓国 UX 反映)** | 2026-07-16 |
| **P-3: Maria Santos** | ✅ **精緻化済 (音韻学 + フィリピン UX 反映)** | 2026-07-16 |
| **P-4: 陈静** | ✅ **精緻化済 (音韻学 + 中国 UX 反映)** | 2026-07-16 |
| **P-5: 前田唯** | ✅ **精緻化済 (若年層 + 音楽文化反映)** | 2026-07-16 |

Naoya さん最終レビュー待ち。実感で違和感があれば修正。

## 5 候補ペルソナ

### P-1: 田中健太 (34, 東京、SIer プロジェクトマネージャー) ✅ 確定

- **Basic**:
  - 34 歳、東京在住、SIer プロジェクトマネージャー (英語を必要とする日本の職業人の代表)
  - TOEIC 730、リーディングは強い、リスニング特に弱い
  - デバイス: iPhone (主)、通勤中に電車で使用、家では MacBook
- **Origin story** (Naoya 実感):
  - **海外の文化をより深く吸収しようと思った時に、そもそも会話 (英語) ができなければ吸収できないから**、英語学習を本格化した
  - 学生時代からずっと英語には触れてきたが、テスト対策・受験・社会人になってからの案件対応と、"必要に応じた勉強" のみ
  - 30 歳を過ぎたあたりで、海外の思想・音楽・映画・書物に触れる機会が増え、"翻訳越しでは足りない" 感覚を持つようになる
  - "会話" が自分の英語学習の中心軸になった転換点
- **Current frustration** (Naoya 実感、音の側面):
  - **学生時代から学んできた日本語訛りの英語** が身体に染み込んでいる
  - **話せない発音は聞き取れない** — この認識が中核。自分の口が作れない音は、耳も認識できない
  - ネイティブ英語と、自分が学生時代から築き上げた日本訛り英語 (自分の癖) の **差が大きすぎて、スッとワードが入ってこない**
  - 単語は知っているのに、音として認識できない現象。読めば分かる、しかし聞くと分からない
- **Motivation** (Naoya 実感):
  - **自分の真剣な意見を英語で語って深い話がしたい**
  - 表面的なコミュニケーション (仕事のオーダー、旅行の会話) ではなく、思想・価値観・意見の交換
  - "会話が持続する" ではなく "議論が深まる" レベルへ
- **Success moment** (Naoya 実感):
  - 小: ネイティブの発音が **スッと推測できるようになったとき** — 単語を先に見て、音を予測して、聞いたときにその予測が当たる感覚
  - 大: 相手から **「発音が綺麗だね」「聞き取りやすい」と言われた瞬間** — 自分の身体化した英語が他者に "美しく" 響いていると確認できる
- **Distraction risk**:
  - 通勤中の使用が中心のため、モバイル UI での視認性が悪いと即離脱
  - "勉強してる感" が強すぎると疲れる、通勤の 15 分でサクッと使いたい
  - ゲーミフィケーションは軽蔑対象 (Duolingo 離脱の原因)
  - "話す→聞く" の循環を無視した UI (聞くだけの練習) には物足りなさ
- **UI/UX 期待値**:
  - モバイル最適化必須。片手操作で完結
  - 情報密度は "整理された" 密度。Notion 的な静けさ + 情報量
  - 進捗は見える方が良いが派手すぎない
  - 発音の "美しさ" を意識できる視覚デザイン (原則 5 に整合)
- **Informing Clusters**: **Cluster 1 (トップページ)** + **Cluster 3 (Reveal)** に特に効く

### P-2: 김서연 (28, ソウル、外資広告代理店ストラテジスト) ✅ 精緻化済

- **Basic**:
  - 28 歳、ソウル江南区在住、外資広告代理店 (Ogilvy Korea, Publicis Korea 系) のシニアストラテジスト
  - TOEIC 950、TOEFL iBT 105 (Speaking 24)、英語での戦略プレゼン月 3-4 回
  - デバイス: Samsung Galaxy S24 (主、カメラ性能重視で購入)、家では iPad Pro + MacBook Air
  - UI 言語: 韓国語 (기본), 専門ドキュメントは英語で読む
- **Origin story**:
  - 韓国の高等教育制度 (수능 English で上位) で徹底的に英語を学び、大学 3 年時に UC Berkeley へ 1 年交換留学
  - 帰国後、外資広告代理店に入社、クライアント (Samsung, LG, Amorepacific) との英語ミーティングが日常
  - "業務は英語でこなせる" レベルに到達したが、**プロフェッショナルとしての "最後の 5%"** で悔しさを感じる
- **Current frustration** (韓国語 L1 音韻フィルタの残存課題):
  - **L と R** は大学時代に克服したが、疲労時や集中低下時に混同する自覚
  - **/f/ vs /p/** の区別で、"phenomenon" 発話時に微妙な違和感 (韓国語には /f/ がなく、両唇摩擦音 /ɸ/ での代替が身体化)
  - **/v/ vs /b/** の混同 (韓国語 L1 話者の典型)
  - **/z/ の欠落** (韓国語には /z/ がなく、/dz/ で代替する癖)
  - **語末子音の解放不足** (韓国語は語末子音が unreleased、"important" の /t/ が弱い)
  - "韓国訛りが少し残る" 自覚があり、これを認めつつも上達したい
- **Motivation**:
  - プロフェッショナルとしての完成度、**"韓国訛りがないですね" と外国人同僚から言われる瞬間**
  - 学習ツールとしての "質" を見抜く目があり、真面目な設計に敬意を払う
  - 将来的にはグローバル本社 (NY, London) への異動を視野
- **Success moment**:
  - 小: `focus=trap_sounds` で /f/-/p/, /v/-/b/, /z/-/dz/ を集中的に練習して、reveal 画面で自分の予測が的中する瞬間
  - 中: 会議のプレゼン後に "Your English is very clear" とクライアントから言われる
  - 大: **上司や同僚に「あなたは韓国出身ですよね? 発音がすごく丁寧ですね」と言われる** — 韓国出身であることは隠さない、しかし発音の質の高さを認められる
- **Distraction risk**:
  - **幼稚な UI、ゲーム化された学習体験、擬人化キャラは即離脱** (P-1 と同様、P-2 は特に厳しい)
  - **韓国語 UI の丁寧さレベルミス**: 하십시오체 (하십시오, 하시겠어요) は堅すぎ、하다체 (한다, 해) では失礼、**절묘한 합니다체 (합니다, 해요)** を求める
  - 韓国語 UI で機械翻訳的な表現 ("당신의 발음" のような不自然な "당신" 使用) は Voice の破綻と感じる
  - Xiaohongshu 的な "映え" 過剰デザインも avoid
- **UI/UX 期待値**:
  - **Samsung UI (One UI) の慣習に慣れている** — Android のマテリアルデザインと少し異なる、より情報密度高め
  - Naver/Kakao 系の "シンプル + 情報密度" (mood-board.md § 5 参照)
  - 情報密度は高くていい、静けさより機能性を優先
  - 進捗の視覚化は "監視" ではなく "自己所有" 感覚 (原則 7)
  - タイポグラフィは Noto Sans KR、Pretendard 系のモダン Sans-serif
- **Informing Clusters**: **Cluster 2 (視覚言語)** + **Cluster 4 (Mode A/B 階層)** + **Cluster 1 (言語切替、韓国語 UI 品質)** に効く

### P-3: Maria Santos (22, マニラ、遠隔外資 CS) ✅ 精緻化済

- **Basic**:
  - 22 歳、マニラ郊外 Quezon City、遠隔外資 CS (US 系 fintech Company Y の Level 2 Support)
  - フィリピン国立大学 (UP Diliman) BS Communication 卒業、TOEIC 相当 850+
  - デバイス: Redmi Note 12 (主、25,000 PHP 相当、フィリピンでは平均的な価格帯)、家では中古 ThinkPad
  - UI 言語: 英語がデフォルト、fil UI があると "配慮を感じる" が期待は低い
- **Origin story**:
  - フィリピンの **Bilingual Education Policy** (BEP) で幼稚園から英語で数学・理科を学び、Filipino で歴史・社会を学ぶ環境
  - 大学は 100% 英語での授業、日常会話も英語とタガログの code-switching が自然
  - 職場では **フィリピン英語 (Philippine English)** が第一言語、しかし北米顧客との電話で "your accent is hard to understand" と言われた経験が原点
  - "自分の英語は accurate じゃないのか?" という疑問から、体系的な発音学習を始める
- **Current frustration** (フィリピン英語 → General American の phonological gap):
  - **/f/ vs /p/**: フィリピン英語は /f/ が borrowed のみ、"family" が [pamily] 気味になる自覚
  - **/v/ vs /b/**: 同様、"very" が [beri] 気味
  - **/z/ の欠落**: "zoo" が [su:] 気味
  - **/θ/ vs /t/, /ð/ vs /d/**: 歯間摩擦音を歯茎閉鎖音に (フィリピン英語の特徴)
  - **Reduced vowels (schwa 化)**: フィリピン英語は Full vowel で発音、General American の /ə/ 化が身についていない ("photograph" で第 2 音節が明瞭に [gra] と発音される)
  - **Word stress の場所**: フィリピン英語は Spanish 由来の stress pattern が残る (frontier, hotel など)
- **Motivation**:
  - **昇進 (Level 2 → Team Lead)**、給与向上 (現状 35,000 PHP → 目標 50,000 PHP+)
  - "自分の英語は accurate だ" という自信を持てるようになる
  - フィリピン人として英語を話すのは当然、しかし "アメリカ人ぽく" のレベルは自分の努力次第
- **Success moment**:
  - 小: /f/ と /p/ の音素の違いを IPA で意識できるようになった (Reveal 画面で narrow IPA の差分表示に助けられる)
  - 中: 電話対応で "your English is excellent" と顧客から言われる
  - 大: **Team Lead に昇進、より高給の position へ**
- **Distraction risk**:
  - **モバイル通信が不安定**: フィリピンの LTE は都市部でも安定せず、大容量アセット (音声ファイル) のロードで離脱
  - **アプリの起動速度**: 遅いと即離脱 (Redmi Note 12 のスペックを考慮)
  - **フィリピン語 UI の不自然さ (機械翻訳ぽい)**: "私たちを尊重していない" と感じる。特に "po/ho" (敬語詞) の誤用は即バレる
  - **有料化圧力**: Premium 版への誘導が強いと離脱 (フィリピン CS の給与水準では $5/月でも高価)
  - 学習コンテンツが西洋中心 ("your friend from America" のような設定) に偏ると疎外感
- **UI/UX 期待値**:
  - **軽量、低帯域幅対応**: 画像の遅延読み込み、音声ファイルの最小サイズ化
  - **fil UI が自然であること** — 敬意の証、"po/ho" は避けつつ (堅すぎ)、しかし完全にカジュアルではない中間 (voice-and-tone.md § Cultural Tone Matrix 参照)
  - **明るめの色調**: Notion 的な灰色は "暗い" と感じる、**GCash / Grab / Foodpanda 的な暖色**、tropical な明るさ
  - **タイポグラフィ**: Sans-serif、Poppins 系のモダンで親しみやすい
- **Informing Clusters**: **Cluster 1 (言語切替、fil UI 品質)** + **Cluster 3 (Reveal 情報密度、低帯域幅)** + **Cluster 2 (色調の暖かさ)** に効く

### P-4: 陈静 (19, 上海、大学生) ✅ 精緻化済

- **Basic**:
  - 19 歳、上海市静安区在住、上海外国語大学 2 年生 (英语专业 / International Studies 専攻)
  - **高考 (中国の大学入試) 英語**: 上位、TOEFL iBT 92 (Reading 26 / Listening 24 / Speaking 20 / Writing 22)
  - 米国大学院 (MA International Relations, MPP) 進学準備中
  - デバイス: iPhone 15 Pro (両親から入学祝いで購入)、iPad Pro (講義用)、家では MacBook Pro
  - UI 言語: 中文簡体、しかし英語 UI にも慣れている (WeChat / Bilibili / Weibo と英語アプリを併用)
- **Origin story**:
  - 上海の外国語重点小学校から一貫して英語教育を受け、**高考の英语で 140/150** 相当
  - 大学入学後、TOEFL 対策を開始、しかし **Speaking セクション** で伸び悩む (Reading/Listening は 26/24、Speaking のみ 20)
  - 中国の主流 TOEFL 対策アプリ (小站英语、扇贝英语、百词斩) は "詰め込み型" で、音の細部に踏み込まない
  - **IPA は高校時代に少し習ったが、体系的に扱われなかった** (中国の中高教育では IPA を副次的にしか扱わない)
- **Current frustration** (Mandarin L1 音韻フィルタの残存課題):
  - **/r/ の混同**: Mandarin の retroflex /ʐ/ (儿, 人) と英語 /r/ の質感が違う自覚
  - **/n/ と /l/ の混同**: 南部方言話者ほど顕著 (陈静は上海出身なので中程度)
  - **/v/ の欠落**: Mandarin には /v/ がない、"very" が [wɛri] 気味
  - **音節末子音の cluster**: Mandarin は音節末が /n, ŋ/ のみ、"asked" [æskt] や "texts" [tɛksts] の子音連続が困難
  - **Voiceless-Voiced 区別**: Mandarin は有気-無気の区別で有声性ではない、"pat" vs "bat" が意識しないと同じに聞こえる
  - **Tone → Stress の転移**: Mandarin は声調言語、英語の word stress をピッチで表現しがち (unnatural な intonation)
- **Motivation**:
  - **TOEFL Speaking スコアを 20 → 26 に上げる** (合計 100 超えを狙う)、大学院進学のスコア要件
  - **"中国留学生としての英語力の高さ" を証明** したい、就職市場での差別化
  - 将来的に国際機関 (UN, World Bank) や米国政府系のキャリアを視野
- **Success moment**:
  - 小: /r/ と /l/ の使い分けを IPA で完全に整理できた瞬間 (Reveal 画面の narrow IPA が助ける)
  - 中: **TOEFL 模擬試験の Speaking で 24 点を取る** (次回本試験で 26 を狙う根拠)
  - 大: **本試験 TOEFL Speaking で 26 点獲得、Total 100 超え** → 米国大学院合格通知
- **Distraction risk**:
  - **中国語 UI の表現が台湾・香港的だと違和感**: "捷徑" (簡体字話者から見て古い/台湾的) 等の語彙は違和感 (簡繁分岐の重要性)
  - **VPN 不要のアクセス**: 中国国内から使えるか (`ipasounddrill.app` の Cloudflare 経由が中国からアクセス可能か検証必要)
  - **学習コンテンツの "TOEFL 対策" 訴求**: "TOEFL Speaking のスコアが伸びる" のような直接的訴求がないと "自分向けではない" と感じる可能性
  - **アニメーションの過剰**: 中国 UI 慣習は "静か + 情報密度" (WeChat 系)、過度なアニメは違和感
- **UI/UX 期待値**:
  - **モバイル・タブレット両対応**: 通学時 (地下鉄) は iPhone、家では iPad で長時間学習
  - **中国 UI の慣習**: WeChat, Alipay, Xiaohongshu 系の "シンプル + 情報密度高め"
  - **進捗は具体的な数字 + グラフ**: 感覚的な表現ではなく、"あと 200 語で B2 到達" のような数値
  - **タイポグラフィ**: Noto Sans SC、思源黑体 (Source Han Sans Simplified Chinese) 系
  - **色**: 落ち着いた寒色 (Notion 系) + 若干のアクセント (Xiaohongshu 系の pink/red は avoid、Bilibili 系の light blue は許容)
- **Informing Clusters**: **Cluster 2 (視覚言語、中国 UI 慣習)** + **Cluster 3 (Reveal 精確性)** + **Cluster 4 (Mode A/B 情報階層、TOEFL 対応の情報密度)** に効く

### P-5: 前田唯 (16, 京都、高校生) ✅ 精緻化済

- **Basic**:
  - 16 歳、京都市左京区在住、公立高校 2 年生 (府立洛北高校 相当)
  - 英検 2 級、TOEIC 未受験、学校英語は 中〜上位
  - 洋楽 (Billie Eilish, Beabadoobee, Boygenius, Phoebe Bridgers, Fleet Foxes, Bon Iver, Sufjan Stevens 系のインディー / SSW 系) をきっかけに英語に興味
  - デバイス: iPhone 12 (親のお下がり、SIM は au)、家では家族共用の Windows PC (自分の勉強はほぼ iPhone)
  - UI 言語: 日本語、しかし洋楽の歌詞サイト (Genius) やインディー系プレイリスト (Spotify) は英語 UI に慣れている
  - 学校 UI (Classi 等) の "使いにくさ" に敏感、Instagram / TikTok の UI 感覚
- **Origin story**:
  - 中学 3 年生のときに **Billie Eilish の "ocean eyes" を聴いて英語の響きに惚れる**、歌詞を訳して意味を知って更に好きになる
  - 学校の英語授業は "テスト対策" で音を扱わない、**YouTube で発音動画 (Rachel's English 系) を漁って独学**
  - 洋楽の歌詞サイト Genius で IPA 表記を見て "これが発音の記号か" と興味を持つ
  - Instagram で英語で発信する若手日本人アーティスト (Toshiki Soejima, Yohji Igarashi, mei ehara 系) をフォロー、"英語で表現したい" 願望
- **Current frustration**:
  - **洋楽を歌うときの発音が "日本語なまり"** だと自覚、しかし **"ネイティブぽく" までは目指さない**、"自分の声で美しく歌える" レベル希望
  - **IPA は洋楽の歌詞サイトで見たことがある程度**、体系的には知らない
  - 学校の英語は文法・単語ばかり、"音" を教えてくれない
  - 独学する時間は限られている (受験勉強との両立)、しかし洋楽は毎日聴く
- **Motivation**:
  - **好きな曲を "美しく" 歌えるようになりたい**、Instagram で洋楽カバー動画を投稿したい (現状は控えている)
  - Genius や Reddit のインディー音楽コミュニティで英語で発言・議論したい
  - 将来的に音楽関係の仕事に興味 (音響エンジニア、DAW 制作、DTM、Rehearsal Studio 経営など)
  - 大学は音楽系 (国立音大、東京藝大の音響、または USC Thornton School of Music) を視野
- **Success moment**:
  - 小: **Billie Eilish の 1 フレーズを IPA で理解して、鏡の前で美しく発音できた瞬間**
  - 中: **TikTok / Reels で好きな洋楽をカバーして "英語うまい" コメントを海外のフォロワーからもらう**
  - 大: **音楽系の英語コミュニティ (Reddit r/Indieheads, 洋楽レビュー Twitter) で英語で意見を発信、native speaker と対等に議論**
- **Distraction risk**:
  - **学習っぽさが強すぎると即離脱** (学校教材の反動が強い世代)
  - **Instagram / TikTok 的な "美しさ" がない UI**: 見た目がダサいと開かない
  - **通知や催促を嫌う** (Duolingo の連続日数プレッシャーを嫌がる世代の代表)
  - **課金誘導**: 高校生なのでお小遣い制、月 100 円でも "有料アプリ" として抵抗
  - **年配層 / ビジネスマン向けの UI 表現**: "TOEIC" "海外案件" のような訴求は自分向けではない
- **UI/UX 期待値**:
  - **"美しい" こと**: Instagram Reels 的な視覚デザイン、Craig Mod 的な有機的線もあり
  - **モバイル完結、片手操作**: 通学中や休憩中に使う
  - **音楽との親和性**: 音楽 UI 的な波形、リズム表現、Spotify 系の Dark モード / Bilibili 系の落ち着いた色
  - **タイポグラフィ**: Noto Sans JP + 明朝体アクセント (Instagram 世代は明朝体復権が来ている)
  - **アニメーション**: subtle だが有機的な motion (Reels 系の "生きている" 感)
- **Informing Clusters**: **Cluster 2 (視覚言語、"美しさ" 主軸)** + **Cluster 1 (トップページ、"洋楽を美しく歌う" 動線)** に効く

## ペルソナごとの Track A への含意

| ペルソナ | Track A 対応レベル | 特筆すべき制約 |
|---|---|---|
| P-1 田中健太 | ★★★ (主軸) | モバイル通勤利用、"話す→聞く" 循環重視 (原則 2) |
| P-2 김서연 | ★★☆ (準主軸) | 韓国語 UI の 합니다体品質、Samsung/Naver UI 慣習、trap sounds 集中 |
| P-3 Maria Santos | ★★☆ (準主軸) | 低帯域幅対応、fil UI 自然さ、暖色調、廉価 |
| P-4 陈静 | ★★☆ (準主軸) | 簡体字ネイティブ配慮、TOEFL 訴求、VPN 不要アクセス |
| P-5 前田唯 | ★☆☆ (Track B 主軸候補) | Instagram 世代の美意識、音楽との親和性、洋楽学習 |

## 精緻化からの重要な洞察

### P-1 洞察: 「話せない発音は聞き取れない」→ **原則 2 として確定**

- Motor Theory of Speech Perception (Liberman & Mattingly, 1985) と対応
- product-principles.md § 原則 2 (Production-Perception 循環) の理論的裏付け
- 目的 `2a`（Decode）+ `2b`（Encode）両方向設計の理論的支柱（旧称 Mode A。目的 4 カード化で名称は廃止、設計思想は継承）

### P-2/P-3/P-4 共通洞察: L1 音韻フィルタは学習者ごとに異なる

- 現行 `TRAPSET = θ ð æ ʒ ɝ` は英語話者間の general な難易度基準
- L1 別最適化 (`focus=trap_sounds_ja/ko/zh/fil`) は Track B 候補
- **短期的には共通 trap sounds で対応、長期的には L1 別化**

### P-5 洞察: "美しさ" の主軸差

- P-1, P-5 は美的評価軸を強く持つ ("発音が綺麗"、"洋楽を美しく")
- P-2, P-3, P-4 は機能主義 (プロ意識、昇進、スコア)
- **UI/UX は両立が必要**: Cluster 1 の目的ファースト UI は美的評価軸を、Cluster 3 の Reveal は機能主義を担う可能性

### 6 言語圏での UI/UX 期待値の差異マップ

| 側面 | P-1 (日本) | P-2 (韓国) | P-3 (フィリピン) | P-4 (中国) | P-5 (日本若年) |
|---|---|---|---|---|---|
| 情報密度 | 中 (整理) | 高 | 中 | 高 | 中 |
| 色調 | 静けさ | 中間 | 暖色 | 落ち着き | 美しさ (暗色可) |
| フォント | Noto Sans JP | Pretendard | Poppins | Noto Sans SC | Noto Sans JP + 明朝 |
| 進捗表現 | 静か | 数値 | 明るい | 数値+グラフ | 有機的 |
| ゲーム化許容度 | 極低 | 極低 | 低 | 低-中 | 低 |

## Claude Design ブリーフでの使い方

各 Cluster のブリーフ (§2 "Who it's for") で、以下のように参照:

```
## 2. Who it's for

主軸: P-1 (田中健太)、P-3 (Maria Santos)
準軸: P-2 (김서연)

このプロトタイプは、モバイル片手操作で 15 分の通勤/休憩学習を成立させることを主眼とする。
韓国語 UI での不自然さがないことも重要な検証観点。
低帯域幅対応 (P-3) と情報階層の明確化 (P-2) の両立が求められる。

【各ペルソナの Distraction risk】(このブリーフに特に該当する)
- P-1: ゲーミフィケーション、通勤中の視認性低下、"話す→聞く" 循環無視
- P-3: 大容量アセット、fil UI の機械翻訳感、暗い色調
- P-2: 韓国語 UI の敬語レベルミス (하십시오体 過剰 / 하다体 失礼)

このブリーフでは P-4 (陈静) と P-5 (前田唯) は主軸ではない。
- P-4: C1 拡張 (Track B) + TOEFL 対策明示の Cluster で主軸候補
- P-5: Cluster 2 (視覚言語刷新、"美しさ" 主軸) で参考視点
```

## Naoya さんへの依頼 (残り作業)

- ✅ **P-1 は Naoya さん実感で確定 (2026-07-16)**
- ✅ **P-2〜P-5 は Claude 精緻化 (音韻学 + 各地域 UX 反映) 済 (2026-07-16)**
- **各ペルソナの妥当性最終確認**: Naoya さんの実感 or 想定利用者と乖離していないか
- **ペルソナ数の絞り込み**: 5 パターンで Design 判断に十分か、絞り込む or 追加するか
- **Cluster ごとの主軸ペルソナ確定**: Phase 1 起動時に、各 Cluster ブリーフで "主軸 + 準軸" を明示

## 履歴

- 2026-07-16 (初版): Claude 叩き、5 候補ペルソナ骨組み
- 2026-07-16 (更新 1): **P-1 田中健太を Naoya 実感で確定**、"話せない発音は聞き取れない" 洞察を追加
- 2026-07-16 (更新 2): **P-2〜P-5 を音韻学研究 (learning-science-foundation.md) + 各地域 UX 慣習 (mood-board.md § 5) で精緻化**、6 言語圏での UI/UX 期待値マップを追加
