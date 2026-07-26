# pipeline.md — Python パイプラインコマンドの単一ホーム

wordlist / rp_ipa / neighbors / ga_rp_same 生成パイプラインのコマンド・データ整備タスクの唯一のホーム。
旧 `docs/REPOSITORY-STRUCTURE.md`「Common pipeline commands」「Phase 2 B2 expansion workflow」、旧 `docs/DESIGN.md` §4 を統合継承。

**パスの正本**: `scripts/paths.py` が canonical paths を定義する。ハードコード文字列より import を優先すること。

---

## 1. Common pipeline commands

repo root から実行:

```bash
# After merging a new batch into wordlist（Phase 2 以降は rp_ipa 同梱のため gen_rp_ipa.py は不要）:
python3 scripts/generate_flap_ipa.py
python3 scripts/merge_flap_candidates.py
python3 scripts/generate_respelling.py
python3 scripts/merge_respelling.py
python3 scripts/gen_neighbors.py
python3 scripts/merge_neighbors.py
python3 scripts/gen_ga_rp_same.py --report data/pipeline/ga_rp_same_report.json
python3 scripts/export_batch_words.py

# After batch merge, if rp_ipa was generated with old happY rules:
python3 scripts/fix_happy_i.py   # word-final /iː/ or /ɪ/ → /i/ (then re-run gen_ga_rp_same)

# Regenerate audit markdown:
python3 tools/gen_audit_docs.py
python3 tools/validate_i18n.py
```

**Do not run** `merge_rp_ipa.py` on production wordlist（`connected_speech.json` を上書きする既知バグ）。

**Phase R 追加スクリプト:**

| Script | 役割 |
|--------|------|
| `scripts/phonology_lexicon.py` | 共有語彙リスト（`BATH_WORDS_BASE`, `PALM_WORDS`, `YOD_CORONALS`）— `ga_to_rp.py` と `gen_ga_rp_same.py` から import |
| `scripts/fix_happy_i.py` | rp_ipa の happY 位置 `/iː/`/`/ɪ/` → `/i/` 是正（Phase R2 で1回実行済み。将来バッチ追加時にも実行推奨） |
| `scripts/gen_ga_rp_same.py` | `ga_rp_same` / `ga_rp_same_reason` 一括付与（分類器） |
| `scripts/ga_to_rp.py` | GA→RP ルール変換（**offline fallback のみ**。本番 `rp_ipa` は Claude バッチ同梱） |
| `scripts/gen_rp_ipa.py` | Claude API で RP IPA 生成（新規バッチ用。SYSTEM_PROMPT に happY ルールあり） |

Staging outputs → `data/pipeline/`。Neighbors / RP progress → `data/derived/`。Merge scripts write `wordlist_GA_a1a2_plus_phonics.json`。

---

## 2. Phase 2 B2 expansion workflow（バッチ追加の標準手順）

1. Receive `phase2_mN_*_with_gloss.json`（`rp_ipa` 同梱）→ `data/batches/`
2. Merge into wordlist（重複スキップ、`_generation_source` 除去、`neighbors: []`）
3. Run pipeline（§1 参照）
4. Verify counts; sync `data/derived/rp_progress.json` from wordlist
5. Add `docs/cursor/instructions/` + `docs/agent-reports/`

過去実績: Phase 2 M2 完了時 569 語追加（B2 330→899）。設計: `docs/reference/c1-expansion-scope-design.md`。Phase R（分類器修正 + happY rp_ipa 91語是正 + `phonology_lexicon.py` 統合）詳細: `docs/cursor/reports/cursor-implementation-report-phase-r.md`（実施日は `docs/history.md` 参照）。

---

## 3. データ整備タスク（優先度別）

| 優先 | 内容 | 状態 |
|---|---|---|
| 高 | 欠落必須語・屈折形パッチ | 主要語追加済み（`data/*_patch.json`） |
| 高 | `neighbors` 全語事前計算 | 5,397語（neighbors v2・0 近傍率 5%） |
| 高 | `ex`（記号別例語） | phonemes JSON に実装 |
| 高 | `rp_ipa` 全語付与 | 5,397語 + 201連結句 |
| 高 | 弱形 36語 + `?weak=` TTS | 完了 |
| 高 | UI fil（Tier 1+3） | 完了（leaf 数は `docs/data-contract.md` §5 参照） |
| 高 | 英語定義 `def` | 5,397/5,397 |
| 高 | TTS プリフェッチ（クライアント） | Phase T（`docs/tts-design.md` §3） |
| 高 | GA バッチ warm（GAS） | `BatchWarm.gs`（5,397語。`docs/tts-design.md` §4） |
| 高 | `ga_rp_same` フラグ | Phase R で分類器・happY rp_ipa 修正（`docs/data-contract.md` §2） |
| 中 | 語彙ブラウザ（`3b`/`3c`） | exclusive full-page + 仮想化 + `#/vocab/ipa` 記号ピッカー |
| 中 | B1/B2 語彙拡充 | B1=2,116 / B2=899（M3+ 継続） |
| 高 | CEFR 誤ラベル phonics 是正 | Phase 0-a（652語 `cefr` null 化 → 復元） |
| 中 | カジュアル表現 | 一部（`casual` src） |
| 中 | 薄い記号の補強 | 部分 |
| 中 | `neighbors_rp` | 保留（`docs/reference/rp-neighbors-priority-decision.md`） |
| — | gloss品質点検 | 継続 |
| — | gloss.fil（Tier 2） | 5,397/5,397 |
| — | cs_rule.fil（Tier 4） | 237/237 |
| — | 連結句 RP TTS | 別タスク（未着手） |

各 Phase の完了日・完了ログは `docs/history.md` を参照（本ファイルは evergreen なコマンド・タスク一覧のみ保持）。

---

_旧 `docs/REPOSITORY-STRUCTURE.md`「Common pipeline commands」「Phase 2 B2 expansion workflow」、旧 `docs/DESIGN.md` §4 を統合継承（Issue #172）。_
