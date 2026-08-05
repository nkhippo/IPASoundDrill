# tts-design.md — TTS プロンプト設計の単一ホーム

`gpt-4o-mini-tts`（GAS プロキシ経由）の instructions 設計・RP/GA 分岐・クライアント prefetch・GA バッチ warm の唯一のホーム。
旧 `docs/DESIGN.md` §3、旧 `docs/REPOSITORY-STRUCTURE.md`「GAS / audio」「R4 pending」を統合継承。

---

## 1. 入力・設計意図・既知の限界

OpenAI `gpt-4o-mini-tts` を GAS プロキシ経由で呼ぶ。**1語でも学習効果を最大化する**ため、`instructions` を固定文で厳密に指定する。

### 入力

- `input` = 対象語そのもの（綴り）
- `instructions`（全リクエスト共通の固定文）:

```
Pronounce the single English word in a clear General American accent.
Use the citation (dictionary) form: full, unreduced vowels and the correct
lexical stress — do not use the weak or reduced connected-speech form, even
for function words. Say the word once, at a calm pace slightly slower than
conversational, with neutral falling intonation. Articulate consonants
precisely and keep contrasts distinct — especially /θ/–/f/, /ð/–/d/,
/l/–/r/, /s/–/ʃ/, /b/–/v/, and word-final consonants — but stay natural and
never exaggerate them into distortion. Do not spell the word, do not add any
other words, do not pause, and do not use emotional or expressive delivery.
Keep the delivery identical and consistent across all words.
```

### 設計意図（なぜこの指示か）

- **citation（辞書）形を強制** — 表示する IPA（例 `to` `/tu/`、`of` `/ʌv/`、`the` `/ðə/`）と音を一致させる。連結時の弱形が出ると学習ループが壊れるため。
- **General American** — データが GA/CMU 基準。
- **やや遅く・精緻な調音** — 知覚訓練が本丸。音から覚える目的でのミニマルペア弁別（θ/f, ð/d, ʃ/tʃ 等）が成立するには各対立が明瞭に区別される必要がある。
- **誇張しない** — 過剰強調は歪んだ音素を教えてしまう。自然な範囲で明瞭に。
- **一定・無感情・1回** — 毎回同じ参照音を作り、学習者が安定したターゲットを内在化できる。再生の繰り返しはアプリ側の再生ボタンで対応。

### 既知の限界（低優先・将来）

同綴異音語（read, live, wind, lead 等）は TTS が意図と違う読みを返し得る。必要なら語に読み分けヒントを添える運用を将来検討（現データ規模では低優先）。

---

## 2. RP TTS

- **単語:** `GET ?word=...&accent=ga|rp`（既定 `ga`）。`instructions` を GA/RP で分岐。voice は `alloy` 据え置き。
- **キャッシュキー:** Drive `{slug}__{accent}_v2.mp3`、localStorage `ipa_tts_v2:{accent}:{slug}`。旧 `{slug}_v2.mp3` / 無 accent キーは GA として後方互換。
- **連結句:** GA 固定（`?phrase=` + `accent=ga`）。RP 連結音声は別タスク。
- **弱形:** `GET ?weak=/IPA/&ww=word&accent=ga|rp`。`instructions` は弱形（連結内の reduced form）を強制。`input` はキャリア文内の機能語綴り。GA/RP で `TTS_WEAK_INSTRUCTIONS_*` を分岐。
- 詳細: `docs/reference/rp-tts-design-and-priority.md`、`docs/cursor/reports/cursor-implementation-report-weak-forms.md`

### 2a. RP accent 差改善 PoC v3（Issue #287、段階検証中）

**背景**: 現行 `gpt-4o-mini-tts` + 綴り入力では、GA/RP を `instructions` テキストで分岐しても、代表 12 語の試聴で **8/12 で accent 差が聞き取れない**（詳細: `docs/handoff/2026-08-02_tts-ga-rp-improvement.md`）。特に rhoticity / GOAT vowel / LOT vowel / TRAP-BATH の音素差が再現されない。

**代替 backend 検証結果**: `gpt-audio`（Chat Completions API）+ IPA 直接入力（`rp_ipa` フィールドを `/…/` 形式で input に渡す）で、以下のカテゴリで RP 差が明瞭化:

| カテゴリ | 効くパターン | 効かないパターン |
|---|---|---|
| rhoticity | 語末 unstressed `-r`（picture, container 型） | 強勢の `/ɝ/-/ɜː/`（first, chirp 型） |
| goat_vowel | monosyllable（home 型） | multisyllable（control, roast 型） |
| trap_bath | 全般（chance 型） | — |
| lot_vowel | **なし**（gpt-audio でも `/ɑ/-/ɒ/` は出せない） | 全て |

**gpt-audio の既知の failure mode** (単純採用不可、healing pipeline 必須):
- 会話返答（`roast` → "I'm here and ready" 等）
- 無音返答（特に `/həʊm/` で 5/6 の頻度）
- スペリング読み（`first` → "F-R-S-T"）
- 発話開始が早すぎる（lead silence 40-70ms）
- 補助として使う Whisper が silence を "you"/"the" と幻覚 → RMS 波形分析必須

**Healing pipeline** (`~/tts-poc-v3/heal_v2.py`):
```
generate → validate (RMS + Whisper + duration + lead_silence)
  ├─ PASS → save
  ├─ NO_LEAD only → post-process (250ms silence pad) → WAV 保存
  ├─ SILENT/VERBOSE/SLOW → retry with progressive prompt strategies
  └─ N 回失敗 → best-available (audible attempt) を保存 (PARTIAL 状態)
```

**Prompt 戦略** (progressive cascade、`ga_rp_same_reason` によっては `V2_GO` から開始):
- `V2_GO`: 単語/IPA を system message に埋め込み、user は "GO" だけ送る → 会話文脈を切断
- `V4_LEADPAD`: 「200-300ms silence で始めて、1.5秒以内で話せ」を明示
- `V3_QUOTE`: user 側を `Say only: "<word>"` の形式で明示

**Rollout 計画** (~425 語の RP を `gpt-audio` で再生成、GA は M1 継続、`TTS_CACHE_VER` v2→v3 bump は Phase C):

| Phase | 内容 | 状態 |
|---|---|---|
| A | 対象語抽出 + gpt-audio 生成 + healing pipeline 通過 | 未実行 (次 Chat) |
| B | Drive `TTS-Audio` に `{slug}__rp_v3.mp3` として upload、サンプル 20 語試聴 | 未実行 |
| C | `TTS_CACHE_VER` v3 bump PR (L3 判定、Naoya ack 必須)、v3 未生成語は M1 fallback | 未実行 |

詳細は Issue #287 と `docs/handoff/2026-08-02_tts-ga-rp-improvement.md`「PoC v3 試聴結果 + 大量生成 rollout 計画」セクション。

---

## 3. クライアント TTS プリフェッチ

全目的でキュー追加時に音声を先読みし、初回再生の待ち時間を削減する。

| 定数 | 値 | 役割 |
|------|-----|------|
| `SESSION_INITIAL` | 6 | セッション開始時のキュー投入数（現問＋先読み5） |
| `SESSION_REFILL` | 5 | ストック（現問を除く先読み数）が &lt; 5 のとき追加する問数 |
| `warmChunk` | 6 | `?warm=1` 1 リクエストあたりの語数 |
| `warmParallel` | 2 | warm リクエストの並列数 |
| `bodyParallel` | 3 | 音声 body 取得の並列数 |

**ストック:** `queue.length - idx - 1`（現問を除く先読み数）。初期ロード直後は 5 のためリフィルなし。2問目以降で &lt; 5 になるたびに 5問追加。

**フロー（Phase T 以降）:**
1. `prefetchItemsAudio(batch)` — キューへ追加した分を先読み
2. 単語: 1問目 body を warm 完了前に開始（body-first、FAST PATH）。現アクセント `gasWarm` は非ブロック。残り word は `bodyWorkerBatch` の `warmChunk=6` × parallel Drive DL でバッチ処理。反対アクセント warm は idle 延期
3. body 取得は Drive 公開 URL（`?urls=1`）優先、失敗時は従来 base64（`?word=` 等）
4. 連結句: `?phrase=` body を GA で先読み
5. 弱形: `?weak=` body を GA/RP 両方で先読み
6. setup 表示中はプール先頭を preread（フィルタ変更でキャンセル）
7. スピーカーボタンはキャッシュ準備完了まで `disabled`（全モード共通）
8. `prefetchToken` で古いジョブをキャンセル
9. **accent 切替時 (`prefetchAccentBodies`)** — session 開始と同じ「現問優先 → 以降 background」構造。現問 word の body を単独で fire-and-forget、残り word を `bodyParallel=3` worker で並列消化、連結/弱形は最後に逐次（Issue #261 で明示化）
9. 離脱確認（`#exitConfirmModal`）— Decode / Encode / Mode B Study / Reveal から Menu またはブランドタップ時に Yes/No。Yes → トップ（`1a`）復帰（`goToTop(true)`。再開なし）。Summary・プロフィールではモーダルなし

GAS 側の `?urls=1` / `migratePublicSharing` 反映は `docs/reference/remaining-ops-checklist.md`。

---

## 4. GA バッチ warm（GAS 時間トリガー）

全 **5,397** 語の GA 音声を Google Drive に事前ストックするオフラインジョブ。`tools/tts/gas/BatchWarm.gs` + `tools/tts/gas/BatchWords.gs`（`tools/data-pipeline/export_batch_words.py` で生成）。

| 定数 | 値 |
|------|-----|
| `BATCH_MAX_WORDS_PER_RUN` | 500 |
| `BATCH_MAX_MS` | 5.75 分 |
| `BATCH_OPENAI_PARALLEL` | 20（`UrlFetchApp.fetchAll`） |

- 時間トリガー `batchWarmGA()` が 5 分間隔で実行（`installBatchTriggerGA(5)`）
- 既存 Drive キャッシュは `cached` でスキップ（OpenAI 課金なし）
- 短すぎる blob は `isAudioBlobTooShort_()` で検出・再生成
- 進捗: `getBatchStatusGA()` / スクリプトプロパティ `BATCH_INDEX_GA`
- 任意: スプレッドシート `BATCH_SPREADSHEET_ID` で語彙リストを上書き

詳細: `tools/tts/gas/README.md` §GA 一括バッチ

---

## 5. GAS / audio 運用

| File | Role |
|------|------|
| `tools/tts/gas/Code.gs` | TTS proxy（word / phrase / weak / warm / `?urls=1`） |
| `tools/tts/gas/BatchWarm.gs` | Scheduled GA Drive pre-generation |
| `tools/tts/gas/BatchWords.gs` | Word list for batch warm（**5,397 語** — `export_batch_words.py` で更新） |
| `tools/tts/gas/README.md` | Deploy + API reference |
| 手動残作業 | `docs/reference/remaining-ops-checklist.md`（再デプロイ・`migratePublicSharing`・BatchWarm） |

## 6. R4 pending（TTS レビュー）

| Asset | Path |
|-------|------|
| 機械抽出リスト | `tools/data-pipeline/pipeline/phase2a_review_needed.json`（127 語） |
| 作業用リスト（拡張） | `tools/data-pipeline/pipeline/r4_pending_review_list.json` / `.csv` |
| 手順ガイド | `docs/reference/r4-pending-review-guide.md` |

---

_旧 `docs/DESIGN.md` §3、旧 `docs/REPOSITORY-STRUCTURE.md`「GAS / audio」「R4 pending」を統合継承（Issue #172）。_
