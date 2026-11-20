---
inclusion: always
---

# InGliSc — stack, contratti e invarianti tecniche

## Runtime e applicazioni

Il progetto è composto da due applicazioni sorelle:

- `inglisc/`: app Expo/React Native con target Android, iOS e Web;
- `inglisc-be/`: API REST Node.js/Express con stato autorevole del gioco.

Usare Node.js 22 e npm. Rispettare i `package.json` e i lockfile esistenti. Non introdurre TypeScript, bundler, framework server o database nuovi senza una richiesta esplicita.

## Frontend

Il frontend usa JavaScript/JSX, React e componenti React Native.

Regole:

- preferire componenti e API React Native portabili su Web;
- usare `Platform` quando una differenza tra web, Android e iOS è inevitabile;
- non accedere direttamente al DOM in componenti condivisi;
- riusare i token colore, gli stili e i componenti già presenti in `App.js`;
- mantenere supporto a tema chiaro/scuro;
- mantenere le label accessibili e gli stati dei controlli;
- non duplicare nel frontend le regole autorevoli di punteggio o autorizzazione.

`services/useGame.js` è responsabile di:

- sessione locale;
- snapshot corrente;
- polling;
- lock delle mutazioni;
- gestione di errori, timeout e risposta incerta;
- memo e segreti locali;
- aggiornamento tramite revisione monotona `snapshot.rev`.

`services/LobbyService.js` è il punto di accesso HTTP. Nuovi endpoint devono passare da questo servizio, non da `fetch` sparsi nelle schermate.

La URL del backend è configurata con `EXPO_PUBLIC_SERVER_URL`. Preservare i casi documentati:

- browser locale: `http://localhost:3000`;
- emulatore Android: normalmente `http://10.0.2.2:3000`;
- dispositivo fisico: IP LAN del computer;
- deployment: URL raggiungibile, preferibilmente HTTPS.

AsyncStorage contiene sessione, memo e dati segreti locali. Non cambiare le chiavi esistenti senza una migrazione compatibile.

## Backend

Il backend usa CommonJS, Express e JavaScript Node senza transpiler.

Responsabilità:

- `server.js`: middleware, costruzione app, route pubbliche, health check e avvio;
- `routes/`: mapping metodo/percorso;
- `controllers/`: adattamento tra HTTP e store;
- `game.js`: dominio, store in memoria, autenticazione, fasi, bot, punteggi e snapshot;
- `middlewares/`: middleware HTTP condivisi;
- `word-pairs.json`: dizionario usato per verifica e bot.

La logica di dominio deve restare nel backend. Controller e route non devono ricalcolare punteggi, autorizzazioni o transizioni.

## Contratto HTTP

Le risposte sono JSON per le API. Gli errori applicativi devono mantenere:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Messaggio descrittivo."
  }
}
```

Codici e semantica da preservare:

- `400`: input, JSON, opzione o scarto non validi;
- `401`: bearer token mancante o non valido;
- `403`: giocatore non autorizzato per ruolo/azione;
- `404`: lobby, bot o risorsa inesistente;
- `409`: fase, nickname, capacità o stato incompatibile;
- `413`: body troppo grande;
- `415`: media type non supportato;
- `500`: errore interno.

Le richieste con body devono essere JSON. Conservare:

- `Cache-Control: no-store`;
- limite body di 16 KiB;
- `x-powered-by` disabilitato;
- middleware CORS esistente;
- normalizzazione del codice lobby in maiuscolo.

## Autenticazione e autorizzazione

Il token bearer identifica il giocatore nella lobby ed è valido solo finché il backend mantiene lo stato.

Ogni mutazione deve:

1. autenticare il giocatore;
2. recuperare la lobby corretta;
3. verificare fase;
4. verificare ruolo, host o paroliere quando richiesto;
5. validare body e campi consentiti;
6. applicare una sola transizione coerente;
7. incrementare la revisione e aggiornare l'attività.

Non fidarsi mai di `playerId`, soluzione, punti, fase, ordine o risultati inviati dal client.

## Snapshot

Lo snapshot è personalizzato per il giocatore autenticato. Deve contenere solo dati visibili a quel ruolo.

La soluzione corretta deve rimanere nascosta prima di `round-result`/`game-result`. Non inserire accidentalmente `correctId`, dati interni di `Map`, token o riferimenti allo store nella serializzazione.

Quando cambia lo stato, incrementare `rev`. Il client scarta snapshot con revisione precedente.

## Validazione e sicurezza

Validare sempre:

- tipo e forma del body;
- assenza di campi extra non consentiti;
- normalizzazione Unicode NFKC;
- lunghezza massima;
- caratteri di controllo e formato;
- unicità di nickname e opzioni;
- appartenenza dell'opzione alla manche;
- fase e ruolo.

Non inserire segreti, token, URL privati o dati personali nei log. Non modificare `node_modules`, output di build o file generati.

Lo stato è in memoria e il backend è pensato per una sola istanza. Non promettere persistenza o comportamento multiistanza senza introdurre esplicitamente storage condiviso e aggiornare la documentazione.
