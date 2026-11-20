const KEY = "uordz:sound";

export function isSoundOn(): boolean {
  try {
    return localStorage.getItem(KEY) === "1";
  } catch {
    return false;
  }
}

export function setSoundOn(on: boolean) {
  try {
    localStorage.setItem(KEY, on ? "1" : "0");
  } catch {}
}

// [frequency Hz, start offset s, duration s]
const TONES: Record<string, [number, number, number][]> = {
  chime: [[880, 0, 0.15]],
  correct: [
    [660, 0, 0.1],
    [990, 0.1, 0.15],
  ],
  wrong: [[140, 0, 0.25]],
  fanfare: [
    [523, 0, 0.12],
    [659, 0.12, 0.12],
    [784, 0.24, 0.12],
    [1047, 0.36, 0.3],
  ],
};

let ctx: AudioContext | null = null;

export function play(kind: "chime" | "correct" | "wrong" | "fanfare") {
  if (!isSoundOn() || typeof AudioContext === "undefined") return;
  try {
    ctx ??= new AudioContext();
    const now = ctx.currentTime;
    for (const [freq, at, dur] of TONES[kind]) {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = kind === "wrong" ? "triangle" : "sine";
      osc.frequency.value = freq;
      gain.gain.setValueAtTime(0.2, now + at);
      gain.gain.exponentialRampToValueAtTime(0.001, now + at + dur);
      osc.connect(gain).connect(ctx.destination);
      osc.start(now + at);
      osc.stop(now + at + dur);
    }
  } catch {}
}
