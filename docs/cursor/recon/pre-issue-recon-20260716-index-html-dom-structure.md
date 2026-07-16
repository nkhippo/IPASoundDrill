---
id: pj-2026-07-15-8e4c
aliases:
- pj-2026-07-15-8e4c
title: 'Pre-Issue Recon: SPA DOM Structure（UI/UX Phase 0）'
created: '2026-07-15'
---
# Pre-Issue Recon: SPA DOM Structure（UI/UX Phase 0）

| 項目 | 値 |
|------|-----|
| 実施日 | 2026-07-16 |
| Issue | #61 |
| **主ソース（行番号）** | **`src/index.template.html`** |
| 補足 | ルート `index.html` は **存在しない**（F2 以降は `src/index.template.html` → build → `/{lang}/index.html`）。生成物 `en/index.html` と構造は同等（head meta 差分のみ） |
| 目的 | UI/UX 抜本見直し Phase 0 — 画面 DOM / トップバー / Setup vs SPEC / モーダル |

参照: `docs/SPECIFICATION.md` §4.0–4.8b  
追補（データ↔UI↔GAS の中途半端棚卸し）: [`pre-issue-recon-20260716-data-ui-gas-halfbaked.md`](pre-issue-recon-20260716-data-ui-gas-halfbaked.md)

---

## セクション A: 画面別 DOM 構造

**表示制御（共通）**

- CSS `.hidden{display:none}`
- `show(id,on)` → `classList.toggle("hidden", !on)`
- セッション: `setSetupVisible(on)`（panels + `body.in-play`）
- Hash: `""` → setup/練習復帰; `"vocab"` / `"vocab/phrases"` → `#vocabPage`

### Shell（非 `<section>`）

| 要素 | 行（概算） | 役割 |
|------|-----------|------|
| `.wrap` | ~414–691 | ページ殻 |
| `.topbar` | ~415–435 | 常時 DOM |
| `#playLine` / `#playCrumb` | ~436–438 | セットアップ時 hidden、練習中表示 |
| `#audioHint` | ~439 | TTS 促し（`role="status"`） |
| `#siteFooter` | footer 内 | Feedback / Terms / Privacy / X。`body.in-play` で非表示 |
| `#reflectDock` | wrap 外付近 | 常時 hidden（配線あり・未表示） |

### `<section>` パネル

| id | 初期 | 表示制御 | 主な子 id |
|----|------|----------|-----------|
| `#setup` | visible | `setSetupVisible(true)` | mode/tab/dir/cefr/focus/reg/grp/cs、`#poolNote` `#startBtn` |
| `#cardModeBStudy` | hidden | `renderModeBStudy` | `mbS*`（IPA/play/meaning/reveal/gotIt/checks） |
| `#cardModeBMcq` | hidden | Mode B quiz（**`MODEB_QUIZ_ENABLED=false`** で通常未使用） | `mbM*` |
| `#cardModeBDict` | hidden | 同上 | `mbD*` |
| `#cardDecode` | hidden | `renderDecode` | `dCefr` `dIpa` `dPlay` `dInput` `dCheck` |
| `#cardEncode` | hidden | `renderEncode` | `eWord` `eBuild` `eKbd` `eCheck` |
| `#reveal` | hidden | `reveal()` | `rWord` `rIpa` `rTry` `nextBtn` `revealChecks` |
| `#summary` | hidden | `renderSummary` | `sumPct` `weakList` `againBtn` `weakBtn` |
| `#vocabPage` | hidden | hash `#/vocab` 等 | Back / tabs / search / letters / body |

**命名メモ:** SPEC の `#cardModeBQuiz` は無く、`#cardModeBMcq` + `#cardModeBDict` に分割。

### モーダル（`div.modal`）

| id | Open / Close |
|----|----------------|
| `#settingsModal` | `#settingsBtn` / scrim |
| `#guideModal` | `#guideBtn` / scrim / Close |
| `#exitConfirmModal` | `openExitConfirm` / scrim / No / Yes |

他に `<section>` なし。

---

## セクション B: トップバー要素

| 要素 | id | 表示 | クリック |
|------|-----|------|----------|
| Brand | `#brandBtn` (+ mark / `#brandName`) | 常時 | `goToTop` |
| Vocab | `#vocabBtn` | 常時 | `navigate("vocab")` |
| Guide | `#guideBtn` | **setup のみ** | `openGuide` |
| Settings | `#settingsBtn` | **setup のみ** | `openSettings` |
| Menu | `#backTopBtn` | **練習中のみ** | `goToTop` |
| Play crumb | `#playCrumb` | 練習中（`#playLine`） | 表示のみ `updatePlayCrumb` |
| Meter | **なし** | — | 進捗は各カード `#*No`（`setCardCefr`）。CSS `.meter` はあるが body にノード無し |

**SPEC 差分:** ブランドにサブタイトルノード無し。Exit Yes は **summary ではなく setup 復帰**（`goToTop(true)`）。

---

## セクション C: セットアップ `#setup` 子要素

| 制御 | vs SPEC §4.1 | id / 備考 |
|------|--------------|-----------|
| Learning mode | Yes | `#modeA` `#modeB` |
| Practice mode | Yes | `#tabWords` `#tabConnected`（Mode B 時隐藏） |
| Direction | Yes | `#dirField`（Words+Mode A）|
| CEFR | **Diff** | `#cefrA1/A2/B1`。SPEC: Mode B 非表示 / Band — **実装は Mode B でも CEFR 複数選択表示**。B2 ピル無し |
| Phoneme focus 7 | Yes | all/traps/weak/letters/contractions/irregular/casual |
| Spelling type | Yes | `#regAll/Regular/Irregular` |
| Pattern group | Yes | short/long/team/r（`reg=regular` 時） |
| Connected filters | Yes | Level All/L1–L3; Type All/Linking/Assimilation/Elision/Weak |
| 「詳しい設定」折りたたみ | Yes | `#wordsFilterToggle`→`#wordsFilterAdvanced`; connected 同様 |
| Mode B Band UI | **No** | DOM 無し。バンドは LS `ept_vocab_band` + JS のみ |
| Pool + Start | Yes | `#poolNote` `#startBtn` |

---

## セクション D: モーダル

| モーダル | Backdrop | Escape | Outside | `body.scroll-locked` |
|----------|----------|--------|---------|----------------------|
| exitConfirm | `#exitConfirmScrim` | **無し** | scrim | 不使用 |
| settings | `#settingsScrim` | **無し** | scrim | 不使用 |
| guide | `#guideScrim` | **無し** | scrim / Close | 不使用 |

**`scroll-locked` 実用途:** Decode / Mode B Dict の入力 focus 時のみ（`lockInputScroll`）。Vocab では未使用（SPEC どおり）。

---

## Phase 0 フラグ（要約）

1. 正本パスは **`src/index.template.html`**（ルート `index.html` なし）  
2. Mode B Quiz DOM は残存、`MODEB_QUIZ_ENABLED=false`  
3. トップバー meter 要素なし  
4. Mode B Band UI なし（CEFR 流用）  
5. モーダルに Escape 無し  
6. Footer / audioHint / reflectDock は SPEC UI 章に薄い or 未記載
