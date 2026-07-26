# 検討レポート — RP TTS 対応

> 作成日: 2026-06-26
> 判断者: Claude
> 対象: TTS 音声の RP（Received Pronunciation）対応
> 現状: GAS → OpenAI `gpt-4o-mini-tts`、General American 固定。RP 音声なし。
> 結論: **設計は確定できる。優先度は中〜低（GA運用に支障なし）。着手するなら §3 の手順。**

---

## 1. 現状アーキテクチャ（SPECIFICATION §3）

```
ブラウザ ──GET ?word=...──▶ GAS Web App ──▶ OpenAI gpt-4o-mini-tts (voice: alloy)
                                │                instructions = GA citation 固定
                                ▼
                         Google Drive: IPA-TTS-Audio/{word}.mp3  ← サーバーキャッシュ
                                │
                          base64 MP3 をブラウザへ
                                ▼
                  localStorage: ipa_tts_v1:{word}  ← クライアントキャッシュ
```

- 音声生成は綴り入力。`instructions` で **General American・citation形** を固定指定
- キャッシュキーは **`{word}` のみ**（アクセント情報なし）

---

## 2. RP対応の核心的論点 ★

### 2-1. キャッシュキーの衝突（最重要）

現在キャッシュキーが綴りだけのため、**同じ綴りに GA と RP の2音声を共存できない**。

- 例: `color` を GA で生成 → Drive に `color.mp3`、localStorage に `ipa_tts_v1:color`
- その後 RP を要求 → **キャッシュヒットで GA 音声が返る**（RP が永久に再生されない）

→ **サーバー・クライアント両方のキャッシュキーにアクセントを含める必要がある。**

| 層 | 現状キー | RP対応後キー |
|----|---------|------------|
| Drive | `{word}.mp3` | `{word}__ga.mp3` / `{word}__rp.mp3`（またはサブフォルダ `ga/` `rp/`） |
| localStorage | `ipa_tts_v1:{word}` | `ipa_tts_v1:{accent}:{word}` |

> これは後方互換に注意。既存の `{word}.mp3` / `ipa_tts_v1:{word}` は GA とみなしてマイグレーション（リネーム or 旧キーを ga として読む暫定ロジック）。

### 2-2. instructions の差し替え

GA固定文の冒頭 1 文を RP 用に分岐。残り（citation形・対立明瞭化・無感情・1回）は共通。

```
Pronounce the single English word in a clear modern Received Pronunciation
(standard Southern British) accent. Use the citation (dictionary) form: ...
（以降は GA版と同一）
```

> 注: 既存GA文の「keep contrasts distinct」リストは RP でも有効。RP では非rhoticになるため `/l/–/r/` の最終 r は自然に出ない（それでよい。データの `rp_ipa` と一致）。

### 2-3. voice の選択

現在 `voice: alloy`。`gpt-4o-mini-tts` の voice はアクセントを保証しないが、`instructions` でRP指定すれば英国寄りになる。
- **据え置き（alloy のまま instructions で制御）を推奨。** voice を変えると GA/RP で声色が変わり、学習者が「別人の声」と感じる。同一 voice ＋ instructions 分岐が一貫性に最適。

### 2-4. GAS の引数

`GET ?word=...` に **`&accent=ga|rp`** を追加。GAS 側で:
1. `accent` を受け取り、Drive キャッシュキーを `{word}__{accent}.mp3` に
2. キャッシュミス時、`accent` に応じた `instructions` で生成
3. 既定は `ga`（後方互換）

---

## 3. 実装手順（着手する場合・Cursor向け概要）

| 手順 | 対象 | 内容 |
|------|------|------|
| 1 | `gas/Code.gs` | `accent` パラメータ受信。`instructions` を ga/rp で分岐。Drive キーを `{word}__{accent}.mp3` に。既定 ga |
| 2 | `gas/Code.gs` | 旧 `{word}.mp3` を ga として読む後方互換（or 一括リネーム） |
| 3 | **GAS 再デプロイ** | Web App を新バージョンで再デプロイ（URL 不変） |
| 4 | `index.html` | TTS fetch に `&accent=${ACCENT}` を付与 |
| 5 | `index.html` | localStorage キーを `ipa_tts_v1:{accent}:{word}` に。旧キーは ga として移行 |
| 6 | `index.html` | メモリ内 `Map` キャッシュも accent 込みキーに |
| 7 | テスト | GA で生成済みの語を RP に切替え、別音声が返ることを確認 |

> **連結句の RP TTS**: 連結句タブは `?phrase=`（または同等）でフレーズ生成。RP対応は同じく `accent` 分岐で可能だが、連結句は GA音声前提で設計されている（弱形・同化を聞かせる）。RP版連結音声は別検討（gonna→/ɡɒnə/ 等、RP特有の連結を別途確定する必要があり、本TTS対応の範囲外）。

---

## 4. 優先度判断

### 結論: **中〜低優先。GA運用に支障はない。**

理由:
- GA は完全動作中。RP は**表示IPA（`rp_ipa`）と入力欄は STEP5 で対応済み**で、学習の中核（読み書き）は RP でも成立している
- 欠けているのは「RP選択時の参照音声」のみ。これは reveal 時の補助要素
- ただし「発音できない音は聞き取れない」という本アプリの核心思想からは、**RP学習者に GA音声を聞かせるのは理念的に不整合**。RPを本気で使う層には音声欠落が体験を損なう

### 着手の判断材料

| 着手すべき | 保留でよい |
|-----------|-----------|
| RP利用者が一定数いる/見込まれる | 当面 GA 中心の運用 |
| RP学習者から「音が米国式」の指摘 | 個人利用でGA主・RP確認用 |
| GAS再デプロイのコストを許容できる | GAS を触りたくない時期 |

### コスト

- GAS再デプロイ1回 ＋ `index.html` のキャッシュキー改修。**小〜中規模**
- 音声生成コストは GA と同額が RP分だけ追加（Drive永続キャッシュなので一度きり）

---

## 5. 推奨

- **設計はこのレポートで確定。** 実装は GA/RP 両方を本気で使う段階になってから着手で十分
- 着手時は §3 の7手順 ＋ キャッシュキー後方互換（§2-1）が肝
- 連結句のRP音声は別タスク（RP特有の連結確定が必要）として切り離す

---

## 6. 残タスク全体の状況

| タスク | 状態 |
|--------|------|
| STEP5 RP（IPA/入力/reveal補足） | ✅ 完了 |
| STEP6 連結句拡張（201句・3段階） | ✅ 完了 |
| STEP7 Mode B | ✅ 完了 |
| RP neighbors 再計算 | ⏸ 保留（判断確定） |
| **RP TTS** | 📋 設計確定・実装は条件付き |
| **多言語学習ガイド**（en/ja/ko/zh-Hant/zh-Hans） | ⬜ 未着手（独立タスク・着手可） |
