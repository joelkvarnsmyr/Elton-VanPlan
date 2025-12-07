
import { 
  sendSignInLinkToEmail, 
  isSignInWithEmailLink, 
  signInWithEmailLink, 
  createUserWithEmailAndPassword, // NEW
  signInWithEmailAndPassword,     // NEW
  signOut,
  onAuthStateChanged,
  User 
} from "firebase/auth";
import { auth } from "./firebase";

const actionCodeSettings = {
  url: typeof window !== 'undefined' ? window.location.origin : 'http://localhost:5173', 
  handleCodeInApp: true,
};

// --- PASSWORDLESS (MAGIC LINK) ---

export const sendLoginLink = async (email: string) => {
  try {
    const settings = { ...actionCodeSettings, url: window.location.origin };
    await sendSignInLinkToEmail(auth, email, settings);
    window.localStorage.setItem('emailForSignIn', email);
    return { success: true };
  } catch (error: any) {
    console.error("Error sending email link", error);
    return { success: false, error: error.message };
  }
};

export const completeLogin = async () => {
  if (isSignInWithEmailLink(auth, window.location.href)) {
    let email = window.localStorage.getItem('emailForSignIn');
    if (!email) {
      email = window.prompt('Vänligen bekräfta din e-postadress för att logga in:');
    }
    if (email) {
      try {
        const result = await signInWithEmailLink(auth, email, window.location.href);
        window.localStorage.removeItem('emailForSignIn');
        window.history.replaceState({}, document.title, window.location.pathname);
        return { success: true, user: result.user };
      } catch (error: any) {
        console.error("Error signing in", error);
        return { success: false, error: error.message };
      }
    }
  }
  return { success: false, error: "Not a sign-in link" };
};

// --- PASSWORD AUTH (NEW) ---

export const loginWithPassword = async (email: string, password: string) => {
    try {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error: any) {
        console.error("Login failed", error);
        let message = error.message;
        if (error.code === 'auth/invalid-credential') message = "Fel e-post eller lösenord.";
        return { success: false, error: message };
    }
}

export const registerWithPassword = async (email: string, password: string) => {
    try {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        return { success: true, user: result.user };
    } catch (error: any) {
        console.error("Registration failed", error);
        let message = error.message;
        if (error.code === 'auth/email-already-in-use') message = "Adressen används redan.";
        if (error.code === 'auth/weak-password') message = "Lösenordet är för svagt (minst 6 tecken).";
        return { success: false, error: message };
    }
}

// --- COMMON ---

export const logout = async () => {
  await signOut(auth);
};

export const subscribeToAuthChanges = (callback: (user: User | null) => void) => {
  return onAuthStateChanged(auth, callback);
};
