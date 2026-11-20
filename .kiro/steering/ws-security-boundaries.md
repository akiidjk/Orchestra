---
inclusion: fileMatch
fileMatchPattern: "{lib/game/**/*.ts,server.ts,lib/client/**/*.ts}"
---

# WebSocket Security Boundaries

## Uscita: solo proiezioni

1. **Vietato serializzare lo stato grezzo.** Mai `JSON.stringify(room)` né spread di campi privati di `Room` in un `ServerMsg`. Ai client va solo `Room.snapshot(playerId)`, la proiezione per giocatore.
2. **Zero-leak fino al reveal.** Durante `picking` e `guessing`, `Snapshot` non contiene `correctIndex`, `turnPoints`, `concept`, né le risposte degli altri giocatori (solo il booleano `answered`). Questi campi compaiono solo in fase `reveal`/`podium`.
3. **Chat effimera.** I messaggi chat si inoltrano e basta, nessuna persistenza.

## Ingresso: validazione stretta

4. **Ogni payload è `unknown`.** Passa da `cleanText`, `parseProfile`, `parseSettings` o da un nuovo `parse*` in `lib/game/protocol.ts` prima di toccare il dominio. Tipi sconosciuti → `error`, mai eccezione non gestita che chiude il socket.
5. **Rate limit per socket.** Una sola risposta per turno (la prima è definitiva, `Room.answer`); la chat è limitata per giocatore. Ogni nuovo tipo di messaggio client deve dichiarare il proprio limite.
6. **Errori senza dettagli interni.** Solo `GameError.message` arriva al client; gli altri errori diventano un messaggio generico.

## Verifica

`lib/game/rooms.test.ts` → "zero-leak" ispeziona i frame reali inviati via WebSocket durante `guessing`.
