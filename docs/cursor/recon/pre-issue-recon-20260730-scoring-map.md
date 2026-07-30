# Pre-Issue Recon — Issue #213 判定ロジック調査（scoring map）

担当: issue-handler（ClaudeCode 同一セッション） / 対象 Issue: #213（親 EPIC #209）
調査対象: `apps/web/src/index.template.html`（唯一の grep 対象、ホワイトリスト内で完結）

## 1. 全体構造

`apps/web/src/index.template.html` にはインライン `<script>` が 3 個存在する:

| 行 | 内容 |
|---|---|
| 21 | `application/ld+json`（JSON-LD、判定ロジックなし） |
| 1789–5858 | メインアプリケーション本体（関数 436 個、状態管理・DOM 操作・判定ロジックすべて） |
| 5859–5871 | Vercel Analytics opt-out（判定ロジックなし） |

判定ロジック抽出対象はメインスクリプト（1789–5858 行）内の関数群。

## 2. 4-step 別 + connected speech / weak forms 別の関数マッピング

`docs/features/*.md` の「採点則・定数」節を正本として突合した結果、実際に ok/bad 判定則を持つのは
**2a（Decode）/ 2b（Encode）/ 2d（Connected speech・Weak forms）/ reveal** のみ。
1a（トップ）・3a–3c・3h は「採点則・定数: 該当なし」と明記されている。3d（学習状況）は「卒業判定」という
判定ロジック（マーキング値 3 = 卒業）を持つ。

| Step / 機能 | 判定ロジック関数（現在地: `apps/web/src/index.template.html`） | 抽出先 |
|---|---|---|
| 2a Decode（綴り入力） | `norm(s)` (L5284), `spellCheck(text,word)` (L5285), `decodeCheck()` (L5289, DOM 呼び出し元・非対象) | `packages/core/src/scoring/decode.ts` |
| 2b Encode（IPA 組み立て） | `tokenize(raw)` (L3476), `stripStress(tk)` (L5359), `lcsMark(target,user)` (L5360), `encodeCheck()` (L5368, DOM 呼び出し元・非対象) | `packages/core/src/scoring/encode.ts` |
| 2b 補助（tokenize 依存） | `nucleusIndex`, `phonemesOf`, `syllableCount`, `stressSyllable` (L3482–3485), `multiList`/`vowelSet` 用定数 `MULTI_GA`/`MULTI_RP`/`VOWELS_GA`/`VOWELS_RP` (L3468–3471) | `packages/core/src/scoring/encode.ts`（tokenize と同一ファイルに同居する既存構造を踏襲） |
| 2d Connected speech | `isConnectedItem(c)` (L2797), `csTypeLabel(type)` (L2804), `csRuleText(c)` (L2810), `pickCarrier(c)` (L5199), `capCarrierBefore(before)` (L5203) | `packages/core/src/scoring/connectedSpeech.ts` |
| 2d Weak forms | `isWeakItem(c)` (L2798), `activeStrongIpa(c)` (L2799) | `packages/core/src/scoring/weakForms.ts` |
| 3d 学習状況（卒業判定） | `itemCefrLabel(c)` (L3685), `progressPoolForDrill(drillId)` (L2027), `computeDrillProgress(drillId,marks)` (L2035) | `packages/core/src/scoring/step3.ts` |
| reveal（Encode フィードバックの音素色分け） | `reveal()` 内の LCS marker 計算部分（L5578–5584、`tokenize`/`stripStress`/`lcsMark` を呼び出し `marker(k,t)` 関数を生成する箇所のみ抽出。DOM 更新本体は非対象） | `packages/core/src/scoring/reveal.ts` |
| 1a / 3a–3c / 3h | 該当なし（`docs/features/*.md` に「採点則・定数: 該当なし」と明記） | 抽出対象外 |

## 3. 型化対象の JSON schema（`docs/data-contract.md` §1 より抽出）

契約 4 JSON（wordlist / connected_speech / weak_forms / guide）+ i18n:

- `wordlist_GA_a1a2_plus_phonics.json`（`packages/core/data/wordlist.json`）: §2 のフィールド一覧（`w`/`ipa`/`rp_ipa`/`cefr`/`pos`/`src`/`pattern`/`group`/`gloss`/`ipa_actual_ga`/`ipa_actual_rp`/`respell_ga`/`respell_rp`/`def`/`neighbors`/`neighbors_rp`/`ga_rp_same`/`ga_rp_same_reason`）
- `data/connected_speech.json`（`packages/core/data/connected_speech.json`）: §3 のフィールド一覧（`id`/`w`/`ipa`/`rp_ipa`/`cs_type`/`level`/`cefr`/`cs_rule`/`gloss`/`carriers`/`ga_rp_same`/`ga_rp_same_reason`。実データには `ipa_strong`/`rp_ipa_strong` も存在せず — 実データ確認要 §4 参照）
- `data/weak_forms.json`（`packages/core/data/weak_forms.json`）: §3 のフィールド一覧（`id`/`w`/`ipa`/`strong_ipa`/`level`/`cefr`/`cs_rule`/`carrier`。実データ確認では `ipa_strong`/`rp_ipa_strong`/`carriers`（複数形）を実際に持つ — §4 参照）
- `data/guide.json`（`packages/core/data/guide.json`）: §3、8 セクション × 6 言語
- `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json`: §5、top-level keys 一覧

## 4. 実データと `docs/data-contract.md` の差異（重要・型定義の根拠）

`packages/core/data/weak_forms.json` の実データを確認した結果、`docs/data-contract.md` §3 の記載
（フィールド: `id`, `w`, `ipa`, `strong_ipa`, `level`, `cefr`, `cs_rule`, `carrier`）と実データのフィールド名が異なる:

- 実データ: `ipa_strong` / `rp_ipa_strong`（`strong_ipa` ではない）、`carriers`（配列、`carrier` 単数ではない）、`src: "weak_form"`、`ga_rp_same` / `ga_rp_same_reason` あり
- コード側 `activeStrongIpa(c)`（L2799）も `c.rp_ipa_strong || c.ipa_strong || c.ipa` を参照しており実データと一致

`packages/core/src/types.ts` は**実データ + 実コード参照フィールド**を正として型定義する（`docs/data-contract.md` の記載は
doc-sync 対象の乖離だが、本 Issue の非対象範囲＝docs 内容更新のため、本 Recon での指摘のみに留め `docs/data-contract.md` 自体は変更しない）。

## 5. 抽出方針（Phase 3 での実装方針）

- 各関数は元の実装から**ロジック不変**で移植する。ただし以下は「グローバル依存の除去」のための機械的な引数化であり、
  ロジック改良ではない:
  - `tokenize(raw)` → `tokenize(raw, accent)`（元は module-level `ACCENT` を `multiList()`/`vowelSet()` 経由で参照）
  - `progressPoolForDrill(drillId)` → `progressPoolForDrill(drillId, pools, cefrLevels, itemCefrLabelFn)`（元は module-level `PRESET`/`CONNECTED`/`WEAK`/`progressCefrSelected` を参照）
  - `computeDrillProgress(drillId, marks)` → `computeDrillProgress(drillId, pool, marks, checkMax, sessionItemKeyFn)`（元は `progressPoolForDrill` 内部呼び出し + module-level `CHECK_MAX` を参照）
  - `csTypeLabel(type)` → `csTypeLabel(type, translateFn)`（元は module-level `t()` i18n 関数を参照）
- Web 側（Phase 4）は元のグローバル依存シグネチャを維持する**同名の薄いラッパー関数**を `index.template.html` に残し、
  ラッパー内部で core の純粋関数を呼ぶ（呼び出し元 400+ 箇所を書き換えず、判定ロジック本体のみを core へ移動する
  ことで「最小差分」と「見た目・機能完全不変」を両立する）。

## 6. Phase 0 完了時点の中断判断

本 Recon は `apps/web/src/index.template.html` の grep・読解のみで完結し、ホワイトリスト外への参照・変更は発生していない。
Issue #213 本文の halt 条件「Recon がホワイトリスト（`apps/web/src/index.template.html` の grep のみ）内で完結する場合は
halt せず継続してよい」に該当するため、Naoya の中間チェックを待たず Phase 1 以降へ継続する。
