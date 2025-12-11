# Migration Guide: LocalStorage to Firebase 🔥

This guide outlines the steps to upgrade **The VanPlan** from a client-side prototype to a fully cloud-backed application using **Google Firebase**.

---

## 1. Firebase Setup

### A. Create Project
1. Go to [console.firebase.google.com](https://console.firebase.google.com).
2. Create a new project (e.g., `elton-vanplan`).
3. Enable **Authentication** (Email/Password, Google).
4. Enable **Cloud Firestore** (Database). Start in *Production Mode*.
5. Enable **Storage** (for images/receipts).

### B. Install SDK
Run the following in your terminal:
```bash
npm install firebase
```

### C. Initialize App
Create a new file `src/services/firebase.ts`:

```typescript
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_PROJECT.firebaseapp.com",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_PROJECT.appspot.com",
  messagingSenderId: "...",
  appId: "..."
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## 2. Data Structure (NoSQL)

Unlike the relational Supabase model, Firebase is document-based. We will nest data under users to leverage the security rules defined in `firestore.rules`.

**Path Structure:**
*   `users/{userId}`
    *   `profile`: { name, email, avatar }
    *   `projects/{projectId}`
        *   Document: { name, vehicleData, created... }
        *   Subcollection: `tasks/{taskId}`
        *   Subcollection: `shoppingItems/{itemId}`
        *   Subcollection: `serviceLog/{logId}`

---

## 3. Code Refactoring Strategy

### A. Authentication (`App.tsx`)
Replace the mock login with Firebase Auth:

```typescript
// Old
const handleLogin = () => setUser({ id: 'u1' ... });

// New
import { signInWithPopup, GoogleAuthProvider } from "firebase/auth";
const handleLogin = async () => {
  await signInWithPopup(auth, new GoogleAuthProvider());
};
// Use onAuthStateChanged to detect user session
```

### B. Data Fetching (`ProjectSelector.tsx`)
Replace `localStorage` parsing with Firestore listeners (Realtime!):

```typescript
import { collection, onSnapshot } from "firebase/firestore";

useEffect(() => {
  if (!user) return;
  const projectsRef = collection(db, "users", user.uid, "projects");
  const unsubscribe = onSnapshot(projectsRef, (snapshot) => {
    const projectsData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setProjects(projectsData);
  });
  return () => unsubscribe();
}, [user]);
```

### C. Image Uploads
Stop using Base64. Upload to Firebase Storage:

```typescript
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

const uploadImage = async (file, path) => {
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
};
```

---

## 4. Deployment

Deploy your app to global CDN with one command:

```bash
npm run build
firebase deploy
```
