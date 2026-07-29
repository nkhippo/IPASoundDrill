#!/usr/bin/env python3
"""Fail if any runtime vocab entry lacks a valid CEFR tag (A1/A2/B1/B2).

Issue #83 / Q-17: guard wordlist (and optional connected/weak) against untagged CEFR.
"""
from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

VALID = frozenset({"A1", "A2", "B1", "B2"})


def _entries(path: Path) -> list:
    data = json.loads(path.read_text(encoding="utf-8"))
    if isinstance(data, list):
        return data
    if isinstance(data, dict) and isinstance(data.get("items"), list):
        return data["items"]
    raise ValueError(f"Unsupported JSON shape in {path}")


def _label(entry: dict) -> str:
    return str(entry.get("w") or entry.get("id") or entry.get("phrase") or "?")


def validate_file(path: Path) -> list[str]:
    bad: list[str] = []
    for entry in _entries(path):
        if not isinstance(entry, dict):
            bad.append(f"{path}: non-object entry")
            continue
        cefr = entry.get("cefr")
        if cefr not in VALID:
            bad.append(f"{path.name}: {_label(entry)!r} cefr={cefr!r}")
    return bad


def main() -> int:
    root = Path(__file__).resolve().parents[1]
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument(
        "--wordlist",
        type=Path,
        default=root / "wordlist_GA_a1a2_plus_phonics.json",
        help="Primary production wordlist (required)",
    )
    parser.add_argument(
        "--also",
        type=Path,
        nargs="*",
        default=[
            root / "data" / "connected_speech.json",
            root / "data" / "weak_forms.json",
        ],
        help="Optional extra JSON lists to validate",
    )
    parser.add_argument(
        "--wordlist-only",
        action="store_true",
        help="Skip optional connected/weak files",
    )
    args = parser.parse_args()

    paths = [args.wordlist]
    if not args.wordlist_only:
        paths.extend(args.also or [])

    failures: list[str] = []
    for path in paths:
        if not path.exists():
            print(f"ERROR: missing file {path}", file=sys.stderr)
            return 2
        failures.extend(validate_file(path))

    if failures:
        print(f"CEFR tag validation failed ({len(failures)} issue(s)):", file=sys.stderr)
        for line in failures[:200]:
            print(f"  - {line}", file=sys.stderr)
        if len(failures) > 200:
            print(f"  ... and {len(failures) - 200} more", file=sys.stderr)
        return 1

    print("OK: all checked entries have cefr in {A1,A2,B1,B2}")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
