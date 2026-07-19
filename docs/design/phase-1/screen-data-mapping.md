---
id: pj-2026-07-18-sdmap
aliases:
- screen-data-mapping
title: Phase 1 — 画面 × データマッピング（Recon）
created: '2026-07-18'
updated: '2026-07-18'
---

# Phase 1 — 画面 × データマッピング（Recon）

> **正本（Category A）:** Phase 1-C / 1-D / 1-E 起票・実装時の判断材料。  
> **関連:** Issue #78（Phase 1-0-b）、上位仕様は `PURPOSE.md` v4.0 / `SPECIFICATION.md` / `DESIGN.md`（#75 merge 済み）。  
> **調査対象:** `src/index.template.html`（md5 `65c30ff7797549b478a4c8db2f8f8702`）、`wordlist_GA_a1a2_plus_phonics.json`（5,397）、`data/connected_speech.json`（201）、`data/weak_forms.json`（36）。

---

## §1: Setup 11 項目（確定ラベル）

> **Naoya 裁定（PR #80 Claude Rv）:** パラメータ数ラベルは **「11」に統一**。旧称「12 パラメータ」は廃止。PURPOSE / DESIGN の残表記は Phase 1-C 起票時に「Setup 11 項目（Accent 含む）+ Onboarding」等へ書き替え。

**公式カウント:** 現行 `#setup` 論理 **9**（学習構成 3 + CEFR 1 + Words 詳細 3 + Connected 詳細 2）+ **Accent** + **Language** = **11**。

| 区分 | 扱い |
|---|---|
| #1–#9 | Setup 由来（うち #1–#3 は目的カード化で **廃止予定**） |
| #10 Accent | プロフィール `3a` 必須・学習中固定 |
| #11 Language | **カウントは 11 に含める**。UI 配置は `3f` またはヘッダー（プロフィール必須表示から外してよい） |
| Onboarding | 11 の外（`3g` / `onboarding_completed_v1`） |
| フィルタトグル 2 種 | 11 に含めない（UI シェル） |

下表は実態列挙（「詳しい設定」トグル自体はパラメータではない）。

| # | パラメータ | i18n（主） | 現行 DOM | 現行 LS | Phase 1 振り分け | Q-20-δ 扱い | 備考 |
|---|---|---|---|---|---|---|---|
| 1 | Learning mode | `mode.label` / `mode.a` / `modeb.title` | `#modeField` `#modeA` `#modeB` | `app_mode` (`a`/`b`) | **廃止** | 隠す | 目的カード `2a`–`2d` で吸収 |
| 2 | Practice mode | `tab.words` / `tab.connected` | `#tabField` `#tabWords` `#tabConnected` | なし（`S.tab` メモリ） | **廃止** | 隠す | Words→`2a`/`2b`/`2c`、Connected→`2d` |
| 3 | Direction | `dir.decode_t` / `dir.encode_t` | `#dirField` | なし（`S.dir`） | **廃止** | 隠す | Decode→`2a`、Encode→`2b` |
| 4 | CEFR level | ピル文言 A1/A2/B1（`cefr.*` 補助） | `#cefrField` `#cefrPills` | なし（`S.cefrLevels`） | **プロフィール `3a`** | 毎セッション表示 | 複数選択。既定 `A1+A2`。B2 ピル未露出（データはあり） |
| 5 | Phoneme focus | `focus.*` | `#focusField` `#focusPills` | なし（`S.focus`） | **プロフィール**（折りたたみ）+ ドリルインライン可 | 折りたたみデフォルト | 7 択: all/traps/weak/letters/contractions/irregular/casual |
| 6 | Spelling pattern | `reg.*` | `#regField` `#regOpts` | なし（`S.reg`） | **プロフィール**（折りたたみ） | 折りたたみ | all/regular/irregular |
| 7 | Spelling pattern group | `grp.*` | `#grpField` `#grpPills` | なし（`S.grp`） | **プロフィール**（折りたたみ） | 折りたたみ | `reg=regular` 時のみ意味あり |
| 8 | Connected level | `cs.level` | `#csLevelPills` | なし（`S.csLevel`） | **プロフィール**（`2d` 選択時） | 折りたたみ | all/1/2/3 |
| 9 | Connected type | `cs.*` | `#csPills` | なし（`S.csFilter`） | **プロフィール**（`2d` 選択時） | 折りたたみ | all/linking/assimilation/elision/weak |
| 10 | Accent | settings | `#accentOpts` | `app_accent` | **プロフィール `3a`** | 毎セッション表示・学習中固定 | GA/RP |
| 11 | Language | settings | `#langOpts` | `app_lang` | **`3f` 言語設定**（またはヘッダー） | トップ/設定 | **11 カウントに含む**。プロフィール必須表示からは外してよい |

**UI シェル（パラメータではない）**

| 要素 | DOM | 扱い |
|---|---|---|
| Words「詳しい設定」トグル | `#wordsFilterToggle` / `#wordsFilterAdvanced` | i18n `setup.show_filters` / `hide_filters`。プロフィール内アコーディオンへ |
| Connected「詳しい設定」トグル | `#connectedFilterToggle` / `#connectedFilterAdvanced` | 同上 |
| Start | `#startBtn` | → `3a` の「はじめる」 |

**廃止理由（1–3）:** Phase 1 目的 4 カードが入口を平坦化するため。`app_mode` は削除予定（SPEC §5.3）。

**Cursor 推奨（裁定反映済み）:** プロフィール必須表示 = Accent + CEFR。詳細フィルタ（5–9）は同一画面の折りたたみ。Language は `3f`/ヘッダー。ラベルは常に **「Setup 11 項目」**。

---

## §2: LS スキーマ現状 + Phase 1 計画

### 現状キー一覧（grep 網羅）

| キー | 用途 | Phase 1 扱い |
|---|---|---|
| `app_lang` | UI 言語 | **維持**（`3f`） |
| `app_accent` | GA/RP | **維持**→プロフィール固定（キー統合は任意） |
| `app_mode` | 旧 Mode A/B | **廃止** |
| `ept_hist_v1` | 単語 Leitner SRS | **維持** |
| `ept_sym_v1` | Encode 記号弱点 | **維持** |
| `ept_vocab_v1` | Study 語彙 SRS | **維持** |
| `ept_vocab_band` | 旧 Mode B バンド | **廃止**（実装削除は 1-A〜1-H） |
| `ept_checks_v1` | 手動進捗 `{ [wordKey]: { d,e,l: 0..3 } }` | **移行** → `mark:…` |
| `ipa_tts_v2:*` | TTS base64 キャッシュ | **維持** |
| `ipa_tts_v1:*` | legacy（読取時 v2 移行） | **維持（読取のみ）** |
| `va-disable` | Analytics オプトアウト | **維持** |
| cookie `app_lang` | 言語補助 | **維持** |

`wordKey` = `sessionItemKey(c)` = `c.id || c.w`（単語は綴り、連結/弱形は `id` 優先）。

### Phase 1 新規キー

#### `mark:{drill_id}:{word_id}`（Q-16）

| 項目 | 推奨 |
|---|---|
| `drill_id` | enum: `2a` \| `2b` \| `2c` \| `2d` |
| `word_id` | 現行と同じ `sessionItemKey`（`id` or `w`）。**文字列** |
| 値 | integer `0..3` |
| ストレージ形 | **案 α（推奨）:** 単一オブジェクト `ept_marks_v1` = `{ "2a:word": 2, ... }`（LS キー数爆発を避ける） |
| 代替 | 案 β: リテラルキー `mark:2a:colour`（Issue 表記どおり。件数多いと LS クォータ圧） |

> Issue 表記の `mark:{drill_id}:{word_id}` は論理キー。実装は案 α を推奨し、論理キーは API 層で互換。

#### `prev_settings_v1`（Q-20-δ）

```jsonc
{
  "v": 1,
  "accent": "ga",
  "cefrLevels": ["A1", "A2"],
  "focus": "all",
  "reg": "all",
  "grp": "all",
  "csLevel": "all",
  "csFilter": "all",
  "lastDrill": "2a"
}
```

- version `v` で後方互換
- 毎セッション `3a` の初期値

#### `onboarding_completed_v1`（Q-21）

- boolean（文字列 `"1"` / 欠落=未完了）。スキップも完了扱い。

### マイグレーション戦略（`ept_checks_v1` → marks）

| 旧 | 新 |
|---|---|
| `checks[key].d` | mark `2a` + `word_id=key` |
| `checks[key].e` | mark `2b` |
| `checks[key].l` | mark `2c` |
| （なし） | `2d` → **0 初期化**（連結専用旧キーなし） |

- **タイミング（推奨）:** 起動時 lazy — 初回 `loadMarks()` で `ept_checks_v1` を読み、未移行なら変換して `ept_marks_v1` 書き込み + フラグ `ept_marks_migrated_v1=1`。旧キーは当面残置（ロールバック用）、Track B で削除可。
- 実装 Issue: Phase 1-C。

---

## §3: CEFR word-level 実態調査（Q-17）

### wordlist（5,397）

| CEFR | 件数 |
|---|---|
| A1 | 1,187 |
| A2 | 1,195 |
| B1 | 2,116 |
| B2 | 899 |
| **未タグ** | **0** |

カバレッジ **100%**。

### connected_speech（201）

| CEFR | 件数 |
|---|---|
| A1 | 63 |
| A2 | 106 |
| B1 | 19 |
| B2 | 13 |
| 未タグ | **0** |

### weak_forms（36）

| CEFR | 件数 |
|---|---|
| A2 | 26 |
| B1 | 10 |
| 未タグ | **0** |

### 未タグ語の扱い方針

現状は未タグ 0 のため **即時の除外/割当は不要**。将来の語彙追加向けガードとして:

| 案 | 内容 | 評価 |
|---|---|---|
| A | 未タグはプール除外 | 安全だがサイレント欠落 |
| B | デフォルト A1 割当 | 誤ラベルリスク |
| **C（推奨）** | 未タグは「全レベル一致」扱い + ビルド時警告 | 学習阻害なし。CI/スクリプトで `cefr` 欠落を fail 推奨 |

**Connected（`2d`）:** UI フィルタは level/type のみ（タグ表示のみ横断）。未タグ方針は Words と同じガードでよい。

**再現コマンド:**

```bash
python3 -c "import json;from collections import Counter;w=json.load(open('wordlist_GA_a1a2_plus_phonics.json'));print(len(w),Counter(x.get('cefr') for x in w))"
```

---

## §4: GA/RP 個別 IPA + 音声実態調査（Q-18）

### 辞書フィールド（wordlist）

| フィールド | 件数 / 5,397 | 備考 |
|---|---|---|
| `ipa` (GA phonemic) | 5,397 (100%) | 採点・主表示 |
| `rp_ipa` | 5,397 (100%) | RP 時 |
| `ipa_actual_ga` (narrow) | 529 | 表示専用 |
| `ipa_actual_rp` | 0 | 未整備 |
| `respell_ga` / `respell_rp` | 5,322 | UI 非表示 |
| `ga_rp_same=true` | 2,674 | |
| `ga_rp_same=false` | 2,723 | |

### 連結・弱形

| データ | ipa | rp_ipa | ga_rp_same true/false |
|---|---|---|---|
| connected 201 | 201 | 201 | 94 / 107 |
| weak 36 | 36 | 36 | 30 / 6 |

### TTS / BatchWarm（運用ドキュメントベース）

| 項目 | 状態 |
|---|---|
| GA 単語 TTS | BatchWarm 設計済み（5,397）。Drive 全件は `remaining-ops-checklist` B2 で運用確認 |
| RP 単語 TTS | オンデマンド生成可（`accent=rp`）。**RP BatchWarm スケジューラは未実装**（同 checklist B3） |
| 連結句 TTS | **GA 固定**。RP 連結は Track B |
| 弱形 TTS | GA/RP オンデマンド（`?weak=`） |
| `?urls=1` | コード済み、GAS 再デプロイは手動残作業 |

### 未対応の扱い（推奨）

- **Track A:** 実装済み範囲で運用（単語 GA/RP IPA 100%、RP 音声はオンデマンド、連結は GA）
- **Track B 候補:** RP BatchWarm、連結 RP TTS、`ipa_actual_rp`

---

## §5: IPA 部分一致検索 latency（Q-19）

### `#vocabPage`（`3b`）— Phase 1-E PR-1 実装済

- 検索: sticky filter の「綴り」モード → `#vocabSearchInput`（綴り部分一致）
- Segmented「IPA」→ `#/vocab/ipa`（`3c`）
- A–Z ジャンプあり（仮想リスト）
- Words 仮想化（~20–30 行）。Phrases 非仮想化

### `3c` IPA 部分一致検索 — **実装済（Phase 1-E PR-1）**

- アルゴリズム: Recon §5 の正規化 IPA `includes` 全走査（index / Worker なし）
- UI: query chips（`symbolQuery`）+ live 結果 + `--signal` highlight
- latency 目標 ≤100ms は Recon 実測でクリア済み（下記）

### 計測方法

- `src/index.template.html` は **未変更**（md5 前後一致: `65c30ff7797549b478a4c8db2f8f8702`）
- 同一アルゴリズム（正規化 IPA の `includes` 全走査）を Node.js で 5,397 語に対し 100 回計測

### 結果（Node / ローカル）

| 指標 | 値 |
|---|---|
| mean | **0.15 ms** |
| p50 | 0.11 ms |
| p95 | 0.26 ms |
| max | 1.62 ms |
| 目標 | ≤ 100 ms |

Python 交差検証: mean ≈ 0.33 ms、max ≈ 0.72 ms。

**結論:** 単純全走査で目標を **2 桁以上クリア**。Track A で事前 index / Web Worker は **不要**。モバイル Safari でも数 ms オーダーと推定（実機は Phase 1-E で確認）。

**対策候補（将来、もし 100ms 超えた場合のみ）:** トークン逆引き index JSON、Worker、先頭 N 件即時表示。

---

## §6: 13 concept × 動的項目 × データソース

> PC variant（`-pc`）は Phase 1-H。本表は concept 単位。

### `1a` トップ

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| タグライン | i18n（新規 `top.tagline` 等） | **新規** |
| 目的 4 カード名 | i18n `drill.title.2a`–`2d`（新規） | **新規** |
| ガイドアイコン | → `3g` 再表示 | **新規導線** |
| フッター「このアプリについて」 | → `3h` DOM 常時 | **新規** |

### `3a` 学習プロフィール

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| Accent | `app_accent` / `prev_settings_v1` | セッション固定化 |
| CEFR | `prev_settings_v1.cefrLevels` | プロフィール必須 |
| 詳細フィルタ 5–9 | `prev_settings_v1` | Setup から移設 |
| はじめる | — | 新規 CTA |

### `2a` 音の発音を確かめる

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 出題 IPA | `ipa` / `rp_ipa`（プロフィール固定） | 切替 UI 削除 |
| TTS | GAS | 変更なし |
| 綴り正解 | `w` | 変更なし |
| gloss | `gloss.{lang}` | 変更なし |
| STEP | `S.idx` / `poolTotal` | 変更なし |
| CEFR タグ | `cefr` | **新規表示** |
| マーキング | `mark:2a:{id}` | **新規** |
| 採点 | 完全一致 | near 削除済み（#75） |

### `2b` 発音から書いてみる

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 単語 | `w` | 変更なし |
| 正解 IPA | `activeIpa` | アクセント固定 |
| キーボード | GA/RP セット | 固定追従 |
| CEFR タグ / マーキング | `cefr` / `mark:2b:…` | **新規** |

### `2c` 音から単語を覚える

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| TTS / IPA | GAS / `ipa`/`rp_ipa` | 固定アクセント |
| gloss / def | `gloss` / `def` | 変更なし |
| CEFR タグ / マーキング | `cefr` / `mark:2c:…` | **新規** |
| Band UI | — | **廃止** |

### `2d` 連結する音に慣れる

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 句/弱形 IPA | connected / weak `ipa`/`rp_ipa` | 変更なし |
| TTS | `?phrase=` GA / `?weak=` | 変更なし |
| CEFR タグ | `cefr` | **表示のみ**（フィルタなし） |
| フィルタ | level / type | プロフィール or インライン |
| マーキング | `mark:2d:…` | **新規**（初期 0） |

### `3b` 語彙リスト

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 行データ | wordlist / connected | 変更なし |
| 綴り検索 | `w` | sticky filter「綴り」（実装済） |
| CEFR フィルタ | pills（初期全選択） | **新規**（PR-1） |
| 進捗 | marks（旧 checks） | 移行予定 |
| IPA 検索入口 | Segmented → `3c` | **実装済（PR-1）** |
| 仮想化 | Words only | **実装済（PR-1）** |

### `3c` IPA 記号ピッカー

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 記号パレット | `symbolChartGroups`（IPA chart 分類） | **実装済（PR-1）** |
| Query chips | `symbolQuery` array | **実装済（PR-1）** |
| 部分一致結果 | wordlist IPA 走査（§5 アルゴリズム） | **実装済（PR-1）** |

### `3d` 学習状況

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| SRS / marks 集計 | `ept_hist_v1` / marks | **新規画面** |

### `3e` IPA って何？

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 説明文 | `guide.json` / 新規 i18n | 再配置 |

### `3f` 言語設定

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 言語ピル | `app_lang` | settings から分離可 |

### `3g` オンボーディング

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 4 スライド | 新規 i18n | **新規** |
| 完了フラグ | `onboarding_completed_v1` | **新規** |

### `3h` このアプリについて

| 動的項目 | データソース | Phase 1 変更 |
|---|---|---|
| 静的説明 | DOM 常時（クローラビリティ） | **新規** |

---

## §7: DOCUMENT-MAP / 保守契機

### Category A 追加

| ファイル | 更新トリガー | 更新責任者 |
|---|---|---|
| `docs/design/phase-1/screen-data-mapping.md` | Setup/プロフィール項目変更、LS キー追加、語彙 CEFR/IPA カバレッジ大きく変化、`3c` 検索実装 | 該当 Phase Issue（1-C / 1-D / 1-E）の Cursor 実装内 |

### 参照タイミング

- Phase 1-C 起票: §1 / §2
- Phase 1-D 起票: §3 / §6（`2a`–`2d`）
- Phase 1-E 起票: §4 / §5 / §6（`3b`/`3c`）

---

## 付録: 調査メタ

| 項目 | 値 |
|---|---|
| Issue | #78 |
| テンプレート md5（不変） | `65c30ff7797549b478a4c8db2f8f8702` |
| Node latency 計測日 | 2026-07-18 |
| 未発見の用途不明 LS キー | なし |
| CEFR 未タグ率 | 0%（5% 超の中断条件に非該当） |
| IPA 検索 max | 1.62 ms（500ms 超の中断条件に非該当） |

> **Phase 1-E PR-1（#91）:** `3c` は本 §5 アルゴリズム（正規化 IPA `includes` 全走査）を採用して実装完了。index / Worker は未導入。
