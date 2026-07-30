# docs: Mobile governance 整合（C6検証列・workflow.md Mobile確認・doc-map 概念登録・impact-ledger scope）(#231) — 実装レポート

## 関連 Issue / PR

- Issue: #231
- PR: (このレポートを含む PR)
- Agent: claude-code (issue-handler)

## Issue 背景（Issue 本文から要約）

- **Complexity Level**: L2 / **Change Pattern**: C1（docs / behavior-invariant）
- consistency-auditor 監査（2026-07-30、EPIC #209 完了後）で検出された Mobile governance ギャップ 6 件を 1 Issue でバンドル修正。
- EPIC #209 で Mobile（React Native / Expo）を導入したが、governance docs の一部の検証列・確認手段・概念登録が Web のみの記載にとどまっていた。

## 実装内容

- `docs/change-classification.md` §5 C6 行の「検証追加」列に「Mobile 実装該当時: iOS/Android シミュレータ・実機確認」を追記
- `docs/change-classification.md` §5 C5 行の「その他追加」列: 「実装方式は EPIC-06/EPIC-07 で確定」という stale 表現を、実際に確定済みの方式（Web/Mobile とも `copy-core-assets.js` による build 時 copy。Mobile は `apps/mobile/assets/data/` へコピー後 `apps/mobile/src/loaders/bundleLoader.ts` が読む）に書き換え
- `docs/workflow.md` §4 の「UI 仕様の参照」箇条を、Web: Vercel branch preview URL / Mobile: 実機・シミュレータという確認手段を明記したうえで、詳細（正本パス・凍結フレームカタログの扱い等）は `docs/guardrails.md` §9 への参照に一本化（one-fact-one-home、CLAUDE.md §6 と整合）
- `docs/impact-ledger.md` §1 に「現在のスコープは Web（`apps/web/src/index.template.html`）のみ」「`apps/mobile/` のシンボルは対象外」を明記
- `docs/doc-map.md` §2 に Mobile 関連 4 概念のホーム登録: Mobile アプリ設計方針 → `docs/repo-map.md`、TTS バッチツーリング → `docs/tts-design.md`、monorepo 4 ゾーン定義 → `docs/repo-map.md`、Expo/EAS 設定 → `docs/repo-map.md`

## 変更ファイル

```
- docs/change-classification.md (M)
- docs/workflow.md (M)
- docs/impact-ledger.md (M)
- docs/doc-map.md (M)
- docs/agent-reports/issue-handler-issue-231-mobile-governance.md (A)
```

## デグレ防止検証

- 変更範囲: Issue 本文のファイルホワイトリスト 4 件のみ（`docs/change-classification.md` / `docs/workflow.md` / `docs/impact-ledger.md` / `docs/doc-map.md`）。CLAUDE.md / guardrails.md は非対象範囲どおり変更していない。
- 実装中の自己判断による追加変更: なし（`apps/mobile/scripts/copy-core-assets.js` の実コピー先パスは read-only で確認しただけで編集していない）
- 実装中に発覚した懸念: なし

## 動作確認

- change-classification.md C6「検証追加」列に Mobile シミュレータ・実機確認が記載されていることを目視確認
- workflow.md §4 の UI 正本参照が CLAUDE.md §6 / guardrails.md §9 と整合するポインタ記述になっていることを目視確認
- change-classification.md C5「その他追加」列から「EPIC-06/EPIC-07 で確定」の stale 表現が消え、`copy-core-assets.js` ベースの確定方式に書き換わっていることを目視確認
- impact-ledger.md に Web 限定スコープの明記があることを目視確認
- doc-map.md §2 に Mobile 関連 4 概念のホームが登録されていることを目視確認
- `python3 tools/validate/validate-markdown-refs.py --full-scan` → V1〜V8 全て PASS
- 既存機能への影響: なし（docs のみ、ランタイム挙動不変）
- データ整合性: 対象外

## 実装過程での気づき

- `apps/mobile/scripts/copy-core-assets.js` の実際のコピー先は `apps/mobile/assets/`（`apps/mobile/src/loaders/bundleLoader.ts` がそれを読む）であることをソースで確認したうえで change-classification.md C5 セルの記述を実態に合わせた。
- `docs/repo-map.md` 自体には現時点で `apps/mobile/` ディレクトリツリーや 4 ゾーン定義の本文がまだ記載されていない（stale）ことを確認したが、本 Issue のファイルホワイトリストに `docs/repo-map.md` は含まれないため、doc-map.md 側は「将来のホーム」としての登録のみ行い、repo-map.md 自体の編集は行っていない（別 Issue の対象）。

## 後続への影響

- `docs/repo-map.md` に実際の apps/mobile ディレクトリツリー・4 ゾーン定義・Expo/EAS 設定・TTS バッチツーリングの本文を追記する後続 Issue が必要（doc-map.md の登録が「ホームはここ」と宣言している一方、内容自体は未整備）。

## 残課題・申し送り

- なし（Issue #231 の完了定義・非対象範囲の範囲内で完結）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 4 ファイルの整合修正のみで、運用フロー再設計や構造変更を伴わない。単一関心とは言えない（複数ファイル）ため L1 ではなく L2 が妥当。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1（docs / behavior-invariant）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 7（Issue 本文の Phase 1–7）
- 実際の Phase 数: 7（Phase 1/3 は同一ファイル change-classification.md 内の別セルなので実質 1 コミット内でまとめて実施）
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
