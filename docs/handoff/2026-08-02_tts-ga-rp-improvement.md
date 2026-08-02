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
