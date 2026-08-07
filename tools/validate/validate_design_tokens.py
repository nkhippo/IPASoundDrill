#!/usr/bin/env python3
"""
デザイントークン整合チェッカー  (IPA Sound Drill / 横展開信頼問題 α)

`validate_i18n.py` の一般化。同じ CSS カスタムプロパティ（色トークン）が
複数の HTML テンプレートに複製されている「整合の辺」を機械的に検証する。

方式:
  - 正本(SoT) = apps/web/src/index.template.html の :root 色トークン
    （CLAUDE.md ルール6: Web UI 仕様の正本は index.template.html）
  - 対象      = apps/web/src/*.template.html（index を除く）
  - 各対象について、SoT と「両方に存在する色トークン」(= 共通の辺) のみ値を照合する
    -> 片方にしか無いトークン（例: 本体固有 --accent、SEO 固有 --paper-2）は
       意図的な非共有トークンとみなし照合対象外

不一致があれば exit 1 で該当箇所を具体的に報告する。
"""
import glob
import os
import re
import sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
SRC_DIR = os.path.join(ROOT, "apps", "web", "src")
SOT_FILE = os.path.join(SRC_DIR, "index.template.html")

# `--name: #RGB | #RRGGBB | #RRGGBBAA` 形式の宣言のみ抽出（色トークンに限定）。
# spacing/radius/shadow/font-family は本チェッカーの対象外（Issue #309 非対象範囲）。
TOKEN_RE = re.compile(
    r"(--[a-zA-Z0-9-]+)\s*:\s*(#[0-9A-Fa-f]{3,8})\b"
)


def rel(path):
    return os.path.relpath(path, ROOT)


def extract_color_tokens(path):
    """ファイル全体から `--token: #hex` を行番号付きで抽出する。

    同名トークンが複数回定義されている場合は最初の宣言を採用する
    （index の共通9トークンは Mood B :root に一意なので問題にならない）。
    """
    tokens = {}
    with open(path, encoding="utf-8") as f:
        for lineno, line in enumerate(f, start=1):
            for name, value in TOKEN_RE.findall(line):
                if name not in tokens:
                    tokens[name] = (value.upper(), lineno)
    return tokens


def main():
    if not os.path.exists(SOT_FILE):
        print(f"ERROR: 正本ファイルが見つかりません: {rel(SOT_FILE)}")
        return 1

    sot = extract_color_tokens(SOT_FILE)
    targets = sorted(
        p for p in glob.glob(os.path.join(SRC_DIR, "*.template.html"))
        if os.path.abspath(p) != os.path.abspath(SOT_FILE)
    )

    print(f"[SoT] {rel(SOT_FILE)}  色トークン数={len(sot)}")
    print(f"[対象] {len(targets)} ファイル")

    errors = []
    for path in targets:
        tokens = extract_color_tokens(path)
        shared = sorted(set(sot) & set(tokens))
        for name in shared:
            sot_val = sot[name][0]
            tgt_val, tgt_line = tokens[name]
            if tgt_val != sot_val:
                errors.append(
                    f"{rel(path)}:{tgt_line}: {name} {tgt_val} が正本 "
                    f"{rel(SOT_FILE)} の {sot_val} と不一致"
                )
        print(f"  - {rel(path)}: 共通辺 {len(shared)} 件を照合")

    print("\n" + "=" * 60)
    for e in errors:
        print("ERROR", e)
    if not errors:
        print("OK: デザイントークンの不整合は検出されませんでした。")
    print("=" * 60)
    return 1 if errors else 0


if __name__ == "__main__":
    sys.exit(main())
