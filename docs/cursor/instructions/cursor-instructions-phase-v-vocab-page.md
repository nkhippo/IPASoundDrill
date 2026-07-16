---
id: pj-2026-07-10-d57a
aliases:
- pj-2026-07-10-d57a
title: Cursor 指示書 — 語彙ブラウザのページ化 + UI 整備 (Phase V)
created: '2026-07-10'
---

# Cursor 指示書 — 語彙ブラウザのページ化 + UI 整備 (Phase V)

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 想定 branch: `feat/phase-v-vocab-page`
- 優先度: 中（機能自体は稼働中。ページ化 + UI 改善で操作性を上げる）
- 前提: Phase T 完了推奨（同 index.html を触るため commit を分けやすい）
- 段取り: **V1 → V2 → V3 → V4 → V5 の順で phase 単位に commit**

---

## 0. サマリ

Naoya の確定意思:

1. **「別タブ」= 同じブラウザアプリ (SPA) 内の別ページ** — hash routing で実装（Cursor 提案の案 A）
2. **プレイ中の Menu ボタン (`#backTopBtn`) と Vocab Back は独立** — Vocab Back は常にセットアップまたは直前 view へ戻す
3. **モーダル UI が混雑して見づらい** — 別ページ化に伴い Claude 側で UI 整備ガイドを含める

| Phase | 施策 | 実装コスト |
|---|---|---|
| **V1** | `#vocabModal` → `#vocabPage` DOM 移設 + CSS 調整 | 中 |
| **V2** | Hash routing (`#/vocab`, `#/vocab/phrases`) + Back ボタン | 小 |
| **V3** | **UI 整備**: sticky header・2行行レイアウト・A-Z 圧縮・CEFR フィルタプレースホルダー | 中〜大 |
| **V4** | i18n キー追加 (`vocab.back` 6言語) | 小 |
| **V5** | 検証・ドキュメント | 小 |

---

## 1. 事前準備

```bash
git checkout main
git pull
git checkout -b feat/phase-v-vocab-page
cp index.html /tmp/index.html.pre_phase_v
```

現状 UI の把握（Cursor が手元で確認）:
1. アプリを開き、topbar の Vocab ボタンをクリック
2. モーダルが表示される。以下を目視確認:
   - Words タブ: 4,828 語がスクロールリストで表示
   - 各行: 単語 | GA IPA | RP IPA | gloss | POS バッジ | 進捗チェック | 再生ボタン
   - モバイル (`< 599px`) で検索が非表示
   - モーダル `max-width: 720px` で右余白なしの場合行が窮屈

---

# Phase V1 — DOM 移設 (モーダル → ページ)

## V1-1. 目的

`#vocabModal` を廃止し、独立セクション `#vocabPage` に置き換える。**既存の `renderVocabWords()` / `renderVocabPhrases()` などのレンダリング関数はそのまま流用**（container ID の参照先だけ変更）。

## V1-2. 変更内容

**ファイル:** `index.html`

### (a) DOM の置換

現状の `#vocabModal` セクション（`<div id="vocabModal" class="modal hidden">` 相当）を丸ごと削除し、次に置き換える:

```html
<!-- 語彙ブラウザ (Phase V で導入) -->
<section id="vocabPage" class="panel vocab-page hidden" aria-labelledby="vocabTitle">
  <div class="vocab-page-inner">
    <!-- Header (sticky) -->
    <div class="vocab-header">
      <div class="vocab-header-top">
        <button type="button" class="vocab-back" id="vocabBackBtn" aria-label="Back">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          <span data-i18n="vocab.back">Back</span>
        </button>
        <h1 class="vocab-title" id="vocabTitle" data-i18n="vocab.title">Vocabulary</h1>
        <span class="vocab-header-spacer"></span>
      </div>
      <div class="vocab-tabs" role="tablist">
        <button type="button" class="vocab-tab active" role="tab" data-tab="words" data-i18n="vocab.tab_words">Words</button>
        <button type="button" class="vocab-tab" role="tab" data-tab="phrases" data-i18n="vocab.tab_phrases">Phrases</button>
      </div>
      <div class="vocab-search-row">
        <input type="search" id="vocabSearchInput" class="vocab-search" placeholder="Search…" data-i18n-placeholder="vocab.search" autocomplete="off"/>
        <!-- 将来の CEFR / POS フィルタ用プレースホルダー (Phase V3 で有効化) -->
        <div class="vocab-filters" id="vocabFilters" aria-hidden="true">
          <!-- v1: 非表示。v3 で表示化 -->
        </div>
      </div>
      <div class="vocab-letters" id="vocabLetters" role="navigation" aria-label="A-Z jump">
        <!-- letters injected by JS -->
      </div>
    </div>
    <!-- Body -->
    <div class="vocab-body" id="vocabBody" role="tabpanel">
      <!-- rows injected by renderVocabWords / renderVocabPhrases -->
    </div>
  </div>
</section>
```

### (b) CSS の追加（`<style>` セクション末尾）

現状の `.vocab-modal` / `.vocab-card` 関連スタイルを削除し、次を追加:

```css
/* ---- Phase V: 語彙ページ ---- */
.vocab-page {
  padding: 0;
  min-height: calc(100vh - var(--topbar-h, 56px));
  background: var(--bg);
}
.vocab-page-inner {
  max-width: 820px;
  margin: 0 auto;
  padding: 0;
}
.vocab-header {
  position: sticky;
  top: 0;
  z-index: 10;
  background: var(--bg);
  padding: 16px 16px 8px;
  border-bottom: 1px solid var(--hair);
  display: flex;
  flex-direction: column;
  gap: 12px;
}
.vocab-header-top {
  display: flex;
  align-items: center;
  gap: 12px;
}
.vocab-back {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 8px;
  background: transparent;
  color: var(--ink);
  border: 1px solid var(--hair);
  cursor: pointer;
  font-size: 14px;
  flex-shrink: 0;
}
.vocab-back:hover { background: var(--surface-hover, #f6f6f6); }
.vocab-title {
  flex: 1;
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--ink);
  text-align: center;
}
.vocab-header-spacer { width: 60px; }  /* Back ボタンと視覚バランス */

.vocab-tabs {
  display: flex;
  gap: 0;
  border-radius: 10px;
  background: var(--surface-alt, #efefef);
  padding: 3px;
}
.vocab-tab {
  flex: 1;
  padding: 8px 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  color: var(--ink);
  font-weight: 500;
}
.vocab-tab.active {
  background: var(--bg);
  box-shadow: 0 1px 3px rgba(0,0,0,.08);
}

.vocab-search-row {
  display: flex;
  gap: 8px;
  align-items: center;
}
.vocab-search {
  flex: 1;
  padding: 10px 14px;
  border-radius: 10px;
  border: 1px solid var(--hair);
  font-size: 15px;
  background: var(--bg);
  color: var(--ink);
}
.vocab-search:focus {
  outline: none;
  border-color: var(--signal, #4a7cd6);
  box-shadow: 0 0 0 3px rgba(74,124,214,.15);
}

.vocab-letters {
  display: flex;
  flex-wrap: wrap;
  gap: 2px;
  justify-content: center;
  font-family: var(--mono, monospace);
  font-size: 12px;
}
.vocab-letters button {
  min-width: 24px;
  padding: 4px 6px;
  border: 1px solid transparent;
  background: transparent;
  color: var(--ink-muted, #666);
  cursor: pointer;
  border-radius: 4px;
}
.vocab-letters button:hover { background: var(--surface-hover, #f0f0f0); color: var(--ink); }

.vocab-body {
  padding: 8px 16px 40px;
}

/* --- 行レイアウト (Phase V3 の改良は後述) --- */
.vocab-row {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 8px;
  padding: 12px 8px;
  border-bottom: 1px solid var(--hair);
  align-items: center;
}
.vocab-row-main {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-width: 0;
}
.vocab-row-top { display: flex; align-items: baseline; gap: 10px; flex-wrap: wrap; }
.vocab-row-w { font-weight: 600; font-size: 16px; color: var(--ink); }
.vocab-row-ipas { font-family: var(--mono); font-size: 13px; color: var(--ink-muted, #666); }
.vocab-row-gloss { font-size: 13px; color: var(--ink); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.vocab-row-meta { display: flex; gap: 6px; align-items: center; flex-wrap: wrap; }
.vocab-row-actions {
  display: flex;
  gap: 8px;
  align-items: center;
  flex-shrink: 0;
}

/* --- Mobile: 検索を必ず表示、行を 2 段組に --- */
@media (max-width: 599px) {
  .vocab-header { padding: 12px 12px 6px; gap: 10px; }
  .vocab-title { font-size: 16px; }
  .vocab-body { padding: 4px 12px 40px; }
  .vocab-row-w { font-size: 15px; }
  .vocab-row-ipas { font-size: 12px; }
  .vocab-search { /* 必ず表示 (現状 <599px で非表示だった) */
    display: block;
  }
}
```

### (c) 既存 JS の container 参照を差し替え

以下の関数内で `#vocabModal`, `#vocabBody` などを参照している箇所を新 DOM 構造に合わせる。**関数のロジック本体は変更しない、参照 ID だけ:**

- `renderVocabWords(container)` の container 引数、または直接 `document.getElementById("vocabBody")` を使う既存記述をそのまま利用（ID `vocabBody` は新構造でも維持）
- `renderVocabPhrases()` 同上
- `renderVocabTab(tab)` 同上
- `openVocab()` / `closeVocab()` — 次 Phase (V2) で置き換えるので v1 では以下の暫定形で結線:

```javascript
function openVocab() {
  show("vocabPage", true);
  if (!vocabBuilt) { renderVocabTab(vocabTabCurrent || "words"); vocabBuilt = true; }
  applyI18nVocab();
}
function closeVocab() {
  show("vocabPage", false);
}
```

- `document.body.classList.add("scroll-locked")` の呼び出しがある場合は削除（ページ全体スクロールで OK）

### (d) topbar `#vocabBtn` のクリックハンドラ

現状 `openVocab()` を呼ぶ実装のまま Phase V1 では OK（Phase V2 で hash に置換）。

### (e) Escape キー・スクリム関連

以下は Phase V1 で削除:
- Escape キーで `closeVocab()` を呼ぶハンドラ
- `#vocabScrim` (背景暗転) の DOM と CSS
- `body.scroll-locked` CSS ルール（vocab 用途の分だけ）

## V1-3. 動作確認

1. アプリを起動、topbar の Vocab ボタンをクリック
2. **全画面表示** で語彙リストが表示される（モーダルではない）
3. Words / Phrases タブ切替が動作
4. 検索、A-Z ジャンプ、TTS ボタン、progress checks が動作
5. モバイル (`< 599px`) で **検索欄が表示される**
6. Back ボタンが暫定的にはまだ動作しない（Phase V2 で有効化）
7. ページスクロールが自然に動く（body scroll-lock なし）

## V1-4. コミット

```bash
git add index.html
git commit -m "refactor(vocab): migrate modal to independent page (#vocabPage)

- replace #vocabModal with #vocabPage section
- add sticky header layout
- restore mobile search visibility
- container IDs preserved (vocabBody) so existing render functions work
- back button placeholder (wired in Phase V2)"
```

---

# Phase V2 — Hash routing + Back ボタン結線

## V2-1. 目的

`#/vocab`, `#/vocab/phrases` の hash routing を導入。ブラウザの戻る/進む・URL 直接アクセス・ブックマークに対応。Menu ボタン (`#backTopBtn`) とは独立に動作。

## V2-2. 変更内容

**ファイル:** `index.html`

### (a) Router モジュール (新規、`<script>` セクション内)

`initApp` の前あたりに配置:

```javascript
// ============================================================
// Phase V2: Hash routing
// ============================================================
const ROUTES = {
  "": {
    onEnter: () => showSetupOrPractice(),
  },
  "vocab": {
    onEnter: () => showVocabView("words"),
  },
  "vocab/phrases": {
    onEnter: () => showVocabView("phrases"),
  },
};

function parseHash() {
  const raw = (location.hash || "").replace(/^#\/?/, "");
  return raw.split("?")[0];
}

function navigate(path) {
  const target = path ? "#/" + path : "#/";
  if (location.hash !== target) {
    location.hash = target;
  } else {
    // 既に同じ hash → 手動で route を再実行 (例: タブ切替)
    onRouteChange();
  }
}

function onRouteChange() {
  const path = parseHash();
  const route = ROUTES[path] || ROUTES[""];
  route.onEnter();
}

function showSetupOrPractice() {
  // vocab ページを閉じる
  show("vocabPage", false);
  // セッション進行中なら vocab から戻ってきた場合、練習画面のいずれかが表示された状態を維持
  // (S.queue > 0 なら現状のカード表示状態を尊重、なければ setup へ)
  if (S && S.queue && S.queue.length > 0) {
    // 進行中: 何もしない (前に表示していた card が残っている想定)
    return;
  }
  // 進行中でなければ setup を表示
  const setup = document.getElementById("setup");
  if (setup) show("setup", true);
}

function showVocabView(tab) {
  // 練習画面は隠す (セッション中でも vocab を全画面で見られるようにする)
  ["setup", "cardDecode", "cardEncode", "reveal", "summary", "modeBStudy", "modeBQuiz"].forEach(id => {
    show(id, false);
  });
  show("vocabPage", true);
  vocabTabCurrent = tab || "words";
  if (!vocabBuilt) {
    renderVocabTab(vocabTabCurrent);
    vocabBuilt = true;
  } else {
    renderVocabTab(vocabTabCurrent);
  }
  applyI18nVocab();
  // Vocab ページ用にトップにスクロール
  window.scrollTo(0, 0);
}

window.addEventListener("hashchange", onRouteChange);
```

### (b) `initApp()` 完了時に初回ルート適用

`initApp()` の末尾（各種データ load 完了後）に:

```javascript
async function initApp() {
  await loadLocale(LANG);
  await Promise.all([
    loadWordlist(), loadConnected(), loadWeak(), loadGuide()
  ]);
  // Start ボタン有効化などの既存処理
  // ...
  // Phase V2: 初回ルート判定 (直接 #/vocab を叩かれたケースに対応)
  onRouteChange();
}
```

### (c) topbar `#vocabBtn` を hash 遷移に切替

```javascript
// 現状: onclick="openVocab()"
// 変更後: onclick="navigate('vocab')"
document.getElementById("vocabBtn").addEventListener("click", (ev) => {
  ev.preventDefault();
  navigate("vocab");
});
```

もしくは HTML の `onclick` 属性を直接書き換え。

### (d) Back ボタン結線

```javascript
document.getElementById("vocabBackBtn").addEventListener("click", (ev) => {
  ev.preventDefault();
  // 独立: Menu ボタンとは無関係。Vocab ページから setup または practice に戻る。
  // history に vocab へ来る前の状態があればそれを尊重、なければ setup へ。
  if (history.length > 1 && document.referrer !== "") {
    history.back();
  } else {
    navigate("");
  }
});
```

**簡易版（history 判定なし、常に "" へ戻す方が確実）:**

```javascript
document.getElementById("vocabBackBtn").addEventListener("click", (ev) => {
  ev.preventDefault();
  navigate("");
});
```

Phase V2 では **簡易版で実装**（Naoya の合意: Menu と独立、常にセットアップ/直前 view へ）。

### (e) Words/Phrases タブ切替を hash と同期

```javascript
document.querySelectorAll(".vocab-tab").forEach(btn => {
  btn.addEventListener("click", (ev) => {
    const tab = btn.dataset.tab;
    if (!tab) return;
    // UI 側の active 反映
    document.querySelectorAll(".vocab-tab").forEach(b => b.classList.toggle("active", b === btn));
    // hash に反映（onRouteChange 経由でレンダリングも同期）
    navigate(tab === "phrases" ? "vocab/phrases" : "vocab");
  });
});
```

### (f) 旧関数のクリーンアップ

- `openVocab` / `closeVocab` は残しつつ内部を router 呼び出しに置き換え:
  ```javascript
  function openVocab() { navigate("vocab"); }
  function closeVocab() { navigate(""); }
  ```
- 他の場所からの `openVocab()` 呼び出しは影響なし

### (g) 練習中セッション状態の保護

**Naoya の意思:** プレイ中に Vocab を開いても Menu ボタンとは独立、Back でセッション画面へ戻る（練習継続）。ただし現状の練習画面と Vocab ページは相互排他的に切替となる。

現状の練習セッション state `S` は localStorage / メモリ上で維持されるので、Vocab を開いて閉じる操作でセッションは失われない。`showSetupOrPractice()` が `S.queue.length > 0` を確認してセッション画面を再表示する処理を持つ。

**ただし、練習画面のどの view (`cardDecode` / `cardEncode` / `reveal` / `modeBStudy` etc.) に戻すかは、現状の実装に依存する。** Cursor は現状の `S.appMode` / `S.dir` / 状態遷移を確認して、Back 時に適切な view を再表示する処理を `showSetupOrPractice()` に追加してほしい:

```javascript
function showSetupOrPractice() {
  show("vocabPage", false);
  if (S && S.queue && S.queue.length > 0) {
    // 前に表示していた練習 view を復元
    // ヒント: 現状 S に "現在表示中の view" を持っていなければ、
    // showCurrentCard() 相当の関数（既存で card を再描画する関数を探す）を呼ぶ
    if (typeof showCurrentCard === "function") {
      showCurrentCard();
    } else if (typeof renderCard === "function") {
      renderCard();
    }
    return;
  }
  show("setup", true);
}
```

## V2-3. 動作確認

| # | 操作 | 期待 |
|---|---|---|
| 1 | URL に `#/vocab` を直接入力 | Words タブが開く |
| 2 | URL に `#/vocab/phrases` を直接入力 | Phrases タブが開く |
| 3 | topbar Vocab ボタン | `#/vocab` に遷移、Words タブ |
| 4 | Words → Phrases タブ切替 | URL が `#/vocab/phrases` に変化 |
| 5 | Back ボタン | `#/` に戻る、セットアップ表示 |
| 6 | ブラウザ Back | `#/` に戻る |
| 7 | セットアップで Start → 練習中 → topbar Vocab | Vocab ページ表示 |
| 8 | 練習中 → Vocab → Back | 前の練習画面（card view）が再表示 |
| 9 | Menu ボタン (`#backTopBtn`) は現状通り動作 | ✓（独立） |

## V2-4. コミット

```bash
git add index.html
git commit -m "feat(vocab): hash routing (#/vocab, #/vocab/phrases) + back button

- Router module with hashchange listener
- topbar Vocab button navigates via hash
- Back button independent from Menu button (returns to setup or prior practice view)
- practice session state preserved when navigating to/from vocab"
```

---

# Phase V3 — UI 整備 (行レイアウト刷新 + フィルタプレースホルダー)

## V3-1. 目的

Naoya のフィードバック「モーダルであることで UI がぐちゃぐちゃ」を解消。ページ化を活かして以下を実施:

1. **行レイアウトを 2 段組に整理**（word + IPA + gloss を上下に分割、progress checks を右端に）
2. **CEFR バッジを Words タブでも表示**（現在は Phrases のみ）
3. **CEFR フィルタピルのプレースホルダー**を表示（v3 時点では disabled、v4 以降で有効化を想定）
4. **A-Z 圧縮**（横スクロール可能な単一行に）
5. **空状態・ローディング状態のデザイン**

## V3-2. 変更内容 (a): 行レンダリング関数の更新

**ファイル:** `index.html`

現状の `renderVocabWords()` 内で innerHTML を組み立てている箇所を見つけ、以下の構造に置き換える:

### 現状（推定）

```javascript
html += `<div class="vocab-row" data-word="${escAttr(w)}">
  <span class="vocab-w">${escHtml(w)}</span>
  <span class="vocab-ipas">${escHtml(ipas)}</span>
  <span class="vocab-gloss">${escHtml(gloss)}</span>
  <span class="vocab-pos-badge">${escHtml(pos)}</span>
  <span class="progress-checks">…</span>
  <button class="vocab-play">${SPEAKER_SVG}</button>
</div>`;
```

### 変更後

```javascript
const cefrLabel = itemCefrLabel(c);  // 既存関数を再利用（Phrases タブでの実装と同じ）
const cefrBadge = cefrLabel
  ? `<span class="vocab-cefr-badge vocab-cefr-${escAttr(cefrLabel)}">${escHtml(cefrLabel)}</span>`
  : "";

html += `<div class="vocab-row" data-word="${escAttr(w)}">
  <div class="vocab-row-main">
    <div class="vocab-row-top">
      <span class="vocab-row-w">${escHtml(w)}</span>
      <div class="vocab-row-meta">
        ${cefrBadge}
        ${pos ? `<span class="vocab-pos-badge">${escHtml(pos)}</span>` : ""}
      </div>
    </div>
    <div class="vocab-row-ipas">${escHtml(ipaDisplay)}</div>
    <div class="vocab-row-gloss">${escHtml(gloss)}</div>
  </div>
  <div class="vocab-row-actions">
    <span class="progress-checks" data-word="${escAttr(sessionItemKey(c))}">
      ${progressChecksHtml(c)}  <!-- 既存のヘルパを流用 or インライン展開 -->
    </span>
    <button class="vocab-play" type="button" data-word="${escAttr(w)}" aria-label="Play">
      ${SPEAKER_SVG}
    </button>
  </div>
</div>`;
```

**注意点:**

- `ipaDisplay` は現状の `ipas` (GA + RP を "/…/ · /…/" 形式で表示) をそのまま利用
- `sessionItemKey(c)` は現状の progress-checks 用キー
- `progressChecksHtml(c)` は現状の progress-checks 生成コードを関数化するか、インライン展開のまま

同じ変更を `renderVocabPhrases()` にも適用（`pos` → `type` バッジに置換）。

## V3-3. 変更内容 (b): CSS 詳細

```css
/* ---- Row 行の視覚整理 (V3) ---- */
.vocab-row {
  padding: 14px 8px;
  transition: background 0.1s ease;
}
.vocab-row:hover {
  background: var(--surface-hover, #fafafa);
}
.vocab-row-w {
  font-family: var(--sans, system-ui, sans-serif);
  font-weight: 600;
  font-size: 17px;
  color: var(--ink);
  letter-spacing: -0.01em;
}
.vocab-row-ipas {
  font-family: var(--mono, "SF Mono", monospace);
  font-size: 13px;
  color: var(--ink-muted, #666);
  letter-spacing: 0;
}
.vocab-row-gloss {
  font-size: 13px;
  color: var(--ink-strong, #222);
  line-height: 1.4;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  text-overflow: ellipsis;
}

/* Badges 統一デザイン */
.vocab-pos-badge, .vocab-type-badge {
  display: inline-block;
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--surface-alt, #eee);
  color: var(--ink-muted, #555);
  font-weight: 500;
  letter-spacing: 0.02em;
  text-transform: none;
}
.vocab-cefr-badge {
  display: inline-block;
  font-family: var(--mono);
  font-size: 10px;
  padding: 2px 7px;
  border-radius: 5px;
  font-weight: 700;
  letter-spacing: 0.04em;
}
.vocab-cefr-A1 { color: #0a7d3a; background: #e8f5ed; }
.vocab-cefr-A2 { color: #0f6ca8; background: #e6f2fa; }
.vocab-cefr-B1 { color: #b06400; background: #fbf1e0; }
.vocab-cefr-B2 { color: #a1252b; background: #faeaec; }

/* Actions (progress + play) を縦積みではなく横並び */
.vocab-row-actions {
  gap: 12px;
}

/* Play button */
.vocab-play {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: 1px solid var(--hair);
  background: var(--bg);
  color: var(--ink);
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  flex-shrink: 0;
}
.vocab-play:hover { background: var(--surface-hover, #f2f2f2); border-color: var(--ink); }
.vocab-play:disabled { opacity: 0.4; cursor: wait; }

/* Progress checks: 三行三列がすっきり見えるよう調整 */
.progress-checks {
  display: inline-flex;
  gap: 6px;
  align-items: center;
}
.pc-mode {
  display: inline-flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
}
.pc-slot {
  width: 8px;
  height: 8px;
  border: 1px solid var(--hair);
  border-radius: 2px;
  background: transparent;
  cursor: pointer;
  padding: 0;
}
.pc-slot[data-filled="1"] {
  background: var(--ink);
  border-color: var(--ink);
}

/* A-Z jump: 横スクロール可能な単一行 */
.vocab-letters {
  overflow-x: auto;
  flex-wrap: nowrap;
  padding: 2px 0;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;
}
.vocab-letters::-webkit-scrollbar { display: none; }
.vocab-letters button {
  flex-shrink: 0;
  min-width: 26px;
  height: 26px;
}
.vocab-letters button.active {
  color: var(--signal, #4a7cd6);
  font-weight: 700;
}

/* Empty / loading states */
.vocab-empty, .vocab-loading {
  padding: 60px 20px;
  text-align: center;
  color: var(--ink-muted, #888);
  font-size: 14px;
}
.vocab-empty svg { width: 48px; height: 48px; opacity: 0.3; margin-bottom: 12px; }

/* --- Mobile レイアウト調整 --- */
@media (max-width: 599px) {
  .vocab-row { padding: 12px 4px; gap: 6px; }
  .vocab-row-w { font-size: 16px; }
  .vocab-row-ipas { font-size: 12px; }
  .vocab-row-gloss { font-size: 12px; -webkit-line-clamp: 2; }
  .vocab-row-actions { gap: 8px; }
  .vocab-play { width: 32px; height: 32px; }
  .pc-slot { width: 7px; height: 7px; }
}

/* Filter placeholder area (v3: empty, v4+ will populate) */
.vocab-filters {
  display: none;  /* v3: not populated yet */
}
```

## V3-4. 変更内容 (c): CEFR フィルタピルのプレースホルダー DOM

DOM は Phase V1 で追加済 (`#vocabFilters`)。v3 では中身は空のまま (`display: none`)、`aria-hidden="true"`。将来 v4 以降で以下の内容を有効化する:

```html
<!-- Phase V4+ 想定 (今回は追加しない): -->
<div class="vocab-filters" id="vocabFilters">
  <button type="button" class="vocab-filter-pill active" data-cefr="all">All</button>
  <button type="button" class="vocab-filter-pill" data-cefr="A1">A1</button>
  <button type="button" class="vocab-filter-pill" data-cefr="A2">A2</button>
  <button type="button" class="vocab-filter-pill" data-cefr="B1">B1</button>
  <button type="button" class="vocab-filter-pill" data-cefr="B2">B2</button>
</div>
```

**この Phase V3 では追加しない。** DOM 上の存在（空 div）と CSS 定義だけ入れて、将来のためのプレースホルダーとする。

## V3-5. 変更内容 (d): Empty / Loading 状態

`renderVocabTab(tab)` の冒頭に:

```javascript
function renderVocabTab(tab) {
  vocabTabCurrent = tab;
  const body = document.getElementById("vocabBody");
  if (!body) return;

  // Loading state
  body.innerHTML = `<div class="vocab-loading">${escHtml(t("loading"))}</div>`;

  // Defer heavy render to next frame so loading state paints
  requestAnimationFrame(() => {
    if (tab === "phrases") renderVocabPhrases(body);
    else renderVocabWords(body);
    updateVocabTabActive(tab);
  });
}

function updateVocabTabActive(tab) {
  document.querySelectorAll(".vocab-tab").forEach(b => {
    b.classList.toggle("active", b.dataset.tab === tab);
  });
}
```

検索結果 0 件時の empty:

```javascript
// renderVocabWords / renderVocabPhrases の検索フィルタ後、空チェック
if (filtered.length === 0) {
  container.innerHTML = `<div class="vocab-empty">
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"/><path d="M21 21l-4.35-4.35"/></svg>
    <div>${escHtml(t("vocab.no_results"))}</div>
  </div>`;
  return;
}
```

## V3-6. 動作確認

| # | 項目 | 期待 |
|---|---|---|
| 1 | Words 行の 2 段組表示 (word/badges 上、IPA・gloss 下) | ✓ |
| 2 | CEFR バッジが Words タブで表示 (A1/A2/B1/B2 色分け) | ✓ |
| 3 | Progress checks が右端で縦 3 行 × 横 3 スロットで表示 | ✓ |
| 4 | Play ボタンが円形、明確 | ✓ |
| 5 | A-Z が横スクロール可能な単一行に収まる | ✓ |
| 6 | Sticky header がスクロール中も張り付く | ✓ |
| 7 | 検索 0 件時に empty state 表示 | ✓ |
| 8 | 初回タブ切替時に loading state が一瞬見える | ✓ |
| 9 | モバイル 375px で行が破綻しない | ✓ |
| 10 | モバイルで検索が常時表示 | ✓ |

## V3-7. コミット

```bash
git add index.html
git commit -m "style(vocab): two-line rows, unified badges, sticky header, empty/loading states

- rows: word/badges top line, IPA/gloss below, progress checks + play right
- CEFR badge now shown on Words tab (was Phrases-only)
- badge styles unified (POS + type + CEFR)
- A-Z letter row: horizontal scroll on overflow
- empty state with icon; loading state on tab switch
- mobile: always-visible search; tighter row padding
- filter placeholder DOM/CSS (populated in future phase)"
```

---

# Phase V4 — i18n 追加

## V4-1. 目的

Back ボタン用の i18n キーを 6 言語すべてに追加。

## V4-2. 変更内容

**変更ファイル:** `i18n/en.json`, `i18n/ja.json`, `i18n/ko.json`, `i18n/zh-Hant.json`, `i18n/zh-Hans.json`, `i18n/fil.json`

`vocab` オブジェクトに `back` キーを追加:

```json
"vocab": {
  "title": "Vocabulary",
  "tab_words": "Words",
  "tab_phrases": "Phrases",
  "search": "Search…",
  "no_results": "No results",
  "back": "Back"
}
```

### 各言語の値

| 言語 | 値 |
|---|---|
| en | `Back` |
| ja | `戻る` |
| ko | `뒤로` |
| zh-Hant | `返回` |
| zh-Hans | `返回` |
| fil | `Bumalik` |

## V4-3. 検証

```bash
python3 tools/validate_i18n.py
```

**期待出力:**
```
[A] UI 言語: ['en', 'fil', 'ja', 'ko', 'zh-Hans', 'zh-Hant']  キー数(en)=157
[B] 音素言語: [...]  (省略)
============================================================
OK: 不整合は検出されませんでした。
============================================================
```

キー数が 156 → 157 に増える（`vocab.back` 追加）。

## V4-4. コミット

```bash
git add i18n/*.json
git commit -m "i18n(vocab): add vocab.back key across 6 languages"
```

---

# Phase V5 — 検証・ドキュメント

## V5-1. 総合動作確認

以下シナリオを **PC + モバイル (375px)** で目視:

| # | シナリオ | 期待 |
|---|---|---|
| 1 | ページを新規タブで開く → URL `…/#/vocab` | Vocab ページの Words タブが直接表示 |
| 2 | topbar Vocab ボタンをクリック | `#/vocab` に遷移 |
| 3 | Words 4,828 語のリスト表示 | 全件レンダリング、100-300ms |
| 4 | 検索欄に "cat" と入力 (debounce 120ms) | 該当語だけに絞り込まれる |
| 5 | 検索欄に "xxxxx" と入力 | 空状態が表示 |
| 6 | A-Z の C をクリック | C で始まる語のグループへスクロール |
| 7 | 各行の play ボタンをクリック | TTS 再生 |
| 8 | Progress checks の点をクリック | 塗りつぶし変化、リロードしても保持 |
| 9 | Phrases タブに切替 | URL が `#/vocab/phrases` に変化、201 句表示 |
| 10 | Back ボタン | セットアップに戻る |
| 11 | セットアップで Start → 練習中 → Vocab → Back | 練習画面に戻る |
| 12 | Menu ボタン (`#backTopBtn`) は現状通り動作 | ✓ |
| 13 | 言語切替 (JA/ZH/KO/FIL) | ボタン・バッジ・タイトル全て翻訳される |
| 14 | Sticky header がスクロール中も張り付く | ✓ |
| 15 | モバイル 375px で行レイアウト破綻なし | ✓ |
| 16 | Vocab ページの `body` scroll-lock は解除 | ページ全体がスクロールする |

## V5-2. ドキュメント更新

### (a) `docs/PURPOSE.md` の changelog

```markdown
| 2026-07-XX | v3.23 | Phase V: 語彙ブラウザをモーダルから独立ページ (`#vocabPage`) に移設。Hash routing (`#/vocab`, `#/vocab/phrases`) 対応。UI 整備 (2段組行・sticky header・CEFR バッジ全タブ表示・A-Z 横スクロール・空/ローディング状態)。i18n `vocab.back` 追加。Menu ボタンと独立。 |
```

### (b) `docs/SPECIFICATION.md` の §4.8b 改訂

現状の「§4.8b 語彙ブラウザ（モーダル）」を「§4.8b 語彙ブラウザ（`#vocabPage`）」に改訂:

```markdown
### §4.8b 語彙ブラウザ (`#vocabPage`)

- **形態:** 独立セクション (`<section id="vocabPage" class="panel vocab-page">`)
- **遷移:** hash routing `#/vocab` (Words) / `#/vocab/phrases` (Phrases)
- **起動:** topbar `#vocabBtn` → `navigate("vocab")`
- **戻る:** `#vocabBackBtn` → `navigate("")` (セットアップ or 直前 view)
- **Menu ボタンとの関係:** 独立 (`#backTopBtn` は現状通り)
- **練習中の遷移:** 可能。セッション state `S` は維持され、Back で練習画面に復帰

**タブ:**
- Words: 全語彙 (現在 5,397 語)、CEFR バッジ表示
- Phrases: 連結句 201 (cs_type × Level 順)、CEFR バッジ表示

**Header (sticky):**
- Back ボタン / タイトル
- タブバー (Words / Phrases)
- 検索欄 (常時表示 — モバイル含む)
- A-Z ジャンプ (横スクロール可能)
- フィルタプレースホルダー (v3 時点で非表示、v4 以降で有効化予定)

**行:**
- 2 段組: [word + badges 上] / [IPA + gloss 下]
- 右端: progress checks (3 モード × 3 スロット) + play ボタン
- CEFR バッジ配色: A1 緑 / A2 青 / B1 橙 / B2 紅
```

### (c) 実装レポート `docs/cursor/reports/cursor-implementation-report-phase-v.md` 新規

```markdown
# Cursor 実装レポート — Phase V (語彙ページ化 + UI 整備)

- 実施日: 2026-07-XX
- 指示書: `docs/cursor/instructions/cursor-instructions-phase-v-vocab-page.md`
- ブランチ: `feat/phase-v-vocab-page`

## 1. 実施内容
### V1: モーダル → ページ DOM 移設
### V2: Hash routing + Back ボタン
### V3: UI 整備 (2段組行・sticky header・CEFR バッジ全タブ)
### V4: i18n `vocab.back` 6言語追加
### V5: 動作確認・ドキュメント

## 2. commit 一覧
(git log --oneline main..HEAD)

## 3. 変更ファイル
- `index.html`
- `i18n/*.json` (6)
- `docs/PURPOSE.md`
- `docs/SPECIFICATION.md`

## 4. スクリーンショット (可能なら)
- Before / After (Words モバイル)
- Before / After (Phrases デスクトップ)
```

## V5-3. コミット

```bash
git add docs/PURPOSE.md docs/SPECIFICATION.md docs/cursor/reports/cursor-implementation-report-phase-v.md
git commit -m "docs(phase-v): update SPEC §4.8b, changelog, implementation report"
```

## V5-4. マージ

```bash
git checkout main
git merge --no-ff feat/phase-v-vocab-page
git push origin main
```

---

## Q&A（Cursor 実装時の想定質問）

### Q1: 練習中に Vocab を開いて Back で戻る際、Mode B の途中や Reveal 画面から遷移した場合はどう復帰するか？

**A:** `showSetupOrPractice()` の中で `S.appMode` / `S.dir` / 現在の queue index などを見て、適切な view を再表示する。既存の「カード再描画関数」（`renderCard`, `showReveal`, `renderModeBStudy` など） を利用。もし Cursor が該当関数を特定できない場合、暫定的に**セッション state はメモリ上に保持されるので、`show("setup", false)` にして、練習画面のいずれかを show するだけでは復帰しない**場合がある。その場合、Cursor は現状 `renderCard()` などが「現在の `S.cur` に基づいて描画する」設計かを確認し、なければセッション state 復元処理を関数化して再利用する。

**代替方針（実装が難しい場合）:** 練習中の Vocab 遷移では **セッションを一時中断扱い**にせず「Vocab は常に別 view として重ねる」動作（既存モーダルと同じ挙動）を維持する。この場合、`showVocabView()` で他 view を hide せず、`vocabPage` の z-index を高くして重ねるだけ。**簡易実装:**
```javascript
function showVocabView(tab) {
  // 練習画面は hide せず、vocabPage を上に重ねる
  show("vocabPage", true);
  vocabTabCurrent = tab || "words";
  renderVocabTab(vocabTabCurrent);
  applyI18nVocab();
  window.scrollTo(0, 0);
}
// CSS で .vocab-page.hidden を display: none;、非 hidden で position: fixed; top: 0; left: 0; right: 0; bottom: 0; z-index: 100;
```

**Naoya への確認:** Cursor が難しいと判断したら「セッション復帰は複雑なので、Vocab を重ね表示する簡易実装で進めますか？」と Claude に相談してください。

### Q2: Hash が `#/vocab` の状態で URL 直アクセスされた場合、`initApp()` の非同期 load 完了前に `onRouteChange` が呼ばれると Vocab が空表示にならないか？

**A:** `initApp()` の末尾（`await Promise.all([...])` の後）に `onRouteChange()` を配置しているので、データ load 完了後に初回ルート判定が走る。空表示にはならない。

### Q3: `#/vocab?q=cat` のような検索クエリを URL に載せる案は？

**A:** 相談ブリーフ §4.4 で提案されていたが、Phase V ではスコープ外。Phase V の完了後に別タスクとして議論。

### Q4: Phase V3 の CEFR バッジ配色は既存のどのバッジと衝突しないか？

**A:** 既存の card-top `.cefr` バッジ (実装レポート `cursor-instructions-connected-weak-cefr-badges.md` 参照) と配色を揃えるべきだが、そちらが `--signal` / `--signal-soft` の単色運用のため、Phase V3 では **vocab 内だけの独立配色** として定義した。将来的に card-top と統一する場合は別タスク。

### Q5: Vocab ページ表示中に `startSession()` が呼ばれるとどうなる？

**A:** ユーザーが `#/vocab` に居るときに Start ボタンは押せない (setup が hidden)。ただし何らかのバグで `startSession()` が呼ばれると、`#/vocab` hash のまま練習画面が hidden で描画される可能性がある。防御として `startSession` 冒頭で `if (parseHash() !== "") navigate("");` を追加してもよい。**Phase V では防御コードは追加せず**、通常フローでは起こらない前提とする。

### Q6: モバイルでの sticky header がキーボード表示時にどう動くか？

**A:** iOS Safari では検索欄フォーカス時に viewport が縮み、sticky が意図しない位置に固定される場合がある。Phase V では暫定的に許容。もし実機で問題があれば別タスクで対応。

### Q7: `validate_i18n.py` の `[C] 未翻訳の疑い` に `vocab.back` が引っかかる可能性は？

**A:** `Back`（en）と `戻る` (ja) など全言語で異なる値を入れるので引っかからない。**もし zh-Hant と zh-Hans が同じ `返回` になっている点**が [C] で警告される可能性はあるが、`ALLOW_EN_IDENTICAL` は「en と一致」の判定なので zh 間の一致は無視される。問題なし。

### Q8: 過去に vocab を localStorage-lock していた場合 (もしあれば) はどうする？

**A:** `body.classList.add("scroll-locked")` は使わず、`#vocabPage` は独立セクションとして通常スクロールする。既存の `scroll-locked` CSS は他モーダル (`#settingsModal`, `#guideModal`) 用途に残す。

### Q9: `showVocabView()` で他 view を hide するが、hidden クラスと `show()` 関数の整合は？

**A:** 既存の `show(id, on)` 関数は `document.getElementById(id).classList.toggle("hidden", !on)` を実行する想定。Cursor は現状の `show()` 実装を確認して、`showVocabView` の hide list が漏れないよう補完してほしい。もし現状の view 一覧が `["setup", "cardDecode", "cardEncode", "reveal", "summary", "modeBStudy", "modeBQuiz"]` で不足があれば追加。

### Q10: Phase V3 の innerHTML 一括描画の性能は Phase V1 と比較して悪化しないか？

**A:** DOM 要素数は同じ（1 行あたり 1 DOM `.vocab-row`）。行内の子要素が増える（span/div 追加）が、CSS Grid 化により再レイアウトコストは同等。実測で 100-300ms 程度は維持できるはず。もし顕著に悪化する場合は Phase V6 で仮想スクロールを検討。

---

## スコープ外（明示的にやらないこと）

- **CEFR / POS フィルタの実装** — Phase V ではプレースホルダー DOM のみ、機能は別タスク
- **検索クエリの URL 化 (`?q=cat`)** — 別タスク
- **仮想スクロール / ページネーション** — 別タスク（現状 4,828 語一括描画で許容）
- **語彙詳細ページ (`#/vocab/word/{slug}`)** — 別タスク
- **Mode B "Vocabulary" ラベルとの rename** — 別タスク（相談ブリーフ §4.5）
- **アクセシビリティ強化 (skip link, aria structure)** — 別タスク
- **`vocab-cefr-badge` と card-top CEFR バッジの配色統一** — 別タスク

---

## 変更ファイル一覧

**変更:**
- `index.html` (V1: DOM 移設 / V2: routing / V3: UI 整備)
- `i18n/en.json`, `i18n/ja.json`, `i18n/ko.json`, `i18n/zh-Hant.json`, `i18n/zh-Hans.json`, `i18n/fil.json`
- `docs/PURPOSE.md`
- `docs/SPECIFICATION.md`

**新規:**
- `docs/cursor/reports/cursor-implementation-report-phase-v.md`
- `docs/cursor/instructions/cursor-instructions-phase-v-vocab-page.md`（この指示書のコピー）
