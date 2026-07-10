# Cursor 指示書 — Phase R (Repair): RP パイプライン品質修正

- 対象リポジトリ: `nkhippo/English-Pronunciation-Trainer`
- 想定 branch: `fix/phase-r-rp-pipeline-repair`
- 優先度: 高（本番 wordlist の rp_ipa 品質バグ **82語 + 9語**、および分類器の dead-code / composite gap 修正）
- 前提: Phase 2 M2 完了時点（wordlist 5,397語、`ga_rp_same` 全語付与済み）
- 段取り: **R1 → R2 → R3 → R4 の順で phase 単位に commit**。各 phase の checkpoint で expected output を必ず確認してから次へ進む。

---

## 0. サマリ（何をやるか）

Opus 3スクリプトレビュー（`scripts/ga_to_rp.py` / `scripts/gen_neighbors.py` / `scripts/gen_ga_rp_same.py`）で以下が判明した。追加で `scripts/gen_rp_ipa.py` の SYSTEM_PROMPT にも同種のルール欠陥が見つかり、**過去に Claude API または batch 生成で作られた rp_ipa データが 91 語 実際に破損**している。

| Phase | 目的 | 変更ファイル | 影響語数 |
|---|---|---|---:|
| **R1** | 分類器 dead-code 3件を活性化・composite ギャップ修正 | `scripts/gen_ga_rp_same.py` | reason のみ再分類（フラグ変化なし） |
| **R2** | RP 生成プロンプト修正 + happY 過剰伸長 **82語** + 表記ゆれ **9語** を一括是正 | `scripts/gen_rp_ipa.py`, `scripts/fix_happy_i.py`（新規）, wordlist | rp_ipa 修正 91語 |
| **R3** | `ga_to_rp.py` fallback の最小修正 + BATH_WORDS 統一 | `scripts/ga_to_rp.py`, `scripts/phonology_lexicon.py`（新規） | fallback は未使用のため実データ変化なし |
| **R4** | 派生データ再生成・diff 検証・ドキュメント更新 | `wordlist_*.json`, `docs/*` | neighbors・ga_rp_same 再生成 |

---

## 1. 事前準備

### 1-1. ブランチ作成とバックアップ

```bash
git checkout -b fix/phase-r-rp-pipeline-repair
cp wordlist_GA_a1a2_plus_phonics.json /tmp/wordlist_pre_phase_r.json
cp data/pipeline/ga_rp_same_report.json /tmp/ga_rp_same_report_pre_phase_r.json
```

### 1-2. 現状の基準値取得（後で diff 検証に使う）

```bash
python3 -c "
import json
from collections import Counter
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
print('total:', len(d))
print('ga_rp_same True:', sum(1 for e in d if e.get('ga_rp_same') is True))
print('ga_rp_same False:', sum(1 for e in d if e.get('ga_rp_same') is False))
c = Counter(e.get('ga_rp_same_reason') for e in d)
for r, n in c.most_common():
    print(f'  {r:25s} {n:5d}')
" | tee /tmp/wordlist_baseline.txt
```

**期待値（Phase R 開始前）:**
```
total: 5397
ga_rp_same True: 2669
ga_rp_same False: 2728
  identical                  1508
  rhoticity                   798
  structural_other            630
  length_marking_only         574
  ga_allophony                529
  dress_notation_only         446
  goat_vowel                  287
  lot_vowel                   258
  weak_vowel                  102
  trap_bath                    72
  notation_composite           69
  rhotic_vowel_notation        37
  stress_marking_only          35
  stress_placement             30
  yod                          22
```

これと異なる値が出た場合は wordlist が既に変わっているので、指示書を書き直す必要がある。**そのまま Cursor が続行してはならない**（作業を停止して Claude に報告）。

---

# Phase R1 — 分類器 dead-code 修正 + composite ギャップ埋め

## R1-1. 目的

`scripts/gen_ga_rp_same.py` の分類ロジックに以下 **3件の dead code / 分類ギャップ**があることが Opus レビュー + 実データで確認された:

1. `cot_caught` ステップは Step 4 (LOT) で `ɑ→ɒ` 置換が先行するため、Step 6 で `ɑ→ɔː` が発火しない → 本番 wordlist に該当語 **0件**
2. `square_near_cure` ステップは Step 2 の `apply_rhoticity` に `ɛr→eə` / `ɪr→ɪə` / `ʊr→ʊə` が含まれるため、Step 7 に到達しない → **0件**
3. BATH + 第1音節弱化の合成語（`advantage`, `advancement`）が `composite_structural` に到達せず `structural_other` に落ちる → **2件**

修正後は `structural_other`（630件）の一部が正しいカテゴリに移動する。**`ga_rp_same` の True/False フラグは変化しない**（reason のみ変化）。

## R1-2. 変更内容

**ファイル:** `scripts/gen_ga_rp_same.py`

### (a) `cot_caught` ステップの基点を `ga_lot` → `ga_goat` に変更

**現状（該当箇所探索: "cot_caught" 検索）:**
```python
    # 6. CLOTH-LOT / COT-CAUGHT split (GA merges ɔ/ɑ; RP separates)
    #    GA "bought" /bɑt/ vs RP /bɔːt/: GA ɑ → RP ɔː
    ga_cot = ga_lot.replace("ɑ", "ɔː")
    if notation_norm(ga_cot) == rp_norm:
        return "cot_caught"
```

**変更後:**
```python
    # 6. CLOTH-LOT / COT-CAUGHT split (GA merges ɔ/ɑ; RP separates)
    #    GA "bought" /bɑt/ vs RP /bɔːt/: GA ɑ → RP ɔː
    #    Base on ga_goat (before LOT replacement) so ɑ is still available.
    ga_cot = ga_goat.replace("ɑ", "ɔː")
    if notation_norm(ga_cot) == rp_norm:
        return "cot_caught"
```

### (b) `RHOTICITY_MAP` から `ɛr` / `ɪr` / `ʊr` を除去し、`square_near_cure` ステップを活かす

**現状:**
```python
RHOTICITY_MAP = [
    ("aʊr", "aʊə"), ("aɪr", "aɪə"), ("ɔɪr", "ɔɪə"), ("eɪr", "eɪə"),
    ("ɑr", "ɑː"),   ("ɔr", "ɔː"),   ("ɪr", "ɪə"),   ("ɛr", "eə"),
    ("ʊr", "ʊə"),
]
```

**変更後（SQUARE/NEAR/CURE の3パターンを取り出し）:**
```python
RHOTICITY_MAP = [
    ("aʊr", "aʊə"), ("aɪr", "aɪə"), ("ɔɪr", "ɔɪə"), ("eɪr", "eɪə"),
    ("ɑr", "ɑː"),   ("ɔr", "ɔː"),
]
```

これで純粋 SQUARE/NEAR/CURE 差の語（`bear`, `dear`, `poor` 等）は Step 2 rhoticity で `rhoticity` を返さず、Step 7 `square_near_cure` に落ちる。

**注意:** Step 8 の `apply_rhoticity + goat + lot + bath` composite 判定は現状の `apply_rhoticity` に依存しているため、その挙動が変わる。以下 (d) で対処。

### (c) `apply_rhoticity` の下流（Step 2）を変更しない代わりに、`square_near_cure` の Step 7 を先に判定するように順序変更

上記 (b) だけだと `bear` 型の語が正しく square_near_cure に落ちるが、SQUARE + 他の何かの composite（例: 存在するとしたら `bearing` の -ing 部分）が正しく処理されない。より安全な代替として、**Step 7 を Step 2 の直後（Step 3 以降より前）に移動**する方針を採る。

**Step 順序（変更後）:**
1. stress_placement 判定
2. yod 判定
3. **新: square_near_cure 判定（ɛr/ɪr/ʊr の r-color 変換のみ試す）** ← ここに移動
4. rhoticity 判定（RHOTICITY_MAP は上記 (b) の縮小版）
5. goat
6. lot
7. trap_bath
8. cot_caught（(a) の修正済み）
9. composite_structural
10. weak_vowel
11. structural_other

**実装:** 現状の Step 7（`ga_sq = expand_ga_rhotic_vowels(...).replace(...)`）を **Step 2 の直後**に移動する。移動後は `apply_rhoticity` に SQUARE/NEAR/CURE 変換が入っていないため（上記 (b) 実施済）、独立性が担保される。

### (d) BATH + 第1音節弱化の合成語対応（`composite_structural` 強化）

**現状（Step 8 相当:）:**
```python
    # 8. Composite structural (rhoticity + BATH / rhoticity + LOT etc.)
    ga_combo = apply_rhoticity(ga_inner)
    ga_combo = ga_combo.replace("oʊ", "əʊ").replace("ɑ", "ɒ")
    if word.lower() in BATH_WORDS:
        ga_combo = ga_combo.replace("æ", "ɑː")
    if notation_norm(ga_combo) == rp_norm:
        return "composite_structural"
```

**変更後（第1音節 æ → ə 変換を試す試行を追加）:**
```python
    # 8. Composite structural (rhoticity + BATH / rhoticity + LOT etc.)
    ga_combo = apply_rhoticity(ga_inner)
    ga_combo = ga_combo.replace("oʊ", "əʊ").replace("ɑ", "ɒ")
    if word.lower() in BATH_WORDS:
        ga_combo = ga_combo.replace("æ", "ɑː")
    if notation_norm(ga_combo) == rp_norm:
        return "composite_structural"

    # 8b. Composite structural v2: BATH middle-syllable + first-syllable weak-vowel
    #     (advantage: GA /ædˈvæntɪdʒ/, RP /ədˈvɑːntɪdʒ/ — first æ→ə, second æ→ɑː)
    if word.lower() in BATH_WORDS and "æ" in ga_inner:
        # Try replacing only the first æ with ə (first-syllable weak)
        ga_combo_v2 = apply_rhoticity(ga_inner).replace("oʊ", "əʊ").replace("ɑ", "ɒ")
        # Replace only the first occurrence of æ with ə, then all remaining æ with ɑː
        ga_combo_v2 = ga_combo_v2.replace("æ", "ə", 1).replace("æ", "ɑː")
        if notation_norm(ga_combo_v2) == rp_norm:
            return "composite_structural"
```

## R1-3. 実行と検証

```bash
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
```

**期待される出力（stdout の Reason 分布に注目）:**

修正前と比べて以下が変わる:
- `structural_other`: 630 → 概ね **628**（減少、-2 = advantage/advancement）
- `composite_structural`: 0 → **2**（新規、advantage/advancement）
- `square_near_cure`: 0 → **一定数**（既存 `rhoticity` の一部が移動。bear/dear/poor 系）
- `rhoticity`: 798 → **減少**（square_near_cure に移った分だけ）
- `cot_caught`: 0 → **0 または少数**（現状データではほぼ発火しないと予想。1〜3件以内なら想定内）

**必ず確認する不変条件:**

```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
same_t = sum(1 for e in d if e.get('ga_rp_same') is True)
same_f = sum(1 for e in d if e.get('ga_rp_same') is False)
print(f'ga_rp_same True: {same_t}  (expected 2669)')
print(f'ga_rp_same False: {same_f}  (expected 2728)')
assert same_t == 2669, f'True flag count changed: {same_t}'
assert same_f == 2728, f'False flag count changed: {same_f}'
print('OK: flag counts unchanged')
"
```

**期待値:**
```
ga_rp_same True: 2669  (expected 2669)
ga_rp_same False: 2728  (expected 2728)
OK: flag counts unchanged
```

**フラグ数が変わった場合は R1-2 の変更に誤りがあるので rollback してから Claude に報告:**
```bash
git checkout -- wordlist_GA_a1a2_plus_phonics.json data/pipeline/ga_rp_same_report.json
```

### R1-4. R1 サンプル動作確認

```bash
python3 -c "
import sys; sys.path.insert(0, 'scripts')
from gen_ga_rp_same import classify

# 期待挙動チェック
tests = [
    ('bear',      '/bɛr/',        '/beə/',       'square_near_cure'),
    ('dear',      '/dɪr/',        '/dɪə/',       'square_near_cure'),
    ('poor',      '/pʊr/',        '/pʊə/',       'square_near_cure'),
    ('advantage', '/ædˈvæntɪdʒ/', '/ədˈvɑːntɪdʒ/','composite_structural'),
    ('after',     '/ˈæftɚ/',      '/ˈɑːftə/',    'trap_bath'),  # unchanged
    ('goat',      '/ɡoʊt/',       '/ɡəʊt/',      'goat_vowel'), # unchanged
]
for w, ga, rp, exp in tests:
    got = classify(w, ga, rp)[1]
    mark = 'OK' if got == exp else 'FAIL'
    print(f'{mark}: {w} -> {got} (expected {exp})')
"
```

**期待:** 全て `OK`。

## R1-5. コミット

```bash
git add scripts/gen_ga_rp_same.py \
        wordlist_GA_a1a2_plus_phonics.json \
        data/connected_speech.json \
        data/weak_forms.json \
        data/pipeline/ga_rp_same_report.json
git commit -m "fix(classifier): activate cot_caught/square_near_cure dead branches + BATH+weak composite"
```

---

# Phase R2 — RP 生成プロンプト修正 + happY / /ɪ/ 表記の一括是正

## R2-1. 目的

`scripts/gen_rp_ipa.py` の SYSTEM_PROMPT ルール #4 に `GA /i/ → RP /iː/` という無条件伸長ルールがあり、**word-final 弱形の happY 母音（-y, -ly, -ry, -ery, -ty, ...）に例外指定がない**。この結果、本番 wordlist の rp_ipa に以下 2 種類の破損が確認された:

1. **happY 過剰伸長: 82語** — 語末弱形 /i/ が /iː/ と誤って伸長されている
2. **表記ゆれ /ɪ/: 9語** — F-cluster（`factory, fairy, family, february, fifty, foggy, forty, friday, funny`）で古い Jones 式表記 `/ɪ/` になっている

Naoya の app は modern RP (Wells LPD 準拠) をターゲットとしているため、happY 位置は `/i/`（tense short）に統一する。

## R2-2. 変更内容 (a): `scripts/gen_rp_ipa.py` SYSTEM_PROMPT 更新

**現状（該当箇所を探索: `GA /i/        → RP /iː/`）:**
```python
4. Vowel inventory differences from GA:
   GA /ɑ/ (hot)  → RP /ɒ/      (short rounded o)
   GA /i/        → RP /iː/
   GA /u/        → RP /uː/
   GA /ɔ/        → RP /ɔː/
   ...
```

**変更後:**
```python
4. Vowel inventory differences from GA:
   GA /ɑ/ (hot)  → RP /ɒ/      (short rounded o)
   GA /i/ (FLEECE, stressed)       → RP /iː/   (only when stressed)
   GA /i/ (happY, word-final unstressed) → RP /i/  (short tense, MODERN RP)
     e.g. happy /ˈhæpi/, city /ˈsɪti/, family /ˈfæməli/, dictionary /ˈdɪkʃənəri/
     Do NOT use /iː/ or /ɪ/ for word-final happY. Always /i/.
   GA /u/ (GOOSE, stressed)        → RP /uː/
   GA /u/ (word-final unstressed)  → RP /u/   (short, rare — e.g. into /ˈɪntu/)
   GA /ɔ/        → RP /ɔː/
   ...
```

さらに、SYSTEM_PROMPT の末尾 rule #12 の前に以下を追加:

```python
   Note on "happY" rule:
   - "happy" ending words (-y, -ly, -ry, -ery, -ity, -ary, -ory, -ey, -e in "-phe")
     end in short /i/ in modern RP, never /iː/ or /ɪ/.
   - Exceptions: "-ee" endings (employee, chimpanzee, referee, guarantee, absentee,
     addressee, interviewee), compounds with "-free" (carefree, duty-free, tax-free),
     and stressed monosyllables (be, he, she, key, tree, see, sea) keep /iː/.
```

## R2-3. 変更内容 (b): 修正スクリプト `scripts/fix_happy_i.py` 新規作成

**ファイル:** `scripts/fix_happy_i.py`

```python
#!/usr/bin/env python3
"""
fix_happy_i.py — Correct rp_ipa for word-final happY position.

Two corrections:
  (1) rp_ipa ending in /iː/ where GA ends in /i/ and final syllable is unstressed
      → change trailing /iː/ to /i/ (modern RP happY convention)
  (2) rp_ipa ending in /ɪ/ (older Jones convention) → change to /i/

Orthographic filter: words ending in "ee" (employee, chimpanzee, carefree, ...)
are EXCLUDED because "-ee" is a Latin/French borrowing that retains length
even when prosodically weak.

Also updates data/connected_speech.json and data/weak_forms.json (should be no-op
but check for safety).
"""
from __future__ import annotations
import json
import sys
from pathlib import Path

_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
import paths

VOWELS = set("iɪɛæʌɑɔʊuəɝɚ")
MULTI = ("tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ")


def is_happy_i_candidate(word: str, ga_ipa: str, rp_ipa: str) -> tuple[bool, str]:
    """Return (should_fix, reason). Applies both mechanical and orthographic filters."""
    if not ga_ipa or not rp_ipa:
        return False, "missing"

    # Orthographic exclusion: -ee and -free compounds keep /iː/
    wl = word.lower()
    if wl.endswith("ee") or wl.endswith("free"):
        return False, "ee_ending"

    ga_inner = ga_ipa.strip("/")
    rp_inner = rp_ipa.strip("/")

    # Case 1: /iː/ over-lengthening
    if rp_inner.endswith("iː") and ga_inner.endswith("i"):
        # Find LAST stress marker of any kind (both ˈ and ˌ)
        last_stress = max(ga_inner.rfind("ˈ"), ga_inner.rfind("ˌ"))
        if last_stress == -1:
            return False, "monosyllabic_no_stress"
        # Between last stress marker and final /i/, must have at least one other vowel
        tail = ga_inner[last_stress + 1:]
        body = tail[:-1]  # exclude the trailing 'i'
        has_other_vowel = any(ch in VOWELS for ch in body) or any(
            body[k:k+2] in MULTI for k in range(len(body))
        )
        if has_other_vowel:
            return True, "happy_i_over_lengthened"
        else:
            return False, "stressed_fleece"

    # Case 2: /ɪ/ notation drift
    if rp_inner.endswith("ɪ") and ga_inner.endswith("i"):
        # Same orthographic + stress filter
        last_stress = max(ga_inner.rfind("ˈ"), ga_inner.rfind("ˌ"))
        if last_stress == -1:
            return False, "monosyllabic_no_stress"
        tail = ga_inner[last_stress + 1:]
        body = tail[:-1]
        has_other_vowel = any(ch in VOWELS for ch in body) or any(
            body[k:k+2] in MULTI for k in range(len(body))
        )
        if has_other_vowel:
            return True, "jones_notation_drift"
        else:
            return False, "stressed_fleece"

    return False, "no_match"


def fix_entry(entry: dict) -> tuple[bool, str, str, str]:
    """Return (was_fixed, reason, old_rp, new_rp)."""
    word = entry.get("w", "")
    ga_ipa = entry.get("ipa", "")
    rp_ipa = entry.get("rp_ipa", "")
    should, reason = is_happy_i_candidate(word, ga_ipa, rp_ipa)
    if not should:
        return False, reason, rp_ipa, rp_ipa
    rp_inner = rp_ipa.strip("/")
    if rp_inner.endswith("iː"):
        new_inner = rp_inner[:-2] + "i"
    elif rp_inner.endswith("ɪ"):
        new_inner = rp_inner[:-1] + "i"
    else:
        return False, "unexpected_ending", rp_ipa, rp_ipa
    new_rp = "/" + new_inner + "/"
    entry["rp_ipa"] = new_rp
    return True, reason, rp_ipa, new_rp


def process_file(path: Path, label: str) -> list[tuple[str, str, str, str]]:
    if not path.exists():
        print(f"skip (not found): {path}", file=sys.stderr)
        return []
    with path.open(encoding="utf-8") as f:
        items = json.load(f)
    fixes = []
    for it in items:
        was_fixed, reason, old, new = fix_entry(it)
        if was_fixed:
            fixes.append((it.get("w", ""), reason, old, new))
    if fixes:
        with path.open("w", encoding="utf-8") as f:
            json.dump(items, f, ensure_ascii=False, indent=1)
    print(f"{label}: {len(fixes)} rp_ipa entries corrected")
    return fixes


def main() -> None:
    all_fixes = []
    all_fixes += process_file(paths.WORDLIST, "wordlist")
    all_fixes += process_file(paths.CONNECTED_SPEECH, "connected_speech")
    all_fixes += process_file(paths.WEAK_FORMS, "weak_forms")

    print(f"\n=== TOTAL: {len(all_fixes)} corrections ===")

    # Breakdown by reason
    from collections import Counter
    by_reason = Counter(r for _, r, _, _ in all_fixes)
    for r, n in by_reason.most_common():
        print(f"  {r}: {n}")

    print(f"\n=== Sample of first 10 corrections (for eyeball verification) ===")
    for w, r, old, new in all_fixes[:10]:
        print(f"  {w:20s}  {old:22s} -> {new}   ({r})")

    print(f"\n=== Sample of last 10 corrections ===")
    for w, r, old, new in all_fixes[-10:]:
        print(f"  {w:20s}  {old:22s} -> {new}   ({r})")


if __name__ == "__main__":
    main()
```

## R2-4. 実行と検証

```bash
python3 scripts/fix_happy_i.py
```

**期待される出力:**
```
wordlist: 91 rp_ipa entries corrected
connected_speech: 0 rp_ipa entries corrected
weak_forms: 0 rp_ipa entries corrected

=== TOTAL: 91 corrections ===
  happy_i_over_lengthened: 82
  jones_notation_drift: 9

=== Sample of first 10 corrections (for eyeball verification) ===
  abnormally            /æbˈnɔːməliː/          -> /æbˈnɔːməli/   (happy_i_over_lengthened)
  admiringly            /ædˈmaɪrɪŋliː/         -> /ædˈmaɪrɪŋli/  (happy_i_over_lengthened)
  ...

=== Sample of last 10 corrections ===
  ...
```

**期待値の許容範囲:**
- TOTAL: **91**（82 + 9）
- `happy_i_over_lengthened`: **82**
- `jones_notation_drift`: **9**
- connected_speech / weak_forms は **0**（もし0でなければ Claude に報告）

**カウントが異なる場合の対応:**
- ±3 以内の差異は許容（データ更新の可能性）。差異が大きい場合は `is_happy_i_candidate` のロジックを再検証。
- 差が大きい場合、まず `git checkout -- wordlist_GA_a1a2_plus_phonics.json` で rollback してから Claude に報告。

### R2-5. サンプル目視確認

出力の 10 件サンプルを目視し、以下 3 点を確認:
1. どれも word-final の `iː` または `ɪ` を `i` に置換しているだけ
2. どれも語彙的に自然（audio TTS で「ハピー」「シティ」等の短い i として自然に読める）
3. `-ee` で終わる語が **含まれていない**（employee, chimpanzee, carefree, referee, guarantee, ... のいずれもリストに無いこと）

不自然な変換がある場合は Cursor は先に進まず Claude に報告する。

## R2-6. 分類器再実行

```bash
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
```

**期待される変化:**
- `length_marking_only` が **82件減少** の可能性（happY で `iː` が消え、length only 判定が変わるため。ただしフラグ True → True 内での reason 変化）
- `identical` が **一部増加**（rp_ipa の /iː/ → /i/ で GA と完全一致するようになる語がある）
- `ga_rp_same` **True 数は 82 の一部分だけ増える** — 実際にどれくらい増えるかは事前予測困難

**必ず確認:**
```bash
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
# happy-i 修正後、'iː' で終わる rp_ipa は全て正当なもの（-ee 系）だけになっているはず
suspicious = [e['w'] for e in d if e.get('rp_ipa','').endswith('iː/') and not (e['w'].lower().endswith('ee') or e['w'].lower().endswith('free'))]
# ただし stressed-FLEECE monosyllables/final-stressed polysyllables は残る
# それらは ga_ipa も /iː/ で終わるか、GA が /...ˈi/ で end
for w in suspicious[:20]:
    entry = next(e for e in d if e['w'] == w)
    print(f'  {w:20s} ga={entry[\"ipa\"]:18s} rp={entry[\"rp_ipa\"]}')
print(f'total suspicious remaining (should be legit stressed-final): {len(suspicious)}')
"
```

**期待:** 残るのは全て `be`, `he`, `see`, `agree`, `guarantee`, `cd`, `dvd` 等の legit stressed-final。20語程度以内の想定。

## R2-7. コミット

```bash
git add scripts/gen_rp_ipa.py \
        scripts/fix_happy_i.py \
        wordlist_GA_a1a2_plus_phonics.json \
        data/connected_speech.json \
        data/weak_forms.json \
        data/pipeline/ga_rp_same_report.json
git commit -m "fix(data): correct happY /i/ over-lengthening (82 words) + /ɪ/ notation drift (9 words)

Update gen_rp_ipa.py SYSTEM_PROMPT to prevent regression:
- explicit happY rule (word-final unstressed /i/ stays short /i/)
- explicit -ee exception for Latin/French borrowings (employee, chimpanzee, etc.)

Data repair via scripts/fix_happy_i.py with orthographic + stress-position filter."
```

---

# Phase R3 — `ga_to_rp.py` fallback 最小修正 + BATH_WORDS 統一

## R3-1. 目的

`scripts/ga_to_rp.py` は Phase 2 以降 fallback として使われておらず、`rp_ipa` は Claude batch 同梱方式で生成されている（本番データに `ga_to_rp` の直接寄与は無いと確認済）。ただし将来の retroactive 実行や他ツール連携で使われる可能性があるため、以下の **latent bug** を潰す:

1. `BATH_WORDS` が `gen_ga_rp_same.py` 版と 10 語ずれている（`aunt`, `banana`, `afternoon`, `advantage`, `advance`, `afterwards`, `france`, `french`, `grass`, `can't`, `aren't` が抜けている）
2. PASS 2 の `i → iː` が word-final happY を過剰伸長（`gen_rp_ipa.py` と同種のバグ）
3. PASS 2 の `ɑ → ɒ` が PALM 語群を破壊（`father`, `palm`, `spa`, `drama` 等）
4. yod-insertion 未実装（`new`, `tune`, `duty` 等が RP `/nuː/` になる）

`gen_ga_rp_same.py` と共有できる BATH_WORDS を **共通モジュール**に抽出する。

## R3-2. 変更内容 (a): 共通モジュール新規作成

**ファイル:** `scripts/phonology_lexicon.py`

```python
"""Shared phonological lexicons for GA↔RP pipeline scripts.

Consolidates lists that were previously duplicated in ga_to_rp.py and
gen_ga_rp_same.py to prevent drift.
"""
from __future__ import annotations

# TRAP-BATH split: words where GA /æ/ maps to RP /ɑː/
# Union of prior lists in ga_to_rp.py (22 words) and gen_ga_rp_same.py (32 words),
# plus common B1/B2 additions verified against Wells LPD.
BATH_WORDS_BASE = frozenset({
    # Original ga_to_rp.py list
    "after", "answer", "ask", "bath", "branch", "castle", "chance", "class",
    "dance", "example", "fast", "glass", "graph", "half", "laugh", "last",
    "master", "pass", "past", "path", "plant", "rather", "staff",
    # Extras from gen_ga_rp_same.py
    "aunt", "banana", "afternoon", "advantage", "advance", "afterwards",
    "france", "french", "grass", "can't", "aren't",
    # Additional B1/B2 additions verified against LPD
    "basket", "blast", "broadcast", "cast", "chant", "command", "contrast",
    "craft", "demand", "disaster", "draft", "forecast", "glance", "grasp",
    "mask", "plaster", "sample", "task", "vast",
})


def is_bath_word(word: str) -> bool:
    """Check if a word (or a simple morphological derivative) is BATH-class.

    Handles common English suffixes: -s, -es, -ed, -ing, -er, -est, -ly, -room,
    -work, -most. If the base after suffix stripping is in BATH_WORDS_BASE,
    the derivative is treated as BATH too.
    """
    if not word:
        return False
    wl = word.lower()
    if wl in BATH_WORDS_BASE:
        return True
    # Try stripping common suffixes
    SUFFIXES = ("est", "ing", "ed", "es", "s", "er", "ly", "room", "work", "most")
    for suf in SUFFIXES:
        if wl.endswith(suf) and len(wl) > len(suf) + 2:
            base = wl[:-len(suf)]
            if base in BATH_WORDS_BASE:
                return True
            # Some derivatives require +e (e.g. "asking" -> "ask" not "aski")
            # Already covered above; add explicit -e restoration for -ing/-ed:
            if suf in ("ing", "ed") and (base + "e") in BATH_WORDS_BASE:
                return True
    return False


# PALM lexical set: GA /ɑ/ maps to RP /ɑː/ (not /ɒ/)
# Minimal list of common core PALM words (word-final /ɑ/ + a few pre-C cases).
PALM_WORDS = frozenset({
    "spa", "bra", "pa", "ma", "grandpa", "grandma", "ah",
    "father", "rather",  # note: "rather" is also BATH — overlap OK
    "palm", "calm", "balm", "psalm", "qualm",
    "drama", "llama", "lava", "sonata", "plaza",
})


# Coronal consonants that trigger yod-retention in RP after /uː/
# (GA drops the /j/, RP keeps it)
YOD_CORONALS = frozenset({"t", "d", "n", "s", "z", "l", "θ"})
```

## R3-3. 変更内容 (b): `scripts/ga_to_rp.py` の修正

**修正箇所:** ファイル冒頭に import 追加、`BATH_WORDS` 定数を削除、`ga_to_rp` 関数内で yod-insertion / PALM guard / happy-i skip を追加。

**変更 1: import と定数削除**

現状 (L14-40):
```python
MULTI = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ"]

VOWELS = {
    "i", "ɪ", "ɛ", "æ", "ʌ", "ɑ", "ɔ", "ʊ", "u", "ə", "ɝ", "ɚ",
    "aɪ", "aʊ", "eɪ", "ɔɪ", "oʊ",
}

BATH_WORDS = {
    "after", "answer", "ask", "bath", "branch", "castle", "chance", "class",
    "dance", "example", "fast", "glass", "graph", "half", "laugh", "last",
    "master", "pass", "past", "path", "plant", "rather", "staff",
}
```

変更後:
```python
import sys
from pathlib import Path
_SCRIPTS = Path(__file__).resolve().parent
if str(_SCRIPTS) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS))
from phonology_lexicon import is_bath_word, PALM_WORDS, YOD_CORONALS

MULTI = ["tʃ", "dʒ", "eɪ", "aɪ", "ɔɪ", "oʊ", "aʊ"]

VOWELS = {
    "i", "ɪ", "ɛ", "æ", "ʌ", "ɑ", "ɔ", "ʊ", "u", "ə", "ɝ", "ɚ",
    "aɪ", "aʊ", "eɪ", "ɔɪ", "oʊ",
}

# BATH_WORDS moved to phonology_lexicon.py — use is_bath_word() instead
```

**変更 2: `ga_to_rp` 関数の TRAP-BATH 判定** (L64 付近)

現状:
```python
    if word in BATH_WORDS:
        inner = inner.replace("æ", "ɑː")
```

変更後:
```python
    if is_bath_word(word):
        inner = inner.replace("æ", "ɑː")
```

**変更 3: yod-insertion をトークン化前に追加** (BATH 変換の直後、tokenize の前)

```python
    if is_bath_word(word):
        inner = inner.replace("æ", "ɑː")

    # Yod-insertion: after coronals, GA /u/ → RP /juː/
    # Skip if the coronal is preceded by /s/ (avoids 'stew' -> stjuː ok, but 'super' -> tricky).
    # For fallback simplicity: insert j before every 'u' whose immediately preceding
    # character is a YOD_CORONAL. If word ends in "u" or "ue" orthographically, always
    # try yod. This is heuristic; production data uses Britfone/Claude for accuracy.
    if word.lower() not in PALM_WORDS:  # avoid trigger on unrelated word class
        result = []
        i = 0
        while i < len(inner):
            ch = inner[i]
            if ch == "u" and i > 0 and inner[i - 1] in YOD_CORONALS:
                # avoid j+u+r sequences that already exist
                if not (i > 1 and inner[i - 2] == "j"):
                    result.append("j")
            result.append(ch)
            i += 1
        inner = "".join(result)
```

**変更 4: PALM guard を PASS 2 の `ɑ → ɒ` 分岐に追加**

現状 (L145 付近):
```python
        elif t == "ɑ" and nx != "ː":
            final.append("ɒ")
```

変更後:
```python
        elif t == "ɑ" and nx != "ː":
            # PALM guard: word-final /ɑ/ (no consonant after) OR PALM_WORDS entries
            # should map to /ɑː/, not /ɒ/
            is_word_final = (nx is None)
            is_palm = word.lower() in PALM_WORDS
            if is_word_final or is_palm:
                final.append("ɑː")
            else:
                final.append("ɒ")
```

**変更 5: happy-i / happy-u skip を PASS 2 に追加**

現状 (L143 付近):
```python
        elif t == "i":
            final.append("iː")
        elif t == "u":
            final.append("uː")
```

変更後:
```python
        elif t == "i":
            # happY guard: word-final unstressed /i/ stays short /i/ in modern RP
            # Skip lengthening if this is the last vowel token and not directly
            # preceded by a stress marker (handled below by prev-token check).
            is_last = (j == m - 1)
            prev_is_stress = (j > 0 and pass1[j - 1] in ("ˈ", "ˌ"))
            if is_last and not prev_is_stress:
                final.append("i")
            else:
                final.append("iː")
        elif t == "u":
            # happY-analogue for /u/: word-final unstressed stays short (rare)
            is_last = (j == m - 1)
            prev_is_stress = (j > 0 and pass1[j - 1] in ("ˈ", "ˌ"))
            if is_last and not prev_is_stress:
                final.append("u")
            else:
                final.append("uː")
```

## R3-4. 変更内容 (c): `scripts/gen_ga_rp_same.py` の BATH_WORDS を共通モジュールに切替

**修正箇所:** BATH_WORDS 定数削除 + import 追加、`word.lower() in BATH_WORDS` を `is_bath_word(word)` に置換。

現状:
```python
BATH_WORDS = {
    "after","answer","ask","bath","branch","castle","chance","class",
    "dance","example","fast","glass","graph","half","laugh","last",
    "master","pass","past","path","plant","rather","staff","aunt",
    "banana","can't","aren't","afternoon","france","french","grass",
    "advantage","advance","afterwards",
}
```

変更後:
```python
# BATH_WORDS moved to phonology_lexicon.py
import sys
from pathlib import Path
_SCRIPTS_DIR = Path(__file__).resolve().parent
if str(_SCRIPTS_DIR) not in sys.path:
    sys.path.insert(0, str(_SCRIPTS_DIR))
from phonology_lexicon import is_bath_word
```

同じファイル内で `word.lower() in BATH_WORDS` を検索し、**すべて** `is_bath_word(word)` に置換（4箇所ある想定）。

## R3-5. 実行と検証

```bash
# 1. ga_to_rp.py の unit-level 動作確認
python3 -c "
import sys; sys.path.insert(0, 'scripts')
from ga_to_rp import ga_to_rp

cases = [
    # PALM guard
    ('father', '/ˈfɑðɚ/', '/ˈfɑːðə/'),
    ('palm',   '/pɑm/',   '/pɑːm/'),
    ('spa',    '/spɑ/',   '/spɑː/'),
    ('drama',  '/ˈdrɑmə/', '/ˈdrɑːmə/'),
    # LOT (unchanged behavior)
    ('box',    '/bɑks/',  '/bɒks/'),
    ('cop',    '/kɑp/',   '/kɒp/'),
    # BATH derivatives now covered
    ('asking',   '/ˈæskɪŋ/',   '/ˈɑːskɪŋ/'),
    ('classroom','/ˈklæsˌrum/','/ˈklɑːsˌruːm/'),
    ('answers',  '/ˈænsɚz/',   '/ˈɑːnsəz/'),
    # yod-insertion
    ('new',    '/nu/',    '/njuː/'),
    ('tune',   '/tun/',   '/tjuːn/'),
    # happY guard
    ('very',   '/ˈvɛri/', '/ˈveri/'),
    ('story',  '/ˈstɔri/','/ˈstɔːri/'),
    ('carry',  '/ˈkæri/', '/ˈkæri/'),
]
ok = fail = 0
for w, ga, expected in cases:
    got = ga_to_rp(w, ga)
    if got == expected:
        ok += 1
        print(f'OK: {w:15s} -> {got}')
    else:
        fail += 1
        print(f'FAIL: {w:15s} -> {got}  (expected {expected})')
print(f'\n{ok} passed, {fail} failed')
"
```

**期待:** 全て OK（fail=0）。

**もし FAIL がある場合**、これは **latent bug 修正**なので実データには影響しないが、修正コードの品質問題なので Claude に報告。

```bash
# 2. 分類器のフラグ不変性確認（Phase R2 の値を基準）
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
python3 -c "
import json
d = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
same_t = sum(1 for e in d if e.get('ga_rp_same') is True)
print(f'ga_rp_same True after R3: {same_t}')
# R2 直後の値と一致すべき (BATH_WORDS 拡張で fallback 判定が変わる可能性あり)
"
```

**期待:** R2 直後の値と概ね一致（±10 以内）。BATH_WORDS の拡張で `structural_other` の一部が `trap_bath` や `composite_structural` に移動する可能性はあるが、フラグ True/False の割合は大きく変わらないはず。

## R3-6. コミット

```bash
git add scripts/phonology_lexicon.py \
        scripts/ga_to_rp.py \
        scripts/gen_ga_rp_same.py \
        wordlist_GA_a1a2_plus_phonics.json \
        data/connected_speech.json \
        data/weak_forms.json \
        data/pipeline/ga_rp_same_report.json
git commit -m "refactor(phonology): unify BATH_WORDS + fix ga_to_rp.py latent bugs (PALM, happY, yod)

- New scripts/phonology_lexicon.py consolidates BATH_WORDS_BASE, PALM_WORDS, YOD_CORONALS
- is_bath_word() handles common suffix derivatives
- ga_to_rp.py: PALM guard, yod-insertion, happy-i/u short-final skip
- gen_ga_rp_same.py: uses is_bath_word() (behavior unchanged for base words)"
```

---

# Phase R4 — 派生データ再生成 + diff 検証 + ドキュメント

## R4-1. 目的

`rp_ipa` が 91 語変わったので、以下を再生成する:
1. `neighbors`（GA IPA ベースなので影響なしのはずだが hygiene で再走査）
2. `ga_rp_same_report.json` の最終版
3. `docs/PURPOSE.md` の changelog 追加

## R4-2. 実行

```bash
# 1. neighbors 再生成
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py

# 2. ga_rp_same 最終確定
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json

# 3. GAS 用語彙リスト再エクスポート
python3 scripts/export_batch_words.py
```

## R4-3. Diff 検証レポート生成

```bash
python3 -c "
import json
before = json.load(open('/tmp/wordlist_pre_phase_r.json'))
after = json.load(open('wordlist_GA_a1a2_plus_phonics.json'))
by_before = {e['w']: e for e in before}

rp_changed = []
flag_flipped_t2f = []
flag_flipped_f2t = []
reason_changed = []

for e_a in after:
    w = e_a['w']
    e_b = by_before.get(w)
    if not e_b:
        continue
    if e_a.get('rp_ipa') != e_b.get('rp_ipa'):
        rp_changed.append((w, e_b.get('rp_ipa'), e_a.get('rp_ipa')))
    if e_b.get('ga_rp_same') is True and e_a.get('ga_rp_same') is False:
        flag_flipped_t2f.append(w)
    if e_b.get('ga_rp_same') is False and e_a.get('ga_rp_same') is True:
        flag_flipped_f2t.append(w)
    if e_b.get('ga_rp_same_reason') != e_a.get('ga_rp_same_reason'):
        reason_changed.append((w, e_b.get('ga_rp_same_reason'), e_a.get('ga_rp_same_reason')))

print(f'rp_ipa changed: {len(rp_changed)}  (expected ~91)')
print(f'ga_rp_same flag flipped True->False: {len(flag_flipped_t2f)}  (expected 0)')
print(f'ga_rp_same flag flipped False->True: {len(flag_flipped_f2t)}  (expected small, from happy-i corrections making GA==RP)')
print(f'ga_rp_same_reason changed (total, includes flag flips): {len(reason_changed)}')
print()
print('=== First 5 flag flips F->T (should be legit, e.g. words like carry where GA=/ˈkæri/ RP=/ˈkæri/ now match) ===')
for w in flag_flipped_f2t[:5]:
    e_a = next(e for e in after if e['w'] == w)
    e_b = by_before[w]
    print(f'  {w:20s} ga={e_a[\"ipa\"]:18s} rp_before={e_b[\"rp_ipa\"]:22s} rp_after={e_a[\"rp_ipa\"]}')
"
```

**期待される数値レンジ:**
- `rp_ipa changed`: **91±3**
- `ga_rp_same flag flipped True->False`: **0**（フラグを弱くする変化は今回のスコープ外）
- `ga_rp_same flag flipped False->True`: **数十〜100 程度**（happy-i 修正で GA と RP が完全一致する語が現れる）
- `ga_rp_same_reason changed`: **100〜300**（R1 の dead-code 修正効果も含む）

**フラグ True → False の flip が発生した場合、それは想定外バグ**なので Cursor は commit せず Claude に報告。

## R4-4. ドキュメント更新

### (a) `docs/PURPOSE.md` の changelog に追加

```markdown
| 2026-07-XX | v3.21 | Phase R (Repair): 分類器 dead-code 3件活性化（`cot_caught`, `square_near_cure`, BATH+weak composite）、`gen_rp_ipa.py` SYSTEM_PROMPT の happY ルール追加、rp_ipa 91語（happY 過剰伸長 82 + `/ɪ/` 表記ゆれ 9）を一括是正、`scripts/phonology_lexicon.py` に BATH_WORDS/PALM_WORDS を統合、`ga_to_rp.py` fallback の PALM/happY/yod latent bug 修正。 |
```

（バージョン番号は現行の PURPOSE.md 最新版 +0.01。R4 commit 時に確認）

### (b) `docs/REPOSITORY-STRUCTURE.md` の `scripts/` セクションに追記

```markdown
| `scripts/phonology_lexicon.py` | 共有語彙リスト（BATH_WORDS, PALM_WORDS, YOD_CORONALS）— `ga_to_rp.py` と `gen_ga_rp_same.py` から import |
| `scripts/fix_happy_i.py` | rp_ipa の happY 位置 `/iː/`/`/ɪ/` → `/i/` 是正スクリプト（Phase R2 で1回実行済み。将来のバッチ追加時にも実行推奨） |
```

### (c) 実装レポート `docs/cursor/reports/cursor-implementation-report-phase-r.md` 新規作成

以下テンプレートで:

```markdown
# Cursor 実装レポート — Phase R (RP パイプライン品質修正)

- 実施日: 2026-07-XX
- 指示書: `docs/cursor/instructions/cursor-instructions-phase-r-rp-pipeline-repair.md`
- ブランチ: `fix/phase-r-rp-pipeline-repair`

## 1. 実施内容

### Phase R1: 分類器 dead-code 修正
- `cot_caught`: `ga_lot` → `ga_goat` 参照に変更
- `square_near_cure`: `RHOTICITY_MAP` から SQUARE/NEAR/CURE 3パターンを除去、Step 順序変更
- `composite_structural v2`: BATH + 第1音節弱化対応

### Phase R2: RP 生成プロンプト修正 + データ是正
- `gen_rp_ipa.py` SYSTEM_PROMPT に happY 例外を明示
- `fix_happy_i.py` 新規作成
- rp_ipa 91語を修正

### Phase R3: `ga_to_rp.py` latent bug 修正 + 語彙リスト統一
- `phonology_lexicon.py` 新規作成
- `ga_to_rp.py`: PALM guard, yod-insertion, happy-i/u skip
- `gen_ga_rp_same.py`: `is_bath_word()` に切替

### Phase R4: 派生データ再生成
- `neighbors` 再生成
- `ga_rp_same` 最終確定
- `docs/PURPOSE.md`, `docs/REPOSITORY-STRUCTURE.md` 更新

## 2. Diff 検証結果

（R4-3 の出力を貼る）

## 3. 各 phase の commit 一覧

（`git log --oneline main..HEAD` の出力を貼る）
```

## R4-5. 最終コミット

```bash
git add docs/PURPOSE.md \
        docs/REPOSITORY-STRUCTURE.md \
        docs/cursor/reports/cursor-implementation-report-phase-r.md \
        data/derived/wordlist_with_neighbors.json \
        data/derived/wordlist_with_neighbors_slim.json \
        docs/reference/neighbors_report.md \
        gas/BatchWords.gs \
        wordlist_GA_a1a2_plus_phonics.json
git commit -m "docs(phase-r): update changelog, repository structure, implementation report

Regenerate neighbors and ga_rp_same_report after happY corrections."
```

---

## テスト項目（Phase 全体）

| # | 項目 | 期待 |
|---|---|---|
| 1 | `gen_ga_rp_same.py` 実行後、`ga_rp_same=True` 総数が Phase R2 前と比べて同等〜微増 | Phase R1 後は不変、Phase R2 後に数十〜100増 |
| 2 | `cot_caught` / `square_near_cure` reason が発火する語がある（もしくは意図通り 0） | 0〜数件 / 1〜数十件 |
| 3 | `bear`, `dear`, `poor` の reason が `square_near_cure` | ✓ |
| 4 | `advantage`, `advancement` の reason が `composite_structural` | ✓ |
| 5 | `city`, `family`, `happy` の rp_ipa が `/ˈsɪti/`, `/ˈfæməli/`, `/ˈhæpi/`（happY ならず） | ✓ |
| 6 | `employee`, `chimpanzee`, `carefree` の rp_ipa は変更なし（末尾 `/iː/` 保持） | ✓ |
| 7 | `factory`, `family`, `friday` の rp_ipa 末尾が `/i/`（`/ɪ/` から変わる） | ✓ |
| 8 | `ga_to_rp('father', '/ˈfɑðɚ/')` → `/ˈfɑːðə/` | ✓ |
| 9 | `ga_to_rp('new', '/nu/')` → `/njuː/` | ✓ |
| 10 | `ga_to_rp('very', '/ˈvɛri/')` → `/ˈveri/` | ✓ |
| 11 | `neighbors` の zero率が Phase R 前と大きく変わらない（5% 前後） | ±1% 以内 |

---

## Q&A（Cursor 実装時の想定質問）

### Q1: Phase R1 の `RHOTICITY_MAP` 変更で、`bear` のような単純 SQUARE 語が今まで `rhoticity` reason だったのが `square_near_cure` に変わる。既に UI や下流ロジックがこの reason 文字列を hardcode で参照している場合、影響はないか？

**A:** `ga_rp_same_reason` は監査用データ層のみで、UI からは参照されない（実装レポート `cursor-implementation-report-ga-rp-same-flag.md` §6 に「UI 表示なし」と明記）。よって影響なし。

### Q2: Phase R2 の `fix_happy_i.py` は、`connected_speech.json` と `weak_forms.json` も対象にしているが、期待値は「0 corrections」となっている。なぜ両方を走査する必要があるのか？

**A:** 防御的走査。連結句や弱形の rp_ipa にも同じバグが混入していないかを確認するため。実際に修正が入らない前提だが、もし入ったら想定外なので Claude に報告。

### Q3: Phase R3 の `ga_to_rp.py` は現在 fallback として実データに使われていないと聞いた。それなら修正する意義は？

**A:** 将来 retroactive 実行や他ツール連携で使われる可能性、および `phonology_lexicon.py` の共通化で `gen_ga_rp_same.py` との drift を防ぐため。修正コストが小さいので今のうちに揃える。

### Q4: `phonology_lexicon.py` の `PALM_WORDS` が最小限（12語程度）だが、他にも PALM 語彙は多いのでは？

**A:** はい。ただし fallback は本番未使用なので、`father`, `palm`, `drama` 等の高頻度 PALM 語のみ含めた minimal set。将来 fallback を復活させる場合は Wells LPD 準拠で拡張する。

### Q5: Phase R2 で `ga_rp_same_reason` の分布が大きく変わる。事前の分布と比較する自動テストはあるか？

**A:** R4-3 の diff 検証スクリプトが flip 数と reason 変化数を出す。これが「フラグ True→False flip = 0」を満たせば OK。

### Q6: `is_bath_word("classroom")` は True になる（"class" + "room" 派生）が、`ga_to_rp.py` の BATH 変換で `/ˈklæsˌrum/` → `/ˈklɑːsˌruːm/` になる。もし `classroom` が意外なところで `/ɑː/` の位置を誤っている可能性は？

**A:** BATH 変換は「word 全体で `æ → ɑː`」なので、`classroom` は `/ˈklæsˌrum/` 全体で `æ` を `ɑː` に置換 → `/ˈklɑːsˌruːm/`（`u → uː` は既存 rule のまま）。実データにはこの変換が既に反映済み（Britfone または Claude 由来）。fallback を通した場合の挙動を R3-5 テストで確認。

### Q7: `-ee` filter が正しく効いているかを確認するテストは？

**A:** R2-4 で `is_happy_i_candidate('employee', '/ɛmˈplɔɪi/', '/ɛmˈplɔɪiː/')` が `(False, 'ee_ending')` を返すはず。テスト項目 #6 で確認できる。追加で unit test を書くなら以下:

```python
import sys; sys.path.insert(0, 'scripts')
from fix_happy_i import is_happy_i_candidate
for w, ga, rp, exp in [
    ('employee',   '/ɛmˈplɔɪi/',   '/ɛmˈplɔɪiː/', False),
    ('chimpanzee', '/tʃɪmˈpænzi/', '/tʃɪmˈpænziː/', False),
    ('carefree',   '/ˈkɛrˌfri/',   '/ˈkeəˌfriː/',  False),
    ('happy',      '/ˈhæpi/',      '/ˈhæpiː/',    True),
    ('family',     '/ˈfæməli/',    '/ˈfæməliː/',  True),
    ('agree',      '/əˈɡri/',      '/əˈɡriː/',    False),  # stressed final
]:
    got = is_happy_i_candidate(w, ga, rp)[0]
    print(f"{'OK' if got == exp else 'FAIL'}: {w} -> {got} (expected {exp})")
```

### Q8: Phase R4 で `neighbors` 再生成が推奨されているが、`rp_ipa` は neighbors 計算に使われないなら本当に再生成する必要があるか？

**A:** 厳密には不要だが、pipeline 全体を清潔に保つため hygiene で走らせる。実行時間は数秒〜数十秒程度。もし時間節約優先なら skip 可能（その場合は R4 コミットから `wordlist_with_neighbors*.json` と `neighbors_report.md` を除外）。

### Q9: Phase R2 で TTS への影響はないか？

**A:** `rp_ipa` が変わっても、TTS text は既存の `?weak=` パラメータや orthography ベースで生成されており、rp_ipa フィールドは UI 表示専用。Google Drive audio cache のキーは SHA-256 で orthography ベースなので、rp_ipa 変更でキャッシュ invalidation は発生しない。**TTS 品質への影響なし**。

### Q10: 修正が完了したら Naoya に何を報告すればよいか？

**A:** 以下 3 点を含めて実装レポートに書く:
1. 各 phase の diff サマリ（rp_ipa 変更数、フラグ変化数、reason 分布変化）
2. `docs/pipeline/ga_rp_same_report.json` の変更前後 diff（`by_reason` の各カウント）
3. R2-4 のサンプル 10件（happy-i 修正例）と R3-5 のテスト結果

---

## スコープ外（明示的にやらないこと）

- **`neighbors_rp` の新規計算** — 従来通り GA neighbors を RP でも流用（`docs/reference/rp-neighbors-priority-decision.md` の判断維持）
- **`ipa_actual_ga` / `ipa_actual_rp` の追加補完** — 別タスクで別途対応
- **`gen_neighbors.py` の relative-ratio 化** — Opus レビューで提案あったが今回は保留（近傍品質の実測が別途必要）
- **`structural_other` の残り 628 語の人手再分類** — 別タスク
- **UI に `ga_rp_same_reason` を表示する** — 監査用データ層のまま
- **`ga_to_rp.py` を production パイプラインに再導入する** — fallback は現状通り使わない
- **PALM_WORDS の完全リスト化** — minimal set のまま。将来 fallback 復活時に対応

---

## 全 phase の commit 概要（想定）

```
fix(classifier): activate cot_caught/square_near_cure dead branches + BATH+weak composite
fix(data): correct happY /i/ over-lengthening (82 words) + /ɪ/ notation drift (9 words)
refactor(phonology): unify BATH_WORDS + fix ga_to_rp.py latent bugs (PALM, happY, yod)
docs(phase-r): update changelog, repository structure, implementation report
```

## 変更ファイル（想定サマリ）

**新規:**
- `scripts/phonology_lexicon.py`
- `scripts/fix_happy_i.py`
- `docs/cursor/reports/cursor-implementation-report-phase-r.md`

**変更:**
- `scripts/gen_ga_rp_same.py`
- `scripts/gen_rp_ipa.py`
- `scripts/ga_to_rp.py`
- `wordlist_GA_a1a2_plus_phonics.json`（91語 rp_ipa 修正 + ga_rp_same/reason 再付与）
- `data/connected_speech.json`（ga_rp_same_reason 再付与のみ）
- `data/weak_forms.json`（同上）
- `data/pipeline/ga_rp_same_report.json`
- `data/derived/wordlist_with_neighbors.json`
- `data/derived/wordlist_with_neighbors_slim.json`
- `docs/reference/neighbors_report.md`
- `docs/PURPOSE.md`
- `docs/REPOSITORY-STRUCTURE.md`
- `gas/BatchWords.gs`（export_batch_words で更新）
