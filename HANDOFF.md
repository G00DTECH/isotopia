# Isotopia — Session Handoff

A running summary of what was built and where things stand, so work can resume
after clearing/compacting the conversation.

## Latest session (2026-08) — art + movement + woods
Most recent changes, newest first (all pushed to `main`, auto-deployed):
- **Next up: the Pokédex** (see Roadmap #1) — this session ended right before
  starting it. `src/data/progress.ts` (Seen/Caught) + `src/data/elements.ts` +
  `src/data/elementalArt.ts` already hold everything a Pokédex screen needs.
- **North Woods & Meadow** — a new explorable outdoor scene (`WoodsScene`,
  `tools/gen_woods.py` → `woods_map.json`) reached by a **cobblestone trail north**
  out of town (up the gap between Hardware and Grocery). Tree-lined, with a
  wildflower meadow, walkable tall-grass patches, bushes and tufts — all from
  `modern_exterior` tiles. **Empty of NPCs on purpose** (explore only, for now).
- **All floating tags removed** — no more element-symbol labels over Elementals,
  no Neonu tag, no ENTER/EXIT door labels (they broke immersion). The building
  art's painted signs/doors are the cues. `addFloatingLabel` deleted.
- **Real building art** replaces the old tiled facades: Hardware, Grocery
  (Hannaford), Library, Home, Auto — each a PNG in `src/assets/buildings/`,
  background-removed and **cropped tight**, overlaid on the town. Footprints are
  now **invisible collision** (transparent `blank16` tile) so nothing peeks out;
  each building is sized by an explicit `widthTiles` (kept in sync between
  `gen_town.py` `WIDTH_TILES` and `TestScene` `BUILDINGS`) and centred on its
  door. Non-hardware shops sized up so they don't look small. Sign plaques
  (`drawSign`/`TOWN_SIGNS`) removed.
- **Neonu Reeves**, a disco-bug flavor NPC, wanders the town plaza (no quiz —
  `GameScene.spawnWanderingNpc`).
- **Low-res pixel Elemental art** swapped in for all 8 (incl. Sodium), background
  removed via the new reusable **`tools/remove_bg.py`** (edge flood-fill + halo
  erode + small-fleck cleanup; auto-detects the bg colour from the corners, works
  for the orange Elemental bg and the grey building bg).
- **Click / tap to move** (grid-engine `moveTo` pathfinding, alongside arrows) —
  `clickToMove` in `Characters.ts`.
- **Step-on door entry** — you no longer press a key at a door; walk onto the
  **square just outside it** and it triggers (works for click-to-move). See the
  entry-pad logic in `components/Door.ts`.

## What this is
**Isotopia** — a Pokémon-style pixel game for learning the periodic table.
Students explore a lab town as a **dog trainer**, walk up to friendly element
creatures called **Elementals**, and answer multiple-choice atomic-structure
questions. End goal (later): an end-of-quarter "Gym" mastery challenge.

> Naming note: started as "Elemonsters"; renamed to **Isotopia** and creatures to
> **Elementals** ("monsters sounded scary"). Individual placeholder names still
> end in -mon (Hydromon, Oxymon…) and get replaced with real art/names later.

## Coordinates
| Thing | Value |
|---|---|
| Local path | `/home/nah/elemonsters` |
| GitHub (public) | https://github.com/G00DTECH/isotopia (branch `main`) |
| Firebase project | `isotopia-2809c` (Realtime Database) |
| RTDB URL | `https://isotopia-2809c-default-rtdb.firebaseio.com` |
| Deploy | Netlify (auto-deploy on push; `netlify.toml`: build `npm run build`, publish `dist`) |
| Foundation | Fork of [danielart/phaser-rpg-template](https://github.com/danielart/phaser-rpg-template) (MIT), Phaser 3 + grid-engine |

## Run locally
```bash
cd /home/nah/elemonsters
npm install
npm run watch    # dev server + live reload -> http://localhost:10001
npm run build    # production build -> dist/
```
Controls: **arrow keys _or_ click/tap** to move, **E** talks to a faced
Elemental, **1–4/click** answers, **Enter/Esc** closes the quiz. To enter/leave
a building, **step onto the square just outside its door** (no key press). Follow
the **trail north** (between Hardware and Grocery) to reach the woods.

## What's working
- **Outdoor town** (40×24, ~2.1× the old 28×16) themed on **Gray, Maine
  (04039)**, built from the `modern_exterior` tileset: grass, cobblestone paths,
  trees, a **lake**, and **five enterable storefronts** (**HARDWARE / HANNAFORD /
  LIBRARY / HOME / AUTO**) now shown as **real building art** overlaid on the map.
  Footprints are **invisible collision** (transparent `blank16` tile) so nothing
  peeks out; sizing/position come from `WIDTH_TILES` in `tools/gen_town.py`
  (re-run to regenerate `test_map.json`; it prints the door tiles) mirrored by
  `BUILDINGS` in `TestScene`. Each door column stays walkable so you can enter,
  and a **trail north** leads to the woods.
- **The lake**: a rectangle of blocking water cells (see `LAKE` in both
  `gen_town.py` and `TestScene.ts`). The tileset has no water art, so `TestScene`
  paints a blue rounded rect + "LAKE" label over the (already-blocking) cells.
- **Five unique interiors, each with an exit**, built from Luna Town art
  (`src/assets/rooms/{home,treats,library,cafe}-interior.png`): Town ⇆ Home,
  Hardware, Hannaford, Library, Auto. Each is an `InteriorScene` subclass — the
  room is a full background image; a shared invisible collision grid
  (`interior_room.json`, from `tools/gen_interior.py`, walkable cols 3–11 /
  rows 10–13) keeps the dog on the visible floor. Every room has an EXIT ▶ door.
  Hardware/Hannaford/Auto reuse treats/cafe art as **placeholders** (real art
  swaps in later).
- **11 Elementals placed by venue**, each with a working quiz: **H/O** on the
  **lake shore** + **Ne** in the plaza (outdoors); **Fe/C** in Hardware; **Na/Cl**
  in Hannaford (salt); **Mg/N** in Auto; **U/He** in the Library (Home has none —
  trainer's house). Face + press **E** → quiz. No floating labels anymore.
- **Real character art wired in** (`spawnElemental` in `GameScene`): 8 Elementals
  render their real **low-res pixel** PNGs (`src/assets/elementals/{hydrogen,
  carbon,oxygen,sodium,iron,neon,uranium,magnesium}.png`, background-removed via
  `tools/remove_bg.py`); the 3 without art yet (**He, N, Cl**) stay tinted
  placeholder NPCs. Which elements have art is declared in `elementalArt.ts`.
- **Neonu Reeves** — a disco-bug flavor NPC that wanders the plaza, no quiz
  (`GameScene.spawnWanderingNpc`, art `src/assets/elementals/neonu-reeves.png`).
- **First-fight reaction**: the real dog photo (`pixel-dog.png`) pops up once,
  the first time any quiz opens in a session (`QuizOverlay.showDogReaction`).
- 21-question seed bank (spec §4); quiz reads via a data layer.
- **Firebase RTDB live**: rules published, 21 questions imported, anonymous auth
  on. Game signs in anonymously and loads questions from RTDB (falls back to
  local seed if Firebase is unreachable). Console logs which source it used.
- Seen/Caught progress saved to browser `localStorage`.
- On-screen controls HUD; labelled EXIT door.
- Deployed on Netlify (404 fixed via `netlify.toml` publishing `dist/`).

## Key files
| Path | Purpose |
|---|---|
| `src/data/elements.ts` | 11 elements: symbol, name, atomic number, sprite tint |
| `src/data/elementalArt.ts` | Which elements have real art + its texture key/path |
| `src/data/questions.ts` | 33-question local seed (3 × 11 elements; fallback / offline) |
| `src/data/questionSource.ts` | Local seed vs. live RTDB question bank |
| `src/data/firebase.ts` | Firebase config + lazy init (real config is filled in) |
| `src/data/auth.ts` | Anonymous student sign-in |
| `src/data/progress.ts` | Seen/Caught (localStorage today) — **the Pokédex data source** |
| `src/ui/QuizOverlay.ts` | The MCQ modal (pattern to copy for a Pokédex overlay) |
| `src/Scenes/TestScene.ts` | Town: 5 building-art overlays + doors + north-woods door + lake + Neonu + H/O/Ne outdoor Elementals |
| `src/Scenes/WoodsScene.ts` | North Woods & Meadow (empty explorable scene; door back to town) |
| `src/Scenes/components/Door.ts` | Scene-switch door + **step-on entry pad** logic |
| `src/Scenes/components/Characters.ts` | Movement: keyboard `basicMovement` + `clickToMove` (grid-engine `moveTo`) |
| `src/assets/buildings/*.png` | Real storefront art (bg-removed, cropped): hardware/grocery/library/home/auto |
| `tools/remove_bg.py` | Background remover (edge flood-fill; used for Elementals + buildings) |
| `tools/gen_woods.py` | Regenerates the woods tilemap (`woods_map.json`) |
| `src/Scenes/InteriorScene.ts` | Base for image-background rooms: bg image + collision grid + Elementals + EXIT |
| `src/Scenes/HomeScene.ts` / `HardwareScene.ts` / `HannafordScene.ts` / `AutoScene.ts` / `LibraryScene.ts` | Home (—), Hardware (C), Hannaford (Na, Cl), Auto (N), Library (He) |
| `src/assets/rooms/*.png` | Interior backgrounds (home / treats / library / cafe) |
| `sprites/` + `sprites/transparent/` | Real Elemental art (Carbbit, Ferrox, Oxyroo, Uranibbit, hydrill, neono, sodoodle); `transparent/` = background-removed versions |
| `tools/gen_town.py` | Regenerates the town tilemap from the modern_exterior sheet |
| `tools/gen_interior.py` | Regenerates the shared interior collision grid (`interior_room.json`) |
| `src/game.ts` | Phaser bootstrap + startup (sign in, load bank) |
| `firebase/` | Rules (`database.rules.json`, `firestore.rules`), seed JSON, `NEXT-STEPS.md` |
| `netlify.toml` | Build/publish config |

## Decisions made
- **Realtime Database** (not Firestore) — it's NoSQL and its rules + data import
  as literal JSON. (Firestore rules/scaffold still included if we ever switch.)
- Keep the **dog** as the main character.
- Placeholder tinted sprites now; real Elemental art later.
- Data model: `questions/{id}`, `dailySchedule/{classId}`, `students/{uid}`.

## Gotchas / things to remember
- **Rotate the GitHub token** — a fine-grained PAT was pasted in chat (exposed).
  It could push but not create repos. Never written to any file/commit.
- **Firebase Authorized domains**: for anonymous auth to work on the live
  Netlify URL (not just localhost), add the Netlify domain under
  Firebase → Authentication → Settings → Authorized domains.
- **Netlify dashboard can override `netlify.toml`** if the site predates the
  file — set Build `npm run build` / Publish `dist` in the UI if a deploy 404s.
- Firebase **web** config in `src/data/firebase.ts` is committed on purpose —
  safe to be public; security is enforced by RTDB rules.
- Fixed on import: a Linux case-sensitivity bug (`Tilemap` → `TileMap`).
- **Buildings are overlay images over invisible collision** (no more tiled
  facades / sign plaques). `gen_town.py` stamps the transparent `blank16` solid
  tile on each footprint (sized to the art, centred on the door, bottom-anchored);
  `TestScene.drawBuilding` overlays the cropped PNG at `depth 1`. Character
  sprites are set to `depth 10` (in `createCharacterSprite`) so the dog walks in
  front. To resize/move a building, change **both** `WIDTH_TILES` in `gen_town.py`
  **and** `BUILDINGS.widthTiles`/`doorX` in `TestScene` (they must match), re-run
  gen_town, and update `TOWN_DOORS` from its printed door tiles. Building art has
  ~30% transparent margin, so it's **cropped to content** first (`getbbox`) — do
  the same for any new building art.
- **Interiors are background images, not tilesets.** The isometric room art is
  scaled to a 16×16 collision grid; the dog roams the inscribed floor rectangle
  (`gen_interior.py`). All five rooms share one grid — only the bg image differs.
  The old `HouseScene`/`house.json` (and the `Room_Builder`/`Grocery` tilesets)
  are no longer used by any scene.
- Town tiles are copied by GID arithmetic (`gid = row*141 + col + 1`, sheet is
  141 tiles wide). `gen_town.py` render-checks against the sheet — if a building
  looks cut off, its width is wrong (the blue market is 7 wide, others 8).
- **grid-engine treats a cell with NO tile on any layer as blocking**
  (`hasBlockingTile` → `hasNoTile`). So every walkable cell needs a tile: the
  interior `floor` layer is filled everywhere with a transparent walkable tile,
  and collision lives on the `walls` layer (`blank16` id0 = walkable, id1 =
  ge_collide). Leaving walkable cells empty freezes the dog at spawn.
- **Elemental art is single-frame**, so `Npc.addCharacter` only passes
  `walkingAnimationMapping` to grid-engine when it's defined — passing one for a
  1-frame image makes grid-engine index frames that don't exist (blank/crash).
  Placeholder NPCs (He/N/Cl) still pass `0` and get tinted. Art sprites are big
  (~1000px), scaled by `ELEMENTAL_ART_SCALE` (0.05) in `GameScene.spawnElemental`
  — bump that constant if they read too big/small on the grid.
- **New quiz elements load from the LOCAL seed even when Firebase is live**:
  RTDB has only the original 21 questions, so Mg/Fe/Ne/U aren't there —
  `getQuestion` finds an empty RTDB pool and falls back to
  `randomQuestionForElement` (local `questions.ts`). To put them in RTDB too,
  add them to `firebase/*seed*.json` and re-import.

## Roadmap (next, rough priority)
1. **Pokédex** (next up) — a screen listing all Elementals with art, symbol,
   name, atomic number, and **Seen/Caught** status (silhouette/locked until seen).
   - Data is ready: `progress.ts` exposes `statusOf(id)` → `'unseen'|'seen'|
     'caught'`, plus `markSeen`/`markCaught`/`counts()`; `elements.ts` lists all 11
     (symbol/name/atomicNumber/tint); `elementalArt.ts` gives each one's art key/path.
   - Suggested build: `src/ui/PokedexOverlay.ts` modeled on `QuizOverlay.ts`,
     opened with a key (e.g. **P**) wired in `GameScene.update`. Render unseen as a
     dark silhouette, seen as art, caught with a ✓; show `counts()` as “N/11”.
   - **Gap to close first:** `markSeen` is called (in `QuizOverlay`, when a quiz
     opens) but **`markCaught` is never called** — nothing marks anything caught
     yet. Decide the rule (e.g. first *correct* answer) and call `markCaught` in
     `QuizOverlay` where the answer is graded.
2. Populate the **North Woods** with wild Elementals (currently empty).
3. Sync each student's Seen/Caught to `students/{uid}` in RTDB (currently only
   local per-browser) — ties into the Pokédex.
4. Drive daily focus from the 40-day schedule (`dailySchedule`) — spec §5.
5. End-of-quarter **Gym** mastery challenge with the student HP bar — spec §4.2.
6. Finish real art: draw **He, N, Cl** Elementals (still tinted placeholders),
   drop PNGs in `src/assets/elementals/` and add their ids to `elementalArt.ts`.
7. Expand question bank toward ~300 (spec §6); author in a spreadsheet → import.
8. Give the placeholder interiors (Hardware/Hannaford/Auto) their own room art.
