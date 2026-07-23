---
id: pj-2026-07-23-3df3
aliases:
- pj-2026-07-23-3df3
title: 'Place Claude Design files in docs/claude-design/ (#126) — 実装レポート'
created: '2026-07-23'
---

# Place Claude Design files in docs/claude-design/ (#126) — 実装レポート

## 関連 Issue / PR

- Issue: #126
- PR: #127（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Phase 1-E 検収後の UI 点検で Claude Design (CD) と本番 UI の意匠乖離が発覚。CD が Repo 外にあると Cursor/Codex が参照できないことが構造的原因。本 Issue は `docs/claude-design/` に CD 成果物を配置し、CLAUDE.md / AGENTS.md に CD 参照義務を明文化する基盤整備。

- **Complexity Level**: L1
- **Change Pattern**: C1 (Docs)
- **適用堅固化パターン**: A（新規追加）＋ Category A ドキュメントへの明示的追記

## 実装内容

- `docs/claude-design/` を新規作成し、CD 成果物をリネーム配置
  - `design-system.dc.html` / `sp.dc.html` / `pc.dc.html` / `favicon.svg`
  - 閲覧用ランタイム `support.js`（3 HTML が `./support.js` を参照するため同梱）
  - `README.md` / `update-log.md` を Issue テンプレート準拠で作成
- `docs/REPOSITORY-STRUCTURE.md`: 索引表＋ディレクトリツリーに `docs/claude-design/` を追記
- `docs/DOCUMENT-MAP.md`: Category D 表と § 4 付録に CD 正典参照を追記
- `CLAUDE.md`: 「Claude Design（CD）参照運用ルール」3 点を追記
- `AGENTS.md`: Critical constraints / Before any implementation に同一 CD ルールを追記
- `AGENTS_CODEX.md`: リポに存在しないためスキップ（Issue 完了定義どおり）

## 変更ファイル

```
- docs/claude-design/README.md (A)
- docs/claude-design/update-log.md (A)
- docs/claude-design/design-system.dc.html (A)
- docs/claude-design/sp.dc.html (A)
- docs/claude-design/pc.dc.html (A)
- docs/claude-design/favicon.svg (A)
- docs/claude-design/support.js (A)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/DOCUMENT-MAP.md (M)
- CLAUDE.md (M)
- AGENTS.md (M)
- docs/agent-reports/cursor-issue-126-claude-design-docs.md (A)
```

## デグレ防止検証

- 変更範囲: 新規 `docs/claude-design/` ＋ Category A ドキュメントへの CD 参照追記のみ
- Runtime / ビルド / i18n / wordlist への変更なし
- 実装中の自己判断による追加変更: `support.js` を同梱（Issue 本文の 6 ファイルに無いが、Naoya 提供パスに含まれ、3 HTML が相対参照するため必須。README / update-log / DOCUMENT-MAP に明記）
- 実装中に発覚した懸念: なし（ブロッキングしていた CD 未提供は受領済みで解消）

## 動作確認

- [x] `docs/claude-design/` 配下に README / update-log / design-system / sp / pc / favicon / support.js が存在
- [x] ソース（`~/Downloads/Kickoff design prompt (2)/`）と md5 一致（4 CD ファイル + support.js）
- [x] `sp.dc.html` に `#1a-ja` / `#3a` 等のセクション ID を確認
- [x] `REPOSITORY-STRUCTURE.md` / `DOCUMENT-MAP.md` に `docs/claude-design/` 記載
- [x] `CLAUDE.md` / `AGENTS.md` に CD ルール 3 点記載
- [x] `AGENTS_CODEX.md` 不在を確認（スキップ）
- 既存機能への影響: なし（docs / governance のみ）
- データ整合性: 対象外

## 実装過程での気づき

- Issue 起票時点では CD zip が未添付だったため、一度 Issue Comment で中断 → Naoya からローカルパス受領後に再開
- `.dc.html` は Claude Design ランタイム `support.js` なしではブラウザ表示できない。配置セットに含めるのが実務上必須
- 堅固化パターン A 宣言だが、Issue 本文が Category A 既存ファイル編集を明示しているため、md5「既存ゼロ変更」は適用せず、明示ホワイトリスト編集として実施

## 後続への影響

- UI を CD と一致させる一括改修 Issue の前提条件が解消
- 以後の UI 改修 Issue は `docs/claude-design/` パス＋セクション ID を本文に明記する運用が標準化可能

## 残課題・申し送り

- `docs/README.md` のサブフォルダ表への追記は Issue 明示範囲外のため未実施（任意フォローアップ可）
- `uploads/`（CD セッション素材）は参照依存なしのため未配置

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 新規ディレクトリ配置＋ Category A への軽微追記のみ。Runtime / UI 実装なし

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1 (Docs)
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [ ] AI 参照ドキュメント Category A への影響なし → **影響あり（意図的）**: `REPOSITORY-STRUCTURE.md` / `DOCUMENT-MAP.md` / `CLAUDE.md` / `AGENTS.md` を Issue 明示どおり更新
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1（配置＋ドキュメント追記）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
