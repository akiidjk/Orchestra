---
inclusion: always
---

# Architecture — Orchestra

## Stack tecnologico

- **Frontend/BFF:** Next.js 15 (App Router), React 19, TypeScript strict
- **Styling:** Tailwind CSS v4 via @tailwindcss/postcss
- **Real-time:** WebSocket per sincronizzazione live (turn phases, ballot reveal, chat, presence)
- **Validazione parola:** Dictionary API server-side (da definire; es. Free Dictionary API o simile)
- **Traduzione + generazione fake:** Translation API esterna per la risposta corretta; generazione fake server-side
- **Package manager:** npm
- **Storage sessione:** browser sessionStorage (nickname + avatar, nessun account)

## Struttura del repository

```
app/
  api/
    room/
      route.ts              # POST /api/room -- crea stanza
      [roomId]/
        route.ts            # GET /api/room/[roomId] -- stato stanza
        join/route.ts       # POST -- giocatore si unisce
    game/
      [gameId]/
        route.ts            # GET -- stato partita
    turn/
      [turnId]/
        route.ts            # GET/PATCH -- stato turno
        word/route.ts       # POST -- GM invia parola
        answer/route.ts     # POST -- guesser risponde
    rooms/
      route.ts              # GET /api/rooms -- lista stanze pubbliche
    health/
      route.ts              # GET /api/health
  room/
    [roomId]/
      page.tsx              # Lobby + partita
  page.tsx                  # Home / open rooms browser
  layout.tsx
  globals.css

components/
  game/
    GameStage.tsx           # Layout principale del turno
    BallotCard.tsx          # Le 5 opzioni con timer
    WordInput.tsx           # Input del GM con validazione live
    ScoreBoard.tsx          # Punteggi dopo reveal
    Podium.tsx              # Classifica finale
    ChatPanel.tsx           # Chat sidebar
  room/
    OpenRoomsList.tsx       # Browser stanze pubbliche
    RoomLobby.tsx           # Lobby pre-partita con lista giocatori
    AvatarBuilder.tsx       # Costruttore avatar
  ui/
    Button.tsx
    Card.tsx
    Timer.tsx

lib/
  domain/                   # Entita di dominio (pure, no I/O)
    Room.ts
    Player.ts
    Game.ts
    Turn.ts
    WordChallenge.ts
    PlayerAnswer.ts
    Score.ts
    Avatar.ts
  engine/                   # Logica di gioco pura (no I/O)
    StateMachine.ts
    ScoringEngine.ts
    TurnLifecycle.ts
    WordAutoGenerator.ts
  validation/
    GameRulesValidator.ts
    WordValidator.ts
  integrations/
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

## Principi architetturali

- **Domain puro:** lib/engine/ e lib/domain/ non dipendono da Next.js, fetch o database. Testabili in isolamento con Vitest.
- **State machine esplicita:** le transizioni di turno sono codificate in StateMachine.ts. Nessuna transizione avviene al di fuori di essa.
- **Scoring server-side:** il timestamp del ballot reveal e applicato dal server; la velocita di risposta e calcolata server-side per prevenire manipolazioni client.
- **WebSocket per real-time:** turn start, ballot reveal, answer events, chat, player join/leave sono tutti eventi WebSocket. Le API REST gestiscono solo operazioni stateless.
- **Nessun account:** nickname e avatar vivono in sessionStorage del browser; il server li riceve alla connessione e li ripristina al reconnect.
- **Idempotenza:** doppio invio risposta non produce effetti duplicati.

## Componenti e responsabilita

| Componente | Responsabilita |
|-----------|----------------|
| StateMachine | Valida e applica le transizioni di stato del turno |
| ScoringEngine | Calcola i punti a partire da timestamp e correttezza della risposta |
| TurnLifecycle | Coordina le fasi del turno orchestrando StateMachine e ScoringEngine |
| WordValidator | Verifica che la parola del GM esista nel dizionario (via DictionaryClient) |
| WordAutoGenerator | Genera una parola valida automaticamente se il GM non risponde entro 30s |
| GameRulesValidator | Verifica le precondizioni di ogni azione di gioco |
| DictionaryClient | Chiama il dizionario esterno; restituisce WordValidation |
| TranslationClient | Chiama l'API di traduzione per ottenere la risposta corretta |
| FakeOptionGenerator | Genera le 4 opzioni false morfologicamente plausibili |

## Canale WebSocket

Eventi emessi dal server ai client:

| Evento | Quando | Payload |
|--------|--------|---------|
| turn:started | Inizio WordSelection | gameMasterId, timeLimit |
| ballot:revealed | Inizio ActiveGuessing | options[], revealTimestamp |
| answer:received | GM riceve notifica | playerId (anonimo per gli altri) |
| turn:revealed | Fine Reveal | correctAnswer, scores[] |
| player:joined | Nuovo giocatore | player (nickname, avatar) |
| player:left | Giocatore disconnesso | playerId |
| chat:message | Messaggio in chat | playerId, text, timestamp |
| game:finished | Fine partita | podium[] |
