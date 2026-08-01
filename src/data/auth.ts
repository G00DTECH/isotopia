// Anonymous student sign-in. Realtime Database rules require `auth != null`, so
// we sign the student in before reading questions. Anonymous auth gives each
// device a stable uid (used later to key their students/{uid} progress).

import { getAuth, signInAnonymously } from 'firebase/auth';
import { getFirebaseApp } from './firebase';

let uid: string | undefined;

/** Signs in anonymously if Firebase is configured. Returns the uid, or undefined. */
export async function ensureSignedIn(): Promise<string | undefined> {
    const app = getFirebaseApp();
    if (!app) return undefined;
    if (uid) return uid;
    const cred = await signInAnonymously(getAuth(app));
    uid = cred.user.uid;
    return uid;
}

export function currentUid(): string | undefined {
    return uid;
}
