---
id: pj-2026-07-19-1d-pr1-report
aliases:
- cursor-implementation-report-phase-1-d-pr1-drill-2a-2b
title: Phase 1-D-PR1 Drill 2a/2b — 実装レポート
created: '2026-07-19'
---

# Phase 1-D-PR1 (`2a` Decode + `2b` Encode) — 実装レポート

## 関連 Issue / PR

- Issue: #87
- PR: #88

## Issue 背景（Issue 本文から要約 + Phase 0 裁定）

Phase 1-B 完了後、ドリル本体を Mood B 化する Phase 1-D の PR1。`2a`/`2b` に Progress meter / CEFR リスタイル / マーキング Mood B / 音象徴 / `.build` legacy 巻き取り / Reveal IPA タイポを入れる。

**Issue 起草時と実態の乖離（Comment `5015824683` で裁定）:**

| Issue 記述 | 実態 / 裁定後の読み替え |
|------------|------------------------|
| §8.4 CEFR「新規」 | 既実装 → Mood B リスタイル |
| §8.5「0→1→2→3 循環」 | 3 スロット `.pc-slot` + `toggleCheckSlot` 維持 |
| §8.6 音節境界 `‧` | wordlist 0 件 → **本 PR 対象外** |
| §8.7 `#revealChecks` は 2c 用 | **誤り** → `2a`/`2b` 用。本 PR で Mood B 化 |

## Phase 0 inventory（要約）

| 項目 | 結果 |
|------|------|
| DOM | `#cardDecode` / `#cardEncode` / `#reveal` 想定どおり |
| STEP | `.qno`（`#dNo`/`#eNo`/`#rNo`） |
| Progress meter | 未実装 → 本 Issue で新設 |
| CEFR / マーキング | 既実装（legacy 見た目） |
| IPA | `buildIpaHtml` / `renderIpaInto` |
| script md5 before | `b14677a5e4c08f83010f9e16a57e2daf` |
| `‧` in wordlist | 0 / 5397 |
| `var(--legacy-*)` before | 281 → after 261（`.build`/kbd 巻き取り） |

## 実装内容

- Progress meter: `#dProgress`/`#eProgress` + `updateProgressMeter()`（`(S.idx+1)/poolTotal`）
- CEFR: `#dCefr`/`#eCefr`/`#rCefr` を `.pill-cefr` 風。`cefr.tag.*` は aria/title 用
- マーキング: `#revealChecks` Mood B。`data-graduated` + `mark.aria.step_*`。`#mbSChecks` 非対象
- 音象徴: `ˈ`/`ˌ` → `--signal`；`.seg.nucleus` → `--stress`。`‧` スキップ
- Reveal IPA: `--font-ipa`、主軸 30–40px。`.res-ok`/`.res-bad` 維持
- `.build`/`.kbd`/`.key`: Mood B トークン、`border-radius: var(--radius-button)`
- `renderBuild` → `buildIpaHtml` 利用
- i18n leaf 172 → **182**（+10）
- docs: DESIGN §2a/2b + Progress/音象徴、visual-tokens §5d–5f、LAUNCH 1-D 部分完了

## 変更ファイル

```
src/index.template.html
i18n/{ja,en,ko,zh-Hans,zh-Hant,fil}.json
docs/DESIGN.md
docs/design/phase-1/visual-tokens.md
docs/LAUNCH-CHECKLIST.md
docs/cursor/reports/cursor-implementation-report-phase-1-d-pr1-drill-2a-2b.md
```

## デグレ防止検証

### ブラックリスト md5

12 ファイル不変（PURPOSE / SPEC / CLAUDE / REPOSITORY-STRUCTURE / CHANGE-CLASSIFICATION / DEV-GUARDRAILS / OPERATIONS / CSS-CONVENTIONS / screen-data-mapping / wordlist / connected / weak）。

### 6 言語 script md5

| | before | after |
|--|--------|-------|
| en〜fil（共通） | `b14677a5e4c08f83010f9e16a57e2daf` | `82c55b7fdd94370d6235b725d96ef348` |

### legacy 参照

| 範囲 | before | after |
|------|--------|-------|
| `var(--legacy-*)` 全体 | 281 | 261 |

## 動作確認

- `node --check`: OK
- `npm run build`: OK
- `validate-cefr-tags.py`: OK
- ブラウザ手動: [ ] Naoya

## 実装過程での気づき

Phase 1-D-PR1 の Issue 起草時に、Recon `screen-data-mapping.md` §6 の記述が `2a`/`2b` の CEFR タグを「新規表示」と表記していたが、実態は既実装のスタイル未適用状態だった。同様に音節境界 `‧` はデータに 0 件、`#revealChecks` は `2a`/`2b` 用（Issue 誤解釈）、マーキング UI は 3 スロット既存（単一循環ではない）、要注意音は nucleus のみ（TRAPSET ではない）。Phase 0 設計懸念点検で全 9 件を検出、Naoya 裁定後に実装再開。Phase 1-C 教訓の継続適用が成功した事例。

## 後続への影響

- Phase 1-D-PR2: `2c`/`2d`、`#mbSChecks`、反対アクセント行 / gloss / TTS Mood B
- TRAPSET 全下線の学習効果検証は別 Issue 候補
- `‧` データ整備後に UI が自動適用される設計を維持
- SPEC §5.5 leaf 数更新は後続 docs Issue

## 残課題・申し送り

- 非 JA/EN の `mark.*` / `progress.*` は JA コピー暫定（Phase 1-G）
- Mode B / `2c`/`2d` の IPA セグメント色は legacy のまま（スコープ外）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2（上限）
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一テンプレート + i18n + docs。裁定でスコープ明確化、L3 不要

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1 + C4
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 影響なし
- [x] i18n キー追加のみ（schema 破壊なし）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] Category A: DESIGN / LAUNCH / visual-tokens（Issue 許可）
- [x] 既存パス依存が壊れていない

### Phase 分割の妥当性
- 想定 Phase 0–5 / 実際: inventory → 裁定待ち → 実装一括 → docs/PR
- 相互依存: Progress / CEFR / marks / IPA が同一カードに同居のため単一 PR 妥当

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 昇格・追加提案がある場合の詳細
なし
