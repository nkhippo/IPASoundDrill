---
id: pj-2026-06-28-f394
aliases:
- pj-2026-06-28-f394
title: 'Cursor 実装レポート — 練習タブ統一: Connected Speech ⊃ Weak Forms'
created: '2026-06-28'
---
# Cursor 実装レポート — 練習タブ統一: Connected Speech ⊃ Weak Forms

> 作成日: 2026-06-28  
> 対象ブランチ: `main`  
> 指示書: `docs/cursor-tab-unify-connected-weak.md`

Claude 側への作業報告用サマリー。

---

## 1. 背景

Mode A の練習タブが Words / Connected Speech / Weak Forms の3つに分かれていた。弱形は連結発音現象の一部のため、**Connected Speech 内の Type フィルタ**に統合し、練習タブを **2つ**に集約。

---

## 2. 実施内容

### 2-1. UI 変更

| 項目 | 変更 |
|------|------|
| 練習タブ | **Words \| Connected Speech**（Weak Forms タブ削除） |
| Type ピル | All / Linking / Assimilation / Elision / **Weak forms**（`#csWeak` 追加） |
| 弱形ピルラベル | 既存 `tab.weak` を流用（i18n 新キー不要） |
| リード文 | `lead_connected_html` / `lead_weak_html` を `csFilter` で切替 |

### 2-2. ランタイム一本化

- `filteredConnectedPool()` + `filteredWeakPool()` → **`filteredCsPool()`**
- プール: `CONNECTED.concat(WEAK)` を Level × Type でフィルタ
- `csFilter === "weak"` → `isWeakItem` のみ（36件）
- `csFilter === "linking"` 等 → `cs_type` 一致（弱形は `cs_type` 無しで自動除外）
- **All = 237**（201 + 36）

### 2-3. 露出バグ修正（§3-7）

弱形が Connected タブに入ると句入力モードになる問題を修正:

| 箇所 | 修正 |
|------|------|
| `beforeinput` / `input` | `phrase = isConnectedItem(S.cur)` のみ（`S.tab` 依存を除去） |
| `renderDecode` | カード描画時にプレースホルダをアイテム基準で設定 |
| `updateSetupFields` | セットアップ時は `csFilter !== "weak"` で句プレースホルダ |

### 2-4. データ方針

- `connected_speech.json`（201）/ `weak_forms.json`（36）は**変更なし**
- Tier 4（`cs_rule.fil`）の対象237件は不変

### 2-5. 触らなかったもの

- Words タブの **Weak spots**（`S.focus === "weak"`）フォーカス
- reveal / TTS / キャリア文（アイテム単位分岐は既存のまま）
- i18n 5言語ファイル（編集なし）

---

## 3. 検証

```bash
python3 tools/validate_i18n.py   # ERROR 0（WARN: fil back_top のみ）
python3 tools/gen_audit_docs.py  # i18n-audit.md 再生成
```

| DoD 項目 | 結果 |
|----------|------|
| 練習タブ 2つ | ✅ |
| Type ピル Weak forms | ✅ |
| All=237 / weak=36 | ✅ |
| 弱形カード＝単語入力 | ✅ |
| reveal 分岐維持 | ✅ |
| validate_i18n ERROR 0 | ✅ |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `index.html` | タブ統合・`filteredCsPool`・入力バグ修正 |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | 2タブ化を反映 |
| `docs/i18n-language-scaling.md` | `tab.weak` 流用を注記 |
| `docs/i18n-audit.md` | 再生成 |
| `docs/cursor-tab-unify-connected-weak.md` | 指示書配置 |

---

## 5. デプロイ

| 項目 | 内容 |
|------|------|
| ブランチ | `main` |
| GitHub Pages | https://nkhippo.github.io/IPASoundDrill/ |

**実機確認:**

1. Mode A → Connected Speech → Type **Weak forms** → 36件・弱形リード
2. 弱形カードで単語入力（スペース不可）
3. 連結句カードで句入力（スペース可）
4. Type All → 237件

---

## 6. コミット

- **SHA:** `c7ada42`
- **メッセージ:** Unify Weak Forms into Connected Speech practice tab.
