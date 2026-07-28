# GSC Coverage アラート対応（Phase 1-3） — 実装レポート

## 関連 Issue / PR

- Issue: #190
- PR: （後述、作成後に追記）

## Issue 背景（Issue 本文から要約）

2026-07-28 に Google Search Console からカバレッジアラートを受信。「見つかりませんでした（404）」7 件、「ページにリダイレクトがあります」3 件、「代替ページ（適切な canonical タグあり）」1 件が検出された。404 は存在しない言語パス・www サブドメイン・クローラーによる IPA 記号誤認によるもので、正当な 404 応答として扱う方針（対応不要）。リダイレクト問題は `/` の hreflang `x-default` が middleware の 302 リダイレクトを経由してしまうことが原因。canonical 問題は `privacy.html` / `terms.html` の canonical が Vercel `cleanUrls` によるリダイレクト先と不一致であることが原因。本 Issue では Phase 1（hreflang x-default 修正）・Phase 2（canonical 修正）・Phase 3（preview deploy の noindex 化）をコード変更で対応する。Phase 0（www リダイレクト設定）・Phase 4（GSC 検証実行）は Naoya が手動で実施する。

## 実装内容

- `scripts/build-i18n-html.js`: `hreflangBlock()` の `x-default` href を `https://ipasounddrill.app/` → `https://ipasounddrill.app/en/` に変更
- `sitemap.xml`: 全 6 `<url>` エントリの hreflang `x-default` href を `/` → `/en/` に変更
- `privacy.html`: canonical を `https://ipasounddrill.app/privacy.html` → `https://ipasounddrill.app/privacy`（`.html` なし）に変更
- `terms.html`: canonical を `https://ipasounddrill.app/terms.html` → `https://ipasounddrill.app/terms`（`.html` なし）に変更
- `vercel.json`: `headers` 設定を追加。リクエスト host が本番ドメイン `ipasounddrill.app` と完全一致しない場合（＝ Vercel が自動生成する preview / デフォルトエイリアスドメイン）に `X-Robots-Tag: noindex` を付与する。`has`/`missing` の `host` マッチは Vercel の Path Matching 仕様（Next.js middleware と同じスキーマ）に準拠

## 変更ファイル

```
- scripts/build-i18n-html.js (M)
- sitemap.xml (M)
- privacy.html (M)
- terms.html (M)
- vercel.json (M)
- docs/cursor/reports/cursor-implementation-report-gsc-coverage-alert.md (A)
```

## デグレ防止検証

- `node scripts/build-i18n-html.js` を実行し、生成された `en/index.html` 等の hreflang x-default が `https://ipasounddrill.app/en/` を指すことを確認
- `python3 -c "import xml.dom.minidom as m; m.parse('sitemap.xml')"` で sitemap.xml の XML 構文が正しいことを確認
- `python3 -c "import json; json.load(open('vercel.json'))"` で vercel.json の JSON 構文が正しいことを確認
- `python3 tools/validate_i18n.py` を実行し、ハード不整合 0 件（既存の warning 5 件のみ、本変更と無関係）を確認
- 実装中の自己判断による追加変更: 0 件
- 実装中に発覚した懸念: なし

## 動作確認

- ビルド後の生成 HTML（`en/index.html`）で hreflang `x-default` が `/en/` を指している: OK
- `sitemap.xml` の XML 構文: OK（6 エントリすべて `/en/` に更新済みを確認）
- `privacy.html` / `terms.html` の canonical が `.html` なし: OK
- Vercel preview deploy で `X-Robots-Tag: noindex` ヘッダーが返るか: 未確認（Vercel 実デプロイでの確認が必要。Naoya さんに Preview URL でのヘッダー確認をお願いします）
- 本番環境（`ipasounddrill.app`）で noindex ヘッダーが付かないこと: 未確認（同上、本番デプロイ後に確認が必要）
- 既存機能への影響: なし
- データ整合性: 対象外（wordlist / connected_speech / weak_forms / i18n スキーマへの変更なし）

## 実装過程での気づき

- Vercel の `headers` 設定は `has` / `missing` フィールドで request host によるマッチングが可能（Next.js middleware の matcher と同一スキーマ）。「production ドメインにのみ noindex を付けない」という要件は、`missing: [{ type: "host", value: "ipasounddrill\\.app" }]` という否定条件で表現するのが最も直接的だった（正規表現で `.vercel.app` サフィックスを列挙するより堅牢）。
- `privacy` / `terms` の sitemap.xml への追加は Issue 本文で「検討」（完了定義には非含有）とされていたため、スコープ外として見送った。

## 後続への影響

- 次にできるようになったこと: Naoya さんが Phase 0（www リダイレクト設定）・Phase 4（GSC「修正を検証」実行）に進める状態になった
- 今後の Issue で参照される可能性がある成果物: `vercel.json` の host ベース noindex パターンは、今後 preview 環境の SEO 汚染対策を検討する際の参照実装になる

## 残課題・申し送り

- Phase 0（Vercel ダッシュボードでの www → apex リダイレクト設定）は Naoya さんの手動作業
- Phase 4（GSC での「修正を検証」実行）は本番デプロイ後に Naoya さんが実施
- Vercel preview / 本番での `X-Robots-Tag` ヘッダーの実地確認は、Vercel への実デプロイが必要なため未実施。デプロイ後に `curl -I <preview-url>` と `curl -I https://ipasounddrill.app/` で確認をお願いします

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 5 ファイルにまたがる変更だが、いずれも既存アーキテクチャ（ビルドスクリプト・静的 HTML・Vercel 設定）の範囲内の修正で、新規アーキテクチャ判断は発生しなかった

### 事前 Change Pattern vs 実際
- 事前 Pattern: C2, C3
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし（hreflang / canonical のメタデータ修正のみ、実際の URL 構造・ルーティングは変更なし）
- [x] ビルドシステムへの影響なし（`build-i18n-html.js` の出力内容のみ変更、ビルドプロセス自体は不変）
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 3（Phase 1-3、Phase 0/4 は Naoya 手動につき対象外）
- 実際の Phase 数: 3
- 相互依存の発生有無: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細
なし
