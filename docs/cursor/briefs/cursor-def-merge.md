---
id: pj-2026-06-28-9407
aliases:
- pj-2026-06-28-9407
title: Cursor 指示書 — `def` フィールド追加（英語定義文・全3,059語）
created: '2026-06-28'
---

# Cursor 指示書 — `def` フィールド追加（英語定義文・全3,059語）

> 作成日: 2026-06-28
> 種別: データスキーマ拡張
> 対象: `wordlist_GA_a1a2_plus_phonics.json`（3,059語）
> 入力: `data/def-batch01.json` … `def-batch08.json`（Claude 生成・`{ "w": "English def" }` マップ）

---

## 0. これは何か

Mode B Study の2段階 reveal で、**英語 UI 選択時に表示する英語定義文**を追加する。
既存の `gloss.en` は約94%（2,881語）が単語そのもの（`"boat" → "boat"`）で定義として機能しない。
`def` フィールドに1〜2文の平易な英語定義を追加することで、英語学習者が発音練習中に意味を確認できるようにする。

既存の `modeBDisplayGloss()` は `c.def` を優先的に使うよう実装済み（待機状態）。
データをマージするだけで UI に反映される。

---

## 1. 入力ファイル形式

```json
// data/def-batch01.json (例)
{
  "A": "The first letter of the English alphabet.",
  "a": "The indefinite article used before words starting with a consonant sound.",
  "about": "Concerning or on the subject of; approximately.",
  ...
}
```

マージキーは **`w`**（wordlist の各エントリの `w` フィールドと一致）。

---

## 2. マージスクリプト（`tools/merge_def.py`・新規）

```python
# -*- coding: utf-8 -*-
"""Merge def (English definitions) into wordlist_GA_a1a2_plus_phonics.json."""
import json, glob

WL = "wordlist_GA_a1a2_plus_phonics.json"   # 実パスに合わせる
BATCH_GLOB = "data/def-batch*.json"

wl = json.load(open(WL, encoding="utf-8"))
def_map = {}
files = sorted(glob.glob(BATCH_GLOB))
for f in files:
    def_map.update(json.load(open(f, encoding="utf-8")))

applied, missing = 0, []
for it in wl:
    v = def_map.get(it["w"])
    if v and v.strip():
        it["def"] = v
        applied += 1
    else:
        missing.append(it["w"])

json.dump(wl, open(WL, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
print(f"batches: {len(files)} | def entries: {len(def_map)} | "
      f"applied: {applied} | without def: {len(missing)}")
if missing:
    print("missing:", missing[:10])
```

実行:
```bash
python3 tools/merge_def.py
```

期待結果:
```
batches: 8 | def entries: 3059 | applied: 3059 | without def: 0
```

---

## 3. 既存コードへの影響

**アプリコード（`index.html`）は変更不要。**
`renderModeBStudy()` 内の `modeBDisplayGloss(c)` に `c.def` 分岐が実装済み:
- `LANG === "en"` かつ `gloss.en === c.w` のとき → `c.def` を使用（今回のデータが入る）
- それ以外 → 従来どおり `wordGloss(c)` を使用

---

## 4. DoD

- [ ] `tools/merge_def.py` 新規作成・実行
- [ ] `applied == 3059`（`without def: 0`）
- [ ] 既存フィールド（`gloss.*`, `ipa`, `neighbors` 等）不変
- [ ] 実機: 設定 → English → Mode B Study reveal → 単語の英語定義が表示される
- [ ] 他言語（ja / zh / ko / fil）では引き続き各言語語義が表示される（def は en 専用）

---

## 5. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/def-batch01.json` … `def-batch08.json` | 新規配置（Claude 生成） |
| `tools/merge_def.py` | 新規 |
| `wordlist_GA_a1a2_plus_phonics.json` | 全3,059語に `def` フィールド追加 |
| `docs/DESIGN.md` / `SPECIFICATION.md` | `def` フィールドを反映 |

---

## 6. 定義スタイルの参考（確認用）

| 語 | `def` |
|---|---|
| boat | A small watercraft used to travel on water such as rivers and lakes. |
| a | The indefinite article used before words starting with a consonant sound. |
| ate | Past tense of 'eat': consumed food. |
| children | Plural of 'child': young human beings, more than one. |
| aren't | Short form of 'are not'. |
| beautiful | Pleasing to the senses or mind; very attractive. |

- 過去形/過去分詞 → `Past tense/past participle of '[base]': [simple meaning].`
- 短縮形 → `Short form of '[full form]'.`
- 複数形 → `Plural of '[base]': more than one [base].`
- 文字 → `The Nth letter of the English alphabet.`
- 数字 → `The number [N].`
- 一般語 → 1文の明快な定義

---

## 7. 将来の改善候補

- 詳細な語義・例文が必要な語（多義語等）は個別に上書き可能
- Mode B MCQ では引き続き `gloss[LANG]` を使用（`def` は Study reveal のみ）
- `def` の長さ上限（現状は1〜2文・平均30〜60文字）を揃えることで UI の安定性向上
