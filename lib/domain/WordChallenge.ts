/**
 * Contains the word chosen by the Game Master, its correct translation,
 * the five ballot options, and the word-validation result.
 *
 * Invariants (game-rules.md):
 *   INV-4: ballot has exactly 5 distinct options
 *   INV-5: exactly one option is the correct answer
 */
import type { BallotOption, WordValidationStatus } from './types';
import { GameRuleViolationError } from './GameRuleViolationError';

export interface WordChallenge {
  readonly sourceWord: string;
  readonly targetLanguage: string;
  readonly options: readonly BallotOption[];
  validationStatus: WordValidationStatus;
  /** Timestamp (server ms) when the ballot was revealed to guessers. */
  ballotRevealedAt: number | null;
}

/**
 * Build and validate a WordChallenge.
 * Throws GameRuleViolationError(INVALID_OPTIONS) if options violate invariants.
 */
export function createWordChallenge(
  sourceWord: string,
  targetLanguage: string,
  options: BallotOption[],
  validationStatus: WordValidationStatus,
): WordChallenge {
  if (options.length !== 5) {
    throw new GameRuleViolationError(
      'INVALID_OPTIONS',
      `A ballot must have exactly 5 options, got ${options.length}`,
    );
  }
  const ids = new Set(options.map((o) => o.id));
  if (ids.size !== 5) {
    throw new GameRuleViolationError('INVALID_OPTIONS', 'All 5 ballot options must be distinct');
  }
  const correctCount = options.filter((o) => o.isCorrect).length;
  if (correctCount !== 1) {
    throw new GameRuleViolationError(
      'INVALID_OPTIONS',
      `Exactly one option must be correct, found ${correctCount}`,
    );
  }
  return { sourceWord, targetLanguage, options, validationStatus, ballotRevealedAt: null };
}

/** Returns the correct option. */
export function getCorrectOption(challenge: WordChallenge): BallotOption {
  return challenge.options.find((o) => o.isCorrect)!;
}
