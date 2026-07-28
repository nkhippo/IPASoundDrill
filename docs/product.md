# product.md — プロダクト目的・ポジショニング（WHY の正本）

> 各 feature の WHAT（観測可能挙動・画面構造・採点則・データ・i18n）は `docs/features/<id>.md`。
> データスキーマ・ランタイム契約は `docs/data-contract.md`。TTS 設計は `docs/tts-design.md`。
> **衝突時の優先順位**: `product.md` → `docs/features/<id>.md` → `docs/data-contract.md`。
> 日付ログ・Phase 完了記録・変更履歴は本ファイルに置かず `docs/history.md` を参照。

---

## 0. 一行サマリ

IPA を情報源として、**音から英語の発音を鍛え直す**。入口は平坦な**目的 4 カード**。発音体系は学習プロフィール（`3a`）で **GA または RP をセッション固定**。語彙難度は **CEFR を全目的横断**（word-level タグ）で扱う。採点は**完全一致のみ**（ok / bad）。進捗の「卒業」はユーザー手動マーキング（目的ごと独立・3 回）。

### タグライン（確定）

| 言語 | 文言 |
|------|------|
| JA | 音を、美しく。 |
| EN | Retune your English. From sound up. |
| KO | 소리를, 아름답게. |

### ポジショニング（ブランドの本質）

以下 3 要素を伝えるプロダクトである。名称・LP・タグライン・Issue の判断はここに立ち返って行う。

1. **IPA を情報源として引ける** — 発音記号を読める・書ける・音と対応させられる
2. **音から単語を想起する** — sound-first の思想（`2c`）。「聞いた音のイメージから正しい発音を再構築」
3. **L1 音韻フィルタからの脱却** — Japanese English は一例、非英語圏話者に普遍的な課題

---

## 対象ユーザーと解決したい課題

- CEFR A1–B2 程度の英語学習者（プロフィールで複数レベル選択。語彙は word-level CEFR タグ）
- 母語は日本語・中国語・韓国語・フィリピン語（タガログ）を想定（UI 言語として en / ja / zh-Hans / zh-Hant / ko / fil に対応）
- 学習対象の発音体系は General American（GA）を基準。Received Pronunciation（RP）を学習プロフィール（`3a`）で固定選択

| 課題 | 内容 |
|------|------|
| 語彙と発音のギャップ | 単語の意味は知っているが、発音（音）が身体に定着していない |
| 聞き取りとの連動 | 「発音できない音は聞き取れない」という知覚–運動のギャップ |
| IPA リテラシー不足 | 綴りと音が一致しない英語で、IPA を読んで書ける力が弱い |
| 連結音の理解 | 辞書形 IPA と実際の連結発音のギャップ（目的 `2d`） |
| 弱形の理解 | 機能語の強形と弱形のギャップ（`2d` Type: Weak forms） |
| 米英アクセント差 | セッション中の GA/RP 混在による参照音声・IPA の不整合（→ プロフィール固定） |

---

## 1. 目的 4 カード構成

学習者の「いまやりたいこと」で分岐する。旧 Mode A / Mode B の 2 モード階層は廃止し、次の 4 目的を**平坦・対等**に並べる。

| ID | 目的（JA） | 学習者の状態 | 入口 | 主なループ |
|----|------------|--------------|------|------------|
| `2a` | 音の発音を確かめる | 意味を知っている | IPA | Decode（IPA → 綴り） |
| `2b` | 発音から書いてみる | 意味を知っている | 単語 | Encode（単語 → IPA キーボード） |
| `2c` | 音から単語を覚える | 意味を知らない | 音（TTS） | Study（sound-first・2 段階 reveal） |
| `2d` | 連結する音に慣れる | 句・弱形のギャップを埋めたい | 連結 IPA / 弱形 IPA | Decode（句 or 機能語） |

各目的の詳細仕様（観測可能挙動・画面構造・採点則・データ・i18n）は `docs/features/<id>.md`。目的の**意図・方針**のみを以下に記す（実装詳細は features 側）。

- **`2a`**: IPA を読んで、既知語の綴りに正しく対応できる力を鍛える。主軸は音素カバー（有限・列挙可能な記号集合）。
- **`2b`**: 既知語を見て、IPA（強勢含む）を組み立てられる力を鍛える。
- **`2c`**: 音から単語の意味（と綴り）を覚える。入口は必ず音（sound-first）。
- **`2d`**: 連結句・弱形のギャップを埋める。発音産出・流暢性の総合訓練は姉妹アプリ English Listening Trainer と対面レッスンが担当し、本アプリは単語・短フレーズ単位に特化する。

**セッション導線:** 目的カード（`1a`）→ 学習プロフィール（`3a`）を**毎セッション必ず通過**（LocalStorage で前回設定をプリセット）→「はじめる」→ ドリル。詳細は `docs/features/_common.md`。

---

## 2. 横断ポリシー

| 項目 | 方針 |
|------|------|
| CEFR | 全目的横断（word-level タグ）。プロフィール（`3a`）で複数レベル選択。各ドリル STEP 行の右上に例:「語彙 A2」。Connected Speech（`2d`）でも CEFR タグは表示するが UI フィルタは追加しない（level / type のみ） |
| アクセント（GA / RP） | 学習プロフィール（`3a`）で固定選択。学習中は切替不可（収録音声・IPA が異なるため）。ヘッダーに固定バッジ表示。反対アクセントの phonemic IPA は Reveal 等で参照表示可能 |
| 採点 | スペル / IPA の完全一致のみ正解。near・惜しさ・部分正解は示さない（AI 不介在） |
| マーキング | ユーザー手動チェック。目的ごと独立管理。3 回で卒業。システムは正誤で自動評価しない。Local Storage 保存（BE 管理しない） |
| オンボーディング | 初回訪問時にスライド表示（スキップも完了扱い）。ヘッダーのガイドアイコンから任意再表示可 |
| AI クローラビリティ | 重要な導線・思想説明は JS 介在なしで DOM 上に常時存在（例: フッター「このアプリについて」`3h`） |
| 支援画面 | 語彙リスト `3b`、IPA 記号ピッカー `3c`、学習状況 `3d` |
| UI 言語 | en / ja / zh-Hans / zh-Hant / ko / fil |

各方針の実装詳細（DOM・定数・LS キー）は該当 `docs/features/<id>.md` または `docs/features/_common.md`（セッションフロー・適応出題・共通シェル）。

---

## 3. 依存と実装状況（evergreen のみ）

| 前提 | 状態 |
|------|------|
| GA / RP IPA・TTS | プロフィール（`3a`）で選択、`activeIpa()` が表示・採点・キーボードに追従 |
| `neighbors` | Mode B MCQ distractor 用に事前計算（GA リストを RP でも流用） |
| `ga_rp_same` フラグ | 反対アクセント表示の同一判定に使用（`docs/data-contract.md` §2） |
| `neighbors_rp` | 保留（GA neighbors 流用） |
| 連結句 RP TTS | 未対応（将来対応予定） |

語彙数・CEFR 内訳・Phase 完了ログ等の日付付きスナップショットは本ファイルに置かず `docs/history.md` §1–2 を参照。ローンチ Phase 進捗は `docs/LAUNCH-CHECKLIST.md`。

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

**P-5: The Music-Driven Learner (Japanese, 16, future focus)**

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

## 5. 本ステートメントが上書きするもの

- 引き継ぎメモの「本丸＝音が出せたか」「自己評価」「自己申告による苦手音追跡」は**取り下げ**（背景資料としては保持）
- Mode A / Mode B の 2 モード構成および「本丸 / サブテーマ」階層は廃止し、目的 4 カードの平坦構造に置換
- CEFR / 頻度バンド進行（Mode B Band）は廃止。CEFR は全目的横断の word-level タグ＋プロフィール複数選択へ
- 採点の near を廃止
- GA / RP はプロフィール固定。プロフィール一元通過とオンボーディングを追加

版ごとの変更履歴は `docs/history.md` §3 を参照。

---

_旧 `docs/PURPOSE.md`（§0, §1, §2.1–2.4, §3, §4, Personas, §5）、旧 `docs/SPECIFICATION.md` §1（解決する課題）、旧 `CLAUDE.md` ポジショニング節を統合継承（Issue #173）。_
