---
id: pj-2026-07-19-1b-report
aliases:
- cursor-implementation-report-phase-1-b-top-page
title: Phase 1-B Top page 1a — 実装レポート
created: '2026-07-19'
---

# Phase 1-B Top page (`1a`) — 実装レポート

## 関連 Issue / PR

- Issue: #85
- PR: #86

## Issue 背景（Issue 本文から要約）

Phase 1-C の `#purposeStub` を本実装に置換し、DESIGN §`1a` 情報階層（ヘッダー言語切替 / タグライン / 目的 4 カード / フッター `3h`）を完成させる。あわせて PR #84 Rv `5015013634` 後続 4 点（Font family トークン、`.start` 統一、`applyDrillId` 二重呼び出し、script md5 記録）を消化する。

## Phase 0 inventory

| 項目 | 結果 |
|------|------|
| `#purposeStub` | Phase 1-C stub（lead + EN 仮文言）→ 本 Issue で置換 |
| `#langOpts` | settings modal 内 → ヘッダー移設 |
| `#siteFooter` | Feedback / Terms / Privacy / X |
| `.start` / `.btn-primary.start` | グローバル legacy + profile 重複 → profile は `.btn-primary.start` に委譲 |
| `applyDrillId` | 目的タップで 2 回 → `preserveDrill` で 1 回 |
| script md5 before | 6 言語共通 `2c0acd1447d450e8ee0f976db04e9213` |
| legacy font | ui=23→18 残（他画面据え置き）/ 新規は `--font-*` |

## 実装内容

- `:root` に `--font-ui` / `--font-serif` / `--font-ipa` / `--font-mono`
- Top: `#topTagline` + Mood B 目的 4 カード（i18n）
- ヘッダー `#langOpts` 移設、settings から削除、settingsBtn 非表示
- フッター下 `#aboutBlock`（`3h` DOM 常時）
- `applyPrevSettings(ps, {preserveDrill:true})`
- `#setup.profile-3a .btn-primary.start` にスタイル委譲
- i18n: `top.tagline` / `drill.title.2a`–`2d` / `about.title` / `about.placeholder`（全 6 言語、非 JA/EN は JA コピー暫定）
- docs: DESIGN §1a、visual-tokens §5b/§5c、LAUNCH 1-B

## 変更ファイル

```
src/index.template.html
i18n/{ja,en,ko,zh-Hans,zh-Hant,fil}.json
docs/DESIGN.md
docs/design/phase-1/visual-tokens.md
docs/LAUNCH-CHECKLIST.md
docs/cursor/reports/cursor-implementation-report-phase-1-b-top-page.md
```

## デグレ防止検証

### ブラックリスト md5

Phase 0 記録と一致（PURPOSE / SPEC / CLAUDE / REPOSITORY-STRUCTURE / CHANGE-CLASSIFICATION / DEV-GUARDRAILS / OPERATIONS / CSS-CONVENTIONS / screen-data-mapping / wordlist / connected / weak）。

### 6 言語 script md5

| | before | after |
|--|--------|-------|
| en〜fil（共通） | `2c0acd1447d450e8ee0f976db04e9213` | `0fe0ee54d0e06fb9f6dc9881eb2cb27b` |

差分は意図した JS（preserveDrill / i18n / top-home / lang 移設）。6 言語間は一致。

### Rv 後続 4 点

| # | 内容 | 結果 |
|---|------|------|
| 1 | Font family トークン | `:root` 4 変数 + top/新規コンポーネント参照 |
| 2 | `.start` 統一 | profile は `.btn-primary.start` に委譲 |
| 3 | `applyDrillId` 二重 | `preserveDrill` で 1 回 |
| 4 | script md5 | 上記表 |

## 動作確認

- `node --check`: OK
- `npm run build`: OK
- `validate-cefr-tags.py`: OK
- ブラウザ手動: [ ] Naoya

## 実装過程での気づき

- settings から Language を外すと modal が空になるため settingsBtn を hidden（Accent は 3a）
- i18n leaf 169 → 176（+7）。SPEC の 169 記載はブラックリストのため本 Issue では未更新（1-G or docs 追随）

## 後続への影響

- 1-D: Font token 前提でドリル CSS
- 1-E: `3h` 文面差し替え、`3f` 言語配置再判断
- 1-F: guide → `3g`
- 1-G: tagline / drill titles 本翻訳

## 残課題・申し送り

- zh/fil/ko の tagline・drill タイトルは JA コピー暫定（Issue 案 β）
- SPEC §5.5 leaf 数 169 の更新は別 docs で可

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2（上限）
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一テンプレート + i18n 6 + docs。Phase 0 で乖離なし

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1 + C4 + C7
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 影響なし
- [x] i18n キー追加のみ（schema 破壊なし）
- [x] URL 構造への影響なし（`setLang` 既存）
- [x] ビルドシステムへの影響なし
- [x] Category A: DESIGN / LAUNCH / visual-tokens（Issue 許可）
- [x] 既存パス依存が壊れていない

### Phase 分割の妥当性
- 想定 Phase 0–5 / 実際: inventory → 実装一括 → docs/PR（単一 PR）
- 相互依存: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 昇格・追加提案がある場合の詳細
なし

---

## 追加修正（Rv Comment #5015555964 / 指示 #5015572883）

Naoya 裁定により改善候補 3 件を本 PR 内で消化。

### Phase 0'

| 項目 | 結果 |
|------|------|
| `#accentOpts` | settings modal 内のみ 1 箇所。`3a` は `#profileAccentToggle`（id 衝突なし） |
| `#langOpts` | DOM + `applyI18n` + click。alias 不要 → `#langSwitcher` / `#langMenu` に置換 |
| `closeSettings` 呼び出し | `openGuide` / `showVocabView` / Escape からも削除 |
| settings Escape | `onModalEscapeKey` から除去（言語メニュー閉じは同ハンドラへ統合） |

### Phase 1'〜3'

1. `.build .ph` の `font-family` を `var(--legacy-ui)` に戻す（Encode `2b` は Phase 1-D 巻き取り範囲）
2. `#settingsBtn` / `#settingsModal` / `openSettings`/`closeSettings` 全撤去。i18n `settings_*` 4 key × 6 言語削除 → **leaf 172**（176−4）
3. ヘッダー言語を brief §6 準拠のドロップダウン（`#langSwitcher` + `#langMenu`、自言語表記 hard-code）へ変更

### Phase 4' 検証

| 項目 | 結果 |
|------|------|
| `node --check` | OK |
| `npm run build` | OK |
| `validate-cefr-tags.py` | OK |
| i18n leaf | 172（6 言語一致） |
| script md5 before（本追記前） | `0fe0ee54d0e06fb9f6dc9881eb2cb27b` |
| script md5 after | `b14677a5e4c08f83010f9e16a57e2daf`（6 言語共通） |
| ブラックリスト 12 ファイル md5 | HEAD と一致（不変） |

docs: `DESIGN.md` §`1a` / `visual-tokens.md` §5b・§5c を `#langSwitcher` 記述に更新。
