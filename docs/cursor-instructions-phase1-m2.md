# Cursor 指示書 — Phase 1 M2バッチ（400語）のマージ

> 作成日: 2026-07-08
> 前提: Phase 1 M1（180語 + gloss適用）が完了・push 済み
> ゴール: B1 拡充の第2バッチ 400 語（`biography` 〜 `enrich`）を、IPA・pos・def・gloss(5言語)すべて完成した状態でマージする
> **M1との違い**: 今回は gloss も含めて完成済みデータを一括提供（M1は IPA/pos/def → 別途 gloss適用の2段階だったが、今回は1段階で完結）

---

## 0. 背景

CEFR-J B1 拡充対象 1,769 語のうち、M1 で処理した 180 語の続き 400 語（アルファベット順で `biography` 〜 `enrich`）を全フィールド生成済みで提供します。

### 技術的な処理内容

- **GA/RP IPA**: M1 と同じパイプライン（CMU Pronouncing Dictionary + Britfone RP辞書）。400語中340語(85%)は両辞書から自動生成、残り60語（`brand-new`, `cd-rom`, `cv`, `dj` 等の複合語・略語・派生語）は既存語根の発音を参照した音韻的合成で補完
- **pos/def**: 既存スタイル（品詞ラベル、簡潔な英語定義）に準拠して生成
- **gloss(ja/zh/ko/fil)**: M1 で確立したスタイル（簡潔な訳語、多義語は列挙、英式/米式ペアは `(英)` 等で明示区別）を踏襲

### 品質検証済み事項

- 既存3,059語・M1の180語との重複: **0件**
- IPA/RP IPA の形式異常: **0件**
- 品詞ラベルの既存語彙リストからの逸脱: **なし**
- 英式/米式ペア（`categorise/categorize`, `defence/defense`, `counseling/counselling`, `dialog/dialogue` 等）の訳語整合性: 確認済み

---

## 1. スコープと非スコープ

### スコープ

1. `phase1_m2_400_with_gloss.json`（400エントリ）を `wordlist_GA_a1a2_plus_phonics.json` にマージ
2. `_generation_source` フィールドをマージ後に削除
3. 既存 `generate_flap_ipa.py` / `generate_respelling.py` を実行し narrow IPA・respelling を生成
4. `neighbors` は空配列のまま維持（項目#6で別途対応）

### 非スコープ

- `index.html` の変更
- `neighbors` 計算
- 残り 1,189 語（M3以降のバッチで対応。1,769 - 180(M1) - 400(M2) = 1,189）

---

## 2. 手順

### 2-1. マージスクリプト

```python
import json

m2 = json.load(open('phase1_m2_400_with_gloss.json'))
main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))

existing_words = {w['w'].lower() for w in main}
new_entries = []
skipped = []
for entry in m2:
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

期待される出力: `新規追加: 400語`、`スキップ: 0語`、マージ後総語数は現在の総数（M1適用後 3,239）+ 400 = **3,639**。

### 2-2. narrow IPA・respelling 生成

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
```

**M1実装時の教訓を踏まえた注意点:** M1マージ時、`merge_respelling.py` のデフォルト動作により既存 VntV pending 52 語の respelling が一時的にクリアされ、Cursor 側で HEAD から復元する追加作業が発生しました。今回も同様の可能性があるため、実行後に以下を確認してください:

```bash
git diff --stat wordlist_GA_a1a2_plus_phonics.json
```

差分件数が「新規400語分の追加」＋「新規語のnarrow IPA/respelling追加」の合計を大きく超える場合（＝既存語のフィールドが意図せず変化している場合）、M1と同様の復元対応が必要か確認してください。

### 2-3. 検証

```python
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
print('総語数:', len(d))  # 期待値: 3639

from collections import Counter
print('CEFR分布:', dict(Counter(w.get('cefr') for w in d)))
# 期待値: B1 が 527+400=927 になっているはず

by_w = {e['w']: e for e in d}
for w in ['biography', 'ecosystem', 'enrich']:
    e = by_w[w]
    print(w, '->', {k: e.get(k) for k in ('ipa','rp_ipa','cefr','pos','gloss','respell_ga','ipa_actual_ga')})

# 既存語(M1由来含む)への影響がないことのサンプル確認
for w in ['abandon', 'book', 'winter']:
    e = by_w.get(w)
    if e:
        print(w, '(既存確認)', '->', {k: e.get(k) for k in ('gloss','respell_ga')})
```

`B1: 927` を確認してください。

---

## 3. 実装レポートの記載事項

1. マージ結果（新規追加400語、重複ゼロ確認）
2. narrow IPA / respelling 生成結果（新規400語のうち例外扱いになった語数）
3. **既存語への影響確認**（M1の教訓を踏まえ、意図しない既存フィールド変化がないか）
4. 検証結果（B1=927確認、サンプル語の生成内容）
5. `docs/PURPOSE.md` への軽微な追記（「B1: 927語（M1: 180語 + M2: 400語）」）
6. 既知の残作業・懸念事項

---

## 4. Git コミット推奨単位

```
Commit 1: Phase 1 M2: add 400 new B1 vocabulary words with full gloss (5 languages)
  - wordlist_GA_a1a2_plus_phonics.json (+400 entries, gloss complete)
  - phase1_m2_400_with_gloss.json (source data, keep for record)

Commit 2: Generate narrow IPA and respelling for Phase 1 M2 words
  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)
  - (既存語のrespellingに意図しない影響があれば復元も含む)

Commit 3: Document Phase 1 M2 completion
  - docs/PURPOSE.md
```

---

## 5. 次のマイルストーン

Phase 1 M3（残り 1,189 語）に進む場合、同じ形式でご依頼ください。M1・M2 で確立したパイプライン（CMU Dict + Britfone による自動生成 85%、音韻合成による手動補完 15%、既存スタイル準拠の pos/def/gloss 生成）がそのまま再利用可能です。

B1 の CEFR-J 完全版（2,332語）まで、あと 1,189 語です。現在のペース（1バッチ 180〜400語）であれば、あと 3 バッチ程度で B1 拡充が完了する見込みです。
