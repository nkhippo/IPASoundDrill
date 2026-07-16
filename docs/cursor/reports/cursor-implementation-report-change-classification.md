---
id: pj-2026-07-12-5966
aliases:
- pj-2026-07-12-5966
title: Change classification governance — 実装レポート
created: '2026-07-12'
---
# Change classification governance — 実装レポート

## 関連 Issue / PR

- Issue: #33
- PR: #34

## Issue 背景（Issue 本文から要約）

F2（SEO サブディレクトリ）準備の議論で、大規模改修時に Cursor が明文化されていない範囲を推論で進めてしまうリスクが浮上した。既存ガードレールは通常規模には足りるが、ビルド初導入・ファイル移動・複合改修を分類する上位軸が無かった。本 Issue で Complexity Level × Change Pattern の正本を導入し、起票時ブロック必須・Step 3b Retrospective・Category A 連動まで一気に接続した。

## 実装内容

- `docs/CHANGE-CLASSIFICATION.md` 新規（§ 1–13: Level / Pattern / ルール表 / 必須ブロック / Retrospective / 昇格運用 / C7 / 拡張性 / 月次観点）
- `CLAUDE.md`: 起動時参照 + Issue 起票ルールに改修分類ブロック必須
- `.cursor/rules/dev-flow.mdc`: 事前確認 0、Step 3a/3b/4 分割、PR Description に Retrospective チェック
- `docs/DEV-GUARDRAILS.md` § 7: Retrospective テンプレート恒久追加
- `docs/DOCUMENT-MAP.md`: Category A + § 4 必須参照に CHANGE-CLASSIFICATION
- `docs/CURSOR-INSTRUCTION-GUIDE.md` § 1: Level 統合の脚注（本文保持）
- `docs/LAUNCH-CHECKLIST.md`: Phase 1 完了マーク、Phase 5 先行 Issue プレースホルダ

## 変更ファイル

```
- docs/CHANGE-CLASSIFICATION.md (A)
- CLAUDE.md (M)
- .cursor/rules/dev-flow.mdc (M)
- docs/DEV-GUARDRAILS.md (M)
- docs/DOCUMENT-MAP.md (M)
- docs/CURSOR-INSTRUCTION-GUIDE.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-change-classification.md (A)
```

## デグレ防止検証

- Phase 0: 全ファイル md5 記録
- Commit 1 後: CHANGE-CLASSIFICATION.md 追加のみ
- Commit 2 後: ホワイトリスト 7 ファイルのみ差分（+ 本レポート）
- `index.html` / `wordlist_GA_a1a2_plus_phonics.json` md5: 不変
- 自己判断による追加変更: 0 件（Issue に完成形全文が無かったため、§ 構成・完了定義・背景の設計決定に基づき正本を起草。C5/C6 の命名は Issue の C1–C4/C7 文脈から補完）

## 動作確認

- Markdown 相互参照: CHANGE-CLASSIFICATION ↔ CLAUDE / dev-flow / DEV-GUARDRAILS / DOCUMENT-MAP / CURSOR-INSTRUCTION-GUIDE
- grep 確認（Issue 指定）:
  - `Complexity Level|Change Pattern|判定根拠|Pre-Issue Recon` → CHANGE-CLASSIFICATION + CLAUDE に存在
  - `Step 3b|Complexity Retrospective` → dev-flow / CHANGE-CLASSIFICATION / DEV-GUARDRAILS に存在
  - `CHANGE-CLASSIFICATION` → DOCUMENT-MAP Category A / § 4 に存在
- 既存ランタイムへの影響: なし

## 実装過程での気づき

- Issue 本文は CHANGE-CLASSIFICATION の章立てと連動更新仕様は詳細だが、§ 本文の一字一句完成形フェンスは含まれていなかった。完了定義（表の列充足・代表例数・テンプレ）を充足する正本を起草し、Retrospective で「起草範囲」を明示した
- C5（Runtime data/schema）と C6（Product behavior/UX）は Issue 本文でコード名のみ文脈登場（C1–C4/C7 が明示）のため、F2/React/Sentry の例と矛盾しない定義で補完

## 後続への影響

- 以降の全 Issue が改修分類ブロック必須
- 先行 Issue 1（pattern C）/ Issue 2（Vercel Build rollback）/ F2 が本軸で分類可能
- Cursor PR は Step 3b なしでは作成不可（ルール上）

## 残課題・申し送り

- LAUNCH-CHECKLIST Phase 1 の `PR #YY` を本 PR 番号で置換（同一 PR 内で実施）
- GitHub Projects Custom Fields は Naoya 手動（非対象）
- Pattern C（堅固化）と OPERATIONS rollback は別 Issue

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: Category A 正本の新設 + `dev-flow.mdc` の Step 分割 + 6 ファイル連動は L3 条件 1 に該当。コード / ランタイム非変更で Pattern は C1 のまま

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし（docs / ルールのみ。C7 的な再編は「分類正本の新設」であり C1 で表現可能）

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし → **意図的に追加あり**（CHANGE-CLASSIFICATION を Category A に登録）。契約破壊ではなく運用正本の追加
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 3 コミット（新規 / 連動編集 / レポート）
- 実際の Phase 数: 3
- 相互依存の発生有無: なし（新規正本 → 参照側追記の順で整合）

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
