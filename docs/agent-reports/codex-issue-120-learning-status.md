---
id: pj-2026-07-21-c120
aliases:
- pj-2026-07-21-c120
title: 'Phase 1-E PR-2: Learning status 3d (#120) — 実装レポート'
created: '2026-07-21'
---

# Phase 1-E PR-2: Learning status `3d` (#120) — 実装レポート

## 関連 Issue / PR

- Issue: #120
- PR: 本ブランチから draft PR を作成
- Agent: codex

## Issue 背景（Issue 本文から要約）

Phase 1-E PR-1 で完成した full-page route / exclusive viewport / sticky filter / virtualization を基盤に、学習成果を確認する `3d` を追加する。`ept_marks_v1` の4ドリル進捗と、`ept_hist_v1` / `ept_vocab_v1` のSRS期限を一画面に統合し、`1a` から独立機能として到達可能にする。

- Complexity Level: **L2**
- Change Pattern: **C3, C5, C6**
- 判定根拠: `#/progress` と `#learningStatusPage` の構造追加（C3）、6言語 `progress.*` schema 拡張（C5）、集計・フィルタ・direct review の製品挙動追加（C6）。既存 stack / framework は変更しない。
- 適用堅固化パターン: **B**（既存編集、Phase 0–5）

## 実装内容

- `1a` に Feature Card「学習状況を見る」を追加し、`#/progress` へ接続
- `body.progress-page` の exclusive full-page `#learningStatusPage` を追加
- `prev_settings_v1.cefrLevels` 連動 CEFR pills（fallback A1+A2）を実装
- `ept_marks_v1` を4ドリル × 0/1/2/3スロットで集計し、総合 / ドリル別カードを描画
- `2a`–`2c` は wordlist、`2d` は connected + weak を母集団として集計
- `ept_hist_v1` / `ept_vocab_v1` を word 単位で統合し、earliest dueAt・ローカル当日末基準でSRS queueを生成
- queue 100件超の progress 専用 virtualization と、該当語1件の `2c` direct Study 導線を追加
- `progress.*` を6言語で18 leaf 追加（全言語 237 leaf）
- Category A 7文書と CSS migration log を同期

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
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/CSS-CONVENTIONS.md (M)
- docs/SPECIFICATION.md (M)
- docs/DESIGN.md (M)
- docs/design/phase-1/screen-data-mapping.md (M)
- docs/design/phase-1/visual-tokens.md (M)
- docs/agent-reports/codex-issue-120-learning-status.md (A)
```

## デグレ防止検証

- Phase 0 md5 baseline を `/tmp/issue-120/before-all.md5` に取得
- Phase 完了時、runtime data / fonts / historical docs のブラックリスト **137 files md5 全一致**を確認
- Vocab / Symbol の既存 virtualization 関数は変更せず、SRS queue は専用 state / renderer で分離
- `.pill-cefr` / `.progress-meter` は既存意味論を維持し、`setExclusivePage()` は既存3値を変えず `progress` のみ追加
- `var(--legacy-*)` 参照数は **228 → 228**（新画面は Mood B token のみ）
- 実装中の自己判断による追加変更: 1件。ブラウザ検証で `<base href="/">` により言語 pathname が失われる問題を検出し、`history.replaceState` に `location.pathname` を明示
- 実装中に発覚した懸念: Issue の Change Pattern と runtime path 誤記、集計母集団 / SRS重複 / 当日期限境界。Step 2 comment で採用案を提示し承認後に実装

## 動作確認

- `npm run build`: 成功（6言語生成）
- `node --check`: main inline JavaScript 構文成功
- 6言語 script md5: 全て `7a45f8aacf1644bb08c2e59d08025df5` で一致
- 6言語 i18n: schema **237 leaf** で一致、`origin/main` の既存 leaf value は全件不変
- ブラウザ実操作:
  - `1a` の「学習状況を見る」tap → `#/progress`、`body.progress-page`、shell非表示
  - 初期 A1+A2 で4カード描画、総合対象 7,341。CEFR切替10回の集計 mean **2.83ms**（2.2–3.8ms）
  - B1 pill tap → A1+A2+B1 の総合対象 13,718 へ即時再集計
  - `2a` progress card tap → `3a`。`/ja/#/` を保持
  - Escape → `1a`
  - 375×812: 横overflowなし、4カード・CEFR filter表示維持
  - en / ja / ko / zh-Hans / zh-Hant / fil の `#/progress` で各言語タイトルと4カードを確認
  - console warning / error: 0
- SRS zero state: 「復習が必要な単語はありません」を確認
- 既存機能への影響: 目的カード通常導線、Vocab / Symbol route、既存 CSS class の意味論は不変
- データ整合性: runtime JSON / fonts / historical docs は変更なし。marks / SRS の不正 entry は集計から除外

## 実装過程での気づき

- `history.replaceState(null, "", "#/")` は `<base href="/">` の影響で `/ja/` を失うため、言語別 route から hash を置換するときは `location.pathname + "#/"` が必要
- `tools/validate_i18n.py` は廃止済み root `index.html` を固定参照して `FileNotFoundError` になる。root HTML を復活させず、6 JSON の schema 一致・既存 leaf value 不変・生成6 HTMLの script md5 一致を個別検証した
- Codex ネイティブ GitHub connector で Issue Step 2 comment を投稿でき、CLI fallback は未使用

## 後続への影響

- Phase 1-E PR-3 は `3h` 本文と docs / i18n leaf 集約を継続。PR-2 時点の実測 leaf は 237
- Phase 1-F では初回利用時の `3d` zero state 紹介要否を再検討可能

## 残課題・申し送り

- 実データで100件超のSRS queueを持つ利用者環境の体感確認は継続観測。実装上は最大5,397語を想定し、100件超で fixed-row virtualization を適用

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: **妥当**
- 判定根拠: 新規画面と複数LS集計を含むが、既存の単一HTML・route・Mood B・Leitner intervalを再利用し、architecture / framework / runtime contract の変更はなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: Issue 記載 C3,C4。Step 2 で正本に合わせ **C3,C5,C6** に訂正し承認済み
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [ ] i18n schema への影響なし（`progress.*` 18 leaf を意図的に追加）
- [ ] URL 構造への影響なし（`#/progress` を意図的に追加）
- [x] ビルドシステムへの影響なし
- [ ] AI 参照ドキュメント Category A への影響なし（該当7文書を意図的に更新）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 5（Phase 0–5 のパターン B）
- 実際の Phase 数: 5
- 相互依存の発生有無: なし。UI / logic / i18n / docs / verification の順で完結

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし。Step 2 確認: https://github.com/nkhippo/IPASoundDrill/issues/120#issuecomment-5034963253
