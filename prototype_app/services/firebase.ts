import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Fix for TS error with import.meta.env
const env = (import.meta as any).env || {};

// Byt ut dessa värden mot dina egna från Firebase Console -> Project Settings
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "MOCK_KEY_FOR_DEV",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "mock-project.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "mock-project",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "mock-project.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase only if config is present (prevents crash in dev without keys)
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app);
export const storage = getStorage(app);