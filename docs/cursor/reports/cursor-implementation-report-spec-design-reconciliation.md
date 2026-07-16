---
id: pj-2026-07-16-126f
aliases:
- pj-2026-07-16-126f
title: SPEC/DESIGN reconciliation（Phase 0 段階 2）— 実装レポート
created: '2026-07-16'
---

# SPEC/DESIGN reconciliation（Phase 0 段階 2）— 実装レポート

## 関連 Issue / PR

- Issue: #64
- PR: #68

## Issue 背景（Issue 本文から要約）

Phase 0 UI/UX 抜本見直しの段階 2。Issue #61 Recon で確定した実装↔文書の差分（Category A/B/C の docs-only 部分）を `SPECIFICATION.md` / `DESIGN.md` に吸収し、orphan i18n を 6 言語から削除。Naoya 判断 Q-5-B（Connected は level/type のみ）・Q-6-B（連結 TTS GA 固定）・Q-10-B（footer/audioHint を SPEC 明記）を反映。コード変更なし。

## 実装内容

### Phase 1: SPECIFICATION.md

- 正本を `src/index.template.html` に統一（`index.html` 参照を修正）
- §2.3 TRAPSET / weak spots、§2.3b プリフェッチ定数・Exit→setup・カード内 meter
- §2.5 Mode B 定数（`MODEB_SESSION` / `MODEB_BAND_UNLOCK_RATIO` + 未接続 caveat）
- §4.0 footer / audioHint / modals、§4.1 Connected Q-5-B、§4.5 Quiz DOM 名修正
- §5.2 Connected TTS Q-6-B、§5.3 `va-disable` + TTS キー形式、§5.4 `cefrLevels` / `mbPhase`
- §5.5 i18n **169 leaf**（runtime 165 + build-only meta 4）

### Phase 2: DESIGN.md

- §1.4 SRS 重み（40/40/20、weak 25/55、cold start、frequencyWeight モード）
- §2.4 Q-2 保留 Note、`refreshVocabBandUnlock` 未接続明記
- Exit Yes → setup、UI leaf 数 169 に更新

### Phase 3: i18n orphan 削除（6 言語）

削除 leaf（13）: `set.*`（5）、`hint.*`（3）、`syl` / `syl_pl`、`meter_done`、`summary.again`、`meta.keywords`

### Phase 4: Category A 同期

- `docs/REPOSITORY-STRUCTURE.md` — 正本パス表、i18n schema、169 leaf
- `CLAUDE.md` — `GAS_TTS_URL` パス、§5 多言語 UI leaf 数

## 変更ファイル

```
- docs/SPECIFICATION.md (M)
- docs/DESIGN.md (M)
- i18n/en.json (M)
- i18n/ja.json (M)
- i18n/ko.json (M)
- i18n/zh-Hans.json (M)
- i18n/zh-Hant.json (M)
- i18n/fil.json (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- CLAUDE.md (M)
- docs/cursor/reports/cursor-implementation-report-spec-design-reconciliation.md (A)
```

## デグレ防止検証

- `src/index.template.html` md5: **不変** `4be324de0bd70260e8e60855cbf1e19c`
- 削除キーの template / build 参照: **0**（`audio_tap_hint` は missing のまま・本 Issue 非対象）
- `validate_i18n.py` [A][B]: 6 言語 **169** leaf / 47 phoneme — OK（[C] はルート `index.html` 欠如で既存ツールが FileNotFound。本 Issue 範囲外）
- wordlist / runtime data: 未変更

## 動作確認

- SPEC/DESIGN の Exit・meter・Mode B DOM・Connected フィルタ記述が Recon と整合
- i18n leaf 実測 169（Issue 本文の 172 は 13 削除後の実数と ±3。13 leaf 削除で 182→169）

## 残課題・申し送り

- Category D（half-baked UI）は別 Issue（#61 Recon 参照）
- `audio_tap_hint` i18n 追加は本 Issue 非対象（SPEC に missing 注記のみ）
- `validate_i18n.py` の HTML パスを `src/index.template.html` へ更新する chore は別 Issue 候補

## 今後の派生 Issue 候補

- `chore: validate_i18n.py を template 正本パスに対応`
- `feat: audio_tap_hint` を 6 言語に追加（orphan 解消の逆パターン）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: **妥当**
- 判定根拠: SPEC/DESIGN 複数セクション + i18n 6 ファイル + Category A 2 件。アプリコード不変。Recon 済みで解釈ブロッカーなし。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1（B 意図的編集主）
- 実装中に追加 Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 影響なし（i18n は契約対象だが orphan 削除のみ）
- [x] `src/index.template.html` 不変
- [x] Category A: REPOSITORY-STRUCTURE / CLAUDE のみ意図的更新
- [x] DOCUMENT-MAP 変更なし（Issue 指定どおり）

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 不明点
- Issue 完了定義の「172 leaf」は 13 削除後 **169** が実測。SPEC/REPO/CLAUDE は 169 で統一し本レポートに差分を記録。
