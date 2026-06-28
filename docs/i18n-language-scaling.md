# 言語追加プレイブック（i18n スケーリング設計）

> 作成: 2026-06-24 ／ **更新: 2026-06-26** ／ 対象: English Pronunciation Trainer  
> 目的: **言語を増やすとき「どこを触れば良いか」を1枚で可視化**し、抜け漏れによるバグを防ぐ。  
> 検査: `python3 tools/validate_i18n.py`（`--strict` で未翻訳疑いも失敗扱い）

---

## 0. 設計の大前提（フォールバック挙動）

実装（`index.html`）は以下のフォールバックを持つため、**段階的な言語追加が安全**にできる。

| 仕組み | 関数 / データ | 欠落時の挙動 |
|--------|---------------|--------------|
| UI 文言 | `t(path)` | キーが無ければ **`path` 文字列をそのまま表示**（クラッシュしない） |
| UI ロケール | `loadLocale()` | `i18n/<lang>.json` が無いと **throw**（＝UIファイルは必須） |
| 音素解説 | `loadLocale()` | `phonemes/<lang>.json` が無ければ **en にフォールバック** |
| 語義 gloss | `wordGloss()` | `gloss[LANG]` が無ければ **en gloss → 単語** にフォールバック |
| 連結句・弱形ルール | `csRuleText()` | `cs_rule[LANG]` が無ければ **en** にフォールバック |
| 学習ガイド | `renderGuide()` | `guide.json[lang]` が無ければ **en** にフォールバック |

→ **結論:** 言語追加は段階的にできる。

| Tier | 内容 | 利用者への見え方 |
|------|------|------------------|
| **Tier 1** | UI + 音素解説 | アプリ全体は母語化。語義・ルール文は英語フォールバック |
| **Tier 2** | wordlist `gloss.<lang>` | Mode B の意味 MCQ が母語化（**3059 語**） |
| **Tier 3** | `guide.json` 本文 | ガイドモーダルが母語化（UI キー `guide.*` とは別ファイル） |
| **Tier 4** | `cs_rule.<lang>` | 連結句・弱形タブの reveal ルール文が母語化（**237 件** = 201 連結 + 36 弱形） |

現状の UI 言語は **5 言語**（`en` / `ja` / `zh` / `ko` / `fil`）。**fil は Tier 1–4 すべて完了**（UI 152キー + gloss 3,059語 + 音素解説 + ガイド + cs_rule 237件）。

---

## 1. i18n 表面の全体像（2026-06-26）

アプリ内の「翻訳対象」は **1ファイルではなく5系統** に分かれる。`validate_i18n.py` がカバーするのは **UI + 音素** のみ。

```
┌─────────────────────────────────────────────────────────────┐
│  Tier 1（必須・検査対象）                                      │
│  i18n/<lang>.json          … 150 キー（UI 全文言）              │
│  i18n/phonemes/<lang>.json … 43 記号 × {lab,ex,mouth,trap,t} │
├─────────────────────────────────────────────────────────────┤
│  Tier 2–4（コンテンツ・手動整合）                               │
│  wordlist_GA_a1a2_plus_phonics.json … gloss.{en,ja,zh,ko} × 3059 語 │
│  data/guide.json           … en / ja / ko / zh-Hans / zh-Hant │
│  data/connected_speech.json… cs_rule.{en,ja} × 201 句        │
│  data/weak_forms.json      … cs_rule.{en,ja} × 36 語         │
└─────────────────────────────────────────────────────────────┘
```

| 表面 | 正本 | 現状の言語 | `validate_i18n.py` |
|------|------|------------|-------------------|
| UI | `i18n/en.json` | en, ja, zh, ko, fil | **[A][C][D][E]** |
| 音素解説 | `i18n/phonemes/en.json` | en, ja, zh, ko, fil | **[B]** |
| 語義 | `wordlist_GA_a1a2_plus_phonics.json` `gloss` | en, ja, zh, ko | 対象外 |
| ガイド本文 | `data/guide.json` | en, ja, ko, zh-Hans, zh-Hant, fil | 対象外 |
| 連結・弱形ルール | 各 JSON `cs_rule` | en, ja のみ | 対象外 |

**注意:** UI の `zh` とガイドの `zh-Hans` は別コード。`mapAppLangToGuide()` が `zh → zh-Hans` にマップする。

---

## 2. 言語を1つ追加するときの作業チェックリスト

`<lang>` = 追加する言語コード（例: `es`, `vi`, `fil`）。`<Native>` はピッカー表示用の自称名。

### Tier 1：UI 多言語化（最小・起動に必須）

| # | 対象 | 作業 | 必須 |
|---|------|------|------|
| 1 | `i18n/<lang>.json` | `i18n/en.json` をコピーし全 **150 キー**を翻訳 | ◎必須（無いと起動失敗） |
| 2 | `i18n/phonemes/<lang>.json` | `phonemes/en.json` をコピーし **43 記号 × 5 フィールド**を翻訳 | ○推奨（無いと音素解説が英語） |
| 3 | `lang_opts.<lang>` | **全 UI ファイル**（en/ja/zh/ko/`<lang>`）に `"<lang>": "<Native>"` を追加 | ◎必須（ピッカー表示名） |
| 4 | `index.html` 言語ピッカー | `#langOpts`（**428–432 行付近**）に `<button class="langopt" data-lang="<lang>">` を1個追加 | ◎必須 |
| 5 | `document.documentElement.lang` | 特殊表記が要る言語のみ `loadLocale()` の三項を拡張（現状 `zh → zh-Hans` のみ） | △必要時 |
| 6 | フォント / 表記方向 | RTL（ar, he 等）は `dir` 対応。字形フォントが要れば `@font-face` | △必要時 |

### Tier 2：語義（gloss）母語化 — Mode B 前提

| # | 対象 | 作業 | 必須 |
|---|------|------|------|
| 7 | `wordlist_GA_a1a2_plus_phonics.json` の `gloss.<lang>` | 全 **3059 語**に訳を追加 | Mode B を `<lang>` で出すなら必須 |
| 8 | `pos.*` キー | 品詞ラベル（`posLabel()` 用）。キー名は日本語品詞名（`名詞` 等） | △Mode B で品詞併記するなら |
| 9 | `patterns.*` キー | 綴り規則注記（`localizePattern()` 用） | ○推奨 |

### Tier 3：学習ガイド本文

| # | 対象 | 作業 | 必須 |
|---|------|------|------|
| 10 | `data/guide.json` | `GUIDE_ORDER` 配下の全セクションを `<lang>`（または `zh-Hans` 等）で追加 | ○推奨（無いと英語ガイド） |
| 11 | `#guideLangPills` | ガイド内言語ピルにボタン追加（**456–461 行付近**、UI i18n とは独立） | Tier 3 を出すなら |

### Tier 4：連結句・弱形ルール文

| # | 対象 | 作業 | 必須 |
|---|------|------|------|
| 12 | `connected_speech.json` の `cs_rule.<lang>` | 201 句それぞれにルール文 | 連結句タブを `<lang>` で出すなら |
| 13 | `weak_forms.json` の `cs_rule.<lang>` | 36 語それぞれにルール文 | 弱形タブを `<lang>` で出すなら |

### 仕上げ

| # | 作業 |
|---|------|
| 14 | `python3 tools/validate_i18n.py` → **ERROR 0** |
| 15 | 実機で当該言語に切替え、**Words / Connected Speech**（Type=weak 含む）と Mode B、settings、guide を目視 |

---

## 3. `validate_i18n.py` の検査内容

| コード | 内容 | 失敗時 |
|--------|------|--------|
| **[A]** | 全 `i18n/*.json` が `en` と同じキー構造 | ERROR |
| **[B]** | 全 `phonemes/*.json` が同じ記号・フィールド | ERROR |
| **[C]** | 値が `en` と同一（除外リスト除く） | WARN（`--strict` で ERROR） |
| **[D]** | `index.html` の `t("...")` が `en.json` に存在 | ERROR |
| **[E]** | 値に `TODO` / `★` / `XXX` / `???` | ERROR |

**2026-06-28 時点の実行結果:** UI 152 キー、音素 43 記号、5 言語、ERROR 0。

言語非依存で `en` と同値が正しいキー（`ALLOW_EN_IDENTICAL`）:

- `focus.traps_d`（IPA 記号列）
- `lvl.all` / `lvl.b1` / `lvl.b2` / `lvl.c1`（CEFR コード）
- `lang_opts.*`（自称言語名）

動的参照（前方一致で [D] 検査から除外）:

- `lang_opts.<code>` … ピッカー `t("lang_opts." + b.dataset.lang)`
- `accent.<ga|rp>` … アクセントピッカー `t("accent." + b.dataset.accent)`

---

## 4. キー構造リファレンス（`i18n/en.json` 基準・152 キー）

### 4-1. トップレベル群と用途

| キー群 | 主な用途 | 備考 |
|--------|----------|------|
| `brand.*` | ヘッダー・`document.title` | |
| `lead_html` / `lead_connected_html` / `lead_weak_html` | リード文（HTML可）。`lead_weak_html` は Connected の Type=weak 時 |
| `tab.*` | Words / Connected Speech。`tab.weak` は Connected の Type ピル（弱形）ラベルに流用 |
| `mode.*` / `modeb.*` | Mode A/B ラベル・クイズ文言 | |
| `cs.*` | 連結句 Type・Level ピル、`ruleLabel` | 弱形タブは Level のみ流用 |
| `weak.*` | reveal の強形↔弱形ラベル | |
| `focus.*` / `reg.*` / `grp.*` | Words タブのフィルタ | |
| `pool.*` | 件数表示（`{n}` プレースホルダ） | `count` / `count_phrases` / `count_weak` |
| `dir.*` | Decode / Encode 方向 | |
| `accent.*` | GA / RP 設定（動的参照） | |
| `guide.*` | ガイドモーダルの開閉ラベルのみ | 本文は `guide.json` |
| `reveal.*` | 代替アクセント IPA 注記 | |
| `kbd.*` / `note.*` / `summary.*` | 練習・reveal・サマリー | |
| `settings_*` / `lang_opts.*` | 設定モーダル | |
| `pos.*` | 品詞ラベル（キー名は日本語） | `posLabel()` 定義済み・画面未配線 |
| `lvl.*` / `set.*` | CEFR バンド・出題セット | 将来 Mode B UI 用に予約 |
| `hint.*` / `syl` / `syl_pl` | 旧 UI 遺物 | 削除候補（現状未参照） |

### 4-2. 現状未参照・予約キー（削除せず保持）

`validate_i18n.py` [D] は `index.html` の静的 `t("...")` のみ検査するため、以下は **ファイルに存在するが画面未配線**。

| キー群 | 状態 | 想定再利用先 |
|--------|------|--------------|
| `lvl.*` | 未配線 | Mode B の CEFR バンド選択 |
| `set.*` | 未配線 | Mode B の出題セット選択 |
| `pos.*`（18 品詞） | `posLabel()` のみ | Mode B の品詞併記 |
| `hint.*`, `syl`, `syl_pl` | 未参照 | 用途なければ将来削除検討 |
| `lvl.pool` | `pool.count` と役割重複 | どちらか一本化を将来検討 |

`lang_opts.*` と `accent.*` は動的参照のため [D] の「未参照」リストに出るが、**実際には使用中**。

---

## 5. 現状のリスク箇所と構造改善提案

言語が増えるほど効いてくる「同期ズレが起きやすい点」と解消案（STEP4 以降の候補）。

### 5-1. 言語の正本リストが多重管理

対応言語は次の **5か所以上** に散在する。

1. `i18n/<lang>.json` の存在
2. `index.html` `#langOpts` ボタン（UI 言語）
3. 各 UI ファイルの `lang_opts.*`
4. `data/guide.json` のトップレベルキー + `#guideLangPills`（ガイドは zh-Hans/zh-Hant 分割）
5. wordlist `gloss.*` / `cs_rule.*` のフィールド有無

**提案:** `index.html` 冒頭に `const LANGS = [{code, native, guideCode?, glossReady, csRuleReady}]` を単一正本とし、ピッカーを JS 生成。追加作業を「LANGS に1行 + ファイル群」に集約。

### 5-2. UI 言語とコンテンツ言語の粒度差が不可視

UI だけ追加すると gloss / `cs_rule` / guide が英語フォールバックする（バグではないが「半端に英語」と見える）。

**提案:** `glossReady` / `csRuleReady` フラグでピッカーに「(UIのみ)」を表示。または設定画面に整備状況を一覧。

### 5-3. 検査範囲が Tier 1 に限定

`validate_i18n.py` は UI + 音素のみ。`guide.json` や `cs_rule` の言語追加は **手動確認**が必要。

**提案（将来）:** `tools/validate_content_i18n.py` で gloss / guide / cs_rule の言語カバレッジ率をレポート。

### 5-4. 監査ドキュメントの陳腐化

`docs/i18n-audit.md` と `docs/gloss-flags.md` は `python3 tools/gen_audit_docs.py` で再生成する（2026-06-26 時点: UI **150** キー、gloss フラグ **1778** / 3059 語）。

### 5-5. TTS・UI 言語の分離

発音は GA/RP（OpenAI TTS）固定で UI 言語に非依存。`document.documentElement.lang` と将来の音声言語連動は `loadLocale()` に集約しておく。

---

## 6. 新キー追加時の運用（既存4言語への横展開）

機能追加で `en.json` にキーを足したときの手順:

1. `i18n/en.json` にキー追加（正本）
2. **ja / zh / ko に同キーを追加**（値を翻訳。急ぎなら一時的に en コピー可）
3. `python3 tools/validate_i18n.py` で [A] 欠落を検出
4. `index.html` で `t("新キー")` を参照
5. コンテンツ側（`cs_rule` 等）が要る機能なら Tier 3–4 も更新

**`tab.weak` の流用（2026-06-28 タブ統一後）:**

| キー | 用途 |
|------|------|
| `tab.weak` | Connected Speech の Type ピル「Weak forms」ラベル（旧・第3タブ名から流用） |
| `lead_weak_html` | 弱形タブリード |
| `weak.strong_label` / `weak.weak_label` | reveal 強弱対比 |
| `pool.count_weak` | プール件数 |

---

## 7. 関連ファイル

| ファイル | 役割 |
|----------|------|
| `tools/validate_i18n.py` | Tier 1 整合性チェック |
| `docs/i18n-audit.md` | キー×言語スナップショット（`gen_audit_docs.py` で再生成） |
| `docs/gloss-flags.md` | gloss 機械フラグ一覧（同上） |
| `docs/i18n-language-scaling.md` | 本ドキュメント（運用プレイブック） |
