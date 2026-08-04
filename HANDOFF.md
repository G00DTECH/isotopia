# Isotopia — Session Handoff

A running summary of what this is and where it stands, so work can resume after a
context reset. Last updated 2026-08-04.

## What this is
**Isotopia** — a Pokémon-style pixel game for learning the periodic table. You
play a dog exploring a small town, walk up to friendly element creatures called
**Elementals**, and answer multiple-choice atomic-structure questions to catch
them and fill your **Isotopedex**. It's **offline-first**: the whole game runs
from a built-in question seed with no setup, so kids can just play. An optional
Firebase backend adds a shared question bank, a teacher portal, and per-student
progress sync. Real classroom target: an **AP Chemistry** class at **SAD 15
(Gray–New Gloucester, Maine)** — the town map is themed on Gray, Maine.

## Coordinates
| Thing | Value |
|---|---|
| Local path | `/home/nah/Claudia/elemonsters` (folder name predates the rename to Isotopia) |
| GitHub | https://github.com/G00DTECH/isotopia (branch `main`, public) |
| Live game | https://is0topia.netlify.app/ (note the **zero** in "is0topia") |
| Teacher portal | https://is0topia.netlify.app/teacher.html |
| Firebase project | `isotopia-2809c` (Realtime Database) |
| Deploy | Netlify auto-builds from `main` (`npm run build` → publish `dist/`) |
| Foundation | fork of [danielart/phaser-rpg-template](https://github.com/danielart/phaser-rpg-template) (MIT), Phaser 3 + grid-engine |

## Run locally
```bash
cd /home/nah/Claudia/elemonsters
npm install
npm run watch    # dev server + live reload → http://localhost:10001
npm run build    # production build → dist/ (also builds dist/teacher.html)
```
Runs fully offline with no config. To build with Firebase, set the `FIREBASE_*`
env vars (see `.env.example`) before building.

## Controls / gameplay
- **Tap / click** to walk (arrow keys work on desktop too).
- **Walk within one tile of an Elemental** to auto-start its quiz (proximity —
  no key press, because the students use iPads). The dog turns to face it.
- **Tap a choice / 1–4** to answer; **step on a glowing ▲/▼ pad** to enter/leave
  a building; follow the **trail north** into the woods, where wild Elementals
  appear in the **tall grass** (random encounters).
- **DEX button** (top-right) opens the **Isotopedex** collection.
- Encounters open with a **GBA-style battle**: the Elemental slides in on a
  platform, the dog (real overworld sprite, back view) stands opposite, a pixel
  textbox types "A wild X appeared!" then the question. Correct answer catches
  it; if `questionsToCatch` > 1 the enemy has a **draining HP bar** (needs N
  correct). Screen-wipe transition plays before every battle.

## The Elementals (9 active)
Display names are original + copyright-safe (no "-mon" suffix; set in
`src/data/elements.ts`, `monster` field). Element `id`s and art filenames are
unchanged.

| Element | Name | Where |
|---|---|---|
| Hydrogen | Hydrohop | town (lake area) |
| Carbon | Carbocrunch | woods (wild) |
| Nitrogen | Nitronoodle | woods (wild) |
| Oxygen | Oxypuff | woods (wild) |
| Sodium | Sodazoom | Hannaford interior |
| Magnesium | Magflash | Auto interior |
| Iron | Ironclank | Hardware interior |
| Neon | Neonglow | town plaza |
| Uranium | Glowbun | Library interior |

Helium and Chlorine were **retired** (removed from `elements.ts`; their seed
questions remain, harmless). 8 elements have real pixel art in
`src/assets/elementals/<id>.png` (declared in `src/data/elementalArt.ts`);
Nitrogen too. Any without art render as a tinted disc with the symbol.

## Architecture / key files
| Path | Purpose |
|---|---|
| `src/game.ts` | Bootstrap: mounts DEX/intro, inits student auth, loads questions + class settings, then starts Phaser |
| `src/Scenes/TestScene.ts` | Town (buildings as art overlays over invisible collision, lake, doors, north trail) |
| `src/Scenes/WoodsScene.ts` | North Woods; wild Elementals + tall-grass random encounters + Neonu companion |
| `src/Scenes/InteriorScene.ts` + `HomeScene`/`HardwareScene`/`HannafordScene`/`AutoScene`/`LibraryScene` | Building interiors (full-image backgrounds, shared collision grid) |
| `src/Scenes/GameScene.ts` | Base scene: `spawnElemental` (release-gated), `enableGrassEncounters`, camera, grid-engine |
| `src/Scenes/components/` | `Characters` (movement + tap-to-move), `NpcAndObjects` (proximity trigger), `Door`, `DoorCue` |
| `src/ui/QuizOverlay.ts` | GBA battle quiz (round-based, HP bar, `startBattle` wipe) |
| `src/ui/Isotopedex.ts` | Collection screen + student sign-in control + hidden teacher-portal entrance (hold the title) |
| `src/ui/Intro.ts` / `NpcDialog.ts` / `LeaveButton.ts` / `icons.ts` | First-run help, dialog, interior Leave button, inline SVG icons (replaced emojis) |
| `src/data/elements.ts` | Elements + silly display names |
| `src/data/questions.ts` | Local seed question bank (offline fallback) |
| `src/data/questionSource.ts` | Local seed vs. live RTDB question bank |
| `src/data/progress.ts` | Seen/Caught + per-element stats; localStorage cache, mirrors to `students/{uid}` when signed in |
| `src/data/classConfig.ts` | Class settings + 40-day release schedule; `elementReleased()` cache used by the game |
| `src/data/firebase.ts` | Firebase config from `FIREBASE_*` env (blank ⇒ offline) + lazy init |
| `src/data/auth.ts` | Startup sign-in (restore session, else anonymous guest) |
| `src/data/studentAuth.ts` | Optional student Google sign-in (redirect, `@sad15.org` hint) |
| `src/data/adminAuth.ts` | Teacher Google sign-in (popup) + `teacher` claim gate |
| `src/data/questionAdmin.ts` / `studentAdmin.ts` | Teacher portal reads/writes |
| `src/teacher.ts` + `src/teacher.html` + `src/teacher.css` | Teacher admin portal (separate rollup bundle) |
| `firebase/` | `database.rules.json`, seed, `NEXT-STEPS.md`, `ADD-A-TEACHER.md`, `set-teacher.mjs`, `ACCOUNTS-SCOPE.md` |
| `rollup.config.dist.js` / `dev.js` | Two bundles (game + teacher); inject `FIREBASE_*` env |

## Accounts, auth, and the teacher portal
- **Guests** play anonymously (local progress). **Students** can optionally sign
  in with Google (`@sad15.org`, **redirect** flow for iPad Safari) to save
  progress to `students/{uid}` and appear on the dashboard. Sign-in lives in the
  Isotopedex header + intro card.
- **Teachers** use `/teacher.html`: Google sign-in + a `teacher` custom claim
  (the RTDB rules gate writes on `auth.token.teacher`). In-game, **press-and-hold
  the Isotopedex title ~1s** to open the portal (a gold underline fills).
- **Current teachers:** `jharvood@gmail.com`, `aharvey@sad15.org` (Justin's mom,
  the actual teacher). A teacher account does NOT have to be `@sad15.org`.
- **Add/remove a teacher:** `firebase/ADD-A-TEACHER.md`. Sign in once, get the
  UID from Auth → Users, then
  `GOOGLE_APPLICATION_CREDENTIALS=./firebase/serviceAccount.json node firebase/set-teacher.mjs <UID> [off]`.
  The service-account key (`firebase/serviceAccount.json`) is gitignored.
- Portal tabs: **Questions** (CRUD + import starter seed), **Schedule** (40-day
  per-element unlock days), **Settings** (`questionsToCatch`), **Students**
  (read-only: caught/seen/accuracy per signed-in student).

## Data model (RTDB) + release schedule
```
questions/{id}                  { elementId, angle, prompt, choices[4], correctIndex }
classes/ap-chem/settings        { questionsToCatch, unitStartDate, releaseAllNow, release:{elementId:day} }
classes/ap-chem/members/{uid}   true
students/{uid}                  { classId, name, email, seen:{}, caught:{}, stats:{elementId:{attempts,correct}} }
```
Single class hard-coded `CLASS_ID = 'ap-chem'`. **Release logic**
(`isElementReleased`): if `releaseAllNow` → everything visible; otherwise an
element shows only if it has an unlock day that has arrived — **no day = hidden**.
The game reads settings **once at startup** (cached), so changing the schedule in
the portal requires a **game page reload** to take effect.

## Gotchas / things to remember
- **Netlify now needs the `FIREBASE_*` env vars set**, or the live site loses its
  online features (it silently falls back to offline). Values are the Firebase
  web config for `isotopia-2809c` (see `.env.example` for the key names).
- **Reload the game** after changing the schedule/settings (startup-cached).
- **Teacher-claim script needs `firebase-admin@11`** — the latest is ESM-only and
  breaks on Node 18; run it from an isolated dir (e.g. `/tmp/isotopia-admin`).
- **iPad student sign-in (`signInWithRedirect`) is UNVERIFIED on real hardware** —
  the main open risk. Safari ITP/cross-domain auth can be finicky; if it fails,
  consider a custom auth domain. Test on an actual iPad.
- Deploys: Justin pastes a GitHub PAT inline per push (don't persist it).
- Buildings are art overlays over invisible collision; grid-engine treats a cell
  with no tile on any layer as blocking (interiors fill a transparent floor).
- Elemental art is single-frame → `Npc.addCharacter` omits `walkingAnimationMapping`.
- localStorage progress key is still `elemonsters.progress.v1` (kept for
  backward compatibility; don't change the value).

## Open items / where to go next
- **Verify iPad student sign-in on a real device** (top priority before rollout).
- **Seed the real 40-day schedule** (assign each element an unlock day + set the
  unit start date; today it's mostly unscheduled).
- Teacher dashboard: per-element mastery detail (currently overall accuracy only).
- Optional "unlocks soon" teaser for locked elements (chosen behavior is fully
  hidden right now — easy to flip in `spawnElemental` + Isotopedex).
- Deferred portal UX: unsaved-changes warning on tab switch; refresh the
  `questionsToCatch` help text (the HP battle is now live, not "coming soon").
- Expand the question bank; end-of-unit "Gym" mastery challenge.
- Cosmetic: the local folder + `dist` history still say "elemonsters"; the
  GitHub repo and package name are already "isotopia".

## Recent history (newest first)
- Open-source prep: Firebase config moved to build-time `FIREBASE_*` env
  injection (offline by default); README rewrite; comment cleanup.
- Copyright-safe creature rename (Hydrohop, Oxypuff, Glowbun, …).
- Teacher portal UX fixes (tab highlight, save toasts + busy states, error
  handling) from an agent-driven review.
- Phases B/C/D: release gating, HP-bar capture, student sign-in + progress sync,
  teacher dashboard.
- Firebase went live (Google auth, rules published, teacher claims granted).
- GBA-feel pass: battle scene + real dog sprite, wild grass encounters, screen
  wipe, emoji → SVG icons.
