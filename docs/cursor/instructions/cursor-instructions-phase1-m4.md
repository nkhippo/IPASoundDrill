---
id: pj-2026-07-09-0856
aliases:
- pj-2026-07-09-0856
title: Cursor 指示書 — Phase 1 M4バッチ（400語）のマージ
created: '2026-07-09'
---

# Cursor 指示書 — Phase 1 M4バッチ（400語）のマージ

> 作成日: 2026-07-09
> ゴール: B1 拡充の第4バッチ 400 語（`marked` 〜 `restore`）を、IPA・pos・def・gloss(5言語)すべて完成した状態でマージする

---

## 0. 品質検証済み事項（着手前の確認）

- 既存4,039語（オリジナル3,059語 + M1-M3の980語）との重複: **0件**
- IPA/RP IPA形式異常: **0件**
- **GA表記へのRP用長母音記号(`ː`)混入: 0件**（M3で発生した `friendliness` 型のミスを今回は生成後に自動チェック済み）
- 品詞ラベルの逸脱: なし
- 4言語すべて完成: 400/400語
- 英式/米式ペア（8組: `memorise/memorize`, `neighborhood/neighbourhood` 等）の整合性: 確認済み
- 辞書自動カバー率: 86.0%（344語）、残り56語は語根参照による手動合成

---

## 1. スコープと非スコープ

### スコープ

1. `phase1_m4_400_with_gloss.json`（400エントリ）を `wordlist_GA_a1a2_plus_phonics.json` にマージ
2. `_generation_source` フィールドをマージ後に削除
3. 既存 `generate_flap_ipa.py` / `generate_respelling.py` を実行し narrow IPA・respelling を生成
4. `neighbors` は空配列のまま維持

### 非スコープ

- `index.html` の変更
- `neighbors` 計算（項目#6）
- 残り 389 語（789 - 400 = 389。M5で完了見込み）

---

## 2. 手順

### 2-1. マージスクリプト

```python
import json

m4 = json.load(open('phase1_m4_400_with_gloss.json'))
main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))

existing_words = {w['w'].lower() for w in main}
new_entries = []
skipped = []
for entry in m4:
    if entry['w'].lower() in existing_words:
        skipped.append(entry['w'])
        continue
    entry = dict(entry)
    entry.pop('_generation_source', None)
    new_entries.append(entry)

print(f'新規追加: {len(new_entries)}語')
print(f'スキップ(既存と重複): {len(skipped)}語 {skipped}')

main.extend(new_entries)
json.dump(main, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
           ensure_ascii=False, indent=2)
print(f'マージ後総語数: {len(main)}')
```

期待される出力: `新規追加: 400語`、`スキップ: 0語`、マージ後総語数 **4,439**（現在4,039 + 400）。

### 2-2. narrow IPA・respelling 生成

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
```

`merge_respelling.py` は恒久修正済みなので、既存語への影響確認は簡易でよいですが、念のため:

```bash
git diff --stat wordlist_GA_a1a2_plus_phonics.json
```

で変更が新規400語分（+関連するnarrow ipa/respellingフィールド追加）に限定されていることを確認してください。

### 2-3. 検証

```python
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
print('総語数:', len(d))  # 期待値: 4439

from collections import Counter
print('CEFR分布:', dict(Counter(w.get('cefr') for w in d)))
# 期待値: B1 が 1327+400=1727 になっているはず

by_w = {e['w']: e for e in d}
for w in ['marked', 'rainforest', 'restore']:
    e = by_w[w]
    print(w, '->', {k: e.get(k) for k in ('ipa','rp_ipa','cefr','pos','gloss','respell_ga','ipa_actual_ga')})

# 既存語(M1/M2/M3由来含む)への影響がないことのサンプル確認
for w in ['abandon', 'biography', 'entertain']:
    e = by_w.get(w)
    if e:
        print(w, '(既存確認)', '->', {k: e.get(k) for k in ('gloss','respell_ga')})
```

`B1: 1727` を確認してください。

---

## 3. 実装レポートの記載事項

1. マージ結果（新規追加400語、重複ゼロ確認）
2. narrow IPA / respelling 生成結果（例外扱いになった語数）
3. 既存語への影響確認
4. 検証結果（B1=1727確認、サンプル語の生成内容）
5. `docs/PURPOSE.md` への軽微な追記
6. 既知の残作業・懸念事項

---

## 4. Git コミット推奨単位

```
Commit 1: Phase 1 M4: add 400 new B1 vocabulary words with full gloss (5 languages)
  - wordlist_GA_a1a2_plus_phonics.json (+400 entries, gloss complete)
  - phase1_m4_400_with_gloss.json (source data, keep for record)

Commit 2: Generate narrow IPA and respelling for Phase 1 M4 words
  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)

Commit 3: Document Phase 1 M4 completion
  - docs/PURPOSE.md
```

---

## 5. 次のマイルストーン

Phase 1 M5（残り 389 語）で CEFR-J B1 完全版（2,332語）への到達が完了する見込みです。同じ形式でご依頼ください。
