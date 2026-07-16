---
id: pj-2026-07-09-752c
aliases:
- pj-2026-07-09-752c
title: Cursor 指示書 — `friendliness` の GA IPA 表記ミス訂正
created: '2026-07-09'
---

# Cursor 指示書 — `friendliness` の GA IPA 表記ミス訂正

> 作成日: 2026-07-09
> 種別: 小規模データ訂正（Claude 側の生成ミス）
> 背景: M3 実装レポートで報告された `friendliness` の respelling 例外（`unknown coda consonant 'ː'`）の原因は、Claude が M3 データ生成時に GA IPA へ誤って RP 用の長母音記号 `ː` を混入させたことでした（正しくは `/ˈfrɛndlinəs/`、誤りは `/ˈfrɛndliːnəs/`）。GA 表記では長母音記号を使わず `i` のみで FLEECE 母音を表す既存規則（`generate_respelling.py` の `VOWELS_GA` 参照）に反していました。

## 修正内容

`wordlist_GA_a1a2_plus_phonics.json` 内の `friendliness` エントリの `ipa` フィールドを以下のように修正してください:

```
修正前: "ipa": "/ˈfrɛndliːnəs/"
修正後: "ipa": "/ˈfrɛndlinəs/"
```

`rp_ipa`（`/ˈfrendlinəs/`）は変更不要です。

## 手順

```python
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
for e in d:
    if e['w'] == 'friendliness':
        assert e['ipa'] == '/ˈfrɛndliːnəs/', f"想定と異なる現状値: {e['ipa']}"
        e['ipa'] = '/ˈfrɛndlinəs/'
        print('修正完了:', e)
json.dump(d, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
          ensure_ascii=False, indent=2)
```

修正後、`generate_flap_ipa.py` / `generate_respelling.py` を `friendliness` のみ対象に再実行するか、次回バッチ処理時にまとめて再実行してください。前回の例外リスト（`phase2b_respell_exceptions.json`）から `friendliness` を除去できるか確認をお願いします。

## 検証

```python
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
e = next(w for w in d if w['w']=='friendliness')
assert e['ipa'] == '/ˈfrɛndlinəs/'
print('OK:', e['ipa'], e['rp_ipa'])
```

添付のソースデータ `phase1_m3_400_with_gloss.json` も同様に修正済みのものに差し替えています（今後の参照用）。
