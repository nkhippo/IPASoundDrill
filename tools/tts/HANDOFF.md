# TTS 量産 引き継ぎ (Issue #237 Phase 3)

## ブランチ

`tts-237`（`origin/develop` から派生）

## 状態

- PR #238（IPA / gloss / def / neighbors 全データ刷新）は **develop にマージ済み**
- 残タスク: **TTS 音声ファイル量産** → 10,340/10,794 完了、残り 454 件リトライ中

## TTS 仕様

| 項目 | 値 |
|---|---|
| モデル | `gpt-4o-mini-tts` |
| ボイス | `alloy` |
| スピード | `0.8` |
| フォーマット | `mp3` |
| アクセント | GA + RP（各単語 2 ファイル） |
| 対象 | `packages/core/data/wordlist.json` 全 5,397 語 |
| 出力先 | `tools/tts/audio/{ga,rp}/{word}.mp3` |

## 実行コマンド

```bash
export OPENAI_API_KEY="sk-..."
python3 tools/tts/gen_tts_openai_batch.py --workers 3
```

冪等: 既存ファイルはスキップ。途中停止しても再実行で続行可能。

## 完了後

1. `find tools/tts/audio -name "*.mp3" | wc -l` → 10,794 確認
2. PR 作成 → develop マージ → Issue #237 クローズ
3. Web Drive 側 re-warm は既存 GAS `BatchWarm.gs` で別途実施
