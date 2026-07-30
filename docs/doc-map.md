# doc-map.md — 概念 → ホーム レジストリ（single-source 索引）

「どの概念がどのファイルに属すか」の唯一の索引。1 事実 1 ホーム（`docs/_conventions.md` 規約 2）を強制する。
AI-first 再編（EPIC #169）は完了済み。全ホームが `status=exists` で確立されている。

status 凡例: `exists` = 現存。

**衝突時の優先順位（正本）**: `docs/product.md`（WHY）→ `docs/features/<id>.md`（WHAT）→ `docs/data-contract.md`（データスキーマ）。
旧「PURPOSE → DESIGN → SPEC → REPO」の優先順位ルールは Issue E（#173）で本ルールに置換された（旧 3 文書は削除済み）。

---

## 1. 移設レジストリ（Issue B の CLAUDE.md router 化で移動した詳細ブロック）

Issue B は既存ファイルを削除しない。CLAUDE.md からは router に必要な最小記述のみ残し、移動対象の詳細本文は
各ホーム作成 Issue（C/D/E）が現行 CLAUDE.md（git 履歴）と下表を参照して移設する。B 完了時点で詳細は router から消えるが、
移設先が下表に記録され追跡可能であること（＝完了定義）。

| 旧 CLAUDE.md ブロック | 移設先ホーム | status |
|---|---|---|
| ポジショニング / タグライン | `docs/product.md` | exists |
| 開発体制 / 開発フロー 4-step / Issue タイプ・分割 / Issue 起票ルール（署名・ラベル・参照明示）/ Branch 戦略詳細 / AI 履歴置き場 / Bug 対応ループ / Claude への指示（返答末尾テンプレ等）/ Cursor への指示 / Issue 背景セクションの書き方 / ルール変更セルフチェック手順 | `docs/workflow.md` | exists |
| 品質基準 1（仕様書品質）/ 2（Cursor 指示書品質） | `docs/guardrails.md` | exists |
| 改修分類ブロック仕様（Level×Pattern） | `docs/change-classification.md` | exists |
| 技術スタック / ファイル構成ツリー | `docs/repo-map.md` | exists |
| 品質基準 3（データ整合性）/ 4（ランタイム契約 8 パス）/ 5（多言語 UI） | `docs/data-contract.md` | exists |

> ※ Issue C 完了により `workflow.md` / `guardrails.md` / `change-classification.md` が正本化。Issue D 完了により `data-contract.md` / `tts-design.md` / `pipeline.md` / `repo-map.md` / `history.md` が正本化。Issue E 完了により `product.md` / `docs/features/<id>.md` が正本化（旧 `PURPOSE.md` / `DESIGN.md` / `SPECIFICATION.md` は退役・削除）。Issue F 完了により `impact-ledger.json` / `impact-ledger.md` が正本化し、`repo-map.md` の一時退避 JS map 節を置換（EPIC #169 完了）。`CLAUDE.md` router 側は「Issue 起票要点 / レビュー・merge / ランタイム契約 8 パス（要点のみ）」の要点＋ポインタのみを残す（詳細は各ホーム参照）。

---

## 2. 概念 → ホーム レジストリ

| 概念 | ホームファイル | status | 更新トリガー |
|---|---|---|---|
| 記法規約 / feature ID レジストリ | `docs/_conventions.md` | exists | 規約・ID 体系変更時 |
| 概念→ホーム索引（本ファイル） | `docs/doc-map.md` | exists | 新規ドキュメント追加・ホーム移設時 |
| 絶対ルール / executor / halt / タスク→docs 表 | `CLAUDE.md` | exists | 絶対ルール・起動フロー変更時 |
| プロダクト目的 / ポジショニング / タグライン / personas | `docs/product.md` | exists | 方針・目的変更時 |
| 各 feature の挙動・画面・採点則+定数・データ・i18n キー | `docs/features/<id>.md` | exists | 該当 feature 変更時 |
| feature ID 索引 | `docs/features/README.md` | exists | ID 追加時 |
| ID 横断の共通シェル・セッションフロー・適応出題 | `docs/features/_common.md` | exists | 共通挙動変更時 |
| 全画面の DOM セレクタ・要素名・表示条件・状態パターン横断一覧（React 化デグレ確認用） | `docs/features/screen-inventory.md` | exists | 画面構造変更時 |
| ソースシンボル → feature_ids → scope → caller_areas | `docs/impact-ledger.json` | exists | ソース共通シンボル変更時（`tools/impact-ledger/gen_impact_ledger.py` 再実行） |
| impact-ledger 運用プロトコル / impact-analysis halt ルール正本 | `docs/impact-ledger.md` | exists | 横展開ルール変更時 |
| ランタイム 8 パス + JSON スキーマ + フィールド辞書 | `docs/data-contract.md` | exists | パス増減・スキーマ変更時 |
| 採点ロジック定数 | `docs/features/2a.md`(+2b/2c/2d) | exists | 定数変更時 |
| 多言語 UI i18n キー網羅 / leaf 数 | `docs/data-contract.md`(+ 該当 features) | exists | i18n キー増減時 |
| TTS プロンプト設計 | `docs/tts-design.md` | exists | TTS 改修時 |
| Python パイプラインコマンド | `docs/pipeline.md` | exists | パイプライン変更時 |
| ディレクトリツリー + インフラ | `docs/repo-map.md` | exists | ディレクトリ・インフラ変更時 |
| executor 対応フロー / Issue 起票ルール / レビュー・auto-merge / 返答末尾テンプレ | `docs/workflow.md` | exists | 運用フロー変更時 |
| Level×Pattern 分類体系 | `docs/change-classification.md` | exists | 分類体系変更時 |
| md5 検証(L3)/ 自己判断禁止 / doc-sync / impact-analysis halt / 仕様・指示書品質基準 | `docs/guardrails.md` | exists | ガードレール変更時 |
| UI 仕様の参照ポリシー | `docs/guardrails.md` §9 + `docs/claude-design/README.md` + `apps/web/src/index.template.html`(正本) | exists | UI 改修運用変更時 |
| 日付ログ（Phase 完了等の dated 記録） | `docs/history.md` | exists | 各 Phase 完了時 |
| ローンチ Phase 進捗 | `docs/LAUNCH-CHECKLIST.md` | exists | Phase 進捗・Issue 起票/完了時 |
| 運用手順（Vercel/GAS/DNS/Analytics） | `docs/OPERATIONS.md` | exists | 運用手順変更時 |
| バグ根本原因記録 | `docs/bug-knowledge.md` | exists | Bug PR マージ時 |
| ランタイム契約データ（wordlist/connected_speech/weak_forms/guide）の役割分担 | `packages/core/data/README.md` | exists | data 役割変更時 |
| エージェント定義（issue-handler / pr-reviewer / consistency-auditor） | `.claude/agents/*.md` | exists | エージェント仕様変更時 |
| CSS 変数命名・`--legacy-*` 運用・Track A CSS 技術制約（開発ゾーン） | `docs/CSS-CONVENTIONS.md` | exists | CSS 規約変更時 |
| CSS トークン実装値（色・spacing・radius・shadow・font-family）snapshot | `docs/design/phase-1/visual-tokens.md`（実装用 snapshot、`docs/design/phase-1/design-tokens.md` が抽出元記録） | exists | トークン値変更時 |
| デザイン原則・ペルソナ・voice/tone・感覚設計・アンチパターン（evergreen 設計入力） | `docs/design/{product-principles,user-personas,voice-and-tone,sensory-design,anti-patterns}.md` | exists | 設計方針変更時 |
| Mobile アプリ設計方針（React Native / Expo 画面構成） | `docs/repo-map.md`（apps/mobile セクション） | exists | Mobile アーキテクチャ変更時 |
| TTS バッチツーリング（`tools/tts/gen_tts_batch.py` 等） | `docs/tts-design.md` | exists | TTS バッチ改修時 |
| monorepo 4 ゾーン定義（`apps/web/` / `apps/mobile/` / `packages/core/` / `tools/`） | `docs/repo-map.md` | exists | ゾーン構成変更時 |
| Expo/EAS 設定（build profile・prebuild・app config） | `docs/repo-map.md` | exists | Expo/EAS 設定変更時 |

---

## 3. 旧ドキュメントの retire 完了記録（EPIC #169 全 Issue 実行済み）

以下は C/D/E で fold/delete された。retire の度に旧ファイル名への参照を全リポ grep し、新ホームへの参照のみ残した（EPIC 共通完了条件）。

- **Issue C は retire 完了**: `docs/dev-common.md` / `docs/claude-collaboration.md` / `docs/agent-instruction-guide.md` / `docs/DEV-GUARDRAILS.md` / `docs/DOC-SYNC-PLAYBOOK.md` / `docs/DOCUMENT-MAP.md` / `docs/CHANGE-CLASSIFICATION.md`（→ `docs/change-classification.md` に統合継承）を削除。`AGENTS.md` / `.cursor/rules/dev-flow.mdc` は薄い参照スタブに縮小（削除ではない、Codex/Cursor 自動読込のため存置）
- **Issue D は retire 完了**: `docs/REPOSITORY-STRUCTURE.md` を削除。内容は `docs/data-contract.md`（ランタイム契約・i18n schema）/ `docs/tts-design.md`（GAS/audio・R4 pending）/ `docs/pipeline.md`（Common pipeline commands・Phase 2 workflow）/ `docs/repo-map.md`（Quick orientation・Directory tree・Runtime infrastructure・JS map）/ `docs/history.md`（Wordlist/UI behaviour snapshot）へ分割移設。`docs/PURPOSE.md` の Phase 1/2/R 完了ログ・変更履歴も `docs/history.md` へ移設（ファイル自体は D では削除しない）。
- **Issue E は retire 完了**: `docs/PURPOSE.md` / `docs/DESIGN.md` / `docs/SPECIFICATION.md` を削除。evergreen 内容は `docs/product.md`（WHY）/ `docs/features/<id>.md`（WHAT・12 ID）/ `docs/features/_common.md`（ID 横断共通挙動）へ ID 単位で再構成。DESIGN §3 TTS・§4 データ整備タスク・SPEC §5 データスキーマは D で移設済みのため再移設せず features からリンク参照。残る日付ログ（DESIGN §2c–2g・§5 実装状況、SPEC 変更履歴）は `docs/history.md` §4–5 へ移設。
