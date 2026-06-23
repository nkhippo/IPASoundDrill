# English Pronunciation Trainer

CEFR A1–A2 向けの IPA 音写トレーナー（General American）。

## デモ

GitHub Pages: https://nkhippo.github.io/English-Pronunciation-Trainer/

## 機能

- **読む (IPA → 単語)** / **書く (単語 → IPA)** の2モード
- 出題は `wordlist_GA_a1a2_plus_phonics.json` のテーブルデータから選択（API不要）
- 音声は OpenAI `gpt-4o-mini-tts`（APIキーはブラウザの localStorage に保存）

## 使い方

1. セットアップ画面で OpenAI API キーを入力して「保存」
2. 方向・出題セット・レベル・出題数を選び「はじめる」

## ファイル

| ファイル | 説明 |
|---------|------|
| `index.html` | アプリ本体 |
| `wordlist_GA_a1a2_plus_phonics.json` | 単語・IPA・CEFR・パターンのデータ |
| `wordlist_GA_a1a2_plus_phonics.csv` | 同上（CSV） |

## ローカル確認

```bash
python3 -m http.server 8080
# http://localhost:8080
```

`file://` では JSON の読み込みがブロックされるため、ローカルサーバーが必要です。
