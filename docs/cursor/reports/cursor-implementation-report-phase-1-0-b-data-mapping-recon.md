---
id: pj-2026-07-18-10b-report
aliases:
- cursor-implementation-report-phase-1-0-b-data-mapping-recon
title: Phase 1-0-b screen-data mapping Recon — 実装レポート
created: '2026-07-18'
---

# Phase 1-0-b screen-data mapping Recon — 実装レポート

## 関連 Issue / PR

- Issue: #78
- PR: #80（open）

## Issue 背景（Issue 本文から要約）

Phase 1-0-a（#75）で PURPOSE/SPEC/DESIGN が目的 4 カード前提に確定したあと、Phase 1-C〜1-E の起票には Setup パラメータ実態・LS 移行・CEFR/GA-RP カバレッジ・IPA 検索性能の数値が必要だった。Claude が巨大 HTML/JSON を MCP 精読するより Cursor Recon で `docs/design/phase-1/screen-data-mapping.md` を Category A 資産化する方針（案 α）を採用した。

## 実装内容

- `docs/design/phase-1/screen-data-mapping.md` 新規（§1–§7）
- `docs/DOCUMENT-MAP.md` Category A / C / D に追加
- `docs/LAUNCH-CHECKLIST.md` Phase 1-0-b 完了マーク
- `docs/REPOSITORY-STRUCTURE.md` に `phase-1/` 言及
- テンプレートは latency 計測でも未変更（md5 不変）

## 変更ファイル

```
- docs/design/phase-1/screen-data-mapping.md (A)
- docs/DOCUMENT-MAP.md (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/cursor/reports/cursor-implementation-report-phase-1-0-b-data-mapping-recon.md (A)
```

## デグレ防止検証

- Phase 0: template md5 `65c30ff7797549b478a4c8db2f8f8702` 記録
- 最終: 同 md5（プロトタイプ未挿入。Node で同等アルゴリズム計測）
- ブラックリスト `data/**` / PURPOSE/SPEC/DESIGN: 未編集
- 自己判断追加変更: 0 件

## 動作確認

- Front Matter YAML: OK
- CEFR 集計再現: wordlist 未タグ 0、A1=1187 / A2=1195 / B1=2116 / B2=899
- IPA 検索 latency: Node mean 0.15 ms / max 1.62 ms（目標 100ms 以内）
- 12 パラメータ: Setup 論理 9 + Accent/Language = 11（トグルはシェル）を表で明記

## 実装過程での気づき

- 「12 パラメータ」は DOM ID 76 個ではなく論理フィールド 9+設定 2
- CEFR / rp_ipa は既に 100% — Q-17/Q-18 のブロッカーは音声 BatchWarm 運用側
- vocab 検索は綴りのみ。IPA 検索は新設でも全走査で十分速い
- marks の物理キーは `ept_marks_v1` オブジェクト推奨（LS キー爆発回避）

## 後続への影響

- 1-C: §1/§2 でプロフィール項目と LS 移行を起票可能
- 1-D: §3 で CEFR フィルタ実装に未タグ特例ほぼ不要
- 1-E: §5 で検索最適化を見送り、単純フィルタで開始可

## 残課題・申し送り

- Accent/Language を含む公式ラベルは **Setup 11 項目**（Naoya 裁定・PR #80）。PURPOSE/DESIGN の旧「12」表記は Phase 1-C で書き替え
- RP BatchWarm・連結 RP TTS は Track B
- 実機 Safari での latency は 1-E で任意確認

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L2
- 実装後の妥当性判定: 妥当
- 判定根拠: 新規 docs + map 更新中心。データは読取のみ。中断条件（未タグ 5% 超 / latency 500ms 超）に非該当

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1, C5
- 実装中に追加が必要になった Pattern: なし（REPOSITORY-STRUCTURE の 1 行更新はディレクトリ言及で Issue 想定内）

### 構造・契約への影響点検
- [x] Runtime data contract 8 パスへの影響なし
- [x] i18n schema への影響なし
- [x] URL 構造への影響なし
- [x] ビルドシステムへの影響なし
- [x] Category A への追加あり（本 Issue 目的）
- [x] 既存パス依存が壊れていない

### Phase 分割の妥当性
- 想定: Phase 0–7 / 実際: 調査一括 + ドキュメントコミット（Recon 成果物が単一ファイルのためコミットは論理分離）
- 相互依存: なし

### 総合判定
- [x] 事前分類妥当、PR 作成可
- [ ] Level 昇格提案
- [ ] Pattern 追加提案
