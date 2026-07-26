---
created: 2026-07-13 00:00:00+09:00
project: IPASoundDrill
source_chat_date: 2026-07-13
status: published
summary: IPA Sound Drill 管制 Chat の初回起動セッション。HANDOFF-hub-chat-master.md と MCP 経由の CLAUDE.md
  を突き合わせて現状把握を実施。Day 1-3 完了で元計画より 3-4 日前倒し、次アクションは Day 4-5 Chat (Vercel Analytics
  + SEO) の切り出し。HANDOFF-day4-5-analytics-seo.md の鮮度確認を Naoya さんに投げた段階で保存。
tags:
- ipa-drill
- cursor
- mcp
- github
title: '管制 Chat 初回起動: 状態把握と Day 4-5 切り出し判断待ち'
type: chat_log
updated: 2026-07-13 00:00:00+09:00
id: pj-2026-07-13-d174
aliases:
- pj-2026-07-13-d174
---

## Summary

IPA Sound Drill の管制 Chat として稼働開始した初回セッションの記録。Custom Instructions と Project Knowledge の HANDOFF-hub-chat-master.md を読み込み、MCP コネクタ `IPASoundDrill GitHub` 経由で CLAUDE.md を取得して現状を把握した。Day 4-5 Chat 切り出し前のパック鮮度確認を Naoya さんに投げて保存。

## 起動時チェック

- Custom Instructions 読み込み完了（管制 Chat の役割・Issue 起票ルール・返答末尾テンプレ）
- Project Knowledge の HANDOFF-hub-chat-master.md 読み込み完了
- MCP コネクタ `IPASoundDrill GitHub` の疎通確認完了（`CLAUDE.md` 取得成功）
- 憶測禁止ルール適用: 不明点は MCP 取得 or Naoya さん確認

## 現状把握

### プロジェクト進行状況

- **Track A（〜2026-07-20）継続中**: 現行の静的 HTML + JSON + GAS TTS 構成を維持
- **Day 1-3 完了**: 元計画より 3-4 日前倒し、バッファ十分
- **完了 Issue**: #1 / #2 / #4 / #7 / #10 / #12（Railway MCP 立ち上げまで）
- **公開 URL**: `ipasounddrill.app`（Vercel + カスタムドメイン）
- **ローンチ目標**: 2026-07-20（海の日）

### 技術スタックと運用

- フロントエンド: 単一 `index.html` + 純粋 JS + JSON データ
- TTS: Google Apps Script（Track A 期間中は現行維持）
- 計測: Vercel Web Analytics（Plausible から切替済み）
- MCP: Railway ホスト、`https://ipasounddrill-production.up.railway.app/mcp`
- Track A の対応言語: ja / en / ko / zh-Hans / zh-Hant / fil（6 言語）

### 進行中の学習事項（Day 4-5 の前提）

- 多言語 SEO 戦略を JS-dynamic から subdirectory + build-time prerendering に転換済み（AI クローラの多くが JS 実行しないことが判明したため）
- Category A ドキュメント（LAUNCH-CHECKLIST / REPOSITORY-STRUCTURE / OPERATIONS / DOCUMENT-MAP 等）の atomicity ルール確立
- Pre-Issue Recon ワークフローが大規模タスクの初期不確実性解消に有効

## 次アクション（Naoya さんへの投げかけ）

Day 4-5 Chat の切り出しについて、`HANDOFF-day4-5-analytics-seo.md` の状態を確認:

- **A**: 手元にあり、そのまま新 Chat に添付可能 → 即起動
- **B**: 手元にない、または再生成したい → 管制 Chat で生成
- **C**: Day 3 完了実績を反映してから起動したい → 差分相談 → 生成

管制 Chat の推奨は **B or C**。理由:

- Day 3 で Railway MCP を前倒し完了しているため、その事実を Day 4-5 パックに反映しておくと Cursor 指示書の前提が正確になる
- 前任の管制 Chat が作成した時点から状況が進んでいるため、鮮度チェックの価値がある

## Day 4-5 Chat のスコープ（HANDOFF より）

- **Issue E**: Vercel Analytics（cookieless）+ Tally form + X DM リンク + カスタムイベント
- **Issue F**: SEO + hreflang（`?lang=xx` 方式 → subdirectory 方式に更新済み）+ i18n meta + JSON-LD（WebApplication）+ sitemap + robots.txt

## 未確定・保留事項

- Naoya さんの A / B / C 選択待ち
- 選択が確定次第、必要なら HANDOFF-day4-5-analytics-seo.md を .md で生成して present_files で提示

## 関連

- リポジトリ: `nkhippo/IPASoundDrill`
- MCP エンドポイント: `https://ipasounddrill-production.up.railway.app/mcp`
- 参照 Category B ドキュメント: `CLAUDE.md`, `docs/REPOSITORY-STRUCTURE.md`, `docs/LAUNCH-CHECKLIST.md`, `docs/DOCUMENT-MAP.md`
