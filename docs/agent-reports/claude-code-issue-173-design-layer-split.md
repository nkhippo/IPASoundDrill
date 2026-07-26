# [Issue E] 設計層再構築: product.md + features/<id>.md（DESIGN+SPEC を ID 単位マージ、PURPOSE/DESIGN/SPEC 退役）(#173) — 実装レポート

## 関連 Issue / PR

- Issue: #173（親 EPIC: #169、依存: #170 (B), #171 (C), #172 (D)）
- PR: （本コミット直後に作成）
- Agent: claude-code（issue-handler）

## Issue 背景（Issue 本文から要約）

- **改修分類**: Complexity Level L3 / Change Pattern C7（ドキュメント再構築）。判定根拠: 目的〜画面〜挙動の正本を ID 起点に再編する判断を伴うマージのため。MECE 検証（全 § が新ホームに漏れなく移設）+ Naoya 目視必須。5 ファイル超は docs-infra 例外として atomic 実施。
- `docs/PURPOSE.md`（WHY）・`docs/DESIGN.md`（実装設計）・`docs/SPECIFICATION.md`（画面/データ）が縦割りで、1 機能を理解するのに 3 文書を横断する必要があった。
- `docs/product.md`（WHY）+ `docs/features/<id>.md`（12 ID・WHAT）+ `docs/features/_common.md`（ID 横断共通挙動）+ `docs/features/README.md`（索引）を新設し、PURPOSE/DESIGN/SPECIFICATION を退役（削除）。

## 実装内容

- `docs/product.md` を新設: 一行サマリ・タグライン・ポジショニング（3 要素）・対象ユーザーと解決したい課題・目的 4 カード構成（意図のみ）・横断ポリシー・依存と実装状況（evergreen のみ）・Personas & Learning Journey・本ステートメントが上書きするもの（PURPOSE §0/§1/§2.1–2.4/§3/§4/Personas/§5、SPEC §1、旧 CLAUDE.md ポジショニング節 由来）。
- `docs/features/_common.md` を新設: 用語、セッションフロー、先読み・終了、適応出題、出題フィルタ共通定数（TRAPSET 等）、全画面共通シェル（トップバー/Footer/Modals）、視覚言語トークン（pointer）、読むデータ/i18n の pointer（DESIGN §0・§1.0・§2.4・視覚言語トークン節、SPEC §2.2（Trap sounds）・§2.3b・§4.0–4.0.2 由来）。
- `docs/features/README.md` を新設: 12 ID インデックス + `_common.md` へのリンク + 衝突時優先順位。
- `docs/features/<id>.md` を 12 ファイル新設（`1a` / `2a` / `2b` / `2c` / `2d` / `3a` / `3b` / `3c` / `3d` / `3h` / `reveal` / `summary`）。各ファイルはテンプレート 6 節（観測可能挙動・画面構造・採点則+定数・読むデータ・i18n キー群・関連シンボル）を持ち、データスキーマは `docs/data-contract.md` へリンク（コピーゼロ）。「関連シンボル」節は Issue F プレースホルダ。
- `docs/history.md` を追記: DESIGN §0.1「Frame ID 再採番」（3e/3f/3g が凍結 12 ID に含まれない経緯）・§2c–2g（Narrow IPA/Respelling/Phase 2a/2b/2 完了/Phase R）・§3.5（多言語 UI Tier 表）・§5「実装状況」+ Phase 1-0-a 節、SPEC「変更履歴」表を §4–§5 として追記。冒頭「D で移した範囲」節の下に「E で移した範囲」節を追加（重複移設防止の申し送り）。
- `docs/PURPOSE.md` / `docs/DESIGN.md` / `docs/SPECIFICATION.md` を削除（`git rm`）。
- `docs/doc-map.md`: `product.md` / `features/<id>.md` / `features/README.md` の status を `planned(E)` → `exists` に更新、`features/_common.md` 行を新規追加。§1 冒頭に衝突時優先順位ルール（`product.md` → `features/<id>.md` → `data-contract.md`）を明記（旧 PURPOSE→DESIGN→SPEC→REPO を置換）。§3 retire リストに Issue E 完了記録を追加。
- `docs/_conventions.md`: feature ID レジストリ見出しの provenance 注記を「DESIGN §0.1 由来」→「旧 `docs/DESIGN.md` §0.1 由来」に更新（DESIGN.md 退役に伴う整合）。
- `CLAUDE.md`: 「プロダクト identity」節の `docs/product.md(Issue E で作成)` 注記を削除。
- `README.md`（root）/ `docs/README.md`: PURPOSE/DESIGN/SPECIFICATION への表参照・衝突時優先順位を `product.md` / `features/<id>.md` / `data-contract.md` に更新。
- `docs/repo-map.md`: Canonical specs 行・Directory tree（`docs/README.md` 直下ブロック）・Spec truth 行を新ホームに更新。末尾 provenance 注記に Issue E の変更を追記。
- `docs/cursor/README.md` / `docs/cursor/instructions/README.md` / `docs/reference/README.md`: PURPOSE/DESIGN/SPECIFICATION への表参照を `product.md` / `features/<id>.md`（索引: `features/README.md`）に更新。
- `.github/ISSUE_TEMPLATE/feature.md`: 「仕様書該当セクション」の例を `docs/SPECIFICATION.md §2-3` → `docs/features/2a.md` に更新。
- `.claude/agents/consistency-auditor.md`: 設計トレースチェーン・監査観点1の `DESIGN.md / SPECIFICATION.md` 参照を `data-contract.md` に更新。
- `.claude/agents/issue-handler.md`: `data-contract.md（または SPECIFICATION.md）` の SPECIFICATION.md 代替表記を削除（data-contract.md に一本化）。

## 変更ファイル

```
- docs/product.md (A)
- docs/features/_common.md (A)
- docs/features/README.md (A)
- docs/features/1a.md (A)
- docs/features/2a.md (A)
- docs/features/2b.md (A)
- docs/features/2c.md (A)
- docs/features/2d.md (A)
- docs/features/3a.md (A)
- docs/features/3b.md (A)
- docs/features/3c.md (A)
- docs/features/3d.md (A)
- docs/features/3h.md (A)
- docs/features/reveal.md (A)
- docs/features/summary.md (A)
- docs/PURPOSE.md (D)
- docs/DESIGN.md (D)
- docs/SPECIFICATION.md (D)
- docs/history.md (M)
- docs/doc-map.md (M)
- docs/_conventions.md (M)
- CLAUDE.md (M)
- README.md (M)
- docs/README.md (M)
- docs/repo-map.md (M)
- docs/cursor/README.md (M)
- docs/cursor/instructions/README.md (M)
- docs/reference/README.md (M)
- .github/ISSUE_TEMPLATE/feature.md (M)
- .claude/agents/consistency-auditor.md (M)
- .claude/agents/issue-handler.md (M)
- docs/agent-reports/claude-code-issue-173-design-layer-split.md (A, 本レポート)
```

## デグレ防止検証

- 変更範囲は運用ゾーン（`docs/**`, `CLAUDE.md`, `.claude/**`, `.github/**`, root `README.md`）のみ。開発ゾーン（`src/**` / `i18n/**` / `data/**` / `scripts/**` / `tools/**` / `gas/**`）は一切変更していない（`git status --short` で確認）。
- ランタイム契約 8 パスの実体ファイルは変更していない。ドキュメント上の記述移設のみ。
- 実装中の自己判断による追加変更: `docs/_conventions.md` の feature ID レジストリ見出しの provenance 注記更新（「DESIGN §0.1 由来」→「旧 `docs/DESIGN.md` §0.1 由来」）を実施。ID 自体・レジストリ内容は一切変更していない（表現の整合のみ）。ホワイトリスト上は `_conventions.md` を明示していなかったが、DESIGN.md 削除に伴う dangling 参照防止のための最小限の文言修正であり、Issue の完了定義「参照を新ホームへ付け替え」の趣旨に合致すると判断（自己判断の透明性としてここに記録）。
- 実装中に発覚した懸念: DESIGN §0.1 が「13 concept」（`3e`/`3f`/`3g` を含む）を挙げていたが、`docs/_conventions.md` の凍結 12 ID レジストリには `3e`/`3f`/`3g` が含まれていない。ID レジストリの増減権限は本 Issue にないため、3 ID を features 化せず、`docs/history.md` に「凍結 12 ID に含まれない経緯」として歴史的記録を追加するに留めた（詳細は「実装過程での気づき」参照）。

## 動作確認

- 完了定義「`product.md`・`features/_common.md`・`features/README.md`・12 個の `features/<id>.md` が存在」: 満たす（15 ファイル新規作成、`ls docs/features/` で確認）。
- 完了定義「各 features がテンプレート 6 節を持ち、データスキーマは data-contract へリンク（コピーゼロ）」: 満たす。12 ファイルすべてに「観測可能挙動 / 画面構造 / 採点則・定数 / 読むデータ / i18n キー群 / 関連シンボル」の 6 見出しを配置。JSON フィールド定義・localStorage キーの値・i18n leaf 数は本文に転記せず、`docs/data-contract.md` §2–5 への参照のみとした。
- 完了定義「PURPOSE/DESIGN/SPEC が削除され、参照が全て新ホームに（`grep` = 0、履歴記述除く）」: `docs/PURPOSE.md` / `docs/DESIGN.md` / `docs/SPECIFICATION.md` を削除。`grep -rln 'PURPOSE\|DESIGN\.md\|SPECIFICATION' --include='*.md' .` の残存箇所は (a) 新規ファイル自身の「旧 `docs/DESIGN.md` §0 を統合継承」等の provenance 注記（`product.md` / `features/_common.md` / `history.md` / `doc-map.md` / `_conventions.md`）、(b) `docs/data-contract.md` / `docs/tts-design.md` / `docs/pipeline.md` / `docs/repo-map.md`（D で確立済みの provenance 注記、Issue E では不変）、(c) `docs/LAUNCH-CHECKLIST.md`「1-0-a」行の dated Phase ログ、(d) `docs/agent-reports/` / `docs/cursor/{briefs,instructions,recon,reports}/` / `docs/handoff/` / `docs/logs/` / `docs/vault-history/` / `docs/design/` / `docs/reference/`（README.md 以外）/ `migration/` 配下の historical archive、のみ。ライブなナビゲーション参照としての PURPOSE/DESIGN/SPECIFICATION 依存は解消（root `README.md`・`docs/README.md`・`docs/repo-map.md`・`docs/cursor/README.md`・`docs/cursor/instructions/README.md`・`docs/reference/README.md`・`.github/ISSUE_TEMPLATE/feature.md`・`.claude/agents/consistency-auditor.md`・`.claude/agents/issue-handler.md`・`CLAUDE.md`・`docs/doc-map.md` を新ホームへ付け替え済み）。
- 完了定義「衝突時優先順位ルールが新ホーム名に更新」: `docs/doc-map.md` 冒頭に `product.md → features/<id>.md → data-contract.md` を明記し、旧「PURPOSE→DESIGN→SPEC→REPO」の置換である旨を注記。`docs/README.md` / `docs/repo-map.md`（Spec truth 行）も同様に更新。
- 完了定義「MECE 検証: 全 § が product / features / data-contract / tts-design / pipeline / history のいずれかに移設され、漏れ・重複なし」: 下記「MECE 検証マトリクス」参照。全 § を突合し、対応先を明記。
- 完了定義「`doc-map.md` 更新済み」: §1・§2 の該当行を `exists` に更新、§2 に `features/_common.md` 行を追加、§3 retire リストに Issue E 完了記録を追加。
- テスト観点「`2a` のバグ改修で `features/2a.md` + `data-contract.md`（+ F 後は ledger）のみで挙動・画面・採点・データが把握できるか」: `docs/features/2a.md` に観測可能挙動・画面構造（DOM）・採点則（ok/bad テーブル）・読むデータ（data-contract.md §2 へのリンク）・i18n キー群を集約済み。共有ロジック（フィルタ定数・適応出題）は `docs/features/_common.md` へのリンクで補完される設計。
- テスト観点「採点定数が features にのみ存在し product/旧 SPEC に重複しないか」: `product.md` には採点方針（完全一致のみ・near 廃止）を横断ポリシーとして 1 行のみ記載し、具体的な ok/bad テーブルや TRAPSET 等の定数は features/`_common.md` にのみ配置（重複ゼロ）。
- 既存機能への影響: なし（ドキュメントのみの変更、ランタイムコード・データファイル不変）。
- データ整合性: 対象外（ドキュメント移設のみ。実データファイルは未変更。i18n/wordlist/rp_ipa/neighbors のいずれにも触れていないため `validate_i18n.py` 等の実行は不要と判断）。

## MECE 検証マトリクス

PURPOSE.md / DESIGN.md / SPECIFICATION.md の全 § を移設先ごとに整理。「済」= D で既存移設済み・本 Issue では不変。

### PURPOSE.md

| § | 内容 | 移設先 |
|---|---|---|
| §0 一行サマリ | タグライン・概要 | `product.md` §0 |
| §1 目的4カード構成 | 4目的テーブル・セッション導線・支援画面 | `product.md` §1、`features/README.md` |
| §2.1–2.4 目的ごとの方針 | 各目的の意図 | `product.md` §1（意図）+ `features/2a–2d.md`（詳細） |
| §3 横断ポリシー | プロフィール・採点・マーキング・オンボーディング | `product.md` §2 |
| §4 依存と実装状況 | evergreen 依存 + dated 状態 | `product.md` §3（evergreen）+ `history.md`（済、D で移設） |
| Phase 1/2/R 完了ログ | dated | `history.md` §1（済、D で移設。ポインタのみ） |
| §5 本ステートメントが上書きするもの | 廃止事項 | `product.md` §5 |
| Personas & Learning Journey | ペルソナ | `product.md` |
| 変更履歴 | dated | `history.md` §3（済、D で移設。ポインタのみ） |

### DESIGN.md

| § | 内容 | 移設先 |
|---|---|---|
| §0 用語 | Decode/Encode/Study/Leitner/音素近傍/Frame ID | `features/_common.md` 用語 |
| §0.1 Frame ID 再採番 | 13 concept 案・variant suffix | `history.md` §4（歴史的記録。凍結 12 ID との差分を明記） |
| §1.0 セッションフロー | Q-20-δ | `features/_common.md` |
| `1a` トップページ | 情報階層 | `features/1a.md` |
| `3a` 学習プロフィール | Setup 11項目 | `features/3a.md` |
| `2a`–`2d` ドリル情報階層 | Progress meter/CEFR等 | `features/2a–2d.md` |
| Progress meter | 定数・DOM | `features/2a.md`/`2b.md`/`2c.md` |
| 音象徴視覚化 | `.seg.mark`/`.seg.nucleus` | `features/2a.md` + `_common.md`（視覚言語トークン pointer） |
| マーキング UI | `#revealChecks`/`#mbSChecks` | `features/reveal.md`/`2c.md` |
| Reveal 共通要素 | alt-accent/gloss/TTS | `features/reveal.md` |
| Band 廃止 | `MODEB_BANDS` 等 | `features/2c.md` |
| 支援画面テーブル | 3b–3h の役割 | `features/README.md`、`features/3b–3d.md`/`3h.md`、3e/3f/3g は `history.md` §4（凍結12IDに不在） |
| `3b`/`3c` Mood B UX | 画面構造 | `features/3b.md`/`3c.md` |
| `3d` Learning status UX | 画面構造 | `features/3d.md` |
| `3h` About UX | 画面構造 | `features/3h.md` |
| 視覚言語（原則のみ） | pointer | `features/_common.md`（→ visual-tokens.md/CSS-CONVENTIONS.md、内容は不変） |
| 視覚言語トークン（概要と正本） | pointer | `features/_common.md`（同上） |
| §2.1 出題軸(2a/2b) | フィルタ | `features/_common.md` 出題フィルタ共通定数 + `2a.md`/`2b.md` |
| §2.2 採点 | ok/bad | `features/2a.md`/`2b.md`/`2d.md` |
| §2.3 localStorage | LS スキーマ | 済（data-contract.md §4 に既存・D 以前から重複なく統合済み。再移設不要と確認） |
| §2.4 適応出題 | 重み付け | `features/_common.md` |
| §2.5 Reveal | 表示項目 | `features/reveal.md` |
| §2.6 GA/RP | セッション固定 | `product.md` §2 + `features/2a.md`/`2d.md` |
| §2.7 Connected Speech | 2d 仕様 | `features/2d.md` |
| §2.8 音から単語を覚える | 2c 仕様 | `features/2c.md` |
| §2b 語彙ブラウザ+IPAピッカー | 3b/3c | `features/3b.md`/`3c.md` |
| §2c Narrow IPA + Respelling | dated | `history.md` §4 |
| §2d Phase 2a Flap Merge | dated | `history.md` §4 |
| §2e Phase 2b Respelling Merge | dated | `history.md` §4 |
| §2f Phase 2 完了 | dated | `history.md` §4 |
| §2g Phase R | dated | `history.md` §4 |
| §3 TTS（§3.1–3.4c） | TTS 設計 | 済（`tts-design.md`、D で移設済み・不変） |
| §3.5 多言語UI Tier表 | dated 実装状況 | `history.md` §4（新規） |
| §4 データ整備タスク | pointer | 済（`pipeline.md`、D で移設済み・不変） |
| §5 実装状況（2026-07-18） | dated | `history.md` §4（新規） |
| Phase 1-0-a | dated | `history.md` §4（既存、D で先行追加済みの節を継続利用） |

### SPECIFICATION.md

| § | 内容 | 移設先 |
|---|---|---|
| 目次 | 構造のみ | 対象外（内容なし） |
| §1.1–1.3 解決する課題 | 対象ユーザー・課題テーブル | `product.md`「対象ユーザーと解決したい課題」（新規） |
| §2.1 目的4カード(平坦) | PURPOSE §1 と同内容 | `product.md` §1（重複排除のうえ統合） |
| §2.2 出題設計(2a/2b) | TRAPSET等 | `features/_common.md` 出題フィルタ共通定数 + `2a.md`/`2b.md` |
| §2.3 連結・弱形(2d) | Type/Level | `features/2d.md` |
| §2.3b セッション共通-先読み終了 | 定数 | `features/_common.md` |
| §2.4 学習方向(2a/2b) | Decode/Encode定義 | `features/_common.md` 用語 + `2a.md`/`2b.md` |
| §2.5 音から単語を覚える(2c) | Study/Quiz | `features/2c.md` |
| §2.6 採点ロジック | ok/bad | `features/2a.md`/`2b.md`/`2d.md` |
| §2.7 フィードバック設計 | TTS/Reveal/Summary | `features/reveal.md`/`summary.md` |
| §2.8 多言語UI | 済 | 済（`data-contract.md` §5、D 以前から存在） |
| §2.9 アクセント設定 | GA/RP キー | `product.md` §2 + `data-contract.md` §4（済）+ `2a.md`/`2d.md` |
| §3 インフラ構成(3.1–3.3) | 構成図・コンポーネント表 | 済（`repo-map.md` の技術スタック/Runtime infrastructure と実質重複。再移設不要と判断） |
| §4.0 全画面共通シェル | トップバー | `features/_common.md` |
| §4.0.1 Footer | pointer | `features/_common.md` |
| §4.0.2 Modals | テーブル | `features/_common.md` |
| §4.1 学習プロフィール(3a) | 画面 | `features/3a.md` |
| §4.2 Decode(2a/2d) | 画面 | `features/2a.md`/`2d.md` |
| §4.3 Encode(2b) | 画面 | `features/2b.md` |
| §4.4 Study(2c) | 画面 | `features/2c.md` |
| §4.5 Quiz(凍結) | 画面 | `features/2c.md`（凍結の記述として） |
| §4.6 解答(reveal) | 画面 | `features/reveal.md` |
| §4.7 サマリー | 画面 | `features/summary.md` |
| §4.8 言語設定(3f)廃止・学習ガイド | 廃止記録 | `features/_common.md`（ヘッダー集約の事実）+ `history.md` §4（3f 廃止の経緯） |
| §4.8b 語彙リスト(3b) | 画面 | `features/3b.md` |
| §4.8c IPA記号ピッカー(3c) | 画面 | `features/3c.md` |
| §4.8d 学習状況(3d) | 画面 | `features/3d.md` |
| §4.8h このアプリについて(3h) | 画面 | `features/3h.md` |
| §5 動的情報の管理 | pointer | 済（`data-contract.md`、D で移設済み・不変） |
| §6 補足・制約 | テーブル | 大半が既存ホームと重複（`repo-map.md`/`data-contract.md`/`product.md`/`tts-design.md`/`history.md`）。`要注意音素`行の `phonemes/*.json の t:1` フラグ記述のみ未移設（軽微・下記「残課題」参照） |
| 変更履歴 | dated | `history.md` §5（新規） |

**判定**: 上記マトリクスにより PURPOSE/DESIGN/SPECIFICATION の全 § が移設先を持つ。重複は「済」マークの箇所（D 完了時点で既に一本化済みのため再移設不要）を除きゼロ。

## 実装過程での気づき

- DESIGN §0.1「Frame ID 再採番」は 13 concept（`1a`/`2a`–`2d`/`3a`–`3h`）を暫定登録していたが、`docs/_conventions.md`（Issue B で凍結）の feature ID レジストリは 12 ID のみで `3e`（IPA って何？）・`3f`（言語設定・廃止済み）・`3g`（オンボーディング）を含まない。本 Issue には ID の増減権限がない（Issue 本文「勝手に増減・改称しない」）ため、この 3 概念を features 化せず、`docs/history.md` に経緯を記録するに留めた。`3f` は実装上ヘッダー言語スイッチャーへ統合済み（`features/_common.md` に事実として記載）、`3g` オンボーディングの挙動は横断ポリシーとして `product.md` §2 に記載、`3e` は独立実装されず guide モーダルに相当（`features/_common.md` Modals に `#guideModal` として存在）と判断し、機能面での欠落はないことを確認した。
- SPEC §3（インフラ構成の ASCII 図・コンポーネント表）は、D で作成済みの `docs/repo-map.md`「技術スタック」「Runtime infrastructure」節と実質的に同じ事実（Vercel/GAS/DNS/TTS プロキシ構成）を扱っており、既に one-home 化されていた。新規転記は重複を生むため行わず、本 Issue では再移設不要と判断した。
- DESIGN §2.3（localStorage スキーマの JSON スニペット）も同様に、`docs/data-contract.md` §4 が既に同じキー一覧（`ept_hist_v1` 等）を保持しており、D 以前の時点で実質統合済みだったため再移設は不要と判断した。
- SPEC §6「補足・制約」の「要注意音素 | `phonemes/*.json` の `t:1` + コード内 TRAPSET」のうち、TRAPSET は `features/_common.md` に移設したが、`phonemes/*.json` の `t:1` フラグに関する記述は他の § と紐付きが弱く、明確な features ID にも data-contract.md の既存節にも一対一で対応しないため未移設（軽微。下記「残課題」参照）。

## 後続への影響

- Issue F（impact-ledger）は、各 `features/<id>.md` の「関連シンボル」節（現在は「Issue F の impact-ledger 生成後にリンク」のプレースホルダ）を `docs/impact-ledger.json` への具体的なリンクに置き換える。
- `docs/history.md` は Issue E で 291 行に達し、`docs/_conventions.md` の「仕様系 ~250L」目安を超過している。ただし history.md は本質的に増加し続ける日付ログ集約ホームであり、C7 分割トリガーの対象は evergreen 仕様文書を想定していると判断し、本 Issue では分割を見送った。将来的に肥大化が問題になった場合は年次アーカイブ分割（例: `history-2026.md`）を検討する余地がある。

## 残課題・申し送り

- SPEC §6 の「`phonemes/*.json` の `t:1` フラグ」記述（軽微な技術的事実）が新ドキュメント体系のどこにも明記されていない。次に `i18n/phonemes/*.json` を触る Issue で `docs/data-contract.md` §5 への追記を推奨する。
- `docs/history.md` の行数超過（291L、目安 250L 超）を認識した上で、成長し続ける日付ログの性質上、本 Issue では分割せず据え置いた。月次レビューで肥大化が問題化した場合、年次アーカイブ分割を検討。

## pr-reviewer レビュー対応（追記・PR #181）

pr-reviewer の契約検証（総合判定 PASS）で「要修正推奨」として指摘された CI `validate-markdown-refs` の V7 チェック新規 FAIL 13 件（`docs/features/README.md:12–25`）に対応した。

- **原因**: `docs/features/README.md` の ID 索引テーブルと `_common.md` への導線で、角括弧テキスト直後に丸括弧で同名の `.md` パスを続ける Markdown ハイパーリンク構文を使用していた。`scripts/lib/verify_core.py` の V7 チェック（`check_v7`）は、この構文のリンクをパスの正しさに関わらず「unrewritten path ref」として一律 FAIL 扱いする（旧 Vault-Framework の wikilink 移行チェックの名残。単一バッククォートのインラインコードは除外対象外で、フェンス付きコードブロックのみが除外される）。`docs/_conventions.md` 規約1 は元々 wikilink を禁止し「リンクはプレーンな相対パス（`docs/features/2a.md` にセクション名を付与する形式）のみ」を求めており、本 Issue の他の新規ファイル（`product.md`・`_common.md`・各 `features/<id>.md` 本文）はすべてこの規約どおりバッククォート付きプレーンパス表記（例: `` `docs/data-contract.md` §2 ``）を使っていたが、`features/README.md` の索引テーブルのみ誤って角括弧+丸括弧のハイパーリンク構文を使っていた。
- **修正**: `docs/features/README.md` の ID 索引テーブル 12 行 + `_common.md` への導線 1 箇所、計 13 箇所を、角括弧+丸括弧のハイパーリンク構文からバッククォート付きリポジトリルート相対パス表記（例: `` `docs/features/1a.md` ``、ハイパーリンク構文なし）に書き換えた。アンカーは、各行が指す対象が「ファイル全体」であり特定見出しへの参照ではないため付与していない（他の新規ファイルでの参照スタイルと統一）。
- **検証**: `python3 scripts/validate/validate-markdown-refs.py --full-scan --broken-refs migration/broken-refs.csv` を実行し、V7 の FAIL が 15 件 → 2 件（`docs/claude-design/README.md:26–27`、本 PR で一切変更していない既存ファイル。`git log -1 -- docs/claude-design/README.md` で本 PR 由来でないことを確認済み）に減少したことを確認。さらに実際の CI と同条件の PR モード（`--changed-files <このブランチの変更 .md 一覧> --broken-refs migration/broken-refs.csv`）でも `V7: PASS (total=0, failures=0)` を確認した。V1（frontmatter id 欠落、Issue A のフロントマター全廃止に起因する repo 全体の pre-existing FAIL）・V5（`docs/handoff/` 配下、本 PR の変更ファイルに含まれない full-repo チェック）は変更前と変わらず残存するが、いずれも本 PR 由来ではなく、pr-reviewer の指摘どおり別件として対応不要と判断した。
- **スコープ**: `docs/features/README.md` のみ変更。他の features 本体・開発ゾーンには触れていない。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: 3 文書の evergreen 内容を 12 ID + product + _common の 15 ファイルへ判断を伴って再構成し、MECE 検証・全リポ参照更新を伴う規模・影響範囲は L3 相当。実装中に Level を跨ぐような追加スコープの発生はなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C7（ドキュメント再構築）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（実体ファイル不変、ドキュメント記述の移設のみ）
- [x] i18n schema への影響なし（実体ファイル不変）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（`doc-map.md` で新ホームを索引化済み）
- [x] 既存ファイルパスへの依存関係が壊れていない（PURPOSE/DESIGN/SPECIFICATION へのライブ参照は全て新ホームへ付け替え済み）

### Phase 分割の妥当性

- 想定 Phase 数: 1（docs-infra 例外により atomic 実施、Issue 本文で事前承認済み）
- 実際の Phase 数: 1（コミットは内容単位で分離）
- 相互依存の発生有無: なし（15 新規ファイルは相互リンクするが、単一コミット群で一貫性を保って作成）

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
