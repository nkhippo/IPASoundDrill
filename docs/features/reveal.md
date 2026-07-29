# reveal 解答

索引: `docs/features/README.md`。

## 観測可能挙動

- 出題語、正解 IPA（発音カード GA/RP 行）、gloss、自分の解答差分、TTS、記号タップ解説を表示
- OK / bad の 2 値バッジ（`#rBadge`、`res-ok` / `res-bad`。`res-near` は削除済み）
- **2026-07-28 答えペイン整理（Naoya）**: メインの `.readout`（旧・単一 IPA 表示 `#rIpa`）、反対アクセント行 `#rAltIpa`、読み方 `#rRespell`、辞書表記 `#rDictIpa` は**すべて `display:none` で非表示化**。IPA 表示は発音カード（`#rPronCard`）の GA/RP 2 行に一本化された（DOM 自体は温存、CSS で非表示のみ）
- Encode（`2b`）時は音素ごと OK/NG 色分け（LCS。判定自体は 2 値）
- `ga_rp_same` フラグ（またはフォールバックの文字列比較）で GA/RP 同一発音時の表示を制御（`renderPronCard`）

## 画面構造

`#reveal`

| 要素 | 内容 |
|------|------|
| 判定バッジ | `#rBadge`（`res-ok` / `res-bad`）+ アイコン（`#rBadgeIcon`）+ テキスト（`#rBadgeText`） |
| あなたの解答 | `.yourtry#rTry` |
| 単語 | `.word#rWord` |
| gloss | `.word-gloss#rGloss` |
| CS/weak メタ | `#rCsMeta`（`2d` connected speech: type + rule / weak forms: strong 形）。`2a`/`2b` は非表示 |
| 発音カード（GA/RP） | `.pron-card#rPronCard`: ラベル（`#rPronLabel`）+ GA 行（`#rPronGa` IPA + `#rPronGaPlay` TTS）+ RP 行（`#rPronRp` + `#rPronRpPlay`）+ 差分表示（`#rPronDiff`、hidden 時あり）。**現行の唯一の IPA 表示**（`.readout`/`#rAltIpa`/`#rRespell`/`#rDictIpa` は非表示化済み） |
| 発音 tips | `#rNoteBlock`: 見出し（`#tipsHead`）+ 本文（`#rNote`）+ トラップ chips（`#rTraps`） |
| マーキング UI | `#revealChecks`（`2a` / `2b` / `2d`。`resolveDrillId` で `2d` 振り分け） |
| Next | `#nextBtn` |
| Pending 状態 | `#rPending`（`is-pending` クラス時に表示、未回答プレースホルダ） |

## 採点則・定数

表示は ok / bad の 2 値のみ（near 廃止。判定則自体は出題元 ID `2a` / `2b` / `2d` を参照）。

## 読むデータ

出題対象のデータソースは各 ID（`2a` / `2b` / `2c` / `2d`）を参照。`ga_rp_same` フラグは `docs/data-contract.md` §2 wordlist スキーマ。

## i18n キー群

`reveal.*`（`reveal.correct` / `reveal.incorrect` / `reveal.pending` を含む）。全体は `docs/data-contract.md` §5 i18n スキーマ。

## 関連シンボル

`docs/impact-ledger.json` で `feature_ids` に `"reveal"` を含むシンボルを参照（symbol 昇順の JSON 配列。scope・caller_areas・行番号を含む。スキーマは `docs/impact-ledger.md`）。
