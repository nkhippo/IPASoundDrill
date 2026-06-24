# 言語追加プレイブック（i18n スケーリング設計）

> 作成: 2026-06-24 ／ 対象: English Pronunciation Trainer
> 目的: **言語を増やすとき「どこを触れば良いか」を1枚で可視化**し、抜け漏れによるバグを防ぐ。
> 関連: 検査は `tools/validate_i18n.py` を実行。

---

## 0. 設計の大前提（フォールバック挙動）

実装（`index.html`）は以下のフォールバックを持つため、**段階的な言語追加が安全**にできる。

| 仕組み | 関数 | 欠落時の挙動 |
|--------|------|--------------|
| UI 文言 | `t(path)` | キーが無ければ **`path` 文字列をそのまま表示**（クラッシュしない） |
| UI ロケール | `loadLocale()` | `i18n/<lang>.json` が無いと **throw**（＝UIファイルは必須） |
| 音素解説 | `loadLocale()` | `phonemes/<lang>.json` が無ければ **en にフォールバック** |
| 語義 gloss | `wordGloss()` | `gloss[LANG]` が無ければ **en gloss → 単語** にフォールバック |

→ **結論:** 言語追加は2段階に分けられる。
- **Tier 1（UIだけ多言語化）**: UIファイルさえ作れば動く。語義は英語表示にフォールバック。
- **Tier 2（語義も母語化）**: wordlist の `gloss.<lang>` を全語そろえる（Mode B の採点に必須）。

---

## 1. 言語を1つ追加するときの作業チェックリスト

`<lang>` = 追加する言語コード（例: `es`, `fr`, `vi`）。例として `<Native>` は母語表記名。

### Tier 1：UI 多言語化（最小）

| # | 対象 | 作業 | 必須 |
|---|------|------|------|
| 1 | `i18n/<lang>.json` | `i18n/en.json` をコピーし全 **98 キー**を翻訳 | ◎必須（無いと起動失敗） |
| 2 | `i18n/phonemes/<lang>.json` | `phonemes/en.json` をコピーし **43 記号 × {lab,ex,mouth,trap,t}** を翻訳 | ○推奨（無いと音素解説が英語） |
| 3 | `lang_opts.<lang>` キー | **全 UI ファイル**（en/ja/zh/ko/`<lang>`）に `"<lang>": "<Native>"` を追加 | ◎必須（ピッカーの表示名） |
| 4 | `index.html` 言語ピッカー | `#langOpts` に `<button class="langopt" data-lang="<lang>">…</button>` を1個追加（現状ハードコード, 304–308行付近） | ◎必須 |
| 5 | `document.documentElement.lang` | 特殊表記が要る言語のみ `loadLocale()` の三項を拡張（現状 `zh→zh-Hans` のみ） | △必要時 |
| 6 | フォント / 表記方向 | RTL言語（ar, he 等）は CSS に `dir` 対応を追加。CJK以外の字形フォントが要れば `@font-face` | △必要時 |

### Tier 2：語義（gloss）も母語化（Mode B 前提）

| # | 対象 | 作業 | 必須 |
|---|------|------|------|
| 7 | `wordlist_*.json` の `gloss.<lang>` | 全 **2840 語**に `<lang>` 訳を追加 | Mode B を `<lang>` で出すなら必須 |
| 8 | `pos.*` キー | 品詞ラベルを `<lang>` 化（`posLabel()` 用、Mode B で品詞併記するなら） | △方針次第 |
| 9 | `patterns.*` キー | 綴り規則注記の `<lang>` 化（`localizePattern()` 用） | ○推奨 |

### 仕上げ

| # | 作業 |
|---|------|
| 10 | `python3 tools/validate_i18n.py` を実行し ERROR ゼロを確認 |
| 11 | 実機で当該言語に切替え、setup/decode/encode/reveal/summary/settings を目視 |

---

## 2. 現状のリスク箇所と構造改善提案（STEP4 候補）

言語が増えるほど効いてくる「同期ズレが起きやすい点」と、その解消案。

1. **言語の正本リストが二重管理**
   現状、対応言語は (a) `i18n/*.json` ファイルの存在、(b) `index.html` のピッカーボタン、(c) 各ファイルの `lang_opts.*` の3か所に散在。
   **提案:** `index.html` 冒頭に `const LANGS = [{code:"en",native:"English"}, …]` を単一の正本として置き、ピッカーボタンを JS で生成する。追加作業が「LANGS に1行＋ファイル2枚」に縮約され、`lang_opts.*` 同期漏れも消える。

2. **UI言語と gloss言語の粒度差が不可視**
   UIだけ追加すると語義が英語にフォールバックする（バグではないが、利用者には「半端に英語が出る」と見える）。
   **提案:** `LANGS` の各要素に `glossReady:true/false` を持たせ、未整備言語はピッカーに「(UIのみ)」を出す等の明示。

3. **監査ドキュメントが手動生成で陳腐化する**
   `docs/i18n-audit.md` は生成日時点のスナップショットで、Mode A で増えたキー（`focus.*`/`reg.*`/`pool.*`）が未反映だった。
   **提案:** `tools/validate_i18n.py` を拡張してキー×言語表を自動出力（監査を自動再生成）にする。

4. **`document.documentElement.lang` と TTS 言語**
   発音は GA 固定（OpenAI TTS）なので gloss 言語に依らないが、将来 `lang` 属性や音声を言語連動させる場合は `loadLocale()` の一点に集約しておく。

---

## 3. キー構造リファレンス（2026-06-24 時点）

- UI キー総数: **98**（`i18n/en.json` 基準）
- 音素記号数: **43**（`i18n/phonemes/en.json` 基準、フィールド `lab/ex/mouth/trap/t`）
- 言語非依存で en と同値が正しいキー（検査の除外リスト＝`validate_i18n.py` の `ALLOW_EN_IDENTICAL`）:
  `focus.traps_d`（IPA記号列）, `lvl.all/b1/b2/c1`（CEFRコード）, `lang_opts.*`（自称言語名）

### 現状の未使用・予約キー（削除せず保持）

将来 Mode B / CEFR-UI で再利用が見込まれるため**意図的に残置**。`validate_i18n.py` でも警告にならない。

| キー群 | 状態 | 想定再利用先 |
|--------|------|--------------|
| `lvl.*`（label/all/b1/b2/c1/pool） | 現UI未配線 | **Mode B の CEFR バンド選択**（PURPOSE §3 主軸） |
| `set.*`（label/daily_*/phonics_*） | 現UI未配線 | Mode B の出題セット選択 |
| `pos.*`（13品詞） | `posLabel()` 定義のみ未呼出 | Mode B の品詞併記 |
| `patterns.*` | `localizePattern()` 用 | 綴り規則注記の追加時 |
| `hint.*`, `syl`, `syl_pl` | 旧UI遺物 | 用途なければ STEP4 で削除検討 |
| `lvl.pool` | `pool.count` と重複 | どちらか一本化を STEP4 で検討 |
