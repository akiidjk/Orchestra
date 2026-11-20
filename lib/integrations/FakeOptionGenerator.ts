/**
 * Generates 4 plausible-but-wrong ballot options for a given correct translation.
 * Options must look morphologically similar to the target language to be convincing.
 * See architecture.md: FakeOptionGenerator responsibility.
 */
import type { BallotOption } from '../domain/types';
import type { DictionaryClient } from './DictionaryClient';
import type { TranslationClient } from './TranslationClient';

export interface FakeOptionGenerator {
  generate(correctTranslation: string, targetLanguage: string, count: number): Promise<BallotOption[]>;
}

/** Creates a generator that samples morphological variants of the correct translation. */
export function createFakeOptionGenerator(
  _dictionary: DictionaryClient,
  _translation: TranslationClient,
): FakeOptionGenerator {
  return {
    async generate(correctTranslation: string, _targetLanguage: string, count: number): Promise<BallotOption[]> {
      // TODO: implement morphological sampling
      return Array.from({ length: count }, (_, i) => ({
        id: `fake-${i}`,
        text: `${correctTranslation}-fake-${i}`,
        isCorrect: false,
      }));
    },
  };
}
