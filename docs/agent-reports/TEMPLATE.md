---
id: pj-YYYY-MM-DD-XXXX
aliases:
- pj-YYYY-MM-DD-XXXX
title: '<Issue タイトル> (#<N>) — 実装レポート'
created: 'YYYY-MM-DD'
---

# <Issue タイトル> (#<N>) — 実装レポート

## 関連 Issue / PR

- Issue: #<N>
- PR: #<M>（draft）
- Agent: <codex / cursor / claude-code>

## Issue 背景（Issue 本文から要約）

(Issue 本文から 3-5 行で要約。改修分類ブロックがあればその内容もここで再掲)

## 実装内容

- (箇条書きで具体的に何をしたか)

## 変更ファイル

```
- <path> (A/M/D)  # A=Added, M=Modified, D=Deleted
```

## デグレ防止検証

- (変更範囲の説明)
- 実装中の自己判断による追加変更: <件数と内容 / なし>
- 実装中に発覚した懸念: <なし / 内容>

## 動作確認

- (Issue の完了定義に対応する確認項目)
- 既存機能への影響: <なし / 内容>
- データ整合性: <対象外 / 確認内容>

## 実装過程での気づき

- (特記事項があれば。例: 既存 PR との関係、GitHub API のフォールバック挙動 など)

## 後続への影響

- (後続タスクへの影響、なければ「なし」)

## 残課題・申し送り

- (未着手のフォローアップ、なければ「なし」)

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: <L1 / L2 / L3 / 未記載>
- 実装後の妥当性判定: <妥当 / 昇格提案 / 降格提案>
- 判定根拠: (1-2 行)

### 事前 Change Pattern vs 実際

- 事前 Pattern: <C1-C7 の該当 / 未記載>
- 実装中に追加が必要になった Pattern: <なし / 追加提案の内容>

### 構造・契約への影響点検

- [ ] Runtime data contract 8 パスへの影響なし
- [ ] i18n schema への影響なし
- [ ] URL 構造への影響なし
- [ ] ビルドシステムへの影響なし
- [ ] AI 参照ドキュメント Category A への影響なし
- [ ] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: <N>
- 実際の Phase 数: <N>
- 相互依存の発生有無: <なし / 内容>

### 総合判定

- [ ] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

<なし / 提案内容と Issue Comment #M へのリンク>
