---
id: pj-2026-07-24-a7e1
aliases:
- pj-2026-07-24-a7e1
title: 'PC UI CD compliance follow-up (#150) — 実装レポート'
created: '2026-07-24'
---

# PC UI CD compliance follow-up (#150) — 実装レポート

## 関連 Issue / PR

- Issue: #150
- PR: #152（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #147 後の実機確認で判明した PC ヘッダー未達を補完する L3 / C1+C6。CD は 1a-pc（nav）/ 2*-pc（drill-header）/ 3*-pc（modal chrome）の 3 パターン。あわせて Mode B Study の 2-pane 化と SP-only「TOPへ」を実装。Category F = C。

## 実装内容

### Phase 0
- ブラックリスト md5 26 ファイル記録（完了時 0 mismatches）
- CD / 実装 Recon + CDP visibility テスト設計を Issue Comment に投稿

### Phase 1–4（スコープ 1–5）
- PC drill-header: 戻る / title / progress / 語彙 40px / accent chip / counter。in-play で topbar・brand 非表示
- 3a–3d modal-chrome（3 dots 11px / 高さ 44px）。3g は既存 onboarding-chrome
- `#backTopBtn` を `@media (min-width:1024px)` で `display:none`（SP は維持）
- Mode B Study: `#cardModeBStudyAnswer` 分離 + `applyModeBStudyTwoPane({type:"modeb-study"})` で `body.drill-two-pane`
- `/iː/` は 1a-pc のみ 26px 表示、2*/3* で非表示
- `showPurposeHome` で exclusive page（vocab/progress/symbol）を確実に閉じる

### Phase 5
- `REPOSITORY-STRUCTURE.md`: PC ヘッダー関数・CSS パターン追記
- `LAUNCH-CHECKLIST.md`: 1-H 補完（#150）追記

## 変更ファイル

```
- src/index.template.html (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/agent-reports/cursor-issue-150-pc-compliance-followup.md (A)
```

## デグレ防止検証

- ブラックリスト md5: 0 mismatches（i18n / CD / Runtime contract 含む）
- `npm run build`: 6 言語成功
- 自己判断追加: `showPurposeHome` で exclusive page クリア（vocab から TOP 復帰時の wrap 隠れ残存防止）

## 動作確認

受け入れアサーション:

| 項目 | 結果 |
|---|---|
| drill-header / task-header | 25 |
| 2a-pc…2d-pc | 2 |
| modal-chrome / modal-dots | 15 |
| `@media min-width:1024px` | 3 |
| `#backTopBtn` PC hide | CSS `display:none!important` |
| modeb-study + drill-two-pane / `ctx.type === "modeb-study"` | ≥1 |
| blacklist md5 | 0 mismatches |

動作時 visibility（CDP 1440×900 / 390）:

| 画面 | 確認 |
|---|---|
| 1a | header-nav visible、`/iː/` 26px、TOPへ none |
| 3a | modal-chrome 44px visible、brand/TOPへ none |
| 2a | task-header flex、戻る 38 / 語彙 40 / accent・counter、topbar none |
| 2c Study | `drill-two-pane`、STEP1/STEP2 並置（各幅 ~498） |
| 3b vocab | page modal-chrome visible |
| SP 3a | TOPへ visible（58×44） |

スクショ添付はエージェント技術制約のため不可 → Claude Rv / Naoya 実機前提。

## 実装過程での気づき

- exclusive page は wrap 外のため、modal-chrome を vocab/progress/symbol 各ページ先頭にも配置
- Mode B Study は prompt/answer を DOM 分割し、SP は reveal 後に answer 表示・PC は常時 2 カラム

## 後続への影響

- Issue #147 scope 2 / 4 の動作時ギャップを閉じる
- visibility 検証（matchMedia + getComputedStyle）を以後の UI Issue テンプレに転用可

## 残課題・申し送り

- スクショ 8 画面のエージェント添付不可
- 3e/3f（About 内スクロール / 言語メニュー）は専用フルページ chrome 対象外（既存 UI 維持）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当（事前分類妥当）
- 判定根拠: PC 全画面ヘッダー再構築 + Mode B Study DOM 分割 + exclusive page 同期で L3 相当

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1, C6
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし（ブラックリストで不変）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A: REPOSITORY-STRUCTURE / LAUNCH のみ
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 0–7
- 実際の Phase 数: 0–7（実装は 1 コミットに集約）

### 総合判定

**事前分類妥当** — PR 作成可
