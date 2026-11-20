---
inclusion: always
---

# InGliSc — workflow operativo per sviluppo assistito

## 1. Analisi iniziale

Prima di scrivere codice:

1. classificare il lavoro come frontend, backend, contratto condiviso, documentazione o build/deployment;
2. individuare entry point, servizio chiamante, endpoint e test esistenti;
3. verificare se esiste già un helper o pattern riutilizzabile;
4. identificare gli stati, ruoli e fasi coinvolti;
5. definire i casi di errore e i dati che devono restare nascosti.

Per funzionalità non banali produrre prima una breve specifica con:

- obiettivo utente;
- comportamento normale;
- transizioni di stato;
- payload e snapshot;
- autorizzazioni;
- errori;
- test di accettazione;
- impatto su documentazione.

## 2. Modifica del codice

Applicare modifiche chirurgiche e coerenti con il codice esistente.

Regole obbligatorie:

- mantenere JavaScript/JSX e CommonJS dove già presenti;
- non spostare logica di dominio nel frontend;
- non duplicare la logica di punteggio;
- mantenere messaggi UI in italiano;
- conservare i codici errore API;
- validare input e autorizzazione sul server;
- non restituire fallback che nascondano errori;
- non usare cast o workaround non necessari;
- aggiungere commenti solo per logica non ovvia;
- non cancellare o sovrascrivere modifiche estranee già presenti.

Per una nuova mutazione backend controllare esplicitamente: autenticazione, lobby, fase, ruolo, body, transizione, `rev`, timestamp e serializzazione dello snapshot.

Per un nuovo controllo frontend controllare esplicitamente: stato disabled, feedback di errore, loading/busy, accessibilità, tema e comportamento web/native.

## 3. Specifiche e test

I test devono verificare il comportamento, non dettagli interni.

Per le regole backend coprire quando pertinente:

- lobby e nickname;
- valori validi e invalidi di `roundCount`;
- autenticazione e autorizzazione;
- fasi non valide;
- scelte iniziali e finali;
- scarto;
- cambio singolo;
- punteggi e pareggi;
- rotazione del paroliere;
- bot;
- abbandono, host e rematch;
- snapshot senza soluzione prematura;
- scadenza lobby.

Non usare servizi esterni o dipendere da rete reale nei test.

## 4. Comandi di verifica

Backend:

```bash
cd inglisc-be
npm test
```

Frontend:

```bash
cd inglisc
npx expo install --check
npx expo export --platform web --output-dir /tmp/inglisc-web --max-workers 1
```

Per modifiche puramente documentali non serve una build. Per modifiche al contratto o al flusso, verificare entrambi i lati. Se un comando fallisce per una dipendenza mancante, installarla solo dopo aver verificato il manifest e senza aggiornare dipendenze non richieste.

## 5. Documentazione

Aggiornare `README.md` quando cambiano:

- comandi di avvio;
- variabili d'ambiente;
- endpoint;
- body o risposta;
- fasi;
- regole di punteggio;
- limiti di persistenza, sicurezza o deployment.

Aggiornare `DEPLOYMENT.md` quando cambia il modo di esporre o configurare il backend.

## 6. Gestione degli errori

Gli errori devono essere espliciti e azionabili:

- backend: `ApiError` con status, code e message coerenti;
- frontend: messaggio visibile e stato ripristinabile;
- risposta persa dopo una mutazione: rileggere lo snapshot prima di ripetere;
- sessione scaduta o token invalido: dimenticare la sessione locale e informare l'utente;
- errore inatteso: non trasformarlo in un successo fittizio.

## 7. Chiusura del lavoro

Prima della consegna:

1. eseguire le verifiche pertinenti;
2. controllare che il diff contenga solo file richiesti;
3. verificare che non siano presenti segreti, token, URL privati o file temporanei;
4. controllare compatibilità del contratto frontend/backend;
5. riportare test eseguiti e limiti residui in modo sintetico;
6. non creare commit automaticamente senza richiesta esplicita.
