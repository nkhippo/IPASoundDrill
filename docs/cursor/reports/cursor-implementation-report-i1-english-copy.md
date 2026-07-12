# I1 English copy — 実装レポート

## 関連 Issue / PR

- Issue: #50
- PR: #51

## Issue 背景（Issue 本文から要約）

Phase 8 UI polish の I1。ローンチ向けに `i18n/en.json` の英語コピーをネイティブ水準へ整え、`llms.txt` とトーンを揃える。他言語・UI 実装（I2）は対象外。

## 実装内容

- `i18n/en.json`: 値のみ最適化（キー構造 182 flat keys 維持）
  - Meta / SEO: description・og・keywords を CTA・キーワード両立に調整（title / ogTitle / brand.name は維持）
  - Leads / modes / CTAs: trap sounds 統一、Connected タブ、Read & write IPA、エラー文言の次行動導線化
  - Hints / summary / notes: schwa・stress・weak spots・Practice again 等を自然な英語に
- `src/index.template.html`: 変更なし（hardcoded は i18n フォールバック、Feedback/X は E2 意図どおり英語固定）
- `docs/LAUNCH-CHECKLIST.md`: Phase 8 を 🔄、I1 タスクにチェック、Issue #50 URL 記録

## 変更ファイル

```
- i18n/en.json (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-i1-english-copy.md (A)
```

## デグレ防止検証

- Phase 0 スナップショット取得済み
- 他言語 `i18n/{ja,ko,zh-Hans,zh-Hant,fil}.json`: 未変更
- `i18n/phonemes/*`: 未変更
- F2 / F3 / E1 / #46 / E2 成果物: 未変更
- Runtime contract 他 7 パス: 未変更
- JSON schema: flat keys 182 → 182（追加・削除なし）
- Phase 4 / 5 ✅: 維持

### grep / 検証結果

- `python3 -m json.tool i18n/en.json` → valid
- `npm run build` → `/en/` head に最適化 meta 埋め込み確認
- Phase 8: `🔄 進行中` + I1 チェック済み

## 動作確認

- 静的: schema / JSON / build meta OK
- 動的: Preview で `/en/` View Source・UI 文言レビュー（Naoya）
- 既存機能への影響: 表示テキストのみ
- データ整合性: キー構造不変

## 主な文言変更（抜粋）

| キー | 変更の趣旨 |
|------|------------|
| `meta.description` / `ogDescription` | llms.txt トーン + SEO CTA |
| `lead_html` | trap sounds 統一、scoring 表現を自然に |
| `tab.connected` | Linking → Connected（連結音全体） |
| `mode.a` | Read & write IPA |
| `load_fail` / `wordlist_fail` | 次の行動を示す |
| `note.schwa` / `note.stress` | ネイティブ自然な説明 |
| `summary.*` | weak spots / Practice again |

## 実装過程での気づき

- テンプレート内の英語はほぼ i18n フォールバック。Feedback / X は Issue #48 方針どおり英語固定のため触らない
- `note.schwa` は `textContent` 注入のため HTML entity（`&mdash;`）は使わず Unicode ダッシュを使用

## 後続への影響

- I2（CTA / モバイル）起票・実装可能
- Track B Phase B-Lang の翻訳ゴールデンソースとして利用可能

## 残課題・申し送り

- PR 上で Naoya が英語コピー目視レビュー
- I2 は未着手

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 英語値の差し替え + LAUNCH-CHECKLIST 更新のみ。スキーマ・ビルド・URL・他言語不変。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C6, C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし（en.json の値のみ）
- [x] i18n schema への影響なし（キー追加・削除なし）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（LAUNCH-CHECKLIST のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 6（Phase 0–5）
- 実際の Phase 数: 6（Phase 2 は変更なしでスキップ）
- 相互依存の発生有無: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
