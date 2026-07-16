---
id: pj-2026-06-25-6b31
aliases:
- pj-2026-06-25-6b31
title: 'Cursor 実装レポート — STEP4-e: カジュアル表現 + 連結現象'
created: '2026-06-25'
---

# Cursor 実装レポート — STEP4-e: カジュアル表現 + 連結現象

> 作成日: 2026-06-23  
> 対象ブランチ: `main`（`fcdcc2f`）  
> 指示書: `cursor-step4e-casual-connected.md`  
> 前提正本: `docs/PURPOSE.md` v2 / `docs/DESIGN.md` §3.1 / §4

Claude 側への作業報告用サマリー。**STEP4（データ拡張）完結タスク。**

---

## 1. 目的と背景

2種類のデータを性質に応じて分離して追加する。

| パッチ | 内容 | 扱い |
|--------|------|------|
| `casual_patch.json` | カジュアル表現15語 | 本番 wordlist に統合（`src: casual`） |
| `connected_patch.json` | 連結句15句 | **別ファイル** `data/connected_speech.json` + 専用タブ |

連結句は単一語ではないため wordlist / neighbors 対象外。型（連結・同化・脱落）で学習する独立タブを実装。

---

## 2. 実施内容

### 2-1. casual 15語マージ

| 項目 | 内容 |
|------|------|
| 入力 | `data/casual_patch.json` |
| スクリプト | `scripts/merge_casual.py` |
| 語数 | 3,044 → **3,059**（+15） |
| `src` | `casual` |
| gloss | 方針A（展開形 + 口語マーカー） |

**収録語:** wanna, gonna, gotta, kinda, sorta, lemme, gimme, dunno, gotcha, outta, lotta, hafta, oughta, cuz, tryna

### 2-2. connected 15句（分離配置）

| 項目 | 内容 |
|------|------|
| ファイル | `data/connected_speech.json`（本番 wordlist には未混在） |
| `src` | `connected_speech` |
| 拡張フィールド | `cs_type`（linking / assimilation / elision）、`cs_rule`（en/ja） |

| 型 | 句数 | 例 |
|----|------|-----|
| linking | 6 | check it, look at, come on |
| assimilation | 5 | could you, would you, did you |
| elision | 4 | must be, old man, next day |

**gotcha（casual）と got you（連結句）は別設計だが、本パッチの15句には `got you` は含まれず `gotcha` のみ casual 側に収録**（指示書の共存例は設計意図の説明）。

### 2-3. neighbors 再生成（casual 分のみ）

全 **3,059語**で `gen_neighbors.py` → `merge_neighbors.py` を実行。connected 句は対象外。

| 指標 | 値 |
|------|-----|
| ミニマルペア保有 | 1,845（60%） |
| broken ref | 0 |

### 2-4. アプリ対応（`index.html`）

| 機能 | 内容 |
|------|------|
| 練習モードタブ | **単語** / **連結・脱落・同化** |
| 口語フォーカス | `focus.casual` ピル（`src === "casual"`） |
| 連結タブ | `cs_type` サブフィルタ（全て / 連結 / 同化 / 脱落） |
| Decode | 連結後 IPA → 句の綴り（スペース無視で採点: `couldyou` 可） |
| Reveal | 句・gloss・型ラベル・`cs_rule` 表示 |
| TTS | 句は `?phrase=` パラメータ（GAS 側対応追加） |

### 2-5. GAS 更新（`gas/Code.gs`）

- `phrase` クエリパラメータ追加（スペース含む句）
- `TTS_CONNECTED_INSTRUCTIONS`（自然な連結発話）
- キャッシュファイル名: スペース → `_` 正規化

**注意:** 本番 TTS URL は GAS 再デプロイ後に句読み上げが有効になる。

### 2-6. i18n 追加（4言語）

`tab.*`, `cs.*`, `lead_connected_html`, `focus.casual`, `pos.口語表現`, `pool.count_phrases`, `input_phrase`

---

## 3. 検証結果（DoD）

| 項目 | 結果 |
|------|------|
| casual 15語追加 | ✅ 3,059語 |
| connected 15句別ファイル | ✅ |
| `w` ユニーク（casual） | ✅ 重複 0 |
| gloss 4言語（30件） | ✅ |
| `cs_type` / `cs_rule` 保持 | ✅ 15句 |
| neighbors 再生成 | ✅ 3,059語、参照整合性 0 |
| 確実是正20語 | ✅ 無傷 |
| `validate_i18n.py` | ✅ ERROR 0（キー数 119） |

```bash
python3 scripts/merge_casual.py
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py
python3 tools/validate_i18n.py
```

---

## 4. 意図的に未実施 / フォロー

| 項目 | 内容 |
|------|------|
| CSV 同期 | JSON のみ運用 |
| RP 版 casual/connected | STEP5 で判断 |
| GAS 再デプロイ | コード更新済み。Naoya 側で Web App 再デプロイが必要 |
| Encode 方向（連結句） | 優先度低のため Decode のみ |

---

## 5. ローカル確認手順

```bash
python3 -m http.server 8080
```

1. **単語**モード → 口語フォーカス → `gonna` 等、展開形 gloss
2. **連結・脱落・同化**タブ → 同化フィルタ → `could you` の IPA → reveal で型・規則表示
3. 採点: `could you` / `couldyou` 両方正解

---

## 6. STEP4 完了サマリー

| サブタスク | 語数 | コミット例 |
|-----------|------|-----------|
| 4-a 基礎語 | +74 | `b8f6ba5` |
| 4-b neighbors | データ付与 | `854dcc2` |
| 4-c 不規則変化形 | +90 | `6a57e15` |
| 4-d 薄い音素 | +40 | `96684ee` |
| **4-e カジュアル+連結** | **+15 + 15句** | （本コミット） |

**最終語数: 3,059**（+ connected 15句は別管理）

**次ステップ:** STEP5（RP対応）— `gen_rp_ipa.py` による RP IPA 生成

---

## 7. コミット・マージ

| コミット | 内容 |
|----------|------|
| `fcdcc2f` | STEP4-e: casual/connected、UIタブ、GAS phrase TTS |

---

*本レポートは Cursor エージェントによる STEP4-e 実装結果を Claude 側へ引き継ぐためのものです。*
