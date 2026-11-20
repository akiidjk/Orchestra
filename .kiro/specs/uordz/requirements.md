# Uordz — Requirements

## Overview

Real-time multiplayer translation-guessing game, as described in `DESIGN.md` and `.kiro/steering/product.md`. A Game Master (GM) picks a word; everyone else races to pick its real translation in the room's target language among five options.

Decisions taken before implementation:

- Dictionary and translations come from an **offline bundled dictionary** (EN, IT, FR, ES, DE). No API keys, no network.
- UI text is in **English**.
- Real-time transport is a WebSocket served by a custom Node server that also serves Next.js.

## User Stories

### US-1: Create a room

**As a** player **I want** to create a room with my settings **so that** friends can join.

- WHEN a player creates a room THEN the system SHALL create it with a unique 6-character code (no ambiguous chars) and make the creator host.
- The creator SHALL choose target language (en/it/fr/es/de), rounds (1–10, default 5), turn time (15–120 s, default 60) and visibility (private by default, or public).
- IF any setting is out of range THEN the server SHALL reject it with an explicit error.

### US-2: Join a room

- WHEN a player enters a valid code THEN they SHALL join the room's lobby.
- The home page SHALL list public rooms with language, player count/limit and status (waiting / in game / full).
- IF the room is full (8 players), in game, or the nickname is taken (case-insensitive, NFKC) THEN the join SHALL be rejected with a clear message.
- Nickname: 1–20 chars after NFKC + trim, no control chars.

### US-3: Avatar and session

- Before joining, a player SHALL build an avatar from fixed components (skin, eyes, mouth, hair, accessory) with a live preview.
- Nickname, avatar and the per-room reconnect token SHALL be stored in `sessionStorage` and restored on reload.
- The server SHALL validate the avatar (every component an integer within its range).

### US-4: Play a turn

- WHEN the host starts the game (≥ 2 players) THEN the first GM SHALL get a 30-second word-selection window.
- WHILE the GM types THEN the server SHALL report whether the word is in the dictionary (green/red glow).
- WHEN the GM submits a valid word THEN the server SHALL build a ballot of 5 distinct options: the real translation + 4 plausible fakes (other dictionary words and morphological pseudo-words in the target language), shuffled.
- IF the GM times out, skips, or disconnects during selection THEN the server SHALL auto-pick a valid word.
- Guessers SHALL get `turnTime` seconds; each may answer once; a wrong answer locks them out for the turn.
- The turn SHALL end when every connected guesser has answered or time runs out, then a 5 s reveal shows the correct option and the points.
- A round SHALL be one full rotation of GMs; after the last round the podium SHALL show the top 3 and the full ranking.

### US-5: Scoring (server-side only)

- First correct answer: 3 pts. Later correct answers: 2 pts if within the first half of the time window, else 1 pt. Wrong / no answer: 0.
- GM: +1 if nobody guessed correctly (and at least one guesser was in the turn).
- Speed SHALL be measured on the server from the moment the options were sent.
- Ties share a podium position.

### US-6: Privacy

- Before the reveal, no client message SHALL contain the index of the correct option or the translation.
- Reconnect tokens SHALL only be sent to their owner.

### US-7: Chat

- Players SHALL be able to send messages (1–200 chars) at any time; messages are broadcast to the room and never persisted.

### US-8: Disconnects, rematch and expiry

- A disconnected player's slot SHALL be held for 60 s; reconnecting with the token restores nickname, avatar and score.
- IF the host leaves THEN host SHALL pass to the next player. IF fewer than 2 players remain mid-game THEN the game SHALL end with the podium.
- After the podium the host SHALL be able to start a rematch (scores reset, same players).
- Rooms inactive for 24 h SHALL be deleted.

### US-9: Look and feel

- Indigo + amber palette with an accent per target language; rounded sans-serif; arc timer around the prompt; correct pulse / wrong shake; +N bounce.
- Optional synthesized sounds, off by default, toggled globally.
- Accessibility: labelled controls, `aria-pressed`/`disabled` states, live region for reveal results, never colour-only state.

## Non-Goals

Accounts, persistence across server restarts, multi-instance scaling, spectating, custom word lists, skill matchmaking, native apps.
