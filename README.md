# English Pronunciation Trainer

CEFR A1–A2 向けの IPA 音写トレーナー（General American）。

## デモ

GitHub Pages: https://nkhippo.github.io/English-Pronunciation-Trainer/

## 機能

- **読む (IPA → 単語)** / **書く (単語 → IPA)** の2モード
- 出題は `wordlist_GA_a1a2_plus_phonics.json` のテーブルデータからランダム選択（1セッション **10問** 固定）
- 音声は GAS プロキシ経由で OpenAI `gpt-4o-mini-tts` を呼び出し（APIキーは GAS 側に保存）
- 生成音声は Google Drive にキャッシュ、ブラウザでは localStorage にも保存して連続再生時は API を呼ばない

## 使い方

1. 方向・出題セット・レベルを選び「はじめる」

## ファイル

| ファイル | 説明 |
|---------|------|
| `index.html` | アプリ本体 |
| `gas/Code.gs` | 音声プロキシ（OpenAI TTS + Google Drive キャッシュ） |
| `gas/README.md` | GAS デプロイ手順 |
| `wordlist_GA_a1a2_plus_phonics.json` | 単語・IPA・CEFR・パターンのデータ |
| `wordlist_GA_a1a2_plus_phonics.csv` | 同上（CSV） |

## ローカル確認

```bash
python3 -m http.server 8080
# http://localhost:8080
```

`file://` では JSON の読み込みがブロックされるため、ローカルサーバーが必要です。
