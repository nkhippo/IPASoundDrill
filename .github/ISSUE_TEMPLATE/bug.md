---
name: 🐛 Bug Report
about: バグを報告する
title: "【Bug】"
labels: ["bug"]
---

## 症状

（どんな状況で起こったか、簡潔に）

## 再現手順

1. 〇〇モード（Decode / Encode / Mode B / vocab browser 等）を開く
2. △△を選択
3. □□をクリック / 入力

## 期待される動作

（何が起こるべきだったか）

## 実際の動作

（何が起こったか）

## 環境

- ブラウザ: Chrome / Firefox / Safari
- デバイス: MacBook / Windows / iPhone / Android
- URL: https://ipasounddrill.app または github.io / localhost
- 言語設定: ja / en / ko / zh-Hans / zh-Hant / fil

## ローンチブロッカー判定

- [ ] 🚨 launch-blocker（2026-07-20 のローンチまでに必須）
- [ ] 📆 track-b（ローンチ後に着手可）

## 優先度

- [ ] 🚨 critical（使用不可）
- [ ] ⚡ high（利用に支障あり）
- [ ] 📌 medium（動作するが改善余地あり）
- [ ] 💤 low（UI 等の軽微な問題）

## 関連コード（あれば）

（例: `index.html` 内の該当セクション、`data/*.json` の該当エントリ）

## スクリーンショット・ログ（あれば）

---

## 根本原因記録（PR マージ後に Cursor が記入）

> ⚠️ このセクションは実装完了後に Cursor が記入する。起票時は空欄でよい。

| 項目 | 内容 |
|------|------|
| 直接原因 | （コードレベルの原因） |
| 根本原因 | （なぜその直接原因が生まれたか） |
| 根本原因カテゴリ | （`仕様書の粒度不足` / `データ整合性エラー` / `TTS/GAS 起因` / `i18n 漏れ` / `ランタイム契約の破壊` / `テスト不足` / `その他`） |
| 再発防止策 | （実施した対応。なければ「なし」） |

> 記入後、`docs/bug-knowledge.md` 末尾に同内容を追記すること。
