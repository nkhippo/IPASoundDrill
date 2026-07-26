# Cursor 実装レポート — STEP4-b: 音素近傍（neighbors）

> 作成日: 2026-06-23  
> 対象ブランチ: `main`（`854dcc2`）  
> 指示書: `cursor-step4b-neighbors.md`  
> 前提正本: `docs/PURPOSE.md` v2 / `docs/DESIGN.md` §2.2

Claude 側への作業報告用サマリー。

---

## 1. 目的と背景

Mode B（音から語彙）の MCQ distractor を、**音素的に紛らわしい語**で構成するため、各語に音素近傍トップ K を事前計算した `neighbors` フィールドを本番 wordlist に反映した。

| 設計項目 | 値 |
|----------|-----|
| K（近傍上限） | 8 |
| 距離尺度 | IPA トークン列の編集距離（強勢記号無視） |
| 最大距離 | 2 |
| homophone（距離0） | 除外 |
| ソート | sub（ミニマルペア）→ ins/del → mix、距離、同 CEFR バンド優先 |

**採用形式:** `wordlist_with_neighbors_slim.json`（語のみ配列）。先頭から抽選すれば品質順が担保される。

```json
"neighbors": ["free", "through", "throw", "tree", "B", "C", "D", "G"]
```

---

## 2. 実施内容

### 2-1. データマージ

| 項目 | 内容 |
|------|------|
| 入力 | `data/wordlist_with_neighbors_slim.json`（2,914語） |
| 出力 | `wordlist_GA_a1a2_plus_phonics.json` |
| スクリプト | `scripts/merge_neighbors.py` |
| 方針 | `w` をキーに突き合わせ、**neighbors のみ上書き**。他フィールド（w/ipa/cefr/pos/src/pattern/group/gloss）は本番を正とする |
| 参照整合性 | neighbors 内の語が wordlist に実在しない参照を除去（マージ後 **0件**） |
| 確実是正20語 | マージ後に `apply_clear()` 再適用 → **無傷** |

**語数:** 2,914（変更なし）

### 2-2. アプリ対応（最小）

Mode B UI は未実装（指示書どおり本タスク範囲外）。将来実装に備え `index.html` の `normalizeWord()` で `row.neighbors` をランタイムオブジェクトに保持するよう1行追加。

**Mode B 実装時の参照（DESIGN.md §2.2）:**

```
正解語の neighbors から 2語抽選
  ＋ 同バンド(CEFR)のランダム 1語
  = distractor 3語
→ 正解 gloss[UI言語] と合わせて4択、順序シャッフル
```

`neighbors.length < 必要数` のときは同バンドランダムで補填。

### 2-3. リポジトリに追加したファイル

| ファイル | 用途 |
|----------|------|
| `data/wordlist_with_neighbors_slim.json` | マージ元（slim 形式・確定版） |
| `scripts/merge_neighbors.py` | 本番 wordlist への neighbors マージ＋検証 |
| `scripts/gen_neighbors.py` | 語彙変更後の neighbors 再生成（K=8, MAX_DIST=2） |
| `docs/neighbors_report.md` | 生成品質レポート |

---

## 3. 品質統計（`neighbors_report.md` より）

| 指標 | 値 |
|------|-----|
| 総語数 | 2,914 |
| 近傍0語 | **426**（14%）— 多音節語中心。実行時ランダム補填パス |
| 近傍3語未満 | 735（25%） |
| 近傍K語フル（8語） | 1,946（66%） |
| 平均近傍数 | 5.9 |
| ミニマルペア(sub)を1つ以上持つ語 | 1,737（59%） |

**品質サンプル:**

| 語 | IPA | neighbors（先頭） |
|----|-----|-------------------|
| three | /θri/ | free, through, throw, tree |
| those | /ðoʊz/ | nose, rose, these, doze |
| ship | /ʃɪp/ | sheep, shop, chip, dip |
| bad | /bæd/ | back, bag, bat, bath |
| pull | /pʊl/ | pal, pile, pill, wool |

### 近傍0語について（想定通り）

多音節語（3音節60%、4音節87%、5音節100%）は距離2以内の実在語がほぼなく、設計上正しい。Mode B のミニマルペア知覚テストは短い語で成立する。

---

## 4. 検証結果（DoD）

| 項目 | 結果 |
|------|------|
| 全語に `neighbors` キー | ✅ 2,914/2,914 |
| 参照整合性（broken ref） | ✅ 0 |
| 既存フィールド無傷 | ✅ |
| 語数不変 | ✅ 2,914 |
| 確実是正20語 | ✅ 違反 0 |
| `validate_i18n.py` | ✅ ERROR 0 |

```bash
python3 scripts/merge_neighbors.py
python3 tools/validate_i18n.py
```

---

## 5. 意図的に未実施

| 項目 | 理由 |
|------|------|
| Mode B MCQ UI・distractor 抽選ロジック | 別タスク（gloss/B/C 語彙整備後） |
| `wordlist_with_neighbors.json`（詳細版）本番採用 | slim で十分（type 重み付け抽選なし） |
| RP 用 neighbors | STEP5 で RP wordlist 確定後に再生成 |
| CSV 同期 | STEP4-a 以降も JSON のみ運用 |

---

## 6. 再生成手順（語彙追加・変更時）

```bash
# リポジトリ直下で
python3 scripts/gen_neighbors.py
# → data/wordlist_with_neighbors.json, docs/neighbors_report.md
python3 scripts/merge_neighbors.py   # slim 源を更新した場合は slim も再出力が必要
```

語彙を増やしたら **必ず neighbors を再生成**すること（新語が既存語の近傍になり得るため）。

---

## 7. コミット・マージ

| コミット | 内容 |
|----------|------|
| `854dcc2` | STEP4-b: neighbors マージ、再生成ツール、実装レポート |

ブランチ: `step4b-neighbors` → `main` へマージ・`origin/main` へプッシュ済み。

---

## 8. 関連ドキュメント

| ファイル | 内容 |
|----------|------|
| `docs/DESIGN.md` §2.2 | distractor 生成設計 |
| `docs/cursor-implementation-report-step4a.md` | STEP4-a（基礎語マージ） |
| `docs/neighbors_report.md` | neighbors 品質レポート |

---

*本レポートは Cursor エージェントによる STEP4-b 実装結果を Claude 側へ引き継ぐためのものです。*
