"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useMemo, useState } from "react";
import { randomAvatar } from "@/components/avatar";
import { Chat } from "@/components/game/chat";
import { Lobby } from "@/components/game/lobby";
import { Podium } from "@/components/game/podium";
import { Scoreboard } from "@/components/game/scoreboard";
import { Stage } from "@/components/game/stage";
import { ProfileForm } from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { loadProfile, saveProfile } from "@/lib/client/session";
import { isSoundOn, setSoundOn } from "@/lib/client/sound";
import { useRoom } from "@/lib/client/use-room";
import {
  LANG_NAMES,
  LANGS,
  type Lang,
  type Profile,
  type Settings,
} from "@/lib/game/protocol";

export default function RoomPage() {
  return (
    <Suspense fallback={null}>
      <Room />
    </Suspense>
  );
}

function Room() {
  // Frozen at mount: the hook rewrites /room/new to /room/CODE itself and
  // reconnecting on that URL change would be pointless.
  const [code] = useState(useParams<{ code: string }>().code);
  const query = useSearchParams();
  const settings = useMemo<Settings>(() => {
    const lang = query.get("lang") as Lang;
    return {
      lang: LANGS.includes(lang) ? lang : "en",
      rounds: Number(query.get("rounds")) || 5,
      turnTime: Number(query.get("turnTime")) || 60,
      isPublic: query.get("public") === "true" || query.get("public") === "1",
    };
  }, [query]);

  // undefined = not loaded yet (sessionStorage is client-only).
  const [profile, setProfile] = useState<Profile | null | undefined>();
  const [draft, setDraft] = useState<Profile | null>(null);
  useEffect(() => {
    const p = loadProfile();
    setProfile(p);
    if (!p) setDraft({ nickname: "", avatar: randomAvatar() });
  }, []);

  const room = useRoom(
    code,
    profile ?? null,
    code === "new" ? settings : undefined,
  );
  const lang = room.snapshot?.settings.lang ?? settings.lang;

  return (
    <div data-lang={lang} className="min-h-screen">
      {profile === null && draft ? (
        <main className="mx-auto max-w-xl p-6">
          <h1 className="mb-4 text-2xl font-bold">Who&apos;s playing?</h1>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              if (!draft.nickname.trim()) return;
              const p = { ...draft, nickname: draft.nickname.trim() };
              saveProfile(p);
              setProfile(p);
            }}
          >
            <ProfileForm value={draft} onChange={setDraft} />
            <Button type="submit" variant="accent">
              Join
            </Button>
          </form>
        </main>
      ) : (
        profile && <Game room={room} />
      )}
    </div>
  );
}

function Game({ room }: { room: ReturnType<typeof useRoom> }) {
  const router = useRouter();
  const { snapshot, me, send } = room;
  const [copied, setCopied] = useState(false);
  const [sound, setSound] = useState(false);
  useEffect(() => setSound(isSoundOn()), []);

  const leave = () => {
    send({ type: "leave" });
    router.push("/");
  };

  return (
    <>
      <header className="flex flex-wrap items-center gap-3 border-b border-border bg-card px-4 py-3">
        <h1 className="text-xl font-bold">
          Uordz<span className="text-accent">.</span>
        </h1>
        {snapshot && (
          <>
            <span className="font-mono text-lg tracking-widest">
              {snapshot.code}
            </span>
            <Button
              variant="outline"
              className="px-2 py-1 text-sm"
              onClick={() =>
                navigator.clipboard
                  ?.writeText(snapshot.code)
                  .then(() => setCopied(true))
                  .catch(() => {})
              }
            >
              {copied ? "Copied!" : "Copy code"}
            </Button>
            <span className="text-muted">
              {LANG_NAMES[snapshot.settings.lang]}
            </span>
            {snapshot.phase !== "lobby" && (
              <span className="text-muted">
                Round {snapshot.round}/{snapshot.settings.rounds}
              </span>
            )}
          </>
        )}
        <div className="ml-auto flex gap-2">
          <Button
            variant="outline"
            aria-pressed={sound}
            onClick={() => {
              setSoundOn(!sound);
              setSound(!sound);
            }}
          >
            {sound ? "🔊 Sound on" : "🔇 Sound off"}
          </Button>
          <Button variant="outline" onClick={leave}>
            Leave
          </Button>
        </div>
      </header>

      {room.status !== "open" && (
        <p role="status" className="bg-amber-brand/20 px-4 py-2 text-center">
          {room.status === "connecting"
            ? "Connecting…"
            : "Connection lost. Reconnecting…"}
        </p>
      )}
      {room.error && (
        <div
          role="alert"
          className="flex items-center justify-center gap-3 bg-bad/15 px-4 py-2 text-bad"
        >
          <span>{room.error}</span>
          <button type="button" className="underline" onClick={room.clearError}>
            Dismiss
          </button>
        </div>
      )}

      {snapshot && (
        <div className="mx-auto grid max-w-7xl gap-6 p-4 lg:grid-cols-[1fr_20rem]">
          <main>
            {snapshot.phase === "lobby" ? (
              <Lobby snapshot={snapshot} me={me} send={send} />
            ) : snapshot.phase === "podium" ? (
              <Podium snapshot={snapshot} me={me} send={send} onHome={leave} />
            ) : (
              <Stage
                snapshot={snapshot}
                me={me}
                check={room.check}
                send={send}
              />
            )}
          </main>
          <aside className="flex flex-col gap-4">
            {snapshot.phase !== "lobby" && snapshot.phase !== "podium" && (
              <Scoreboard snapshot={snapshot} me={me} />
            )}
            <Chat
              messages={room.chat}
              onSend={(text) => send({ type: "chat", text })}
            />
          </aside>
        </div>
      )}
    </>
  );
}
