# [EPIC-04] docs 内 path 記述の新構造反映 (#214) — 実装レポート

## 関連 Issue / PR

- Issue: #214
- PR: (本レポートと同一 PR)
- Agent: claude-code（issue-handler、非同期セッション再開・3 回目の invocation）

## Issue 背景（Issue 本文から要約）

#EPIC-02（#212、monorepo 物理移設）完了により `docs/**` 内の path 記述（`src/index.template.html`,
`data/*.json`, `scripts/*.py` 等）が実態と乖離した。本 Issue はそれを新構造
（`apps/web/src/index.template.html`, `packages/core/data/*.json`, `tools/{目的}/*.py` 等）へ機械的に更新する。
改修分類: L2 × [C1（docs/behavior-invariant）, C7（AI readability）]。

過去 2 回の invocation で以下の halt が発生し、Naoya（Claude 経由）が解決済み:
1. historical archive の境界判定（`docs/impact-ledger.md` / `docs/design/phase-1/*` の扱い）
2. `docs/workflow.md` / `docs/change-classification.md` / `docs/guardrails.md` / `docs/bug-knowledge.md` /
   `CLAUDE.md` / `AGENTS.md` が #215（EPIC-10）と重複していた scope 誤り + 共有 worktree 汚染

上記対応により本 Issue の非対象範囲に上記 6 ファイルが追加され、salvage コミット `81805d4`
（`docs/path-update-214` ブランチ）として Phase 1〜4（一部）+ Phase 5（doc-map.md のみ）が保存済みだった。

## 実装内容

本 invocation は `docs/path-update-214` ブランチを **専用 isolated git worktree**
（他セッションと共有しない）にチェックアウトして再開し、残り Phase を完了した。

- **Phase 3 完成の検証**: 残り 7 features MD（`1a`, `3a`, `3d`, `3h`, `reveal`, `_common`, `summary`）+
  `docs/features/README.md` を全数確認。いずれも「読むデータ」節が「なし」または他 feature ID への
  参照のみで、旧 path のリテラル文字列参照を含まないことを確認（**変更不要、既に整合**）。
- **Phase 7 副次 docs 更新**:
  - `docs/CSS-CONVENTIONS.md`: `src/index.template.html` → `apps/web/src/index.template.html`（3 箇所）、
    `scripts/build-i18n-html.js` → `apps/web/scripts/build-i18n-html.js`（1 箇所）
  - `docs/LAUNCH-CHECKLIST.md`: `src/index.template.html` → `apps/web/src/index.template.html`（2 箇所）、
    `scripts/build-i18n-html.js` → `apps/web/scripts/build-i18n-html.js`（2 箇所）、
    `i18n/phonemes/{lang}.json` → `packages/core/i18n/phonemes/{lang}.json`（1 箇所）
  - `docs/impact-ledger.md`: `src/index.template.html` → `apps/web/src/index.template.html`（4 箇所）、
    `scripts/gen_impact_ledger.py` → `tools/impact-ledger/gen_impact_ledger.py`（4 箇所）
  - `docs/design/phase-1/visual-tokens.md` / `design-tokens.md`: `src/index.template.html` →
    `apps/web/src/index.template.html`、`fonts/DoulosSIL-Regular.woff2` →
    `packages/core/fonts/DoulosSIL-Regular.woff2`（公開 URL `/fonts/...` は維持、doc-map.md で
    status=exists の CSS トークン snapshot として明示的にホワイトリスト済み）
  - `docs/README.md` / `docs/features/README.md` / `docs/_conventions.md`: 旧 path 参照なし（変更不要）
- **Phase 8**: `python3 tools/impact-ledger/gen_impact_ledger.py` を実行し `docs/impact-ledger.json` を再生成
  （293 → 299 symbols、全エントリの `line` 値が更新。差分は monorepo 移設に起因する新規ズレではなく、
  前回 halt コメントで既に記録済みの pre-existing drift — 最後の ledger 生成後に
  `apps/web/src/index.template.html` の内容が変化していたこと（#EPIC-03 並行実装等）による）。
- **Phase 9 デグレ確認**: 下記「動作確認」参照。

### スコープ外だが同カテゴリで発見した 1 件（judgment call、halt せず対応）

`docs/design/ux-issues-2026-07.md`（front-matter `status: living`）に 1 箇所、旧 path
（`src/index.template.html`）参照を発見。Issue #214 の Phase 0 ホワイトリストには列挙されていないが、
以下の理由で「手動更新」対象として扱い、機械的な文字列置換のみを実施した:

- `status: living`（archived/frozen ではない）＝ historical archive の 9 除外先のいずれにも該当しない
- 変更は 1 行の path 文字列置換のみで意味変更なし（L2 の cohesive 範囲内）
- Naoya の前回 halt 対応（`docs/design/phase-1/visual-tokens.md`/`design-tokens.md` を「status=exists の
  アクティブ snapshot だから更新対象」と判断した先例）と同じロジックが適用できる
- 3 回目の halt を「Issue 起票時の Recon 網羅漏れ」という同一カテゴリの問題で繰り返すより、
  低リスクな機械的追加修正として本 PR に含める方が Naoya の負担が小さいと判断

### 同カテゴリで「触らない」と判断したファイル（judgment call）

`docs/design/phase-1/` 配下のうち、`visual-tokens.md` / `design-tokens.md` 以外（`brief-cluster-1-top-page.md`,
`brief-cluster-2-visual-language.md`, `kickoff-claude-design-prompt.md`, `screen-data-mapping.md`,
`work-plan-uiux-implementation.md`）に旧 path 参照が残っているが、front-matter で
`status: archived` / `status: frozen` が明示されているか（`screen-data-mapping.md` は
特定 md5 に紐づいた凍結スナップショットの recon 記録）、doc-map.md に status=exists として
登録されていないため、historical archive 相当として非対象とした。`docs/claude-design/**` は
CLAUDE.md 絶対ルール §6 で「凍結フレームカタログ・更新義務なし」と明示済みのため同様に非対象。

## 変更ファイル

```
- docs/CSS-CONVENTIONS.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/design/phase-1/design-tokens.md (M)
- docs/design/phase-1/visual-tokens.md (M)
- docs/design/ux-issues-2026-07.md (M)
- docs/impact-ledger.json (M, 再生成)
- docs/impact-ledger.md (M)
- docs/agent-reports/issue-handler-issue-214-docs-path.md (A)
```

上記に加え、前回 invocation の salvage コミット `81805d4`（同ブランチ内、既にコミット済み）で
以下が完了済み: `docs/data-contract.md`, `docs/repo-map.md`,
`docs/features/{2a,2b,2c,2d,3b,3c,screen-inventory}.md`, `docs/pipeline.md`, `docs/tts-design.md`,
`docs/OPERATIONS.md`, `docs/doc-map.md`（Phase 5 のうち doc-map.md 分のみ）。

## デグレ防止検証

- 全変更は path 文字列の置換のみ（実行時挙動・意味内容の変更なし、L2 相当）
- 実装中の自己判断による追加変更: 2 件
  1. `docs/design/ux-issues-2026-07.md` の 1 箇所（上記参照、Phase 0 ホワイトリスト漏れの機械的補完）
  2. Phase 9 の `validate-markdown-refs.py --all` は現行 CLI に存在しないフラグ（`--full-scan` に
     名称変更済み、#EPIC-02 移設時の変更と推測）だったため `--full-scan` で実行
- 実装中に発覚した懸念: なし（上記 judgment call 2 件は本レポートで明示、halt はしていない）

## 動作確認

- Phase 9 grep 4 種（9 historical archive 除外先 + `docs/claude-design/**` + `docs/design/phase-1/`
  の非アクティブ 5 ファイル + #215 移管 6 ファイルを除外）: **ゼロヒット**確認済み
  - `grep -rn "src/index.template.html" docs/ CLAUDE.md AGENTS.md` → 除外後ゼロ
    （残った 2 件は false positive: `docs/impact-ledger.md` の「旧セクション名を引用した歴史的記述」
    と `docs/repo-map.md` のディレクトリツリー内 `apps/web/src/index.template.html` の子要素表記）
  - `grep -rn "^data/\|['"data/" docs/ CLAUDE.md AGENTS.md` → ゼロ
  - `grep -rn "scripts/" docs/ CLAUDE.md AGENTS.md`（`tools/` `apps/web/scripts/` 以外）→ ゼロ
    （残った 1 件は false positive: `docs/repo-map.md` ツリー内の `apps/web/scripts/` 子要素表記）
  - 追加で `i18n/` prefix・`fonts/DoulosSIL` も同様にゼロヒット確認
- `python3 tools/validate/validate-markdown-refs.py --full-scan` → V1〜V8 全て PASS
- `python3 tools/impact-ledger/gen_impact_ledger.py --check` → up to date
- 既存機能への影響: なし（docs のみ、ソースコード・データ・i18n は無変更）
- データ整合性: 対象外（ランタイム契約 8 パスの実データは無変更、`docs/data-contract.md` の記述更新は
  前回 invocation の salvage コミットで完了済み）

## 実装過程での気づき

- Issue #214 の Phase 0 Recon（#210）は `docs/design/ux-issues-2026-07.md` を「手動更新」ホワイトリストに
  含めておらず、`docs/design/phase-1/` 配下も `visual-tokens.md`/`design-tokens.md` 以外は言及していなかった。
  #EPIC-04 系の Recon は `docs/design/**` 配下の front-matter status（`living` / `archived` / `frozen`）を
  機械的に走査すれば網羅漏れを防げたはずで、今後同種の Issue（EPIC #169 系の docs 整理）では
  Recon 手順に「front-matter status による active/archived 判定」を組み込むことを推奨する。
- `tools/validate/validate-markdown-refs.py` の CLI フラグが `--all` から `--full-scan` に変更されている
  （#EPIC-02 移設時と推測）。Issue 本文・`docs/guardrails.md` 等に残る `--all` 表記は #215（PR #217）または
  別 Issue でのフォローアップ対象（本 Issue の非対象範囲である `docs/guardrails.md` に該当するため
  本 PR では修正していない）。

## 後続への影響

- `docs/impact-ledger.json` の再生成により全シンボルの `line` フィールドが変化した（293→299 symbols）。
  今後 `docs/impact-ledger.json` を参照する PR は最新版を前提にする。
- なし（他機能への影響なし）

## 残課題・申し送り

- `tools/validate/validate-markdown-refs.py --all` → `--full-scan` のフラグ名不一致は、本 Issue の
  非対象範囲（`docs/guardrails.md`）に記載があるため #215 側で確認・修正が必要な可能性がある
  （#215 の PR #217 レビュー時に合わせて確認を推奨）。
- それ以外の残課題なし。Phase 0〜9 完了。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 全変更が path 文字列の機械的置換のみで完結し、意味変更・実行時挙動変更を伴わなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1（docs/behavior-invariant）, C7（AI readability）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（path 表記の更新のみ、契約内容は無変更）
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（`docs/impact-ledger.json` は再生成対象として Issue が明示）
- [x] 既存ファイルパスへの依存関係が壊れていない（`validate-markdown-refs.py --full-scan` PASS）

### Phase 分割の妥当性

- 想定 Phase 数: 10（Phase 0〜9）
- 実際の Phase 数: 10（Phase 5/6 は #215 へ scope 移管により skip、Phase 3 は既存整合を確認するのみ）
- 相互依存の発生有無: あり（#215 との scope 重複が過去 2 回の halt を招いた。今回の invocation では
  isolated worktree を使用し、#213/#215 との共有 worktree 汚染は発生していない）

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
