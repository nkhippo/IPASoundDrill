# [Issue D] 参照軸分割: data-contract / tts-design / pipeline / repo-map + history.md（REPOSITORY-STRUCTURE 退役）(#172) — 実装レポート

## 関連 Issue / PR

- Issue: #172（親 EPIC: #169、依存: #170 (B), #171 (C)）
- PR: （本コミット直後に作成）
- Agent: claude-code（issue-handler）

## Issue 背景（Issue 本文から要約）

- **改修分類**: Complexity Level L3 / Change Pattern C7（ドキュメント再構築）。判定根拠: ランタイム 8 パス契約・i18n schema の正本移設を含むため。5 ファイル超は docs-infra 例外として atomic 実施。
- `docs/REPOSITORY-STRUCTURE.md`（フォルダマップ + ランタイム契約 + i18n schema + JS map + パイプライン + スナップショットが混在）と `SPECIFICATION.md §5`（データ）・`DESIGN.md §3,§4`（TTS・データ整備）を、軸ごとの単一ホームに分割する。
- `docs/data-contract.md` / `docs/tts-design.md` / `docs/pipeline.md` / `docs/repo-map.md` / `docs/history.md` を新設し、`docs/REPOSITORY-STRUCTURE.md` を退役（削除）。

## 実装内容

- `docs/data-contract.md` を新設: ランタイム 8 パス契約、wordlist / connected_speech / weak_forms / guide の JSON スキーマ、localStorage + セッション状態 `S`、i18n スキーマ（leaf 数含む）、データ整合性チェック義務表、多言語 UI 必須記載を統合（REPO の Runtime data contract / i18n schema 節、SPEC §5.1–5.5、旧 CLAUDE.md 品質基準 3–5 由来）。
- `docs/tts-design.md` を新設: TTS プロンプト設計（入力・設計意図・既知の限界）、RP TTS、クライアント TTS プリフェッチ、GA バッチ warm、GAS/audio 運用、R4 pending（DESIGN §3.1–3.4c、REPO の GAS/audio・R4 pending 節由来）。
- `docs/pipeline.md` を新設: Common pipeline commands、Phase 2 B2 expansion workflow、データ整備タスク一覧（REPO の Common pipeline commands・Phase 2 workflow 節、DESIGN §4 由来）。
- `docs/repo-map.md` を新設: 技術スタック、Quick orientation、正本ファイル(SPA)、Directory tree、Runtime infrastructure、Track A/B スコープ、JS 関数マップ（⚠️ Issue F の impact-ledger 置換予定の注記付き）、What not to confuse、Local dev（REPO 該当節 + 旧 CLAUDE.md「技術スタック」「ファイル構成」由来）。
- `docs/history.md` を新設: PURPOSE.md の Phase 1/2/R 完了ログ + 変更履歴、REPO の Wordlist/UI behaviour snapshot を移設・集約。冒頭に D で移設した範囲（PURPOSE/REPO 由来のみ）を明記し、DESIGN/SPEC 由来の日付ログは Issue E で追記予定と申し送り。
- `docs/REPOSITORY-STRUCTURE.md` を削除（`git rm`）。
- `docs/PURPOSE.md`: Phase 1/2/R 完了ログ節・変更履歴節を `docs/history.md` へのポインタに置換（見出しは保持、内容重複を排除）。
- `docs/DESIGN.md`: §3.1–3.4c を `docs/tts-design.md` へのポインタに置換（§3.5 多言語UI は Issue の抽出表に無いため据え置き）。§4 データ整備タスクを `docs/pipeline.md` へのポインタに置換。§2g 内の REPOSITORY-STRUCTURE.md 参照を repo-map.md / pipeline.md / history.md へ付け替え。冒頭のフォルダマップ参照を `docs/repo-map.md` に更新。
- `docs/SPECIFICATION.md`: §5（§5.1–5.5 全体）を `docs/data-contract.md` へのポインタに置換（`## 5.` 見出しは安定アンカーとして保持）。冒頭「リポジトリ構成」参照・§6「関連ドキュメント」行の REPOSITORY-STRUCTURE.md 参照を更新（変更履歴の historical entry は不変のまま保持）。
- `CLAUDE.md`: 「プロダクト identity」節の `(Issue D で作成)` 注記を削除。「ランタイム契約ガードレール」節を、8 パス全列挙・i18n leaf 数値のハードコード（旧 169、実態と不一致）から `docs/data-contract.md` への一本化ポインタへスリム化（重複ゼロ化）。
- `docs/doc-map.md`: data-contract / tts-design / pipeline / repo-map / history の status を `planned(D)` → `exists` に更新。§1 の移設レジストリ・§3 の retire 予定リストも Issue D 完了を反映。
- `docs/guardrails.md`: §10 のランタイム契約 8 パス参照先を `CLAUDE.md`（作成後は data-contract.md）表記から `docs/data-contract.md` 直接参照に更新。
- `.claude/agents/pr-reviewer.md`: 「契約定義」節のフォールバック先 `REPOSITORY-STRUCTURE.md`（退役済み）参照を削除し `docs/data-contract.md` のみに一本化。
- `README.md`（root）/ `docs/README.md`: `docs/REPOSITORY-STRUCTURE.md` への表参照を `docs/repo-map.md` に更新。
- `docs/cursor/README.md` / `docs/reference/README.md` / `docs/cursor/instructions/README.md`: `REPOSITORY-STRUCTURE.md` への参照を `repo-map.md` / `data-contract.md` / `pipeline.md` へ付け替え。

## 変更ファイル

```
- docs/data-contract.md (A)
- docs/tts-design.md (A)
- docs/pipeline.md (A)
- docs/repo-map.md (A)
- docs/history.md (A)
- docs/REPOSITORY-STRUCTURE.md (D)
- docs/PURPOSE.md (M)
- docs/DESIGN.md (M)
- docs/SPECIFICATION.md (M)
- CLAUDE.md (M)
- docs/doc-map.md (M)
- docs/guardrails.md (M)
- .claude/agents/pr-reviewer.md (M)
- README.md (M)
- docs/README.md (M)
- docs/cursor/README.md (M)
- docs/reference/README.md (M)
- docs/cursor/instructions/README.md (M)
- docs/agent-reports/claude-code-issue-172-ref-axes-split.md (A, 本レポート)
```

## デグレ防止検証

- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
- ランタイム契約 8 パスの実体ファイル（`wordlist_GA_a1a2_plus_phonics.json` / `data/*.json` / `i18n/*.json` / `fonts/*` / `src/index.template.html`）は変更していない。ドキュメント上の契約記述の移設のみ。
- 実装中の自己判断による追加変更: `docs/_conventions.md`（history.md 作成完了に伴う forward-reference 注記の除去）を一度編集したが、ホワイトリスト外・ついで作業と判断し `git checkout --` で復元・不採用。同様に `data/README.md` / `data/batches/README.md` の REPOSITORY-STRUCTURE.md 参照更新も、開発ゾーン（`data/**`）に該当するため実施後に復元・不採用（Issue の「全リポで grep 更新」要求と「開発ゾーンに触れない」制約が衝突したため、より明示的な制約であるゾーン規則を優先）。
- 実装中に発覚した懸念: なし（下記「残課題・申し送り」参照）。

## 動作確認

- 完了定義「5 新ファイルが存在し、上表の内容を one-home で含む」: 満たす（`docs/data-contract.md` / `tts-design.md` / `pipeline.md` / `repo-map.md` / `history.md` を作成、Issue 実装範囲表の取り込み内容を各節に反映）。
- 完了定義「`REPOSITORY-STRUCTURE.md` が削除され、参照が全て新ホームに更新（grep = 0、履歴記述除く）」: `docs/REPOSITORY-STRUCTURE.md` を削除。`grep -rln 'REPOSITORY-STRUCTURE' .`（`.git` 除く）の残存箇所は (a) 新規ファイル自身の「旧 `docs/REPOSITORY-STRUCTURE.md` を統合継承」という provenance 注記、(b) `docs/doc-map.md` の retire 完了記録、(c) `docs/SPECIFICATION.md` 変更履歴の historical entry、(d) `docs/agent-reports/` / `docs/cursor/reports/` / `docs/cursor/instructions/`（完了済み Phase の指示書）/ `docs/handoff/` / `docs/logs/` / `docs/vault-history/` / `docs/design/` / `docs/reference/`（一部、過去設計メモ）/ `audit/` / `migration/` 配下の historical archive、(e) `data/README.md` / `data/batches/README.md`（開発ゾーンのため今回は更新せず残置、下記申し送り参照）のみ。ライブなナビゲーション参照としての REPOSITORY-STRUCTURE.md 依存は解消。
- 完了定義「ランタイム 8 パス・i18n leaf 数・データ整合性チェック表が `data-contract.md` にのみ存在（重複ゼロ）」: `CLAUDE.md` の 8 パス全列挙・i18n leaf 数値・SPEC §5.5・REPO 該当節を全て `data-contract.md` へ集約し、他箇所はポインタ化。DESIGN §3.5「多言語UI」（Issue の抽出表に無い、Issue E の非対象範囲）等 §5 系以外の文脈的な leaf 数言及（5,397 語等と同様の文脈引用）は本 Issue の移設対象外として残置（Issue E で DESIGN.md 退役時に解消予定）。
- 完了定義「`repo-map.md` の JS map 節に『F で置換予定』注記がある」: `docs/repo-map.md` §「src/index.template.html JS map」冒頭に "⚠️ 本節は Issue F の `docs/impact-ledger.json` が置換予定" を明記。
- 完了定義「日付ログが仕様系から history.md に移動（D 範囲分）」: `docs/PURPOSE.md` の Phase 1/2/R 完了ログ・変更履歴、`docs/REPOSITORY-STRUCTURE.md` の Wordlist/UI behaviour snapshot を `docs/history.md` へ移設。DESIGN/SPEC 由来の日付ログは Issue E の範囲として明記（history.md 冒頭の「D で移した範囲」節）。
- 完了定義「`doc-map.md` status 更新済み」: §1・§2 の該当行を `planned(D)` → `exists` に更新、§3 retire リストを Issue D 完了記録に更新。
- テスト観点「データフィールド追加タスクで data-contract.md + 該当 features のみで完結するか」: `docs/data-contract.md` に wordlist/connected_speech/weak_forms/guide の全フィールド定義・追加時の更新手順（`scripts/gen_ga_rp_same.py` 等）を集約済み。features/<id>.md は Issue E 作成予定のため、現時点では data-contract.md 単体で完結する設計とした。
- テスト観点「8 パス契約の数値・パスが REPO 原本と一致（欠落ゼロ）」: `docs/data-contract.md` §1 の 8 パス表は旧 `docs/REPOSITORY-STRUCTURE.md`「Runtime data contract」節の記述と逐語一致することを目視確認済み。
- 既存機能への影響: なし（ドキュメントのみの変更、ランタイムコード・データファイル不変）。
- データ整合性: 対象外（ドキュメント移設のみ。実データファイルは未変更）。

## 実装過程での気づき

- SPEC §5.5 / DESIGN §3.5 / 旧 CLAUDE.md 品質基準 5 の i18n leaf 数はそれぞれ 246 / 246 / 169 と食い違っており、かつ `python3 tools/validate_i18n.py` の実測値は 254 だった（現行 UI の実データとも不一致）。本 Issue はドキュメント移設が scope であり実データ検証・修正は非対象範囲のため、SPEC §5.5（最新の dated 記述、REPO と一致）の値 246 をそのまま `data-contract.md` に移設し、実測値との乖離は data-contract.md §5 の Notes に「乖離時は実測値を正とし本節を更新」という doc-sync ルールとして明記するに留めた。実データの真値確定・全箇所の数値統一は別 Issue（doc-sync 対象）が必要。
- `docs/_conventions.md`（history.md 作成予定注記）、`data/README.md`、`data/batches/README.md` は「全リポの REPOSITORY-STRUCTURE 参照更新」という完了定義と「開発ゾーンに触れない／ホワイトリスト厳守」という制約が直接衝突するケースだった。ゾーン制約をより明示的な指示として優先し、当該 3 ファイルは変更せず復元した。

## 後続への影響

- Issue E（`docs/product.md` + `docs/features/<id>.md`、PURPOSE/DESIGN/SPEC 退役）は、DESIGN §3.5（多言語UI）・SPEC §4 系の leaf 数文脈言及を含め、本 Issue で解消しきれなかった leaf 数表記ゆれの最終収束もあわせて担うことになる。
- Issue F（impact-ledger）は `docs/repo-map.md` の「src/index.template.html JS map」節を `docs/impact-ledger.json` への参照に置換する（本 Issue で置換予告の注記を追加済み）。
- `data/README.md` / `data/batches/README.md` に残る `docs/REPOSITORY-STRUCTURE.md` への参照 2 件は、次に data/** を触る Issue（または docs-only だが例外的にゾーン許可された Issue）で `docs/repo-map.md` / `docs/pipeline.md` に更新する必要がある。

## 残課題・申し送り

- `data/README.md`（1 箇所）・`data/batches/README.md`（1 箇所）の `docs/REPOSITORY-STRUCTURE.md` 参照が未更新のまま残存（開発ゾーン制約により本 PR では対応せず）。実害は軽微（人間/AI 向けドキュメントの pointer が旧ファイル名を指すのみ、404 リンクではなく単なる古い記述）だが、次回 data/** touch 時に修正推奨。
- i18n leaf 数の実データとの乖離（246 表記 vs 実測 254）は本 Issue の非対象範囲として未修正。将来の doc-sync/データ監査 Issue での解消を推奨。

## pr-reviewer レビュー対応（追記・PR #180）

pr-reviewer の契約検証（総合判定 PASS、観点d に軽微な不足の注記あり）を受け、以下 4 件の運用メモを `docs/repo-map.md` に復元した（`git show main~1:docs/REPOSITORY-STRUCTURE.md` の削除前版から該当行を確認のうえ移設）:

1. Middleware 行に「C1 fallback 時は不使用」を復元（`docs/repo-map.md` §Runtime infrastructure）
2. MCP server 行に旧 Railway 構成（`nkhippo/ipasounddrill-mcp`、Phase F まで存置=deprecated）の記述を復元（同上）
3. Cursor Automation 行に「Cloud Agent: 見送り中（`resource_exhausted`）」を復元（同上）
4. Track B スコープに「本ファイルの動的セクション自動生成（Issue K2）」バックログ項目を復元（同上 §Track A / B スコープ）。ただし原文の `REPOSITORY-STRUCTURE.md` という固有ファイル名は本 Issue で当該ファイルを retire 済みのため、参照先を `docs/repo-map.md`（後継ファイル）に更新し、Issue #172 での retire に伴う参照更新である旨を注記した（内容の骨子＝「インフラ索引ドキュメントの動的セクション自動生成」は変更していない）

**one-home 確認**: (1)(3) は他ファイルに同内容の記載なし。(2)(4) は `docs/OPERATIONS.md`（Railway 詳細）・`docs/LAUNCH-CHECKLIST.md`（`resource_exhausted` 詳細）に、より詳細な記述が既存する（旧 `docs/REPOSITORY-STRUCTURE.md` の時点から存在した索引サマリ行 + 専門ドキュメントでの詳細、という元々の構成であり、本修正が新たに重複を生んだものではないことを `git show main~1` で確認済み）。

対応コミット・push 後、PR #180 に結果コメントを投稿。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: ランタイム契約・i18n schema の正本移設を含み、5 ファイル超の新設 + 1 ファイル退役 + 8 ファイルの参照更新という規模・影響範囲は L3 相当。実装中に想定外の構造変化（ゾーン衝突の発覚等）はあったが、Level を跨ぐような追加スコープの発生はなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C7（ドキュメント再構築）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（実体ファイル不変、ドキュメント記述の移設のみ）
- [x] i18n schema への影響なし（実体ファイル不変）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（`doc-map.md` で新ホームを索引化済み）
- [x] 既存ファイルパスへの依存関係が壊れていない（`REPOSITORY-STRUCTURE.md` への参照は全てのライブ参照を新ホームへ付け替え済み。data/** の 2 箇所を除く）

### Phase 分割の妥当性

- 想定 Phase 数: 1（docs-infra 例外により atomic 実施、Issue 本文で事前承認済み）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし（5 新規ファイルは相互リンクするが、単一コミットで一貫性を保って作成）

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
