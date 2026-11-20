---
name: add-game-rule
description: Procedura per modificare o aggiungere una regola di gioco in Orchestra. Usare quando si introduce una nuova regola, si modifica una esistente (es. timer, punteggio, numero giocatori) o si gestisce un caso limite non coperto. Garantisce coerenza tra regole, state machine, scoring e test.
---

# Add Game Rule

## Quando usare questa skill

- Si introduce una nuova regola di gioco.
- Si modifica una regola esistente (es. cambio del timer, del numero max di giocatori, della scala punteggi).
- Si scopre un caso limite non coperto dalle regole attuali.
- Si risolve una discrepanza tra il codice e game-rules.md.

## Passi obbligatori

### 1. Identifica la regola esistente

Cerca in .kiro/steering/game-rules.md la regola da modificare o il punto di inserimento.
Verifica se la regola e citata anche in domain-model.md, testing-strategy.md o in commenti del codice.

### 2. Analizza le dipendenze

Prima di modificare qualsiasi cosa, rispondi a queste domande:

- La regola riguarda una transizione di stato? -> impatta StateMachine.ts
- La regola riguarda il punteggio o la velocita? -> impatta ScoringEngine.ts e testing-strategy.md
- La regola riguarda la struttura del ballot? -> impatta WordChallenge.ts e GameRulesValidator.ts
- La regola riguarda le azioni consentite a un ruolo? -> impatta GameRulesValidator.ts e le API routes
- La regola riguarda il timer? -> impatta TurnLifecycle.ts e le costanti in game-rules.md

### 3. Verifica gli effetti sulla state machine

Controlla che la nuova regola non:
- Introduca una transizione ciclica non intenzionale.
- Renda irraggiungibile uno stato (es. ACTIVE_GUESSING non piu raggiungibile).
- Violi un invariante esistente (lista invarianti in game-rules.md).

Se viola un invariante, non procedere autonomamente: registra la discrepanza in docs/architecture-decisions.md e chiedi conferma.

### 4. Aggiorna i documenti

Nell'ordine:
1. .kiro/steering/game-rules.md -- fonte autorevole
2. .kiro/steering/domain-model.md -- se la regola modifica entita o invarianti del modello
3. .kiro/steering/testing-strategy.md -- aggiorna o aggiungi test obbligatori

### 5. Aggiorna il codice

Nell'ordine:
1. lib/domain/ -- se la regola cambia struttura delle entita
2. lib/validation/GameRulesValidator.ts -- aggiungi o aggiorna la validazione
3. lib/engine/StateMachine.ts o ScoringEngine.ts -- applica la logica
4. API routes -- se cambiano le autorizzazioni per ruolo

### 6. Genera i test

Per ogni modifica alla regola:
- Aggiorna il test dell'invariante corrispondente (es. INV-1 se cambia il numero max di giocatori).
- Aggiungi test per i nuovi casi limite.
- Verifica che tutti i test della tabella punteggi in testing-strategy.md siano ancora coperti.

## Output atteso

- game-rules.md aggiornato.
- Codice aggiornato con validazione e logica.
- Test aggiunti o aggiornati.
- Se c'era una discrepanza: voce in docs/architecture-decisions.md.

## Segnali di allerta

- La nuova regola contraddice un invariante -> stop, registra, chiedi.
- La modifica tocca sia il punteggio sia le transizioni -> suddividi in due modifiche separate.
- Non esiste un test per la regola che stai modificando -> scrivi il test prima del codice.
