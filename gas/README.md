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
