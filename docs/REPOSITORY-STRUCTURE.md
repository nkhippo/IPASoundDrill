# Repository Structure

> **Purpose:** Share this file with Claude (or other AI assistants) at the start of a task so it knows where data, scripts, and docs live.  
> **Last updated:** 2026-07-10（Phase R 完了・Phase 2 M2 完了・進捗チェック・フォルダ README 整備）

---

## Canonical documentation — what to read when

Claude に渡すときは **本ファイルを最初に**読ませ、目的に応じて下表の正本を追加する。

| File | Role | Read when you need… |
|------|------|---------------------|
| **`REPOSITORY-STRUCTURE.md`**（本書） | フォルダマップ・パス・パイプライン手順 | どこに何があるか、コマンド、ランタイム契約 |
| **`PURPOSE.md`** | 目的・2モード・評価方針の正本 | なぜそう作るか、本丸 vs サブテーマ、依存の実装状況 |
| **`DESIGN.md`** | 実装設計（what/how） | SRS・出題・TTS・データ整備タスクの設計意図 |
| **`SPECIFICATION.md`** | 画面・データフィールド・localStorage の正本 | UI 仕様、JSON スキーマ、`ga_rp_same` 定義 |
| **`docs/cursor/README.md`** | Cursor タスク履歴の索引 | 過去の指示書・実装レポートの場所 |
| **`docs/reference/README.md`** | 監査・運用ガイドの索引 | R4 レビュー、CEFR 監査、TTS 設計の詳細 |
| **`data/README.md`** | `data/` 配下の役割分担 | runtime / batches / pipeline / derived の見分け |

**衝突時の優先順位:** `PURPOSE.md` → `DESIGN.md` → `SPECIFICATION.md` → 本書の運用メモ。

**履歴ドキュメント:** `docs/cursor/reports/` 内の古いレポートは当時の語数・パスを引用する場合あり。数値・パスの正本は上表。

## Quick orientation

| Layer | Role |
|-------|------|
| **Runtime (GitHub Pages)** | `index.html` + JSON/i18n/fonts loaded by the browser |
| **Production wordlist** | `wordlist_GA_a1a2_plus_phonics.json` at repo root (**5,397 words**, Jul 2026) |
| **Pipeline** | `scripts/*.py` read/write `data/pipeline/` staging JSON, merge into wordlist |
| **Batch imports** | `data/batches/` — Phase 1/2 merge sources（[`data/batches/README.md`](../data/batches/README.md)） |
| **GAS TTS** | `gas/` — Google Apps Script proxy; not loaded by static site |
| **Task history** | `docs/cursor/` — Cursor instruction + implementation reports（[`docs/cursor/README.md`](cursor/README.md)） |
| **Canonical specs** | `docs/PURPOSE.md`, `docs/DESIGN.md`, `docs/SPECIFICATION.md`（読み分けは上表） |

**Path helper for Python:** `scripts/paths.py` defines canonical paths. Prefer importing it over hard-coded strings.

**Data folder map:** [`data/README.md`](../data/README.md) — runtime / batches / pipeline / derived / patches / archive の見分け方。

---

## Directory tree

```
english-pronunciation-trainer/
├── index.html                 # ★ SPA app（Decode/Encode, Mode B, Connected Speech, vocab browser, progress checks）
├── README.md                  # 人間向け概要（デモ URL・ローカル起動）
├── wordlist_GA_a1a2_plus_phonics.json   # ★ PRODUCTION wordlist（runtime fetch・ルート固定）
├── wordlist_GA_a1a2_plus_phonics.csv    # CSV export（pipeline / i18n tooling）
│
├── data/
│   ├── README.md              # ★ data/ 配下の役割分担（AI 向け）
│   ├── connected_speech.json  # ★ RUNTIME — 201 linking phrases（+ cefr, ga_rp_same）
│   ├── weak_forms.json        # ★ RUNTIME — 36 weak forms（+ cefr, ga_rp_same）
│   ├── guide.json             # ★ RUNTIME — multilingual onboarding（8 sections × 6 langs）
│   ├── batches/               # マージ入力（ブラウザ非読込）→ README.md 参照
│   │   ├── phase1_m*_*.json, phase2_*.json
│   │   └── gap_*.json         # 将来拡充分析（未マージ）
│   ├── pipeline/              # IPA / respelling ステージング → README.md 参照
│   │   ├── phase2a_*.json, phase2b_*.json
│   │   ├── ga_rp_same_report.json
│   │   └── r4_pending_review_list.{json,csv}
│   ├── derived/               # neighbors, RP IPA 進捗（マージ中間・非 runtime）
│   │   ├── wordlist_with_neighbors.json
│   │   ├── wordlist_with_neighbors_slim.json
│   │   ├── rp_progress.json, rp_complete.json
│   ├── patches/               # 過去の一括パッチ（def, gloss-fil, hotfix 等）
│   │   └── phase2_audit/      # Phase B 監査パッチ（wordlist / batch sync）
│   └── archive/               # ローカル退避（gitignore）→ README.md 参照
│
├── docs/
│   ├── README.md                # ★ docs/ 索引（AI 向け・最初の案内）
│   ├── REPOSITORY-STRUCTURE.md  # ★ フォルダマップ（Claude 共有用）
│   ├── PURPOSE.md               # Goals, modes, dependency table（source of truth）
│   ├── DESIGN.md                # Implementation design
│   ├── SPECIFICATION.md         # Full spec（screens, data fields, localStorage）
│   ├── cursor/                  # AI タスク履歴 → README.md 参照
│   │   ├── instructions/        # cursor-instructions-*.md
│   │   ├── reports/             # cursor-implementation-report-*.md
│   │   └── briefs/              # 設計相談ブリーフ
│   ├── reference/               # 監査・意思決定・運用ガイド → README.md 参照
│   ├── testing/                 # Manual test checklists
│   └── archive/                 # 旧ドキュメント退避
│
├── scripts/                   # Python pipeline（paths.py がパス正本）→ 下表「Key scripts」
├── tools/                     # merge_def, validate_i18n, gen_audit_docs, …
├── gas/                       # Code.gs, BatchWarm.gs, BatchWords.gs, README
├── i18n/                      # UI strings + phonemes/（6 languages）
├── fonts/                     # Doulos SIL（IPA）
└── tests/                     # tts-ab-listener.html（TTS experiment）
```

---

## Runtime data contract (`index.html`)

These paths are **hard-coded** in the app. Do not move without updating `index.html`.

| Asset | Path |
|-------|------|
| Wordlist | `wordlist_GA_a1a2_plus_phonics.json` |
| Connected speech | `data/connected_speech.json` |
| Weak forms | `data/weak_forms.json` |
| Guide | `data/guide.json` |
| UI i18n | `i18n/{en,ja,ko,zh-Hans,zh-Hant,fil}.json` |
| Phoneme help | `i18n/phonemes/{lang}.json` |
| IPA font | `fonts/DoulosSIL-Regular.woff2` |
| TTS | External `GAS_TTS_URL` in `index.html` → `gas/Code.gs` deployment |

---

## Wordlist snapshot (2026-07-10)

| Metric | Value |
|--------|------:|
| Total words | **5,397** |
| CEFR A1 | 1,187 |
| CEFR A2 | 1,195 |
| CEFR B1 | 2,116 |
| CEFR B2 | **899**（Phase 2 M2 完了: pilot 179 + M2 390） |
| `rp_ipa` | 5,397（100%） |
| `ga_rp_same` | 5,397（100% 付与）。**same=2,674 / different=2,723**（Phase R 後） |
| `neighbors` 非空 | 5,113（94%） |
| 全体 0 近傍率 | 5% |
| `ipa_actual_ga`（flap 候補） | ~529 |
| R4 pending（TTS review） | **127** |
| `respell_ga` drafted | ~5,260 |
| gloss 5 langs | 5,397 |

---

## Connected speech & weak forms

| File | Count | Notes |
|------|------:|-------|
| `data/connected_speech.json` | 201 | `cefr` + `ga_rp_same`; vocab browser Phrases タブに CEFR バッジ表示 |
| `data/weak_forms.json` | 36 | 同上; 練習時 Connected Speech Type=weak で出題 |

---

## Common pipeline commands

Run from **repo root**:

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
| `scripts/gen_ga_rp_same.py` | `ga_rp_same` / `ga_rp_same_reason` 一括付与（分類器。Phase R1 で dead-code 修正済み） |
| `scripts/ga_to_rp.py` | GA→RP ルール変換（**offline fallback のみ**。本番 `rp_ipa` は Claude バッチ同梱） |
| `scripts/gen_rp_ipa.py` | Claude API で RP IPA 生成（新規バッチ用。SYSTEM_PROMPT に happY ルールあり） |

Staging outputs → `data/pipeline/`. Neighbors / RP progress → `data/derived/`. Merge scripts write `wordlist_GA_a1a2_plus_phonics.json`.

---

## Phase 2 B2 expansion workflow（M2 完了後）

1. Receive `phase2_mN_*_with_gloss.json`（`rp_ipa` 同梱）→ `data/batches/`
2. Merge into wordlist（重複スキップ、`_generation_source` 除去、`neighbors: []`）
3. Run pipeline（上記）
4. Verify counts; sync `data/derived/rp_progress.json` from wordlist
5. Add `docs/cursor/instructions/` + `docs/cursor/reports/`

**Phase 2 M2 完了:** 569 語追加（B2 330→899）。残り B2 約 1,423 語は M3 以降。設計: `docs/reference/c1-expansion-scope-design.md`

**Phase R 完了（2026-07-10）:** 分類器修正 + happY rp_ipa 91語是正 + `phonology_lexicon.py` 統合。詳細: `docs/cursor/reports/cursor-implementation-report-phase-r.md`

---

## R4 pending（TTS レビュー）

| Asset | Path |
|-------|------|
| 機械抽出リスト | `data/pipeline/phase2a_review_needed.json`（127 語） |
| 作業用リスト（拡張） | `data/pipeline/r4_pending_review_list.json` / `.csv` |
| 手順ガイド | `docs/reference/r4-pending-review-guide.md` |

---

## GAS / audio

| File | Role |
|------|------|
| `gas/Code.gs` | TTS proxy（word / phrase / weak / warm） |
| `gas/BatchWarm.gs` | Scheduled GA Drive pre-generation |
| `gas/BatchWords.gs` | Word list for batch warm（**5,397 語** — `export_batch_words.py` で更新） |
| `gas/README.md` | Deploy + API reference |

---

## What not to confuse

| Item | Location |
|------|----------|
| Production wordlist | **Root** `wordlist_GA_a1a2_plus_phonics.json` |
| Neighbors slim（merge 元） | `data/derived/wordlist_with_neighbors_slim.json` |
| Phase 2 staging | `data/pipeline/`（not root, not runtime） |
| R4 作業 CSV/JSON | `data/pipeline/r4_pending_review_list.*`（**not** `docs/reference/`） |
| Cursor task docs | `docs/cursor/**`（古いレポートは pre-reorg パスを引用する場合あり） |
| Spec truth | `PURPOSE.md` > `DESIGN.md` > `SPECIFICATION.md` |

---

## UI behaviour snapshot (2026-07-10)

| Feature | Implementation |
|---------|----------------|
| Progress checks | `ept_checks_v1` — 3 slots × 3 modes（`d`/`e`/`l`）; vocab browser + Reveal + Mode B Study |
| Frequency weighting | `weightedShuffle` + `frequencyWeight` in session pool build |
| Alt-accent same display | `/ipa/（同じ）` via `ga_rp_same` flag（`scripts/gen_ga_rp_same.py`） |
| Vocab browser Phrases | CEFR badge per row（`itemCefrLabel`） |
| Session exit | `#exitConfirmModal` on drill screens |
| CEFR setup filters | Pills with 0 results disabled; Mode A: A1/A2/B1（B2 は Mode B バンドで利用） |

---

## Local dev

```bash
python3 -m http.server 8080
# http://localhost:8080  (file:// blocks JSON fetch)
```

GitHub Pages deploys the **entire repo** on push to `main` (`.github/workflows/static.yml`).
