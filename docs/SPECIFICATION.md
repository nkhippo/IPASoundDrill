# English Pronunciation Trainer — 仕様書

> 本ドキュメントは、アプリの目的・設計・データ管理の正本（source of truth）です。  
> 機能追加や仕様相談の前提資料として利用してください。  
> 目的の正本は `docs/PURPOSE.md`、実装設計は `docs/DESIGN.md`（衝突時は PURPOSE → DESIGN → 本書の順で参照）。

**最終更新:** 2026-06-26  
**対象コード:** `index.html`、`wordlist_GA_a1a2_plus_phonics.json`、`data/connected_speech.json`、`data/weak_forms.json`、`data/guide.json`、`i18n/`、`gas/`

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

| モード | 目的 | 主なループ |
|--------|------|-----------|
| **Mode A：Pronunciation** | 既知語の IPA 読み書き（本丸） | Decode / Encode |
| **Mode B：Sound → Vocabulary** | 音から語彙獲得（サブ） | Study → Quiz（MCQ + ディクテーション） |

### 2.2 Mode A — 練習タブ

| タブ | 内容 |
|------|------|
| **Words** | 単語の Decode / Encode |
| **Connected Speech** | 連結 IPA → 元フレーズ、または弱形 IPA → 機能語（Decode のみ）。Type: All / linking / assimilation / elision / **weak**。Level L1–L3。キャリア文に IPA 埋め込み。All = 237 件（201 句 + 36 弱形） |

### 2.3 Mode A — Words の出題設計

- **1 セッション 10 問固定**（フィルタ後プールから適応抽出）
- **音素フォーカス（主）:** All / Trap sounds / Weak spots / Alphabet / Contractions / Irregular forms / Casual speech
- **綴りタイプ（従）:** All / Regular patterns / Irregular
- **規則グループ（Regular 時）:** Short / Long·silent e / Vowel teams / R-colored vowels
- **適応出題:** `ept_hist_v1`・`ept_sym_v1` に基づく Leitner + 弱点記号ターゲット（詳細は `DESIGN.md` §1.4）

### 2.4 Mode A — 学習方向

| 方向 | 学習者の行動 |
|------|-------------|
| **Decode** | IPA を見て英語の綴りを入力 |
| **Encode** | 英単語を見て IPA キーボードで発音を組み立て（GA/RP でキー配列が切替） |

### 2.5 Mode B — ループ

| 段階 | 内容 |
|------|------|
| **Study** | TTS 自動再生 → IPA のみ → [意味を確認する] → 単語＋gloss フェードイン。採点なし |
| **Quiz (a)** | 音 → 4択 MCQ（意味）。distractor: neighbors 2 + 同バンド random 1 |
| **Quiz (b)** | 音 → 綴り入力（Decode 採点流用） |

### 2.6 採点ロジック

| モード | OK | near | bad |
|--------|-----|------|-----|
| Decode | 綴り完全一致 | Levenshtein ≤ 1（入力 3 文字以上） | それ以外 |
| Encode | IPA（強勢含む）完全一致 | 強勢を除く音素列一致 | 音素列不一致 |

### 2.7 フィードバック設計

- **TTS:** 各問・解答後に参照発音（単語は GA/RP、連結句は GA、弱形は `?weak=`＋弱形 IPA で GA/RP）
- **音素タップ:** IPA 各記号の解説パネル（例語付き）
- **Reveal:** 正解単語・IPA・gloss・自分の回答・発音ポイント。RP/GA 切替時は代替アクセント IPA を補足表示
- **Encode:** 音素ごと OK/NG 色分け（LCS ベース）
- **Summary:** 正答率、苦手音素、ミス単語、苦手だけ復習

### 2.8 多言語 UI

- UI 言語: **en / ja / zh / ko / fil**（`localStorage.app_lang`、**156 キー**）
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
└──────────────┬──────────────────────────┬───────────────────┘
               │ fetch（静的）              │ GET ?word= / ?phrase= / ?weak= / ?warm=
               ▼                          ▼
┌──────────────────────────┐   ┌──────────────────────────────┐
│  GitHub Pages             │   │  Google Apps Script           │
│  Actions 自動デプロイ       │   │  gas/Code.gs → OpenAI TTS     │
│  main push で公開           │   │  OPENAI_API_KEY in Properties │
└──────────────────────────┘   └──────────┬───────────────────┘
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
| 音声 API | GAS Web App → OpenAI `gpt-4o-mini-tts` | API キー非露出 |
| サーバーキャッシュ | Google Drive `IPA-TTS-Audio/` | `{slug}__ga_v2.mp3` / `{slug}__rp_v2.mp3` |
| クライアント TTS キャッシュ | `localStorage` `ipa_tts_v2:{accent}:{slug}` | 2 回目以降 GAS 不要 |
| 単語データ | `wordlist_GA_a1a2_plus_phonics.json` | 語・IPA・rp_ipa・gloss・neighbors |
| 連結句 | `data/connected_speech.json` | 201 句・cs_type・level・rp_ipa・キャリア文 |
| 弱形 | `data/weak_forms.json` | 36 語・level・strong/weak IPA・キャリア文 |
| 学習ガイド | `data/guide.json` | en / ja / ko / zh-Hant / zh-Hans / fil |
| オフラインスクリプト | `scripts/*.py` | gloss・neighbors・RP IPA 生成（実行時不要） |

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
| 設定 | 言語・アクセントモーダル |
| Menu | プレイ中のみ。セットアップへ戻る |
| メーター | `3 / 10` または `done` |

### 4.1 セットアップ（`#setup`）

| 要素 | Mode A | Mode B |
|------|--------|--------|
| Learning mode | Pronunciation / Sound → Vocabulary | 同左 |
| Practice mode | Words / Connected Speech | （非表示） |
| Direction | Decode / Encode（Words のみ） | （非表示） |
| Phoneme focus | 7 ピル（Words のみ） | （非表示） |
| Spelling type / pattern group | あり（Words のみ） | （非表示） |
| Connected filters | Level L1–L3、Type（All / linking / assimilation / elision / **weak**） | （非表示） |
| Band | — | 現在 CEFR バンド表示 |
| プール件数 + 開始 | あり | あり |

### 4.2 問題 — Decode（`#cardDecode`）

IPA（タップ可）・TTS・綴り入力・Check。連結句・弱形時は cs メタ表示とキャリア文プロンプト。

### 4.3 問題 — Encode（`#cardEncode`）

英単語・TTS・IPA ビルドエリア・キーボード（GA/RP で記号セット切替）・Clear / Check。

### 4.4 Mode B — Study（`#cardModeBStudy`）

TTS・IPA・[意味を確認する] → 単語＋gloss フェードイン・「Got it → Next」。英語 UI では `modeBDisplayGloss()` が自己参照 gloss を `(品詞)` または `def` で代替。

### 4.5 Mode B — Quiz（`#cardModeBQuiz`）

MCQ（4 択意味）またはディクテーション（綴り入力）。

### 4.6 解答（`#reveal`）

OK/near/bad 色分け・単語・gloss・自分の回答・正解 IPA（Encode 時色分け）・代替アクセント IPA 補足・発音ポイント・TTS 自動再生。弱形時は強形↔弱形対比を追加表示。

### 4.7 サマリー（`#summary`）

正答率・苦手音素・復習リスト・Play again / Review misses only。

### 4.8 設定モーダル（`#settingsModal`）

| 項目 | 選択肢 | 保存キー |
|------|--------|----------|
| Language | en / ja / zh / ko / **fil** | `app_lang` |
| Accent | American (GA) / British (RP) | `app_accent` |

学習ガイド（`#guideModal`）は設定とは別。`#guideLangPills` で en / ja / ko / zh-Hans / zh-Hant / fil を切替。

### 4.8b 語彙ブラウザ（`#vocabModal`）

topbar の `#vocabBtn` から起動。Words（wordlist 3,059語）/ Phrases（connected_speech 201句）タブ。Words は A→Z ソート・検索（debounce 120ms）・A–Z ジャンプ。各行: 単語 / GA+RP IPA / 意味（`vocabDisplayGloss`）/ 品詞 / TTS。Phrases は cs_type × level 順、タイプバッジ付き。i18n: `vocab.*`（5キー × 5言語）。

---

## 5. 動的情報の管理

### 5.1 単語データ — `wordlist_GA_a1a2_plus_phonics.json`

約 **3,059 語**。主要フィールド:

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
  "def": "A small watercraft used to travel on water such as rivers and lakes.",
  "neighbors": ["caller", "collar", "..."]
}
```

| フィールド | 用途 |
|-----------|------|
| `w` | 正解綴り・TTS 入力 |
| `ipa` | GA IPA（Decode/Encode/reveal） |
| `rp_ipa` | RP IPA（accent=rp 時） |
| `neighbors` | Mode B MCQ distractor（RP でも GA リスト流用） |
| `neighbors_rp` | （将来用・未生成） |
| `gloss` | reveal・Mode B |
| `def` | Mode B Study reveal（英語 UI・`gloss.en === w` 時の定義文） |
| `src` | letter / contraction / irregular_* / casual / cefr / phonics 等 |
| `pattern` / `group` | 規則語フィルタ・発音ポイント |

### 5.2 連結句 — `data/connected_speech.json`

**201 句。** フィールド: `id`, `w`, `ipa`, `rp_ipa`, `cs_type`, `level` (1–3), `cs_rule` (en/ja/**fil**), `gloss`, `carrier`（キャリア文テンプレート）。

### 5.2b 弱形 — `data/weak_forms.json`

**36 語。** フィールド: `id`, `w`（機能語）, `ipa`（弱形）, `strong_ipa`, `level` (1–3), `cs_rule` (en/ja/**fil**), `carrier`（キャリア文テンプレート）。Decode のみ。TTS は `?weak=/IPA/&ww=word&accent=ga|rp`。

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

`appMode`, `tab`（`words` / `connected`）, `dir`, `focus`, `reg`, `grp`, `csFilter`, `csLevel`, `queue`, `idx`, `correct`, `weak`, `missed`, `cur`, `mbPhase` 等。リロードで消える。

### 5.5 i18n

| データ | パス |
|--------|------|
| UI 文言 | `i18n/{en,ja,zh,ko,fil}.json`（**151 キー**） |
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
| gloss.fil / cs_rule.fil | gloss.fil **3,059/3,059**（batch01–34）。cs_rule.fil **237/237**（Tier 4 完了） |
| `def`（英語定義） | **3,059/3,059**（batch01–08）。Mode B Study reveal（英語 UI） |
| Mode B 語彙 | 主データは A1–A2 + phonics。上級日常語拡張は継続 |
| `neighbors_rp` | 保留（`docs/rp-neighbors-priority-decision.md`） |
| 要注意音素 | `phonemes/*.json` の `t:1` + コード内 TRAPSET |
| 関連ドキュメント | `PURPOSE.md`, `DESIGN.md`, `gas/README.md`, `docs/rp-tts-design-and-priority.md` |

---

## 変更履歴

| 日付 | 内容 |
|------|------|
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
