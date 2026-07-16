---
id: pj-2026-07-12-7479
aliases:
- pj-2026-07-12-7479
title: i18n meta objects — 実装レポート
created: '2026-07-12'
---

# i18n meta objects — 実装レポート

## 関連 Issue / PR

- Issue: #25
- PR: #27

## Issue 背景（Issue 本文から要約）

SEO 基本セット（Issue F）を F1/F2/F3 に分割する方針のもと、F1 として 6 言語分の `meta` オブジェクトを追加する。Naoya さん要望により ko/zh-Hans/zh-Hant/fil は日本語の直訳ではなく各言語圏の検索語彙・言い回しに合わせたコピーとした。本データは後続 Issue F2 が `document.title` / description / OGP 等へ消費する。

## 実装内容

- `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` の `brand` 直後に `meta`（`title` / `description` / `ogTitle` / `ogDescription` / `keywords`）を追加
- `zh-Hans` の description は JSON 安全のため「中式英语」を鉤括弧「」で表記（Issue 注意書きに準拠）
- `fil.json` はキー順が他言語と異なるため、`brand` 直後挿入を優先（`lead_html` は隣接しない）

## 変更ファイル

```
- i18n/en.json (M)
- i18n/ja.json (M)
- i18n/ko.json (M)
- i18n/zh-Hans.json (M)
- i18n/zh-Hant.json (M)
- i18n/fil.json (M)
- docs/cursor/reports/cursor-implementation-report-i18n-meta.md (A)
```

## デグレ防止検証

- Phase 0: 対象 6 ファイル + 全ファイル md5 スナップショット
- Phase 1: meta 追加のみ（既存キー変更なし）
- Phase 2: 対象 6 ファイルのみ差分、他ファイル不変
- Phase 3: 6 ファイルすべて `json.load` OK。`validate_i18n.py` の [A] キー集合は en=182（+meta 5 leaf）で全言語一致
- 自己判断による追加変更: 0 件

## 動作確認

- JSON 構文: 6/6 OK
- 挿入位置: 全ファイルで `brand` の次キーが `meta`
- `python3 tools/validate_i18n.py`: [A][B] 通過。ERROR [D] `t("woff2")` は **本 Issue 以前から存在する既知エラー**（stash 前後で再現）。本変更の回帰ではない
- `index.html` 未変更（meta 消費は Issue F2）

## 実装過程での気づき

- `fil.json` のトップレベルキー順は他言語と異なり、`brand` と `lead_html` が隣接していない。完了定義の「brand 直後」を全言語で満たす形で挿入した
- `validate_i18n.py` の [D] は `index.html` 内の `t("woff2")` 誤検出（フォントパス文字列の可能性）で、i18n meta 追加とは無関係

## 後続への影響

- Issue F2 が本 `meta` を参照して SEO / OGP / Twitter Card を実装可能
- ko/zh/fil はネイティブ未校閲。ローンチ後フィードバックで差分修正可

## 残課題・申し送り

- Issue F2: `index.html` での meta 消費
- （任意）`validate_i18n.py` の `t("woff2")` 誤検出の修正は別 Issue
