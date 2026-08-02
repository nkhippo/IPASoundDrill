# fix(ui): 設定画面 GA/RP 幅 + PC問題画面の上下余白調整 (#279) — 実装レポート

## 関連 Issue / PR

- Issue: #279
- PR: （本コミット後に作成）
- Agent: claude-code (issue-handler)

## Issue 背景（Issue 本文から要約）

Complexity: L1 × C6（CSS の値変更のみ、ランタイム契約・i18n・データスキーマに触れない）。
Naoya からの UI フィードバック 3 点に対応:
1. PC 設定画面の GA/RP カードが横幅いっぱいに広がらず右に余白が残る
2. PC 問題画面の上部余白が不足
3. Next ボタンの上部余白が不足

## 実装内容

- `apps/web/src/index.template.html` line 941: `body.pc-support #setup.profile-3a .accent-card-grid` を `display:flex;gap:12px` から `display:grid;grid-template-columns:1fr 1fr;gap:12px` に変更し、GA/RP カードが横幅いっぱいに均等 2 分割されるようにした。
- 同ファイル line 968: `body.in-play .wrap` に `margin-top:32px` を追加し、PC 問題画面カード上端とビューポート上端の間に余白を確保した。
- 同ファイル line 288: `.reveal-next` の `margin-top` を `24px` から `32px` に変更し、Next ボタン上部の余白を拡大した。

## 変更ファイル

```
- apps/web/src/index.template.html (M)
- docs/agent-reports/issue-handler-issue-279-settings-ga-rp-width-play-spacing.md (A)
```

## デグレ防止検証

- Issue 本文で指定された 3 箇所の CSS 値変更のみを実施。JavaScript・HTML 構造・他の CSS ルールには一切触れていない。
- SP 版 `#setup.profile-3a .accent-card-grid`（line 821）は既に `grid-template-columns:1fr 1fr` のため変更不要であることを確認し、変更していない。
- PC 2 ペインレイアウトの `body.in-play.drill-two-pane #reveal:not(.hidden) .reveal-next{margin-top:auto}`（line 1048）が `.reveal-next` の `margin-top:32px` を上書きするため、2 ペイン時のボタン配置には影響しないことをコード上で確認した。
- 実装中の自己判断による追加変更: なし
- 実装中に発覚した懸念: なし

## 動作確認

- 3 箇所の CSS 差分が Issue 本文の指示と完全に一致することを diff で確認済み。
- ランタイム契約 8 パス（wordlist / connected_speech / weak_forms / guide / UI i18n / phoneme i18n / IPA font / GAS_TTS_URL）に非該当のため、追加の自動検証（i18n validate 等）は不要と判断。
- 既存機能への影響: なし（CSS 値変更のみで、セレクタ・プロパティ構造は変更していない）
- データ整合性: 対象外
- 実機・ブラウザでの目視確認は未実施（本エージェントには GUI 検証環境がないため）。Vercel branch preview URL での確認は Naoya に依頼。

## 実装過程での気づき

- 特になし。Issue 本文の差分指示がそのまま既存コードと一致しており、迷いなく適用できた。

## 後続への影響

- なし

## 残課題・申し送り

- Vercel branch preview での目視確認（SP/PC 設定画面、PC 問題画面全4ドリル、SP/PC Next ボタン、PC 2 ペインレイアウト）は Naoya 側で実施をお願いします。

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L1
- 実装後の妥当性判定: 妥当
- 判定根拠: 単一ファイルの CSS 値 3 箇所変更のみで完結し、他の構造・契約への影響はなかった。

### 事前 Change Pattern vs 実際

- 事前 Pattern: C6（Product behavior / UX）
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
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
