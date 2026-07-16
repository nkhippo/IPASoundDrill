---
id: pj-2026-06-29-929f
aliases:
- pj-2026-06-29-929f
title: Cursor 実装レポート — 学習ガイド `philosophy` / `solves` 章強化
created: '2026-06-29'
---

# Cursor 実装レポート — 学習ガイド `philosophy` / `solves` 章強化

> 作成日: 2026-06-28  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-guide-philosophy-solves.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

welcome 章の4段落化（v2）に続き、直後に読まれる2章を強化する。

| 章 | 旧 | 新 | 変更内容 |
|---|---|---|---|
| `philosophy` | 2段落 | **3段落** | 既存2段落を維持し、Flege SLM / Kuhl PAM の科学的根拠を1段落追加 |
| `solves` | 2段落 | **2段落** | 各ギャップに具体例（*colonel* / *epitome* / *though–through–tough–thought* / ミニマルペア）を付与。スコープ注記を「制限ではなく設計」として拡充 |

---

## 2. 実施内容

### 2-1. データ更新

| 項目 | 内容 |
|------|------|
| 対象 | `data/guide.json` |
| 変更章 | `philosophy.body`（2→3段落）、`solves.body`（内容拡充） |
| 言語 | en / ja / ko / zh-Hant / zh-Hans / fil |
| 非変更 | welcome（4段落 v2）・modes・decode_encode・connected・accents・how_to_use |

### 2-2. マージ方針

提供 `guide.json` には `decode_encode` / `connected` / `how_to_use` の段落拡張も含まれていたが、指示書のスコープ（philosophy / solves のみ）に従い、**該当2章だけを既存 guide.json にマージ**した。welcome v2 および他5章は前回コミットの内容を維持。

### 2-3. アプリコード

**変更不要。** `renderGuide()` が `body[]` を逐次描画するため自動反映。

---

## 3. 検証

```bash
python3 -c "
import json
g = json.load(open('data/guide.json'))
assert list(g.keys()) == ['en','ja','ko','zh-Hant','zh-Hans','fil']
for lang in g:
    assert len(g[lang]) == 8
    assert len(g[lang]['welcome']['body']) == 4
    assert len(g[lang]['philosophy']['body']) == 3
    assert len(g[lang]['solves']['body']) == 2
print('OK')
"
# OK
```

旧版との diff 確認: **philosophy / solves 以外の6章は全言語で完全一致**。

| DoD 項目 | 結果 |
|----------|------|
| philosophy 3段落（6言語） | ✅ |
| solves 2段落・内容拡充 | ✅ |
| welcome 4段落維持 | ✅ |
| 他5章不変 | ✅ |
| index.html 変更不要 | ✅ |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/guide.json` | philosophy / solves のみマージ |
| `docs/SPECIFICATION.md` | 章構成を反映 |
| `docs/cursor-guide-philosophy-solves.md` | 指示書コピー |

---

## 5. デプロイ

- **ブランチ:** `main` にマージ・push
- **GitHub Pages:** https://nkhippo.github.io/IPASoundDrill/

---

## 6. 申し送り（次の強化候補）

| 章 | 段落数 | 状態 |
|---|---|---|
| `welcome` | 4 | ✅ v2 済み |
| `philosophy` | 3 | ✅ 今回 |
| `solves` | 2 | ✅ 今回 |
| `modes` | 3 | 現状維持 |
| `decode_encode` | 1 | 候補（提供版に3段落案あり） |
| `connected` | 1 | 候補（提供版に3段落案あり） |
| `accents` | 1 | 現状維持 |
| `how_to_use` | 2 | 候補（提供版に3段落案あり） |
