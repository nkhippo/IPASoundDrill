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
| **Canonical specs** | `docs/PURPOSE.md`, `docs/DESIGN.md`, `docs/SPECIFICATION.md`（読み分けは `docs/README.md`） |

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
│   ├── PURPOSE.md               # Goals, modes, dependency table（source of truth）
│   ├── DESIGN.md                # Implementation design
│   ├── SPECIFICATION.md         # Full spec（screens, data fields, localStorage）
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

## src/index.template.html JS map

> ⚠️ **本節は Issue F の `docs/impact-ledger.json` が置換予定**（ソースシンボル → feature_ids → scope → caller_areas を機械的に管理する上位互換の台帳）。
> それまでの間、共通シンボルの呼び出し元調査は本節 + `grep` を併用すること（`docs/guardrails.md` §7 impact-analysis halt ルール）。

**File**: `src/index.template.html`（単一ファイル構成。言語別生成物は `/{lang}/index.html`）

主要関数の行番号マップ（Cursor が該当関数を特定するため）。

### 初期化

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `initApp` | L1514 | エントリポイント。データ読込・i18n・hash ルート初期化 |
| `loadWordlist` | L737 | 本番 wordlist JSON を fetch して正規化 |
| `loadConnected` | L767 | connected_speech.json を読込 |
| `loadWeak` | L775 | weak_forms.json を読込 |
| `loadGuide` | L802 | guide.json を読込 |
| `dataReady` | L1103 | 必須データ揃い判定 |
| `parseHash` | L1439 | location.hash をパース |
| `navigate` | L1444 | hash ベース遷移 |
| `onRouteChange` | L1450 | ルート変更時の画面切替 |
| `show` | L700 | 要素の hidden トグル（UI 表示制御） |

### モード制御

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `startSession` | L2769 | ドリルセッション開始・キュー初期化 |
| `initSessionQueue` | L2760 | 出題キュー構築 |
| `sessionFinished` | L2757 | セッション終了判定 |
| `goToTop` | L1650 | トップ／セットアップへ戻る |
| `showSetupOrPractice` | L1456 | セットアップと練習画面の切替 |
| `showReflection` | L2785 | 振り返り（サマリ）表示 |
| `openExitConfirm` | L2797 | セッション中断確認モーダル |
| `updateSetupFields` | L1730 | セットアップ UI の表示更新 |
| `setSetupVisible` | L1618 | セットアップ領域の表示制御 |

### 判定・解答処理

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `decodeCheck` | L2921 | Decode（IPA→綴り）解答判定 |
| `encodeCheck` | L2998 | Encode（綴り→IPA）解答判定 |
| `spellCheck` | L2917 | 綴り正規化＋レーベンシュタイン判定 |
| `reveal` | L3069 | 正誤後の Reveal 画面描画 |
| `nextCard` | L3120 | 次カードへ進む |
| `renderCard` | L2865 | 現在カードの描画ディスパッチ |
| `renderDecode` | L2896 | Decode カード UI |
| `renderEncode` | L2982 | Encode カード UI |
| `renderSummary` | L3159 | セッション振り返りサマリ |
| `modeBMcqPick` | L2105 | Mode B MCQ 選択処理 |
| `modeBDictCheck` | L2131 | Mode B 綴り入力判定 |
| `buildMcqChoices` | L2024 | Mode B 誤答選択肢生成 |

### TTS

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `speak` | L2654 | TTS 再生エントリ（キャッシュ／GAS） |
| `fetchAudioFromGas` | L2297 | GAS 経由で音声取得 |
| `fetchAudioFromGasAccent` | L2265 | アクセント指定で GAS 取得 |
| `fetchUrlsFromGas` | L2273 | `?urls=1` Drive URL 一括取得 |
| `prefetchSessionAudio` | L2634 | セッションキューの先行取得 |
| `prefetchItemsAudio` | L2534 | アイテム単位の prefetch 起動 |
| `gasWarm` | L2383 | GAS warm エンドポイント呼び出し |
| `hasCachedAudioFor` | L2205 | localStorage／メモリキャッシュ有無 |
| `refreshAllSpeakers` | L2377 | 再生ボタン状態の一括更新 |
| `ttsAccent` | L2155 | opts から TTS アクセント決定 |

### i18n / 言語切替

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `setLang` | L1372 | UI 言語切替・locale 再読込 |
| `applyI18n` | L1266 | UI 文字列を DOM に適用 |
| `loadLocale` | L1222 | i18n/{lang}.json を読込 |
| `t` | L1215 | ネストキー参照＋プレースホルダ置換 |
| `wordGloss` | L1238 | 現在言語の gloss 取得 |
| `applyI18nVocab` | L855 | 語彙ブラウザ向け i18n 適用 |

### アクセント切替

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `setAccent` | L1412 | GA / RP 切替 |
| `activeIpa` | L1118 | 現在アクセントの IPA |
| `altIpa` | L1122 | 反対アクセントの IPA |
| `otherAccent` | L1158 | 反対アクセントコード |
| `renderAltAccentLine` | L1174 | 代替アクセント行の描画 |
| `refreshAltAccentSpeakers` | L1193 | 代替アクセント再生ボタン更新 |
| `formatSameAccentIpa` | L1140 | ga_rp_same 時の表示整形 |

### 語彙ブラウザ / IPA 記号ピッカー

| 関数名 | 概要 |
|---|---|
| `openVocab` / `closeVocab` | `#vocabPage` exclusive full-page 開閉（`body.vocab-page`） |
| `setExclusivePage` | `body.vocab-page` / `body.symbol-picker-page` の排他 viewport 切替 |
| `showVocabView` | Words / Phrases 表示 |
| `renderVocabWords` | 単語一覧（仮想化・綴り検索・CEFR フィルタ） |
| `renderVocabPhrases` | フレーズ一覧（非仮想化） |
| `renderVocabTab` | タブ切替描画 |
| `buildVocabLetterBar` / `jumpVocabLetter` | 頭文字フィルタ / 仮想リストへのジャンプ |
| `rebuildVirtSlots` / `paintVirtWindow` | Words リスト仮想化（常時 ~20–30 行） |
| `vocabDisplayGloss` | 語彙 gloss 表示文字列 |
| `renderSymbolPicker` | `#symbolPickerPage`（`#/vocab/ipa`）描画 |
| `symbolChartGroups` | IPA chart 標準分類のパレット生成 |
| `symbolQuery`（array） | Multi-symbol query builder（チップ蓄積） |

### 学習状況

| 関数名 | 概要 |
|---|---|
| `showProgressPage` / `renderProgressPage` | `#learningStatusPage`（`#/progress`、`body.progress-page`）開閉・全体描画 |
| `computeDrillProgress` | `ept_marks_v1` をドリル × CEFR × 0–3スロットで集計 |
| `openDrillProfile` | `3d` のドリルカードから既存 `3a` 導線へ移動 |
| `setExclusivePage` | `vocab` / `symbol` / `progress` / `null` の排他 viewport 切替 |

### PC ヘッダー 3 パターン

| 関数名 | 概要 |
|---|---|
| `isPcLayout` | `matchMedia("(min-width:1024px)")` による PC 判定 |
| `updateTaskHeader` | 2*-pc drill-header（戻る / title / progress / 語彙 / accent / counter）同期 |
| `syncPcSupportChrome` | 3*-pc `body.pc-support` + `.modal-chrome`（3 dots）表示制御 |
| `applyModeBStudyTwoPane` | Mode B Study で `body.drill-two-pane`（`ctx.type === "modeb-study"`） |

CSS（`@media (min-width:1024px)`）:
- **1a-pc**: `.header-nav` + `/iː/` 26px
- **2a-pc〜2d-pc**: `.task-header.drill-header`、topbar/brand/TOPへ非表示
- **3a-pc〜3d/3g**: `.modal-chrome` / `.modal-dots`、brand/TOPへ非表示

### オンボーディング

| 関数名 | 概要 |
|---|---|
| `showOnboarding` / `hideOnboarding` | `#onboardingModal`（`3g` / PC 4 カード）の開閉 |
| `reopenOnboarding` | SP `#guideBtn` から任意再表示（LS は書き換えない） |
| `maybeShowOnboarding` | `onboarding_completed_v1` 未完了時の初回自動発火 |
| `completeOnboarding` / `isOnboardingCompleted` | LS `onboarding_completed_v1` の set / get |
| `renderOnboardingSlide` / `applyOnboardingI18n` | SP 4 スライド進行・文言適用 |

### Reveal

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `reveal` | L3069 | Reveal 画面本体 |
| `renderWordPronDetails` | L3037 | 発音詳細（IPA／respell） |
| `refreshRevealIpa` | L3057 | Reveal 内 IPA 再描画 |
| `bindRevealCheckClicks` | L3236 | 進捗チェックスロットクリック |
| `refreshRevealChecksPanel` | L931 | Reveal 進捗パネル更新 |
| `renderInfo` | L2807 | 音素情報ボックス描画 |
| `bindIpaSegments` | L2836 | IPA セグメントクリック紐付け |

### 進捗管理

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `loadChecks` | L1751 | ept_checks_v1 読込 |
| `saveChecks` | L1755 | ept_checks_v1 保存 |
| `getCheckCount` | L1762 | モード別チェック数取得 |
| `setCheckCount` | L1768 | モード別チェック数設定 |
| `toggleCheckSlot` | L1779 | スロット 1–3 トグル |
| `frequencyWeight` | L1785 | 出題頻度ウェイト |
| `weightedShuffle` | L1788 | ウェイト付きシャッフル |
| `progressChecksHtml` | L894 | 語彙ブラウザ用チェック HTML |
| `refreshChecksInDom` | L921 | DOM 上チェック表示更新 |

### その他

| 関数名 | 行番号 | 概要 |
|---|---|---|
| `openGuide` | L840 | サイトガイドモーダル表示 |
| `closeGuide` | L851 | サイトガイドを閉じる |
| `renderGuide` | L824 | ガイド本文描画 |
| `openSettings` | L1426 | 設定モーダルを開く |
| `closeSettings` | L1427 | 設定モーダルを閉じる |
| `buildKeyboard` | L2965 | Encode 用 IPA キーボード構築 |
| `renderConnectedPrompt` | L2849 | Connected speech プロンプト |
| `modeBPool` | L1982 | Mode B 出題プール |
| `buildModeBQueue` | L2043 | Mode B キュー構築 |
| `renderModeBStudy` | L2081 | Mode B Study 画面 |

行番号スナップショットの同期日は `docs/history.md` を参照。

---

## What not to confuse

| Item | Location |
|------|----------|
| Production wordlist | **Root** `wordlist_GA_a1a2_plus_phonics.json` |
| Neighbors slim（merge 元） | `data/derived/wordlist_with_neighbors_slim.json` |
| Phase 2 staging | `data/pipeline/`（not root, not runtime） |
| R4 作業 CSV/JSON | `data/pipeline/r4_pending_review_list.*`（**not** `docs/reference/`） |
| Cursor task docs | `docs/cursor/**`（古いレポートは pre-reorg パスを引用する場合あり） |
| Spec truth | `docs/PURPOSE.md` > `docs/DESIGN.md` > `docs/SPECIFICATION.md` |

---

## Local dev

```bash
npm run build
python3 -m http.server 8080
# http://localhost:8080/en/  （言語サブディレクトリ。file:// は JSON fetch 不可）
```

Vercel は main への push で自動デプロイ（Build Command: `node scripts/build-i18n-html.js`）。詳細は `docs/OPERATIONS.md` § 1「Vercel デプロイ」を参照。

---

_旧 `docs/REPOSITORY-STRUCTURE.md`、旧 `CLAUDE.md`「技術スタック」「ファイル構成」を統合継承（Issue #172）。ランタイム契約 → `docs/data-contract.md`、パイプライン → `docs/pipeline.md`、日付付きスナップショット → `docs/history.md` へ分離。_
