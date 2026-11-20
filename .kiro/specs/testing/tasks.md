# Testing — Tasks

- [x] T1: Install test devDependencies (vitest, @vitejs/plugin-react, vite, jsdom, @testing-library/*, @vitest/coverage-v8)
- [x] T2: Add `vitest.config.ts` (jsdom env, setup file, `@` alias, v8 coverage scope)
- [x] T3: Add `tests/setup.ts` (jest-dom matchers)
- [x] T4: Add `lib/utils.test.ts`
- [x] T5: Add `components/ui/button.test.tsx`
- [x] T6: Add `app/page.test.tsx`
- [x] T7: Add `app/api/health/route.test.ts` (node env)
- [x] T8: Add `test`, `test:watch`, `test:coverage` scripts to package.json

## Verification

- [x] `npm test` → all tests green
- [x] `npm run typecheck` → no type errors
- [x] `npm run build` → still builds
