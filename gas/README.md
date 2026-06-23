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

```json
{
  "ok": true,
  "word": "luck",
  "source": "drive",
  "mimeType": "audio/mpeg",
  "audio": "<base64>"
}
```

- `source: "drive"` — Google Drive のキャッシュから返却
- `source: "openai"` — OpenAI から新規生成し Drive に保存

音声ファイルは Drive 上の `IPA-TTS-Audio` フォルダに `{word}.mp3` として保存されます。
