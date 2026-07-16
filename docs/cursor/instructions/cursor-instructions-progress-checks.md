---
id: pj-2026-07-10-659c
aliases:
- pj-2026-07-10-659c
title: Cursor 指示書 — 進捗チェック機能（3スロット × 3モード）
created: '2026-07-10'
---
# Cursor 指示書 — 進捗チェック機能（3スロット × 3モード）

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 想定 branch: `feat/progress-checks`
- 目的:
  1. **自分の学習の道標**として、単語ごとに進捗を可視化する
  2. **表示頻度の強弱**：チェックが少ない語を優先的に出題する

---

## 1. 仕様概要

各語彙エントリに対し、**3つの練習モードそれぞれで独立に 0〜3 のチェックを付与**できるようにする。

| モード ID | 意味 | 対応する S 状態 |
|---|---|---|
| `d` | IPA → word（IPA を読んで単語を書く） | `S.appMode==="a"` かつ `S.dir==="decode"` |
| `e` | word → IPA（単語を見て IPA を書く） | `S.appMode==="a"` かつ `S.dir==="encode"` |
| `l` | Listen & learn（音を聞いて学ぶ） | `S.appMode==="b"` |

- **チェックの操作は完全にユーザー起点のみ**。システムが自動で付けたり外したりしない
- 各モード最大 3 チェック。0/1/2/3 の 4 段階
- チェックが少ない語ほど、次のセッションで優先的に出題される（詳細は §4）

---

## 2. データモデル

localStorage キー: `ept_checks_v1`

```typescript
type Checks = {
  [wordKey: string]: {
    d?: number,  // 0-3, IPA→word progress
    e?: number,  // 0-3, word→IPA progress
    l?: number,  // 0-3, listen mode progress
  }
};
```

- **wordKey**: 既存 `sessionItemKey(c)` と同一（`c.id || c.w`）。連結音・弱形は `id`、単語は `w`
- 値が 0 または undefined のとき、キー自体をオブジェクトから削除してストレージを軽量に保つ
- 破損時（JSON parse エラー）は空オブジェクトにフォールバック

## 3. ヘルパー関数（追加）

`loadHist`/`saveHist` と同じパターンで新規追加:

```javascript
const LS_CHECKS_KEY = "ept_checks_v1";
const CHECK_MAX = 3;

function loadChecks(){
  try { return JSON.parse(localStorage.getItem(LS_CHECKS_KEY) || "{}") || {}; }
  catch(e) { return {}; }
}
function saveChecks(obj){
  try { localStorage.setItem(LS_CHECKS_KEY, JSON.stringify(obj)); } catch(e){}
}

function currentCheckMode(){
  if (S.appMode === "b") return "l";
  return S.dir === "encode" ? "e" : "d";
}

function getCheckCount(item, mode){
  if (!item || !mode) return 0;
  const key = sessionItemKey(item);
  const all = loadChecks();
  return (all[key] && all[key][mode]) || 0;
}

// value: 0..CHECK_MAX. 状態を絶対値でセット
function setCheckCount(item, mode, value){
  if (!item || !mode) return;
  const key = sessionItemKey(item);
  const v = Math.max(0, Math.min(CHECK_MAX, value|0));
  const all = loadChecks();
  if (!all[key]) all[key] = {};
  if (v === 0) delete all[key][mode];
  else all[key][mode] = v;
  if (!Object.keys(all[key]).length) delete all[key];
  saveChecks(all);
}

// 3スロットUI用: N番目のスロットをクリックした時の挙動
//   現状 N 個以上つけていれば N-1 に減らす（"3をクリックで2に戻す"）
//   そうでなければ N にする
function toggleCheckSlot(item, mode, slot /* 1..CHECK_MAX */){
  const cur = getCheckCount(item, mode);
  const next = (cur >= slot) ? (slot - 1) : slot;
  setCheckCount(item, mode, next);
  return next;
}
```

## 4. 頻度重み付け（セッションプール構築）

### 4-1. 重み計算

```javascript
// 現在の練習モードのチェック数に応じて、未マスター度を weight として返す
// 0 checks → 4, 1 check → 3, 2 checks → 2, 3 checks → 1
function frequencyWeight(item, mode){
  return Math.max(1, (CHECK_MAX + 1) - getCheckCount(item, mode));
}
```

### 4-2. 加重シャッフル

```javascript
// weightFn(item) が大きい要素ほど前方に来やすい確率的ソート
function weightedShuffle(arr, weightFn){
  return arr
    .map(x => ({ x, score: Math.random() / Math.max(0.1, weightFn(x)) }))
    .sort((a, b) => a.score - b.score)
    .map(o => o.x);
}
```

### 4-3. 既存関数への統合

`buildSessionPool` (L2223 付近) の最終出力に加重シャッフルを噛ませる。**既存の SRS/弱シンボル/コールドスタート等のロジックは維持**。

**変更箇所（3 箇所）:**

**(a) Mode B** (`S.appMode==="b"`):
```javascript
// 既存:
return shuffle(pool.map(w=>({...w,mbKind:"study"})));
// 変更後:
return weightedShuffle(
  pool.map(w=>({...w,mbKind:"study"})),
  it => frequencyWeight(it, "l")
);
```

**(b) 連結音タブ** (`S.tab==="connected"`):
```javascript
// 既存:
return shuffle(filteredCsPool().slice());
// 変更後: 現在のモード（decode/encode）に応じた重み
const mode = currentCheckMode();  // "d" or "e" (連結音は Mode A のみ)
return weightedShuffle(filteredCsPool().slice(), it => frequencyWeight(it, mode));
```

**(c) 通常語彙 Mode A**（`buildSessionQueue` の最終行）:
```javascript
// 既存:
return shuffle(out).slice(0,count);
// 変更後:
const mode = currentCheckMode();
return weightedShuffle(out, it => frequencyWeight(it, mode)).slice(0, count);
```

**重要:**
- **セッション途中でチェックしても現在の queue は再構築しない**（混乱を避ける）。次のセッション開始時から反映
- 「Play again」「Review misses only」で新セッションを組む時に反映される

## 5. UI 配置

### 5-1. 語彙ブラウザ（`renderVocabWords`, `renderVocabPhrases`）

各行の末尾（現在の再生ボタンの隣）に、**3モード分の進捗ドット行**を追加。

```
[word] [ipa] [gloss] [pos] [d:●●○] [e:●○○] [l:○○○] [🔊]
```

- 各モード 3 個の丸を表示（塗りつぶし = チェック済み、白抜き = 未チェック）
- **クリックで toggleCheckSlot を発火**、即座に再レンダリング
- ラベル: `d` = "IPA→W", `e` = "W→IPA", `l` = "🎧"（アイコンで省スペース）

**HTML 例:**
```html
<span class="progress-checks" data-word="${escAttr(sessionItemKey(c))}">
  <span class="pc-mode" data-mode="d" title="${escAttr(t("checks.mode_d"))}">
    <button class="pc-slot" data-slot="1" aria-label="1/3"></button>
    <button class="pc-slot" data-slot="2" aria-label="2/3"></button>
    <button class="pc-slot" data-slot="3" aria-label="3/3"></button>
  </span>
  <span class="pc-mode" data-mode="e" title="${escAttr(t("checks.mode_e"))}">…同上…</span>
  <span class="pc-mode" data-mode="l" title="${escAttr(t("checks.mode_l"))}">…同上…</span>
</span>
```

**CSS（既存の `--hair`, `--ink` 変数を活用）:**
```css
.progress-checks{display:inline-flex;gap:8px;align-items:center;margin-left:8px}
.pc-mode{display:inline-flex;gap:2px}
.pc-slot{width:10px;height:10px;border:1px solid var(--hair);border-radius:2px;background:#fff;cursor:pointer;padding:0}
.pc-slot[data-filled="1"]{background:var(--ink);border-color:var(--ink)}
.pc-slot:hover{border-color:var(--ink)}
```

**イベントハンドラ:**
```javascript
// vocabModal 内で 1 回だけデリゲート登録
$("vocabBody").addEventListener("click", (ev) => {
  const btn = ev.target.closest(".pc-slot");
  if (!btn) return;
  const modeEl = btn.closest(".pc-mode");
  const wrap = btn.closest(".progress-checks");
  if (!modeEl || !wrap) return;
  const wordKey = wrap.dataset.word;
  const mode = modeEl.dataset.mode;
  const slot = parseInt(btn.dataset.slot, 10);
  const item = PRESET.find(c => sessionItemKey(c) === wordKey) ||
               CONNECTED.find(c => sessionItemKey(c) === wordKey) ||
               WEAK.find(c => sessionItemKey(c) === wordKey);
  if (!item) return;
  toggleCheckSlot(item, mode, slot);
  // Re-render only this word's checks in place (see helper below)
  refreshChecksInDom(wrap, item);
});
```

**部分再描画ヘルパー**（全体再描画は避ける、パフォーマンス重視）:
```javascript
function refreshChecksInDom(wrap, item){
  ["d","e","l"].forEach(mode => {
    const count = getCheckCount(item, mode);
    wrap.querySelectorAll(`.pc-mode[data-mode="${mode}"] .pc-slot`).forEach(btn => {
      const slot = parseInt(btn.dataset.slot, 10);
      btn.setAttribute("data-filled", slot <= count ? "1" : "0");
    });
  });
}
```

### 5-2. Reveal 画面（`#reveal` セクション、正解表示時）

「Next」ボタンの直前に、**現在のモード分の 3 スロット**のみ表示（3 モード全部だと画面が混雑するため）。

```html
<div class="reveal-checks" id="revealChecks">
  <div class="rc-label" id="revealChecksLabel">Progress</div>
  <div class="pc-mode" data-mode="" data-word="">
    <button class="pc-slot" data-slot="1"></button>
    <button class="pc-slot" data-slot="2"></button>
    <button class="pc-slot" data-slot="3"></button>
  </div>
</div>
```

正解表示時 (`showReveal(cur)` / `renderReveal` 相当の箇所)で:
```javascript
const rcWrap = $("revealChecks");
const rcMode = rcWrap.querySelector(".pc-mode");
rcMode.dataset.word = sessionItemKey(cur);
rcMode.dataset.mode = currentCheckMode();
// slot 状態を反映
const count = getCheckCount(cur, currentCheckMode());
rcMode.querySelectorAll(".pc-slot").forEach(btn => {
  const s = parseInt(btn.dataset.slot, 10);
  btn.setAttribute("data-filled", s <= count ? "1" : "0");
});
```

### 5-3. Mode B Study画面（`#mbSMeaning` 内、「Reveal meaning」後の表示）

`#mbSNoteBlock` の下、`#mbSGotIt`（Next ボタン）の直前に同型の UI を追加。モードは `"l"` 固定。

---

## 6. i18n（`i18n/*.json` へ追加）

以下のキーを 6言語すべてに追加（英語のみ本指示書に記載、他言語は Claude が翻訳版を後日提供予定。当面は英語のまま英語以外の言語でも表示可）:

```json
"checks": {
  "progress": "Progress",
  "mode_d": "IPA → word",
  "mode_e": "word → IPA",
  "mode_l": "Listen"
}
```

## 7. 動作テスト（実装後の確認項目）

| # | 項目 | 期待 |
|---|---|---|
| 1 | 語彙ブラウザで単語をクリック → チェック増加 → リロード後も保持 | localStorage 反映 |
| 2 | チェック 3/3 の語を含むセッション再開 → その語の出題頻度が低下 | frequencyWeight 適用 |
| 3 | セッション中に Reveal 画面でチェックしても現在の queue は不変 | セッション中は再構築しない |
| 4 | Decode 方向で `d` にチェック、Encode 方向に切替 → `e` は独立（0のまま） | モード独立 |
| 5 | Mode B で `l` にチェック → Mode A では表示頻度に影響しない | モード独立 |
| 6 | 連結音タブでチェック → 単語タブの語彙とは別管理 | id/w キー整合 |
| 7 | localStorage を破損データで上書き → 空オブジェクトにフォールバック、エラーなし | 堅牢性 |
| 8 | 進捗ドットの表示ズレなし（既存 vocab-row レイアウトを崩さない） | CSS 側 |

## 8. スコープ外（明示的にやらないこと）

- サマリ画面（`#summary`）への進捗表示は本タスク外
- 進捗のクラウド同期・エクスポート機能は本タスク外
- 進捗リセット UI は本タスク外（開発者コンソールで `localStorage.removeItem("ept_checks_v1")` で対応）
- モード内で 3スロットを個別の「意味」で使い分ける機能は本タスク外（単なる 0-3 のカウンター扱い）

## 9. コミット

```bash
git add index.html i18n/en.json \
        docs/cursor/reports/cursor-implementation-report-progress-checks.md
git commit -m "feat: progress checks (3 slots × 3 modes) with frequency weighting"
```

## 10. 変更ファイル（想定）

- `index.html` — L831 (renderVocabWords), L884 (renderVocabPhrases), L516 付近 (reveal DOM), L444 付近 (Mode B DOM), L2194/L2223 付近 (session pool), 新規ヘルパー関数群
- `i18n/en.json` — checks キー追加
- （オプション）他 5 言語ファイル — 英語文言で暫定運用も可
