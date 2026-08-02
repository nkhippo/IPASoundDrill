# fix(ui): 単語帳 A-Z ジャンプが PC 2カラム時に動作しない (#285) — 実装レポート

## 関連 Issue / PR

- Issue: #285
- PR: （本コミット後に作成）
- Agent: claude-code (issue-handler)

## Issue 背景（Issue 本文から要約）

Complexity: L1 × C6（`jumpVocabLetter` 関数内の kind 比較条件の修正のみ。データ契約・i18n に触れない）。
PC の単語帳画面で A-Z ジャンプボタンをクリックしても反応しない不具合。`jumpVocabLetter()` (line 2278) が `vocabVirtState.slots` から `kind === "row"` のスロットのみを検索するが、PC 2カラムレイアウト時は `rebuildVirtSlots()` が `kind: "row2"`（`items` 配列を持つ複数アイテムスロット）を生成するため、`findIndex` が常に `-1` を返し発火しない。SP 1カラム時は `kind: "row"` のため正常動作していた。

## 実装内容

- `apps/web/src/index.template.html` の `jumpVocabLetter` 関数（line 2280-2281）の `findIndex` 条件を修正。`s.kind === "row"` 単体条件から、`row`（`s.item` 単体）と `row2`（`s.items` 配列、`Array.some()` でマッチ）の両方に対応するコールバックに変更。

## 変更ファイル

```
- apps/web/src/index.template.html (M)
- docs/agent-reports/issue-handler-issue-285-vocab-az-jump-row2.md (A)
```

## デグレ防止検証

- Issue 本文ホワイトリスト（`apps/web/src/index.template.html` のみ）どおり、`jumpVocabLetter` 関数内の 1 箇所のみを修正。他の関数・ファイルには一切触れていない。
- Issue 本文に記載の diff（Before/After コードスニペット）と実装結果が完全一致することを確認。
- `rebuildVirtSlots`（line 2164-2183）のソースを確認し、`row2` スロットが `{ kind: "row2", items: [c1, c2, ...], h }` の形（`items` は配列、各要素が `w` プロパティを持つ）であることを実装前に検証済み。
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: なし

## 動作確認

- `apps/web/src/index.template.html` 内の全 6 個の inline `<script>` ブロックを抽出し `node --check` で構文検証、全ブロックがエラーなく通過。
- コードレビューでロジック確認: `row` スロットは従来どおり `s.item.w[0]` で先頭語をチェック、`row2` スロットは `s.items.some(it => it.w[0].toUpperCase() === L)` で 2 アイテムのいずれかが対象アルファベットで始まるかをチェック。マッチしなければ `false` を返す（フォールスルー防止）。
- 実機・ブラウザでのクリック確認は本セッションでは未実施（Web は Vercel branch preview URL での見た目確認が正本。CLAUDE.md 記載どおり Naoya のレビュー時に確認を前提とする）。

## 実装過程での気づき

- 特になし。Issue 本文の差分指示がそのまま既存コードと一致しており、迷いなく適用できた。

## 後続への影響

- なし（Issue 本文記載どおり）。

## 残課題・申し送り

- なし

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一ファイル内の単一関数の条件分岐修正のみで完結。データ契約・i18n・共通シンボルへの波及なし。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C6（Product behavior / UX）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
