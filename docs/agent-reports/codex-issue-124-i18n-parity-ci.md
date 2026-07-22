---
id: pj-2026-07-22-124c
aliases:
- pj-2026-07-22-124c
title: 'Expand validate_i18n.py with parity CI guard (#124) — 実装レポート'
created: '2026-07-22'
---

# Expand validate_i18n.py with parity CI guard (#124) — 実装レポート

## 関連 Issue / PR

- Issue: #124
- PR: #TBD（draft）
- Agent: codex

## Issue 背景（Issue 本文から要約）

Issue #124 は、i18n 更新漏れや JSON / HTML 破損を LLM の目視・推論ではなく機械的ガードで検出するため、`tools/validate_i18n.py` と CI を強化するもの。改修分類は L2 × C2、堅固化パターン B。日本語残留、key parity、placeholder parity、JSON format、`_html` 妥当性を hard-fail 化する。

## 実装内容

- `tools/validate_i18n.py` に CJK かな残留検出、UI key parity、placeholder parity、JSON 2 スペースインデント検証、`_html` HTML parser 検証を追加。
- 既存 Track A 構造に合わせ、HTML 参照元を `src/index.template.html` に修正。
- `.github/workflows/validate-i18n.yml` を追加し、PR / push 時に `python3 tools/validate_i18n.py` を実行。
- `docs/DEV-GUARDRAILS.md` / `docs/OPERATIONS.md` / `docs/REPOSITORY-STRUCTURE.md` に i18n CI ガードの運用を追記。

## 変更ファイル

```
- .github/workflows/validate-i18n.yml (A)
- tools/validate_i18n.py (M)
- docs/DEV-GUARDRAILS.md (M)
- docs/OPERATIONS.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/agent-reports/codex-issue-124-i18n-parity-ci.md (A)
```

## デグレ防止検証

- 変更範囲は i18n 検証 tool、CI workflow、関連 docs、実装レポートのみ。
- 実装中の自己判断による追加変更: あり。現行 `src/index.template.html` に fallback 付きで存在する `audio_tap_hint` は i18n key として未定義のため、既存挙動維持として参照欠落チェックの許容リストに入れた。
- 実装中に発覚した懸念: 現行 `i18n/{ko,zh-Hans,zh-Hant,fil}.json` に `about.title` / `about.placeholder` の CJK かな残留が存在し、Issue の「i18n value 変更禁止」と「現状 6 言語 PASS」の両立がローカル状態では不可能だった。ブラックリストを優先し、i18n value は変更していない。

## 動作確認

- `python3 tools/validate_i18n.py` で現行 i18n に対する検証が実行され、既存の CJK かな残留を hard-fail として検出することを確認。
- 一時コピー上で ko の通常 key に `テスト` を入れ、CJK かな残留で FAIL することを確認。
- 一時コピー上で en から 1 key を削除し、key parity で FAIL することを確認。
- 一時コピー上で `{n}` を `{count}` に変更し、placeholder parity で FAIL することを確認。
- 一時コピー上で JSON インデントを 4 スペースに変更し、format で FAIL することを確認。
- 一時コピー上で `_html` key に `<b>text` を入れ、未閉じタグで FAIL することを確認。
- 既存機能への影響: Runtime UI / data contract への変更なし。
- データ整合性: i18n value、runtime data、fonts、src 実装ロジックは未変更。

## 実装過程での気づき

- `gh` CLI が環境に存在せず、`git fetch` / `git push` は HTTPS CONNECT 403 で失敗した。PR メタデータは make_pr tool で作成した。
- 既存 `tools/validate_i18n.py` は F2 後の構成とずれており、存在しない `index.html` を読みに行っていたため、`src/index.template.html` に修正した。

## 後続への影響

- 今後の i18n 変更 PR は `validate-i18n` workflow により、日本語残留 / key 欠落 / placeholder 欠落 / JSON インデント崩れ / `_html` 破損を CI で検出できる。
- 現行 i18n の既存日本語残留は別 PR または Issue #124 のレビュー判断で解消が必要。

## 残課題・申し送り

- i18n value 変更禁止を遵守したため、`ko` / `zh-Hans` / `zh-Hant` / `fil` の `about.title` / `about.placeholder` は未修正。CI を green にするには、ブラックリスト例外として翻訳修正を許可する follow-up が必要。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: tooling / CI / docs にまたがるが Runtime UI 挙動・データ schema・URL 構造は変更していないため L2 の範囲内。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C2
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響あり（DEV-GUARDRAILS / OPERATIONS / REPOSITORY-STRUCTURE を更新済み）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 5
- 実際の Phase 数: 5
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし。
