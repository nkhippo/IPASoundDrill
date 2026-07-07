# CEFR Phase 0-b 実装レポート

> 実施日: 2026-07-07  
> 指示書: `docs/cursor-instructions-cefr-phase0b.md`  
> ブランチ: `main`（直接マージ・push 済み）

---

## 1. 概要

Mode A セットアップに CEFR 複数選択フィルタ（A1 / A2 / B1）を追加し、`filteredPool()` に配線した。`reg=regular` 時は CEFR フィールドを非表示にしフィルタもスキップ。Mode B の `refreshVocabBandUnlock()` に空バンドの前方スキップとレガシー B2 ユーザーの後方降格を追加。i18n 6 言語の `lvl` セクションを更新（`lvl.all` 削除、`lvl.a1`/`lvl.a2` 新設、C1 はキーのみ残置）。

---

## 2. 変更ファイル一覧

| ファイル | 変更内容 |
|---------|---------|
| `index.html` | `cefrField` HTML、`S.cefrLevels`、`filteredPool()`、`updateSetupFields()`、`applyI18n()`、CEFR ピルイベント、`refreshVocabBandUnlock()` |
| `i18n/en.json` 他 5 言語 | `lvl` セクション更新 |
| `tools/validate_i18n.py` | `ALLOW_EN_IDENTICAL`: `lvl.all` → `lvl.a1`, `lvl.a2` |
| `docs/PURPOSE.md` | v3.4 変更履歴、依存表 2 行更新 |
| `docs/DESIGN.md` | Mode A CEFR フィルタ節追加 |
| `docs/SPECIFICATION.md` | セットアップ表に `cefrField` 行追加 |
| `docs/cursor-instructions-cefr-phase0b.md` | 指示書コピー |

---

## 3. `index.html` 変更箇所（6 箇所）

### 3-1. HTML — `cefrField` 新設（Direction と Customize filters の間）

```html
<div class="field" id="cefrField">
  <div class="flabel" id="flabelCefr">Level</div>
  <div class="pills" id="cefrPills">
    <button class="pill" data-cefr="A1" aria-pressed="true" id="cefrA1">A1</button>
    <button class="pill" data-cefr="A2" aria-pressed="true" id="cefrA2">A2</button>
    <button class="pill" data-cefr="B1" aria-pressed="false" id="cefrB1">B1</button>
  </div>
  <div class="countnote" id="cefrNote"></div>
</div>
```

### 3-2. 状態 `S` — `cefrLevels` 追加

```js
cefrLevels: new Set(["A1", "A2"])
```

### 3-3. `filteredPool()` — CEFR フィルタ

`reg !== "regular"` のときのみ適用。`cefrLevels.size === 0` なら空プール。

### 3-4. `updateSetupFields()` — 表示制御

```js
show("cefrField", words && S.reg !== "regular");
```

### 3-5. `applyI18n()` + CEFR ピルイベント

- `flabelCefr` ← `t("lvl.label")`
- 各ピル ← `t("lvl." + data-cefr.toLowerCase())`
- 複数選択トグル（`bindPills` 非使用）

### 3-6. `refreshVocabBandUnlock()` — 空バンド対応

- 現在バンドが空なら下位バンドへ降格
- 次バンドが空なら昇格しない

---

## 4. i18n `lvl` セクション before / after

**Before（全言語共通パターン）:**

```json
"lvl": {
  "label": "...",
  "all": "A1+A2",
  "b1": "B1",
  "b2": "B2",
  "c1": "C1",
  "pool": "..."
}
```

**After:**

```json
"lvl": {
  "label": "...",
  "a1": "A1",
  "a2": "A2",
  "b1": "B1",
  "b2": "B2",
  "c1": "C1",
  "pool": "..."
}
```

---

## 5. `python3 tools/validate_i18n.py` 実行結果

```
[A] UI 言語: ['en', 'fil', 'ja', 'ko', 'zh-Hans', 'zh-Hant']  キー数(en)=163
[B] 音素言語: ['en', 'fil', 'ja', 'ko', 'zh-Hans', 'zh-Hant']  記号数(en)=47
[D] 動的キー接頭辞(前方一致で許容): ['.', 'accent.', 'lang_opts.', 'lvl.']

WARN  [C] fil.json: en と同一値 4件 -> ['back_top', 'brand.name', 'reg.regular', 'tab.connected']

警告 1 件（ハード不整合なし）。
```

- `lvl.a1`, `lvl.a2`, `lvl.b1`, `lvl.b2`, `lvl.c1`, `lvl.label`, `lvl.pool` — 全 6 言語で存在確認済み
- `lvl.all` — 全 6 言語で不在確認済み

---

## 6. 検証 6-1 — Mode A プール件数（Python シミュレーション、`normalizeWord` 相当）

| # | reg | CEFR | 期待 | 実測 | 結果 |
|---|-----|------|------|------|------|
| 1 | all | A1+A2 | 2,382 | 2,382 | OK |
| 2 | all | A1 のみ | 1,187 | 1,187 | OK |
| 3 | all | A2 のみ | 1,195 | 1,195 | OK |
| 4 | all | A1+A2+B1 | 2,407 | 2,407 | OK |
| 5 | all | B1 のみ | 25 | 25 | OK |
| 6 | all | 全解除 | 0 | 0 | OK |
| 7 | regular | (非表示) | 652* | **1,490** | 差異あり（下記） |
| 8 | irregular | A1+A2 | 2,382* | **1,544** | 差異あり（下記） |

\* 指示書の期待値。シナリオ 7・8 の差異は **Phase 0-b 以前からの `reg` フィルタ仕様**によるもの。`reg=regular` は `w.grp` あり語（`phonics` 652 + `both` 838 = 1,490）を対象とし、CEFR フィルタはスキップされる。`reg=irregular` は `!w.grp`（1,569 語）に CEFR A1+A2 を掛けて 1,544 語。CEFR フィルタ本体（シナリオ 1–6）はすべて指示書どおり。

---

## 7. 検証 6-2 — Mode B バンド（データ + ロジック）

### バンド別 eligible 語数（`modeBEligible`）

| バンド | 語数 |
|--------|------|
| A1 | 1,113 |
| A2 | 1,195 |
| B1 | 25 |
| B2 | 0 |
| C1 | 0 |

### 期待動作と実装の対応

| シナリオ | 期待 | 実装 |
|---------|------|------|
| 新規 A1 | A1 で開始 | 変更なし（デフォルト） |
| 初期 B1 | B1 25 語、B2 に上がらない | `modeBBandPool("B2").length===0` で break |
| レガシー B2 | B1 に降格 | `while(idx>0 && pool empty) idx--` |
| A1 60% → A2 | 自動解放 | 既存ロジック維持 |
| A2 60% → B1 | 自動解放 | 既存ロジック維持 |
| B1 60% | B1 に留まる | B2 空プールで break |

---

## 8. 検証 6-3 — C1 非表示 + キー残置

- UI: CEFR ピルは A1 / A2 / B1 の 3 つのみ（C1 ボタンなし）
- i18n: `lvl.c1` は 6 言語ファイルすべてに残置（`grep '"c1"' i18n/*.json` → 6 件）

---

## 9. 検証 6-5 — 各 UI 言語での CEFR 表示

`applyI18n()` で以下を配線:

- ラベル: `t("lvl.label")`（en=Level, ja=レベル, ko=레벨, fil=Antas, zh-Hant=級別, zh-Hans=级别）
- ピル: A1 / A2 / B1（CEFR 略称は全言語共通表記）

---

## 10. 検証 6-6 — 回帰確認

コードレビュー上、以下は非変更または影響範囲外:

- Direction decode/encode — 変更なし
- focus / reg / grp ピル — 変更なし（`updateSetupFields` に cefr 行追加のみ）
- Mode B Study/Quiz — `refreshVocabBandUnlock` のみ変更
- Connected / Weak タブ — `filteredPool` は Words Mode A のみで使用
- GA/RP アクセント、語彙ブラウザ — 変更なし

---

## 11. git status（コミット対象）

```
M  docs/DESIGN.md
M  docs/PURPOSE.md
M  docs/SPECIFICATION.md
M  i18n/en.json, fil.json, ja.json, ko.json, zh-Hans.json, zh-Hant.json
M  index.html
M  tools/validate_i18n.py
A  docs/cursor-instructions-cefr-phase0b.md
A  docs/cursor-implementation-report-cefr-phase0b.md
```

（`gas/` 等の無関係変更はコミット対象外）

---

## 12. 既知の残作業・懸念

1. **Phase 1/2**: B2 語彙追加後、HTML に B2 ピルを足すだけで UI 復活可能。`refreshVocabBandUnlock()` はコード変更不要。
2. **`reg=regular` プール数**: 指示書は phonics 652 語を想定しているが、現行 `w.grp` フィルタは `both` src（838 語）も含むため 1,490 語。Phase 0-b のスコープ外（既存 `regField` 仕様）。
3. **`cefrLevels` の localStorage 非保存**: 設計どおりセッション単位リセット。

---

## 13. コミット

```
Wire CEFR multi-select filter into Mode A and guard Mode B empty bands.
```

push 先: `origin/main`（GitHub Pages）
