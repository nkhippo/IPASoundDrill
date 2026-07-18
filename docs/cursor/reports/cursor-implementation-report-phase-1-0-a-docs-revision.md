---
id: pj-2026-07-18-phase10a
aliases:
- cursor-implementation-report-phase-1-0-a-docs-revision
title: Phase 1-0-a PURPOSE/SPEC/DESIGN 先行改訂 — 実装レポート
created: '2026-07-18'
---

# Phase 1-0-a PURPOSE/SPEC/DESIGN 先行改訂 — 実装レポート

## 関連 Issue / PR

- Issue: #75
- PR: #77（open）

## Issue 背景（Issue 本文から要約）

Phase 1 UI/UX（目的 4 カード・プロフィール一元通過・CEFR 横断等）が Claude Design / Chat で確定したあと、実装 PR と同時に Category A を更新すると 14 frame 規模で仕様がブレるリスクが高い。そこで Phase 1-A より前に PURPOSE / SPEC / DESIGN を先行改訂する Phase 1-0-a を切り出した。Claude Rv で near 採点の実装削除も同 Issue に含め、frame ID を 13 concept + variant に再採番した。

## 実装内容

- `docs/PURPOSE.md` を v4.0 へ: 目的 4 カード、タグライン、GA/RP 固定、CEFR 横断、マーキング / プロフィール / オンボーディング。旧 Mode A/B は §5 履歴化
- `docs/SPECIFICATION.md`: 目的カード前提の §1–2・§4–5、Band 仕様削除（削除対象シンボル明示）、near 廃止、Connected CEFR はタグ表示のみ
- `docs/DESIGN.md`: 13 frame マッピング表、Q-20 フロー、採点 2 値、Band UI 削除。TTS/データ履歴セクションは維持しつつ用語を橋渡し
- `docs/LAUNCH-CHECKLIST.md`: 「UI/UX Phase 1（製品 UI 再設計・Track A 延長）」に 1-0-a〜1-H を追加
- `src/index.template.html`: Decode/Encode/Mode B Quiz の near、`lev`、`res-near` CSS を削除（ok/bad のみ）

## 変更ファイル

```
- docs/PURPOSE.md (M)
- docs/SPECIFICATION.md (M)
- docs/DESIGN.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- src/index.template.html (M)
- docs/cursor/reports/cursor-implementation-report-phase-1-0-a-docs-revision.md (A)
```

## デグレ防止検証

- Phase 0: `/tmp/issue-75/before-all.md5` スナップショット、Recon + Claude Rv 合格後に着手
- ブラックリスト: `data/**`、`docs/cursor/instructions/**`、`docs/reference/**`、`docs/design/**` は未編集。near 削除のため `src/index.template.html` のみコード触手（ルート `index.html` は手編集せず）
- 実装中の自己判断による追加変更: 0 件（スコープ拡大は Issue Comment で確定済み）
- 実装中に発覚した懸念: なし（Vault 未到達は frame 再採番表で解消）

## 動作確認

- ドキュメント: PURPOSE v4.0 変更履歴あり、旧 Mode A/B は §5 保持
- Band 能動記述: SPEC/DESIGN から進行ロジックを削除し「廃止・後続削除」のみ残置
- near grep（`src/index.template.html`）: `\bnear\b` / `levenshtein` / `function lev` / `res-near` / `"near"` → ヒット 0
- ブラウザ手動（Decode 1 文字違い → bad）: PR レビュー時に Naoya さんが確認（本環境ではローカルサーバ未起動）
- データ整合性: 対象外（wordlist / i18n 未変更）

## 実装過程での気づき

- Issue 起草時の「SPEC §2.4 = Band」は誤りで、実体は §2.5。Recon で訂正し Rv で採用
- `bandProgress` / `modeb.band.*` は Category A 本文に元々無く、削除対象の明示で十分
- near 削除は Claude Comment でスコープ拡大。正本は `src/index.template.html`
- Encode の LCS 色分けはフィードバックとして残置（判定は完全一致のみ）

## 後続への影響

- Phase 1-0-b: 12 パラメータ最終リスト、`mark:` / `prev_settings_v1`、LS マイグレーション、CEFR 全語カバレッジ
- Phase 1-A〜1-H: UI 実装、Band シンボル実装削除、`-pc` / 多言語 variant
- Category A が実装の先を行く運用モデルの実証

## 残課題・申し送り

- ブラウザでの 1 文字違い Decode/Encode の実機確認は PR テスト項目
- Band / `ept_vocab_band` のコード削除は後続 Issue
- `ept_checks_v1` → `mark:{drill_id}:{word_id}` の移行は 1-0-b / 1-C

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: Category A 3 ファイルの骨格改訂 + Rv による near 実装削除。単一関心を超えフロー再設計相当だが、ファイル数・契約破壊は L3 内に収まった

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1（Docs）、部分 C4（UI/UX 仕様）
- 実装中に追加が必要になった Pattern: C4 が実装層（採点）まで及ぶことは Claude Rv で事前承認済み。新規 Pattern 追加提案はなし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし（キー削除なし）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響あり（本 Issue の主目的）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 0–5（Recon + PURPOSE + SPEC + DESIGN + LAUNCH + PR）
- 実際の Phase 数: 同等（SPEC と near 実装を同一コミットにまとめた）
- 相互依存の発生有無: なし（docs 先行と採点削除は独立して検証可能）

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断
