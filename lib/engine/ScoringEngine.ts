/**
 * Calculates points for a completed turn.
 * All scoring rules are defined in game-rules.md and scoring-invariants.md.
 *
 * Key invariants:
 *   SCORE-INV-2: speedMs = answeredAt - ballotRevealedAt (both server timestamps)
 *   SCORE-INV-4: first correct answer earns +3
 *   SCORE-INV-7: GM earns +1 only if nobody answered correctly
 */
import type { Turn } from '../domain/Turn';
import type { TurnScore } from '../domain/types';
import { AnswerStatus } from '../domain/types';
import { assertValidTimestamp } from '../validation/GameRulesValidator';
import { getCorrectOption } from '../domain/WordChallenge';

/** Scoring constants. ADR OPEN-001: fast threshold TBD — using 0.5 as default. */
export const FAST_RESPONSE_THRESHOLD = 0.5;
export const POINTS_FIRST_CORRECT = 3;
export const POINTS_FAST_CORRECT = 2;
export const POINTS_SLOW_CORRECT = 1;
export const POINTS_GM_STUMPED = 1;

/**
 * Calculate scores for all participants after the Reveal phase.
 * Returns one TurnScore per player (guessers + GM).
 */
export function calculateScores(turn: Turn, turnTimerMs: number): TurnScore[] {
  if (!turn.challenge || turn.challenge.ballotRevealedAt === null) {
    return [];
  }

  const revealedAt = turn.challenge.ballotRevealedAt;
  const correctOptionId = getCorrectOption(turn.challenge).id;
  const scores: TurnScore[] = [];
  let anyCorrect = false;
  let firstCorrectAt: number | null = null;

  // Score guessers
  for (const answer of Object.values(turn.answers)) {
    if (answer.status === AnswerStatus.PENDING || answer.answeredAt === null) {
      scores.push({ playerId: answer.playerId, points: 0, speedMs: null });
      continue;
    }

    assertValidTimestamp(revealedAt, answer.answeredAt);
    const speedMs = answer.answeredAt - revealedAt;
    const isCorrect = answer.selectedOptionId === correctOptionId;

    if (!isCorrect) {
      scores.push({ playerId: answer.playerId, points: 0, speedMs });
      continue;
    }

    anyCorrect = true;
    if (firstCorrectAt === null || answer.answeredAt < firstCorrectAt) {
      firstCorrectAt = answer.answeredAt;
    }

    const points = scoreForCorrectAnswer(speedMs, turnTimerMs, firstCorrectAt === answer.answeredAt);
    scores.push({ playerId: answer.playerId, points, speedMs });
  }

  // Score Game Master (SCORE-INV-7 / SCORE-INV-8)
  scores.push({
    playerId: turn.gameMasterId,
    points: anyCorrect ? 0 : POINTS_GM_STUMPED,
    speedMs: null,
  });

  return scores;
}

function scoreForCorrectAnswer(speedMs: number, timerMs: number, isFirst: boolean): number {
  if (isFirst) return POINTS_FIRST_CORRECT;
  return speedMs <= timerMs * FAST_RESPONSE_THRESHOLD ? POINTS_FAST_CORRECT : POINTS_SLOW_CORRECT;
}
