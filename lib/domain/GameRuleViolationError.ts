/**
 * Thrown whenever a game action violates a rule defined in game-rules.md.
 * Always includes a machine-readable `code` matching a GameRuleErrorCode.
 */
import type { GameRuleErrorCode } from './types';

export class GameRuleViolationError extends Error {
  readonly code: GameRuleErrorCode;
  readonly context?: Record<string, unknown>;

  constructor(
    code: GameRuleErrorCode,
    message: string,
    context?: Record<string, unknown>,
  ) {
    super(message);
    this.name = 'GameRuleViolationError';
    this.code = code;
    this.context = context;
  }
}
