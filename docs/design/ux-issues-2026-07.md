---
created: 2026-07-15 18:00:00+09:00
project: IPASoundDrill
status: living
summary: IPA Sound Drill UI/UX 抜本見直し (2026-07-15 kickoff、案 γ) の Phase 0 成果物。v1 の 12
  課題に Halfbaked 発見と Q-1〜Q-11 判断確定を反映し、Cluster 再構成 + 状態管理を追加。Phase 1 (Claude Design
  探索) への入力。
tags:
- ipasounddrill
- ux
- design-review
- phase-0
- phase-1
title: IPA Sound Drill - UX 課題整理シート (2026-07)
type: knowledge
updated: 2026-07-16 02:15:00+09:00
version: '2.0'
id: pj-2026-07-16-3424
aliases:
- pj-2026-07-16-3424
---

> **状態注記（2026-07-29 追記・事実確認のみ）**: 本シートは 2026-07-15/16 時点（Phase 0）の課題整理。記載の "Mode A" / "Mode B" 用語・Q-2 未確定状態は当時の事実として保持する（歴史的記録のため書き換えない）。
> その後 Phase 1–3 で大半の課題は解決済み: Mode A/B の 2 モード階層は目的 4 カード（`2a`–`2d`）の平坦構造に置換（`docs/product.md` §1, §5）、GA/RP はプロフィール `3a` で固定選択（C-9 解決）、オンボーディングは実装済み（C-7 解決、`docs/features/_common.md`）、Reveal 情報密度は Phase 1-D 以降で階層化済み（C-10 対応）。
> 現行仕様の正本は `docs/product.md` / `docs/features/<id>.md` / `docs/data-contract.md`。本ファイルは Phase 0 の意思決定プロセスの記録として保持する。

## Summary

初版 (v1、2026-07-15) の 12 課題に、Phase 0 段階 1 の Recon (PR #62) と Naoya さん判断 (Q-1〜Q-11) を反映した **v2**。

**v2 の主な変更点**:
1. 各課題に **状態** カラム追加 (Active / Deferred / Phase 1 依存 / Frozen)
2. 判断確定を反映した **推奨解決の具体化**
3. Cluster を **5 分類に再構成** (v1 は 3 分類)
4. Reveal 画面の情報密度リスク (C-10) を **新規追加** (Q-4-B の respell 追加が引き金)
5. Cluster 4 「Mode A/B 情報階層」を新設 (Q-2 の Phase 1 判断先送りを受けて)

## 参照

- `docs/PURPOSE.md` v3.24 (source of truth)
- `30_projects/IPASoundDrill/design-decisions.md` § 2026-07-15 (Q-1〜Q-11 判断)
- `30_projects/IPASoundDrill/open-questions.md` v2 (Q-2 のみ open)
- `30_projects/IPASoundDrill/design/phase-0-stage-2-doc-impl-reconciliation.md` (段階 2 差分レポート)
- Recon: `docs/cursor/recon/pre-issue-recon-20260716-*.md` (4 ファイル)

## 前提と参照範囲 (v1 から継承)

- **本丸 (Mode A)**: 既知語の IPA 読み書き
- **サブテーマ (Mode B)**: 音から未知語の意味を覚える (Study のみ運用中、Quiz は `MODEB_QUIZ_ENABLED=false` でコード温存)
- **Track A**: 静的 HTML + GAS TTS + Vercel を維持しつつローンチ準備
- **Track B**: React 化・BE 移管・BYOK 等
- 対応言語: Track A は ja/en/ko/zh-Hans/zh-Hant/fil の 6 言語、Track B は es/pt-BR/vi/id/th/hi/ar を追加

## 課題一覧 (v2)

| ID | 領域 | Severity | Track | 状態 | 課題 |
|---|---|---|---|---|---|
| N-1 | 全体 | High | A | Active | プロトタイプ焼き回し問題 |
| N-2 | トップページ / 言語切替 | High | A | Active | トップの目的不明瞭 + 言語切替不可視 |
| N-3 | 情報設計 | High | A | Active | 目的ファースト UI への転換希望 |
| C-1 | セットアップ画面 | **High** ↑ | A | Active | 設定パラメータ多階層 (Q-1-A で B2 追加により階層が更に強化) |
| C-2 | 情報階層 | Medium | A | **Phase 1 依存** | Mode A / Mode B の意味階層が伝わりにくい (Q-2 と統合議論) |
| C-3 | 多言語 SEO / 言語切替 | High | A | Active | subdirectory 入口と言語切替 UI が連動していない |
| C-4 | ローンチ素材 | Medium | A | Active | タグライン確定の後ろ倒し |
| C-5 | 情報設計 | Low-Medium | A/B | Deferred | Vocab Browser の位置づけと導線再検討 |
| C-6 | Mode B UX | Low | A/B | **Frozen** | Mode B Quiz UI 非表示の評価 (SPEC 通り凍結維持) |
| C-7 | オンボーディング | Medium | A | Active | 初回訪問者向け 60 秒理解導線の欠如 |
| C-8 | 概念設計 | Low | A/B | **Phase 1 依存** | CEFR フィルタ露出深度 (Q-2 と統合) |
| C-9 | 設定 UI | Medium | A | Active | GA/RP 切替が設定モーダル内に埋没 |
| **C-10** | **Reveal 画面** | **Medium** | **A** | **Active (新)** | **Reveal 画面の情報密度過剰リスク (Q-4-B respell 追加が引き金)** |

### Severity 定義 (v1 から継承)

- **High**: ローンチ体験の質を明確に損ねる (放置してローンチできない)
- **Medium**: ローンチ後の獲得・定着に影響する
- **Low**: 中期の完成度に影響 (Track B 以降で検討可能)

### 状態定義 (v2 新設)

- **Active**: Phase 0-1 で解決に向けて動く
- **Deferred**: ローンチ後 or 中期で扱う
- **Phase 1 依存**: Q-2 等の判断が Phase 1 で確定するのを待つ
- **Frozen**: 意思決定として現状維持 (実装・仕様変更なし)


## 課題 N-1: プロトタイプ焼き回し問題

- **Severity**: High / **Track**: A / **状態**: Active

### 現状 (v1 から継承)

現在のデザインは 1 チャットで Claude が出力したプロトタイプがベース。CSS 変数 (`--signal: #0C7C7E` 等) とブランドカラーは定義済みだが視覚言語全体の刷新が必要。

### v2 での追記

- Recon で判明: `src/index.template.html` に一部インライン style が残存 (Mode B heads 等)、デザイントークン化されていない
- Q-4-B (respell 追加) で Reveal 画面の情報密度が上がるため、視覚言語刷新は Reveal を含むべき

### 想定される解決の方向

- 現行 UI の web capture を Claude Design に取り込み、視覚言語 (color / typography / spacing / component style) を刷新
- 音を扱うプロダクトである音象徴を UI に取り入れる
- Reveal 画面の情報階層 (C-10 と連動) を含む視覚設計


## 課題 N-2: トップページの目的不明瞭 + 言語切替不可視

- **Severity**: High / **Track**: A / **状態**: Active

### 現状 (v1 から継承)

- トップ = セットアップ画面。LP 要素なし
- 言語切替は Settings モーダル内、`#settingsBtn` は setup 画面でしか表示されない

### v2 での追記

- Recon で判明: `SUPPORTED_LANGS` は 6 言語 (ja/en/ko/zh-Hans/zh-Hant/fil)、ブラウザ言語検出は `localStorage.app_lang` 依存
- Q-11-C (Reflect dock 削除) 決定により、目的ファースト UI が「振り返り」機能も内包する形で設計される

### 想定される解決の方向 (v1 から継承)

- LP + Setup の 2 段構成
- 言語切替をトップバー右上に常時表示
- ブラウザ言語検出 → `localStorage.app_lang` 未設定時のフォールバック実装
- タグライン (C-4) を大きく置く


## 課題 N-3: 目的ファースト UI への転換希望

- **Severity**: High / **Track**: A / **状態**: Active

### v2 での追記

- **Q-11-C (Reflect dock 削除) 決定を反映**: 目的ファースト UI に「振り返り」機能を統合する設計
- クイックスタートカードから「今週の学習振り返り」への動線を追加検討

### 想定される解決の方向 (更新)

- 目的別クイックスタートカード + 振り返り導線
- カード選択で内部モード/フィルタ自動セット
- 従来の「詳しい設定」は上級者向け deep entry として維持


## 課題 C-1: 設定パラメータ多階層 (認知負荷) ★Priority 強化

- **Severity**: **High** (v1 の High から強化) / **Track**: A / **状態**: Active

### v2 での強化理由

Q-1-A (B2 ピル追加) の実装により、Mode A の CEFR ピルが A1/A2/B1/B2 の **4 択に増加**。Recon §C により Mode B でも CEFR ピルが流用されているため、Q-2 の判断次第で:

- Q-2-A (Band UI 復活): Mode B に独立した Band UI が追加され、更に階層増
- Q-2-B (CEFR 流用): Mode A/B とも 4 択 CEFR で統一

いずれの場合も、認知負荷対策としての **N-3 (目的ファースト UI)** の重要性が更に増している。

### 想定される解決 (更新)

- N-3 (目的カード) を最上位、詳細設定を折りたたむ
- モバイル 2-3 タップ完了フロー
- CEFR ピルは目的カード選択後に自動セット (詳細設定で再編集可能)


## 課題 C-2: Mode A / Mode B の意味階層 (Phase 1 依存)

- **Severity**: Medium / **Track**: A / **状態**: **Phase 1 依存** (Q-2 未確定)

### 状態変更の理由

Q-2 (Mode B の情報階層) は Phase 1 (Claude Design プロトタイプ探索) で決定される。Q-2 の決定次第で C-2 の解決策も変わる:

- Q-2-A (Band UI 復活) → Mode B 側で Band 独自の階層説明、Mode A/B 差別化
- Q-2-B (CEFR 流用) → Mode A/B とも同じ CEFR 選択、階層統一

### v1 から継承の解決の方向

- ラベルを状態ベースに変える (「知ってる単語で発音を鍛える」/「音から新しい単語を覚える」)
- N-3 目的カードで自然に Mode 選択が完了する構造


## 課題 C-3: 多言語 SEO 入口と言語切替 UI の連動 (v1 から継承)

- **Severity**: High / **Track**: A / **状態**: Active

### v2 での追記

- Q-7-A (cs_rule 3 言語追加) 決定により、Connected phrase の説明も ko / zh-Hans / zh-Hant 対応
- 全 UI 要素が 6 言語対応となる方針が更に明確化

### 依存関係

- Issue #26, #31, #29 の SEO 実装完了と同期
- Track A ローンチ前に必ず解決


## 課題 C-4: タグライン確定の後ろ倒しリスク (v1 から継承)

- **Severity**: Medium / **Track**: A / **状態**: Active

Phase 3 (ローンチ素材制作) を待たず、Phase 0-1 内で確定推奨。Claude Design プロトタイプに複数候補を投入して視覚検証。


## 課題 C-5: Vocab Browser の位置づけと導線 (Deferred)

- **Severity**: Low-Medium / **Track**: A/B / **状態**: **Deferred**

### 状態変更の理由

Q-4-B (Respell は Reveal のみ) 決定により、Vocab Browser の役割は現行の「音声で確認する運用」で明確化。位置づけの再検討は Track A ローンチ後の分析データを見て判断する方が確実 (Vercel Analytics で Vocab ページのセッション時間・遷移率を測定)。


## 課題 C-6: Mode B Quiz UI 非表示の学習体験評価 (Frozen)

- **Severity**: Low / **Track**: A/B / **状態**: **Frozen**

### 状態変更の理由

Q は明示保留、`MODEB_QUIZ_ENABLED=false` は SPEC/DESIGN 通り。Track A では現状維持、Track B 開始時に User Feedback を見て再評価。

### Frozen ステータスの含意

- SPEC §2.5 / DESIGN §2.4 の「Study のみ運用、Quiz UI は非表示」を維持
- コード (`buildModeBQueue`, `#cardModeBMcq/Dict`) は温存
- 削除の意思決定 (Track B 検討事項) はローンチ後の SLA データを見て判断


## 課題 C-7: 初回訪問者向けオンボーディング欠如 (v1 から継承)

- **Severity**: Medium / **Track**: A / **状態**: Active

### 想定される解決の方向 (v1 から継承)

- 3 スライド程度のショートオンボーディング (「IPA って何?」「Mode A/B の違い」「1 分試してみる」)
- スキップボタンあり、以降は非表示 (localStorage フラグ)


## 課題 C-8: CEFR フィルタ露出深度の統一性 (Phase 1 依存)

- **Severity**: Low / **Track**: A/B / **状態**: **Phase 1 依存** (Q-2 と統合)

### 状態変更の理由

Q-2 (Mode B の情報階層) の決定により C-8 の解決策も自動的に決まる:

- Q-2-A (Band UI 復活) → Mode A は選択式、Mode B は自動制御 (現状の乖離を「意図的な設計」として文書化)
- Q-2-B (CEFR 流用) → Mode A/B とも選択式で統一 (乖離解消)

### 補足

Vocab Browser の CEFR バッジ (単なるラベル) は両方の判断で影響を受けない。


## 課題 C-9: GA/RP 切替が設定モーダル内に埋没 (v1 から継承)

- **Severity**: Medium / **Track**: A / **状態**: Active

### v2 での追記

- Q-6-B (RP TTS 連結は Track B) 決定により、Track A では GA/RP 切替は既存のまま維持できる
- ただし切替 UI の位置は Track A で見直し可能 (実装の一貫性は必要)

### 想定される解決 (v1 から継承)

- トップバーに GA/RP トグルを常時表示
- Phase 1 で Claude Design のプロトタイプに反映して比較


## 課題 C-10 (新): Reveal 画面の情報密度過剰リスク

- **Severity**: Medium / **Track**: A / **状態**: **Active (新)**

### 現状

Q-4-B (respell を Reveal のみ表示) 決定により、Reveal 画面は以下を同時表示する構造になる:

1. 正解単語 (`#rWord`)
2. Phonemic IPA (`activeIpa`, GA or RP)
3. Narrow IPA 差分 (`activeNarrowIpa` — `ipa_actual_ga` が phonemic と異なるとき)
4. **Respell (新規追加、`respell_ga` or `respell_rp`)**
5. Alt accent IPA (`altAccentValue` — `ga_rp_same` false のとき、対アクセント表記)
6. Gloss (現在の UI 言語)
7. Progress checks (d/e/l の 3 スロット)
8. Next button

7 種類の情報要素が縦に並ぶ (respell 追加前の 6 種類でも既に密度高)。

### なぜ問題か

- 学習効果の観点で「情報過多で学習者の注意が散る」リスク
- 特にモバイルでの視認性・タップ精度に悪影響
- N-1 (プロトタイプ焼き回し) と連動する視覚設計課題

### 検証観点

- 各情報要素の視覚階層 (どれを主として見せるか)
- モバイル画面での縦スクロール量
- respell 表示のタイミング (即座 vs タップで開く)
- narrow IPA と respell の重複解消 (どちらも「発音の細部を伝える」役割)

### 想定される解決の方向

- Reveal 画面を「1 タブ完結」から「2-3 セクションに分割」する再設計
- respell を「補助的表示」に配置 (小フォント、または折りたたみ)
- narrow IPA / alt accent / respell の階層を明確化 (例: 主軸 = phonemic IPA、詳細 = narrow IPA + respell)
- Phase 1 Claude Design で複数レイアウト案を比較

### 依存関係

- N-1 (視覚言語刷新) と一体設計
- Q-4-B (respell 追加) の実装は本課題の解決後にする方が安全 → Issue X-3 (respell 実装) の設計判断に反映

### Priority

**Medium**、ただし Issue X-3 (respell 実装) の実装前に Phase 1 で確定必要


## v2 クラスタリング (5 分類に再構成)

### Cluster 1: トップページ再設計 (目的ファースト UI)

- **課題**: N-2, N-3, C-1, C-3, C-4, C-7
- **特徴**: すべて「トップ画面での初期体験」に関わる。Phase 1 (Claude Design) で一体のプロトタイプとして探索

### Cluster 2: 視覚言語の刷新

- **課題**: N-1
- **特徴**: 単独課題だが影響範囲が広い。Cluster 1 と並行して Claude Design で視覚言語 (color / typography / spacing / component style) を再構築。Reveal 画面 (Cluster 3) にも波及

### Cluster 3 (新): Reveal / 学習中体験

- **課題**: C-10 (新), C-9
- **特徴**: 学習ループの中核 (Reveal + アクセント切替) の情報階層設計。Cluster 2 の視覚言語刷新と連動

### Cluster 4 (新): Mode A / B 情報階層 (Phase 1 依存)

- **課題**: C-2, C-8
- **特徴**: **Q-2 の Phase 1 決定を待つ**。Q-2-A / Q-2-B の 2 プロトタイプで比較後に方向確定
- **依存**: 他 Cluster より遅れて解決

### Cluster 5: 個別 UX の最適化 / Deferred

- **課題**: C-5 (Deferred), C-6 (Frozen)
- **特徴**: ローンチ前に必須ではない、または現状維持で確定


## Phase 1 (Claude Design) への引き渡し内容

Claude Design にインプットする資料の候補:

1. 本ファイル (`ux-issues-2026-07.md` v2)
2. `design-decisions.md` (Q-1〜Q-11 判断結果)
3. `open-questions.md` v2 (Q-2 の Phase 1 判断依頼)
4. `docs/PURPOSE.md` (source of truth)
5. Cluster 1-4 別のプロトタイプ ブリーフ (新規作成が必要):
   - Brief 1: トップページ再設計 (目的ファースト + LP + 言語切替 + オンボーディング)
   - Brief 2: 視覚言語刷新 (デザイントークン + component style)
   - Brief 3: Reveal 画面レイアウト (respell 追加を前提とした情報階層)
   - Brief 4: Mode A/B 情報階層 (Q-2 の A/B 2 プロトタイプ)
6. 現行 UI の web capture (`https://ipasounddrill.app`)
7. GitHub リポ (`nkhippo/IPASoundDrill`) の直接接続

## Track A ローンチまでの UX 対応マップ

| Phase | 対応 Cluster | 主なアウトプット |
|---|---|---|
| Phase 0 | 実態把握・意思決定 | design-decisions.md, open-questions.md, 本シート v2 |
| Phase 1 (Claude Design) | Cluster 1, 2, 3, 4 | 各クラスタのプロトタイプ、Q-2 決定 |
| Phase 2 (Track A/B 判定) | 各課題の実装先を確定 | Issue 群の起票 |
| Phase 3 (ローンチ素材) | C-4 (タグライン確定) | LP コピー・OGP・タグライン |

## 次のアクション

1. 【Naoya さん】本 v2 のレビュー、Cluster 分類の妥当性確認
2. 【Naoya さん】Issue X-1〜X-6 の起票 (`design-decisions.md` § Issue 起票計画参照)
3. 【Claude】Phase 1 起動時に Brief 1-4 を起草
4. 【Claude】Cluster 3 (C-10 Reveal 情報密度) を Issue X-3 (respell 実装) の設計判断に反映

## 履歴

- 2026-07-15 v1: 初版、Naoya 3 課題 + Claude 追加 9 課題 = 12 課題
- 2026-07-15 v2: Q-1〜Q-11 判断確定を反映、C-10 新規追加、Cluster を 5 分類に再構成、状態管理カラム追加
