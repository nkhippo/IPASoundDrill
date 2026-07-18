---
id: pj-2026-06-24-933a
aliases:
- pj-2026-06-24-933a
title: IPA Sound Drill — 目的ステートメント（確定版 / source of truth）
created: '2026-06-24'
updated: '2026-07-18'
---

# IPA Sound Drill — 目的ステートメント（確定版 / source of truth）

> アプリの目的、学習成果、Phase 1 UI/UX の思想を確定する正本。  
> 目的・評価方針に関する記述が衝突した場合は、本ドキュメントを正とする。
>
> **版:** v4.0 ／ **更新日:** 2026-07-18  
> **ステータス:** Phase 1 UI/UX 実装前の仕様先行改訂。語彙 **5,397語**、GA/RP IPA、連結句、弱形、語彙ブラウザ、進捗チェック、TTS プリフェッチ、6 言語 UI は現行実装として維持する。  
> 詳細な実装設計は `docs/DESIGN.md`、画面・データ・localStorage の正本は `docs/SPECIFICATION.md` を参照。

---

## 0. 一行サマリ

**音を、美しく。**  
IPA を情報源として使い、英語の音を「聞く・読む・書く・単語に結びつける」ための目的別ドリルを提供する。Phase 1 では旧 Mode A/B の二分法を廃止し、学習者が自分の目的を 3 秒で選べる **4 目的カード構成**へ再編する。

- 日本語タグライン: **音を、美しく。**
- English tagline: **Retune your English. From sound up.**
- Korean tagline: **소리를, 아름답게.**

本アプリの価値は、発音を「ネイティブらしさ」ではなく、IPA によって観察可能な音の再調整として扱う点にある。

---

## 1. 目的 4 カード構成

Phase 1 UI/UX では、学習者に内部実装名を見せず、目的をそのまま入口にする。

| 目的カード | 旧実装上の対応 | 学習者が得るもの | 入口 | 主な確認 |
|---|---|---|---|---|
| **音の発音を確かめる** | Decode 相当 | IPA を見て既知語の音を想起する力 | IPA / 音声 | 英単語の完全一致 |
| **発音から書いてみる** | Encode 相当 | 綴りから IPA を組み立てる力 | 英単語 / 音声 | IPA の完全一致 |
| **音から単語を覚える** | 旧 Listen & learn Study 相当 | 音を先に聞き、語義・綴りを結びつける力 | TTS / IPA | 手動チェックのみ |
| **連結する音に慣れる** | Connected Speech / Weak forms 相当 | 辞書形と実際の連結・弱形の差を読む力 | 連結 IPA / キャリア文 | 元フレーズまたは機能語の完全一致 |

この再構造化により、「Mode A は本丸、Mode B はサブテーマ」という開発者向けの分岐はユーザー体験から外す。内部実装が当面旧関数名を保持しても、仕様上の正本は目的カードである。

### 1.1 目的カード共通の学習原則

1. **音を先に置く。** IPA・TTS・綴りの順序は目的ごとに異なるが、どのカードでも音の観察を中心に置く。
2. **AI 判定を入れない。** スペルや IPA の正誤は完全一致のみで扱い、惜しさ・部分正解・AI による発音評価は表示しない。
3. **手動チェックで卒業を表す。** システムは学習者を自動評価せず、学習者が「できた」と判断した回数を 0–3 で記録する。
4. **プロフィールでセッションを固定する。** アクセント、CEFR、目的別プリセット、詳細条件は開始前のプロフィール画面で確認し、学習中は静かなインラインチップで状態を示す。

---

## 2. 4 目的ごとの方針

### 2.1 音の発音を確かめる

- 旧 Decode に相当する目的カード。
- 学習者は IPA と音声を手がかりに英単語を入力する。
- 正解は **綴り完全一致**のみ。Levenshtein による near 判定は Phase 1 正本では採用しない。
- 語ごとの CEFR タグは難度ではなく語彙レベルの情報として表示する。
- 手動チェックはこの目的専用に保存し、他目的の卒業判定へ流用しない。

### 2.2 発音から書いてみる

- 旧 Encode に相当する目的カード。
- 学習者は英単語を見て IPA キーボードで発音を組み立てる。
- 正解は **IPA（強勢を含む）完全一致**のみ。強勢を除いた一致による部分正解は Phase 1 正本では表示しない。
- IPA 各記号の解説・例語・TTS は、IPA を情報源として引ける体験を支えるために維持する。

### 2.3 音から単語を覚える

- 旧 Mode B Study に相当する目的カード。
- 学習者は最初に音声と IPA を受け取り、自分で意味を確認するタイミングを選ぶ。
- システムは意味理解を自動採点しない。手動チェック 0–3 によって「まだ見る / もう少し / ほぼ大丈夫 / 卒業」を表す。
- CEFR はこの目的だけの進行軸ではなく、全目的を横断する word-level タグとして扱う。
- MCQ やディクテーションの旧コードが残る場合も、Phase 1 のユーザー向け正本は Study + 手動チェックである。

### 2.4 連結する音に慣れる

- Connected Speech と Weak forms を含む目的カード。
- 学習者は連結 IPA または弱形 IPA を見て、元フレーズまたは機能語を入力する。
- 連結句 TTS は Track A では GA 固定、弱形 TTS は GA/RP に対応する。
- Type / Level の絞り込みはドリル内の静かなインラインチップとして扱い、独立した絞り込み画面は設けない。

---

## 3. 横断仕様

### 3.1 CEFR の位置づけ

CEFR は旧「語彙モードの進行軸」ではなく、Phase 1 では **全目的を横断する word-level タグ**である。

- プロフィール画面で A1 / A2 / B1 / B2 などを複数選択する。
- 各カードの STEP 行右上に「語彙 A2」のようなタグを表示する。
- 出題対象は選択 CEFR と目的別条件の積集合で決まる。
- CEFR が未設定の語を出題に含めるかは Phase 1-0-b Recon で確定する。正本方針としては、未タグ語を黙って別レベルへ割り当てない。

### 3.2 GA / RP の位置づけ

GA / RP は学習プロフィールで選択し、**セッション中は固定**する。収録音声、IPA、キーボード、反対アクセント表示が異なるため、学習中の即時切替はしない。

- プロフィール画面で GA / RP を選ぶ。
- ドリル画面ヘッダーには固定バッジを表示する。
- 反対アクセントの IPA は必要な画面で補足表示する。
- `ga_rp_same` / `ga_rp_same_reason` は現行どおり、学習者にとって実質同じ発音かを表す派生情報として保持する。

### 3.3 マーキング仕様

マーキングはユーザーの手動操作だけで更新する。

| 項目 | 方針 |
|---|---|
| 回数 | 0–3。3 回でその目的では卒業扱い |
| 単位 | 目的カードごとに独立 |
| 保存 | Local Storage。Track A ではバックエンド管理しない |
| 自動更新 | しない。正誤判定による自動昇格・降格はしない |
| 表示 | 語彙ブラウザ、Reveal、Study などで同じ意味のチェックとして見せる |

### 3.4 プロフィール一元通過型 UX

Phase 1 では、学習開始前に必ずプロフィール画面 `8z` を通過する。

1. トップの目的カードを選ぶ。
2. `8z` でアクセント、CEFR、目的別プリセット、詳細条件を確認する。
3. Local Storage に保存された前回値を初期値として表示する。
4. ユーザーはそのまま **はじめる**、または変更してから開始する。
5. セッション中の絞り込みはドリル画面内のインラインチップに限定し、主導線を分断しない。

### 3.5 オンボーディング

初回訪問時は 4 スライドのガイド `8e` を表示する。スキップも完了扱いにし、以後は Local Storage の `onboarding_completed_v1` で自動表示を抑止する。ヘッダーのガイドアイコンから任意に再表示できる。

### 3.6 AI クローラビリティ

重要な思想、目的カード、ヘルプ導線、フッターの「このアプリについて」は、JS 実行後にしか存在しない情報にしない。クローラーや支援技術が DOM 上で読める形を優先する。これは Phase 1 時点では原則候補だが、LP・トップページ・footer の設計判断で参照する。

### 3.7 視覚言語トークン化

色、タイポグラフィ、スペーシング、角丸、シャドウ、コンポーネント状態は Phase 1-A でトークン化する。PURPOSE では値を固定せず、目的ファースト UI を支える一貫した視覚言語を持つことだけを正本方針とする。

---

## 4. 依存と実装状況

| 前提 | 現状 | Phase 1 での扱い |
|---|---|---|
| 語彙 5,397 語 | 実装済み | CEFR word-level タグとして全目的で利用 |
| UI 6 言語 | 実装済み | Phase 1-G で新 UI 文言を多言語化 |
| GA/RP IPA・TTS | 実装済み | プロフィール固定に再配置 |
| 連結句 201 / 弱形 36 | 実装済み | 目的カード「連結する音に慣れる」へ統合 |
| 語彙ブラウザ | 実装済み | 支援画面として Phase 1-E で再配置 |
| 進捗チェック | 実装済み | 目的ごと独立のマーキング仕様へ整理 |
| TTS プリフェッチ | 実装済み | 全目的共通の体験品質として維持 |
| 旧 Mode A/B UI | 実装済み | Phase 1 実装で目的カード UI へ置換 |

---

## 5. 本ステートメントが上書きするもの

- v2〜v3.24 の「Mode A（本丸） / Mode B（サブテーマ）」というユーザー向け 2 モード構成は、Phase 1 UI/UX 見直しにより廃止する。旧概念は実装移行中の内部名・履歴としてのみ扱う。
- 旧「Mode B の主軸 = CEFR/頻度による段階進行」は廃止し、CEFR は全目的横断の word-level タグへ移す。
- 旧「学習中に GA/RP を設定で切替可能」は、Phase 1 ではプロフィールで固定選択し、セッション中は不変とする。
- 旧 Decode / Encode の near 表示は、Phase 1 正本では表示しない。採点は完全一致のみ。
- 引き継ぎメモ §2-4 の「発音できたかの自己評価」や自動評価案は採用しない。手動チェックはユーザーの自己管理であり、発音採点ではない。
- Cursor 仕様書 §1.2 の「2 モード構成」は、本 v4.0 の目的カード構成で上書きする。

---

## Personas & Learning Journey

IPA Sound Drill is designed for adult English learners who want to develop pronunciation accuracy through IPA-based, sound-first training. The following personas guide Phase 1 design decisions.

### Primary Personas

**P-1: The Working Professional (Japanese, 34)**

A Japanese SIer project manager (TOEIC 730) who wants to deepen his engagement with foreign culture through English. His frustration: "I can't hear sounds I can't produce" — the phonological gap between his Japanized English and native English is too large. His motivation: to have deep, meaningful conversations in English. Success: being told "your pronunciation is beautiful and easy to understand".

**P-2: The Strategist (Korean, 28)**

A senior strategist at a Korean multinational advertising agency (TOEIC 950). Her Korean L1 phonological filter creates residual accent that she wants to refine. She values professional polish; her ideal is when clients say "your English is very clear".

**P-3: The CS Agent (Filipino, 22)**

A remote CS agent for a US fintech company (TOEIC 850). Filipino English is her first language, but she wants to reduce Filipino-English-specific traits that customers find harder to understand. Her goal is promotion to Team Lead.

**P-4: The Graduate School Aspirant (Chinese, 19)**

A Shanghai university student preparing for US graduate school (TOEFL 92, Speaking 20). Her Mandarin L1 phonological filter blocks her TOEFL Speaking score. She wants to reach Speaking 26+.

**P-5: The Music-Driven Learner (Japanese, 16, Track B focus)**

A high school student in Kyoto whose English interest started with indie music. She wants to sing English songs beautifully — not to sound native, but to develop her own beautiful voice in English.

### Learning Journey Arc

1. **First 3 seconds:** Learner recognizes a purpose card as "for me".
2. **First session:** Learner passes through profile, completes several items, and sees Reveal as layered learning support rather than a score report.
3. **First week:** Manual marking begins to build a personal map of words and sounds.
4. **First 3 months:** Learner notices listening and pronunciation perception improving together.
5. **Long-term:** The success moment is aesthetic and social: others describe the learner's English as clear, beautiful, or easy to understand.

### Design Decision Reference

Detailed design discussions live in Naoya's private Vault. Public design documents in this repository (`docs/design/`) contain distilled versions suitable for external contributors and design AI tools.

---

## 変更履歴

| 日付 | 版 | 内容 |
|---|---|---|
| 2026-07-18 | v4.0 | Phase 1 UI/UX 実装前の仕様先行改訂。旧 Mode A/B 構成を目的 4 カード構成へ再編し、タグライン、GA/RP セッション固定、CEFR 全目的横断、マーキング、完全一致判定、プロフィール一元通過型 UX、オンボーディング、AI クローラビリティ、視覚言語トークン化の方針を反映。 |
| 2026-07-10 | v3.24 | パッケージ B (Phase 2 バッチ品質監査): 全 569 語独立 Opus 監査完了。wordlist 波及 typo 2件、POS 正規化 1件、Fil 翻訳更新 13件。 |
| 2026-07-10 | v3.23 | Phase V: 語彙ブラウザをモーダルから独立ページ (`#vocabPage`) に移設。 |
| 2026-07-10 | v3.22 | Phase T: TTS 1問目遅延解消。fast-path body-first、warm de-gating、Drive 直リンク URL API。 |
| 2026-07-10 | v3.21 | Phase R: RP 分類器・happY ルール・fallback 修正。 |
| 2026-07-10 | v3.20 | Phase 2 M2 完了（B2 +569、総 5,397）。進捗チェック、Phrases CEFR バッジ、`dignify` RP ホットフィックス。 |
| 2026-07-09 | v3.14 | Phase 1 M5（最終）: B1 拡充 389語。 |
| 2026-07-06 | v3.2 | 学習モード名称を行為ベースに刷新。反対アクセント全画面表示。 |
| 2026-06-24 | v2 | 2モード構成に拡張。Mode A＝音素カバー軸、Mode B＝CEFR軸の語彙サブテーマ。 |
| 2026-06-23 | v1 | 本丸を IPA リテラシーに確定（単一モード前提）。 |
