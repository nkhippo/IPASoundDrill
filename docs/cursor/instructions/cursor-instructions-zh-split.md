---
id: pj-2026-07-07-2694
aliases:
- pj-2026-07-07-2694
title: Cursor 指示書 — 中文 UI 分離（`zh` → `zh-Hant` + `zh-Hans`）
created: '2026-07-07'
---
# Cursor 指示書 — 中文 UI 分離（`zh` → `zh-Hant` + `zh-Hans`）

> 作成日: 2026-07-07
> 対象リポジトリ: `nkhippo/IPASoundDrill`（`main` ブランチ）
> ゴール: 設定モーダルの言語ピッカーで、中文を「繁體（台灣繁體）」と「简体（简体中文）」の 2 択に分離する。既存 `zh` ユーザーは `zh-Hans` に自動移行。
> 事前確認済み: `data/guide.json` は既に `zh-Hant` / `zh-Hans` で分離済み（今回は触らない）。Tier 1（UI）と Tier 3（音素解説）のみ対応。

---

## 0. スコープと非スコープ

### スコープ

- Tier 1 UI ファイル（`i18n/*.json`）の分離と全言語 `lang_opts` 更新
- Tier 3 音素解説（`i18n/phonemes/*.json`）の分離
- `index.html` の言語ピッカー拡張、localStorage 移行、fallback ロジック

### 非スコープ（今回触らない）

- `data/guide.json` — 既に分離済み
- `data/wordlist_*.json` の `gloss.zh` — 単一 `zh` フィールドのまま。UI 側で `zh-Hant` / `zh-Hans` 要求時に `zh` へフォールバック
- `data/connected_speech.json` の `gloss.zh` / `cs_rule` — 同上
- 既存の 5 言語ファイル本文（en/ja/ko/fil の翻訳文言）— `lang_opts` セクション以外は触らない

---

## 1. ファイル操作

### 1-1. 新規追加

添付の 4 ファイルをそのまま配置してください:

| リポジトリ内のパス | 添付ファイル |
|---|---|
| `i18n/zh-Hant.json` | `i18n/zh-Hant.json`（本指示書と同封） |
| `i18n/zh-Hans.json` | `i18n/zh-Hans.json`（本指示書と同封） |
| `i18n/phonemes/zh-Hant.json` | `i18n/phonemes/zh-Hant.json`（本指示書と同封） |
| `i18n/phonemes/zh-Hans.json` | `i18n/phonemes/zh-Hans.json`（本指示書と同封） |

**内容確認済み事項:**
- Tier 1（UI）は繁體 162 キー / 简体 162 キーで完全一致（`lang_opts.zh-Hant` と `lang_opts.zh-Hans` の 2 キー含む）
- Tier 3（音素）は繁體 47 キー / 简体 47 キーで完全一致、すべての IPA 記号エントリのサブキー構造も一致
- 繁體版は台灣繁體ベース。用語は台湾の英語教育慣用に準拠（`元音→母音`, `辅音→子音`, `双元音→雙母音`, `软件→軟體`, `设置→設定` 等）
- 简体版は既存 `i18n/zh.json` / `i18n/phonemes/zh.json` の本文をそのまま維持し、`lang_opts` のみ新スキーマに更新済み

### 1-2. 削除

以下 2 ファイルを削除してください（新ファイルに置き換わるため）:

- `i18n/zh.json`
- `i18n/phonemes/zh.json`

### 1-3. 他 4 言語の `lang_opts` 更新

`i18n/en.json`, `i18n/ja.json`, `i18n/ko.json`, `i18n/fil.json` の各ファイルで、以下の `lang_opts` セクションを差し替えてください。**`lang_opts` 以外の内容は絶対に変更しないこと。**

#### 現行

```json
"lang_opts": {
  "en": "English",
  "ja": "日本語",
  "zh": "中文",
  "ko": "한국어",
  "fil": "Filipino"
},
```

#### 新規（`zh` を `zh-Hant` と `zh-Hans` の 2 つに分割）

```json
"lang_opts": {
  "en": "English",
  "ja": "日本語",
  "zh-Hant": "繁體",
  "zh-Hans": "简体",
  "ko": "한국어",
  "fil": "Filipino"
},
```

**注意事項:**
- キーの順序は上記通り（`ja` の直後に `zh-Hant` → `zh-Hans` を配置、`ko` の前）— 現行の位置関係を維持
- 「繁體」「简体」の文字はどの言語ファイルでも共通（各言語での自称呼称を採用しないのは、ボタンラベルとして自己言及的に読める方が自然なため。`guide.json` の言語ピルと同じ設計）

---

## 2. `index.html` 変更点

以下 4 箇所を修正します。行番号は 2026-07-06 時点の main の実装を基準とした目安です（実際は文字列一致で編集してください）。

### 2-1. 言語ピッカー HTML の修正（約 L505-508）

#### 現行

```html
<div class="langopts" id="langOpts">
  <button class="langopt" type="button" data-lang="en" aria-pressed="true">English</button>
  <button class="langopt" type="button" data-lang="ja" aria-pressed="false">日本語</button>
  <button class="langopt" type="button" data-lang="zh" aria-pressed="false">中文</button>
  <button class="langopt" type="button" data-lang="ko" aria-pressed="false">한국어</button>
  <button class="langopt" type="button" data-lang="fil" aria-pressed="false">Filipino</button>
</div>
```

#### 変更後

```html
<div class="langopts" id="langOpts">
  <button class="langopt" type="button" data-lang="en" aria-pressed="true">English</button>
  <button class="langopt" type="button" data-lang="ja" aria-pressed="false">日本語</button>
  <button class="langopt" type="button" data-lang="zh-Hant" aria-pressed="false">繁體</button>
  <button class="langopt" type="button" data-lang="zh-Hans" aria-pressed="false">简体</button>
  <button class="langopt" type="button" data-lang="ko" aria-pressed="false">한국어</button>
  <button class="langopt" type="button" data-lang="fil" aria-pressed="false">Filipino</button>
</div>
```

`data-lang` の値は `lang_opts` のキーと厳密に一致させること。ボタンのテキストは初期表示用のプレースホルダで、実際の値は `applyI18n()` 内の `b.textContent = t("lang_opts." + b.dataset.lang)` で上書きされる（既存動作、変更不要）。

### 2-2. LANG 初期化と自動マイグレーション（約 L878）

#### 現行

```js
let LANG = localStorage.getItem("app_lang") || "en";
```

#### 変更後

```js
let LANG = localStorage.getItem("app_lang") || "en";
// Migrate legacy "zh" (single Chinese) to zh-Hans (Simplified default).
// Users who preferred Traditional can switch to zh-Hant from the language picker.
if (LANG === "zh") {
  LANG = "zh-Hans";
  localStorage.setItem("app_lang", "zh-Hans");
}
```

これで既存 `zh` ユーザーは初回起動時に暗黙的に `zh-Hans` へ切り替わります（案 X 採用）。

### 2-3. `wordGloss()` のフォールバック強化（約 L944-947）

wordlist の `gloss` は `zh` キーしか持たないため、`zh-Hant` / `zh-Hans` を要求されたときは `zh` にフォールバックする必要があります。

#### 現行

```js
function wordGloss(c) {
  if (!c || !c.gloss) return c ? c.w : "";
  return c.gloss[LANG] || c.gloss.en || c.w;
}
```

#### 変更後

```js
function wordGloss(c) {
  if (!c || !c.gloss) return c ? c.w : "";
  // Chinese variants share the same gloss.zh field on wordlist entries for now.
  // Split into gloss["zh-Hant"] / gloss["zh-Hans"] is a future data task.
  if (LANG === "zh-Hant" || LANG === "zh-Hans") {
    return c.gloss[LANG] || c.gloss.zh || c.gloss.en || c.w;
  }
  return c.gloss[LANG] || c.gloss.en || c.w;
}
```

### 2-4. `loadLocale()` の `documentElement.lang` 設定（約 L935）

`document.documentElement.lang` は BCP 47 に沿った値を渡します。`zh-Hant` / `zh-Hans` はそのまま BCP 47 準拠なので、既存の zh 特例分岐を削除できます。

#### 現行

```js
async function loadLocale(lang) {
  const uiRes = await fetch("i18n/" + lang + ".json");
  if (!uiRes.ok) throw new Error("locale load failed: " + lang);
  UI = await uiRes.json();
  const phRes = await fetch("i18n/phonemes/" + lang + ".json");
  if (phRes.ok) PH = await phRes.json();
  else PH = await (await fetch("i18n/phonemes/en.json")).json();
  document.documentElement.lang = lang === "zh" ? "zh-Hans" : lang;
}
```

#### 変更後

```js
async function loadLocale(lang) {
  const uiRes = await fetch("i18n/" + lang + ".json");
  if (!uiRes.ok) throw new Error("locale load failed: " + lang);
  UI = await uiRes.json();
  const phRes = await fetch("i18n/phonemes/" + lang + ".json");
  if (phRes.ok) PH = await phRes.json();
  else PH = await (await fetch("i18n/phonemes/en.json")).json();
  document.documentElement.lang = lang;
}
```

### 2-5. 変更不要な既存関数（参考）

以下の関数は既に `zh-Hant` / `zh-Hans` に対応済みなので**変更不要**です。動作確認のみ:

- `mapAppLangToGuide()` (約 L663): `zh` → `zh-Hans` のフォールバックが残っていますが、上記 2-2 のマイグレーションにより実行時に `LANG === "zh"` に到達することはなくなります。互換性維持のためこの分岐は残してください（削除もOKですが、リスク回避のため残置推奨）
- `csRuleText()` (約 L964): `c.cs_rule[LANG] || c.cs_rule.en` のパターンで、`connected_speech.json` の `cs_rule` に元々 zh キーがないため、`zh-Hant` / `zh-Hans` 要求時も en フォールバックが働きます（既存動作と同じ）

---

## 3. 検証手順

### 3-1. ローカル起動確認

1. `git status` で追加/削除/変更ファイルが以下と一致することを確認:
   - 新規: `i18n/zh-Hant.json`, `i18n/zh-Hans.json`, `i18n/phonemes/zh-Hant.json`, `i18n/phonemes/zh-Hans.json`
   - 削除: `i18n/zh.json`, `i18n/phonemes/zh.json`
   - 変更: `index.html`, `i18n/en.json`, `i18n/ja.json`, `i18n/ko.json`, `i18n/fil.json`（各 `lang_opts` セクションのみ）
2. ローカルで静的サーバー起動（`python3 -m http.server` 等）してブラウザで開く
3. 開発者ツールの Console でエラーがないこと、Network タブで新しい JSON が 200 で読み込まれることを確認

### 3-2. UI 動作確認

以下の 5 シナリオを実施:

| # | 事前状態 | 操作 | 期待結果 |
|---|---|---|---|
| 1 | localStorage クリア | 初回起動 | 英語 UI で開く。設定モーダルに「繁體」「简体」が別々に表示される |
| 2 | `app_lang=zh-Hant` | 起動 | UI が台灣繁體で表示される（例:「單字」「詞庫」「複習」「設定」） |
| 3 | `app_lang=zh-Hans` | 起動 | UI が简体で表示される（例:「单词」「词库」「复习」「设置」） |
| 4 | `app_lang=zh`（旧ユーザー模擬） | 起動 | 自動的に简体で表示され、localStorage が `zh-Hans` に書き換わっていることを確認 |
| 5 | 繁體選択中 | 学習ガイドを開く | 「繁體」タブが自動選択され、繁體の学習ガイドが表示される |

### 3-3. 単語プール表示の確認（フォールバック動作）

繁體と简体それぞれで、Mode B の Study 画面 or 語彙ブラウザを開いて、単語の gloss（意味表示）が中国語で表示されることを確認。**現状は繁體/简体どちらを選んでも同じ `gloss.zh` の内容が表示される**（フォールバックが効いている）。この挙動は仕様通り。将来的に gloss を分離するのは別タスク。

### 3-4. 音素キーボードのラベル確認

繁體選択時にキーボードの母音/子音セクションのラベルが以下になっていることを確認:

- 現行简体: 「元音」「r化元音」「双元音」「辅音」
- 新規繁體: 「母音」「r色母音」「雙母音」「子音」

---

## 4. 実装レポートの記載事項

作業完了後、以下を含む実装レポートを Naoya に提出してください:

1. 追加/削除/変更したファイルのリスト（`git status` 出力貼付）
2. `index.html` の変更 4 箇所の diff（該当行の before/after）
3. `i18n/{en,ja,ko,fil}.json` の `lang_opts` 変更の diff
4. 検証 3-2 の 5 シナリオそれぞれの実行結果（PASS/FAIL・スクリーンショット任意）
5. 検証 3-3、3-4 の結果
6. 既知の残作業・懸念事項があれば箇条書き

---

## 5. トラブルシューティング

### `zh-Hant.json` の読み込みで 404

- ファイルパスが正確か確認: `i18n/zh-Hant.json`（小文字の zh、ハイフン、大文字の Hant）
- GitHub Pages は URL のケースセンシティブなので `zh-hant.json` 等の別名では動かない

### 「繁體」を選んでもガイドが英語のまま

- `mapAppLangToGuide()` が `zh-Hant` をそのまま返しているか（本指示書 2-5 参照）
- `data/guide.json` の中に `"zh-Hant"` キーが存在するか確認（既に存在しているはず。今回のスコープでは触らない）

### 旧 `zh` ユーザーの自動マイグレーションが効かない

- 本指示書 2-2 の初期化ブロックが正しく挿入されているか
- localStorage の `app_lang` を DevTools で直接確認

### 検証中に他言語（英語・日本語等）の UI に文字化けや欠落が起きた

- `i18n/{en,ja,ko,fil}.json` の `lang_opts` 以外を誤って編集していないか確認
- 特に JSON 末尾のカンマ・ブレースの整合性チェック

---

## 6. Git コミット推奨単位

```
Commit 1: Add Chinese UI split — Traditional (zh-Hant) and Simplified (zh-Hans) i18n files
  - i18n/zh-Hant.json (new, Taiwanese Traditional)
  - i18n/zh-Hans.json (new, from existing zh.json body with updated lang_opts)
  - i18n/phonemes/zh-Hant.json (new, Taiwanese Traditional)
  - i18n/phonemes/zh-Hans.json (new, unchanged body from existing phonemes/zh.json)
  - i18n/zh.json (deleted)
  - i18n/phonemes/zh.json (deleted)

Commit 2: Update lang_opts in en/ja/ko/fil for zh split

Commit 3: Wire zh-Hant/zh-Hans into language picker with auto-migration from legacy zh
  - index.html: picker HTML, LANG init migration, wordGloss fallback, loadLocale cleanup
```

3 コミットに分けるのは、後で問題が起きたときの切り分けを楽にするためです。まとめて 1 コミットでも構いません。

---

以上で作業完了です。実装レポート提出後、Naoya がテスト・git push・GitHub Pages 反映確認を行います。
