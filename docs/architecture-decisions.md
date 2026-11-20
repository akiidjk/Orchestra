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

### ADR-005: Soglia di velocita +2/+1 al 50% del timer (chiude OPEN-001)

Data: 2026-11-20
Stato: Accettata
Contesto: serviva una soglia numerica per le risposte corrette non-prime.
Decisione: +2 se `ms <= turnTime/2`, altrimenti +1 (`Room.reveal` in `lib/game/room.ts`).
Conseguenze: regola semplice e spiegabile ai giocatori; ritoccabile cambiando una riga.

### ADR-006: Parita di timestamp risolta con l'ordine di arrivo (chiude OPEN-002)

Data: 2026-11-20
Stato: Accettata
Contesto: due risposte corrette nello stesso millisecondo.
Decisione: il server processa i messaggi uno alla volta; a parita di `ms` vince chi e arrivato prima (ordinamento stabile). Un solo +3 per turno.
Conseguenze: deterministico, nessun caso speciale.

### ADR-007: Dizionario offline al posto di API esterne (chiude OPEN-003)

Data: 2026-11-20
Stato: Accettata
Contesto: le API di traduzione richiedono chiavi e rete e rallentano la validazione live.
Decisione: dizionario multilingue incluso nel repo (`lib/game/dictionary.ts`, ~230 concetti EN/IT/FR/ES/DE). Falsi = 2 parole reali simili + 2 pseudo-parole mutate (`lib/game/words.ts`). Le parole sorgente sono accettate in una delle 5 lingue, non in "qualsiasi lingua".
Conseguenze: zero dipendenze esterne, test deterministici, validazione istantanea. Vocabolario limitato: estendibile con un dump Wiktionary. Diverge da `game-rules.md` ("via API di traduzione esterna").

### ADR-008: Struttura compatta e tutto su WebSocket (proposta di revisione di ADR-001/ADR-003)

Data: 2026-11-20
Stato: Proposta
Contesto: `architecture.md` prevede ~25 file (`lib/domain/*`, `lib/engine/*`, `lib/services/*`) e REST per crea/join. L'implementazione attuale copre tutte le regole e invarianti con meno moduli.
Decisione attuale: dominio in `lib/game/room.ts` (stato, transizioni, punteggio, snapshot) + `words.ts` + `protocol.ts`; registry e dispatch in `lib/game/rooms.ts`; `server.ts` unico processo (Next + WebSocket `/ws` + `GET /api/rooms`). Crea/join passano dal WebSocket perche lo store e in memoria nel processo di `server.ts` e i route handler Next girano in istanze di modulo separate. `room.ts` usa `setTimeout` e `node:crypto` (deviazione da ADR-001).
Conseguenze: meno file e nessuna duplicazione dello stato; se si vuole la struttura di `architecture.md`, estrarre `ScoringEngine` (funzione di `reveal`) e la state machine da `room.ts` senza cambiare il protocollo.

### ADR-009: Doppio invio della risposta idempotente

Data: 2026-11-20
Stato: Accettata
Contesto: `game-rules.md` chiede che il secondo invio non abbia effetto.
Decisione: `Room.answer` ignora silenziosamente le risposte successive alla prima.
Conseguenze: nessun errore mostrato per doppio click; la prima risposta resta definitiva.
