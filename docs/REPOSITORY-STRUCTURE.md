---
id: pj-2026-07-09-80be
aliases:
- pj-2026-07-09-80be
title: Repository Structure
created: '2026-07-09'
---

# Repository Structure

> **Purpose:** Share this file with Claude (or other AI assistants) at the start of a task so it knows where data, scripts, and docs live.  
> **Last updated:** 2026-07-20（Phase 1-E PR-1: vocab full-page / symbol picker・i18n 219 leaf）

---

## Canonical documentation — what to read when

Claude に渡すときは **本ファイルを最初に**読ませ、目的に応じて下表の正本を追加する。

| File | Role | Read when you need… |
|------|------|---------------------|
| **`REPOSITORY-STRUCTURE.md`**（本書） | フォルダマップ・パス・パイプライン手順 | どこに何があるか、コマンド、ランタイム契約 |
| **`PURPOSE.md`** | 目的・2モード・評価方針の正本 | なぜそう作るか、本丸 vs サブテーマ、依存の実装状況 |
| **`DESIGN.md`** | 実装設計（what/how） | SRS・出題・TTS・データ整備タスクの設計意図 |
| **`SPECIFICATION.md`** | 画面・データフィールド・localStorage の正本 | UI 仕様、JSON スキーマ、`ga_rp_same` 定義 |
| **`docs/cursor/README.md`** | Cursor タスク履歴の索引 | 過去の指示書・実装レポート・Recon の場所 |
| **`docs/cursor/recon/`** | Pre-Issue Recon レポート（読み取り専用調査） | UI/UX・ビルド調査の機械抽出メモ（例: 2026-07-16 index SPA audit） |
| **`docs/design/`** | Phase 1+ のデザイン入力資料（タグライン候補、`phase-1/screen-data-mapping.md`） | Claude Design ブリーフ・Phase 1 実装 Recon・LP コピー検討 |
| **`docs/reference/README.md`** | 監査・運用ガイドの索引 | R4 レビュー、CEFR 監査、TTS 設計の詳細 |
| **`data/README.md`** | `data/` 配下の役割分担 | runtime / batches / pipeline / derived の見分け |

**衝突時の優先順位:** `PURPOSE.md` → `DESIGN.md` → `SPECIFICATION.md` → 本書の運用メモ。

**履歴ドキュメント:** `docs/cursor/reports/` 内の古いレポートは当時の語数・パスを引用する場合あり。数値・パスの正本は上表。

## Quick orientation

| Layer | Role |
|-------|------|
| **Runtime (Vercel + custom domain)** | `src/index.template.html` → build → `/{lang}/index.html` + JSON/i18n/fonts loaded by the browser |
| **Production wordlist** | `wordlist_GA_a1a2_plus_phonics.json` at repo root (**5,397 words**, Jul 2026) |
| **Pipeline** | `scripts/*.py` read/write `data/pipeline/` staging JSON, merge into wordlist |
| **Batch imports** | `data/batches/` — Phase 1/2 merge sources（[[pj-2026-07-10-2e6a|`data/batches/README.md`]]） |
| **GAS TTS** | `gas/` — Google Apps Script proxy; not loaded by static site |
| **Task history** | `docs/cursor/` — instructions / reports / briefs / **recon**（[[pj-2026-07-10-a25d|`docs/cursor/README.md`]]） |
| **Canonical specs** | `docs/PURPOSE.md`, `docs/DESIGN.md`, `docs/SPECIFICATION.md`（読み分けは上表） |

**Path helper for Python:** `scripts/paths.py` defines canonical paths. Prefer importing it over hard-coded strings.

### 正本ファイル（SPA）

| 種別 | パス | 備考 |
|------|------|------|
| SPA テンプレート（正本） | `src/index.template.html` | Cursor が編集する唯一の HTML ソース |
| 生成物 | `/{lang}/index.html`（`en` … `fil`） | `npm run build` / Vercel Build。`.gitignore` |
| ルート `index.html` | **無し** | F2 以降削除。middleware が `/` を言語別 URL へ振り分け |

**Data folder map:** [[pj-2026-07-10-359a|`data/README.md`]] — runtime / batches / pipeline / derived / patches / archive の見分け方。

---

## Directory tree

```
ipasounddrill/
├── src/
│   └── index.template.html    # ★ SPA テンプレート（Decode/Encode, Mode B, Connected Speech, vocab browser, progress checks）
├── en/ … fil/                 # （生成物、Vercel Build で生成、`.gitignore` で除外）
├── middleware.ts              # `/` の Accept-Language / Cookie / Bot 振り分け（C1 fallback 時は不使用）
├── package.json               # `npm run build` → `scripts/build-i18n-html.js`
├── vercel.json                # Build Command / rewrites
├── README.md                  # 人間向け概要（デモ URL・ローカル起動）
├── wordlist_GA_a1a2_plus_phonics.json   # ★ PRODUCTION wordlist（runtime fetch・ルート固定）
├── wordlist_GA_a1a2_plus_phonics.csv    # CSV export（pipeline / i18n tooling）
│
├── data/
│   ├── README.md              # ★ data/ 配下の役割分担（AI 向け）
│   ├── connected_speech.json  # ★ RUNTIME — 201 linking phrases（+ cefr, ga_rp_same）
│   ├── weak_forms.json        # ★ RUNTIME — 36 weak forms（+ cefr, ga_rp_same）
│   ├── guide.json             # ★ RUNTIME — multilingual onboarding（8 sections × 6 langs）
│   ├── batches/               # マージ入力（ブラウザ非読込）→ README.md 参照
│   │   ├── phase1_m*_*.json, phase2_*.json
│   │   └── gap_*.json         # 将来拡充分析（未マージ）
│   ├── pipeline/              # IPA / respelling ステージング → README.md 参照
│   │   ├── phase2a_*.json, phase2b_*.json
│   │   ├── ga_rp_same_report.json
│   │   └── r4_pending_review_list.{json,csv}
│   ├── derived/               # neighbors, RP IPA 進捗（マージ中間・非 runtime）
│   │   ├── wordlist_with_neighbors.json
│   │   ├── wordlist_with_neighbors_slim.json
│   │   ├── rp_progress.json, rp_complete.json
│   ├── patches/               # 過去の一括パッチ（def, gloss-fil, hotfix 等）
│   │   └── phase2_audit/      # Phase B 監査パッチ（wordlist / batch sync）
│   └── archive/               # ローカル退避（gitignore）→ README.md 参照
│
├── docs/
│   ├── README.md                # ★ docs/ 索引（AI 向け・最初の案内）
│   ├── REPOSITORY-STRUCTURE.md  # ★ フォルダマップ（Claude 共有用）
│   ├── PURPOSE.md               # Goals, modes, dependency table（source of truth）
│   ├── DESIGN.md                # Implementation design
│   ├── SPECIFICATION.md         # Full spec（screens, data fields, localStorage）
│   ├── cursor/                  # AI タスク履歴 → README.md 参照
│   │   ├── instructions/        # cursor-instructions-*.md
│   │   ├── reports/             # cursor-implementation-report-*.md
│   │   ├── briefs/              # 設計相談ブリーフ
│   │   └── recon/               # Pre-Issue Recon（DOM/関数/i18n 等の機械抽出）
│   ├── design/                  # Phase 1+ デザイン入力（タグライン候補等）
│   │   └── tagline-candidates.md
│   ├── reference/               # 監査・意思決定・運用ガイド → README.md 参照
│   ├── testing/                 # Manual test checklists
│   └── archive/                 # 旧ドキュメント退避
│
├── scripts/                   # Python pipeline + `build-i18n-html.js`（paths.py が Python パス正本）→ 下表「Key scripts」
├── tools/                     # merge_def, validate_i18n, gen_audit_docs, …
├── gas/                       # Code.gs, BatchWarm.gs, BatchWords.gs, README
├── i18n/                      # UI strings + phonemes/（6 languages）
├── fonts/                     # Doulos SIL（IPA）
└── tests/                     # tts-ab-listener.html（TTS experiment）
```

---

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
| MCP server | Railway | Repo: `nkhippo/ipasounddrill-mcp`, Endpoint: `https://ipasounddrill-production.up.railway.app/mcp`, Health: `/health`, Connector: `IPASoundDrill GitHub` |
| GitHub Automation | GitHub Actions | Workflows: `trigger-cursor-on-ready.yml`, `approval.yml`, `label-pr-needs-review.yml` |
| Cursor Automation | Cursor Cloud | Webhook: active, Cloud Agent: 見送り中（`resource_exhausted`） |
| Secrets | GitHub repo | `CURSOR_AUTOMATION_WEBHOOK_URL`, `CURSOR_AUTOMATION_WEBHOOK_TOKEN` |
| Branch Protection | GitHub Rulesets | `main`: PR 必須 + force push 禁止 |
| Analytics | Vercel Web Analytics | Dashboard > Analytics タブ（有効化済み、Issue #19 完了） |
| Feedback | Tally form | URL: TBD（Issue E2 で確定） |

---

## Track A / B スコープ

**Track A（〜2026-07-12〜13 ローンチ）**: `src/index.template.html` + 言語別静的 HTML 生成 + GAS TTS
- 対象: `src/index.template.html`（inline CSS/JS）、`scripts/build-i18n-html.js` で 6 言語版 HTML 生成、Vercel カスタムドメイン運用
- 実装可能: SEO、meta、i18n meta、hreflang、Analytics 統合、Tally、法務、favicon、OGP、UI polish、英語 LP、静的 HTML プリレンダ用 Node ビルド
- 実装不可: React 化、TypeScript アプリ化、状態管理ライブラリ、BE 移管

**Track B（2026-07-14〜、ローンチ後）**: React 化、BYOK、BE 移管、Sentry、Playwright 等
- 主要スコープ:
  - React + Vite 化（既存単一 HTML → コンポーネント分割）
  - BE の Railway 化（GAS TTS からの脱却）
  - BYOK（ユーザー自身の API キー入力）
  - Sentry 導入
  - Playwright + Visual Regression Test
  - develop-first ブランチ運用への切替
  - Storybook 導入
  - REPOSITORY-STRUCTURE.md の動的セクション自動生成（Issue K2）

Track A 期間中に Track B スコープの提案が出たら、`track-b` ラベルで別 Issue 化する。

## Runtime data contract (`src/index.template.html`)

These paths are **hard-coded** in the app（`<base href="/">` により言語サブディレクトリからもルート相対で解決）. Do not move without updating `src/index.template.html`.

| Asset | Path |
|-------|------|
| Wordlist | `wordlist_GA_a1a2_plus_phonics.json` |
| Connected speech | `data/connected_speech.json` |
| Weak forms | `data/weak_forms.json` |
| Guide | `data/guide.json` |
| UI i18n | `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` |
| Phoneme help | `i18n/phonemes/{lang}.json` |
| IPA font | `fonts/DoulosSIL-Regular.woff2` |
| TTS | External `GAS_TTS_URL` in `src/index.template.html` → `gas/Code.gs` deployment |

---

---

## i18n schema

**Files**: `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json`（6 言語）

**Top-level keys**（`en.json` を基準、他言語も同一構造）:

| Key | Type | 役割 |
|---|---|---|
| `brand` | object | ブランド名（`name`, `home`） |
| `lead_html` | string | トップの導入テキスト |
| `lead_connected_html` | string | Connected speech モードの導入 |
| `lead_weak_html` | string | Weak forms モードの導入 |
| `tab` | object | 練習モードタブ（`label`, `words`, `connected`, `weak`） |
| `mode` | object | 学習モードラベル |
| `modeb` | object | Mode B（Listen & learn）関連 |
| `cs` | object | Connected speech フィルタ |
| `weak` | object | Weak forms ラベル |
| `focus` | object | 音素フォーカスフィルタ |
| `reg` | object | 綴りパターンフィルタ |
| `pool` | object | 対象語数表示 |
| `setup` | object | 設定パネル |
| `dir` | object | 方向（decode / encode） |
| `lvl` | object | CEFR レベル |
| `grp` | object | 綴り規則グループ |
| `accent` | object | GA / RP ラベル |
| `guide` | object | サイトガイドモーダル |
| `vocab` | object | 語彙ブラウザ（`vocab.filter.*` 含む） |
| `symbol` | object | IPA 記号ピッカー（`symbol.picker.*` / `symbol.group.*.{en,sub}` / `symbol.height.*.{en,sub}`） |
| `reveal` | object | Reveal 画面（GA / RP 表記） |
| `lang_opts` | object | 言語切替 dropdown（6 言語） |
| `reflect`, `exit_confirm`, `note`, `patterns`, `summary`, `info`, `kbd`, `pos`, `cefr`, `checks` | object | 各機能セクション |
| `start`, `loading`, `load_fail`, `wordlist_fail`, `back_top`, `settings_*`, `listen`, `input_ph`, `input_phrase`, `check`, `clear`, `next`, `build_ph`, `tips_head`, `you`, `see_answer` | string | 各種 UI 文字列 |

**確定追加キー**（Issue #25 で追加済み、F2 / Issue #39 で消費開始）:
- `meta`（object）: `title` / `description` / `ogTitle` / `ogDescription`（build-only。`keywords` は 2026-07-16 削除）
- 挿入位置: `brand` の直後（`brand` と `lead_html` の間）

**関連 files**:
- `i18n/phonemes/{lang}.json`: 音素解説（各言語別）

**Notes**:
- 総 leaf 数: **219**（Phase 1-E PR-1 後。182→219、+37。SPEC §5.5 の集約更新は PR-3）
- 新規キー群（PR-1）: `vocab.filter.*`、`symbol.picker.*`、`symbol.group.*.{en,sub}`、`symbol.height.*.{en,sub}`
- HTML 埋め込みキーは `_html` サフィックス
- 動的置換プレースホルダ: `{n}`, `{band}`, `{pct}`, `{m}`, `{t}`, `{c}`, `{list}`, `{p}`, `{sy}`, `{s}`, `{a}`

_Last synced with code: 2026-07-20（Phase 1-E PR-1）_

---

## src/index.template.html JS map

**File**: `src/index.template.html`（約 3,259 行ベース、単一ファイル構成。言語別生成物は `/{lang}/index.html`）

Cursor が該当関数を行番号レベルで特定できるよう、主要関数のマップを提供する。

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

### 語彙ブラウザ / IPA 記号ピッカー（Phase 1-E PR-1）

| 関数名 | 概要 |
|---|---|
| `openVocab` / `closeVocab` | `#vocabPage` exclusive full-page 開閉（`body.vocab-page`） |
| `setExclusivePage` | `body.vocab-page` / `body.symbol-picker-page` の排他 viewport 切替 |
| `showVocabView` | Words / Phrases 表示 |
| `renderVocabWords` | 単語一覧（仮想化・綴り検索・CEFR フィルタ） |
| `renderVocabPhrases` | フレーズ一覧（**非仮想化**、A8） |
| `renderVocabTab` | タブ切替描画 |
| `buildVocabLetterBar` / `jumpVocabLetter` | 頭文字フィルタ / 仮想リストへのジャンプ |
| `rebuildVirtSlots` / `paintVirtWindow` | Words リスト仮想化（常時 ~20–30 行） |
| `vocabDisplayGloss` | 語彙 gloss 表示文字列 |
| `renderSymbolPicker` | `#symbolPickerPage`（`#/vocab/ipa`）描画 |
| `symbolChartGroups` | IPA chart 標準分類のパレット生成 |
| `symbolQuery`（array） | Multi-symbol query builder（チップ蓄積） |

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

_Last synced with code: 2026-07-12_

---

## Wordlist snapshot (2026-07-10)

| Metric | Value |
|--------|------:|
| Total words | **5,397** |
| CEFR A1 | 1,187 |
| CEFR A2 | 1,195 |
| CEFR B1 | 2,116 |
| CEFR B2 | **899**（Phase 2 M2 完了: pilot 179 + M2 390） |
| `rp_ipa` | 5,397（100%） |
| `ga_rp_same` | 5,397（100% 付与）。**same=2,674 / different=2,723**（Phase R 後） |
| `neighbors` 非空 | 5,113（94%） |
| 全体 0 近傍率 | 5% |
| `ipa_actual_ga`（flap 候補） | ~529 |
| R4 pending（TTS review） | **127** |
| `respell_ga` drafted | ~5,260 |
| gloss 5 langs | 5,397 |

---

## Connected speech & weak forms

| File | Count | Notes |
|------|------:|-------|
| `data/connected_speech.json` | 201 | `cefr` + `ga_rp_same`; vocab browser Phrases タブに CEFR バッジ表示 |
| `data/weak_forms.json` | 36 | 同上; 練習時 Connected Speech Type=weak で出題 |

---

## Common pipeline commands

Run from **repo root**:

```bash
# After merging a new batch into wordlist（Phase 2 以降は rp_ipa 同梱のため gen_rp_ipa.py は不要）:
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
python3 scripts/export_batch_words.py

# After batch merge, if rp_ipa was generated with old happY rules:
python3 scripts/fix_happy_i.py   # word-final /iː/ or /ɪ/ → /i/ (then re-run gen_ga_rp_same)

# Regenerate audit markdown:
python3 tools/gen_audit_docs.py
python3 tools/validate_i18n.py
```

**Do not run** `merge_rp_ipa.py` on production wordlist（`connected_speech.json` を上書きする既知バグ）。

**Phase R 追加スクリプト:**

| Script | 役割 |
|--------|------|
| `scripts/phonology_lexicon.py` | 共有語彙リスト（`BATH_WORDS_BASE`, `PALM_WORDS`, `YOD_CORONALS`）— `ga_to_rp.py` と `gen_ga_rp_same.py` から import |
| `scripts/fix_happy_i.py` | rp_ipa の happY 位置 `/iː/`/`/ɪ/` → `/i/` 是正（Phase R2 で1回実行済み。将来バッチ追加時にも実行推奨） |
| `scripts/gen_ga_rp_same.py` | `ga_rp_same` / `ga_rp_same_reason` 一括付与（分類器。Phase R1 で dead-code 修正済み） |
| `scripts/ga_to_rp.py` | GA→RP ルール変換（**offline fallback のみ**。本番 `rp_ipa` は Claude バッチ同梱） |
| `scripts/gen_rp_ipa.py` | Claude API で RP IPA 生成（新規バッチ用。SYSTEM_PROMPT に happY ルールあり） |

Staging outputs → `data/pipeline/`. Neighbors / RP progress → `data/derived/`. Merge scripts write `wordlist_GA_a1a2_plus_phonics.json`.

---

## Phase 2 B2 expansion workflow（M2 完了後）

1. Receive `phase2_mN_*_with_gloss.json`（`rp_ipa` 同梱）→ `data/batches/`
2. Merge into wordlist（重複スキップ、`_generation_source` 除去、`neighbors: []`）
3. Run pipeline（上記）
4. Verify counts; sync `data/derived/rp_progress.json` from wordlist
5. Add `docs/cursor/instructions/` + `docs/cursor/reports/`

**Phase 2 M2 完了:** 569 語追加（B2 330→899）。残り B2 約 1,423 語は M3 以降。設計: `docs/reference/c1-expansion-scope-design.md`

**Phase R 完了（2026-07-10）:** 分類器修正 + happY rp_ipa 91語是正 + `phonology_lexicon.py` 統合。詳細: `docs/cursor/reports/cursor-implementation-report-phase-r.md`

---

## R4 pending（TTS レビュー）

| Asset | Path |
|-------|------|
| 機械抽出リスト | `data/pipeline/phase2a_review_needed.json`（127 語） |
| 作業用リスト（拡張） | `data/pipeline/r4_pending_review_list.json` / `.csv` |
| 手順ガイド | `docs/reference/r4-pending-review-guide.md` |

---

## GAS / audio

| File | Role |
|------|------|
| `gas/Code.gs` | TTS proxy（word / phrase / weak / warm / **`?urls=1`**） |
| `gas/BatchWarm.gs` | Scheduled GA Drive pre-generation |
| `gas/BatchWords.gs` | Word list for batch warm（**5,397 語** — `export_batch_words.py` で更新） |
| `gas/README.md` | Deploy + API reference |
| 手動残作業 | [[pj-2026-07-10-dd2c|`docs/reference/remaining-ops-checklist.md`]]（再デプロイ・`migratePublicSharing`・BatchWarm） |

---

## What not to confuse

| Item | Location |
|------|----------|
| Production wordlist | **Root** `wordlist_GA_a1a2_plus_phonics.json` |
| Neighbors slim（merge 元） | `data/derived/wordlist_with_neighbors_slim.json` |
| Phase 2 staging | `data/pipeline/`（not root, not runtime） |
| R4 作業 CSV/JSON | `data/pipeline/r4_pending_review_list.*`（**not** `docs/reference/`） |
| Cursor task docs | `docs/cursor/**`（古いレポートは pre-reorg パスを引用する場合あり） |
| Spec truth | `PURPOSE.md` > `DESIGN.md` > `SPECIFICATION.md` |

---

## UI behaviour snapshot (2026-07-10)

| Feature | Implementation |
|---------|----------------|
| Progress checks | `ept_checks_v1` — 3 slots × 3 modes（`d`/`e`/`l`）; vocab browser + Reveal + Mode B Study |
| Frequency weighting | `weightedShuffle` + `frequencyWeight` in session pool build |
| Alt-accent same display | `/ipa/（同じ）` via `ga_rp_same` flag（`scripts/gen_ga_rp_same.py`） |
| Vocab browser（`3b`） | exclusive full-page `#vocabPage`（`body.vocab-page`）；hash `#/vocab` / `#/vocab/phrases`；sticky filter（綴り/IPA segmented・CEFR pills・search）；Words 仮想化 ~20–30 行；Phrases 非仮想化；CEFR 初期は全選択 |
| IPA symbol picker（`3c`） | `#symbolPickerPage`（`body.symbol-picker-page`）；hash `#/vocab/ipa`；query chips + IPA chart palette；live IPA substring + `--signal` highlight |
| Session exit | `#exitConfirmModal` on drill screens |
| CEFR setup filters | Pills with 0 results disabled; Mode A: A1/A2/B1（B2 は Mode B バンドで利用） |
| TTS first-question | Phase T: body-first prefetch、`?urls=1` Drive 直 fetch、setup preread（GAS 再デプロイ後に有効） |

---

## Local dev

```bash
npm run build
python3 -m http.server 8080
# http://localhost:8080/en/  （言語サブディレクトリ。file:// は JSON fetch 不可）
```

Vercel は main への push で自動デプロイ（Build Command: `node scripts/build-i18n-html.js`）。詳細は `docs/OPERATIONS.md` § 1「Vercel デプロイ」を参照。
