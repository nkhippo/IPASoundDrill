# [EPIC-03] packages/core/src/ TS 実装: 型定義 + 統一 loader + 判定ロジック抽出 (#213) — 実装レポート

## 関連 Issue / PR

- Issue: #213（親 EPIC #209、先行 Issue #212 / PR #216 マージ済み）
- PR: 本コミット時点で作成予定
- Agent: issue-handler（ClaudeCode 同一セッション、Naoya 明示委譲）

## Issue 背景（Issue 本文から要約）

- **改修分類**: Complexity Level L3 / Change Pattern C4（TypeScript 導入 + core パッケージ化）, C5（runtime data schema 型定義正本化）, C7（AI readability: 判定ロジック一元化）
- 現行の 4-step 判定ロジックは `apps/web/src/index.template.html` の inline `<script>` に集約されている。Mobile（#EPIC-06/07）が同じ判定を再実装すると乖離するため、`packages/core/src/scoring/` に TS で抽出し、Web/Mobile 両者から `workspace:*` で consume できるようにする。
- Phase 0（Recon）〜Phase 5（デグレ確認）を単一 PR で実施。

## 実装内容

- **Phase 0（Recon）**: `apps/web/src/index.template.html` を grep し、4-step 別の判定ロジック関数マップを作成（`docs/cursor/recon/pre-issue-recon-20260730-scoring-map.md`）。Recon はホワイトリスト（同ファイルの grep のみ）内で完結したため、Issue #213 本文の規定に従い halt せず継続。
- **Phase 1（型定義）**: `packages/core/src/types.ts` に wordlist / connected_speech / weak_forms / guide の型 + i18n top-level key union を定義。Recon で判明した実データと `docs/data-contract.md` §3 の記載差異（`weak_forms.json` の実フィールドは `strong_ipa`ではなく `ipa_strong`/`rp_ipa_strong`、`carrier`ではなく`carriers`）は実データ・実コード参照を正として型定義（docs 内容自体は非対象範囲のため変更せず、Recon MD に指摘のみ記録）。
- **Phase 2（loader）**: `packages/core/src/loaders.ts` に `DataLoader` インターフェイス + Web 用 `createFetchLoader(baseUrl)` + Mobile 用 `createBundleLoader(bundle)` を実装。
- **Phase 3（判定ロジック抽出）**: `packages/core/src/scoring/{decode,encode,step3,reveal,connectedSpeech,weakForms}.ts` に、`apps/web/src/index.template.html` の判定関数をロジック不変で移植（元実装が参照していた module-level グローバル変数 `ACCENT`/`PRESET`/`CONNECTED`/`WEAK`/`progressCefrSelected`/`CHECK_MAX`/`t()` はすべて明示引数化。ロジック改良ではなくグローバル依存の除去）。各 `*.test.ts` に Vitest ユニットテスト（41 tests）を追加。
- **Phase 4（Web の import 化）**: `apps/web/scripts/build-i18n-html.js` を拡張し、esbuild で `packages/core/src/index.ts` を単一 ESM バンドル（`apps/web/public/core-bundle.js`、未追跡ビルド成果物）へバンドルするステップを追加。`apps/web/src/index.template.html` のメインスクリプトを `<script type="module">` 化し、冒頭で `import * as Core from "/core-bundle.js"` を追加。判定ロジック本体を持っていた関数（`norm`/`spellCheck`/`tokenize`/`nucleusIndex`/`phonemesOf`/`syllableCount`/`stressSyllable`/`stripStress`/`lcsMark`/`encodeCheck`内部/`reveal()`内の marker 計算/`isConnectedItem`/`isWeakItem`/`activeStrongIpa`/`csTypeLabel`/`csRuleText`/`pickCarrier`/`capCarrierBefore`/`itemCefrLabel`/`progressPoolForDrill`/`computeDrillProgress`）は、元のシグネチャ・呼び出し規約を保つ薄いラッパーに置き換え、内部で `Core.*` を呼ぶ形にした（呼び出し元 400+ 箇所を書き換えずに済ませ、最小差分で「見た目・機能完全不変」を担保）。
- **Phase 5（デグレ確認）**: 下記「動作確認」参照。

## 変更ファイル

```
- packages/core/src/types.ts (A)
- packages/core/src/loaders.ts (A)
- packages/core/src/index.ts (A)
- packages/core/src/scoring/decode.ts (A)
- packages/core/src/scoring/decode.test.ts (A)
- packages/core/src/scoring/encode.ts (A)
- packages/core/src/scoring/encode.test.ts (A)
- packages/core/src/scoring/step3.ts (A)
- packages/core/src/scoring/step3.test.ts (A)
- packages/core/src/scoring/reveal.ts (A)
- packages/core/src/scoring/reveal.test.ts (A)
- packages/core/src/scoring/connectedSpeech.ts (A)
- packages/core/src/scoring/connectedSpeech.test.ts (A)
- packages/core/src/scoring/weakForms.ts (A)
- packages/core/src/scoring/weakForms.test.ts (A)
- packages/core/tsconfig.json (A)
- packages/core/package.json (M)
- docs/cursor/recon/pre-issue-recon-20260730-scoring-map.md (A)
- docs/agent-reports/issue-handler-issue-213-core-ts.md (A, 本ファイル)
- apps/web/scripts/build-i18n-html.js (M)
- apps/web/package.json (M)
- apps/web/.gitignore (M, `public/core-bundle.js` を追加 — 生成物のため未追跡。ホワイトリスト外だが Issue 明記の
  build-i18n-html.js 拡張に伴う必須の companion 変更。#212 の `public/data,i18n,fonts` ignore 追加と同じ判断枠組み)
- apps/web/src/index.template.html (M)
- pnpm-lock.yaml (M, esbuild/typescript/vitest devDependency 追加に伴う lockfile 更新)
```

## デグレ防止検証

- 変更範囲: `packages/core/src/**`（新規）+ `apps/web` のビルドスクリプト・テンプレートへの import 配線のみ。
  ランタイム契約 JSON の内容は一切変更していない（md5 一致、後述）。
- 実装中の自己判断による追加変更:
  1. `apps/web/.gitignore` に `public/core-bundle.js` を追加（上記「変更ファイル」参照、ビルド成果物の未追跡化のため必須）。
  2. `apps/web/package.json` の `typecheck` script は Issue に明記のなかった具体的なコマンド内容（`tsc --allowJs --checkJs` で `scripts/*.js` を対象化）を自己判断で追加。ビルドスクリプト自体は plain JS（`.ts` 化していない）ため、Issue の「tsc devDep」要求を満たす最小限の使途として実装。
- 実装中に発覚した懸念:
  - **並行 Issue #214（`docs/path-update-214` ブランチ）が同一ワークツリーで稼働しており、`docs/*.md`（`OPERATIONS.md`/`change-classification.md`/`data-contract.md`/`doc-map.md`/`features/*.md`/`guardrails.md`/`pipeline.md`/`repo-map.md`/`tts-design.md`/`workflow.md`）が未コミットの状態で作業ツリーに存在した。本 Issue の非対象範囲（`docs/**` は #EPIC-04/他 Issue スコープ）に厳格に従い、これらのファイルは一切 `git add` せず、コミットには含めていない（stage 対象を本 Issue のホワイトリストのみに限定して確認済み）。

## 動作確認

- `pnpm --filter @ipasounddrill/core run typecheck` → PASS（エラーなし）
- `pnpm --filter @ipasounddrill/core test`（Vitest）→ **41 tests PASS**（decode 3 / encode 13 / reveal 2 / connectedSpeech 9 / weakForms 6 / step3 8）
- `pnpm --filter @ipasounddrill/web run build` → 成功。`apps/web/public/core-bundle.js`（esbuild ESM バンドル、366 行）+ 6 言語 `index.html` 生成を確認（生成物は `apps/web/.gitignore` により未追跡）
- **4-step 判定結果の同一性検証**（Issue 完了定義「develop と本 PR で同じ入力に対し同じ判定」に対応）: `origin/develop` の `apps/web/src/index.template.html`（本 Issue 着手直前の baseline）から `norm`/`spellCheck`/`tokenize`/`nucleusIndex`/`syllableCount`/`stressSyllable`/`stripStress`/`lcsMark` を brace-matching で厳密抽出し、Node `vm` サンドボックスで実行。実データ（wordlist 5,397 語 × GA/RP、connected_speech 201 句、weak_forms 36 語）に対して旧実装と `packages/core` の新実装の出力を全数比較した結果、**130,914 チェック中 failure 0 件**（tokenize/nucleusIndex/syllableCount/stressSyllable/spellCheck/stripStress/lcsMark/checkEncode(exact・no-stress 両パターン)/isConnectedItem/csRuleText/isWeakItem/activeStrongIpa(ga/rp)の全出力が完全一致）。検証スクリプトは本 PR 外のスクラッチ領域で実行し、リポジトリには含めていない（再現手順は本レポート末尾に記載）。
- JSON データ md5 不変証明（Issue 完了定義）:

  | Asset | md5（develop 相当） | md5（本 PR） | 判定 |
  |---|---|---|---|
  | `packages/core/data/wordlist.json` | `54937707f733d1f906c99ba119444d5a` | `54937707f733d1f906c99ba119444d5a` | 一致 |
  | `packages/core/data/connected_speech.json` | `7ebc1be2fcaa774d7696dbba5c07df55` | `7ebc1be2fcaa774d7696dbba5c07df55` | 一致 |
  | `packages/core/data/weak_forms.json` | `a853cd530443edfd9b7fa3a11e11a116` | `a853cd530443edfd9b7fa3a11e11a116` | 一致 |
  | `packages/core/data/guide.json` | `68c34b42a88b32823ed5e8ef4106258a` | `68c34b42a88b32823ed5e8ef4106258a` | 一致 |
  | `packages/core/fonts/DoulosSIL-Regular.woff2` | `90b4ee43f349d4a796b2dc2d2bb43fee` | `90b4ee43f349d4a796b2dc2d2bb43fee` | 一致 |

- `python3 tools/validate/validate_i18n.py` → 警告 5 件（pre-existing、#212 レポートと同一の既知警告。ハード不整合なし）
- `python3 tools/validate/validate-markdown-refs.py --full-scan` → V1-V8 のうち V7 に 1 件 FAIL（`docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md` の historical 参照切れ。`git log` で本 Issue 着手前から存在する pre-existing 事項と確認済み、本 PR は当該ファイルに触れていない）
- **Vercel preview 動作確認スクショ（Issue 完了定義・`docs/workflow.md` §8）**: **未実施 — 技術制約により添付できない**。本セッションには Chrome/computer-use 等のブラウザ操作ツールが提供されておらず、Vercel preview URL への実機アクセスができない。上記の (a) Vitest 41 tests、(b) 実データ全数の新旧判定ロジック equivalence 検証（130,914 チェック）、(c) ローカルビルド成功確認、(d) JSON md5 不変証明 の 4 点で判定ロジックの同一性・ビルド成功は担保しているが、実ブラウザでの見た目・操作確認は**未実施**。**Naoya に本 PR の Vercel preview URL（`ipa-sound-drill-git-feature-core-ts-213-nkhippos-projects.vercel.app` 相当）での 4-step 全機能実機検証を Rv の前提として依頼する**（`docs/workflow.md` §8 の代替手続きに従う）。
- 既存機能への影響: `apps/web/src/index.template.html` の判定ロジック呼び出し元（400+ 箇所）はシグネチャ不変の薄いラッパー経由で維持しており、設計上の影響なし（上記 equivalence 検証で裏付け）。
- データ整合性: ランタイム契約 8 パスのうちデータ内容は無変更（md5 一致）。TTS（`GAS_TTS_URL`）・IPA font には触れていない。

## 実装過程での気づき

- Recon で判明: `docs/data-contract.md` §3 の `weak_forms.json` フィールド一覧（`strong_ipa`/`carrier`）が実データ（`ipa_strong`/`rp_ipa_strong`/`carriers`）と乖離している。本 Issue の非対象範囲（docs 内容更新は他 Issue）のため `docs/data-contract.md` 自体は変更せず、Recon MD に記録するに留めた。doc-sync のフォローアップ Issue化を推奨（後続への影響 参照）。
- 同一ワークツリー上で並行 Issue #214（governance docs のパス更新）が稼働しており、`docs/*.md` に未コミットの変更が存在した。本 Issue のコミットには一切含めていない（`git add` は本 Issue のホワイトリストファイルのみに限定して実施）。

## 後続への影響

- `docs/data-contract.md` §3 の `weak_forms.json` フィールド一覧の doc-sync（`strong_ipa`→`ipa_strong`/`rp_ipa_strong`、`carrier`→`carriers`）を別 Issue で対応することを推奨。
- #EPIC-06/07（Expo Mobile 初期化・4-step MVP 実装）は本 Issue で確定した `packages/core` の型・loader・scoring 関数を `workspace:*` で consume できる。

## 残課題・申し送り

- Vercel preview 実機スクショが未実施（技術制約、上述）。Naoya の実機検証待ち。
- `docs/data-contract.md` §3 の weak_forms フィールド名 doc-sync（上記「後続への影響」）。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: TypeScript 新規導入 + ランタイム契約 JSON の型定義正本化 + 判定ロジック一元化という複合変更であり、L3 相当の検証（md5・equivalence・Naoya ack）が実際に必要だった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C4（stack 導入）, C5（schema 型定義）, C7（AI readability）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（データ内容 md5 不変、パス自体も無変更）
- [x] i18n schema への影響なし（`tools/validate_i18n.py` 既知警告のみ、新規不整合なし）
- [x] URL 構造への影響なし（`core-bundle.js` は新規静的アセット追加のみ、既存 URL 契約は無変更）
- [ ] ビルドシステムへの影響なし → **影響あり**: `apps/web` のビルドに esbuild バンドルステップを追加（意図した Phase 4 の変更、Issue 本文で明記済み）
- [x] AI 参照ドキュメント Category A への影響なし（docs/** 内容は非対象範囲、変更していない）
- [x] 既存ファイルパスへの依存関係が壊れていない（ランタイム契約パス無変更）

### Phase 分割の妥当性

- 想定 Phase 数: 6（Phase 0〜5）
- 実際の Phase 数: 6（Phase 0〜5、想定どおり）
- 相互依存の発生有無: なし（Phase 0 の Recon 結果に基づき Phase 1〜3 を実施、Phase 4 は Phase 1〜3 の成果物に依存する想定どおりの順序）

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし

---

## 付録: equivalence 検証の再現手順（本 PR には含まれないスクラッチスクリプト）

1. `git show origin/develop:apps/web/src/index.template.html` から `norm`/`spellCheck`/`tokenize`/`nucleusIndex`/`syllableCount`/`stressSyllable`/`stripStress`/`lcsMark`（+ 依存定数）を brace-matching で抽出し、単一 JS ファイルへ書き出す。
2. Node `vm.createContext` に `ACCENT` を注入し、抽出コードを実行して旧実装の関数群をロードする。
3. `packages/core` を `tsc` でビルド（`dist/index.js`）し、`Core.encode.*` / `Core.decode.*` / `Core.connectedSpeech.*` / `Core.weakForms.*` を import する。
4. `packages/core/data/{wordlist,connected_speech,weak_forms}.json` の全エントリに対し、GA/RP 両アクセントで旧実装 vs 新実装の出力を突合する。
