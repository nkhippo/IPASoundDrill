# [EPIC-01] Pre-Issue Recon: monorepo 化前の現状 path 依存箇所全 grep (#210) — 実装レポート

## 関連 Issue / PR

- Issue: #210（親 EPIC: #209）
- PR: （本レポートと同一 PR）
- Agent: claude-code（issue-handler）

## Issue 背景（Issue 本文から要約）

- **改修分類**: Complexity Level L2 / Change Pattern C1（docs / behavior-invariant）, C7（AI readability 準備）。実行時挙動を変えず、monorepo 化（EPIC #209）着手前に `src/` / `data/` / `scripts/` への参照箇所を全網羅する調査 Issue。
- 生成物は `docs/cursor/recon/pre-issue-recon-20260729-monorepo-paths.md` 1 本のみ。Grep A〜J を実行し、省略・要約なしで file:line 単位に列挙、§12 新構造 path マッピング案、§13 未解決の設計判断（最低 3 件）を含めることが完了定義。

## 実装内容

- Issue 本文記載の Grep A〜J（および Grep D の `middleware.ts` / `vercel.json` / `package.json` 全文引用）を実行。
- 各 grep コマンドをそのまま再実行可能な形で Recon MD に記載し、ヒット結果を file:line 単位で全件埋め込み（省略・要約なし）。
- Grep G（`docs/features/<id>.md` の「実装 path」欄）はキーワード grep でヒット 3 件のみだったため、設計上の発見として「feature MD は実装 path を直接持たず `docs/impact-ledger.json` 経由の間接参照方式」であることを明記。
- Grep H（`docs/impact-ledger.json`）は JSON にファイルパスの明示フィールドがないため、`docs/impact-ledger.md` の仕様（`line` は常に `src/index.template.html` 内の行番号）を根拠に、全 293 エントリを `src/index.template.html:{line}` 形式に再構成して file:line 網羅を満たした。
- Grep I（`docs/doc-map.md`）はキーワード grep のヒットが 4 件のみだったため、索引ファイル全体（74 行）を全文引用し「概念→ホーム」の実態を提示。
- §12 新構造 path マッピング案は、grep 結果に加え `scripts/paths.py` / `scripts/gen_impact_ledger.py` / `tools/validate_i18n.py` / `scripts/build-i18n-html.js` の実ソースを確認し、各スクリプトのハードコードされたパス定数（`SRC = ROOT / "src" / "index.template.html"` 等）を根拠として反映。
- §13 未解決の設計判断は最低 3 件の義務に対し 6 件を抽出（`gas/` 配置、ランタイム JSON 実配置、`i18n/` 配置、Vercel Root Directory 設定、`data/derived` 系の扱い、`scripts/`/`tools/` 境界再定義）。

## 変更ファイル

```
- docs/cursor/recon/pre-issue-recon-20260729-monorepo-paths.md (A)
- docs/agent-reports/issue-handler-issue-210-monorepo-recon.md (A)
```

## デグレ防止検証

- 変更範囲は Issue ホワイトリスト通り新規ファイル 2 本のみ（Recon MD + 本レポート）。既存ファイルは一切変更していない（`git status --short` で確認済み、上記 2 ファイルの `??` のみ）。
- 実装中の自己判断による追加変更: なし。
- 実装中に発覚した懸念: なし（Grep G / I がキーワード直接ヒットに乏しかった点は「設計上の発見」として本文に明記し、調査の欠落ではなく実態として記録した）。

## 動作確認

- `docs/cursor/recon/pre-issue-recon-20260729-monorepo-paths.md` が作成されていることを確認。
- Grep A〜J 全結果が file:line 単位で列挙されていることを目視 + 行数集計で確認（A=193, B=939, C=438, D=3ファイル全文, E=1114, F=17, G=3(keyword)+293(H経由の実質解), H=293 entries, I=74行全文, J=7）。
- §12「新構造 path マッピング案」が全 grep 結果を反映した表になっていることを確認（17 行のマッピング）。
- §13「未解決の設計判断」に 6 件（義務の最低 3 件を超過）を抽出済み。
- Recon MD の grep コマンドは Issue 本文のコマンドをそのまま記載しており、Claude が再実行して同じヒット行を得られる（`python3 scripts/validate/validate-markdown-refs.py --changed-files` で新規ファイルの markdown 参照検証は PASS 済み）。
- ランタイム契約 8 パス（`docs/data-contract.md`）は §12 マッピングにすべて反映済み（wordlist / connected_speech / weak_forms / guide / UI i18n / phoneme i18n / IPA font / GAS_TTS_URL）。
- `python3 tools/validate_i18n.py` は本 Issue でデータ変更なしのため未実行（Issue §7 テスト/検証コマンドの記載通り）。
- 既存機能への影響: なし（docs のみ、ランタイムコード・データ・i18n 未変更）。
- データ整合性: 対象外（データ変更なし）。

## 実装過程での気づき

- `docs/impact-ledger.json` は file パスを持たないスキーマ設計（全エントリが `src/index.template.html` 固定という前提のため）。monorepo 化で `src/` を移動する際、この前提が崩れないよう `line` 値の再生成/差分ゼロ確認が必須になる（§9 に明記）。
- `scripts/paths.py` が `ROOT = Path(__file__).resolve().parents[1]` で解決する設計のため、`scripts/` ディレクトリ自体を移動しなければ大半のパイプラインスクリプトは無改修で動く。一方 `scripts/gen_impact_ledger.py` と `tools/validate_i18n.py` は `paths.py` を経由せず `src/index.template.html` を直接ハードコードしており、この 2 箇所は個別のパス定数更新が必要（§12 に明記）。

## 後続への影響

- 本 Recon MD は Claude が起票する #EPIC-02（pnpm workspaces + `apps/web/` 移設）、#EPIC-03（`packages/core` 抽出）、#EPIC-04（docs パス更新）、#EPIC-10（ドキュメント/Bug ガイドライン更新）の基礎資料となる。
- §13 の 6 件の設計判断は、上記 sub-Issue 起票前に Naoya が確定させる必要がある。

## 残課題・申し送り

- なし（本 Issue のスコープは調査のみで完了）。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 実行時挙動・ランタイム契約データを一切変更しない docs 追加のみで完結し、L2 の想定通りに収まった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1（docs / behavior-invariant）, C7（AI readability 準備）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（新規 Recon MD の追加のみ、既存ホームは無変更）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1（Recon MD 作成のみ）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
