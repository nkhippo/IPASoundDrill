---
id: pj-2026-07-10-b794
aliases:
- pj-2026-07-10-b794
title: Cursor 指示書 — 連結音・弱形 CEFR バッジ UI 配線
created: '2026-07-10'
---
# Cursor 指示書 — 連結音・弱形 CEFR バッジ UI 配線

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 想定 branch: `feat/connected-weak-cefr-badges`
- 前提: `data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）に `cefr` フィールドが既に付与済み（2026-07-09 完了）

---

## 1. 背景と現状

`cefr` フィールドはデータには入っているが、**vocab browser の Phrases タブでは表示されていない**。

一方、練習中のカード上部の CEFR バッジ（`#dCefr` 等）については、既存の `setCardCefr()` 関数が
連結音・弱形のケースを正しくハンドリングしているため、**cefr フィールドが埋まった時点で自動的に
正しく表示される想定**（要確認）。

## 2. 実施内容

### 2-1. Vocab browser Phrases タブに CEFR バッジ列を追加（メイン）

**変更箇所**: `renderVocabPhrases()`（L884 付近）の各行 HTML

**現状:**
```javascript
html += `<div class="vocab-row">
  <span class="vocab-w" style="min-width:120px">${escHtml(c.w)}</span>
  <span class="vocab-ipas" style="min-width:130px">…</span>
  <span class="vocab-gloss" title="${escAttr(rule)}">…</span>
  <span class="vocab-type-badge vocab-type-${escAttr(type)}">${escHtml(type)}</span>
  <span class="vocab-level">L${level}</span>
  <button class="vocab-play" …>${SPEAKER_SVG}</button>
</div>`;
```

**変更後:** `vocab-level` の直前に CEFR バッジを追加:
```javascript
const cefrLabel = itemCefrLabel(c);  // 既存関数を再利用
const cefrBadge = cefrLabel
  ? `<span class="vocab-cefr-badge vocab-cefr-${cefrLabel}">${escHtml(cefrLabel)}</span>`
  : "";

html += `<div class="vocab-row">
  <span class="vocab-w" style="min-width:120px">${escHtml(c.w)}</span>
  <span class="vocab-ipas" style="min-width:130px">…</span>
  <span class="vocab-gloss" title="${escAttr(rule)}">…</span>
  <span class="vocab-type-badge vocab-type-${escAttr(type)}">${escHtml(type)}</span>
  ${cefrBadge}
  <span class="vocab-level">L${level}</span>
  <button class="vocab-play" …>${SPEAKER_SVG}</button>
</div>`;
```

### 2-2. CSS 追加（`<style>` セクション内、`vocab-type-badge` の隣に配置）

```css
.vocab-cefr-badge{
  font-family:var(--mono);
  font-size:9px;
  font-weight:700;
  padding:2px 6px;
  border-radius:6px;
  flex-shrink:0;
  letter-spacing:.04em;
  color:var(--signal);
  background:var(--signal-soft);
}
```

CEFR レベル別の色分けは、既存の card-top `.cefr` と同じ配色（`--signal` / `--signal-soft`）で統一。
より鮮明にしたい場合は以下でレベル別に色分け可能（オプション）:

```css
.vocab-cefr-A1{color:#0a7d3a;background:#e8f5ed}
.vocab-cefr-A2{color:#0f6ca8;background:#e6f2fa}
.vocab-cefr-B1{color:#b06400;background:#fbf1e0}
.vocab-cefr-B2{color:#a1252b;background:#faeaec}
```

（変数化は既存パターンに合わせる。既存の card-top と同じ扱いにするなら上記オプションは不要）

### 2-3. Weak forms を Phrases タブに含めるか（判断分岐）

**現状**: `renderVocabPhrases()` は `CONNECTED` のみ表示、`WEAK` は表示していない。

**選択肢:**

- **(A) 現状維持**: 連結音のみ表示。weak forms は練習時のみ登場。
- **(B) Phrases タブに weak forms も統合**: sort 順を `linking → assimilation → elision → weak` に拡張。

**推奨: (A)** — スコープを拡張しないよう、本タスクは連結音のみ扱う。weak forms の
ブラウザ表示は別タスクで議論（そもそも weak form の分類が phrases タイプと異なるため、
別 UI 区分にすべき可能性が高い）。

### 2-4. 練習中カードの CEFR バッジ確認（新規実装なし・確認のみ）

`setCardCefr()`（L1368 付近）は既に以下のロジックを持つ:

```javascript
if(label){
  el.textContent=label;         // 正常表示
  ...
}else if(c&&(isConnectedItem(c)||isWeakItem(c))){
  el.textContent=t("cefr.pending");  // "pending" プレースホルダ
  ...
}
```

`cefr` フィールドが正しく埋まっていれば、連結音・弱形の練習中でも A1/A2/B1/B2 が表示される。

**動作確認手順:**
1. 連結音セッションを開始
2. `an apple`（cefr=A1）が出題された時、`#dCefr` に `A1` バッジが表示されることを確認
3. 弱形セッションでも同様に確認（例: `the` weak → cefr=A2）

もし表示されていない場合は、`setCardCefr` のロジック確認が別途必要（本タスクでは対応せず、
issue を作成してブロッキング解除）。

---

## 3. i18n

追加の i18n キーは不要（CEFR ラベルは全言語で "A1"/"A2"/"B1"/"B2" 表記のまま）。

---

## 4. テスト項目

| # | 項目 | 期待 |
|---|---|---|
| 1 | Vocab modal を開き Phrases タブに切替 | 各行に CEFR バッジ表示（A1/A2/B1/B2） |
| 2 | `an apple` の行 | A1 バッジ |
| 3 | `used to`（例）の行 | 対応する CEFR バッジ |
| 4 | 連結音セッション出題中の `#dCefr` | 該当語の CEFR ラベル（`pending` プレースホルダではない） |
| 5 | 弱形出題中の `#dCefr` | 同上 |
| 6 | 既存の vocab-type-badge / vocab-level の位置ずれなし | レイアウト崩れなし |

## 5. コミット

```bash
git add index.html \
        docs/cursor/reports/cursor-implementation-report-connected-weak-cefr-badges.md
git commit -m "feat: display CEFR badge in vocab browser Phrases tab"
```

## 6. スコープ外

- Weak forms を vocab browser Phrases タブに追加すること（別タスクで判断）
- `renderVocabWords` (単語タブ) の CEFR バッジ追加（**現在 pos バッジのみ**。CEFR は
  card-top バッジで既に表示中のため vocab browser 単語行に追加するかは要判断、本タスク対象外）
- CEFR バッジ表示の設定切替（オン/オフトグル）機能
