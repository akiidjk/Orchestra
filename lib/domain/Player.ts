/**
 * Represents a participant in a room.
 * Identity is session-based (no persistent account). See security.md.
 */
import type { Avatar } from './types';

export interface Player {
  readonly id: string;
  readonly nickname: string;
  readonly avatar: Avatar;
  /** Cumulative score across all turns in the current game. */
  totalScore: number;
  /** Whether the player is currently connected via WebSocket. */
  connected: boolean;
}

/** Create a new Player with zero score. */
export function createPlayer(id: string, nickname: string, avatar: Avatar): Player {
  return { id, nickname, avatar, totalScore: 0, connected: true };
}

/** Returns a public view of the player safe to send to other clients. */
export function playerPublicView(player: Player): Omit<Player, 'connected'> {
  const { connected: _c, ...pub } = player;
  return pub;
}
