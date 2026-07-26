# CEFR Phase 0-a Revert 実装レポート

- 実施日: 2026-07-07
- 指示書: `docs/cursor-instructions-cefr-phase0a-revert.md`
- 目的: `src: phonics` 652語の `cefr` を `null` から B1/B2 に復元し、関連ドキュメントを訂正

## 1) 変更ファイル

- `wordlist_GA_a1a2_plus_phonics.json`（復元）
- `scripts/apply_phonics_cefr_null.py`（再実行禁止の履歴警告を追加）
- `docs/wordlist-cefr-audit.md`（末尾に「訂正（2026-07-07）」追記）
- `docs/PURPOSE.md`（依存表と履歴を訂正）
- `docs/SPECIFICATION.md`（`cefr` 現状説明と履歴を訂正）
- `docs/cursor-instructions-cefr-phase0a-revert.md`（指示書コピー）

## 2) 差分確認スクリプト結果（指示 2-2）

実行結果:

```
cefr 以外に差分がある語: 0
OK: cefr フィールドのみの差分です。安全に上書きできます。
cefr が異なる語数: 652（期待値: 652）
```

## 3) 復元後検証（指示 2-4）

実行結果:

```
復元後のCEFR分布: {'A1': 1187, 'A2': 1195, 'B1': 347, 'B2': 330}
全アサーション PASS
```

## 4) ドキュメント訂正確認

- `docs/wordlist-cefr-audit.md`
  - 既存内容は保持しつつ、末尾に「訂正（2026-07-07）」を追記
- `docs/PURPOSE.md`
  - `B1/B2 語彙の実データ` を「既存347/330の正当語彙」へ訂正
  - 履歴に `v3.3.1` を追加し、`v3.3` は「後日訂正」を明記
- `docs/SPECIFICATION.md`
  - `cefr` を `A1/A2/B1/B2` 前提へ修正
  - 「Phase 0-a 以降 B2 空」記述を撤回
  - 履歴を「復元」内容へ訂正

## 5) `apply_phonics_cefr_null.py` 注記追加確認

ファイル冒頭 docstring に以下を追加済み:

- `⚠️ HISTORICAL / DO NOT RUN AGAINST PRODUCTION DATA ⚠️`
- CEFR-J 一次データ検証で 652語が正当 B1/B2 と判明した旨
- 履歴記録としてのみ保持し再実行禁止である旨

## 6) 検証 4-3（訂正漏れチェック）

実行コマンド:

```bash
rg -n "B1=25|B2=0|25語|B2 は 0" docs/PURPOSE.md docs/SPECIFICATION.md docs/wordlist-cefr-audit.md
```

結果:
- `docs/PURPOSE.md` / `docs/SPECIFICATION.md` に誤記述は残存なし
- `docs/wordlist-cefr-audit.md` には訂正後の正しい内訳説明として `25語（phoneme_fill）` が残るのみ

## 7) Mode B バンド解放検証（指示 4-2）

- 今回はデータ復元とドキュメント訂正に集中し、UI実機でのバンド解放シナリオは未実施
- ただし分布検証で `B1=347` / `B2=330` は確認済み

## 8) git status（コミット対象前）

```
 M docs/PURPOSE.md
 M docs/SPECIFICATION.md
 M docs/wordlist-cefr-audit.md
 M scripts/apply_phonics_cefr_null.py
 M wordlist_GA_a1a2_plus_phonics.json
?? docs/cursor-instructions-cefr-phase0a-revert.md
?? docs/cursor-implementation-report-cefr-phase0a-revert.md
```

（`gas/BatchWarm.gs` ほか無関係変更は除外）

## 9) 既知の残作業・懸念

- Phase 0-b 指示書本文の一部期待値（`reg=regular` など）は実データ/実装仕様と不整合が残る可能性があるため、必要なら別途訂正版で合わせ込み推奨
- 本訂正の主眼は「誤前提による null 化の復元」であり、UI/ロジック変更は未実施（指示通り）
