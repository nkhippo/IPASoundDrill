---
id: pj-2026-07-24-i163
aliases:
- pj-2026-07-24-i163
title: 'PC UI 品質補完 Phase 2 (#163) — 実装レポート'
created: '2026-07-24'
---

# PC UI 品質補完 Phase 2 (#163) — 実装レポート

## 関連 Issue / PR

- Issue: #163
- PR: 未作成（ローカル対応）
- Agent: codex

## Issue 背景（Issue 本文から要約）

PC ドリル `2a-pc`〜`2d-pc` と語彙リスト `3b-pc` を更新済み Claude Design に合わせて品質補完する L3 / C6（C1 docs 併設）改修。ドリルでは STEP 1 badge とカード内の重複進捗を除き、タスクヘッダーの進捗へ集約する。語彙リストでは 3 モード×3 スロットの誤表示を、現在の目的に対応する単一 3 スロットへ整理する。

## 実装内容

- ユーザー提供の更新済み `IPA - PC.dc.html` を PC Claude Design baseline として同期した。SP / Design System は既存ファイルと同一だったため変更していない。
- PC ドリルでカード上部 badge とカード内進捗を非表示にし、タスクヘッダー meter を先頭問でも 2px 表示するようにした。
- PC 2 ペイン境界を `--hair`、次ボタンを `--signal` に統一した。
- PC 語彙リストをカード行に整え、各語のチェックを「現在の目的」1 モード分の 3 スロットだけ表示するよう変更した。保存 schema `ept_checks_v1` は維持した。
- PC の IPA 絞り込みに「全消去」と記号ピッカー導線を配置し、ピッカー往復時に最大 3 記号の検索状態を同期した。
- Launch Checklist に Phase 2 完了行を追加した。

## 変更ファイル

```text
- docs/claude-design/pc.dc.html (M)
- src/index.template.html (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/agent-reports/codex-issue-163-pc-quality-phase2.md (A)
```

## デグレ防止検証

- Runtime data / phoneme i18n / font / Design System / SP CD / UI i18n の MD5 は着手時から不変。
- PC CD baseline MD5: `5cb215f917d8796672eb59dd266d978b`（ユーザー提供版の同期後を Phase 1 着手時点とした）。
- UI i18n JSON は変更せず、既存の `checks.progress` / `symbol.picker.title` を再利用した。
- 実装中の自己判断による追加変更: 1 件。PC 3b の新しいピッカー導線で検索状態が分離しないよう、既存 3c と 3b の query を往復時に同期した。
- 実装中に発覚した懸念: なし。

## 動作確認

| viewport | screen | CDP 確認結果 |
|---|---|---|
| PC 1440×900 | 2a | STEP badge / カード進捗非表示、header meter 先頭 2px、次問で counter 更新、横 overflow 0 |
| PC 1440×900 | 2b | 同上、横 overflow 0 |
| PC 1440×900 | 2c | 同上、横 overflow 0 |
| PC 1440×900 | 2d | 同上、横 overflow 0 |
| PC 1440×900 | 3b | 1 モード×3 slot、旧 `.pc-mode` 0、全消去 disabled↔enabled、横 overflow 0 |
| SP 390×844 | 2a | badge / カード進捗を維持、task header 非表示、横 overflow 0 |
| SP 390×844 | 2b | 同上、横 overflow 0 |
| SP 390×844 | 2c | 同上、横 overflow 0 |
| SP 390×844 | 2d | 同上、横 overflow 0 |
| SP 390×844 | 3b | 3 slot 操作を維持、横 overflow 0 |

- ブラウザーコンソール error: PC / SP とも 0 件。
- `npm run build`: PASS（6 locale HTML 生成）。
- `python3 tools/validate_i18n.py`: PASS（既存の同一値 warning 5 件、hard mismatch 0 件）。
- `git diff --check`: PASS。
- 既存機能への影響: SP 表示と保存 schema を維持。
- データ整合性: blacklist / UI i18n の MD5 一致を確認。

## 実装過程での気づき

- 語彙リストのチェックは表示を単一化しても、現在のドリル種別を `d/e/l` に対応させることで既存データを移行せず利用できた。
- PC 3b では inline keyboard を非表示にするため、3c ピッカーから 3b へ検索 query を戻す処理が導線成立に必要だった。

## 後続への影響

- なし。

## 残課題・申し送り

- Draft PR 上の Vercel Preview で実機相当の最終目視を行う。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: PC/SP の分岐、virtualized 語彙行、既存チェック schema、ピッカー導線を横断する変更だったため。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C6 + C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1（承認済み CD baseline 同期は Phase 0）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし。
