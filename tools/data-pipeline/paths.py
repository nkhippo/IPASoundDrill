"""Canonical repository paths for pipeline scripts and tools.

All scripts should resolve paths through this module instead of assuming cwd.
Runtime contract assets (wordlist / connected_speech / weak_forms / guide) live in
packages/core/data/ (see docs/data-contract.md §1). Non-runtime pipeline
intermediates (batches/derived/patches/pipeline/archive) live alongside this file
under tools/data-pipeline/.
"""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

# --- Runtime contract data home (packages/core, shared with future mobile) ---
DATA = ROOT / "packages" / "core" / "data"

# --- Non-runtime pipeline intermediates (this directory) ---
PIPELINE_ROOT = Path(__file__).resolve().parent

# --- Production wordlist (runtime: apps/web fetch of /data/wordlist.json) ---
WORDLIST = DATA / "wordlist.json"
WORDLIST_CSV = ROOT / "apps" / "web" / "wordlist_GA_a1a2_plus_phonics.csv"
WORDLIST_BACKUP_PHASE0A = PIPELINE_ROOT / "archive" / "wordlist_GA_a1a2_plus_phonics.pre-phase0a.json"

# --- Runtime JSON (loaded by apps/web via packages/core/data) ---
CONNECTED_SPEECH = DATA / "connected_speech.json"
WEAK_FORMS = DATA / "weak_forms.json"
GUIDE = DATA / "guide.json"

# --- Batch merge sources (Phase 1 M1–M5, CEFR proposals, etc.) ---
BATCHES = PIPELINE_ROOT / "batches"

# --- IPA / respelling pipeline staging ---
PIPELINE = PIPELINE_ROOT / "pipeline"
FLAP_CANDIDATES = PIPELINE / "phase2a_flap_candidates.json"
REVIEW_NEEDED = PIPELINE / "phase2a_review_needed.json"
R4_REVIEW_LIST_JSON = PIPELINE / "r4_pending_review_list.json"
R4_REVIEW_LIST_CSV = PIPELINE / "r4_pending_review_list.csv"
GA_RP_SAME_REPORT = PIPELINE / "ga_rp_same_report.json"
FINAL_CANDIDATES = PIPELINE / "phase2a_final_candidates.json"
STILL_UNRESOLVED = PIPELINE / "phase2a_still_unresolved.json"
RESPELL_DRAFT = PIPELINE / "phase2b_respell_draft.json"
RESPELL_DRAFT_V2 = PIPELINE / "phase2b_respell_draft_v2.json"
RESPELL_EXCEPTIONS = PIPELINE / "phase2b_respell_exceptions.json"
RESPELL_PENDING = PIPELINE / "phase2b_respell_pending.json"
RESPELL_FINAL_52 = PIPELINE / "phase2b_respell_final_52.json"
PILOT_30 = PIPELINE / "pilot-30words.json"
VNTV_EXPORT = PIPELINE / "review-vntv-export.json"

# --- Generated / intermediate datasets ---
DERIVED = PIPELINE_ROOT / "derived"
ARCHIVE = PIPELINE_ROOT / "archive"
RP_COMPLETE = DERIVED / "rp_complete.json"
RP_PROGRESS = DERIVED / "rp_progress.json"
WORDLIST_NEIGHBORS = DERIVED / "wordlist_with_neighbors.json"
WORDLIST_NEIGHBORS_SLIM = DERIVED / "wordlist_with_neighbors_slim.json"
CONNECTED_SPEECH_RP = DERIVED / "connected_speech_with_rp.json"
CONNECTED_SPEECH_LEGACY = DERIVED / "connected_speech.legacy15.json"

# --- Historical merge patches (def, gloss-fil, step4 patches) ---
PATCHES = PIPELINE_ROOT / "patches"
GLOSS_CORRECTIONS = PATCHES / "gloss-corrections.clear.json"
CASUAL_PATCH = PATCHES / "casual_patch.json"
THIN_PHONEME_PATCH = PATCHES / "thin_phoneme_patch.json"
IRREGULAR_FORMS_PATCH = PATCHES / "irregular_forms_patch.json"
BASIC_WORDS_PATCH = PATCHES / "basic_words_patch.json"
RP_DRESS_FIX = PATCHES / "rp_dress_vowel_fix.patch.json"
CS_RULE_FIL_CONNECTED = PATCHES / "cs-rule-fil-connected.json"
CS_RULE_FIL_WEAK = PATCHES / "cs-rule-fil-weak.json"

# --- Docs ---
DOCS = ROOT / "docs"
NEIGHBORS_REPORT = DOCS / "reference" / "neighbors_report.md"

# --- Other runtime-adjacent ---
I18N = ROOT / "packages" / "core" / "i18n"
GAS = ROOT / "tools" / "tts" / "gas"
TOOLS = ROOT / "tools"
TESTS = ROOT / "tests"
