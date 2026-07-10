# Reference documents — index for AI consultation

> **Purpose:** Quick map of stable reference material in `docs/reference/`.  
> **Last updated:** 2026-07-10

Use this folder when sharing context with Claude **in addition to** [`../REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) and the consultation brief you are working on.

**このフォルダに置くもの:** 監査レポート・意思決定記録・運用ガイド（人間が読む説明文書）  
**置かないもの:** パイプライン中間 JSON → [`../../data/pipeline/`](../../data/pipeline/)（例: R4 作業リスト）

---

## Start here (canonical specs)

| File | Role |
|------|------|
| [`../PURPOSE.md`](../PURPOSE.md) | Why the app exists; Mode A/B; dependency status |
| [`../DESIGN.md`](../DESIGN.md) | Implementation design; session flow; TTS; GA/RP |
| [`../SPECIFICATION.md`](../SPECIFICATION.md) | Screens, data fields, scoring, localStorage |
| [`../REPOSITORY-STRUCTURE.md`](../REPOSITORY-STRUCTURE.md) | Folder map; runtime paths; pipeline commands |

---

## Phase 2 & vocabulary expansion (2026-07-10)

| File | Role |
|------|------|
| [`phase2-m2-completion-summary.md`](phase2-m2-completion-summary.md) | Phase 2 M2 完了サマリ（5,397 語、B2=899） |
| [`c1-expansion-scope-design.md`](c1-expansion-scope-design.md) | Phase 2/3 全体設計 |
| [`r4-pending-review-guide.md`](r4-pending-review-guide.md) | R4 TTS レビュー手順（データ: `data/pipeline/r4_pending_review_list.*`） |

---

## Active / recent topics

| Topic | Brief / report | Related |
|-------|----------------|---------|
| GA↔RP `ga_rp_same` | [`../cursor/briefs/cursor-ga-rp-same-flag-consultation.md`](../cursor/briefs/cursor-ga-rp-same-flag-consultation.md) | `scripts/gen_ga_rp_same.py` |
| Progress checks | [`../cursor/instructions/cursor-instructions-progress-checks.md`](../cursor/instructions/cursor-instructions-progress-checks.md) | `ept_checks_v1` in `index.html` |
| Alt-accent UI | [`../cursor/briefs/cursor-alt-accent-display-brief.md`](../cursor/briefs/cursor-alt-accent-display-brief.md) | `report-alt-accent-display.md` |
| CEFR on connected / weak | `cefr-connected-weak-proposal-report.md` | Phrases tab CEFR badges（実装済） |
| RP neighbors (deferred) | `rp-neighbors-priority-decision.md` | `neighbors_report.md` |
| RP TTS | `rp-tts-design-and-priority.md` | `gas/README.md` |
| Vocab page migration | [`../cursor/reports/cursor-implementation-report-phase-v.md`](../cursor/reports/cursor-implementation-report-phase-v.md) | 実装済（`#vocabPage` / `#/vocab`）。設計メモ: [`../cursor/briefs/cursor-vocab-page-migration.md`](../cursor/briefs/cursor-vocab-page-migration.md) |
| TTS first-question latency | [`../cursor/reports/cursor-implementation-report-phase-t.md`](../cursor/reports/cursor-implementation-report-phase-t.md) | `?urls=1` / preread。GAS 手動残作業: [`remaining-ops-checklist.md`](remaining-ops-checklist.md) |
| Phase 2 batch quality audit | [`../cursor/reports/cursor-implementation-report-phase-b-batch-audit.md`](../cursor/reports/cursor-implementation-report-phase-b-batch-audit.md) | gloss.zh / Fil / バッチ同期 |
| **Remaining ops (GAS / BatchWarm)** | [`remaining-ops-checklist.md`](remaining-ops-checklist.md) | 再デプロイ・`migratePublicSharing`・検証 |

---

## Audits & generated reports

| File | Contents | Regenerate |
|------|----------|------------|
| `i18n-audit.md` | UI + phoneme i18n key matrix (6 langs) | `python3 tools/gen_audit_docs.py` |
| `gloss-flags.md` | gloss quality flags per word | same |
| `wordlist-cefr-audit.md` | CEFR assignment audit (Phase 0) | manual |
| `neighbors_report.md` | neighbors v2 quality stats | `python3 scripts/gen_neighbors.py` |
| `i18n-language-scaling.md` | Adding a new UI language | manual |

---

## Cursor task history

Ongoing task briefs and reports: [`../cursor/README.md`](../cursor/README.md)

Older reports may cite paths from before the 2026-07-09 reorg; trust `REPOSITORY-STRUCTURE.md` for current paths.

---

## Runtime code quick map

| Asset | Path |
|-------|------|
| UI logic | `index.html` |
| Production wordlist | `wordlist_GA_a1a2_plus_phonics.json` |
| RP rule fallback | `scripts/ga_to_rp.py` |
| Pipeline paths | `scripts/paths.py` |
| Connected speech | `data/connected_speech.json` |
