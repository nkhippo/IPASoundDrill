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

## Issue 起票の要点

> 移設先ホーム（`docs/workflow.md` / `docs/change-classification.md`、いずれも Issue C で作成）が出来るまでは本節を運用の正本とする。作成後は詳細を各ホームへ移し、router には要点のみ残す。

- **タイプ**: A(軽微=単一ファイル / 既知仕様への復帰 / docs / CI) / B(標準=複数ファイル / UI 変更 / データ拡充 / 仕様変更を伴う)。大規模仕様変更の C は Track B から導入。
- **必須 5 項目**（1 つでも欠ければ `ready-for-cursor` を付与しない）: ①背景・目的 ②実装範囲（対象ファイル明示）③完了定義（観測可能な動作で記述）④テスト観点 ⑤非対象範囲。
- **Track A/B**: Track A の Issue は「ローンチブロッカーか否か」を明示。Track B 案件は `track-b` ラベルを付与。
- **改修分類ブロック必須**（本文冒頭）: Complexity Level(L1/L2/L3) × Change Pattern(C1–C7) + 判定根拠 1–2 行。境界が曖昧なら上位選択（L1↔L2 → L2、L2↔L3 → L3）。
- Issue 背景の 5 サブセクション構成・署名・分割 5 軸などの詳細 → `docs/workflow.md`。分類体系の定義 → `docs/change-classification.md`。

### ラベル

`feature`(新機能) / `bug` / `docs` / `chore`(整備・CI) / `ready-for-cursor`(5 項目 OK) / `needs-review`(PR 自動付与) / `launch-blocker` / `track-b` / 優先度 `critical`〜`low`。

---

## レビュー & merge（Complexity Level でスケーリング）

- **L1**（単一ファイル / docs のみ / ランタイム契約非該当）: CI 緑 + セルフチェックで auto-merge 可。
- **L2**: pr-reviewer PASS で auto-merge 可。
- **L3**（下記ランタイム契約 / wordlist / i18n / 大規模）: フル Claude Rv + md5 + **Naoya ack 必須**（auto-merge しない）。

エージェントは `.claude/agents/`（`issue-handler`=実装 / `pr-reviewer`=契約ゲート / `consistency-auditor`=整合監査）。いずれも Naoya の明示委譲時のみ起動。詳細フロー → `docs/workflow.md`。

---

## ランタイム契約ガードレール（触れたら検証必須・L3 扱い）

以下 8 パスに触れる変更は Issue でフラグを立て、対応する検証を完了定義に含める:
`wordlist_GA_a1a2_plus_phonics.json` / `data/connected_speech.json` / `data/weak_forms.json` / `data/guide.json` / `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` / `i18n/phonemes/{lang}.json` / `fonts/DoulosSIL-Regular.woff2` / `src/index.template.html` 内 `GAS_TTS_URL`。

- i18n を触ったら `python3 tools/validate_i18n.py`（現行 UI i18n leaf = 169）。
- wordlist / `rp_ipa` / `neighbors` / connected_speech / weak_forms を触ったら該当の再カウント・`scripts/gen_*.py` 再実行。
- 詳細スキーマ・フィールド辞書 → `docs/data-contract.md`（Issue D で作成）。

---

## 起動時動作

1. このファイル(`CLAUDE.md`)を読む。
2. タスク種別を判断し、上の対応表に従い必要な docs をオンデマンド取得する。
3. 取得した docs を整合させて現状把握。不明点は憶測せず参照 or Naoya に確認。
