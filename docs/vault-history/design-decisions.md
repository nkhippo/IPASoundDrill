---
created: 2026-07-16 02:00:00+09:00
project: IPASoundDrill
status: living
summary: IPA Sound Drill の主要な設計意思決定の履歴。UI/UX 抜本見直し (2026-07-15 kickoff、案 γ) に伴う decision を主軸に、Track A / Track B の判定、SPEC/DESIGN の修正方針、UX ロードマップの分岐点を記録する。open-questions.md で確定した項目はここに移送される。
tags:
  - ipasounddrill
  - design-decisions
  - track-a
  - track-b
title: IPA Sound Drill - Design Decisions
type: knowledge
updated: 2026-07-24T18:59:34+09:00
id: pj-2026-07-16-c084
aliases:
  - pj-2026-07-16-c084
version: "3.8"
---

## Summary

IPA Sound Drill プロジェクトの主要な設計意思決定を時系列 + トピック別に記録。**判断根拠と却下された選択肢** を残すことで、後日「なぜこう決めたか」を追跡できるようにする。

参照:
- `docs/PURPOSE.md` v4.0 (source of truth)
- `CLAUDE.md` (Track A/B の位置づけ、SEO 施策)
- `30_projects/IPASoundDrill/open-questions.md` (判断待ち事項)
- `30_projects/IPASoundDrill/design/phase-0-stage-2-doc-impl-reconciliation.md` (段階 2 差分レポート)
- `docs/design/phase-1/screen-data-mapping.md` (Phase 1-0-b Recon 成果物、PR #80)

## 2026-07-15: UI/UX 抜本見直し kickoff の合意

- **kickoff log**: `30_projects/IPASoundDrill/logs/2026/07/2026-07-15-ui-ux-redesign-kickoff.md`
- **進行方針**: 案 γ (要件確定 → Claude Design 探索 → Track A/B 判定)
- **Phase 0 段階分割**: 段階 1 (裏改修の吸収) → 段階 2 (SPEC/DESIGN 突合) → 段階 3 (記載粒度の刷新、ThinkGrindAi 準拠)
- **判断 A (index.html Recon)**: 案 α (Cursor に Recon Issue を先行起票) を採用 → Issue #61、PR #62、Naoya さん追補で 4 ファイル目 (Halfbaked 棚卸し) 追加

## 2026-07-15: open-questions Q-1〜Q-11 の判断

### Q-1: CEFR B2 到達性 → Q-1-A (B2 ピルを Setup に追加)

- **決定**: Setup 画面の CEFR ピルに B2 を追加、Mode A / Mode B の練習セッションで B2 到達可能に
- **却下された案**:
  - Q-1-B (Vocab 閲覧専用): データ 899 語の資産を活かせず、B1 卒業した学習者を取り逃す
  - Q-1-C (Track B へ): B2 データが実装済みなのに後回しは資産の無駄
- **含意**:
  - i18n `lvl.b2` は既存キーを配線するのみ (実装コスト小)
  - `#cefrB2` の DOM 追加、`S.cefrLevels` の初期値・遷移ロジック更新
  - `#cefrNote` (現状死コード) の復活を **Issue X-2 起票時に判断**。B2 追加時に「B2 は上級者向け、A2/B1 と併選推奨」等の note 表示に流用可能
- **紐付く Issue**: **Issue X-2 (B2 CEFR ピル追加、実装)**
- **紐付く UX 課題**: シート C-1 (設定パラメータ多階層) が更に High へ

### Q-2: Mode B の情報階層 → 保留 (Phase 1 で決定)

- **決定**: **Naoya さんは仕様にこだわりなし、UI/UX 検討で見直してもよい**
- **意味**: Q-2-A (Band UI 復活) / Q-2-B (CEFR 流用に正式化) / Q-2-C (混合方式) のいずれも Phase 1 (Claude Design プロトタイプ探索) で決定する
- **含意**:
  - PURPOSE.md `docs/PURPOSE.md` の Mode B 説明 (バンド段階解放) は柔軟に見直し対象
  - Recon で発覚した `refreshVocabBandUnlock` 死コード / `MODEB_BANDS` / `MODEB_BAND_UNLOCK_RATIO=0.6` / `modeb.band.*` i18n の扱いは Phase 1 決定まで保留
  - Phase 1 で Claude Design に「Band UI 復活案」「CEFR 流用案」の 2 プロトタイプを作らせて比較 (Q-2-C の混合方式は 3 案目として検討)
- **紐付く UX 課題**: シート C-2 (Mode A/B 意味階層)、C-8 (CEFR 露出深度)、N-3 (目的ファースト UI) と統合議論

### Q-3: C1 拡張のスコープ → Q-3-B (Track B で扱う)

- **決定**: C1 語彙 1,015 語候補 (`data/batches/gap_c1_new.json`) の投入は Track B (React 化以降)
- **却下された案**:
  - Q-3-A (Track A で取り込む): 時間軸圧迫、データ品質検証が別次元の作業
  - Q-3-C (見送り): B2 到達性 (Q-1-A) 解決で「上級者向けエントリー」は当面カバー
- **含意**:
  - i18n `lvl.c1` は Track B まで **orphan として維持** (削除しない)
  - `docs/reference/c1-expansion-scope-design.md` (ドラフト) は Track B のロードマップ資料として保管
  - Track B の初期タスク候補: (a) C1 gap 1,015 語の gloss 6 言語生成、(b) IPA + neighbors 補完、(c) SPEC/DESIGN の CEFR 章に C1 追記
- **紐付く Issue**: Track B ロードマップ (未整備) にエントリー追加

### Q-4: Respell 表示方針 → Q-4-B (Reveal のみ表示)

- **決定**: `respell_ga` / `respell_rp` (5,322 語収録) は **Reveal 画面のみで表示**、Vocab は既存 UI 維持
- **却下された案**:
  - Q-4-A (Reveal + Vocab): Vocab は音声で確認する運用と分ける
  - Q-4-C (削除): 5,322 語の資産が無駄
  - Q-4-D (条件付き表示): UI 複雑度上げすぎ
- **含意**:
  - i18n `reveal.respell_label` (現状 orphan) の配線
  - Reveal 画面の情報密度が上がるため、既存の narrow IPA / alt accent / neighbors の表示レイアウトと調整必要
  - Phase 1 (Claude Design) の Reveal 画面プロトタイプで確認
- **紐付く Issue**: **Issue X-3 (Respell Reveal 表示、実装)**

### Q-5: Connected の CEFR フィルタ → Q-5-B (level のみに固定、SPEC 明記)

- **決定**: Connected phrase の CEFR フィールドは **内部データとして保持し、フィルタ UI には出さない**。SPEC に「Connected は L1-L3 + type のみ」と明記
- **却下された案**:
  - Q-5-A (CEFR フィルタ追加): 201 句のみで CEFR 絞り込みメリット薄
  - Q-5-C (Words の CEFR 選択と自動連動): 内部連動で学習者から見えづらい
- **含意**:
  - Connected の `cefr` フィールドは data schema に保持
  - SPEC §4.1 (Connected filters) の記述を「L1-L3 + type のみ」と明確化
  - 将来分析・UI 拡張の可能性は残す
- **紐付く Issue**: **Issue X-1 (SPEC/DESIGN reconciliation)** に含める

### Q-6: RP TTS 連結 → Q-6-B (Track B で扱う)

- **決定**: Connected phrase の RP TTS 対応は Track B (React 化以降) で扱う。Track A では GA 連結のみ
- **却下された案**:
  - Q-6-A (Track A で対応): GAS 側の暖機・キャッシュ設計込みで範囲外
  - Q-6-C (警告 UI): UI 汚染
- **含意**:
  - SPA の `phrase=…&accent=ga` 固定は Track A では維持
  - `BatchWarm.gs` の GA 固定も Track A では維持
  - Track B の初期タスク候補: (a) SPA を `accent` 動的送信に変更、(b) GAS `BatchWarm.gs` の RP ループ追加、(c) RP 連結音声の Drive 在庫確認
  - SPEC/DESIGN に「Connected TTS は GA のみ (Track A)」と明記
- **紐付く Issue**: Issue X-1 に SPEC 明記を含める、Track B ロードマップにエントリー

### Q-7: cs_rule の ko/zh 対応 → Q-7-A (3 言語追加)

- **決定**: Connected phrase の `cs_rule` を ko / zh-Hans / zh-Hant の 3 言語に翻訳追加
- **含意**:
  - 翻訳作業のみのため Cursor + LLM 依頼で実施 (Naoya さん目視レビュー要否は Issue 起票時に判断)
  - 201 句 × 3 言語 = 翻訳作業量は限定的
  - `csRuleText` の JS 実装は変更不要 (既に `LANG` 直参照でフォールバック挙動あり、翻訳が入れば自動的にネイティブ表示)
- **紐付く Issue**: **Issue X-6 (cs_rule 3 言語追加、データ)**

### Q-8: 死コード削除の方針 → Q-8-C (個別判断)

- **決定** (Q-11-C との整合含む):
  - `#reflectDock` → **削除** (Q-11-C 決定に従う、UX 課題 N-3 の目的ファースト UI で完結)
  - `.hints{display:none}` + `hint.*` i18n → **削除**
  - `#cefrNote` → **当面削除**、Issue X-2 (B2 CEFR ピル追加) 起票時に復活可能性を再評価 (B2 note に流用の可能性)
  - `#vocabFilters` → **削除**
- **含意**:
  - i18n orphan 22 のうち、`reflect.btn`, `hint.*`, `syl`, `syl_pl`, `set.*`, `lvl.pool` 等が削除対象
  - DOM 削除は `src/index.template.html` の該当セクション削除
  - Cursor 実装レポートに md5 変化を記録
- **紐付く Issue**: **Issue X-5 (死コード削除、docs+impl)**

### Q-9: モーダル Escape キー対応 → Q-9-A (3 モーダルすべて対応)

- **決定**: `#exitConfirmModal`, `#settingsModal`, `#guideModal` すべてに Escape キーで閉じる挙動を追加
- **却下された案**:
  - Q-9-B (実装維持): アクセシビリティで劣後
  - Q-9-C (一部のみ): 一貫性がない
- **含意**:
  - `keydown` リスナー 3 箇所追加
  - Exit modal は「Escape → No 相当 (キャンセル、練習継続)」の挙動
  - Settings / Guide modal は「Escape → 閉じる」
  - SPEC §4.7 に Escape 対応の記述を追加
- **紐付く Issue**: **Issue X-4 (モーダル Escape 対応、実装)**

### Q-10: Undocumented UI の SPEC 記載方針 → Q-10-B (暫定追記、段階 3 で分割前提)

- **決定**: 実装存在で SPEC 未記載の要素 (`#siteFooter`, `#audioHint`, `va-disable` LS 等) を、現行 SPEC の該当章に暫定追記。段階 3 (ThinkGrindAi 準拠の topic 分割) で `docs/specification/<topic>.md` に再配置
- **却下された案**:
  - Q-10-A (SPEC に新セクション追加): 段階 3 で再配置するので二度手間
  - Q-10-C (記載しない): 監査・保守性を落とす、`va-disable` は特にプライバシー観点で記載必須
- **含意**:
  - Issue X-1 (SPEC/DESIGN reconciliation) に含める
  - 段階 3 で `docs/specification/footer.md`, `docs/specification/tts-and-audio-hint.md`, `docs/specification/privacy-and-analytics.md` 等に分割する前提
- **紐付く Issue**: Issue X-1

### Q-11: 目的ファースト UI と Reflect dock の統合設計 → Q-11-C (Reflect dock 削除)

- **決定**: `#reflectDock` は削除、目的ファースト UI (UX 課題 N-3) で「振り返り」機能を完結
- **却下された案**:
  - Q-11-A (統合): 現行 Reflect dock は死コード、統合コストが Merit を上回らない
  - Q-11-B (分離維持): summary 後の別 UX として維持するには実装が薄すぎる (`showReflection` は summary で呼ばれるが実質的な振り返り機能は未実装)
- **含意**:
  - Q-8 の Reflect dock 削除を確定 (Q-8 の Claude 推奨「復活候補」は却下された)
  - 目的ファースト UI (Phase 1 Claude Design) で「振り返り」機能を再設計
  - i18n `reflect.btn` の削除も含む
- **紐付く Issue**: Issue X-5 (死コード削除)、Phase 1 (Claude Design ブリーフ)

## Issue 起票計画 (2026-07-15 判断確定)

計 6 つの Issue に分割。SPEC/DESIGN 修正は 1 本、実装 Issue は機能ごとに分ける。

| Issue ID | タイトル案 | Complexity | Change Pattern | 依存 | 判断根拠 |
|---|---|---|---|---|---|
| **X-1** | docs: SPEC/DESIGN reconciliation (段階 2 差分吸収) | L1-L2 | C1 | なし (先行) | 段階 2 の 60 項目のうち Category A/B/C の docs-only 修正を一括 |
| **X-2** | feat: CEFR B2 pill を Setup に追加 (Q-1-A) | L2 | C4 | X-1 後 | 実装 (impl + i18n 配線 + `#cefrNote` 再評価) |
| **X-3** | feat: Reveal 画面に respell 表示追加 (Q-4-B) | L2 | C4 | X-1 後、Phase 1 で位置確認 | 実装 (Reveal レイアウト調整含む) |
| **X-4** | feat: モーダル Escape キー対応 (Q-9-A) | L1 | C2 | 独立 | 実装 (`keydown` リスナー 3 箇所) |
| **X-5** | chore: 死コード削除 (Reflect dock / hints / cefrNote / vocabFilters + orphan i18n) (Q-8-C, Q-11-C) | L2 | C2+C1 | X-2 後 (cefrNote 判断待ち) | DOM 削除 + i18n orphan 削除 + SPEC 修正 |
| **X-6** | data: cs_rule を ko / zh-Hans / zh-Hant に翻訳追加 (Q-7-A) | L1 | C3 | 独立 | 翻訳データ追加 (Cursor + LLM) |

**起票順序**: X-1 → X-4 (並行) → X-2 → X-3 → X-5 → X-6 (並行) の順が安全。X-1 完了後は SPEC が最新化されているため、X-2〜X-5 の設計判断がクリーンになる。

**Track B ロードマップ入り**:
- C1 拡張 (Q-3-B)
- RP TTS 連結 (Q-6-B)
- respell の Vocab 展開 (Q-4-B の逆案、将来検討)
- Mode B Band UI 復活 (Q-2 で保留、Phase 1 の決定次第で Track A/B に振り分け)

## 段階 3 (ThinkGrindAi 準拠の粒度刷新) との関係

**Q-10-B** で「暫定追記」を選んだ根拠は、段階 3 で分割再配置する前提。段階 3 の作業スコープ:

1. IPA 版 `docs/DOCUMENT_GUIDELINES.md` の起草 (ThinkGrindAi 準拠、Track A/B 分離ルールの IPA 固有要素を追加)
2. `docs/TERMS.md` の新設 (Mode A / Mode B / Decode / Encode / Connected Speech / Weak forms / GA / RP / `ga_rp_same` 等の統一定義)
3. `docs/requirements/<topic>.md` と `docs/specification/<topic>.md` へ順次分割
4. `docs/design/` の新設 (color-palette / typography / layout 等、Phase 1 Claude Design 探索結果を受け止める)
5. `docs/ai-context/FILE_MAP.md` の新設
6. Vault `design-decisions.md` の位置づけ再確認 (IPA repo 側 `DESIGN_DECISION_HISTORY.md` と Vault 側の分担)

段階 3 の実行タイミング: Issue X-1 完了 (SPEC 最新化) 後、Phase 1 Claude Design 探索と並行。

## 未確定・監視事項

- **Q-2 の Phase 1 決定**: Mode B の情報階層 (Band UI 復活 vs CEFR 流用) は Claude Design プロトタイプの結果を見て決定
- **`#cefrNote` の最終処遇**: Issue X-2 (B2 追加) 起票時に「復活 (B2 note に流用)」vs「削除」を確定
- **UX 課題整理シートの再優先度化**: Q 判断確定を反映した v2 を並行更新
- **Phase 1 Claude Design ブリーフの起草**: Q-2 判断を待つ論点 (Mode B) と、Q-1-A/Q-4-B/Q-11-C を前提条件として書く

## 履歴

- 2026-07-15: kickoff、Q-1〜Q-11 判断確定、初版作成
- 2026-07-18 (1): Phase 1 UI/UX 実装前 UX 論点 7 件 (Q-2, Q-12〜Q-15, Q-20, Q-21) 確定
- 2026-07-18 (2): Phase 1-0-b Recon (PR #80) 結果反映、Q-16〜Q-19 確定 + Q-20 補足「11 統一」裁定


## 2026-07-18 (1): Phase 1 UI/UX 実装前 UX 論点 7 件の確定 (Q-2 + Q-12〜Q-15, Q-20, Q-21)

Phase 1-0-a (SPEC/DESIGN/PURPOSE 先行改訂) の Issue 起票前に、Naoya さんが `open-questions.md` の UX 論点 7 件をこの Chat セッションで確定。

### Q-2: Mode B の情報階層 → Q-2-B (CEFR 統一)

**決定**: Mode B の Band UI 復活案は却下、CEFR 統一で確定。Band ロジック・i18n キー・LocalStorage キーを削除。

**理由**:
- Phase 1 で確定した「CEFR は全モード横断・単語ごと・プロフィールで複数選択」と一致
- 4 主要ペルソナ (P-1 Working Professional, P-2 Strategist, P-3 CS Agent, P-4 Grad School Aspirant) がすべて自己駆動型で、Band UI の段階解放型ガイドは煩わしい
- Mode A/B の UI パラダイム統一 (認知負荷減)
- 死コード (`refreshVocabBandUnlock` 呼び出し 0) の解消

**影響**: SPEC/DESIGN §2.4、`MODEB_BANDS`, `MODEB_BAND_UNLOCK_RATIO`, `ept_vocab_band`, `refreshVocabBandUnlock`, i18n `modeb.band.*` / `modeb.pool` の削除

### Q-12: top カード #1 の名称ゆれ → α (top カード名に全統一)

**決定**: top カード側の名称「音の発音を確かめる」「発音から書いてみる」「音から単語を覚える」「連結する音に慣れる」を source of truth とし、ドリル本体・SPEC/DESIGN 全般に反映。

**理由**:
- 目的ファースト UI の原則は「目的 (ユーザー行動の意味) を表す」
- カード名は目的の言語化、ドリル名 (機能記述) は内部用語
- カード側を SoT にするのが `product-principles.md` と整合

**影響**: SPEC/DESIGN の drill セクション、i18n 全キー (drill title / heading)

### Q-13: 絞り込みボトムシート `3b` → 誤記のため resolve (独立 frame 不要)

**決定**: `(3b)` はデザインファイル内の誤記で、独立 frame として存在しない。セッション内絞り込みは各ドリル画面内のインライン扱い (静かなチップ) として実装。

**Claude Design 側の対応** (Naoya さん確認済み、2026-07-18):
- 設計判断まとめ「絞り込み — …(3b)」 → 「(3b)」削除
- イントロのチップ「絞り込みはセッション内(3b)で確定」 → 「(3b)」削除
- SP×English の「英語版トップは 4c(トップページ確定セクション)に掲載済み」 → 削除済みの旧 canvas ID「4c」を「『トップページ(確定)』セクション」に言い換え
- SP×English 見出しの「English drills (9a / 9c / 9d)」 → 内部整理用の ID 羅列を削除

**影響**: Phase 1-I として切り出していた作業は廃止。work-plan.md の 9 フェーズは 8 フェーズに縮小 (次回 work-plan 更新時に反映)。

### Q-14: EN/KO ドリル画面の frame → α (i18n キー追加のみ、実機確認で対処)

**決定**: JA モバイル 375px 実装を機械展開、EN/KO は i18n キー追加のみで足りる。Phase 1-D 完了後の実機確認でレイアウト崩れが出た時点で追加対応。

**理由**: JA 実装が多言語耐性を意識した設計 (`text-wrap:pretty`, `overflow-wrap:anywhere` 等)。KO 助詞の文字数増もチップ・ボタンの幅指定で吸収可能。

**影響**: Phase 1-G スコープに「実機確認 → 必要なら追加対応」の gate 追加

### Q-15: PC 版の残 3 ドリル → α (Pd の 2 ペイン構造を全ドリル共通適用)

**決定**: `Pd`「音から単語を書く」の 2 ペイン構造 (左出題 / 右答え合わせ・GA/RP・マーキング) を 4 ドリル全共通パターンとして適用、細部は Cursor 実装で決定。

**理由**: 4 ドリルは同じ「出題 → 入力 → 答え合わせ → マーキング」構造。音声系 (7c/7d) は右ペインの構成が微差だが共通枠に載せられる。

**影響**: Phase 1-H スコープ

### Q-20: 「詳しい設定」12 パラメータの振り分け → δ (プロフィール一元通過型 + LS プリセット)

**Naoya 案 δ で確定**:

- **設計原則**: すべての設定は `8z` プロフィール画面に集約。**毎セッション必ず 8z を通過**。ただし LocalStorage で前回設定を記憶し、初期値としてプリセット
- **ユーザーフロー**: 目的カードタップ → 毎回 `8z` に遷移 (前回設定がプリセット済み) → 変更 or そのまま → 「はじめる」→ ドリル
- **8z の役割変更**: 元 design の「初回のみ強制／以降は任意」→「毎回強制、ただし判断負荷は最小」
- **判断負荷**: 「そのままでいいか」の 1 判断のみ。実質 1 タップ増だが「今日の設定を意識する」機会を毎回提供

**セッション内絞り込みとの関係**:

Q-13 で `3b` が誤記と確認されたため、セッション内絞り込みはドリル画面内のインライン扱い (静かなチップ) に純化。

- **8z プロフィール (毎セッション通過)**: セッション開始前の前提条件を設定 (アクセント、CEFR レベル、目的別プリセット等の 12 パラメータ相当)
- **ドリル画面内インライン**: ドリル進行中に「今の弱点」で動的に絞り込む静かなチップ (苦手音、当日の集中対象)

**却下した選択肢**:
- 案 α (方針 4 分類: プロフィール / セッション内 / 廃止 / 内部固定化) — Naoya 案 δ で 8z 一元化により不要
- 案 β (今セッションで 12 パラメータ全リスト化) — トークン消費大、Cursor に任せる方が費用対効果良い
- 案 γ (Phase 1-0-c として切り出し) — Phase 1-0-b と重複

**Phase 1-0-b Recon で決定する実装レベル**:
- 12 パラメータの具体的リスト (現行 `index.html` 精読で確定)
- どのパラメータを表示するか (廃止候補・内部固定化候補を Naoya 判断で削っていく)
- LS スキーマ (`prev_settings_v1` 相当)

**影響**: Phase 1-B (top page)、Phase 1-C (プロフィール)、Phase 1-D (ドリル画面のインラインチップ)

### Q-21: オンボーディング 4 スライドの発火判定 → α (LS フラグ + 任意再表示)

**決定**: LocalStorage `onboarding_completed_v1` フラグ、スキップも完了扱い、再表示はヘッダーのガイドアイコンから任意発火。

**理由**:
- シンプルで実装コスト最小
- 「押し付けがましくない」原則 (Naoya の product-principles) と整合
- スキップ後の再表示 (案 β) は「押し付け」の温床になる
- バージョン管理 (案 γ) は現時点で v2 予定なく overengineering

**影響**: Phase 1-F スコープ

## 2026-07-18 (2): Phase 1-0-b Recon 結果反映 (Q-16〜Q-19 消化 + Q-20 補足「11 統一」)

Phase 1-0-b (Issue #78 / PR #80、`docs/design/phase-1/screen-data-mapping.md`) の Recon 結果を Naoya + Claude で確認、以下を確定。PR #80 は Claude 12 観点 Rv 合格後 merge 済み。

### Q-16: マーキング LS schema → α (物理 `ept_marks_v1` 単一オブジェクト / 論理 `mark:{drill_id}:{word_id}`)

**決定**:
- 物理レイヤ: **`ept_marks_v1` を単一オブジェクトで保存** (JSON 一括読み書き、書き込み逐次発火に耐える)
- 論理レイヤ: 論理キー **`mark:{drill_id}:{word_id} = 0..3`** で API 層は抽象化 (Recon §2)
- 移行: 既存 `ept_checks_v1` から **lazy migration** (初回アクセス時に読み替え、旧キーは並存 → v1.1 時点で削除)

**却下した選択肢** (Recon §2 で Cursor が提示):
- 案 β (キーを LS 分割 `ept_mark_2a_v1` / `ept_mark_2b_v1` /…): 目的別に読み書き独立できるが、`localStorage.getItem` 呼び出しが増えて I/O が非効率、`storage` イベントの粒度も粗くなる
- 案 γ (`ept_marks_v2` に完全刷新、旧キーは discard): 既存ユーザーの学習履歴を捨てるコストが高い

**理由**:
- 4 目的独立で読み書きするが、実際の書き込みは 1 単語につき同時 1 ドリルなので single-object でも競合しない
- 論理キー `mark:{drill_id}:{word_id}` を API 層に置くことで、将来物理を分割する場合の migration path が明快
- Lazy migration は「既存ユーザーが 3 回卒業した learn 状態」を守る

**影響**: Phase 1-C (プロフィール保存)、Phase 1-D (ドリル本体で読み書き)、Phase 1-E (`3d` learn 覧の集計元)

**Recon 参照**: `docs/design/phase-1/screen-data-mapping.md` §2

### Q-17: CEFR word-level 付与状況 → 未タグ 0、除外/割当ロジック不要

**決定**:
- wordlist 全語 **100% CEFR タグ付与済み** (A1:1187 / A2:1195 / B1:2116 / B2:899、未タグ **0**)
- connected phrase・weak forms も 100%
- **除外/デフォルトレベル割当のロジックは実装不要**
- CI に「未タグ検出時 fail」のガードを追加 (Phase 1-C 起票 Issue に含める)

**理由**:
- Recon §3 で実測。想定していた「未タグの扱い設計」は現時点で不要
- 将来 wordlist に語を追加する際の混入防止として CI ガードは有効

**影響**: Phase 1-C 起票 Issue に「CI ガード追加」を含める。Phase 1-D (フィルタ実装) は「必ずタグがある」前提で簡潔化。

**Recon 参照**: `docs/design/phase-1/screen-data-mapping.md` §3

### Q-18: GA/RP 個別 IPA と音声 → Track A: `ipa`/`rp_ipa` 100% / Track B: `ipa_actual_rp` + RP BatchWarm + 連結 RP TTS

**決定**:
- **Track A (Phase 1-C〜1-E で実装済み範囲を配線)**:
  - 単語 `ipa` (GA) / `rp_ipa` (RP) は wordlist 全語 100% 整備済み → `2c` の `3b`/`3d` 等で GA/RP スピーカー分離表示
  - Weak forms の GA/RP 個別 IPA も揃っている
- **Track B (未実装、React 化後)**:
  - `ipa_actual_rp` (弱形やスタイル差の narrow transcription、現状 0 件) の投入
  - RP `BatchWarm.gs` の実装 (現状 GA のみ)
  - 連結 phrase の RP TTS (Q-6-B と整合)

**理由**:
- Recon §4 で単語レベルは完全に揃っていることを確認、Track A では即使える
- 音声側の RP は連結・弱形のニュアンス表現が未整備、Track B の React 化 + GAS 拡張と併せて対応するのが低リスク

**影響**: Phase 1-C (プロフィール `3a` の Accent 選択)、Phase 1-E (`3b` GA/RP 個別スピーカー配線)、Track B ロードマップに「RP 音声整備 3 点」追記

**Recon 参照**: `docs/design/phase-1/screen-data-mapping.md` §4

### Q-19: IPA 部分一致検索 latency → 単純全走査で確定、index/Worker 不要

**決定**:
- 実測 **mean 0.15ms / max 1.62ms** (目標 100ms 以内を 2 桁クリア、Recon §5)
- 事前 index・Web Worker・chunking はいずれも **不要**
- 単純な JavaScript 全語走査で実装

**理由**:
- 語彙 5,397 語 × 最大 3 IPA 記号のクロス走査は現代の JS engine で誤差レベル
- 早すぎる最適化を避け、実装のシンプルさを優先
- 実機 Safari (iOS) での確認は Phase 1-E 実装中に任意実施 (BatchWarm 系の GAS 呼び出しとは独立)

**影響**: Phase 1-E (`3b` 語彙リスト IPA フィルタ) は単純実装で OK

**Recon 参照**: `docs/design/phase-1/screen-data-mapping.md` §5

### Q-20 補足: 「詳しい設定」パラメータ数の表記 → 案 α「11 に統一」

**背景**: Recon §1 で「12 パラメータ」の実態は **論理 9 + Accent/Language = 実質 11** と判明。UI シェルのトグル 2 種はパラメータではない。

**決定**: **11 に統一**。

- 本 Recon 成果物 `docs/design/phase-1/screen-data-mapping.md` §1 の「11 論理」記載はそのまま
- `docs/PURPOSE.md` / `docs/DESIGN.md` の「12 パラメータ」表記は **Phase 1-C (学習プロフィール) 起票 Issue のホワイトリストに PURPOSE/DESIGN を含めて 1 Issue で吸収**
- 書き替え文言: 「Setup 11 項目 (Accent 含む) + Onboarding」等
- Language は `3f` 分離またはヘッダー扱いで別枠管理 (Recon §1 の Cursor 提案どおり)

**却下した選択肢**:
- 案 β (「12」表記を維持、トグル 2 種を数える扱いに再定義): SPEC 一貫性は取れるが可読性が悪く、実装 Issue で毎回混乱の元
- 案 γ (数を明示せず「Setup 全項目 + Accent/Language + Onboarding」等の論理列挙): 数字が消えると量的把握ができない

**理由**:
- トグル込みで「12」と数えるのは実装 Issue で混乱の元
- PURPOSE/DESIGN の書き替えは 1-C Issue のホワイトリストに含めれば 1 Issue で吸収可能 (別 Issue 立てるコストが割に合わない)

**影響**: Phase 1-C 起票 Issue のホワイトリストに `docs/PURPOSE.md` / `docs/DESIGN.md` を追加。書き替え後の表記は「Setup 11 項目 + Onboarding」を base に。

**Recon 参照**: `docs/design/phase-1/screen-data-mapping.md` §1

### 消化した open 論点の全体像 (2026-07-18 (2) 時点)

| ID | 決定 | 影響 Phase |
|---|---|---|
| Q-16 | 物理 `ept_marks_v1` 単一 / 論理 `mark:{drill_id}:{word_id}` / lazy migration | 1-C, 1-D |
| Q-17 | 未タグ 0、除外ロジック不要、CI ガード追加 | 1-C, 1-D |
| Q-18 | Track A 現状 (単語 100%) / Track B に RP 3 点 (`ipa_actual_rp` + RP BatchWarm + 連結 RP TTS) | 1-C, 1-E, Track B |
| Q-19 | 単純全走査で OK、index/Worker 不要 | 1-E |
| Q-20 補足 | 「11 統一」、PURPOSE/DESIGN 書き替えは 1-C Issue で吸収 | 1-C (PURPOSE/DESIGN も含む) |

### Track B ロードマップ追記 (Q-18 由来)

Track B の初期タスクリストに以下 3 点を追記:

- (d) `ipa_actual_rp` (弱形・スタイル差の narrow transcription) の投入
- (e) `BatchWarm.gs` に RP ループ追加 (Q-6-B と統合実施)
- (f) 連結 phrase の RP TTS (Q-6-B と統合実施)



## 2026-07-19: Phase 1-A 視覚言語トークン基盤 merge (Issue #81 / PR #82)

Issue #81 起票 → Cursor 実装 → PR #82 → Claude 12 観点 Rv (合格) → Naoya merge 完了。ワンサイクル完了。

### 実装内容 (PR #82)

- **既存 17 変数を legacy 化** (`--paper`, `--panel`, `--ink`, `--muted`, `--faint`, `--hair`, `--signal`, `--signal-soft`, `--stress`, `--stress-soft`, `--ok`, `--ok-soft`, `--bad`, `--bad-soft`, `--ipa`, `--ui`, `--mono`)、参照 286 箇所全てを `var(--legacy-*)` へ置換
- **未定義参照 `--bg`** も `var(--legacy-bg)` にリネーム (定義追加なし、見た目維持)
- **Mood B 新 token 群** を `:root` に追加 (11 color + 5 space + 5 radius + 2 shadow)
- **Google Fonts import** (Charis SIL / Noto Sans JP·KR / Noto Serif JP) を `<head>` 追加、既存 Doulos self-host `@font-face` と共存
- **`docs/CSS-CONVENTIONS.md`** 新規 (Category A) — 「Phase 1-H 完了より前に legacy 削除禁止」を明文化
- **`docs/design/phase-1/visual-tokens.md`** 新規 (実装用 snapshot、Source of Truth Notice で Vault が正と明記)
- **`docs/DESIGN.md`** に「§ 視覚言語トークン (概要と正本)」小節を追加、具体値は書かず 3 リンクのみ
- **`docs/DOCUMENT-MAP.md`** Category A リストに CSS-CONVENTIONS 追記
- **`docs/LAUNCH-CHECKLIST.md`** Phase 1-A 行に `[x]` + PR #82 を追記

### 検証結果

- ブラックリスト md5 前後一致: PURPOSE / SPEC / DESIGN / screen-data-mapping / connected_speech / weak_forms / wordlist_GA すべて OK (wordlist_rp.json は記録抜け、次 Issue で確認)
- 6 言語 script md5: 差分 1 箇所 (`var(--faint)` → `var(--legacy-faint)`) のみ、レガシー退避方式の必然結果としてロジック不変を正規化比較で申告 → 許容
- 参照置換 grep: before 0 → after 286 (unique 18 変数)
- 見た目差分: Naoya 実機検収の pixel-perfect スクショ比較は Phase 1-B 起票前に完了予定

### merge 後の後続確認 (Rv Comment に明示、`5014556136`)

1. **`wordlist_rp.json` md5 記録抜け**: 低優先度、次 Issue で確認
2. **`visual-tokens.md` §4 と Vault の差分書き戻し**: 高優先度、Phase 1-C 起票 Issue のホワイトリストに `docs/design/phase-1/visual-tokens.md` を含めて Vault 全コピーで書き戻し推奨
3. **Naoya pixel-perfect 検収**: 高優先度、Phase 1-B 起票の gate

### 意味

これで Phase 1-B〜1-H の全 UI 実装が新 Mood B トークンを参照する土台が完成。既存画面は `--legacy-*` 経由で pixel-perfect 維持され、リスクゼロで基盤導入を達成。Phase 1-H 完了時点で legacy 群を最終 PR で削除 (CSS-CONVENTIONS.md § 2 に明記)。

### 影響 Track B

Track B (React 化以降) では:
- 本トークン群を CSS Modules / Styled Components / Tailwind config へ移植
- `color-mix()` 等の新 API を利用可
- Design tokens の JSON export (Storybook 参照用)


## 2026-07-19 (2): Phase 1-C 学習プロフィール 3a merge (Issue #83 / PR #84)

Issue #83 起票 → Cursor 設計懸念点検 (11 件持ち帰り) → Claude Rv + Naoya 裁定 3 件 α → Issue 本文 v2 全面改訂 + Vault §4 内容 Comment 投稿 → Cursor 実装 → PR #84 → Claude 12 観点 Rv (合格 + 後続 4 点) → Naoya merge 完了。

### Cursor 指摘で判明した Claude 起草時の重大な不足

- Issue 起草時に Recon `screen-data-mapping.md` §1〜§2 を実装レベルまで精読していなかった
- 結果として 8 件の実態乖離 (Setup 項目名、LS キー名、marks 物理キー、migration マッピング、CI 対象 wordlist パス、`#setup` の扱い、目的カード stub、Language UI) が発生
- Cursor の Phase 0 で全て検出、v2 全面改訂で解消

### Naoya 裁定 3 件 (全て α 採用)

- **A-6**: SPEC §4.1 「12 パラメータ」1 行の書き替えを本 Issue のブラックリスト緩和で吸収
- **A-7**: visual-tokens.md §4 の Vault 内容を Claude が Chat 履歴から復元して Comment 投稿 → Cursor 参照
- **A-11**: B2 CEFR ピル追加を本 Issue で吸収 (Q-1-A の実装)

### 実装内容 (PR #84)

**視覚的な UX の要**:
- `#purposeStub` 目的カード 4 個 (2a/2b/2c/2d) を top page に最小 stub 実装 (Phase 1-B で置換前提)
- `#setup` → `.profile-3a` リブランド (`data-frame="3a"`)、#1-#3 (mode/tab/dir) 非表示、`applyDrillId()` で内部マッピング
- Accent トグル (GA/RP) を settings modal から `3a` に移設、セッション中 no-op (`in-play` チェック)
- B2 CEFR ピル追加 (Q-1-A 実装)、`lvl.b2` i18n 配線
- Mood B コンポーネント CSS (Button 3 種 + purpose-card + pill 上書き + toggle-ga-rp)、Progress meter は Phase 1-D

**LS スキーマ**:
- `prev_settings_v1` (v: 1, accent, cefrLevels, focus, reg, grp, csLevel, csFilter, lastDrill, language)
- `ept_marks_v1` (物理 `{"2a:key":n,"2b:key":n,...}`、論理 API `getMark`/`setMark`、`resolveDrillId` で mode → drill_id 変換)
- `ept_marks_migrated_v1` フラグ
- lazy migration: `migrateChecksToMarksIfNeeded()` で `d→2a`/`e→2b`/`l→2c`、`2d` unset、旧 `ept_checks_v1` 残置
- `getCheckCount`/`setCheckCount` の後方互換分岐

**CI ガード**:
- `scripts/validate-cefr-tags.py` 新規、`wordlist_GA_a1a2_plus_phonics.json` + optional (`data/connected_speech.json` / `data/weak_forms.json`)
- `.github/workflows/validate-cefr-tags.yml` 新規、PR/push トリガー
- 未タグ検出時 exit 1 + 未タグ語リスト stderr

**docs 書き替え / 書き戻し**:
- PURPOSE.md: 「詳しい設定 相当パラメータ」→「Setup 11 項目 (Accent 含む) + Onboarding」
- DESIGN.md: `3a` UI 仕様追記、Setup 11 項目明記、B2 反映、LS スキーマ更新
- SPEC.md §4.1: 「12 パラメータの最終リストは Phase 1-0-b」→「Setup 11 項目 (Recon 確定) + Onboarding」1 行のみ変更 (ブラックリスト緩和 A-6 α)
- visual-tokens.md §4: Vault `design-tokens.md` §4 の内容で全置換 (Issue コメント `5014860270` 参照)
- LAUNCH-CHECKLIST.md: Phase 1-C 完了マーク + PR #84

### 検証結果

- ブラックリスト md5 前後一致: CLAUDE.md / REPOSITORY-STRUCTURE.md / CHANGE-CLASSIFICATION.md / DEV-GUARDRAILS.md / OPERATIONS.md / CSS-CONVENTIONS.md / screen-data-mapping.md / wordlist_GA_a1a2_plus_phonics.json / connected_speech.json / weak_forms.json すべて OK
- SPEC.md: §4.1 該当 1 行のみ変更、他行 md5 一致
- CI 動作確認: 通常 PR で OK、故意に未タグ語追加で exit 1 (fail 再現)
- 「11 統一」grep before/after: PURPOSE / DESIGN / SPEC §4.1 全て置換

### merge 後の後続確認 (Rv Comment `5015013634`)

1. **Font family トークンの欠如** (低優先度): `.btn-primary` 等が `--legacy-ui` 参照。Vault §2 でも stack はテキスト形式のみ。Phase 1-D or 別 Issue で `--font-ui` 等トークン化検討
2. **`.start` と `.btn-primary.start` 重複セレクタ** (低優先度): Phase 1-D で `.btn-primary` 単独に統一検討
3. **`applyDrillId` 二度呼び出し** (低優先度): `applyPrevSettings(ps, {preserveDrill: true})` オプション追加でクリーン化余地
4. **6 言語 script md5 明示記録なし** (低優先度): C4 実装で script 変更必然のため許容だが、Phase 1-A precedent に倣うなら Phase 1-D で記録推奨

### Naoya 実機検収待ち

- 目的 stub → `3a` → 「はじめる」→ 仮ドリル遷移
- B2 ピル選択切替
- LS migration 動作 (旧 checks → marks)
- CI ガード動作 (故意に未タグ語追加 fail)
- 他画面 pixel-perfect
- `3a` Mood B 整合
- モバイル 375px / デスクトップ 1440px

### 意味

Phase 1-C merge により、Phase 1 UI/UX の骨格が完成:

- **Phase 1-A**: 視覚言語トークン基盤 (Mood B) + CSS 運用規約 (Category A)
- **Phase 1-C**: 一元通過型 UX の要 (`3a` プロフィール) + LS 3 種 (`prev_settings_v1` / `ept_marks_v1` / migrated フラグ) + CI ガード

Phase 1-D (ドリル本体) は本 merge の LS スキーマ + 目的カード → `3a` 遷移フローを前提に組める。Phase 1-B (top page) は `#purposeStub` を本実装で置換する形。

### Track A スコープの残タスク

| Phase | 状態 |
|---|---|
| 1-0-a | ✅ merge (#77) |
| 1-0-b | ✅ merge (#80) |
| 1-A | ✅ merge (#82) |
| 1-B | ⏳ pixel-perfect 検収後起票 |
| 1-C | ✅ merge (#84) ← 今回 |
| 1-D | ⏳ 1-C 検収後起票 (2 PR 分割) |
| 1-E | ⏳ 1-D 完了後 (4 PR 分割) |
| 1-F | ⏳ 1-E 完了後 |
| 1-G | ⏳ 1-F 完了後 |
| 1-H | ⏳ 1-G 完了後、legacy 削除は本 Phase 最終 PR |


## 2026-07-19 (3) Phase 1-B merge (top page `1a` 本実装 + brief §6 準拠ドロップダウン言語切替 + settings modal 完全撤去)

### 確定事項

**Phase 1-B (Issue #85 / PR #86) merge 完了。DESIGN § `1a` 情報階層完全実装。**

初版実装:
- **目的 4 カード本実装** (Mood B `.purpose-card` / `.purpose-card--selected`、`design-tokens.md` §4.2 準拠、`padding: 12px 14px` / `font-size: 13px` / `line-height: 1.35`)
- **Hero タグライン** 「音を、美しく。」(`#topTagline`、`--font-serif`、`clamp(22px, 5.5vw, 28px)`)
- **ヘッダー** 言語切替 + ガイドアイコン + 語彙ボタン(`settingsBtn` 撤去)
- **フッター** Feedback / Terms / Privacy / X + `3h`「このアプリについて」DOM 常時 (`#aboutBlock`、`about.placeholder`)
- **Font family トークン新設** (`--font-ui` / `--font-serif` / `--font-ipa` / `--font-mono`、Rv `5015013634` 後続 #1)
- **`.start` / `.btn-primary.start` 統一** (`#setup.profile-3a .btn-primary.start` にスタイル委譲、Rv 後続 #2)
- **`applyDrillId` 二重呼び出し整理** (`applyPrevSettings(ps, {preserveDrill: true})` オプション化、Rv 後続 #3)
- **6 言語 script md5 記録** (Phase 1-A precedent 遵守、Rv 後続 #4)
- **i18n 新規キー** (`top.tagline` / `drill.title.2a`–`2d` / `about.title` / `about.placeholder`、全 6 言語 fallback、JA / EN / KO tagline は本翻訳)

追加修正 (Rv Comment `5015555964` / 指示 `5015572883` / Cursor 対応 `5015589001`):
- **`.build .ph` の巻き取り解除**: `var(--font-ui)` → `var(--legacy-ui)` に戻し。Phase 1-D で `.build` 全体を巻き取る前提、単独先行の巻き取りは Phase 1-D 検証のノイズになるため
- **settings modal 完全撤去**: `#settingsBtn` / `#settingsModal` (scrim / title / Accent section [hidden]) DOM 撤去、`openSettings` / `closeSettings` / `bindEsc` の settings 分岐撤去、`settings_*` 4 key × 6 言語削除。Language ヘッダー移設 + Accent `3a` 移設で役割消失
- **Language ドロップダウン化** (brief §6 準拠): `#langSwitcher` (現在言語コード `EN`/`JA`/`KO`/`簡`/`繁`/`FIL` + ▾) + `#langMenu` (プルダウン、6 言語自言語表記 `日本語` / `English` / `한국어` / `简体中文` / `繁體中文` / `Filipino`、hard-code)。外側 tap + Escape で閉じる、`onModalEscapeKey` に統合

技術メトリクス:
- 6 言語 script md5 最終: `b14677a5e4c08f83010f9e16a57e2daf` (6 言語共通、Phase 1-A precedent 遵守)
- i18n leaf: 176 → 172 (settings_* 4 key 削除)。SPEC §5.5「169」との実態乖離は +3 (Phase 1-B 開始時 +7 から縮小)
- ブラックリスト 12 ファイル md5: 完全不変 (`CLAUDE.md` / `PURPOSE.md` / `SPECIFICATION.md` / `REPOSITORY-STRUCTURE.md` / `CHANGE-CLASSIFICATION.md` / `DEV-GUARDRAILS.md` / `OPERATIONS.md` / `CSS-CONVENTIONS.md` / `screen-data-mapping.md` / `wordlist_GA_a1a2_plus_phonics.json` / `data/connected_speech.json` / `data/weak_forms.json`)
- Category A 更新: `DESIGN.md § 1a` / `LAUNCH-CHECKLIST.md` Phase 1-B 完了マーク / `visual-tokens.md` §5b Font family + §5c `1a` 実装 snapshot

### 判断根拠

- **案 γ (フル + Rv 後続 4 点消化) 採用**: Phase 1-D 起票時に Font family トークン化やセレクタ統一の負債を持ち越さず、Phase 1-D はドリル本体に集中可能。Phase 1-C と同水準の L2 上限で Cursor が消化
- **ドロップダウン化採用の根拠**: brief §6 で「トップバー右上に固定、現在の言語コード (`JA` / `EN` / `KO` 等) + 小さな ▾、プルダウン: 6 言語一覧、各言語は自言語表記」が明示。当初の 6 chip 横並びは brief §6 と直接乖離、モバイル 375px の視認性 + brief 準拠の両立にはドロップダウンが必然
- **settings modal 完全撤去採用の根拠**: Language ヘッダー移設 + Accent `3a` 移設で settings modal の役割が完全消失。Naoya 実機検収時の UI 混乱 (ボタンなしの hidden modal 残置) を避ける + i18n leaf 削減で SPEC §5.5 実態乖離縮小
- **`.build .ph` 戻し採用の根拠**: Issue 8.5 で「他画面の参照は `--legacy-*` のまま据え置き」明記済み、`.build .ph` は新規 Mood B コンポーネントに含まれない (Encode drill `2b` 内の placeholder)。Phase 1-D で `.build` 全体を巻き取る予定のため、単独先行の巻き取りは Phase 1-D 検証のノイズになる

### Cursor 設計懸念点検 (Phase 0')

Cursor が追加修正の Phase 0' inventory で以下を確認:
- `#accentOpts` は settings modal 内のみ 1 箇所、`3a` Accent UI は `#profileAccentToggle` を使用 → id 衝突なし、settings 撤去で `3a` に影響なし
- `#langOpts` は DOM + `applyI18n` + click ハンドラで参照 → alias 不要と判断、完全置換で `#langSwitcher` / `#langMenu` に切り替え
- `closeSettings` の呼び出し元: `openGuide` / `showVocabView` / Escape の 3 箇所 → 全て削除

**設計懸念点検の中断・報告発火なし** (Phase 1-C の教訓が反映されており、追加修正指示の Recon 精度が十分だった)

### 後続 Phase への影響

- **Phase 1-D** (ドリル本体): Font family トークン化前提で `.btn-primary` / `.start` / IPA タイポ CSS を組める。Progress meter CSS 定義追加 (`design-tokens.md` §4.5 準拠)、音節境界 `‧` (U+2027) / 強勢マーカー `ˈ` signal 色 / 要注意音 stress 下線、`.build` legacy 巻き取り
- **Phase 1-E** (支援画面): `3h` DOM 常時 placeholder のテキスト差し替え、`3f` 言語設定のヘッダー配置維持 or `3f` へ移動判断
- **Phase 1-F** (オンボーディング): ヘッダーガイドアイコンを `3g` オンボーディング 4 スライドへのリンクに差し替え
- **Phase 1-G** (多言語): `top.tagline` / `drill.title.2a`–`2d` / `about.*` の zh-Hans / zh-Hant / fil / KO drill titles を本翻訳
- **Phase 1-H** (PC + legacy 削除): top page 範囲の legacy 参照が本 Issue で減少 → 最終削除時の対象箇所が縮小
- **後続 docs Issue**: SPEC §5.5 の i18n leaf 数「169」→ 172 更新 (ブラックリスト解除フローで別 Issue)

### 発信素材化候補

- Phase 1-B Rv 改善候補 3 件を本 PR 内で消化するパターンは「AI エージェント時代の PR 内追加修正フロー」note 記事化価値高
- Language ドロップダウン化 (brief §6 準拠) の判断過程 (chip 6 個横並び → brief 再確認 → ドロップダウン) は「brief 精読の重要性」の教訓
- settings modal 完全撤去は「デッドコード化を PR 内で回避するアーキテクチャ判断」の事例

### 関連 Issue / PR

- Issue: [#85](https://github.com/nkhippo/IPASoundDrill/issues/85)
- PR: [#86 (merged)](https://github.com/nkhippo/IPASoundDrill/pull/86)
- Claude Rv Comment (初版): [`5015555964`](https://github.com/nkhippo/IPASoundDrill/pull/86#issuecomment-5015555964)
- 追加修正指示 Comment: [`5015572883`](https://github.com/nkhippo/IPASoundDrill/pull/86#issuecomment-5015572883)
- Cursor 対応報告 Comment: [`5015589001`](https://github.com/nkhippo/IPASoundDrill/pull/86#issuecomment-5015589001)
- 参照 Rv (Phase 1-C 後続 4 点発端): PR #84 Comment [`5015013634`](https://github.com/nkhippo/IPASoundDrill/pull/84#issuecomment-5015013634)


## 2026-07-19 (4) Phase 1-D-PR1 merge (`2a` Decode + `2b` Encode 本実装 + Progress meter / CEFR リスタイル / マーキング Mood B / 音象徴視覚化 / `.build` legacy 巻き取り)

### 確定事項

**Phase 1-D-PR1 (Issue #87 / PR #88) merge 完了。ドリル本体の 2 PR 分割の PR1(頻度高い基本ドリル 2 種 + 共通基盤)完了。**

初版起草時と実態の乖離が Cursor Phase 0 設計懸念点検で 9 件検出 → Naoya 裁定(Comment `5015824683`)で解釈確定 → 実装完了。Phase 1-C 教訓の継続適用が成功した第 2 事例。

#### 実装完了項目

- **Progress meter**: `.progress-meter` / `__fill` / `__label`(`design-tokens.md` §4.5 準拠)、`#dProgress`/`#eProgress`、`updateProgressMeter()` = `(S.idx+1)/poolTotal`、Reveal/Summary では親カードごと非表示
- **CEFR タグ Mood B リスタイル**(既実装のスタイル未適用状態を発見、裁定 #6): 既存 `#dCefr`/`#eCefr`/`#rCefr` + `setCardCefr` を `.pill-cefr` 風に、テキストは A1/A2/B1/B2 継続、i18n `cefr.tag.*` は aria/title 用のみ追加
- **マーキング UI Mood B**(裁定 #4/#5): 既存 3 スロット `.pc-slot` + `toggleCheckSlot` 挙動維持、`data-graduated` で卒業状態表現、`#revealChecks` を `2a`/`2b` 用に Mood B 化、`#mbSChecks` は `2c` 用として Phase 1-D-PR2 に持ち越し
- **音象徴視覚化**(裁定 #1/#2/#3):
  - 音節境界 `‧`(U+2027): **wordlist に 0/5397 件のため本 PR 対象外**、将来 data 整備 Issue で `‧` 付与後に UI が自動適用される設計を維持
  - 強勢マーカー `ˈ`/`ˌ`: `.seg.mark` → `var(--signal)` 色付け
  - 要注意音: `.seg.nucleus`(強勢後の第 1 母音)のみ `var(--stress)` 下線、TRAPSET 全適用は別 Issue で学習効果検証してから判断
- **`.build` legacy 巻き取り**(裁定 #7): `border-radius: var(--radius-button)`(12px、現行 11px から最小変化)、意匠変更なし + Mood B トークン参照統一
- **Reveal IPA タイポ Mood B**(裁定 #9 A+B 併用): `--font-ipa`(Charis SIL)30-40px、`.res-ok`/`.res-bad` 2 値ステータスは現状維持、反対アクセント行 / gloss / TTS ボタンは legacy のまま(Phase 1-D-PR2 で一括 Mood B 化)
- **`renderBuild()` の `buildIpaHtml` 統合**: 従来の inline style での mark 色付けを `buildIpaHtml` に単一化、音象徴視覚化が Encode ビルド中の IPA にも自動適用される設計改善
- **i18n 新規キー**: `cefr.tag.a1`–`b2`(4) + `mark.aria.step_0`–`_3`(4) + `progress.meter_label` + `progress.meter_aria`(2) = 10 key、JA/EN は本翻訳、他 4 言語は JA コピー暫定(Phase 1-G で本翻訳)
- **`data-frame` attribute 追加**: `#cardDecode data-frame="2a"` / `#cardEncode data-frame="2b"` / `#reveal data-frame="reveal"`、Phase 1-B `1a` パターン継承

#### 技術メトリクス

- 6 言語 script md5: `b14677a5e4c08f83010f9e16a57e2daf` → **`82c55b7fdd94370d6235b725d96ef348`**(6 言語共通、Phase 1-A precedent 継続)
- `var(--legacy-*)` 参照数: 281 → **261**(-20、`.build`/`.kbd` 巻き取り分)
- i18n leaf: 172 → **182**(+10)。SPEC §5.5「169」との実態乖離は +13 に拡大(Phase 1-B 時 +3、Phase 1-D-PR1 で +7、後続 docs Issue で集約更新予定)
- ブラックリスト 12 ファイル md5: 完全不変
- Category A 更新: `DESIGN.md § 2a`/`§ 2b` + Progress meter / 音象徴 / マーキング節 / `LAUNCH-CHECKLIST.md` Phase 1-D 部分完了マーク / `visual-tokens.md` §5d Progress meter + §5e 音象徴視覚化 + §5f `.build` Mood B トークン化

### Phase 0 で判明した Issue 起草時の乖離(4 件)

**Recon 精読不足による記述ミス** — Phase 1-C 教訓の継続適用で Cursor が Phase 0 で全 9 件検出:

| Issue 記述 | 実態 | 裁定 |
|------------|------|------|
| §8.4 CEFR「新規」 | 既実装(スタイル未適用状態) | Mood B リスタイル(裁定 #6) |
| §8.5「0→1→2→3 循環」 | 3 スロット `.pc-slot` + `toggleCheckSlot` 既存 | 3 スロット Mood B(裁定 #4) |
| §8.6 音節境界 `‧` | wordlist 0/5397 件 | 本 PR 対象外(裁定 #1) |
| §8.7 `#revealChecks` は `2c`/`2d` 用 | `2a`/`2b` Reveal で使用中 | 本 PR で Mood B 化(裁定 #5) |

**教訓**: `screen-data-mapping.md` §6 は概念レベルの記述で、実装名(既実装 vs 未実装、DOM id、CSS class、使用画面)は Phase 0 inventory で必ず確認する必要がある。Cursor Phase 0 設計懸念点検フローが再現性を持って機能することが Phase 1-C / Phase 1-D-PR1 で証明された。

### 判断根拠(裁定 9 件の背景)

- **裁定 #2 nucleus のみ Mood B(TRAPSET 全適用は却下)**: brief §6 sensory「静けさで際立たせる」+ Product Principles 原則 5「1 画面 1 主軸」から、TRAPSET 全適用は Decode 出題 IPA の視覚ノイズ大。既存 nucleus 表示(強勢後の第 1 母音)を Mood B 化が Mood B 静けさに整合。TRAPSET 全適用の学習効果検証は別 Issue で分離
- **裁定 #4/#5 マーキング UI 既存 3 スロット継承**: Phase 1-C `ept_marks_v1` 物理レイヤと UI 表現は独立、既存ユーザー UX 継承が重要。Issue の「循環」表現は 3 スロット UI の見た目更新と読み替え
- **裁定 #7 `.build` `--radius-button` 12px**: 判断 C 案 β「意匠変更なし」に沿う、現行 11px から最小変化で Mood B 整合
- **裁定 #9 A+B 併用(反対アクセント行 / gloss / TTS は legacy)**: 判断 D 案 β 遵守、Phase 1-D-PR2 で `2c`/`2d` Reveal と共通のため一括 Mood B 化する方が変更範囲分離

### Cursor 設計懸念点検フロー(Phase 1-C 確立 → Phase 1-D-PR1 再適用)

- Phase 1-C: Cursor Phase 0 inventory で 8 件の乖離を検出 → Naoya 裁定 3 件 α → Issue v2 全面改訂 → 実装再開
- Phase 1-D-PR1: Cursor Phase 0 inventory で 9 件の乖離を検出 → Naoya 裁定 9 件 → Issue v2 改訂は不要(Comment で解釈確定)→ 実装再開
- **改善**: Issue v2 全面改訂を回避し、Comment で解釈確定するフローが確立。Naoya 裁定の Comment(Comment `5015824683`)を実装レポートで参照することで、実装トレーサビリティを保つ

### 発信素材化候補

- **Cursor Phase 0 設計懸念点検フローの再現性**: Phase 1-C / Phase 1-D-PR1 で 2 度再現、note 記事化価値高
- **Issue 起草時の Recon 精読の限界**: 概念記述 vs 実装名の乖離を Cursor に検出させる価値、AI エージェント間のフェーズ分担の実例
- **要注意音の下線範囲(nucleus vs TRAPSET)の設計判断**: 静けさ vs 学習効果のトレードオフ、Mood B 設計哲学の実装例
- **音節境界データ整備の予約設計**: `‧` が wordlist に 0 件でも UI 側は `buildIpaHtml` で自動対応、data 整備 Issue で自動適用される設計

### 関連 Issue / PR

- Issue: [#87](https://github.com/nkhippo/IPASoundDrill/issues/87)
- PR: [#88 (merged)](https://github.com/nkhippo/IPASoundDrill/pull/88)
- Phase 0 設計懸念点検通知: Issue [#87 Comment `5015788565`](https://github.com/nkhippo/IPASoundDrill/issues/87#issuecomment-5015788565)
- Naoya 裁定 Comment: Issue [#87 Comment `5015824683`](https://github.com/nkhippo/IPASoundDrill/issues/87#issuecomment-5015824683)
- Cursor 実装完了報告: PR [#88 Comment `5015842872`](https://github.com/nkhippo/IPASoundDrill/pull/88#issuecomment-5015842872)
- Claude Rv Comment: PR [#88 Comment `5015853528`](https://github.com/nkhippo/IPASoundDrill/pull/88#issuecomment-5015853528)


## 2026-07-19 (5) Phase 1-D-PR2 merge (`2c` Study + `2d` Connected/Weak 本実装 + Reveal 共通 Mood B + Band Unlock 削除 + Phase 1-D 完了)

### 確定事項

**Phase 1-D-PR2 (Issue #89 / PR #90) merge 完了。Phase 1-D (ドリル本体) 完全完了。Phase 1 UI/UX 7 マイルストーン完了(1-0-a / 1-0-b / 1-A / 1-B / 1-C / 1-D-PR1 / 1-D-PR2)、残 5 マイルストーン(1-E / 1-F / 1-G / 1-H + 後続 docs Issue)。**

Cursor Phase 0 設計懸念点検フローが 3 事例目、**Naoya 裁定不要の初事例**(Cursor 案 = Claude 推奨で無矛盾、Comment `5015927912` で解釈確定即実装再開)。フロー効率が世代進化(Phase 1-C v2 全面改訂 → Phase 1-D-PR1 Comment 解釈確定 → Phase 1-D-PR2 裁定即実装)。

#### 実装完了項目

- **`2c` Study モード Mood B**: `#cardModeBStudy` Mood B トークン化、`#mbSProgress` 新設(`updateProgressMeter` 配列拡張 `["d","e"]` → `["d","e","mbS"]`)、`#mbSChecks` Mood B(`#revealChecks` パターン継承 CSS セレクタ複数化)、Mode B CEFR `.pill-cefr` 風、IPA 音象徴視覚化(`buildIpaHtml` 経由)、`data-frame="2c"` 追加
- **`2c` フロー確認**: Study-only(Study → 意味表示 inline → Got It)、`MODEB_QUIZ_ENABLED = false` 維持、`cardModeBDict`(Quiz 経路)未使用
- **`2d` Connected/Weak Mood B 確認**: `#cardDecode` 再利用(`tab=connected`)、Progress/CEFR/`#revealChecks`→`mark:2d:*` は PR1 の共通基盤で自動適用済み、追加カード新設なし
- **Reveal 共通要素 Mood B 一括化**: 反対アクセント行(`.alt-ipa` + `.alt-ipa-row .alt-ipa-text`)、gloss(`.word-gloss`)、TTS ボタン(`.playicon` 共有 CSS の Mood B トークン化で全 9 箇所自動対応、`.playicon-sm.inactive:disabled:hover` も忘れず) → `2a`/`2b`/`2c`/`2d` Reveal で完全一貫
- **Band Unlock 系削除**: `LS_VOCAB_BAND_KEY` 定数 + `MODEB_BAND_UNLOCK_RATIO` 定数 + `getVocabBand` / `setVocabBand` / `bandProgress` / `refreshVocabBandUnlock` 関数削除。grep で全て 0 件確認
- **`MODEB_BANDS` 残置(CEFR allowlist として)**: 削除すると Study 適格判定破壊、意図明示コメント追加(`// CEFR allowlist (Band unlock removed Phase 1-D-PR2)`)。名称リネームは Phase 1-H での判断
- **Mode B CEFR pill 化**: `#cardModeBStudy` / `#cardModeBMcq`(凍結) / `#cardModeBDict`(未使用) の `.cefr` も PR1 の `.pill-cefr` 風セレクタ拡張
- **`data-frame` 一貫適用**: `#cardModeBStudy`="2c" / `#cardModeBMcq`="2c-quiz"(凍結中でも識別子付与) / `#cardModeBDict`="2c-dict"

#### 技術メトリクス

- 6 言語 script md5: `82c55b7fdd94370d6235b725d96ef348` → **`c58abfff64db89217a2a77c628a653a3`**(6 言語共通)
- `var(--legacy-*)` 参照数: 261 → **249**(-12、`.playicon` 全 9 箇所 + `.alt-ipa*` + `.word-gloss` + `#cardModeBStudy` + Band Unlock 系削除分)
- i18n leaf: 182(変化なし、PR1 の `progress.*`/`mark.aria.*`/`cefr.tag.*` 流用、新規キー追加なし)
- ブラックリスト 12 ファイル md5: 完全不変
- Category A 更新: `DESIGN.md § 2c/§ 2d + §2.7/§2.8 + Reveal 共通 + Band 廃止` / `LAUNCH-CHECKLIST.md` Phase 1-D 完了マーク / `visual-tokens.md §5g Study + §5h Connected + §5i Reveal 共通` / `DOCUMENT-MAP.md +visual-tokens`

#### Rv 改善候補 2 件(追加修正で消化)

Rv Comment `5015952732` で以下 2 件を検出、Naoya 指示で追加修正コミット消化(Cursor Comment `5015961422` 反映):
1. 実装レポート内の Comment id 誤記(`5015928600` → `5015927912`、2 箇所)
2. LAUNCH-CHECKLIST.md の Phase 1-D 行の重複表記(「#87/#88(PR1)+ #87/#88(PR1)」→「#87 / #88 (PR1)」)

軽微な typo だが、実装トレーサビリティと docs 表記統一のため merge 前修正が集約的と判断。docs のみの変更で script md5 / blacklist / legacy 数 不変。

### Phase 0 で判明した Issue 起草時の乖離(9 件)

Phase 1-D-PR2 Issue #89 起草時に把握できていなかった実態:

| Issue 記述 | 実態 | 裁定 |
|------------|------|------|
| §8.2 `cardConnectedDecode` を Mood B | 存在せず、`#cardDecode` 再利用(`tab=connected`) | 案 A(既存流用、追加カードなし) |
| §8.2/§8.7 `mark:2d:*` UI 新設 | 既に稼働(Phase 1-C `resolveDrillId` + Phase 1-D-PR1 で自動 Mood B 化済み) | 案 A(検証のみ) |
| §8.2 `2d` Progress meter 新設 | 既に稼働(`renderDecode` 経由で `#dProgress` 共通) | 案 A(既存流用) |
| §8.1 Study「Study → Dict → 次へ」 | Study-only(意味表示 inline → Got It)、Dict は Quiz 経路のみ | 案 A(Study-only、Q-2-B 遵守) |
| §8.3/§8.4 `.reveal-alt` / `.reveal-gloss` | `.alt-ipa*` / `#rGloss.word-gloss` + Study `#mbSGloss` | 案 A(実装名で Mood B リスタイル) |
| §8.5 `.playicon` 6 箇所 | 実態 9 箇所(+`#mbSPlay` `#mbMPlay` `#mbDPlay`) | 案 A(共有 CSS `.playicon` の一括 Mood B) |
| §8.8 Band 全実装シンボル削除 | `MODEB_BANDS` + `modeBBandPool` + `modeBEligible` は CEFR allowlist として残すべき(削除すると Study 適格判定破壊) | 案 A(Unlock 系のみ削除) |
| §8.1 Mode B CEFR Mood B | 想定内、PR1 の `.pill-cefr` 風セレクタ拡張 | 案 A |
| §8.1 `2c` Progress meter 新設 | 想定内、`#mbSProgress` + `updateProgressMeter` 配列拡張 | 案 A |

**教訓**: Recon `screen-data-mapping.md` §6 は概念記述、実装状態(Phase 1-C `resolveDrillId` の分岐、Track A 初期実装の `#cardDecode` 再利用、`MODEB_BANDS` の実質的機能)は Phase 0 inventory で必ず確認する必要がある。Cursor Phase 0 設計懸念点検フローが 3 事例目の再現性を実証。

### 判断根拠(裁定 9 件の背景)

- **裁定 #1〜#3(既実装の発見)**: Track A 初期設計 + Phase 1-C `resolveDrillId` + Phase 1-D-PR1 共通基盤の相互作用で、`2d` の主要変更が既に自動適用済み。Issue 起草時の「新設」記述は Phase 1-C 以降の実装積み上げを反映しきれていなかった
- **裁定 #5 Study-only フロー**: Q-2-B「Quiz 凍結、`MODEB_QUIZ_ENABLED=false`」遵守、Quiz 復活は Track B 以降
- **裁定 #7 `.playicon` 共有 CSS 一括**: 個別 id 指定より共有 CSS の Mood B トークン化が集約的、実装完全性 + Phase 1-H legacy 削除範囲縮小
- **裁定 #8 `MODEB_BANDS` 残置**: 最重要判断。Band 名だが CEFR allowlist として機能、削除すると Study 適格判定破壊。意図明示コメント追加で将来の refactor 保護。名称リネームは Phase 1-H での判断(混乱回避)

### Cursor 設計懸念点検フロー 3 事例累積の効率世代進化

| Phase | Cursor Phase 0 検出乖離 | Issue v2 改訂 | Naoya 裁定 | 実装再開経路 |
|---|---|---|---|---|
| 1-C | 8 件 | **全面改訂** | 3 件 α | Issue v2 → Cursor 再実装 |
| 1-D-PR1 | 9 件 | 不要 | 9 件 | Comment `5015824683` → Cursor 実装再開 |
| 1-D-PR2 | 9 件 | 不要 | **不要**(全 A) | Comment `5015927912` → Cursor 実装再開 |
| **累計** | **26 件** | 1/3 で改訂 | 3/3 で解決 |

Phase 1-D-PR2 で **「Cursor 案 = Claude 推奨で無矛盾、Naoya 裁定不要」の初事例**達成。フロー効率が確固たる再現性を持つことを実証。

### 後続 Phase への影響

- **Phase 1-E**(支援画面、4 分割?): Reveal 全 Mood B 完成のため、`3d` 学習状況(marks 集計)の UI 起票が Mood B 前提でクリーン。Phase 1-D 完了で共通基盤(Progress meter / CEFR / マーキング / 音象徴 / Reveal 共通)は完成、`3b`/`3c`/`3d`/`3f`/`3h` は独自 UX に集中可能
- **Phase 1-F**(オンボーディング): `3g` 4 スライド、ヘッダーガイドアイコン差し替え
- **Phase 1-G**(多言語): PR1/PR2 で追加した i18n キー(`cefr.tag.*` / `mark.aria.*` / `progress.*` = 10 key)を全て本翻訳
- **Phase 1-H**(PC + legacy 削除): `MODEB_BANDS` リネーム判断(→ `MODEB_CEFR_ALLOW` 等)、`--legacy-*` 参照数 249 → 0 の最終削減、PC variant 実装
- **後続 docs Issue**: SPEC §5.5 の i18n leaf 数「169」→ 182 集約更新(ブラックリスト解除フロー)

### 発信素材化候補(Phase 1-D 完了時点)

- **Cursor Phase 0 設計懸念点検フローの再現性**: Phase 1-C / 1-D-PR1 / 1-D-PR2 の 3 事例累積(検出 26 件、フロー効率世代進化)、note 記事化価値最高
- **AI エージェント間のフェーズ分担**: Cursor Phase 0 → Naoya 裁定 → Cursor 実装 → Claude Rv の 4 段階が確立、各段階の効率化を実装で証明
- **Q-2-B「Band 廃止」の実装シンボル削除タイミング**: Phase 1-A〜1-H の設計判断を Phase 1-D-PR2 で消化、`MODEB_BANDS` 残置の意図明示コメントによる将来 refactor 保護
- **Reveal 共通要素の PR 分離**: Phase 1-D-PR1 で意図的に据え置き、Phase 1-D-PR2 で一括処理する意匠変更のスコープ管理
- **要注意音の下線範囲(nucleus vs TRAPSET)の設計判断**: 静けさ vs 学習効果のトレードオフ、Mood B 設計哲学の実装例(Phase 1-D-PR1)
- **音節境界データ整備の予約設計**: `‧` が wordlist に 0 件でも UI 側は `buildIpaHtml` で自動対応、data 整備 Issue で自動適用(Phase 1-D-PR1)

### 関連 Issue / PR

- Issue: [#89](https://github.com/nkhippo/IPASoundDrill/issues/89)
- PR: [#90 (merged、追加修正 2 件込み)](https://github.com/nkhippo/IPASoundDrill/pull/90)
- Phase 0 設計懸念点検通知: Issue [#89 Comment `5015917212`](https://github.com/nkhippo/IPASoundDrill/issues/89#issuecomment-5015917212)
- Naoya 裁定 Comment: Issue [#89 Comment `5015927912`](https://github.com/nkhippo/IPASoundDrill/issues/89#issuecomment-5015927912)(全 A、裁定不要の初事例)
- Cursor 実装完了報告: PR [#90 Comment `5015942015`](https://github.com/nkhippo/IPASoundDrill/pull/90#issuecomment-5015942015)
- Claude Rv Comment: PR [#90 Comment `5015952732`](https://github.com/nkhippo/IPASoundDrill/pull/90#issuecomment-5015952732)
- 追加修正指示 Comment: PR [#90 Comment `5015957604`](https://github.com/nkhippo/IPASoundDrill/pull/90#issuecomment-5015957604)
- Cursor 追加修正報告: PR [#90 Comment `5015961422`](https://github.com/nkhippo/IPASoundDrill/pull/90#issuecomment-5015961422)


## 2026-07-19 (6) — Phase 1-E 起票準備セッション、判断 1-5 全 8 サブ判断確定

### 決定サマリ

Phase 1-E (支援画面) スコープの意匠論議 5 論点 (判断 1〜5、内 判断 3・4 は各 2〜3 サブ判断) を Chat で実施、全て Claude 推奨 案 α で確定。`3f` 独立画面廃止 + PR 3 分割方針で Phase 1-E PR-1 (検索系統合) Issue [#91](https://github.com/nkhippo/IPASoundDrill/issues/91) を起票。

### 判断の詳細

**判断 1: `3d` 学習状況の集計主軸**
- 決定: 案 α — Progress Card Stack + CEFR フィルタ + SRS 復習キュー補助
- UX パターン分類: Object-Oriented UI + Overview-Detail Pattern (Shneiderman's Information Seeking Mantra 忠実実装)
- 主な理由: Phase 1-D 共通基盤 (Progress meter / CEFR pill / マーキング 3 スロット) の再利用度最高、モバイル 375px 縦積み適合、Miller's law (4 カード) 内、Endowed Progress Effect (スロット別内訳で発動)
- 却下: 案 β (Heatmap Matrix、Miller's law 超過 + モバイル密度トラップ)、案 γ (Task-Oriented Feed、共通基盤の意味薄化 + SRS 新規実装コスト)

**判断 2: `3f` 独立画面の要否**
- 決定: 案 α — 廃止 (Progressive Consolidation)
- UX パターン分類: Inline Settings Pattern + Zero-Depth Settings (Contextual Settings 現代潮流)
- 主な理由: Phase 1-B settings modal 撤去思想と一貫 (Nielsen #4 Consistency)、YAGNI 適合、Hick's Law + Fitts's Law 同時最適化、Settings Rathole Anti-Pattern 回避
- 却下: 案 β (Deep Settings Hierarchy、YAGNI 違反 + 深階層アンチパターン)、案 γ (Meta-Information Page、Track A で時期尚早)
- 影響: Phase 1-E スコープ 5 画面 → 4 画面 (`3b`/`3c`/`3d`/`3h`) に縮小、`3f` 廃止 docs 更新は PR-3 で集約

**判断 3-A: `3b` CEFR フィルタ配置 + 画面アーキテクチャ**
- 決定: 案 α — Sticky Filter Bar with Pill Toggle Group (複数選択)
- **Naoya 追加制約**: 「現状 Modal で 5,397 語描画中に他操作不能、別画面表示希望」→ **Modal → Full-Page Route** に画面アーキテクチャ変更確定
- **NFR 4 点を実装範囲に組み込み確定**:
  - NFR-1: List Virtualization (`IntersectionObserver`、常時 ~20-30 行のみ)
  - NFR-2: Skeleton UI (`--hair` 色プレースホルダー + fade-in)
  - NFR-3: Time-Sliced Rendering (`requestIdleCallback`、10 行/frame)
  - NFR-4: CEFR Pre-Filter (データ層絞り込み、初期 `prev_settings_v1.cefrLevels` = `A1+A2` = 56% 削減)
- UX パターン分類: Persistent Filter Pattern + Multi-Select Toggle + Full-Page Route Pattern
- 主な理由: `3a` プロフィール操作モデルと一貫、Non-Modal 思想の 3 段階目 (Phase 1-B settings modal 撤去 → 判断 2 `3f` 廃止 → 判断 3-A `3b` Full-Page Route)、Blocking UI Anti-Pattern 撲滅
- 却下: 案 β (Facet Sidebar Drawer、EC 向け過剰 + Hidden State)、案 γ (Segmented Control 単一、Recon Q-4 複数選択仕様と乖離)

**判断 3-B: `3c` 導線配置**
- 決定: 案 α — Segmented Search Mode Toggle → Route Transition
- UX パターン分類: Mode Switcher Pattern + Contextual Route Branching (Wayfinding の Anchor + Branch モデル)
- 主な理由: Contextual Continuity (検索意図の連続性)、Signifier 明示性 (テキストラベル)、Modern Web Convention (検索カテゴリタブ)、Nielsen #1/#3/#4/#7 同時適合
- 却下: 案 β (Inline Icon Button、Icon-Only Signifier 弱さ + Google Material Design 3 方針転換と逆行)、案 γ (Separate Entry Card、`1a` 目的カード UX と視覚言語重複)

**判断 4-A: `3c` 記号パレット操作モデル**
- 決定: 案 α — Multi-Symbol Query Builder (記号タップ蓄積、順序保持)
- UX パターン分類: Progressive Query Construction + Structured Input Pattern + Chip Editor
- 主な理由: IPA 記号列の性質 (順序付きトークン列) と一致、Compositional Interaction が学習効果を生む、Error Prevention (パレット選択のみで誤入力根絶)、Chip Editor パターン慣行
- 却下: 案 β (Single-Symbol Instant Filter、「æk」音節構造探索不可)、案 γ (Multi-Select AND/OR、Boolean Cognitive Overhead + 集合意味論が IPA 順序性と不整合)

**判断 4-B: `3c` 検索結果表示方式**
- 決定: 案 α — Split View: Palette Fixed Top / Results Scrollable Bottom
- UX パターン分類: Master-Detail within Single Screen + Persistent Control Panel + Live Search
- 主な理由: Iterative Refinement (`æ` → `æk` → `ækt` 段階絞り込み) が学習の中心、Live Feedback で学習効果即時発現、Recon §5 の latency 0.15ms mean で debounce 不要
- 却下: 案 β (Full-Screen Palette → Results as Separate Route、Sequential Task Pattern が試行錯誤型と不整合)、案 γ (Bottom Sheet、Non-Modal 思想と矛盾)

**判断 4-C: `3c` 記号分類軸**
- 決定: 案 α — IPA Chart Standard Grouping (音声学的分類)
- UX パターン分類: Domain-Standard Taxonomy + Educational Structure
- 主な理由: 国際音声協会公式分類 = Domain Standard 遵守、UI 自体が音声学教材として機能、心的モデル一致 (「æ の音を探す」= 「前舌低母音を探す」思考が UI と一致)
- 却下: 案 β (Learning-Priority Grouping、記号難易度は母語依存で普遍順序不成立 + CEFR タグと情報冗長)、案 γ (Alphabetical / 視覚類似、音声学知識が UI から得られず心的モデル不一致)

**判断 5: PR 分割**
- 決定: 案 α — 3 分割
  - PR-1: `3b` + `3c` (検索系統合、Navigation Stack 一体性で許容)
  - PR-2: `3d` 学習状況 (独立)
  - PR-3: `3h` テキスト拡張 + `3f` 廃止 docs + i18n leaf 集約更新
- 分割論分類: Feature Coherence-Based Splitting + Vertical Slice Delivery
- 主な理由: Navigation Stack Unity で `3b`/`3c` の分割コスト回避 (2 度手間の Route 仮実装削除)、user-facing value の Vertical Slice、Cursor Phase 0 Recon 対象の独立性、Naoya 実機検収の負荷分散
- 却下: 案 β (4 分割、`3b`/`3c` Navigation Stack 分断で意匠検証が 2 PR にまたがる)、案 γ (2 分割、~25 ファイル超規模で分割判断軸 2 明白違反 + PR Rv 負荷極大)

### 統合設計思想

Phase 1-E は **「Non-Modal / Route-Based Architecture + Feature Coherence + Domain Standard」の 3 大原則** で貫かれる。Phase 1-B / 1-D で確立された共通基盤 (Progress meter / CEFR pill / マーキング 3 スロット / 音象徴視覚化 / Mood B トークン) を最大再利用しつつ、`3c` で「専門記号ピッカー UX を学習教材として設計する」Phase 1-E 独自の意匠テーマを実現。

Non-Modal / Route-Based Architecture の 3 段階移行完成:
1. Phase 1-B (#85 / #86): settings modal 撤去
2. 判断 2 (本セッション): `3f` 独立画面廃止
3. 判断 3-A (本セッション): `3b` Modal → Full-Page Route

### 関連 Issue / PR / Vault

- Phase 1-E PR-1: Issue [#91](https://github.com/nkhippo/IPASoundDrill/issues/91) (起票済、Cursor Phase 0 待ち)
- Vault handoff: `30_projects/IPASoundDrill/handoff/current-state.md` (本セッションで prepend)
- Vault SoT: `30_projects/IPASoundDrill/design/phase-1/design-tokens.md` (commit `680d83ec`)
- Recon: `docs/design/phase-1/screen-data-mapping.md` (PR #80 merge 済)
- Vault project instructions: `30_projects/IPASoundDrill/project_instructions.md` (v1.1)
- 共通運用ルール: `00_meta/operations/dev_project_common.md` (v1.1)

### 記事化候補 (発信素材化)

3 テーマの note 素材候補:
1. **Non-Modal / Route-Based Architecture への 3 段階移行** — Phase 1-B / 判断 2 / 判断 3-A の連続性、Settings Rathole Anti-Pattern 撲滅論、Nielsen #3 (User Control and Freedom) の実践事例
2. **専門記号ピッカーを学習教材として設計する** — 判断 4-A/4-B/4-C の統合論、Domain-Standard Taxonomy を UX に採用する意義、Query Builder + Split View + IPA Chart Grouping の相乗効果
3. **Vanilla JS + IntersectionObserver での Virtualization 実装** — Track A 制約下でのパフォーマンス設計、Facebook Skeleton UI 論の適用、Google Core Web Vitals INP < 200ms 達成の実装パターン


## 2026-07-20 (1) — Phase 1-E PR-2 起票準備セッション、判断 8-11 全 4 論点確定

### 決定サマリ

Phase 1-E PR-2 (`3d` 学習状況) の残論点 4 件 (判断 8-11) を Chat で整理・裁定。判断 8/9/10 は Claude 推奨 案 α 採用、**判断 11 は Naoya 独自判断で 案 γ (SRS 全件表示) 採用** (Claude 推奨は 案 α 5 件上限)。Issue [#120](https://github.com/nkhippo/IPASoundDrill/issues/120) 起票完了、Cursor Phase 0 5 事例目待ち。

### 判断の詳細

**判断 8: `3d` Route path**
- 決定: 案 α — `#/progress`
- UX パターン分類: Semantic Short Path + Functional Naming
- 主な理由: `#/vocab` / `#/vocab/ipa` の命名慣行継承 (Consistency and Standards、Nielsen #4)、Predictability + Memorability、Scalability
- 却下: 案 β (`#/status`、Semantic Ambiguity + `onboarding_completed_v1` との Semantic Collision)、案 γ (`#/learning-status`、Verbosity + Track A の他 route 慣行と不整合)

**判断 9: `3d` CEFR フィルタ初期値**
- 決定: 案 α — `prev_settings_v1.cefrLevels` 連動 (既定 A1+A2)
- UX パターン分類: **Contextual Defaults Pattern** + Personalized State Continuity
- 主な理由: `3d` は personal / practice progress viewer コンテキスト、`3a` プロフィール (practice 設定) との目的一致 (Nielsen #4)、Relevance Maximization (Signal-to-Noise Ratio)
- **判断 7 との対比構造 (Contextual Defaults の核心)**:
  - `3b` (explore コンテキスト) = 全 CEFR 初期表示 (判断 7 案 β 確定済)
  - `3d` (personal/practice コンテキスト) = `prev_settings_v1` 連動 (本判断 案 α)
  - Amazon 商品検索 vs 注文履歴、Netflix ブラウズ vs マイリストと同型の Contextual Defaults 実装
  - 同一 UI コンポーネント (CEFR pill) が画面の目的で異なる初期値を持つのは Anti-Pattern ではなく、Material Design 3 の "Adaptive Defaults" 概念と同系
- 却下: 案 β (全 CEFR 初期表示、未着手 CEFR の 0% 表示が Signal-to-Noise 低下)、案 γ (動的判定、Cold Start Problem + Over-engineering)

**判断 10: `1a` からの導線**
- 決定: 案 α — `1a` に「学習状況を見る」新規カード追加
- UX パターン分類: Feature Card Pattern + Top-Level Entry Point
- 主な理由: High Discoverability + Parity of Importance (practice / explore / review を対等な機能として位置付け)、Duolingo / Khan Academy 等の学習アプリで進捗確認が主要機能として対等扱いされる慣行
- **判断 3-B (`3c` 導線 = Segmented Toggle) との違い**: `3c` は `3b` 検索モードの一種 (連続性)、`3d` は独立した振り返り機能カテゴリ (`1a` 目的カードと対等) なので Feature Card 配置が正当。矛盾しない
- 却下: 案 β (ヘッダー progress アイコン、Icon-Only Signifier 弱さ + Topbar 圧迫)、案 γ (ドリル完了サマリー導線、Single Point of Discovery)

**判断 11: SRS 復習キュー表示件数上限**
- 決定: **案 γ — 制限なし (全件表示)** (Naoya 独自判断)
- UX パターン分類: Complete Information Pattern + `3d` 単体完結
- Naoya 選択理由 (推測): 情報網羅性を優先、`2c` Study への Responsibility Delegation より `3d` 単体完結の設計思想を優先
- **Claude 推奨との差異**: Claude 推奨は 案 α (5 件上限 + `2c` 導線、判断 1 の主従関係「補助セクション」維持を優先)。Claude は Miller's law + Visual Hierarchy を根拠に案 α を推奨したが、Naoya は判断 1 の意匠を再解釈 (「補助セクション」の位置は維持しつつ件数制限を撤去) することで案 γ を採用可能とした
- 判断 1 の意匠への影響: `3d` の位置付けが「学習状況ダッシュボード」から「SRS 管理も含む総合振り返り画面」に拡張。Virtualization 適用判定基準 (想定最大件数 > 100 件時に PR-1 パターン再利用) を Issue 本文に明示することで技術的実現性を担保
- 却下: 案 α (Claude 推奨、5 件上限)、案 β (10 件上限)

### 統合設計思想

Phase 1-E PR-2 は Phase 1-E PR-1 で完成した **Non-Modal / Route-Based Architecture + Feature Coherence + Domain Standard の 3 大原則** を継承しつつ、新たに以下の設計思想を導入:

- **Contextual Defaults Pattern の実装** (判断 9): 画面の目的コンテキスト (explore vs personal) でフィルタ初期値を変える。Nielsen #4 Consistency の深い解釈 (「ユーザーの期待と実際の挙動の一致」= 目的が異なれば期待も異なる)
- **Feature Card Pattern の対等配置** (判断 10): practice (ドリル) / explore (`3b`/`3c`) / review (`3d`) の 3 機能柱を `1a` トップで対等に提示、学習動機の持続を UI で最大化
- **Complete Information Pattern** (判断 11、Naoya 独自判断): `3d` を「振り返りのハブ」として位置付け、外部画面への依存を最小化

### PR-2 実装後の Phase 1 UI/UX 到達点予測

- Phase 1 UI/UX マイルストーン: 8/11 → **9/11** (残 1-E-PR3 / 1-F / 1-G / 1-H)
- Phase 1 の主要 3 機能柱 (practice / explore / review) 完成
- `1a` トップ = 4 ドリルカード + `3b` Vocab (topbar) + `3d` Progress (新規カード) の完全な機能ダッシュボード

### 関連 Issue / PR / Vault

- Phase 1-E PR-2: Issue [#120](https://github.com/nkhippo/IPASoundDrill/issues/120) (起票済、Cursor Phase 0 待ち)
- Phase 1-E PR-1: Issue [#91](https://github.com/nkhippo/IPASoundDrill/issues/91) / PR [#92](https://github.com/nkhippo/IPASoundDrill/pull/92) (merge 済、Non-Modal / Route-Based Architecture 3 段階移行完成)
- Vault design-decisions § 2026-07-19 (6) (Phase 1-E 判断 1-5 集約、commit `1b073df8`)
- Vault handoff: `30_projects/IPASoundDrill/handoff/current-state.md` (本セッションで prepend、commit `282977e2`)

### 記事化候補 (発信素材化)

判断 8-11 で追加された note 素材候補:
1. **Contextual Defaults の実装事例** — `3b` explore vs `3d` personal で異なる CEFR 初期値、Nielsen #4 Consistency の深い解釈、EC / ストリーミングサービス慣行との対比
2. **Feature Card Pattern の対等配置** — practice / explore / review の 3 機能柱、Duolingo / Khan Academy との対比、学習アプリの進捗機能の位置付け論
3. **Naoya 独自判断による意匠拡張の記録** — 判断 11 で Claude 推奨と異なる案 γ を採用した経緯、Claude 推奨の「Visual Hierarchy 維持」vs Naoya の「情報網羅性 + 単体完結」の設計思想対立と統合、意匠拡張 (下位セクションの件数制限撤去) による解決

これで発信素材候補は累計 8 テーマ (Phase 1-E 全体):
- Cursor Phase 0 設計懸念点検フロー 4 事例累積論
- Non-Modal / Route-Based Architecture への 3 段階移行完成論
- 専門記号ピッカーを学習教材として設計する (判断 4-A/4-B/4-C 統合論)
- Vanilla JS + `IntersectionObserver` 不採用 + scroll event + `cum[]` 累積 offset での Virtualization 実装論
- Contextual Defaults の実装事例 (`3b` explore vs `3d` personal)
- Feature Card Pattern の対等配置 (practice / explore / review)
- Naoya 独自判断による意匠拡張の記録 (判断 11)
- Cursor / Claude / Naoya の 3 者判断構造 (判断割れの明示裁定パターン)


## 2026-07-21 (1) — Phase 1-E PR-3 起票準備セッション、判断 12-13 確定

### 決定サマリ

Phase 1-E PR-3(Phase 1-E クロージング Issue、`3h` テキスト拡張 + `3f` 廃止 docs + i18n leaf 集約 + LAUNCH-CHECKLIST 完了マーク)の残論点 2 件を Chat で整理・裁定。判断 12(`3h` テキスト内容進め方)+ 判断 13(`3f` docs 廃止マーク表現)の 2 判断が確定。Issue [#122](https://github.com/nkhippo/IPASoundDrill/issues/122) 起票完了、Naoya `3h` 文言提示待ち + Cursor/Codex Phase 0 待ち。

### 判断の詳細

**判断 12: `3h` テキスト内容の進め方**
- 決定: 案 α — Claude が構造テンプレを提示、文言は Naoya が Issue Comment or Chat で提示、Cursor/Codex が i18n key 化 + HTML 実装 + 5 言語翻訳(ko / zh-Hans / zh-Hant / fil)
- UX パターン分類: **Role Separation Pattern**(構造 = Claude、文言 = Naoya、実装 = Cursor/Codex)+ Product Voice Ownership(プロダクトの声はプロダクトオーナーの意思決定領域)
- 主な理由:
  - `3h`「このアプリについて」はプロダクトの声そのもの = Naoya の意思決定領域
  - Claude が draft を書いても Naoya の声そのものではない(Claude 推奨の分析はプロダクトの意思ではない)
  - 構造の一貫性は Claude が保証、文言の魂は Naoya のもの、実装は Cursor/Codex の役割分担
  - 案 β(Naoya 完全文言先出し)は Naoya の作業時間が起票前ブロッキング、Phase 1-E クロージング時期がずれるリスク
  - 案 γ(Claude draft)はプロダクトの声の代弁になりうるリスク
- 却下: 案 β(先出し) / 案 γ(Claude draft)
- Claude 提示の 5 セクション構造テンプレ:
  1. リード段落(50-100 字)
  2. なぜ IPA を学ぶか(200-300 字)
  3. このアプリの特徴(400-600 字、Phase 1-A〜PR-2 完成機能の 4-5 項目)
  4. 開発者メッセージ or Naoya のこだわり(200-400 字、省略可)
  5. お問い合わせ / ライセンス / バージョン(100-200 字)

**判断 13: `3f` docs 廃止マーク表現**
- 決定: 既存運用継続(取消線 + 廃止マーカー、Phase 1-B / 判断 2 / PR-3 の 3 段階履歴保持)
- UX パターン分類: **Documented Deprecation Pattern**(履歴保持型廃止表記、W3C / MDN / Kubernetes 等の慣行と同型)
- 主な理由:
  - PR-1 merge 時点で DESIGN.md `~~言語設定~~` 表記が運用済、既存パターンの継承
  - 案 α(完全削除)は Phase 1-B の意思決定履歴(settings modal 撤去)+ 判断 2 の意思決定(`3f` 廃止決定)の 2 段階移行履歴が失われる
  - 案 γ(削除 + 変更履歴)は履歴の分散を招く(該当箇所と履歴セクションの 2 箇所参照が必要)
  - 判断相談不要(既存運用継続で確定)
- 却下: 案 α(完全削除) / 案 γ(削除 + 変更履歴)

### 統合設計思想

Phase 1-E PR-3 は Phase 1-E クロージング Issue として、以下の設計思想を統合:

- **Vertical Slice Delivery の Feature Coherence + Clean Closing**: 判断 5(3 分割 PR)の Feature Coherence 論理を、PR-3 で「クロージング Issue」として完結。Phase 1-E 全体の 3 分割(検索系 / 学習状況 / クロージング)が Vertical Slice の完全なクロージングを達成
- **Product Voice Ownership**(判断 12): プロダクトの声はプロダクトオーナー(Naoya)の意思決定領域、AI エージェント(Claude / Cursor / Codex)は構造・実装・翻訳を担当
- **Documented Deprecation**(判断 13): 意思決定履歴を docs で保持することで、将来の設計判断の参照点として機能。Non-Modal / Route-Based Architecture の 3 段階移行が docs から追跡可能
- **Codex 教訓の Issue 起票標準化**: 分類正本 + データソース + パスの 3 点精読を Issue 本文に反映、5 事例累積の学びを次 Issue から継続

### Phase 1-E クロージング後の Phase 1 UI/UX 到達点予測

- Phase 1 UI/UX マイルストーン: 9/11 → **10/11**(Phase 1-E 完了、残 1-F / 1-G / 1-H)
- Phase 1-E 全体完了(3 分割 PR): 検索系 + 学習状況 + クロージング
- Non-Modal / Route-Based Architecture 3 段階移行 docs 完全反映
- Track A ローンチ準備の最終仕上げ(`3h` プロダクトメッセージ確立)

### 関連 Issue / PR / Vault

- Phase 1-E PR-3: Issue [#122](https://github.com/nkhippo/IPASoundDrill/issues/122)(起票済、Naoya 文言提示 + Cursor/Codex Phase 0 待ち)
- Phase 1-E PR-2: Issue [#120](https://github.com/nkhippo/IPASoundDrill/issues/120) / PR [#121](https://github.com/nkhippo/IPASoundDrill/pull/121)(merge 済)
- Phase 1-E PR-1: Issue [#91](https://github.com/nkhippo/IPASoundDrill/issues/91) / PR [#92](https://github.com/nkhippo/IPASoundDrill/pull/92)(merge 済)
- Vault design-decisions § 2026-07-19 (6)(判断 1-5 集約、commit `1b073df8`)
- Vault design-decisions § 2026-07-20 (1)(判断 8-11 集約、commit `5a289ea3`)
- Vault handoff: `30_projects/IPASoundDrill/handoff/current-state.md`(本セッションで prepend、commit `d4305621`)
- Repo SoT: `docs/CHANGE-CLASSIFICATION.md`(正本、commit `a5cc75f4`)

### 記事化候補 (発信素材化、累計 12 テーマ)

判断 12-13 で追加された note 素材候補:
1. **Vertical Slice Delivery の Feature Coherence + Clean Closing** — 判断 5(3 分割 PR)の設計論を Phase 1-E クロージングで完結、Agile の Vertical Slice 論との対比
2. **Codex Phase 0 教訓の Issue 起票フロー標準化** — Codex 教訓 A-1 / A-2 / A-5 を分類正本 + データソース + パスの 3 点精読として Issue 起票標準に組み込み、5 事例累積の学びの体系化
3. **Product Voice Ownership** — プロダクトの声はプロダクトオーナーの意思決定領域、AI エージェントは構造・実装・翻訳を担当する Role Separation Pattern
4. **Documented Deprecation Pattern** — 意思決定履歴を docs で保持する慣行、Non-Modal / Route-Based Architecture 3 段階移行の追跡可能性

これで発信素材候補は累計 12 テーマ (Phase 1-E 全体):
- Cursor Phase 0 4 事例累積論
- Non-Modal / Route-Based Architecture 3 段階移行完成論
- 専門記号ピッカーを学習教材として設計する論
- Vanilla JS + `IntersectionObserver` 不採用 + scroll event + `cum[]` 累積 offset での Virtualization 実装論
- Contextual Defaults 実装事例論(`3b` vs `3d`)
- Feature Card Pattern 対等配置論(practice / explore / review)
- Naoya 独自判断による意匠拡張の記録(判断 11 / 判断 6)
- Cursor / Claude / Naoya の 3 者判断構造論(判断割れ明示裁定パターン)
- Codex Phase 0 初事例と Cursor / Codex の 2 系統 AI エージェント比較論
- ブラウザ実操作検証で Phase 0 論点を追加発見するフロー論
- **Vertical Slice Delivery の Feature Coherence + Clean Closing**(NEW)
- **Codex Phase 0 教訓の Issue 起票フロー標準化**(NEW)
- **Product Voice Ownership + Documented Deprecation Pattern**(NEW、判断 12/13 論)

累計 13 テーマ(重複統合前)、Track A ローンチ後の発信素材化フェーズで note.com シリーズ「AI 時代に求められるスキル」への統合が可能。

---

## 2026-07-23(2) - PC UI CD 準拠 + About SRS 削除 の統合 Issue で処理、および Phase 1-F 統合方針

### 決定事項

1. **Issue 分割方針(判断 A)**: 案 β 採用 = PC UI CD 準拠改修 + About SRS 削除 + `vocab.filter.*` 整理 を **1 Issue 統合**(Issue #147)。Phase 1-F は別 Issue。
2. **進行順序(判断 B)**: 案 α 採用 = PR #146(dev_project_common / DIVERGENCE / スクショ必須ルール導入)を先 merge → 新 Issue #147 でルール初適用。
3. **Phase 1-F の Chat 分離(判断 C)**: 案 β 採用 = 今 Chat で PC 改修 → 完了後に Phase 1-F へ移行。
4. **Phase 1-F Issue 統合方針**: 3g オンボーディング(SP + PC)と SP guide `?` btn 再導入を **1 Issue 統合**、Category F = C(CD 整備済み確認)。
5. **PC 品質補完 Issue の独立起票**: Issue #147 の scope 4 / scope 2 未達を補完する Issue を Phase 1-F と並行して独立起票。
6. **Rv 改善候補 4 点の逐次起票**: 一括ではなく、優先度と機会に応じて順次起票(次回以降 stack)。

### 却下された選択肢

- **判断 A 案 α(3 Issue 分離)**: PR 数増大 + PC 4 画面はまとまり感がある改修で分ける利得が限定的。ただし Issue #128 の反映漏れ再発を最も避けるなら保守的な選択肢だった。
- **判断 A 案 γ(6 Issue 分割)**: PC 全画面共通の header 修正が 1 画面 Issue にまたがる、オーバーヘッド大。
- **判断 B 案 β(PR #146 と並行)**: DIVERGENCE.md が存在しない状態で参照する Issue を書くのは宣言形の運用と衝突。
- **判断 C 案 β の一部(PR #146 と並行実施)**: 手戻り最小化の観点から却下。

### 判断根拠

- handoff/current-state.md に「About features item_5 SRS 記述削除 + `vocab.filter.*` 未使用キー整理: PC 改修 Issue に統合可能」と明記されていた
- Phase 1-F は roadmap 上も R04(IPA / 運用整備)領域で分けるのが自然
- CD-first パイプラインの実運用開始として、PR #146 の運用ルール(宣言形 / 受け入れアサーション / スクショ必須)を統合 Issue でフル適用することが有意義

### 学び(次 Issue 起票時に反映)

- **受け入れアサーションの構造的弱点**: 「grep 数 ≥1」の必要条件だけでは「動作時に全画面で見える」ことの十分条件にならない。Naoya 実機で発見された 3 件(TOPへ残存 / header-nav in-play 消失 / Mode B Study 2 ペイン未対応)は全てこの弱点に起因。改善候補 1 に「動作時 visibility 検証手段(matchMedia + display 状態確認)」を追記
- **regex の過大**: `srs|SRS|spaced|復習|复习|간격|espaciad` は「復習」(review of missed items)まで捕まえる過大 regex。SRS(spaced repetition)固有語に絞るべき。改善候補 1 に反映
- **Cursor 自己判断の運用境界**: Issue #147 実装で accent-card textContent 上書きバグの自己修正(scope 3 に密接に関連する #128 残バグ)が透明性は保ちつつ混入。DEV-GUARDRAILS § 5 原則との運用境界を明文化する必要。改善候補 2 に反映
- **CD-first パイプラインの効果**: PR #146 導入の 5 項目(Rv raw+grep / 宣言形 / 削除掃討 3 種 / 受け入れアサーション / スクショ必須)は Issue #147 でフル機能。宣言形は Cursor の自己修正的解釈が働き、scope 5 の削除掃討 3 種は完全実施された

### 関連 Issue / PR / Chat 記録

- Issue #147: https://github.com/nkhippo/IPASoundDrill/issues/147
- PR #148(merged): https://github.com/nkhippo/IPASoundDrill/pull/148
- 参照: PR #146 (dev_project_common / DIVERGENCE / スクショ必須の初導入)、Issue #128 / PR #140(SP UI CD 準拠 13 項目)
- Chat 記録: `10_chat_logs/2026/07/2026-07-23_issue-147-rv-and-phase-1-f-planning.md`(Vault MCP create_note 失敗のため Artifact 保持中)

---

## 2026-07-24 - Phase 1-F + PC 補完完了、DIVERGENCE.md 完全空到達

### 決定事項

1. **PR #151 / PR #152 の Rv 判定**: 両 PR 合格(条件付き — Naoya 実機で最終)。構造アサーション全 PASS、動作時 visibility 検証(CDP)実施済み(PR #152 で改善候補 1 の実運用第 1 号)
2. **Phase 1 milestone 集約状況**: 5/6 完了、1-G(多言語 variant)のみ残
3. **DIVERGENCE.md 完全空到達**: CD-first パイプラインの第 1 サイクル完了、以後の CD 更新はすべて Issue 起票の前提整備が確立
4. **改善候補の総数**: 6 件に増加(5: LS dual-write 整理、6: scope 密接関連バグ修正の事前相談ルール)、逐次起票 stack

### 却下された選択肢(過去の判断整理)

該当なし(本セッションは判断相談なしの実装 → Rv フロー)

### 判断根拠

- **PR #151 の観点 8 判定**: REPO-STRUCTURE の docs 整理は #128 で削除済み関数の記述整合であり、実装本体に影響なし + Cursor Retrospective に明記されているため軽微と判定
- **PR #152 の観点 8 判定**: `showPurposeHome` の exclusive page クリアは scope 4/5 の動作正確性に密接に関連(PC ドリル画面遷移時の wrap 隠れ残存が visibility に影響)、透明性 100% で Retrospective に明記されているため追認判定
- **動作時 visibility 検証の運用開始**: 改善候補 1 が PR #152 で実運用に乗ったのは、L3 Rv の構造的な弱点(定義存在 = 動作時 visibility ではない)への具体的な対処法として重要な前進

### 学び(次 Issue 起票時に反映)

- **CD-first パイプラインの検証済み効果**: PR #146 → #147/#148 → #149/#150 → #151/#152 の 3 サイクルで、宣言形 / 受け入れアサーション / スクショ必須ルールが期待通り機能。Issue #128 での反映漏れ再発ゼロ
- **改善候補 1 の docs 化必要性**: PR #152 で CDP visibility 検証が実運用に乗ったので、dev_project_common § の受け入れアサーション節に「動作時 visibility 検証(CDP + matchMedia + getComputedStyle)」パターンを正式追記候補
- **Cursor 自己判断の運用境界**: PR #148 の accent-card fix、PR #152 の showPurposeHome exclusive page クリアと同パターンが 2 回発生。改善候補 6(dev_project_common § 5 への追記)は優先度を上げるべき
- **LS 契約の設計**: PR #151 の dual-write パターンは防衛的だが冗長。今後の LS 契約は「単一書き込み + 定数集約」を推奨(改善候補 5)

### 関連 Issue / PR / Chat 記録

- Issue #149 → PR #151(merged 2026-07-24)
- Issue #150 → PR #152(merged 2026-07-24)
- Rv 12 観点コメント: PR #151(comment 5064974673)、PR #152(comment 5064978337)
- Chat 記録: `10_chat_logs/2026/07/2026-07-24_pr-151-152-rv-and-phase-1-completion.md`

### 現状の Phase 1 完了状況

| Phase | 状態 | 参照 Issue |
|---|---|---|
| 1-A | 完了 | — |
| 1-B | 完了 | — |
| 1-C | 完了 | — |
| 1-D | 完了 | — |
| 1-E | 完了 | #91 / #120 / #122 |
| 1-E-CD | 完了 | #128 |
| 1-F | 完了 | #149 |
| 1-H | 完了 | #147 |
| 1-H 補完 | 完了 | #150 |
| 1-G | **未着手** | — |

Phase 1 全体では 9/10 milestone 完了、Phase 1-G のみ残。

### 次セッションの起点

**優先度順の候補**:
1. Phase 1-G(多言語 variant `-en`)の Issue 起票判断相談
2. 改善候補 6 点の逐次起票開始(改善候補 1 は docs のみで済むため先行候補)
3. R03(IPA / CD 取込)→ R04(IPA / 運用整備)遷移条件確認(DIVERGENCE.md 完全空 + Phase 1-G 完了で R03 完全完了)

---

## 2026-07-24(2) - 改善候補 1 docs 正典化完了、Codex 初参画実運用開始

### 決定事項

1. **PR #154 の Rv 判定**: 合格。L1 docs 追記のみ、構造アサーション全 PASS、既存 § 破壊的変更なし、Codex 自己判断による追加変更ゼロ
2. **Codex 実運用開始**: Issue #153 が本プロジェクトにおける Codex 初参画 PR。Cursor と同等品質を確認、以後の Issue で Cursor / Codex を Issue 属性で使い分ける
3. **改善候補 1 の docs 正典化完了**: dev_project_common への「動作時 visibility 検証」+「regex 精緻化ガイダンス」+ Rv 観点 10 拡張が完了。以後の C6 UI 改修 Issue で自動適用
4. **改善候補 stack の現状**: 5 件残(2-6)、Phase 1-G と並行 or 後回しで逐次起票

### 却下された選択肢

該当なし(本セッションは Rv → 次タスク準備の流れ、判断相談なし)

### 判断根拠

- **PR #154 の観点 8 判定**: 「自己判断による追加変更: なし」と Codex 明記。PR #148(Cursor accent-card fix)/ PR #152(Cursor showPurposeHome exclusive page)とは異なる clean な実装。Codex の実装スタイルは「Issue 指定範囲のみ」を厳守する傾向を確認
- **既存 Rv 12 観点表が現行文書に不在**という Codex 発見への適応判断: 観点 10 を § 1 内サブ § として明示配置。Issue の Scope 2 は柔軟性を持たせて「観点 10 拡張 or 観点 13 新設」と記述していたため、Codex の適応判断は Issue 意図通り
- **CDP テンプレートの一般化**: PR #152 の具体例から Node.js + Playwright の一般テンプレートへの展開は、Codex が「後続 Issue が再利用可能な形式」を優先した判断で、docs 正典化の目的と整合

### 学び(次 Issue 起票時に反映)

- **Codex vs Cursor の使い分け**: Codex は docs / 単一ファイル改修に強く、Cursor 過去 PR で見られた「scope 密接関連バグの自己修正」パターンが Codex では発生しなかった。Issue 分類による Agent 選択の可能性(L1 docs → Codex 優先、L3 実装複合 → Cursor 継続、等)
- **改善候補 1 の実運用効果**: PR #152 の実装例が docs 正典化されたことで、Phase 1-G の受け入れアサーション設計時に CDP visibility 検証を Issue 本文に埋め込みやすくなる
- **Rv 12 観点表の docs 現状**: 現行 dev_project_common には「12 観点表そのもの」はなく、観点 10 / 13 の参照のみ。将来的に 12 観点表を明示配置するか、現行の分散配置を継続するかは別途判断
- **6 言語漏れチェックの重要性**: zh-Hant の `複習`(繁体字)が Issue #147 Rv で当初漏れていた事実を明文化。今後の削除掃討で同種の漏れを防ぐガイダンスが確立

### 関連 Issue / PR / Chat 記録

- Issue #153 → PR #154(merged 2026-07-24、Codex 初参画)
- Rv 12 観点コメント: PR #154 comment 5065526612
- 参照: Issue #150 / PR #152(改善候補 1 の実運用第 1 号、CDP visibility 検証実装)、Issue #147 / PR #148(構造弱点が露呈した契機)
- Chat 記録: `10_chat_logs/2026/07/2026-07-24_pr-154-improvement-1-codex.md`

### 現状の改善候補 stack

| # | 内容 | 状態 |
|---|---|---|
| 1 | 受け入れアサーション regex 精緻化 + 動作時 visibility 検証手段 | 完了(#153 / PR #154) |
| 2 | Cursor 自己判断 bug fix の運用ルール明文化 | Stack |
| 3 | C6 UI PR のスクショ代替運用(Preview URL) | Stack |
| 4 | Phase 分割コミットの diff からの可検証性 | Stack |
| 5 | LS dual-write パターン整理 | Stack |
| 6 | scope 密接関連バグ修正の事前相談ルール明文化 | Stack(2 と統合起票候補) |

### 次セッションの起点

**優先度順の候補**:
1. **Phase 1-G(多言語 variant `-en` 等、5 言語全 variant)起票**: 判断 A 案 β 確定済み、判断 B / C / D を新たに提示
2. **改善候補 2 / 6 の統合 docs Issue 起票**(判断次第)
3. **Phase 1-G 完了時点で roadmap R03 → R04 遷移確認**

---

## 2026-07-24(3) - Phase 1 完全完了、CD-first パイプライン第 2 サイクル完了

### 決定事項

1. **PR #156 の Rv 判定**: 合格。4 スコープ全 PASS、Naoya の Phase 0 / Phase 3 承認内容を完全反映、Codex 自己判断による追加変更 0 件
2. **Phase 1 完全完了**: 6/6 milestone(1-A / 1-B / 1-C / 1-D / 1-E / 1-E-CD / 1-F / 1-H / 1-H 補完 / 1-G)完了、LAUNCH-CHECKLIST v3.5 で反映
3. **DIVERGENCE.md への統合記載採用(選択肢 A)**: 5 言語 variant CD 意匠差 6 行 + font metrics 判定基準 1 行を DIVERGENCE.md に統合、意匠差の透明化を確立
4. **改善候補 7 の新規追加**: font metrics 差の判定基準(overflowY + visible + diff ≤ 3px + containerRatio ≤ 1.05)を dev_project_common § 3 に追記候補として stack、Phase 1-G で確立した PASS 条件柔軟化の正典化
5. **Codex 実運用パターン確立**: 3 度目参画で判断ゲート運用(Phase 0 → 承認 → Phase 2 → Phase 3 → 承認 → Phase 4-5)が安定化
6. **roadmap R03 → R04 遷移条件**: 満たす(Phase 1 全 milestone 完了 + DIVERGENCE 意匠差の透明化)

### 却下された選択肢

- **選択肢 B(Codex 提案そのまま採用)**: 却下 → 改善候補 7 として stack することで、以後の C6 UI Issue で自動適用される価値を確保
- **選択肢 C(DIVERGENCE 厳格運用)**: 却下 → font metrics 判定基準を DIVERGENCE から分離すると、判定基準の分散でリファレンス箇所が不明瞭化する懸念

### 判断根拠

- **選択肢 A 採用**: 技術的妥当性(Codex の font metrics 分析は正確、`overflow: visible` で視覚破綻なし)+ CSS/i18n を触らない副作用回避 + DIVERGENCE への統合記載の可読性 + 改善候補 7 stack による dev_project_common への docs 化ルートの確保、4 点の利点が bal よく揃う
- **32 件 overflow 全許容の妥当性**: font metrics(ink box vs line box)の 1-3px 差は Serif / IPA フォント環境の既知現象、`overflow: visible` で clip されない = ユーザーには全く見えない。CSS 調整(line-height 修正)は意匠に影響、i18n 短縮は文言変更で副作用大
- **Codex の 3 度目参画評価**: Issue #153(docs 追記)/ Issue #155 Phase 0(設計)/ 現 PR #156(実装)で「Issue 指定範囲厳守 + 自己判断による追加変更 0 件」のスタイルが完全に確立、Cursor 過去 PR #148/#152 で見られた scope 密接関連バグの自己修正パターンは Codex では発生していない

### 学び(次 Issue 起票時に反映)

- **改善候補 1 の実運用効果**: PR #152(6 画面)→ PR #154(docs 正典化)→ PR #156(360 行本格運用)の 3 段階で CDP visibility 検証パターンの信頼性が完全に確立、以後の C6 UI Issue で受け入れアサーションに埋め込みやすい形になった
- **font metrics 差判定の重要性**: Serif / IPA フォント環境では厳密 overflow 判定が false positive を発生させる既知現象、実務的な判定条件(overflow: visible + diff ≤ 3px)を明文化しないと以後の QA で毎回同じ議論が必要になる → 改善候補 7 の docs 化価値が高い
- **DIVERGENCE の運用範囲**: 「CD 意匠差」+「実装上の判定基準」の 2 種を統合記載できる柔軟性が確認された。Track B 準備段階での CD 完全整備再検討時のリファレンスとして機能
- **Naoya-Codex 判断ゲート運用**: Phase 0 承認 → Phase 2 実行 → Phase 3 判断依頼 → 承認 → Phase 4-5 の流れが実運用に乗った。Cursor よりも判断ゲートが明示的で、Naoya の関与が「大きな判断のみ」に絞られる利点
- **Cursor vs Codex 使い分けパターン**: L1 docs は Codex 優先(自己判断透明性)、L3 実装複合は Cursor 継続(実装能力の実績)、L3 UI QA は Codex(判断ゲート運用の親和性)、というパターンが実運用で確立しつつある

### 関連 Issue / PR / Chat 記録

- Issue #155 → PR #156(Naoya マージ待ち、Rv 合格、Codex 3 度目参画)
- Rv 12 観点コメント: PR #156 comment 5066285479
- Phase 0 Recon Comment: Issue #155 comment 5065761102(Codex 設計)
- Phase 0 承認 Comment: Issue #155 comment 5065783277(Naoya 承認 + 3 補足要求)
- Phase 2 完了 / Phase 3 判断依頼 Comment: Issue #155 comment 5065965579(Codex 32 件検出報告)
- Phase 3 選択肢 A 承認 Comment: Issue #155 comment 5066238511(Naoya 承認)
- 参照: PR #154(改善候補 1 docs 正典化)、PR #152(改善候補 1 実運用第 1 号)、PR #148(構造弱点露呈契機)
- Chat 記録: `10_chat_logs/2026/07/2026-07-24_phase-1-completion-pr-156.md`

### Phase 1 完了時点の Repo 状態

**Category F 統計**:
- Phase 1 全 6 milestone: F=C が 4 件、F=B(DIVERGENCE 追記)が 1 件、F=A(CD 更新)が 0 件
- DIVERGENCE 追記件数: 7 行(第 1 サイクル 0 → 第 2 サイクル 7 = 5 言語 variant 6 + font metrics 判定 1)

**改善候補 stack 更新**:

| # | 内容 | 状態 |
|---|---|---|
| 1 | 受け入れアサーション regex 精緻化 + 動作時 visibility 検証手段 | **完了(#153 / PR #154)** |
| 2 | Cursor 自己判断 bug fix の運用ルール明文化 | Stack |
| 3 | C6 UI PR のスクショ代替運用(Preview URL Vercel deployment) | Stack |
| 4 | Phase 分割コミットの diff からの可検証性 | Stack |
| 5 | LS dual-write パターン整理 | Stack |
| 6 | scope 密接関連バグ修正の事前相談ルール明文化 | Stack(2 と統合起票候補) |
| 7 | font metrics 差の判定基準を dev_project_common に追記(Phase 1-G 確立) | Stack(新規、Naoya 承認次第) |

Stack 残 6 件、Phase 1 完了後の Track A ローンチ準備と並行 or 後回しで逐次起票。

### 次セッションの起点

**優先度順の候補**:
1. **roadmap.md 更新**: R03(IPA / CD 取込)完全完了マーク → R04(IPA / 運用整備)へ ready 遷移、Mermaid flowchart 更新
2. **改善候補 7 の docs Issue 起票**(Codex 継続向き、L1 × C1、堅固化 B)
3. **改善候補 2 / 6 の統合 docs Issue 起票**(Cursor 自己判断 + scope 密接関連バグの運用ルール、L1 × C1)
4. **R04 スコープの初期整理**: Track A ローンチ準備の残タスク洗い出し、Track B 準備段階の分岐点判断

---

## 2026-07-24(4) - 改善候補 7 起票 + 改善候補 8 の stack 追加

### 決定事項

1. **改善候補 7 の Issue 起票**: Issue #157 `docs: dev_project_common に font metrics 差の判定基準(PR #156 で確立した柔軟 PASS 条件)を追記`
   - L1 × C1, 堅固化 B, Category F=C, Claude Rv 必須
   - 2 スコープ(font metrics 判定基準サブ § 追加 + 変更履歴追記)
   - Labels: `docs`, `improvement`
   - Codex 継続採用(Naoya が `ready-for-codex` 付与予定)
2. **改善候補 8 の新規追加**: 判断 F 案 β 採用により「Cursor / Codex 使い分けパターンの明文化」を stack に追加
   - 内容: L1 docs は Codex 優先(自己判断透明性)、L3 実装複合は Cursor 継続(実装能力の実績)、L3 UI QA は Codex(判断ゲート運用の親和性)などの実運用パターンを dev_project_common or design-decisions に明文化
   - 状態: Stack(改善候補 7 の後続 or 並行)

### 却下された選択肢

- **判断 E 案 β**: 改善候補 2 / 6 の統合 docs Issue 起票 → 却下、改善候補 7 独立起票が優先
- **判断 E 案 γ**: R04 スコープの初期整理 → 却下、Chat 内相談で docs Issue 生成なし、改善候補 7 のほうが生産性

### 判断根拠

- **判断 E 案 α 採用の根拠**: PR #156 で実運用に乗った判定基準を dev_project_common に正典化することで、以後の C6 UI Issue で自動適用可能、Track A ローンチ準備の残タスクにも即効性
- **判断 F 案 β 採用の根拠**: Cursor / Codex 使い分けパターンは既に実運用パターンとして確立しているが、docs 化されていないため新規メンバーや将来の自分がリファレンスできない。stack として明示化することで、次期 docs Issue での正典化が可能

### 改善候補 stack 更新(2026-07-24 時点)

| # | 内容 | 状態 |
|---|---|---|
| 1 | 受け入れアサーション regex 精緻化 + 動作時 visibility 検証手段 | 完了(#153 / PR #154) |
| 2 | Cursor 自己判断 bug fix の運用ルール明文化 | Stack |
| 3 | C6 UI PR のスクショ代替運用(Preview URL Vercel deployment) | Stack |
| 4 | Phase 分割コミットの diff からの可検証性 | Stack |
| 5 | LS dual-write パターン整理 | Stack |
| 6 | scope 密接関連バグ修正の事前相談ルール明文化 | Stack(2 と統合起票候補) |
| 7 | font metrics 差の判定基準を dev_project_common に追記 | **起票済み(#157)** |
| 8 | Cursor / Codex 使い分けパターンの明文化 | Stack(新規、次回 docs Issue で正典化候補) |

### 関連 Issue / PR / Chat 記録

- Issue #157 起票: https://github.com/nkhippo/IPASoundDrill/issues/157
- 参照: Issue #155 / PR #156(改善候補 7 の実運用第 1 号)、Issue #153 / PR #154(改善候補 1 docs 正典化)

### 次セッションの起点

- **Issue #157 実装 → Rv → merge**: Codex 4 度目参画、L1 docs、想定 clean 実装
- **改善候補 8 の docs Issue 起票判断**: 改善候補 7 完了後 or 並行、L1 × C1 想定
- **R04 スコープの初期整理**: Track A ローンチ準備の残タスク洗い出しは Chat 内相談で対応

---

## 2026-07-24(8) - PR #162 merged + Issue #163 起票(Category F=A の実運用初ケース)

### 決定事項

1. **PR #162 の Naoya 判断: 選択肢 A 追認**、merged。観点 8 の `window.scrollTo(0,0)` 密接関連修正を「透明性 100% 明記 + 技術的妥当性」で許容
2. **Issue #163 起票**: `feat: PC UI 品質補完 Phase 2 — ドリル STEP 1 badge / 語彙リスト チェックボックス(CD 更新指示書付き、Category F=A)`
   - L3 × [C6, C1(CD)]、堅固化 B、**Category F=A**、Claude Rv 必須
   - 2 スコープ(元 Issue #161 Scope 3/4)
   - Phase 0: CD 更新指示書に基づき Naoya が Claude Design で CD 更新 → CD merge → Phase 1+ 実装
   - CD 更新指示書 3 件(2 系 badge 削除 / 3b-pc 3 slot 追加 / 3b-pc 全消去 追加)を Issue 本文に明記
3. **Claude 側 CD 検証補足**: 2a-pc だけでなく 2b-pc / 2c-pc / 2d-pc も全て STEP 1 に「語彙 A1/A2」badge が存在、CD 更新は 4 variant 統一的に実施すべき
4. **Category F=A の運用フローが実運用に乗る初のケース**: dev_project_common の CD 更新運用の実践、Naoya の Claude Design 対応が Phase 0 の前提

### 却下された選択肢

- **PR #162 の選択肢 B (手戻り)**: 却下 → scroll reset の技術的妥当性 + 透明性を評価
- **Issue #163 の分離: 単独 Issue 化なし**: Scope 3/4 統合起票が read の観点で自然

### 判断根拠

- **PR #162 選択肢 A 採用の根拠**: 
  - scroll reset は Scope 2 (chrome 孤立表示) の完了状態を得るための必要条件
  - Codex は透明性 100% で密接関連修正を明記
  - 手戻りコストが実務メリットを上回る
  - PR #160 の agent 運用ルール正典化直後で、次回以降は事前相談ルールの厳守を期待
- **Issue #163 起票の根拠**:
  - CD 更新指示書付きで Category F=A の運用フローを実践、以後の同種 Issue のリファレンスとして機能
  - CD 更新は Naoya の Claude Design 対応(時間コスト)を要するが、正典を確定することで将来的な迷いを排除
  - 2 系 badge 削除は 4 variant 統一的に扱うことで一度で完了、部分対応の混乱を防ぐ

### 学び

- **Category F=A の運用実践**: dev_project_common § UPDATE-GUIDE で規定された Category F=A の運用(CD 更新指示書 → Naoya の Claude Design 対応 → CD merge → Phase 1+ 実装)を実運用に初適用
- **CD 検証の重要性**: Codex Phase 0 で 2a-pc の badge を発見、Claude 側検証で 2b/2c/2d にも同種 badge があることを確認 → **Issue 起票時の CD comparison は variant-level で網羅すべき**
- **Naoya-Codex 判断ゲート運用の成熟**: Phase 0 判定 → Naoya 承認 → Phase 分割実装 の流れが 3 サイクル目(Issue #155 / #159 / #161)で完全に定着
- **改善候補 stack 残 3 件のみ**: agent 運用ルールが揃い、Track A ローンチ準備の主要タスクは Issue #163 で完了する見込み

### 関連 Issue / PR / Chat 記録

- Issue #161 → PR #162 (merged 2026-07-24、Rv 合格 + 観点 8 選択肢 A 追認)
- Issue #163 起票: https://github.com/nkhippo/IPASoundDrill/issues/163
- Codex Phase 0: comment 5066719517 (Category F=A 判定)
- Naoya 選択肢 Y-1 承認: comment 5068179220
- Codex Scope 1/2 実装: comment 5068443036
- PR #162 Claude Rv: comment 5068471358
- Chat 記録: `10_chat_logs/2026/07/2026-07-24_pr-162-scope-1-2-implementation.md`

### 現状の改善候補 stack

| # | 内容 | 状態 |
|---|---|---|
| 1 | 受け入れアサーション regex 精緻化 + 動作時 visibility 検証手段 | 完了 (#153 / PR #154) |
| 2 | Cursor 自己判断 bug fix の運用ルール明文化 | 完了 (#159 / PR #160) |
| 3 | C6 UI PR のスクショ代替運用(Preview URL Vercel deployment) | Stack |
| 4 | Phase 分割コミットの diff からの可検証性 | Stack |
| 5 | LS dual-write パターン整理 | Stack |
| 6 | scope 密接関連バグ修正の事前相談ルール明文化 | 完了 (#159 / PR #160) |
| 7 | font metrics 差の判定基準を dev_project_common に追記 | 完了 (#157 / PR #158) |
| 8 | Cursor / Codex 使い分けパターンの明文化 | 完了 (#159 / PR #160) |

Stack 残 3 件(3, 4, 5)、Track A ローンチ後 or 並行で逐次起票候補。

### 次セッションの起点

**優先度順の候補**:
1. **Issue #163 Phase 0**: Naoya が Claude Design で CD 更新 → CD 単独 PR merge
2. **Issue #163 Phase 1+ 実装**: CD merge 完了後、実装 agent(Cursor or Codex)による Phase 分割実装 → PR → Rv → merge
3. **Track A ローンチ準備の残タスク集約**: Issue #163 完了後、ローンチ判断へ移行
4. **改善候補 3 / 4 / 5 の逐次起票**: Track A ローンチ後 or 並行判断
