---
id: pj-2026-07-09-f34d
aliases:
- pj-2026-07-09-f34d
title: GA↔RP「同一発音」判定 — Claude 相談ブリーフ
created: '2026-07-09'
---

# GA↔RP「同一発音」判定 — Claude 相談ブリーフ

> 作成日: 2026-07-09  
> 背景: ユーザーから「GA と RP が同じかどうかの判定方法」と「`ː` など記号差で誤判定していないか」の質問あり。  
> 本ドキュメントは **Claude / Claude API への相談用**（事前フラグ `ga_rp_same` の設計・生成方針）。

---

## 1. 現状の判定方式（結論）

**A でも B でもない。**

| 選択肢 | 内容 | 現状 |
|--------|------|------|
| A | ランタイムで GA↔RP 記号変換し、変換後に比較 | ❌ していない |
| B | データに `ga_rp_same` 等のフラグを持ち、それで判定 | ❌ していない |
| **実際** | 語彙データの `ipa`（GA phonemic）と `rp_ipa`（RP phonemic）を **文字列完全一致** で比較 | ✅ これ |

### 1.1 ランタイム実装（`index.html`）

```javascript
function activeIpa(c) {
  return ACCENT === "rp" ? (c.rp_ipa || c.ipa) : c.ipa;
}
function altIpa(c) {
  return ACCENT === "rp" ? c.ipa : (c.rp_ipa || null);
}
function altAccentValue(c) {
  const alt = altIpa(c);
  const active = activeIpa(c);
  if (alt === active) {
    return { value: formatSameAccentIpa(alt), isSame: true, hasAlt: true };
  }
  return { value: alt, isSame: false, hasAlt: true };
}
```

語彙ブラウザも同様:

```javascript
rpIpa === gaIpa ? formatSameAccentIpa(rpIpa) : rpIpa
```

**比較対象は phonemic のみ**（`ipa` / `rp_ipa`）。  
主表示の narrow（`ipa_actual_ga` / `ipa_actual_rp`）は比較に使わない。

### 1.2 データ生成（オフライン・別工程）

`rp_ipa` はアプリ起動時には生成しない。事前に付与済み。

| 経路 | スクリプト | 備考 |
|------|-----------|------|
| Claude API | `scripts/gen_rp_ipa.py` | 本番 wordlist の主経路。バッチ 80 語、`rp_progress.json` で再開可 |
| ルール変換 | `scripts/ga_to_rp.py` + `gen_rp_ipa_offline.py` | オフライン fallback。`i→iː`, `oʊ→əʊ`, 非 rhotic 等 |
| マージ | `scripts/merge_rp_ipa.py` | `rp_complete.json` → `wordlist_GA_a1a2_plus_phonics.json` |

**重要:** オフライン変換は `rp_ipa` **生成**用。UI の「同一」判定には使われない。

---

## 2. ユーザーの懸念は当たっているか

### 2.1 `ː` / `:` による誤判定

**部分的に yes（ただし理由は A ではない）。**

ランタイム変換はないが、**記号表記の違い**で「実質同じなのに別表示」は起こりうる。

例（wordlist 実データ）:

| 語 | GA `ipa` | RP `rp_ipa` | 現状 UI |
|----|----------|-------------|---------|
| agree | `/əˈɡri/` | `/əˈɡriː/` | **別**（`ː` の有無） |
| be | `/bi/` | `/biː/` | **別** |
| about | `/əˈbaʊt/` | `/əˈbaʊt/` | **同じ** |
| cassette（例） | `/kəˈsɛt/` | `/kəˈsɛt/` | **同じ** |

wordlist 4439 語の集計（2026-07-09 時点）:

- 文字列完全一致（`ipa === rp_ipa`）: **1441 語**
- 不一致: **2998 語**
- 単純正規化（`ː`/`:` 除去 + 一部記号置換）で一致: **約 1805 語** が「記号差のみ」候補

→ **「同じなのに別判定」** は、主に **RP が長音 `ː` を明示し GA が省略** するケースで起きうる。  
→ **「別なのに同じ判定」** は文字列一致なので起きにくい（両フィールドが同じ文字列のときのみ）。

### 2.2 添付スクショ `/li:f/` のケース

主表示は `activeNarrowIpa`（narrow）、補足行は `altAccentValue`（phonemic 比較）。

- 主 IPA: `/li:f/`（narrow 優先）
- 補足 RP: `RP: /li:f/` → phonemic 同士が一致していれば `/li:f/（同じ）` になるはず

narrow と phonemic がズレる語では、見た目上「同じに見えるのに same 表示されない」こともありうる（別問題）。

---

## 3. Claude に相談したいこと

### 3.1 目的

**「学習者にとって実質同じ GA/RP 発音」** を UI で `（同じ）` と示すため、  
ランタイム変換や単純文字列比較ではなく **事前フラグ** を導入したい。

提案フィールド:

```json
{
  "w": "agree",
  "ipa": "/əˈɡri/",
  "rp_ipa": "/əˈɡriː/",
  "ga_rp_same": true,
  "ga_rp_same_reason": "length_marking_only"
}
```

### 3.2 相談したい設計判断

1. **`ga_rp_same` の定義**
   - phonemic レベルで「学習者が区別不要」とみなす基準は？
   - 長音記号の有無（`i` vs `iː`）は same か different か？
   - `ɛ` vs `e`、`oʊ` vs `əʊ` は？
   - 非 rhotic 化（`ɚ→ə`, coda `/r/` 脱落）のみの差は different 固定か？

2. **フラグ生成パイプライン**
   - Claude API バッチで `ga_rp_same` + `reason` を一括付与するか
   - ルールベース前処理 + Claude 監査のハイブリッドか
   - flap / `ipa_actual_*`（narrow）は **判定から除外** する方針でよいか

3. **データ規模とコスト**
   - 対象: wordlist **3,059 語** + connected **201 句** + weak **36**
   - バッチサイズ・プロンプト設計・再開戦略（`gen_rp_ipa.py` と同様の progress JSON）

4. **UI への反映**
   - `altAccentValue(c)` を `ga_rp_same ?? (alt === active)` に変更
   - 語彙ブラウザの `rpIpa === gaIpa` も同フラグ参照
   - same 時の表示は現行どおり `IPA（同じ）` でよいか

### 3.3 Claude API プロンプト案（ドラフト）

```
You are judging whether General American (GA) and Received Pronunciation (RP)
phonemic transcriptions are PRACTICALLY THE SAME for a learner.

Input per item:
- word
- ipa (GA phonemic)
- rp_ipa (RP phonemic)
- optional: ipa_actual_ga, ipa_actual_rp (narrow; ignore for this task unless noted)

Output JSON per word:
{
  "ga_rp_same": true|false,
  "reason": "identical"|"length_marking_only"|"vowel_inventory"|"rhoticity"|"trap_bath"|"other"
}

Rules:
- Ignore allophonic detail (flap, aspiration) — phonemic level only.
- If the only differences are GA omitting length marks that RP shows with ː, mark SAME.
- If TRAP-BATH, LOT-CLOTH, or rhoticity changes the phoneme inventory, mark DIFFERENT.
- Contractions / weak forms: judge citation phonemic forms.
- Alphabet letter names: apply special cases (Z, R).

Return ONLY a JSON object: {"word": {...}, ...}
```

### 3.4 代替案（Claude なし）

| 案 | メリット | デメリット |
|----|----------|------------|
| 記号正規化関数 | 高速・無料 | 境界ケース（trap-bath, 二重母音+r）で誤判定 |
| `ga_to_rp(ga)` と `rp_ipa` 比較 | 既存ルール活用 | 本番 `rp_ipa` は Claude 生成のため不一致の意味が曖昧 |
| **Claude フラグ（推奨）** | 学習者視点の「実質同一」を定義可能 | API コスト・監査必要 |

---

## 4. 実装タッチポイント（フラグ導入時）

| ファイル | 変更 |
|----------|------|
| `wordlist_GA_a1a2_plus_phonics.json` | `ga_rp_same` 追加 |
| `data/connected_speech.json` | 同上 |
| `data/weak_forms.json`（該当あれば） | 同上 |
| `scripts/gen_ga_rp_same.py`（新規） | Claude API or ルールでフラグ生成 |
| `index.html` | `altAccentValue`, 語彙ブラウザ RP 行 |
| `docs/SPECIFICATION.md` | 判定仕様更新 |

---

## 5. テスト観点

| ケース | 期待 |
|--------|------|
| `about` `/əˈbaʊt/` = `/əˈbaʊt/` | same |
| `agree` `/əˈɡri/` vs `/əˈɡriː/` | same（フラグ導入後） or different（現状） |
| `car` `/kɑr/` vs `/kɑː/` | different |
| `path` `/pæθ/` vs `/pɑːθ/` | different（trap-bath） |
| `Z` `/zi/` vs `/zɛd/` | different |
| narrow に flap あり・phonemic 同一 | phonemic 比較で same |

---

## 6. Claude への質問文（コピペ用）

> IPA Sound Drill アプリで、GA phonemic (`ipa`) と RP phonemic (`rp_ipa`) が  
> **学習者にとって実質同じか** を事前フラグ `ga_rp_same` で管理したい。  
> 現状は文字列完全一致のみで、例えば `/əˈɡri/` vs `/əˈɡriː/` が別扱いになる。  
>  
> 1. `ga_rp_same` の定義と reason  taxonomy を提案してください。  
> 2. 3,059 語を Claude API でバッチ処理するプロンプトと進捗保存設計をください。  
> 3. flap 等の narrow（`ipa_actual_*`）は除外してよいか確認してください。  
> 4. ルールのみで足りる境界と、人間/LLM 判断が必要な境界を分けてください。

---

## 7. 関連ファイル

- `index.html` — `altAccentValue()`, `formatSameAccentIpa()`
- `scripts/gen_rp_ipa.py` — RP IPA 生成（Claude API）
- `scripts/ga_to_rp.py` — ルールベース GA→RP
- `docs/cursor/briefs/cursor-alt-accent-display-brief.md` — 反対アクセント表示の先行ブリーフ
