# `tools/tts/` — GAS TTS プロキシのデプロイ資産

`gas/` 配下の Google Apps Script プロジェクト（`Code.gs` / `BatchWarm.gs` / `BatchWords.gs`）を
リポジトリ内で管理するためのディレクトリ。API 仕様・キャッシュ設計・バッチ生成手順の詳細は
[`gas/README.md`](gas/README.md) を参照。

## デプロイ手順の要点

現行の GAS デプロイは **手動貼り付け方式**（clasp 等の CLI デプロイは未導入）:

1. [Google Apps Script](https://script.google.com/) で新規プロジェクトを作成
2. `tools/tts/gas/Code.gs`（および `BatchWarm.gs` / `BatchWords.gs`）の内容を貼り付け
3. スクリプトプロパティに `OPENAI_API_KEY` を設定
4. デプロイ → ウェブアプリとして公開し、発行された URL を
   `apps/web/src/index.template.html` の `GAS_TTS_URL` 定数に設定

`GAS_TTS_URL` は外部にデプロイされた URL 文字列であり、本 monorepo 移設（#212）による
リポジトリ内パス変更の影響を受けない（`docs/data-contract.md` §1 ランタイム契約参照）。

障害対応・再デプロイ運用の詳細は `docs/OPERATIONS.md` §3「GAS TTS 障害対応」を参照
（本 README では重複させない）。
