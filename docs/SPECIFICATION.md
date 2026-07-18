---
id: pj-2026-06-24-1519
aliases:
- pj-2026-06-24-1519
title: IPA Sound Drill — 仕様書
created: '2026-06-24'
updated: '2026-07-18'
---

# IPA Sound Drill — 仕様書

> 本ドキュメントは、Phase 1 UI/UX の画面・データ・Local Storage 仕様の正本です。  
> 目的の正本は `docs/PURPOSE.md`、実装設計は `docs/DESIGN.md`（衝突時は PURPOSE → DESIGN → SPECIFICATION の順で参照）。

**最終更新:** 2026-07-18（Issue #75: Phase 1 UI/UX 確定事項の先行仕様改訂）  
**対象コード:** `src/index.template.html`（正本。ビルド生成物 `/{lang}/index.html`）、`wordlist_GA_a1a2_plus_phonics.json`（**5,397 語**）、`data/connected_speech.json`、`data/weak_forms.json`、`data/guide.json`、`i18n/`、`gas/`  
**リポジトリ構成:** `docs/REPOSITORY-STRUCTURE.md`（フォルダマップ・Runtime data contract）

---

## 目次

1. [解決する課題](#1-解決する課題)
2. [課題への解決アプローチ](#2-課題への解決アプローチ)
3. [画面設計](#3-画面設計)
4. [動的情報の管理](#4-動的情報の管理)
5. [インフラ構成](#5-インフラ構成)
6. [補足・制約](#6-補足制約)

---

## 1. 解決する課題

### 1.1 対象ユーザー

- 英語の発音を IPA で観察し直したい成人学習者。
- UI 言語として en / ja / ko / zh-Hans / zh-Hant / fil を想定する。
- 学習対象の発音体系は GA / RP のいずれかをセッション開始前に選ぶ。
- 学習者は「意味を知っている語の音を確かめたい」「綴りから IPA を書きたい」「音から語彙を覚えたい」「連結音に慣れたい」のいずれかの目的で入る。

### 1.2 アプリの位置づけ

IPA Sound Drill は、語彙量そのものを競うアプリではなく、**英語の音を IPA で再調整する目的別ドリル**である。旧 Mode A/B は内部実装の履歴として残るが、Phase 1 の仕様ではユーザー向け入口を 4 目的カードに統一する。

### 1.3 解決したい課題

| 課題 | 内容 | 対応する目的カード |
|---|---|---|
| IPA リテラシー不足 | 綴りと音が一致しない英語で IPA を読んで書けない | 音の発音を確かめる / 発音から書いてみる |
| L1 音韻フィルタ | 母語の音韻体系が英語音の知覚・産出を妨げる | 4 目的すべて |
| 音と語彙の切断 | 音を聞いても単語・意味に結びつかない | 音から単語を覚える |
| 連結音の理解 | 辞書形と実際の連結・弱形の差が読めない | 連結する音に慣れる |
| 米英アクセント差 | GA/RP の IPA・音声・キーボード差を混在させると学習がぶれる | プロフィールでセッション固定 |

---

## 2. 課題への解決アプローチ

### 2.1 学習入口（4 目的カード）

| 目的カード | 画面ラベル（ja） | 主なループ | 採点 |
|---|---|---|---|
| purpose.pronounce | 音の発音を確かめる | IPA / TTS → 綴り入力 → Reveal | 完全一致のみ |
| purpose.write | 発音から書いてみる | 単語 / TTS → IPA 入力 → Reveal | 完全一致のみ |
| purpose.vocab | 音から単語を覚える | TTS / IPA → 意味を確認 → 手動チェック | 自動採点なし |
| purpose.connected | 連結する音に慣れる | 連結 IPA / 弱形 IPA → 元表現入力 → Reveal | 完全一致のみ |

目的カードを選ぶと、必ずプロフィール画面 `8z` へ進む。旧セットアップ画面にあった詳細設定は、Phase 1 ではプロフィールへ集約する。

### 2.2 セッション共通仕様

| 項目 | 仕様 |
|---|---|
| 開始 | 目的カード → `8z` プロフィール → はじめる → ドリル |
| プロフィール初期値 | Local Storage の前回設定をプリセット |
| セッション中変更 | GA/RP は変更不可。CEFR や詳細条件は静かなインラインチップとして表示し、主導線を遮らない |
| 出題プール | 選択 CEFR、目的、アクセント、目的別プリセット、詳細条件の積集合 |
| 先読み | 現行の TTS プリフェッチ方針を維持。具体値は実装現行値を参照 |
| 終了 | プール消化または Menu 操作でサマリーへ。離脱確認の詳細は Phase 1-D で最終実装 |

### 2.3 採点ロジック

Phase 1 の正本では、**完全一致のみ**を正解とする。AI 判定、惜しさ、部分正解、near 表示は使わない。

| 目的カード | OK | NG |
|---|---|---|
| 音の発音を確かめる | 綴り完全一致 | それ以外 |
| 発音から書いてみる | IPA（強勢含む）完全一致 | それ以外 |
| 音から単語を覚える | 自動採点なし | 自動採点なし |
| 連結する音に慣れる | 元フレーズ / 機能語の完全一致 | それ以外 |

### 2.4 CEFR word-level タグ

- CEFR は全目的横断の word-level タグである。
- プロフィールで複数レベルを選択する。
- 各ドリルカードの STEP 行右上に `語彙 A2` 形式のタグを表示する。
- `wordlist_GA_a1a2_plus_phonics.json`、`data/connected_speech.json`、`data/weak_forms.json` の `cefr` は runtime 表示・出題フィルタの入力になる。
- 未タグ語の扱いは Phase 1-0-b Recon で確定する。暫定方針として、未タグ語を自動的に A1 等へ丸めない。

### 2.5 GA / RP セッション固定

- プロフィール画面 `8z` で GA / RP を選択する。
- 学習中のヘッダーに固定バッジを表示する。
- 選択アクセントに応じて IPA 表示、Encode キーボード、TTS、反対アクセント行が決まる。
- 収録音声と IPA が異なるため、セッション中の切替 UI は置かない。
- 連結句 TTS は Track A では GA 固定。弱形 TTS は GA/RP に対応する。

### 2.6 マーキング（手動チェック）

| 項目 | 仕様 |
|---|---|
| 保存単位 | `mark:{drill_id}:{word_id}` 相当（実装キー名は Phase 1-0-b / Phase 1-C で確定） |
| 値 | 0 / 1 / 2 / 3 |
| 卒業 | 3 でその目的カードにおける卒業扱い |
| 独立性 | 目的カードごとに独立。Decode 相当と Vocab 相当のチェックは混ぜない |
| 更新主体 | ユーザー手動のみ。正誤で自動更新しない |
| 永続化 | Local Storage。Track A ではバックエンド同期なし |

既存 `ept_checks_v1` からの移行、互換保持、削除時期は Phase 1-0-b Recon で確定する。

### 2.7 オンボーディング

| 項目 | 仕様 |
|---|---|
| 初回表示 | 初回訪問時に 4 スライドガイド `8e` を表示 |
| 完了フラグ | `onboarding_completed_v1` |
| スキップ | スキップも完了扱い |
| 再表示 | ヘッダーのガイドアイコンから任意再表示 |
| DOM 方針 | 重要説明は JS 介在なしで読める要素として配置する |

### 2.8 セッション内絞り込み

セッション内絞り込みは、ドリル画面内のインラインチップとして扱う。独立した絞り込みボトムシートや `3b` 画面は仕様に含めない。

---

## 3. 画面設計

### 3.1 Phase 1 画面一覧

| Frame | 役割 | 主な情報 |
|---|---|---|
| `1` | トップ / Hero | タグライン、短い思想説明、4 目的カード |
| `2` | 目的カード一覧 | 4 目的、各カードの「何をするか」 |
| `8z` | 学習プロフィール | アクセント、CEFR、目的別プリセット、詳細条件 |
| `3` | 音の発音を確かめる | IPA、TTS、入力、STEP、語彙タグ |
| `4` | 発音から書いてみる | 単語、TTS、IPA キーボード |
| `5` | 音から単語を覚える | TTS、IPA、意味 reveal、手動チェック |
| `6` | 連結する音に慣れる | 連結 IPA / 弱形 IPA、キャリア文、Type/Level チップ |
| `7` | Reveal | 正解、IPA、gloss、反対アクセント、手動チェック |
| `8` | Summary | 今回の完了、チェック状態、次の導線 |
| `8e` | Onboarding | 4 スライドガイド |
| `9` | 語彙ブラウザ | Words / Phrases、検索、IPA、CEFR、チェック |
| `10` | ガイド / About | 使い方と思想説明 |
| `11` | Legal / Feedback | Terms、Privacy、Feedback、X |
| `12` | PC 版調整 | 広幅時のレイアウト最適化 |

### 3.2 トップ / 目的カード

- タグライン「音を、美しく。」をファーストビューに置く。
- English copy では “Retune your English. From sound up.” を使う。
- 4 目的カードは同列に並べ、旧 Mode A/B の上下関係を出さない。
- カード文言は「ユーザーがしたいこと」で書き、内部機能名を主語にしない。

### 3.3 学習プロフィール `8z`

| グループ | 内容 |
|---|---|
| Accent | GA / RP。選択後はセッション中固定 |
| CEFR | A1 / A2 / B1 / B2 など複数選択 |
| Purpose preset | 目的カードごとの初期条件 |
| Detailed settings | 旧「詳しい設定」の 12 パラメータを集約。具体リストは Phase 1-0-b Recon で確定 |
| Start | そのまま「はじめる」または変更後に開始 |

### 3.4 ドリルカード共通

- STEP 行に現在番号、目的、語彙 CEFR タグを置く。
- ヘッダーに GA / RP 固定バッジを置く。
- セッション内条件は静かなチップで表示する。
- 主要操作は 1 画面 1 主軸に保つ。
- 手動チェックは目的ごとに同じ意味の UI として表示する。

### 3.5 語彙ブラウザ

語彙ブラウザは支援画面として維持する。Words / Phrases、検索、A-Z ジャンプ、TTS、GA/RP IPA、CEFR、手動チェックを提供する。Phase 1-E で目的カード構成と矛盾しない導線へ再配置する。

---

## 4. 動的情報の管理

### 4.1 単語データ — `wordlist_GA_a1a2_plus_phonics.json`

約 **5,397 語**。主要フィールド:

```json
{
  "w": "colour",
  "ipa": "/ˈkʌlər/",
  "rp_ipa": "/ˈkʌlə/",
  "cefr": "A1",
  "pos": "名詞",
  "src": "cefr",
  "pattern": null,
  "group": null,
  "gloss": { "en": "...", "ja": "...", "zh": "...", "ko": "...", "fil": "..." },
  "ipa_actual_ga": "/ˈpɑrɾi/",
  "ipa_actual_rp": null,
  "def": "A small watercraft used to travel on water such as rivers and lakes.",
  "neighbors": ["caller", "collar"],
  "ga_rp_same": true,
  "ga_rp_same_reason": "identical"
}
```

| フィールド | Phase 1 用途 |
|---|---|
| `w` | 正解綴り・TTS 入力・語彙ブラウザ |
| `ipa` | GA phonemic IPA |
| `rp_ipa` | RP phonemic IPA |
| `ipa_actual_ga` / `ipa_actual_rp` | 表示専用 narrow IPA |
| `gloss` / `def` | Reveal・語彙ブラウザ・音から単語を覚える |
| `cefr` | 全目的横断の word-level タグ |
| `neighbors` | 将来の知覚テストや参考情報。Phase 1 の Study 正本では自動採点に使わない |
| `ga_rp_same` / `ga_rp_same_reason` | 反対アクセント表示の同一判定 |

### 4.2 連結句・弱形

- `data/connected_speech.json`: 201 句。`id`, `w`, `ipa`, `rp_ipa`, `cs_type`, `level`, `cefr`, `cs_rule`, `gloss`, `carriers`。
- `data/weak_forms.json`: 36 語。`id`, `w`, `ipa`, `strong_ipa`, `level`, `cefr`, `cs_rule`, `carrier`。
- Phase 1 では目的カード「連結する音に慣れる」へ統合する。

### 4.3 Local Storage（永続）

| キー | 内容 | Phase 1 方針 |
|---|---|---|
| `app_lang` | UI 言語 | 維持 |
| `app_accent` | 既存アクセント選択 | プロフィール初期値として利用。セッション中は固定 |
| `app_mode` | 旧モード | Phase 1-C で移行方針確定 |
| `ept_hist_v1` | 旧単語 SRS | 既存ユーザー保護のため読取方針を Phase 1-0-b で確定 |
| `ept_sym_v1` | 旧記号弱点 | 同上 |
| `ept_vocab_v1` | 旧語彙 SRS | 同上 |
| `ept_checks_v1` | 旧手動進捗 | Phase 1 の目的別マーキングへ移行対象 |
| `onboarding_completed_v1` | 初回ガイド完了 | 新規 |
| `prev_settings_v1` 相当 | プロフィール前回値 | 実装キー名・12 パラメータは Phase 1-0-b で確定 |
| `va-disable` | Vercel Analytics オプトアウト | 維持 |

### 4.4 セッション状態（メモリ）

Phase 1 のセッション状態は、少なくとも以下を持つ。

| 状態 | 内容 |
|---|---|
| `purpose` | 4 目的カードのいずれか |
| `accent` | `ga` / `rp`。プロフィール確定後は不変 |
| `cefrLevels` | 選択 CEFR の Set |
| `profileSettings` | 目的別プリセットと詳細条件 |
| `sessionPool` | 出題対象 |
| `queue` / `idx` | 先読みキューと現在位置 |
| `cur` | 現在アイテム |
| `markState` | 現在目的における手動チェック |

### 4.5 i18n

| データ | パス |
|---|---|
| UI 文言 | `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` |
| 音素解説 | `i18n/phonemes/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` |
| 学習ガイド | `data/guide.json` |

Phase 1-G で 4 目的カード、プロフィール、オンボーディング、マーキングの文言を 6 言語へ展開する。Track A では ja / en の完全性を最優先する。

---

## 5. インフラ構成

Track A の技術構成は維持する。

| レイヤ | 技術 | 役割 |
|---|---|---|
| フロントエンド | `src/index.template.html` → `/{lang}/index.html` | UI・ゲームロジック・採点・Local Storage |
| ホスティング | Vercel | 静的配信 |
| 音声 API | GAS Web App → OpenAI TTS | API キー非露出の TTS プロキシ |
| 単語データ | `wordlist_GA_a1a2_plus_phonics.json` | 語・IPA・gloss・CEFR・GA/RP 情報 |
| 連結 / 弱形 | `data/connected_speech.json`, `data/weak_forms.json` | 連結目的カードの runtime データ |
| クライアント保存 | Local Storage | 言語、プロフィール、マーキング、TTS キャッシュ |

---

## 6. 補足・制約

| 項目 | 内容 |
|---|---|
| 実装コード変更 | 本 Issue では行わない。Phase 1-A 以降で対応 |
| Runtime data contract | 本 Issue では変更しない |
| GA/RP セッション固定 | 仕様として確定。実装は Phase 1-C / 1-D |
| CEFR 未タグ語 | Phase 1-0-b Recon で扱いを確定 |
| 12 パラメータ | Phase 1-0-b Recon で具体リストと配置を確定 |
| オンボーディング | 実装は Phase 1-F |
| 多言語 UI | 実装は Phase 1-G |
| PC 版 | 実装は Phase 1-H |

---

## 変更履歴

| 日付 | 内容 |
|---|---|
| 2026-07-18 | Issue #75: Phase 1 UI/UX 確定事項に合わせ、旧 Mode A/B 前提を目的 4 カード、プロフィール一元通過型 UX、CEFR word-level、GA/RP セッション固定、マーキング、オンボーディング前提へ改訂。 |
| 2026-07-16 | Q-7-A: Connected `cs_rule` に ko / zh-Hans / zh-Hant 追加。 |
| 2026-07-16 | Q-9-A: 3 モーダルに Escape キー対応。 |
| 2026-07-10 | Phase B / T / V / R の仕様反映。 |
| 2026-06-23 | 初版（Mode A のみ・GA 固定）。 |
| 2026-06-26 | Mode B・連結句・GA/RP・SRS・TTS v2/accent キャッシュを反映。 |
