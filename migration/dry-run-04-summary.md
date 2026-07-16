# Dry-run 04 Summary — IPASoundDrill

- Total refs detected: 75 (期待値: 76、許容範囲: 60-91)
- Pattern breakdown:
  - markdown_link: 75 (期待値: 76)
  - wikilink: 0 (期待値: 0)
  - frontmatter: 0 (期待値: 0)
- Rewrite outcome:
  - rewritten: 75
  - broken (not rewritten): 1
- Broken ratio: 1.3% (advisory threshold: 10%)

## Sample markdown_link rewrites (up to 15)

| # | Source file | Line | Before | After |
|---|---|---:|---|---|
| 1 | README.md | 15 | `[docs/README.md](docs/README.md)` | `[[pj-2026-07-10-d270\|docs/README.md]]` |
| 2 | README.md | 16 | `[docs/PURPOSE.md](docs/PURPOSE.md)` | `[[pj-2026-06-24-933a\|docs/PURPOSE.md]]` |
| 3 | README.md | 27 | `[`gas/README.md`](gas/README.md)` | `[[pj-2026-06-24-551c\|`gas/README.md`]]` |
| 4 | README.md | 27 | `[`docs/reference/remaining-ops-checklist.md`](docs/reference/remaining-ops-checklist.md)` | `[[pj-2026-07-10-dd2c\|`docs/reference/remaining-ops-checklist.md`]]` |
| 5 | README.md | 33 | `[`docs/README.md`](docs/README.md)` | `[[pj-2026-07-10-d270\|`docs/README.md`]]` |
| 6 | README.md | 34 | `[`docs/REPOSITORY-STRUCTURE.md`](docs/REPOSITORY-STRUCTURE.md)` | `[[pj-2026-07-09-80be\|`docs/REPOSITORY-STRUCTURE.md`]]` |
| 7 | README.md | 35 | `[`docs/PURPOSE.md`](docs/PURPOSE.md)` | `[[pj-2026-06-24-933a\|`docs/PURPOSE.md`]]` |
| 8 | README.md | 36 | `[`docs/DESIGN.md`](docs/DESIGN.md)` | `[[pj-2026-06-24-1983\|`docs/DESIGN.md`]]` |
| 9 | README.md | 37 | `[`docs/SPECIFICATION.md`](docs/SPECIFICATION.md)` | `[[pj-2026-06-24-1519\|`docs/SPECIFICATION.md`]]` |
| 10 | README.md | 38 | `[`docs/reference/README.md`](docs/reference/README.md)` | `[[pj-2026-07-09-77a4\|`docs/reference/README.md`]]` |
| 11 | README.md | 39 | `[`data/README.md`](data/README.md)` | `[[pj-2026-07-10-359a\|`data/README.md`]]` |
| 12 | data/README.md | 24 | `[`docs/REPOSITORY-STRUCTURE.md`](../docs/REPOSITORY-STRUCTURE.md)` | `[[pj-2026-07-09-80be\|`docs/REPOSITORY-STRUCTURE.md`]]` |
| 13 | data/batches/README.md | 39 | `[`docs/REPOSITORY-STRUCTURE.md`](../../docs/REPOSITORY-STRUCTURE.md)` | `[[pj-2026-07-09-80be\|`docs/REPOSITORY-STRUCTURE.md`]]` |
| 14 | data/pipeline/README.md | 22 | `[`docs/reference/r4-pending-review-guide.md`](../../docs/reference/r4-pending-review-guide.md)` | `[[pj-2026-07-10-977f\|`docs/reference/r4-pending-review-guide.md`]]` |
| 15 | docs/README.md | 18 | `[`REPOSITORY-STRUCTURE.md`](REPOSITORY-STRUCTURE.md)` | `[[pj-2026-07-09-80be\|`REPOSITORY-STRUCTURE.md`]]` |

## Broken refs breakdown (if any)

- Total: 1 (ratio: 1.3%)
- By reason:
  - target_not_found: 1
  - outside_repo: 0
  - ambiguous_target: 0
- By location (上位 5 ディレクトリ):
  - docs/cursor/: 1

### Sample broken refs (first 5)

| # | Source file | Line | Referenced path | Reason |
|---|---|---:|---|---|
| 1 | docs/cursor/reports/cursor-implementation-report-cefr-phase0a.md | 72 | `wordlist-cefr-audit.md` | target_not_found |
