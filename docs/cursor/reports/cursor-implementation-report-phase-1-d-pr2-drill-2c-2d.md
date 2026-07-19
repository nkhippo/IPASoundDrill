---
id: pj-2026-07-19-1d-pr2-report
aliases:
- cursor-implementation-report-phase-1-d-pr2-drill-2c-2d
title: Phase 1-D-PR2 Drill 2c/2d — 実装レポート
created: '2026-07-19'
---

# Phase 1-D-PR2 (`2c` Study + `2d` Connected/Weak) — 実装レポート

## 関連 Issue / PR

- Issue: #89
- PR: （作成時に追記）

## Issue 背景（Issue 本文から要約 + Phase 0 裁定）

Phase 1-D-PR1 完了後、`2c`/`2d` Mood B + Reveal 共通要素一括 Mood B + Band Unlock 削除。

**Issue 起草時と実態の乖離（Comment `5015928600` で裁定、全て A）:**

| Issue 記述 | 実態 / 裁定後 |
|------------|---------------|
| §8.1 Study → Dict | Study-only（意味表示 inline → Got It） |
| §8.2 `cardConnectedDecode` | 存在せず。`#cardDecode` + `tab=connected` |
| §8.2/8.7 `mark:2d` 新設 | 既稼働（`#revealChecks` + `resolveDrillId`→`2d`） |
| §8.3/8.4 `.reveal-alt` / `.reveal-gloss` | `.alt-ipa*` / `#rGloss.word-gloss` |
| §8.5 playicon ×6 | 実態 9 箇所 |
| §8.8 Band 全削除 | Unlock 系のみ。`MODEB_BANDS` は CEFR 許可として残置 |

## Phase 0 inventory（要約）

| 項目 | 結果 |
|------|------|
| script md5 before | `82c55b7fdd94370d6235b725d96ef348` |
| `var(--legacy-*)` before | 261 → after **249** |
| Band DOM / `.band-*` | 既に 0 |
| `#mbSProgress` | 未実装 → 本 Issue で新設 |

## 実装内容

- `2c`: `#cardModeBStudy` Mood B、`#mbSProgress`、`#mbSChecks` Mood B、CEFR pill、IPA 音象徴
- `2d`: `#cardDecode` 再利用の確認のみ（Progress / marks は PR1 適用済）
- Reveal 共通: `.alt-ipa*` / `.word-gloss` / `.playicon` ×9 Mood B
- Band Unlock 削除: `ept_vocab_band` / `MODEB_BAND_UNLOCK_RATIO` / `getVocabBand`/`setVocabBand` / `bandProgress` / `refreshVocabBandUnlock`
- `MODEB_BANDS` / `modeBBandPool` / `modeBEligible` / `MODEB_QUIZ_ENABLED=false` 維持
- docs: DESIGN §2c/2d/2.7/2.8、visual-tokens §5g–5i、LAUNCH 1-D 完了、DOCUMENT-MAP +visual-tokens

## 変更ファイル

```
src/index.template.html
docs/DESIGN.md
docs/design/phase-1/visual-tokens.md
docs/LAUNCH-CHECKLIST.md
docs/DOCUMENT-MAP.md
docs/cursor/reports/cursor-implementation-report-phase-1-d-pr2-drill-2c-2d.md
```

## デグレ防止検証

### ブラックリスト md5
12 ファイル不変。

### 6 言語 script md5

| | before | after |
|--|--------|-------|
| en〜fil（共通） | `82c55b7fdd94370d6235b725d96ef348` | `c58abfff64db89217a2a77c628a653a3` |

### Band / Quiz grep

| パターン | 結果 |
|----------|------|
| `ept_vocab_band` | 0 |
| `MODEB_BAND_UNLOCK_RATIO` | 0 |
| `getVocabBand` | 0 |
| `MODEB_QUIZ_ENABLED = false` | 維持 |
| `MODEB_BANDS` | 残置（CEFR allowlist） |

## 動作確認

- `node --check`: OK
- `npm run build`: OK
- `validate-cefr-tags.py`: OK
- ブラウザ手動: [ ] Naoya

## 実装過程での気づき

Phase 1-D-PR2 の Issue 起草時に、Recon `screen-data-mapping.md` §6 と Phase 1-C 実装状態の乖離が 9 件検出された。特に (a) `2d` は `#cardDecode` 再利用が Track A 初期実装の設計であり、Phase 1-D-PR1 で `#cardDecode` を Mood B 化した際に `2d` の主要な変更が自動適用済みだった、(b) `mark:2d:*` UI は Phase 1-C `resolveDrillId` + Phase 1-D-PR1 の `#revealChecks` Mood B 化で自動的に UI 露出済み、(c) Study モードは Quiz 凍結下では Study-only フロー(Dict は Quiz 経路のみ)、(d) `MODEB_BANDS` は Band 名だが実態は CEFR allowlist で削除不可 — これらは Phase 1-C 実装や Track A 初期設計に関する「実装名レベルの実態」であり、Recon 概念記述だけでは把握できなかった。Cursor Phase 0 設計懸念点検フローで全 9 件を検出、Naoya 裁定 Comment `5015928600` で解釈確定、実装再開。Phase 1-C / 1-D-PR1 / 1-D-PR2 で計 26 件(8+9+9)の Phase 0 乖離検出、フローの確固たる再現性を実証した第 3 事例。

## 後続への影響

- Phase 1-E: marks 集計 UI が Mood B 前提で起票可能
- Phase 1-G: PR1/PR2 i18n 本翻訳
- Phase 1-H: `MODEB_BANDS` リネーム判断、legacy 最終削減

## 残課題・申し送り

- i18n 新規キーなし（PR1 の `progress.*` / `mark.aria.*` / `cefr.tag.*` 流用）
- Quiz 復活は Track B

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2（上限）
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一テンプレート + docs。裁定でスコープ縮小（2d は確認のみ）

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1 + C4
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 影響なし
- [x] i18n キー追加なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] Category A: DESIGN / LAUNCH / visual-tokens / DOCUMENT-MAP（Issue 許可）
- [x] 既存パス依存が壊れていない

### Phase 分割の妥当性
- 想定 Phase 0–5 / 実際: inventory → 裁定 → 実装一括 → docs/PR
- 相互依存: Reveal 共通と Mode B が同一テンプレートのため単一 PR 妥当

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 昇格・追加提案がある場合の詳細
なし
