---
id: pj-2026-06-26-f947
aliases:
- pj-2026-06-26-f947
title: 'Cursor 指示書 — タガログ語（fil）追加: Tier 1 + Tier 3（150キー版・確定）'
created: '2026-06-26'
---

# Cursor 指示書 — タガログ語（fil）追加: Tier 1 + Tier 3（150キー版・確定）

> 作成日: 2026-06-26
> 種別: 多言語対応（UI言語としてタガログ語 fil を追加）
> 正本: `docs/i18n-language-scaling.md`（2026-06-26 更新版・**150キー / 4 Tier**）
> 入力（Claude 生成済み）: `fil.json`（**151キー完成版**）、`guide.json`（6言語・fil追加済み）
> 参照: `tagalog_ui_glossary.md`（UI訳の語彙確認用）
>
> ⚠️ **本書は旧 `cursor-tagalog-tier1.md`（98キー・glossaryから翻訳前提）を置き換える。**
> 旧版は en.json が 98キーだった時点のもの。現状は **150キー**（Weak Forms タブ追加済み）で、
> glossary に無いキーが約半数（`grp.*` `kbd.*` `info.*` `lead_*_html` `note.*` `summary.*` `weak.*` 等）。
> → **Cursor は翻訳しない。Claude が生成した完成版 `fil.json` をそのまま配置する。**

---

## 0. 今回のスコープ（確定）

| Tier | 内容 | 今回 | 状態 |
|------|------|------|------|
| **Tier 1** | UI 150キー + 音素 + 言語ピッカー | ✅ 実施 | `fil.json` 完成・配線するだけ |
| **Tier 3** | `guide.json` 学習ガイド本文 | ✅ 実施 | 6言語版を差し替えるだけ |
| **Tier 2** | wordlist `gloss.fil`（3,059語） | ⏭ 別チャット | 未着手 |
| **Tier 4** | `cs_rule.fil`（連結201 + 弱形36 = 237件） | ⏭ 別チャット | 未着手 |

フォールバック機構（プレイブック §0）により、Tier 1+3 のみで安全動作する。
fil 選択時、UI とガイドはタガログ語、**gloss と連結/弱形ルール文は en にフォールバック**（クラッシュなし）。

---

## 1. Claude 生成済みの提供物（このチャット成果物）

| ファイル | 内容 | 配置先 | 備考 |
|----------|------|--------|------|
| `fil.json` | UI 151キー（150 + `lang_opts.fil`）完訳 | `i18n/fil.json` | **そのまま配置**。翻訳・編集不要 |
| `guide.json` | en/ja/ko/zh-Hant/zh-Hans/**fil**（各8セクション） | `data/guide.json` | **差し替え** |

> `fil.json` は現行 `i18n/en.json`（150キー）の実キー集合に `lang_opts.fil` を1個足した
> **151キー**で、ネスト構造は en.json と一致するよう機械生成済み。
> Claude 側で「audit の150キー == fil の150キー（+fil1個のみ差分）」「JSON妥当」を検証済み。

---

## 2. Tier 1 作業手順

### 2-1. `i18n/fil.json` を配置

提供された `fil.json` を `i18n/fil.json` として配置する。**中身は触らない。**

### 2-2. 全UIファイルに `lang_opts.fil` を追加（重要）

`validate_i18n.py [A]` は「全 `i18n/*.json` が en と同じキー構造」を要求する。
`fil.json` だけ `lang_opts.fil` を持つと **構造不一致で ERROR**。
→ **`en.json` / `ja.json` / `zh.json` / `ko.json` の `lang_opts` にも `"fil": "Filipino"` を追加**し、
全5ファイルを **151キー**に揃える。

```jsonc
// 各 i18n/<lang>.json の lang_opts 内（自称名なので全ファイル同値）
"lang_opts": {
  "en": "English",
  "ja": "日本語",
  "zh": "中文",
  "ko": "한국어",
  "fil": "Filipino"   // ← 追加
}
```

### 2-3. 言語ピッカーに Filipino を追加

`index.html` の `#langOpts`（**428–432 行付近**・ハードコード）に1ボタン追加。

```html
<button class="langopt" data-lang="fil">Filipino</button>
```

- 表示名は起動後 `t("lang_opts." + b.dataset.lang)` で `lang_opts.fil` に置換される（動的参照）。
- ハードコード初期文言は `Filipino` でよい。

### 2-4. `i18n/phonemes/fil.json`（配線優先 → 本格翻訳は Tier 2 チャット）

`i18n/phonemes/en.json`（43記号 × `{lab,ex,mouth,trap,t}`）を **そのままコピー**して
`i18n/phonemes/fil.json` を作る（音素解説は en フォールバックで英語表示／クラッシュ回避）。

> 43記号の調音解説は音声学的専門性が高く、Tier 2（gloss）チャットでまとめて高品質翻訳するのが効率的。
> **`i18n/phonemes/en.json` を Claude に渡せば、43記号×5フィールドの完訳 `phonemes/fil.json` を生成可能**（任意）。

### 2-5. `document.documentElement.lang`

タガログは特殊表記不要。`loadLocale()` の三項（現状 `zh → zh-Hans` のみ）の拡張は **不要**。

---

## 3. Tier 3 作業手順（学習ガイド）

### 3-1. `data/guide.json` を差し替え

提供された 6言語版 `guide.json` を `data/guide.json` に上書き。
（既存 en/ja/ko/zh-Hant/zh-Hans に **fil を追加**した版。本文 PII 検証済み。）

### 3-2. ガイド内言語ピルに Filipino を追加

`index.html` の `#guideLangPills`（**456–461 行付近**・UI i18n とは独立）に Filipino ピルを1個追加。

```html
<button class="guidelang" data-glang="fil">Filipino</button>
```

- ガイドは `mapAppLangToGuide()` 経由。fil はそのまま `guide.json["fil"]` を引く（特殊マップ不要）。
- `app_lang=zh` は従来どおり `zh → zh-Hans` マップを維持。

---

## 4. 検証

```bash
python3 tools/validate_i18n.py            # ERROR 0
python3 tools/validate_i18n.py --strict   # 任意: 未翻訳疑い（en同値）も洗い出す
```

期待結果: UI **151キー** × 5言語、音素 43記号 × 5言語、**ERROR 0**。

`--strict` で WARN が出うる箇所（仕様上 en と同値 or 同値に近い・許容）:
`lang_opts.*`（自称名）/ `lvl.all,b1,b2,c1`（CEFR）/ `focus.traps_d`（IPA記号列）。
これらは `ALLOW_EN_IDENTICAL` 相当。WARN が残っても Tier 1 完了判定に影響しない。

実機目視（fil に切替え）:
**Words / Connected Speech / Weak Forms** 各タブ、Mode A、Mode B、reveal、summary、settings、guide。
UI がタガログ語、gloss・cs_rule は英語フォールバックでクラッシュしないこと。

---

## 5. 今回やらないこと（別チャット）

- **Tier 2**: `wordlist_GA_a1a2_plus_phonics.json` の `gloss.fil`（3,059語）→ Mode B 採点に必須。80語/バッチで分割生成。
- **Tier 4**: `connected_speech.json` `cs_rule.fil`（201）＋ `weak_forms.json` `cs_rule.fil`（36）。
- **音素解説 fil の本格翻訳**（43記号）→ Tier 2 と同時が効率的。

> 別チャットには `HANDOFF-tagalog-to-new-chat.md` の §4–§6 を参照。
> wordlist / connected_speech / weak_forms / phonemes/en.json を添付すれば Claude が生成する。

---

## 6. DoD（Tier 1 + Tier 3）

- [ ] `i18n/fil.json`（151キー）配置（提供版そのまま）
- [ ] `en/ja/zh/ko.json` の `lang_opts` に `"fil": "Filipino"` 追加（全5ファイル151キー）
- [ ] `index.html` `#langOpts`（428–432付近）に Filipino ボタン
- [ ] `i18n/phonemes/fil.json` 配置（en コピー or 本格翻訳）
- [ ] `data/guide.json` を6言語版に差し替え
- [ ] `index.html` `#guideLangPills`（456–461付近）に Filipino ピル
- [ ] `python3 tools/validate_i18n.py` → **ERROR 0**
- [ ] 実機: fil 切替で 3タブ + Mode A/B が全画面タガログ語、gloss/cs_rule は英語フォールバック
- [ ] UI・データに個人情報が出ていない

---

## 7. Claude 申し送り（レビュー要確認点）

`fil.json` の大半は確定訳だが、以下は**意味からの翻訳**のため目視推奨（バグではない・自然さの確認）:

1. **長文HTMLリード4件**（`lead_html` / `lead_connected_html` / `lead_weak_html` / `modeb.lead_html`）
   audit 上で en 原文が一部省略されていたため、ja/ko の全文と機能から忠実に翻訳。`<b>` 等のタグは保持。
   太字対象語の位置だけ、他言語と見比べて違和感がないか確認。
2. **`brand.name` = "IPA Diktasyon · Decoder / Encoder"** / **`brand.sub` = "CEFR A1–A2 · Amerikanong Ingles"**
   ja が「音写」「アメリカ英語」と localize しているのに合わせ、Tagalog 化。
   "Decoder / Encoder" は技術語として英語据え置き。ブランド表記の好みがあれば調整可。
3. **`reveal.ga_note` = "GA (Amer.)"** / **`reveal.rp_note` = "RP (Brit.)"**
   en 同値（"GA"/"RP"）回避のため括弧注記を付与（ja の「GA（米）」に相当）。
4. **品詞ラベル `pos.*`（18件）**: 現状 UI 未配線（`posLabel()` 定義のみ）。Tier 2 で Mode B 併記する際に効く。
   標準的なフィリピン語文法用語（`pangngalan`=名詞, `pandiwa`=動詞 等）で訳出済み。

→ 上記いずれも修正不要ならそのまま。修正したい場合は該当キーの値だけ差し替えれば `validate_i18n.py` 構造には影響しない。

---

## 8. プレイブックとの対応（参照）

| プレイブック §2 の番号 | 本書での対応 |
|---|---|
| Tier1 #1 `i18n/<lang>.json` 150キー | §2-1（**完成版配置**に置換、翻訳作業なし） |
| Tier1 #2 `phonemes/<lang>.json` | §2-4（en コピー、本格翻訳は別チャット） |
| Tier1 #3 `lang_opts.<lang>` 全ファイル | §2-2 |
| Tier1 #4 言語ピッカー（428–432） | §2-3 |
| Tier1 #5 `documentElement.lang` | §2-5（不要） |
| Tier3 #10 `data/guide.json` | §3-1 |
| Tier3 #11 `#guideLangPills`（456–461） | §3-2 |
| 仕上げ #14/#15 検証・目視 | §4 |
