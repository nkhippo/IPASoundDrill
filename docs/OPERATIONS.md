# OPERATIONS — ipasounddrill 運用マニュアル

このドキュメントは本番運用中のトラブル対応と定常オペレーション手順。CLAUDE.md の Track A/B 分離方針、`REPOSITORY-STRUCTURE.md` のランタイム契約を前提とする。

---

## 1. Vercel デプロイ

### 1.1 通常デプロイ（自動）

`main` に PR がマージされると Vercel が自動でデプロイする。所要時間: 30〜60秒。

- ビルドコマンド: なし（静的サイト）
- 出力ディレクトリ: リポジトリルート
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

## 5. 計測タグ管理（Plausible）

### 5.1 Plausible アカウント

- サイト URL: `ipasounddrill.app`
- ダッシュボード: https://plausible.io/ipasounddrill.app
- 月額: 開始プランで検討（低トラフィックなら $9/月〜）

### 5.2 計測タグの停止・変更

`index.html` の `<head>` 内 script タグを編集、コミット・push で反映。

### 5.3 カスタムイベント一覧

以下を実装済み（Day 5 実装後の状態）:

| イベント名 | 意味 |
|---|---|
| `mode_start` | モード開始（props: mode="decode"/"encode"/"modeb"） |
| `answer_correct` | 正解 |
| `answer_wrong` | 誤答 |
| `language_switch` | UI 言語切替 |
| `accent_switch` | GA↔RP 切替 |
| `tts_play` | TTS 再生 |

---

## 6. フィードバック導線（Tally）

### 6.1 Tally form

- Form URL: `https://tally.so/r/xxxxxx`（Day 5 実装後に確定）
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

- [ ] Plausible dashboard の週次サマリ確認
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
- **Plausible**: https://plausible.io/ipasounddrill.app（Day 5 実装後に稼働）
- **Tally**: （Day 5 実装後に記入）
- **Namecheap**: https://ap.www.namecheap.com/domains/list/
- **GAS**: https://script.google.com/（Naoya アカウント）
- **Railway (MCP service)**: https://ipasounddrill-production.up.railway.app
- **Railway (MCP endpoint)**: https://ipasounddrill-production.up.railway.app/mcp
- **MCP コードリポ**: https://github.com/nkhippo/ipasounddrill-mcp
- **claude.ai コネクタ名**: `IPASoundDrill GitHub`
