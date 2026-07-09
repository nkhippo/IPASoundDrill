# `merge_respelling.py` pending クリア問題 — 恒久修正レポート

- 実施日: 2026-07-09
- 指示書: `docs/cursor-instructions-fix-merge-respelling.md`
- ブランチ: `main`

## 1. 実際の原因

指示書の仮説は**ほぼ一致**したが、対象は「全語彙ループ」ではなく **`phase2b_respell_pending.json` に列挙された語すべて**だった。

`scripts/merge_respelling.py` には次の処理があった:

```python
# 修正前の挙動
clear_pending = args.clear_pending
if clear_pending is None:
    clear_pending = draft_path.resolve() == DEFAULT_DRAFT.resolve()  # デフォルト draft 使用時は True
```

`clear_pending=True` のとき、pending ファイル内の**全語**について `respell_ga` / `respell_rp` を削除してから draft をマージする。`generate_respelling.py` はバッチごとに pending リストを再生成するため、M1/M2 以前から存在する VntV pending 52語（すでに finalize 済み respell を持つ）も毎回巻き込まれ、104 フィールドが意図せずクリアされていた。

M1・M2 では HEAD 版からの手動復元が必要だったのはこのため。

## 2. 修正内容

| 変更 | 内容 |
|---|---|
| デフォルト | `clear_pending` を **False** に変更（再実行しても wordlist を変えない） |
| `--clear-pending` | 明示指定時のみ pending 語の respell をクリア |
| `--batch-words` | pending クリアを**今回バッチの語に限定**（JSON の語リストまたは `{w:...}` 配列） |
| ドキュメント | モジュール docstring を idempotent 方針に更新 |

## 3. 検証結果

### 3-1. 既存 VntV pending 52語が変化しないこと

M3 パイプライン実行後、HEAD で `respell_ga` を持っていた pending 52語は**全件保持**（52/52）。`winter` → `WIN-ter`、`abandon` → `uh-BAN-dn` を確認。

### 3-2. 新規バッチ語の pending / respelling

M3 400語のうち R4 pending 22語は respell 未付与（`entertain` 等）。draft 対象 377語は通常通り `respell_ga` / `respell_rp` が付与された。

### 3-3. Idempotent 再実行

```bash
python3 scripts/merge_respelling.py
git diff --stat wordlist_GA_a1a2_plus_phonics.json
# → 無変更（修正適用後）
```

## 4. M3 以降への影響

**手動復元ステップは不要になる見込み。** `merge_respelling.py` をデフォルト引数で実行しても既存語の respell は触れない。将来、バッチ内の tentative respell だけを消したい場合は `--clear-pending --batch-words phase1_mN_....json` を使う。

## 5. 変更ファイル

- `scripts/merge_respelling.py`
- `docs/cursor-instructions-fix-merge-respelling.md`（指示書コピー）
- 本レポート
