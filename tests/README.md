---
id: pj-2026-07-07-80b1
aliases:
- pj-2026-07-07-80b1
title: TTS A/B Testing Environment
created: '2026-07-07'
---

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
