// Per-class settings + the 40-day release schedule, stored at
// classes/{CLASS_ID}/settings in Realtime Database. There is a single class for
// now (one AP Chem section); CLASS_ID is hard-coded until it grows.
//
// The teacher portal writes these; the game reads them (later phase) to decide
// which Elementals are "released" and how many correct answers catch one.

import { getFirebaseApp } from './firebase';
import { getDatabase, ref, get, set } from 'firebase/database';

export const CLASS_ID = 'ap-chem';
export const UNIT_LENGTH_DAYS = 40;

export interface ClassSettings {
    questionsToCatch: number;              // correct answers needed to catch (1..5)
    unitStartDate: string;                 // 'YYYY-MM-DD', day 1 of the unit ('' = unset)
    releaseAllNow: boolean;                // testing override: everything unlocked
    release: Record<string, number>;       // elementId -> unlock day (1..UNIT_LENGTH_DAYS)
}

export const DEFAULT_SETTINGS: ClassSettings = {
    questionsToCatch: 1,
    unitStartDate: '',
    releaseAllNow: true,
    release: {},
};

function db() {
    const app = getFirebaseApp();
    return app ? getDatabase(app) : undefined;
}

export async function loadSettings(): Promise<ClassSettings> {
    const d = db();
    if (!d) return { ...DEFAULT_SETTINGS };
    const snap = await get(ref(d, `classes/${CLASS_ID}/settings`));
    return { ...DEFAULT_SETTINGS, ...(snap.exists() ? snap.val() : {}) };
}

export async function saveSettings(s: ClassSettings): Promise<void> {
    const d = db();
    if (!d) throw new Error('Firebase is not configured.');
    await set(ref(d, `classes/${CLASS_ID}/settings`), s);
}

/** Which day of the 40-day unit "today" is (1..UNIT_LENGTH_DAYS), or the last
 *  day if no start date is set. */
export function currentUnitDay(s: ClassSettings, today: Date = new Date()): number {
    if (!s.unitStartDate) return UNIT_LENGTH_DAYS;
    const start = new Date(s.unitStartDate + 'T00:00:00');
    const day = Math.floor((today.getTime() - start.getTime()) / 86_400_000) + 1;
    return Math.max(1, Math.min(UNIT_LENGTH_DAYS, day));
}

/** Whether an element is released to students right now. Unscheduled elements
 *  default to available; the releaseAllNow override unlocks everything. */
export function isElementReleased(
    s: ClassSettings, elementId: string, today: Date = new Date(),
): boolean {
    if (s.releaseAllNow) return true;
    const day = s.release[elementId];
    if (day == null) return true;
    return day <= currentUnitDay(s, today);
}

// --- Cached copy for the game. Loaded once at startup (game.ts) so scenes and
// the Isotopedex can check release state synchronously. Defaults (everything
// released) until loaded / if Firebase is unreachable, so the game never hides
// content by accident.
let cache: ClassSettings = { ...DEFAULT_SETTINGS };

export async function loadAndCacheSettings(): Promise<ClassSettings> {
    try { cache = await loadSettings(); }
    catch { cache = { ...DEFAULT_SETTINGS }; }
    return cache;
}

export function cachedSettings(): ClassSettings { return cache; }

/** Release check against the cached settings — for game code. */
export function elementReleased(elementId: string): boolean {
    return isElementReleased(cache, elementId);
}
