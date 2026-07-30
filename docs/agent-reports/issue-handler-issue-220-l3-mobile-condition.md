# governance: L3 判定条件に「Mobile iOS/Android 両プラットフォーム影響 or packages/core 公開 API 変更」追加 (#220) — 実装レポート

## 関連 Issue / PR

- Issue: #220
- 親 EPIC: #209（フォローアップ）
- 先行 Issue: #215（PR #217 で「保留」として記録された項目のフォローアップ、2026-07-30 Naoya 壁打ちで確定）
- PR: （本 PR）
- Agent: claude-code（issue-handler、同一セッション ClaudeCode 相当、Naoya 明示委譲）

## Issue 背景（Issue 本文から要約）

PR #217（#215 実装）で issue-handler が「Mobile iOS/Android 両プラットフォーム影響 = L3」という新 L3 判定条件を、
L3 判定条件自体の追加変更にあたる意思決定として halt トリガー相当扱いし、`docs/change-classification.md` に
「Naoya 判断待ちの保留」注記のみ残して確定させなかった。2026-07-30 の Naoya 壁打ちでこの条件の追加が確定したため、
本 Issue で `docs/change-classification.md` §2 L3 判定条件表への追加 + `workflow.md` / `guardrails.md` への参照追記を行う。

- **改修分類**: L2 × C1（docs / behavior-invariant）。実行時挙動不変、複数 governance docs 間の整合が必要なため L2
- **Phase 構成**: Phase 1〜5 の 5 Phase（Issue 本文どおり）

## 実施内容サマリ

Phase 1〜5 をすべて実施。

### Phase 1: `docs/change-classification.md` §2 更新

- L3 判定条件表を「次の 4 条件」→「次の 5 条件」に拡張し、条件⑤「Mobile iOS/Android 両プラットフォームに影響する変更、
  または `packages/core` の公開 API 変更」を追加
- 代表例に「iOS/Android 両方の画面挙動を変える Mobile 改修、`packages/core` の関数シグネチャ変更」を追加
- 「未確定事項（Naoya 判断待ち、Issue #215 Phase 3 由来）」の保留注記ブロックを削除

### Phase 2: `docs/change-classification.md` §5 更新

- Pattern 別追加ルール表の C4（Stack / framework）行の「その他追加」列に「**Mobile 両プラットフォーム影響時は
  Level=L3 自動化**（§2 条件⑤）」を追記

### Phase 3: `docs/workflow.md` 参照追記

- §4 Issue 起票ルール: 「Mobile 両プラットフォーム影響 or `packages/core` 公開 API 変更は Level 自動 L3」の項目を追加し、
  `docs/change-classification.md` §2 条件⑤を根拠として明記（起票者の裁量で L2 に留めない旨を明示）
- §7 レビュー・auto-merge フロー: Level 段階化の説明文に、Mobile 両プラットフォーム影響 or `packages/core` 公開 API
  変更は§2 条件⑤により Level=L3 自動化のため auto-merge（L1/L2）対象にならない旨の注記を追加

### Phase 4: `docs/guardrails.md` 参照追記

- §3 レビュー段階化の L3 行に「**Mobile 両プラットフォーム影響 or `packages/core` 公開 API 変更は本カテゴリ**
  （`docs/change-classification.md` §2 条件⑤）」を追記

### Phase 5: 検証

#### ドライラン 1: 「apps/mobile/src/screens/DecodeScreen.tsx を修正して iOS/Android 両方の decode 判定表示を変更」

- 判定入力: 対象プラットフォームが iOS/Android 両方（Mobile 両プラットフォーム影響）
- 適用条件: `docs/change-classification.md` §2 L3 判定条件⑤「Mobile iOS/Android 両プラットフォームに影響する変更」に該当
- 判定結果: **L3**（フル Rv + md5 + Naoya ack 必須、auto-merge 不可）
- 確認: 更新後の §2 表・§5 C4 行・`workflow.md` §4・`guardrails.md` §3 のいずれからも同一の L3 判定に到達することを
  目視確認（相互参照に矛盾なし）

#### ドライラン 2: 「packages/core/src/scoring/decode.ts の関数シグネチャ変更」

- 判定入力: `packages/core` の公開 API（関数シグネチャ）変更
- 適用条件: `docs/change-classification.md` §2 L3 判定条件⑤「`packages/core` の公開 API 変更」に該当
- 判定結果: **L3**（フル Rv + md5 + Naoya ack 必須、auto-merge 不可）
- 補足: 本ケースは §2 条件④（複合システム変更）にも重複該当し得るが、条件⑤の明文化により判断が「複合システム変更に
  あたるかどうか」という質的判断に依存せず機械的に確定するようになった（Issue の目的である「3 軸で L3 判定が機械的に
  決まる」を達成）

#### `validate-markdown-refs.py --full-scan`

```
$ python3 tools/validate/validate-markdown-refs.py --full-scan
V1: PASS (total=0, failures=0)
V2: PASS (total=24, failures=0)
V3: PASS (total=24, failures=0)
V4: PASS (total=0, failures=0)
V5: PASS (total=0, failures=0)
V6: PASS (total=0, failures=0)
V7: PASS (total=0, failures=0)
V8: PASS (total=0, failures=0)
```

全 8 観点 PASS。

## 変更ファイル

```
- docs/change-classification.md (M)
- docs/workflow.md (M)
- docs/guardrails.md (M)
- docs/agent-reports/issue-handler-issue-220-l3-mobile-condition.md (A, 本レポート)
```

## デグレ防止検証

- 変更範囲: Issue #220 ホワイトリスト（`docs/change-classification.md` / `docs/workflow.md` / `docs/guardrails.md`）内のみ変更
- 非対象範囲（`CLAUDE.md` / `AGENTS.md` / `.claude/agents/*.md` / `.cursor/rules/*.mdc` / Change Pattern 新規追加 /
  既存 L1/L2 判定条件の変更 / 過去 Issue の再分類）には一切触れていない
- 実装中の自己判断による追加変更: なし。Issue Phase 1〜5 の指示どおりに機械的追記のみ実施
- 3 governance docs 間の意味論一貫性: §2 条件⑤（正本定義）→ §5 C4 行（Pattern 別追加ルールとしての参照）→
  `workflow.md` §4/§7（起票・レビューフローでの参照）→ `guardrails.md` §3（レビュー段階化での参照）の 4 箇所すべてで
  同一の判定基準・同一の参照パス（`docs/change-classification.md` §2 条件⑤）を用いており、矛盾なし

## 動作確認

- Phase 1〜5 の完了定義をすべて満たす
- 既存機能への影響: なし（本 Issue は L2 × C1 ドキュメントのみ変更、ランタイム挙動は不変）
- データ整合性: 対象外（ドキュメントのみ、ランタイム契約 8 パスの実体には触れていない）

## 実装過程での気づき

- Issue 起票時点（作業ブランチ base 選定時）で、本 worktree の既存 branch（`claude/mobile-app-architecture-83147e`）が
  `origin/develop` から 6 commit 遅れていた（monorepo 物理移設 #216 等が未反映）。develop-first 原則に従い、作業ブランチ
  `docs/l3-mobile-condition-220` は `origin/develop` から新規に checkout して作成した

## 後続への影響

- 以降、対象プラットフォームが iOS/Android 両方に及ぶ Mobile Issue、または `packages/core` の公開 API を変更する
  Issue は、起票時点で自動的に L3（フル Rv + md5 + Naoya ack 必須）に分類される
- Mobile 実装フェーズ（#EPIC-05〜08）以降の全 Issue で本条件が適用される

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 実行時挙動を変えず（C1）、3 つの governance docs 間の整合のみが必要な機械的追記であり、L1 の「単一関心」
  条件（複数ファイル整合が必要なため非該当）にも L3 の該当条件（AI 協業フローの「再設計」ではなく既存条件表への
  1 行追加のみ）にも当たらない。見積もりと実態が一致

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1（docs / behavior-invariant）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（`doc-map.md` は非対象範囲、変更していない）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 5（Phase 1〜5、Issue 本文どおり）
- 実際の Phase 数: 5（相互依存なく独立に完了）

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 昇格・追加提案がある場合の詳細

なし
