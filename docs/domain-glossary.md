# Domain Glossary — Orchestra

Questo glossario e la fonte autorevole per la terminologia del progetto. Usare sempre questi termini nel codice, nei commenti, nelle spec e nella documentazione.

| Termine | Definizione |
|---------|-------------|
| **game master (GM)** | Il giocatore che sceglie la parola nel turno corrente. Non indovina. Guadagna punti solo se nessuno trova la risposta corretta. |
| **guesser** | Un giocatore che deve indovinare la traduzione corretta nel turno del GM. Tutti i non-GM sono guesser nel turno corrente. |
| **ballot** | Le 5 opzioni mostrate ai giocatori in un turno (1 corretta + 4 false). |
| **option** | Una delle cinque possibili risposte nel ballot. |
| **correct answer** | La traduzione corretta della parola nella lingua target della stanza. |
| **fake option** | Una delle 4 opzioni false generate server-side, morfologicamente plausibili. |
| **word selection** | La fase in cui il GM digita e conferma una parola valida (max 30s). |
| **ballot building** | La fase in cui il sistema genera automaticamente le 5 opzioni. |
| **active guessing** | La fase in cui i giocatori scelgono tra le 5 opzioni. Ha un timer configurabile. |
| **reveal** | La fase in cui il server rivela la risposta corretta e assegna i punteggi. |
| **speed score** | Punti calcolati in base al tempo trascorso dal ballot reveal alla risposta (timestamp server). |
| **word validation** | Verifica server-side che la parola del GM esista nel dizionario. |
| **auto-generate** | Meccanismo per cui il sistema genera automaticamente una parola se il GM non risponde entro 30s. |
| **room** | Una stanza di gioco, pubblica o privata. Contiene giocatori, configurazione e partita. |
| **lobby** | Schermata di attesa nella stanza prima che la partita inizi. |
| **open rooms** | Browser pubblico delle stanze aperte, visibile nella home. |
| **room code** | Codice 6 caratteri per accedere a una stanza privata. |
| **round** | Una rotazione completa in cui ogni giocatore ha fatto il GM una volta. |
| **turn** | Un singolo turno in cui un giocatore specifico e il GM. |
| **podium** | Classifica finale con i primi tre giocatori per punteggio. |
| **rematch** | Rivincita nella stessa stanza con gli stessi giocatori. |
| **target language** | La lingua in cui appaiono le opzioni del ballot. Configurata dall'host alla creazione della stanza. |
| **avatar** | Rappresentazione visiva di un giocatore (occhi, bocca, capelli, accessori, carnagione). Persistito in sessionStorage. |
| **GameRuleViolationError** | Errore lanciato quando un'azione viola le regole di gioco. Include un codice stringa della regola violata. |
| **state machine** | Il componente (StateMachine.ts) che governa le transizioni di fase di un turno. |
| **scoring engine** | Il componente (ScoringEngine.ts) che calcola i punteggi a fine reveal. |
