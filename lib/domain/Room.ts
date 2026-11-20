/**
 * A game room, public or private.
 *
 * Invariants (game-rules.md):
 *   INV-1: 2 to 8 players
 *   INV-10: inactive rooms expire after 24 h
 */
import { RoomStatus } from './types';
import type { Player } from './Player';
import { GameRuleViolationError } from './GameRuleViolationError';

export const MAX_PLAYERS = 8;
export const MIN_PLAYERS = 2;
export const ROOM_EXPIRY_MS = 24 * 60 * 60 * 1000;

export interface Room {
  readonly id: string;
  /** 6-character opaque code for private rooms. */
  readonly code: string;
  readonly isPublic: boolean;
  readonly targetLanguage: string;
  readonly totalRounds: number;
  readonly turnTimerMs: number;
  readonly hostId: string;
  players: Player[];
  status: RoomStatus;
  currentGameId: string | null;
  readonly createdAt: number;
  readonly expiresAt: number;
}

/** Add a player to a room, respecting the MAX_PLAYERS invariant. */
export function addPlayer(room: Room, player: Player): Room {
  if (room.players.length >= MAX_PLAYERS) {
    throw new GameRuleViolationError('ROOM_FULL', `Room ${room.id} is full (max ${MAX_PLAYERS})`);
  }
  return { ...room, players: [...room.players, player] };
}
