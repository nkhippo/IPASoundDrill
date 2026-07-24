---
id: pj-2026-07-24-cdfe
aliases:
- pj-2026-07-24-cdfe
title: 'Phase 1-F — 3g onboarding + SP guide ? (#149) — 実装レポート'
created: '2026-07-24'
---

# Phase 1-F — 3g onboarding + SP guide ? (#149) — 実装レポート

## 関連 Issue / PR

- Issue: #149
- PR: #151（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Phase 1-F。CD `#3g`（SP 4 スライド）と `#3g-pc`（PC 4 カード）のオンボーディングを実装し、`localStorage.onboarding_completed_v1` で初回自動発火／完了を管理する。あわせて SP ヘッダーに guide `?` を再導入し、任意再表示（LS 非更新）を可能にする。L3 / C1+C5+C6、Category F = C（CD 不変）、Claude Rv 必須。

## 実装内容

### Phase 0
- ブラックリスト md5 19 ファイル記録（完了時 0 mismatches）
- CD recon と再利用パターン（`#exitConfirmModal` / `.modal`）を Issue Comment に投稿

### Phase 1（UI + LS + guide）
- `#onboardingModal`: SP 4 スライド（dots / skip / next→start）+ PC 4 カード grid（≥1024px）
- `#guideBtn`（`aria-label="ガイド"`）を vocab 隣に配置、`@media (min-width:1024px)` で非表示
- LS `onboarding_completed_v1`: 未完了時 `maybeShowOnboarding`、skip/start で `"true"`、`reopenOnboarding` は LS 非更新

### Phase 2（i18n）
- 6 言語に `onboarding.slide_1`〜`4`（title/body）+ `next`/`skip`/`start` ほかガイド文言を追加
- `validate_i18n.py`: hard error 0

### Phase 3（docs）
- `DIVERGENCE.md`: SP guide 行を削除しテーブルヘッダーのみ
- `LAUNCH-CHECKLIST.md`: 1-F 完了マーク
- `REPOSITORY-STRUCTURE.md`: i18n `onboarding`・LS キー・JS マップ追記

## 変更ファイル

```
- src/index.template.html (M)
- i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json (M)
- docs/claude-design/DIVERGENCE.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/agent-reports/cursor-issue-149-phase-1-f.md (A)
```

## デグレ防止検証

- ブラックリスト md5: Phase 0 と完了時で全一致（0 mismatches）
- `python3 tools/validate_i18n.py`: hard error 0（WARN のみ）
- `npm run build`: 6 言語 HTML 生成成功
- 自己判断による追加変更: なし（REPOSITORY-STRUCTURE の学習状況マップから削除済み `computeSrsQueue` 記述を整理した点のみ、#128 残渣のドキュメント同期）

## 動作確認

受け入れアサーション（要約）:

| 項目 | 結果 |
|---|---|
| `id="onboarding…"` | 14 |
| slide / onboardingSlide | 23 |
| `@media.*min-width:1024px` | 3 |
| onboarding card / grid | 13 |
| `onboarding_completed_v1` | 定数 + get/set |
| `guideBtn` / aria-label ガイド | あり（PC で display:none） |
| guide → reopen / showOnboarding | 5 |
| i18n 6 言語 slide titles + next/skip/start | OK |
| DIVERGENCE SP guide | 0 / 表行はヘッダーのみ |
| blacklist md5 | 0 mismatches |

ブラウザ（`python3 -m http.server` + CDP）:

1. SP 390px: 初回モーダル自動表示 → つぎへ×3 → はじめるで LS=`true`・閉じる
2. SP: `#guideBtn` 表示・クリックで再表示、skip 後も LS=`true` のまま
3. PC 1280px: 4 カード表示・`#guideBtn` 非表示 → 「はじめる」で完了

スクショのエージェント添付は技術制約のため不可。Claude Rv / Naoya 実機確認を前提とする（`dev_project_common` § 4）。

## 実装過程での気づき

- PC / SP は同一モーダル内で CSS 切替。既存 `.modal` / `.modal-scrim` を踏襲
- `reopenOnboarding` は `onboardingMarkCompleteOnClose=false` で skip/start 時も LS を触らない

## 後続への影響

- Phase 1-F 完了によりローンチ前オンボ導線が揃う
- Claude Rv で CD ピクセル差分があれば別 Issue / DIVERGENCE 行で追跡

## 残課題・申し送り

- スクショ全画面リストのエージェント添付不可 → Naoya 実機 + Claude Rv
- PC ヘッダー意匠のさらなる忠実性は #149 スコープ外（#147 残件）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当（事前分類妥当）
- 判定根拠: UI（SP+PC）+ i18n 6 言語 + LS 契約 + docs 3 ファイルの横断で、L3 / 複数 Pattern の見積もりと一致

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1+C5+C6
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（wordlist / data JSON / fonts / GAS URL 非触）
- [x] i18n schema への影響あり（`onboarding.*` 追加・REPOSITORY-STRUCTURE 同期済）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（DIVERGENCE / LAUNCH / REPO-STRUCTURE のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 0–3（Issue 宣言）
- 実際の Phase 数: 0–3

### 総合判定

**事前分類妥当** — PR 作成可
