import { Avatar } from "@/components/avatar";
import { Button } from "@/components/ui/button";
import type { ClientMsg, PlayerView, Snapshot } from "@/lib/game/protocol";

/** Competition ranking: equal scores share a rank (1, 1, 3, …). */
export function rank(players: PlayerView[]) {
  const sorted = [...players].sort((a, b) => b.score - a.score);
  return sorted.map((p) => ({
    ...p,
    rank: 1 + sorted.filter((q) => q.score > p.score).length,
  }));
}

const STEP = { 1: "h-32", 2: "h-24", 3: "h-16" } as const;

export function Podium({
  snapshot,
  me,
  send,
  onHome,
}: {
  snapshot: Snapshot;
  me: string | null;
  send: (msg: ClientMsg) => void;
  onHome: () => void;
}) {
  const ranked = rank(snapshot.players);

  return (
    <section aria-labelledby="podium-title" className="space-y-8 text-center">
      <h2 id="podium-title" className="text-3xl font-bold">
        Final podium
      </h2>

      <div className="flex items-end justify-center gap-4">
        {([2, 1, 3] as const).map((pos) => {
          const group = ranked.filter((p) => p.rank === pos);
          if (!group.length) return null;
          return (
            <div key={pos} className="flex flex-col items-center gap-2">
              <div className="flex flex-wrap justify-center gap-2">
                {group.map((p) => (
                  <div key={p.id} className="flex flex-col items-center">
                    <Avatar avatar={p.avatar} size={96} title={p.nickname} />
                    <span className="font-semibold">{p.nickname}</span>
                    <span className="text-sm text-muted">{p.score} pts</span>
                  </div>
                ))}
              </div>
              <div
                className={`${STEP[pos]} flex w-24 items-start justify-center rounded-t-lg pt-2 text-2xl font-bold text-white ${pos === 1 ? "bg-amber-brand" : "bg-indigo-brand"}`}
              >
                {pos}
              </div>
            </div>
          );
        })}
      </div>

      <ol aria-label="Final ranking" className="mx-auto max-w-sm space-y-1">
        {ranked.map((p) => (
          <li key={p.id} className="flex items-center gap-2 text-left">
            <span className="w-8 font-bold">{p.rank}.</span>
            <Avatar avatar={p.avatar} size={32} title={p.nickname} />
            <span className="flex-1 truncate">{p.nickname}</span>
            <span className="font-mono">{p.score}</span>
          </li>
        ))}
      </ol>

      <div className="flex justify-center gap-3">
        {me === snapshot.hostId && (
          <Button variant="accent" onClick={() => send({ type: "start" })}>
            Rematch
          </Button>
        )}
        <Button variant="outline" onClick={onHome}>
          Back home
        </Button>
      </div>
    </section>
  );
}
