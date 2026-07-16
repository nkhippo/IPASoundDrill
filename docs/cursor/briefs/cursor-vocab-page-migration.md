---
id: pj-2026-07-10-59d5
aliases:
- pj-2026-07-10-59d5
title: 語彙ブラウザ — モーダルから別ページへの移行案
created: '2026-07-10'
---

# 語彙ブラウザ — モーダルから別ページへの移行案

> 作成日: 2026-07-10  
> 種別: 設計相談（Claude レビュー用）  
> 対象: `index.html`（単一 HTML SPA）、`i18n/*.json`、`docs/SPECIFICATION.md`  
> 背景: 語彙リスト（単語帳）を、現行のオーバーレイモーダルではなく **別画面・別タブ遷移** として管理したい

---

## 0. 要望の整理

| 項目 | 現状 | 目標 |
|------|------|------|
| UI 形態 | `#vocabModal`（720px モーダル、背景スクラム） | **フルページ（または独立セクション）** |
| 遷移 | topbar `#vocabBtn` → モーダル表示（URL 変化なし） | **別ページとして遷移**（ブラウザ履歴・戻る操作と整合） |
| プレイ中 | セッションを維持したままモーダルで参照可能 | **要判断**（後述） |
| データ | `PRESET`（4,828語）+ `CONNECTED`（201句）を起動時 preload | 変更なし（追加 fetch 不要） |

添付 UI（Words タブ / 検索 / A–Z ジャンプ / 各行 GA+RP IPA / 意味 / 品詞 / TTS / progress checks）は **機能要件として維持** する前提。

---

## 1. 現状アーキテクチャ（移行の出発点）

### 1.1 技術スタック

- **React Router 等は未使用**。Vanilla JS の単一 `index.html` SPA
- 画面切替は `show(id, on)` による `.hidden` クラスのトグル
- 「ページ」相当: `#setup`, `#cardDecode`, `#reveal`, `#summary` 等の `<section class="panel">`
- 「オーバーレイ」相当: `#settingsModal`, `#guideModal`, `#vocabModal`

### 1.2 語彙モーダルの主要コード

| 要素 | 場所・役割 |
|------|-----------|
| `#vocabBtn` | topbar。プレイ中も **常時表示** |
| `#vocabModal` | モーダル本体（Words / Phrases タブ、検索、A–Z、リスト） |
| `openVocab()` / `closeVocab()` | 開閉 + `body.scroll-locked` |
| `renderVocabWords()` / `renderVocabPhrases()` | `innerHTML` 一括描画（~4,828 DOM ノード） |
| `vocabTabCurrent`, `vocabBuilt` | メモリのみ（永続化なし） |
| `ept_checks_v1` | 行内 progress checks（localStorage 永続） |

### 1.3 他機能との関係

| 機能 | 語彙モーダルとの関係 |
|------|---------------------|
| Mode A/B 練習セッション | モーダルは **離脱確認なし** で開ける（セッション状態 `S` は維持） |
| Mode B「Sound → Vocabulary」 | **別機能**。SRS（`ept_vocab_v1`）付き学習ループ。語彙ブラウザとは UI が異なる |
| 設定 / ガイド | 語彙を開くと相互排他で閉じる |
| TTS | Words: `speak(word)` / Phrases: `speak(ipa, { connected: true })`（GA 固定） |

---

## 2. 推奨アプローチ（Cursor 案）

### 2.1 方針: **Hash ルーティング + 独立セクション**（段階的移行）

フル SPA 化やビルド導入はスコープ外。**既存の `show()` パターンを拡張** し、最小 diff で別ページ感を出す。

```
# ルート例
/                    → セットアップ（現行 #setup）
/#/vocab             → 語彙 Words タブ
/#/vocab/phrases     → 語彙 Phrases タブ
/#/play/...          → （将来）プレイ画面も hash 化可能だが **今回は対象外**
```

| 設計項目 | 判断 |
|----------|------|
| ルーティング | **`hashchange` イベント** + 小さな `Router` 関数（~50行） |
| DOM | `#vocabModal` を **`#vocabPage` セクション** に置換（モーダル CSS 削除） |
| topbar | `#vocabBtn` は **リンク風ボタン** のまま → `location.hash = "#/vocab"` |
| 戻る | ブラウザ Back / topbar ブランド or 新設 `#vocabBackBtn` → `history.back()` or `#/` |
| レンダリング | 既存 `renderVocab*` を **そのまま流用**（ID プレフィックス変更のみ） |
| プレイ中 | **Phase 1 は現行同等**（プレイ中も語彙ページへ遷移可）。Phase 2 で離脱確認を検討 |

**この案を推す理由**

1. GitHub Pages 静的ホスティングと相性が良い（サーバー設定不要）
2. 既存の単一 HTML 構成を維持
3. 語彙だけを切り出せる（練習フロー全体のルーティング化は不要）
4. URL 共有可能（`…/#/vocab` をブックマーク・共有）
5. 将来 CEFR フィルタ等を `#/vocab?cefr=A1` に拡張しやすい

### 2.2 代替案の比較

| 案 | 概要 | メリット | デメリット |
|----|------|----------|------------|
| **A. Hash ルート（推奨）** | `#/vocab` で独立セクション表示 | 低コスト、履歴対応、共有可能 | URL が `#` 付き |
| B. History API (`/vocab`) | `pushState` + GitHub Pages 404 リダイレクト | きれいな URL | `404.html` 設定・全体設計が必要 |
| C. セクションのみ（hash なし） | `#vocabPage` を `setSetupVisible` 的に切替 | 最も単純 | ブラウザ Back 非対応、別タブ不可 |
| D. 別 HTML (`vocab.html`) | 語彙専用ファイル | 完全分離 | データ preload・i18n・TTS・checks ロジックの **二重管理** |
| E. フレームワーク移行 | React + Router | 長期的に拡張しやすい | 大規模リライト、現リポジトリ方針と不一致 |

---

## 3. 詳細設計

### 3.1 DOM 変更

**削除:** `#vocabModal`, `#vocabScrim`, `#vocabCloseBtn`, `.modal` 系 vocab スタイル

**追加:** `#vocabPage`（`<section class="panel vocab-page hidden">`）

```html
<section class="panel vocab-page hidden" id="vocabPage" aria-labelledby="vocabTitle">
  <div class="vocab-page-inner panel">
    <div class="vocab-head">
      <button class="guide-close" id="vocabBackBtn" type="button">← Back</button>
      <h2 class="modal-title" id="vocabTitle">Vocabulary</h2>
    </div>
    <!-- 以下、現行 #vocabModal 内と同一: tabbar, search, letters, body -->
  </div>
</section>
```

レイアウト方針:

- モバイル: 全幅、`100vh - topbar` でスクロール
- デスクトップ: `max-width: 720px` 中央寄せ（現行モーダル幅を踏襲）
- `body.scroll-locked` は **不要**（ページ自体がスクロールコンテナ）

### 3.2 ルーター（新規・最小実装）

```javascript
const ROUTES = {
  "":           { view: "setup",   onEnter: () => setSetupVisible(true) },
  "vocab":      { view: "vocab",   onEnter: () => showVocabPage("words") },
  "vocab/phrases": { view: "vocab", onEnter: () => showVocabPage("phrases") },
};

function parseHash() {
  return (location.hash.replace(/^#\/?/, "") || "").split("?")[0];
}

function navigate(hash) {
  location.hash = hash ? "#/" + hash : "#/";
}

function onRouteChange() {
  const path = parseHash();
  const route = ROUTES[path] ?? ROUTES[""];
  hideAllViews();
  route.onEnter();
}

window.addEventListener("hashchange", onRouteChange);
// initApp 完了後に onRouteChange() を一度呼ぶ
```

`hideAllViews()`: setup / play cards / summary / vocabPage をまとめて非表示にし、該当 view のみ表示。

### 3.3 既存関数の置換マップ

| 現行 | 移行後 |
|------|--------|
| `openVocab()` | `navigate("vocab")` → `showVocabPage()` |
| `closeVocab()` | `navigate("")` or `history.back()` |
| `show("vocabModal", true)` | `show("vocabPage", true)` + 他 view を hide |
| Escape → `closeVocab()` | hash が vocab 系なら `navigate("")` |
| `applyI18nVocab()` 内の modal 判定 | `vocabPage` の visibility 判定に変更 |

**プレイ中の語彙遷移（Phase 1）**

```javascript
function showVocabPage(tab) {
  // 練習カードは hidden のまま維持 → 戻ると再開可能（現行モーダルと同じ）
  show("vocabPage", true);
  if (!vocabBuilt) { /* 初回 build */ }
  renderVocabTab(tab || vocabTabCurrent);
  applyI18nVocab();
}
```

### 3.4 タブと URL の同期

Words / Phrases タブ切替時:

```javascript
function renderVocabTab(tab) {
  vocabTabCurrent = tab;
  // …既存描画…
  const expected = tab === "phrases" ? "vocab/phrases" : "vocab";
  if (parseHash() !== expected) navigate(expected);
}
```

初期表示時は hash からタブを復元（`vocab/phrases` → Phrases）。

### 3.5 CSS 変更概要

| 変更 | 内容 |
|------|------|
| 削除 | `.modal`, `.vocab-card` の max-height / scrim 関連 |
| 追加 | `.vocab-page` — `min-height: calc(100vh - var(--topbar-h))` |
| 追加 | `.vocab-page-inner` — 現行 `.vocab-card` の flex カラムレイアウトを継承 |
| 維持 | `.vocab-row`, `.vocab-letters`, progress checks 等 |

### 3.6 i18n 追加キー（案）

| キー | en | 用途 |
|------|-----|------|
| `vocab.back` | Back | 戻るボタン（`guide.close` の流用も可） |

6 言語すべてに追加 → `python3 tools/validate_i18n.py` 必須。

### 3.7 SPECIFICATION.md 更新

§4.8b を「語彙ブラウザ（`#vocabPage`）」に改訂:

- モーダル → 独立ページ
- hash ルート `#/vocab`, `#/vocab/phrases`
- プレイ中の挙動
- 状態永続化方針（Phase 1: なし / Phase 2: sessionStorage 検討）

---

## 4. Claude に相談したい懸念点

### 4.1 プレイ中の離脱 UX（最重要）

**現状:** 語彙モーダルはセッション中でも開け、閉じればそのまま練習再開。Menu（`#backTopBtn`）とは別系統。

**別ページ化後の選択肢:**

| 选项 | 挙動 | 懸念 |
|------|------|------|
| A. 現行維持 | プレイ中も `#/vocab` へ。Back で `#/` に戻ると **セットアップ** に落ちる可能性 | hash 戻り先の設計ミスでセッション喪失 |
| B. プレイ中は語彙不可 | プレイ中 `#vocabBtn` 非表示 or 離脱確認 | 現行ユーザー体験の後退 |
| C. プレイ中 Back は「練習画面復帰」 | `history` or `sessionStorage` に `returnRoute` 保存 | 実装複雑だが UX 最良 |

**相談:** 語彙参照は「練習の補助」としてプレイ中も必要か？ Back の期待動作は？

### 4.2 「別タブ」の意味

ユーザー要望の「別タブ」が指すもの:

1. **ブラウザの新しいタブ**（`target="_blank"` で `#/vocab` を開く）
2. **アプリ内 Words / Phrases タブ**（現行のまま）
3. **メイン nav の独立項目**（Home | Vocab | …）

→ 1 の場合、各タブで `PRESET` を再 fetch（~数 MB）するが許容範囲。progress checks は localStorage で共有される。

**相談:** 想定している「別タブ」はどれか？ 1 を許すなら topbar ボタンを `<a href="#/vocab" target="_blank">` にするか。

### 4.3 パフォーマンス（4,828 語一括 DOM）

現行モーダルも全件 `innerHTML` 一括。別ページ化自体は性能にほぼ影響なし。

| 施策 | タイミング | 効果 |
|------|-----------|------|
| 現状維持（一括描画） | Phase 1 | 初回 ~100–300ms（端末依存） |
| 仮想スクロール | Phase 2+ | DOM 数削減、実装コスト大（Vanilla） |
| ページネーション（50語/頁） | Phase 2 | A–Z ジャンプとの整合要設計 |
| Web Worker で HTML 生成 | Phase 2 | メインスレッドブロック緩和 |

**相談:** 4,828 件の一括描画を Phase 1 でも許容するか。CEFR フィルタ追加時に再描画コストが増える。

### 4.4 状態永続化

現行: タブ・検索語・スクロール位置は **閉じると消失**。

別ページ化で検討:

| 状態 | 保存先 | 優先度 |
|------|--------|--------|
| Words / Phrases タブ | URL hash | 高（ルーターで自然に解決） |
| 検索クエリ | `sessionStorage` or URL `?q=` | 中 |
| スクロール位置 | `sessionStorage` | 低 |
| A–Z 選択 | 不要（スクロールで十分） | — |

**相談:** 検索語を URL クエリ（`#/vocab?q=ab`）に載せるか。共有 URL として有用だが履歴が増える。

### 4.5 Mode B「Vocabulary」との名称・導線の混同

| 用語（現行） | 実体 |
|-------------|------|
| topbar「Vocabulary」 | 語彙 **ブラウザ**（全語彙参照） |
| Mode B ラベル | 音→語彙の **学習モード**（SRS） |

別ページ化後、ナビを強化すると混同リスク増。

**相談:** UI ラベル変更（例: Browser / Word list / 語彙リスト）や Mode B 側の rename を同時に行うか。

### 4.6 progress checks のページ跨ぎ

checks は `ept_checks_v1` に保存。語彙ページと練習 reveal 画面の両方で更新可能。

**懸念:** 語彙ページで check を付けた後、練習に戻ったとき DOM 上の checks は **再描画まで古い** 可能性（現行モーダルも同様）。

**相談:** 許容か、それとも `storage` イベントで同期するか。

### 4.7 アクセシビリティ

| 項目 | モーダル（現行） | ページ（移行後） |
|------|-----------------|-----------------|
| フォーカス trap | 暗黙（scrim） | 不要 |
| `role="dialog"` | あり | → 通常 `main` / `region` |
| スクリーンリーダー | 「ダイアログ」として認識 | 「ページ」として認識 |
| Skip link | なし | 将来検討 |

**相談:** 独立ページ化に伴い `aria` 構造を見直すタイミングか。

### 4.8 モバイル UX

現行: `max-width: 599px` で検索欄非表示。

別ページ化後:

- 検索は **常時表示** に変更する選択肢あり（フルページなら縦スペースに余裕）
- topbar + 戻る + タブ + 検索 + A–Z で **縦圧迫** → sticky ヘッダ設計要検討

**相談:** モバイルで検索を復活させるか、現行どおり非表示か。

### 4.9 将来機能との整合

`cursor-vocab-browser.md` 申し送りにあった将来拡張:

- CEFR フィルタ（A1/A2/B1…）
- 品詞フィルタ
- お気に入り

別ページ + hash/ query ルーティングはこれらの **UI 置き場** として適している。

**相談:** Phase 1 でフィルタ UI の **プレースホルダ DOM** まで入れるか、ページ化のみに scope を限定するか。

---

## 5. 実装フェーズ案

### Phase 1 — ページ化（MVP）

- [ ] `#vocabModal` → `#vocabPage` 置換
- [ ] hash ルーター（`#/vocab`, `#/vocab/phrases`）
- [ ] topbar ボタン → hash 遷移
- [ ] Back ボタン（`#/`` へ）
- [ ] 既存 render / event / i18n 流用
- [ ] SPECIFICATION §4.8b 更新
- [ ] `validate_i18n.py` ERROR 0

**DoD:** 現行モーダルの DoD をすべて満たす + URL 直接アクセス + ブラウザ Back

### Phase 2 — UX 強化（要 Claude 合意後）

- [ ] プレイ中 Back → 練習画面復帰（`returnRoute`）
- [ ] 検索語の URL / sessionStorage 永続化
- [ ] モバイル検索表示の見直し
- [ ] 新規タブで開く（`target="_blank"`）オプション

### Phase 3 — スケール / 機能

- [ ] CEFR / POS フィルタ
- [ ] 仮想スクロール or ページネーション
- [ ] 語彙詳細ページ（`#/vocab/word/{slug}`）— 単語行タップで展開

---

## 6. 変更ファイル見込み（Phase 1）

| ファイル | 操作 |
|----------|------|
| `index.html` | DOM 置換、Router 追加、CSS 調整、`openVocab`/`closeVocab` 置換 |
| `i18n/*.json`（6言語） | `vocab.back` 等（必要なら） |
| `docs/SPECIFICATION.md` | §4.8b 改訂 |
| `docs/cursor/reports/cursor-implementation-report-vocab-page.md` | 実装後レポート（別途） |

**触らない:** `wordlist_*.json`, `data/connected_speech.json`, GAS TTS

---

## 7. 検証計画

```bash
python3 tools/validate_i18n.py   # ERROR 0
python3 -m http.server 8080      # ローカル確認（file:// 不可）
```

| シナリオ | 期待結果 |
|----------|----------|
| `#/vocab` 直アクセス | Words タブ表示、4,828 語 |
| `#/vocab/phrases` 直アクセス | Phrases タブ表示 |
| topbar ボタン | `#/vocab` へ遷移 |
| Back / ブラウザ Back | セットアップ（または Phase 2: 練習復帰） |
| プレイ中に語彙 → Back | セッション維持（Phase 1 要件） |
| 検索・A–Z・TTS・checks | 現行と同等 |
| 言語切替 | リスト再描画 |
| モバイル 375px | レイアウト崩れなし |

---

## 8. Claude への質問リスト（チェック用）

1. **Hash ルート（案 A）** で進めて問題ないか？ History API / 別 HTML の方が良い理由はあるか。
2. **プレイ中の語彙参照** — 現行維持 vs 離脱確認 vs 練習復帰 Back、どれを推奨するか。
3. 「**別タブ**」の解釈 — ブラウザ新規タブ / アプリ内タブ / メインナビ、優先すべきはどれか。
4. **4,828 語一括 DOM** — Phase 1 許容か、フィルタ追加前に仮想化必須か。
5. **検索語を URL に載せる** べきか（共有・ブックマーク vs プライバシー・履歴）。
6. **Mode B Vocabulary** との名称混同 — 同時 rename すべきか。
7. Phase 1 の **scope** — ページ化のみでよいか、フィルタ UI の下地まで含めるか。

---

## 9. 参考

| ドキュメント | 内容 |
|-------------|------|
| `docs/cursor/briefs/cursor-vocab-browser.md` | 現行モーダル実装指示書 |
| `docs/cursor/reports/cursor-implementation-report-vocab-browser.md` | モーダル実装レポート |
| `docs/SPECIFICATION.md` §4.8b | 現行仕様 |
| `docs/cursor/briefs/cursor-ga-rp-same-flag-consultation.md` | 相談ブリーフのフォーマット参考 |
