# English Pronunciation Trainer — 目的ステートメント（確定版 / source of truth）

> アプリの**本丸（measured outcome）**と**モード構成**を確定し、背景メモ・Cursor仕様書・実装コードの目的を一致させる正本。
> 目的・評価方針に関する記述が衝突した場合は、本ドキュメントを正とする。
>
> **更新日:** 2026-07-10 ／ **ステータス:** 語彙 **5,397語**（Phase 2 M2 完了、B2=899）。Phase V（語彙ブラウザの独立ページ化）完了。GA/RP 切替・連結句・弱形・RP TTS・語彙ページ（hash routing）・進捗チェック（3×3）・`ga_rp_same` フラグ・neighbors v2・TTS プリフェッチ・無制限セッション・離脱確認モーダル・UI 6言語対応済み。
> 詳細な実装仕様は `docs/DESIGN.md`、画面・データの正本は `docs/SPECIFICATION.md` を参照。

---

## 0. 一行サマリ

**既知語のIPA読み書き（本丸）**を音素カバー軸＋客観採点＋localStorage適応出題で鍛え、**未知語の語彙獲得（サブテーマ）**を音先行の別モードとして併設する。発音体系は **GA を基準**とし、**RP（Received Pronunciation）** を設定で切替可能。

---

## 1. 2モード構成

本アプリは目的の異なる2モードを持つ。学習者の状態（意味を知っているか）で分岐する。

| | **Mode A：IPA読み書き（本丸）** | **Mode B：聞いて覚える（サブテーマ）** |
|---|---|---|
| UI ラベル（ja） | `mode.a` = IPA読み書き | `modeb.title` = 聞いて覚える |
| 学習者の状態 | 意味を知っている | 意味を知らない |
| 直す対象 | 音 ↔ IPA記号の対応 | 単語＋意味の獲得 |
| 入口 | IPA / 単語 | 音（TTS） |
| ループ | Decode（IPA→単語）/ Encode（単語→IPA） | Study（提示のみ。Quiz はコード温存・UI 非表示） |
| 主軸 | **音素カバー** | **CEFR/頻度バンド** |
| 採点 | 客観（ok/near/bad）のみ | 客観のみ |
| 進捗記録 | `ept_hist_v1`（per-word SRS）＋ `ept_sym_v1`（per-symbol）＋ **`ept_checks_v1`（手動進捗 0–3 × 3モード）** | `ept_vocab_v1` / `ept_vocab_band`（別名前空間） |

**Mode A の練習タブ:** **Words**（単語）と **Connected Speech**（連結句＋弱形・GA 音声前提）の2種。Connected Speech 内の Type フィルタで linking / assimilation / elision / **Weak forms** を選択。弱形36語は連結発音現象の一部として内包（独立タブなし）。

**UI 言語:** en / ja / zh / ko / **fil**（タガログ語・**Tier 1–4 すべて完了**、UI 文言 **167 キー**）。語義 gloss.fil は **5,397/5,397語**。連結/弱形ルール文（cs_rule.fil）は **237/237件**（Tier 4 **完了**）。英語定義 `def` は **5,397/5,397語**（Mode B Study reveal・語彙ブラウザで利用）。

**語彙ブラウザ:** 独立ページ（`#vocabPage`、hash `#/vocab` / `#/vocab/phrases`）。トップバーから全語彙（5,397語）・連結句（201句）を参照閲覧。検索・A–Z ジャンプ・TTS・**進捗チェック（d/e/l 各3スロット）**・Words/Phrases 双方に CEFR バッジ。Back は Menu（`#backTopBtn`）と独立。

**CEFRの位置づけ:** 主軸としてMode Aには不適（頻度はIPA読み書き難易度の弱い代理であり、本アプリは既知語前提のため頻度の意味が薄い）。CEFRは破棄せず **Mode B の主軸へ移設**する。Mode Aではコールドスタート時の出題順にのみ残す。

**アクセント（GA / RP）:** 設定で切替。IPA 表示・Encode キーボード・TTS（単語・弱形）が追従。連結句 TTS は GA 固定。反対アクセントの phonemic IPA は Reveal・Decode（単語）・Mode B Study・語彙ブラウザに表示（ラベルは `GA` / `RP` のみ）。**`ga_rp_same` / `ga_rp_same_reason` フラグ**で実質同一発音を判定（`scripts/gen_ga_rp_same.py`、Phase R で分類器・happY rp_ipa を修正）。phonemic 実質同一時は `/ipa/（同じ）` 表示。Mode B の MCQ distractor は GA `neighbors` を RP でも流用（`neighbors_rp` 再計算は保留）。

---

## 2. Mode A（本丸）の確定方針

- **本丸 = IPA記号を読み・書きできる力。** 評価は回答の客観的正否のみ。発音の自己評価は導入しない（ラグ・運用負荷／記号習得後は不要化する性質のため）。
- **主軸 = 音素カバー。** 41記号は有限・列挙可能でMECE。各語は記号集合に決定的に分解でき、本丸と適応出題に直結する。
- **対象語に機能語・不規則屈折形・カジュアル表現を含める**（were/those/through/does/one、gonna 等）。フォーカスピル（トラップ音・弱点・アルファベット・短縮形・不規則形・カジュアル）で集中ドリル可能。
- **適応出題:** localStorage の履歴（`ept_hist_v1`）と**手動進捗チェック**（`ept_checks_v1`）をもとに、チェックが少ない語を優先する軽量 SRS + 頻度重み付けシャッフル。
- **連結句（201句）:** linking / assimilation / elision を L1–L3 で段階化。Decode のみ（連結 IPA → 元フレーズ）。キャリア文に IPA 埋め込み。TTS は自然な連結音声（GA）。
- **弱形（36語）:** 高頻度機能語（to, can, of …）の弱形を L1–L3 で段階化。Decode のみ（弱形 IPA → 機能語 `w`）。連結句と同じキャリア文＋IPA 埋め込み。TTS は `?weak=`＋弱形 IPA（GA/RP）。
- 発音産出・流暢性の総合訓練は姉妹アプリ English Listening Trainer と対面レッスンが担当。本アプリは**単語・短フレーズ単位**に特化。

---

## 3. Mode B（サブテーマ）の確定方針

- **目的 = 音から単語の意味（と綴り）を覚える。** 入口は必ず音（sound-first）。
- **ループ = Study 提示**（`MODEB_QUIZ_ENABLED=false` の間は Quiz 非表示。MCQ・ディクテーションのコードは将来復活用に温存）。Study 提示は **2段階 reveal**（IPA＋音声 → 学習者が「意味を確認する」→ 単語＋語義を開示）。[次へ] で次の問題へ。
- **セッション:** フィルタ後プールの全件を重複なしで消化。先読みキュー（6 問初期 / ストック&lt;5 で 5 問追加）。Decode / Encode / Mode B Study / Reveal から離脱する際は Yes/No 確認モーダル → Yes でサマリー表示（`docs/SPECIFICATION.md` §2.3b）。
- **確認は客観2種（採用：両方）:**
  1. 意味認識MCQ（音→意味）。**distractorは音素近傍語**を中心に毎回抽選＋順序シャッフル。
  2. 音声ディクテーション（音→綴り、Decode採点を流用）。
- **音素近傍distractorの意義:** 選択肢暗記（セット記憶）と消去法を同時に潰し、MCQを実質ミニマルペアの知覚テストに変える。本丸の思想「発音できない音は聞き取れない」をサブテーマでも訓練する。
- **主軸 = CEFR/頻度バンド。** 段階配列でA1→A2→B1…と進む（現データは主に A1/A2 + phonics 語彙）。アルファベット（`letter`）・短縮形（`contraction`）は Mode B プールから除外。バンド内 60% 以上が box 4+ に到達すると次バンドへ自動解放。
- **TTS プリフェッチ:** 全モードでキュー追加時に音声を先読み（GA+RP 両方 warm、現アクセント body を優先取得。連結句・弱形も対象）。再生ボタンはキャッシュ準備完了まで無効化。

---

## 4. 依存と実装状況

| 前提 | 状態 |
|------|------|
| gloss 品質（多言語UI） | en/ja/zh/ko/fil **実装済み**（全 **5,397語**） |
| UI 言語（6言語 + 音素解説） | **実装済み** |
| 弱形（36語）・連結句（201句） | **実装済み**（`cefr` + `ga_rp_same` 付与済み） |
| 語彙ブラウザ | **実装済み**（独立ページ `#vocabPage`・hash routing・Words 5,397 / Phrases 201 / 進捗チェック / CEFR バッジ両タブ） |
| `neighbors` 事前計算 | **実装済み**（neighbors v2・全 5,397 語・0 近傍率 5%） |
| `ga_rp_same` フラグ | **実装済み**（wordlist + connected + weak。same=2,674 / different=2,723） |
| 進捗チェック（3×3） | **実装済み**（`ept_checks_v1`・頻度重み付け出題） |
| GA/RP IPA・TTS・プリフェッチ | **実装済み** |
| B1/B2 語彙の実データ | **B1: 2,116 / B2: 899**（Phase 2 M2 完了。CEFR-J B2 残り約 1,423 語は M3 以降） |
| narrow IPA | **完了**（`ipa_actual_ga` ~529。**R4 pending 127 語**は TTS レビュー待ち） |
| `neighbors_rp` | **保留**（GA neighbors 流用） |
| 連結句 RP TTS | 未着手 |

---

## Phase 1: B1語彙拡充 — 完了 (2026-07-09)

CEFR-J Wordlist v1.5 のB1語彙(単一語2,332語)のうち、既存app未収録だった1,769語を
M1(180)+M2(400)+M3(400)+M4(400)+M5(389)の5バッチに分けて拡充完了。

最終結果:
- app内 B1語数: 2,116語（オリジナル347語 + Phase1拡充1,769語）
- gloss(en/ja/zh/ko/fil) 5言語完成: 全4,828語
- narrow IPA・respelling: 既存パイプラインで生成済み（R4 pending分は別途TTSレビュー予定）

次フェーズ（当時）: `neighbors`再計算、B2語彙拡充 → **いずれも完了**（2026-07-10）

---

## Phase 2: B2語彙拡充 M2 — 完了 (2026-07-10)

CEFR-J v1.5 B2 のうち **569 語**を pilot(179) + M2a–d(390) で追加。`rp_ipa` は Claude バッチ同梱方式。

- 総語数: **5,397**（B2=**899**）
- サマリ: `docs/reference/phase2-m2-completion-summary.md`
- R4 pending 累計: **127 語**（`data/pipeline/r4_pending_review_list.*`）

次フェーズ: Phase 2 M3+（B2 残り）、Phase 3（C1）

---

## Phase R: RP パイプライン品質修正 — 完了 (2026-07-10)

Opus レビューで判明した分類器 dead-code・happY rp_ipa 破損（91語）・`ga_to_rp.py` latent bug を修正。

- **R1:** `gen_ga_rp_same.py` — `cot_caught` / `square_near_cure` / BATH+weak composite を活性化（フラグ数不変、reason 再分類）
- **R2:** `gen_rp_ipa.py` happY ルール + `fix_happy_i.py` で rp_ipa 91語是正（82 過剰伸長 + 9 Jones `/ɪ/`）
- **R3:** `phonology_lexicon.py` 新規、`ga_to_rp.py` PALM/happY/yod 修正
- **R4:** neighbors 再生成、ドキュメント更新

詳細: `docs/cursor/reports/cursor-implementation-report-phase-r.md`

---

## 5. 本ステートメントが上書きするもの

- 引き継ぎメモ §2-4 の「本丸＝音が出せたか」「自己評価⑥」「自己申告による苦手音追跡⑦」は**取り下げ**（背景資料としては保持）。
- ステップ1の旧PURPOSE（v1）は「語彙はスコープ外」としていたが、本v2で**Mode Bとして限定的に取り込む**形に更新。
- Cursor仕様書 §1.2 は本ステートメントで補強（姉妹アプリ境界・2モード構成・localStorage方針）。

---

## 変更履歴

| 日付 | 版 | 内容 |
|------|----|------|
| 2026-07-10 | v3.23 | Phase V: 語彙ブラウザをモーダルから独立ページ (`#vocabPage`) に移設。Hash routing (`#/vocab`, `#/vocab/phrases`) 対応。UI 整備 (2段組行・sticky header・CEFR バッジ全タブ表示・A-Z 横スクロール・空/ローディング状態)。i18n `vocab.back` 追加。Menu ボタンと独立。 |
| 2026-07-10 | v3.22 | Phase T: TTS 1問目遅延解消。fast-path body-first、warm de-gating、Start時RP warm skip、Drive 直リンク URL API (`?urls=1`)、setup 画面 preread。cold-start 20s→5s / warm-start 20s→500ms。 |
| 2026-07-10 | v3.21 | Phase R (Repair): 分類器 dead-code 3件活性化（`cot_caught`, `square_near_cure`, BATH+weak composite）、`gen_rp_ipa.py` SYSTEM_PROMPT の happY ルール追加、rp_ipa 91語（happY 過剰伸長 82 + `/ɪ/` 表記ゆれ 9）を一括是正、`scripts/phonology_lexicon.py` に BATH_WORDS/PALM_WORDS を統合、`ga_to_rp.py` fallback の PALM/happY/yod latent bug 修正。 |
| 2026-07-10 | v3.20 | Phase 2 M2 完了（B2 +569、総 5,397）。進捗チェック（`ept_checks_v1`）、Phrases CEFR バッジ、`dignify` RP ホットフィックス。リポジトリ README 整備（`data/README.md` 等）。 |
| 2026-07-09 | v3.14 | Phase 1 M5（最終）: B1 拡充 389語（`restrict`〜`yoga`）をマージ。総語数 4,828、B1=2,116。**Phase 1 B1 拡充完了。** |
| 2026-07-09 | v3.13 | 反対アクセント同一表示を `/ipa/（同じ）` 形式に変更。GA/RP ラベルを `GA`/`RP` のみに簡素化。振り返りフローティングボタンを廃止し、離脱時（Menu/ブランド）に Yes/No 確認→サマリーへ。CEFR 選択に連動して 0 件の詳細フィルタピルを非活性化。 |
| 2026-07-09 | v3.12 | セッションをプール全件の重複なし消化に変更（6 問初期 / ストック&lt;5 で 5 問先読み）。全モード TTS 先読み。振り返りボタン・サマリー TOP へ。Mode B は Study のみ（Quiz UI 非表示・コード温存）。 |
| 2026-07-09 | v3.11 | リポジトリ構成を整理（`data/batches`・`data/pipeline`・`data/patches`・`docs/cursor` 等）。`docs/REPOSITORY-STRUCTURE.md` 追加。`scripts/paths.py` でパス正本化。 |
| 2026-07-09 | v3.10 | Phase 1 M4: B1 拡充 400語（`marked`〜`restore`）を IPA/pos/def/gloss5言語付きでマージ。総語数 4,439、B1=1,727。 |
| 2026-07-09 | v3.9 | 連結句 201句・弱形 36語に `cefr` フィールドを付与（Claude 提案を算出結果どおり採用）。UI バッジ表示は別途。 |
| 2026-07-09 | v3.8.1 | `friendliness` の GA IPA 誤記（RP 用 `ː` 混入）を訂正。respelling 例外を解消（`FREHND-lee-nuhs`）。 |
| 2026-07-09 | v3.8 | Phase 1 M3: B1 拡充 400語（`entertain`〜`marine`）を IPA/pos/def/gloss5言語付きでマージ。総語数 4,039、B1=1,327。`merge_respelling.py` の pending クリア問題を恒久修正。 |
| 2026-07-08 | v3.7 | Phase 1 M2: B1 拡充 400語（`biography`〜`enrich`）を IPA/pos/def/gloss5言語付きでマージ。総語数 3,639、B1=927。 |
| 2026-07-07 | v3.6 | Phase 1 M1: パイロット180語の gloss 5言語（ja/zh/ko/fil）翻訳を追加。Claude によるスタイル準拠翻訳、同義語ペアの整合性確認済み。 |
| 2026-07-07 | v3.5 | Phase 1 M1 パイロット: CEFR-J B1 拡充対象の先頭 180 語を wordlist に追加（3,239語）。gloss ja/zh/ko/fil は未着手。 |
| 2026-07-07 | v3.4 | Phase 0-b: Mode A に CEFR 複数選択フィルタを追加（A1/A2/B1、デフォルト A1+A2）。Mode B の空バンド解放防止。C1 は UI 非表示（キー残置）。 |
| 2026-07-07 | v3.3.1 | Phase 0-a の訂正: phonics 652語の cefr null化を復元。CEFR-J 一次データとの照合で 652語全てが正当な B1/B2 語彙と判明したため。詳細は `docs/reference/wordlist-cefr-audit.md` 訂正セクション参照。 |
| 2026-07-07 | v3.3 | Phase 0-a: 誤った前提に基づく変更として phonics 652語の cefr を null 化（後日 v3.3.1 で訂正）。 |
| 2026-07-06 | v3.2 | 学習モード名称を行為ベースに刷新（IPA読み書き / 聞いて覚える 等）。反対アクセント全画面表示。respelling は UI 非表示（データは保持）。 |
| 2026-07-02 | v3.1.1 | respelling v2 品質パッチ（18語の `respell_ga` 可読性修正）。 |
| 2026-07-02 | v3.1 | narrow IPA + respelling を全3,059語で完了。VntV 52語は TTS 実音判定（nasal=kept, consonant=plain）で確定。 |
| 2026-07-02 | v3.0 | 語彙ブラウザ・TTS プリフェッチ・GA バッチ warm・`def` 完走・i18n 156 キーを反映。 |
| 2026-06-29 | v2.10 | 語彙ブラウザ・学習ガイド全章置換・`def` batch01–08 マージ。 |
| 2026-06-23 | v1 | 本丸をIPAリテラシーに確定（単一モード前提）。 |
| 2026-06-24 | v2 | 2モード構成に拡張。Mode A＝音素カバー軸の本丸、Mode B＝CEFR軸の語彙サブテーマ。 |
| 2026-06-26 | v2.1 | Mode A/B・GA/RP・連結句・RP TTS の実装完了を反映。依存表を実装状況に更新。 |
| 2026-06-28 | v2.9 | 練習タブ統一: Connected Speech ⊃ Weak Forms（2タブ化）。 |
| 2026-06-27 | v2.7 | gloss.fil batch04 更新 + batch17–20 追加（1,600/3,059語）。 |
| 2026-06-27 | v2.6 | gloss.fil batch02/06–08 更新 + batch13–16 追加（1,280/3,059語）。 |
| 2026-06-27 | v2.5 | gloss.fil batch02–05 更新 + batch09–12 追加（960/3,059語）。 |
| 2026-06-27 | v2.4 | gloss.fil batch03–08 追加マージ（640/3,059語）。 |
| 2026-06-26 | v2.3 | gloss.fil batch01–02 マージ（160/3,059語）・`merge_gloss_fil.py` 追加。 |
