# 🤖 AI Development Guide - Elton VanPlan

**För AI-assistenter som arbetar med Elton-VanPlan projektet**

Detta dokument är en **systemprompt** och utvecklingsguide för AI-modeller (ChatGPT, Claude, Gemini, Cursor, etc.) som hjälper till att utveckla, debugga och förbättra Elton-VanPlan.

---

## 🚨 KRITISKA REGLER FÖR MULTI-AGENT SAMARBETE

### ⚠️ LÄS DETTA FÖRST - Obligatoriskt för alla AI-agenter

Detta projekt används med **flera AI-agenter parallellt**. För att undvika konflikter:

#### 1. ALLTID börja med att synkronisera
```bash
# FÖRSTA KOMMANDOT i varje session
git fetch origin && git status
```

#### 2. ALDRIG ändra dessa filer utan explicit tillstånd
- `src/types/types.ts` - Delade typdefinitioner
- `src/services/firebase.ts` - Firebase konfiguration
- `firestore.rules` - Säkerhetsregler
- `package.json` - Dependencies
- `functions/src/index.ts` - Cloud Functions export

#### 3. ALLTID dokumentera dina ändringar
```bash
# Innan commit - skriv tydliga meddelanden
git commit -m "Feat: [OMRÅDE] Kort beskrivning

- Detaljerad punkt 1
- Detaljerad punkt 2

AI-Agent: [Claude/ChatGPT/Cursor/etc]"
```

#### 4. ALDRIG force push
```bash
# ❌ FÖRBJUDET
git push --force

# ✅ KORREKT
git push origin branch-name
```

#### 5. KOMMUNICERA via docs/
Om du gör stora ändringar, skapa/uppdatera en fil i `docs/` för att informera andra agenter.

---

## 🔄 Multi-Agent Workflow

### Rekommenderad Arbetsprocess

```
┌──────────────────────────────────────────────────────────┐
│  1. SYNC: git fetch && git pull                          │
│  2. READ: Läs denna guide + relevanta docs/              │
│  3. PLAN: Beskriv vad du ska göra för användaren         │
│  4. CODE: Gör ändringar i isolerade filer                │
│  5. TEST: Kör npm run build && npm test                  │
│  6. COMMIT: Tydligt meddelande med AI-agent namn         │
│  7. PUSH: git push origin branch-name                    │
└──────────────────────────────────────────────────────────┘
```

### Ansvarsområden - Förslag till uppdelning

| Område | Primär fil/mapp | Komplexitet |
|--------|-----------------|-------------|
| **UI Components** | `src/components/` | Medium |
| **AI Integration** | `src/services/geminiService.ts` | Hög |
| **Cloud Functions** | `functions/src/` | Hög |
| **Styling** | Tailwind i komponenter | Låg |
| **Tests (Unit)** | `tests/`, `src/**/*.test.ts` | Medium |
| **Tests (E2E)** | `e2e/` | Medium |
| **Documentation** | `docs/` | Låg |
| **Types** | `src/types/types.ts` | Hög (varning!) |

### Konflikthantering

Om du upptäcker att en annan agent har ändrat samma fil:

1. **STOP** - Gör inte fler ändringar
2. **FETCH** - `git fetch origin`
3. **COMPARE** - `git diff origin/main -- path/to/file`
4. **INFORM** - Meddela användaren om konflikten
5. **MERGE** - Låt användaren bestämma hur konflikten ska lösas

---

## 🏗️ Aktuell Arkitektur (Uppdaterad 2025-12-11)

### Säkerhetsmodell - Cloud Functions

**API-nycklar hanteras nu på backend:**

```
┌─────────────┐      ┌──────────────────┐      ┌─────────────┐
│   Frontend  │ ───▶ │ Cloud Functions  │ ───▶ │  Gemini API │
│  (React)    │      │ (Node.js)        │      │  (Google)   │
└─────────────┘      └──────────────────┘      └─────────────┘
       │                     │
       │                     ▼
       │              ┌──────────────────┐
       │              │ Secret Manager   │
       │              │ (API Keys)       │
       │              └──────────────────┘
       │
       ▼
┌─────────────────┐
│ Firebase Auth   │
│ (Användar-ID)   │
└─────────────────┘
```

### Cloud Functions (functions/src/)

| Funktion | Syfte | Endpoint |
|----------|-------|----------|
| `aiChat` | Text-chat med AI | Callable |
| `aiParse` | Strukturerad JSON-parsing | Callable |
| `aiDeepResearch` | Multi-agent research | Callable |
| `aiToolResponse` | Tool response handling | Callable |
| `ocrLicensePlate` | Registreringsnummer OCR | Callable |
| `ocrReceipt` | Kvitto-scanning | Callable |
| `ocrVIN` | VIN-nummer OCR | Callable |
| `ocrServiceDocument` | Servicedokument OCR | Callable |

### Frontend Services (src/services/)

| Service | Status | Anteckningar |
|---------|--------|--------------|
| `aiProxyService.ts` | **NY** | Anropar Cloud Functions |
| `geminiService.ts` | Uppdaterad | Använder aiProxyService |
| `ocrService.ts` | Uppdaterad | Använder Cloud Functions |
| `aiService.ts` | Uppdaterad | Använder Cloud Functions |
| `secretService.ts` | **DEPRECATED** | Använd inte |

---

## 🚀 Projektöversikt

**Elton-VanPlan** är "The Garage OS" - ett digitalt verktyg för fordonsbyggare, restauratörer och entusiaster.

### Kärnfunktionalitet
- **🕵️‍♂️ Deep Research Agents:** AI-agenter som forskar fordonsdata
- **🤝 Co-Working:** Team-samarbete
- **🤖 Elton AI:** Persona-driven assistent med svenska dialekter
- **📋 Kanban Task Board:** Uppgiftshantering
- **💰 Smart Budget:** Kostnadsuppföljning
- **⏳ Visual Timeline:** Fordonets historia
- **🎙️ Live Elton:** Voice/Video AI-interface (beta - säkerhetsvarning)

---

## 📂 Projektstruktur

```
Elton-VanPlan/
├── functions/                    # 🆕 Firebase Cloud Functions
│   ├── src/
│   │   ├── index.ts              # Main exports
│   │   └── ai/
│   │       ├── proxy.ts          # AI proxy functions
│   │       └── ocr.ts            # OCR functions
│   ├── package.json
│   └── tsconfig.json
│
├── src/                          # Frontend source code
│   ├── components/               # React komponenter (23 st)
│   │   ├── Dashboard.tsx
│   │   ├── TaskBoard.tsx
│   │   ├── AIAssistant.tsx
│   │   ├── LiveElton.tsx         # ⚠️ Kräver säkerhetsuppdatering
│   │   └── ...
│   │
│   ├── services/                 # Core logic & external services
│   │   ├── aiProxyService.ts     # 🆕 Cloud Functions client
│   │   ├── geminiService.ts      # Refactored - använder proxy
│   │   ├── ocrService.ts         # Refactored - använder proxy
│   │   ├── aiService.ts          # Refactored - använder proxy
│   │   ├── secretService.ts      # ⚠️ DEPRECATED
│   │   ├── db.ts                 # Firestore CRUD
│   │   ├── auth.ts               # Firebase Auth
│   │   └── ...
│   │
│   ├── config/
│   │   ├── prompts.ts            # AI prompt templates
│   │   └── dialects.ts           # Svenska dialekter
│   │
│   ├── types/
│   │   └── types.ts              # ⚠️ Känslig fil - koordinera ändringar
│   │
│   └── ...
│
├── docs/                         # Dokumentation
│   ├── AI_DEVELOPMENT_GUIDE.md   # DENNA FIL
│   ├── PROJECT_ANALYSIS_REPORT.md
│   └── ...
│
├── e2e/                          # Playwright E2E tests
├── tests/                        # Unit tests
├── firebase.json                 # Firebase config (inkl. functions)
└── package.json
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.1** - UI framework
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool
- **Tailwind CSS 4.x** - Styling
- **Firebase SDK** - Auth, Firestore, Functions client

### Backend (Cloud Functions)
- **Firebase Functions 6.0** - Serverless backend
- **Node.js 18** - Runtime
- **@google/genai** - Gemini AI SDK
- **Secret Manager** - API key storage

### AI Integration
- **Google Gemini 2.5 Flash** - Via Cloud Functions
- Multi-agent system (Detective + Planner)
- Function calling
- Vision API

---

## 📝 Kodstandarder

### Import Paths - OBLIGATORISKT
```typescript
// ✅ RÄTT - Använd @ alias
import { Project } from '@/types/types';
import { sendChatMessage } from '@/services/aiProxyService';

// ❌ FEL - Använd INTE relativa paths
import { Project } from '../types';
```

### AI Service Calls - NY ARKITEKTUR
```typescript
// ✅ RÄTT - Använd aiProxyService
import { sendChatMessage, parseInput } from '@/services/aiProxyService';

const response = await sendChatMessage(history, message, systemPrompt);

// ❌ FEL - Direkt API-anrop i frontend
const ai = new GoogleGenAI(apiKey); // FÖRBJUDET
```

### TypeScript Types
Alla typer i `src/types/types.ts`:
```typescript
Project, Task, ShoppingItem, Contact, VehicleData, UserProfile
TaskStatus, Priority, CostType, Phase, ProjectType
```

---

## 🔐 Säkerhet

### ⚠️ VIKTIGT: API-nycklar

**ALDRIG** exponera API-nycklar i frontend-kod:

```typescript
// ❌ ABSOLUT FÖRBJUDET
const apiKey = import.meta.env.VITE_GEMINI_API_KEY;
const ai = new GoogleGenAI(apiKey);

// ✅ KORREKT - Använd Cloud Functions
import { sendChatMessage } from '@/services/aiProxyService';
await sendChatMessage(history, message, systemPrompt);
```

### LiveElton - Säkerhetsvarning

`LiveElton.tsx` använder fortfarande direkt API-nyckel för WebRTC.
**DENNA FEATURE SKA INTE ANVÄNDAS I PRODUKTION** tills token-baserad auth implementeras.

---

## 🧪 Testing

### Innan du committar
```bash
# 1. TypeScript check
npm run build

# 2. Unit tests
npm test

# 3. E2E (snabbcheck)
npm run test:e2e -- --project=chromium --grep "critical"
```

### Test Status
- Unit tests: 186 passing / 13 failing
- E2E tests: ~1175 tests

---

## 💡 Best Practices för AI-Agenter

### 1. Innan du kodar
- [ ] Läs denna guide
- [ ] `git fetch && git status`
- [ ] Kolla `docs/` för senaste ändringar
- [ ] Identifiera vilka filer du behöver ändra

### 2. När du kodar
- [ ] Använd `@/` alias för imports
- [ ] Använd Cloud Functions för AI-anrop
- [ ] Följ TypeScript patterns
- [ ] Hantera errors med try/catch

### 3. När du committar
- [ ] Tydligt commit message
- [ ] Inkludera AI-agent namn
- [ ] Peka ut breaking changes

### 4. Kommunikation med användaren
- Beskriv VARFÖR du gör ändringar, inte bara VAD
- Varna för potentiella konflikter
- Föreslå nästa steg

---

## 🔍 Vanliga Problem

### Problem: "Functions not deployed"
```bash
cd functions && npm install
firebase deploy --only functions
```

### Problem: "CORS error when calling Cloud Functions"
Verifiera att Firebase Functions är deployade och region matchar (`europe-west1`).

### Problem: "Permission denied"
Användaren måste vara autentiserad. Cloud Functions kräver `request.auth`.

---

## 📞 Kontakt & Samordning

**Projektägare:** Joel
**Branch-konvention:** `claude/feature-name-SESSION_ID`

**Vid konflikter:**
1. Stoppa arbetet
2. Meddela användaren
3. Vänta på instruktioner

---

## ✅ Checklista för AI-agenter

```
[ ] Har jag syncat med git fetch?
[ ] Använder jag @/ imports?
[ ] Använder jag Cloud Functions för AI?
[ ] Har jag testat med npm run build?
[ ] Är mitt commit message tydligt?
[ ] Har jag varnat för potentiella konflikter?
```

---

**Senast uppdaterad:** 2025-12-11
**Arkitekturversion:** 2.0 (Cloud Functions)
