---
id: pj-2026-07-10-a435
aliases:
- pj-2026-07-10-a435
title: C1 拡充スコープ設計ドラフト
created: '2026-07-10'
---

# C1 拡充スコープ設計ドラフト

- 作成日: 2026-07-09
- 作成モデル: Claude Opus 4.7
- 対象: `nkhippo/IPASoundDrill` の語彙拡充 Phase 2 (B2) + Phase 3 (C1)
- Q3 回答反映: productive/receptive 両方を receptive C1 まで押し上げる

---

## 1. Executive summary

- **公開データセットで C1 まで完全網羅可能**（CEFR-J v1.5 + Octanove C1/C2 v1.0）
- **単一語ベースの新規追加は 3,007 語**（B2: 1,992 + C1: 1,015）
- **7-8 バッチ** で完了見込み（Phase 1 と同一パターン、各 400 語 + パイロット 180）
- **B1 の実データ検証を通じ、複数語構成語 (multi-word) は当面 対象外** とする方針を提案
- **設計上の重大な発見**: 現行 wordlist の 423 語で CEFR ラベルが CEFR-J v1.5 と食い違う（別途 label audit タスクとして扱うことを推奨）

---

## 2. データソースと licensing

`openlanguageprofiles/olp-en-cefrj` (GitHub) が両公式データを提供:

| データセット | levels | 単一語エントリ | licensing |
|---|---|---:|---|
| **CEFR-J Vocabulary Profile v1.5** | A1–B2 | 7,499 | 東京外大 東野研 / **研究・商用可（引用必須）** |
| **Octanove Vocabulary Profile C1/C2 v1.0** | C1, C2 | 2,079 | **CC-BY-SA 4.0** |

**licensing 上の注意点:**

- CEFR-J v1.5 は引用義務のみ、商用利用可。この Pronunciation Trainer には制約なし
- **Octanove の CC-BY-SA 4.0 は "share-alike"** — 派生物も同じライセンスで公開する必要がある可能性
  - 見解: **headword のみ利用（レベル注釈は当該データを引用しつつ、IPA / def / gloss / respell はすべて独自生成物）** であれば、実質的にヘッドワード集合の「事実の引用」扱いとして狭く解釈できる余地あり
  - 代替として、C1 は Octanove を "候補源" として使い、CEFR ラベルは我々の判断で確定させる形も可
  - **法務観点の慎重確認 が必要** → 最終判断は Naoya に委ねる
- 代替 C1 データセット候補（もし Octanove を回避したい場合）:
  - Oxford 5000 (A1-C1、公式サイト。商用利用は Oxford 経由でライセンス必要)
  - LanGeek C1 PDF (公開だが二次利用制約不明)
  - **推奨: Octanove を採用**（オープン、CEFR-J と整合性）。CC-BY-SA 4.0 の適用範囲は README で明示すればリスク許容範囲

### 引用文言（両データセット共通・提案）

```
Vocabulary CEFR levels reference:
- Tono, Y. (2019). CEFR-J Wordlist Version 1.5. Tokyo University of Foreign Studies.
  https://github.com/openlanguageprofiles/olp-en-cefrj
- Octanove Labs (2020). Octanove Vocabulary Profile C1/C2 v1.0.
  https://github.com/openlanguageprofiles/olp-en-cefrj (CC-BY-SA 4.0)
```

---

## 3. スコープ

### 3-1. 追加対象（Wave 2 = B2、Wave 3 = C1）

| 対象 | ソース | 単一語数 | 状態 |
|---|---|---:|---|
| B2 新規語 | CEFR-J v1.5 B2 のうち現行 wordlist 未収録 | **1,992** | 対象 |
| C1 新規語 | Octanove C1 のうち現行 wordlist 未収録 | **1,015** | 対象 |
| **合計** | | **3,007** | |

### 3-2. スコープ外（明示的に除外）

| 対象 | 語数 | 除外理由 |
|---|---:|---|
| C2 語彙 | ~972 | Q3 の指示（C1 まで）を超える |
| CEFR-J v1.5 の multi-word entries | ~299 | `a.m./A.M./am/AM` `according to` `chest of drawers` 等。Pronunciation Trainer の 1 語 1 IPA 前提と合わない。将来 connected_speech に統合する可能性はあるが本 Wave では扱わない |
| CEFR-J v1.5 の BE/AE variant | 上記に含まれる | `centre/center` 形式。片方は既に収録、両方収録すると重複扱いになる |
| CEFR-J v1.5 の A2 単一語 gap | **6** | ごく少数。B2 バッチ M1 に併合して吸収するか、独立に別バッチ扱いにするかは実装時判断 |
| CEFR-J v1.5 の B1 単一語 gap | **0** | Phase 1 で完全網羅済み |

### 3-3. 除外している「重大な発見」— 別タスク推奨

| 事象 | 語数 | 推奨対応 |
|---|---:|---|
| 現行 wordlist と CEFR-J v1.5 の CEFR ラベル不一致 | **423** | 独立の "CEFR Label Audit" タスクとして別途扱う（本 Wave では触らない） |

サンプル: `address` (現行 A1, CEFR-J B1), `bottle` (現行 A1, CEFR-J B2), `bank` (現行 A1, CEFR-J A2)

これは Phase 1 実施時に既に指摘された「phonics 由来ラベルが CEFR-J と食い違う」問題の再現。判断保留を推奨する理由:
- 既存ユーザ体験（CEFR フィルタで表示される語）に影響
- 一括変更すると Mode B 出題対象範囲が大きく変わる
- 学習効果として現行分類（phonics 由来の A1 = より基礎的）は妥当な側面もある

**推奨: 別タスクで Naoya に判断を委ねる。まず C1 拡充を先行し、そのあと必要ならラベル監査を実施。**

---

## 4. Volume と batching

Phase 1 の 400 語/バッチ + 180 語 pilot パターンを踏襲:

| バッチ | 対象 | 語数 |
|---|---|---:|
| **Phase 2 pilot** | B2 の先頭 180 語 | 180 |
| Phase 2 M2 | B2 続き | 400 |
| Phase 2 M3 | B2 続き | 400 |
| Phase 2 M4 | B2 続き | 400 |
| Phase 2 M5 | B2 続き | 400 |
| Phase 2 M6 | B2 最終 | ~212 |
| Phase 3 M1 | C1 先頭 | 400 |
| Phase 3 M2 | C1 続き | 400 |
| Phase 3 M3 | C1 最終 | ~215 |
| **合計** | | **~3,007 語 / 9 バッチ** |

Phase 1 M1-M5 の実績（5 バッチ、1,769 語）と比較: **約 1.7 倍の作業量**。

### 4-1. 各バッチの生成物

Phase 1 と同一パイプライン:

1. `ipa` (GA phonemic, `cmudict` + ARPABET→IPA)
2. `pos` (品詞、CEFR-J の pos をベースに現行スタイルへ正規化)
3. `def` (英語定義、簡潔)
4. `gloss` × 5 languages (en/ja/zh/ko/fil、A1-A2 と同スタイル)
5. Merge 後に `ipa_actual_ga` (flap-T 等) を `generate_flap_ipa.py` で自動生成
6. Merge 後に `respell_ga` / `respell_rp` を `generate_respelling.py` で自動生成
7. Merge 後に `rp_ipa` を **Britfone + `gen_rp_ipa.py`** で付与
8. **Merge 後に `neighbors` を `gen_neighbors.py` (v2)** で再計算
9. **Merge 後に `ga_rp_same` を `gen_ga_rp_same.py`** で再計算

各バッチマージ後の `neighbors` / `ga_rp_same` 再計算はスクリプト実行のみで完結。

### 4-2. Britfone RP カバレッジ推定

Phase 1 (B1) 実績: **87.9% が Britfone に完全一致**。

C1 拡充で Britfone カバレッジ低下は予想されるが、Britfone は 16,204 語収録で英語一般語彙をほぼ網羅している。C1 語（`abound`, `acoustics`, `accustomed`, `adjustable` 等）は正規英語語彙であり、Britfone に含まれる可能性が高い。

**推定:**

| Phase | Britfone 直接一致率（推定） | 残余の処理 |
|---|---:|---|
| Phase 2 (B2) | 82-87% | `gen_rp_ipa.py` (Claude API) で補完 |
| Phase 3 (C1) | 75-82% | 同上 |

**実測は Wave 2 パイロット 180 語で確定**（設計フェーズでは推定に留める）。

---

## 5. パイロット設計（Phase 2 pilot、180 語）

### 5-1. 選定基準

- CEFR-J v1.5 B2 かつ現行 wordlist 未収録の単一語
- アルファベット順先頭 180 語（Phase 1 pilot と同方式で恣意性回避）
- 対象語のサンプル: `DNA`, `abandoned`, `abolish`, `abruptly`, `absurd`, `accommodation`, `accumulate`, ...

### 5-2. パイロットの品質検証項目（実装後）

| チェック | 期待値 |
|---|---|
| 全 180 語で `ipa` / `pos` / `def` / `gloss.{en,ja,zh,ko,fil}` が埋まる | 100% |
| GA IPA に RP 長音記号 `ː` 混入がゼロ | 0 件 |
| POS 表記が既存 wordlist の慣例に一致（例: `noun` → `名詞`、`verb` → `動詞` etc、当プロジェクトでの表記に統一） | 100% |
| Britfone 直接一致率 | ≥ 82% |
| gloss.ja の翻訳スタイルが既存 A1/A2/B1 と一致（簡潔な訳語、多義列挙、`(英)` 明示） | サンプリング 20 語で 100% |
| `neighbors` 再計算後の 0 近傍率悪化がゼロ | 悪化 = 現状 5% を上回らない |
| `ga_rp_same` 分布に不自然な偏りなし | same 45-55%、B2 特有の rhoticity/trap-bath 比率が既存 B1 と類似 |

### 5-3. パイロット成功基準

上記全チェック pass + Naoya の目視レビュー（サンプル 30 語）で品質 OK 判定 → M2 以降に進む。

パイロットで問題発見時は 6-1 節の Cursor 指示書テンプレートを修正して再実行。

---

## 6. 実装フロー

### 6-1. Cursor 指示書テンプレート（各バッチ共通）

```
docs/cursor/instructions/cursor-instructions-phase2-mN.md

- 入力: data/batches/phase2_mN_{count}_with_gloss.json  (Claude 側で生成)
- スクリプト実行: 4 コマンド
  python3 scripts/generate_flap_ipa.py
  python3 scripts/merge_flap_candidates.py
  python3 scripts/generate_respelling.py
  python3 scripts/merge_respelling.py
- RP IPA バッチ生成: python3 scripts/gen_rp_ipa.py (Claude API)
- Merge: python3 scripts/merge_rp_ipa.py
- 派生再計算: gen_ga_rp_same.py + gen_neighbors.py
- テスト: 総語数 / CEFR 分布 / 既存語のフィールド不変
- コミット単位: 1 バッチ = 1 コミット
```

### 6-2. Sonnet で対応可能な作業

各バッチのデータ生成（IPA/pos/def/gloss × 5 langs）は Phase 1 で Sonnet が実証済み。以下も Sonnet:
- Cursor 指示書執筆
- パイロットの品質チェック分析
- Britfone カバレッジ実測レポート

### 6-3. Opus 判断が必要になる可能性

以下の場合のみ Opus に切り替え検討:
- パイロットで品質基準未達 → 原因調査と設計変更判断
- CEFR-J v1.5 と Octanove の重複語（62 語）の扱い判断
- CEFR ラベル監査タスクの設計

---

## 7. Wave 単位のタスクツリー（改訂版）

Q1（品質優先、順序任せ）に沿った改訂版。C1 拡充完了までの推奨順序:

```
Wave 1: 土台固め (現在)
  W1-1: neighbors v2 適用           ← 済（Cursor マージ待ち）
  W1-2: gas/BatchWords.gs 更新
  W1-3: 新規 1,769 語 GA TTS warm
  W1-4: R4 pending 110 語 TTS レビュー
  W1-5: 連結音・弱形 CEFR バッジ UI

Wave 2: B2 拡充 (~1,992 語)
  W2-0: A2 完成 (6 語) + Phase 2 準備      ← 本ドキュメント
  W2-1: Phase 2 pilot (180 語)             ← Britfone 実測確定
  W2-2: Phase 2 M2 (400 語)
  W2-3: Phase 2 M3 (400 語)
  W2-4: Phase 2 M4 (400 語)
  W2-5: Phase 2 M5 (400 語)
  W2-6: Phase 2 M6 (~212 語)
  各バッチ後: neighbors + ga_rp_same 再計算 (自動)

Wave 3: C1 拡充 (~1,015 語)
  W3-1: Phase 3 M1 (400 語)
  W3-2: Phase 3 M2 (400 語)
  W3-3: Phase 3 M3 (~215 語)
  各バッチ後: neighbors + ga_rp_same 再計算 (自動)

Wave 4: 音声・ドキュメント最終化
  W4-1: 全 wordlist GA TTS 再 warm (~8,000 語規模)
  W4-2: RP TTS 実装 + バッチ warm
  W4-3: 連結音 RP 音声追加
  W4-4: HANDOFF / REPOSITORY-STRUCTURE / PURPOSE / SPECIFICATION 全更新
  W4-5: 語彙 CEFR ラベル監査 (423 conflicts) — 判断のうえ実施 or 保留
```

見積:
- Wave 2 + 3 で **9 バッチ**、Phase 1 の 5 バッチ完了ペースを基準に **1.7〜2 倍の工期**
- Wave 4 の TTS 再生成は wordlist が固まった後の最終工程

---

## 8. 提出ファイル

本設計ドラフトに添付:

| ファイル | 内容 | 用途 |
|---|---|---|
| `c1-expansion-scope-design.md` | 本ドキュメント | `docs/reference/` 配下に配置推奨 |
| `gap_a2_completion.json` | A2 gap 単一語 6 語 | 参考（B2 M1 に併合するか判断） |
| `gap_b1_completion.json` | B1 gap 0 語（空ファイル） | 参考 |
| `gap_b2_new.json` | **B2 新規 1,992 語 全リスト**（headword, pos, cefr） | Phase 2 のマスタリスト |
| `gap_c1_new.json` | **C1 新規 1,015 語 全リスト** | Phase 3 のマスタリスト |
| `pilot_b2_180.json` | **Phase 2 pilot 対象 180 語**（alphabetical head） | 次バッチの起点 |

これらは `data/batches/` に置いて Phase 2/3 の投入用語彙リストとして使う。

---

## 9. 次に必要な意思決定（Naoya）

以下 3 点を最優先で判断:

| # | 判断事項 | 選択肢 | 私の推奨 |
|---|---|---|---|
| **D1** | Octanove C1 の CC-BY-SA 4.0 適用範囲をどう扱うか | (a) 引用のみで headword 利用 / (b) 派生物も CC-BY-SA 明記 / (c) 別ソース模索 | **(a)** — Pronunciation Trainer は「事実の集合」利用に相当。README に引用明示すればリスク許容範囲 |
| **D2** | CEFR ラベル監査（423 語）を Wave 2 と同時進行にするか、Wave 4 まで後回しにするか | (i) Wave 2 と並行 / (ii) Wave 4 で実施 / (iii) 保留 | **(ii)** — Wave 2 進行中の label 変更はテスト負荷が高い。C1 完了後まとめて判断 |
| **D3** | Multi-word entries (`according to`, `chest of drawers` 等) を将来的に扱うか | (α) 本 Wave で無視 / (β) connected_speech.json に統合 / (γ) 別データファイル新設 | **(α)** — 本 Wave のスコープ外。将来 connected speech 拡充時に検討 |

---

## 10. まとめ

- **C1 拡充は公開データセットで完全に賄える**（新規 3,007 単一語）
- **Phase 1 と同じパイプライン**が使え、既存の gen_neighbors v2 + gen_ga_rp_same が自動追随
- **Britfone RP カバー率はパイロットで実測確定**（推定 75-87%）
- **本設計フェーズは Opus 品質で完了**。以降の実データ生成は Sonnet で十分

Naoya が D1-D3 に判断を出せば、次アクション（Phase 2 pilot 180 語のデータ生成）に着手可能。
