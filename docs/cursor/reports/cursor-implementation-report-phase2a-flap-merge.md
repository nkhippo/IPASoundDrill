---
id: pj-2026-07-02-be2a
aliases:
- pj-2026-07-02-be2a
title: Cursor Implementation Report — Phase 2a Flap Merge
created: '2026-07-02'
---

# Cursor Implementation Report — Phase 2a Flap Merge

- Date: 2026-07-02
- Branch: `main`
- Scope:
  - Phase2a flap candidates (186 words) merge
  - VntV review tool for 52 words
  - Tokenize verification script + manual test checklist

## 1) Data merge (Task A)

Added `scripts/merge_flap_candidates.py` and executed:

```bash
python3 scripts/merge_flap_candidates.py
```

Result:

```text
merged 186 / 186 entries

corrected 2 pre-existing values:
  middle: /ˈmɪɾl̩/ -> /ˈmɪdl̩/
  thirty: /ˈθɝɾi/ -> /ˈθɝˌɾi/
```

Verification:

```bash
python3 -c "import json; d=json.load(open('wordlist_GA_a1a2_plus_phonics.json')); lookup={w['w']:w for w in d}; has=[w for w in d if w.get('ipa_actual_ga')]; print(f'ipa_actual_ga を持つ語の総数: {len(has)}'); print('middle:', lookup['middle']['ipa_actual_ga']); print('thirty:', lookup['thirty']['ipa_actual_ga']); print('party:', lookup['party']['ipa_actual_ga'])"
```

Observed:

```text
ipa_actual_ga を持つ語の総数: 189
middle: /ˈmɪdl̩/
thirty: /ˈθɝˌɾi/
party: /ˈpɑrɾi/
```

Note:
- 指示書の期待値（192）は「pilot 30語すべてに `ipa_actual_ga` がある」前提。
- 実データでは pilot 内に `ipa_actual_ga` null の語が3件（`night`, `stop`, `think`）あるため、最終総数は **189** となる。
- 重複語数（pilot × phase2a）は指示どおり24件。

## 2) VntV review tool (Task B)

Added:
- `tools/review-vntv.html`
- `tools/phase2a_review_needed.json` (copied from phase2a source)

Implemented features:
- 52語一覧（word + phonemic IPA）
- GA TTS再生ボタン（existing GAS endpoint with `?word=<w>&accent=ga`）
- 判定入力:
  - nasal: `kept | deleted | unknown`
  - consonant: `flap | original | unclear`
  - note: free text
- localStorage autosave (`vntv_review_v1`)
- progress counter (`x/52 completed`)
- JSON export button

Export format:

```json
[
  { "w": "winter", "nasal": "deleted", "consonant": "flap", "note": "" }
]
```

How to use:
1. Terminal でプロジェクトルートへ移動
2. `python3 -m http.server 8000`
3. ブラウザで [http://localhost:8000/tools/review-vntv.html](http://localhost:8000/tools/review-vntv.html) を開く
4. 52語判定後に「結果をエクスポート」で JSON 保存

(`file://` 直開きだと `fetch("phase2a_review_needed.json")` がブロックされるため簡易サーバー推奨)

## 3) Verification (Task C)

Executed:

```bash
python3 scripts/verify_tokenize_narrow.py
python3 tools/validate_i18n.py
python3 tools/gen_audit_docs.py
git diff index.html | rg "encodeCheck|function encodeCheck"
```

Results:
- `verify_tokenize_narrow.py`: `narrow entries checked: 189`, `tokenize failures: 0`
- `validate_i18n.py`: ERRORなし（WARN 1件: `fil.json` の既知同値2キー）
- `gen_audit_docs.py`: `docs/i18n-audit.md`, `docs/gloss-flags.md` regenerated
- `encodeCheck` diff: no output（ロジック変更なし）

## 4) Manual test checklist (Task D)

Added:
- `docs/testing/phase2a-manual-test-checklist.md`

Included sample coverage:
- `party`, `body`, `bottle`, `gentle`, `button`, `garden`, `stop`, `middle`, `thirty`, RP `party`
- Phase 1 の T-1〜T-7 相当手順を sample-based で記載

## 5) Documentation updates

Updated:
- `docs/DESIGN.md`
  - Phase 2a merge policy section added (186 overwrite strategy, non-touch fields)
  - Implementation status updated with Phase 2a row
- `docs/SPECIFICATION.md`
  - Change history entry added for Phase 2a

## 6) DoD check

- [x] `scripts/merge_flap_candidates.py` created
- [x] merge result `186/186`
- [x] corrected includes `middle`, `thirty`
- [x] `ipa_actual_rp` / `respell_*` / `ipa` / `rp_ipa` untouched by merge script
- [x] `tools/review-vntv.html` + localStorage + export + progress implemented
- [x] `validate_i18n.py` / `gen_audit_docs.py` completed without ERROR
- [x] `verify_tokenize_narrow` added; all narrow entries tokenize successfully
- [x] `docs/testing/phase2a-manual-test-checklist.md` created
- [x] `docs/DESIGN.md` / `docs/SPECIFICATION.md` updated

## 7) Remaining handoff for next chat

- Naoya runs `tools/review-vntv.html`, reviews 52 words by ear, exports JSON.
- Attach exported JSON in next chat for finalizing remaining Phase 2a review-needed words.
