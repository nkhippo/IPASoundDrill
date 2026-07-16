---
id: pj-2026-06-26-6f7f
aliases:
- pj-2026-06-26-6f7f
title: 'Cursor 実装レポート — STEP7: Mode B（音から語彙）'
created: '2026-06-26'
---

# Cursor 実装レポート — STEP7: Mode B（音から語彙）

> 作成日: 2026-06-26  
> 対象ブランチ: `main`（`d061b8e`）  
> 指示書: `cursor-step7-mode-b.md`  
> 前提正本: `docs/PURPOSE.md` §3 / `docs/DESIGN.md` §2

Claude 側への作業報告用サマリー。

---

## 1. 目的

**Mode B（音から語彙）** を Mode A（既知語の発音再学習）と並行して提供する。

| | Mode A | Mode B |
|--|--------|--------|
| 入口 | IPA / 単語 | 音（TTS） |
| ループ | Decode / Encode | Study → Quiz（MCQ + ディクテーション） |
| 主軸 | 音素カバー | CEFR バンド |
| localStorage | `ept_hist_v1` / `ept_sym_v1` | **`ept_vocab_v1` / `ept_vocab_band`** |

Mode B は Mode A の SRS データを**一切更新しない**。

---

## 2. 実施内容

### 2-1. UI（`index.html`）

| 要素 | 内容 |
|------|------|
| モード切替 | 設定画面上部 **Pronunciation / Sound → Vocabulary**（`app_mode` を localStorage 永続化） |
| Mode B セットアップ | 現在バンド（A1〜B2）と習得率表示 |
| Study 画面 | TTS 自動再生 → IPA → 単語 + gloss → [覚えた→次へ] |
| Quiz MCQ | TTS → 4択（gloss）→ 即時フィードバック |
| Quiz ディクテーション | TTS → 綴り入力 → Mode A Decode 同等採点 |
| Reveal | Quiz 完了後、Mode A reveal レイアウトを流用 |

連結句タブは Mode B 選択時に非表示（連結句は Mode B 対象外）。

### 2-2. 学習ロジック

| 項目 | 実装 |
|------|------|
| セッション構成 | 新規 5 + 復習 5（定数 `MODEB_SESSION`） |
| Study 対象 | `seen==0` |
| Quiz 対象 | `seen==1` かつ Leitner due |
| distractor | neighbors 2 + 同バンド random 1（`MODEB_DISTRACTOR`） |
| 除外 | 同一 gloss[UI言語]・空 gloss・重複 gloss |
| 通過 | MCQ=ok **かつ** 綴り=ok/near → `box+1`、否则 `box=1` |
| バンド解放 | box≥4 が 60% で次 CEFR バンドへ（`MODEB_BAND_UNLOCK_RATIO`） |
| 対象外 | `src` が letter / contraction |

### 2-3. i18n

`mode.*` / `modeb.*` キーを en / ja / zh / ko に追加。

`tools/validate_i18n.py` → **ERROR 0**

---

## 3. DoD 検証

| 項目 | 結果 |
|------|------|
| Study → Quiz 自動切替（1キュー） | ✅ |
| distractor: neighbors 2 + band random 1、シャッフル | ✅ |
| 同一 gloss 除外 | ✅ |
| ディクテーション = Decode 採点（ok/near/bad） | ✅ |
| `ept_vocab_v1` のみ更新 | ✅（Mode A hist/sym 非接触） |
| gloss / UI 言語追従 | ✅ |
| GA/RP → `activeIpa` | ✅ |
| letter/contraction 除外 | ✅ |
| `validate_i18n.py` ERROR 0 | ✅ |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `index.html` | Mode B UI・ロジック・localStorage |
| `i18n/{en,ja,zh,ko}.json` | mode / modeb キー |

---

## 5. 範囲外（指示書 §10）

| 項目 | 扱い |
|------|------|
| RP neighbors | **保留**（GA neighbors 流用。`docs/rp-neighbors-priority-decision.md` 参照） |
| RP TTS | GA 音声のまま |
| 連結句 Mode B | 対象外 |
| Encode 方向 Mode B | なし |

---

## 6. Git / デプロイ

| 項目 | 値 |
|------|-----|
| ブランチ | `main`（`d061b8e`） |

---

## 7. Claude への申し送り

- distractor 同義語除外は gloss 比較で全言語対応
- neighbors は GA 基準。**RP neighbors 再計算は保留**（判断レポート確定）
- 残: RP TTS、多言語学習ガイド
