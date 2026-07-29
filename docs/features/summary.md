# summary サマリー画面

索引: `docs/features/README.md`。終了条件は `docs/features/_common.md`。

## 観測可能挙動

- プール全問消化で自動表示(終了条件は `docs/features/_common.md`)
- `{正解} / {回答済み} 正解`、苦手音素、ミス単語、TOP へ / 苦手だけ復習

## 画面構造

`#summary`

| 要素 | 内容 |
|------|------|
| 正答率 | `.sumhead .bigstat#sumPct`（%表示） |
| サマリー行 | `.substat#sumLine`（`summary.line`: 正解数/回答済み数/ミス数） |
| 苦手音素 | `#weakWrap`: 見出し（`#weakHead`）+ リスト（`#weakList`、音素シンボル+ラベル+口の動きヒント+ミス回数。0件時は `summary.weak_none_*`） |
| ミス単語レビュー | `.reviewlist#reviewList`（`summary.review`） |
| CTA | `.sumbtns`: `#againBtn`（表示テキストは i18n `back_top`＝「TOP へ」。クリックで `goToTop()`）/ `#weakBtn`（`summary.weak_btn`＝苦手だけ復習。クリックで `startSession(true)`。ミスなし時 `disabled`） |

## 採点則・定数

正答率は `ok` のみ(near 廃止)。

## 読むデータ

セッション状態 `S`(`correct` / `answered` / `missed` / `weak` 等)— `docs/data-contract.md` §4 localStorage / セッション状態。

## i18n キー群

`summary`。全体は `docs/data-contract.md` §5 i18n スキーマ。

## 関連シンボル

`docs/impact-ledger.json` で `feature_ids` に `"summary"` を含むシンボルを参照（symbol 昇順の JSON 配列。scope・caller_areas・行番号を含む。スキーマは `docs/impact-ledger.md`）。
