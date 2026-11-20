/**
 * Represents a single turn within a game.
 * One player acts as Game Master; all others are guessers.
 *
 * Invariants (game-rules.md):
 *   INV-2: exactly one Game Master per turn
 *   INV-3: the Game Master does not guess
 */
import { TurnPhase } from './types';
import type { WordChallenge } from './WordChallenge';
import type { PlayerAnswer } from './PlayerAnswer';
import type { TurnScore } from './types';

export interface Turn {
  readonly id: string;
  readonly gameId: string;
  readonly gameMasterId: string;
  readonly guesserIds: readonly string[];
  phase: TurnPhase;
  challenge: WordChallenge | null;
  answers: Record<string, PlayerAnswer>;
  scores: TurnScore[];
  /** Server-side timestamp when the turn started. */
  readonly startedAt: number;
  /** Server-side deadline for word selection (startedAt + 30 000 ms). */
  readonly wordSelectionDeadline: number;
}

/** Constants matching game-rules.md */
export const WORD_SELECTION_TIMEOUT_MS = 30_000;

/** Create a new turn with the given Game Master and guessers. */
export function createTurn(
  id: string,
  gameId: string,
  gameMasterId: string,
  guesserIds: string[],
  nowMs: number,
): Turn {
  return {
    id,
    gameId,
    gameMasterId,
    guesserIds,
    phase: TurnPhase.WORD_SELECTION,
    challenge: null,
    answers: Object.fromEntries(guesserIds.map((gid) => [gid, { playerId: gid, turnId: id, selectedOptionId: null, status: 'PENDING' as const, answeredAt: null }])),
    scores: [],
    startedAt: nowMs,
    wordSelectionDeadline: nowMs + WORD_SELECTION_TIMEOUT_MS,
  };
}
