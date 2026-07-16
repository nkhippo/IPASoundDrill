---
id: pj-2026-07-10-359a
aliases:
- pj-2026-07-10-359a
title: '`data/` — アプリデータとパイプライン資産'
created: '2026-07-10'
---

# `data/` — アプリデータとパイプライン資産

ブラウザが読む JSON と、オフライン生成用の中間ファイルを分けて格納する。

| Subfolder | ブラウザ読込 | 役割 |
|-----------|:------------:|------|
| **（直下）** | ✅ | `connected_speech.json`, `weak_forms.json`, `guide.json` — runtime 専用 |
| [`batches/`](batches/) | ❌ | 語彙マージの**入力**（Phase 1/2 の `*_with_gloss.json`） |
| [`pipeline/`](pipeline/) | ❌ | narrow IPA / respelling の**ステージング**（スクリプトが再生成） |
| [`derived/`](derived/) | ❌ | neighbors・RP IPA 進捗など**派生データ**（マージ元） |
| [`patches/`](patches/) | ❌ | 過去の一括パッチ（def / gloss-fil / step4 / `phase2_audit/` 等。履歴参照用） |
| [`archive/`](archive/) | ❌ | ローカル退避スナップショット（git 対象外の `.pre-phase0a.json` 等） |

**本番 wordlist** はリポジトリ**ルート**の `wordlist_GA_a1a2_plus_phonics.json`（`index.html` が fetch）。`data/` 内には置かない。

パス正本: [`scripts/paths.py`](../scripts/paths.py)  
フォルダ全体の地図: [[pj-2026-07-09-80be|`docs/REPOSITORY-STRUCTURE.md`]]
