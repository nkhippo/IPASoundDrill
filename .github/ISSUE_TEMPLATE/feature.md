---
name: ✨ Feature
about: 新機能・大型の仕様変更
title: 【Feature】
labels:
- feature
---

## 背景・目的

（なぜこの機能が必要か、ユーザーが得られる価値）

## 関連ドキュメント（任意）

- 仕様書該当セクション: <!-- 例: docs/features/2a.md -->
- 過去の類似実装レポート: <!-- 例: docs/cursor/reports/cursor-implementation-report-phase-v.md -->
- Cursor 指示書（タイプ B のみ）: <!-- 例: docs/cursor/instructions/cursor-instructions-<topic>.md -->

## 対象プラットフォーム

- [ ] Web（`apps/web/`）
- [ ] Mobile iOS（`apps/mobile/`、実装後）
- [ ] Mobile Android（`apps/mobile/`、実装後）
- [ ] Core（`packages/core/`、共有ロジック・データ）
- [ ] Tools（`tools/`、パイプライン・validate 等）

## 対象ゾーン（monorepo 4 ゾーン、ホワイトリストは必ずゾーン単位で明示）

- [ ] `apps/web/`
- [ ] `apps/mobile/`（実装後）
- [ ] `packages/core/`
- [ ] `tools/`

複数ゾーンにまたがる場合は `docs/workflow.md` §4 の分割 5 判断軸に従い、原則分割する（cohesive consolidation の例外時は理由を明記）。

## 実装範囲

- 対象ファイル（ゾーンを明示）:
  - `apps/web/src/index.template.html`（該当セクション）
  - `packages/core/data/<file>.json`
  - `tools/data-pipeline/<file>.py`
- 実装内容:
  - 〇〇機能を追加
  - △△のロジックを変更

## 完了定義

「〇〇の状態になっていること」という具体的な動作で記述する。

- [ ] （具体的な動作 A）
- [ ] （具体的な動作 B）
- [ ] （データ整合性チェック：wordlist / i18n / rp_ipa 等に触った場合）
- [ ] `docs/cursor/reports/` に実装レポートが追加されている

## テスト観点

- ブラウザ手動確認: [Chrome / Firefox / Safari]
- モバイル確認: [iOS Safari / Android Chrome]（該当する場合）
- 6 言語切替の動作確認: [ja / en / ko / zh-Hans / zh-Hant / fil]（i18n に触った場合）
- TTS 動作確認: [初回タップ / 連続再生 / GA↔RP 切替]（TTS 経路に触った場合）
- データ整合性: [wordlist 総語数 / rp_ipa 付与率]（該当する場合）

## 非対象範囲

（今回の Issue で扱わないこと。例：他モードへの影響、多言語 UI の一部言語対応）

## 優先度

- [ ] 🚨 critical
- [ ] ⚡ high
- [ ] 📌 medium
- [ ] 💤 low

## ランタイム契約への影響

以下のパス（正本は `packages/core/data/` / `packages/core/i18n/` / `packages/core/fonts/`、Web 配信は `apps/web/public/` 経由。詳細は `docs/data-contract.md`）に触る場合はチェック:

- [ ] `packages/core/data/wordlist.json`
- [ ] `packages/core/data/{connected_speech,weak_forms,guide}.json`
- [ ] `packages/core/i18n/*.json` / `packages/core/i18n/phonemes/*.json`
- [ ] `packages/core/fonts/DoulosSIL-Regular.woff2`
- [ ] `apps/web/src/index.template.html` 内の `GAS_TTS_URL`
- [ ] 該当なし
