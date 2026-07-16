---
id: pj-2026-07-07-596a
aliases:
- pj-2026-07-07-596a
title: CEFR Phase 0-b 実装レポート（D4 訂正版）
created: '2026-07-07'
---
# CEFR Phase 0-b 実装レポート（D4 訂正版）

- 実施日: 2026-07-07
- 指示書: `docs/cursor-instructions-cefr-phase0b.md`（2026-07-07 D4 訂正反映版）
- ブランチ: `main`

## 1. 実施概要

Phase 0-b のうち、D4 訂正に合わせて `reg=regular` でも CEFR フィルタを常時表示・常時適用するように修正した。あわせて仕様文書の誤記（`reg≠regular` 条件、`cefr:null` 前提）を訂正し、指示書コピーを更新した。

## 2. 変更ファイル

- `index.html`
  - `show("cefrField", words)` に変更（`reg` 条件を撤廃）
  - `filteredPool()` の CEFR フィルタを `reg` 非依存で常時適用
- `docs/DESIGN.md`
  - Phase 0-a null 化前提の記述を「復元済み」に訂正
  - `reg===regular` 時スキップ文言を「常時適用」に訂正
- `docs/SPECIFICATION.md`
  - Setup 表の CEFR 表示条件を「Words のみ・常時表示」に訂正
- `docs/cursor-instructions-cefr-phase0b.md`
  - 最新版をコピーして更新

## 3. `git status`（コミット対象）

```
M  docs/DESIGN.md
M  docs/SPECIFICATION.md
M  docs/cursor-instructions-cefr-phase0b.md
M  index.html
```

（`gas/BatchWarm.gs` など既存の無関係変更は除外）

## 4. `python3 tools/validate_i18n.py` 結果

```
[A] UI 言語: ['en', 'fil', 'ja', 'ko', 'zh-Hans', 'zh-Hant']  キー数(en)=163
[B] 音素言語: ['en', 'fil', 'ja', 'ko', 'zh-Hans', 'zh-Hant']  記号数(en)=47
[D] 動的キー接頭辞(前方一致で許容): ['.', 'accent.', 'lang_opts.', 'lvl.']
WARN  [C] fil.json: en と同一値 4件 -> ['back_top', 'brand.name', 'reg.regular', 'tab.connected']
警告 1 件（ハード不整合なし）。
```

## 5. 検証 6-1（Mode A pool数、D4訂正版）

| # | reg | CEFR | 期待 | 実測 | 結果 |
|---|---|---|---:|---:|---|
| 1 | all | A1,A2 | 2,382 | 2,382 | OK |
| 2 | all | A1 | 1,187 | 1,187 | OK |
| 3 | all | A2 | 1,195 | 1,195 | OK |
| 4 | all | A1,A2,B1 | 2,729 | 2,729 | OK |
| 5 | all | B1 | 347 | 347 | OK |
| 6 | all | 全解除 | 0 | 0 | OK |
| 7 | regular | A1,A2 | 838 | 838 | OK |
| 8 | regular | A1,A2,B1 | 1,160 | 1,160 | OK |
| 9 | regular | B1 | 322 | 322 | OK |
| 10 | irregular | A1,A2 | 1,544 | 1,544 | OK |

補足検証:
- `regular + short + A1,A2` = `295`（指示書補助値と一致）

## 6. 検証 6-2（Mode B バンド）

`modeBEligible` 実測:

- A1: 1,113
- A2: 1,195
- B1: 347
- B2: 330
- C1: 0

注記:
- Phase 0-a revert 後のデータでは B2 は空ではないため、空バンド防御ロジックは安全策として維持されるが通常動作では発火しにくい。

## 7. 検証 6-3 / 6-5 / 6-6

- **C1 非表示 + キー残置**
  - UI は A1/A2/B1 のみ
  - `rg '"c1"' i18n/*.json | wc -l` = `6`
- **多言語表示**
  - CEFR ピル文言は A1/A2/B1 共通、ラベルは `lvl.label` を使用
- **回帰**
  - 変更は `index.html` の setup 表示条件と pool 絞り込みのみ
  - Connected/Weak、Mode B 学習フロー、GA/RP 切替には直接変更なし

## 8. 既知の残作業・懸念

1. B2/C1 ピルは将来の Phase 1/2 データ拡充時に UI 露出が必要
2. 空バンド防御ロジックの有効性は、将来データ欠損時のフェイルセーフとして継続確認が必要
