---
inclusion: always
---

# Uordz — workflow operativo per sviluppo assistito

## 1. Analisi iniziale

Prima di scrivere codice:

1. classificare il lavoro come frontend, backend/realtime, contratto condiviso, documentazione o build/deployment;
2. individuare entry point, servizio chiamante, endpoint, route API e test esistenti;
3. verificare se esiste già un helper o pattern riutilizzabile;
4. identificare gli stati, i ruoli (Game Master vs indovinatore), le fasi del turno e le stanze coinvolte;
5. definire i casi di errore e i dati che devono restare nascosti fino alla rivelazione.

Per funzionalità non banali produrre prima una breve specifica con:

- obiettivo utente;
- comportamento normale;
- transizioni di stato / fasi del turno;
- payload e snapshot;
- autorizzazioni (chi può fare cosa in quale fase);
- errori;
- test di accettazione;
- impatto su documentazione.

## 2. Modifica del codice

Applicare modifiche chirurgiche e coerenti con il codice esistente.

Regole obbligatorie:

- mantenere TypeScript strict e le convenzioni del repository (App Router, alias `@/*`, Tailwind v4);
- mantenere logica di stato, punteggio e timing lato server; non spostarla nel frontend;
- non duplicare la logica di punteggio;
- validare input e autorizzazione sul server;
- non restituire fallback che nascondano errori;
- non usare cast o workaround non necessari;
- aggiungere commenti solo per logica non ovvia;
- non cancellare o sovrascrivere modifiche estranee già presenti.

Per una nuova mutazione lato server (route API, server action o messaggio WebSocket) controllare esplicitamente: autenticazione/sessione, stanza, fase del turno, ruolo (Game Master o indovinatore), body, transizione ammissibile, marca temporale della rivelazione, calcolo dei punteggi e serializzazione dello snapshot senza soluzione prematura.

Per un nuovo controllo frontend controllare esplicitamente: stato disabled, feedback di errore, loading/busy, accessibilità (ruoli, label, stato disabled/selected/checked, focus, messaggi live), tema e comportamento responsive (desktop/tablet primi, mobile secondario).

## 3. Specifiche e test

I test devono verificare il comportamento, non dettagli interni.

Per le regole coprire quando pertinente:

- stanza pubblica/privata e codice di 6 caratteri;
- creazione stanza: lingua target, numero di manche, tempo limite;
- validazione della parola (parola ammessa/rifiutata, scadenza dei 30s con autogenerazione);
- generazione delle 5 opzioni (1 vera + 4 false);
- fasi del turno e transizioni;
- risposte e lock-out dopo risposta errata;
- punteggi scalati per velocità e pareggi;
- rotazione del Game Master tra i partecipanti;
- sincronizzazione in tempo reale via WebSocket (inizio turno, rivelazione, chat, ingresso/uscita);
- disconnessione e riconnessione (posto trattenuto, ripristino nickname/avatar/punteggio, autogenerazione se il Game Master si disconnette);
- rematch e scadenza delle stanze inattive (24h);
- snapshot senza soluzione prematura.

Non usare servizi esterni né dipendere da rete reale nei test (nessuna API di traduzione reale, nessun WebSocket verso un server esterno; usare doppioni/mock).

## 4. Comandi di verifica

```bash
npm run lint
npm run format:check
npm run typecheck
npm test
npm run build
```

Per modifiche puramente documentali non serve una build. Per modifiche al contratto o al flusso, verificare entrambi i lati. Se un comando fallisce per una dipendenza mancante, installarla solo dopo aver verificato il manifest e senza aggiornare dipendenze non richieste.

## 5. Documentazione

Aggiornare `README.md` quando cambiano:

- comandi di avvio;
- variabili d'ambiente;
- endpoint;
- body o risposta;
- fasi del turno;
- regole di punteggio;
- limiti di persistenza, sicurezza o deployment.

Aggiornare `DESIGN.md` quando cambia il design di prodotto (identità, flusso di gioco, punteggi, stanze, ciclo di vita, fuori ambito).

## 6. Gestione degli errori

Gli errori devono essere espliciti e azionabili:

- backend: status, code e message coerenti;
- frontend: messaggio visibile e stato ripristinabile;
- risposta persa dopo una mutazione: rileggere lo snapshot prima di ripetere;
- sessione scaduta o token invalido: dimenticare la sessione locale e informare l'utente;
- errore inatteso: non trasformarlo in un successo fittizio.

## 7. Chiusura del lavoro

Prima della consegna:

1. eseguire le verifiche pertinenti (lint, format:check, typecheck, test, build);
2. controllare che il diff contenga solo file richiesti;
3. verificare che non siano presenti segreti, token, URL privati o file temporanei;
4. controllare compatibilità del contratto frontend/backend;
5. riportare test eseguiti e limiti residui in modo sintetico;
6. non creare commit automaticamente senza richiesta esplicita.
