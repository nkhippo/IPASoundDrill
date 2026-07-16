---
id: pj-2026-07-15-2d16
aliases:
- pj-2026-07-15-2d16
title: 'Pre-Issue Recon: データ ↔ UI ↔ GAS の「中途半端」棚卸し'
created: '2026-07-15'
---
# Pre-Issue Recon: データ ↔ UI ↔ GAS の「中途半端」棚卸し

| 項目 | 値 |
|------|-----|
| 実施日 | 2026-07-16 |
| Issue | #61（追補） |
| 目的 | **データはある／ロジックはあるが、UI・出題経路・GAS 本番経路が未完成**な箇所を Claude（SPEC/DESIGN 突合・UI/UX Phase 1+）が追えるようにする |
| 正本 UI | `src/index.template.html` |
| ランタイム語彙 | `wordlist_GA_a1a2_plus_phonics.json`（5,397） |
| 連結／弱形 | `data/connected_speech.json`（201）/ `data/weak_forms.json`（36） |
| GAS | `gas/Code.gs` + `BatchWarm.gs` + `BatchWords.gs` |

関連: [DOM](pre-issue-recon-20260716-index-html-dom-structure.md) · [functions](pre-issue-recon-20260716-index-html-functions.md) · [i18n-css-storage](pre-issue-recon-20260716-index-html-i18n-css-storage.md)

**判定ラベル**

| ラベル | 意味 |
|--------|------|
| **Data✓ UI✗** | ランタイム JSON に値があるが、ユーザーが選べない／見えない |
| **Logic✓ UI✗** | JS 関数・定数・LS があるが、DOM／呼び出しが無いまたは常時 hidden |
| **Data◐ UI◐** | データ部分実装・UI も部分実装 |
| **GAS✓ SPA✗** | GAS API があるが本番 SPA から未使用／実験のみ |
| **Pipeline✓ Runtime✗** | `data/batches` 等に候補があるが本番 wordlist 未収録 |
| **意図的凍結** | 仕様でオフ（削除候補ではなく温存） |

---

## サマリ（優先度つき）

| Pri | 項目 | ラベル | 一言 |
|-----|------|--------|------|
| P0 | **CEFR B2 語彙は出題に乗らない** | Data✓ UI✗ | B2=899 語収録済。Setup ピルは A1/A2/B1 のみ → `S.cefrLevels` 経由で **B2 は Mode A/B とも到達不可** |
| P0 | **Mode B Band UI + 解放ロジックが死んでいる** | Logic✓ UI✗ | `MODEB_BANDS` / `bandProgress` / `refreshVocabBandUnlock` / `modeb.band.*` i18n あり。**`refreshVocabBandUnlock` は定義のみ・呼び出し 0**。Band 表示 DOM 無し |
| P1 | **Mode B Quiz（MCQ+Dict）** | 意図的凍結 + Logic✓ UI✗ | `MODEB_QUIZ_ENABLED=false`。DOM `#cardModeBMcq|Dict` と `buildModeBQueue` 温存 |
| P1 | **Respelling 未表示** | Data✓ UI✗ | `respell_ga`/`rp` **5,322/5,397**。normalize で読込。Reveal に未描画。i18n `reveal.respell_label` orphan |
| P1 | **Connected の `cefr` 未フィルタ** | Data✓ UI✗ | 句に A1–B2 CEFR 付与済。Setup は **L1–L3 + cs_type のみ**（CEFR ピル非適用） |
| P2 | **RP neighbors / RP narrow IPA 空** | Data◐ UI◐ | `neighbors_rp=0`、`ipa_actual_rp=0`。コードは RP 分岐あり。UI は GA neighbors / GA flap のみ実効 |
| P2 | **Connected TTS は GA 固定** | GAS✓ SPA◐ | GAS は `accent` 受けるが SPA は `phrase=…&accent=ga` 固定。RP 連結 TTS 未 |
| P2 | **cs_rule が ko / zh-* 欠落** | Data◐ UI◐ | データは en/ja/fil のみ。`csRuleText` は `LANG` 直参照 → ko/zh は **en フォールバック** |
| P2 | **C1 はパイプライン候補のみ** | Pipeline✓ Runtime✗ | `lvl.c1` i18n あり。ランタイム CEFR に C1 無し。`data/batches/gap_c1_new.json` 1,015 語 |
| P3 | Reflect dock / hints / `#cefrNote` / vocab filters | Logic✓ UI✗ | DOM 殻のみ、または常時 hidden / 未書込 |
| P3 | GAS `instr_variant` / `voice` / `speed` | GAS✓ SPA✗ | 本番 SPA 不使用。`tests/tts-ab-listener.html` のみ |
| P3 | BatchWarm が **GA 固定** | GAS◐ | `BatchWarm.gs` チャンク暖機は `'ga'`。RP Drive 在庫は別経路依存 |

---

## 1. CEFR / Mode B（最大の「データはあるが出ない」）

### 1.1 ランタイム分布（実測）

| CEFR | 語数 | Mode B eligible（gloss+band・letter/contraction 除外） |
|------|-----:|--------------------------------------------------------:|
| A1 | 1,187 | 1,113 |
| A2 | 1,195 | 1,195 |
| B1 | 2,116 | 2,116 |
| **B2** | **899** | **899** |
| C1 | 0 | — |

Vocab ブラウザは **全語 + B2 バッジ CSS あり**（閲覧はできる）。出題プールは別。

### 1.2 Setup CEFR ピル vs フィルタ

| 層 | 状態 |
|----|------|
| DOM `#cefrA1` `#cefrA2` `#cefrB1` | **B2 ボタン無し** |
| i18n `lvl.b2` / `lvl.c1` | キーあり・ピル未配線 |
| 初期 `S.cefrLevels` | `{"A1","A2"}`（B1 はピル OFF） |
| `filteredWordPoolWith` / `modeBPool` | `cefrLevels.has(w.cefr)` 必須 |
| `#cefrNote` | **DOM のみ・JS 書込ゼロ** |

**帰結:** ユーザー操作では B2（および未選択のままの B1）を練習に入れられない。DevTools で `S.cefrLevels.add("B2")` すればデータは生きる。

### 1.3 Mode B「バンド進行」はデータ＋ロジックだけ

| 部品 | 状態 |
|------|------|
| `MODEB_BANDS = A1…B2` | ✓ |
| `MODEB_BAND_UNLOCK_RATIO = 0.6` | ✓ |
| `ept_vocab_v1` / `recordModeBStudy` | Study 時は書込あり |
| `ept_vocab_band` / get/setVocabBand | ✓ |
| `refreshVocabBandUnlock()` | **呼び出し箇所 0**（死コード） |
| `modeb.band.label|note` / `modeb.pool` | i18n orphan |
| Band 選択・進捗 UI | **DOM 無し**（CEFR マルチピル流用） |

Quiz OFF 時のキューは `modeBPool()`（=`S.cefrLevels`）のみ。Band LS は実質未使用。

### 1.4 Mode B Quiz（意図的凍結）

- フラグ: `MODEB_QUIZ_ENABLED=false`
- 温存: Mcq/Dict DOM、`buildModeBQueue`、neighbors distractor（Quiz 経路）
- Study-only でも `mbKind:"study"` 付与・SRS `ept_vocab_v1` は動くが、mastery→Band 解放は上記どおり未接続

### 1.5 パイプライン残（ランタイム外）

| ファイル | 件数 | 備考 |
|----------|-----:|------|
| `data/batches/gap_b2_new.json` | 1,992 候補 | うち **ランタイム未収録 ~1,382**（現行 B2=899 は Phase 2 取り込み済み分） |
| `data/batches/gap_c1_new.json` | 1,015 | **ほぼ未収録**（~910 missing）。UI 以前にデータ未マージ |
| `docs/reference/c1-expansion-scope-design.md` | — | C1 設計ドラフト |

→ 「B2 をピルに出す」と「gap_b2 残りを取り込む」は別タスク。UI/UX でまず刺さるのは **既存 899 の到達性**。

---

## 2. フィールド単位: Data✓ だが UI 未使用／薄い

| フィールド | カバレッジ | UI / 経路 |
|------------|------------|-----------|
| `cefr` (words) | 全語 A1–B2 | Setup フィルタに **B2 無し**；カード／Vocab バッジは表示 |
| `cefr` (connected) | 201（A1 63 / A2 106 / B1 19 / B2 13） | **フィルタ未使用**（level 1–3 + type のみ） |
| `cefr` (weak) | 36（A2/B1） | 同上 |
| `respell_ga` / `respell_rp` | 5,322 | **画面ゼロ**（読込のみ） |
| `neighbors` | 5,113 | Mode B **Quiz** distractor のみ（Quiz OFF なら実質休止） |
| `neighbors_rp` | **0** | `activeNeighbors` が RP 時参照するがデータ空 → GA にフォールバック |
| `ipa_actual_ga` | 529（全て phonemic と差あり） | Reveal narrow 差表示に使用 |
| `ipa_actual_rp` | **0** | RP narrow 差は事実上無し |
| `ga_rp_same` | 全語 | Alt IPA 行に使用（完成寄り） |
| `gloss` (en/ja/zh/ko/fil) | 全語 | 表示 ✓。**zh-Hans/zh-Hant キーは 0** → `gloss.zh` フォールバック（簡繁同一ソース） |
| `def` | 全語 | EN で gloss=見出し語のとき Vocab/Mode B フォールバック |
| `cs_rule` | en/ja/**fil** のみ | ko / zh-* → **en** |
| `carriers` | CS/Weak あり | プロンプト埋込 ✓（SPEC の単数 `carrier` 表記は旧） |
| `ipa_strong` / `rp_ipa_strong` | Weak ✓ | Reveal メタ ✓ |

---

## 3. UI 殻・死コード（データ非依存）

| 要素 / 記号 | 状態 |
|-------------|------|
| `#reflectDock` | 常時 `hidden`。配線・`reflect.btn` あり。`showReflection`→summary |
| `.hints` / `hint.*` i18n | CSS `display:none` + orphan |
| `#vocabFilters` | `display:none` + `aria-hidden`・中身空 |
| `.meter` CSS | トップバーにノード無し |
| Setup `lead_*` / `modeb.lead_html` | orphan |
| `set.*`（daily/phonics） | orphan（旧 Question set） |
| Escape キー | モーダル未対応（既存 DOM recon） |

---

## 4. GAS ↔ SPA

| GAS 能力 | SPA 本番 | 備考 |
|----------|----------|------|
| `?word=&accent=ga\|rp` | ✓ | 単語 TTS |
| `?weak=&ww=&accent=` | ✓ | 弱形 |
| `?phrase=&phrase_ipa=&accent=` | ◐ | **accent=ga 固定**で呼ぶ |
| `?warm=1&words=` | ✓（prefetch） | `schedulePoolPreread` |
| `?urls=1&words=` | ✓（prefetch URL 経路） | |
| `voice` / `speed` / `instr_variant` | ✗ | A/B は `tests/tts-ab-listener.html` |
| `BatchWarm.gs` 時間トリガ | サーバー側 | **暖機ループは GA 固定**（`'ga'`） |
| `BatchWords.gs` 5,397 | ✓ 語彙同期 | RP バッチ在庫は別途要確認 |

実験系パラメータは本番汚染しない設計（キャッシュ suffix）。UI/UX 本線の穴は **連結 RP TTS** と **B2 到達**の方が大きい。

---

## 5. i18n の「用意だけ」追加メモ

既存 orphan 22 に加え、棚卸し観点から:

| キー群 | データ/ロジックとの関係 |
|--------|------------------------|
| `lvl.b2` / `lvl.c1` | B2 はデータあり UI 無し；C1 はデータ無し |
| `modeb.band.*` / `modeb.pool` | Band 解放ロジック死＋UI 無し |
| `reveal.respell_label` | respell データあり・未表示 |
| `audio_tap_hint` | **missing**（英語フォールバック固定） |
| `meter_done` / `summary.again` | 旧 UI 残骸 |

`cs_rule` の ko/zh 欠落は i18n JSON ではなく **コンテンツ JSON** のギャップ。

---

## 6. Claude 向けチェックリスト（段階 2）

実装せず文書／Issue 化するだけでも可。優先候補:

1. **B2 を Setup CEFR に出すか**（既存 899）。出さないなら「Vocab 閲覧専用」と SPEC に明記  
2. **Mode B: CEFR マルチ選択を正とするか / Band UI を復活するか**。後者なら `refreshVocabBandUnlock` の呼び出し配線が必須  
3. **Quiz フラグ**を永遠に false にするなら DOM/コード削除 vs 温存方針  
4. **Respell**を Reveal/Vocab に出すか、フィールドを内部専用と明記するか  
5. **Connected `cefr`**をフィルタに載せるか、level のみと文書固定か  
6. **RP**: `neighbors_rp` / `ipa_actual_rp` / 連結 TTS RP のトラック（deferred 文書あり）  
7. **C1 / gap_b2 残り**は UI タスクではなくデータ Wave（パイプライン）  
8. **cs_rule** ko/zh 追加 or フォールバック UX（「英語の説明です」）  
9. Reflect dock / hints / cefrNote / vocabFilters の削除または復活  

---

## 検証メモ（本 Recon）

```text
wordlist n=5397 cefr A1:1187 A2:1195 B1:2116 B2:899
cefr pills in template: A1 A2 B1 only
refreshVocabBandUnlock callers: 0
respell_* loaded; no template string "respell_ga" in render paths
connected cefr present; filteredCsPool uses level + cs_type only
fetchAudioFromGas connected branch: accent=ga hard-coded
```

アプリコード・ランタイム JSON は本追補でも **未変更**（docs only）。
