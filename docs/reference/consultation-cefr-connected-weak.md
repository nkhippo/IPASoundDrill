---
id: pj-2026-07-08-027d
aliases:
- pj-2026-07-08-027d
title: 'Claude相談: 連結音・弱形への CEFR 付与'
created: '2026-07-08'
---

# Claude相談: 連結音・弱形への CEFR 付与

> 作成日: 2026-07-08  
> 目的: `data/connected_speech.json`（連結音）と `data/weak_forms.json`（弱形）には現在 CEFR（A1–C1）が無く、出題カードで「A2」等を表示できない。各項目に CEFR を提案してほしい。

## 現状

| データ | 件数 | CEFR | 既存難易度 |
|--------|-----:|------|------------|
| 単語 `wordlist_*.json` | 3639 | 全件あり（A1–B2） | `cefr` |
| 連結音 `connected_speech.json` | 201 | **なし** | 整数 `level` 1–3 |
| 弱形 `weak_forms.json` | 36 | **なし** | 整数 `level` 1–3 |

アプリ側の `level` は教材難易度（Beginner / Intermediate / Advanced）であり、CEFR とは別軸です。

## お願いしたいこと

1. 各項目に **CEFR ラベル（A1 / A2 / B1 / B2 / C1）** を1つ提案する。
2. 根拠を短く書く（構成語の CEFR、句の頻度、機能語の弱形学習段階、など）。
3. 迷う場合は候補を複数挙げ、推奨を明示する。
4. 可能なら出力を JSON 配列でも返す（アプリへマージしやすい形）:

```json
[
  {"id": "cs001", "w": "an apple", "cefr": "A1", "note": "..."},
  {"id": "wf001", "w": "a", "cefr": "A1", "note": "..."}
]
```

## 判定のヒント（参考）

- 連結句は、構成語の **最も高い CEFR**、または句全体として学習者に出る段階を目安にしてよい。
- 弱形は機能語そのものは A1 級でも、「連結文中の弱形として聞く」練習は A2–B1 になり得る。必要なら「語彙 CEFR」と「練習 CEFR」を分けて提案してよい（最終的にアプリに載せるのは練習 CEFR 想定）。
- CEFR-J / English Vocabulary Profile / 教科書での登場段階を根拠にできるとよい。
- 既存 `level`（1/2/3）はあくまでアプリ内の難易度ヒント。CEFR と機械対応させないこと。

## 連結音一覧（connected speech）

件数: 201（level 分布: {1: 61, 2: 67, 3: 73}）

| id | phrase | IPA (GA) | cs_type | app level | gloss (ja) | 提案CEFR | 根拠 |
|----|--------|----------|---------|-----------|------------|----------|------|
| cs001 | an apple | `/əˈnæpəl/` | linking | 1 (Beginner (app L1)) | リンゴ |  |  |
| cs002 | pick it up | `/ˈpɪkɪˈtʌp/` | linking | 1 (Beginner (app L1)) | 拾い上げる |  |  |
| cs003 | come on | `/kʌˈmɑn/` | linking | 1 (Beginner (app L1)) | さあ、おいで |  |  |
| cs004 | look at | `/ˈlʊkət/` | linking | 1 (Beginner (app L1)) | 見る |  |  |
| cs005 | check it | `/ˈtʃɛkɪt/` | linking | 1 (Beginner (app L1)) | 確認する |  |  |
| cs006 | turn off | `/tɝˈnɔf/` | linking | 1 (Beginner (app L1)) | 消す |  |  |
| cs007 | an hour | `/əˈnaʊɝ/` | linking | 1 (Beginner (app L1)) | 1時間 |  |  |
| cs008 | far away | `/ˌfɑrəˈweɪ/` | linking | 1 (Beginner (app L1)) | 遠く離れて |  |  |
| cs009 | I am | `/aɪˈjæm/` | linking | 1 (Beginner (app L1)) | 私は～です |  |  |
| cs010 | go away | `/ˌɡoʊwəˈweɪ/` | linking | 1 (Beginner (app L1)) | 立ち去る |  |  |
| cs011 | the end | `/ðiˈjɛnd/` | linking | 1 (Beginner (app L1)) | 終わり |  |  |
| cs012 | did you | `/ˈdɪdʒu/` | assimilation | 1 (Beginner (app L1)) | ～しましたか |  |  |
| cs013 | would you | `/ˈwʊdʒu/` | assimilation | 1 (Beginner (app L1)) | ～してくれますか |  |  |
| cs014 | could you | `/ˈkʊdʒu/` | assimilation | 1 (Beginner (app L1)) | ～できますか |  |  |
| cs015 | don't you | `/ˈdoʊntʃu/` | assimilation | 1 (Beginner (app L1)) | ～しないの |  |  |
| cs016 | won't you | `/ˈwoʊntʃu/` | assimilation | 1 (Beginner (app L1)) | ～しませんか |  |  |
| cs017 | next day | `/ˈnɛksˌdeɪ/` | elision | 1 (Beginner (app L1)) | 翌日 |  |  |
| cs018 | must be | `/ˈmʌsbi/` | elision | 1 (Beginner (app L1)) | ～にちがいない |  |  |
| cs019 | old man | `/ˈoʊlˈmæn/` | elision | 1 (Beginner (app L1)) | 老人 |  |  |
| cs020 | last night | `/ˈlæsˈnaɪt/` | elision | 1 (Beginner (app L1)) | 昨夜 |  |  |
| cs021 | best friend | `/ˈbɛsˈfrɛnd/` | elision | 1 (Beginner (app L1)) | 親友 |  |  |
| cs022 | a lot of | `/əˈlɑɾəv/` | linking | 2 (Intermediate (app L2)) | たくさんの |  |  |
| cs023 | part of it | `/ˈpɑrɾəvɪt/` | linking | 2 (Intermediate (app L2)) | その一部 |  |  |
| cs024 | first of all | `/ˈfɝsəˈvɔl/` | linking | 2 (Intermediate (app L2)) | まず第一に |  |  |
| cs025 | more and more | `/ˈmɔrənˈmɔr/` | linking | 2 (Intermediate (app L2)) | ますます |  |  |
| cs026 | get out of | `/ˌɡɛˈɾaʊɾəv/` | linking | 2 (Intermediate (app L2)) | ～から出る |  |  |
| cs027 | hold on a sec | `/ˌhoʊldɑˈnəˈsɛk/` | linking | 2 (Intermediate (app L2)) | ちょっと待って |  |  |
| cs028 | not at all | `/ˈnɑɾəˈtɔl/` | linking | 2 (Intermediate (app L2)) | 全然～ない |  |  |
| cs029 | one of them | `/ˈwʌnəvðəm/` | linking | 2 (Intermediate (app L2)) | そのうちの一つ |  |  |
| cs030 | got you | `/ˈɡɑtʃu/` | assimilation | 2 (Intermediate (app L2)) | わかった／捕まえた |  |  |
| cs031 | what you | `/ˈwʌtʃu/` | assimilation | 2 (Intermediate (app L2)) | あなたが何を |  |  |
| cs032 | would you mind | `/ˈwʊdʒuˈmaɪnd/` | assimilation | 2 (Intermediate (app L2)) | ～していただけますか |  |  |
| cs033 | in case | `/ˈɪŋˈkeɪs/` | assimilation | 2 (Intermediate (app L2)) | ～の場合に備えて |  |  |
| cs034 | ten boys | `/ˈtɛmˈbɔɪz/` | assimilation | 2 (Intermediate (app L2)) | 10人の少年 |  |  |
| cs035 | good boy | `/ˈɡʊbˈbɔɪ/` | assimilation | 2 (Intermediate (app L2)) | いい子 |  |  |
| cs036 | that case | `/ˈðækˈkeɪs/` | assimilation | 2 (Intermediate (app L2)) | あの件 |  |  |
| cs037 | bless you | `/ˈblɛʃu/` | assimilation | 2 (Intermediate (app L2)) | お大事に |  |  |
| cs038 | kind of | `/ˈkaɪndəv/` | elision | 2 (Intermediate (app L2)) | ちょっと、まあ |  |  |
| cs039 | sort of | `/ˈsɔrɾəv/` | elision | 2 (Intermediate (app L2)) | ある程度、まあ |  |  |
| cs040 | ask them | `/ˈæskðəm/` | elision | 2 (Intermediate (app L2)) | 彼らに尋ねる |  |  |
| cs041 | tell him | `/ˈtɛlɪm/` | elision | 2 (Intermediate (app L2)) | 彼に伝える |  |  |
| cs042 | give her | `/ˈɡɪvɝ/` | elision | 2 (Intermediate (app L2)) | 彼女に渡す |  |  |
| cs043 | cup of tea | `/ˈkʌpəˈti/` | elision | 2 (Intermediate (app L2)) | 一杯のお茶 |  |  |
| cs044 | lots of time | `/ˈlɑtsəˈtaɪm/` | elision | 2 (Intermediate (app L2)) | たっぷりの時間 |  |  |
| cs045 | send them | `/ˈsɛnðəm/` | elision | 2 (Intermediate (app L2)) | 彼らに送る |  |  |
| cs046 | what do you want | `/ˈwʌɾəjəˈwɑnt/` | linking | 3 (Advanced (app L3)) | 何が欲しいの？ |  |  |
| cs047 | how are you doing | `/ˈhaʊwɝjəˈduɪŋ/` | linking | 3 (Advanced (app L3)) | 調子はどう？ |  |  |
| cs048 | come and see | `/ˈkʌmənˈsi/` | linking | 3 (Advanced (app L3)) | 見に来て |  |  |
| cs049 | pick up on it | `/ˌpɪˈkʌpɑˈnɪt/` | linking | 3 (Advanced (app L3)) | それに気づく |  |  |
| cs050 | an awful lot of it | `/əˈnɔfəˈlɑɾəvɪt/` | linking | 3 (Advanced (app L3)) | それのものすごい量 |  |  |
| cs051 | get it over with | `/ˌɡɛˈɾɪˈɾoʊvɝwɪθ/` | linking | 3 (Advanced (app L3)) | さっさと終わらせる |  |  |
| cs052 | all of a sudden | `/ˈɔləvəˈsʌdən/` | linking | 3 (Advanced (app L3)) | 突然 |  |  |
| cs053 | did you eat yet | `/ˈdɪdʒuˈwiˈtʃɛt/` | assimilation | 3 (Advanced (app L3)) | もう食べた？ |  |  |
| cs054 | would you like some | `/ˈwʊdʒuˈlaɪksəm/` | assimilation | 3 (Advanced (app L3)) | いかがですか？ |  |  |
| cs055 | nice to meet you | `/ˈnaɪstuˈmiˈtʃu/` | assimilation | 3 (Advanced (app L3)) | はじめまして |  |  |
| cs056 | can't you see | `/ˈkæntʃuˈsi/` | assimilation | 3 (Advanced (app L3)) | わからないの？ |  |  |
| cs057 | ten past nine | `/ˈtɛmˈpæsˈnaɪn/` | assimilation | 3 (Advanced (app L3)) | 9時10分 |  |  |
| cs058 | green park | `/ˈɡrimˈpɑrk/` | assimilation | 3 (Advanced (app L3)) | グリーンパーク |  |  |
| cs059 | won't you come in | `/ˈwoʊntʃuˈkʌmɪn/` | assimilation | 3 (Advanced (app L3)) | 入りませんか？ |  |  |
| cs060 | this year | `/ˈðɪʃɪr/` | assimilation | 3 (Advanced (app L3)) | 今年 |  |  |
| cs061 | miss you | `/ˈmɪʃu/` | assimilation | 3 (Advanced (app L3)) | 会いたい |  |  |
| cs062 | I don't know | `/ˌaɪdoʊˈnoʊ/` | elision | 3 (Advanced (app L3)) | わからない |  |  |
| cs063 | what's the matter | `/ˈwʌtsðəˈmæɾɝ/` | elision | 3 (Advanced (app L3)) | どうしたの？ |  |  |
| cs064 | a couple of days | `/əˈkʌpələˈdeɪz/` | elision | 3 (Advanced (app L3)) | 2、3日 |  |  |
| cs065 | fish and chips | `/ˈfɪʃənˈtʃɪps/` | elision | 3 (Advanced (app L3)) | フィッシュ&チップス |  |  |
| cs066 | bread and butter | `/ˈbrɛɾənˈbʌɾɝ/` | elision | 3 (Advanced (app L3)) | バターを塗ったパン |  |  |
| cs067 | you and me | `/ˈjuənˈmi/` | elision | 3 (Advanced (app L3)) | 君と僕 |  |  |
| cs068 | I should have known | `/ˌaɪʃʊɾəvˈnoʊn/` | elision | 3 (Advanced (app L3)) | 気づくべきだった |  |  |
| cs069 | a piece of cake | `/əˈpisəˈkeɪk/` | elision | 3 (Advanced (app L3)) | 朝飯前 |  |  |
| cs070 | out of the question | `/ˈaʊɾəvðəˈkwɛstʃən/` | elision | 3 (Advanced (app L3)) | 論外だ |  |  |
| cs071 | on it | `/ˈɑnɪt/` | linking | 1 (Beginner (app L1)) | その上に |  |  |
| cs072 | in it | `/ˈɪnɪt/` | linking | 1 (Beginner (app L1)) | その中に |  |  |
| cs073 | get up | `/ˌɡɛˈɾʌp/` | linking | 1 (Beginner (app L1)) | 起きる |  |  |
| cs074 | sit down | `/ˌsɪtˈdaʊn/` | linking | 1 (Beginner (app L1)) | 座る |  |  |
| cs075 | hold on | `/ˌhoʊlˈdɑn/` | linking | 1 (Beginner (app L1)) | 待って |  |  |
| cs076 | turn it on | `/ˈtɝnɪˈɾɑn/` | linking | 1 (Beginner (app L1)) | つける |  |  |
| cs077 | eat it | `/ˈiɾɪt/` | linking | 1 (Beginner (app L1)) | それを食べる |  |  |
| cs078 | read it | `/ˈriɾɪt/` | linking | 1 (Beginner (app L1)) | それを読む |  |  |
| cs079 | call us | `/ˈkɔləs/` | linking | 1 (Beginner (app L1)) | 私たちに電話して |  |  |
| cs080 | help us | `/ˈhɛlpəs/` | linking | 1 (Beginner (app L1)) | 助けて |  |  |
| cs081 | had you | `/ˈhædʒu/` | assimilation | 1 (Beginner (app L1)) | ～していましたか |  |  |
| cs082 | get you | `/ˈɡɛtʃu/` | assimilation | 1 (Beginner (app L1)) | あなたを得る |  |  |
| cs083 | let you | `/ˈlɛtʃu/` | assimilation | 1 (Beginner (app L1)) | あなたに許す |  |  |
| cs084 | told you | `/ˈtoʊldʒu/` | assimilation | 1 (Beginner (app L1)) | 言ったでしょ |  |  |
| cs085 | ten men | `/ˈtɛmˈmɛn/` | assimilation | 1 (Beginner (app L1)) | 10人の男 |  |  |
| cs086 | most people | `/ˈmoʊsˈpipəl/` | elision | 1 (Beginner (app L1)) | ほとんどの人 |  |  |
| cs087 | first time | `/ˈfɝsˈtaɪm/` | elision | 1 (Beginner (app L1)) | 初めて |  |  |
| cs088 | left turn | `/ˈlɛfˈtɝn/` | elision | 1 (Beginner (app L1)) | 左折 |  |  |
| cs089 | kept quiet | `/ˈkɛpˈkwaɪət/` | elision | 1 (Beginner (app L1)) | 黙っていた |  |  |
| cs090 | cold day | `/ˈkoʊlˈdeɪ/` | elision | 1 (Beginner (app L1)) | 寒い日 |  |  |
| cs091 | look it up | `/ˈlʊkɪˈɾʌp/` | linking | 2 (Intermediate (app L2)) | 調べる |  |  |
| cs092 | think about it | `/ˈθɪŋkəˈbaʊɾɪt/` | linking | 2 (Intermediate (app L2)) | 考えてみて |  |  |
| cs093 | as soon as | `/əˈsunəz/` | linking | 2 (Intermediate (app L2)) | ～するとすぐに |  |  |
| cs094 | such as | `/ˈsʌtʃəz/` | linking | 2 (Intermediate (app L2)) | ～のような |  |  |
| cs095 | end up | `/ˌɛnˈdʌp/` | linking | 2 (Intermediate (app L2)) | 結局～になる |  |  |
| cs096 | fill it in | `/ˈfɪlɪˈɾɪn/` | linking | 2 (Intermediate (app L2)) | 記入する |  |  |
| cs097 | run out of | `/ˈrʌˈnaʊɾəv/` | linking | 2 (Intermediate (app L2)) | ～を切らす |  |  |
| cs098 | by and large | `/ˈbaɪənˈlɑrdʒ/` | linking | 2 (Intermediate (app L2)) | 概して |  |  |
| cs099 | aren't you | `/ˈɑrntʃu/` | assimilation | 2 (Intermediate (app L2)) | ～ですよね |  |  |
| cs100 | haven't you | `/ˈhævəntʃu/` | assimilation | 2 (Intermediate (app L2)) | ～してないの |  |  |
| cs101 | about you | `/əˈbaʊtʃu/` | assimilation | 2 (Intermediate (app L2)) | あなたについて |  |  |
| cs102 | behind you | `/bɪˈhaɪndʒu/` | assimilation | 2 (Intermediate (app L2)) | あなたの後ろに |  |  |
| cs103 | good cook | `/ˈɡʊɡˈkʊk/` | assimilation | 2 (Intermediate (app L2)) | 料理上手 |  |  |
| cs104 | that boy | `/ˈðæbˈbɔɪ/` | assimilation | 2 (Intermediate (app L2)) | あの少年 |  |  |
| cs105 | one more | `/ˈwʌmˈmɔr/` | assimilation | 2 (Intermediate (app L2)) | もう一つ |  |  |
| cs106 | brown bag | `/ˈbraʊmˈbæɡ/` | assimilation | 2 (Intermediate (app L2)) | 茶色の袋 |  |  |
| cs107 | a lot of people | `/əˈlɑɾəˈpipəl/` | elision | 2 (Intermediate (app L2)) | 多くの人 |  |  |
| cs108 | most of them | `/ˈmoʊstəvðəm/` | elision | 2 (Intermediate (app L2)) | 彼らのほとんど |  |  |
| cs109 | hand me that | `/ˈhænmiˈðæt/` | elision | 2 (Intermediate (app L2)) | それを取って |  |  |
| cs110 | grandpa | `/ˈɡrænpɑ/` | elision | 2 (Intermediate (app L2)) | おじいちゃん |  |  |
| cs111 | friendship | `/ˈfrɛnʃɪp/` | elision | 2 (Intermediate (app L2)) | 友情 |  |  |
| cs112 | blind man | `/ˈblaɪnˈmæn/` | elision | 2 (Intermediate (app L2)) | 目の不自由な人 |  |  |
| cs113 | ask her | `/ˈæskɝ/` | elision | 2 (Intermediate (app L2)) | 彼女に尋ねる |  |  |
| cs114 | give it to him | `/ˈɡɪvɪtəˈɪm/` | elision | 2 (Intermediate (app L2)) | 彼にそれを渡す |  |  |
| cs115 | what are you up to | `/ˈwʌɾɝjəˈʌptu/` | linking | 3 (Advanced (app L3)) | 何してるの？ |  |  |
| cs116 | give it a go | `/ˈɡɪvɪɾəˈɡoʊ/` | linking | 3 (Advanced (app L3)) | 試してみる |  |  |
| cs117 | take it easy | `/ˈteɪkɪˈɾizi/` | linking | 3 (Advanced (app L3)) | 気楽にね |  |  |
| cs118 | once in a while | `/ˈwʌnsɪnəˈwaɪl/` | linking | 3 (Advanced (app L3)) | たまに |  |  |
| cs119 | up and down | `/ˈʌpənˈdaʊn/` | linking | 3 (Advanced (app L3)) | 上下に |  |  |
| cs120 | here and there | `/ˈhɪrənˈðɛr/` | linking | 3 (Advanced (app L3)) | あちこちに |  |  |
| cs121 | over and over | `/ˈoʊvɝənˈoʊvɝ/` | linking | 3 (Advanced (app L3)) | 何度も |  |  |
| cs122 | don't you worry | `/ˈdoʊntʃuˈwɝi/` | assimilation | 3 (Advanced (app L3)) | 心配しないで |  |  |
| cs123 | what do you think | `/ˈwʌɾəjəˈθɪŋk/` | assimilation | 3 (Advanced (app L3)) | どう思う？ |  |  |
| cs124 | could you tell me | `/ˈkʊdʒuˈtɛlmi/` | assimilation | 3 (Advanced (app L3)) | 教えてくれますか？ |  |  |
| cs125 | would you mind closing | `/ˈwʊdʒuˈmaɪnˈkloʊzɪŋ/` | assimilation | 3 (Advanced (app L3)) | 閉めていただけますか |  |  |
| cs126 | how's your day | `/ˈhaʊʒɝˈdeɪ/` | assimilation | 3 (Advanced (app L3)) | 今日はどう？ |  |  |
| cs127 | as you wish | `/əˈʒuˈwɪʃ/` | assimilation | 3 (Advanced (app L3)) | お望みのままに |  |  |
| cs128 | press your | `/ˈprɛʃɝ/` | assimilation | 3 (Advanced (app L3)) | 押してください |  |  |
| cs129 | I'm going to | `/ˈaɪməˈɡʌnə/` | elision | 3 (Advanced (app L3)) | ～するつもり |  |  |
| cs130 | want to go | `/ˈwɑnəˈɡoʊ/` | elision | 3 (Advanced (app L3)) | 行きたい |  |  |
| cs131 | a glass of water | `/əˈɡlæsəˈwɔɾɝ/` | elision | 3 (Advanced (app L3)) | コップ一杯の水 |  |  |
| cs132 | cup of coffee | `/ˈkʌpəˈkɔfi/` | elision | 3 (Advanced (app L3)) | 一杯のコーヒー |  |  |
| cs133 | the end of the day | `/ðiˈɛndəvðəˈdeɪ/` | elision | 3 (Advanced (app L3)) | 結局のところ |  |  |
| cs134 | sooner or later | `/ˈsunɝɝˈleɪɾɝ/` | elision | 3 (Advanced (app L3)) | 遅かれ早かれ |  |  |
| cs135 | now and then | `/ˈnaʊənˈðɛn/` | elision | 3 (Advanced (app L3)) | 時々 |  |  |
| cs136 | ladies and gentlemen | `/ˈleɪdizənˈdʒɛnəlmən/` | elision | 3 (Advanced (app L3)) | 皆様 |  |  |
| cs137 | I could have gone | `/ˌaɪkʊɾəvˈɡɔn/` | elision | 3 (Advanced (app L3)) | 行けたのに |  |  |
| cs138 | put it on | `/ˌpʊɾɪˈɾɑn/` | linking | 1 (Beginner (app L1)) | 着る |  |  |
| cs139 | wake up | `/ˌweɪˈkʌp/` | linking | 1 (Beginner (app L1)) | 目を覚ます |  |  |
| cs140 | stand up | `/ˌstænˈdʌp/` | linking | 1 (Beginner (app L1)) | 立つ |  |  |
| cs141 | an egg | `/əˈnɛɡ/` | linking | 1 (Beginner (app L1)) | 卵1つ |  |  |
| cs142 | his eyes | `/hɪˈzaɪz/` | linking | 1 (Beginner (app L1)) | 彼の目 |  |  |
| cs143 | this one | `/ˈðɪsˌwʌn/` | linking | 1 (Beginner (app L1)) | これ |  |  |
| cs144 | send you | `/ˈsɛndʒu/` | assimilation | 1 (Beginner (app L1)) | あなたに送る |  |  |
| cs145 | meet you | `/ˈmiˈtʃu/` | assimilation | 1 (Beginner (app L1)) | あなたに会う |  |  |
| cs146 | ten cups | `/ˈtɛŋˈkʌps/` | assimilation | 1 (Beginner (app L1)) | 10個のカップ |  |  |
| cs147 | green car | `/ˈɡriŋˈkɑr/` | assimilation | 1 (Beginner (app L1)) | 緑の車 |  |  |
| cs148 | soft drink | `/ˈsɔfˈdrɪŋk/` | elision | 1 (Beginner (app L1)) | 清涼飲料 |  |  |
| cs149 | hot dog | `/ˈhɑˈdɔɡ/` | elision | 1 (Beginner (app L1)) | ホットドッグ |  |  |
| cs150 | wild bird | `/ˈwaɪlˈbɝd/` | elision | 1 (Beginner (app L1)) | 野鳥 |  |  |
| cs151 | grand prize | `/ˈɡrænˈpraɪz/` | elision | 1 (Beginner (app L1)) | 大賞 |  |  |
| cs152 | at the end of | `/ətðiˈɛndəv/` | linking | 2 (Intermediate (app L2)) | ～の終わりに |  |  |
| cs153 | turn it off | `/ˈtɝnɪˈɾɔf/` | linking | 2 (Intermediate (app L2)) | 消す |  |  |
| cs154 | works of art | `/ˈwɝksəˈvɑrt/` | linking | 2 (Intermediate (app L2)) | 芸術作品 |  |  |
| cs155 | none of us | `/ˈnʌnəˈvʌs/` | linking | 2 (Intermediate (app L2)) | 私たちの誰も～ない |  |  |
| cs156 | can you | `/ˈkæɲu/` | assimilation | 2 (Intermediate (app L2)) | ～できますか |  |  |
| cs157 | when you | `/ˈwɛɲu/` | assimilation | 2 (Intermediate (app L2)) | あなたが～するとき |  |  |
| cs158 | hot potato | `/ˈhɑpːəˈteɪɾoʊ/` | assimilation | 2 (Intermediate (app L2)) | 厄介な問題 |  |  |
| cs159 | sweet girl | `/ˈswiɡˈɡɝl/` | assimilation | 2 (Intermediate (app L2)) | かわいい子 |  |  |
| cs160 | kept going | `/ˈkɛpˈɡoʊɪŋ/` | elision | 2 (Intermediate (app L2)) | 続けた |  |  |
| cs161 | looked back | `/ˈlʊkˈbæk/` | elision | 2 (Intermediate (app L2)) | 振り返った |  |  |
| cs162 | round table | `/ˈraʊnˈteɪbəl/` | elision | 2 (Intermediate (app L2)) | 円卓 |  |  |
| cs163 | find them | `/ˈfaɪnðəm/` | elision | 2 (Intermediate (app L2)) | 彼らを見つける |  |  |
| cs164 | as a matter of fact | `/əzəˈmæɾɝəˈfækt/` | linking | 3 (Advanced (app L3)) | 実のところ |  |  |
| cs165 | a friend of mine | `/əˈfrɛndəˈvmaɪn/` | linking | 3 (Advanced (app L3)) | 私の友人 |  |  |
| cs166 | in and out | `/ˈɪnəˈnaʊt/` | linking | 3 (Advanced (app L3)) | 出たり入ったり |  |  |
| cs167 | little by little | `/ˈlɪɾəlbaɪˈlɪɾəl/` | linking | 3 (Advanced (app L3)) | 少しずつ |  |  |
| cs168 | not yet | `/ˈnɑˈtʃɛt/` | assimilation | 3 (Advanced (app L3)) | まだだ |  |  |
| cs169 | last year | `/ˈlæsˈtʃɪr/` | assimilation | 3 (Advanced (app L3)) | 去年 |  |  |
| cs170 | would you believe | `/ˈwʊdʒubɪˈliv/` | assimilation | 3 (Advanced (app L3)) | 信じられる？ |  |  |
| cs171 | did you know | `/ˈdɪdʒuˈnoʊ/` | assimilation | 3 (Advanced (app L3)) | 知ってた？ |  |  |
| cs172 | the best of both | `/ðəˈbɛsəvˈboʊθ/` | elision | 3 (Advanced (app L3)) | 両方のいいとこ取り |  |  |
| cs173 | a matter of time | `/əˈmæɾɝəˈtaɪm/` | elision | 3 (Advanced (app L3)) | 時間の問題 |  |  |
| cs174 | plenty of room | `/ˈplɛnɾiəˈrum/` | elision | 3 (Advanced (app L3)) | 十分な余地 |  |  |
| cs175 | the rest of them | `/ðəˈrɛstəvðəm/` | elision | 3 (Advanced (app L3)) | 残りの彼ら |  |  |
| cs176 | first and foremost | `/ˈfɝstənˈfɔrmoʊst/` | elision | 3 (Advanced (app L3)) | 何よりもまず |  |  |
| cs177 | hands and knees | `/ˈhænzənˈniz/` | elision | 3 (Advanced (app L3)) | 四つん這い |  |  |
| cs178 | at all | `/əˈtɔl/` | linking | 1 (Beginner (app L1)) | 全く |  |  |
| cs179 | big apple | `/ˈbɪɡˈæpəl/` | linking | 1 (Beginner (app L1)) | 大きなリンゴ |  |  |
| cs180 | warm up | `/ˈwɔrˈmʌp/` | linking | 1 (Beginner (app L1)) | 準備運動する |  |  |
| cs181 | hard times | `/ˈhɑrˈtaɪmz/` | elision | 1 (Beginner (app L1)) | 苦しい時 |  |  |
| cs182 | blind spot | `/ˈblaɪnˈspɑt/` | elision | 1 (Beginner (app L1)) | 死角 |  |  |
| cs183 | end of story | `/ˈɛndəvˈstɔri/` | linking | 2 (Intermediate (app L2)) | それで終わり |  |  |
| cs184 | one another | `/ˈwʌnəˈnʌðɝ/` | linking | 2 (Intermediate (app L2)) | お互いに |  |  |
| cs185 | set you up | `/ˈsɛtʃuˈwʌp/` | assimilation | 2 (Intermediate (app L2)) | 用意してあげる |  |  |
| cs186 | between you and me | `/bɪˈtwiɲuənˈmi/` | assimilation | 2 (Intermediate (app L2)) | ここだけの話 |  |  |
| cs187 | won't be long | `/ˈwoʊnbiˈlɔŋ/` | elision | 2 (Intermediate (app L2)) | すぐ戻る |  |  |
| cs188 | most of all | `/ˈmoʊstəˈvɔl/` | elision | 2 (Intermediate (app L2)) | とりわけ |  |  |
| cs189 | what's up with you | `/ˈwʌtsˈʌpwɪˈtʃu/` | assimilation | 3 (Advanced (app L3)) | どうしたの？ |  |  |
| cs190 | I'll let you know | `/ˈaɪlˈlɛtʃuˈnoʊ/` | assimilation | 3 (Advanced (app L3)) | 知らせるね |  |  |
| cs191 | see you around | `/ˈsijuˈwəˈraʊnd/` | linking | 3 (Advanced (app L3)) | またね |  |  |
| cs192 | for the time being | `/fɝðəˈtaɪmˈbiɪŋ/` | linking | 3 (Advanced (app L3)) | 当面の間 |  |  |
| cs193 | a number of things | `/əˈnʌmbɝəˈθɪŋz/` | elision | 3 (Advanced (app L3)) | いくつかのこと |  |  |
| cs194 | at the end of the day | `/ətðiˈɛndəvðəˈdeɪ/` | elision | 3 (Advanced (app L3)) | 結局のところ |  |  |
| cs195 | none of your business | `/ˈnʌnəˈvjɔrˈbɪznəs/` | elision | 3 (Advanced (app L3)) | 余計なお世話だ |  |  |
| cs196 | speak of the devil | `/ˈspikəvðəˈdɛvəl/` | elision | 3 (Advanced (app L3)) | 噂をすれば |  |  |
| cs197 | the other side | `/ðiˈʌðɝˈsaɪd/` | elision | 3 (Advanced (app L3)) | 反対側 |  |  |
| cs198 | more or less | `/ˈmɔrɝˈlɛs/` | elision | 3 (Advanced (app L3)) | 多かれ少なかれ |  |  |
| cs199 | get rid of it | `/ˌɡɛˈrɪɾəvɪt/` | elision | 3 (Advanced (app L3)) | 処分する |  |  |
| cs200 | thank you | `/ˈθæŋkju/` | assimilation | 1 (Beginner (app L1)) | ありがとう |  |  |
| cs201 | see you later | `/ˈsijuˈleɪɾɝ/` | linking | 2 (Intermediate (app L2)) | またあとで |  |  |

## 弱形一覧（weak forms）

件数: 36（level 分布: {1: 10, 2: 14, 3: 12}）

| id | word | weak IPA (GA) | strong IPA | app level | 提案CEFR | 根拠 |
|----|------|---------------|------------|-----------|----------|------|
| wf001 | a | `/ə/` | `/ə/` | 1 (Beginner (app L1)) |  |  |
| wf002 | an | `/ən/` | `/æn/` | 1 (Beginner (app L1)) |  |  |
| wf003 | the | `/ðə/` | `/ðə/` | 1 (Beginner (app L1)) |  |  |
| wf004 | to | `/tə/` | `/tu/` | 1 (Beginner (app L1)) |  |  |
| wf005 | of | `/əv/` | `/ʌv/` | 1 (Beginner (app L1)) |  |  |
| wf006 | and | `/ən/` | `/ænd/` | 1 (Beginner (app L1)) |  |  |
| wf007 | for | `/fɚ/` | `/fɔr/` | 1 (Beginner (app L1)) |  |  |
| wf008 | at | `/ət/` | `/æt/` | 1 (Beginner (app L1)) |  |  |
| wf009 | but | `/bət/` | `/bʌt/` | 1 (Beginner (app L1)) |  |  |
| wf010 | you | `/jə/` | `/ju/` | 1 (Beginner (app L1)) |  |  |
| wf011 | can | `/kən/` | `/kæn/` | 2 (Intermediate (app L2)) |  |  |
| wf012 | are | `/ɚ/` | `/ɑr/` | 2 (Intermediate (app L2)) |  |  |
| wf013 | was | `/wəz/` | `/wɑz/` | 2 (Intermediate (app L2)) |  |  |
| wf014 | were | `/wɚ/` | `/wɝ/` | 2 (Intermediate (app L2)) |  |  |
| wf015 | have | `/həv/` | `/hæv/` | 2 (Intermediate (app L2)) |  |  |
| wf016 | has | `/həz/` | `/hæz/` | 2 (Intermediate (app L2)) |  |  |
| wf017 | had | `/həd/` | `/hæd/` | 2 (Intermediate (app L2)) |  |  |
| wf018 | your | `/jɚ/` | `/jɔr/` | 2 (Intermediate (app L2)) |  |  |
| wf019 | them | `/ðəm/` | `/ðɛm/` | 2 (Intermediate (app L2)) |  |  |
| wf020 | us | `/əs/` | `/ʌs/` | 2 (Intermediate (app L2)) |  |  |
| wf021 | from | `/frəm/` | `/frʌm/` | 2 (Intermediate (app L2)) |  |  |
| wf022 | as | `/əz/` | `/æz/` | 2 (Intermediate (app L2)) |  |  |
| wf023 | than | `/ðən/` | `/ðæn/` | 2 (Intermediate (app L2)) |  |  |
| wf024 | some | `/səm/` | `/sʌm/` | 2 (Intermediate (app L2)) |  |  |
| wf025 | could | `/kəd/` | `/kʊd/` | 3 (Advanced (app L3)) |  |  |
| wf026 | would | `/wəd/` | `/wʊd/` | 3 (Advanced (app L3)) |  |  |
| wf027 | should | `/ʃəd/` | `/ʃʊd/` | 3 (Advanced (app L3)) |  |  |
| wf028 | must | `/məst/` | `/mʌst/` | 3 (Advanced (app L3)) |  |  |
| wf029 | do | `/də/` | `/du/` | 3 (Advanced (app L3)) |  |  |
| wf030 | does | `/dəz/` | `/dʌz/` | 3 (Advanced (app L3)) |  |  |
| wf031 | am | `/əm/` | `/æm/` | 3 (Advanced (app L3)) |  |  |
| wf032 | he | `/i/` | `/hi/` | 3 (Advanced (app L3)) |  |  |
| wf033 | him | `/ɪm/` | `/hɪm/` | 3 (Advanced (app L3)) |  |  |
| wf034 | her | `/ɚ/` | `/hɝ/` | 3 (Advanced (app L3)) |  |  |
| wf035 | his | `/ɪz/` | `/hɪz/` | 3 (Advanced (app L3)) |  |  |
| wf036 | there | `/ðɚ/` | `/ðɛr/` | 3 (Advanced (app L3)) |  |  |

## マージ後の想定フィールド

確定後、各 JSON エントリに `"cefr": "A1"` のような文字列を追加し、出題カードの CEFR バッジが単語と同様に表示されるようにする。
