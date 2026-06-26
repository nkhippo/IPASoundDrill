#!/usr/bin/env python3
"""
i18n 整合性チェッカー  (English Pronunciation Trainer)

目的:
  言語ファイルを追加・編集したあと、これ1本で「壊れていないか」を検査する。
  CI / pre-commit / 手動のいずれでも使える。ハード不整合があれば exit code 1。

検査内容:
  [A] キー集合の一致      … 全 UI 言語ファイルが en と同じキー構造か
  [B] 音素キーの一致      … phonemes/*.json が en と同じ記号集合・フィールドか
  [C] 未翻訳の疑い        … 値が en と同一（IPA記号・CEFRコード・言語名は除外）
  [D] HTML 参照キーの存在 … index.html の t("...") が en.json に存在するか
  [E] プレースホルダ痕跡  … TODO / ★ / XXX / ???

使い方:
  python3 tools/validate_i18n.py            # リポジトリ直下で実行
  python3 tools/validate_i18n.py --strict   # 未翻訳の疑い(C)も失敗扱いにする

言語を増やすとき:
  i18n/<lang>.json と i18n/phonemes/<lang>.json を en からコピーして翻訳し、
  index.html の言語ピッカー(.langopt)に1ボタン追加 → 本スクリプトで検査。
  詳細は docs/i18n-language-scaling.md を参照。
"""
import json, re, sys, glob, os

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
UI_DIR = os.path.join(ROOT, "i18n")
PH_DIR = os.path.join(ROOT, "i18n", "phonemes")
HTML = os.path.join(ROOT, "index.html")
BASE = "en"  # 正本言語

# 値が en と一致していても正常なキー（記号・コードなど言語非依存）
ALLOW_EN_IDENTICAL = {
    "focus.traps_d",          # IPA 記号列
    "lvl.all", "lvl.b1", "lvl.b2", "lvl.c1",  # CEFR コード
    "lang_opts.en", "lang_opts.ja", "lang_opts.zh", "lang_opts.ko", "lang_opts.fil",  # 言語名(自称)
}

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
    return sorted(
        os.path.splitext(os.path.basename(p))[0]
        for p in glob.glob(os.path.join(dirpath, "*.json"))
    )

def main(strict=False):
    errors, warns = [], []

    # ---- [A] UI キー集合 ----
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

    # ---- [B] 音素キー＋フィールド ----
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

    # ---- [C] 未翻訳の疑い ----
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
            (errors if strict else warns).append(
                f"[C] {l}.json: en と同一値 {len(sus)}件 -> {sorted(sus)}")

    # ---- [D] HTML 参照キーの存在 ----
    html = open(HTML, encoding="utf-8").read()
    refs = set(re.findall(r"""t\(\s*["']([a-zA-Z0-9_.]+)["']""", html))
    # 動的キー（末尾が '.' の接頭辞）は前方一致で許容
    dyn_prefixes = {r for r in refs if r.endswith(".")}
    refs = {r for r in refs if not r.endswith(".")}
    for r in sorted(refs):
        if r not in base_keys:
            errors.append(f"[D] index.html が参照する未定義キー: t(\"{r}\")")
    if dyn_prefixes:
        print(f"[D] 動的キー接頭辞(前方一致で許容): {sorted(dyn_prefixes)}")

    # ---- [E] プレースホルダ ----
    for l in ui_langs:
        for k, v in ui[l].items():
            if isinstance(v, str) and re.search(r"TODO|★|XXX|\?\?\?", v):
                errors.append(f"[E] {l}.json [{k}] にプレースホルダ痕跡: {v!r}")

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
    sys.exit(main(strict="--strict" in sys.argv))
