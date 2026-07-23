---
id: pj-2026-07-23-c141
aliases:
- pj-2026-07-23-c141
title: '学習状況カードと対象数表示の回帰修正 (#141) — 実装レポート'
created: '2026-07-23'
---

# 学習状況カードと対象数表示の回帰修正 (#141) — 実装レポート

## 関連 Issue / PR

- Issue: #141
- PR: draft PR（作成後に GitHub 上で参照）
- Agent: codex

## Issue 背景（Issue 本文から要約）

PR #140 後、トップの「学習状況を見る」カードがクリックできず、学習プロフィールの対象数表示が重複・残留する回帰が確認された。Issue の事前分類は L2 × C2（Bug fix）、堅固化パターン B、CD 修正不要。現行の分類正本ではユーザー可視の画面フロー修正に該当するため、実態は L2 × C6 として検証した。

## 実装内容

- `.purpose-card` 全体にクリックリスナを登録し、`#purposeGrid` 外の `#progressCard` から `#/progress` へ遷移できるようにした
- 重複要素 `#profileWordCount` とその更新処理を削除し、対象数表示を `#poolNote` に一本化した
- `#poolNote` を CD 指定の 11.5px / `var(--muted)` / `.04em` に調整した
- `#progressCardSubtitle` の静的フォールバックを i18n と同じ「進捗を確認」に揃えた

## 変更ファイル

```
- src/index.template.html (M)
- docs/agent-reports/codex-issue-141-progress-card-pool-count.md (A)
```

## デグレ防止検証

- Runtime code の変更は Issue 指定の `src/index.template.html` のみに限定し、必須実装レポートだけを追加した
- `git diff --check`: 成功
- `profileWordCount` の残存検索: 0 件
- 4 枚の目的カードが従来どおり学習プロフィールへ遷移することを確認
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: Issue 本文の行番号は現行 main と一致したが、`#progressCard` は本文どおり `#purposeGrid` 外に存在していた

## 動作確認

- `npm run build`: 6 言語すべて成功
- `python3 tools/validate_i18n.py`: hard error なし（既存 warning 5 件）
- ローカル HTTP サーバー + ブラウザで「学習状況を見る」をクリックし、hash が `#/progress`、学習状況画面が表示、トップ画面が非表示になることを確認
- 2a 学習プロフィール: `対象 2382 語` が 1 要素だけ表示され、計算済みスタイルが 11.5px / muted color / 0.46px letter spacing であることを確認
- 2d 連結音: `対象 237 句` のみ表示され、古い語数が残留しないことを確認
- 2c 語彙学習: `対象 2308 語` が 1 要素だけ表示されることを確認
- 2b: 学習プロフィールへ遷移し、`対象 2382 語` が表示されることを確認
- ブラウザ console error: 0 件
- データ整合性: Runtime data / i18n schema は変更なし

## 実装過程での気づき

- 前回実行ではローカル commit 後の push が通信制約で失敗し、PR metadata の準備だけで GitHub 上のブランチ・PR・Issue コメントが作成されていなかった
- 今回は commit / push / draft PR 作成 / Issue への PR URL 報告までを一連の完了条件として扱う

## 後続への影響

- 今後の Codex 実装では、ローカル commit を最終成果とせず、依頼範囲に publish が含まれる場合は GitHub 上のブランチ、draft PR、Issue 報告コメントの存在を確認してから完了報告する

## 残課題・申し送り

- なし

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: DOM / CSS / event listener の局所修正だが、複数モードの対象数表示とブラウザ画面遷移の回帰確認が必要だったため L2 が妥当

### 事前 Change Pattern vs 実際

- 事前 Pattern: C2（Issue 本文の旧分類表記）
- 実装中に追加が必要になった Pattern: なし。現行正本では C6（Product behavior / UX）に相当するが、既存分類体系内の表記補正であり新 Pattern 提案ではない

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
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
