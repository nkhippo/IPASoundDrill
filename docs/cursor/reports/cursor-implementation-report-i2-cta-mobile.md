# I2 CTA + TTS + mobile — 実装レポート

## 関連 Issue / PR

- Issue: #55
- PR: #(作成後)

## Issue 背景（Issue 本文から要約）

Phase 8 UI polish の I2。I1 で英語コピー完了後、CTA 視認性・TTS 初回タップ促し・モバイル最適化で視覚実装を仕上げ、Phase 8 を完了させる。

## 実装内容

### CTA（Start）
- `.start` を `--ink` 黒から `--signal` ティールへ変更（コントラスト強化）
- `min-height: 48px`、font 16px、box-shadow、hover / focus-visible / disabled 状態を追加

### TTS 初回タップ
- 現状確認: Mode B / Reveal 等で `setTimeout(... speak())` による自動再生あり。iOS ではジェスチャ外の `Audio.play()` が失敗し得る
- `unlockAudioFromGesture()`: Start / Listen クリック時に無音 WAV でジェスチャ解放
- `speak()` の `play()` 失敗時に `#audioHint`（「Tap Listen to enable sound」）と `.playicon.needs-tap` パルスを表示
- 再生成功・セットアップ復帰時にヒントをクリア
- i18n キー追加なし（英語フォールバック。他言語 JSON は不変）

### モバイル
- `@media (max-width:768px)` / `480px` を追加、既存 `520px` / `599px` を維持
- タップ領域 44px（topbtn / pill / key / go / footer Feedback·X 等）
- 入力 `font-size: 16px`（Safari ズーム防止）、`overflow-x: hidden`
- in-play の playicon を 38px → 44px に維持

### LAUNCH-CHECKLIST
- Phase 8 を ✅ 完了、I2 URL・残タスクにチェック

## 変更ファイル

```
- src/index.template.html (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-i2-cta-mobile.md (A)
```

## デグレ防止検証

- Phase 0 スナップショット取得済み
- E1 / #46 / E2 script（va-disable / insights / tally）: 維持
- i18n/en.json 他言語: 未変更
- 生成物 6 言語の **main app script** md5: 全一致（`e9f2d35a…`）
- Phase 4 / 5 ✅: 維持

### grep 確認結果

- `@media` count: 6（変更前 3 → 768 / 480 / reduced-motion 追加）
- `id="startBtn"` / `audio-hint` / `unlockAudioFromGesture` 存在
- `va-disable` / `insights/script.js` / `tally.so/widgets/embed.js` 維持
- `Phase 8:.*✅ 完了` 存在

## 動作確認

- 静的: build OK、app script md5 一致
- 動的: Preview で CTA 視認・モバイル幅・TTS 失敗時ヒント（Naoya: iPhone Safari 実機）
- 既存機能への影響: Start 色変更、自動再生失敗時のみヒント表示
- データ整合性: 対象外

## 実装過程での気づき

- ヒントを setup 内に置くと in-play で非表示になるため、`play-line` 直下へ配置
- 他言語 i18n を触らず英語フォールバックにした（Issue の en-only 追加より安全）

## 後続への影響

- Phase 8 完了 → Phase 6 / 7 / 9 に集中可能
- TTS ヒントの多言語化は Track B Phase B-Lang 候補

## 残課題・申し送り

- Naoya: iPhone Safari で Start → 自動再生 or Listen タップの確認
- Chrome DevTools で 480 / 768 幅の崩れ確認
- Product Hunt 着地体験の完了定義は未チェック（ローンチ後）

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: CSS + 既存 speak 経路へのアンロック / 失敗時 UI。フロー再設計・URL・ビルド変更なし。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C4, C1
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] AI 参照ドキュメント Category A への影響なし（LAUNCH-CHECKLIST のみ）
- [x] 既存ファイルパスへの依存関係が壊れていない

### Phase 分割の妥当性
- 想定 Phase 数: 6（Phase 0–5）
- 実際の Phase 数: 6（Phase 2 i18n スキップ）
- 相互依存の発生有無: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細
なし
