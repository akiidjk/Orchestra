/**
 * Governs all turn-phase transitions.
 * No transition happens outside this module. See state-machine.md.
 *
 * Valid sequence: WORD_SELECTION → BALLOT_BUILDING → ACTIVE_GUESSING → REVEAL → COMPLETED
 */
import { TurnPhase } from '../domain/types';
import type { Turn } from '../domain/Turn';
import type { WordChallenge } from '../domain/WordChallenge';
import { GameRuleViolationError } from '../domain/GameRuleViolationError';
import { assertPhase, assertIsGameMaster, assertIsGuesser, assertNotLocked, assertTurnNotExpired } from '../validation/GameRulesValidator';

/** Transition: GM submits a valid word → move to BALLOT_BUILDING. */
export function transitionToBalotBuilding(turn: Turn, gameMasterId: string, nowMs: number): Turn {
  assertPhase(turn, TurnPhase.WORD_SELECTION, 'submitWord');
  assertIsGameMaster(turn, gameMasterId);
  assertTurnNotExpired(turn, nowMs);
  return { ...turn, phase: TurnPhase.BALLOT_BUILDING };
}

/** Transition: system built the ballot → move to ACTIVE_GUESSING and stamp revealedAt. */
export function transitionToActiveGuessing(turn: Turn, challenge: WordChallenge, nowMs: number): Turn {
  assertPhase(turn, TurnPhase.BALLOT_BUILDING, 'revealBallot');
  const challengeWithTimestamp: WordChallenge = { ...challenge, ballotRevealedAt: nowMs };
  return { ...turn, phase: TurnPhase.ACTIVE_GUESSING, challenge: challengeWithTimestamp };
}

/**
 * Transition: guesser submits an answer → record it, possibly advance to REVEAL.
 * Idempotent: a second submit with same optionId returns the turn unchanged.
 */
export function applyAnswer(
  turn: Turn,
  playerId: string,
  optionId: string,
  isCorrect: boolean,
  nowMs: number,
): Turn {
  assertPhase(turn, TurnPhase.ACTIVE_GUESSING, 'submitAnswer');
  assertIsGuesser(turn, playerId);
  const existing = turn.answers[playerId];
  if (!existing) {
    throw new GameRuleViolationError('NOT_A_GUESSER', `Player ${playerId} is not a guesser in turn ${turn.id}`);
  }
  // Idempotent: already answered with same option
  if (existing.selectedOptionId === optionId) return turn;
  assertNotLocked(existing);

  const updatedAnswer = {
    ...existing,
    selectedOptionId: optionId,
    status: isCorrect ? ('ANSWERED' as const) : ('LOCKED' as const),
    answeredAt: nowMs,
  };
  const answers = { ...turn.answers, [playerId]: updatedAnswer };
  const allResolved = Object.values(answers).every(
    (a) => a.status === 'ANSWERED' || a.status === 'LOCKED',
  );
  return { ...turn, answers, phase: allResolved ? TurnPhase.REVEAL : turn.phase };
}

/** Transition: timer expired → move to REVEAL with whatever answers exist. */
export function transitionToRevealOnTimeout(turn: Turn): Turn {
  if (turn.phase !== TurnPhase.ACTIVE_GUESSING) return turn; // idempotent
  return { ...turn, phase: TurnPhase.REVEAL };
}

/** Transition: scores recorded → move to COMPLETED. */
export function transitionToCompleted(turn: Turn): Turn {
  assertPhase(turn, TurnPhase.REVEAL, 'completeTurn');
  return { ...turn, phase: TurnPhase.COMPLETED };
}
