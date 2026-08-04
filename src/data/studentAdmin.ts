// Teacher dashboard data: read every signed-in student's progress for the class.
// Uses classes/{CLASS_ID}/members to enumerate students, then reads each
// students/{uid} record (the teacher claim allows reading all of them).

import { getFirebaseApp } from './firebase';
import { getDatabase, ref, get } from 'firebase/database';
import { CLASS_ID } from './classConfig';

export interface StudentRow {
    uid: string;
    name: string;
    email: string;
    caught: number;
    seen: number;
    stats: Record<string, { attempts: number; correct: number }>;
}

function db() {
    const app = getFirebaseApp();
    return app ? getDatabase(app) : undefined;
}

export async function loadClassStudents(): Promise<StudentRow[]> {
    const d = db();
    if (!d) return [];
    const mem = await get(ref(d, `classes/${CLASS_ID}/members`));
    if (!mem.exists()) return [];
    const uids = Object.keys(mem.val());
    const rows = await Promise.all(uids.map(async (uid): Promise<StudentRow> => {
        const snap = await get(ref(d, `students/${uid}`));
        const v = snap.exists() ? snap.val() : {};
        return {
            uid,
            name: v.name || '(unknown)',
            email: v.email || '',
            caught: v.caught ? Object.keys(v.caught).length : 0,
            seen: v.seen ? Object.keys(v.seen).length : 0,
            stats: v.stats || {},
        };
    }));
    return rows.sort((a, b) => a.name.localeCompare(b.name));
}
