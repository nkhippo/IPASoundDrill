# features/README.md — feature ID インデックス

各 feature の詳細仕様（観測可能挙動・画面構造・採点則+定数・読むデータ・i18n キー群・関連シンボル）は `docs/features/<id>.md` に置く。
**ID レジストリ本体（正本）は `docs/_conventions.md`**（このファイルはコピーせずリンクのみ）。ID の追加・改称・廃止は `_conventions.md` の更新でのみ行う。

---

## ID 索引

| ID | ファイル | 名称 | 主 DOM |
|----|----------|------|--------|
| `1a` | `docs/features/1a.md` | トップページ | (top) |
| `2a` | `docs/features/2a.md` | 音の発音を確かめる | `#cardDecode` |
| `2b` | `docs/features/2b.md` | 発音から書いてみる | `#cardEncode` |
| `2c` | `docs/features/2c.md` | 音から単語を覚える | `#cardModeBStudy` |
| `2d` | `docs/features/2d.md` | 連結する音に慣れる | `#cardDecode`（`tab=connected`） |
| `3a` | `docs/features/3a.md` | 学習プロフィール | `#setup` |
| `3b` | `docs/features/3b.md` | 語彙ブラウザ | `#vocabPage` |
| `3c` | `docs/features/3c.md` | IPA 記号ピッカー | `#symbolPickerPage` |
| `3d` | `docs/features/3d.md` | 学習状況 | `#learningStatusPage` |
| `3h` | `docs/features/3h.md` | このアプリについて | `#aboutBlock` |
| `reveal` | `docs/features/reveal.md` | 解答 | `#reveal` |
| `summary` | `docs/features/summary.md` | サマリー | `#summary` |

ID 横断の共通シェル（トップバー・Footer・Modals）・セッションフロー・適応出題・視覚言語トークンは `docs/features/_common.md`。

---

## 読み方

- プロダクトの目的・ポジショニング（WHY）は `docs/product.md`
- データスキーマ・ランタイム契約（JSON フィールド・localStorage・i18n）は `docs/data-contract.md`
- TTS 設計は `docs/tts-design.md`、パイプラインコマンドは `docs/pipeline.md`
- ソースシンボルとの対応（impact-ledger）は `docs/impact-ledger.json`（EPIC #169 完了済み）

**衝突時の優先順位**: `docs/product.md` → `docs/features/<id>.md` → `docs/data-contract.md`。
