#!/usr/bin/env python3

import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths
# -*- coding: utf-8 -*-
"""
gen_thin_phoneme_words.py  (STEP4-d)
カバレッジの薄い音素（ʒ ɔɪ ð ʊ）を含む日常頻出語40語を追加する。
- IPA: CMU 由来 (GA, citation form)
- gloss: 4言語キュレーション（多義語は STEP3 形式: ja/zh「、」, ko「, 」区切り）
出力: thin_phoneme_patch.json
"""
import json, re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]

# ── ARPAbet → IPA (既存パイプラインと同一) ──
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

cmu={}
for line in open('cmudict.dict',encoding='utf-8'):
    line=line.strip()
    if not line or line.startswith(';;;'):continue
    if '#' in line:line=line.split('#')[0].strip()
    p=line.split();w=p[0]
    if '(' in w:continue
    cmu.setdefault(w,p[1:])

# ── キュレーション済みデータ: (w, cefr, pos, gloss{en,ja,zh,ko}) ──
# 多義語は STEP3 形式（ja/zh「、」, ko「, 」）
WORDS = [
 # ── ʒ ──
 ("version","A2","名詞",{"en":"version","ja":"版、バージョン","zh":"版本、版","ko":"버전, 판"}),
 ("decision","A2","名詞",{"en":"decision","ja":"決定、決断","zh":"决定、决策","ko":"결정, 결단"}),
 ("division","B1","名詞",{"en":"division","ja":"分割、部門、割り算","zh":"分割、部门、除法","ko":"분할, 부서, 나눗셈"}),
 ("vision","B1","名詞",{"en":"vision","ja":"視力、展望、幻","zh":"视力、远见、幻象","ko":"시력, 비전, 환상"}),
 ("visual","B1","形容詞",{"en":"visual","ja":"視覚の、目に見える","zh":"视觉的、可见的","ko":"시각의, 눈에 보이는"}),
 ("measure","A2","動詞 / 名詞",{"en":"measure","ja":"測る、対策、寸法","zh":"测量、措施、尺寸","ko":"측정하다, 대책, 치수"}),
 ("casual","B1","形容詞",{"en":"casual","ja":"何気ない、カジュアルな","zh":"随意的、休闲的","ko":"평상시의, 캐주얼한"}),
 ("occasion","A2","名詞",{"en":"occasion","ja":"機会、場合、行事","zh":"场合、机会、活动","ko":"경우, 기회, 행사"}),
 ("exposure","B1","名詞",{"en":"exposure","ja":"露出、さらすこと","zh":"暴露、曝光","ko":"노출, 드러냄"}),
 ("luxury","B1","名詞",{"en":"luxury","ja":"贅沢、高級品","zh":"奢侈、奢侈品","ko":"사치, 고급품"}),
 ("massage","B1","名詞 / 動詞",{"en":"massage","ja":"マッサージ、揉む","zh":"按摩、揉","ko":"마사지, 주무르다"}),
 ("revision","B1","名詞",{"en":"revision","ja":"改訂、見直し、復習","zh":"修订、复习","ko":"개정, 수정, 복습"}),
 ("conclusion","B1","名詞",{"en":"conclusion","ja":"結論、終わり","zh":"结论、结束","ko":"결론, 마무리"}),
 ("collision","B1","名詞",{"en":"collision","ja":"衝突","zh":"碰撞、冲突","ko":"충돌"}),
 # ── ɔɪ ──
 ("employee","A2","名詞",{"en":"employee","ja":"従業員、社員","zh":"员工、雇员","ko":"직원, 종업원"}),
 ("employer","A2","名詞",{"en":"employer","ja":"雇用主、雇い主","zh":"雇主","ko":"고용주"}),
 ("employ","B1","動詞",{"en":"employ","ja":"雇う、用いる","zh":"雇用、使用","ko":"고용하다, 사용하다"}),
 ("voyage","B1","名詞",{"en":"voyage","ja":"航海、旅","zh":"航行、旅程","ko":"항해, 여행"}),
 ("loyal","B1","形容詞",{"en":"loyal","ja":"忠実な、誠実な","zh":"忠诚的","ko":"충실한, 충성스러운"}),
 ("oyster","B1","名詞",{"en":"oyster","ja":"牡蠣","zh":"牡蛎、生蚝","ko":"굴"}),
 ("poison","A2","名詞 / 動詞",{"en":"poison","ja":"毒、毒を盛る","zh":"毒、毒药","ko":"독, 독을 넣다"}),
 ("appoint","B1","動詞",{"en":"appoint","ja":"任命する、指定する","zh":"任命、指定","ko":"임명하다, 지정하다"}),
 ("moist","B1","形容詞",{"en":"moist","ja":"湿った、しっとりした","zh":"潮湿的、湿润的","ko":"촉촉한, 축축한"}),
 ("coil","B1","名詞 / 動詞",{"en":"coil","ja":"コイル、巻く","zh":"线圈、卷","ko":"코일, 감다"}),
 # ── ð ──
 ("whether","A2","接続詞",{"en":"whether","ja":"〜かどうか","zh":"是否","ko":"~인지 아닌지"}),
 ("northern","A2","形容詞",{"en":"northern","ja":"北の、北部の","zh":"北方的、北部的","ko":"북쪽의, 북부의"}),
 ("southern","A2","形容詞",{"en":"southern","ja":"南の、南部の","zh":"南方的、南部的","ko":"남쪽의, 남부의"}),
 ("neither","A2","副詞 / 限定詞",{"en":"neither","ja":"どちらも〜ない","zh":"两者都不","ko":"어느 쪽도 ~아니다"}),
 ("otherwise","B1","副詞",{"en":"otherwise","ja":"さもなければ、その他の点で","zh":"否则、另外","ko":"그렇지 않으면, 그 외에는"}),
 ("clothe","B1","動詞",{"en":"clothe","ja":"服を着せる","zh":"给…穿衣","ko":"옷을 입히다"}),
 ("farther","B1","副詞",{"en":"farther","ja":"より遠くに","zh":"更远","ko":"더 멀리"}),
 # ── ʊ ──
 ("secure","B1","形容詞 / 動詞",{"en":"secure","ja":"安全な、確保する","zh":"安全的、确保","ko":"안전한, 확보하다"}),
 ("ensure","B1","動詞",{"en":"ensure","ja":"確実にする、保証する","zh":"确保、保证","ko":"보장하다, 확실히 하다"}),
 ("tourism","A2","名詞",{"en":"tourism","ja":"観光、観光業","zh":"旅游、旅游业","ko":"관광, 관광업"}),
 ("rural","B1","形容詞",{"en":"rural","ja":"田舎の、農村の","zh":"乡村的、农村的","ko":"시골의, 농촌의"}),
 ("butcher","B1","名詞",{"en":"butcher","ja":"肉屋","zh":"肉店、屠夫","ko":"정육점, 푸주한"}),
 ("cushion","A2","名詞",{"en":"cushion","ja":"クッション、座布団","zh":"垫子、靠垫","ko":"쿠션, 방석"}),
 ("bullet","A2","名詞",{"en":"bullet","ja":"弾丸","zh":"子弹","ko":"총알"}),
 ("pudding","A2","名詞",{"en":"pudding","ja":"プリン、プディング","zh":"布丁","ko":"푸딩"}),
 ("jury","B1","名詞",{"en":"jury","ja":"陪審、審査員","zh":"陪审团、评审团","ko":"배심원, 심사위원"}),
]

out=[]
for w,cefr,pos,gloss in WORDS:
    if w not in cmu:
        print('WARN CMU欠落',w); continue
    ipa=to_ipa(cmu[w])
    out.append({'w':w,'ipa':ipa,'cefr':cefr,'pos':pos,
                'src':'phoneme_fill','pattern':None,'group':None,'gloss':gloss})

json.dump(out, open(paths.THIN_PHONEME_PATCH,'w',encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'生成: {len(out)}語')
print()
# 音素別確認
MULTI=['tʃ','dʒ','eɪ','aɪ','ɔɪ','oʊ','aʊ']
def tok(s):
    s=s.replace('/','').replace('ˈ','').replace('ˌ','')
    o=[];i=0
    while i<len(s):
        m=None
        for x in MULTI:
            if s.startswith(x,i):m=x;break
        if m:o.append(m);i+=len(m)
        else:o.append(s[i]);i+=1
    return o
from collections import defaultdict
byph=defaultdict(list)
for e in out:
    for ph in ['ʒ','ɔɪ','ð','ʊ']:
        if ph in tok(e['ipa']): byph[ph].append(e['w'])
for ph in ['ʒ','ɔɪ','ð','ʊ']:
    print(f"  {ph}: +{len(byph[ph])}語 {byph[ph]}")
print()
print('=== IPAサンプル ===')
for e in out[:8]:
    print(f"  {e['w']:12s} {e['ipa']:16s} {e['gloss']['ja']}")
