/**
 * Core domain types for Orchestra.
 * All game entities are defined here and imported by other domain modules.
 */

// ─── Enums ────────────────────────────────────────────────────────────────────

/** Phases of a single turn in a game. */
export enum TurnPhase {
  WORD_SELECTION = 'WORD_SELECTION',
  BALLOT_BUILDING = 'BALLOT_BUILDING',
  ACTIVE_GUESSING = 'ACTIVE_GUESSING',
  REVEAL = 'REVEAL',
  COMPLETED = 'COMPLETED',
}

/** State of a player's answer within a turn. */
export enum AnswerStatus {
  PENDING = 'PENDING',
  ANSWERED = 'ANSWERED',
  LOCKED = 'LOCKED',
}

/** Result of validating the Game Master's word against the dictionary. */
export enum WordValidationStatus {
  PENDING = 'PENDING',
  VALID = 'VALID',
  INVALID = 'INVALID',
}

/** Overall state of the game room. */
export enum RoomStatus {
  LOBBY = 'LOBBY',
  IN_GAME = 'IN_GAME',
  FINISHED = 'FINISHED',
}

// ─── Error codes ──────────────────────────────────────────────────────────────

/** All possible rule-violation codes. See game-rules.md invariants. */
export type GameRuleErrorCode =
  | 'WRONG_PHASE'
  | 'NOT_GAME_MASTER'
  | 'NOT_A_GUESSER'
  | 'ALREADY_LOCKED'
  | 'TURN_EXPIRED'
  | 'ROOM_FULL'
  | 'INVALID_TIMESTAMP'
  | 'INVALID_OPTIONS';

// ─── Value objects ────────────────────────────────────────────────────────────

/** An avatar assembled from fixed visual components. Stored in sessionStorage. */
export interface Avatar {
  eyes: string;
  mouth: string;
  hair: string;
  accessory: string;
  skinTone: string;
}

/** One of the five options shown in a ballot. */
export interface BallotOption {
  id: string;
  text: string;
  isCorrect: boolean;
}

/** Score awarded to a player for a single turn. */
export interface TurnScore {
  playerId: string;
  points: number;
  /** Speed in ms from ballotRevealedAt to answeredAt. Null for Game Master. */
  speedMs: number | null;
}
