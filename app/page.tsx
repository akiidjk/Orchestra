"use client";

import { useEffect, useState } from "react";
import type { Route } from "next";
import { useRouter } from "next/navigation";
import { randomAvatar } from "@/components/avatar";
import { ProfileForm } from "@/components/profile-form";
import { Button } from "@/components/ui/button";
import { loadProfile, saveProfile } from "@/lib/client/session";
import { isSoundOn, setSoundOn } from "@/lib/client/sound";
import {
  LANGS,
  LANG_NAMES,
  type Lang,
  type Profile,
  type RoomSummary,
} from "@/lib/game/protocol";

const STATUS_LABEL: Record<RoomSummary["status"], string> = {
  waiting: "Waiting",
  "in-game": "In game",
  full: "Full",
};

const card = "rounded-3xl border border-border bg-card p-6 shadow-sm";
const field =
  "rounded-xl border border-border bg-card px-3 py-2 font-normal focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-brand";

export default function Home() {
  const router = useRouter();
  // Fixed default until mounted, so server and client render the same markup.
  const [profile, setProfile] = useState<Profile>({
    nickname: "",
    avatar: { skin: 0, eyes: 0, mouth: 0, hair: 0, hairColor: 0, accessory: 0 },
  });
  const [sound, setSound] = useState(false);
  const [lang, setLang] = useState<Lang>("en");
  const [rounds, setRounds] = useState(5);
  const [turnTime, setTurnTime] = useState(60);
  const [isPublic, setIsPublic] = useState(false);
  const [code, setCode] = useState("");
  const [rooms, setRooms] = useState<RoomSummary[] | null>(null);

  useEffect(() => {
    setProfile(loadProfile() ?? { nickname: "", avatar: randomAvatar() });
    setSound(isSoundOn());
  }, []);

  useEffect(() => {
    const refresh = () =>
      fetch("/api/rooms")
        .then((r) => (r.ok ? r.json() : []))
        .then((list: RoomSummary[]) => setRooms(list))
        .catch(() => setRooms([]));
    refresh();
    const id = setInterval(refresh, 5000);
    return () => clearInterval(id);
  }, []);

  const ready = profile.nickname.trim() !== "";
  const go = (path: string) => {
    saveProfile({ ...profile, nickname: profile.nickname.trim() });
    router.push(path as Route);
  };
  const updateProfile = (p: Profile) => {
    setProfile(p);
    saveProfile(p);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-5xl flex-col gap-6 px-4 py-10">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-5xl font-extrabold text-indigo-brand">
            Uordz 🎵
          </h1>
          <p className="mt-1 text-lg text-muted italic">
            Can you hear the right word?
          </p>
        </div>
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
      </header>

      <section className={card} aria-labelledby="profile-h">
        <h2 id="profile-h" className="mb-4 text-2xl font-bold">
          Your player
        </h2>
        <ProfileForm value={profile} onChange={updateProfile} />
      </section>

      <div className="grid gap-6 md:grid-cols-2">
        <section className={card} aria-labelledby="create-h">
          <h2 id="create-h" className="mb-4 text-2xl font-bold">
            Create room
          </h2>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              const q = new URLSearchParams({
                lang,
                rounds: String(rounds),
                turnTime: String(turnTime),
                public: isPublic ? "1" : "0",
              });
              go(`/room/new?${q}`);
            }}
          >
            <label className="flex flex-col gap-1 font-semibold">
              Target language
              <select
                className={field}
                value={lang}
                onChange={(e) => setLang(e.target.value as Lang)}
              >
                {LANGS.map((l) => (
                  <option key={l} value={l}>
                    {LANG_NAMES[l]}
                  </option>
                ))}
              </select>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <label className="flex flex-col gap-1 font-semibold">
                Rounds
                <input
                  className={field}
                  type="number"
                  min={1}
                  max={10}
                  required
                  value={rounds}
                  onChange={(e) => setRounds(e.target.valueAsNumber)}
                />
              </label>
              <label className="flex flex-col gap-1 font-semibold">
                Turn time (s)
                <input
                  className={field}
                  type="number"
                  min={15}
                  max={120}
                  required
                  value={turnTime}
                  onChange={(e) => setTurnTime(e.target.valueAsNumber)}
                />
              </label>
            </div>
            <label className="flex items-center gap-2 font-semibold">
              <input
                type="checkbox"
                className="h-5 w-5 accent-amber-500"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Public (listed in Open Rooms)
            </label>
            <Button type="submit" disabled={!ready}>
              Create room
            </Button>
          </form>
        </section>

        <section className={card} aria-labelledby="join-h">
          <h2 id="join-h" className="mb-4 text-2xl font-bold">
            Join with code
          </h2>
          <form
            className="flex flex-col gap-3"
            onSubmit={(e) => {
              e.preventDefault();
              go(`/room/${code}`);
            }}
          >
            <label className="flex flex-col gap-1 font-semibold">
              Room code
              <input
                className={`${field} font-mono text-2xl tracking-[0.3em] uppercase`}
                value={code}
                maxLength={6}
                minLength={6}
                pattern="[A-Z0-9]{6}"
                required
                autoComplete="off"
                onChange={(e) =>
                  setCode(e.target.value.toUpperCase().replace(/\s/g, ""))
                }
              />
            </label>
            <Button
              type="submit"
              variant="accent"
              disabled={!ready || code.length !== 6}
            >
              Join
            </Button>
          </form>
        </section>
      </div>

      <section className={card} aria-labelledby="rooms-h">
        <h2 id="rooms-h" className="mb-4 text-2xl font-bold">
          Open Rooms
        </h2>
        {rooms === null ? (
          <p className="text-muted">Loading…</p>
        ) : rooms.length === 0 ? (
          <p className="text-muted">No open rooms yet — create one!</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {rooms.map((r) => (
              <li
                key={r.code}
                data-lang={r.lang}
                className="flex flex-wrap items-center gap-3 rounded-2xl border border-border border-l-8 border-l-accent px-4 py-3"
              >
                <span className="font-bold">{LANG_NAMES[r.lang]}</span>
                <span className="text-muted">
                  {r.players}/{r.maxPlayers} players · {r.rounds} rounds ·{" "}
                  {r.turnTime}s
                </span>
                <span
                  className={`rounded-full px-2 py-0.5 text-sm font-semibold ${r.status === "waiting" ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"}`}
                >
                  {STATUS_LABEL[r.status]}
                </span>
                <Button
                  className="ml-auto"
                  variant="outline"
                  disabled={!ready || r.status !== "waiting"}
                  aria-label={`Join ${LANG_NAMES[r.lang]} room ${r.code}`}
                  onClick={() => go(`/room/${r.code}`)}
                >
                  Join
                </Button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}
