---
id: pj-2026-07-20-a101
aliases:
- pj-2026-07-20-a101
title: 'Track B: React + Vite 移行 Phase 1 — experimental プロトタイプ (#101) — 実装レポート'
created: '2026-07-20'
---

# Track B: React + Vite 移行 Phase 1 — experimental プロトタイプ (#101) — 実装レポート

## 関連 Issue / PR

- Issue: #101
- PR: （draft・作成時に番号追記）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Track B の React 化 Phase 1。既存 SPA を触らず `experimental/react-prototype/` に Vite + React + TypeScript 環境を新設し、CEFR フィルター骨格（A1–C2 トグル + parent onChange）だけを移植して feasibility を確認する。Complexity Level L3、Change Pattern C4 + C3 + C2。

## Pre-Issue Recon（実施済み）

- Setup `#cefrPills`: A1–B2 multi-toggle、`Set`（`S.cefrLevels`）、デフォルト A1/A2 on
- Vocab `#vocabFilters`: A1–B2 + All、`vocabCefrSelected` Set
- Issue 要求の A1–C2 は Setup 系を拡張したプロトタイプ骨格として実装（C1/C2 は本番 Setup には未露出）
- `origin/develop` は未作成 → draft PR base は `main`

## 実装内容

- `experimental/react-prototype/` を `npm create vite@latest -- --template react-ts` で生成
- `CEFRFilter.tsx`: A1–C2 の 6 ボタン、multi-toggle、`onChange(CEFRLevel[])`
- `App.tsx`: 選択状態を保持し、画面下部に JSON デバッグ表示
- `README.md`: 目的・実行方法・意思決定サマリー・Phase 2+ 課題リスト
- ルート `.gitignore` に `experimental/**/dist/` を追記（local `.gitignore` も node_modules/dist を除外）
- `npm install` / `npm run build` 成功を確認

### 判断ポイントへの回答

1. **TypeScript**: 採用（Track B の型安全方針を Phase 1 で固定）
2. **`.gitignore`**: local + root の両方（自己完結 + Track B 全体への波及）
3. **選択モデル**: 複数選択 + Set → 親へ配列（既存 SPA と同型）
4. **Vite/lint**: テンプレ defaults（`oxlint` スクリプトは残置、追加 ESLint スタックは入れない）

## 変更ファイル

```
- .gitignore (M)
- experimental/react-prototype/** (A)  # package.json, lock, Vite/TS config, src/, README, index.html 等
- docs/agent-reports/cursor-issue-101-react-cefr-prototype.md (A)
```

## デグレ防止検証

- 変更範囲: `experimental/react-prototype/` + `.gitignore` + 本レポート
- 実装中の自己判断による追加変更: なし（Issue 委譲の判断のみ）
- 実装中に発覚した懸念: `develop` ブランチ未作成のため Track B でも base=`main`（README / 本レポートに記録）

## 動作確認

- [x] Vite + React + TypeScript 環境が構築されている
- [x] `npm install` 成功
- [x] `npm run build` 成功（`tsc -b && vite build`）
- [x] CEFRFilter が A1–C2 をレンダーしトグル可能（コードレビュー + ビルド成功）
- [x] 選択状態が App で受け取り JSON 表示
- [x] README に意思決定・Phase 2 課題あり
- [x] 既存 `index.html` / runtime contract 8 パス未変更
- [x] `node_modules/` / `dist/` が gitignore 済み
- 既存機能への影響: なし（本番パス非接触）
- データ整合性: 対象外
- ブラウザ手動確認: ローカル `npm run dev` はエージェント環境で起動確認せず（build 成功をもって完了定義のビルド側を充足）。Naoya さんによる `npm run dev` でのクリック確認を推奨

## 実装過程での気づき

- create-vite 現行テンプレは ESLint ではなく `oxlint` を同梱。Issue「Vite defaults のみ」に合わせ残置
- 本番 Setup は A1–B2 のみ。プロトタイプは Issue どおり A1–C2 — Phase 2 でレベル集合の正本を決める必要あり

## 後続への影響

- Track B の最初のコード成果物として `experimental/` がリポジトリに存在
- README の Phase 2 課題リストが次 Issue の分割材料になる
- `develop` ブランチ作成が Track B 運用のブロッカー候補

## 残課題・申し送り

- Naoya さん: `cd experimental/react-prototype && npm run dev` でトグル UI を目視確認
- 後続: `develop` ブランチ新設 Issue、i18n/TTS/runtime 統合方針の設計 Issue

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当（降格提案は記録可だが L3 維持を推奨）
- 判定根拠: スタック転換（C4）+ 新規ディレクトリ（C3）+ npm/Vite tooling 初導入（C2）が同時。本番非接触だが「ビルド / ホスティングの初導入・転換」条件に該当し L3 が正しい。実装量自体は小さく感じるが Level は質的判定。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C4, C3, C2
- 実装中に追加が必要になった Pattern: なし（重ね掛けは妥当。C1 はレポート配置のみで主 Pattern にはしない）

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし（experimental は未公開）
- [ ] ビルドシステムへの影響なし ← **意図的に影響あり（新規 Vite プロジェクト）**。本番 Vercel build は未変更
- [x] AI 参照ドキュメント Category A への影響なし（レポート追加のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 1（1a/1b 分割は不要だった）
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし。L3 × [C4, C3, C2] は実態と一致。実装が軽く感じるのは Phase 分割と「既存編集ゼロ」の効果であり、降格はしない（CHANGE-CLASSIFICATION の質的判定に従う）。
