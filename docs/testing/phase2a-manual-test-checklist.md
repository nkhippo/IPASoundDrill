# Phase 2a Manual Test Checklist (Sample-based)

Phase 2a では narrow 対応語が 192 語に増えたため、全件ではなく代表サンプルで確認する。

## 0. 事前準備

1. 設定でアクセントを **GA** にする（RP確認項目のみ後で RP へ切替）。
2. `Words` タブを使用する。
3. 必要に応じて語彙ブラウザで語を確認し、練習キューに出るまで `Play again` を使う。

## 1. サンプル一覧と確認観点

| カテゴリ | 語 | 確認ポイント |
|---|---|---|
| R1 (VtV flap) | `party` | Decode/Reveal で `/ˈpɑrɾi/`、辞書表記 `/ˈpɑrti/`、respelling `PAR-dee` |
| R1 (VdV flap) | `body` | narrow `/ˈbɑɾi/` |
| R2 (syllabic l, t→ɾ) | `bottle` | narrow `/ˈbɑɾl̩/`、`l̩` 表示 |
| R2 (syllabic l, nt→ʔ) | `gentle` | narrow が `ʔ` を含む（`/ˈdʒɛnʔl̩/`） |
| R3 (syllabic n, t→ʔ) | `button` | narrow `/ˈbʌʔn̩/`、辞書表記 `/ˈbʌtən/` |
| R3 (syllabic n, d→d) | `garden` | narrow `/ˈɡɑrdn̩/` |
| narrowなし | `stop` | narrow=phonemic、dictionary 行は非表示、respelling `STAHP` |
| Phase2a 修正語 | `middle` | `/ˈmɪdl̩/`（旧pilot `/ˈmɪɾl̩/` でない） |
| Phase2a 修正語 | `thirty` | `/ˈθɝˌɾi/`（`ˌ` 保持） |
| RP切替確認 | `party` | RPで `/ˈpɑːti/`、respelling `PAH-tee`、dictionary 行非表示、altにGA |

## 2. 手順（T-1〜T-7対応）

### T-1 Basic (GA): `party`

1. Decode で `party` 出題
2. IPA 主表示が `/ˈpɑrɾi/` であること
3. 正答後 Reveal で以下確認
   - narrow: `/ˈpɑrɾi/`
   - `発音ガイド: PAR-dee`
   - `辞書表記: /ˈpɑrti/`

### T-2 RP Switch: `party`

1. RP に切替
2. `party` 再出題
3. Reveal で以下確認
   - 主表示 `/ˈpɑːti/`（fallback）
   - respelling `PAH-tee`
   - dictionary 行は非表示
   - alt 行に `GA: /ˈpɑrti/`

### T-3 No narrow: `stop`

1. GA に戻して `stop` 出題
2. Reveal で以下確認
   - 主表示 `/stɑp/`
   - `発音ガイド: STAHP`
   - dictionary 行なし

### T-4 Encode non-regression: `party`

1. Encode で `party` 出題
2. `/ˈpɑrti/` 入力で `ok` 判定
3. `encodeCheck` ロジックが変わっていないこと（後述のコマンド結果）

### T-5 syllabic n/l

- `button`: `/ˈbʌʔn̩/`
- `bottle`: `/ˈbɑɾl̩/`
- `garden`: `/ˈɡɑrdn̩/`

### T-6 tokenizer spot-check (DevTools)

```javascript
tokenize("ˈbʌʔn̩") // ["ˈ","b","ʌ","ʔ","n̩"]
tokenize("ˈbɑɾl̩") // ["ˈ","b","ɑ","ɾ","l̩"]
```

### T-7 phoneme info tap

Reveal の IPA で `ɾ` をタップして説明カードが出ること。

## 3. 追加確認（語彙ブラウザ）

1. `Vocabulary` を開く
2. Words で `party`, `middle`, `thirty`, `stop` を検索
3. IPA行の下に respelling 行が表示されること

## 4. 参考コマンド

```bash
# Encode 関数の非影響確認
git diff index.html | rg "function encodeCheck"
```
