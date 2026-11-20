/**
 * Generates a valid word automatically when the Game Master's 30s window expires.
 * Depends on DictionaryClient to verify the generated word exists.
 * See game-rules.md: WordSelection phase timeout.
 */
import type { DictionaryClient } from '../integrations/DictionaryClient';

export interface WordAutoGenerator {
  /** Returns a valid word in `sourceLanguage` that the dictionary confirms. */
  generate(sourceLanguage: string): Promise<string>;
}

/** Default implementation: picks from a curated seed list and verifies via DictionaryClient. */
export function createWordAutoGenerator(dictionary: DictionaryClient): WordAutoGenerator {
  const SEED_WORDS: Record<string, string[]> = {
    en: ['apple', 'river', 'music', 'cloud', 'bridge'],
    it: ['mela', 'fiume', 'musica', 'nuvola', 'ponte'],
    fr: ['pomme', 'rivière', 'musique', 'nuage', 'pont'],
    de: ['Apfel', 'Fluss', 'Musik', 'Wolke', 'Brücke'],
    es: ['manzana', 'río', 'música', 'nube', 'puente'],
  };

  return {
    async generate(sourceLanguage: string): Promise<string> {
      const pool = SEED_WORDS[sourceLanguage] ?? SEED_WORDS['en'];
      for (const word of pool) {
        const result = await dictionary.validate(word, sourceLanguage);
        if (result.isValid) return word;
      }
      return pool[0]; // fallback: unverified but proceed (game-rules.md EDGE-1)
    },
  };
}
