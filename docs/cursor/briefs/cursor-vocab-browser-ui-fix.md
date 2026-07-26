# Cursor 指示書 — 語彙ブラウザ UI 改善（4点）

> 作成日: 2026-06-29
> 種別: UI/UX 改修
> 対象: `index.html`（単一HTML本体）
> 前提: 語彙ブラウザ（`#vocabModal`）実装済み

---

## 0. 改修概要と設計判断

| # | 要望 | 採用案 | 理由 |
|---|---|---|---|
| ① | 検索フィールドを削除 or PC限定 | **PC のみ表示**（`@media (min-width:600px)`） | モバイルでは文字ジャンプで十分。PCでは有用 |
| ② | A〜Z 選択を簡易化 | **1行横スクロール帯**（折り返しなし、スワイプ可） | 3行グリッドより親指1スワイプで目的文字に届く |
| ③ | 意味の省略を改善 | **2行折り返し**（`white-space:normal`, `max-height:2.6em`） | ja平均4文字・98%が15字以内。右スクロールより自然。長い語も2行内に収まる |
| ④ | モーダル幅を拡張・統一 | **設定=400px / ガイド・語彙=560px（変更なし）、モバイルは `.modal{padding:8px}`** | モバイルでモーダル幅を実質広げる最短経路。PCの設定モーダルも旧320px→400pxで視認性向上 |

> **③ なぜ右スクロールではないか:**  
> 語義列に横スクロールを付けると、行をタップしたときに意図せずスクロールが発火しやすい。  
> データ確認の結果、ja語義の98%は15字以内（平均4字）。2行折り返しにするだけで全27件の長い語義が収まる。

---

## 1. ① 検索フィールド — PC のみ表示

### CSS 変更

```css
/* 既存の .vocab-search に追記 */
@media (max-width: 599px) {
  .vocab-search { display: none; }
}
```

これだけで完了。DOM・JS の変更不要。

---

## 2. ② A〜Z ジャンプバー — 1行横スクロール

### CSS 変更（既存 `.vocab-letters` を置き換え）

```css
/* 既存の .vocab-letters, .vocab-letter-btn を以下で上書き */
.vocab-letters {
  display: flex;
  flex-wrap: nowrap;          /* 折り返しなし（変更点） */
  gap: 4px;
  margin-bottom: 8px;
  flex-shrink: 0;
  overflow-x: auto;           /* 横スクロール */
  -webkit-overflow-scrolling: touch;
  scrollbar-width: none;      /* Firefox: スクロールバー非表示 */
  padding-bottom: 2px;        /* スクロール時のクリップ防止 */
}
.vocab-letters::-webkit-scrollbar { display: none; } /* Chrome/Safari */

.vocab-letter-btn {
  border: 1px solid var(--hair);
  background: #fff;
  border-radius: 6px;
  padding: 5px 9px;           /* 旧: 3px 7px → タップ領域を少し広げる */
  font-family: var(--mono);
  font-size: 12px;            /* 旧: 11px → 少し大きく */
  font-weight: 700;
  cursor: pointer;
  color: var(--muted);
  line-height: 1.4;
  flex-shrink: 0;             /* 追加: ボタンが縮まないように */
  white-space: nowrap;
}
.vocab-letter-btn:hover,
.vocab-letter-btn:active { border-color: var(--signal); color: var(--signal); }
```

### DOM 変更（任意・初期スクロール位置のリセット）

ブラウザを開くたびに先頭（A）に戻す。`openVocab()` 内に1行追加:

```js
function openVocab() {
  // ... 既存コード ...
  $("vocabLetters").scrollLeft = 0;  // ← 追加
  // ... 既存コード ...
}
```

---

## 3. ③ 意味列 — 2行折り返し（省略なし）

### CSS 変更（既存 `.vocab-gloss` を置き換え）

```css
.vocab-gloss {
  flex: 1;
  font-size: 13px;
  color: var(--muted);
  min-width: 0;
  /* 旧: overflow:hidden; text-overflow:ellipsis; white-space:nowrap → 削除 */
  white-space: normal;        /* 折り返しを許可 */
  word-break: break-word;
  display: -webkit-box;
  -webkit-line-clamp: 2;      /* 最大2行 */
  -webkit-box-orient: vertical;
  overflow: hidden;
  line-height: 1.4;
}
```

これにより:
- 短い語義（大多数）: 1行、従来と同じ見た目
- 長い語義（caught の「捕まえる、キャッチ、乗る（catchの過去形・過去分詞）」等）: 2行で完全表示

### JS 変更

既存 `renderVocabWords()` 内の語義生成部分で、HTML に `title` 属性があれば残すが、`white-space:nowrap` を前提とした調整があれば削除する。語義文字列のエスケープ処理は変更なし。

---

## 4. ④ モーダル幅の拡張・統一

### 設計方針

| モーダル | PC 幅 | モバイル |
|---|---|---|
| 設定（`#settingsModal`） | **400px**（旧320px） | 100% |
| ガイド（`#guideModal`） | 560px（変更なし） | 100% |
| 語彙（`#vocabModal`） | 560px（変更なし） | 100% |

モバイルでの実質的な幅拡大は、`.modal` の `padding` を `18px → 8px` に縮めることで実現。

### CSS 変更

```css
/* ── モーダル外枠パディング縮小（全モーダルに効く） ── */
.modal { padding: 8px; }          /* 旧: padding: 18px */

/* ── 設定モーダルの幅拡大 ── */
.modal-card { width: min(100%, 400px); }   /* 旧: 320px */

/* ── ガイド・語彙は既存値を維持 ── */
/* .modal-card.guide-card { width: min(100%, 560px); } ← 変更なし */
/* .vocab-card { width: min(100%, 560px); }             ← 変更なし */
```

**効果（iPhone 390px 画面で）:**  
旧: `390 - 36 = 354px` → 新: `390 - 16 = 374px`（+20px）  
設定モーダルは `374px` 表示（PCでは400pxのまま）

---

## 5. 追加改善（提案）: 行の縦スペース調整

意味が2行になるケースに備え、行の上下パディングを微調整する。

```css
.vocab-row {
  padding: 10px 2px;   /* 旧: 9px 2px → 1px増で2行語義がゆったり */
  align-items: flex-start;  /* 旧: center → 語義が2行のとき上揃えの方が読みやすい */
}
/* 単語・IPA・スピーカーは上端を揃えつつ視覚的に中央に見せる */
.vocab-w    { padding-top: 2px; }
.vocab-ipas { padding-top: 1px; }
.vocab-play { margin-top: 1px; }
```

---

## 6. 検証 / DoD

実機（iPhone / Android）:

- [ ] **①** 検索ボックスがモバイルで非表示
- [ ] **①** PCブラウザ（≥600px）では検索ボックスが表示され機能する
- [ ] **②** A〜Z が1行に並び、左右スワイプで全文字にアクセスできる
- [ ] **②** 各文字ボタンタップでリスト該当グループへスクロールする
- [ ] **②** スクロールバーが非表示（見た目がすっきり）
- [ ] **③** 短い語義（大多数）は1行で変化なし
- [ ] **③** 長い語義（caught, understood 等）が「...」省略なく2行で表示される
- [ ] **③** 2行を超える語義がある場合（英語 def 等）は2行でクリップされる
- [ ] **④** 設定モーダルがモバイルで旧より約20px広く表示される
- [ ] **④** 設定モーダルのボタン・言語リストが横幅に余裕を持って表示される
- [ ] **④** ガイドモーダルの幅は変化なし（560px）
- [ ] **④** 語彙モーダルの幅は変化なし（560px）
- [ ] 語彙ブラウザ全般の機能（タブ・フレーズ・スピーカー）に影響なし

---

## 7. 変更ファイル

| ファイル | 変更箇所 |
|---|---|
| `index.html` | CSS: `.modal`・`.modal-card`・`.vocab-letters`・`.vocab-letter-btn`・`.vocab-gloss`・`.vocab-row`・`@media(max-width:599px) .vocab-search` |
| `index.html` | JS: `openVocab()` に `scrollLeft = 0` 1行追加 |

**i18n・データファイルの変更なし。**  
`validate_i18n.py` の実行も不要。
