# TROPHIC — Grade 9 Ecology Mastery Lab

A personalized ecology study platform built from the six uploaded slide decks and the marked practice-test solutions packet.

## Run locally

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
python3 -m http.server 4173 --directory dist
```

The app uses a hash router, so the production build can be served from any static file server without rewrite rules.

## What is included

- **Dashboard** with a transparent test-readiness formula, mastery radar, streaks, XP and a personalized next move.
- **Learning Hub** with seven lessons, slide-sourced diagrams, "Explain It Simpler", "Challenge Me", retrieval checks, end quizzes and teach-back exercises.
- **16 playable arcade games** with their own mechanics, scoring, sound, full-screen rendered arenas and mastery evidence:
  Showdown, Tower, Boss Battles, Speed Run, Memory Match, Jeopardy, Escape Room, Science Detective, Flashcard Frenzy, Fill the Gaps, Drag-and-Drop Lab, Survival, True/False Blitz, Science Wordle, the Final Exam Gauntlet, and Fuel Kart 3D with online room-code racing, local split-screen and AI.
- **Adaptive practice** across multiple-choice, multi-select, true/false, fill-in, short answer, scenario, error analysis, cause/effect, compare/contrast, matching, sorting, diagram labeling, ordering and teach-back.
- **Exam simulator** with teacher-style, quick, full-length and challenge papers; flagging, timers, auto-save, written answers, detailed marking and a revision plan.
- **Lock-In Mode** with a Pomodoro-style block plan, weakest-concept prioritization, active recall, adaptive review, breaks and a final assessment.
- **Test Autopsy** that distinguishes verified practice-test deductions from uncertain/illegible details.
- **Local-first progress**: mastery, spaced repetition, XP, achievements, study history, exams and settings persist in `localStorage`; JSON export/import is available in Settings.
- **Cloud accounts and global leaderboards**: optional username/password game accounts (no email) store a cloud save snapshot and publish karting, exam, mastery and XP scores to Firebase Firestore. Passwords are never stored; account IDs are SHA-256 credential hashes.

## Learning model

Mastery is deliberately capped by evidence breadth and rigor:

- one easy question → max 45% mastery
- only one question format → max 75%
- no hard evidence → max 65%
- 100% requires at least six distinct questions and multiple formats

Readiness = 50% demonstrated mastery + 15% coverage + 15% rigor + 20% recent accuracy − unresolved weakness penalty. The breakdown is shown in the dashboard and Progress page.

## Content sources

- `Introducing Ecology`
- `Food Chains and Food Webs`
- `Energy in Ecosystems`
- `Water and Carbon Cycles`
- `Nitrogen Cycle`
- `2026 Biology Practice Test Solutions`

Lesson diagrams are cropped directly from the uploaded slide decks. Interactive lab diagrams are purpose-built for labeling/sorting/ordering practice. The practice-test audit does not invent a score or teacher comment where the uploaded PDF does not show one.

## Permanent site

The live site is **https://daproatgames.github.io/trophic-ecology/** — hosted on GitHub Pages, so it stays online when this computer is off.

For local testing, serve the production build:

```bash
npm run build
python3 -m http.server 4173 --directory dist
```

Online kart rooms use PeerJS WebRTC with public STUN/TURN relays, so two devices can create/join a 5-character room code without a custom game server. The host owns the race simulation and sends the start handshake, questions and state; the guest sends driving inputs and answers. Room codes are private to the session; there is no matchmaking queue. Because this is peer-to-peer, unusual restrictive networks can still block a connection.

Cloud profiles and leaderboards use Firebase project `trophic-ecology-2026` (Firestore database `default`). The client config and security rules live in `src/lib/cloud.ts` and `firestore.rules`.