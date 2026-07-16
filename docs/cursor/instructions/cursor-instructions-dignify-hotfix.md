---
id: pj-2026-07-10-43ee
aliases:
- pj-2026-07-10-43ee
title: Cursor 指示書 — `dignify` / `dignity` RP IPA ホットフィックス
created: '2026-07-10'
---
# Cursor 指示書 — `dignify` / `dignity` RP IPA ホットフィックス

- 対象リポジトリ: `nkhippo/IPASoundDrill`
- 優先度: 高（データ品質バグ、他の作業と並行して速やかに適用推奨）
- 想定 branch: `fix/dignify-dignity-rp-typo`

---

## 1. バグの内容

M2d バッチで `dignify` / `dignity` の GA IPA に母音 `ɪ` の脱字がありました。
Claude 側 QA でこれを発見して修正しましたが、**修正後に RP IPA を再導出しなかったため、
`rp_ipa` は誤った GA から生成されたまま**送付・マージされていました。

| 語 | 現状 `ipa` | 現状 `rp_ipa`（誤） | 修正後 `rp_ipa`（正） |
|---|---|---|---|
| `dignify` | `/ˈdɪɡnəˌfaɪ/` | `/ˈdɡnəˌfaɪ/` | `/ˈdɪɡnəˌfaɪ/` |
| `dignity` | `/ˈdɪɡnəti/` | `/ˈdɡnətiː/` | `/ˈdɪɡnətiː/` |

`ipa` フィールドは正しいままのため、影響はいずれも `rp_ipa` の 2 語のみです。
Opus による全 5,397 語の retroactive スキャン（4 文字以上の子音連続検出）で、他に同種の corruption は無いことを確認済み。

## 2. 適用手順

添付の `dignify_dignity_rp_hotfix.json` を使ってパッチ適用:

```bash
python3 -c "
import json
wordlist = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
patch = json.load(open('dignify_dignity_rp_hotfix.json'))
patch_map = {p['w']: p['rp_ipa'] for p in patch}
n = 0
for w in wordlist:
    if w['w'] in patch_map:
        w['rp_ipa'] = patch_map[w['w']]
        n += 1
assert n == 2, f'expected 2 patches, got {n}'
json.dump(wordlist, open('wordlist_GA_a1a2_plus_phonics.json', 'w'), ensure_ascii=False, indent=2)
print(f'patched {n} words')
"
```

## 3. 派生の再計算

```bash
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
```

**`dignify` は different → same (identical) に反転**します（GA と RP が完全一致するため）。
`dignity` は依然 `ga_allophony` で different（narrow の flap-T `/ˈdɪɡnəɾi/` が別途存在するため。仕様通り）。

neighbors 再計算は不要（`rp_ipa` は neighbors 生成に使わないため）。

## 4. コミット

```bash
git add wordlist_GA_a1a2_plus_phonics.json \
        data/pipeline/ga_rp_same_report.json
git commit -m "fix: correct rp_ipa for dignify/dignity (missing ɪ vowel)"
```

## 5. 再発防止（Claude 側で対応済み・情報共有）

私（Claude）の M2 以降の QA プロセスに、以下を追加しました:
- IPA 生成物の「4 文字以上の子音連続」自動検出
- typo 修正後の **RP IPA 全件再導出** を必須ステップ化

M2e 以降のバッチではこのクラスのバグは発生しません。
