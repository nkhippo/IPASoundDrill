---
id: pj-2026-07-07-658f
aliases:
- pj-2026-07-07-658f
title: Cursor 指示書 — 連結音 TTS A/B テスト実験環境の構築
created: '2026-07-07'
---

# Cursor 指示書 — 連結音 TTS A/B テスト実験環境の構築

> 作成日: 2026-07-07
> 対象リポジトリ: `nkhippo/IPASoundDrill`（`main` ブランチ）
> 独立性: Phase 0-b（CEFR UI）や zh 分離の実装状況とは無関係に着手可能
> ゴール: 連結音 TTS の品質改善方針を確定するための A/B 実験環境を構築。GAS に voice/speed 実験パラメータを追加（下位互換保持）、静的リスナーページで Naoya が耳検証できる状態にする。

---

## 0. 背景（着手前の必読）

### 問題

連結音ドリルで生成される TTS が、IPA 上の脱落・連結を反映せず citation form に近い発話になっている。追加観察として:

- **話速が遅い**（全体的にゆっくり）
- **単語境界でポーズが入る**（例: `blind spot` で明らかな間）
- Linking は早く話す tempo で自然に発生する現象なので、tempo/連続性の改善が本質的な対策

### 仮説（この A/B テストで検証したい）

1. **voice を変えると連続性/tempo が改善するか?** 現行 `alloy` は明瞭さ preference が強い可能性
2. **`speed` パラメータ（OpenAI TTS API の 0.25-4.0）を 1.0 → 1.15-1.25 に上げると linking が自然に発生するか?**
3. **instructions で "rapid, casual, connected" を明示すると効果があるか?**
4. **上記が効いた上で残る脱落問題（`lots of time` の /v/、`tell him` の /h/）に、疑似綴り（"lotsa time", "tellim"）を input に渡すと改善するか?**

### この指示書のスコープ

- production 動作を壊さない実験環境の構築のみ
- 実際のパラメータ最終決定は、Naoya の耳検証結果を Claude が分析後、別指示書で対応

### 非スコープ

- production の連結音 TTS 挙動の変更（デフォルト動作は一切変えない）
- 全 201 句のバッチ再生成
- 単語 TTS への影響（連結句のみ対象）

---

## 1. 作業内容

### 1-1. GAS Code.gs への実験パラメータ追加

`gas/Code.gs` を改修し、以下 3 つの optional パラメータを受け入れられるようにしてください。**パラメータが渡されない場合は現行動作を完全維持**します（下位互換）。

- `voice` — OpenAI TTS の voice 名（デフォルト現行の `alloy`）
- `speed` — OpenAI TTS の speech speed（デフォルト現行の未指定 = 1.0）
- `instr_variant` — instructions のプリセット選択（デフォルト現行の `current`）

#### 1-1-1. パラメータの受け入れ

`doGet(e)` の中で、既存の `phrase` / `phrase_ipa` / `accent` 等のパラメータ抽出と同じパターンで以下を追加:

```javascript
var voice = (e.parameter.voice || "").trim();
var speedRaw = (e.parameter.speed || "").trim();
var instrVariant = (e.parameter.instr_variant || "").trim();
```

#### 1-1-2. voice のバリデーション

以下の許可リストを実装 (`ALLOWED_VOICES` 定数として上部に):

```javascript
var ALLOWED_VOICES = [
  "alloy", "nova", "onyx", "echo", "fable", "shimmer",
  "sage", "coral", "ash", "ballad", "verse"
];
```

未知の voice が渡された場合は現行の `alloy` にフォールバック（エラーを返さない、下位互換のため）。

#### 1-1-3. speed のバリデーション

```javascript
var speed = 0;
if (speedRaw) {
  var parsed = parseFloat(speedRaw);
  if (!isNaN(parsed) && parsed >= 0.5 && parsed <= 2.0) {
    speed = parsed;
  }
}
```

範囲外や NaN の場合は 0（未指定扱い、現行動作）。

#### 1-1-4. instructions プリセット

`Code.gs` の上部（既存の `TTS_CONNECTED_INSTRUCTIONS` / `TTS_CONNECTED_IPA_INSTRUCTIONS` の付近）に以下を追加:

```javascript
// Experimental instruction variants for A/B testing.
// Selected via ?instr_variant= URL parameter. Falls back to the current
// production instructions when absent or unknown.
var TTS_INSTR_VARIANTS = {
  "current": null,  // sentinel; use existing production instructions
  "rapid_casual": "Deliver this English phrase in rapid, casual, connected speech in a General American accent. Do not pause between words. Link consonants to following vowels naturally. Speak at a fast conversational pace — faster than dictation, closer to how a native speaker chats with a friend. Do not use citation forms.",
  "min_instr": "Speak this English phrase naturally in General American, at conversational pace, as one connected utterance.",
  "tempo_emphasis": "Speak this English phrase rapidly and connectedly in General American. Prioritize connected speech (linking, elision, weak forms) over word-by-word clarity. Do not pause between words."
};
```

#### 1-1-5. OpenAI API 呼び出しの改修

現行の OpenAI API 呼び出し（`UrlFetchApp.fetch("https://api.openai.com/v1/audio/speech", ...)`）の payload 構築部分を改修:

```javascript
// Build payload. All experimental parameters are OPT-IN; when the URL
// omits them the payload stays byte-identical to the current production
// version, so existing cached files remain valid.
var payload = {
  model: OPENAI_MODEL,
  voice: (voice && ALLOWED_VOICES.indexOf(voice) >= 0) ? voice : "alloy",
  input: ttsInput,
  response_format: "mp3"
};

// Only add speed if explicitly set — keeps default request compatible
// with existing cached files.
if (speed > 0) {
  payload.speed = speed;
}

// Select instructions variant. Absent/unknown → current production behavior.
var variantInstr = null;
if (instrVariant && TTS_INSTR_VARIANTS.hasOwnProperty(instrVariant)) {
  variantInstr = TTS_INSTR_VARIANTS[instrVariant];  // may still be null for "current"
}
var effectiveInstr = variantInstr !== null ? variantInstr : /* current production instructions selection */;
if (effectiveInstr) {
  payload.instructions = effectiveInstr;
}
```

上記のコメント `/* current production instructions selection */` の部分は、既存コードで phrase 経路と phrase_ipa 経路を選んでいるロジックをそのまま使ってください（変更しないこと）。

#### 1-1-6. Drive キャッシュキーの改修

現行のキャッシュキーは `{safe_phrase}__{accent}_v4.mp3` の形式ですが、実験パラメータを付けたら別キャッシュにする必要があります。**production 経路（パラメータなし）は現行キーを維持**します:

```javascript
function buildCacheKey(safePhrase, accent, voice, speed, instrVariant) {
  var base = safePhrase + "__" + accent;

  // Production request → keep the existing v4 key so cached files remain valid.
  var isProduction = (!voice || voice === "alloy")
                  && (!speed || speed <= 0)
                  && (!instrVariant || instrVariant === "current");
  if (isProduction) {
    return base + "_v4.mp3";
  }

  // Experimental request → suffix with parameter tag to isolate the cache.
  var tag = "exp";
  if (voice && voice !== "alloy") tag += "_v-" + voice;
  if (speed && speed > 0) tag += "_s-" + Math.round(speed * 100);
  if (instrVariant && instrVariant !== "current") tag += "_i-" + instrVariant;
  return base + "__" + accent + "_" + tag + ".mp3";
}
```

これを既存のキャッシュキー構築部分に置き換えてください。production 側のキーは絶対に変わらないので、既存キャッシュがそのまま利用可能です。

#### 1-1-7. レスポンスヘッダに実験パラメータ情報を追加

デバッグ用に、JSON レスポンスの `meta` フィールドに使用したパラメータを含めてください（既存の `source: openai|cache` の隣に追加）:

```javascript
var meta = {
  source: sourceLabel,  // "openai" | "cache"
  voice: (voice && ALLOWED_VOICES.indexOf(voice) >= 0) ? voice : "alloy",
  speed: speed > 0 ? speed : 1.0,
  instr_variant: (instrVariant && TTS_INSTR_VARIANTS.hasOwnProperty(instrVariant)) ? instrVariant : "current"
};
```

これで A/B テスト側で「本当にリクエスト通りのパラメータが使われたか」を検証できます。

### 1-2. A/B テスト用リスナーページの新規作成

`tests/tts-ab-listener.html` を新規作成してください。以下の要件を満たす単一 HTML ファイル（外部 JS/CSS 不要、CDN 不要）:

#### 1-2-1. 表示内容

- ページタイトル: "TTS A/B Listener — Connected Speech Experiment"
- テスト対象句 6 句（フェーズ 1 の候補、後述）
- 各句について複数の variant を並べ、audio 要素で再生可能
- 各 variant の下に「連続性」「話速自然さ」「脱落再現」の 3 軸で 1-5 のラジオボタン
- ページ下部に「結果をコピー」ボタン（localStorage に保存された全評価を JSON でクリップボードにコピー）
- ページ下部に「結果を Naoya が Claude に貼り付ける」旨の説明

#### 1-2-2. テスト対象 6 句

Naoya の観察と本指示書の背景に基づき、以下の 6 句を対象にします:

| 句 | 主な問題 | 参照 IPA |
|---|---|---|
| `blind spot` | word boundary pause（Naoya 直接観察） | `/blaɪndspɑt/`（連結） |
| `lots of time` | of /v/ 脱落 | `/ˈlɑtsəˈtaɪm/` |
| `tell him` | h 脱落 + 連結 | `/ˈtɛlɪm/` |
| `a lot of` | of /v/ 保持 + 連結（linking の対照ケース） | `/əˈlɑɾəv/` |
| `next time` | 同化 + 連結 | `/ˈnɛkstaɪm/` or `/ˈnɛksˈtaɪm/` |
| `going to` | 弱形融合（gonna 化はしない、連結のみ） | `/ˈɡoʊɪŋtu/` |

これらを HTML の JavaScript 定数として持ちます:

```javascript
const TEST_PHRASES = [
  { id: "cs_blind_spot", phrase: "blind spot", ipa: "/blaɪndspɑt/" },
  { id: "cs_lots_of_time", phrase: "lots of time", ipa: "/ˈlɑtsəˈtaɪm/" },
  { id: "cs_tell_him", phrase: "tell him", ipa: "/ˈtɛlɪm/" },
  { id: "cs_a_lot_of", phrase: "a lot of", ipa: "/əˈlɑɾəv/" },
  { id: "cs_next_time", phrase: "next time", ipa: "/ˈnɛkstaɪm/" },
  { id: "cs_going_to", phrase: "going to", ipa: "/ˈɡoʊɪŋtu/" }
];
```

#### 1-2-3. Variant マトリクス（フェーズ 1: 8 variant / 句）

各句について以下 8 variant を並べます:

| # | ラベル | voice | speed | instr_variant | input 形式 |
|---|---|---|---|---|---|
| 1 | Production (baseline) | `alloy` | 1.0 | `current` | phrase_ipa |
| 2 | alloy + speed 1.15 | `alloy` | 1.15 | `current` | phrase_ipa |
| 3 | nova default | `nova` | 1.0 | `current` | phrase_ipa |
| 4 | nova + speed 1.15 | `nova` | 1.15 | `current` | phrase_ipa |
| 5 | sage default | `sage` | 1.0 | `current` | phrase_ipa |
| 6 | ash default | `ash` | 1.0 | `current` | phrase_ipa |
| 7 | alloy + rapid_casual instr | `alloy` | 1.0 | `rapid_casual` | phrase_ipa |
| 8 | nova + speed 1.15 + rapid_casual | `nova` | 1.15 | `rapid_casual` | phrase_ipa |

合計 6 句 × 8 variant = **48 mp3**。Naoya の耳検証時間は 30-45 分程度を想定。

これも JavaScript 定数で:

```javascript
const VARIANTS = [
  { id: "v1_baseline",         voice: "alloy", speed: 1.0,  instr: "current",      label: "Production baseline" },
  { id: "v2_alloy_s115",       voice: "alloy", speed: 1.15, instr: "current",      label: "alloy + speed 1.15" },
  { id: "v3_nova",             voice: "nova",  speed: 1.0,  instr: "current",      label: "nova default" },
  { id: "v4_nova_s115",        voice: "nova",  speed: 1.15, instr: "current",      label: "nova + speed 1.15" },
  { id: "v5_sage",             voice: "sage",  speed: 1.0,  instr: "current",      label: "sage default" },
  { id: "v6_ash",              voice: "ash",   speed: 1.0,  instr: "current",      label: "ash default" },
  { id: "v7_alloy_rapid",      voice: "alloy", speed: 1.0,  instr: "rapid_casual", label: "alloy + rapid_casual instr" },
  { id: "v8_nova_s115_rapid",  voice: "nova",  speed: 1.15, instr: "rapid_casual", label: "nova + speed 1.15 + rapid_casual" }
];
```

#### 1-2-4. GAS URL の設定

HTML の上部に以下を定数化:

```javascript
const GAS_TTS_URL = "https://script.google.com/macros/s/AKfycbya7_gej4GlOoeaORxO8fYm6auwtG3qhtbGZtw2ZR8dlyTFtaW6D2JcHJVyyMcCB8Ga/exec";
```

これは 2026-07-07 現在の main の URL です。もし GAS 再デプロイでこの URL が変わっている場合、Naoya に確認して差し替えてください。

#### 1-2-5. audio 要素の生成

各 variant について、以下の URL を生成して `<audio controls>` の src に設定:

```javascript
function buildAudioUrl(phrase, ipa, variant) {
  const params = new URLSearchParams({
    phrase: phrase,
    phrase_ipa: ipa,
    accent: "ga",
    voice: variant.voice,
    speed: variant.speed.toString(),
    instr_variant: variant.instr
  });
  return `${GAS_TTS_URL}?${params.toString()}`;
}
```

**重要:** GAS TTS プロキシは JSON レスポンスではなく直接 mp3 バイナリを返します（既存動作を確認してください）。もし現行実装が JSON でラップしている場合は、audio 要素の src に直接使えないので、fetch → blob URL のパターンに変えてください。

#### 1-2-6. 評価入力 UI

各 variant の audio 要素の下に:

```html
<div class="rating">
  <label>連続性: 
    <input type="radio" name="{id}_continuity" value="1">1
    <input type="radio" name="{id}_continuity" value="2">2
    <input type="radio" name="{id}_continuity" value="3">3
    <input type="radio" name="{id}_continuity" value="4">4
    <input type="radio" name="{id}_continuity" value="5">5
  </label>
  <label>話速自然さ: (same pattern)</label>
  <label>脱落再現: (same pattern)</label>
  <textarea placeholder="コメント（任意）"></textarea>
</div>
```

localStorage に自動保存（キー: `tts_ab_v1_{variant_id}_{phrase_id}_{axis}`）。

#### 1-2-7. 「結果をコピー」ボタン

ページ下部に大きなボタンを配置。クリックで全評価を以下 JSON 形式でクリップボードにコピー:

```json
{
  "schema": "tts-ab-listener-v1",
  "date": "2026-07-08",
  "evaluations": [
    {
      "phrase_id": "cs_blind_spot",
      "phrase": "blind spot",
      "variant_id": "v1_baseline",
      "variant_label": "Production baseline",
      "continuity": 3,
      "naturalness": 4,
      "elision_accuracy": 3,
      "comment": ""
    },
    ...
  ]
}
```

未評価の項目（ラジオボタン未選択）は含めない。

#### 1-2-8. スタイリング

最小限の CSS で以下を実現:

- スマホでも見やすいレスポンシブ（各 variant を縦積み）
- variant 間の視覚的な区切り（枠線 + 若干のマージン）
- ラジオボタンをタップしやすい大きさ（モバイル最適化）
- Naoya は複数デバイス（Mac / Windows / iPhone）で使用予定なので、外部依存なし・自己完結

### 1-3. README.md の追加

`tests/README.md` を新規作成し、使い方を記載:

````markdown
# TTS A/B Testing Environment

## `tts-ab-listener.html`

連結音 TTS の品質改善 A/B 実験用のリスナーページです。GAS TTS プロキシに voice/speed/instr_variant パラメータを渡して 8 つの variant を並列で聴き比べられます。

### 使い方

1. GitHub Pages で公開されているサイトの `/tests/tts-ab-listener.html` にアクセス
   - 例: `https://nkhippo.github.io/IPASoundDrill/tests/tts-ab-listener.html`
2. 各 variant を聴き、3 軸で評価
3. ページ下部の「結果をコピー」で JSON をクリップボードに
4. Claude に貼り付けて分析依頼

### ローカル実行

```bash
python3 -m http.server 8000
# ブラウザで http://localhost:8000/tests/tts-ab-listener.html
```

### 実験パラメータ

GAS Code.gs は以下 3 パラメータを受け入れます（下位互換、いずれも省略時は現行動作）:

- `voice` — OpenAI TTS voice（alloy/nova/onyx/echo/fable/shimmer/sage/coral/ash/ballad/verse）
- `speed` — 0.5-2.0（省略時 1.0）
- `instr_variant` — current / rapid_casual / min_instr / tempo_emphasis

### 実験用キャッシュ

実験パラメータ付きのリクエストは `_exp_v-{voice}_s-{speed*100}_i-{instr_variant}.mp3` サフィックスで Drive にキャッシュされます。production の `_v4.mp3` とは分離されているので、実験は本番動作に影響しません。

実験終了後、Drive の `_exp_*.mp3` ファイルは手動で削除可能です。
````

---

## 2. 検証手順

### 2-1. GAS デプロイ後の smoke test

`tests/README.md` に記載の GAS URL に対して以下を叩き、各パターンで期待通り動くこと:

```bash
# パラメータなし = production 動作（現行キャッシュを使用）
curl -o baseline.mp3 "GAS_URL?phrase=blind+spot&phrase_ipa=/blaɪndspɑt/&accent=ga"

# voice のみ変更
curl -o nova.mp3 "GAS_URL?phrase=blind+spot&phrase_ipa=/blaɪndspɑt/&accent=ga&voice=nova"

# speed のみ変更
curl -o s115.mp3 "GAS_URL?phrase=blind+spot&phrase_ipa=/blaɪndspɑt/&accent=ga&speed=1.15"

# instructions のみ変更
curl -o rapid.mp3 "GAS_URL?phrase=blind+spot&phrase_ipa=/blaɪndspɑt/&accent=ga&instr_variant=rapid_casual"

# 3 パラメータ全部
curl -o combo.mp3 "GAS_URL?phrase=blind+spot&phrase_ipa=/blaɪndspɑt/&accent=ga&voice=nova&speed=1.15&instr_variant=rapid_casual"
```

各 mp3 が正常に再生できること、`baseline.mp3` と `nova.mp3` で違う声が聞こえることを確認。

### 2-2. 本番動作への影響ゼロ確認（極めて重要）

本番連結音 TTS が実験改修の影響を受けていないこと:

```bash
# 現行 index.html が投げるリクエスト形式
curl -o current.mp3 "GAS_URL?phrase=lots+of+time&phrase_ipa=/ˈlɑtsəˈtaɪm/&accent=ga"
# → 既存の Drive キャッシュ (lots_of_time__ga_v4.mp3) から返る
# → 音声は改修前と同一
```

Drive を確認して、`lots_of_time__ga_v4.mp3` の最終更新日時が改修前のまま変わっていないこと（新規生成されていないこと）を確認してください。もし更新日時が変わっていたら production キャッシュキーが壊れているサインです。

### 2-3. リスナーページの動作

1. ローカルサーバー起動または GitHub Pages 反映後にアクセス
2. 6 句 × 8 variant = 48 個の audio 要素が表示されること
3. いくつかの variant を再生して音が出ること
4. ラジオボタンをクリックすると localStorage に保存されること（DevTools で確認）
5. ページ再読み込みして評価が復元されること
6. 「結果をコピー」でクリップボードに JSON が入ること

### 2-4. モバイルでの動作

スマホで開いてレイアウトが崩れないこと、audio 要素が正常に動作することを確認。

---

## 3. 実装レポートの記載事項

1. `git status` 出力
2. `gas/Code.gs` の主要変更 diff（voice / speed / instr_variant / cache key logic）
3. `tests/tts-ab-listener.html` の作成完了確認
4. `tests/README.md` の作成完了確認
5. 検証 2-1（smoke test）の 5 つの curl コマンドの実行結果
6. 検証 2-2（本番動作への影響ゼロ）の Drive 更新日時確認結果
7. GAS Web App の再デプロイと URL 更新の有無
8. Naoya がリスナーページにアクセスできる URL

---

## 4. Git コミット推奨単位

```
Commit 1: Add experimental voice/speed/instr_variant parameters to TTS proxy
  - gas/Code.gs (ALLOWED_VOICES, TTS_INSTR_VARIANTS, param handling,
    cache key isolation for experimental requests)

Commit 2: Add TTS A/B listener page for connected speech quality experiment
  - tests/tts-ab-listener.html
  - tests/README.md
```

必要に応じて GAS 再デプロイのコミット（`gas/README.md` 更新など）を追加。

---

## 5. トラブルシューティング

### GAS 再デプロイが必要な場合の手順

Code.gs を変更したら、Apps Script Editor で「デプロイ → デプロイを管理 → 現行デプロイの編集 → 新バージョン → デプロイ」を実施。URL が変わったら `tests/tts-ab-listener.html` の GAS_TTS_URL 定数と `index.html` の GAS_TTS_URL 定数の両方を更新すること（後者は production への影響あり、要注意）。

### `speed` パラメータが効かない

- OpenAI Audio API のドキュメントで gpt-4o-mini-tts が speed をサポートしているか確認
- 未対応の場合、payload から `speed` を落として `instructions` に "at speed 1.15x" のような自然言語で書く代替手段を検討

### 「結果をコピー」で JSON が空

- localStorage キー命名を DevTools で確認
- ラジオボタンの `name` 属性と ID の紐付けを再確認

### mp3 が再生できない（audio 要素で無音）

- GAS が JSON でラップしている可能性 → fetch → blob URL パターンに切り替え
- CORS ヘッダの問題 → GAS 側で `Access-Control-Allow-Origin: *` を返しているか確認（既存 production で動作している場合は問題なし）

---

## 6. Naoya への引き継ぎ事項（作業不要、記録のみ）

実装完了後、Naoya が以下を実施する予定です:

1. リスナーページで 48 mp3 を聞き比べ
2. 3 軸（連続性 / 話速自然さ / 脱落再現）で 1-5 評価
3. 「結果をコピー」で JSON を取得
4. Claude に貼り付けて分析依頼
5. 分析結果に基づき、フェーズ 2（top variant で instructions と input 形式の追加 A/B）or フェーズ 3（production 反映）に進む

実験結果が芳しくない場合（どの variant も許容水準に達しない場合）、段階 2（学習ガイドで「参照音声」割り切り）or 段階 3（別プロバイダ検討）へ移行します。

---

以上で A/B テスト実験環境の構築完了です。本指示書は Phase 0-b（CEFR UI 配線）や zh 分離とは独立に実行可能で、`index.html` を触りません（GAS Code.gs と新規テストページのみ）。
