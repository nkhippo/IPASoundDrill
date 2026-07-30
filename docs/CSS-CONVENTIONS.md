# CSS-CONVENTIONS — CSS 命名・legacy 運用

> **Category A（常時最新化義務）**  
> **Purpose:** CSS 変数の命名、`--legacy-*` の寿命、CSS 技術制約を正本化する。  
> **関連:** Issue #81（Phase 1-A 導入）、実装値の snapshot は `docs/design/phase-1/visual-tokens.md`、Vault SoT は `30_projects/IPASoundDrill/design/phase-1/design-tokens.md`。

---

## §1 CSS 変数命名規約

- **形式:** kebab-case のみ（`--signal-soft`、`--radius-card`）
- **推奨パターン:** `--{category}-{name}`（例: `--radius-card`、`--space-3`、`--shadow-card`）
- **カラーは flat:** `--color-signal` ではなく `--signal` / `--signal-soft`（Category prefix `color-` は使わない）
- **新規追加:** Mood B / Phase 1 以降の画面は **非 legacy** のトークン名を使う（`visual-tokens.md` §5）
- **既存画面（移行中）:** `var(--legacy-*)` のみ。新トークンを既存規則へ勝手に配線しない（見た目維持）

---

## §2 `--legacy-*` prefix の運用ルール

| 時点 | 操作 |
|------|------|
| **Phase 1-A** | 既存 `:root` 変数を `--legacy-*` にリネーム。既存 `var(--*)` を `var(--legacy-*)` に置換。新 Mood B トークンを追加のみ |
| **Phase 1-B〜1-H** | 新 UI 実装時に該当箇所の `var(--legacy-*)` を新トークンへ順次置換 |
| **Phase 1-H 完了時点** | 全 `var(--legacy-*)` 参照が消滅したことを確認したうえで、最終 PR にて legacy 定義ブロックを削除 |

### 禁止事項（重要）

- **Phase 1-H 完了より前に `--legacy-*` 群を削除してはならない**
- Cursor / 実装者が「もう使っていないように見える」と判断して早期削除すること禁止
- legacy 削除は専用の完了条件（参照ゼロ）を Issue / PR で明示した場合のみ

未定義だった参照（例: 旧 `--bg`）も挙動維持のため `var(--legacy-bg)` にリネームしてよいが、**定義を新設して見た目を変えない**こと。

---

## §3 CSS 全般ルール

- **preprocessor 不採用:** Sass / Less / Stylus は導入しない
- **Modern CSS のみ:** 素の CSS。`:root` を第一選択
- **CSS Nesting:** 許容（対応ブラウザ前提は現行方針に従う）
- **`color-mix()`:** 将来対応予定（現行 Safari サポート方針のため現時点では使わない）
- **インライン color/font/size の新規ハードコード:** 避け、トークンまたは既存パターンを使う
- **配置:** 別 CSS ファイル分離をしない。`apps/web/src/index.template.html` の `<style>` を正とする

---

## §4 6 言語ビルドとの整合性

- `<style>` ブロックは 6 言語で **共通**（`apps/web/scripts/build-i18n-html.js` がテンプレートから生成）
- Font family / Google Fonts import も **共通**（Noto stack の言語別 fallback は stack 内で吸収）
- CSS 変数の **値は言語非依存**
- 言語別差分は HTML 文言・`lang`・meta のみ。CSS トークン値を言語ごとに分岐しない

---

## §5 Deprecation / Migration ルール

| イベント | 記録 |
|----------|------|
| **変数追加** | 本ファイルまたは実装レポートに 1 行以上記録し、`visual-tokens.md` を更新 |
| **変数削除** | 参照ゼロ確認後、本ファイルに削除記録。legacy 削除は §2 の Phase 1-H 条件のみ |
| **Migration 期間** | `--legacy-*` と新トークンの二重定義は正常。見た目は legacy 参照側が支配 |

### Migration ログ（Phase 1-A）

| 日付 | 内容 |
|------|------|
| 2026-07-19 | Phase 1-A: 既存 17 変数を `--legacy-*` 化。未定義 `--bg` 参照を `--legacy-bg` 化。Mood B 11 color + spacing/radius/shadow を `:root` 追加。Google Fonts（Charis SIL / Noto Sans JP·KR / Noto Serif JP）を `<head>` 追加 |

### `var(--legacy-*)` 参照数の進捗

| 時点 | 参照数 | 備考 |
|------|-------:|------|
| Phase 1-D-PR2 後 | 249 | ドリル `2c`/`2d` + Reveal 共通 Mood B |
| Phase 1-E PR-1 後 | **228** | `#vocabPage` / `#symbolPickerPage` Mood B 化（249→228） |
| Phase 1-E PR-2 後 | **228** | `#learningStatusPage` は新トークンのみで追加。既存 legacy 参照は不変 |
| Phase 3（2026-07-28〜29 UI 改修）後 | **195** | モーダル方式変更（`.info-page` の全画面→ scrim + 浮遊カード化）・フッター整理・ドリル系画面の新トークン移行で 228→195（`grep -c 'var(--legacy-' apps/web/src/index.template.html` 実測） |

### Phase 3 で追加された CSS クラス/変数の規約（実例）

Phase 3（2026-07-28〜29）の UI 改修で追加された代表的な非 legacy クラス。§1 の「新規追加は非 legacy トークンを使う」原則の実例として記録:

| クラス | 用途 | 備考 |
|---|---|---|
| `.info-page` / `.info-page-inner` / `.info-page-head` / `.info-page-body` | 「IPA って何?」/ 言語設定オーバーレイの scrim + 浮遊カード構造（旧: 全画面ページ） | `.modal-scrim` と同じ scrim パターンに統一。新トークン（`--paper` / `--ink` / `--hair` / `--font-serif` 等）のみ使用 |
| `.modal-scrim` / `.modal-card` | 汎用モーダルの scrim + カード二層構造（About / Onboarding 等でも共有） | `position:absolute;inset:0` の scrim ボタン + `.modal-card` の組み合わせが標準パターン |
| `.drill-accent-badge` | ドリル画面ヘッダーの GA/RP 固定バッジ | 新トークンのみ。`data-role="drill-accent"` と併用 |
| `.vocab-az-row` | 語彙ブラウザの A–Z ジャンプ行（ラベル強化） | `--panel` / `--hair` 等の新トークンで構成 |

> Migration ログの記録義務（§5 表）は変数（CSS カスタムプロパティ）追加時のみ必須。クラス名追加は本節のような実例記録で足りる（毎回 Migration ログに 1 行追記する運用は課さない）。
