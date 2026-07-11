---
name: 📝 Docs / Chore
about: ドキュメントのみの更新、リポジトリ整備、CI/CD 設定
title: "【Docs】"
labels: ["docs"]
---

## 背景・目的

（なぜこのドキュメント / 整備が必要か）

## ローンチブロッカー判定

- [ ] 🚨 launch-blocker（2026-07-20 のローンチまでに必須）
- [ ] 📆 track-b（ローンチ後に着手可）

## 実装範囲

- 対象ファイル:
  - `docs/<file>.md`
  - `.github/<file>`
  - `CLAUDE.md` / `.cursor/rules/dev-flow.mdc`（運用ルール変更の場合）

- 変更内容:
  - 〇〇セクションを追加
  - △△の記述を更新

## 完了定義

- [ ] （具体的なドキュメント変更 A が反映されている）
- [ ] （grep で旧記述が完全に消えている）
- [ ] （他のファイルとの整合性が取れている）

## テスト観点

- Markdown レンダリングの確認（GitHub 上でプレビュー）
- リンクの生存確認（他ドキュメントへの参照が正しいパス）
- CI ワークフロー変更の場合：Actions タブで動作確認

## 非対象範囲

（今回の Issue で扱わないこと）

## 運用ルール変更を伴う場合の必須チェック

`CLAUDE.md` / `.cursor/rules/dev-flow.mdc` / `docs/bug-knowledge.md` / `.github/ISSUE_TEMPLATE/*` を編集する場合、`CLAUDE.md` 「## ルール変更時のセルフチェック手順」に従う:

- [ ] Step 1: grep で既存記述の網羅確認を実施
- [ ] Step 2: 連動更新の要否確認
- [ ] Step 3: 変更後の grep 再確認
- [ ] Step 4: Issue 本文に「変更前」「変更後」の対比表を追加

## 優先度

- [ ] ⚡ high
- [ ] 📌 medium
- [ ] 💤 low
