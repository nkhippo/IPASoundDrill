---
id: pj-2026-07-24-b9c2
aliases:
- pj-2026-07-24-b9c2
title: 'docs: font metrics PASS criteria in dev_project_common (#157) — 実装レポート'
created: '2026-07-24'
---

# docs: font metrics PASS criteria in dev_project_common (#157) — 実装レポート

## 関連 Issue / PR

- Issue: #157
- PR: #158（draft）
- Agent: cursor（Issue は ready-for-codex だが Naoya 依頼により Cursor が実施。レポートパスは AGENTS.md に従い `cursor-issue-157-*`）

## Issue 背景（Issue 本文から要約）

改善候補 7 の docs 化。PR #156（Phase 1-G）で確立した font metrics 差の柔軟 PASS 条件を `docs/dev_project_common.md` § 3 に正典化し、以後の C6 CDP QA で自動適用する。L1 / C1。Category F = C。

## 実装内容

- § 3「動作時 visibility 検証」内、CDP テンプレート直後に `#### font metrics 差の判定基準` を追加（背景 / 柔軟 PASS / 判定根拠 / 適用条件 / PR #156 実測例）
- 変更履歴に 2026-07-24 Issue #157 行を追加
- 既存サブ §（判定パターン / CDP テンプレート / regex 精緻化）は保持

## 変更ファイル

```
- docs/dev_project_common.md (M)
- docs/agent-reports/cursor-issue-157-improvement-7.md (A)
```

## デグレ防止検証

- ブラックリスト md5: Phase 0 と完了時で 0 mismatches
- 自己判断による追加変更: なし
- 実装中に発覚した懸念: なし

## 動作確認

受け入れアサーション:

| 項目 | 結果 |
|---|---|
| `font metrics\|ink box\|line box` | ≥1 |
| `柔軟 PASS` / scrollHeight−clientHeight | ≥1 |
| `containerRatio` / `1.05` / subpixel / border-box | ≥1 |
| `PR #156` / `Issue #155` / Phase 1-G | ≥1 |
| `Issue #157` 変更履歴 | ≥1 |
| 既存キーワード（受け入れアサーション等） | 残置 |
| blacklist md5 | 0 mismatches |

- 既存機能への影響: なし（docs のみ）
- データ整合性: 対象外
- スクショ: 不要（Issue 明示）

## 実装過程での気づき

- Issue 完了定義のレポート名は `codex-issue-157-...` だが、実行 agent は Cursor のため AGENTS.md の命名に合わせた

## 後続への影響

- 以後の C6 UI Issue の CDP overflow 判定で本条件を参照可能
- 改善候補 2/6/8 等は本 Issue 非対象のまま

## 残課題・申し送り

- なし

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当（事前分類妥当）
- 判定根拠: 単一 docs 追記のみ、behavior-invariant

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A: `dev_project_common` のみ追記
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 0–4
- 実際の Phase 数: 0–4

### 総合判定

**事前分類妥当** — PR 作成可
