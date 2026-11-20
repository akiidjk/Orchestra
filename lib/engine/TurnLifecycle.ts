/**
 * Orchestrates a full turn: coordinates StateMachine, ScoringEngine, and timeout handling.
 * This is the entry point for turn-level operations in API routes.
 */
import type { Turn } from '../domain/Turn';
import type { WordChallenge } from '../domain/WordChallenge';
import { calculateScores } from './ScoringEngine';
import {
  transitionToBalotBuilding,
  transitionToActiveGuessing,
  applyAnswer,
  transitionToRevealOnTimeout,
  transitionToCompleted,
} from './StateMachine';

export interface TurnLifecycleResult {
  turn: Turn;
  scores?: ReturnType<typeof calculateScores>;
}

/** GM submits a word: validate phase and move to ballot building. */
export function handleWordSubmit(turn: Turn, gameMasterId: string, nowMs: number): Turn {
  return transitionToBalotBuilding(turn, gameMasterId, nowMs);
}

/** System has built the ballot: attach challenge and open guessing window. */
export function handleBallotReady(turn: Turn, challenge: WordChallenge, nowMs: number): Turn {
  return transitionToActiveGuessing(turn, challenge, nowMs);
}

/** A guesser answered: record and auto-advance to Reveal if all done. */
export function handleAnswer(
  turn: Turn,
  playerId: string,
  optionId: string,
  isCorrect: boolean,
  nowMs: number,
): Turn {
  return applyAnswer(turn, playerId, optionId, isCorrect, nowMs);
}

/** Guessing timer expired: force move to Reveal. */
export function handleTimerExpired(turn: Turn): Turn {
  return transitionToRevealOnTimeout(turn);
}

/** Reveal phase: calculate scores and complete the turn. */
export function handleReveal(turn: Turn, turnTimerMs: number): TurnLifecycleResult {
  const scores = calculateScores(turn, turnTimerMs);
  const completedTurn = transitionToCompleted({ ...turn, scores });
  return { turn: completedTurn, scores };
}
