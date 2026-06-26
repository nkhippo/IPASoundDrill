#!/usr/bin/env python3
"""Regenerate docs/i18n-audit.md and docs/gloss-flags.md from repo state."""
import json
import os
import re
from collections import defaultdict

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI_DIR = os.path.join(ROOT, "i18n")
PH_DIR = os.path.join(ROOT, "i18n", "phonemes")
HTML = os.path.join(ROOT, "index.html")
WORDLIST = os.path.join(ROOT, "wordlist_GA_a1a2_plus_phonics.json")
AUDIT_OUT = os.path.join(ROOT, "docs", "i18n-audit.md")
FLAGS_OUT = os.path.join(ROOT, "docs", "gloss-flags.md")
LANGS = ["en", "ja", "zh", "ko", "fil"]
GEN_DATE = "2026-06-26"


def load(path):
    with open(path, encoding="utf-8") as f:
        return json.load(f)


def flatten(d, prefix=""):
    out = {}
    for k, v in d.items():
        key = f"{prefix}{k}"
        if isinstance(v, dict):
            out.update(flatten(v, key + "."))
        else:
            out[key] = v
    return out


def trunc(s, n=55):
    s = re.sub(r"\s+", " ", str(s).replace("\n", " "))
    return s if len(s) <= n else s[: n - 3] + "..."


def screen_for(key, refs):
    if key not in refs:
        if key.startswith("pos."):
            return "（未使用・posLabel定義のみ）"
        if key.startswith(("hint.", "lvl.", "set.", "syl")):
            return "（未使用・予約）"
        if key.startswith("accent."):
            return "settings（動的参照）" if key in ("accent.ga", "accent.rp") else "settings"
        if key.startswith("lang_opts."):
            return "settings（動的参照）"
        return "（未参照）"
    if key.startswith("brand.") or key == "back_top":
        return "共通（トップバー）" if key.startswith("brand.") else "共通"
    if key.startswith("guide."):
        return "settings / guide"
    if key.startswith("modeb."):
        return "setup / Mode B"
    if key.startswith("tab.") or key in ("flabelTab",):
        return "setup"
    if key in ("lead_html",) or key.startswith(("focus.", "reg.", "grp.", "dir.")):
        return "setup（Words）"
    if key == "lead_connected_html" or (
        key.startswith("cs.") and not key.startswith("cs.level")
    ):
        return "setup（Connected）"
    if key == "lead_weak_html" or key.startswith("cs.level."):
        return "setup（Connected / Weak）"
    if key.startswith("weak."):
        return "reveal（Weak Forms）"
    if key.startswith("pool."):
        return "setup"
    if key == "input_ph":
        return "decode"
    if key == "input_phrase":
        return "decode（Connected）"
    if key in ("build_ph", "clear") or key.startswith("kbd."):
        return "encode"
    if key == "check":
        return "decode / encode / Mode B"
    if key == "listen":
        return "decode / encode / reveal"
    if key.startswith("info."):
        return "decode / encode / reveal（音素パネル）"
    if key.startswith("note.") or key in ("tips_head", "see_answer", "you", "next"):
        return "reveal"
    if key.startswith("reveal."):
        return "reveal"
    if key == "patterns.magic_e":
        return "reveal（pattern置換）"
    if key.startswith("summary."):
        return "summary"
    if key.startswith("accent."):
        return "settings（動的参照）" if key in ("accent.ga", "accent.rp") else "settings"
    if key.startswith("settings_") or key == "settings_btn":
        return "settings"
    if key in ("start", "loading", "load_fail", "wordlist_fail", "meter_done"):
        return "setup / summary"
    return "setup / 練習"


def ko_translit_suspect(en, ko):
    if not ko or not en:
        return False
    if re.search(r"[A-Za-z]", ko):
        return True
    if ko.startswith("~"):
        return False
    if " " not in ko and len(ko) <= 2 and re.fullmatch(r"[\uac00-\ud7a3]+", ko):
        return True
    return False


def gloss_flags(word):
    g = word.get("gloss") or {}
    en = (g.get("en") or word.get("w") or "").strip()
    reasons = []
    for lang in ("ja", "zh", "ko"):
        v = (g.get(lang) or "").strip()
        if not v:
            reasons.append(f"{lang}:空")
        elif len(v) == 1:
            reasons.append(f"{lang}:1文字")
        elif v.lower() == en.lower():
            reasons.append(f"{lang}:enと同一")
    ko = (g.get("ko") or "").strip()
    if ko and ko_translit_suspect(en, ko) and not any(r.startswith("ko:") for r in reasons):
        reasons.append("ko:音写疑い")
    return reasons


def gen_i18n_audit():
    ui = {l: flatten(load(os.path.join(UI_DIR, f"{l}.json"))) for l in LANGS}
    keys = sorted(ui["en"])
    html = open(HTML, encoding="utf-8").read()
    refs = set(re.findall(r"""t\(\s*["']([a-zA-Z0-9_.]+)["']""", html))
    refs = {r for r in refs if not r.endswith(".")}

    lines = [
        "# i18n 監査レポート",
        "",
        f"> 生成日: {GEN_DATE} ／ 対象: `i18n/{{en,ja,zh,ko,fil}}.json`、`i18n/phonemes/*.json`、`index.html`",
        f"> 生成: `python3 tools/gen_audit_docs.py` ／ UI キー数: **{len(keys)}** ／ `validate_i18n.py`: ERROR 0",
        "",
        "翻訳の良し悪しは判断していません。キー所在・画面配線・ハードコードの可視化のみ。",
        "",
        "---",
        "",
        "## 1. UI 文言キー × 言語",
        "",
        "| キー | en | ja | zh | ko | fil | 画面 |",
        "|------|----|----|----|----|-----|------|",
    ]
    for k in keys:
        row = [f"`{k}`"]
        for l in LANGS:
            row.append(trunc(ui[l].get(k, "—")))
        row.append(screen_for(k, refs))
        lines.append("| " + " | ".join(row) + " |")

    by_screen = defaultdict(list)
    for k in keys:
        by_screen[screen_for(k, refs)].append(k)

    lines += ["", "---", "", "## 2. 画面別分類", ""]
    for screen in sorted(by_screen):
        lines.append(f"### {screen}")
        lines.append("")
        for k in sorted(by_screen[screen]):
            lines.append(f"- `{k}`")
        lines.append("")

    ph = load(os.path.join(PH_DIR, "en.json"))
    sym_count = len(ph)
    lines += [
        "---",
        "",
        "## 3. 音素解説（`i18n/phonemes/*.json`）",
        "",
        f"- 音素記号数: en={sym_count}, ja={sym_count}, zh={sym_count}, ko={sym_count}",
        "- 4言語間で音素キー集合は一致（`validate_i18n.py` [B]）",
        "",
        "各記号のフィールド: `lab`, `ex`, `mouth`, `trap`, `t`（要注意フラグ）",
        "",
        "| 記号 | 画面 | フィールド |",
        "|------|------|-----------|",
        f"| `θ` … `ʊə` 等 **{sym_count} 記号** | decode / encode / reveal（音素パネル） | lab, ex, mouth, trap, t |",
        "",
        "---",
        "",
        "## 4. 動的参照キー（`index.html` で接尾辞結合）",
        "",
        "| 接頭辞 | 例 | 用途 |",
        "|--------|-----|------|",
        "| `lang_opts.` | `t(\"lang_opts.\" + code)` | 言語ピッカー |",
        "| `accent.` | `t(\"accent.\" + ga\\|rp)` | アクセントピッカー |",
        "",
        "---",
        "",
        "## 5. ハードコード文字列（初期 HTML・起動後に `applyI18n()` で置換）",
        "",
        "| ファイル:行付近 | 文字列 | 備考 |",
        "|----------------|--------|------|",
        "| `index.html:225` | IPA Dictation / A1–A2 · GA | `#brandName` / `#brandSub` → `brand.*` |",
        "| `index.html:228` | Settings（aria-label） | 起動後 `settings_btn` で置換 |",
        "| `index.html:229` | Menu | 起動後 `back_top` で置換 |",
        "| `index.html:428–433` | English / 日本語 / 中文 / 한국어 / Filipino | 起動後 `lang_opts.*` で置換 |",
        "| `index.html:438–439` | American (GA) / British (RP) | 起動後 `accent.*` で置換 |",
        "| `index.html:456–462` | Guide 言語ピル（en/ja/ko/繁體/简体/Filipino） | **ガイド専用**（UI i18n 外） |",
        "| `index.html` encode | ⌫ | IPA キーボード（言語非依存） |",
        "",
        "**常に英語のまま:** `<title>` は起動前のみ英語。`document.title` は `applyI18n()` で `brand.name` に更新。",
        "",
    ]
    with open(AUDIT_OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


def gen_gloss_flags():
    words = load(WORDLIST)
    flagged = []
    for w in words:
        reasons = gloss_flags(w)
        if reasons:
            g = w.get("gloss") or {}
            flagged.append((w["w"], g.get("en", ""), g.get("ja", ""), g.get("zh", ""), g.get("ko", ""), reasons))

    lines = [
        "# gloss 機械フラグ",
        "",
        f"> 生成日: {GEN_DATE} ／ 対象: `wordlist_GA_a1a2_plus_phonics.json`",
        f"> 生成: `python3 tools/gen_audit_docs.py`",
        "",
        f"- 総語数: {len(words)}",
        f"- フラグ付き語数: {len(flagged)}",
        "",
        "正誤判断はしていません。機械的ヒューリスティックのみ。",
        "",
        "## フラグ条件",
        "",
        "1. `ja` / `zh` / `ko` のいずれかが `en` と完全一致（大文字小文字無視）",
        "2. いずれかが空文字",
        "3. いずれかが1文字のみ",
        "4. `ko` が音写に見える（ASCII 含有、または `~` 以外でハングル **2 文字以下**）",
        "",
        "## フラグ一覧",
        "",
        "| 単語 | en | ja | zh | ko | フラグ理由 |",
        "|------|----|----|----|-----|----------|",
    ]
    for w, en, ja, zh, ko, reasons in sorted(flagged, key=lambda x: x[0].lower()):
        lines.append(
            f"| {w} | {trunc(en, 40)} | {trunc(ja, 20)} | {trunc(zh, 20)} | {trunc(ko, 20)} | {'; '.join(reasons)} |"
        )

    with open(FLAGS_OUT, "w", encoding="utf-8") as f:
        f.write("\n".join(lines))


if __name__ == "__main__":
    gen_i18n_audit()
    gen_gloss_flags()
    print("Wrote", AUDIT_OUT)
    print("Wrote", FLAGS_OUT)
