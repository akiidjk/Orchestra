/**
 * Represents a guesser's answer to a turn.
 *
 * Invariants (game-rules.md):
 *   INV-7: a wrong answer is final for the turn (LOCKED, no changes allowed)
 */
import { AnswerStatus } from './types';
import { GameRuleViolationError } from './GameRuleViolationError';

export interface PlayerAnswer {
  readonly playerId: string;
  readonly turnId: string;
  selectedOptionId: string | null;
  status: AnswerStatus;
  /** Server-side timestamp when the answer was submitted. */
  answeredAt: number | null;
}

/** Create a pending (unanswered) answer slot for a guesser. */
export function createPlayerAnswer(playerId: string, turnId: string): PlayerAnswer {
  return { playerId, turnId, selectedOptionId: null, status: AnswerStatus.PENDING, answeredAt: null };
}

/**
 * Record a guesser's answer.
 * Throws GameRuleViolationError(ALREADY_LOCKED) if the player is locked out.
 */
export function submitAnswer(
  answer: PlayerAnswer,
  optionId: string,
  isCorrect: boolean,
  serverTimestampMs: number,
): PlayerAnswer {
  if (answer.status === AnswerStatus.LOCKED) {
    throw new GameRuleViolationError(
      'ALREADY_LOCKED',
      `Player ${answer.playerId} is locked out for this turn`,
    );
  }
  return {
    ...answer,
    selectedOptionId: optionId,
    status: isCorrect ? AnswerStatus.ANSWERED : AnswerStatus.LOCKED,
    answeredAt: serverTimestampMs,
  };
}
