# Connected cs_rule 3 言語追加 — 実装レポート

## 関連 Issue / PR

- Issue: #66
- PR: #(作成後)

## Issue 背景（Issue 本文から要約）

Connected phrase の `cs_rule` が en/ja/fil のみで、ko / zh-Hans / zh-Hant UI では英語フォールバックになっていた。Q-7-A により 201 句へ 3 言語翻訳を追加。`csRuleText()` は変更不要（LANG 直参照）。

## 実装内容

- `data/connected_speech.json`: 全 201 句の `cs_rule` に `ko` / `zh-Hans` / `zh-Hant` を追加
- 既存 `en` / `ja` / `fil` は不変（main との diff 検証済み）
- 音声学用語の統一: 연음/连音/連音、동화/同化、탈락/脱落/脫落、약형/弱读/弱讀、플랩/闪音/閃音、활음/滑音 等
- `docs/SPECIFICATION.md`: `cs_rule` 言語リストを 6 言語に更新（事実同期。弱形 36 件は未翻訳・明記）

## 変更ファイル

```
- data/connected_speech.json (M)
- docs/SPECIFICATION.md (M)
- docs/cursor/reports/cursor-implementation-report-cs-rule-3-languages.md (A)
```

## デグレ防止検証

- JSON parse: OK（201 entries）
- 全句に 3 言語キーあり・空文字なし
- 日本語ひらがな/カタカナ残存: 0
- en/ja/fil vs `main`: **差分なし**
- `src/index.template.html` / i18n / wordlist: 未変更
- `csRuleText()`: `c.cs_rule[LANG] || c.cs_rule.en` — 追加キーを自動参照

## 動作確認

- 静的: schema・完全性・既存言語不変をスクリプト検証
- 動的: Naoya さんによる UI 確認推奨（Settings で ko / zh-Hans / zh-Hant → Connected → Reveal のルール文）

## 残課題・申し送り

- **翻訳品質レビュー**: Issue 記載どおりサンプル or ネイティブ確認を推奨（603 エントリ）
- 弱形 36 件の `cs_rule` はまだ en/ja/fil のみ（本 Issue スコープ外）
- SPEC Issue 本文は「変更なし」だったが、フィールド言語表記が古いままだと矛盾するため最小同期を実施

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L1
- 実装後の妥当性判定: **妥当**
- 判定根拠: データ追加のみ（既存キー不変）。コード変更なし。SPEC は事実同期の最小追記。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C3
- 実装中に追加 Pattern: なし（SPEC はデータ契約の記述同期）

### 構造・契約への影響点検
- [x] Runtime data: `connected_speech.json` の `cs_rule` 拡張（後方互換・追加のみ）
- [x] template / i18n 不変
- [x] 弱形 JSON 未変更

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案

### 不明点
- なし（弱形は意図的に非対象）
