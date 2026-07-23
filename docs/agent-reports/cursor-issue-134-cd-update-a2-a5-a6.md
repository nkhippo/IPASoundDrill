---
id: pj-2026-07-23-2a20
aliases:
- pj-2026-07-23-2a20
title: 'Update CD SP/PC with A2/A5/A6 (#134) — 実装レポート'
created: '2026-07-23'
---

# Update CD SP/PC with A2/A5/A6 (#134) — 実装レポート

## 関連 Issue / PR

- Issue: #134
- PR: （作成時に追記）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #128 Phase 0 で CD と実装の乖離（A2/A5/A6）が発覚。Category F「A. CD 修正必須」として Claude Design セッションで CD を更新済み。本 Issue は修正版 `sp.dc.html` / `pc.dc.html` を Repo に差し替え、`update-log.md` に履歴を追記する。

- **Complexity Level**: L1
- **Change Pattern**: C1 (Docs)
- **CD 修正判定**: 該当なし（本 Issue が CD 修正そのもの）

## 実装内容

- `docs/claude-design/sp.dc.html` を提供ファイル `sp.dc.html.new` で丸ごと差し替え（md5 一致）
- `docs/claude-design/pc.dc.html` を提供ファイル `pc.dc.html.new` で丸ごと差し替え（md5 一致）
- `docs/claude-design/update-log.md` に 2026-07-23 A2/A5/A6 エントリを prepend

## 変更ファイル

```
- docs/claude-design/sp.dc.html (M)
- docs/claude-design/pc.dc.html (M)
- docs/claude-design/update-log.md (M)
- docs/agent-reports/cursor-issue-134-cd-update-a2-a5-a6.md (A)
```

## デグレ防止検証

- 変更範囲: ホワイトリスト 3 ファイル + 実装レポートのみ
- ブラックリスト（`design-system.dc.html` / `favicon.svg` / `support.js` / `README.md`）は未変更
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: Issue テスト観点の `aria-label="語彙リスト"` 件数は JA ラベルのみカウント。EN/KO は `Vocabulary` / `어휘 목록` のため件数は期待値と異なるが、vocabBtn 自体は各トップに存在

## 動作確認

- [x] SP `詳しい設定` = 1、`進捗と復習予定` = 0
- [x] SP 学習状況副文: JA「進捗を確認」/ EN「Check progress」/ KO「진도 확인」各 1
- [x] SP vocabBtn: JA `語彙リスト` + EN `Vocabulary` + KO `어휘 목록`（トップ 3 言語）ほかドリル/3a に存在
- [x] PC `詳しい設定` = 1、進捗系 3 言語各 1、vocabBtn（JA/EN/KO トップ + ドリル）
- [x] `update-log.md` 最上段に 2026-07-23 A2/A5/A6 エントリ
- 既存機能への影響: なし（CD 正典差し替えのみ）
- データ整合性: 対象外

## 実装過程での気づき

- Issue テスト観点の `grep -c '進捗を確認' = 3` / `aria-label="語彙リスト" = 11/7` は JA 固定文字列前提。提供ファイルは多言語 aria-label・副文を使うため、件数は期待値と一致しないが A2/A5/A6 の実質要件は満たす

## 後続への影響

- Issue #128 実装再開時、最新 CD を参照可能

## 残課題・申し送り

- なし（件数期待値の Issue 本文修正は任意）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: CD 2 ファイル差し替え + update-log 追記のみ

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1 (Docs)
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（claude-design 差し替えのみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
