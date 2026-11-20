# Orchestra

A Next.js application, built on the [kiro-templates](https://github.com/kiroclawai/kiro-templates) `nextjs-starter`. Managed as a Kiro workspace.

## Stack

- **Next.js 15** with App Router
- **React 19**
- **TypeScript** (strict)
- **Tailwind CSS v4** via `@tailwindcss/postcss`

## Quick start

```bash
npm install
npm run dev
```

Open http://localhost:3000. Health check at http://localhost:3000/api/health returns `{ "status": "ok" }`.

## Scripts

| Command             | What it does            |
| ------------------- | ----------------------- |
| `npm run dev`       | Start the dev server     |
| `npm run build`     | Production build         |
| `npm run start`     | Run the production build |
| `npm run lint`      | ESLint                   |
| `npm run typecheck` | TypeScript check (no emit) |

## Structure

```
.
├── app/
│   ├── layout.tsx        # Root layout
│   ├── page.tsx          # Home page
│   ├── globals.css       # Tailwind entry (@import "tailwindcss")
│   └── api/health/route.ts
├── components/ui/        # Shared UI (Button)
├── lib/utils.ts         # Helpers (cn)
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── .kiro/                # Kiro workspace (steering, specs, hooks, settings)
└── .agents/skills/       # Kiro agent skills
```

## Conventions

- Server components by default; `"use client"` only when you need state or effects.
- API routes for simple endpoints, server actions for mutations.
- Import app-relative paths via the `@/*` alias (see `tsconfig.json`).
- Tailwind v4 auto-detects content sources, so there is no `tailwind.config.ts`; extend the theme with `@theme` in `globals.css`.
