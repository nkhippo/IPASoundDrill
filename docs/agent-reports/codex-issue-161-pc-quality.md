---
id: pj-2026-07-24-issue161
aliases:
- pj-2026-07-24-issue161
title: 'PC UI品質補完 Scope 1/2 (#161) — 実装レポート'
created: '2026-07-24'
---

# PC UI品質補完 Scope 1/2 (#161) — 実装レポート

## 関連 Issue / PR

- Issue: #161
- PR: Draft PR（本レポート更新後に作成）
- Agent: Codex
- Agent override: Issue本文のdefault agentはCursorだが、NaoyaのCodexクラウド対応依頼とIssue comment `#issuecomment-5068179220` に基づくNaoya-override

## Issue背景

Phase 1完了後の実機確認で見つかったPC 4画面の意匠差を扱うIssue。当初のScope 3/4はPhase 0でCategory F=Aと判定され、Naoya承認によりCD更新指示書付きの別Issueへ分離された。本PRはCategory F=CのScope 1（PCトップ `1a-pc`）とScope 2（PCプロフィール `3a-pc`）だけを対象に、現行CDへ実装を一致させる。

## 実装内容

- PCトップでは `#aboutBlock` を非表示にし、CDどおり `#topSidebar` のAboutだけを表示
- PC header actionsを語彙ボタン→言語ドロップダウンの順に整列
- `#pcModalChrome` を `#setup` 内へ移し、3 dotsをプロフィールカードのchromeとして統合
- `.profile-body` を追加し、chromeと本文paddingを分離
- PCプロフィールの `#profileBackBtn` を非表示（SPでは維持）
- PCのGA/RPをDesign System token準拠の選択ボタンへ整形し、✓ prefixとIPA補助表示をPCだけ非表示
- プロフィール遷移時に `window.scrollTo(0,0)` を実行し、カード上端とchromeが画面外へ残る状態を防止

## 変更ファイル

```
- src/index.template.html (M)
- docs/LAUNCH-CHECKLIST.md (M)
- docs/agent-reports/codex-issue-161-pc-quality.md (A)
```

## Phase / Category F

- Phase 0: Scope 1/2 = F=C、Scope 3/4 = F=A とIssue commentで報告
- Naoya承認: Scope 1/2のみ本Issueで実装、Scope 3/4は別Issueへ分離
- CD更新: なし（`pc.dc.html`を含む正典ファイルは完全不変）
- DIVERGENCE追記: なし（F=C）

## CDP visibility QA

判定基準: `overflowX === false && (overflowY === false || (visible && diff <= 3px)) && 0 < containerRatio <= 1.05`。本変更対象では許容判定を必要とするfont metrics差は発生しなかった。

| viewport | 言語 | 画面 | selector | 項目 | 期待 | 実測 | 判定 |
|---|---|---|---|---|---|---|---|
| 1440×900 | ja | 1a | `#topSidebar` / `#aboutBlock` | visible | About表示が1件 | sidebarのみ表示、count=1 | PASS |
| 1440×900 | ja | 1a | `.top-pc-layout` | overflow / ratio | overflowなし、ratio≤1.05 | overflowX=false、ratio=0.775 | PASS |
| 1440×900 | ja | 1a | `#vocabBtn` / `#headerLang` | order | 語彙→言語 | x=1173.5→1221.5 | PASS |
| 1440×900 | ja | 1a | document | overflow | horizontal overflowなし | overflowX=false | PASS |
| 1440×900 | ja | 3a | `#setup` | visible / overflow | card全体表示、overflowなし | 720×721.14、x=352.5、y=39.11、overflowX/Y=false | PASS |
| 1440×900 | ja | 3a | `#pcModalChrome` | context / visible | setup内、44px表示 | parent=`setup`、display=flex、height=44 | PASS |
| 1440×900 | ja | 3a | `#profileBackBtn` | visible | PC非表示 | display=none | PASS |
| 1440×900 | ja | 3a | `#profileAccentGa` / `#profileAccentRp` | typography / weight | 15px、選択700/未選択600 | 15px、700/600、overflowなし | PASS |
| 390×844 | ja | 1a | `#purposeGrid` | overflow | SP横overflowなし | overflowX=false | PASS |
| 390×844 | ja | 1a | `#topSidebar` / `#aboutBlock` | visible | SP既存状態維持 | 両方非表示 | PASS |
| 390×844 | ja | 3a | `#setup` | overflow | SP横overflowなし | width=351、overflowX/Y=false | PASS |
| 390×844 | ja | 3a | `#profileBackBtn` | visible | SPでは維持 | display=inline-block、visible=true | PASS |
| 390×844 | ja | 3a | `#pcModalChrome` | visible | SP非表示 | display=none | PASS |
| 390×844 | ja | 3a | `.accent-card-check` | DOM / visibility | SP既存SVGを維持 | DOM 2件、PC mediaのみ非表示 | PASS |

## 動作確認

- `node scripts/build-i18n-html.js`: PASS（en / ja / ko / zh-Hans / zh-Hant / fil）
- PC 1440×900: Scope 1/2の主要selector、overflow、visibility、font size/weightを実ブラウザ確認
- SP 390×844: Scope 1/2の回帰確認、horizontal overflowなし
- プロフィール遷移後 `scrollY=0`、chrome上端 `y=40.11` を確認
- Scope 3/4のDOM/CSSは変更なし

## ブラックリスト md5

以下19パスをHEAD baselineと実装後で比較し、全件一致した。

- Claude Design 7ファイル: PASS（`pc.dc.html` = `10943E9FA24D4B96CFF4111B45427E5C`）
- `docs/dev_project_common.md`: PASS
- Runtime data contract 5パス（wordlist、connected speech、weak forms、guide、font）: PASS
- i18n 6言語JSON: PASS

## 実装中に発見した懸念

- プロフィール遷移前のトップページscroll位置が維持され、カード上端が負の座標になる既存挙動を検出した。Scope 2のchrome孤立表示に直結するため、プロフィール表示時のscroll resetを密接関連修正として含めた。
- Scope 3/4は承認どおり変更していない。

## Complexity Retrospective

- 事前分類: L3 / C6（必要時C1）
- 実績: Scope縮小後もDOM構造、responsive CSS、遷移時scroll、実ブラウザQA、md5照合を伴った
- 総合判定: **事前分類妥当**
- Pattern追加提案: なし

## 残課題・申し送り

- Scope 3/4はCategory F=Aとして、CD更新指示書付きの別Issueで扱う。
- PR Previewまたは実機で、PC 1440×900のトップとプロフィールを最終確認する。

