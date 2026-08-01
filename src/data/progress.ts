// Student progress: which Elemonsters are Seen vs Caught (spec §4.2).
// Persists to localStorage now. When Firebase is enabled, these functions become
// the single place that reads/writes a `students/{uid}` document — game code that
// calls markSeen/isCaught/etc. does not change.

export type MonsterStatus = 'unseen' | 'seen' | 'caught';

const STORAGE_KEY = 'elemonsters.progress.v1';

interface ProgressState {
    seen: Record<string, boolean>;
    caught: Record<string, boolean>;
}

function load(): ProgressState {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw) as ProgressState;
    } catch { /* ignore corrupt/unavailable storage */ }
    return { seen: {}, caught: {} };
}

function save(state: ProgressState): void {
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch { /* storage unavailable — progress stays in-memory this session */ }
}

let state: ProgressState = load();

export function markSeen(elementId: string): void {
    if (!state.seen[elementId]) {
        state.seen[elementId] = true;
        save(state);
    }
}

export function markCaught(elementId: string): void {
    state.seen[elementId] = true;
    state.caught[elementId] = true;
    save(state);
}

export function statusOf(elementId: string): MonsterStatus {
    if (state.caught[elementId]) return 'caught';
    if (state.seen[elementId]) return 'seen';
    return 'unseen';
}

export function isSeen(elementId: string): boolean { return statusOf(elementId) !== 'unseen'; }
export function isCaught(elementId: string): boolean { return statusOf(elementId) === 'caught'; }

export function counts(): { seen: number; caught: number } {
    return {
        seen: Object.keys(state.seen).length,
        caught: Object.keys(state.caught).length,
    };
}
