# Uordz — Design

## Architecture

```text
browser ──HTTP──▶ server.ts ──▶ Next.js request handler (pages, assets)
        ──WS /ws─▶ server.ts ──▶ lib/game/rooms.ts (in-memory store)
        ──GET /api/rooms─▶ server.ts (public room list, JSON)
```

- `server.ts`: single Node process. Custom HTTP server wraps Next and attaches a `ws` WebSocketServer on `/ws`. Run with `tsx` (dev and prod). The store lives here, not in Next route handlers, because Next bundles route handlers into separate module instances.
- State is in memory, single instance. Restarting the server drops every room (documented limit).

## Modules

| File                       | Responsibility                                                                                        |
| -------------------------- | ----------------------------------------------------------------------------------------------------- |
| `lib/game/dictionary.ts`   | Bundled concepts: `[en, it, fr, es, de]` tuples.                                                      |
| `lib/game/words.ts`        | `lookup`, `translate`, `randomConcept`, `buildBallot` (real + 4 fakes), pseudo-word generator.         |
| `lib/game/room.ts`         | `Room` class: players, phases, timers, scoring, per-player snapshots. Pure domain + `setTimeout`.     |
| `lib/game/rooms.ts`        | Room registry, code generation, public list, 24 h expiry sweep, WS message dispatch.                   |
| `lib/game/protocol.ts`     | Shared types (client ⇄ server messages, snapshot, avatar, settings, languages) and validation helpers. |
| `lib/client/useRoom.ts`    | Client hook: WS connection, auto-reconnect, sessionStorage token.                                      |
| `lib/client/sound.ts`      | WebAudio tones, off by default.                                                                       |
| `components/avatar.tsx`    | Flat SVG avatar + `AvatarEditor`.                                                                     |
| `components/game/*.tsx`    | Lobby, Stage (prompt + arc timer + cards), Chat, Scoreboard, Podium.                                  |
| `app/page.tsx`             | Home: profile, create room, join by code, Open Rooms.                                                 |
| `app/room/[code]/page.tsx` | Game screen.                                                                                          |

## Phases

```text
lobby ─start─▶ picking (30 s) ─word/timeout─▶ guessing (turnTime) ─all answered/timeout─▶ reveal (5 s)
                  ▲                                                                        │
                  └──────────────────────── next GM ◀──────────────────────────────────────┘
reveal of last turn of last round ─▶ podium ─rematch─▶ lobby
```

Turn order is fixed at game start (`order: playerId[]`). `turnIndex` counts turns; `round = floor(turnIndex / order.length)`. Players who leave are dropped from `order`.

## Protocol (JSON over WS)

Client → server (`type`):

- `create {profile, settings}` · `join {code, profile, token?}` · `leave`
- `start` (host; also rematch from podium) · `check {word}` (GM) · `submit {word}` (GM) · `skip` (GM)
- `answer {index}` (guesser) · `chat {text}`

Server → client:

- `joined {code, playerId, token}` — once, token only to the owner.
- `state {snapshot}` — personalised; sent after every change.
- `check {word, valid}` · `chat {from, text, at}` · `error {message}`.

Snapshot contains settings, players (id, nickname, avatar, score, connected, answered?), phase, round, gmId, `endsInMs` (relative, avoids clock skew), prompt `{word, lang}`, options (strings only), `myAnswer`, and after reveal: `correctIndex`, `turnPoints`. `correctIndex` is `undefined` before reveal.

## Fake generation

Target language word list = all dictionary entries for that language.

1. Two "wrong translations": dictionary words in the target language, preferring similar length / same first letter, excluding the real one.
2. Two pseudo-words: mutate the real translation (swap adjacent letters, change a vowel, change a consonant), re-rolled until not equal to the real word, not in the dictionary, and not already in the ballot.
3. Fallback: more dictionary words if mutation fails (very short words).

## Scoring

`points(rank, elapsedMs, turnMs) = rank === 0 ? 3 : elapsedMs <= turnMs / 2 ? 2 : 1` for correct answers; GM +1 when no correct answer and ≥ 1 guesser.

## Security / validation

All input validated server-side (`protocol.ts`): NFKC nickname, avatar ranges, settings ranges, chat length, message size cap (4 KiB), JSON parse errors → `error`. Tokens: `crypto.randomUUID()`.

## Testing

- `lib/game/words.test.ts` — lookup across languages, ballot of 5 distinct options containing the translation, fakes not equal to the answer.
- `lib/game/room.test.ts` — fake timers: rotation, auto-pick on timeout, scoring, lockout, GM stump, privacy of snapshot, reconnect, podium, rematch.
- `components/avatar.test.tsx`, `app/page.test.tsx` — render smoke tests.
