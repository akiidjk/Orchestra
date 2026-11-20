/**
 * Client for fetching the correct translation of a word into the target language.
 * Returns null on failure — the caller must handle the missing-translation case.
 * See architecture.md: TranslationClient responsibility.
 */

export interface TranslationResult {
  sourceWord: string;
  targetLanguage: string;
  translation: string;
}

export interface TranslationClient {
  translate(word: string, targetLanguage: string): Promise<TranslationResult | null>;
}

/** Stub implementation — replace with real API (ADR OPEN-003). */
export function createTranslationClient(): TranslationClient {
  return {
    async translate(word: string, targetLanguage: string): Promise<TranslationResult | null> {
      // TODO: integrate real translation API (DeepL / LibreTranslate)
      return null;
    },
  };
}
