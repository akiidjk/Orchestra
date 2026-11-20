import type { Profile } from "@/lib/game/protocol";

// Storage can throw (private mode, blocked site data); treat that as empty.
function get(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

function set(key: string, value: string | null) {
  try {
    if (value === null) sessionStorage.removeItem(key);
    else sessionStorage.setItem(key, value);
  } catch {}
}

const PROFILE = "uordz:profile";
const token = (code: string) => `uordz:token:${code}`;

export function loadProfile(): Profile | null {
  try {
    return JSON.parse(get(PROFILE) ?? "null") as Profile | null;
  } catch {
    return null;
  }
}

export function saveProfile(p: Profile) {
  set(PROFILE, JSON.stringify(p));
}

export function loadToken(code: string): string | undefined {
  return get(token(code)) ?? undefined;
}

export function saveToken(code: string, value: string) {
  set(token(code), value);
}

export function clearToken(code: string) {
  set(token(code), null);
}
