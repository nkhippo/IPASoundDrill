---
id: pj-2026-07-11-0d30
aliases:
- pj-2026-07-11-0d30
title: CLAUDE.md — ipasounddrill プロジェクト共通ルール
created: '2026-07-11'
---

# CLAUDE.md — ipasounddrill プロジェクト共通ルール

このファイルは Claude・Cursor の両者が参照するプロジェクトの共通ルールです。
新しいチャット・セッションを始めるたびに、まずこのファイルを確認してください。

---

## プロジェクト概要

- **プロダクト名**: IPA Sound Drill（旧 IPA Drill / English Pronunciation Trainer）
- **リポジトリ**: https://github.com/nkhippo/IPASoundDrill
- **公開 URL**: https://ipasounddrill.app （Vercel + カスタムドメイン）
- **内容**: IPA（国際音声記号）を軸に、音から英語の正しい発音を再構築するトレーニングツール
- **ローンチ方針**: 日付を固定せず、Phase 単位で進行する（`docs/LAUNCH-CHECKLIST.md` 参照）。作業完了が早ければ、その分早くローンチする。
- **claude.ai MCP コネクタ**: `GitHubApp MCP`（unified、URL: `https://githubapp-mcp.nkhippo.workers.dev/sse`）。shared PAT で全個人アプリのリポに到達するため、本プロジェクト相談中は対象リポ `nkhippo/IPASoundDrill` のみを操作する。旧 per-app コネクタ `IPASoundDrill GitHub`（Railway、`https://ipasounddrill-production.up.railway.app/mcp`、コード: `nkhippo/ipasounddrill-mcp`）は Phase F まで存置するが **deprecated**

---

## 起動時の必須動作

1. Project Knowledge に添付されている `HANDOFF-*.md`（管制 or 該当 Chat 用）を確認
2. MCP コネクタ `GitHubApp MCP` 経由で `CLAUDE.md` を取得（対象リポ `nkhippo/IPASoundDrill`）
3. MCP コネクタ経由で `docs/REPOSITORY-STRUCTURE.md` を取得
4. MCP コネクタ経由で `docs/LAUNCH-CHECKLIST.md` を取得
5. MCP コネクタ経由で `docs/DOCUMENT-MAP.md` を取得
6. Issue 起票・改修方針の議論では、加えて `docs/CHANGE-CLASSIFICATION.md` を取得する
7. 上記を整合させて現状把握
8. 憶測での回答を避け、不明な点は MCP で最新取得するか Naoya さんに確認

---
## ポジショニング（ブランドの本質）

以下の3つの要素を伝えるプロダクトである。名前・LP・タグライン・Issue の判断はここに立ち返って行う。

1. **IPA を情報源として引ける** — 発音記号を読める・書ける・音と対応させられる
2. **音から単語を想起する** — Mode B（Sound→Vocabulary）の思想。「聞いた音のイメージから正しい発音を再構築」
3. **L1 音韻フィルタからの脱却** — Japanese English は一例、非英語圏話者に普遍的な課題

タグライン（英・仮）: *Drill your English sounds with IPA.*
タグライン（日・仮）: *IPA で、英語の音をドリルする。*

> タグラインは仮案。ローンチ素材制作フェーズ（Track A Phase 3）で最終確定する。以下は候補:
> - 英: "Master English pronunciation, sound by sound." / "The IPA-driven pronunciation drill." / "Unlearn your accent. Rebuild from sound."
> - 日: 「音でドリル、IPA で解剖。」/「発音を、音から練り直す。」/「IPA ベースの発音ドリル。」

---

## Track A / B 分離方針

**Track A（ローンチ準備期間、開始: 2026-07-10、終了: ローンチ実行時点。固定の終了日は設けず、`docs/LAUNCH-CHECKLIST.md` の Phase 進捗で判断する）**
- 目的: `ipasounddrill.app` として一般公開する
- スコープ: ホスティング移管・独自ドメイン・法務・計測・LP・告知素材・運用体系整備
- 技術方針: **現行の静的 HTML + JSON + GAS TTS 構成を維持**（React 化・BE 移管はしない）

**Track B（ローンチ後〜）**
- 目的: 継続開発・改善サイクル確立
- スコープ: React 化、BE 移管（Railway 化）、BYOK 実装、Sentry 導入、Playwright テスト、CI/CD 拡充
- 技術方針: Vite + React + Railway への段階移行、GAS 依存の切り離し

> ⚠️ Track A 期間中の Issue は「ローンチブロッカー」フラグの有無を明示すること。ブロッカーでない改善提案は Track B の Issue として起票し、ローンチ後に着手する。

---

## 開発体制

| 役割 | 担当 | 主な作業 |
|------|------|---------|
| PM・テスター | Naoya | 要件決定・テスト・Merge 判断 |
| 要件・仕様・Issue草稿 | Claude | アイデア整理・要件定義・Issue 本文草稿（.md）作成・MCP 経由の Issue 起票 |
| ソースコード実装 | Cursor | Issue を読んで実装・PR 作成 |

---

## 技術スタック（Track A）

- **フロントエンド**: `src/index.template.html` + ビルドスクリプト（`scripts/build-i18n-html.js`）で 6 言語版 HTML を生成 + 純粋 JS + JSON データ
- **ホスティング**: Vercel（静的サイト、Track A 移管後）
- **TTS**: Google Apps Script（`gas/Code.gs`、Track A 期間中は現行維持）
- **データ生成パイプライン**: Python（`scripts/*.py`、ローカル実行）
- **AI 連携**: Claude Sonnet 4.6（データ生成パイプラインでのバッチ用途）
- **ドメイン**: `ipasounddrill.app`
- **計測**: Vercel Web Analytics（クッキーレス、Track A で導入。Issue #19 で有効化済み）

---

## ファイル構成

```
ipasounddrill/
├── CLAUDE.md                        ← このファイル（共通ルール）
├── src/index.template.html          ← SPA テンプレート（Decode/Encode, Mode B, Connected Speech, vocab browser, progress checks）
├── en/ … fil/                       ← 生成物（Vercel Build / `npm run build`、`.gitignore`）
├── middleware.ts / package.json / vercel.json
├── README.md                        ← 人間向け概要（デモ URL・ローカル起動）
├── wordlist_GA_a1a2_plus_phonics.json    ← ★ PRODUCTION wordlist（runtime fetch）
│
├── data/                            ← runtime JSON, batches, pipeline, derived, patches, archive
│   ├── README.md                    ← data/ 配下の役割分担
│   ├── connected_speech.json        ← RUNTIME
│   ├── weak_forms.json              ← RUNTIME
│   ├── guide.json                   ← RUNTIME
│   ├── batches/                     ← マージ入力
│   ├── pipeline/                    ← IPA/respelling ステージング
│   ├── derived/                     ← neighbors, RP IPA 進捗
│   ├── patches/                     ← 過去の一括パッチ
│   └── archive/                     ← ローカル退避
│
├── docs/                            ← 正本ドキュメント + AI 履歴
│   ├── README.md                    ← docs/ 索引
│   ├── PURPOSE.md                   ← 目的・2モード・評価方針（source of truth）
│   ├── DESIGN.md                    ← 実装設計（SRS・TTS・データ整備）
│   ├── SPECIFICATION.md             ← 画面・データフィールド・localStorage
│   ├── REPOSITORY-STRUCTURE.md      ← フォルダマップ・ランタイム契約
│   ├── LAUNCH-CHECKLIST.md          ← Track A の Phase 別タスク一覧
│   ├── OPERATIONS.md                ← Vercel デプロイ・rollback・TTS 障害対応
│   ├── bug-knowledge.md             ← バグ根本原因記録
│   ├── cursor/                      ← AI タスク履歴
│   │   ├── README.md
│   │   ├── instructions/            ← cursor-instructions-*.md（実装前）
│   │   ├── reports/                 ← cursor-implementation-report-*.md（実装後）
│   │   └── briefs/                  ← 設計相談ブリーフ（実装前）
│   ├── reference/                   ← 監査・運用ガイド
│   ├── testing/                     ← Manual test checklists
│   └── archive/                     ← 旧ドキュメント退避
│
├── scripts/                         ← Python パイプライン（paths.py がパス正本）
├── tools/                           ← merge_def, validate_i18n, gen_audit_docs, ...
├── gas/                             ← Code.gs, BatchWarm.gs, BatchWords.gs, README
├── i18n/                            ← UI strings + phonemes/（6 languages: ja/en/ko/zh-Hans/zh-Hant/fil）
├── fonts/                           ← Doulos SIL（IPA）
└── .cursor/rules/dev-flow.mdc       ← Cursor 専用ルール
```

**衝突時の優先順位**: `PURPOSE.md` → `DESIGN.md` → `SPECIFICATION.md` → `REPOSITORY-STRUCTURE.md` の運用メモ。

---

## 開発フロー（4-step）

> Track A 期間中は個人開発 + 短期ローンチのため軽量フローで運用する。
> Track B に入ったら、Issue 単位で必要に応じ設計懸念点検フェーズを厚くする。

```
Step 1: 要件整理（Naoya × Claude）
  Naoya が Chat で相談 → Claude が要件を整理 → 5項目チェックを満たす Issue を起票（MCP 経由）
  Issue 本文には「ローンチブロッカーか否か」を明示する

Step 2: 設計懸念点検（Cursor）
  Cursor が Issue 本文を読み、以下の観点で点検結果を Issue Comment に投稿する：
  - 解釈が複数生まれる箇所（カテゴリ A）
  - UX・運用が変わりうる懸念（カテゴリ B、影響度大/中/小）
  懸念なし → Step 3 へ直行
  懸念あり → Naoya が Chat で Claude と相談 → Issue 本文を更新 → Step 2 に戻る

Step 3: 実装（Cursor）
  Issue の完了定義を満たすまで実装 → PR 作成
  実装中に新規の懸念が発生した場合は Issue Comment に報告

Step 4: レビュー・マージ（Naoya）
  Naoya が PR をテスト → ok コメントで自動マージ
```

---

## Issue タイプと分割判断

### タイプ体系（Track A では A / B の2種類のみ使う）

| タイプ | 定義 | 例 |
|---|---|---|
| **A（軽微）** | 単一ファイル、既知仕様への復帰、CI/CD 整備、ドキュメント更新 | バグ修正、ドメイン設定、workflow 追加 |
| **B（標準）** | 複数ファイル、UI 変更、データ拡充、仕様書更新を伴う | LP 追加、計測タグ実装、Vocab 拡充 |

> タイプ C（大規模仕様変更・複数 PR にまたがる作業）は Track B で React 移管や BYOK 実装を扱う際に導入する。

### Issue 分割の 5 判断軸

| 判断軸 | 分割する条件 |
|---|---|
| **設計 vs 実装** | 仕様書・要件定義書の変更を伴う → `docs` Issue を先行、`feature` Issue を後続 |
| **対応規模** | 影響ファイルが 5 つ超 or Cursor の 1 セッションで完結しない量 → 機能・レイヤー単位で分割 |
| **ドキュメント独立性** | `CLAUDE.md` / `dev-flow.mdc` などの運用ドキュメント修正は常にコード変更から切り離して先行マージ |
| **ブロッキング関係** | B が A の完了を待たないと着手できない → A を先行 Issue に分割 |
| **リスク隔離** | 本番影響が大きい変更は単独 Issue にする |

---

## Issue 起票ルール

### Issue 起票前の必須チェック（Claude が毎回確認）

**署名・フォーマット**
- [ ] 本文冒頭に `🤖 **Claude より**` と末尾に `_Claude による自動投稿_` を記載しているか

**タイプ判断**
- [ ] タイプ A / B のどちらか判断したか
- [ ] タイプ B の場合、`docs/` 配下の仕様変更が必要か判断したか

**Track A / B 判断**
- [ ] この Issue はローンチブロッカーか否か明示したか
- [ ] Track B 案件の場合、ラベル `track-b` を付与したか

**分割判断（5軸チェック）**
- [ ] 影響ファイルが 5 つ超の場合、分割しているか
- [ ] 運用ドキュメント修正は単独 Issue にしているか

**5項目チェック（ready-for-cursor ラベル付与条件）**
- [ ] 背景・目的
- [ ] 実装範囲（対象ファイル明示）
- [ ] 完了定義（「〇〇の状態になっていること」という具体的な動作で記述）
- [ ] テスト観点
- [ ] 非対象範囲

1 つでも欠けていれば `ready-for-cursor` ラベルを付与しない。

**Bug Issue の追加チェック**
- [ ] Issue 本文に「## 根本原因記録（PR マージ後に Cursor が記入）」テーブルが含まれているか
  （`.github/ISSUE_TEMPLATE/bug.md` を使えば自動で含まれる）

### Issue 本文の署名

Claude が Issue を起票・コメント追加する際は、本文冒頭に必ず以下を付ける。

```markdown
🤖 **Claude より**

（本文）

---
_Claude による自動投稿_
```

Cursor が Issue Comment を投稿する際は以下:

```markdown
🛠️ **Cursor より**

（本文）

---
_Cursor による自動投稿_
```

### ラベル付与者・タイミング

| 起票ルート | 5 項目チェック実施者 | ラベル付与者 | タイミング |
|---|---|---|---|
| Claude が MCP 経由で起票 | Claude | Claude（起票時に同時付与） | Issue 起票時 |
| Naoya が GitHub UI で起票 | Naoya | Naoya（起票直後） | Issue 起票直後 |
| 既存 Issue への後付け | Naoya（最終確認） | Naoya | 起票後に内容が 5 項目を満たした時点 |

> Claude が起票する場合でも、Naoya が後で 5 項目チェックを再確認し、不備があればラベルを外す権限を持つ。

### ラベル体系

| ラベル | 意味 |
|---|---|
| `feature` | 新機能・大型仕様変更 |
| `bug` | バグ修正 |
| `docs` | ドキュメントのみの変更 |
| `chore` | リポジトリ整備・CI/CD 設定 |
| `ready-for-cursor` | Cursor が実装開始可能な状態（5 項目チェック OK） |
| `needs-review` | PR がレビュー待ち（自動付与） |
| `launch-blocker` | ローンチまでに必須 |
| `track-b` | ローンチ後の作業 |
| `critical` / `high` / `medium` / `low` | 優先度（任意） |

---

### 改修分類ブロック（必須）

Claude が Issue を起票する際、本文冒頭（署名の直後）に必ず改修分類ブロックを含める。仕様は `docs/CHANGE-CLASSIFICATION.md` § 7。

- Complexity Level と Change Pattern の判定は `docs/CHANGE-CLASSIFICATION.md` § 2, § 3 に従う
- 判定根拠を必ず 1–2 行で明記する
- 境界が曖昧な場合は上位選択（L1↔L2 迷ったら L2、L2↔L3 迷ったら L3）
- Naoya さんが Issue 起票を承認する前に、分類が正しいかを Chat で確認する
- Issue 起票時は必ず `docs/CHANGE-CLASSIFICATION.md` を参照して分類ブロックを構築する
- 分類ブロック欠落・`TBD` / `未定義` がある Issue には `ready-for-cursor` を付けない

### 参照ドキュメントの明示

Issue 本文には、Category C（Issue 起票時参照）および Category D（Cursor 実装時参照）から該当するドキュメントを列挙する。分類は `docs/DOCUMENT-MAP.md` § 2 を参照。

## Branch 戦略（Track A / B で使い分け）

**Track A（ローンチ準備期間）**: main-first の簡易運用
- 全ての PR は `main` を base とする
- `main` に Branch Protection を設定：PR 経由必須、force push 禁止
- 短期ローンチのため develop-first の複雑さを避ける

**Track B（ローンチ後〜）**: develop-first に切り替え
- 全ての PR は `develop` を base とする
- `develop` → `main` のリリース PR は Naoya の明示承認後
- 詳細は Track B 開始時に `CLAUDE.md` を更新して定義する

> Track A / B の切り替えは、ローンチ完了時に `chore: switch to develop-first branching` Issue で実施する。

---

## 品質基準

### 1. 運用ドキュメント（PURPOSE / DESIGN / SPECIFICATION）の品質基準

> Claude が指示書を作成する際に参照する資料の品質は、Cursor の実装の質を左右する。

**仕様書に禁止する曖昧さ**
- 「自然な方法で」「直感的に」「適切に」
- 「API で得られる」（どのエンドポイント？）
- 「フロントエンドで処理する」（どの関数？）

**仕様書に必須の記述**
- 具体的な数値・定数（例: `frequencyWeight: 0.3`, `neighborRadius: 2`）
- データ構造の完全定義（JSON 例）
- API パラメータ（呼び出し元ファイル・関数も列挙）
- 分岐条件（`score >= 95 ならば` のような条件式）

**両者に共通：可読性**
- 図表を活用（状態遷移図・データフロー・テーブル）
- 段階性を付ける（「概要」「詳細」「エッジケース」の3段構え）
- 他ドキュメントへの参照を明示（`PURPOSE.md §2-3` のように）
- 用語の統一

### 2. Cursor 指示書の品質基準

> タイプ B の Issue で `docs/cursor/instructions/` を作成する場合の基準。

**「読むべきファイル」の明示**
- 機能に関連する `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` の該当セクション
- 関連する `docs/cursor/reports/` の過去実装レポート
- 関連する `data/README.md` / `data/*/README.md`

**完了定義の書き方**
- 禁止: 「全機能が動作する」「API と連携して動作する」「PR をマージする」
- 必須: ユーザーが体験できる具体的な動作の確認項目

### 3. データ整合性チェック（IPA Drill 特有）

以下のファイル・機能に触る変更は、必ず対応するデータ整合性チェックを Issue 本文の完了定義に含めること:

| 触る対象 | 必須の完了定義 |
|---|---|
| `wordlist_GA_a1a2_plus_phonics.json` | 総語数・CEFR 別内訳の再カウント |
| `rp_ipa` フィールド | `scripts/gen_ga_rp_same.py` 再実行、same/different 内訳の再確認 |
| `neighbors` フィールド | `scripts/gen_neighbors.py` 再実行、0近傍率の変化確認 |
| `data/connected_speech.json` | 総フレーズ数・CEFR バッジ整合性 |
| `data/weak_forms.json` | 総エントリ数、type=weak の出題確認 |
| `i18n/*.json` | 6 言語すべての key 網羅性（`tools/validate_i18n.py` 実行） |
| `gas/BatchWords.gs` | `scripts/export_batch_words.py` で再生成 |

### 4. ランタイム契約への影響（IPA Drill 特有）

`REPOSITORY-STRUCTURE.md` の「Runtime data contract」に列挙されたパス（下記 8 個）に触る変更は、Issue 本文で明示的にフラグを立てること:

- `wordlist_GA_a1a2_plus_phonics.json`（ルート）
- `data/connected_speech.json`
- `data/weak_forms.json`
- `data/guide.json`
- `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json`
- `i18n/phonemes/{lang}.json`
- `fonts/DoulosSIL-Regular.woff2`
- `GAS_TTS_URL`（`src/index.template.html` 内の外部 URL）

### 5. 多言語 UI への影響（IPA Drill 特有）

UI 文言を変える Issue は、以下を必須記載:
- ja / en / ko / zh-Hans / zh-Hant / fil の 6 言語すべての文言変更有無
- `i18n/*.json` の更新対象 key リスト
- 現行 UI i18n leaf 数: **169**（runtime 165 + build-only `meta.*` 4。正本は `docs/SPECIFICATION.md` §5.5）
- Track A 期間中は英語・日本語の完全性を最優先、他 4 言語は差分マージ可

---

## AI 履歴の置き場所（現行戦略維持）

IPA Drill では AI エージェントの履歴を **GitHub リポ内に公開**する戦略を維持する。ThinkGrindAi（Obsidian 内に置く戦略）とは異なる方針であることに注意。

| 種類 | 置き場所 | 記入者 | タイミング |
|---|---|---|---|
| 実装前の指示書 | `docs/cursor/instructions/cursor-instructions-<topic>.md` | Claude | 大規模タスク（タイプ B のうち複雑なもの、Track B のタイプ C） |
| 設計相談ブリーフ | `docs/cursor/briefs/cursor-<topic>.md` | Claude | 実装前の設計議論 |
| 実装後レポート | `docs/cursor/reports/cursor-implementation-report-<topic>.md` | Cursor | PR 作成時 |
| バグ根本原因 | `docs/bug-knowledge.md` 末尾追記 | Cursor | Bug PR マージ後 |

Cursor は PR 作成時に必ず `docs/cursor/reports/` にレポートを追加すること（同一 PR に含める）。

### Obsidian の扱い（Naoya さん個人メモ）

Obsidian は Naoya さんの思考メモ用途に限定する。Cursor は Obsidian に自動保存しない。

```
/Users/naoya.k/Documents/Obsidian/ipasounddrill/
├── decisions/       ← Naoya が確定した意思決定（Chat の結論、Product 方針）
└── notes/           ← 開発中のメモ・アイデア・note 記事の下書き素材
```

---

## Bug 対応ループ

1. **Bug Issue 完了時（Cursor）**: PR マージ後に `docs/bug-knowledge.md` 末尾に根本原因記録を追記
2. **月次レビュー時（Naoya、Track B 開始後）**: 「IPA Sound Drill / サービス相談」Chat で Opus に分析依頼
3. **Opus 分析結果に基づく改善（Claude）**: 改善提案を CLAUDE.md / dev-flow.mdc / スキルに反映

Track A 期間中は Bug が発生した都度 `bug-knowledge.md` に追記するのみ。月次レビューは Track B から。

---

## Claude への指示

### 新しいチャットを始めるとき

チャットの最初に Naoya から以下のような情報をもらったら、フローのどのステップにいるかを判断して進めてください：

- 「新しいアイデアがある」→ Step 1 からガイド
- 「要件を詰めたい」→ Step 1 から議論開始
- 「Issue の文面を作って」→ Step 1 の Issue 起票サポート
- 「PR のテストをしたい」→ Step 4 のサポート
- 「Hotfix したい」→ Hotfix フローで Issue 草稿を作成（後述）

### 毎回の返答末尾に付けること

要件整理・議論・仕様作成を行った返答の末尾には、必ず以下のブロックを追加してください：

```
---
✅ この会話での確定事項
・（箇条書きで確定した内容）

📋 次のアクション（Naoya さんがやること）
1. 【ツール名】具体的な作業内容
2. 【ツール名】次の作業
   → 完了したら Claude に「〇〇が終わりました」と伝えてください

🔧 Claude が次に用意するもの（あれば）
・（次の会話で Claude が作成するもの）
---
```

### Obsidian 記録が必要な場合

Product 方針・大きな意思決定が確定したときは、Naoya さんに Obsidian への保存を提案する:

```
---
🔧 Cursor 作業指示（Obsidian メモ保存）
パス: /Users/naoya.k/Documents/Obsidian/ipasounddrill/decisions/YYYY-MM-DD-<トピック>.md

内容:
# <タイトル>
## 確定事項
-
## 背景・理由
-
## 関連 Issue / PR
-
---
```

### Chat 切り出しが必要になったとき

ローンチ準備期間中は複数の Chat を跨ぐことを想定。切り出し時は以下を出す:

```
---
📦 新規 Chat 引き継ぎパック
テーマ: <テーマ>
添付すべきファイル:
- CLAUDE.md（この共通ルール、MCP で取得可能）
- docs/LAUNCH-CHECKLIST.md（現在の進捗）
関連 Issue:
- #XXX（該当タスク）
伝えるべき文脈:
- <このChatで決まった前提>
---
```

### Hotfix フロー

ローンチ後、緊急のバグ修正が必要になった場合のフロー。以下の3条件をすべて満たすときのみ使用する:

1. 影響ファイルが 3 つ以下と見積もれる
2. 既存仕様への復帰のみ（新規仕様判断を必要としない）
3. UX 変更を伴わない

Naoya が症状を伝えたら Claude が Issue 草稿（.md）を出力する。以下のフォーマットを Naoya が使う:

```
## 症状
（例: TTS を再生すると1回目だけ音が途切れる）

## 再現手順
（例: Decode モード → 難易度3 → 最初の問題で「音を聞く」ボタン）

## 期待動作
（例: 最初の再生から音が完全に鳴る）

## 補足（任意）
```

---

## Cursor への指示

詳細は `.cursor/rules/dev-flow.mdc` を参照してください。

### 基本ルール

- 実装前に GitHub Issue 本文を熟読する（仕様の正本）
- タイプ B で `docs/cursor/instructions/` に指示書がある場合はそれも参照
- 既存のファイルへの変更は最小限（新機能は新規ファイルで実装）
- `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` / `REPOSITORY-STRUCTURE.md` は Claude の明示的な指示がない限り編集しない
- PR 作成時に必ず `docs/cursor/reports/` にレポートを追加する（同一 PR に含める）
- PR 作成後、必ず Naoya へのネクストアクションを提案する
- ラベルに `bug` が含まれる Issue を完了させる場合、PR マージ後（または同一 PR 内）で `docs/bug-knowledge.md` に根本原因記録を追記する

### 作業の進め方

検証が完了したら、確認なしに以下まで一気に進めること：
1. コミット
2. push（未完成でも必ずpushすること）
3. PR 作成（Draft 可、base・ラベルを記載）
   ※ Track A は `Closes #XXX` を PR 本文に記載してよい（main-first のため）
   ※ Track B は `Closes #XXX` は develop 向け PR には書かない
4. PR 本文の必須フォーマットは `.cursor/rules/dev-flow.mdc` の「## PR Description」を参照

途中で止まってよいのは「不明点がある場合」のみ。その場合は必ず Issue Comment に以下を書いてから止まること：

```
【作業中断】
- 現在の状態：（何をやったか）
- 中断理由：（何がわからないか）
- 次に必要なこと：（何があれば再開できるか）
```

### Cursor と Naoya のコミュニケーションルール

**基本方針: Cursor とのやり取りは GitHub Issue / Comment を正とする**

- Naoya から Cursor への作業依頼は GitHub Issue で行う
- Cursor から Naoya への質問・報告・持ち帰り資料は Issue Comment に書く
- Cursor デスクトップアプリは「GitHub の URL を伝える中継手段」として使う

### PR レビューフロー（needs-review ラベル）

| イベント | ラベル変化 |
|---|---|
| Cursor が PR を作成 / 追加 push | `needs-review` が自動付与される |
| Naoya が承認コメント（ok / lgtm / ✅） | `needs-review` が自動除去、自動マージ実行 |
| Naoya が PR をマージ | `needs-review` が自動除去 |

#### レビュー指摘対応後の必須報告

- PR コメントを受けて修正した場合、追加 push 後に同じ PR の Conversation へ結果コメントを必ず投稿する
- 結果コメントには、対応した指摘・変更内容・検証結果・未解決事項（なければ「なし」）を含める
- 結果コメントの投稿までを対応完了とし、その後に Ready for review 化または再レビュー依頼を行う
- 修正不要と判断した場合も、理由と根拠を同じ PR に返信する
- CI bot の通知と承認トリガーワードだけのコメントは返信対象外

---

## ルール変更時のセルフチェック手順

`CLAUDE.md` / `.cursor/rules/dev-flow.mdc` / `docs/bug-knowledge.md` / `.github/ISSUE_TEMPLATE/*` を編集する際は、Claude が必ず以下の手順を踏む。

### Step 1: 既存記述の網羅確認（grep）

変更する概念・キーワードが他の場所にも書かれていないかを必ず確認する:

```bash
# 例: base ブランチ判断を変更する場合
grep -nE 'base|main|develop' CLAUDE.md .cursor/rules/dev-flow.mdc docs/*.md .github/ISSUE_TEMPLATE/*.md

# 例: Track A/B の境界を変更する場合
grep -nE 'Track A|Track B|launch-blocker|track-b' CLAUDE.md .cursor/rules/dev-flow.mdc docs/*.md
```

### Step 2: 連動更新の確認

変更が以下のファイルに連動更新を必要とするか確認する:
- `CLAUDE.md` を変更 → `.cursor/rules/dev-flow.mdc` の逆参照
- 開発フロー（Step 1〜4）に影響 → 番号体系の整合性を確認
- Bug Issue 運用に影響 → `docs/bug-knowledge.md` / `.github/ISSUE_TEMPLATE/bug.md` を確認

### Step 3: 変更後の grep 再確認

変更完了後、もう一度 grep して以下を確認:
- 旧記述が完全に消えているか
- 新記述が意図した箇所すべてに反映されているか
- 矛盾するペアが存在しないか

### Step 4: Issue 起票時の追記

ルール変更を含む Issue を起票する際、以下を必ず Issue 本文に含める:
- 「変更前」「変更後」の対比表または diff 例
- grep コマンドとその出力
- 連動更新が必要な他ファイルへの参照

---

## ThinkGrindAi プロジェクトとの差異（重要）

Naoya さんは同時に `thinkgrindai` プロジェクトも運用している。両者の運用方針の違いは以下の通り。混同しないこと。

| 項目 | ipasounddrill（このプロジェクト） | thinkgrindai |
|---|---|---|
| プロダクト種別 | 一般公開 OSS 学習ツール | 内部 Web アプリ |
| 技術スタック | 静的 HTML + JSON + GAS TTS（Track A） | Vite + React + Express + Google Sheets |
| AI 履歴の置き場所 | GitHub リポ内公開（`docs/cursor/`） | Obsidian ローカル（`.../thinkgrindai/`） |
| 開発フロー | 4-step（軽量） | 7-step（厳格） |
| Issue タイプ | A / B（Track A）、C は Track B から | A / B / C（すべて使用） |
| Branch 戦略 | main-first（Track A）、develop-first（Track B） | develop-first |
| Obsidian パス | `.../ipasounddrill/{decisions,notes}/` | `.../thinkgrindai/{discussions,decisions,implementations,confirmed-decisions}/` |
| 月次 Opus レビュー | Track B から導入 | 運用中 |

両プロジェクトを跨ぐ場合、CLAUDE.md を必ず読み直すこと。

---

## Issue 背景セクションの書き方

Issue 本文の「背景・目的」は以下 5 サブセクション構成で書く:

1. **この Issue のトリガー**: どこから発生したか（Chat 内の議論、Naoya さんの要望、既存 Issue との関連等）
2. **背景となる文脈**: プロダクト目線 / 開発運用目線 / 技術目線の 3 観点
3. **検討した選択肢と選定理由**: 却下した選択肢も含めて記述
4. **この Issue で得たい成果**: 定量 / 定性 / 波及効果の 3 観点
5. **後続への影響**: 次にできるようになること、今後の Issue で参照される可能性がある成果物

背景セクションの主観性は Chat での壁打ちを Claude が整理する。Naoya さんが明示的に語っていない主観部分は、Claude が空欄マーカー `_[Naoya さんが追記予定: XX]_` で残し、Naoya さんが GitHub UI で追記する運用。

---

## Issue 起票時のルール

Issue 本文の「背景・目的」は「Issue 背景セクションの書き方」に従う。

改修分類ブロックは `docs/CHANGE-CLASSIFICATION.md` § 7 に従い必須（Complexity Level / Change Pattern / 判定根拠）。

Issue 本文には Category C（Issue 起票時に参照すべきもの、`docs/DOCUMENT-MAP.md` § 2 参照）から必要なドキュメントを列挙する。

Issue のスコープ判定は `docs/agent-instruction-guide.md` § 1 の抽象度マトリックスに従う。100 行超の Issue は Pre-Issue Recon の要否を Naoya さんに提案する。

新規ドキュメント作成の可能性がある議論では、`docs/DOCUMENT-MAP.md` § 3 の「新規ドキュメント作成判定フロー」を実施し、Category (A-E) 判定と DOCUMENT-MAP.md 更新を Issue 本文に含める。

**Phase 番号の記述**: Issue 本文で作業手順を Phase 番号で列挙する場合、「Phase 0, Phase 1, Phase 2, ...」の連番で明確に記述する。「Phase 0-B7」のような曖昧な範囲表記は使用しない。Phase 総数を末尾に明記する（例: 「Phase 0-8 の 9 段階で実施」）。

---

## Issue 対応時のルール（Cursor 指示書作成時）

Cursor 指示書には必ず以下を含める:

- `docs/REPOSITORY-STRUCTURE.md` への参照（ホワイトリスト決定の基礎）
- `docs/DEV-GUARDRAILS.md` への参照（堅固化パターン A/B、md5 検証、自己判断禁止）
- `.cursor/rules/dev-flow.mdc` への参照
- 該当機能の設計文書（DESIGN.md / SPECIFICATION.md、Category D、DOCUMENT-MAP.md § 2 参照）

Docs 系 Issue の場合、加えて以下を Cursor 指示書に含める:

- `docs/DOC-SYNC-PLAYBOOK.md`（ソース ⇔ ドキュメント同期）
- `docs/agent-instruction-guide.md`（抽象度ガイド）

`docs/REPOSITORY-STRUCTURE.md` の更新義務: 新規ファイル追加、ファイル削除、ディレクトリ構造変更、Runtime infrastructure 変更、i18n の新規キー追加、index.html の新規主要関数追加が Issue に含まれる場合、REPOSITORY-STRUCTURE.md の該当セクションを同時更新（ホワイトリストに追加）。Cursor が判断に迷ったら中断し、Issue Comment で報告する。

Cursor 実装レポートは `docs/DEV-GUARDRAILS.md` § 7 のテンプレートに従う。「Issue 背景」「実装過程での気づき」「後続への影響」を必ず記述（Projects / Note での発信素材化のため）。

