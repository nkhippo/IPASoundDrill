# UX データ/表示 監査 + 決定（2026-07-27）

実データ(`wordlist_GA_a1a2_plus_phonics.json` 5397語)・実コードで検証。「データ矛盾・表示未整理」観点の指摘と Naoya 決定。

## 確定した改修（Naoya 承認 2026-07-27）
1. **答え/発音ポイント再設計**: `respell_ga/rp` を主役化（98%被覆・現状未表示）＋ GA/RP 差分は `ga_rp_same_reason`(100%)由来の具体文 ＋ 綴り規則 `pattern`(27%、ある語のみ) ＋ **要注意音は本当に難しい1〜2音に厳選**（現状 t:1 が47音中23音＝平均2.7音/語のノイズ）。`schwa単独注意`は廃止。空要素は非表示。
2. **POS i18n 修正**: `pos` は日本語格納（複合含む）。`UI.pos` 未収載が **1042語(19%)**（複合品詞が生日本語で非JAユーザーに露出 ~390語 / `pos`未設定652語＝「—」）。→ 実行時に `/` 分割して基礎品詞をマップ結合＋未設定補完。
3. **ストリーク（N日連続）撤去**: 実装に streak 計算なし（`renderProgressPage` に無し、オンボの `7`/`312` はハードコード）。CD 3d・オンボから**撤去**。
4. **語彙 GA=RP 重複を1行に畳む**: `GA=RP`バッジ＋同一 RP 行の二重を解消。同一時は1行＋「GA=RP」。

## 監査で確認した事実（根拠）
- SRS「チェック少を優先出題」は `frequencyWeight=max(1,(CHECK_MAX+1)−checkCount)` で**実装済**＝主張は正しい ✓（撤去しない）。
- `respell_ga/rp`(98%)・`def`(100%)・`ga_rp_same_reason`(100%) は**ロード済だが表示未活用**。
- `pattern`(綴り規則) は 27%、`ipa_actual_ga`(narrow) は 9%（→2 IPA 表示は少数）。
- gloss フォールバック（`gloss[LANG]||en||w`）・`対象N語`(pool.length) は妥当。

## 追加サイクル: 2c / 2d / 全般（2026-07-27）
- **2c(Mode B MCQ / neighbors)**: 誤答選択肢に `neighbors` 使用。**<3近傍=982語(18%)・0近傍=284語(5%)**（avg 6.0）。<3 の語は band/preset へフォールバック＝**音的近傍でないランダム誤答**に劣化。バグではないが選択肢の質が約2割で低下 → 将来 `gen_neighbors` の拡充 or フォールバック改善を検討（今回はスコープ外・記録のみ）。
- **2d(connected 201 / weak 36)**: `carriers`(例文)・`ipa_strong`(弱↔強)は**正しく使用**✓。`weak_forms` は36件と小プール（コンテンツ量の注記）。
- **[誤検知→解消] ga_rp_same 型**: connected/weak の `ga_rp_same` は **boolean(false/true)** で正常（当初 string と誤読 → Python str() の表示由来。実 JSON は bare bool）。**バグ無し**。
- **summary**: 弱点 `PH[s].lab/.mouth` 参照。PH 未収載音があると `p.lab` で例外の可能性（防御的 guard 推奨・軽微）。
- **onboarding のモック数値**: `7`(日連続=撤去対象)・`312`(語) はハードコードのプレビュー値。streak 撤去に合わせ `312` 側も実値化 or モック明示を検討（軽微）。
- **verified-clean**: gloss フォールバック / `対象N語`(pool.length) / carriers / ipa_strong / SRS 重み付け。

## 進め方
内容ロジック（品詞分割マップ・trap 厳選・reason 文マップ・respell 表示・空時分岐）は**コード＋データの判断**のため、ClaudeCode が確定仕様（表示要素/データ源/条件/空時挙動）を作り、視覚は CD 指示へ落とす。データ不能なものは混ぜない。
