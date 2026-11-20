# PITCH — Orchestra @ Kiro Night

> *"Non abbiamo scritto codice per dimostrare che Kiro sa scrivere codice.
> Abbiamo costruito il contesto per dimostrare che Kiro sa ragionare dentro un progetto."*

---

## Categoria

**Games & Entertainment** — Orchestra: multiplayer real-time word-guessing game.

---

## Apertura (30 sec)

Aprire `DESIGN.md`. Una frase:

> *"Da questo documento abbiamo fatto reverse engineering dell'intero dominio e lo abbiamo trasformato in conoscenza strutturata per Kiro."*

---

## 02 — Steering · `.kiro/steering/`

| File | Cosa sottolineare |
|------|-------------------|
| `product.md` | Visione, utenti, flusso principale, regole non negoziabili. Letto da Kiro ad ogni conversazione. |
| `game-rules.md` ⭐ | **10 invarianti** del gioco. Se il codice le contraddice, Kiro registra la discrepanza — non sceglie da solo. |
| `domain-model.md` ⭐ | Entità, relazioni, macchine a stati. Kiro conosce Room / Game / Turn / PlayerAnswer prima di toccare un file. |
| `architecture.md` | Stack, struttura cartelle, canale WebSocket, responsabilità componenti. Kiro non inventa la struttura. |
| `security.md` | Punteggio server-side, mai client-side. Kiro lo sa prima di scrivere ScoringEngine. |
| `testing-strategy.md` | Ogni invariante ha un test obbligatorio corrispondente. Non è documentazione: è una specifica di test. |
| `coding-standards.md` | Naming, pattern di stato immutabile, codici errore standard. Le convenzioni non si negoziano a runtime. |

**Frase chiave:** *"7 file, zero duplicazioni, zero contraddizioni. Ogni regola ha una sola fonte autorevole."*

---

## 02 — Skills · `.agents/skills/`

| Skill | Cosa sottolineare |
|-------|-------------------|
| `add-game-rule` ⭐ | 6 passi obbligatori. Se trova un conflitto con un invariante, si ferma e chiede — non risolve autonomamente. |
| `implement-game-transition` ⭐ | Gestisce timeout automatici (30s WordSelection), azioni fuori sequenza, idempotenza. |
| `review-scoring-rules` | Costruisce la matrice combinatoria completa. Segnala le celle senza test e le ambiguità aperte. |
| Skills SDD (Addy Osmani) | `planning-and-task-breakdown`, `incremental-implementation`, `code-review-and-quality`: framework Spec-Driven Development come layer metodologico generale. |

**Frase chiave:** *"Le skills custom governano il dominio. Le skills SDD governano il metodo. Due livelli, nessuna sovrapposizione."*

---

## 02 — Hooks · `.kiro/hooks/`

| Hook | Trigger | Cosa verifica |
|------|---------|---------------|
| `domain-integrity.json` ⭐ | PostFileSave su `lib/domain/` e `lib/engine/` | Gli invarianti del gioco sono ancora rispettati nel codice |
| `scoring-tests.json` ⭐ | PostFileSave su `ScoringEngine.ts` | I test dello scoring girano immediatamente |
| `state-machine-tests.json` | PostFileSave su `StateMachine.ts` e `GameRulesValidator.ts` | La validità delle transizioni |
| `documentation-sync.json` | PostFileSave su `game-rules.md` | `testing-strategy.md` e `scoring-invariants.md` sono ancora allineati |
| `kirograph-sync-if-dirty.json` | Stop (fine sessione agente) | Grafo KiroGraph aggiornato incrementalmente |

**Frase chiave:** *"Gli hooks non sono controlli che fai tu. Sono controlli che hai insegnato a Kiro a fare da solo."*

---

## 02 — Specs + Knowledge Base · `docs/`

| File | Cosa sottolineare |
|------|-------------------|
| `docs/state-machine.md` ⭐ | Diagramma Mermaid del turn lifecycle + tabella azioni non valide per fase + transizioni automatiche. Indicizzato da KiroGraph e collegato simbolicamente al codice. |
| `docs/scoring-invariants.md` ⭐ | 10 invarianti in forma verificabile. Tabella combinatoria completa. Ambiguità registrate esplicitamente (non risolte). |
| `docs/domain-glossary.md` | 26 termini con definizione univoca. Un termine, un significato: zero allucinazioni terminologiche. |
| `docs/architecture-decisions.md` | 4 ADR accettate + 3 ambiguità aperte (OPEN-001: soglia velocità +1/+2). Kiro sa cosa non sa ancora. |

**Frase chiave (LLMWiki + KiroGraph):**
> *"Questi documenti sono stati ingested da LLMWiki per costruire una knowledge base semantica del dominio, poi indicizzata da KiroGraph nel grafo locale. Quando chiedi a Kiro come funziona il punteggio, non recupera una stringa: naviga un grafo che collega l'invariante SCORE-INV-4 al simbolo ScoringEngine.ts alla nota ADR-002."*

---

## KiroGraph live · `.kirograph/`

Lanciare in terminale:

```bash
kirograph status .   # 12 file · 64 simboli · 40 edge · docs indicizzate
kirograph export     # dashboard visuale nel browser
```

> *"Il grafo è già vivo. Ogni volta che Kiro finisce una sessione, si aggiorna da solo. Non è documentazione statica: è una struttura dati che cresce con il progetto."*

---

## Cosa NON aprire

`package-lock.json` · `.gitignore` · `postcss.config.mjs` · `.kiro/settings/` · `lib/utils.ts`

---

## Closing line

> *"Less prompting, more engineering.*
> *Abbiamo costruito il contesto perché Kiro possa fare domande migliori, non perché scriva codice più velocemente.*
> *La differenza è che questo contesto sopravvive alla sessione, scala con il team*
> *e impedisce a Kiro di prendere decisioni che non spettano a lui."*
