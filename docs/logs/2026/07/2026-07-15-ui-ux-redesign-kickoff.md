---
created: 2026-07-15 23:30:00+09:00
project: IPASoundDrill
status: published
summary: IPA Sound Drill UI/UX 抜本見直しの kickoff 議論記録。Naoya の 3 課題提起 (プロトタイプ焼き回し / 目的不明瞭
  / 言語切替不明) を起点に、Claude Design の実像と IPA Sound Drill との相性、Track A/B 観点での 3 案 (α/β/γ)
  比較、案 γ 選定 (要件確定 → Claude Design 探索 → Track A/B 判定)、Phase 0 の作業計画、実態調査の 3 段階配慮、ThinkGrindAi
  粒度参照の例外扱い、次 Chat の初動プロンプトまでを記録。
tags:
- ipasounddrill
- ux
- design-review
- kickoff
- claude-design
title: IPA Sound Drill UI/UX 抜本見直し kickoff 議論記録
type: knowledge
updated: 2026-07-15 23:30:00+09:00
id: pj-2026-07-15-f1c4
aliases:
- pj-2026-07-15-f1c4
---

## Summary

IPA Sound Drill (`nkhippo/IPASoundDrill`, `https://ipasounddrill.app`) の UI/UX 抜本見直しに向けた kickoff 議論の全記録。専用 Chat 切り出しの前段として、方針決定と Phase 0 の作業計画を確定した。

## Naoya の初期問題提起

現状の UI/UX における 3 つの課題:

1. **プロトタイプ焼き回し問題**: 現在のデザインは 1 チャットで Claude が出力したプロトタイプがベースで、その後のアップデートも焼き回しに留まっており、かなり古い
2. **トップページの目的不明瞭問題**: 何ができるサイトなのかがピンとこない。言語切替方法もよくわからず、英語初学者が来訪しても英語だけが出ている状態
3. **目的ファースト UI への転換希望**: 抜本的に見直したい

追加の質問:

- Claude Design はベストプラクティスになりうるか (未使用のため実像も含めて知りたい)
- Claude で効果的にデザインを見直すために、インプットすべき情報は何か
- 要件定義・設計書は一部古いので事前アップデートが必要

## Claude Design の実像 (公式情報ベース、2026-04-17 リリース)

- **位置づけ**: Anthropic Labs のベータ製品。Claude Opus 4.7 vision で駆動。Figma の代替ではなく補完
- **出力**: 本物の HTML/CSS/JS コード (静的モックアップではない)。ブラウザで開けるライブ プロトタイプ
- **入力**: テキストプロンプト / 画像 / DOCX・PPTX・XLSX / コードベース (GitHub リポ) / web capture (既存 URL の要素取り込み)
- **6 用途**: リアリスティック プロトタイプ / ワイヤーフレーム・モックアップ / デザインエクスプロレーション / ピッチデッキ / フロンティアデザイン (voice/video/shaders/3D/AI) / ランディングページ・資料
- **エクスポート**: Canva / PDF / PPTX / HTML / Claude Code / Adobe / Base44 / Gamma / Lovable / Miro / Replit / Vercel / Wix
- **デザインシステム**: GitHub リポやデザインファイルから自動抽出。組織単位で 1 度セットアップすれば以降のプロジェクトに自動適用
- **アクセス**: `claude.ai/design` または Claude Desktop サイドバー。Pro / Max / Team / Enterprise で利用可 (Enterprise は default off)
- **注意点**: ベータ (comment persistence の不安定さ、大規模リポの lag、multi-person editing の未成熟)。トークン消費大

## IPA Sound Drill との相性

- ○ 単一 HTML 構成 (現行 `index.html` 3,259 行) = Claude Design の HTML 出力と親和性が高い
- ○ GitHub リポ直接接続で既存デザインシステム (ブランドカラー `#0C7C7E` / CSS 変数体系) を抽出可能
- ○ 現行 UI の実物を `https://ipasounddrill.app` の web capture で取り込める
- △ ベータの不安定さ、トークン消費大
- △ 実装は Cursor が担当する運用のため、Claude Design 出力は **「Cursor 用 Issue の視覚的仕様書」** として位置づけるのが現実的

## 3 案の比較

### 案 α: Track A 内で完結

Claude Design で新 UI プロトタイプ 2〜3 方向 → Cursor に index.html 反映指示。
- メリット: React 化を待たずローンチ前に刷新可能、熱があるうちに取り組める
- デメリット: 3,259 行の単一 HTML への構造改修は複雑度高、i18n 6 言語のリグレッションリスク

### 案 β: Track B 前倒し

Claude Design で React 志向プロトタイプ → Claude Code / Cursor で React 化と UI 刷新を同時進行。
- メリット: 単一 HTML の負債を残さず刷新、Claude Design の強みを最大化
- デメリット: ローンチが Track B 待ちになる、リソース分散リスク

### 案 γ: 要件確定 → Claude Design 探索 → α or β 判定 【Claude 推奨・採用】

3 フェーズ構成:

1. **Phase 0 (Vault Projects の Chat 内)**: 目的ファースト UI の要件を確定
2. **Phase 1 (Claude Design)**: 要件を投入し複数方向のプロトタイプ探索。UX の方向性を固める
3. **Phase 2 (Track A/B 判定)**: プロトタイプ複雑度と Track A 進捗を見て α or β 判定

推奨理由:
- Naoya プロフィールの「learning by building」「熱が全て」に整合
- 「同じプロンプトを何度も入力させない」= 事前準備を厚くしてから道具に投げるのが最も手戻り最小
- Claude Design 初使用のため探索フェーズを独立させることで道具理解も深まる

## 決定 (2026-07-15)

- **案 γ で進行** (判断 A)
- **Phase 0 の初手**: 仕様書監査と UX 課題整理シート起草を並行 (判断 B)
- **専用 Chat に切り出し** (判断 C)

Cursor への指示については、Phase 0 は「読む・書き出す」中心で実装変更が発生しないため、事前 Issue 起票は行わず、**次 Chat 内で Pre-Issue Recon の必要性を都度判断する**運用とする。

## Phase 0 の作業計画

1. **`docs/SPECIFICATION.md` (32KB) の UI セクション監査** - 現状記述の古さの洗い出しと更新
2. **`docs/DESIGN.md` (29KB) の UI セクション監査** - 同上
3. **UX 課題整理シート起草** - Naoya の 3 課題 + Claude 追加候補
4. **ターゲット/ペルソナ整理** - 6 言語対応 (ja/en/ko/zh-Hans/zh-Hant/fil) を踏まえた想定ユーザーマトリクス
5. **目的ファースト UI の情報設計方針** - トップの見え方、Mode A/B の見せ分け、言語切替可視性、GA/RP 切替、語彙ブラウザ・進捗チェックの露出優先度
6. **参考・競合 UI 資料整理** - Duolingo、Bunpo、Sounds by Macmillan、ELSA Speak 等の観察メモ (Claude Design の web capture 前提)
7. **既存制約リストの明文化** - Track A 単一 HTML 維持、GAS TTS、Vercel、多言語 SEO (subdirectory + prerendering)、CSS 変数体系
8. **`open-questions.md` の新設** - UI 見直し関連の未解決論点の蓄積箱

## 実態調査の 3 段階 (Naoya 明示指示による配慮)

### 段階 1: 裏で依頼した実装修正 (ドキュメント未記載) の吸収

- Claude は憶測しない
- `index.html` および関連ファイル (CSS 変数、i18n キー) を MCP で取得
- ドキュメントに書かれていないが実装されているものを洗い出す
- 3,259 行の `index.html` は 24KB 上限超のため、Pre-Issue Recon 相当の分割取得 (セクション別・関数別) で対応
- 消費が重ければ Cursor に Recon Issue を投げるか Naoya に判断依頼

### 段階 2: ドキュメント↔実装の突合

- `SPECIFICATION.md` / `DESIGN.md` / `PURPOSE.md` の記述を実装と 1 対 1 で照合
- 消えた記述:
  - git log で経緯追跡可能 → 「ないもの」として扱う
  - 追跡不能 → `open-questions.md` に列挙し Naoya に一括確認

### 段階 3: 記載粒度の刷新 (ThinkGrindAi 準拠)

- 段階 1・2 で実態確定後、粒度を ThinkGrindAi に合わせて書き直す
- 段階 3 は Phase 0 の後半 (課題シート起草と並行しない)

## ThinkGrindAi 粒度参照の例外扱い

`project_instructions.md` の「他プロジェクトの GitHub MCP コネクタを使わない」ルール (作業混ざり防止) に対する **Naoya 明示指示による例外**。参照範囲を最小限に絞る:

- **許可**: `ThinkGrindAi GitHub` MCP で `docs/` 配下の構成と、要件定義・設計書相当ファイルの読み取り
- **許可**: Vault `30_projects/ThinkGrindAi/` の frontmatter レベル参照 (粒度感を掴む目的)
- **禁止のまま**: 実装コード本体、Issue、意思決定内容の参照 (粒度参考の目的を超えるため)

取得可否は次 Chat の初動で確認。取得不能な場合:
- `ThinkGrindAi GitHub` MCP 未接続 → Naoya に接続状況確認
- Vault `30_projects/ThinkGrindAi/docs/` 相当が未整備 → 別の参照先希望を Naoya に確認

## Claude Design にインプットすべき情報

Phase 1 で必要。分類:

### そのまま使えるもの

| 項目 | ファイル/場所 | 状態 |
|---|---|---|
| プロダクト目的の正本 | `docs/PURPOSE.md` | 2026-07-10 更新、最新 |
| ブランドカラー・言語対応 | Vault `project_instructions.md` | 最新 |
| GitHub リポ本体 | `nkhippo/IPASoundDrill` | Claude Design の GitHub 接続で自動取得 |
| 現行 UI の実物 | `https://ipasounddrill.app` | Claude Design の web capture で取り込み |

### 要更新のもの (Phase 0 対象)

- `docs/SPECIFICATION.md` (32KB): 「画面・データの正本」だが UI 記述の古さ要確認
- `docs/DESIGN.md` (29KB): 実装仕様の詳細。UI 側記述の古さ要確認

### 新規作成が必要 (最重要)

1. UX 課題整理シート (仮: `30_projects/IPASoundDrill/design/ux-issues-2026-07.md`)
2. ターゲット・ペルソナ
3. 目的ファースト UI の情報設計方針
4. 参考・競合 UI の資料 (URL リスト + 観察メモ)
5. 既存制約リスト

## 未確認事項 (次 Chat で対応)

- `docs/SPECIFICATION.md` と `docs/DESIGN.md` の中身 (本 Chat では未読)
- `ThinkGrindAi GitHub` MCP コネクタの接続状態と `docs/` 構成
- Vault `30_projects/ThinkGrindAi/` の整備状況

## 次 Chat の初動プロンプト

```
IPA Sound Drill の UI/UX 抜本見直しを進める。前 Chat で案 γ で合意済み。
handoff: 30_projects/IPASoundDrill/handoff/current-state.md の最新エントリ参照。
議論記録: 30_projects/IPASoundDrill/logs/2026/07/2026-07-15-ui-ux-redesign-kickoff.md 参照。

初動タスク:
1. 上記 2 ファイルと通常のケース 1 起動時読み込みを完了
2. ThinkGrindAi の記載粒度を参照するため、以下を試みる (Naoya 明示指示による例外):
   - ThinkGrindAi GitHub MCP で docs/ の構成確認
   - Vault 30_projects/ThinkGrindAi/ の frontmatter レベル参照
   取得不能なら Naoya に確認
3. SPECIFICATION.md と DESIGN.md の UI セクション監査を開始
4. 並行して UX 課題整理シートの起草を開始 (Naoya が挙げた 3 課題 + Claude 追加候補)
```

## 参照

- `00_meta/project_instructions_vault.md` v1.3
- `00_meta/operations/dev_project_common.md` v1.1
- `00_meta/naoya_profile.md` v1.0
- `30_projects/IPASoundDrill/project_instructions.md` v1.1
- `30_projects/IPASoundDrill/handoff/current-state.md` (2026-07-15 UI/UX kickoff エントリ)
- `docs/PURPOSE.md` v3.24 (source of truth、2026-07-10 更新)
- Claude Design 公式: `https://claude.com/product/design`, `https://support.claude.com/en/articles/14604416-get-started-with-claude-design`
