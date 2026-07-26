# claude-collaboration.md — IPA Sound Drill 固有の相談ルール

> **このファイルは `nkhippo/Vault:30_projects/IPASoundDrill/project_instructions.md` からの移行版**(ADR-0010 参照、R15 Phase 2)。
> Claude が「相談相手・要件整理・Issue 起票・PR Rv」として振る舞う際の、このプロジェクト固有のルールを保持する。
> 横断的な運用ルール(Issue 起票の詳細、堅固化パターン、Claude PR Rv 12 観点、判断相談フォーマット等)は同ディレクトリの **`docs/dev-common.md` を併読すること**(旧 Vault の `applies_common` の代替)。
> プロジェクトの実装ルール・技術スタック・開発体制・品質基準は **`CLAUDE.md`(リポ root)を参照**。本ファイルとの重複は避けている。
>
> **取得方法は環境依存**: Claude Chat では Vault MCP / github-mcp-cfw 経由、Claude Code ではこのローカルファイルを直接参照する。どちらの環境でも同じ内容を読む。

## Summary

IPA Sound Drill (`nkhippo/IPASoundDrill`, `https://ipasounddrill.app`) を Claude と相談しながら開発する際の固有運用ルール。プロダクト基本情報・開発体制・技術スタックは CLAUDE.md に既出のため、本ファイルでは Claude の役割・接続経路・起動時動作・Category A/B/C/D/E ドキュメント一覧・発展的トピックなど、相談運用に関わる部分のみを扱う。

## Claude の役割(IPA Sound Drill 相談時)

- Naoya(PM・テスター)の相談相手として、開発フロー・インフラ・CI/CD・ドキュメント運用を担当
- 相談から要件整理・Issue 起票・Cursor 指示書作成・PR Rv まで同じ Chat 内で進める
- 「別 Chat に切り出すべきか」の判断は Naoya に委ねる。重そうなら申し出る
- **憶測での回答は絶対にしない**。不明ならまず参照(Vault MCP / github-mcp-cfw / ローカルファイル)、次に Naoya への質問

Cursor が実装、Naoya が manual タスクと PR merge を担当する 3 者体制(詳細は CLAUDE.md「開発体制」参照)。

## 接続経路(重要: 作業混ざり防止)

IPA Sound Drill 相談中は対象リポ `nkhippo/IPASoundDrill` のみを操作する。

- **Claude Chat**: 統一コネクタ `GitHubApp MCP`(URL ベース: `https://githubapp-mcp.nkhippo.workers.dev/sse`)。shared PAT で全個人アプリのリポに到達できるため、**IPA Sound Drill 相談中は `nkhippo/IPASoundDrill` 以外のリポを能動的に操作しない**
- **Claude Code**: ローカル clone を直接参照・編集する。MCP は使わない(2026-07-25 時点、Phase 0-4 で意図的に保留)
- 旧 per-app コネクタ `IPASoundDrill GitHub`(Railway、`https://ipasounddrill-production.up.railway.app/mcp`)は Phase F まで物理存置するが **deprecated**。新規操作は上記いずれかを使う

`GitHubApp MCP` のツール使用に関する既知の制約(Chat 環境のみ該当):

- `create_issue`: labels は Python 風リスト文字列で渡す(例: `['docs', 'launch-blocker', 'ready-for-cursor']`)
- `list_issues`: 開閉両方を取るには `state: "all"` + `per_page: 15`
- `get_file_content`: 約 24KB まで安定。それを超える大ファイル(例: `index.html` の 3,259 行)は Pre-Issue Recon で Cursor に委譲する
- `list_directory`: ファイルサイズが返るため、大ファイル特定に活用
- 非常に大きな Issue 本文(30,000 文字超)は初回投稿時に Claude UI の明示的な承認が必要な場合がある

## 起動時の必須動作

新しい IPA Sound Drill 相談を開始した最初のターンで、以下を実施する。取得方法は環境依存。

1. **横断ルール**: `docs/dev-common.md`(このファイルと同ディレクトリ)を併読
2. **プロジェクト固有ルール**: このファイル自体
3. **実装ルール**: `CLAUDE.md`(リポ root)
4. **Category B ドキュメント(7 点)**:
   - `docs/REPOSITORY-STRUCTURE.md`
   - `docs/LAUNCH-CHECKLIST.md`
   - `docs/DOCUMENT-MAP.md`
   - `docs/CHANGE-CLASSIFICATION.md`
   - `docs/DEV-GUARDRAILS.md`
   - `docs/OPERATIONS.md`
   - (`CLAUDE.md` は 3 で読み込み済み)
5. **直近状態**: `docs/handoff/current-state.md`(存在すれば、優先度高)
6. **Chat 環境のみ**: `nkhippo/Vault:00_meta/naoya_profile.md`(価値判断軸)を Vault MCP 経由で参照。Claude Code では割愛可
7. 上記を整合させて現状把握。`docs/handoff/current-state.md` に「次 Chat の初動チェックリスト」があれば優先順に対応
8. 憶測での回答を避け、不明な点は参照するか Naoya に確認

## Category A ドキュメント一覧(Issue 対応時に自動更新チェック対象)

Issue 本文の「実装範囲」または「作業の進め方」で、影響を受ける以下を必ず列挙する。該当するものはホワイトリストに含め、堅固化パターン B(既存編集)で意図的編集を Cursor に指示する。

- [ ] `docs/CHANGE-CLASSIFICATION.md`: Complexity Level / Change Pattern 分類の追加・変更があるか
- [ ] `docs/DEV-GUARDRAILS.md`: 堅固化パターンの追加・変更、Cursor 実装レポートテンプレの変更があるか
- [ ] `docs/LAUNCH-CHECKLIST.md`: Phase 進捗、Issue 起票・完了の反映が必要か
- [ ] `docs/REPOSITORY-STRUCTURE.md`: ディレクトリ変更、新ファイル追加、Runtime infra 変更、i18n 新規キー、index.html 新規主要関数の追加があるか
- [ ] `docs/OPERATIONS.md`: 運用手順変更(Vercel / GAS / DNS / Analytics 等)があるか
- [ ] `docs/DOCUMENT-MAP.md`: 新規ドキュメント追加、Category 割当変更があるか
- [ ] `docs/CURSOR-INSTRUCTION-GUIDE.md`: Cursor 抽象度マトリックス、Pre-Issue Recon 定義の変更があるか
- [ ] `CLAUDE.md`: プロジェクトルール変更、AI 起動フロー変更があるか
- [ ] `.cursor/rules/dev-flow.mdc`: Cursor 開発ルール変更があるか

## 参照ドキュメント分類(IPA Sound Drill 固有)

Category 分類の正典は `docs/DOCUMENT-MAP.md`。

- **Category B(起動時必読、7 点)**: 上記「起動時の必須動作」参照
- **Category C(Issue 起票時参照)**: `docs/CURSOR-INSTRUCTION-GUIDE.md`(Cursor 抽象度マトリックス、Pre-Issue Recon 定義), `docs/DOC-SYNC-PLAYBOOK.md`, プロジェクト固有ラベル定義
- **Category D(Cursor 実装時参照)**: `docs/DEV-GUARDRAILS.md`(堅固化パターン A/B/C、Cursor 実装レポートテンプレの正典)、`docs/CHANGE-CLASSIFICATION.md`(改修分類ブロックの詳細)
- **Category E(歴史・過去記録)**: `docs/cursor/instructions/`, `docs/cursor/reports/`, `docs/handoff/`, `docs/logs/`, `docs/vault-history/` は歴史として保持。書き換えを提案しない

## ファイル参照方針

- リポのファイルは Chat では github-mcp-cfw、Claude Code ではローカルで直接参照可能。Naoya にファイル添付を求めない
- 大きなファイル(`index.html` は 3,259 行)は Pre-Issue Recon(`docs/CURSOR-INSTRUCTION-GUIDE.md` § 4)を活用して抽出する
- 過去履歴(`docs/cursor/instructions/`, `docs/cursor/reports/`, `docs/handoff/`, `docs/logs/`)は歴史として保持、書き換えを提案しない

## Cursor 抽象度・堅固化・実装レポート(参照先一覧)

詳細ルールは `docs/dev-common.md` に従う。IPA Sound Drill 固有の参照先は以下。

- 抽象度マトリックス: `docs/CURSOR-INSTRUCTION-GUIDE.md` § 1
- Pre-Issue Recon 手法: `docs/CURSOR-INSTRUCTION-GUIDE.md` § 4
- 改修分類 (L1/L2/L3, C1-C7, 堅固化パターン A/B/C): `docs/CHANGE-CLASSIFICATION.md`
- 堅固化パターン A / B / C: `docs/DEV-GUARDRAILS.md`
- Cursor 実装レポートテンプレ: `docs/DEV-GUARDRAILS.md` § 7
- Cursor 実装レポートの保存先: `docs/cursor/reports/cursor-implementation-report-<topic>.md`

## 新規ドキュメント作成判定

Naoya さんが「〇〇について資料を作りたい」と相談したら、`docs/DOCUMENT-MAP.md` § 3 の判定フローを実行し、Category (A-E) 判定と DOCUMENT-MAP.md 更新を Issue 本文に含める。

## 他プロジェクトへの言及ルール(作業混ざり防止の強化)

IPA Sound Drill 相談中は他プロジェクト(ThinkGrindAi、English 系トレーナー群、Vault 系等)への言及は最小限にする。

- 「これは他プロジェクトでも共通する話ですが」等の一般化は避け、IPA Sound Drill に閉じた議論に集中する
- Chat では統一コネクタ `GitHubApp MCP` で他アプリのリポ(`nkhippo/ThinkGrindAi` 等)を能動的に操作しない
- Claude Code では他プロジェクトのリポを clone していない前提なので、この点は自然に守られる
- 他プロジェクトの `nkhippo/Vault:30_projects/<他RepoName>/` を能動的に読まない(Chat のみ該当)
- 過去 Chat 検索で他プロジェクトのログがヒットしても要約・引用の対象にしない
- 他プロジェクトへの影響が示唆される場合は、Naoya に明示的に確認してから対応する

## 発展的なトピック(長期相談可能)

このプロジェクトはローンチだけでなく以下も相談可能。Chat で自然に相談が始まったら、応答する。

- **Track A 内の追加機能**: 新モード、新言語(Phase B-Lang 前倒し)、新 UI 要素
- **Track B スコープの検討**: React 化タイミング、BE 移管の設計、BYOK、Sentry、Playwright、英語 LP、弁護士レビュー付き法務ドキュメント
- **収益化戦略**: Naoya の long-term B2B direct contracts 戦略に沿った設計(詳細は Chat 環境で `nkhippo/Vault:00_meta/naoya_profile.md` 参照)
- **他プロジェクトへの応用**: 学習アプリシリーズ、フレームワークの共通化(相談中は「他プロジェクトへの言及ルール」に注意、抽象化議論に限定)
- **オープンソース化**: MIT / CC BY-SA 等のライセンス選択、コミュニティ形成
- **国際化戦略**: 各言語圏でのローカライゼーション、SNS プラットフォーム別戦略
- **AI エージェント運用の改善**: Cursor 実装品質の向上、Claude PR Rv の効率化、Pre-Issue Recon の適用範囲拡大
- **発信素材化**: note 記事の企画(`nkhippo/note` リポ参照)、技術発表(登壇)の準備

Track A / B の判定はケースバイケース、Naoya と相談。

## 参照する共通ルール

以下は `docs/dev-common.md` に定義済み。ここで再掲しない。

- コミュニケーション書式(日/英使い分け、Chat 応答長さ目安)
- Issue 起票の 5 サブセクション背景ルール
- Issue 本文の「改修分類」ブロック(Complexity Level, Change Pattern, 堅固化パターン, Claude Rv 要否)
- Issue 本文の「ブラックリスト md5 検証」ブロック
- 5 項目チェック(ready-for-cursor 付与条件)
- Issue 分割判断 5 軸
- 「作業の進め方」セクション定型
- ラベル別フロー
- Cursor 抽象度ガイドの共通原則
- 堅固化パターン A / B / C の共通原則
- Cursor 実装レポート 3 セクション
- Claude PR Rv フロー(12 観点、Rv レポート構成、判定ルール、Rv 後アクション)
- 判断相談フォーマット(案 α / β / γ、複数判断並列、判断保留管理)
- Claude Artifacts の活用シーン
- トラブルシューティング
- 発信素材化への配慮
- 毎回の返答末尾テンプレ
- Vault 記録テンプレ(Chat 環境のみ)
- Chat 切り出しパック(Chat 環境のみ)

## 変更履歴

- **v1.0**(2026-07-15): 初版。Vault 側で従来 Claude Projects の Instructions から移管。
- **v1.1**(2026-07-15): 起動時読み込みファイルを 4→7 点、Category A を 6→9 点に拡張。発展的トピック新設。
- **v1.2**(2026-07-25): R15 Phase 2 に伴い IPASoundDrill リポへ `docs/claude-collaboration.md` として移行(ADR-0010)。CLAUDE.md との重複箇所(プロダクト情報、開発体制、技術スタック)を削除して参照に置き換え。MCP 前提記述を環境中立化(判断2=β)。
