# Cursor 指示書 — Tier 4: `cs_rule.fil` マージ（連結句201 + 弱形36）

> 作成日: 2026-06-28
> 種別: 多言語データ（cs_rule に fil を追加）
> 対象: `data/connected_speech.json`（201件）/ `data/weak_forms.json`（36件）
> 入力: `cs-rule-fil-connected.json`（Claude 生成・連結句用）/ `cs-rule-fil-weak.json`（弱形用）

---

## 0. これは何か

Tier 4 は `connected_speech.json` と `weak_forms.json` の各アイテムに `cs_rule.fil` を追加する作業。
Claude が 237件（201+36）のタガログ語ルール文を生成し、JSON マップ形式（`{ "id": "fil text" }`）で渡す。
Cursor はこれを `cs_rule.fil` としてマージする。

フォールバック機構（`csRuleText()`）があるため、**fil 未整備時でも en にフォールバックしクラッシュしない**。

---

## 1. 入力ファイル形式

```json
// cs-rule-fil-connected.json
{ "cs001": "n umuugnay sa kasunod na patinig: a-napple", "cs002": "...", ... }

// cs-rule-fil-weak.json
{ "wf001": "mahinang 'a' ay laging /ə/ bago ang katinig", ... }
```

マージキーは **`id`**（各 JSON アイテムの `id` フィールドと一致）。

---

## 2. マージスクリプト（`tools/merge_cs_rule_fil.py`・新規）

```python
# -*- coding: utf-8 -*-
"""Merge cs_rule.fil into connected_speech.json and weak_forms.json."""
import json

def merge(data_path, map_path, label):
    data = json.load(open(data_path, encoding="utf-8"))
    fil_map = json.load(open(map_path, encoding="utf-8"))
    applied, missing = 0, []
    for item in data:
        v = fil_map.get(item["id"])
        if v and v.strip():
            item.setdefault("cs_rule", {})["fil"] = v
            applied += 1
        else:
            missing.append(item["id"])
    json.dump(data, open(data_path, "w", encoding="utf-8"), ensure_ascii=False, indent=2)
    print(f"{label}: applied={applied}, missing={missing}")

merge("data/connected_speech.json", "data/cs-rule-fil-connected.json", "CS")
merge("data/weak_forms.json",        "data/cs-rule-fil-weak.json",      "WF")
```

実行:
```bash
python3 tools/merge_cs_rule_fil.py
```

期待結果:
```
CS: applied=201, missing=[]
WF: applied=36, missing=[]
```

---

## 3. 既存コードへの影響

**アプリコード（`index.html`）は変更不要。**
既存 `csRuleText(item)` が `item.cs_rule[LANG] || item.cs_rule.en` を返すため、
UI=fil かつ `cs_rule.fil` が入ったアイテムは自動的にタガログ語ルール文を表示。

---

## 4. DoD

- [ ] `tools/merge_cs_rule_fil.py` 新規作成・実行
- [ ] CS: applied=201, WF: applied=36（missing なし）
- [ ] 既存 `cs_rule.{en,ja}` 不変
- [ ] 実機: fil 切替 → Connected Speech reveal にタガログ語ルール文が表示される
- [ ] 実機: fil 切替 → Weak Forms reveal（Connected タブの Type=Weak forms）にルール文表示

---

## 5. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/cs-rule-fil-connected.json` | 新規配置（Claude 生成） |
| `data/cs-rule-fil-weak.json` | 新規配置（Claude 生成） |
| `tools/merge_cs_rule_fil.py` | 新規 |
| `data/connected_speech.json` | 201件に `cs_rule.fil` 追加 |
| `data/weak_forms.json` | 36件に `cs_rule.fil` 追加 |
| `docs/PURPOSE.md` / `DESIGN.md` | Tier 4 完了を反映 |

---

## 6. 申し送り

- Tier 4 完了でタガログ語（fil）のすべての Tier が整備完了（Tier 1+2+3+4 すべて Done）
- `i18n-language-scaling.md` の fil 行を全 Tier 完了に更新すること
