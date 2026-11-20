# Testing — Requirements

## Overview

A complete, idiomatic testing setup for the Orchestra Next.js app: unit, component, and API-route tests with a single runner, colocated with the source, plus on-demand coverage.

## User Stories

### US-1: Run the suite with one command

**As a** developer on Orchestra
**I want** a single command to run all tests
**so that** I can verify changes quickly and in CI.

#### Acceptance Criteria

- `npm test` runs every `*.test.{ts,tsx}` file and exits non-zero on failure.
- Component tests run in jsdom; API-route tests run in a node environment.
- The `@/*` import alias resolves in tests exactly as in the app.

### US-2: Tests live next to the code

**As a** developer
**I want** tests colocated with the code they cover
**so that** tests stay in sync and are easy to find.

#### Acceptance Criteria

- Test files sit beside source as `*.test.ts` / `*.test.tsx`.
- React Testing Library and jest-dom matchers are available.
- Example tests cover `lib/utils.ts`, `components/ui/button.tsx`, `app/page.tsx`, and `app/api/health/route.ts`.

### US-3: Measure coverage on demand

**As a** developer
**I want** a coverage report
**so that** I can track the 80% target from the project philosophy.

#### Acceptance Criteria

- `npm run test:coverage` prints a text report and writes an HTML report to `coverage/`.
- Coverage is measured over `app/`, `components/`, and `lib/`, excluding test files.
- No thresholds are enforced (the 80% target is informational).
