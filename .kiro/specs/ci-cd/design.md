# CI/CD — Design

## Context

Orchestra is a Next.js 15 + React 19 + TypeScript app on GitHub (akiidjk/Orchestra). Local dev runs on Node 25.1.0 / npm 12.2.2, which is outside the supported range of the toolchain (vitest 5, jsdom 31 require Node ^22.12 || ^24 || >=26). CI therefore pins Node 22 LTS so checks run on a supported runtime.

## Goals

- One workflow gates lint + format + typecheck + test + build.
- Fast feedback: cache dependencies, cancel superseded runs.
- Formatting enforced by Prettier (added here).

## Stack

- **GitHub Actions** — `.github/workflows/ci.yml`.
- **Prettier 3** — formatting (`format`, `format:check`).

## Workflow design

- Triggers: `push` to `main`, `pull_request` to `main`.
- Job `verify` on `ubuntu-latest`, Node 22, `npm ci` (uses the committed `package-lock.json`), `cache: npm`.
- Steps in order: Lint → Format check → Typecheck → Test with coverage → Build.
- Coverage uploaded as an artifact (`if: always()`).
- `concurrency` cancels in-progress runs for the same ref.

## Prettier

- `.prettierrc` — semi, double quotes, trailing comma `all`, 80 cols, 2-space.
- `.prettierignore` — ignores `node_modules`, `.next`, `out`, `build`, `coverage`, `package-lock.json`, `next-env.d.ts`, `.agents/` (upstream skill docs), `.kirograph/`, and extensionless files (`.gitignore`, `.prettierignore`, `*.gitkeep`).
- All in-scope files are formatted before the workflow is committed, so `format:check` starts green.

## Commands

| Command                 | What it does             |
| ----------------------- | ------------------------ |
| `npm run lint`          | ESLint via Next          |
| `npm run format`        | Prettier write           |
| `npm run format:check`  | Prettier check (CI gate) |
| `npm run typecheck`     | `tsc --noEmit`           |
| `npm test`              | Vitest run               |
| `npm run test:coverage` | Vitest run + v8 coverage |
| `npm run build`         | Next production build    |

## Continuous Deployment (future extension)

CD is intentionally out of scope until a hosting target is chosen. To add it later, append a `deploy` job that `needs: verify`, runs only on `main` pushes, and is guarded by a repository variable so it stays disabled until configured:

```yaml
deploy:
  needs: verify
  if: github.ref == 'refs/heads/main' && github.event_name == 'push' && vars.ENABLE_DEPLOY == 'true'
  runs-on: ubuntu-latest
  steps:
    - uses: actions/checkout@v4
    - uses: actions/setup-node@v4
      with:
        node-version: 22
        cache: npm
    - run: npm ci
    - run: npm run build
    # Example target: Vercel. Set VERCEL_TOKEN, VERCEL_ORG_ID, VERCEL_PROJECT_ID
    # as repository secrets, then uncomment:
    # - run: npx vercel deploy --prod --yes
    #   env:
    #     VERCEL_TOKEN: ${{ secrets.VERCEL_TOKEN }}
    #     VERCEL_ORG_ID: ${{ secrets.VERCEL_ORG_ID }}
    #     VERCEL_PROJECT_ID: ${{ secrets.VERCEL_PROJECT_ID }}
```

## Risks

| Risk                                       | Mitigation                                                                            |
| ------------------------------------------ | ------------------------------------------------------------------------------------- |
| Local Node 25 unsupported by the toolchain | CI pins Node 22 LTS; documented in `tech.md`                                          |
| `format:check` fails on unformatted files  | `.prettierignore` excludes `.agents/`; all in-scope files are formatted before commit |
| `next lint` deprecation in Next 15         | Verified locally; if it breaks, switch to a flat `eslint.config.mjs` + `eslint .`     |
