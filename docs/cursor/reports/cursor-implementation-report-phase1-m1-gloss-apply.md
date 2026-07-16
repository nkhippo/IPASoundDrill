---
id: pj-2026-07-07-4992
aliases:
- pj-2026-07-07-4992
title: Phase 1 M1 gloss 適用実装レポート
created: '2026-07-07'
---

# Phase 1 M1 gloss 適用実装レポート

- 実施日: 2026-07-07
- 指示書: `docs/cursor-instructions-phase1-m1-gloss-apply.md`
- ブランチ: `main`

## 1. 実施概要

Phase 1 M1 パイロット 180 語について、`phase1_pilot_180_with_gloss.json` の翻訳データを `wordlist_GA_a1a2_plus_phonics.json` に適用した。更新対象は `gloss.ja` / `gloss.zh` / `gloss.ko` / `gloss.fil` のみで、他フィールドは変更していない。

## 2. 検証 2-1（適用前）

```
OK: gloss 以外に差分なし
```

適用前サンプル（`ja/zh/ko/fil` はすべて `null`）:

| 語 | gloss（適用前） |
|---|---|
| `abandon` | `{"en": "abandon", "ja": null, "zh": null, "ko": null, "fil": null}` |
| `advance` | `{"en": "advance", "ja": null, "zh": null, "ko": null, "fil": null}` |
| `biochemistry` | `{"en": "biochemistry", "ja": null, "zh": null, "ko": null, "fil": null}` |

## 3. 適用結果

```
gloss 更新完了: 180 語
```

## 4. 検証 2-3（適用後）

```
全アサーション PASS
```

確認内容:
- 総語数: `3239`（変化なし）
- パイロット 180 語すべてで `gloss.ja/zh/ko/fil` が非空
- 各語の `gloss.en` が headword と一致
- 既存語サンプル（`book`, `address`, `light`, `right`, `apple`, `water`, `morning`）の `gloss.ja` が消失していない

適用後サンプル:

| 語 | gloss（適用後） |
|---|---|
| `abandon` | `ja: 見捨てる、放棄する` / `zh: 抛弃、放弃` / `ko: 버리다, 포기하다` / `fil: iwan, talikuran` |
| `advance` | `ja: 前進する、進歩、前もっての` / `zh: 前进、进步、预先` / `ko: 전진하다, 진보, 사전의` / `fil: sumulong, pag-unlad` |
| `biochemistry` | `ja: 生化学` / `zh: 生物化学` / `ko: 생화학` / `fil: biochemistry` |
| `book`（既存） | 変更なし（`ja: 本、予約する、記帳する` 等） |

## 5. ドキュメント更新

- `docs/PURPOSE.md`
  - 依存表 `gloss 品質` を「合計3,239語」に更新
  - 変更履歴 v3.6 を追加

## 6. git status（コミット対象）

```
M  wordlist_GA_a1a2_plus_phonics.json
M  docs/PURPOSE.md
A  phase1_pilot_180_with_gloss.json
A  docs/cursor-instructions-phase1-m1-gloss-apply.md
A  docs/cursor-implementation-report-phase1-m1-gloss-apply.md
```

## 7. 既知の残作業・懸念

1. `neighbors` は引き続き空配列（項目#6で再計算予定）
2. パイロット R4 対象 6 語の narrow IPA / respelling pending は未解決
3. Phase 1 M2 以降（残り 1,589 語）の同型パイプライン展開
