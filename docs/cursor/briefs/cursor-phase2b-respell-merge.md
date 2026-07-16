---
id: pj-2026-07-02-8792
aliases:
- pj-2026-07-02-8792
title: 'Cursor 作業指示書 — Phase 2b: Respelling 本データマージ（3,007語）'
created: '2026-07-02'
---

# Cursor 作業指示書 — Phase 2b: Respelling 本データマージ（3,007語）

**作成日:** 2026-07-02
**担当:** Cursor
**依頼者:** Claude
**前提:** Phase 1（表示ロジック実装）・Phase 2a 指示書（narrow IPA マージ + VntV レビューツール）を確認済み
**リポジトリ:** `nkhippo/IPASoundDrill`（`main` ブランチ）
**添付データ:** `phase2b_respell_draft.json`（3,007語）、`phase2b_respell_pending.json`（52語・参考情報のみ、今回マージ対象外）

---

## 0. 目的とスコープ

Phase 1 で `respell_ga` / `respell_rp` フィールドの表示ロジック（Reveal パネル・語彙ブラウザ）は実装済み・pilot 30語で動作確認済みです。本 Phase 2b では:

1. **ルールベースで生成した 3,007語ぶんの `respell_ga` / `respell_rp` を wordlist 本体にマージ**
2. マージ後、respelling が実データで表示されることを確認

**表示ロジックの新規実装は不要**（Phase 1 で完成済み、データを流し込むだけ）。

### 対象外（今回触らないもの）

- `phase2b_respell_pending.json`（52語）— Phase 2a の VntV TTS判定待ち。`ipa_actual_ga` 確定後に別途生成・マージする（今回は無視してよい）
- `ipa_actual_ga` / `ipa_actual_rp` — 既に Phase 2a で対応済み。触らない
- `ipa` / `rp_ipa`（phonemic）— 絶対に変更しない
- 表示ロジック（`index.html` の `activeRespell()` 等）— Phase 1 で実装済み、変更不要

---

## 1. 参照ドキュメント

| ファイル | 参照理由 |
|---|---|
| `cursor-phase1-narrow-ipa-respell.md` | respelling 表示ロジックの実装内容確認 |
| `cursor-implementation-report-phase1-narrow-ipa-respell.md` | Phase 1 実装済み範囲の確認 |
| `cursor-phase2a-flap-merge.md` | Phase 2a のマージ方針（本指示書と同様のパターンを踏襲） |
| `phase2b_respell_draft.json`（添付） | マージ対象データ（3,007語） |
| `phase2b-summary.md`（添付、参考） | データ生成方法・検証結果の詳細 |

---

## 2. Task A: 3,007語のマージ

### A-1. マージスクリプト

Phase 2a の `scripts/merge_flap_candidates.py` と同じパターンで、respelling 用に新規作成します。

`scripts/merge_respelling.py`:

```python
#!/usr/bin/env python3
"""
Merge rule-generated respell_ga / respell_rp into the wordlist.
Overwrites both fields for every word present in phase2b_respell_draft.json.
Does NOT touch ipa, rp_ipa, ipa_actual_ga, ipa_actual_rp, or any other field.

The 52 words in phase2b_respell_pending.json are intentionally NOT included
in phase2b_respell_draft.json (their GA narrow IPA is still awaiting TTS
review from Phase 2a) — this script only processes the draft file, so those
52 words are left untouched (no respell_ga/respell_rp added yet).
"""
import json
import pathlib

WORDLIST = pathlib.Path("wordlist_GA_a1a2_plus_phonics.json")
DRAFT = pathlib.Path("phase2b_respell_draft.json")


def main():
    data = json.loads(WORDLIST.read_text(encoding="utf-8"))
    draft = json.loads(DRAFT.read_text(encoding="utf-8"))
    lookup = {w["w"]: w for w in data}

    merged, skipped = 0, []
    for d in draft:
        word = d["w"]
        if word not in lookup:
            skipped.append(word)
            continue
        entry = lookup[word]
        entry["respell_ga"] = d["respell_ga"]
        entry["respell_rp"] = d["respell_rp"]
        merged += 1

    WORDLIST.write_text(
        json.dumps(data, ensure_ascii=False, indent=2) + "\n",
        encoding="utf-8"
    )
    print(f"merged {merged} / {len(draft)} entries")
    if skipped:
        print(f"WARN: skipped (not in wordlist): {skipped}")


if __name__ == "__main__":
    main()
```

**実行方法:** `python3 scripts/merge_respelling.py`

**期待される出力:**
```
merged 3007 / 3007 entries
```
（`WARN` 行が出力されないこと）

### A-2. マージ後の検証

```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
lookup = {w['w']: w for w in d}
has_respell = [w for w in d if w.get('respell_ga')]
print(f'respell_ga を持つ語の総数: {len(has_respell)}')
# 期待値: 3007
print('party:', lookup['party']['respell_ga'], '/', lookup['party']['respell_rp'])
print('winter:', lookup['winter'].get('respell_ga'))  # 期待値: None（未マージ、Phase2a確定待ち）
print('visual:', lookup['visual']['respell_ga'], '/', lookup['visual']['respell_rp'])
"
```

期待出力:
```
respell_ga を持つ語の総数: 3007
party: PAR-dee / PAH-tee
winter: None
visual: VI-zhuh-wuhl / VI-zhoo-uhl
```

### A-3. 触ってはいけないフィールド（再掲）

- `ipa` / `rp_ipa`（phonemic）— 絶対に変更しない
- `ipa_actual_ga` / `ipa_actual_rp` — Phase 2a 対応済み範囲。変更しない
- `winter`, `twenty`, `ninety` を含む 52語 — `respell_ga`/`respell_rp` を追加しない（Phase 2a の TTS 判定が確定してから別途対応）

---

## 3. Task B: 表示確認（実装済みロジックの動作確認のみ）

Phase 1 で実装済みの表示ロジックが実データで正しく機能するか確認します。**コード変更は不要**、確認のみです。

### B-1. Reveal パネル確認

1. GA アクセントで `party` を出題 → Reveal パネルで:
   - narrow IPA: `/ˈpɑrɾi/`
   - `発音ガイド: PAR-dee`（`#rRespell`）
   - `辞書表記: /ˈpɑrti/`（narrow と異なるため表示）
2. RP に切替 → `party` の Reveal:
   - `発音ガイド: PAH-tee`
3. `visual`（narrow なし語）→ Reveal パネル:
   - narrow: `/ˈvɪʒəwəl/`（phonemic と同一なので dictionary form 行は非表示）
   - `発音ガイド: VI-zhuh-wuhl`
4. `winter`（Phase 2a 未確定・respelling 未マージ）→ Reveal パネル:
   - `発音ガイド` 行が **非表示**であること（`activeRespell()` が `null` を返し、`#rRespell` に `hidden` クラスが付与される想定）

### B-2. 語彙ブラウザ確認

1. 語彙ブラウザを開き、`party` を検索 → `vocab-respell` 行に `PAR-dee` が表示される
2. `winter` を検索 → `vocab-respell` 行が表示されない（`c.respell_ga` が undefined のため、Phase 1 の条件分岐で非表示になる想定）

### B-3. もし上記で不具合が見つかった場合

Phase 1 の実装（`activeRespell()`, `#rRespell` の hidden 切替, 語彙ブラウザの `respellLine` 生成ロジック）にバグがある可能性があります。該当箇所を確認し、実装レポートに問題内容を記載してください（今回のスコープでの軽微な修正は対応可、大きな設計変更が必要な場合は Claude に相談してください）。

---

## 4. Task C: 既存検証スクリプトの再実行

```bash
python3 tools/validate_i18n.py
python3 tools/gen_audit_docs.py
```

- ERROR なしを確認
- `encodeCheck()` 関数の diff がゼロであることを再確認（今回もデータ追加のみでロジック変更なし）

---

## 5. DoD（Definition of Done）チェックリスト

### データマージ

- [ ] `scripts/merge_respelling.py` が作成されている
- [ ] 実行結果 `merged 3007 / 3007 entries` が出力される（`WARN` なし）
- [ ] `respell_ga` を持つ語の総数が 3,007 である
- [ ] `winter` / `twenty` / `ninety` を含む52語に `respell_ga` / `respell_rp` が追加されていない
- [ ] `ipa` / `rp_ipa` / `ipa_actual_ga` / `ipa_actual_rp` が一切変更されていない（`git diff` で確認）

### 表示確認

- [ ] `party` の Reveal パネルで GA/RP それぞれの respelling が正しく表示される
- [ ] `visual` のような narrow なし語でも respelling が表示される
- [ ] `winter` の Reveal パネルで発音ガイド行が非表示のままである
- [ ] 語彙ブラウザで `party` に respelling 行が表示される
- [ ] 語彙ブラウザで `winter` に respelling 行が表示されない

### 検証

- [ ] `validate_i18n.py` / `gen_audit_docs.py` が ERROR なしで完走
- [ ] `encodeCheck()` の diff がゼロ

### ドキュメント

- [ ] `docs/DESIGN.md` の変更履歴に Phase 2b（respelling 3,007語マージ）を追記
- [ ] `docs/SPECIFICATION.md` の変更履歴に同様に追記

---

## 6. 触ってはいけない箇所（Do Not Touch）

| 箇所 | 理由 |
|---|---|
| `index.html` の表示ロジック本体 | Phase 1 で実装済み。データマージのみで機能するはずなので、コード変更は原則不要（B-3 の不具合対応を除く） |
| `ipa` / `rp_ipa` | phonemic、絶対不変 |
| `ipa_actual_ga` / `ipa_actual_rp` | Phase 2a 対応済み範囲。今回変更しない |
| `winter` / `twenty` / `ninety` 含む52語の `respell_*` | Phase 2a の TTS 判定確定後まで追加しない |
| `tools/review-vntv.html` | Phase 2a で作成済みの内部ツール。本 Phase では触らない |

---

## 7. 実装レポート提出物

完了時、以下を Naoya 経由で Claude に渡すこと:

1. **実装レポート MD** (`report-phase2b-respell-merge.md`)
   - マージ実行結果
   - DoD チェック結果
   - B-1/B-2 の表示確認結果（スクリーンショット歓迎）
   - もし Task B-3 で不具合が見つかった場合はその内容と対応状況

---

## 8. Phase 2a との合流予定（本指示書スコープ外・参考情報）

Naoya が `tools/review-vntv.html` で52語の TTS 判定を完了したら:

1. Claude が残り52語の `ipa_actual_ga` を確定
2. 同時に、それら52語の `respell_ga` / `respell_rp` も `generate_respelling.py` を再実行して生成（スクリプト自体の変更は不要、`ipa_actual_ga` が埋まれば自動的に `phase2b_respell_pending.json` の内容が `phase2b_respell_draft.json` 相当に昇格する）
3. 残り52語ぶんの小規模マージ指示書を別途作成

これにより、全3,059語の narrow IPA + respelling 対応が完了します。

---

## 開発ワークフロー確認

```
Cursor（3,007語マージ + 表示確認 + 検証スクリプト再実行）
  ↓ 実装レポート MD
Naoya（テスト・git push）
  ↓ 実装レポートを新チャットに添付
Claude（Phase 2a 残り52語の確定 → Phase 2b 完了 → 全体完了報告）
```
