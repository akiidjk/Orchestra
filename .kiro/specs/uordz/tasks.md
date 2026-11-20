# Uordz — Tasks

- [ ] T1: Add `ws`, `@types/ws`, `tsx`; fix RTL cleanup in `tests/setup.ts`
- [ ] T2: `lib/game/protocol.ts` — shared types + validation (US-1, US-2, US-3, US-7)
- [ ] T3: `lib/game/dictionary.ts` + `lib/game/words.ts` + tests (US-4)
- [ ] T4: `lib/game/room.ts` + tests — phases, timers, scoring, privacy, reconnect, rematch (US-4, US-5, US-6, US-8)
- [ ] T5: `lib/game/rooms.ts` + `server.ts` — registry, codes, public list, expiry, WS dispatch (US-1, US-2, US-8)
- [ ] T6: `lib/client/useRoom.ts`, `lib/client/sound.ts` (US-3, US-9)
- [ ] T7: `components/avatar.tsx` (+ editor) and game components (US-3, US-4, US-7, US-9)
- [ ] T8: `app/page.tsx` home and `app/room/[code]/page.tsx` (US-1, US-2, US-4)
- [ ] T9: Theme (palette per language, motion) in `app/globals.css`, layout metadata
- [ ] T10: Scripts (`dev`/`start` via `tsx server.ts`), README, steering `workflow.md`/`structure.md`/`tech.md`

## Verification

- [ ] `npm test`
- [ ] `npm run typecheck`
- [ ] `npm run lint`
- [ ] `npm run format:check`
- [ ] `npm run build`
- [ ] Manual: two browser tabs play a full game
