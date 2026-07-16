---
id: pj-2026-06-27-efa6
aliases:
- pj-2026-06-27-efa6
title: 'Cursor 指示書 — Tier 2: `gloss.fil` バッチのマージ'
created: '2026-06-27'
---
# Cursor 指示書 — Tier 2: `gloss.fil` バッチのマージ

> 作成日: 2026-06-26
> 種別: 多言語データ（wordlist の語義 fil 追加）
> 対象: `wordlist_GA_a1a2_plus_phonics.json`（3,059語）
> 入力: `gloss-fil-batchNN.json`（Claude が 80語/バッチで順次生成。`{ "w": "fil語義" }` のマップ）

---

## 0. これは何か

Tier 2 は wordlist 3,059語に `gloss.fil` を追加する作業。Claude が **80語/バッチ × 約38バッチ**で fil 語義を生成し、各バッチを `gloss-fil-batchNN.json`（キー=`w`、値=タガログ語義）として渡す。Cursor はそれを wordlist にマージする。

**現在の提供状況:** `batch01`(1–80) / `batch02`(81–160) = 160語。以降のバッチは順次追加。

フォールバック機構（`wordGloss()`）があるため、**部分マージでもクラッシュしない**（未整備語は en にフォールバック）。よって増分マージも一括マージも安全。

---

## 1. マージ規則

- マージキーは **`w`**（wordlist 内でユニーク・3,059語）。
- 各 wordlist エントリの `gloss` に `"fil": <バッチの値>` を追加する。
- letter 26語・機能語・不規則形も含め全語が対象。
- 既存の `gloss.{en,ja,zh,ko}` は変更しない。`fil` を**足すだけ**。

### 推奨アプローチ
全38バッチが揃ってから `tools/merge_gloss_fil.py` で一括マージし、網羅検証する。
（増分でやる場合も同スクリプトを都度実行。glob で存在するバッチを拾うので、揃った分だけマージされる。）

---

## 2. マージスクリプト（`tools/merge_gloss_fil.py`・新規）

```python
# -*- coding: utf-8 -*-
"""Merge gloss-fil-batchNN.json files into the wordlist's gloss.fil."""
import json, glob, os
from collections import Counter

WL = "wordlist_GA_a1a2_plus_phonics.json"     # リポジトリ内の実パスに合わせる
BATCH_GLOB = "data/gloss-fil-batch*.json"      # バッチ置き場に合わせる

wl = json.load(open(WL, encoding="utf-8"))
fil = {}
files = sorted(glob.glob(BATCH_GLOB))
for f in files:
    fil.update(json.load(open(f, encoding="utf-8")))

applied, missing = 0, []
for it in wl:
    w = it["w"]
    v = fil.get(w)
    if v and v.strip():
        it.setdefault("gloss", {})["fil"] = v
        applied += 1
    else:
        missing.append(w)

json.dump(wl, open(WL, "w", encoding="utf-8"), ensure_ascii=False, indent=2)

print(f"batches: {len(files)} | fil entries: {len(fil)} | applied: {applied} | "
      f"words still without fil: {len(missing)}")
if missing[:20]:
    print("missing sample:", missing[:20])

# Mode B 衝突レポート（同一 gloss.fil = distractor 衝突候補）
c = Counter(it["gloss"]["fil"] for it in wl if "fil" in it.get("gloss", {}))
dups = {k: n for k, n in c.items() if n > 1}
print(f"identical fil cells (Mode B distractor-collision candidates): {len(dups)}")
```

> **注**: `indent=2` はリポジトリ既存のフォーマットに合わせて調整可（compact 維持ならスタイルを揃える）。マージ結果のキー順は既存のまま。

---

## 3. Mode B 採点への影響（衝突確認）

`gloss.fil` は Mode B の意味認識 MCQ の選択肢に使われる。**同一 `gloss.fil`** の語が distractor と正解で衝突しうる。
既存実装は同一 gloss の distractor を除外する想定だが、マージ後に上記スクリプトの「identical fil cells」件数を確認する。多ければ Claude 側で語義を差別化する（連結句キャリア文で ja に13件あった「同義除外」と同様の運用）。

---

## 4. DoD

- [ ] 全バッチ（最終的に約38本）を `tools/merge_gloss_fil.py` でマージ
- [ ] `applied == 3059`（全語に `gloss.fil`）、`words still without fil == 0`
- [ ] 空値なし、既存 `gloss.{en,ja,zh,ko}` 不変
- [ ] `identical fil cells` 件数を記録（Mode B 品質確認）
- [ ] 実機: fil 選択で Mode B の意味表示がタガログ語になる（未マージ時は en フォールバック）

---

## 5. 申し送り

- バッチは Claude が順次発行 → 同じ命名規則 `gloss-fil-batchNN.json` で追加 → スクリプトは glob で自動的に拾う。
- 本作業は **タブ統一リファクタとは独立**（Words/Mode B 側）。並行して進めて手戻りなし。
- letter 26語は `titik A` 形式、過去形/過去分詞は `(past tense/past participle ng X)` 形式で生成済み（規格はバッチ内で統一）。
