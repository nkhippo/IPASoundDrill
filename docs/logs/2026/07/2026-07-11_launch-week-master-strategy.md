---
created: 2026-07-11 16:00:00+09:00
project: IPASoundDrill
source_chat_date: 2026-07-10
status: published
summary: 2026-07-20 ローンチに向けた IPA Sound Drill の管制 Chat (Day 1-3) の総括。命名 ipasounddrill.app
  / IPASoundDrill 確定、Vercel + Namecheap 本番移管完了、専用 MCP 稼働、Track A/B 分離、Cursor 堅固化パターン
  A/B 確立、Day 単位 Chat 切り出し戦略と Projects 恒久化まで。
tags:
- ipa-drill
- design-decision
- cursor
- mcp
- important
title: 'IPASoundDrill ローンチ週の管制 Chat 総括: Track A/B 分離・堅固化パターン・Chat 運用戦略の確立'
type: chat_log
updated: 2026-07-11 16:00:00+09:00
id: pj-2026-07-13-2f70
aliases:
- pj-2026-07-13-2f70
---

## Summary

7/10-11 の 2 日間で、IPA Sound Drill (旧 IPA Drill / English-Pronunciation-Trainer) を `ipasounddrill.app` として一般公開するための運用体系を確立した。ThinkGrindAi の運用パターンを踏襲しつつ、10 日間ローンチ + 個人開発 + 静的サイト向けに軽量化。Track A (ローンチ) / Track B (ローンチ後) の分離、Cursor 実装のデグレゼロを保証する堅固化パターン A / B、Chat 運用戦略 (管制 + Day 単位切り出し)、Projects による恒久化まで一気通貫で整備。予定 10 日を 2 日で消化、バッファ十分の状態で Day 4-10 へ引き渡し。

## 背景

- Naoya が既存 IPA Drill を一般公開したい (2026-07-20 海の日ローンチ目標)
- 手運用が多すぎて、ThinkGrindAi 相当の運用体系に移行したい
- デグレ・憶測進行・同じプロンプト再入力の 3 つを最も嫌う
- ThinkGrindAi のフロー (7-step, タイプ A/B/C, Obsidian ローカル AI 履歴) をそのまま持ってくるとオーバースペック

## 確定事項

### プロダクト・命名

- プロダクト名: **IPA Sound Drill**
- ドメイン: **`ipasounddrill.app`** (小文字、Namecheap 取得、AUTO-RENEW ON、次回 2027-07-11)
- リポ名: **`IPASoundDrill`** (PascalCase、`English-Pronunciation-Trainer` から改名)
- Vercel サブドメイン: `ipa-sound-drill.vercel.app`
- ブランドカラー: `#0C7C7E` (CSS 変数 `--signal`、既存定義)
- タグライン仮: 英 *Drill your English sounds with IPA.* / 日「IPA で、英語の音をドリルする。」(Day 8 で最終確定)

### 命名選定の経緯

初期 `ipatuner.app` → Naoya の見直しで `ipasoundtuner / ipasounddrill / ipasound / ipadrill / ipapronun` 系を比較。`drill` の吸引力 (既存 IPA Drill 資産)、`sound` の追加 (Q3「音から想起」思想の明示) から `ipasounddrill.app` に決定。pronun 系は英語圏で不完全省略に見えるため却下。

### ポジショニング (3 要素)

1. IPA を情報源として引ける
2. 音から単語を想起する (Mode B の思想)
3. L1 音韻フィルタからの脱却 (Japanese English は一例)

### 技術構成 (Track A = ローンチまで)

- 単一 `index.html` (3,259 行、CSS/JS inline) を維持
- ホスティング: Vercel 静的サイト
- TTS: Google Apps Script 継続
- 6 言語対応: ja / en / ko / zh-Hans / zh-Hant / fil
- React 化・BE 移管・BYOK は Track B (ローンチ後) へ切り出し
- DNS: A `216.198.79.1` / CNAME `52646c530fa600df.vercel-dns-017.com.`

### Track A / B 分離方針

10 日間 (7/10-20) はコンテンツ / 計測 / 法務 / 素材に集中。技術刷新はローンチ後。ローンチデータを見てから React 化する方が投資判断として筋が良い。

### 開発フロー (4-step、ThinkGrindAi の 7-step を軽量化)

1. 要件整理 (Naoya × Claude、Chat)
2. 設計懸念点検 (Cursor、Issue Comment)
3. 実装 (Cursor、PR)
4. レビュー・マージ (Naoya、`ok` コメントで自動マージ)

### Issue タイプ

- タイプ A (軽微、単一ファイル、既知仕様への復帰)
- タイプ B (標準、複数ファイル、仕様書更新)
- タイプ C は Track B で使用開始

### Branch 戦略

- Track A: main-first (10 日短期のため簡素化)
- Track B: develop-first へ切り替え

### AI 履歴戦略

- **リポ内公開 (α 戦略)** を選択 (ThinkGrindAi の Obsidian ローカル戦略とは異なる)
- `docs/cursor/{instructions,reports,briefs}/` に蓄積
- Obsidian は Naoya 個人メモ用途 (`decisions/`, `notes/`)
- 公開 OSS の transparency を活かす方針

## Cursor 堅固化パターン (デグレゼロ保証)

Naoya の「デグレを最も嫌う」に応えるため、2 種類のパターンを確立。今後の全 Issue で Cursor 指示書は必ずどちらかを踏襲する。

### パターン A: 新規追加のみ (Issue #1 型)

Phase 1 事前スナップショット (全ファイル md5 記録) → Phase 2 配置 → Phase 3 差分検証 (md5 で既存不変を機械保証) → Phase 4 コミット + 実装レポート → Phase 5 最終自己検証 → Phase 6 PR。

### パターン B: 既存編集を伴う (Issue #4 / #10 型)

Phase 1 事前スナップショット → Phase 2 grep + ホワイトリスト照合 + Naoya 事前承認 → Phase 3 機械的置換 (Rule 1 = sed) → Phase 4 差分検証 (ブラックリスト md5 不変) → Phase 5 手動更新 (Rule 2/3/4 意図的編集) → Phase 6 Naoya diff 目視承認 → Phase 7 PR。

### 共通原則

- Cursor 自己判断禁止、迷ったら Issue Comment で中断
- lint / typo 修正 / Markdown 整形の禁止
- 「ついでに」の作業禁止
- 各 Phase 完了時に Issue Comment に投稿
- 「中断は失敗ではなく、正しい判断」

## Chat 運用戦略

10 日間ローンチを単一 Chat で回すのは不可能 (コンテキスト長の限界)。以下の構造を確立。

- **管制 Chat**: 進捗管制、引き継ぎパック生成、優先順位判断
- **Day 単位切り出し Chat**: 各 Issue の詳細実装・議論
- **MCP Chat**: 稼働中、必要時のみ
- 各 Day 完了時に管制 Chat に完了報告 → 次の Chat 引き継ぎパック生成

管制 Chat 自身も重くなる前に次の管制 Chat に引き継ぐ (今回の 2 日目でその第 1 回引き継ぎを実施)。

### 引き継ぎパック方式

Day 単位の新 Chat 起動時に `.md` ファイル 1 つを添付するだけで context 復元可能。パックには「初期方針」「詰めるべき論点」「進行フロー」「完了時報告フォーマット」を含める。過去 Chat の会話ログは転記しない (context 節約)。

## 完了 Issue (Day 1-3、2026-07-11 時点)

| # | タイトル | PR |
|---|---|---|
| 1 | chore: setup ipasounddrill governance | #2 |
| 2 | chore: seed repository labels | - |
| 4 | chore: Vercel + rename + custom domain migration | #5 |
| 7 | chore: remove GitHub Pages workflow | #8 |
| 10 | docs: unify repo name + OPERATIONS update | #11 |
| 12 | chore: setup dedicated MCP server on Railway | #14 |

## 稼働中の外部リソース

- 本番: https://ipasounddrill.app
- Vercel: https://vercel.com/nkhippo/ipa-sound-drill
- Railway (MCP): https://ipasounddrill-production.up.railway.app/mcp
- Namecheap (レジストラ): https://ap.www.namecheap.com/domains/list/
- Claude MCP コネクタ: `IPASoundDrill GitHub` (ThinkGrindAi GitHub と混同禁止)

## 手元に残した引き継ぎ物 (`ipasounddrill_setup/`)

- `HANDOFF-hub-chat-master.md` (463 行): 新管制 Chat 起動時添付
- `HANDOFF-day4-5-analytics-seo.md` (266 行): Day 4-5 Chat 起動時添付
- `SETUP-CLAUDE-PROJECTS.md` (452 行): IPA Sound Drill 開発運用 Projects の設定ガイド (Custom Instructions 全文含む)
- 過去 Issue 草稿・Cursor 指示書のリファレンス

## 学び

- **Chat コンテキストは Day 3 で 150K+ トークン**に達し、Day 単位切り出しが必須。
- **堅固化パターンは 3 Issue の実運用**で効果確認済み。既存編集型は Phase 5 の Naoya 目視承認が特に効く。
- **リポ名の表記揺れ (`ipasounddrill` vs `IPASoundDrill`)** は初期に確定させないと後で技術的負債になる (実際 Issue #10 で回収)。
- **Vercel Web Analytics cookieless** を選ぶと Consent Banner 不要 → 法務要件が軽量化。
- **Cursor 完了報告のレポート化**が振り返り資産として強い。Issue #4 の Namecheap DNS 実値情報が Issue #10 で活きた。
- **Projects の Custom Instructions への恒久化**により、Chat ごとの再設定が不要に。

## 次のトラック (Day 4-10)

- Day 4-5: Issue E (Vercel Analytics + Tally) → Issue F (SEO + hreflang + i18n meta + JSON-LD + sitemap)
- Day 6: Issue G (favicon / OGP / apple-touch-icon) + Issue H (UI polish) + 法務ドキュメント軽量版
- Day 7: 英語 LP or 既存トップ強化 (別 Chat 推奨)
- Day 8-9: デモ素材 + 英語コピー (別 Chat 推奨)
- Day 10: リハーサル + 7/20 ローンチ (管制 Chat 主導)

進捗評価: 元計画より 3-4 日前倒し完了。バッファ十分。

## 関連

- 実装リポ: https://github.com/nkhippo/IPASoundDrill
- MCP リポ: https://github.com/nkhippo/ipasounddrill-mcp
- ThinkGrindAi 側の対応 Projects (混同禁止): 既存の Projects「開発運用」「サービス仕様」を継続、`IPASoundDrill GitHub` コネクタを無効化して疎結合を保つ
