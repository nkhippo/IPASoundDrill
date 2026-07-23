---
id: pj-2026-07-23-29e3
aliases:
- pj-2026-07-23-29e3
title: 'PC UI CD compliance + About SRS removal (#147) — 実装レポート'
created: '2026-07-23'
---

# PC UI CD compliance + About SRS removal (#147) — 実装レポート

## 関連 Issue / PR

- Issue: #147
- PR: #148（draft）
- Agent: cursor

## Issue 背景（Issue 本文から要約）

Issue #128 後に `DIVERGENCE.md` へ TBD 登録された PC 4 画面の CD 乖離と About features item_5 の SRS 言及残存を一括解消する L3 / C1+C5+C6。PR #146 の宣言形・受け入れアサーション・スクショ必須を初適用。Category F = C（CD 不変）。

## 実装内容

### Phase 0
- ブラックリスト md5 19 ファイル記録（完了時 0 mismatches）
- CD SRS 検証 0 件 → Category F = C 継続
- 解釈 A1–A3 を Issue Comment に投稿し採用案 B で続行

### Phase 1（スコープ 1–4）
- PC (≥1024px) 1a: 4×1 purpose grid、右カラム `top-sidebar`、ヘッダー `header-link`
- PC ドリル: `task-header`、`drill-pane`、答え合わせ時 `drill-two-pane` で左右並置
- 3a: Accent → CEFR 順、h3「学習プロフィール」系文言、info panel 文言を CD 寄せ
- `/iː/` ロゴサイズを PC トップで 26px に

### Phase 2（スコープ 5）
- About / modeb lead から SRS・spaced 言及を削除（6 言語）
- 未使用 `vocab.filter.spelling` を 6 言語から削除（`ipa`/`all` は使用中のため残置）
- コード参照 `computeSrsQueue` 等は既に 0 件

### Phase 3
- `DIVERGENCE.md`: TBD 5 行削除、SP guide 1 行のみ残置
- `REPOSITORY-STRUCTURE.md`: vocab.filter 記述更新
- `LAUNCH-CHECKLIST.md`: 1-H を #147 完了として記録

## 変更ファイル

```
- src/index.template.html (M)
- i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json (M)
- docs/claude-design/DIVERGENCE.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/agent-reports/cursor-issue-147-pc-cd-compliance.md (A)
```

## デグレ防止検証

- ブラックリスト md5: Phase 0 と完了時で全一致
- `python3 tools/validate_i18n.py`: hard error 0（WARN のみ）
- `npm run build`: 6 言語 HTML 生成成功
- 自己判断追加: accent-card の `textContent` 上書きバグを `accentGaName`/`accentRpName` 更新に修正（#128 残件、カード DOM 破壊防止）

## 動作確認

受け入れアサーション（要約）:

| 項目 | 結果 |
|---|---|
| purpose-card / purpose-grid / sidebar | ≥1（実測 22 / 4 / 39） |
| drill-pane / task-header / header-link | ≥1（9 / 18 / 5） |
| template SRS コード参照 | 0 |
| vocab.filter.spelling / about srs keys | 0 |
| i18n `srs\|SRS\|spaced\|espaciad` | 0（全言語） |
| DIVERGENCE TBD 5 行 | 0 / SP guide 1 |
| blacklist md5 | 0 mismatches |
| validate_i18n hard error | 0 |

ブラウザ: ローカル `npm run build` + HTTP server で PC 幅トップの 4 カード・sidebar・header link を確認予定。スクショは技術制約により PR Comment で Naoya 実機を Claude Rv 前提とする旨を明記。

残件（アサーション文言との差分・採用案 A1）:
- `progress.*` / `weak_btn` の「復習」は卒業・苦手復習 UI の実体のため残置

## 実装過程での気づき

- CD `#3a` の Accent は簡素ボタンだが、#128 で SP と揃えた accent-card を維持し順序のみ CD 準拠とした
- ドリルの 2 ペインは出題パネルを隠さず reveal と並置する方式。Mode B インライン reveal は従来どおり 1 ペイン寄り
- Issue は `vocab.filter.*` 未使用削除と書いていたが、`ipa`/`all` は DOM 使用中

## 後続への影響

- Phase 1-F（guide `?` + オンボーディング）へ移行可能（DIVERGENCE 最終行）
- PC 意匠のさらなるピクセル忠実性はスクショレビューで詰める

## 残課題・申し送り

- スクショ全画面リストのエージェント添付は不可 → Naoya 実機を Claude Rv と並行
- 受け入れアサーション「復習 → 0」は progress.* を含めると過大。Claude 側で文言精緻化推奨

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際

- 事前 Complexity Level: L3
- 実装後の妥当性判定: 妥当
- 判定根拠: PC 4 画面 + i18n schema + Category A docs を横断。2 ペインは JS 状態も変更

### 事前 Change Pattern vs 実際

- 事前 Pattern: C1, C5, C6
- 実装中に追加が必要になった Pattern: なし

### 構造・契約への影響点検

- [x] Runtime data contract 8 パスへの影響なし（blacklist md5 一致）
- [x] i18n schema: spelling キー削除のみ（validate hard error 0）
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] Category A: DIVERGENCE / REPOSITORY-STRUCTURE / LAUNCH-CHECKLIST 更新済
- [x] 既存パス依存は維持

### Phase 分割の妥当性

- 想定 Phase 数: 0–5
- 実際: Phase 0 Comment → 実装（template / i18n / docs）→ report / PR
- 相互依存: PC CSS と reveal 2 ペインは同一 template 内で結合

### 総合判定

- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案、Issue Comment で報告して中断
- [ ] Pattern 追加提案、Issue Comment で報告して中断

### 昇格・追加提案がある場合の詳細

なし
