---
id: pj-2026-07-15-f281
aliases:
- pj-2026-07-15-f281
title: 'Pre-Issue Recon: i18n / CSS / localStorage + SPEC・DESIGN 差分（UI/UX Phase 0）'
created: '2026-07-15'
---
# Pre-Issue Recon: i18n / CSS / localStorage + SPEC・DESIGN 差分（UI/UX Phase 0）

| 項目 | 値 |
|------|-----|
| 実施日 | 2026-07-16 |
| Issue | #61 |
| 主ソース | **`src/index.template.html`**（ルート `index.html` 無し） |
| データ | `i18n/en.json`, `docs/SPECIFICATION.md` §4–5, `docs/DESIGN.md` §1.4 |
| i18n 実測 | top-level **56** / leaf string **182**（文書の「177」より +5） |

---

## セクション A: i18n キー参照

### A.0 集計

| 指標 | 数 |
|------|-----|
| leaf（en.json flatten） | **182** |
| テンプレ `t()` / 動的参照で使用 | ~160 |
| build のみ（`scripts/build-i18n-html.js`） | `meta.title` / `description` / `ogTitle` / `ogDescription` |
| **Orphan**（テンプレにも build にも無し） | **22** |
| **Missing**（参照あるが JSON 無し） | **1**（`audio_tap_hint`） |

`t(path)` は `.` 分割。`posLabel` → `UI.pos[pos]`。`lvl.*` / `lang_opts.*` / `accent.ga|rp` は動的連結。

### A.1 カテゴリ別（代表）

| カテゴリ | 主な用途 |
|----------|----------|
| `brand.*` / `meta.*`（keywords 除く） | タイトル・OGP（meta は build） |
| `tab.*` / `mode.*` / `modeb.study|quiz|…` | Setup / Mode B UI |
| `cs.*` / `weak.*` / `focus.*` / `reg.*` / `grp.*` | Connected / focus / spelling |
| `setup.*` / `dir.*` / `lvl.*` / `pool.count*` | 詳しい設定・CEFR・プール件数 |
| `start` / `loading` / `*_fail` / `back_top` | Start / Menu |
| `settings_*` / `accent.*` / `lang_opts.*` / `guide.*` | 設定・ガイド |
| `vocab.*` / `reveal.*` / `listen` / `exit_confirm.*` | Vocab / Reveal / TTS aria / 退出 |
| `input_*` / `check` / `clear` / `next` / `build_ph` / `note.*` / `kbd.*` | 練習 UI |
| `summary.*`（again 除く） / `info.*` / `pos.*` / `cefr.*` / `checks.*` | Summary / 音素 / 進捗 |
| `reflect.btn` | Reflect ドック（常時 hidden） |

### A.2 Orphan（22）

`lead_html`, `lead_connected_html`, `lead_weak_html`, `modeb.lead_html`, `modeb.pool`, `modeb.band.label`, `modeb.band.note`, `set.label`, `set.daily_t|d`, `set.phonics_t|d`, `hint.syl|first|pos`, `syl`, `syl_pl`, `lvl.pool`, `meter_done`, `summary.again`, `reveal.respell_label`, `meta.keywords`

（旧リード文・Band UI・Question set・ヒント・メーター残骸）

### A.3 Missing

| key | 参照 | 挙動 |
|-----|------|------|
| `audio_tap_hint` | `audioHintText()` | 英語フォールバック固定 |

---

## セクション B: CSS 変数（`:root`）

| 変数 | 値 | 用途 |
|------|-----|------|
| `--paper` | `#F4F3EE` | body 背景 |
| `--panel` | `#FFFFFF` | カード面 |
| `--ink` | `#191C20` | 本文 |
| `--muted` / `--faint` | `#6C717A` / `#9AA0A8` | 補助 / 薄ラベル |
| `--hair` | `#E2E0D8` | ボーダー |
| `--signal` / `--signal-soft` | `#0C7C7E` / `#E2F0EF` | CTA・選択・focus |
| `--stress` / `--stress-soft` | `#D9911B` / `#F8ECD3` | 強勢 |
| `--ok` / `--ok-soft` | `#2E7D54` / `#E4F0E8` | 正解 |
| `--bad` / `--bad-soft` | `#BC4F3A` / `#F6E6E1` | 不正解 |
| `--ipa` / `--ui` / `--mono` | フォントスタック | IPA / UI / mono |

`:root` 定義は **17**。語彙バッジ等はハードコード hex あり。`--space-*` / `--fs-*` 系統のトークンは無し。

---

## セクション C: localStorage

### C.1 SPEC §5.3 系

| キー | 定数 | 読み書き |
|------|------|----------|
| `app_lang` | 直書き | 初期化 / `persistAppLang` |
| `app_accent` | 直書き | 初期化 / `setAccent` |
| `app_mode` | 直書き | `S` 初期化 / mode ピル |
| `ept_hist_v1` | `LS_HIST_KEY` | `loadHist` / `saveHist` |
| `ept_sym_v1` | `LS_SYM_KEY` | `loadSym` / `saveSym` |
| `ept_checks_v1` | `LS_CHECKS_KEY` | `loadChecks` / `saveChecks` |
| `ept_vocab_v1` | `LS_VOCAB_KEY` | `loadVocab` / `saveVocab` |
| `ept_vocab_band` | `LS_VOCAB_BAND_KEY` | `getVocabBand` / `setVocabBand` |
| TTS | `LS_TTS_PREFIX`=`ipa_tts_v2:` | `lsKey` / `lsKeyAccent` → `{mime,b64}` |

### C.2 SPEC 外

| キー | 用途 |
|------|------|
| `va-disable` | Analytics オプトアウト（`?va-disable=1`） |

### C.3 TTS キー形

`ipa_tts_v2:{ga|rp}:{slug}`。連結 `p4_`、弱形 `weak_`。Legacy アクセント無しキーを読取時マイグレーション。

---

## セクション D: SPEC / DESIGN 差分の目星

### D.1–D.5（必須回答）

1. **Phoneme Focus 7** — 実装あり（all/traps/weak/letters/contractions/irregular/casual）。SPEC 一致。  
2. **「詳しい設定」** — Words: focus/reg/grp; Connected: level+type。Mode B は Band 専用 UI 無し → **CEFR ピル流用（SPEC 乖離）**。  
3. **40/40/20** — `wDue=0.4` / `wSym=0.4` / 余り New。`focus=weak` 時は **25/55**（DESIGN 未記載）。Cold start は比率スキップ。  
4. **`MODEB_QUIZ_ENABLED=false`**（定数定義付近）。Quiz HTML `#cardModeBMcq|Dict` + `buildModeBQueue` / Mcq・Dict レンダー・採点が残存。  
5. **Vocab** — `#/vocab` / `#/vocab/phrases`。Words=`PRESET`（5,397）、Phrases=`CONNECTED` のみ（201、弱形除外）。SPEC 件数一致。

### D.6 実装にあるが SPEC/DESIGN UI 章に薄い／無いもの（段階 1 吸収候補）

1. `#reflectDock`（配線あり・常時 hidden）  
2. `#audioHint` + TTS ジェスチャ解放（`audio_tap_hint` 欠落）  
3. `#siteFooter`（Feedback / Terms / Privacy / X）  
4. `va-disable` LS + Insights noop  
5. Mode B CEFR 流用 vs Band 専用 UI 未実装 + orphan `modeb.band.*`  
6. Setup lead キー（`lead_*`）未配線  
7. 旧 `set.*` Question set UI 削除・キー残留  
8. `hint.*` / `.hints{display:none}` 死コード相当  
9. weak focus 時 SRS 比率 25/55  
10. `#againBtn` が `back_top`（`summary.again` orphan）  
11. ブランドサブタイトル無し  
12. 一部インライン style（Mode B heads）

---

## 申し送り（段階 2 向け）

- orphan 22 / missing 1 の整理方針  
- Mode B Band vs CEFR を文書か実装どちらかに寄せる  
- leaf 182 vs 文書「177」同期  
- SPEC §5.3 に `va-disable`、§4 に footer / audioHint の要否  
- **データはあるが出題・表示に乗らない穴**（B2 ピル無し、respell 未表示、Connected `cefr` 未フィルタ等）→ [`data-ui-gas-halfbaked`](pre-issue-recon-20260716-data-ui-gas-halfbaked.md)
