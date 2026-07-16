---
id: pj-2026-07-09-f9ac
aliases:
- pj-2026-07-09-f9ac
title: Cursor 指示書 — Phase 1 M5バッチ（389語・最終バッチ）のマージ
created: '2026-07-09'
---
# Cursor 指示書 — Phase 1 M5バッチ（389語・最終バッチ）のマージ

> 作成日: 2026-07-09
> 配置先: `docs/cursor/instructions/cursor-instructions-phase1-m5.md`（新フォルダ構成準拠）
> ゴール: B1 拡充の最終バッチ 389 語（`restrict` 〜 `yoga`）をマージし、CEFR-J B1 拡充フェーズを完了する

---

## 0. 品質検証済み事項（着手前の確認）

- 既存4,439語（オリジナル3,059語 + M1-M4の1,380語）との重複: **0件**
- IPA/RP IPA形式異常: **0件**、GA表記へのRP長母音記号混入: **0件**
- 品詞ラベルの逸脱: なし
- 4言語すべて完成: 389/389語
- 辞書自動カバー率: 77.9%（303語）、残り86語は語根参照による手動合成（今バッチは複合語比率が高め）

**このバッチのマージで CEFR-J B1（単一語 2,332語）の拡充作業が完了します。** 最終的な app 内 B1 語数は 2,116 語となる見込みです（CEFR-J上のB1語2,332語のうち227語は既にapp内でA1/A2として実質カバー済みのため、単純な2,332到達にはなりません。これは想定通りの結果です）。

---

## 1. スコープと非スコープ

### スコープ

1. `data/batches/phase1_m5_389_with_gloss.json`（389エントリ）を `wordlist_GA_a1a2_plus_phonics.json`（**リポジトリルート**）にマージ
2. `_generation_source` フィールドをマージ後に削除
3. `scripts/generate_flap_ipa.py` / `scripts/generate_respelling.py` を実行し narrow IPA・respelling を生成
4. `neighbors` は空配列のまま維持
5. `docs/PURPOSE.md` の B1 拡充完了を記録

### 非スコープ

- `index.html` の変更
- `neighbors` 計算（項目#6、別途着手予定）
- `gas/BatchWords.gs` の更新（`scripts/export_batch_words.py` 実行は別タスクとして依頼予定）

---

## 2. 手順

### 2-1. マージスクリプト（リポジトリルートで実行）

```python
import json

m5 = json.load(open('data/batches/phase1_m5_389_with_gloss.json'))
main = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))

existing_words = {w['w'].lower() for w in main}
new_entries = []
skipped = []
for entry in m5:
    if entry['w'].lower() in existing_words:
        skipped.append(entry['w'])
        continue
    entry = dict(entry)
    entry.pop('_generation_source', None)
    new_entries.append(entry)

print(f'新規追加: {len(new_entries)}語')
print(f'スキップ(既存と重複): {len(skipped)}語 {skipped}')

main.extend(new_entries)
json.dump(main, open('wordlist_GA_a1a2_plus_phonics.json', 'w', encoding='utf-8'),
           ensure_ascii=False, indent=2)
print(f'マージ後総語数: {len(main)}')
```

期待される出力: `新規追加: 389語`、`スキップ: 0語`、マージ後総語数 **4,828**（現在4,439 + 389）。

### 2-2. narrow IPA・respelling 生成

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
```

（`merge_respelling.py` は恒久修正済みのため、既存語への影響確認は簡易でよい）

### 2-3. 検証

```python
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
print('総語数:', len(d))  # 期待値: 4828

from collections import Counter
print('CEFR分布:', dict(Counter(w.get('cefr') for w in d)))
# 期待値: B1 が 1727+389=2116 になっているはず

by_w = {e['w']: e for e in d}
for w in ['restrict', 'submarine', 'yoga']:
    e = by_w[w]
    print(w, '->', {k: e.get(k) for k in ('ipa','rp_ipa','cefr','pos','gloss','respell_ga','ipa_actual_ga')})

for w in ['abandon', 'biography', 'entertain', 'marked']:
    e = by_w.get(w)
    if e:
        print(w, '(既存確認)', '->', {k: e.get(k) for k in ('gloss','respell_ga')})
```

`B1: 2116` を確認してください。

### 2-4. `docs/PURPOSE.md` への完了記録

Phase 1 B1拡充セクションに以下を追記:

```markdown
## Phase 1: B1語彙拡充 — 完了 (2026-07-09)

CEFR-J Wordlist v1.5 のB1語彙(単一語2,332語)のうち、既存app未収録だった1,769語を
M1(180)+M2(400)+M3(400)+M4(400)+M5(389)の5バッチに分けて拡充完了。

最終結果:
- app内 B1語数: 2,116語（オリジナル347語 + Phase1拡充1,769語）
- gloss(en/ja/zh/ko/fil) 5言語完成: 全4,828語
- narrow IPA・respelling: 既存パイプラインで生成済み（R4 pending分は別途TTSレビュー予定）

次フェーズ: `neighbors`再計算（項目#6）、B2語彙拡充の要否検討
```

---

## 3. 実装レポートの記載事項

1. マージ結果（新規追加389語、重複ゼロ確認）
2. narrow IPA / respelling 生成結果（例外扱いになった語数）
3. 既存語への影響確認
4. 検証結果（B1=2116確認、サンプル語の生成内容）
5. `docs/PURPOSE.md` への完了記録
6. 既知の残作業（`neighbors`, `gas/BatchWords.gs`更新, R4 pendingレビュー等）

配置先: `docs/cursor/reports/cursor-implementation-report-phase1-m5.md`

---

## 4. Git コミット推奨単位

```
Commit 1: Phase 1 M5 (final): add 389 remaining B1 vocabulary words with full gloss
  - wordlist_GA_a1a2_plus_phonics.json (+389 entries, gloss complete)
  - data/batches/phase1_m5_389_with_gloss.json (source data)

Commit 2: Generate narrow IPA and respelling for Phase 1 M5 words
  - wordlist_GA_a1a2_plus_phonics.json (ipa_actual_ga, respell_ga/rp for new entries)

Commit 3: Document Phase 1 B1 expansion completion
  - docs/PURPOSE.md (Phase 1 completion section)
```

---

## 5. Phase 1 完了後の次のマイルストーン（作業不要、記録のみ）

1. **`neighbors` 再計算**（項目#6）: 新規1,769語分の音韻的近傍語計算。既存2,623語の neighbors とあわせた全体設計が必要。**Opus セッションでの着手を推奨**（多軸一貫性が要求されるアルゴリズム設計のため）
2. **`gas/BatchWords.gs` 更新**: `scripts/export_batch_words.py` を実行し、4,828語版のバッチワードリストで GAS を再デプロイ
3. **R4 pending語の TTS レビュー**: M1-M5累計で発生した pending 語（narrow IPA / respelling 未確定）のレビュー
4. **B2語彙拡充の要否検討**: B1完了を踏まえ、CEFR-J B2（2,186語ギャップ）に着手するかの意思決定
