# doc-map.md — 概念 → ホーム レジストリ（single-source 索引）

「どの概念がどのファイルに属すか」の唯一の索引。1 事実 1 ホーム（`docs/_conventions.md` 規約 2）を強制する。
AI-first 再編（EPIC #169）進行中のため、未作成ホームは `status=planned(Issue)` で前方参照を追跡する。

status 凡例: `exists` = 現存 / `planned(X)` = Issue X で作成予定（それまで詳細は git 履歴＋当該 Issue の対応表を正本とする）。

---

## 1. 移設レジストリ（Issue B の CLAUDE.md router 化で移動した詳細ブロック）

Issue B は既存ファイルを削除しない。CLAUDE.md からは router に必要な最小記述のみ残し、移動対象の詳細本文は
各ホーム作成 Issue（C/D/E）が現行 CLAUDE.md（git 履歴）と下表を参照して移設する。B 完了時点で詳細は router から消えるが、
移設先が下表に記録され追跡可能であること（＝完了定義）。

| 旧 CLAUDE.md ブロック | 移設先ホーム | status |
|---|---|---|
| ポジショニング / タグライン | `docs/product.md` | planned(E) |
| 開発体制 / 開発フロー 4-step / Issue タイプ・分割 / Issue 起票ルール（署名・ラベル・参照明示）/ Branch 戦略詳細 / AI 履歴置き場 / Bug 対応ループ / Claude への指示（返答末尾テンプレ等）/ Cursor への指示 / Issue 背景セクションの書き方 / ルール変更セルフチェック手順 | `docs/workflow.md` | planned(C) |
| 品質基準 1（仕様書品質）/ 2（Cursor 指示書品質） | `docs/guardrails.md` | planned(C) |
| 改修分類ブロック仕様（Level×Pattern） | `docs/change-classification.md` | planned(C) |
| 技術スタック / ファイル構成ツリー | `docs/repo-map.md` | planned(D) |
| 品質基準 3（データ整合性）/ 4（ランタイム契約 8 パス）/ 5（多言語 UI） | `docs/data-contract.md` | planned(D) |

---

## 2. 概念 → ホーム レジストリ

| 概念 | ホームファイル | status | 更新トリガー |
|---|---|---|---|
| 記法規約 / feature ID レジストリ | `docs/_conventions.md` | exists | 規約・ID 体系変更時 |
| 概念→ホーム索引（本ファイル） | `docs/doc-map.md` | exists | 新規ドキュメント追加・ホーム移設時 |
| 絶対ルール / executor / halt / タスク→docs 表 | `CLAUDE.md` | exists | 絶対ルール・起動フロー変更時 |
| プロダクト目的 / ポジショニング / タグライン / personas | `docs/product.md` | planned(E) | 方針・目的変更時 |
| 各 feature の挙動・画面・採点則+定数・データ・i18n キー | `docs/features/<id>.md` | planned(E) | 該当 feature 変更時 |
| feature ID 索引 | `docs/features/README.md` | planned(E) | ID 追加時 |
| ソースシンボル → feature_ids → scope → caller_areas | `docs/impact-ledger.json` | planned(F) | ソース共通シンボル変更時 |
| impact-ledger 運用プロトコル | `docs/impact-ledger.md` | planned(F) | 横展開ルール変更時 |
| ランタイム 8 パス + JSON スキーマ + フィールド辞書 | `docs/data-contract.md` | planned(D) | パス増減・スキーマ変更時 |
| 採点ロジック定数 | `docs/features/2a.md`(+2c) | planned(E) | 定数変更時 |
| 多言語 UI i18n キー網羅 / leaf 数 | `docs/data-contract.md`(+ 該当 features) | planned(D) | i18n キー増減時 |
| TTS プロンプト設計 | `docs/tts-design.md` | planned(D) | TTS 改修時 |
| Python パイプラインコマンド | `docs/pipeline.md` | planned(D) | パイプライン変更時 |
| ディレクトリツリー + インフラ | `docs/repo-map.md` | planned(D) | ディレクトリ・インフラ変更時 |
| executor 対応フロー / Issue 起票ルール / レビュー・auto-merge / 返答末尾テンプレ | `docs/workflow.md` | planned(C) | 運用フロー変更時 |
| Level×Pattern 分類体系 | `docs/change-classification.md` | planned(C) | 分類体系変更時 |
| md5 検証(L3)/ 自己判断禁止 / doc-sync / impact-analysis halt / 仕様・指示書品質基準 | `docs/guardrails.md` | planned(C) | ガードレール変更時 |
| CD(Claude Design)修正判定 | `docs/guardrails.md`(判定) + `docs/claude-design/` | planned(C) | UI 改修運用変更時 |
| 日付ログ（Phase 完了等の dated 記録） | `docs/history.md` | planned(D) | 各 Phase 完了時 |
| ローンチ Phase 進捗 | `docs/LAUNCH-CHECKLIST.md` | exists | Phase 進捗・Issue 起票/完了時 |
| 運用手順（Vercel/GAS/DNS/Analytics） | `docs/OPERATIONS.md` | exists | 運用手順変更時 |
| バグ根本原因記録 | `docs/bug-knowledge.md` | exists | Bug PR マージ時 |
| data/ 配下の役割分担 | `data/README.md` | exists | data/ 役割変更時 |
| エージェント定義（issue-handler / pr-reviewer / consistency-auditor） | `.claude/agents/*.md` | exists | エージェント仕様変更時 |

---

## 3. 旧ドキュメントの retire 予定（後続 Issue が実行）

以下は C/D/E で fold/delete される。retire の度に旧ファイル名への参照を全リポ grep し、新ホームへの参照のみ残す（EPIC 共通完了条件）。

- Issue C が retire: `AGENTS.md` / `.cursor/rules/dev-flow.mdc` / `docs/dev-common.md` / `docs/claude-collaboration.md` / `docs/agent-instruction-guide.md` / `docs/DEV-GUARDRAILS.md` / `docs/DOC-SYNC-PLAYBOOK.md` / `docs/DOCUMENT-MAP.md` / `docs/CHANGE-CLASSIFICATION.md`
- Issue D が retire: `docs/REPOSITORY-STRUCTURE.md`
- Issue E が retire: `docs/PURPOSE.md` / `docs/DESIGN.md` / `docs/SPECIFICATION.md`
