// Shared client/server contract. Everything the server receives goes through
// the parse* helpers below; never trust a raw client payload.

export const LANGS = ["en", "it", "fr", "es", "de"] as const;
export type Lang = (typeof LANGS)[number];
export const LANG_NAMES: Record<Lang, string> = {
  en: "English",
  it: "Italian",
  fr: "French",
  es: "Spanish",
  de: "German",
};

export const AVATAR_PARTS = {
  skin: 6,
  eyes: 5,
  mouth: 5,
  hair: 6,
  hairColor: 6,
  accessory: 5,
} as const;
export type Avatar = Record<keyof typeof AVATAR_PARTS, number>;

export interface Profile {
  nickname: string;
  avatar: Avatar;
}

export interface Settings {
  lang: Lang;
  rounds: number;
  turnTime: number; // seconds
  isPublic: boolean;
}

export const MAX_PLAYERS = 8;
export const PICK_TIME = 30;
export const REVEAL_TIME = 5;

export type Phase = "lobby" | "picking" | "guessing" | "reveal" | "podium";

export interface PlayerView {
  id: string;
  nickname: string;
  avatar: Avatar;
  score: number;
  connected: boolean;
  answered: boolean; // answered this turn (not whether correctly)
}

export interface Snapshot {
  code: string;
  settings: Settings;
  hostId: string;
  players: PlayerView[];
  phase: Phase;
  round: number; // 1-based
  gmId: string | null;
  endsInMs: number | null;
  prompt: { word: string; lang: Lang } | null;
  options: string[];
  myAnswer: number | null;
  // Only present once the turn is revealed.
  correctIndex?: number;
  turnPoints?: Record<string, number>;
}

export interface RoomSummary {
  code: string;
  lang: Lang;
  players: number;
  maxPlayers: number;
  rounds: number;
  turnTime: number;
  status: "waiting" | "in-game" | "full";
}

export type ClientMsg =
  | { type: "create"; profile: Profile; settings: Settings }
  | { type: "join"; code: string; profile: Profile; token?: string }
  | { type: "leave" }
  | { type: "start" }
  | { type: "check"; word: string }
  | { type: "submit"; word: string }
  | { type: "skip" }
  | { type: "answer"; index: number }
  | { type: "chat"; text: string };
// Rematch = "start" sent by the host while on the podium.

export type ServerMsg =
  | { type: "joined"; code: string; playerId: string; token: string }
  | { type: "state"; snapshot: Snapshot }
  | { type: "check"; word: string; valid: boolean }
  | { type: "chat"; from: string; text: string; at: number }
  | { type: "error"; message: string };

export class GameError extends Error {}

const CONTROL = /[\p{Cc}\p{Cf}]/u;

export function cleanText(v: unknown, max: number, field: string): string {
  if (typeof v !== "string") throw new GameError(`${field} is required.`);
  const s = v.normalize("NFKC").trim();
  if (!s) throw new GameError(`${field} is required.`);
  if (s.length > max) throw new GameError(`${field} is too long (max ${max}).`);
  if (CONTROL.test(s)) throw new GameError(`${field} has invalid characters.`);
  return s;
}

function intIn(v: unknown, min: number, max: number, field: string): number {
  if (!Number.isInteger(v) || (v as number) < min || (v as number) > max)
    throw new GameError(`${field} must be between ${min} and ${max}.`);
  return v as number;
}

export function parseProfile(v: unknown): Profile {
  const p = (v ?? {}) as Record<string, unknown>;
  const a = (p.avatar ?? {}) as Record<string, unknown>;
  const avatar = {} as Avatar;
  for (const [k, n] of Object.entries(AVATAR_PARTS))
    avatar[k as keyof Avatar] = intIn(a[k], 0, n - 1, `Avatar ${k}`);
  return { nickname: cleanText(p.nickname, 20, "Nickname"), avatar };
}

export function parseSettings(v: unknown): Settings {
  const s = (v ?? {}) as Record<string, unknown>;
  if (!LANGS.includes(s.lang as Lang))
    throw new GameError("Unknown target language.");
  return {
    lang: s.lang as Lang,
    rounds: intIn(s.rounds, 1, 10, "Rounds"),
    turnTime: intIn(s.turnTime, 15, 120, "Turn time"),
    isPublic: s.isPublic === true,
  };
}
