---
id: pj-2026-06-27-2821
aliases:
- pj-2026-06-27-2821
title: Cursor 指示書 — 音声プリフェッチ（GAS一括ウォームアップ + クライアント先読み）
created: '2026-06-27'
---

# Cursor 指示書 — 音声プリフェッチ（GAS一括ウォームアップ + クライアント先読み）

> 作成日: 2026-06-26
> 種別: 寄り道（UX改善 / TTS）
> 前提: STEP5 GA/RP・RP TTS（GAS再デプロイ済み・`accent=ga|rp` 有効）
> 対象: `gas/Code.gs`（**改修あり**: warm エンドポイント追加）、`index.html`（先読み・スピーカー活性制御）
> 方式: **B+A 組合せ** — GAS で Drive にストック生成（本体は運ばない）＋ クライアントで運用アクセントのみ本体取得

Claude 設計サマリー。実コードの関数名・ID に合わせて記載。

---

## 1. 目的（要望そのまま）

現状: Start押下後 or 再生ボタン押下の**都度**、`speak()` が `fetchAudioFromGas()` で1件取得（Drive→無ければOpenAI生成）。初回再生に待ちが出る。

変更後:
1. **Start時、その出題セット（約10語）× GA/RP を非同期でプリフェッチ**
2. **GAS側で音声を生成し Drive にストック**（ブラウザを閉じても backend に蓄積。初期は重いが回を追うごとに高速化）
3. スピーカーボタンは、**対応音声が取得できた時点で活性化**。未取得は非活性
4. **運用アクセント（`ACCENT`）を先に本体取得、反対アクセントは遅延**（Drive 生成だけ先に済ませ、本体は押下/アイドル時）

### 設計の肝（要望②への対応）

GAS は呼ばれれば必ず Drive に保存する（既存 `saveToDrive_`）。よって「Drive ストックを増やす」=「GAS を叩く」。
本体 base64 を毎回ネットワークで運ぶと初期負荷が高いので、**Drive生成だけを行い本体を返さない `warm` モード**を GAS に追加し、初期の通信量とクライアント負荷を抑える。

---

## 2. GAS 改修（`gas/Code.gs`）

### 2-1. 一括ウォームアップ・エンドポイント追加

既存 `doGet` に `warm` パラメータ分岐を追加。**音声本体（base64）は返さず、Drive生成の成否サマリだけ返す。**

```
GET ?warm=1&words=luck,colour,water&accent=ga
GET ?warm=1&words=luck,colour,water&accent=rp
```

- `words`: カンマ区切り（最大 N 件。下記 §2-3 で上限）
- `accent`: `ga|rp`（既定 `ga`）
- 各語について `getAudioFromDrive_` を確認 → 無ければ `fetchFromOpenAIWithRetry_` で生成し `saveToDrive_`。**blob 本体はレスポンスに含めない。**

レスポンス例:
```json
{
  "ok": true,
  "accent": "ga",
  "results": [
    { "word": "luck",   "status": "cached" },
    { "word": "colour", "status": "generated" },
    { "word": "water",  "status": "failed", "error": "..." }
  ]
}
```

- `status`: `cached`（既にDriveにあった）/ `generated`（新規生成・保存）/ `failed`
- これにより**通信は軽量なJSONのみ**。本体は後でクライアントが必要なアクセントだけ取得する。

### 2-2. 実装スケッチ（既存ヘルパ流用）

```javascript
function warmOne_(word, accent) {
  if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(word)) return { word: word, status: 'failed', error: 'invalid' };
  let blob = getAudioFromDrive_(word, accent);
  if (blob && isAudioBlobTooShort_(blob)) { trashAudioOnDrive_(word, accent); blob = null; }
  if (blob) return { word: word, status: 'cached' };
  try {
    const instructions = instructionsFor_(accent, false);
    const fresh = fetchFromOpenAIWithRetry_(word, instructions);
    if (!isAudioBlobTooShort_(fresh)) { saveToDrive_(word, accent, fresh); return { word: word, status: 'generated' }; }
    return { word: word, status: 'failed', error: 'too_short' };
  } catch (err) {
    return { word: word, status: 'failed', error: String(err.message || err).slice(0, 120) };
  }
}

// doGet 冒頭に分岐を追加
function handleWarm_(e) {
  const accent = normalizeAccent_(e.parameter.accent);
  const raw = String(e.parameter.words || '').trim();
  if (!raw) return jsonResponse_({ ok: false, error: 'no words' });
  const words = raw.split(',').map(s => s.trim()).filter(Boolean).slice(0, WARM_MAX);
  const results = words.map(w => warmOne_(w, accent));
  return jsonResponse_({ ok: true, accent: accent, results: results });
}
```

`doGet(e)` の最初（phrase/word 分岐の前）に:
```javascript
if (e && e.parameter && e.parameter.warm) return handleWarm_(e);
```

### 2-3. GAS タイムアウト対策（重要）

GAS Web App の実行は最大約6分だが、UrlFetch を直列で多数回すと時間がかかる。
- **`WARM_MAX = 6`**（1リクエストで最大6語まで）。クライアント側で 20件 → 6件ずつ複数リクエストに分割する（§3-2）
- warm の各生成は直列（GAS内ループ）。6語×数秒 = 十数秒/リクエストに収める
- これによりクライアントは「6語warm × 数本」を**並列2本**まで（GAS同時実行の負荷管理）

### 2-4. 連結句

連結句は対象外（warm は単語のみ）。連結句タブのプリフェッチは将来必要なら別途。

---

## 3. クライアント改修（`index.html`）

### 3-1. プリフェッチ起動フック

`startSession()` の **`S.queue` 確定直後**（`renderCard()` の前）にプリフェッチを起動。Mode A/B 両方。

```javascript
// startSession() 内、S.queue 設定後・renderCard() 前に:
prefetchSessionAudio(S.queue);   // await しない（UIブロック禁止）
```

> Mode B も対象。`buildModeBQueue()` の各要素も `w` を持つ前提（持たない場合は語の取り出し方を合わせる）。連結句タブ（`S.tab==="connected"`）は warm 対象外なので skip（従来どおり押下時取得）。

### 3-2. プリフェッチ本体（warm 分割 + 本体取得）

```javascript
const PREFETCH = {
  warmChunk: 6,        // GAS WARM_MAX に合わせる
  warmParallel: 2,     // 同時 warm リクエスト本数
  bodyParallel: 3,     // 本体取得の同時数
};
let prefetchToken = 0;

function audioReadyKey(word, accent){ return accent + ":" + word.toLowerCase(); }
const audioReady = new Map();   // key -> 'pending'|'ready'|'failed'

async function gasWarm(words, accent, token){
  for (let i = 0; i < words.length; i += PREFETCH.warmChunk) {
    const chunk = words.slice(i, i + PREFETCH.warmChunk);
    // warmParallel 本ずつ投げる
    // （簡易: ここでは chunk を順に。必要なら Promise.all で warmParallel 本束ねる）
    if (token !== prefetchToken) return;
    try {
      const q = "warm=1&accent=" + accent + "&words=" + encodeURIComponent(chunk.join(","));
      await fetch(GAS_TTS_URL + "?" + q);   // 本体は受け取らない（Drive生成のみ）
    } catch(e){ /* warm失敗は本体取得側でフォールバック */ }
  }
}

async function fetchBodyToCache(word, accent, token){
  // 既存 fetchAudioFromGas は ACCENT 依存なので、accent明示版を使う（§3-4）
  const key = audioReadyKey(word, accent);
  if (hasCachedAudioFor(word, accent)) { audioReady.set(key,'ready'); refreshSpeakerFor(word, accent); return; }
  try {
    const data = await fetchAudioFromGasAccent(word, accent);   // 明示accent
    saveAudioToLSAccent(word, accent, data.mimeType, data.audio);
    audioReady.set(key,'ready');
    refreshSpeakerFor(word, accent);
  } catch(e){
    audioReady.set(key,'failed');
    refreshSpeakerFor(word, accent);
  }
}

async function prefetchSessionAudio(queue){
  if (S.tab === "connected") return;            // 連結句は対象外
  prefetchToken++;
  const token = prefetchToken;
  const words = [...new Set(queue.map(c => c.w).filter(Boolean))];
  const cur = (ACCENT === "rp") ? "rp" : "ga";
  const other = (cur === "rp") ? "ga" : "rp";

  // 全スピーカーを一旦非活性 + pending
  for (const w of words){ audioReady.set(audioReadyKey(w,cur),'pending'); audioReady.set(audioReadyKey(w,other),'pending'); }
  refreshAllSpeakers();

  // (1) 両アクセントを Drive にウォームアップ（本体は運ばない・軽量）
  gasWarm(words, cur, token);
  gasWarm(words, other, token);

  // (2) 運用アクセントだけ本体取得 → スピーカー活性化（bodyParallel 並列）
  let i = 0;
  async function bodyWorker(){
    while (i < words.length){
      if (token !== prefetchToken) return;
      const w = words[i++];
      await fetchBodyToCache(w, cur, token);
    }
  }
  await Promise.all(Array.from({length: PREFETCH.bodyParallel}, bodyWorker));

  // (3) 反対アクセントは遅延：本体取得しない。押下時 or アイドルで取得（§3-5）
}
```

### 3-3. スピーカー活性制御

現状 `setSpeakerBusy()` は再生中の一括 disable。これは残しつつ、**プリフェッチ未完による非活性**を別軸で管理する。

- 表示中の問題の**現在アクセント音声が ready** → ボタン活性
- pending → 非活性（淡色 or スピナー）
- failed → 非活性 + 押下で即時取得フォールバック

```javascript
function currentCardWord(){ return S.cur ? S.cur.w : null; }
function speakerIdsForCurrentCard(){
  // 表示中カードに応じた再生ボタンID群を返す
  if (S.appMode === "b") return ["mbSPlay","mbMPlay","mbDPlay"];
  return ["dPlay","ePlay","rPlay"];
}
function refreshAllSpeakers(){ const w=currentCardWord(); if(w) refreshSpeakerFor(w, (ACCENT==="rp"?"rp":"ga")); }
function refreshSpeakerFor(word, accent){
  const w = currentCardWord();
  if (!w || w.toLowerCase() !== String(word).toLowerCase()) return;
  if (accent !== (ACCENT==="rp"?"rp":"ga")) return;   // 現在アクセントのみUI反映
  const st = audioReady.get(audioReadyKey(word, accent));
  const enabled = (st === 'ready') || hasCachedAudioFor(word, accent);
  speakerIdsForCurrentCard().forEach(id=>{ const b=$(id); if(b && !speakBusy) b.disabled = !enabled; });
}
```

> `renderCard()` の末尾で `refreshAllSpeakers()` を呼び、カード切替時に現在語の ready 状態でボタンを評価する。

### 3-4. accent 明示版ヘルパ（既存は ACCENT 依存のため追加）

既存 `fetchAudioFromGas` / `loadAudioFromLS` / `saveAudioToLS` / `memCacheKey` は `ttsAccent()` 経由で**現在の ACCENT に依存**している。プリフェッチは「現在表示と異なるアクセントも扱う」ため、**accentを引数で受ける版**を用意（既存はラッパに）。

```javascript
function lsKeyAccent(word, accent){ return LS_TTS_PREFIX + accent + ":" + ttsCacheSlug(word, false); }
function memKeyAccent(word, accent){ return accent + ":" + word; }
function hasCachedAudioFor(word, accent){
  if (memAudioCache.has(memKeyAccent(word, accent))) return true;
  try { return !!localStorage.getItem(lsKeyAccent(word, accent)); } catch(e){ return false; }
}
async function fetchAudioFromGasAccent(word, accent){
  const res = await fetch(GAS_TTS_URL + "?word=" + encodeURIComponent(word) + "&accent=" + accent);
  if (!res.ok) throw new Error("GAS HTTP " + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "GAS error");
  return data;
}
function saveAudioToLSAccent(word, accent, mime, b64){
  try { localStorage.setItem(lsKeyAccent(word, accent), JSON.stringify({ mime: mime||"audio/mpeg", b64 })); } catch(e){}
}
```

> 既存 `speak()` はそのままでよい（現在アクセントを見る）。プリフェッチで温めた localStorage / mem を `speak()` がそのままヒットする（キー体系は共通）。**memにロードする場合は `memKeyAccent` と既存 `memCacheKey` のキー一致に注意**——既存 `memCacheKey(text,false)` は `accent + ":" + text`。`memKeyAccent` も同形にすること（上記で一致）。

### 3-5. 反対アクセントの遅延取得

- ユーザーがアクセントを切替えた（GA↔RP）瞬間に、新アクセントの本体取得を起動（`fetchBodyToCache` を現キューに対して）
- またはアイドル時（`requestIdleCallback`）に反対アクセントを背景取得してもよい（任意・低優先）
- いずれも Drive には warm 済みなので、本体取得は高速（OpenAI生成を待たない）

### 3-6. 押下フォールバック（詰まない保証）

`speak()` は既存のまま。未取得（pending/failed）でも押下されたら、`speak()` が `fetchAudioFromGas()` でその場取得する（従来動作）。プリフェッチはあくまで「先に温める」最適化で、失敗しても再生不能にはならない。

---

## 4. DoD

- [ ] GAS: `?warm=1&words=...&accent=...` が Drive 生成のみ行い、本体非返却の JSON サマリを返す
- [ ] GAS: `WARM_MAX`（=6）で1リクエストの語数を制限
- [ ] クライアント: Start時に出題セット × GA/RP を warm（Drive蓄積）
- [ ] クライアント: 運用アクセントのみ本体取得 → localStorage/mem に格納 → スピーカー活性化
- [ ] 反対アクセントは本体取得を遅延（アクセント切替時 or 押下時 or アイドル）
- [ ] スピーカーは現在アクセント音声 ready で活性、pending で非活性
- [ ] 先読み失敗でも押下で即時取得にフォールバック（`speak()` 従来動作）
- [ ] Start連打/再スタートで旧プリフェッチ中断（`prefetchToken`）
- [ ] 連結句タブは warm 対象外（従来どおり）
- [ ] **ブラウザを閉じても Drive に MP3 が蓄積**（warm が叩かれた語は永続）

---

## 5. 効果（要望との対応）

| 要望 | 実現 |
|------|------|
| 押下→再生の待ちを極力減らす | 運用アクセントを先読みで localStorage 化 → 押下時 ≒0秒 |
| 初期は重いが徐々に速く | warm で Drive に貯まり、2回目以降は全端末が `cached` ヒット |
| ブラウザを閉じても backend に蓄積 | GAS が叩かれた語は Drive に永続保存（既存 `saveToDrive_`） |
| 通信節約 | warm は本体を運ばない軽量JSON。本体取得は運用アクセントのみ |

---

## 6. 留意

- **GAS同時実行**: warm は直列生成で十数秒/リクエストになり得る。`warmParallel=2` 程度に抑制。重ければ 1 に
- **二重生成防止**: warm と本体取得が同語で競合しても、Drive は last-write だが `saveToDrive_` が既存をtrash→新規なので実害は小（OpenAI二重課金のみ）。気になるなら本体取得前に warm 完了を待つ設計も可（今回は速度優先で並行）
- **localStorage 容量**: MP3 ~12KB×語数。GA/RP 両方貯めると増えるため、既存の保存失敗 try/catch を維持（あふれても mem と Drive で動作）
- **キー一致**: §3-4 の `memKeyAccent` は既存 `memCacheKey(text,false)` と同形（`accent:text`）。ズレるとキャッシュが二重化するので合わせる

---

## 7. Claude への申し送り

- 音声の取得・生成・**永続ストックは元から GAS/Drive 側**。今回 warm を足し「本体を運ばず Drive を温める」ことで初期負荷を低減
- 既存 TTS ヘルパは ACCENT 依存。プリフェッチ用に accent 明示版を追加し、キー体系を既存と一致させること
- 連結句 warm、反対アクセントのアイドル先読みは将来拡張余地
