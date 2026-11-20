---
inclusion: always
---

# Struttura

- Layout: Next.js App Router alla radice del repository, insieme alla configurazione del workspace Kiro.
  ```
  server.ts                 # Server Node custom: Next + WebSocket /ws + GET /api/rooms
  app/                      # App Router: home (page.tsx), room/[code]/page.tsx, globals.css, api/health
  components/               # avatar.tsx, profile-form.tsx, ui/ (Button), game/ (stage, lobby, chat, scoreboard, podium)
  lib/game/                 # Dominio lato server: protocol, dictionary, words, room, rooms
  lib/client/               # Solo browser: hook use-room, sessionStorage, suoni
  lib/                      # Helper (cn)
  tests/setup.ts            # Setup Vitest (matchers jest-dom)
  *.test.{ts,tsx}           # Test collocati accanto al sorgente
  vitest.config.ts          # Config del test runner
  package.json
  tsconfig.json
  next.config.ts
  postcss.config.mjs
  .github/workflows/ci.yml  # Pipeline CI
  .kiro/                    # Workspace Kiro: steering/, specs/, hooks/, settings/
  .agents/skills/           # Skill degli agent Kiro
  ```
  Il backend realtime (stato delle stanze, turni, validazione, traduzione, falsi, punteggi) vive in `lib/game/` ed è servito da `server.ts` nello stesso processo di Next.
- Convenzioni di naming:
  - File App Router: `layout.tsx`, `page.tsx`, `route.ts`
  - Componenti: file lowercase, componente PascalCase (es. `button.tsx` → `Button`)
  - Utils: camelCase (es. `cn`)
  - Test: `*.test.ts` / `*.test.tsx`, collocati accanto al sorgente
- Note di architettura:
  - Server components per default; `"use client"` solo quando servono stato o effetti.
  - Il traffico di gioco passa dal WebSocket di `server.ts`, non da route handler Next (girano in istanze di modulo separate e non condividerebbero lo store in memoria).
  - Stato e punteggi autoritativi lato server: il server marca il timestamp della rivelazione delle opzioni e calcola i punteggi scalati per velocità; i client inviano intenzioni, non esiti.
  - La risposta corretta non rivelata non deve trapelare ai client prima della rivelazione.
  - Nickname e avatar persistiti nel `sessionStorage` del browser e inviati alla riconnessione; nessun account utente persistente.
  - Layout responsive web-first: desktop e tablet grande come obiettivo principale, mobile secondario.
  - Import dei path relativi all'app via alias `@/*` (configurato anche per Vitest).
