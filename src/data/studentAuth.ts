// Optional student sign-in. Guests play anonymously; a student can sign in with
// their @sad15.org Google account to save their collection to the cloud and show
// up on the teacher dashboard. When a real (non-anonymous) user is present we
// attach the progress store to their students/{uid} record; anonymous guests
// stay local-only.

import {
    getAuth, GoogleAuthProvider, signInWithRedirect, signOut, onAuthStateChanged, User,
} from 'firebase/auth';
import { getFirebaseApp } from './firebase';
import { attachStudent, detachStudent } from './progress';

export const STUDENT_DOMAIN = 'sad15.org';

let current: User | null = null;                     // null = guest/anonymous
const listeners: ((u: User | null) => void)[] = [];

/** Start listening for student sign-in state. Call once at startup. */
export function initStudentAuth(): void {
    const app = getFirebaseApp();
    if (!app) return;
    onAuthStateChanged(getAuth(app), (user) => {
        const student = (user && !user.isAnonymous) ? user : null;
        current = student;
        if (student) {
            void attachStudent(student.uid, student.displayName || student.email || 'Student', student.email || '');
        } else {
            detachStudent();
        }
        listeners.forEach(fn => fn(current));
    });
}

/** Subscribe to student sign-in changes; fires immediately with current state. */
export function onStudentAuth(fn: (u: User | null) => void): void {
    listeners.push(fn);
    fn(current);
}

export function currentStudent(): User | null {
    return current;
}

export async function signInStudent(): Promise<void> {
    const app = getFirebaseApp();
    if (!app) throw new Error('Firebase is not configured.');
    const provider = new GoogleAuthProvider();
    provider.setCustomParameters({ hd: STUDENT_DOMAIN });   // hint the school domain
    // Redirect (not popup): iPad Safari commonly blocks auth popups. This
    // navigates to Google and back; onAuthStateChanged above then attaches
    // progress once the student returns signed in.
    await signInWithRedirect(getAuth(app), provider);
}

export async function signOutStudent(): Promise<void> {
    const app = getFirebaseApp();
    if (app) await signOut(getAuth(app));
}
