# English Pronunciation Trainer — 実装設計仕様（DESIGN.md）

> `PURPOSE.md` で確定した目的・2モード構成を、Cursorが実装に落とせる粒度まで具体化した仕様。
> 本ドキュメントは「何を作るか（what / how）」の正本。目的の正本は `PURPOSE.md`。
>
> **更新日:** 2026-07-02 ／ **ステータス:** Mode A・Mode B・GA/RP・連結句・弱形・RP TTS・語彙ブラウザ・TTS プリフェッチ・UI 5言語（fil 含む）実装済み

---

## 0. 用語

| 略語 | 意味 |
|---|---|
| Decode | IPA → 単語（読み）。テキスト入力 |
| Encode | 単語 → IPA（書き）。IPAキーボードでタップ組み立て |
| Leitner | 正答で間隔を伸ばし誤答で短縮するSRS方式 |
| 音素近傍 | IPAトークン列のLevenshtein距離が小さい語（confusable distractor） |

---

## 1. Mode A：既知語の発音再学習（本丸）

### 1.1 出題軸の張り替え

旧UIのCEFRレベル（A1+A2 / B1 / B2 / C1）を廃し、**音素フォーカス**を主セレクタにする。

| 軸 | 役割 | UI |
|---|---|---|
| 音素フォーカス（主） | 全部 / トラップ音(θ ð æ ʒ ɝ 等) / 規則グループ / **履歴ベースの弱点** | セットアップの主選択 |
| 規則性（従・任意） | 規則語(phonics) ↔ 不規則語 のフィルタ | 補助トグル |
| 音節数 | 短→長の難易度スキャフォールド | 内部スケール（新規語の出題順） |

**付随する是正（データ）:** C1（0語）はUIから撤去。B1/B2は「上級日常語」ではなく実体（単音節phonics語）なので、レベル表記をやめ、phonics扱いに統合する。

### 1.2 採点（客観のみ・現行踏襲）

| モード | ok | near | bad |
|---|---|---|---|
| Decode | 綴り完全一致 | Levenshtein距離 ≤ 1（入力3文字以上のとき） | それ以外 |
| Encode | IPA（強勢含む）完全一致 | 強勢を除く音素列が一致 | 音素列が不一致 |

自己評価ボタンは設けない。

### 1.3 localStorage スキーマ

```jsonc
// 単語単位（復習スケジュール / Leitner）。Decode・Encode 両方で更新。
"ept_hist_v1": {
  "<word>": { "box": 1, "seen": 0, "ok": 0, "ng": 0, "ts": 0 }
}
// 記号単位（弱点ターゲティング）。Encode のみで更新（PURPOSE §4：Decode誤答は綴りミスが混入し不純）。
"ept_sym_v1": {
  "<symbol>": { "att": 0, "err": 0 }   // errRate = err/att
}
```

- 誤答(bad) → `box=1`（次セッションで再出題）。正答(ok) → `box+1`（最大5、間隔延長）。near は box 据え置き。
- 音声キャッシュ（`ipa_tts_v2:*` 等）とは別キー。

### 1.4 適応出題（1セッション既定10問）

重み付け抽出（比率は調整可・定数化）：
1. **復習期限到来** 約40% … `box` と経過(`ts`)から due な語。
2. **弱点記号ターゲット** 約40% … `ept_sym` の errRate 上位記号を含み、直近未出題の語。
3. **新規カバレッジ** 約20% … 未出題語。音節数 昇順でスキャフォールド。
- セッション内重複なし。選択中の音素フォーカスでフィルタ。
- **コールドスタート（履歴ゼロ）:** 「CEFR A1・短い語」から開始（CEFRはここだけ残し役立てる）。

### 1.5 答え合わせ画面（reveal）の要件 ★要件①

reveal には必ず以下を表示する：

- 出題語（headword）
- 正解IPA（強勢核を琥珀色下線でハイライト）
- **意味（gloss）を現在のUI言語で必ず添える** … gloss は en/ja/zh/ko/fil を保持。UI=fil なら `gloss.fil`（**3,059語完走**）。
- 自分の解答との差分（Encodeはトークン色分け）
- 音声再生（後述TTS）
- 規則語なら綴り規則パターン（`ai → /eɪ/` 等）
- IPA各記号タップで記号解説（後述 §3）

### 1.6 記号タップ解説に例語を添える ★要件②

各IPA記号の解説（口の形・コツ・日本人の注意点）に、**その記号を使う例語を2〜3添える**。初学時にサンプルが無いと音をイメージできないため。例語には個別の再生ボタンを付け、記号が語の中でどう響くかを聴けるようにする。

実装：phonemeデータ `PH[symbol]` に `ex` フィールド（`[{w, ipa}]`）を追加。生成規則は「短い語・A1優先・規則的な綴り」を上位2〜3。下表をシード値として埋め込み、語彙拡張時に再生成する。

```
# シード例語（実データ生成 / w ipa）
p: pay /peɪ/, up /ʌp/, pea /pi/        b: be /bi/, boy /bɔɪ/, bad /bæd/
t: at /æt/, eat /it/, eight /eɪt/       d: add /æd/, day /deɪ/, do /du/
k: key /ki/, cow /kaʊ/, oak /oʊk/       ɡ: egg /ɛɡ/, go /ɡoʊ/, guy /ɡaɪ/
f: if /ɪf/, off /ɔf/, fee /fi/          v: of /ʌv/, vow /vaʊ/, arrive /ɚˈaɪv/
θ: thigh /θaɪ/, earth /ɝθ/, oath /oʊθ/  ð: the /ðə/, they /ðeɪ/, though /ðoʊ/
s: say /seɪ/, saw /sɔ/, ice /aɪs/       z: zoo /zu/, is /ɪz/, as /æz/
ʃ: she /ʃi/, shoe /ʃu/, show /ʃoʊ/      ʒ: garage /ɡɚˈɑʒ/, leisure /ˈlɛʒɚ/, pleasure /ˈplɛʒɚ/
tʃ: chew /tʃu/, each /itʃ/, itch /ɪtʃ/  dʒ: joy /dʒɔɪ/, age /eɪdʒ/, edge /ɛdʒ/
m: me /mi/, may /meɪ/, am /æm/          n: in /ɪn/, an /æn/, knee /ni/
ŋ: king /kɪŋ/, ring /rɪŋ/, long /lɔŋ/   l: ill /ɪl/, all /ɔl/, low /loʊ/
r: are /ɑr/, ear /ir/, or /ɔr/          w: we /wi/, way /weɪ/, were /wɝ/
j: you /ju/, use /jus/, yeah /jæ/       h: he /hi/, hi /haɪ/, her /hɝ/
i: be /bi/, each /itʃ/, see /si/        ɪ: if /ɪf/, in /ɪn/, is /ɪz/
ɛ: egg /ɛɡ/, air /ɛr/, edge /ɛdʒ/       æ: add /æd/, am /æm/, an /æn/
ə: a /ə/, the /ðə/, ago /əˈɡoʊ/         ʌ: up /ʌp/, us /ʌs/, of /ʌv/
ɑ: are /ɑr/, on /ɑn/, raw /rɑ/          ɔ: all /ɔl/, off /ɔf/, or /ɔr/
ʊ: book /bʊk/, cook /kʊk/, could /kʊd/  u: do /du/, new /nu/, zoo /zu/
ɝ: her /hɝ/, sir /sɝ/, were /wɝ/        ɚ: hour /ˈaʊɚ/, arrive /ɚˈaɪv/, water /ˈwɔtɚ/
eɪ: day /deɪ/, age /eɪdʒ/, eight /eɪt/  aɪ: eye /aɪ/, buy /baɪ/, my /maɪ/
ɔɪ: boy /bɔɪ/, toy /tɔɪ/, joy /dʒɔɪ/    oʊ: go /ɡoʊ/, owe /oʊ/, show /ʃoʊ/
aʊ: how /haʊ/, cow /kaʊ/, hour /ˈaʊɚ/
```

### 1.7 GA / RP アクセント切替（STEP5・実装済み）

| 項目 | 仕様 |
|------|------|
| 設定 | `localStorage.app_accent` = `ga` \| `rp`（既定 `ga`） |
| 表示 IPA | `activeIpa(c)` — RP 時は `rp_ipa`、なければ GA `ipa` にフォールバック |
| reveal 補足 | 選択外アクセントの IPA を `rAltIpa` に表示 |
| Encode キーボード | GA: ɑ ɔ ɝ ɚ 等 / RP: ɒ ɜː 長音ː・二重母音拡張 |
| データ | 全 3,059 語 + 201 連結句に `rp_ipa` 付与 |

### 1.8 Connected Speech（連結句＋弱形・STEP6/弱形統合）

- **データ:** `data/connected_speech.json`（201 句）+ `data/weak_forms.json`（36 語）。ランタイムで `filteredCsPool()` が合算。
- **練習タブ:** Words / **Connected Speech** の2種。弱形は独立タブではなく Type ピル `weak` で選択。
- **Type:** All / linking / assimilation / elision / **weak**（`tab.weak` ラベル流用）。
- **Level:** 1–3（連結・弱形共通）。
- **練習:** Decode のみ。連結は IPA → 元フレーズ `w`（句入力）。弱形は IPA → 機能語 `w`（単語入力）。キャリア文＋IPA 埋め込みは共通。
- **TTS:** 連結句 GA 固定（`?phrase=`）。弱形 `?weak=` + 弱形 IPA（GA/RP）。
- **reveal:** 連結は cs_type + cs_rule。弱形は強形↔弱形対比 + cs_rule。
- **件数:** All = 237（201+36）。weak 選択時 `pool.count_weak`、それ以外 `pool.count_phrases`。

---

## 2. Mode B：音から語彙（サブテーマ）

> **実装済み**（STEP7）。A1/A2 + phonics 語彙で運用。上級日常語の追加は継続タスク。

### 2.1 ループ

1キューで、語の履歴に応じて段階を自動選択。

- **提示（Study／未習語）:** ▶音を自動再生 → IPA のみ表示 → 学習者が [意味を確認する] を押すと単語＋意味(gloss) をフェードイン開示。採点なし、[覚えた→次へ]。英語 UI では `gloss.en === w` の自己参照を `modeBDisplayGloss()` が `def`（英語定義文・**3,059語完備**）または `(品詞)` で代替。
- **確認（Quiz／既習・復習期限）:** 客観2種を実施（採用＝両方）。
  - **(a) 意味認識MCQ:** ▶音 → 4択から意味を選ぶ。distractorは §2.2。順序シャッフル。
  - **(b) 音声ディクテーション:** ▶音 → 単語を入力。採点は Mode A Decode を流用（完全一致/Lev≤1/不一致）。
- 両方通過で `box+1`（Leitner）。

### 2.2 distractor生成（AIなし・ラグなし）★

- **オフライン事前計算:** 各語に音素近傍トップK（K=8目安）を `neighbors` フィールドとして付与（IPAトークンのLevenshtein距離。同バンド優先）。実行時計算ゼロ。
- **実行時:** `neighbors` から **2語抽選 ＋ 同バンドのランダム1語**を混ぜ、選択肢にはその語の `gloss[UI言語]` を表示。順序シャッフル。近傍が不足する語はランダムで補填。
- **RPアクセント（2026-06-26 確定）:** `neighbors_rp` の再計算は**保留**。GA `neighbors` を RP Mode B でも流用（検証: 近傍ペアの約95%が RP でも距離≤2。詳細は `docs/rp-neighbors-priority-decision.md`）。再計算トリガーが発生したら `gen_neighbors.py` を `rp_ipa` 入力で実行し `neighbors_rp` フィールドを追加。
- **効果:** セット暗記（毎回違う）と消去法（音を聞かないと選べない）を同時に潰し、MCQを実質ミニマルペア知覚テストにする。
  - 例：three /θri/ の選択肢に free /fri/（θvs f）、those /ðoʊz/ に doze /doʊz/（ð vs d）、ship /ʃɪp/ に chip /tʃɪp/（ʃ vs tʃ）。
- 難度調整：純近傍だけだと難しすぎるため既定は「近傍2＋ランダム1」。定数で切替可。

### 2.3 localStorage スキーマ

```jsonc
"ept_vocab_v1": {
  "<word>": { "box": 1, "seen": 0, "okMean": 0, "ngMean": 0, "okSpell": 0, "ngSpell": 0, "ts": 0 }
},
"ept_vocab_band": "A1"   // 現在のフォーカスバンド
```

### 2.4 選定

現バンドの新規（提示）＋ 復習期限到来（確認）を混ぜる（新規5＋復習5、調整可）。

- **プール除外:** `src` が `letter`（アルファベット）または `contraction`（短縮形）の語は Mode B 対象外。
- **バンド解放:** 現バンド内の語の 60% 以上が box 4+ に到達すると次バンドへ自動解放（`MODEB_BAND_UNLOCK_RATIO = 0.6`）。セットアップ画面にマスタリー率を表示。

---

## 2b. 語彙ブラウザ（参照閲覧）

トップバー `#vocabBtn` から起動するモーダル。練習セッション中も利用可（設定・ガイドはプレイ中非表示だが語彙ブラウザは常時表示）。

| タブ | 内容 |
|------|------|
| **Words** | wordlist 全 3,059 語。A→Z ソート・検索（debounce 120ms）・A–Z ジャンプ |
| **Phrases** | `connected_speech.json` 201 句。cs_type × level 順。弱形は含まない |

各行: 単語 / GA+RP IPA / respelling / 意味（`vocabDisplayGloss()`）/ 品詞 / TTS。英語 UI で `gloss.en === w` の自己参照は `def`（英語定義文）または `(品詞)` で代替。モバイル（`<599px`）では検索欄を非表示。Escape で閉じる。

### 2c. Narrow IPA + Respelling（Phase 1）

- 既存 `ipa` / `rp_ipa`（phonemic）は **採点・音素カバー用**として不変。
- 表示専用フィールドとして `ipa_actual_ga` / `ipa_actual_rp` を追加（narrow IPA）。
- Respelling フィールド `respell_ga` / `respell_rp` を追加。
- Reveal では `activeNarrowIpa()` を主表示、差分がある場合のみ dictionary（phonemic）行を併記。
- Encode 採点・weak 集計・TRAPSET 判定は従来どおり `activeIpa()`（phonemic）を使用。

### 2d. Phase 2a Flap Merge（186語上書き）

- `phase2a_flap_candidates.json` の 186 語を `scripts/merge_flap_candidates.py` で一括マージ。
- `ipa_actual_ga` は **常に candidates 側で上書き**（既存値があっても更新）。
- これにより pilot の既知誤値 2 語（`middle`, `thirty`）を修正。
- `ipa` / `rp_ipa` / `ipa_actual_rp` / `respell_ga` / `respell_rp` は変更しない。
- マージ後の `ipa_actual_ga` 保有語は 192 語（30 + 186 - 24 重複）。

i18n: `vocab.*`（5 キー × 5 言語）。

---

## 3. 音声（TTS）プロンプト設計 ★要件③

OpenAI `gpt-4o-mini-tts` を GASプロキシ経由で呼ぶ。**1語でも学習効果を最大化する**ため、`instructions` を固定文で厳密に指定する。

### 3.1 入力

- `input` = 対象語そのもの（綴り）。
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

### 3.2 設計意図（なぜこの指示か）

- **citation（辞書）形を強制** … 表示するIPA（例 to `/tu/`、of `/ʌv/`、the `/ðə/`）と音を一致させる。連結時の弱形が出ると学習ループが壊れるため。
- **General American** … データがGA/CMU基準。
- **やや遅く・精緻な調音** … 知覚訓練が本丸。Mode Bのミニマルペア弁別（θ/f, ð/d, ʃ/tʃ 等）が成立するには各対立が明瞭に区別される必要がある。
- **誇張しない** … 過剰強調は歪んだ音素を教えてしまう。自然な範囲で明瞭に。
- **一定・無感情・1回** … 毎回同じ参照音を作り、学習者が安定したターゲットを内在化できる。再生の繰り返しはアプリ側の再生ボタンで対応。

### 3.3 既知の限界（低優先・将来）

- 同綴異音語（read, live, wind, lead 等）はTTSが意図と違う読みを返し得る。必要なら語に読み分けヒントを添える運用を将来検討（現データ規模では低優先）。

### 3.4 RP TTS（2026-06-26 実装）

- **単語:** `GET ?word=...&accent=ga|rp`（既定 `ga`）。`instructions` を GA/RP で分岐。voice は `alloy` 据え置き。
- **キャッシュキー:** Drive `{slug}__{accent}_v2.mp3`、localStorage `ipa_tts_v2:{accent}:{slug}`。旧 `{slug}_v2.mp3` / 無 accent キーは GA として後方互換。
- **連結句:** GA 固定（`?phrase=` + `accent=ga`）。RP 連結音声は別タスク。
- **弱形:** `GET ?weak=/IPA/&ww=word&accent=ga|rp`。`instructions` は弱形（連結内の reduced form）を強制。`input` はキャリア文内の機能語綴り。GA/RP で `TTS_WEAK_INSTRUCTIONS_*` を分岐。
- 詳細: `docs/rp-tts-design-and-priority.md`、`docs/cursor-implementation-report-weak-forms.md`

### 3.4b クライアント TTS プリフェッチ（2026-06-29 実装）

Words / Mode B セッション開始時にキュー内の単語音声を先読みし、初回再生の待ち時間を削減する。Connected Speech タブではスキップ（連結句・弱形はオンデマンド）。

| 定数 | 値 | 役割 |
|------|-----|------|
| `warmChunk` | 6 | `?warm=1` 1 リクエストあたりの語数 |
| `warmParallel` | 2 | warm リクエストの並列数 |
| `bodyParallel` | 3 | 音声 body 取得の並列数 |

**フロー:**
1. `prefetchSessionAudio(queue)` — セッション開始時に呼び出し
2. GA + RP 両方に `gasWarm()`（Drive キャッシュ確認・未生成なら生成）
3. 現アクセントの body を優先取得（`memAudioCache` + `audioReady` Map）
4. 反対アクセントは `requestIdleCallback` / `setTimeout(2000)` でアイドル時に取得
5. アクセント切替時は `prefetchAccentBodies()` で再取得
6. スピーカーボタンはキャッシュ準備完了まで `disabled`（Connected/弱形は常時有効）
7. `prefetchToken` でセッション再開始時に古いジョブをキャンセル

### 3.4c GA バッチ warm（GAS 時間トリガー・2026-07 実装）

全 3,059 語の GA 音声を Google Drive に事前ストックするオフラインジョブ。`gas/BatchWarm.gs` + `gas/BatchWords.gs`（`scripts/export_batch_words.py` で生成）。

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

詳細: `gas/README.md` §GA 一括バッチ

### 3.5 多言語 UI（fil 含む）

| Tier | 内容 | fil 状態 |
|------|------|----------|
| Tier 1 | UI 文言 156 キー + 言語ピッカー | ✅ `i18n/fil.json` |
| Tier 2 | 語義 gloss（3,059 語） | ✅ **3,059/3,059**（batch01–34） |
| Tier 3 | 音素解説 43 記号 + 学習ガイド | ✅ `phonemes/fil.json` + `guide.json` fil |
| Tier 4 | 連結句・弱形ルール文 `cs_rule` | ✅ 237/237（201+36） |
| — | 英語定義 `def`（3,059 語） | ✅ batch01–08（`tools/merge_def.py`） |

検証: `python3 tools/validate_i18n.py`。拡張手順: `docs/i18n-language-scaling.md`。

---

## 4. データ整備タスク

| 優先 | 内容 | 状態 |
|---|---|---|
| 高 | 欠落必須語・屈折形パッチ | ✅ 主要語追加済み（`data/*_patch.json`） |
| 高 | `neighbors` 全語事前計算 | ✅ 2,623/3,059語 |
| 高 | `ex`（記号別例語） | ✅ phonemes JSON に実装 |
| 高 | `rp_ipa` 全語付与 | ✅ 3,059語 + 201連結句 |
| 高 | 弱形 36語 + `?weak=` TTS | ✅ |
| 高 | UI fil（Tier 1+3） | ✅ 156キー + phonemes + guide |
| 高 | 英語定義 `def` | ✅ 3,059/3,059（`tools/merge_def.py`） |
| 高 | TTS プリフェッチ（クライアント） | ✅ |
| 高 | GA バッチ warm（GAS） | ✅ `BatchWarm.gs` |
| 中 | 語彙ブラウザ | ✅ Words 3,059 / Phrases 201 |
| 中 | 本物のB/C日常語彙 | ⬜ 継続 |
| 中 | カジュアル表現 | ✅ 一部（`casual` src） |
| 中 | 薄い記号の補強 | 部分 |
| 中 | `neighbors_rp` | ⏸ 保留 |
| ― | gloss品質点検 | 継続（多言語学習ガイドと連動可） |
| ― | gloss.fil（Tier 2） | ✅ 3,059/3,059 |
| ― | cs_rule.fil（Tier 4） | ✅ 237/237 |
| ― | 連結句 RP TTS | ⬜ 別タスク |

---

## 5. 実装状況（2026-07-02）

| 項目 | 状態 |
|---|---|
| Mode A（音素軸UI・SRS・reveal・例語・TTS v2） | ✅ |
| GA/RP 切替（IPA・キーボード・RP TTS） | ✅ |
| 連結句 201句（キャリア文） | ✅ |
| 弱形 36語 + `?weak=` TTS | ✅ Connected Speech 内 Type=weak |
| Mode B（Study/Quiz・vocab SRS・バンド解放） | ✅ |
| 練習タブ統一（Connected ⊃ Weak） | ✅ |
| 語彙ブラウザ（Words / Phrases） | ✅ |
| TTS プリフェッチ（セッション先読み + スピーカー gating） | ✅ |
| GA バッチ warm（GAS 時間トリガー） | ✅ |
| UI 5言語（en/ja/zh/ko/fil） | ✅ Tier 1+3（156キー） |
| 多言語学習ガイド（6言語） | ✅ フェーズ1 |
| 英語定義 `def` | ✅ 3,059/3,059 |
| narrow IPA + respelling（pilot 30語） | ✅ Phase 1 |
| narrow IPA（GA）本マージ 186語上書き | ✅ Phase 2a |
| gloss.fil / cs_rule.fil | ✅ **すべて完了**（3,059語 + 237件） |
| 連結句 RP TTS | ⬜ |

**運用メモ:** Mode A/B の新規 UI 文字列は i18n キー経由。GAS は RP TTS + バッチ warm 対応版を再デプロイ済み（`index.html` `GAS_TTS_URL` 参照）。語彙リスト更新時は `python3 scripts/export_batch_words.py` で `BatchWords.gs` を再生成。
