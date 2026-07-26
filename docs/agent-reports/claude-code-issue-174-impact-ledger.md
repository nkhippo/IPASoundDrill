# [Issue F] impact-ledger.json + gen_impact_ledger.py + impact-analysis halt 配線 (#174) — 実装レポート

## 関連 Issue / PR

- Issue: #174（親 EPIC: #169、依存: #170 (B), #171 (C), #172 (D), #173 (E)。EPIC #169 最終回）
- PR: （本コミット直後に作成）
- Agent: claude-code（issue-handler）

## Issue 背景（Issue 本文から要約）

- **改修分類**: Complexity Level L3（新規 Tier 3 の確立）/ Change Pattern C7（ドキュメント整備）+ C1（新規スクリプト追加）。判定根拠: 横展開・影響確認の正本を新設し halt を配線する EPIC のゴール中核。
- EPIC #169 のゴール「共通機能を修正する場合、設計＋ソースから共通と判断 → 該当箇所のみ修正 → 周辺機能への影響なしを確認、想定と異なれば中断報告」を仕組み化する最後のピース。
- `src/index.template.html`（~5,411L、~290 関数）の call-graph を静的解析し、シンボル単位の scope/影響範囲を機械生成する `impact-ledger.json` + プロトコル `impact-ledger.md` + 生成器 `gen_impact_ledger.py` を新設し、D で `repo-map.md` に一時退避した JS 関数マップを置換する。
- ゾーン跨ぎ（`scripts/` 開発ゾーン + `docs/**` 運用ゾーン）は Issue 本文で明示的に承認された docs-infra atomic 例外（生成器とその出力・docs が密結合で分割不能なため）。

## 実装内容

- `scripts/gen_impact_ledger.py` を新規作成: `src/index.template.html` の main `<script>` ブロックを検出し、`function name(` / `async function name(` （任意インデント、ネスト関数含む）と `const name = (...) => ` 形式（括弧なし単一引数含む。`$` / `show` をカバー）で全シンボルを抽出。列0の関数宣言行を境界とする簡易スコープ判定で「どのトップレベル関数の中の行か」を行単位にマッピングし、各シンボルへの呼び出し箇所（テキスト一致 `name(`）の呼び出し元関数名を 13 エリア語彙（decode/encode/study/connected/profile/vocab/picker/progress/about/reveal/summary/top/infra）へ分類（`EXACT_AREA` 明示辞書 — 旧 `repo-map.md` JS map の分類を継承 — → `PREFIX_RULES` 前方一致フォールバック → `infra` デフォルト）。`caller_areas` の要素数で `scope`（library=5+/shared=2-4/primary=0-1）を判定し、`AREA_TO_FEATURE` で凍結 12 ID レジストリのみへ `feature_ids` を絞り込む（`infra`・未登録概念は feature_id を持たない）。`depends_on` は本体内で呼び出す他の台帳シンボルをベストエフォートで収集。`activeIpa` のみ `SEED_OVERRIDES` で Issue 本文の worked example をそのまま固定（直接呼び出しグラフだけでは TTS/accent 系の共有ヘルパー経由の間接波及を検出できないため）。
- `docs/impact-ledger.json` を生成器の初回実行結果としてコミット（293 シンボル、symbol 昇順）。
- `docs/impact-ledger.md` を新規作成: スキーマ定義（6 フィールド）・13 エリア語彙+feature ID 対応表・scope 3 値の閾値・`activeIpa` 固定例外の説明・impact-analysis halt ルール正本（4 ステップ）・再生成手順（`--check` フラグ含む）・編集エージェントの更新義務・既知の限界（直接呼び出しのみ検出/総称名ヘルパーの誤分類可能性/未登録概念の infra 寄せ）。
- `docs/guardrails.md` §7: Issue C のプレースホルダ節を `docs/impact-ledger.md#impact-analysis-halt` へのリンク+要約に置換。
- `docs/repo-map.md`: 「src/index.template.html JS map」節（186 行、13 サブセクションの手動関数一覧）を削除し、`docs/impact-ledger.json`/`docs/impact-ledger.md` へのポインタ（5 行）に置換。
- `docs/features/{1a,2a,2b,2c,2d,3a,3b,3c,3d,3h,reveal,summary}.md`（12 ファイル）: 「関連シンボル」節のプレースホルダ「Issue F の impact-ledger 生成後にリンク。」を、`docs/impact-ledger.json` で `feature_ids` に該当 ID を含むシンボルを参照するクエリポインタに更新（コピーせず one-home）。
- `docs/doc-map.md`: `docs/impact-ledger.json` / `docs/impact-ledger.md` の行を `planned(F)` → `exists` に更新、冒頭の Issue 完了ログ注記に Issue F を追記（EPIC #169 完了の旨）。
- **（任意）CI regenerate-check**: Issue 本文が「競合懸念があるため warning-only、または本項スキップ推奨」としていたため、実装せず見送った（手動行更新との競合リスクを避けるため。判断は下記「実装過程での気づき」参照）。

## 変更ファイル

```
- scripts/gen_impact_ledger.py (A)
- docs/impact-ledger.json (A)
- docs/impact-ledger.md (A)
- docs/guardrails.md (M)
- docs/repo-map.md (M)
- docs/features/1a.md (M)
- docs/features/2a.md (M)
- docs/features/2b.md (M)
- docs/features/2c.md (M)
- docs/features/2d.md (M)
- docs/features/3a.md (M)
- docs/features/3b.md (M)
- docs/features/3c.md (M)
- docs/features/3d.md (M)
- docs/features/3h.md (M)
- docs/features/reveal.md (M)
- docs/features/summary.md (M)
- docs/doc-map.md (M)
- docs/agent-reports/claude-code-issue-174-impact-ledger.md (A, 本レポート)
```

## デグレ防止検証

- 変更範囲は Issue 本文が明示的に承認した「docs-infra atomic 例外」ホワイトリスト内のみ（`scripts/gen_impact_ledger.py`（開発ゾーン）+ `docs/impact-ledger.{json,md}` / `docs/guardrails.md` / `docs/repo-map.md` / 12 `docs/features/<id>.md` / `docs/doc-map.md`（運用ゾーン））。`git status --short` で確認済み、ホワイトリスト外の変更なし。
- **`src/index.template.html` は一切変更していない**（読み取り専用の解析対象。`git status --short` に同ファイルが出現しないことを確認）。他の `src/**` / `i18n/**` / `data/**` / `tools/**` / `gas/**` にも触れていない。
- ランタイム契約 8 パスの実体ファイルは変更していない。ソース解析のみでランタイム挙動の変更はゼロ。
- 実装中の自己判断による追加変更: `scripts/gen_impact_ledger.py` の `ARROW_CONST_RE` を、括弧付き引数（`(id,on)=>`）だけでなく括弧なし単一引数（`id=>`）も検出するよう拡張した（Issue 本文の例示パターンには明記がなかったが、`$`（DOM 取得、501 呼び出し）を捕捉するために必要と判断。「全関数を含む」完了定義を満たすための最小限の拡張として実施、自己判断の透明性としてここに記録）。
- 実装中に発覚した懸念: なし。

## 動作確認

- 完了定義「`scripts/gen_impact_ledger.py` が動作し `impact-ledger.json` を冪等生成」: 満たす。`python3 scripts/gen_impact_ledger.py` を 2 回連続実行し `diff` で出力バイト列が完全一致することを確認（`--check` フラグでも `up to date` を確認）。
- 完了定義「`impact-ledger.json` が全関数を symbol 昇順で含み、スキーマ準拠」: 満たす。293 シンボル、`json.load` 後 `d == sorted(d, key=lambda e: e['symbol'])` で True を確認。各エントリは `symbol`/`line`/`feature_ids`/`scope`/`caller_areas`/`depends_on` の 6 フィールドを Issue 本文と同じキー順で保持。
- 完了定義「**spot-check 合格**」:
  - `t` → `scope: "library"`、`caller_areas` 10 エリア（`decode`/`study`/`connected`/`profile`/`vocab`/`picker`/`progress`/`reveal`/`summary`/`infra`）。**合格**。
  - `activeIpa` → `scope: "shared"`、`feature_ids: ["2a","2b","2c","2d","reveal"]`、`caller_areas: ["decode","encode","study","connected","reveal"]`（Issue 本文の worked example と完全一致）。**合格**。
  - `vocab*` → `vocabDisplayGloss` で `scope: "primary"`、`feature_ids: ["3b"]`、`caller_areas: ["vocab"]`。同様に `vocabAltSpeakerHtml`/`vocabEntry`/`vocabIpaKeyboardSymbols` も primary→`["3b"]`。**合格**（`vocab*` プレフィックスの一部は総称名の呼び出し元（仮想リスト描画ヘルパー等）を経由するため `infra` に分類される既知の限界があり、`docs/impact-ledger.md` §6 に明記した）。
- 完了定義「**シミュレーション**: `activeIpa` 編集 → halt 手順明記」: `docs/impact-ledger.md` §4 に 4 ステップの halt 手順を明記（① ledger を引く ② 宣言 scope/feature_ids と実 caller_areas を照合 ③ 収まらねば halt ④ 収まる場合のみ横展開修正）。`activeIpa` の `scope=shared`・5 エリアの caller_areas が具体例として §3 に記載済み。
- 完了定義「`impact-ledger.md` にスキーマ + halt ルール + 再生成/更新手順」: 満たす（§2 スキーマ、§4 halt ルール、§5 再生成手順、§6 更新義務）。
- 完了定義「`guardrails.md` の halt 節が ledger にリンク」: §7 を `docs/impact-ledger.md#impact-analysis-halt` へのリンク+要約に置換済み。
- 完了定義「`repo-map.md` の JS map 節が ledger ポインタに置換」: `grep -n "JS map\|initApp\|activeIpa\|vocabDisplayGloss" docs/repo-map.md` が 0 件（旧内容の実体なし）であることを確認。
- 完了定義「各 `features/<id>.md` の「関連シンボル」がクエリポインタに更新」: 12 ファイル全てで `grep -rn "Issue F の impact-ledger 生成後にリンク" docs/features/{1a,2a,2b,2c,2d,3a,3b,3c,3d,3h,reveal,summary}.md` が 0 件、更新後の文言が全ファイルに存在することを確認。
- 完了定義「`doc-map.md` に impact-ledger の行追加・status=exists」: §2 の該当 2 行を `planned(F)` → `exists` に更新（新規追加ではなく既存プレースホルダ行の status 更新。Issue B/C/E で既に前方参照登録済みだったため）。
- テスト観点「共通関数 `activeIpa` 改修の影響 feature を一意に列挙できるか」: `caller_areas`/`feature_ids` で `["2a","2b","2c","2d","reveal"]` を一意に取得可能。
- テスト観点「ローカル関数 `vocab*` が 3b のみに紐づき、他機能に波及しないと読めるか」: `vocabDisplayGloss` 等で `feature_ids: ["3b"]` のみを確認。
- テスト観点「生成器を 2 回実行して出力が完全一致（冪等）」: 上記デグレ防止検証で確認済み。
- 全 `feature_ids` が `docs/_conventions.md` の凍結 12 ID レジストリ内であることを検証: `{'1a','2a','2b','2c','2d','3a','3b','3c','3d','3h','reveal','summary'}` に含まれない ID が 0 件であることを Python で確認（未登録概念であるオンボーディング等は全て `infra` に分類し `feature_ids` を持たせないことで担保）。
- 既存機能への影響: なし（`src/index.template.html` 不変、ドキュメント・生成物のみ）。
- データ整合性: 対象外（ランタイム契約 8 パス非該当。ソース解析のみで `wordlist`/`i18n`/`connected_speech` 等は未変更のため `validate_i18n.py` 等の実行は不要と判断）。
- `python3 scripts/validate/validate-markdown-refs.py --changed-files <本 PR の変更 .md 一覧> --broken-refs migration/broken-refs.csv` を実行し、V7（markdown link 形式禁止）は全変更ファイルで PASS（`docs/impact-ledger.md` 含め backtick 相対パス表記のみ使用）を確認。V1（frontmatter id 欠落）は Issue A のフロントマター全廃止に起因する repo 全体の pre-existing 状態（新規ファイル `docs/impact-ledger.md` も同様に該当するが exit code は 0 のまま、既存全ファイルと同一の既知状態であり本 PR 由来ではない）。

## 実装過程での気づき

- Issue 本文の worked example（`activeIpa` の `caller_areas` 5 件 → `scope: "shared"`）は、`docs/impact-ledger.md` §3 が定める一般閾値ルール「library = 5 エリア以上」と字面上矛盾する（5 エリアなら本来 library のはず）。これは `activeIpa` が TTS/accent 系の共有ヘルパー経由で decode/study/connected へ間接的に波及するため、直接呼び出しグラフだけでは 4 エリアしか検出できず、かつ Issue の worked example 自体が閾値ルールより緩い「shared」ラベルを明示的に指定していることに起因する。この 1 件は Issue 本文の「既知共通リスト」（シードマップとして明示的にハードコードすべき対象）として明記されていたため、一般閾値ルールを変更するのではなく `SEED_OVERRIDES` による単一シンボルの固定例外として扱い、`docs/impact-ledger.md` §3 にその旨を明記した。他の 292 シンボルは全てコールグラフ計算のみで導出しており、閾値ルール自体は変更していない。
- CI regenerate-check（任意項目 7）は、Issue 本文が「手動行更新と競合しうるため warning-only、または本項スキップ推奨」としていたため実装を見送った。理由: 台帳は編集エージェントが実装時に手動更新する運用（`docs/impact-ledger.md` §6）であり、CI が毎回強制再生成・比較すると、レビュー中の手動微調整（誤分類の `EXACT_AREA` 修正等）と drift 警告が頻発し、L1/L2 auto-merge の妨げになるリスクがあると判断した。
- `docs/features/README.md` および `docs/features/_common.md` にも「Issue F の impact-ledger 生成後にリンク」に類する記述が残っている（それぞれ「ソースシンボルとの対応（impact-ledger）は Issue F 完了後に...」「共有シンボルは `docs/impact-ledger.json` を参照予定」）。いずれも本 Issue のホワイトリスト（12 `features/<id>.md` + `docs/guardrails.md`/`docs/repo-map.md`/`docs/doc-map.md`/`scripts/gen_impact_ledger.py`/`docs/impact-ledger.{json,md}`）に含まれないため、ホワイトリスト方式に従い**意図的に変更していない**。次の軽微な docs 整備 Issue でのフォローアップを推奨する（詳細は「後続への影響」参照）。

## 後続への影響

- `docs/features/README.md:34`（「ソースシンボルとの対応（impact-ledger）は Issue F 完了後に `docs/impact-ledger.json` へ」）と `docs/features/_common.md:114`（「Issue F の impact-ledger 生成後にリンク」）が Issue F 完了後も未更新のまま残る。次の軽微な docs Issue（L1 相当、単一ファイル+完了 Issue への追従）でこの 2 箇所を `docs/impact-ledger.json`/`docs/impact-ledger.md` への実リンクに更新することを推奨する。
- EPIC #169（B→C→D→E→F）が本 Issue で完了する。以降の全改修 Issue は共通シンボルに触れる際 `docs/impact-ledger.json` を引き、`docs/guardrails.md` §7 / `docs/impact-ledger.md` §4 の impact-analysis halt ルールに従う運用に移行する。
- `src/index.template.html` の関数を追加・改名・移動する実装エージェントは、当該 PR で `python3 scripts/gen_impact_ledger.py` を再実行し `docs/impact-ledger.json` の差分をコミットに含める義務がある（`docs/impact-ledger.md` §6）。

## 残課題・申し送り

- なし（Issue 本文の完了定義は全て満たした。任意項目の CI regenerate-check のみ、Issue 本文の推奨に従い意図的に見送った）。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: 新規 Tier 3（impact-ledger）の確立と halt 配線という EPIC のゴール中核であり、既存 12 features + guardrails + repo-map + doc-map への横断的な参照更新を伴う規模・影響範囲は L3 相当。実装中に Level を跨ぐような追加スコープの発生はなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C7（ドキュメント整備）+ C1（新規スクリプト追加）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（`src/index.template.html` を含む実体ファイルは一切不変、解析のみ）
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（`doc-map.md` で新ホームを索引化済み）
- [x] 既存ファイルパスへの依存関係が壊れていない（旧 JS map 節への生きた参照は本 PR の変更範囲内で全て ledger ポインタへ付け替え済み）

### Phase 分割の妥当性

- 想定 Phase 数: 1（docs-infra atomic 例外により、Issue 本文で事前承認済みのゾーン跨ぎ単一 PR）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし（生成器 → JSON → docs 参照更新は単一コミット群で一貫性を保って作成）

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
