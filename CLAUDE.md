# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Personal portfolio for Matías Canepa (Product Designer). Single-page site with hero + CMS-driven work grid. Design reference: `src/assets/webdesign.png`.

## Stack

- **Vite + React 18 + TypeScript** (SPA, no router yet)
- **CSS Modules + CSS variables** for theming (no Tailwind, no UI library)
- **Vercel** for hosting; **Vercel Edge Function** at `api/projects.ts` proxies the CMS
- Always use `pnpm` (never `npm` / `npx`)

## Commands

```sh
pnpm install                  # install deps
pnpm dev                      # Vite dev server on :5173 (mocks /api/projects)
pnpm build                    # tsc -b && vite build
pnpm preview                  # serve built output locally
pnpm lint                     # tsc -b --noEmit (type check only)
pnpm exec vercel dev          # run with real Vercel functions (needs .env.local + Vercel CLI)
```

## Architecture

```
Browser → Vite static (dist/)
          └─ /api/projects → api/projects.ts (Edge Function)
                              └─ CMS_API_URL  (Authorization: Bearer CMS_API_KEY)
```

**Why the proxy?** A Vite SPA exposes any `VITE_*` env var in the client bundle. To keep the CMS key server-side it's read from non-public `CMS_API_URL` / `CMS_API_KEY` env vars inside the Edge Function and never reaches the browser. The function also adds `Cache-Control: s-maxage=60, stale-while-revalidate=300` so repeated visits hit Vercel's edge cache.

**Dev mode:** `vite.config.ts` registers a middleware that mocks `/api/projects` with 16 placeholder cards. This lets `pnpm dev` render the layout without running the proxy or hitting the live CMS. To exercise the real proxy locally, install the Vercel CLI and run `pnpm exec vercel dev` with `.env.local` populated.

## Theming

- All colors, spacing, type, radii live as CSS custom properties in `src/styles/tokens.css`.
- Light theme on `:root`, dark overrides under `[data-theme='dark']`.
- `useTheme` (in `src/hooks/useTheme.ts`) reads `localStorage.theme`, falls back to `prefers-color-scheme`, and writes `data-theme` to `<html>`. A pre-paint inline script in `index.html` applies the theme before React mounts to avoid flash.
- Components must reference variables (e.g. `var(--color-text)`) — never hardcode colors.

## CMS contract

The frontend expects `/api/projects` to return:

```ts
{ projects: Array<{ id: string; title: string; thumbnailUrl: string; url?: string }> }
```

The proxy in `api/projects.ts` currently passes the upstream response through unchanged. **If the live CMS returns a different shape, add the mapping inside `api/projects.ts` before returning the body** — keep the transformation server-side so the frontend type stays stable.

## Env vars

| Name | Where | Notes |
|------|-------|-------|
| `CMS_API_URL` | Vercel + `.env.local` | CMS endpoint that returns the project list. No `VITE_` prefix. |
| `CMS_API_KEY` | Vercel + `.env.local` | Bearer token sent server-side only. |

See `.env.example`. Never add `VITE_` to either — that would leak the key into the client bundle.

## File map

- `src/App.tsx` — composes Header + Hero + WorkGrid + Footer
- `src/components/` — one folder per UI piece, paired `.tsx` + `.module.css`
- `src/hooks/useTheme.ts` — theme state + persistence
- `src/lib/api.ts` — `fetchProjects()` against `/api/projects`
- `src/lib/types.ts` — shared `Project` / `ProjectsResponse` types
- `src/styles/tokens.css` — design tokens (single source of truth for theme)
- `src/styles/global.css` — reset + base typography
- `api/projects.ts` — Vercel Edge Function CMS proxy
- `src/assets/` — `profilepic.png`, `placeholderthumbnail.png`, `webdesign.png` (design reference)
