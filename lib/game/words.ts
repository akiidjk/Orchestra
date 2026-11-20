import { DICT } from "./dictionary";
import { LANGS, type Lang } from "./protocol";

export type Rng = () => number;
export interface Prompt {
  concept: number;
  word: string;
  lang: Lang;
}


const col = (l: Lang) => LANGS.indexOf(l);
const norm = (s: string) => s.normalize("NFKC").trim().toLocaleLowerCase();

// normalized word -> every (concept, lang) it spells
const INDEX = new Map<string, Prompt[]>();
DICT.forEach((row, concept) =>
  row.forEach((word, i) => {
    const key = norm(word);
    INDEX.set(key, [
      ...(INDEX.get(key) ?? []),
      { concept, word, lang: LANGS[i] },
    ]);
  }),
);

/** A playable prompt: known word, not in the target language, and whose
 *  translation is not spelled the same (that would give the answer away). */
export function lookup(word: string, target: Lang): Prompt | null {
  const w = norm(word);
  return (
    INDEX.get(w)?.find(
      (p) => p.lang !== target && norm(DICT[p.concept][col(target)]) !== w,
    ) ?? null
  );
}

export function translate(concept: number, target: Lang): string {
  return DICT[concept][col(target)];
}

export function randomPrompt(target: Lang, rng: Rng = Math.random): Prompt {
  for (;;) {
    const row = DICT[Math.floor(rng() * DICT.length)];
    const word = row[Math.floor(rng() * row.length)];
    const p = lookup(word, target);
    if (p) return p;
  }
}

const VOWELS = "aeiou";
const CONSONANTS = "bcdfglmnprstvz";
const pick = (s: string | string[], rng: Rng) =>
  s[Math.floor(rng() * s.length)];

/** Plausible pseudo-word: one small edit, never touching the first letter
 *  (keeps German capitalisation and the "looks right at a glance" effect). */
export function mutate(word: string, rng: Rng = Math.random): string {
  const c = [...word];
  const spots = c.map((_, i) => i).filter((i) => i > 0 && /\p{L}/u.test(c[i]));
  if (!spots.length) return word;
  const i = spots[Math.floor(rng() * spots.length)];
  const op = Math.floor(rng() * 3);
  if (op === 0 && i + 1 < c.length && /\p{L}/u.test(c[i + 1]))
    [c[i], c[i + 1]] = [c[i + 1], c[i]];
  else if (VOWELS.includes(c[i].toLowerCase())) c[i] = pick(VOWELS, rng);
  else c[i] = pick(CONSONANTS, rng);
  return c.join("");
}

function shuffle<T>(a: T[], rng: Rng): T[] {
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Real translation + 2 real-but-wrong words + 2 pseudo-words, shuffled. */
export function buildBallot(
  concept: number,
  target: Lang,
  rng: Rng = Math.random,
): { options: string[]; correctIndex: number } {
  const real = translate(concept, target);
  const seen = new Set([norm(real)]);
  const fakes: string[] = [];
  const add = (w: string) => {
    if (fakes.length < 4 && !seen.has(norm(w))) {
      seen.add(norm(w));
      fakes.push(w);
    }
  };

  // Decoys that look like the answer: same first letter / similar length.
  const score = (w: string) =>
    (w[0].toLowerCase() === real[0].toLowerCase() ? 2 : 0) +
    (Math.abs(w.length - real.length) <= 2 ? 1 : 0) +
    rng();
  const decoys = DICT.map((r) => r[col(target)])
    .map((w) => ({ w, s: score(w) }))
    .sort((a, b) => b.s - a.s);
  for (const { w } of decoys.slice(0, 2)) add(w);

  for (let tries = 0; fakes.length < 4 && tries < 50; tries++) {
    const m = mutate(real, rng);
    if (!INDEX.has(norm(m))) add(m);
  }
  for (const { w } of decoys) add(w); // short words can't always be mutated

  const options = shuffle([real, ...fakes], rng);
  return { options, correctIndex: options.indexOf(real) };
}
