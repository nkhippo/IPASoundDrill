# 記載例: ドリル答えペイン（2a/2b）の UX brief（IPASoundDrill 実データ）

`ux-brief` skill の出力例。実データ(`wordlist_GA_a1a2_plus_phonics.json` 5397語)を実測して埋めたもの。**§A の被覆率が数値で入っている**のがポイント。

---

## A. データ&実現性 ★コード側が実測
| フィールド | 型 | 被覆率 | 備考 |
|---|---|---|---|
| ipa (GA) | string | 100% | 正解 GA |
| rp_ipa | string | 100% | 正解 RP |
| ga_rp_same | bool | 100% | GA/RP 実質同一か |
| ga_rp_same_reason | string | 100% | rhoticity/weak_vowel/trap_bath/ga_allophony/identical… |
| respell_ga / respell_rp | string | 98% | "JA-kuht" 等。**ロード済だが未表示** |
| gloss[lang] | obj | 100% | 母語訳 |
| pattern | string | 27% | 綴り規則 "y → /aɪ/"。**ある語のみ** |
| def | string | 100% | 英語定義 |
| S.built（実行時） | array | — | 2b でユーザーが組んだ IPA（＝「あなたの解答」に使える） |
- **派生できる値**: 強勢位置・schwa 有無・音節数（IPA から）。
- **データに“無い/薄い”もの**: 綴り規則 73% 欠（常時表示不可）。streak（連続日数）は**未追跡**。narrow IPA(`ipa_actual_ga`)は 9%。
- **未活用の good データ**: respell(98%)・ga_rp_same_reason(100%) が未表示。
- **地雷**: 要注意音の元 `t:1` が 47音中23音に付与 → そのまま出すと平均2.7音/語で雑多。品詞 `pos` は日本語格納・対応表未収載19%で他言語に漏れる。

## B. UX 意図
- 誰が/いつ: 学習者が 1問 回答直後。主目的=**自分の発音イメージを正す**。
- 主動作: 「覚えた」チェック（手動 SRS。少チェック語を優先出題は実装済）。
- 配慮: 入力せず次々進める人もいる → 2b で未入力なら「あなたの解答」を出さず正解に切替。

## C. 表示ルール
- 出す: 正解/不正解バッジ → (2b) あなたの解答=`S.built` → 正解語/IPA → **respell（主役）** → GA/RP（`ga_rp_same` で同一なら1行に畳む）→ 差分は `ga_rp_same_reason` 由来の具体文 → 発音ポイント（`pattern` があれば綴り規則＋**要注意音は難音1〜2に厳選**）→ 覚えた n/3 → つぎへ。
- 空状態: pattern 無ければ綴り規則行を出さない。発音ポイントが空なら枠ごと非表示。
- 畳み: GA=RP は1行＋「GA=RP」（重複 RP 行を出さない）。
- i18n: pos は `/` 分割して基礎品詞をマップ結合（生日本語を出さない）。
- 情報量: 主役=respell と正解 IPA。補助=GA/RP差分・発音ポイント。schwa 単独注意は出さない。

## D. デザイン制約
- Mood B トークン。答えペイン=panel 地、枠付きサブカードで区切る（CD 2a-pc/2b-pc 準拠）。`つぎへ →`=teal。
- PC=2ペイン統合カード / モバイル=単カラム。

## E. レビュー観点（この brief から出た指摘＝実際に修正した項目）
- [x] 主張≠実装 → streak 撤去
- [x] i18n 漏れ → pos 分割マップ
- [x] 冗長 → GA=RP 畳み
- [x] 雑多 → 要注意音 厳選・schwa 単独廃止
- [x] 宝の持ち腐れ → respell 主役化・reason 具体文
