# IPA Sound Drill

CEFR 向けの IPA 音写トレーナー（General American / Received Pronunciation）。

## デモ

- **Live**: https://ipasounddrill.app
- **Docs**: [docs/README.md](docs/README.md)
- **Purpose**: [docs/PURPOSE.md](docs/PURPOSE.md)

本番は Vercel + カスタムドメイン。リポジトリ名の正は `IPASoundDrill`。

## 機能

- **IPA読み書き (Mode A)** — Decode（IPA→綴り）/ Encode（綴り→IPA）、音素フォーカス・CEFR フィルタ
- **聞いて覚える (Mode B)** — Study、CEFR バンド進行（A1–B2）
- **連結音・弱形** — 201 句 + 36 弱形（Connected Speech タブ）
- 語彙 **5,397 語**（gloss 5 言語、B2=899）、進捗チェック（3 スロット × 3 モード）
- 語彙ブラウザ（`#/vocab` / `#/vocab/phrases`）— 検索・A–Z・CEFR バッジ・TTS
- TTS は GAS プロキシ + Drive/localStorage キャッシュ（Drive 直リンク `?urls=1` 対応。運用手順は [`gas/README.md`](gas/README.md) / [`docs/reference/remaining-ops-checklist.md`](docs/reference/remaining-ops-checklist.md)）

## ドキュメント（AI / 開発者向け）

| ファイル | 説明 |
|---------|------|
| [`docs/README.md`](docs/README.md) | `docs/` 配下の索引（正本 vs タスク履歴の見分け） |
| [`docs/REPOSITORY-STRUCTURE.md`](docs/REPOSITORY-STRUCTURE.md) | **フォルダ構成マップ（Claude 共有用・最初に読む）** |
| [`docs/PURPOSE.md`](docs/PURPOSE.md) | 目的・モード構成の正本 |
| [`docs/DESIGN.md`](docs/DESIGN.md) | 実装設計仕様 |
| [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) | 画面・データ・localStorage の正本 |
| [`docs/reference/README.md`](docs/reference/README.md) | 監査・運用ガイドの索引 |
| [`data/README.md`](data/README.md) | `data/` 配下（runtime / batches / pipeline / derived）の見分け方 |

## 主要パス

| パス | 説明 |
|------|------|
| `index.html` | アプリ本体 |
| `wordlist_GA_a1a2_plus_phonics.json` | 本番語彙（ルート・ランタイム読込） |
| `data/connected_speech.json` | 連結句 201 |
| `data/weak_forms.json` | 弱形 36 |
| `data/batches/` | 語彙マージ入力 JSON |
| `data/pipeline/` | narrow IPA / respelling ステージング |
| `data/derived/` | neighbors・RP IPA 進捗 |
| `scripts/paths.py` | パイプライン用パス正本 |
| `gas/` | TTS プロキシ（`gas/README.md`） |

## 開発 / ローカル確認

```bash
git clone git@github.com:nkhippo/IPASoundDrill.git
cd IPASoundDrill
python3 -m http.server 8080
# http://localhost:8080
```

`file://` では JSON の読み込みがブロックされるため、ローカルサーバーが必要です。
