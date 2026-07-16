---
id: pj-2026-07-02-91b0
aliases:
- pj-2026-07-02-91b0
title: 'Cursor 作業指示書 — Phase 2 完了: 残り52語の最終マージ'
created: '2026-07-02'
---
# Cursor 作業指示書 — Phase 2 完了: 残り52語の最終マージ

**作成日:** 2026-07-02
**担当:** Cursor
**依頼者:** Claude
**前提:** Naoya が `tools/review-vntv.html` で52語の TTS 判定を完了（`phase2a_vntv_review_result.json`）
**添付データ:** `phase2a_final_candidates.json`（52語の narrow IPA 確定結果）、`phase2b_respell_final_52.json`（同52語の respelling）

---

## 0. 判定結果サマリ

Naoya の実音声確認の結果、**52語すべてが「nasal=kept（n保持）、consonant=original（フラップなし）」** と判定されました。つまりこのアプリの TTS は、`winter`/`under`/`candy` のような VntV 語を **綴り通りの発音（nを保持し、tやdもフラップさせない）** で生成していることが確認できました。

この判定を反映した結果:

| 区分 | 件数 | 説明 |
|---|---|---|
| narrow IPA の追加が不要な語 | 49語 | phonemic と narrow が完全一致するため、`ipa_actual_ga` は追加しない（`stop`/`night` と同じ扱い） |
| narrow IPA の追加が必要な語 | **3語** | `granddaughter`, `independence`, `underwater` — これらは判定対象の nt/nd 位置以外に**別の位置で既にフラップが確定済み**（Phase 2a 初回マージで対応済み）のため、そちらの値がそのまま有効 |

**重要:** 上記3語は Phase 2a の初回マージ（`cursor-phase2a-flap-merge.md`）で既に正しい値がマージされているはずです。今回の判定はその値を**追加で変更するものではなく、変更不要であることを確認しただけ**です。念のため下記 A-2 で照合してください。

---

## 1. Task A: narrow IPA の確認（変更は基本的に発生しない想定）

### A-1. 確認スクリプト

```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
lookup = {w['w']: w for w in d}
for w in ['granddaughter', 'independence', 'underwater']:
    print(w, lookup[w].get('ipa_actual_ga'))
for w in ['winter', 'candy', 'under', 'twenty', 'ninety']:
    print(w, lookup[w].get('ipa_actual_ga'))  # 期待値: None（narrow不要と確定）
"
```

期待出力:
```
granddaughter /ˈɡrænˌdɔɾɚ/
independence /ˌɪndɪˈpɛndn̩s/
underwater /ˈʌndɚˌwɔɾɚ/
winter None
candy None
under None
twenty None
ninety None
```

もし上記と異なる場合（特に `granddaughter` 等3語が `None` になっている場合）、Phase 2a の初回マージが正しく行われていない可能性があるため、`cursor-phase2a-flap-merge.md` に戻って確認してください。

### A-2. 万一の追加マージが必要な場合

添付の `phase2a_final_candidates.json` には52語全件（`ipa_actual_ga: null` の49語 + 値ありの3語）が含まれています。もし A-1 の確認で不一致が見つかった場合のみ、以下のスクリプトで補正マージしてください（通常は実行不要）:

```python
# scripts/merge_phase2a_final.py
import json, pathlib
WORDLIST = pathlib.Path("wordlist_GA_a1a2_plus_phonics.json")
FINAL = pathlib.Path("phase2a_final_candidates.json")

data = json.loads(WORDLIST.read_text(encoding="utf-8"))
final = json.loads(FINAL.read_text(encoding="utf-8"))
lookup = {w["w"]: w for w in data}

changed = 0
for f in final:
    if f["ipa_actual_ga"] is not None:
        word = f["w"]
        if lookup[word].get("ipa_actual_ga") != f["ipa_actual_ga"]:
            lookup[word]["ipa_actual_ga"] = f["ipa_actual_ga"]
            changed += 1

WORDLIST.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"corrected {changed} entries (expected: 0 if Phase 2a merge was already correct)")
```

---

## 2. Task B: 残り52語ぶんの respelling マージ

### B-1. マージスクリプト

`scripts/merge_respelling.py`（Phase 2b で作成済み）をそのまま再利用できます。添付の `phase2b_respell_final_52.json`（52語）に対して実行してください。

```bash
python3 scripts/merge_respelling.py --draft phase2b_respell_final_52.json
```

もし既存の `merge_respelling.py` がファイル名固定（`phase2b_respell_draft.json`）でハードコードされている場合は、引数対応に軽微修正するか、単純に `phase2b_respell_final_52.json` を一時的に `phase2b_respell_draft.json` にリネームして実行しても構いません。

### B-2. マージ後の検証

```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
lookup = {w['w']: w for w in d}
has_respell = sum(1 for w in d if w.get('respell_ga'))
print(f'respell_ga を持つ語の総数: {has_respell}')
# 期待値: 3,059（全語）
print('winter:', lookup['winter']['respell_ga'], '/', lookup['winter']['respell_rp'])
print('granddaughter:', lookup['granddaughter']['respell_ga'], '/', lookup['granddaughter']['respell_rp'])
"
```

期待出力:
```
respell_ga を持つ語の総数: 3059
winter: WIN-ter / WIN-tuh
granddaughter: GRAN-daw-der / GRAN-daw-tuh
```

---

## 3. Task C: 表示確認

1. GA で `winter` を出題 → Reveal パネル:
   - narrow IPA 行は表示されず、phonemic の `/ˈwɪntɚ/` がそのまま `#rIpa` に表示される（narrow なし語の標準動作）
   - `発音ガイド: WIN-ter` が表示される
   - `辞書表記` 行は非表示（narrow と phonemic が同一のため）
2. GA で `granddaughter` を出題 → Reveal パネル:
   - narrow IPA `/ˈɡrænˌdɔɾɚ/` が表示される
   - `発音ガイド: GRAN-daw-der`
   - `辞書表記: /ˈɡrænˌdɔtɚ/`（narrow と異なるため表示）

---

## 4. Task D: 検証スクリプト再実行

```bash
python3 tools/validate_i18n.py
python3 tools/gen_audit_docs.py
```

ERROR なしを確認。

---

## 5. DoD チェックリスト

- [ ] A-1 の確認で `granddaughter`/`independence`/`underwater` が正しい narrow IPA を持つ
- [ ] A-1 の確認で他49語（`winter`等）が `ipa_actual_ga: null` のままである
- [ ] 52語ぶんの `respell_ga`/`respell_rp` がマージされている
- [ ] `respell_ga` を持つ語の総数が **3,059（全語）** になっている
- [ ] `winter` の Reveal パネルで発音ガイドが表示される
- [ ] `granddaughter` の Reveal パネルで narrow/dictionary両方の行が表示される
- [ ] `validate_i18n.py` / `gen_audit_docs.py` が ERROR なしで完走
- [ ] `encodeCheck()` の diff がゼロ

---

## 6. ドキュメント更新

- `docs/PURPOSE.md` の依存表・変更履歴に「narrow IPA・respelling 全3,059語完了」を追記
- `docs/DESIGN.md` / `docs/SPECIFICATION.md` の変更履歴に Phase 2 完了を追記
- `tools/review-vntv.html` はこれで役目を終えたため、`tools/archive/` に移動するか、README にアーカイブ済みである旨を記載（削除は不要）

---

## 7. 実装レポート提出物

完了時、`report-phase2-final-merge.md` として Naoya 経由で Claude に提出してください。これで **IPA Sound Drill の narrow IPA + respelling 対応が全3,059語で完了**となります。

---

## 開発ワークフロー確認（今回で本タスク完了）

```
Cursor（52語の最終マージ + 表示確認 + 検証）
  ↓ 実装レポート MD
Naoya（最終テスト・git push → GitHub Pages デプロイ）
  ↓ 完了報告
Claude（全体完了確認。必要であれば次のテーマ、例えば連結句・弱形への narrow/respelling 拡張の検討に着手）
```
