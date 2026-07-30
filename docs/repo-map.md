# repo-map.md — ディレクトリ + インフラの単一ホーム

技術スタック・ディレクトリツリー・ランタイムインフラ・将来計画・JS 関数マップの唯一のホーム。
旧 `docs/REPOSITORY-STRUCTURE.md` を継承（ランタイム契約 → `docs/data-contract.md`、パイプライン → `docs/pipeline.md`、
日付付きスナップショット → `docs/history.md` へ分離済み）。

---

## 技術スタック

- **monorepo**: pnpm workspace（`pnpm-workspace.yaml`: `packages/*`, `apps/*`）
- **フロントエンド**: `apps/web/src/index.template.html` + ビルドスクリプト（`apps/web/scripts/build-i18n-html.js`）で 6 言語版 HTML を生成 + 純粋 JS + JSON データ
- **共有データ / ローダー**: `packages/core`（`@ipasounddrill/core`）— ランタイム JSON（`packages/core/data/`）、i18n（`packages/core/i18n/`）、フォント（`packages/core/fonts/`）、TS ローダー/採点ロジック（`packages/core/src/`、#EPIC-03）
- **ホスティング**: Vercel（静的サイト、カスタムドメイン、Root Directory `apps/web`）
- **TTS**: Google Apps Script（`tools/tts/gas/Code.gs`、現行維持）
- **データ生成パイプライン**: Python（`tools/data-pipeline/*.py`、ローカル実行。コマンドは `docs/pipeline.md`）
- **ドメイン**: `ipasounddrill.app`
- **計測**: Vercel Web Analytics（クッキーレス）

---

## Quick orientation

| Layer | Role |
|-------|------|
| **Runtime (Vercel + custom domain)** | `apps/web/src/index.template.html` → build → `/{lang}/index.html` + JSON/i18n/fonts（`packages/core/` からビルド時に `apps/web/public/` へコピー）loaded by the browser |
| **Production wordlist** | `packages/core/data/wordlist.json`（公開 URL `/data/wordlist.json`、`/wordlist_GA_a1a2_plus_phonics.json` は rewrite 互換。現況は `docs/history.md`） |
| **Pipeline** | `tools/data-pipeline/*.py` read/write `tools/data-pipeline/pipeline/` staging JSON, merge into wordlist（コマンドは `docs/pipeline.md`） |
| **Batch imports** | `tools/data-pipeline/batches/` — Phase 1/2 merge sources（`tools/data-pipeline/batches/README.md`） |
| **GAS TTS** | `tools/tts/gas/` — Google Apps Script proxy; not loaded by static site（設計は `docs/tts-design.md`） |
| **Task history** | `docs/agent-reports/`（2026-07-20 以降の実装レポート）+ `docs/cursor/`（historical archive）（規約: `AGENTS.md`、索引: `docs/cursor/README.md`） |
| **Canonical specs** | `docs/product.md`（WHY）, `docs/features/<id>.md`（WHAT、索引: `docs/features/README.md`）（読み分けは `docs/README.md`） |

### 正本ファイル（SPA）

| 種別 | パス | 備考 |
|------|------|------|
| SPA テンプレート（正本） | `apps/web/src/index.template.html` | Cursor が編集する唯一の HTML ソース |
| 生成物 | `/{lang}/index.html`（`en` … `fil`） | `pnpm --filter @ipasounddrill/web build` / Vercel Build。`.gitignore` |
| ルート `index.html` | **無し** | middleware が `/` を言語別 URL へ振り分け |

**Data folder map:** `packages/core/data/README.md` — ランタイム契約データ（wordlist / connected_speech / weak_forms / guide）の役割分担。パイプライン中間生成物（batches / pipeline / derived / patches / archive）は `tools/data-pipeline/README.md` を参照。

---

## Directory tree

```
ipasounddrill/
├── AGENTS.md                    # ★ 全 AI エージェント共通運用規約（governance 正本）
├── CLAUDE.md                    # Tier 0 Router（常時ロード）
├── package.json                # ルート pnpm workspace 定義（`workspaces: packages/*, apps/*`）
├── pnpm-workspace.yaml          # pnpm workspace 設定
├── pnpm-lock.yaml               # pnpm lockfile
├── README.md                   # 人間向け概要（デモ URL・ローカル起動）
├── .github/
│   ├── PULL_REQUEST_TEMPLATE.md # PR 本文テンプレ（GitHub 自動挿入）
│   ├── ISSUE_TEMPLATE/          # feature / bug / docs / agent-task 等
│   └── workflows/               # CI / approval / label automation
│
├── apps/
│   └── web/                     # `@ipasounddrill/web`（Vercel Root Directory）
│       ├── src/
│       │   └── index.template.html   # ★ SPA テンプレート（Decode/Encode, Mode B, Connected Speech, vocab browser, progress checks）
│       ├── scripts/
│       │   ├── build-i18n-html.js    # 6 言語版 HTML 生成（`packages/core/i18n/` を読む）
│       │   └── copy-core-assets.js   # `packages/core/{data,i18n,fonts}` → `apps/web/public/` コピー
│       ├── public/                   # favicon.svg, robots.txt, sitemap.xml, privacy.html, terms.html, llms.txt（+ build 時コピーの data/i18n/fonts、`.gitignore`）
│       ├── middleware.ts             # `/` の Accept-Language / Cookie / Bot 振り分け
│       ├── vercel.json               # Build Command / rewrites（`wordlist_GA_a1a2_plus_phonics.json` 互換 rewrite 含む）
│       ├── package.json              # `pnpm --filter @ipasounddrill/web build`
│       ├── .gitignore                # `public/{data,i18n,fonts}/` のみ ignore
│       └── wordlist_GA_a1a2_plus_phonics.csv  # CSV export（pipeline / i18n tooling）
│
├── packages/
│   └── core/                    # `@ipasounddrill/core`（Web/Mobile 共有データ・ローダー・採点ロジック）
│       ├── data/
│       │   ├── README.md        # ★ ランタイム契約データの役割分担（AI 向け）
│       │   ├── wordlist.json    # ★ PRODUCTION wordlist（公開 URL `/data/wordlist.json`）
│       │   ├── connected_speech.json  # ★ RUNTIME
│       │   ├── weak_forms.json  # ★ RUNTIME
│       │   └── guide.json       # ★ RUNTIME
│       ├── i18n/                # UI strings + phonemes/（6 languages）
│       ├── fonts/                # Doulos SIL（IPA）
│       ├── src/                  # TS 型定義・ローダー・採点ロジック（#EPIC-03）
│       ├── package.json
│       └── tsconfig.json
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
│   ├── impact-ledger.md          # impact-ledger 運用プロトコル・impact-analysis halt ルール正本
│   ├── impact-ledger.json        # `tools/impact-ledger/gen_impact_ledger.py` 生成物（symbol 昇順 JSON 配列）
│   ├── _conventions.md           # 記法規約・feature ID レジストリ
│   ├── design/                  # Phase 1+ デザイン入力（タグライン候補、CSS トークン snapshot 等）
│   ├── claude-design/           # 凍結フレームカタログ(sp/pc/design-system.dc.html)。画面一覧用、更新義務なし。正本は `apps/web/src/index.template.html`。詳細 README.md
│   ├── reference/               # 監査・意思決定・運用ガイド → README.md 参照
│   ├── testing/                 # Manual test checklists
│   └── archive/                 # 旧ドキュメント退避
│
├── tools/                        # データパイプライン・検証・TTS・impact-ledger（旧 `scripts/` を目的別に再編）
│   ├── data-pipeline/             # Python pipeline（`paths.py` が Python パス正本）→ `docs/pipeline.md`
│   │   ├── batches/ pipeline/ derived/ patches/ archive/  # マージ入力・ステージング・派生・パッチ・退避
│   │   ├── lib/                   # `validate-markdown-refs.py` が import する共通ロジック
│   │   └── migration/             # 旧 Vault-Framework 由来の一回限り markdown 移行スクリプト
│   ├── validate/                  # `validate_i18n.py`, `validate-cefr-tags.py`, `validate-markdown-refs.py`
│   ├── impact-ledger/             # `gen_impact_ledger.py`
│   ├── tts/                       # `gas/Code.gs`, `gas/BatchWarm.gs`, `gas/BatchWords.gs`, README（clasp 手順）
│   └── archive/                   # 旧 `tools/` 直下スクリプトの退避
│
├── migration/                     # #EPIC-02 移設の scan/verify ログ（historical）
├── templates/                     # GitHub workflow テンプレート
└── tests/                         # tts-ab-listener.html（TTS experiment）
```

---

## Runtime infrastructure

| Layer | Service | Detail |
|---|---|---|
| Hosting | Vercel | Project: `ipa-sound-drill`, Dashboard: `https://vercel.com/nkhippo/ipa-sound-drill` |
| Custom domain | Namecheap (BasicDNS) | `ipasounddrill.app`, AUTO-RENEW ON, next: 2027-07-11 |
| DNS | Namecheap Advanced DNS | A `@` → `216.198.79.1`, CNAME `www` → `52646c530fa600df.vercel-dns-017.com.` |
| TLS | Vercel + Let's Encrypt | 90-day auto-renewal, `.app` = HSTS preload (forced HTTPS) |
| TTS proxy | Google Apps Script | `tools/tts/gas/Code.gs` deployment, `GAS_TTS_URL` in `apps/web/src/index.template.html` |
| Build system | Node.js（pnpm workspace） | `apps/web/scripts/build-i18n-html.js`（6 言語 HTML 生成、`apps/web/scripts/copy-core-assets.js` が先行実行） |
| Middleware | Vercel Routing Middleware | `apps/web/middleware.ts`（Accept-Language 判定、C1 fallback 時は不使用） |
| Vercel Build Command | `pnpm --filter @ipasounddrill/web build` | `apps/web/vercel.json`（Root Directory `apps/web`）/ Dashboard Build & Development Settings |
| i18n parity CI | GitHub Actions `validate-i18n` | `python3 tools/validate/validate_i18n.py` で UI key parity / residual CJK kana / placeholders / JSON format / `_html` validity を検証 |
| MCP server | Cloudflare Workers | Worker: `githubapp-mcp`（unified）, Endpoint: `https://githubapp-mcp.nkhippo.workers.dev/sse`, Connector: `GitHubApp MCP`（shared PAT で全個人アプリ到達、本リポは対象リポの一つ）。旧: Railway `nkhippo/ipasounddrill-mcp`（`https://ipasounddrill-production.up.railway.app/mcp`, Connector `IPASoundDrill GitHub`）は Phase F まで存置=deprecated |
| GitHub Automation | GitHub Actions | Workflows: `trigger-cursor-on-ready.yml`, `approval.yml`, `label-pr-needs-review.yml` |
| Cursor Automation | Cursor Cloud | Webhook: active, Cloud Agent: 見送り中（`resource_exhausted`） |
| Secrets | GitHub repo | `CURSOR_AUTOMATION_WEBHOOK_URL`, `CURSOR_AUTOMATION_WEBHOOK_TOKEN` |
| Branch Protection | GitHub Rulesets | `main`: PR 必須 + force push 禁止 |
| Analytics | Vercel Web Analytics | Dashboard > Analytics タブ（有効化済み） |
| Feedback | Tally form | URL: TBD |

---

## 現行スコープと将来計画

**現行スコープ**: `apps/web/src/index.template.html` + 言語別静的 HTML 生成 + GAS TTS
- 対象: `apps/web/src/index.template.html`（inline CSS/JS）、`apps/web/scripts/build-i18n-html.js` で 6 言語版 HTML 生成、Vercel カスタムドメイン運用
- 実装可能: SEO、meta、i18n meta、hreflang、Analytics 統合、Tally、法務、favicon、OGP、UI polish、英語 LP、静的 HTML プリレンダ用 Node ビルド
- 実装不可（現行構成制約）: React 化、TypeScript アプリ化、状態管理ライブラリ、BE 移管

**将来計画**（個別 Issue で管理）:
  - React + Vite 化（既存単一 HTML → コンポーネント分割）
  - BE の Railway 化（GAS TTS からの脱却）
  - BYOK（ユーザー自身の API キー入力）
  - Sentry 導入
  - Playwright + Visual Regression Test
  - Storybook 導入
  - 本ファイル（`docs/repo-map.md`）の動的セクション自動生成（Issue K2）

---

## apps/web/src/index.template.html 関数マップ

`apps/web/src/index.template.html`（単一ファイル構成。言語別生成物は `/{lang}/index.html`）内の主要関数一覧・行番号・
feature_id 対応・scope（library/shared/primary）・呼び出し元エリアは `docs/impact-ledger.json` を参照
（`tools/impact-ledger/gen_impact_ledger.py` による静的解析生成物。symbol 昇順の JSON 配列）。

スキーマ定義・scope 閾値・再生成手順・impact-analysis halt ルールは `docs/impact-ledger.md` が正本。

---

## What not to confuse

| Item | Location |
|------|----------|
| Production wordlist | `packages/core/data/wordlist.json`（公開 URL `/data/wordlist.json`） |
| Neighbors slim（merge 元） | `tools/data-pipeline/derived/wordlist_with_neighbors_slim.json` |
| Phase 2 staging | `tools/data-pipeline/pipeline/`（not `packages/core/data/`, not runtime） |
| R4 作業 CSV/JSON | `tools/data-pipeline/pipeline/r4_pending_review_list.*`（**not** `docs/reference/`） |
| Cursor task docs | `docs/cursor/**`（古いレポートは pre-reorg パスを引用する場合あり） |
| Spec truth | `docs/product.md` > `docs/features/<id>.md` > `docs/data-contract.md` |

---

## Local dev

```bash
pnpm install
pnpm --filter @ipasounddrill/web build
cd apps/web/public && python3 -m http.server 8080
# http://localhost:8080/en/  （言語サブディレクトリ。file:// は JSON fetch 不可）
```

Vercel は main への push で自動デプロイ（Root Directory `apps/web`、Build Command: `pnpm --filter @ipasounddrill/web build`）。詳細は `docs/OPERATIONS.md` § 1「Vercel デプロイ」を参照。

---

_旧 `docs/REPOSITORY-STRUCTURE.md`、旧 `CLAUDE.md`「技術スタック」「ファイル構成」を統合継承（Issue #172）。ランタイム契約 → `docs/data-contract.md`、パイプライン → `docs/pipeline.md`、日付付きスナップショット → `docs/history.md` へ分離。ディレクトリツリーの `docs/PURPOSE.md` / `docs/DESIGN.md` / `docs/SPECIFICATION.md` 行は Issue #173（Issue E）で `docs/product.md` / `docs/features/` に置換。_
