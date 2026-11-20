"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { play } from "@/lib/client/sound";
import {
  LANG_NAMES,
  PICK_TIME,
  REVEAL_TIME,
  type ClientMsg,
  type Snapshot,
} from "@/lib/game/protocol";

interface Props {
  snapshot: Snapshot;
  me: string | null;
  check: { word: string; valid: boolean } | null;
  send: (msg: ClientMsg) => void;
}

const FAN = [
  "lg:-rotate-3 lg:translate-y-3",
  "lg:-rotate-1 lg:translate-y-1",
  "",
  "lg:rotate-1 lg:translate-y-1",
  "lg:rotate-3 lg:translate-y-3",
];

export function Stage({ snapshot, me, check, send }: Props) {
  const { phase, prompt, options, myAnswer, correctIndex } = snapshot;
  const isGm = me === snapshot.gmId;
  const gm = snapshot.players.find((p) => p.id === snapshot.gmId);
  const myPoints = (me && snapshot.turnPoints?.[me]) || 0;

  // Sounds on phase transitions only (not on mount / reconnect).
  const prevPhase = useRef(phase);
  useEffect(() => {
    if (prevPhase.current === phase) return;
    prevPhase.current = phase;
    if (phase === "guessing") play("chime");
    if (phase === "reveal") {
      if (isGm) {
        if (myPoints > 0) play("fanfare");
      } else play(myAnswer === correctIndex ? "correct" : "wrong");
    }
  }, [phase, isGm, myPoints, myAnswer, correctIndex]);

  let result = "";
  if (phase === "reveal" && correctIndex !== undefined) {
    const answer = options[correctIndex];
    if (isGm)
      result =
        myPoints > 0
          ? `You stumped the room! +${myPoints}`
          : `The answer was ${answer}`;
    else if (myAnswer === correctIndex) result = `Correct! +${myPoints}`;
    else result = `The answer was ${answer}`;
  }

  return (
    <section aria-label="Stage" className="flex flex-col items-center gap-6">
      <Timer snapshot={snapshot}>
        {prompt ? (
          <>
            <p className="text-3xl font-bold break-words">{prompt.word}</p>
            <p className="text-sm text-muted">
              {LANG_NAMES[prompt.lang]} → {LANG_NAMES[snapshot.settings.lang]}
            </p>
          </>
        ) : (
          <p className="text-lg text-muted">
            {isGm
              ? "Your cue"
              : `${gm?.nickname ?? "The Game Master"} is picking a word…`}
          </p>
        )}
      </Timer>

      {phase === "picking" && isGm && <Picker check={check} send={send} />}

      {(phase === "guessing" || phase === "reveal") && (
        <>
          {isGm && phase === "guessing" && (
            <p className="text-muted">You&apos;re conducting — sit back.</p>
          )}
          <ul className="grid w-full grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
            {options.map((o, i) => {
              const correct = phase === "reveal" && i === correctIndex;
              const wrongPick =
                phase === "reveal" && i === myAnswer && i !== correctIndex;
              return (
                <li key={`${o}-${i}`} className={FAN[i]}>
                  <button
                    type="button"
                    disabled={phase !== "guessing" || isGm || myAnswer !== null}
                    aria-pressed={myAnswer === i}
                    onClick={() => send({ type: "answer", index: i })}
                    className={`flex min-h-24 w-full flex-col items-center justify-center rounded-xl border-2 p-3 text-xl font-semibold transition-transform enabled:hover:-translate-y-1 ${
                      correct
                        ? "pulse-once border-accent bg-accent text-white"
                        : myAnswer === i
                          ? "border-accent bg-card"
                          : "border-border bg-card"
                    } ${wrongPick ? "shake-once" : ""} ${phase === "reveal" && !correct && !wrongPick ? "opacity-60" : ""}`}
                  >
                    <span className={wrongPick ? "fade-out" : ""}>{o}</span>
                    {correct && <span className="text-sm">✓ Correct</span>}
                    {wrongPick && (
                      <span className="text-sm text-bad">✗ Wrong</span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          {phase === "guessing" && myAnswer !== null && (
            <p className="font-semibold">Locked in</p>
          )}
        </>
      )}

      <p aria-live="polite" className="min-h-7 text-lg font-semibold">
        {result}
      </p>
    </section>
  );
}

function Timer({
  snapshot,
  children,
}: {
  snapshot: Snapshot;
  children: React.ReactNode;
}) {
  const { endsInMs, phase } = snapshot;
  const [left, setLeft] = useState(endsInMs ?? 0);

  useEffect(() => {
    if (endsInMs === null) return setLeft(0);
    const deadline = Date.now() + endsInMs;
    const tick = () => setLeft(Math.max(0, deadline - Date.now()));
    tick();
    const id = setInterval(tick, 250);
    return () => clearInterval(id);
  }, [endsInMs, snapshot]);

  const total =
    1000 *
    (phase === "picking"
      ? PICK_TIME
      : phase === "reveal"
        ? REVEAL_TIME
        : snapshot.settings.turnTime);
  const frac = Math.min(1, left / total);

  return (
    <div className="flex flex-col items-center">
      <div className="relative grid size-64 place-items-center">
        <svg
          viewBox="0 0 100 100"
          className="absolute inset-0 -rotate-90"
          aria-hidden="true"
        >
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="4"
            className="stroke-border"
          />
          <circle
            cx="50"
            cy="50"
            r="46"
            fill="none"
            strokeWidth="4"
            strokeLinecap="round"
            pathLength={100}
            strokeDasharray={100}
            strokeDashoffset={100 * (1 - frac)}
            className="stroke-accent transition-[stroke-dashoffset] duration-200 ease-linear"
          />
        </svg>
        <div className="max-w-44 text-center">{children}</div>
      </div>
      <p role="timer" className="text-sm text-muted tabular-nums">
        {Math.ceil(left / 1000)}s left
      </p>
    </div>
  );
}

function Picker({ check, send }: Pick<Props, "check" | "send">) {
  const [word, setWord] = useState("");
  const w = word.trim();
  useEffect(() => {
    if (!w) return;
    // `send` is stable (useCallback in useRoom), so this only re-fires on typing.
    const id = setTimeout(() => send({ type: "check", word: w }), 250);
    return () => clearTimeout(id);
  }, [w, send]);

  const valid = check?.word === w ? check.valid : null;

  return (
    <form
      className="flex w-full max-w-md flex-col gap-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) send({ type: "submit", word: w });
      }}
    >
      <label htmlFor="gm-word" className="font-semibold">
        Pick a word (any language)
      </label>
      <input
        id="gm-word"
        autoFocus
        autoComplete="off"
        maxLength={40}
        value={word}
        onChange={(e) => setWord(e.target.value)}
        aria-describedby="gm-word-status"
        aria-invalid={valid === false}
        className={`rounded-md border border-border bg-card px-3 py-2 text-lg ${valid === true ? "glow-ok" : valid === false ? "glow-bad" : ""}`}
      />
      <p id="gm-word-status" aria-live="polite" className="min-h-5 text-sm">
        {w && valid === true && <span className="text-ok">Known word ✓</span>}
        {w && valid === false && (
          <span className="text-bad">Not in dictionary</span>
        )}
      </p>
      <div className="flex gap-2">
        <Button type="submit" variant="accent" disabled={!valid}>
          Submit
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => send({ type: "skip" })}
        >
          Pick for me
        </Button>
      </div>
    </form>
  );
}
