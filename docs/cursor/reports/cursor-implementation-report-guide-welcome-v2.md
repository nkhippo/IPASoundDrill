---
id: pj-2026-06-28-5a97
aliases:
- pj-2026-06-28-5a97
title: Cursor 実装レポート — 学習ガイド `welcome` 章ナラティブ強化
created: '2026-06-28'
---
# Cursor 実装レポート — 学習ガイド `welcome` 章ナラティブ強化

> 作成日: 2026-06-28  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-guide-welcome-v2.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

学習ガイドの「はじめに」（`welcome`）章が1段落のみで、アプリの目的は伝わるが「なぜ今発音に取り組むべきか」のストーリーが弱かった。科学的見解（perceptual filtering / fossilization / IPA literacy）を骨子に、**4段落のナラティブ**へ書き直し。

---

## 2. 実施内容

### 2-1. データ更新

| 項目 | 内容 |
|------|------|
| 対象 | `data/guide.json`（Claude 生成6言語版で上書き） |
| 変更章 | `welcome.body` のみ（1段落 → **4段落**） |
| 言語 | en / ja / ko / zh-Hant / zh-Hans / fil |
| 非変更 | 他7章（philosophy … how_to_use）は元のまま |

### 2-2. 4段落構成（全言語共通）

| # | 内容 |
|---|------|
| P1 | アプリのアイデンティティ（発音トレーナー・IPA リテラシー） |
| P2 | 発音を後回しにする隠れたコスト（母語フィルター・**fossilization**） |
| P3 | IPA を読み書きできることの複利効果 |
| P4 | 講師 vs 都度検索 vs このアプリ（中間解としての位置づけ） |

### 2-3. アプリコード

**変更不要。** 既存 `renderGuide()` が `body[]` を逐次描画するため、段落数増加は自動反映。

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
print('OK')
"
# OK
```

旧版との diff 確認: **welcome 以外の7章は全言語で完全一致**。

| DoD 項目 | 結果 |
|----------|------|
| 有効な JSON | ✅ |
| 6言語 × 8セクション | ✅ |
| welcome.body が4段落 | ✅ |
| 他7章不変 | ✅ |
| index.html 変更不要 | ✅ |

### 注記（welcome.title）

提供版 `guide.json` において、ko / fil の `welcome.title` が旧版と異なる（ko: `시작하며` → `들어가며`、fil: `Maligayang pagdating` → `Panimula`）。本文ナラティブ強化に伴うローカライズ調整と判断し、提供ファイルをそのまま採用。

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/guide.json` | Claude 生成6言語版で上書き |
| `docs/SPECIFICATION.md` | welcome 4段落を反映 |
| `docs/cursor-guide-welcome-v2.md` | 指示書コピー |

---

## 5. デプロイ

- **ブランチ:** `main` にマージ・push
- **GitHub Pages:** https://nkhippo.github.io/IPASoundDrill/

---

## 6. 申し送り

- 同等のナラティブ強化を `philosophy`・`solves` 等へ展開可能（今回は welcome のみ）
- `validate_i18n.py` の対象外（guide.json は UI i18n とは独立ファイル）
