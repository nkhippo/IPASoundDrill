# 実装レポート — 反対アクセント（GA↔RP）全画面対応

**日付:** 2026-07-06  
**指示書:** `cursor-alt-accent-display.md`（Claude 作成）

---

## 1. 変更サマリ

| 領域 | 変更内容 |
|------|----------|
| 共通関数 | `altAccentLabel()` / `altAccentValue(c)` を `hasNarrowDifference` 直後に追加 |
| i18n | `reveal.alt_same` を en/ja/zh/ko/fil に追加 |
| Reveal | `refreshRevealIpa` — 同一時も `#rAltIpa` を表示（`同じ (/…/)`） |
| Decode | `#dAltIpa` DOM + `renderDecode` 描画（words のみ、connected/weak は非表示） |
| Mode B Study | `#mbSAltIpa` DOM + `renderModeBStudy` 描画 |
| 語彙ブラウザ | Words / Phrases の RP 行を常時表示。同一時は `alt_same (IPA)` |
| CSS | `.alt-ipa` に `text-align: center` を追加 |
| ドキュメント | `SPECIFICATION.md` / `DESIGN.md` を更新 |

---

## 2. アクセント切替時の追随

**判断:** 追加ヘルパーは不要。既存経路で十分。

`setAccent()` は `S.revealed` でない場合 `renderCard()` を呼び出し、`renderCard()` が `renderDecode(c)` / `renderModeBStudy(c)` を再実行する。今回追加した `#dAltIpa` / `#mbSAltIpa` の描画はこれらの関数内にあるため、アクセント切替時に自動追随する。

---

## 3. DoD チェック結果

| 項目 | 結果 |
|------|------|
| `altAccentLabel()` / `altAccentValue(c)` 追加 | ✅ |
| 既存 `activeIpa` 等は未変更 | ✅ |
| i18n 5言語 `reveal.alt_same` | ✅ |
| `#dAltIpa` / `#mbSAltIpa` DOM | ✅ |
| `refreshRevealIpa` 書き換え | ✅ |
| `renderDecode` / `renderModeBStudy` | ✅ |
| アクセント切替追随 | ✅（既存 `renderCard` 経由） |
| 語彙ブラウザ Words / Phrases | ✅ |
| Encode / MCQ / Dictation / Summary 未変更 | ✅ |
| `tools/validate_i18n.py` | ✅ ERROR なし（既存 WARN 4件のみ） |
| `encodeCheck` diff | ✅ ゼロ |

---

## 4. 実機動作確認（データ検証）

wordlist 上の代表語:

| 語 | GA | RP | 期待表示 |
|----|-----|-----|----------|
| `about` | /əˈbaʊt/ | /əˈbaʊt/ | `RP: same (/əˈbaʊt/)` |
| `after` | /ˈæftɚ/ | /ˈɑːftə/ | `RP: /ˈɑːftə/` |
| `address` | /ˈæˌdrɛs/ | /ˈæˌdres/ | `RP: /ˈæˌdres/` |

ロジック検証: `alt === active` → `t("reveal.alt_same") + " (" + alt + ")"`、異なる → `alt` のみ。

---

## 5. `validate_i18n.py` 実行ログ

```
[A] UI 言語: ['en', 'fil', 'ja', 'ko', 'zh']  キー数(en)=161
[B] 音素言語: ['en', 'fil', 'ja', 'ko', 'zh']  記号数(en)=47
[D] 動的キー接頭辞(前方一致で許容): ['.', 'accent.', 'lang_opts.']

WARN  [C] fil.json: en と同一値 4件 -> ['back_top', 'brand.name', 'reg.regular', 'tab.connected']

警告 1 件（ハード不整合なし）。
```

---

## 6. CSS 追加

```css
.alt-ipa { … text-align: center }
```

Decode / Mode B Study の中央寄せ用。Reveal は `.reveal` 内で既に中央寄せ。
