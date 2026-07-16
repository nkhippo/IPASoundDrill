---
id: pj-2026-07-02-0525
aliases:
- pj-2026-07-02-0525
title: Archived internal tools
created: '2026-07-02'
---
# Archived internal tools

## `review-vntv.html` + `phase2a_review_needed.json`

Phase 2a VntV TTS review tool (52 words). Naoya completed the review in July 2026; results were merged in Phase 2 final.

To run again locally (historical reference only):

```bash
python3 -m http.server 8000
# open http://localhost:8000/tools/archive/review-vntv.html
```

Note: `review-vntv.html` fetches `data/pipeline/phase2a_review_needed.json` (relative to repo root via `../../data/pipeline/`).
