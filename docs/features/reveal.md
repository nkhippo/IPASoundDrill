# reveal 解答

索引: `docs/features/README.md`。

## 観測可能挙動

- 出題語、正解 IPA、gloss、自分の解答差分、TTS、記号タップ解説を表示
- OK / bad の 2 値スタイルのみ（`res-near` は削除済み）
- 反対アクセント行（`ga_rp_same` 時は `/ipa/（同じ）`）
- Encode（`2b`）時は音素ごと OK/NG 色分け（LCS。判定自体は 2 値）

## 画面構造

`#reveal`

| 要素 | 内容 |
|------|------|
| 反対アクセント行 | `.alt-ipa*` |
| gloss | `.word-gloss` |
| TTS | `.playicon` |
| マーキング UI | `#revealChecks`（`2a` / `2b` / `2d`）。`resolveDrillId` で `2d` 振り分け |

## 採点則・定数

表示は ok / bad の 2 値のみ（near 廃止。判定則自体は出題元 ID `2a` / `2b` / `2d` を参照）。

## 読むデータ

出題対象のデータソースは各 ID（`2a` / `2b` / `2c` / `2d`）を参照。`ga_rp_same` フラグは `docs/data-contract.md` §2 wordlist スキーマ。

## i18n キー群

`reveal`。全体は `docs/data-contract.md` §5 i18n スキーマ。

## 関連シンボル

Issue F の impact-ledger 生成後にリンク。
