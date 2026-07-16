---
id: pj-2026-07-09-fe47
aliases:
- pj-2026-07-09-fe47
title: 連結音 TTS（脱落・連結）— Claude 相談用ブリーフ
created: '2026-07-09'
---

# 連結音 TTS（脱落・連結）— Claude 相談用ブリーフ

> 作成日: 2026-07-07  
> 目的: 連結音ドリルで **IPA と音声が一致しない**問題について、今後の対応方針を Claude と検討するための材料。  
> リポジトリ: `nkhippo/IPASoundDrill`（GitHub Pages 静的アプリ + GAS TTS プロキシ）

---

## 1. 問題の要約

| 項目 | 内容 |
|------|------|
| **症状** | 連結音モードで再生する TTS が、画面上の IPA と聞こえが一致しない |
| **代表例 A** | `lots of time` — IPA `/ˈlɑtsəˈtaɪm/`（`of`→schwa、/v/ 脱落）なのに、耳では `/v/` または f 様の音が残る |
| **代表例 B** | `tell him` — IPA `/ˈtɛlɪm/`（h 脱落・連結）なのに、`/ˈtɛl/` と `/ɪm/` がわずかに区切れて聞こえる |
| **学習上の影響** | 脱落・連結ドリルで「聞いた音」と「書くべき IPA」が食い違い、学習者が混乱する |
| **データ側の判断** | IPA・ルール文言は意図どおり。**問題は TTS 生成側（A: 音声≠IPA）** と判断済み。ガイドや IPA データの誤り（B）ではない |

### 再現条件（`lots of time`）

| 設定 | 値 |
|------|-----|
| 学習モード | IPA読み書き |
| 練習モード | 連結音 |
| 難易度 | **中級 (L2)** — 初級プールには含まれない |
| 型 | **脱落 (elision)** |
| データ ID | `cs044`（`data/connected_speech.json`） |

---

## 2. アプリ構成（TTS まわり）

```text
ブラウザ (index.html)
  └─ fetch GAS_TTS_URL
       └─ Google Apps Script (gas/Code.gs)
            ├─ Google Drive キャッシュ (IPA-TTS-Audio/)
            └─ OpenAI Audio API
                 model: gpt-4o-mini-tts
                 voice: alloy
```

### エンドポイント種別

| 種別 | クエリ例 | OpenAI `input` | 用途 |
|------|----------|----------------|------|
| 単語 | `?word=luck&accent=ga` | 綴り `luck` | 語彙ドリル（辞書形） |
| 弱形 | `?weak=/kən/&ww=can&accent=ga` | **IPA** `/kən/` | 弱形タブ |
| 連結句 | `?phrase=lots+of+time&phrase_ipa=/ˈlɑtsəˈtaɪm/&accent=ga` | **IPA**（`phrase_ipa` あり時） | 連結音タブ |

### 連結句の規模

| 項目 | 数 |
|------|-----|
| 連結句総数 | 201 句（`connected_speech.json`） |
| 脱落 (elision) | 69 句 |
| `of→/ə/` ルール（子音前） | 約 30 句 |
| 弱形（別タブ） | 36 語 |

連結句 TTS は **GA 固定**（`accent=ga`）。RP 連結音 TTS は未実装。

### キャッシュ

| 層 | 連結句のキー | 現行バージョン |
|----|-------------|----------------|
| Google Drive | `lots_of_time__ga_v4.mp3` | `TTS_CONNECTED_CACHE_VER = v4` |
| localStorage | `ipa_tts_v2:ga:p4_lots_of_time` | クライアント側 `p4_` プレフィックス |
| 旧 v2/v3 | 別ファイル名のため理論上は未使用 | 手動削除も実施済み（`lots of time`） |

---

## 3. 試した対策と結果

### フェーズ 1 — プロンプト強化（綴り入力のまま）

- `TTS_CONNECTED_INSTRUCTIONS` に脱落・連結・h 脱落を明示
- 例: `"lots of time" → lotsətime`、`tell him` → tellim、語間 pause 禁止
- 連結句キャッシュ `v3` に bump
- **結果**: `lots of time` は変わり映えなし。curl で `source: openai`（新規生成）でも改善せず

### フェーズ 2 — IPA 入力（弱形と同型）

- GAS に `phrase_ipa` パラメータ追加
- `phrase_ipa` あり時: OpenAI `input` = IPA、`TTS_CONNECTED_IPA_INSTRUCTIONS` を使用
- クライアント `speakOptsForItem` から `activeIpa(c)` を自動送信
- 連結句キャッシュ `v4`、localStorage `p4_` に bump
- **結果**: デプロイ・URL 更新・Drive 再生成後も、ユーザー報告では **まだ変わらない**

### 検証済み API 呼び出し（デプロイ URL 直叩き）

```http
GET .../exec?phrase=lots%20of%20time&phrase_ipa=%2F%CB%88l%C9%91ts%C9%99%CB%88ta%CA%8Am%2F&accent=ga
→ ok: true, source: openai（初回）
```

### 弱形 TTS との対比

弱形（例: `can` → `/kən/`）は **IPA 入力 + 専用 instructions** で比較的うまくいっている印象。  
連結句だけ IPA 入力に切り替えても、多音節フレーズではモデルが綴り・辞書形に引き戻される可能性がある。

---

## 4. 現行プロンプト（抜粋）

### `TTS_CONNECTED_IPA_INSTRUCTIONS`（現行・v4）

```text
Pronounce this English phrase exactly as the IPA transcription indicates, in a clear
General American accent. Follow every phoneme, stress mark, and reduction in the IPA —
including schwa, elision, linking, and assimilation. Deliver as one smooth connected
utterance with no pause between words. Do not spell the IPA symbols aloud, do not add
words, and do not use citation forms that contradict the IPA.
```

### 弱形（参考・うまくいっている側）

```text
Pronounce this English function word using its WEAK (reduced) form exactly as the IPA
indicates ... Do NOT use the strong citation form.
```

---

## 5. 仮説（なぜ IPA 入力でも直らないか）

| # | 仮説 | 補足 |
|---|------|------|
| H1 | **gpt-4o-mini-tts は IPA 文字列を「読み上げ指示」として解釈できない** | 弱形は 1 語・短いので偶然近いが、フレーズは綴り `phrase` パラメータの存在や学習バイアスで上書きされる？（※ GAS 実装では `input` は IPA のみ） |
| H2 | **OpenAI TTS の `instructions` は音韻制御として弱い** | プロンプトエンジニアリングの上限に達している |
| H3 | **schwa `/ə/` と `/v/` の区別がモデル・声質（alloy）で再現困難** | 聞き手が「変わらない」と感じる閾値の問題もあり得る |
| H4 | **クライアントが古いキャッシュを再生している** | `p4_` / `v4` bump 後も、別タブ・Service Worker・手動キャッシュ残存の可能性（要ブラウザ側確認） |
| H5 | **IPA 表記とモデルが期待する入力形式のミスマッチ** | 例: `/ˈlɑtsəˈtaɪm/` ではなく口語表記 `lotsa time` / SSML / 別 API の方が効く |
| H6 | **201 句一括の品質より、代表句の根本解決が先** | バッチ warm や全句事前生成は、方針確定後でよい |

---

## 6. Claude に相談したいこと

### 6.1 方針の優先順位

以下の選択肢（または組み合わせ）について、**コスト・実装難度・201 句スケール・学習効果**の観点で推奨順をつけてほしい。

| 案 | 概要 |
|----|------|
| **A** | OpenAI TTS のまま、入力・instructions の再設計（例: IPA ではなく `lotsa time` 等の口語綴り、例文付き few-shot instructions） |
| **B** | TTS モデル / voice 変更（`gpt-4o-mini-tts` 以外、`alloy` 以外） |
| **C** | **別 TTS プロバイダ**（Google Cloud TTS SSML、Amazon Polly、ElevenLabs 等）で音素・脱落を制御 |
| **D** | **事前録音 or 人力生成**（代表句のみ / 全 201 句）を Drive にホストし、OpenAI はフォールバックのみ |
| **E** | **ハイブリッド**: 脱落 30 句 + 問題のある連結句だけ別ルート、他は現行 TTS |
| **F** | **学習 UX の変更**: 音声と IPA の完全一致を求めない（「参考音声」「実際は地域差あり」注記、比較聴取 UI） |
| **G** | OpenAI の別 API（音声ではなくテキスト経由の別パイプライン）や phoneme 対応サービスの調査 |

### 6.2 技術的な具体質問

1. **IPA を `input` に渡す設計**は、gpt-4o-mini-tts に対して合理的か？ 推奨される代替入力形式は？
2. `lots of time` 向けに、**1 フレーズで効果検証できる最小実験**（パラメータ行列）を提案してほしい
3. 弱形は成功・連結句は失敗、の差をどう説明するか（入力長、語数、ストレス記号の影響など）
4. **30 句の `of→/ə/` 脱落**を一括 QA する現実的な手順（自動化の可否）
5. GAS + Drive キャッシュ構成を維持したまま、**品質ゲート**（例: 生成後に別 API で検証、不合格は再生成）は現実的か

### 6.3 プロダクト判断

1. 連結音ドリルで **「IPA と音声の完全一致」は必須要件か**、それとも許容誤差を設けるべきか
2. 完全一致を目指す場合、**OpenAI TTS 継続の合理的上限**はどこか（打ち切り基準）
3. コスト感: 201 句 × 再生成回数 × ユーザー数 — 事前バッチ生成 vs オンデマンドの勧め

---

## 7. 制約・非制約

### 制約

- 静的サイト（GitHub Pages）+ クライアント JS。サーバーは **GAS のみ**（現状）
- OpenAI API キーは GAS Script Properties に保持（クライアント露出なし）
- 単語 TTS（約 3,059 語）は現行 OpenAI で運用中。品質は概ね良好
- 連結句は GA のみ。RP 連結はスコープ外（今回）
- ユーザーは日本語 UI。ドリル内容は英語 IPA

### 緩和可能

- GAS 以外のバックエンド追加（Cloud Functions 等）— 要コスト・運用判断
- 代表句のみ手動音声 — 小規模なら可
- 全 201 句の事前生成バッチ — `BatchWarm.gs` パターンは単語用に存在
- TTS プロバイダ追加 — API キー管理・課金の設計が必要

---

## 8. 関連ファイル

| パス | 内容 |
|------|------|
| `gas/Code.gs` | TTS プロキシ、`phrase_ipa`、instructions、Drive キャッシュ |
| `index.html` | `GAS_TTS_URL`、`fetchAudioFromGas`、`speakOptsForItem`、localStorage `p4_` |
| `data/connected_speech.json` | 201 連結句、IPA、`cs_rule`、`cs_type` |
| `gas/README.md` | デプロイ手順、キャッシュ命名 |
| `gas/BatchWarm.gs` | 単語 GA 一括 warm（連結句用は未整備） |

### 現行 GAS デプロイ URL（2026-07-07）

```text
https://script.google.com/macros/s/AKfycbya7_gej4GlOoeaORxO8fYm6auwtG3qhtbGZtw2ZR8dlyTFtaW6D2JcHJVyyMcCB8Ga/exec
```

### 関連コミット（main）

| コミット | 内容 |
|----------|------|
| `cf37a4f` | 連結プロンプト強化 + phrase cache v3 |
| `be9beb5` | `phrase_ipa` 導入 + cache v4 |
| `4453baf` | 上記 GAS URL を `index.html` に反映 |

---

## 9. 期待する Claude のアウトプット

1. **推奨方針 1 つ（または段階的ロードマップ）** — 理由付き
2. **`lots of time` / `tell him` 向けの検証手順** — 1〜2 時間で試せる粒度
3. **OpenAI TTS 継続 vs 切り替えの判断基準**
4. （任意）instructions / input 文面の具体的改善案
5. （任意）201 句スケールでの QA・バッチ戦略

---

## 10. 補足 — ユーザーが聞き分けている内容

- `lots of time`: `/v/` または f に近い摩擦が **残っている**（完全な schwa 連結 `lotsətime` ではない）
- `tell him`: 大きな区切りではないが、**テル と イム が独立して聞こえる**（`/ˈtɛlɪm/` の一語感がない）

どちらも「ネイティブの連結音としては許容範囲だが、**IPA ドリル教材としては不一致**」という位置づけ。

---

## 11. Claude への依頼文（コピペ用）

```text
英語発音トレーナーアプリの連結音 TTS について相談です。
添付の「cursor-connected-speech-tts-consultation.md」を読んだうえで、
以下を教えてください。

1. lots of time（/ˈlɑtsəˈtaɪm/）と tell him（/ˈtɛlɪm/）で IPA と音声が一致しない問題への推奨対応方針
2. OpenAI gpt-4o-mini-tts + IPA input を継続すべきか、別手段に切り替えるべきかの判断基準
3. 201 連結句全体を扱う場合の現実的なロードマップ（コスト・品質・運用）
4. すぐ試せる検証実験（パラメータ・入力形式・プロンプト）

リポジトリ構成は MD 内の通りです。実装は Cursor が担当します。
```
