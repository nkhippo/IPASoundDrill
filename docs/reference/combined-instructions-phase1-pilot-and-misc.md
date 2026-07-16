---
id: pj-2026-07-07-d452
aliases:
- pj-2026-07-07-d452
title: 統合指示書 — Phase 1 M1パイロット / fil.json所見 / GAS再デプロイ手順
created: '2026-07-07'
---
# 統合指示書 — Phase 1 M1パイロット / fil.json所見 / GAS再デプロイ手順

> 作成日: 2026-07-07
> 対象: 3件を並行対応（Cursor向け2件 + Naoya向け1件）

---

## A. Phase 1 M1パイロット（Cursor向け・実装作業あり）

### 背景

CEFR-J Wordlist v1.5 との照合で判明した B1 拡充対象 1,769 語のうち、先頭 180 語（アルファベット順）をパイロットバッチとして、IPA・品詞・英語定義まで生成済みです。添付の `phase1_pilot_180.json` をそのまま `wordlist_GA_a1a2_plus_phonics.json` にマージしてください。

### 技術的な検証結果（着手前の背景）

- **GA IPA**: CMU Pronouncing Dictionary（`cmudict` pip パッケージ）から自動生成。ARPABET→IPA変換 + 既存 `generate_respelling.py` と同じ音節分解ロジック（オンセット最大化原則）でストレス記号を正しい位置に配置
- **RP IPA**: **Britfone**（`JoseLlarena/Britfone`、MIT license、16,000語超のRP発音辞書）を新規採用。既存3,059語のうちBritfoneにも存在する2,916語で自動変換結果と既存 `rp_ipa` を比較した結果、**87.9%が完全一致**（残差は主に「機能語の強形/弱形の違い」「無強勢母音のɪ/ə表記揺れ」という既知の理由で、いずれも今回の180語には該当しない内容語のみ）
- **180語中152語**が両辞書でカバー、残り28語（`aborigine`, `accidental`, `babysitter`, `adverb` 等の複合語・派生語）は形態的合成・音韻規則からの類推で手動生成（`_generation_source: "manual_phonological"` でマーク済み、下記参照）

### スコープ

1. `phase1_pilot_180.json`（180エントリ）を `wordlist_GA_a1a2_plus_phonics.json` にマージ
2. `_generation_source` フィールドは**マージ後に削除**（内部トラッキング用、本番データには不要）
3. マージ後、既存 `generate_flap_ipa.py` を実行し narrow IPA（`ipa_actual_ga`）を生成
4. マージ後、既存 `generate_respelling.py` を実行し `respell_ga`/`respell_rp` を生成
5. `gloss` フィールドの `ja`/`zh`/`ko`/`fil` は **`null` のまま**（次工程で別途 Opus により翻訳生成予定、今回はマージしない）
6. `neighbors` は空配列のまま（項目#6でアルゴリズム確定後に再計算予定）

### 非スコープ

- `gloss` の5言語翻訳生成（別途 Opus セッションで対応予定）
- `neighbors` 計算（項目#6、別途対応）
- `index.html` の変更（データ追加のみ）
- 残り 1,589 語（M2以降のバッチで対応）

### 手順

#### A-1. マージスクリプト

```python
import json

pilot = json.load(open('phase1_pilot_180.json'))
main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))

existing_words = {w['w'].lower() for w in main}
new_entries = []
skipped = []
for entry in pilot:
    if entry['w'].lower() in existing_words:
        skipped.append(entry['w'])
        continue
    entry = dict(entry)
    entry.pop('_generation_source', None)  # 内部トラッキング用フィールドを削除
    new_entries.append(entry)

print(f'新規追加: {len(new_entries)}語')
print(f'スキップ(既存と重複): {len(skipped)}語 {skipped}')

main.extend(new_entries)
json.dump(main, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
           ensure_ascii=False, indent=2)
print(f'マージ後総語数: {len(main)}')
```

期待される出力: `新規追加: 180語`、`スキップ: 0語`、`マージ後総語数: 3239`（3059+180）。もしスキップが発生した場合は、その語が既に別の形で存在している可能性があるため、個別確認してください。

#### A-2. narrow IPA・respelling 生成

既存スクリプトをそのまま実行:

```bash
python3 generate_flap_ipa.py
python3 generate_respelling.py
```

これらは全3,059語（now 3,239語）に対して実行され、既存語には影響を与えず新規180語にのみ narrow IPA・respelling が追加されるはずです。実行後、新規180語のうち何語が narrow IPA の例外リスト（`phase2a_review_needed.json` 相当）に入ったか確認してください。

### 検証手順

```python
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
print('総語数:', len(d))

from collections import Counter
print('CEFR分布:', dict(Counter(w.get('cefr') for w in d)))
# 期待値: B1 が 347+180=527 になっているはず

# 新規180語のサンプル確認
pilot_words = {'abandon','babysitter','adverb','biochemistry'}
for w in d:
    if w['w'] in pilot_words:
        print(w['w'], '->', {k:w.get(k) for k in ('ipa','rp_ipa','cefr','pos','src','respell_ga','ipa_actual_ga')})
```

`B1: 527` を確認し、サンプル4語の `respell_ga`/`ipa_actual_ga` が正常に生成されていることを確認してください。

### 実装レポートの記載事項

1. マージ結果（`新規追加: 180語`、重複ゼロ確認）
2. `generate_flap_ipa.py` / `generate_respelling.py` 実行結果（新規180語のうち例外扱いになった語数）
3. 検証手順の実行結果（B1=527確認、サンプル4語の生成内容）
4. `docs/PURPOSE.md` への軽微な追記（「B1: 527語（うち180語はPhase1 M1パイロットで追加、gloss翻訳は未着手）」程度で可）

### Gitコミット推奨単位

```
Commit 1: Phase 1 M1 pilot: add 180 new B1 vocabulary words (GA/RP IPA, pos, def)
  - wordlist_GA_a1a2_plus_phonics.json (+180 entries, gloss ja/zh/ko/fil pending)

Commit 2: Generate narrow IPA and respelling for Phase 1 M1 pilot words
  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)
```

---

## B. GAS 再デプロイ手順（Naoya向け・Cursor不要）

Phase B（連結音 TTS A/B 実験）の smoke test で「5パターンの mp3 が全て同一」だったのは、GAS の新コードが未デプロイのためです。以下を Apps Script エディタで実行してください。

1. Google Apps Script のプロジェクトを開く（`gas/Code.gs` を編集したプロジェクト）
2. 右上の「デプロイ」ボタン → 「デプロイを管理」
3. 既存のウェブアプリ デプロイの鉛筆アイコン（編集）をクリック
4. 「バージョン」プルダウンで「新バージョン」を選択
5. 「デプロイ」をクリック
6. **URL が変わっていないか確認**（通常は同じ URL のまま維持されますが、念のため）
7. もし URL が変わった場合は、以下2箇所を更新する必要があります:
   - `index.html` 内の `GAS_TTS_URL` 定数（本番影響あり、慎重に）
   - `tests/tts-ab-listener.html` 内の `GAS_TTS_URL` 定数

デプロイ後、以下で動作確認:

```bash
curl -o test_nova.mp3 "GAS_URL?phrase=blind+spot&phrase_ipa=/bla%C9%AAnd%20sp%C9%91t/&accent=ga&voice=nova"
curl -o test_baseline.mp3 "GAS_URL?phrase=blind+spot&phrase_ipa=/bla%C9%AAnd%20sp%C9%91t/&accent=ga"
shasum test_nova.mp3 test_baseline.mp3
```

2つの mp3 の shasum が**異なれば**成功です（前回は全て同一で失敗していました）。

その後 `tests/tts-ab-listener.html` を開いて48パターンの聴き比べに進んでください。

---

## C. fil.json の翻訳所見（Naoya向け・判断のみ、作業不要）

`tools/validate_i18n.py` の警告 `fil.json: en と同一値 4件 -> ['back_top', 'brand.name', 'reg.regular', 'tab.connected']` について確認しました。

**結論: おそらく翻訳漏れではなく、意図的な英語借用語の可能性が高いです。**

- `brand.name`（アプリ名）: 英語のままで問題なし（意図通り）
- `back_top`: "Menu" — フィリピンの技術系UIでは "Menu" をそのまま使うのが一般的（コードスイッチング）
- `reg.regular`: "Regular" — 言語学用語としてそのまま使われることが多い
- `tab.connected`: "Linking" — 同上、専門用語の英語借用は自然

**推奨: 現状維持で問題ないと考えます。** もし完全にフィリピノ語化したい場合は指示いただければ翻訳案を出しますが、緊急性はありません。

---

以上、A（Cursor実装）・B（Naoya手動デプロイ）・C（判断のみ、対応不要）の3件です。
