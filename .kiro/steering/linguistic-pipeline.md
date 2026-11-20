---
inclusion: fileMatch
fileMatchPattern: "lib/game/{words,dictionary}.ts"
---

# Linguistic Pipeline

Pipeline: `lookup` (validazione parola GM) → `translate` → `buildBallot` (1 vera + 4 fake). Codice in `lib/game/words.ts`, dati in `lib/game/dictionary.ts`.

## Validazione

1. `lookup` è un accesso a `Map` normalizzata (NFKC + lowercase): O(1), nessuna chiamata di rete. Rifiuta parole nella lingua target e traduzioni identiche all'originale.

## Plausibilità dei fake

2. **Niente indizi superficiali.** I fake non devono tradirsi per maiuscole, diacritici o lunghezza. `mutate` non tocca la prima lettera (preserva la maiuscola dei sostantivi tedeschi) e fa una sola modifica.
3. **Nessun fake è un sinonimo vero.** Una pseudo-parola che esiste in `INDEX` viene scartata. I decoy reali sono parole di altri concetti, mai la stessa.
4. **5 opzioni distinte** dopo normalizzazione, risposta vera in posizione casuale.
5. **La lunghezza non rivela la risposta.** Su un campione ampio la risposta vera non deve essere sistematicamente la più lunga o la più corta.

## Budget di latenza

6. `buildBallot` sotto **80 ms p95** e sotto **50 ms di media**. Niente API esterne nel path del turno: se un giorno servono, si precalcola fuori dal turno.

## Verifica

`lib/game/words.test.ts` → "plausibility audit".
