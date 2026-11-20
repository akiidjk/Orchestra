---
inclusion: fileMatch
fileMatchPattern: "{app/**/*.tsx,app/**/*.css,components/**/*.tsx}"
---

# Visual Jazz System

## Regole

1. **Zero colori hardcoded nei componenti.** Niente `#hex`, `rgb()`, `bg-[#...]` o nomi di colore Tailwind (`bg-red-500`) nei `.tsx`. Si usano solo i token: `--indigo`, `--amber`, `--bg`, `--fg`, `--muted`, `--card`, `--border`, `--ok`, `--bad`, `--accent` (esposti a Tailwind come `indigo-brand`, `amber-brand`, `accent`, `card`, `border`).
2. **I valori esadecimali vivono solo in `app/globals.css`.** È l'unico posto dove si definiscono, con la variante dark sotto `prefers-color-scheme: dark`.
3. **L'accento segue la lingua.** `--accent` è ridefinito per `[data-lang="en|it|fr|es|de"]`. La pagina della stanza imposta `data-lang` dalla lingua target; i componenti leggono `--accent` e non sanno quale lingua è attiva.
4. **Nuova lingua = una regola CSS.** Aggiungere una lingua non richiede di toccare alcun componente, solo un blocco `[data-lang="xx"]` (più l'eventuale override dark).
5. **Contrasto.** Ogni accento deve restare leggibile su `--card` sia in light sia in dark.
