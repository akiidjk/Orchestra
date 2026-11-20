---
inclusion: always
---

# Coding Standards — Orchestra

## TypeScript

- Strict mode attivo (strict: true in tsconfig.json).
- Nessun any esplicito. Usare unknown e narrowing.
- Preferire type per union e intersections, interface per contratti di oggetti.
- Tutti i metodi pubblici delle classi di dominio hanno docstring JSDoc.

## Naming

| Costrutto | Convenzione | Esempio |
|-----------|-------------|---------|
| Classi di dominio | PascalCase | Turn, ScoringEngine |
| Interfacce | PascalCase senza I | PlayerAnswer, RoomState |
| Enum | PascalCase, valori SCREAMING_SNAKE | TurnPhase.ACTIVE_GUESSING |
| Funzioni/metodi | camelCase, verbo | calculateScore(), applyTransition() |
| File componenti | PascalCase | GameStage.tsx, BallotCard.tsx |
| File utility/lib | PascalCase per classi, camelCase per moduli | ScoringEngine.ts |
| Costanti | SCREAMING_SNAKE | MAX_PLAYERS = 8, WORD_SELECTION_TIMEOUT_MS = 30000 |

## Struttura di un file di dominio

```typescript
// 1. Imports
// 2. Tipi/interfacce locali
// 3. Costanti
// 4. Classe/funzione principale con docstring
// 5. Export
```

## Gestione degli errori

- Le azioni di gioco non valide lanciano GameRuleViolationError (non errori generici).
- GameRuleViolationError include: code (stringa della regola violata), message leggibile, context opzionale.
- Codici di errore standard: WRONG_PHASE, NOT_GAME_MASTER, NOT_A_GUESSER, ALREADY_LOCKED, TURN_EXPIRED, ROOM_FULL.
- I client HTTP (DictionaryClient, TranslationClient) non rilanciano: restituiscono Result<T, Error>.

## Pattern di stato

- Lo stato del turno e immutabile: ogni transizione restituisce un nuovo oggetto stato.
- Nessuna mutazione diretta sugli oggetti di dominio fuori da StateMachine.

## Real-time

- Gli eventi WebSocket sono tipizzati (discriminated union su type).
- Il server non invia mai dati che rivelano la risposta corretta prima del Reveal.
- I timestamp negli eventi WebSocket sono sempre server-side (Date.now() lato server).

## Testing

- Ogni invariante del gioco (vedi game-rules.md) deve avere almeno un test unitario corrispondente.
- I casi limite elencati in game-rules.md sono test obbligatori, non facoltativi.
- Naming dei test: [stato iniziale] quando [azione] allora [esito atteso].

## Componenti React

- Server components di default; use client solo per stato/effetti (timer, WebSocket, sessionStorage).
- Nessuna logica di dominio nei componenti: i componenti chiamano API o server actions.
- Il punteggio non viene mai calcolato o stimato lato client.
