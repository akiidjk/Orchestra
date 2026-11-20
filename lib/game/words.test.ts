import { describe, expect, it } from "vitest";
import { DICT } from "./dictionary";
import { LANGS } from "./protocol";
import { buildBallot, lookup, mutate, randomPrompt, translate } from "./words";

describe("dictionary", () => {
  it("has one entry per language and no duplicates within a language", () => {
    for (const row of DICT) expect(row).toHaveLength(LANGS.length);
    LANGS.forEach((_, i) => {
      const words = DICT.map((r) => r[i].toLowerCase());
      const dupes = words.filter((w, j) => words.indexOf(w) !== j);
      expect(dupes).toEqual([]);
    });
  });
});

describe("lookup", () => {
  it("finds words in any non-target language, case-insensitively", () => {
    expect(lookup("Dog", "fr")).toMatchObject({ lang: "en", word: "dog" });
    expect(lookup("katze", "it")).toMatchObject({ lang: "de" });
    expect(translate(lookup("perro", "de")!.concept, "de")).toBe("Hund");
  });

  it("rejects unknown words, target-language words and giveaways", () => {
    expect(lookup("dgo", "fr")).toBeNull();
    expect(lookup("chien", "fr")).toBeNull();
    expect(lookup("train", "fr")).toBeNull(); // same spelling in en and fr
  });

  it("randomPrompt always returns a playable prompt", () => {
    for (let i = 0; i < 200; i++) {
      const p = randomPrompt("es");
      expect(lookup(p.word, "es")).not.toBeNull();
    }
  });
});

describe("buildBallot", () => {
  it("returns 5 distinct options with the real translation at correctIndex", () => {
    for (let concept = 0; concept < DICT.length; concept++)
      for (const lang of LANGS) {
        const { options, correctIndex } = buildBallot(concept, lang);
        expect(options).toHaveLength(5);
        expect(new Set(options.map((o) => o.toLowerCase())).size).toBe(5);
        expect(options[correctIndex]).toBe(translate(concept, lang));
      }
  });

  it("mutate keeps the first letter and changes the word", () => {
    const m = mutate("Schmetterling", () => 0.5);
    expect(m[0]).toBe("S");
    expect(m).not.toBe("Schmetterling");
  });
});

describe("plausibility audit", () => {
  const norm = (w: string) => w.normalize("NFKC").toLocaleLowerCase();
  const known = new Set(DICT.flat().map(norm));
  const sample = Array.from({ length: 200 }, (_, i) => ({
    concept: i % DICT.length,
    lang: LANGS[i % LANGS.length],
  }));

  it("pseudo-words are never real words, and length doesn't give the answer away", () => {
    let longest = 0;
    for (const { concept, lang } of sample) {
      const { options, correctIndex } = buildBallot(concept, lang);
      const real = options[correctIndex];
      for (const o of options)
        if (o !== real && !DICT.some((r) => r.includes(o)))
          expect(known.has(norm(o))).toBe(false);
      if (
        real.length >
        Math.max(...options.filter((o) => o !== real).map((o) => o.length))
      )
        longest++;
    }
    // ponytail: 5 options -> ~20% by chance; >40% means length is a tell
    expect(longest / sample.length).toBeLessThan(0.4);
  });

  it("builds a ballot under budget (mean < 50 ms, p95 < 80 ms)", () => {
    const ms = sample
      .map(({ concept, lang }) => {
        const t = performance.now();
        buildBallot(concept, lang);
        return performance.now() - t;
      })
      .sort((x, y) => x - y);
    expect(ms.reduce((x, y) => x + y) / ms.length).toBeLessThan(50);
    expect(ms[Math.floor(ms.length * 0.95)]).toBeLessThan(80);
  });
});
