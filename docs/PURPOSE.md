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
| プロフィール `3a` | Setup 11 項目（Accent 含む）+ Onboarding 外。アクセント + CEFR 複数選択（A1–B2）+ 目的別プリセット + 「詳しい設定」相当を一元集約。毎セッション通過（Q-20-δ） |
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

## Phase 1 / 2 / R 完了ログ

Phase 1（B1語彙拡充）・Phase 2（B2語彙拡充 M2）・Phase R（RP パイプライン品質修正）の完了ログは
`docs/history.md` §1 へ移設（Issue #172）。

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

版ごとの変更履歴は `docs/history.md` §3 へ移設（Issue #172）。
