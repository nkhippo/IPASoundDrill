---
id: pj-2026-07-20-1e-pr1-report
aliases:
- cursor-implementation-report-phase-1-e-pr1-vocab-symbol
title: Phase 1-E PR-1 Vocab / 3c — 実装レポート
created: '2026-07-20'
---

# Phase 1-E PR-1（`3b` Vocab full-page + `3c` IPA symbol picker）— 実装レポート

## 関連 Issue / PR

- Issue: #91
- PR: #92

## Issue 背景（Issue 本文から要約 + Phase 0 裁定）

Phase 1-E の第一 PR。語彙ブラウザの Blocking UI 解消（Virtualization + Skeleton）と Sticky Filter、および IPA 記号ピッカー `3c` の新設。

**起草時と実態の乖離:** Issue は「Modal `#vocabPage` → Full-Page」と記述したが、Phase 0 で既に Hash Route Non-Modal（`#/vocab`）であることが判明。Claude Comment で解釈確定（Issue 本文 v2 不要）。

**裁定（Claude Comment、全 A 確定）:**

| # | 採用 |
|---|---|
| A1 | Hash 維持、`#/vocab/ipa` 追加 |
| A2 | `body.vocab-page` / `body.symbol-picker-page` で wrap chrome 隠し（exclusive viewport） |
| A3 | scroll + 固定行高（gloss 有無の 2 段） |
| A4 | Time-Slicing 省略、Skeleton は残す |
| A5 | CEFR 初期は全選択（`prev_settings` 非参照） |
| A6 | IPA Chart 新規 + EN 主見出し / L1 副題（ja 充実、他は空可） |
| A7 | `#/vocab/ipa` |
| A8 | Phrases は現行維持（非仮想化） |

## Phase 0 inventory（要約）

| 項目 | 結果 |
|------|------|
| `#vocabPage` | 既に Non-Modal + Hash。不足は exclusive chrome / filter / virt / 3c |
| リスト描画 | 全件 `innerHTML` → 本 PR で virt |
| IPA 検索 | 未実装 → 3c |
| script md5 before（main / PR#90 後） | `c58abfff64db89217a2a77c628a653a3` |
| `var(--legacy-*)` before | 249 |

## 実装内容

- `3b`: `body.vocab-page` exclusive viewport、Sticky Filter（綴り/IPA Segmented・CEFR ピル・検索）、Words のみ Virtualization、Skeleton、A–Z → cum offset ジャンプ、Escape で戻る
- `3c`: `#symbolPickerPage`、`#/vocab/ipa`、Query Chip Editor、IPA Chart パレット、Live IPA substring、結果 virt + `--signal` ハイライト
- i18n: `vocab.filter.*` / `symbol.picker.*` / `symbol.group.*.{en,sub}` / `symbol.height.*.{en,sub}`（182→219）
- docs: DESIGN / SPEC / visual-tokens / screen-data-mapping / LAUNCH / REPOSITORY-STRUCTURE / CSS-CONVENTIONS

## 変更ファイル

```
src/index.template.html
i18n/en.json
i18n/ja.json
i18n/ko.json
i18n/zh-Hans.json
i18n/zh-Hant.json
i18n/fil.json
docs/DESIGN.md
docs/SPECIFICATION.md
docs/LAUNCH-CHECKLIST.md
docs/REPOSITORY-STRUCTURE.md
docs/CSS-CONVENTIONS.md
docs/design/phase-1/visual-tokens.md
docs/design/phase-1/screen-data-mapping.md
docs/cursor/reports/cursor-implementation-report-phase-1-e-pr1-vocab-symbol.md
```

## デグレ防止検証

### ブラックリスト md5

wordlist / connected_speech / weak_forms / guide 不変。既存 i18n value は新規 key 追加のみ（`vocab.title` 等維持）。

### 6 言語 script md5

| | after |
|--|--------|
| en〜fil（共通） | `5b10f4de987ab6ea6279431b2b660d9b` |

### legacy 参照

| | before | after |
|--|--------|-------|
| `var(--legacy-*)` | 249 | **228** |

### i18n leaf

| | before | after |
|--|--------|-------|
| leaf | 182 | **219**（+37。SPEC §5.5 集約は PR-3） |

## 動作確認

- ブラウザ手動確認: ローカル build 後に Naoya さん検証（Chrome Performance / INP / 60fps）
- Virtualization: Words タブで DOM 行数がウィンドウ+buffer に限定されること
- Blocking 回避: 初期描画中に「戻る」で即遷移（exclusive page + virt）
- IPA 検索: `æk` / `ˈæk` / `kæ`≠`æk`（wordlist 実測で差分あり）
- 6 言語 script md5 一致: 確認済

## 実装過程での気づき

- Issue「Modal」は起草時の想定残存。実装名精読（Phase 0）で毎回乖離を拾う運用が有効（本 Issue で 4 事例目）
- Recon §5 の通り検索自体は軽い。ボトルネックは DOM。Time-Slicing 省略裁定は妥当
- A–Z は仮想化後に `scrollIntoView` が使えず、累積行高マップが必須
- 行高は gloss 有無の 2 固定値（案 X）。実測差が大きい場合は Track B で計測キャッシュ（案 Y）

## 後続への影響

- Phase 1-E PR-2（`3d` 学習状況）、PR-3（`3h` / i18n leaf 集約 / `3f` docs）
- Phrases タブの Virtualization は非対象（A8）
- langSwitcher が exclusive page から不可視 → UX 検収で「戻って切替」許容を確認（裁定 A2 注記）
- L3 → Claude Rv 必須

## Complexity Retrospective

| 項目 | 内容 |
|------|------|
| 事前分類 | L3（C3 Structure + C4 UI/UX） |
| 実装で触った範囲 | テンプレート大規模改修 + 6 言語 i18n + 複数 docs。ランタイム契約データは不変 |
| 想定外の広がり | Modal→Route は既済だったため「Route 新設」ではなく exclusive chrome + NFR + 3c 新規。L3 判定は維持 |
| 総合判定 | **事前分類妥当**（昇格・Pattern 追加なし） |

## 残課題・申し送り

- Chrome DevTools での INP < 200ms / 60fps は Naoya さん実機確認
- 他言語の `symbol.group.*.sub` は Track B で拡充可（裁定どおり空許容）

## 今後の派生 Issue 候補

- Phrases タブ Virtualization
- 記号単体 TTS（Track B）
- 行高の実測キャッシュ（案 Y）が A–Z 精度不足の場合
