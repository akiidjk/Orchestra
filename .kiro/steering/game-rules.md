---
inclusion: always
---

# Game Rules — Orchestra

## Struttura di una partita

- **Giocatori:** 2-8 per stanza. Un giocatore e Game Master (GM) per turno; gli altri indovinano.
- **Round:** una rotazione completa in cui ogni giocatore ha fatto il GM una volta.
- **Numero di round:** configurabile dall'host (default: 5).
- **Timer per turno:** configurabile dall'host (default: 60 secondi).
- **Lingua target:** unica per tutta la stanza, scelta dall'host alla creazione.

## Ciclo di vita di un turno

```
WordSelection --> BallotBuilding --> ActiveGuessing --> Reveal --> NextTurn
```

### Fasi e azioni consentite

| Fase | Chi agisce | Azione consentita |
|------|-----------|-------------------|
| WordSelection | Game Master | Digita una parola, sistema la valida in tempo reale. Max 30 secondi. |
| BallotBuilding | Sistema | Genera traduzione corretta + 4 opzioni false. |
| ActiveGuessing | Tutti i Player | Scelgono una delle 5 opzioni. Max [timer] secondi. |
| Reveal | Sistema | Rivela la risposta corretta e assegna i punti. |
| NextTurn | Sistema | Passa il ruolo GM al giocatore successivo. |

> Se il GM non invia una parola valida entro 30 secondi, il sistema ne genera una automaticamente.

> Una risposta sbagliata blocca il giocatore per il resto del turno.

## Validazione della parola

- La parola deve esistere in un dizionario riconosciuto.
- La validazione avviene server-side prima dell'accettazione.
- Il GM riceve feedback in tempo reale mentre digita (indicatore verde/rosso).
- Parole inventate, typo e nomi propri non nel dizionario sono rifiutati immediatamente.
- Qualsiasi lingua e valida come parola sorgente, purche il sistema possa produrre una traduzione nella lingua target.

## Generazione del ballot

Il sistema genera automaticamente le 5 opzioni:
- 1 traduzione corretta (via API di traduzione esterna).
- 4 opzioni false: pseudo-traduzioni morfologicamente simili alla lingua target, generate server-side per sembrare plausibili.

## Algoritmo di punteggio

| Situazione | Punti |
|-----------|-------|
| Risposta corretta, primo in stanza | +3 |
| Risposta corretta, entro il timer | +1 o +2 (scala per velocita) |
| Risposta sbagliata | 0 (bloccato per il turno) |
| Game Master: nessuno indovina correttamente | +1 |

La velocita e misurata dal momento in cui le opzioni appaiono sullo schermo (timestamp server). Il GM non guadagna punti se almeno un giocatore indovina.

## Invarianti del gioco

```
1.  Una stanza ha tra 2 e 8 giocatori.
2.  Ogni turno ha esattamente un Game Master.
3.  Il Game Master non sceglie tra le opzioni nel proprio turno.
4.  Un ballot ha esattamente 5 opzioni distinte.
5.  Esattamente una delle 5 opzioni e la traduzione corretta.
6.  Il punteggio di velocita e calcolato server-side, non client-side.
7.  Una risposta sbagliata e definitiva per il turno corrente.
8.  Il timer inizia dal momento del reveal del ballot (timestamp server).
9.  I punteggi vengono assegnati solo dopo il Reveal.
10. Una stanza inattiva scade dopo 24 ore.
```

## Stanze

| Tipo | Accesso |
|------|---------|
| Privata (default) | Solo tramite codice 6 caratteri condiviso dall'host |
| Pubblica | Visibile nell'Open Rooms browser; chiunque puo unirsi |

Configurazione alla creazione (solo host): lingua target, numero di round, timer per turno.

## Gestione disconnessioni

- Se un Player si disconnette, il suo slot e mantenuto; al riconnesso rientra con nickname, avatar e punteggio.
- Se il Game Master si disconnette durante WordSelection, il sistema genera automaticamente una parola e il turno procede.
- Dopo il podio finale, l'host puo avviare un rematch con gli stessi giocatori.

## Casi limite

- Il GM supera i 30 secondi senza una parola valida: sistema genera automaticamente.
- Tutti i giocatori danno risposta sbagliata: GM guadagna +1.
- Un giocatore si disconnette durante ActiveGuessing: la sua risposta e assente; non blocca gli altri.
- Il timer scade con risposte parziali: si calcolano i punti solo per chi ha risposto correttamente.
- Doppio invio della stessa risposta: idempotente (nessun effetto al secondo invio).

## Fonte autorevole

Questo file e la fonte unica delle regole. Se emerge contraddizione con il codice, registrarla come decisione aperta in docs/architecture-decisions.md.
