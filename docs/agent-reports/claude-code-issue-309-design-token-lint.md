# デザイントークン整合 lint 導入 + 辺昇格フック（横展開信頼問題 α）(#309) — 実装レポート

## 関連 Issue / PR

- Issue: #309
- PR: （本レポートと同一 PR）
- Agent: claude-code

## Issue 背景（Issue 本文から要約）

横展開の信頼問題の α（整合性 lint）実装。同じ値が複数ファイルに複製され片方だけ更新されて静かにドリフトする構造問題への機械的対処。`validate_i18n.py`（i18n キーの全言語一致を CI 検証）の一般化を、デザイントークン（色）に適用する。実測で SEO 5テンプレの色トークンが本体アプリと 11中7トークン不一致という「静かな不整合」が既に発生していたため、その修正も含む。

- 改修分類: **L3 × [C2, C6, C1]**（guardrails 改定=L3 条件① / SEO 可視変更=C6 / docs 更新=C1）

## 実装内容

- 新規チェッカー `tools/validate/validate_design_tokens.py`: 正本 `apps/web/src/index.template.html` の :root 色トークンと、各 `*.template.html`（index 除く）を **intersection 方式**（両方に存在する色トークンのみ）で照合。不一致は `<file>:<line>: <token> <value> が正本 <SoT> の <value> と不一致` で報告し exit 1。
- 新規 CI `.github/workflows/validate-design-tokens.yml`: `apps/web/src/*.template.html` / スクリプト / ワークフロー自身を path フィルタに、PR(opened/synchronize/reopened) と main/master push で自動実行。
- ドリフト修正: SEO 5テンプレ（sound-detail / sound-words / phrase-detail / weak-form-detail / dataset-landing）の共通7トークン（`--paper` `--panel` `--ink` `--muted` `--faint` `--hair` `--signal-soft`）を本体色へ統一。`--signal` `--stress` は元々一致。SEO 固有 `--paper-2` `--stress-soft` は非共有辺のため不変。
- `docs/guardrails.md` §11「整合の辺の機械検証と昇格」追加: 現行チェッカー一覧 + 辺昇格フック（実装/Rv 時に新しい重複の辺を発見したら機械化可否を判断し、可能なら Issue として提案する義務）。
- `docs/doc-map.md` §2 にレジストリ行追加。

## 変更ファイル

```
- tools/validate/validate_design_tokens.py (A)
- .github/workflows/validate-design-tokens.yml (A)
- apps/web/src/sound-detail.template.html (M)
- apps/web/src/sound-words.template.html (M)
- apps/web/src/phrase-detail.template.html (M)
- apps/web/src/weak-form-detail.template.html (M)
- apps/web/src/dataset-landing.template.html (M)
- docs/guardrails.md (M)
- docs/doc-map.md (M)
- docs/agent-reports/claude-code-issue-309-design-token-lint.md (A)
```

## デグレ防止検証

- 変更範囲: 宣言ホワイトリスト内のみ。SEO テンプレの変更は :root 内の色トークン値のみ（レイアウト・DOM・スクリプト不変）。
- 実装中の自己判断による追加変更: なし。
- 実装中に発覚した懸念: SEO テンプレはトークン集合が本体と分岐（本体 `--accent/--accent-soft`、SEO `--paper-2/--stress-soft`）していたため、単純全トークン照合ではなく intersection 方式を採用。壁打ちで正本の向き（本体）を Naoya 確認済み。

## 動作確認

- [x] `python3 tools/validate/validate_design_tokens.py` が exit 0
- [x] SEO 5ページの共通7トークンが本体 `index.template.html` と一致
- [x] 1トークンを意図的に破壊 → exit 1 + `sound-detail.template.html:41: --paper #000000 が正本 #F3EDE6 と不一致` を報告。破壊を戻すと再び exit 0
- [x] `python3 tools/validate/validate_i18n.py` 非回帰 OK
- 既存機能への影響: SEO 5ページの配色が本体ブランドパレット（暖色系 paper/ink）に統一される可視変更。DOM・機能は不変。
- データ整合性: 対象外（ランタイム契約 8 パス非該当）。

## 実装過程での気づき

- intersection 方式は「新しい SEO テンプレを足しても自動でカバー」「意図的な非共有トークンを誤検出しない」を両立。i18n の en 基準と同型。
- SEO テンプレの色ドリフトは α が検出する第1号の実例。α 導入前は誰も気づいていなかった（辺が未宣言だった）。

## 後続への影響

- α のログ（不一致検出）は後続 γ（敵対的検証・自己改善）の入力になる。
- spacing/radius/shadow/font-family トークンの辺は本 Issue 非対象。次段で同型に拡張可能。

## 残課題・申し送り

- C6 可視変更のため Vercel branch preview で SEO 5ページの before/after スクショを PR に添付する（本 PR 作成後）。
- β（DRY 化 / design-tokens.json 正規化）本体は α/γ で重複の全貌が見えてから着手。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: guardrails.md への実装ゲート追記（L3 条件①）+ SEO 5ページの可視変更を含むため L3 が妥当。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C2, C6, C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし（build-i18n-html.js は不変。テンプレの :root 値のみ変更）
- [x] AI 参照ドキュメント Category A への影響: doc-map.md / guardrails.md を意図的に更新（レジストリ整合済み）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1（cohesive な一体変更）
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
