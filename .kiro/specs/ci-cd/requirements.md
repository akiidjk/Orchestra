# CI/CD — Requirements

## Overview

A GitHub Actions pipeline that gates every push and pull request to `main` with lint, formatting, typecheck, tests (with coverage), and a production build.

## User Stories

### US-1: Every change is verified before merge

**As a** maintainer of Orchestra
**I want** CI to run the full check suite on each PR and push to main
**so that** broken code never lands on main.

#### Acceptance Criteria

- A workflow triggers on push to `main` and on pull requests targeting `main`.
- The workflow runs on a supported Node LTS (22).
- It fails the run if any of lint, format check, typecheck, tests, or build fail.

### US-2: Formatting is enforced

**As a** developer
**I want** a formatter and a check that runs locally and in CI
**so that** style stays consistent without bike-shedding.

#### Acceptance Criteria

- Prettier is configured with a committed `.prettierrc` and `.prettierignore`.
- `npm run format` writes; `npm run format:check` verifies.
- CI runs `npm run format:check`.

### US-3: Test coverage is collected

**As a** maintainer
**I want** CI to produce a coverage report
**so that** coverage trends are visible.

#### Acceptance Criteria

- CI runs `npm run test:coverage` and uploads the `coverage/` directory as an artifact.
- Coverage thresholds are not enforced (the 80% target is informational, per the project philosophy).

## Non-Goals

- Continuous deployment. The hosting target is not chosen yet; a deploy stage is documented as a future extension in `design.md`.
