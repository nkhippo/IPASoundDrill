---
id: pj-2026-06-29-94dc
aliases:
- pj-2026-06-29-94dc
title: Cursor 指示書 — 学習ガイド `philosophy` / `solves` 章の強化（全6言語）
created: '2026-06-29'
---
# Cursor 指示書 — 学習ガイド `philosophy` / `solves` 章の強化（全6言語）

> 作成日: 2026-06-28
> 種別: コンテンツ更新（学習ガイド本文・第2弾）
> 対象: `data/guide.json`
> 入力: `guide.json`（Claude 生成・6言語版・本書添付）
> 前提: `cursor-guide-welcome-v2.md` 実装済み（welcome 章4段落化済み）

---

## 0. 改修意図

welcome 章のナラティブ強化（v2）に続き、直後に読まれる2章を強化する。

| 章 | 旧 | 新 | 変更の性質 |
|---|---|---|---|
| `philosophy` | 2段落 | **3段落** | 既存2段落を保持し、科学的根拠（Flege SLM / Kuhl PAM）を1段落追加 |
| `solves` | 2段落 | **2段落** | 段落数は変えず、各ギャップを具体例付きで大幅に拡充。スコープ注記の位置づけも強化 |

---

## 1. 変更スコープ

### 変更する章・言語
- `guide.json[<lang>].philosophy.body`（2段落 → 3段落）
- `guide.json[<lang>].solves.body`（2段落 → 2段落・内容拡充）
- 全6言語: en / ja / ko / zh-Hant / zh-Hans / fil

### 触らないもの
- `philosophy.title` / `solves.title`（維持）
- 他6章（`welcome` / `modes` / `decode_encode` / `connected` / `accents` / `how_to_use`）
- セクション順序・キー順序

→ **`data/guide.json` を Claude 生成版で丸ごと置き換えが最安全**（welcome 強化版も内包済み）。

---

## 2. `philosophy` 章の変更（3段落構成）

| # | 内容 | 変更 |
|---|------|------|
| P1 | 知覚-産出原則（ship/sheep 例） | **既存維持** |
| P2 | 辞書発音を使う理由 | **既存維持** |
| P3 | 科学的根拠（SLM / PAM） | **新規追加** |

P3 の骨子（全言語共通）:
- **James Emil Flege の Speech Learning Model**: 運動系と聴覚系は共通の音韻空間を持つ → 産出の練習が知覚の神経回路を書き換える
- **Patricia Kuhl の Perceptual Magnet Effect**: 未産出の音は母語原型に引き寄せられる → 受動リスニングだけではアクセント高原を突破できない理由
- 帰結: Decode / Encode ドリルは産出と知覚の校正を IPA 記号という共通アンカーで同時に行う

---

## 3. `solves` 章の変更（2段落・内容拡充）

| # | 旧 | 新 |
|---|---|---|
| P1 | 3ギャップを短く箇条書き的に列挙 | 各ギャップに**具体例**を付与（colonel/epitome/though-through-tough-thought/ミニマルペア） |
| P2 | スコープ制限を1行で述べる | **「制限ではなく設計」**という位置づけで大きく書き直し。土台の比喩を使って他スキルとの役割分担を明確化 |

---

## 4. アプリコードへの影響

**変更不要。**
`renderGuide()` が `body[]` を逐次描画するため、段落の内容・長さが変わっても自動反映。

---

## 5. 検証

```bash
python3 -c "
import json
g = json.load(open('data/guide.json'))
assert list(g.keys()) == ['en','ja','ko','zh-Hant','zh-Hans','fil']
for lang in g:
    assert len(g[lang]) == 8, f'{lang}: {len(g[lang])} sections'
    assert len(g[lang]['welcome']['body']) == 4, f'{lang} welcome'
    assert len(g[lang]['philosophy']['body']) == 3, f'{lang} philosophy'
    assert len(g[lang]['solves']['body']) == 2, f'{lang} solves'
print('OK')
"
```

実機（各言語で Guide を開く）:
- [ ] philosophy 章が**3段落**で表示される
- [ ] 3段落目（科学的根拠）が自然なフォントで表示される
- [ ] solves 章が**2段落**。各ギャップに *colonel* / *though–through–tough–thought* の具体例が見える
- [ ] welcome 章の4段落も引き続き正常表示
- [ ] 他5章が従来どおり
- [ ] PII（個人名等）が UI に出ていない

---

## 6. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/guide.json` | Claude 生成版で上書き（welcome v2 も内包） |
| `docs/SPECIFICATION.md` | philosophy 3段落・solves 拡充を反映（任意） |
| `docs/cursor-guide-philosophy-solves.md` | 指示書コピー |

---

## 7. 申し送り（次の強化候補）

今回強化した章のまとめ:

| 章 | 段落数 | 状態 |
|---|---|---|
| `welcome` | 4 | ✅ v2 済み（fossilization / IPA 複利 / アプリ比較） |
| `philosophy` | 3 | ✅ 今回（SLM / PAM 追加） |
| `solves` | 2 | ✅ 今回（具体例・設計哲学拡充） |
| `modes` | 3 | 現状維持（十分な情報量） |
| `decode_encode` | 1 | 候補（Encode の難しさをより掘り下げ可能） |
| `connected` | 1 | 候補（なぜ連結音が重要かの根拠追加可能） |
| `accents` | 1 | 現状維持 |
| `how_to_use` | 2 | 候補（週次・日次スケジュール例を加えると具体性向上） |
