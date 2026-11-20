---
inclusion: always
---

# Domain Model — Orchestra

## Entita principali

| Entita | Responsabilita |
|--------|---------------|
| Room | Gestisce una stanza: lista giocatori, configurazione, stato corrente, tipo (pubblica/privata) |
| Player | Rappresenta un partecipante: nickname, avatar, punteggio totale, stato connessione |
| Game | Una partita all'interno di una stanza: round correnti, configurazione, stato |
| Turn | Rappresenta un singolo turno: Game Master corrente, ballot, risposte, timer |
| WordChallenge | Contiene la parola sorgente, la lingua target, la traduzione corretta e le 5 opzioni |
| PlayerAnswer | Risposta di un giocatore a un turno: opzione scelta, timestamp, se e corretta |
| Score | Punti assegnati a un giocatore per un turno specifico |
| WordValidation | Esito della validazione dizionario della parola del GM: valid / invalid / pending |
| Avatar | Componenti visivi dell'avatar: occhi, bocca, capelli, accessori, carnagione |

## Relazioni

```
Room 1--* Player
Room 1--1 Game
Game 1--* Turn
Turn 1--1 Player (gameMaster)
Turn 1--* Player (guessers, escluso GM)
Turn 1--1 WordChallenge
Turn 1--* PlayerAnswer (una per guesser)
Turn 1--* Score
WordChallenge 1--1 WordValidation
PlayerAnswer *--1 Player
Player 1--1 Avatar
```

## Stati e transizioni

### Room

```
LOBBY --> IN_GAME --> FINISHED --> (REMATCH -> IN_GAME)
```

### Game

```
ACTIVE --> COMPLETED
```

### Turn

```
WORD_SELECTION --> BALLOT_BUILDING --> ACTIVE_GUESSING --> REVEAL --> COMPLETED
```

### PlayerAnswer

```
PENDING --> ANSWERED --> LOCKED (risposta sbagliata, bloccato per il turno)
```

### WordValidation

```
PENDING --> VALID | INVALID
```

## Invarianti del modello

- Room.players ha tra 2 e 8 elementi.
- Turn.gameMaster non e incluso in Turn.guessers.
- WordChallenge.options ha sempre esattamente 5 elementi distinti.
- WordChallenge.correctAnswer e sempre incluso in WordChallenge.options.
- PlayerAnswer.lockedAt e valorizzato solo se la risposta e sbagliata.
- Score.speedMs e il delta tra Turn.ballotRevealedAt e PlayerAnswer.answeredAt (entrambi timestamp server).
- Una Room in stato FINISHED ha un podio con i primi 3 giocatori per punteggio.

## Glossario

| Termine | Significato |
|---------|-------------|
| game master (GM) | Il giocatore che sceglie la parola nel turno corrente |
| guesser | Un giocatore che deve indovinare la traduzione corretta |
| ballot | Le 5 opzioni mostrate ai giocatori in un turno |
| option | Una delle cinque possibili risposte nel ballot |
| correct answer | La traduzione corretta della parola nella lingua target |
| fake option | Una delle 4 opzioni false generate dal sistema |
| speed score | Punti calcolati in base alla velocita di risposta (misurata server-side) |
| lobby | Schermata di attesa prima che la partita inizi |
| open rooms | Browser pubblico delle stanze aperte visibile nella home |
| podium | Classifica finale con i primi tre giocatori |
| rematch | Rivincita nella stessa stanza con gli stessi giocatori |
| word validation | Verifica server-side che la parola del GM esista nel dizionario |
