# Structure

- Layout: Next.js App Router at the repo root, alongside the Kiro workspace config.
  ```
  app/             # App Router: layout.tsx, page.tsx, globals.css, api/health/route.ts
  components/ui/    # Shared UI components (Button)
  lib/             # Helpers (cn)
  .kiro/           # Kiro workspace: steering/, specs/, hooks/, settings/
  .agents/skills/  # Kiro agent skills
  ```
- Naming conventions:
  - App Router files: `layout.tsx`, `page.tsx`, `route.ts`
  - Components: PascalCase (e.g., `Button`)
  - Utils: camelCase (e.g., `cn`)
- Architecture notes:
  - Server components by default; `"use client"` only when state/effects are needed
  - API routes for simple endpoints; server actions for mutations
  - Import app-relative paths via the `@/*` alias
