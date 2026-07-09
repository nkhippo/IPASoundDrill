# Cursor 指示書 — Phase 1 M3バッチ（400語）のマージ

> 作成日: 2026-07-09
> 前提: `docs/cursor-instructions-fix-merge-respelling.md`（`merge_respelling.py` 恒久修正）が完了していることが望ましい
> ゴール: B1 拡充の第3バッチ 400 語（`entertain` 〜 `marine`）を、IPA・pos・def・gloss(5言語)すべて完成した状態でマージする

---

## 0. 着手前の確認事項

**`merge_respelling.py` の修正状況を確認してください。**

- 修正済みの場合: 本指示書の手順どおり進めてください。既存語の respelling が意図せずクリアされる問題は発生しないはずです
- 未修正の場合: M1・M2 同様、`merge_respelling.py` 実行後に既存 VntV pending 語の respelling が一時クリアされる可能性があります。その場合は M1・M2 と同じ要領で HEAD 版から復元してください

---

## 1. スコープと非スコープ

### スコープ

1. `phase1_m3_400_with_gloss.json`（400エントリ）を `wordlist_GA_a1a2_plus_phonics.json` にマージ
2. `_generation_source` フィールドをマージ後に削除
3. 既存 `generate_flap_ipa.py` / `generate_respelling.py` を実行し narrow IPA・respelling を生成
4. `neighbors` は空配列のまま維持

### 非スコープ

- `index.html` の変更
- `neighbors` 計算（項目#6）
- 残り 789 語（1,189 - 400 = 789。M4以降で対応）

---

## 2. 手順

### 2-1. マージスクリプト

```python
import json

m3 = json.load(open('phase1_m3_400_with_gloss.json'))
main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))

existing_words = {w['w'].lower() for w in main}
new_entries = []
skipped = []
for entry in m3:
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

期待される出力: `新規追加: 400語`、`スキップ: 0語`、マージ後総語数 **4,039**（現在3,639 + 400）。

### 2-2. narrow IPA・respelling 生成

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
```

`merge_respelling.py` 修正済みなら、このステップの後に `git diff --stat` で変更が新規400語分（+関連するnarrow ipa/respellingフィールド追加）のみであることを確認してください。修正が未完了の場合は、M1・M2同様の復元対応を実施してください。

### 2-3. 検証

```python
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
print('総語数:', len(d))  # 期待値: 4039

from collections import Counter
print('CEFR分布:', dict(Counter(w.get('cefr') for w in d)))
# 期待値: B1 が 927+400=1327 になっているはず

by_w = {e['w']: e for e in d}
for w in ['entertain', 'lifeguard', 'marine']:
    e = by_w[w]
    print(w, '->', {k: e.get(k) for k in ('ipa','rp_ipa','cefr','pos','gloss','respell_ga','ipa_actual_ga')})

# 既存語(M1/M2由来含む)への影響がないことのサンプル確認
for w in ['abandon', 'biography', 'book']:
    e = by_w.get(w)
    if e:
        print(w, '(既存確認)', '->', {k: e.get(k) for k in ('gloss','respell_ga')})
```

`B1: 1327` を確認してください。

---

## 3. 実装レポートの記載事項

1. マージ結果（新規追加400語、重複ゼロ確認）
2. `merge_respelling.py` 修正版の効果確認（既存語respellingへの影響有無）
3. narrow IPA / respelling 生成結果（例外扱いになった語数）
4. 検証結果（B1=1327確認、サンプル語の生成内容）
5. `docs/PURPOSE.md` への軽微な追記
6. 既知の残作業・懸念事項

---

## 4. Git コミット推奨単位

```
Commit 1: Phase 1 M3: add 400 new B1 vocabulary words with full gloss (5 languages)
  - wordlist_GA_a1a2_plus_phonics.json (+400 entries, gloss complete)
  - phase1_m3_400_with_gloss.json (source data, keep for record)

Commit 2: Generate narrow IPA and respelling for Phase 1 M3 words
  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)

Commit 3: Document Phase 1 M3 completion
  - docs/PURPOSE.md
```

---

## 5. 次のマイルストーン

Phase 1 M4（残り 789 語）で B1 拡充完了まであと2バッチ程度です。同じ形式でご依頼ください。
