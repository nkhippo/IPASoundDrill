---
id: pj-2026-06-25-fe01
aliases:
- pj-2026-06-25-fe01
title: 'Cursor 実装レポート — STEP5: GA/RP 対応'
created: '2026-06-25'
---

# Cursor 実装レポート — STEP5: GA/RP 対応

> 作成日: 2026-06-23  
> 対象ブランチ: `main`（`73a310b`）  
> 指示書: `cursor-step5-rp-support.md`  
> 前提正本: `docs/PURPOSE.md` v2 / `docs/DESIGN.md` §10

Claude 側への作業報告用サマリー。

---

## 1. 目的と背景

STEP5 では以下を実装する。

1. 全 3,059 語に `rp_ipa` フィールドを付与
2. 連結句 15 句に `rp_ipa` を付与（手動確定版）
3. 設定で **GA / RP** を切替（localStorage 永続化、既定 `ga`）
4. RP 選択時は IPA キーボードを RP 仕様に差し替え
5. **GA 運用時も reveal で RP IPA を補足表示**（RP 時は GA を補足）

---

## 2. RP データ生成について

### 初回（Cursor 実装時）

API キー未設定のため、**ルールベース変換**（`scripts/ga_to_rp.py`）で `data/rp_complete.json` を生成しマージ。

### 更新（2026-06-25 · Naoya ローカル API 実行後）

| 項目 | 内容 |
|------|------|
| 実行 | `python3 scripts/gen_rp_ipa.py`（39 バッチ） |
| 結果 | **3,059 / 3,059 語成功**、失敗 0 |
| マージ | `cp rp_complete.json data/rp_complete.json` → `python3 scripts/merge_rp_ipa.py` |
| 手修正 | API 出力 `Z: /zed/` → DoD 準拠 **`/zɛd/`** に修正 |
| 品質レビュー | **Claude 手番 (2) は未実施** — `data/rp_complete.json` のレビューを推奨 |

オフライン版スクリプト（`scripts/gen_rp_ipa_offline.py` / `scripts/ga_to_rp.py`）はフォールバック用として残置。

---

## 3. 実施内容

### 3-1. wordlist へ `rp_ipa` マージ

| 項目 | 内容 |
|------|------|
| 入力 | `data/rp_complete.json`（3,059 語） |
| スクリプト | `scripts/merge_rp_ipa.py` |
| 結果 | 全 **3,059 語**に `rp_ipa` 付与 |

### 3-2. 連結句へ `rp_ipa` マージ

| 項目 | 内容 |
|------|------|
| 入力 | `data/connected_speech_with_rp.json`（手動確定 15 句） |
| 出力 | `data/connected_speech.json` を更新 |
| 結果 | 全 **15 句**に `rp_ipa` 付与 |

### 3-3. アプリ対応（`index.html`）

| 機能 | 内容 |
|------|------|
| アクセント状態 | `ACCENT = localStorage.getItem("app_accent") \|\| "ga"` |
| 参照 IPA | `activeIpa(c)` — accent に応じて `ipa` / `rp_ipa` を切替 |
| 設定 UI | 言語セクションに加え **Accent: GA / RP** ボタン |
| Decode / Encode 採点 | `activeIpa(c)` を参照 |
| RP キーボード | `ː` `ɒ` `əʊ` `ɜː` `ɪə` `eə` `ʊə` 等。`ɝ` `ɚ` は非表示 |
| Reveal 補足 | `#rAltIpa` — GA 時は RP、RP 時は GA を小さく表示 |
| tokenize / 音節 | accent に応じた MULTI / VOWELS セット |

### 3-4. i18n

| キー | 追加先 |
|------|--------|
| `settings_title` | en / ja / zh / ko |
| `accent.label`, `accent.ga`, `accent.rp` | 同上 |
| `reveal.rp_note`, `reveal.ga_note` | 同上 |

`tools/validate_i18n.py` → **ERROR 0**

---

## 4. 検証（DoD）

| 項目 | 結果 |
|------|------|
| 全 3,059 語に `rp_ipa` | ✅ 3,059 / 3,059 |
| 連結句 15 句に `rp_ipa` | ✅ 15 / 15 |
| Z → /zɛd/ | ✅ |
| R → /ɑː/ | ✅ |
| car → /kɑː/（非 rhotic） | ✅ |
| water → /ˈwɔːtə/ | ✅ |
| bath → /bɑːθ/（TRAP-BATH） | ✅ |
| gonna → /ˈɡɒnə/ | ✅ |
| sorta → /ˈsɔːtə/ | ✅ |
| `validate_i18n.py` ERROR 0 | ✅ |
| GA/RP 切替・キーボード・reveal 補足 | ✅ 実装済み（実機確認推奨） |

---

## 5. 追加・更新ファイル一覧

| ファイル | 操作 |
|----------|------|
| `wordlist_GA_a1a2_plus_phonics.json` | `rp_ipa` 追加（3,059 語） |
| `data/connected_speech.json` | `rp_ipa` 追加（15 句） |
| `data/rp_complete.json` | 新規（オフライン生成） |
| `data/connected_speech_with_rp.json` | 参照用コピー |
| `scripts/ga_to_rp.py` | 新規 |
| `scripts/gen_rp_ipa_offline.py` | 新規 |
| `scripts/merge_rp_ipa.py` | 新規 |
| `scripts/gen_rp_ipa.py` | 配置（API 版） |
| `scripts/gen_connected_rp.py` | 配置（監査用） |
| `index.html` | GA/RP UI・キーボード・reveal |
| `i18n/{en,ja,zh,ko}.json` | accent / reveal キー |

---

## 6. 今後の課題（STEP5 範囲外・指示書 §8 より）

1. **RP 用 neighbors** — 当面 GA neighbors を流用（Mode B の RP は近似）
2. **連結句の RP TTS** — GAS の RP ボイス対応は別途
3. **RP 内の揺れ** — poor 等は 1 表記に固定
4. **Claude 品質レビュー** — API 版またはオフライン版 `rp_complete.json` の母音変換・非 rhotic の網羅確認

---

## 7. Git

| 項目 | 値 |
|------|-----|
| 作業ブランチ | `step5-rp-support` |
| マージ先 | `main`（`73a310b`） |

---

## 8. Claude への依頼（次チャット）

1. `data/rp_complete.json`（または wordlist の `rp_ipa` 列）の **品質レビュー** — 特に短縮形・カジュアル・TRAP-BATH 境界
2. オフライン変換で問題があれば、Naoya 側 API 再生成 or パッチリストの提示
3. 必要なら RP 用 neighbors 再計算の優先度判断
