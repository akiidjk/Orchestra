---
inclusion: always
---

# Uordz — workflow operativo per sviluppo assistito

## 1. Analisi iniziale

Prima di scrivere codice:

1. classificare il lavoro come dominio (`lib/game/`), trasporto (`server.ts`, `lib/game/rooms.ts`), client (`lib/client/`, `components/`, `app/`), documentazione o build/CI;
2. individuare il messaggio del protocollo (`lib/game/protocol.ts`) coinvolto e i test esistenti;
3. identificare fasi (`lobby → picking → guessing → reveal → … → podium`) e ruoli (host, Game Master, giocatore);
4. definire errori e dati che devono restare nascosti (soluzione prima della rivelazione, token).

Per funzionalità non banali aggiornare prima la spec in `.kiro/specs/uordz/` (requirements, design, tasks).

## 2. Modifica del codice

- TypeScript strict, Prettier, alias `@/*` nel codice Next (import relativi in `server.ts` e `lib/game/`).
- La logica di dominio sta solo in `lib/game/room.ts`: il client non calcola punteggi, non decide transizioni, non conosce la soluzione.
- Ogni input del client passa dai parser di `protocol.ts` (`parseProfile`, `parseSettings`, `cleanText`).
- Gli errori per l'utente sono `GameError` con messaggio chiaro, inviati come `{ type: "error" }`.
- Ogni mutazione di `Room`: valida chiamante, fase e ruolo; applica una transizione; chiama `changed()` per inviare gli snapshot personalizzati.
- Cambiare il contratto significa aggiornare insieme: `protocol.ts`, `room.ts`/`rooms.ts`, `use-room.ts`, componenti, test e spec.
- Testi UI in inglese. Accessibilità: label, `aria-pressed`, `disabled`, regioni live; mai il colore come unico segnale.

## 3. Test

- Dominio: `lib/game/*.test.ts` in ambiente node con `vi.useFakeTimers()` (timer di scelta, turno, rivelazione, riconnessione).
- UI: componenti puri (snapshot + callback) testati con RTL senza WebSocket.
- Nessuna rete reale nei test.

## 4. Comandi di verifica

```bash
npm test
npm run typecheck
npm run lint
npm run format:check
npm run build
```

Per il flusso completo: `npm run dev` e una partita con due finestre del browser.

## 5. Documentazione

Aggiornare `README.md` quando cambiano comandi, variabili d'ambiente, protocollo, fasi, punteggi o limiti (stato in memoria, istanza singola).

## 6. Chiusura del lavoro

1. eseguire le verifiche;
2. controllare che il diff contenga solo file pertinenti;
3. nessun segreto, token o file temporaneo;
4. riportare test eseguiti e limiti residui;
5. non creare commit senza richiesta esplicita.
