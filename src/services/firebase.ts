import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage"; // Importera getStorage

// ERSÄTT HELA DETTA OBJEKT MED DITT FRÅN FIREBASE CONSOLE
const firebaseConfig = {
  apiKey: "AIzaSyCdI_a4JK94rFbNCw8OFonvA_KTXE7Lgyw",
  authDomain: "eltonvanplan.firebaseapp.com",
  projectId: "eltonvanplan",
  storageBucket: "eltonvanplan.appspot.com", // Korrekt storage bucket-format
  messagingSenderId: "329886252808",
  appId: "1:329886252808:web:3921c45dd741b68ef5b6bd"
};

export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app); // Exportera storage
