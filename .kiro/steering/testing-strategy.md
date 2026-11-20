---
inclusion: always
---

# Testing Strategy — Orchestra

## Principio guida

Ogni invariante del gioco deve essere verificabile con un test automatico. Le regole in game-rules.md sono la fonte delle specifiche di test.

## Livelli di test

### Unit test -- motore di gioco

Target: lib/engine/, lib/domain/, lib/validation/

Questi moduli non dipendono da I/O, quindi i test sono puri e veloci (Vitest).

**Test obbligatori per invarianti:**

```
INV-1: stanza con meno di 2 o piu di 8 giocatori -> costruttore fallisce
INV-2: ogni turno ha esattamente 1 GM -> costruttore fallisce con 0 o 2+ GM
INV-3: GM non e tra i guesser -> GameRuleViolationError se tenta di rispondere
INV-4: ballot ha esattamente 5 opzioni distinte -> costruttore fallisce con duplicati o count != 5
INV-5: exacty 1 risposta corretta nel ballot -> costruttore fallisce se correctAnswer non e nelle options
INV-6: punteggio calcolato server-side -> Score.speedMs e sempre derivato da timestamp server, non client
INV-7: risposta sbagliata definitiva -> secondo tentativo di risposta lancia GameRuleViolationError(ALREADY_LOCKED)
INV-8: timer parte dal reveal -> ScoringEngine usa Turn.ballotRevealedAt, non Turn.createdAt
INV-9: punteggi assegnati solo dopo Reveal -> scoring prima di REVEAL lancia GameRuleViolationError
INV-10: stanza scade dopo 24h -> Room.expiresAt = createdAt + 24h, non rinnovabile automaticamente
```

**Test obbligatori per casi limite (da game-rules.md):**

```
EDGE-1: GM supera i 30s -> WordAutoGenerator produce una parola valida e il turno procede
EDGE-2: tutti i guesser rispondono sbagliato -> GM riceve +1
EDGE-3: nessun guesser risponde entro il timer -> GM riceve +1 (nessuna risposta = sbagliata)
EDGE-4: doppio invio della stessa risposta -> idempotente
EDGE-5: giocatore risponde dopo il timer -> risposta rifiutata (GameRuleViolationError TURN_EXPIRED)
EDGE-6: GM si disconnette durante WordSelection -> WordAutoGenerator interviene
EDGE-7: guesser si disconnette durante ActiveGuessing -> non blocca gli altri, il suo score rimane 0
```

### Unit test -- scoring

Target: lib/engine/ScoringEngine.ts

| Situazione | Pts attesi |
|-----------|------------|
| Primo a rispondere correttamente | +3 |
| Secondo a rispondere correttamente (entro primo 50% del timer) | +2 |
| Risponde correttamente oltre il 50% del timer | +1 |
| Risposta sbagliata | 0 |
| GM, nessuno indovina | +1 |
| GM, almeno uno indovina | 0 |

> La scala esatta +1/+2 per le risposte corrette non-prime e da definire; da registrare come ADR in architecture-decisions.md prima dell'implementazione.

### Integration test -- API routes

Target: app/api/

- Risposta a un turno gia concluso -> errore TURN_EXPIRED
- GM tenta di rispondere nel proprio turno -> errore NOT_A_GUESSER
- Risposta inviata due volte dallo stesso giocatore -> idempotente
- Risposta post-lock -> errore ALREADY_LOCKED
- Stanza pubblica appare in /api/rooms; stanza privata non appare

### E2E test (opzionale per la demo)

- Flusso completo: crea stanza -> join -> turno GM -> ballot reveal -> risposta corretta -> punteggio
- GM supera il timer: parola auto-generata, turno procede normalmente

## Naming convention

```
[stato iniziale] quando [azione] allora [esito atteso]

Esempi:
- Turn in ACTIVE_GUESSING quando guesser risponde due volte allora lancia GameRuleViolationError(ALREADY_LOCKED)
- Turn in WORD_SELECTION quando GM supera i 30s allora WordAutoGenerator genera parola e turno avanza
```
