---
id: pj-2026-06-29-bf1f
aliases:
- pj-2026-06-29-bf1f
title: Cursor 指示書 — 語彙ブラウザ モーダル
created: '2026-06-29'
---
# Cursor 指示書 — 語彙ブラウザ モーダル

> 作成日: 2026-06-28
> 種別: 新機能実装
> 対象: `index.html`（単一HTML本体）、`i18n/*.json`（5言語）
> 前提: `wordlist_GA_a1a2_plus_phonics.json` に `def` フィールド追加済み（英語定義）

---

## 0. 機能概要・設計判断

アプリが管理する全語彙を一覧できるモーダルを追加する。既存の設定モーダル（`#settingsModal`）・ガイドモーダル（`#guideModal`）と同じパターンで実装。

| 設計項目 | 判断 |
|---|---|
| UI 形態 | **フルスクリーン系モーダル**（既存 `.modal` パターン。ガイドより幅広：max-width: 720px） |
| 起動ボタン | topbar の `#guideBtn`・`#settingsBtn` と並ぶ新ボタン（リストアイコン） |
| タブ | **Words**（wordlist 3,059件）/ **Phrases**（connected_speech 201句） |
| Words ソート | A→Z（case-insensitive ソート後、文字グループヘッダを挿入） |
| Phrases ソート | cs_type（linking → assimilation → elision）× level（L1→L3） |
| 検索 | Words タブのみ、テキスト入力でリアルタイムフィルタ（debounce 120ms） |
| 文字ジャンプ | Words タブのみ、A〜Z ボタンでスクロール |
| 意味表示 | `modeBDisplayGloss(c)` を流用（英語UIでは `def` / POS、他言語は各言語語義） |
| IPA 表示 | GA・RP の両方を常に表示（アクセント設定に関係なく参照情報として全表示） |
| パフォーマンス | 開いた時点で一括 HTML 生成（innerHTML）。再フィルタも一括再描画 |

---

## 1. i18n（新キー 5個・5言語）

全 `i18n/<lang>.json` に `vocab` セクションを追加。152キー → **157キー**。

```json
// i18n/en.json への追加例
"vocab": {
  "title": "Vocabulary",
  "tab_words": "Words",
  "tab_phrases": "Phrases",
  "search": "Search…",
  "no_results": "No results"
}
```

| キー | en | ja | ko | zh | fil |
|---|---|---|---|---|---|
| `vocab.title` | Vocabulary | 語彙リスト | 단어 목록 | 词汇表 | Talaan ng Bokabularyo |
| `vocab.tab_words` | Words | 単語 | 단어 | 单词 | Mga Salita |
| `vocab.tab_phrases` | Phrases | フレーズ | 구문 | 短语 | Mga Parirala |
| `vocab.search` | Search… | 検索… | 검색… | 搜索… | Maghanap… |
| `vocab.no_results` | No results | 見つかりません | 결과 없음 | 无结果 | Walang resulta |

追加後: `python3 tools/validate_i18n.py` → ERROR 0 を確認（157キー × 5言語）

---

## 2. DOM（追加・`index.html`）

### 2-1. topbar ボタン（`232–233` 行付近・`#guideBtn` の直前に挿入）

```html
<button class="topbtn vocab" id="vocabBtn" type="button" aria-label="Vocabulary">
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/>
    <line x1="8" y1="18" x2="21" y2="18"/>
    <line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/>
    <line x1="3" y1="18" x2="3.01" y2="18"/>
  </svg>
</button>
```

### 2-2. モーダル本体（既存の `#guideModal` 直後に追加）

```html
<div class="modal hidden" id="vocabModal" role="dialog" aria-modal="true" aria-labelledby="vocabTitle">
  <button class="modal-scrim" id="vocabScrim" type="button" aria-label="Close"></button>
  <div class="modal-card panel vocab-card">
    <!-- Head -->
    <div class="vocab-head">
      <h2 class="modal-title" id="vocabTitle">Vocabulary</h2>
      <button class="guide-close" id="vocabCloseBtn" type="button">Close</button>
    </div>
    <!-- Tab bar -->
    <div class="tabbar vocab-tabbar" role="tablist" id="vocabTabBar">
      <button class="opt" role="tab" data-vtab="words"   aria-pressed="true"  id="vocabTabWords"><span class="ot" id="vocabTabWordsT">Words</span></button>
      <button class="opt" role="tab" data-vtab="phrases" aria-pressed="false" id="vocabTabPhrases"><span class="ot" id="vocabTabPhrasesT">Phrases</span></button>
    </div>
    <!-- Words: search + letter jump -->
    <div id="vocabWordsCtrl">
      <input type="search" class="vocab-search" id="vocabSearch" placeholder="Search…" autocomplete="off" autocorrect="off" spellcheck="false">
      <div class="vocab-letters" id="vocabLetters"></div>
    </div>
    <!-- Scrollable body -->
    <div class="vocab-body" id="vocabBody"></div>
  </div>
</div>
```

---

## 3. CSS（`<style>` ブロックへ追加）

```css
/* ---- Vocab Modal ---- */
.vocab-card {
  width: min(100%, 720px);
  max-height: min(90vh, 860px);
  display: flex;
  flex-direction: column;
  padding: 16px 16px 12px;
}
.vocab-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 10px;
}
.vocab-tabbar {
  margin-bottom: 10px;
  flex-shrink: 0;
}
.vocab-search {
  width: 100%;
  border: 1.5px solid var(--hair);
  border-radius: 10px;
  padding: 10px 13px;
  font-size: 14px;
  font-family: var(--ui);
  color: var(--ink);
  background: #fff;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.vocab-search:focus { outline: none; border-color: var(--signal); }
.vocab-letters {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-bottom: 8px;
  flex-shrink: 0;
}
.vocab-letter-btn {
  border: 1px solid var(--hair);
  background: #fff;
  border-radius: 6px;
  padding: 3px 7px;
  font-family: var(--mono);
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  color: var(--muted);
  line-height: 1.4;
}
.vocab-letter-btn:hover { border-color: var(--signal); color: var(--signal); }
.vocab-body {
  overflow-y: auto;
  flex: 1;
  min-height: 0;
}
/* Letter group header in list */
.vocab-group-head {
  font-family: var(--mono);
  font-size: 10.5px;
  color: var(--faint);
  text-transform: uppercase;
  letter-spacing: .14em;
  padding: 12px 2px 5px;
  border-bottom: 1px solid var(--hair);
  margin-bottom: 2px;
  position: sticky;
  top: 0;
  background: var(--panel);
  z-index: 1;
}
/* Each word row */
.vocab-row {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 9px 2px;
  border-bottom: 1px solid var(--hair);
}
.vocab-row:last-child { border-bottom: none; }
.vocab-w {
  font-weight: 700;
  font-size: 14px;
  min-width: 90px;
  flex-shrink: 0;
}
.vocab-ipas {
  display: flex;
  flex-direction: column;
  gap: 1px;
  flex-shrink: 0;
  min-width: 110px;
}
.vocab-ipa-ga {
  font-family: var(--ipa);
  font-size: 13px;
  color: var(--signal);
  line-height: 1.3;
}
.vocab-ipa-rp {
  font-family: var(--ipa);
  font-size: 11.5px;
  color: var(--faint);
  line-height: 1.3;
}
.vocab-ipa-label {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--faint);
  letter-spacing: .06em;
  margin-right: 3px;
}
.vocab-gloss {
  flex: 1;
  font-size: 13px;
  color: var(--muted);
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.vocab-pos {
  font-family: var(--mono);
  font-size: 9.5px;
  color: var(--faint);
  flex-shrink: 0;
  white-space: nowrap;
}
.vocab-play {
  border: 1px solid var(--hair);
  background: #fff;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  padding: 0;
  cursor: pointer;
  color: var(--signal);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: border-color .15s, background .15s;
}
.vocab-play:hover { border-color: var(--signal); background: var(--signal-soft); }
.vocab-play svg { width: 14px; height: 14px; }
/* Phrases tab extras */
.vocab-type-badge {
  font-family: var(--mono);
  font-size: 9px;
  font-weight: 700;
  padding: 2px 6px;
  border-radius: 6px;
  flex-shrink: 0;
  letter-spacing: .04em;
  text-transform: uppercase;
}
.vocab-type-linking    { background: #ddf4ff; color: #0550ae; }
.vocab-type-assimilation { background: #fff3cd; color: #9a5700; }
.vocab-type-elision    { background: #fde8e8; color: #cf222e; }
.vocab-level {
  font-family: var(--mono);
  font-size: 9px;
  color: var(--faint);
  flex-shrink: 0;
}
.vocab-no-results {
  text-align: center;
  padding: 40px 16px;
  color: var(--faint);
  font-size: 13px;
  font-family: var(--mono);
}
@media (max-width: 520px) {
  .vocab-pos { display: none; }
  .vocab-ipas { min-width: 90px; }
  .vocab-w { min-width: 70px; font-size: 13px; }
}
```

---

## 4. JavaScript（`<script>` ブロックへ追加）

### 4-1. 状態変数（既存変数群の近く）

```js
let vocabTabCurrent = "words";   // "words" | "phrases"
let vocabBuilt = false;          // 一度だけ HTML を生成
let vocabSearchTimer = null;
```

### 4-2. 開閉関数

```js
function openVocab() {
  show("vocabModal", true);
  document.body.classList.add("scroll-locked");
  if (!vocabBuilt) {
    buildVocabLetterBar();
    renderVocabTab("words");
    vocabBuilt = true;
  }
  applyI18nVocab();  // タイトル・タブ名を現在言語で更新
}

function closeVocab() {
  show("vocabModal", false);
  document.body.classList.remove("scroll-locked");
}

function applyI18nVocab() {
  $("vocabTitle").textContent      = t("vocab.title");
  $("vocabTabWordsT").textContent  = t("vocab.tab_words");
  $("vocabTabPhrasesT").textContent= t("vocab.tab_phrases");
  $("vocabSearch").placeholder     = t("vocab.search");
  // 言語変更時に再描画が必要
  if (vocabBuilt) {
    vocabBuilt = false;
    buildVocabLetterBar();
    renderVocabTab(vocabTabCurrent);
    vocabBuilt = true;
  }
}
```

### 4-3. Words: A〜Z ジャンプバー生成

```js
function buildVocabLetterBar() {
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
  $("vocabLetters").innerHTML = letters.map(l =>
    `<button class="vocab-letter-btn" data-letter="${l}" type="button">${l}</button>`
  ).join("");
}
```

### 4-4. Words タブ HTML 生成

```js
function renderVocabWords(query = "") {
  const q = query.trim().toLowerCase();
  // Case-insensitive A→Z sort
  const sorted = [...PRESET].sort((a, b) => a.w.toLowerCase().localeCompare(b.w.toLowerCase()));
  const filtered = q ? sorted.filter(c => c.w.toLowerCase().includes(q)) : sorted;

  if (!filtered.length) {
    $("vocabBody").innerHTML = `<div class="vocab-no-results">${t("vocab.no_results")}</div>`;
    return;
  }

  const SPEAKER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;

  let html = "";
  let curLetter = "";

  filtered.forEach(c => {
    const firstLetter = c.w[0].toUpperCase();
    const letter = /[A-Z]/.test(firstLetter) ? firstLetter : "#";

    if (!q && letter !== curLetter) {
      curLetter = letter;
      html += `<div class="vocab-group-head" data-group="${letter}" id="vocab-group-${letter}">${letter}</div>`;
    }

    const gaIpa  = c.ipa  || "";
    const rpIpa  = c.rp_ipa || "";
    const gloss  = vocabDisplayGloss(c);
    const pos    = posLabel(c.pos);
    const posStr = pos && pos !== "—" ? `<span class="vocab-pos">${pos}</span>` : "";
    const rpLine = rpIpa && rpIpa !== gaIpa
      ? `<span class="vocab-ipa-rp"><span class="vocab-ipa-label">RP</span>${rpIpa}</span>`
      : "";

    html += `<div class="vocab-row">
      <span class="vocab-w">${escHtml(c.w)}</span>
      <span class="vocab-ipas">
        <span class="vocab-ipa-ga"><span class="vocab-ipa-label">GA</span>${gaIpa}</span>
        ${rpLine}
      </span>
      <span class="vocab-gloss">${escHtml(gloss)}</span>
      ${posStr}
      <button class="vocab-play" type="button" data-vw="${escAttr(c.w)}" aria-label="${t('listen')}">${SPEAKER_SVG}</button>
    </div>`;
  });

  $("vocabBody").innerHTML = html;
}

function vocabDisplayGloss(c) {
  if (!c || !c.gloss) return c ? c.w : "";
  if (LANG === "en" && c.gloss.en === c.w) {
    return c.def || ("(" + (posLabel(c.pos) || "") + ")");
  }
  return c.gloss[LANG] || c.gloss.en || c.w;
}

function escHtml(s) {
  return String(s || "").replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;");
}
function escAttr(s) {
  return String(s || "").replace(/"/g,"&quot;");
}
```

### 4-5. Phrases タブ HTML 生成

```js
function renderVocabPhrases() {
  const TYPE_ORDER = ["linking", "assimilation", "elision"];
  const sorted = [...CONNECTED].sort((a, b) => {
    const ti = TYPE_ORDER.indexOf(a.cs_type) - TYPE_ORDER.indexOf(b.cs_type);
    if (ti !== 0) return ti;
    return (a.level || 0) - (b.level || 0);
  });

  const SPEAKER_SVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/></svg>`;

  let html = "";
  sorted.forEach(c => {
    const gaIpa = c.ipa  || "";
    const rpIpa = c.rp_ipa || "";
    const gloss = c.gloss ? (c.gloss[LANG] || c.gloss.en || c.w) : c.w;
    const rule  = csRuleText(c);
    const type  = c.cs_type || "";
    const level = c.level || "";

    const rpLine = rpIpa && rpIpa !== gaIpa
      ? `<span class="vocab-ipa-rp"><span class="vocab-ipa-label">RP</span>${rpIpa}</span>`
      : "";

    html += `<div class="vocab-row">
      <span class="vocab-w" style="min-width:120px">${escHtml(c.w)}</span>
      <span class="vocab-ipas" style="min-width:130px">
        <span class="vocab-ipa-ga"><span class="vocab-ipa-label">GA</span>${gaIpa}</span>
        ${rpLine}
      </span>
      <span class="vocab-gloss" title="${escAttr(rule)}">${escHtml(gloss)}${rule ? `<span style="color:var(--faint);font-size:11px;margin-left:5px">${escHtml(rule)}</span>` : ""}</span>
      <span class="vocab-type-badge vocab-type-${escAttr(type)}">${escHtml(type)}</span>
      <span class="vocab-level">L${level}</span>
      <button class="vocab-play" type="button" data-vipa="${escAttr(gaIpa)}" data-vconn="1" aria-label="${t('listen')}">${SPEAKER_SVG}</button>
    </div>`;
  });

  $("vocabBody").innerHTML = html || `<div class="vocab-no-results">${t("vocab.no_results")}</div>`;
}
```

### 4-6. タブ切替・制御

```js
function renderVocabTab(tab) {
  vocabTabCurrent = tab;
  // タブボタンの状態
  document.querySelectorAll("#vocabTabBar .opt").forEach(b => {
    b.setAttribute("aria-pressed", b.dataset.vtab === tab ? "true" : "false");
  });
  // Words/Phrases 固有コントロールの表示切替
  show("vocabWordsCtrl", tab === "words");
  // 本体描画
  if (tab === "words") {
    $("vocabSearch").value = "";
    renderVocabWords();
  } else {
    renderVocabPhrases();
  }
  $("vocabBody").scrollTop = 0;
}
```

### 4-7. イベント登録（既存イベント登録のまとめの近く）

```js
// Vocab open/close
$("vocabBtn").addEventListener("click", openVocab);
$("vocabCloseBtn").addEventListener("click", closeVocab);
$("vocabScrim").addEventListener("click", closeVocab);

// Tab switch
document.querySelectorAll("#vocabTabBar .opt").forEach(b => {
  b.addEventListener("click", () => renderVocabTab(b.dataset.vtab));
});

// Search (debounce)
$("vocabSearch").addEventListener("input", e => {
  clearTimeout(vocabSearchTimer);
  vocabSearchTimer = setTimeout(() => renderVocabWords(e.target.value), 120);
});

// Letter jump
$("vocabLetters").addEventListener("click", e => {
  const btn = e.target.closest(".vocab-letter-btn");
  if (!btn) return;
  const target = document.getElementById("vocab-group-" + btn.dataset.letter);
  if (target) target.scrollIntoView({ behavior: "smooth", block: "start" });
});

// Speaker buttons (event delegation on vocab body)
$("vocabBody").addEventListener("click", e => {
  const btn = e.target.closest(".vocab-play");
  if (!btn) return;
  if (btn.dataset.vconn) {
    speak(btn.dataset.vipa, { connected: true });
  } else if (btn.dataset.vw) {
    speak(btn.dataset.vw);
  }
});

// Escape key
document.addEventListener("keydown", e => {
  if (e.key === "Escape" && !$("vocabModal").classList.contains("hidden")) closeVocab();
});
```

### 4-8. 言語変更時の再描画

既存の `setLang()` / `applyI18n()` の末尾に追加:
```js
// 語彙ブラウザが開いている場合は再描画
if (!$("vocabModal").classList.contains("hidden")) {
  vocabBuilt = false;
  buildVocabLetterBar();
  renderVocabTab(vocabTabCurrent);
  vocabBuilt = true;
  applyI18nVocab();
}
```

---

## 5. 補足設計メモ

### Words タブ / Phrases タブの分類根拠
- **Words（3,059件）**: `wordlist_GA_a1a2_plus_phonics.json` の全エントリ。スペースなし（短縮形 `aren't` 含む）
- **Phrases（201件）**: `connected_speech.json` のフレーズ（複数語）
- `CONNECTED` 配列は既にメモリにロード済み（`loadConnected()` で `connectedReady = true` 後）

### パフォーマンス
- Words 3,059件: `innerHTML` 一括生成で初期 ～100ms 以内（許容範囲）
- 検索フィルタ: `renderVocabWords(query)` を再呼び出し（DOM 全再生成）。3kなら debounce 120ms で問題なし
- `PRESET` はすでにメモリにあるため追加フェッチなし

### `dataReady()` との関係
- モーダルは `wordlistReady` と `connectedReady` を前提にするが、アプリ起動後即ロードされるため通常問題ない
- 安全策: `openVocab()` の先頭で `if (!wordlistReady) return;` は不要（ボタン自体は起動後に現れるため）

### gloss の `def` フィールド
- `vocabDisplayGloss(c)` 関数が `LANG === "en"` 時に `c.def` を優先（`modeBDisplayGloss` と同パターン）
- `def` が無い場合は `(noun)` 等の品詞表示にフォールバック

---

## 6. 検証 / DoD

```bash
python3 tools/validate_i18n.py   # ERROR 0（157キー × 5言語）
```

実機:
- [ ] トップバーにリストアイコンボタンが表示される
- [ ] タップで語彙ブラウザモーダルが開く / ×・背景クリック・Escで閉じる
- [ ] Words タブ: A→Z ソートで 3,059語が表示される
- [ ] Words タブ: 各行に 単語 / GA IPA / RP IPA / 意味 / 品詞 / スピーカーが表示される
- [ ] Words タブ: RP IPAが GA と異なる語（bird 等）でRP欄が表示される
- [ ] Words タブ: スピーカーボタンで音声が再生される
- [ ] Words タブ: 検索ボックスでリアルタイムフィルタ
- [ ] Words タブ: A〜Z ボタンで該当文字グループへスクロール
- [ ] Phrases タブ: 201句が linking/assimilation/elision × L1-L3 順で表示
- [ ] Phrases タブ: 色付きタイプバッジ（青=linking / 黄=assimilation / 赤=elision）
- [ ] Phrases タブ: スピーカーで connected TTS 再生（GA固定）
- [ ] 英語 UI: 意味が `def` フィールドの定義文で表示（例: `boat` → "A small watercraft…"）
- [ ] 日本語 UI: 意味が日本語語義で表示
- [ ] 言語切替後に意味列が新言語で更新される
- [ ] モバイル（~375px）: 品詞列が非表示になり横幅に収まる
- [ ] `validate_i18n.py` ERROR 0

---

## 7. 更新ファイル

| ファイル | 操作 |
|---|---|
| `index.html` | DOM（ボタン・モーダル）+ CSS + JS |
| `i18n/en.json` / `ja.json` / `zh.json` / `ko.json` / `fil.json` | `vocab.*` 5キー追加 |
| `docs/SPECIFICATION.md` | 語彙ブラウザを反映 |
| `docs/cursor-vocab-browser.md` | 指示書コピー |

---

## 8. Claude 申し送り

- `CONNECTED` は既存変数。`PRESET` も既存。両者はアプリ起動時にロード済みのため、ブラウザ開口時に追加フェッチ不要
- Phrases タブの TTS: `speak(ipa, {connected: true})` を使用（`fetchAudioFromGas` 内で `?phrase=<ipa>&accent=ga` に変換済み）
- i18n キー `vocab.*` の追加に伴い `validate_i18n.py [A]` が 157キーを期待するようになるため、**5言語ファイルすべてに追加すること**（`fil.json` を忘れない）
- 将来: CEFRフィルタ（A1/A2）・品詞フィルタ・お気に入り機能などを追加可能。現状は絞り込みを検索のみに限定して実装を最小化
