#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
gen_connected_rp.py  (STEP5)
連結句15句に rp_ipa を手動確定で付与する。
連結句は型(linking/assimilation/elision)の正確性が核なので機械変換せず手動確定。

RP変換の要点:
- GA /oʊ/ → RP /əʊ/ (old man, come on は ɑ→ɒ)
- GA /ɑ/ → RP /ɒ/ (come on の ɑ)
- turn it: 連結後 r が母音間に来る → RPでも /r/ 保持(linking-r的) → /ˈtɜːnɪt/ ではなく /ˈtɜː.nɪt/...
           実際は turn /tɜːn/ + it。語末rは綴り上存在し後続が母音なので linking-r で /r/ 出現 → /ˈtɜːrɪt/
           ただし RP broad では /ˈtɜːn ɪt/→連結 /ˈtɜːnɪt/ で n が橋渡し。r は出さないのが標準的 broad。
           → RP: /ˈtɜːnɪt/ (turn の r は元々母音化、n がリンク)
- assimilation (could you→/ˈkʊdʒu/): RPも同じ同化、母音 u は同じ → 変化なし or 軽微
- elision は子音脱落が核 → 母音規則のみ適用
"""
import json

conn = json.load(open('connected_patch.json'))

# 手動確定 RP IPA（連結後・型を保持）
RP = {
 # linking — 母音規則のみ適用、連結は維持
 "check it":  "/ˈtʃekɪt/",     # ɛ→e
 "look at":   "/ˈlʊkæt/",      # 変化なし
 "come on":   "/ˈkʌmɒn/",      # ɑ→ɒ
 "turn it":   "/ˈtɜːnɪt/",     # ɝ→ɜː、n がリンク（r は出さない broad）
 "pick up":   "/ˈpɪkʌp/",      # 変化なし
 "an apple":  "/əˈnæpəl/",     # 変化なし
 # assimilation — RPも同様に同化、母音 u は RP /uː/ 化
 "could you": "/ˈkʊdʒuː/",     # u→uː
 "would you": "/ˈwʊdʒuː/",     # u→uː
 "did you":   "/ˈdɪdʒuː/",     # u→uː
 "meet you":  "/ˈmiːtʃuː/",    # i→iː, u→uː
 "miss you":  "/ˈmɪʃuː/",      # u→uː
 # elision — 子音脱落維持、母音規則のみ
 "and you":   "/ən juː/",      # u→uː
 "next day":  "/ˈneks deɪ/",   # ɛ→e
 "must be":   "/ˈmʌs biː/",    # i→iː
 "old man":   "/ˈəʊl mæn/",    # oʊ→əʊ
}

out = []
for e in conn:
    row = dict(e)
    rp = RP.get(e['w'])
    if not rp:
        print('WARN: RP未定義', e['w'])
    row['rp_ipa'] = rp
    out.append(row)

json.dump(out, open('connected_speech_with_rp.json','w',encoding='utf-8'), ensure_ascii=False, indent=1)

print(f'連結句RP付与: {len(out)}句')
print()
print(f"{'句':12s} {'GA':16s} {'RP':16s} 型")
print('-'*60)
for e in out:
    print(f"  {e['w']:11s} {e['ipa']:15s} {e['rp_ipa']:15s} {e['cs_type']}")
