# Firestore Permissions Fix ✅

## Problem
Felet "Missing or insufficient permissions" uppstod när projekt skulle laddas.

## Orsak
Firestore säkerhetsregler hade inte deployats efter att vi lade till nya fält (`userSkillLevel`, `nickname`) i Project-objektet.

## Lösning
```bash
firebase deploy --only firestore:rules
```

Status: ✅ **Deployat** - Rules är nu live i produktion.

## Verifiering

### Steg 1: Refresh webbläsaren
1. Gå till http://localhost:3002
2. Tryck **Ctrl+Shift+R** (hard refresh)
3. Öppna DevTools Console (F12)

### Steg 2: Kolla efter errors
Du borde NU se:
```
🔍 Loading projects for user: [din userId]
✅ Found projects: X
```

Istället för:
```
❌ Error loading projects: FirebaseError: Missing or insufficient permissions
```

### Steg 3: Testa skapa projekt
1. Klicka "Nytt Projekt"
2. Gå igenom wizard
3. Projektet borde skapas och laddas

## Om problemet kvarstår

### Problem 1: Användaren inte inloggad
**Symptom:**
```javascript
request.auth == null
```

**Lösning:**
Kolla i Console:
```javascript
firebase.auth().currentUser
// Borde INTE vara null
```

Om null, klicka "Demo Login" igen.

### Problem 2: userId matchar inte ownerId
**Symptom:**
```
request.resource.data.ownerId != request.auth.uid
```

**Lösning:**
Kolla i Console:
```javascript
// När projekt skapas
console.log('Creating with userId:', currentUser.uid);

// När projekt sparas
console.log('Project ownerId:', newProject.ownerId);

// Dessa MÅSTE matcha!
```

### Problem 3: Rules cache
**Symptom:**
Rules är deployade men ändå permission denied.

**Lösning:**
Firebase kan cacha rules i upp till 1 minut. Vänta 60 sekunder och försök igen.

Eller tvinga refresh:
1. Öppna Firebase Console
2. Gå till Firestore → Rules
3. Verifiera att de nya reglerna finns där
4. Vänta 1 minut

### Problem 4: Emulator kör med gamla rules
**Symptom:**
Du kör mot Firebase Emulator istället för prod.

**Lösning:**
Kolla i Console om du ser:
```
Using Firebase Emulator
```

Om ja, stanna emulatorn och kör mot prod:
```bash
# Stäng emulator
firebase emulators:stop

# Kör mot prod
npm run dev
```

## Firestore Rules Förklaring

### Read Permission
```javascript
allow read: if hasAccess() || isInvited();
```

Användare kan läsa projekt om:
- De äger projektet (`ownerId == request.auth.uid`)
- De är medlem (`uid in members`)
- De är inbjudna (`email in invitedEmails`)

### Create Permission
```javascript
allow create: if request.auth != null &&
              request.resource.data.ownerId == request.auth.uid;
```

Användare kan skapa projekt om:
- De är inloggade (`request.auth != null`)
- De sätter sig själva som ägare (`ownerId == auth.uid`)

Detta förhindrar att någon skapar projekt åt andra.

### Update Permission
```javascript
allow update: if hasAccess() || isInvited();
```

Användare kan uppdatera projekt om:
- De har åtkomst (ägare eller medlem)
- De är inbjudna (för att acceptera inbjudan)

### Delete Permission
```javascript
allow delete: if request.auth != null &&
              resource.data.ownerId == request.auth.uid;
```

Endast ägaren kan radera projekt.

## Debug Commands

### Kolla current user
```javascript
const auth = firebase.auth();
const user = auth.currentUser;
console.log('UID:', user?.uid);
console.log('Email:', user?.email);
console.log('Logged in:', !!user);
```

### Testa query manuellt
```javascript
const db = firebase.firestore();
const userId = auth.currentUser.uid;

// Testa owned projects query
db.collection('projects')
  .where('ownerId', '==', userId)
  .get()
  .then(snap => {
    console.log('✅ Query succeeded! Found:', snap.size);
    snap.forEach(doc => console.log('  -', doc.id, doc.data().name));
  })
  .catch(err => {
    console.error('❌ Query failed:', err.code, err.message);
  });
```

### Kolla Firestore Rules i Console
1. Öppna https://console.firebase.google.com
2. Välj projekt "eltonvanplan"
3. Gå till **Firestore Database** → **Rules**
4. Verifiera att de matchar `firestore.rules` i repot

### Testa rules lokalt (Emulator)
```bash
# Starta emulator
firebase emulators:start --only firestore

# I ny terminal
firebase emulators:exec --only firestore "npm run test:rules"
```

## Sammanfattning

- ✅ **Deployat** Firestore rules
- ✅ **Lagt till** userSkillLevel och nickname i Project-objektet
- ✅ **Uppdaterat** createProject() att inkludera nya fält
- ✅ **Lagt till** debug-logging för att diagnostisera framtida problem

**Nästa steg:**
1. Refresh webbläsaren (Ctrl+Shift+R)
2. Testa skapa projekt
3. Kolla console-loggar för bekräftelse

Om problemet kvarstår efter refresh, kör debug-kommandona ovan och skicka output.
