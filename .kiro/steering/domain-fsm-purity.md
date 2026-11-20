---
inclusion: fileMatch
fileMatchPattern: "lib/game/**/*.ts"
---

# Domain FSM Purity

La stanza è una macchina a stati: `lobby → picking → guessing → reveal → podium` (`Phase` in `lib/game/protocol.ts`). Ogni transizione vive in `Room` (`lib/game/room.ts`) e deve restare testabile in modo deterministico.

## Regole

1. **Niente I/O nel dominio.** `lib/game/room.ts`, `words.ts`, `dictionary.ts` non importano `ws`, `http`, `next` né toccano socket. L'unica uscita è la callback `send` passata a `join()`. Il trasporto sta in `lib/game/rooms.ts` e `server.ts`.
2. **Casualità iniettata.** Ogni funzione che usa random accetta un `rng: Rng` (default `Math.random`). Mai `Math.random()` inline in una funzione di dominio senza parametro.
3. **Tempo controllabile.** Il tempo passa solo da `Date.now()` e `setTimeout` dentro `Room`, così `vi.useFakeTimers()` lo pilota per intero. Niente `performance.now()`, `setInterval` o timer in moduli diversi da `Room`: sfuggono al clock virtuale.
4. **Tempi di risposta server-side.** Il delta di risposta è `Date.now() - this.shownAt`, calcolato al momento in cui il server riceve `answer`. Il client non invia mai timestamp né punteggi.
5. **Una transizione per chiamata.** Ogni metodo pubblico applica una transizione, poi chiama `changed()` una volta sola. Niente stato intermedio visibile ai client.

## Verifica

Una partita completa deve girare in un test con `vi.advanceTimersByTime`, senza attese reali (vedi `lib/game/room.test.ts` → "game flow").
