# SEO/AI-discoverability + Deep URL + PWA + Wordlist 公開 — 利用者増加戦略セッションレポート

## 関連 Issue / PR

- **SEO 分析基盤**
  - Issue #239 → PR #240: SEO 軽微バッチ (JSON-LD @graph / OGP 画像 / llms.txt 拡充 / AI クローラ Allow / sitemap 動的化)
  - Issue #241 → PR #242: h1 SEO キーワード (visually-hidden, 6 言語 i18n leaf)
- **Deep URL EPIC #243** (long-tail SEO 受け皿)
  - Issue #244 → PR #245: Phase 1 音素 45 × 6 言語 = 270 URL + IPA→slug redirect + 未対応言語 fallback
  - PR #246: Phase 2 弱形 36 × 6 = 216 URL
  - PR #247: Phase 3 句 201 × 6 = 1,206 URL
  - PR #248: Phase 4 音素→代表単語 45 × 6 = 270 URL
- **PWA**
  - Issue #249 → PR #250: Phase 1 manifest + icons + theme-color
  - Issue #254 → PR #255: Phase 2 Service Worker (network-first HTML)
- **オープンデータ**
  - Issue #251 → PR #252: Wordlist 5,397 語を CC BY 4.0 で公開 (CSV/JSON/LICENSE/README + 6 言語 landing)
  - PR #253: 公開 CSV/JSON の pos 英語化 (UI 影響ゼロ)
- Agent: claude-code (壁打ち + 実装ドライバー、10 PR 連続、いずれも Naoya が review→merge)

## セッション概要

**「利用者を増やしたい (SNS 以外)」という Naoya の壁打ちから開始**。GSC 実データ (過去 3 か月合計 2 クリック / 28 表示 / 非ブランドクエリ流入ゼロ) と Ahrefs (Organic keywords 0 / DR 0 / AI responses 0) を確認し、**根本原因は「インデックス済み URL が 6 言語ルート + `/` = 7 件しかなく long-tail 検索を捕獲する面積がない」こと**と判明。

既存データ資産 (音素 45 / 弱形 36 / 句 201 / 単語 5,397、全て 6 言語対応) を build 時静的生成で URL 化する戦略が最もコスト効率が高いと判断し、**7 → 1,974 URL (約 282 倍) に成長**。並行して JSON-LD 拡張、AI クローラ対応、PWA 化、CC BY 4.0 データセット公開まで一気通貫で実施。

## 実施内容

### Phase 1: SEO 分析 (壁打ち)

- Claude が `apps/web/src/index.template.html` / `build-i18n-html.js` / `public/{llms.txt,robots.txt,sitemap.xml}` / `docs/product.md` / `docs/repo-map.md` を実読して 15 弱点を洗い出し
- Naoya が GSC (Queries/Pages/Countries/Devices + Coverage 404 詳細) と Ahrefs スクショを共有
- 優先順位付け: Deep URL EPIC が最大インパクト、SEO 軽微バッチと h1 が事前基盤

### Phase 2: SEO 軽微バッチ (#239/#240)

- JSON-LD を単発 `WebApplication` から `@graph` (WebApp + LearningResource + Organization + FAQPage 5 Q&A) に拡張
- OGP 画像 1200×630 を build 時に SVG → PNG 生成 (`@resvg/resvg-js` を devDep 追加)
- `llms.txt` を 51 → 210 行 (Phonemes / GA vs RP / weak forms / connected speech / audience / license)
- `robots.txt` に AI クローラ 7 種 (GPTBot / ChatGPT-User / PerplexityBot / ClaudeBot / Claude-Web / anthropic-ai / Google-Extended) 明示 Allow
- `sitemap.xml` を build 時自動生成化、`<lastmod>` 動的注入

### Phase 3: h1 SEO キーワード (#241/#242)

- 既存 h1 `音を、美しく。` はブランドタグライン。SEO キーワードを含まないため:
  - 新設: `<h1 class="visually-hidden" id="seoH1">` (6 言語で「英語発音 IPA」等含む)
  - 既存: `<h1 class="top-tagline">` → `<p class="top-tagline">` に降格 (見た目 100% 不変)
- `packages/core/i18n/{6 lang}.json` に `seo.h1` leaf 追加

### Phase 4: Deep URL EPIC #243 (4 PR、最重要)

**共通設計**:
- URL 構造: `/{lang}/sounds/<slug>/`, `/{lang}/weak-forms/<slug>/`, `/{lang}/phrases/<slug>/`, `/{lang}/sounds/<slug>/words/`
- Slug 命名: SEO キーワード形 (`schwa`, `th-voiceless`, `long-e`, `an-apple`, `dont-you`)
- IPA 記号 URL は `middleware.ts` で 301 → canonical slug (「/en/sounds/ə/」→「/en/sounds/schwa/」)
- 未対応言語 (GSC 404 実例の /it/, /fi/, /zu/) は `/en/` に 302 fallback で同時解決
- 全ページに GAS TTS Listen ボタン、JSON-LD (LearningResource + BreadcrumbList)、内部リンクグラフ (関連 6 件)、トップページ CTA

**Phase 1 音素 (#244/#245)**:
- `apps/web/scripts/phoneme-slugs.js` に 45 音素の SEO slug 対応表 (single source of truth)
- `apps/web/src/sound-detail.template.html` を新規作成、Doulos SIL フォント再利用、既存カラートークン
- `middleware.ts` 拡張: matcher を root (`/`) のみ → 3 パターン (root / 未対応言語 / IPA slug redirect)、戻り値契約を `Response | undefined` に変更
- `packages/core/i18n/{6 lang}.json` に `seo.sounds.*` 27 leaves 追加 (手書き翻訳)

**Phase 2 弱形 (#246)**:
- `weak-form-detail.template.html`、弱形/強形の 2 カラム + GA/RP 併記
- 単語スラグは URL-safe な英単語のみ → middleware 追加変更なし
- `seo.weakForms.*` 16 leaves × 6 言語、`cs_rule.{lang}` を流用

**Phase 3 句 (#247)**:
- `phrase-detail.template.html`、cs_type バッジ (Linking/Assimilation/Elision) + gloss
- `phraseSlug()` 実装 (lowercase + apostrophe 除去 + spaces→hyphens、201 件で衝突ゼロ検証済み)
- `seo.phrases.*` 17 leaves × 6 言語

**Phase 4 音素代表単語 (#248)**:
- `sound-words.template.html`、CEFR 順 20 語のテーブル (GA/RP IPA + CEFR バッジ + Listen)
- `groupWordsByPhoneme()` 実装、IPA 正規化 (`ɒ→ɑ`, `ɜ→ɝ`, `əʊ→oʊ`, `ː` 除去) で GA/RP 両方から音素抽出 → 45 音素すべてで 20 語以上確保 (最少 25 語)
- Phase 1 sound-detail への cross-link 「See 20 common words with this sound →」CTA 追加 (270 音素ページ全てに反映)

### Phase 5: PWA (2 PR)

**Phase 1 manifest + icons (#249/#250)**:
- `manifest.webmanifest`: name / start_url / display=standalone / theme_color=#0C7C7E / icons 3 種
- `pwa-icon-maskable.svg` (Android adaptive icon 用 80% safe-zone)
- @resvg/resvg-js で 180/192/512/512-maskable PNG を build 時生成
- 5 テンプレの `<head>` に apple-touch-icon / manifest / theme-color

**Phase 2 Service Worker (#254/#255)**:
- `sw.js` 100 行未満、依存追加ゼロ
- **HTML: network-first** (デプロイ後の古い HTML 停滞事故を回避)
- **静的アセット (fonts/core-bundle/icons): cache-first**
- **変動データ (i18n JSON/data JSON/CSS): stale-while-revalidate**
- **cross-origin (Google Fonts/GAS TTS): passthrough**
- `CACHE_NAME = ipasounddrill-v1`、SW 更新時 v2, v3 で自動クリーンアップ
- skipWaiting + clients.claim で 1 度リロードで全タブ整合

### Phase 6: Wordlist CC BY 4.0 公開 (2 PR)

**公開 (#251/#252)**:
- `public/data/wordlist-ga-rp-cefr.csv` (463 KB, UTF-8 BOM, 6 列)
- `public/data/wordlist-ga-rp-cefr.json` (5.2 MB, 全メタデータ)
- `LICENSE.txt` (CC BY 4.0 全文 + 帰属指示)
- `README.md` (列定義 + Python/Node 使用例)
- 6 言語 landing page `/{lang}/data/`: CC BY 4.0 バッジ、5,397 語カウント、ダウンロード CTA 3 種、コピペ可能な帰属記載例、列定義テーブル、Python/Node コード例
- JSON-LD `Dataset` schema.org (Google Dataset Search 対応)
- `llms.txt` に「Free open dataset (CC BY 4.0)」セクション追加

**pos 英語化 (#253)**:
- Naoya 指摘: 公開 CSV/JSON の pos 列が日本語 (「名詞」「動詞」...)
- **重要な発見**: これはバグではなく i18n の翻訳キー ! `apps/web/src/index.template.html:2641` の `posLabel(pos)` が `UI.pos[pos]` で表示時翻訳、`packages/core/i18n/{lang}.json` の `pos.*` が「名詞→noun/명사/名词/...」と多言語マッピング
- 方針: wordlist.json 本体は無変更 (UI/i18n 契約維持)、build 時に公開 CSV/JSON の pos だけ英語化 (`POS_JA_TO_EN` マップ + `posToEnglish()`)
- 単一品詞 17 種と複合品詞 (「名詞 / 動詞」→「noun / verb」) 両方対応

## 主要な設計判断

### 決定 1: Slug は SEO キーワード形、IPA 記号 URL は 301 redirect

Naoya が「SEO slug と IPA 記号の両方を採用したい」と提案。当初「IPA URL は評価が下がる」と誤って推奨したが、確認して以下と判明:
- IPA URL 自体は 301 で転送されるので Google はページ中身を評価しない (転送先を評価)
- SEO 効果は canonical (`/schwa/`) に集約されるので分散しない
- 「URL に非 ASCII が含まれると評価が下がる」というペナルティは存在しない
- 結論: **IPA 記号 URL は 301 redirect で「両取り」実現**

### 決定 2: Deep URL 4 Phase 分割、単語個別 URL 化は不採用

Phase 4 を「音素→代表単語 20 語一覧」の**集約 URL** (45 × 6 = 270) にし、**単語個別 URL 化 (5,397 × 6 = 32K URL) は不採用**。理由:
- Google の thin content 判定リスク (1 単語 = 1 IPA 行では薄い)
- crawl budget 消費
- 集約案でも「schwa word examples」等の検索意図はカバー可能

### 決定 3: PWA Service Worker は「安全な網羅性」を採用

初期案「manifest だけで SW は見送り」から、Naoya の「UX 変わらないなら進めて」で SW も実装。ただし事故リスクを最小化:
- **HTML network-first**: デプロイ後の古い HTML 停滞問題を根絶
- **cache-first は不変アセットのみ** (fonts, core-bundle, icons)
- **依存追加ゼロ** (Workbox 等は避け、100 行未満のプレーン JS)
- **キャッシュバージョニング** で SW 更新時に旧キャッシュ自動削除

### 決定 4: pos 英語化は build 時変換のみ、runtime データは無変更

「公開データセットの pos が日本語」問題は、i18n 契約を壊さないために `writeDataset()` 内で `posToEnglish()` 適用のみ。wordlist.json / runtime `public/data/wordlist.json` / UI code すべて無変更、UX 完全同一。

### 決定 5: middleware.ts の戻り値契約変更

Vercel Edge Middleware の passthrough 実現のため、既存の `Response` 型 → `Response | undefined` に変更。`undefined` 返却で静的ファイル配信に fall through。既存 root routing (`/`) の動作は 100% 保持。

## halt / 想定漏れ / リカバリ

- Phase 4 build 時に `<urlset xmlns` の 2 重挿入 syntax error 発生 → 該当箇所を Read で確認して片方削除、5 秒でリカバリ
- `.gitignore` に `public/data/` を duplicate で追加しかけたが Read で気付いて revert
- `SendUserFile` の相対パス誤り (`cd apps/web` 後のパスで指定失敗) → absolute-ish で再送

## 数値インパクト

**sitemap URL**: 7 → 1,974 (**約 282 倍**)
- 6 root
- 270 音素 + 270 音素代表単語 (Deep URL Phase 1, 4)
- 216 弱形 (Deep URL Phase 2)
- 1,206 句 (Deep URL Phase 3)
- 6 データセット landing

**Ahrefs baseline (2026-07-31 時点)**:
- Organic keywords: 0
- DR: 0
- AI responses: 0 (AI Overviews / ChatGPT / Perplexity / Copilot)
- Referring domains: 149 (質は低い、多くが自動生成)

**GSC baseline (過去 3 か月)**:
- 合計 2 クリック / 28 表示
- 唯一のクエリ: `audio drill app` (ブランデッド近似)
- モバイル 20 表示 vs PC 7 表示 (モバイル優位)

## 後続 (効果測定後に順次判断)

- **2027-01-31 (6 か月後) 効果測定**: GSC の非ブランドクリック / インデックス数 / 8-20 位クエリ / AI 検索経由参照
- **教育者向けページ + iframe 埋め込み**: ページ構築は Claude 自律で可能、被リンク獲得は Naoya のアウトリーチが必須のため未着手
- **SW 更新通知バナー UI**: SW v2 リリース時に「新しい版が利用可能」通知が欲しくなったら別 Issue
- **Wordlist の他フィールド正規化**: pos は英語化済み、他 (respell の欠損、CEFR 未設定 652 語等) は必要に応じて別 Issue

## 参考: memory 更新

- `[[project-seo-deep-url-baseline]]` (2026-07-31 追加): sitemap 7→1,974 の成長、効果測定タイミング、後続施策候補、Deep URL 生成技術知識、middleware 拡張時の注意
