---
id: pj-2026-06-28-204a
aliases:
- pj-2026-06-28-204a
title: 'Cursor 指示書 — 練習タブ統一: Connected Speech ⊃ Weak Forms（再発行版）'
created: '2026-06-28'
---
# Cursor 指示書 — 練習タブ統一: Connected Speech ⊃ Weak Forms（再発行版）

> 作成日: 2026-06-28（再発行）
> 種別: リファクタ（UI 統合 + ランタイム管理一本化）
> 対象: `index.html`（単一HTML本体）、`i18n/*.json`、`docs/*`
> 正本: `PURPOSE.md`（§1 練習タブ）/ `DESIGN.md` / `SPECIFICATION.md`
> 行番号は **2026-06-28 時点の `index.html` を grep 再確認済み**

---

## 0. 結論（設計判断）

**Connected Speech タブに Weak Forms を内包し、練習タブを Words / Connected Speech の2つに集約する。**

弱形は「文中でのみ起きる機能語の弱読」＝連結発音現象の一部（`PURPOSE.md §2`）。よって Weak Forms は独立タブではなく、Connected Speech 内の **Type フィルタの1つ**として扱うのが概念的にも正しい。

- 練習タブ: **Words | Connected Speech**（弱形タブを廃止）
- Type ピル: All / Linking / Assimilation / Elision / **Weak forms**（弱形を追加）
- Level ピル・Decode・キャリア文・reveal は**既に共有済み**なので、データ経路・件数・出題・リードを1本化する
- **データは2ファイル維持**（`connected_speech.json` 201 / `weak_forms.json` 36）。ランタイムで統合（後述 §5・低リスク・Tier 4 に無影響）

> 「2タブを残したまま内部管理だけ統一したい」場合は **§7 代替案B** を参照（差分は小さい）。本書は本文＝案A（1タブ統合）で記述する。

---

## 1. 現状アーキテクチャ（事実整理・再検証済み）

連結と弱形は **すでに約8割が共有実装**で、分岐は浅い。

### 既に共有しているもの
- `#connectedSetup`（Level ピル）は両タブで表示（`index.html:953`）
- Decode 専用・Leitner/SRS スキップ（`1372` の `connected||weak||isConnectedItem||isWeakItem` 分岐）
- reveal パネル・キャリア文・句入力の経路（`1662` で `connected||weak` を併記）
- reveal はアイテム単位で分岐（`isConnectedItem`: `!!c.cs_type` / `isWeakItem`: `c.src==="weak_form"`。`664–665`）

### 分岐しているもの（＝統一対象）

| # | 行 | 内容 |
|---|----|------|
| D1 | `248` | 弱形タブボタン `data-tab="weak"` / `id="tabWeak"` |
| D2 | `254` | `#leadWeak`（リード） |
| D3 | `480` `533` `537` `610` `821` | `weakReady` / `loadWeak()` / `dataReady()` |
| D4 | `688` `702` | `applyI18n`: `leadWeak`・`tabWeakT` |
| D5 | `953` `954` `957` `958` `961` | `setSetupVisible`: 弱形分岐 |
| D6 | `1000–1010` | `filteredConnectedPool` / `filteredWeakPool` |
| D7 | `1022–1033` | 件数 `pool.count_phrases` / `pool.count_weak` |
| D8 | `1568–1571` `1574` | `startSession`: 連結/弱形 2分岐 |
| D9 | `319–325` `954` | Type ピル（`#csPills`）は連結のみ |

### 露出する致命バグ（リネームでは済まない）

弱形が `S.tab==="connected"` 側に入ると、「句」判定が弱形を誤って句扱いする。`§3-7` で修正。

| 行 | 現状 | 問題 |
|----|------|------|
| `742` `961` | `placeholder = S.tab==="connected" ? t("input_phrase") : t("input_ph")` | 弱形が句プレースホルダになる |
| `1709` `1715` | `const phrase = isConnectedItem(S.cur) \|\| S.tab==="connected"` | 弱形が句入力モードになる |

> **注意**: `S.focus==="weak"` / `data-focus="weak"`（Words タブの「苦手音(weak spots)」フィルタ）は弱形タブとは**無関係**。触らない。

---

## 2. 統一設計（案A）

- `S.tab` は **`words` / `connected`** の2値に。`"weak"` は廃止
- 弱形は `S.csFilter==="weak"` で選択。プールは連結+弱形の合算から `isWeakItem` で抽出
- アイテム判定はそのまま: `isConnectedItem(c)=!!c.cs_type`（連結 true）/ `isWeakItem(c)=c.src==="weak_form"`（弱形 true）。**weak には `cs_type` を付けない**（付けると `isConnectedItem` が誤検知し、句/単語判定が壊れる）
- reveal/autoNote は**現状維持**（アイテム単位で正しく分岐済み）

---

## 3. `index.html` の変更（行アンカー付き）

### 3-1. DOM

**(a) 弱形タブボタンを削除**（`248`）
```html
<!-- 削除 -->
<button class="opt" role="tab" data-tab="weak" aria-pressed="false" id="tabWeak"><span class="ot" id="tabWeakT">Weak Forms</span></button>
```

**(b) Type ピルに「Weak forms」を追加**（`#csPills`、`325` の elision の後）
```html
<button class="pill" data-cs="weak" aria-pressed="false" id="csWeak">Weak forms</button>
```
ラベルは i18n で **既存 `tab.weak` を流用**（§4）。新キーは作らない。

**(c) `#leadWeak`（`254`）は残す**（Type が weak のときに切替表示）。

### 3-2. i18n 適用（`applyI18n`）

- `702` の `$("tabWeakT").textContent = t("tab.weak");` を **削除**（タブボタンが無くなるため）
- 弱形ピルのラベルを追加: `$("csWeak").textContent = t("tab.weak");`
- `688` の `$("leadWeak").innerHTML = t("lead_weak_html");` は **残す**（§3-4 で表示制御）

### 3-3. データ経路の一本化

ローダ・`CONNECTED`/`WEAK`・`weakReady`・`dataReady()`（D3）は**そのまま**（2ファイル維持）。**プールだけ合算**する。

`filteredConnectedPool` と `filteredWeakPool`（`1000–1010`）を1関数に置換:

```js
function filteredCsPool(){
  let p = CONNECTED.concat(WEAK);
  if(S.csLevel!=="all") p = p.filter(x => String(x.level) === S.csLevel);
  if(S.csFilter === "weak") p = p.filter(isWeakItem);
  else if(S.csFilter !== "all") p = p.filter(x => x.cs_type === S.csFilter);
  return p;
}
```

- `All` = 連結201 + 弱形36 = 237
- `weak` = 弱形のみ
- `linking/assimilation/elision` = 連結の各サブセット（弱形は `cs_type` 無しで自動的に除外される）

### 3-4. 表示制御（`setSetupVisible`、`953–961`）

```js
// 953
show("connectedSetup", S.tab==="connected" && !modeB);       // ||"weak" を削除
// 954（変更なし・weak ピルを含むようになる）
show("csTypeField",    S.tab==="connected" && !modeB);
// 957–958: リードを csFilter で切替
show("leadConnected",  S.tab==="connected" && !modeB && S.csFilter!=="weak");
show("leadWeak",       S.tab==="connected" && !modeB && S.csFilter==="weak");
```

### 3-5. 件数（`updatePool`、`1022–1033`）

連結/弱形の2分岐を1本化:

```js
if(S.tab === "connected"){
  const n = filteredCsPool().length;
  const key = S.csFilter==="weak" ? "pool.count_weak" : "pool.count_phrases";
  $("poolNote").textContent = t(key, {n});
  if(dataReady()) $("startBtn").disabled = n===0;
  return;
}
```

### 3-6. 出題（`startSession`、`1565–1578`）

連結/弱形の2分岐（`1565` `1568`）を1本化し、`weakOnly`（誤答復習）も合算プールへ:

```js
if(S.tab === "connected"){
  const base = (weakOnly && S.missed.length)
    ? CONNECTED.concat(WEAK).filter(w => S.missed.includes(w.w))
    : filteredCsPool();
  pool = shuffle(base.slice());
  if(pool.length > QUESTION_COUNT) pool = pool.slice(0, QUESTION_COUNT);
}
```

これに伴い、後続の `else if(weakOnly && S.missed.length){…}` 内の **連結サブ分岐（`1574–1575` 相当）は到達不能になるので削除**し、Words（PRESET）の誤答復習だけ残す。

### 3-7. ⚠️ 露出バグの修正（必須・最重要）

**(a) 入力フィルタ**（`1709` `1715`）
```js
// before: const phrase = isConnectedItem(S.cur) || S.tab==="connected";
const phrase = isConnectedItem(S.cur);   // 連結=cs_typeあり→句 / 弱形=cs_type無し→単語
```
連結は必ず `cs_type` を持つので `isConnectedItem` 単独で正しく句/単語を分離できる。`S.tab` 依存を除去。

**(b) プレースホルダ**
- カード描画時（`742`）→ アイテム基準へ:
```js
$("dInput").placeholder = (S.cur && isConnectedItem(S.cur)) ? t("input_phrase") : t("input_ph");
```
- セットアップ時（`961`）→ フィルタ基準へ:
```js
$("dInput").placeholder = (S.tab==="connected" && S.csFilter!=="weak") ? t("input_phrase") : t("input_ph");
```

**(c) `S.tab==="weak"` の残存参照を `connected` 系へ畳む**
- `1372` `1662` の `S.tab==="connected"||S.tab==="weak"` → `S.tab==="connected"` に簡約
- `821` のロードエラー時 `if(S.tab === "weak") $("poolNote").textContent = t("load_fail")` → 統合後は `connected` で判定する（連結 or 弱形のいずれかのロード失敗時に同じ load_fail を表示）

---

## 4. i18n（新キー不要・orphan なし）

| キー | 統一後の扱い |
|------|--------------|
| `tab.weak` | **流用**（弱形 Type ピルのラベル `t("tab.weak")`）。値変更なし |
| `lead_weak_html` | **流用**（csFilter=weak 時のリード） |
| `pool.count_weak` | **流用**（weak 選択時の件数） |
| `cs.linking/assimilation/elision/all` | 変更なし |

→ **5言語ファイル（en/ja/zh/ko/fil）の編集は不要**。新キー追加なし。`validate_i18n.py` は ERROR 0 を維持。
ただし `docs/i18n-audit.md` の「画面」列が変わる（`tab.weak` は「setup タブ名」→「Connected の Type ピル」）。**`python3 tools/gen_audit_docs.py` で再生成**して反映。

---

## 5. データ方針

### 採用: 2ファイル維持・ランタイム統合（U1）

`connected_speech.json`（201）と `weak_forms.json`（36）は**そのまま**。`§3-3` のとおり実行時に合算。

- 利点: データ移行なし・可逆・**Tier 4（`cs_rule.fil`）の対象ファイルが安定**（生成済みデータを壊さない）

### 代替: 物理統合（U2・非推奨）

1ファイルに統合する場合、弱形項目に `cs_type` を持たせると `isConnectedItem` 誤検知で句/単語判定が壊れるため、別フラグ（例 `kind:"weak"`）を新設し、`isConnectedItem`/`isWeakItem` を `kind` ベースに作り替える必要がある。スキーマ非対称（`gloss` 有無・`ipa_strong` 有無）も1スキーマに正規化が要る。**Tier 4 の再設計を誘発するため今回は採らない。**

---

## 6. docs 更新

| ファイル | 変更 |
|----------|------|
| `PURPOSE.md` §1 | 「練習タブ: Words・Connected Speech・Weak Forms の3種」→「Words・Connected Speech の2種。弱形は Connected Speech 内の Type として内包」 |
| `SPECIFICATION.md` | 練習タブ／Type ピル／件数キーの記述を統一後に更新 |
| `DESIGN.md` | タブ・データ経路（`filteredCsPool` 一本化、2ファイル維持）を反映 |
| `docs/i18n-language-scaling.md` | Tier 4 の件数（連結201+弱形36=237）と `tab.weak` 流用を注記 |
| `docs/i18n-audit.md` | `gen_audit_docs.py` で再生成 |

---

## 7. 代替案B（2タブ維持・内部管理だけ統一）

UI は Words / Connected Speech / Weak Forms の3タブのまま、**実装層だけ**一本化したい場合:

- §3-3 を `filteredCsPool(level, scope)` に引数化し、連結タブ=`scope:"connected"`、弱形タブ=`scope:"weak"` で呼ぶ
- §3-5/§3-6 も `S.tab` を引数に畳む（件数キー・出題を共通関数化）
- DOM のタブボタン削除（§3-1a）・Type ピル追加（§3-1b）・露出バグ §3-7 は**不要**（`S.tab==="weak"` が残るため句判定は現状のまま正しい）

→ 「同じタブとして見せる」要望には案A、「コードの重複だけ消したい」なら案B。**推奨は案A**（要望文「同じタブとして管理」に直接合致）。

---

## 8. 検証 / DoD

```bash
python3 tools/validate_i18n.py     # ERROR 0（キー構造不変）
python3 tools/gen_audit_docs.py    # i18n-audit.md 再生成
```

実機（案A）:
- [ ] 練習タブが **Words / Connected Speech** の2つ
- [ ] Connected Speech の Type ピルに **Weak forms** があり、選択で弱形36件に絞れる
- [ ] All=237 / linking・assimilation・elision=各サブセット / weak=36 と件数が一致
- [ ] **弱形カードの入力が単語モード**（句モードにならない＝§3-7 の修正が効いている）
- [ ] 弱形 reveal が強形↔弱形表示、連結 reveal が cs_type+rule 表示（従来どおり）
- [ ] weak 選択時リードが弱形用、それ以外は連結用に切替
- [ ] Words タブの「苦手音(weak spots)」フォーカスが無傷
- [ ] `validate_i18n.py` ERROR 0、`i18n-audit.md` 再生成済み

---

## 9. Tier 4（`cs_rule.fil`）への申し送り

- 本統一は **U1（2ファイル維持）**のため、`connected_speech.json`（201）/ `weak_forms.json`（36）の構造は不変
- よって **Tier 4 の `cs_rule.fil` 生成は本統一後でも対象が同じ237件**で、手戻りは発生しない
- 統一完了後に Claude が237件を1〜2バッチで生成 → Cursor がマージ

---

## 10. 再発行版の差分（前回版からの更新点）

- 行アンカーを 2026-06-28 時点の `index.html` で grep 再確認（前回と同じであることを確認）
- `#langOpts` の Filipino ボタンは Tier 1 で既に追加済みなのを再確認（本書での追加作業は無し）
- それ以外、設計・指示内容に変更なし
