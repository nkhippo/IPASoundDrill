---
id: pj-2026-07-19-1c-report
aliases:
- cursor-implementation-report-phase-1-c-learning-profile
title: Phase 1-C 学習プロフィール 3a — 実装レポート
created: '2026-07-19'
---

# Phase 1-C 学習プロフィール 3a — 実装レポート

## 関連 Issue / PR

- Issue: #83
- PR: （作成時に追記）

## Issue 背景（Issue 本文から要約）

Phase 1-A で Mood B トークンが入り、Q-20-δ の「目的 → プロフィール `3a` → ドリル」の要として Setup 11 項目・`prev_settings_v1`・`ept_marks_v1`（checks からの lazy migration）・CEFR CI ガード・「11 統一」・B2 ピル・visual-tokens §4 書き戻しを単一 PR で消化する。

## Phase 0 inventory

### `#setup` CSS（legacy → Mood B 巻き取り範囲）

| 区分 | セレクタ | 扱い |
|------|----------|------|
| 共用 | `.opt` / `.pill` / `.panel` / `.flabel` 等 | **グローバルは触らない**（他画面 pixel-perfect） |
| setup 専用 | `.setup-adv-toggle` | `#setup.profile-3a` 配下で新 token に上書き |
| 新規 | `.purpose-card` / `.btn-*` / `.toggle-ga-rp` / `#setup.profile-3a …` | Mood B 新 token |

### `ept_checks_v1` 実態

```json
{ "<wordKey>": { "d": 0..3, "e": 0..3, "l": 0..3 } }
```

flat `{apple:2}` ではない。migration: `d→2a` / `e→2b` / `l→2c`、`2d` 未設定（0）。

### 目的カード → 内部マッピング

| drill | appMode | tab | dir |
|-------|---------|-----|-----|
| `2a` | a | words | decode |
| `2b` | a | words | encode |
| `2c` | b | words | decode |
| `2d` | a | connected | decode |

## 実装内容

- `#purposeStub` 最小 4 カード → `lastDrill` → `#setup`（`data-frame="3a"` / `.profile-3a`）
- #1–#3（mode/tab/dir）非表示、Accent を `3a` トグルへ移設（settings Accent 非表示）、セッション中 `setAccent` no-op
- CEFR **B2** ピル追加（`lvl.b2` 配線）
- `prev_settings_v1` 読写 + 変更時/開始時保存
- `ept_marks_v1` + `ept_marks_migrated_v1`、checks lazy migration、移行後 get/setCheckCount は marks 経由
- Mood B コンポーネント CSS（Button / purpose-card / pill 上書き / toggle）。Progress meter は未定義（1-D）
- `scripts/validate-cefr-tags.py` + `.github/workflows/validate-cefr-tags.yml`
- PURPOSE / DESIGN「11 統一」+ `3a` UI 追記、SPEC §4.1 **1 行のみ**、visual-tokens §4 Vault 書き戻し、LAUNCH 1-C

### LS 例

`prev_settings_v1`:

```json
{
  "v": 1,
  "accent": "ga",
  "cefrLevels": ["A1", "A2"],
  "focus": "all",
  "reg": "all",
  "grp": "all",
  "csLevel": "all",
  "csFilter": "all",
  "lastDrill": "2a",
  "language": "en"
}
```

`ept_marks_v1`: `{ "2a:apple": 2, "2b:apple": 1 }`

### migration 疑似コード

```
if ept_marks_migrated_v1 !== "1":
  for wordKey, {d,e,l} in ept_checks_v1:
    if d: marks["2a:"+wordKey]=d
    if e: marks["2b:"+wordKey]=e
    if l: marks["2c:"+wordKey]=l
  save marks; set migrated=1
  // ept_checks_v1 残置
```

## 変更ファイル

```
src/index.template.html
scripts/validate-cefr-tags.py
.github/workflows/validate-cefr-tags.yml
docs/PURPOSE.md
docs/DESIGN.md
docs/SPECIFICATION.md   # §4.1 1 行のみ
docs/design/phase-1/visual-tokens.md
docs/LAUNCH-CHECKLIST.md
docs/cursor/reports/cursor-implementation-report-phase-1-c-learning-profile.md
```

## デグレ防止検証

### ブラックリスト md5（不変）

| ファイル | md5 |
|----------|-----|
| `CLAUDE.md` | `f88cebd4dc8dfb1ec0f11d3d755b57b6` |
| `docs/REPOSITORY-STRUCTURE.md` | `7fa098a9bc3e24a5b0cc263b497ba38a` |
| `docs/CHANGE-CLASSIFICATION.md` | `3d358024a8063477b1463612e9182ca9` |
| `docs/DEV-GUARDRAILS.md` | `6002d80e6aecc2ae4be8b3947a93c364` |
| `docs/OPERATIONS.md` | `d05142153669de0f2607e32aec380341` |
| `docs/CSS-CONVENTIONS.md` | `49a5cd2011d82cc3ac7763d078be5fca` |
| `docs/design/phase-1/screen-data-mapping.md` | `31a4d454feb0c28ea6703dc20061a4b5` |
| `wordlist_GA_a1a2_plus_phonics.json` | `54937707f733d1f906c99ba119444d5a` |
| `data/connected_speech.json` | `7ebc1be2fcaa774d7696dbba5c07df55` |
| `data/weak_forms.json` | `a853cd530443edfd9b7fa3a11e11a116` |

`docs/SPECIFICATION.md`: **1 行のみ**変更（許可範囲）。

### CI

- `python3 scripts/validate-cefr-tags.py` → OK
- 故意に `cefr` 削除した一時 JSON → exit 1（fail 再現 OK）

### 「11 統一」grep

| ファイル | before | after |
|----------|--------|-------|
| PURPOSE | 「詳しい設定」相当パラメータ | Setup 11 項目（Accent 含む）+ Onboarding… |
| DESIGN | 短い `3a` 箇条 | Setup 11 + B2 + LS 追記（旧称「12」は廃止注記のみ） |
| SPEC §4.1 | `12 パラメータの最終リストは Phase 1-0-b` | Setup 11 項目（Recon 確定）+ Onboarding |

## 動作確認

- ブラウザ手動: [ ] Naoya（目的 stub → 3a → はじめる / B2 / migration / 他画面）
- `node --check` on template scripts: OK
- `npm run build`: 6 言語生成 OK

## 実装過程での気づき

- Issue 初版 §5 と Recon の乖離は Step 2 で吸収済み（v2）
- `.opt`/`.pill` のグローバル置換は他画面を壊すため `#setup.profile-3a` スコープ必須
- Progress meter は snapshot のみ・実装 CSS なし（論点 4 β）

## 後続への影響

- 1-B: `#purposeStub` を本 top に置換
- 1-D: Progress meter + IPA タイポ、ドリル本実装、marks 前提
- CI: 未タグ CEFR 追加で PR fail

## 残課題・申し送り

- 目的 stub 文言の本格 i18n は 1-B / 1-G
- `#cefrNote` 復活は本 Issue 外（Issue §5.5）
- ヘッダー Accent 固定バッジ強化は後続可

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2（上限）
- 実装後の妥当性判定: 妥当（ただし Step 2 で仕様修正が必要だった。実装自体は単一 PR で収まった）
- 判定根拠: HTML/JS 1 ファイル中心 + CI 1 + docs。独立 Recon 不要

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1 + C4（+ C5）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし（wordlist 読取のみ）
- [x] i18n schema への影響なし（既存 `lvl.b2` / `accent.*`）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] Category A: visual-tokens 更新・SPEC 1 行・PURPOSE/DESIGN（Issue 許可）
- [x] 既存パス依存が壊れていない

### Phase 分割の妥当性
- 想定: Phase 0–2 / 実際: inventory → 実装 → docs/CI（Rv 往復あり）
- 相互依存: なし（1-B stub 置換前提を明記）

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 昇格・追加提案がある場合の詳細
なし
