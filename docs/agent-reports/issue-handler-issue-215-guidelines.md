# [EPIC-10] ドキュメント修正・Bug 改修の作業ガイドライン更新（monorepo 対応） (#215) — 実装レポート

## 関連 Issue / PR

- Issue: #215
- 親 EPIC: #209
- 先行 Issue: #212（`EPIC-02`、PR #216、merge 済み。monorepo 物理移設完了 — 本 Issue の着手前提）
- 並行 Issue: #214（`EPIC-04`、docs path 更新）— 本レポート作成時点で未起票/PR 未作成のため、`docs/features/*.md` の Phase 4 は本 PR で見送り（詳細は「残課題・申し送り」参照）
- PR: （本 PR）
- Agent: claude-code（issue-handler、同一セッション ClaudeCode 相当、Naoya 明示委譲）

## Issue 背景（Issue 本文から要約）

monorepo 化（EPIC #209）により `apps/web/` / `apps/mobile/`（実装後） / `packages/core/` / `tools/` の 4 ゾーン構成になったため、
Issue 起票・実装・レビュー・Bug 記録の運用ルールが旧単一構成（`src/index.template.html` 前提）のままでは機能しない。
本 Issue はドキュメント修正・Bug 改修の作業ガイドラインを monorepo 前提に再設計する。

- **改修分類**: L3 × [C1, C7]（AI 協業フローの再設計に該当）
- **Phase 構成**: Phase 0（追加 Recon）〜Phase 10（デグレ確認）の 11 Phase

## 実施内容サマリ

Phase 0, 1, 2, 3, 5, 6, 7, 8, 9, 10 を実施。**Phase 4（`docs/features/*.md` テンプレ更新）は本 PR では見送り**（理由は「残課題・申し送り」参照）。

### Phase 0: 追加 Recon（PR 本文にインライン記載、別ファイル化なし）

`.claude/agents/*.md` / `.cursor/rules/*.mdc` / `.github/ISSUE_TEMPLATE/*.md` の旧 path 依存箇所を grep で抽出した結果:

```
$ grep -n "src/index.template.html\|scripts/gen_\|scripts/validate\|scripts/merge_\|scripts/paths\|scripts/build-i18n-html" .claude/agents/*.md
.claude/agents/consistency-auditor.md:66:   → source（`src/index.template.html`）→ `impact-ledger.json`（それぞれ現存するもの）。
.claude/agents/issue-handler.md:49:  - wordlist / `rp_ipa` / `neighbors` / connected_speech / weak_forms を触ったら該当の再カウント・`scripts/gen_*.py` 再実行
.claude/agents/pr-reviewer.md:84:  開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）を
.claude/agents/pr-reviewer.md:94:  wordlist 再カウント一致、`scripts/gen_*.py` 再実行の diff がゼロ。（12観点 #4, #5）

$ grep -n "src/\|tools/\|scripts/" .cursor/rules/dev-flow.mdc
（ヒットなし。ただし frontmatter globs に `gas/**/*.gs`（旧 path）を検出、別途修正）

$ grep -n "src/\|tools/\|scripts/" .github/ISSUE_TEMPLATE/*.md
.github/ISSUE_TEMPLATE/feature.md:24:  - `scripts/<file>.py`
```

加えて、上記 grep では拾えなかった `index.html`（テンプレ表記のみで `.template` 無し）・`data/*.json`（`packages/core/data/` 未反映）・
`i18n/*.json`（同）等の暗黙参照も、Phase 10 デグレ確認の網羅 grep で追加検出し修正した（下記参照）。

### Phase 1: `docs/workflow.md`

- §2a: platform 明示義務（`platform:web` / `platform:mobile` / `platform:shared` / `platform:tools`）を追加
- §4: ファイルホワイトリスト表現の 4 ゾーン指針（ゾーン跨ぎは原則分割、`packages/core` cohesive consolidation 例外）、UI 仕様参照の Web/Mobile 分離、スクショ対象範囲の Web/Mobile 別記載義務を追加
- §7: ゾーン別レビュー深度（`packages/core` 変更は `apps/web`/`apps/mobile` 双方の回帰確認）を追加
- §14: Pre-Issue Recon 出力先が `docs/cursor/recon/` のまま変わらないことを明記
- 旧 path 記述（`index.html` 大ファイル参照、`tools/validate_i18n.py`）を新 path に修正

### Phase 2: `docs/bug-knowledge.md`

- 「発生層」分類軸（`web` / `mobile-ios` / `mobile-android` / `core` / `shared`）を新設
- 記録フォーマットに「発生層」「発生プラットフォームの詳細」「修正箇所（core/app）」を追加
- 月次レビュー観点に「プラットフォーム偏り」「core 起因の波及」を追加
- 根本原因カテゴリ表の「ランタイム契約の破壊」典型例を新 path（`apps/web/src/index.template.html` / `apps/mobile/src/`）に更新

### Phase 3: `docs/change-classification.md`

- C6（Product behavior / UX）に Mobile 特有 UX（gesture / haptics / offline / IAP / push）を追記
- C5（Runtime data/schema contract）の追加ルールに Mobile 側の扱い（`packages/core/data` 正本 + build 時 copy or import）を明記
- **Level 判定条件「Mobile iOS/Android 両プラットフォーム影響 = L3」の追加は保留**（下記「Naoya 判断が必要な項目」参照。既存条件④で個別判断する運用を明記）
- Mobile 固有 Change Pattern の新規追加はしていない（Issue 非対象範囲どおり、既存 C6 拡張のみ）
- 旧 path 記述（`src/index.template.html`、`index.html`）を新 path に修正

### Phase 5: `docs/guardrails.md`

- md5 検証対象の拡張: `packages/core/data/*.json`（正本）+ `apps/web/public/data/*.json` + `apps/mobile/assets/data/*.json`（実装後）の 3 箇所一致を明記
- doc-sync guardrail に §6a「ゾーン別 doc 更新義務表」を新設
- §9 UI 仕様参照ポリシー・§10 ランタイム契約検証ガードの旧 path 記述を新 path（`apps/web/src/index.template.html` / `apps/mobile/src/` / `packages/core/i18n` / `tools/validate/validate_i18n.py`）に修正
- 12 観点 #3・#4 の説明文にある旧 path（`data/*.json`、`scripts/gen_impact_ledger.py`）を新 path に修正

### Phase 6: `.github/ISSUE_TEMPLATE/*.md`

- `bug.md`: 「対象プラットフォーム」チェックボックス（Web / Mobile iOS / Mobile Android / Core / Shared）、「発生層」欄、根本原因記録テーブルへの「発生層」「修正箇所」列を追加。関連コード例の旧 path を修正
- `feature.md`: 「対象プラットフォーム」チェックボックス、「対象ゾーン」欄（4 ゾーン）を追加。実装範囲の対象ファイル例・ランタイム契約チェックリストの旧 path を新 path に修正
- `docs.md`: 「対象ゾーン」欄を追加
- `agent-task.md`: 「対象ゾーン」欄を追加

### Phase 7: エージェント設定

- `issue-handler.md`: path 前提を新構造に更新（`tools/validate/validate_i18n.py`、`tools/data-pipeline/gen_*.py`）、4 ゾーン跨ぎの halt トリガー明示を追加
- `pr-reviewer.md`: ゾーン逸脱観点を運用ゾーン/4 開発ゾーンの表現に更新、ゾーン別横展開観点（`packages/core` 変更は `apps/web`/`apps/mobile` 双方の回帰確認）を追加、契約検証コマンドの path を更新
- `consistency-auditor.md`: 設計トレースチェーンの source 参照を Web/Mobile/core 別記に更新、監査観点に「4 ゾーン間整合」を追加
- `.cursor/rules/dev-flow.mdc`: Cursor 固有ノートに monorepo 4 ゾーンの halt トリガー注記を追加、frontmatter globs の旧 `gas/**/*.gs` を `tools/tts/gas/**/*.gs` に修正（TS/TSX 拡張子も追加）

### Phase 8: `CLAUDE.md`

- 絶対ルール §6: UI 仕様の正本を Web（`apps/web/src/index.template.html`）/ Mobile（`apps/mobile/src/`、実装後）に分離
- 絶対ルール §7: platform 明示義務を追記
- タスク種別対応表に `apps/mobile/**` の変更に関する行を追加
- ランタイム契約ガードレール節の旧 path（`tools/validate_i18n.py`、`scripts/gen_*.py`）を新 path に修正

### Phase 9: `AGENTS.md`

- 絶対厳守 §5 を Web/Mobile 別記述に更新
- 絶対厳守 §7（新設）として monorepo 4 ゾーンの明文化・halt トリガー・`packages/core` 変更時の双方確認義務を追加

### Phase 10: デグレ確認

#### 旧運用ルール残骸検出（grep、ホワイトリスト内ファイルのみ対象）

```bash
$ grep -n "src/index.template.html" docs/workflow.md docs/bug-knowledge.md docs/change-classification.md \
    docs/guardrails.md .github/ISSUE_TEMPLATE/*.md .claude/agents/*.md .cursor/rules/dev-flow.mdc CLAUDE.md AGENTS.md \
    | grep -v "apps/web/src/index.template.html"
（ヒットなし）

$ grep -n "scripts/" docs/workflow.md docs/bug-knowledge.md docs/change-classification.md docs/guardrails.md \
    .github/ISSUE_TEMPLATE/*.md .claude/agents/*.md .cursor/rules/dev-flow.mdc CLAUDE.md AGENTS.md \
    | grep -v "apps/web/scripts/"
（ヒットなし）

$ grep -n 'index\.html' <同上ファイル群> | grep -v "index.template.html"
（ヒットなし、3 件〔workflow.md §14 / bug-knowledge.md カテゴリ表 / change-classification.md §10〕を新 path に修正済み）

$ grep -n '`data/' <同上ファイル群> | grep -v "packages/core/data"
（ヒットなし）
```

いずれも旧 path 前提記述はゼロヒット（`docs/history.md` 等の historical archive は対象外、本 Issue のホワイトリストにも含まれない）。

#### 新運用ルールの相互参照整合（目視確認）

- `docs/workflow.md` §2a の platform 明示義務 ⇔ `.github/ISSUE_TEMPLATE/{bug,feature,docs,agent-task}.md` の「対象プラットフォーム」「対象ゾーン」欄: 整合（テンプレ側に具体的なチェックボックスとして実装）
- `docs/bug-knowledge.md` の発生層分類軸 ⇔ `.github/ISSUE_TEMPLATE/bug.md` の「発生層」欄・根本原因記録テーブル: 整合（同一の 5 分類 `web`/`mobile-ios`/`mobile-android`/`core`/`shared` を使用）
- `docs/change-classification.md` §5 C5 の Mobile 扱い ⇔ `docs/guardrails.md` §3 md5 検証対象拡張: 整合（`packages/core/data` 正本 + web/mobile copy 先の記述が一致）
- `.claude/agents/pr-reviewer.md` のゾーン逸脱観点 ⇔ `docs/workflow.md` §4 ファイルホワイトリスト表現: 整合（4 ゾーン用語・cohesive consolidation 例外の扱いが一致）
- `CLAUDE.md` §6/§7・タスク種別対応表 ⇔ `AGENTS.md` §5/§7: 整合（Web/Mobile 正本分離・platform 明示義務・4 ゾーン明文化の表現を揃えた）

#### サンプル起票テスト（Phase 10 ドライラン、実起票せず）

`.github/ISSUE_TEMPLATE/bug.md`（本 PR 更新後）を使い、「mobile-only の仮想バグ」を起票する想定でテンプレ入力を作成した（実際には起票していない）:

```markdown
【Bug】iOS 機内モードで Connected Speech の TTS が無音になる

## 症状
Mobile iOS（実装後想定）で機内モードにすると、Decode モードの Connected Speech 出題の TTS 再生ボタンを
押しても音が鳴らない（エラー表示なし）。

## 再現手順
1. iPhone 実機で機内モードにする
2. Decode タブ → Connected Speech 出題を開く
3. TTS 再生ボタンをタップ

## 期待される動作
事前バッチ生成 + アプリ同梱の音声がオフラインで再生される（EPIC #209 のオフライン方針どおり）

## 実際の動作
無音。ログにもエラーが出ない

## 環境
- デバイス: iPhone 15 / iOS 18.1
- URL: N/A（native app、Expo ビルド）
- 言語設定: ja

## 対象プラットフォーム（monorepo 4 ゾーン）
- [x] Mobile iOS（`apps/mobile/`、実装後）
- [ ] Web
- [ ] Mobile Android
- [x] Core（`packages/core/`、共有ロジック・データ起因の疑い）
- [ ] Shared

## 発生層
- `mobile-ios`, `core`（疑い。asset bundling 起因か bundler 設定起因かは調査中）

## 優先度
- [x] ⚡ high（利用に支障あり）

## 関連コード（あれば）
（例: `apps/mobile/src/` の該当画面、`packages/core/data/connected_speech.json` の該当エントリ）

---

## 根本原因記録（PR マージ後に記入、Phase 10 ドライランのため仮入力）

| 項目 | 内容 |
|------|------|
| 発生層 | `mobile-ios`, `core` |
| 直接原因 | Expo アセットバンドラーが `packages/core/data/connected_speech.json` 参照先の音声ファイルを
  `apps/mobile/assets/` に含めるビルド設定が漏れていた |
| 根本原因 | `packages/core` の asset manifest と Mobile 側ビルド設定（Expo `app.json` の `assetBundlePatterns`）が
  同期する仕組みが無く、core 側のデータ追加が Mobile ビルドに反映されない構造だった |
| 根本原因カテゴリ | `ランタイム契約の破壊` |
| 修正箇所 | core 側修正（asset manifest 生成）+ app 側修正（`apps/mobile/app.json` の bundle pattern 更新） |
| 再発防止策 | `apps/mobile` ビルド時に `packages/core/data` の全ファイルが manifest に含まれることを検証する CI ステップ追加（提案） |
```

このドライランにより、新テンプレの「対象プラットフォーム」「発生層」「修正箇所」欄が mobile-only バグの記録に機能すること、
`docs/bug-knowledge.md` の記録フォーマットと整合すること、`core` 起因の波及判定が構造的に記述できることを確認した。

## 変更ファイル

```
- docs/workflow.md (M)
- docs/bug-knowledge.md (M)
- docs/change-classification.md (M)
- docs/guardrails.md (M)
- .github/ISSUE_TEMPLATE/bug.md (M)
- .github/ISSUE_TEMPLATE/feature.md (M)
- .github/ISSUE_TEMPLATE/docs.md (M)
- .github/ISSUE_TEMPLATE/agent-task.md (M)
- .claude/agents/issue-handler.md (M)
- .claude/agents/pr-reviewer.md (M)
- .claude/agents/consistency-auditor.md (M)
- .cursor/rules/dev-flow.mdc (M)
- CLAUDE.md (M)
- AGENTS.md (M)
- docs/agent-reports/issue-handler-issue-215-guidelines.md (A, 本レポート)
```

`docs/features/*.md`（代表 3 ファイル + README）は本 PR に含まれていない（下記「残課題・申し送り」参照）。

## デグレ防止検証

- 変更範囲: Issue #215 ホワイトリスト（`docs/workflow.md` / `docs/bug-knowledge.md` / `docs/change-classification.md` /
  `docs/guardrails.md` / `docs/features/*.md`（今回見送り） / `.github/ISSUE_TEMPLATE/*` / `.claude/agents/*` /
  `.cursor/rules/dev-flow.mdc` / `CLAUDE.md` / `AGENTS.md`）内のみ変更。`docs/data-contract.md` / `docs/repo-map.md` /
  `docs/pipeline.md` / `docs/tts-design.md` / `docs/OPERATIONS.md`（非対象範囲・#214 スコープ）には触れていない
- 実装中の自己判断による追加変更: 旧 path 記述の網羅的な修正（Phase 10 で当初の grep パターンに拾われなかった
  `index.html` 汎用参照・`scripts/gen_impact_ledger.py` の具体 path・`.cursor/rules/dev-flow.mdc` frontmatter globs の
  `gas/**/*.gs`）を、Issue Phase 10 の「旧運用ルール残骸検出をゼロヒットにする」完了定義を満たすため追加で修正した。
  いずれも本 Issue のホワイトリスト内ファイルの path 記述修正であり、内容の意味論変更ではない
- 実装中に発覚した懸念: 「Naoya 判断が必要な項目」参照

## 動作確認

- Phase 0〜3, 5〜10 の完了定義をすべて満たす（Phase 4 を除く）
- 既存機能への影響: なし（本 Issue は C1 ドキュメントのみ変更、ランタイム挙動は不変）
- データ整合性: 対象外（ドキュメントのみ、ランタイム契約 8 パスの実体には触れていない）

## 実装過程での気づき

- 本 Issue のホワイトリスト（`docs/workflow.md` / `docs/bug-knowledge.md` / `docs/change-classification.md` /
  `docs/guardrails.md` / `CLAUDE.md` / `AGENTS.md`）は、並行 Issue #214 の Issue 本文が挙げる「手動更新」対象リストとも
  重複している。本 Issue の実行時指示（issue-handler 起動時の並列作業衝突回避メモ）で、これらのファイルは #215 が
  意味論変更（AI 協業フロー再設計）を含めて完全に担当し、#214 は `repo-map.md` / `data-contract.md` / `pipeline.md` /
  `tts-design.md` / `OPERATIONS.md` / `doc-map.md` 等の別ファイル群を機械的 path 更新することで棲み分ける前提と理解して
  実施した。#214 実装時に本 PR との重複編集が発生しないよう、#214 の Issue 本文（対象ファイルリスト）の調整が必要な
  可能性がある
- `apps/mobile/` は本 Issue 時点で未作成（EPIC-06/EPIC-07 前）のため、Mobile 関連の記述はすべて「実装後」を前提にした
  prospective な記述とした

## 後続への影響

- 以降の Issue 起票（monorepo 4 ゾーン跨ぎの判定・platform 明示・Bug の発生層記録）は本 PR の新ルールに従う
- `docs/features/*.md` の実装 path 欄拡張（代表 3 ファイル + README）は、#214 merge 後にフォローアップで実施する
- Mobile 実装（EPIC-06/EPIC-07）着手時、本 PR で prospective に記述した `apps/mobile/` path 前提の妥当性を再検証する
  必要がある（実際のディレクトリ構成が想定と異なる場合、追加の docs 更新 Issue が必要）

## 残課題・申し送り

1. **Phase 4（`docs/features/*.md` テンプレ更新）を本 PR では未実施**: 起票時点で #214（`EPIC-04`、docs path 更新）が
   PR 未作成（Issue のみ起票済み、状態 OPEN）。並列作業衝突回避の実行時指示に従い「#214 の PR merge 完了を確認して
   から着手する」ため、本 PR には含めなかった。#214 merge 後、代表 3 feature MD（`2a.md` / `2c.md` / `3a.md` を想定）+
   `README.md` へ「実装 path」欄（Web/Mobile/Shared 判定併記型）を追加するフォローアップ Issue または本 Issue の
   追加コミットで対応する。Naoya に、フォローアップの実施方法（同一 Issue #215 の追加コミット vs 新規 Issue）を
   ご判断いただきたい
2. **「Mobile iOS/Android 両プラットフォーム影響 = L3」の L3 判定条件追加は保留**: Issue #215 本文は「本 Issue で
   判断確定」と指示していたが、L3 判定条件そのものの追加変更は意味論的に重い判断であり、実行時指示で明示的に
   halt トリガー相当として扱う指定があったため、本 PR では追加せず `docs/change-classification.md` に保留の旨と
   代替運用（既存条件④で個別判断）を明記するに留めた。Naoya のご判断次第で追加コミットする
3. **`docs/impact-ledger.json` の pre-existing drift**: Issue #212 実装レポートに記載の pre-existing drift
   （`packages/core` 移設前から存在した `docs/impact-ledger.json` の記載行番号ズレ）は本 Issue の非対象範囲
   （`docs/impact-ledger.json` 再生成は #214 スコープ）のため、本 PR でも変更していない

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: AI 協業フローの再設計（`workflow.md`/`guardrails.md`/`change-classification.md`/エージェント設定/`CLAUDE.md`の
  実装ゲート変更）に該当し、L3 条件①を満たす。実施内容も 11 Phase・14 ファイルにまたがる大規模ドキュメント改修であり
  見積もりと一致

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1（docs/behavior-invariant）, C7（AI readability）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（`doc-map.md` 自体は非対象範囲、変更していない）
- [x] 既存ファイルパスへの依存関係が壊れていない（本 PR は path 記述の修正のみで、実ファイルの移動は行っていない）

### Phase 分割の妥当性

- 想定 Phase 数: 11（Phase 0〜10）
- 実際の Phase 数: 11（Phase 4 は内容未実施だが、判断・記録として本レポートに含めている）
- 相互依存の発生有無: あり。Phase 4（`docs/features/*.md`）は #214 の merge 状態に依存するため、他 Phase と独立に
  完了できなかった（上記「残課題・申し送り」参照）

### 総合判定

- [x] 事前分類妥当、PR 作成可（Phase 4 の完了保留を明記した上で PR 作成）
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 昇格・追加提案がある場合の詳細

なし（Level/Pattern の昇格・追加提案は無し。上記「残課題・申し送り」#2 のとおり、L3 判定条件の追加可否は
Naoya 判断待ちの別軸の意思決定であり、本 Issue 自体の Level/Pattern の再判定とは独立）
