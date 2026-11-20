# Orchestra 🎵

> *"Can you hear the right word?"*

Orchestra is a multiplayer web game where language becomes your instrument. One player conducts — the others listen for the right note. Fast fingers, sharper minds, and a little luck with vocabulary will carry you to the podium.

---

## What It Is

Orchestra is a real-time word-guessing game built around translation. Each turn, the Game Master picks a word and the system reveals five options in the target language: **one genuine translation** and **four convincing fakes**. Everyone races to pick the real one. Guess fast, guess right, score big.

It is competitive, educational, and deliberately chaotic — the kind of game that teaches you a few words in French without feeling like a lesson.

---

## How a Game Flows

### Setting Up

A player creates a room and becomes the first Game Master. They choose:
- The **target language** (the language all answers will appear in)
- The **number of rounds** (default: 5)
- The **time limit per turn** (default: 60 seconds)

The room can be **public** (visible in the open lobby browser and joinable by anyone) or **private** (accessible only via a shareable 6-character code). Other players join and build their avatar before the game starts.

### Rounds and Turns

A **round** is one full rotation: every player gets one turn as Game Master. Once every player has conducted, the round is over and a new one begins.

**A turn works like this:**

1. **The Game Master picks a word.** They have **30 seconds** to type a word (in any language) and confirm it is valid. The system validates the word against a dictionary before accepting it — invented or misspelled words are rejected with immediate feedback. If the Game Master runs out of time or skips, the system auto-generates a valid word on their behalf.
2. **The system builds the ballot.** The five options shown to guessers are: the real translation into the target language + four plausible fakes (wrong translations or morphologically similar pseudo-words in the same language, generated to look convincing).
3. **Players race to answer.** All five options appear on screen simultaneously. Players pick their answer; the faster the correct answer, the more points scored. Speed is rewarded on a sliding scale within the time window.
4. **Reveal.** The correct answer lights up. Points are awarded. The next player takes the conductor's chair.

After the last round, the **podium** appears with the top three players and the final ranking.

---

## Word Validation

The Game Master's word must exist in a recognized dictionary before the turn can begin. The validation step is fast (sub-second) and happens as the Game Master types — a subtle indicator confirms the word is known before they submit it. Words that fail validation are flagged immediately so the Game Master can try another without wasting their 30-second window.

This means:
- No invented words, typos, or proper nouns that fall outside the dictionary.
- Any language is valid as the source word, as long as the system can confirm it exists and produce a translation into the room's target language.
- If the Game Master's time expires before a valid word is submitted, the system picks one automatically and the turn proceeds normally.

---

## Scoring

| Action | Points |
|---|---|
| Correct answer, fastest in the room | 3 pts |
| Correct answer, within time limit | 1–2 pts (sliding by speed) |
| Wrong answer | 0 pts |
| Game Master: nobody guesses correctly | +1 pt (you stumped the room) |

Speed is measured from the moment the options appear on screen. The first correct answer earns the most; later correct answers earn progressively less. A wrong answer locks you out for the rest of that turn.

The Game Master does not guess — they score only if they stump everyone.

---

## Avatars

Before joining the game, each player creates a simple avatar in the style of skribbl.io: a face assembled from a fixed set of expressive components (eyes, mouth, hair, accessories, skin tone). No drawing skill required. Avatars appear next to player names throughout the game and on the final podium.

Avatar and nickname are stored in the browser session and restored automatically on reconnect — no account, no login. If you close and reopen the same tab, you are back in the room with the same face and name.

---

## In-Game Chat

A chat panel is always visible during the game. Players can send short text messages at any time, including while guessing. The chat is ephemeral: it exists only for the session and is not logged.

Intended uses: reactions to a reveal, light trash talk, coordinating a rematch. The chat does not interfere with gameplay — it sits in a sidebar and never covers the answer cards.

---

## Public Rooms and Matchmaking

The game supports two room modes:

- **Private room:** created with a code that the host shares manually. Only people with the code can join. This is the default mode and identical to the original inglisc behavior.
- **Public room:** listed in the **Open Rooms** browser on the home screen. Anyone can join from there, up to the player limit. The host sets the target language, round count, and time limit when creating the room, so joiners know what they are walking into before they enter.

The Open Rooms browser shows each room's target language, current player count, and whether the game has started. Rooms that are already in progress are shown but marked as full or in-game, so they can be spectated if that feature is enabled in the future.

There is no skill-based matchmaking. Open Rooms is a simple public list — fast, transparent, low-friction.

---

## Artistic Direction

### Tone

Orchestra sits at the intersection of a pub quiz and a jazz improvisation. It is playful without being childish, competitive without being punishing. The language is light, the feedback is immediate, and losing feels funny rather than frustrating.

### Visual Style

- **Color palette:** Deep indigo and warm amber as primary colors, with accent tones per language zone (e.g. a rust red for Spanish, a slate blue for German). The palette shifts subtly depending on the room's target language, giving each session a distinct feel.
- **Typography:** A single rounded sans-serif family for all UI text. Large, legible option buttons. Score deltas (+3, +1) animate briefly in a playful bounce when awarded.
- **Layout:** Centered stage metaphor. The word prompt sits at the top like a conductor's cue. The five answer cards fan out below it. The timer is a simple arc that drains around the prompt, never intrusive. The chat panel sits to one side without competing for attention during active guessing.
- **Motion:** Transitions are snappy, not cinematic. Correct answers pulse once with the accent color. Wrong answers shake once, then fade. The word-validation indicator during the Game Master's 30-second window uses a subtle green/red glow — visible but not alarming.
- **Avatar rendering:** Flat vector illustration style. A limited palette per component keeps combinations coherent even at small sizes (the avatar appears in a 48 × 48 chip next to the player name during gameplay and larger on the podium).

### Sound (optional, off by default)

Short synthesized tones signal key moments: a soft chime when options appear, a higher tone for a correct answer, a low thud for wrong. The Game Master hears a brief fanfare when they stump the room. All sounds are toggled globally and default to off.

---

## Room Lifecycle

- Public rooms appear in the Open Rooms browser until the game starts or the room is full.
- Private rooms are accessible only via the 6-character code.
- No account required. Players identify by nickname + avatar, stored in browser session.
- If a player disconnects mid-game, their slot is held briefly; on reconnect they rejoin with the same nickname, avatar, and score.
- If the Game Master disconnects during their word-selection window, the system auto-generates a word and the turn proceeds.
- After the final podium, the room can be restarted for a rematch with the same players.
- Inactive rooms expire after 24 hours.

---

## Technical Overview

- **Backend:** Node.js server managing room state, turn logic, scoring, word validation, translation, and fake generation. WebSocket connections for real-time state sync (turn start, answer reveals, chat messages, player join/leave events).
- **Frontend:** Web-first (React). Responsive layout targets desktop and large-screen tablet; mobile is functional but secondary.
- **Word validation:** Dictionary lookup on submit. The backend checks the submitted word against a multilingual dictionary before accepting it and before generating translations.
- **Translation + fake generation:** External translation API for the real answer; fake options generated server-side using dictionary sampling and morphological patterns of the target language so fakes look plausible.
- **Real-time sync:** WebSocket for all live state (turn phases, answer reveal, chat, player presence). The server timestamps the option reveal and computes all speed-adjusted scores server-side to prevent client manipulation.
- **Session storage:** Nickname and avatar are persisted in browser sessionStorage and sent on reconnect to restore the player to their slot without re-entering details.

No persistent user accounts. No server-side message history. No native mobile app.

---

## Out of Scope

- Persistent user profiles or cross-session history
- Custom word lists or decks
- Mobile native app
- Skill-based matchmaking

---

## Name

**Orchestra** because every player is an instrument, the Game Master is the conductor, and a good session feels like something everyone played together — even when only one person wins.

---

*Inspired by [inglisc](https://github.com/fernet-ai/inglisc) — un piccolo gioco stupido per imparare l'inglese, o forse no.*
