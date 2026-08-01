# 🧪 Elemonsters

A Pokémon-style pixel game for learning the periodic table. Students explore a
lab town as a dog trainer, walk up to element "monsters," and answer
multiple-choice chemistry questions about atomic structure (protons, electrons,
ions, valence, isotopes, and more).

Built on [Phaser 3](https://phaser.io/) with grid-based movement via
[grid-engine](https://github.com/Annoraaq/grid-engine), and an optional
[Firebase Realtime Database](https://firebase.google.com/) backend for the
question bank and (soon) per-student progress.

## Play

- **Arrow keys** — move the dog around the lab.
- **E** — talk to an Elemonster you're facing to start its quiz.
- **1–4 / click** — answer. Correct answers mark the monster as *Seen*.
- **Enter / Esc** — close the quiz.
- Reach the **EXIT ▶** door to leave the room.

The 7 starter Elemonsters (Q1 "starter" set): Hydrogen, Helium, Carbon,
Nitrogen, Oxygen, Sodium, Chlorine.

## Run it locally

```bash
npm install
npm run watch      # dev server + live reload at http://localhost:10001
npm run build      # production build into dist/
```

## How it's organized

| Path | What |
|---|---|
| `src/Scenes/` | Phaser scenes (town = `TestScene`, house = `HouseScene`) + engine components |
| `src/data/elements.ts` | The 7 starter elements (symbol, name, atomic number, sprite tint) |
| `src/data/questions.ts` | Local seed of 21 MCQs (used offline / as fallback) |
| `src/data/questionSource.ts` | Chooses local seed vs. live Firebase question bank |
| `src/data/progress.ts` | Seen/Caught tracking (localStorage today) |
| `src/ui/QuizOverlay.ts` | The multiple-choice quiz modal |
| `firebase/` | Security rules, seed data, and setup checklist |

Questions follow a simple shape so content can be authored in a spreadsheet and
imported:

```json
{
  "elementId": "carbon",
  "angle": "protons",
  "prompt": "How many protons does carbon have?",
  "choices": ["4", "6", "8", "12"],
  "correctIndex": 1,
  "quarterTheme": "starter"
}
```

## Firebase (optional)

The game runs fully offline with the local seed. To use the shared question
bank + anonymous student sign-in, follow **[`firebase/NEXT-STEPS.md`](firebase/NEXT-STEPS.md)**.
Security rules live in `firebase/database.rules.json` (Realtime Database) and
`firebase/firestore.rules` (if you prefer Firestore).

> **Note:** The Firebase *web* config in `src/data/firebase.ts` (apiKey, etc.) is
> safe to commit — Firebase web keys identify the project, they don't grant
> access. All data access is controlled by the security rules.

## Roadmap

- [ ] Sync each student's Seen/Caught progress to `students/{uid}`
- [ ] Drive daily focus from the 40-day schedule (`dailySchedule`)
- [ ] End-of-quarter **Gym** mastery challenge (HP bar)
- [ ] Replace placeholder tinted sprites with real Elemonsters art

## Credits & license

Game engine scaffold adapted from
[danielart/phaser-rpg-template](https://github.com/danielart/phaser-rpg-template)
(MIT). This project is released under the MIT License — see [`LICENSE`](LICENSE).
