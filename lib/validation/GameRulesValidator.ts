/**
 * Validates game actions against the rules defined in game-rules.md.
 * All checks throw GameRuleViolationError on failure.
 * This is the single enforcement point — API routes must call these before mutating state.
 */
import { TurnPhase, AnswerStatus } from '../domain/types';
import type { Turn } from '../domain/Turn';
import type { PlayerAnswer } from '../domain/PlayerAnswer';
import { GameRuleViolationError } from '../domain/GameRuleViolationError';

/**
 * Assert that the turn is in the expected phase.
 * INV (game-rules.md): actions are only valid in specific phases.
 */
export function assertPhase(turn: Turn, expected: TurnPhase, action: string): void {
  if (turn.phase !== expected) {
    throw new GameRuleViolationError(
      'WRONG_PHASE',
      `Action '${action}' requires phase ${expected}, current phase is ${turn.phase}`,
      { turnId: turn.id, expected, actual: turn.phase },
    );
  }
}

/**
 * Assert that the acting player is the Game Master.
 * INV: only the GM submits words.
 */
export function assertIsGameMaster(turn: Turn, playerId: string): void {
  if (turn.gameMasterId !== playerId) {
    throw new GameRuleViolationError(
      'NOT_GAME_MASTER',
      `Player ${playerId} is not the Game Master for turn ${turn.id}`,
    );
  }
}

/**
 * Assert that the acting player is a guesser (not the GM).
 * INV: the GM does not answer the ballot.
 */
export function assertIsGuesser(turn: Turn, playerId: string): void {
  if (turn.gameMasterId === playerId) {
    throw new GameRuleViolationError(
      'NOT_A_GUESSER',
      `Player ${playerId} is the Game Master and cannot answer the ballot`,
    );
  }
}

/**
 * Assert that the player has not been locked out.
 * INV-7: a wrong answer is final for the turn.
 */
export function assertNotLocked(answer: PlayerAnswer): void {
  if (answer.status === AnswerStatus.LOCKED) {
    throw new GameRuleViolationError(
      'ALREADY_LOCKED',
      `Player ${answer.playerId} is locked out for this turn`,
    );
  }
}

/**
 * Assert that the word-selection deadline has not passed.
 * If expired, WordAutoGenerator should have intervened already.
 */
export function assertTurnNotExpired(turn: Turn, nowMs: number): void {
  if (turn.phase === TurnPhase.WORD_SELECTION && nowMs > turn.wordSelectionDeadline) {
    throw new GameRuleViolationError(
      'TURN_EXPIRED',
      `Word selection window has expired for turn ${turn.id}`,
    );
  }
}

/**
 * Assert that the ballot-reveal timestamp is valid (server-side, positive).
 * INV-6 (scoring-invariants.md): speedMs must never be negative or zero.
 */
export function assertValidTimestamp(ballotRevealedAt: number, answeredAt: number): void {
  if (answeredAt <= ballotRevealedAt) {
    throw new GameRuleViolationError(
      'INVALID_TIMESTAMP',
      `answeredAt (${answeredAt}) must be after ballotRevealedAt (${ballotRevealedAt})`,
    );
  }
}
