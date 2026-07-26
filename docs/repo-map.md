# repo-map.md — ディレクトリ + インフラの単一ホーム

技術スタック・ディレクトリツリー・ランタイムインフラ・Track A/B スコープ・JS 関数マップの唯一のホーム。
旧 `docs/REPOSITORY-STRUCTURE.md` を継承（ランタイム契約 → `docs/data-contract.md`、パイプライン → `docs/pipeline.md`、
日付付きスナップショット → `docs/history.md` へ分離済み）。

---

## 技術スタック（Track A）

- **フロントエンド**: `src/index.template.html` + ビルドスクリプト（`scripts/build-i18n-html.js`）で 6 言語版 HTML を生成 + 純粋 JS + JSON データ
- **ホスティング**: Vercel（静的サイト、カスタムドメイン）
- **TTS**: Google Apps Script（`gas/Code.gs`、Track A 期間中は現行維持）
- **データ生成パイプライン**: Python（`scripts/*.py`、ローカル実行。コマンドは `docs/pipeline.md`）
- **ドメイン**: `ipasounddrill.app`
- **計測**: Vercel Web Analytics（クッキーレス）

---

## Quick orientation

| Layer | Role |
|-------|------|
| **Runtime (Vercel + custom domain)** | `src/index.template.html` → build → `/{lang}/index.html` + JSON/i18n/fonts loaded by the browser |
| **Production wordlist** | `wordlist_GA_a1a2_plus_phonics.json` at repo root（現況は `docs/history.md`） |
| **Pipeline** | `scripts/*.py` read/write `data/pipeline/` staging JSON, merge into wordlist（コマンドは `docs/pipeline.md`） |
| **Batch imports** | `data/batches/` — Phase 1/2 merge sources（`data/batches/README.md`） |
| **GAS TTS** | `gas/` — Google Apps Script proxy; not loaded by static site（設計は `docs/tts-design.md`） |
| **Task history** | `docs/agent-reports/`（2026-07-20 以降の実装レポート）+ `docs/cursor/`（historical archive）（規約: `AGENTS.md`、索引: `docs/cursor/README.md`） |
| **Canonical specs** | `docs/product.md`（WHY）, `docs/features/<id>.md`（WHAT、索引: `docs/features/README.md`）（読み分けは `docs/README.md`） |

### 正本ファイル（SPA）

| 種別 | パス | 備考 |
|------|------|------|
| SPA テンプレート（正本） | `src/index.template.html` | Cursor が編集する唯一の HTML ソース |
| 生成物 | `/{lang}/index.html`（`en` … `fil`） | `npm run build` / Vercel Build。`.gitignore` |
| ルート `index.html` | **無し** | middleware が `/` を言語別 URL へ振り分け |

**Data folder map:** `data/README.md` — runtime / batches / pipeline / derived / patches / archive の見分け方。

---

## Directory tree

```
ipasounddrill/
├── AGENTS.md                    # ★ 全 AI エージェント共通運用規約（governance 正本）
├── CLAUDE.md                    # Tier 0 Router（常時ロード）
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md # PR 本文テンプレ（GitHub 自動挿入）
│   ├── ISSUE_TEMPLATE/          # feature / bug / docs / agent-task 等
│   └── workflows/               # CI / approval / label automation
├── src/
│   └── index.template.html    # ★ SPA テンプレート（Decode/Encode, Mode B, Connected Speech, vocab browser, progress checks）
├── en/ … fil/                 # （生成物、Vercel Build で生成、`.gitignore` で除外）
├── middleware.ts               # `/` の Accept-Language / Cookie / Bot 振り分け
├── package.json                # `npm run build` → `scripts/build-i18n-html.js`
├── vercel.json                 # Build Command / rewrites
├── favicon.svg                 # Production favicon（CD 正典のコピー、`/favicon.svg` でルート配信）
├── README.md                   # 人間向け概要（デモ URL・ローカル起動）
├── wordlist_GA_a1a2_plus_phonics.json   # ★ PRODUCTION wordlist（runtime fetch・ルート固定）
├── wordlist_GA_a1a2_plus_phonics.csv    # CSV export（pipeline / i18n tooling）
│
├── data/
│   ├── README.md              # ★ data/ 配下の役割分担（AI 向け）
│   ├── connected_speech.json  # ★ RUNTIME
│   ├── weak_forms.json        # ★ RUNTIME
│   ├── guide.json             # ★ RUNTIME
│   ├── batches/               # マージ入力（ブラウザ非読込）→ README.md 参照
│   ├── pipeline/               # IPA / respelling ステージング → README.md 参照
│   ├── derived/                # neighbors, RP IPA 進捗（マージ中間・非 runtime）
│   ├── patches/                # 過去の一括パッチ
│   └── archive/                # ローカル退避（gitignore）→ README.md 参照
│
├── docs/
│   ├── README.md                # ★ docs/ 索引（AI 向け・最初の案内）
│   ├── product.md               # Goals, positioning, tagline, personas（source of truth・WHY）
│   ├── features/                # 各 feature の挙動・画面・採点則+定数・データ・i18n（ID 単位・WHAT）
│   │   ├── README.md            # feature ID インデックス
│   │   ├── _common.md           # ID 横断の共通シェル・セッションフロー・適応出題
│   │   └── <id>.md              # 1a / 2a-2d / 3a-3d / 3h / reveal / summary（12 ID）
│   ├── data-contract.md         # ランタイム契約・JSON スキーマ・データ整合性
│   ├── tts-design.md            # TTS プロンプト設計
│   ├── pipeline.md              # Python パイプラインコマンド
│   ├── repo-map.md              # 本ファイル（ディレクトリ + インフラ）
│   ├── history.md               # 日付付きログ集約
│   ├── cursor/                  # AI タスク履歴 → README.md 参照
│   │   ├── instructions/        # cursor-instructions-*.md
│   │   ├── reports/             # historical archive（2026-07-20 以前）
│   │   ├── briefs/              # 設計相談ブリーフ
│   │   └── recon/               # Pre-Issue Recon（DOM/関数/i18n 等の機械抽出）
│   ├── agent-reports/           # AI エージェント実装レポート統合
│   │   ├── README.md            # 命名規則・配置ルール
│   │   └── TEMPLATE.md          # 実装レポートテンプレート
│   ├── workflow.md               # 開発運用フロー正本（Issue 起票・実装・レビュー・auto-merge）
│   ├── guardrails.md             # 堅固化パターン・レビュー段階化・自己判断禁止・doc-sync
│   ├── change-classification.md  # Complexity Level × Change Pattern 判定
│   ├── doc-map.md                # 概念 → ホーム レジストリ
│   ├── _conventions.md           # 記法規約・feature ID レジストリ
│   ├── design/                  # Phase 1+ デザイン入力（タグライン候補等）
│   ├── claude-design/           # UI/UX 正典（Claude Design 成果物）→ README.md 参照
│   ├── reference/               # 監査・意思決定・運用ガイド → README.md 参照
│   ├── testing/                 # Manual test checklists
│   └── archive/                 # 旧ドキュメント退避
│
├── scripts/                   # Python pipeline + `build-i18n-html.js`（paths.py が Python パス正本）→ `docs/pipeline.md`
├── tools/                     # merge_def, validate_i18n, gen_audit_docs, …
├── gas/                       # Code.gs, BatchWarm.gs, BatchWords.gs, README
├── i18n/                      # UI strings + phonemes/（6 languages）
├── fonts/                     # Doulos SIL（IPA）
└── tests/                     # tts-ab-listener.html（TTS experiment）
```

---

## Runtime infrastructure

| Layer | Service | Detail |
|---|---|---|
| Hosting | Vercel | Project: `ipa-sound-drill`, Dashboard: `https://vercel.com/nkhippo/ipa-sound-drill` |
| Custom domain | Namecheap (BasicDNS) | `ipasounddrill.app`, AUTO-RENEW ON, next: 2027-07-11 |
| DNS | Namecheap Advanced DNS | A `@` → `216.198.79.1`, CNAME `www` → `52646c530fa600df.vercel-dns-017.com.` |
| TLS | Vercel + Let's Encrypt | 90-day auto-renewal, `.app` = HSTS preload (forced HTTPS) |
| TTS proxy | Google Apps Script | `gas/Code.gs` deployment, `GAS_TTS_URL` in `src/index.template.html` |
| Build system | Node.js | `scripts/build-i18n-html.js`（6 言語 HTML 生成） |
| Middleware | Vercel Routing Middleware | `middleware.ts`（Accept-Language 判定、C1 fallback 時は不使用） |
| Vercel Build Command | `node scripts/build-i18n-html.js` | `vercel.json` / Dashboard Build & Development Settings |
| i18n parity CI | GitHub Actions `validate-i18n` | `python3 tools/validate_i18n.py` で UI key parity / residual CJK kana / placeholders / JSON format / `_html` validity を検証 |
| MCP server | Cloudflare Workers | Worker: `githubapp-mcp`（unified）, Endpoint: `https://githubapp-mcp.nkhippo.workers.dev/sse`, Connector: `GitHubApp MCP`（shared PAT で全個人アプリ到達、本リポは対象リポの一つ）。旧: Railway `nkhippo/ipasounddrill-mcp`（`https://ipasounddrill-production.up.railway.app/mcp`, Connector `IPASoundDrill GitHub`）は Phase F まで存置=deprecated |
| GitHub Automation | GitHub Actions | Workflows: `trigger-cursor-on-ready.yml`, `approval.yml`, `label-pr-needs-review.yml` |
| Cursor Automation | Cursor Cloud | Webhook: active, Cloud Agent: 見送り中（`resource_exhausted`） |
| Secrets | GitHub repo | `CURSOR_AUTOMATION_WEBHOOK_URL`, `CURSOR_AUTOMATION_WEBHOOK_TOKEN` |
| Branch Protection | GitHub Rulesets | `main`: PR 必須 + force push 禁止 |
| Analytics | Vercel Web Analytics | Dashboard > Analytics タブ（有効化済み） |
| Feedback | Tally form | URL: TBD |

---

## Track A / B スコープ

**Track A（ローンチ〜）**: `src/index.template.html` + 言語別静的 HTML 生成 + GAS TTS
- 対象: `src/index.template.html`（inline CSS/JS）、`scripts/build-i18n-html.js` で 6 言語版 HTML 生成、Vercel カスタムドメイン運用
- 実装可能: SEO、meta、i18n meta、hreflang、Analytics 統合、Tally、法務、favicon、OGP、UI polish、英語 LP、静的 HTML プリレンダ用 Node ビルド
- 実装不可: React 化、TypeScript アプリ化、状態管理ライブラリ、BE 移管

**Track B（ローンチ後）**: React 化、BYOK、BE 移管、Sentry、Playwright 等
- 主要スコープ:
  - React + Vite 化（既存単一 HTML → コンポーネント分割）
  - BE の Railway 化（GAS TTS からの脱却）
  - BYOK（ユーザー自身の API キー入力）
  - Sentry 導入
  - Playwright + Visual Regression Test
  - develop-first ブランチ運用への切替
  - Storybook 導入
  - 本ファイル（`docs/repo-map.md`）の動的セクション自動生成（Issue K2。旧 `docs/REPOSITORY-STRUCTURE.md` 時代からのバックログ項目、Issue #172 でファイル retire に伴い参照先を更新）

Track A 期間中に Track B スコープの提案が出たら、`track-b` ラベルで別 Issue 化する。

---

## src/index.template.html 関数マップ

`src/index.template.html`（単一ファイル構成。言語別生成物は `/{lang}/index.html`）内の主要関数一覧・行番号・
feature_id 対応・scope（library/shared/primary）・呼び出し元エリアは `docs/impact-ledger.json` を参照
（`scripts/gen_impact_ledger.py` による静的解析生成物。symbol 昇順の JSON 配列）。

スキーマ定義・scope 閾値・再生成手順・impact-analysis halt ルールは `docs/impact-ledger.md` が正本。

---

## What not to confuse

| Item | Location |
|------|----------|
| Production wordlist | **Root** `wordlist_GA_a1a2_plus_phonics.json` |
| Neighbors slim（merge 元） | `data/derived/wordlist_with_neighbors_slim.json` |
| Phase 2 staging | `data/pipeline/`（not root, not runtime） |
| R4 作業 CSV/JSON | `data/pipeline/r4_pending_review_list.*`（**not** `docs/reference/`） |
| Cursor task docs | `docs/cursor/**`（古いレポートは pre-reorg パスを引用する場合あり） |
| Spec truth | `docs/product.md` > `docs/features/<id>.md` > `docs/data-contract.md` |

---

## Local dev

```bash
npm run build
python3 -m http.server 8080
# http://localhost:8080/en/  （言語サブディレクトリ。file:// は JSON fetch 不可）
```

Vercel は main への push で自動デプロイ（Build Command: `node scripts/build-i18n-html.js`）。詳細は `docs/OPERATIONS.md` § 1「Vercel デプロイ」を参照。

---

_旧 `docs/REPOSITORY-STRUCTURE.md`、旧 `CLAUDE.md`「技術スタック」「ファイル構成」を統合継承（Issue #172）。ランタイム契約 → `docs/data-contract.md`、パイプライン → `docs/pipeline.md`、日付付きスナップショット → `docs/history.md` へ分離。ディレクトリツリーの `docs/PURPOSE.md` / `docs/DESIGN.md` / `docs/SPECIFICATION.md` 行は Issue #173（Issue E）で `docs/product.md` / `docs/features/` に置換。_
