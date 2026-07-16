---
id: pj-2026-06-29-f740
aliases:
- pj-2026-06-29-f740
title: Cursor 実装レポート — 学習ガイド全章置換（Claude 生成版）
created: '2026-06-29'
---

# Cursor 実装レポート — 学習ガイド全章置換（Claude 生成版）

> 作成日: 2026-06-29  
> 対象ブランチ: `main`  
> 入力: `/Users/naoya.k/Downloads/files 28/guide.json`

Claude 側への作業報告用サマリー。

---

## 1. 背景

前回（`387e910`）は指示書スコープに従い `philosophy` / `solves` のみをマージした。提供 `guide.json` には **`decode_encode` / `connected` / `how_to_use` の段落拡張** も含まれていたため、ユーザー要望により **6言語版を丸ごと置き換え**。

---

## 2. 実施内容

### 2-1. データ更新

```bash
cp guide.json data/guide.json
```

| 章 | 旧段落数 | 新段落数 | 変更 |
|---|---|---|---|
| `welcome` | 4 | 4 | 変更なし（v2 維持） |
| `philosophy` | 3 | 3 | 変更なし（前回済み） |
| `solves` | 2 | 2 | 変更なし（前回済み） |
| `modes` | 3 | 3 | 変更なし |
| `decode_encode` | 1 | **3** | **拡充**（Decode/Encode の難しさ・使い分け） |
| `connected` | 1 | **3** | **拡充**（連結音の重要性・段階学習） |
| `accents` | 1 | 1 | 変更なし |
| `how_to_use` | 2 | **3** | **拡充**（週次スケジュール例・習慣化のコツ） |

全6言語: en / ja / ko / zh-Hant / zh-Hans / fil

### 2-2. アプリコード

**変更不要。** `renderGuide()` が `body[]` を逐次描画するため自動反映。

---

## 3. 検証

```bash
python3 -c "
import json
g = json.load(open('data/guide.json'))
assert list(g.keys()) == ['en','ja','ko','zh-Hant','zh-Hans','fil']
expected = {'welcome':4,'philosophy':3,'solves':2,'modes':3,
            'decode_encode':3,'connected':3,'accents':1,'how_to_use':3}
for lang in g:
    assert len(g[lang]) == 8
    for sec,n in expected.items():
        assert len(g[lang][sec]['body']) == n
print('OK')
"
# OK
```

| DoD 項目 | 結果 |
|----------|------|
| 6言語 × 8セクション | ✅ |
| decode_encode / connected / how_to_use 拡充 | ✅ |
| welcome / philosophy / solves 維持 | ✅ |
| index.html 変更不要 | ✅ |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/guide.json` | Claude 生成6言語版で丸ごと置換 |
| `docs/SPECIFICATION.md` | 全章段落数を反映 |
| `docs/cursor-implementation-report-guide-full-replace.md` | 本レポート |

---

## 5. デプロイ

- **ブランチ:** `main` に push
- **GitHub Pages:** https://nkhippo.github.io/IPASoundDrill/

---

## 6. 全章ステータス（置換後）

| 章 | 段落数 | 状態 |
|---|---|---|
| `welcome` | 4 | ✅ v2 |
| `philosophy` | 3 | ✅ SLM/PAM |
| `solves` | 2 | ✅ 具体例・設計哲学 |
| `modes` | 3 | ✅ |
| `decode_encode` | 3 | ✅ 今回拡充 |
| `connected` | 3 | ✅ 今回拡充 |
| `accents` | 1 | ✅ |
| `how_to_use` | 3 | ✅ 今回拡充 |
