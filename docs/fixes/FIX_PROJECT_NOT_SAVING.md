ats# Fix: Projekt sparas inte till användarprofil

## Problem
Projekt skapades men syntes inte i projektlistan när användaren gick tillbaka.

## Lösning Implementerad

### 1. **Lagt till 1-sekunders delay efter createProject()**
**Varför:** Firestore tar tid att indexera nya dokument. Om vi kör `getProjectsForUser()` direkt efter `createProject()` så hinner inte indexet uppdateras än.

**Ändring i `App.tsx`:**
```typescript
const newProject = await createProject(...);
console.log('✅ Project created:', newProject.id);

// WAIT for Firestore to index
await new Promise(resolve => setTimeout(resolve, 1000));

await loadUserProjects(currentUser);
await selectProject(newProject.id);
```

### 2. **Lagt till omfattande debug-logging**
Nu loggas varje steg i processen:

**I `App.tsx`:**
- `handleCreateProject`: Loggar userId, email och vilket projekt som skapas
- `loadUserProjects`: Loggar hur många projekt som hittades och deras ownerId

**I `services/db.ts`:**
- `createProject`: Loggar input-parametrar, vad som sparas till Firestore, och bekräftelse när klart
- `getProjectsForUser`: Loggar varje query (ownerId, members, invitedEmails) och hur många resultat varje ger

### 3. **Lagt till userSkillLevel och nickname i Project**
Dessa fält saknades i `createProject()` vilket kunde orsaka fel.

**Ändring i `services/db.ts`:**
```typescript
const newProject: Project = {
    // ... existing fields
    userSkillLevel: template?.userSkillLevel,
    nickname: template?.nickname
};
```

## Hur man testar

### 1. Öppna DevTools Console
Tryck F12 → Console tab

### 2. Skapa ett nytt projekt via onboarding wizard
Du kommer nu se en fullständig logg:

```
🔍 Starting project creation for user: abc123xyz... user@email.com
🔍 createProject called: {name: "Volvo 240", model: "240", userId: "abc123", userEmail: "user@email.com"}
💾 Saving project to Firestore: {id: "xyz789", name: "Volvo 240", ownerId: "abc123", ownerEmail: "user@email.com"}
✅ Project saved successfully!
✅ Project created: xyz789 Volvo 240
⏳ Waiting for Firestore to index...
🔍 Loading projects for user: abc123xyz... user@email.com
🔍 getProjectsForUser called: {userId: "abc123", userEmail: "user@email.com"}
  📊 Owned projects found: 1
    - Owned: xyz789 Volvo 240 (ownerId: abc123)
  📊 Member projects found: 0
  📊 Invited projects found: 0
✅ Total unique projects: 1
✅ Found projects: 1
  📦 Project: Volvo 240 (ownerId: abc123 )
🎯 Selecting new project: xyz789
```

### 3. Om det fortfarande inte fungerar
Kolla efter:

#### A. **ownerId matchar inte userId**
```
💾 Saving project: {ownerId: "abc123"}
🔍 Loading projects: {userId: "xyz789"}  // ❌ MISMATCH!
```
**Lösning:** Verifiera att `currentUser.uid` är konsistent

#### B. **Permission denied error**
```
❌ Failed to create project: Error: Missing or insufficient permissions
Error details: {code: "permission-denied"}
```
**Lösning:** Kör `firebase deploy --only firestore:rules`

#### C. **Project inte hittat trots rätt userId**
```
💾 Saving project: {ownerId: "abc123"}
📊 Owned projects found: 0  // ❌ Hittar inte projektet!
```
**Lösning:** Kontrollera Firestore Console manuellt - finns projektet där? Har det rätt ownerId?

## Debug Commands (kör i Console)

### Kontrollera inloggad användare
```javascript
const auth = window.firebase?.auth();
console.log('UID:', auth?.currentUser?.uid);
console.log('Email:', auth?.currentUser?.email);
```

### Hitta alla dina projekt manuellt
```javascript
const db = window.firebase?.firestore();
const auth = window.firebase?.auth();

db.collection('projects')
  .where('ownerEmail', '==', auth.currentUser.email)
  .get()
  .then(snap => {
    console.log('Your projects:', snap.size);
    snap.forEach(doc => {
      const d = doc.data();
      console.log('-', doc.id, d.name, 'ownerId:', d.ownerId, 'MATCH:', d.ownerId === auth.currentUser.uid ? '✅' : '❌');
    });
  });
```

### Visa ALLA projekt (admin check)
```javascript
db.collection('projects').get().then(snap => {
  console.log('Total projects in DB:', snap.size);
  snap.forEach(doc => console.log('-', doc.id, doc.data().name));
});
```

## Vad som ändrades

### Filer modifierade:
1. **App.tsx**
   - Lagt till 1s delay efter createProject
   - Lagt till debug-logging i handleCreateProject och loadUserProjects

2. **services/db.ts**
   - Lagt till debug-logging i createProject och getProjectsForUser
   - Lagt till userSkillLevel och nickname i Project-objektet

### Kompilering:
Inga TypeScript-fel. Servern kör på http://localhost:3002

## Nästa steg om det fortfarande inte fungerar

1. Skapa ett projekt
2. Kopiera HELA console-loggen
3. Skicka till mig så kan jag se exakt var det går fel

Den nya loggningen kommer visa om:
- userId är konsistent
- Projektet faktiskt sparas till Firestore
- Projektet hittas när vi söker efter det
- Det finns några permission-fel
