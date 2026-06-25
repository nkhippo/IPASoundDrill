#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_casual_connected.py  (STEP4-e)
(1) casual_patch.json       : カジュアル表現15語（単一語扱い、src=casual）
(2) connected_patch.json    : 連結句15句（新カテゴリ、src=connected_speech）
IPA は手動確定（CMU の誤り outta=/utə/ 等を修正）。gloss は4言語キュレーション。
"""
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# ============================================================
# (1) カジュアル表現 — 単一語扱い（短縮形と同性質）
#     IPA は手動確定（GA, citation的な口語形）
#     gloss 方針A: 展開形 + 口語マーカー
# ============================================================
CASUAL_SUFFIX = {'ja':'の口語形','zh':'的口语形式','ko':'의 구어체'}

# (w, ipa, expansion_en, expansion_native{ja,zh,ko})
CASUAL = [
 ("wanna","/ˈwɑnə/","want to",{"ja":"〜したい","zh":"想要","ko":"~하고 싶다"}),
 ("gonna","/ˈɡɑnə/","going to",{"ja":"〜するつもり","zh":"将要","ko":"~할 것이다"}),
 ("gotta","/ˈɡɑtə/","got to / have got to",{"ja":"〜しなければ","zh":"必须","ko":"~해야 한다"}),
 ("kinda","/ˈkaɪndə/","kind of",{"ja":"なんとなく、ちょっと","zh":"有点","ko":"약간, 어느 정도"}),
 ("sorta","/ˈsɔrtə/","sort of",{"ja":"いくぶん、まあまあ","zh":"有点、稍微","ko":"다소, 어느 정도"}),
 ("lemme","/ˈlɛmi/","let me",{"ja":"〜させて","zh":"让我","ko":"내가 ~하게 해줘"}),
 ("gimme","/ˈɡɪmi/","give me",{"ja":"ちょうだい、くれ","zh":"给我","ko":"나에게 줘"}),
 ("dunno","/dəˈnoʊ/","don't know",{"ja":"知らない、わからない","zh":"不知道","ko":"몰라"}),
 ("gotcha","/ˈɡɑtʃə/","got you / I understand",{"ja":"わかった、捕まえた","zh":"懂了、抓到你了","ko":"알았어, 잡았다"}),
 ("outta","/ˈaʊtə/","out of",{"ja":"〜から外へ","zh":"从…出来","ko":"~밖으로"}),
 ("lotta","/ˈlɑtə/","lot of / lots of",{"ja":"たくさんの","zh":"很多","ko":"많은"}),
 ("hafta","/ˈhæftə/","have to",{"ja":"〜しなければならない","zh":"必须","ko":"~해야 한다"}),
 ("oughta","/ˈɔtə/","ought to",{"ja":"〜すべき","zh":"应该","ko":"~해야 한다"}),
 ("cuz","/kʌz/","because",{"ja":"〜だから","zh":"因为","ko":"왜냐하면"}),
 ("tryna","/ˈtraɪnə/","trying to",{"ja":"〜しようとして","zh":"试图、正想","ko":"~하려고 하는"}),
]

casual_out=[]
for w,ipa,exp_en,exp in CASUAL:
    casual_out.append({
        'w':w,'ipa':ipa,'cefr':'A2','pos':'口語表現',
        'src':'casual','pattern':None,'group':None,
        'gloss':{
            'en':exp_en,
            'ja':f"{exp['ja']}（{exp_en.split(' / ')[0]}{CASUAL_SUFFIX['ja']}）",
            'zh':f"{exp['zh']}（{exp_en.split(' / ')[0]}{CASUAL_SUFFIX['zh']}）",
            'ko':f"{exp['ko']} ({exp_en.split(' / ')[0]}{CASUAL_SUFFIX['ko']})",
        }
    })

json.dump(casual_out, open(ROOT / 'data' / 'casual_patch.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)

# ============================================================
# (2) 連結句 — 新カテゴリ connected_speech
#     phrase / ipa(連結後) / type / rule / spelled(正書法) / gloss
#     pos/cefr/pattern/group は句なので持たせない（または null）
# ============================================================
# type: linking(連結) / assimilation(同化) / elision(脱落)
# (phrase, ipa, type, rule{ja,en}, gloss{en,ja,zh,ko})
CONNECTED = [
 # ── linking: 子音 + 母音 が繋がる ──
 ("check it","/ˈtʃɛkɪt/","linking",
   {"en":"k + i link","ja":"語末 k と語頭 i が連結"},
   {"en":"check it","ja":"確認して","zh":"检查一下","ko":"확인해 봐"}),
 ("look at","/ˈlʊkæt/","linking",
   {"en":"k + æ link","ja":"語末 k と語頭 æ が連結"},
   {"en":"look at","ja":"〜を見て","zh":"看","ko":"~을 봐"}),
 ("come on","/ˈkʌmɑn/","linking",
   {"en":"m + ɑ link","ja":"語末 m と語頭 ɑ が連結"},
   {"en":"come on","ja":"さあ、おいで","zh":"来吧、加油","ko":"어서, 자"}),
 ("turn it","/ˈtɝnɪt/","linking",
   {"en":"n + i link","ja":"語末 n と語頭 i が連結"},
   {"en":"turn it","ja":"それを回して","zh":"转动它","ko":"그것을 돌려"}),
 ("pick up","/ˈpɪkʌp/","linking",
   {"en":"k + ʌ link","ja":"語末 k と語頭 ʌ が連結"},
   {"en":"pick up","ja":"拾う、迎えに行く","zh":"捡起、接","ko":"줍다, 데리러 가다"}),
 ("an apple","/əˈnæpəl/","linking",
   {"en":"n + æ link","ja":"語末 n と語頭 æ が連結"},
   {"en":"an apple","ja":"りんご一つ","zh":"一个苹果","ko":"사과 한 개"}),
 # ── assimilation: 隣接音が別の音に変化 ──
 ("could you","/ˈkʊdʒu/","assimilation",
   {"en":"d + j → dʒ","ja":"d + j が dʒ に同化"},
   {"en":"could you","ja":"〜してくれますか","zh":"你能…吗","ko":"~해 주시겠어요"}),
 ("would you","/ˈwʊdʒu/","assimilation",
   {"en":"d + j → dʒ","ja":"d + j が dʒ に同化"},
   {"en":"would you","ja":"〜してくれますか","zh":"你愿意…吗","ko":"~하시겠어요"}),
 ("did you","/ˈdɪdʒu/","assimilation",
   {"en":"d + j → dʒ","ja":"d + j が dʒ に同化"},
   {"en":"did you","ja":"〜しましたか","zh":"你…了吗","ko":"~했나요"}),
 ("meet you","/ˈmitʃu/","assimilation",
   {"en":"t + j → tʃ","ja":"t + j が tʃ に同化"},
   {"en":"meet you","ja":"あなたに会う","zh":"见到你","ko":"당신을 만나다"}),
 ("miss you","/ˈmɪʃu/","assimilation",
   {"en":"s + j → ʃ","ja":"s + j が ʃ に同化"},
   {"en":"miss you","ja":"あなたが恋しい","zh":"想念你","ko":"당신이 그리워요"}),
 # ── elision: 音が脱落 ──
 ("and you","/ən ju/","elision",
   {"en":"d dropped","ja":"語末 d が脱落"},
   {"en":"and you","ja":"そしてあなた","zh":"还有你","ko":"그리고 당신"}),
 ("next day","/ˈnɛks deɪ/","elision",
   {"en":"t dropped","ja":"語末 t が脱落"},
   {"en":"next day","ja":"翌日","zh":"第二天","ko":"다음 날"}),
 ("must be","/ˈmʌs bi/","elision",
   {"en":"t dropped","ja":"語末 t が脱落"},
   {"en":"must be","ja":"〜に違いない","zh":"一定是","ko":"~임에 틀림없다"}),
 ("old man","/ˈoʊl mæn/","elision",
   {"en":"d dropped","ja":"語末 d が脱落"},
   {"en":"old man","ja":"年配の男性","zh":"老人","ko":"노인"}),
]

TYPE_LABEL={
 'linking':{'en':'Linking','ja':'連結','zh':'连读','ko':'연음'},
 'assimilation':{'en':'Assimilation','ja':'同化','zh':'同化','ko':'동화'},
 'elision':{'en':'Elision','ja':'脱落','zh':'脱落','ko':'탈락'},
}

connected_out=[]
for phrase,ipa,typ,rule,gloss in CONNECTED:
    connected_out.append({
        'w':phrase,               # 見出しは句（スペース込み）
        'ipa':ipa,                # 連結後のGA IPA
        'cefr':None,'pos':None,'src':'connected_speech',
        'pattern':None,'group':None,
        'cs_type':typ,            # linking / assimilation / elision
        'cs_rule':rule,           # 型の説明（en/ja）
        'gloss':gloss,
    })

json.dump(connected_out, open(ROOT / 'data' / 'connected_speech.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)

# ── レポート ──
print(f'(1) casual_patch.json: {len(casual_out)}語')
for e in casual_out[:5]:
    print(f"    {e['w']:8s} {e['ipa']:12s} {e['gloss']['ja']}")
print(f'... 他{len(casual_out)-5}語')
print()
print(f'(2) connected_patch.json: {len(connected_out)}句')
from collections import Counter
tc=Counter(e['cs_type'] for e in connected_out)
print('    型別:', dict(tc))
for e in connected_out:
    print(f"    [{TYPE_LABEL[e['cs_type']]['ja']}] {e['w']:11s} {e['ipa']:13s} {e['cs_rule']['ja']}")
