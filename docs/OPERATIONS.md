# OPERATIONS — ipasounddrill 運用マニュアル

このドキュメントは本番運用中のトラブル対応と定常オペレーション手順。CLAUDE.md の Track A/B 分離方針、`REPOSITORY-STRUCTURE.md` のランタイム契約を前提とする。

---

## 1. Vercel デプロイ

### 1.1 通常デプロイ（自動）

`main` に PR がマージされると Vercel が自動でデプロイする。所要時間: 30〜60秒。

- ビルドコマンド: `node scripts/build-i18n-html.js`（F2 で導入）
- 出力ディレクトリ: リポジトリルート（`/en/`〜`/fil/` を含む、生成物）
- Vercel ダッシュボード: https://vercel.com/nkhippo/ipa-sound-drill

### 1.2 Preview デプロイ

`main` 以外のブランチに push すると Preview URL が自動生成される。PR コメントに URL が投稿される。デグレ検知に活用する。

### 1.3 デプロイ失敗時の対応

1. Vercel ダッシュボード > Deployments タブでビルドログを確認
2. よくある原因:
   - JSON ファイルの構文エラー（`wordlist_GA_a1a2_plus_phonics.json` の破損）
   - ファイル参照パスの誤り（大文字小文字の違い）
   - 静的サイト設定の変更
3. `git revert <SHA>` で問題コミットを取り消し、push → 再デプロイ

---

## 2. Rollback（緊急切り戻し）

### 2.1 Vercel ダッシュボードでの Rollback（推奨、最速）

1. https://vercel.com/nkhippo/ipa-sound-drill/deployments
2. 過去の Production デプロイの三点メニュー → "Promote to Production"
3. 数秒で切り戻し完了、DNS 変更不要

これを使えば直前の安定版に 30秒以内で戻せる。ローンチ中の緊急時はまずこれ。

### 2.2 Git 経由の Rollback

Vercel dashboard にアクセスできない場合:

```bash
# 直近のマージコミットを打ち消す
git revert -m 1 <MERGE_COMMIT_SHA>
git push origin main
```

自動デプロイが走り、切り戻される。所要 30-60秒。

### 2.3 完全にサービスを停止する場合

Vercel dashboard > Settings > Production Branch → 空文字列に設定し保存。数秒でサービス停止。復旧時は `main` に戻す。

### 2.4 Vercel Build 失敗時の対応

**Vercel Build 失敗の性質**

Vercel Build の失敗は、既存 § 1.3「デプロイ失敗時の対応」の静的サイト前提の失敗（JSON 構文エラー、ファイル参照誤り等）とは異なる性質を持つ:

- Build Command 実行時のエラー（例: `npm run build` の非 0 終了、スクリプトのバグ、環境変数不足）
- 依存関係インストールエラー（`npm install` 失敗、lockfile 不整合、レジストリアクセス不能）
- Node.js バージョン不整合（`.nvmrc` / `package.json` の `engines` フィールドと Vercel 環境の差異）
- Output Directory 誤設定（生成物が指定ディレクトリに存在しない、Vercel が空を配信）
- Build Command のタイムアウト（デフォルト 45 分）
- 生成物の致命的欠陥（Build は成功したが HTML が空、meta タグ欠落、JS エラー等）

**失敗検知手順**

1. Vercel Dashboard > Deployments タブでステータス「Failed」または「Ready」だが異常を確認
2. 該当 Deployment の「View Build Logs」でエラー行を特定
3. エラーの分類（上記 6 パターンのどれか）を判定
4. GitHub Actions タブで Cursor Automation の webhook 発火状況も併せて確認

**Build 失敗と本番影響の関係**

Vercel は Build 失敗時に自動 Rollback しない仕様。したがって以下の 2 パターンに分岐する:

**パターン α: Build 失敗のみ（本番影響なし）**

- 既存 Production Deployment が維持される
- 本番サイトは正常配信を継続
- 緊急 Rollback は不要
- 対処: Build Log を確認、原因を Cursor 実装 Issue の Comment に報告、Cursor が修正 → 再デプロイ

**パターン β: Build 成功 + 生成物欠陥（本番影響あり）**

- Vercel Dashboard で「Ready」ステータスになるが、実際は空の HTML や欠陥のある生成物を配信
- 本番サイトが 500 エラー、空白表示、機能不全等の異常状態
- 即時 Rollback が必要
- 対処: § 2.1「Vercel ダッシュボードでの Rollback」で直前成功 Deployment に Promote、または § 2.2「Git 経由の Rollback」で `git revert`

**判断フロー**

Build 失敗を検知したら、以下の順で判定:

1. **本番サイトの動作確認**: `https://ipasounddrill.app` にアクセス、主要機能（トップページ表示、モード切替、TTS、6 言語切替）を目視確認
2. **正常動作** → パターン α、Build Log を Cursor 実装 Issue に報告、緊急対応不要
3. **異常動作** → パターン β、即時 Rollback（§ 2.1 or § 2.2）を実施、その後原因調査

**原因調査を別 Issue に切り出す判断基準**

Build 失敗の原因が以下に該当する場合、Cursor 実装 Issue とは別に調査 Issue を起票:

- 環境要因（Vercel の一時的な障害、npm レジストリのアクセス不能等）→ 別 Issue 不要、時間経過で解決する可能性
- 依存関係の脆弱性やバージョン固定問題 → 別 Issue（`chore: pin dependency versions`）で扱う
- Vercel の仕様変更（Node.js バージョンサポート終了等）→ 別 Issue（`chore: update Node.js runtime`）で扱う
- Cursor 実装のロジックバグ → 現行 Issue で修正、別 Issue 不要

### 2.5 Build Command / Output Directory 変更時の事前チェックリスト

F2 のように Vercel Build を新規導入する Issue や、Build 設定を変更する Issue で、Vercel Dashboard 側の設定を変更する際の事前確認事項:

1. **変更前の設定を記録**: Vercel Dashboard > Settings > Build & Development Settings の現在値をスクリーンショット、Issue Comment に添付
2. **変更前の Deployment ID を記録**: 「Promote to Production」で戻す先の Deployment ID（Vercel Dashboard の Deployments タブで確認可能）を Issue Comment に記載
3. **変更予定内容を Issue 本文に明記**: 新しい Build Command、Install Command、Output Directory、Node.js Version をすべて明記
4. **段階的変更**: 一度に複数設定を変更しない。以下の順序で 1 つずつ変更 → 動作確認 → 次の変更:
   - Step 1: Install Command 追加 → Preview デプロイで動作確認
   - Step 2: Build Command 追加 → Preview デプロイで動作確認
   - Step 3: Output Directory 変更 → Preview デプロイで動作確認
   - Step 4: Node.js Version 変更（必要な場合）→ Preview デプロイで動作確認
5. **Preview デプロイで先行検証**: main への push 前に、feature branch で Preview デプロイを確認。Preview URL は PR コメントに自動投稿される
6. **変更後の初回 Build を目視**: Vercel Dashboard で Build Log を最後まで確認、Warning / Error がないか、生成物が期待通りに Output Directory に配置されているか
7. **本番動作確認**: 変更後の Production Deployment で以下を目視確認:
   - トップページ表示（`https://ipasounddrill.app`）
   - モード切替（Decode / Encode / Mode B / vocab browser）
   - TTS 動作（初回タップ + 連続再生）
   - 6 言語切替（ja / en / ko / zh-Hans / zh-Hant / fil）
8. **問題発生時の即時 rollback 判断基準**:
   - トップページが 500 エラー / 空白 → 即時 § 2.1 で Promote to Production（30 秒以内）
   - 一部機能が動作しない（例: TTS のみ不動作） → 30 分以内に原因特定 or § 2.1 で Rollback
   - 表示崩れのみで機能は動作 → 次営業日までに修正 Issue 起票、Rollback は状況判断

---

## 3. GAS TTS 障害対応

### 3.1 TTS が動作しない症状の切り分け

| 症状 | 原因の可能性 | 対応 |
|---|---|---|
| 全ユーザーで音が鳴らない | GAS Deploy が停止・破損 | GAS ダッシュボードでデプロイ確認、再デプロイ |
| 特定ユーザーのみ音が鳴らない | ブラウザキャッシュ / 権限 | ユーザーにキャッシュクリア + ブラウザ再起動を案内 |
| 1回目だけ音が途切れる | 既知の初回タップ遅延 | Phase T レポート参照（`docs/cursor/reports/`） |
| 特定単語だけ音が変 | GAS BatchWords 未更新 | `python3 scripts/export_batch_words.py` を実行、GAS 更新 |

### 3.2 GAS 再デプロイ手順

1. https://script.google.com/ で `Code.gs` プロジェクトを開く
2. 右上「Deploy」→「Manage deployments」
3. 現在のデプロイの三点メニュー → Edit
4. Version を "New version" に設定して Deploy
5. **URL は変えないこと**（`index.html` の `GAS_TTS_URL` を書き換える必要が出る）
6. デプロイ後、`https://ipasounddrill.app` で動作確認

### 3.3 GAS Deploy の Rollback

GAS は複数バージョンを保持しているので、Manage deployments で古い Version を再選択して Deploy し直せば戻せる。

### 3.4 TTS 完全停止時のユーザーへの通知

`index.html` に「TTS 一時停止中」バナーを表示する簡易 hotfix Issue を起票、Cursor に実装依頼。所要 15 分。

---

## 4. ドメイン管理

### 4.1 ドメイン購入先

- **Namecheap**: `ipasounddrill.app`（BasicDNS、AUTO-RENEW ON、次回更新: 2027-07-11）

### 4.2 DNS 設定

Vercel の指示に従い、以下を Namecheap（Advanced DNS）側で設定:

```
Type: A
Name: @
Value: 216.198.79.1

Type: CNAME
Name: www
Value: 52646c530fa600df.vercel-dns-017.com.
```

DNS 伝播に最大 24 時間かかることがある（通常は 10〜30分）。

### 4.3 TLS 証明書

`.app` ドメインは HSTS preload により **強制 HTTPS**。Vercel が Let's Encrypt を自動更新（90日ごと）、手動介入不要。

### 4.4 ドメイン失効防止

- Namecheap のアカウントに支払い方法を登録済みか確認
- AUTO-RENEW ON 済み（2026-07-11 設定）
- 次回更新: 2027-07-11
- Domain Privacy Protection ON（Namecheap 標準）
- Verify Contacts の ALERT が出た場合、48時間以内に対応

---

## 5. 計測タグ管理（Vercel Web Analytics）

### 5.1 Vercel Web Analytics 有効化状態

- サイト: `ipasounddrill.app`（Vercel プロジェクト `ipa-sound-drill`）
- Dashboard: https://vercel.com/nkhippo/ipa-sound-drill/analytics
- Dashboard 側有効化: Issue #19 で完了済み（Naoya 手動）
- 計測タグ埋め込み: Issue E1 / #43 で `src/index.template.html` の `</body>` 直前に追加、生成物 6 言語版すべてに反映

### 5.2 埋め込みタグ

`src/index.template.html` の `</body>` 直前に以下を配置:

```html
<script defer src="/_vercel/insights/script.js"></script>
```

- `/_vercel/insights/script.js` は Vercel が自動配信するスクリプト
- ドメイン自動検出により追加設定不要
- `defer` 属性により初回パフォーマンス影響を最小化
- Vercel Hobby プランの範囲内で無料利用可

### 5.3 自動記録される情報

Vercel Web Analytics が自動的に記録する情報:

- ページビュー（Top Pages）
- リファラー（Top Referrers）
- デバイス（Desktop / Mobile / Tablet）
- ブラウザ
- OS
- 国 / 地域

これらは Naoya の手動作業なしで自動記録される。

### 5.4 カスタムイベント（Track B で実装予定）

以下のカスタムイベントは Track B の `@vercel/analytics` パッケージ導入時に実装予定（本 Issue のスコープ外）:

| イベント名 | 意味 |
|---|---|
| `mode_start` | モード開始（props: mode="decode"/"encode"/"modeb"） |
| `answer_correct` | 正解 |
| `answer_wrong` | 誤答 |
| `language_switch` | UI 言語切替 |
| `accent_switch` | GA↔RP 切替 |
| `tts_play` | TTS 再生 |

Track A ではページビュー等の自動記録のみ、カスタムイベントは Track B で `@vercel/analytics` パッケージ導入時に実装。

### 5.5 データ保持期間

Vercel Web Analytics のデータ保持期間は Hobby プランで直近 30 日、Pro プランで直近 12 ヶ月。ローンチ後は月次で Dashboard を確認、必要に応じて Pro プランへのアップグレードを検討。

### 5.6 開発者除外（Naoya 自身のアクセスを除外）

Vercel Web Analytics には公式のオプトアウト UI がなく（DNT 非対応、Cookie 不使用）、Track A の script タグ直接埋め込み方式では `@vercel/analytics` パッケージの `beforeSend` フックも使えない。そのため `src/index.template.html` に localStorage ベースの除外機構を実装している（Issue #46）。

**除外の有効化**:

各デバイス（MacBook A、Windows PC B、iPhone C）で以下 URL に 1 回アクセス:

```
https://ipasounddrill.app/?va-disable=1
```

各言語版でも動作:
- `https://ipasounddrill.app/en/?va-disable=1`
- `https://ipasounddrill.app/ja/?va-disable=1`
- `https://ipasounddrill.app/ko/?va-disable=1`
- `https://ipasounddrill.app/zh-Hans/?va-disable=1`
- `https://ipasounddrill.app/zh-Hant/?va-disable=1`
- `https://ipasounddrill.app/fil/?va-disable=1`

アクセス時に localStorage の `va-disable` キーが `1` に設定され、`window.va` 関数が no-op 化される。以降そのデバイスは Analytics 送信を停止する。

**除外の解除**（トラッキング再開）:

```
https://ipasounddrill.app/?va-enable=1
```

**動作原理**:

- 各ページ読み込み時に URL パラメータをチェック、`?va-disable=1` / `?va-enable=1` で localStorage を制御
- localStorage に `va-disable=1` が保存されていると、Vercel Analytics スクリプト（`/_vercel/insights/script.js`）読み込み前に `window.va` を no-op 関数に設定
- Vercel Analytics スクリプトは `window.va` を経由してデータ送信するため、no-op 化により実質的に無効化される

**確認方法**:

1. Chrome DevTools > Application > Local Storage > `https://ipasounddrill.app` で `va-disable` キーが `1` になっているか確認
2. Chrome DevTools > Network タブで、`_vercel/insights/*` へのリクエストが発生しないか、または発生しても Response が空か確認

**注意点**:

- localStorage をクリア（ブラウザデータ削除、ブラウザプロファイル変更等）すると再設定が必要
- ブラウザ拡張（uBlock Origin 等）で `/_vercel/insights/*` をブロックする方法と併用推奨（複数レイヤー防御）
- Naoya さんが所有する全デバイス（MacBook A、Windows PC B、iPhone C）で 1 回ずつ設定する
- Preview URL（`ipa-sound-drill.vercel.app` 等）でも同様の JS が動作するため、Preview 環境での動作確認時も設定が有効

**Track B での拡張**:

Track B で `@vercel/analytics` パッケージを導入した際は、既存の `window.va` no-op 化ロジックがそのまま有効。追加実装は不要。

---

## 6. フィードバック導線（Tally）

### 6.1 Tally form

- Form URL: https://tally.so/r/xX1axk
- 通知先: Naoya のメール
- 保管: Tally ダッシュボード

### 6.2 フィードバック対応フロー

1. Tally 通知メール受信
2. 内容確認、緊急度判定
3. バグ・不具合 → Bug Issue 起票
4. 機能要望 → Feature Issue 起票（Track B ラベル）
5. 感想・応援 → X で reply（可能なら）、対応不要

---

## 7. GitHub Actions の運用

### 7.1 有効な workflow

- `trigger-cursor-on-ready.yml` — `ready-for-cursor` ラベル付与で Cursor 起動
- `approval.yml` — ok コメントで PR 自動マージ
- `label-pr-needs-review.yml` — Cursor PR に needs-review ラベル自動付与

### 7.2 Secrets 一覧

Repository Settings > Secrets and variables > Actions:

- `CURSOR_AUTOMATION_WEBHOOK_URL`
- `CURSOR_AUTOMATION_WEBHOOK_TOKEN`

### 7.3 Actions 失敗時の対応

1. Actions タブでログ確認
2. Secrets の期限切れ・破損チェック
3. workflow yml の構文エラーチェック
4. 復旧困難時は該当 workflow を Disabled にして手動運用へ切替

---

## 8. 定常オペレーション

### 8.1 週次チェック

- [ ] Vercel Web Analytics Dashboard の週次サマリ確認
- [ ] Tally form の未対応フィードバック確認
- [ ] Bug Issue の残数確認
- [ ] Vercel の帯域使用量確認（Hobby 上限 100GB/月）

### 8.2 月次チェック（Track B 開始後）

- [ ] `docs/bug-knowledge.md` を Opus に投げてパターン分析
- [ ] Track B スコープの進捗レビュー
- [ ] ドメイン更新期限確認

---

## 9. 緊急連絡・エスカレーション

現状は Naoya 1人体制。エスカレーション先はなし。

将来 co-maintainer や外部貢献者が加わったら、以下を追加:
- Slack / Discord での通知チャンネル
- On-call ローテーション
- SLA 定義

---

## 10. 主要ダッシュボード URL 一覧

- **GitHub**: https://github.com/nkhippo/IPASoundDrill
- **Vercel Dashboard**: https://vercel.com/nkhippo/ipa-sound-drill
- **Vercel Preview（Production）**: https://ipa-sound-drill.vercel.app
- **Vercel Web Analytics**: https://vercel.com/nkhippo/ipa-sound-drill/analytics
- **Tally**: https://tally.so/r/xX1axk
- **Namecheap**: https://ap.www.namecheap.com/domains/list/
- **GAS**: https://script.google.com/（Naoya アカウント）
- **Railway (MCP service)**: https://ipasounddrill-production.up.railway.app
- **Railway (MCP endpoint)**: https://ipasounddrill-production.up.railway.app/mcp
- **MCP コードリポ**: https://github.com/nkhippo/ipasounddrill-mcp
- **claude.ai コネクタ名**: `IPASoundDrill GitHub`
