# Pre-Issue Recon: monorepo 化前の現状 path 依存箇所全 grep

親 Issue: #210（実施依頼）／ 親 EPIC: #209

実施日: 2026-07-29

対象: `nkhippo/IPASoundDrill` の monorepo 化前状態（`develop` ブランチ HEAD 時点）

実施者: issue-handler（Claude Code）


---

## 0. 実行環境・再現性メモ

- 全 grep はリポジトリルート（本 recon 実施時のワークツリー）で実行。`.git/` は対象拡張子ファイルを持たないため除外オプションなしでも 0 件。`node_modules/` はリポジトリに存在しない（`.gitignore` に `node_modules/` はあるが未生成）。
- 各 grep のコマンドは Issue #210 本文記載のものをそのまま実行。差分が生じた場合のみ実行コマンドを明記する。
- 件数は `grep -c ''`（空行除く実ヒット行数）で計測。

---

## 1. Grep 結果サマリ

| Grep | 目的 | ヒット件数 |
|---|---|---|
| A | `src/` 参照（md/json/js/ts/mjs/cjs/yml/yaml） | 193 |
| B | `data/` ルート JSON 参照（md/json/js/ts/html/py） | 939 |
| C | `scripts/` 参照（md/json/yml） | 438 |
| D | `middleware.ts` / `vercel.json` / `package.json` の build 定義 | 3 ファイル全文（§5 参照） |
| E | `docs/` + `AGENTS.md` + `CLAUDE.md` 内の path 参照 | 1114 |
| F | `.github/` 内の path 参照 | 17 |
| G | `docs/features/<id>.md` の「実装 path」欄（`実装`/`対象ファイル`/`path`/`Path` キーワード grep） | 3（うち実質的な path 列挙は 0 件。§8 参照） |
| H | `docs/impact-ledger.json` の対象 path | 293 entries（全件 `src/index.template.html` の行番号） |
| I | `docs/doc-map.md` の概念→ホーム索引 | 36 行（§2 レジストリ本体、`doc-map.md` 全 74 行を§10で全文引用） |
| J | `.claude/` / `.cursor/` 内の path 参照 | 7 |

---

## 2. Grep A: `src/` 参照

```
grep -rn "src/index.template.html\|src/" --include="*.md" --include="*.json" --include="*.js" --include="*.ts" --include="*.mjs" --include="*.cjs" --include="*.yml" --include="*.yaml" .
```

ヒット 193 件（全件、省略なし）:

```
AGENTS.md:18:5. UI 改修では `src/index.template.html`(唯一の正本) を参照する。`docs/claude-design/{sp,pc}.dc.html` は凍結フレームカタログ（画面一覧用、更新義務なし）。見た目の確認は Vercel branch preview URL で行う。**外部 Claude Design(SaaS) の更新・反映・再開セッションは要求しない**(2026-07-28 廃止)。詳細 `docs/claude-design/README.md`
CLAUDE.md:27:6. **UI 仕様の正本**: `src/index.template.html`（実装）が唯一の正本。`docs/claude-design/{sp,pc,design-system}.dc.html` は凍結フレームカタログ（画面一覧用、更新義務なし、pixel-perfect 精度は保証しない）。Claude Design（外部 SaaS）は今後**更新しない・参照しない・反映を待たない**。UI 改修の見た目確認は Vercel branch preview URL で行う。詳細は `docs/claude-design/README.md`。
.claude/agents/pr-reviewer.md:84:  開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）を
.claude/agents/consistency-auditor.md:66:   → source（`src/index.template.html`）→ `impact-ledger.json`（それぞれ現存するもの）。
.claude/skills/ux-review/SKILL.md:8:見た目の良し悪しではなく、**その画面が実データ・実コードで成立するか / 雑多でないか**を検証する。正本は `src/index.template.html`。見た目確認は Vercel branch preview URL またはローカルビルドで行う。
docs/repo-map.md:11:- **フロントエンド**: `src/index.template.html` + ビルドスクリプト（`scripts/build-i18n-html.js`）で 6 言語版 HTML を生成 + 純粋 JS + JSON データ
docs/repo-map.md:24:| **Runtime (Vercel + custom domain)** | `src/index.template.html` → build → `/{lang}/index.html` + JSON/i18n/fonts loaded by the browser |
docs/repo-map.md:36:| SPA テンプレート（正本） | `src/index.template.html` | Cursor が編集する唯一の HTML ソース |
docs/repo-map.md:54:├── src/
docs/repo-map.md:102:│   ├── claude-design/           # 凍結フレームカタログ(sp/pc/design-system.dc.html)。画面一覧用、更新義務なし。正本は src/index.template.html。詳細 README.md
docs/repo-map.md:125:| TTS proxy | Google Apps Script | `gas/Code.gs` deployment, `GAS_TTS_URL` in `src/index.template.html` |
docs/repo-map.md:142:**現行スコープ**: `src/index.template.html` + 言語別静的 HTML 生成 + GAS TTS
docs/repo-map.md:143:- 対象: `src/index.template.html`（inline CSS/JS）、`scripts/build-i18n-html.js` で 6 言語版 HTML 生成、Vercel カスタムドメイン運用
docs/repo-map.md:158:## src/index.template.html 関数マップ
docs/repo-map.md:160:`src/index.template.html`（単一ファイル構成。言語別生成物は `/{lang}/index.html`）内の主要関数一覧・行番号・
docs/CSS-CONVENTIONS.md:44:- **配置:** 別 CSS ファイル分離をしない。`src/index.template.html` の `<style>` を正とする
docs/CSS-CONVENTIONS.md:78:| Phase 3（2026-07-28〜29 UI 改修）後 | **195** | モーダル方式変更（`.info-page` の全画面→ scrim + 浮遊カード化）・フッター整理・ドリル系画面の新トークン移行で 228→195（`grep -c 'var(--legacy-' src/index.template.html` 実測） |
docs/data-contract.md:11:これらのパスは `src/index.template.html` に**ハードコード**されている（`<base href="/">` により言語サブディレクトリからもルート相対で解決）。
docs/data-contract.md:12:`src/index.template.html` を更新せずに移動しないこと。
docs/data-contract.md:23:| TTS | External `GAS_TTS_URL` in `src/index.template.html` → `gas/Code.gs` deployment |
docs/data-contract.md:222:**検証ガード**: `tools/validate_i18n.py` が local / CI（`.github/workflows/validate-i18n.yml`）の唯一のガード。`i18n/*.json` または `src/index.template.html` の i18n 参照を編集したら必ず実行:
docs/guardrails.md:99:**UI 仕様の正本は `src/index.template.html`(実装)。** `docs/claude-design/{sp,pc,design-system}.dc.html` は**凍結フレームカタログ**（画面一覧としての俯瞰用。pixel-perfect 精度は保証しない。更新義務なし）。
docs/guardrails.md:103:- 正本コード: `src/index.template.html` を read
docs/guardrails.md:114:`i18n/*.json` または `src/index.template.html` の i18n 参照を変更する場合、PR 作成前に必ず実行:
docs/LAUNCH-CHECKLIST.md:78:- [x] `src/index.template.html` に Vercel Analytics script タグ追加（Issue #43）
docs/LAUNCH-CHECKLIST.md:125:- [x] `src/index.template.html` 新規追加（既存 index.html から meta 部分をテンプレート化）（Issue #39）
docs/impact-ledger.md:4:Issue F（#174, EPIC #169）で確立。旧 `docs/repo-map.md`「src/index.template.html JS map」節はここに置換された。
docs/impact-ledger.md:11:`src/index.template.html`（~5,400L、~290 関数）の**静的解析**（正規表現 + 行範囲ベースの簡易スコープ判定であり、AST/コンパイラ相当の
docs/impact-ledger.md:25:| `line` | number | `src/index.template.html` 内の定義行番号（1-indexed。ソース変更のたびに生成器再実行で追従） |
docs/impact-ledger.md:105:生成器は `src/index.template.html` のみを読み取り専用で解析する（ソース自体は変更しない）。**冪等**（同一ソース入力に対し常に
docs/impact-ledger.md:112:`src/index.template.html` 内の関数を**追加・改名・移動**した実装エージェントは、当該 PR で `python3 scripts/gen_impact_ledger.py`
docs/doc-map.md:55:| UI 仕様の参照ポリシー | `docs/guardrails.md` §9 + `docs/claude-design/README.md` + `src/index.template.html`(正本) | exists | UI 改修運用変更時 |
docs/workflow.md:80:- **UI 仕様の参照**: UI 改修 Issue では `src/index.template.html`(正本) を根拠にする。`docs/claude-design/{sp,pc}.dc.html` は凍結フレームカタログ（画面一覧の俯瞰用、pixel-perfect 精度は保証しない）。見た目の確認は **Vercel branch preview URL** で行う。**外部 Claude Design(SaaS) の URL・zip・再開セッションは要求しない**(2026-07-28 に運用廃止)。詳細 `docs/claude-design/README.md`
docs/change-classification.md:80:UI 改修 Issue では、正本 `src/index.template.html` を根拠として提示する。`docs/claude-design/{sp,pc}.dc.html` は凍結フレームカタログ（画面一覧用、更新義務なし）。見た目の確認は Vercel branch preview URL。旧 CD 修正判定(A/B/C)は 2026-07-28 に廃止(`docs/guardrails.md` §9)。
.claude/skills/ux-brief/SKILL.md:25:- UI 仕様の正本は `src/index.template.html`。見た目の確認は Vercel branch preview URL で行う。
docs/vault-history/design-decisions.md:131:  - DOM 削除は `src/index.template.html` の該当セクション削除
docs/OPERATIONS.md:212:- 計測タグ埋め込み: Issue E1 / #43 で `src/index.template.html` の `</body>` 直前に追加、生成物 6 言語版すべてに反映
docs/OPERATIONS.md:216:`src/index.template.html` の `</body>` 直前に以下を配置:
docs/OPERATIONS.md:261:Vercel Web Analytics には公式のオプトアウト UI がなく（DNT 非対応、Cookie 不使用）、現行の script タグ直接埋め込み方式では `@vercel/analytics` パッケージの `beforeSend` フックも使えない。そのため `src/index.template.html` に localStorage ベースの除外機構を実装している（Issue #46）。
docs/OPERATIONS.md:404:UI 翻訳 JSON や `src/index.template.html` の i18n 参照を変更した場合は、Preview / Production デプロイ前にリポジトリ直下で以下を実行する。
docs/design/phase-1/brief-cluster-2-visual-language.md:233:- **`src/index.template.html`**: 単一 HTML template、Vercel Build で 6 言語 HTML 生成
docs/design/phase-1/brief-cluster-2-visual-language.md:277:### 現状の CSS 変数 (現行 `src/index.template.html`)
docs/design/phase-1/brief-cluster-2-visual-language.md:404:**目標**: Iteration 2-3 で `src/index.template.html` に反映可能な CSS + component patterns が確定、Cursor Issue として起票して Track A に反映。
docs/history.md:110:`docs/repo-map.md` §「src/index.template.html JS map」の行番号スナップショット: **2026-07-12** 時点。
docs/history.md:256:| 2026-07-16 | Phase 0 段階 2: 実装突合（正本 `src/index.template.html`、Exit→setup、footer/audioHint、SRS 重み、Connected CEFR/TTS 判断、Mode B DOM 名、i18n 169 leaf・orphan 13 削除） |
docs/design/phase-1/visual-tokens.md:45:Google Fonts import（`src/index.template.html` `<head>`、Phase 1-A で追加済み）:
docs/design/phase-1/visual-tokens.md:91:> **実装:** Phase 1-C は Button / 目的カード / Pill / Toggle を `src/index.template.html` に定義。**Progress meter と §4.6 IPA タイポは Phase 1-D**（本 snapshot には完全性のため含める）。
docs/design/phase-1/visual-tokens.md:371:| **Track A（現行）** | 単一ファイル `src/index.template.html` の `:root` にトークン定義。preprocessor 不採用。`--legacy-*` は Phase 1-H 完了まで残す |
docs/design/phase-0/phase-0-stage-2-doc-impl-reconciliation.md:50:| A-1 | 正本ファイル名: `src/index.template.html` (ルート `index.html` は F2 以降存在せず、build で `/{lang}/index.html` 生成) | P0 | dom §主ソース | SPEC 全体、CLAUDE.md、REPOSITORY-STRUCTURE.md (一部完了済) |
docs/design/phase-1/screen-data-mapping.md:5:> **調査対象:** `src/index.template.html`（md5 `65c30ff7797549b478a4c8db2f8f8702`）、`wordlist_GA_a1a2_plus_phonics.json`（5,397）、`data/connected_speech.json`（201）、`data/weak_forms.json`（36）。
docs/design/phase-1/screen-data-mapping.md:232:- `src/index.template.html` は **未変更**（md5 前後一致: `65c30ff7797549b478a4c8db2f8f8702`）
docs/design/phase-1/kickoff-claude-design-prompt.md:118:src/index.template.html
docs/design/phase-1/kickoff-claude-design-prompt.md:121:`src/index.template.html` は現状の SPA 正本ファイルです。現行 UI 構造を確認するために取得してください。
docs/design/phase-1/kickoff-claude-design-prompt.md:381:Naoya が Cursor 経由で `src/index.template.html` に反映できる HTML/CSS の形にする。**Plain HTML + CSS + Vanilla JS** (フレームワークなし)。
docs/design/phase-1/kickoff-claude-design-prompt.md:419:2. GitHub MCP から `src/index.template.html` と `docs/design/tagline-candidates.md` を取得
docs/design/ux-issues-2026-07.md:96:- Recon で判明: `src/index.template.html` に一部インライン style が残存 (Mode B heads 等)、デザイントークン化されていない
docs/design/phase-1/brief-cluster-1-top-page.md:255:- **静的 HTML**: `src/index.template.html` (single template) → Vercel Build で 6 言語 HTML 生成
docs/design/phase-1/brief-cluster-1-top-page.md:353:- **HTML + CSS** (静的、React コンポーネントではなく plain HTML): Claude Design のアウトプットは HTML/CSS で受け取り、Naoya さんが `src/index.template.html` に手動 or Cursor Issue で反映
docs/design/phase-1/design-tokens.md:9:summary: Phase 1 UI/UX (Variation B「音を、美しく。」/ Mood B / Warm Contemporary) の視覚言語トークンの source of truth。Claude Design 出力 (`Kickoff_design_prompt2.zip` 内 `IPA Sound Drill - Phase 1.dc.html` § デザインガイドライン + ドリル section) から抽出。カラー 11 変数、タイポ 3 系統、spacing / radius / shadow、基本コンポーネント 5 種の CSS 定義を集約。Phase 1-A で `src/index.template.html` の `<style>` に追加、Phase 1-B 以降で参照。既存 `--signal` 等は legacy prefix (`--legacy-*`) に退避し、既存規則の見た目は据え置き (解釈 i レガシー退避方式)。
docs/cursor/recon/pre-issue-recon-20260716-index-html-functions.md:7:| 主ソース | `src/index.template.html`（ルート `index.html` 無し） |
docs/cursor/recon/pre-issue-recon-20260716-index-html-functions.md:145:- 編集正本は常に `src/index.template.html`
docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md:7:| **主ソース（行番号）** | **`src/index.template.html`** |
docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md:8:| 補足 | ルート `index.html` は **存在しない**（F2 以降は `src/index.template.html` → build → `/{lang}/index.html`）。生成物 `en/index.html` と構造は同等（head meta 差分のみ） |
docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md:112:1. 正本パスは **`src/index.template.html`**（ルート `index.html` なし）  
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:53:### 5. src/ ディレクトリ
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:57:→ F2 の `src/index.template.html` 新規追加はディレクトリごと作成で問題なし（既存衝突なし）。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:115:1. **グリーンフィールドに近い。** `vercel.json` / `package.json` / `src/` / 言語別ディレクトリ / middleware はすべて未使用で、Phase 5 想定の新規ファイル群と既存資産の直接衝突はほぼ無い。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:130:1. **新規追加は概ね安全:** `vercel.json`, `package.json`, `src/index.template.html`, `scripts/build-i18n-html.js`, `middleware.ts`（任意）, `/en/`…`/fil/` は既存と非衝突。
docs/cursor/recon/pre-issue-recon-20260716-index-html-i18n-css-storage.md:7:| 主ソース | **`src/index.template.html`**（ルート `index.html` 無し） |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:8:| 正本 UI | `src/index.template.html` |
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:18:- `src/index.template.html`: Decode/Encode/Mode B Quiz の near、`lev`、`res-near` CSS を削除（ok/bad のみ）
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:27:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:34:- ブラックリスト: `data/**`、`docs/cursor/instructions/**`、`docs/reference/**`、`docs/design/**` は未編集。near 削除のため `src/index.template.html` のみコード触手（ルート `index.html` は手編集せず）
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:42:- near grep（`src/index.template.html`）: `\bnear\b` / `levenshtein` / `function lev` / `res-near` / `"near"` → ヒット 0
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:50:- near 削除は Claude Comment でスコープ拡大。正本は `src/index.template.html`
docs/cursor/reports/cursor-implementation-report-phase-1-b-top-page.md:38:src/index.template.html
docs/cursor/reports/cursor-implementation-report-f3-sitemap-robots-llms.md:33:- F2 成果物（`src/index.template.html` / build / middleware / vercel.json）: 不変
docs/cursor/reports/cursor-implementation-report-g2-legal-footer.md:14:- `src/index.template.html`: footer に Feedback → Terms → Privacy → X の順でリンク追加
docs/cursor/reports/cursor-implementation-report-g2-legal-footer.md:21:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-e1-vercel-analytics.md:14:- `src/index.template.html` の `</body>` 直前に `<script defer src="/_vercel/insights/script.js"></script>` を追加
docs/cursor/reports/cursor-implementation-report-e1-vercel-analytics.md:21:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-e1-vercel-analytics.md:38:- `src/index.template.html`: `_vercel/insights/script.js` 1 件（`</body>` 直前）
docs/cursor/reports/cursor-implementation-report-e1-vercel-analytics.md:54:- LAUNCH-CHECKLIST 旧文言の `index.html` は F2 後の正本に合わせ `src/index.template.html` と明記
docs/cursor/reports/cursor-implementation-report-index-html-ui-audit-recon.md:10:UI/UX 抜本見直し Phase 0 の基盤 Recon。ルートに巨大 `index.html` は無くなったため、正本 `src/index.template.html`（生成物 `/{lang}/index.html`）を機械抽出し、Claude が SPEC/DESIGN 突合（段階 2）に使える 3 分割レポートを追加する。コード変更禁止。
docs/cursor/reports/cursor-implementation-report-index-html-ui-audit-recon.md:42:- `src/index.template.html` md5: **不変**（開始前後 `4be324de0bd70260e8e60855cbf1e19c`）
docs/cursor/reports/cursor-implementation-report-index-html-ui-audit-recon.md:77:- [x] `src/index.template.html` 不変  
docs/cursor/reports/cursor-implementation-report-i2-cta-mobile.md:37:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-e2-tally-x-footer.md:14:- `src/index.template.html`: wrap 末尾に `site-footer`（Feedback + X）を新設、insights 直後に Tally embed.js を追加。プレイ中は footer 非表示
docs/cursor/reports/cursor-implementation-report-e2-tally-x-footer.md:21:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-g1-legal-docs.md:47:- 既存機能への影響: `src/index.template.html`、runtime data contract 8 パス、`i18n/`、`data/`、`scripts/`、`tools/`、`gas/` は未変更
docs/cursor/reports/cursor-implementation-report-step4b.md:41:| 方針 | `w` をキーに突き合わせ、**neighbors のみ上書き**。他フィールド（w/ipa/cefr/pos/src/pattern/group/gloss）は本番を正とする |
docs/cursor/reports/cursor-implementation-report-cs-rule-3-languages.md:33:- `src/index.template.html` / i18n / wordlist: 未変更
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:86:src/index.template.html
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:10:Track A ローンチに向け、単一 HTML + JS 動的 meta ではクローラーに多言語 SEO が届かない問題を解くため、6 言語サブディレクトリへの静的 HTML プリレンダと Vercel Build / middleware を導入する。先行整備（#33 分類軸、#35 パターン C、#37 Build rollback）の上で、パターン C の初適用として `index.html` を `src/index.template.html` に移動し、生成物は `.gitignore` 管理外とする。
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:14:- Phase 1: `git mv index.html` → `src/index.template.html`（pure move、md5 一致）
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:23:- index.html → src/index.template.html (R)
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:59:| Category A 参照 | `src/index.template.html` / `build-i18n-html.js` / `middleware.ts` 記載済み |
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:84:- 以降の HTML 編集は `src/index.template.html` のみ（dev-flow 追記済み）
docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md:69:src/index.template.html
docs/cursor/reports/cursor-implementation-report-modal-escape-support.md:14:- `src/index.template.html`: 統合 `keydown` リスナー `onModalEscapeKey` を追加
docs/cursor/reports/cursor-implementation-report-modal-escape-support.md:23:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-va-opt-out.md:14:- `src/index.template.html`: Analytics script 直前に `va-disable` / `va-enable` IIFE を追加
docs/cursor/reports/cursor-implementation-report-va-opt-out.md:20:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-va-opt-out.md:37:- `src/index.template.html`: `va-disable` / `insights/script.js` 存在、IIFE が insights 直前
docs/cursor/reports/cursor-implementation-report-phase-1-d-pr2-drill-2c-2d.md:44:src/index.template.html
docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md:16:- 正本を `src/index.template.html` に統一（`index.html` 参照を修正）
docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md:56:- `src/index.template.html` md5: **不変** `4be324de0bd70260e8e60855cbf1e19c`
docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md:70:- `validate_i18n.py` の HTML パスを `src/index.template.html` へ更新する chore は別 Issue 候補
docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md:90:- [x] `src/index.template.html` 不変
docs/cursor/reports/cursor-implementation-report-phase-1-d-pr1-drill-2a-2b.md:49:src/index.template.html
docs/cursor/reports/cursor-implementation-report-phase-1-e-pr1-vocab-symbol.md:47:src/index.template.html
docs/cursor/reports/cursor-implementation-report-i1-english-copy.md:18:- `src/index.template.html`: 変更なし（hardcoded は i18n フォールバック、Feedback/X は E2 意図どおり英語固定）
docs/cursor/reports/cursor-implementation-report-personas-and-tagline-candidates.md:31:- Runtime / i18n / wordlist / `src/index.template.html`: 未変更
docs/handoff/pending-tasks.md:57:- Cursor Issue 起票 → `src/index.template.html` に反映のフロー確定
docs/handoff/pending-tasks.md:99:  - `src/index.template.html` の全面リファクタリング
docs/handoff/pending-tasks.md:168:   - 現状 root `index.html` を参照するため FileNotFound、`src/index.template.html` に修正
docs/handoff/2026-07-19_chat-handoff-phase-1-a-c.md:56:- `src/index.template.html` (Mood B `:root` + `--legacy-*` 並存、`#purposeStub` / `.profile-3a` 実装、`prev_settings_v1` / `ept_marks_v1` / migration)
docs/handoff/claude-design-integ-handoff.md:19:- ソース単一ファイル: `src/index.template.html`（約5400行）。
docs/handoff/claude-design-integ-handoff.md:32:**次セッションの最初の仕事は、この食い違いを Naoya に確認して確定させること。** 「history.md の退役 framing」と「Naoya の登録漏れ判断」のどちらが各 ID の実態かを、実ソース `src/index.template.html` の該当挙動を根拠に 1 件ずつ判定する（3 つを一括で扱わない。3e/3f/3g で実態が異なる可能性が高い）。判定後にのみ、生きている ID を features へ昇格・レジストリ拡張し、退役なら history.md の記述を正として残す。
docs/handoff/claude-design-integ-handoff.md:56:整合は「デザイン（`.dc.html`）↔ `docs/features/<id>.md`（WHAT）↔ 実装 `src/index.template.html`」の 3 者で取り、乖離は `DIVERGENCE.md` に記録する既存フローに従う。
docs/handoff/claude-design-integ-handoff.md:60:- ゾーン規約: 運用ゾーン（`.claude/**`, `CLAUDE.md`, `docs/**`, `.cursor/**`, `.github/**`）と開発ゾーン（`src/**`, `i18n/**`, `data/**`, `scripts/**`, `tools/**`, `gas/**`）を 1 PR で混在させない。3e/3f/3g 昇格は運用ゾーン（docs）中心。挙動確認で `src/` を読むのは可、変更するなら別 PR。
docs/handoff/claude-design-integ-handoff.md:73:7. 実挙動の根拠として `src/index.template.html`（3e/3f/3g 該当箇所・phoneme `t` フラグの使用箇所）
docs/handoff/current-state.md:494:- **`src/index.template.html` 分割の検討**: 235KB 単一ファイルが Rv の構造的障壁。L3 調査 Issue
docs/handoff/current-state.md:502:- 実装本体: `src/index.template.html`(235KB、インライン JS)
docs/features/3c.md:10:- **既知の乖離（2026-07-29 突合時点）**: `3b` の絞り込み UI は `.vocab-ipa-filter`（IPA キーボードをインライン統合、`vocabIpaFilterBar`）に置き換わっており、`#/vocab/ipa` へ遷移する UI トリガー（旧 Sticky filter の Segmented「IPA」ボタン等）は `src/index.template.html` 内に見当たらない。ルート定義・DOM・関数 (`showSymbolPickerView`) 自体はコード上に温存されているが、現行 UI からは到達不能な可能性が高い（hash 直打ちでのみ到達）。要 Naoya 確認・別 Issue で扱う
docs/claude-design/PARITY-CATALOG.md:89:`src/index.template.html` の `:root` に**2組のトークンが併存**し、多くが**別の値**:
docs/claude-design/README.md:4:UI 仕様の正本は `src/index.template.html`(実装)。ここの `.dc.html` は「この画面にはどういう状態がある」を俯瞰する**凍結フレーム一覧**です。
docs/claude-design/README.md:8:1. **`src/index.template.html` が正、`.dc.html` は凍結フレームカタログ**（pixel-perfect 精度は追求しない。画面一覧としての価値のみ残す）
docs/claude-design/README.md:33:- **正本コード確認**: `src/index.template.html`（CSS + HTML + JS すべて含む）
docs/claude-design/README.md:58:- **UI 仕様の正本は `src/index.template.html`**。`.dc.html` は画面一覧用で、見た目の正確性は保証しない
docs/handoff/2026-07-26_chat-log-epic-169-followups.md:30:- ドキュメント再編とは**無関係**（`src/index.template.html` は 07-24、`vercel.json` は 07-12 が最終更新で EPIC は未接触、リポに DNS 制御ファイル無し）。
docs/claude-design/UPDATE-GUIDE.md:3:> **このガイドは 2026-07-28 に廃止されました。** UI 仕様の正本は `src/index.template.html`(実装) に一本化しています。
docs/claude-design/cd-updates/2026-07-28_cd-catchup-round3.md:15:**app 側（`src/index.template.html`）が正。** Claude Design は SP/PC/Design-System の Dc を app に一致させる方向で更新する。逆方向（CD → app）の反映は今回は不要。
docs/claude-design/update-log.md:8:| 2026-07-29 | sp.dc.html, pc.dc.html, design-system.dc.html | **運用切替**: CD SaaS 廃止 → app(`src/index.template.html`) を正本、`.dc.html` はスナップショット化。3 ファイルを Phase-3 round-1〜5 の現行 UI に一致するよう Claude Code が全面書き直し。SP は 17 フレーム(1a-ja/en/ko/zh-CN/zh-TW/fil + 3a/2a/2b/2c/2d/2a-answered/3b/3d/3e/3f/3h)、PC は 11 フレーム、design-system は tokens + Modal placement + Drill accent badge + A-Z card + 2-pane drill + IPA info modal を追加。旧 favicon showcase は削除(favicon.svg は同ディレクトリに残置) |
docs/handoff/2026-07-27_cd-parity-handoff.md:125:- #164 変更ファイル: `src/index.template.html`(+96/-17 の **PC UI**)、`docs/claude-design/pc.dc.html`(+5/-5)、`docs/LAUNCH-CHECKLIST.md`、agent-report。
docs/agent-reports/codex-issue-124-i18n-parity-ci.md:16:- 既存 Track A 構造に合わせ、HTML 参照元を `src/index.template.html` に修正。
docs/agent-reports/codex-issue-124-i18n-parity-ci.md:40:- 実装中の自己判断による追加変更: あり。現行 `src/index.template.html` に fallback 付きで存在する `audio_tap_hint` は i18n key として未定義のため、既存挙動維持として参照欠落チェックの許容リストに入れた。
docs/agent-reports/codex-issue-124-i18n-parity-ci.md:58:- 既存 `tools/validate_i18n.py` は F2 後の構成とずれており、存在しない `index.html` を読みに行っていたため、`src/index.template.html` に修正した。
docs/claude-design/cd-updates/README.md:5:2026-07-28 に Claude Design(外部 SaaS) を UI 仕様の正本として使う運用は廃止しました。UI 仕様の正本は `src/index.template.html`(実装)、リファレンススナップショットは `docs/claude-design/{sp,pc,design-system}.dc.html` です。詳細は `docs/claude-design/README.md` を参照。
docs/claude-design/cd-updates/README.md:11:- UI 議論は本リポ内の `.dc.html` を見ながら行い、合意したら実装 (`src/index.template.html`) を書き換える
docs/agent-reports/cursor-issue-147-pc-cd-compliance.md:39:- src/index.template.html (M)
docs/features/screen-inventory.md:7:`src/index.template.html` 実装が正本。CSS: ~L90-1035、HTML: ~L1080-1650、JS: ~L1760-5876。
docs/features/screen-inventory.md:103:- 本ファイルに列挙した全 DOM セレクタは `src/index.template.html` 内に実在することを `grep` で確認済み（テスト観点）
docs/agent-reports/cursor-issue-128-align-sp-claude-design.md:30:| B5 | `src/index.template.html` + i18n + LAUNCH-CHECKLIST | 準拠 |
docs/agent-reports/cursor-issue-128-align-sp-claude-design.md:47:- src/index.template.html (M)
docs/agent-reports/cursor-issue-128-align-sp-claude-design.md:72:- Issue ホワイトリストの `index.html`/`js/` は現行では `src/index.template.html`（インライン JS）が正
docs/agent-reports/cursor-issue-150-pc-compliance-followup.md:34:- src/index.template.html (M)
docs/agent-reports/cursor-issue-149-phase-1-f.md:36:- src/index.template.html (M)
docs/agent-reports/claude-code-session-2026-07-29-cd-parity-phase3.md:17:3. **サービス資料の実装乖離**: feature spec 全13 ID + supporting specs（data-contract, CSS-CONVENTIONS, design input docs）を `src/index.template.html` と突合して修正。React 化デグレ確認用の `screen-inventory.md` を新規作成。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:13:- `src/index.template.html`（~5,411L、~290 関数）の call-graph を静的解析し、シンボル単位の scope/影響範囲を機械生成する `impact-ledger.json` + プロトコル `impact-ledger.md` + 生成器 `gen_impact_ledger.py` を新設し、D で `repo-map.md` に一時退避した JS 関数マップを置換する。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:18:- `scripts/gen_impact_ledger.py` を新規作成: `src/index.template.html` の main `<script>` ブロックを検出し、`function name(` / `async function name(` （任意インデント、ネスト関数含む）と `const name = (...) => ` 形式（括弧なし単一引数含む。`$` / `show` をカバー）で全シンボルを抽出。列0の関数宣言行を境界とする簡易スコープ判定で「どのトップレベル関数の中の行か」を行単位にマッピングし、各シンボルへの呼び出し箇所（テキスト一致 `name(`）の呼び出し元関数名を 13 エリア語彙（decode/encode/study/connected/profile/vocab/picker/progress/about/reveal/summary/top/infra）へ分類（`EXACT_AREA` 明示辞書 — 旧 `repo-map.md` JS map の分類を継承 — → `PREFIX_RULES` 前方一致フォールバック → `infra` デフォルト）。`caller_areas` の要素数で `scope`（library=5+/shared=2-4/primary=0-1）を判定し、`AREA_TO_FEATURE` で凍結 12 ID レジストリのみへ `feature_ids` を絞り込む（`infra`・未登録概念は feature_id を持たない）。`depends_on` は本体内で呼び出す他の台帳シンボルをベストエフォートで収集。`activeIpa` のみ `SEED_OVERRIDES` で Issue 本文の worked example をそのまま固定（直接呼び出しグラフだけでは TTS/accent 系の共有ヘルパー経由の間接波及を検出できないため）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:22:- `docs/repo-map.md`: 「src/index.template.html JS map」節（186 行、13 サブセクションの手動関数一覧）を削除し、`docs/impact-ledger.json`/`docs/impact-ledger.md` へのポインタ（5 行）に置換。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:54:- **`src/index.template.html` は一切変更していない**（読み取り専用の解析対象。`git status --short` に同ファイルが出現しないことを確認）。他の `src/**` / `i18n/**` / `data/**` / `tools/**` / `gas/**` にも触れていない。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:77:- 既存機能への影響: なし（`src/index.template.html` 不変、ドキュメント・生成物のみ）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:91:- `src/index.template.html` の関数を追加・改名・移動する実装エージェントは、当該 PR で `python3 scripts/gen_impact_ledger.py` を再実行し `docs/impact-ledger.json` の差分をコミットに含める義務がある（`docs/impact-ledger.md` §6）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:112:- [x] Runtime data contract 8 パスへの影響なし（`src/index.template.html` を含む実体ファイルは一切不変、解析のみ）
docs/agent-reports/cursor-issue-145-ops-improvements.md:33:- 変更は docs / governance のみ。Runtime data contract・`src/`・i18n・ビルドに未着手
docs/agent-reports/codex-issue-141-progress-card-pool-count.md:23:- src/index.template.html (M)
docs/agent-reports/codex-issue-141-progress-card-pool-count.md:29:- Runtime code の変更は Issue 指定の `src/index.template.html` のみに限定し、必須実装レポートだけを追加した
docs/agent-reports/codex-issue-142-production-favicon.md:16:- `src/index.template.html` のheadに `rel="icon"` / `type="image/svg+xml"` / `href="/favicon.svg"` を追加した
docs/agent-reports/codex-issue-142-production-favicon.md:24:- src/index.template.html (M)
docs/claude-design/support.js:1:// GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with `cd dc-runtime && bun run build`.
docs/claude-design/support.js:8:  // src/react.ts
docs/claude-design/support.js:23:  // src/parse.ts
docs/claude-design/support.js:85:  // src/boot.ts
docs/claude-design/support.js:202:  // src/expr.ts
docs/claude-design/support.js:296:  // src/encode.ts
docs/claude-design/support.js:414:  // src/compile.ts
docs/claude-design/support.js:746:  // src/logic.ts
docs/claude-design/support.js:783:  // src/component.ts
docs/claude-design/support.js:1065:  // src/bundled.ts
docs/claude-design/support.js:1072:  // src/cdn.ts
docs/claude-design/support.js:1085:  // src/external.ts
docs/claude-design/support.js:1286:  // src/atomics.ts
docs/claude-design/support.js:1292:  // src/helmet.ts
docs/claude-design/support.js:1427:  // src/pseudo.ts
docs/claude-design/support.js:1448:  // src/registry.ts
docs/claude-design/support.js:1478:  // src/runtime.ts
docs/claude-design/support.js:1648:  // src/stream-state.ts
docs/claude-design/support.js:1674:  // src/index.ts
docs/agent-reports/codex-issue-120-learning-status.md:33:- src/index.template.html (M)
docs/agent-reports/codex-issue-122-about-expansion.md:13:- Runtime source of truth: `src/index.template.html`.
docs/agent-reports/codex-issue-122-about-expansion.md:69:The repository validator cannot currently complete as written because it still targets the removed root `index.html`; this is the same pre-existing limitation recorded in the Issue #120 implementation report. Running its A/B/D/E logic equivalently against the source of truth `src/index.template.html` produced:
docs/agent-reports/codex-issue-161-pc-quality.md:27:- src/index.template.html (M)
docs/agent-reports/claude-code-issue-173-design-layer-split.md:72:- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, `.github/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:59:- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:60:- ランタイム契約 8 パスの実体ファイル（`wordlist_GA_a1a2_plus_phonics.json` / `data/*.json` / `i18n/*.json` / `fonts/*` / `src/index.template.html`）は変更していない。ドキュメント上の契約記述の移設のみ。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:69:- 完了定義「`repo-map.md` の JS map 節に『F で置換予定』注記がある」: `docs/repo-map.md` §「src/index.template.html JS map」冒頭に "⚠️ 本節は Issue F の `docs/impact-ledger.json` が置換予定" を明記。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:85:- Issue F（impact-ledger）は `docs/repo-map.md` の「src/index.template.html JS map」節を `docs/impact-ledger.json` への参照に置換する（本 Issue で置換予告の注記を追加済み）。
docs/logs/2026/07/2026-07-13_track-a-launch-prep-uiux-pivot.md:106:   - Claude が MCP で `src/index.template.html` を取得して現状把握
docs/logs/2026/07/2026-07-13_track-a-launch-prep-uiux-pivot.md:217:3. `src/index.template.html` を取得して現状 UI/UX 把握
.github/workflows/validate-i18n.yml:8:      - 'src/index.template.html'
.github/workflows/validate-i18n.yml:15:      - 'src/index.template.html'
```

---

## 3. Grep B: `data/` ルート JSON 参照

```
grep -rn "wordlist_GA_a1a2_plus_phonics\|connected_speech\.json\|weak_forms\.json\|guide\.json\|data/" --include="*.md" --include="*.json" --include="*.js" --include="*.ts" --include="*.html" --include="*.py" .
```

ヒット 939 件（全件、省略なし）:

```
tools/merge_def.py:2:"""Merge def (English definitions) into wordlist_GA_a1a2_plus_phonics.json."""
gas/README.md:99:| `BatchWords.gs` | 語彙リスト（`scripts/export_batch_words.py` で生成。入力: `data/derived/wordlist_with_neighbors_slim.json`） |
tools/gen_audit_docs.py:238:        f"> 生成日: {GEN_DATE} ／ 対象: `wordlist_GA_a1a2_plus_phonics.json`",
tools/archive/review-vntv.html:139:    const res = await fetch("../../data/pipeline/phase2a_review_needed.json");
.claude/agents/pr-reviewer.md:84:  開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）を
docs/tts-design.md:117:| 機械抽出リスト | `data/pipeline/phase2a_review_needed.json`（127 語） |
docs/tts-design.md:118:| 作業用リスト（拡張） | `data/pipeline/r4_pending_review_list.json` / `.csv` |
docs/repo-map.md:25:| **Production wordlist** | `wordlist_GA_a1a2_plus_phonics.json` at repo root（現況は `docs/history.md`） |
docs/repo-map.md:26:| **Pipeline** | `scripts/*.py` read/write `data/pipeline/` staging JSON, merge into wordlist（コマンドは `docs/pipeline.md`） |
docs/repo-map.md:27:| **Batch imports** | `data/batches/` — Phase 1/2 merge sources（`data/batches/README.md`） |
docs/repo-map.md:40:**Data folder map:** `data/README.md` — runtime / batches / pipeline / derived / patches / archive の見分け方。
docs/repo-map.md:62:├── wordlist_GA_a1a2_plus_phonics.json   # ★ PRODUCTION wordlist（runtime fetch・ルート固定）
docs/repo-map.md:63:├── wordlist_GA_a1a2_plus_phonics.csv    # CSV export（pipeline / i18n tooling）
docs/repo-map.md:65:├── data/
docs/repo-map.md:66:│   ├── README.md              # ★ data/ 配下の役割分担（AI 向け）
docs/repo-map.md:67:│   ├── connected_speech.json  # ★ RUNTIME
docs/repo-map.md:68:│   ├── weak_forms.json        # ★ RUNTIME
docs/repo-map.md:69:│   ├── guide.json             # ★ RUNTIME
docs/repo-map.md:172:| Production wordlist | **Root** `wordlist_GA_a1a2_plus_phonics.json` |
docs/repo-map.md:173:| Neighbors slim（merge 元） | `data/derived/wordlist_with_neighbors_slim.json` |
docs/repo-map.md:174:| Phase 2 staging | `data/pipeline/`（not root, not runtime） |
docs/repo-map.md:175:| R4 作業 CSV/JSON | `data/pipeline/r4_pending_review_list.*`（**not** `docs/reference/`） |
docs/data-contract.md:16:| Wordlist | `wordlist_GA_a1a2_plus_phonics.json` |
docs/data-contract.md:17:| Connected speech | `data/connected_speech.json` |
docs/data-contract.md:18:| Weak forms | `data/weak_forms.json` |
docs/data-contract.md:19:| Guide | `data/guide.json` |
docs/data-contract.md:30:## 2. wordlist スキーマ — `wordlist_GA_a1a2_plus_phonics.json`
docs/data-contract.md:80:**パイプライン補足:** narrow IPA 候補・respelling のステージング JSON は `data/pipeline/`。バッチソースは `data/batches/`。コマンド詳細は `docs/pipeline.md`。
docs/data-contract.md:159:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/data-contract.md:168:### `data/connected_speech.json`（201句）
docs/data-contract.md:174:### `data/weak_forms.json`（36語）
docs/data-contract.md:178:### `data/guide.json`
docs/data-contract.md:266:| `wordlist_GA_a1a2_plus_phonics.json` | 総語数・CEFR 別内訳の再カウント |
docs/data-contract.md:269:| `data/connected_speech.json` | 総フレーズ数・CEFR バッジ整合性 |
docs/data-contract.md:270:| `data/weak_forms.json` | 総エントリ数、type=weak の出題確認 |
docs/pipeline.md:22:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/pipeline.md:33:**Do not run** `merge_rp_ipa.py` on production wordlist（`connected_speech.json` を上書きする既知バグ）。
docs/pipeline.md:45:Staging outputs → `data/pipeline/`。Neighbors / RP progress → `data/derived/`。Merge scripts write `wordlist_GA_a1a2_plus_phonics.json`。
docs/pipeline.md:51:1. Receive `phase2_mN_*_with_gloss.json`（`rp_ipa` 同梱）→ `data/batches/`
docs/pipeline.md:54:4. Verify counts; sync `data/derived/rp_progress.json` from wordlist
docs/pipeline.md:65:| 高 | 欠落必須語・屈折形パッチ | 主要語追加済み（`data/*_patch.json`） |
docs/OPERATIONS.md:25:   - JSON ファイルの構文エラー（`wordlist_GA_a1a2_plus_phonics.json` の破損）
README.md:32:| `data/README.md` | `data/` 配下（runtime / batches / pipeline / derived）の見分け方 |
README.md:39:| `wordlist_GA_a1a2_plus_phonics.json` | 本番語彙（ルート・ランタイム読込） |
README.md:40:| `data/connected_speech.json` | 連結句 201 |
README.md:41:| `data/weak_forms.json` | 弱形 36 |
README.md:42:| `data/batches/` | 語彙マージ入力 JSON |
README.md:43:| `data/pipeline/` | narrow IPA / respelling ステージング |
README.md:44:| `data/derived/` | neighbors・RP IPA 進捗 |
docs/doc-map.md:60:| data/ 配下の役割分担 | `data/README.md` | exists | data/ 役割変更時 |
docs/history.md:51:- R4 pending 累計: **127 語**（`data/pipeline/r4_pending_review_list.*`）
docs/history.md:92:| `data/connected_speech.json` | 201 | `cefr` + `ga_rp_same`; vocab browser Phrases タブに CEFR バッジ表示 |
docs/history.md:93:| `data/weak_forms.json` | 36 | 同上; 練習時 Connected Speech Type=weak で出題 |
docs/history.md:124:| 2026-07-10 | v3.20 | Phase 2 M2 完了（B2 +569、総 5,397）。進捗チェック（`ept_checks_v1`）、Phrases CEFR バッジ、`dignify` RP ホットフィックス。リポジトリ README 整備（`data/README.md` 等）。 |
docs/history.md:128:| 2026-07-09 | v3.11 | リポジトリ構成を整理（`data/batches`・`data/pipeline`・`data/patches`・`docs/cursor` 等）。`docs/REPOSITORY-STRUCTURE.md` 追加（**Issue #172 でこの旧ファイルは retire、内容は data-contract/tts-design/pipeline/repo-map/history へ移設**）。`scripts/paths.py` でパス正本化。 |
docs/history.md:264:| 2026-07-09 | v3.11 リポジトリ構成整理（`data/batches`・`pipeline`・`patches`、`docs/cursor`）。語数 4,439・B1=1,727。連結/弱形 `cefr`。`REPOSITORY-STRUCTURE.md` 追加。 |
tools/merge_cs_rule_fil.py:10:"""Merge cs_rule.fil into connected_speech.json and weak_forms.json."""
tools/archive/README.md:14:Note: `review-vntv.html` fetches `data/pipeline/phase2a_review_needed.json` (relative to repo root via `../../data/pipeline/`).
docs/guardrails.md:44:| 4 | Runtime data contract の不変 | `data/*.json` 等の実行時契約が意図せず変更されていないか |
docs/bug-knowledge.md:20:| **i18n 漏れ** | 6言語のうち一部で key が欠落、または翻訳誤り | `guide.json` の `zh-Hans` が英語のまま |
docs/design/phase-0/phase-0-stage-2-doc-impl-reconciliation.md:117:| D-8 | C1: `lvl.c1` i18n あり、ランタイム CEFR に C1 なし (`data/batches/gap_c1_new.json` 1,015 候補) | P2 | Pipeline✓ Runtime✗ | halfbaked §1.5 |
docs/cursor/instructions/cursor-instructions-connected-weak-cefr-badges.md:5:- 前提: `data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）に `cefr` フィールドが既に付与済み（2026-07-09 完了）
docs/vault-history/design-decisions.md:65:- **決定**: C1 語彙 1,015 語候補 (`data/batches/gap_c1_new.json`) の投入は Track B (React 化以降)
docs/vault-history/design-decisions.md:506:- `scripts/validate-cefr-tags.py` 新規、`wordlist_GA_a1a2_plus_phonics.json` + optional (`data/connected_speech.json` / `data/weak_forms.json`)
docs/vault-history/design-decisions.md:519:- ブラックリスト md5 前後一致: CLAUDE.md / REPOSITORY-STRUCTURE.md / CHANGE-CLASSIFICATION.md / DEV-GUARDRAILS.md / OPERATIONS.md / CSS-CONVENTIONS.md / screen-data-mapping.md / wordlist_GA_a1a2_plus_phonics.json / connected_speech.json / weak_forms.json すべて OK
docs/vault-history/design-decisions.md:591:- ブラックリスト 12 ファイル md5: 完全不変 (`CLAUDE.md` / `PURPOSE.md` / `SPECIFICATION.md` / `REPOSITORY-STRUCTURE.md` / `CHANGE-CLASSIFICATION.md` / `DEV-GUARDRAILS.md` / `OPERATIONS.md` / `CSS-CONVENTIONS.md` / `screen-data-mapping.md` / `wordlist_GA_a1a2_plus_phonics.json` / `data/connected_speech.json` / `data/weak_forms.json`)
docs/cursor/instructions/cursor-instructions-phase1-m2.md:33:1. `phase1_m2_400_with_gloss.json`（400エントリ）を `wordlist_GA_a1a2_plus_phonics.json` にマージ
docs/cursor/instructions/cursor-instructions-phase1-m2.md:54:main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m2.md:71:json.dump(main, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-phase1-m2.md:90:git diff --stat wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-phase1-m2.md:99:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m2.md:137:  - wordlist_GA_a1a2_plus_phonics.json (+400 entries, gloss complete)
docs/cursor/instructions/cursor-instructions-phase1-m2.md:141:  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)
docs/cursor/instructions/cursor-instructions-phase1-m3.md:22:1. `phase1_m3_400_with_gloss.json`（400エントリ）を `wordlist_GA_a1a2_plus_phonics.json` にマージ
docs/cursor/instructions/cursor-instructions-phase1-m3.md:43:main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m3.md:60:json.dump(main, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-phase1-m3.md:82:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m3.md:120:  - wordlist_GA_a1a2_plus_phonics.json (+400 entries, gloss complete)
docs/cursor/instructions/cursor-instructions-phase1-m3.md:124:  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)
docs/cursor/instructions/cursor-instructions-fix-merge-respelling.md:47:3. 簡単なテスト: 現状のリポジトリで `python3 scripts/merge_respelling.py` を（新規マージなしで）再実行し、`git diff --stat wordlist_GA_a1a2_plus_phonics.json` が **無変更**であることを確認（idempotent であるべき）
docs/cursor/instructions/cursor-instructions-fix-merge-respelling.md:65:以上、修正完了後に Phase 1 M3 の指示書を送ります。この修正自体は `wordlist_GA_a1a2_plus_phonics.json` のデータを変更するものではなく、スクリプトロジックの修正のみです（今回変更不要なら、次回のマージ時に効果を発揮します）。
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:19:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:48:git add data/batches/phase2_m2c_100_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:49:        wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:50:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:51:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:52:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:53:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:30:cp wordlist_GA_a1a2_plus_phonics.json /tmp/wordlist_pre_phase_r.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:31:cp data/pipeline/ga_rp_same_report.json /tmp/ga_rp_same_report_pre_phase_r.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:40:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:192:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:209:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:229:git checkout -- wordlist_GA_a1a2_plus_phonics.json data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:261:        wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:262:        data/connected_speech.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:263:        data/weak_forms.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:264:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:336:Also updates data/connected_speech.json and data/weak_forms.json (should be no-op
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:500:- 差が大きい場合、まず `git checkout -- wordlist_GA_a1a2_plus_phonics.json` で rollback してから Claude に報告。
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:514:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:526:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:545:        wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:546:        data/connected_speech.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:547:        data/weak_forms.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:548:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:853:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:856:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:871:        wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:872:        data/connected_speech.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:873:        data/weak_forms.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:874:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:902:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:914:after = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1022:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1023:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1026:        wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1058:### Q2: Phase R2 の `fix_happy_i.py` は、`connected_speech.json` と `weak_forms.json` も対象にしているが、期待値は「0 corrections」となっている。なぜ両方を走査する必要があるのか？
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1146:- `wordlist_GA_a1a2_plus_phonics.json`（91語 rp_ipa 修正 + ga_rp_same/reason 再付与）
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1147:- `data/connected_speech.json`（ga_rp_same_reason 再付与のみ）
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1148:- `data/weak_forms.json`（同上）
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1149:- `data/pipeline/ga_rp_same_report.json`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1150:- `data/derived/wordlist_with_neighbors.json`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1151:- `data/derived/wordlist_with_neighbors_slim.json`
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:28:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:55:git add data/batches/phase2_m2d_90_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:56:        wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:57:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:58:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:59:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:60:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-dignify-hotfix.md:30:wordlist = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-dignify-hotfix.md:39:json.dump(wordlist, open('wordlist_GA_a1a2_plus_phonics.json', 'w'), ensure_ascii=False, indent=2)
docs/cursor/instructions/cursor-instructions-dignify-hotfix.md:47:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-dignify-hotfix.md:58:git add wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-dignify-hotfix.md:59:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:14:`wordlist_GA_a1a2_plus_phonics.json`（3,059語）の CEFR × src 分布を分析した結果:
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:51:2. スクリプト実行による `data/wordlist_GA_a1a2_plus_phonics.json` の更新（652 語の `cefr` を `null` に）
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:62:- `data/guide.json`
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:92:INPUT = pathlib.Path("data/wordlist_GA_a1a2_plus_phonics.json")
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:93:BACKUP = pathlib.Path("data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json")
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:179:Backup written to: data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:180:Updated file: data/wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:187:`data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json` は安全網としてローカルに残しますが、コミットには含めません。以下を `.gitignore` に追加してください:
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:190:data/*.pre-phase0a.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:201:> 対象: `data/wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:336:d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:353:d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:375:d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:430:cp data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json data/wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:448:  - .gitignore (add data/*.pre-phase0a.json)
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:451:  - data/wordlist_GA_a1a2_plus_phonics.json (652 entries: cefr B1/B2 -> null)
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:38:1. `wordlist_GA_a1a2_plus_phonics.json` の 652 語の `cefr` を元の値（B1: 322語 / B2: 330語）に復元
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:56:本指示書に添付の `wordlist_GA_a1a2_plus_phonics.RESTORED.json` を使用してください。このファイルは Phase 0-a 適用前のオリジナルデータそのもので、以下を満たすことを確認済みです:
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:68:current = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:69:restored = json.load(open('wordlist_GA_a1a2_plus_phonics.RESTORED.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:104:cp wordlist_GA_a1a2_plus_phonics.RESTORED.json wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:113:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:179:`wordlist_GA_a1a2_plus_phonics.json` の 652 語の `cefr` を元の値（B1: 322語 / B2: 330語）に復元しました。詳細は `docs/cursor-instructions-cefr-phase0a-revert.md` を参照してください。
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:278:  - wordlist_GA_a1a2_plus_phonics.json (652 entries: cefr null -> B1/B2 restored)
docs/cursor/instructions/cursor-instructions-phase1-m1-gloss-apply.md:28:1. `wordlist_GA_a1a2_plus_phonics.json` 内の 180 語について、`gloss` オブジェクトを添付ファイルの値で置き換え
docs/cursor/instructions/cursor-instructions-phase1-m1-gloss-apply.md:48:main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m1-gloss-apply.md:90:main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m1-gloss-apply.md:102:with open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8') as f:
docs/cursor/instructions/cursor-instructions-phase1-m1-gloss-apply.md:112:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m1-gloss-apply.md:196:  - wordlist_GA_a1a2_plus_phonics.json (180 entries: gloss.ja/zh/ko/fil filled)
docs/cursor/instructions/cursor-instructions-phase1-m1-gloss-apply.md:209:- 該当語が実際に main に存在するか確認: `python3 -c "import json; d=json.load(open('wordlist_GA_a1a2_plus_phonics.json')); print([e for e in d if e['w']=='XXX'])"`
docs/design/phase-1/screen-data-mapping.md:5:> **調査対象:** `src/index.template.html`（md5 `65c30ff7797549b478a4c8db2f8f8702`）、`wordlist_GA_a1a2_plus_phonics.json`（5,397）、`data/connected_speech.json`（201）、`data/weak_forms.json`（36）。
docs/design/phase-1/screen-data-mapping.md:172:python3 -c "import json;from collections import Counter;w=json.load(open('wordlist_GA_a1a2_plus_phonics.json'));print(len(w),Counter(x.get('cefr') for x in w))"
docs/design/phase-1/screen-data-mapping.md:351:| 説明文 | `guide.json` / 新規 i18n | 再配置 |
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:5:> ゴール: `data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）の各エントリに `cefr` フィールドを追加する
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:20:1. `data/connected_speech.json` の 201 エントリに `cefr` フィールドを追加
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:21:2. `data/weak_forms.json` の 36 エントリに `cefr` フィールドを追加
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:27:- `wordlist_GA_a1a2_plus_phonics.json` への変更なし
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:48:# connected_speech.json への適用
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:49:cs_data = json.load(open('data/connected_speech.json'))
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:59:print(f'connected_speech.json 更新: {updated_cs}/{len(cs_data)}')
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:63:json.dump(cs_data, open('data/connected_speech.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:66:# weak_forms.json への適用
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:67:wf_data = json.load(open('data/weak_forms.json'))
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:77:print(f'weak_forms.json 更新: {updated_wf}/{len(wf_data)}')
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:81:json.dump(wf_data, open('data/weak_forms.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:85:期待される出力: `connected_speech.json 更新: 201/201`、`weak_forms.json 更新: 36/36`、未対応IDなし。
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:87:**注意:** 実際のファイルパスが `data/connected_speech.json` でない場合（リポジトリルート直下等）、既存の Phase B 指示書等を参照してパスを合わせてください。
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:95:cs = json.load(open('data/connected_speech.json'))
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:96:wf = json.load(open('data/weak_forms.json'))
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:98:assert all('cefr' in e for e in cs), 'connected_speech.json に cefr 未設定のエントリがあります'
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:99:assert all('cefr' in e for e in wf), 'weak_forms.json に cefr 未設定のエントリがあります'
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:139:  - data/connected_speech.json (+cefr field, 201 entries)
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:140:  - data/weak_forms.json (+cefr field, 36 entries)
docs/cursor/instructions/cursor-instructions-phase1-m5.md:25:1. `data/batches/phase1_m5_389_with_gloss.json`（389エントリ）を `wordlist_GA_a1a2_plus_phonics.json`（**リポジトリルート**）にマージ
docs/cursor/instructions/cursor-instructions-phase1-m5.md:46:m5 = json.load(open('data/batches/phase1_m5_389_with_gloss.json'))
docs/cursor/instructions/cursor-instructions-phase1-m5.md:47:main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m5.md:64:json.dump(main, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-phase1-m5.md:86:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m5.md:143:  - wordlist_GA_a1a2_plus_phonics.json (+389 entries, gloss complete)
docs/cursor/instructions/cursor-instructions-phase1-m5.md:144:  - data/batches/phase1_m5_389_with_gloss.json (source data)
docs/cursor/instructions/cursor-instructions-phase1-m5.md:147:  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:18:| 1 | pilot データを配置 | `data/batches/phase2_pilot_180_with_gloss.json`（別途受領・179 エントリ） |
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:19:| 2 | wordlist へマージ | `wordlist_GA_a1a2_plus_phonics.json`（+179 → 5,007 語） |
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:20:| 3 | narrow IPA / respell 生成 | `data/pipeline/phase2a_*.json` / `phase2b_*.json` |
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:22:| 5 | `neighbors` 再計算 | `data/derived/wordlist_with_neighbors.json` |
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:39:cp /path/to/phase2_pilot_180_with_gloss.json data/batches/
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:56:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:59:git add wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:60:        data/batches/phase2_pilot_180_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:61:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:62:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:63:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:88:| 総語数 | **5,007** | `python3 -c "import json; print(len(json.load(open('wordlist_GA_a1a2_plus_phonics.json'))))"` |
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:105:p = json.load(open('data/derived/rp_progress.json'))
docs/cursor/instructions/cursor-instructions-fix-friendliness-ipa.md:9:`wordlist_GA_a1a2_plus_phonics.json` 内の `friendliness` エントリの `ipa` フィールドを以下のように修正してください:
docs/cursor/instructions/cursor-instructions-fix-friendliness-ipa.md:22:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-fix-friendliness-ipa.md:28:json.dump(d, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-fix-friendliness-ipa.md:38:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:19:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:53:git add data/batches/phase2_m2b_100_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:54:        wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:55:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:56:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:57:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:58:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:17:| 1 | `data/batches/phase2_m2a_100_with_gloss.json` 配置（`rp_ipa` 同梱・100 エントリ） |
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:31:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:63:git add data/batches/phase2_m2a_100_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:64:        wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:65:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:66:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:67:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:68:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:35:| `wordlist_GA_a1a2_plus_phonics.json`（全 5,007 語） | 5,007 | **17 語** |
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:36:| `data/connected_speech.json` | 201 | 0 |
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:37:| `data/weak_forms.json` | 36 | 0 |
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:73:wordlist = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:82:json.dump(wordlist, open('wordlist_GA_a1a2_plus_phonics.json', 'w'), ensure_ascii=False, indent=2)
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:90:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:99:        wordlist_GA_a1a2_plus_phonics.json \
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:100:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:121:Phase 2 pilot 実装時、`data/derived/connected_speech_with_rp.json`（古い 15 句版）が
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:122:`connected_speech.json`（現行 201 句）を誤って上書きしかけた実績があります（git revert で回避済み）。
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:124:再発防止のため、以下の legacy ファイルを削除するか、`data/archive/` へ移動することを推奨:
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:127:git rm data/derived/connected_speech.legacy15.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:128:git rm data/derived/connected_speech_with_rp.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:133:`data/derived/` 配下に存在すること自体が「merge スクリプトが誤って読みに行く」リスクを生んでいる。
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:160:**Phase 2 M2 以降の方針変更**: Claude 側が `data/batches/phase2_mN_*.json` を生成する際、
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:35:**ディレクトリ:** `.cursor/`, `.github/`, `data/`, `docs/`, `fonts/`, `gas/`, `i18n/`, `scripts/`, `tests/`, `tools/`
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:37:**ファイル:** `.gitignore`, `CLAUDE.md`, `README.md`, `index.html`, `wordlist_GA_a1a2_plus_phonics.csv`, `wordlist_GA_a1a2_plus_phonics.json`（＋ローカル `.DS_Store`）
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:39:Issue 例示の `index.html` / `README.md` / `wordlist_*` / `CLAUDE.md` **以外**のルート要素: `.cursor/`, `.github/`, `.gitignore`, `data/`, `docs/`, `fonts/`, `gas/`, `i18n/`, `scripts/`, `tests/`, `tools/`
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:93:（調査対象外の `docs/` / `data/` / `i18n/` 内の言語コード使用は別問題。ルート生成物とは非衝突。）
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:9:| ランタイム語彙 | `wordlist_GA_a1a2_plus_phonics.json`（5,397） |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:10:| 連結／弱形 | `data/connected_speech.json`（201）/ `data/weak_forms.json`（36） |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:23:| **Pipeline✓ Runtime✗** | `data/batches` 等に候補があるが本番 wordlist 未収録 |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:40:| P2 | **C1 はパイプライン候補のみ** | Pipeline✓ Runtime✗ | `lvl.c1` i18n あり。ランタイム CEFR に C1 無し。`data/batches/gap_c1_new.json` 1,015 語 |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:97:| `data/batches/gap_b2_new.json` | 1,992 候補 | うち **ランタイム未収録 ~1,382**（現行 B2=899 は Phase 2 取り込み済み分） |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:98:| `data/batches/gap_c1_new.json` | 1,015 | **ほぼ未収録**（~910 missing）。UI 以前にデータ未マージ |
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:58:これらを **`data/patches/phase2_audit/`** に配置:
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:61:mkdir -p data/patches/phase2_audit
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:62:cp /path/to/patches/*.json data/patches/phase2_audit/
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:71:cp wordlist_GA_a1a2_plus_phonics.json /tmp/wordlist_pre_phase_b.json
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:72:cp -r data/batches /tmp/batches_pre_phase_b
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:80:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:116:wl = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:117:patch = json.load(open('data/patches/phase2_audit/wordlist_audit_patch.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:136:json.dump(wl, open('wordlist_GA_a1a2_plus_phonics.json', 'w'), ensure_ascii=False, indent=1)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:146:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:172:git add wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:221:wl = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:222:patch = json.load(open('data/patches/phase2_audit/wordlist_audit_patch.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:237:json.dump(wl, open('wordlist_GA_a1a2_plus_phonics.json', 'w'), ensure_ascii=False, indent=1)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:247:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:273:git add wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:302:    'pilot': 'data/batches/phase2_pilot_180_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:303:    'm2a': 'data/batches/phase2_m2a_100_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:304:    'm2b': 'data/batches/phase2_m2b_100_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:305:    'm2c': 'data/batches/phase2_m2c_100_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:306:    'm2d': 'data/batches/phase2_m2d_90_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:311:    patch_path = f'data/patches/phase2_audit/phase2_{label}_audit_patch.json'
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:340:**注意:** `data/batches/phase2_pilot_180_with_gloss.json` などのパスは実際のバッチファイル位置に合わせる。もし別の場所 (例: `data/archive/`) にある場合はパスを調整。
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:348:wl = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:352:files = [f'data/batches/phase2_{b}_' + ('180' if b=='pilot' else '100' if b in ('m2a','m2b','m2c') else '90') + '_with_gloss.json' for b in BATCHES]
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:380:git add data/batches/phase2_*.json data/patches/phase2_audit/
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:483:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:502:`data/patches/` セクションに:
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:505:| `data/patches/phase2_audit/` | Phase B (Package B) 監査で発見した wordlist / batch fixes のパッチ源 |
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:564:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:565:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:566:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:569:        wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:605:### Q1: バッチファイルのパスが `data/batches/` にない場合は？
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:607:**A:** `find . -name "phase2_*.json"` で検索。 `docs/REPOSITORY-STRUCTURE.md` によると `data/batches/` に配置されているはず。もし別の場所にあれば実際のパスに合わせて B3 の script を調整。
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:634:### Q7: `data/patches/phase2_audit/` を残すか削除するか？
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:666:- `data/patches/phase2_audit/phase2_pilot_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:667:- `data/patches/phase2_audit/phase2_m2a_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:668:- `data/patches/phase2_audit/phase2_m2b_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:669:- `data/patches/phase2_audit/phase2_m2c_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:670:- `data/patches/phase2_audit/phase2_m2d_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:671:- `data/patches/phase2_audit/wordlist_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:676:- `wordlist_GA_a1a2_plus_phonics.json` (16 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:677:- `data/batches/phase2_pilot_180_with_gloss.json` (3 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:678:- `data/batches/phase2_m2a_100_with_gloss.json` (29 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:679:- `data/batches/phase2_m2b_100_with_gloss.json` (14 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:680:- `data/batches/phase2_m2c_100_with_gloss.json` (22 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:681:- `data/batches/phase2_m2d_90_with_gloss.json` (18 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:683:- `data/derived/wordlist_with_neighbors.json` (再生成)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:684:- `data/derived/wordlist_with_neighbors_slim.json` (再生成)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:685:- `data/pipeline/ga_rp_same_report.json` (再生成)
docs/cursor/instructions/cursor-instructions-phase1-m4.md:24:1. `phase1_m4_400_with_gloss.json`（400エントリ）を `wordlist_GA_a1a2_plus_phonics.json` にマージ
docs/cursor/instructions/cursor-instructions-phase1-m4.md:45:main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m4.md:62:json.dump(main, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-phase1-m4.md:81:git diff --stat wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-phase1-m4.md:90:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-phase1-m4.md:128:  - wordlist_GA_a1a2_plus_phonics.json (+400 entries, gloss complete)
docs/cursor/instructions/cursor-instructions-phase1-m4.md:132:  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)
docs/cursor/reports/cursor-implementation-report-guide-full-replace.md:5:> 入力: `/Users/naoya.k/Downloads/files 28/guide.json`
docs/cursor/reports/cursor-implementation-report-guide-full-replace.md:13:前回（`387e910`）は指示書スコープに従い `philosophy` / `solves` のみをマージした。提供 `guide.json` には **`decode_encode` / `connected` / `how_to_use` の段落拡張** も含まれていたため、ユーザー要望により **6言語版を丸ごと置き換え**。
docs/cursor/reports/cursor-implementation-report-guide-full-replace.md:22:cp guide.json data/guide.json
docs/cursor/reports/cursor-implementation-report-guide-full-replace.md:49:g = json.load(open('data/guide.json'))
docs/cursor/reports/cursor-implementation-report-guide-full-replace.md:75:| `data/guide.json` | Claude 生成6言語版で丸ごと置換 |
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:34:- ブラックリスト: `data/**`、`docs/cursor/instructions/**`、`docs/reference/**`、`docs/design/**` は未編集。near 削除のため `src/index.template.html` のみコード触手（ルート `index.html` は手編集せず）
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:23:ソース: `data/batches/phase2_m2d_90_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:34:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:70:- `data/batches/phase2_m2d_90_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:71:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:72:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:73:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-guide-welcome-v2.md:23:| 対象 | `data/guide.json`（Claude 生成6言語版で上書き） |
docs/cursor/reports/cursor-implementation-report-guide-welcome-v2.md:48:g = json.load(open('data/guide.json'))
docs/cursor/reports/cursor-implementation-report-guide-welcome-v2.md:70:提供版 `guide.json` において、ko / fil の `welcome.title` が旧版と異なる（ko: `시작하며` → `들어가며`、fil: `Maligayang pagdating` → `Panimula`）。本文ナラティブ強化に伴うローカライズ調整と判断し、提供ファイルをそのまま採用。
docs/cursor/reports/cursor-implementation-report-guide-welcome-v2.md:78:| `data/guide.json` | Claude 生成6言語版で上書き |
docs/cursor/reports/cursor-implementation-report-guide-welcome-v2.md:94:- `validate_i18n.py` の対象外（guide.json は UI i18n とは独立ファイル）
docs/cursor/instructions/cursor-instructions-zh-split.md:6:> 事前確認済み: `data/guide.json` は既に `zh-Hant` / `zh-Hans` で分離済み（今回は触らない）。Tier 1（UI）と Tier 3（音素解説）のみ対応。
docs/cursor/instructions/cursor-instructions-zh-split.md:20:- `data/guide.json` — 既に分離済み
docs/cursor/instructions/cursor-instructions-zh-split.md:21:- `data/wordlist_*.json` の `gloss.zh` — 単一 `zh` フィールドのまま。UI 側で `zh-Hant` / `zh-Hans` 要求時に `zh` へフォールバック
docs/cursor/instructions/cursor-instructions-zh-split.md:22:- `data/connected_speech.json` の `gloss.zh` / `cs_rule` — 同上
docs/cursor/instructions/cursor-instructions-zh-split.md:84:- 「繁體」「简体」の文字はどの言語ファイルでも共通（各言語での自称呼称を採用しないのは、ボタンラベルとして自己言及的に読める方が自然なため。`guide.json` の言語ピルと同じ設計）
docs/cursor/instructions/cursor-instructions-zh-split.md:207:- `csRuleText()` (約 L964): `c.cs_rule[LANG] || c.cs_rule.en` のパターンで、`connected_speech.json` の `cs_rule` に元々 zh キーがないため、`zh-Hant` / `zh-Hans` 要求時も en フォールバックが働きます（既存動作と同じ）
docs/cursor/instructions/cursor-instructions-zh-split.md:270:- `data/guide.json` の中に `"zh-Hant"` キーが存在するか確認（既に存在しているはず。今回のスコープでは触らない）
docs/cursor/reports/cursor-implementation-report-phase1-narrow-ipa-respell.md:17:- マージ実行で `wordlist_GA_a1a2_plus_phonics.json` に 30語分の下記フィールドを追加
docs/cursor/recon/pre-issue-recon-20260712-seo-meta-architecture.md:65:ガイド本文 `#guideBody` は空コンテナで、内容は JS（`renderGuide`）が `data/guide.json` から挿入。
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches17-20.md:78:| `data/gloss-fil-batch04.json` | files 22 版で上書き |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches17-20.md:79:| `data/gloss-fil-batch17.json` … `20.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches17-20.md:80:| `wordlist_GA_a1a2_plus_phonics.json` | +320語 `gloss.fil`（計1,600語） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:23:| `data/gloss-fil-batch01.json` | 80 | `A` … `bed` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:24:| `data/gloss-fil-batch02.json` | 80 | `bee` … `can't` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:25:| `data/gloss-fil-batch03.json` | 81 | `cap` … `cute` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:26:| `data/gloss-fil-batch04.json` | 54 | （batch04 語群） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:27:| `data/gloss-fil-batch05.json` | 74 | （batch05 語群） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:28:| `data/gloss-fil-batch06.json` | 74 | （batch06 語群） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:29:| `data/gloss-fil-batch07.json` | 65 | （batch07 語群） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:30:| `data/gloss-fil-batch08.json` | 132 | `I` … `mine` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:87:| `data/gloss-fil-batch03.json` … `batch08.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:88:| `data/gloss-fil-batch01.json` / `batch02.json` | files 19 版で上書き（同一内容） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:89:| `wordlist_GA_a1a2_plus_phonics.json` | +480語に `gloss.fil` 追加（計640語） |
docs/cursor/reports/cursor-implementation-report.md:40:**操作:** `wordlist_GA_a1a2_plus_phonics.fixed.json` で本番 `wordlist_GA_a1a2_plus_phonics.json` を上書き。
docs/cursor/reports/cursor-implementation-report.md:138:| `wordlist_GA_a1a2_plus_phonics.json` | 上書き | gloss 是正 + 多義語展開 |
docs/cursor/reports/cursor-implementation-report.md:197:2. **`wordlist_GA_a1a2_plus_phonics.csv`** — STEP3 指示では CSV 更新は要求されていない。JSON のみ更新済み。CSV との同期が必要なら別タスク。
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:14:完了: 4828語に neighbors 付与 → data/derived/wordlist_with_neighbors.json
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:15:slim版: data/derived/wordlist_with_neighbors_slim.json
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:61:- `data/derived/wordlist_with_neighbors.json`: `neighbors` は `[{w, d, type}, ...]` 形式
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:62:- `data/derived/wordlist_with_neighbors_slim.json`: `neighbors` は `string[]` 形式
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:81:| `data/derived/wordlist_with_neighbors.json` | 全 4,828 語 neighbors 詳細版 |
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:82:| `data/derived/wordlist_with_neighbors_slim.json` | slim 版（string 配列） |
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:84:| `wordlist_GA_a1a2_plus_phonics.json` | `merge_neighbors.py` で neighbors 反映（ランタイム用） |
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:19:### 2-1. データ（`data/guide.json`）
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:47:`i18n/{en,ja,zh,ko}.json` に追加。本文は `guide.json` から読み込み。
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:55:| `guide.json` 読み込み・表示 | ✅ |
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:69:| `data/guide.json` | 新規（5言語ガイド本文） |
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:80:| フェーズ2（hi/es/ar/id） | 後日。同構造で `guide.json` に追加即可 |
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:82:| `guide_i18n_flat.json` 方式 | 未採用（`guide.json` 構造化方式を採用） |
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:99:- 本文はオフライン `data/guide.json` のみ。GAS 再デプロイ不要
docs/cursor/reports/cursor-implementation-report-hardening-pattern-c.md:35:- ブラックリスト不変（`git diff main` で 0 行）: `index.html`、`wordlist_GA_a1a2_plus_phonics.json`、`docs/CHANGE-CLASSIFICATION.md`、`.cursor/rules/dev-flow.mdc`
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:31:python3 -c "import json; d=json.load(open('wordlist_GA_a1a2_plus_phonics.json')); lookup={w['w']:w for w in d}; has=[w for w in d if w.get('ipa_actual_ga')]; print(f'ipa_actual_ga を持つ語の総数: {len(has)}'); print('middle:', lookup['middle']['ipa_actual_ga']); print('thirty:', lookup['thirty']['ipa_actual_ga']); print('party:', lookup['party']['ipa_actual_ga'])"
docs/cursor/reports/cursor-implementation-report-phase-1-0-b-data-mapping-recon.md:34:- ブラックリスト `data/**` / PURPOSE/SPEC/DESIGN: 未編集
docs/cursor/reports/cursor-implementation-report-connected-weak-cefr-badges.md:9:`data/connected_speech.json`（201 句）に既に付与済みの `cefr` フィールドを、語彙ブラウザ **Phrases タブ**にバッジとして表示。練習中カードの CEFR 表示は既存 `setCardCefr()` が対応済みのため新規実装なし（動作確認のみ）。
docs/cursor/reports/cursor-implementation-report-connected-weak-cefr-badges.md:36:| `an apple` の cefr データ | A1（`connected_speech.json` 確認済み） |
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:21:ソース: `data/batches/phase2_m2a_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:73:- `data/batches/phase2_m2a_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:74:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:75:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:76:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-guide-philosophy-solves.md:28:| 対象 | `data/guide.json` |
docs/cursor/reports/cursor-implementation-report-guide-philosophy-solves.md:35:提供 `guide.json` には `decode_encode` / `connected` / `how_to_use` の段落拡張も含まれていたが、指示書のスコープ（philosophy / solves のみ）に従い、**該当2章だけを既存 guide.json にマージ**した。welcome v2 および他5章は前回コミットの内容を維持。
docs/cursor/reports/cursor-implementation-report-guide-philosophy-solves.md:48:g = json.load(open('data/guide.json'))
docs/cursor/reports/cursor-implementation-report-guide-philosophy-solves.md:76:| `data/guide.json` | philosophy / solves のみマージ |
docs/cursor/reports/cursor-implementation-report-fix-friendliness-ipa.md:27:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-fix-friendliness-ipa.md:74:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md:91:| `data/connected_speech.json` | `7ebc1be2fcaa774d7696dbba5c07df55` |
docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md:92:| `data/weak_forms.json` | `a853cd530443edfd9b7fa3a11e11a116` |
docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md:93:| `wordlist_GA_a1a2_plus_phonics.json` | `54937707f733d1f906c99ba119444d5a` |
docs/cursor/reports/cursor-implementation-report-phase2b-respell-merge.md:25:python3 -c "import json; d=json.load(open('wordlist_GA_a1a2_plus_phonics.json')); lookup={w['w']:w for w in d}; has=[w for w in d if w.get('respell_ga')]; print(f'respell_ga を持つ語の総数: {len(has)}'); print('party:', lookup['party']['respell_ga'], '/', lookup['party']['respell_rp']); print('winter:', lookup['winter'].get('respell_ga')); print('visual:', lookup['visual']['respell_ga'], '/', lookup['visual']['respell_rp'])"
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:9:CEFR-J B1 拡充の第4バッチ 400 語（`marked`〜`restore`）を、IPA・pos・def・gloss（5言語）完成済みの状態で `wordlist_GA_a1a2_plus_phonics.json` にマージした。続けて narrow IPA（`ipa_actual_ga`）と respelling（`respell_ga` / `respell_rp`）を既存スクリプトで生成・反映した。
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:103:- `wordlist_GA_a1a2_plus_phonics.json`（+400語、flap/respell 反映）
docs/cursor/reports/cursor-implementation-report-step4e.md:19:| `connected_patch.json` | 連結句15句 | **別ファイル** `data/connected_speech.json` + 専用タブ |
docs/cursor/reports/cursor-implementation-report-step4e.md:31:| 入力 | `data/casual_patch.json` |
docs/cursor/reports/cursor-implementation-report-step4e.md:43:| ファイル | `data/connected_speech.json`（本番 wordlist には未混在） |
docs/cursor/reports/cursor-implementation-report-connected-carriers.md:19:### 2-1. データ（`data/connected_speech.json`）
docs/cursor/reports/cursor-implementation-report-connected-carriers.md:66:| `data/connected_speech.json` | carriers 付き201句に置換 |
docs/cursor/reports/cursor-implementation-report-step4a.md:31:| 入力 | `data/basic_words_patch.json`（74語、CMU 由来 GA IPA、gloss 4言語キュレーション済み） |
docs/cursor/reports/cursor-implementation-report-step4a.md:32:| 出力 | `wordlist_GA_a1a2_plus_phonics.json` |
docs/cursor/reports/cursor-implementation-report-step4a.md:79:| `data/basic_words_patch.json` | マージ元データ（確定版） |
docs/cursor/reports/cursor-implementation-report-step4a.md:107:| `wordlist_GA_a1a2_plus_phonics.csv` 同期 | 指示書 §6「不要なら JSON のみ」。STEP3 以降も CSV は未同期運用 |
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:9:CEFR-J B1 拡充対象 1,769 語のうち先頭 180 語（アルファベット順）を `phase1_pilot_180.json` から `wordlist_GA_a1a2_plus_phonics.json` にマージした。続けて narrow IPA（`ipa_actual_ga`）と respelling（`respell_ga` / `respell_rp`）を既存スクリプトで生成・反映した。
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:110:- `wordlist_GA_a1a2_plus_phonics.json`（+180 語、flap/respell 反映）
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:120:M  wordlist_GA_a1a2_plus_phonics.json
docs/cursor/reports/cursor-implementation-report-step4d.md:33:| 入力 | `data/thin_phoneme_patch.json`（40語、キュレーション gloss） |
docs/cursor/reports/cursor-implementation-report-step4d.md:34:| 出力 | `wordlist_GA_a1a2_plus_phonics.json` |
docs/cursor/reports/cursor-implementation-report-step4d.md:90:| `data/thin_phoneme_patch.json` | マージ元（確定版40語） |
docs/cursor/reports/cursor-implementation-report-step4d.md:93:| `data/wordlist_with_neighbors.json` | neighbors 詳細版（再生成） |
docs/cursor/reports/cursor-implementation-report-step4d.md:94:| `data/wordlist_with_neighbors_slim.json` | neighbors slim 版（再生成） |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:42:| 入力 | `data/cs-rule-fil-connected.json`（201件）、`data/cs-rule-fil-weak.json`（36件） |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:79:| `data/cs-rule-fil-connected.json` | 新規配置 |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:80:| `data/cs-rule-fil-weak.json` | 新規配置 |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:81:| `data/connected_speech.json` | 201件に `cs_rule.fil` 追加 |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:82:| `data/weak_forms.json` | 36件に `cs_rule.fil` 追加 |
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:9:CEFR-J B1 拡充の**最終バッチ** 389 語（`restrict`〜`yoga`）を、IPA・pos・def・gloss（5言語）完成済みの状態で `wordlist_GA_a1a2_plus_phonics.json` にマージした。これにより Phase 1 の B1 語彙拡充（1,769語）が完了した。
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:21:- ソース: `data/batches/phase1_m5_389_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:112:- `wordlist_GA_a1a2_plus_phonics.json`（+389語、flap/respell 反映）
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:113:- `data/batches/phase1_m5_389_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:114:- `data/pipeline/phase2a_*.json`, `data/pipeline/phase2b_*.json`
docs/cursor/reports/cursor-implementation-report-setup-governance.md:40:- 既存機能への影響: なし（`index.html` / `data/` / `scripts/` / `gas/` / `i18n/` / `fonts/` 未変更）
docs/cursor/reports/cursor-implementation-report-change-classification.md:40:- `index.html` / `wordlist_GA_a1a2_plus_phonics.json` md5: 不変
docs/cursor/reports/cursor-implementation-report-change-classification.md:55:- C5（Runtime data/schema）と C6（Product behavior/UX）は Issue 本文でコード名のみ文脈登場（C1–C4/C7 が明示）のため、F2/React/Sentry の例と矛盾しない定義で補完
docs/cursor/reports/cursor-implementation-report-tab-unify-connected-weak.md:48:- `connected_speech.json`（201）/ `weak_forms.json`（36）は**変更なし**
docs/cursor/reports/cursor-implementation-report-cefr-phase0a-revert.md:9:- `wordlist_GA_a1a2_plus_phonics.json`（復元）
docs/cursor/reports/cursor-implementation-report-cefr-phase0a-revert.md:79: M wordlist_GA_a1a2_plus_phonics.json
docs/cursor/reports/cursor-implementation-report-step6.md:41:| 本番 | `data/connected_speech.json` を置き換え |
docs/cursor/reports/cursor-implementation-report-step6.md:42:| 退避 | 旧15句 → `data/connected_speech.legacy15.json` |
docs/cursor/reports/cursor-implementation-report-step6.md:78:| `connected_speech.json` 201句 | ✅ |
docs/cursor/reports/cursor-implementation-report-step6.md:92:| `data/connected_speech.json` | 201句に置き換え |
docs/cursor/reports/cursor-implementation-report-step6.md:93:| `data/connected_speech.legacy15.json` | 旧15句退避 |
docs/cursor/reports/cursor-implementation-report-step6.md:107:> **注意:** `scripts/merge_rp_ipa.py` は `data/connected_speech_with_rp.json`（旧15句）で上書きするため、STEP6 以降は **実行しないこと**。連結句の正本は `data/connected_speech.json`。
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:39:cp rp_complete.fixed.json data/rp_complete.json
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:40:cp rp_dress_vowel_fix.patch.json data/rp_dress_vowel_fix.patch.json
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:96:| `data/rp_complete.json` | `rp_complete.fixed.json` で差し替え |
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:97:| `data/rp_dress_vowel_fix.patch.json` | 新規（差分記録） |
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:98:| `wordlist_GA_a1a2_plus_phonics.json` | 21 語の `rp_ipa` 更新 |
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:99:| `data/connected_speech.json` | 再マージ（内容同一） |
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:114:- `data/rp_complete.json` は `ɛ` ゼロ状態
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:36:パッチ源: `data/patches/phase2_audit/`
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:46:- PURPOSE v3.24 / REPOSITORY-STRUCTURE / data/README / cursor README
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:77:| `wordlist_GA_a1a2_plus_phonics.json` | 16 語修正 + neighbors/ga_rp_same 再生成 |
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:78:| `data/batches/phase2_*.json`（5） | 86 語同期 |
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:79:| `data/patches/phase2_audit/*` | パッチ源 + final_summary |
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:81:| `data/derived/wordlist_with_neighbors*.json` | 再生成 |
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:83:| `docs/REPOSITORY-STRUCTURE.md` / `data/README.md` | phase2_audit 記載 |
docs/cursor/reports/cursor-implementation-report-respell-v2-patch.md:20:| `wordlist_GA_a1a2_plus_phonics.json` | Patched `respell_ga` on 18 words |
docs/cursor/reports/cursor-implementation-report-fix-merge-respelling.md:47:git diff --stat wordlist_GA_a1a2_plus_phonics.json
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches09-12.md:80:| `data/gloss-fil-batch02.json` … `05.json` | files 20 版で上書き |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches09-12.md:81:| `data/gloss-fil-batch09.json` … `12.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches09-12.md:82:| `wordlist_GA_a1a2_plus_phonics.json` | +320語 `gloss.fil`（計960語） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-complete.md:86:| `data/gloss-fil-batch01.json` / `03–34.json` | files 23 版で上書き or 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-complete.md:87:| `data/gloss-fil-batch02.json` | 変更なし |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-complete.md:88:| `data/gloss-fil-batch21.json` … `34.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-complete.md:89:| `wordlist_GA_a1a2_plus_phonics.json` | 全語に `gloss.fil` |
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:9:CEFR-J B1 拡充の第2バッチ 400 語（`biography`〜`enrich`）を、IPA・pos・def・gloss（5言語）完成済みの状態で `wordlist_GA_a1a2_plus_phonics.json` にマージした。続けて narrow IPA（`ipa_actual_ga`）と respelling（`respell_ga` / `respell_rp`）を既存スクリプトで生成・反映した。
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:105:- `wordlist_GA_a1a2_plus_phonics.json`（+400語、flap/respell 反映）
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:10:CEFR-J B1 拡充の第3バッチ 400 語（`entertain`〜`marine`）を、IPA・pos・def・gloss（5言語）完成済みの状態で `wordlist_GA_a1a2_plus_phonics.json` にマージした。続けて narrow IPA（`ipa_actual_ga`）と respelling（`respell_ga` / `respell_rp`）を既存スクリプトで生成・反映した。
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:105:- `wordlist_GA_a1a2_plus_phonics.json`（+400語、flap/respell 反映）
docs/cursor/reports/cursor-implementation-report-step5.md:28:API キー未設定のため、**ルールベース変換**（`scripts/ga_to_rp.py`）で `data/rp_complete.json` を生成しマージ。
docs/cursor/reports/cursor-implementation-report-step5.md:36:| マージ | `cp rp_complete.json data/rp_complete.json` → `python3 scripts/merge_rp_ipa.py` |
docs/cursor/reports/cursor-implementation-report-step5.md:38:| 品質レビュー | **Claude 手番 (2) は未実施** — `data/rp_complete.json` のレビューを推奨 |
docs/cursor/reports/cursor-implementation-report-step5.md:50:| 入力 | `data/rp_complete.json`（3,059 語） |
docs/cursor/reports/cursor-implementation-report-step5.md:58:| 入力 | `data/connected_speech_with_rp.json`（手動確定 15 句） |
docs/cursor/reports/cursor-implementation-report-step5.md:59:| 出力 | `data/connected_speech.json` を更新 |
docs/cursor/reports/cursor-implementation-report-step5.md:108:| `wordlist_GA_a1a2_plus_phonics.json` | `rp_ipa` 追加（3,059 語） |
docs/cursor/reports/cursor-implementation-report-step5.md:109:| `data/connected_speech.json` | `rp_ipa` 追加（15 句） |
docs/cursor/reports/cursor-implementation-report-step5.md:110:| `data/rp_complete.json` | 新規（オフライン生成） |
docs/cursor/reports/cursor-implementation-report-step5.md:111:| `data/connected_speech_with_rp.json` | 参照用コピー |
docs/cursor/reports/cursor-implementation-report-step5.md:142:1. `data/rp_complete.json`（または wordlist の `rp_ipa` 列）の **品質レビュー** — 特に短縮形・カジュアル・TRAP-BATH 境界
docs/cursor/reports/cursor-implementation-report-cs-rule-3-languages.md:14:- `data/connected_speech.json`: 全 201 句の `cs_rule` に `ko` / `zh-Hans` / `zh-Hant` を追加
docs/cursor/reports/cursor-implementation-report-cs-rule-3-languages.md:22:- data/connected_speech.json (M)
docs/cursor/reports/cursor-implementation-report-cs-rule-3-languages.md:59:- [x] Runtime data: `connected_speech.json` の `cs_rule` 拡張（後方互換・追加のみ）
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:110:| `wordlist_GA_a1a2_plus_phonics.json` | `54937707f733d1f906c99ba119444d5a` |
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:111:| `data/connected_speech.json` | `7ebc1be2fcaa774d7696dbba5c07df55` |
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:112:| `data/weak_forms.json` | `a853cd530443edfd9b7fa3a11e11a116` |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:21:ソース: `data/batches/phase2_pilot_180_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:33:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:54:**注意:** `merge_rp_ipa.py` 実行時、`data/derived/connected_speech_with_rp.json` が古く（15 句）`connected_speech.json` を上書きしてしまったため、**201 句を git から復元**し `gen_ga_rp_same.py` を再実行。wordlist の `rp_ipa` は直接付与済みのため `merge_rp_ipa.py` は再実行していない。
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:92:| `data/batches/gap_b2_new.json` | B2 マスタリスト（1,992 語） |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:93:| `data/batches/gap_c1_new.json` | C1 マスタリスト（1,015 語） |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:94:| `data/batches/gap_a2_completion.json` | A2 gap 6 語 |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:95:| `data/batches/pilot_b2_180.json` | pilot 語彙リスト（headword のみ） |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:96:| `data/batches/phase2_pilot_180_with_gloss.json` | pilot 完成データ |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:100:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:101:- `data/batches/phase2_pilot_180_with_gloss.json` + gap/pilot 参照 JSON
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:102:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:103:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-g1-legal-docs.md:47:- 既存機能への影響: `src/index.template.html`、runtime data contract 8 パス、`i18n/`、`data/`、`scripts/`、`tools/`、`gas/` は未変更
docs/cursor/reports/cursor-implementation-report-step4c.md:44:| 入力 | `data/irregular_forms_patch.json`（90語） |
docs/cursor/reports/cursor-implementation-report-step4c.md:45:| 出力 | `wordlist_GA_a1a2_plus_phonics.json` |
docs/cursor/reports/cursor-implementation-report-step4c.md:71:`gen_neighbors.py` を拡張し、詳細版と **slim 版**（`data/wordlist_with_neighbors_slim.json`）を同時出力するよう改善。
docs/cursor/reports/cursor-implementation-report-step4c.md:85:| `data/irregular_forms_patch.json` | マージ元（確定版90語） |
docs/cursor/reports/cursor-implementation-report-step4c.md:88:| `data/wordlist_with_neighbors.json` | neighbors 詳細版（再生成） |
docs/cursor/reports/cursor-implementation-report-step4c.md:89:| `data/wordlist_with_neighbors_slim.json` | neighbors slim 版（再生成） |
docs/cursor/reports/cursor-implementation-report-phase1-m1-gloss-apply.md:9:Phase 1 M1 パイロット 180 語について、`phase1_pilot_180_with_gloss.json` の翻訳データを `wordlist_GA_a1a2_plus_phonics.json` に適用した。更新対象は `gloss.ja` / `gloss.zh` / `gloss.ko` / `gloss.fil` のみで、他フィールドは変更していない。
docs/cursor/reports/cursor-implementation-report-phase1-m1-gloss-apply.md:61:M  wordlist_GA_a1a2_plus_phonics.json
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:11:| ランタイムと非ランタイムの分離 | ブラウザが fetch する JSON は `data/` 直下 + ルート wordlist のみ |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:12:| パイプライン中間物は `data/pipeline/` | R4 作業リストなど機械可読データを `docs/reference/` から移動 |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:13:| 各階層に README | `data/`, `data/batches/`, `data/pipeline/`, `data/archive/`, `docs/cursor/` |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:21:| R4 作業リスト | `docs/reference/r4_pending_review_list.{json,csv}` | `data/pipeline/` |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:22:| wordlist バックアップ | ルート `*.pre-phase0a.json` | `data/archive/`（gitignore 対象のまま） |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:27:- `wordlist_GA_a1a2_plus_phonics.json` — `index.html` がルート固定 fetch のため変更不可
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:34:| `data/README.md` | runtime / batches / pipeline / derived / patches / archive の見分け |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:35:| `data/batches/README.md` | バッチ命名規則と現行一覧 |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:36:| `data/pipeline/README.md` | ステージング JSON の一覧 |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:37:| `data/archive/README.md` | ローカル退避の説明 |
docs/cursor/reports/cursor-implementation-report-def-merge.md:13:Mode B Study の2段階 reveal で、英語 UI 選択時に表示する語義が `gloss.en`（約94%が単語そのもの）では定義として機能しない問題があった。`wordlist_GA_a1a2_plus_phonics.json` に `def` フィールド（1〜2文の平易な英語定義）を追加し、既存の `modeBDisplayGloss()` が自動的に使用する。
docs/cursor/reports/cursor-implementation-report-def-merge.md:23:| 入力 | `data/def-batch01.json` … `def-batch08.json`（Claude 生成） |
docs/cursor/reports/cursor-implementation-report-def-merge.md:67:| `data/def-batch01.json` … `def-batch08.json` | 新規配置 |
docs/cursor/reports/cursor-implementation-report-def-merge.md:69:| `wordlist_GA_a1a2_plus_phonics.json` | 3,059語に `def` 追加 |
docs/cursor/reports/cursor-implementation-report-def-merge.md:84:- batch09 以降の追加マージは `data/def-batchNN.json` を配置して `merge_def.py` を再実行するだけで対応可能（上書きマージ）
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:21:ソース: `data/batches/phase2_m2b_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:63:- `data/batches/phase2_m2b_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:64:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:65:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:66:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-step4b.md:38:| 入力 | `data/wordlist_with_neighbors_slim.json`（2,914語） |
docs/cursor/reports/cursor-implementation-report-step4b.md:39:| 出力 | `wordlist_GA_a1a2_plus_phonics.json` |
docs/cursor/reports/cursor-implementation-report-step4b.md:66:| `data/wordlist_with_neighbors_slim.json` | マージ元（slim 形式・確定版） |
docs/cursor/reports/cursor-implementation-report-step4b.md:134:# → data/wordlist_with_neighbors.json, docs/neighbors_report.md
docs/cursor/reports/cursor-implementation-report-zh-split.md:28:- `data/guide.json` — already had `zh-Hant` / `zh-Hans`
docs/cursor/reports/cursor-implementation-report-merge-cefr-connected-weak.md:10:Claude 提案（`cefr_proposals_merge_ready.json`、237件）を Naoya 確認のうえ**算出結果どおり採用**し、`data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）の各エントリに `cefr` フィールドを追加した。`vocab_cefr`（参考情報）は本番データには含めていない。
docs/cursor/reports/cursor-implementation-report-merge-cefr-connected-weak.md:19:connected_speech.json 更新: 201/201
docs/cursor/reports/cursor-implementation-report-merge-cefr-connected-weak.md:20:weak_forms.json 更新: 36/36
docs/cursor/reports/cursor-implementation-report-merge-cefr-connected-weak.md:54:- `data/connected_speech.json`（+`cefr`、201件）
docs/cursor/reports/cursor-implementation-report-merge-cefr-connected-weak.md:55:- `data/weak_forms.json`（+`cefr`、36件）
docs/cursor/reports/cursor-implementation-report-tagalog-tier1.md:32:| `data/guide.json` | 6言語版に差し替え（`fil` セクション追加・8セクション） |
docs/cursor/reports/cursor-implementation-report-tagalog-tier1.md:48:| Tier 4 | `connected_speech.json` / `weak_forms.json` の `cs_rule.fil` → reveal ルール文は **en フォールバック** |
docs/cursor/reports/cursor-implementation-report-tagalog-tier1.md:60:| `data/guide.json` 6言語版 | ✅ |
docs/cursor/reports/cursor-implementation-report-tagalog-tier1.md:75:| `data/guide.json` | fil 追加版に差し替え |
docs/cursor/reports/cursor-implementation-report-docs-infrastructure-overhaul.md:48:- 既存機能への影響: なし（index.html、data/、gas/、i18n/、fonts/ 全て未変更）
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:33:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:34:- `data/patches/dignify_dignity_rp_hotfix.json`
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:35:- `data/pipeline/ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:36:- `data/derived/rp_progress.json`（wordlist 同期）
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:43:- `data/pipeline/r4_pending_review_list.csv` / `.json`
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches13-16.md:81:| `data/gloss-fil-batch02.json` / `06–08.json` | files 21 版で上書き |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches13-16.md:82:| `data/gloss-fil-batch13.json` … `16.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches13-16.md:83:| `wordlist_GA_a1a2_plus_phonics.json` | +320語 `gloss.fil`（計1,280語） |
docs/cursor/reports/cursor-implementation-report-weak-forms.md:19:### 2-1. データ（`data/weak_forms.json`）
docs/cursor/reports/cursor-implementation-report-weak-forms.md:69:| `weak_forms.json` 36語配置・読み込み | ✅ |
docs/cursor/reports/cursor-implementation-report-weak-forms.md:86:| `data/weak_forms.json` | 新規（36語） |
docs/cursor/reports/cursor-implementation-report-phase-r.md:108:| データ | `wordlist_GA_a1a2_plus_phonics.json`, `data/pipeline/ga_rp_same_report.json`, `data/derived/wordlist_with_neighbors*.json` |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:15:wordlist_GA_a1a2_plus_phonics.json: 4828 items — 2378 same, 2450 different
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:31:data/connected_speech.json: 201 items — 94 same, 107 different
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:42:data/weak_forms.json: 36 items — 30 same, 6 different
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:87:| `wordlist_GA_a1a2_plus_phonics.json` | 4,828 語に `ga_rp_same` / `ga_rp_same_reason` 付与 |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:88:| `data/connected_speech.json` | 201 句に同フィールド付与 |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:89:| `data/weak_forms.json` | 36 語に同フィールド付与 |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:90:| `data/pipeline/ga_rp_same_report.json` | 分布レポート |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:105:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/briefs/cursor-multilingual-guide.md:5:> 入力: `guide.json`（構造化データ・Claude 作成）
docs/cursor/briefs/cursor-multilingual-guide.md:33:## 2. データ構造（`guide.json`）
docs/cursor/briefs/cursor-multilingual-guide.md:50:> 配置例: `data/guide.json`（連結句 `data/connected_speech.json` と同様の data ディレクトリ）。
docs/cursor/briefs/cursor-multilingual-guide.md:62:| 言語 | **現在のUI言語（`app_lang`）に追従**。`guide.json[app_lang]` を表示 |
docs/cursor/briefs/cursor-multilingual-guide.md:99:> ガイド**本文**は `guide.json` から。UIラベルのみ `i18n/*.json`。
docs/cursor/briefs/cursor-multilingual-guide.md:106:- [ ] `guide.json` を読み込み、現在UI言語でガイドを表示
docs/cursor/briefs/cursor-multilingual-guide.md:130:| `guide.json` | **埋め込み本体**（5言語×8セクション） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:25:| `data/gloss-fil-batch01.json` | 80 | `A` … `bed` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:26:| `data/gloss-fil-batch02.json` | 80 | `bee` … `can't` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:34:- `data/gloss-fil-batch*.json` を glob で読み込み、`wordlist_GA_a1a2_plus_phonics.json` の各エントリ `gloss.fil` にマージ
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:90:| `data/gloss-fil-batch01.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:91:| `data/gloss-fil-batch02.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:93:| `wordlist_GA_a1a2_plus_phonics.json` | 160語に `gloss.fil` 追加 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:118:- 追加バッチは `data/gloss-fil-batchNN.json` として配置し、`python3 tools/merge_gloss_fil.py` を再実行（glob で自動拾い・増分マージ可）
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:55:| マージ | `scripts/merge_rp_ipa.py` | `rp_complete.json` → `wordlist_GA_a1a2_plus_phonics.json` |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:181:| `wordlist_GA_a1a2_plus_phonics.json` | `ga_rp_same` 追加 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:182:| `data/connected_speech.json` | 同上 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:183:| `data/weak_forms.json`（該当あれば） | 同上 |
docs/cursor/reports/cursor-implementation-report-rp-neighbors-decision.md:79:**変更なし:** `wordlist_GA_a1a2_plus_phonics.json`（`neighbors_rp` 未生成）
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:14:| Modified | `wordlist_GA_a1a2_plus_phonics.json` (652 entries) |
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:17:| Not committed | `wordlist_GA_a1a2_plus_phonics.pre-phase0a.json` (local backup) |
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:34:Backup written to: wordlist_GA_a1a2_plus_phonics.pre-phase0a.json
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:35:Updated file: wordlist_GA_a1a2_plus_phonics.json
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:38:Note: wordlist path is repo root (`wordlist_GA_a1a2_plus_phonics.json`), not `data/` — consistent with existing codebase.
docs/cursor/briefs/cursor-phase2a-flap-merge.md:69:WORDLIST = pathlib.Path("wordlist_GA_a1a2_plus_phonics.json")
docs/cursor/briefs/cursor-phase2a-flap-merge.md:125:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:21:ソース: `data/batches/phase2_m2c_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:59:- `data/batches/phase2_m2c_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:60:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:61:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:62:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:33:| `data/patches/rp_ipa_bugfix_patch.json` 適用 | **17/17** |
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:68:- `data/patches/rp_ipa_bugfix_patch.json`（新規）
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:69:- `wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:70:- `data/pipeline/ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:71:- `data/derived/rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:73:- 削除: `data/derived/connected_speech.legacy15.json`, `connected_speech_with_rp.json`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:77:1. **`merge_rp_ipa.py`** は依然 `paths.CONNECTED_SPEECH_RP` を参照する設計。legacy ファイル削除により誤実行時は即失敗する（意図通り）。将来は `connected_speech.json` 直読みへの改修を推奨。
docs/cursor/briefs/cursor-tab-unify-connected-weak.md:20:- **データは2ファイル維持**（`connected_speech.json` 201 / `weak_forms.json` 36）。ランタイムで統合（後述 §5・低リスク・Tier 4 に無影響）
docs/cursor/briefs/cursor-tab-unify-connected-weak.md:201:`connected_speech.json`（201）と `weak_forms.json`（36）は**そのまま**。`§3-3` のとおり実行時に合算。
docs/cursor/briefs/cursor-tab-unify-connected-weak.md:256:- 本統一は **U1（2ファイル維持）**のため、`connected_speech.json`（201）/ `weak_forms.json`（36）の構造は不変
docs/cursor/briefs/cursor-modeb-study-reveal-ux.md:5:> 対象: `index.html`（単一HTML本体）、`i18n/*.json`、`wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/briefs/cursor-modeb-study-reveal-ux.md:186:`wordlist_GA_a1a2_plus_phonics.json` に `def` フィールド（英語定義文）を追加する。
docs/cursor/briefs/cursor-vocab-page-migration.md:367:**触らない:** `wordlist_*.json`, `data/connected_speech.json`, GAS TTS
docs/cursor/briefs/cursor-vocab-browser.md:6:> 前提: `wordlist_GA_a1a2_plus_phonics.json` に `def` フィールド追加済み（英語定義）
docs/cursor/briefs/cursor-vocab-browser.md:536:- **Words（3,059件）**: `wordlist_GA_a1a2_plus_phonics.json` の全エントリ。スペースなし（短縮形 `aren't` 含む）
docs/cursor/briefs/cursor-vocab-browser.md:537:- **Phrases（201件）**: `connected_speech.json` のフレーズ（複数語）
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:367:- `data/**/*.json` — 語彙データ本体（TTS フローには不要。語数統計だけなら `gas/BatchWords.gs` で足りる）
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:6:> 入力（Claude 生成済み）: `fil.json`（**151キー完成版**）、`guide.json`（6言語・fil追加済み）
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:21:| **Tier 3** | `guide.json` 学習ガイド本文 | ✅ 実施 | 6言語版を差し替えるだけ |
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:35:| `guide.json` | en/ja/ko/zh-Hant/zh-Hans/**fil**（各8セクション） | `data/guide.json` | **差し替え** |
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:94:### 3-1. `data/guide.json` を差し替え
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:96:提供された 6言語版 `guide.json` を `data/guide.json` に上書き。
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:107:- ガイドは `mapAppLangToGuide()` 経由。fil はそのまま `guide.json["fil"]` を引く（特殊マップ不要）。
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:133:- **Tier 2**: `wordlist_GA_a1a2_plus_phonics.json` の `gloss.fil`（3,059語）→ Mode B 採点に必須。80語/バッチで分割生成。
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:134:- **Tier 4**: `connected_speech.json` `cs_rule.fil`（201）＋ `weak_forms.json` `cs_rule.fil`（36）。
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:148:- [ ] `data/guide.json` を6言語版に差し替え
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:184:| Tier3 #10 `data/guide.json` | §3-1 |
docs/cursor/briefs/cursor-connected-carriers.md:6:> 対象: `data/connected_speech.json`（置換）、`index.html`（連結句の出題描画）
docs/cursor/briefs/cursor-connected-carriers.md:30:既存 `connected_speech.json` に **`carriers` フィールドを追加**しただけ。他フィールドは不変。
docs/cursor/briefs/cursor-connected-carriers.md:68:cp connected_speech_with_carriers.json data/connected_speech.json
docs/cursor/briefs/cursor-connected-carriers.md:136:- [ ] `data/connected_speech.json` が `carriers`（各4個）を持つ201句
docs/cursor/briefs/cursor-weak-forms-tab.md:5:> 入力: `weak_forms.json`（36語・Claude生成・検証済み）
docs/cursor/briefs/cursor-weak-forms-tab.md:20:| データ | `connected_speech.json`（201） | **`weak_forms.json`（36）** |
docs/cursor/briefs/cursor-weak-forms-tab.md:28:## 2. データ（`weak_forms.json`）
docs/cursor/briefs/cursor-weak-forms-tab.md:30:`data/weak_forms.json` として配置。36語（L1=10/L2=14/L3=12）。
docs/cursor/briefs/cursor-weak-forms-tab.md:145:  const res = await fetch("data/weak_forms.json");
docs/cursor/briefs/cursor-weak-forms-tab.md:259:- [ ] `data/weak_forms.json`（36語）配置・読み込み
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:27:| データ ID | `cs044`（`data/connected_speech.json`） |
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:55:| 連結句総数 | 201 句（`connected_speech.json`） |
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:194:| `data/connected_speech.json` | 201 連結句、IPA、`cs_rule`、`cs_type` |
docs/cursor/briefs/cursor-def-merge.md:5:> 対象: `wordlist_GA_a1a2_plus_phonics.json`（3,059語）
docs/cursor/briefs/cursor-def-merge.md:6:> 入力: `data/def-batch01.json` … `def-batch08.json`（Claude 生成・`{ "w": "English def" }` マップ）
docs/cursor/briefs/cursor-def-merge.md:24:// data/def-batch01.json (例)
docs/cursor/briefs/cursor-def-merge.md:41:"""Merge def (English definitions) into wordlist_GA_a1a2_plus_phonics.json."""
docs/cursor/briefs/cursor-def-merge.md:44:WL = "wordlist_GA_a1a2_plus_phonics.json"   # 実パスに合わせる
docs/cursor/briefs/cursor-def-merge.md:45:BATCH_GLOB = "data/def-batch*.json"
docs/cursor/briefs/cursor-def-merge.md:104:| `data/def-batch01.json` … `def-batch08.json` | 新規配置（Claude 生成） |
docs/cursor/briefs/cursor-def-merge.md:106:| `wordlist_GA_a1a2_plus_phonics.json` | 全3,059語に `def` フィールド追加 |
docs/cursor/briefs/cursor-phase2b-respell-merge.md:65:WORDLIST = pathlib.Path("wordlist_GA_a1a2_plus_phonics.json")
docs/cursor/briefs/cursor-phase2b-respell-merge.md:111:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/briefs/cursor-tier2-gloss-fil-merge.md:5:> 対象: `wordlist_GA_a1a2_plus_phonics.json`（3,059語）
docs/cursor/briefs/cursor-tier2-gloss-fil-merge.md:41:WL = "wordlist_GA_a1a2_plus_phonics.json"     # リポジトリ内の実パスに合わせる
docs/cursor/briefs/cursor-tier2-gloss-fil-merge.md:42:BATCH_GLOB = "data/gloss-fil-batch*.json"      # バッチ置き場に合わせる
docs/cursor/briefs/cursor-guide-welcome-v2.md:5:> 対象: `data/guide.json`
docs/cursor/briefs/cursor-guide-welcome-v2.md:6:> 入力: `guide.json`（Claude 生成・6言語版・本書添付）
docs/cursor/briefs/cursor-guide-welcome-v2.md:23:- `guide.json[<lang>].welcome.body` のみ（**全6言語**: en / ja / ko / zh-Hant / zh-Hans / fil）
docs/cursor/briefs/cursor-guide-welcome-v2.md:30:→ **`data/guide.json` を Claude 生成版で丸ごと置き換えるのが最も安全**（他章は元のまま含まれている）。
docs/cursor/briefs/cursor-guide-welcome-v2.md:61:# Claude 生成版を data/guide.json に上書き
docs/cursor/briefs/cursor-guide-welcome-v2.md:62:cp guide.json data/guide.json
docs/cursor/briefs/cursor-guide-welcome-v2.md:69:`data/guide.json` は静的アセットとして配信されるため、変更後は通常の GitHub Pages デプロイで反映される。
docs/cursor/briefs/cursor-guide-welcome-v2.md:77:`renderGuide()` は `guide.json[mappedLang].<section>.body[]` を逐次描画する設計のため、
docs/cursor/briefs/cursor-guide-welcome-v2.md:85:- [ ] `data/guide.json` が有効な JSON である
docs/cursor/briefs/cursor-guide-welcome-v2.md:94:g = json.load(open('data/guide.json'))
docs/cursor/briefs/cursor-guide-welcome-v2.md:141:| `data/guide.json` | Claude 生成6言語版で上書き |
docs/cursor/briefs/cursor-guide-welcome-v2.md:149:- `--strict` 検証で en と同値になる行は存在しない（welcome 全段落が翻訳語で再構築されているため、`validate_i18n.py` 的な懸念は対象外＝guide.json は UI 検査の対象外ファイル）
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:5:> 対象: `data/connected_speech.json`（201件）/ `data/weak_forms.json`（36件）
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:12:Tier 4 は `connected_speech.json` と `weak_forms.json` の各アイテムに `cs_rule.fil` を追加する作業。
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:38:"""Merge cs_rule.fil into connected_speech.json and weak_forms.json."""
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:55:merge("data/connected_speech.json", "data/cs-rule-fil-connected.json", "CS")
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:56:merge("data/weak_forms.json",        "data/cs-rule-fil-weak.json",      "WF")
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:94:| `data/cs-rule-fil-connected.json` | 新規配置（Claude 生成） |
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:95:| `data/cs-rule-fil-weak.json` | 新規配置（Claude 生成） |
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:97:| `data/connected_speech.json` | 201件に `cs_rule.fil` 追加 |
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:98:| `data/weak_forms.json` | 36件に `cs_rule.fil` 追加 |
docs/cursor/briefs/cursor-phase2-final-merge.md:33:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/briefs/cursor-phase2-final-merge.md:63:WORDLIST = pathlib.Path("wordlist_GA_a1a2_plus_phonics.json")
docs/cursor/briefs/cursor-phase2-final-merge.md:101:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/briefs/cursor-alt-accent-display-brief.md:60:| **語彙ブラウザ Phrases** | — | — | △ 同上 | connected_speech.json |
docs/cursor/briefs/cursor-alt-accent-display-brief.md:231:| `wordlist_GA_a1a2_plus_phonics.json` | `ipa`, `rp_ipa`, `ipa_actual_*` |
docs/cursor/briefs/cursor-alt-accent-display-brief.md:232:| `data/connected_speech.json` | 連結句の `rp_ipa` |
docs/cursor/briefs/cursor-alt-accent-display-brief.md:233:| `data/weak_forms.json` | 弱形の `rp_ipa` |
docs/handoff/claude-design-integ-handoff.md:60:- ゾーン規約: 運用ゾーン（`.claude/**`, `CLAUDE.md`, `docs/**`, `.cursor/**`, `.github/**`）と開発ゾーン（`src/**`, `i18n/**`, `data/**`, `scripts/**`, `tools/**`, `gas/**`）を 1 PR で混在させない。3e/3f/3g 昇格は運用ゾーン（docs）中心。挙動確認で `src/` を読むのは可、変更するなら別 PR。
docs/cursor/briefs/cursor-guide-philosophy-solves.md:5:> 対象: `data/guide.json`
docs/cursor/briefs/cursor-guide-philosophy-solves.md:6:> 入力: `guide.json`（Claude 生成・6言語版・本書添付）
docs/cursor/briefs/cursor-guide-philosophy-solves.md:25:- `guide.json[<lang>].philosophy.body`（2段落 → 3段落）
docs/cursor/briefs/cursor-guide-philosophy-solves.md:26:- `guide.json[<lang>].solves.body`（2段落 → 2段落・内容拡充）
docs/cursor/briefs/cursor-guide-philosophy-solves.md:34:→ **`data/guide.json` を Claude 生成版で丸ごと置き換えが最安全**（welcome 強化版も内包済み）。
docs/cursor/briefs/cursor-guide-philosophy-solves.md:74:g = json.load(open('data/guide.json'))
docs/cursor/briefs/cursor-guide-philosophy-solves.md:99:| `data/guide.json` | Claude 生成版で上書き（welcome v2 も内包） |
docs/handoff/2026-07-26_chat-log-epic-169-followups.md:36:- PR #188: validator の実体ロジックは `scripts/lib/verify_core.py`（`scripts/validate/validate-markdown-refs.py` が import）。V1 = front-matter が在る時のみ id 検査（無し＝正常）、V4/V5 = `docs/handoff/` 等 legacy prefix を除外（廃止せず将来の検査能力を保持）、V7 = 無変更で現役。+ `docs/claude-design/README.md` の V7 修正、`data/**` の `REPOSITORY-STRUCTURE` → `docs/repo-map.md` 付替。
docs/handoff/2026-07-19_chat-handoff-phase-1-a-c.md:92:13. **CI ガード** (Phase 1-C): `scripts/validate-cefr-tags.py` + workflow、未タグ CEFR 検出時 fail、対象 `wordlist_GA_a1a2_plus_phonics.json` (ルート) + optional data/*.json
docs/features/2a.md:39:`wordlist_GA_a1a2_plus_phonics.json`（`docs/data-contract.md` §2 wordlist スキーマ）。
docs/features/3c.md:29:`wordlist_GA_a1a2_plus_phonics.json`（IPA 記号の抽出元）。音素解説は `i18n/phonemes/{lang}.json`（`docs/data-contract.md` §5 i18n スキーマ）。
docs/features/2b.md:37:`wordlist_GA_a1a2_plus_phonics.json`（`docs/data-contract.md` §2 wordlist スキーマ）。
docs/features/3b.md:9:- **Words のみ**（Phrases タブは Q6 で撤去済み。`renderVocabTab(tab)` は互換のため引数を受けるが常に `vocabTabCurrent="words"` に固定。`connected_speech.json` を使う Phrases 一覧 UI は現在存在しない）
docs/features/3b.md:38:`wordlist_GA_a1a2_plus_phonics.json`、`data/connected_speech.json`（`docs/data-contract.md` §2 wordlist スキーマ / §3 connected_speech スキーマ）。
docs/features/2d.md:34:`data/connected_speech.json`（201 句）、`data/weak_forms.json`（36 語）— `docs/data-contract.md` §3 connected_speech / weak_forms / guide スキーマ。
docs/features/3d.md:10:- 卒業率算出: `ept_marks_v1` の値 3 を卒業として算出。`2a`–`2c` は wordlist、`2d` は `connected_speech.json` + `weak_forms.json` が母集団。母集団は CEFR pills の選択に連動してフィルタされる（`progressPoolForDrill`）
docs/features/2c.md:38:`wordlist_GA_a1a2_plus_phonics.json`（`docs/data-contract.md` §2 wordlist スキーマ）。`neighbors` フィールド（distractor 用）。
docs/claude-design/cd-updates/2026-07-27_ux-data-audit.md:3:実データ(`wordlist_GA_a1a2_plus_phonics.json` 5397語)・実コードで検証。「データ矛盾・表示未整理」観点の指摘と Naoya 決定。
docs/agent-reports/claude-code-issue-184-validator-align.md:33:- `data/README.md`: 退役参照 `docs/REPOSITORY-STRUCTURE.md` を `docs/repo-map.md` に更新。
docs/agent-reports/claude-code-issue-184-validator-align.md:34:- `data/batches/README.md`: 退役参照 `docs/REPOSITORY-STRUCTURE.md` を
docs/agent-reports/claude-code-issue-184-validator-align.md:42:- data/README.md (M)
docs/agent-reports/claude-code-issue-184-validator-align.md:43:- data/batches/README.md (M)
docs/agent-reports/claude-code-issue-184-validator-align.md:60:- `grep -rn 'REPOSITORY-STRUCTURE' data/` → 0 件
docs/agent-reports/claude-code-issue-173-design-layer-split.md:72:- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, `.github/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:54:- **`src/index.template.html` は一切変更していない**（読み取り専用の解析対象。`git status --short` に同ファイルが出現しないことを確認）。他の `src/**` / `i18n/**` / `data/**` / `tools/**` / `gas/**` にも触れていない。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:59:- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:60:- ランタイム契約 8 パスの実体ファイル（`wordlist_GA_a1a2_plus_phonics.json` / `data/*.json` / `i18n/*.json` / `fonts/*` / `src/index.template.html`）は変更していない。ドキュメント上の契約記述の移設のみ。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:61:- 実装中の自己判断による追加変更: `docs/_conventions.md`（history.md 作成完了に伴う forward-reference 注記の除去）を一度編集したが、ホワイトリスト外・ついで作業と判断し `git checkout --` で復元・不採用。同様に `data/README.md` / `data/batches/README.md` の REPOSITORY-STRUCTURE.md 参照更新も、開発ゾーン（`data/**`）に該当するため実施後に復元・不採用（Issue の「全リポで grep 更新」要求と「開発ゾーンに触れない」制約が衝突したため、より明示的な制約であるゾーン規則を優先）。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:67:- 完了定義「`REPOSITORY-STRUCTURE.md` が削除され、参照が全て新ホームに更新（grep = 0、履歴記述除く）」: `docs/REPOSITORY-STRUCTURE.md` を削除。`grep -rln 'REPOSITORY-STRUCTURE' .`（`.git` 除く）の残存箇所は (a) 新規ファイル自身の「旧 `docs/REPOSITORY-STRUCTURE.md` を統合継承」という provenance 注記、(b) `docs/doc-map.md` の retire 完了記録、(c) `docs/SPECIFICATION.md` 変更履歴の historical entry、(d) `docs/agent-reports/` / `docs/cursor/reports/` / `docs/cursor/instructions/`（完了済み Phase の指示書）/ `docs/handoff/` / `docs/logs/` / `docs/vault-history/` / `docs/design/` / `docs/reference/`（一部、過去設計メモ）/ `audit/` / `migration/` 配下の historical archive、(e) `data/README.md` / `data/batches/README.md`（開発ゾーンのため今回は更新せず残置、下記申し送り参照）のみ。ライブなナビゲーション参照としての REPOSITORY-STRUCTURE.md 依存は解消。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:80:- `docs/_conventions.md`（history.md 作成予定注記）、`data/README.md`、`data/batches/README.md` は「全リポの REPOSITORY-STRUCTURE 参照更新」という完了定義と「開発ゾーンに触れない／ホワイトリスト厳守」という制約が直接衝突するケースだった。ゾーン制約をより明示的な指示として優先し、当該 3 ファイルは変更せず復元した。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:86:- `data/README.md` / `data/batches/README.md` に残る `docs/REPOSITORY-STRUCTURE.md` への参照 2 件は、次に data/** を触る Issue（または docs-only だが例外的にゾーン許可された Issue）で `docs/repo-map.md` / `docs/pipeline.md` に更新する必要がある。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:90:- `data/README.md`（1 箇所）・`data/batches/README.md`（1 箇所）の `docs/REPOSITORY-STRUCTURE.md` 参照が未更新のまま残存（開発ゾーン制約により本 PR では対応せず）。実害は軽微（人間/AI 向けドキュメントの pointer が旧ファイル名を指すのみ、404 リンクではなく単なる古い記述）だが、次回 data/** touch 時に修正推奨。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:126:- [x] 既存ファイルパスへの依存関係が壊れていない（`REPOSITORY-STRUCTURE.md` への参照は全てのライブ参照を新ホームへ付け替え済み。data/** の 2 箇所を除く）
docs/reference/c1-expansion-scope-design.md:177:- 入力: data/batches/phase2_mN_{count}_with_gloss.json  (Claude 側で生成)
docs/reference/c1-expansion-scope-design.md:261:これらは `data/batches/` に置いて Phase 2/3 の投入用語彙リストとして使う。
docs/reference/c1-expansion-scope-design.md:273:| **D3** | Multi-word entries (`according to`, `chest of drawers` 等) を将来的に扱うか | (α) 本 Wave で無視 / (β) connected_speech.json に統合 / (γ) 別データファイル新設 | **(α)** — 本 Wave のスコープ外。将来 connected speech 拡充時に検討 |
docs/reference/r4-pending-review-guide.md:4:- 対象: `data/pipeline/phase2a_review_needed.json` に記録された **127 語**
docs/reference/r4-pending-review-guide.md:72:**添付ファイル `data/pipeline/r4_pending_review_list.csv` を使う:**
docs/reference/r4-pending-review-guide.md:106:1. `data/pipeline/r4_confirmed_flap.json`（`y` 判定の narrow IPA リスト）
docs/reference/r4-pending-review-guide.md:107:2. `data/pipeline/r4_confirmed_no_flap.json`（`n` 判定リスト、確定済み記録）
docs/reference/r4-pending-review-guide.md:108:3. Cursor 指示書: これらを `wordlist_GA_a1a2_plus_phonics.json` にマージし、`generate_respelling.py` を再実行
docs/reference/r4-pending-review-guide.md:149:| `r4_pending_review_list.json` | `data/pipeline/` | 機械可読形式（Claude や Cursor で使用） |
docs/reference/r4-pending-review-guide.md:150:| `r4_pending_review_list.csv` | `data/pipeline/` | Naoya がレビュー時に列追記する作業ファイル |
docs/reference/r4-pending-review-guide.md:151:| `phase2a_review_needed.json` | `data/pipeline/` | 抽出元（127 語） |
docs/reference/r4-pending-review-guide.md:157:`data/pipeline/phase2b_respell_exceptions.json` に別途 10 語（`abruptly`, `agony`, `amongst` 等、すべて pilot 由来）が
docs/reference/phase2-m2-completion-summary.md:112:- `wordlist_GA_a1a2_plus_phonics.json`（+569 語、既存語不変）
docs/reference/phase2-m2-completion-summary.md:113:- `data/batches/phase2_pilot_180_with_gloss.json`（179 エントリ）
docs/reference/phase2-m2-completion-summary.md:114:- `data/batches/phase2_m2a_100_with_gloss.json`
docs/reference/phase2-m2-completion-summary.md:115:- `data/batches/phase2_m2b_100_with_gloss.json`
docs/reference/phase2-m2-completion-summary.md:116:- `data/batches/phase2_m2c_100_with_gloss.json`
docs/reference/phase2-m2-completion-summary.md:117:- `data/batches/phase2_m2d_90_with_gloss.json`
docs/reference/phase2-m2-completion-summary.md:121:- `data/derived/wordlist_with_neighbors.json` / `_slim.json`
docs/reference/phase2-m2-completion-summary.md:122:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`, `r4_pending_review_list.*`
docs/reference/phase2-m2-completion-summary.md:132:- `data/patches/rp_ipa_bugfix_patch.json`（17 語）
docs/reference/phase2-m2-completion-summary.md:133:- `data/patches/dignify_dignity_rp_hotfix.json`（2 語、別コミット）
docs/reference/combined-instructions-phase1-pilot-and-misc.md:12:CEFR-J Wordlist v1.5 との照合で判明した B1 拡充対象 1,769 語のうち、先頭 180 語（アルファベット順）をパイロットバッチとして、IPA・品詞・英語定義まで生成済みです。添付の `phase1_pilot_180.json` をそのまま `wordlist_GA_a1a2_plus_phonics.json` にマージしてください。
docs/reference/combined-instructions-phase1-pilot-and-misc.md:22:1. `phase1_pilot_180.json`（180エントリ）を `wordlist_GA_a1a2_plus_phonics.json` にマージ
docs/reference/combined-instructions-phase1-pilot-and-misc.md:44:main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/reference/combined-instructions-phase1-pilot-and-misc.md:61:json.dump(main, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
docs/reference/combined-instructions-phase1-pilot-and-misc.md:83:d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
docs/reference/combined-instructions-phase1-pilot-and-misc.md:110:  - wordlist_GA_a1a2_plus_phonics.json (+180 entries, gloss ja/zh/ko/fil pending)
docs/reference/combined-instructions-phase1-pilot-and-misc.md:113:  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)
docs/reference/cefr-connected-weak-proposal-report.md:13:各句・各語を構成語に分解し（短縮形は `don't`→`do`+`not` 等に展開）、現在の `wordlist_GA_a1a2_plus_phonics.json`（オリジナル3,059語 + Phase 1 M1-M3 で追加した980語 = 計4,037語のCEFRラベル）と照合。**構成語の中で最も高いCEFRレベル**を「語彙CEFR」としました。
docs/logs/2026/07/2026-07-17-phase-1-cluster-1-2-briefs-claude-design.md:207:- ファイル成果物は `/mnt/user-data/outputs/` に配置 + `present_files` で提示
docs/reference/README.md:9:**置かないもの:** パイプライン中間 JSON → [`../../data/pipeline/`](../../data/pipeline/)（例: R4 作業リスト）
docs/reference/README.md:30:| `r4-pending-review-guide.md` | R4 TTS レビュー手順（データ: `data/pipeline/r4_pending_review_list.*`） |
docs/reference/README.md:76:| Production wordlist | `wordlist_GA_a1a2_plus_phonics.json` |
docs/reference/README.md:79:| Connected speech | `data/connected_speech.json` |
docs/reference/wordlist-cefr-audit.md:4:> 対象: `wordlist_GA_a1a2_plus_phonics.json`
docs/reference/wordlist-cefr-audit.md:93:Backup written to: wordlist_GA_a1a2_plus_phonics.pre-phase0a.json
docs/reference/wordlist-cefr-audit.md:94:Updated file: wordlist_GA_a1a2_plus_phonics.json
docs/reference/wordlist-cefr-audit.md:127:`wordlist_GA_a1a2_plus_phonics.json` の 652 語の `cefr` を元の値（B1: 322語 / B2: 330語）に復元しました。詳細は `docs/cursor-instructions-cefr-phase0a-revert.md` を参照してください。
knowledge/examples/drill-answer-pane-brief.md:3:`ux-brief` skill の出力例。実データ(`wordlist_GA_a1a2_plus_phonics.json` 5397語)を実測して埋めたもの。**§A の被覆率が数値で入っている**のがポイント。
docs/reference/remaining-ops-checklist.md:55:| R4 pending **127** 語の TTS レビュー（narrow IPA） | `docs/reference/r4-pending-review-guide.md`、`data/pipeline/r4_pending_review_list.*` |
docs/reference/consultation-cefr-connected-weak.md:4:> 目的: `data/connected_speech.json`（連結音）と `data/weak_forms.json`（弱形）には現在 CEFR（A1–C1）が無く、出題カードで「A2」等を表示できない。各項目に CEFR を提案してほしい。
docs/reference/consultation-cefr-connected-weak.md:11:| 連結音 `connected_speech.json` | 201 | **なし** | 整数 `level` 1–3 |
docs/reference/consultation-cefr-connected-weak.md:12:| 弱形 `weak_forms.json` | 36 | **なし** | 整数 `level` 1–3 |
scripts/generate_respelling.py:326:            entry["note"] = "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
docs/reference/gloss-flags.md:3:> 生成日: 2026-07-09 ／ 対象: `wordlist_GA_a1a2_plus_phonics.json`
docs/reference/i18n-language-scaling.md:20:| 学習ガイド | `renderGuide()` | `guide.json[lang]` が無ければ **en** にフォールバック |
docs/reference/i18n-language-scaling.md:28:| **Tier 3** | `guide.json` 本文 | ガイドモーダルが母語化（UI キー `guide.*` とは別ファイル） |
docs/reference/i18n-language-scaling.md:46:│  wordlist_GA_a1a2_plus_phonics.json … gloss.{en,ja,zh,ko} × 3059 語 │
docs/reference/i18n-language-scaling.md:47:│  data/guide.json           … en / ja / ko / zh-Hans / zh-Hant │
docs/reference/i18n-language-scaling.md:48:│  data/connected_speech.json… cs_rule.{en,ja} × 201 句        │
docs/reference/i18n-language-scaling.md:49:│  data/weak_forms.json      … cs_rule.{en,ja} × 36 語         │
docs/reference/i18n-language-scaling.md:57:| 語義 | `wordlist_GA_a1a2_plus_phonics.json` `gloss` | en, ja, zh, ko | 対象外 |
docs/reference/i18n-language-scaling.md:58:| ガイド本文 | `data/guide.json` | en, ja, ko, zh-Hans, zh-Hant, fil | 対象外 |
docs/reference/i18n-language-scaling.md:84:| 7 | `wordlist_GA_a1a2_plus_phonics.json` の `gloss.<lang>` | 全 **3059 語**に訳を追加 | Mode B を `<lang>` で出すなら必須 |
docs/reference/i18n-language-scaling.md:92:| 10 | `data/guide.json` | `GUIDE_ORDER` 配下の全セクションを `<lang>`（または `zh-Hans` 等）で追加 | ○推奨（無いと英語ガイド） |
docs/reference/i18n-language-scaling.md:99:| 12 | `connected_speech.json` の `cs_rule.<lang>` | 201 句それぞれにルール文 | 連結句タブを `<lang>` で出すなら |
docs/reference/i18n-language-scaling.md:100:| 13 | `weak_forms.json` の `cs_rule.<lang>` | 36 語それぞれにルール文 | 弱形タブを `<lang>` で出すなら |
docs/reference/i18n-language-scaling.md:152:| `guide.*` | ガイドモーダルの開閉ラベルのみ | 本文は `guide.json` |
docs/reference/i18n-language-scaling.md:187:4. `data/guide.json` のトップレベルキー + `#guideLangPills`（ガイドは zh-Hans/zh-Hant 分割）
docs/reference/i18n-language-scaling.md:200:`validate_i18n.py` は UI + 音素のみ。`guide.json` や `cs_rule` の言語追加は **手動確認**が必要。
scripts/merge_respelling.py:48:        help="Respelling draft JSON (default: data/pipeline/phase2b_respell_draft.json)",
scripts/gen_rp_ipa_offline.py:2:"""Generate data/derived/rp_complete.json via rule-based GA→RP conversion."""
docs/reference/final-status-report.md:46:| 5 | （任意）connected_speech.json（201句）・weak_forms.json（36語）への narrow/respelling 拡張 | 未着手 | 低 — HANDOFF文書で当初から明示的にスコープ外とした領域。今回のテーマの直接の続きではなく、新規テーマとして持ち出す場合は別途相談 |
scripts/gen_neighbors.py:39:入力: wordlist_GA_a1a2_plus_phonics.json
scripts/gen_neighbors.py:40:出力: data/derived/wordlist_with_neighbors.json (元の全フィールド + neighbors)
scripts/gen_neighbors.py:41:     data/derived/wordlist_with_neighbors_slim.json (neighbors を string 配列に)
scripts/gen_ga_rp_same.py:360:    ap.add_argument("--wordlist", default="wordlist_GA_a1a2_plus_phonics.json")
scripts/gen_ga_rp_same.py:361:    ap.add_argument("--connected", default="data/connected_speech.json")
scripts/gen_ga_rp_same.py:362:    ap.add_argument("--weak", default="data/weak_forms.json")
scripts/paths.py:4:Runtime assets loaded by index.html keep stable URLs under data/ and repo root.
scripts/paths.py:12:WORDLIST = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
scripts/paths.py:13:WORDLIST_CSV = ROOT / "wordlist_GA_a1a2_plus_phonics.csv"
scripts/paths.py:14:WORDLIST_BACKUP_PHASE0A = DATA / "archive" / "wordlist_GA_a1a2_plus_phonics.pre-phase0a.json"
scripts/paths.py:17:CONNECTED_SPEECH = DATA / "connected_speech.json"
scripts/paths.py:18:WEAK_FORMS = DATA / "weak_forms.json"
scripts/paths.py:19:GUIDE = DATA / "guide.json"
scripts/fix_happy_i.py:14:Also updates data/connected_speech.json and data/weak_forms.json (should be no-op
scripts/export_batch_words.py:29:        f" * {len(words)} words from data/derived/wordlist_with_neighbors_slim.json",
.github/ISSUE_TEMPLATE/feature.md:23:  - `data/<file>.json`
.github/ISSUE_TEMPLATE/feature.md:61:- [ ] `wordlist_GA_a1a2_plus_phonics.json`
.github/ISSUE_TEMPLATE/feature.md:62:- [ ] `data/{connected_speech,weak_forms,guide}.json`
scripts/validate-cefr-tags.py:47:        default=root / "wordlist_GA_a1a2_plus_phonics.json",
scripts/validate-cefr-tags.py:55:            root / "data" / "connected_speech.json",
scripts/validate-cefr-tags.py:56:            root / "data" / "weak_forms.json",
.github/ISSUE_TEMPLATE/bug.md:43:（例: `index.html` 内の該当セクション、`data/*.json` の該当エントリ）
data/README.md:1:# `data/` — アプリデータとパイプライン資産
data/README.md:7:| **（直下）** | ✅ | `connected_speech.json`, `weak_forms.json`, `guide.json` — runtime 専用 |
data/README.md:14:**本番 wordlist** はリポジトリ**ルート**の `wordlist_GA_a1a2_plus_phonics.json`（`index.html` が fetch）。`data/` 内には置かない。
data/pipeline/phase2b_respell_pending.json:6:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:12:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:18:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:24:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:30:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:36:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:42:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:48:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:54:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:60:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:66:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:72:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:78:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:84:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:90:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:96:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:102:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:108:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:114:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:120:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:126:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:132:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:138:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:144:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:150:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:156:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:162:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:168:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:174:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:180:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:186:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:192:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:198:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:204:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:210:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:216:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:222:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:228:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:234:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:240:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:246:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:252:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:258:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:264:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:270:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:276:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:282:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:288:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:294:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:300:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:306:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:312:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:318:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:324:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:330:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:336:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:342:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:348:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:354:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:360:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:366:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:372:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:378:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:384:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:390:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:396:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:402:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:408:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:414:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:420:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:426:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:432:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:438:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:444:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:450:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:456:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:462:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:468:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:474:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:480:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:486:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:492:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:498:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:504:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:510:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:516:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:522:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:528:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:534:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:540:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:546:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:552:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:558:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:564:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:570:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:576:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:582:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:588:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:594:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:600:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:606:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:612:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:618:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:624:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:630:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:636:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:642:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:648:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:654:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:660:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:666:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:672:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:678:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:684:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:690:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:696:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:702:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:708:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:714:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:720:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:726:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:732:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:738:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:744:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:750:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:756:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/phase2b_respell_pending.json:762:    "note": "tentative — GA narrow IPA not yet confirmed by TTS review (see data/pipeline/phase2a_review_needed.json)"
data/pipeline/README.md:1:# `data/pipeline/` — IPA / respelling ステージング
data/archive/README.md:1:# `data/archive/` — local backups & snapshots
data/archive/README.md:7:| `wordlist_GA_a1a2_plus_phonics.pre-phase0a.json` | Phase 0-a 実施前の wordlist スナップショット（ローカル復元用） |
data/derived/README.md:1:# `data/derived/` — 派生データ（非 runtime）
migration/dry-run-04-summary.md:27:| 11 | README.md | 39 | `[`data/README.md`](data/README.md)` | ``data/README.md`` |
migration/dry-run-04-summary.md:28:| 12 | data/README.md | 24 | `[`docs/REPOSITORY-STRUCTURE.md`](../docs/REPOSITORY-STRUCTURE.md)` | ``docs/REPOSITORY-STRUCTURE.md`` |
migration/dry-run-04-summary.md:29:| 13 | data/batches/README.md | 39 | `[`docs/REPOSITORY-STRUCTURE.md`](../../docs/REPOSITORY-STRUCTURE.md)` | ``docs/REPOSITORY-STRUCTURE.md`` |
migration/dry-run-04-summary.md:30:| 14 | data/pipeline/README.md | 22 | `[`docs/reference/r4-pending-review-guide.md`](../../docs/reference/r4-pending-review-guide.md)` | ``docs/reference/r4-pending-review-guide.md`` |
migration/index-reverse.json:7:  "pj-2026-07-10-359a": "data/README.md",
migration/index-reverse.json:8:  "pj-2026-07-10-fc32": "data/archive/README.md",
migration/index-reverse.json:9:  "pj-2026-07-10-2e6a": "data/batches/README.md",
migration/index-reverse.json:10:  "pj-2026-07-10-c977": "data/derived/README.md",
migration/index-reverse.json:11:  "pj-2026-07-10-7d3b": "data/pipeline/README.md",
data/batches/README.md:1:# `data/batches/` — 語彙マージ用ソース JSON
data/batches/README.md:3:Cursor / Claude が生成し、マージスクリプト（またはインライン Python）で `wordlist_GA_a1a2_plus_phonics.json` に取り込むバッチ。**ブラウザからは読み込まない。**
src/index.template.html:1843:  const res = await fetch("wordlist_GA_a1a2_plus_phonics.json");
src/index.template.html:1879:  const res = await fetch("data/connected_speech.json");
src/index.template.html:1887:  const res = await fetch("data/weak_forms.json");
migration/index.json:8:  "data/archive/README.md": "pj-2026-07-10-fc32",
migration/index.json:9:  "data/batches/README.md": "pj-2026-07-10-2e6a",
migration/index.json:10:  "data/derived/README.md": "pj-2026-07-10-c977",
migration/index.json:11:  "data/pipeline/README.md": "pj-2026-07-10-7d3b",
migration/index.json:12:  "data/README.md": "pj-2026-07-10-359a",
```

---

## 4. Grep C: `scripts/` 参照

```
grep -rn "scripts/build-i18n-html\|scripts/gen_\|scripts/" --include="*.md" --include="*.json" --include="*.yml" .
```

ヒット 438 件（全件、省略なし）:

```
vercel.json:2:  "buildCommand": "node scripts/build-i18n-html.js",
README.md:45:| `scripts/paths.py` | パイプライン用パス正本 |
package.json:6:    "build": "node scripts/build-i18n-html.js"
gas/README.md:99:| `BatchWords.gs` | 語彙リスト（`scripts/export_batch_words.py` で生成。入力: `data/derived/wordlist_with_neighbors_slim.json`） |
gas/README.md:104:python3 scripts/export_batch_words.py
CLAUDE.md:97:- wordlist / `rp_ipa` / `neighbors` / connected_speech / weak_forms を触ったら該当の再カウント・`scripts/gen_*.py` 再実行（コマンドは `docs/pipeline.md`）。
.claude/settings.json:27:      "Bash(python3 scripts/:*)",
.claude/agents/issue-handler.md:49:  - wordlist / `rp_ipa` / `neighbors` / connected_speech / weak_forms を触ったら該当の再カウント・`scripts/gen_*.py` 再実行
.claude/agents/pr-reviewer.md:84:  開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）を
.claude/agents/pr-reviewer.md:94:  wordlist 再カウント一致、`scripts/gen_*.py` 再実行の diff がゼロ。（12観点 #4, #5）
docs/tts-design.md:85:全 **5,397** 語の GA 音声を Google Drive に事前ストックするオフラインジョブ。`gas/BatchWarm.gs` + `gas/BatchWords.gs`（`scripts/export_batch_words.py` で生成）。
docs/repo-map.md:11:- **フロントエンド**: `src/index.template.html` + ビルドスクリプト（`scripts/build-i18n-html.js`）で 6 言語版 HTML を生成 + 純粋 JS + JSON データ
docs/repo-map.md:14:- **データ生成パイプライン**: Python（`scripts/*.py`、ローカル実行。コマンドは `docs/pipeline.md`）
docs/repo-map.md:26:| **Pipeline** | `scripts/*.py` read/write `data/pipeline/` staging JSON, merge into wordlist（コマンドは `docs/pipeline.md`） |
docs/repo-map.md:58:├── package.json                # `npm run build` → `scripts/build-i18n-html.js`
docs/repo-map.md:107:├── scripts/                   # Python pipeline + `build-i18n-html.js`（paths.py が Python パス正本）→ `docs/pipeline.md`
docs/repo-map.md:126:| Build system | Node.js | `scripts/build-i18n-html.js`（6 言語 HTML 生成） |
docs/repo-map.md:128:| Vercel Build Command | `node scripts/build-i18n-html.js` | `vercel.json` / Dashboard Build & Development Settings |
docs/repo-map.md:143:- 対象: `src/index.template.html`（inline CSS/JS）、`scripts/build-i18n-html.js` で 6 言語版 HTML 生成、Vercel カスタムドメイン運用
docs/repo-map.md:162:（`scripts/gen_impact_ledger.py` による静的解析生成物。symbol 昇順の JSON 配列）。
docs/repo-map.md:189:Vercel は main への push で自動デプロイ（Build Command: `node scripts/build-i18n-html.js`）。詳細は `docs/OPERATIONS.md` § 1「Vercel デプロイ」を参照。
docs/data-contract.md:70:| `ga_rp_same` | GA と RP が学習者にとって実質同じか（`scripts/gen_ga_rp_same.py` で付与） |
docs/data-contract.md:91:`scripts/gen_ga_rp_same.py` により全語彙一括で生成される派生フィールドで、`ipa` / `rp_ipa` / `ipa_actual_ga` から決定的に導出される（LLM 判定なし）。
docs/data-contract.md:131:> `scripts/gen_ga_rp_same.py` の改修で追加された場合、本表を更新すること。
docs/data-contract.md:159:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/data-contract.md:161:python3 scripts/fix_happy_i.py   # その後 gen_ga_rp_same を再実行
docs/data-contract.md:267:| `rp_ipa` フィールド | `scripts/gen_ga_rp_same.py` 再実行、same/different 内訳の再確認 |
docs/data-contract.md:268:| `neighbors` フィールド | `scripts/gen_neighbors.py` 再実行、0近傍率の変化確認 |
docs/data-contract.md:272:| `gas/BatchWords.gs` | `scripts/export_batch_words.py` で再生成 |
docs/pipeline.md:6:**パスの正本**: `scripts/paths.py` が canonical paths を定義する。ハードコード文字列より import を優先すること。
docs/pipeline.md:16:python3 scripts/generate_flap_ipa.py
docs/pipeline.md:17:python3 scripts/merge_flap_candidates.py
docs/pipeline.md:18:python3 scripts/generate_respelling.py
docs/pipeline.md:19:python3 scripts/merge_respelling.py
docs/pipeline.md:20:python3 scripts/gen_neighbors.py
docs/pipeline.md:21:python3 scripts/merge_neighbors.py
docs/pipeline.md:22:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/pipeline.md:23:python3 scripts/export_batch_words.py
docs/pipeline.md:26:python3 scripts/fix_happy_i.py   # word-final /iː/ or /ɪ/ → /i/ (then re-run gen_ga_rp_same)
docs/pipeline.md:39:| `scripts/phonology_lexicon.py` | 共有語彙リスト（`BATH_WORDS_BASE`, `PALM_WORDS`, `YOD_CORONALS`）— `ga_to_rp.py` と `gen_ga_rp_same.py` から import |
docs/pipeline.md:40:| `scripts/fix_happy_i.py` | rp_ipa の happY 位置 `/iː/`/`/ɪ/` → `/i/` 是正（Phase R2 で1回実行済み。将来バッチ追加時にも実行推奨） |
docs/pipeline.md:41:| `scripts/gen_ga_rp_same.py` | `ga_rp_same` / `ga_rp_same_reason` 一括付与（分類器） |
docs/pipeline.md:42:| `scripts/ga_to_rp.py` | GA→RP ルール変換（**offline fallback のみ**。本番 `rp_ipa` は Claude バッチ同梱） |
docs/pipeline.md:43:| `scripts/gen_rp_ipa.py` | Claude API で RP IPA 生成（新規バッチ用。SYSTEM_PROMPT に happY ルールあり） |
docs/guardrails.md:87:共通シンボル（`scope=shared` または `scope=library`。例: `t()` / `activeIpa()` / `setExclusivePage` / `navigate` / `loadWordlist` 等）を編集する Issue・実装エージェントは、`docs/impact-ledger.json`（`scripts/gen_impact_ledger.py` 生成）の `caller_areas` を引き、実際の影響範囲が Issue 宣言 scope と異なる場合は **halt** する（`CLAUDE.md` halt トリガー (c)）。4 ステップの手順・スキーマ・scope 閾値・編集エージェントの更新義務は `docs/impact-ledger.md#impact-analysis-halt` が正本（重複させない）。
docs/history.md:101:| Alt-accent same display | `/ipa/（同じ）` via `ga_rp_same` flag（`scripts/gen_ga_rp_same.py`） |
docs/history.md:123:| 2026-07-10 | v3.21 | Phase R (Repair): 分類器 dead-code 3件活性化（`cot_caught`, `square_near_cure`, BATH+weak composite）、`gen_rp_ipa.py` SYSTEM_PROMPT の happY ルール追加、rp_ipa 91語（happY 過剰伸長 82 + `/ɪ/` 表記ゆれ 9）を一括是正、`scripts/phonology_lexicon.py` に BATH_WORDS/PALM_WORDS を統合、`ga_to_rp.py` fallback の PALM/happY/yod latent bug 修正。 |
docs/history.md:128:| 2026-07-09 | v3.11 | リポジトリ構成を整理（`data/batches`・`data/pipeline`・`data/patches`・`docs/cursor` 等）。`docs/REPOSITORY-STRUCTURE.md` 追加（**Issue #172 でこの旧ファイルは retire、内容は data-contract/tts-design/pipeline/repo-map/history へ移設**）。`scripts/paths.py` でパス正本化。 |
docs/history.md:170:- `phase2a_flap_candidates.json` の 186 語を `scripts/merge_flap_candidates.py` で一括マージ
docs/history.md:176:- `phase2b_respell_draft.json` の 3,007 語を `scripts/merge_respelling.py` で一括マージ
docs/history.md:184:- pilot 由来の誤 narrow 3語（`winter`, `twenty`, `ninety`）を `scripts/merge_phase2a_final.py` で除去
docs/history.md:194:| `scripts/gen_ga_rp_same.py` | `ga_rp_same` / `ga_rp_same_reason` 付与。`cot_caught`・`square_near_cure`・BATH+weak composite を活性化 |
docs/history.md:195:| `scripts/fix_happy_i.py` | word-final happY の `/iː/`・`/ɪ/` → `/i/` 一括是正（91語） |
docs/history.md:196:| `scripts/phonology_lexicon.py` | `BATH_WORDS_BASE`・`PALM_WORDS`・`YOD_CORONALS` を `ga_to_rp.py` と共有 |
docs/history.md:197:| `scripts/ga_to_rp.py` | offline fallback（PALM guard・yod・happY skip） |
docs/history.md:198:| `scripts/gen_rp_ipa.py` | 新規バッチ用 Claude API。SYSTEM_PROMPT に happY ルールあり |
docs/history.md:261:| 2026-07-09 | v3.15 `ga_rp_same` / `ga_rp_same_reason` フラグ導入（`scripts/gen_ga_rp_same.py`）。UI 同一判定をフラグ参照に切替 |
docs/OPERATIONS.md:13:- ビルドコマンド: `node scripts/build-i18n-html.js`（F2 で導入）
docs/OPERATIONS.md:148:| 特定単語だけ音が変 | GAS BatchWords 未更新 | `python3 scripts/export_batch_words.py` を実行、GAS 更新 |
docs/impact-ledger.md:14:生成器: `scripts/gen_impact_ledger.py`。データ本体: `docs/impact-ledger.json`（symbol 昇順の JSON 配列）。
docs/impact-ledger.md:77:> かつ Issue の worked example 自体が閾値ルールより緩い「shared」ラベルを指定している）。この 1 件は `scripts/gen_impact_ledger.py` の
docs/impact-ledger.md:101:python3 scripts/gen_impact_ledger.py          # docs/impact-ledger.json を再生成（上書き）
docs/impact-ledger.md:102:python3 scripts/gen_impact_ledger.py --check  # 生成物が最新か検査するのみ（差分があれば exit 1）
docs/impact-ledger.md:112:`src/index.template.html` 内の関数を**追加・改名・移動**した実装エージェントは、当該 PR で `python3 scripts/gen_impact_ledger.py`
docs/impact-ledger.md:115:`scripts/gen_impact_ledger.py` 冒頭の `EXACT_AREA` / `PREFIX_RULES` / `SEED_OVERRIDES` を編集し、再生成後に diff を確認する。
docs/LAUNCH-CHECKLIST.md:113:- 各言語別に静的 HTML をビルド時生成（`scripts/build-i18n-html.js`）
docs/LAUNCH-CHECKLIST.md:124:- [x] `scripts/build-i18n-html.js` 新規追加（i18n/*.json の meta を index.html テンプレートに埋め込み、6 言語版 HTML 生成）（Issue #39）
docs/CSS-CONVENTIONS.md:50:- `<style>` ブロックは 6 言語で **共通**（`scripts/build-i18n-html.js` がテンプレートから生成）
docs/doc-map.md:44:| ソースシンボル → feature_ids → scope → caller_areas | `docs/impact-ledger.json` | exists | ソース共通シンボル変更時（`scripts/gen_impact_ledger.py` 再実行） |
docs/vault-history/design-decisions.md:506:- `scripts/validate-cefr-tags.py` 新規、`wordlist_GA_a1a2_plus_phonics.json` + optional (`data/connected_speech.json` / `data/weak_forms.json`)
docs/design/phase-0/phase-0-stage-2-doc-impl-reconciliation.md:65:| A-16 | i18n build-only キー: `meta.title`, `meta.description`, `meta.ogTitle`, `meta.ogDescription` (`scripts/build-i18n-html.js` のみ参照) | P3 | i18n-css §A.0 | SPEC §6 |
docs/cursor/instructions/cursor-instructions-phase1-m2.md:81:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase1-m2.md:82:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase1-m2.md:83:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m2.md:84:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:45:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:46:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:47:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:48:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:51:python3 scripts/gen_rp_ipa.py    # rp_progress.json で再開可
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:52:python3 scripts/merge_rp_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:55:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:56:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:14:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:15:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:16:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:17:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:18:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:19:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:20:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase1-m3.md:70:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase1-m3.md:71:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase1-m3.md:72:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m3.md:73:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:13:Opus 3スクリプトレビュー（`scripts/ga_to_rp.py` / `scripts/gen_neighbors.py` / `scripts/gen_ga_rp_same.py`）で以下が判明した。追加で `scripts/gen_rp_ipa.py` の SYSTEM_PROMPT にも同種のルール欠陥が見つかり、**過去に Claude API または batch 生成で作られた rp_ipa データが 91 語 実際に破損**している。
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:17:| **R1** | 分類器 dead-code 3件を活性化・composite ギャップ修正 | `scripts/gen_ga_rp_same.py` | reason のみ再分類（フラグ変化なし） |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:18:| **R2** | RP 生成プロンプト修正 + happY 過剰伸長 **82語** + 表記ゆれ **9語** を一括是正 | `scripts/gen_rp_ipa.py`, `scripts/fix_happy_i.py`（新規）, wordlist | rp_ipa 修正 91語 |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:19:| **R3** | `ga_to_rp.py` fallback の最小修正 + BATH_WORDS 統一 | `scripts/ga_to_rp.py`, `scripts/phonology_lexicon.py`（新規） | fallback は未使用のため実データ変化なし |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:80:`scripts/gen_ga_rp_same.py` の分類ロジックに以下 **3件の dead code / 分類ギャップ**があることが Opus レビュー + 実データで確認された:
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:90:**ファイル:** `scripts/gen_ga_rp_same.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:192:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:260:git add scripts/gen_ga_rp_same.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:274:`scripts/gen_rp_ipa.py` の SYSTEM_PROMPT ルール #4 に `GA /i/ → RP /iː/` という無条件伸長ルールがあり、**word-final 弱形の happY 母音（-y, -ly, -ry, -ery, -ty, ...）に例外指定がない**。この結果、本番 wordlist の rp_ipa に以下 2 種類の破損が確認された:
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:281:## R2-2. 変更内容 (a): `scripts/gen_rp_ipa.py` SYSTEM_PROMPT 更新
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:318:## R2-3. 変更内容 (b): 修正スクリプト `scripts/fix_happy_i.py` 新規作成
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:320:**ファイル:** `scripts/fix_happy_i.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:470:python3 scripts/fix_happy_i.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:514:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:543:git add scripts/gen_rp_ipa.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:544:        scripts/fix_happy_i.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:555:Data repair via scripts/fix_happy_i.py with orthographic + stress-position filter."
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:564:`scripts/ga_to_rp.py` は Phase 2 以降 fallback として使われておらず、`rp_ipa` は Claude batch 同梱方式で生成されている（本番データに `ga_to_rp` の直接寄与は無いと確認済）。ただし将来の retroactive 実行や他ツール連携で使われる可能性があるため、以下の **latent bug** を潰す:
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:575:**ファイル:** `scripts/phonology_lexicon.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:644:## R3-3. 変更内容 (b): `scripts/ga_to_rp.py` の修正
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:777:## R3-4. 変更内容 (c): `scripts/gen_ga_rp_same.py` の BATH_WORDS を共通モジュールに切替
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:853:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:868:git add scripts/phonology_lexicon.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:869:        scripts/ga_to_rp.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:870:        scripts/gen_ga_rp_same.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:877:- New scripts/phonology_lexicon.py consolidates BATH_WORDS_BASE, PALM_WORDS, YOD_CORONALS
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:898:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:899:python3 scripts/merge_neighbors.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:902:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:905:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:962:| 2026-07-XX | v3.21 | Phase R (Repair): 分類器 dead-code 3件活性化（`cot_caught`, `square_near_cure`, BATH+weak composite）、`gen_rp_ipa.py` SYSTEM_PROMPT の happY ルール追加、rp_ipa 91語（happY 過剰伸長 82 + `/ɪ/` 表記ゆれ 9）を一括是正、`scripts/phonology_lexicon.py` に BATH_WORDS/PALM_WORDS を統合、`ga_to_rp.py` fallback の PALM/happY/yod latent bug 修正。 |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:967:### (b) `docs/REPOSITORY-STRUCTURE.md` の `scripts/` セクションに追記
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:970:| `scripts/phonology_lexicon.py` | 共有語彙リスト（BATH_WORDS, PALM_WORDS, YOD_CORONALS）— `ga_to_rp.py` と `gen_ga_rp_same.py` から import |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:971:| `scripts/fix_happy_i.py` | rp_ipa の happY 位置 `/iː/`/`/ɪ/` → `/i/` 是正スクリプト（Phase R2 で1回実行済み。将来のバッチ追加時にも実行推奨） |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1138:- `scripts/phonology_lexicon.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1139:- `scripts/fix_happy_i.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1143:- `scripts/gen_ga_rp_same.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1144:- `scripts/gen_rp_ipa.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1145:- `scripts/ga_to_rp.py`
docs/cursor/instructions/cursor-instructions-fix-merge-respelling.md:11:`scripts/merge_respelling.py`（または該当パス）を開き、以下を確認してください:
docs/cursor/instructions/cursor-instructions-fix-merge-respelling.md:47:3. 簡単なテスト: 現状のリポジトリで `python3 scripts/merge_respelling.py` を（新規マージなしで）再実行し、`git diff --stat wordlist_GA_a1a2_plus_phonics.json` が **無変更**であることを確認（idempotent であるべき）
docs/cursor/instructions/cursor-instructions-fix-merge-respelling.md:60:  - scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:50:1. データ是正スクリプト `scripts/apply_phonics_cefr_null.py` の新規作成
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:71:`scripts/apply_phonics_cefr_null.py` を新規作成してください。以下は参考実装で、そのまま使用可能です（動作確認済み。Cursor 側で必要に応じて改善可）:
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:163:python3 scripts/apply_phonics_cefr_null.py
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:282:<`python3 scripts/apply_phonics_cefr_null.py` の出力をここに貼り付け>
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:411:2. `python3 scripts/apply_phonics_cefr_null.py` の完全な実行出力
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:447:  - scripts/apply_phonics_cefr_null.py (new)
docs/cursor/instructions/cursor-instructions-dignify-hotfix.md:47:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:23:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:24:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:25:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:26:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:27:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:28:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:29:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:27:3. `scripts/generate_flap_ipa.py` / `scripts/generate_respelling.py` を実行し narrow IPA・respelling を生成
docs/cursor/instructions/cursor-instructions-phase1-m5.md:35:- `gas/BatchWords.gs` の更新（`scripts/export_batch_words.py` 実行は別タスクとして依頼予定）
docs/cursor/instructions/cursor-instructions-phase1-m5.md:74:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:75:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:76:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:77:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:158:2. **`gas/BatchWords.gs` 更新**: `scripts/export_batch_words.py` を実行し、4,828語版のバッチワードリストで GAS を再デプロイ
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:47:- `scripts/apply_phonics_cefr_null.py` の削除（**削除しない**。誤った判断とその訂正の記録として残す。ただし本番データへの再実行は今後禁止する旨をコメントに追記）
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:125:### 2-5. `scripts/apply_phonics_cefr_null.py` への注記追加
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:268:6. `scripts/apply_phonics_cefr_null.py` への警告コメント追加の確認
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:285:  - scripts/apply_phonics_cefr_null.py (add historical warning comment)
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:6:  カバー率不足そのものより深刻な **`scripts/ga_to_rp.py` のロジックバグ**を発見
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:15:`scripts/ga_to_rp.py`（GA→RP のオフラインルール変換、Britfone/Claude API が使えない時の最終フォールバック）が、
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:60:`scripts/ga_to_rp.py` を別途受領のファイルに差し替える。
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:90:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:98:git add scripts/ga_to_rp.py \
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:114:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:141:| 1 | `scripts/ga_to_rp.py` 差し替え | 完了 |
docs/cursor/instructions/cursor-instructions-phase1-m4.md:72:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase1-m4.md:73:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase1-m4.md:74:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m4.md:75:python3 scripts/merge_respelling.py
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:19:現状は Node 依存のない静的サイト構成。F2 の `scripts/build-i18n-html.js` 導入時は `package.json` の新規追加が必要。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:35:**ディレクトリ:** `.cursor/`, `.github/`, `data/`, `docs/`, `fonts/`, `gas/`, `i18n/`, `scripts/`, `tests/`, `tools/`
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:39:Issue 例示の `index.html` / `README.md` / `wordlist_*` / `CLAUDE.md` **以外**のルート要素: `.cursor/`, `.github/`, `.gitignore`, `data/`, `docs/`, `fonts/`, `gas/`, `i18n/`, `scripts/`, `tests/`, `tools/`
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:48:scripts/*.log
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:109:Python ツールは `scripts/`・`tools/` に存在。Node ビルドは完全に新規導入領域。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:130:1. **新規追加は概ね安全:** `vercel.json`, `package.json`, `src/index.template.html`, `scripts/build-i18n-html.js`, `middleware.ts`（任意）, `/en/`…`/fil/` は既存と非衝突。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:132:3. **デプロイ経路:** GitHub Actions を触らず、Vercel の Build Command（例: `node scripts/build-i18n-html.js`）+ Output 設定、または生成物コミット + Build なし、のどちらかを Issue で一本化すること。
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:14:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:15:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:16:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:17:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:18:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:19:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:20:python3 scripts/export_batch_words.py
docs/cursor/recon/pre-issue-recon-20260716-index-html-i18n-css-storage.md:21:| build のみ（`scripts/build-i18n-html.js`） | `meta.title` / `description` / `ogTitle` / `ogDescription` |
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:28:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:29:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:30:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:31:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:32:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:9:`scripts/gen_neighbors.py` を v2（語長適応型 MAX_DIST）に差し替え、全 4,828 語の neighbors を再計算した。派生 JSON・レポートを更新し、GitHub Pages 向けに `merge_neighbors.py` で本番 wordlist へ反映、`export_batch_words.py` で `gas/BatchWords.gs` を 4,828 語に更新した。
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:80:| `scripts/gen_neighbors.py` | v2 適応型アルゴリズムに差し替え |
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:97:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:98:python3 scripts/merge_neighbors.py      # GitHub Pages ランタイム用
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:99:python3 scripts/export_batch_words.py   # GAS 語彙リスト用
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:479:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:480:python3 scripts/merge_neighbors.py
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:483:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:486:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:12:Added `scripts/merge_flap_candidates.py` and executed:
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:15:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:86:python3 scripts/verify_tokenize_narrow.py
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:118:- [x] `scripts/merge_flap_candidates.py` created
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:28:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:29:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:30:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:31:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:32:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:33:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:34:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:35:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:30:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:31:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:33:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-phase2b-respell-merge.md:9:Added `scripts/merge_respelling.py` and executed:
docs/cursor/reports/cursor-implementation-report-phase2b-respell-merge.md:12:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2b-respell-merge.md:91:- [x] `scripts/merge_respelling.py` created
docs/cursor/reports/cursor-implementation-report.md:76:| **キュレーション辞書（採用）** | 133語: `scripts/expand_polysemy_gloss.py` の `MANUAL` |
docs/cursor/reports/cursor-implementation-report.md:77:| **オフライン JSON（採用）** | 108語: `scripts/remaining_polysemy_data.json` |
docs/cursor/reports/cursor-implementation-report.md:134:| `scripts/expand_polysemy_gloss.py` | 新規 | 多義語展開スクリプト（MANUAL + clear 再適用） |
docs/cursor/reports/cursor-implementation-report.md:135:| `scripts/remaining_polysemy_data.json` | 新規 | 残り108語のオフライン多義語辞書 |
docs/cursor/reports/cursor-implementation-report.md:140:**意図的にコミットしていないもの:** `scripts/gloss_build.log`, `scripts/phonemes_build.log`（ビルドログ）
docs/cursor/reports/cursor-implementation-report-phase1-narrow-ipa-respell.md:16:- `scripts/merge_pilot_narrow_respell.py` を新規作成
docs/cursor/reports/cursor-implementation-report-fix-friendliness-ipa.md:33:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-fix-friendliness-ipa.md:34:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:30:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:31:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:32:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:33:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:36:`generate_flap_ipa.py` はリポジトリに未同梱だったため、過去 Phase 2a 添付版を `scripts/generate_flap_ipa.py` として追加して実行。
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:112:- `scripts/generate_flap_ipa.py`（新規追加）
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:127:A  scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-setup-governance.md:40:- 既存機能への影響: なし（`index.html` / `data/` / `scripts/` / `gas/` / `i18n/` / `fonts/` 未変更）
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:16:- Phase 3: `scripts/build-i18n-html.js`、`middleware.ts`、`vercel.json`、`package.json`、`.gitignore` 更新
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:24:- scripts/build-i18n-html.js (A)
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:29:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:30:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:31:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:32:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-step4a.md:33:| スクリプト | `scripts/merge_basic_words.py` |
docs/cursor/reports/cursor-implementation-report-step4a.md:80:| `scripts/merge_basic_words.py` | 本番 wordlist へのマージ |
docs/cursor/reports/cursor-implementation-report-step4a.md:81:| `scripts/gen_basic_words.py` | 再生成・監査用（CMU 辞書から patch 生成） |
docs/cursor/reports/cursor-implementation-report-step6.md:107:> **注意:** `scripts/merge_rp_ipa.py` は `data/connected_speech_with_rp.json`（旧15句）で上書きするため、STEP6 以降は **実行しないこと**。連結句の正本は `data/connected_speech.json`。
docs/cursor/reports/cursor-implementation-report-gsc-coverage-alert.md:14:- `scripts/build-i18n-html.js`: `hreflangBlock()` の `x-default` href を `https://ipasounddrill.app/` → `https://ipasounddrill.app/en/` に変更
docs/cursor/reports/cursor-implementation-report-gsc-coverage-alert.md:23:- scripts/build-i18n-html.js (M)
docs/cursor/reports/cursor-implementation-report-gsc-coverage-alert.md:33:- `node scripts/build-i18n-html.js` を実行し、生成された `en/index.html` 等の hreflang x-default が `https://ipasounddrill.app/en/` を指すことを確認
docs/cursor/reports/cursor-implementation-report-step4e.md:32:| スクリプト | `scripts/merge_casual.py` |
docs/cursor/reports/cursor-implementation-report-step4e.md:103:python3 scripts/merge_casual.py
docs/cursor/reports/cursor-implementation-report-step4e.md:104:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4e.md:105:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:41:python3 scripts/merge_rp_ipa.py
docs/cursor/reports/cursor-implementation-report-respell-v2-patch.md:17:| `scripts/generate_respelling.py` | Added (v2 logic with syllabic+coda fix) |
docs/cursor/reports/cursor-implementation-report-respell-v2-patch.md:25:python3 scripts/merge_respelling.py --draft phase2b_respell_draft_v2.json --no-clear-pending
docs/cursor/reports/cursor-implementation-report-respell-v2-patch.md:82:- [x] `generate_respelling.py` v2 added to `scripts/`
docs/cursor/reports/cursor-implementation-report-step4d.md:35:| スクリプト | `scripts/merge_thin_phonemes.py` |
docs/cursor/reports/cursor-implementation-report-step4d.md:91:| `scripts/merge_thin_phonemes.py` | 本番 wordlist へのマージ |
docs/cursor/reports/cursor-implementation-report-step4d.md:92:| `scripts/gen_thin_phoneme_words.py` | 再生成・監査用 |
docs/cursor/reports/cursor-implementation-report-step4d.md:113:python3 scripts/merge_thin_phonemes.py
docs/cursor/reports/cursor-implementation-report-step4d.md:114:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4d.md:115:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-g1-legal-docs.md:47:- 既存機能への影響: `src/index.template.html`、runtime data contract 8 パス、`i18n/`、`data/`、`scripts/`、`tools/`、`gas/` は未変更
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:28:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:29:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:30:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:31:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-cefr-phase0a-revert.md:10:- `scripts/apply_phonics_cefr_null.py`（再実行禁止の履歴警告を追加）
docs/cursor/reports/cursor-implementation-report-cefr-phase0a-revert.md:78: M scripts/apply_phonics_cefr_null.py
docs/cursor/reports/cursor-implementation-report-step5.md:28:API キー未設定のため、**ルールベース変換**（`scripts/ga_to_rp.py`）で `data/rp_complete.json` を生成しマージ。
docs/cursor/reports/cursor-implementation-report-step5.md:34:| 実行 | `python3 scripts/gen_rp_ipa.py`（39 バッチ） |
docs/cursor/reports/cursor-implementation-report-step5.md:36:| マージ | `cp rp_complete.json data/rp_complete.json` → `python3 scripts/merge_rp_ipa.py` |
docs/cursor/reports/cursor-implementation-report-step5.md:40:オフライン版スクリプト（`scripts/gen_rp_ipa_offline.py` / `scripts/ga_to_rp.py`）はフォールバック用として残置。
docs/cursor/reports/cursor-implementation-report-step5.md:51:| スクリプト | `scripts/merge_rp_ipa.py` |
docs/cursor/reports/cursor-implementation-report-step5.md:112:| `scripts/ga_to_rp.py` | 新規 |
docs/cursor/reports/cursor-implementation-report-step5.md:113:| `scripts/gen_rp_ipa_offline.py` | 新規 |
docs/cursor/reports/cursor-implementation-report-step5.md:114:| `scripts/merge_rp_ipa.py` | 新規 |
docs/cursor/reports/cursor-implementation-report-step5.md:115:| `scripts/gen_rp_ipa.py` | 配置（API 版） |
docs/cursor/reports/cursor-implementation-report-step5.md:116:| `scripts/gen_connected_rp.py` | 配置（監査用） |
docs/cursor/reports/cursor-implementation-report-step4b.md:40:| スクリプト | `scripts/merge_neighbors.py` |
docs/cursor/reports/cursor-implementation-report-step4b.md:67:| `scripts/merge_neighbors.py` | 本番 wordlist への neighbors マージ＋検証 |
docs/cursor/reports/cursor-implementation-report-step4b.md:68:| `scripts/gen_neighbors.py` | 語彙変更後の neighbors 再生成（K=8, MAX_DIST=2） |
docs/cursor/reports/cursor-implementation-report-step4b.md:112:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4b.md:133:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4b.md:135:python3 scripts/merge_neighbors.py   # slim 源を更新した場合は slim も再出力が必要
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:42:- `scripts/paths.py` — `DATA` 定義順の修正、`R4_REVIEW_LIST_*`, `GA_RP_SAME_REPORT`, `ARCHIVE` 追加
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:43:- `.gitignore` — `scripts/*.log` 追加
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:63:- `scripts/paths.py` の `DATA` 使用前定義バグを修正（`WORDLIST_BACKUP_PHASE0A`）
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:47:- `scripts/validate-cefr-tags.py` + `.github/workflows/validate-cefr-tags.yml`
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:87:scripts/validate-cefr-tags.py
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:118:- `python3 scripts/validate-cefr-tags.py` → OK
docs/cursor/reports/cursor-implementation-report-fix-merge-respelling.md:11:`scripts/merge_respelling.py` には次の処理があった:
docs/cursor/reports/cursor-implementation-report-fix-merge-respelling.md:46:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-fix-merge-respelling.md:57:- `scripts/merge_respelling.py`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:30:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:31:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:33:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-step4c.md:46:| スクリプト | `scripts/merge_irregular_forms.py` |
docs/cursor/reports/cursor-implementation-report-step4c.md:54:語彙追加に伴い `scripts/gen_neighbors.py`（K=8, MAX_DIST=2）で全語再計算し、`scripts/merge_neighbors.py` で本番へ反映。
docs/cursor/reports/cursor-implementation-report-step4c.md:86:| `scripts/merge_irregular_forms.py` | 本番 wordlist へのマージ |
docs/cursor/reports/cursor-implementation-report-step4c.md:87:| `scripts/gen_irregular_forms.py` | 再生成・監査用 |
docs/cursor/reports/cursor-implementation-report-step4c.md:106:python3 scripts/merge_irregular_forms.py
docs/cursor/reports/cursor-implementation-report-step4c.md:107:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4c.md:108:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:36:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:37:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:38:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:39:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:109:- `scripts/merge_respelling.py`（恒久修正）
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:10:GA/RP が学習者にとって実質同じかを、ルールベース分類器 `scripts/gen_ga_rp_same.py` で事前フラグ化し、Reveal 画面・語彙ブラウザの「同じ」表示判定を `c.ga_rp_same` 参照に切り替えた。
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:86:| `scripts/gen_ga_rp_same.py` | 新規 — ルールベース分類器 |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:105:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:11:| Added | `scripts/apply_phonics_cefr_null.py` |
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:76:- [x] `scripts/apply_phonics_cefr_null.py` created
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:31:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:32:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:33:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-rp-neighbors-decision.md:54:| `scripts/audit_rp_neighbors.py` | 監査スクリプト新規 |
docs/cursor/reports/cursor-implementation-report-rp-neighbors-decision.md:76:| `scripts/gen_neighbors.py` | 将来手順メモ |
docs/cursor/reports/cursor-implementation-report-rp-neighbors-decision.md:77:| `scripts/audit_rp_neighbors.py` | 新規 |
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:30:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:31:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:33:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-phase2-final-merge.md:37:Added `scripts/merge_phase2a_final.py` and executed:
docs/cursor/reports/cursor-implementation-report-phase2-final-merge.md:40:python3 scripts/merge_phase2a_final.py
docs/cursor/reports/cursor-implementation-report-phase2-final-merge.md:67:Extended `scripts/merge_respelling.py` with `--draft` / `--no-clear-pending` flags.
docs/cursor/reports/cursor-implementation-report-phase2-final-merge.md:72:python3 scripts/merge_respelling.py --draft phase2b_respell_final_52.json --no-clear-pending
docs/cursor/reports/cursor-implementation-report-phase-r.md:106:| 新規 | `scripts/fix_happy_i.py`, `scripts/phonology_lexicon.py` |
docs/cursor/reports/cursor-implementation-report-phase-r.md:107:| 修正 | `scripts/gen_ga_rp_same.py`, `scripts/gen_rp_ipa.py`, `scripts/ga_to_rp.py` |
docs/cursor/briefs/cursor-phase2a-flap-merge.md:51:Phase 1 で作成した `scripts/merge_pilot_narrow_respell.py` は pilot 専用（4フィールド固定・完全一致必須）のため、Phase 2a 用に汎用マージスクリプトを新規作成します。
docs/cursor/briefs/cursor-phase2a-flap-merge.md:53:`scripts/merge_flap_candidates.py`:
docs/cursor/briefs/cursor-phase2a-flap-merge.md:109:**実行方法:** `python3 scripts/merge_flap_candidates.py`
docs/cursor/briefs/cursor-phase2a-flap-merge.md:190:`tools/review-vntv.html` と `tools/phase2a_review_needed.json`（コピー）を追加。`tools/` ディレクトリは GitHub Pages のビルド対象外にするか、`.nojekyll` 等で誤って公開されないよう配慮すること（既存の `scripts/` と同様の扱いで問題なければそれに倣う）。
docs/cursor/briefs/cursor-phase2a-flap-merge.md:218:このチェック用の簡易スクリプトを `scripts/verify_tokenize_narrow.py`（または同等の Node スクリプト）として用意し、結果を実装レポートに記載すること。
docs/cursor/briefs/cursor-phase2a-flap-merge.md:254:- [ ] `scripts/merge_flap_candidates.py` が作成されている
docs/cursor/briefs/cursor-phase2b-respell-merge.md:46:Phase 2a の `scripts/merge_flap_candidates.py` と同じパターンで、respelling 用に新規作成します。
docs/cursor/briefs/cursor-phase2b-respell-merge.md:48:`scripts/merge_respelling.py`:
docs/cursor/briefs/cursor-phase2b-respell-merge.md:98:**実行方法:** `python3 scripts/merge_respelling.py`
docs/cursor/briefs/cursor-phase2b-respell-merge.md:183:- [ ] `scripts/merge_respelling.py` が作成されている
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:9:Phase 2 pilot で `ga_to_rp` フォールバックが使用された 17 語について、**母音前 /r/（onset・intervocalic r）が誤脱落**していたバグを修正。`scripts/ga_to_rp.py` を v2 に差し替え、wordlist の `rp_ipa` をパッチ適用後、`ga_rp_same` を再計算した。
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:32:| `scripts/ga_to_rp.py` v2 差し替え | 完了 |
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:67:- `scripts/ga_to_rp.py`
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:176:| 語彙リスト | `gas/BatchWords.gs` | `scripts/export_batch_words.py` 生成 |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:360:| `scripts/export_batch_words.py` | バッチ語彙の生成元を確認する時 |
docs/cursor/briefs/cursor-phase2-final-merge.md:61:# scripts/merge_phase2a_final.py
docs/cursor/briefs/cursor-phase2-final-merge.md:88:`scripts/merge_respelling.py`（Phase 2b で作成済み）をそのまま再利用できます。添付の `phase2b_respell_final_52.json`（52語）に対して実行してください。
docs/cursor/briefs/cursor-phase2-final-merge.md:91:python3 scripts/merge_respelling.py --draft phase2b_respell_final_52.json
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:53:| Claude API | `scripts/gen_rp_ipa.py` | 本番 wordlist の主経路。バッチ 80 語、`rp_progress.json` で再開可 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:54:| ルール変換 | `scripts/ga_to_rp.py` + `gen_rp_ipa_offline.py` | オフライン fallback。`i→iː`, `oʊ→əʊ`, 非 rhotic 等 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:55:| マージ | `scripts/merge_rp_ipa.py` | `rp_complete.json` → `wordlist_GA_a1a2_plus_phonics.json` |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:184:| `scripts/gen_ga_rp_same.py`（新規） | Claude API or ルールでフラグ生成 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:219:- `scripts/gen_rp_ipa.py` — RP IPA 生成（Claude API）
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:220:- `scripts/ga_to_rp.py` — ルールベース GA→RP
docs/handoff/claude-design-integ-handoff.md:16:- 設計トレース: `docs/product.md`（WHY）→ `docs/features/<id>.md`（WHAT・1 ID 1ファイル）＋ `docs/features/_common.md`（横断挙動）＋ `docs/features/README.md`（ID レジストリ表）→ `docs/impact-ledger.json`（WHERE・source シンボルの blast-radius、`scripts/gen_impact_ledger.py` で再生成可能）。
docs/handoff/claude-design-integ-handoff.md:60:- ゾーン規約: 運用ゾーン（`.claude/**`, `CLAUDE.md`, `docs/**`, `.cursor/**`, `.github/**`）と開発ゾーン（`src/**`, `i18n/**`, `data/**`, `scripts/**`, `tools/**`, `gas/**`）を 1 PR で混在させない。3e/3f/3g 昇格は運用ゾーン（docs）中心。挙動確認で `src/` を読むのは可、変更するなら別 PR。
docs/handoff/2026-07-19_chat-handoff-phase-1-a-c.md:57:- `scripts/validate-cefr-tags.py` (Phase 1-C 新規、CI ガード)
docs/handoff/2026-07-19_chat-handoff-phase-1-a-c.md:92:13. **CI ガード** (Phase 1-C): `scripts/validate-cefr-tags.py` + workflow、未タグ CEFR 検出時 fail、対象 `wordlist_GA_a1a2_plus_phonics.json` (ルート) + optional data/*.json
docs/handoff/2026-07-26_chat-log-epic-169-followups.md:36:- PR #188: validator の実体ロジックは `scripts/lib/verify_core.py`（`scripts/validate/validate-markdown-refs.py` が import）。V1 = front-matter が在る時のみ id 検査（無し＝正常）、V4/V5 = `docs/handoff/` 等 legacy prefix を除外（廃止せず将来の検査能力を保持）、V7 = 無変更で現役。+ `docs/claude-design/README.md` の V7 修正、`data/**` の `REPOSITORY-STRUCTURE` → `docs/repo-map.md` 付替。
docs/handoff/current-state.md:503:- ビルド: `scripts/build-i18n-html.js` → `/{lang}/index.html`
docs/claude-design/PARITY-CATALOG.md:47:scripts/build-i18n-html.js で 6言語 HTML 生成 → python3 -m http.server 8799(repo root)
docs/handoff/2026-07-27_cd-parity-handoff.md:18:  node scripts/build-i18n-html.js
docs/agent-reports/codex-issue-161-pc-quality.md:62:- `node scripts/build-i18n-html.js`: PASS（en / ja / ko / zh-Hans / zh-Hant / fil）
docs/agent-reports/claude-code-issue-184-validator-align.md:12:`scripts/validate/validate-markdown-refs.py` が front-matter の `id` 必須（V1）を検査し続け、
docs/agent-reports/claude-code-issue-184-validator-align.md:22:- `scripts/lib/verify_core.py` V1 修正: front-matter なし → 正常スキップ。front-matter あり
docs/agent-reports/claude-code-issue-184-validator-align.md:25:- `scripts/lib/verify_core.py` に `_LEGACY_PREFIXES` 定数を追加し、V1/V4/V5 から除外:
docs/agent-reports/claude-code-issue-184-validator-align.md:28:- `scripts/lib/verify_core.py` V4 修正: `_LEGACY_PREFIXES` に該当するファイルをスキップ。
docs/agent-reports/claude-code-issue-184-validator-align.md:29:- `scripts/lib/verify_core.py` V5 修正: `_LEGACY_PREFIXES` に該当するファイルをスキップ。
docs/agent-reports/claude-code-issue-184-validator-align.md:40:- scripts/lib/verify_core.py (M)
docs/agent-reports/claude-code-issue-184-validator-align.md:58:- `python3 scripts/validate/validate-markdown-refs.py --full-scan` → 全 8 チェック PASS、
docs/agent-reports/claude-code-issue-174-impact-ledger.md:14:- ゾーン跨ぎ（`scripts/` 開発ゾーン + `docs/**` 運用ゾーン）は Issue 本文で明示的に承認された docs-infra atomic 例外（生成器とその出力・docs が密結合で分割不能なため）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:18:- `scripts/gen_impact_ledger.py` を新規作成: `src/index.template.html` の main `<script>` ブロックを検出し、`function name(` / `async function name(` （任意インデント、ネスト関数含む）と `const name = (...) => ` 形式（括弧なし単一引数含む。`$` / `show` をカバー）で全シンボルを抽出。列0の関数宣言行を境界とする簡易スコープ判定で「どのトップレベル関数の中の行か」を行単位にマッピングし、各シンボルへの呼び出し箇所（テキスト一致 `name(`）の呼び出し元関数名を 13 エリア語彙（decode/encode/study/connected/profile/vocab/picker/progress/about/reveal/summary/top/infra）へ分類（`EXACT_AREA` 明示辞書 — 旧 `repo-map.md` JS map の分類を継承 — → `PREFIX_RULES` 前方一致フォールバック → `infra` デフォルト）。`caller_areas` の要素数で `scope`（library=5+/shared=2-4/primary=0-1）を判定し、`AREA_TO_FEATURE` で凍結 12 ID レジストリのみへ `feature_ids` を絞り込む（`infra`・未登録概念は feature_id を持たない）。`depends_on` は本体内で呼び出す他の台帳シンボルをベストエフォートで収集。`activeIpa` のみ `SEED_OVERRIDES` で Issue 本文の worked example をそのまま固定（直接呼び出しグラフだけでは TTS/accent 系の共有ヘルパー経由の間接波及を検出できないため）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:30:- scripts/gen_impact_ledger.py (A)
docs/agent-reports/claude-code-issue-174-impact-ledger.md:53:- 変更範囲は Issue 本文が明示的に承認した「docs-infra atomic 例外」ホワイトリスト内のみ（`scripts/gen_impact_ledger.py`（開発ゾーン）+ `docs/impact-ledger.{json,md}` / `docs/guardrails.md` / `docs/repo-map.md` / 12 `docs/features/<id>.md` / `docs/doc-map.md`（運用ゾーン））。`git status --short` で確認済み、ホワイトリスト外の変更なし。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:56:- 実装中の自己判断による追加変更: `scripts/gen_impact_ledger.py` の `ARROW_CONST_RE` を、括弧付き引数（`(id,on)=>`）だけでなく括弧なし単一引数（`id=>`）も検出するよう拡張した（Issue 本文の例示パターンには明記がなかったが、`$`（DOM 取得、501 呼び出し）を捕捉するために必要と判断。「全関数を含む」完了定義を満たすための最小限の拡張として実施、自己判断の透明性としてここに記録）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:61:- 完了定義「`scripts/gen_impact_ledger.py` が動作し `impact-ledger.json` を冪等生成」: 満たす。`python3 scripts/gen_impact_ledger.py` を 2 回連続実行し `diff` で出力バイト列が完全一致することを確認（`--check` フラグでも `up to date` を確認）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:79:- `python3 scripts/validate/validate-markdown-refs.py --changed-files <本 PR の変更 .md 一覧> --broken-refs migration/broken-refs.csv` を実行し、V7（markdown link 形式禁止）は全変更ファイルで PASS（`docs/impact-ledger.md` 含め backtick 相対パス表記のみ使用）を確認。V1（frontmatter id 欠落）は Issue A のフロントマター全廃止に起因する repo 全体の pre-existing 状態（新規ファイル `docs/impact-ledger.md` も同様に該当するが exit code は 0 のまま、既存全ファイルと同一の既知状態であり本 PR 由来ではない）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:85:- `docs/features/README.md` および `docs/features/_common.md` にも「Issue F の impact-ledger 生成後にリンク」に類する記述が残っている（それぞれ「ソースシンボルとの対応（impact-ledger）は Issue F 完了後に...」「共有シンボルは `docs/impact-ledger.json` を参照予定」）。いずれも本 Issue のホワイトリスト（12 `features/<id>.md` + `docs/guardrails.md`/`docs/repo-map.md`/`docs/doc-map.md`/`scripts/gen_impact_ledger.py`/`docs/impact-ledger.{json,md}`）に含まれないため、ホワイトリスト方式に従い**意図的に変更していない**。次の軽微な docs 整備 Issue でのフォローアップを推奨する（詳細は「後続への影響」参照）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:91:- `src/index.template.html` の関数を追加・改名・移動する実装エージェントは、当該 PR で `python3 scripts/gen_impact_ledger.py` を再実行し `docs/impact-ledger.json` の差分をコミットに含める義務がある（`docs/impact-ledger.md` §6）。
docs/logs/2026/07/2026-07-13_day4-5-docs-infra-and-seo-pivot.md:89:2. ビルド時プリレンダリング: `scripts/build-i18n-html.js` で各言語別静的 HTML を生成
docs/agent-reports/claude-code-issue-173-design-layer-split.md:72:- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, `.github/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
docs/agent-reports/claude-code-issue-173-design-layer-split.md:208:- **原因**: `docs/features/README.md` の ID 索引テーブルと `_common.md` への導線で、角括弧テキスト直後に丸括弧で同名の `.md` パスを続ける Markdown ハイパーリンク構文を使用していた。`scripts/lib/verify_core.py` の V7 チェック（`check_v7`）は、この構文のリンクをパスの正しさに関わらず「unrewritten path ref」として一律 FAIL 扱いする（旧 Vault-Framework の wikilink 移行チェックの名残。単一バッククォートのインラインコードは除外対象外で、フェンス付きコードブロックのみが除外される）。`docs/_conventions.md` 規約1 は元々 wikilink を禁止し「リンクはプレーンな相対パス（`docs/features/2a.md` にセクション名を付与する形式）のみ」を求めており、本 Issue の他の新規ファイル（`product.md`・`_common.md`・各 `features/<id>.md` 本文）はすべてこの規約どおりバッククォート付きプレーンパス表記（例: `` `docs/data-contract.md` §2 ``）を使っていたが、`features/README.md` の索引テーブルのみ誤って角括弧+丸括弧のハイパーリンク構文を使っていた。
docs/agent-reports/claude-code-issue-173-design-layer-split.md:210:- **検証**: `python3 scripts/validate/validate-markdown-refs.py --full-scan --broken-refs migration/broken-refs.csv` を実行し、V7 の FAIL が 15 件 → 2 件（`docs/claude-design/README.md:26–27`、本 PR で一切変更していない既存ファイル。`git log -1 -- docs/claude-design/README.md` で本 PR 由来でないことを確認済み）に減少したことを確認。さらに実際の CI と同条件の PR モード（`--changed-files <このブランチの変更 .md 一覧> --broken-refs migration/broken-refs.csv`）でも `V7: PASS (total=0, failures=0)` を確認した。V1（frontmatter id 欠落、Issue A のフロントマター全廃止に起因する repo 全体の pre-existing FAIL）・V5（`docs/handoff/` 配下、本 PR の変更ファイルに含まれない full-repo チェック）は変更前と変わらず残存するが、いずれも本 PR 由来ではなく、pr-reviewer の指摘どおり別件として対応不要と判断した。
docs/reference/remaining-ops-checklist.md:28:| B1 | リポジトリの `gas/BatchWords.gs`（**5,397 語**）を GAS プロジェクトへ貼り付け | `python3 scripts/export_batch_words.py` → `gas/README.md` | GAS 側リスト件数 = 5,397 |
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:59:- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:72:- テスト観点「データフィールド追加タスクで data-contract.md + 該当 features のみで完結するか」: `docs/data-contract.md` に wordlist/connected_speech/weak_forms/guide の全フィールド定義・追加時の更新手順（`scripts/gen_ga_rp_same.py` 等）を集約済み。features/<id>.md は Issue E 作成予定のため、現時点では data-contract.md 単体で完結する設計とした。
docs/reference/c1-expansion-scope-design.md:179:  python3 scripts/generate_flap_ipa.py
docs/reference/c1-expansion-scope-design.md:180:  python3 scripts/merge_flap_candidates.py
docs/reference/c1-expansion-scope-design.md:181:  python3 scripts/generate_respelling.py
docs/reference/c1-expansion-scope-design.md:182:  python3 scripts/merge_respelling.py
docs/reference/c1-expansion-scope-design.md:183:- RP IPA バッチ生成: python3 scripts/gen_rp_ipa.py (Claude API)
docs/reference/c1-expansion-scope-design.md:184:- Merge: python3 scripts/merge_rp_ipa.py
docs/reference/phase2-m2-completion-summary.md:128:- `scripts/ga_to_rp.py`（onset/intervocalic r 保持バグ修正）
.github/workflows/validate-markdown-refs.yml:8:      - 'scripts/validate/**'
.github/workflows/validate-markdown-refs.yml:14:      - 'scripts/validate/**'
.github/workflows/validate-markdown-refs.yml:46:            python scripts/validate/validate-markdown-refs.py \
.github/workflows/validate-markdown-refs.yml:56:          python scripts/validate/validate-markdown-refs.py \
docs/reference/README.md:38:| GA↔RP `ga_rp_same` | `../cursor/briefs/cursor-ga-rp-same-flag-consultation.md` | `scripts/gen_ga_rp_same.py` |
docs/reference/README.md:58:| `neighbors_report.md` | neighbors v2 quality stats | `python3 scripts/gen_neighbors.py` |
docs/reference/README.md:77:| RP rule fallback | `scripts/ga_to_rp.py` |
docs/reference/README.md:78:| Pipeline paths | `scripts/paths.py` |
.github/ISSUE_TEMPLATE/feature.md:24:  - `scripts/<file>.py`
.github/workflows/validate-cefr-tags.yml:10:      - 'scripts/validate-cefr-tags.py'
.github/workflows/validate-cefr-tags.yml:18:      - 'scripts/validate-cefr-tags.py'
.github/workflows/validate-cefr-tags.yml:34:        run: python3 scripts/validate-cefr-tags.py
data/README.md:16:パス正本: [`scripts/paths.py`](../scripts/paths.py)  
data/pipeline/README.md:3:`scripts/generate_flap_ipa.py` 等が読み書きする**中間 JSON**。ブラウザからは読み込まない。
data/pipeline/README.md:17:パス正本: `scripts/paths.py`
data/derived/README.md:12:パス正本: `scripts/paths.py`
data/archive/README.md:9:- パス正本: `scripts/paths.py` → `WORDLIST_BACKUP_PHASE0A`
templates/github-workflows/validate-markdown-refs.yml:8:      - 'scripts/validate/**'
templates/github-workflows/validate-markdown-refs.yml:14:      - 'scripts/validate/**'
templates/github-workflows/validate-markdown-refs.yml:46:            python scripts/validate/validate-markdown-refs.py \
templates/github-workflows/validate-markdown-refs.yml:56:          python scripts/validate/validate-markdown-refs.py \
```

---

## 5. Grep D: `middleware.ts` / `vercel.json` / `package.json` の build 定義

### 5.1 `middleware.ts`（全行）

```typescript
/**
 * F2 root router: Accept-Language / Cookie / Bot handling for `/` only.
 * Matcher excludes language subdirectories to prevent redirect loops.
 */
export const config = {
  matcher: "/",
};

const LANGS = ["en", "ja", "ko", "zh-Hans", "zh-Hant", "fil"] as const;
type Lang = (typeof LANGS)[number];

const BOT_UA =
  /Googlebot|Bingbot|GPTBot|anthropic-ai|ClaudeBot|Baiduspider|YandexBot|Slurp|DuckDuckBot|facebookexternalhit|Twitterbot|LinkedInBot|Applebot/i;

function isLang(value: string): value is Lang {
  return (LANGS as readonly string[]).includes(value);
}

function cookieLang(cookieHeader: string | null): Lang | null {
  if (!cookieHeader) return null;
  const match = cookieHeader.match(/(?:^|;\s*)app_lang=([^;]+)/);
  if (!match) return null;
  const value = decodeURIComponent(match[1].trim());
  return isLang(value) ? value : null;
}

function pickFromAcceptLanguage(header: string | null): Lang {
  if (!header) return "en";
  const parts = header
    .split(",")
    .map((raw) => {
      const [tagPart, ...params] = raw.trim().split(";");
      const tag = (tagPart || "").trim().toLowerCase();
      let quality = 1;
      for (const p of params) {
        const m = p.trim().match(/^q=([0-9.]+)$/i);
        if (m) quality = parseFloat(m[1]) || 0;
      }
      return { tag, quality };
    })
    .filter((p) => p.tag)
    .sort((a, b) => b.quality - a.quality);

  for (const { tag } of parts) {
    for (const lang of LANGS) {
      if (tag === lang.toLowerCase()) return lang;
    }
    if (tag.startsWith("zh-cn") || tag === "zh-hans") return "zh-Hans";
    if (tag.startsWith("zh-tw") || tag.startsWith("zh-hk") || tag === "zh-hant") {
      return "zh-Hant";
    }
    if (tag === "zh") return "zh-Hans";
    if (tag.startsWith("ja")) return "ja";
    if (tag.startsWith("ko")) return "ko";
    if (tag.startsWith("fil") || tag.startsWith("tl")) return "fil";
    if (tag.startsWith("en")) return "en";
  }
  return "en";
}

function redirectTo(request: Request, lang: Lang, status = 302): Response {
  const url = new URL(request.url);
  url.pathname = `/${lang}/`;
  return Response.redirect(url, status);
}

export default function middleware(request: Request): Response {
  const ua = request.headers.get("user-agent") || "";

  // Bots: send to English. Prefer rewrite when platform helpers exist; 302 keeps
  // language URLs independently crawlable and works without @vercel/functions.
  if (BOT_UA.test(ua)) {
    return redirectTo(request, "en", 302);
  }

  const fromCookie = cookieLang(request.headers.get("cookie"));
  if (fromCookie) {
    return redirectTo(request, fromCookie, 302);
  }

  const lang = pickFromAcceptLanguage(request.headers.get("accept-language"));
  return redirectTo(request, lang, 302);
}
```

**要点**: `matcher: "/"` のみに適用（言語サブディレクトリを除外しリダイレクトループを防止）。Accept-Language / Cookie(`app_lang`) / Bot UA 判定で `/{lang}/` へ 302 リダイレクト。`LANGS` 配列がハードコードされ、対象は `en/ja/ko/zh-Hans/zh-Hant/fil` の 6 言語。

### 5.2 `vercel.json`（全行）

```json
{
  "buildCommand": "node scripts/build-i18n-html.js",
  "outputDirectory": ".",
  "cleanUrls": true,
  "rewrites": [
    { "source": "/en", "destination": "/en/index.html" },
    { "source": "/ja", "destination": "/ja/index.html" },
    { "source": "/ko", "destination": "/ko/index.html" },
    { "source": "/zh-Hans", "destination": "/zh-Hans/index.html" },
    { "source": "/zh-Hant", "destination": "/zh-Hant/index.html" },
    { "source": "/fil", "destination": "/fil/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "missing": [
        {
          "type": "host",
          "value": "ipasounddrill\\.app"
        }
      ],
      "headers": [
        { "key": "X-Robots-Tag", "value": "noindex" }
      ]
    }
  ]
}
```

**要点**: `buildCommand: "node scripts/build-i18n-html.js"` が `scripts/` への直接依存。`outputDirectory: "."`（リポジトリルート直下の生成物 `/{lang}/index.html` を配信）。`rewrites` は 6 言語分の `index.html` 固定パス。`headers` は `ipasounddrill.app` 以外のホストに `noindex` を付与（preview 環境保護）。

### 5.3 `package.json`（全行）

```json
{
  "name": "ipasounddrill",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "build": "node scripts/build-i18n-html.js"
  },
  "engines": {
    "node": ">=18"
  }
}
```

**要点**: `scripts.build` が `vercel.json` の `buildCommand` と同一コマンドを保持（二重定義、どちらも `scripts/build-i18n-html.js` に依存）。

---

## 6. Grep E: `docs/` + `AGENTS.md` + `CLAUDE.md` 内の path 参照

```
grep -rn "src/\|data/\|scripts/\|gas/" docs/ AGENTS.md CLAUDE.md
```

ヒット 1114 件（全件、省略なし）:

```
docs/tts-design.md:85:全 **5,397** 語の GA 音声を Google Drive に事前ストックするオフラインジョブ。`gas/BatchWarm.gs` + `gas/BatchWords.gs`（`scripts/export_batch_words.py` で生成）。
docs/tts-design.md:99:詳細: `gas/README.md` §GA 一括バッチ
docs/tts-design.md:107:| `gas/Code.gs` | TTS proxy（word / phrase / weak / warm / `?urls=1`） |
docs/tts-design.md:108:| `gas/BatchWarm.gs` | Scheduled GA Drive pre-generation |
docs/tts-design.md:109:| `gas/BatchWords.gs` | Word list for batch warm（**5,397 語** — `export_batch_words.py` で更新） |
docs/tts-design.md:110:| `gas/README.md` | Deploy + API reference |
docs/tts-design.md:117:| 機械抽出リスト | `data/pipeline/phase2a_review_needed.json`（127 語） |
docs/tts-design.md:118:| 作業用リスト（拡張） | `data/pipeline/r4_pending_review_list.json` / `.csv` |
docs/pipeline.md:6:**パスの正本**: `scripts/paths.py` が canonical paths を定義する。ハードコード文字列より import を優先すること。
docs/pipeline.md:16:python3 scripts/generate_flap_ipa.py
docs/pipeline.md:17:python3 scripts/merge_flap_candidates.py
docs/pipeline.md:18:python3 scripts/generate_respelling.py
docs/pipeline.md:19:python3 scripts/merge_respelling.py
docs/pipeline.md:20:python3 scripts/gen_neighbors.py
docs/pipeline.md:21:python3 scripts/merge_neighbors.py
docs/pipeline.md:22:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/pipeline.md:23:python3 scripts/export_batch_words.py
docs/pipeline.md:26:python3 scripts/fix_happy_i.py   # word-final /iː/ or /ɪ/ → /i/ (then re-run gen_ga_rp_same)
docs/pipeline.md:39:| `scripts/phonology_lexicon.py` | 共有語彙リスト（`BATH_WORDS_BASE`, `PALM_WORDS`, `YOD_CORONALS`）— `ga_to_rp.py` と `gen_ga_rp_same.py` から import |
docs/pipeline.md:40:| `scripts/fix_happy_i.py` | rp_ipa の happY 位置 `/iː/`/`/ɪ/` → `/i/` 是正（Phase R2 で1回実行済み。将来バッチ追加時にも実行推奨） |
docs/pipeline.md:41:| `scripts/gen_ga_rp_same.py` | `ga_rp_same` / `ga_rp_same_reason` 一括付与（分類器） |
docs/pipeline.md:42:| `scripts/ga_to_rp.py` | GA→RP ルール変換（**offline fallback のみ**。本番 `rp_ipa` は Claude バッチ同梱） |
docs/pipeline.md:43:| `scripts/gen_rp_ipa.py` | Claude API で RP IPA 生成（新規バッチ用。SYSTEM_PROMPT に happY ルールあり） |
docs/pipeline.md:45:Staging outputs → `data/pipeline/`。Neighbors / RP progress → `data/derived/`。Merge scripts write `wordlist_GA_a1a2_plus_phonics.json`。
docs/pipeline.md:51:1. Receive `phase2_mN_*_with_gloss.json`（`rp_ipa` 同梱）→ `data/batches/`
docs/pipeline.md:54:4. Verify counts; sync `data/derived/rp_progress.json` from wordlist
docs/pipeline.md:65:| 高 | 欠落必須語・屈折形パッチ | 主要語追加済み（`data/*_patch.json`） |
docs/repo-map.md:11:- **フロントエンド**: `src/index.template.html` + ビルドスクリプト（`scripts/build-i18n-html.js`）で 6 言語版 HTML を生成 + 純粋 JS + JSON データ
docs/repo-map.md:13:- **TTS**: Google Apps Script（`gas/Code.gs`、現行維持）
docs/repo-map.md:14:- **データ生成パイプライン**: Python（`scripts/*.py`、ローカル実行。コマンドは `docs/pipeline.md`）
docs/repo-map.md:24:| **Runtime (Vercel + custom domain)** | `src/index.template.html` → build → `/{lang}/index.html` + JSON/i18n/fonts loaded by the browser |
docs/repo-map.md:26:| **Pipeline** | `scripts/*.py` read/write `data/pipeline/` staging JSON, merge into wordlist（コマンドは `docs/pipeline.md`） |
docs/repo-map.md:27:| **Batch imports** | `data/batches/` — Phase 1/2 merge sources（`data/batches/README.md`） |
docs/repo-map.md:28:| **GAS TTS** | `gas/` — Google Apps Script proxy; not loaded by static site（設計は `docs/tts-design.md`） |
docs/repo-map.md:36:| SPA テンプレート（正本） | `src/index.template.html` | Cursor が編集する唯一の HTML ソース |
docs/repo-map.md:40:**Data folder map:** `data/README.md` — runtime / batches / pipeline / derived / patches / archive の見分け方。
docs/repo-map.md:54:├── src/
docs/repo-map.md:58:├── package.json                # `npm run build` → `scripts/build-i18n-html.js`
docs/repo-map.md:65:├── data/
docs/repo-map.md:66:│   ├── README.md              # ★ data/ 配下の役割分担（AI 向け）
docs/repo-map.md:102:│   ├── claude-design/           # 凍結フレームカタログ(sp/pc/design-system.dc.html)。画面一覧用、更新義務なし。正本は src/index.template.html。詳細 README.md
docs/repo-map.md:107:├── scripts/                   # Python pipeline + `build-i18n-html.js`（paths.py が Python パス正本）→ `docs/pipeline.md`
docs/repo-map.md:109:├── gas/                       # Code.gs, BatchWarm.gs, BatchWords.gs, README
docs/repo-map.md:125:| TTS proxy | Google Apps Script | `gas/Code.gs` deployment, `GAS_TTS_URL` in `src/index.template.html` |
docs/repo-map.md:126:| Build system | Node.js | `scripts/build-i18n-html.js`（6 言語 HTML 生成） |
docs/repo-map.md:128:| Vercel Build Command | `node scripts/build-i18n-html.js` | `vercel.json` / Dashboard Build & Development Settings |
docs/repo-map.md:142:**現行スコープ**: `src/index.template.html` + 言語別静的 HTML 生成 + GAS TTS
docs/repo-map.md:143:- 対象: `src/index.template.html`（inline CSS/JS）、`scripts/build-i18n-html.js` で 6 言語版 HTML 生成、Vercel カスタムドメイン運用
docs/repo-map.md:158:## src/index.template.html 関数マップ
docs/repo-map.md:160:`src/index.template.html`（単一ファイル構成。言語別生成物は `/{lang}/index.html`）内の主要関数一覧・行番号・
docs/repo-map.md:162:（`scripts/gen_impact_ledger.py` による静的解析生成物。symbol 昇順の JSON 配列）。
docs/repo-map.md:173:| Neighbors slim（merge 元） | `data/derived/wordlist_with_neighbors_slim.json` |
docs/repo-map.md:174:| Phase 2 staging | `data/pipeline/`（not root, not runtime） |
docs/repo-map.md:175:| R4 作業 CSV/JSON | `data/pipeline/r4_pending_review_list.*`（**not** `docs/reference/`） |
docs/repo-map.md:189:Vercel は main への push で自動デプロイ（Build Command: `node scripts/build-i18n-html.js`）。詳細は `docs/OPERATIONS.md` § 1「Vercel デプロイ」を参照。
docs/data-contract.md:11:これらのパスは `src/index.template.html` に**ハードコード**されている（`<base href="/">` により言語サブディレクトリからもルート相対で解決）。
docs/data-contract.md:12:`src/index.template.html` を更新せずに移動しないこと。
docs/data-contract.md:17:| Connected speech | `data/connected_speech.json` |
docs/data-contract.md:18:| Weak forms | `data/weak_forms.json` |
docs/data-contract.md:19:| Guide | `data/guide.json` |
docs/data-contract.md:23:| TTS | External `GAS_TTS_URL` in `src/index.template.html` → `gas/Code.gs` deployment |
docs/data-contract.md:70:| `ga_rp_same` | GA と RP が学習者にとって実質同じか（`scripts/gen_ga_rp_same.py` で付与） |
docs/data-contract.md:80:**パイプライン補足:** narrow IPA 候補・respelling のステージング JSON は `data/pipeline/`。バッチソースは `data/batches/`。コマンド詳細は `docs/pipeline.md`。
docs/data-contract.md:91:`scripts/gen_ga_rp_same.py` により全語彙一括で生成される派生フィールドで、`ipa` / `rp_ipa` / `ipa_actual_ga` から決定的に導出される（LLM 判定なし）。
docs/data-contract.md:131:> `scripts/gen_ga_rp_same.py` の改修で追加された場合、本表を更新すること。
docs/data-contract.md:159:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/data-contract.md:161:python3 scripts/fix_happy_i.py   # その後 gen_ga_rp_same を再実行
docs/data-contract.md:168:### `data/connected_speech.json`（201句）
docs/data-contract.md:174:### `data/weak_forms.json`（36語）
docs/data-contract.md:178:### `data/guide.json`
docs/data-contract.md:222:**検証ガード**: `tools/validate_i18n.py` が local / CI（`.github/workflows/validate-i18n.yml`）の唯一のガード。`i18n/*.json` または `src/index.template.html` の i18n 参照を編集したら必ず実行:
docs/data-contract.md:267:| `rp_ipa` フィールド | `scripts/gen_ga_rp_same.py` 再実行、same/different 内訳の再確認 |
docs/data-contract.md:268:| `neighbors` フィールド | `scripts/gen_neighbors.py` 再実行、0近傍率の変化確認 |
docs/data-contract.md:269:| `data/connected_speech.json` | 総フレーズ数・CEFR バッジ整合性 |
docs/data-contract.md:270:| `data/weak_forms.json` | 総エントリ数、type=weak の出題確認 |
docs/data-contract.md:272:| `gas/BatchWords.gs` | `scripts/export_batch_words.py` で再生成 |
docs/OPERATIONS.md:13:- ビルドコマンド: `node scripts/build-i18n-html.js`（F2 で導入）
docs/OPERATIONS.md:148:| 特定単語だけ音が変 | GAS BatchWords 未更新 | `python3 scripts/export_batch_words.py` を実行、GAS 更新 |
docs/OPERATIONS.md:212:- 計測タグ埋め込み: Issue E1 / #43 で `src/index.template.html` の `</body>` 直前に追加、生成物 6 言語版すべてに反映
docs/OPERATIONS.md:216:`src/index.template.html` の `</body>` 直前に以下を配置:
docs/OPERATIONS.md:261:Vercel Web Analytics には公式のオプトアウト UI がなく（DNT 非対応、Cookie 不使用）、現行の script タグ直接埋め込み方式では `@vercel/analytics` パッケージの `beforeSend` フックも使えない。そのため `src/index.template.html` に localStorage ベースの除外機構を実装している（Issue #46）。
docs/OPERATIONS.md:404:UI 翻訳 JSON や `src/index.template.html` の i18n 参照を変更した場合は、Preview / Production デプロイ前にリポジトリ直下で以下を実行する。
docs/guardrails.md:44:| 4 | Runtime data contract の不変 | `data/*.json` 等の実行時契約が意図せず変更されていないか |
docs/guardrails.md:87:共通シンボル（`scope=shared` または `scope=library`。例: `t()` / `activeIpa()` / `setExclusivePage` / `navigate` / `loadWordlist` 等）を編集する Issue・実装エージェントは、`docs/impact-ledger.json`（`scripts/gen_impact_ledger.py` 生成）の `caller_areas` を引き、実際の影響範囲が Issue 宣言 scope と異なる場合は **halt** する（`CLAUDE.md` halt トリガー (c)）。4 ステップの手順・スキーマ・scope 閾値・編集エージェントの更新義務は `docs/impact-ledger.md#impact-analysis-halt` が正本（重複させない）。
docs/guardrails.md:99:**UI 仕様の正本は `src/index.template.html`(実装)。** `docs/claude-design/{sp,pc,design-system}.dc.html` は**凍結フレームカタログ**（画面一覧としての俯瞰用。pixel-perfect 精度は保証しない。更新義務なし）。
docs/guardrails.md:103:- 正本コード: `src/index.template.html` を read
docs/guardrails.md:114:`i18n/*.json` または `src/index.template.html` の i18n 参照を変更する場合、PR 作成前に必ず実行:
docs/CSS-CONVENTIONS.md:44:- **配置:** 別 CSS ファイル分離をしない。`src/index.template.html` の `<style>` を正とする
docs/CSS-CONVENTIONS.md:50:- `<style>` ブロックは 6 言語で **共通**（`scripts/build-i18n-html.js` がテンプレートから生成）
docs/CSS-CONVENTIONS.md:78:| Phase 3（2026-07-28〜29 UI 改修）後 | **195** | モーダル方式変更（`.info-page` の全画面→ scrim + 浮遊カード化）・フッター整理・ドリル系画面の新トークン移行で 228→195（`grep -c 'var(--legacy-' src/index.template.html` 実測） |
docs/history.md:51:- R4 pending 累計: **127 語**（`data/pipeline/r4_pending_review_list.*`）
docs/history.md:92:| `data/connected_speech.json` | 201 | `cefr` + `ga_rp_same`; vocab browser Phrases タブに CEFR バッジ表示 |
docs/history.md:93:| `data/weak_forms.json` | 36 | 同上; 練習時 Connected Speech Type=weak で出題 |
docs/history.md:101:| Alt-accent same display | `/ipa/（同じ）` via `ga_rp_same` flag（`scripts/gen_ga_rp_same.py`） |
docs/history.md:110:`docs/repo-map.md` §「src/index.template.html JS map」の行番号スナップショット: **2026-07-12** 時点。
docs/history.md:123:| 2026-07-10 | v3.21 | Phase R (Repair): 分類器 dead-code 3件活性化（`cot_caught`, `square_near_cure`, BATH+weak composite）、`gen_rp_ipa.py` SYSTEM_PROMPT の happY ルール追加、rp_ipa 91語（happY 過剰伸長 82 + `/ɪ/` 表記ゆれ 9）を一括是正、`scripts/phonology_lexicon.py` に BATH_WORDS/PALM_WORDS を統合、`ga_to_rp.py` fallback の PALM/happY/yod latent bug 修正。 |
docs/history.md:124:| 2026-07-10 | v3.20 | Phase 2 M2 完了（B2 +569、総 5,397）。進捗チェック（`ept_checks_v1`）、Phrases CEFR バッジ、`dignify` RP ホットフィックス。リポジトリ README 整備（`data/README.md` 等）。 |
docs/history.md:128:| 2026-07-09 | v3.11 | リポジトリ構成を整理（`data/batches`・`data/pipeline`・`data/patches`・`docs/cursor` 等）。`docs/REPOSITORY-STRUCTURE.md` 追加（**Issue #172 でこの旧ファイルは retire、内容は data-contract/tts-design/pipeline/repo-map/history へ移設**）。`scripts/paths.py` でパス正本化。 |
docs/history.md:170:- `phase2a_flap_candidates.json` の 186 語を `scripts/merge_flap_candidates.py` で一括マージ
docs/history.md:176:- `phase2b_respell_draft.json` の 3,007 語を `scripts/merge_respelling.py` で一括マージ
docs/history.md:184:- pilot 由来の誤 narrow 3語（`winter`, `twenty`, `ninety`）を `scripts/merge_phase2a_final.py` で除去
docs/history.md:194:| `scripts/gen_ga_rp_same.py` | `ga_rp_same` / `ga_rp_same_reason` 付与。`cot_caught`・`square_near_cure`・BATH+weak composite を活性化 |
docs/history.md:195:| `scripts/fix_happy_i.py` | word-final happY の `/iː/`・`/ɪ/` → `/i/` 一括是正（91語） |
docs/history.md:196:| `scripts/phonology_lexicon.py` | `BATH_WORDS_BASE`・`PALM_WORDS`・`YOD_CORONALS` を `ga_to_rp.py` と共有 |
docs/history.md:197:| `scripts/ga_to_rp.py` | offline fallback（PALM guard・yod・happY skip） |
docs/history.md:198:| `scripts/gen_rp_ipa.py` | 新規バッチ用 Claude API。SYSTEM_PROMPT に happY ルールあり |
docs/history.md:256:| 2026-07-16 | Phase 0 段階 2: 実装突合（正本 `src/index.template.html`、Exit→setup、footer/audioHint、SRS 重み、Connected CEFR/TTS 判断、Mode B DOM 名、i18n 169 leaf・orphan 13 削除） |
docs/history.md:261:| 2026-07-09 | v3.15 `ga_rp_same` / `ga_rp_same_reason` フラグ導入（`scripts/gen_ga_rp_same.py`）。UI 同一判定をフラグ参照に切替 |
docs/history.md:264:| 2026-07-09 | v3.11 リポジトリ構成整理（`data/batches`・`pipeline`・`patches`、`docs/cursor`）。語数 4,439・B1=1,727。連結/弱形 `cefr`。`REPOSITORY-STRUCTURE.md` 追加。 |
docs/workflow.md:80:- **UI 仕様の参照**: UI 改修 Issue では `src/index.template.html`(正本) を根拠にする。`docs/claude-design/{sp,pc}.dc.html` は凍結フレームカタログ（画面一覧の俯瞰用、pixel-perfect 精度は保証しない）。見た目の確認は **Vercel branch preview URL** で行う。**外部 Claude Design(SaaS) の URL・zip・再開セッションは要求しない**(2026-07-28 に運用廃止)。詳細 `docs/claude-design/README.md`
docs/impact-ledger.md:4:Issue F（#174, EPIC #169）で確立。旧 `docs/repo-map.md`「src/index.template.html JS map」節はここに置換された。
docs/impact-ledger.md:11:`src/index.template.html`（~5,400L、~290 関数）の**静的解析**（正規表現 + 行範囲ベースの簡易スコープ判定であり、AST/コンパイラ相当の
docs/impact-ledger.md:14:生成器: `scripts/gen_impact_ledger.py`。データ本体: `docs/impact-ledger.json`（symbol 昇順の JSON 配列）。
docs/impact-ledger.md:25:| `line` | number | `src/index.template.html` 内の定義行番号（1-indexed。ソース変更のたびに生成器再実行で追従） |
docs/impact-ledger.md:77:> かつ Issue の worked example 自体が閾値ルールより緩い「shared」ラベルを指定している）。この 1 件は `scripts/gen_impact_ledger.py` の
docs/impact-ledger.md:101:python3 scripts/gen_impact_ledger.py          # docs/impact-ledger.json を再生成（上書き）
docs/impact-ledger.md:102:python3 scripts/gen_impact_ledger.py --check  # 生成物が最新か検査するのみ（差分があれば exit 1）
docs/impact-ledger.md:105:生成器は `src/index.template.html` のみを読み取り専用で解析する（ソース自体は変更しない）。**冪等**（同一ソース入力に対し常に
docs/impact-ledger.md:112:`src/index.template.html` 内の関数を**追加・改名・移動**した実装エージェントは、当該 PR で `python3 scripts/gen_impact_ledger.py`
docs/impact-ledger.md:115:`scripts/gen_impact_ledger.py` 冒頭の `EXACT_AREA` / `PREFIX_RULES` / `SEED_OVERRIDES` を編集し、再生成後に diff を確認する。
docs/LAUNCH-CHECKLIST.md:78:- [x] `src/index.template.html` に Vercel Analytics script タグ追加（Issue #43）
docs/LAUNCH-CHECKLIST.md:113:- 各言語別に静的 HTML をビルド時生成（`scripts/build-i18n-html.js`）
docs/LAUNCH-CHECKLIST.md:124:- [x] `scripts/build-i18n-html.js` 新規追加（i18n/*.json の meta を index.html テンプレートに埋め込み、6 言語版 HTML 生成）（Issue #39）
docs/LAUNCH-CHECKLIST.md:125:- [x] `src/index.template.html` 新規追加（既存 index.html から meta 部分をテンプレート化）（Issue #39）
docs/vault-history/design-decisions.md:65:- **決定**: C1 語彙 1,015 語候補 (`data/batches/gap_c1_new.json`) の投入は Track B (React 化以降)
docs/vault-history/design-decisions.md:131:  - DOM 削除は `src/index.template.html` の該当セクション削除
docs/vault-history/design-decisions.md:506:- `scripts/validate-cefr-tags.py` 新規、`wordlist_GA_a1a2_plus_phonics.json` + optional (`data/connected_speech.json` / `data/weak_forms.json`)
docs/vault-history/design-decisions.md:591:- ブラックリスト 12 ファイル md5: 完全不変 (`CLAUDE.md` / `PURPOSE.md` / `SPECIFICATION.md` / `REPOSITORY-STRUCTURE.md` / `CHANGE-CLASSIFICATION.md` / `DEV-GUARDRAILS.md` / `OPERATIONS.md` / `CSS-CONVENTIONS.md` / `screen-data-mapping.md` / `wordlist_GA_a1a2_plus_phonics.json` / `data/connected_speech.json` / `data/weak_forms.json`)
docs/doc-map.md:44:| ソースシンボル → feature_ids → scope → caller_areas | `docs/impact-ledger.json` | exists | ソース共通シンボル変更時（`scripts/gen_impact_ledger.py` 再実行） |
docs/doc-map.md:55:| UI 仕様の参照ポリシー | `docs/guardrails.md` §9 + `docs/claude-design/README.md` + `src/index.template.html`(正本) | exists | UI 改修運用変更時 |
docs/doc-map.md:60:| data/ 配下の役割分担 | `data/README.md` | exists | data/ 役割変更時 |
docs/change-classification.md:80:UI 改修 Issue では、正本 `src/index.template.html` を根拠として提示する。`docs/claude-design/{sp,pc}.dc.html` は凍結フレームカタログ（画面一覧用、更新義務なし）。見た目の確認は Vercel branch preview URL。旧 CD 修正判定(A/B/C)は 2026-07-28 に廃止(`docs/guardrails.md` §9)。
docs/design/ux-issues-2026-07.md:96:- Recon で判明: `src/index.template.html` に一部インライン style が残存 (Mode B heads 等)、デザイントークン化されていない
docs/design/phase-1/visual-tokens.md:45:Google Fonts import（`src/index.template.html` `<head>`、Phase 1-A で追加済み）:
docs/design/phase-1/visual-tokens.md:91:> **実装:** Phase 1-C は Button / 目的カード / Pill / Toggle を `src/index.template.html` に定義。**Progress meter と §4.6 IPA タイポは Phase 1-D**（本 snapshot には完全性のため含める）。
docs/design/phase-1/visual-tokens.md:371:| **Track A（現行）** | 単一ファイル `src/index.template.html` の `:root` にトークン定義。preprocessor 不採用。`--legacy-*` は Phase 1-H 完了まで残す |
docs/design/phase-1/brief-cluster-2-visual-language.md:233:- **`src/index.template.html`**: 単一 HTML template、Vercel Build で 6 言語 HTML 生成
docs/design/phase-1/brief-cluster-2-visual-language.md:277:### 現状の CSS 変数 (現行 `src/index.template.html`)
docs/design/phase-1/brief-cluster-2-visual-language.md:404:**目標**: Iteration 2-3 で `src/index.template.html` に反映可能な CSS + component patterns が確定、Cursor Issue として起票して Track A に反映。
docs/design/phase-1/design-tokens.md:9:summary: Phase 1 UI/UX (Variation B「音を、美しく。」/ Mood B / Warm Contemporary) の視覚言語トークンの source of truth。Claude Design 出力 (`Kickoff_design_prompt2.zip` 内 `IPA Sound Drill - Phase 1.dc.html` § デザインガイドライン + ドリル section) から抽出。カラー 11 変数、タイポ 3 系統、spacing / radius / shadow、基本コンポーネント 5 種の CSS 定義を集約。Phase 1-A で `src/index.template.html` の `<style>` に追加、Phase 1-B 以降で参照。既存 `--signal` 等は legacy prefix (`--legacy-*`) に退避し、既存規則の見た目は据え置き (解釈 i レガシー退避方式)。
docs/design/phase-1/screen-data-mapping.md:5:> **調査対象:** `src/index.template.html`（md5 `65c30ff7797549b478a4c8db2f8f8702`）、`wordlist_GA_a1a2_plus_phonics.json`（5,397）、`data/connected_speech.json`（201）、`data/weak_forms.json`（36）。
docs/design/phase-1/screen-data-mapping.md:232:- `src/index.template.html` は **未変更**（md5 前後一致: `65c30ff7797549b478a4c8db2f8f8702`）
docs/design/phase-0/phase-0-stage-2-doc-impl-reconciliation.md:50:| A-1 | 正本ファイル名: `src/index.template.html` (ルート `index.html` は F2 以降存在せず、build で `/{lang}/index.html` 生成) | P0 | dom §主ソース | SPEC 全体、CLAUDE.md、REPOSITORY-STRUCTURE.md (一部完了済) |
docs/design/phase-0/phase-0-stage-2-doc-impl-reconciliation.md:65:| A-16 | i18n build-only キー: `meta.title`, `meta.description`, `meta.ogTitle`, `meta.ogDescription` (`scripts/build-i18n-html.js` のみ参照) | P3 | i18n-css §A.0 | SPEC §6 |
docs/design/phase-0/phase-0-stage-2-doc-impl-reconciliation.md:117:| D-8 | C1: `lvl.c1` i18n あり、ランタイム CEFR に C1 なし (`data/batches/gap_c1_new.json` 1,015 候補) | P2 | Pipeline✓ Runtime✗ | halfbaked §1.5 |
docs/cursor/instructions/cursor-instructions-connected-weak-cefr-badges.md:5:- 前提: `data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）に `cefr` フィールドが既に付与済み（2026-07-09 完了）
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:18:| 1 | pilot データを配置 | `data/batches/phase2_pilot_180_with_gloss.json`（別途受領・179 エントリ） |
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:20:| 3 | narrow IPA / respell 生成 | `data/pipeline/phase2a_*.json` / `phase2b_*.json` |
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:22:| 5 | `neighbors` 再計算 | `data/derived/wordlist_with_neighbors.json` |
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:39:cp /path/to/phase2_pilot_180_with_gloss.json data/batches/
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:45:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:46:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:47:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:48:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:51:python3 scripts/gen_rp_ipa.py    # rp_progress.json で再開可
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:52:python3 scripts/merge_rp_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:55:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:56:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:60:        data/batches/phase2_pilot_180_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:61:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:62:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:63:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:105:p = json.load(open('data/derived/rp_progress.json'))
docs/cursor/instructions/cursor-instructions-phase2-pilot.md:164:- **並行可**: `gas/BatchWords.gs` の 5,007 語版更新は本 pilot コミット後に別タスクで対応
docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md:66:cp gas/Code.gs /tmp/Code.gs.pre_phase_t
docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md:241:**ファイル:** `gas/Code.gs`
docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md:525:1. `gas/Code.gs` の変更を GAS エディタに反映
docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md:553:git add gas/Code.gs gas/README.md index.html
docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md:703:### (b) `gas/README.md` に新 URL API 追記
docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md:750:git add docs/PURPOSE.md docs/cursor/reports/cursor-implementation-report-phase-t.md gas/README.md
docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md:840:- `gas/Code.gs` (T2: saveToDrive_ 内で setSharing、handleUrls_、resolveUrlOne_、migratePublicSharing、getAudioFileFromDrive_)
docs/cursor/instructions/cursor-instructions-phase-t-tts-latency.md:841:- `gas/README.md` (T4: API 追記)
docs/cursor/instructions/cursor-instructions-phase1-m3.md:70:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase1-m3.md:71:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase1-m3.md:72:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m3.md:73:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:14:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:15:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:16:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:17:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:18:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:19:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:20:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:53:git add data/batches/phase2_m2b_100_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:55:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:56:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:57:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:58:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase2-m2b.md:59:        gas/BatchWords.gs gas/batch_words.csv \
docs/cursor/instructions/cursor-instructions-fix-merge-respelling.md:11:`scripts/merge_respelling.py`（または該当パス）を開き、以下を確認してください:
docs/cursor/instructions/cursor-instructions-fix-merge-respelling.md:47:3. 簡単なテスト: 現状のリポジトリで `python3 scripts/merge_respelling.py` を（新規マージなしで）再実行し、`git diff --stat wordlist_GA_a1a2_plus_phonics.json` が **無変更**であることを確認（idempotent であるべき）
docs/cursor/instructions/cursor-instructions-fix-merge-respelling.md:60:  - scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m2.md:81:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase1-m2.md:82:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase1-m2.md:83:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m2.md:84:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:17:| 1 | `data/batches/phase2_m2a_100_with_gloss.json` 配置（`rp_ipa` 同梱・100 エントリ） |
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:28:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:29:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:30:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:31:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:32:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:63:git add data/batches/phase2_m2a_100_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:65:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:66:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:67:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:68:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase2-m2a.md:69:        gas/BatchWords.gs gas/batch_words.csv \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:23:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:24:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:25:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:26:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:27:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:28:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:29:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:55:git add data/batches/phase2_m2d_90_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:57:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:58:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:59:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:60:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:61:        gas/BatchWords.gs gas/batch_words.csv \
docs/cursor/instructions/cursor-instructions-phase2-m2d.md:72:- `gas/BatchWords.gs` は本バッチで 5,397語に更新済み
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:58:これらを **`data/patches/phase2_audit/`** に配置:
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:61:mkdir -p data/patches/phase2_audit
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:62:cp /path/to/patches/*.json data/patches/phase2_audit/
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:72:cp -r data/batches /tmp/batches_pre_phase_b
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:117:patch = json.load(open('data/patches/phase2_audit/wordlist_audit_patch.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:222:patch = json.load(open('data/patches/phase2_audit/wordlist_audit_patch.json'))
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:302:    'pilot': 'data/batches/phase2_pilot_180_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:303:    'm2a': 'data/batches/phase2_m2a_100_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:304:    'm2b': 'data/batches/phase2_m2b_100_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:305:    'm2c': 'data/batches/phase2_m2c_100_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:306:    'm2d': 'data/batches/phase2_m2d_90_with_gloss.json',
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:311:    patch_path = f'data/patches/phase2_audit/phase2_{label}_audit_patch.json'
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:340:**注意:** `data/batches/phase2_pilot_180_with_gloss.json` などのパスは実際のバッチファイル位置に合わせる。もし別の場所 (例: `data/archive/`) にある場合はパスを調整。
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:352:files = [f'data/batches/phase2_{b}_' + ('180' if b=='pilot' else '100' if b in ('m2a','m2b','m2c') else '90') + '_with_gloss.json' for b in BATCHES]
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:380:git add data/batches/phase2_*.json data/patches/phase2_audit/
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:479:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:480:python3 scripts/merge_neighbors.py
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:483:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:486:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:502:`data/patches/` セクションに:
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:505:| `data/patches/phase2_audit/` | Phase B (Package B) 監査で発見した wordlist / batch fixes のパッチ源 |
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:564:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:565:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:566:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:568:        gas/BatchWords.gs \
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:605:### Q1: バッチファイルのパスが `data/batches/` にない場合は？
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:607:**A:** `find . -name "phase2_*.json"` で検索。 `docs/REPOSITORY-STRUCTURE.md` によると `data/batches/` に配置されているはず。もし別の場所にあれば実際のパスに合わせて B3 の script を調整。
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:634:### Q7: `data/patches/phase2_audit/` を残すか削除するか？
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:666:- `data/patches/phase2_audit/phase2_pilot_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:667:- `data/patches/phase2_audit/phase2_m2a_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:668:- `data/patches/phase2_audit/phase2_m2b_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:669:- `data/patches/phase2_audit/phase2_m2c_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:670:- `data/patches/phase2_audit/phase2_m2d_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:671:- `data/patches/phase2_audit/wordlist_audit_patch.json`
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:677:- `data/batches/phase2_pilot_180_with_gloss.json` (3 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:678:- `data/batches/phase2_m2a_100_with_gloss.json` (29 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:679:- `data/batches/phase2_m2b_100_with_gloss.json` (14 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:680:- `data/batches/phase2_m2c_100_with_gloss.json` (22 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:681:- `data/batches/phase2_m2d_90_with_gloss.json` (18 語)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:683:- `data/derived/wordlist_with_neighbors.json` (再生成)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:684:- `data/derived/wordlist_with_neighbors_slim.json` (再生成)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:685:- `data/pipeline/ga_rp_same_report.json` (再生成)
docs/cursor/instructions/cursor-instructions-phase-b-batch-audit.md:689:- `gas/BatchWords.gs` (再エクスポート)
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:47:- `scripts/apply_phonics_cefr_null.py` の削除（**削除しない**。誤った判断とその訂正の記録として残す。ただし本番データへの再実行は今後禁止する旨をコメントに追記）
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:125:### 2-5. `scripts/apply_phonics_cefr_null.py` への注記追加
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:268:6. `scripts/apply_phonics_cefr_null.py` への警告コメント追加の確認
docs/cursor/instructions/cursor-instructions-cefr-phase0a-revert.md:285:  - scripts/apply_phonics_cefr_null.py (add historical warning comment)
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:13:Opus 3スクリプトレビュー（`scripts/ga_to_rp.py` / `scripts/gen_neighbors.py` / `scripts/gen_ga_rp_same.py`）で以下が判明した。追加で `scripts/gen_rp_ipa.py` の SYSTEM_PROMPT にも同種のルール欠陥が見つかり、**過去に Claude API または batch 生成で作られた rp_ipa データが 91 語 実際に破損**している。
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:17:| **R1** | 分類器 dead-code 3件を活性化・composite ギャップ修正 | `scripts/gen_ga_rp_same.py` | reason のみ再分類（フラグ変化なし） |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:18:| **R2** | RP 生成プロンプト修正 + happY 過剰伸長 **82語** + 表記ゆれ **9語** を一括是正 | `scripts/gen_rp_ipa.py`, `scripts/fix_happy_i.py`（新規）, wordlist | rp_ipa 修正 91語 |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:19:| **R3** | `ga_to_rp.py` fallback の最小修正 + BATH_WORDS 統一 | `scripts/ga_to_rp.py`, `scripts/phonology_lexicon.py`（新規） | fallback は未使用のため実データ変化なし |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:31:cp data/pipeline/ga_rp_same_report.json /tmp/ga_rp_same_report_pre_phase_r.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:80:`scripts/gen_ga_rp_same.py` の分類ロジックに以下 **3件の dead code / 分類ギャップ**があることが Opus レビュー + 実データで確認された:
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:90:**ファイル:** `scripts/gen_ga_rp_same.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:192:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:229:git checkout -- wordlist_GA_a1a2_plus_phonics.json data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:260:git add scripts/gen_ga_rp_same.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:262:        data/connected_speech.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:263:        data/weak_forms.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:264:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:274:`scripts/gen_rp_ipa.py` の SYSTEM_PROMPT ルール #4 に `GA /i/ → RP /iː/` という無条件伸長ルールがあり、**word-final 弱形の happY 母音（-y, -ly, -ry, -ery, -ty, ...）に例外指定がない**。この結果、本番 wordlist の rp_ipa に以下 2 種類の破損が確認された:
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:281:## R2-2. 変更内容 (a): `scripts/gen_rp_ipa.py` SYSTEM_PROMPT 更新
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:318:## R2-3. 変更内容 (b): 修正スクリプト `scripts/fix_happy_i.py` 新規作成
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:320:**ファイル:** `scripts/fix_happy_i.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:336:Also updates data/connected_speech.json and data/weak_forms.json (should be no-op
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:470:python3 scripts/fix_happy_i.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:514:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:543:git add scripts/gen_rp_ipa.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:544:        scripts/fix_happy_i.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:546:        data/connected_speech.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:547:        data/weak_forms.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:548:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:555:Data repair via scripts/fix_happy_i.py with orthographic + stress-position filter."
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:564:`scripts/ga_to_rp.py` は Phase 2 以降 fallback として使われておらず、`rp_ipa` は Claude batch 同梱方式で生成されている（本番データに `ga_to_rp` の直接寄与は無いと確認済）。ただし将来の retroactive 実行や他ツール連携で使われる可能性があるため、以下の **latent bug** を潰す:
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:575:**ファイル:** `scripts/phonology_lexicon.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:644:## R3-3. 変更内容 (b): `scripts/ga_to_rp.py` の修正
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:777:## R3-4. 変更内容 (c): `scripts/gen_ga_rp_same.py` の BATH_WORDS を共通モジュールに切替
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:853:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:868:git add scripts/phonology_lexicon.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:869:        scripts/ga_to_rp.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:870:        scripts/gen_ga_rp_same.py \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:872:        data/connected_speech.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:873:        data/weak_forms.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:874:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:877:- New scripts/phonology_lexicon.py consolidates BATH_WORDS_BASE, PALM_WORDS, YOD_CORONALS
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:898:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:899:python3 scripts/merge_neighbors.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:902:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:905:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:962:| 2026-07-XX | v3.21 | Phase R (Repair): 分類器 dead-code 3件活性化（`cot_caught`, `square_near_cure`, BATH+weak composite）、`gen_rp_ipa.py` SYSTEM_PROMPT の happY ルール追加、rp_ipa 91語（happY 過剰伸長 82 + `/ɪ/` 表記ゆれ 9）を一括是正、`scripts/phonology_lexicon.py` に BATH_WORDS/PALM_WORDS を統合、`ga_to_rp.py` fallback の PALM/happY/yod latent bug 修正。 |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:967:### (b) `docs/REPOSITORY-STRUCTURE.md` の `scripts/` セクションに追記
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:970:| `scripts/phonology_lexicon.py` | 共有語彙リスト（BATH_WORDS, PALM_WORDS, YOD_CORONALS）— `ga_to_rp.py` と `gen_ga_rp_same.py` から import |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:971:| `scripts/fix_happy_i.py` | rp_ipa の happY 位置 `/iː/`/`/ɪ/` → `/i/` 是正スクリプト（Phase R2 で1回実行済み。将来のバッチ追加時にも実行推奨） |
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1022:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1023:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1025:        gas/BatchWords.gs \
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1138:- `scripts/phonology_lexicon.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1139:- `scripts/fix_happy_i.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1143:- `scripts/gen_ga_rp_same.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1144:- `scripts/gen_rp_ipa.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1145:- `scripts/ga_to_rp.py`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1147:- `data/connected_speech.json`（ga_rp_same_reason 再付与のみ）
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1148:- `data/weak_forms.json`（同上）
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1149:- `data/pipeline/ga_rp_same_report.json`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1150:- `data/derived/wordlist_with_neighbors.json`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1151:- `data/derived/wordlist_with_neighbors_slim.json`
docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md:1155:- `gas/BatchWords.gs`（export_batch_words で更新）
docs/design/phase-1/brief-cluster-1-top-page.md:255:- **静的 HTML**: `src/index.template.html` (single template) → Vercel Build で 6 言語 HTML 生成
docs/design/phase-1/brief-cluster-1-top-page.md:353:- **HTML + CSS** (静的、React コンポーネントではなく plain HTML): Claude Design のアウトプットは HTML/CSS で受け取り、Naoya さんが `src/index.template.html` に手動 or Cursor Issue で反映
docs/cursor/instructions/cursor-instructions-tts-ab-experiment.md:44:`gas/Code.gs` を改修し、以下 3 つの optional パラメータを受け入れられるようにしてください。**パラメータが渡されない場合は現行動作を完全維持**します（下位互換）。
docs/cursor/instructions/cursor-instructions-tts-ab-experiment.md:435:2. `gas/Code.gs` の主要変更 diff（voice / speed / instr_variant / cache key logic）
docs/cursor/instructions/cursor-instructions-tts-ab-experiment.md:449:  - gas/Code.gs (ALLOWED_VOICES, TTS_INSTR_VARIANTS, param handling,
docs/cursor/instructions/cursor-instructions-tts-ab-experiment.md:457:必要に応じて GAS 再デプロイのコミット（`gas/README.md` 更新など）を追加。
docs/cursor/instructions/cursor-instructions-dignify-hotfix.md:47:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-dignify-hotfix.md:59:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:5:> ゴール: `data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）の各エントリに `cefr` フィールドを追加する
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:20:1. `data/connected_speech.json` の 201 エントリに `cefr` フィールドを追加
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:21:2. `data/weak_forms.json` の 36 エントリに `cefr` フィールドを追加
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:49:cs_data = json.load(open('data/connected_speech.json'))
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:63:json.dump(cs_data, open('data/connected_speech.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:67:wf_data = json.load(open('data/weak_forms.json'))
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:81:json.dump(wf_data, open('data/weak_forms.json', 'w', encoding='utf-8'),
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:87:**注意:** 実際のファイルパスが `data/connected_speech.json` でない場合（リポジトリルート直下等）、既存の Phase B 指示書等を参照してパスを合わせてください。
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:95:cs = json.load(open('data/connected_speech.json'))
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:96:wf = json.load(open('data/weak_forms.json'))
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:139:  - data/connected_speech.json (+cefr field, 201 entries)
docs/cursor/instructions/cursor-instructions-merge-cefr-connected-weak.md:140:  - data/weak_forms.json (+cefr field, 36 entries)
docs/design/phase-1/kickoff-claude-design-prompt.md:118:src/index.template.html
docs/design/phase-1/kickoff-claude-design-prompt.md:121:`src/index.template.html` は現状の SPA 正本ファイルです。現行 UI 構造を確認するために取得してください。
docs/design/phase-1/kickoff-claude-design-prompt.md:381:Naoya が Cursor 経由で `src/index.template.html` に反映できる HTML/CSS の形にする。**Plain HTML + CSS + Vanilla JS** (フレームワークなし)。
docs/design/phase-1/kickoff-claude-design-prompt.md:419:2. GitHub MCP から `src/index.template.html` と `docs/design/tagline-candidates.md` を取得
docs/cursor/instructions/cursor-instructions-zh-split.md:6:> 事前確認済み: `data/guide.json` は既に `zh-Hant` / `zh-Hans` で分離済み（今回は触らない）。Tier 1（UI）と Tier 3（音素解説）のみ対応。
docs/cursor/instructions/cursor-instructions-zh-split.md:20:- `data/guide.json` — 既に分離済み
docs/cursor/instructions/cursor-instructions-zh-split.md:21:- `data/wordlist_*.json` の `gloss.zh` — 単一 `zh` フィールドのまま。UI 側で `zh-Hant` / `zh-Hans` 要求時に `zh` へフォールバック
docs/cursor/instructions/cursor-instructions-zh-split.md:22:- `data/connected_speech.json` の `gloss.zh` / `cs_rule` — 同上
docs/cursor/instructions/cursor-instructions-zh-split.md:270:- `data/guide.json` の中に `"zh-Hant"` キーが存在するか確認（既に存在しているはず。今回のスコープでは触らない）
docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md:7:| **主ソース（行番号）** | **`src/index.template.html`** |
docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md:8:| 補足 | ルート `index.html` は **存在しない**（F2 以降は `src/index.template.html` → build → `/{lang}/index.html`）。生成物 `en/index.html` と構造は同等（head meta 差分のみ） |
docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md:112:1. 正本パスは **`src/index.template.html`**（ルート `index.html` なし）  
docs/cursor/recon/pre-issue-recon-20260716-index-html-functions.md:7:| 主ソース | `src/index.template.html`（ルート `index.html` 無し） |
docs/cursor/recon/pre-issue-recon-20260716-index-html-functions.md:145:- 編集正本は常に `src/index.template.html`
docs/cursor/instructions/cursor-instructions-phase1-m5.md:25:1. `data/batches/phase1_m5_389_with_gloss.json`（389エントリ）を `wordlist_GA_a1a2_plus_phonics.json`（**リポジトリルート**）にマージ
docs/cursor/instructions/cursor-instructions-phase1-m5.md:27:3. `scripts/generate_flap_ipa.py` / `scripts/generate_respelling.py` を実行し narrow IPA・respelling を生成
docs/cursor/instructions/cursor-instructions-phase1-m5.md:35:- `gas/BatchWords.gs` の更新（`scripts/export_batch_words.py` 実行は別タスクとして依頼予定）
docs/cursor/instructions/cursor-instructions-phase1-m5.md:46:m5 = json.load(open('data/batches/phase1_m5_389_with_gloss.json'))
docs/cursor/instructions/cursor-instructions-phase1-m5.md:74:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:75:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:76:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:77:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m5.md:133:6. 既知の残作業（`neighbors`, `gas/BatchWords.gs`更新, R4 pendingレビュー等）
docs/cursor/instructions/cursor-instructions-phase1-m5.md:144:  - data/batches/phase1_m5_389_with_gloss.json (source data)
docs/cursor/instructions/cursor-instructions-phase1-m5.md:158:2. **`gas/BatchWords.gs` 更新**: `scripts/export_batch_words.py` を実行し、4,828語版のバッチワードリストで GAS を再デプロイ
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:14:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:15:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:16:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:17:python3 scripts/merge_respelling.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:18:python3 scripts/gen_neighbors.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:19:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:20:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:48:git add data/batches/phase2_m2c_100_with_gloss.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:50:        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:51:        data/pipeline/ga_rp_same_report.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:52:        data/derived/wordlist_with_neighbors.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:53:        data/derived/wordlist_with_neighbors_slim.json \
docs/cursor/instructions/cursor-instructions-phase2-m2c.md:54:        gas/BatchWords.gs gas/batch_words.csv \
docs/cursor/recon/pre-issue-recon-20260712-seo-meta-architecture.md:65:ガイド本文 `#guideBody` は空コンテナで、内容は JS（`renderGuide`）が `data/guide.json` から挿入。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:19:現状は Node 依存のない静的サイト構成。F2 の `scripts/build-i18n-html.js` 導入時は `package.json` の新規追加が必要。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:35:**ディレクトリ:** `.cursor/`, `.github/`, `data/`, `docs/`, `fonts/`, `gas/`, `i18n/`, `scripts/`, `tests/`, `tools/`
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:39:Issue 例示の `index.html` / `README.md` / `wordlist_*` / `CLAUDE.md` **以外**のルート要素: `.cursor/`, `.github/`, `.gitignore`, `data/`, `docs/`, `fonts/`, `gas/`, `i18n/`, `scripts/`, `tests/`, `tools/`
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:48:scripts/*.log
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:53:### 5. src/ ディレクトリ
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:57:→ F2 の `src/index.template.html` 新規追加はディレクトリごと作成で問題なし（既存衝突なし）。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:93:（調査対象外の `docs/` / `data/` / `i18n/` 内の言語コード使用は別問題。ルート生成物とは非衝突。）
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:109:Python ツールは `scripts/`・`tools/` に存在。Node ビルドは完全に新規導入領域。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:115:1. **グリーンフィールドに近い。** `vercel.json` / `package.json` / `src/` / 言語別ディレクトリ / middleware はすべて未使用で、Phase 5 想定の新規ファイル群と既存資産の直接衝突はほぼ無い。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:130:1. **新規追加は概ね安全:** `vercel.json`, `package.json`, `src/index.template.html`, `scripts/build-i18n-html.js`, `middleware.ts`（任意）, `/en/`…`/fil/` は既存と非衝突。
docs/cursor/recon/pre-issue-recon-20260712-f2-build-infrastructure.md:132:3. **デプロイ経路:** GitHub Actions を触らず、Vercel の Build Command（例: `node scripts/build-i18n-html.js`）+ Output 設定、または生成物コミット + Build なし、のどちらかを Issue で一本化すること。
docs/cursor/reports/cursor-implementation-report-phase-t.md:17:**GAS (`gas/Code.gs`):**
docs/cursor/reports/cursor-implementation-report-phase-t.md:36:- `gas/README.md` に `?urls=1` とパブリック共有の説明
docs/cursor/reports/cursor-implementation-report-phase-t.md:70:| `gas/Code.gs` | `?urls=1`、setSharing、migratePublicSharing |
docs/cursor/reports/cursor-implementation-report-phase-t.md:71:| `gas/README.md` | API / キャッシュ説明 |
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:50:1. データ是正スクリプト `scripts/apply_phonics_cefr_null.py` の新規作成
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:51:2. スクリプト実行による `data/wordlist_GA_a1a2_plus_phonics.json` の更新（652 語の `cefr` を `null` に）
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:62:- `data/guide.json`
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:71:`scripts/apply_phonics_cefr_null.py` を新規作成してください。以下は参考実装で、そのまま使用可能です（動作確認済み。Cursor 側で必要に応じて改善可）:
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:92:INPUT = pathlib.Path("data/wordlist_GA_a1a2_plus_phonics.json")
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:93:BACKUP = pathlib.Path("data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json")
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:163:python3 scripts/apply_phonics_cefr_null.py
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:179:Backup written to: data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:180:Updated file: data/wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:187:`data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json` は安全網としてローカルに残しますが、コミットには含めません。以下を `.gitignore` に追加してください:
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:190:data/*.pre-phase0a.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:201:> 対象: `data/wordlist_GA_a1a2_plus_phonics.json`
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:282:<`python3 scripts/apply_phonics_cefr_null.py` の出力をここに貼り付け>
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:336:d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:353:d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:375:d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:411:2. `python3 scripts/apply_phonics_cefr_null.py` の完全な実行出力
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:430:cp data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json data/wordlist_GA_a1a2_plus_phonics.json
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:447:  - scripts/apply_phonics_cefr_null.py (new)
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:448:  - .gitignore (add data/*.pre-phase0a.json)
docs/cursor/instructions/cursor-instructions-cefr-phase0a.md:451:  - data/wordlist_GA_a1a2_plus_phonics.json (652 entries: cefr B1/B2 -> null)
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:8:| 正本 UI | `src/index.template.html` |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:10:| 連結／弱形 | `data/connected_speech.json`（201）/ `data/weak_forms.json`（36） |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:11:| GAS | `gas/Code.gs` + `BatchWarm.gs` + `BatchWords.gs` |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:23:| **Pipeline✓ Runtime✗** | `data/batches` 等に候補があるが本番 wordlist 未収録 |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:40:| P2 | **C1 はパイプライン候補のみ** | Pipeline✓ Runtime✗ | `lvl.c1` i18n あり。ランタイム CEFR に C1 無し。`data/batches/gap_c1_new.json` 1,015 語 |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:97:| `data/batches/gap_b2_new.json` | 1,992 候補 | うち **ランタイム未収録 ~1,382**（現行 B2=899 は Phase 2 取り込み済み分） |
docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md:98:| `data/batches/gap_c1_new.json` | 1,015 | **ほぼ未収録**（~910 missing）。UI 以前にデータ未マージ |
docs/cursor/recon/pre-issue-recon-20260716-index-html-i18n-css-storage.md:7:| 主ソース | **`src/index.template.html`**（ルート `index.html` 無し） |
docs/cursor/recon/pre-issue-recon-20260716-index-html-i18n-css-storage.md:21:| build のみ（`scripts/build-i18n-html.js`） | `meta.title` / `description` / `ogTitle` / `ogDescription` |
docs/cursor/reports/cursor-implementation-report-guide-full-replace.md:22:cp guide.json data/guide.json
docs/cursor/reports/cursor-implementation-report-guide-full-replace.md:49:g = json.load(open('data/guide.json'))
docs/cursor/reports/cursor-implementation-report-guide-full-replace.md:75:| `data/guide.json` | Claude 生成6言語版で丸ごと置換 |
docs/cursor/reports/cursor-implementation-report-e1-vercel-analytics.md:14:- `src/index.template.html` の `</body>` 直前に `<script defer src="/_vercel/insights/script.js"></script>` を追加
docs/cursor/reports/cursor-implementation-report-e1-vercel-analytics.md:21:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-e1-vercel-analytics.md:38:- `src/index.template.html`: `_vercel/insights/script.js` 1 件（`</body>` 直前）
docs/cursor/reports/cursor-implementation-report-e1-vercel-analytics.md:54:- LAUNCH-CHECKLIST 旧文言の `index.html` は F2 後の正本に合わせ `src/index.template.html` と明記
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:23:| `data/gloss-fil-batch01.json` | 80 | `A` … `bed` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:24:| `data/gloss-fil-batch02.json` | 80 | `bee` … `can't` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:25:| `data/gloss-fil-batch03.json` | 81 | `cap` … `cute` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:26:| `data/gloss-fil-batch04.json` | 54 | （batch04 語群） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:27:| `data/gloss-fil-batch05.json` | 74 | （batch05 語群） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:28:| `data/gloss-fil-batch06.json` | 74 | （batch06 語群） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:29:| `data/gloss-fil-batch07.json` | 65 | （batch07 語群） |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:30:| `data/gloss-fil-batch08.json` | 132 | `I` … `mine` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:87:| `data/gloss-fil-batch03.json` … `batch08.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches03-08.md:88:| `data/gloss-fil-batch01.json` / `batch02.json` | files 19 版で上書き（同一内容） |
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:23:ソース: `data/batches/phase2_m2d_90_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:28:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:29:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:30:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:31:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:32:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:33:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:34:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:35:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:70:- `data/batches/phase2_m2d_90_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:72:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:73:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2d.md:75:- `gas/BatchWords.gs`, `gas/batch_words.csv`
docs/cursor/reports/cursor-implementation-report-tts-prefetch.md:27:### 2-1. GAS（`gas/Code.gs`）
docs/cursor/reports/cursor-implementation-report-tts-prefetch.md:109:| `gas/Code.gs` | `warmOne_` / `handleWarm_` |
docs/cursor/reports/cursor-implementation-report-tts-prefetch.md:110:| `gas/README.md` | warm API 記載 |
docs/cursor/reports/cursor-implementation-report-guide-welcome-v2.md:23:| 対象 | `data/guide.json`（Claude 生成6言語版で上書き） |
docs/cursor/reports/cursor-implementation-report-guide-welcome-v2.md:48:g = json.load(open('data/guide.json'))
docs/cursor/reports/cursor-implementation-report-guide-welcome-v2.md:78:| `data/guide.json` | Claude 生成6言語版で上書き |
docs/cursor/reports/cursor-implementation-report-e2-tally-x-footer.md:14:- `src/index.template.html`: wrap 末尾に `site-footer`（Feedback + X）を新設、insights 直後に Tally embed.js を追加。プレイ中は footer 非表示
docs/cursor/reports/cursor-implementation-report-e2-tally-x-footer.md:21:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:19:### 2-1. データ（`data/guide.json`）
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:69:| `data/guide.json` | 新規（5言語ガイド本文） |
docs/cursor/reports/cursor-implementation-report-multilingual-guide.md:99:- 本文はオフライン `data/guide.json` のみ。GAS 再デプロイ不要
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:6:  カバー率不足そのものより深刻な **`scripts/ga_to_rp.py` のロジックバグ**を発見
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:15:`scripts/ga_to_rp.py`（GA→RP のオフラインルール変換、Britfone/Claude API が使えない時の最終フォールバック）が、
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:36:| `data/connected_speech.json` | 201 | 0 |
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:37:| `data/weak_forms.json` | 36 | 0 |
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:60:`scripts/ga_to_rp.py` を別途受領のファイルに差し替える。
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:90:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:98:git add scripts/ga_to_rp.py \
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:100:        data/pipeline/ga_rp_same_report.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:108:### 3-1. `gas/BatchWords.gs` の再更新
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:110:現在 `gas/BatchWords.gs` は **4,828 語のまま**（neighbors v2 タスク時点のスナップショット）。
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:114:python3 scripts/export_batch_words.py
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:121:Phase 2 pilot 実装時、`data/derived/connected_speech_with_rp.json`（古い 15 句版）が
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:124:再発防止のため、以下の legacy ファイルを削除するか、`data/archive/` へ移動することを推奨:
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:127:git rm data/derived/connected_speech.legacy15.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:128:git rm data/derived/connected_speech_with_rp.json
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:133:`data/derived/` 配下に存在すること自体が「merge スクリプトが誤って読みに行く」リスクを生んでいる。
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:141:| 1 | `scripts/ga_to_rp.py` 差し替え | 完了 |
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:146:| 6 | `gas/BatchWords.gs` の語数コメント | `5007 words` |
docs/cursor/instructions/cursor-instructions-rp-ipa-bugfix.md:160:**Phase 2 M2 以降の方針変更**: Claude 側が `data/batches/phase2_mN_*.json` を生成する際、
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:9:`scripts/gen_neighbors.py` を v2（語長適応型 MAX_DIST）に差し替え、全 4,828 語の neighbors を再計算した。派生 JSON・レポートを更新し、GitHub Pages 向けに `merge_neighbors.py` で本番 wordlist へ反映、`export_batch_words.py` で `gas/BatchWords.gs` を 4,828 語に更新した。
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:14:完了: 4828語に neighbors 付与 → data/derived/wordlist_with_neighbors.json
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:15:slim版: data/derived/wordlist_with_neighbors_slim.json
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:61:- `data/derived/wordlist_with_neighbors.json`: `neighbors` は `[{w, d, type}, ...]` 形式
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:62:- `data/derived/wordlist_with_neighbors_slim.json`: `neighbors` は `string[]` 形式
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:80:| `scripts/gen_neighbors.py` | v2 適応型アルゴリズムに差し替え |
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:81:| `data/derived/wordlist_with_neighbors.json` | 全 4,828 語 neighbors 詳細版 |
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:82:| `data/derived/wordlist_with_neighbors_slim.json` | slim 版（string 配列） |
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:85:| `gas/BatchWords.gs` | `export_batch_words.py` で 4,828 語に更新 |
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:86:| `gas/batch_words.csv` | 同上 |
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:97:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:98:python3 scripts/merge_neighbors.py      # GitHub Pages ランタイム用
docs/cursor/reports/cursor-implementation-report-neighbors-v2.md:99:python3 scripts/export_batch_words.py   # GAS 語彙リスト用
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches17-20.md:78:| `data/gloss-fil-batch04.json` | files 22 版で上書き |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches17-20.md:79:| `data/gloss-fil-batch17.json` … `20.json` | 新規 |
docs/cursor/instructions/cursor-instructions-phase1-m4.md:72:python3 scripts/generate_flap_ipa.py
docs/cursor/instructions/cursor-instructions-phase1-m4.md:73:python3 scripts/merge_flap_candidates.py
docs/cursor/instructions/cursor-instructions-phase1-m4.md:74:python3 scripts/generate_respelling.py
docs/cursor/instructions/cursor-instructions-phase1-m4.md:75:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-connected-weak-cefr-badges.md:9:`data/connected_speech.json`（201 句）に既に付与済みの `cefr` フィールドを、語彙ブラウザ **Phrases タブ**にバッジとして表示。練習中カードの CEFR 表示は既存 `setCardCefr()` が対応済みのため新規実装なし（動作確認のみ）。
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:12:Added `scripts/merge_flap_candidates.py` and executed:
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:15:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:86:python3 scripts/verify_tokenize_narrow.py
docs/cursor/reports/cursor-implementation-report-phase2a-flap-merge.md:118:- [x] `scripts/merge_flap_candidates.py` created
docs/cursor/reports/cursor-implementation-report-cefr-phase0b.md:33:（`gas/BatchWarm.gs` など既存の無関係変更は除外）
docs/cursor/reports/cursor-implementation-report-guide-philosophy-solves.md:28:| 対象 | `data/guide.json` |
docs/cursor/reports/cursor-implementation-report-guide-philosophy-solves.md:48:g = json.load(open('data/guide.json'))
docs/cursor/reports/cursor-implementation-report-guide-philosophy-solves.md:76:| `data/guide.json` | philosophy / solves のみマージ |
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:21:ソース: `data/batches/phase2_m2a_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:30:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:31:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:33:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:73:- `data/batches/phase2_m2a_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:75:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:76:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2a.md:78:- `gas/BatchWords.gs`, `gas/batch_words.csv`
docs/cursor/reports/cursor-implementation-report-rp-tts.md:22:### 2-1. GAS（`gas/Code.gs`）
docs/cursor/reports/cursor-implementation-report-rp-tts.md:49:| `gas/README.md` | API・キャッシュ仕様更新 |
docs/cursor/reports/cursor-implementation-report-rp-tts.md:92:| `gas/Code.gs` | RP TTS 対応 |
docs/cursor/reports/cursor-implementation-report-rp-tts.md:93:| `gas/README.md` | API 更新 |
docs/cursor/reports/cursor-implementation-report-phase2b-respell-merge.md:9:Added `scripts/merge_respelling.py` and executed:
docs/cursor/reports/cursor-implementation-report-phase2b-respell-merge.md:12:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2b-respell-merge.md:91:- [x] `scripts/merge_respelling.py` created
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:18:- `src/index.template.html`: Decode/Encode/Mode B Quiz の near、`lev`、`res-near` CSS を削除（ok/bad のみ）
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:27:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:34:- ブラックリスト: `data/**`、`docs/cursor/instructions/**`、`docs/reference/**`、`docs/design/**` は未編集。near 削除のため `src/index.template.html` のみコード触手（ルート `index.html` は手編集せず）
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:42:- near grep（`src/index.template.html`）: `\bnear\b` / `levenshtein` / `function lev` / `res-near` / `"near"` → ヒット 0
docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md:50:- near 削除は Claude Comment でスコープ拡大。正本は `src/index.template.html`
docs/cursor/reports/cursor-implementation-report-fix-friendliness-ipa.md:33:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-fix-friendliness-ipa.md:34:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase-1-0-b-data-mapping-recon.md:34:- ブラックリスト `data/**` / PURPOSE/SPEC/DESIGN: 未編集
docs/cursor/reports/cursor-implementation-report-phase-1-b-top-page.md:38:src/index.template.html
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:10:Track A ローンチに向け、単一 HTML + JS 動的 meta ではクローラーに多言語 SEO が届かない問題を解くため、6 言語サブディレクトリへの静的 HTML プリレンダと Vercel Build / middleware を導入する。先行整備（#33 分類軸、#35 パターン C、#37 Build rollback）の上で、パターン C の初適用として `index.html` を `src/index.template.html` に移動し、生成物は `.gitignore` 管理外とする。
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:14:- Phase 1: `git mv index.html` → `src/index.template.html`（pure move、md5 一致）
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:16:- Phase 3: `scripts/build-i18n-html.js`、`middleware.ts`、`vercel.json`、`package.json`、`.gitignore` 更新
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:23:- index.html → src/index.template.html (R)
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:24:- scripts/build-i18n-html.js (A)
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:59:| Category A 参照 | `src/index.template.html` / `build-i18n-html.js` / `middleware.ts` 記載済み |
docs/cursor/reports/cursor-implementation-report-f2-seo-subdirectory.md:84:- 以降の HTML 編集は `src/index.template.html` のみ（dev-flow 追記済み）
docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md:69:src/index.template.html
docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md:91:| `data/connected_speech.json` | `7ebc1be2fcaa774d7696dbba5c07df55` |
docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md:92:| `data/weak_forms.json` | `a853cd530443edfd9b7fa3a11e11a116` |
docs/cursor/reports/cursor-implementation-report-phase1-narrow-ipa-respell.md:16:- `scripts/merge_pilot_narrow_respell.py` を新規作成
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:30:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:31:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:32:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:33:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:36:`generate_flap_ipa.py` はリポジトリに未同梱だったため、過去 Phase 2a 添付版を `scripts/generate_flap_ipa.py` として追加して実行。
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:112:- `scripts/generate_flap_ipa.py`（新規追加）
docs/cursor/reports/cursor-implementation-report-phase1-m1-pilot.md:127:A  scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-step4a.md:31:| 入力 | `data/basic_words_patch.json`（74語、CMU 由来 GA IPA、gloss 4言語キュレーション済み） |
docs/cursor/reports/cursor-implementation-report-step4a.md:33:| スクリプト | `scripts/merge_basic_words.py` |
docs/cursor/reports/cursor-implementation-report-step4a.md:79:| `data/basic_words_patch.json` | マージ元データ（確定版） |
docs/cursor/reports/cursor-implementation-report-step4a.md:80:| `scripts/merge_basic_words.py` | 本番 wordlist へのマージ |
docs/cursor/reports/cursor-implementation-report-step4a.md:81:| `scripts/gen_basic_words.py` | 再生成・監査用（CMU 辞書から patch 生成） |
docs/cursor/reports/cursor-implementation-report-step4e.md:19:| `connected_patch.json` | 連結句15句 | **別ファイル** `data/connected_speech.json` + 専用タブ |
docs/cursor/reports/cursor-implementation-report-step4e.md:31:| 入力 | `data/casual_patch.json` |
docs/cursor/reports/cursor-implementation-report-step4e.md:32:| スクリプト | `scripts/merge_casual.py` |
docs/cursor/reports/cursor-implementation-report-step4e.md:43:| ファイル | `data/connected_speech.json`（本番 wordlist には未混在） |
docs/cursor/reports/cursor-implementation-report-step4e.md:75:### 2-5. GAS 更新（`gas/Code.gs`）
docs/cursor/reports/cursor-implementation-report-step4e.md:103:python3 scripts/merge_casual.py
docs/cursor/reports/cursor-implementation-report-step4e.md:104:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4e.md:105:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-f3-sitemap-robots-llms.md:33:- F2 成果物（`src/index.template.html` / build / middleware / vercel.json）: 不変
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:42:| 入力 | `data/cs-rule-fil-connected.json`（201件）、`data/cs-rule-fil-weak.json`（36件） |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:79:| `data/cs-rule-fil-connected.json` | 新規配置 |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:80:| `data/cs-rule-fil-weak.json` | 新規配置 |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:81:| `data/connected_speech.json` | 201件に `cs_rule.fil` 追加 |
docs/cursor/reports/cursor-implementation-report-modeb-reveal-tier4-cs-rule-fil.md:82:| `data/weak_forms.json` | 36件に `cs_rule.fil` 追加 |
docs/cursor/reports/cursor-implementation-report-index-html-ui-audit-recon.md:10:UI/UX 抜本見直し Phase 0 の基盤 Recon。ルートに巨大 `index.html` は無くなったため、正本 `src/index.template.html`（生成物 `/{lang}/index.html`）を機械抽出し、Claude が SPEC/DESIGN 突合（段階 2）に使える 3 分割レポートを追加する。コード変更禁止。
docs/cursor/reports/cursor-implementation-report-index-html-ui-audit-recon.md:42:- `src/index.template.html` md5: **不変**（開始前後 `4be324de0bd70260e8e60855cbf1e19c`）
docs/cursor/reports/cursor-implementation-report-index-html-ui-audit-recon.md:77:- [x] `src/index.template.html` 不変  
docs/cursor/reports/cursor-implementation-report-connected-carriers.md:19:### 2-1. データ（`data/connected_speech.json`）
docs/cursor/reports/cursor-implementation-report-connected-carriers.md:66:| `data/connected_speech.json` | carriers 付き201句に置換 |
docs/cursor/reports/cursor-implementation-report.md:76:| **キュレーション辞書（採用）** | 133語: `scripts/expand_polysemy_gloss.py` の `MANUAL` |
docs/cursor/reports/cursor-implementation-report.md:77:| **オフライン JSON（採用）** | 108語: `scripts/remaining_polysemy_data.json` |
docs/cursor/reports/cursor-implementation-report.md:134:| `scripts/expand_polysemy_gloss.py` | 新規 | 多義語展開スクリプト（MANUAL + clear 再適用） |
docs/cursor/reports/cursor-implementation-report.md:135:| `scripts/remaining_polysemy_data.json` | 新規 | 残り108語のオフライン多義語辞書 |
docs/cursor/reports/cursor-implementation-report.md:140:**意図的にコミットしていないもの:** `scripts/gloss_build.log`, `scripts/phonemes_build.log`（ビルドログ）
docs/cursor/reports/cursor-implementation-report.md:155:`gas/Code.gs` の TTS 指示は General American・辞書形・弱形なし・子音対比明確化などを指定。
docs/cursor/reports/cursor-implementation-report-setup-governance.md:40:- 既存機能への影響: なし（`index.html` / `data/` / `scripts/` / `gas/` / `i18n/` / `fonts/` 未変更）
docs/cursor/reports/cursor-implementation-report-step4d.md:33:| 入力 | `data/thin_phoneme_patch.json`（40語、キュレーション gloss） |
docs/cursor/reports/cursor-implementation-report-step4d.md:35:| スクリプト | `scripts/merge_thin_phonemes.py` |
docs/cursor/reports/cursor-implementation-report-step4d.md:90:| `data/thin_phoneme_patch.json` | マージ元（確定版40語） |
docs/cursor/reports/cursor-implementation-report-step4d.md:91:| `scripts/merge_thin_phonemes.py` | 本番 wordlist へのマージ |
docs/cursor/reports/cursor-implementation-report-step4d.md:92:| `scripts/gen_thin_phoneme_words.py` | 再生成・監査用 |
docs/cursor/reports/cursor-implementation-report-step4d.md:93:| `data/wordlist_with_neighbors.json` | neighbors 詳細版（再生成） |
docs/cursor/reports/cursor-implementation-report-step4d.md:94:| `data/wordlist_with_neighbors_slim.json` | neighbors slim 版（再生成） |
docs/cursor/reports/cursor-implementation-report-step4d.md:113:python3 scripts/merge_thin_phonemes.py
docs/cursor/reports/cursor-implementation-report-step4d.md:114:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4d.md:115:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-g2-legal-footer.md:14:- `src/index.template.html`: footer に Feedback → Terms → Privacy → X の順でリンク追加
docs/cursor/reports/cursor-implementation-report-g2-legal-footer.md:21:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-step6.md:41:| 本番 | `data/connected_speech.json` を置き換え |
docs/cursor/reports/cursor-implementation-report-step6.md:42:| 退避 | 旧15句 → `data/connected_speech.legacy15.json` |
docs/cursor/reports/cursor-implementation-report-step6.md:92:| `data/connected_speech.json` | 201句に置き換え |
docs/cursor/reports/cursor-implementation-report-step6.md:93:| `data/connected_speech.legacy15.json` | 旧15句退避 |
docs/cursor/reports/cursor-implementation-report-step6.md:107:> **注意:** `scripts/merge_rp_ipa.py` は `data/connected_speech_with_rp.json`（旧15句）で上書きするため、STEP6 以降は **実行しないこと**。連結句の正本は `data/connected_speech.json`。
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:21:- ソース: `data/batches/phase1_m5_389_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:113:- `data/batches/phase1_m5_389_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:114:- `data/pipeline/phase2a_*.json`, `data/pipeline/phase2b_*.json`
docs/cursor/reports/cursor-implementation-report-phase1-m5.md:120:2. **`gas/BatchWords.gs` 更新** — `export_batch_words.py` + GAS 再デプロイ
docs/cursor/reports/cursor-implementation-report-gsc-coverage-alert.md:14:- `scripts/build-i18n-html.js`: `hreflangBlock()` の `x-default` href を `https://ipasounddrill.app/` → `https://ipasounddrill.app/en/` に変更
docs/cursor/reports/cursor-implementation-report-gsc-coverage-alert.md:23:- scripts/build-i18n-html.js (M)
docs/cursor/reports/cursor-implementation-report-gsc-coverage-alert.md:33:- `node scripts/build-i18n-html.js` を実行し、生成された `en/index.html` 等の hreflang x-default が `https://ipasounddrill.app/en/` を指すことを確認
docs/cursor/reports/cursor-implementation-report-phase-1-d-pr1-drill-2a-2b.md:49:src/index.template.html
docs/cursor/reports/cursor-implementation-report-respell-v2-patch.md:17:| `scripts/generate_respelling.py` | Added (v2 logic with syllabic+coda fix) |
docs/cursor/reports/cursor-implementation-report-respell-v2-patch.md:25:python3 scripts/merge_respelling.py --draft phase2b_respell_draft_v2.json --no-clear-pending
docs/cursor/reports/cursor-implementation-report-respell-v2-patch.md:82:- [x] `generate_respelling.py` v2 added to `scripts/`
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-complete.md:86:| `data/gloss-fil-batch01.json` / `03–34.json` | files 23 版で上書き or 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-complete.md:87:| `data/gloss-fil-batch02.json` | 変更なし |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-complete.md:88:| `data/gloss-fil-batch21.json` … `34.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-cefr-phase0a-revert.md:10:- `scripts/apply_phonics_cefr_null.py`（再実行禁止の履歴警告を追加）
docs/cursor/reports/cursor-implementation-report-cefr-phase0a-revert.md:78: M scripts/apply_phonics_cefr_null.py
docs/cursor/reports/cursor-implementation-report-cefr-phase0a-revert.md:84:（`gas/BatchWarm.gs` ほか無関係変更は除外）
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:29:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:30:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:31:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m4.md:32:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-step5.md:28:API キー未設定のため、**ルールベース変換**（`scripts/ga_to_rp.py`）で `data/rp_complete.json` を生成しマージ。
docs/cursor/reports/cursor-implementation-report-step5.md:34:| 実行 | `python3 scripts/gen_rp_ipa.py`（39 バッチ） |
docs/cursor/reports/cursor-implementation-report-step5.md:36:| マージ | `cp rp_complete.json data/rp_complete.json` → `python3 scripts/merge_rp_ipa.py` |
docs/cursor/reports/cursor-implementation-report-step5.md:38:| 品質レビュー | **Claude 手番 (2) は未実施** — `data/rp_complete.json` のレビューを推奨 |
docs/cursor/reports/cursor-implementation-report-step5.md:40:オフライン版スクリプト（`scripts/gen_rp_ipa_offline.py` / `scripts/ga_to_rp.py`）はフォールバック用として残置。
docs/cursor/reports/cursor-implementation-report-step5.md:50:| 入力 | `data/rp_complete.json`（3,059 語） |
docs/cursor/reports/cursor-implementation-report-step5.md:51:| スクリプト | `scripts/merge_rp_ipa.py` |
docs/cursor/reports/cursor-implementation-report-step5.md:58:| 入力 | `data/connected_speech_with_rp.json`（手動確定 15 句） |
docs/cursor/reports/cursor-implementation-report-step5.md:59:| 出力 | `data/connected_speech.json` を更新 |
docs/cursor/reports/cursor-implementation-report-step5.md:109:| `data/connected_speech.json` | `rp_ipa` 追加（15 句） |
docs/cursor/reports/cursor-implementation-report-step5.md:110:| `data/rp_complete.json` | 新規（オフライン生成） |
docs/cursor/reports/cursor-implementation-report-step5.md:111:| `data/connected_speech_with_rp.json` | 参照用コピー |
docs/cursor/reports/cursor-implementation-report-step5.md:112:| `scripts/ga_to_rp.py` | 新規 |
docs/cursor/reports/cursor-implementation-report-step5.md:113:| `scripts/gen_rp_ipa_offline.py` | 新規 |
docs/cursor/reports/cursor-implementation-report-step5.md:114:| `scripts/merge_rp_ipa.py` | 新規 |
docs/cursor/reports/cursor-implementation-report-step5.md:115:| `scripts/gen_rp_ipa.py` | 配置（API 版） |
docs/cursor/reports/cursor-implementation-report-step5.md:116:| `scripts/gen_connected_rp.py` | 配置（監査用） |
docs/cursor/reports/cursor-implementation-report-step5.md:142:1. `data/rp_complete.json`（または wordlist の `rp_ipa` 列）の **品質レビュー** — 特に短縮形・カジュアル・TRAP-BATH 境界
docs/cursor/reports/cursor-implementation-report-g1-legal-docs.md:47:- 既存機能への影響: `src/index.template.html`、runtime data contract 8 パス、`i18n/`、`data/`、`scripts/`、`tools/`、`gas/` は未変更
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:36:パッチ源: `data/patches/phase2_audit/`
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:46:- PURPOSE v3.24 / REPOSITORY-STRUCTURE / data/README / cursor README
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:78:| `data/batches/phase2_*.json`（5） | 86 語同期 |
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:79:| `data/patches/phase2_audit/*` | パッチ源 + final_summary |
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:81:| `data/derived/wordlist_with_neighbors*.json` | 再生成 |
docs/cursor/reports/cursor-implementation-report-phase-b-batch-audit.md:83:| `docs/REPOSITORY-STRUCTURE.md` / `data/README.md` | phase2_audit 記載 |
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:47:- `scripts/validate-cefr-tags.py` + `.github/workflows/validate-cefr-tags.yml`
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:86:src/index.template.html
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:87:scripts/validate-cefr-tags.py
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:111:| `data/connected_speech.json` | `7ebc1be2fcaa774d7696dbba5c07df55` |
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:112:| `data/weak_forms.json` | `a853cd530443edfd9b7fa3a11e11a116` |
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md:118:- `python3 scripts/validate-cefr-tags.py` → OK
docs/cursor/reports/cursor-implementation-report-fix-merge-respelling.md:11:`scripts/merge_respelling.py` には次の処理があった:
docs/cursor/reports/cursor-implementation-report-fix-merge-respelling.md:46:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-fix-merge-respelling.md:57:- `scripts/merge_respelling.py`
docs/cursor/reports/cursor-implementation-report-i2-cta-mobile.md:37:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-step4c.md:44:| 入力 | `data/irregular_forms_patch.json`（90語） |
docs/cursor/reports/cursor-implementation-report-step4c.md:46:| スクリプト | `scripts/merge_irregular_forms.py` |
docs/cursor/reports/cursor-implementation-report-step4c.md:54:語彙追加に伴い `scripts/gen_neighbors.py`（K=8, MAX_DIST=2）で全語再計算し、`scripts/merge_neighbors.py` で本番へ反映。
docs/cursor/reports/cursor-implementation-report-step4c.md:71:`gen_neighbors.py` を拡張し、詳細版と **slim 版**（`data/wordlist_with_neighbors_slim.json`）を同時出力するよう改善。
docs/cursor/reports/cursor-implementation-report-step4c.md:85:| `data/irregular_forms_patch.json` | マージ元（確定版90語） |
docs/cursor/reports/cursor-implementation-report-step4c.md:86:| `scripts/merge_irregular_forms.py` | 本番 wordlist へのマージ |
docs/cursor/reports/cursor-implementation-report-step4c.md:87:| `scripts/gen_irregular_forms.py` | 再生成・監査用 |
docs/cursor/reports/cursor-implementation-report-step4c.md:88:| `data/wordlist_with_neighbors.json` | neighbors 詳細版（再生成） |
docs/cursor/reports/cursor-implementation-report-step4c.md:89:| `data/wordlist_with_neighbors_slim.json` | neighbors slim 版（再生成） |
docs/cursor/reports/cursor-implementation-report-step4c.md:106:python3 scripts/merge_irregular_forms.py
docs/cursor/reports/cursor-implementation-report-step4c.md:107:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4c.md:108:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:36:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:37:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:38:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:39:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m3.md:109:- `scripts/merge_respelling.py`（恒久修正）
docs/cursor/reports/cursor-implementation-report-change-classification.md:55:- C5（Runtime data/schema）と C6（Product behavior/UX）は Issue 本文でコード名のみ文脈登場（C1–C4/C7 が明示）のため、F2/React/Sentry の例と矛盾しない定義で補完
docs/cursor/reports/cursor-implementation-report-step4b.md:38:| 入力 | `data/wordlist_with_neighbors_slim.json`（2,914語） |
docs/cursor/reports/cursor-implementation-report-step4b.md:40:| スクリプト | `scripts/merge_neighbors.py` |
docs/cursor/reports/cursor-implementation-report-step4b.md:41:| 方針 | `w` をキーに突き合わせ、**neighbors のみ上書き**。他フィールド（w/ipa/cefr/pos/src/pattern/group/gloss）は本番を正とする |
docs/cursor/reports/cursor-implementation-report-step4b.md:66:| `data/wordlist_with_neighbors_slim.json` | マージ元（slim 形式・確定版） |
docs/cursor/reports/cursor-implementation-report-step4b.md:67:| `scripts/merge_neighbors.py` | 本番 wordlist への neighbors マージ＋検証 |
docs/cursor/reports/cursor-implementation-report-step4b.md:68:| `scripts/gen_neighbors.py` | 語彙変更後の neighbors 再生成（K=8, MAX_DIST=2） |
docs/cursor/reports/cursor-implementation-report-step4b.md:112:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4b.md:133:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-step4b.md:134:# → data/wordlist_with_neighbors.json, docs/neighbors_report.md
docs/cursor/reports/cursor-implementation-report-step4b.md:135:python3 scripts/merge_neighbors.py   # slim 源を更新した場合は slim も再出力が必要
docs/cursor/reports/cursor-implementation-report-def-merge.md:23:| 入力 | `data/def-batch01.json` … `def-batch08.json`（Claude 生成） |
docs/cursor/reports/cursor-implementation-report-def-merge.md:67:| `data/def-batch01.json` … `def-batch08.json` | 新規配置 |
docs/cursor/reports/cursor-implementation-report-def-merge.md:84:- batch09 以降の追加マージは `data/def-batchNN.json` を配置して `merge_def.py` を再実行するだけで対応可能（上書きマージ）
docs/cursor/reports/cursor-implementation-report-phase-1-e-pr1-vocab-symbol.md:47:src/index.template.html
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:39:cp rp_complete.fixed.json data/rp_complete.json
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:40:cp rp_dress_vowel_fix.patch.json data/rp_dress_vowel_fix.patch.json
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:41:python3 scripts/merge_rp_ipa.py
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:96:| `data/rp_complete.json` | `rp_complete.fixed.json` で差し替え |
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:97:| `data/rp_dress_vowel_fix.patch.json` | 新規（差分記録） |
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:99:| `data/connected_speech.json` | 再マージ（内容同一） |
docs/cursor/reports/cursor-implementation-report-step5-dress-fix.md:114:- `data/rp_complete.json` は `ɛ` ゼロ状態
docs/cursor/reports/cursor-implementation-report-tagalog-tier1.md:32:| `data/guide.json` | 6言語版に差し替え（`fil` セクション追加・8セクション） |
docs/cursor/reports/cursor-implementation-report-tagalog-tier1.md:60:| `data/guide.json` 6言語版 | ✅ |
docs/cursor/reports/cursor-implementation-report-tagalog-tier1.md:75:| `data/guide.json` | fil 追加版に差し替え |
docs/cursor/reports/cursor-implementation-report-docs-infrastructure-overhaul.md:48:- 既存機能への影響: なし（index.html、data/、gas/、i18n/、fonts/ 全て未変更）
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches09-12.md:80:| `data/gloss-fil-batch02.json` … `05.json` | files 20 版で上書き |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches09-12.md:81:| `data/gloss-fil-batch09.json` … `12.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:21:ソース: `data/batches/phase2_pilot_180_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:31:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:32:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:33:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:54:**注意:** `merge_rp_ipa.py` 実行時、`data/derived/connected_speech_with_rp.json` が古く（15 句）`connected_speech.json` を上書きしてしまったため、**201 句を git から復元**し `gen_ga_rp_same.py` を再実行。wordlist の `rp_ipa` は直接付与済みのため `merge_rp_ipa.py` は再実行していない。
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:92:| `data/batches/gap_b2_new.json` | B2 マスタリスト（1,992 語） |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:93:| `data/batches/gap_c1_new.json` | C1 マスタリスト（1,015 語） |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:94:| `data/batches/gap_a2_completion.json` | A2 gap 6 語 |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:95:| `data/batches/pilot_b2_180.json` | pilot 語彙リスト（headword のみ） |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:96:| `data/batches/phase2_pilot_180_with_gloss.json` | pilot 完成データ |
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:101:- `data/batches/phase2_pilot_180_with_gloss.json` + gap/pilot 参照 JSON
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:102:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:103:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-phase2-pilot.md:109:2. **`gas/BatchWords.gs`** — 5,007 語版更新（別タスク）
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:34:- `data/patches/dignify_dignity_rp_hotfix.json`
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:35:- `data/pipeline/ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:36:- `data/derived/rp_progress.json`（wordlist 同期）
docs/cursor/reports/cursor-implementation-report-dignify-hotfix.md:43:- `data/pipeline/r4_pending_review_list.csv` / `.json`
docs/cursor/reports/cursor-implementation-report-modal-escape-support.md:14:- `src/index.template.html`: 統合 `keydown` リスナー `onModalEscapeKey` を追加
docs/cursor/reports/cursor-implementation-report-modal-escape-support.md:23:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:28:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:29:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:30:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase1-m2.md:31:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-i1-english-copy.md:18:- `src/index.template.html`: 変更なし（hardcoded は i18n フォールバック、Feedback/X は E2 意図どおり英語固定）
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches13-16.md:81:| `data/gloss-fil-batch02.json` / `06–08.json` | files 21 版で上書き |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil-batches13-16.md:82:| `data/gloss-fil-batch13.json` … `16.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-phase-r.md:106:| 新規 | `scripts/fix_happy_i.py`, `scripts/phonology_lexicon.py` |
docs/cursor/reports/cursor-implementation-report-phase-r.md:107:| 修正 | `scripts/gen_ga_rp_same.py`, `scripts/gen_rp_ipa.py`, `scripts/ga_to_rp.py` |
docs/cursor/reports/cursor-implementation-report-phase-r.md:108:| データ | `wordlist_GA_a1a2_plus_phonics.json`, `data/pipeline/ga_rp_same_report.json`, `data/derived/wordlist_with_neighbors*.json` |
docs/cursor/reports/cursor-implementation-report-cs-rule-3-languages.md:14:- `data/connected_speech.json`: 全 201 句の `cs_rule` に `ko` / `zh-Hans` / `zh-Hant` を追加
docs/cursor/reports/cursor-implementation-report-cs-rule-3-languages.md:22:- data/connected_speech.json (M)
docs/cursor/reports/cursor-implementation-report-cs-rule-3-languages.md:33:- `src/index.template.html` / i18n / wordlist: 未変更
docs/cursor/reports/cursor-implementation-report-zh-split.md:28:- `data/guide.json` — already had `zh-Hant` / `zh-Hans`
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:10:GA/RP が学習者にとって実質同じかを、ルールベース分類器 `scripts/gen_ga_rp_same.py` で事前フラグ化し、Reveal 画面・語彙ブラウザの「同じ」表示判定を `c.ga_rp_same` 参照に切り替えた。
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:31:data/connected_speech.json: 201 items — 94 same, 107 different
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:42:data/weak_forms.json: 36 items — 30 same, 6 different
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:86:| `scripts/gen_ga_rp_same.py` | 新規 — ルールベース分類器 |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:88:| `data/connected_speech.json` | 201 句に同フィールド付与 |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:89:| `data/weak_forms.json` | 36 語に同フィールド付与 |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:90:| `data/pipeline/ga_rp_same_report.json` | 分布レポート |
docs/cursor/reports/cursor-implementation-report-ga-rp-same-flag.md:105:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-va-opt-out.md:14:- `src/index.template.html`: Analytics script 直前に `va-disable` / `va-enable` IIFE を追加
docs/cursor/reports/cursor-implementation-report-va-opt-out.md:20:- src/index.template.html (M)
docs/cursor/reports/cursor-implementation-report-va-opt-out.md:37:- `src/index.template.html`: `va-disable` / `insights/script.js` 存在、IIFE が insights 直前
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:25:| `data/gloss-fil-batch01.json` | 80 | `A` … `bed` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:26:| `data/gloss-fil-batch02.json` | 80 | `bee` … `can't` |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:34:- `data/gloss-fil-batch*.json` を glob で読み込み、`wordlist_GA_a1a2_plus_phonics.json` の各エントリ `gloss.fil` にマージ
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:90:| `data/gloss-fil-batch01.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:91:| `data/gloss-fil-batch02.json` | 新規 |
docs/cursor/reports/cursor-implementation-report-tier2-gloss-fil.md:118:- 追加バッチは `data/gloss-fil-batchNN.json` として配置し、`python3 tools/merge_gloss_fil.py` を再実行（glob で自動拾い・増分マージ可）
docs/cursor/reports/cursor-implementation-report-tts-ab-experiment.md:9:### `gas/Code.gs`
docs/cursor/reports/cursor-implementation-report-tts-ab-experiment.md:31:### `gas/README.md`
docs/cursor/reports/cursor-implementation-report-tts-ab-experiment.md:41: M gas/Code.gs
docs/cursor/reports/cursor-implementation-report-tts-ab-experiment.md:42: M gas/README.md
docs/cursor/reports/cursor-implementation-report-tts-ab-experiment.md:48:（`gas/BatchWarm.gs` など既存の unrelated 変更は本件コミット対象外）
docs/cursor/reports/cursor-implementation-report-tts-ab-experiment.md:52:## 3) `gas/Code.gs` 主要差分
docs/cursor/reports/cursor-implementation-report-weak-forms.md:19:### 2-1. データ（`data/weak_forms.json`）
docs/cursor/reports/cursor-implementation-report-weak-forms.md:27:### 2-2. GAS（`gas/Code.gs`）
docs/cursor/reports/cursor-implementation-report-weak-forms.md:86:| `data/weak_forms.json` | 新規（36語） |
docs/cursor/reports/cursor-implementation-report-weak-forms.md:88:| `gas/Code.gs` | `?weak=` エンドポイント |
docs/cursor/reports/cursor-implementation-report-weak-forms.md:89:| `gas/README.md` | API ドキュメント追記 |
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:11:| Added | `scripts/apply_phonics_cefr_null.py` |
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:38:Note: wordlist path is repo root (`wordlist_GA_a1a2_plus_phonics.json`), not `data/` — consistent with existing codebase.
docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md:76:- [x] `scripts/apply_phonics_cefr_null.py` created
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:11:| ランタイムと非ランタイムの分離 | ブラウザが fetch する JSON は `data/` 直下 + ルート wordlist のみ |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:12:| パイプライン中間物は `data/pipeline/` | R4 作業リストなど機械可読データを `docs/reference/` から移動 |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:13:| 各階層に README | `data/`, `data/batches/`, `data/pipeline/`, `data/archive/`, `docs/cursor/` |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:21:| R4 作業リスト | `docs/reference/r4_pending_review_list.{json,csv}` | `data/pipeline/` |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:22:| wordlist バックアップ | ルート `*.pre-phase0a.json` | `data/archive/`（gitignore 対象のまま） |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:34:| `data/README.md` | runtime / batches / pipeline / derived / patches / archive の見分け |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:35:| `data/batches/README.md` | バッチ命名規則と現行一覧 |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:36:| `data/pipeline/README.md` | ステージング JSON の一覧 |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:37:| `data/archive/README.md` | ローカル退避の説明 |
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:42:- `scripts/paths.py` — `DATA` 定義順の修正、`R4_REVIEW_LIST_*`, `GA_RP_SAME_REPORT`, `ARCHIVE` 追加
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:43:- `.gitignore` — `scripts/*.log` 追加
docs/cursor/reports/cursor-implementation-report-repo-structure-review.md:63:- `scripts/paths.py` の `DATA` 使用前定義バグを修正（`WORDLIST_BACKUP_PHASE0A`）
docs/cursor/reports/cursor-implementation-report-personas-and-tagline-candidates.md:31:- Runtime / i18n / wordlist / `src/index.template.html`: 未変更
docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md:16:- 正本を `src/index.template.html` に統一（`index.html` 参照を修正）
docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md:56:- `src/index.template.html` md5: **不変** `4be324de0bd70260e8e60855cbf1e19c`
docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md:70:- `validate_i18n.py` の HTML パスを `src/index.template.html` へ更新する chore は別 Issue 候補
docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md:90:- [x] `src/index.template.html` 不変
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:21:ソース: `data/batches/phase2_m2b_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:30:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:31:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:33:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:63:- `data/batches/phase2_m2b_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:65:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:66:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2b.md:68:- `gas/BatchWords.gs`, `gas/batch_words.csv`
docs/cursor/reports/cursor-implementation-report-phase-1-d-pr2-drill-2c-2d.md:44:src/index.template.html
docs/cursor/reports/cursor-implementation-report-rp-neighbors-decision.md:54:| `scripts/audit_rp_neighbors.py` | 監査スクリプト新規 |
docs/cursor/reports/cursor-implementation-report-rp-neighbors-decision.md:76:| `scripts/gen_neighbors.py` | 将来手順メモ |
docs/cursor/reports/cursor-implementation-report-rp-neighbors-decision.md:77:| `scripts/audit_rp_neighbors.py` | 新規 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:53:| Claude API | `scripts/gen_rp_ipa.py` | 本番 wordlist の主経路。バッチ 80 語、`rp_progress.json` で再開可 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:54:| ルール変換 | `scripts/ga_to_rp.py` + `gen_rp_ipa_offline.py` | オフライン fallback。`i→iː`, `oʊ→əʊ`, 非 rhotic 等 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:55:| マージ | `scripts/merge_rp_ipa.py` | `rp_complete.json` → `wordlist_GA_a1a2_plus_phonics.json` |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:182:| `data/connected_speech.json` | 同上 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:183:| `data/weak_forms.json`（該当あれば） | 同上 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:184:| `scripts/gen_ga_rp_same.py`（新規） | Claude API or ルールでフラグ生成 |
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:219:- `scripts/gen_rp_ipa.py` — RP IPA 生成（Claude API）
docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md:220:- `scripts/ga_to_rp.py` — ルールベース GA→RP
docs/cursor/reports/cursor-implementation-report-merge-cefr-connected-weak.md:10:Claude 提案（`cefr_proposals_merge_ready.json`、237件）を Naoya 確認のうえ**算出結果どおり採用**し、`data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）の各エントリに `cefr` フィールドを追加した。`vocab_cefr`（参考情報）は本番データには含めていない。
docs/cursor/reports/cursor-implementation-report-merge-cefr-connected-weak.md:54:- `data/connected_speech.json`（+`cefr`、201件）
docs/cursor/reports/cursor-implementation-report-merge-cefr-connected-weak.md:55:- `data/weak_forms.json`（+`cefr`、36件）
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:9:Phase 2 pilot で `ga_to_rp` フォールバックが使用された 17 語について、**母音前 /r/（onset・intervocalic r）が誤脱落**していたバグを修正。`scripts/ga_to_rp.py` を v2 に差し替え、wordlist の `rp_ipa` をパッチ適用後、`ga_rp_same` を再計算した。
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:32:| `scripts/ga_to_rp.py` v2 差し替え | 完了 |
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:33:| `data/patches/rp_ipa_bugfix_patch.json` 適用 | **17/17** |
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:67:- `scripts/ga_to_rp.py`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:68:- `data/patches/rp_ipa_bugfix_patch.json`（新規）
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:70:- `data/pipeline/ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:71:- `data/derived/rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:72:- `gas/BatchWords.gs`, `gas/batch_words.csv`
docs/cursor/reports/cursor-implementation-report-rp-ipa-bugfix.md:73:- 削除: `data/derived/connected_speech.legacy15.json`, `connected_speech_with_rp.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:21:ソース: `data/batches/phase2_m2c_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:26:python3 scripts/generate_flap_ipa.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:27:python3 scripts/merge_flap_candidates.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:28:python3 scripts/generate_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:29:python3 scripts/merge_respelling.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:30:python3 scripts/gen_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:31:python3 scripts/merge_neighbors.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:32:python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:33:python3 scripts/export_batch_words.py
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:59:- `data/batches/phase2_m2c_100_with_gloss.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:61:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:62:- `data/derived/wordlist_with_neighbors.json`, `_slim.json`, `rp_progress.json`, `rp_complete.json`
docs/cursor/reports/cursor-implementation-report-phase2-m2c.md:64:- `gas/BatchWords.gs`, `gas/batch_words.csv`
docs/cursor/reports/cursor-implementation-report-vercel-migration.md:35:- 既存機能への影響: なし（index.html / data / scripts / gas/*.gs / i18n / fonts 未変更）
docs/cursor/briefs/cursor-vocab-page-migration.md:367:**触らない:** `wordlist_*.json`, `data/connected_speech.json`, GAS TTS
docs/cursor/briefs/cursor-connected-carriers.md:6:> 対象: `data/connected_speech.json`（置換）、`index.html`（連結句の出題描画）
docs/cursor/briefs/cursor-connected-carriers.md:68:cp connected_speech_with_carriers.json data/connected_speech.json
docs/cursor/briefs/cursor-connected-carriers.md:136:- [ ] `data/connected_speech.json` が `carriers`（各4個）を持つ201句
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:35:| `guide.json` | en/ja/ko/zh-Hant/zh-Hans/**fil**（各8セクション） | `data/guide.json` | **差し替え** |
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:94:### 3-1. `data/guide.json` を差し替え
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:96:提供された 6言語版 `guide.json` を `data/guide.json` に上書き。
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:148:- [ ] `data/guide.json` を6言語版に差し替え
docs/cursor/briefs/cursor-tagalog-tier1-v2.md:184:| Tier3 #10 `data/guide.json` | §3-1 |
docs/cursor/reports/cursor-implementation-report-phase2-final-merge.md:37:Added `scripts/merge_phase2a_final.py` and executed:
docs/cursor/reports/cursor-implementation-report-phase2-final-merge.md:40:python3 scripts/merge_phase2a_final.py
docs/cursor/reports/cursor-implementation-report-phase2-final-merge.md:67:Extended `scripts/merge_respelling.py` with `--draft` / `--no-clear-pending` flags.
docs/cursor/reports/cursor-implementation-report-phase2-final-merge.md:72:python3 scripts/merge_respelling.py --draft phase2b_respell_final_52.json --no-clear-pending
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:27:| データ ID | `cs044`（`data/connected_speech.json`） |
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:36:       └─ Google Apps Script (gas/Code.gs)
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:192:| `gas/Code.gs` | TTS プロキシ、`phrase_ipa`、instructions、Drive キャッシュ |
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:194:| `data/connected_speech.json` | 201 連結句、IPA、`cs_rule`、`cs_type` |
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:195:| `gas/README.md` | デプロイ手順、キャッシュ命名 |
docs/cursor/briefs/cursor-connected-speech-tts-consultation.md:196:| `gas/BatchWarm.gs` | 単語 GA 一括 warm（連結句用は未整備） |
docs/cursor/briefs/cursor-phase2b-respell-merge.md:46:Phase 2a の `scripts/merge_flap_candidates.py` と同じパターンで、respelling 用に新規作成します。
docs/cursor/briefs/cursor-phase2b-respell-merge.md:48:`scripts/merge_respelling.py`:
docs/cursor/briefs/cursor-phase2b-respell-merge.md:98:**実行方法:** `python3 scripts/merge_respelling.py`
docs/cursor/briefs/cursor-phase2b-respell-merge.md:183:- [ ] `scripts/merge_respelling.py` が作成されている
docs/cursor/briefs/cursor-def-merge.md:6:> 入力: `data/def-batch01.json` … `def-batch08.json`（Claude 生成・`{ "w": "English def" }` マップ）
docs/cursor/briefs/cursor-def-merge.md:24:// data/def-batch01.json (例)
docs/cursor/briefs/cursor-def-merge.md:45:BATCH_GLOB = "data/def-batch*.json"
docs/cursor/briefs/cursor-def-merge.md:104:| `data/def-batch01.json` … `def-batch08.json` | 新規配置（Claude 生成） |
docs/cursor/briefs/cursor-multilingual-guide.md:50:> 配置例: `data/guide.json`（連結句 `data/connected_speech.json` と同様の data ディレクトリ）。
docs/cursor/briefs/cursor-guide-welcome-v2.md:5:> 対象: `data/guide.json`
docs/cursor/briefs/cursor-guide-welcome-v2.md:30:→ **`data/guide.json` を Claude 生成版で丸ごと置き換えるのが最も安全**（他章は元のまま含まれている）。
docs/cursor/briefs/cursor-guide-welcome-v2.md:61:# Claude 生成版を data/guide.json に上書き
docs/cursor/briefs/cursor-guide-welcome-v2.md:62:cp guide.json data/guide.json
docs/cursor/briefs/cursor-guide-welcome-v2.md:69:`data/guide.json` は静的アセットとして配信されるため、変更後は通常の GitHub Pages デプロイで反映される。
docs/cursor/briefs/cursor-guide-welcome-v2.md:85:- [ ] `data/guide.json` が有効な JSON である
docs/cursor/briefs/cursor-guide-welcome-v2.md:94:g = json.load(open('data/guide.json'))
docs/cursor/briefs/cursor-guide-welcome-v2.md:141:| `data/guide.json` | Claude 生成6言語版で上書き |
docs/cursor/briefs/cursor-tier2-gloss-fil-merge.md:42:BATCH_GLOB = "data/gloss-fil-batch*.json"      # バッチ置き場に合わせる
docs/cursor/briefs/cursor-phase2a-flap-merge.md:51:Phase 1 で作成した `scripts/merge_pilot_narrow_respell.py` は pilot 専用（4フィールド固定・完全一致必須）のため、Phase 2a 用に汎用マージスクリプトを新規作成します。
docs/cursor/briefs/cursor-phase2a-flap-merge.md:53:`scripts/merge_flap_candidates.py`:
docs/cursor/briefs/cursor-phase2a-flap-merge.md:109:**実行方法:** `python3 scripts/merge_flap_candidates.py`
docs/cursor/briefs/cursor-phase2a-flap-merge.md:190:`tools/review-vntv.html` と `tools/phase2a_review_needed.json`（コピー）を追加。`tools/` ディレクトリは GitHub Pages のビルド対象外にするか、`.nojekyll` 等で誤って公開されないよう配慮すること（既存の `scripts/` と同様の扱いで問題なければそれに倣う）。
docs/cursor/briefs/cursor-phase2a-flap-merge.md:218:このチェック用の簡易スクリプトを `scripts/verify_tokenize_narrow.py`（または同等の Node スクリプト）として用意し、結果を実装レポートに記載すること。
docs/cursor/briefs/cursor-phase2a-flap-merge.md:254:- [ ] `scripts/merge_flap_candidates.py` が作成されている
docs/cursor/briefs/cursor-alt-accent-display-brief.md:232:| `data/connected_speech.json` | 連結句の `rp_ipa` |
docs/cursor/briefs/cursor-alt-accent-display-brief.md:233:| `data/weak_forms.json` | 弱形の `rp_ipa` |
docs/cursor/briefs/cursor-phase2-final-merge.md:61:# scripts/merge_phase2a_final.py
docs/cursor/briefs/cursor-phase2-final-merge.md:88:`scripts/merge_respelling.py`（Phase 2b で作成済み）をそのまま再利用できます。添付の `phase2b_respell_final_52.json`（52語）に対して実行してください。
docs/cursor/briefs/cursor-phase2-final-merge.md:91:python3 scripts/merge_respelling.py --draft phase2b_respell_final_52.json
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:5:> 対象: `data/connected_speech.json`（201件）/ `data/weak_forms.json`（36件）
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:55:merge("data/connected_speech.json", "data/cs-rule-fil-connected.json", "CS")
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:56:merge("data/weak_forms.json",        "data/cs-rule-fil-weak.json",      "WF")
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:94:| `data/cs-rule-fil-connected.json` | 新規配置（Claude 生成） |
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:95:| `data/cs-rule-fil-weak.json` | 新規配置（Claude 生成） |
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:97:| `data/connected_speech.json` | 201件に `cs_rule.fil` 追加 |
docs/cursor/briefs/cursor-tier4-cs-rule-fil-merge.md:98:| `data/weak_forms.json` | 36件に `cs_rule.fil` 追加 |
docs/handoff/2026-07-26_chat-log-epic-169-followups.md:30:- ドキュメント再編とは**無関係**（`src/index.template.html` は 07-24、`vercel.json` は 07-12 が最終更新で EPIC は未接触、リポに DNS 制御ファイル無し）。
docs/handoff/2026-07-26_chat-log-epic-169-followups.md:36:- PR #188: validator の実体ロジックは `scripts/lib/verify_core.py`（`scripts/validate/validate-markdown-refs.py` が import）。V1 = front-matter が在る時のみ id 検査（無し＝正常）、V4/V5 = `docs/handoff/` 等 legacy prefix を除外（廃止せず将来の検査能力を保持）、V7 = 無変更で現役。+ `docs/claude-design/README.md` の V7 修正、`data/**` の `REPOSITORY-STRUCTURE` → `docs/repo-map.md` 付替。
docs/handoff/pending-tasks.md:57:- Cursor Issue 起票 → `src/index.template.html` に反映のフロー確定
docs/handoff/pending-tasks.md:99:  - `src/index.template.html` の全面リファクタリング
docs/handoff/pending-tasks.md:168:   - 現状 root `index.html` を参照するため FileNotFound、`src/index.template.html` に修正
docs/cursor/briefs/cursor-guide-philosophy-solves.md:5:> 対象: `data/guide.json`
docs/cursor/briefs/cursor-guide-philosophy-solves.md:34:→ **`data/guide.json` を Claude 生成版で丸ごと置き換えが最安全**（welcome 強化版も内包済み）。
docs/cursor/briefs/cursor-guide-philosophy-solves.md:74:g = json.load(open('data/guide.json'))
docs/cursor/briefs/cursor-guide-philosophy-solves.md:99:| `data/guide.json` | Claude 生成版で上書き（welcome v2 も内包） |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:28:  └─ fetch → GAS Web App (gas/Code.gs)
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:108:**warm エンドポイント** (`gas/Code.gs` L252-258):
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:174:| セッション warm | `gas/Code.gs` `handleWarm_` | クライアント Start 時、最大 6 語×chunk |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:175:| GA 一括バッチ | `gas/BatchWarm.gs` | 時間トリガーで ~500 語/run、OpenAI 20 並列 |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:176:| 語彙リスト | `gas/BatchWords.gs` | `scripts/export_batch_words.py` 生成 |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:343:| `gas/Code.gs` | GAS TTS プロキシ、warm、Drive キャッシュ、OpenAI 呼び出し |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:344:| `gas/README.md` | API 仕様・キャッシュ命名規則 |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:358:| `gas/BatchWarm.gs` | サーバー側事前生成・バッチ戦略を議論する時 |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:359:| `gas/BatchWords.gs` | 語彙カバレッジ・未キャッシュ語の割合を見積もる時 |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:360:| `scripts/export_batch_words.py` | バッチ語彙の生成元を確認する時 |
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:367:- `data/**/*.json` — 語彙データ本体（TTS フローには不要。語数統計だけなら `gas/BatchWords.gs` で足りる）
docs/cursor/briefs/cursor-tts-first-question-latency-consultation.md:388:`index.html`, `gas/Code.gs`, `cursor-tts-prefetch-warmup.md`, `cursor-tts-first-question-latency-consultation.md`
docs/handoff/2026-07-27_cd-parity-handoff.md:18:  node scripts/build-i18n-html.js
docs/handoff/2026-07-27_cd-parity-handoff.md:125:- #164 変更ファイル: `src/index.template.html`(+96/-17 の **PC UI**)、`docs/claude-design/pc.dc.html`(+5/-5)、`docs/LAUNCH-CHECKLIST.md`、agent-report。
docs/cursor/briefs/cursor-weak-forms-tab.md:6:> 対象: `index.html`（タブ追加・出題）、`gas/Code.gs`（弱形音声・要再デプロイ）
docs/cursor/briefs/cursor-weak-forms-tab.md:30:`data/weak_forms.json` として配置。36語（L1=10/L2=14/L3=12）。
docs/cursor/briefs/cursor-weak-forms-tab.md:145:  const res = await fetch("data/weak_forms.json");
docs/cursor/briefs/cursor-weak-forms-tab.md:259:- [ ] `data/weak_forms.json`（36語）配置・読み込み
docs/handoff/2026-07-19_chat-handoff-phase-1-a-c.md:56:- `src/index.template.html` (Mood B `:root` + `--legacy-*` 並存、`#purposeStub` / `.profile-3a` 実装、`prev_settings_v1` / `ept_marks_v1` / migration)
docs/handoff/2026-07-19_chat-handoff-phase-1-a-c.md:57:- `scripts/validate-cefr-tags.py` (Phase 1-C 新規、CI ガード)
docs/handoff/2026-07-19_chat-handoff-phase-1-a-c.md:92:13. **CI ガード** (Phase 1-C): `scripts/validate-cefr-tags.py` + workflow、未タグ CEFR 検出時 fail、対象 `wordlist_GA_a1a2_plus_phonics.json` (ルート) + optional data/*.json
docs/handoff/current-state.md:494:- **`src/index.template.html` 分割の検討**: 235KB 単一ファイルが Rv の構造的障壁。L3 調査 Issue
docs/handoff/current-state.md:502:- 実装本体: `src/index.template.html`(235KB、インライン JS)
docs/handoff/current-state.md:503:- ビルド: `scripts/build-i18n-html.js` → `/{lang}/index.html`
docs/features/2d.md:34:`data/connected_speech.json`（201 句）、`data/weak_forms.json`（36 語）— `docs/data-contract.md` §3 connected_speech / weak_forms / guide スキーマ。
docs/cursor/briefs/cursor-tts-prefetch-warmup.md:6:> 対象: `gas/Code.gs`（**改修あり**: warm エンドポイント追加）、`index.html`（先読み・スピーカー活性制御）
docs/cursor/briefs/cursor-tts-prefetch-warmup.md:30:## 2. GAS 改修（`gas/Code.gs`）
docs/features/screen-inventory.md:7:`src/index.template.html` 実装が正本。CSS: ~L90-1035、HTML: ~L1080-1650、JS: ~L1760-5876。
docs/features/screen-inventory.md:103:- 本ファイルに列挙した全 DOM セレクタは `src/index.template.html` 内に実在することを `grep` で確認済み（テスト観点）
docs/features/3c.md:10:- **既知の乖離（2026-07-29 突合時点）**: `3b` の絞り込み UI は `.vocab-ipa-filter`（IPA キーボードをインライン統合、`vocabIpaFilterBar`）に置き換わっており、`#/vocab/ipa` へ遷移する UI トリガー（旧 Sticky filter の Segmented「IPA」ボタン等）は `src/index.template.html` 内に見当たらない。ルート定義・DOM・関数 (`showSymbolPickerView`) 自体はコード上に温存されているが、現行 UI からは到達不能な可能性が高い（hash 直打ちでのみ到達）。要 Naoya 確認・別 Issue で扱う
docs/handoff/claude-design-integ-handoff.md:16:- 設計トレース: `docs/product.md`（WHY）→ `docs/features/<id>.md`（WHAT・1 ID 1ファイル）＋ `docs/features/_common.md`（横断挙動）＋ `docs/features/README.md`（ID レジストリ表）→ `docs/impact-ledger.json`（WHERE・source シンボルの blast-radius、`scripts/gen_impact_ledger.py` で再生成可能）。
docs/handoff/claude-design-integ-handoff.md:19:- ソース単一ファイル: `src/index.template.html`（約5400行）。
docs/handoff/claude-design-integ-handoff.md:32:**次セッションの最初の仕事は、この食い違いを Naoya に確認して確定させること。** 「history.md の退役 framing」と「Naoya の登録漏れ判断」のどちらが各 ID の実態かを、実ソース `src/index.template.html` の該当挙動を根拠に 1 件ずつ判定する（3 つを一括で扱わない。3e/3f/3g で実態が異なる可能性が高い）。判定後にのみ、生きている ID を features へ昇格・レジストリ拡張し、退役なら history.md の記述を正として残す。
docs/handoff/claude-design-integ-handoff.md:56:整合は「デザイン（`.dc.html`）↔ `docs/features/<id>.md`（WHAT）↔ 実装 `src/index.template.html`」の 3 者で取り、乖離は `DIVERGENCE.md` に記録する既存フローに従う。
docs/handoff/claude-design-integ-handoff.md:60:- ゾーン規約: 運用ゾーン（`.claude/**`, `CLAUDE.md`, `docs/**`, `.cursor/**`, `.github/**`）と開発ゾーン（`src/**`, `i18n/**`, `data/**`, `scripts/**`, `tools/**`, `gas/**`）を 1 PR で混在させない。3e/3f/3g 昇格は運用ゾーン（docs）中心。挙動確認で `src/` を読むのは可、変更するなら別 PR。
docs/handoff/claude-design-integ-handoff.md:73:7. 実挙動の根拠として `src/index.template.html`（3e/3f/3g 該当箇所・phoneme `t` フラグの使用箇所）
docs/features/3b.md:38:`wordlist_GA_a1a2_plus_phonics.json`、`data/connected_speech.json`（`docs/data-contract.md` §2 wordlist スキーマ / §3 connected_speech スキーマ）。
docs/claude-design/PARITY-CATALOG.md:47:scripts/build-i18n-html.js で 6言語 HTML 生成 → python3 -m http.server 8799(repo root)
docs/claude-design/PARITY-CATALOG.md:89:`src/index.template.html` の `:root` に**2組のトークンが併存**し、多くが**別の値**:
docs/claude-design/sp.dc.html:71:    <p style="font-size:14.5px;line-height:1.85;color:#6E685C;margin:0;max-width:840px;text-wrap:pretty">Source of truth は <code>src/index.template.html</code>。この canvas は app の現状 UI を CD に写した参照層。SP 全画面（1a top × 6 言語 / 3a profile / 2a-2d ドリル 3-state × 4 目的 = 12 / 3b vocab / 3d progress / 3e-3f-3h modal（背面 dim + カード）/ terms / privacy）。</p>
docs/claude-design/pc.dc.html:74:    <p style="font-size:14.5px;line-height:1.85;color:#6E685C;margin:0;max-width:840px;text-wrap:pretty">Source of truth は <code>src/index.template.html</code>。この canvas は app の現状 UI を CD に写した参照層。PC 全画面: 1a top / 3a profile / 2a-2d ドリル 3-state（pending/correct/incorrect × 4 目的 = 12 フレーム）/ 3b vocab / 3d progress / 3e-3f モーダル（背面 dim 表現）/ terms / privacy。</p>
docs/claude-design/UPDATE-GUIDE.md:3:> **このガイドは 2026-07-28 に廃止されました。** UI 仕様の正本は `src/index.template.html`(実装) に一本化しています。
docs/claude-design/support.js:1:// GENERATED from dc-runtime/src/*.ts — do not edit. Rebuild with `cd dc-runtime && bun run build`.
docs/claude-design/support.js:8:  // src/react.ts
docs/claude-design/support.js:23:  // src/parse.ts
docs/claude-design/support.js:85:  // src/boot.ts
docs/claude-design/support.js:202:  // src/expr.ts
docs/claude-design/support.js:296:  // src/encode.ts
docs/claude-design/support.js:414:  // src/compile.ts
docs/claude-design/support.js:746:  // src/logic.ts
docs/claude-design/support.js:783:  // src/component.ts
docs/claude-design/support.js:1065:  // src/bundled.ts
docs/claude-design/support.js:1072:  // src/cdn.ts
docs/claude-design/support.js:1085:  // src/external.ts
docs/claude-design/support.js:1286:  // src/atomics.ts
docs/claude-design/support.js:1292:  // src/helmet.ts
docs/claude-design/support.js:1427:  // src/pseudo.ts
docs/claude-design/support.js:1448:  // src/registry.ts
docs/claude-design/support.js:1478:  // src/runtime.ts
docs/claude-design/support.js:1648:  // src/stream-state.ts
docs/claude-design/support.js:1674:  // src/index.ts
docs/claude-design/README.md:4:UI 仕様の正本は `src/index.template.html`(実装)。ここの `.dc.html` は「この画面にはどういう状態がある」を俯瞰する**凍結フレーム一覧**です。
docs/claude-design/README.md:8:1. **`src/index.template.html` が正、`.dc.html` は凍結フレームカタログ**（pixel-perfect 精度は追求しない。画面一覧としての価値のみ残す）
docs/claude-design/README.md:33:- **正本コード確認**: `src/index.template.html`（CSS + HTML + JS すべて含む）
docs/claude-design/README.md:58:- **UI 仕様の正本は `src/index.template.html`**。`.dc.html` は画面一覧用で、見た目の正確性は保証しない
docs/claude-design/update-log.md:8:| 2026-07-29 | sp.dc.html, pc.dc.html, design-system.dc.html | **運用切替**: CD SaaS 廃止 → app(`src/index.template.html`) を正本、`.dc.html` はスナップショット化。3 ファイルを Phase-3 round-1〜5 の現行 UI に一致するよう Claude Code が全面書き直し。SP は 17 フレーム(1a-ja/en/ko/zh-CN/zh-TW/fil + 3a/2a/2b/2c/2d/2a-answered/3b/3d/3e/3f/3h)、PC は 11 フレーム、design-system は tokens + Modal placement + Drill accent badge + A-Z card + 2-pane drill + IPA info modal を追加。旧 favicon showcase は削除(favicon.svg は同ディレクトリに残置) |
docs/claude-design/cd-updates/README.md:5:2026-07-28 に Claude Design(外部 SaaS) を UI 仕様の正本として使う運用は廃止しました。UI 仕様の正本は `src/index.template.html`(実装)、リファレンススナップショットは `docs/claude-design/{sp,pc,design-system}.dc.html` です。詳細は `docs/claude-design/README.md` を参照。
docs/claude-design/cd-updates/README.md:11:- UI 議論は本リポ内の `.dc.html` を見ながら行い、合意したら実装 (`src/index.template.html`) を書き換える
docs/agent-reports/codex-issue-124-i18n-parity-ci.md:16:- 既存 Track A 構造に合わせ、HTML 参照元を `src/index.template.html` に修正。
docs/agent-reports/codex-issue-124-i18n-parity-ci.md:40:- 実装中の自己判断による追加変更: あり。現行 `src/index.template.html` に fallback 付きで存在する `audio_tap_hint` は i18n key として未定義のため、既存挙動維持として参照欠落チェックの許容リストに入れた。
docs/agent-reports/codex-issue-124-i18n-parity-ci.md:58:- 既存 `tools/validate_i18n.py` は F2 後の構成とずれており、存在しない `index.html` を読みに行っていたため、`src/index.template.html` に修正した。
docs/agent-reports/cursor-issue-147-pc-cd-compliance.md:39:- src/index.template.html (M)
docs/agent-reports/codex-issue-161-pc-quality.md:27:- src/index.template.html (M)
docs/agent-reports/codex-issue-161-pc-quality.md:62:- `node scripts/build-i18n-html.js`: PASS（en / ja / ko / zh-Hans / zh-Hant / fil）
docs/agent-reports/claude-code-session-2026-07-29-cd-parity-phase3.md:17:3. **サービス資料の実装乖離**: feature spec 全13 ID + supporting specs（data-contract, CSS-CONVENTIONS, design input docs）を `src/index.template.html` と突合して修正。React 化デグレ確認用の `screen-inventory.md` を新規作成。
docs/agent-reports/cursor-issue-128-align-sp-claude-design.md:30:| B5 | `src/index.template.html` + i18n + LAUNCH-CHECKLIST | 準拠 |
docs/agent-reports/cursor-issue-128-align-sp-claude-design.md:47:- src/index.template.html (M)
docs/agent-reports/cursor-issue-128-align-sp-claude-design.md:72:- Issue ホワイトリストの `index.html`/`js/` は現行では `src/index.template.html`（インライン JS）が正
docs/agent-reports/codex-issue-141-progress-card-pool-count.md:23:- src/index.template.html (M)
docs/agent-reports/codex-issue-141-progress-card-pool-count.md:29:- Runtime code の変更は Issue 指定の `src/index.template.html` のみに限定し、必須実装レポートだけを追加した
docs/agent-reports/claude-code-issue-184-validator-align.md:12:`scripts/validate/validate-markdown-refs.py` が front-matter の `id` 必須（V1）を検査し続け、
docs/agent-reports/claude-code-issue-184-validator-align.md:22:- `scripts/lib/verify_core.py` V1 修正: front-matter なし → 正常スキップ。front-matter あり
docs/agent-reports/claude-code-issue-184-validator-align.md:25:- `scripts/lib/verify_core.py` に `_LEGACY_PREFIXES` 定数を追加し、V1/V4/V5 から除外:
docs/agent-reports/claude-code-issue-184-validator-align.md:28:- `scripts/lib/verify_core.py` V4 修正: `_LEGACY_PREFIXES` に該当するファイルをスキップ。
docs/agent-reports/claude-code-issue-184-validator-align.md:29:- `scripts/lib/verify_core.py` V5 修正: `_LEGACY_PREFIXES` に該当するファイルをスキップ。
docs/agent-reports/claude-code-issue-184-validator-align.md:33:- `data/README.md`: 退役参照 `docs/REPOSITORY-STRUCTURE.md` を `docs/repo-map.md` に更新。
docs/agent-reports/claude-code-issue-184-validator-align.md:34:- `data/batches/README.md`: 退役参照 `docs/REPOSITORY-STRUCTURE.md` を
docs/agent-reports/claude-code-issue-184-validator-align.md:40:- scripts/lib/verify_core.py (M)
docs/agent-reports/claude-code-issue-184-validator-align.md:42:- data/README.md (M)
docs/agent-reports/claude-code-issue-184-validator-align.md:43:- data/batches/README.md (M)
docs/agent-reports/claude-code-issue-184-validator-align.md:58:- `python3 scripts/validate/validate-markdown-refs.py --full-scan` → 全 8 チェック PASS、
docs/agent-reports/claude-code-issue-184-validator-align.md:60:- `grep -rn 'REPOSITORY-STRUCTURE' data/` → 0 件
docs/agent-reports/codex-issue-120-learning-status.md:33:- src/index.template.html (M)
docs/agent-reports/cursor-issue-150-pc-compliance-followup.md:34:- src/index.template.html (M)
docs/agent-reports/cursor-issue-149-phase-1-f.md:36:- src/index.template.html (M)
docs/agent-reports/claude-code-issue-173-design-layer-split.md:72:- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, `.github/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
docs/agent-reports/claude-code-issue-173-design-layer-split.md:208:- **原因**: `docs/features/README.md` の ID 索引テーブルと `_common.md` への導線で、角括弧テキスト直後に丸括弧で同名の `.md` パスを続ける Markdown ハイパーリンク構文を使用していた。`scripts/lib/verify_core.py` の V7 チェック（`check_v7`）は、この構文のリンクをパスの正しさに関わらず「unrewritten path ref」として一律 FAIL 扱いする（旧 Vault-Framework の wikilink 移行チェックの名残。単一バッククォートのインラインコードは除外対象外で、フェンス付きコードブロックのみが除外される）。`docs/_conventions.md` 規約1 は元々 wikilink を禁止し「リンクはプレーンな相対パス（`docs/features/2a.md` にセクション名を付与する形式）のみ」を求めており、本 Issue の他の新規ファイル（`product.md`・`_common.md`・各 `features/<id>.md` 本文）はすべてこの規約どおりバッククォート付きプレーンパス表記（例: `` `docs/data-contract.md` §2 ``）を使っていたが、`features/README.md` の索引テーブルのみ誤って角括弧+丸括弧のハイパーリンク構文を使っていた。
docs/agent-reports/claude-code-issue-173-design-layer-split.md:210:- **検証**: `python3 scripts/validate/validate-markdown-refs.py --full-scan --broken-refs migration/broken-refs.csv` を実行し、V7 の FAIL が 15 件 → 2 件（`docs/claude-design/README.md:26–27`、本 PR で一切変更していない既存ファイル。`git log -1 -- docs/claude-design/README.md` で本 PR 由来でないことを確認済み）に減少したことを確認。さらに実際の CI と同条件の PR モード（`--changed-files <このブランチの変更 .md 一覧> --broken-refs migration/broken-refs.csv`）でも `V7: PASS (total=0, failures=0)` を確認した。V1（frontmatter id 欠落、Issue A のフロントマター全廃止に起因する repo 全体の pre-existing FAIL）・V5（`docs/handoff/` 配下、本 PR の変更ファイルに含まれない full-repo チェック）は変更前と変わらず残存するが、いずれも本 PR 由来ではなく、pr-reviewer の指摘どおり別件として対応不要と判断した。
docs/agent-reports/cursor-issue-145-ops-improvements.md:33:- 変更は docs / governance のみ。Runtime data contract・`src/`・i18n・ビルドに未着手
docs/logs/2026/07/2026-07-13_track-a-launch-prep-uiux-pivot.md:106:   - Claude が MCP で `src/index.template.html` を取得して現状把握
docs/logs/2026/07/2026-07-13_track-a-launch-prep-uiux-pivot.md:217:3. `src/index.template.html` を取得して現状 UI/UX 把握
docs/claude-design/design-system.dc.html:32:    <p style="font-size:14.5px;line-height:1.85;color:#6E685C;margin:0;max-width:840px;text-wrap:pretty">SP・PC 両版が参照する単一の真実。トークン／タイポ／コンポーネント、設計判断の根拠を集約。<b>正本は <code>src/index.template.html</code></b>。CD はそこに追随する参照層です。</p>
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:59:- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:60:- ランタイム契約 8 パスの実体ファイル（`wordlist_GA_a1a2_plus_phonics.json` / `data/*.json` / `i18n/*.json` / `fonts/*` / `src/index.template.html`）は変更していない。ドキュメント上の契約記述の移設のみ。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:61:- 実装中の自己判断による追加変更: `docs/_conventions.md`（history.md 作成完了に伴う forward-reference 注記の除去）を一度編集したが、ホワイトリスト外・ついで作業と判断し `git checkout --` で復元・不採用。同様に `data/README.md` / `data/batches/README.md` の REPOSITORY-STRUCTURE.md 参照更新も、開発ゾーン（`data/**`）に該当するため実施後に復元・不採用（Issue の「全リポで grep 更新」要求と「開発ゾーンに触れない」制約が衝突したため、より明示的な制約であるゾーン規則を優先）。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:67:- 完了定義「`REPOSITORY-STRUCTURE.md` が削除され、参照が全て新ホームに更新（grep = 0、履歴記述除く）」: `docs/REPOSITORY-STRUCTURE.md` を削除。`grep -rln 'REPOSITORY-STRUCTURE' .`（`.git` 除く）の残存箇所は (a) 新規ファイル自身の「旧 `docs/REPOSITORY-STRUCTURE.md` を統合継承」という provenance 注記、(b) `docs/doc-map.md` の retire 完了記録、(c) `docs/SPECIFICATION.md` 変更履歴の historical entry、(d) `docs/agent-reports/` / `docs/cursor/reports/` / `docs/cursor/instructions/`（完了済み Phase の指示書）/ `docs/handoff/` / `docs/logs/` / `docs/vault-history/` / `docs/design/` / `docs/reference/`（一部、過去設計メモ）/ `audit/` / `migration/` 配下の historical archive、(e) `data/README.md` / `data/batches/README.md`（開発ゾーンのため今回は更新せず残置、下記申し送り参照）のみ。ライブなナビゲーション参照としての REPOSITORY-STRUCTURE.md 依存は解消。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:69:- 完了定義「`repo-map.md` の JS map 節に『F で置換予定』注記がある」: `docs/repo-map.md` §「src/index.template.html JS map」冒頭に "⚠️ 本節は Issue F の `docs/impact-ledger.json` が置換予定" を明記。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:72:- テスト観点「データフィールド追加タスクで data-contract.md + 該当 features のみで完結するか」: `docs/data-contract.md` に wordlist/connected_speech/weak_forms/guide の全フィールド定義・追加時の更新手順（`scripts/gen_ga_rp_same.py` 等）を集約済み。features/<id>.md は Issue E 作成予定のため、現時点では data-contract.md 単体で完結する設計とした。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:80:- `docs/_conventions.md`（history.md 作成予定注記）、`data/README.md`、`data/batches/README.md` は「全リポの REPOSITORY-STRUCTURE 参照更新」という完了定義と「開発ゾーンに触れない／ホワイトリスト厳守」という制約が直接衝突するケースだった。ゾーン制約をより明示的な指示として優先し、当該 3 ファイルは変更せず復元した。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:85:- Issue F（impact-ledger）は `docs/repo-map.md` の「src/index.template.html JS map」節を `docs/impact-ledger.json` への参照に置換する（本 Issue で置換予告の注記を追加済み）。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:86:- `data/README.md` / `data/batches/README.md` に残る `docs/REPOSITORY-STRUCTURE.md` への参照 2 件は、次に data/** を触る Issue（または docs-only だが例外的にゾーン許可された Issue）で `docs/repo-map.md` / `docs/pipeline.md` に更新する必要がある。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:90:- `data/README.md`（1 箇所）・`data/batches/README.md`（1 箇所）の `docs/REPOSITORY-STRUCTURE.md` 参照が未更新のまま残存（開発ゾーン制約により本 PR では対応せず）。実害は軽微（人間/AI 向けドキュメントの pointer が旧ファイル名を指すのみ、404 リンクではなく単なる古い記述）だが、次回 data/** touch 時に修正推奨。
docs/agent-reports/claude-code-issue-172-ref-axes-split.md:126:- [x] 既存ファイルパスへの依存関係が壊れていない（`REPOSITORY-STRUCTURE.md` への参照は全てのライブ参照を新ホームへ付け替え済み。data/** の 2 箇所を除く）
docs/reference/rp-tts-design-and-priority.md:77:| 1 | `gas/Code.gs` | `accent` パラメータ受信。`instructions` を ga/rp で分岐。Drive キーを `{word}__{accent}.mp3` に。既定 ga |
docs/reference/rp-tts-design-and-priority.md:78:| 2 | `gas/Code.gs` | 旧 `{word}.mp3` を ga として読む後方互換（or 一括リネーム） |
docs/reference/remaining-ops-checklist.md:5:> 正本の設計は `PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md`。詳細手順は各 Phase レポートと `gas/README.md`。
docs/reference/remaining-ops-checklist.md:16:| A1 | GAS エディタに最新 `gas/Code.gs` を反映し、**ウェブアプリを新しいバージョンとして再デプロイ** | `gas/README.md`、`cursor/reports/cursor-implementation-report-phase-t.md` §5 | `?urls=1` が Drive 公開 URL を返す |
docs/reference/remaining-ops-checklist.md:17:| A2 | エディタで **`migratePublicSharing()`**（既存 Drive MP3 を `ANYONE_WITH_LINK` 化）。GAS 6 分上限のため複数チャンク必要。**推奨:** `installMigratePublicTrigger(5)` を 1 回実行して放置（DONE で自動解除）。手動なら PAUSED のたびに再実行。やり直しは `resetMigratePublicSharing()` | 同上 / `gas/Code.gs` | ログが DONE |
docs/reference/remaining-ops-checklist.md:28:| B1 | リポジトリの `gas/BatchWords.gs`（**5,397 語**）を GAS プロジェクトへ貼り付け | `python3 scripts/export_batch_words.py` → `gas/README.md` | GAS 側リスト件数 = 5,397 |
docs/reference/remaining-ops-checklist.md:29:| B2 | GA BatchWarm の進捗確認。旧 3,059 時代のままなら `getBatchStatusGA` で確認し、必要ならトリガー継続（または `resetBatchGA` 後に再走） | `gas/BatchWarm.gs` / `gas/README.md` | `done: true` かつ全語 GA が Drive に存在 |
docs/reference/remaining-ops-checklist.md:55:| R4 pending **127** 語の TTS レビュー（narrow IPA） | `docs/reference/r4-pending-review-guide.md`、`data/pipeline/r4_pending_review_list.*` |
docs/reference/r4-pending-review-guide.md:4:- 対象: `data/pipeline/phase2a_review_needed.json` に記録された **127 語**
docs/reference/r4-pending-review-guide.md:67:   - `gas/BatchWarm.gs` で該当語の GA 音声を warm 化しておくと効率的
docs/reference/r4-pending-review-guide.md:72:**添付ファイル `data/pipeline/r4_pending_review_list.csv` を使う:**
docs/reference/r4-pending-review-guide.md:106:1. `data/pipeline/r4_confirmed_flap.json`（`y` 判定の narrow IPA リスト）
docs/reference/r4-pending-review-guide.md:107:2. `data/pipeline/r4_confirmed_no_flap.json`（`n` 判定リスト、確定済み記録）
docs/reference/r4-pending-review-guide.md:149:| `r4_pending_review_list.json` | `data/pipeline/` | 機械可読形式（Claude や Cursor で使用） |
docs/reference/r4-pending-review-guide.md:150:| `r4_pending_review_list.csv` | `data/pipeline/` | Naoya がレビュー時に列追記する作業ファイル |
docs/reference/r4-pending-review-guide.md:151:| `phase2a_review_needed.json` | `data/pipeline/` | 抽出元（127 語） |
docs/reference/r4-pending-review-guide.md:157:`data/pipeline/phase2b_respell_exceptions.json` に別途 10 語（`abruptly`, `agony`, `amongst` 等、すべて pilot 由来）が
docs/reference/i18n-language-scaling.md:47:│  data/guide.json           … en / ja / ko / zh-Hans / zh-Hant │
docs/reference/i18n-language-scaling.md:48:│  data/connected_speech.json… cs_rule.{en,ja} × 201 句        │
docs/reference/i18n-language-scaling.md:49:│  data/weak_forms.json      … cs_rule.{en,ja} × 36 語         │
docs/reference/i18n-language-scaling.md:58:| ガイド本文 | `data/guide.json` | en, ja, ko, zh-Hans, zh-Hant, fil | 対象外 |
docs/reference/i18n-language-scaling.md:92:| 10 | `data/guide.json` | `GUIDE_ORDER` 配下の全セクションを `<lang>`（または `zh-Hans` 等）で追加 | ○推奨（無いと英語ガイド） |
docs/reference/i18n-language-scaling.md:187:4. `data/guide.json` のトップレベルキー + `#guideLangPills`（ガイドは zh-Hans/zh-Hant 分割）
docs/logs/2026/07/2026-07-13_day4-5-docs-infra-and-seo-pivot.md:89:2. ビルド時プリレンダリング: `scripts/build-i18n-html.js` で各言語別静的 HTML を生成
docs/reference/phase2-m2-completion-summary.md:113:- `data/batches/phase2_pilot_180_with_gloss.json`（179 エントリ）
docs/reference/phase2-m2-completion-summary.md:114:- `data/batches/phase2_m2a_100_with_gloss.json`
docs/reference/phase2-m2-completion-summary.md:115:- `data/batches/phase2_m2b_100_with_gloss.json`
docs/reference/phase2-m2-completion-summary.md:116:- `data/batches/phase2_m2c_100_with_gloss.json`
docs/reference/phase2-m2-completion-summary.md:117:- `data/batches/phase2_m2d_90_with_gloss.json`
docs/reference/phase2-m2-completion-summary.md:121:- `data/derived/wordlist_with_neighbors.json` / `_slim.json`
docs/reference/phase2-m2-completion-summary.md:122:- `data/pipeline/phase2a_*.json`, `phase2b_*.json`, `ga_rp_same_report.json`, `r4_pending_review_list.*`
docs/reference/phase2-m2-completion-summary.md:124:- `gas/BatchWords.gs`, `gas/batch_words.csv`
docs/reference/phase2-m2-completion-summary.md:128:- `scripts/ga_to_rp.py`（onset/intervocalic r 保持バグ修正）
docs/reference/phase2-m2-completion-summary.md:132:- `data/patches/rp_ipa_bugfix_patch.json`（17 語）
docs/reference/phase2-m2-completion-summary.md:133:- `data/patches/dignify_dignity_rp_hotfix.json`（2 語、別コミット）
docs/reference/combined-instructions-phase1-pilot-and-misc.md:122:1. Google Apps Script のプロジェクトを開く（`gas/Code.gs` を編集したプロジェクト）
docs/claude-design/cd-updates/2026-07-28_cd-catchup-round3.md:15:**app 側（`src/index.template.html`）が正。** Claude Design は SP/PC/Design-System の Dc を app に一致させる方向で更新する。逆方向（CD → app）の反映は今回は不要。
docs/agent-reports/codex-issue-122-about-expansion.md:13:- Runtime source of truth: `src/index.template.html`.
docs/agent-reports/codex-issue-122-about-expansion.md:69:The repository validator cannot currently complete as written because it still targets the removed root `index.html`; this is the same pre-existing limitation recorded in the Issue #120 implementation report. Running its A/B/D/E logic equivalently against the source of truth `src/index.template.html` produced:
docs/reference/README.md:9:**置かないもの:** パイプライン中間 JSON → [`../../data/pipeline/`](../../data/pipeline/)（例: R4 作業リスト）
docs/reference/README.md:30:| `r4-pending-review-guide.md` | R4 TTS レビュー手順（データ: `data/pipeline/r4_pending_review_list.*`） |
docs/reference/README.md:38:| GA↔RP `ga_rp_same` | `../cursor/briefs/cursor-ga-rp-same-flag-consultation.md` | `scripts/gen_ga_rp_same.py` |
docs/reference/README.md:43:| RP TTS | `rp-tts-design-and-priority.md` | `gas/README.md` |
docs/reference/README.md:58:| `neighbors_report.md` | neighbors v2 quality stats | `python3 scripts/gen_neighbors.py` |
docs/reference/README.md:77:| RP rule fallback | `scripts/ga_to_rp.py` |
docs/reference/README.md:78:| Pipeline paths | `scripts/paths.py` |
docs/reference/README.md:79:| Connected speech | `data/connected_speech.json` |
docs/agent-reports/claude-code-issue-174-impact-ledger.md:13:- `src/index.template.html`（~5,411L、~290 関数）の call-graph を静的解析し、シンボル単位の scope/影響範囲を機械生成する `impact-ledger.json` + プロトコル `impact-ledger.md` + 生成器 `gen_impact_ledger.py` を新設し、D で `repo-map.md` に一時退避した JS 関数マップを置換する。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:14:- ゾーン跨ぎ（`scripts/` 開発ゾーン + `docs/**` 運用ゾーン）は Issue 本文で明示的に承認された docs-infra atomic 例外（生成器とその出力・docs が密結合で分割不能なため）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:18:- `scripts/gen_impact_ledger.py` を新規作成: `src/index.template.html` の main `<script>` ブロックを検出し、`function name(` / `async function name(` （任意インデント、ネスト関数含む）と `const name = (...) => ` 形式（括弧なし単一引数含む。`$` / `show` をカバー）で全シンボルを抽出。列0の関数宣言行を境界とする簡易スコープ判定で「どのトップレベル関数の中の行か」を行単位にマッピングし、各シンボルへの呼び出し箇所（テキスト一致 `name(`）の呼び出し元関数名を 13 エリア語彙（decode/encode/study/connected/profile/vocab/picker/progress/about/reveal/summary/top/infra）へ分類（`EXACT_AREA` 明示辞書 — 旧 `repo-map.md` JS map の分類を継承 — → `PREFIX_RULES` 前方一致フォールバック → `infra` デフォルト）。`caller_areas` の要素数で `scope`（library=5+/shared=2-4/primary=0-1）を判定し、`AREA_TO_FEATURE` で凍結 12 ID レジストリのみへ `feature_ids` を絞り込む（`infra`・未登録概念は feature_id を持たない）。`depends_on` は本体内で呼び出す他の台帳シンボルをベストエフォートで収集。`activeIpa` のみ `SEED_OVERRIDES` で Issue 本文の worked example をそのまま固定（直接呼び出しグラフだけでは TTS/accent 系の共有ヘルパー経由の間接波及を検出できないため）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:22:- `docs/repo-map.md`: 「src/index.template.html JS map」節（186 行、13 サブセクションの手動関数一覧）を削除し、`docs/impact-ledger.json`/`docs/impact-ledger.md` へのポインタ（5 行）に置換。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:30:- scripts/gen_impact_ledger.py (A)
docs/agent-reports/claude-code-issue-174-impact-ledger.md:53:- 変更範囲は Issue 本文が明示的に承認した「docs-infra atomic 例外」ホワイトリスト内のみ（`scripts/gen_impact_ledger.py`（開発ゾーン）+ `docs/impact-ledger.{json,md}` / `docs/guardrails.md` / `docs/repo-map.md` / 12 `docs/features/<id>.md` / `docs/doc-map.md`（運用ゾーン））。`git status --short` で確認済み、ホワイトリスト外の変更なし。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:54:- **`src/index.template.html` は一切変更していない**（読み取り専用の解析対象。`git status --short` に同ファイルが出現しないことを確認）。他の `src/**` / `i18n/**` / `data/**` / `tools/**` / `gas/**` にも触れていない。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:56:- 実装中の自己判断による追加変更: `scripts/gen_impact_ledger.py` の `ARROW_CONST_RE` を、括弧付き引数（`(id,on)=>`）だけでなく括弧なし単一引数（`id=>`）も検出するよう拡張した（Issue 本文の例示パターンには明記がなかったが、`$`（DOM 取得、501 呼び出し）を捕捉するために必要と判断。「全関数を含む」完了定義を満たすための最小限の拡張として実施、自己判断の透明性としてここに記録）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:61:- 完了定義「`scripts/gen_impact_ledger.py` が動作し `impact-ledger.json` を冪等生成」: 満たす。`python3 scripts/gen_impact_ledger.py` を 2 回連続実行し `diff` で出力バイト列が完全一致することを確認（`--check` フラグでも `up to date` を確認）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:77:- 既存機能への影響: なし（`src/index.template.html` 不変、ドキュメント・生成物のみ）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:79:- `python3 scripts/validate/validate-markdown-refs.py --changed-files <本 PR の変更 .md 一覧> --broken-refs migration/broken-refs.csv` を実行し、V7（markdown link 形式禁止）は全変更ファイルで PASS（`docs/impact-ledger.md` 含め backtick 相対パス表記のみ使用）を確認。V1（frontmatter id 欠落）は Issue A のフロントマター全廃止に起因する repo 全体の pre-existing 状態（新規ファイル `docs/impact-ledger.md` も同様に該当するが exit code は 0 のまま、既存全ファイルと同一の既知状態であり本 PR 由来ではない）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:85:- `docs/features/README.md` および `docs/features/_common.md` にも「Issue F の impact-ledger 生成後にリンク」に類する記述が残っている（それぞれ「ソースシンボルとの対応（impact-ledger）は Issue F 完了後に...」「共有シンボルは `docs/impact-ledger.json` を参照予定」）。いずれも本 Issue のホワイトリスト（12 `features/<id>.md` + `docs/guardrails.md`/`docs/repo-map.md`/`docs/doc-map.md`/`scripts/gen_impact_ledger.py`/`docs/impact-ledger.{json,md}`）に含まれないため、ホワイトリスト方式に従い**意図的に変更していない**。次の軽微な docs 整備 Issue でのフォローアップを推奨する（詳細は「後続への影響」参照）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:91:- `src/index.template.html` の関数を追加・改名・移動する実装エージェントは、当該 PR で `python3 scripts/gen_impact_ledger.py` を再実行し `docs/impact-ledger.json` の差分をコミットに含める義務がある（`docs/impact-ledger.md` §6）。
docs/agent-reports/claude-code-issue-174-impact-ledger.md:112:- [x] Runtime data contract 8 パスへの影響なし（`src/index.template.html` を含む実体ファイルは一切不変、解析のみ）
docs/agent-reports/codex-issue-142-production-favicon.md:16:- `src/index.template.html` のheadに `rel="icon"` / `type="image/svg+xml"` / `href="/favicon.svg"` を追加した
docs/agent-reports/codex-issue-142-production-favicon.md:24:- src/index.template.html (M)
CLAUDE.md:27:6. **UI 仕様の正本**: `src/index.template.html`（実装）が唯一の正本。`docs/claude-design/{sp,pc,design-system}.dc.html` は凍結フレームカタログ（画面一覧用、更新義務なし、pixel-perfect 精度は保証しない）。Claude Design（外部 SaaS）は今後**更新しない・参照しない・反映を待たない**。UI 改修の見た目確認は Vercel branch preview URL で行う。詳細は `docs/claude-design/README.md`。
CLAUDE.md:97:- wordlist / `rp_ipa` / `neighbors` / connected_speech / weak_forms を触ったら該当の再カウント・`scripts/gen_*.py` 再実行（コマンドは `docs/pipeline.md`）。
docs/logs/2026/07/2026-07-17-phase-1-cluster-1-2-briefs-claude-design.md:207:- ファイル成果物は `/mnt/user-data/outputs/` に配置 + `present_files` で提示
docs/reference/c1-expansion-scope-design.md:177:- 入力: data/batches/phase2_mN_{count}_with_gloss.json  (Claude 側で生成)
docs/reference/c1-expansion-scope-design.md:179:  python3 scripts/generate_flap_ipa.py
docs/reference/c1-expansion-scope-design.md:180:  python3 scripts/merge_flap_candidates.py
docs/reference/c1-expansion-scope-design.md:181:  python3 scripts/generate_respelling.py
docs/reference/c1-expansion-scope-design.md:182:  python3 scripts/merge_respelling.py
docs/reference/c1-expansion-scope-design.md:183:- RP IPA バッチ生成: python3 scripts/gen_rp_ipa.py (Claude API)
docs/reference/c1-expansion-scope-design.md:184:- Merge: python3 scripts/merge_rp_ipa.py
docs/reference/c1-expansion-scope-design.md:213:  W1-2: gas/BatchWords.gs 更新
docs/reference/c1-expansion-scope-design.md:261:これらは `data/batches/` に置いて Phase 2/3 の投入用語彙リストとして使う。
docs/reference/consultation-cefr-connected-weak.md:4:> 目的: `data/connected_speech.json`（連結音）と `data/weak_forms.json`（弱形）には現在 CEFR（A1–C1）が無く、出題カードで「A2」等を表示できない。各項目に CEFR を提案してほしい。
AGENTS.md:18:5. UI 改修では `src/index.template.html`(唯一の正本) を参照する。`docs/claude-design/{sp,pc}.dc.html` は凍結フレームカタログ（画面一覧用、更新義務なし）。見た目の確認は Vercel branch preview URL で行う。**外部 Claude Design(SaaS) の更新・反映・再開セッションは要求しない**(2026-07-28 廃止)。詳細 `docs/claude-design/README.md`
```

---

## 7. Grep F: `.github/` 内の path 参照

```
grep -rn "src/\|data/\|scripts/" .github/
```

ヒット 17 件（全件、省略なし）:

```
.github/workflows/validate-i18n.yml:8:      - 'src/index.template.html'
.github/workflows/validate-i18n.yml:15:      - 'src/index.template.html'
.github/workflows/validate-markdown-refs.yml:8:      - 'scripts/validate/**'
.github/workflows/validate-markdown-refs.yml:14:      - 'scripts/validate/**'
.github/workflows/validate-markdown-refs.yml:46:            python scripts/validate/validate-markdown-refs.py \
.github/workflows/validate-markdown-refs.yml:56:          python scripts/validate/validate-markdown-refs.py \
.github/ISSUE_TEMPLATE/bug.md:43:（例: `index.html` 内の該当セクション、`data/*.json` の該当エントリ）
.github/ISSUE_TEMPLATE/feature.md:23:  - `data/<file>.json`
.github/ISSUE_TEMPLATE/feature.md:24:  - `scripts/<file>.py`
.github/ISSUE_TEMPLATE/feature.md:62:- [ ] `data/{connected_speech,weak_forms,guide}.json`
.github/workflows/validate-cefr-tags.yml:8:      - 'data/connected_speech.json'
.github/workflows/validate-cefr-tags.yml:9:      - 'data/weak_forms.json'
.github/workflows/validate-cefr-tags.yml:10:      - 'scripts/validate-cefr-tags.py'
.github/workflows/validate-cefr-tags.yml:16:      - 'data/connected_speech.json'
.github/workflows/validate-cefr-tags.yml:17:      - 'data/weak_forms.json'
.github/workflows/validate-cefr-tags.yml:18:      - 'scripts/validate-cefr-tags.py'
.github/workflows/validate-cefr-tags.yml:34:        run: python3 scripts/validate-cefr-tags.py
```

**要点**: `.github/workflows/validate-i18n.yml` は `src/index.template.html` の変更を trigger path に持つ。`validate-markdown-refs.yml` は `scripts/validate/**`。`validate-cefr-tags.yml` は `data/connected_speech.json` / `data/weak_forms.json` / `scripts/validate-cefr-tags.py` を trigger path + 実行コマンドの両方に持つ。Issue/PR テンプレートも `data/*.json` / `scripts/<file>.py` の例示を含む。

---

## 8. Grep G: `docs/features/<id>.md` の「実装 path」欄

```
grep -n "実装\|対象ファイル\|path\|Path" docs/features/*.md
```

ヒット 3 件（全件、省略なし）:

```
docs/features/2a.md:35:近似正解の判定（旧 Levenshtein ≤ 1 near、`lev` / `spellCheck` の near 分岐）は設計・実装とも削除済み。自己評価ボタンは設けない。
docs/features/_common.md:123:1. 実装用 snapshot: `docs/design/phase-1/visual-tokens.md`
docs/features/screen-inventory.md:7:`src/index.template.html` 実装が正本。CSS: ~L90-1035、HTML: ~L1080-1650、JS: ~L1760-5876。
```

**設計上の発見（重要）**: 各 `docs/features/<id>.md` は「実装 path」を直接列挙する専用セクションを**持たない**。実装ソースとの対応は各 feature MD 末尾の「## 関連シンボル」節から `docs/impact-ledger.json` を `feature_ids` でフィルタする間接参照方式（`docs/features/README.md` の設計方針）。つまり feature 単位の実装 path は Grep G 単体では抽出できず、**Grep H（impact-ledger.json）と組み合わせて初めて解決する**。全 feature MD が単一ファイル `src/index.template.html` の異なる行範囲を指しており、monorepo 化で `src/` を移動する場合は この間接参照方式自体は壊れない（`impact-ledger.json` の `line` 値と `src/index.template.html` の新配置場所を整合させれば良い）。ただし `docs/features/screen-inventory.md`（L7）に記載の行番号レンジ（CSS: ~L90-1035、HTML: ~L1080-1650、JS: ~L1760-5876）は `src/index.template.html` のファイル移動そのものでは変わらないため影響なし。

---

## 9. Grep H: `docs/impact-ledger.json` の path 記述

`docs/impact-ledger.json` の各エントリは `symbol` / `line` / `feature_ids` / `scope` / `caller_areas` / `depends_on` のみを持ち、**ファイルパスの明示フィールドは存在しない**（`docs/impact-ledger.md` §2 により `line` は常に `src/index.template.html` 内の定義行番号と定義済み）。そのため実質的な「対象 path」は **全 293 エントリが単一ファイル `src/index.template.html` を指す** ことを意味する。以下は全 293 エントリを `src/index.template.html:{line}\t{symbol}\tscope={scope}` 形式で再構成したもの（file:line 単位の網羅、省略なし）:

```
293
src/index.template.html:1466	$	scope=library
src/index.template.html:2229	activeIpa	scope=shared
src/index.template.html:2237	activeNarrowIpa	scope=library
src/index.template.html:2320	activeNeighbors	scope=primary
src/index.template.html:2509	activeStrongIpa	scope=shared
src/index.template.html:2248	altAccentLabel	scope=primary
src/index.template.html:2272	altAccentSpeakerState	scope=primary
src/index.template.html:2257	altAccentValue	scope=primary
src/index.template.html:2233	altIpa	scope=primary
src/index.template.html:4134	altSpeakerIdsForCurrentCard	scope=primary
src/index.template.html:4588	appendSessionBatch	scope=primary
src/index.template.html:3197	applyDrillId	scope=primary
src/index.template.html:2525	applyI18n	scope=primary
src/index.template.html:1628	applyI18nProgress	scope=shared
src/index.template.html:1590	applyI18nVocab	scope=shared
src/index.template.html:3883	applyModeBStudyTwoPane	scope=shared
src/index.template.html:4680	applyOnboardingI18n	scope=primary
src/index.template.html:3520	applyPrevSettings	scope=shared
src/index.template.html:4514	audioHintText	scope=primary
src/index.template.html:3994	audioReadyKey	scope=primary
src/index.template.html:4990	autoNote	scope=primary
src/index.template.html:4817	bindIpaSegments	scope=shared
src/index.template.html:3374	bindPills	scope=primary
src/index.template.html:5360	bindRevealCheckClicks	scope=primary
src/index.template.html:1938	bindVirtScroll	scope=shared
src/index.template.html:4378	bodyWorkerBatch	scope=primary
src/index.template.html:4806	buildIpaHtml	scope=shared
src/index.template.html:4946	buildKeyboard	scope=primary
src/index.template.html:3798	buildMcqChoices	scope=primary
src/index.template.html:3817	buildModeBQueue	scope=primary
src/index.template.html:4568	buildSessionPool	scope=primary
src/index.template.html:4538	buildSessionQueue	scope=primary
src/index.template.html:1641	buildVocabLetterBar	scope=shared
src/index.template.html:4001	bytesFromB64	scope=primary
src/index.template.html:4826	capCarrierBefore	scope=primary
src/index.template.html:4529	clearAudioTapPrompt	scope=shared
src/index.template.html:4638	closeExitConfirm	scope=primary
src/index.template.html:2881	closeVocab	scope=primary
src/index.template.html:4673	completeOnboarding	scope=primary
src/index.template.html:1737	computeDrillProgress	scope=primary
src/index.template.html:2520	csRuleText	scope=shared
src/index.template.html:2514	csTypeLabel	scope=shared
src/index.template.html:3997	currentAccent	scope=primary
src/index.template.html:4126	currentCardWord	scope=primary
src/index.template.html:3547	currentCheckMode	scope=shared
src/index.template.html:2205	dataReady	scope=shared
src/index.template.html:4902	decodeCheck	scope=primary
src/index.template.html:1750	drillProgressCardHtml	scope=primary
src/index.template.html:4981	encodeCheck	scope=primary
src/index.template.html:3637	ensureEnabledSelection	scope=primary
src/index.template.html:4595	ensureQueueStock	scope=primary
src/index.template.html:1964	escAttr	scope=shared
src/index.template.html:1961	escHtml	scope=shared
src/index.template.html:1586	escapeHtml	scope=primary
src/index.template.html:4090	fetchAudioFromDriveUrl	scope=primary
src/index.template.html:4100	fetchAudioFromGas	scope=primary
src/index.template.html:4068	fetchAudioFromGasAccent	scope=primary
src/index.template.html:4251	fetchBodyToCache	scope=primary
src/index.template.html:4226	fetchBodyToCacheItem	scope=primary
src/index.template.html:4076	fetchUrlsFromGas	scope=primary
src/index.template.html:3669	filteredCsPool	scope=primary
src/index.template.html:3628	filteredPool	scope=primary
src/index.template.html:3608	filteredWordPoolWith	scope=primary
src/index.template.html:1997	findItemByKey	scope=primary
src/index.template.html:2251	formatSameAccentIpa	scope=shared
src/index.template.html:3581	frequencyWeight	scope=primary
src/index.template.html:4186	gasWarm	scope=primary
src/index.template.html:3551	getCheckCount	scope=shared
src/index.template.html:3460	getMark	scope=primary
src/index.template.html:3304	goToTop	scope=shared
src/index.template.html:4008	hasCachedAudioFor	scope=shared
src/index.template.html:4156	hasCachedAudioForItem	scope=primary
src/index.template.html:2242	hasNarrowDifference	scope=primary
src/index.template.html:3439	hasTrapPhoneme	scope=primary
src/index.template.html:3849	hideModeBCards	scope=shared
src/index.template.html:4734	hideOnboarding	scope=primary
src/index.template.html:3218	hidePracticePanels	scope=shared
src/index.template.html:1843	highlightIpaMatch	scope=primary
src/index.template.html:3592	histEntry	scope=primary
src/index.template.html:2503	homeCopy	scope=primary
src/index.template.html:3085	initApp	scope=primary
src/index.template.html:4604	initSessionQueue	scope=primary
src/index.template.html:2507	isConnectedItem	scope=shared
src/index.template.html:4566	isCurrentItem	scope=primary
src/index.template.html:3593	isDue	scope=shared
src/index.template.html:4667	isOnboardingCompleted	scope=primary
src/index.template.html:5051	isPcLayout	scope=shared
src/index.template.html:4632	isReflectAvailableScreen	scope=primary
src/index.template.html:3791	isValidDistractor	scope=primary
src/index.template.html:2508	isWeakItem	scope=shared
src/index.template.html:4150	itemAudioReadyKey	scope=primary
src/index.template.html:3317	itemCefrLabel	scope=shared
src/index.template.html:1955	jumpVocabLetter	scope=primary
src/index.template.html:4929	keyGroups	scope=primary
src/index.template.html:2211	langFromPath	scope=primary
src/index.template.html:4973	lcsMark	scope=shared
src/index.template.html:4647	leaveExclusiveRoute	scope=primary
src/index.template.html:3977	legacyLsKey	scope=primary
src/index.template.html:4032	loadAudioFromLS	scope=primary
src/index.template.html:4013	loadAudioFromLSAccent	scope=primary
src/index.template.html:3444	loadChecks	scope=shared
src/index.template.html:1551	loadConnected	scope=primary
src/index.template.html:3442	loadHist	scope=primary
src/index.template.html:2333	loadLocale	scope=primary
src/index.template.html:3452	loadMarks	scope=shared
src/index.template.html:3500	loadPrevSettings	scope=shared
src/index.template.html:3590	loadSym	scope=shared
src/index.template.html:3771	loadVocab	scope=shared
src/index.template.html:1559	loadWeak	scope=primary
src/index.template.html:1515	loadWordlist	scope=primary
src/index.template.html:2343	localizePattern	scope=primary
src/index.template.html:4866	lockInputScroll	scope=primary
src/index.template.html:3971	lsKey	scope=primary
src/index.template.html:3974	lsKeyAccent	scope=primary
src/index.template.html:3476	marksMigrated	scope=shared
src/index.template.html:3602	matchesWeakFocus	scope=primary
src/index.template.html:4740	maybeShowOnboarding	scope=primary
src/index.template.html:3983	memCacheKey	scope=primary
src/index.template.html:3991	memKeyAccent	scope=primary
src/index.template.html:3480	migrateChecksToMarksIfNeeded	scope=primary
src/index.template.html:3775	modeBBandPool	scope=primary
src/index.template.html:3934	modeBDictCheck	scope=primary
src/index.template.html:3782	modeBDisplayGloss	scope=primary
src/index.template.html:3774	modeBEligible	scope=primary
src/index.template.html:3780	modeBGloss	scope=shared
src/index.template.html:3908	modeBMcqPick	scope=primary
src/index.template.html:3776	modeBPool	scope=shared
src/index.template.html:3113	multiList	scope=primary
src/index.template.html:2785	navigate	scope=shared
src/index.template.html:5171	nextCard	scope=primary
src/index.template.html:4897	norm	scope=primary
src/index.template.html:1532	normalizeConnected	scope=primary
src/index.template.html:1567	normalizeWeak	scope=primary
src/index.template.html:1496	normalizeWord	scope=primary
src/index.template.html:3122	nucleusIndex	scope=primary
src/index.template.html:5236	onModalEscapeKey	scope=primary
src/index.template.html:2791	onRouteChange	scope=primary
src/index.template.html:5332	onVocabListClick	scope=primary
src/index.template.html:4746	onboardingNextStep	scope=primary
src/index.template.html:4653	openDrillProfile	scope=primary
src/index.template.html:4642	openExitConfirm	scope=shared
src/index.template.html:2880	openVocab	scope=primary
src/index.template.html:2269	otherAccent	scope=shared
src/index.template.html:1886	paintVirtWindow	scope=shared
src/index.template.html:2780	parseHash	scope=primary
src/index.template.html:3954	parseSpeakOpts	scope=primary
src/index.template.html:2215	persistAppLang	scope=primary
src/index.template.html:3123	phonemesOf	scope=primary
src/index.template.html:4822	pickCarrier	scope=primary
src/index.template.html:3297	playCrumbLearningLabel	scope=primary
src/index.template.html:3292	playCrumbPracticeLabel	scope=primary
src/index.template.html:2357	posLabel	scope=shared
src/index.template.html:4304	prefetchAccentBodies	scope=primary
src/index.template.html:4288	prefetchIdleBodies	scope=primary
src/index.template.html:4337	prefetchItemsAudio	scope=primary
src/index.template.html:4437	prefetchSessionAudio	scope=primary
src/index.template.html:1976	progressChecksHtml	scope=primary
src/index.template.html:1698	progressDefaultCefrLevels	scope=primary
src/index.template.html:1729	progressPoolForDrill	scope=primary
src/index.template.html:4567	queueStock	scope=primary
src/index.template.html:1856	rebuildVirtSlots	scope=shared
src/index.template.html:3748	recordHist	scope=primary
src/index.template.html:3839	recordModeBQuiz	scope=primary
src/index.template.html:3835	recordModeBStudy	scope=primary
src/index.template.html:3756	recordSymEncode	scope=primary
src/index.template.html:4180	refreshAllSpeakers	scope=shared
src/index.template.html:2304	refreshAltAccentSpeakers	scope=primary
src/index.template.html:4204	refreshAltSpeakerFor	scope=primary
src/index.template.html:2003	refreshChecksInDom	scope=primary
src/index.template.html:3856	refreshModeBStudyContent	scope=shared
src/index.template.html:2013	refreshRevealChecksPanel	scope=shared
src/index.template.html:5037	refreshRevealIpa	scope=shared
src/index.template.html:4212	refreshSpeakerFor	scope=primary
src/index.template.html:4165	refreshSpeakerForItem	scope=primary
src/index.template.html:2285	renderAltAccentLine	scope=shared
src/index.template.html:4958	renderBuild	scope=shared
src/index.template.html:4846	renderCard	scope=primary
src/index.template.html:4830	renderConnectedPrompt	scope=primary
src/index.template.html:4877	renderDecode	scope=primary
src/index.template.html:4964	renderEncode	scope=primary
src/index.template.html:4788	renderInfo	scope=primary
src/index.template.html:4801	renderIpaInto	scope=shared
src/index.template.html:3923	renderModeBDict	scope=primary
src/index.template.html:3897	renderModeBMcq	scope=primary
src/index.template.html:3930	renderModeBQuizSpell	scope=primary
src/index.template.html:3860	renderModeBStudy	scope=primary
src/index.template.html:4702	renderOnboardingSlide	scope=primary
src/index.template.html:1760	renderProgressPage	scope=primary
src/index.template.html:5211	renderSummary	scope=shared
src/index.template.html:2976	renderSymbolPalette	scope=primary
src/index.template.html:3046	renderSymbolPicker	scope=shared
src/index.template.html:2999	renderSymbolQueryChips	scope=primary
src/index.template.html:3024	renderSymbolResults	scope=primary
src/index.template.html:2075	renderVocabIpaFilterBar	scope=shared
src/index.template.html:2109	renderVocabPhrases	scope=primary
src/index.template.html:2181	renderVocabTab	scope=shared
src/index.template.html:2088	renderVocabWords	scope=shared
src/index.template.html:5017	renderWordPronDetails	scope=shared
src/index.template.html:4730	reopenOnboarding	scope=primary
src/index.template.html:3494	resolveDrillId	scope=primary
src/index.template.html:5109	reveal	scope=shared
src/index.template.html:4060	saveAudioToLS	scope=primary
src/index.template.html:4052	saveAudioToLSAccent	scope=primary
src/index.template.html:3448	saveChecks	scope=primary
src/index.template.html:3443	saveHist	scope=primary
src/index.template.html:3456	saveMarks	scope=primary
src/index.template.html:3504	savePrevSettings	scope=shared
src/index.template.html:3591	saveSym	scope=primary
src/index.template.html:3772	saveVocab	scope=primary
src/index.template.html:4296	scheduleIdle	scope=primary
src/index.template.html:3702	schedulePoolPreread	scope=primary
src/index.template.html:5103	scrollToAboutWhyIpa	scope=primary
src/index.template.html:4601	sessionFinished	scope=primary
src/index.template.html:4565	sessionItemKey	scope=shared
src/index.template.html:2716	setAccent	scope=primary
src/index.template.html:3323	setCardCefr	scope=shared
src/index.template.html:3560	setCheckCount	scope=primary
src/index.template.html:3414	setConnectedFilterAdvanced	scope=shared
src/index.template.html:1690	setExclusivePage	scope=library
src/index.template.html:2663	setLang	scope=primary
src/index.template.html:3467	setMark	scope=primary
src/index.template.html:4142	setPlayiconState	scope=primary
src/index.template.html:3274	setSetupVisible	scope=shared
src/index.template.html:3631	setSinglePill	scope=primary
src/index.template.html:4441	setSpeakerBusy	scope=primary
src/index.template.html:3408	setWordsFilterAdvanced	scope=shared
src/index.template.html:4635	shouldConfirmSessionExit	scope=shared
src/index.template.html:1467	show	scope=library
src/index.template.html:4518	showAudioTapPrompt	scope=primary
src/index.template.html:4720	showOnboarding	scope=primary
src/index.template.html:3254	showProfile3a	scope=primary
src/index.template.html:1775	showProgressPage	scope=primary
src/index.template.html:3230	showPurposeHome	scope=shared
src/index.template.html:4630	showReflection	scope=primary
src/index.template.html:2797	showSetupOrPractice	scope=primary
src/index.template.html:2863	showSymbolPickerView	scope=primary
src/index.template.html:2834	showVocabView	scope=primary
src/index.template.html:4537	shuffle	scope=shared
src/index.template.html:4457	speak	scope=shared
src/index.template.html:4119	speakOptsForItem	scope=shared
src/index.template.html:4130	speakerIdsForCurrentCard	scope=primary
src/index.template.html:4898	spellCheck	scope=shared
src/index.template.html:4613	startSession	scope=primary
src/index.template.html:3125	stressSyllable	scope=primary
src/index.template.html:4972	stripStress	scope=shared
src/index.template.html:3124	syllableCount	scope=primary
src/index.template.html:2967	symbolCellsHtml	scope=primary
src/index.template.html:2887	symbolChartGroups	scope=primary
src/index.template.html:2943	symbolGroupHeadingHtml	scope=primary
src/index.template.html:2955	symbolHeightLabelHtml	scope=primary
src/index.template.html:3077	symbolQueryClearAll	scope=primary
src/index.template.html:3056	symbolQueryPush	scope=primary
src/index.template.html:3067	symbolQueryRemoveAt	scope=primary
src/index.template.html:5057	syncPcSupportChrome	scope=shared
src/index.template.html:2709	syncProfileAccentUI	scope=shared
src/index.template.html:1706	syncProgressCefrPills	scope=shared
src/index.template.html:1661	syncVocabCefrPills	scope=primary
src/index.template.html:2326	t	scope=library
src/index.template.html:3575	toggleCheckSlot	scope=shared
src/index.template.html:2752	toggleLangMenu	scope=primary
src/index.template.html:1716	toggleProgressCefr	scope=primary
src/index.template.html:1674	toggleVocabCefr	scope=primary
src/index.template.html:3116	tokenize	scope=shared
src/index.template.html:3598	topWeakSymbols	scope=primary
src/index.template.html:5014	trickyPhonemes	scope=primary
src/index.template.html:5013	tryLine	scope=primary
src/index.template.html:3958	ttsAccent	scope=primary
src/index.template.html:3965	ttsCacheSlug	scope=primary
src/index.template.html:4499	unlockAudioFromGesture	scope=primary
src/index.template.html:4871	unlockInputScroll	scope=shared
src/index.template.html:2737	updateLangSwitcherCurrent	scope=primary
src/index.template.html:3300	updatePlayCrumb	scope=shared
src/index.template.html:3676	updatePool	scope=shared
src/index.template.html:3355	updateProgressMeter	scope=shared
src/index.template.html:3420	updateSetupFields	scope=shared
src/index.template.html:5075	updateTaskHeader	scope=shared
src/index.template.html:2175	updateVocabTabActive	scope=primary
src/index.template.html:3647	updateWordFilterAvailability	scope=primary
src/index.template.html:2313	vocabAltSpeakerHtml	scope=primary
src/index.template.html:1968	vocabDisplayGloss	scope=primary
src/index.template.html:3773	vocabEntry	scope=primary
src/index.template.html:2043	vocabIpaKeyboardSymbols	scope=primary
src/index.template.html:2068	vocabIpaQueryClear	scope=primary
src/index.template.html:2055	vocabIpaQueryPush	scope=primary
src/index.template.html:2062	vocabIpaQueryRemoveAt	scope=primary
src/index.template.html:1652	vocabRowHeight	scope=primary
src/index.template.html:1789	vocabSkeletonHtml	scope=shared
src/index.template.html:1799	vocabWordRowHtml	scope=primary
src/index.template.html:3114	vowelSet	scope=primary
src/index.template.html:3584	weightedShuffle	scope=primary
src/index.template.html:2349	wordGloss	scope=shared
src/index.template.html:3016	wordIpaForSearch	scope=shared
src/index.template.html:4322	wordWorker	scope=primary
```

**再現コマンド**:
```bash
python3 -c "
import json
d = json.load(open('docs/impact-ledger.json'))
print(len(d))
for e in d:
    print(f\"src/index.template.html:{e['line']}\\t{e['symbol']}\\tscope={e['scope']}\")
"
```

**設計上の含意**: monorepo 化で `src/index.template.html` を `apps/web/src/index.template.html` 等へ移動する場合、`impact-ledger.json` の `line` 値は移動そのものでは変わらない（純粋な `git mv` であれば行番号は不変）。ただし `scripts/gen_impact_ledger.py` 内に `src/index.template.html` のハードコードされた読み込みパスがある可能性が高く（§4 Grep C 参照）、生成器側のパス更新が必須（詳細は §12）。

---

## 10. Grep I: `docs/doc-map.md` の home 索引

```
grep -rn "src/\|data/\|scripts/\|gas/\|\.json\|\.py\|\.js\|\.html" docs/doc-map.md
```

上記キーワード grep は 4 件のみヒット（`data/README.md` の 1 行、および見出し中の `.md` 拡張子を含む行の誤爆）。`doc-map.md` は「概念→ホームファイル」の索引であり、ホームファイルの大半が `docs/*.md` 自体（拡張子 `.md`）であるため、`src/`・`data/`・`scripts/` を直接参照する行は少ない。**monorepo 化の影響範囲を正確に把握するため、`docs/doc-map.md` の全文（74 行）をここに引用する**（file:line 網羅の趣旨に沿い、索引ファイル全体が「現ホーム path の一覧」そのものであるため）:

```markdown
# doc-map.md — 概念 → ホーム レジストリ（single-source 索引）

「どの概念がどのファイルに属すか」の唯一の索引。1 事実 1 ホーム（`docs/_conventions.md` 規約 2）を強制する。
AI-first 再編（EPIC #169）は完了済み。全ホームが `status=exists` で確立されている。

status 凡例: `exists` = 現存。

**衝突時の優先順位（正本）**: `docs/product.md`（WHY）→ `docs/features/<id>.md`（WHAT）→ `docs/data-contract.md`（データスキーマ）。
旧「PURPOSE → DESIGN → SPEC → REPO」の優先順位ルールは Issue E（#173）で本ルールに置換された（旧 3 文書は削除済み）。

---

## 1. 移設レジストリ（Issue B の CLAUDE.md router 化で移動した詳細ブロック）

Issue B は既存ファイルを削除しない。CLAUDE.md からは router に必要な最小記述のみ残し、移動対象の詳細本文は
各ホーム作成 Issue（C/D/E）が現行 CLAUDE.md（git 履歴）と下表を参照して移設する。B 完了時点で詳細は router から消えるが、
移設先が下表に記録され追跡可能であること（＝完了定義）。

| 旧 CLAUDE.md ブロック | 移設先ホーム | status |
|---|---|---|
| ポジショニング / タグライン | `docs/product.md` | exists |
| 開発体制 / 開発フロー 4-step / Issue タイプ・分割 / Issue 起票ルール（署名・ラベル・参照明示）/ Branch 戦略詳細 / AI 履歴置き場 / Bug 対応ループ / Claude への指示（返答末尾テンプレ等）/ Cursor への指示 / Issue 背景セクションの書き方 / ルール変更セルフチェック手順 | `docs/workflow.md` | exists |
| 品質基準 1（仕様書品質）/ 2（Cursor 指示書品質） | `docs/guardrails.md` | exists |
| 改修分類ブロック仕様（Level×Pattern） | `docs/change-classification.md` | exists |
| 技術スタック / ファイル構成ツリー | `docs/repo-map.md` | exists |
| 品質基準 3（データ整合性）/ 4（ランタイム契約 8 パス）/ 5（多言語 UI） | `docs/data-contract.md` | exists |

> ※ Issue C 完了により `workflow.md` / `guardrails.md` / `change-classification.md` が正本化。Issue D 完了により `data-contract.md` / `tts-design.md` / `pipeline.md` / `repo-map.md` / `history.md` が正本化。Issue E 完了により `product.md` / `docs/features/<id>.md` が正本化（旧 `PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` は退役・削除）。Issue F 完了により `impact-ledger.json` / `impact-ledger.md` が正本化し、`repo-map.md` の一時退避 JS map 節を置換（EPIC #169 完了）。`CLAUDE.md` router 側は「Issue 起票要点 / レビュー・merge / ランタイム契約 8 パス（要点のみ）」の要点＋ポインタのみを残す（詳細は各ホーム参照）。

---

## 2. 概念 → ホーム レジストリ

| 概念 | ホームファイル | status | 更新トリガー |
|---|---|---|---|
| 記法規約 / feature ID レジストリ | `docs/_conventions.md` | exists | 規約・ID 体系変更時 |
| 概念→ホーム索引（本ファイル） | `docs/doc-map.md` | exists | 新規ドキュメント追加・ホーム移設時 |
| 絶対ルール / executor / halt / タスク→docs 表 | `CLAUDE.md` | exists | 絶対ルール・起動フロー変更時 |
| プロダクト目的 / ポジショニング / タグライン / personas | `docs/product.md` | exists | 方針・目的変更時 |
| 各 feature の挙動・画面・採点則+定数・データ・i18n キー | `docs/features/<id>.md` | exists | 該当 feature 変更時 |
| feature ID 索引 | `docs/features/README.md` | exists | ID 追加時 |
| ID 横断の共通シェル・セッションフロー・適応出題 | `docs/features/_common.md` | exists | 共通挙動変更時 |
| 全画面の DOM セレクタ・要素名・表示条件・状態パターン横断一覧（React 化デグレ確認用） | `docs/features/screen-inventory.md` | exists | 画面構造変更時 |
| ソースシンボル → feature_ids → scope → caller_areas | `docs/impact-ledger.json` | exists | ソース共通シンボル変更時（`scripts/gen_impact_ledger.py` 再実行） |
| impact-ledger 運用プロトコル / impact-analysis halt ルール正本 | `docs/impact-ledger.md` | exists | 横展開ルール変更時 |
| ランタイム 8 パス + JSON スキーマ + フィールド辞書 | `docs/data-contract.md` | exists | パス増減・スキーマ変更時 |
| 採点ロジック定数 | `docs/features/2a.md`(+2b/2c/2d) | exists | 定数変更時 |
| 多言語 UI i18n キー網羅 / leaf 数 | `docs/data-contract.md`(+ 該当 features) | exists | i18n キー増減時 |
| TTS プロンプト設計 | `docs/tts-design.md` | exists | TTS 改修時 |
| Python パイプラインコマンド | `docs/pipeline.md` | exists | パイプライン変更時 |
| ディレクトリツリー + インフラ | `docs/repo-map.md` | exists | ディレクトリ・インフラ変更時 |
| executor 対応フロー / Issue 起票ルール / レビュー・auto-merge / 返答末尾テンプレ | `docs/workflow.md` | exists | 運用フロー変更時 |
| Level×Pattern 分類体系 | `docs/change-classification.md` | exists | 分類体系変更時 |
| md5 検証(L3)/ 自己判断禁止 / doc-sync / impact-analysis halt / 仕様・指示書品質基準 | `docs/guardrails.md` | exists | ガードレール変更時 |
| UI 仕様の参照ポリシー | `docs/guardrails.md` §9 + `docs/claude-design/README.md` + `src/index.template.html`(正本) | exists | UI 改修運用変更時 |
| 日付ログ（Phase 完了等の dated 記録） | `docs/history.md` | exists | 各 Phase 完了時 |
| ローンチ Phase 進捗 | `docs/LAUNCH-CHECKLIST.md` | exists | Phase 進捗・Issue 起票/完了時 |
| 運用手順（Vercel/GAS/DNS/Analytics） | `docs/OPERATIONS.md` | exists | 運用手順変更時 |
| バグ根本原因記録 | `docs/bug-knowledge.md` | exists | Bug PR マージ時 |
| data/ 配下の役割分担 | `data/README.md` | exists | data/ 役割変更時 |
| エージェント定義（issue-handler / pr-reviewer / consistency-auditor） | `.claude/agents/*.md` | exists | エージェント仕様変更時 |
| CSS 変数命名・`--legacy-*` 運用・Track A CSS 技術制約（開発ゾーン） | `docs/CSS-CONVENTIONS.md` | exists | CSS 規約変更時 |
| CSS トークン実装値（色・spacing・radius・shadow・font-family）snapshot | `docs/design/phase-1/visual-tokens.md`（実装用 snapshot、`docs/design/phase-1/design-tokens.md` が抽出元記録） | exists | トークン値変更時 |
| デザイン原則・ペルソナ・voice/tone・感覚設計・アンチパターン（evergreen 設計入力） | `docs/design/{product-principles,user-personas,voice-and-tone,sensory-design,anti-patterns}.md` | exists | 設計方針変更時 |

---

## 3. 旧ドキュメントの retire 完了記録（EPIC #169 全 Issue 実行済み）

以下は C/D/E で fold/delete された。retire の度に旧ファイル名への参照を全リポ grep し、新ホームへの参照のみ残した（EPIC 共通完了条件）。

- **Issue C は retire 完了**: `docs/dev-common.md` / `docs/claude-collaboration.md` / `docs/agent-instruction-guide.md` / `docs/DEV-GUARDRAILS.md` / `docs/DOC-SYNC-PLAYBOOK.md` / `docs/DOCUMENT-MAP.md` / `docs/CHANGE-CLASSIFICATION.md`（→ `docs/change-classification.md` に統合継承）を削除。`AGENTS.md` / `.cursor/rules/dev-flow.mdc` は薄い参照スタブに縮小（削除ではない、Codex/Cursor 自動読込のため存置）
- **Issue D は retire 完了**: `docs/REPOSITORY-STRUCTURE.md` を削除。内容は `docs/data-contract.md`（ランタイム契約・i18n schema）/ `docs/tts-design.md`（GAS/audio・R4 pending）/ `docs/pipeline.md`（Common pipeline commands・Phase 2 workflow）/ `docs/repo-map.md`（Quick orientation・Directory tree・Runtime infrastructure・JS map）/ `docs/history.md`（Wordlist/UI behaviour snapshot）へ分割移設。`docs/PURPOSE.md` の Phase 1/2/R 完了ログ・変更履歴も `docs/history.md` へ移設（ファイル自体は D では削除しない）。
- **Issue E は retire 完了**: `docs/PURPOSE.md` / `docs/DESIGN.md` / `docs/SPECIFICATION.md` を削除。evergreen 内容は `docs/product.md`（WHY）/ `docs/features/<id>.md`（WHAT・12 ID）/ `docs/features/_common.md`（ID 横断共通挙動）へ ID 単位で再構成。DESIGN §3 TTS・§4 データ整備タスク・SPEC §5 データスキーマは D で移設済みのため再移設せず features からリンク参照。残る日付ログ（DESIGN §2c–2g・§5 実装状況、SPEC 変更履歴）は `docs/history.md` §4–5 へ移設。
```

§2「概念 → ホーム レジストリ」テーブルは 36 行。ホームファイルは全て `docs/**` 配下または `CLAUDE.md` / `.claude/agents/*.md` であり、`src/` / `data/` / `scripts/` の実体ファイルへの直接参照は行 55（UI 仕様の参照ポリシー: `src/index.template.html`(正本)）の 1 件のみ。

---

## 11. Grep J: エージェント設定内の path

```
grep -rn "src/\|data/\|scripts/" .claude/ .cursor/
```

ヒット 7 件（全件、省略なし。`.cursor/rules/dev-flow.mdc` は 0 件でヒットなし）:

```
.claude/settings.json:27:      "Bash(python3 scripts/:*)",
.claude/agents/issue-handler.md:49:  - wordlist / `rp_ipa` / `neighbors` / connected_speech / weak_forms を触ったら該当の再カウント・`scripts/gen_*.py` 再実行
.claude/skills/ux-review/SKILL.md:8:見た目の良し悪しではなく、**その画面が実データ・実コードで成立するか / 雑多でないか**を検証する。正本は `src/index.template.html`。見た目確認は Vercel branch preview URL またはローカルビルドで行う。
.claude/agents/consistency-auditor.md:66:   → source（`src/index.template.html`）→ `impact-ledger.json`（それぞれ現存するもの）。
.claude/skills/ux-brief/SKILL.md:25:- UI 仕様の正本は `src/index.template.html`。見た目の確認は Vercel branch preview URL で行う。
.claude/agents/pr-reviewer.md:84:  開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）を
.claude/agents/pr-reviewer.md:94:  wordlist 再カウント一致、`scripts/gen_*.py` 再実行の diff がゼロ。（12観点 #4, #5）
```

---
## 12. 新構造 path マッピング案

前提: EPIC #209 は `packages/core` + `apps/web` + `apps/mobile` の monorepo 化を決定済み（実装は本 Issue の非対象範囲）。以下は §2–§11 の grep 結果から機械的に導出した「現 path → 新 path」の初期案。**すべて Naoya 最終判断待ちの「案」であり、本 Issue はこの表を確定させるものではない**。

| 現 path | 新 path（案） | 移設方法 | 根拠（grep 節） |
|---|---|---|---|
| `src/index.template.html` | `apps/web/src/index.template.html` | `git mv` | §2 Grep A（193 件が `src/index.template.html` を正本として参照） |
| `wordlist_GA_a1a2_plus_phonics.json`（ルート直下） | `packages/core/data/wordlist_GA_a1a2_plus_phonics.json` | `git mv` + core loader 経由の fetch に変更、Web からは `apps/web/public/` へ symlink or copy-on-build | §3 Grep B（ランタイム 8 パス契約の一つ、`docs/data-contract.md` §1） |
| `data/connected_speech.json` / `data/weak_forms.json` / `data/guide.json` | `packages/core/data/*.json` | `git mv` + core loader 経由 | §3 Grep B、`docs/data-contract.md` §1 ランタイム 8 パス |
| `data/batches/` / `data/pipeline/` / `data/derived/` / `data/patches/` / `data/archive/` | `packages/core/data/` 配下に統合、または `tools/data/` に退避（非ランタイム） | 要判断（§13 参照） | §3 Grep B（`data/README.md` の役割分担） |
| `scripts/*.py`（パイプライン生成スクリプト） | `tools/*.py`（据え置き、パスのみ `packages/core/data/` を指すよう `scripts/paths.py` の `ROOT`/`DATA` 定義を更新） | 移動なし（提案） | §4 Grep C、`scripts/paths.py` が `ROOT = Path(__file__).resolve().parents[1]` で解決するため、ディレクトリ名を変えず据え置く方が影響最小 |
| `scripts/build-i18n-html.js` | `apps/web/scripts/build-i18n-html.js` | `git mv` + `TEMPLATE` / `outDir` の相対パス更新（`ROOT = path.resolve(__dirname, "..")` は移動後 `apps/web` を指すため `i18n/` 参照も要移動） | §5 Grep D、`vercel.json` `buildCommand` と `package.json` `scripts.build` の同時更新必須 |
| `scripts/gen_impact_ledger.py` | `tools/gen_impact_ledger.py`（据え置き） + `SRC = ROOT / "src" / "index.template.html"` を `apps/web/src/index.template.html` に更新 | 移動なし、内部パス定数のみ更新 | §9 Grep H、`scripts/paths.py` 経由でない直接 `ROOT / "src" / ...` ハードコード（要修正箇所） |
| `tools/validate_i18n.py` | 据え置き + `HTML = os.path.join(ROOT, "src", "index.template.html")` を更新 | 移動なし、内部パス定数のみ更新 | §7 Grep F（`.github/workflows/validate-i18n.yml` の trigger path も同時更新） |
| `scripts/validate-cefr-tags.py` | 据え置き（`data/` 参照パスのみ `packages/core/data/` に更新） | 移動なし | §7 Grep F |
| `middleware.ts` | `apps/web/middleware.ts` | `git mv`（Vercel の Edge Middleware は `apps/web` を project root にした場合はそのディレクトリ直下に必要） | §5 Grep D |
| `vercel.json` | `apps/web/vercel.json`（Vercel プロジェクトの Root Directory を `apps/web` に設定する場合） | `git mv` + `buildCommand` を `apps/web` からの相対 or pnpm workspace スクリプトに変更 | §5 Grep D（要判断、§13 参照） |
| `package.json`（ルート） | ルートに pnpm workspace 用 `package.json` を残し、`apps/web/package.json` に build スクリプトを追加 | 新規作成 + 既存の書き換え | §5 Grep D |
| `i18n/*.json` / `i18n/phonemes/*.json` | `apps/web/i18n/` または `packages/core/i18n/`（web/mobile 共有なら core 側） | 要判断（§13 参照） | §5 Grep D（`build-i18n-html.js` が `i18n/{lang}.json` を読む） |
| `fonts/DoulosSIL-Regular.woff2` | `apps/web/public/fonts/`（ランタイム fetch 対象のため web 側に必須。mobile は別途フォント同梱） | `git mv` | `docs/data-contract.md` §1 ランタイム 8 パス |
| `gas/Code.gs` 等 | 据え置き（`tools/gas/` へ移す案もあるが Web/Mobile 双方から TTS バッチ生成に使うため `packages/core` 近傍が妥当、要判断） | 要判断（§13 参照） | EPIC #209 「TTS 事前バッチ生成 + assets 同梱」方針 |
| `.github/workflows/*.yml` | 据え置き（trigger path のみ `apps/web/src/index.template.html` 等に更新） | 移動なし、内部 path 文字列のみ更新 | §7 Grep F |
| `docs/**`（`repo-map.md` / `features/*.md` / `data-contract.md` 等） | 据え置き（内容の path 記述のみ更新） | 移動なし | §6 Grep E、§10 Grep I（内容更新は #EPIC-04 スコープ） |
| `.claude/**` / `.cursor/**` | 据え置き（内容の path 記述のみ更新） | 移動なし | §11 Grep J（内容更新は #EPIC-10 スコープ） |
| `docs/impact-ledger.json` | 据え置き（`line` は `apps/web/src/index.template.html` への `git mv` であれば不変。生成器のパス更新後に再実行して差分ゼロを確認） | 移動なし、生成器のみ更新 | §9 Grep H |

---

## 13. 未解決の設計判断（Naoya 判断待ち）

以下は Naoya の意思決定が必要な項目。**最低 3 件の抽出義務（完了定義）を満たすため 6 件を抽出する**:

1. **`gas/` の配置**: `packages/core` 直下（Web/Mobile 双方の TTS バッチ生成から参照するため core 近傍が自然）か、`tools/gas/`（現行 `tools/` 配下のスクリプト群と同列に扱う）か、据え置き（ルート直下）か。EPIC #209 の「TTS 事前バッチ生成 + assets 同梱」方針では mobile ビルド時にも `gas/Code.gs` の出力形式を参照する可能性があり、core 直下案が優勢だが、GAS デプロイ運用（`docs/OPERATIONS.md`）とのリンク方式（clasp 等）が未整理。

2. **`wordlist_GA_a1a2_plus_phonics.json` 等ランタイム JSON の実配置**: `packages/core/data/` に置いて Web はビルド時に `apps/web/public/` へコピー（現在の「ルート直下 fetch」という固定 URL 契約 `docs/data-contract.md` §1 と非互換になる可能性）か、`apps/web/public/data/` に直接置いて `packages/core` は型定義とローダー関数のみ持つ（データ本体は複製しない）か。後者は「データは 1 箇所」という DRY 原則に反するが、mobile 側はオフライン同梱のため別途 assets へバンドルする必要があり、単純な symlink では App Store/Play Store ビルドに含められない。**この判断は #EPIC-02（Web 移設）と #EPIC-03（core 抽出）の両方の設計に直結するため、着手順序も含めて要確認。**

3. **`i18n/*.json` の配置**: `apps/web/i18n/`（現状維持、Web のみ）か `packages/core/i18n/`（Web/Mobile 共有）か。`docs/data-contract.md` のランタイム 8 パスに「UI i18n」が含まれ、`build-i18n-html.js` が `i18n/{lang}.json` を読んで HTML に埋め込む現行方式は Web 固有。Mobile が同じ翻訳キーを再利用するなら core 側が妥当だが、Mobile の i18n ライブラリ（`expo-localization` 等）の選定が #EPIC-06 以降のため、本 Issue 時点では確定できない。

4. **Vercel プロジェクトの Root Directory 設定**: monorepo 化後、Vercel の Root Directory を `apps/web` に変更するか、ルート据え置きで `vercel.json` の `buildCommand` 内で `cd apps/web &&` する運用にするか。前者は Vercel 標準の monorepo 対応（`ignoreCommand` 等）を活用できるが、`docs/OPERATIONS.md` の既存運用手順（DNS/Analytics/preview noindex 等）の記載更新範囲が変わる。

5. **`neighbors_data.json` 等の副次 JSON・`data/derived/` 系ファイルを core に含めるか**: `data/derived/wordlist_with_neighbors.json` 等はランタイム 8 パス契約外（パイプライン中間生成物）。`packages/core` に「ランタイム契約データのみ」を持たせ、パイプライン中間生成物は `tools/data/` 相当に隔離する案と、`packages/core/data/pipeline/` として一元管理する案のどちらを採るか。データ整合性チェック（`docs/data-contract.md` §6）の実行場所（`packages/core` 内 or リポジトリルート）にも影響する。

6. **`scripts/` と `tools/` の境界再定義**: 現行は `scripts/`（パイプライン生成 + build-i18n-html.js + gen_impact_ledger.py 等、53ファイル）と `tools/`（`validate_i18n.py` / `merge_*.py` 等 6 ファイル）が並存し、命名の使い分け基準が本 Issue の grep からは明確に読み取れなかった（`docs/pipeline.md` 等での使い分け説明の要確認）。monorepo 化で `apps/web/scripts/`（build 専用）と `tools/`（データパイプライン全般、`packages/core` 横断）に整理し直すか、現状の 2 分割を維持するかは #EPIC-02〜#EPIC-03 着手前に確定が必要。

---

## 14. 次アクション

- Claude が本 Recon を読み、以下を起票する:
  - **#EPIC-02**: pnpm workspaces + `apps/web/` 移設 + Vercel 設定更新（§12 の `middleware.ts` / `vercel.json` / `package.json` / `scripts/build-i18n-html.js` 行を反映したホワイトリストで起票）
  - **#EPIC-03**: `packages/core` 抽出（§13-2/3/5 の Naoya 判断結果を前提にホワイトリスト確定）
  - **#EPIC-04**: docs パス更新（§6 Grep E・§10 Grep I の全ヒットを踏まえた更新対象ファイル一覧を Issue 本文に列挙）
  - **#EPIC-10**: ドキュメント/Bug ガイドライン更新（親 EPIC #209 本文の「#EPIC-10 の必要性」節を参照）
- 上記 sub-Issue 起票前に、Naoya は §13 の最低 6 件の判断を確定させる必要がある。

---

## 付録: `docs/features/README.md` ID 索引（§8 の背景情報として全文引用）

`docs/features/<id>.md` は全 12 feature ID + `_common.md` / `screen-inventory.md` の 14 ファイル構成で、いずれも `src/index.template.html` を単一の実装正本として参照する（§8 参照）。monorepo 化で `src/` を移動する場合、`docs/features/**` 自体の移動は不要（#EPIC-04 スコープで内容の path 記述のみ更新）。
