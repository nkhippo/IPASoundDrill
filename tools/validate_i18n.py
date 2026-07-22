#!/usr/bin/env python3
"""
i18n 整合性チェッカー  (IPA Sound Drill)

検査内容:
  [A] UI キー集合の一致
  [B] 音素キーの一致
  [C] 未翻訳の疑い（--strict で失敗）
  [D] HTML 参照キーの存在
  [E] TODO / ★ / XXX / ??? 痕跡
  [F] ja 以外の CJK かな残留
  [G] UI プレースホルダ整合
  [H] JSON 2 スペースフォーマット
  [I] *_html キーの HTML 妥当性
"""
from html.parser import HTMLParser
import argparse, json, re, sys, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI_DIR = os.path.join(ROOT, "i18n")
PH_DIR = os.path.join(ROOT, "i18n", "phonemes")
HTML = os.path.join(ROOT, "src", "index.template.html")
BASE = "en"
RESIDUAL_JAPANESE_RE = re.compile(r"[\u3040-\u309f\u30a0-\u30ff]")
PLACEHOLDER_RE = re.compile(r"\{[a-zA-Z_]+\}")
ALLOWED_HTML_TAGS = {"a", "b", "br", "code", "em", "i", "p", "strong"}
ALLOW_MISSING_HTML_REFS = {"audio_tap_hint"}  # runtime fallback is intentionally coded in src/index.template.html
VOID_HTML_TAGS = {"br"}

ALLOW_EN_IDENTICAL = {
    "focus.traps_d",
    "lvl.a1", "lvl.a2", "lvl.b1", "lvl.b2", "lvl.c1",
    "lang_opts.en", "lang_opts.ja", "lang_opts.zh-Hant", "lang_opts.zh-Hans", "lang_opts.ko", "lang_opts.fil",
}

class I18nHTMLParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.stack = []
        self.errors = []

    def handle_starttag(self, tag, attrs):
        if tag not in ALLOWED_HTML_TAGS:
            self.errors.append(f"未許可タグ <{tag}>")
        if tag not in VOID_HTML_TAGS:
            self.stack.append(tag)

    def handle_startendtag(self, tag, attrs):
        if tag not in ALLOWED_HTML_TAGS:
            self.errors.append(f"未許可タグ <{tag}/>")

    def handle_endtag(self, tag):
        if tag not in ALLOWED_HTML_TAGS:
            self.errors.append(f"未許可タグ </{tag}>")
            return
        if tag in VOID_HTML_TAGS:
            self.errors.append(f"void タグ </{tag}> の終了タグ")
            return
        if not self.stack:
            self.errors.append(f"対応する開始タグがない </{tag}>")
            return
        expected = self.stack.pop()
        if expected != tag:
            self.errors.append(f"タグのネスト不一致: <{expected}> を閉じる前に </{tag}>")

    def close(self):
        super().close()
        for tag in reversed(self.stack):
            self.errors.append(f"未閉じタグ <{tag}>")


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

def langs_in(dirpath):
    return sorted(os.path.splitext(os.path.basename(p))[0] for p in glob.glob(os.path.join(dirpath, "*.json")))

def validate_json_format(paths):
    errors = []
    for path in paths:
        raw = open(path, "rb").read()
        if raw.startswith(b"\xef\xbb\xbf"):
            errors.append(f"[H] {rel(path)}: BOM が含まれています")
            raw = raw[3:]
        text = raw.decode("utf-8")
        if not text.endswith("\n"):
            errors.append(f"[H] {rel(path)}: 末尾改行がありません")
        lines = text.splitlines()
        depth = 0
        for lineno, line in enumerate(lines, start=1):
            if not line:
                continue
            leading = len(line) - len(line.lstrip(" "))
            stripped = line.lstrip(" ")
            if "\t" in line[:leading]:
                errors.append(f"[H] {rel(path)}:{lineno}: タブインデントが含まれています")
                continue
            expected_depth = depth - 1 if stripped.startswith(("}", "]")) else depth
            if leading != max(expected_depth, 0) * 2:
                errors.append(f"[H] {rel(path)}:{lineno}: 2 スペースインデント不一致（expected {max(expected_depth, 0) * 2}, got {leading}）")
            depth += stripped.count("{") + stripped.count("[") - stripped.count("}") - stripped.count("]")
        json.loads(text)
    return errors

def rel(path):
    return os.path.relpath(path, ROOT)

def validate_no_residual_japanese(ui):
    errors = []
    for lang, flat in ui.items():
        if lang == "ja":
            continue
        for key, value in flat.items():
            if isinstance(value, str) and RESIDUAL_JAPANESE_RE.search(value):
                errors.append(f"[F] i18n/{lang}.json [{key}] に CJK かな残留: {value!r}")
    return errors

def validate_placeholder_integrity(ui, base_keys):
    errors = []
    for key in sorted(base_keys):
        base_ph = set(PLACEHOLDER_RE.findall(str(ui[BASE].get(key, ""))))
        for lang, flat in ui.items():
            if key not in flat or not isinstance(flat[key], str):
                continue
            ph = set(PLACEHOLDER_RE.findall(flat[key]))
            if ph != base_ph:
                errors.append(f"[G] {lang}.json [{key}] プレースホルダ不一致: {sorted(ph)} != {sorted(base_ph)}")
    return errors

def validate_html_keys(ui):
    errors = []
    for lang, flat in ui.items():
        for key, value in flat.items():
            if not key.endswith("_html"):
                continue
            parser = I18nHTMLParser()
            try:
                parser.feed(value)
                parser.close()
            except Exception as exc:
                parser.errors.append(f"HTML パース例外: {exc}")
            for err in parser.errors:
                errors.append(f"[I] {lang}.json [{key}]: {err}")
    return errors

def main(strict=False):
    errors, warns = [], []
    ui_paths = [os.path.join(UI_DIR, f"{l}.json") for l in langs_in(UI_DIR)]
    errors.extend(validate_json_format(ui_paths))

    ui_langs = langs_in(UI_DIR)
    ui = {l: flatten(load(os.path.join(UI_DIR, f"{l}.json"))) for l in ui_langs}
    base_keys = set(ui[BASE])
    print(f"[A] UI 言語: {ui_langs}  キー数(en)={len(base_keys)}")
    for l in ui_langs:
        if l == BASE:
            continue
        missing = base_keys - set(ui[l])
        extra = set(ui[l]) - base_keys
        if missing:
            errors.append(f"[A] {l}.json: en に在るキーが欠落 {sorted(missing)}")
        if extra:
            errors.append(f"[A] {l}.json: en に無い余剰キー {sorted(extra)}")

    ph_langs = langs_in(PH_DIR)
    ph = {l: load(os.path.join(PH_DIR, f"{l}.json")) for l in ph_langs}
    base_sym = set(ph[BASE])
    print(f"[B] 音素言語: {ph_langs}  記号数(en)={len(base_sym)}")
    if set(ui_langs) != set(ph_langs):
        errors.append(f"[B] UI言語と音素言語の集合が不一致: UI={ui_langs} PH={ph_langs}")
    for l in ph_langs:
        if l == BASE:
            continue
        ms = base_sym - set(ph[l])
        if ms:
            errors.append(f"[B] phonemes/{l}.json: 記号欠落 {sorted(ms)}")
        for sym in base_sym & set(ph[l]):
            mf = set(ph[BASE][sym]) - set(ph[l][sym])
            if mf:
                errors.append(f"[B] phonemes/{l}.json [{sym}]: フィールド欠落 {sorted(mf)}")

    for l in ui_langs:
        if l == BASE:
            continue
        sus = []
        for k in base_keys:
            if k in ALLOW_EN_IDENTICAL:
                continue
            if k in ui[l] and ui[l][k] == ui[BASE][k]:
                sus.append(k)
        if sus:
            (errors if strict else warns).append(f"[C] {l}.json: en と同一値 {len(sus)}件 -> {sorted(sus)}")

    html = open(HTML, encoding="utf-8").read()
    refs = set(re.findall(r"""(?<![A-Za-z0-9_$])t\(\s*["']([a-zA-Z0-9_.]+)["']\s*\)""", html))
    dyn_prefixes = set(re.findall(r"""(?<![A-Za-z0-9_$])t\(\s*["']([a-zA-Z0-9_.]+)["']\s*\+""", html))
    dyn_prefixes = {r if r.endswith(".") else r + "." for r in dyn_prefixes}
    for r in sorted(refs):
        if r in ALLOW_MISSING_HTML_REFS:
            continue
        if r not in base_keys:
            errors.append(f"[D] src/index.template.html が参照する未定義キー: t(\"{r}\")")
    if dyn_prefixes:
        print(f"[D] 動的キー接頭辞(前方一致で許容): {sorted(dyn_prefixes)}")

    for l in ui_langs:
        for k, v in ui[l].items():
            if isinstance(v, str) and re.search(r"TODO|★|XXX|\?\?\?", v):
                errors.append(f"[E] {l}.json [{k}] にプレースホルダ痕跡: {v!r}")

    errors.extend(validate_no_residual_japanese(ui))
    errors.extend(validate_placeholder_integrity(ui, base_keys))
    errors.extend(validate_html_keys(ui))

    print("\n" + "=" * 60)
    for w in warns:
        print("WARN ", w)
    for e in errors:
        print("ERROR", e)
    if not errors and not warns:
        print("OK: 不整合は検出されませんでした。")
    elif not errors:
        print(f"\n警告 {len(warns)} 件（ハード不整合なし）。")
    print("=" * 60)
    return 1 if errors else 0

if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--strict", action="store_true", help="未翻訳の疑い(C)も失敗扱いにする")
    sys.exit(main(strict=parser.parse_args().strict))
