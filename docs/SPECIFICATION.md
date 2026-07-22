---
id: pj-2026-06-24-1519
aliases:
- pj-2026-06-24-1519
title: IPA Sound Drill — 仕様書
created: '2026-06-24'
---

# IPA Sound Drill — 仕様書

> 本ドキュメントは、アプリの目的・設計・データ管理の正本（source of truth）です。  
> 機能追加や仕様相談の前提資料として利用してください。  
> 目的の正本は `docs/PURPOSE.md`、実装設計は `docs/DESIGN.md`（衝突時は PURPOSE → DESIGN → 本書の順で参照）。

**最終更新:** 2026-07-18（Phase 1-0-a: 目的 4 カード前提・Band 廃止・near 廃止。Issue #75）  
**対象コード:** `src/index.template.html`（正本。ビルド生成物 `/{lang}/index.html`）、`wordlist_GA_a1a2_plus_phonics.json`（**5,397 語**）、`data/connected_speech.json`、`data/weak_forms.json`、`data/guide.json`、`i18n/`、`gas/`  
**リポジトリ構成:** `docs/REPOSITORY-STRUCTURE.md`（フォルダマップ・AI向け）  
**目的の正本:** `docs/PURPOSE.md` v4.0（目的 4 カード）。画面 frame ID の正本は `docs/DESIGN.md`。

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

- CEFR A1–B2 程度の英語学習者（プロフィールで複数レベル選択。語彙は word-level CEFR タグ）
- 母語は日本語・中国語・韓国語・**フィリピン語（タガログ）**を想定（UI 言語として **en / ja / zh-Hans / zh-Hant / ko / fil** に対応）
- 学習対象の発音体系は **General American (GA)** を基準。**Received Pronunciation (RP)** を学習プロフィール（`3a`）で固定選択

### 1.2 アプリの位置づけ

**音から英語の発音を鍛え直すトレーナー**。入口は平坦な **目的 4 カード**（`2a`–`2d`）。タグラインは「音を、美しく。」（EN: *Retune your English. From sound up.*）。姉妹アプリ English Listening Trainer と役割分担。旧 Mode A/B 階層は廃止（`PURPOSE.md` v4.0）。

### 1.3 解決したい課題

| 課題 | 内容 |
|------|------|
| 語彙と発音のギャップ | 単語の意味は知っているが、**発音（音）が身体に定着していない** |
| 聞き取りとの連動 | 「**発音できない音は聞き取れない**」という知覚–運動のギャップ |
| IPA リテラシー不足 | 綴りと音が一致しない英語で、**IPA を読んで書ける力**が弱い |
| 連結音の理解 | 辞書形 IPA と実際の連結発音のギャップ（目的 `2d`） |
| 弱形の理解 | 機能語の強形と弱形のギャップ（`2d` Type: Weak forms） |
| 米英アクセント差 | セッション中の GA/RP 混在による参照音声・IPA の不整合（→ プロフィール固定） |

---

## 2. 課題への解決アプローチ

### 2.1 目的 4 カード（平坦）

| Frame | 目的（JA） | 主なループ |
|-------|------------|------------|
| `2a` | 音の発音を確かめる | Decode（IPA → 綴り） |
| `2b` | 発音から書いてみる | Encode（単語 → IPA） |
| `2c` | 音から単語を覚える | Study（sound-first・2 段階 reveal） |
| `2d` | 連結する音に慣れる | Decode（連結句 / 弱形） |

**導線（Q-20-δ）:** `1a` 目的カード → `3a` 学習プロフィール（毎セッション必須・LS プリセット）→「はじめる」→ ドリル。セッション内絞り込みはドリル内インラインチップのみ（独立絞り込み sheet は設けない）。

### 2.2 出題設計（単語系 `2a` / `2b`）

- **1 セッション = フィルタ後プールの全件**（重複なし。プール枯渇まで継続）
- **音素フォーカス（主）:** All / Trap sounds / Weak spots / Alphabet / Contractions / Irregular forms / Casual speech（プロフィール / インライン）
- **綴りタイプ（従）:** All / Regular patterns / Irregular
- **規則グループ（Regular 時）:** Short / Long·silent e / Vowel teams / R-colored vowels
- **Trap sounds 詳細:** `TRAPSET = ['θ', 'ð', 'æ', 'ʒ', 'ɝ']`
- **適応出題:** `ept_hist_v1`・`ept_sym_v1`・マーキングに基づく Leitner + 重み付け（詳細は `DESIGN.md`。旧 `ept_checks_v1` からの移行は Phase 1-0-b〜1-C）

### 2.3 連結・弱形（`2d`）

| 対象 | 内容 |
|------|------|
| 連結句 | IPA → 元フレーズ。Type: All / linking / assimilation / elision / **weak**。Level L1–L3。All = 237（201+36） |
| 弱形 | 弱形 IPA → 機能語 `w`。キャリア文共通 |

**Connected の CEFR（Phase 1 確定）:** word-level **タグ表示のみ**。UI フィルタは **level / type の 2 軸のみ**（フィルタ UI は追加しない。Q-5-B 維持 + 横断は表示）。

### 2.3b セッション共通 — 先読み・終了

| 項目 | 仕様 |
|------|------|
| **先読み（問題）** | 開始時に現問＋先読み5＝**6 問**をキューへ。ストック（現問を除く先読み数）が **&lt; 5** になるたびに **5 問**追加 |
| **先読み（音声）** | キュー追加と同時に GA+RP 両方 warm → 現アクセント body 優先 → 反対アクセントはアイドル時。Connected / 弱形も対象 |
| **プリフェッチ定数** | `warmChunk = 6`、`warmParallel = 2`、`bodyParallel = 3`。`SESSION_REFILL = 5` |
| **スピーカー** | キャッシュ準備完了まで無効化（全目的共通） |
| **離脱確認** | Decode / Encode / Study / Reveal から Menu またはブランドタップ時に Yes/No。**Yes → トップ（`1a`）復帰**（再開なし）。Summary・プロフィールではモーダルなし |
| **終了** | プール全問消化で自動サマリー |
| **進捗表示** | 各カード内 `現在番号 / プール総数` + STEP 行右上の CEFR タグ（例:「語彙 A2」） |

### 2.4 学習方向（`2a` / `2b`）

| 方向 | 学習者の行動 |
|------|-------------|
| **Decode（`2a`）** | IPA を見て英語の綴りを入力 |
| **Encode（`2b`）** | 英単語を見て IPA キーボードで発音を組み立て（プロフィール固定の GA/RP でキー配列が切替） |

### 2.5 音から単語を覚える（`2c`）

| 段階 | 内容 | UI |
|------|------|-----|
| **Study** | TTS 自動再生 → IPA のみ → [意味を確認する] → 単語＋gloss。採点なし | **有効** |
| **Quiz (a/b)** | MCQ / ディクテーション | 非表示（`MODEB_QUIZ_ENABLED=false`。コード温存） |

**出題:** フィルタ後プールの全語を Study として重複なしで消化（§2.3b と同じ）。`letter`・`contraction` はプール除外。

**Mode B Band（廃止・Q-2-B）:** 旧 SPEC では本節（※起草時に §2.4 と誤記されていた箇所）にバンド進行・`MODEB_BAND_UNLOCK_RATIO`・`refreshVocabBandUnlock()` を記載していた。**Phase 1 で仕様削除。** 実装コード上の残存シンボル（`MODEB_BANDS`、`MODEB_BAND_UNLOCK_RATIO`、`ept_vocab_band`、`refreshVocabBandUnlock`、`bandProgress`、orphan i18n `modeb.band.*` / `modeb.pool`）の削除は **Phase 1-A〜1-H で対応**（本 Issue では削除対象の明示のみ。Category A 本文への i18n キー記載は不要）。

**セッション定数（Quiz 有効時・温存）:** `MODEB_SESSION = {newCount: 10, reviewCount: 10}`

### 2.6 採点ロジック

**完全一致のみ（near 廃止・Phase 1-0-a）。** 惜しさ・部分正解は示さない。

| 目的 | ok | bad |
|------|-----|-----|
| Decode（`2a` / `2d`） | 綴り（正規化後）完全一致 | それ以外 |
| Encode（`2b`） | IPA（強勢含む）完全一致 | それ以外 |

- Decode: 旧 Levenshtein ≤ 1 の near 判定は **設計・実装とも削除**（`lev` / `spellCheck` の near 分岐）
- Encode: 旧「強勢以外一致 = near」は **削除**。強勢込み完全一致のみ ok
- Summary: 正答率は `ok` のみ。Reveal の見た目クラスは `res-ok` / `res-bad` のみ（`res-near` 削除）

### 2.7 フィードバック設計

- **TTS:** 各問・解答後に参照発音（単語はプロフィール固定 GA/RP、連結句は GA、弱形は `?weak=`＋弱形 IPA で GA/RP）
- **TTS プリフェッチ（Phase T）:** キュー追加時に `prefetchItemsAudio`（方針維持。詳細は `DESIGN.md` §3）
- **音素タップ:** IPA 各記号の解説パネル（例語付き）
- **Reveal:** 正解・IPA・gloss・自分の回答・発音ポイント。反対アクセント行（`ga_rp_same` 時は `/ipa/（同じ）`）
- **Encode:** 音素ごと OK/NG 色分け（LCS。**判定自体は ok/bad の 2 値**）
- **Summary:** `{正解} / {回答済み} 正解`、苦手音素、ミス単語、TOP へ / 苦手だけ復習
- **マーキング:** ユーザー手動のみ。システムは正誤で自動評価しない

### 2.8 多言語 UI

- UI 言語: **en / ja / zh-Hans / zh-Hant / ko / fil**（`localStorage.app_lang`）
- 音素解説: 各 UI 言語の `i18n/phonemes/<lang>.json`。欠落時は en にフォールバック
- 学習ガイド: `data/guide.json`（6 言語）。UI i18n とは独立
- 語義 gloss: en / ja / zh / ko / **fil（5,397語）**
- 連結句・弱形ルール文（`cs_rule`）: 連結句 201 は 6 言語。弱形 36 は当面 en/ja/fil
- 学習対象の英単語・IPA・TTS は言語共通（常に英語）
- **AI クローラビリティ:** 思想・導線の重要文は JS なしで DOM 常時（フッター `3h` 等）

### 2.9 アクセント設定

- **GA / RP** — 学習プロフィール（`3a`）で選択し **セッション固定**（学習中切替不可）。ヘッダーに固定バッジ
- 保存キー（現行）: `localStorage.app_accent`（既定 `ga`）。プロフィール一元化後のキー統合は Phase 1-0-b / 1-C
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

> Phase 1 の画面 frame ID（`1a` / `2a`–`2d` / `3a`–`3h`）の情報階層は `DESIGN.md` を正とする。本節は現行 DOM との対応と、Phase 1 へ移行する仕様の橋渡しを記述する。PC 版 variant（`-pc`）は Phase 1-H で追記（本 Issue では言及しない）。

画面切替は主に `<section>` の `hidden` で表示制御。**語彙系統（`3b` / `3c`）** のみ hash routing（`#/vocab` / `#/vocab/phrases` / `#/vocab/ipa`）を用いる。その他の練習画面はルーターなし。

### 4.0 全画面共通 — トップバー・シェル

| 要素 | 内容 |
|------|------|
| ブランド | `#brandBtn` + `#brandName` |
| 語彙 | `#vocabBtn` — 常時表示（Phase 1 で `3b` 導線へ） |
| ガイド | `#guideBtn` — オンボーディング再表示（`3g`）にも利用予定 |
| 設定 / 言語 | 現行 `#settingsBtn`。Phase 1 で `3f` / プロフィール `3a` へ再配置 |
| Menu | `#backTopBtn` — プレイ中。離脱確認対象では Yes で `1a` 復帰 |
| アクセントバッジ | Phase 1: ヘッダーに GA/RP **固定**表示（学習中切替なし） |
| 離脱確認 | `#exitConfirmModal` — Decode / Encode / Study / Reveal |
| 進捗表示 | 各カード内 `#*No` + CEFR タグ |

#### §4.0.1 Footer

`#siteFooter` は shell 最下部。Feedback / Terms / Privacy / X。Phase 1 で「このアプリについて」（`3h`）を DOM 常時配置（AI クローラビリティ）。

- 表示条件: `body.in-play` では非表示

#### §4.0.2 Modals

| モーダル | Backdrop | Escape | Outside click |
|----------|----------|--------|---------------|
| `#exitConfirmModal` | `#exitConfirmScrim` | **No 相当** | scrim → No 相当 |
| `#settingsModal` | `#settingsScrim` | 閉じる | scrim → close |
| `#guideModal` | `#guideScrim` | 閉じる | scrim / Close → close |

Escape 判断は Q-9-A 確定（2026-07-16）。

### 4.1 学習プロフィール（`3a`）— Phase 1 正 / 現行は `#setup`

**Phase 1 仕様（Q-20-δ）:** 目的カード選択後に **毎セッション必ず `3a` を通過**。LocalStorage で前回設定をプリセット（`prev_settings_v1` 相当。詳細は Phase 1-0-b）。ユーザーは「そのまま『はじめる』」または変更後開始。

集約するパラメータ（Setup 11 項目（Recon `screen-data-mapping.md` § 1 に確定）+ Onboarding）: アクセント、CEFR 複数選択（A1–B2）、目的別プリセット、旧「詳しい設定」相当。

**現行 DOM（移行前）:** `#setup` に Learning mode / Practice / CEFR ピル / 詳しい設定が同居。

**Connected フィルタ:** level + type のみ。CEFR は **タグ表示のみ・UI フィルタなし**（§2.3）。

### 4.2 問題 — Decode（`2a` / `2d`・`#cardDecode`）

IPA・TTS・綴り入力・Check。連結句・弱形時は cs メタとキャリア文。単語時は反対アクセント行。採点は完全一致のみ。

### 4.3 問題 — Encode（`2b`・`#cardEncode`）

英単語・TTS・IPA ビルド・キーボード（固定アクセント）・Clear / Check。採点は強勢込み完全一致のみ。

### 4.4 Study（`2c`・`#cardModeBStudy`）

TTS・IPA・反対アクセント行・[意味を確認する] → 単語＋gloss・[次へ]。

### 4.5 Quiz（凍結）

`#cardModeBMcq` / `#cardModeBDict`。`MODEB_QUIZ_ENABLED=false`。ディクテーション採点も完全一致のみ（near なし）。

### 4.6 解答（`#reveal`）

OK/bad 色分けのみ（`res-near` 削除）。単語・gloss・自分の回答・正解 IPA（Encode 時トークン色分け）・発音ポイント・TTS。

### 4.7 サマリー（`#summary`）

正答率（`ok` のみ）・苦手音素・復習リスト・TOP へ / Review misses。

### 4.8 ~~言語設定（`3f`）~~（廃止）・学習ガイド

`3f` 独立画面は Phase 1-E PR-3 で完全撤去。言語切替はヘッダーの `#langSwitcher` / `#langMenu` に集約し、`app_lang` を維持する。Accent は `3a` へ移し学習中不変。ガイドは `#guideModal` / 将来 `3g` 再表示。

### 4.8b 語彙リスト（`3b`・`#vocabPage`）— Phase 1-E PR-1

- hash `#/vocab` / `#/vocab/phrases`
- **Exclusive full-page:** `body.vocab-page`（`setExclusivePage("vocab")`）。shell `.wrap` 非表示
- Words **5,397** / Phrases 201、CEFR バッジ、進捗チェック（マーキング移行予定）
- IPA 記号ピッカー（`3c`）へは sticky filter の Segmented「IPA」から `#/vocab/ipa`

**Sticky filter bar（`.filter-bar-sticky`）:**
- Back / タイトル
- タブ（Words / Phrases）
- Segmented 検索モード: 綴り（`#vocabSearchInput`） / IPA（→ `3c`）
- CEFR pills（複数選択。**初期は全 CEFR 選択** — `prev_settings` 非連動、裁定 A5=B）
- A–Z ジャンプ（Words。仮想リストへ `jumpVocabLetter`）

**Words リスト（仮想化）:**
- `rebuildVirtSlots` / `paintVirtWindow` — 常時 ~20–30 DOM 行、固定行高 + scroll（裁定 A3=A）。Time-slicing なし・Skeleton 維持（A4=B）
- 行: 上段 単語+バッジ / 下段 GA+RP IPA + gloss / 右端 進捗チェック + TTS
- Phrases は **非仮想化**（裁定 A8=A）

i18n: `vocab.*` + `vocab.filter.*`。`body.scroll-locked` は語彙ページでは使わない。

> **Phase 1-E PR-1 note:** UI i18n leaf は実装上 **219**（182→219、+37）。§5.5 の集約数値更新は PR-3。

### 4.8c IPA 記号ピッカー（`3c`・`#symbolPickerPage`）— Phase 1-E PR-1

- hash `#/vocab/ipa`（裁定 A1=A / A7=A）
- **Exclusive full-page:** `body.symbol-picker-page`
- **Split view:** 上段パレット固定 / 下段結果スクロール（仮想化）
- Query chips（`symbolQuery` 配列）: 記号タップで蓄積・順序保持・個別削除 / Clear
- IPA chart 標準分類（`symbolChartGroups`）: 見出し EN primary + L1 sub（ja 充填、他言語空可 — 裁定 A6=A）
- Live IPA substring 検索（Recon §5 の単純 `includes` 全走査）。一致箇所は `--signal` highlight
- CSS: `.query-chip` / `.symbol-cell` / `.symbol-group-heading` / `.vocab-virt-*`

i18n: `symbol.picker.*` / `symbol.group.*.{en,sub}` / `symbol.height.*.{en,sub}`。

### 4.8d 学習状況（`3d`・`#learningStatusPage`）— Phase 1-E PR-2

- hash `#/progress`、`body.progress-page` の exclusive full-page。Back / Escape は `1a` へ戻る
- `1a` の Feature Card「学習状況を見る」から起動
- CEFR pills は複数選択。初期値は `prev_settings_v1.cefrLevels`、fallback は A1+A2
- 総合 / ドリル別の卒業率は `ept_marks_v1` の値 `3` を卒業として算出。`2a`–`2c` は wordlist、`2d` は connected + weak が母集団
- SRS queue は `ept_hist_v1` / `ept_vocab_v1` の `ts + BOX_INTERVAL_MS[box]` を dueAt とし、期限切れ + ローカル当日末までを word 単位で統合表示
- queue は全件表示。100件超では `.srs-virt-*` により可視行のみ描画し、行 tap で該当語1件の `2c` Study を開始
- i18n は既存 `progress` object を拡張（6言語同一 schema、18 leaf 追加。実測 237 leaf）

### 4.8h このアプリについて（`3h`・`#aboutBlock`）— Phase 1-E PR-3

- トップページ末尾に DOM 常時配置し、JS 無効時も見出しを保持する
- リード、「なぜ IPA を学ぶか」、特徴 5 項目、フィードバック導線で構成する
- `about.lead` は text、`about.why_ipa_html` / `about.features.item_1_html`〜`item_5_html` / `about.contact_html` は HTML として適用する
- IPA 表記は `--font-ipa`、その他は Mood B token を使用する
- 6 言語同一 schema。既存 `about.title` / `about.placeholder` の value は維持し、新規 `about.*` 9 leaf のみ追加する

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

#### `cefr` フィールドの現状（2026-07-18）

- 値: `"A1"` / `"A2"` / `"B1"` / `"B2"`（**word-level タグ**。全目的横断）
- 分布: A1=1,187 / A2=1,195 / **B1=2,116** / **B2=899**
- `src: "phonics"` の 652語は CEFR-J Wordlist v1.5 一次データ照合で B1/B2 正当語彙と確認済み
- **Phase 1:** プロフィール（`3a`）で複数レベル選択。ドリル STEP 行にタグ表示。Connected（`2d`）はタグ表示のみ・UI フィルタなし
- **廃止:** Mode B `MODEB_BANDS` によるバンド進行（実装削除は Phase 1-A〜1-H）
- 全語カバレッジ・未タグ語の扱いは Q-17 / Phase 1-0-b Recon で確定

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

**201 句。** フィールド: `id`, `w`, `ipa`, `rp_ipa`, `cs_type`, `level` (1–3), **`cefr`** (A1–B2、2026-07-09 付与), `cs_rule` (en/ja/fil/**ko/zh-Hans/zh-Hant**、2026-07-16 Q-7-A), `gloss`, `carriers`（キャリア文テンプレート配列）。

#### Connected phrase TTS（Track A・Q-6-B 確定）

- SPA からの API 呼び出しは **`phrase=&accent=ga` 固定**
- `BatchWarm.gs` の暖機ループも GA 固定
- RP 連結 TTS は Track B（React 化以降）で対応予定

### 5.2b 弱形 — `data/weak_forms.json`

**36 語。** フィールド: `id`, `w`（機能語）, `ipa`（弱形）, `strong_ipa`, `level` (1–3), **`cefr`** (A2/B1、2026-07-09 付与), `cs_rule` (en/ja/**fil**), `carrier`（キャリア文テンプレート）。Decode のみ。TTS は `?weak=/IPA/&ww=word&accent=ga|rp`。

### 5.2c 学習ガイド — `data/guide.json`

UI i18n とは独立。各言語キー（`en`, `ja`, `ko`, `zh-Hans`, `zh-Hant`, `fil`）に8セクション（`welcome` … `how_to_use`）。段落数: welcome 4 / philosophy 3 / solves 2 / modes 3 / decode_encode 3 / connected 3 / accents 1 / how_to_use 3。モーダルで閲覧。

### 5.3 localStorage（永続）

| キー | 内容 | Phase 1 扱い |
|------|------|----------------|
| `app_lang` | UI 言語 | 維持（`3f`） |
| `app_accent` | `ga` / `rp` | プロフィール固定へ（キー統合は 1-0-b / 1-C） |
| `app_mode` | 旧 `a` / `b` | 目的 4 カード化で廃止予定 |
| `ept_hist_v1` | 単語 SRS（Leitner） | 維持（目的横断の扱い整理は後続） |
| `ept_sym_v1` | 記号弱点（Encode） | 維持 |
| `ept_vocab_v1` | Study 語彙 SRS | 維持 |
| `ept_vocab_band` | 旧 Mode B バンド | **廃止予定**（実装削除は 1-A〜1-H） |
| `ept_checks_v1` | 旧手動進捗 d/e/l | **マーキングへ移行予定** |
| `mark:{drill_id}:{word_id}` | マーキング 0..3（仕様の正） | Phase 1-C で実装。詳細は 1-0-b |
| `onboarding_completed_v1` | オンボーディング完了 | Phase 1-F |
| `prev_settings_v1`（仮） | プロフィール前回値 | Phase 1-0-b で確定 |
| `va-disable` | Analytics オプトアウト | 維持 |

**マイグレーション:** 既存 `ept_hist_v1` / `ept_checks_v1` / `ept_vocab_v1` からの移行方針は Phase 1-0-b Recon で確定し、実装は Phase 1-C。

#### TTS キャッシュキー

- Prefix: `ipa_tts_v2:`（定数 `LS_TTS_PREFIX`）
- キー形式: `ipa_tts_v2:{ga|rp}:{slug}`（単語）、`ipa_tts_v2:{ga|rp}:p4_{slug}`（連結）、`ipa_tts_v2:{ga|rp}:weak_{slug}`（弱形）
- Legacy 形式（`ipa_tts_v1:*`）は読取時に v2 へマイグレーション

### 5.4 セッション状態（メモリ `S`）

現行: `appMode`, `tab`（`words` / `connected`）, `dir`, `focus`, `reg`, `grp`, **`cefrLevels`**, `csFilter`, `csLevel`, `sessionPool`, `sessionNext`, `poolTotal`, `queue`, `idx`, `answered`, `correct`, `weak`, `missed`, `cur`, `mbPhase`, `curCarrier`, `revealed`, `built`, `mbQuiz`。

定数: `SESSION_INITIAL=6`, `SESSION_REFILL=5`, `MODEB_QUIZ_ENABLED=false`, `MODEB_SESSION={newCount:10, reviewCount:10}`, `PREFETCH={warmChunk:6, warmParallel:2, bodyParallel:3}`。

**削除予定定数（Band・後続 Issue）:** `MODEB_BAND_UNLOCK_RATIO`（および `MODEB_BANDS` / `refreshVocabBandUnlock` / `bandProgress`）。

#### `S.cefrLevels`

全目的横断の CEFR フィルタ状態。Phase 1 ではプロフィール（`3a`）が正。初期値は現行 Setup ピル（既定 `{"A1","A2"}`）。

#### `S.mbPhase`

Study（`2c`）の内部フェーズ。Quiz 凍結時は Study のみ。

### 5.5 i18n

| データ | パス |
|--------|------|
| UI 文言 | `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json`（**246 leaf**。6 言語同一 schema） |
| 音素解説 | `i18n/phonemes/{en,ja,ko,zh-Hans,zh-Hant,fil}.json`（47 記号） |

**leaf 変遷（各言語の実測）:**

| Phase | leaf |
|---|---:|
| Phase 1-D | 182 |
| Phase 1-E PR-1 | 219 |
| Phase 1-E PR-2 | 237 |
| Phase 1-E PR-3 | **246** |

PR-3 の増分は新規 `about.*` 9 leaf。既存 key の value は変更しない。Build-only の `meta.*` 4 leaf を含む。

検証: `python3 tools/validate_i18n.py`。監査ドキュメント再生成: `python3 tools/gen_audit_docs.py`.

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
| Mode B 語彙 | B1=2,116 / **B2=899**（Phase 2 M2 完了 2026-07-10）。Band 進行は廃止 |
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
| 2026-07-22 | Phase 1-E PR-3（#122）: `3h` About を6言語・246 leafへ拡張。`3f` 独立画面廃止を docs に集約 |
| 2026-07-20 | Phase 1-E PR-1（#91）: `3b` exclusive full-page + 仮想化、`3c` `#/vocab/ipa` 記号ピッカー。i18n 219 leaf（§5.5 集約は PR-3）。`var(--legacy-*)` 249→228 |
| 2026-07-18 | Phase 1-0-a（#75）: 目的 4 カード前提へ骨格改訂。Mode B Band 記述削除、near 採点廃止、CEFR 全目的横断・Connected はタグ表示のみ、プロフィール一元通過 / マーキング / オンボーディングの LS 要件を明示 |
| 2026-07-16 | Q-7-A: Connected `cs_rule` に ko / zh-Hans / zh-Hant 追加（201 句 × 3。既存 en/ja/fil 不変） |
| 2026-07-16 | Q-9-A: 3 モーダルに Escape キー対応（Exit=No 相当、Settings/Guide=閉じる） |
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
