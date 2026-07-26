# CLAUDE.md — ipasounddrill Router

このファイルは常時ロードされる Tier 0 Router。**絶対ルール + executor モデル + halt + 「タスク種別 → 読むべき docs」対応表**のみを持ち、詳細は各ホームにオンデマンドで取りに行く。

- 記法規約（front-matter 禁止・one fact one home・feature ID レジストリ等）: `docs/_conventions.md`
- どの概念がどのファイルに属すか（single-source 索引）: `docs/doc-map.md`

> このリポの Markdown は **AI エージェント専用の消費物**。人間は読まず、必要時に Claude が要約生成する。

---

## プロダクト identity

- **名称**: IPA Sound Drill(旧 IPA Drill / English Pronunciation Trainer)
- **repo**: https://github.com/nkhippo/IPASoundDrill / **公開 URL**: https://ipasounddrill.app
- 目的・ポジショニング・タグライン → `docs/product.md`(Issue E で作成)。技術スタック・ファイル構成 → `docs/repo-map.md`(Issue D で作成)。

---

## 絶対ルール（常時適用）

1. **Track A 制約**: 現行の静的 HTML + JSON + GAS TTS 構成を維持する。React 化・BE 移管は Track B(ローンチ後)。Track A の Issue は「ローンチブロッカーか否か」を明示する。
2. **ThinkGrindAi と混同しない**: Naoya は別プロジェクト `thinkgrindai`(Vite+React、Obsidian 履歴、7-step)も運用する。本リポは静的 HTML・GitHub リポ内 AI 履歴・4-step。両者を跨ぐ時は本ファイルを読み直す。
3. **憶測回答禁止**: 不明な点は該当 docs を参照するか Naoya に確認する。仕様の正本は GitHub Issue 本文。
4. **公開 URL を勝手に生成しない**: プログラミング支援に確信がある URL、ユーザ提供 URL、ローカルファイル由来のみ使用する。
5. **branch**: Track A は main-first(全 PR の base は `main`)。Track B で develop-first に切替。

---

## Executor モデル

| 役割 | 担当 | 作業 |
|---|---|---|
| 壁打ち + Issue 起票 | Claude(Naoya と対話) | 要件整理・Issue 本文作成・起票 |
| 実装 | 原則 Codex/Cursor が非同期(PR)。**情報伝達漏れが起きやすい大規模ドキュメント/デザイン反映は ClaudeCode 同一セッション** | Issue を読んで実装・PR |
| PM・最終 merge | Naoya | 壁打ち + halt 質問への回答 + 最終 merge のみ |

エージェント委譲・レビュー・auto-merge の詳細は `docs/workflow.md`(Issue C で作成)。

## halt プロトコル

実装エージェントは以下のいずれかで**推測を進めず中断・報告**する:

- **(a)** 多義な解釈が生じた
- **(b)** ホワイトリスト(Issue 宣言の対象ファイル)を逸脱する必要が出た
- **(c)** 実際の影響範囲(横展開)が Issue 宣言 scope と異なる(共通シンボルに触れて周辺機能に波及する等)

halt 経路: 同一セッション ClaudeCode → その場で Naoya に質問 / 非同期 Codex/Cursor → Issue コメント。

---

## タスク種別 → 読むべき docs 対応表

`CLAUDE.md` は常時ロード。それ以外は下表に従いオンデマンド取得する。

| タスク種別 | 追加で読む |
|---|---|
| 特定 feature のバグ / UI 改修 | `docs/features/<id>.md`、（共通関数に触るなら）`docs/impact-ledger.json` |
| データ / JSON スキーマ変更 | `docs/data-contract.md`、該当 `docs/features/<id>.md` |
| TTS 改修 | `docs/tts-design.md` |
| パイプライン / データ生成 | `docs/pipeline.md` |
| Issue 起票・改修方針判断 | `docs/workflow.md`、`docs/change-classification.md` |
| ドキュメント整備 | `docs/doc-map.md`、`docs/_conventions.md`、`docs/guardrails.md`(doc-sync) |
| リポ構造 / インフラ変更 | `docs/repo-map.md` |

> 上表のホームの一部は AI-first 再編(EPIC #169)で順次作成中。各概念の現ホームと status は `docs/doc-map.md` を参照。

---

## 起動時動作

1. このファイル(`CLAUDE.md`)を読む。
2. タスク種別を判断し、上の対応表に従い必要な docs をオンデマンド取得する。
3. 取得した docs を整合させて現状把握。不明点は憶測せず参照 or Naoya に確認。
