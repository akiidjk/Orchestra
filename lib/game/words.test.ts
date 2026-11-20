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
