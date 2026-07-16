---
id: pj-2026-07-09-a6ae
aliases:
- pj-2026-07-09-a6ae
title: 連結音・弱形 CEFR 付与 — 実装レポート
created: '2026-07-09'
---

# 連結音・弱形 CEFR 付与 — 実装レポート

- 実施日: 2026-07-09
- 指示書: `docs/cursor-instructions-merge-cefr-connected-weak.md`
- 提案レポート: `docs/cefr-connected-weak-proposal-report.md`
- ブランチ: `main`

## 1. 実施概要

Claude 提案（`cefr_proposals_merge_ready.json`、237件）を Naoya 確認のうえ**算出結果どおり採用**し、`data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）の各エントリに `cefr` フィールドを追加した。`vocab_cefr`（参考情報）は本番データには含めていない。

方針確定事項（レポート セクション3-2 の14件イディオム引き上げ）は**見送り**、機械算出の `practice_cefr` をそのまま `cefr` としてマージ。

## 2. マージ結果

```
連結句 提案数: 201
弱形 提案数: 36
connected_speech.json 更新: 201/201
weak_forms.json 更新: 36/36
未対応ID: なし
```

## 3. 検証結果

```
連結句 CEFR分布: {'A1': 63, 'A2': 106, 'B1': 19, 'B2': 13}
弱形 CEFR分布: {'A2': 26, 'B1': 10}
```

指示書の期待値と**完全一致**。

全エントリに `cefr` フィールドが存在することを `assert` で確認済み。

## 4. サンプル確認

| ID | 語/句 | cefr | 期待 | 結果 |
|---|---|---|---|---|
| `cs001` | an apple | A1 | A1 | OK |
| `cs046` | what do you want | A1 | A1 | OK |
| `cs182` | blind spot | B2 | B2 | OK |
| `wf001` | a | A2 | A2 | OK |
| `wf011` | can | A2 | A2 | OK |
| `wf032` | he | B1 | B1 | OK |

## 5. ドキュメント更新

- `docs/PURPOSE.md` — 連結句・弱形に CEFR ラベル付与済みを追記、変更履歴 v3.9
- `docs/cefr-connected-weak-proposal-report.md`（提案レポート保管）
- `docs/cursor-instructions-merge-cefr-connected-weak.md`（指示書コピー）

## 6. 変更ファイル

- `data/connected_speech.json`（+`cefr`、201件）
- `data/weak_forms.json`（+`cefr`、36件）
- `cefr_proposals_merge_ready.json`（マージ用ソースデータ）
- `docs/PURPOSE.md`
- 本レポート

## 7. 既知の残作業

1. **UI 配線（別指示）:** 出題カードへの CEFR バッジ表示。`index.html` で `S.cefrLevels` フィルタを連結句・弱形プールにも拡張する必要あり（Mode A 単語フィルタのパターン流用可）
2. **未収録8語:** `devil`, `foremost` 等が Phase 1 M4 以降で wordlist に入った際、関連する連結句・弱形の `vocab_cefr` 再確認で精度向上の余地あり（今回の `cefr` 値は暫定算出ベース）
3. **イディオム性14件:** レポート 3-2 で挙げた L3 定型句の手動引き上げは今回見送り。将来 UI フィルタ運用を見て再検討可能
