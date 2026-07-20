# React prototype (Track B Phase 1)

Isolated Vite + React + TypeScript sandbox under `experimental/`.  
**Does not affect** production `src/index.template.html`, runtime data contract, i18n, or Vercel deploy.

Issue: [#101](https://github.com/nkhippo/IPASoundDrill/issues/101)

## Purpose

Prove that a React + Vite workspace can coexist with the current static SPA, by re-implementing only a **CEFR filter skeleton** (A1–C2 multi-toggle + parent `onChange`).

This is a feasibility / decision surface for Track B — not a product feature.

## Run

```bash
cd experimental/react-prototype
npm install
npm run dev
```

Open the printed localhost URL. Click CEFR pills; the JSON dump at the bottom should update.

```bash
npm run build   # typecheck + production bundle → dist/
npm run preview # optional: serve dist/
```

## Decision summary (Phase 1)

| Decision | Choice | Why |
|---|---|---|
| Language | **TypeScript** | Track B should establish type safety early; props/`CEFRLevel` union catch mistakes cheaply |
| State library | **None** (`useState` only) | One component + parent callback; Redux/Zustand would obscure the prototype |
| Selection model | **Multi-select** via `Set` → `CEFRLevel[]` to parent | Matches Setup/Vocab pills in `src/index.template.html` (`S.cefrLevels` / `vocabCefrSelected`) |
| Levels shown | **A1–C2** (6 buttons) | Issue scope; production Setup currently exposes A1–B2 only — C1/C2 are prototype-only |
| Default selection | A1 + A2 on | Mirrors Setup `#cefrPills` defaults |
| UI framework | **None** | Keep deps to React / ReactDOM / Vite / TS |
| Lint tooling | Vite template default (`oxlint` script present) | No extra ESLint stack; avoid over-setup |
| `.gitignore` | **Local** `experimental/react-prototype/.gitignore` **plus** root note for `experimental/**/dist/` | Local keeps the prototype self-contained; root covers accidental `dist` if tooling lands elsewhere under `experimental/` |

## Phase 2+ open questions

1. **i18n integration** — How to share `i18n/*.json` (169+ keys × 6 langs) without duplicating schema? Vite alias to repo `i18n/` vs copy-on-build?
2. **TTS / GAS** — Browser CORS and `GAS_TTS_URL` from a Vite origin; keep proxy in GAS or move to Railway early?
3. **Runtime data contract** — Fetch `wordlist_GA_a1a2_plus_phonics.json` and `data/*.json` from Vite; pathing relative to `/` vs `/experimental/` on Vercel.
4. **Build output integration** — Ship React under a path (e.g. `/lab/`) beside `/{lang}/index.html`, or replace the SPA later? Vercel `vercel.json` must stay untouched until a dedicated Issue.
5. **CEFR parity** — Align A1–B2-only Setup vs vocab All-toggle vs this A1–C2 set; single source of truth for levels.
6. **Component extraction map** — Which SPA regions migrate next (Decode card, Mode B, vocab browser)? Needs a Recon of `src/index.template.html` ownership boundaries.
7. **Testing** — Vitest + Testing Library for filter state; Playwright against both SPA and prototype?
8. **develop branch** — Track B branching (`develop`-first) is documented but `develop` does not exist yet; Phase 2 should create it before more Track B work.

## Out of scope (this directory)

- Editing production HTML / runtime JSON / i18n / `vercel.json`
- Feature parity with production CEFR UX
- Multi-language UI labels
