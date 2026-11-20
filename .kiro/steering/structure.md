---
inclusion: always
---

# InGliSc — struttura del repository e responsabilità

## Layout generale

```text
Scrivania/
├── KIRO/
│   └── steering/
│       ├── product.md
│       ├── tech.md
│       ├── structure.md
│       └── workflow.md
└── inglisc/
    ├── inglisc/       # frontend Expo
    └── inglisc-be/    # backend Node/Express
```

La cartella `KIRO/` contiene istruzioni di contesto e non deve diventare una copia del codice applicativo. Il codice resta nelle due cartelle di progetto.

## Frontend `inglisc/inglisc/`

- `App.js`: entry point UI e composizione delle schermate principali, tema, componenti locali e flusso di gioco.
- `components/`: componenti visuali riutilizzabili. Un componente UI non deve contenere accesso HTTP se può ricevere dati e callback.
- `services/useGame.js`: hook principale per sessione, polling, mutazioni, errori e persistenza.
- `services/LobbyService.js`: wrapper HTTP, URL server, autenticazione e parsing delle risposte.
- `services/wordSuggestions.js`: suggerimenti, controllo locale del prompt e ricerca delle coppie.
- `services/fakeEnglishGenerator.js`: generazione locale di contenuti suggeriti.
- `services/soundEffects.js`: audio UI e preferenza audio.
- `assets/`: icone, splash, favicon e immagini brand.
- `app.json`: nome, slug, icone, splash, target Expo e plugin.
- `eas.json`: profili di build Expo Application Services.
- `vercel.json`: configurazione del deployment web, se utilizzata.
- `babel.config.js`: configurazione Babel.
- `package.json`: script e dipendenze frontend.

Quando una schermata cresce troppo, estrarre componenti o servizi senza cambiare il contratto del gioco. Evitare nuovi file generici con nomi vaghi come `utils.js` se una responsabilità specifica è più chiara.

## Backend `inglisc/inglisc-be/`

- `server.js`: crea l'app Express, registra middleware e route, espone health check e avvia il listener.
- `game.js`: store in memoria e dominio completo. Contiene validazione interna, autenticazione, lobby, round, bot, snapshot, punteggi e cleanup.
- `routes/lobbyRoutes.js`: definisce gli endpoint `/lobby`.
- `controllers/lobbyController.js`: traduce request/response e delega allo store.
- `middlewares/corsMiddleware.js`: configurazione CORS.
- `word-pairs.json`: coppie e livelli di difficoltà per dizionario e bot.
- `test/game.test.js`: test Node built-in di API e regole.
- `README.md`: contratto operativo, API, regole e limiti.
- `DEPLOYMENT.md`: istruzioni e considerazioni di deployment.
- `.env.production.example`: variabili d'ambiente di esempio, senza segreti.
- `package.json` e `package-lock.json`: runtime e dipendenze backend.

Le route e i controller devono rimanere sottili. Aggiungere una regola di dominio in `game.js`, non nel controller.

## Contratti tra frontend e backend

Quando si cambia un endpoint o uno snapshot, aggiornare nello stesso cambiamento:

1. store/dominio backend;
2. route/controller;
3. `LobbyService.js`;
4. `useGame.js` e schermate interessate;
5. test backend;
6. README o documentazione operativa.

Documentare metodo, percorso, autenticazione, body, risposta, errori e fase valida.

## File da non modificare manualmente

Non modificare direttamente:

- `node_modules/`;
- `dist/` e altri output di export;
- lockfile, salvo aggiornamento reale delle dipendenze;
- file generati da Expo/native tooling;
- asset compilati o cache.

Prima di creare un file, cercare il pattern esistente più vicino e mantenere naming, stile, import e gestione errori già utilizzati.
