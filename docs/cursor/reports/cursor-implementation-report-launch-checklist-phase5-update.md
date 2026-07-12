# LAUNCH-CHECKLIST Phase 5 update — 実装レポート

## 関連 Issue / PR

- Issue: #29
- PR: #(作成後)

## Issue 背景（Issue 本文から要約）

Issue #26 の Pre-Issue Recon と壁打ちで、(1) 多言語 SEO をサブディレクトリ + ビルド時プリレンダリングへ転換、(2) Pre-Issue Recon を運用ルールとして明記、(3) Track B に追加言語 7 種（Phase B-Lang）を構造化する方針が確定した。これらを `docs/LAUNCH-CHECKLIST.md` に反映し、後続 Issue F2 起票の正本とする。

## 実装内容

- Phase 5 を新方針（`/en/` 等サブディレクトリ、静的 head、vercel.json、sitemap/robots/llms.txt）で置換
- Track B スコープメモ末尾に Phase B-Lang（es / pt-BR / vi / id / th / hi / ar）を追記
- Track B 直前に「運用ルール: Pre-Issue Recon（Issue #26 実証済み）」を追加

## 変更ファイル

```
- docs/LAUNCH-CHECKLIST.md (M)
- docs/cursor/reports/cursor-implementation-report-launch-checklist-phase5-update.md (A)
```

## デグレ防止検証

- Phase 0: 全ファイル md5 スナップショット
- 変更は `docs/LAUNCH-CHECKLIST.md` + 実装レポートのみ
- 自己判断による追加変更: 0 件（Issue 本文の完成形フェンスをそのまま適用）

## 動作確認

- Markdown 構造: Phase 5 → … → Phase 12 → Recon 運用ルール → Track B（+ B-Lang）→ メトリクス
- 旧 `?lang=xx` 前提の Phase 5 記述は除去済み
- Issue F1（#25）完了済みである旨を Phase 5 方針に明記

## 実装過程での気づき

- Recon セクションの Issue 完成形は先頭に `---` を含むため、既存の Track B 直前セパレータと二重にならないよう 1 つに正規化した（内容は同一）

## 後続への影響

- Issue F2 は本 Phase 5 記述を正本としてサブディレクトリ方式で起票可能
- Phase B-Lang が Track B の明示スコープになった
- 100 行超 Issue での Recon 推奨が CHECKLIST 上も参照可能

## 残課題・申し送り

- なし（F2/F3 の URL は起票後に記入）
