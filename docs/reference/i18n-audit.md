---
id: pj-2026-06-24-276e
aliases:
- pj-2026-06-24-276e
title: i18n 監査レポート
created: '2026-06-24'
---
# i18n 監査レポート

> 生成日: 2026-07-09 ／ 対象: `i18n/{en,ja,zh-Hans,zh-Hant,ko,fil}.json`、`i18n/phonemes/*.json`、`index.html`
> 生成: `python3 tools/gen_audit_docs.py` ／ UI キー数: **171** ／ `validate_i18n.py`: ERROR 0

翻訳の良し悪しは判断していません。キー所在・画面配線・ハードコードの可視化のみ。

---

## 1. UI 文言キー × 言語

| キー | en | ja | zh-Hans | zh-Hant | ko | fil | 画面 |
|------|----|----|---------|---------|----|-----|------|
| `accent.ga` | American (GA) | アメリカ英語 | 美式 | 美式 | 미국식 | Amerikano (GA) | settings（動的参照） |
| `accent.label` | Accent | 発音 | 口音 | 口音 | 발음 | Punto | settings |
| `accent.rp` | British (RP) | イギリス英語 | 英式 | 英式 | 영국식 | Britaniko (RP) | settings（動的参照） |
| `back_top` | Menu | TOPへ | 首页 | 首頁 | 처음 | Menu | 共通 |
| `brand.home` | Back to top | トップへ戻る | 返回首页 | 返回首頁 | 처음으로 | Bumalik sa itaas | 共通（トップバー） |
| `brand.name` | IPA Sound Drill | IPAドリル | IPA操练 | IPA操練 | IPA 드릴 | IPA Sound Drill | 共通（トップバー） |
| `build_ph` | Tap the IPA keys below to build the pronunciation | 下のIPAキーをタップして発音を組み立てる | 点击下方IPA键拼出发音 | 點選下方IPA鍵拼出發音 | 아래 IPA 키를 눌러 발음을 만드세요 | I-tap ang mga IPA key sa ibaba para buuin ang pagbigkas | encode |
| `cefr.pending` | CEFR? | CEFR? | CEFR? | CEFR? | CEFR? | CEFR? | setup / 練習 |
| `cefr.pending_hint` | CEFR not assigned yet | CEFR未設定（相談中） | 尚未设定 CEFR | 尚未設定 CEFR | CEFR 미설정 | Wala pang CEFR | setup / 練習 |
| `check` | Check | 答え合わせ | 核对 | 核對 | 채점 | Suriin | decode / encode / Mode B |
| `clear` | Clear | クリア | 清除 | 清除 | 지우기 | Burahin | encode |
| `cs.all` | All | すべて | 全部 | 全部 | 전체 | Lahat | setup（Connected） |
| `cs.assimilation` | Assimilation | 同化 | 同化 | 同化 | 동화 | Asimilasyon | setup（Connected） |
| `cs.elision` | Elision | 脱落 | 脱落 | 脫落 | 탈락 | Pagkakaltas | setup（Connected） |
| `cs.label` | Type | 型 | 类型 | 類型 | 유형 | Uri | setup（Connected） |
| `cs.level.all` | All | 全て | 全部 | 全部 | 전체 | Lahat | setup（Connected / Weak） |
| `cs.level.l1` | Beginner | 初級 | 初级 | 初級 | 초급 | Nagsisimula | setup（Connected / Weak） |
| `cs.level.l2` | Intermediate | 中級 | 中级 | 中級 | 중급 | Katamtaman | setup（Connected / Weak） |
| `cs.level.l3` | Advanced | 上級 | 高级 | 高級 | 고급 | Abanse | setup（Connected / Weak） |
| `cs.level.label` | Level | 難易度 | 难度 | 難度 | 난이도 | Antas | setup（Connected / Weak） |
| `cs.linking` | Linking | 連結 | 连读 | 連音 | 연음 | Pagkakawing | setup（Connected） |
| `cs.ruleLabel` | Rule | 規則 | 规则 | 規則 | 규칙 | Tuntunin | setup（Connected） |
| `dir.decode_d` | Read the IPA and type the word | 発音記号（IPA）を読んで単語の綴りを書く | 阅读发音符号（IPA），写出单词 | 閱讀發音符號(IPA),寫出單字 | 발음 기호(IPA)를 읽고 단어 맞히기 | Basahin ang simbolong ponetiko (IPA) at hulaan ang s... | setup（Words） |
| `dir.decode_t` | IPA &rarr; word | IPA &rarr; 単語 | IPA &rarr; 单词 | IPA &rarr; 單字 | IPA &rarr; 단어 | IPA &rarr; salita | setup（Words） |
| `dir.encode_d` | Build the IPA from the spelling | 綴りから発音記号（IPA）を組み立てる | 根据拼写组装发音符号（IPA） | 根據拼寫組合發音符號(IPA) | 철자에서 발음 기호(IPA) 조립하기 | Buuin ang IPA mula sa baybay | setup（Words） |
| `dir.encode_t` | word &rarr; IPA | 単語 &rarr; IPA | 单词 &rarr; IPA | 單字 &rarr; IPA | 단어 &rarr; IPA | salita &rarr; IPA | setup（Words） |
| `dir.label` | Direction | 方向 | 方向 | 方向 | 방향 | Direksyon | setup（Words） |
| `exit_confirm.body` | Do you want to end this session? | このセッションを終了しますか？ | 要结束本次练习吗？ | 要結束本次練習嗎？ | 이 세션을 종료할까요? | Gusto mo bang tapusin ang session na ito? | setup / 練習 |
| `exit_confirm.no` | No | No | No | No | No | No | setup / 練習 |
| `exit_confirm.title` | End session? | 終了しますか？ | 要结束吗？ | 要結束嗎？ | 종료하시겠어요? | Tapusin ang session? | setup / 練習 |
| `exit_confirm.yes` | Yes | Yes | Yes | Yes | Yes | Yes | setup / 練習 |
| `focus.all` | All sounds | すべて | 全部 | 全部 | 전체 | Lahat ng tunog | setup（Words） |
| `focus.casual` | Casual speech | 口語表現 | 口语表达 | 口語表達 | 구어체 | Pang-araw-araw na pananalita | setup（Words） |
| `focus.contractions` | Contractions | 短縮形 | 缩写形式 | 縮寫形式 | 축약형 | Mga pinaikli | setup（Words） |
| `focus.irregular` | Irregular forms | 不規則変化 | 不规则变化 | 不規則變化 | 불규칙 변화 | Mga di-regular na anyo | setup（Words） |
| `focus.label` | Phoneme focus | 音素フォーカス | 音素聚焦 | 音素聚焦 | 음소 포커스 | Pokus na ponema | setup（Words） |
| `focus.letters` | Alphabet | アルファベット | 字母 | 字母 | 알파벳 | Alpabeto | setup（Words） |
| `focus.traps` | Trap sounds | トラップ音 | 陷阱音 | 陷阱音 | 함정 소리 | Mga mahirap na tunog | setup（Words） |
| `focus.traps_d` | θ ð æ ʒ ɝ | θ ð æ ʒ ɝ | θ ð æ ʒ ɝ | θ ð æ ʒ ɝ | θ ð æ ʒ ɝ | θ ð æ ʒ ɝ | setup（Words） |
| `focus.weak` | Weak spots | 苦手音 | 薄弱音 | 弱點音 | 약점 소리 | Mga kahinaan | setup（Words） |
| `focus.weak_d` | From practice history | 練習履歴から | 来自练习记录 | 來自練習紀錄 | 연습 기록 기반 | Mula sa kasaysayan ng pagsasanay | setup（Words） |
| `grp.all` | All | すべて | 全部 | 全部 | 전체 | Lahat | setup（Words） |
| `grp.label` | Spelling pattern group | 綴り規則グループ | 拼写规则组 | 拼寫規則群組 | 철자 규칙 그룹 | Grupo ng padron ng baybay | setup（Words） |
| `grp.long` | Long vowels · silent e | 長母音・マジックe | 长元音·不发音e | 長母音·不發音e | 장모음·묵음 e | Mahahabang patinig · tahimik na e | setup（Words） |
| `grp.r` | R-colored vowels | r音色 | r化元音 | r色母音 | r색 모음 | Mga patinig na may kulay-r | setup（Words） |
| `grp.short` | Short vowels | 短母音 | 短元音 | 短母音 | 단모음 | Maiikling patinig | setup（Words） |
| `grp.team` | Vowel teams | 母音チーム | 元音组合 | 母音組合 | 모음 팀 | Mga pangkat ng patinig | setup（Words） |
| `guide.close` | Close | 閉じる | 关闭 | 關閉 | 닫기 | Isara | settings / guide |
| `guide.open` | Site guide | 使い方ガイド | 使用指南 | 使用指南 | 사용 가이드 | Gabay sa site | settings / guide |
| `guide.title` | How to use this app | このアプリの使い方 | 如何使用本应用 | 如何使用本應用程式 | 앱 사용 방법 | Paano gamitin ang app na ito | settings / guide |
| `hint.first` | First letter | 最初の文字 | 首字母 | 首字母 | 첫 글자 | Unang titik | （未使用・予約） |
| `hint.pos` | Part of speech | 品詞 | 词性 | 詞性 | 품사 | Bahagi ng pananalita | （未使用・予約） |
| `hint.syl` | Syllables | 音節数 | 音节数 | 音節數 | 음절 수 | Mga pantig | （未使用・予約） |
| `info.examples` | Examples | 例語 | 例词 | 例詞 | 예시 | Mga halimbawa | decode / encode / reveal（音素パネル） |
| `info.mouth` | Mouth | 口の形 | 口型 | 口型 | 입 모양 | Bibig | decode / encode / reveal（音素パネル） |
| `info.watch` | Watch out | 注意 | 注意 | 注意 | 주의 | Mag-ingat | decode / encode / reveal（音素パネル） |
| `input_ph` | Type the word | 単語を入力 | 输入单词 | 輸入單字 | 단어 입력 | I-type ang salita | decode |
| `input_phrase` | Type the phrase | 句を入力 | 输入短语 | 輸入片語 | 구 입력 | I-type ang parirala | decode（Connected） |
| `kbd.consonants` | Consonants | 子音 | 辅音 | 子音 | 자음 | Mga katinig | encode |
| `kbd.diphthongs` | Diphthongs | 二重母音 | 双元音 | 雙母音 | 이중 모음 | Mga diptonggo | encode |
| `kbd.r_vowels` | R-colored | r母音 | r化元音 | r色母音 | r색 모음 | May kulay-r | encode |
| `kbd.stress` | Stress | 強勢 | 重音 | 重音 | 강세 | Diin | encode |
| `kbd.vowels` | Vowels | 母音 | 元音 | 母音 | 모음 | Mga patinig | encode |
| `lang_opts.en` | English | English | English | English | English | English | settings（動的参照） |
| `lang_opts.fil` | Filipino | Filipino | Filipino | Filipino | Filipino | Filipino | settings（動的参照） |
| `lang_opts.ja` | 日本語 | 日本語 | 日本語 | 日本語 | 日本語 | 日本語 | settings（動的参照） |
| `lang_opts.ko` | 한국어 | 한국어 | 한국어 | 한국어 | 한국어 | 한국어 | settings（動的参照） |
| `lang_opts.zh-Hans` | 简体 | 简体 | 简体 | 简体 | 简体 | 简体 | settings（動的参照） |
| `lang_opts.zh-Hant` | 繁體 | 繁體 | 繁體 | 繁體 | 繁體 | 繁體 | settings（動的参照） |
| `lead_connected_html` | Hear <b>connected speech</b> in GA&mdash;linking, as... | GAの<b>連結発音</b>（連結・同化・脱落）を聞き取り、連結後のIPAから元の句を当てます。 | 听辨 GA 的<b>连读现象</b>（连读、同化、脱落）。根据连读后的 IPA 还原原短语。 | 聽辨 GA 的<b>連音現象</b>（連音、同化、脫落）。根據連音後的 IPA 還原原片語。 | GA <b>연음</b>(연음·동화·탈락)을 듣고, 연음된 IPA에서 원래 구를 맞춥니다. | Pakinggan ang <b>konektadong pananalita</b> sa GA—pa... | （未参照） |
| `lead_html` | Drill <b>IPA reading and writing</b> for words you a... | 既知の単語で<b>IPAの読み書き</b>を音素単位で鍛えるツール。<b>トラップ音</b>（θ, ð,... | 针对<b>已知单词</b>逐音素训练<b>IPA读写</b>。专攻<b>陷阱音</b>（θ, ð, æ,... | 針對<b>已知單字</b>逐音素訓練<b>IPA讀寫</b>。專攻<b>陷阱音</b>（θ, ð, æ,... | 이미 아는 단어로 <b>IPA 읽기·쓰기</b>를 음소 단위로 훈련합니다. <b>함정 소리</... | Sanayin ang <b>pagbasa at pagsulat ng IPA</b> nang p... | （未参照） |
| `lead_weak_html` | Hear the <b>weak forms</b> of function words in conn... | 機能語の<b>弱形</b>を聞き取る。IPAを読んで元の語を答える。 | 听功能词的<b>弱读形式</b>，读出 IPA 还原单词。 | 聽功能詞的<b>弱讀形式</b>,讀出 IPA 還原單字。 | 기능어의 <b>약형</b>을 듣고 IPA를 읽어 단어를 맞히세요. | Pakinggan ang <b>mahihinang anyo</b> ng mga function... | （未参照） |
| `listen` | Listen | 音を聞く | 播放发音 | 播放發音 | 듣기 | Makinig | decode / encode / reveal |
| `load_fail` | Load failed | 読み込み失敗 | 加载失败 | 載入失敗 | 불러오기 실패 | Nabigo ang pag-load | setup / summary |
| `loading` | Loading… | 読み込み中… | 加载中… | 載入中… | 불러오는 중… | Naglo-load… | setup / summary |
| `lvl.a1` | A1 | A1 | A1 | A1 | A1 | A1 | （未使用・予約） |
| `lvl.a2` | A2 | A2 | A2 | A2 | A2 | A2 | （未使用・予約） |
| `lvl.b1` | B1 | B1 | B1 | B1 | B1 | B1 | （未使用・予約） |
| `lvl.b2` | B2 | B2 | B2 | B2 | B2 | B2 | （未使用・予約） |
| `lvl.c1` | C1 | C1 | C1 | C1 | C1 | C1 | （未使用・予約） |
| `lvl.label` | CEFR level | CEFR レベル | CEFR 级别 | CEFR 級別 | CEFR 레벨 | CEFR antas | setup / 練習 |
| `lvl.pool` | Pool: {n} words | 対象 {n} 語 | 词库 {n} 词 | 詞庫 {n} 詞 | 대상 {n}개 단어 | Pool: {n} salita | （未使用・予約） |
| `meter_done` | done | 完了 | 完成 | 完成 | 완료 | tapos na | （未参照） |
| `mode.a` | IPA read & write | IPA読み書き | IPA 读写 | IPA 讀寫 | IPA 읽기·쓰기 | Basahin at isulat ang IPA | setup / 練習 |
| `mode.label` | Learning mode | 学習モード | 学习模式 | 學習模式 | 학습 모드 | Mode ng pag-aaral | setup / 練習 |
| `modeb.band.label` | Band | バンド | 词汇级别 | 詞彙級別 | 레벨 | Banda | （未参照） |
| `modeb.band.note` | {band}: {n} words · {pct}% mastered ({m} at box 4+) | {band}: {n}語 · 習得率{pct}%（box4+ {m}語） | {band}：{n}词 · 掌握率{pct}%（box4+ {m}词） | {band}:{n}詞 · 熟練度{pct}%(box4+ {m}詞) | {band}: {n}개 단어 · 습득률 {pct}% (box4+ {m}개) | {band}: {n} salita · {pct}% na-master ({m} sa box 4+) | （未参照） |
| `modeb.correct` | Correct | 正解 | 正确 | 正確 | 정답 | Tama | setup / Mode B |
| `modeb.incorrect` | Try again | 不正解 | 错误 | 錯誤 | 오답 | Subukang muli | setup / Mode B |
| `modeb.lead_html` | Learn <b>new words from sound</b>&mdash;hear the wor... | 既知語ではなく<b>音から新しい語彙</b>を覚える。音を聞き、意味と綴りを確認。CEFRバンドで段階的... | 从<b>声音学习新词</b>——先听发音，再匹配意思和拼写。按 CEFR 级别递进，并自动安排复习。 | 從<b>聲音學習新詞</b>——先聽發音,再對應意思和拼寫。依 CEFR 級別遞進,並自動安排複習。 | <b>소리로 새 단어</b>를 익힙니다. 발음을 듣고 의미와 철자를 확인합니다. CEFR 밴드... | Sa halip na alam nang salita, matuto ng <b>bagong bo... | （未参照） |
| `modeb.pool` | Band {band}: {n} words · {pct}% mastered | バンド {band}: {n}語 · 習得率{pct}% | 级别 {band}：{n}词 · 掌握率{pct}% | 級別 {band}:{n}詞 · 熟練度{pct}% | 밴드 {band}: {n}개 단어 · 습득률 {pct}% | Band {band}: {n} salita · {pct}% na-master | （未参照） |
| `modeb.quiz.choose_meaning` | Choose the meaning | 意味を選ぶ | 选择意思 | 選擇意思 | 의미를 선택 | Piliin ang kahulugan | setup / Mode B |
| `modeb.quiz.type_word` | Type the word | 単語を入力 | 输入单词 | 輸入單字 | 단어를 입력 | I-type ang salita | setup / Mode B |
| `modeb.study.got_it` | Next | 次へ | 下一题 | 下一題 | 다음 | Susunod | setup / Mode B |
| `modeb.study.reveal_meaning` | Reveal meaning | 意味を確認する | 查看含义 | 查看含義 | 의미 확인하기 | Tingnan ang kahulugan | setup / Mode B |
| `modeb.title` | Listen & learn | 聞いて覚える | 听音学词 | 聽音學詞 | 듣고 익히기 | Makinig at matuto | setup / Mode B |
| `next` | Next | 次へ | 下一题 | 下一題 | 다음 | Susunod | reveal |
| `note.pattern` | Spelling pattern: {p} | 綴り規則: {p} | 拼写规则: {p} | 拼寫規則: {p} | 철자 규칙: {p} | Padron ng baybay: {p} | reveal |
| `note.schwa` | Schwa (ə/ɚ): stay weak and vague, not led by spelling | 弱化母音(ə/ɚ): 綴りに引っ張られず曖昧に | 弱读元音(ə/ɚ): 勿被拼写牵引，要含糊轻读 | 弱讀母音(ə/ɚ): 勿被拼寫牽引,要含糊輕讀 | 약화 모음(ə/ɚ): 철자에 끌리지 말고 약하고 모호하게 | Schwa (ə/ɚ): manatiling mahina at malabo, huwag pada... | reveal |
| `note.stress` | Stress syllable {n} ({sy} syllables) | 第{n}音節を強く（{sy}音節） | 重读第{n}音节（共{sy}音节） | 重讀第{n}音節(共{sy}音節) | 제{n}음절 강세 ({sy}음절) | Diinan ang pantig {n} ({sy} pantig) | reveal |
| `note.tricky` | Tricky sounds: {s} | 要注意音: {s} | 需注意音: {s} | 需注意音: {s} | 주의할 소리: {s} | Mga mahirap na tunog: {s} | reveal |
| `patterns.magic_e` | silent e | マジックe | 不发音e | 不發音e | 묵음 e | tahimik na e | reveal（pattern置換） |
| `pool.count` | Pool: {n} words | 対象 {n} 語 | 词库 {n} 词 | 詞庫 {n} 詞 | 대상 {n}개 단어 | Pool: {n} salita | setup |
| `pool.count_phrases` | Pool: {n} phrases | 対象 {n} 句 | 词库 {n} 句 | 詞庫 {n} 句 | 대상 {n}개 구 | Pool: {n} parirala | （未参照） |
| `pool.count_weak` | Pool: {n} weak forms | 対象 {n} 弱形 | 词库 {n} 弱读形式 | 詞庫 {n} 弱讀形式 | 대상 {n}개 약형 | Pool: {n} mahinang anyo | （未参照） |
| `pos.be動詞` | be verb | be動詞 | be动词 | be動詞 | be동사 | pandiwang be | （未使用・posLabel定義のみ） |
| `pos.代名詞` | pronoun | 代名詞 | 代词 | 代名詞 | 대명사 | panghalip | （未使用・posLabel定義のみ） |
| `pos.前置詞` | preposition | 前置詞 | 介词 | 介詞 | 전치사 | pang-ukol | （未使用・posLabel定義のみ） |
| `pos.副詞` | adverb | 副詞 | 副词 | 副詞 | 부사 | pang-abay | （未使用・posLabel定義のみ） |
| `pos.副詞 / 前置詞` | adverb / preposition | 副詞 / 前置詞 | 副词 / 介词 | 副詞 / 介詞 | 부사 / 전치사 | pang-abay / pang-ukol | （未使用・posLabel定義のみ） |
| `pos.助動詞` | modal verb | 助動詞 | 情态动词 | 情態動詞 | 조동사 | pandiwang pantulong | （未使用・posLabel定義のみ） |
| `pos.動詞` | verb | 動詞 | 动词 | 動詞 | 동사 | pandiwa | （未使用・posLabel定義のみ） |
| `pos.動詞（不規則変化）` | irregular verb form | 不規則変化（動詞） | 不规则动词变化 | 不規則動詞變化 | 불규칙 동사 변화 | di-regular na anyo ng pandiwa | （未使用・posLabel定義のみ） |
| `pos.口語表現` | casual expression | 口語表現 | 口语表达 | 口語表達 | 구어 표현 | pang-araw-araw na ekspresyon | （未使用・posLabel定義のみ） |
| `pos.名詞` | noun | 名詞 | 名词 | 名詞 | 명사 | pangngalan | （未使用・posLabel定義のみ） |
| `pos.名詞（不規則複数）` | irregular plural | 不規則複数（名詞） | 不规则复数 | 不規則複數 | 불규칙 복수 | di-regular na maramihan | （未使用・posLabel定義のみ） |
| `pos.形容詞` | adjective | 形容詞 | 形容词 | 形容詞 | 형용사 | pang-uri | （未使用・posLabel定義のみ） |
| `pos.形容詞 / 副詞` | adjective / adverb | 形容詞 / 副詞 | 形容词 / 副词 | 形容詞 / 副詞 | 형용사 / 부사 | pang-uri / pang-abay | （未使用・posLabel定義のみ） |
| `pos.接続詞` | conjunction | 接続詞 | 连词 | 連接詞 | 접속사 | pangatnig | （未使用・posLabel定義のみ） |
| `pos.文字` | letter name | 文字名 | 字母名 | 字母名 | 문자 이름 | pangalan ng titik | （未使用・posLabel定義のみ） |
| `pos.短縮形` | contraction | 短縮形 | 缩写形式 | 縮寫形式 | 축약형 | pinaikli | （未使用・posLabel定義のみ） |
| `pos.間投詞` | interjection | 間投詞 | 感叹词 | 感嘆詞 | 감탄사 | pandamdam | （未使用・posLabel定義のみ） |
| `pos.限定詞` | determiner | 限定詞 | 限定词 | 限定詞 | 한정사 | pantukoy | （未使用・posLabel定義のみ） |
| `reflect.btn` | Reflect | 振り返り | 回顾 | 回顧 | 돌아보기 | Pagbalik-tanaw | setup / 練習 |
| `reg.all` | All | すべて | 全部 | 全部 | 전체 | Lahat | setup（Words） |
| `reg.irregular` | Irregular | 不規則 | 不规则 | 不規則 | 불규칙 | Di-regular | setup（Words） |
| `reg.irregular_d` | Common words with irregular spelling | 日常語の不規則綴り | 常用词的不规则拼写 | 常用詞的不規則拼寫 | 일상어의 불규칙 철자 | Karaniwang salita na may di-regular na baybay | setup（Words） |
| `reg.label` | Spelling pattern | 綴りパターン | 拼写模式 | 拼寫模式 | 철자 패턴 | Padron ng baybay | setup（Words） |
| `reg.regular` | Regular | 規則 | 规则 | 規則 | 규칙 | Regular | setup（Words） |
| `reg.regular_d` | Phonics and spelling–sound rules | フォニックス／綴りと音の対応 | 自然拼读／拼写–读音规则 | 自然發音／拼寫–讀音規則 | 파닉스／철자–소리 규칙 | Phonics at mga tuntunin ng baybay–tunog | setup（Words） |
| `reveal.alt_same` | same | 同じ | 相同 | 相同 | 같음 | pareho | reveal |
| `reveal.dict_label` | Dictionary | 辞書表記 | 词典表记 | 詞典標記 | 사전 표기 | Diksyonaryo | reveal |
| `reveal.ga_note` | GA | GA | GA | GA | GA | GA | reveal |
| `reveal.respell_label` | Respelling | 発音ガイド | 简易发音 | 簡易發音 | 발음 가이드 | Gabay sa bigkas | （未参照） |
| `reveal.rp_note` | RP | RP | RP | RP | RP | RP | reveal |
| `see_answer` | See the answer | 答えを確認 | 查看答案 | 查看答案 | 정답 확인 | Tingnan ang sagot | reveal |
| `set.daily_d` | Common words (including irregular spellings) | よく使う語（不規則綴りを含む） | 常用词（含不规则拼写） | 常用詞(含不規則拼寫) | 자주 쓰는 단어(불규칙 철자 포함) | Karaniwang salita (kasama ang di-regular na baybay) | （未使用・予約） |
| `set.daily_t` | Daily words · CEFR A1–A2 | 日常語 · CEFR A1–A2 | 日常词 · CEFR A1–A2 | 日常詞 · CEFR A1–A2 | 일상 어휘 · CEFR A1–A2 | Pang-araw-araw na salita · CEFR A1–A2 | （未使用・予約） |
| `set.label` | Question set | 出題セット | 题库 | 題庫 | 문제 세트 | Set ng tanong | （未使用・予約） |
| `set.phonics_d` | Words with regular spelling&ndash;sound correspondences | 綴りと発音が規則的に対応する語 | 拼写与读音规则对应的词 | 拼寫與讀音規則對應的詞 | 철자와 소리가 규칙적으로 대응하는 단어 | Mga salitang may regular na tugma ng baybay&ndash;tunog | （未使用・予約） |
| `set.phonics_t` | Phonics patterns · spelling &harr; sound | 規則パターン · 綴り &harr; 音 | 拼读规则 · 拼写 &harr; 音 | 自然發音規則 · 拼寫 &harr; 音 | 규칙 패턴 · 철자 &harr; 소리 | Mga padron ng phonics · baybay &harr; tunog | （未使用・予約） |
| `settings_btn` | Language | 言語 | 语言 | 語言 | 언어 | Wika | settings |
| `settings_close` | Close | 閉じる | 关闭 | 關閉 | 닫기 | Isara | settings |
| `settings_lang` | Language | 言語 | 语言 | 語言 | 언어 | Wika | settings |
| `settings_title` | Settings | 設定 | 设置 | 設定 | 설정 | Mga Setting | settings |
| `setup.hide_filters` | Hide filters | 設定を閉じる | 收起设置 | 收合設定 | 설정 닫기 | Itago ang mga setting | setup / 練習 |
| `setup.show_filters` | Customize filters | 詳しい設定 | 详细设置 | 詳細設定 | 상세 설정 | Mga detalyadong setting | setup / 練習 |
| `start` | Start | はじめる | 开始 | 開始 | 시작 | Simulan | setup / summary |
| `summary.again` | Play again | もう一周 | 再来一轮 | 再來一輪 | 다시 하기 | Maglaro muli | （未参照） |
| `summary.line` | {c} / {t} correct · {m} to review | {c} / {t} 正解 · 復習 {m} 語 | {c} / {t} 正确 · 复习 {m} 词 | {c} / {t} 正確 · 複習 {m} 詞 | {c} / {t} 정답 · 복습 {m}개 | {c} / {t} tama · {m} babalikan | summary |
| `summary.review` | Review list: {list} | 復習リスト: {list} | 复习列表: {list} | 複習清單: {list} | 복습 목록: {list} | Listahan ng babalikan: {list} | summary |
| `summary.weak_btn` | Review misses only | 苦手だけ復習 | 只复习错题 | 只複習錯題 | 틀린 것만 복습 | Balikan ang mga mali lamang | summary |
| `summary.weak_head` | Sounds to practice next | 次に練習すべき音 | 建议练习的音 | 建議練習的音 | 다음에 연습할 소리 | Mga tunog na susunod na sanayin | summary |
| `summary.weak_none_d` | No missed sounds. Try a higher level. | ミスした音はありません。レベルを上げてもOK。 | 没有错过的音。可尝试更高难度。 | 沒有錯過的音。可嘗試更高難度。 | 틀린 소리가 없습니다. 레벨을 올려 보세요. | Walang naling tunog. Subukan ang mas mataas na antas. | summary |
| `summary.weak_none_t` | No weak sounds detected | 苦手音は検出されませんでした | 未检测到薄弱音 | 未偵測到弱點音 | 약한 소리가 감지되지 않았습니다 | Walang natukoy na mahinang tunog | summary |
| `syl` | {n} syllable | {n}音節 | {n}个音节 | {n}個音節 | {n}음절 | {n} pantig | （未使用・予約） |
| `syl_pl` | {n} syllables | {n}音節 | {n}个音节 | {n}個音節 | {n}음절 | {n} pantig | （未使用・予約） |
| `tab.connected` | Linking | 連結音 | 连读音 | 連音 | 연음 | Linking | setup |
| `tab.label` | Practice mode | 練習モード | 练习模式 | 練習模式 | 연습 모드 | Mode ng pagsasanay | setup |
| `tab.weak` | Weak Forms | 弱形 | 弱读形式 | 弱讀形式 | 약형 | Mahihinang Anyo | setup |
| `tab.words` | One word | 一単語 | 一词 | 單字 | 한 단어 | Isang salita | setup |
| `tips_head` | Pronunciation tips | 発音ポイント | 发音要点 | 發音要點 | 발음 포인트 | Mga tip sa pagbigkas | reveal |
| `vocab.no_results` | No results | 見つかりません | 无结果 | 無結果 | 결과 없음 | Walang resulta | setup / 練習 |
| `vocab.search` | Search… | 検索… | 搜索… | 搜尋… | 검색… | Maghanap… | setup / 練習 |
| `vocab.tab_phrases` | Phrases | フレーズ | 短语 | 片語 | 구문 | Mga Parirala | setup / 練習 |
| `vocab.tab_words` | Words | 単語 | 单词 | 單字 | 단어 | Mga Salita | setup / 練習 |
| `vocab.title` | Vocabulary | 語彙リスト | 词汇表 | 詞彙表 | 단어 목록 | Talaan ng Bokabularyo | setup / 練習 |
| `weak.strong_label` | Strong | 強形 | 强读 | 強讀 | 강형 | Malakas | reveal（Weak Forms） |
| `weak.weak_label` | Weak | 弱形 | 弱读 | 弱讀 | 약형 | Mahina | reveal（Weak Forms） |
| `wordlist_fail` | Failed to load word list | 単語リストの読み込みに失敗しました | 词表加载失败 | 單字表載入失敗 | 단어 목록을 불러오지 못했습니다 | Nabigong i-load ang listahan ng salita | setup / summary |
| `you` | You: {a} | あなた: {a} | 你的答案: {a} | 你的答案: {a} | 당신: {a} | Ikaw: {a} | reveal |

---

## 2. 画面別分類

### decode

- `input_ph`

### decode / encode / Mode B

- `check`

### decode / encode / reveal

- `listen`

### decode / encode / reveal（音素パネル）

- `info.examples`
- `info.mouth`
- `info.watch`

### decode（Connected）

- `input_phrase`

### encode

- `build_ph`
- `clear`
- `kbd.consonants`
- `kbd.diphthongs`
- `kbd.r_vowels`
- `kbd.stress`
- `kbd.vowels`

### reveal

- `next`
- `note.pattern`
- `note.schwa`
- `note.stress`
- `note.tricky`
- `reveal.alt_same`
- `reveal.dict_label`
- `reveal.ga_note`
- `reveal.rp_note`
- `see_answer`
- `tips_head`
- `you`

### reveal（Weak Forms）

- `weak.strong_label`
- `weak.weak_label`

### reveal（pattern置換）

- `patterns.magic_e`

### settings

- `accent.label`
- `settings_btn`
- `settings_close`
- `settings_lang`
- `settings_title`

### settings / guide

- `guide.close`
- `guide.open`
- `guide.title`

### settings（動的参照）

- `accent.ga`
- `accent.rp`
- `lang_opts.en`
- `lang_opts.fil`
- `lang_opts.ja`
- `lang_opts.ko`
- `lang_opts.zh-Hans`
- `lang_opts.zh-Hant`

### setup

- `pool.count`
- `tab.connected`
- `tab.label`
- `tab.weak`
- `tab.words`

### setup / Mode B

- `modeb.correct`
- `modeb.incorrect`
- `modeb.quiz.choose_meaning`
- `modeb.quiz.type_word`
- `modeb.study.got_it`
- `modeb.study.reveal_meaning`
- `modeb.title`

### setup / summary

- `load_fail`
- `loading`
- `start`
- `wordlist_fail`

### setup / 練習

- `cefr.pending`
- `cefr.pending_hint`
- `exit_confirm.body`
- `exit_confirm.no`
- `exit_confirm.title`
- `exit_confirm.yes`
- `lvl.label`
- `mode.a`
- `mode.label`
- `reflect.btn`
- `setup.hide_filters`
- `setup.show_filters`
- `vocab.no_results`
- `vocab.search`
- `vocab.tab_phrases`
- `vocab.tab_words`
- `vocab.title`

### setup（Connected / Weak）

- `cs.level.all`
- `cs.level.l1`
- `cs.level.l2`
- `cs.level.l3`
- `cs.level.label`

### setup（Connected）

- `cs.all`
- `cs.assimilation`
- `cs.elision`
- `cs.label`
- `cs.linking`
- `cs.ruleLabel`

### setup（Words）

- `dir.decode_d`
- `dir.decode_t`
- `dir.encode_d`
- `dir.encode_t`
- `dir.label`
- `focus.all`
- `focus.casual`
- `focus.contractions`
- `focus.irregular`
- `focus.label`
- `focus.letters`
- `focus.traps`
- `focus.traps_d`
- `focus.weak`
- `focus.weak_d`
- `grp.all`
- `grp.label`
- `grp.long`
- `grp.r`
- `grp.short`
- `grp.team`
- `reg.all`
- `reg.irregular`
- `reg.irregular_d`
- `reg.label`
- `reg.regular`
- `reg.regular_d`

### summary

- `summary.line`
- `summary.review`
- `summary.weak_btn`
- `summary.weak_head`
- `summary.weak_none_d`
- `summary.weak_none_t`

### 共通

- `back_top`

### 共通（トップバー）

- `brand.home`
- `brand.name`

### （未使用・posLabel定義のみ）

- `pos.be動詞`
- `pos.代名詞`
- `pos.前置詞`
- `pos.副詞`
- `pos.副詞 / 前置詞`
- `pos.助動詞`
- `pos.動詞`
- `pos.動詞（不規則変化）`
- `pos.口語表現`
- `pos.名詞`
- `pos.名詞（不規則複数）`
- `pos.形容詞`
- `pos.形容詞 / 副詞`
- `pos.接続詞`
- `pos.文字`
- `pos.短縮形`
- `pos.間投詞`
- `pos.限定詞`

### （未使用・予約）

- `hint.first`
- `hint.pos`
- `hint.syl`
- `lvl.a1`
- `lvl.a2`
- `lvl.b1`
- `lvl.b2`
- `lvl.c1`
- `lvl.pool`
- `set.daily_d`
- `set.daily_t`
- `set.label`
- `set.phonics_d`
- `set.phonics_t`
- `syl`
- `syl_pl`

### （未参照）

- `lead_connected_html`
- `lead_html`
- `lead_weak_html`
- `meter_done`
- `modeb.band.label`
- `modeb.band.note`
- `modeb.lead_html`
- `modeb.pool`
- `pool.count_phrases`
- `pool.count_weak`
- `reveal.respell_label`
- `summary.again`

---

## 3. 音素解説（`i18n/phonemes/*.json`）

- 音素記号数: en=47（全 UI 言語で一致）
- 6 UI 言語間で音素キー集合は一致（`validate_i18n.py` [B]）

各記号のフィールド: `lab`, `ex`, `mouth`, `trap`, `t`（要注意フラグ）

| 記号 | 画面 | フィールド |
|------|------|-----------|
| `θ` … `ʊə` 等 **47 記号** | decode / encode / reveal（音素パネル） | lab, ex, mouth, trap, t |

---

## 4. 動的参照キー（`index.html` で接尾辞結合）

| 接頭辞 | 例 | 用途 |
|--------|-----|------|
| `lang_opts.` | `t("lang_opts." + code)` | 言語ピッカー |
| `accent.` | `t("accent." + ga\|rp)` | アクセントピッカー |

---

## 5. ハードコード文字列（初期 HTML・起動後に `applyI18n()` で置換）

| ファイル:行付近 | 文字列 | 備考 |
|----------------|--------|------|
| `index.html:225` | IPA Dictation / A1–A2 · GA | `#brandName` / `#brandSub` → `brand.*` |
| `index.html:228` | Settings（aria-label） | 起動後 `settings_btn` で置換 |
| `index.html:229` | Menu | 起動後 `back_top` で置換 |
| `index.html:428–433` | English / 日本語 / 繁體 / 简体 / 한국어 / Filipino | 起動後 `lang_opts.*` で置換 |
| `index.html:438–439` | American (GA) / British (RP) | 起動後 `accent.*` で置換 |
| `index.html:456–462` | Guide 言語ピル（en/ja/ko/繁體/简体/Filipino） | **ガイド専用**（UI i18n 外） |
| `index.html` encode | ⌫ | IPA キーボード（言語非依存） |

**常に英語のまま:** `<title>` は起動前のみ英語。`document.title` は `applyI18n()` で `brand.name` に更新。
