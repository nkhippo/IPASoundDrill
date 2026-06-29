# GAS TTS Proxy

OpenAI `gpt-4o-mini-tts` を Google Apps Script 経由で呼び出し、生成した音声を Google Drive にキャッシュします。

## セットアップ

1. [Google Apps Script](https://script.google.com/) で新規プロジェクトを作成
2. `Code.gs` の内容を貼り付け
3. **プロジェクトの設定 → スクリプト プロパティ** に `OPENAI_API_KEY` を追加
4. **デプロイ → 新しいデプロイ → 種類: ウェブアプリ**
   - 実行ユーザー: **自分**
   - アクセスできるユーザー: **全員**
5. 発行された **ウェブアプリ URL**（`.../exec`）を `index.html` の `GAS_TTS_URL` に設定

## API

`GET ?word=luck`  
`GET ?word=colour&accent=rp`  
`GET ?phrase=check%20it&accent=ga`  
`GET ?weak=/kən/&ww=can&accent=ga`（弱形；OpenAI 入力は IPA）  
`GET ?warm=1&words=luck,colour&accent=ga`（Drive ウォームアップ。音声本体は返さない）

```json
{
  "ok": true,
  "word": "luck",
  "accent": "ga",
  "source": "drive",
  "mimeType": "audio/mpeg",
  "audio": "<base64>"
}
```

- `accent`: `ga`（既定）または `rp`。単語の `instructions` と Drive キャッシュキーを切替
- `warm=1&words=...`: 最大 6 語/リクエスト。Drive に生成・保存のみ（JSON サマリ返却）
- `source: "drive"` — Google Drive のキャッシュから返却
- `source: "openai"` — OpenAI から新規生成し Drive に保存

## キャッシュ

| 種別 | Drive ファイル名 | 備考 |
|------|------------------|------|
| 単語 GA | `{slug}__ga_v2.mp3` | 旧 `{slug}_v2.mp3` も GA として読む |
| 単語 RP | `{slug}__rp_v2.mp3` | |
| 連結句 | `{slug}__ga_v2.mp3` | GA 固定 |
| 弱形 GA | `{slug}__ga_weak_v2.mp3` | `ww`（綴り）でスラグ化 |
| 弱形 RP | `{slug}__rp_weak_v2.mp3` | |

クライアント localStorage: `ipa_tts_v2:{accent}:{slug}`（弱形は `weak_{word}` スラグ）

**RP TTS を有効にするには GAS を再デプロイすること。**

## GA 一括バッチ（時間トリガー）

全語彙（約 3,059 語）の GA 音声を Google Drive に事前ストックする。OpenAI 生成は `warmOne_` と同じロジック。

### ファイル構成

| ファイル | 役割 |
|----------|------|
| `Code.gs` | TTS プロキシ本体 |
| `BatchWarm.gs` | バッチ・トリガー制御 |
| `BatchWords.gs` | 語彙リスト（`scripts/export_batch_words.py` で生成） |

語彙リストを更新したら:

```bash
python3 scripts/export_batch_words.py
```

GAS プロジェクトの `BatchWords.gs` を差し替え。

### セットアップ手順

1. GAS プロジェクトに `Code.gs`・`BatchWarm.gs`・`BatchWords.gs` を貼り付け
2. スクリプト プロパティ `OPENAI_API_KEY` を設定（既存と同じ）
3. エディタで `resetBatchGA` を選択して **実行**（初回のみ）
4. エディタで `installBatchTriggerGA` を選択して **実行**（5 分間隔トリガーを作成）
5. **実行数** または `getBatchStatusGA` のログで進捗確認

### 進捗・制御関数

| 関数 | 用途 |
|------|------|
| `batchWarmGA` | 時間トリガーが呼ぶ本体（手動実行も可） |
| `resetBatchGA` | インデックスを 0 に戻す（最初からやり直す） |
| `getBatchStatusGA` | 進捗 JSON をログ出力 |
| `installBatchTriggerGA(5)` | N 分ごとのトリガーを設置（既定 5 分） |
| `uninstallBatchTriggerGA` | トリガーを削除 |

1 回の実行で最大 24 語、または約 4.5 分まで処理。既に Drive にある語は `cached` でスキップ（OpenAI 課金なし）。

### スプレッドシートで語彙を管理する場合（任意）

`BatchWords.gs` の代わりにスプレッドシートを使う場合:

1. `gas/batch_words.csv` を Google スプレッドシートにインポート（A 列 `word`）
2. スクリプト プロパティ `BATCH_SPREADSHEET_ID` にスプレッドシート ID を設定
3. シート名 `words`（なければ先頭シートの A 列を読む）

`BATCH_SPREADSHEET_ID` が設定されている場合、そちらが `BatchWords.gs` より優先される。

### 完了後

- Drive フォルダ `IPA-TTS-Audio` に `{slug}__ga_v2.mp3` が増えている
- `getBatchStatusGA` の `done: true`
- 不要なら `uninstallBatchTriggerGA()` でトリガー削除
