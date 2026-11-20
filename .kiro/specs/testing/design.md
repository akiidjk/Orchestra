# Testing — Design

## Context

Orchestra is a Next.js 15 (App Router) + React 19 + TypeScript app with no test tooling. This adds Vitest as the single runner for unit, component, and API-route tests, colocated with source.

## Goals

- One runner, one config, colocated tests.
- No `tsconfig` changes that could affect the app — explicit imports instead of globals.
- Coverage available on demand.

## Non-Goals

- E2E / browser testing (Playwright). Can be added later as a separate spec.
- Storybook / visual regression.

## Stack

- **Vitest 5** — test runner (Jest-compatible, Vite-based). Requires Node ^22.12 || ^24 || >=26; CI pins Node 22.
- **@vitejs/plugin-react 6** — JSX transform for component tests.
- **vite 8** — engine for plugin-react and vitest (devDependency only; not used by Next's build).
- **jsdom 31** — DOM environment for component tests.
- **@testing-library/react 16** + **@testing-library/jest-dom 8** + **@testing-library/user-event 14** — component testing (React 19 compatible).
- **@vitest/coverage-v8 5** — coverage via the V8 profiler.

## Configuration

- `vitest.config.ts` — jsdom environment, setup file, `@` → repo-root alias (mirrors `tsconfig.json` paths via `@rollup/plugin-alias`, which only matches `@/...` not `@scope/...`), v8 coverage scoped to `app/`, `components/`, `lib/`.
- `tests/setup.ts` — `import "@testing-library/jest-dom/vitest"` registers the DOM matchers.

## Test types and environments

- Unit — `lib/utils.test.ts` (default jsdom).
- Component — `components/ui/button.test.tsx`, `app/page.test.tsx` (jsdom + React Testing Library).
- API route — `app/api/health/route.test.ts` (`// @vitest-environment node`; uses the global `Response`).

## Conventions

- Colocate tests next to source as `*.test.{ts,tsx}`.
- Explicit imports from `vitest` (`describe`, `it`, `expect`, `vi`) — no global mutation of `tsconfig`.
- Server components render in tests like any function component (no `"use client"` needed for rendering).

## Scripts

| Command                 | What it does                 |
| ----------------------- | ---------------------------- |
| `npm test`              | Run all tests once (CI gate) |
| `npm run test:watch`    | Watch mode for local dev     |
| `npm run test:coverage` | Run tests with v8 coverage   |

## Risks

| Risk                                      | Mitigation                                                                               |
| ----------------------------------------- | ---------------------------------------------------------------------------------------- |
| `@` alias colliding with scoped packages  | `@rollup/plugin-alias` only matches `@/...`, not `@scope/...`                            |
| React 19 + RTL compatibility              | Pinned `@testing-library/react@^16` and `jest-dom@^8` (both support React 19 / vitest 5) |
| Local Node 25 unsupported by vitest/jsdom | Tests run on Node 25 with engine warnings; CI pins Node 22 LTS                           |
