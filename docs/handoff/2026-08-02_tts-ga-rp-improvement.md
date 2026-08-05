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

---

## PoC v3 試聴結果 + 大量生成 rollout 計画（2026-08-06 更新）

### v3 で検証したこと

PoC v2 alloy 版で「voice 変更を除外しても IPA 入力単独では 4/12 (33%) しか差が出ない」と判明したことを受け、**モデル自体の切替** (`gpt-4o-mini-tts` → `gpt-audio` / Chat Completions API) を検証した。

**v3 セットアップ**:
- 12 語 × 3 モデル × (GA mode, RP mode) = 72 音声
- モデル: M1 = `gpt-4o-mini-tts`（production 相当）、M2 = `tts-1-hd`、M3 = `gpt-audio`
- 全て `voice=alloy`、GA=綴り入力、RP=IPA 直接入力 + RP_STRICT instructions

### 主要な発見

**1. gpt-audio (Chat Completions) は単純採用では動かない**

Chat Completions API は本来会話モデルなので、単語入力を「chat prompt」と誤解して以下の failure mode が頻発:

| Failure | 頻度 | 例 |
|---|---|---|
| 会話返答 | GA 6/12 | `roast` → "I'm here and ready. What's on your mind?" |
| スペリング読み | 1/12 | `first` → "F-R-S-T" |
| 無音 (silence 返答) | 特に IPA で高頻度、`/həʊm/` は 5/6 | 音声はあるが max_rms < 20 |
| Whisper 幻覚 | 検証時に判明 | 無音 MP3 を Whisper が "you" / "the" と誤転写 |
| 発話開始が早すぎる | 常時 | lead silence 40-70ms（自然な TTS は 200-500ms） |

**2. 上記を全て自動修復する pipeline を構築 (`~/tts-poc-v3/heal_v2.py`)**

```
generate → validate (RMS + Whisper + duration + lead_silence)
  ├─ PASS → save
  ├─ NO_LEAD only → post-process (silence pad 250ms) → save
  ├─ SILENT/VERBOSE/SLOW → retry with progressive prompt strategies
  └─ N 回失敗 → best-available (audible な attempt) を保存 (PARTIAL 状態)
```

**必須の検証項目** (単独では不十分と判明):
- **RMS 波形分析** — Whisper の "you"/"the" 幻覚を防ぐ (Whisper 単独では silence 検出不可)
- **実発話時間** = duration - lead_silence (SLOW の誤判定を防ぐ)
- **lead_silence_ms** — 発話開始が早すぎる感の検出
- **transcript の単語一致** (WRONG_WORD 検出、GA モードのみ有効。RP は Whisper が IPA 発音を別単語に誤認識するため skip)

**Prompt 戦略のカスケード** (優先順は失敗内容で動的変更):
- `V2_GO`: 単語/IPA を system message に埋め込み、user は "GO" だけ送る → 会話文脈を切断
- `V4_LEADPAD`: 明示的に「200-300ms silence で始めて、1.5秒以内で話せ」と指示
- `V3_QUOTE`: user 側を `Say only: "<word>"` の形式で明示

**Post-process**: healing loop で lead が 150ms 未満のままなら、後処理で 250ms の無音を先頭に WAV padding。MP3 → WAV → 先頭に silence bytes prepend → WAV 保存。

**3. 12 語試聴結果 (M1 vs M3 alloy、Naoya 判定)**

M3 は healing pipeline 通過後の RP 音声。Naoya の判定は「M1 vs M3 で RP-side に accent 差 (rhoticity 落ち / GOAT シフト / TRAP-BATH シフト) がはっきり出るか」。

| カテゴリ | 語 | M3-RP で差が出た | 備考 |
|---|---|---|---|
| rhoticity | picture | ✓ | 語末 `-r` 落ちが明瞭 |
| rhoticity | container | ✓ | 同上 |
| rhoticity | first | ✗ | 強勢の `/ɝ/-/ɜː/` 差は再現できない |
| rhoticity | chirp | ✗ | 同上 |
| rhoticity | cover | ✗ | 語末 `-r` 落ちだが弱勢音節、差微妙 |
| goat_vowel | home | ✓ | monosyllable、`əʊ` が明瞭 |
| goat_vowel | control | ✗ | multisyllable、差出ず |
| goat_vowel | roast | ✗ | 同上 |
| lot_vowel | sorry / population / hot | ✗✗✗ | **全滅** — gpt-audio でも `/ɑ/-/ɒ/` 差は出ない |
| trap_bath | chance | ✓ | 大きな母音質差、明瞭 |

**成功率: 4/12 (33%) = alloy PoC v2 と同じ数字**。ただし成功した 4 語は「M1 で差が出なかったが M3 で差が出た」語であり、gpt-audio による upgrade 効果はカテゴリ限定で存在。

### カテゴリ別 gpt-audio 適性

| カテゴリ | 総語数 | gpt-audio が効くパターン | 推定 rollout 対象語数 |
|---|---|---|---|
| rhoticity | 557 | 語末 unstressed `-r` (`rp_ipa` が `/…ə/` 終わり、GA `/…ɚ/`) | ~300 |
| goat_vowel | 270 | monosyllable (1音節で `/əʊ/`) | ~50 |
| trap_bath | 75 | 全て (chance 1 語のみ検証だが母音質差が大きく期待値高) | 75 |
| lot_vowel | 311 | **なし — gpt-audio でも `/ɑ/-/ɒ/` は再現不可** | 0 |
| ga_allophony, structural_other, square_near_cure, weak_vowel, yod, stress_placement | 1,321 | 未検証、優先度低 | 0 |

**推定 rollout 対象合計: ~425 RP files**

**GA は全て M1 (`gpt-4o-mini-tts`) 継続** — gpt-audio は verbose / chat-response の failure mode があり GA 側では不利。

### 差し替え計画 (次 Chat で実行)

**Phase A: 対象語抽出 + 生成**

1. `packages/core/data/wordlist.json` から以下の条件で抽出:
   - `ga_rp_same == false`
   - `ga_rp_same_reason in ['rhoticity', 'trap_bath', 'goat_vowel']`
   - rhoticity は `rp_ipa` が `/ə/` で終わる (word-final unstressed schwa) のみ
   - goat_vowel は monosyllable のみ (音節数判定は簡易には `rp_ipa` の primary stress 位置で決定)
2. `~/tts-poc-v3/heal_v2.py` の `DEMO_TARGETS` を上記リストに差し替え
3. 6 並列で ~425 RP files を生成 (推定 30-60 分、$5-10)
4. lead < 150ms の files に post-process pad (250ms 無音先頭挿入 → WAV 保存)

**Phase B: Drive アップロード + 段階検証**

5. Drive フォルダ `TTS-Audio` (ID: `1-eReuBXdwKWukpXdIHAiI6lPvaAkATpA`) に `{slug}__rp_v3.mp3` として upload
   - 既存 `{slug}__rp_v2.mp3` は残す (v2 との並行運用でロールバック可能)
   - WAV padding 後の音声は MP3 に再エンコード必要 (macOS `afconvert` は MP3 encoder 非対応、`lame` or `ffmpeg` が必要)
6. サンプル 20 語 (rhoticity 8 / goat 6 / trap-bath 6) を Naoya が試聴 → OK なら Phase C 承認
7. NG なら失敗パターン分析 → prompt 調整 → 該当語のみ再生成

**Phase C: production 反映**

8. `tools/tts/gas/Code.gs` の `TTS_CACHE_VER` を `v2` → `v3` に bump する PR を Issue #287 で起票
   - `TTS_CACHE_VER` bump は L3 判定 (ランタイム契約 8 パスに該当)
   - localStorage キーも `ipa_tts_v3:{accent}:{slug}` に自動移行
   - 存在しない語 (v2 のみ、v3 未生成) は GAS proxy が新規生成 → **fallback backend の指定必要**
   - 案: v3 未生成語は M1 (現行 `gpt-4o-mini-tts`) にフォールバック、v3 存在語のみ gpt-audio で再生成しない (pre-uploaded 前提)
9. Web + Mobile は同じ TTS-Audio Drive フォルダを共有するので、Drive 差し替えだけで両プラットフォームに反映

### 次 Chat 引き継ぎパック

**添付**:
1. 本 handoff doc (`docs/handoff/2026-08-02_tts-ga-rp-improvement.md`)
2. `~/tts-poc-v3/heal_v2.py` — healing pipeline 本体
3. `packages/core/data/wordlist.json` — 対象語抽出元 (git repo 内)
4. 新 OpenAI API キー (Naoya 側で発行、この session の会話ログに残ったキーは事前に revoke)

**次 Chat が実行するステップ (詳細)**:
1. `wordlist.json` を Python で読み、上記フィルタ条件で ~425 語を抽出、CSV or JSON list として保存
2. `heal_v2.py` を必要に応じて調整 (`DEMO_TARGETS` を差し替え、`max_attempts` を 8 に増やす等)
3. 6 並列で全語生成、`heal_v2_log.json` に結果保存
4. FAILED / PARTIAL な語をリストアップ、再試行 or 除外判断
5. lead < 150ms の PASS/PARTIAL 語に対して post-process WAV padding
6. Drive TTS-Audio に upload (Drive API 経由、`{slug}__rp_v3.mp3` 命名)
7. Naoya に「サンプル 20 語 URL 一覧」を提出、試聴依頼
8. OK なら Code.gs PR 起票、NG なら失敗パターン分析

### コスト・時間見積

| 項目 | 数値 |
|---|---|
| gpt-audio API calls (healing 込み平均 3-4 calls/word) | ~1,700 |
| Whisper API calls (validation) | ~1,700 |
| 費用 | $5-10 |
| 実行時間 (6 並列) | 30-60 分 |
| Drive upload | ~10 分 |
| Naoya 試聴 (20 サンプル) | ~10 分 |

### 現時点で残っている課題 / 未検証

- **MP3 encoder**: macOS `afconvert` は decoder のみ、post-process 後の MP3 保存には `lame` or `ffmpeg` インストール必要。次 Chat 冒頭で確認
- **Drive upload 手段**: Chat 環境で Google Drive MCP が使えれば直接 upload 可、なければ Naoya が手動 upload
- **音声品質サンプリング**: 425 語全てを人手試聴は非現実的、20-30 語のランダムサンプリングで合否判定
- **失敗率の実態**: 12 語 sample では PARTIAL 1件 (home)、大規模実行では 5-10% 失敗が想定される

