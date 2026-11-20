---
name: review-scoring-rules
description: Procedura per verificare la correttezza del sistema di punteggio di Orchestra prima e dopo ogni modifica. Usare quando si modifica ScoringEngine.ts, quando si cambia la scala di velocita, o quando si sospetta un bug nel calcolo dei punti.
---

# Review Scoring Rules

## Quando usare questa skill

- Si sta per modificare ScoringEngine.ts.
- Si cambia la scala di punteggio (es. primo: +3, altri: +1/+2).
- Si sospetta un errore nel punteggio (bug report o test fallito).
- Si vuole verificare copertura completa prima di un deploy.

## Passi obbligatori

### 1. Raccogli le regole di punteggio

Leggi la tabella in .kiro/steering/game-rules.md, sezione Algoritmo di punteggio.

Verifica che la tabella copra tutti i casi:
- Risposta corretta, primo in stanza: +3
- Risposta corretta, non primo (scala per velocita): +1 o +2
- Risposta sbagliata: 0
- GM, nessuno indovina: +1
- GM, almeno uno indovina: 0

### 2. Verifica la scala di velocita

La scala +1/+2 per le risposte corrette non-prime e basata su:
- speedMs = PlayerAnswer.answeredAt - Turn.ballotRevealedAt (entrambi timestamp server)
- La soglia tra +1 e +2 e definita come costante in ScoringEngine.ts (es. 50% del timer)

Verifica che la costante sia documentata e testata. Se non e ancora definita, registrala come decisione aperta in docs/architecture-decisions.md.

### 3. Costruisci la matrice combinatoria

Per una stanza con N giocatori, testa almeno questi scenari:

| Scenario | Pts attesi |
|---------|------------|
| Primo a rispondere correttamente (entro 50% timer) | +3 |
| Secondo a rispondere correttamente (entro 50% timer) | +2 |
| Risponde correttamente oltre il 50% del timer | +1 |
| Risponde sbagliato | 0 |
| Tutti sbagliano -> GM | +1 al GM |
| Nessuno risponde (timer scaduto) -> GM | +1 al GM |
| GM tenta di rispondere | GameRuleViolationError NOT_A_GUESSER |

### 4. Cerca ambiguita e casi non coperti

Segnala se trovi:
- Una combinazione non coperta dalla tabella in game-rules.md.
- Una regola interpretabile in due modi (es. cosa succede se due giocatori rispondono nello stesso millisecondo).
- Un branch in ScoringEngine.ts senza test corrispondente.

Non risolvere le ambiguita autonomamente: registrarle in docs/architecture-decisions.md.

### 5. Genera o aggiorna i test

Per ogni caso non coperto:
1. Aggiungi il test in tests/unit/engine/ScoringEngine.test.ts.
2. Usa il naming: [scenario] quando [azione] allora [punti attesi].
3. Verifica che il test fallisca prima della correzione (red) e passi dopo (green).

### 6. Verifica che i timestamp siano server-side

Controlla che ScoringEngine non usi mai dati di timestamp provenienti dal client. Se trova un campo non valorizzato dal server, lancia GameRuleViolationError(INVALID_TIMESTAMP).

## Output atteso

- Testing-strategy.md aggiornato con i nuovi casi.
- Test aggiunti o corretti in ScoringEngine.test.ts.
- Eventuale voce in docs/architecture-decisions.md per ambiguita trovate.

## Segnali di allerta

- speedMs e negativo o zero -> probabile manipolazione o bug di timestamp.
- Il punteggio totale di un turno supera N*3 (impossibile) -> errore di calcolo.
- Il GM guadagna punti quando qualcuno ha indovinato -> bug nella condizione GM scoring.
