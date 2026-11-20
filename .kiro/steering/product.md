---
inclusion: always
---

<<<<<<< HEAD
# Uordz — prodotto, dominio e UX

## Identità del prodotto

Uordz è un gioco multiplayer in tempo reale di indovinare parole tramite traduzione. Il motto è _"Can you hear the right word?"_: un giocatore conduce (il Game Master) e gli altri ascoltano la nota giusta. È competitivo, educativo e deliberatamente caotico: insegna qualche parola in un'altra lingua senza sembrare una lezione.

Il tono sta a metà tra un pub quiz e un'improvvisazione jazz: giocoso senza essere infantile, competitivo senza essere punitivo. Il feedback è immediato e perdere è buffo più che frustrante.

Un giocatore può:

- creare una stanza e diventarne il primo Game Master;
- scegliere la lingua target, il numero di manche e il tempo per turno;
- creare una stanza pubblica (visibile nell'elenco Open Rooms) o privata (accessibile solo tramite codice di 6 caratteri);
- entrare in una stanza tramite codice o dall'elenco Open Rooms;
- creare il proprio avatar prima di entrare;
- giocare in tempo reale con sincronizzazione via WebSocket.

Nessun account, nessun login: nickname e avatar sono conservati nella sessione del browser.

## Modello di partita

Il creatore della stanza è il primo Game Master e configura:

- la **lingua target** (la lingua in cui appaiono tutte le risposte);
- il **numero di manche** (predefinito: 5);
- il **tempo limite per turno** (predefinito: 60 secondi).

Una **manche** è una rotazione completa: ogni giocatore fa un turno come Game Master. Quando tutti hanno condotto, la manche finisce e ne comincia una nuova. Dopo l'ultima manche appare il **podio** con i primi tre e la classifica finale.

### Fasi di un turno

1. **Selezione della parola.** Il Game Master ha **30 secondi** per digitare una parola (in qualsiasi lingua) e confermarne la validità. Il sistema verifica la parola contro un dizionario prima di accettarla: parole inventate o errate vengono rifiutate con feedback immediato. Se il tempo scade o il Game Master salta, il sistema genera automaticamente una parola valida per suo conto e il turno procede normalmente.
2. **Costruzione della scheda.** Il sistema mostra cinque opzioni: la traduzione vera nella lingua target più **quattro falsi plausibili** (traduzioni errate o pseudo-parole morfologicamente simili nella stessa lingua, generate per sembrare convincenti).
3. **Gara delle risposte.** Le cinque opzioni appaiono tutte insieme. I giocatori scelgono; più veloce è la risposta corretta, più punti si ottengono. La velocità è premiata su una scala mobile dentro la finestra di tempo.
4. **Rivelazione.** La risposta corretta si illumina. I punti vengono assegnati. Il turno passa al prossimo Game Master.

Il backend è l'autorità per le transizioni, la validazione della parola, la generazione di traduzione e falsi, il calcolo dei punteggi e la rivelazione. Il frontend visualizza lo stato e invia le intenzioni del giocatore; non decide l'esito.

## Validazione della parola

La parola del Game Master deve esistere in un dizionario riconosciuto prima che il turno possa iniziare. La validazione è veloce (sotto il secondo) e avviene mentre il Game Master digita: un indicatore conferma che la parola è nota prima dell'invio. Le parole che falliscono la validazione vengono segnalate subito, così il Game Master può provarne un'altra senza sprecare la finestra di 30 secondi.

Regole:

- niente parole inventate, refusi o nomi propri fuori dal dizionario;
- qualsiasi lingua è ammessa come parola sorgente, purché il sistema possa confermarne l'esistenza e produrre una traduzione nella lingua target della stanza;
- se il tempo del Game Master scade prima di una parola valida, il sistema ne sceglie una automaticamente e il turno procede normalmente.

## Punteggi

| Azione                                 | Punti                         |
| -------------------------------------- | ----------------------------- |
| Risposta corretta, la più veloce       | 3 pt                          |
| Risposta corretta, entro il tempo      | 1–2 pt (scala mobile)         |
| Risposta errata                        | 0 pt                          |
| Game Master: nessuno indovina          | +1 pt (hai fregato la stanza) |

La velocità si misura dal momento in cui le opzioni appaiono sullo schermo. La prima risposta corretta guadagna di più; le successive guadagnano progressivamente meno. Una risposta sbagliata blocca il giocatore per il resto del turno.

Il Game Master non risponde: ottiene punti solo se frega tutti.

## Avatar

Prima di entrare, ogni giocatore crea un avatar semplice in stile skribbl.io: un viso assemblato da un insieme fisso di componenti espressivi (occhi, bocca, capelli, accessori, tono della pelle). Nessuna abilità di disegno richiesta. Gli avatar appaiono accanto al nome durante la partita e sul podio finale: un chip **48 × 48** accanto al nome in gioco, più grande sul podio.

Avatar e nickname sono conservati nella sessione del browser e ripristinati automaticamente alla riconnessione: niente account, niente login. Se si chiude e riapre la stessa scheda, si torna nella stanza con la stessa faccia e lo stesso nome.

## Chat in partita

Un pannello chat è sempre visibile durante la partita. I giocatori possono inviare brevi messaggi di testo in qualsiasi momento, anche mentre rispondono. La chat è **effimera**: esiste solo per la sessione e non viene registrata.

Usi previsti: reazioni a una rivelazione, leggera provocazione, coordinare un rematch. La chat non interferisce col gioco: sta in una sidebar e non copre mai le carte delle risposte.

## Stanze pubbliche e private

La stanza supporta due modalità:

- **Stanza privata:** creata con un codice che l'host condivide manualmente. Solo chi ha il codice può entrare.
- **Stanza pubblica:** elencata nel browser **Open Rooms** nella home. Chiunque può entrare da lì, fino al limite di giocatori. L'host imposta lingua target, numero di manche e tempo limite creando la stanza, così chi entra sa cosa trova.

Il browser Open Rooms mostra per ogni stanza la lingua target, il numero attuale di giocatori e se la partita è iniziata. Le stanze già in corso vengono mostrate ma segnate come piene o in gioco.

Non esiste matchmaking per abilità. Open Rooms è un semplice elenco pubblico: veloce, trasparente, a basso attrito.

## Ciclo di vita della stanza

- Le stanze pubbliche appaiono nel browser Open Rooms finché il gioco non inizia o la stanza è piena.
- Le stanze private sono accessibili solo tramite il codice di 6 caratteri.
- Nessun account richiesto: i giocatori si identificano per nickname + avatar, conservati nella sessione del browser.
- Se un giocatore si disconnette a metà partita, il suo posto è trattenuto brevemente; alla riconnessione rientra con lo stesso nickname, avatar e punteggio.
- Se il Game Master si disconnette durante la finestra di selezione della parola, il sistema genera automaticamente una parola e il turno procede.
- Dopo il podio finale, la stanza può essere riavviata per un rematch con gli stessi giocatori.
- Le stanze inattive scadono dopo 24 ore.

## Privacy e visibilità

Prima della rivelazione:

- ogni giocatore vede solo ciò che il proprio ruolo consente;
- la soluzione corretta non deve comparire nello snapshot inviato ai client prima della rivelazione;
- i dati interni, i token e gli stati lato server non devono essere mostrati all'utente.

Dopo la rivelazione si possono mostrare soluzione, opzioni, punteggi e dettaglio del turno.

## UX e linguaggio

- Interfaccia allegra, semplice e colorata; tono giocoso ma non infantile.
- Palette: indaco profondo e ambra calda come primari, con accenti per zona linguistica (ad es. rosso ruggine per lo spagnolo, blu ardesia per il tedesco); la palette si sposta in base alla lingua target della stanza.
- Tipografia: una sola famiglia sans-serif arrotondata; pulsanti delle opzioni grandi e leggibili; i delta di punteggio (+3, +1) rimbalzano brevemente quando assegnati.
- Layout: metafora del palcoscenico centrato; il prompt sta in alto come battuta del direttore, le cinque carte delle risposte si dispiegano sotto; il timer è un arco che si svuota attorno al prompt; la chat sta di lato senza competere durante le risposte.
- Motion: transizioni scattanti, non cinematografiche; le risposte corrette pulsano una volta col colore d'accento, le sbagliate tremano una volta poi sbiadiscono; l'indicatore di validazione della parola usa un tenue bagliore verde/rosso.
- Avatar: illustrazione vettoriale piatta; una palette limitata per componente mantiene le combinazioni coerenti anche a piccole dimensioni.
- Suono: toni sintetici brevi per i momenti chiave (chime alle opzioni, tono alto per corretto, tono basso per errato, fanfara per il Game Master che frega tutti); tutto è attivabile globalmente e spento per impostazione predefinita.
- Mantieni accessibilità: ruoli dei controlli, label, stato disabled/selected/checked, focus e messaggi live dove già presenti; non usare il colore come unico segnale di stato.
- Layout responsive web-first: desktop e tablet grande sono l'obiettivo principale; il mobile è funzionale ma secondario.

## Fuori ambito

Senza richiesta esplicita, non aggiungere:

- profili utente persistenti o cronologia tra sessioni;
- liste di parole o mazzi personalizzati;
- app mobile nativa;
- matchmaking per abilità.
=======
# Product — Orchestra

## Visione

Orchestra è un gioco multiplayer di indovinelli linguistici in tempo reale. A ogni turno il Game Master sceglie una parola; il sistema genera automaticamente cinque opzioni nella lingua target (una traduzione corretta e quattro false convincenti). I giocatori gareggiano a rispondere il più velocemente possibile: risposta giusta e velocità determinano il punteggio.

## Tagline

*"Can you hear the right word?"*

## Utenti

| Ruolo | Descrizione |
|-------|-------------|
| Game Master (direttore) | Sceglie una parola valida nel proprio turno. Non indovina: guadagna punti solo se nessuno trova la risposta corretta. |
| Player (giocatore) | Vede le cinque opzioni e sceglie la traduzione corretta il più velocemente possibile. |

## Obiettivi del prodotto

- Partite veloci e caotiche (3–7 minuti) con 2–8 partecipanti.
- Nessun account: nickname + avatar persistono nella sessione del browser.
- Stanze pubbliche (open lobby) e private (codice 6 caratteri).
- Esperienza competitiva ed educativa: si imparano parole senza che sembri una lezione.

## Flusso di gioco (un turno)

1. Il Game Master ha **30 secondi** per digitare una parola valida e confermarla. Il sistema la valida in tempo reale contro un dizionario. Se scade il tempo o il GM salta, il sistema genera automaticamente una parola valida.
2. Il sistema costruisce il ballot: traduzione corretta nella lingua target + 4 opzioni false plausibili (pseudo-traduzioni morfologicamente simili).
3. Le cinque opzioni appaiono **simultaneamente** per tutti i giocatori. Inizia il countdown (default 60 secondi).
4. I giocatori scelgono. La risposta corretta vale di più se arriva prima: scala scorrevole nel tempo.
5. Il sistema rivela la risposta corretta e assegna i punti. Il turno passa al giocatore successivo.

Dopo l'ultimo round: podio con i primi tre giocatori e classifica finale.

## Regole critiche (non negoziabili)

- La validazione della parola avviene **server-side** prima che il ballot venga costruito.
- Il punteggio di velocità è calcolato **server-side** dal momento in cui le opzioni appaiono sullo schermo, non dal momento in cui il client riceve il ballot.
- Una risposta sbagliata **blocca il giocatore** per il resto del turno.
- Il Game Master **non indovina** nel proprio turno.
- Stanze inattive scadono dopo **24 ore**.
>>>>>>> 52a31ea (LAVITA)
