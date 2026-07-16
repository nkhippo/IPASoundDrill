---
id: pj-2026-06-28-3aaf
aliases:
- pj-2026-06-28-3aaf
title: 'Cursor 指示書 — Mode B Study: 2段階 reveal UX + `def` フィールド導入'
created: '2026-06-28'
---

# Cursor 指示書 — Mode B Study: 2段階 reveal UX + `def` フィールド導入

> 作成日: 2026-06-28
> 種別: UI/UX 改修 + データスキーマ拡張
> 対象: `index.html`（単一HTML本体）、`i18n/*.json`、`wordlist_GA_a1a2_plus_phonics.json`
> 正本: `PURPOSE.md`（§3 Mode B）

---

## 0. 改修意図

Mode B Study フェーズで意味（単語＋語義）が最初から見えているため、音を聞く前に意味で「答え」が分かってしまう。
**IPA + 音声を先に提示し、学習者が能動的に意味を開示するフローへ変更する。**

---

## 1. 現状（確認済み DOM・関数）

| 要素 | ID | 内容 |
|------|-----|------|
| 番号表示 | `#mbSNo` | `#01` 等 |
| 音声ボタン | `#mbSPlay` | 再生 |
| IPA 表示 | `#mbSIpa` | `/boʊt/` 等 |
| 単語表示 | `#mbSWord` | `boat` |
| 語義表示 | `#mbSGloss` | `ボート` / `bangka` 等 |
| 進行ボタン | `#mbSGotIt` | 「覚えた→次へ」 |
| render 関数 | `renderModeBStudy(c)` | `1147` 行付近 |
| click handler | `$(「mbSGotIt」).addEventListener` | `1881` 行付近 |

---

## 2. 変更後フロー

```
Phase 1（初期表示）
  表示: IPA (#mbSIpa) + 音声ボタン (#mbSPlay)
  非表示: 単語 (#mbSWord) + 語義 (#mbSGloss)
  ボタン: 「意味を確認する」(#mbSRevealBtn)  ← 新規

Phase 2（reveal クリック後）
  表示: 上記すべて + フェードイン
  ボタン: 「覚えた→次へ」(#mbSGotIt)  ← 既存
  ※ 音声は Phase 1 で既に自動再生済み
```

画面遷移なし。1枚のカード (`#cardModeBStudy`) 内で状態を切り替える。

---

## 3. `index.html` の変更

### 3-1. DOM（`337–342` 行付近の `#cardModeBStudy` 内）

**追加: reveal ボタン**（`#mbSGotIt` の直前に挿入）

```html
<button class="btn-reveal" id="mbSRevealBtn" type="button">意味を確認する</button>
```

**追加: 単語・語義ラッパー**（`#mbSWord` と `#mbSGloss` を `div#mbSMeaning` で囲む）

```html
<div id="mbSMeaning" class="mbsMeaning">
  <div class="readout"><div class="wordbig" id="mbSWord"></div></div>
  <div class="word-gloss" id="mbSGloss" style="text-align:center;margin-bottom:12px"></div>
</div>
```

### 3-2. CSS

```css
/* Phase 1: 意味エリア非表示 */
#mbSMeaning.hidden { display: none; }

/* Phase 2: フェードイン */
#mbSMeaning {
  animation: mbsFadeIn 0.25s ease;
}
@keyframes mbsFadeIn {
  from { opacity: 0; transform: translateY(6px); }
  to   { opacity: 1; transform: translateY(0); }
}

/* reveal ボタンのスタイル（既存 .reveal-next に準ずるが色を変える） */
.btn-reveal {
  /* 既存テーマカラーのセカンダリトーン。例: outline スタイル */
  width: 100%;
  padding: 14px;
  border: 2px solid var(--accent, #2a9d8f);
  background: transparent;
  color: var(--accent, #2a9d8f);
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
}
.btn-reveal.hidden { display: none; }
```

### 3-3. `renderModeBStudy`（`1147` 行付近）

```js
function renderModeBStudy(c){
  hideModeBCards(); show("cardModeBStudy", true);
  $("mbSNo").textContent = "#" + String(S.idx+1).padStart(2,"0");
  renderIpaInto($("mbSIpa"), activeIpa(c), "dInfo", null);

  // Phase 1: 意味エリアを隠す
  $("mbSMeaning").classList.add("hidden");
  $("mbSRevealBtn").classList.remove("hidden");
  $("mbSGotIt").classList.add("hidden");

  // 語義テキストをセット（Phase 2 で表示するので先に書き込んでおく）
  $("mbSWord").textContent = c.w;
  $("mbSGloss").textContent = modeBDisplayGloss(c);  // §5 参照

  setTimeout(()=>speak(c.w), 250);
}
```

### 3-4. reveal ハンドラ（既存の `$(「mbSGotIt」).addEventListener` 付近・`1881` 行付近）

```js
// 新規: reveal ボタンのクリック
$("mbSRevealBtn").addEventListener("click", () => {
  $("mbSMeaning").classList.remove("hidden");
  $("mbSRevealBtn").classList.add("hidden");
  $("mbSGotIt").classList.remove("hidden");
});
```

### 3-5. `applyI18n`（`695` 行付近）

既存の `mbSGotIt` ラベル設定の後に追加:
```js
$("mbSRevealBtn").textContent = t("modeb.study.reveal_meaning");
```

---

## 4. i18n（新キー 1個・5言語）

`modeb.study.reveal_meaning` を全 UI ファイルに追加:

| ファイル | 値 |
|----------|-----|
| `i18n/en.json` | `"Reveal meaning"` |
| `i18n/ja.json` | `"意味を確認する"` |
| `i18n/zh.json` | `"查看含义"` |
| `i18n/ko.json` | `"의미 확인하기"` |
| `i18n/fil.json` | `"Tingnan ang kahulugan"` |

追加後 `python3 tools/validate_i18n.py` → ERROR 0 を確認（キー 1個増で 152キーになる）。

---

## 5. 英語 UI の語義問題（`modeBDisplayGloss` 新関数）

**現状の問題:** `gloss.en` は wordlist 3,059語のうち **2,881語（94%）が単語そのもの**（`"boat" → "boat"`）。英語 UI で語義を表示しても無意味。

**対応方針（段階的）:**

#### 即時対応（今回実装）

新関数 `modeBDisplayGloss(c)` を追加し、英語 UI での自己参照を検知して代替表示:

```js
function modeBDisplayGloss(c){
  const g = wordGloss(c);                    // 既存: LANG での語義を返す
  if(LANG === "en" && g === c.w){
    // def フィールドがあれば使う（将来拡張）
    if(c.def) return c.def;
    // なければ品詞ラベルのみ表示
    const pos = posLabel(c.pos);
    return pos ? `(${pos})` : "";
  }
  return g;
}
```

> MCQ の `modeBGloss()` は引き続き `wordGloss()` を使う（短ラベルが MCQ 選択肢として必要）。

#### 将来対応（別データタスク）

`wordlist_GA_a1a2_plus_phonics.json` に `def` フィールド（英語定義文）を追加する。
Claude がバッチ生成（Tier 2 の `gloss.fil` と同方式。約 38バッチ）。

`def` フィールドの形式:
```json
{
  "w": "boat",
  "def": "A small to medium-sized watercraft used to travel on water such as lakes, rivers, or coastal areas.",
  ...
}
```

`modeBDisplayGloss` は `def` が入り次第、自動的に使用する（実装変更不要）。

---

## 6. 検証 / DoD

```bash
python3 tools/validate_i18n.py   # ERROR 0（152キー × 5言語）
```

実機（Mode B Study フェーズ）:

- [ ] Phase 1: IPA + 音声ボタンのみ表示、単語・語義は非表示
- [ ] Phase 1: 「意味を確認する」ボタン（各言語で正しいラベル）が表示される
- [ ] Phase 1: 音声が自動再生される（既存動作維持）
- [ ] Phase 2: reveal クリックで単語・語義がフェードイン
- [ ] Phase 2: 「意味を確認する」ボタンが消え「覚えた→次へ」が出現
- [ ] Phase 2 → 次カード: Phase 1 に戻る（状態がリセットされる）
- [ ] 英語 UI: `gloss.en === w` のとき `(品詞)` が表示される（`boat` → `(noun)` 等）
- [ ] 英語 UI 以外: 従来どおり各言語語義が表示される
- [ ] Mode B MCQ / Dict フェーズに影響なし（reveal ボタンは Study カードのみ）
- [ ] Words タブ・Mode A に影響なし

---

## 7. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `index.html` | DOM 追加・`renderModeBStudy` 修正・reveal handler・`modeBDisplayGloss` 追加 |
| `i18n/en.json` … `fil.json` | `modeb.study.reveal_meaning` 追加（5ファイル） |
| `docs/PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` | Study フェーズ2段階 reveal を反映 |
| `docs/i18n-audit.md` | `gen_audit_docs.py` で再生成 |

---

## 8. `def` フィールド生成への申し送り（Claude 宛）

- 3,059語に英語定義文が必要（`gloss.en === w` は 2,881語）
- 形式: 1〜2文の平易な英語定義。学習者が意味を理解できる最低限の情報
- 例: `"boat" → "A small watercraft used to travel on water, such as rivers, lakes, or coastal areas."`
- Tier 2 `gloss.fil` と同じバッチ方式（80語/バッチ × 約38バッチ）で生成
- マージスクリプト: `tools/merge_def.py`（Cursor が `merge_gloss_fil.py` を参考に作成）
- Cursor 実装との依存関係なし（`modeBDisplayGloss` の `c.def` 分岐は実装済みで待機状態）
