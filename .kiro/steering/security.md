---
inclusion: always
---

# Security — Orchestra

## Principio fondamentale

Il punteggio di velocita e il meccanismo centrale del gioco. Qualsiasi manipolazione del timestamp lato client invalida la gara.

## Integrita del punteggio di velocita

1. **Timestamp server-side obbligatorio.** Il server emette ballot:revealed con un proprio timestamp. ScoringEngine usa esclusivamente Turn.ballotRevealedAt e PlayerAnswer.answeredAt (entrambi valorizzati dal server), mai dati provenienti dal client.

2. **Il client non invia un punteggio.** L'endpoint answer/route.ts riceve solo l'opzione scelta; il punteggio viene calcolato interamente server-side dopo il Reveal.

3. **Validazione server-side di ogni azione.** Ogni azione (invio parola, risposta) viene validata dal server tramite GameRulesValidator prima di essere applicata. La validazione client e solo UX, non autorita.

## Protezione delle opzioni false

- Le 4 opzioni false sono generate server-side e non sono mai prevedibili dal client prima del ballot reveal.
- Il payload del ballot reveal non include informazioni sulla provenienza di ciascuna opzione (quale e la traduzione reale vs. generata).

## Autorizzazione per ruolo

- Solo il GM del turno corrente puo inviare la parola (endpoint word/). Un altro giocatore che tenta di farlo riceve un errore NOT_GAME_MASTER.
- Il GM non puo rispondere al ballot nel proprio turno. Un tentativo produce errore NOT_A_GUESSER.
- Queste restrizioni sono verificate server-side, non solo nell'UI.

## Stanze e identita

- Le stanze hanno un ID opaco (UUID v4), non sequenziale. Indovinare l'ID di una stanza privata e computazionalmente impraticabile.
- Il codice di accesso a 6 caratteri e generato con entropia sufficiente (non incrementale, non prevedibile).
- Nickname e avatar arrivano dal client alla connessione; il server li accetta senza autenticazione (nessun account). Non c'e un concetto di impersonificazione in un gioco senza account persistenti.

## Idempotenza

- Il doppio invio di una risposta non produce punti doppi ne errori visibili: il server riconosce la risposta gia registrata e risponde con lo stato attuale.
- Stesso principio per join e creazione stanza.

## Chat

- La chat e efimera: nessun log server-side, nessuna persistenza.
- Il server non filtra il contenuto della chat (fuori scope per la versione base); i messaggi sono trasmessi as-is ai partecipanti della stanza.

## Note operative

- Nessun segreto di gioco deve finire nei log applicativi.
- Room ID e codici di accesso non vengono loggati a livello INFO; solo a livello DEBUG in sviluppo.
