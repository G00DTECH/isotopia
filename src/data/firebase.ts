// Firebase configuration + lazy init.
//
// Elemonsters runs WITHOUT Firebase (local seed + localStorage). The moment you
// paste real values below, the game signs students in anonymously and reads the
// question bank from Realtime Database. Until then, getFirebaseApp() returns
// undefined and everything falls back to local data.
//
// Get these values: Firebase Console -> Project settings (gear) -> "Your apps"
// -> Web app -> "SDK setup and configuration" -> Config.

import { initializeApp, FirebaseApp } from 'firebase/app';

export const firebaseConfig = {
    apiKey: 'AIzaSyA2d4WlcF1o97XGImc2ZnkHCLLqjsYZzr0',
    authDomain: 'isotopia-2809c.firebaseapp.com',
    databaseURL: 'https://isotopia-2809c-default-rtdb.firebaseio.com',
    projectId: 'isotopia-2809c',
    storageBucket: 'isotopia-2809c.firebasestorage.app',
    messagingSenderId: '390035248781',
    appId: '1:390035248781:web:e2fec345c05a48f5a834c4',
    measurementId: 'G-8X9WZCHCEC',
};

export function isFirebaseConfigured(): boolean {
    return firebaseConfig.apiKey.length > 0 && firebaseConfig.databaseURL.length > 0;
}

let app: FirebaseApp | undefined;

/** The initialized Firebase app, or undefined if config hasn't been filled in yet. */
export function getFirebaseApp(): FirebaseApp | undefined {
    if (!isFirebaseConfigured()) return undefined;
    if (!app) app = initializeApp(firebaseConfig);
    return app;
}
