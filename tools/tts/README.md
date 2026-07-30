# `tools/tts/` — GAS TTS プロキシのデプロイ資産

`gas/` 配下の Google Apps Script プロジェクト（`Code.gs` / `BatchWarm.gs` / `BatchWords.gs`）を
リポジトリ内で管理するためのディレクトリ。API 仕様・キャッシュ設計・バッチ生成手順の詳細は
`tools/tts/gas/README.md` を参照。

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

## 人気単語一括生成（Mobile hybrid delivery、Issue #222）

Mobile app（#EPIC-06/07）は「人気単語（上位 1,000 語）を app assets に同梱し、それ以外は
初回使用時に GAS 経由でオンデマンド fetch」する hybrid delivery を採用する。
`gen_tts_batch.py` は同梱対象の mp3 を事前生成するツール（Web の挙動は現状維持、GAS を
実行時に叩く既存契約は変更しない）。

```bash
# 生成予定の path 一覧のみ確認（HTTP リクエストは送らない）
python3 tools/tts/gen_tts_batch.py --top-n 1000 --dry-run

# 実生成（GAS_TTS_URL は環境変数 or --gas-url で指定）
GAS_TTS_URL=https://script.google.com/macros/s/xxx/exec \
  python3 tools/tts/gen_tts_batch.py --top-n 1000
```

- 出力先: `apps/mobile/assets/audio/{ga,rp}/{word}.mp3`
- 冪等性: 既存 mp3 はスキップ。`--force` で全再生成。
- 選定ロジック（CEFR 優先順位 A1→A2→B1→B2 でフラット化して先頭 N 件）の詳細は
  スクリプト冒頭の docstring を参照。
- `apps/mobile/` 側での git 管理方針（LFS 利用可否）は Issue #222 Phase 3 で判断待ち
  （本 README 執筆時点で未確定）。

### CI 統合（optional、Phase 5）

`packages/core/data/wordlist.json` 変更時の CI 自動再生成は Issue #222 Phase 5 として
Naoya 判断待ち（optional、本 Issue では未実装）。
