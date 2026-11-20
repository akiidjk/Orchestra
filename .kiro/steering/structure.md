---
inclusion: always
---

<<<<<<< HEAD
# Struttura

- Layout: Next.js App Router alla radice del repository, insieme alla configurazione del workspace Kiro.
  ```
  app/                      # App Router: layout.tsx, page.tsx, globals.css, api/health/route.ts
  components/ui/            # Componenti UI condivisi (Button)
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
  Il servizio backend realtime descritto in DESIGN.md (Node.js + WebSocket, stato delle stanze, logica dei turni, validazione delle parole, traduzione, generazione dei falsi, punteggi) **non è ancora presente** nel repository.
- Convenzioni di naming:
  - File App Router: `layout.tsx`, `page.tsx`, `route.ts`
  - Componenti: file lowercase, componente PascalCase (es. `button.tsx` → `Button`)
  - Utils: camelCase (es. `cn`)
  - Test: `*.test.ts` / `*.test.tsx`, collocati accanto al sorgente
- Note di architettura:
  - Server components per default; `"use client"` solo quando servono stato o effetti.
  - Route API per endpoint semplici; server actions per le mutazioni.
  - Stato e punteggi autoritativi lato server: il server marca il timestamp della rivelazione delle opzioni e calcola i punteggi scalati per velocità; i client inviano intenzioni, non esiti.
  - La risposta corretta non rivelata non deve trapelare ai client prima della rivelazione.
  - Nickname e avatar persistiti nel `sessionStorage` del browser e inviati alla riconnessione; nessun account utente persistente.
  - Layout responsive web-first: desktop e tablet grande come obiettivo principale, mobile secondario.
  - Import dei path relativi all'app via alias `@/*` (configurato anche per Vitest).
=======
# Structure — Orchestra

## Layout del repository

```
app/
  api/
    room/
      route.ts              # POST -- crea stanza (pubblica o privata)
      [roomId]/
        route.ts            # GET -- stato stanza
        join/route.ts       # POST -- unisciti con nickname+avatar
    game/
      [gameId]/
        route.ts            # GET -- stato partita corrente
    turn/
      [turnId]/
        route.ts            # GET -- stato turno
        word/route.ts       # POST -- GM invia parola (con validazione)
        answer/route.ts     # POST -- guesser risponde (con timestamp server)
    rooms/
      route.ts              # GET -- lista stanze pubbliche (open lobby)
    health/
      route.ts              # GET { status: ok }
  room/
    [roomId]/
      page.tsx              # Lobby pre-partita + schermata di gioco
  page.tsx                  # Home: open rooms browser + crea/unisciti
  layout.tsx
  globals.css

components/
  game/
    GameStage.tsx           # Layout principale del turno attivo
    BallotCard.tsx          # Le 5 opzioni con timer ad arco
    WordInput.tsx           # Input del GM con feedback validazione live
    ScoreBoard.tsx          # Delta punteggi dopo reveal
    Podium.tsx              # Classifica finale
    ChatPanel.tsx           # Chat sidebar (non sovrapposta al gioco)
  room/
    OpenRoomsList.tsx       # Lista stanze pubbliche nella home
    RoomLobby.tsx           # Lobby con lista giocatori e avatar
    AvatarBuilder.tsx       # Costruttore avatar (stile skribbl.io)
  ui/
    Button.tsx
    Card.tsx
    Timer.tsx

lib/
  domain/                   # Entita di dominio (pure, no I/O, no framework)
    Room.ts
    Player.ts
    Game.ts
    Turn.ts
    WordChallenge.ts
    PlayerAnswer.ts
    Score.ts
    Avatar.ts
  engine/                   # Logica di gioco (pura, no I/O)
    StateMachine.ts
    ScoringEngine.ts
    TurnLifecycle.ts
    WordAutoGenerator.ts
  validation/
    GameRulesValidator.ts
    WordValidator.ts
  integrations/             # Client verso servizi esterni
    DictionaryClient.ts
    TranslationClient.ts
    FakeOptionGenerator.ts

docs/
  domain-glossary.md
  state-machine.md
  scoring-invariants.md
  architecture-decisions.md

.kiro/
  steering/
  specs/
    game-engine/
  hooks/

tests/
  unit/
    engine/
    domain/
    validation/
  integration/
    api/
```

## Naming conventions

- App Router: layout.tsx, page.tsx, route.ts
- Componenti: PascalCase (GameStage.tsx, BallotCard.tsx)
- Moduli lib: PascalCase per classi (ScoringEngine.ts), camelCase per utility
- Test: stessa struttura di lib/ sotto tests/unit/

## Architecture notes

- Server components di default; use client solo per stato/effetti (timer, WebSocket, avatar builder).
- lib/domain/ e lib/engine/ non importano mai da app/ o components/.
- Import alias @/* -> repo root (tsconfig.json).
- WebSocket per eventi real-time; API REST per operazioni stateless (crea stanza, join, lista rooms).
- sessionStorage lato client per nickname + avatar; nessun server-side session.
>>>>>>> 52a31ea (LAVITA)
