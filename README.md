# English Pronunciation Trainer

CEFR 向けの IPA 音写トレーナー（General American / Received Pronunciation）。

## デモ

GitHub Pages: https://nkhippo.github.io/English-Pronunciation-Trainer/

## 機能

- **IPA読み書き (Mode A)** — Decode（IPA→綴り）/ Encode（綴り→IPA）、音素フォーカス・CEFR フィルタ
- **聞いて覚える (Mode B)** — Study + MCQ/ディクテーション、CEFR バンド進行
- **連結音・弱形** — 201 句 + 36 弱形（Connected Speech タブ）
- 語彙 **4,439 語**（gloss 5 言語）、TTS は GAS プロキシ + Drive/localStorage キャッシュ

## ドキュメント

| ファイル | 説明 |
|---------|------|
| [`docs/REPOSITORY-STRUCTURE.md`](docs/REPOSITORY-STRUCTURE.md) | **フォルダ構成マップ（Claude / AI 向け）** |
| [`docs/PURPOSE.md`](docs/PURPOSE.md) | 目的・モード構成の正本 |
| [`docs/DESIGN.md`](docs/DESIGN.md) | 実装設計仕様 |
| [`docs/SPECIFICATION.md`](docs/SPECIFICATION.md) | 仕様書（画面・データの正本） |

## 主要ファイル

| パス | 説明 |
|------|------|
| `index.html` | アプリ本体 |
| `wordlist_GA_a1a2_plus_phonics.json` | 本番語彙（ルート・ランタイム読込） |
| `data/connected_speech.json` | 連結句 201 |
| `data/weak_forms.json` | 弱形 36 |
| `data/batches/` | Phase 1 マージ用ソース JSON |
| `data/pipeline/` | narrow IPA / respelling ステージング |
| `scripts/paths.py` | パイプライン用パス正本 |
| `gas/` | TTS プロキシ（`gas/README.md` 参照） |

## ドキュメント

| パス | 説明 |
|------|------|
| `docs/REPOSITORY-STRUCTURE.md` | フォルダ構成・AI 向けオリエンテーション |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | 正本仕様 |
| `docs/reference/README.md` | 相談用 reference 資料の索引 |
| `docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md` | GA↔RP 同一判定フラグ（Claude 相談ブリーフ） |

## ローカル確認

```bash
python3 -m http.server 8080
# http://localhost:8080
```

`file://` では JSON の読み込みがブロックされるため、ローカルサーバーが必要です。
