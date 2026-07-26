---
updated: 2026-07-24T23:40:55+09:00
---

## 2026-07-24 全日セッション最終状態(8 PR Rv + 4 大成果)

### Phase 1 完全完了 + UI 品質補完完了

**LAUNCH-CHECKLIST 全 milestone 完了**:
- 1-A / 1-B / 1-C / 1-D / 1-E / 1-E-CD / 1-F / 1-G / 1-H / 1-H 補完 / 1-H 品質補完 Phase 2

**UI 品質補完**: Scope 1/2(PR #162 merged)+ Scope 3/4(PR #164 Naoya マージ判断待ち、Rv 合格)

**Category F=A 運用フロー完全実証**: CD 更新指示書 → Naoya Claude Design → アップロード → Claude 検証 → Codex baseline 同期 → 実装 → Rv の一連が初完結

### 改善候補 stack 最終状態

| # | 内容 | 状態 |
|---|---|---|
| 1 | 受け入れアサーション regex 精緻化 + 動作時 visibility 検証 | 完了 |
| 2 | Cursor 自己判断 bug fix ルール | 完了 |
| 3 | C6 スクショ代替運用 | Stack |
| 4 | Phase 分割コミット可検証性 | Stack |
| 5 | LS dual-write パターン整理 | Stack |
| 6 | scope 密接関連バグ事前相談ルール | 完了 |
| 7 | font metrics 差の判定基準 | 完了 |
| 8 | Cursor / Codex 使い分けパターン | 完了 |

### Agent 運用

- Codex 6 度目参画、Cursor 1 回(Naoya-override)
- Naoya-override 透明性 5 例、dev_project_common § 5 の運用ルール完全定着
- Cursor clean 実装スタイルへの進化確認(PR #158)

### dev_project_common.md 完全構造

```
§ 1 Claude PR Rv 手順 + Rv 観点 10 + 観点 13
§ 2 Issue 起票 — 宣言形の徹底 + 削除掃討 3 種
§ 3 Issue 起票 — 受け入れアサーション欄
  ├─ 動作時 visibility 検証 (#153)
  │   ├─ 判定パターン + CDP テンプレート
  │   └─ font metrics 差の判定基準 (#157)
  └─ regex 精緻化ガイダンス (#153)
§ 4 PR 提出 — UI 改修のスクショ必須
§ 5 Agent 運用ルール (#159)
  ├─ Agent 想定領域 + Issue ラベル運用
  ├─ Naoya-override
  ├─ Cursor 自己判断ルール (改善候補 2)
  └─ scope 密接関連バグ事前相談 (改善候補 6)
変更履歴
```

### Open PR

- **PR #164(Issue #163 PC UI 品質補完 Phase 2)**: Naoya マージ判断待ち、Rv 合格、観点 8 の 2 議論点(Claude 推奨: 追認)

### 次セッションの起点

1. **PR #164 マージ**: 観点 8 の 2 議論点を Naoya が追認 → merge
2. **Track A ローンチ準備の残タスク集約**: R04 スコープ初期整理
3. **ローンチ判断相談**: Issue #163 完了で Track A ローンチ判断段階へ移行可能
4. **改善候補 3 / 4 / 5 の逐次起票**: Track A ローンチ後 or 並行

---

## 2026-07-24(3) 更新(Issue #155 / PR #156 Rv 完了、Phase 1 完全完了マイルストーン到達)

### PR #156(Issue #155 Phase 1-G)Rv 結果

**総合判定: 合格**

Codex Phase 1-G 実装、Naoya の Phase 0 / Phase 3 承認内容を完全反映、模範的な CD-first パイプライン完結。

**4 スコープ受け入れアサーション全 PASS**:
- Scope 1(DIVERGENCE 追記): 6 行 CD 乖離 + 1 行 font metrics 判定 = 7 行、Phase 1-G 明記
- Scope 2(360 行 CDP QA): 8 列表形式で全記録(viewport / 言語 / 画面 / selector / 項目 / 期待 / 実測 / 判定)
- Scope 3(overflow 対処): 32 件検出 → 選択肢 A 承認通り全て「承認済み許容」表示、CSS/i18n 変更 0 件
- Scope 4(スクショ or 代替): Option B(CDP 結果表完全掲載)採用

**Naoya Phase 0 承認時 3 補足すべて反映**:
1. 言語別 fontFamily 期待値マップ: 6 言語 × 3 分類(UI/body / 見出し / IPA)、computed fontFamily の fallback list 挙動明記
2. containerRatio 閾値: PASS `0 < ratio ≤ 1.05`、FAIL 3 パターン、subpixel rounding 許容根拠
3. 画面ごとの主要 4 selector: 9 画面 × 4 = 36 個の selector 表

**Phase 3 選択肢 A 承認内容の完全反映**:
- Issue Comment #5066238511 参照で明示
- 柔軟 PASS 条件を適用: `overflowX === false` + `overflowY === true` でも `overflow: visible` かつ `scrollHeight - clientHeight ≤ 3px` + `0 < containerRatio ≤ 1.05`
- 32 件全て「✅(承認済み許容)」表示
- CSS / i18n 変更 0 件を「デグレ防止検証」欄で明記

**12 観点評価**:
- 観点 1-7, 10-12: 全 PASS
- 観点 8「ついで作業ゼロ」: ✅ 「自己判断による CSS / i18n 変更: 0件」Codex 明記、Cursor 過去 PR #148/#152 のパターン再発なし
- 観点 10(grep + 動作時 visibility 検証記録): ✅ 改善候補 1 の実運用第 2 号、360 行 QA でストレステスト
- 観点 12(自己判断の透明性): ✅ Issue Comment #5066238511 参照 + CSS/i18n 変更 0 件明記

### Phase 1 完全完了マイルストーン到達

**LAUNCH-CHECKLIST 6/6 milestone 完了**:
- 1-A / 1-B / 1-C / 1-D / 1-E / 1-E-CD / 1-F / 1-H / 1-H 補完 / **1-G**

**CD-first パイプライン集約**:
- 第 1 サイクル: DIVERGENCE 空到達(PR #151/#152 完了時点)
- 第 2 サイクル: 45 組 CDP QA + 5 言語 variant DIVERGENCE 追記(PR #156 完了)
- 全 6 milestone で宣言形 / 受け入れアサーション / スクショ必須ルール(PR #146 導入)が機能

**改善候補 1 実運用軌跡**:
- Issue #147 Rv で構造弱点発見(定義存在 ≠ 動作時 visibility)
- PR #152(Issue #150 PC 補完)で 6 画面確認 = 実運用第 1 号
- PR #154(Issue #153 docs 化)で dev_project_common § 3 正典化
- PR #156(Issue #155 Phase 1-G)で 360 行本格運用第 2 号

**Codex 実運用軌跡**:
- Issue #153(docs 追記)= 1 度目参画
- Issue #155 Phase 0 Recon(設計)= 2 度目参画
- Issue #155 実装 PR #156 = 3 度目参画
- Naoya-Codex 判断ゲート運用パターン(Phase 0 → 承認 → Phase 2 → Phase 3 → 承認 → Phase 4-5 → PR 提出)確立

### roadmap 遷移条件確立

- **R03(IPA / CD 取込)**: 実質完了(Phase 1 全 milestone 完了、DIVERGENCE 空 → 5 言語 variant 意図的乖離の透明化まで)
- **R04(IPA / 運用整備)**: ready 遷移条件を満たす
- Track A ローンチ準備の最終段階へ移行可能

### 改善候補 stack 更新

現在 7 件 stack(改善候補 1 完了、7 新規追加):

| # | 内容 | 状態 |
|---|---|---|
| 1 | 受け入れアサーション regex 精緻化 + 動作時 visibility 検証手段 | 完了(#153 / PR #154) |
| 2 | Cursor 自己判断 bug fix の運用ルール明文化 | Stack |
| 3 | C6 UI PR のスクショ代替運用(Preview URL Vercel deployment) | Stack |
| 4 | Phase 分割コミットの diff からの可検証性 | Stack |
| 5 | LS dual-write パターン整理 | Stack |
| 6 | scope 密接関連バグ修正の事前相談ルール明文化 | Stack(2 と統合起票候補) |
| 7 | font metrics 差の判定基準を dev_project_common に追記(Phase 1-G 確立) | Stack(新規、Naoya 承認次第) |

### 次セッションの起点

**優先度順の候補**:
1. **roadmap.md 更新**: R03 → R04 遷移(Phase 1 完全完了マーク、Mermaid flowchart 更新)
2. **改善候補 7 の docs Issue 起票**(Codex 継続向き、L1 × C1)
3. **改善候補 2/6 の統合 docs Issue 起票**(Cursor 自己判断 + scope 密接関連バグの運用ルール、L1 × C1)
4. **R04 スコープの初期整理**: Track A ローンチ準備、Track B 準備段階の分岐点判断

### 現状ステータス

- **Phase 1**: **6/6 milestone 完了**(Phase 1-G は PR #156 が Naoya マージ承認待ち)
- **DIVERGENCE.md**: 7 行追記(5 言語 variant CD 乖離 6 行 + font metrics 判定 1 行)
- **改善候補 stack**: 6 件残(2-7、1 は完了)
- **R03**: 実質完了、R04 ready 遷移条件確立
- **Agent 運用**: Cursor / Codex 使い分けが実運用パターン確立
- **Track A ローンチ準備**: 最終段階へ移行可能

---

## 2026-07-24(2) 更新(Issue #153 / PR #154 Rv 完了、Codex 初参画実運用開始)

### PR #154(Issue #153 改善候補 1 docs 化)Rv 結果

**総合判定: 合格**

L1 docs 追記のみ、構造アサーション全 PASS、既存 § への破壊的変更なし、Codex 自己判断による追加変更ゼロ。

**受け入れアサーション実測**:
- Scope 1-A(4 API + visibility): 13 hits
- Scope 1-A(CDP / framework): 6 hits
- Scope 1-B(固有語 / regex): 4 hits
- Scope 1-B(多言語漏れチェック): 1 hits
- Scope 2(観点 10 / 13 / visibility 記録): 5 hits
- 全体構造 `## 見出し数`: 24(元 5 + 追加 § で増加)
- 既存 § キーワード残置: 8

**構造保全確認**:
- § 1「Claude PR Rv 手順」+ Rv 観点 10(新規追加)+ 観点 13 残置
- § 2「Issue 起票 — 宣言形の徹底」+ 削除系改修の言及の掃討 3 種 残置
- § 3「Issue 起票 — 受け入れアサーション欄」+ **動作時 visibility 検証(新規)** + **regex 精緻化ガイダンス(新規)** + 記載例 残置
- § 4「PR 提出 — UI 改修のスクショ必須」残置
- 変更履歴に 2026-07-24 エントリ追加

### Codex 初参画実運用開始

- Branch: `codex/issue-153-runtime-visibility-docs`
- Agent 表記: `codex`(Cursor と使い分け明示)
- 実装レポート品質: Cursor と同等の Retrospective・アサーション遵守・自己判断透明性
- userMemories 2026-07-21 決定「Codex ネイティブコネクタ + Vault 系 3 リポも access リストに含める」の実装レベル運用開始

**Codex 実装レポートの適応判断**:
- 「現行文書に Rv 12 観点表そのものはなく観点 13 の参照だけがあるため、既存の Rv 手順内へ観点 10 を明示配置」→ 一般化と適応の判断を透明性 100% で明記
- 「PR #152 の結果表を汎用テンプレート化」→ 具体例から一般テンプレートへの展開判断

### 特に評価すべき点

**1. 判定パターンの完全性**  
`document.querySelector(...)` の成功だけで PASS にしない明記 + `getComputedStyle(...).display !== "none"` + `getBoundingClientRect().width > 0` の AND 条件を明確化。Issue #147 Rv の穴を構造的に塞ぐ設計。

**2. CDP テンプレートの一般化**  
PR #152 の実運用パターンを Node.js + Playwright + `viewport 切替 → reload → 再評価` の一般テンプレートに展開。`chromium.connectOverCDP(...)` による既存ブラウザ接続パターンも記載、次回以降の C6 Issue が即利用可能。

**3. regex 精緻化ガイダンスの実務性**  
Issue #147 Rv 実例(`summary.line / summary.review / summary.weak_btn`)を引用しつつ、SRS 固有語 / 一般語 / 多言語漏れの 3 分類で規範化。JP `復習` / zh-Hant `複習` / ko `복습` / fil `pagbabalik-aral` などの具体語彙で 6 言語カバー例を明記。

**4. Rv 観点 10 の運用一貫化**  
既存の「Rv 12 観点表そのものはない」現状に適応し、§ 1 内で観点 10 を独立サブ § として明示配置。grep PASS でも動作時 visibility の期待値不一致または記録欠落は FAIL とする判定基準を明確化。

### 完了マイルストーン

- 改善候補 1 の docs 正典化完了 → 以後の C6 UI 改修 Issue で自動適用可能
- CDP visibility 検証パターンの汎用テンプレート整備
- regex 精緻化ガイダンス(SRS 固有語限定 + 6 言語漏れチェック)

### 次セッションの起点

**最優先: Phase 1-G(多言語 variant `-en` 等、5 言語全 variant)起票判断相談**

- 判断 A 案 β 確定済み: 5 言語全 variant を扱う
- 判断 B(スコープ分割方針): 案 α(1 Issue 統合)/ β(主要画面に絞る)/ γ(-en Phase 1-G-1 + 残 4 Phase 1-G-2)
- 判断 C(CD 確認タイミング): 案 α(本 Chat で網羅)/ β(Issue Phase 0 で網羅)
- 判断 D(改修分類予想): L3 × [C1, C5, C6] 想定、堅固化 B、Category F は Phase 0 で判定

### 現状ステータス

- **Phase 1**: 5/6 milestone 完了、1-G のみ残
- **DIVERGENCE.md**: 完全空(維持)
- **改善候補 stack**: 5 件残(改善候補 1 完了、2-6 継続 stack)
- **R03**: 実質完了、R04 ready 遷移条件を満たしつつある
- **Agent 運用**: Cursor と Codex の並行稼働開始(Issue 属性で使い分け可)

---

## 2026-07-24 更新(PR #151 / #152 Rv 完了、Phase 1 milestone 集約)

### PR #151(Issue #149 Phase 1-F オンボ + guide `?`)Rv 結果

**総合判定: 合格(条件付き — Naoya 実機で最終)**

6 スコープ受け入れアサーション全 PASS:
- SP 3g オンボ 4 スライド(id="onboarding" 29 / slide 系 23、CD 通り「つぎへ」→「はじめる」+ dot indicator + skip)
- PC 3g-pc 4 カード横並び(@media 1024px 3 / card 系 13、880px モーダル + Serif 見出し)
- LS `onboarding_completed_v1`(3 箇所: const + set/get)
- SP ヘッダー guide `?` btn(円形 SVG 再導入、`aria-label="ガイド"`、@media 1024px で `display:none`)
- reopenOnboarding(5 箇所、click handler + showOnboarding + hide + maybeShow + renderSlide)
- DIVERGENCE.md 完全空(SP guide 行削除、ヘッダー行のみ残置)

i18n 6 言語同期(Python + json 走査): en / ja / ko / zh-Hans / zh-Hant / fil の `slide_1〜4.title` + `next` + `skip` + `start` 全て OK。

**12 観点評価**:
- 観点 1-7, 10-12: PASS
- 観点 8「ついで作業ゼロ」: ⚠️ 軽微 — REPOSITORY-STRUCTURE.md の学習状況関数マップから #128 で削除済 `computeSrsQueue` / `renderProgressSrsQueue` / `paintProgressSrsWindow` / `startDirectStudy` 記述を整理(4 行削除、docs のみ)。Cursor Retrospective に「#128 残渣のドキュメント同期」として明記
- 観点 5, 9: 対象外 or 判定困難

**改善候補 5**: LS dual-write パターン整理(`LS_ONBOARDING_KEY` 定数 + 文字列リテラル併用の冗長を単一書き込みへ統一)

### PR #152(Issue #150 PC 品質補完)Rv 結果

**総合判定: 合格(条件付き — Naoya 実機で最終)**

5 スコープ受け入れアサーション全 PASS:
- PC ドリル画面 drill-header(drill-header/task-header 25 箇所、戻る 38px + task-title + progress meter + 語彙 40px + accent chip + counter)
- PC 支援画面 modal-chrome(modal-chrome/dots 15 箇所、44px 高 + 3 dots)
- SP "TOPへ" ボタン `#backTopBtn` に `display:none!important` in @media 1024px(SP では現状維持)
- Mode B Study 2 pane 化(6 箇所、`applyModeBStudyTwoPane({type:"modeb-study"})` + `#cardModeBStudyAnswer` DOM 分割)
- `/iː/` ロゴ CD 整合(1a-pc は 26px、2*-pc / 3*-pc / vocab / progress / symbol は `body.pc-support .brand{display:none!important}`)

**動作時 visibility 検証(改善候補 1 実運用第 1 号)**:
Cursor が Playwright/Puppeteer 相当 CDP スクリプトで PC 1440×900 / SP 390 の 6 画面 visibility を実装レポートに記載:
- 1a-pc: header-nav visible / /iː/ 26px / TOPへ none
- 3a-pc: modal-chrome 44px / brand / TOPへ none
- 2a-pc: task-header flex / 戻る 38 / 語彙 40 / accent + counter / topbar none
- 2c-pc Study: `drill-two-pane` / STEP1+STEP2 並置(各幅 ~498)
- 3b-pc vocab: page modal-chrome visible
- SP 3a: TOPへ visible(58×44)

**12 観点評価**:
- 観点 1-7, 10-12: PASS
- 観点 8「ついで作業ゼロ」: ⚠️ 1 件混入 — `showPurposeHome` に exclusive page(vocab / progress / symbol)を明示的にクリアする 4 行追加。「vocab から TOP 復帰時の wrap 隠れ残存防止(#147 残バグ対応)」として Retrospective に明記。scope 4/5 の動作正確性に密接に関連。PR #148 の accent-card fix と同じパターン
- 観点 5, 9: 対象外 or 判定困難

**改善候補 6**: scope 実現に必要な残バグ修正の事前相談ルール明文化(dev_project_common § 5 の Cursor 自己判断禁止に「scope 密接関連バグは Issue Comment で事前相談」を追記候補、改善候補 2 の関連課題)

### Phase 1 完了マイルストーン

LAUNCH-CHECKLIST v3.3(PR #151/#152 更新後):
- 1-A ~ 1-E: 完了
- 1-E-CD: 完了(#128 / PR #140)
- 1-F: 完了(#149 / PR #151、オンボーディング 3g + SP guide `?` 再導入)
- 1-H: 完了(#147 / PR #148、PC 版 CD 準拠)
- 1-H 補完: 完了(#150 / PR #152、PC 画面別ヘッダー 3 パターン + Mode B Study 2 pane + SP-only TOPへ)
- **1-G のみ残**(多言語 variant `-en` 等)

**DIVERGENCE.md 完全空到達** = CD-first パイプラインの第 1 サイクル完了。

### 次セッションの起点

**優先度順の候補タスク**:

1. **Phase 1-G(多言語 variant `-en` 等)起票**: Phase 1 の最後の milestone。ロードマップ R03(IPA / CD 取込)→ R04(IPA / 運用整備)遷移前の最終仕上げ
2. **改善候補 6 点の逐次起票開始**: 
   - 改善候補 1: PR #152 で先行実装済み、docs 化のみ(dev_project_common § への追記)
   - 改善候補 2, 6: 統合起票が妥当
   - 改善候補 3: Vercel Preview URL の運用整備
   - 改善候補 4: get_pr_commits 相当ツール
   - 改善候補 5: LS dual-write 整理(コード改修 Issue)
3. **R03 → R04 遷移確認**: DIVERGENCE.md 完全空 + Phase 1-G 完了で R03 が完全完了 → roadmap 更新

### 現状ステータス

- **Phase 1**: 5/6 milestone 完了、1-G のみ残
- **DIVERGENCE.md**: 完全空(CD-first パイプライン第 1 サイクル完了)
- **改善候補 stack**: 6 件(いずれも docs Issue / コード改修 Issue、Naoya 判断で逐次起票)
- **R03**: 実質完了、R04 ready 遷移条件を満たしつつある
- **Track A ローンチ準備**: Phase 1-G 完了で Phase 1 全体完了、ローンチ準備の最終段階へ

---

## 2026-07-23 更新(セッション後半)

### Issue #147 / PR #148 完了 → Rv 実施 → Naoya 実機発見 3 件

**Issue #147**(feat: PC UI CD compliance revamp + About SRS reference removal): L3 × [C1, C5, C6], 堅固化パターン B, Category F = C, Claude Rv 必須。5 スコープ宣言形、受け入れアサーション + スクショ対象 15 枚。PR #146 の宣言形・受け入れアサーション・スクショ必須ルールを初適用。

**PR #148 merged**: Cursor 実装完了。PC 1a 4×1 grid + top-sidebar + header-nav、PC ドリル task-header + 2 ペイン化(reveal 並置)、3a Accent → CEFR 順、`vocab.filter.spelling` 6 言語同期削除、About SRS 散文 6 言語削除、`/iː/` ロゴ PC 26px、DIVERGENCE.md TBD 5 行削除。

**Claude Rv 12 観点**: 合格(条件付き)。構造 grep は全項目 PASS(実測: purpose-card 22 / purpose-grid 4 / sidebar 39 / drill-pane 9 / task-header 18 / header-link 5)。SRS 削除掃討: ja/zh-Hans 各 3 件のヒットは `summary.line / summary.review / summary.weak_btn` = 1 セッション内間違い直しリスト(SRS 別 UI、意図的残置)。観点 8「ついで作業ゼロ」で ⚠️ accent-card textContent 上書きバグ fix が Cursor 自己判断で混入(透明性あり、DEV-GUARDRAILS § 5 原則違反)。Rv レポートは `GitHubApp MCP` の add_pr_comment が 3 回失敗のため Artifact 保持、GitHub 反映は Naoya 手動 paste 待ち。

### Naoya 実機発見(Rv 見落とし 3 件)

1. **「TOPへ」ボタン残存**: 学習中(2a / 2c / 3a)の右上に SP 起源の "TOPへ" が残っている(CD の PC ヘッダーには無い)
2. **PC ヘッダー nav が in-play で消失**: 1a では nav リンク(学習状況 / IPA って何？)出るが、2 系 / 3a では消えて "TOPへ" のみ → Issue #147 scope 4「全 PC 画面で単一の共通コンポーネント」宣言違反
3. **Mode B Study (2c 学習段階) 2 ペイン化未対応**: 2c Study は 1 ペインのまま(modeb-quiz のみ 2 ペイン化) → Issue #147 scope 2「4 モード全てで」宣言違反

見落とし理由: 構造 grep で `header-link ≥1 = 5 件` を PASS 判定したが「定義存在」と「動作時全画面 visibility」は別。動作時 visibility 検証手段(matchMedia + display 状態)が Rv フローに未整備。

Naoya 総評: "全般的に「IPA - Design System」の反映が雑？ヘッダーの情報も雑？"

### CD 状態確認(判断 B 実行結果)

- `sp.dc.html #3g`(line 415-): SP 版 4 スライド定義済み(iPhone フレーム、下ドット、「つぎへ」、LS `onboarding_completed_v1`)
- `pc.dc.html #3g-pc`(line 259-): PC 版 4 カード横並び(880px モーダル、Serif 見出し)
- `sp.dc.html` line 59: SP ヘッダー内 `<button aria-label="ガイド">` `?` 円形 SVG
- **Phase 1-F は Category F = C 確定**

PC ヘッダー CD 意匠(pc.dc.html #1a-pc line 48-49):
- `/iː/` 26px + "IPAサウンドドリル" 16px 700
- 右側: 学習状況(muted) / IPA って何？(accent) / 語彙リスト btn / 言語 dropdown
- **「TOPへ」ボタンは CD に無い**(Cursor が 1a のみに header-nav 実装、他画面には配置せず SP 起源 "TOPへ" が残った)

### 次セッションの起点

**最優先: Phase 1-F 統合 Issue + PC 品質補完 Issue を並行起票**

- **Phase 1-F 統合 Issue**: 3g SP + 3g-pc PC オンボーディング 4 スライド + SP guide `?` btn 再導入。L3 × [C4, C5, C6] 想定、Category F = C、堅固化パターン B
- **PC 品質補完 Issue**: Issue #147 の scope 4 / scope 2 未達補完
  - PC ヘッダー全画面共通化(1a 以外にも header-nav 展開、`/iː/` ロゴ全画面 26px 統一)
  - Mode B Study (2c 学習段階) 2 ペイン化
  - "TOPへ" ボタンの PC 非表示 or 削除
  - L3 × [C6]、Category F = C、堅固化パターン B

### 並行可: その他タスク

- **改善候補 4 点**(逐次起票 stack):
  1. 受け入れアサーション regex 精緻化 + 動作時 visibility 検証手段
  2. Cursor 自己判断 bug fix の運用ルール明文化
  3. C6 UI PR のスクショ代替運用(Preview URL Vercel deployment 経路整備)
  4. Phase 分割コミットの diff からの可検証性
- **Rv レポートの GitHub 反映**: `GitHubApp MCP` 復旧後に再試行 or Naoya 手動 paste
- **本 Chat の chat_log 保存**: Vault MCP `create_note` 失敗のため Artifact 保持、`10_chat_logs/2026/07/2026-07-23_issue-147-rv-and-phase-1-f-planning.md` 手動配置 or MCP 復旧後に再試行

## 2026-07-23 セッション成果(前半、Phase 1-E-CD 完了は既存記録)

(略、前セッション記録は下に保持)

---

# IPASoundDrill — Current State

## 最終更新: 2026-07-23

## Phase 1 UI/UX 進捗

Phase 1-E クロージング完了(2026-07-22)。Phase 1-E 後の CD 対本番 UI 乖離を一括で解消する作業(Issue #128 系列)が 2026-07-23 に完了。

| Milestone | 状態 | 備考 |
|---|---|---|
| 1-A | ✅ 完了 | |
| 1-B | ✅ 完了 | |
| 1-C | ✅ 完了 | |
| 1-D | ✅ 完了 | |
| 1-E | ✅ 完了 | PR #92 merged (2026-07-22) |
| **1-E-CD** | ✅ 完了 | SP UI CD 準拠一括改修 + bug fix + 運用整備。下記参照 |
| 1-F | ⏳ 未着手 | オンボーディング 3g 4 スライド + guide `?` 再導入 |
| 1-G | ⏳ 未着手 | |
| 1-H | ⏳ 未着手 | |

## 2026-07-23 セッション成果 (Phase 1-E-CD)

### CD-first 運用パイプラインの確立

Claude Design を Repo の正典として配置し、CD → Repo → Issue → 実装 → Rv のパイプラインを初回本格運用した。

| Issue | PR | 内容 | 状態 |
|---|---|---|---|
| #126 | #127 | CD ファイル初期 Repo 配置(`docs/claude-design/`) | ✅ merged |
| #128 | #140 | SP UI CD 準拠 13 項目一括改修 | ✅ merged |
| #130 | #132 | Category F(CD 修正判定)を DOCUMENT-MAP に追加 | ✅ merged |
| #133 | #136 | Category A-E → A-F 表記統一 | ✅ merged |
| #134 | #137 | CD A2/A5/A6 更新を Repo 反映 | ✅ merged |
| #138 | #139 | `docs/claude-design/UPDATE-GUIDE.md` 配置 | ✅ merged |
| #141 | #143 | progressCard 押下不可 + 対象語数 2 重表示 bug fix | ✅ merged |
| #142 | #144 | favicon 本番配線 | ✅ merged |
| #145 | #146 | 運用整備 5 項目(Rv 手順 / 宣言形 / アサーション / スクショ / DIVERGENCE) | ✅ merged |

### 確立された運用ルール

- **CD-first パイプライン**: CD 更新 → Repo `docs/claude-design/` 反映 PR → UI 改修 Issue の順で進める
- **Category F(CD 修正判定)**: UI 改修 Issue 起票前に A(CD 修正必須)/B(意図的乖離)/C(修正不要)を判定
- **`docs/claude-design/UPDATE-GUIDE.md`**: CD 更新指示書の作成ルール(8 セクション必須、事前確認義務、セルフチェック)
- **`docs/claude-design/DIVERGENCE.md`**: 意図的乖離・スコープ外の追跡テーブル(既知 6 行)
- **Rv 手順**: raw fetch + 標的 grep。diff 取得失敗を Rv 省略の理由にしない
- **宣言形 Issue**: 命令形(「X を追加せよ」)禁止。宣言形(「状態 S で終わること」)で書く
- **受け入れアサーション**: 機械検証可能な grep / コマンド。Cursor が実行 → Claude が再実行
- **UI PR スクショ必須**: C6 含む PR でスクショ無しは FAIL
- **削除系改修の掃討 3 種**: コード参照 / i18n キー / 機能を説明する散文

### 反映漏れの振り返りと対策

PR #140 merge 後に B-1(progressCard 押下不可) / B-2,B-3(対象語数 2 重表示)が発覚。原因を 3 機構に分解:

1. **検証手段のない検証項目**: 観点 13 に手順が無く、レポート査読に退化 → 対策: raw fetch + アサーション
2. **命令形の指示が既存状態と衝突**: 「追加せよ」が重複を招く → 対策: 宣言形統一
3. **視覚的忠実性は text-only agent で検証不能**: 構造・機能は grep で取れるが意匠はレンダリングが要る → 対策: PR スクショ必須化

## 次セッションの起点

### 最優先: PC UI CD 準拠改修

DIVERGENCE.md の TBD 5 行を解消する L3 改修:

| 画面 | 乖離内容 |
|---|---|
| 1a PC トップ | 目的カード 1 カラム(CD: 4×1 グリッド)、右カラム sidebar 不在、ヘッダーテキストリンク不在 |
| 2 系 PC ドリル | 1 ペイン構成(CD: 2 ペイン)、タスクヘッダー不在 |
| 3a PC プロフィール | Accent pill 表示(CD: カード)、順序逆、h3 文言差、info panel 差 |
| 全画面 PC ヘッダー | /i:/ ロゴの意匠差、テキストリンク不在 |
| About features item_5 | SRS 復習キューへの言及残存(機能は削除済み) |

**進め方**: Category F 判定 → CD 修正が必要か判定 → Issue 起票(宣言形 + 受け入れアサーション + スクショ対象リスト)→ Cursor 実装 → Rv(raw fetch + grep + スクショ)→ merge

### 並行可: その他タスク

- **About features item_5 SRS 記述削除 + `vocab.filter.*` 未使用キー整理**: PC 改修 Issue に統合可能
- **Phase 1-F**: 3g オンボーディング 4 スライド + guide `?` 再導入。DIVERGENCE.md の最後の 1 行(SP guide `?` btn)を解消
- **CD 更新指示書の Vault 保存**: `30_projects/IPASoundDrill/handoff/cd-updates/2026-07-23_issue-128-a2-a5-a6.md`
- **`src/index.template.html` 分割の検討**: 235KB 単一ファイルが Rv の構造的障壁。L3 調査 Issue

## Repo の主要ファイル参照先

- CD 正典: `docs/claude-design/{sp,pc,design-system}.dc.html`
- CD 運用: `docs/claude-design/{README,UPDATE-GUIDE,DIVERGENCE,update-log}.md`
- Governance: `CLAUDE.md` / `AGENTS.md` / `docs/DOCUMENT-MAP.md` / `docs/CHANGE-CLASSIFICATION.md`
- 運用共通: `docs/dev_project_common.md`(Rv / 宣言形 / アサーション / スクショ)
- 実装本体: `src/index.template.html`(235KB、インライン JS)
- ビルド: `scripts/build-i18n-html.js` → `/{lang}/index.html`
