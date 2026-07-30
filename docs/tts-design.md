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
2. 単語: 1問目 body を warm 完了前に開始（body-first）。現アクセント `gasWarm` は非ブロック。反対アクセント warm は idle 延期
3. body 取得は Drive 公開 URL（`?urls=1`）優先、失敗時は従来 base64（`?word=` 等）
4. 連結句: `?phrase=` body を GA で先読み
5. 弱形: `?weak=` body を GA/RP 両方で先読み
6. setup 表示中はプール先頭を preread（フィルタ変更でキャンセル）
7. スピーカーボタンはキャッシュ準備完了まで `disabled`（全モード共通）
8. `prefetchToken` で古いジョブをキャンセル
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
