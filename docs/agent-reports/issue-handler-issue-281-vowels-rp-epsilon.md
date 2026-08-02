# fix(core): VOWELS_RP に ɛ が欠落 — RP nucleus ハイライトが 406 語で誤表示 (#281) — 実装レポート

## 関連 Issue / PR

- Issue: #281
- PR: （本コミット後に作成）
- Agent: claude-code (issue-handler)

## Issue 背景（Issue 本文から要約）

Complexity: L2 × C5（packages/core のスコアリングロジック修正、406 語に影響。VOWELS_RP は encode.ts の母音定数で runtime data / schema contract 相当）。
`packages/core/src/scoring/encode.ts` の `VOWELS_RP` に `ɛ` が含まれておらず、RP IPA データで `ɛ` を使う 453 語のうち 406 語で `nucleusIndex` が誤った母音（後方の `ə` 等）を返していた。`VOWELS_GA` には既に `ɛ` が含まれており GA 側は問題なし。

## 実装内容

- `packages/core/src/scoring/encode.ts` line 36 の `VOWELS_RP` に `ɛ` を追加（`"iː", "ɪ", "e", ...` の直後、`"iː", "ɪ", "ɛ", "e", ...` に変更）。

## 変更ファイル

```
- packages/core/src/scoring/encode.ts (M)
- docs/agent-reports/issue-handler-issue-281-vowels-rp-epsilon.md (A)
```

## デグレ防止検証

- Issue 本文ホワイトリスト（`packages/core/src/scoring/encode.ts` のみ）どおり、1 定数への 1 要素追加のみを実施。他の定数・関数・GA 側には一切触れていない。
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: なし

## 動作確認

- `pnpm --filter @ipasounddrill/core test` を実行し、既存 7 テストファイル・49 テストが全て通過することを確認（既存 `encode.test.ts` の 13 テストを含む）。
- Issue のテスト観点 3 件を Node の一時スクリプトで直接検証:
  - `nucleusIndex(tokenize("/səkˈsɛsfəl/", "rp"), "rp")` → `5`（`ɛ` の index と一致、完了定義 #2 を満たす）
  - `nucleusIndex(tokenize("/ˈmɛni/", "rp"), "rp")` → `2`（`ɛ` の位置）
  - `nucleusIndex(tokenize("/ɛm/", "rp"), "rp")` → `0`（`ˈ` なしフォールバックでも `ɛ` の位置）
- GA 側（`VOWELS_GA`）は変更していないため、GA の動作に影響なし。
- 既存機能への影響: なし（追加のみで削除・変更はなし）
- データ整合性: 対象外（wordlist データ自体は変更していない。定数追加によりトークナイズ結果の解釈が変わるのみ）

## 実装過程での気づき

- 特になし。Issue 本文の差分指示がそのまま既存コードと一致しており、迷いなく適用できた。

## 後続への影響

- `nucleusIndex` に依存する他の機能（発音ポイントの自動生成等）も正しく動作するようになる（Issue 本文記載どおり）。

## 残課題・申し送り

- なし

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一ファイルの定数 1 要素追加のみで完結したが、`packages/core` の公開 API（`VOWELS_RP` / `nucleusIndex`）に影響し 406 語に波及するため L2 が妥当。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C5（Runtime data / schema contract）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（`VOWELS_RP` 自体は 8 パス外の内部定数。wordlist データやスキーマは変更していない）
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可

### 昇格・追加提案がある場合の詳細

なし
