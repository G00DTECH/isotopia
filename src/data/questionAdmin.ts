// CRUD for the shared question bank at questions/{id} in Realtime Database, used
// by the teacher portal. The game reads the same bank via questionSource.ts
// (which already loads questions/ and falls back to the local seed offline).

import { getFirebaseApp } from './firebase';
import { getDatabase, ref, get, set, remove, push } from 'firebase/database';
import { Question, QUESTIONS } from './questions';

export interface StoredQuestion extends Question {
    id: string;                 // the RTDB key (empty string for a brand-new one)
}

function db() {
    const app = getFirebaseApp();
    return app ? getDatabase(app) : undefined;
}

export async function loadAllQuestions(): Promise<StoredQuestion[]> {
    const d = db();
    if (!d) return [];
    const snap = await get(ref(d, 'questions'));
    if (!snap.exists()) return [];
    const val = snap.val() as Record<string, Question>;
    return Object.entries(val).map(([id, q]) => ({ id, ...q }));
}

/** Create (empty id) or update a question. Returns its id. */
export async function saveQuestion(q: StoredQuestion): Promise<string> {
    const d = db();
    if (!d) throw new Error('Firebase is not configured.');
    const id = q.id || (push(ref(d, 'questions')).key as string);
    const { id: _drop, ...data } = q;            // key lives in the path, not the value
    await set(ref(d, `questions/${id}`), data);
    return id;
}

export async function deleteQuestion(id: string): Promise<void> {
    const d = db();
    if (!d) throw new Error('Firebase is not configured.');
    await remove(ref(d, `questions/${id}`));
}

/** One-time bootstrap: push the local seed bank into RTDB, but only if the
 *  bank is currently empty (never clobbers existing questions). */
export async function importStarterQuestions(): Promise<number> {
    const d = db();
    if (!d) throw new Error('Firebase is not configured.');
    const existing = await get(ref(d, 'questions'));
    if (existing.exists()) return 0;
    const map: Record<string, Question> = {};
    QUESTIONS.forEach((q, i) => { map[`seed_${i}`] = q; });
    await set(ref(d, 'questions'), map);
    return QUESTIONS.length;
}
