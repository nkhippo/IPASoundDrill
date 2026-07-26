---
created: 2026-07-15 22:00:00+09:00
project: IPASoundDrill
sources:
- 'PR #62: docs/recon-index-html-ui-audit ブランチ (2026-07-15)'
- docs/cursor/recon/pre-issue-recon-20260716-index-html-dom-structure.md
- docs/cursor/recon/pre-issue-recon-20260716-index-html-functions.md
- docs/cursor/recon/pre-issue-recon-20260716-index-html-i18n-css-storage.md
- docs/cursor/recon/pre-issue-recon-20260716-data-ui-gas-halfbaked.md
- docs/SPECIFICATION.md (2026-07-10)
- docs/DESIGN.md (2026-07-10)
- docs/PURPOSE.md v3.24
- CLAUDE.md
status: wip
summary: 'Phase 0 段階 2 の成果物。Recon (PR #62、4 ファイル) と SPEC/DESIGN/PURPOSE/CLAUDE.md
  の突合結果を、A/B/C/D/E の 5 カテゴリで整理。SPEC/DESIGN 修正 Issue の起票根拠および open-questions.md への回付元。'
tags:
- ipasounddrill
- phase-0
- stage-2
- doc-impl-audit
title: IPA Sound Drill - Phase 0 段階 2 - SPEC/DESIGN ↔ 実装 突合レポート
type: knowledge
updated: 2026-07-16 02:00:00+09:00
id: pj-2026-07-16-2a5f
aliases:
- pj-2026-07-16-2a5f
---

## Summary

Phase 0 段階 2 (SPEC/DESIGN ↔ 実装の突合) の成果物。Recon (Issue #61 / PR #62) の 4 ファイルから抽出された「実装ベースの真実」を、以下の 5 カテゴリで整理。

- **カテゴリ A**: 未反映 (Impl has, Docs missing) — SPEC/DESIGN に追記すべき
- **カテゴリ B**: 未実装 (Docs has, Impl missing) — Docs 側から削除 or 実装
- **カテゴリ C**: 乖離 (Docs ≠ Impl 値・挙動が異なる) — どちらが正か判断
- **カテゴリ D**: 中途半端 (Data/Logic✓ UI✗) — UI/UX 見直しで拾うか判断
- **カテゴリ E**: 意図的凍結 (Frozen intentional) — 既に文書化済み、明示のみ

Priority 定義:
- **P0**: ローンチ体験に直接影響、Phase 0-1 で解決必須
- **P1**: ローンチ品質に影響、Track A 中に解決
- **P2**: Track A/B 判定案件、中長期
- **P3**: 資料整合性のみ、緊急性低

## カテゴリ A: 未反映 (Impl has, Docs missing) — SPEC/DESIGN 追記候補

| # | 項目 | Priority | Recon 出典 | 追記先 |
|---|---|---|---|---|
| A-1 | 正本ファイル名: `src/index.template.html` (ルート `index.html` は F2 以降存在せず、build で `/{lang}/index.html` 生成) | P0 | dom §主ソース | SPEC 全体、CLAUDE.md、REPOSITORY-STRUCTURE.md (一部完了済) |
| A-2 | `S.cefrLevels: Set<string>` (Mode A/B 共通フィルタ) | P1 | functions §C | SPEC §5.4 |
| A-3 | `MODEB_SESSION = {newCount:10, reviewCount:10}` | P1 | functions §C | SPEC §5.5 or §2.5 |
| A-4 | `MODEB_BAND_UNLOCK_RATIO = 0.6` | P1 | functions §C | DESIGN §2.4 or SPEC §2.5 |
| A-5 | `PREFETCH = {warmChunk:6, warmParallel:2, bodyParallel:3}` (SPEC §2.3b の 6/5 と別次元の並列度指定) | P2 | functions §C | SPEC §2.3b |
| A-6 | `TRAPSET = θ ð æ ʒ ɝ` (5 音素、SPEC "trap sounds" フォーカスの具体定義) | P2 | functions §C | SPEC §2.3 or DESIGN §1.1 |
| A-7 | localStorage `va-disable` (Vercel Analytics オプトアウト) | P2 | i18n-css §C.2 | SPEC §5.3 |
| A-8 | `#siteFooter` (Feedback / Terms / Privacy / X) + `body.in-play` で非表示制御 | P1 | dom §Shell | SPEC §4.0 or 新設 §4.9 Footer |
| A-9 | `#audioHint` (TTS 促し、`role="status"`) + `audioHintText()` ロジック | P2 | dom §Shell, i18n-css §A.3 | SPEC §4.6 or §5.2 |
| A-10 | Exit Yes = **setup 復帰** (`goToTop(true)`) — SPEC §2.3b の "summary へ遷移" と異なる | P0 | dom §B、halfbaked | SPEC §2.3b 修正 (実装が正) |
| A-11 | `focus=weak` 時 SRS 重み **25/55/余** (通常 40/40/余の変則) | P1 | functions §D | DESIGN §1.4 |
| A-12 | Cold start (hist<3) は A1 音節ソート + shuffle + slice、40/40/20 スキップ | P2 | functions §D | DESIGN §1.4 |
| A-13 | `frequencyWeight` mode 定義: Mode B→`"l"`, Encode→`"e"`, else `"d"` | P2 | functions §D | DESIGN §1.4 or SPEC §5.4 |
| A-14 | 定数群 `LS_TTS_PREFIX = "ipa_tts_v2:"`, TTS キー形 `ipa_tts_v2:{ga\|rp}:{slug}` + 連結 `p4_`、弱形 `weak_` prefix、Legacy migration | P2 | i18n-css §C.3 | SPEC §5.3 |
| A-15 | i18n leaf 実測 **182** (SPEC/CLAUDE 記載 "177" と +5 の乖離) | P3 | i18n-css §A.0 | SPEC §6 or CLAUDE.md |
| A-16 | i18n build-only キー: `meta.title`, `meta.description`, `meta.ogTitle`, `meta.ogDescription` (`scripts/build-i18n-html.js` のみ参照) | P3 | i18n-css §A.0 | SPEC §6 |
| A-17 | `#exitConfirmModal` の Backdrop / scrim 実装、Escape キー **未対応** | P1 | dom §D | SPEC §4.7 追記 (実装が正) |

**主要 SPEC/DESIGN 修正 Issue の粒度**: A-1 〜 A-17 を 1 Issue に纏められる (すべて docs-only、パターン B)。ThinkGrindAi 準拠に寄せるなら、Phase 0 段階 3 で分割する前提で、まずは既存 SPEC/DESIGN に追記する Issue を先行。

## カテゴリ B: 未実装 (Docs has, Impl missing) — 削除 or 実装判断

| # | 項目 | Priority | Recon 出典 | 判断 |
|---|---|---|---|---|
| B-1 | `#cardModeBQuiz` (SPEC §4.5): 実装は `#cardModeBMcq` + `#cardModeBDict` に分割 | P1 | dom §A | SPEC 修正 (実装が正、命名を分割形に統一) |
| B-2 | Mode B Band UI (SPEC §2.5 相当、DESIGN §2.4 相当): DOM 完全欠落、`refreshVocabBandUnlock` 呼び出し 0 | P0 | halfbaked §1.3 | **open-questions 回付** (UI 復活 vs CEFR 流用) |
| B-3 | ブランドサブタイトルノード (SPEC §4.0): DOM に無し (「エッセンス + ブランド」の副見出しが未実装) | P1 | dom §B | SPEC 修正 (実装が正) or 実装追加 (デザイン刷新の一環) |
| B-4 | トップバー meter 要素 (SPEC §4.0): CSS `.meter` 存在するが body にノードなし。進捗は各カード `#*No` (`setCardCefr`) | P2 | dom §B | SPEC 修正 (実装が正、meter は各カード内) |
| B-5 | `#cefrNote` (SPEC §4.1): DOM 存在するが JS 書込ゼロ | P2 | halfbaked §1.2 | **open-questions 回付** (削除 vs 実装) |
| B-6 | i18n `reveal.respell_label` (SPEC §4.6): respell 表示ラベルとして予定されたが未表示 | P1 | halfbaked §2 | **open-questions 回付** (respell 表示方針) |
| B-7 | i18n `modeb.band.label / note`, `modeb.pool`: Mode B Band UI 用に予約された i18n。orphan | P0 | halfbaked §1.3, i18n-css §A.2 | B-2 と連動 (open-questions 回付) |
| B-8 | i18n `lvl.b2`, `lvl.c1`: CEFR B2/C1 ピル用のキーだが、ピル DOM が A1/A2/B1 のみ | P0 | halfbaked §1.2 | **open-questions 回付** (B2 到達性、C1 拡張) |
| B-9 | i18n `set.label`, `set.daily_t/d`, `set.phonics_t/d`: 旧 Question set UI の残骸 | P3 | i18n-css §A.2 | 削除推奨 (単純クリーンアップ) |
| B-10 | i18n `hint.syl/first/pos`, `syl`, `syl_pl`: `.hints{display:none}` 死コードと対応 | P3 | i18n-css §A.2, halfbaked §3 | 削除推奨 |
| B-11 | i18n `lead_html`, `lead_connected_html`, `lead_weak_html`, `modeb.lead_html`: Setup 上部リード文の予約枠、未配線 | P2 | i18n-css §A.2 | **open-questions 回付** (トップページ設計と関係、目的ファースト UI と統合) |
| B-12 | i18n `meter_done`, `summary.again`: 旧メーター/summary UI の残骸 (`#againBtn` は `back_top` に変更済み) | P3 | i18n-css §A.2 | 削除推奨 |
| B-13 | i18n `lvl.pool`: CEFR プール件数表示、未配線 | P3 | i18n-css §A.2 | 削除 or 復活 (UI 判断) |
| B-14 | i18n `meta.keywords`: SEO meta keywords、実装未使用 | P3 | i18n-css §A.2 | 削除 (現代 SEO で無効) |

**削除 vs 復活の判断**: B-9, B-10, B-12 は削除推奨 (旧 UI 残骸)。B-2, B-5, B-6, B-7, B-8, B-11 は UI/UX 再設計と関わるため open-questions に回付。

## カテゴリ C: 乖離 (Docs ≠ Impl) — どちらが正か判断

| # | 項目 | Priority | Recon 出典 | 判断 |
|---|---|---|---|---|
| C-1 | Exit Yes の遷移先: SPEC は summary、実装は setup 復帰 (A-10 と同) | P0 | dom §B、halfbaked | **実装が正、SPEC 修正** (退出後の再開ではなく setup からの再選択が実際の UX) |
| C-2 | Mode B の CEFR ピル露出: SPEC §2.5 では「Mode B は Band 自動制御」だが、実装では Mode B でも CEFR ピル複数選択が有効 | P0 | dom §C、halfbaked §1.2 | **open-questions 回付** (Mode B の情報階層設計、UX 課題 C-8 と重複) |
| C-3 | `#modalOverlayExit` の挙動: SPEC §4.7 だと Escape 対応記載なし、実装も未対応。ただし現代の modal 慣習では Escape 対応が期待される | P2 | dom §D | **open-questions 回付** (Escape 対応追加の要否) |
| C-4 | `body.scroll-locked`: SPEC §4.8b では vocab で言及、実装は Decode / Mode B Dict の入力 focus 時のみ (`lockInputScroll`) | P3 | dom §D | SPEC 修正 (実装が正) |
| C-5 | Setup メーター (Number/Total): SPEC §4.0 でトップバーに meter 記載、実装は各カード内 (`#dNo`, `#eNo`, `#mbSNo` 等) | P2 | dom §B | SPEC 修正 (実装が正) |
| C-6 | `PREFETCH.warmChunk=6` (実装) vs SPEC §2.3b の 6 プリフェッチ + 5 リフィル: 別次元の指定 (プリフェッチ数 vs 並列度) だが SPEC 読者に混乱の可能性 | P2 | functions §C, SPEC §2.3b | SPEC §2.3b 明確化 (プリフェッチ数と並列度を分離記述) |
| C-7 | `applyI18n` の言語一覧: SPEC は 6 言語 (ja/en/ko/zh-Hans/zh-Hant/fil)、実装 `SUPPORTED_LANGS` も 6 言語 一致 ✓ | — | functions §C | 一致 |
| C-8 | `#cardModeBQuiz` (SPEC §4.5) vs `#cardModeBMcq` + `#cardModeBDict` (実装) | P1 | dom §A | B-1 と同 (SPEC 修正) |

## カテゴリ D: 中途半端 (Data/Logic✓ UI✗) — UI/UX 見直しで拾うか判断

これらは Naoya さんの追補 (`data-ui-gas-halfbaked.md`) の抜粋。**すべて open-questions.md に回付し、UX 課題整理シートにも反映**。

| # | 項目 | Priority | Halfbaked ラベル | Recon 出典 |
|---|---|---|---|---|
| D-1 | **B2 = 899 語ランタイム収録、Setup CEFR ピル A1/A2/B1 のみ** | P0 | Data✓ UI✗ | halfbaked §1 |
| D-2 | **Mode B Band UI + `refreshVocabBandUnlock` 死コード** | P0 | Logic✓ UI✗ | halfbaked §1.3 |
| D-3 | Respell (`respell_ga/rp` 5,322 語) 読込ずみ・reveal 未描画 | P1 | Data✓ UI✗ | halfbaked §2 |
| D-4 | Connected の `cefr` フィールド (201 句、A1-B2 分布) がフィルタ未使用 (現行は level + type) | P1 | Data✓ UI✗ | halfbaked §2 |
| D-5 | Connected TTS: GAS は `accent` 受けるが SPA は `phrase=…&accent=ga` 固定 (RP 連結 TTS 未対応) | P1 | GAS✓ SPA◐ | halfbaked §4 |
| D-6 | `neighbors_rp = 0`、`ipa_actual_rp = 0`: RP narrow IPA + neighbor 空、GA へフォールバック | P2 | Data◐ UI◐ | halfbaked §2 |
| D-7 | `cs_rule` が en/ja/fil のみ、ko/zh-* 欠落 → en フォールバック | P2 | Data◐ UI◐ | halfbaked §2 |
| D-8 | C1: `lvl.c1` i18n あり、ランタイム CEFR に C1 なし (`data/batches/gap_c1_new.json` 1,015 候補) | P2 | Pipeline✓ Runtime✗ | halfbaked §1.5 |
| D-9 | Reflect dock (`#reflectDock`) 常時 hidden・配線あり | P3 | Logic✓ UI✗ | halfbaked §3 |
| D-10 | hints (`.hints{display:none}`) | P3 | 死コード | halfbaked §3 |
| D-11 | vocabFilters (`#vocabFilters` display:none + 空) | P3 | UI 殻 | halfbaked §3 |
| D-12 | `#cefrNote` DOM のみ・JS 書込ゼロ | P3 | UI 殻 | halfbaked §1.2, B-5 と重複 |
| D-13 | GAS `voice`, `speed`, `instr_variant` パラメータ: SPA 未使用、A/B テストページのみ | P3 | GAS✓ SPA✗ | halfbaked §4 |
| D-14 | `BatchWarm.gs` 暖機ループが GA 固定 (RP は別経路) | P3 | GAS◐ | halfbaked §4 |
| D-15 | i18n missing 1 `audio_tap_hint` → 英語フォールバック固定 | P2 | Missing | i18n-css §A.3 |
| D-16 | 一部インライン style (Mode B heads): デザイントークン化されていない | P3 | 一貫性 | i18n-css §D.6 |

## カテゴリ E: 意図的凍結 (Frozen intentional) — 現状維持を明示

| # | 項目 | 状態 | Recon 出典 |
|---|---|---|---|
| E-1 | Mode B Quiz UI: `MODEB_QUIZ_ENABLED=false`、`#cardModeBMcq/Dict` + `buildModeBQueue` 温存 (SPEC §2.5 記載通り) | 明示済み | dom §A, halfbaked §1.4 |
| E-2 | `ga_rp_same` フラグ: 全語で GA/RP IPA が同一な語の highlight | 明示済み | functions §A (`altAccentValue`) |
| E-3 | gloss `zh-Hans` / `zh-Hant` キーが JSON にないが `gloss.zh` にフォールバックしている点 (簡繁同一ソース、Track A の意思決定) | 明示済み | halfbaked §2 |

## 要 Issue 起票候補

### Issue X-1: SPEC/DESIGN reconciliation (Category A + B/C の削除・修正)

- **改修分類**: L1 / C1 (Docs / 内容更新) / パターン B (既存編集)
- **範囲**: Category A-1〜A-17、Category B-1・B-3〜B-14 (open-questions 回付分を除く)、Category C-1・C-4〜C-8
- **推定サイズ**: SPEC 修正 5-8 セクション、DESIGN 修正 1-2 セクション、削除 i18n キー 5-8 個
- **前提**: open-questions.md での判断が必要な項目 (B-2, B-5, B-6, B-7, B-8, B-11, C-2, C-3) は本 Issue から除外し、判断確定後に別 Issue で扱う

### Issue X-2 以降: UX/データ判断が必要な項目 (open-questions 経由)

Category D 全項目 + Category B/C の open-questions 回付分。Phase 1 (Claude Design プロトタイプ探索) と並行する UX 議論 Issue として扱う。

## 段階 3 (記載粒度の刷新、ThinkGrindAi 準拠) との関係

- 本レポートは SPEC/DESIGN の「単一ファイル前提」で書かれている。
- 段階 3 で `docs/requirements/<topic>.md` + `docs/specification/<topic>.md` へ分割する際は、本レポートの各修正候補を topic ごとに再配置。
- Issue X-1 は段階 3 の前に完了させ、正本を最新化してから分割するのが安全。
