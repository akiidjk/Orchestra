# Scoring Invariants — Orchestra

Questo documento trasforma le regole di punteggio in condizioni verificabili. E' la fonte da cui derivano i test in testing-strategy.md.

## Invarianti del punteggio

```
SCORE-INV-1: i punteggi vengono assegnati solo dopo il Reveal, mai durante ActiveGuessing.
SCORE-INV-2: il punteggio di velocita e calcolato da (PlayerAnswer.answeredAt - Turn.ballotRevealedAt), entrambi timestamp server.
SCORE-INV-3: speedMs non puo essere negativo o zero; un valore non valido produce GameRuleViolationError(INVALID_TIMESTAMP).
SCORE-INV-4: il primo giocatore a rispondere correttamente guadagna +3.
SCORE-INV-5: i giocatori successivi che rispondono correttamente guadagnano +1 o +2 in base alla velocita relativa.
SCORE-INV-6: una risposta sbagliata vale 0 punti.
SCORE-INV-7: il GM guadagna +1 se e solo se nessun giocatore ha risposto correttamente.
SCORE-INV-8: il GM guadagna 0 se almeno un giocatore ha risposto correttamente.
SCORE-INV-9: il GM non risponde al ballot del proprio turno; qualsiasi tentativo produce GameRuleViolationError(NOT_A_GUESSER).
SCORE-INV-10: il punteggio di un turno e immutabile dopo Completed.
```

## Scala di velocita (da definire come ADR)

La distinzione tra +1 e +2 per le risposte corrette non-prime e basata su una soglia percentuale del timer.
La soglia esatta (es. 50% del timer = +2, oltre = +1) deve essere registrata come ADR in architecture-decisions.md prima dell'implementazione.

Costante da definire in ScoringEngine.ts:
```typescript
const FAST_RESPONSE_THRESHOLD = 0.5; // 50% del timer
```

## Tabella completa per test

| Giocatore | Risposta | speedMs vs soglia | Pts |
|-----------|---------|-------------------|-----|
| Primo a rispondere correttamente | corretta | -- | +3 |
| Non primo, entro soglia | corretta | <= THRESHOLD | +2 |
| Non primo, oltre soglia | corretta | > THRESHOLD | +1 |
| Qualsiasi | sbagliata | -- | 0 |
| GM (nessuno indovina) | -- | -- | +1 |
| GM (almeno uno indovina) | -- | -- | 0 |

## Ambiguita aperte

- Soglia +1/+2 non ancora definita numericamente. Da risolvere come ADR prima dell'implementazione di ScoringEngine.ts.
- Parita di timestamp (due giocatori nel medesimo ms): da definire se entrambi prendono +3 o se si usa ordine di arrivo al server.
