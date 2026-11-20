import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import { LANG_NAMES, type ClientMsg, type Snapshot } from "@/lib/game/protocol";

export function Lobby({
  snapshot,
  me,
  send,
}: {
  snapshot: Snapshot;
  me: string | null;
  send: (msg: ClientMsg) => void;
}) {
  const { settings, players } = snapshot;
  const isHost = me === snapshot.hostId;
  const enough = players.length >= 2;

  return (
    <section aria-labelledby="lobby-title" className="space-y-6">
      <div className="text-center">
        <h2 id="lobby-title" className="text-2xl font-bold">
          Lobby
        </h2>
        <p className="text-muted">
          Share the code{" "}
          <strong className="font-mono text-xl tracking-widest text-accent">
            {snapshot.code}
          </strong>{" "}
          with your friends.
        </p>
        <p className="mt-1 text-sm text-muted">
          {LANG_NAMES[settings.lang]} · {settings.rounds} rounds ·{" "}
          {settings.turnTime}s per turn ·{" "}
          {settings.isPublic ? "Public" : "Private"}
        </p>
      </div>

      <ul
        className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        aria-label="Players"
      >
        {players.map((p) => (
          <li
            key={p.id}
            className={`flex flex-col items-center gap-1 rounded-xl border border-border bg-card p-3 ${p.connected ? "" : "opacity-50"}`}
          >
            <Avatar avatar={p.avatar} size={64} title={p.nickname} />
            <span className="max-w-full truncate font-medium">
              {p.nickname}
            </span>
            {p.id === snapshot.hostId && (
              <span className="rounded-full bg-amber-brand px-2 text-xs">
                Host
              </span>
            )}
          </li>
        ))}
      </ul>

      <div className="text-center">
        {isHost ? (
          <>
            <Button
              variant="accent"
              disabled={!enough}
              aria-describedby={enough ? undefined : "start-hint"}
              onClick={() => send({ type: "start" })}
            >
              Start game
            </Button>
            {!enough && (
              <p id="start-hint" className="mt-2 text-sm text-muted">
                You need at least 2 players to start.
              </p>
            )}
          </>
        ) : (
          <p className="text-muted">Waiting for host…</p>
        )}
      </div>
    </section>
  );
}
