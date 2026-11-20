# InGliSc! --- Proposta per la Kiro Night

## From Reverse Engineering to Agent-Guided Development

## 1. La scelta del progetto

**InGliSc!** è un'ottima scelta per partecipare all'evento. Rispetto a
partire da un'idea completamente nuova, hai già un prodotto con regole,
logiche di gioco, flussi e casi limite.

La cosa importante è cambiare prospettiva: non devi dimostrare quanto
Kiro sia bravo a scrivere codice. Devi dimostrare quanto riesci a
guidarlo attraverso un contesto progettuale ben costruito.

Dalla scheda dell'evento emergono quattro aree di valutazione:

-   **Specs:** requisiti funzionali e tecnici chiari e verificabili.
-   **Steering:** contesto, convenzioni, architettura e vincoli.
-   **Skills:** istruzioni e procedure riutilizzabili per estendere le
    capacità di Kiro.
-   **Hooks:** automazioni e controlli che guidano e verificano il
    lavoro di Kiro.

L'idea è impostare InGliSc! come un esercizio di reverse engineering
documentale e progettuale, trasformando il progetto privato in un
progetto che Kiro possa comprendere, modificare e sviluppare
coerentemente.

## 2. Presentazione del progetto

### InGliSc! --- Multiplayer Word Bluff Game

**Categoria:** Games & Entertainment

Un gioco multiplayer di bluff linguistico in cui un paroliere prepara
una traduzione, gli altri giocatori cercano di indovinarla e il sistema
assegna punti in base alle scelte e ai cambi di idea.

Il progetto è interessante perché contiene diverse aree di complessità:

1.  Regole di gioco deterministiche.
2.  Macchina a stati e gestione dei turni.
3.  Sincronizzazione delle scelte segrete.
4.  Validazione linguistica tramite Wiktionary.
5.  Sistema di punteggio con eccezioni.
6.  Gestione delle partite e dei partecipanti.
7.  Distinzione tra comportamento del server e interfaccia utente.

Sono tutte aree nelle quali un contesto incompleto può portare un agente
AI a prendere decisioni sbagliate.

## 3. Strategia: reverse engineering del progetto

Non chiederei subito a Kiro di ricostruire l'applicazione. Partirei dal
progetto esistente e gli farei ricostruire quattro livelli di
conoscenza.

### 3.1 Product discovery

Capire cosa fa l'applicazione, chi sono gli utenti, quali problemi
risolve e quali sono le regole di business.

### 3.2 Domain engineering

Estrarre entità, relazioni, stati, transizioni, invarianti e algoritmi
di punteggio.

### 3.3 Architecture discovery

Ricostruire stack tecnologico, organizzazione del codice, responsabilità
dei componenti e integrazioni esterne.

### 3.4 Context engineering

Trasformare tutto ciò che è stato scoperto negli artefatti che Kiro
utilizzerà per sviluppare il progetto.

La distinzione è importante: il codice attuale rappresenta
l'implementazione di riferimento, mentre la documentazione estratta deve
descrivere il comportamento desiderato.

Se emerge una discrepanza tra codice e regole originali, non bisogna
lasciare che Kiro scelga autonomamente quale versione sia corretta. La
discrepanza va registrata come decisione da prendere.

## 4. Ricostruzione del dominio di InGliSc!

Dalle regole del gioco si può ricavare un primo modello concettuale.

### 4.1 Entità principali

  Entità                   Responsabilità
  ------------------------ --------------------------------------------
  Game                     Gestisce una partita
  Player                   Rappresenta un partecipante
  Round                    Rappresenta una manche
  WordChallenge            Contiene parola, indizio e opzioni
  Answer                   Rappresenta una scelta del giocatore
  Score                    Registra i punti assegnati
  DictionaryVerification   Registra l'esito della verifica Wiktionary

### 4.2 Ciclo di vita di una manche

``` mermaid
stateDiagram-v2
    [*] --> ChallengeCreation
    ChallengeCreation --> DictionaryVerification
    DictionaryVerification --> SecretSelection
    SecretSelection --> RevealChoices
    RevealChoices --> Elimination
    Elimination --> FinalConfirmation
    FinalConfirmation --> Scoring
    Scoring --> NextRound
    NextRound --> ChallengeCreation
    NextRound --> GameCompleted
    GameCompleted --> [*]
```

Il ciclo di vita è probabilmente il cuore tecnico del progetto.

Non è semplicemente un gioco di parole: è una macchina a stati con
vincoli temporali e azioni consentite soltanto in determinate fasi.

Esempi:

-   I giocatori non possono vedere le scelte altrui prima della
    rivelazione.
-   Il paroliere deve scartare una parola diversa dalla risposta
    corretta.
-   Ogni partecipante può cambiare risposta al massimo una volta.
-   Una risposta scartata non può essere confermata.
-   Il punteggio deve essere calcolato sulla base delle azioni
    effettivamente compiute, non dello stato dell'interfaccia.

## 5. I deliverable Kiro

L'obiettivo non è produrre decine di documenti generici, ma costruire un
piccolo ecosistema coerente nel quale ogni artefatto abbia una
responsabilità precisa.

### 5.1 Specs --- Specifiche funzionali e tecniche

**Priorità: massima.**

Preparerei almeno tre specifiche.

#### Spec 1 --- Game Domain & Rules Engine

Definisce:

-   Regole complete del gioco.
-   Stati e transizioni.
-   Validazione delle azioni.
-   Algoritmo di punteggio.
-   Casi limite.
-   Criteri di accettazione.

#### Spec 2 --- Multiplayer Round Lifecycle

Definisce:

-   Creazione della manche.
-   Scelte segrete.
-   Sincronizzazione dei partecipanti.
-   Rivelazione simultanea.
-   Scarto e conferma.
-   Gestione di disconnessioni e timeout, se previsti.

#### Spec 3 --- Dictionary Verification

Definisce:

-   Integrazione con Wiktionary.
-   Verifica della coppia parola-traduzione.
-   Gestione dei risultati non verificabili.
-   Comportamento in caso di indisponibilità del servizio.
-   Effetti della verifica sul punteggio.

La prima spec è quella da scegliere per la demo. Non è necessario
implementare tutte e tre: bisogna dimostrare che Kiro sa progettare
correttamente il prodotto.

### 5.2 Steering --- La memoria persistente del progetto

**Priorità: massima.**

Struttura proposta:

``` text
.kiro/
└── steering/
    ├── product.md
    ├── architecture.md
    ├── domain-model.md
    ├── game-rules.md
    ├── coding-standards.md
    ├── testing-strategy.md
    └── security.md
```

Responsabilità dei file:

  -----------------------------------------------------------------------
  File                                Cosa deve insegnare a Kiro
  ----------------------------------- -----------------------------------
  product.md                          Visione, utenti, obiettivi,
                                      esperienza di gioco

  architecture.md                     Stack, componenti, responsabilità e
                                      dipendenze

  domain-model.md                     Entità, relazioni e invarianti

  game-rules.md                       Regole ufficiali e punteggi

  coding-standards.md                 Convenzioni e pattern di sviluppo

  testing-strategy.md                 Come verificare ogni modifica

  security.md                         Integrità delle scelte segrete e
                                      delle operazioni di gioco
  -----------------------------------------------------------------------

Non metterei tutto nel file `product.md`. Il contesto deve essere
organizzato per responsabilità, evitando duplicazioni e contraddizioni.
Per esempio, le regole di punteggio devono avere una fonte autorevole,
non essere riscritte in tre documenti diversi.

### 5.3 Skills --- Procedure riutilizzabili

**Priorità: alta.**

Le Skills non devono essere semplicemente documenti che ripetono le
regole. Devono essere procedure operative che Kiro può attivare quando
affronta un determinato compito.

#### Skill 1 --- `add-game-rule`

Quando Kiro deve modificare o aggiungere una regola:

-   Individua la regola esistente.
-   Analizza le dipendenze.
-   Verifica gli effetti sulla macchina a stati.
-   Aggiorna i requisiti.
-   Genera test sui casi normali e limite.
-   Verifica che il sistema di punteggio rimanga coerente.

#### Skill 2 --- `implement-game-transition`

Quando Kiro deve implementare una transizione:

-   Identifica stato iniziale e finale.
-   Identifica le azioni autorizzate.
-   Verifica le precondizioni.
-   Definisce gli effetti collaterali.
-   Gestisce azioni duplicate e richieste fuori sequenza.
-   Produce test di transizione.

#### Skill 3 --- `review-scoring-rules`

Quando Kiro modifica il calcolo dei punti:

-   Analizza tutte le combinazioni di risposte.
-   Verifica i punteggi previsti.
-   Cerca sovrapposizioni e casi non coperti.
-   Genera una tabella di test.
-   Segnala eventuali ambiguità nelle regole.

Quest'ultima sarebbe particolarmente interessante da mostrare.

### 5.4 Hooks --- Controlli automatici

**Priorità: alta.**

Gli Hooks permettono di dimostrare che non ci si limita a dire a Kiro
come dovrebbe lavorare: si costruiscono anche controlli che gli
ricordano di verificare il proprio lavoro.

Hooks proposti:

  -----------------------------------------------------------------------
  Hook                    Quando interviene       Cosa verifica
  ----------------------- ----------------------- -----------------------
  Domain integrity        Modifica del domain     Coerenza tra entità e
                          model                   regole

  Scoring tests           Modifica del motore di  Esecuzione dei test di
                          punteggio               scoring

  State machine tests     Modifica del lifecycle  Validità delle
                                                  transizioni

  Documentation sync      Modifica delle regole   Eventuali documenti da
                                                  aggiornare
  -----------------------------------------------------------------------

Eviterei di generare documentazione automaticamente a ogni salvataggio
senza controlli. Meglio un hook mirato che chieda a Kiro di verificare
le conseguenze della modifica e segnali eventuali disallineamenti.

## 6. Matrice di invarianti e test

Questa è una componente importante da aggiungere.

Non basta descrivere le regole in linguaggio naturale: vanno trasformate
in condizioni verificabili.

### 6.1 Regole di punteggio

  -----------------------------------------------------------------------
  Situazione                    Punti giocatore           Punti paroliere
  ------------------- ------------------------- -------------------------
  Risposta corretta                          +3                         0
  al primo tentativo                            

  Risposta corretta                          +1                         0
  dopo il cambio                                

  Risposta sbagliata                          0                         0

  Nessuno indovina,                           0                        +3
  coppia verificata                             

  Nessuno indovina,                           0                        +2
  coppia non                                    
  verificata                                    

  Un solo giocatore          Secondo la propria                        +1
  indovina cambiando                   risposta 
  idea                                          
  -----------------------------------------------------------------------

La tabella riporta le regole generali, ma per i test bisogna definire
anche le combinazioni tra i due partecipanti. Non basta testare ogni
giocatore isolatamente.

### 6.2 Invarianti del gioco

``` text
GAME INVARIANTS

1. A round has exactly one wordmaster.
2. A round has exactly two guessers.
3. A challenge has exactly five distinct options.
4. The correct answer must be one of the five options.
5. Players cannot inspect other players' secret choices.
6. Each guesser can change their answer at most once.
7. A discarded option cannot be confirmed.
8. The wordmaster cannot discard the correct answer.
9. Scores are calculated only after final confirmation.
10. A completed round cannot be scored twice.
```

### 6.3 Casi limite da testare

-   Entrambi i giocatori scelgono la stessa opzione sbagliata.
-   Entrambi scelgono la risposta corretta.
-   Uno sceglie correttamente subito e l'altro cambia idea.
-   Un giocatore cambia idea e seleziona un'opzione scartata.
-   Il dizionario non è raggiungibile.
-   Una richiesta di conferma viene inviata due volte.

Il valore aggiunto è che Kiro non deve semplicemente conoscere le
regole: deve poter verificare che il software le rispetti.

## 7. Esempio di integrazione tra i quattro artefatti

Immaginiamo di chiedere a Kiro:

> Voglio introdurre una nuova regola: il paroliere può scegliere se
> fornire una parola oppure un'espressione composta da più parole.

Il flusso ideale è il seguente:

1.  **Steering:** Kiro conosce già la struttura del dominio, le regole
    di gioco, le convenzioni e i vincoli architetturali.
2.  **Skill `add-game-rule`:** Kiro attiva la procedura che gli insegna
    come modificare correttamente una regola.
3.  **Spec:** Kiro formalizza il requisito, identifica i componenti
    coinvolti, valuta gli impatti e prepara i criteri di accettazione.
4.  **Implementazione:** Kiro modifica i componenti necessari e genera i
    test.
5.  **Hooks:** vengono eseguiti i controlli automatici, ad esempio test,
    lint e verifiche di coerenza.

**Risultato atteso:** Kiro introduce la funzionalità senza compromettere
le regole esistenti.

I quattro strumenti non sono documenti indipendenti, ma un sistema di
governo dello sviluppo.

## 8. La demo da preparare

Non cercherei di ricostruire l'intera applicazione in tre ore.
Preparerei una demo verticale, concentrata sul motore di gioco.

### Demo: dalla regola al software

**Scenario:** chiedere a Kiro di implementare una modifica alla gestione
delle risposte.

1.  Mostrare il requisito originale.
2.  Mostrare i file Steering.
3.  Attivare la Skill pertinente.
4.  Far generare o aggiornare la Spec.
5.  Far implementare una modifica circoscritta.
6.  Mostrare gli Hooks e i test che verificano la correttezza.

Una demo ancora più interessante sarebbe questa: chiedere
deliberatamente a Kiro di implementare una modifica che viola
un'invariante, per esempio consentire a un giocatore di cambiare
risposta due volte.

Il contesto dovrebbe permettere a Kiro di:

-   Individuare il conflitto con le regole.
-   Segnalare la violazione.
-   Aggiornare la Spec soltanto se la modifica viene approvata.
-   Aggiungere i test necessari.
-   Verificare il comportamento.

In questo modo si dimostra che Kiro non è un semplice generatore di
codice, ma lavora all'interno di vincoli progettuali.

## 9. Pianificazione della Kiro Night

L'evento è previsto dalle 18 alle 21. La pianificazione deve quindi
concentrarsi su deliverable raggiungibili, non sul prodotto completo.

  Fase                          Tempo Obiettivo
  --------------------- ------------- -------------------------------------
  Reverse engineering          25 min Analisi del progetto e del dominio
  Steering                     30 min Costruzione del contesto principale
  Specs                        40 min Spec del Game Engine
  Skills                       25 min Una o due procedure operative
  Hooks                        25 min Controlli automatici
  Demo e rifinitura            35 min Test e presentazione
  **Totale**              **180 min** 

Priorità:

1.  Una Spec eccellente.
2.  Steering coerente e senza contraddizioni.
3.  Una Skill realmente riutilizzabile.
4.  Due Hooks ben funzionanti.
5.  Una piccola implementazione dimostrativa.

Meglio quattro artefatti che collaborano realmente piuttosto che venti
file generati automaticamente e mai verificati.

## 10. Struttura proposta del repository

L'obiettivo è arrivare all'evento con una struttura già impostata,
lasciando a Kiro il lavoro di completamento e validazione.

``` text
inglisc/
│
├── .kiro/
│   ├── steering/
│   │   ├── product.md
│   │   ├── architecture.md
│   │   ├── domain-model.md
│   │   ├── game-rules.md
│   │   ├── coding-standards.md
│   │   ├── testing-strategy.md
│   │   └── security.md
│   │
│   ├── specs/
│   │   └── game-engine/
│   │
│   ├── skills/
│   │   ├── add-game-rule/
│   │   │   └── SKILL.md
│   │   ├── implement-game-transition/
│   │   │   └── SKILL.md
│   │   └── review-scoring-rules/
│   │       └── SKILL.md
│   │
│   └── hooks/
│       └── quality-checks.json
│
├── docs/
│   ├── reverse-engineering.md
│   ├── domain-glossary.md
│   └── architecture-decisions.md
│
├── src/
├── tests/
└── README.md
```

La struttura è una proposta iniziale: andrà adattata alle convenzioni
effettive del repository e alle funzionalità supportate dalla versione
di Kiro utilizzata.

### Nota sulla sicurezza

Essendo un progetto privato, prima di importarlo in Kiro bisogna
controllare la presenza di API key, credenziali, dati personali e
informazioni riservate. Non includere segreti nei file di contesto o
negli artefatti destinati alla presentazione.

## 11. Pitch per la presentazione

### InGliSc! --- From Reverse Engineering to Agent-Guided Development

InGliSc! è un gioco multiplayer di bluff linguistico che ho sviluppato
partendo da un'idea personale.

Per questa esperienza ho deciso di affrontare il problema da una
prospettiva diversa: invece di chiedere a un agente AI di ricostruire il
software, ho voluto ricostruire prima il contesto necessario affinché
possa comprenderlo, rispettarne le regole e svilupparlo coerentemente.

Ho utilizzato Kiro per trasformare il progetto in un insieme di
specifiche verificabili, conoscenze architetturali persistenti,
procedure riutilizzabili e controlli automatici.

L'obiettivo è dimostrare che la qualità del software generato dipende
anche dalla qualità del contesto e dei vincoli forniti all'agente.

## 12. Raccomandazione finale e prossimi passi

Non cambierei progetto. Sceglierei InGliSc! e lo trasformerei in un caso
di studio di **Context Engineering applicato al reverse engineering di
un'applicazione esistente**.

È un progetto sufficientemente piccolo da essere comprensibile, ma
sufficientemente articolato da mettere alla prova tutti i deliverable
richiesti.

Il lavoro successivo dovrebbe partire dal repository originale, non
soltanto dalle regole del gioco.

Percorso suggerito:

1.  Ricostruire lo stato effettivo dell'applicazione.
2.  Fare reverse engineering di architettura, dominio e logiche di
    business.
3.  Individuare incongruenze, debito tecnico e requisiti impliciti.
4.  Preparare una vera suite di file `.kiro/`, pronta da utilizzare.
5.  Costruire una demo che dimostri concretamente l'efficacia del
    contesto.

Il risultato ideale non è un'applicazione nuova generata da Kiro: è **il
progetto originale, compreso da Kiro abbastanza bene da poter essere
evoluto senza perdere le sue regole fondamentali**.
