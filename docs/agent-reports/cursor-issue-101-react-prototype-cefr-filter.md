---
id: pj-2026-07-20-issue-101
aliases:
- cursor-issue-101-react-prototype-cefr-filter
title: 'Track B: React + Vite 移行 Phase 1 - experimental プロトタイプ環境構築と CEFR フィルターの移植 (#101) — 実装レポート'
created: '2026-07-20'
---

# Track B: React + Vite 移行 Phase 1 - experimental プロトタイプ環境構築と CEFR フィルターの移植 (#101) — 実装レポート

## 関連 Issue / PR

- Issue: #101
- PR: 作成後に GitHub 上で確認
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #101 は Track B の React 化に向けた Phase 1 として、既存 production SPA を変更せずに `experimental/react-prototype/` に独立した React + Vite + TypeScript の検証環境を追加するもの。改修分類は L3 × C4/C3/C2 で、stack 転換・新規ディレクトリ構造・npm/build tooling の導入が主な判断根拠。既存 `index.html`、runtime data contract、既存 i18n schema は非対象で、CEFR フィルターの最小 UI と状態管理だけを移植対象とした。

## 実装内容

- `experimental/react-prototype/` に Vite + React + TypeScript の最小プロトタイプ環境を追加。
- `CEFRFilter` コンポーネントを追加し、A1/A2/B1/B2/C1/C2 の複数選択トグルと `onChange` callback を実装。
- `App` で CEFRFilter の選択状態を受け取り、JSON debug panel として表示。
- 依存は React / ReactDOM / TypeScript / Vite に限定し、UI framework・状態管理ライブラリ・Vite React plugin は未導入。
- prototype-local `.gitignore` で `node_modules/` と `dist/` を除外。
- README に目的、実行方法、意思決定サマリー、Phase 2 以降の課題を記録。

## 変更ファイル

```
- docs/agent-reports/cursor-issue-101-react-prototype-cefr-filter.md (A)
- experimental/react-prototype/.gitignore (A)
- experimental/react-prototype/README.md (A)
- experimental/react-prototype/index.html (A)
- experimental/react-prototype/package-lock.json (A)
- experimental/react-prototype/package.json (A)
- experimental/react-prototype/src/App.tsx (A)
- experimental/react-prototype/src/components/CEFRFilter.tsx (A)
- experimental/react-prototype/src/main.tsx (A)
- experimental/react-prototype/src/styles.css (A)
- experimental/react-prototype/tsconfig.json (A)
- experimental/react-prototype/tsconfig.node.json (A)
- experimental/react-prototype/vite.config.ts (A)
```

## デグレ防止検証

- Pre-Issue Recon: 実施。`src/index.template.html` の CEFR 関連 DOM / JS を `rg` で確認し、既存 vocab browser が multi-select 型であることを実装判断に反映。
- Phase 0: `git ls-files` ベースで tracked files 413 件の md5 snapshot を記録。
- Phase 0: runtime contract 8 パス相当と `src/index.template.html` の md5 snapshot を記録。
- Phase 1: `experimental/react-prototype/` 配下に新規ファイルのみ追加。
- Phase 2: `npm install react@latest react-dom@latest` と `npm install --save-dev typescript@latest vite@latest` を実行し、prototype-local lockfile を生成。
- Phase 3: `git ls-files` md5 再比較で既存 tracked files の変更 0 件を確認。
- Phase 3: runtime contract md5 再比較で変更 0 件を確認。
- `node_modules/` / `dist/`: `git status --ignored experimental/react-prototype` で ignored を確認。
- 実装中の自己判断による追加変更: なし（Issue の判断ポイント内で選択した事項のみ）。
- 実装中に発覚した懸念: なし。

## 動作確認

- `npm install`: OK（prototype directory）
- `npm run build`: OK（Vite production build 成功）
- `npm run dev`: OK（tmux session で `http://localhost:5173/` 起動）
- HTTP 応答確認: OK（root element と `/src/main.tsx` 参照を確認）
- Browser manual check: OK（A1/A2/B1/B2/C1/C2 の 6 ボタン表示、A1/C2 の on/off toggle、JSON debug state 更新）
- 既存機能への影響: なし（既存 tracked files と runtime contract の md5 不変）
- データ整合性: 対象外（wordlist / data / i18n / gas は未変更）

## 実装過程での気づき

- Vite の React plugin は Fast Refresh には有用だが、Issue の依存最小化条件を優先し、Phase 1 では未導入とした。
- TypeScript の型安全性は `CefrLevel` union と props に限定して早期導入した。大きな data schema typing は Phase 2 以降に残すのが適切。
- local `.gitignore` により prototype artifact boundary が明確になり、root `.gitignore` の変更なしで Issue の除外条件を満たせた。
- Cursor Automation Tools には Issue comment 投稿 tool がないため、開始宣言・PR URL 報告は automation tool では実施できなかった。作業内容と検証結果は本レポートと PR 本文に集約する。

## 後続への影響

- Phase 2 以降で i18n loader、runtime data loader、TTS integration、routing/build output policy を検討するための最小 React app ができた。
- CEFRFilter は props 境界を持つため、後続で data-driven label / disabled state / count badge を追加しやすい。
- dependency policy を拡張する場合、`@vitejs/plugin-react`、typecheck script、ESLint の導入可否を別 Issue で判断できる。

## 残課題・申し送り

- production Vercel build には統合していない。prototype は `experimental/react-prototype/` 内でのみ実行する。
- React 側の i18n / runtime data / TTS / routing 方針は README の Phase 2 task list に残した。
- PR 作成後、L3 のためマージ前に Claude Rv が必要。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: production runtime は不変だが、React + TypeScript + Vite + npm lockfile を新規導入し、Track B React 化の基礎判断を伴ったため L3 の保守的分類は妥当。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C4, C3, C2
- 実装中に追加が必要になった Pattern: なし
- C4: React + TypeScript の stack prototype を追加したため妥当。
- C3: `experimental/react-prototype/` という新規 artifact layout を追加したため妥当。
- C2: prototype-local npm scripts / lockfile / Vite build tooling を追加したため妥当。

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし（production routing 変更なし）
- [x] ビルドシステムへの影響なし（production build 変更なし、prototype-local build のみ追加）
- [x] AI 参照ドキュメント Category A への影響なし
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性

- 想定 Phase 数: 1
- 実際の Phase 数: 1
- 相互依存の発生有無: なし

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
