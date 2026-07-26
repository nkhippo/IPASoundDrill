# Cursor 指示書 — 弱形（Weak Forms）タブの実装

> 作成日: 2026-06-26
> 種別: 機能追加（Mode A 第3の練習タブ）
> 入力: `weak_forms.json`（36語・Claude生成・検証済み）
> 対象: `index.html`（タブ追加・出題）、`gas/Code.gs`（弱形音声・要再デプロイ）
> 前提: 連結句キャリア文実装済み（`renderConnectedPrompt` / `pickCarrier` / `S.curCarrier` / `buildIpaHtml` / `bindIpaSegments`）

Claude 設計サマリー。**連結句タブの仕組みを最大限流用**する。

---

## 1. 目的

機能語の**弱形**（to /tə/, can /kən/, of /əv/…）を文脈の中で学ぶ第3タブ。
弱形は文中でしか起きないため、連結句と同じ**キャリア文＋IPA埋め込み**方式で出題する。

| | 連結句タブ（既存） | 弱形タブ（新規） |
|--|-------------------|-----------------|
| データ | `connected_speech.json`（201） | **`weak_forms.json`（36）** |
| 判定 | `isConnectedItem` = `!!c.cs_type` | **`isWeakItem` = `c.src==="weak_form"`** |
| 出題 | キャリア文＋連結IPA | キャリア文＋**弱形IPA** |
| 採点 | 元フレーズ `w` | 機能語 `w` |
| 特徴 | — | reveal で**強形↔弱形の対比** |

---

## 2. データ（`weak_forms.json`）

`data/weak_forms.json` として配置。36語（L1=10/L2=14/L3=12）。

```jsonc
{
  "id": "wf011",
  "w": "can",
  "ipa": "/kən/",            // GA 弱形（出題で {P} に埋め込む）
  "ipa_strong": "/kæn/",     // GA 強形（reveal 対比表示）
  "rp_ipa": "/kən/",         // RP 弱形
  "rp_ipa_strong": "/kæn/",  // RP 強形
  "level": 2,
  "src": "weak_form",
  "carriers": ["I {P} swim.", "We {P} go now.", "They {P} help.", "She {P} drive."],
  "cs_rule": { "en": "weak 'can' → /kən/ ...", "ja": "弱形の can は /kən/ ..." }
}
```

- 検証済み: 36語×4キャリア、`{P}`単一・隣接重複なし・中間大文字化なし・IPA記号妥当
- `activeIpa(c)` は弱形 `ipa`/`rp_ipa` を返せばよい（連結句と同じ仕組み）
- 強形は reveal 専用フィールド

---

## 3. 音声（★最重要・Naoya 指摘点）

要望: `pick it up`→「ピケラッ」のように**IPA通りの音**。弱形タブでは `can`→/kən/ を確実に鳴らす。

### 問題

現状 `fetchAudioFromGas(text, connected)` は、connected時 `?phrase=綴り&accent=ga`。
弱形で `?phrase=can` を渡すと、OpenAIは文脈なしの "can" を**強形 /kæn/** で読むリスク大。

### 解決: GAS に弱形パラメータ `?weak=` を追加（要再デプロイ）

弱形IPAを渡し、「このIPA通り（弱形・schwa化）で読め」と instruction する。

**GAS `Code.gs` 改修:**

```javascript
// 新 instruction 定数
const TTS_WEAK_INSTRUCTIONS_GA =
  'Pronounce this English function word using its WEAK (reduced) form exactly as the IPA indicates, '
  + 'as it sounds inside connected speech — typically with a schwa /ə/. '
  + 'Use a clear General American accent, calm and natural, said once. '
  + 'Do NOT use the strong citation form. Do not spell it, add words, or pause.';
const TTS_WEAK_INSTRUCTIONS_RP = /* 同文, Received Pronunciation 版 */;

// doGet 内、phrase/word 分岐に weak を追加
const weak = String((e && e.parameter && e.parameter.weak) || '').trim();   // 弱形IPA（例: /kən/）
const weakWord = String((e && e.parameter && e.parameter.ww) || '').trim(); // 機能語綴り（キャッシュキー用）
...
} else if (weak && weakWord) {
  if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(weakWord)) return jsonResponse_({ok:false,error:'bad ww'});
  input = weak;                 // OpenAI に渡すのは IPA
  connected = false;
  cacheAccent = accent;         // ga/rp 別キャッシュ
  // キャッシュキーは weakWord 基準にする（IPAそのままだとファイル名に不適切な記号）
  // fileNameFor_ を weakWord+'__weak' でスラグ化（下記）
}
```

- **キャッシュキー**: `{slug(weakWord)}__{accent}_weak_v2.mp3`（IPA記号はファイル名に使えないため、機能語綴り `ww` でスラグ化＋`_weak` サフィックス）
- instruction 選択: weak時は `TTS_WEAK_INSTRUCTIONS_{GA|RP}`
- レスポンス形は既存と同じ（`audio` base64）

**代替案（GAS最小改修）**: `?phrase=` に弱形を含む短い連結（例 "can go" の "can"部分を文脈ごと）を渡す手もあるが、弱形単体の確実性は `?weak=`＋IPA が最良。**`?weak=` 方式を推奨。**

### クライアント `fetchAudioFromGas` 拡張

```javascript
async function fetchAudioFromGas(text, opts) {
  // opts: {connected} | {weak: ipa, ww: word} に拡張（後方互換: 第2引数bool=connected）
  const o = (typeof opts === "boolean") ? {connected: opts} : (opts || {});
  let q;
  if (o.weak) {
    const accent = currentAccent();   // 弱形は ga/rp 両対応
    q = "weak=" + encodeURIComponent(o.weak) + "&ww=" + encodeURIComponent(o.ww) + "&accent=" + accent;
  } else if (o.connected) {
    q = "phrase=" + encodeURIComponent(text) + "&accent=ga";
  } else {
    q = "word=" + encodeURIComponent(text) + "&accent=" + ttsAccent(false);
  }
  const res = await fetch(GAS_TTS_URL + "?" + q);
  if (!res.ok) throw new Error("GAS HTTP " + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "GAS error");
  return data;
}
```

### `speak()` 拡張とキャッシュキー

- `speak(c.w, {weak: activeIpa(c), ww: c.w})` の形で弱形音声を要求
- `memCacheKey` / `lsKey` / `ttsCacheSlug` に弱形を織り込む（`weak:` プレフィックス＋accent＋ww）。連結句が `connected` で分岐しているのと同じ要領で `weak` フラグを追加
- **音声対象は弱形の該当ワードのみ**（要望どおり。キャリア文全体は読まない）
- reveal では音声不要（連結句と同じく `setTimeout(...speak...)` を弱形では呼ばない or 弱形音声を任意再生に）

---

## 4. UI（連結句タブの複製）

### 4-1. タブ追加（HTML）

`#tabConnected` の隣に弱形タブを追加:
```html
<button class="opt" role="tab" data-tab="weak" aria-pressed="false" id="tabWeak">
  <span class="ot" id="tabWeakT">Weak Forms</span>
</button>
```

### 4-2. データ読み込み（`loadConnected` の複製）

```javascript
let WEAK = []; let weakReady = false;
async function loadWeak(){
  const res = await fetch("data/weak_forms.json");
  if(!res.ok) throw new Error("weak load failed: "+res.status);
  WEAK = (await res.json()).map(normalizeWeak);
  weakReady = true; updatePool();
}
function normalizeWeak(row){
  return { ...row, carriers: row.carriers || null };  // ipa/ipa_strong/rp_*/level/cs_rule をそのまま保持
}
// dataReady() に weakReady を AND
```

### 4-3. 判定関数

```javascript
function isWeakItem(c){ return !!(c && c.src === "weak_form"); }
```

### 4-4. セットアップ表示・フィルタ

- 弱形タブ選択時: Level ピル（L1/L2/L3）を表示（連結句の `csLevelPills` を流用 or 複製）。Type ピルは弱形には無いので非表示
- `updateSetupFields()` の連結句分岐（`show("connectedSetup", S.tab==="connected")`）に weak を追加。弱形は Level のみ
- `S.csLevel` を弱形でも流用（タブで対象データを切替）

### 4-5. プール・出題選定（`updatePool` / `startSession` / `csPool` 複製）

```javascript
function weakPool(){
  let p = WEAK.slice();
  if(S.csLevel!=="all") p = p.filter(x=>String(x.level)===S.csLevel);
  return p;
}
// startSession() の tab 分岐に weak を追加（connected と同形）
if(S.tab==="weak"){
  let pool = weakOnly
    ? shuffle(WEAK.filter(w=>S.missed.includes(w.w))).slice(0,QUESTION_COUNT)
    : shuffle(weakPool()).slice(0,QUESTION_COUNT);
  S.queue = pool; ...
}
```

### 4-6. 出題描画（`renderConnectedPrompt` 流用）

`renderCard` / `renderDecode` の連結句分岐に weak を追加。**描画は連結句と同一**（キャリア文＋IPA埋め込み）。

```javascript
// renderCard: S.curCarrier 設定を weak にも
S.curCarrier = (isConnectedItem(c) || isWeakItem(c)) ? pickCarrier(c) : null;
// renderDecode: 埋め込み描画
if((isConnectedItem(c) || isWeakItem(c)) && S.curCarrier){
  renderConnectedPrompt(c);   // activeIpa(c) が弱形IPAを返す
} else {
  renderIpaInto($("dIpa"), activeIpa(c), "dInfo", null);
}
// Decode方向強制（弱形もDecodeのみ）
if(S.tab==="connected"||S.tab==="weak"||S.dir==="decode") renderDecode(c); else renderEncode(c);
```

### 4-7. 採点（不変）

`decodeCheck()` は `spellCheck(input, c.w)` のまま。弱形も機能語 `w` を入力させる。

### 4-8. reveal — ★弱形は強形対比を表示

弱形タブのreveal:
- 機能語 `w`
- **弱形IPA**（出題で見たもの）と**強形IPA `ipa_strong`** を並べて対比表示（例: 強形 /kæn/ ↔ 弱形 /kən/）
- `cs_rule`（弱形ルール）を表示
- gloss は機能語なので任意（無くてよい。出すなら簡易）

```javascript
// reveal 内、isWeakItem(c) のとき
if(isWeakItem(c)){
  $("rCsMeta").textContent = t("weak.strong_label")+": "+(ACCENT==="rp"?c.rp_ipa_strong:c.ipa_strong)
    + "  ↔  " + t("weak.weak_label")+": "+activeIpa(c);
  $("rCsMeta").classList.remove("hidden");
  $("rNote").textContent = (c.cs_rule&&(c.cs_rule[LANG]||c.cs_rule.en))||"";
}
```

### 4-9. 音声ボタン配線

`dPlay`/`rPlay` のクリックを弱形対応に:
```javascript
$("dPlay").addEventListener("click",()=>{
  if(!S.cur) return;
  if(isWeakItem(S.cur)) speak(S.cur.w, {weak: activeIpa(S.cur), ww: S.cur.w});
  else speak(S.cur.w, {connected: isConnectedItem(S.cur)});
});
```

---

## 5. i18n（en/ja/zh/ko）

| キー | en | ja | zh | ko |
|------|----|----|----|----|
| `tab.weak` | Weak Forms | 弱形 | 弱读形式 | 약형 |
| `lead_weak_html` | Hear the **weak forms** of function words in connected speech. Read the IPA and recover the word. | 機能語の**弱形**を聞き取る。IPAを読んで元の語を答える。 | 听功能词的**弱读形式**，读出IPA还原单词。 | 기능어의 **약형**을 듣고 IPA를 읽어 단어를 맞히세요. |
| `weak.strong_label` | Strong | 強形 | 强读 | 강형 |
| `weak.weak_label` | Weak | 弱形 | 弱读 | 약형 |
| `input_weak`（任意） | Type the word | 単語を入力 | 输入单词 | 단어 입력 |

`tools/validate_i18n.py` ERROR 0。**タガログ fil にも同キーを追加**（Tier1で fil 追加済みのため）。

---

## 6. プリフェッチ（任意・推奨）

既存の TTS プリフェッチ（warm）は単語モード向け。弱形タブは句数が少ない（36）ので、Start時に弱形音声を `?weak=` で先読みすると体感が向上。連結句同様、当面は押下時取得でも可。**まずは押下時取得で実装し、必要なら後日プリフェッチ拡張。**

---

## 7. DoD

- [ ] `data/weak_forms.json`（36語）配置・読み込み
- [ ] 弱形タブが表示され、Level フィルタが効く
- [ ] 出題が連結句と同じキャリア文＋IPA埋め込みで表示
- [ ] **音声が弱形（schwa化）で鳴る**（`?weak=` 方式、GAS再デプロイ後）
- [ ] reveal で強形↔弱形の対比＋ルール表示
- [ ] 採点は機能語 `w`（spellCheck 不変）
- [ ] 音声対象は該当ワードのみ、キャリア文は読まない
- [ ] 単語/Encode/Mode B/連結句タブの挙動は不変
- [ ] i18n 5言語（en/ja/zh/ko/fil）ERROR 0
- [ ] **GAS 再デプロイ**（`?weak=` 有効化）

---

## 8. GAS 再デプロイ（Naoya 手番）

`?weak=` は GAS 再デプロイが必要。再デプロイ前は弱形音声が失敗するが、`speak()` のエラーハンドリングで再生不能になるだけ（出題・採点は動く）。

---

## 9. Claude への申し送り

- 弱形36語は高頻度機能語を厳選・難易度区分済み。データ検証済み
- 音声は `?weak=`＋弱形IPA方式を推奨（綴り渡しだと強形で読まれるため）。この知見は連結句音声の精度向上にも応用可
- 将来: 弱形の派生（have→/əv/ 等のさらなる縮約）、弱形プリフェッチ、強形/弱形の対比ドリル（同語の2文提示）
