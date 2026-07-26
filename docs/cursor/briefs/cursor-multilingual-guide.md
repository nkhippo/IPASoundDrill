# Cursor 指示書 — 多言語学習ガイドの埋め込み（フェーズ1: 5言語）

> 作成日: 2026-06-26
> 種別: 独立タスク（HANDOFF §7）
> 入力: `guide.json`（構造化データ・Claude 作成）
> 対象: `index.html`（ガイド表示UI）、任意で `i18n/` 連携
> 制約: **アプリ上に個人情報（氏名等）を一切出さない**（検証済み・本文にPIIなし）

Claude 設計サマリー。

---

## 1. 目的

英語学習者向けに、アプリの**導入目的／解決すること／推奨利用法**を多言語で提供する。
フェーズ1 = **en / ja / ko / zh-Hant / zh-Hans** の5言語。フェーズ2（hi/es/ar/id）は後日。

各言語1000字以上の本文。8セクション構成:

| キー | 内容 |
|------|------|
| `welcome` | このアプリは何か |
| `philosophy` | 核心思想「発音できない音は聞き取れない」 |
| `solves` | 解決する3つのギャップ |
| `modes` | Mode A / Mode B の使い分け |
| `decode_encode` | Decode と Encode |
| `connected` | 連結句タブ（linking/assimilation/elision・難易度） |
| `accents` | GA と RP の選び方 |
| `how_to_use` | 推奨する使い方 |

---

## 2. データ構造（`guide.json`）

```jsonc
{
  "en": {
    "welcome":      { "title": "Welcome", "body": ["段落1", "段落2", ...] },
    "philosophy":   { "title": "...",     "body": [...] },
    ...
  },
  "ja": { ... }, "ko": { ... }, "zh-Hant": { ... }, "zh-Hans": { ... }
}
```

- 全5言語が**同一の8セクションキー・同一段落数（13段落）**で構造完全一致
- `title` = 見出し、`body` = 段落配列（各段落は `<p>` 相当）
- 段落内に Markdown 装飾はほぼ無し（一部 `**強調**` あり → 表示時に処理 or プレーン表示）

> 配置例: `data/guide.json`（連結句 `data/connected_speech.json` と同様の data ディレクトリ）。

---

## 3. UI 実装

### 3-1. 表示方法

| 項目 | 仕様 |
|------|------|
| 入口 | 設定モーダル内、またはトップバーに「ガイド / Guide」ボタン |
| 表示 | モーダル or 専用セクション（`<section id="guide" hidden>`）。スクロール可 |
| 言語 | **現在のUI言語（`app_lang`）に追従**。`guide.json[app_lang]` を表示 |
| フォールバック | `app_lang` がガイドに無い場合は `en` |
| 言語切替 | ガイド内に言語ピル（en/ja/ko/繁/簡）を置いてもよい（任意） |

> 注意: アプリの `app_lang` は現在 `en/ja/zh/ko` の4値。ガイドは `zh-Hant`/`zh-Hans` を分けている。
> **マッピングが必要**: アプリの `zh` がどちらを指すか確認し、`zh→zh-Hans`（または現行UIに合わせる）で対応。
> 将来 UI 言語に繁簡を分ける場合はこのガイドがそのまま使える。当面は `zh→zh-Hans` 推奨（簡体を既定）。あるいはガイド内言語ピルで繁簡を選ばせる。

### 3-2. レンダリング

```javascript
function renderGuide(lang){
  const data = GUIDE[lang] || GUIDE['en'];
  const order = ['welcome','philosophy','solves','modes','decode_encode','connected','accents','how_to_use'];
  const html = order.map(key=>{
    const sec = data[key];
    const paras = sec.body.map(p=>'<p>'+escapeAndBold(p)+'</p>').join('');
    return '<h3>'+escapeHtml(sec.title)+'</h3>'+paras;
  }).join('');
  $('guideBody').innerHTML = html;
}
// escapeAndBold: HTMLエスケープ後、**...** を <strong> に変換
```

- `**強調**` は `<strong>` に変換（簡易パーサ）。それ以外はプレーンテキスト＋エスケープ
- セクション順は上記 `order` で固定

### 3-3. i18n（UIキー・任意）

ガイドを開くボタン等のUI文言:

| キー | en | ja | zh | ko |
|------|----|----|----|----|
| `guide.open` | Guide | ガイド | 指南 | 가이드 |
| `guide.title` | How to use this app | このアプリの使い方 | 如何使用 | 사용 방법 |
| `guide.close` | Close | 閉じる | 关闭 | 닫기 |

> ガイド**本文**は `guide.json` から。UIラベルのみ `i18n/*.json`。
> （別案）本文も i18n に統合したい場合は `guide_i18n_flat.json`（`guide.welcome.title` / `guide.welcome.p1` …のフラットキー）を提供済み。どちらの方式でも可。

---

## 4. DoD

- [ ] `guide.json` を読み込み、現在UI言語でガイドを表示
- [ ] 5言語（en/ja/ko/zh-Hant/zh-Hans）すべて表示できる
- [ ] 8セクションが定義順で表示される
- [ ] `**強調**` が `<strong>` で表示（or プレーン化）され、生の `**` が残らない
- [ ] `app_lang=zh` のマッピングが解決（zh→zh-Hans 等）
- [ ] ガイドを開く/閉じる導線がある
- [ ] **本文・UIともに個人情報が一切出ない**

---

## 5. 範囲外・フォロー

| 項目 | 扱い |
|------|------|
| フェーズ2（hi/es/ar/id） | 後日。同じ8セクション構造で追加 |
| 繁簡をUI言語として分離 | 任意。分けるとガイドの zh-Hant/zh-Hans がそのまま活きる |
| 本文の Markdown リッチ化 | 現状 `**強調**` のみ。リンク等は不要 |

---

## 6. 添付ファイル

| ファイル | 用途 |
|----------|------|
| `guide.json` | **埋め込み本体**（5言語×8セクション） |
| `guide_i18n_flat.json` | i18n統合方式を採る場合の代替（フラットキー） |
| `guide_review_all.md` | レビュー用・全文（実装には不要） |

---

## 7. Claude への申し送り

- 全5言語、各1000字以上・8セクション・13段落で構造完全一致。PIIなしを検証済み
- アプリの `app_lang=zh` が繁簡どちらかは要確認。当面 zh→zh-Hans 推奨
- フェーズ2は同構造で追加すればこのUIがそのまま使える
