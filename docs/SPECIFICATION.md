# English Pronunciation Trainer — 仕様書

> 本ドキュメントは、アプリの目的・設計・データ管理の正本（source of truth）です。  
> 機能追加や仕様相談の前提資料として利用してください。  
> 目的の正本は `docs/PURPOSE.md`、実装設計は `docs/DESIGN.md`（衝突時は PURPOSE → DESIGN → 本書の順で参照）。

**最終更新:** 2026-07-09（離脱確認モーダル・反対アクセント表示形式・CEFR フィルタ非活性・`ga_rp_same` 相談ブリーフ）  
**対象コード:** `index.html`、`wordlist_GA_a1a2_plus_phonics.json`、`data/connected_speech.json`、`data/weak_forms.json`、`data/guide.json`、`i18n/`、`gas/`（`Code.gs`・`BatchWarm.gs`・`BatchWords.gs`）  
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
- **適応出題:** セッション開始時に `ept_hist_v1`・`ept_sym_v1` に基づき全プール分の出題順を決定（Leitner + 弱点記号ターゲット。詳細は `DESIGN.md` §1.4）

### 2.3b セッション共通 — 先読み・終了

| 項目 | 仕様 |
|------|------|
| **先読み（問題）** | 開始時に現問＋先読み5＝**6 問**をキューへ。ストック（現問を除く先読み数）が **&lt; 5** になるたびに **5 問**追加 |
| **先読み（音声）** | キュー追加と同時に GA+RP 両方 warm → 現アクセント body 優先 → 反対アクセントはアイドル時。Connected / 弱形も対象 |
| **スピーカー** | キャッシュ準備完了まで無効化（全モード共通） |
| **離脱確認** | Decode / Encode / Mode B Study / Reveal から Menu またはブランドタップ時に Yes/No モーダル。Yes → サマリー（再開なし）。Summary・セットアップではモーダルなし |
| **終了** | プール全問消化で自動サマリー。Menu（確認なしの対象外画面）でセットアップへ戻ると途中統計は破棄 |
| **メーター** | `現在番号 / プール総数`（総数はセッション開始時に固定） |

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

**バンド進行:** `letter`・`contraction` は Mode B プールから除外。バンド内 60% 以上が box 4+ に到達すると次バンドへ自動解放。セットアップにマスタリー率を表示。

### 2.6 採点ロジック

| モード | OK | near | bad |
|--------|-----|------|-----|
| Decode | 綴り完全一致 | Levenshtein ≤ 1（入力 3 文字以上） | それ以外 |
| Encode | IPA（強勢含む）完全一致 | 強勢を除く音素列一致 | 音素列不一致 |

### 2.7 フィードバック設計

- **TTS:** 各問・解答後に参照発音（単語は GA/RP、連結句は GA、弱形は `?weak=`＋弱形 IPA で GA/RP）
- **TTS プリフェッチ:** キュー追加時に当該分の音声を先読み（`prefetchItemsAudio`）。単語は GA+RP 両方 warm → 現アクセント body 優先 → 反対アクセントはアイドル時。連結句（GA）・弱形（GA/RP）も同様。スピーカーボタンはキャッシュ準備完了まで無効化
- **音素タップ:** IPA 各記号の解説パネル（例語付き）
- **Reveal:** 正解単語・IPA・gloss・自分の回答・発音ポイント。運用アクセントと異なる phonemic IPA を補足表示（`#rAltIpa`）。phonemic 文字列が同一のときは `/ipa/（同じ）` 形式（`reveal.alt_same`）。判定は `ipa === rp_ipa`（フラグ未実装）
- **Encode:** 音素ごと OK/NG 色分け（LCS ベース）
- **Summary:** 正答率（`ok` のみ正解、`near` は含めない）、`{正解} / {回答済み} 正解`、苦手音素、ミス単語、**TOPへ**（セットアップ）、苦手だけ復習

### 2.8 多言語 UI

- UI 言語: **en / ja / zh-Hans / zh-Hant / ko / fil**（`localStorage.app_lang`）
- 音素解説: 各 UI 言語の `i18n/phonemes/<lang>.json`（43 記号）。欠落時は en にフォールバック
- 学習ガイド: `data/guide.json`（en / ja / ko / zh-Hant / zh-Hans / **fil**）。UI i18n とは独立
- 語義 gloss: en / ja / zh / ko / **fil（3,059語・完走）**
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
│  index.html（SPA）                                           │
│  + wordlist_GA_a1a2_plus_phonics.json（3,059語）             │
│  + data/connected_speech.json（201句）                        │
│  + data/weak_forms.json（36語）                               │
│  + data/guide.json（6言語）                                   │
│  + i18n/{en,ja,zh,ko,fil}.json + i18n/phonemes/              │
│  localStorage: 言語・アクセント・SRS・TTSキャッシュ              │
│  メモリ: memAudioCache / audioReady（セッション TTS 先読み）     │
└──────────────┬──────────────────────────┬───────────────────┘
               │ fetch（静的）              │ GET ?word= / ?phrase= / ?weak= / ?warm=
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
                   gpt-4o-mini-tts  IPA-TTS-Audio/    → ブラウザ
                   voice: alloy       {slug}__{accent}_v2.mp3
```

### 3.2 コンポーネント一覧

| レイヤ | 技術 | 役割 |
|--------|------|------|
| フロントエンド | 単一 `index.html`（Vanilla JS） | UI・ゲームロジック・採点・SRS |
| ホスティング | GitHub Pages + `.github/workflows/static.yml` | 静的配信 |
| 音声 API | GAS Web App → OpenAI `gpt-4o-mini-tts` | API キー非露出。`?warm=1` で Drive 先読み |
| GA バッチ warm | `gas/BatchWarm.gs`（時間トリガー） | 全 3,059 語の GA 音声を Drive に事前ストック（500語/回・20並列） |
| サーバーキャッシュ | Google Drive `IPA-TTS-Audio/` | `{slug}__ga_v2.mp3` / `{slug}__rp_v2.mp3` |
| クライアント TTS キャッシュ | `localStorage` + メモリ Map | `ipa_tts_v2:{accent}:{slug}` + `memAudioCache` / `audioReady` |
| 単語データ | `wordlist_GA_a1a2_plus_phonics.json` | 語・IPA・rp_ipa・gloss・neighbors |
| 連結句 | `data/connected_speech.json` | 201 句・cs_type・level・rp_ipa・キャリア文 |
| 弱形 | `data/weak_forms.json` | 36 語・level・strong/weak IPA・キャリア文 |
| 学習ガイド | `data/guide.json` | en / ja / ko / zh-Hant / zh-Hans / fil |
| オフラインスクリプト | `scripts/*.py`・`tools/*.py` | gloss・neighbors・RP IPA・`def` 生成。`export_batch_words.py` → `BatchWords.gs` |

### 3.3 デプロイ

- **本番 URL:** https://nkhippo.github.io/English-Pronunciation-Trainer/
- **ローカル:** `python3 -m http.server 8080`（`file://` 不可）
- **GAS:** `gas/README.md` 参照。`index.html` の `GAS_TTS_URL` に Web App URL を設定

---

## 4. 画面設計

画面切替はルーターなし。`<section>` の `hidden` で表示制御。

### 4.0 全画面共通 — トップバー

| 要素 | 内容 |
|------|------|
| ブランド | `/iː/` + アプリ名 + サブタイトル |
| 語彙 | `#vocabBtn` — **常時表示**（プレイ中も利用可） |
| ガイド | `#guideBtn` — セットアップ時のみ表示 |
| 設定 | `#settingsBtn` — セットアップ時のみ表示 |
| Menu | `#backTopBtn` — プレイ中のみ。離脱確認対象画面ではサマリーへ、それ以外はセットアップへ |
| メーター | `現在番号 / プール総数`（総数はセッション開始時に固定） |
| 離脱確認 | `#exitConfirmModal` — Decode / Encode / Mode B Study / Reveal のみ（`exit_confirm.*` i18n） |
| プレイ中パンくず | `#playCrumb` — 学習モード > 練習モード (GA\|RP)。例: `IPA読み書き > 一単語 (GA)` |

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
| Band | — | 現在 CEFR バンド表示 |
| プール件数 + 開始 | あり | あり |

### 4.2 問題 — Decode（`#cardDecode`）

IPA（タップ可）・TTS・綴り入力・Check。連結句・弱形時は cs メタ表示とキャリア文プロンプト。単語出題時は主 IPA 下に反対アクセント行（`#dAltIpa`）。同一時は `/ipa/（同じ）` 形式。連結句・弱形出題中は非表示。

### 4.3 問題 — Encode（`#cardEncode`）

英単語・TTS・IPA ビルドエリア・キーボード（GA/RP で記号セット切替）・Clear / Check。

### 4.4 Mode B — Study（`#cardModeBStudy`）

TTS・IPA・反対アクセント行（`#mbSAltIpa`、同一時は `reveal.alt_same`）・[意味を確認する] → 単語＋gloss フェードイン・発音ポイント（空なら非表示）・[次へ]。英語 UI では `modeBDisplayGloss()` が自己参照 gloss を `(品詞)` または `def` で代替。

### 4.5 Mode B — Quiz（`#cardModeBQuiz`）

MCQ（4 択意味）またはディクテーション（綴り入力）。

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

### 4.8b 語彙ブラウザ（`#vocabModal`）

topbar の `#vocabBtn` から起動。プレイ中も利用可。Words（wordlist 4,439語）/ Phrases（connected_speech 201句）タブ。弱形 36 語は Phrases タブに含まない。Words は A→Z ソート・検索（debounce 120ms）・A–Z ジャンプ。各行: 単語 / GA+RP IPA / 意味（`vocabDisplayGloss`）/ 品詞 / TTS。RP 行は常に表示。`ipa === rp_ipa` のとき RP 行に `/ipa/（同じ）` 形式。英語 UI では `gloss.en === w` の自己参照を `def` または `(品詞)` で代替。Phrases は cs_type × level 順、タイプバッジ付き。モバイル（`max-width: 599px`）では検索欄を非表示。Escape で閉じる。i18n: `vocab.*`（5キー × 6言語）。

---

## 5. 動的情報の管理

### 5.1 単語データ — `wordlist_GA_a1a2_plus_phonics.json`

約 **4,439 語**（オリジナル 3,059 + Phase 1 M1–M4 で +1,380 B1）。主要フィールド:

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
  "neighbors": ["caller", "collar", "..."]
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
| `cefr` | CEFR レベル（`A1` / `A2` / `B1` / `B2`）。2026-07-07 訂正で `src: phonics` 652語の `cefr` は CEFR-J 一次データに基づく B1/B2 へ復元 |

#### `cefr` フィールドの現状（2026-07-09）

- 値: `"A1"` / `"A2"` / `"B1"` / `"B2"`
- 分布: A1=1,187 / A2=1,195 / **B1=1,727** / B2=330
- `src: "phonics"` の 652語は CEFR-J Wordlist v1.5 一次データ照合で B1/B2 正当語彙と確認され、`null` 化は取り消し済み
- Mode A の CEFR フィルタは Phase 0-b で実装済み（A1/A2/B1 UI、複数選択）
- Mode B は `MODEB_BANDS` を参照。B1/B2 バンドは空ではない

**パイプライン補足:** narrow IPA 候補・respelling のステージング JSON は `data/pipeline/`。バッチソースは `data/batches/`。詳細は `docs/REPOSITORY-STRUCTURE.md`。

### 5.2 連結句 — `data/connected_speech.json`

**201 句。** フィールド: `id`, `w`, `ipa`, `rp_ipa`, `cs_type`, `level` (1–3), **`cefr`** (A1–B2、2026-07-09 付与), `cs_rule` (en/ja/**fil**), `gloss`, `carrier`（キャリア文テンプレート）。

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
| `ipa_tts_v2:{accent}:{slug}` | TTS MP3（旧キーは GA として移行） |

### 5.4 セッション状態（メモリ `S`）

`appMode`, `tab`（`words` / `connected`）, `dir`, `focus`, `reg`, `grp`, `csFilter`, `csLevel`, `sessionPool`, `sessionNext`, `poolTotal`, `queue`, `idx`, `answered`, `correct`, `weak`, `missed`, `cur`, `mbPhase`, `curCarrier`（連結/弱形のキャリア文）, `revealed`, `built`（Encode IPA バッファ）, `mbQuiz`（Mode B クイズ状態）。キューアイテムに `mbKind`（`study` / `quiz`）。定数: `SESSION_INITIAL=6`, `SESSION_REFILL=5`, `MODEB_QUIZ_ENABLED=false`。モジュールレベル: `vocabTabCurrent`, `vocabBuilt`, `prefetchToken`, `memAudioCache`, `audioReady`, `speakBusy`, `guideLang`。リロードで消える。

### 5.5 i18n

| データ | パス |
|--------|------|
| UI 文言 | `i18n/{en,ja,zh,ko,fil}.json`（**167 キー**） |
| 音素解説 | `i18n/phonemes/{en,ja,zh,ko,fil}.json`（43 記号） |

検証: `python3 tools/validate_i18n.py`。監査ドキュメント再生成: `python3 tools/gen_audit_docs.py`。

---

## 6. 補足・制約

| 項目 | 内容 |
|------|------|
| アーキテクチャ | 単一 HTML。フレームワーク・認証なし |
| 進捗 | localStorage のみ（端末・ブラウザ単位） |
| 連結句 TTS | GA 固定。RP 連結音声は未対応 |
| 弱形 TTS | GA/RP 対応（`?weak=`）。キャリア文内の弱形 IPA を指示文で指定 |
| gloss.fil / cs_rule.fil | gloss.fil **4,439/4,439**（全語彙）。cs_rule.fil **237/237**（連結201+弱形36） |
| `def`（英語定義） | オリジナル 3,059語 batch01–08 完走。Phase 1 追加語は各バッチの `def` 付き |
| Mode B 語彙 | B1=1,727 まで拡充（Phase 1 M4 完了。M5 で残り ~389 B1 予定） |
| `neighbors_rp` | 保留（`docs/reference/rp-neighbors-priority-decision.md`） |
| TTS プリフェッチ | 全モード。キュー追加時に `prefetchItemsAudio`（6 問初期 / ストック&lt;5 で 5 問追加） |
| GA バッチ warm | `gas/BatchWarm.gs`（`gas/README.md` 参照） |
| 要注意音素 | `phonemes/*.json` の `t:1` + コード内 TRAPSET |
| 関連ドキュメント | `PURPOSE.md`, `DESIGN.md`, `REPOSITORY-STRUCTURE.md`, `gas/README.md`, `docs/reference/rp-tts-design-and-priority.md` |

---

## 変更履歴

| 日付 | 内容 |
|------|------|
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
