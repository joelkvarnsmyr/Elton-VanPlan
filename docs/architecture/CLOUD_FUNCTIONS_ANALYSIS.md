# ☁️ Cloud Functions Analysis

## Fråga: Behöver vi Cloud Functions?

**Kort svar: NEJ, inte nödvändigt just nu, men REKOMMENDERAT för framtiden.**

---

## 🔍 Nuvarande Arkitektur (Client-Side)

### Vad vi gör nu:

```
BROWSER
  │
  ├─> Gemini API (direkt från klient)
  │    └─> generateExpertAnalysis()
  │    └─> generateKnowledgeBase()
  │    └─> generatePhaseTasks()
  │
  ├─> Firebase Auth (klient SDK)
  ├─> Firestore (klient SDK)
  └─> Storage (klient SDK)
```

### ✅ Fördelar:
- **Enklare att utveckla** - Ingen backend-kod att deploya
- **Snabbare respons** - Direkt kommunikation med Gemini
- **Färre moving parts** - Mindre att gå fel
- **Gratis hosting** - Ingen extra kostnad för Cloud Functions

### ❌ Nackdelar:
- **API-nycklar exponerade** - VITE_GEMINI_API_KEY är synlig i klient-kod
- **Ingen rate limiting** - Användare kan spamma API:et
- **Ingen caching** - Varje request betalar
- **Ingen background processing** - Allt händer synkront
- **Ingen webhook-integration** - Kan inte ta emot callbacks

---

## 🎯 När behöver vi Cloud Functions?

### **Scenario 1: API-säkerhet** ⚠️ VIKTIGT
**Problem:** Gemini API-nyckel är exponerad i klient-kod

**Lösning:**
```javascript
// functions/src/index.ts
exports.generateOnboarding = functions.https.onCall(async (data, context) => {
  // Kör på servern med säker API-nyckel
  const apiKey = functions.config().gemini.key; // Säker!

  const result = await generateCompleteOnboarding({
    projectType: data.projectType,
    vehicleData: data.vehicleData
  });

  return result;
});
```

**I klienten:**
```typescript
import { httpsCallable } from 'firebase/functions';

const generateOnboarding = httpsCallable(functions, 'generateOnboarding');
const result = await generateOnboarding({ projectType, vehicleData });
```

---

### **Scenario 2: Externa API:er med secrets** 🔐
**När vi integrerar:**
- Transportstyrelsen API (kräver API-nyckel)
- Biluppgifter.se (betalt API)
- Google Maps (API-nyckel)
- Återkallelseregister

**Exempel:**
```javascript
exports.fetchVehicleData = functions.https.onCall(async (data, context) => {
  // Autentisering
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in');
  }

  // Säkert API-anrop
  const transportstyrelsens_key = functions.config().transportstyrelsen.key;
  const vehicleData = await fetch('https://api.transportstyrelsen.se/...', {
    headers: { 'Authorization': `Bearer ${transportstyrelsen_key}` }
  });

  return vehicleData;
});
```

---

### **Scenario 3: Background Processing** ⏱️
**Om vi vill:**
- Generera onboarding asynkront (köa jobbet)
- Skicka email när projektet är klart
- Schemalagd data-refresh (uppdatera fordonsdata varje vecka)

**Exempel:**
```javascript
// Trigger när projekt skapas
exports.onProjectCreated = functions.firestore
  .document('projects/{projectId}')
  .onCreate(async (snap, context) => {
    const project = snap.data();

    // Background: Generera resten av data
    if (!project.knowledgeBase || project.knowledgeBase.length === 0) {
      const enriched = await generateCompleteOnboarding({
        projectType: project.type,
        vehicleData: project.vehicleData
      });

      await snap.ref.update({
        knowledgeBase: enriched.knowledgeBase,
        tasks: enriched.tasks
      });
    }

    // Skicka email
    await sendWelcomeEmail(project.ownerEmail, project.name);
  });
```

---

### **Scenario 4: Scheduled Tasks** 📅
**Användningsfall:**
- Påminnelser om service
- Påminnelser om besiktning
- Uppdatera cacheade fordonsdata
- Rensa gamla projekt

**Exempel:**
```javascript
// Kör varje dag kl 09:00
exports.checkInspectionReminders = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Europe/Stockholm')
  .onRun(async (context) => {
    const now = new Date();
    const projects = await getProjectsWithUpcomingInspection(30); // 30 dagar

    for (const project of projects) {
      await sendEmail(project.ownerEmail, 'Dags att besikta!', ...);
    }
  });
```

---

### **Scenario 5: Rate Limiting & Cost Control** 💰
**Problem:** Användare kan spamma Gemini API och kosta pengar

**Lösning:**
```javascript
exports.generateOnboarding = functions
  .runWith({ memory: '2GB', timeoutSeconds: 540 })
  .https.onCall(async (data, context) => {
    // Rate limiting per användare
    const userId = context.auth.uid;
    const requestCount = await getRequestCount(userId, 'last_hour');

    if (requestCount > 10) {
      throw new functions.https.HttpsError(
        'resource-exhausted',
        'För många requests. Försök igen om en timme.'
      );
    }

    await incrementRequestCount(userId);

    // Kör AI-generation
    return await generateCompleteOnboarding(data);
  });
```

---

### **Scenario 6: Webhooks & External Integration** 🔗
**Om vi vill integrera med:**
- Stripe (betalningar)
- Mailgun (email)
- Zapier (automation)
- Slack (notifikationer)

**Exempel:**
```javascript
// Webhook från Stripe när betalning går igenom
exports.stripeWebhook = functions.https.onRequest(async (req, res) => {
  const sig = req.headers['stripe-signature'];
  const event = stripe.webhooks.constructEvent(req.rawBody, sig, webhookSecret);

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    await upgradeUserToPremium(session.client_reference_id);
  }

  res.json({ received: true });
});
```

---

## 🏗️ Rekommenderad Implementationsplan

### **Fas 1: Nuvarande (Client-Side)** ✅
**Status:** Fungerar bra för MVP/Beta

**Vad vi har:**
- Klient anropar Gemini direkt
- API-nyckel i `.env` (exponerad men OK för beta)
- Inga externa API:er ännu

**Säkerhet:**
```javascript
// .env
VITE_GEMINI_API_KEY=xxx  // ⚠️ Synlig i browser DevTools

// Men: Firebase Rules skyddar data
// Användare kan bara läsa/skriva sina egna projekt
```

---

### **Fas 2: Hybridlösning** (Rekommenderat inom 1-2 månader)

**Flytta säkerhetskänsligt till Cloud Functions:**

```
CLIENT
  │
  ├─> Simple AI calls (klient) ──> Gemini API
  │    └─> Chat, quick analysis
  │
  └─> Complex operations (server) ──> Cloud Functions
       │
       ├─> generateCompleteOnboarding()  [Säker API-nyckel]
       ├─> fetchVehicleData()            [Externa API:er]
       └─> processReceipt()              [OCR + AI]
```

**Fördelar:**
- ✅ API-nycklar säkra
- ✅ Rate limiting
- ✅ Externa API:er fungerar
- ✅ Snabba UI-operationer fortfarande client-side

---

### **Fas 3: Full Backend** (Framtid, vid större skala)

**När projektet växer:**
- Alla AI-calls via Cloud Functions
- Caching layer (Redis)
- Background queues (Pub/Sub)
- Admin panel för monitoring

---

## 💰 Kostnadsjämförelse

### **Client-Side (Nu):**
```
Gemini API:
  - Text generation: ~$0.0001 per request
  - Vision: ~$0.002 per image

Per månad (100 användare, 5 projekt var):
  - 500 onboardings × $0.01 = $5

Firebase Hosting: Gratis
Total: ~$5/månad
```

### **Med Cloud Functions:**
```
Cloud Functions:
  - Invocations: Gratis (2M/månad)
  - Compute: ~$0.40 per 100,000 sec (256MB)

Gemini API: Samma

Per månad (100 användare):
  - 500 onboardings × 10 sec × $0.000004 = $0.02
  - Gemini: $5

Total: ~$5.02/månad (nästan ingen skillnad!)
```

**Slutsats:** Cloud Functions kostar nästan inget men ger mycket bättre säkerhet.

---

## 📋 Action Items

### **Nu (Fas 1 - Beta):**
- [x] Kör client-side
- [ ] Dokumentera att API-nyckel är exponerad (acceptabel risk för beta)
- [ ] Lägg till Firebase Security Rules för att skydda data
- [ ] Monitora Gemini-kostnad

### **Inom 1-2 månader (Fas 2):**
- [ ] Skapa Cloud Functions projekt
- [ ] Flytta `generateCompleteOnboarding()` till server
- [ ] Flytta alla externa API-anrop till server
- [ ] Implementera rate limiting
- [ ] Lägg till caching för fordonsdata

### **När vi integrerar externa API:er:**
- [ ] Transportstyrelsen → Cloud Function (obligatoriskt)
- [ ] Biluppgifter.se → Cloud Function (obligatoriskt)
- [ ] Google Maps → Cloud Function (rekommenderat)

---

## 🔧 Kod-exempel: Minimal Cloud Functions Setup

### **1. Installera:**
```bash
npm install -g firebase-tools
firebase init functions
cd functions
npm install
```

### **2. functions/src/index.ts:**
```typescript
import * as functions from 'firebase-functions';
import { generateCompleteOnboarding } from './onboardingService';

// Säker onboarding-generation
export const createProject = functions
  .region('europe-west1')
  .runWith({ memory: '2GB', timeoutSeconds: 300 })
  .https.onCall(async (data, context) => {
    // Auth check
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Must be logged in');
    }

    // Rate limit (enkel)
    const userId = context.auth.uid;
    // TODO: Implementera rate limiting här

    // Kör onboarding
    try {
      const result = await generateCompleteOnboarding({
        projectType: data.projectType,
        vehicleData: data.vehicleData,
        userLocation: data.userLocation
      });

      return result;
    } catch (error: any) {
      console.error('Onboarding failed:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  });
```

### **3. Deploy:**
```bash
firebase deploy --only functions
```

### **4. Använd i klient:**
```typescript
import { getFunctions, httpsCallable } from 'firebase/functions';

const functions = getFunctions(app, 'europe-west1');
const createProject = httpsCallable(functions, 'createProject');

const result = await createProject({
  projectType: 'renovation',
  vehicleData: { ... },
  userLocation: 'Falun'
});
```

---

## 🎯 Rekommendation

### **JUST NU (Beta/MVP):**
✅ **Fortsätt med client-side** - Fungerar bra!

**Men:**
- ⚠️ Var medveten om exponerad API-nyckel
- ⚠️ Monitora Gemini-kostnad noga
- ⚠️ Lägg till Firebase Security Rules

### **NÄSTA STEG (1-2 månader):**
🚀 **Implementera Cloud Functions för:**
1. Onboarding-generation (säkerhet)
2. Externa API-anrop (när de kommer)
3. Rate limiting

### **FRAMTIDEN:**
🌟 **Full backend när:**
- Fler än 1000 användare
- Externa API:er integrerade
- Betalningar (Stripe)
- Email-notifikationer

---

## 📝 Sammanfattning

| Feature | Client-Side | Cloud Functions | Rekommendation |
|---------|-------------|-----------------|----------------|
| Onboarding (AI) | ✅ Fungerar | ✅ Säkrare | CF när du har tid |
| Externa API:er | ❌ Ej säkert | ✅ Obligatoriskt | CF **innan** API-integration |
| Rate Limiting | ❌ Omöjligt | ✅ Enkelt | CF när kostnaden ökar |
| Webhooks | ❌ Omöjligt | ✅ Enkelt | CF vid behov |
| Scheduled Tasks | ❌ Omöjligt | ✅ Enkelt | CF vid behov |
| Email | ❌ Svårt | ✅ Enkelt | CF vid behov |

**Slutsats:** Börja client-side, migrera till Cloud Functions stegvis när behoven uppstår.
