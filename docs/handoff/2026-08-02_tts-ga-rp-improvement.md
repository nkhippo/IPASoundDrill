# Handoff: Issue #287 — TTS GA/RP 音声差改善

日付: 2026-08-02
Issue: https://github.com/nkhippo/IPASoundDrill/issues/287
Level: L3 × [C2, C5]

---

## 経緯

Naoya がドリル画面で GA/RP の音声を聴き比べ、rhoticity（`ɝ`/`ɚ` vs `ɜː`/`ə`）や GOAT 母音（`oʊ` vs `əʊ`）の差が聞き取れないと指摘。「音を学ぶアプリなので TTS で差が出ないなら改善したい」。

Naoya の方針: **TTS を最高品質にしたりプロンプトを改善することでなんとかしたい**（`ga_rp_same: true` に寄せるのではなく、聞こえるようにする方向）。

## 現行アーキテクチャ（調査済み）

### TTS エンジン
- **モデル**: `gpt-4o-mini-tts`（OpenAI Audio API 経由）
- **プロキシ**: GAS (`tools/tts/gas/Code.gs`)
- **voice**: `alloy`（GA/RP 共通）
- **GA/RP 分岐**: `instructions` テキストのみ。GA は "General American accent"、RP は "modern Received Pronunciation (standard Southern British) accent" と指定

### GA/RP Instructions（Code.gs L23-24）
- `TTS_INSTRUCTIONS_GA`: "...in a clear General American accent..."
- `TTS_INSTRUCTIONS_RP`: "...in a clear modern Received Pronunciation (standard Southern British) accent..."
- **差分は accent 指定の 1 文のみ。他は完全同一**

### キャッシュ
- Drive: `{slug}__{accent}_v2.mp3`（GA/RP 別ファイル）
- localStorage: `ipa_tts_v2:{accent}:{slug}`
- キャッシュ破棄なしにプロンプト変更を反映するには v3 への切り替えが必要

### 影響語数（`ga_rp_same: false`）
| カテゴリ | 語数 | 優先度 |
|---|---|---|
| rhoticity | 557 | 最優先 |
| goat_vowel | 270 | 最優先 |
| lot_vowel | 311 | 高 |
| cot_caught | 225 | 高 |
| ga_allophony | 279 | 中（フラップ t 等） |
| structural_other | 832 | 中 |
| square_near_cure | 116 | 中 |
| trap_bath | 75 | 中 |
| weak_vowel | 60 | 低 |
| yod | 29 | 低 |
| stress_placement | 7 | 低 |

## 検討すべき改善アプローチ

### A: Instructions プロンプト強化
- RP instructions に rhoticity/GOAT の具体的指示を追加（"Do NOT use rhotic /ɹ/ — use non-rhotic vowels /ɜː/, /ɑː/. Use /əʊ/ not /oʊ/ for GOAT words."）
- 最も低コスト・低リスク
- `gpt-4o-mini-tts` が指示に従う保証は不明

### B: Voice 変更（GA/RP で異なる voice）
- `alloy` は GA 寄りの可能性 → RP に `nova`/`sage` 等を試す
- Code.gs の `ALLOWED_VOICES` は既に 11 voice 対応済み
- A/B テスト用の `?voice=` パラメータも既存

### C: IPA phoneme 直接指定（SSML `<phoneme>` 相当）
- `gpt-4o-mini-tts` の `input` に IPA を含める（ "Pronounce /fɜːst/ in RP" ）
- wordlist.json の `rp_ipa` データを活用可能
- OpenAI TTS が IPA 入力に従うか要検証

### D: モデルアップグレード（`gpt-4o-mini-tts` → `tts-1-hd` or 上位）
- より高品質なモデルでアクセント差が出る可能性
- コスト増・レスポンス速度への影響

### E: ハイブリッド（A+B+C の組み合わせ）
- RP voice を変更 + IPA ヒント付きプロンプト
- 最も効果的だが変更が大きい

## 既存の A/B テスト基盤

Code.gs には `TTS_INSTR_VARIANTS`（L30-35）と `?instr_variant=` パラメータが既にあり、connected speech 用のプロンプト A/B テスト基盤がある。これを単語 TTS にも拡張可能。

## 次のステップ（推奨）

1. **PoC**: 代表語（first, picture, control, go）で以下を試し、Naoya に聴かせる
   - (a) RP instructions に rhoticity/GOAT 指示を追加（アプローチ A）
   - (b) RP voice を `nova` や `sage` に変更（アプローチ B）
   - (c) RP input に IPA ヒントを添える（アプローチ C）
2. **Naoya 判断**: どの組み合わせが最も差が聞こえるか
3. **実装**: 選択されたアプローチを Code.gs に反映 + キャッシュ v3 移行

## 関連ファイル

| ファイル | 役割 |
|---|---|
| `tools/tts/gas/Code.gs` | TTS proxy（instructions 定義・voice 選択・キャッシュ） |
| `tools/tts/gas/BatchWarm.gs` | GA 一括バッチ生成 |
| `docs/tts-design.md` | TTS 設計の正本 |
| `packages/core/data/wordlist.json` | `rp_ipa` フィールド（IPA 入力に利用可能） |
| `apps/web/src/index.template.html` | クライアント TTS 呼び出し・prefetch |

## 前セッションで完了した作業

同セッションで以下を完了済み（すべて develop にマージ済み、PR #278 で main にも反映済み）:

- PR #277: 言語モーダル背面コンテンツ縮小修正（Issue #276）
- PR #280: GA/RP ボタン幅 + PC 余白 + Next ボタン余白（Issue #279）
- PR #283: VOWELS_RP に `ɛ` 追加（RP nucleus ハイライト 406 語誤表示修正）（Issue #281）
- PR #284: syllabic consonant 78 語の `ga_rp_same` 再分類（Issue #282）
- PR #286: A-Z ジャンプ PC 2 カラム修正（Issue #285）
- Issue #287 起票（TTS GA/RP 音声差改善）

---

## PoC v1 試聴結果（2026-08-02 前セッション、Claude Chat 上で実施）

### 手順
- Claude Chat に OpenAI API キーを直接投入し、Claude が `gpt-4o-mini-tts` を直接呼び出して MP3 を取得
- GAS / Drive キャッシュを経由しないため、production 音声への影響なし
- 生成物は Claude.ai artifact（HTML 比較ページ）で試聴。artifact URL は ephemeral のため保存不可

### 4 バリアント定義

| ラベル | voice | instructions | input |
|---|---|---|---|
| **A** GA 現行 | alloy | production `TTS_INSTRUCTIONS_GA` | word（綴り） |
| **B** RP 現行 | alloy | production `TTS_INSTRUCTIONS_RP` | word（綴り） |
| **C** RP 強化 instructions | alloy | RP 現行 + rhoticity/GOAT 明示指示 | word（綴り） |
| **D** RP 強化 + nova voice | nova | RP 現行 + rhoticity/GOAT 明示指示 | word（綴り） |

_※ C の "強化 instructions" 具体的文言は artifact 消失により未保存。次 PoC で再定義必要_

### Naoya 試聴メモ（代表 8 語）

| 語 | カテゴリ | 結果 | 判定 |
|---|---|---|---|
| chirp | rhoticity | A~D すべて同じに聞こえる | ✗ 差なし |
| container | rhoticity | A~D すべて同じに聞こえる | ✗ 差なし |
| chance | trap-bath | A~D すべて同じに聞こえる | ✗ 差なし |
| population | lot vowel | 強調位置は揃った。若干差も感じられる | △ 微差 |
| sorry | lot vowel | C は音声が出ない、A と D では差がある | △ C 生成失敗、A/D 差あり |
| control | goat vowel | A~D どれも同じに聞こえる | ✗ 差なし |
| roast | goat vowel | C, D で IPA 記号通りに正しく表現。差を感じられて良い | ○ 差あり |
| cover | rhoticity | C, D 比較で D の方が最後 r を微妙に感じる | △ D で微差 |

### 診断

1. **綴り入力では accent 差が出にくい**: chirp / container / control のように rhoticity・GOAT が単語核にある語でも、input が綴り文字列だと TTS が accent を無視して同じ発音を返しがち。
2. **効いたケース**: roast（GOAT）と cover（rhoticity）で C/D が微妙に効いた。両者とも **IPA と綴りの乖離が比較的小さい**（roast: /roʊst/→/rəʊst/、cover: /ˈkʌvɚ/→/ˈkʌvə/）。
3. **voice 差 (alloy → nova)** は D で若干効いたが、それ以外では差が観測されず、instructions 強化との切り分けができない。
4. **C 生成失敗（sorry）** は OpenAI API の一時的な失敗の可能性が高い（要 retry ロジック確認）。
5. **chance (trap-bath)** の /æ/ vs /ɑː/ は本来わかりやすい差のはずが出なかった → **綴り入力の限界を裏付ける**。

### 結論
- **綴り入力のみでは accent 差の再現に限界がある**
- **IPA を input として直接渡す方が有望**（アプローチ C: 現行 handoff の "改善アプローチ" の項）
- voice 変更単独の効果は薄い、instructions 強化と組み合わせが必要

---

## PoC v2 提案（次セッションで実施）

### 検証したい仮説
> **input を綴りではなく IPA (`/…/`) に切り替えると、accent 差が明確に出る**

### 新 4 バリアント案

| ラベル | voice | instructions | input | 狙い |
|---|---|---|---|---|
| **A** GA baseline | alloy | 現行 `TTS_INSTRUCTIONS_GA` | word 綴り | 現状の GA 再現 |
| **B** RP baseline | alloy | 現行 `TTS_INSTRUCTIONS_RP` | word 綴り | 現状の RP 再現（PoC v1 の B と同じ） |
| **C** RP + IPA input | alloy | 現行 RP + 「IPA に厳密に従う」1 文追記 | `rp_ipa` フィールド値 `/fɜːst/` 等 | IPA 入力の効果を単独で測る |
| **D** RP + IPA input + nova | nova | 同上 | `rp_ipa` フィールド値 | voice 差の上乗せ効果 |

**instructions 追記案（C/D 共通）**:
> "The input is an IPA transcription in slashes (e.g. /fɜːst/). Pronounce EXACTLY the phonemes shown — do not substitute rhotic /ɹ/ where the IPA shows /ə/ or /ɜː/, do not substitute /oʊ/ where the IPA shows /əʊ/. Follow every symbol including stress marks."

### 試聴語セット（12 語に拡張）

| カテゴリ | 語（GA→RP IPA） | 選定理由 |
|---|---|---|
| rhoticity | first (/fɝst/→/fɜːst/), picture (/ˈpɪktʃɚ/→/ˈpɪktʃə/), chirp (/tʃɝp/→/tʃɜːp/), container (/kənˈteɪnɚ/→/kənˈteɪnə/), cover (/ˈkʌvɚ/→/ˈkʌvə/) | v1 で最も差が出なかった。5 語で傾向確認 |
| goat_vowel | control (/kənˈtroʊl/→/kənˈtrəʊl/), roast (/roʊst/→/rəʊst/), home (/hoʊm/→/həʊm/) | v1 で roast のみ効いた。他 2 語で追試 |
| lot_vowel | sorry, population, hot | v1 で C 生成失敗の追試も含む |
| trap_bath | chance (/tʃæns/→/tʃɑːns/) | v1 で全く差がなかった。IPA 入力の効果測定 |

### 実装手順（Naoya 側で API キー投入する Chat 用）

1. 次 Chat で、Naoya が OpenAI API キーを投入
2. Claude が上記 12 語×4 バリアント = 48 音声を生成
3. 比較 artifact（HTML）を生成、Naoya が試聴
4. 結果を本 handoff doc に追記（v2 セクション）
5. C or D が有意に効く場合 → Code.gs 改修方針を決定して Issue #287 で PR 起票
6. 効かない場合 → tts-1-hd / gpt-4o-audio 系モデルへの切替検証（PoC v3）

### 本 handoff doc に依存する Issue コメント草案（次セッション向け）

Issue #287 に以下を Claude 名義で投稿予定（次 PoC 完了後）:

```
🤖 Claude より

## PoC v1 試聴結果と v2 提案

PoC v1（綴り入力 × alloy/nova × 現行/強化 instructions の 4 バリアント × 8 語）の結果、
綴り入力では accent 差が出にくいことが判明（詳細: docs/handoff/2026-08-02_tts-ga-rp-improvement.md）。

PoC v2 では IPA 直接入力（wordlist.json の rp_ipa フィールド）に切り替えた 4 バリアントを検証予定。
```
