#!/usr/bin/env python3
"""
tools/tts/prepare_drive_upload.py — Drive アップロード用にリネームコピー

tools/tts/audio/{ga,rp}/{slug}.mp3
  → tools/tts/drive_upload/{slug}__{accent}_v2.mp3

Code.gs の fileNameFor_ と同じ命名規則:
  slugForInput_(word) + '__' + accent + '_' + TTS_CACHE_VER + '.mp3'
"""

import shutil
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SRC_DIR = REPO_ROOT / "tools" / "tts" / "audio"
DST_DIR = REPO_ROOT / "tools" / "tts" / "drive_upload"
CACHE_VER = "v2"
ACCENTS = ("ga", "rp")


def run():
    DST_DIR.mkdir(parents=True, exist_ok=True)
    copied = 0
    for accent in ACCENTS:
        accent_dir = SRC_DIR / accent
        if not accent_dir.is_dir():
            print(f"[skip] {accent_dir} not found", file=sys.stderr)
            continue
        for src in sorted(accent_dir.glob("*.mp3")):
            slug = src.stem
            dst_name = f"{slug}__{accent}_{CACHE_VER}.mp3"
            dst = DST_DIR / dst_name
            shutil.copy2(src, dst)
            copied += 1
    print(f"[done] {copied} files copied to {DST_DIR}")


if __name__ == "__main__":
    run()
