---
name: implement-game-transition
description: Procedura per implementare una transizione di stato del turno in Orchestra. Usare quando si aggiunge o modifica una fase del ciclo di vita del turno (WordSelection, BallotBuilding, ActiveGuessing, Reveal, Completed) o quando si implementa una nuova azione consentita in una fase.
---

# Implement Game Transition

## Quando usare questa skill

- Si implementa una nuova transizione tra fasi del turno.
- Si aggiunge un'azione consentita in una fase esistente.
- Si corregge una transizione che non rispetta le precondizioni.
- Si gestisce un'azione fuori sequenza o scaduta.

## Passi obbligatori

### 1. Identifica stato iniziale e finale

Consulta docs/state-machine.md e la tabella fasi in game-rules.md.

Definisci con precisione:
- Stato iniziale: quale TurnPhase deve essere attivo.
- Stato finale: in quale TurnPhase si entra dopo la transizione.
- Chi puo eseguire l'azione: GM o guesser (mai entrambi per la stessa azione).
- Se la transizione ha un timeout automatico (es. WordSelection -> WordAutoGenerator dopo 30s).

### 2. Identifica le azioni autorizzate

Verifica in game-rules.md la tabella Fasi e azioni consentite:
- L'azione e consentita nella fase corrente?
- Chi e autorizzato?
- C'e un timer che scade automaticamente la fase?

### 3. Verifica le precondizioni

Prima di applicare la transizione, StateMachine.ts deve verificare:

| Precondizione | Dove verificarla |
|---------------|-----------------|
| Fase corrente corrisponde | StateMachine.applyTransition() |
| Attore ha il ruolo corretto | GameRulesValidator.checkRole() |
| Turno non scaduto (timer) | GameRulesValidator.checkTurnNotExpired() |
| Giocatore non gia bloccato | GameRulesValidator.checkPlayerNotLocked() |

### 4. Gestisci i timeout automatici

Le fasi con timer (WordSelection: 30s, ActiveGuessing: configurabile) hanno una transizione automatica:

- WordSelection scaduta: WordAutoGenerator genera una parola, il turno avanza a BallotBuilding.
- ActiveGuessing scaduto: il turno avanza a Reveal con le risposte pervenute fino a quel momento.

Il timer e gestito lato server (setInterval o job scheduler); non dipende dall'input del client.

### 5. Gestisci le azioni fuori sequenza

Ogni azione ricevuta nel contesto sbagliato deve restituire un errore esplicito:

```typescript
if (turn.phase !== TurnPhase.ACTIVE_GUESSING) {
  throw new GameRuleViolationError(
    'WRONG_PHASE',
    'Azione answer non consentita in fase ' + turn.phase
  );
}
```

Non ignorare silenziosamente le azioni fuori sequenza.

### 6. Gestisci le azioni duplicate

Le risposte duplicate sono idempotenti:
- Verifica se la risposta e gia registrata.
- Se si, restituisce lo stato attuale senza modifiche.
- Se no, applica la transizione.

### 7. Produci i test di transizione

Per ogni transizione implementata:

```
[fase iniziale] quando [azione valida] allora [nuovo stato e effetti]
[fase iniziale] quando [azione in fase sbagliata] allora [GameRuleViolationError WRONG_PHASE]
[fase iniziale] quando [timer scaduto] allora [transizione automatica corretta]
[fase iniziale] quando [azione duplicata] allora [stato invariato, nessun errore]
[fase iniziale] quando [risposta dopo lock] allora [GameRuleViolationError ALREADY_LOCKED]
```

## Checklist prima di aprire una PR

- [ ] Transizione aggiunta o aggiornata in StateMachine.ts
- [ ] Precondizioni verificate in GameRulesValidator.ts
- [ ] Gestione azione fuori sequenza: errore esplicito
- [ ] Gestione azione duplicata: idempotenza
- [ ] Timeout automatico gestito (se la fase ha un timer)
- [ ] Test di transizione scritti (almeno 4 casi per transizione)
- [ ] docs/state-machine.md aggiornato se il diagramma cambia
- [ ] Evento WebSocket corrispondente emesso (se la transizione e visibile ai client)
