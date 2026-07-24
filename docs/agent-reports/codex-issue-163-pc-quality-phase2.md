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
- PC 語彙リストをカード行に整え、各語のチェックを「現在の目的」1 モード分の 3 スロットだけ表示するよう変更した。保存 schema `ept_checks_v1` は維持し、SP では既存の 3 モード × 3 スロットを維持した。
- PC の IPA 絞り込みに「全消去」と記号ピッカー導線を配置し、ピッカー往復時に最大 3 記号の検索状態を同期した。
- 既存ローカル作業の継続検証で、2 ペイン divider が高優先度 CSS に上書きされていた点と、PC 用単一 3-slot が SP にも適用されていた点を検出し、PC/SP の表示を分離して修正した。
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
- 継続時に発覚した懸念: 2 件。PC divider の CSS cascade 不整合と SP 3×3 control の意図しない単一化。いずれも Issue の既定スコープ内で修正し、PC/SP 実行確認を再実施した。

## 動作確認

### CDP visibility QA

| viewport | 言語 | 画面 | selector | 項目 | 期待 | 実測 | 判定 |
|---|---|---|---|---|---|---|---|
| PC 1440×900 | ja | 2a | `#cardDecode > .card-top` / `.drill-progress` | visible | 両方 hidden | `display:none`, 0×0 | PASS |
| PC 1440×900 | ja | 2a | `#cardDecode` | divider | `--hair` 1px | `rgb(231,220,207)`, 1px | PASS |
| PC 1440×900 | ja | 2a | `#taskHeaderMeterFill` / `#nextBtn` | meter / color | 先頭 2px / `--signal` | 2×6px / `rgb(12,124,126)` | PASS |
| PC 1440×900 | ja | 2b | `#cardEncode > .card-top` / `.drill-progress` | visible | 両方 hidden | `display:none`, 0×0 | PASS |
| PC 1440×900 | ja | 2b | `#taskHeaderMeterFill` | meter | 先頭 2px | 2×6px | PASS |
| PC 1440×900 | ja | 2c | `#cardModeBStudy > .card-top` | visible | hidden | `display:none`, 0×0 | PASS |
| PC 1440×900 | ja | 2c | `#cardModeBStudy` / `.reveal-next` | divider / color | `--hair` 1px / `--signal` | `rgb(231,220,207)`, 1px / `rgb(12,124,126)` | PASS |
| PC 1440×900 | ja | 2d | `#cardDecode > .card-top` / `.drill-progress` | visible | 両方 hidden | `display:none`, 0×0 | PASS |
| PC 1440×900 | ja | 2d | `#cardDecode` / `#nextBtn` | divider / color | `--hair` 1px / `--signal` | `rgb(231,220,207)`, 1px / `rgb(12,124,126)` | PASS |
| PC 1440×900 | ja | 3b | `.vocab-row` | card / overflow | radius 14px、横 overflow なし | 784×205.59px、radius 14px、overflowX=false | PASS |
| PC 1440×900 | ja | 3b | `.progress-slots` / `.progress-modes-sp` | visible slots | 単一 3-slot / SP control hidden | visible slot 3、SP group `display:none` | PASS |
| PC 1440×900 | ja | 3b | `#vocabIpaClear` | state / token | 7px 16px、pill、disabled↔enabled | padding 7px 16px、radius 999px、`true→false→true` | PASS |
| PC 1440×900 | ja | 3b→3c→3b | `#vocabIpaChips` | query 同期 | `i` を維持 | chip `i`、clear enabled | PASS |
| SP 390×844 | ja | 2a | `.card-top` / `.drill-progress` / `#taskHeader` | visible | visible / visible / hidden | 328×23.2 / 328×28.5 / `display:none` | PASS |
| SP 390×844 | ja | 2b | `.card-top` / `.drill-progress` / `#taskHeader` | visible | visible / visible / hidden | 328×23.2 / 328×28.5 / `display:none` | PASS |
| SP 390×844 | ja | 2c | `#cardModeBStudy > .card-top` / `#taskHeader` | visible | visible / hidden | 328×23.2 / `display:none` | PASS |
| SP 390×844 | ja | 2d | `.card-top` / `.drill-progress` / `#taskHeader` | visible | visible / visible / hidden | 328×23.2 / 328×28.5 / `display:none` | PASS |
| SP 390×844 | ja | 3b | `.progress-modes-sp` / `.progress-slots` | visible slots | 3×3 visible / PC group hidden | 9 slots visible / `display:none` | PASS |
| SP 390×844 | ja | 3b | `.vocab-ipa-keyboard` / `#vocabIpaPickerOpen` | visible | inline keyboard visible / PC 導線 hidden | 332×246px / `display:none` | PASS |

- 上記 PC/SP 全画面で `documentElement.scrollWidth === clientWidth`（PC 1440/1440、SP 390/390）。
- 対象 selector の `overflowX` はすべて false。font metrics 許容判定を要する 1–3px 縦差候補はなし。
- 3b slot 操作: PC は現在 mode の `0/3→1/3`、SP は decode の `1/3→2/3` を操作し、表示中 control と非表示の対応 control が同じ保存値へ同期。
- 3b 全消去: query なしで disabled、ピッカーで `i` 選択後に enabled、全消去後に disabled へ復帰。

- ブラウザーコンソール error: PC / SP とも 0 件。
- `npm run build`: PASS（6 locale HTML 生成）。
- `python3 tools/validate_i18n.py`: PASS（既存の同一値 warning 5 件、hard mismatch 0 件）。
- `git diff --check`: PASS。
- 受け入れ grep: CD の `pc-slot|3 slot|覚えた` 6 件、「全消去」1 件、Runtime の `.pc-slot` size 定義 5 件、3-column/3x3 grid 0 件。
- Phase 1 blacklist: Phase 0 CD baseline commit `4aec854` との差分 0 件。PC CD md5 `5cb215f917d8796672eb59dd266d978b` を維持。
- 既存機能への影響: SP の badge / カード進捗 / 3 モード×3 slot と保存 schema `ept_checks_v1` を維持。
- データ整合性: Runtime data、phoneme i18n、UI i18n、font、SP CD、Design System CD の Phase 1 baseline との差分 0 件。

## 実装過程での気づき

- 語彙リストのチェックは表示を単一化しても、現在のドリル種別を `d/e/l` に対応させることで既存データを移行せず利用できた。
- PC 3b では inline keyboard を非表示にするため、3c ピッカーから 3b へ検索 query を戻す処理が導線成立に必要だった。
- PC と SP で同じ保存 schema を使いつつ表示仕様が異なるため、PC 用単一 3-slot と SP 用 3×3 control を viewport で排他的に表示し、更新処理で両 DOM を同期する必要があった。

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
