---
id: pj-2026-07-12-149d
aliases:
- pj-2026-07-12-149d
title: Pre-Issue Recon — SEO meta architecture for Issue F2
created: '2026-07-12'
---
# Pre-Issue Recon — SEO meta architecture for Issue F2

## 対象 Issue
- Issue: #26
- 実施日: 2026-07-12

## 調査結果

### 1. 既存の static meta タグ

`<head>`（L3–L358）内の **static `<meta>` は次の 2 つのみ**。description / keywords / OGP / Twitter Card 系は **一切なし**。

| 行 | タグ |
|---|---|
| L4 | `<meta charset="UTF-8">` |
| L5 | `<meta name="viewport" content="width=device-width, initial-scale=1.0">` |

その他 head 内の関連静的要素:
- L6: `<title>IPA Sound Drill</title>`
- L7: `<link rel="preload" href="fonts/DoulosSIL-Regular.woff2" …>`
- L8–L357: 巨大な inline `<style>`（CSS のみ）

`property="og:*"` / `name="twitter:*"` / `name="description"` / `name="keywords"` の grep 結果: **0 件**。

### 2. title タグ

- **静的 HTML**: L6 `<title>IPA Sound Drill</title>`（英語ブランド名固定）
- **JS 実行後**: `applyI18n()`（L1266–）先頭で `document.title = t("brand.name");`（L1267）に上書き
  - 現状 `brand.name` は全言語で概ね `"IPA Sound Drill"`（言語差ほぼなし）
  - Issue #25 で追加した `meta.title` は **未消費**（`t("meta.title")` 参照なし）

### 3. JS 実行前の静的テキストコンテンツ

- `<body>` 開始: **L359**
- 最初の `<script>`: **L698**
- したがって L359–L697 が **JS 実行前にサーバーが返す生 HTML の本文**

#### 要約

クローラー（JS 非実行）から見える実質テキストは **英語の UI シェル文言がかなり豊富**。空の `#id` コンテナだけの SPA ではない。ただし:

- **SEO 向けの独立した説明文（`lead_html` 等）は body に静的埋め込みされていない**
- 見出し相当は vocab ページの `<h1>` / モーダル `<h2>` 程度で、トップセットアップに専用 `<h1>` は無い
- ブランド行に IPA 記号 `/iː/` と `IPA Sound Drill` がある

#### 主要静的テキスト（行番号付き・抜粋）

| 行 | 要素 | 静的テキスト |
|---|---|---|
| L363–364 | `.mark` / `#brandName` | `/iː/` / `IPA Sound Drill` |
| L389–392 | setup モード | `Learning mode` / `Pronunciation` / `Sound → Vocabulary` |
| L396–399 | practice tab | `Practice mode` / `One word` / `Linking` |
| L404–408 | CEFR | `CEFR level` / `A1` `A2` `B1` |
| L415–418 | direction | `IPA → word` / `word → IPA` + 説明文 |
| L422–455 | filters | `Customize filters` / phoneme・spelling 系ラベル多数 |
| L488 | `#startBtn` | `Loading…`（disabled） |
| L617 | `#settingsTitle` | `Settings` |
| L621–626 | lang options | `English` / `日本語` / `繁體` / `简体` / `한국어` / `Filipino` |
| L643 | `#guideTitle` | `How to use this app` |
| L669 | `#vocabTitle` `<h1>` | `Vocabulary` |
| L689–690 | exit confirm | `Leave session?` / `Do you want to end this session?` |

多くのドリルカード領域（`#cardDecode` 等）は `class="panel hidden"` で非表示だが、**HTML ソース上には英語ラベルが残存**（例: L518 `Reveal meaning`, L553 `Check`）。JS 非実行クローラーは CSS `hidden` を無視してテキスト抽出する可能性が高い。

ガイド本文 `#guideBody` は空コンテナで、内容は JS（`renderGuide`）が `data/guide.json` から挿入。

### 4. meta / title の JS 書き換え箇所

| 内容 | 関数 | 行 | 備考 |
|---|---|---|---|
| `document.title` 更新 | `applyI18n()` | L1267 | `t("brand.name")` のみ。`meta.title` 未使用 |
| `document.documentElement.lang` | `loadLocale(lang)` | L1229 | locale JSON 読込後に設定 |
| meta description / OGP / Twitter | — | — | **書き換え・生成コードなし** |
| `meta` オブジェクト消費 | — | — | Issue #25 追加キーの参照 **0 件** |

呼び出し経路:
- `initApp()`（L1514）→ `loadLocale(LANG)` → `applyI18n()`
- `setLang(lang)`（L1372）→ locale 再読込 → `applyI18n()`
- 末尾 L3255: `initApp();`

デフォルト言語: L1108 `let LANG = localStorage.getItem("app_lang") || "en";`  
（**`?lang=` URL パラメータは現状未使用**。Issue 前提の「`?lang=xx` 切替」とは実装が異なる点に注意）

### 5. html lang 属性の設定方法

- **静的**: L2 `<html lang="en">`（固定）
- **動的**: `loadLocale()` 内 L1229 `document.documentElement.lang = lang;`
- 入力欄の `lang="en"`（L538, L552）は英語入力誘導用で、UI 言語切替とは別

JS 非実行時は常に `lang="en"` のまま。

### 6. noscript タグ

**存在しない**（`noscript` grep: 0 件）。JS 無効時の代替コンテンツなし。

## 影響範囲の推定

Issue F2 設計への示唆:

1. **現状のまま `document.title` / meta を JS で動的更新しても、SNS・多くの AI クローラー（JS 非実行）には届かない。** サーバーが返す生 HTML の `<head>` に静的 meta が必要。
2. 生 HTML には英語 UI 文言は多いが、**シェア／検索向けの description・OGP 画像・canonical・hreflang はゼロ。** F2 で静的フォールバック（少なくとも en 固定、またはビルド時展開）が必要。
3. Track A 制約（単一静的 `index.html`、SSR なし）下では現実的な選択肢は概ね:
   - **A**: en 固定の static OGP/description を `<head>` に直書き（`?lang` 非対応を明示許容）
   - **B**: Vercel Edge Middleware / 簡易 SSR で `?lang` または Accept-Language に応じて head を差し替え（Track A 逸脱リスク・要判断）
   - **C**: 言語別の薄い HTML エントリ（`/ja/` 等）を静的生成（構成変更が大きい）
4. Issue #25 の `i18n/*/meta` は **ブラウザ実行後の title/description 更新用データ**としては有効。クローラー向けには別途「静的 head に何を置くか」を決める必要がある。
5. body の英語シェルはクローラーの「中身が空」問題をある程度緩和するが、**検索スニペット／OGP プレビューの主戦場は head**。

## 判断困難な事項

- Vercel 上で Edge Middleware を「Track A の単一 HTML 維持」と両立できるか（運用・複雑度の閾値）はプロダクト判断が必要。本 Recon ではコード変更せず方針決定は Claude / Naoya に委ねる。
- 各クローラーが CSS `.hidden` テキストをインデックスする程度の差は、実測なしでは断定できない（一般的にはソース上のテキストは抽出されうる、と記載）。

## Claude への申し送り

Issue F2 本文作成時に注意すべき点:

1. **「JS 動的 meta だけでは不十分」を前提に設計する。** 完了定義に「View Source（JS なし）で description / og:* が見える」を入れること。
2. `meta` 消費（`t("meta.*")`）と **静的 head フォールバック**をセットで設計する。言語別 URL が無い現状では en 固定 static + JS で他言語上書き、が Track A 最短経路になりやすい。
3. 言語切替の実装正本は **`localStorage.app_lang`**。`?lang=xx` / hreflang を入れるなら **新規仕様**として明示すること。
4. `document.title` は現状 `brand.name`。F2 では `meta.title` へ切替を推奨（#25 データ活用）。
5. `noscript` 追加は任意。SEO よりアクセシビリティ寄り。優先度は static meta / OGP より低い。
6. 本 Issue は調査のみ。`index.html` 等への変更は **Issue F2 本体**で行う。

---
_Cursor による自動投稿_
