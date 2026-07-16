---
id: pj-2026-07-10-977f
aliases:
- pj-2026-07-10-977f
title: R4 Pending — TTS レビュー ガイド
created: '2026-07-10'
---

# R4 Pending — TTS レビュー ガイド

- 作成日: 2026-07-10
- 対象: `data/pipeline/phase2a_review_needed.json` に記録された **127 語**
- 目的: これらの語の narrow IPA（GA でのフラップ T 等）を TTS で確認し、確定させる

---

## 1. R4 pending とは

`generate_flap_ipa.py` が「フラップ T の可能性が高いが、機械的には判定できない」と保留したケース（フラグ `R4-VntV-excluded`）。実際の TTS 音声を聴いて、次のいずれに該当するか判定する:

| 判定 | 対応 |
|---|---|
| フラップ T が発生している | `ipa_actual_ga` に narrow 版 IPA を設定 |
| フラップ T ではない（通常の /t/） | 何もしない（現状の phonemic `ipa` のまま） |
| どちらでもない特殊ケース | 手動で `ipa_actual_ga` を作成 or 例外リストに追加 |

判定後、`respell_ga`（respelling）が自動再計算される。

---

## 2. 全 127 語の内訳

### 2-1. CEFR 別

| CEFR | 語数 |
|---|---:|
| A1 | 18 |
| A2 | 34 |
| B1 | 58 |
| B2 | 17 |

### 2-2. 発生 Phase 別

| 由来 | 語数 |
|---|---:|
| Phase 1 以前（オリジナル 3,059 語） | 66 |
| Phase 1 M1 (pilot) | 6 |
| Phase 1 M2 | 8 |
| Phase 1 M3 | 22 |
| Phase 1 M4 | 8 |
| Phase 1 M5 | — （0） |
| Phase 2 pilot | 10 |
| Phase 2 M2a | 2 |
| Phase 2 M2b | 1 |
| Phase 2 M2c | 4 |
| Phase 2 M2d | — （0） |

### 2-3. パターン

全 127 語すべて `R4-VntV-excluded`（VntV = 母音+n+t+母音、機械判定回避対象）。

代表例:
- A1: `candy`, `contest`, `interview`, `into`, `ninety`, `sunday`, `twenty`
- A2: `advantage`, `calendar`, `contact`, `dentist`, `entertainment`
- B1: `accidentally`, `certainty`, `content`, `county`, `identify`
- B2: `antiaircraft`, `candidate`, `dissatisfaction`

---

## 3. レビュー手順（Naoya 実施）

### 3-1. 事前準備

1. GA TTS でこれらの音声を聴ける状態を確保
   - `gas/BatchWarm.gs` で該当語の GA 音声を warm 化しておくと効率的
   - もしくは アプリで各語を Decode/Encode 出題して聞く

### 3-2. レビューフロー（推奨: バッチで進める）

**添付ファイル `data/pipeline/r4_pending_review_list.csv` を使う:**

| 列 | 意味 |
|---|---|
| `w` | 単語 |
| `cefr` | CEFR ラベル |
| `phase_origin` | どの Phase で追加された語か |
| `ipa` | 現状の GA phonemic |
| `ipa_actual_ga` | 現状の narrow（空なら未確定） |
| `rp_ipa` | 現状の RP |
| `gloss_ja` | 日本語訳（同定用） |
| `flags` | R4 タグ |

Naoya が CSV に列を追加して判定を記入:
- `flap_yes_no`: `y` / `n` / `?`（不明）
- `notes`: メモ

### 3-3. Naoya の判定基準

**y (フラップあり)** の典型例:
- 母音間の /t/ が [ɾ]（アメリカ英語のフラップ）に聞こえる
- 例: `winter` [ˈwɪnɾɚ] → GA でよく聞かれる

**n (フラップなし)** の典型例:
- はっきりした /t/ 音が聞こえる
- 強勢の直後・複合語の境界などフラップが起きにくい環境
- 例: `centigrade` の 2 番目の t

**? (不明・要再確認)**:
- 判断に迷う場合はスキップして後日再聴取

### 3-4. 判定後の適用（Cursor 依頼分）

判定完了 CSV を Claude に共有 → Claude が以下を生成:
1. `data/pipeline/r4_confirmed_flap.json`（`y` 判定の narrow IPA リスト）
2. `data/pipeline/r4_confirmed_no_flap.json`（`n` 判定リスト、確定済み記録）
3. Cursor 指示書: これらを `wordlist_GA_a1a2_plus_phonics.json` にマージし、`generate_respelling.py` を再実行

---

## 4. 優先度と工数見積

### 4-1. 優先度

**中〜低**。理由:
- 現状でも respell はデフォルト値で暫定生成済み（発音のヒントとしては機能）
- narrow IPA 未確定でも app の主要機能（Mode A/B）は動作

**着手推奨タイミング**:
- Phase 2 M3 以降が落ち着いてから
- 進捗チェック機能・連結音バッジ UI 完了後
- または、C1 拡充前の「クリーンアップ」フェーズで一括処理

### 4-2. 工数見積

- 1 語あたり音声聴取＋判定: 約 15-30 秒
- 127 語 × 20 秒 ≈ **40〜60 分**
- CSV 記入含めた総作業時間: **1〜1.5 時間**

一気通貫で 1 セッションで終わる規模。CEFR 順に進めれば集中しやすい（A1→A2→B1→B2）。

### 4-3. 分割案（1 度に全部やるのが難しい場合）

| セッション | 対象 | 語数 |
|---|---|---:|
| 1 回目 | A1 + A2 | 52 |
| 2 回目 | B1 前半 | 30 |
| 3 回目 | B1 後半 + B2 | 45 |

---

## 5. 添付ファイル

| ファイル | 用途 |
|---|---|
| File | 場所 | 意味 |
|------|------|------|
| `r4_pending_review_list.json` | `data/pipeline/` | 機械可読形式（Claude や Cursor で使用） |
| `r4_pending_review_list.csv` | `data/pipeline/` | Naoya がレビュー時に列追記する作業ファイル |
| `phase2a_review_needed.json` | `data/pipeline/` | 抽出元（127 語） |

---

## 6. `respell_exceptions` について（別問題、10 語）

`data/pipeline/phase2b_respell_exceptions.json` に別途 10 語（`abruptly`, `agony`, `amongst` 等、すべて pilot 由来）が
`"unknown coda consonant"` エラーで記録されています。

**これは R4 レビューとは別問題**であり、`generate_respelling.py` の内部処理でエラーが出ているものです。
本番 wordlist の該当語の `ipa` / `rp_ipa` 自体は正常なため、UI への影響はありません。

原因調査・修正は本 R4 レビューと切り離して別タスクにすることを推奨（Cursor 実装レポート M2b §3 でも同旨）。

---

## 7. 次アクション

**Naoya 判断待ち:**
- (a) すぐに R4 レビューに着手する
- (b) 進捗チェック機能・連結音バッジ UI 完了後にまとめて着手
- (c) C1 拡充前の「クリーンアップフェーズ」で一括処理
- **推奨: (b) or (c)** — R4 は品質改善の性質が強く、機能追加系タスクの合間に挟むより、まとまった時間を確保するほうが効率的
