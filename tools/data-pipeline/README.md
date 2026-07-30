# `tools/data-pipeline/` — オフライン生成用の中間ファイル・パイプラインスクリプト

ランタイム契約データ本体（`connected_speech.json` / `weak_forms.json` / `guide.json` / `wordlist.json`）は
別ホーム `packages/core/data/`（`packages/core/data/README.md` 参照）に移設済み。
ここには**パイプライン生成スクリプト**とその**中間ファイル**のみを置く。

| Subfolder | ブラウザ読込 | 役割 |
|-----------|:------------:|------|
| **（直下）** | ❌ | `paths.py`（パス正本）、`gen_*.py` / `merge_*.py` 等のパイプライン生成スクリプト |
| [`batches/`](batches/) | ❌ | 語彙マージの**入力**（Phase 1/2 の `*_with_gloss.json`） |
| [`pipeline/`](pipeline/) | ❌ | narrow IPA / respelling の**ステージング**（スクリプトが再生成） |
| [`derived/`](derived/) | ❌ | neighbors・RP IPA 進捗など**派生データ**（マージ元） |
| [`patches/`](patches/) | ❌ | 過去の一括パッチ（def / gloss-fil / step4 / `phase2_audit/` 等。履歴参照用） |
| [`archive/`](archive/) | ❌ | ローカル退避スナップショット（git 対象外の `.pre-phase0a.json` 等） |
| [`lib/`](lib/) | ❌ | `tools/validate/validate-markdown-refs.py` が import する共通ロジック（`common.py` / `verify_core.py`） |
| [`migration/`](migration/) | ❌ | 旧 Vault-Framework 由来の一回限り markdown 移行スクリプト（`01_scan.py`〜`06_report.py`） |

**本番 wordlist** は `packages/core/data/wordlist.json`（`apps/web` がビルド時に `apps/web/public/data/wordlist.json` へコピーし、そこを index.html が fetch）。`tools/data-pipeline/` 内には置かない。

パス正本: [`paths.py`](paths.py)
フォルダ全体の地図: `docs/repo-map.md`（#EPIC-04 で新構造反映予定）
