#!/usr/bin/env python3
"""
Merge rule-generated respell_ga / respell_rp into the wordlist.
Overwrites both fields for every word present in phase2b_respell_draft.json.
Does NOT touch ipa, rp_ipa, ipa_actual_ga, ipa_actual_rp, or any other field.

Words listed in phase2b_respell_pending.json are intentionally excluded from
phase2b_respell_draft.json. By default this script does NOT clear respelling
on pending words, so re-running after a batch merge is idempotent for existing
entries. Use --clear-pending together with --batch-words to clear tentative
respelling only on pending words from the current batch.
"""
import argparse
import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
WORDLIST = ROOT / "wordlist_GA_a1a2_plus_phonics.json"
DEFAULT_DRAFT = ROOT / "phase2b_respell_draft.json"
PENDING = ROOT / "phase2b_respell_pending.json"


def load_batch_words(path: Path) -> set[str]:
    payload = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(payload, list):
        if not payload:
            return set()
        if isinstance(payload[0], dict):
            return {str(e["w"]) for e in payload if e.get("w")}
        return {str(w) for w in payload}
    raise ValueError(f"Unsupported batch words format in {path}")


def main():
    parser = argparse.ArgumentParser(description="Merge respell_ga / respell_rp into wordlist")
    parser.add_argument(
        "--draft",
        type=Path,
        default=DEFAULT_DRAFT,
        help="Respelling draft JSON (default: phase2b_respell_draft.json)",
    )
    parser.add_argument(
        "--clear-pending",
        action="store_true",
        help="Clear respell on pending-review words before merge (scoped by --batch-words when provided)",
    )
    parser.add_argument(
        "--no-clear-pending",
        action="store_true",
        help=argparse.SUPPRESS,
    )
    parser.add_argument(
        "--batch-words",
        type=Path,
        default=None,
        help="JSON file listing current-batch words (list of strings or entries with 'w')",
    )
    args = parser.parse_args()
    draft_path = args.draft if args.draft.is_absolute() else ROOT / args.draft
    clear_pending = args.clear_pending
    if args.no_clear_pending:
        clear_pending = False
    batch_words = None
    if args.batch_words:
        batch_path = args.batch_words if args.batch_words.is_absolute() else ROOT / args.batch_words
        batch_words = load_batch_words(batch_path)

    data = json.loads(WORDLIST.read_text(encoding="utf-8"))
    draft = json.loads(draft_path.read_text(encoding="utf-8"))
    pending_words = set()
    if clear_pending and PENDING.exists():
        pending_words = {r["w"] for r in json.loads(PENDING.read_text(encoding="utf-8"))}
        if batch_words is not None:
            pending_words &= batch_words
    lookup = {w["w"]: w for w in data}

    cleared = 0
    for word in pending_words:
        entry = lookup.get(word)
        if not entry:
            continue
        had = "respell_ga" in entry or "respell_rp" in entry
        entry.pop("respell_ga", None)
        entry.pop("respell_rp", None)
        if had:
            cleared += 1

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
        encoding="utf-8",
    )
    print(f"merged {merged} / {len(draft)} entries from {draft_path.name}")
    if clear_pending and cleared:
        print(f"cleared respell on {cleared} pending-review words")
    if skipped:
        print(f"WARN: skipped (not in wordlist): {skipped}")


if __name__ == "__main__":
    main()
