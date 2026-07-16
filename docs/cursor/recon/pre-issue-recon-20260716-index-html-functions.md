---
id: pj-2026-07-15-1b2a
aliases:
- pj-2026-07-15-1b2a
title: 'Pre-Issue Recon: SPA 関数・状態・適応出題（UI/UX Phase 0）'
created: '2026-07-15'
---

# Pre-Issue Recon: SPA 関数・状態・適応出題（UI/UX Phase 0）

| 項目 | 値 |
|------|-----|
| 実施日 | 2026-07-16 |
| Issue | #61 |
| 主ソース | `src/index.template.html`（ルート `index.html` 無し） |
| 参照 | `docs/SPECIFICATION.md` §5.4、`docs/DESIGN.md` §1.4 |

行番号はテンプレート。ビルド生成 `en/index.html` と関数本体は同一。

---

## セクション A: 主要な UI 関数

### 指定関数

| 関数 | 行（概算） | 引数 | 役割 / 主な callers |
|------|-----------|------|---------------------|
| `navigate(path)` | ~1536 | path | hash `#/{path}`。vocabBtn / Back / tabs |
| `renderCard()` | ~2999 | — | 次カード or summary。`startSession` / `nextCard` / `setAccent` |
| `buildSessionQueue(pool,count)` | ~2828 | pool, count | Mode A Words 適応キュー |
| `buildModeBQueue()` | ~2136 | — | study+quiz 各 10。**`MODEB_QUIZ_ENABLED` 時のみ** `buildSessionPool` から |
| `filteredPool()` | ~1925 | — | Words フィルタ |
| `filteredCsPool()` | ~1966 | — | Connected(+Weak) フィルタ |
| `activeIpa(c)` | ~1203 | card | アクセント別 phonemic IPA |
| `activeNarrowIpa(c)` | ~1211 | card | `ipa_actual_*` 優先 |
| `altAccentLabel()` | ~1222 | — | 他アクセント表記 |
| `altAccentValue(c)` | ~1231 | card | `{value,isSame,hasAlt}` / `ga_rp_same` |
| `formatSameAccentIpa(ipa)` | ~1225 | ipa | 同一アクセント注記 |
| `modeBDisplayGloss(c)` | ~2101 | card | Mode B 意味表示 |
| `vocabDisplayGloss(c)` | ~962 | card | Vocab 行 gloss |
| `prefetchItemsAudio(items)` | ~2627 | items | TTS 先行取得 |
| `weightedShuffle(arr,weightFn)` | ~1881 | arr, fn | 出題重みシャッフル |
| `openExitConfirm(onYes)` | ~2931 | callback | 退出確認 |
| `closeExitConfirm()` | ~2927 | — | 確認閉じ |

### その他主要関数（抜粋）

| 領域 | 例 |
|------|-----|
| ルート | `parseHash`, `onRouteChange`, `showSetupOrPractice`, `showVocabView` |
| Setup | `setSetupVisible`, `goToTop`, `updateSetupFields`, `updatePool`, `bindPills`, `startSession`, `initSessionQueue`, `buildSessionPool` |
| Vocab | `renderVocabWords`, `renderVocabPhrases`, `buildVocabLetterBar`, `toggleCheckSlot` |
| Mode B | `renderModeBStudy`, `renderModeBMcq`, `renderModeBDict`, `modeBPool` |
| Decode/Encode | `renderDecode`, `decodeCheck`, `renderEncode`, `encodeCheck`, `buildKeyboard`, `reveal`, `nextCard`, `renderSummary` |
| TTS | `speak`, `unlockAudioFromGesture`, `schedulePoolPreread` |
| Guide/Settings | `openGuide`, `setLang`, `setAccent`, `applyI18n` |

---

## セクション B: イベントハンドラ

| 領域 | 行 / 対象 | ハンドラ |
|------|-----------|----------|
| Hash | `window` hashchange | `onRouteChange` |
| Topbar | brand / backTop | `goToTop` |
| | settings / guide / vocab | `openSettings` / `openGuide` / `navigate("vocab")` |
| Setup | dir/focus/grp/reg/tab/mode/cs ピル | `bindPills` → `S[key]` + `updatePool` |
| | CEFR pills | `S.cefrLevels` toggle |
| | filter toggles | 折りたたみ open/close |
| | start / weak / again / reflect | `startSession` / `goToTop` / `showReflection` |
| Decode | Check / Input Enter / Play | `decodeCheck` / `speak` |
| Encode | keys / Clear / Check / Play | build + `encodeCheck` / `speak` |
| Reveal | next / Play / checks | `nextCard` / `speak` / `toggleCheckSlot` |
| Mode B | Reveal meaning / Got it / Play / Dict Check | UI + `nextCard` / `modeBDictCheck` |
| | `.mcqopt`（動的） | `modeBMcqPick` |
| Vocab | tabs / search / letters / body play & checks | `navigate` / render / scroll / `speak` / `toggleCheckSlot` |
| Modals | exit Yes/No/scrim; lang/accent; guide lang | `closeExitConfirm`+callback / `setLang`/`setAccent` / `renderGuide` |

---

## セクション C: 状態オブジェクト `S`

### SPEC §5.4 照合

列挙プロパティは **実装にすべて存在**。ただし **`cefrLevels` は実装あり・SPEC §5.4 本文に未記載**。

### `S.*` 全キー（初期化）

`appMode`, `tab`, `csFilter`, `csLevel`, `dir`, `focus`, `reg`, `grp`, **`cefrLevels`**, `sessionPool`, `sessionNext`, `poolTotal`, `queue`, `idx`, `answered`, `correct`, `weak`, `missed`, `cur`, `curCarrier`, `revealed`, `built`, `mbPhase`, `mbQuiz`

キュー要素付与: `mbKind`（`"study"` / `"quiz"`）— `S` のキーではない。

### モジュールレベル変数（主要）

| 変数 | 用途 |
|------|------|
| `PRESET`, `WORD_BY_W`, `wordlistReady` | 単語データ |
| `CONNECTED`, `WEAK`, `*Ready` | 連結・弱形 |
| `GUIDE`, `guideReady`, `guideLang` | ガイド |
| `vocabTabCurrent`, `vocabBuilt`, `vocabSearchTimer`, `vocabReturnViews` | Vocab UI |
| `LANG`, `ACCENT`, `UI`, `PH` | i18n / アクセント |
| `memAudioCache`, `audioReady`, `prefetchToken`, `currentAudio`, `speakBusy` | TTS |
| `exitConfirmOnYes`, `inputScrollY` | モーダル / 入力スクロール |

### 主要定数

| 定数 | 値 |
|------|-----|
| `SESSION_INITIAL` | `6` |
| `SESSION_REFILL` | `5` |
| `MODEB_QUIZ_ENABLED` | **`false`** |
| `LS_HIST_KEY` / `LS_SYM_KEY` / `LS_CHECKS_KEY` | `ept_hist_v1` / `ept_sym_v1` / `ept_checks_v1` |
| `CHECK_MAX` | `3` |
| `LS_VOCAB_KEY` / `LS_VOCAB_BAND_KEY` | vocab SRS |
| `MODEB_BANDS` | A1–B2 |
| `MODEB_SESSION` | `{newCount:10, reviewCount:10}` |
| `MODEB_BAND_UNLOCK_RATIO` | `0.6` |
| `GAS_TTS_URL`, `LS_TTS_PREFIX` | TTS（`ipa_tts_v2:`） |
| `PREFETCH` | `{warmChunk:6, warmParallel:2, bodyParallel:3}` |
| `TRAPSET` | θ ð æ ʒ ɝ |
| `SUPPORTED_LANGS` | 6 言語 |

---

## セクション D: 適応出題ロジック（DESIGN §1.4）

### `buildSessionQueue` vs 40/40/20

hist キー数 ≥ 3 のとき:

| バケット | 既定 | `focus==="weak"` |
|----------|------|------------------|
| Due | **40%** | 25% |
| Sym（weak symbols） | **40%** | 55% |
| New | **余り ≈20%** | 余り |
| Rest | 不足補充 | 同 |

最終段: `weightedShuffle(..., frequencyWeight)`。

**Cold start**（hist &lt; 3）: A1 を音節ソート → shuffle → slice。**40/40/20・checks 未使用**。

### `frequencyWeight` / `ept_checks_v1`

`weight = max(1, (CHECK_MAX+1) - getCheckCount)` → 未チェックほど出やすい（0→4, 3→1）。  
mode: Mode B→`"l"`, Encode→`"e"`, else `"d"`。

Connected / Mode B Study（quiz off）も checks 重み shuffle。Mode B quiz キュー構築は vocab SRS 側（checks 非使用）。

---

## 補足

- 編集正本は常に `src/index.template.html`
- SPEC に `cefrLevels` 追記推奨
- Quiz 経路はデッドに近い（フラグ false + Study-only pool）
- **`refreshVocabBandUnlock()` は定義のみ・呼び出し 0**（Band 解放が死コード）。詳細は [[pj-2026-07-15-2d16|`data-ui-gas-halfbaked`]]
