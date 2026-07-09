# 実装レポート — 反対アクセント（GA↔RP）全画面対応

**日付:** 2026-07-06（初版）／ **追記:** 2026-07-09（表示形式・ラベル更新）  
**指示書:** `docs/cursor/briefs/cursor-alt-accent-display-brief.md`

---

## 1. 変更サマリ（初版 2026-07-06）

| 領域 | 変更内容 |
|------|----------|
| 共通関数 | `altAccentLabel()` / `altAccentValue(c)` を `hasNarrowDifference` 直後に追加 |
| i18n | `reveal.alt_same` を en/ja/zh/ko/fil に追加 |
| Reveal | `refreshRevealIpa` — 同一時も `#rAltIpa` を表示 |
| Decode | `#dAltIpa` DOM + `renderDecode` 描画（words のみ、connected/weak は非表示） |
| Mode B Study | `#mbSAltIpa` DOM + `renderModeBStudy` 描画 |
| 語彙ブラウザ | Words / Phrases の RP 行を常時表示。同一時は same マーカー付き |
| CSS | `.alt-ipa` に `text-align: center` を追加 |
| ドキュメント | `SPECIFICATION.md` / `DESIGN.md` を更新 |

---

## 2. 追記（2026-07-09）

| 項目 | 現行仕様 |
|------|----------|
| 同一時の表示 | `/ipa/（同じ）`（CJK は全角カッコ、他言語は半角）。`formatSameAccentIpa()` |
| 反対アクセントラベル | `GA` / `RP` のみ（`reveal.ga_note` / `reveal.rp_note`） |
| 同一判定 | **`ipa === rp_ipa` の文字列一致**（`ga_rp_same` フラグは未実装） |
| 今後の改善案 | `docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md` |

---

## 3. アクセント切替時の追随

**判断:** 追加ヘルパーは不要。既存経路で十分。

`setAccent()` は `S.revealed` でない場合 `renderCard()` を呼び出し、`renderCard()` が `renderDecode(c)` / `renderModeBStudy(c)` を再実行する。`#dAltIpa` / `#mbSAltIpa` の描画はこれらの関数内にあるため、アクセント切替時に自動追随する。

---

## 4. DoD チェック結果（初版）

| 項目 | 結果 |
|------|------|
| `altAccentLabel()` / `altAccentValue(c)` 追加 | ✅ |
| 既存 `activeIpa` 等は未変更 | ✅ |
| i18n 6言語 `reveal.alt_same` | ✅（zh-Hans/zh-Hant 分離後） |
| `#dAltIpa` / `#mbSAltIpa` DOM | ✅ |
| `refreshRevealIpa` 書き換え | ✅ |
| `renderDecode` / `renderModeBStudy` | ✅ |
| アクセント切替追随 | ✅（既存 `renderCard` 経由） |
| 語彙ブラウザ Words / Phrases | ✅ |
| Encode / MCQ / Dictation / Summary 未変更 | ✅ |

---

## 5. 実機動作確認（データ検証）

wordlist 上の代表語:

| 語 | GA | RP | 期待表示（2026-07-09） |
|----|-----|-----|------------------------|
| `about` | /əˈbaʊt/ | /əˈbaʊt/ | `RP: /əˈbaʊt/（同じ）` |
| `after` | /ˈæftɚ/ | /ˈɑːftə/ | `RP: /ˈɑːftə/` |
| `agree` | /əˈɡri/ | /əˈɡriː/ | `RP: /əˈɡriː/`（文字列不一致のため same にならない） |

ロジック検証: `alt === active` → `formatSameAccentIpa(alt)`、異なる → `alt` のみ。

---

## 6. CSS

```css
.alt-ipa { … text-align: center }
.seg.nucleus { … soft fill + text-decoration underline（2026-07-09 折衷スタイル） }
```

Decode / Mode B Study の中央寄せ用。Reveal は `.reveal` 内で既に中央寄せ。
