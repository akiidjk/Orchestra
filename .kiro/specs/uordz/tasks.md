# Uordz — Tasks

- [x] T1: Add `ws`, `@types/ws`, `tsx`; fix RTL cleanup in `tests/setup.ts`
- [x] T2: `lib/game/protocol.ts` — shared types + validation (US-1, US-2, US-3, US-7)
- [x] T3: `lib/game/dictionary.ts` + `lib/game/words.ts` + tests (US-4)
- [x] T4: `lib/game/room.ts` + tests — phases, timers, scoring, privacy, reconnect, rematch (US-4, US-5, US-6, US-8)
- [x] T5: `lib/game/rooms.ts` + `server.ts` — registry, codes, public list, expiry, WS dispatch (US-1, US-2, US-8)
- [x] T6: `lib/client/useRoom.ts`, `lib/client/sound.ts` (US-3, US-9)
- [x] T7: `components/avatar.tsx` (+ editor) and game components (US-3, US-4, US-7, US-9)
- [x] T8: `app/page.tsx` home and `app/room/[code]/page.tsx` (US-1, US-2, US-4)
- [x] T9: Theme (palette per language, motion) in `app/globals.css`, layout metadata
- [x] T10: Scripts (`dev`/`start` via `tsx server.ts`), README, steering `workflow.md`/`structure.md`/`tech.md`

## Verification

- [x] `npm test`
- [x] `npm run typecheck`
- [x] `npm run lint`
- [ ] `npm run format:check` (passes on Uordz code; fails on 18 docs/steering/hook files added outside this spec)
- [x] `npm run build`
- [x] Manual: full 2-player game over WebSocket against the prod build (browser UI not yet eyeballed)
