---
id: pj-2026-06-24-1983
aliases:
- pj-2026-06-24-1983
title: IPA Sound Drill — 実装設計仕様（DESIGN.md）
created: '2026-06-24'
updated: '2026-07-18'
---

# IPA Sound Drill — 実装設計仕様（DESIGN.md）

> `PURPOSE.md` で確定した Phase 1 UI/UX 方針を、Cursor が実装 Issue に分解できる粒度まで具体化する設計仕様。  
> 画面・JSON フィールド・Local Storage の正本は **`SPECIFICATION.md`**。フォルダマップは **`REPOSITORY-STRUCTURE.md`**。
>
> **更新日:** 2026-07-18 ／ **ステータス:** Issue #75 による仕様先行改訂。コード実装は Phase 1-A 以降。

---

## 0. 用語

| 用語 | 意味 |
|---|---|
| 目的カード | Phase 1 のトップでユーザーが選ぶ 4 入口 |
| Pronounce | 「音の発音を確かめる」。旧 Decode 相当 |
| Write | 「発音から書いてみる」。旧 Encode 相当 |
| Vocab | 「音から単語を覚える」。旧 Study 相当 |
| Connected | 「連結する音に慣れる」。Connected Speech + Weak forms |
| プロフィール `8z` | 全セッション開始前に通過する設定確認画面 |
| オンボーディング `8e` | 初回または任意再表示の 4 スライドガイド |
| マーキング | ユーザー手動チェック 0–3。自動採点とは独立 |

---

## 1. Phase 1 情報設計

### 1.1 設計原則

1. **目的ファースト:** 旧 Mode A/B を見せず、学習者の目的で入口を選ばせる。
2. **プロフィール一元通過:** すべてのセッションは `8z` を通る。前回設定をプリセットし、確認負荷を下げる。
3. **セッション固定:** GA/RP は開始前に固定し、学習中に切り替えない。
4. **CEFR 横断化:** CEFR は全目的の word-level タグであり、特定目的だけの進行軸にしない。
5. **手動マーキング:** 卒業感はユーザーがつける。システムは正誤で自動昇格させない。
6. **完全一致:** スペル / IPA は完全一致のみ。AI 判定や惜しさ表示は使わない。
7. **AI クローラビリティ:** 重要コピー、思想説明、footer 導線は DOM 上に常時存在させる。
8. **視覚言語トークン化:** Phase 1-A で色・タイポ・余白・角丸・影・状態をトークンへ分離する。

### 1.2 14 frame の役割

| Frame | 名称 | 実装上の責務 |
|---|---|---|
| 1 | Top hero | タグライン、短い思想説明、主要 CTA |
| 2 | Purpose cards | 4 目的カードを同列に提示 |
| 8z | Learning profile | アクセント、CEFR、目的別プリセット、詳細条件、開始 |
| 3 | Pronounce drill | IPA/TTS から綴りを入力 |
| 4 | Write drill | 単語/TTS から IPA を入力 |
| 5 | Vocab drill | 音声と IPA から意味を確認し手動チェック |
| 6 | Connected drill | 連結 IPA / 弱形 IPA から元表現を入力 |
| 7 | Reveal | 正解、IPA、gloss、反対アクセント、マーキング |
| 8 | Summary | セッション完了、手動チェック状態、次導線 |
| 8e | Onboarding | 初回 4 スライドガイド |
| 9 | Vocab browser | Words / Phrases の参照閲覧 |
| 10 | Guide / About | 使い方・思想説明 |
| 11 | Footer support | Feedback / Terms / Privacy / X |
| 12 | Desktop layout | PC 幅でのカード配置・支援導線 |

Frame 番号は設計上の参照名であり、実装 ID は Phase 1-A〜1-H の各 Issue で確定する。

---

## 2. 画面別設計

### 2.1 Top hero / Purpose cards

- 日本語の最上位コピーは「音を、美しく。」。
- 英語版は “Retune your English. From sound up.”。
- 4 目的カードは視覚的優先度を同等にする。
- 各カードは以下の情報だけを持つ。
  - 目的名
  - 1 行説明
  - どの入力をするか
  - 代表的な学習成果
- Mode A/B、Decode/Encode などの内部名は補助説明や data 属性に閉じる。

### 2.2 Learning profile `8z`

`8z` は Phase 1 UX のゲートである。目的カードから直接ドリルへ進めず、必ずプロフィールを確認する。

| UI ブロック | 設計意図 | 実装メモ |
|---|---|---|
| Purpose summary | 何を始めるかを再確認 | 目的カード名と短文 |
| Accent | GA/RP を固定 | `app_accent` 既存値を初期値に利用 |
| CEFR | 出題語彙レベルを複数選択 | word-level タグの filter 入力 |
| Preset | 目的ごとの初期条件 | Phase 1-0-b で具体化 |
| Detailed settings | 旧「詳しい設定」の 12 パラメータを集約 | Phase 1-0-b で棚卸し |
| Start | そのまま開始 / 変更して開始 | Local Storage へ前回値を保存 |

### 2.3 Drill shell

全ドリルで同じ shell を使う。

- Header: app brand、GA/RP バッジ、Guide、Menu。
- STEP 行: `現在 / 合計`、目的名、語彙 CEFR タグ。
- Content: 目的ごとの主タスク。
- Inline chips: セッション内条件を静かに表示。独立絞り込み画面は持たない。
- Footer: in-play 中は主タスクを邪魔しない配置にする。

### 2.4 Pronounce drill

旧 Decode 相当。

1. IPA と TTS を表示する。
2. 必要に応じて反対アクセント行を表示する。
3. ユーザーが英単語を入力する。
4. 完全一致なら OK、それ以外は NG。
5. Reveal で正解、gloss、IPA、マーキングを表示する。

### 2.5 Write drill

旧 Encode 相当。

1. 英単語と TTS を表示する。
2. 選択アクセントに対応した IPA キーボードを表示する。
3. ユーザーが IPA を組み立てる。
4. 強勢を含む IPA 完全一致なら OK、それ以外は NG。
5. Reveal で正解 IPA、差分支援、マーキングを表示する。

### 2.6 Vocab drill

旧 Study 相当。

1. TTS を再生し、IPA を表示する。
2. ユーザーが「意味を確認する」を押す。
3. 単語、gloss、必要なら英語定義を表示する。
4. 自動採点はしない。
5. ユーザーが手動チェック 0–3 を更新する。
6. 次へ進む。

### 2.7 Connected drill

Connected Speech と Weak forms を統合する。

- Type: linking / assimilation / elision / weak をインラインチップで表示・変更する。
- Level: L1–L3 をインラインチップで表示・変更する。
- 連結句は元フレーズ入力、弱形は機能語入力。
- 連結句 TTS は Track A では GA 固定。
- 弱形 TTS は GA/RP を選択アクセントに追従させる。

### 2.8 Reveal / Summary

Reveal は採点結果を大きく見せる場所ではなく、次に学ぶための支援画面である。

| 要素 | 内容 |
|---|---|
| Correct answer | 単語または元フレーズ |
| IPA | 選択アクセントの IPA、必要なら反対アクセント |
| Gloss / definition | 現在 UI 言語の語義、必要なら英語定義 |
| Marking | 目的ごとの手動チェック 0–3 |
| Next action | 次へ / Summary / Menu |

Summary はセッション完了と次の導線を示す。スコア競争ではなく、今回触れた音・語・チェック状態を振り返る。

### 2.9 Onboarding `8e`

4 スライド構成:

1. IPA Sound Drill が何をするアプリか。
2. 4 目的カードの選び方。
3. プロフィールで GA/RP と CEFR を固定する理由。
4. 手動チェック 0–3 の使い方。

スキップも完了扱い。再表示はヘッダーのガイドアイコンから行う。

### 2.10 Vocab browser / Support screens

語彙ブラウザは学習の補助画面として残す。目的カードから切り離された参照閲覧であり、ドリル中でも戻れる。Footer の Feedback / Terms / Privacy / X と「このアプリについて」は、JS 実行前でも存在する DOM として配置する。

---

## 3. データ・状態設計

### 3.1 プロフィール状態

Phase 1-C で最終キー名を確定するが、設計上は以下の構造を想定する。

```jsonc
{
  "purpose": "pronounce",
  "accent": "ga",
  "cefrLevels": ["A1", "A2"],
  "preset": "default",
  "filters": {
    "phonemeFocus": "all",
    "spellingType": "all",
    "connectedType": "all",
    "connectedLevel": [1, 2, 3]
  }
}
```

12 パラメータの具体リスト、旧状態からのマッピング、保存キー名は Phase 1-0-b Recon で確定する。

### 3.2 マーキング状態

```jsonc
{
  "mark:pronounce:word_id": 2,
  "mark:write:word_id": 1,
  "mark:vocab:word_id": 3,
  "mark:connected:phrase_id": 0
}
```

- 値は 0–3。
- 0 は保存しない運用も可。実装方針は Phase 1-C で確定。
- 旧 `ept_checks_v1` の d/e/l は Phase 1 の目的 ID へ移行または読み替える。

### 3.3 CEFR と pool

- word-level `cefr` を出題候補の primary metadata として扱う。
- プロフィールの `cefrLevels` と目的別条件で pool を作る。
- 未タグ語を暗黙に含めない。含める必要がある場合は Phase 1-0-b で明示ルールを追加する。
- CEFR タグは各カードに表示するが、学習者に「次の級へ解放」という進行を見せない。

### 3.4 GA/RP と TTS

- `accent` はセッション開始時に確定し、ドリル中は immutable として扱う。
- 単語 TTS は `accent=ga|rp`。
- 連結句 TTS は Track A では GA 固定。
- 弱形 TTS は `accent=ga|rp`。
- `ga_rp_same` が true の場合は反対アクセント行を「同じ」表現にする。

---

## 4. 視覚言語設計（Phase 1-A）

本 Issue では具体トークン値を決めない。Phase 1-A で以下をトークン化する。

| 領域 | トークン化対象 |
|---|---|
| Color | 背景、本文、アクセント、成功、注意、境界 |
| Typography | 見出し、本文、IPA、補助テキスト |
| Spacing | セクション間、カード内余白、フォーム間隔 |
| Radius | カード、ボタン、チップ、モーダル |
| Shadow | カード浮き、フォーカス、オーバーレイ |
| Components | Button、Card、Chip、Badge、Input、Stepper、Marking |

トークンは既存 CSS 変数を拡張する形を優先し、ハードコード色・サイズの追加は避ける。

---

## 5. 実装分割メモ

| Phase | 内容 | 主な対象 |
|---|---|---|
| 1-0-a | 本 Issue。PURPOSE / SPECIFICATION / DESIGN / LAUNCH-CHECKLIST の先行改訂 | docs |
| 1-0-b | 画面 × データマッピング Recon | docs/cursor/recon |
| 1-A | 視覚言語トークン基盤 | CSS / tokens |
| 1-B | トップページ / 目的カード | `src/index.template.html` |
| 1-C | 学習プロフィール `8z` | UI + Local Storage |
| 1-D | ドリル本体 | 4 目的カードのランタイム |
| 1-E | 支援画面 | Vocab browser / Guide / Footer |
| 1-F | オンボーディング | `8e`, LS flag |
| 1-G | 多言語 | i18n 6 言語 |
| 1-H | PC 版 | responsive layout |

---

## 6. 非対象・保留

- 本 Issue では `src/index.template.html` を変更しない。
- Runtime data contract ファイルを変更しない。
- 12 パラメータの具体リスト化は Phase 1-0-b。
- LS マイグレーション実装は Phase 1-C。
- 多言語文言追加は Phase 1-G。
- React 化、BE 移管、BYOK、Sentry は Track B。

---

## 7. 実装状況（2026-07-18 時点）

| 項目 | 状態 |
|---|---|
| 旧 Decode / Encode / Study / Connected | 実装済み。Phase 1 で目的カードへ再配置予定 |
| GA/RP IPA・TTS | 実装済み。Phase 1 でセッション固定へ変更予定 |
| CEFR データ | 実装済み。Phase 1 で全目的横断へ整理 |
| 語彙ブラウザ | 実装済み。Phase 1-E で支援画面へ再配置 |
| 手動進捗チェック | 実装済み。Phase 1 で目的別マーキングへ整理 |
| オンボーディング | 未実装。Phase 1-F |
| 視覚言語トークン | 未実装。Phase 1-A |
| Phase 1 UI 実装 | 未着手。Phase 1-A 以降 |
