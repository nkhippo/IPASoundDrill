---
id: pj-2026-07-07-21c4
aliases:
- pj-2026-07-07-21c4
title: Cursor 指示書 — Phase 1 M1 パイロット gloss 5 言語翻訳の適用
created: '2026-07-07'
---
# Cursor 指示書 — Phase 1 M1 パイロット gloss 5 言語翻訳の適用

> 作成日: 2026-07-07
> 前提: Phase 1 M1 パイロット180語のマージが完了・push 済み（`cursor-implementation-report-phase1-m1-pilot.md`）
> ゴール: 180 語の `gloss.ja` / `gloss.zh` / `gloss.ko` / `gloss.fil` を Claude 生成の翻訳データで埋める
> 独立性: `index.html` を触らない。データ更新のみで完結

---

## 0. 背景

Phase 1 M1 パイロット180語（`abandon` 〜 `biochemistry`）は前回マージ時点で `gloss.ja/zh/ko/fil` が `null` のままでした。今回、既存 A1/A2 語彙の gloss スタイル（簡潔な訳語のみ、多義語は区切り併記、品詞スロット対応の複数訳併置）に準拠して 180 語 × 4 言語 = 720 訳語を生成しました。添付の `phase1_pilot_180_with_gloss.json` を適用してください。

### 翻訳の品質基準（適用前の理解のため）

- **既存スタイル準拠**: `book` → ja: `本、予約する、記帳する` のような、意味の列挙形式
- **同義語ペアは完全一致**: `adviser/advisor`, `acknowledgement/acknowledgment`, `afterward/afterwards` は全4言語で同じ訳語
- **英式/米式は明示区別**: `analyse` → `分析する(英)`, `analyze` → `分析する`（`advert` も同様に `(英)` 付き）
- **多品詞語は複数訳併置**: `advance`（動詞/名詞）→ ja: `前進する、進歩、前もっての`
- **専門用語**: 品詞用語（`副詞`, `助動詞`）、固有名詞（`大西洋`）は各言語の標準訳を使用

---

## 1. スコープと非スコープ

### スコープ

1. `wordlist_GA_a1a2_plus_phonics.json` 内の 180 語について、`gloss` オブジェクトを添付ファイルの値で置き換え
2. 適用前後の差分検証と実装レポート作成

### 非スコープ（絶対に触らないこと）

- `gloss.en`（既存の headword そのままで維持）
- `ipa` / `rp_ipa` / `ipa_actual_ga` / `respell_ga` / `respell_rp` / `def` / `pos` / `src` / `cefr` / `neighbors` / `pattern` / `group`（前回 M1 マージで確定済み、変更しない）
- `index.html`
- 既存の A1/A2/B2/その他 B1 語彙の gloss（180 語以外は触らない）

---

## 2. 適用手順

### 2-1. 差分検証（適用前の安全確認）

```python
import json

pilot_new = json.load(open('phase1_pilot_180_with_gloss.json'))
main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))

new_map = {e['w']: e for e in pilot_new}
main_map = {e['w']: e for e in main}

# 180 語すべてが main に存在するか
missing = [w for w in new_map if w not in main_map]
assert not missing, f'ERROR: main に見つからない: {missing}'

# 180 語について、gloss 以外のフィールドが完全一致するか
diffs = []
for w, new_entry in new_map.items():
    cur = main_map[w]
    for k in ('w', 'ipa', 'rp_ipa', 'cefr', 'pos', 'src', 'def'):
        if new_entry.get(k) != cur.get(k):
            diffs.append((w, k, cur.get(k), new_entry.get(k)))

if diffs:
    print(f'警告: gloss 以外に差分がある項目: {len(diffs)}')
    for w, k, old, new in diffs[:5]:
        print(f'  {w}.{k}: current={old!r} -> new={new!r}')
    print('※ これらは前回M1マージ後にCursor側で narrow IPA/respelling を追加したため')
    print('  のケースが想定される。差分は gloss 適用時に主張しないため問題なし。')
else:
    print('OK: gloss 以外に差分なし')

print(f'\n180語の gloss 現状（適用前）:')
sample = ['abandon', 'advance', 'biochemistry']
for w in sample:
    print(f'  {w}: current gloss = {main_map[w]["gloss"]}')
```

期待される出力:
- `OK: gloss 以外に差分なし` または差分がある場合でも警告のみ（gloss適用には影響しない）
- 180語すべての現状 gloss が `{"en": "...", "ja": null, "zh": null, "ko": null, "fil": null}` になっているはず

### 2-2. gloss のみ適用

```python
import json

pilot_new = json.load(open('phase1_pilot_180_with_gloss.json'))
main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
new_gloss_map = {e['w']: e['gloss'] for e in pilot_new}

updated = 0
for entry in main:
    w = entry['w']
    if w in new_gloss_map:
        entry['gloss'] = new_gloss_map[w]
        updated += 1

assert updated == 180, f'ERROR: 期待180件、実際{updated}件更新'

with open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8') as f:
    json.dump(main, f, ensure_ascii=False, indent=2)

print(f'gloss 更新完了: {updated} 語')
```

### 2-3. 適用後検証

```python
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))

# 総語数変わっていないこと
assert len(d) == 3239, f'総語数変化: {len(d)}'

# パイロット180語の gloss がすべて4言語埋まっていること
pilot_words = ['abandon','able','abnormal','aboard','aborigine','absence','absent','absolute',
'absolutely','absorb','abstract','abundance','abundant','academic','academy','accent',
'acceptance','access','accessible','accessory','accidental','accidentally','accompany',
'accomplish','accountant','accuracy','accurate','accurately','accuse','accustom','achievement',
'acknowledge','acknowledgement','acknowledgment','acquaintance','acquire','active','actress',
'adapt','addressee','administration','admiration','admission','adopt','adorable','advance',
'adverb','adverbial','advert','advertise','adviser','advisor','aerobics','affect','affection',
'afford','afterward','afterwards','agenda','aggressive','agreement','agricultural','agriculture',
'airline','alcohol','alcoholic','alike','allergic','allowance','aloud','alphabet','alternative',
'altogether','amazed','amazing','ambitious','ambulance','amount','amusing','analyse','analysis',
'analyze','anger','angle','animated','animation','announce','announcement','annoyance','annoyed',
'annual','annually','anti','antique','antonym','anxiety','anxiously','anyhow','apology','apparent',
'appeal','appetite','applaud','applause','application','appreciation','approach','approval',
'approve','approximately','architect','arise','arithmetic','army','arrange','arrangement','arrest',
'arrival','arrow','artist','artistic','ashamed','aside','aspect','aspirin','assign','assignment',
'assist','assistance','associate','assume','astronomer','athletic','atlantic','atmosphere','atomic',
'attach','attachment','attain','attend','attract','attraction','authority','auxiliary','available',
'avenue','aware','awareness','awesome','awkward','babysit','babysitter','backache','backpack',
'backpacker','backpacking','bacon','baggage','baker','bakery','balance','bandage','barely','barman',
'barrel','basement','basin','basis','battle','beautifully','beaver','bedside','behalf','behave',
'belief','beloved','beneath','benefit','bilingual','biochemistry']

pilot_set = set(pilot_words)
assert len(pilot_set) == 180, f'語リストが180語でない: {len(pilot_set)}'

by_w = {e['w']: e for e in d}
for w in pilot_words:
    g = by_w[w]['gloss']
    for lang in ('ja','zh','ko','fil'):
        assert g.get(lang), f'ERROR: {w}.gloss.{lang} が空'
    assert g.get('en') == w, f'ERROR: {w}.gloss.en が headword でない: {g.get("en")}'

# 既存A1/A2の gloss が壊れていないこと（サンプル抜き取り）
sample_existing = ['book','address','light','right','apple','water','morning']
for w in sample_existing:
    e = by_w.get(w)
    if e and e.get('gloss'):
        assert e['gloss'].get('ja'), f'ERROR: 既存語 {w}.gloss.ja が消失'

print('全アサーション PASS')
print(f'\nサンプル確認:')
for w in ['abandon','advance','biochemistry','book']:
    print(f'  {w}: {by_w[w]["gloss"]}')
```

期待: `全アサーション PASS` が出力されること。

### 2-4. `docs/PURPOSE.md` の更新

依存表と変更履歴を軽微に更新:

```markdown
| gloss 品質（多言語UI） | en/ja/zh/ko/fil **実装済み**（gloss.fil 3,059語完走、Phase 1 M1で180語追加、合計3,239語） |
```

変更履歴に追加:

```markdown
| 2026-07-XX | v3.6 | Phase 1 M1: パイロット180語の gloss 5言語（ja/zh/ko/fil）翻訳を追加。Claude によるスタイル準拠翻訳、同義語ペアの整合性確認済み。 |
```

---

## 3. 実装レポートの記載事項

1. `git status` 出力
2. 検証 2-1 の実行結果（差分状況確認）
3. 検証 2-3 の実行結果（`全アサーション PASS` を含む）
4. サンプル 3-4 語の適用前後 gloss（before は null、after は日中韓fil の訳語）
5. `docs/PURPOSE.md` 更新確認
6. 既知の残作業・懸念事項

---

## 4. Git コミット推奨単位

```
Commit 1: Phase 1 M1: apply 5-lang gloss translations for 180 pilot B1 words
  - wordlist_GA_a1a2_plus_phonics.json (180 entries: gloss.ja/zh/ko/fil filled)
  - phase1_pilot_180_with_gloss.json (source translation data, keep for record)

Commit 2: Document Phase 1 M1 gloss completion
  - docs/PURPOSE.md (dependency table + v3.6 changelog)
```

---

## 5. トラブルシューティング

### 検証 2-3 のアサーションで一部の語が失敗

- 該当語が実際に main に存在するか確認: `python3 -c "import json; d=json.load(open('wordlist_GA_a1a2_plus_phonics.json')); print([e for e in d if e['w']=='XXX'])"`
- gloss 適用が完了しているか、`en` フィールドが headword と一致するか個別に確認

### 既存語の gloss が消失した場合

- 適用スクリプトが `entry['gloss'] = new_gloss_map[w]` の代入で、180 語以外を触っていないか確認
- git で HEAD 版から wordlist を復元、再度適用

---

## 6. 次のマイルストーンへの引き継ぎ

Phase 1 M2 以降（残り 1,589 語）は同じパイプラインで進行可能:

1. Claude が CEFR-J B1 未収録語から次の 400-450 語を選定
2. GA/RP IPA 生成（CMU Dict + Britfone、既存スクリプト流用）
3. pos / def 生成
4. Opus セッションで gloss 5 言語翻訳（180 語のスタイルを踏襲）
5. Cursor が本指示書と同型のマージ + 検証

Phase 1 M1 の完了により、パイプライン全体の実現可能性が確認された状態です。M2 以降は同じ手順の繰り返しで、バッチサイズを段階的に拡大できます。
