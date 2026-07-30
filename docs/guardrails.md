# guardrails.md — デグレ防止・レビュー段階化・halt の正本

実装エージェントのデグレゼロ保証、レビュー深度の Level 段階化（簡素化 3）、doc-sync、impact-analysis halt の唯一のホーム。
Level × Pattern の判定自体は `docs/change-classification.md`、Issue 起票・実装フローは `docs/workflow.md` を参照。

## 1. 大原則

- **迷ったら中断**: 実装エージェントは自己判断で追加変更しない。判断に迷った時点で halt する（halt 経路は `CLAUDE.md` #halt プロトコル）
- **明示的な指示のみを実行**: Issue 本文に明示的に書かれていない変更（lint 修正・typo 修正・Markdown 整形・import 順序変更・ファイル名変更・未使用コード削除等）は「ついで作業」として禁止
- **ホワイトリスト方式**: 変更してよいファイルを Issue 本文で明示、それ以外は完全不変

## 2. 堅固化パターン（実装時の型）

| パターン | 適用条件 | フェーズ概要 |
|---|---|---|
| **A: 新規追加のみ** | 既存ファイルの編集を含まない | Phase 0 事前 md5 スナップショット → 配置 → 差分検証（既存ファイル完全不変）→ コミット+レポート → PR |
| **B: 既存編集を伴う** | 既存ファイル編集を含む（標準ケース） | Phase 0 スナップショット → 変更対象 grep+ホワイトリスト照合 → 機械的置換（Rule 1）と意図的編集（Rule 2-4）を**別コミット**に分離 → 差分検証 → コミット+レポート+PR |
| **C: 大規模改修** | 次の 3 条件のうち 2 つ以上: ①ファイル物理移動 ②ビルドシステム新規導入（単一入力→複数出力）③L3 かつ Change Pattern に C3 を含む | Phase 0-6（スナップショット→純粋move→最小差分→ビルド追加→生成物 md5 一致検証→統合テスト→Naoya 目視+PR）。各 Phase 別コミット、Phase ごとに自己検証結果を報告 |

```bash
# md5 スナップショット方式（パターン A/B/C 共通の基礎コマンド）
find . -type f ! -path './.git/*' -exec md5sum {} \; | sort > before-all.md5
# ...変更後...
find . -type f ! -path './.git/*' -exec md5sum {} \; | sort > after-all.md5
diff before-all.md5 after-all.md5
# 期待 diff: ホワイトリスト内の追加・変更・（明示指示があれば）削除のみ。それ以外があれば halt
```

## 3. レビュー段階化（簡素化 3）

| Level | 実施内容 | md5 | Naoya 関与 |
|---|---|---|---|
| **L1** | CI 緑 + セルフチェック（実装エージェント自身の確認）。`pr-reviewer` 起動は任意・省略可 | 不要 | 目視のみ、auto-merge 可 |
| **L2** | `pr-reviewer` による契約検証（ホワイトリスト・ゾーン逸脱・参照整合・完了定義トレース・ついで作業ゼロ・契約検証・横展開・実装レポート充足）が PASS | 不要 | auto-merge 可（PASS が条件） |
| **L3** | 上記に加え不変ブラックリストの md5 検証、6 言語生成物の script md5 一致、Complexity Retrospective（§6） | **必須** | **ack 必須**（auto-merge しない、レビュー結果が rubber stamp でも Naoya の明示承認を要する） |

**md5 検証対象の拡張（monorepo 化、EPIC #209 以降）**: ランタイム契約 8 パスに触れる L3 変更では、正本 `packages/core/data/*.json` の md5 に加え、`apps/web/public/data/*.json`（build 生成物、リポには追跡されない場合は build 直後のローカル比較でよい）と `apps/mobile/assets/data/*.json`（Mobile 実装後）が正本と一致することを確認する。3 箇所（core 正本 + web copy + mobile copy）の md5 が全て一致していることを実装レポートに記録する。

実装（`pr-reviewer` エージェント）は `.claude/agents/pr-reviewer.md` を正本とする機械検証。以下は `pr-reviewer` が参照する **Rv 実施時の 12 観点**（Naoya が手動 Rv する場合も同一基準を使う）。

| # | 観点 | 確認内容 |
|---|---|---|
| 1 | ホワイトリスト範囲内か | Issue 本文の「対象ファイル」に該当するファイルのみが変更されているか |
| 2 | Issue 本文の完全仕様との一致度 | 完了定義・テスト観点・非対象範囲がすべて満たされているか |
| 3 | 既存成果物への不変性 | 先行 Issue の成果物・ブラックリスト指定ファイルが変更されていないか（md5 検証、L3） |
| 4 | Runtime data contract の不変 | `packages/core/data/*.json` 等の実行時契約が意図せず変更されていないか |
| 5 | 生成物 6 言語の script md5 一致（該当時） | 多言語ビルド生成物で同一 script のものが md5 一致するか |
| 6 | 参照ドキュメントの整合 | 影響を受けるドキュメントがすべて意図通り更新されているか（`doc-map.md` レジストリ照合） |
| 7 | Complexity Retrospective の完全性 | 実装レポートの Retrospective が具体的で、テンプレの雛形が残っていないか |
| 8 | 「ついで作業」ゼロ | Issue に無い lint / typo / Markdown 整形が混入していないか |
| 9 | コミット分離 | Phase・Rule ごとにコミットが分離されているか |
| 10 | grep 検証結果の記録 | Issue 指定の grep 検証項目が実施され、結果が Comment / レポートに残っているか |
| 11 | 実装レポートの申し送り事項 | 後続への影響、未解決事項が明示されているか |
| 12 | 自己判断の透明性 | 実装エージェントが独自判断した箇所があれば、理由と代替案が記録されているか |

判定基準: 契約観点（1, 3, 4, 5）のいずれか違反 = FAIL。品質観点（2, 6-12）の軽微な不足は PASS（注記あり）。

## 4. Cursor / 実装エージェント自己判断禁止事項

以下は Issue 本文の明示的指示なしに行ってはならない（該当が必要と判断したら halt）:

lint 修正 / typo 修正（元の文言を保持）/ Markdown 整形 / import 順序変更 / コメント追加・削除 / コードスタイル変更 / ファイル名変更 / ディレクトリ移動 / 未使用変数・関数の削除 / 型注釈追加 / テスト追加 / ドキュメントリンク先の変更 / 依存ライブラリのバージョン変更

## 5. Complexity Retrospective（実装完了時点検・PR 作成前の必須点検）

実施者は実装エージェント自身。テンプレートは `docs/agent-reports/TEMPLATE.md` の「Complexity Retrospective」セクション（全実装レポート共通）。総合判定は 3 分岐:

| 判定 | 意味 | 次アクション |
|---|---|---|
| 事前分類妥当 | Level / Pattern が実態と一致 | PR 作成可 |
| Level 昇格提案 | 実態がより重い（例: L2→L3） | **PR 作成せず** halt（Issue Comment で中断）、Naoya 承認後に再開 |
| Pattern 追加提案 | 既存 C1–C7 で表現できない性質 | 同上。`docs/change-classification.md` §8 の追加フローへ |

降格提案（過大見積もり）は記録してよいが続行は可。Retrospective 未実施の PR は作成禁止。

## 6. doc-sync 判定マトリックス（ソース ⇔ ドキュメント同期）

ドキュメントの各章についてソースコードとの整合を判定する場合、以下の 3 分岐に従う。

| # | ソースの状態 | ドキュメントの記載 | アクション |
|---|---|---|---|
| 1 | 実装されている | 記載なし | ドキュメントを更新（追記） |
| 2 | 実装されていない | 記載なし | ノータッチ |
| 3 | 実装されていない | 記載あり + 削除履歴あり（`docs/agent-reports/` / クローズ済み Issue で確認） | ドキュメントを更新（該当セクション削除） |
| 4 | 実装されていない | 記載あり + 削除履歴なし | **halt**（曖昧な場合は必ずこちらを選ぶ） |

### 6a. ゾーン別 doc 更新義務表（monorepo 化、EPIC #209 以降）

変更したゾーンに応じて、以下のドキュメントが追随更新の対象になりうるか確認する（doc-map.md でホームを特定した上での補助表）。

| 変更ゾーン | 追随確認すべき doc |
|---|---|
| `apps/web/` | `docs/features/<id>.md`（実装 path 欄・Web）、`docs/repo-map.md` |
| `apps/mobile/`（実装後） | `docs/features/<id>.md`（実装 path 欄・Mobile）、`docs/repo-map.md` |
| `packages/core/` | `docs/data-contract.md`、`docs/features/<id>.md`（Shared 判定欄）、影響を受ける `apps/web/` と `apps/mobile/` 双方の doc |
| `tools/` | `docs/pipeline.md`、`docs/repo-map.md` |

該当なしの場合は doc-sync 判定マトリックス（上記 §6）の分岐 2（ノータッチ）を適用する。

## 7. impact-analysis halt ルール

共通シンボル（`scope=shared` または `scope=library`。例: `t()` / `activeIpa()` / `setExclusivePage` / `navigate` / `loadWordlist` 等）を編集する Issue・実装エージェントは、`docs/impact-ledger.json`（`tools/impact-ledger/gen_impact_ledger.py` 生成）の `caller_areas` を引き、実際の影響範囲が Issue 宣言 scope と異なる場合は **halt** する（`CLAUDE.md` halt トリガー (c)）。4 ステップの手順・スキーマ・scope 閾値・編集エージェントの更新義務は `docs/impact-ledger.md#impact-analysis-halt` が正本（重複させない）。

## 8. Category-A 自動検出（簡素化 4）

旧「Category A ドキュメント一覧を手動チェック」方式は廃止し、以下に置換する:

- **概念 → ホーム索引**は `docs/doc-map.md` が唯一のレジストリ。Issue で触る概念があれば、まず `doc-map.md` を引いてホームを特定する（手動リスト記憶に依存しない）
- **参照整合の自動検出**は grep ベースで行う: リネーム・削除した概念名を全リポで `grep -rn '<旧名>' .` し、意図した新ホームへの参照のみが残ることを確認する（`docs/agent-reports/` 等の履歴は除外）
- 新規ドキュメントを作る場合、`docs/doc-map.md` §2 に行を追加することが Issue の完了条件に含まれる（PR ブロッカー相当）

## 9. UI 仕様の参照ポリシー（2026-07-29 改定、monorepo 化・EPIC #209 で 4 ゾーン対応に更新）

**UI 仕様の正本は Web は `apps/web/src/index.template.html`（実装）、Mobile は `apps/mobile/src/` の RN 画面コンポーネント（実装後、EPIC-06/EPIC-07）。** `docs/claude-design/{sp,pc,design-system}.dc.html` は Web 画面の**凍結フレームカタログ**（画面一覧としての俯瞰用。pixel-perfect 精度は保証しない。更新義務なし。Mobile 画面は収録対象外）。

**外部 Claude Design(SaaS) は今後使用しない**（更新も参照も反映待ちもしない）。旧 A/B/C の CD 修正判定・「CD 修正必須」ブロック・round-trip 指示書は **廃止**。UI 改修 Issue では以下を守る:

- 正本コード: Web は `apps/web/src/index.template.html`、Mobile は `apps/mobile/src/`（実装後）を read
- 画面一覧の俯瞰（Web のみ）: `docs/claude-design/sp.dc.html` / `pc.dc.html`（見た目の正確性は保証しない）
- 見た目の確認: Web は **Vercel branch preview URL**（PR/branch ごとに自動生成）、Mobile は実機・シミュレータで実際の描画を確認
- `.dc.html` の更新を UI 改修の完了条件に含めない
- 「CD が古いから CD 更新から」といった前提を持ち込まない
- 「CD セッションを再開して zip を送って」といった要求を Naoya にしない

詳細ポリシーと廃止経緯は `docs/claude-design/README.md`。旧 `UPDATE-GUIDE.md` / `cd-updates/*.md` は歴史的資料として残置（参照禁止）。

## 10. ランタイム契約検証ガード

`packages/core/i18n/*.json` または `apps/web/src/index.template.html` / `apps/mobile/src/`（実装後）の i18n 参照を変更する場合、PR 作成前に必ず実行:

```bash
python3 tools/validate/validate_i18n.py
```

GitHub Actions `validate-i18n` でも実行され、以下を hard-fail として扱う: ja 以外の UI JSON に残った CJK かな / 6 言語 UI JSON の leaf key 不一致 / 同一 key のプレースホルダ集合不一致 / BOM・末尾改行欠落・インデント崩れ / `_html` サフィックス key の不正タグ・ネスト。翻訳品質そのもの（自然さ・字体妥当性）は機械判定対象外、Preview URL での目視確認に委ねる。

ランタイム契約 8 パスの一覧・JSON スキーマ・wordlist 系再カウントコマンドの正本は `docs/data-contract.md`。パイプラインコマンドは `docs/pipeline.md`。

---

_旧 `docs/DEV-GUARDRAILS.md` / `docs/DOC-SYNC-PLAYBOOK.md` / `docs/dev-common.md`（Rv 12 観点・md5 検証節）を整理継承。_
