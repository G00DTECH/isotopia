// Teacher authentication for the admin portal (src/teacher.ts). Uses Google
// Sign-In restricted to the school domain; the "teacher" custom claim (set once
// via firebase/set-teacher.mjs) is what actually authorizes writes — the RTDB
// rules check auth.token.teacher, so a signed-in non-teacher can't change data.
// The game itself does NOT use this; students play as guests (anonymous auth).

import {
    getAuth, GoogleAuthProvider, signInWithPopup, signOut,
    onAuthStateChanged, User,
} from 'firebase/auth';
import { getFirebaseApp } from './firebase';

export const ALLOWED_DOMAIN = 'sad15.org';

export interface TeacherSession {
    user: User;
    isTeacher: boolean;
}

/** Subscribe to auth changes. Emits null when signed out or Firebase is off. */
export function onTeacherAuth(cb: (session: TeacherSession | null) => void): void {
    const app = getFirebaseApp();
    if (!app) { cb(null); return; }
    onAuthStateChanged(getAuth(app), async (user) => {
        if (!user) { cb(null); return; }
        // Fresh token so a just-granted teacher claim is picked up.
        const token = await user.getIdTokenResult(true);
        cb({ user, isTeacher: token.claims.teacher === true });
    });
}

export async function signInTeacher(): Promise<void> {
    const app = getFirebaseApp();
    if (!app) throw new Error('Firebase is not configured.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: ALLOWED_DOMAIN });   // hint the school domain
    await signInWithPopup(getAuth(app), provider);
}

export async function signOutTeacher(): Promise<void> {
    const app = getFirebaseApp();
    if (app) await signOut(getAuth(app));
}
