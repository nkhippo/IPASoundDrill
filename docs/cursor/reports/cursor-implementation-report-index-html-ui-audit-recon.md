---
id: pj-2026-07-15-b4c8
aliases:
- pj-2026-07-15-b4c8
title: index.html UI/UX audit Recon — 実装レポート
created: '2026-07-15'
---
# index.html UI/UX audit Recon — 実装レポート

## 関連 Issue / PR

- Issue: #61
- PR: #62

## Issue 背景（Issue 本文から要約）

UI/UX 抜本見直し Phase 0 の基盤 Recon。ルートに巨大 `index.html` は無くなったため、正本 `src/index.template.html`（生成物 `/{lang}/index.html`）を機械抽出し、Claude が SPEC/DESIGN 突合（段階 2）に使える 3 分割レポートを追加する。コード変更禁止。

## 実装内容

### Phase A: Recon ファイル

1. `docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md` — DOM / トップバー / Setup / モーダル  
2. `docs/cursor/recon/pre-issue-recon-20260716-index-html-functions.md` — 関数 / ハンドラ / `S` / 適応出題  
3. `docs/cursor/recon/pre-issue-recon-20260716-index-html-i18n-css-storage.md` — i18n / CSS vars / LS / SPEC・DESIGN 差分  
4. `docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md` — **データ↔UI↔GAS の中途半端棚卸し**（B2 未選択・Band 死コード・respell 未表示等）  

### Phase B: Category A 意図的更新

- `docs/REPOSITORY-STRUCTURE.md` — Task history / ディレクトリツリーに `docs/cursor/recon/`  
- `docs/DOCUMENT-MAP.md` § Category E — `docs/cursor/recon/` を追記  
- `docs/cursor/README.md` — recon/ 行を索引に追加（ナビ整合）

## 変更ファイル

```
- docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md (A)
- docs/cursor/recon/pre-issue-recon-20260716-index-html-functions.md (A)
- docs/cursor/recon/pre-issue-recon-20260716-index-html-i18n-css-storage.md (A)
- docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md (A)
- docs/REPOSITORY-STRUCTURE.md (M)
- docs/DOCUMENT-MAP.md (M)
- docs/cursor/README.md (M)
- docs/cursor/reports/cursor-implementation-report-index-html-ui-audit-recon.md (A)
```

## デグレ防止検証

- `src/index.template.html` md5: **不変**（開始前後 `4be324de0bd70260e8e60855cbf1e19c`）
- Runtime data / i18n / wordlist: 未変更
- 3 Recon ファイル各 **&lt; 20 KB**（合計 ~18 KB）

### 重要な発見（段階 1–2 向け）

- ルート `index.html` は F2 以降未配置。正本は template / `/{lang}/`  
- Mode B Quiz DOM 残存、`MODEB_QUIZ_ENABLED=false`  
- Mode B Band UI 無し（CEFR ピル流用）＋ **`refreshVocabBandUnlock` 呼び出し 0**  
- **B2=899 語はランタイムに在るが Setup ピル無し → 出題到達不可**（Vocab 閲覧のみ）  
- respell 5,322 語読込・未表示／Connected `cefr` 未フィルタ／連結 TTS GA 固定  
- i18n orphan 22 / missing 1（`audio_tap_hint`）  
- Undocumented: footer 法務、`va-disable`、`#audioHint`、死コード Reflect dock  

## 動作確認

- 静的: セクション A–D 揃い、サイズ制限クリア、テンプレート未改変  
- 動的: 対象外（docs-only）  

## Complexity Retrospective (完了時点検)

### 事前分類 vs 実際
- 事前 Complexity Level: L1  
- 実装後の妥当性判定: 妥当  
- 判定根拠: 新規 Recon + Category A の recon 索引追記のみ。アプリコード不変。

### 事前 Change Pattern vs 実際
- 事前 Pattern: C1  
- 実装中に追加 Pattern: なし（REPOSITORY-STRUCTURE / DOCUMENT-MAP は Issue 指定の意図的 C1）

### 構造・契約への影響点検
- [x] Runtime data contract 影響なし  
- [x] i18n schema 影響なし  
- [x] URL / ビルド影響なし  
- [x] Category A: REPOSITORY-STRUCTURE / DOCUMENT-MAP のみ意図的更新  
- [x] `src/index.template.html` 不変  

### Phase 分割
- Phase A Recon → Phase B map 更新 → Phase C 本レポート  
- 相互依存なし  

### 総合判定
- [x] 事前分類妥当、PR 作成可  
- [ ] Level 昇格提案  
- [ ] Pattern 追加提案  

### 不明点（Issue で中断すべきではなかった判断）
- ルート `index.html` 欠如 → テンプレートを正本として明示し継続（仕様どおり F2 構成）
