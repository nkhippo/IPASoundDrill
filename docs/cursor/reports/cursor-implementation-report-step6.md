# Cursor 実装レポート — STEP6: 連結句拡張（15 → 201句・難易度3段階）

> 作成日: 2026-06-26  
> 対象ブランチ: `main`（`116f6f8`）  
> 指示書: `cursor-step6-connected-speech-expansion.md`  
> 入力: `connected_speech_expanded.json`（Claude 生成・品質確認済み）  
> 前提正本: `docs/PURPOSE.md` / `docs/DESIGN.md`

Claude 側への作業報告用サマリー。

---

## 1. 目的と背景

連結句を **15句 → 201句** に拡張し、**難易度3段階（L1/L2/L3）** フィルタを導入する。型（`cs_type`）は linking / assimilation / elision の3種を維持。

| 項目 | 旧 | 新 |
|------|----|----|
| 句数 | 15 | **201** |
| 難易度 | なし | **L1=61 / L2=67 / L3=73** |
| 型 | 3種 | 同じ |

### 型×レベル内訳（検証済み）

| | linking | assimilation | elision | 計 |
|--|--------|--------------|---------|----|
| **L1** | 30 | 15 | 16 | 61 |
| **L2** | 23 | 22 | 22 | 67 |
| **L3** | 20 | 22 | 31 | 73 |
| **計** | 73 | 59 | 69 | **201** |

---

## 2. 実施内容

### 2-1. データ置き換え

| 項目 | 内容 |
|------|------|
| 入力 | `connected_speech_expanded.json` |
| 本番 | `data/connected_speech.json` を置き換え |
| 退避 | 旧15句 → `data/connected_speech.legacy15.json` |

各句のフィールド: `id`（cs001〜cs201）/ `w` / `ipa` / `rp_ipa` / `cs_type` / `level` / `src` / `cs_rule(en,ja)` / `gloss(en,ja,zh,ko)`

データ検証:
- 201句、ID重複 0、句重複 0
- 必須フィールド欠落 0
- gloss 4言語・cs_rule en/ja 完備

### 2-2. UI（`index.html`）

| 機能 | 内容 |
|------|------|
| 難易度ピル | 全て / 初級(L1) / 中級(L2) / 上級(L3) |
| state | `S.csLevel = "all"`（既定） |
| 絞り込み | `cs_type` フィルタと **AND 結合** |
| プール表示 | `Pool: N phrases` が絞り込み後件数に追従 |
| GA/RP | STEP5 の `activeIpa()` を連結句でも流用（変更なし） |

`normalizeConnected()` に `id` / `level` を追加。

### 2-3. i18n（en / ja / zh / ko）

| キー | 用途 |
|------|------|
| `cs.level.label` | 難易度ラベル |
| `cs.level.all` / `l1` / `l2` / `l3` | ピル表示 |

`tools/validate_i18n.py` → **ERROR 0**

---

## 3. DoD 検証

| 項目 | 結果 |
|------|------|
| `connected_speech.json` 201句 | ✅ |
| `id` / `level` / `cs_type` / `rp_ipa` / gloss(4) / cs_rule(en,ja) | ✅ |
| 難易度ピル表示・AND 絞り込み | ✅ 実装済み |
| `Pool: N phrases` 追従 | ✅ |
| GA/RP 切替で `rp_ipa` 参照 | ✅（STEP5 流用） |
| `validate_i18n.py` ERROR 0 | ✅ |
| ALL=201 / L1=61 / L3×elision=31 | ✅ データ検証 |

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/connected_speech.json` | 201句に置き換え |
| `data/connected_speech.legacy15.json` | 旧15句退避 |
| `index.html` | 難易度フィルタ UI・ロジック |
| `i18n/{en,ja,zh,ko}.json` | `cs.level.*` キー追加 |

---

## 5. 範囲外（指示書 §5）

| 項目 | 扱い |
|------|------|
| 連結句 neighbors | 対象外 |
| RP TTS | GAS `?phrase=` は GA のまま |
| Encode 方向 | Decode のみ（現状踏襲） |

> **注意:** `scripts/merge_rp_ipa.py` は `data/connected_speech_with_rp.json`（旧15句）で上書きするため、STEP6 以降は **実行しないこと**。連結句の正本は `data/connected_speech.json`。

---

## 6. Git / デプロイ

| 項目 | 値 |
|------|-----|
| ブランチ | `main`（`116f6f8`） |
| GitHub Pages | push 後 Actions 自動デプロイ |

---

## 7. Claude への申し送り

- 連結句 L1=61 / L2=67 / L3=73 確定。IPA（GA/RP）は入力データで品質確認済み
- 残: 多言語学習ガイド、Mode B、RP用 neighbors、RP TTS
