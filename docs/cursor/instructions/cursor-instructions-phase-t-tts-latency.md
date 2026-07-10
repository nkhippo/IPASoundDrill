# Cursor 指示書 — TTS 1問目遅延の解消 (Phase T)

- 対象リポジトリ: `nkhippo/English-Pronunciation-Trainer`
- 想定 branch: `feat/phase-t-tts-latency`
- 優先度: 高（全ユーザー・全モードで発生している 20 秒 UX バグ）
- 前提: Phase R 完了済み。2026-06 の TTS プリフェッチ B+A 方式（`docs/cursor/reports/cursor-implementation-report-tts-prefetch.md`）が実装済み
- 段取り: **T1 → T2 → T3 → T4 の順で phase 単位に commit**

---

## 0. サマリ

| Phase | 施策 | 想定効果 | 実装コスト |
|---|---|---|---|
| **T1** | 1問目 body-first + warm de-gate + RP warm を Start 時スキップ | 20s → 5s (cold) / 20s → 3s (warm) | 小 |
| **T2** | Drive 直リンク URL API (`?urls=1`) 導入 | 500ms 未満 (warm start / Drive-cached) | 中 |
| **T3** | セットアップ画面での候補語 preread | ~200ms (LS ヒット) | 中 |
| **T4** | 検証・ドキュメント | — | 小 |

### 実測ベースの分析

現状の 20 秒は下記の推定内訳:

```
Start
├─ gasWarm(GA) : 6語 × ~3s (RP は多数未生成、GA は cached 多) = 3-18s
├─ gasWarm(RP) : 6語 × ~3s (ほぼ generated)                  = 15-18s
└─ Promise.all で並列 → max(GA, RP) = 18s 待機
   └─ その後ようやく body fetch(GA) = 追加 2-3s
```

`prefetchItemsAudio` 内の `await Promise.all([gasWarm(cur), gasWarm(other)])` が **`body fetch` の一切をブロック**しているのが第一の主犯。RP が未生成多数のため RP warm が律速。

Phase T1 だけでこの主犯を除去できる。Phase T2 で GAS プロキシ経由の base64 転送も回避すれば sub-second が可能。

---

## 1. 事前準備

### 1-1. ブランチ作成

```bash
git checkout main
git pull
git checkout -b feat/phase-t-tts-latency
```

### 1-2. 実測ベースライン取得（強く推奨）

Phase T1 実装前に、DevTools Network で以下を計測しておく:

1. localStorage を全クリア（コールドスタート状態を作る）
2. Chrome DevTools → Network → クリア + 記録
3. Start ボタンをクリック
4. 1問目のスピーカーボタンが活性化するまでの wall time を計測
5. Network で `warm=1` と `?word=` の各リクエストの所要時間・レスポンス種別 (`cached` / `generated`) をメモ

**期待:** `warm=1&accent=rp` が最も時間を食っている（`generated` 多数）。この値を Phase T1 完了後と比較する。

### 1-3. 現状スナップショット

以下のファイルをこのままの状態でバックアップ（後で diff 比較用）:

```bash
cp index.html /tmp/index.html.pre_phase_t
cp gas/Code.gs /tmp/Code.gs.pre_phase_t
```

---

# Phase T1 — 1問目 body-first + warm de-gate + RP skip

## T1-1. 目的

`prefetchItemsAudio` の設計を以下のように変更:

1. **1問目 (`items[0].w`) の body fetch を最優先** — warm 完了を待たずに即発火
2. **warm と body の直列ゲートを撤廃** — warm は fire-and-forget、body は独立に走らせる
3. **Start 時の RP warm を完全スキップ** — `requestIdleCallback` で背景 warm のみ実施（既存 `prefetchAccentBodies` の accent 切替時ロジックは維持）

## T1-2. 変更内容

**ファイル:** `index.html`

該当箇所: `prefetchItemsAudio` 関数（L2289 付近）

### 現状（概略）

```javascript
function prefetchItemsAudio(items) {
  // ... audioReady を pending に設定 ...
  refreshAllSpeakers();
  (async () => {
    // ★ ここが主犯: warm 両アクセントの完了を待つ
    await Promise.all([gasWarm(words, cur, token), gasWarm(words, other, token)]);
    // その後、body worker × 3 が走る
    await Promise.all(Array.from({length: PREFETCH.bodyParallel}, bodyWorker));
    // ...
  })();
}
```

### 変更後（fast-path 版）

```javascript
function prefetchItemsAudio(items) {
  prefetchToken++;
  const token = prefetchToken;
  const cur = (ACCENT === "rp") ? "rp" : "ga";
  const other = (cur === "rp") ? "ga" : "rp";
  const words = [...new Set(items.map(c => c.w).filter(Boolean))];
  if (!words.length) return;

  // 全スピーカーを pending に
  for (const w of words) {
    audioReady.set(audioReadyKey(w, cur), "pending");
    audioReady.set(audioReadyKey(w, other), "pending");
  }
  refreshAllSpeakers();

  (async () => {
    // === FAST PATH: 1問目の body 取得を最優先で発火 ===
    // warm 完了を一切待たない。同時に walk-in の body ワーカーも走らせる。
    const firstWord = items[0] && items[0].w;
    if (firstWord && !hasCachedAudioFor(firstWord, cur)) {
      fetchBodyToCache(firstWord, cur, token);   // fire-and-forget
    } else if (firstWord) {
      // 既にキャッシュ済み → 即 ready
      audioReady.set(audioReadyKey(firstWord, cur), "ready");
      refreshSpeakerFor(firstWord, cur);
    }

    // === 現在アクセントの warm は fire-and-forget（body の律速から外す）===
    // 目的: 4問目以降 (body ワーカーが到達する前) の Drive ストック
    gasWarm(words, cur, token);

    // === 残りの語を並列 body 取得 (bodyParallel = 3) ===
    // 1問目も未取得なら FAST PATH と重複するが二重生成は Drive が既存扱いするので実害小
    const remaining = firstWord ? words.filter(w => w !== firstWord) : words.slice();
    let i = 0;
    async function bodyWorker() {
      while (i < remaining.length) {
        if (token !== prefetchToken) return;
        const w = remaining[i++];
        await fetchBodyToCache(w, cur, token);
      }
    }
    await Promise.all(
      Array.from({ length: PREFETCH.bodyParallel }, bodyWorker)
    );

    // === 反対アクセントは Start 時に触らない ===
    // Naoya の運用: RP は Drive 未格納多数、かつユーザーは通常一つのアクセントしか使わない
    // idle 時のみ warm（body 取得は accent 切替時の既存 prefetchAccentBodies が担当）
    scheduleIdle(() => {
      if (token !== prefetchToken) return;
      gasWarm(words, other, token);
    }, 8000);  // 8秒後 or idle 到来時
  })();
}

// scheduleIdle ヘルパ (index.html 冒頭のユーティリティ群に追加)
function scheduleIdle(fn, timeout) {
  if (typeof requestIdleCallback === "function") {
    requestIdleCallback(() => fn(), { timeout: timeout || 5000 });
  } else {
    setTimeout(fn, timeout || 5000);
  }
}
```

### 二重発火の考慮

`fetchBodyToCache(firstWord, cur, token)` を fire-and-forget した直後に、body worker のループでも同じ `firstWord` が拾われる可能性がある。ただし:

- `remaining = words.filter(w => w !== firstWord)` で除外している → 二重発火なし
- 万一 firstWord が未定義 (`items[0]` が edge case で無効) の場合は `remaining = words.slice()` として全語を走らせる → 従来動作にフォールバック

### 対象外の残す挙動

以下は **本 Phase では変更しない**:

- `prefetchAccentBodies` (accent 切替時の反対アクセント body 取得) — 現状維持
- `speak()` のフォールバック fetch — 現状維持
- Connected/Weak タブでの直接 body fetch — 現状維持
- `refreshSpeakerFor` / `refreshAllSpeakers` — 現状維持
- `PREFETCH` 定数値 — 現状維持

## T1-3. 実行と検証

### 動作確認手順

1. localStorage を全クリア
2. DevTools Network を開き記録開始
3. Start ボタンをクリック
4. 以下を確認:

| 確認項目 | 期待 |
|---|---|
| 1問目スピーカー活性化までの wall time | **5-8 秒** (Phase T1 前は 15-20 秒) |
| Network で `warm=1&accent=ga` が発生している | ✓ |
| Network で `warm=1&accent=rp` が **Start 時点で発生していない** | ✓ (8秒 idle 後 or 発生しない) |
| `?word={firstWord}&accent=ga` が warm より先に発火 | ✓ (Network タイミングで確認) |

### 自動チェック (コンソール)

```javascript
// Start 直後にコンソールで:
console.log("audioReady:", Array.from(audioReady.entries()).filter(([k,v]) => k.startsWith("ga:")));
// → 1問目が最初に "ready" になる
```

## T1-4. コミット

```bash
git add index.html
git commit -m "perf(tts): fast-path first-word body fetch, de-gate warm, skip RP warm on start

- prefetchItemsAudio: fire body fetch for items[0] immediately without waiting for warm
- warm (current accent) becomes fire-and-forget; no longer blocks body pipeline
- opposite accent (typically RP) warm deferred to requestIdleCallback (8s)
- expected cold-start latency: 20s -> 5-8s"
```

---

# Phase T2 — Drive 直リンク URL API

## T2-1. 目的

現在の `?word=X&accent=ga` は Drive → base64 → JSON → クライアントで atob → Blob URL という重い経路。Drive にキャッシュ済みなら、**Drive の公開 URL** を返してクライアントが直接ダウンロードすれば大幅に軽い。

- **RTT 1回: GAS へ URL リストを要求** (~200-500ms)
- **RTT N回: Drive から直接 mp3 を並列取得** (~100-300ms/語、10並列)
- **合計: cached 語なら sub-second**

Drive のパブリック共有は Naoya 許諾済み。**TTS 用音声ファイル (`*_v2.mp3`, `*_v4.mp3`, `*_weak_v2.mp3`) に限定**して `ANYONE_WITH_LINK` にする。

## T2-2. GAS 側の変更

**ファイル:** `gas/Code.gs`

### (a) 保存時にパブリック共有を設定

`saveToDrive_` 関数を修正。ファイル保存直後に共有権限をパブリックに変更する。

**現状（推定）:**
```javascript
function saveToDrive_(word, accent, blob) {
  // ... file を作成 or 更新 ...
  return file;
}
```

**変更後:**
```javascript
function saveToDrive_(word, accent, blob) {
  // ... file を作成 or 更新 ... (既存ロジック)
  try {
    file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  } catch (e) {
    // 共有設定失敗は非致命（次回のトリガーで再試行）
    Logger.log("setSharing failed for " + word + " (" + accent + "): " + e);
  }
  return file;
}
```

**注意:** 既に Drive に格納されている過去分のファイルは**個別にはパブリック化されない**。次項 (d) の migrate 関数で一括対応する。

### (b) パブリック URL 生成ヘルパ

```javascript
function getPublicUrl_(fileId) {
  return "https://drive.google.com/uc?export=download&id=" + fileId;
}
```

**代替 URL 形式（もし CORS で問題があった場合）:**
```javascript
// return "https://drive.usercontent.google.com/download?id=" + fileId + "&export=download";
```

Cursor は最初 `drive.google.com/uc` で試し、DevTools Console に CORS エラーが出たら `drive.usercontent.google.com/download` に切替。

### (c) 新エンドポイント `?urls=1&words=...&accent=...`

`doGet` に分岐追加。既存 warm と同じ構造だが、レスポンスに URL を含める。**上限は warm と同じ 6 語まで。**

```javascript
// doGet の冒頭に:
if (e && e.parameter && e.parameter.urls) return handleUrls_(e);

function handleUrls_(e) {
  const accent = normalizeAccent_(e.parameter.accent);
  const raw = String(e.parameter.words || "").trim();
  if (!raw) return jsonResponse_({ ok: false, error: "no words" });
  const words = raw.split(",").map(s => s.trim()).filter(Boolean).slice(0, WARM_MAX);
  const results = words.map(w => resolveUrlOne_(w, accent));
  return jsonResponse_({ ok: true, accent: accent, results: results });
}

function resolveUrlOne_(word, accent) {
  if (!/^[a-zA-Z][a-zA-Z'-]*$/.test(word)) {
    return { word: word, status: "failed", error: "invalid" };
  }
  // Drive 検索。getAudioFromDrive_ が blob を返すなら fileId 取得の別関数を追加
  let file = getAudioFileFromDrive_(word, accent);  // 新規: File オブジェクト or null を返す
  if (file) {
    // 過去保存で共有設定されていない可能性 → 都度確認・設定 (idempotent)
    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch(e) {}
    return { word: word, status: "cache", url: getPublicUrl_(file.getId()) };
  }
  // 未生成 → 既存 warmOne_ と同じロジックで生成
  try {
    const instructions = instructionsFor_(accent, false);
    const fresh = fetchFromOpenAIWithRetry_(word, instructions);
    if (!isAudioBlobTooShort_(fresh)) {
      const saved = saveToDrive_(word, accent, fresh);  // saveToDrive_ 内で共有設定済
      return { word: word, status: "openai", url: getPublicUrl_(saved.getId()) };
    }
    return { word: word, status: "failed", error: "too_short" };
  } catch (err) {
    return { word: word, status: "failed", error: String(err.message || err).slice(0, 120) };
  }
}
```

### (d) 既存 Drive 音声の一括パブリック化 (`migratePublicSharing`)

過去に生成済みのファイルはまだプライベート。ワンショット関数を追加してエディタで手動実行する:

```javascript
function migratePublicSharing() {
  const folder = getOrCreateFolder_("IPA-TTS-Audio");
  const files = folder.getFiles();
  let n = 0, ok = 0, ng = 0;
  while (files.hasNext()) {
    n++;
    const f = files.next();
    try {
      f.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
      ok++;
    } catch (e) {
      ng++;
      Logger.log("migrate failed for " + f.getName() + ": " + e);
    }
    if (n % 100 === 0) Logger.log("progress: " + n + " (" + ok + " ok, " + ng + " failed)");
  }
  Logger.log("DONE: " + n + " files, " + ok + " public, " + ng + " failed");
}
```

**Naoya が手動で 1 回実行**（GAS エディタで `migratePublicSharing` を選択して実行）。所要時間は Drive のファイル数次第で数分〜十分程度。

**注意:** `getAudioFileFromDrive_` は現状 `getAudioFromDrive_` (blob 版) と同じ検索ロジックを流用するが blob ではなく File オブジェクトを返す。既存 `getAudioFromDrive_` の内部から共通化することを推奨。

### (e) 新 URL エンドポイントの動作確認

GAS Web App を再デプロイ後、以下を curl で確認:

```bash
GAS_URL="https://script.google.com/macros/s/{DEPLOYMENT_ID}/exec"
curl -sSL "$GAS_URL?urls=1&words=cat,dog,run&accent=ga" | jq .
```

**期待出力:**
```json
{
  "ok": true,
  "accent": "ga",
  "results": [
    { "word": "cat", "status": "cache", "url": "https://drive.google.com/uc?export=download&id=..." },
    { "word": "dog", "status": "cache", "url": "..." },
    { "word": "run", "status": "cache", "url": "..." }
  ]
}
```

各 URL を curl でも取得してみる:
```bash
curl -sSL "https://drive.google.com/uc?export=download&id={FILE_ID}" -o /tmp/test.mp3
file /tmp/test.mp3
# → MPEG ADTS, layer III, ...
```

## T2-3. クライアント側の変更

**ファイル:** `index.html`

### (a) URL バッチ取得ヘルパ

新規関数を `fetchAudioFromGasAccent` の近く（L2064 付近）に追加:

```javascript
async function fetchUrlsFromGas(words, accent) {
  // words: 語の配列 (最大 6 まで — GAS 側 WARM_MAX と一致)
  const chunk = words.slice(0, 6);
  const q = "urls=1&accent=" + accent + "&words=" + encodeURIComponent(chunk.join(","));
  const res = await fetch(GAS_TTS_URL + "?" + q);
  if (!res.ok) throw new Error("GAS HTTP " + res.status);
  const data = await res.json();
  if (!data.ok) throw new Error(data.error || "GAS urls error");
  // { word: url } の Map として返す
  const map = new Map();
  for (const r of data.results) {
    if (r.url) map.set(r.word, r.url);
  }
  return map;
}

async function fetchAudioFromDriveUrl(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error("Drive HTTP " + res.status);
  const buf = await res.arrayBuffer();
  // ArrayBuffer → base64
  const bytes = new Uint8Array(buf);
  let bin = "";
  for (let i = 0; i < bytes.length; i++) bin += String.fromCharCode(bytes[i]);
  return { mimeType: "audio/mpeg", audio: btoa(bin) };
}
```

### (b) `fetchBodyToCache` を URL 優先経路に切替

**現状（推定）:**
```javascript
async function fetchBodyToCache(word, accent, token) {
  // ... hasCachedAudioFor チェック ...
  const data = await fetchAudioFromGasAccent(word, accent);  // ★ base64 経路
  saveAudioToLSAccent(word, accent, data.mimeType, data.audio);
  // ...
}
```

**変更後:**
```javascript
async function fetchBodyToCache(word, accent, token) {
  const key = audioReadyKey(word, accent);
  if (hasCachedAudioFor(word, accent)) {
    audioReady.set(key, "ready");
    refreshSpeakerFor(word, accent);
    return;
  }
  try {
    // ★ 新経路: GAS で URL を取得 → Drive から直接 fetch
    const urlMap = await fetchUrlsFromGas([word], accent);
    const url = urlMap.get(word);
    if (url) {
      const data = await fetchAudioFromDriveUrl(url);
      saveAudioToLSAccent(word, accent, data.mimeType, data.audio);
      // mem キャッシュにも入れる (既存 speak() ロジックとキー整合)
      const mkey = memKeyAccent(word, accent);
      memAudioCache.set(mkey, { mime: data.mimeType, b64: data.audio });
      audioReady.set(key, "ready");
      refreshSpeakerFor(word, accent);
      return;
    }
    // URL 取得失敗 → 従来の base64 経路にフォールバック
    const data = await fetchAudioFromGasAccent(word, accent);
    saveAudioToLSAccent(word, accent, data.mimeType, data.audio);
    audioReady.set(key, "ready");
    refreshSpeakerFor(word, accent);
  } catch (e) {
    audioReady.set(key, "failed");
    refreshSpeakerFor(word, accent);
  }
}
```

### (c) バッチ URL 経路の活用 (オプション最適化)

Phase T1 では body worker が 1 語ずつ `fetchBodyToCache` を呼ぶが、Phase T2 導入後は **6 語まとめて URL を取得 → 並列 Drive fetch** の方が RTT を節約できる:

```javascript
// prefetchItemsAudio 内、既存の bodyWorker × PREFETCH.bodyParallel を以下に置換:
async function bodyWorkerBatch() {
  // words をチャンクに分割 (6 語ずつ = GAS urls 上限)
  const chunks = [];
  for (let k = 0; k < remaining.length; k += 6) {
    chunks.push(remaining.slice(k, k + 6));
  }
  for (const chunk of chunks) {
    if (token !== prefetchToken) return;
    try {
      const urlMap = await fetchUrlsFromGas(chunk, cur);
      // 並列 Drive fetch
      await Promise.all(chunk.map(async (w) => {
        if (token !== prefetchToken) return;
        if (hasCachedAudioFor(w, cur)) {
          audioReady.set(audioReadyKey(w, cur), "ready");
          refreshSpeakerFor(w, cur);
          return;
        }
        const url = urlMap.get(w);
        if (!url) throw new Error("no url for " + w);
        const data = await fetchAudioFromDriveUrl(url);
        saveAudioToLSAccent(w, cur, data.mimeType, data.audio);
        memAudioCache.set(memKeyAccent(w, cur), { mime: data.mimeType, b64: data.audio });
        audioReady.set(audioReadyKey(w, cur), "ready");
        refreshSpeakerFor(w, cur);
      }));
    } catch (e) {
      // チャンク失敗時は語別に旧経路にフォールバック
      for (const w of chunk) {
        if (token !== prefetchToken) return;
        await fetchBodyToCache(w, cur, token);  // 内部で URL → base64 フォールバック
      }
    }
  }
}
await bodyWorkerBatch();  // 従来の Promise.all(Array.from(...bodyWorker)) の代わりに
```

これで 6 語 × N chunk が **1 chunk = URL取得(1RTT) + Drive並列fetch** で処理される。

### (d) FAST PATH の 1 問目も URL 経路を優先

Phase T1 で追加した `fetchBodyToCache(firstWord, cur, token)` は既に上記 (b) の修正で URL 経路になる。追加変更不要。

## T2-4. 実行と検証

### GAS デプロイ

1. `gas/Code.gs` の変更を GAS エディタに反映
2. `migratePublicSharing` を **エディタから 1 回だけ手動実行**（過去分の Drive ファイルをパブリック化）
3. **新しいバージョンとしてデプロイ**（メニュー: デプロイ → デプロイを管理 → 編集 → 新しいバージョン）
4. `GAS_TTS_URL` は既存の `/exec` エンドポイントのまま（URL は変わらない）

### クライアント動作確認

1. localStorage 全クリア
2. DevTools Network を開く
3. Start
4. Network で以下が発生することを確認:
   - `?urls=1&words=...&accent=ga` (1問目 fast path)
   - 続いて `drive.google.com/uc?export=download&id=...` の並列 fetch
   - `?warm=1` は現在アクセントだけ発生（RP は idle まで発生しない）

### レイテンシ計測

Phase T1 完了時と比較:

| シナリオ | Phase T1 のみ | Phase T2 追加後 |
|---|---|---|
| Cold start (Drive 未生成) | 5-8 秒 | 5-8 秒 (変わらず、生成が律速) |
| Warm start (Drive cached, LS 空) | 3 秒 | **500ms 未満** |
| 完全ホットスタート (LS ヒット) | 200ms | 200ms (LS ヒットは変わらず) |

## T2-5. コミット

```bash
git add gas/Code.gs gas/README.md index.html
git commit -m "perf(tts): add Drive public-URL endpoint (?urls=1) for direct client fetch

GAS:
- new handleUrls_ endpoint returns Drive public URLs instead of base64
- saveToDrive_ now sets ANYONE_WITH_LINK sharing on save
- new migratePublicSharing() to backfill existing audio files (run once)

Client:
- fetchUrlsFromGas + fetchAudioFromDriveUrl helpers
- fetchBodyToCache now prefers URL path with base64 fallback
- prefetch body worker batches 6 words per URL request

Expected: warm-start latency 3s -> 500ms via GAS proxy bypass on cached files."
```

---

# Phase T3 — セットアップ画面での候補語 preread

## T3-1. 目的

ユーザーが CEFR やモードを選んでいる数秒〜数十秒の間、TTS 通信は完全にゼロ。ここを **候補語のバックグラウンド先読み** に使う。フィルタ変更時にはキャンセルして再スタート。

**期待効果:** ユーザーが Start を押したとき、1問目候補が既に LS/mem に存在している → 完全ホットスタート (~200ms)。

## T3-2. 変更内容

**ファイル:** `index.html`

### (a) セットアップ画面用の preread フック

`updatePool()` (プール件数を更新する既存関数、setup 画面のフィルタ変更時に呼ばれる) の末尾に preread トリガーを追加:

```javascript
// updatePool の末尾 (setup 画面表示中のみ実行)
function schedulePoolPreread() {
  // Setup 画面表示中でなければスキップ
  if (!document.getElementById("setup") || document.getElementById("setup").classList.contains("hidden")) return;
  // Session 進行中はスキップ
  if (S && S.queue && S.queue.length > 0) return;

  prefetchToken++;  // 既存の warm/body 途中を中断
  const token = prefetchToken;

  scheduleIdle(() => {
    if (token !== prefetchToken) return;
    // 現在のフィルタ設定で先頭 N 語だけ preread
    const preview = buildSessionPool ? buildSessionPool() : [];
    const N = 6;  // Start 直後に必要な語数と同じ
    const words = preview.slice(0, N).map(c => c && c.w).filter(Boolean);
    if (!words.length) return;
    const cur = (ACCENT === "rp") ? "rp" : "ga";
    // 未キャッシュ語だけ URL 経路で取得 (Phase T2 の fetchUrlsFromGas を使う)
    const uncached = words.filter(w => !hasCachedAudioFor(w, cur));
    if (!uncached.length) return;
    (async () => {
      try {
        const urlMap = await fetchUrlsFromGas(uncached, cur);
        for (const w of uncached) {
          if (token !== prefetchToken) return;
          const url = urlMap.get(w);
          if (!url) continue;
          const data = await fetchAudioFromDriveUrl(url);
          saveAudioToLSAccent(w, cur, data.mimeType, data.audio);
          memAudioCache.set(memKeyAccent(w, cur), { mime: data.mimeType, b64: data.audio });
        }
      } catch (e) { /* preread 失敗は静かに無視 */ }
    })();
  }, 3000);  // フィルタ操作が落ち着くのを 3 秒待つ
}
```

### (b) `updatePool()` の末尾で呼び出す

既存の `updatePool` 関数（setup 画面でフィルタ変更・CEFR 変更時に呼ばれる）を探し、末尾に追加:

```javascript
function updatePool() {
  // ... 既存: プール件数を再計算・DOM 更新 ...
  schedulePoolPreread();   // 追加
}
```

### (c) `startSession()` で preread を尊重

`startSession` の冒頭で `prefetchToken` を増分せず、既存の preread 結果を活かす:

- 現状 `prefetchItemsAudio` の冒頭で `prefetchToken++` している
- これは preread をキャンセルするが、preread した結果 (localStorage / memAudioCache) は残るので問題なし
- 追加変更不要（既存の LS/mem チェックが自動で hit する）

## T3-3. 実行と検証

### 動作確認手順

1. localStorage 全クリア
2. アプリを開く（setup 画面）
3. **何もせず 5 秒待つ**
4. DevTools Network で以下を確認:
   - `?urls=1` が 1 回発生
   - Drive fetch が最大 6 語分並列で発生
5. Start をクリック
6. **1問目スピーカーがほぼ即活性化** (LS ヒットのため fetch なし)

### フィルタキャンセルの確認

1. localStorage クリア → アプリ開く
2. 3 秒後、preread が始まる
3. **preread 途中で CEFR フィルタを変更**
4. Network で以下:
   - 新しい URLs リクエストが発生
   - 古い Drive fetch は中断される (`prefetchToken` 増分により)
   - LS には新フィルタの語だけが残る

## T3-4. コミット

```bash
git add index.html
git commit -m "perf(tts): pre-read top-N pool words on setup screen idle

- schedulePoolPreread runs on updatePool() during setup, deferred 3s + idle
- fetches URLs then Drive-directly caches top 6 words for current accent
- cancels on prefetchToken increment (filter changes, Start button)
- expected: warm-start with completed preread → ~200ms LS hit"
```

---

# Phase T4 — 検証・ドキュメント

## T4-1. 一括計測

localStorage 全クリア → Chrome DevTools → Performance タブで記録:

| シナリオ | 計測方法 | Phase 前 | 目標 | 実測 |
|---|---|---|---|---|
| Cold start (Drive 未生成) | LS クリア → Start | 20s | < 8s | ? |
| Warm start (Drive cached, LS 空) | LS クリアだけ、Drive は既 warm 済 | 15s | < 1s | ? |
| Preread hit | LS クリア → 5秒待つ → Start | 20s | < 500ms | ? |
| Hot start (LS ヒット) | 一度 Start → セッション終了 → 再度 Start | 200ms | 200ms | ? |

## T4-2. ドキュメント更新

### (a) `docs/PURPOSE.md` の changelog に追加

```markdown
| 2026-07-XX | v3.22 | Phase T: TTS 1問目遅延解消。fast-path body-first、warm de-gating、Start時RP warm skip、Drive 直リンク URL API (`?urls=1`)、setup 画面 preread。cold-start 20s→5s / warm-start 20s→500ms。 |
```

### (b) `gas/README.md` に新 URL API 追記

`## API` セクションの `GET ?warm=1&...` の隣に:

```markdown
`GET ?urls=1&words=luck,colour&accent=ga`（Drive公開URL取得。cached はそのまま返す、未生成なら OpenAI 生成後に URL 返却）
```

`## キャッシュ` セクションに追記:

```markdown
**Drive パブリック共有:** 音声ファイル (`*_v2.mp3`, `*_v4.mp3`, `*_weak_v2.mp3`) は保存時に `ANYONE_WITH_LINK` に設定される。クライアントは `?urls=1` で URL を取得後、`https://drive.google.com/uc?export=download&id=...` から直接 fetch する。
```

### (c) 実装レポート `docs/cursor/reports/cursor-implementation-report-phase-t.md` 新規作成

```markdown
# Cursor 実装レポート — Phase T (TTS 1問目遅延解消)

- 実施日: 2026-07-XX
- 指示書: `docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md`
- ブランチ: `feat/phase-t-tts-latency`

## 1. 実施内容

### T1: 1問目 body-first + warm de-gate + RP skip
### T2: Drive 直リンク URL API
### T3: セットアップ画面 preread

## 2. レイテンシ計測結果

（T4-1 の実測表を貼る）

## 3. commit 一覧

(git log --oneline)

## 4. 変更ファイル

## 5. 未対応事項
- RP 用 GA バッチ (BatchWarm.gs RP 版) は別タスク
- Connected/Weak タブの URL 化は別タスク
```

## T4-3. コミット

```bash
git add docs/PURPOSE.md docs/cursor/reports/cursor-implementation-report-phase-t.md gas/README.md
git commit -m "docs(phase-t): TTS latency changelog + implementation report + gas readme"
```

## T4-4. マージ

```bash
git checkout main
git merge --no-ff feat/phase-t-tts-latency
git push origin main
```

---

## テスト項目（Phase 全体）

| # | 項目 | 期待 |
|---|---|---|
| 1 | Start → 1問目 wall time (cold) | < 8s |
| 2 | Start → 1問目 wall time (warm, Drive cached) | < 1s |
| 3 | Preread 完走後 Start | < 500ms |
| 4 | Start 時に `warm=1&accent=rp` が発生しない | ✓ (idle まで) |
| 5 | `?urls=1` が Drive URL を返す | ✓ |
| 6 | Drive 直リンクが CORS エラーなしで fetch できる | ✓ |
| 7 | setup 画面でフィルタ変更 → preread キャンセル | ✓ |
| 8 | Session 中に `speak()` フォールバックが動く | ✓ |
| 9 | Connected/Weak タブは従来通り動作 | ✓ (対象外) |
| 10 | Mode B の自動再生も 250ms 後に確実に鳴る | ✓ |

---

## Q&A（Cursor 実装時の想定質問）

### Q1: Phase T1 で 1問目 body fetch と warm(GA) が同時に発火する。同じ語で二重生成される可能性は？

**A:** `remaining` から `firstWord` を除外しているため body ワーカーは 1問目を再取得しない。ただし GA warm は 1問目も含む全 6 語を対象とする。warm と body が同じ語で並行走行する場合、GAS 側で Drive を先に見に行くので、body が先に生成して Drive に保存すれば、warm は `cached` として即返る。OpenAI 二重課金の可能性は極少数のレースケースのみ（実害小）。

### Q2: Phase T2 の Drive 直リンク URL は 401/403 になる可能性は？

**A:** `setSharing(ANYONE_WITH_LINK, VIEW)` を saveToDrive_ 内で毎回呼ぶため新規保存分は必ずパブリック。過去分は `migratePublicSharing` の 1 回実行でカバー。`resolveUrlOne_` でも念のため setSharing を idempotent に再呼び出しするので、失敗時 (レア) も次回リクエストで自動修復。

### Q3: `drive.google.com/uc?export=download` は CORS 対応しているか？

**A:** GET 経由でパブリック共有ファイルにアクセスする場合、Google は CORS を許可する。**ただし念のため実装後に DevTools Console で確認**。もし CORS エラーが出た場合は代替 URL `https://drive.usercontent.google.com/download?id=...&export=download` に切替。両方失敗する場合は base64 経路にフォールバック済み（`fetchBodyToCache` の catch）。

### Q4: Phase T3 の preread がユーザーの通信量を無駄に食わないか？

**A:** 最大 6 語 × ~12KB = 72KB（Drive 経由）+ ~200B（URL リスト）程度。preread 実行条件を idle callback で制御し、フィルタ変更時にキャンセル。通信量はほぼ問題にならない範囲。

### Q5: warm を完全に削除してよいか？

**A:** 削除しない。Phase T1 では **body 未取得の 4-6 番目以降の語** に対して warm が Drive 事前生成の役割を果たす。もし将来「全語 URL 経路 + Drive 常時パブリック」に統一するなら削除可能だが、本 Phase では現状維持で保守的に進める。

### Q6: `?urls=1` は上限を warm と同じ 6 語にしているが、もっと多くても良いのでは？

**A:** GAS の実行タイムアウト（約 6 分）と、未生成語の OpenAI 生成が直列である現行仕様の制約。6 語 × 5秒 = 30秒でも安全マージンあり。将来 OpenAI 並列化（`UrlFetchApp.fetchAll`）で拡張可能だが本 Phase では現状踏襲。

### Q7: `migratePublicSharing` 実行中にユーザーがアクセスしても大丈夫か？

**A:** 大丈夫。setSharing は idempotent かつファイル別に処理するため、途中でアクセスがあっても既存の TTS フロー（base64 経路含む）は動作継続。

### Q8: Phase T2 で Drive fetch が失敗したときの UX は？

**A:** `fetchBodyToCache` の catch で `audioReady` を `failed` にセット。UI 上、スピーカーは活性化するが、押下時 `speak()` が既存の `fetchAudioFromGas` (base64 経路) で最終フォールバック。ユーザーは待つが再生は必ずできる。

### Q9: `refreshSpeakerFor` の判定は変更不要か？

**A:** 変更不要。`audioReady` の状態遷移と `refreshSpeakerFor` の関係は維持（`ready` → 活性、`pending` → 非活性、`failed` → 活性で fallback）。

### Q10: Phase T3 で `buildSessionPool` を呼ぶが、これは重い処理では？

**A:** `buildSessionPool` は現状の setup 画面のフィルタ設定に基づく軽量な filter+sort。数百 ms 以内。preread は `scheduleIdle` 経由で 3 秒後に走るので UI をブロックしない。

---

## スコープ外（明示的にやらないこと）

- **Connected/Weak タブの URL 化** — 別 phase。現状の直接 body fetch のまま
- **BatchWarm.gs の RP 版** — 別タスク（GAS スケジューラで RP 一括生成、Naoya 側の運用判断）
- **IndexedDB 移行** — 別タスク（localStorage 5MB 上限を超える場合）
- **base64 経路の削除** — フォールバック用に残す
- **HTTP Range / Service Worker** — 別タスク
- **audio preload="metadata"** — 別タスク（現状の Blob URL 方式のまま）

---

## 変更ファイル一覧

**変更:**
- `index.html` (T1: prefetchItemsAudio / T2: fetchBodyToCache + fetchUrlsFromGas + fetchAudioFromDriveUrl / T3: schedulePoolPreread)
- `gas/Code.gs` (T2: saveToDrive_ 内で setSharing、handleUrls_、resolveUrlOne_、migratePublicSharing、getAudioFileFromDrive_)
- `gas/README.md` (T4: API 追記)
- `docs/PURPOSE.md` (T4: changelog)

**新規:**
- `docs/cursor/reports/cursor-implementation-report-phase-t.md`
- `docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md` (この指示書のコピー)
