---
id: pj-2026-07-12-c324
aliases:
- pj-2026-07-12-c324
title: DOC-SYNC-PLAYBOOK — ソース ⇔ ドキュメント同期プレイブック
created: '2026-07-12'
---

# DOC-SYNC-PLAYBOOK — ソース ⇔ ドキュメント同期プレイブック

> **Last updated**: 2026-07-12
> **Purpose**: ソースコードと参照ドキュメント（PURPOSE.md, DESIGN.md, SPECIFICATION.md 等）の同期作業を Cursor Haiku が機械的に実行できるよう、判定マトリックスと実行手順を明示する。

---

## 1. 適用範囲

このプレイブックは以下の Issue で参照される:

- `docs: refresh <ドキュメント名> per DOC-SYNC-PLAYBOOK` タイプの Issue
- 具体例: PURPOSE.md、DESIGN.md、SPECIFICATION.md、OPERATIONS.md、REPOSITORY-STRUCTURE.md（JS map 部分）等の刷新

## 2. 判定マトリックス（3 分岐）

Cursor は対象ドキュメントの各章について、以下のマトリックスに従って判定する:

| # | ソースコードでの状態 | ドキュメントでの記載 | 過去の作業指示 | Cursor のアクション |
|---|---|---|---|---|
| 1 | 実装されている | 記載なし | - | **ドキュメントを更新（追記）** |
| 2 | 実装されていない | 記載なし | - | **ノータッチ** |
| 3 | 実装されていない | 記載あり | 削除履歴あり | **ドキュメントを更新（該当セクション削除）** |
| 4 | 実装されていない | 記載あり | 削除履歴なし | **中断、Issue Comment で Naoya に報告** |

## 3. 過去の作業指示の確認先

Cursor は分岐 3・4 の判定で以下を検索する:

- `docs/agent-reports/` 配下の全ファイル（新規実装レポート）
- `docs/cursor/reports/` 配下の全ファイル（2026-07-20 以前の historical archive）
- 検索キーワード:
  - 「削除」「除去」「廃止」「削減」「撤去」「取り除く」
  - 「remove」「delete」「deprecate」「eliminate」「discard」
  - 「roll back」「revert」（切り戻し）
- クローズ済み Issue（GitHub UI 経由、`Closes #NN` を参照）

削除履歴が明確に見つかった場合のみ「分岐 3」と判定。曖昧な場合は必ず「分岐 4」（中断）を選ぶ。

## 4. Cursor の実行手順

1. **対象 MD の各章を順次スキャン**
   - 章 = `##` または `###` の見出しで区切る
   - 章ごとに独立して判定
2. **各章の「対応するソースコード」を特定**
   - REPOSITORY-STRUCTURE.md の JS map、ファイル一覧、i18n schema を参照
   - 章の見出しに `<code_ref: path/to/file.ext, function_name, LNNN>` のような明示的マーカーがあればそれを使う
   - マーカーがない場合、章のタイトルから推論（例: 「モード開始処理」→ index.html の `startMode()` 関数）
3. **判定マトリックスに従って判定**
   - 分岐 1: 章の内容を実装に合わせて追記・修正
   - 分岐 2: 何もしない
   - 分岐 3: 章を削除（コミットメッセージに削除理由を明記）
   - 分岐 4: 中断、Issue Comment に報告
4. **更新した章の末尾に「Last synced with code」を今日の日付で追加**
   - 例: `_Last synced with code: 2026-07-12_`
5. **全章スキャン完了後、コミット**
6. **中断があった場合、Issue Comment に「削除履歴が確認できない機能: XX」を全リスト報告**

## 5. 中断時の Issue Comment テンプレート

```markdown
🛠️ **Cursor より（DOC-SYNC 中断報告）**

## 中断理由

DOC-SYNC-PLAYBOOK § 2 の分岐 4（実装なし + ドキュメント記載あり + 削除履歴なし）に該当する項目を検知しました。

## 該当項目

対象ドキュメント: `docs/<filename>.md`

- **§ <章番号>. <章タイトル>**
  - ドキュメント記載: <該当セクションの要約>
  - ソースコードでの状態: 該当実装が見つからない
  - 検索した過去の作業指示: <検索キーワード列挙>
  - 検索結果: 削除履歴なし

（複数ある場合は列挙）

## Naoya さんへの相談

各項目について以下のいずれかを指示してください:

- A. ソースを確認して復活実装する（別 Issue 起票）
- B. ドキュメントから削除する（追加指示を Issue 本文に追記）
- C. 保留する（何もしない、Cursor は該当章を触らない）

---
_Cursor による自動投稿_
```

## 6. 章末マーカーの導入

各ドキュメントの章末に以下のマーカーを追加すると、次回の DOC-SYNC 実行が加速する:

```markdown
### モード開始処理

（章の内容）

<!-- code_ref: index.html, startMode(), L456-L512 -->
_Last synced with code: 2026-07-12_
```

- `<!-- code_ref: ... -->`: この章が対応するソースコードの位置
- `_Last synced with code: YYYY-MM-DD_`: 最後にソースと同期した日付

Cursor は次回スキャン時、`code_ref` マーカーがあれば直接該当ソース箇所を確認できる。マーカーがなければ推論で位置を特定する（精度低下）。

## 7. 例外条項

以下のドキュメントは本プレイブックの対象外:

- `README.md`（ユーザー向け、Naoya さんが手動更新）
- `CLAUDE.md`, `.cursor/rules/dev-flow.mdc`（AI 向けルール、実装ではなく方針の集合）
- `docs/DOCUMENT-MAP.md`, `docs/DEV-GUARDRAILS.md`, `docs/DOC-SYNC-PLAYBOOK.md`, `docs/agent-instruction-guide.md`（AI 向けガイド、実装ではなくルールの集合）
- `docs/agent-reports/` 配下（実装レポート）
- `docs/cursor/reports/` 配下（過去の記録、書き換え禁止）
- `docs/archive/` 配下

## 8. 運用の継続性

- Issue 起票時、対象ドキュメントに `code_ref` マーカーがあるかを Claude が確認
- なければ「初回スキャン時、Cursor は推論で位置を特定し、その位置を `code_ref` マーカーとして章末に追加する」ことを Issue 本文で指示
- 次回以降のスキャンは `code_ref` マーカー経由で高速化
- 月次レビューで `Last synced with code` の古い章を Naoya さんが確認、必要なら DOC-SYNC Issue 起票
