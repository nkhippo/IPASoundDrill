---
id: pj-2026-07-09-22fb
aliases:
- pj-2026-07-09-22fb
title: Cursor 指示書 — `merge_respelling.py` pending クリア問題の恒久修正
created: '2026-07-09'
---

# Cursor 指示書 — `merge_respelling.py` pending クリア問題の恒久修正

> 作成日: 2026-07-08
> 背景: Phase 1 M1・M2 の両方で、`merge_respelling.py` 実行時に**マージ対象外の既存語**（VntV pending 52語）の `respell_ga`/`respell_rp` が意図せずクリアされ、その都度 HEAD 版から手動復元する対応が発生している。
> ゴール: 同じ問題が M3 以降も再発しないよう、スクリプト自体を修正する。

---

## 1. 調査してほしいこと

`scripts/merge_respelling.py`（または該当パス）を開き、以下を確認してください:

1. マージ処理が「今回のバッチで新規生成された respelling」だけでなく、**全語彙を対象に何らかのデフォルト値で上書きしている箇所がないか**
2. 特に、`phase2b_respell_pending.json`（TTS未確認の pending 語リスト）を扱う処理で、**「pending だから respell フィールドを null/空にする」という条件分岐が、今回の新規バッチ語以外にも適用されていないか**
3. 既存の VntV pending 52語が、なぜ M1・M2 双方で毎回巻き込まれるのか（同じ 52 語が繰り返し影響を受けているなら、`pending` フラグの判定条件が広すぎる可能性が高い）

## 2. 想定される原因と修正方針（仮説、要検証）

おそらく `merge_respelling.py` が以下のようなロジックになっていると推測します:

```python
# 推測される問題のあるロジック（要確認）
for word in all_words:  # 新規バッチ語だけでなく全語彙をループ
    if word in pending_words_from_this_run:
        word['respell_ga'] = None  # ← これが既存のVntV pending語にも誤爆している?
```

もしこのような処理になっていれば、修正方針は:

```python
# 修正案: 「今回のマージ対象語のみ」に処理を限定する
new_batch_words = {e['w'] for e in newly_merged_entries}  # 今回追加した語だけ
for word in all_words:
    if word['w'] in new_batch_words and word['w'] in pending_words_from_this_run:
        word['respell_ga'] = None
    # 既存語（new_batch_words に含まれない語）には一切触れない
```

実際のコードを見て、この仮説が正しいか確認の上、適切な形で修正してください。

## 3. 修正後の検証

修正後、以下を確認してください:

1. `git stash` などで直前の状態（M2マージ直後）を再現できるなら、既存の VntV pending 52語の `respell_ga`/`respell_rp` が**今回は変化しない**ことを確認
2. 新規語（次回 M3 バッチ）に対しては、通常通り pending 判定と respelling 生成が機能すること
3. 簡単なテスト: 現状のリポジトリで `python3 scripts/merge_respelling.py` を（新規マージなしで）再実行し、`git diff --stat wordlist_GA_a1a2_plus_phonics.json` が **無変更**であることを確認（idempotent であるべき）

## 4. 実装レポートの記載事項

1. 実際の原因（仮説と一致したか、違ったか）
2. 修正内容の diff
3. 検証3点の結果
4. 今後の M3以降のマージで、この手動復元ステップが不要になる見込みかどうか

## 5. Git コミット推奨単位

```
Commit: Fix merge_respelling.py to only affect newly-merged batch words
  - scripts/merge_respelling.py
```

---

以上、修正完了後に Phase 1 M3 の指示書を送ります。この修正自体は `wordlist_GA_a1a2_plus_phonics.json` のデータを変更するものではなく、スクリプトロジックの修正のみです（今回変更不要なら、次回のマージ時に効果を発揮します）。
