# LAUNCH-CHECKLIST — IPA Sound Drill 世界公開ローンチ

- **プロダクト名**: IPA Sound Drill
- **公開 URL**: https://ipasounddrill.app
- **リポジトリ**: https://github.com/nkhippo/IPASoundDrill
- **ローンチ目標**: 2026-07-12〜13（早期ローンチ、Product Hunt は事前予約なしで直接投稿）
- **管理方針**: Phase = トピック単位。**日付は目安のみ**、実際は依存関係と作業スピードで動的に前後する

このファイルはローンチまでの Phase 別タスク管理。各タスクは Issue として起票し、URL を右端に記録する。全ての作業は Track A 範囲内。Track B のスコープはローンチ後に別 CHECKLIST を作成する。

進捗記号: `[ ]` 未着手 / `[/]` 進行中 / `[x]` 完了

---

## Phase 0: 基盤確定 ✅ 完了（2026-07-10）

- [x] ドメイン取得 `ipasounddrill.app`（Namecheap / BasicDNS、AUTO-RENEW ON、次回更新 2027-07-11）
- [x] Track A/B 分離方針決定
- [x] 開発フロー・Issue タイプ・AI 履歴戦略・ブランド方針の壁打ち完了

---

## Phase 1: 運用体系 ✅ 完了（2026-07-11 〜 2026-07-12）

- [x] CLAUDE.md、.cursor/rules/dev-flow.mdc、Issue Template 3 種、Workflow 3 種の作成（Issue #1 / PR #2）
- [x] docs/LAUNCH-CHECKLIST.md（旧版）、OPERATIONS.md、bug-knowledge.md 骨格作成
- [x] Labels seed（Issue #3）
- [x] Branch Protection on main（GitHub Rulesets、PR 必須 + force push 禁止）
- [x] GitHub Secrets 登録（`CURSOR_AUTOMATION_WEBHOOK_URL` / `CURSOR_AUTOMATION_WEBHOOK_TOKEN`）
- [x] Cursor Automation `IPASoundDrill ready-for-cursor` 作成、webhook 疎通確認済み（Cloud Agent 起動は `resource_exhausted` のため見送り、追加コストなしで現状 OK）
- [x] docs/CHANGE-CLASSIFICATION.md 導入（Issue #33 / PR #34）
- [x] docs/DEV-GUARDRAILS.md § 3-alt パターン C + § 10 セルフチェックリスト追加（Issue #35 / PR #36）
- [x] docs/OPERATIONS.md § 2.4-2.5 Vercel Build 失敗時 rollback + 事前チェックリスト追加（Issue #37 / PR #38）

---

## Phase 2: 技術移管 ✅ 完了（2026-07-11 〜 2026-07-12）

- [x] Vercel プロジェクト作成、`IPASoundDrill` リポ接続（プロジェクト名: `ipa-sound-drill`）
- [x] カスタムドメイン `ipasounddrill.app` / `www.ipasounddrill.app` 設定
- [x] DNS 設定（Namecheap Advanced DNS）: A `216.198.79.1` / CNAME `52646c530fa600df.vercel-dns-017.com.`
- [x] TLS 証明書自動発行確認（Let's Encrypt、90 日ごと自動更新、`.app` 強制 HTTPS）
- [x] `https://ipasounddrill.app` で現行 UI 表示確認
- [x] GitHub Pages 停止（Issue #7 / PR #8、Settings > Pages = None）
- [x] リポ名 `IPASoundDrill` で確定（`ipasounddrill` へのリネームは実施しない）
- [x] docs/OPERATIONS.md を Namecheap + 実 DNS 値に更新（Issue #10 / PR #11）
- [x] docs/LAUNCH-CHECKLIST.md（旧版）Day 1/2 進捗反映（Issue #10 で対応）

### 関連 Issue

- Issue #4 / PR #5: Vercel + custom domain migration
- Issue #7 / PR #8: remove GitHub Pages workflow
- Issue #10 / PR #11: repo name unification + OPERATIONS Namecheap 反映

---

## Phase 3: 専用 MCP サーバー ✅ 完了（2026-07-12）

- [x] ThinkGrindAi `backend` から MCP / OAuth / GitHub ツールのみ抽出、`nkhippo/ipasounddrill-mcp` に配置
- [x] Railway プロジェクト `IPASoundDrill` にデプロイ（ThinkGrindAi とは別プロジェクト）
- [x] IPASoundDrill 専用 GitHub OAuth App + claude.ai コネクタ `IPASoundDrill GitHub` 登録
- [x] MCP エンドポイント: `https://ipasounddrill-production.up.railway.app/mcp`
- [x] `get_file_content` / `list_directory` / `create_issue` / `add_issue_comment` / `get_pull_request` の動作確認（Issue #13 で試験成功）
- [x] docs/OPERATIONS.md / CLAUDE.md に MCP URL・コネクタ名反映（Issue #12 / PR #14）
- [ ] Issue #13（試験 Issue）を Close（任意、機能上は影響なし）

### 関連 Issue

- Issue #12 / PR #14: setup dedicated MCP server on Railway

---

## Phase 4: 計測 + フィードバック導線 ✅ 完了（2026-07-12〜13）

### タスク

- [x] Vercel Web Analytics 有効化（Vercel Dashboard > Analytics タブ）— **Naoya 手動**（Issue #19）
- [x] `src/index.template.html` に Vercel Analytics script タグ追加（Issue #43）
- [ ] カスタムイベント実装（JS 経由で `window.va?.track()` 呼び出し）— Track B
  - `mode_start`（props: mode="decode"/"encode"/"modeb"/"vocab_browser"）
  - `answer_correct`（props: mode, cefr）
  - `answer_wrong`（props: mode, cefr）
  - `language_switch`（props: to）
  - `accent_switch`（props: to="ga"/"rp"）
  - `tts_play`（props: context="word"/"phrase"/"weak"）
- [x] Tally form 作成完了、URL: https://tally.so/r/xX1axk（Naoya 手動）
- [x] footer に「Feedback」ボタン追加（Tally Popover、Issue #48）
- [x] X プロフィールリンク追加（`https://x.com/nkhippo123`、Issue #48）
- [x] docs/OPERATIONS.md § 5「計測タグ管理」を Plausible → Vercel Analytics に書き換え（Issue #43）

### 関連 Issue

- Issue E1: [feat: integrate Vercel Web Analytics tracking tag](https://github.com/nkhippo/IPASoundDrill/issues/43)
- Issue E2: [feat: Tally feedback popover + X link in footer](https://github.com/nkhippo/IPASoundDrill/issues/48)

### 完了定義

- [x] Vercel Dashboard > Analytics タブに本番トラフィックが表示される（Issue #43 / PR #44 マージ後、2026-07-12 確認: Visitors 1 / Page Views 1 / `/fil`）
- [ ] カスタムイベント 6 種が全て記録される（Track B）
- [x] Tally form 送信で Naoya のメールに通知が届く（Issue #48、マージ後 Naoya 確認）
- [x] footer から Tally form / X リンクが動作する（Issue #48）
- [x] docs/OPERATIONS.md § 5 が Vercel Analytics 記述に更新されている（Issue #43）

---

## Phase 5: SEO 基本セット ✅ 完了（2026-07-12〜13）

### 方針: サブディレクトリ + ビルド時プリレンダリング

Track A で「単一 HTML + JS 動的更新」ではなく、以下の構成を採用する。多言語 SEO / AI クローラー対応のベストプラクティスに準拠。

- 言語別サブディレクトリ（`/en/`, `/ja/`, `/ko/`, `/zh-Hans/`, `/zh-Hant/`, `/fil/`）
- 各言語別に静的 HTML をビルド時生成（`scripts/build-i18n-html.js`）
- 各言語 HTML の `<head>` に静的な meta / OGP / Twitter Card / canonical / hreflang / og:locale
- Vercel の rewrites/redirects で URL 制御
- Edge Middleware（任意）で Accept-Language 自動判定 → 302 リダイレクト
- 単一 sitemap.xml で全言語の hreflang alternates 宣言
- 各言語版の llms.txt

Issue F1（i18n meta 追加、#25）でデータ側は既に整備済み。Issue F2 で本体実装。

### タスク

- [x] `scripts/build-i18n-html.js` 新規追加（i18n/*.json の meta を index.html テンプレートに埋め込み、6 言語版 HTML 生成）（Issue #39）
- [x] `src/index.template.html` 新規追加（既存 index.html から meta 部分をテンプレート化）（Issue #39）
- [x] `vercel.json` に rewrites/redirects 設定追加（Issue #39）
- [x] `middleware.ts`（任意、Accept-Language 判定）（Issue #39、Preview で PoC）
- [x] 各言語版 HTML の head に以下を静的埋め込み（Issue #39）:
  - `<title>`（i18n の `meta.title`）
  - `<meta name="description">`（i18n の `meta.description`）
  - `<meta property="og:*">`（title / description / url / locale）
  - `<meta name="twitter:*">`（card / title / description）
  - `<link rel="canonical">`（自己参照、例: `https://ipasounddrill.app/en/`）
  - `<link rel="alternate" hreflang="xx">` × 6 言語 + `x-default`
  - `<html lang="xx">`（静的埋め込み）
  - JSON-LD 構造化データ（WebApplication schema）
- [x] JS 側の `applyI18n()` で `document.title` を `t("meta.title")` に切替（既存）+ URL グラウンドトゥルース（Issue #39）
- [x] 言語は `/{lang}/` URL 自体で決定（`?lang=` は不使用）（Issue #39）
- [x] sitemap.xml 新規（6 言語 URL × hreflang alternates）（Issue #41）
- [x] robots.txt 新規（Sitemap 参照）（Issue #41）
- [x] llms.txt 新規（英語版、AI クローラー向けサマリ。各言語版は Track B）（Issue #41）

### 関連 Issue

- Issue F2: [feat: SEO subdirectory prerendering + full multi-language head meta](https://github.com/nkhippo/IPASoundDrill/issues/39)
- Issue F3: [feat: sitemap.xml + robots.txt + llms.txt](https://github.com/nkhippo/IPASoundDrill/issues/41)
- Issue（先行 1）: [docs: add hardening pattern C to DEV-GUARDRAILS](https://github.com/nkhippo/IPASoundDrill/issues/35)
- Issue（先行 2）: [docs: add Vercel Build failure rollback procedure to OPERATIONS](https://github.com/nkhippo/IPASoundDrill/issues/37)

### 完了定義

- [x] `https://ipasounddrill.app/en/` `https://ipasounddrill.app/ja/` 等 6 URL がすべて 200 で返る（マージ後 Production / Preview で確認）
- [x] `https://ipasounddrill.app/` にアクセスすると Accept-Language に応じて言語別 URL に 302 リダイレクト（`middleware.ts`、失敗時は C1 `/en/` 固定）
- [x] 各言語版 HTML の View Source（JS 実行前）で meta description / OGP / hreflang / canonical / html lang が正しく設定される
- [ ] Twitter Card Validator / Facebook Sharing Debugger で 6 言語すべての OGP プレビューが正しく表示される（Preview URL で Naoya 目視）
- [ ] Google Rich Results Test で JSON-LD が Valid 判定（6 言語すべて）（Preview URL で Naoya 目視）
- [x] `https://ipasounddrill.app/sitemap.xml` にアクセス可能、6 言語 × hreflang alternates が含まれる（Issue #41）
- [x] `https://ipasounddrill.app/robots.txt` にアクセス可能（Issue #41）
- [x] `https://ipasounddrill.app/llms.txt` にアクセス可能（英語版のみ、各言語版は Track B）（Issue #41）

---

## Phase 6: 法務ドキュメント 📋 未着手（Issue G1 / G2）

### タスク

- [ ] Terms of Service（英・日）作成
  - サービスの目的、無保証、利用制限、免責、準拠法
- [ ] Privacy Policy（英・日）作成
  - 収集する情報（localStorage のみ、個人情報なし）
  - Cookie の不使用（クッキーレス設計）
  - Vercel Web Analytics の記述（Cookie 未使用の明示、GDPR 対応）
  - 問い合わせ先（X DM or Tally）
- [ ] `docs/legal/terms-en.md` / `terms-ja.md` / `privacy-en.md` / `privacy-ja.md` として配置
- [ ] `index.html` の footer にリンク追加（現在言語で切替）
- [ ] i18n に「Terms of Service」「Privacy Policy」の翻訳キー追加（6 言語分、他言語は英語 fallback 可）

### 関連 Issue

- Issue G1: docs: add Terms of Service and Privacy Policy files — <!-- URL 起票後記入 -->
- Issue G2: feat: add footer links to legal pages — <!-- URL 起票後記入 -->

### 完了定義

- [ ] footer から Terms / Privacy へのリンクが動作
- [ ] 英・日切替に対応
- [ ] Vercel Analytics 利用の記述が Privacy に含まれる

---

## Phase 7: ブランド素材メタタグ 📋 未着手（Issue H）

メタタグ実装のみ。画像素材本体は Phase 10a で Naoya さんが準備。

### タスク

- [ ] `<link rel="icon">` / `<link rel="apple-touch-icon">` を head に追加
- [ ] OGP 画像 URL を og:image / twitter:image に反映
- [ ] Web App Manifest（`manifest.json`）作成、`<link rel="manifest">` を head に追加
  - name / short_name / icons / start_url / display / theme_color / background_color
- [ ] favicon 各サイズ（32x32、192x192、512x512）の参照設定
- [ ] apple-touch-icon（180x180）の参照設定

### 関連 Issue

- Issue H: feat: add branding meta tags (favicon, OGP, manifest) — <!-- URL 起票後記入 -->

### 完了定義

- [ ] ブラウザタブに favicon が表示される
- [ ] iOS Safari で「ホーム画面に追加」時に apple-touch-icon が表示される
- [ ] Web App Manifest が Chrome DevTools > Application で Valid 表示
- [ ] Twitter / X で URL 展開時に OGP プレビューが表示される

### 依存

- Phase 10a（画像素材制作）の完了が実装完了の前提

---

## Phase 8: UI polish 📋 未着手（Issue I1 / I2）

### タスク

- [ ] トップページの初期表示メッセージを英語ローンチ向けに最適化
- [ ] 「Get started」/「はじめる」CTA の視認性向上
- [ ] TTS 初回タップ促し UI の確認・改善
- [ ] モバイル表示の最終チェック（iOS Safari / Android Chrome）
- [ ] Vercel Web Analytics の実装確認（Phase 4 完了後）

### 関連 Issue

- Issue I1: chore: launch-ready English copy update — <!-- URL 起票後記入 -->
- Issue I2: chore: launch-ready CTA visibility + mobile fixes — <!-- URL 起票後記入 -->

### 完了定義

- [ ] トップページで初回訪問者が迷わず CTA に到達できる
- [ ] モバイル 2 機種以上で崩れなし
- [ ] Product Hunt からの流入で最適な着地体験

---

## Phase 9: 英語 LP or 既存トップ強化 📋 未着手（Issue J）

### タスク

- [ ] 判断: 専用 LP を分ける vs 既存トップの英語化で乗り切る
- [ ] 判断が「専用 LP」なら Issue 起票: `feat: create English landing page`
- [ ] 判断が「既存トップ強化」なら Issue 起票: `chore: enhance existing top for English audience`
- [ ] 実装

### 関連 Issue

- Issue J: <!-- 判断次第 -->

### 完了定義

- [ ] Product Hunt / Show HN からのアクセスで最適な着地体験
- [ ] IPA の説明が英語で明確

---

## Phase 10: 素材制作（Naoya 手作業） 📋 未着手

Cursor / Claude では作れない、Naoya さんの手作業スコープ。

### 10a: 画像素材

- [ ] favicon 元画像デザイン（`.ico` + `.png` 32x32, 192x192, 512x512）
- [ ] apple-touch-icon（180x180）
- [ ] OGP 画像(1200x630、ブランドカラー `#0C7C7E` + IPA 記号のモチーフ)
- [ ] 画像ファイルをリポにコミット（Issue H で参照される）

### 10b: デモ素材

- [ ] デモ動画収録（30-60 秒、Decode → Encode → Mode B → Vocab browser）
- [ ] Kap / CleanShot X で GIF 作成（ファイルサイズ 5MB 以内）
- [ ] スクリーンショット 3-5 枚（各モードの特徴的な画面）

### 10c: タグライン最終確定

英候補:
- `Drill your English sounds with IPA.`（現行仮）
- `Master English pronunciation, sound by sound.`
- `The IPA-driven pronunciation drill.`
- `Unlearn your accent. Rebuild from sound.`

日候補:
- `IPA で、英語の音をドリルする。`（現行仮）
- `音でドリル、IPA で解剖。`
- `発音を、音から練り直す。`
- `IPA ベースの発音ドリル。`

### 10d: 告知コピー

- [ ] Product Hunt 素材（Tagline 60 字以内、Description 260 字以内、Maker Comment、Gallery）
- [ ] Show HN 投稿文
- [ ] Reddit 投稿文（r/languagelearning / r/EnglishLearning / r/phonetics）
- [ ] X 告知スレッド（日本語版）
- [ ] X 告知スレッド（英語版）
- [ ] Indie Hackers 投稿文
- [ ] README.md を英語ローンチ向けに全面更新（デモ GIF 埋め込み、機能紹介）

### 10e: アカウント準備

- [ ] X 公式アカウント検討・作成（日英共通 or 別）
- [ ] お問い合わせ用メール検討（例: `hello@ipasounddrill.app`）
- [ ] Product Hunt アカウント確認

---

## Phase 11: 最終リハーサル 📋 未着手

Phase 4-10 完了後、ローンチ直前に実施。

- [ ] 全動線チェック（Chrome / Firefox / Safari）
- [ ] モバイル動作確認（iOS Safari / Android Chrome）
- [ ] TTS 初回タップ、連続再生、GA↔RP 切替
- [ ] 6 言語切替チェック（ja / en / ko / zh-Hans / zh-Hant / fil）
- [ ] Vercel Web Analytics 動作確認（リアルタイム表示、カスタムイベント記録）
- [ ] Tally form 送信テスト
- [ ] 法務リンク動作確認
- [ ] OGP プレビュー最終確認（Twitter Card Validator、Facebook Sharing Debugger）
- [ ] Google Rich Results Test で JSON-LD Valid 判定
- [ ] hreflang / sitemap / robots.txt 最終確認
- [ ] メンタルリセット、投稿タイミング最終確認

---

## Phase 12: ローンチ実行 📋 未着手

### 実行タスク

- [ ] Product Hunt 投稿（事前予約なしで直接投稿）
- [ ] Show HN 投稿
- [ ] Reddit 3 板に投稿
- [ ] X（日本語アカウント）で告知スレッド
- [ ] X（英語アカウント）で告知スレッド
- [ ] Indie Hackers 投稿
- [ ] 初期フィードバック監視（Vercel Analytics / Tally / X mentions / GitHub Issue）

### 緊急対応

Hotfix フローは `CLAUDE.md` を参照。以下 3 条件をすべて満たすときのみ Hotfix として扱う:
1. 影響ファイルが 3 つ以下
2. 既存仕様への復帰のみ
3. UX 変更を伴わない

該当しないバグは `track-b` ラベルで Issue 起票、Track B で対応。

---

## 運用ルール: Pre-Issue Recon（Issue #26 実証済み）

### 適用条件

以下のいずれかに該当する Issue は、起票前に Pre-Issue Recon を実施することを推奨:

- 影響ファイル 3 個以上、かつ変更行数の推定が 100 行を超える
- Claude が既存コード構造を正確に把握できていない
- `index.html`（3,259 行）の JS 関数構造への変更を含む
- 複数の設計選択肢があり、事実確認で選定が明確化する場合

### 実施フロー

1. Claude が Issue Comment で Recon 依頼を投稿（`docs/CURSOR-INSTRUCTION-GUIDE.md` § 4.2 テンプレート）
2. Cursor が調査を実施、`docs/cursor/recon/pre-issue-recon-YYYYMMDD-<topic>.md` に結果を出力
3. Recon PR がマージされた後、Claude が結果を MCP で取得
4. Claude が Recon 結果を反映した Issue 本文を作成 → Naoya さん承認
5. 本 Issue（実装 Issue）を MCP 起票、Cursor 実装

### 効果（Issue #26 の実績）

- Claude のトークン消費削減（index.html 全 3,259 行を取得せずに設計可能）
- Issue 本文の設計精度向上（例: `?lang=` パラメータが未実装であることが Recon で判明、当初設計を修正）
- Cursor の実装成功率向上（現状把握が正確なため中断リスク低下）

---

## Track B（ローンチ後）— スコープメモ

以下はローンチ後に着手する Track B のスコープ。今回の CHECKLIST の対象外。

- React + Vite 化（既存の単一 HTML → コンポーネント分割）
- BE の Railway 化（GAS TTS からの脱却、Claude API 直接呼び出し）
- BYOK（ユーザー自身の API キー入力）実装
- Sentry 導入
- Playwright + Visual Regression Test
- develop-first ブランチ運用への切り替え
- Storybook 導入
- ADR ディレクトリの本格運用

### Phase B-Lang: 追加言語対応（一括）

Track A の 6 言語（ja / en / ko / zh-Hans / zh-Hant / fil）に加え、以下 7 言語を一括対応する。優先度は英語学習市場規模 + IPA 学習親和性で決定:

| 優先 | 言語コード | 言語名 | 主要市場 | 特記事項 |
|:---:|:---:|---|---|---|
| 1 | `es` | スペイン語 | 中南米 + スペイン | 表音性が高く IPA 親和性最高 |
| 2 | `pt-BR` | ブラジルポルトガル語 | ブラジル | 英語学習需要が最大級 |
| 3 | `vi` | ベトナム語 | ベトナム | 声調言語、若年層の英語学習需要が急伸 |
| 4 | `id` | インドネシア語 | インドネシア | 東南アジア最大市場、fil と補完的 |
| 5 | `th` | タイ語 | タイ | 声調言語、発音学習の潜在需要が高い |
| 6 | `hi` | ヒンディー語 | インド | 母語干渉学習需要 |
| 7 | `ar` | アラビア語 | 中東・北アフリカ | 母音構造が英語と大きく異なる、IPA 価値高 |

各言語追加の Issue には、i18n JSON 追加、`lang_opts` 追加、`meta` オブジェクト追加、音素解説（`i18n/phonemes/{lang}.json`）追加、ネイティブレビュー、が含まれる。

Phase 5 の SEO 基本セット（サブディレクトリ + プリレンダリング）が Track A で完成しているため、Phase B-Lang では上記 7 言語のサブディレクトリ・sitemap・hreflang エントリを追加するのみでよい。設計変更は不要。

---

## メトリクス（ローンチ後追跡）

初期 KPI 案:
- Product Hunt: Upvotes 目標、コメント数
- Show HN: Points、コメント数
- Reddit: Upvotes、コメント数
- サイトアクセス: 初日 UU、7 日 UU（Vercel Analytics）
- Tally form フィードバック件数
- X mentions 数

これらは Track B の月次 Opus レビューに引き継ぐ。
