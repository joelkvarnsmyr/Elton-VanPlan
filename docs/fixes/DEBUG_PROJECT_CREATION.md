# Debug Guide: Projekt sparas inte till användarprofil

## Problem
När du skapar ett projekt med onboarding wizard så ser det ut som att projektet skapas, men när du går tillbaka till projektlistan så finns det inte där.

## Möjliga orsaker

### 1. **userId vs ownerId mismatch**
**Vad som händer:**
- Projektet skapas med fel `ownerId`
- `getProjectsForUser()` söker efter `userId` men hittar inget

**Hur man testar:**
1. Öppna Browser DevTools → Console
2. Kör detta INNAN du skapar projekt:
```javascript
// Logga in och hämta userId
const auth = window.firebase?.auth();
console.log('Current User UID:', auth?.currentUser?.uid);
console.log('Current User Email:', auth?.currentUser?.email);
```

3. Skapa ett projekt via wizard
4. Kör detta EFTER projektet skapats:
```javascript
// Kontrollera om projektet finns i Firestore
const db = window.firebase?.firestore();
db.collection('projects')
  .where('ownerEmail', '==', auth.currentUser.email)
  .get()
  .then(snapshot => {
    console.log('Found projects:', snapshot.size);
    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('Project:', {
        id: doc.id,
        name: data.name,
        ownerId: data.ownerId,
        ownerEmail: data.ownerEmail
      });
    });
  });
```

### 2. **Firestore säkerhetsregler blockerar**
**Vad som händer:**
- `createProject()` misslyckas tyst pga permission-denied
- Error fångas men projekt skapas aldrig

**Hur man testar:**
1. Öppna Browser DevTools → Console
2. Kolla efter felmeddelanden när du skapar projekt
3. Om du ser `permission-denied` eller `insufficient permissions`, då är det ett säkerhetsproblem

**Fix:**
```bash
# Publicera säkerhetsregler igen
firebase deploy --only firestore:rules
```

### 3. **Template inkluderar inte userSkillLevel/nickname korrekt**
**Vad som händer:**
- `createProject()` krashar på grund av TypeScript-fel
- Projekt skapas inte alls

**Hur man testar:**
Se i Console om det finns något av:
- `TypeError: Cannot read property...`
- `undefined is not an object`

**Temporär Fix:**
```typescript
// I ProjectSelector.tsx, rad 83-111
const newProjectTemplate: Partial<Project> = {
    name: cleanName,
    type: data.projectType,
    userSkillLevel: data.userSkillLevel || 'intermediate', // LÄGG TILL DEFAULT
    nickname: data.nickname || undefined,
    customIcon: customIcon,
    // ... rest of code
};
```

### 4. **loadUserProjects() körs för snabbt efter createProject()**
**Vad som händer:**
- Firestore har inte hunnit indexera det nya projektet än
- `loadUserProjects()` körs direkt och hittar inget

**Hur man testar:**
1. Skapa ett projekt
2. Vänta 2-3 sekunder
3. Tryck F5 (refresh)
4. Om projektet då dyker upp → detta är problemet

**Fix:**
```typescript
// I App.tsx, handleCreateProject
const handleCreateProject = async (projectTemplate: Partial<Project>) => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
        const newProject = await createProject(
            projectTemplate.name || 'Nytt Projekt',
            projectTemplate.vehicleData?.model || 'Okänd',
            currentUser.uid,
            currentUser.email!,
            projectTemplate
        );

        // LÄGG TILL DELAY
        await new Promise(resolve => setTimeout(resolve, 1000));

        await loadUserProjects(currentUser);
        await selectProject(newProject.id);
        showToast("Nytt projekt skapat!");
    } catch (error: any) {
        console.error("Failed to create project:", error);
        showToast("Kunde inte skapa projekt", "error");
    }
    setIsLoading(false);
}
```

### 5. **getProjectsForUser() använder fel query**
**Vad som händer:**
- Query matchar inte den faktiska datan

**Hur man testar:**
```javascript
// I Console
const db = window.firebase?.firestore();
const auth = window.firebase?.auth();
const userId = auth.currentUser.uid;

// Test query 1: By ownerId
db.collection('projects')
  .where('ownerId', '==', userId)
  .get()
  .then(snap => console.log('Query by ownerId:', snap.size));

// Test query 2: By members array
db.collection('projects')
  .where('members', 'array-contains', userId)
  .get()
  .then(snap => console.log('Query by members:', snap.size));

// Test query 3: All projects (admin check)
db.collection('projects')
  .get()
  .then(snap => {
    console.log('All projects in DB:', snap.size);
    snap.forEach(doc => {
      const data = doc.data();
      if (data.ownerEmail === auth.currentUser.email) {
        console.log('Found YOUR project:', doc.id, data.name);
      }
    });
  });
```

## Steg-för-steg debugging

### Steg 1: Kontrollera att användaren är inloggad
```javascript
const auth = window.firebase?.auth();
console.log('Logged in:', !!auth?.currentUser);
console.log('UID:', auth?.currentUser?.uid);
console.log('Email:', auth?.currentUser?.email);
```

**Förväntat resultat:**
```
Logged in: true
UID: "abc123xyz..." (en lång sträng)
Email: "din@email.com"
```

### Steg 2: Skapa projekt och logga template
Lägg till console.log i `ProjectSelector.tsx`:

```typescript
const handleOnboardingComplete = async (data: OnboardingData) => {
    try {
        // ... existing code ...

        const newProjectTemplate: Partial<Project> = {
            // ... existing fields ...
        };

        console.log('🔍 Creating project with template:', newProjectTemplate);
        console.log('🔍 User UID from parent:', user.uid);

        onCreateProject(newProjectTemplate);
        setIsCreating(false);
    } catch (error) {
        console.error("❌ Failed to create project", error);
    }
};
```

### Steg 3: Logga i createProject
Lägg till i `services/db.ts`:

```typescript
export const createProject = async (
    name: string,
    model: string,
    userId: string,
    userEmail: string,
    template?: Partial<Project>
): Promise<Project> => {
    console.log('🔍 createProject called with:', { name, model, userId, userEmail });

    const newProjectRef = doc(collection(db, 'projects'));

    // ... existing code ...

    const newProject: Project = {
        id: newProjectRef.id,
        name: name || 'Nytt Projekt',
        type: (template?.type || 'renovation') as any,
        brand: 'vanplan',
        ownerId: userId, // 🔍 VIKTIGT: Detta måste matcha userId
        ownerEmail: userEmail,
        // ... rest
    };

    console.log('🔍 About to save project:', {
        id: newProject.id,
        name: newProject.name,
        ownerId: newProject.ownerId,
        ownerEmail: newProject.ownerEmail
    });

    await setDoc(newProjectRef, newProject);

    console.log('✅ Project saved to Firestore!');

    return newProject;
};
```

### Steg 4: Verifiera att projekt sparades
Direkt efter att du skapat ett projekt, kör:

```javascript
// I Console
const db = window.firebase?.firestore();
const auth = window.firebase?.auth();

db.collection('projects')
  .where('ownerEmail', '==', auth.currentUser.email)
  .get()
  .then(snapshot => {
    console.log('📊 Total projects for your email:', snapshot.size);

    snapshot.forEach(doc => {
      const data = doc.data();
      console.log('📦 Project:', {
        id: doc.id,
        name: data.name,
        ownerId: data.ownerId,
        currentUserId: auth.currentUser.uid,
        MATCH: data.ownerId === auth.currentUser.uid ? '✅' : '❌'
      });
    });
  });
```

### Steg 5: Kontrollera loadUserProjects
Lägg till i `App.tsx`:

```typescript
const loadUserProjects = async (user: UserProfile) => {
    console.log('🔍 Loading projects for user:', user.uid, user.email);
    setIsLoading(true);
    try {
        const userProjects = await getProjectsForUser(user.uid);
        console.log('✅ Found projects:', userProjects.length);
        userProjects.forEach(p => {
            console.log('  - ', p.name, '(ownerId:', p.ownerId, ')');
        });
        setProjects(userProjects);
        if (userProjects.length === 0) {
            setActiveProject(null);
        }
    } catch (err) {
        console.error("❌ Error loading projects:", err);
        showToast("Kunde inte ladda projekt", "error");
    }
    setIsLoading(false);
};
```

## Vanligaste lösningen

Baserat på liknande problem i Firebase-appar, de vanligaste orsakerna är:

1. **Firestore indexering tar tid** (1-2 sekunder)
   - Lägg till 1s delay efter createProject

2. **userId kommer från fel källa**
   - Verifiera att `currentUser.uid` i App.tsx är samma som `auth.currentUser.uid`

3. **Säkerhetsregler blockerar läsning**
   - Kör: `firebase deploy --only firestore:rules`

## Quick Fix (Test detta först)

I `App.tsx`, ändra `handleCreateProject`:

```typescript
const handleCreateProject = async (projectTemplate: Partial<Project>) => {
    if (!currentUser) return;
    setIsLoading(true);

    console.log('🔍 Starting project creation for user:', currentUser.uid);

    try {
        const newProject = await createProject(
            projectTemplate.name || 'Nytt Projekt',
            projectTemplate.vehicleData?.model || 'Okänd',
            currentUser.uid,  // 🔍 Verify this is correct
            currentUser.email!,
            projectTemplate
        );

        console.log('✅ Project created:', newProject.id);

        // Wait for Firestore to index
        console.log('⏳ Waiting 1 second for Firestore to index...');
        await new Promise(resolve => setTimeout(resolve, 1000));

        console.log('🔄 Reloading projects...');
        await loadUserProjects(currentUser);

        console.log('🎯 Selecting new project...');
        await selectProject(newProject.id);

        showToast("Nytt projekt skapat!");
    } catch (error: any) {
        console.error("❌ Failed to create project:", error);
        console.error("Error details:", {
            code: error.code,
            message: error.message,
            stack: error.stack
        });

        if (error.code === 'permission-denied') {
            showToast("Åtkomst nekad. Kontrollera behörigheter.", "error");
        } else {
            showToast("Kunde inte skapa projekt", "error");
        }
    }

    setIsLoading(false);
}
```

## Nästa steg

Testa quick fix ovan. Om det inte fungerar:

1. Kör alla console.log kommandon i steg 1-5
2. Skicka mig output från Console
3. Då kan jag se exakt var det går fel
