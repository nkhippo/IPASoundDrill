---
created: 2026-07-13 22:00:00+09:00
project: IPASoundDrill
source_chat_date: 2026-07-13
status: draft
summary: Track A ローンチ準備の Cursor 実装 Issue 全 13 件を完了。判断セット 1（早期ローンチ、Product Hunt 2026-07-14
  火）を承認直後、Naoya さんが「Claude の初期プロトタイプ UI/UX のままの公開は避けたい」と方針転換。Phase 10a 素材制作を延期、UI/UX
  見直しを次 Chat で優先。判断 A（Phase 9 は Track B 送り）は確定。次 Chat 用の HANDOFF と汎用 Project Instructions
  を作成。
tags:
- ipa-drill
- design-decision
- retrospective
- important
title: Track A ローンチ準備完了 → UI/UX 見直しへの方針転換
type: chat_log
updated: 2026-07-13 22:00:00+09:00
id: pj-2026-07-13-cf63
aliases:
- pj-2026-07-13-cf63
---

## Summary

Track A ローンチ準備の Cursor 実装 Issue 全 13 件を完了。判断セット 1（早期ローンチ、Product Hunt 2026-07-14 火）を承認した直後、Naoya さんが「今の UI/UX は Claude が初めに作ったプロトタイプをそのまま利用しているだけ」と判断、公開用素材制作前に UI/UX 見直しを優先する方針転換。Phase 10a 素材制作を延期、次 Chat で UI/UX 見直しを進める。判断 A（Phase 9 は Track B 送り）は確定維持。次 Chat 用の HANDOFF ファイルと汎用的な Project Instructions ファイルを 2 つ作成。

---

## 背景

前 Chat（`2026-07-13_hub-chat-startup.md`）から続く本 Chat では、Track A ローンチ準備の Cursor 実装 Issue を集中的に処理:

- 開始時点: Issue #33/#35/#37/#39/#41 マージ済み、Phase 5 完了
- 本 Chat での処理: E1, VA opt-out, E2, I1, SEO 週次, I2, G1, G2 の 8 件を新規起票 → 実装 → Rv → マージ
- Cursor 実装 Issue の実質完了フェーズを達成
- Phase 4「Analytics + Feedback」、Phase 6「法務」、Phase 8「UI polish」がすべて完了

Naoya さんが判断セット 1（早期ローンチ）を承認した直後、方針転換の発言:

> すみません、実際に公開用のデザインなどを収集する前に、UI/UX 今一度見直したいです。というのも、今の UI/UX は Claude が初めに作ったプロトタイプをそのまま利用しているだけだからです。

---

## Cursor 実装 Issue の完了記録（本 Chat で処理した 8 件）

| # | Issue | 内容 | 分類 | マージ |
|---|---|---|---|---|
| 6 | #43 E1 | Vercel Web Analytics 統合 | L2 × [C2, C1] | ✅ |
| 7 | #46 | 開発者除外機能（VA opt-out） | L2 × [C2, C1] | ✅ |
| 8 | #48 E2 | Tally + X footer link | L2 × [C4, C1] | ✅ |
| 9 | #50 I1 | 英語コピー最適化 | L2 × [C6, C1] | ✅ |
| 10 | #52 | SEO 週次チェック + Track B スコープ | L1 × C1 | ✅ |
| 11 | #55 I2 | CTA + TTS + モバイル最適化 | L2 × [C4, C1] | ✅ |
| 12 | #56 G1 | Terms + Privacy 作成 | L2 × [C5, C1] | ✅ |
| 13 | #59 G2 | footer 法務リンク | L2 × [C4, C1] | ✅ |

前 Chat 分（#33/#35/#37/#39 F2/#41 F3）を合わせて、Track A ローンチ準備の Cursor 実装 Issue 全 13 件がマージ済み。すべての Issue で Complexity Retrospective 完了、Cursor 忠実実装のパターンを維持。

### 特筆すべき技術的判断

- **F2 パターン C 初適用**（前 Chat で完了）: DEV-GUARDRAILS § 3-alt の Phase 0-6、生成物 6 言語の script md5 一致検証を確立
- **VA opt-out（#46）**: `window.va` を no-op 化する IIFE、URL パラメータ `?va-disable=1` で localStorage 制御。Vercel の DNT 非対応の制約を回避
- **I2 の iOS Safari 対処**: `unlockAudioFromGesture()` + 無音 WAV base64 で autoplay 制約を回避、全 Audio play トリガーに適用
- **G2 の CSS 統合判断**: Cursor が新規クラス追加ではなく既存セレクタに `.legal-link` を統合する DRY 判断
- **G1 → G2 での Draft PR 教訓の反映**: Cursor が実装レポートで自発的に学習事項を記録

---

## 主要な意思決定

### 判断 A: Phase 9（英語 LP）→ Track B 送り ✅ 確定

**根拠**:
- I1 の英語コピー最適化で現在のトップページが十分洗練されている
- Product Hunt / Show HN 経由の初回訪問者は 3 秒で「これは何か」がわかる状態
- 素材制作コスト増を回避

**LAUNCH-CHECKLIST への反映**: Phase 9 セクションに「Track B 送り」注記が必要（次 Chat で UI/UX 見直し Issue に含めるか別 Issue にするか判断）。

### 判断 B: β1（今すぐ Phase 10a 開始） → **延期**（方針転換により）

当初予定: 3-5 時間で OGP 画像 + Favicon 制作 → UI/UX 見直し後に再開

### 判断 C: γ1（2026-07-14 火 Product Hunt ローンチ） → **延期**（方針転換により）

当初予定: 2026-07-14 17:01 JST（Product Hunt 00:01 PST） → UI/UX 見直し後に再判断

### 判断 2（SEO 分析）: β + γ

- **β**: OPERATIONS.md § 8.1 週次チェックに GSC 5 項目追加、§ 8.2 月次チェックに SEO 累積レビュー 3 項目追加 → Issue #52 で完了
- **γ**: SEO 分析ダッシュボード構築 + 任意改善候補 2 つ（sitemap x-default 変更、Bot rewrite）を Track B スコープに正式記録 → Issue #52 で完了

---

## UI/UX 見直しへの方針転換

### 転換の背景

Cursor 実装 Issue 完了 + Google Search Console 登録 + 6 URL インデックス登録済みという状態で、判断セット 1（早期ローンチ）承認直後の発言。Naoya さんは「Claude のプロトタイプ UI/UX のまま公開は避けたい」品質重視の判断を優先。

Naoya さんの life strategy「long-term B2B direct contracts」と「solving someone's problem leads to revenue」の観点から、早期ローンチのメリット（実データ蓄積）よりも品質重視の判断が勝った。

### 次 Chat で進めるべきこと（優先順）

1. **現状 UI/UX の分析と問題点洗い出し**
   - Claude が MCP で `src/index.template.html` を取得して現状把握
   - Naoya さんの体感的な問題点をヒアリング
2. **改善方向性の設計**
   - デザインシステム全体の見直し vs 個別要素の改善
   - モード切替 UI、CTA、進捗表示、フォント、色パレット等の各観点
3. **Issue 化と Cursor 実装**
   - CHANGE-CLASSIFICATION 準拠の分類
   - パターン B または C 適用（規模による）
4. **マージ後の判断**
   - Phase 10a 素材制作再開の判断
   - 新たなローンチ日程の判断

### 検討観点候補（次 Chat 用ヒント、12 項目）

- 視覚的第一印象（3 秒で「これは何か」が伝わるか）
- CTA ボタンの重要度と配置
- モード切替の直感性（4 モードの UI 表現: タブ vs カード vs メニュー）
- 学習フローの完了感（進捗表示、正解 / 不正解フィードバック）
- IPA 記号の視認性
- 6 言語対応の UI（各言語での崩れ、フォント差異）
- モバイル UX（I2 で改善済みだが根本見直し余地）
- 色パレット全体（ティール中心維持 vs 拡張）
- タイポグラフィ（`--mono` フォント継続 vs サンセリフへ）
- ヘッダー / footer レイアウト（ミニマル vs 情報密度）
- 進捗表示の可視化
- IPA キーボードのモバイル表示

### 絶対に維持すべきもの（制約）

- Track A 静的サイト構成（React 化は Track B）
- 6 言語対応の一貫性（i18n JSON、生成物 md5 一致）
- 既存運用機能（Vercel Analytics + VA opt-out + Tally + X + Terms/Privacy）
- CHANGE-CLASSIFICATION / DEV-GUARDRAILS のフレームワーク遵守

---

## Track B スコープに追加された事項

Issue #52 マージで LAUNCH-CHECKLIST の Track B スコープに正式記録:

### Phase B-Lang: 13 言語対応

- 既存 6 言語 + 追加 7 言語（es / pt-BR / vi / id / th / hi / ar）
- 対象: i18n JSON、Terms / Privacy 翻訳、llms.txt 多言語版、TTS ヒント文言、footer リンクテキスト

### Phase B-SEO: SEO 分析ダッシュボード + 任意改善

- SEO 分析ダッシュボード構築（Search Console + Vercel Analytics + Ahrefs 統合）
- 任意改善候補 1: sitemap x-default を `/en/` に変更（GSC `/` リダイレクトエラー解消）
- 任意改善候補 2: Bot 向け middleware.ts を 302 → rewrite（`@vercel/functions` 導入）
- 判断タイミング: ローンチ後 4-6 週間の GSC データ蓄積後

### Phase B-Analytics: `@vercel/analytics` パッケージ導入

- カスタムイベント実装（`mode_start`, `answer_correct`, `answer_wrong`, `language_switch`, `accent_switch`, `tts_play`）
- OPERATIONS.md § 5.4 に記録済み

### Phase 9: 英語 LP

- Track B 送り確定

---

## GSC / SEO の状況（本 Chat 時点）

### Google Search Console

- ドメイン所有権確認完了（DNS TXT レコード、Namecheap）
- サイトマップ送信完了（フル URL `https://ipasounddrill.app/sitemap.xml` で送信、相対パスは弾かれた）
- 6 言語 URL のインデックス登録リクエスト完了、`/en/` は「URL は Google に登録されています」確認済み
- `/` の「リダイレクトエラー」表示は設計通り（hreflang x-default = `/`、middleware.ts が 302）
- **Naoya さんが GSC メモを添付し「起票不要」判定、Claude も完全同意** → Track B 任意改善候補として記録済み

### Bing Webmaster Tools

- Search Console からインポート完了

### 未実施（Naoya さん保留）

- Rich Results Test で 6 URL の JSON-LD Valid 確認
- PageSpeed Insights `/en/` の Core Web Vitals（LCP / INP / CLS）測定
- I2 の iPhone Safari 実機テスト（CTA + TTS 動作確認）
- Chrome DevTools でモバイル幅（480 / 768）崩れなし確認

---

## Vercel Analytics データ（本 Chat 時点）

- ページ別: /en 6、/fil 3、/ja 3、/ko 2、/zh-Hans 2、/zh-Hant 2
- Countries: US 81%、Japan 13%、Poland 6%
- Devices: Desktop 75%、Mobile 25%
- OS: Windows 38%、iOS 25%、GNU/Linux 19%、Mac 19%
- Referrers: なし

**解釈**: Bot トラフィック + Naoya さん動作確認が大半。`?va-disable=1` 設定完了後は真のトラフィックのみ記録される。

---

## 次の Chat への引き継ぎ

### 作成した引き継ぎ成果物

Naoya さんが次の Chat で使うための 2 ファイルを Claude Artifacts で作成:

1. **`HANDOFF-uiux-review-pivot.md`**: 次 Chat の Project Knowledge に添付、13 セクションで前 Chat の状態を集約
2. **`project-instructions-generic.md`**: 汎用的な Project Instructions、長期的な機能改修相談にも対応可能

### 次 Chat の初動フロー

1. HANDOFF 確認
2. MCP で Category A ドキュメント取得（CLAUDE.md、REPOSITORY-STRUCTURE、LAUNCH-CHECKLIST、DOCUMENT-MAP、CHANGE-CLASSIFICATION、DEV-GUARDRAILS、OPERATIONS）
3. `src/index.template.html` を取得して現状 UI/UX 把握
4. `i18n/en.json` を取得して英語コピー現状把握（I1 マージ後の最新版）
5. Naoya さんに UI/UX の問題点認識ヒアリング
6. 改善方針設計 → Issue 化 → Cursor 実装 → PR Rv → マージ

### 現在の Issue Queue

- 起票中/実装中/Rv 待ち/マージ待ち: **なし**
- 起票予定: UI/UX 見直しの Issue（次 Chat で内容確定）

### 保留判断（次 Chat で再判断可能）

- Product Hunt / Show HN / Reddit / X 投稿の是非
- 新規 X アカウント（英語投稿用）の必要性
- 新たなローンチ日程

---

## 参照ドキュメント

### GitHub Issue（本 Chat 分）

- #43 E1, #46, #48 E2, #50 I1, #52, #55 I2, #56 G1, #59 G2（全マージ済み）

### 関連チャットログ

- `[[2026-07-13_hub-chat-startup]]` - 本 Chat の直前
- `[[2026-07-11_launch-week-master-strategy]]` - ローンチ週の全体戦略

### 前 Chat の handoff ファイル

- `handoff_ipa_drill_launch.md`（前々 Chat 由来）
- `handoff_note_writing.md`（前 Chat の別 Chat 由来）
- `handoff_fable_portfolio_philosophy.md`（前 Chat の別 Chat 由来）

### 本 Chat で作成した handoff ファイル

- `HANDOFF-uiux-review-pivot.md`（次 Chat 用、Naoya さんが Project Knowledge に添付）
- `project-instructions-generic.md`（次 Chat 以降の Project Instructions、Naoya さんが Projects 設定にコピペ）

---

## 補足: 発信素材化のネタ

本 Chat で確立された技術的洞察は note 記事化の候補:

- パターン C 適用の実装記録（F2）
- middleware.ts の PoC → 動作確認 → C1 fallback の分岐実装
- 多言語 SEO の pull 型 + push 型統合設計
- AI エージェントによる法務ドキュメント作成事例
- 静的サイトでの Vercel Analytics 自己除外実装
- Track A ローンチ準備の運用体系（Analytics + Feedback + SEO + 法務の 4 系統）
- **UI/UX 見直しの実装事例**（次 Chat で追加）
- **AI エージェントによる Cursor 忠実実装 13 Issue の実績とパターン**（本 Chat で完成）
