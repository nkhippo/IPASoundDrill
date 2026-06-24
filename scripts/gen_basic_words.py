#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_basic_words.py
STEP4 先頭タスク: 欠落している基礎語を生成する。
  (1) アルファベット文字 26個 (letter name)
  (2) TOEICリスニング頻出レベルの短縮形 48個
出力: basic_words_patch.json  (本番 wordlist にマージ用、gloss 4言語付き)
"""
import re, json

# ── ARPAbet → IPA (GA, learner) 既存変換器を踏襲 ──────────────
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

# ── load CMU ──────────────────────────────────────────────
cmu={}
for line in open('cmudict.dict',encoding='utf-8'):
    line=line.strip()
    if not line or line.startswith(';;;'):continue
    if '#' in line:line=line.split('#')[0].strip()
    p=line.split();w=p[0]
    if '(' in w:continue
    cmu.setdefault(w,p[1:])

out=[]

# ============================================================
# (1) アルファベット文字 (letter name)
#     headword は大文字。冠詞 a /ə/ ・代名詞 i との衝突回避。
# ============================================================
LETTERS={
 'A':'eɪ','B':'bi','C':'si','D':'di','E':'i','F':'ɛf','G':'dʒi','H':'eɪtʃ',
 'I':'aɪ','J':'dʒeɪ','K':'keɪ','L':'ɛl','M':'ɛm','N':'ɛn','O':'oʊ','P':'pi',
 'Q':'kju','R':'ɑr','S':'ɛs','T':'ti','U':'ju','V':'vi','W':'ˈdʌbəlju',
 'X':'ɛks','Y':'waɪ','Z':'zi'}
for L,ipa in LETTERS.items():
    out.append({
        'w':L,'ipa':'/'+ipa+'/','cefr':'A1','pos':'文字',
        'src':'letter','grp':None,'pat':None,
        'gloss':{
            'en':f'letter {L}',
            'ja':f'文字 {L}',
            'zh':f'字母 {L}',
            'ko':f'문자 {L}',
        }
    })

# ============================================================
# (2) 短縮形 (contractions) — TOEIC リスニング頻出レベル
#     IPA は CMU から（citation/強形）。gloss は展開形。
# ============================================================
# expansion: 各短縮形の元の形（gloss の核）
EXPAND={
 "i'm":"I am","you're":"you are","he's":"he is","she's":"she is","it's":"it is",
 "we're":"we are","they're":"they are","that's":"that is","there's":"there is",
 "here's":"here is","what's":"what is","who's":"who is","let's":"let us",
 "i'll":"I will","you'll":"you will","he'll":"he will","she'll":"she will",
 "we'll":"we will","they'll":"they will",
 "i'd":"I would / I had","you'd":"you would / you had","he'd":"he would / he had",
 "she'd":"she would / she had","we'd":"we would / we had","they'd":"they would / they had",
 "i've":"I have","you've":"you have","we've":"we have","they've":"they have",
 "should've":"should have","could've":"could have","would've":"would have",
 "don't":"do not","doesn't":"does not","didn't":"did not","isn't":"is not",
 "aren't":"are not","wasn't":"was not","weren't":"were not","can't":"cannot",
 "couldn't":"could not","won't":"will not","wouldn't":"would not",
 "shouldn't":"should not","haven't":"have not","hasn't":"has not",
 "hadn't":"had not","mustn't":"must not",
}
# 短縮形である旨の各言語サフィックス
SUFFIX={'ja':'の短縮形','zh':'的缩写','ko':'의 축약형'}
for c,exp in EXPAND.items():
    if c not in cmu:
        print('WARN: CMU欠落',c);continue
    ipa=to_ipa(cmu[c])
    out.append({
        'w':c,'ipa':ipa,'cefr':'A1','pos':'短縮形',
        'src':'contraction','grp':None,'pat':None,
        'gloss':{
            'en':exp,
            'ja':f'{exp}{SUFFIX["ja"]}',
            'zh':f'{exp}{SUFFIX["zh"]}',
            'ko':f'{exp}{SUFFIX["ko"]}',
        }
    })

json.dump(out,open('basic_words_patch.json','w',encoding='utf-8'),ensure_ascii=False,indent=1)

print(f'生成: {len(out)}語  (文字{len(LETTERS)} + 短縮形{len(EXPAND)})')
print('\n=== アルファベット文字 ===')
for e in out[:26]:
    print(f"  {e['w']}  {e['ipa']:12s}  {e['gloss']['en']}")
print('\n=== 短縮形（一部）===')
for e in out[26:42]:
    print(f"  {e['w']:11s} {e['ipa']:14s} {e['gloss']['en']}")
