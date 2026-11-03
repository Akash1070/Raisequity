import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const getEnv = (key: string, fallback: string) => {
  if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[key]) {
    return import.meta.env[key];
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
};

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY', 'AIzaSyDA2sTTcOvZFvlA0h3Tf1echp84saV82iQ'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN', 'raisequity-5d862.firebaseapp.com'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID', 'raisequity-5d862'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET', 'raisequity-5d862.firebasestorage.app'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID', '53852364116'),
  appId: getEnv('VITE_FIREBASE_APP_ID', '1:53852364116:web:f0ac19be0beb73efaf7cc1'),
};

// Initialize Firebase App
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
