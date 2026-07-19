---
id: pj-2026-07-19-1a-report
aliases:
- cursor-implementation-report-phase-1-a-visual-language-tokens
title: Phase 1-A 視覚言語トークン基盤 — 実装レポート
created: '2026-07-19'
---

# Phase 1-A 視覚言語トークン基盤 — 実装レポート

## 関連 Issue / PR

- Issue: #81
- PR: （作成時に追記）

## Issue 背景（Issue 本文から要約）

Phase 1-0-b（#78）完了後、Phase 1-B 以降が参照する Mood B トークンを `:root` に導入する。既存 UI は `--legacy-*` 退避で pixel-perfect 維持。Category A として `CSS-CONVENTIONS.md` を新設し、legacy 早期削除を防ぐ。

## 実装内容

### Phase 0 inventory（変更前 `main`）

定義済み `:root` 17 変数 + 参照のみ `--bg`（未定義）6。

| 変数 | 値（要約） | 参照数 |
|---|---|---|
| `--paper` | `#F4F3EE` | 2 |
| `--panel` | `#FFFFFF` | 5 |
| `--ink` | `#191C20` | 35 |
| `--muted` | `#6C717A` | 23 |
| `--faint` | `#9AA0A8` | 22（CSS 21 + JS inline 1） |
| `--hair` | `#E2E0D8` | 34 |
| `--signal` | `#0C7C7E` | 53 |
| `--signal-soft` | `#E2F0EF` | 17 |
| `--stress` | `#D9911B` | 2 |
| `--stress-soft` | `#F8ECD3` | 1 |
| `--ok` | `#2E7D54` | 8 |
| `--ok-soft` | `#E4F0E8` | 2 |
| `--bad` | `#BC4F3A` | 10 |
| `--bad-soft` | `#F6E6E1` | 3 |
| `--ipa` | Doulos stack | 18 |
| `--ui` | system-ui stack | 18 |
| `--mono` | SF Mono stack | 27 |
| `--bg`（未定義） | — | 6 |

合計 `var(--*)` 参照: **286**（unique 18）

### Phase 1 実装

- 全既存定義 → `--legacy-*`、全参照 → `var(--legacy-*)`（未定義 `--bg` も `--legacy-bg`、定義は追加せず挙動維持）
- Mood B `:root` 追加（11 color + 5 space + 5 radius + 2 shadow）※既存規則への配線なし
- Google Fonts（Charis SIL / Noto Sans JP·KR / Noto Serif JP）を `<head>` 追加、Doulos `@font-face` 維持
- `docs/design/phase-1/visual-tokens.md` 新規（Vault 未到達のため Issue §5 から snapshot。§4 は暫定スタブ）
- `docs/CSS-CONVENTIONS.md` 新規（Category A、legacy は Phase 1-H まで削除禁止）
- `docs/DESIGN.md` に概要小節（1 段落 + 3 リンク、値なし）
- `docs/DOCUMENT-MAP.md` Category A 末尾に 1 行
- `docs/LAUNCH-CHECKLIST.md` Phase 1-A 完了マーク

### before → after リネーム一覧

| before | after |
|--------|--------|
| `--paper` … `--mono`（17） | `--legacy-paper` … `--legacy-mono` |
| `--bg`（参照のみ） | `--legacy-bg`（参照のみ） |

### 参照置換 grep

| | before | after |
|--|--------|-------|
| `var(--legacy-*)` | 0 | 286 |
| 非 legacy `var(--*)` | 286 | 0 |

## 変更ファイル

```
src/index.template.html
docs/design/phase-1/visual-tokens.md
docs/CSS-CONVENTIONS.md
docs/DESIGN.md
docs/DOCUMENT-MAP.md
docs/LAUNCH-CHECKLIST.md
docs/cursor/reports/cursor-implementation-report-phase-1-a-visual-language-tokens.md
```

## デグレ防止検証

### ブラックリスト md5（不変）

| ファイル | md5 |
|----------|-----|
| `docs/PURPOSE.md` | `0ab4ec6755910a01954f3beb29d87524` |
| `docs/SPECIFICATION.md` | `58eb53d2a022e436a52b6f3194ed9649` |
| `docs/REPOSITORY-STRUCTURE.md` | `7fa098a9bc3e24a5b0cc263b497ba38a` |
| `docs/CHANGE-CLASSIFICATION.md` | `3d358024a8063477b1463612e9182ca9` |
| `docs/DEV-GUARDRAILS.md` | `6002d80e6aecc2ae4be8b3947a93c364` |
| `docs/OPERATIONS.md` | `d05142153669de0f2607e32aec380341` |
| `docs/design/phase-1/screen-data-mapping.md` | `31a4d454feb0c28ea6703dc20061a4b5` |
| `data/connected_speech.json` | `7ebc1be2fcaa774d7696dbba5c07df55` |
| `data/weak_forms.json` | `a853cd530443edfd9b7fa3a11e11a116` |
| `wordlist_GA_a1a2_plus_phonics.json` | `54937707f733d1f906c99ba119444d5a` |

`DOCUMENT-MAP.md` diff: **+1 行のみ**（許可範囲）。

### 6 言語ビルド script md5

| 言語 | before | after | 判定 |
|------|--------|-------|------|
| en〜fil（共通 script） | `44e104b54762b59b6b3617a3fff805aa` | `dd583e54e765c6909557de97a9442d0f` | 差分 1 箇所のみ |

**差分内容:** Encode builder の inline style `var(--faint)` → `var(--legacy-faint)`（見た目維持のための必須置換）。当該 1 置換を戻すと script 本体は `main` と byte 一致。ロジック変更なし。

## 動作確認

- ブラウザ手動確認: [ ] Chrome（Naoya 検収: pixel-perfect / DevTools `:root` / Network fonts）
- モバイル確認: [ ] 375px / 1440px（Issue §6.5）
- TTS: 非該当
- データ整合性: 非該当（wordlist / i18n 未変更）

## 実装過程での気づき

- Vault `design-tokens.md` が作業マシンから未到達 → snapshot は Issue §5 ベース。§4 コンポーネントは暫定スタブ
- `--bg` は定義なし参照。定義を足すと見た目が変わるため参照リネームのみ
- JS 内の CSS `var()` が 1 件あり、script md5 厳密一致は「CSS のみ変更」前提では成立しない。正規化比較でロジック不変を証明

## 後続への影響

- Phase 1-B: 新 token で top を実装し、該当箇所の legacy を巻き取り
- Phase 1-H: legacy 参照ゼロ確認後に削除（`CSS-CONVENTIONS.md` §2）
- Vault 入手後: `visual-tokens.md` を Vault 全コピーで書き戻し推奨

## 残課題・申し送り

- Vault §4 との差分確認（Naoya / Claude）
- pixel-perfect スクショ比較は Naoya 検収

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一テンプレート + docs 数本。機械的リネームが主で、独立 Recon Issue 不要（Phase 0 inventory で吸収）

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1 + C4
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし（生成物は gitignore、script ロジック不変）
- [x] Category A への追加あり（`CSS-CONVENTIONS.md` — Issue 目的）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 0–2（inventory / 実装 / docs）
- 実際の Phase 数: 同
- 相互依存の発生有無: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
