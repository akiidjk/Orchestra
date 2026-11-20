# Tech

- Stack: Next.js 15 (App Router), React 19, TypeScript (strict), Tailwind CSS v4 via `@tailwindcss/postcss`, PostCSS
- Package manager: npm (lockfile: `package-lock.json`)
- Runtime: Node.js (developed on Node 25.1.0 / npm 12.2.2 — note: npm warns v25 is outside its supported range; use a Node LTS such as 22.x if you hit odd tooling issues)
- Commands:
  - Install: `npm install`
  - Dev: `npm run dev` → http://localhost:3000
  - Build: `npm run build`
  - Start prod: `npm run start`
  - Lint: `npm run lint`
  - Typecheck: `npm run typecheck`
- Health check: GET `/api/health` → `{ "status": "ok" }`
- Notes:
  - Tailwind v4: `@import "tailwindcss"` in `app/globals.css`; content auto-detected, no `tailwind.config.ts`
  - Path alias `@/*` → repo root (`tsconfig.json` paths)
