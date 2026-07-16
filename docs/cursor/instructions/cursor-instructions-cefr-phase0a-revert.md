---
id: pj-2026-07-07-d40f
aliases:
- pj-2026-07-07-d40f
title: 'Cursor 指示書 — Phase 0-a 訂正: phonics 652語の cefr 復元'
created: '2026-07-07'
---
# Cursor 指示書 — Phase 0-a 訂正: phonics 652語の cefr 復元

> 作成日: 2026-07-07
> 対象リポジトリ: `nkhippo/IPASoundDrill`（`main` ブランチ、Phase 0-a 実装は push 済み）
> 種別: **訂正コミット**（前回の Phase 0-a 実装は誤った前提に基づいていたため復元する）
> ゴール: `src: phonics` かつ `cefr` が B1/B2 だった 652 語の `cefr` を元の値に復元し、関連ドキュメントの誤った記述を訂正する。

---

## 0. 何が起きたか（必ず読むこと）

### 0-1. Phase 0-a の前提

引き継ぎ資料 `HANDOFF-cefr-level-expansion.md` は、`src: phonics` の 652 語（`ache`, `ad`, `aid`, `aim`, `ant`, `arch`, `ash`, `badge`, `ban`, `barn`, ...）について「CEFR-J の A1/A2 リストに含まれていなかったため、データ生成時に暫定的に B1/B2 のラベルが割り振られたと推測される」と記載していました。この**未検証の推測**に基づき、Phase 0-a では 652 語の `cefr` を `null` に変更しました。

### 0-2. 検証結果（一次データによる裏付け）

Claude が CEFR-J Wordlist v1.5（`openlanguageprofiles/olp-en-cefrj`、Tono 2019 準拠、査読論文でも引用される権威あるデータセット）を直接取得し、652 語全てを照合した結果:

| 検証項目 | 結果 |
|---|---|
| 652 語のうち CEFR-J に実在する語 | **652 / 652（100%）** |
| app 内のラベル（B1 or B2）と CEFR-J の実レベルが一致 | **652 / 652（100%）** |
| 参考: app 全体 3,059 語の CEFR ラベル正確性 | 2,856 / 2,879（99.2%）が CEFR-J と一致 |

**結論: 652 語は「根拠のない暫定ラベル」ではなく、CEFR-J の一次データに基づいた正当な B1/B2 語彙でした。** Phase 0-a の null 化は誤った前提に基づく変更であり、652 語分の完成済みデータ（IPA・5言語 gloss・英語定義・respelling・narrow IPA）を意味なく無効化していました。

### 0-3. 責任の所在

この誤りは、HANDOFF 資料の推測を Claude が一次データで検証せずに設計に採用したことが原因です。Naoya の判断や Cursor の実装に問題はありません。

---

## 1. スコープと非スコープ

### スコープ

1. `wordlist_GA_a1a2_plus_phonics.json` の 652 語の `cefr` を元の値（B1: 322語 / B2: 330語）に復元
2. `docs/wordlist-cefr-audit.md` に訂正セクションを追記（**既存内容は削除せず**、履歴として残す）
3. `docs/PURPOSE.md` の依存表・変更履歴を訂正
4. `docs/SPECIFICATION.md` の該当記述を訂正
5. 新規ドキュメント `docs/cursor-instructions-cefr-phase0a-revert.md` として本指示書を保存

### 非スコープ

- `index.html`（Phase 0-a 同様、今回も一切触らない）
- `scripts/apply_phonics_cefr_null.py` の削除（**削除しない**。誤った判断とその訂正の記録として残す。ただし本番データへの再実行は今後禁止する旨をコメントに追記）
- Phase 0-b（CEFR UI 配線）指示書の変更（別途、私から更新版を出します）

---

## 2. 復元手順

### 2-1. 復元用ファイルの入手

本指示書に添付の `wordlist_GA_a1a2_plus_phonics.RESTORED.json` を使用してください。このファイルは Phase 0-a 適用前のオリジナルデータそのもので、以下を満たすことを確認済みです:

- 総語数: 3,059（変化なし）
- CEFR 分布: A1=1,187 / A2=1,195 / B1=347 / B2=330（Phase 0-a 適用前の状態）
- `cefr` フィールド以外は Phase 0-a 実装レポートの記載通り「変更なし」

### 2-2. 差分確認（上書き前に必ず実施）

```bash
# 現在のリポジトリの状態と、復元用ファイルの差分を確認
python3 -c "
import json
current = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
restored = json.load(open('wordlist_GA_a1a2_plus_phonics.RESTORED.json'))

cur_map = {w['w']: w for w in current}
res_map = {w['w']: w for w in restored}

assert set(cur_map.keys()) == set(res_map.keys()), 'ERROR: 語彙集合が一致しません。単純上書きは危険です。'

diff_words = []
for w, cur_entry in cur_map.items():
    res_entry = res_map[w]
    # cefr 以外のフィールドで差分がないか確認
    cur_no_cefr = {k:v for k,v in cur_entry.items() if k != 'cefr'}
    res_no_cefr = {k:v for k,v in res_entry.items() if k != 'cefr'}
    if cur_no_cefr != res_no_cefr:
        diff_words.append(w)

print(f'cefr 以外に差分がある語: {len(diff_words)}')
if diff_words:
    print('警告: 以下の語は cefr 以外にも差分があります。単純上書きせず個別確認してください:')
    print(diff_words[:20])
else:
    print('OK: cefr フィールドのみの差分です。安全に上書きできます。')

cefr_diff = sum(1 for w in cur_map if cur_map[w].get('cefr') != res_map[w].get('cefr'))
print(f'cefr が異なる語数: {cefr_diff}（期待値: 652）')
"
```

`cefr 以外に差分がある語: 0` かつ `cefr が異なる語数: 652` が出力されることを確認してから次に進んでください。もし差分が 0 でない場合は上書きを中断し、Naoya に報告してください（Phase 0-a 以降に別の変更が加わっている可能性があります）。

### 2-3. ファイルの置き換え

差分確認で問題がなければ:

```bash
cp wordlist_GA_a1a2_plus_phonics.RESTORED.json wordlist_GA_a1a2_plus_phonics.json
```

### 2-4. 復元後の検証

```bash
python3 -c "
import json
from collections import Counter
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
c = Counter(w.get('cefr') for w in d)
print('復元後のCEFR分布:', dict(c))
assert c.get('A1') == 1187
assert c.get('A2') == 1195
assert c.get('B1') == 347
assert c.get('B2') == 330
assert c.get(None, 0) == 0
print('全アサーション PASS')
"
```

### 2-5. `scripts/apply_phonics_cefr_null.py` への注記追加

このスクリプトは削除しませんが、ファイル冒頭に以下の警告コメントを追記してください:

```python
#!/usr/bin/env python3
"""
⚠️ HISTORICAL / DO NOT RUN AGAINST PRODUCTION DATA ⚠️

This script was used in Phase 0-a (2026-07-07) to null the cefr field on
652 phonics-source words, based on an UNVERIFIED assumption that these
were placeholder labels rather than genuine CEFR-J vocabulary.

Direct verification against the CEFR-J Wordlist v1.5 primary source
(openlanguageprofiles/olp-en-cefrj) showed all 652 words are 100%
genuine, correctly-labeled CEFR-J B1/B2 vocabulary. The change was
reverted; see docs/wordlist-cefr-audit.md "訂正" section and
docs/cursor-instructions-cefr-phase0a-revert.md for details.

This script is kept for historical record only. Do not run it again.

<original docstring follows>
"""
```

---

## 3. ドキュメント訂正

### 3-1. `docs/wordlist-cefr-audit.md` に訂正セクションを追記

**既存の内容は一切削除せず**、ファイル末尾に以下のセクションを追記してください:

```markdown
---

## 訂正（2026-07-XX）

### 訂正の経緯

上記の監査（セクション1〜6）は、`src: phonics` の 652 語について「B1/B2 は暫定的な誤ラベルであり、真の CEFR 語彙ではない」という仮説に基づいていました。この仮説は HANDOFF 資料の推測であり、一次データで検証されていませんでした。

### 検証結果

CEFR-J Wordlist v1.5（`openlanguageprofiles/olp-en-cefrj`）を直接取得し、652 語全てを照合した結果:

- 652 語のうち CEFR-J に実在する語: **652 / 652（100%）**
- app 内のラベルと CEFR-J の実レベルが一致: **652 / 652（100%）**
- 参考: app 全体 3,059 語の CEFR ラベル正確性: 2,856 / 2,879（99.2%）が CEFR-J と一致

652 語は正当な CEFR-J B1/B2 語彙であり、上記の「是正」は誤りでした。

### 対応

`wordlist_GA_a1a2_plus_phonics.json` の 652 語の `cefr` を元の値（B1: 322語 / B2: 330語）に復元しました。詳細は `docs/cursor-instructions-cefr-phase0a-revert.md` を参照してください。

### 訂正後の正しい分布

| CEFR | 語数 | 内訳 |
|---|---:|---|
| A1 | 1,187 | 変更なし |
| A2 | 1,195 | 変更なし |
| B1 | 347 | 322語（CEFR-J 由来の正当な B1 語彙）+ 25語（phoneme_fill） |
| B2 | 330 | 全て CEFR-J 由来の正当な B2 語彙 |

### 今後の CEFR 拡充（Phase 1/2）への含意

CEFR-J Wordlist 全体（単一語のみ、app 既存語と重複除外後）との比較:

| レベル | CEFR-J 総語数（単一語） | app 既存カバー数 | 新規拡充が必要な語数 |
|---|---:|---:|---:|
| B1 | 2,332 | 347 | **1,769** |
| B2 | 2,727 | 330 | **2,186**（B1と重複72語除く） |

652 語分の完成済みデータ資産（IPA・5言語 gloss・英語定義・respelling）がそのまま活用できるため、Phase 1/2 は「ゼロから作る」のではなく「既存分 + 新規拡充分」で CEFR-J 完全版を目指す設計になります。
```

### 3-2. `docs/PURPOSE.md` の訂正

Phase 0-a で追加された以下の記述を探し、削除または訂正してください:

```markdown
| B1/B2 語彙の実データ | **不足**（Phase 0-a 是正済み。B1=25語 phoneme_fill、B2=0語。Phase 1/2 で拡充） |
| Mode A の CEFR フィルタ | **未実装**（Phase 0-b で追加予定。データ側は Phase 0-a で是正済み） |
```

以下に置き換え:

```markdown
| B1/B2 語彙の実データ | **既存 347語（B1）/ 330語（B2）が CEFR-J 由来の正当な語彙と確認済み**（2026-07-07 訂正）。CEFR-J 完全版との差分（B1: 1,769語 / B2: 2,186語）を Phase 1/2 で拡充予定 |
| Mode A の CEFR フィルタ | **未実装**（Phase 0-b で追加予定） |
```

変更履歴に追加:

```markdown
| 2026-07-XX | v3.3.1 | Phase 0-a の訂正: phonics 652語の cefr null化を復元。CEFR-J 一次データとの照合で 652語全てが正当な B1/B2 語彙と判明したため。詳細は docs/wordlist-cefr-audit.md 訂正セクション参照。 |
```

もし v3.3 のエントリ自体を書き換えられるなら（まだ他のコミットに影響していない場合）、v3.3 を「Phase 0-a: 誤った前提に基づく変更を実施（後日 v3.3.1 で訂正）」のように注記付きで残すことを推奨します。履歴の透明性のためです。

### 3-3. `docs/SPECIFICATION.md` の訂正

Phase 0-a で追加された `cefr` フィールドに関する記述（「B1=25語、B2=0語」等の言及があれば）を、3-2 と同じ内容に揃えて訂正してください。

---

## 4. 検証手順

### 4-1. データ検証

セクション 2-4 のアサーションスクリプトが `全アサーション PASS` を出力すること。

### 4-2. Mode B の動作確認

復元後、以下を確認:

| # | シナリオ | 期待動作 |
|---|---|---|
| 1 | localStorage クリアで Mode B 開始 | A1 バンドから開始 |
| 2 | A1 で 60% mastered | A2 に自動解放 |
| 3 | A2 で 60% mastered | B1 に自動解放（**347語**のプール、以前の実装レポートが懸念した「25語」ではない） |
| 4 | B1 で 60% mastered | B2 に自動解放（**330語**のプール、以前の実装レポートが懸念した「0語（空）」ではない） |

**重要:** 前回の Phase 0-a 実装レポートで「Mode B B2 空バンド問題」として懸念されていた事象は、この復元により解消されます（B2 はそもそも空にならない）。もしこの検証がまだ未実施なら、実施不要です。

### 4-3. ドキュメント整合性確認

```bash
grep -n "B1=25\|B2=0\|25語\|B2 は 0" docs/PURPOSE.md docs/SPECIFICATION.md docs/wordlist-cefr-audit.md
```

このコマンドで訂正漏れの記述が残っていないか確認してください（`wordlist-cefr-audit.md` の訂正前セクション内の言及は履歴として残るので無視してOK、訂正セクション以降に誤記述がないかを見る）。

---

## 5. 実装レポートの記載事項

1. `git status` 出力
2. セクション 2-2 の差分確認スクリプトの実行結果（`cefr 以外に差分がある語: 0` であることを含む）
3. セクション 2-4 の検証結果（`全アサーション PASS`）
4. `docs/wordlist-cefr-audit.md` 訂正セクション追記の確認
5. `docs/PURPOSE.md` / `docs/SPECIFICATION.md` 訂正の確認
6. `scripts/apply_phonics_cefr_null.py` への警告コメント追加の確認
7. 検証 4-2（Mode B バンド解放）の実施結果（任意、実施すれば尚可）
8. 既知の残作業・懸念事項

---

## 6. Git コミット推奨単位

```
Commit 1: Revert Phase 0-a: restore cefr on 652 genuine CEFR-J phonics words
  - wordlist_GA_a1a2_plus_phonics.json (652 entries: cefr null -> B1/B2 restored)

Commit 2: Document Phase 0-a correction
  - docs/wordlist-cefr-audit.md (append correction section)
  - docs/PURPOSE.md (corrected dependency table + v3.3.1 changelog)
  - docs/SPECIFICATION.md (corrected cefr field notes)
  - docs/cursor-instructions-cefr-phase0a-revert.md (new, this instruction)
  - scripts/apply_phonics_cefr_null.py (add historical warning comment)
```

コミットメッセージには「なぜ訂正したか」を明記することを推奨します（例: `Revert Phase 0-a: 652 phonics words verified as genuine CEFR-J B1/B2 vocabulary via primary source (openlanguageprofiles/olp-en-cefrj), not placeholder labels as originally assumed`）。

---

## 7. Phase 0-b / Phase 1 への影響（作業不要、記録のみ）

- **Phase 0-b（CEFR UI 配線）**: 影響は軽微です。既に確定していた D1-D6 の判断（複数選択・C1非表示・空バンド対応・regField維持・デフォルトA1+A2・i18nキー方針）はそのまま有効です。D3 の「空バンドスキップ」コードは、今後 B2 が本当に空になることは当面ないため緊急性は下がりますが、将来の安全策として実装は維持を推奨します
- **Phase 1（B1拡充）**: 今回の復元により、Phase 1 の対象は「CEFR-J B1 の 2,332語 - 既存347語 = 1,769語」に確定しました。既存347語分の完成済みデータ（IPA・gloss・def・respell）はそのまま活用できます

---

以上で Phase 0-a の訂正は完了です。ご迷惑をおかけしました。
