# Cursor 指示書 — 連結音・弱形への CEFR 付与マージ

> 作成日: 2026-07-09
> 背景: `docs/cefr-connected-weak-proposal-report.md`（Claude提案）を Naoya が確認し、算出結果をそのまま採用する方針で確定
> ゴール: `data/connected_speech.json`（201句）と `data/weak_forms.json`（36語）の各エントリに `cefr` フィールドを追加する

---

## 0. 方針確定事項

- 提案された `cefr` 値を**そのまま採用**（レポート セクション3-2で挙げた14件の「イディオム性を考慮した引き上げ」は見送り、算出結果通りとする）
- `vocab_cefr`（語彙CEFR、参考情報）はマージ対象外。本番データには `cefr` のみ追加する

---

## 1. スコープと非スコープ

### スコープ

1. `data/connected_speech.json` の 201 エントリに `cefr` フィールドを追加
2. `data/weak_forms.json` の 36 エントリに `cefr` フィールドを追加
3. 出題カードでの CEFR バッジ表示に必要なデータ準備（UI配線自体は別指示書、今回はデータ追加のみ）

### 非スコープ

- `index.html` の変更（CEFR バッジ表示のUI配線は別途指示）
- `wordlist_GA_a1a2_plus_phonics.json` への変更なし
- Phase 1 M4 以降のB1語彙拡充とは無関係

---

## 2. 手順

### 2-1. マージスクリプト

添付の `cefr_proposals_merge_ready.json`（237件、`{"id":..., "w":..., "cefr":...}` 形式）を使用します。

```python
import json

proposals = json.load(open('cefr_proposals_merge_ready.json'))
cs_map = {p['id']: p['cefr'] for p in proposals if p['id'].startswith('cs')}
wf_map = {p['id']: p['cefr'] for p in proposals if p['id'].startswith('wf')}

print(f'連結句 提案数: {len(cs_map)}')
print(f'弱形 提案数: {len(wf_map)}')

# connected_speech.json への適用
cs_data = json.load(open('data/connected_speech.json'))
updated_cs = 0
missing_cs = []
for entry in cs_data:
    if entry['id'] in cs_map:
        entry['cefr'] = cs_map[entry['id']]
        updated_cs += 1
    else:
        missing_cs.append(entry['id'])

print(f'connected_speech.json 更新: {updated_cs}/{len(cs_data)}')
if missing_cs:
    print(f'  未対応ID: {missing_cs}')

json.dump(cs_data, open('data/connected_speech.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=2)

# weak_forms.json への適用
wf_data = json.load(open('data/weak_forms.json'))
updated_wf = 0
missing_wf = []
for entry in wf_data:
    if entry['id'] in wf_map:
        entry['cefr'] = wf_map[entry['id']]
        updated_wf += 1
    else:
        missing_wf.append(entry['id'])

print(f'weak_forms.json 更新: {updated_wf}/{len(wf_data)}')
if missing_wf:
    print(f'  未対応ID: {missing_wf}')

json.dump(wf_data, open('data/weak_forms.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=2)
```

期待される出力: `connected_speech.json 更新: 201/201`、`weak_forms.json 更新: 36/36`、未対応IDなし。

**注意:** 実際のファイルパスが `data/connected_speech.json` でない場合（リポジトリルート直下等）、既存の Phase B 指示書等を参照してパスを合わせてください。

### 2-2. 検証

```python
import json
from collections import Counter

cs = json.load(open('data/connected_speech.json'))
wf = json.load(open('data/weak_forms.json'))

assert all('cefr' in e for e in cs), 'connected_speech.json に cefr 未設定のエントリがあります'
assert all('cefr' in e for e in wf), 'weak_forms.json に cefr 未設定のエントリがあります'

print('連結句 CEFR分布:', dict(Counter(e['cefr'] for e in cs)))
print('弱形 CEFR分布:', dict(Counter(e['cefr'] for e in wf)))

# 期待値
# 連結句: A1:63, A2:106, B1:19, B2:13
# 弱形: A2:26, B1:10
```

### 2-3. サンプル確認

```python
by_id_cs = {e['id']: e for e in cs}
for sample_id in ['cs001', 'cs046', 'cs182']:
    print(sample_id, '->', by_id_cs[sample_id].get('w') or by_id_cs[sample_id].get('phrase'), by_id_cs[sample_id]['cefr'])

by_id_wf = {e['id']: e for e in wf}
for sample_id in ['wf001', 'wf011', 'wf032']:
    print(sample_id, '->', by_id_wf[sample_id].get('word'), by_id_wf[sample_id]['cefr'])
```

期待値: `cs001`(an apple)→A1, `cs046`(what do you want)→A1, `cs182`(blind spot)→B2, `wf001`(a)→A2, `wf011`(can)→A2, `wf032`(he)→B1。

---

## 3. 実装レポートの記載事項

1. マージ結果（201/201, 36/36 更新確認）
2. 検証の実行結果（CEFR分布が期待値と一致）
3. サンプル確認結果
4. `docs/PURPOSE.md` への軽微な追記（「連結句・弱形にCEFRラベル付与済み」程度）
5. 既知の残作業（UI側でのCEFRバッジ表示配線は別途）

---

## 4. Git コミット推奨単位

```
Commit: Add CEFR labels to connected speech and weak forms data
  - data/connected_speech.json (+cefr field, 201 entries)
  - data/weak_forms.json (+cefr field, 36 entries)
  - cefr_proposals_merge_ready.json (source data, keep for record)
  - docs/cefr-connected-weak-proposal-report.md (Claude's proposal, keep for record)
```

---

## 5. 今後の展開（作業不要、記録のみ）

- CEFR バッジを実際に出題カードへ表示するには、`index.html` 側で `S.cefrLevels` フィルタの対象を連結句・弱形にも拡張する UI 配線が別途必要（Phase 0-b で Mode A の単語プールに実装したパターンを流用可能）
- 今回未収録だった8語（`devil`, `foremost` 等）が Phase 1 M4以降で正式収録された際、それらを含む連結句・弱形の `vocab_cefr` を再確認すると精度が上がる（今回は暫定値で対応）
