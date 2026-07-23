---
id: pj-2026-07-23-54ba
aliases:
- pj-2026-07-23-54ba
title: 'Align all SP screens with Claude Design (#128) — 実装レポート'
created: '2026-07-23'
---

# Align all SP screens with Claude Design (#128) — 実装レポート

## 関連 Issue / PR

- Issue: #128
- PR: #140（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Phase 1-E 後の CD 対本番 UI 乖離を、`docs/claude-design/sp.dc.html` を正典として SP 全画面に収束させる L3 × C6/C1 改修。Phase 0 論点は Claude コメント（2026-07-23）で確定。前段 CD 更新（#134 / PR #137）と Category F / UPDATE-GUIDE（#130/#138）完了後に実装再開。

- **Complexity Level**: L3
- **Change Pattern**: C6, C1
- **CD 意図的乖離**: A1 のみ（guide `?` 削除。Phase 1-F で再導入）

## Claude 判定の反映

| ID | 判定 | 実装 |
|---|---|---|
| A1 | guide アイコン+モーダル削除 | DOM/JS/i18n 削除 |
| A2 | 詳しい設定維持 + CD 意匠 | dashed + chevron、ja「詳しい設定」 |
| A3 | テキスト検索削除、IPA chip + A–Z | `#vocabIpaFilterBar` |
| A4 | Accent GA/RP カード化 | `.accent-card` + IPA サンプル |
| A5 | 副文「進捗を確認」等 | 6 言語 `progress.card_subtitle` |
| A6 | vocabBtn 維持 | 維持 |
| B1 | SRS UI+ロジック完全削除 | `computeSrsQueue` 等削除、marking LS 維持 |
| B2 | guide / review_queue i18n 削除 | 6 言語、validate OK |
| B3 | About ≤767px 非表示 | `@media(max-width:767px)` |
| B5 | `src/index.template.html` + i18n + LAUNCH-CHECKLIST | 準拠 |

## 実装内容

- 1a: terracotta swash / 副文 / 属性ストリップ、目的カード（アイコン+副文+chevron、2a ラベル削除）、「振り返る」分離カード
- 3a: CEFR カード（A1–B2+すべて）+ info panel、Accent カード、詳しい設定 CD 寄せ、対象語数表示
- Reveal/2c: 20px 正方形マーキング + signal 塗り +「覚えた X/3」
- 3b: IPA chip フィルタ（テキスト検索廃止）+ A–Z + CEFR
- 3c: sticky + 40:60（既存維持）
- 3d: 復習キュー削除
- ガイドモーダル完全削除
- iPhone 16 系 overflow / safe-area 軽微対応
- `docs/LAUNCH-CHECKLIST.md` に 1-E-CD 行

## 変更ファイル

```
- src/index.template.html (M)
- i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/agent-reports/cursor-issue-128-align-sp-claude-design.md (A)
```

## デグレ防止検証

- base: 最新 `origin/main`（PR #139 merge 後）から作業。閉じた PR #129 の実装を取り込み、Claude 判定ギャップ（A3/A4/A5 等）を上乗せ
- ブラックリスト（data / claude-design / CLAUDE / AGENTS / DOCUMENT-MAP / REPOSITORY-STRUCTURE）未変更
- 自己判断追加: en 等の `setup.show_filters` を Advanced settings 系に更新（A2 CD 寄せ）
- コンフリクト配慮: main 同期済み（ahead/behind 0/0 起点）、旧 PR #129 は closed のまま新規 PR

## 動作確認

- [x] `python3 tools/validate_i18n.py` — hard error なし
- [x] `npm run build` — 6 言語 HTML 生成 OK
- [x] `node --check` on main app script — OK
- [x] grep: `guideBtn` / `vocabSearchInput` / `computeSrsQueue` / `復習予定` 残存なし
- ブラウザ手動: ローカル build 後に SP 相当幅で確認推奨（Claude 13 観点 Rv + Naoya 実機）
- データ整合性: wordlist/data 未変更

## 実装過程での気づき

- 途中の部分 WIP は `loadGuide()` 呼び出し残りで壊れていたため破棄し、PR #129 成果物 + Claude 最新判定で再構築
- Issue ホワイトリストの `index.html`/`js/` は現行では `src/index.template.html`（インライン JS）が正

## 後続への影響

- Phase 1-F（3g オンボーディング）で guide `?` 再導入が必要
- PC 詳細意匠は本 Issue 非対象（merge 後 Naoya 点検）

## 残課題・申し送り

- Claude 13 観点 Rv（観点 13 CD 意匠再現度含む）待ち
- Naoya 実機: iPhone 16 系 viewport

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: 全画面 UX + i18n 削除 + ロジック削除。Runtime contract は非破壊だがユーザー可視変更が広範

### 事前 Change Pattern vs 実際

- 事前 Pattern: C6, C1
- 実装中に追加が必要になった Pattern: なし（i18n 削除は Issue 明示の C6/C1 付帯）

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema: キー削除のみ（追加は既存キー文言更新中心）。validate OK
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] Category A governance docs 未変更
- [x] 既存パス依存は維持（テンプレート編集のみ）

### Phase 分割の妥当性

- 想定 Phase 数: 1（単一 PR）
- 実際の Phase 数: 1
- 相互依存の発生有無: 前段 #134 CD 更新に依存（完了済み）

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
