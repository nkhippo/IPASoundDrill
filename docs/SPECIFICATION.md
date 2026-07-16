# IPA Sound Drill — 仕様書

> 本ドキュメントは、アプリの目的・設計・データ管理の正本（source of truth）です。  
> 機能追加や仕様相談の前提資料として利用してください。  
> 目的の正本は `docs/PURPOSE.md`、実装設計は `docs/DESIGN.md`（衝突時は PURPOSE → DESIGN → 本書の順で参照）。

**最終更新:** 2026-07-16（Phase 0 段階 2: SPEC/DESIGN ↔ 実装突合・i18n orphan 整理）  
**対象コード:** `src/index.template.html`（正本。ビルド生成物 `/{lang}/index.html`）、`wordlist_GA_a1a2_plus_phonics.json`（**5,397 語**）、`data/connected_speech.json`、`data/weak_forms.json`、`data/guide.json`、`i18n/`、`gas/`  
**リポジトリ構成:** `docs/REPOSITORY-STRUCTURE.md`（フォルダマップ・AI向け）

---

## 目次

1. [解決する課題](#1-解決する課題)
2. [課題への解決アプローチ](#2-課題への解決アプローチ)
3. [インフラ構成](#3-インフラ構成)
4. [画面設計](#4-画面設計)
5. [動的情報の管理](#5-動的情報の管理)
6. [補足・制約](#6-補足制約)

---

## 1. 解決する課題

### 1.1 対象ユーザー

- CEFR A1–A2 程度の英語学習者（Mode B はバンド進行で上級語彙へ拡張可能）
- 母語は日本語・中国語・韓国語・**フィリピン語（タガログ）**を想定（UI 言語として **en / ja / zh / ko / fil** に対応）
- 学習対象の発音体系は **General American (GA)** を基準。**Received Pronunciation (RP)** を設定で選択可能

### 1.2 アプリの位置づけ

**語彙を増やすツールではなく、既知単語の発音（IPA）を鍛え直すトレーナー**が本丸（Mode A）。  
**音から未知語を覚える** Mode B をサブテーマとして併設。姉妹アプリ English Listening Trainer と役割分担。

### 1.3 解決したい課題

| 課題 | 内容 |
|------|------|
| 語彙と発音のギャップ | 単語の意味は知っているが、**発音（音）が身体に定着していない** |
| 聞き取りとの連動 | 「**発音できない音は聞き取れない**」という知覚–運動のギャップ |
| IPA リテラシー不足 | 綴りと音が一致しない英語で、**IPA を読んで書ける力**が弱い |
| 連結音の理解 | 辞書形 IPA と実際の連結発音のギャップ（Connected Speech タブ） |
| 弱形の理解 | 機能語の強形と弱形のギャップ（Connected Speech → Type: Weak forms） |
| 米英アクセント差 | GA 学習者が RP を、RP 学習者が GA を参照音声として聞く不整合 |

---

## 2. 課題への解決アプローチ

### 2.1 学習モード（2種）

| モード | 目的 | UI ラベル（ja） | 主なループ |
|--------|------|----------------|-----------|
| **Mode A** | 既知語の IPA 読み書き（本丸） | IPA読み書き（`mode.a`） | Decode / Encode |
| **Mode B** | 音から語彙獲得（サブ） | 聞いて覚える（`modeb.title`） | Study → Quiz（MCQ + ディクテーション） |

### 2.2 Mode A — 練習タブ

| タブ | 内容 |
|------|------|
| **Words** | 単語の Decode / Encode |
| **Connected Speech** | 連結 IPA → 元フレーズ、または弱形 IPA → 機能語（Decode のみ）。Type: All / linking / assimilation / elision / **weak**。Level L1–L3。キャリア文に IPA 埋め込み。All = 237 件（201 句 + 36 弱形） |

### 2.3 Mode A — Words の出題設計

- **1 セッション = フィルタ後プールの全件**（重複なし。プール枯渇まで継続）
- **音素フォーカス（主）:** All / Trap sounds / Weak spots / Alphabet / Contractions / Irregular forms / Casual speech
- **綴りタイプ（従）:** All / Regular patterns / Irregular
- **規則グループ（Regular 時）:** Short / Long·silent e / Vowel teams / R-colored vowels
- **Trap sounds 詳細:** `TRAPSET = ['θ', 'ð', 'æ', 'ʒ', 'ɝ']` の 5 音素を含む語彙にフィルタ（`hasTrapPhoneme`）
- **Weak spots 詳細:** `ept_hist_v1` の履歴と `ept_sym_v1` に基づく弱点音素を含む語彙（`filteredPool()` の重み付け・`buildSessionQueue` の Symbolic バケット）
- **適応出題:** セッション開始時に `ept_hist_v1`・`ept_sym_v1`・**`ept_checks_v1`** に基づき全プール分の出題順を決定（Leitner + 弱点記号 + **進捗重み付けシャッフル**。詳細は `DESIGN.md` §1.4）

### 2.3b セッション共通 — 先読み・終了

| 項目 | 仕様 |
|------|------|
| **先読み（問題）** | 開始時に現問＋先読み5＝**6 問**をキューへ。ストック（現問を除く先読み数）が **&lt; 5** になるたびに **5 問**追加 |
| **先読み（音声）** | キュー追加と同時に GA+RP 両方 warm → 現アクセント body 優先 → 反対アクセントはアイドル時。Connected / 弱形も対象 |
| **プリフェッチ定数** | `warmChunk = 6`（`SESSION_INITIAL` と同期）、`warmParallel = 2`（先読み並列 fetch）、`bodyParallel = 3`（本体音声並列 fetch）。`SESSION_REFILL = 5` はセッション中の追加補充数（プリフェッチ数とは別次元） |
| **スピーカー** | キャッシュ準備完了まで無効化（全モード共通） |
| **離脱確認** | Decode / Encode / Mode B Study / Reveal から Menu またはブランドタップ時に Yes/No モーダル。**Yes → setup 画面に復帰**（`goToTop(true)`。再開なし）。Summary・セットアップではモーダルなし |
| **終了** | プール全問消化で自動サマリー。Menu（確認なしの対象外画面）でセットアップへ戻ると途中統計は破棄 |
| **進捗表示** | 各カード内 `#dNo` / `#eNo` / `#mbSNo` 等（`現在番号 / プール総数`）。トップバーに meter ノードは無し。`setCardCefr()` が担当 |

### 2.4 Mode A — 学習方向

| 方向 | 学習者の行動 |
|------|-------------|
| **Decode** | IPA を見て英語の綴りを入力 |
| **Encode** | 英単語を見て IPA キーボードで発音を組み立て（GA/RP でキー配列が切替） |

### 2.5 Mode B — ループ

| 段階 | 内容 | UI（2026-07） |
|------|------|----------------|
| **Study** | TTS 自動再生 → IPA のみ → [意味を確認する] → 単語＋gloss フェードイン。採点なし | **有効（100%）** |
| **Quiz (a)** | 音 → 4択 MCQ（意味）。distractor: neighbors 2 + 同バンド random 1 | 非表示（`MODEB_QUIZ_ENABLED=false`。コードは温存） |
| **Quiz (b)** | 音 → 綴り入力（Decode 採点流用） | 同上 |

**出題:** フィルタ後プールの全語を Study として重複なしで消化（§2.3b の先読み・離脱確認と同じ）。

**バンド進行:** `letter`・`contraction` は Mode B プールから除外。バンド内 60% 以上が box 4+ に到達すると次バンドへ自動解放（`MODEB_BAND_UNLOCK_RATIO = 0.6`）。**現状 `refreshVocabBandUnlock()` は呼び出し 0 のため実質未使用**（Q-2 Phase 1 判断待ち）。

**Mode B セッション定数:**

- `MODEB_SESSION = {newCount: 10, reviewCount: 10}` — セッションあたりの新規語彙数と復習数（Quiz 有効時）
- `MODEB_BAND_UNLOCK_RATIO = 0.6` — バンド解放閾値（上記どおり現状未接続）

### 2.6 採点ロジック

| モード | OK | near | bad |
|--------|-----|------|-----|
| Decode | 綴り完全一致 | Levenshtein ≤ 1（入力 3 文字以上） | それ以外 |
| Encode | IPA（強勢含む）完全一致 | 強勢を除く音素列一致 | 音素列不一致 |

### 2.7 フィードバック設計

- **TTS:** 各問・解答後に参照発音（単語は GA/RP、連結句は GA、弱形は `?weak=`＋弱形 IPA で GA/RP）
- **TTS プリフェッチ（Phase T）:** キュー追加時に `prefetchItemsAudio`。1問目の body 取得を warm 完了前に開始。現アクセント `gasWarm` は非ブロック。反対アクセント warm は idle 延期。Drive 公開 URL（`?urls=1`）優先、失敗時は従来 base64（`?word=` 等）。setup 表示中はプール先頭を preread。連結句（GA）・弱形（GA/RP）も先読み対象。スピーカーはキャッシュ準備完了まで無効化。GAS 反映手順は `docs/reference/remaining-ops-checklist.md`
- **音素タップ:** IPA 各記号の解説パネル（例語付き）
- **Reveal:** 正解単語・IPA・gloss・自分の回答・発音ポイント。運用アクセントと異なる phonemic IPA を補足表示（`#rAltIpa`）。実質同一時は `/ipa/（同じ）` 形式（`reveal.alt_same`）。判定は **`ga_rp_same` フラグ**（未設定時は `ipa === rp_ipa` にフォールバック）
- **Encode:** 音素ごと OK/NG 色分け（LCS ベース）
- **Summary:** 正答率（`ok` のみ正解、`near` は含めない）、`{正解} / {回答済み} 正解`、苦手音素、ミス単語、**TOPへ**（セットアップ）、苦手だけ復習

### 2.8 多言語 UI

- UI 言語: **en / ja / zh-Hans / zh-Hant / ko / fil**（`localStorage.app_lang`）
- 音素解説: 各 UI 言語の `i18n/phonemes/<lang>.json`（43 記号）。欠落時は en にフォールバック
- 学習ガイド: `data/guide.json`（en / ja / ko / zh-Hant / zh-Hans / **fil**）。UI i18n とは独立
- 語義 gloss: en / ja / zh / ko / **fil（5,397語）**
- 連結句・弱形ルール文（`cs_rule`）: en / ja / **fil（237件・完走）**
- 学習対象の英単語・IPA・TTS は言語共通（常に英語）

### 2.9 アクセント設定

- **GA / RP**（`localStorage.app_accent`、既定 `ga`）
- `activeIpa()` — 表示・採点・キーボードが追従
- TTS 単語は `accent=ga|rp`、連結句は `accent=ga` 固定、弱形は `?weak=/IPA/&ww=word&accent=ga|rp`

---

## 3. インフラ構成

### 3.1 構成図

```
┌─────────────────────────────────────────────────────────────┐
│  クライアント（ブラウザ）                                       │
│  src/index.template.html → /{lang}/index.html（SPA・ビルド生成） │
│  + wordlist_GA_a1a2_plus_phonics.json（5,397語）             │
│  + data/connected_speech.json（201句）                        │
│  + data/weak_forms.json（36語）                               │
│  + data/guide.json（6言語）                                   │
│  + i18n/{en,ja,zh,ko,fil}.json + i18n/phonemes/              │
│  localStorage: 言語・アクセント・SRS・TTSキャッシュ              │
│  メモリ: memAudioCache / audioReady（セッション TTS 先読み）     │
└──────────────┬──────────────────────────┬───────────────────┘
               │ fetch（静的）              │ GET ?word= / ?phrase= / ?weak= / ?warm= / ?urls=1
               ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│  GitHub Pages             │   │  Google Apps Script           │
│  Actions 自動デプロイ       │   │  Code.gs → OpenAI TTS         │
│  main push で公開           │   │  BatchWarm.gs → GA 一括 warm  │
└──────────────────────────┘   │  OPENAI_API_KEY in Properties │
                               └──────────┬───────────────────┘
                                          │
                          ┌───────────────┼───────────────┐
                          ▼               ▼               ▼
                   OpenAI API      Google Drive      base64 MP3
                   gpt-4o-mini-tts  IPA-TTS-Audio/    または Drive 直 URL
                   voice: alloy       {slug}__{accent}_v2.mp3
                                      （?urls=1 → クライアント直 fetch）
```

### 3.2 コンポーネント一覧

| レイヤ | 技術 | 役割 |
|--------|------|------|
| フロントエンド | `src/index.template.html`（Vanilla JS）→ `/{lang}/index.html` | UI・ゲームロジック・採点・SRS |
| ホスティング | Vercel（`npm run build` → 6 言語 HTML） | 静的配信 |
| 音声 API | GAS Web App → OpenAI `gpt-4o-mini-tts` | API キー非露出。`?warm=1` で Drive 先読み。`?urls=1` で公開 URL（クライアント直 fetch）。未反映時は base64 フォールバック |
| GA バッチ warm | `gas/BatchWarm.gs`（時間トリガー） | 全 **5,397** 語の GA 音声を Drive に事前ストック（500語/回・20並列） |
| サーバーキャッシュ | Google Drive `IPA-TTS-Audio/` | `{slug}__ga_v2.mp3` / `{slug}__rp_v2.mp3` |
| クライアント TTS キャッシュ | `localStorage` + メモリ Map | `ipa_tts_v2:{accent}:{slug}` + `memAudioCache` / `audioReady` |
| 単語データ | `wordlist_GA_a1a2_plus_phonics.json` | 語・IPA・rp_ipa・gloss・neighbors |
| 連結句 | `data/connected_speech.json` | 201 句・cs_type・level・rp_ipa・キャリア文 |
| 弱形 | `data/weak_forms.json` | 36 語・level・strong/weak IPA・キャリア文 |
| 学習ガイド | `data/guide.json` | en / ja / ko / zh-Hant / zh-Hans / fil |
| オフラインスクリプト | `scripts/*.py`・`tools/*.py` | gloss・neighbors・RP IPA・`def` 生成。`export_batch_words.py` → `BatchWords.gs` |

### 3.3 デプロイ

- **本番 URL:** https://ipasounddrill.app/
- **ローカル:** `python3 -m http.server 8080`（`file://` 不可）
- **GAS:** `gas/README.md` 参照。`src/index.template.html` の `GAS_TTS_URL` に Web App URL を設定。Phase T（`?urls=1` / `migratePublicSharing`）の手動手順は `docs/reference/remaining-ops-checklist.md`

---

## 4. 画面設計

画面切替は主に `<section>` の `hidden` で表示制御。**語彙ブラウザのみ** hash routing（`#/vocab` / `#/vocab/phrases`）を用いる（`navigate` / `hashchange`）。その他の練習画面はルーターなし。

### 4.0 全画面共通 — トップバー・シェル

| 要素 | 内容 |
|------|------|
| ブランド | `#brandBtn` + `#brandName`（`/iː/` マーク + アプリ名。サブタイトル DOM 無し） |
| 語彙 | `#vocabBtn` — **常時表示**（プレイ中も利用可） |
| ガイド | `#guideBtn` — セットアップ時のみ表示 |
| 設定 | `#settingsBtn` — セットアップ時のみ表示 |
| Menu | `#backTopBtn` — プレイ中のみ。離脱確認対象画面では Yes で setup 復帰 |
| プレイ中パンくず | `#playCrumb` — 学習モード > 練習モード (GA\|RP) |
| TTS ヒント | `#audioHint` — `role="status"`。`audioHintText()` で再生準備完了時に促す（i18n キー `audio_tap_hint` は未登録・英語フォールバック） |
| 離脱確認 | `#exitConfirmModal` — Decode / Encode / Mode B Study / Reveal のみ |
| 進捗表示 | 各カード内 `#*No`（トップバー meter 無し。§2.3b 参照） |

#### §4.0.1 Footer

`#siteFooter` は shell 最下部に配置。Feedback / Terms / Privacy / X へのリンクを提供。

- 表示条件: `body.in-play`（学習セッション中）では非表示
- 学習フローに干渉しない控えめな配置（Product Principles 原則 5: 1 画面 1 主軸）

#### §4.0.2 Modals

| モーダル | Backdrop | Escape | Outside click |
|----------|----------|--------|---------------|
| `#exitConfirmModal` | `#exitConfirmScrim` | **未対応**（Issue X-4 予定） | scrim → No 相当 |
| `#settingsModal` | `#settingsScrim` | **未対応** | scrim → close |
| `#guideModal` | `#guideScrim` | **未対応** | scrim / Close → close |

`body.scroll-locked` は Decode / Mode B Dict 入力 focus 時のみ（`lockInputScroll`）。語彙ページでは未使用。

### 4.1 セットアップ（`#setup`）

| 要素 | Mode A | Mode B |
|------|--------|--------|
| Learning mode | IPA read & write / Listen & learn（各言語 `mode.a` / `modeb.title`） | 同左 |
| Practice mode | One word / Linking | （非表示） |
| Direction | Decode / Encode（Words のみ） | （非表示） |
| CEFR level | A1 / A2 / B1 複数選択ピル（Words のみ・常時表示） | （非表示） |
| Phoneme focus | 7 ピル（Words のみ・**詳しい設定**内）。CEFR 選択で 0 件になるピルは `disabled` | （非表示） |
| Spelling type / pattern group | あり（Words のみ・**詳しい設定**内）。同上 | （非表示） |
| Connected filters | Level L1–L3、Type（**詳しい設定**内） | （非表示） |

**Connected phrase フィルタ（Q-5-B 確定）:** 連結句 201 句のフィルタは **level**（L1–L3）と **type**（linking / assimilation / elision / weak）の 2 軸のみ。データの `cefr` フィールド（A1–B2）は付与済みだが **UI フィルタでは使用しない**。CEFR は Words（Mode A/B）の `#cefrPills` で機能する。
| Band | — | 現在 CEFR バンド表示 |
| プール件数 + 開始 | あり | あり |

### 4.2 問題 — Decode（`#cardDecode`）

IPA（タップ可）・TTS・綴り入力・Check。連結句・弱形時は cs メタ表示とキャリア文プロンプト。単語出題時は主 IPA 下に反対アクセント行（`#dAltIpa`）。同一時は `/ipa/（同じ）` 形式。連結句・弱形出題中は非表示。

### 4.3 問題 — Encode（`#cardEncode`）

英単語・TTS・IPA ビルドエリア・キーボード（GA/RP で記号セット切替）・Clear / Check。

### 4.4 Mode B — Study（`#cardModeBStudy`）

TTS・IPA・反対アクセント行（`#mbSAltIpa`、同一時は `reveal.alt_same`）・[意味を確認する] → 単語＋gloss フェードイン・発音ポイント（空なら非表示）・[次へ]。英語 UI では `modeBDisplayGloss()` が自己参照 gloss を `(品詞)` または `def` で代替。

### 4.5 Mode B — Quiz（`MODEB_QUIZ_ENABLED=false` で凍結）

| カード | 内容 |
|--------|------|
| `#cardModeBMcq` | Multiple Choice（意味 4 択） |
| `#cardModeBDict` | Dictation（綴り入力） |

旧記述の `#cardModeBQuiz` は存在しない（上記 2 カードに分割）。

### 4.6 解答（`#reveal`）

OK/near/bad 色分け・単語・gloss・自分の回答・正解 IPA（Encode 時色分け）・発音ポイント・TTS 自動再生。Words では主表示 IPA に narrow（実現音）を使用し、`reveal.dict_label`（dictionary/phonemic）を追加表示。dictionary 行は narrow と phonemic が異なるときのみ表示。反対アクセント行（`#rAltIpa`）は phonemic 比較で同一なら `reveal.alt_same` を表示。弱形時は強形↔弱形対比を追加表示。

### 4.7 サマリー（`#summary`）

正答率・`{c} / {t} 正解`（`t` = 採点済み回答数）・苦手音素・復習リスト・**TOPへ**（`#againBtn` → セットアップ）/ Review misses only。プール全問消化でも同一画面へ自動遷移。離脱確認モーダル（Yes）からの手動遷移時も再開なし。

### 4.8 設定モーダル（`#settingsModal`）

| 項目 | 選択肢 | 保存キー |
|------|--------|----------|
| Language | en / ja / zh / ko / **fil** | `app_lang` |
| Accent | American (GA) / British (RP) | `app_accent` |

学習ガイド（`#guideModal`）は設定とは別。`#guideLangPills` で en / ja / ko / zh-Hans / zh-Hant / fil を切替。

### 4.8b 語彙ブラウザ (`#vocabPage`)

- **形態:** 独立セクション (`<section id="vocabPage" class="panel vocab-page">`)。旧 `#vocabModal` は廃止。
- **遷移:** hash routing `#/vocab` (Words) / `#/vocab/phrases` (Phrases)
- **起動:** topbar `#vocabBtn` → `navigate("vocab")`
- **戻る:** `#vocabBackBtn` → `navigate("")`（セットアップまたは直前 view。セッション state `S` は維持）
- **Menu ボタンとの関係:** 独立（`#backTopBtn` は現状通り）
- **練習中の遷移:** 可能。Back で練習画面に復帰（`renderCard()` は呼ばず、表示中だった view を再表示）

**タブ:**
- Words: 全語彙（**5,397語**）、A→Z ソート・検索（debounce 120ms）・A–Z ジャンプ、**CEFR バッジ**表示
- Phrases: 連結句 201（cs_type × level 順）、タイプバッジ + **CEFR バッジ**。弱形 36 語は含まない

**Header (sticky):**
- Back ボタン / タイトル
- タブバー（Words / Phrases）
- 検索欄（**常時表示** — モバイル含む）
- A–Z ジャンプ（横スクロール可能）
- フィルタプレースホルダー（`#vocabFilters`、現状非表示）

**行（2段組）:**
- 上段: 単語 + POS/CEFR/タイプバッジ
- 下段: GA+RP IPA + 意味（`vocabDisplayGloss`）
- 右端: 進捗チェック（d/e/l 各 0–3）+ play ボタン
- `ga_rp_same` 時は `/ipa/（同じ）` 形式。英語 UI では `gloss.en === w` の自己参照を `def` または `(品詞)` で代替
- CEFR バッジ配色: A1 緑 / A2 青 / B1 橙 / B2 紅

i18n: `vocab.*`（**6キー** × 6言語、`vocab.back` 含む）。`body.scroll-locked` は語彙ページでは使わない。

---

## 5. 動的情報の管理

### 5.1 単語データ — `wordlist_GA_a1a2_plus_phonics.json`

約 **5,397 語**（オリジナル 3,059 + Phase 1 B1 +1,769 + Phase 2 B2 +569）。主要フィールド:

```json
{
  "w": "colour",
  "ipa": "/ˈkʌlər/",
  "rp_ipa": "/ˈkʌlə/",
  "cefr": "A1",
  "pos": "名詞",
  "src": "cefr",
  "pattern": null,
  "group": null,
  "gloss": { "en": "...", "ja": "...", "zh": "...", "ko": "...", "fil": "..." },
  "ipa_actual_ga": "/ˈpɑrɾi/",
  "ipa_actual_rp": null,
  "respell_ga": "PAR-dee",
  "respell_rp": "PAH-tee",
  "def": "A small watercraft used to travel on water such as rivers and lakes.",
  "neighbors": ["caller", "collar", "..."],
  "ga_rp_same": true,
  "ga_rp_same_reason": "identical"
}
```

| フィールド | 用途 |
|-----------|------|
| `w` | 正解綴り・TTS 入力 |
| `ipa` | GA IPA（Decode/Encode/reveal） |
| `rp_ipa` | RP IPA（accent=rp 時） |
| `ipa_actual_ga` / `ipa_actual_rp` | narrow IPA（表示専用。採点・音素カバーには不使用） |
| `respell_ga` / `respell_rp` | データ保持（UI 非表示・2026-07-06） |
| `neighbors` | Mode B MCQ distractor（RP でも GA リスト流用） |
| `neighbors_rp` | （将来用・未生成） |
| `gloss` | reveal・Mode B |
| `def` | Mode B Study reveal（英語 UI・`gloss.en === w` 時の定義文） |
| `src` | letter / contraction / irregular_* / casual / cefr / phonics 等 |
| `pattern` / `group` | 規則語フィルタ・発音ポイント |
| `cefr` | CEFR レベル（`A1` / `A2` / `B1` / `B2`） |
| `ga_rp_same` | GA と RP が学習者にとって実質同じか（`scripts/gen_ga_rp_same.py` で付与） |
| `ga_rp_same_reason` | 判定理由（`identical`, `rhoticity`, `square_near_cure`, `ga_allophony` 等） |

#### `cefr` フィールドの現状（2026-07-10）

- 値: `"A1"` / `"A2"` / `"B1"` / `"B2"`
- 分布: A1=1,187 / A2=1,195 / **B1=2,116** / **B2=899**
- `src: "phonics"` の 652語は CEFR-J Wordlist v1.5 一次データ照合で B1/B2 正当語彙と確認済み
- Mode A の CEFR フィルタは Phase 0-b で実装済み（A1/A2/B1 UI、複数選択）
- Mode B は `MODEB_BANDS` を参照。B1/B2 バンドは空ではない

**パイプライン補足:** narrow IPA 候補・respelling のステージング JSON は `data/pipeline/`。バッチソースは `data/batches/`。詳細は `docs/REPOSITORY-STRUCTURE.md`。

#### GA / RP 「実質同じ」判定 (`ga_rp_same`)

##### データフィールド

各語彙エントリ（wordlist / connected_speech / weak_forms）に以下 2 フィールドを追加:

| フィールド | 型 | 意味 |
|---|---|---|
| `ga_rp_same` | `boolean` | GA と RP が学習者にとって実質同じ発音か |
| `ga_rp_same_reason` | `string` | 判定理由（同じ / 異なる、いずれの場合も付与）|

これらは **`scripts/gen_ga_rp_same.py`** により全語彙一括で生成される派生フィールドで、`ipa` / `rp_ipa` / `ipa_actual_ga` から決定的に導出される（LLM 判定なし）。

##### 「same」の定義

以下の差異のみを持つペアを same と判定する（STRICT）:

1. **長音記号 `ː` の有無** — GA 系辞書は緊張母音に付けない慣習
2. **第二強勢 `ˌ` の有無・位置差** — 辞書ソース間の揺れ
3. **DRESS 母音の表記差 (`ɛ` ↔ `e`)** — 同一音素の表記慣習差

第一強勢 `ˈ` は削除しない — 強勢の syllable 位置が異なるペアは different。

##### 「different」となる主な差異

| 種類 | reason 値 | 例 |
|---|---|---|
| GA 内音（フラップ T 等） | `ga_allophony` | `city` (`[ˈsɪɾi]`), `water` (`[ˈwɔɾɚ]`) |
| 第一強勢位置差 | `stress_placement` | `baseball`, `discount` |
| Non-rhotic 差 | `rhoticity` | `actor`, `winner` |
| GOAT 母音 | `goat_vowel` | `boat`, `ago` |
| LOT 母音 | `lot_vowel` | `hot`, `block` |
| TRAP-BATH | `trap_bath` | `path`, `bath`, `after` |
| COT-CAUGHT | `cot_caught` | `bought` |
| SQUARE / NEAR / CURE | `square_near_cure` | `bear`, `dear` |
| 弱母音の質差 | `weak_vowel` | `biscuit` (`ə`/`ɪ`) |
| Yod-dropping | `yod` | `new`, `due` |
| 語彙音韻差 | `lexical` | `schedule`, `vitamin` |
| その他構造差 | `structural_other` / `composite_structural` | 目視レビュー対象 |

##### GA-only 異音カーブアウト（重要）

`ipa_actual_ga`（narrow 転写）が存在し `ipa`（phonemic）と異なる語は、**phonemic レベルで RP と一致していても different** と判定する。Flap T・音節主音子音・声門閉鎖など、GA でのみ生じる異音を audibly-different として扱う（例: `city`）。

##### UI 挙動

1. **Reveal 画面の反対アクセント表示** (`altAccentValue`) — same のとき `/ipa/（同じ）` 表示
2. **語彙ブラウザの RP 行表示** — 同上

判定は `c.ga_rp_same` を参照。未設定時は旧ロジック（文字列一致）にフォールバック。

##### 分布統計（2026-07-10、Phase R 後）

| ファイル | 総数 | same | different |
|---|---:|---:|---:|
| wordlist | 5,397 | 2,674 (50%) | 2,723 (50%) |
| connected_speech | 201 | 94 (47%) | 107 (53%) |
| weak_forms | 36 | 30 (83%) | 6 (17%) |

wordlist の主な `ga_rp_same_reason`（different）: `rhoticity` 691, `structural_other` 615, `ga_allophony` 529, `goat_vowel` 288, `square_near_cure` 105（Phase R で活性化）, `cot_caught` 11。

##### 更新手順

`ipa` / `rp_ipa` / `ipa_actual_ga` を変更した場合:

```bash
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
# rp_ipa バッチ追加後に happY 過剰伸長が疑われる場合:
python3 scripts/fix_happy_i.py   # その後 gen_ga_rp_same を再実行
```

### 5.2 連結句 — `data/connected_speech.json`

**201 句。** フィールド: `id`, `w`, `ipa`, `rp_ipa`, `cs_type`, `level` (1–3), **`cefr`** (A1–B2、2026-07-09 付与), `cs_rule` (en/ja/**fil**), `gloss`, `carriers`（キャリア文テンプレート配列）。

#### Connected phrase TTS（Track A・Q-6-B 確定）

- SPA からの API 呼び出しは **`phrase=&accent=ga` 固定**
- `BatchWarm.gs` の暖機ループも GA 固定
- RP 連結 TTS は Track B（React 化以降）で対応予定

### 5.2b 弱形 — `data/weak_forms.json`

**36 語。** フィールド: `id`, `w`（機能語）, `ipa`（弱形）, `strong_ipa`, `level` (1–3), **`cefr`** (A2/B1、2026-07-09 付与), `cs_rule` (en/ja/**fil**), `carrier`（キャリア文テンプレート）。Decode のみ。TTS は `?weak=/IPA/&ww=word&accent=ga|rp`。

### 5.2c 学習ガイド — `data/guide.json`

UI i18n とは独立。各言語キー（`en`, `ja`, `ko`, `zh-Hans`, `zh-Hant`, `fil`）に8セクション（`welcome` … `how_to_use`）。段落数: welcome 4 / philosophy 3 / solves 2 / modes 3 / decode_encode 3 / connected 3 / accents 1 / how_to_use 3。モーダルで閲覧。

### 5.3 localStorage（永続）

| キー | 内容 |
|------|------|
| `app_lang` | UI 言語 |
| `app_accent` | `ga` / `rp` |
| `app_mode` | `a` / `b` |
| `ept_hist_v1` | Mode A 単語 SRS（Leitner） |
| `ept_sym_v1` | Mode A 記号弱点（Encode のみ更新） |
| `ept_vocab_v1` | Mode B 語彙 SRS |
| `ept_vocab_band` | Mode B 現在バンド |
| `ept_checks_v1` | 手動進捗（モード `d`/`e`/`l` 各 0–3）。語彙ブラウザ・Reveal・Mode B Study で更新 |
| `va-disable` | Vercel Analytics オプトアウト。文字列 `"true"` で計測イベントを送信しない |

#### TTS キャッシュキー

- Prefix: `ipa_tts_v2:`（定数 `LS_TTS_PREFIX`）
- キー形式: `ipa_tts_v2:{ga|rp}:{slug}`（単語）、`ipa_tts_v2:{ga|rp}:p4_{slug}`（連結）、`ipa_tts_v2:{ga|rp}:weak_{slug}`（弱形）
- Legacy 形式（`ipa_tts_v1:*`）は読取時に v2 へマイグレーション

### 5.4 セッション状態（メモリ `S`）

`appMode`, `tab`（`words` / `connected`）, `dir`, `focus`, `reg`, `grp`, **`cefrLevels`**（`Set<string>`。Mode A/B 共通 CEFR フィルタ）, `csFilter`, `csLevel`, `sessionPool`, `sessionNext`, `poolTotal`, `queue`, `idx`, `answered`, `correct`, `weak`, `missed`, `cur`, `mbPhase`（Mode B Study フェーズ: `"mcq"` 等）, `curCarrier`（連結/弱形のキャリア文）, `revealed`, `built`（Encode IPA バッファ）, `mbQuiz`（Mode B クイズ状態）。キューアイテムに `mbKind`（`study` / `quiz`）。

定数: `SESSION_INITIAL=6`, `SESSION_REFILL=5`, `MODEB_QUIZ_ENABLED=false`, `MODEB_SESSION={newCount:10, reviewCount:10}`, `MODEB_BAND_UNLOCK_RATIO=0.6`, `PREFETCH={warmChunk:6, warmParallel:2, bodyParallel:3}`。

モジュールレベル: `vocabTabCurrent`, `vocabBuilt`, `prefetchToken`, `memAudioCache`, `audioReady`, `speakBusy`, `guideLang`。リロードで消える。

#### `S.cefrLevels`

Mode A / Mode B 共通の CEFR フィルタ状態。初期値は Setup ピル選択（既定 `{"A1","A2"}`）。`filteredWordPoolWith` / `modeBPool` が参照。

#### `S.mbPhase`

Mode B Study の内部フェーズ。DOM 表示と `renderModeBStudy` の遷移に使用（Quiz 凍結時は Study のみ）。

### 5.5 i18n

| データ | パス |
|--------|------|
| UI 文言 | `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json`（**169 leaf**。`vocab.back`・複合 POS 含む） |
| 音素解説 | `i18n/phonemes/{en,ja,ko,zh-Hans,zh-Hant,fil}.json`（47 記号） |

**leaf 内訳（2026-07-16 実測）:**

- Runtime 参照: **165 leaf**（UI 表示・`t()` 動的参照）
- Build-only: `meta.title`, `meta.description`, `meta.ogTitle`, `meta.ogDescription` の **4 leaf**（`scripts/build-i18n-html.js` のみ）

検証: `python3 tools/validate_i18n.py`。監査ドキュメント再生成: `python3 tools/gen_audit_docs.py`。

---

## 6. 補足・制約

| 項目 | 内容 |
|------|------|
| アーキテクチャ | `src/index.template.html` → `/{lang}/index.html`（単一 SPA テンプレート）。フレームワーク・認証なし |
| 進捗 | localStorage のみ（端末・ブラウザ単位） |
| 連結句 TTS | GA 固定。RP 連結音声は未対応 |
| 弱形 TTS | GA/RP 対応（`?weak=`）。キャリア文内の弱形 IPA を指示文で指定 |
| gloss.fil / cs_rule.fil | gloss.fil **5,397/5,397**。cs_rule.fil **237/237** |
| `def`（英語定義） | 全語彙（Phase 1/2 バッチ含む） |
| Mode B 語彙 | B1=2,116 / **B2=899**（Phase 2 M2 完了 2026-07-10） |
| `neighbors_rp` | 保留（`docs/reference/rp-neighbors-priority-decision.md`） |
| TTS プリフェッチ | 全モード。Phase T（body-first / `?urls=1` / setup preread）。キュー追加時に `prefetchItemsAudio`（6 問初期 / ストック&lt;5 で 5 問追加） |
| GA バッチ warm | `gas/BatchWarm.gs`（`gas/README.md` 参照。語彙リスト **5,397**） |
| 手動残作業 | `docs/reference/remaining-ops-checklist.md`（GAS 再デプロイ・`migratePublicSharing`・BatchWarm 進捗） |
| 要注意音素 | `phonemes/*.json` の `t:1` + コード内 TRAPSET |
| 関連ドキュメント | `PURPOSE.md`, `DESIGN.md`, `REPOSITORY-STRUCTURE.md`, `gas/README.md`, `docs/reference/rp-tts-design-and-priority.md` |

---

## 変更履歴

| 日付 | 内容 |
|------|------|
| 2026-07-16 | Phase 0 段階 2: 実装突合（正本 `src/index.template.html`、Exit→setup、footer/audioHint、SRS 重み、Connected CEFR/TTS 判断、Mode B DOM 名、i18n 169 leaf・orphan 13 削除） |
| 2026-07-10 | Phase B: Phase 2 バッチ監査反映（gloss.zh 的的・damn POS・Fil 13・バッチ 86 同期・複合 POS i18n）。UI キー 177 |
| 2026-07-10 | Phase T: TTS 1問目遅延対策（body-first、`?urls=1`、setup preread）。GAS 再デプロイは残作業 |
| 2026-07-10 | Phase V: 語彙ブラウザを `#vocabPage` に移設。hash routing (`#/vocab`, `#/vocab/phrases`)、2段組行・CEFR バッジ両タブ・`vocab.back` |
| 2026-07-10 | Phase R: `ga_rp_same` 分類器修正、`fix_happy_i.py`（91語）、`phonology_lexicon.py`。語彙 5,397・B2=899 |
| 2026-07-09 | v3.15 `ga_rp_same` / `ga_rp_same_reason` フラグ導入（`scripts/gen_ga_rp_same.py`）。UI 同一判定をフラグ参照に切替 |
| 2026-07-09 | v3.14 Phase 1 M5: B1 最終 389語マージ。語数 4,828・B1=2,116（Phase 1 B1 拡充完了） |
| 2026-07-09 | v3.12 反対アクセント同一表示 `/ipa/（同じ）`・GA/RP ラベル簡素化・離脱確認モーダル・CEFR 連動フィルタ非活性・`docs/reference/README.md` |
| 2026-07-09 | v3.11 リポジトリ構成整理（`data/batches`・`pipeline`・`patches`、`docs/cursor`）。語数 4,439・B1=1,727。連結/弱形 `cefr`。`REPOSITORY-STRUCTURE.md` 追加。 |
| 2026-07-06 | 学習モード名称を行為ベースに刷新（`mode.a` / `modeb.title`）。セットアップの詳細フィルタを折りたたみ。プレイ中パンくず追加。反対アクセント表示拡張。respelling UI 非表示。Mode B [次へ] 統一。i18n 161 キー |
| 2026-07-07 | CEFR Phase 0-a 訂正: phonics 652語の `cefr` を CEFR-J 一次データに基づく B1/B2 へ復元（B1=347、B2=330） |
| 2026-07-07 | 中文 UI を `zh-Hant`（繁體）と `zh-Hans`（简体）に分離。旧 `zh` ユーザーは `zh-Hans` へ自動移行 |
| 2026-07-06 | 音素ガイド `i18n/phonemes/{ja,ko,zh}.json` を全面書き直し（47音素×3言語）。例語は英語のまま保持、機械翻訳による誤訳を解消 |
| 2026-07-02 | respelling v2 品質パッチ。音節主音+コーダ子音パターン18語の `respell_ga` を可読性向上（`important`: `im-POR-tuhnt` 等） |
| 2026-07-02 | Phase 2 完了。VntV 52語の TTS 判定を反映し respelling 最終52語をマージ。`respell_ga` 3,059/3,059語。pilot誤narrow 3語（winter/twenty/ninety）を除去 |
| 2026-07-02 | Phase 2b respelling merge を反映。`respell_ga` / `respell_rp` を 3,007語マージ。VntV 判定待ち 52語は未マージ（pilot暫定3語を除去） |
| 2026-07-02 | Phase 2a flap merge を反映。`ipa_actual_ga` を candidates 186語で上書きマージし、保有語数 192 語へ更新。`middle` `/ˈmɪdl̩/`、`thirty` `/ˈθɝˌɾi/` を修正 |
| 2026-07-02 | Phase 1 narrow IPA + respelling（pilot 30語）を反映。allophone 4記号（ɾ/ʔ/n̩/l̩）追加、i18n 158キー・phonemes 47記号 |
| 2026-07-02 | TTS プリフェッチ・GA バッチ warm・Mode B バンド解放・トップバー表示ルール・i18n 156 キー統一を反映 |
| 2026-06-23 | 初版（Mode A のみ・GA 固定） |
| 2026-06-26 | Mode B・連結句・GA/RP・SRS・TTS v2/accent キャッシュを反映 |
| 2026-06-29 | 語彙ブラウザモーダル追加（Words 3,059 / Phrases 201） |
| 2026-06-29 | 学習ガイド全章を Claude 生成版で丸ごと置換（decode_encode / connected / how_to_use 拡充含む） |
| 2026-06-28 | 学習ガイド `philosophy`/`solves` 章を強化（全6言語） |
| 2026-06-28 | 学習ガイド `welcome` 章を4段落ナラティブに強化（全6言語） |
| 2026-06-28 | `def` 英語定義 batch01–08 マージ（3,059/3,059語） |
| 2026-06-28 | 練習タブ統一: Connected Speech ⊃ Weak Forms（2タブ化） |
| 2026-06-27 | gloss.fil batch04 更新 + batch17–20 追加（1,600/3,059語） |
| 2026-06-27 | gloss.fil batch02/06–08 更新 + batch13–16 追加（1,280/3,059語） |
| 2026-06-27 | gloss.fil batch02–05 更新 + batch09–12 追加（960/3,059語） |
| 2026-06-27 | gloss.fil batch03–08 追加マージ（640/3,059語） |
| 2026-06-26 | gloss.fil batch01–02 マージ（160語）・`tools/merge_gloss_fil.py` 追加 |
