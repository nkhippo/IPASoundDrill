# Cursor 実装レポート — English Pronunciation Trainer

> 作成日: 2026-06-23  
> 対象ブランチ: `main`（最新コミット `f60a8c9`）  
> リポジトリ: [English-Pronunciation-Trainer](https://github.com/nkhippo/English-Pronunciation-Trainer)

Claude 側への作業報告用サマリー。本セッションで実施した実装・反映・検証結果をまとめる。

---

## 1. 実施フェーズ概要

| フェーズ | コミット | 内容 |
|----------|----------|------|
| Pre-STEP3 ドキュメント整備 | `17ac7ee` | `PURPOSE.md` / `DESIGN.md` 配置、`SPECIFICATION.md` / `README.md` からリンク、`docs/i18n-audit.md`・`docs/gloss-flags.md` 生成 |
| Mode A リファクタ | `aa7024d` | 音素フォーカス UI、localStorage SRS、reveal gloss、PH_EXAMPLES、TTS v2 |
| GAS TTS v2 デプロイ URL 更新 | `5794712` | `index.html` の `GAS_TTS_URL` を TTS v2 指示付きデプロイに差し替え |
| **STEP3 多言語 UI + gloss 是正** | `b1a1fdc` | i18n 4言語反映、確実是正20語、多義語 gloss 展開、検証ツール追加 |
| GAS 再デプロイ URL 更新 | `f60a8c9` | Naoya による GAS 更新後の最新 Web App URL を反映 |

すべて `main` にマージ・`origin/main` へプッシュ済み。

---

## 2. STEP3 作業内容（`cursor-step3-gloss-i18n.md` 準拠）

### 2-1. UI i18n 反映

**操作:** 受領ファイル（`files.zip`）による全文差し替え。追加翻訳作業なし。

| ファイル | 変更内容 |
|----------|----------|
| `i18n/en.json` `i18n/ja.json` `i18n/zh.json` `i18n/ko.json` | zh/ko の新規 UI キー翻訳、`lead_html` / `focus.*` / `reg.*` / `pool.count` / `info.examples` 等を反映。4言語を en キー順に正規化 |
| `index.html` | lead 静的フォールバックを新コピー化 |

**決定1（反映済み）:** ja `brand.sub` = 「CEFR A1–A2 · アメリカ英語」

### 2-2. gloss 確実是正（20語）

**操作:** `wordlist_GA_a1a2_plus_phonics.fixed.json` で本番 `wordlist_GA_a1a2_plus_phonics.json` を上書き。

| カテゴリ | 対象語 |
|----------|--------|
| 語義・誤字是正 | `am, be, mine, myself, who, me, a, an, the, will, while, beside, greedy, fog, rip` |
| 略語の母国語化（決定2） | `cd, dvd, tv, id, pc` |

パッチ記録: `docs/gloss-corrections.clear.json`（read-only 参照用としてリポジトリに配置）

**ルール:** 上記20語のセルは確定。以降のバッチ処理後も `apply_clear()` で再適用し、上書きしない。

### 2-3. 多義語 gloss の複数訳化（決定3）

**方針:**

| 言語 | 区切り | 超過マーカー | 例（`display`） |
|------|--------|--------------|------------------|
| ja | `、` | `など` | `画面、展示、陳列など` |
| zh | `、` | `等` | `屏幕、展示、陈列等` |
| ko | `, ` | ` 등` | `화면, 전시, 진열 등` |
| en | 見出し語のまま | — | `display` |

- 対象: A1/A2 優先。名詞・動詞・形容詞・副詞の多品詞語
- 最大3語義。4つ以上は上位3＋各言語の「など」相当
- 4言語で語義集合を一致させる（言語ごとに別語義を選ぶズレを解消）
- 機能語・単義語・確実是正20語は対象外

**実装手段（実際に採用した方法）:**

指示書では Claude API / バッチ生成の流用が想定されていたが、以下の理由で **オフライン辞書ベース** に切り替えた。

| 手段 | 結果 |
|------|------|
| `deep_translator` 一括翻訳 | ハング・レート制限で中断 |
| Dictionary API (`api.dictionaryapi.dev`) | 403 Forbidden |
| NLTK WordNet + 自動翻訳 | 品質不良（長文・不自然な訳） |
| **キュレーション辞書（採用）** | 133語: `scripts/expand_polysemy_gloss.py` の `MANUAL` |
| **オフライン JSON（採用）** | 108語: `scripts/remaining_polysemy_data.json` |

処理フロー:

1. `.fixed.json` ベースで wordlist を復元
2. `MANUAL` 辞書で 133語を展開
3. `remaining_polysemy_data.json` で残り 108語（adj/noun, noun/verb の A1/A2 ペア）を展開
4. 各パス後に `gloss-corrections.clear.json` の20語を再適用

### 2-4. 検証

```bash
python3 tools/validate_i18n.py
```

**結果（2026-06-23 時点）:**

```
[A] UI 言語: ['en', 'ja', 'ko', 'zh']  キー数(en)=98
[B] 音素言語: ['en', 'ja', 'ko', 'zh']  記号数(en)=43
OK: 不整合は検出されませんでした。  → ERROR 0
```

**wordlist 追加チェック:**

| 指標 | 結果 |
|------|------|
| wordlist 総エントリ数 | 2,840 |
| A1/A2 エントリ数 | 2,188 |
| 多義形式 gloss（`、` / `など` / ko `, `） | 241語 |
| gloss が en と完全一致するセル | 0 |
| A1/A2 多品詞語で単一訳のまま | 0 |
| 確実是正20語の保護 | OK（上書きなし確認済み） |

---

## 3. DoD チェックリスト（STEP3）

| 項目 | 状態 |
|------|------|
| `i18n/{en,ja,zh,ko}.json` `index.html` `wordlist_*.json` が反映 | ✅ |
| `.fixed` ファイルはリポジトリに残していない | ✅ |
| `validate_i18n.py` ERROR 0 | ✅ |
| gloss に en 完全一致セルが残っていない | ✅ |
| 多義語（A1/A2）が最大3＋「など/等/등」形式、4言語で語義集合一致 | ✅（241語） |
| 単義語・確実是正20語に意図しない変更がない | ✅ |
| `docs/PURPOSE.md` `docs/DESIGN.md` は未改変 | ✅ |

---

## 4. 追加・更新されたファイル（STEP3）

| ファイル | 種別 | 用途 |
|----------|------|------|
| `tools/validate_i18n.py` | 新規 | UI / 音素 i18n 整合性チェッカー |
| `docs/i18n-language-scaling.md` | 新規 | 言語追加プレイブック |
| `docs/gloss-corrections.clear.json` | 新規 | 確実是正20語のパッチ記録 |
| `scripts/expand_polysemy_gloss.py` | 新規 | 多義語展開スクリプト（MANUAL + clear 再適用） |
| `scripts/remaining_polysemy_data.json` | 新規 | 残り108語のオフライン多義語辞書 |
| `i18n/*.json` | 差し替え | 4言語 UI 文言 |
| `index.html` | 差し替え | lead フォールバック等 |
| `wordlist_GA_a1a2_plus_phonics.json` | 上書き | gloss 是正 + 多義語展開 |

**意図的にコミットしていないもの:** `scripts/gloss_build.log`, `scripts/phonemes_build.log`（ビルドログ）

---

## 5. Mode A リファクタ（`aa7024d`）サマリー

STEP3 の前提として先行マージ済みの変更。

| 領域 | 内容 |
|------|------|
| UI | 音素フォーカス（focus/reg トラップ表示）、ブランド表記、lead i18n |
| SRS | `localStorage` ベースの適応型セッション開始（`loadHist` / `loadSym`） |
| Reveal | gloss 表示（`#rGloss`）、PH_EXAMPLES |
| TTS | GAS v2（`TTS_CACHE_VER = 'v2'`、`TTS_INSTRUCTIONS` 定数）、localStorage キャッシュ接頭辞 `ipa_tts_v2:` |

`gas/Code.gs` の TTS 指示は General American・辞書形・弱形なし・子音対比明確化などを指定。

---

## 6. GAS TTS Web App URL

**現在の本番 URL（`index.html` `GAS_TTS_URL`）:**

```
https://script.google.com/macros/s/AKfycbxh98ANczjt2lFaXA82CGpTp49RHl5uuKJSXcUXCBolg1m5WA6nvF4n0QJDG3IrQhPc/exec
```

更新履歴:

| コミット | URL 概要 |
|----------|----------|
| `5794712` | TTS v2 指示付き初回デプロイ |
| `f60a8c9` | Naoya による GAS 再デプロイ後の最新 URL |

---

## 7. ローカル確認手順

```bash
# 静的サーバー
python3 -m http.server 8080

# i18n 検証
python3 tools/validate_i18n.py
```

**実機目視（推奨）:**

1. 設定モーダルで en / ja / zh / ko を切り替え、setup・decode・encode・reveal・summary の文言を確認
2. reveal 画面の `#rGloss` で多義語（例: `display`, `dance`, `black`）の複数訳表示を確認
3. スピーカーアイコンで TTS が新 GAS URL から取得できることを確認

---

## 8. 既知の制約・今後の検討事項

1. **多義語展開はオフライン辞書ベース** — API 一括生成は未使用。B1 以降の多義語や新規語追加時は `expand_polysemy_gloss.py` / `remaining_polysemy_data.json` の拡張、または品質保証付き API パイプラインの再検討が必要。
2. **`wordlist_GA_a1a2_plus_phonics.csv`** — STEP3 指示では CSV 更新は要求されていない。JSON のみ更新済み。CSV との同期が必要なら別タスク。
3. **バックグラウンドで中断されたジョブ** — WordNet 展開・API 一括翻訳はハング/中断されたが、オフライン辞書で代替完了済みのため本番影響なし。

---

## 9. 参照ドキュメント（リポジトリ内）

| ファイル | 内容 |
|----------|------|
| `docs/PURPOSE.md` | プロダクト目的 |
| `docs/DESIGN.md` | 設計方針（Mode A/B、gloss 採点の背景） |
| `docs/i18n-audit.md` | UI キー × 言語の監査表 |
| `docs/gloss-flags.md` | gloss 品質フラグ一覧 |
| `docs/i18n-language-scaling.md` | 言語追加手順 |
| `docs/gloss-corrections.clear.json` | 確実是正20語 |

---

*本レポートは Cursor エージェントによる実装セッションの結果を Claude 側へ引き継ぐためのものです。*
