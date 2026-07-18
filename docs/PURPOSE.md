---
id: pj-2026-06-24-933a
aliases:
- pj-2026-06-24-933a
title: IPA Sound Drill — 目的ステートメント（確定版 / source of truth）
created: '2026-06-24'
updated: '2026-07-18'
---

# IPA Sound Drill — 目的ステートメント（確定版 / source of truth）

> アプリの**測定可能な成果**と**目的構成**を確定し、背景メモ・Cursor仕様書・実装コードの目的を一致させる正本。
> 目的・評価方針に関する記述が衝突した場合は、本ドキュメントを正とする。
>
> **更新日:** 2026-07-18 ／ **ステータス:** Phase 1 UI/UX 確定事項を反映した **v4.0**（仕様先行改訂。UI 実装は Phase 1-A 以降）。語彙 **5,397語**（B2=899）。GA/RP・連結句・弱形・語彙ページ・TTS プリフェッチ・UI 6言語対応済み。
> 詳細な実装仕様は `docs/DESIGN.md`、画面・データの正本は `docs/SPECIFICATION.md` を参照。

---

## 0. 一行サマリ

**タグライン（確定）**

| 言語 | 文言 |
|------|------|
| JA | 音を、美しく。 |
| EN | Retune your English. From sound up. |
| KO | 소리를, 아름답게. |

IPA を情報源として、**音から英語の発音を鍛え直す**。入口は平坦な **目的 4 カード**。発音体系は学習プロフィールで **GA または RP をセッション固定**。語彙難度は **CEFR を全目的横断**（word-level タグ）で扱う。採点は **完全一致のみ**（ok / bad）。進捗の「卒業」はユーザー手動マーキング（目的ごと独立・3 回）。

---

## 1. 目的 4 カード構成

本アプリは学習者の「いまやりたいこと」で分岐する。旧 Mode A / Mode B の 2 モード階層は廃止し、次の 4 目的を **平坦・対等** に並べる（Q-12 命名統一）。

| Frame | 目的（JA） | 学習者の状態 | 入口 | 主なループ |
|-------|------------|--------------|------|------------|
| `2a` | 音の発音を確かめる | 意味を知っている | IPA | Decode（IPA → 綴り） |
| `2b` | 発音から書いてみる | 意味を知っている | 単語 | Encode（単語 → IPA キーボード） |
| `2c` | 音から単語を覚える | 意味を知らない | 音（TTS） | Study（sound-first・2 段階 reveal） |
| `2d` | 連結する音に慣れる | 句・弱形のギャップを埋めたい | 連結 IPA / 弱形 IPA | Decode（句 or 機能語） |

**セッション導線（Q-20-δ）:** 目的カード（`1a`）→ 学習プロフィール（`3a`）を **毎セッション必ず通過**（LocalStorage で前回設定をプリセット）→「はじめる」→ ドリル。ユーザーは「そのまま開始」か「変更してから開始」を選べる。

**CEFR（全目的横断・Q-2-B）:** プロフィールで複数レベル選択。単語ごと word-level タグ。各ドリル STEP 行の右上に例:「語彙 A2」。Mode B 専用 CEFR/頻度バンド進行は廃止。Connected Speech（`2d`）でも CEFR タグは表示するが、**UI フィルタは追加しない**（level / type のみ）。

**アクセント（GA / RP）:** 学習プロフィール（`3a`）で固定選択。学習中は切替不可（収録音声・IPA が異なるため）。ヘッダーに固定バッジ表示。反対アクセントの phonemic IPA は Reveal 等で参照表示可能（`ga_rp_same` 時は `/ipa/（同じ）`）。連結句 TTS は GA 固定。

**採点:** スペル / IPA の **完全一致のみ**正解。near・惜しさ・部分正解は示さない（AI 不介在）。

**マーキング:** ユーザー手動チェック。目的ごと独立管理。3 回で卒業。システムは正誤で自動評価しない。Local Storage 保存（BE 管理しない）。キー形の正本は `mark:{drill_id}:{word_id} = 0..3`（詳細・旧 `ept_checks_v1` からの移行は Phase 1-0-b）。

**オンボーディング（Q-21）:** 初回訪問時に 4 スライド（`3g`）。`onboarding_completed_v1` で完了（スキップも完了扱い）。ヘッダーのガイドアイコンから任意再表示可。

**AI クローラビリティ（原則 9 候補）:** 重要な導線・思想説明は JS 介在なしで DOM 上に常時存在（例: フッター「このアプリについて」`3h`）。

**視覚言語:** カラー / タイポ / スペーシング / 角丸 / シャドウ / コンポーネントをトークン化（詳細値は Phase 1-A）。

**支援画面（概念 ID）:** 語彙リスト `3b`、IPA 記号ピッカー `3c`、学習状況 `3d`、IPA って何？ `3e`、言語設定 `3f`。frame 採番の正本は `docs/DESIGN.md`。

**UI 言語:** en / ja / zh-Hans / zh-Hant / ko / fil。語彙 **5,397語**、連結句 201、弱形 36。

---

## 2. 目的ごとの方針

### 2.1 音の発音を確かめる（`2a`・旧 Mode A Decode 相当）

- **目的:** IPA を読んで、既知語の綴りに正しく対応できる力。
- **主軸:** 音素カバー（有限・列挙可能な記号集合）。
- **対象語:** 機能語・不規則屈折・カジュアル表現を含む。セッション内の音素フォーカス等はドリル画面のインラインチップ（静かな絞り込み。独立 frame `3b` とは別）。
- **採点:** 綴り完全一致のみ（ok / bad）。
- **適応出題:** localStorage 履歴とマーキングに基づく軽量 SRS（詳細は `DESIGN.md` / `SPECIFICATION.md`。スキーマ移行は Phase 1-0-b〜1-C）。

### 2.2 発音から書いてみる（`2b`・旧 Mode A Encode 相当）

- **目的:** 既知語を見て、IPA（強勢含む）を組み立てられる力。
- **入口:** 英単語。IPA キーボードはプロフィール固定アクセントに追従。
- **採点:** IPA（強勢含む）完全一致のみ（ok / bad）。音素トークンの色分けフィードバックは可（判定自体は 2 値）。

### 2.3 音から単語を覚える（`2c`・旧 Mode B Study 相当）

- **目的:** 音から単語の意味（と綴り）を覚える。入口は必ず音（sound-first）。
- **ループ:** Study 提示（2 段階 reveal: IPA＋音声 →「意味を確認する」→ 単語＋語義）。Quiz UI は現行どおり凍結コード温存（`MODEB_QUIZ_ENABLED=false`）。
- **プール:** アルファベット（`letter`）・短縮形（`contraction`）は除外。CEFR はプロフィール複数選択で横断フィルタ（Band 自動解放はしない）。
- **distractor（Quiz 復活時）:** 音素近傍語中心（`neighbors`）。思想「発音できない音は聞き取れない」をここでも訓練する。

### 2.4 連結する音に慣れる（`2d`・旧 Connected Speech 相当）

- **連結句（201句）:** linking / assimilation / elision。Decode のみ。Level L1–L3。キャリア文に IPA 埋め込み。TTS は GA。
- **弱形（36語）:** 高頻度機能語の弱形。Decode のみ。TTS は `?weak=`（GA/RP）。
- **CEFR:** word-level タグ表示のみ。UI フィルタは level / type の 2 軸（Q-5-B 維持 + Phase 1 横断は表示のみ）。
- 発音産出・流暢性の総合訓練は姉妹アプリ English Listening Trainer と対面レッスンが担当。本アプリは単語・短フレーズ単位に特化。

---

## 3. 横断ポリシー（プロフィール・採点・マーキング・オンボーディング）

| 項目 | 方針 |
|------|------|
| プロフィール `3a` | アクセント + CEFR 複数選択 + 目的別プリセット + 「詳しい設定」相当パラメータを一元集約。毎セッション通過（Q-20-δ） |
| セッション内絞り込み | ドリル内インラインチップのみ（独立絞り込み frame は設けない。Claude Design の `3b` 誤記は採用しない → 語彙リストが `3b`） |
| 採点 | 完全一致のみ。near 廃止（設計・実装とも Phase 1-0-a で排除） |
| マーキング | 手動・目的独立・0–3・自動評価なし |
| オンボーディング `3g` | 初回 4 スライド。再表示可 |
| TTS プリフェッチ | キュー追加時の先読み（Phase T 方針維持）。詳細は `DESIGN.md` §3 |

---

## 4. 依存と実装状況

| 前提 | 状態 |
|------|------|
| gloss 品質（多言語UI） | en/ja/zh/ko/fil **実装済み**（全 **5,397語**） |
| UI 言語（6言語 + 音素解説） | **実装済み** |
| 弱形（36語）・連結句（201句） | **実装済み**（`cefr` + `ga_rp_same` 付与済み） |
| 語彙ブラウザ | **実装済み**（独立ページ。Phase 1 で `3b` として再配置予定） |
| `neighbors` 事前計算 | **実装済み**（neighbors v2・全 5,397 語） |
| `ga_rp_same` フラグ | **実装済み** |
| 進捗チェック（旧 `ept_checks_v1`） | **実装済み**（Phase 1 でマーキング仕様へ移行予定） |
| near 採点 | **Phase 1-0-a で削除**（ok/bad のみ） |
| GA/RP IPA・TTS・プリフェッチ | **実装済み**（GAS 再デプロイは残作業チェックリスト） |
| B1/B2 語彙 | **B1: 2,116 / B2: 899** |
| Phase 1 UI（目的 4 カード・`3a` 一元通過等） | **仕様確定・実装は Phase 1-A 以降** |
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
- ステップ1の旧PURPOSE（v1）は「語彙はスコープ外」としていたが、v2 で Mode B として限定的に取り込み。
- **Phase 1 UI/UX 見直し（v4.0）:** Mode A / Mode B の 2 モード構成および「本丸 / サブテーマ」階層を廃止し、目的 4 カードの平坦構造に置換（Q-2-B / Q-12）。CEFR/頻度バンド進行（Mode B Band）を廃止し、CEFR を全目的横断の word-level タグ＋プロフィール複数選択へ移す。採点の near を廃止。GA/RP はプロフィール固定。プロフィール一元通過（Q-20-δ）とオンボーディング（Q-21）を追加。

---

## Personas & Learning Journey

IPA Sound Drill is designed for adult English learners who want to develop pronunciation accuracy through IPA-based, sound-first training. The following personas guide our design decisions.

### Primary Personas

**P-1: The Working Professional (Japanese, 34)**

A Japanese SIer project manager (TOEIC 730) who wants to deepen his engagement with foreign culture through English. His frustration: "I can't hear sounds I can't produce" — the phonological gap between his Japanized English and native English is too large. His motivation: to have deep, meaningful conversations in English. Success: being told "your pronunciation is beautiful and easy to understand".

**P-2: The Strategist (Korean, 28)**

A senior strategist at a Korean multinational advertising agency (TOEIC 950). Her Korean L1 phonological filter (missing /f/, /v/, /z/) creates residual accent that she wants to refine. She values professional polish; her ideal is when clients say "your English is very clear".

**P-3: The CS Agent (Filipino, 22)**

A remote CS agent for a US fintech company (TOEIC 850). Filipino English is her first language, but she wants to reduce Filipino-English-specific traits (/f/-/p/, /v/-/b/, Full vowels vs schwa) that customers find harder to understand. Her goal: promotion to Team Lead.

**P-4: The Graduate School Aspirant (Chinese, 19)**

A Shanghai university student preparing for US graduate school (TOEFL 92, Speaking 20). Her Mandarin L1 phonological filter (retroflex /ʐ/ vs English /r/, missing /v/, complex final consonant clusters) blocks her TOEFL Speaking score. She wants to reach Speaking 26+.

**P-5: The Music-Driven Learner (Japanese, 16, Track B focus)**

A high school student in Kyoto whose English interest started with indie music (Billie Eilish, Boygenius). She wants to sing English songs beautifully — not to sound "native" but to develop her own beautiful voice in English. Instagram/TikTok-native aesthetic sensibility.

### Learning Journey Arc

1. **First 3 seconds**: Learner recognizes IPA Sound Drill as "for me" through purpose-first UI (4 purpose cards on `1a`). Not "generic language learning app".
2. **First session (~1 minute)**: Pass profile `3a` (preset), complete first ~6 items, encounter Reveal with layered information hierarchy. The IPA feels like a tool, not a barrier (Principle 1).
3. **First week**: Manual marking and light SRS begin to build a personal weakness map. Vocab starts to feel like a personal asset, not a monitored score (Principle 7).
4. **First 3 months**: Learner notices actual improvement in listening comprehension (Production-Perception loop, Principle 2). Their L1 phonological filter starts to relax for target phonemes.
5. **Long-term**: The success moment — others tell the learner their English pronunciation is clear or beautiful. The aesthetic evaluation (not just "intelligible") is the true differentiator.

### Design Decision Reference

For more detailed persona profiles, product principles, and cluster-specific design considerations, see the private working documents (Vault, project management side). Public design documents in this repository (`docs/design/`) contain distilled versions suitable for external contributors and design AI tools.

---

## 変更履歴

| 日付 | 版 | 内容 |
|------|----|------|
| 2026-07-18 | v4.0 | Phase 1 UI/UX 実装前の仕様先行改訂（Issue #75）。目的 4 カード構成、タグライン確定、GA/RP セッション固定、CEFR 全目的横断、Mode B Band 廃止、マーキング / プロフィール一元通過 / オンボーディング追加、採点 near 廃止。旧 2 モードは §5 履歴化。 |
| 2026-07-10 | v3.24 | パッケージ B (Phase 2 バッチ品質監査): 全 569 語独立 Opus 監査完了。wordlist 波及 typo 2件 (`comprehensive`/`corporal` gloss.zh 的的)、POS 正規化 1件 (`damn` 感嘆詞→間投詞)、Fil 翻訳更新 13件 (Opus 提案)。バッチファイル 86件をwordlistと同期 (dignify/dignity + happy-i 68語 + typo/POS/Fil)。i18n 複合 POS キー追加。 |
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
