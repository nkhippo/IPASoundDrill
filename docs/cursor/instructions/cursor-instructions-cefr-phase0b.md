---
id: pj-2026-07-07-bd43
aliases:
- pj-2026-07-07-bd43
title: 'Cursor 指示書 — CEFR Phase 0-b: Mode A への CEFR フィルタ UI 配線 + Mode B 空バンド対応'
created: '2026-07-07'
---
# Cursor 指示書 — CEFR Phase 0-b: Mode A への CEFR フィルタ UI 配線 + Mode B 空バンド対応

> 作成日: 2026-07-07
> 対象リポジトリ: `nkhippo/IPASoundDrill`（`main` ブランチ）
> 前提: Phase 0-a（`cursor-instructions-cefr-phase0a.md`）が完了・push 済み、および zh 分離（`cursor-instructions-zh-split.md`）が完了・push 済み。両方が main に入った状態から着手すること。
> ゴール: Mode A の設定に CEFR レベル複数選択フィルタを追加、Mode B の空バンド問題を修正、C1 を UI から非表示化。

---

## 0. Naoya 確定の設計判断（着手前の必読）

Phase 0-b の実装方針について、以下 6 項目は Naoya と Claude で確定済みです。実装中に判断で迷ったらこの表に戻ってください:

| # | 項目 | 決定 |
|---|---|---|
| D1 | UI 選択の形式 | **複数選択**（トグル可能ピル UI） |
| D2 | C1 ラベルの扱い | **非表示**（i18n キーは残置） |
| D3 | Mode B 空バンド対応 | **`refreshVocabBandUnlock()` を空プールならスキップ** |
| D4 | フォニックス軸との関係 | **既存 `regField` を維持、新規軸は作らない**（⚠️ 2026-07-07 訂正: 詳細は「0-1. D4 の訂正」セクション参照） |
| D5 | デフォルト CEFR 選択 | **A1 と A2 がチェック済み**、B1 はオフ |
| D6 | i18n キー方針 | 既存 `lvl.all` は削除、`lvl.a1`/`a2` を新設、`b1`/`b2`/`c1` は既存流用（`b2`/`c1` はキーのみ残置し UI 非表示） |

### D4 の重要な帰結

`reg=regular` を選択すると `w.grp` を持つ語のみ = 全て `src: phonics` = 全て `cefr === null`（Phase 0-a 後）となるため、CEFR フィルタと組み合わせると常に 0 語になります。これは:

- 「フォニックス練習 = CEFR とは無関係な軸」の意図通り
- UI では **`reg === "regular"` 選択時に CEFR フィルタフィールドを hidden にする**（既存 `grpField` が `reg === "regular"` 時のみ表示される、その逆パターン）

---

## 0-1. 【重要】D4 の訂正（2026-07-07、着手前に必ず読むこと）

**上記 D4 の前提は誤りでした。** Phase 0-a の 652 語 `cefr` null 化は、CEFR-J 一次データとの照合により誤った前提に基づくものと判明し、既に `docs/cursor-instructions-cefr-phase0a-revert.md` で復元済みです（`main` に反映済み）。

復元後のデータを検証した結果、`w.grp`（綴りパターン分類）を持つ語は **1,490語あり、CEFR 軸で明確に分かれています**:

| src | grp を持つ語数 | CEFR |
|---|---:|---|
| `both` | 838語 | A1 (520) / A2 (318) |
| `phonics` | 652語 | B1 (322) / B2 (330) |

つまり `reg=regular` の語彙プールは CEFR と無関係ではなく、**A1/A2 の基礎フォニックス語と B1/B2 のより高度な綴りパターン語が混在**しています。したがって:

### 修正後の設計

**CEFR フィルタは `reg` の値によらず常に適用する。** `reg=regular` 時に CEFR フィールドを非表示にする処理（D4 の元の記述、および後述セクション 2-1・3-3・3-6 の該当箇所）は**すべて撤回**します。

### 修正後の実測プールサイズ

| reg | grp | CEFR選択 | pool数 |
|---|---|---|---:|
| all | all | A1,A2 | 2,382 |
| all | all | A1 のみ | 1,187 |
| all | all | A1,A2,B1 | 2,729 |
| all | all | B1 のみ | 347 |
| **regular** | all | **A1,A2** | **838** |
| **regular** | all | **A1,A2,B1** | **1,160** |
| **regular** | all | **B1 のみ** | **322** |
| regular | short | A1,A2 | 295 |
| irregular | all | A1,A2 | 1,544 |

この表が、本指示書全体（特にセクション 2、3、6）における正しい期待値です。以降のセクションで「CEFR フィールドを reg=regular 時に非表示にする」という記述が出てきた場合は、**その部分は無視し、常に表示・常にフィルタ適用**という本セクションの結論を優先してください。

---

## 1. スコープと非スコープ

### スコープ

1. HTML: CEFR フィルタフィールドの新設（`cefrField`、複数選択ピル UI）
2. JS: `filteredPool()` に CEFR フィルタ適用ロジック追加
3. JS: `updateSetupFields()` に `cefrField` の表示制御追加（常に表示、`reg` の値による非表示制御はしない。2026-07-07 訂正）
4. JS: `S.cefrLevels`（Set）の状態管理と初期値
5. JS: `refreshVocabBandUnlock()` の空プールスキップ修正（Mode B の空 B2 バンド対応）
6. JS: 状態オブジェクト `S` の初期化拡張（`cefrLevels`）
7. i18n: 全 6 言語（en/ja/ko/fil/zh-Hant/zh-Hans）の `lvl.*` セクション更新
8. i18n: `tools/validate_i18n.py` の許可キー更新（必要なら）
9. ドキュメント: `docs/PURPOSE.md` の依存表・変更履歴、`docs/DESIGN.md`、`docs/SPECIFICATION.md`

### 非スコープ（絶対に触らないこと）

- Mode B の CEFR フィルタ配線（Mode B は既存の自動バンド進行を維持、D3 の空バンドスキップのみ）
- 連結句/弱形の CEFR 対応（そもそも該当データに CEFR フィールドなし）
- 新規 B1/B2 データの追加（Phase 1/2 のスコープ）
- `set.*` i18n キーの配線（D4 により今回は使用しない）
- 新規のフォニックス軸 UI

---

## 2. HTML 変更（`index.html`）

### 2-1. CEFR フィルタフィールドの新設

`focusField`（音素フォーカス、約 L327）の直前に以下のブロックを挿入してください。位置は「Direction」の直後、「Customize filters」トグルの手前です。デフォルト表示（Advanced Filters に含めず、基本設定として常時表示）。

**新設ブロック:**

```html
<div class="field" id="cefrField">
  <div class="flabel" id="flabelCefr">Level</div>
  <div class="pills" id="cefrPills">
    <button class="pill" data-cefr="A1" aria-pressed="true" id="cefrA1">A1</button>
    <button class="pill" data-cefr="A2" aria-pressed="true" id="cefrA2">A2</button>
    <button class="pill" data-cefr="B1" aria-pressed="false" id="cefrB1">B1</button>
  </div>
  <div class="countnote" id="cefrNote"></div>
</div>
```

**注意点:**
- 3 つのピル（A1, A2, B1）のみ。B2 と C1 は今回のリリースで非表示（データが 0 語 / 未整備のため）
- `data-cefr` の値は wordlist の `cefr` フィールドと同じ文字列（`A1` / `A2` / `B1`）
- `aria-pressed="true"` が 2 つあることに注意（A1 と A2 がデフォルト選択、複数選択 UI であることを ARIA 的に示す）
- `pills` クラスは既存の pill UI と同じスタイル。既存 `pill[aria-pressed="true"]` の CSS がそのまま適用される
- 挿入位置は「Direction」（`data-dir` ボタン群）と「Customize filters」トグル（`wordsFilterToggle`）の間

### 2-2. 挿入位置の視覚図

```
[Practice mode]    ← 既存 tab
[Learning mode]    ← 既存 mode
[Direction]        ← 既存 dir
[Level] ★ 新設      ← ここに cefrField を追加
[Customize filters ▼]  ← 既存トグル
  ├─ [Phoneme focus]  ← 既存 focusField
  ├─ [Spelling pattern]  ← 既存 regField
  └─ [Spelling pattern group]  ← 既存 grpField（reg=regular 時のみ表示）
```

---

## 3. JavaScript 変更（`index.html` 内）

### 3-1. 状態オブジェクト `S` に `cefrLevels` を追加（約 L1166）

#### 現行

```js
let S={appMode:localStorage.getItem("app_mode")||"a",tab:"words",csFilter:"all",csLevel:"all",dir:"decode",focus:"all",reg:"all",grp:"all",queue:[],idx:0,correct:0,weak:{},missed:[],cur:null,curCarrier:null,revealed:false,built:[],mbPhase:"mcq",mbQuiz:null};
```

#### 変更後

```js
let S={appMode:localStorage.getItem("app_mode")||"a",tab:"words",csFilter:"all",csLevel:"all",dir:"decode",focus:"all",reg:"all",grp:"all",cefrLevels:new Set(["A1","A2"]),queue:[],idx:0,correct:0,weak:{},missed:[],cur:null,curCarrier:null,revealed:false,built:[],mbPhase:"mcq",mbQuiz:null};
```

**設計注記:**
- `Set` を使う理由: 複数選択の O(1) メンバーシップテスト、順序非重要
- 初期値 `["A1","A2"]` = D5 決定
- 既存の `S.reg` / `S.focus` などが localStorage に保存されていないのと同じく、`cefrLevels` も localStorage には**保存しない**（既存パターン踏襲、セッション毎リセット）

### 3-2. `filteredPool()` に CEFR フィルタを追加（約 L1320）

#### 現行

```js
function filteredPool(){
  let p=PRESET.slice();
  if(S.reg==="regular")p=p.filter(w=>w.grp);
  else if(S.reg==="irregular")p=p.filter(w=>!w.grp);
  if(S.reg==="regular"&&S.grp!=="all")p=p.filter(w=>w.grp===S.grp);
  if(S.focus==="traps")p=p.filter(hasTrapPhoneme);
  else if(S.focus==="weak")p=p.filter(matchesWeakFocus);
  else if(S.focus==="letters")p=p.filter(w=>w.src==="letter");
  else if(S.focus==="contractions")p=p.filter(w=>w.src==="contraction");
  else if(S.focus==="irregular")p=p.filter(w=>w.src==="irregular_verb"||w.src==="irregular_plural");
  else if(S.focus==="casual")p=p.filter(w=>w.src==="casual");
  return p;
}
```

#### 変更後（**2026-07-07 訂正版**: CEFR フィルタは reg の値によらず常に適用）

```js
function filteredPool(){
  let p=PRESET.slice();
  if(S.reg==="regular")p=p.filter(w=>w.grp);
  else if(S.reg==="irregular")p=p.filter(w=>!w.grp);
  if(S.reg==="regular"&&S.grp!=="all")p=p.filter(w=>w.grp===S.grp);
  // CEFR filter: always applied regardless of S.reg. Both "both"-src words
  // (A1/A2, has w.grp) and "phonics"-src words (B1/B2, has w.grp) carry
  // genuine CEFR levels — confirmed against the CEFR-J primary source on
  // 2026-07-07 — so the phonics/regular-pattern axis is NOT CEFR-independent.
  if(S.cefrLevels.size===0)p=[];  // no CEFR selected → empty pool
  else p=p.filter(w=>w.cefr&&S.cefrLevels.has(w.cefr));
  if(S.focus==="traps")p=p.filter(hasTrapPhoneme);
  else if(S.focus==="weak")p=p.filter(matchesWeakFocus);
  else if(S.focus==="letters")p=p.filter(w=>w.src==="letter");
  else if(S.focus==="contractions")p=p.filter(w=>w.src==="contraction");
  else if(S.focus==="irregular")p=p.filter(w=>w.src==="irregular_verb"||w.src==="irregular_plural");
  else if(S.focus==="casual")p=p.filter(w=>w.src==="casual");
  return p;
}
```

**設計注記:**
- CEFR フィルタは `w.cefr && S.cefrLevels.has(w.cefr)` の条件で、`letter`/`contraction`/`irregular_verb`/`casual` 等の src で `cefr` が A1 のもの（26+48+75+14+15=178語）は、A1 が選択されていれば通常通り含まれる
- `S.cefrLevels.size === 0`（ユーザーが全 CEFR ピルを解除した状態）では空プールを返す → `updatePool()` が start ボタンを disabled にする
- `reg=regular` でも `reg=irregular` でも `reg=all` でも、CEFR フィルタは同じロジックで一貫して適用される（**特別扱いをしない**のが 2026-07-07 訂正のポイント）

### 3-3. `updateSetupFields()` に CEFR フィールド表示制御を追加（約 L1282-1295）

現行の `updateSetupFields()` の中で、`show("grpField", ...)` の直後に以下の 1 行を追加してください:

```js
show("cefrField", words);
```

**2026-07-07 訂正:** 当初は `show("cefrField", words && S.reg!=="regular")` として `reg=regular` 時に非表示にする案でしたが、これは誤りです（セクション「0-1. D4 の訂正」参照）。`reg` の値によらず常に表示してください。

**参考: 現行の `updateSetupFields()` の該当部分（周辺コード）:**

```js
function updateSetupFields(){
  const words=(S.appMode==="a"&&S.tab==="words");
  show("focusField",words);
  show("regField",words);
  show("grpField",words&&S.reg==="regular");
  show("cefrField", words);  // ← 新設。reg の値によらず常に表示
  $("focusTrapNote").textContent=words&&(S.focus==="traps"?t("focus.traps_d"):S.focus==="weak"?t("focus.weak_d"):"");
  $("regNote").textContent=words&&(S.reg==="regular"?t("reg.regular_d"):S.reg==="irregular"?t("reg.irregular_d"):"");
  // ...
}
```

### 3-4. CEFR ピルのイベントバインド（既存 `bindPills` パターンでは対応できない）

既存の `bindPills(...)` は単一選択（aria-pressed の排他トグル）専用なので、CEFR 用に独自のトグルロジックを書きます。既存の `bindPills` の呼び出し箇所付近（約 L2340-2345 の下部イベントバインド領域）に以下を追加してください:

```js
$("cefrPills").querySelectorAll(".pill").forEach(b=>b.addEventListener("click",()=>{
  const lvl=b.dataset.cefr;
  if(S.cefrLevels.has(lvl))S.cefrLevels.delete(lvl);
  else S.cefrLevels.add(lvl);
  b.setAttribute("aria-pressed",S.cefrLevels.has(lvl)?"true":"false");
  updatePool();
}));
```

**注意:** `bindPills` を模倣せず、Set の add/delete + aria-pressed トグルで独立実装。`updatePool()` の呼び出しは既存 `bindPills` と同じ責務。

### 3-5. `applyI18n()` の CEFR ピル ラベル更新（約 L1044 付近）

現行の `applyI18n()` で `langOpts` / `accentOpts` / `modeOpts` のラベル更新パターンと同じく、`cefrPills` にも追加。既存の `regOpts` などのラベル設定と同じ箇所に:

```js
$("cefrPills").querySelectorAll(".pill").forEach(b => {
  b.textContent = t("lvl." + b.dataset.cefr.toLowerCase());
  b.setAttribute("aria-pressed", S.cefrLevels.has(b.dataset.cefr) ? "true" : "false");
});
$("flabelCefr").textContent = t("lvl.label");
```

キー名: `data-cefr="A1"` → `t("lvl.a1")`、`data-cefr="A2"` → `t("lvl.a2")`、`data-cefr="B1"` → `t("lvl.b1")`。

### 3-6. `refreshVocabBandUnlock()` の空プールスキップ修正（約 L1397-1401）

D3 決定に基づき、次のバンドが空プールなら解放しないよう修正します。

#### 現行

```js
function refreshVocabBandUnlock(){
  let idx=MODEB_BANDS.indexOf(getVocabBand());if(idx<0)idx=0;
  while(idx<MODEB_BANDS.length-1){
    if(bandProgress(MODEB_BANDS[idx]).ratio>=MODEB_BAND_UNLOCK_RATIO){idx++;setVocabBand(MODEB_BANDS[idx]);}
    else break;
  }
}
```

#### 変更後

```js
function refreshVocabBandUnlock(){
  let idx=MODEB_BANDS.indexOf(getVocabBand());if(idx<0)idx=0;
  while(idx<MODEB_BANDS.length-1){
    if(bandProgress(MODEB_BANDS[idx]).ratio<MODEB_BAND_UNLOCK_RATIO)break;
    // Do not advance into a band that has no words yet. Phase 0-a nulled
    // out cefr on all phonics-source words, leaving B1=25 and B2=0. Once
    // Phase 1/2 populates real intermediate vocabulary, promotions will
    // resume automatically without any code change here.
    const nextBand=MODEB_BANDS[idx+1];
    if(modeBBandPool(nextBand).length===0)break;
    idx++;
    setVocabBand(nextBand);
  }
}
```

**設計注記:**
- 次バンドが空なら break → 現バンドに留まる
- Phase 2 で B2 データが追加されれば、`modeBBandPool("B2").length` が 0 でなくなり、自動的にユーザーが解放される
- コード変更は Phase 2 で不要（データ側の追加のみで完結）

### 3-7. Mode B 既存バンドが空だった時の表示処理（守り）

もし過去に何らかの操作で `LS_VOCAB_BAND_KEY` が `B2` にセットされているユーザーがいた場合、現在の `getVocabBand()` は `"B2"` を返し `modeBBandPool("B2")` は空配列を返します。この状態への防御を追加してください。

`getVocabBand()` の呼び出し元は `updatePool()` および `mbNext()` 等の Mode B ロジック。ここでは最小限の防御として、`refreshVocabBandUnlock()` の冒頭に「現在のバンドが空なら 1 つ前に戻す」ロジックを追加します:

```js
function refreshVocabBandUnlock(){
  // Guard: if the persisted band is now empty (e.g. legacy user who reached
  // B2 before Phase 0-a nulled out the phonics-source B2 words), demote to
  // the nearest non-empty band.
  let idx=MODEB_BANDS.indexOf(getVocabBand());if(idx<0)idx=0;
  while(idx>0 && modeBBandPool(MODEB_BANDS[idx]).length===0){
    idx--;
    setVocabBand(MODEB_BANDS[idx]);
  }
  // Then apply the normal unlock logic (with the empty-skip fix).
  while(idx<MODEB_BANDS.length-1){
    if(bandProgress(MODEB_BANDS[idx]).ratio<MODEB_BAND_UNLOCK_RATIO)break;
    const nextBand=MODEB_BANDS[idx+1];
    if(modeBBandPool(nextBand).length===0)break;
    idx++;
    setVocabBand(nextBand);
  }
}
```

これで既存ユーザーの LocalStorage が壊れていても自動修復されます。

---

## 4. i18n 変更（6 言語ファイル）

### 4-1. 対象ファイル

- `i18n/en.json`
- `i18n/ja.json`
- `i18n/ko.json`
- `i18n/fil.json`
- `i18n/zh-Hant.json`
- `i18n/zh-Hans.json`

### 4-2. `lvl` セクションの変更内容

**共通の方針:**
- `lvl.all` を削除（複数選択 UI なので "A1+A2" ラベルが不要）
- `lvl.a1`, `lvl.a2` を新設
- `lvl.b1` はそのまま（値は "B1" のまま）
- `lvl.b2`, `lvl.c1` はキーとして残置（UI 非表示なので実質未使用だが、Phase 1/2 での復活に備えて削除しない）
- `lvl.label` はそのまま
- `lvl.pool` はそのまま

### 4-3. 各言語ファイルの `lvl` セクション最終形

**`i18n/en.json`:**
```json
"lvl": {
  "label": "Level",
  "a1": "A1",
  "a2": "A2",
  "b1": "B1",
  "b2": "B2",
  "c1": "C1",
  "pool": "Pool: {n} words"
},
```

**`i18n/ja.json`:**
```json
"lvl": {
  "label": "レベル",
  "a1": "A1",
  "a2": "A2",
  "b1": "B1",
  "b2": "B2",
  "c1": "C1",
  "pool": "対象 {n} 語"
},
```

**`i18n/ko.json`:**
```json
"lvl": {
  "label": "레벨",
  "a1": "A1",
  "a2": "A2",
  "b1": "B1",
  "b2": "B2",
  "c1": "C1",
  "pool": "대상 {n}개 단어"
},
```

**`i18n/fil.json`:**
```json
"lvl": {
  "label": "Antas",
  "a1": "A1",
  "a2": "A2",
  "b1": "B1",
  "b2": "B2",
  "c1": "C1",
  "pool": "Pool: {n} salita"
},
```

**`i18n/zh-Hant.json`:**
```json
"lvl": {
  "label": "級別",
  "a1": "A1",
  "a2": "A2",
  "b1": "B1",
  "b2": "B2",
  "c1": "C1",
  "pool": "詞庫 {n} 詞"
},
```

**`i18n/zh-Hans.json`:**
```json
"lvl": {
  "label": "级别",
  "a1": "A1",
  "a2": "A2",
  "b1": "B1",
  "b2": "B2",
  "c1": "C1",
  "pool": "词库 {n} 词"
},
```

**注意点:**
- 各 CEFR ラベル（"A1", "A2" など）は英字表記のまま全言語共通。国際規格の略称なので翻訳せずそのまま表示するのが慣例
- 既存の `lvl.all` を削除（各ファイルで `"all": "A1+A2"` などの行を削除）
- 変更は `lvl` セクションのみ。他のキーは絶対に触らない

### 4-4. `tools/validate_i18n.py` の更新（必要な場合のみ）

現行の `validate_i18n.py` が全キーの網羅性をチェックしている場合、キーの追加（`a1`, `a2`）と削除（`all`）に伴い許可リストの更新が必要な可能性があります。実装時に実行して失敗するようなら該当箇所を修正、成功するならそのまま。

---

## 5. ドキュメント更新

### 5-1. `docs/PURPOSE.md`

依存表と変更履歴を更新:

```markdown
| Mode A の CEFR フィルタ | **実装済み**（Phase 0-b。A1/A2/B1 の複数選択。デフォルト A1+A2） |
| Mode B 空バンド対応 | **実装済み**（Phase 0-b。空プールへの解放を防止） |
```

変更履歴に追加:

```markdown
| 2026-07-XX | v3.4 | Phase 0-b: Mode A に CEFR 複数選択フィルタを追加（A1/A2/B1、デフォルト A1+A2）。Mode B の空バンド解放防止。C1 は UI 非表示（キー残置）。 |
```

### 5-2. `docs/DESIGN.md`

CEFR フィルタの実装記述を追加:

```markdown
### Mode A の CEFR フィルタ（Phase 0-b 実装）

- 状態: `S.cefrLevels` (Set<string>)、初期値 `{"A1","A2"}`
- UI: `cefrField` (3 pills: A1, A2, B1)、複数選択トグル
- localStorage 保存なし（既存 `S.reg` / `S.focus` と同じセッション単位）
- `filteredPool()` で `w.cefr && S.cefrLevels.has(w.cefr)` を適用（`reg` の値によらず常に適用。2026-07-07 訂正: 当初 `reg=regular` 時にスキップする設計だったが、`w.grp` を持つ語（`both`-src A1/A2 + `phonics`-src B1/B2）が CEFR 軸で明確に分かれていることが CEFR-J 一次データ照合で判明したため撤回）
- 全 CEFR 解除時は空プール（`S.cefrLevels.size === 0` → `p = []`）
- B2/C1 は UI に露出しない（i18n キーは残置、Phase 1/2 で復活予定）
```

### 5-3. `docs/SPECIFICATION.md`

Setup 画面のフィールド一覧に `cefrField` を追加。既存の `regField` / `focusField` の記述パターンに揃えて記載してください。

---

## 6. 検証手順

### 6-1. Mode A の CEFR フィルタ動作

**2026-07-07 訂正:** 以下の表は CEFR フィルタが `reg` の値によらず常に適用される（セクション「0-1. D4 の訂正」参照）という前提での正しい実測値です。

以下シナリオを実施し、start ボタンの pool 表示（`{n} words`）が期待値と一致することを確認:

| # | reg | CEFR チェック | 期待 pool 数 |
|---|---|---|---:|
| 1 | all | A1, A2（デフォルト） | 2,382 |
| 2 | all | A1 のみ | 1,187 |
| 3 | all | A2 のみ | 1,195 |
| 4 | all | A1, A2, B1 | 2,729 |
| 5 | all | B1 のみ | 347 |
| 6 | all | 全解除 | 0（start disabled） |
| 7 | **regular** | **A1, A2** | **838** |
| 8 | **regular** | **A1, A2, B1** | **1,160** |
| 9 | **regular** | **B1 のみ** | **322** |
| 10 | irregular | A1, A2 | 1,544 |

シナリオ 7〜9 で、`reg=regular` でも CEFR フィルタが通常通り機能し、CEFR フィールドが非表示にならないことを確認してください（当初案の「hidden」は誤りだったため撤回済み）。

### 6-2. Mode B の空バンドスキップ

localStorage の `mb_vocab_band` を直接以下に書き換えて、それぞれで動作確認:

| 初期状態 | 操作 | 期待動作 |
|---|---|---|
| `A1`（新規ユーザー） | 起動 | A1 バンドで開始（1,187 語プール） |
| `B1` | 起動 | B1 バンドで開始（25 語プール）。学習を進めても B2 に解放されない |
| `B2`（レガシー） | 起動 | 自動的に B1 に降格、B1 バンドで動作 |
| A1 で 60% mastered | 学習継続 | A2 に自動解放 |
| A2 で 60% mastered | 学習継続 | B1 に自動解放 |
| B1 で 60% mastered | 学習継続 | **B1 に留まる**（B2 プール空のため） |

### 6-3. C1 の非表示確認

- 設定画面に C1 ピルが表示されないこと
- i18n ファイル内には `lvl.c1` が残置されていること（`grep -r "c1" i18n/` で 6 ファイル全てで見つかること）

### 6-4. i18n 検証

```bash
python3 tools/validate_i18n.py
```

エラーなし、および `lvl.a1`, `lvl.a2`, `lvl.b1`, `lvl.b2`, `lvl.c1`, `lvl.label`, `lvl.pool` が全 6 言語で存在、`lvl.all` は全 6 言語で不在。

### 6-5. 各 UI 言語で CEFR ピル表示確認

言語ピッカーで en/ja/ko/fil/zh-Hant/zh-Hans を順次切り替え、CEFR ピルの表示が期待通り（各言語で "A1" "A2" "B1"、ラベルは各言語の "Level" 相当）であることを確認。

### 6-6. 既存機能の回帰なし確認

- Direction (decode/encode) 切替
- Mode A のフォーカスピル（All sounds / Trap sounds / Weak spots / ...）
- 綴りパターン（regField）と綴りグループ（grpField）の連動表示
- Mode B の Study/Quiz 遷移
- 連結音/弱形タブ（CEFR フィルタが影響しないこと）
- アクセント（GA/RP）切替
- 語彙ブラウザ

---

## 7. 実装レポートの記載事項

作業完了後、以下を含む実装レポートを Naoya に提出してください:

1. `git status` 出力
2. `index.html` の 6 箇所の変更 diff
3. i18n 6 言語ファイルの `lvl` セクション before/after diff
4. `python3 tools/validate_i18n.py` の実行結果
5. 検証 6-1（8 シナリオの pool 数）実測結果
6. 検証 6-2（Mode B の 6 シナリオ）実測結果
7. 検証 6-3（C1 非表示 + キー残置）確認結果
8. 検証 6-5（各言語での表示）確認結果（スクリーンショット任意）
9. 検証 6-6 の回帰確認結果
10. 既知の残作業・懸念事項

---

## 8. Git コミット推奨単位

```
Commit 1: Add CEFR level filter UI to Mode A setup
  - index.html (cefrField HTML, S.cefrLevels state, filteredPool logic,
    updateSetupFields toggle, applyI18n labels, cefrPills event binding)

Commit 2: Update i18n lvl section for all 6 languages
  - i18n/en.json, ja.json, ko.json, fil.json, zh-Hant.json, zh-Hans.json
  - tools/validate_i18n.py (if needed)

Commit 3: Guard Mode B against empty bands (Phase 0-a follow-up)
  - index.html (refreshVocabBandUnlock: skip-if-empty forward + demote-if-empty backward)

Commit 4: Document Phase 0-b in PURPOSE / DESIGN / SPECIFICATION
```

---

## 9. トラブルシューティング

### `filteredPool()` が想定より少ない語数を返す

- `S.cefrLevels` が正しく初期化されているか確認: `console.log([...S.cefrLevels])` で `["A1","A2"]` になるはず
- CEFR フィルタと focus フィルタの積み重なりで意図せず少なくなっている可能性
- CEFR フィルタを一時的にコメントアウトして、focus フィルタだけの効果を確認

### CEFR ピルをクリックしても反応しない

- イベントバインドが `bindPills` の呼び出し後に配置されているか確認
- 独自バインド（3-4）が正しく `S.cefrLevels.add/delete` を呼んでいるか

### Mode B で B1 に到達しても B2 に上がってしまった

- `refreshVocabBandUnlock()` の修正が反映されているか
- `modeBBandPool("B2").length` が `0` を返しているか確認

### `reg=regular` にしても CEFR フィールドが hidden にならない

**これは 2026-07-07 訂正後の正しい動作です。** 当初「hidden にする」設計でしたが、`w.grp` を持つ語（`both`-src A1/A2 + `phonics`-src B1/B2）が CEFR 軸で明確に分かれていることが判明したため、常に表示・常にフィルタ適用が正しい設計です。もし「hidden にすべきでは」と感じたら、セクション「0-1. D4 の訂正」を再確認してください。

### `reg=regular` で CEFR フィルタをかけても pool 数が想定と違う

---

## 10. Phase 1 への引き継ぎ事項（作業不要、記録のみ）

Phase 0-b 完了後、Phase 1（真の B1 語彙拡充）に進む際に以下を復活/追加します:

- CEFR ピルへの B2 追加（B2 データが揃った時点）
- `refreshVocabBandUnlock()` は自動的に B2 解放を再開（コード変更不要）
- i18n `lvl.b2` は既に存在するので、HTML 側でボタンを表示するだけ

---

以上で Phase 0-b 完了です。Phase A（zh 分離）と Phase 0-a（データ是正）の直後に投入することで、CEFR 学習体験の第一段リリースが成立します。
