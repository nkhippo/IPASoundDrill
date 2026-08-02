# fix(data): ga_rp_same_reason の複合軸マッチング・介母音バグ・フラップT正規化対応（拡大版）(#288) — 実装レポート

## 関連 Issue / PR

- Issue: #288（前回 halt: https://github.com/nkhippo/IPASoundDrill/issues/288#issuecomment-5155277247 を踏まえたスコープ拡大版）
- PR: （本コミット後に作成）
- Agent: claude-code (issue-handler)

## Issue 背景（Issue 本文から要約）

前回の issue-handler は `apply_rhoticity()` の介母音（intervocalic）`/r/` 誤脱落バグのみを Issue 記載どおり修正したが、
それだけでは `structural_other` が 754→735（-19語）にしかならず、完了定義「300+ 減少」を大きく下回ることが判明し halt した。
Naoya 承認のもとスコープを拡大し、以下 4 点すべてに対応する:

1. `square_near_cure` ステップにも同種の介母音バグがある（`fairy`, `grandparent` 等）
2. `airport`（square_near_cure + cot_caught）のような複合軸の判定不足
3. `better` / `butter` / `computer` 等、`ipa` フィールドに直接フラップT `ɾ` が埋め込まれているケースの正規化不足
4. `forest`（lot_vowel + weak_vowel）のような LOT + 弱母音の複合差

## 実装内容

`tools/data-pipeline/gen_ga_rp_same.py` を全面改修（既存の逐次 if 文チェックを、一般化された「構造軸の組み合わせ探索」に置き換え）。

- **`apply_rhoticity()` の介母音バグ修正**: `RHOTICITY_BASE_MERGE`（旧 `RHOTICITY_MAP`）の適用をトークン単位に変更し、`/r/` の直後（強勢記号を跨いで）が母音の場合は非rhotic化（例: `ɑr→ɑː`）をスキップするようにした。
- **`apply_square_near_cure()` を新設**: 同じ介母音チェックを SQUARE/NEAR/CURE（`ɛr/ɪr/ʊr → eə/ɪə/ʊə`）変換にも適用。加えて、`/r/` の直後が別の r 音化母音トークン（`ɚ`/`ɝ`）そのものである場合（例: `error` /ˈɛrɚ/, `terror` /ˈtɛrɚ/）は SQUARE 変換自体を発火させない特殊ケースを追加（これは「DRESS母音+次音節自身のr音化母音」であり SQUARE 二重母音ではないため）。
- **複合軸マッチング（`_search_structural_combo()`）**: `rhoticity`（coda r 解消）は既存の逐次ロジックと同様に「常時適用される前提軸」として扱い、`square_near_cure` / `goat_vowel` / `lot_vowel or cot_caught` / `trap_bath` / `weak_vowel` / `yod` の6軸を itertools.product で組み合わせ探索（最小軸数優先）。1軸のみで説明できれば従来どおりの reason 名を維持し、2軸以上必要な場合のみ `composite_structural` を返す。
- **フラップT/声門閉鎖の正規化（`flap_variants()`）**: `ipa` に `ɾ`（`t`/`d` 両方を試行）・`ʔ`（`t` に正規化）が直接含まれる語は、正規化後の文字列で再度上記の軸探索を実施。フラップ/声門閉鎖の正規化のみで説明できれば `ga_allophony`（既存の narrow-transcription carve-out と同カテゴリ）、他の軸も併用が必要なら `composite_structural` とする。

## 変更ファイル

```
- tools/data-pipeline/gen_ga_rp_same.py (M) — 分類ロジック本体
- packages/core/data/wordlist.json (M) — ga_rp_same / ga_rp_same_reason フィールドのみ再生成
- packages/core/data/connected_speech.json (M) — 同上
- packages/core/data/weak_forms.json (M) — 再生成したが値に変化なし（diff なし）
- tools/data-pipeline/pipeline/ga_rp_same_report.json (M) — 集計レポート再生成
- docs/data-contract.md (M) — 分布統計・reason 説明を最新化
- docs/agent-reports/issue-handler-issue-288-ga-rp-same-composite-axes.md (A)
```

## デグレ防止検証

- **`ipa` / `rp_ipa` 等、`ga_rp_same` / `ga_rp_same_reason` 以外のフィールドは一切変更していない**ことを、旧 HEAD の JSON と再生成後の JSON をキー単位で全件比較して確認（wordlist 5,397 件・connected_speech 201 件とも差分 0）。
- **`ga_rp_same`（same/different の真偽値）のロジック単体比較ではフリップ 0 件**（develop 版スクリプトと新スクリプトを、同一の入力フィールド snapshot に対して実行し突き合わせ、5,397 語全件で一致を確認）。ただし後述のとおり、**develop に実際にコミットされていた JSON の値**と再生成後の値を直接比較すると、`candle` 1 件が `true→false` にフリップしていた（リポジトリに既にコミット済みのデータが `gen_ga_rp_same.py` の未再実行により古い値のまま残っていたことによる、既存 `ga_allophony` carve-out（`classify()` 内、本 PR で無変更）の正しい適用。詳細は下記）。それ以外の 5,396 語では真偽値の変化なし。`ga_rp_same_reason`（理由ラベル）のみが変化する設計であることを保証した。
- **`candle` の 1 件フリップの検証**: `ipa` = `/ˈkændəl/`、`rp_ipa` = `/ˈkændəl/`（GA/RP phonemic が完全一致）だが `ipa_actual_ga` = `/ˈkændl̩/`（syllabic l、audibly different）。`classify()` の CARVE-OUT（`ipa_actual_ga != ipa` かつ RP narrow 形と不一致なら `ga_allophony`/`false`）は本 PR で一切変更していない既存ロジックであり、develop にコミットされていた `ga_rp_same: true` はこの carve-out が反映されていない stale な値だった。`--dry-run` なしでパイプラインを再実行したことで正しい値（`false`/`ga_allophony`）に是正された。コード変更は不要と判断。
- reason ラベルの遷移を全件突き合わせ、旧ラベルから `structural_other` に後退したケースがないことを確認（`error`/`terror`/`mirror`/`sheriff`/`terribly` 等、実装途中で一時的に発生した後退は、上記の "隣接する r音化母音を SQUARE 扱いしない" 特殊ケースを追加して解消済み）。
- `lot_vowel`/`cot_caught`/`trap_bath` から `composite_structural` へ変わった少数のケース（例: `following` = lot_vowel+goat_vowel, `before`/`board` は変化なし=cot_caught 維持）は、旧コードが暗黙に goat/lot 両方の変化を見落として単一ラベルを返していた既存の不正確さを是正したものであり、後退ではなく精度向上と判断（`_search_structural_combo` のコメントに根拠を明記）。
- `apps/web/src/index.template.html` の UI ロジックは `ga_rp_same`（真偽値）のみを参照し `ga_rp_same_reason`（文字列）の具体値には依存していないことを確認（`GaRpSameReason` 型も `string` エイリアスで列挙型ではない）。UI 影響なし。

## 動作確認

- `python3 tools/data-pipeline/gen_ga_rp_same.py --report tools/data-pipeline/pipeline/ga_rp_same_report.json` を実行し、3 ファイルとも正常に再生成されることを確認。
- 完了定義の代表語を個別確認:
  - `sorry` /ˈsɑri/ vs /ˈsɒri/ → `lot_vowel` ✓
  - `airport` /ˈɛrˌpɑrt/ vs /ˈeəˌpɔːt/ → `composite_structural`（square_near_cure + cot_caught の複合）✓
  - `better` /ˈbɛɾɚ/ vs /ˈbetə/ → `composite_structural`（フラップT正規化 + rhoticity の複合）✓
  - `forest` /ˈfɑrəst/ vs /ˈfɒrɪst/ → `composite_structural`（lot_vowel + weak_vowel の複合、Issue 記載の代表例）
  - `fairy` /ˈfɛri/ vs /ˈfeəri/ → `square_near_cure`（介母音バグ修正の直接確認）
  - `city` /ˈsɪɾi/ vs /ˈsɪti/ → `ga_allophony`（フラップTのみで説明可能）
  - `error`/`terror`/`mirror` → `rhoticity`（隣接r音化母音の誤爆を修正後も正しく維持）
- `wordlist` の `structural_other`: **754 → 453（-301語、300語以上の削減を達成）**。
- `python3 tools/validate/validate_i18n.py` を実行し、既存の WARN 5 件（本変更と無関係、i18n ファイル自体は未変更）以外のハード不整合がないことを確認。

## 実装過程での気づき

- 最初の実装イテレーションでは `rhoticity` と `square_near_cure` の両方を「常時適用される前提軸」として合成した結果、`before`/`board`/`follow` 等 146+ 語が `cot_caught`/`lot_vowel` から `composite_structural` へ大量に後退した。旧コードの逐次ロジックを分析した結果、**rhoticity（coda r 解消）のみが「暗黙の前提」として扱われており、square_near_cure は独立した排他的候補**だったことが判明。square_near_cure を軸探索の対象（トグル）に戻すことで後退を解消した。
- さらに、SQUARE/NEAR/CURE の判定は音韻環境だけでは決定できない（`fairy`/`vary` は SQUARE だが `sheriff`/`terrible` は DRESS+r のまま）ため、`/r/` の直後が別の r音化母音トークン自体（`ɚ`/`ɝ`）である場合は SQUARE 変換を発火させない特殊ケースが必要だった。この語彙依存性は完全解消できないため（`sheriff`/`terribly` 等は `structural_other` に残存する語もあるが、weak_vowel 軸のみで解決できるケースは正しく `weak_vowel` に分類されている）。

## 後続への影響

- `structural_other` の残存 453 語（wordlist）は、音節主音子音の表記揺れ（`n̩` vs `ən` 等 RP側辞書ソースの表記不統一）や真の語彙的相違（`clerk`/`vase`/`adult`/`Z` 等、GA/RP で全く異なる発音）が中心で、機械的な軸分解では対応できない残差。目視レビュー対象として妥当。
- `docs/data-contract.md` の分布統計・reason 説明を本 PR で最新化した。今後さらに `gen_ga_rp_same.py` を改修する場合は、本ドキュメントの表も同時に更新すること。

## 残課題・申し送り

- `structural_other` の完全解消（0 化）は Issue のスコープ外（完了定義は「300+ 減少」であり達成済み）。残存語の多くは辞書ソース間の表記揺れ・真の語彙的例外であり、個別語彙リスト化での対応が必要になる可能性がある（別 Issue 検討事項）。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3（runtime data contract の `ga_rp_same`/`ga_rp_same_reason` フィールド、wordlist 全体 5,397 語に影響）
- 実装後の妥当性判定: 妥当
- 判定根拠: `packages/core/data/wordlist.json` 等 runtime data contract 対象ファイルを機械的に再生成する変更であり、L3（フル Rv + Naoya ack 必須）が妥当。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C5（Runtime data / schema contract）
- 実装中に追加が必要になった Pattern: なし（スコープ拡大は Naoya 承認済みの同一 Issue 内での軸追加であり、新規 Pattern には該当しない）

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響: wordlist の派生フィールド `ga_rp_same`/`ga_rp_same_reason` のみ変更。`ipa`/`rp_ipa` 等の一次データは無変更（全件比較で確認済み）。
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（`docs/data-contract.md` は本 PR で整合更新済み）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1（単一 PR、Naoya 承認によりスコープ拡大込みで一括対応）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可（Naoya ack 前提の L3）

### 昇格・追加提案がある場合の詳細

なし
