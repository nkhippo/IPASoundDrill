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

実装（`pr-reviewer` エージェント）は `.claude/agents/pr-reviewer.md` を正本とする機械検証。以下は `pr-reviewer` が参照する **Rv 実施時の 12 観点**（Naoya が手動 Rv する場合も同一基準を使う）。

| # | 観点 | 確認内容 |
|---|---|---|
| 1 | ホワイトリスト範囲内か | Issue 本文の「対象ファイル」に該当するファイルのみが変更されているか |
| 2 | Issue 本文の完全仕様との一致度 | 完了定義・テスト観点・非対象範囲がすべて満たされているか |
| 3 | 既存成果物への不変性 | 先行 Issue の成果物・ブラックリスト指定ファイルが変更されていないか（md5 検証、L3） |
| 4 | Runtime data contract の不変 | `data/*.json` 等の実行時契約が意図せず変更されていないか |
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

## 7. impact-analysis halt ルール（プレースホルダ・実配線は Issue F）

共通シンボル（`t()` / `activeIpa()` / `setExclusivePage` / `navigate` / `loadWordlist` 等）を編集する Issue では、`docs/impact-ledger.json`（作成後）の `caller_areas` を引き、実際の影響範囲が Issue 宣言 scope と異なる場合は **halt** する（`CLAUDE.md` halt トリガー (c)）。台帳自体の生成・運用プロトコルは Issue F（`docs/impact-ledger.md`）で完成させる。それまでは実装エージェントが手動で `grep` による呼び出し元調査を行い、想定 scope 超過があれば halt する。

## 8. Category-A 自動検出（簡素化 4）

旧「Category A ドキュメント一覧を手動チェック」方式は廃止し、以下に置換する:

- **概念 → ホーム索引**は `docs/doc-map.md` が唯一のレジストリ。Issue で触る概念があれば、まず `doc-map.md` を引いてホームを特定する（手動リスト記憶に依存しない）
- **参照整合の自動検出**は grep ベースで行う: リネーム・削除した概念名を全リポで `grep -rn '<旧名>' .` し、意図した新ホームへの参照のみが残ることを確認する（`docs/agent-reports/` 等の履歴は除外）
- 新規ドキュメントを作る場合、`docs/doc-map.md` §2 に行を追加することが Issue の完了条件に含まれる（PR ブロッカー相当）

## 9. CD（Claude Design）修正判定

UI 改修 Issue 起票時、実装が CD（`docs/claude-design/`）とどう関係するかを判定し、Issue 本文の改修分類ブロックに記載する。

| 分類 | 状況 | 対応 |
|---|---|---|
| **A. CD 修正必須** | 実装が CD 準拠を目指すべきだが、CD が古い/不足 | CD 更新 PR → UI 改修 Issue の順 |
| **B. CD 意図的乖離** | 実装が CD と意図的に異なる | UI 改修 Issue 内に「CD 意図的乖離」セクションで明記 |
| **C. CD 修正不要** | CD が最新と一致 | UI 改修 Issue のみ起票 |

CD ファイルが添付されていない UI 改修 Issue は着手禁止。詳細運用は `docs/claude-design/UPDATE-GUIDE.md`。Docs 改修（C1）等 UI に影響しない Issue では「該当なし」と記載する。

## 10. ランタイム契約検証ガード

`i18n/*.json` または `src/index.template.html` の i18n 参照を変更する場合、PR 作成前に必ず実行:

```bash
python3 tools/validate_i18n.py
```

GitHub Actions `validate-i18n` でも実行され、以下を hard-fail として扱う: ja 以外の UI JSON に残った CJK かな / 6 言語 UI JSON の leaf key 不一致 / 同一 key のプレースホルダ集合不一致 / BOM・末尾改行欠落・インデント崩れ / `_html` サフィックス key の不正タグ・ネスト。翻訳品質そのもの（自然さ・字体妥当性）は機械判定対象外、Preview URL での目視確認に委ねる。

ランタイム契約 8 パスの一覧・JSON スキーマ・wordlist 系再カウントコマンドの正本は `docs/data-contract.md`。パイプラインコマンドは `docs/pipeline.md`。

---

_旧 `docs/DEV-GUARDRAILS.md` / `docs/DOC-SYNC-PLAYBOOK.md` / `docs/dev-common.md`（Rv 12 観点・md5 検証節）を整理継承。_
