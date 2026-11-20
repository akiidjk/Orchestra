---
inclusion: always
---

<<<<<<< HEAD
# Uordz — stack tecnico

## Panoramica tecnica (da DESIGN.md)

- **Backend:** server Node.js che gestisce lo stato delle stanze, la logica dei turni, il punteggio, la validazione delle parole, la traduzione e la generazione dei falsi. Connessioni WebSocket per la sincronizzazione in tempo reale dello stato (inizio turno, rivelazione delle risposte, messaggi di chat, eventi di ingresso/uscita dei giocatori).
- **Frontend:** web-first (React). Layout responsive rivolto a desktop e tablet grande; il mobile è funzionale ma secondario.
- **Validazione della parola:** lookup sul dizionario all'invio. Il backend verifica la parola sottomessa contro un dizionario multilingue prima di accettarla e prima di generare le traduzioni.
- **Traduzione + generazione falsi:** API di traduzione esterna per la risposta vera; opzioni false generate lato server usando campionamento dal dizionario e pattern morfologici della lingua target, in modo che i falsi sembrino plausibili.
- **Sincronizzazione in tempo reale:** WebSocket per tutto lo stato live (fasi del turno, rivelazione delle risposte, chat, presenza dei giocatori). Il server marca il timestamp della rivelazione delle opzioni e calcola tutti i punteggi scalati per velocità lato server, per impedire la manipolazione da parte del client.
- **Sessione:** nickname e avatar sono persistiti nel `sessionStorage` del browser e inviati alla riconnessione per ripristinare il giocatore nel suo posto senza reinserire i dati.

Nessun account utente persistente. Nessuna cronologia messaggi lato server. Nessuna app mobile nativa.

## Stato attuale del repository

Il frontend è **implementato** come app Next.js 15 (App Router) alla radice del repository: React 19, TypeScript in modalità strict, Tailwind CSS v4 via `@tailwindcss/postcss`.

Il backend realtime Node/Node con WebSocket descritto in DESIGN.md **fa parte del design ma non è ancora stato creato** nel repository. Non presupporre che esista: lo stato delle stanze, la logica dei turni, i punteggi, la validazione delle parole, la traduzione, la generazione dei falsi e la sincronizzazione WebSocket devono essere realizzati prima che il prodotto funzioni end-to-end. Lo stato di un endpoint deve essere derivato dal codice effettivamente presente, non dal design.

## Fatti di ingegneria consolidati

- Package manager: npm (lockfile `package-lock.json`).
- Runtime: Node.js `>=22.12.0` dichiarato in `engines` (in `package.json`); la CI fissa Node 22 LTS. Localmente usa un Node LTS (22.x) se si incontrano problemi.
- Testing: Vitest 5 + React Testing Library (`@testing-library/react`) + `@testing-library/jest-dom`. Ambiente jsdom per i componenti, node per le route API (via pragma `// @vitest-environment node`). Coverage v8 via `@vitest/coverage-v8`.
- Formattazione: Prettier 3.
- CI: GitHub Actions (`.github/workflows/ci.yml`) su Node 22 LTS: lint → format check → typecheck → test con coverage → build.
- Path alias `@/*` → radice del repository (`tsconfig.json` paths; replicato in `vitest.config.ts`).
- Tailwind v4: `@import "tailwindcss";` in `app/globals.css`; contenuti auto-rilevati, nessun `tailwind.config.ts`.
- Test collocati accanto al sorgente come `*.test.{ts,tsx}`; import espliciti da vitest, niente tipi globali.

## Comandi

- Installazione: `npm install` (oppure `npm ci` in CI).
- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build`
- Avvio prod: `npm run start`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Test: `npm test` · watch: `npm run test:watch` · coverage: `npm run test:coverage`
- Formattazione: `npm run format` · check: `npm run format:check`

## Health check

`GET /api/health` → `{ "status": "ok" }`
=======
# Tech — InGliSc!

## Stack

- **Framework:** Next.js 15 (App Router), React 19, TypeScript strict
- **Styling:** Tailwind CSS v4 via `@tailwindcss/postcss`
- **Real-time:** WebSocket (da definire) per sincronizzazione fasi di gioco
- **Integrazione esterna:** Wiktionary REST API (`https://en.wiktionary.org/api/rest_v1/`)
- **Package manager:** npm (lockfile: `package-lock.json`)
- **Runtime:** Node.js (LTS raccomandato: 22.x)

## Comandi

- Install: `npm install`
- Dev: `npm run dev` → http://localhost:3000
- Build: `npm run build`
- Start prod: `npm run start`
- Lint: `npm run lint`
- Typecheck: `npm run typecheck`
- Test: `npm test`

## Configurazioni chiave

- **Tailwind v4:** `@import "tailwindcss"` in `app/globals.css`; content auto-detected, nessun `tailwind.config.ts`.
- **Path alias:** `@/*` → repo root (in `tsconfig.json`).
- **TypeScript:** strict mode, `moduleResolution: bundler`.
- **API health:** GET `/api/health` → `{ "status": "ok" }`.

## Vincoli

- `lib/domain/` e `lib/engine/` devono rimanere privi di dipendenze da Node.js, Next.js o browser API — testabili in isolamento con un runner puro (Vitest).
- Timeout per chiamate Wiktionary: 3 secondi.
- Nessuna chiave API esterna richiesta per la versione base.
>>>>>>> 52a31ea (LAVITA)
