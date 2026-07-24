---
id: pj-2026-07-23-26ac
aliases:
- pj-2026-07-23-26ac
title: 'dev_project_common — Repo 配置の運用ルール（Issue #145）'
created: '2026-07-23'
---

# 開発運用共通ルール（Repo 配置）

Cursor / Codex が Issue・PR・Rv で参照する **Repo 側の運用ルール**。  
Vault 正典 `00_meta/operations/dev_project_common.md` の横断ルールを補完し、Issue #145 で追加した検証機構を明文化する。

プロジェクト固有の正本は引き続き `AGENTS.md` / `CLAUDE.md` / `docs/DOCUMENT-MAP.md` / `docs/CHANGE-CLASSIFICATION.md`。

---

## 1. Claude PR Rv 手順（raw fetch + 標的 grep）

### 原則

- PR Rv では **diff 取得に依存しない**。必要ファイルを **raw fetch** し、Issue 本文の **受け入れアサーション** を **標的 grep / コマンド** で検証する。
- **diff 取得失敗を Rv 省略の理由にしない**。失敗時は raw fetch に切り替え、それでも不可なら Issue/PR Comment で Naoya に報告して保留する（「見なかったことにする」は禁止）。
- **単一ファイルが約 235KB を超える PR**（例: 大型 `src/index.template.html`）では、diff の目視完走を前提にせず、**raw ファイルに対する grep / アサーション結果**で合否を判定する。
- 実装レポートの自己申告に ✅ を付けるだけの確認は **Rv とみなさない**。観点ごとに再検証の痕跡（実行したコマンド・出力要約）を Rv レポートに残す。

### Rv 観点 10 — 検証結果の記録

観点 10 は「grep 検証結果の記録」だけでなく、適用条件に該当する場合の「動作時 visibility 検証結果の記録」を含む。

- Cursor / Codex は実装レポートに CDP visibility 検証結果を viewport・画面 / 状態・selector・期待・実測の表で記録する。
- Claude（Rv）は表の自己申告だけを採用せず、実装された selector・状態遷移・viewport と照合し、可能な環境では同じアサーションを再実行する。
- grep の定義存在が PASS でも、動作時 visibility の期待値不一致または記録欠落は FAIL とする。

### 観点 13「CD 意匠再現度」との関係

- 構造・機能は本セクションの grep / アサーションで検証する。
- 視覚的忠実性は § 4（PR スクショ）および Naoya 実機と併用する。text-only の自己申告だけでは PASS にしない。

---

## 2. Issue 起票 — 宣言形の徹底

### 宣言形（必須）

Issue 本文の実装指示は **宣言形**で書く。

- ✅ 「この画面は状態 S で終わること」
- ✅ 「`#progressCard` はトップからタップ可能であること」
- ❌ 「X を追加せよ」（命令形）— **禁止**

宣言形は自己修正的である:

| 現状 | エージェントの解釈 |
|---|---|
| 要素が 0 | 追加して状態 S にする |
| 要素が 1（意匠不一致） | restyle / 配線修正して状態 S にする |
| 要素が 2 以上（重複） | 統合して状態 S にする |

### 削除系改修の「言及の掃討」3 種（必須）

機能・UI・キーを削除する Issue では、完了定義または受け入れアサーションに次の **3 種の掃討**を明示する:

1. **コード参照** — DOM id / 関数名 / イベント配線 / CSS セレクタ
2. **i18n キー** — 削除対象 key の 6 言語同期削除と `validate_i18n.py`
3. **機能を説明している散文** — About / README / LP / ガイド文面など、削除済み機能への言及

---

## 3. Issue 起票 — 受け入れアサーション欄

### 配置

「完了定義」セクションの **直下**に **「受け入れアサーション」** 欄を置く。

### 要件

- 各アサーションは **機械的に検証可能**であること（grep / コマンド出力 / 件数・数値比較 / md5）。
- 「見た目が良い」「自然」など主観のみの項目はアサーションにしない（スクショ対象リストや実機チェックに回す）。

### 実行義務

| 役割 | 義務 |
|---|---|
| Cursor / Codex | 実装後にアサーションを実行し、**結果を実装レポートに記載**する |
| Claude（Rv） | アサーションを **再実行**し、Cursor 報告と照合する。不一致は FAIL |

### 動作時 visibility 検証（Runtime visibility verification）

#### 原則と適用条件

grep による定義存在の確認は必要条件であり、動作時に全画面・全モードで対象が見えることの十分条件ではない。Issue #147 の Rv では構造 grep が PASS した一方、実機で PC ヘッダー nav の in-play 消失、Mode B Study の 2 pane 未適用、SP 専用「TOPへ」の PC 残存が見つかった。

C6（Product behavior / UX）を含み、scope に「全画面で XXX」「全モードで XXX」「visible / hidden」などの動作時状態が宣言されている Issue では、構造 grep に加えて CDP / Playwright / Puppeteer による動作時 visibility 検証を必須とする。PC（1440 × 900）と SP（幅 390）の両 viewport を確認し、画面・状態・期待値・実測値を実装レポートの表に記録する。

#### 判定パターン

次の 4 API を組み合わせ、viewport、DOM 存在、CSS 描画状態、実描画サイズを別々に確認する。

```js
const result = await page.evaluate((selector) => {
  const element = document.querySelector(selector);
  if (!element) {
    return { desktop: window.matchMedia("(min-width:1024px)").matches, exists: false };
  }

  const style = getComputedStyle(element);
  const rect = element.getBoundingClientRect();
  return {
    desktop: window.matchMedia("(min-width:1024px)").matches,
    exists: true,
    display: style.display,
    visible: style.display !== "none" && rect.width > 0 && rect.height > 0,
    width: rect.width,
    height: rect.height,
  };
}, "#target");
```

`document.querySelector(...)` の成功だけで PASS にしない。`getComputedStyle(...).display !== "none"` と `getBoundingClientRect().width > 0`（必要に応じて height も）を同時に満たすことを確認する。

#### CDP スクリプトテンプレート

PR #152 の実運用パターンを一般化した Node.js + Playwright 例:

```js
import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://127.0.0.1:8000/ja/", { waitUntil: "networkidle" });

for (const selector of ["#headerNav", "#backTopBtn"]) {
  const state = await page.locator(selector).evaluate((element) => {
    const style = getComputedStyle(element);
    const rect = element.getBoundingClientRect();
    return {
      desktop: matchMedia("(min-width:1024px)").matches,
      display: style.display,
      width: rect.width,
      visible: style.display !== "none" && rect.width > 0 && rect.height > 0,
    };
  });
  console.log(selector, state);
}

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: "networkidle" });
// SP でも同じ対象を評価し、PC / SP の期待値と照合する。
await browser.close();
```

静的サイトは `python3 -m http.server 8000` で配信し、Playwright / Puppeteer が起動した Chromium の CDP セッションから同じ評価式を実行できる。既存ブラウザへ直接接続する場合は `chromium.connectOverCDP(...)` を使う。PR #152 と同様、少なくとも対象全画面と状態遷移後を巡回し、結果を次の形式で残す。

| viewport | 画面 / 状態 | selector | 期待 | 実測 |
|---|---|---|---|---|
| PC 1440 × 900 | 例: drill in-play | `#headerNav` | visible | display / width / visible |
| SP 390 | 例: modal | `#backTopBtn` | visible | display / width / visible |

#### font metrics 差の判定基準

##### 背景

Serif（Noto Serif JP 等）や IPA（Charis SIL / Doulos SIL）を使う UI 要素では、strict overflow 条件（`scrollWidth > clientWidth || scrollHeight > clientHeight`）が **視覚破綻のない 1–3px の縦差** を拾い、false positive になりやすい。`scrollHeight > clientHeight` は font **ink box**（ascender / descender 込み）と **line box** の差を拾うため、厳密判定だけでは不十分である。

実例: PR #156（Issue #155 Phase 1-G）の 5 言語 × 9 画面 CDP QA（360 行）で raw strict overflow が 32 件ヒットしたが、精査の結果すべてが横 overflow 0 件・縦 1–3px・`overflow: visible` であり、視覚破綻なしと判定した。

##### 柔軟 PASS 条件

overflow 候補に対し、次を **AND** で満たせば PASS（font metrics 差として許容。CSS / i18n 変更は不要）:

```text
overflowX === false
&& (
  overflowY === false
  || (
    getComputedStyle(el).overflow === "visible"
    && (scrollHeight - clientHeight) <= 3
  )
)
&& 0 < containerRatio <= 1.05
```

ここで `containerRatio` は概ね `element.getBoundingClientRect().width / parent.getBoundingClientRect().width`（親が取れない場合はレポートに明記し FAIL 扱いを検討）。

##### 判定根拠

| 要因 | 目安 |
|---|---|
| subpixel rounding | ブラウザが fractional px を丸めるため 1px 未満〜数 px の差 |
| border-box の border | 最大おおよそ 2–3px |
| font ink box vs line box | Serif / IPA で ink box が line box より 1–3px 大きいことが多い |
| `containerRatio` 上限 `1.05` | subpixel + border の許容上限。`> 1.05` は明らかな overflow 候補 |

##### 適用条件

- Change Pattern に **C6** を含み、CDP QA で overflow 判定を実施する Issue
- Serif / IPA / CJK 混合フォント環境の UI QA（実質的に C6 UI Issue 全般）
- 実装レポートと Claude Rv の双方で、本条件を同じ定義で適用する

##### PR #156 実測例（引用）

32 件すべて `overflow: visible` + 縦差 ≤ 3px + `containerRatio ≤ 1.05` で許容。代表 selector:

- `#purposeStub h1`（Serif 見出し）
- `#dIpa` / `#mbSIpa`（IPA 表示）
- その他 Serif / IPA 系テキストノード

詳細は `docs/agent-reports/codex-issue-155-phase-1-g.md` Phase 3 と `docs/claude-design/DIVERGENCE.md`（Phase 1-G font metrics 行）を参照。

### regex 精緻化ガイダンス（regex precision guidance）

削除掃討の regex は、対象概念の固有語に限定する。一般語まで含む過大 regex は別の意味の正当な UI を false positive にし、逆に「ヒット件数があるから確認済み」という誤判定を招く。Issue #147 Rv の `summary.line` / `summary.review` / `summary.weak_btn` は SRS とは別 UI であり、一般語の `復習` / `复习` / `review` を SRS 削除対象と同一視してはならない。

- **SRS 固有語に限定**: `SRS|spacedRepetition|computeSrsQueue|srsQueue|reviewQueue|spaced\\s*repetition|간격\\s*반복` のように、固有の関数名・キー・概念語を列挙する。
- **一般語を別カテゴリ化**: `復習` / `复习` / `review` などは削除対象と残置対象を先に明記し、固有語 regex の結果と分けて記録する。
- **意味の重複を確認**: ヒットごとに SRS 機能への参照か、summary 等の別 UI の一般語かを分類する。件数だけで PASS にしない。
- **多言語漏れチェック**: 対象 6 言語を個別に確認する。例として JP `復習`、zh-Hans `复习`、zh-Hant `複習`（繁体字）、ko `복습`、fil `pagbabalik-aral`、en `review` をカバーし、当初の検索語から言語が漏れていないことを記録する。

### 記載例

```markdown
## 受け入れアサーション

1. `rg -n 'id="progressCard"' src/index.template.html` が 1 件以上
2. `rg -n 'purposeGrid.*progressCard|progressCard.*addEventListener' src/index.template.html` でクリック配線が確認できる
3. `rg -n 'computeSrsQueue|guideModal' src/index.template.html` が 0 件
4. `python3 tools/validate_i18n.py` が hard error 0
```

---

## 4. PR 提出 — UI 改修のスクショ必須

### 適用条件

Change Pattern に **C6（Product behavior / UX）** を含む UI 改修 Issue。

### Cursor / Codex の義務

1. Issue 本文の **スクショ対象画面リスト**（必須記載）の全画面について、ローカルビルドまたは Preview 上のスクショを **PR Comment に添付**する。
2. 技術制約で添付できない場合は、その旨を PR Comment に明記し、**Naoya 実機検証を Claude Rv の前提**とする（黙って省略しない）。

### Claude Rv の義務

- スクショ添付（または上記の明示的代替）が無い UI 改修 PR は、構造検証が PASS でも **FAIL**。
- 観点 13「CD 意匠再現度」は、スクショ / 実機結果と受け入れアサーションの両方を見て判定する。

### Naoya 実機との順序

- Naoya 実機検証は Claude Rv の **後工程専用にしない**。
- **Claude Rv と並行**して実施する（Claude が PASS を出す前に Naoya が実機で見てよい）。

---

## 5. Agent 運用ルール

### 背景

Cursor / Codex の使い分けは、複数の Issue / PR を通じて実運用パターンとして確立している。本節は、その選択基準、Naoya-override、追加変更と密接関連バグの扱いを正典化し、新規メンバーや将来の運用者が同じ判断を再現できるようにする。

### Agent 想定領域

| Agent | Default の想定領域 | 実績例 |
|---|---|---|
| **Cursor 想定** | L3 実装複合（UI実装、SP UI改修、複数ファイル横断改修） | PR #148（Issue #147）/ #151（#149）/ #152（#150）/ #158（#157、Naoya-override） |
| **Codex 想定** | L1 docs、L3 UI QA（CDP visibility検証）、単一ファイル改修 | PR #154（Issue #153）/ #156（#155） |

この表は排他的な担当表ではなく、Issue起票時・実行時のdefault選択を補助する。最終的なagent選択はIssueの複雑度、変更パターン、実行環境とNaoya判断を優先する。

### Issue ラベルの運用

- `ready-for-cursor`: Cursor実装を想定し、Naoyaが起票内容の5項目チェック完了後に付与する。
- `ready-for-codex`: Codex実装を想定し、同じチェック完了後に付与する。
- ラベルは実装agentのdefault想定を示す。担当を固定する権限設定ではなく、Naoya-overrideで変更できる。
- 実行時にラベルがない場合も、Naoyaから明示されたagentが実施できる。

### Naoya-override による agent 変更

Naoyaは、実行時のavailability、実装スピード、品質判断に基づき、Issueラベルと異なるagentへ依頼できる。

実行agentは透明性100%を保つため、実装レポートの「関連 Issue / PR」または「実装過程での気づき」に、Issueラベルと実際のagentの差異およびNaoya依頼によるoverrideであることを明記する。

> 例: Issueは `ready-for-codex` だが、Naoya依頼によりCursorが実施。

実装レポートのファイル名はIssueラベルではなく、**実際に実装したagent**の命名規則に従う。

- Cursor: `docs/agent-reports/cursor-issue-<N>-*.md`
- Codex: `docs/agent-reports/codex-issue-<N>-*.md`

PR #158（Issue #157）は、`ready-for-codex` からCursorへoverrideし、差異をレポートへ明記した実運用例である。

### Cursor 自己判断による追加変更のルール

- 原則として、IssueのScope外の変更をCursorが自己判断で追加することは避ける。
- lint、typo、整形、リファクタ、関連しないバグ修正など「ついで作業」は行わない。
- Scopeの完成に必要な残バグ（密接関連バグ）を発見した場合も、無断でScopeへ取り込まず、次項の事前相談ルールを適用する。
- PR #148のaccent-card fix、PR #152の`showPurposeHome` exclusive page clearは過去の自己修正パターンである。一方、PR #158では自己判断による追加変更0件のclean実装を確認した。以後はPR #158の透明なScope遵守をdefaultとする。
- Codexその他のagentも、同じScope遵守と透明性の原則を適用する。

### scope 密接関連バグ修正の事前相談ルール

IssueのScope完成の前提となる密接関連バグを発見した場合、実装agentは次の順序で対応する。

1. 対象変更の実装を中断する。
2. Issue Commentへ「Scope Nの完成に必要な残バグ: [具体的な記述]」を投稿する。
3. 影響ファイル、Runtime / UX / dataへの影響、推奨対応（Scope拡張または別Issue）を示す。
4. Naoyaの判断を得てから、承認されたScope拡張として実装するか、別Issueへ分離する。
5. 判断結果と実装有無を実装レポートへ記録する。

この手順により、密接関連バグの存在とScope変更を透明性100%でRvフローへ組み込む。

---

## 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-07-24 | Issue #159: Agent 運用ルール（Cursor / Codex使い分け、Naoya-override、自己判断、scope密接関連バグの事前相談）を追記（改善候補2 / 6 / 8統合） |
| 2026-07-23 | Issue #145: Repo 初配置。Rv raw+grep、宣言形、受け入れアサーション、UI PR スクショ必須を追加 |
| 2026-07-24 | Issue #153: regex 精緻化、CDP による動作時 visibility 検証、Rv 観点 10 の記録要件を追加 |
| 2026-07-24 | Issue #157: font metrics 差の判定基準を追記（PR #156 で確立した柔軟 PASS 条件） |
