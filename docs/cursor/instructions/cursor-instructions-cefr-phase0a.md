---
id: pj-2026-07-07-8538
aliases:
- pj-2026-07-07-8538
title: 'Cursor 指示書 — CEFR Phase 0-a: フォニックス語の CEFR ラベル是正'
created: '2026-07-07'
---

# Cursor 指示書 — CEFR Phase 0-a: フォニックス語の CEFR ラベル是正

> 作成日: 2026-07-07
> 対象リポジトリ: `nkhippo/IPASoundDrill`（`main` ブランチ）
> ゴール: 誤って B1/B2 とラベル付けされているフォニックス練習語 652 語の `cefr` を `null` 化し、CEFR 軸とフォニックス軸を直交する 2 つの独立カテゴリとして扱えるようデータを是正する。
> **重要な非スコープ:** `index.html` は絶対に触りません。UI 配線（`filteredPool()` 拡張・`lvl.*` ドロップダウン追加）は Phase 0-b として別指示書で発注します（今並行で進行中の zh 分離作業との競合回避のため）。

---

## 0. 背景と方針

### 0-1. 実データが示す事実（着手前の必読）

`wordlist_GA_a1a2_plus_phonics.json`（3,059語）の CEFR × src 分布を分析した結果:

| CEFR | 語数 | 内訳 |
|---|---|---|
| A1 | 1,187 | `src: both`(520) + `cefr`(504) + 不規則動詞・字母・短縮形など |
| A2 | 1,195 | `src: cefr`(847) + `both`(318) + `casual`(15) + `phoneme_fill`(15) |
| B1 | 347 | **`src: phonics`(322) + `phoneme_fill`(25)** |
| B2 | 330 | **`src: phonics`(330) のみ ← 100% フォニックス語** |

つまり `src: phonics` の 652 語（B1 の 322 + B2 の 330）は、CEFR-J に含まれない基本フォニックス語（ache, ad, aid, aim, ant, arch, ash, badge, ban, barn, ...）に暫定的に B1/B2 ラベルが振られたもので、**実際の中級語彙ではありません**。真の CEFR B1 相当は 25 語（`phoneme_fill`）、真の B2 は **0 語** が実態です。

### 0-2. 方針: 案 B（`cefr` を null 化）確定

引き継ぎドキュメント `HANDOFF-cefr-level-expansion.md` §4 の推奨案 B に従い、以下の方針で是正します:

- 対象 652 語の `cefr` を `null` に変更
- `src: "phonics"` フィールドはそのまま維持
- フォニックス学習は「CEFR 軸とは独立した出題セット」として今後の UI 配線で扱う（`set.phonics_t` の既存 i18n を活用）
- 是正後の B1 は 25 語のみ、B2 は 0 語となる。Phase 0-b（UI 配線）で B2 選択肢は「準備中」または非表示にする（今回のスコープ外）

### 0-3. A1/A2 データの十分性（早期リリース可能性の裏付け）

Phase 0 だけで意味のあるリリースが可能かの検証結果:

- **A1+A2 合計 2,382 語**（B1/B2 是正後もそのまま残る）
- **41 IPA 音素すべてを含む**（最少出現は /ʒ/ の 12 語、次いで /ɔɪ/ 28 語）
- **品詞分布多様**: 名詞 1,182, 形容詞 303, 動詞 226, 副詞 118, 名詞/動詞 97, ...

したがって「B1/B2 データが是正で消失しても、A1/A2 のみで音素カバー・品詞バリエーションともに十分」と判断できます。

---

## 1. スコープと非スコープ

### スコープ

1. データ是正スクリプト `scripts/apply_phonics_cefr_null.py` の新規作成
2. スクリプト実行による `data/wordlist_GA_a1a2_plus_phonics.json` の更新（652 語の `cefr` を `null` に）
3. 変更前後の統計レポート `docs/wordlist-cefr-audit.md` の新規作成
4. `docs/PURPOSE.md` の依存表と実装状況表の更新（B1/B2 実データ状況の反映）
5. `docs/DESIGN.md` の関連セクション更新（wordlist スキーマ記述、CEFR 使用方針）

### 非スコープ（絶対に触らないこと）

- `index.html`（Phase 0-b で UI 配線するため、今は競合回避）
- `i18n/*.json`（同上、UI 配線時に `lvl.*` / `set.*` の再点検を行う）
- Mode B の `MODEB_BANDS` 実装（データ是正の影響確認は Phase 0-b の一部）
- 連結句・弱形データ（今回スコープ完全外）
- `data/guide.json`
- 他のフォニックス関連スクリプト

---

## 2. 作業手順

### 2-1. 是正スクリプト作成

`scripts/apply_phonics_cefr_null.py` を新規作成してください。以下は参考実装で、そのまま使用可能です（動作確認済み。Cursor 側で必要に応じて改善可）:

```python
#!/usr/bin/env python3
"""
Phase 0-a: Null out the cefr field on all phonics-source words that are
currently labeled B1 or B2. These 652 entries were assigned B1/B2 during
initial data generation because they were not present in the CEFR-J A1/A2
lists, but they are basic phonics-practice words (ache, ad, aid, aim, ant,
...) rather than genuine intermediate vocabulary. Nulling their cefr moves
them out of the CEFR axis entirely; they remain accessible via the
independent phonics axis (src: "phonics") for Mode A phonics drills.

See docs/wordlist-cefr-audit.md for before/after statistics.
See HANDOFF-cefr-level-expansion.md §4 for the rationale (option B).
"""
import json
import pathlib
import sys
from collections import Counter

INPUT = pathlib.Path("data/wordlist_GA_a1a2_plus_phonics.json")
BACKUP = pathlib.Path("data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json")


def main():
    data = json.loads(INPUT.read_text(encoding="utf-8"))

    # Snapshot before state for the audit
    before = Counter(w.get("cefr") for w in data)
    before_phonics = Counter(
        (w.get("cefr"), w.get("src")) for w in data
        if w.get("src") == "phonics"
    )

    # Apply the null-out. Do NOT touch anything else on the entry.
    changed = 0
    for w in data:
        if w.get("src") == "phonics" and w.get("cefr") in ("B1", "B2"):
            w["cefr"] = None
            changed += 1

    after = Counter(w.get("cefr") for w in data)

    # Safety check: this run must change exactly 652 entries. If the count
    # differs, the source data has drifted since the audit and manual review
    # is required before proceeding.
    EXPECTED = 652
    if changed != EXPECTED:
        print(
            f"ERROR: expected to change {EXPECTED} entries, actually changed "
            f"{changed}. Source data may have drifted. Aborting without write.",
            file=sys.stderr,
        )
        sys.exit(1)

    # Backup and write. The backup is a one-time safety net; do not commit it
    # long-term (it will be added to .gitignore below).
    BACKUP.write_text(
        json.dumps(json.loads(INPUT.read_text(encoding="utf-8")),
                   ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )
    INPUT.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8",
    )

    print(f"Changed: {changed} entries (expected {EXPECTED}) — OK")
    print()
    print("=== CEFR distribution ===")
    print(f"{'cefr':10s} {'before':>8s} {'after':>8s}")
    all_cefr = sorted(
        set(before) | set(after),
        key=lambda x: (x is None, x or ""),
    )
    for c in all_cefr:
        print(f"{str(c):10s} {before.get(c, 0):>8d} {after.get(c, 0):>8d}")
    print()
    print("Backup written to:", BACKUP)
    print("Updated file:", INPUT)


if __name__ == "__main__":
    main()
```

### 2-2. スクリプト実行

リポジトリルートから:

```bash
python3 scripts/apply_phonics_cefr_null.py
```

期待される出力:

```
Changed: 652 entries (expected 652) — OK

=== CEFR distribution ===
cefr           before    after
A1               1187     1187
A2               1195     1195
B1                347       25
B2                330        0
None                0      652

Backup written to: data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json
Updated file: data/wordlist_GA_a1a2_plus_phonics.json
```

もし changed 数が 652 と一致しない場合、スクリプトは書き込みを行わず終了します。その場合は Naoya に即座に報告してください（本指示書作成時点の統計と実データが乖離している可能性があります）。

### 2-3. バックアップファイルの取扱

`data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json` は安全網としてローカルに残しますが、コミットには含めません。以下を `.gitignore` に追加してください:

```
data/*.pre-phase0a.json
```

### 2-4. 監査レポート作成

`docs/wordlist-cefr-audit.md` を以下のテンプレートで新規作成してください:

````markdown
# Wordlist CEFR ラベル監査レポート — Phase 0-a 是正記録

> 作成日: <YYYY-MM-DD>
> 対象: `data/wordlist_GA_a1a2_plus_phonics.json`
> 実施フェーズ: CEFR 拡張 Phase 0-a（データ是正）

## 1. 是正前の状況（実測）

### CEFR × src 分布

| CEFR | both | casual | cefr | contraction | irreg_plural | irreg_verb | letter | phoneme_fill | phonics | 計 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| A1 | 520 | 0 | 504 | 48 | 14 | 75 | 26 | 0 | 0 | 1,187 |
| A2 | 318 | 15 | 847 | 0 | 0 | 0 | 0 | 15 | 0 | 1,195 |
| B1 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 25 | **322** | 347 |
| B2 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | 0 | **330** | 330 |

### 発見された問題

- B1 の 93%（322 / 347）が `src: phonics` = 実際は基本フォニックス練習語
- B2 の 100%（330 / 330）が `src: phonics` = 真の CEFR B2 語彙は 0 語
- 真の中級語彙は B1 の 25 語（`phoneme_fill`）のみ

## 2. 是正内容

`HANDOFF-cefr-level-expansion.md` §4 推奨の案 B に基づき、以下の 652 語について `cefr` を `null` に変更:

- B1 かつ `src: phonics` の 322 語
- B2 かつ `src: phonics` の 330 語

他のフィールド（`src`, `group`, `pattern`, `ipa`, `gloss`, ...）は一切変更していません。

## 3. 是正後の分布

| CEFR | 語数 | 内訳 |
|---|---:|---|
| A1 | 1,187 | 変更なし |
| A2 | 1,195 | 変更なし |
| B1 | 25 | `phoneme_fill` のみ（真の中級語彙候補） |
| B2 | 0 | Phase 2 で新規拡充予定 |
| `null` | 652 | 全て `src: phonics`（フォニックス軸で利用） |

## 4. Mode A / Mode B への影響（Phase 0-b で検証）

- Mode A: 現状 `cefr` を参照していないため、この時点で表示動作に変化なし
- Mode B: `MODEB_BANDS = ["A1","A2","B1","B2"]` により CEFR フィルタが有効
  - B1 プール: 347 → 25 語に縮小
  - B2 プール: 330 → 0 語に縮小（バンド事実上消失）
  - Phase 0-b で `filteredPool()` 拡張と同時に、Mode B の空バンド扱い（B2 選択不可・「準備中」表示等）を検討

## 5. A1/A2 の十分性検証

Phase 0-b リリース時点で「A1 のみ / A1+A2」の選択肢を提供することが妥当かの検証:

### 語数
2,382 語（A1: 1,187 + A2: 1,195）

### 41 IPA 音素カバレッジ
すべての音素が含まれる。最少出現音素の内訳:

| 音素 | 語数 |
|---|---:|
| ʒ | 12 |
| ɔɪ | 28 |
| ð | 49 |
| θ | 53 |
| ʊ | 55 |
| aʊ | 58 |
| j | 80 |
| ɝ | 82 |
| tʃ | 89 |
| dʒ | 92 |

最少音素の /ʒ/ が 12 語あれば SRS ローテーションで問題なく回せる水準です。

### 品詞分布（上位 10）
名詞 1,182 / 形容詞 303 / 動詞 226 / 副詞 118 / 名詞·動詞 97 / 動詞（不規則） 75 / 短縮形 48 / 代名詞 35 / 形容詞·名詞 31 / 形容詞·副詞 30

### 結論
A1+A2 のみで音素カバー・語数・品詞多様性ともに Mode A の練習素材として十分。B1/B2 消失の影響は Mode B のみに限定される。

## 6. 実行ログ

```
<`python3 scripts/apply_phonics_cefr_null.py` の出力をここに貼り付け>
```
````

### 2-5. `docs/PURPOSE.md` の更新

以下の変更を加えてください:

#### 変更 A: セクション 4（依存と実装状況）の表に行を追加

CEFR 関連の現況を明示。表の適切な位置に以下を追加:

```markdown
| B1/B2 語彙の実データ | **不足**（Phase 0-a 是正済み。B1=25語 phoneme_fill、B2=0語。Phase 1/2 で拡充） |
| Mode A の CEFR フィルタ | **未実装**（Phase 0-b で追加予定。データ側は Phase 0-a で是正済み） |
```

既存の「本物の B/C 語彙拡張」の行があれば、その表現と重複しないよう調整してください。

#### 変更 B: 変更履歴セクションに 1 行追加

```markdown
| 2026-07-XX | v3.3 | Phase 0-a: 誤ラベル phonics 語 652 件の cefr を null 化。B1/B2 実データ状況を依存表に明記。 |
```

日付とバージョン番号は実際のコミット日と現行版番号+1 で。

### 2-6. `docs/DESIGN.md` の更新

もし DESIGN.md に wordlist スキーマの `cefr` フィールドに関する記述があれば、以下を追記してください（該当箇所を検索してから）:

```markdown
### `cefr` フィールドの現状（Phase 0-a 以降）

- 値: `"A1"` / `"A2"` / `"B1"` / `null`（`"B2"` は Phase 2 まで空）
- `null` は 2 種類の状態を包含する:
  - `src: "phonics"` の語（Phase 0-a で null 化した 652 語）: CEFR 軸ではなくフォニックス軸で分類
  - Phase 1/2 で追加予定の未タグ語彙（暫定）
- Mode A の出題プール絞り込みは Phase 0-b で `filteredPool()` に配線予定
- Mode B は既に CEFR フィールドを参照しており（`MODEB_BANDS`）、Phase 0-a により B1 プールは 25 語に縮小、B2 プールは 0 語に消失
```

該当箇所が見当たらない場合は、この追記を省略して監査レポートにその旨を記載してください。

---

## 3. 検証手順

### 3-1. スクリプト実行前検証

```bash
# 対象語数の事前確認
python3 -c "
import json
d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
n = sum(1 for w in d if w.get('src')=='phonics' and w.get('cefr') in ('B1','B2'))
print('phonics B1/B2 対象数:', n)
assert n == 652, f'ERROR: expected 652, got {n}'
print('OK')
"
```

`OK` が出ることを確認してから 2-2 のスクリプト実行に進む。

### 3-2. スクリプト実行後検証

```bash
# 是正後の分布確認
python3 -c "
import json
from collections import Counter
d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
c = Counter(w.get('cefr') for w in d)
print('CEFR 分布:', dict(c))
assert c.get('A1') == 1187
assert c.get('A2') == 1195
assert c.get('B1') == 25
assert c.get('B2', 0) == 0
assert c.get(None) == 652
print('全アサーション PASS')
"
```

「全アサーション PASS」が出ることを確認。

### 3-3. サンプル抽出による是正確認

is-a-diff で 3〜5 語をランダム抽出し、`cefr` 以外のフィールド（特に `src`, `group`, `pattern`, `ipa`, `gloss`）が意図せず変更されていないことを目視確認:

```bash
python3 -c "
import json, random
random.seed(42)
d = json.load(open('data/wordlist_GA_a1a2_plus_phonics.json'))
n = [w for w in d if w.get('src')=='phonics' and w.get('cefr') is None]
for w in random.sample(n, 5):
    print(w['w'], '->', {k:v for k,v in w.items() if k in ('cefr','src','group','pattern','ipa')})
"
```

出力例（実際の値は wordlist に依存）:

```
ache -> {'ipa': '/eɪk/', 'cefr': None, 'src': 'phonics', 'pattern': ..., 'group': 'long'}
...
```

`cefr` が None、`src` が phonics、他のフィールドが正常な値を保持していれば OK。

### 3-4. index.html への影響確認（動作テスト）

**index.html を触っていないので、以下の状態が期待動作です:**

1. ローカルで静的サーバー起動、既存の Mode A/B の動作を確認
2. Mode A: `cefr` を参照していないので、表示・出題プールに変化なし → OK
3. Mode B: `MODEB_BANDS = ["A1","A2","B1","B2"]` により CEFR を参照している
   - A1 バンド: 1,187 語（変化なし）
   - A2 バンド: 1,195 語（変化なし）
   - B1 バンド: **25 語**（是正前 347 から縮小）
   - B2 バンド: **0 語**（是正前 330 から消失）
4. Mode B で B2 バンドまで進んだ既存ユーザーがいると空プールに遭遇する可能性がある。挙動を実機確認し、報告に含めること

---

## 4. 実装レポートの記載事項

作業完了後、以下を含む実装レポートを Naoya に提出してください:

1. `git status` 出力（追加ファイル、変更ファイルの一覧）
2. `python3 scripts/apply_phonics_cefr_null.py` の完全な実行出力
3. 検証 3-1、3-2、3-3 の実行結果
4. 検証 3-4 の実機動作確認結果（特に Mode B の空 B2 バンドがどう振る舞ったか）
5. `docs/wordlist-cefr-audit.md` へのリンク（レポート本文）
6. 既知の残作業・懸念事項があれば箇条書き（例: Mode B の空バンド UX が破綻していた場合の対応要否）

---

## 5. トラブルシューティング

### `expected to change 652 entries, actually changed N` エラー

- ソースデータが本指示書作成時点から変わっている可能性
- 変更を書き込まずに終了しているので安全
- Naoya に報告 → 最新分布を再監査してから指示書を更新

### バックアップから復元したい

```bash
cp data/wordlist_GA_a1a2_plus_phonics.pre-phase0a.json data/wordlist_GA_a1a2_plus_phonics.json
```

コミット前であればこれで復旧可能。

### Mode B で B2 バンドが空になり動作が壊れた

- 実装レポートに詳細を記載
- Phase 0-b の指示書で対応（B2 バンドを「準備中」表記にする等）
- Phase 0-a では index.html を触らない方針を維持し、ここでは対応しない

---

## 6. Git コミット推奨単位

```
Commit 1: Add Phase 0-a data correction script
  - scripts/apply_phonics_cefr_null.py (new)
  - .gitignore (add data/*.pre-phase0a.json)

Commit 2: Apply Phase 0-a: null cefr on 652 phonics words (B1: 322, B2: 330)
  - data/wordlist_GA_a1a2_plus_phonics.json (652 entries: cefr B1/B2 -> null)

Commit 3: Document Phase 0-a audit and update dependency status
  - docs/wordlist-cefr-audit.md (new)
  - docs/PURPOSE.md (dependency table + changelog)
  - docs/DESIGN.md (cefr field notes, if applicable)
```

---

## 7. Phase 0-b への引き継ぎ事項（作業不要、記録のみ）

Phase 0-b は Phase A-2（zh 分離）実装完了・Naoya テスト完了後に発注します。以下を Phase 0-b の指示書で扱う予定です:

- `filteredPool()` に CEFR フィルタ追加（既存の `S.reg` / `S.grp` と同じパターン）
- `lvl.*` UI 配線（設定チップ or ドロップダウン）
- デフォルト A1 設定
- Mode B の空 B2 バンド対応（Phase 0-a 実装レポートの発見次第）
- `set.phonics_t` の再検討（フォニックス軸を CEFR 軸と独立に UI 表示）

---

以上で Phase 0-a 完了です。Phase A-2（zh 分離）と完全に並行実施可能で、`index.html` を触らないため競合の心配はありません。
