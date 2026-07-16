---
id: pj-2026-06-25-f98d
aliases:
- pj-2026-06-25-f98d
title: 'Cursor 実装レポート — STEP5 追補: DRESS 母音（ɛ→e）修正'
created: '2026-06-25'
---
# Cursor 実装レポート — STEP5 追補: DRESS 母音（ɛ→e）修正

> 作成日: 2026-06-25  
> 対象ブランチ: `main`（`294f306`）  
> 前提: STEP5 GA/RP 対応（`docs/cursor-implementation-report-step5.md`）  
> 入力: Claude 品質レビュー後の修正ファイル

Claude 側への作業報告用サマリー。

---

## 1. 背景

Claude による `rp_complete.json` 品質レビューで、**DRESS 母音の記号統一漏れ**が 21 語で検出された。

| 項目 | 内容 |
|------|------|
| ルール | RP では GA の `/ɛ/`（DRESS）を **`/e/`** に統一 |
| 漏れ | API バッチ処理の取りこぼし **21 語**（他 358 語は正しく `e`） |
| 修正方法 | `rp_ipa` 内の `ɛ` → `e` 置換（全 21 語で妥当と確認済み） |
| 連結句 | **影響なし**（`connected_speech_with_rp.json` は手動確定のまま） |

`necessary` は `/ˈnɛsəˌsɛri/` → `/ˈnesəˌseri/` のように **2 箇所**の `ɛ` が修正対象。

---

## 2. 実施内容

### 2-1. 受領ファイル

| ファイル | 用途 |
|----------|------|
| `rp_complete.fixed.json` | 修正済み全 3,059 語（`rp_ipa` に `ɛ` ゼロ）→ **マージ入力** |
| `rp_dress_vowel_fix.patch.json` | 21 語の差分記録（監査用） |

### 2-2. マージ手順

```bash
cp rp_complete.fixed.json data/rp_complete.json
cp rp_dress_vowel_fix.patch.json data/rp_dress_vowel_fix.patch.json
python3 scripts/merge_rp_ipa.py
```

| 項目 | 結果 |
|------|------|
| wordlist `rp_ipa` 更新 | 3,059 / 3,059 |
| パッチ 21 語の反映 | 21 / 21 ✅ |
| `rp_ipa` 内の `ɛ` 残存 | **0** ✅ |
| 連結句 15 句 | 変更なし（手動確定版を再適用） |

---

## 3. 修正対象 21 語

| 語 | 修正前 | 修正後 |
|----|--------|--------|
| red | /rɛd/ | /red/ |
| slept | /slɛpt/ | /slept/ |
| smell | /smɛl/ | /smel/ |
| special | /ˈspɛʃəl/ | /ˈspeʃəl/ |
| spell | /spɛl/ | /spel/ |
| spend | /spɛnd/ | /spend/ |
| spent | /spɛnt/ | /spent/ |
| step | /stɛp/ | /step/ |
| subject | /səbˈdʒɛkt/ | /səbˈdʒekt/ |
| successful | /səkˈsɛsfəl/ | /səkˈsesfəl/ |
| twelve | /twɛlv/ | /twelv/ |
| dressed | /drɛst/ | /drest/ |
| menu | /ˈmɛnjuː/ | /ˈmenjuː/ |
| metal | /ˈmɛtəl/ | /ˈmetəl/ |
| method | /ˈmɛθəd/ | /ˈmeθəd/ |
| myself | /ˌmaɪˈsɛlf/ | /ˌmaɪˈself/ |
| necessary | /ˈnɛsəˌsɛri/ | /ˈnesəˌseri/ |
| negative | /ˈnɛɡətɪv/ | /ˈneɡətɪv/ |
| net | /nɛt/ | /net/ |
| next | /nɛkst/ | /nekst/ |
| ourselves | /aʊəˈsɛlvz/ | /aʊəˈselvz/ |

---

## 4. 検証

| 項目 | 結果 |
|------|------|
| 全語 `rp_ipa` あり | ✅ 3,059 |
| パッチ完全一致 | ✅ 21 / 21 |
| `ɛ` 残存ゼロ | ✅ |
| 連結句 `rp_ipa` | ✅ 15 句維持 |

---

## 5. 更新ファイル

| ファイル | 操作 |
|----------|------|
| `data/rp_complete.json` | `rp_complete.fixed.json` で差し替え |
| `data/rp_dress_vowel_fix.patch.json` | 新規（差分記録） |
| `wordlist_GA_a1a2_plus_phonics.json` | 21 語の `rp_ipa` 更新 |
| `data/connected_speech.json` | 再マージ（内容同一） |

---

## 6. Git

| 項目 | 値 |
|------|-----|
| ブランチ | `main`（`294f306`） |

---

## 7. Claude への申し送り

- DRESS 母音の取りこぼし 21 語は本パッチで解消済み
- `data/rp_complete.json` は `ɛ` ゼロ状態
- 残レビュー項目があれば次チャットで継続可能
