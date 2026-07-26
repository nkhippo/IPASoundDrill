---
project: IPASoundDrill
roadmap_node: R04
status: active
summary: "Claude Design update instructions for Issue #163 (Category F=A). 3 update instructions: (1) Remove STEP 1 badge from 2a-pc/2b-pc/2c-pc/2d-pc, (2) Add 3-slot progress control to 3b-pc vocab cards, (3) Add 全消去 control to 3b-pc filter section."
tags:
  - ipasounddrill
  - cd-update
  - category-F-A
  - issue-163
title: "Claude Design 修正指示書 — Issue #163 (PC UI 品質補完 Phase 2)"
type: cd-update-instruction
created: 2026-07-24T21:52:31+09:00
updated: 2026-07-24T21:52:31+09:00
---

# Claude Design 修正指示書 — Issue #163(PC UI 品質補完 Phase 2)

**対象 CD ファイル**: `docs/claude-design/pc.dc.html`  
**関連 Issue**: [#163](https://github.com/nkhippo/IPASoundDrill/issues/163)  
**Category F**: A(CD 更新必要)  
**作成日**: 2026-07-24  
**作成者**: Claude(Naoya の Vault セッション経由)

---

## 目的

Issue #161 の Phase 0 で Codex が発見した意匠差(Category F=A 判定)を CD 側で正典化する。3 件の CD 更新を実施し、Issue #163 の Phase 1+ 実装が可能な状態にする。

## 更新対象

`docs/claude-design/pc.dc.html` の以下 5 セクション:
- `<section id="2a-pc">`(ドリル A: 音の発音を確かめる)
- `<section id="2b-pc">`(ドリル B: 発音から書いてみる)
- `<section id="2c-pc">`(ドリル C: 音から単語を覚える / Mode B Study)
- `<section id="2d-pc">`(ドリル D: 連結する音に慣れる)
- `<section id="3b-pc">`(語彙リスト)

## Design System トークン参照(design-system.dc.html)

- `--signal`: `#0C7C7E`(primary signal color)
- `--signal-soft`: `#0C7C7E22`(soft signal background)
- `--hair`: `#E6E1D5`(hair-line border)
- `--panel`: `#F5F1E8`(panel background)
- `--paper`: `#FDFAF3`(paper background)
- `--muted`: `#5C5850`(muted text)
- `--faint`: `#9A968B`(faint text)
- `--ink`: `#1E1B15`(primary ink)
- `--stress`: `#D85A30`(stress underline)

---

## 指示書 1: 2 系ドリル画面(2a-pc / 2b-pc / 2c-pc / 2d-pc)の STEP 1 badge 削除

### 現状(削除前)

各 2*-pc の STEP 1 セクションは、左に「STEP 1 · [題名]」ラベル、右に「語彙 A1」or「語彙 A2」の pill badge を `display:flex;justify-content:space-between` で並置している。

### 対象 4 variant の badge 内容

| Variant | badge 内容 | badge color |
|---|---|---|
| 2a-pc(音の発音を確かめる) | 語彙 A2 | `var(--signal)` |
| 2b-pc(発音から書いてみる) | 語彙 A2 | `#0C7C7E` |
| 2c-pc(音から単語を覚える) | 語彙 A1 | `#3E8E5A` |
| 2d-pc(連結する音に慣れる) | 語彙 A1 | `#3E8E5A` |

**注意**: 2b-pc / 2c-pc の STEP 1 badge は STEP 2 側にも同色で存在するが、**STEP 2 側の badge は残す**(STEP 2 は「答え・意味」パネルとして独立した文脈)。

### 変更後(削除後)

STEP 1 セクションの右側 pill badge を削除し、`<span>STEP 1 · [題名]</span>` のみを左寄せで表示する。

- `<div style="display:flex;align-items:center;justify-content:space-between">` ラッパーを削除
- 右側の `<span>語彙 A1/A2</span>` を削除
- 左側 `<span>STEP 1 · ...</span>` のみを直接配置

### 削除理由

- badge が担っていた情報(語彙レベル A1/A2)は、既に task-header の progress meter(画面上部)で表示されている
- STEP 1 内での再表示は情報の冗長で、PC UI として不要
- 実機で Naoya が「STEP 1 内に A1 badge + 0% (1/1187) の冗長表示」を意匠問題として指摘

### 対象箇所の適用

**4 variant すべてに統一的に適用**:
- 2a-pc: STEP 1「出題」
- 2b-pc: STEP 1「綴りから IPA を組み立てる」
- 2c-pc: STEP 1「聞き取り」(2c-pc は Mode A Drill と Mode B Study の 2 種があるが、いずれの STEP 1 も対象)
- 2d-pc: STEP 1「文中のフレーズを聞いて書く」

---

## 指示書 2: 3b-pc(語彙リスト)への 3 slot progress control 追加

### 現状(追加前)

3b-pc の各語彙カード(`jacket` / `apple` / `measure` / `through` の 4 サンプル)は、GA/RP 発音行までで終わっている。「覚えた」状態を示す 3 slot progress control が存在しない。

### 変更後(追加後)

各語彙カード内、RP 発音行の下に、3 slot progress control を追加する。

### 4 語彙カードでの表示バリエーション(サンプル例示)

Claude Design 上で 4 語彙カードに以下のバリエーションで配置する(サンプルとしての意匠一貫性):

| Word | 「覚えた」表記 | slot 状態 |
|---|---|---|
| jacket | 覚えた **2/3** | ✓ / ✓ / □ |
| apple | 覚えた **3/3** | ✓ / ✓ / ✓ |
| measure | 覚えた **0/3** | □ / □ / □ |
| through | 覚えた **1/3** | ✓ / □ / □ |

**3 slot 状態別の styling**:
- **checked slot**: `border:2px solid var(--signal);background:var(--signal);color:#fff` + SVG チェックマーク
- **unchecked slot**: `border:2px solid var(--hair);background:var(--paper)` + 空要素

### 追加理由

- 実装側に 3 slot(`.pc-slot` class 想定)progress control が存在するが、CD に表現がなく、意匠正典を確定できない
- SP 版 3b にも同種の control が存在するので、PC 版も consistency を確保する必要
- 2 系ドリル画面の STEP 2 右下にも同じ 3 slot control が既に CD に存在(例: 2b-pc STEP 2 の「覚えた 1/3」+ 3 slot)

### 参考: 2b-pc STEP 2 の既存 3 slot 実装

CD の 2b-pc STEP 2 の該当箇所を Claude Design 上で参照し、3b-pc の語彙カード内に同じスタイルで adapt する。3b-pc への adapt では slot サイズを 24px → 20px、padding を 12px 18px → 10px 14px、gap を 8px → 6px と、語彙カードのより small なフットプリントに合わせる。

---

## 指示書 3: 3b-pc(語彙リスト)への「全消去」control 追加

### 現状(追加前)

3b-pc の filter section(`IPAで絞り込み (最大3)` label + `記号ピッカーを開く` button)は 1 つの button のみを表示している。

### 変更後(追加後)

右側の button 群を 2 つの button で構成し、「全消去」button を「記号ピッカーを開く」の左側に配置する。

### 「全消去」の 2 状態(通常 / disabled)

**通常状態**(IPA フィルタが 1 個以上設定されている時):
- border `var(--hair)`
- background `var(--panel)`
- color `var(--muted)`
- padding `7px 16px`
- border-radius `999px`
- font-size `13px`
- font-weight `600`

**disabled 状態**(IPA フィルタが未設定時、デフォルト):
- 通常状態と同じ styling に加えて
- color `var(--faint)`
- cursor `not-allowed`
- opacity `0.5`

**Claude Design 上での配置方針**: CD には「通常状態」を代表として配置し、意匠の確認可能な状態(常時表示)にする。disabled 状態は実装側で JavaScript 制御される想定。

### 追加理由

- 実装側に「全消去」button が存在するが、CD に配置基準がなく、padding / border-radius が古い意匠のまま
- 「IPAで絞り込み (最大3)」の filter section で、フィルタを個別に外す操作とは別に「一括で消去」の需要が高い
- 「記号ピッカーを開く」の左側配置は、read の自然な順序(全消去 → 記号ピッカーを開く = リセット → 再設定の流れ)

---

## 変更完了後の受け入れ確認

Claude Design 上で以下を確認:

### 指示書 1 の確認

- 2a-pc / 2b-pc / 2c-pc / 2d-pc の STEP 1 セクションで、右側の「語彙 A1/A2」pill badge が非表示
- STEP 1 label(「出題」/「綴りから IPA を組み立てる」/「聞き取り」/「文中のフレーズを聞いて書く」)は左寄せで残置
- 4 variant で統一的に対処されている
- 2b-pc / 2c-pc の STEP 2 側の badge は残置されている(削除対象外)

### 指示書 2 の確認

- 3b-pc の 4 語彙カード(jacket / apple / measure / through)すべてに 3 slot progress control が追加
- 「覚えた N/3」表記 + 3 slot(checked / unchecked)の意匠
- slot サイズは 20×20、gap 6px、padding 10px 14px の small フットプリント

### 指示書 3 の確認

- 3b-pc の filter section に「全消去」button が「記号ピッカーを開く」の左側に配置
- 通常状態(border `var(--hair)`、background `var(--panel)`、color `var(--muted)`)
- 「記号ピッカーを開く」の意匠は保持(border `var(--signal)`、background `var(--signal-soft)`)

---

## Naoya への次のアクション

1. **Claude Design で pc.dc.html を開く**(canonical design source)
2. 上記 3 指示書の変更を Claude Design 上で適用
3. 変更後の pc.dc.html を export
4. `docs/claude-design/pc.dc.html` を更新し、CD 単独 PR で merge
5. Issue #163 Comment で「CD 更新完了、Phase 1 開始許可」を投稿 + 実装 agent 決定

## 参照

- Issue #163: <https://github.com/nkhippo/IPASoundDrill/issues/163>
- Issue #161 Phase 0 Codex 判定: <https://github.com/nkhippo/IPASoundDrill/issues/161#issuecomment-5066719517>
- Design System: `docs/claude-design/design-system.dc.html`
- 現行 CD: `docs/claude-design/pc.dc.html`
- UPDATE-GUIDE: `docs/claude-design/UPDATE-GUIDE.md`

## HTML スニペット(実装コード付き)

詳細な HTML スニペットは Downloads の `cd-update-instructions-issue-163.md` を参照。Vault 側は Naoya が参照する要約版として保持。

<hr>

_Claude Design 修正指示書は Category F=A の運用フローに従い、Naoya の Claude Design 対応の入力として使用される。CD 更新完了後、本ファイルは archive 対象。_
