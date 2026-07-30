# docs: stale パス参照修正（docs/cursor/reports/ → docs/agent-reports/ + OPERATIONS.md 旧パス）(#230) — 実装レポート

## 関連 Issue / PR

- Issue: #230
- PR: (このコミットで作成)
- Agent: claude-code

## Issue 背景（Issue 本文から要約）

- Complexity Level: L1 / Change Pattern: C1（docs / behavior-invariant）
- consistency-auditor 監査（2026-07-30、EPIC #209 完了後）で検出された stale パス参照 3 件。
- EPIC #209 の monorepo 化で `docs/cursor/reports/` は `docs/agent-reports/` にリネーム済み、`index.html` は `apps/web/src/index.template.html` に移設済みだが、一部ファイルに旧パスが残存していた。

## 実装内容

- `.github/ISSUE_TEMPLATE/feature.md`: L16 のコメント例示、L53 のチェックボックスの `docs/cursor/reports/` を `docs/agent-reports/` に置換
- `.claude/agents/issue-handler.md`: L54 の実装レポート配置先を `docs/agent-reports/<agent>-issue-<N>-<slug>.md` に修正し、「または再編後の指定先」の曖昧表現を削除
- `docs/OPERATIONS.md`: L148 の `docs/cursor/reports/` を `docs/agent-reports/` に置換、L157・L166 の `index.html` bare 参照を `apps/web/src/index.template.html` に修正

## 変更ファイル

```
- .github/ISSUE_TEMPLATE/feature.md (M)
- .claude/agents/issue-handler.md (M)
- docs/OPERATIONS.md (M)
```

## デグレ防止検証

- Issue が宣言したホワイトリスト 3 ファイルのみを変更（文字列置換のみ、構造変更なし）。
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: `docs/tts-design.md` / `docs/pipeline.md` / `docs/cursor/instructions/*` にも同様の `docs/cursor/reports/` 参照が残存しているが、Issue の非対象範囲（他の governance docs は別 Issue で対応）に明記されているため未修正。

## 動作確認

- `grep -rn "docs/cursor/reports" .github/ .claude/agents/ docs/OPERATIONS.md` → ヒットなし（完了定義どおり）
- `docs/OPERATIONS.md` 内の `index.html` bare 参照 → ヒットなし（`grep -n "index.html" docs/OPERATIONS.md` で無出力）
- `docs/agent-reports/` ディレクトリの存在を確認済み
- 既存機能への影響: なし（ドキュメントのみ）
- データ整合性: 対象外（docs のみ、ランタイム契約 8 パス非該当）

## 実装過程での気づき

- なし

## 後続への影響

- なし（Issue に明記の通り、他 governance docs の同種修正は別 Issue で対応）

## 残課題・申し送り

- `docs/history.md` の旧パス記載は dated 記録のため意図的に対象外（Issue 非対象範囲）
- `docs/tts-design.md` / `docs/pipeline.md` / `docs/cursor/instructions/*` の同種参照は別 Issue で対応予定

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 3 ファイルの単純な文字列置換のみで完了し、構造・契約への影響なし。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 3
- 実際の Phase 数: 3
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
