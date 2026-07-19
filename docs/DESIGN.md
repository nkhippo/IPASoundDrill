---
id: pj-2026-06-24-1983
aliases:
- pj-2026-06-24-1983
title: IPA Sound Drill — 実装設計仕様（DESIGN.md）
created: '2026-06-24'
updated: '2026-07-18'
---

# IPA Sound Drill — 実装設計仕様（DESIGN.md）

> `PURPOSE.md` v4.0 で確定した目的 4 カード構成を、Cursor が実装に落とせる粒度まで具体化した仕様。
> 本ドキュメントは「何を作るか（what / how）」の正本。目的の正本は `PURPOSE.md`。
> 画面・JSON フィールド・localStorage の正本は **`SPECIFICATION.md`**。フォルダマップは **`REPOSITORY-STRUCTURE.md`**。
>
> **更新日:** 2026-07-18 ／ **ステータス:** Phase 1 UI/UX 確定事項を情報設計に反映（Issue #75）。near 採点は実装削除済み。目的 4 カード UI・プロフィール一元通過等の DOM 実装は Phase 1-A 以降。語彙 **5,397語**。UI **169 leaf**。

---

## 0. 用語

| 略語 / ID | 意味 |
|---|---|
| Decode | IPA → 単語（読み）。テキスト入力（目的 `2a` / `2d`） |
| Encode | 単語 → IPA（書き）。IPAキーボードでタップ組み立て（目的 `2b`） |
| Study | 音先行の提示ループ（目的 `2c`） |
| Leitner | 正答で間隔を伸ばし誤答で短縮するSRS方式 |
| 音素近傍 | IPAトークン列の編集距離が小さい語（MCQ distractor 用。採点の near とは別） |
| Frame ID | 画面概念 ID（1 概念 = 1 ID）。言語・デバイスは variant suffix |

---

## 0.1 Frame ID 再採番（Phase 1 正本）

命名規則: **概念のみ**を ID とし、言語は `-ja` / `-en` / `-ko` / `-zh-hans` / `-zh-hant` / `-fil`、デバイスは `-pc`（Phase 1-H。base はモバイル 375px）。組み合わせ例: `1a-pc-ja`。

| 系統 | 新 ID | frame 名 | Claude Design 元 ID |
|---|---|---|---|
| Top (1 系) | `1a` | トップページ | `4a` (=`1a-ja`) / `4c` (=`1a-en`) / `4d` (=`1a-ko`) |
| Drill (2 系) | `2a` | 音の発音を確かめる | `7a` |
| | `2b` | 発音から書いてみる | `7b` |
| | `2c` | 音から単語を覚える | `7c` |
| | `2d` | 連結する音に慣れる | `7d` |
| Support (3 系) | `3a` | 学習プロフィール | `8z` |
| | `3b` | 語彙リスト | `8a` |
| | `3c` | IPA 記号ピッカー | `8a→`（独立 concept に昇格） |
| | `3d` | 学習状況 | `8b` |
| | `3e` | IPA って何？ | `8c` |
| | `3f` | 言語設定 | `8d` |
| | `3g` | オンボーディング 4 スライド | `8e` |
| | `3h` | このアプリについて | `8f` |

計 **13 concept**。PC 版の詳細レイアウトは Phase 1-H で追記（本 Issue では `-pc` の存在のみ言及可、`Pt`/`Pd` 等は書かない）。

---

## 1. UI 情報設計（Phase 1）

### 1.0 セッションフロー（Q-20-δ）

```
[初回のみ 3g オンボーディング]
        ↓
       1a トップ（目的 4 カード + タグライン）
        ↓ 目的選択
       3a 学習プロフィール（毎セッション必須・LS プリセット）
        ↓ 「はじめる」
   2a / 2b / 2c / 2d ドリル
        ↓
     Reveal → 次へ / Summary
```

セッション内絞り込みは各ドリル内の **インライン静かなチップ** のみ。独立の絞り込み bottom sheet frame は設けない（Claude Design の旧 `3b` 誤記は採用しない。語彙リストが `3b`）。

### `1a` トップページ

- **役割:** エントリーポイント。目的 4 カードで即開始
- **言語 variant:** `1a-ja` / `1a-en` / `1a-ko`（Phase 1-B は JA、他は Phase 1-G）
- **デバイス variant:** モバイル 375px (base) / `1a-pc` は Phase 1-H
- **情報階層:** ヘッダー（言語切替 + ガイドアイコン） / タグライン「音を、美しく。」 / 目的 4 カード / フッター 3 リンク（`3h` 含む）

### `3a` 学習プロフィール

- アクセント（GA/RP）固定選択、CEFR 複数選択、目的別プリセット、旧「詳しい設定」相当を一元集約
- 毎セッション通過。前回値を LocalStorage からプリセット（キー詳細は Phase 1-0-b）
- 学習中のアクセント切替 UI は持たない。ヘッダーに固定バッジ

### `2a`–`2d` ドリル

| ID | 情報階層（概要） |
|----|------------------|
| `2a` | STEP + CEFR タグ / IPA / 入力 / Check / TTS |
| `2b` | STEP + CEFR タグ / 単語 / IPA ビルド + キーボード / Check |
| `2c` | STEP + CEFR タグ / 音 → IPA → 意味確認 → 単語＋gloss |
| `2d` | STEP + CEFR タグ（表示のみ） / 連結または弱形 IPA / 句・語入力。フィルタは level・type のみ |

### 支援画面

| ID | 役割 |
|----|------|
| `3b` | 語彙リスト（現行 `#vocabPage`） |
| `3c` | IPA 記号ピッカー（`3b` の絞り込みから開く） |
| `3d` | 学習状況 |
| `3e` | IPA って何？ |
| `3f` | 言語設定 |
| `3g` | オンボーディング 4 スライド（`onboarding_completed_v1`） |
| `3h` | このアプリについて（DOM 常時・クローラビリティ） |

### 視覚言語（原則のみ）

カラー / タイポ / スペーシング / 角丸 / シャドウ / コンポーネントをトークン化。**具体値は Phase 1-A**。

### 視覚言語トークン（概要と正本）

Phase 1 UI（Mood B / Warm Contemporary）の視覚トークンは `:root` に定義し、既存画面は `--legacy-*` 経由で見た目を維持する。トークンの具体値・コンポーネント CSS・`:root` コピペ用ブロックは本節に書かず、以下を正とする。

1. 実装用 snapshot: [`docs/design/phase-1/visual-tokens.md`](design/phase-1/visual-tokens.md)
2. CSS 命名・legacy 運用（Category A）: [`docs/CSS-CONVENTIONS.md`](CSS-CONVENTIONS.md)
3. 意匠判断の背景（Vault source of truth）: `30_projects/IPASoundDrill/design/phase-1/design-tokens.md`

---

## 2. ドリル実装方針（現行コード橋渡し）

> 以下は Track A 現行 `src/index.template.html` の実装を、目的 ID に読み替えた設計メモ。DOM 再配置は Phase 1-A 以降。

### 2.1 出題軸（`2a` / `2b`）

音素フォーカスを主セレクタ、規則性を従。CEFR はプロフィール複数選択（word-level タグ）。旧 Mode A ピル UI は `3a` / インラインへ移行予定。

### 2.2 採点（客観・完全一致のみ）

| 目的 | ok | bad |
|---|---|---|
| Decode（`2a`/`2d`） | 綴り完全一致 | それ以外 |
| Encode（`2b`） | IPA（強勢含む）完全一致 | それ以外 |

- **near 廃止（Phase 1-0-a）:** Levenshtein near、強勢以外一致 near、`res-near` CSS、Mode B Quiz の near 扱いを削除済み
- 自己評価ボタンは設けない
- Encode の LCS トークン色分けはフィードバック用（判定は 2 値）

### 2.3 localStorage（現行 + Phase 1 追加）

```jsonc
"ept_hist_v1": { "<word>": { "box": 1, "seen": 0, "ok": 0, "ng": 0, "ts": 0 } }
"ept_sym_v1": { "<symbol>": { "att": 0, "err": 0 } }
"ept_checks_v1": { "<wordKey>": { "d": 2, "e": 1, "l": 0 } }  // 移行元
// Phase 1 正:
// "mark:{drill_id}:{word_id}": 0..3
// "onboarding_completed_v1": true
// "prev_settings_v1": { ... }  // 詳細は 1-0-b
"ept_vocab_v1": { "<word>": { "box": 1, "seen": 0, "okMean": 0, "ngMean": 0, "okSpell": 0, "ngSpell": 0, "ts": 0 } }
// "ept_vocab_band" — 廃止予定（実装削除は 1-A〜1-H）
```

- 誤答(bad) → `box=1`。正答(ok) → `box+1`（最大5）
- マーキングはユーザー手動のみ。システムは正誤で自動評価しない

### 2.4 適応出題（プール全件・重複なし）

セッション開始時にフィルタ後プール全件の出題順を決定（`buildSessionQueue`）。先読みは §3.4b。

重み付け（hist キー数 ≥ 3）: Due 40% / Symbolic 40% / New 余り。最終にマーキング重みシャッフル。

コールドスタート（hist &lt; 3）: CEFR 選択に沿った音節数スキャフォールド。

### 2.5 Reveal

- 出題語、正解 IPA、gloss、自分の解答差分、TTS、記号タップ解説
- OK/bad の 2 値スタイルのみ

### 2.6 GA / RP（セッション固定）

| 項目 | 仕様 |
|------|------|
| 選択 | `3a` プロフィールのみ。学習中不変 |
| 表示 IPA | `activeIpa(c)` |
| reveal 補足 | 反対アクセント行（`ga_rp_same` 時は `/ipa/（同じ）`） |
| Encode キーボード | 固定アクセントの記号セット |
| 連結句 TTS | GA 固定 |

### 2.7 Connected Speech（`2d`）

- データ: `connected_speech.json` 201 + `weak_forms.json` 36
- Type / Level フィルタ。**CEFR はタグ表示のみ・UI フィルタなし**
- Decode のみ

### 2.8 音から単語を覚える（`2c`）

- Study: 音 → IPA → 意味確認 → 単語＋gloss。採点なし
- Quiz: 凍結（`MODEB_QUIZ_ENABLED=false`）。復活時の distractor は `neighbors`（近傍2＋同 CEFR ランダム1）
- **Band 廃止（Q-2-B）:** 旧 §2.4 バンド解放・`MODEB_BAND_UNLOCK_RATIO`・`ept_vocab_band` は仕様削除。実装シンボル削除は Phase 1-A〜1-H
- プール除外: `letter` / `contraction`

---

## 2b. 語彙ブラウザ（参照閲覧）

トップバー `#vocabBtn` から起動する**独立ページ**（`<section id="vocabPage">`）。hash routing: `#/vocab`（Words）/ `#/vocab/phrases`（Phrases）。練習セッション中も利用可（設定・ガイドはプレイ中非表示だが語彙ブラウザは常時表示）。Back（`#vocabBackBtn`）は Menu（`#backTopBtn`）と独立し、セットアップまたは直前の練習 view へ戻る。

| タブ | 内容 |
|------|------|
| **Words** | wordlist 全 **5,397** 語。A→Z ソート・検索（debounce 120ms）・A–Z ジャンプ・**進捗チェック（d/e/l）**・**CEFR バッジ** |
| **Phrases** | `connected_speech.json` 201 句。cs_type × level 順。**CEFR バッジ**付き。弱形は含まない |

各行（2 段組）: 上段に単語 + バッジ、下段に GA+RP IPA + 意味（`vocabDisplayGloss()`）、右端に進捗チェック + TTS。RP 行は常時表示（`ga_rp_same` 時は `reveal.alt_same` 形式）。英語 UI で `gloss.en === w` の自己参照は `def` または `(品詞)` で代替。検索欄は**モバイルでも常時表示**。モーダル scrim / Escape 閉じは廃止（ページ全体スクロール）。

詳細: `docs/SPECIFICATION.md` §4.8b、`docs/cursor/reports/cursor-implementation-report-phase-v.md`

### 2c. Narrow IPA + Respelling（Phase 1）

- 既存 `ipa` / `rp_ipa`（phonemic）は **採点・音素カバー用**として不変。
- 表示専用フィールドとして `ipa_actual_ga` / `ipa_actual_rp` を追加（narrow IPA）。
- Respelling フィールド `respell_ga` / `respell_rp` はデータに保持するが **UI では非表示**（2026-07-06）。
- Reveal では `activeNarrowIpa()` を主表示、差分がある場合のみ dictionary（phonemic）行を併記。
- Encode 採点・weak 集計・TRAPSET 判定は従来どおり `activeIpa()`（phonemic）を使用。

### 2d. Phase 2a Flap Merge（186語上書き）

- `phase2a_flap_candidates.json` の 186 語を `scripts/merge_flap_candidates.py` で一括マージ。
- `ipa_actual_ga` は **常に candidates 側で上書き**（既存値があっても更新）。
- これにより pilot の既知誤値 2 語（`middle`, `thirty`）を修正。
- `ipa` / `rp_ipa` / `ipa_actual_rp` / `respell_ga` / `respell_rp` は変更しない。
- マージ後の `ipa_actual_ga` 保有語は 192 語（30 + 186 - 24 重複）。

### 2e. Phase 2b Respelling Merge（3,007語）

- `phase2b_respell_draft.json` の 3,007 語を `scripts/merge_respelling.py` で一括マージ。
- `respell_ga` / `respell_rp` を draft 側で上書き。
- Phase 2a の VntV 判定待ち 52 語（`phase2b_respell_pending.json`）はマージ対象外。pilot 由来の暫定値（`winter`, `twenty`, `ninety`）はスクリプトで除去。
- `ipa` / `rp_ipa` / `ipa_actual_ga` / `ipa_actual_rp` は変更しない。
- マージ後の `respell_ga` 保有語は 3,007 語（全 3,059 語のうち 52 語は Phase 2a 確定待ち）。

### 2f. Phase 2 完了（VntV 52語 + respelling 最終マージ）

- Naoya の TTS 実音判定（52語すべて `nasal=kept`, `consonant=plain`）を反映。
- 49語は narrow 不要（`ipa_actual_ga` なし）。3語（`granddaughter`, `independence`, `underwater`）は Phase 2a 値を維持。
- pilot 由来の誤 narrow 3語（`winter`, `twenty`, `ninety`）を `scripts/merge_phase2a_final.py` で除去。
- `phase2b_respell_final_52.json` を `scripts/merge_respelling.py --draft phase2b_respell_final_52.json` でマージ。
- **最終:** `respell_ga` 3,059/3,059語、`ipa_actual_ga` 192語（narrow 差分がある語のみ）。
- **v2 品質パッチ（2026-07-02）:** 音節主音 n/l + 追加コーダ子音パターン（`tnt` 等）18語の `respell_ga` を `uh` 補完表記に修正（`generate_respelling.py` v2、`data/pipeline/phase2b_respell_draft_v2.json`）。

### 2g. Phase R: RP パイプライン品質修正（2026-07-10）

本番 `rp_ipa` は Claude バッチ同梱が正本。以下は分類・fallback・再発防止用。

| コンポーネント | 役割 |
|----------------|------|
| `scripts/gen_ga_rp_same.py` | `ga_rp_same` / `ga_rp_same_reason` 付与。Phase R1 で `cot_caught`・`square_near_cure`・BATH+weak composite を活性化 |
| `scripts/fix_happy_i.py` | word-final happY の `/iː/`・`/ɪ/` → `/i/` 一括是正（91語、Phase R2） |
| `scripts/phonology_lexicon.py` | `BATH_WORDS_BASE`・`PALM_WORDS`・`YOD_CORONALS` を `ga_to_rp.py` と共有 |
| `scripts/ga_to_rp.py` | offline fallback（PALM guard・yod・happY skip） |
| `scripts/gen_rp_ipa.py` | 新規バッチ用 Claude API。SYSTEM_PROMPT に happY ルールあり |

詳細: `docs/cursor/reports/cursor-implementation-report-phase-r.md`

**現行（2026-07-10）:** ステージング JSON は `data/pipeline/`。語彙 **5,397語**、`ipa_actual_ga` 候補 ~529語、R4 pending **127語**。RP 品質: Phase R で `fix_happy_i.py`・`phonology_lexicon.py` 導入。パス正本は `scripts/paths.py` / `docs/REPOSITORY-STRUCTURE.md`。

i18n: `vocab.*`（**6 キー × 6 言語**、`vocab.back` 含む）。

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
- **やや遅く・精緻な調音** … 知覚訓練が本丸。音から覚える目的でのミニマルペア弁別（θ/f, ð/d, ʃ/tʃ 等）が成立するには各対立が明瞭に区別される必要がある。
- **誇張しない** … 過剰強調は歪んだ音素を教えてしまう。自然な範囲で明瞭に。
- **一定・無感情・1回** … 毎回同じ参照音を作り、学習者が安定したターゲットを内在化できる。再生の繰り返しはアプリ側の再生ボタンで対応。

### 3.3 既知の限界（低優先・将来）

- 同綴異音語（read, live, wind, lead 等）はTTSが意図と違う読みを返し得る。必要なら語に読み分けヒントを添える運用を将来検討（現データ規模では低優先）。

### 3.4 RP TTS（2026-06-26 実装）

- **単語:** `GET ?word=...&accent=ga|rp`（既定 `ga`）。`instructions` を GA/RP で分岐。voice は `alloy` 据え置き。
- **キャッシュキー:** Drive `{slug}__{accent}_v2.mp3`、localStorage `ipa_tts_v2:{accent}:{slug}`。旧 `{slug}_v2.mp3` / 無 accent キーは GA として後方互換。
- **連結句:** GA 固定（`?phrase=` + `accent=ga`）。RP 連結音声は別タスク。
- **弱形:** `GET ?weak=/IPA/&ww=word&accent=ga|rp`。`instructions` は弱形（連結内の reduced form）を強制。`input` はキャリア文内の機能語綴り。GA/RP で `TTS_WEAK_INSTRUCTIONS_*` を分岐。
- 詳細: `docs/reference/rp-tts-design-and-priority.md`、`docs/cursor/reports/cursor-implementation-report-weak-forms.md`

### 3.4b クライアント TTS プリフェッチ（2026-06-29 実装、2026-07 拡張）

全目的でキュー追加時に音声を先読みし、初回再生の待ち時間を削減する。

| 定数 | 値 | 役割 |
|------|-----|------|
| `SESSION_INITIAL` | 6 | セッション開始時のキュー投入数（現問＋先読み5） |
| `SESSION_REFILL` | 5 | ストック（現問を除く先読み数）が &lt; 5 のとき追加する問数 |
| `warmChunk` | 6 | `?warm=1` 1 リクエストあたりの語数 |
| `warmParallel` | 2 | warm リクエストの並列数 |
| `bodyParallel` | 3 | 音声 body 取得の並列数 |

**ストック:** `queue.length - idx - 1`（現問を除く先読み数）。初期ロード直後は 5 のためリフィルなし。2 問目以降で &lt; 5 になるたびに 5 問追加。

**フロー（Phase T 以降）:**
1. `prefetchItemsAudio(batch)` — キューへ追加した分を先読み
2. 単語: **1問目 body を warm 完了前に開始**（body-first）。現アクセント `gasWarm` は非ブロック。反対アクセント warm は idle 延期
3. body 取得は Drive 公開 URL（`?urls=1`）優先、失敗時は従来 base64（`?word=` 等）
4. 連結句: `?phrase=` body を GA で先読み
5. 弱形: `?weak=` body を GA/RP 両方で先読み
6. setup 表示中はプール先頭を preread（フィルタ変更でキャンセル）
7. スピーカーボタンはキャッシュ準備完了まで `disabled`（**全モード共通**）
8. `prefetchToken` で古いジョブをキャンセル
9. 離脱確認（`#exitConfirmModal`）— Decode / Encode / Mode B Study / Reveal から Menu またはブランドタップ時に Yes/No。**Yes → トップ（`1a`）復帰**（`goToTop(true)`。再開なし）。Summary・プロフィールではモーダルなし

GAS 側の `?urls=1` / `migratePublicSharing` 反映は `docs/reference/remaining-ops-checklist.md`。

### 3.4c GA バッチ warm（GAS 時間トリガー・2026-07 実装）

全 **5,397** 語の GA 音声を Google Drive に事前ストックするオフラインジョブ。`gas/BatchWarm.gs` + `gas/BatchWords.gs`（`scripts/export_batch_words.py` で生成）。

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
| Tier 1 | UI 文言 **169** leaf + 言語ピッカー（zh-Hant/zh-Hans 分離） | ✅ `i18n/fil.json` |
| Tier 2 | 語義 gloss（5,397 語） | ✅ **5,397/5,397** |
| Tier 3 | 音素解説 47 記号 + 学習ガイド | ✅ 全6言語（2026-07-07: zh→zh-Hant/zh-Hans 分離） |
| Tier 4 | 連結句・弱形ルール文 `cs_rule` | ✅ 237/237（201+36） |
| — | 英語定義 `def`（5,397 語） | ✅ 全語彙 |

検証: `python3 tools/validate_i18n.py`。拡張手順: `docs/reference/i18n-language-scaling.md`。

---

## 4. データ整備タスク

| 優先 | 内容 | 状態 |
|---|---|---|
| 高 | 欠落必須語・屈折形パッチ | ✅ 主要語追加済み（`data/*_patch.json`） |
| 高 | `neighbors` 全語事前計算 | ✅ 5,397語（neighbors v2・0 近傍率 5%） |
| 高 | `ex`（記号別例語） | ✅ phonemes JSON に実装 |
| 高 | `rp_ipa` 全語付与 | ✅ **5,397語** + 201連結句 |
| 高 | 弱形 36語 + `?weak=` TTS | ✅ |
| 高 | UI fil（Tier 1+3） | ✅ **169** leaf + phonemes + guide |
| 高 | 英語定義 `def` | ✅ 5,397/5,397 |
| 高 | TTS プリフェッチ（クライアント） | ✅ Phase T（body-first / `?urls=1` / preread） |
| 高 | GA バッチ warm（GAS） | ✅ `BatchWarm.gs`（5,397語。Drive 進捗は残作業チェックリスト） |
| 高 | `ga_rp_same` フラグ | ✅ Phase R で分類器・happY rp_ipa 修正 |
| 中 | 語彙ブラウザ | ✅ `#vocabPage`・hash routing・Words 5,397 / Phrases 201 / 進捗チェック / CEFR バッジ両タブ |
| 中 | B1/B2 語彙拡充 | ✅ B1=2,116 / **B2=899**（Phase 2 M2 完了。M3+ 継続） |
| 高 | CEFR 誤ラベル phonics 是正 | ✅ Phase 0-a（652語 `cefr` null 化） |
| 中 | カジュアル表現 | ✅ 一部（`casual` src） |
| 中 | 薄い記号の補強 | 部分 |
| 中 | `neighbors_rp` | ⏸ 保留 |
| ― | gloss品質点検 | 継続（多言語学習ガイドと連動可） |
| ― | gloss.fil（Tier 2） | ✅ 5,397/5,397 |
| ― | cs_rule.fil（Tier 4） | ✅ 237/237 |
| ― | 連結句 RP TTS | ⬜ 別タスク |

---

## 5. 実装状況（2026-07-18）

| 項目 | 状態 |
|---|---|
| 目的 `2a`/`2b`（音素軸・SRS・reveal・例語・TTS v2） | ✅（UI 再配置は Phase 1-D） |
| GA/RP（プロフィール固定予定・IPA・キーボード・RP TTS） | ✅（セッション固定 UI は Phase 1-C） |
| 連結句 201句（キャリア文） | ✅ |
| 弱形 36語 + `?weak=` TTS | ✅ Connected Speech 内 Type=weak |
| 目的 `2c`（Study/Quiz・vocab SRS） | ✅ Study のみ。**Band 廃止**（シンボル削除は後続） |
| 練習タブ統一（Connected ⊃ Weak） | ✅ |
| 語彙ブラウザ（`#vocabPage` / hash / 進捗チェック / CEFR バッジ両タブ） | ✅ Phase V |
| TTS プリフェッチ（body-first + `?urls=1` + setup preread + スピーカー gating） | ✅ Phase T（GAS 反映は残作業） |
| 無制限セッション（プール全件・6/5 先読み・離脱確認→サマリー） | ✅ |
| CEFR 連動フィルタ（0 件ピル非活性） | ✅ |
| GA バッチ warm（GAS 時間トリガー・5,397語） | ✅（Drive 全件完走は運用確認） |
| UI 6言語（en/ja/zh-Hans/zh-Hant/ko/fil） | ✅ Tier 1+3（**169** leaf） |
| 多言語学習ガイド（6言語） | ✅ |
| 英語定義 `def` | ✅ 5,397/5,397 |
| narrow IPA + respelling | ✅ 全語彙 |
| gloss.fil / cs_rule.fil | ✅ **すべて完了**（5,397語 + 237件） |
| `ga_rp_same` フラグ + 分類器（Phase R） | ✅ same=2,674 / different=2,723 |
| Phase R: happY rp_ipa 修正・`phonology_lexicon.py` | ✅ 2026-07-10 |
| Phase B: バッチ品質監査（gloss.zh / Fil / バッチ同期） | ✅ 2026-07-10 |
| 連結句 RP TTS | ⬜ |
| 反対アクセント全画面表示（Reveal / Decode words / Mode B Study / 語彙ブラウザ） | ✅ |
| 目的 4 カード名称（Q-12） | 📋 仕様確定・UI は Phase 1-B |
| セットアップ詳細フィルタ折りたたみ・プレイ中パンくず | ✅ |

**運用メモ:** Mode A/B の新規 UI 文字列は i18n キー経由。GAS は RP TTS + バッチ warm 対応版を過去にデプロイ済み。**Phase T の `?urls=1` / パブリック共有は Apps Script への再デプロイと `migratePublicSharing` が別途必要**（`docs/reference/remaining-ops-checklist.md`、`index.html` `GAS_TTS_URL` 参照）。語彙リスト更新時は `python3 scripts/export_batch_words.py` で `BatchWords.gs` を再生成し GAS に貼り付け。`rp_ipa` 変更後は `fix_happy_i.py` → `gen_ga_rp_same.py` の順で実行推奨（Phase R 参照: `docs/cursor/reports/cursor-implementation-report-phase-r.md`）。

### Phase 1-0-a（2026-07-18）

- PURPOSE/SPEC/DESIGN を目的 4 カード前提に先行改訂（Issue #75）
- near 採点をテンプレートから削除
- Mode B Band UI/仕様を削除（実装シンボル削除は Phase 1-A〜1-H）
- frame ID を 13 concept + variant suffix に再採番
