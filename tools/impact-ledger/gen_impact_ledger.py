"""Generate docs/impact-ledger.json from a static analysis of src/index.template.html.

Purpose (Issue F / EPIC #169):
    Answer "if I edit a common symbol, what feature areas break?" cheaply, without
    re-reading the whole 5,400-line source file every time. This is a *heuristic*
    static analyzer (regex + line-based scoping), not a full JS parser/AST. It is
    designed to be good enough for the impact-analysis halt protocol documented in
    docs/impact-ledger.md, not a compiler-grade call graph.

Algorithm
---------
1. Locate the main app `<script>` block in src/index.template.html (the block with
   the most `function ` declarations; the tiny Vercel-analytics IIFE script is
   ignored because it defines no named functions).
2. Extract every named function definition in that block via regex:
     - `function name(...)` / `async function name(...)` (any indent, so nested
       helpers like `wordWorker` inside `prefetchAccentBodies` are captured too)
     - `const name = (...) => ...` / `const name = async (...) => ...` at column 0
       (covers the two utility one-liners `$` and `show`)
   Each symbol records its 1-indexed line number in the full file.
3. Build a line -> enclosing top-level function map. Because (with two documented
   exceptions) every function in this file is declared at column 0, "which top
   level function is line N inside of" can be answered by scanning column-0 lines
   in order: a column-0 `function name(` line opens a context; the next non-blank
   column-0 line (typically a lone `}`) closes it. Lines outside any function
   context (module-scope init code) are labelled the `infra` pseudo-area.
4. For every extracted symbol, count textual call sites `symbol(` elsewhere in the
   main script (excluding the definition line itself), resolve each call site's
   enclosing function name, and classify that *caller* into one of 13 areas via
   `classify_area()` below (an explicit seed dict grounded in docs/repo-map.md's
   retired JS map, plus prefix/substring fallback rules, plus an `infra` default).
   The union of caller areas becomes `caller_areas`.
5. `scope` is derived purely from `len(caller_areas)`:
     - library: 5+ areas (e.g. `t`, used by virtually every screen)
     - shared:  2-4 areas (e.g. `activeIpa`, used by several drill modes + reveal)
     - primary: 0-1 areas (e.g. `vocabDisplayGloss`, used only inside 3b)
6. `feature_ids` = the subset of `caller_areas` that map to a *registered* feature
   ID (docs/_conventions.md's frozen 12-ID registry). The `infra` area (and any
   as-yet-unregistered concept such as onboarding/"3g") never contributes a
   feature ID — this keeps every emitted feature_id inside the frozen registry.
7. `depends_on` = other tracked symbols called from within this symbol's own body
   (best-effort forward dependency list; may be incomplete for callbacks passed
   by reference rather than called by name).
8. SEED_OVERRIDES hard-codes the handful of symbols the Issue explicitly names as
   "known common" ground truth (currently: `activeIpa`), because the enclosing-
   function heuristic in step 3-4 only sees *direct* textual callers and misses
   indirect fan-out through shared render helpers. Everything else is fully
   computed — no other symbol is hand-tuned.

Idempotency: the script only reads src/index.template.html and writes a
deterministic, symbol-sorted JSON array; running it twice on unchanged source
produces byte-identical output.

Usage:
    python3 scripts/gen_impact_ledger.py            # writes docs/impact-ledger.json
    python3 scripts/gen_impact_ledger.py --check     # exits 1 if output would change
"""
from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent))
from paths import ROOT, DOCS  # noqa: E402

SRC = ROOT / "src" / "index.template.html"
OUT = DOCS / "impact-ledger.json"

# ---------------------------------------------------------------------------
# Area vocabulary (Issue F "エリア定義")
# ---------------------------------------------------------------------------
# Canonical order also controls the sort order of caller_areas/feature_ids in
# the output, so it intentionally matches the Issue's own example ordering
# (decode, encode, study, connected, ..., reveal, summary, top, infra).
AREA_ORDER = [
    "decode", "encode", "study", "connected", "profile", "vocab", "picker",
    "progress", "about", "reveal", "summary", "top", "infra",
]

# area -> registered feature ID (docs/_conventions.md frozen 12-ID registry).
# `infra` has no entry: it is cross-cutting infrastructure (init/i18n/tts/accent/
# session-flow/onboarding), not a single feature. Any concept not yet in the
# frozen registry (e.g. onboarding ~= unregistered "3g") is also routed to
# `infra` so the generator never emits an unregistered feature_id.
AREA_TO_FEATURE = {
    "decode": "2a",
    "encode": "2b",
    "study": "2c",
    "connected": "2d",
    "profile": "3a",
    "vocab": "3b",
    "picker": "3c",
    "progress": "3d",
    "about": "3h",
    "reveal": "reveal",
    "summary": "summary",
    "top": "1a",
}

# ---------------------------------------------------------------------------
# Seed map (Issue F §実装範囲-1): exact-name area assignments grounded in the
# JS map that used to live in docs/repo-map.md (now replaced by this ledger).
# Kept here, not regenerated, because a name-based classifier alone cannot
# reliably distinguish e.g. `reveal`-only helpers from generic infra helpers.
# ---------------------------------------------------------------------------
EXACT_AREA: dict[str, str] = {
    # 初期化
    "initApp": "infra", "loadWordlist": "infra", "loadConnected": "infra",
    "loadWeak": "infra", "loadGuide": "infra", "dataReady": "infra",
    "parseHash": "infra", "navigate": "infra", "onRouteChange": "infra",
    "show": "infra",
    # モード制御 / セッションフロー（features/_common.md 横断の共通挙動）
    "startSession": "infra", "initSessionQueue": "infra",
    "sessionFinished": "infra", "goToTop": "top",
    "showSetupOrPractice": "infra", "showReflection": "summary",
    "openExitConfirm": "infra", "updateSetupFields": "profile",
    "setSetupVisible": "profile",
    # 判定・解答処理
    "decodeCheck": "decode", "encodeCheck": "encode", "spellCheck": "infra",
    "reveal": "reveal", "nextCard": "infra", "renderCard": "infra",
    "renderDecode": "decode", "renderEncode": "encode",
    "renderSummary": "summary", "modeBMcqPick": "study",
    "modeBDictCheck": "study", "buildMcqChoices": "study",
    # TTS
    "speak": "infra", "fetchAudioFromGas": "infra",
    "fetchAudioFromGasAccent": "infra", "fetchUrlsFromGas": "infra",
    "prefetchSessionAudio": "infra", "prefetchItemsAudio": "infra",
    "gasWarm": "infra", "hasCachedAudioFor": "infra",
    "refreshAllSpeakers": "infra", "ttsAccent": "infra",
    # i18n / 言語切替
    "setLang": "infra", "applyI18n": "infra", "loadLocale": "infra",
    "t": "infra", "wordGloss": "infra", "applyI18nVocab": "vocab",
    # アクセント切替
    "setAccent": "infra", "activeIpa": "infra", "altIpa": "infra",
    "activeNarrowIpa": "infra", "hasNarrowDifference": "infra",
    "otherAccent": "infra", "renderAltAccentLine": "infra",
    "refreshAltAccentSpeakers": "infra", "formatSameAccentIpa": "infra",
    "altAccentValue": "infra",
    # 語彙ブラウザ / IPA 記号ピッカー
    "openVocab": "vocab", "closeVocab": "vocab",
    "setExclusivePage": "infra", "leaveExclusiveRoute": "infra",
    "showVocabView": "vocab", "renderVocabWords": "vocab",
    "renderVocabPhrases": "vocab", "renderVocabTab": "vocab",
    "buildVocabLetterBar": "vocab", "jumpVocabLetter": "vocab",
    "vocabDisplayGloss": "vocab",
    "renderSymbolPicker": "picker", "showSymbolPickerView": "picker",
    "symbolChartGroups": "picker", "renderSymbolResults": "picker",
    # 学習状況
    "showProgressPage": "progress", "renderProgressPage": "progress",
    "computeDrillProgress": "progress", "openDrillProfile": "progress",
    # PC ヘッダー 3 パターン
    "isPcLayout": "infra", "updateTaskHeader": "infra",
    "syncPcSupportChrome": "infra", "applyModeBStudyTwoPane": "study",
    # オンボーディング（frozen 12-ID レジストリ未登録の概念のため infra 扱い）
    "showOnboarding": "infra", "hideOnboarding": "infra",
    "reopenOnboarding": "infra", "maybeShowOnboarding": "infra",
    "completeOnboarding": "infra", "isOnboardingCompleted": "infra",
    "renderOnboardingSlide": "infra", "applyOnboardingI18n": "infra",
    # Reveal
    "renderWordPronDetails": "reveal", "refreshRevealIpa": "reveal",
    "bindRevealCheckClicks": "reveal", "refreshRevealChecksPanel": "reveal",
    "renderInfo": "reveal", "bindIpaSegments": "reveal",
    "showPurposeHome": "top",
    # 進捗管理
    "loadChecks": "progress", "saveChecks": "progress",
    "getCheckCount": "progress", "setCheckCount": "progress",
    "toggleCheckSlot": "progress", "frequencyWeight": "progress",
    "weightedShuffle": "progress", "progressChecksHtml": "progress",
    "refreshChecksInDom": "progress",
    # その他
    "openGuide": "about", "closeGuide": "about", "renderGuide": "about",
    "openSettings": "infra", "closeSettings": "infra",
    "buildKeyboard": "encode", "renderConnectedPrompt": "connected",
    "modeBPool": "study", "buildModeBQueue": "study",
    "renderModeBStudy": "study",
}

# Fallback prefix/substring rules (Issue F §実装範囲-1), applied in order, for
# any symbol not present in EXACT_AREA above (mostly locally-scoped helpers
# added after the last docs/repo-map.md JS map snapshot).
PREFIX_RULES: list[tuple[re.Pattern, str]] = [
    (re.compile(r"^vocabIpa"), "picker"),
    (re.compile(r"^symbol", re.I), "picker"),
    (re.compile(r"Symbol"), "picker"),
    (re.compile(r"^vocab", re.I), "vocab"),
    (re.compile(r"Vocab"), "vocab"),
    (re.compile(r"^progress", re.I), "progress"),
    (re.compile(r"^computeDrill"), "progress"),
    (re.compile(r"^cs[A-Z]"), "connected"),
    (re.compile(r"[Cc]onnected"), "connected"),
    (re.compile(r"decode", re.I), "decode"),
    (re.compile(r"encode", re.I), "encode"),
    (re.compile(r"[Mm]ode[Bb]"), "study"),
    (re.compile(r"[Oo]nboarding"), "infra"),
    (re.compile(r"[Rr]eveal"), "reveal"),
    (re.compile(r"[Ss]ummary"), "summary"),
    (re.compile(r"[Ss]etup"), "profile"),
    (re.compile(r"[Pp]rofile"), "profile"),
    (re.compile(r"[Gg]uide"), "about"),
    (re.compile(r"[Aa]bout"), "about"),
]


def classify_area(name: str) -> str:
    """Best-effort area classification for a function *acting as a caller*."""
    if name in EXACT_AREA:
        return EXACT_AREA[name]
    for pattern, area in PREFIX_RULES:
        if pattern.search(name):
            return area
    return "infra"


# ---------------------------------------------------------------------------
# Known-common seed overrides (Issue F §実装範囲-1 "既知共通リスト").
# `activeIpa` is hard-coded because its real fan-out reaches decode/encode/
# study/connected/reveal indirectly (through shared render/TTS helpers) in a
# way the direct-caller heuristic above cannot see; the Issue body gives this
# exact caller_areas/feature_ids set as the grounded example for the schema.
# ---------------------------------------------------------------------------
SEED_OVERRIDES: dict[str, dict] = {
    "activeIpa": {
        "feature_ids": ["2a", "2b", "2c", "2d", "reveal"],
        "scope": "shared",
        "caller_areas": ["decode", "encode", "study", "connected", "reveal"],
    },
}

FUNC_DEF_RE = re.compile(
    r"^(?P<indent>[ \t]*)(?:async\s+)?function\s+(?P<name>[A-Za-z_$][A-Za-z0-9_$]*)\s*\("
)
ARROW_CONST_RE = re.compile(
    r"^const\s+(?P<name>[A-Za-z_$][A-Za-z0-9_$]*)\s*=\s*(?:async\s*)?"
    r"(?:\([^)]*\)|[A-Za-z_$][A-Za-z0-9_$]*)\s*=>"
)
SCRIPT_OPEN_RE = re.compile(r"^\s*<script(\s[^>]*)?>\s*$")
SCRIPT_CLOSE_RE = re.compile(r"^\s*</script>\s*$")


def find_main_script_range(lines: list[str]) -> tuple[int, int]:
    """Return (start_line, end_line), 1-indexed inclusive, of the app <script>
    block (the one with the most `function ` declarations)."""
    blocks: list[tuple[int, int]] = []
    open_line = None
    for i, line in enumerate(lines, start=1):
        if open_line is None and SCRIPT_OPEN_RE.match(line):
            open_line = i
        elif open_line is not None and SCRIPT_CLOSE_RE.match(line):
            blocks.append((open_line + 1, i - 1))
            open_line = None
    if not blocks:
        raise RuntimeError("no <script> blocks found in src/index.template.html")
    best = max(
        blocks,
        key=lambda rng: sum(
            1 for ln in lines[rng[0] - 1:rng[1]] if FUNC_DEF_RE.match(ln)
        ),
    )
    return best


def build_enclosing_map(lines: list[str], start: int, end: int) -> dict[int, str | None]:
    """line number -> enclosing top-level function name (or None = module scope).

    Column-0 heuristic: a column-0 `function name(` line opens a context; the
    next non-blank column-0 line (almost always a lone closing `}`) closes it.
    Nested functions (defined at indent > 0) fall inside their parent's range
    and are intentionally NOT treated as separate contexts here — a call site
    inside a nested helper is attributed to the enclosing top-level function's
    area, which is what we want for feature-impact purposes.
    """
    enclosing: dict[int, str | None] = {}
    current: str | None = None
    for i in range(start, end + 1):
        line = lines[i - 1]
        if line.strip() == "":
            enclosing[i] = current
            continue
        is_col0 = not line[:1].isspace()
        if is_col0:
            m = FUNC_DEF_RE.match(line)
            if m and m.group("indent") == "":
                current = m.group("name")
                enclosing[i] = current
                continue
            # Any other column-0 line ends the previous function context.
            enclosing[i] = None
            current = None
            continue
        enclosing[i] = current
    return enclosing


def extract_symbols(lines: list[str], start: int, end: int) -> list[tuple[str, int]]:
    symbols: list[tuple[str, int]] = []
    seen: set[str] = set()
    for i in range(start, end + 1):
        line = lines[i - 1]
        m = FUNC_DEF_RE.match(line)
        if m:
            name = m.group("name")
            if name not in seen:
                symbols.append((name, i))
                seen.add(name)
            continue
        m2 = ARROW_CONST_RE.match(line)
        if m2:
            name = m2.group("name")
            if name not in seen:
                symbols.append((name, i))
                seen.add(name)
    return symbols


def find_call_lines(text_lines: list[str], start: int, end: int, name: str, def_line: int) -> list[int]:
    pattern = re.compile(r"(?<![A-Za-z0-9_$])" + re.escape(name) + r"\s*\(")
    hits = []
    for i in range(start, end + 1):
        if i == def_line:
            continue
        if pattern.search(text_lines[i - 1]):
            hits.append(i)
    return hits


def sort_areas(areas: set[str]) -> list[str]:
    return [a for a in AREA_ORDER if a in areas]


def build_ledger() -> list[dict]:
    text = SRC.read_text(encoding="utf-8")
    lines = text.split("\n")
    start, end = find_main_script_range(lines)
    symbols = extract_symbols(lines, start, end)
    enclosing = build_enclosing_map(lines, start, end)
    symbol_names = {name for name, _ in symbols}

    entries = []
    for name, line in symbols:
        call_lines = find_call_lines(lines, start, end, name, line)
        areas: set[str] = set()
        for cl in call_lines:
            caller = enclosing.get(cl)
            areas.add(classify_area(caller) if caller else "infra")
        if not areas:
            # Never called by name (e.g. only reachable via HTML event wiring
            # by reference) — fall back to the symbol's own classified area
            # so caller_areas is never empty.
            areas.add(classify_area(name))
        caller_areas = sort_areas(areas)

        # depends_on: other tracked symbols invoked from within this symbol's
        # own body (best-effort forward dependency list).
        body_lines = [ln for ln, fn in enclosing.items() if fn == name and ln != line]
        depends_on: set[str] = set()
        if body_lines:
            body_start, body_end = min(body_lines), max(body_lines)
            for other in symbol_names:
                if other == name:
                    continue
                other_pattern = re.compile(r"(?<![A-Za-z0-9_$])" + re.escape(other) + r"\s*\(")
                for i in range(body_start, body_end + 1):
                    if other_pattern.search(lines[i - 1]):
                        depends_on.add(other)
                        break

        n = len(caller_areas)
        scope = "library" if n >= 5 else ("shared" if n >= 2 else "primary")
        feature_ids = [AREA_TO_FEATURE[a] for a in caller_areas if a in AREA_TO_FEATURE]

        entry = {
            "symbol": name,
            "line": line,
            "feature_ids": feature_ids,
            "scope": scope,
            "caller_areas": caller_areas,
            "depends_on": sorted(depends_on),
        }
        if name in SEED_OVERRIDES:
            entry.update(SEED_OVERRIDES[name])
        entries.append(entry)

    entries.sort(key=lambda e: e["symbol"])
    return entries


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("--check", action="store_true", help="exit 1 if output would change")
    args = parser.parse_args()

    ledger = build_ledger()
    new_text = json.dumps(ledger, indent=2, ensure_ascii=False) + "\n"

    if args.check:
        old_text = OUT.read_text(encoding="utf-8") if OUT.exists() else None
        if old_text != new_text:
            print(f"docs/impact-ledger.json is out of date (run: python3 scripts/gen_impact_ledger.py)")
            return 1
        print("docs/impact-ledger.json is up to date.")
        return 0

    OUT.write_text(new_text, encoding="utf-8")
    print(f"Wrote {len(ledger)} symbols to {OUT.relative_to(ROOT)}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
