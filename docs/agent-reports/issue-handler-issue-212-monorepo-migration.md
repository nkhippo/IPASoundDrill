# Issue #212 実装レポート — monorepo 物理移設 (pnpm workspace + apps/web + packages/core + tools/{目的}/)

担当: issue-handler（ClaudeCode 同一セッション、Naoya 明示委譲）
先行: Issue #210（Pre-Issue Recon、PR #211）/ halt 2 回（ホワイトリスト逸脱懸念 → Naoya 承認で解消）

## 実施サマリ

Issue #212 の Phase 0〜7 を単一 PR で atomic に実施。加えて Naoya の halt 対応承認により、
`favicon.svg` / `robots.txt` / `sitemap.xml` / `privacy.html` / `terms.html` / `llms.txt` の
6 ファイルを Phase 2 ホワイトリストに追加し `apps/web/public/` へ移設した。

コミットは Phase 単位で分割（develop 履歴で各 Phase を独立追跡可能）:

| Phase | コミット | 内容 |
|---|---|---|
| 0 | pnpm workspace 初期化 | ルート `package.json` 書き換え、`pnpm-workspace.yaml` 新規、`.gitignore` に `**/node_modules` |
| 1 | packages/core 骨格 + データ移設 | wordlist リネーム込み git mv、i18n/、fonts/、`@ipasounddrill/core` package.json |
| 2 | apps/web 骨格 + Web 資産移設 | src/middleware.ts/vercel.json/build-i18n-html.js/CSV + 6 ファイル(favicon 等) git mv、`@ipasounddrill/web` package.json、`apps/web/.gitignore`、`copy-core-assets.js` 新規、fetch URL 更新 |
| 3 | tools/{目的}/ 再編 | scripts/ 配下を validate・data-pipeline・tts・impact-ledger に機械的再編、data/{batches,derived,patches,pipeline,archive} 移設、gas/ 移設、scripts/・data/・gas/・src/ 削除 |
| 4 | 内部 path 参照更新 | paths.py・gen_impact_ledger.py・validate 3 種・GitHub Actions 3 workflow の path 定数更新 |
| 6+7 | Vercel 設定 + デグレ確認対応 | vercel.json buildCommand/outputDirectory/rewrite、Phase 7 grep で発見した残存旧 path 参照の追加修正 |

## halt 対応の反映

前回 halt（`favicon.svg` 等 6 ファイルの扱い）は Naoya 承認により Phase 2 ホワイトリストに追加。
追加要件をすべて反映:
1. `apps/web/.gitignore` は `public/data/` `public/i18n/` `public/fonts/` の 3 パターンのみ ignore（`public/` 全体は ignore しない）。
2. Phase 7 デグレ確認に `/favicon.svg` `/robots.txt` `/sitemap.xml` `/privacy.html` `/terms.html` `/llms.txt` の 200 チェックを追加（下記§Vercel preview 確認）。
3. Level 昇格なし（L3 のまま、C3 に含まれる cohesive 追加として実施）。

## Phase 3 の機械的再編で Issue 本文に明記のなかった判断

Issue 本文は「その他 scripts/*.py を tools/data-pipeline/ へ機械的に移動」とのみ記載し、
`scripts/lib/`（`validate-markdown-refs.py` が import する共通ロジック）と `scripts/migration/`
（旧 Vault-Framework 一回限り markdown 移行スクリプト）の具体的な移設先までは明記していなかった。
以下の方針で機械的に判断（scope 拡大ではなく `tools/data-pipeline/**` ワイルドカードで既にホワイトリスト内）:

- `scripts/lib/` → `tools/data-pipeline/lib/`
- `scripts/migration/` → `tools/data-pipeline/migration/`（`_SCRIPTS = Path(__file__).resolve().parents[1]` の相対 import が無修正で解決することを確認済み）
- `tools/validate/validate-markdown-refs.py` の `sys.path` 挿入先を `tools/data-pipeline/` に変更し `lib` を解決

## ランタイム契約 md5 検証（内容不変の証明）

develop の旧 path ファイルと新 path ファイルの md5 が完全一致:

| Asset | develop（旧 path） | 本 PR（新 path） | md5 |
|---|---|---|---|
| wordlist | `wordlist_GA_a1a2_plus_phonics.json` | `packages/core/data/wordlist.json` | `54937707f733d1f906c99ba119444d5a` (一致) |
| connected_speech | `data/connected_speech.json` | `packages/core/data/connected_speech.json` | `7ebc1be2fcaa774d7696dbba5c07df55` (一致) |
| weak_forms | `data/weak_forms.json` | `packages/core/data/weak_forms.json` | `a853cd530443edfd9b7fa3a11e11a116` (一致) |
| guide | `data/guide.json` | `packages/core/data/guide.json` | `68c34b42a88b32823ed5e8ef4106258a` (一致) |
| IPA font | `fonts/DoulosSIL-Regular.woff2` | `packages/core/fonts/DoulosSIL-Regular.woff2` | `90b4ee43f349d4a796b2dc2d2bb43fee` (一致) |

## Phase 7 デグレ確認

### 旧 path 全 grep（4 種）

いずれも「本 Issue のホワイトリスト外（`docs/**` = #EPIC-04 スコープ、`CLAUDE.md`/`AGENTS.md`/`.claude/`/`.cursor/`/`templates/`/`migration/`（ルート、historical log）= 触ってはいけない対象、および本 Issue 前から存在し本ホワイトリストに含まれない `tools/gen_audit_docs.py` 等トップレベル既存ファイル）」を除き **ゼロヒット**:

1. `wordlist_GA_a1a2_plus_phonics` — ヒットは `apps/web/vercel.json` の rewrite 1 行（意図的な唯一の例外）+ `tools/data-pipeline/paths.py` の `WORDLIST_CSV`/`WORDLIST_BACKUP_PHASE0A`（CSV とバックアップスナップショットは Issue の非対象範囲どおり改名していないため元の文字列を含む、正当なヒット）+ 上記ホワイトリスト外ファイルのみ。
2. `^src/|/src/index.template.html` — ヒットはすべて `apps/web/src/index.template.html`（新 path として正しい）または `docs/**`（Recon MD 本文・EPIC-04 対象）のみ。
3. `scripts/gen_|scripts/merge_|scripts/paths|scripts/build-i18n-html|scripts/validate` — ヒットは `apps/web/scripts/build-i18n-html.js`（`apps/web/scripts/` はローカルサブディレクトリで正当）、`tools/validate/validate-markdown-refs.py` の provenance コメント（`Vault-Framework/scripts/validate/...` という外部由来元パスの引用、書き換え対象ではない）、ホワイトリスト外ファイル（`CLAUDE.md`/`.claude/agents/`/`README.md`/`templates/`）のみ。
4. `data/connected_speech|data/weak_forms|data/guide\.json` — ヒットはすべて `packages/core/data/...` に含まれる文字列（正当、`packages/core/data` のみヒットという Issue の期待どおり）または `.github/workflows/validate-cefr-tags.yml` の新 trigger path 文字列内、ホワイトリスト外ファイル（`README.md`）のみ。

Phase 3 の機械的移動対象だった `tools/data-pipeline/gen_ga_rp_same.py`（CLI デフォルト値が cwd 相対で解決不能だった）、
`tools/data-pipeline/gen_neighbors.py` / `ga_to_rp.py`（docstring）、`gen_impact_ledger.py`（--check メッセージ）、
`tools/data-pipeline/{batches,pipeline,derived,archive}/README.md`（見出し・パス正本参照）は
grep で発見し次第、同 PR で修正済み（上記 Phase 6+7 コミット参照）。

### CI trigger path 発火確認

`.github/workflows/{validate-i18n,validate-cefr-tags,validate-markdown-refs}.yml` の trigger path・実行コマンドを
目視で新構造に対応させたことで代替（Issue §Phase 7 に明記の代替方法）。

### ローカル validate / build 検証

```
python3 tools/validate/validate_i18n.py            → OK（警告 5 件、pre-existing、ハード不整合なし）
python3 tools/validate/validate-cefr-tags.py       → OK: all checked entries have cefr in {A1,A2,B1,B2}
python3 tools/validate/validate-markdown-refs.py --full-scan --broken-refs migration/broken-refs.csv
                                                    → V1〜V8 すべて PASS
pnpm install                                        → Scope: all 3 workspace projects, 成功
pnpm --filter @ipasounddrill/web build              → 成功。apps/web/public/{data,i18n,fonts}/ コピー確認、
                                                       en/ja/ko/zh-Hans/zh-Hant/fil の 6 言語 index.html 生成確認
                                                       （ビルド後に破棄、リポジトリには追跡しない — apps/web/.gitignore は
                                                       Naoya 指示どおり data/i18n/fonts の 3 パターンのみで、
                                                       生成 HTML 自体は未追跡のまま維持）
```

### Vercel preview 200 確認

**未実施 — Naoya 確認待ち。** 本 PR 作成後に Vercel が生成する preview URL に対して、以下の 200 確認を
PR コメントで追記する（ローカル環境には Vercel デプロイ権限がないため、PR 作成後の preview URL 発行を待って実施）:

- `/en/`, `/ja/`, `/zh-Hans/`, `/ko/`, `/es/`(存在しない場合は対象外), `/fil/`
- `/data/wordlist.json`, `/data/connected_speech.json`, `/data/weak_forms.json`, `/data/guide.json`
- `/wordlist_GA_a1a2_plus_phonics.json`（rewrite 経由 200 期待）
- `/i18n/en.json`
- `/fonts/DoulosSIL-Regular.woff2`
- `/favicon.svg`, `/robots.txt`, `/sitemap.xml`, `/privacy.html`, `/terms.html`, `/llms.txt`（halt 対応追加分）

## 非対象範囲の遵守確認

- `packages/core/src/`（TS 化）: 作成していない（#EPIC-03）
- `docs/**` の path 記述: 変更していない（#EPIC-04）。本レポート自体は新規ファイルであり対象外。
- `CLAUDE.md` / `AGENTS.md` / `.cursor/` / `.claude/`: 変更していない
- `apps/mobile/`: 作成していない（#EPIC-06）
- `tools/tts/gen_tts_batch.py`: 作成していない（#EPIC-05）。`tools/tts/gas/` の移設のみ実施
- 新規学習機能・UI 変更: 実施していない（見た目・機能不変）
- JSON schema / データ内容変更: 実施していない（md5 一致で確認済み）

## 既知の pre-existing 事項（本 Issue 起因ではない）

`python3 tools/impact-ledger/gen_impact_ledger.py --check` は差分ありと報告する。これは
develop の現行 `src/index.template.html` に対して**移設前から既に生じていた** pre-existing drift
であることを、develop の旧ファイル（`git show origin/develop:src/index.template.html`）に対して
generator を実行して再現・確認済み（例: `$` シンボルの実際の行番号は develop 上で既に 1790 行目だが、
develop に commit 済みの `docs/impact-ledger.json` は 1466 行目のまま）。本 Issue の非対象範囲
（`docs/**` は #EPIC-04）に従い、本 PR では `docs/impact-ledger.json` を変更していない。

## Naoya 手作業依存項目（PR merge 前後で実施）

1. **Vercel Dashboard で Root Directory を `apps/web` に変更**
2. **Vercel preview URL 発行後、上記「Vercel preview 200 確認」チェックリストを PR コメントで実施**
3. **`develop` → `main` マージは本 PR merge とは別に Naoya の明示指示**
