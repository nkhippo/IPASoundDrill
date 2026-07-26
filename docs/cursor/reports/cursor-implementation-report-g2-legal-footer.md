# G2 legal footer links — 実装レポート

## 関連 Issue / PR

- Issue: #59
- PR: #60

## Issue 背景（Issue 本文から要約）

G1 で `terms.html` / `privacy.html` が公開済みのため、E2 footer（Feedback + X）に Terms / Privacy リンクを追加し Phase 6 を完了させる。

## 実装内容

- `src/index.template.html`: footer に Feedback → Terms → Privacy → X の順でリンク追加
- CSS: 既存 `.feedback-btn` / `.x-link` セレクタに `.legal-link` を統合（デスクトップ + 768px モバイル）
- `docs/LAUNCH-CHECKLIST.md`: Phase 6 ✅ 完了、G2 URL 記録、旧 docs/legal・i18n 項目を Track B 注記

## 変更ファイル

```
- src/index.template.html (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-g2-legal-footer.md (A)
```

## デグレ防止検証

- Phase 0 スナップショット取得済み
- `terms.html` / `privacy.html` / `i18n/en.json` md5: 不変
- Feedback / X / va-disable / insights / tally: 維持
- I2 CTA / TTS / mobile CSS: 意図どおり維持（`.legal-link` を既存セレクタに追記のみ）
- 生成物 6 言語: Terms/Privacy 各 1、main app script md5 全一致（`e9f2d35a…`）
- Phase 4 / 5 / 8 ✅: 維持

### grep 確認結果

- `href="/terms.html"` / `href="/privacy.html"`: 各 1
- `legal-link`: HTML 2 + CSS セレクタ複数
- `data-tally-open="xX1axk"` / `x.com/nkhippo123`: 各 1
- `Phase 6:.*✅ 完了`: 存在

## 動作確認

- 静的: build OK、リンク・スクリプト不変確認
- 動的: Preview で footer → `/terms.html` / `/privacy.html`（マージ後 Naoya 確認）
- 既存機能への影響: footer に 2 リンク追加のみ
- データ整合性: 対象外

## 実装過程での気づき

- Phase 6 チェックリストに旧「docs/legal Markdown」「英・日切替」が残っていたため、G1 方針に合わせ Track B / 対象外と注記

## 後続への影響

- Phase 6 完了 → Phase 7 / 9 / 10 へ進行可能
- Terms / Privacy 多言語化は Track B Phase B-Lang

## 残課題・申し送り

- Preview / 実機で footer 4 リンクの折り返し確認
- Draft PR にしない（G1 #57 の教訓）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: footer HTML/CSS 追記 + LAUNCH-CHECKLIST 更新のみ。フロー・URL・ビルド・i18n 不変。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C4, C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし（既存 `/terms.html` `/privacy.html` へのリンクのみ）
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（LAUNCH-CHECKLIST のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 6（Phase 0–5）
- 実際の Phase 数: 6（Phase 2 スキップ）
- 相互依存の発生有無: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
