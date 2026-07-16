---
id: pj-2026-06-26-1722
aliases:
- pj-2026-06-26-1722
title: Cursor 実装レポート — RP neighbors 優先度判断の反映
created: '2026-06-26'
---

# Cursor 実装レポート — RP neighbors 優先度判断の反映

> 作成日: 2026-06-26  
> 対象ブランチ: `main`（`2e66329`）  
> 判断レポート: `docs/rp-neighbors-priority-decision.md`（Claude 検証済み）  
> 前提: STEP5 RP / STEP7 Mode B 稼働後

Claude 側への作業報告用サマリー。

---

## 1. 背景

Mode B の MCQ distractor は `neighbors`（GA IPA 編集距離で事前計算）を使用する。RP は非 rhotic・BATH/LOT 分裂があり、GA 近傍が RP で変わる可能性がある。

**論点:** RP 選択時に `neighbors_rp` を再計算すべきか？

---

## 2. 判断（Claude レポート要約）

### 結論: **再計算は低優先・保留**

GA `neighbors` の RP 流用で Mode B は実用上問題なし。

| 指標（Claude 検証） | 結果 |
|---------------------|------|
| 全近傍ペア数 | 17,541 |
| RP でも近傍維持（dist≤2） | **95.4%** |
| GA ミニマルペアが RP でも tight（≤1） | **93.5%** |
| 語あたり有効近傍 ≥2 | **90.6%** |

壊れる 4.6% は rhotic / BATH / LOT で「RP では紛らわしくなくなる」正当パターン。MCQ を誤誘導するものではない。不足分は同バンド random 補填で 4 択成立。

### 再計算トリガー（将来）

1. RP 利用者から「MCQ が簡単すぎる」フィードバック
2. RP を既定アクセントにする方針変更
3. BATH/LOT/rhotic 系の高頻度出題で distractor 弱化が体感される

---

## 3. Cursor 実施内容

再計算は**行わない**。判断のリポジトリ反映と将来フックのみ。

| 項目 | 内容 |
|------|------|
| 判断文書 | `docs/rp-neighbors-priority-decision.md` を追加 |
| DESIGN.md §2.2 | RP neighbors 保留方針を追記 |
| `index.html` | `activeNeighbors(c)` — 現状 GA `neighbors`、将来 `neighbors_rp` 対応 |
| `normalizeWord` | `neighbors_rp` フィールド保持（将来用） |
| `gen_neighbors.py` | 再計算手順メモを docstring に追記 |
| `scripts/audit_rp_neighbors.py` | 監査スクリプト新規 |

### ローカル監査（`audit_rp_neighbors.py`）

| 指標 | 結果 |
|------|------|
| 近傍ペア数 | 18,100 |
| RP でも dist≤2 | **94.7%** |
| GA ミニマルペア → RP tight | **93.1%** |

Claude 値と同程度。結論（保留）に変更不要。

---

## 4. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `docs/rp-neighbors-priority-decision.md` | 新規（判断正本） |
| `docs/DESIGN.md` | §2.2 RP neighbors 方針 |
| `docs/cursor-implementation-report-step7.md` | 判断反映 |
| `index.html` | `activeNeighbors()` |
| `scripts/gen_neighbors.py` | 将来手順メモ |
| `scripts/audit_rp_neighbors.py` | 新規 |

**変更なし:** `wordlist_GA_a1a2_plus_phonics.json`（`neighbors_rp` 未生成）

---

## 5. DoD

| 項目 | 結果 |
|------|------|
| 判断文書をリポジトリに格納 | ✅ |
| Mode B が GA neighbors を RP 時も使用（明示） | ✅ |
| 将来 `neighbors_rp` 対応のフック | ✅ |
| 監査スクリプト | ✅ |
| wordlist 再マージなし（コスト回避） | ✅ |

---

## 6. Git / デプロイ

| 項目 | 値 |
|------|-----|
| ブランチ | `main`（`2e66329`） |

---

## 7. Claude への申し送り

- **RP neighbors 再計算は着手しない** — 判断確定・リポジトリ反映済み
- 次の独立タスク候補: **RP TTS**（GAS 再デプロイ要否）、**多言語学習ガイド**
- 再計算時は `docs/rp-neighbors-priority-decision.md` §4 の手順 + `audit_rp_neighbors.py` で検証
