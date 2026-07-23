---
id: pj-2026-07-23-128c
aliases:
- pj-2026-07-23-128c
title: 'Align all SP screens with Claude Design (13 items, C1 dropped, guide modal removed) (#128) — 実装レポート'
created: '2026-07-23'
---

# Align all SP screens with Claude Design (13 items, C1 dropped, guide modal removed) (#128) — 実装レポート

## 関連 Issue / PR

- Issue: #128
- PR: draft（作成予定）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #128 は、Phase 1-E 完了後の実機確認で SP UI と `docs/claude-design/sp.dc.html` の乖離が見つかったことを受け、CD を正典として SP 全画面の意匠を収束させる L3 × C6/C1 の改修。トップの目的カード分離、3a プロフィール、Reveal マーキング、3b/3c/3d 支援画面、ガイドモーダル廃止、復習キュー削除、iPhone 16 幅の崩れ防止が完了定義。

## 実装内容

- `src/index.template.html` のトップを CD の 1a 構成に寄せ、terracotta スワッシュ、副文、属性ストリップ、アイコン付き目的カード、独立した「振り返る」カードを実装。
- `3a` 学習プロフィールにイントロ文、カード型 CEFR 5 択（A1/A2/B1/B2/すべて）、情報パネルを追加し、C1 表示を削除。
- Reveal / Mode B Study のマーキング UI を 20px 正方形スロット、一体化カード枠、「覚えた/Marked X/3」ラベルに更新。
- `3b` 語彙リストと `3c` IPA ピッカーの SP 密度・カード・IPA チップ/パレットを CD 方向に調整し、IPA query は最大 3 個に制限。
- `3d` 学習状況から「復習が必要な単語」セクションおよび SRS queue DOM/JS 参照を削除。
- ガイドモーダルのヘッダーアイコン、DOM、ロード/レンダリング/イベント、`i18n/*.json` の `guide` キーを削除。
- `i18n/*.json` から `lvl.c1` と `progress.review_queue` を削除し、6 言語の key parity を揃えた。
- `docs/LAUNCH-CHECKLIST.md` に Issue #128 の CD 収束タスクを追記。

## 変更ファイル

```
- src/index.template.html (M)
- i18n/en.json (M)
- i18n/ja.json (M)
- i18n/ko.json (M)
- i18n/zh-Hans.json (M)
- i18n/zh-Hant.json (M)
- i18n/fil.json (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/agent-reports/cursor-issue-128-align-sp-claude-design.md (A)
```

## デグレ防止検証

- Phase 0: `/tmp/issue-128/before-all.md5` と `/tmp/issue-128/before-blacklist.md5` を取得。
- Phase 0 差分確認: CD 対現行の既知差分は Issue 本文 13 項目内に収まるため実装続行。Issue 外の追加差分判断は行っていない。
- 実装中の自己判断による追加変更: なし（Issue の 13 項目と i18n 削除指示に限定）。
- 実装中に発覚した懸念: Issue 本文は C6/C1 だが、実装範囲に i18n キー削除が明示されているため、検証では C5 相当の i18n parity 確認も実施する。

## 動作確認

- 実装初回コミット時点: 未実施（この後、`npm run build`、`python3 tools/validate_i18n.py`、grep、ブラウザ確認を実施して追記）。
- 既存機能への影響: 検証後に追記。
- データ整合性: `i18n/*.json` を変更したため `tools/validate_i18n.py` を実行予定。wordlist / data 本番 JSON は未変更。

## 実装過程での気づき

- 現行正本はルート `index.html` ではなく `src/index.template.html`。Issue ホワイトリストの `index.html` は F2 後の構成に合わせてテンプレート編集へ読み替えた。
- Issue コメント投稿用 MCP は今回の自動化環境に公開されていないため、Phase 0 相当の差分・懸念は本レポートと PR body に記録する。

## 後続への影響

- Phase 1-F（オンボーディング 3g）着手前に、SP のトップ・支援画面・マーキング UI が CD に近い状態へ揃う。
- ガイドモーダルを廃止したため、将来のオンボーディング再表示導線は Issue #128 の非対象範囲である 3g 実装時に改めて定義する必要がある。

## 残課題・申し送り

- PC 版の詳細な意匠点検は Issue 非対象。SP 変更による PC 破壊がないことのみ検証する。
- `docs/REPOSITORY-STRUCTURE.md` / `docs/SPECIFICATION.md` には旧 guide / review_queue 記述が残るが、Issue #128 のブラックリストに含まれるため本 PR では編集しない。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: SP 全画面の UI/UX、DOM、CSS、i18n 削除、進捗画面の機能削除にまたがる大規模ユーザー可視変更であり、L3 の事前分類は妥当。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C6, C1
- 実装中に追加が必要になった Pattern: なし（i18n キー削除は Issue 本文の明示スコープとして処理し、validate_i18n で検証）

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（i18n UI JSON は Issue 明示の削除のみ。wordlist/data/fonts/GAS URL は未変更）
- [x] i18n schema への影響は Issue 明示の `guide` / `lvl.c1` / `progress.review_queue` 削除に限定
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響は `docs/LAUNCH-CHECKLIST.md` の Issue 反映のみ
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 4（Phase 0 差分確認、UI 実装、i18n/docs/report、検証）
- 実際の Phase 数: 4
- 相互依存の発生有無: あり。ガイドモーダル DOM 削除と i18n キー削除は同時に行い、null 参照を消す必要があった。

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし。
