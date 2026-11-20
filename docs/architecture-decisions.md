# Architecture Decisions — Orchestra

Registro delle decisioni architetturali e delle ambiguita aperte da risolvere prima dell'implementazione.

## Formato

```
### ADR-NNN: [Titolo breve]
Data: YYYY-MM-DD
Stato: Proposta | Accettata | Rifiutata | Deprecata
Contesto: [Perche questa decisione e stata necessaria]
Decisione: [Cosa si e scelto]
Conseguenze: [Effetti positivi e negativi]
```

---

## Decisioni

### ADR-001: Dominio puro senza dipendenze da framework
Data: 2026-11-20
Stato: Accettata
Contesto: Il motore di gioco (StateMachine, ScoringEngine) contiene logica critica che deve essere testabile in isolamento.
Decisione: lib/domain/ e lib/engine/ non importano da Node.js, Next.js o browser API. Solo TypeScript standard.
Conseguenze: Test unitari veloci senza mock complessi. I componenti React e le API routes dipendono dal dominio, non viceversa.

### ADR-002: Scoring e timestamp server-side
Data: 2026-11-20
Stato: Accettata
Contesto: Il punteggio di velocita e il core del gioco. Manipolazioni del timestamp client invaliderebbero la gara.
Decisione: Turn.ballotRevealedAt e PlayerAnswer.answeredAt sono valorizzati esclusivamente dal server. ScoringEngine non accetta timestamp dal client.
Conseguenze: I client non possono manipolare il punteggio. La latenza di rete e accettata come variabile intrinseca del gioco.

### ADR-003: WebSocket per real-time, REST per operazioni stateless
Data: 2026-11-20
Stato: Accettata
Contesto: Le fasi del turno (ballot reveal, risposte, chat) richiedono notifiche push ai client. Le operazioni di setup (crea stanza, join) sono semplici request/response.
Decisione: WebSocket per tutti gli eventi live. API REST per crea stanza, join, lista stanze pubbliche, health.
Conseguenze: Architettura ibrida. Il server mantiene connessioni WebSocket per tutta la durata della stanza.

### ADR-004: Nessun account, sessionStorage per identita
Data: 2026-11-20
Stato: Accettata
Contesto: Ridurre l'attrito di accesso e un obiettivo esplicito del prodotto.
Decisione: Nickname e avatar sono persistiti in browser sessionStorage e inviati al server alla connessione. Il server li usa per identificare il giocatore nella stanza.
Conseguenze: Nessun sistema di autenticazione. Impossibile verificare l'identita tra sessioni diverse. Accettabile per il tipo di gioco.

---

## Ambiguita aperte (da risolvere prima dell'implementazione)

### OPEN-001: Scala di velocita (+1 vs +2)
La distinzione tra +1 e +2 per le risposte corrette non-prime e basata su una soglia percentuale del timer.
La soglia esatta non e ancora definita. Decisione richiesta: 50% del timer? 30%? Vedi docs/scoring-invariants.md.

### OPEN-002: Parita di timestamp
Se due giocatori rispondono correttamente nello stesso millisecondo, entrambi prendono +3 oppure si usa l'ordine di arrivo al server?

### OPEN-003: API dizionario e traduzione
L'API per validazione parola e quella per la traduzione corretta non sono ancora scelte. Candidati: Free Dictionary API, DeepL, LibreTranslate. La scelta impatta DictionaryClient.ts e TranslationClient.ts.
