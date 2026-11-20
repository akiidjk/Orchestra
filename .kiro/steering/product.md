---
inclusion: always
---

# InGliSc — prodotto, dominio e UX

## Identità del prodotto

InGliSc è un gioco sociale di parole inglesi per tre partecipanti. Il nome, il tono e l'identità visiva devono rimanere riconoscibili: interfaccia allegra, semplice, colorata e adatta a una partita tra amici.

Il giocatore può:

- creare una lobby privata;
- condividere un codice di sei caratteri;
- entrare in una lobby esistente con un nickname;
- giocare con altri umani o aggiungere bot;
- scegliere una partita da 3, 6, 9 o 12 manche;
- salvare parole nei memo locali;
- usare tema chiaro o scuro;
- giocare su Android, iOS o Web.

## Modello di partita

Una lobby ha tre posti esatti. Il primo giocatore è il creatore e inizialmente l'host. I bot occupano un posto e partecipano al gioco come giocatori, ma non hanno token o sessione client.

Il ruolo di paroliere ruota nell'ordine dei partecipanti, includendo i bot. Per una partita con più di tre manche, l'ordine ricomincia dopo aver completato il giro dei partecipanti.

Le fasi valide sono:

```text
waiting
  -> setup
  -> initial-choices
  -> discard
  -> final-choices
  -> round-result
  -> setup
  -> game-result
```

Il backend è l'autorità per transizioni, scelte, soluzione, punteggi e risultati. Il frontend visualizza lo stato e invia intenzioni dell'utente; non decide l'esito.

## Regole di una manche

1. Il paroliere inserisce un prompt o indizio in italiano.
2. Il paroliere inserisce cinque opzioni inglesi distinte e indica quella corretta.
3. Gli altri due giocatori scelgono una risposta in segreto.
4. Quando entrambi hanno scelto, il paroliere scarta una delle quattro opzioni sbagliate.
5. Ogni giocatore conferma la scelta iniziale oppure la cambia una sola volta.
6. Se la scelta iniziale è stata scartata, il cambio è obbligatorio.
7. Il backend calcola i punti e pubblica il risultato.
8. L'host avanza alla manche successiva o alla classifica finale.

Il prompt e le opzioni devono essere testo valido, non vuoto, senza caratteri di controllo e nei limiti previsti dall'implementazione. Le opzioni devono essere distinte dopo la normalizzazione.

## Punteggi

Per ciascun giocatore che non è il paroliere:

- risposta corretta senza cambio: `+3`;
- risposta corretta dopo il cambio: `+1`;
- risposta errata: `+0`.

Per il paroliere:

- nessuno indovina e la coppia prompt-traduzione è nel dizionario: `+3`;
- nessuno indovina e la coppia non è verificata: `+2`;
- esattamente un giocatore indovina dopo aver cambiato: `+1`;
- tutti gli altri casi: `+0`.

La classifica deve gestire i pareggi condividendo la posizione. Non introdurre criteri di spareggio non richiesti.

## Lobby, abbandono e riconnessione

- I nickname sono univoci senza distinzione tra maiuscole/minuscole, normalizzati con NFKC e lunghi al massimo 30 caratteri.
- Il creatore può scegliere solo 3, 6, 9 o 12 manche.
- L'host può aggiungere, rimuovere e configurare bot solo mentre la lobby è in `waiting`.
- Se l'host abbandona, il ruolo passa al primo giocatore umano rimasto.
- Se un giocatore abbandona durante una partita, la partita viene annullata e la lobby torna in attesa con punteggi azzerati.
- Se non rimangono giocatori umani, la lobby viene eliminata.
- Le sessioni locali possono essere ricaricate dal client, ma la sessione non sopravvive al riavvio del backend.
- Le lobby inattive scadono secondo il TTL configurato dal backend.

## Privacy e visibilità

Prima del risultato di una manche:

- ogni giocatore vede solo ciò che è consentito dal proprio ruolo;
- le scelte iniziali degli altri non devono rivelare la soluzione;
- la soluzione corretta non deve comparire nello snapshot personale;
- token bearer, dati interni e mappe di stato non devono essere mostrati all'utente.

Dopo il risultato si possono mostrare soluzione, opzioni, scarto, scelte finali, punti e dettaglio della manche.

## UX e linguaggio

- Tutti i testi visibili all'utente sono in italiano, salvo le parole inglesi del gioco.
- Mantieni etichette comprensibili, stati di caricamento, errori espliciti e feedback per le azioni.
- Mantieni accessibilità: ruoli dei controlli, label, stato disabled/selected/checked, focus e messaggi live dove già presenti.
- Mantieni supporto al tema chiaro/scuro e non usare colori come unico segnale di stato.
- Effetti sonori e animazioni sono opzionali e non devono bloccare la partita né l'accessibilità.

## Fuori ambito senza richiesta esplicita

Non aggiungere account, profili persistenti, database, chat, matchmaking pubblico, pagamenti, nuove modalità di gioco, websocket o deployment Internet sicuro come parte di una modifica ordinaria.

Una modifica alle regole richiede l'aggiornamento coordinato di specifica, backend, frontend, test e documentazione.
