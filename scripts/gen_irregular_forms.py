#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_irregular_forms.py  (STEP4-c)
欠落している不規則変化形（動詞の過去/過去分詞・名詞の不規則複数）を追加する。
- IPA: CMU 由来 (GA, citation form)
- gloss: 方針A（原形併記）。原形の既存 gloss を流用して訳の一貫性を担保。
出力: irregular_forms_patch.json
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# ── ARPAbet → IPA (既存パイプラインと同一の変換器) ──
ARPA={'AA':'ɑ','AE':'æ','AO':'ɔ','AW':'aʊ','AY':'aɪ','EH':'ɛ','EY':'eɪ','IH':'ɪ','IY':'i',
 'OW':'oʊ','OY':'ɔɪ','UH':'ʊ','UW':'u','B':'b','CH':'tʃ','D':'d','DH':'ð','F':'f','G':'ɡ',
 'HH':'h','JH':'dʒ','K':'k','L':'l','M':'m','N':'n','NG':'ŋ','P':'p','R':'r','S':'s','SH':'ʃ',
 'T':'t','TH':'θ','V':'v','W':'w','Y':'j','Z':'z','ZH':'ʒ'}
VOWEL_ARPA={'AA','AE','AH','AO','AW','AY','EH','ER','EY','IH','IY','OW','OY','UH','UW'}
VSET={'i','ɪ','ɛ','æ','ə','ʌ','ɑ','ɔ','ʊ','u','ɝ','ɚ','eɪ','aɪ','ɔɪ','oʊ','aʊ'}
ONSETS2={'pl','pr','tr','dr','kl','kr','ɡl','ɡr','bl','br','fl','fr','sl','sp','st','sk','sm','sn','sw','tw','kw','dw','ɡw','θr','ʃr','pj','bj','kj','fj','vj','mj','hj','ɡj','θw'}
ONSETS3={'spl','spr','str','skr','skw','spj','stj','skj'}

def arpa_tokens(seq):
    toks=[];prim=-1;sec=-1
    for a in seq:
        m=re.match(r'^([A-Z]+)([012]?)$',a)
        if not m: return None,-1,-1
        b=m.group(1);st=m.group(2)
        if b=='AH': ip='ʌ' if st in('1','2') else 'ə'
        elif b=='ER': ip='ɝ' if st in('1','2') else 'ɚ'
        else: ip=ARPA.get(b)
        if ip is None: return None,-1,-1
        idx=len(toks);toks.append(ip)
        if b in VOWEL_ARPA:
            if st=='1':prim=idx
            elif st=='2' and sec==-1:sec=idx
    return toks,prim,sec

def onset_insert(tokens,vidx):
    j=vidx-1;cons=[]
    while j>=0 and tokens[j] not in VSET:
        cons.insert(0,tokens[j]);j-=1
    prev=j>=0
    if not cons:return vidx
    if not prev:return vidx-len(cons)
    n=len(cons)
    for L in(3,2,1):
        if L<=n:
            cl=''.join(cons[n-L:])
            if (L==1) or (L==2 and cl in ONSETS2) or (L==3 and cl in ONSETS3):
                return vidx-L
    return vidx-1

def to_ipa(seq):
    toks,prim,sec=arpa_tokens(seq)
    if toks is None:return None
    nvow=sum(1 for t in toks if t in VSET)
    if nvow<2:
        return '/'+''.join(toks)+'/'
    ins=[]
    if prim>=0:ins.append((onset_insert(toks,prim),'ˈ'))
    if sec>=0:ins.append((onset_insert(toks,sec),'ˌ'))
    for idx,mark in sorted(ins,key=lambda x:-x[0]):
        toks.insert(idx,mark)
    return '/'+''.join(toks)+'/'

# ── CMU ──
cmu={}
for line in open('cmudict.dict',encoding='utf-8'):
    line=line.strip()
    if not line or line.startswith(';;;'):continue
    if '#' in line:line=line.split('#')[0].strip()
    p=line.split();w=p[0]
    if '(' in w:continue
    cmu.setdefault(w,p[1:])

# ── 既存 wordlist（原形の gloss 流用元）──
data=json.load(open(ROOT / 'wordlist_GA_a1a2_plus_phonics.json', encoding='utf-8'))
EX={e['w']:e for e in data}

# ── 役割ラベルの各言語表記 ──
ROLE={
 'past':     {'ja':'の過去形','zh':'的过去式','ko':'의 과거형','en':'past tense of'},
 'pp':       {'ja':'の過去分詞','zh':'的过去分词','ko':'의 과거분사','en':'past participle of'},
 'plural':   {'ja':'の複数形','zh':'的复数','ko':'의 복수형','en':'plural of'},
}

def build_gloss(base, role):
    """原形 base の既存 gloss を取り出し、役割注記を付ける。
       en: 'past tense of go'。ja/zh/ko: '原形gloss（go の過去形）' 形式。"""
    bg = EX.get(base,{}).get('gloss',{})
    out={}
    # en は '<role> <base>' 形式（簡潔・機械的に正確）
    out['en']=f"{ROLE[role]['en']} {base}"
    for lang in ('ja','zh','ko'):
        core = bg.get(lang)  # 原形の訳（多義なら複数訳のまま）
        suffix=f"{base}{ROLE[role][lang]}"
        if core:
            # 例: 行く → 行く（go の過去形）/ 但し多義訳が長い場合も原形gloss優先
            if lang=='ja':
                out[lang]=f"{core}（{suffix}）"
            elif lang=='zh':
                out[lang]=f"{core}（{suffix}）"
            else: # ko
                out[lang]=f"{core} ({suffix})"
        else:
            # 原形 gloss 欠落時は役割注記のみ
            out[lang]=suffix
    return out

# ── 対象データ（base, form, role）──
VERB_FORMS=[
 ('eat','ate','past'),('become','became','past'),('begin','began','past'),('begin','begun','pp'),
 ('buy','bought','past'),('buy','bought','pp'),('break','broke','past'),
 ('bring','brought','past'),('bring','brought','pp'),('build','built','past'),('build','built','pp'),
 ('come','came','past'),('catch','caught','past'),('catch','caught','pp'),
 ('choose','chose','past'),('choose','chosen','pp'),('drink','drank','past'),('draw','drawn','pp'),
 ('draw','drew','past'),('drive','driven','pp'),('drive','drove','past'),('drink','drunk','pp'),
 ('eat','eaten','pp'),('fall','fallen','pp'),('fall','fell','past'),('feel','felt','past'),('feel','felt','pp'),
 ('fly','flew','past'),('fly','flown','pp'),('forget','forgot','past'),('forget','forgotten','pp'),
 ('give','gave','past'),('go','gone','pp'),('get','got','past'),('get','gotten','pp'),
 ('grow','grew','past'),('grow','grown','pp'),('hear','heard','past'),('hear','heard','pp'),
 ('hold','held','past'),('hold','held','pp'),('keep','kept','past'),('keep','kept','pp'),
 ('know','knew','past'),('lend','lent','past'),('lend','lent','pp'),('make','made','past'),('make','made','pp'),
 ('mean','meant','past'),('mean','meant','pp'),('meet','met','past'),('meet','met','pp'),
 ('run','ran','past'),('ring','rang','past'),('ride','ridden','pp'),('ride','rode','past'),('ring','rung','pp'),
 ('say','said','past'),('say','said','pp'),('sing','sang','past'),('sit','sat','past'),('sit','sat','pp'),
 ('see','seen','pp'),('send','sent','past'),('send','sent','pp'),('show','showed','past'),('show','shown','pp'),
 ('sleep','slept','past'),('sleep','slept','pp'),('sell','sold','past'),('sell','sold','pp'),
 ('spend','spent','past'),('spend','spent','pp'),('speak','spoke','past'),('speak','spoken','pp'),
 ('stand','stood','past'),('stand','stood','pp'),('sing','sung','pp'),('swim','swam','past'),('swim','swum','pp'),
 ('take','taken','pp'),('teach','taught','past'),('teach','taught','pp'),('throw','threw','past'),('throw','thrown','pp'),
 ('tell','told','past'),('tell','told','pp'),('take','took','past'),
 ('understand','understood','past'),('understand','understood','pp'),('go','went','past'),
 ('wake','woke','past'),('wake','woken','pp'),('win','won','past'),('win','won','pp'),
 ('wear','wore','past'),('write','written','pp'),('write','wrote','past'),
]
PLURALS=[
 ('child','children'),('foot','feet'),('goose','geese'),('half','halves'),('knife','knives'),
 ('leaf','leaves'),('life','lives'),('man','men'),('mouse','mice'),('shelf','shelves'),
 ('tooth','teeth'),('wife','wives'),('wolf','wolves'),('woman','women'),
]

existing={e['w'] for e in data}
out=[]
seen={}  # 同一 form が複数役割を持つ場合 (bought=past&pp) は1エントリにまとめる

def add_entry(form, base, role, pos, src):
    if form in existing: return
    if form not in cmu: 
        print('WARN CMU欠落', form); return
    ipa=to_ipa(cmu[form])
    if form in seen:
        # 既出（例: bought past & pp）→ gloss の役割を統合
        e=seen[form]
        # en に pp/past 両方を併記
        if role=='pp' and 'past tense' in e['gloss']['en']:
            e['gloss']['en']=e['gloss']['en'].replace('past tense of','past tense / past participle of')
            for lang in ('ja','zh','ko'):
                # ja: 「行った（go の過去形）」→「（go の過去形・過去分詞）」
                e['gloss'][lang]=e['gloss'][lang].replace('の過去形','の過去形・過去分詞').replace('的过去式','的过去式/过去分词').replace('의 과거형','의 과거형·과거분사')
        return
    g=build_gloss(base, role)
    entry={'w':form,'ipa':ipa,'cefr':'A1','pos':pos,'src':src,
           'pattern':None,'group':None,'gloss':g,'base':base}
    seen[form]=entry
    out.append(entry)

# 原形が既存 wordlist に無い名詞は、原形も補完する（geese←goose 対策）
# {base: gloss4言語} を手当て
MISSING_BASE_GLOSS={
 'goose':{'en':'goose','ja':'ガチョウ','zh':'鹅','ko':'거위'},
}
for base, g in MISSING_BASE_GLOSS.items():
    if base not in existing and base in cmu:
        out.append({'w':base,'ipa':to_ipa(cmu[base]),'cefr':'A2','pos':'名詞',
                    'src':'cefr','pattern':None,'group':None,'gloss':g,'base':None})
        EX[base]={'gloss':g}  # 後続の build_gloss が原形訳を使えるように登録

for base,form,role in VERB_FORMS:
    add_entry(form, base, role, '動詞（不規則変化）', 'irregular_verb')
for base,form in PLURALS:
    add_entry(form, base, 'plural', '名詞（不規則複数）', 'irregular_plural')

json.dump(out, open(ROOT / 'data' / 'irregular_forms_patch.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)

print(f'生成: {len(out)}語 (動詞変化形 + 不規則複数)')
print()
print('=== サンプル: 動詞変化形 ===')
for e in out[:12]:
    print(f"  {e['w']:11s} {e['ipa']:14s} ja={e['gloss']['ja']}")
print()
print('=== サンプル: 同綴り複数役割 (bought 等) ===')
for e in out:
    if e['w'] in ('bought','said','made','built','held'):
        print(f"  {e['w']:9s} en={e['gloss']['en']} | ja={e['gloss']['ja']}")
print()
print('=== サンプル: 不規則複数 ===')
for e in out:
    if e['src']=='irregular_plural':
        print(f"  {e['w']:11s} {e['ipa']:12s} ja={e['gloss']['ja']}")
