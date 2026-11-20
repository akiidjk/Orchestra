import { Avatar } from "@/components/avatar";
import type { Snapshot } from "@/lib/game/protocol";

export function Scoreboard({
  snapshot,
  me,
}: {
  snapshot: Snapshot;
  me: string | null;
}) {
  const players = [...snapshot.players].sort((a, b) => b.score - a.score);
  return (
    <section
      aria-labelledby="scores-title"
      className="rounded-xl border border-border bg-card p-3"
    >
      <h2 id="scores-title" className="mb-2 font-semibold">
        Scores
      </h2>
      <ol className="space-y-2">
        {players.map((p) => {
          const delta = snapshot.turnPoints?.[p.id] ?? 0;
          return (
            <li
              key={p.id}
              className={`flex items-center gap-2 ${p.connected ? "" : "opacity-50"}`}
            >
              <Avatar avatar={p.avatar} size={48} title={p.nickname} />
              <span className="min-w-0 flex-1 truncate">
                {p.nickname}
                {p.id === me && <span className="text-muted"> (you)</span>}
                {p.id === snapshot.gmId && (
                  <span title="Game Master" aria-label="Game Master">
                    {" "}
                    🎼
                  </span>
                )}
                {p.id === snapshot.hostId && (
                  <span className="text-xs text-muted"> host</span>
                )}
                {!p.connected && <span className="text-muted"> (away)</span>}
                {snapshot.phase === "guessing" && p.answered && (
                  <span className="text-ok" aria-label="answered">
                    {" "}
                    ✓
                  </span>
                )}
              </span>
              {snapshot.phase === "reveal" && delta > 0 && (
                <span className="bounce-in font-bold text-ok">+{delta}</span>
              )}
              <span className="w-8 text-right font-mono tabular-nums">
                {p.score}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
