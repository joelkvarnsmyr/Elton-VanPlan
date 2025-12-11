# 🤖 AI Development Guide - Elton VanPlan

**För AI-assistenter som arbetar med Elton-VanPlan projektet**

Detta dokument är en **systemprompt** och utvecklingsguide för AI-modeller (ChatGPT, Claude, Gemini, etc.) som hjälper till att utveckla, debugga och förbättra Elton-VanPlan.

---

## 🚀 Projektöversikt

**Elton-VanPlan** är "The Garage OS" - ett digitalt verktyg för fordonsbyggare, restauratörer och entusiaster. Plattformen kombinerar projekthantering, AI-driven forskning, och personlig assistent-funktionalitet specifikt designad för garage-projekt.

### Kärnfunktionalitet
- **🕵️‍♂️ Deep Research Agents:** AI-agenter som automatiskt forskar fram fordonsdata, service-intervaller och kända problem
- **🤝 Co-Working:** Team-samarbete med inbjudningar och delat ägarskap av projekt
- **🤖 Elton AI:** Persona-driven assistent med svenska dialekter och fordons-personlighet
- **📋 Kanban Task Board:** Uppgiftshantering med Smart Context (relevanta specs visas vid uppgifter)
- **💰 Smart Budget:** Kostnadsuppföljning med kvittohantering
- **⏳ Visual Timeline:** Fordonets historia från produktion till nu
- **🎙️ Live Elton:** Voice/Video AI-interface (kommande feature)

---

## 📂 Projektstruktur

```
Elton-VanPlan/
├── src/                          # All source code
│   ├── components/               # React komponenter (23 st)
│   │   ├── Dashboard.tsx         # Huvudvy med projekt-översikt
│   │   ├── TaskBoard.tsx         # Kanban board (drag & drop)
│   │   ├── AIAssistant.tsx       # Text chat med Elton
│   │   ├── LiveElton.tsx         # Voice/Video AI (beta)
│   │   ├── ProjectSelector.tsx   # Projekt-väljare med onboarding
│   │   ├── OnboardingWizard.tsx  # 3-stegs onboarding för nya projekt
│   │   ├── ProjectMembers.tsx    # Team management modal
│   │   ├── MagicImport.tsx       # AI-driven import av data
│   │   ├── VehicleSpecs.tsx      # Fordonsdata visning
│   │   ├── ShoppingList.tsx      # Inköpslista med budget
│   │   ├── FuelLog.tsx           # Bränslelogg
│   │   ├── ServiceBook.tsx       # Servicehistorik
│   │   ├── Roadmap.tsx           # Produktroadmap (kanban-baserad)
│   │   └── ...                   # Fler komponenter
│   │
│   ├── services/                 # Core logic & external services
│   │   ├── auth.ts               # Firebase Authentication
│   │   ├── db.ts                 # Firestore CRUD operations
│   │   ├── storage.ts            # Firebase Storage (bilder, kvitton)
│   │   ├── firebase.ts           # Firebase initialization
│   │   ├── geminiService.ts      # Google Gemini AI integration (multi-agent system)
│   │   ├── personalityService.ts # Fordonspersonlighet-generering
│   │   ├── promptBuilder.ts      # AI prompt construction
│   │   ├── expertAnalysisService.ts  # Deep Research 2.0 agent
│   │   ├── onboardingService.ts  # Onboarding wizard logic
│   │   ├── projectCreationService.ts # Projekt-skapande orchestration
│   │   ├── projectImportService.ts   # Import från JSON
│   │   ├── projectExportService.ts   # Export till JSON/PDF
│   │   ├── ocrService.ts         # OCR för regnummer & kvitton
│   │   ├── vehicleDataService.ts # Fordonsdata lookup
│   │   ├── featureFlagService.ts # Feature flags & A/B testing
│   │   └── analyticsService.ts   # Event tracking
│   │
│   ├── config/                   # Configuration & prompts
│   │   ├── prompts.ts            # AI prompt templates (THE BRAIN)
│   │   ├── promptTemplates.ts    # Template strings för personligheter
│   │   ├── dialects.ts           # Svenska dialekter (Dalmål, Gotländska, Rikssvenska)
│   │   ├── features.ts           # Feature metadata
│   │   └── brands.ts             # Multi-brand config (VanPlan, RaceKoll, etc)
│   │
│   ├── hooks/                    # React custom hooks
│   │   └── useVehiclePersonality.ts  # Hook för fordons-persona
│   │
│   ├── types/                    # TypeScript definitions
│   │   └── types.ts              # Alla interfaces & types
│   │
│   ├── constants/                # App constants
│   │   └── constants.ts          # EMPTY_PROJECT_TEMPLATE etc
│   │
│   ├── data/                     # Static data
│   │   ├── roadmapData.ts        # Roadmap features
│   │   └── metadata.json         # App metadata
│   │
│   ├── assets/                   # Static assets
│   │   ├── eltonlogo.svg         # App logo
│   │   └── democarimage.png      # Demo vehicle image
│   │
│   ├── App.tsx                   # Main app component
│   └── index.tsx                 # App entry point
│
├── e2e/                          # Playwright E2E tests
│   ├── coworking.spec.ts         # Co-working tests (65 tests)
│   ├── onboarding-flow.spec.ts   # Onboarding wizard tests
│   ├── ai-personality.spec.ts    # AI personality tests
│   ├── live-elton-*.spec.ts      # LiveElton feature tests
│   └── helpers/                  # Test helpers & selectors
│
├── tests/                        # Unit tests (Vitest)
│   └── onboarding-prompts.test.ts
│
├── docs/                         # Documentation (NYTT! Organiserat)
│   ├── project-management/       # Projekt-ledning
│   ├── features/                 # Feature specs
│   ├── testing/                  # Test-rapporter
│   ├── fixes/                    # Bug fix dokumentation
│   └── architecture/             # Arkitektur-analys
│
├── scripts/                      # Utility scripts
│   └── test-icon-generation.ts   # Icon generation testing
│
├── dist/                         # Build output (genereras av Vite)
├── .firebase/                    # Firebase build cache
├── test-results/                 # Playwright test results
├── playwright-report/            # Playwright HTML report
│
├── index.html                    # HTML entry point
├── vite.config.ts                # Vite configuration
├── tsconfig.json                 # TypeScript configuration
├── playwright.config.ts          # Playwright E2E config
├── vitest.config.ts              # Vitest unit test config
├── firebase.json                 # Firebase hosting config
├── firestore.rules               # Firestore security rules
├── storage.rules                 # Firebase Storage security rules
├── package.json                  # Dependencies & scripts
└── README.md                     # Project README
```

---

## 🛠️ Tech Stack

### Frontend
- **React 19.2.1** - UI framework
- **TypeScript 5.8.2** - Type safety
- **Vite 6.2.0** - Build tool & dev server
- **Tailwind CSS 4.x** - Styling (utility-first CSS)
- **Lucide React** - Icon library
- **Recharts** - Data visualization (budget graphs)
- **@dnd-kit** - Drag & drop (Kanban board)

### Backend (BaaS)
- **Firebase 12.6.0**
  - **Firestore** - NoSQL database
  - **Authentication** - Email/password & passwordless
  - **Storage** - Image & receipt uploads
  - **Hosting** - Production deployment

### AI Integration
- **Google Gemini 2.0 Flash** (`@google/genai 1.31.0`)
  - Multi-agent system (Detective + Planner)
  - Function calling (Google Search integration)
  - Vision API (image analysis)
  - Streaming responses
  - Live API (voice/video - beta)

### Testing
- **Vitest 4.0.15** - Unit testing
- **Happy-DOM 20.0.11** - DOM simulation for unit tests
- **Playwright 1.57.0** - E2E testing (Chrome, Firefox, Safari, Mobile)
- **@testing-library/react 16.3.0** - Component testing utilities

---

## 🧠 Viktiga Koncept

### 1. Multi-Project Architecture
Användare kan ha flera projekt (olika fordon). Varje projekt har:
- `Project` object med metadata, team members, vehicleData
- `Tasks` - uppgifter kopplade till projektet
- `ShoppingItems` - inköpslista med budget
- `FuelLog` - bränsleförbrukning
- `ServiceBook` - servicehistorik
- `Contacts` - mekaniker, verkstäder
- `KnowledgeArticles` - AI-genererade guider

### 2. Co-Working System
- **Owner** - Projektskapare (full access)
- **Members** - Inbjudna användare (shared access)
- **Invitations** - Email-baserade inbjudningar med accept/cancel
- Firestore security rules säkerställer access control

### 3. AI Personality System
Elton har en **fordons-driven personlighet**:
- **Åldersbaserad:** Veteran (30+ år), Erfaren (10-29 år), Modern (0-9 år)
- **Motor-baserad:** Diesel, Bensin, El, etc
- **Kylsystem:** Luftkyld vs Vattenkyld
- **Dialekter:** Standard, Dalmål, Gotländska, Rikssvenska
- **Användarkunskap:** Beginner, Intermediate, Expert

Se `src/services/personalityService.ts` och `src/config/promptTemplates.ts`

### 4. Deep Research 2.0 (Expert Analysis)
Multi-agent system som:
1. **Detective Agent** - Forskar fram fordonsdata (Google Search)
2. **Planner Agent** - Skapar projektplan baserat på research
3. **Expert Analysis** - Identifierar "The Killers" (kända problem)

Se `src/services/expertAnalysisService.ts`

### 5. Onboarding Wizard
3-stegs wizard för nya projekt:
1. **STEG 1:** Basic info (regnr, make, model, projectType, userSkillLevel)
2. **STEG 2:** AI Research (automated deep research)
3. **STEG 3:** Review & Confirm (edit AI-generated data)

Se `src/components/OnboardingWizard.tsx`

---

## 📝 Kodstandarder

### Import Paths
**ANVÄND ALLTID `@/` ALIAS** för imports:

```typescript
// ✅ RÄTT - Använd @ alias
import { Project } from '@/types/types';
import { streamGeminiResponse } from '@/services/geminiService';
import { DIALECTS } from '@/config/dialects';
import { useVehiclePersonality } from '@/hooks/useVehiclePersonality';

// ❌ FEL - Använd INTE relativa paths
import { Project } from '../types';
import { streamGeminiResponse } from '../../services/geminiService';
```

**Alias Configuration:**
- `vite.config.ts`: `'@': path.resolve(__dirname, './src')`
- `tsconfig.json`: `"@/*": ["./src/*"]`

### TypeScript Types
Alla typer finns i `src/types/types.ts`:

```typescript
// Core types
Project, Task, ShoppingItem, Contact, FuelLogItem, ServiceItem
VehicleData, UserProfile, ProjectInvitation

// Enums
TaskStatus, Priority, CostType, Phase, ProjectType, UserSkillLevel
```

### React Patterns
- **Functional Components** med TypeScript
- **Hooks** för state management (useState, useEffect)
- **Props interfaces** för varje component
- **Children props** för composition

```typescript
interface MyComponentProps {
  project: Project;
  onSave: (project: Project) => void;
  children?: React.ReactNode;
}

export const MyComponent: React.FC<MyComponentProps> = ({ project, onSave, children }) => {
  const [loading, setLoading] = useState(false);
  // ...
};
```

### Styling
- **Tailwind CSS** utility classes
- **Dark mode:** `dark:` prefix (dark mode hanteras via `<html class="dark">`)
- **Nordic theme colors:** `nordic-ice`, `nordic-charcoal`, `nordic-beige`, etc
- **Responsive:** `sm:`, `md:`, `lg:` breakpoints

```tsx
<div className="bg-nordic-ice dark:bg-nordic-dark-bg text-nordic-charcoal dark:text-nordic-dark-text p-4 rounded-lg shadow-md">
  {/* Content */}
</div>
```

---

## ☁️ Firebase Integration

### Firestore Structure
```
users/
  {userId}/
    profile: UserProfile

projects/
  {projectId}/
    data: Project
    owner: userId
    members: string[]
    createdAt: Timestamp

tasks/
  {taskId}/
    projectId: string
    data: Task

projectInvitations/
  {inviteId}/
    projectId: string
    email: string
    status: 'pending' | 'accepted' | 'cancelled'
```

### Security Rules
- Users can only read/write their own profile
- Projects: Owner + members have full access
- Tasks: Access via project membership
- Invitations: Recipient can accept/cancel

**SE:** `firestore.rules` och `storage.rules`

### Common DB Operations
```typescript
import { getProject, updateProject, getTasks, addTask } from '@/services/db';

// Hämta projekt
const project = await getProject(projectId);

// Uppdatera projekt
await updateProject(projectId, { name: 'New Name' });

// Hämta tasks
const tasks = await getTasks(projectId);

// Lägg till task
await addTask(projectId, newTask);
```

---

## 🧪 Testing

### Unit Tests (Vitest)
```bash
# Kör alla unit tests
npm test

# Kör specifik test
npm test -- personalityService

# Watch mode
npm test -- --watch
```

**Test files:** `src/**/__tests__/*.test.ts`

**Viktiga tester:**
- `personalityService.test.ts` - 66 tests ✅
- `promptBuilder.test.ts` - 62 tests ✅
- `promptTemplates.test.ts` - 47 tests ✅
- `onboarding-prompts.test.ts` - 30 tests ✅

**Test coverage status:** Se `docs/testing/TEST_RAPPORT.md`

### E2E Tests (Playwright)
```bash
# Kör alla E2E tests
npm run test:e2e

# Interactive UI mode (REKOMMENDERAS)
npm run test:e2e:ui

# Debug mode
npm run test:e2e:debug

# Endast Chrome
npm run test:e2e -- --project=chromium

# Specific test
npm run test:e2e -- -g "should display Users button"
```

**Test files:** `e2e/*.spec.ts`

**Viktiga tests:**
- `coworking.spec.ts` - 65 tests (team management)
- `onboarding-flow.spec.ts` - Onboarding wizard
- `ai-personality.spec.ts` - AI personality adaptation
- `live-elton-integration.spec.ts` - Voice/Video UI

---

## 🐛 Vanliga Problem & Lösningar

### Problem 1: Import Errors
**Symptom:** `Failed to resolve import "../types"`

**Lösning:**
```bash
# Använd @ alias istället
import { Project } from '@/types/types';
```

### Problem 2: Firebase Permission Denied
**Symptom:** `FirebaseError: Missing or insufficient permissions`

**Lösning:**
1. Kontrollera Firestore Rules (`firestore.rules`)
2. Verifiera att användaren är inloggad
3. Kontrollera att användaren är owner eller member av projektet

### Problem 3: Gemini API Rate Limit
**Symptom:** `429 Too Many Requests`

**Lösning:**
```typescript
// Implementera retry logic med exponential backoff
const response = await streamGeminiResponse(prompt, {
  retryAttempts: 3,
  retryDelay: 1000
});
```

### Problem 4: Dark Mode Styling Issues
**Symptom:** Colors ser fel ut i dark mode

**Lösning:**
```tsx
// Använd dark: prefix för alla färger
className="bg-white dark:bg-nordic-dark-bg text-black dark:text-nordic-dark-text"
```

### Problem 5: Test Timeouts
**Symptom:** E2E tests timeout after 30s

**Lösning:**
```typescript
// Öka timeout i playwright.config.ts
use: {
  actionTimeout: 30000, // 30s per action
},
timeout: 60000, // 60s per test
```

---

## 💡 Best Practices

### 1. Innan du kodar
- ✅ Läs relevant kod i `src/` först
- ✅ Kolla befintliga patterns i liknande komponenter
- ✅ Verifiera att types finns i `src/types/types.ts`
- ✅ Kolla om det finns tests för liknande funktionalitet

### 2. När du skriver kod
- ✅ Använd `@/` alias för alla imports
- ✅ Följ befintlig TypeScript-struktur
- ✅ Lägg till JSDoc comments för komplexa funktioner
- ✅ Använd Tailwind CSS (inga inline styles)
- ✅ Hantera loading states (`useState<boolean>`)
- ✅ Hantera error states (`try/catch` med user-friendly messages)

### 3. När du testar
- ✅ Kör `npm run build` för att verifiera TypeScript
- ✅ Kör `npm test` för unit tests
- ✅ Kör `npm run test:e2e -- --project=chromium` för snabb E2E check
- ✅ Testa dark mode manuellt

### 4. När du committar
- ✅ Beskrivande commit messages (svenska eller engelska OK)
- ✅ Gruppera relaterade ändringar
- ✅ Inkludera test updates om du ändrat functionality

---

## 🔑 Environment Variables

**`.env` file:**
```env
# Gemini API Key (REQUIRED)
VITE_GEMINI_API_KEY=your_key_here

# Firebase Config (optional, kan hardcodas i firebase.ts)
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
```

**VIKTIGT:** Lägg ALDRIG till `.env` i git! (redan i `.gitignore`)

---

## 📚 Resurser & Dokumentation

### Intern Dokumentation
- **README.md** - Projektöversikt & getting started
- **docs/testing/TEST_RAPPORT.md** - Omfattande test-rapport
- **docs/features/** - Feature specifications
- **docs/architecture/** - Arkitektur-analys
- **e2e/README.md** - E2E test dokumentation

### External Documentation
- [React Docs](https://react.dev)
- [TypeScript Docs](https://www.typescriptlang.org/docs/)
- [Vite Docs](https://vite.dev)
- [Tailwind CSS Docs](https://tailwindcss.com)
- [Firebase Docs](https://firebase.google.com/docs)
- [Gemini API Docs](https://ai.google.dev/gemini-api/docs)
- [Playwright Docs](https://playwright.dev)

---

## 🔄 Development Workflow

### 1. Starta Dev Server
```bash
npm run dev
# Öppnar http://localhost:3000
```

### 2. Gör ändringar
- Editera filer i `src/`
- Hot reload fungerar automatiskt

### 3. Testa lokalt
```bash
# TypeScript check
npm run build

# Unit tests
npm test

# E2E tests (snabb check)
npm run test:e2e -- --project=chromium -g "critical test"
```

### 4. Deploy
```bash
# Build
npm run build

# Deploy till Firebase (om configured)
firebase deploy
```

---

## 🤖 För AI-assistenter: Hur du hjälper bäst

### När användaren ber om hjälp med...

#### **Bug Fixing**
1. Läs felmedelandet noggrant
2. Leta i relevanta filer (`@/services/`, `@/components/`)
3. Kolla om det finns tests som kan reproducera buggen
4. Föreslå fix med kodexempel
5. Förklara WHY buggen uppstod

#### **Ny Feature**
1. Fråga om detaljer (vilka komponenter, services påverkas?)
2. Föreslå implementation approach
3. Identifiera dependencies (types, services, etc)
4. Ge kod-exempel med `@/` imports
5. Föreslå tests som bör skrivas

#### **Refactoring**
1. Förstå befintlig kod först
2. Identifiera patterns som redan används
3. Föreslå ändringar som följer existing patterns
4. Peka ut potentiella breaking changes
5. Föreslå test-uppdateringar

#### **Testing**
1. Kolla `docs/testing/TEST_RAPPORT.md` för status
2. Identifiera untested code
3. Föreslå test cases (unit eller E2E)
4. Ge kod-exempel för tests
5. Förklara vad som testas och varför

#### **Performance Optimization**
1. Identifiera bottlenecks (stora bundle sizes, re-renders)
2. Föreslå React.memo, useMemo, useCallback
3. Föreslå code splitting (dynamic imports)
4. Föreslå lazy loading av komponenter

---

## 🔍 Felsökning & Debugging

### TypeScript Errors
```bash
# Check all TypeScript errors
npx tsc --noEmit
```

### Vite Build Errors
```bash
# Verbose build
npm run build -- --debug
```

### Firebase Errors
```typescript
// Debug Firestore queries
import { enableIndexedDbPersistence } from 'firebase/firestore';
enableIndexedDbPersistence(db)
  .catch((err) => {
    console.error('Firestore persistence error:', err);
  });
```

### Gemini API Errors
```typescript
// Debug AI responses
console.log('Prompt:', prompt);
console.log('Response:', await model.generateContent(prompt));
```

---

## 📊 Projektmetrik (uppdaterad 2025-01-09)

- **Total kod:** ~50,000 lines
- **Komponenter:** 23 React components
- **Services:** 18 service modules
- **Unit tests:** 186 passing (13 failing)
- **E2E tests:** ~1175 tests across 5 browsers
- **Test coverage:** ~28% (services), 0% (components)
- **Build time:** ~13s
- **Bundle size:** 1.8 MB (minified)

---

## ✅ Checklista för AI-assistenter

Innan du ger ett svar, verifiera:
- [ ] Har du läst relevant kod i projektet?
- [ ] Använder ditt kodexempel `@/` imports?
- [ ] Följer ditt kodexempel TypeScript best practices?
- [ ] Är ditt kodexempel kompatibelt med befintlig arkitektur?
- [ ] Har du förklarat WHY, inte bara HOW?
- [ ] Har du pekat ut potentiella problem/risks?
- [ ] Har du föreslagit tests om relevant?

---

## 📞 Support & Kontakt

**Projektägare:** Joel (Supervisor)
**AI Team:** ChatGPT, Claude, Gemini
**GitHub Issues:** [github.com/yourusername/elton-vanplan/issues](https://github.com)

**För frågor:**
1. Kolla denna guide först
2. Kolla `docs/` för specifik dokumentation
3. Läs relevant kod i `src/`
4. Fråga projektägaren om du är osäker

---

**Lycka till med utvecklingen! 🚀**

*Denna guide uppdateras kontinuerligt. Senast uppdaterad: 2025-01-09*
