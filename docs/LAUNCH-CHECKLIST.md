# LAUNCH-CHECKLIST — IPA Sound Drill 世界公開ローンチ

- **ターゲット公開日**: 2026-07-20（海の日）
- **公開 URL**: https://ipasounddrill.app
- **リポジトリ**: https://github.com/nkhippo/IPASoundDrill

このファイルはローンチまでの日次タスク管理。各タスクは Issue として起票し、URL を右端に記録する。全ての作業は Track A 範囲内。Track B のスコープはローンチ後に別 CHECKLIST を作成する。

進捗記号: `[ ]` 未着手 / `[/]` 進行中 / `[x]` 完了

---

## Day 1: 7/10（木）— 基盤確定 ✅

- [x] ドメイン取得 `ipasounddrill.app`（Hostinger、Order #207945639）
- [x] Track A/B 分離方針決定
- [x] 開発フロー・Issue タイプ・AI 履歴戦略・ブランド方針の壁打ち完了
- [x] `CLAUDE.md` / `.cursor/rules/dev-flow.mdc` / Issue Template 3種の作成（Claude 側）
- [x] GitHub Actions workflow 3種の準備（Claude 側）
- [x] `docs/LAUNCH-CHECKLIST.md` / `OPERATIONS.md` / `bug-knowledge.md` 骨格作成（Claude 側）
- [x] Cursor セットアップ指示書 + Vercel 移管 Issue 草稿（Claude 側）

---

## Day 2: 7/11（金）— 運用体系配置 + 技術移管

### タスク

- [ ] Cursor に「Setup 指示書」を渡してリポに全ファイル配置（PR #1: `chore: setup ipasounddrill governance`）
- [ ] PR #1 マージ後、Branch Protection on `main` 設定（PR 経由必須、force push 禁止）
- [ ] GitHub Secrets 登録: `CURSOR_AUTOMATION_WEBHOOK_URL` / `CURSOR_AUTOMATION_WEBHOOK_TOKEN`
- [ ] Issue #2 起票: `chore: Vercel + rename + custom domain migration` — Vercel 移管 Issue 草稿を Claude が MCP 経由で起票
- [x] リポ名は `IPASoundDrill` で確定（`ipasounddrill` へのリネームは実施しない）
- [ ] ローカル環境の remote 更新（Naoya + Cursor 側）
- [ ] Vercel プロジェクト作成、リポ接続
- [ ] Vercel カスタムドメイン設定（`ipasounddrill.app`）、DNS 設定
- [ ] TLS 証明書自動発行の確認
- [ ] GitHub Pages 停止（Vercel 動作確認後）

### 関連 Issue

- Issue #1: chore: setup ipasounddrill governance — <!-- URL -->
- Issue #2: chore: Vercel + rename + custom domain migration — <!-- URL -->

### 完了定義

- [ ] `https://ipasounddrill.app` にアクセスして現行 UI が表示される
- [ ] HTTPS が有効（`.app` ドメインは強制 HTTPS）
- [ ] TTS が動作する（GAS 経由）

---

## Day 3: 7/12（土）— 専用 MCP サーバー + データ整合性検証

### タスク

- [ ] 独自ドメインで48時間安定稼働の確認
- [ ] Issue #3 起票: `chore: setup dedicated MCP server on Railway`
- [ ] ThinkGrindAi の MCP サーバーコードを IPA Sound Drill 用にフォーク
- [ ] 環境変数変更（`REPO_NAME=ipasounddrill`）
- [ ] Railway で新プロジェクト作成、デプロイ
- [ ] Claude Desktop / claude.ai に新 MCP コネクタを登録
- [ ] `get_file_content` / `list_directory` / `create_issue` / `add_issue_comment` / `get_pull_request` の動作確認
- [ ] Vercel デプロイパイプラインのテスト（`docs/README.md` の軽微修正 PR で確認）

### 関連 Issue

- Issue #3: chore: setup dedicated MCP server on Railway — <!-- URL -->

### 完了定義

- [ ] Claude が MCP 経由で `ipasounddrill` リポの `CLAUDE.md` を取得できる
- [ ] Claude が MCP 経由で Issue を起票できる
- [ ] Vercel の Preview URL が PR ごとに自動生成される

---

## Day 4: 7/13（日）— 法務ドキュメント

### タスク

- [ ] Issue #4 起票: `docs: add Terms of Service and Privacy Policy`
- [ ] Terms of Service（英・日）作成
  - サービスの目的、無保証、利用制限、免責、準拠法
- [ ] Privacy Policy（英・日）作成
  - 収集する情報（localStorage のみ、個人情報なし）
  - Cookie の不使用（クッキーレス設計）
  - GDPR 対応（EEA ユーザー向けの明示）
  - お問い合わせ先
- [ ] `docs/legal/terms-en.md` / `terms-ja.md` / `privacy-en.md` / `privacy-ja.md` として配置
- [ ] `index.html` の footer にリンク追加

### 関連 Issue

- Issue #4: docs: add Terms of Service and Privacy Policy — <!-- URL -->

### 完了定義

- [ ] footer からリンクが動作
- [ ] 英・日切替に対応

---

## Day 5: 7/14（月）— 計測タグ + フィードバック導線

### タスク

- [ ] Plausible or Simple Analytics アカウント作成、`ipasounddrill.app` 登録
- [ ] Issue #5 起票: `feat: add Plausible analytics tag`
- [ ] `index.html` にスクリプトタグ追加（クッキーレス、privacy-friendly）
- [ ] カスタムイベント設計（モード開始 / 正解 / 誤答 / 言語切替 / GA↔RP 切替）
- [ ] Issue #6 起票: `feat: add feedback form (Tally)`
- [ ] Tally form 作成、footer にリンク追加
- [ ] お問い合わせ用メールアドレス（`hello@ipasounddrill.app` 等）検討・設定
- [ ] X (旧 Twitter) 公式アカウント検討・作成（日英別 or 共通）

### 関連 Issue

- Issue #5: feat: add Plausible analytics tag — <!-- URL -->
- Issue #6: feat: add feedback form (Tally) — <!-- URL -->

### 完了定義

- [ ] Plausible の dashboard に本番トラフィックが表示される
- [ ] Tally form 送信でメール通知が届く

---

## Day 6: 7/15（火）— ブランド素材 + 公開向け UI

### タスク

- [ ] Issue #7 起票: `feat: add branding assets (OGP, favicon)`
- [ ] favicon 作成（`.ico` + `.png` 32x32, 192x192, 512x512）
- [ ] apple-touch-icon（180x180）
- [ ] OGP 画像作成（1200x630、`ipasounddrill.app` のブランドカラー + IPA 記号のモチーフ）
- [ ] `<meta>` タグ整備（og:title / og:description / og:image / twitter:card）
- [ ] Issue #8 起票: `chore: launch-ready UI polish`
- [ ] トップページの初期表示メッセージを英語ローンチ向けに最適化
- [ ] 「Get started」CTA の視認性向上
- [ ] TTS 初回タップ促しの UI 確認
- [ ] モバイル表示の最終チェック

### 関連 Issue

- Issue #7: feat: add branding assets — <!-- URL -->
- Issue #8: chore: launch-ready UI polish — <!-- URL -->

### 完了定義

- [ ] Twitter / X 上で URL を貼ると OGP プレビューが表示される
- [ ] iOS Safari で "ホーム画面に追加" 時に apple-touch-icon が表示される

---

## Day 7: 7/16（水）— 英語 LP または既存トップの英語化強化

> このフェーズは **新 Chat に切り出し推奨**（デザイン議論はコンテキストが重い）。

### タスク

- [ ] 判断: 専用 LP を分ける vs 既存トップの英語化で乗り切る
- [ ] 判断が「専用 LP」なら Issue #9 起票: `feat: create English landing page`
- [ ] 判断が「既存トップ強化」なら Issue #9 起票: `chore: enhance existing top for English audience`
- [ ] 実装
- [ ] Product Hunt / Show HN の訪問者導線の動作確認

### 関連 Issue

- Issue #9: <!-- 判断次第 -->

### 完了定義

- [ ] Product Hunt からのアクセスで最適な着地体験

---

## Day 8: 7/17（木）— デモ素材制作

### タスク

- [ ] Issue #10 起票: `chore: prepare launch media assets`
- [ ] デモ動画（30秒〜1分）収録: Decode → Encode → Mode B → Vocab browser
- [ ] Kap / CleanShot X で GIF 作成
- [ ] スクリーンショット 3〜5 枚（各モードの特徴的な画面）
- [ ] タグライン最終確定
  - 英: 候補から選択
  - 日: 候補から選択
- [ ] `README.md` を英語ローンチ向けに全面更新（デモ GIF 埋め込み、機能紹介、ロゴ）

### 関連 Issue

- Issue #10: chore: prepare launch media assets — <!-- URL -->

### 完了定義

- [ ] GIF はファイルサイズ 5MB 以内、GitHub / Product Hunt で埋め込み可能
- [ ] タグライン英・日確定

---

## Day 9: 7/18（金）— 英語コピー + 告知素材

> このフェーズも **新 Chat に切り出し推奨**（英語コピーライティングは別スキルセット）。

### タスク

- [ ] Product Hunt 用素材
  - Tagline（60文字以内）
  - Description（260文字以内）
  - Maker Comment（launch 日に投稿する開発者コメント）
  - Gallery（動画1 + スクリーンショット3〜5）
- [ ] Show HN 投稿文
- [ ] Reddit 投稿文
  - r/languagelearning
  - r/EnglishLearning
  - r/phonetics
- [ ] X 告知スレッド（日本語版）
- [ ] X 告知スレッド（英語版）
- [ ] Indie Hackers 投稿文
- [ ] Product Hunt の launch 日を予約（推奨: 7/20 現地時間 00:01 PST）

### 関連 Issue

- Issue #11: chore: launch copy drafts — <!-- URL -->

### 完了定義

- [ ] 全プラットフォーム分の投稿文が確定
- [ ] 予約が完了

---

## Day 10: 7/19-20 — 最終リハーサル + ローンチ

### 7/19（土）タスク

- [ ] 全動線チェック（Chrome / Firefox / Safari）
- [ ] モバイル動作確認（iOS Safari / Android Chrome）
- [ ] TTS 初回タップ、連続再生、GA↔RP 切替
- [ ] 6言語切替チェック
- [ ] 計測タグ動作確認（Plausible にリアルタイムで表示されるか）
- [ ] フィードバック導線動作確認（Tally form 送信テスト）
- [ ] 法務リンク動作確認
- [ ] OGP プレビュー最終確認
- [ ] メンタルリセット、7/20 の投稿タイミングを最終確認

### 7/20（日・海の日）タスク

- [ ] Product Hunt 公開（00:01 PST）
- [ ] Show HN 投稿
- [ ] Reddit 3板に投稿
- [ ] X（日本語アカウント）で告知スレッド
- [ ] X（英語アカウント）で告知スレッド
- [ ] Indie Hackers 投稿
- [ ] 初期フィードバック監視（Plausible / Tally / X mentions / PR コメント）
- [ ] Critical バグ発生時は Hotfix フロー起動

### ローンチ日の緊急対応

Hotfix フローは `CLAUDE.md` を参照。以下の条件を満たすもののみ Hotfix として扱う:
- 影響ファイルが 3 つ以下
- 既存仕様への復帰のみ
- UX 変更を伴わない

該当しないバグは `track-b` ラベルで Issue 起票、ローンチ後の Track B で対応。

---

## Track B（2026-07-21〜）— スコープメモ

以下はローンチ後に着手する Track B のスコープ。今回の CHECKLIST の対象外。

- React + Vite 化（既存の単一 HTML → コンポーネント分割）
- BE の Railway 化（GAS TTS からの脱却、Claude API 直接呼び出し）
- BYOK（ユーザー自身の API キー入力）実装
- Sentry 導入
- Playwright + Visual Regression Test
- develop-first ブランチ運用への切り替え
- Storybook 導入
- ADR ディレクトリの本格運用

---

## メトリクス（ローンチ後追跡）

初期 KPI 案:
- Product Hunt: Upvotes 目標、コメント数
- Show HN: Points、コメント数
- Reddit: Upvotes、コメント数
- サイトアクセス: 初日 UU、7日 UU
- Tally form フィードバック件数
- X mentions 数

これらは Track B の月次 Opus レビューに引き継ぐ。
