/**
 * Client for word validation against an external dictionary.
 * Returns a WordValidationResult — never throws on API errors (returns INVALID instead).
 * See architecture.md: DictionaryClient responsibility.
 */
import { WordValidationStatus } from '../domain/types';

export interface WordValidationResult {
  word: string;
  language: string;
  isValid: boolean;
  status: WordValidationStatus;
}

export interface DictionaryClient {
  validate(word: string, language: string): Promise<WordValidationResult>;
}

/** HTTP implementation using the Free Dictionary API (ADR OPEN-003). */
export function createDictionaryClient(timeoutMs = 3000): DictionaryClient {
  return {
    async validate(word: string, language: string): Promise<WordValidationResult> {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), timeoutMs);
      try {
        const url = `https://api.dictionaryapi.dev/api/v2/entries/${language}/${encodeURIComponent(word)}`;
        const res = await fetch(url, { signal: controller.signal });
        const isValid = res.ok;
        return { word, language, isValid, status: isValid ? WordValidationStatus.VALID : WordValidationStatus.INVALID };
      } catch {
        return { word, language, isValid: false, status: WordValidationStatus.INVALID };
      } finally {
        clearTimeout(timer);
      }
    },
  };
}
