# Cursor Implementation Report — Phase 2b Respelling Merge

- Date: 2026-07-02
- Branch: `main`
- Scope: Merge rule-generated `respell_ga` / `respell_rp` for 3,007 words

## 1) Data merge (Task A)

Added `scripts/merge_respelling.py` and executed:

```bash
python3 scripts/merge_respelling.py
```

Result:

```text
merged 3007 / 3007 entries
cleared respell on 3 pending-review words
```

Verification:

```bash
python3 -c "import json; d=json.load(open('wordlist_GA_a1a2_plus_phonics.json')); lookup={w['w']:w for w in d}; has=[w for w in d if w.get('respell_ga')]; print(f'respell_ga を持つ語の総数: {len(has)}'); print('party:', lookup['party']['respell_ga'], '/', lookup['party']['respell_rp']); print('winter:', lookup['winter'].get('respell_ga')); print('visual:', lookup['visual']['respell_ga'], '/', lookup['visual']['respell_rp'])"
```

Observed:

```text
respell_ga を持つ語の総数: 3007
party: PAR-dee / PAH-tee
winter: None
visual: VI-zhuh-wuhl / VI-zhoo-uhl
```

### Pending 52 words handling

- `phase2b_respell_pending.json` の 52 語は draft に含まれないため、新規マージ対象外。
- pilot 由来の暫定 respelling が残っていた 3 語（`winter`, `twenty`, `ninety`）をスクリプトで `respell_ga` / `respell_rp` 両方除去。
- 実装時に `or` 短絡評価で `respell_rp` が残るバグを発見し、pop 処理を分離して修正。

### Non-touch fields confirmed

Compared `ipa`, `rp_ipa`, `ipa_actual_ga`, `ipa_actual_rp` values against `HEAD`:

```text
phonemic/narrow value changes: 0
```

## 2) Display logic check (Task B)

No `index.html` changes (Phase 1 logic reused).

Code-path verification:

- `activeRespell(c)` returns `null` when `respell_ga` / `respell_rp` absent → `#rRespell` stays `hidden`
- Vocabulary browser `respellLine` renders only when `respellGa || respellRp`

Expected UI behavior (manual check by Naoya):

| Word | GA Reveal respelling | RP Reveal respelling | Vocab browser respell line |
|---|---|---|---|
| `party` | `PAR-dee` | `PAH-tee` | shown |
| `visual` | `VI-zhuh-wuhl` | `VI-zhoo-uhl` | shown |
| `winter` | hidden | hidden | hidden |

## 3) Verification (Task C)

Executed:

```bash
python3 tools/validate_i18n.py
python3 tools/gen_audit_docs.py
git diff index.html | rg "encodeCheck|function encodeCheck"
```

Results:

- `validate_i18n.py`: ERROR なし（WARN 1件: 既知 `fil.json` 同値2キー）
- `gen_audit_docs.py`: `docs/i18n-audit.md`, `docs/gloss-flags.md` regenerated
- `encodeCheck` diff: no output（ロジック変更なし）

## 4) Documentation updates

- `docs/DESIGN.md`: Phase 2b merge policy + status row
- `docs/SPECIFICATION.md`: change history entry

## 5) DoD check

- [x] `scripts/merge_respelling.py` created
- [x] `merged 3007 / 3007 entries` (no WARN)
- [x] `respell_ga` count = 3,007
- [x] 52 pending words have no `respell_ga` / `respell_rp` (including `winter`, `twenty`, `ninety`)
- [x] `ipa` / `rp_ipa` / `ipa_actual_*` values unchanged
- [x] Display logic unchanged; code paths support merged data
- [x] `validate_i18n.py` / `gen_audit_docs.py` pass without ERROR
- [x] `encodeCheck` diff zero
- [x] `docs/DESIGN.md` / `docs/SPECIFICATION.md` updated

## 6) Remaining handoff

- Naoya: manual UI spot-check (`party`, `visual`, `winter`) on GitHub Pages
- Phase 2a: complete 52-word VntV TTS review via `tools/review-vntv.html`
- Claude: after VntV JSON + remaining `ipa_actual_ga` confirmation, generate and merge final 52-word respelling batch
