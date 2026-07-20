# React prototype

This directory is an isolated Track B prototype for testing a React + Vite
migration path without changing the current production SPA.

## Purpose

- Keep the existing `src/index.template.html` and runtime data contract
  unchanged.
- Build a small React surface that proves component state can replace one
  existing UI concern: the CEFR filter.
- Capture early migration decisions before a larger React rewrite begins.

## Run locally

```bash
npm install
npm run dev
```

The Vite dev server starts on port 5173 by default.

To check the production build for this prototype:

```bash
npm run build
```

## What is included

- Vite app shell with React and TypeScript.
- `CEFRFilter` component with A1, A2, B1, B2, C1, and C2 toggle buttons.
- Minimal parent `App` state that prints the selected levels as JSON.

## Decision summary

- **TypeScript**: selected for Phase 1 so component props and CEFR level unions
  are explicit from the first prototype. This gives later migration phases a
  typed seam for runtime data and i18n integration.
- **No state management library**: selected because this prototype only needs
  local component state and one parent callback. Adding a store now would create
  architecture before the app-level state boundaries are known.
- **Local `.gitignore`**: selected to keep `node_modules/` and `dist/` scoped to
  the prototype. The existing root ignore already covers `node_modules/`, but a
  local ignore makes the experimental artifact boundary clear.
- **Set-based multiple selection**: selected because the existing vocabulary
  browser CEFR filter behaves as a multi-select filter. The callback returns an
  ordered array to keep parent state and debug output deterministic.
- **No Vite React plugin yet**: selected to honor the Issue constraint that the
  dependency set stay limited to React, ReactDOM, TypeScript, and Vite. If Fast
  Refresh behavior becomes important in Phase 2, the plugin can be evaluated
  deliberately.

## Phase 2 and later tasks

- Decide whether React becomes a parallel app under `experimental/` for longer
  or moves into the main build pipeline.
- Define how `i18n/{lang}.json` is loaded and typed in React without changing
  the current i18n schema.
- Map the runtime data contract paths into React data loaders without moving or
  renaming production JSON files.
- Decide how TTS integration crosses from the current GAS-oriented implementation
  into React components.
- Evaluate whether `@vitejs/plugin-react`, ESLint, and a typecheck script should
  be introduced once dependency policy is expanded.
- Define route ownership and build output policy before exposing any React
  prototype through Vercel.
- Add interaction tests for filter state once the Track B test stack is chosen.
