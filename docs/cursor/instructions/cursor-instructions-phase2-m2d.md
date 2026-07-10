# Cursor 指示書 — Phase 2 M2d（B2 拡充 301-390 語・M2 最終バッチ）

- 対象リポジトリ: `nkhippo/English-Pronunciation-Trainer`
- 前提: M2c マージ済み（5,307語）
- 想定 branch: `feat/phase2-m2d-b2-final`

---

## 1. 本バッチについて

**Phase 2 M2 の最終バッチ**です。90語（100語ではない点に注意）。理由: 元データソース
（CEFR-J v1.5 B2 の [180:580] スライス、400語）の残り分がちょうど90語で、
`disguise`（名詞/動詞）と `divorce`（名詞/動詞）の統合により raw 92語 → 出力90語になりました。

M2a(100) + M2b(100) + M2c(100) + M2d(90) = **合計390語**で Phase 2 M2 が完了します
（pilot 179語と合わせ、B2 は 509 + 390 = **899語**に到達）。

## 2. スコープ

M2a-c と同一方式。`rp_ipa` 同梱、`gen_rp_ipa.py`（API）実行不要。

```bash
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
python3 scripts/gen_neighbors.py
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
python3 scripts/export_batch_words.py
```

## 3. Claude 側で実施済みの検証

- ✅ QA チェック 0 件（`ː`混入・ASCII-g混入・重複・フィールド欠落）
- ✅ 既存 5,307 語（M2c含む想定）との重複ゼロ
- ✅ **新規追加した QA チェック**: 母音欠落タイプミス検出（4文字以上の子音連続を自動検出）
  → この過程で `dignify` `/ˈdɡnəˌfaɪ/` と `dignity` `/ˈdɡnəti/` に **母音 `ɪ` の脱字**を発見・修正
  （正: `/ˈdɪɡnəˌfaɪ/` `/ˈdɪɡnəti/`）。過去バッチ（pilot, M2a-c）も同チェックで再スキャン済み、他に問題なし
- ✅ フルパイプラインをサンドボックスで実行済み

### 期待値（マージ後）

| 指標 | 期待値 |
|---|---|
| 総語数 | 5,397 |
| B2 count | **899** |
| 全体 0近傍率 | 5%（変化なし） |
| M2d 90語の 0近傍率 | 5% |
| M2d 90語の `ga_rp_same` | 52%（47/90） |
| M2d 90語の `ga_allophony` | 14語 |

## 4. コミット

```bash
git add data/batches/phase2_m2d_90_with_gloss.json \
        wordlist_GA_a1a2_plus_phonics.json \
        data/pipeline/phase2a_*.json data/pipeline/phase2b_*.json \
        data/pipeline/ga_rp_same_report.json \
        data/derived/wordlist_with_neighbors.json \
        data/derived/wordlist_with_neighbors_slim.json \
        gas/BatchWords.gs gas/batch_words.csv \
        docs/reference/neighbors_report.md \
        docs/cursor/reports/cursor-implementation-report-phase2-m2d.md
git commit -m "feat: Phase 2 M2d — 90 B2 words (Phase 2 M2 complete: 390/390)"
```

## 5. Phase 2 M2 完了後の次ステップ

- **Phase 2 完了サマリドキュメント**の作成（Naoya判断: 作成するか）
- **Phase 3（C1拡充）** 着手検討 — `docs/reference/c1-expansion-scope-design.md` 参照
- R4 pending 累計（M1-M5 110語 + pilot以降増加分）の整理
- `gas/BatchWords.gs` は本バッチで 5,397語に更新済み
