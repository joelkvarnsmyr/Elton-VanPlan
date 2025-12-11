/**
 * ROADMAP DATA
 * Uppdaterad: 2025-12-11 (Data Model Migration komplett)
 *
 * Strukturerad i faser:
 * - Fas 1: Akut (Kritiska buggar och säkerhetsproblem)
 * - Fas 2: Kortsiktigt (Närmaste 1-2 månader)
 * - Fas 3: Medelsiktigt (2-4 månader)
 * - Fas 4: Långsiktigt (Framtida utveckling)
 */

export interface ChecklistItem {
    label: string;
    completed: boolean;
    inProgress?: boolean;
    startedAt?: string;
    completedAt?: string;
}

export interface Feature {
    id: number;
    title: string;
    description: string;
    detailedDescription?: string;
    purpose: string;
    tech: string | string[];
    status: 'done' | 'in-progress' | 'planned' | 'blocked';
    checklist: ChecklistItem[];
    category: string;
    priority?: 'critical' | 'high' | 'medium' | 'low';
    phase?: 1 | 2 | 3 | 4;
    estimatedCompletion?: string;
    tags?: string[];
    demoUrl?: string;
    githubIssue?: string;
    blockedBy?: number[];
}

export const ROADMAP_PHASES = {
    1: { name: 'Fas 1: Akut', description: 'Kritiska buggar och säkerhetsproblem', color: 'rose' },
    2: { name: 'Fas 2: Kortsiktigt', description: 'Närmaste 1-2 månader', color: 'amber' },
    3: { name: 'Fas 3: Medelsiktigt', description: '2-4 månader', color: 'blue' },
    4: { name: 'Fas 4: Långsiktigt', description: 'Framtida utveckling', color: 'slate' }
};

export const ROADMAP_FEATURES: Feature[] = [
    // ============================================
    // FAS 1: AKUT - Kritiska buggar och säkerhet
    // ============================================
    {
        id: 100,
        title: 'Säkerhet: Flytta API-nycklar till Backend',
        category: 'Säkerhet',
        phase: 1,
        description: 'KRITISKT: Gemini API-nyckel exponeras i frontend. Måste flyttas till Cloud Functions.',
        detailedDescription: 'Arbete pågår. De flesta anrop har flyttats till Cloud Functions, men komponenten LiveElton.tsx använder fortfarande nyckeln direkt och måste åtgärdas.',
        purpose: 'Förhindra obehörig användning av API-nycklar och potentiella kostnader.',
        status: 'in-progress',
        tech: ['Firebase Cloud Functions', 'Secret Manager', 'API Gateway'],
        priority: 'critical',
        tags: ['Security', 'Backend', 'Critical'],
        checklist: [
            { label: 'Skapa Cloud Function för AI-proxy', completed: true },
            { label: 'Flytta API-nyckel till Secret Manager', completed: true },
            { label: 'Uppdatera frontend att anropa Cloud Function', completed: true },
            { label: 'Åtgärda LiveElton.tsx', completed: false, inProgress: true },
            { label: 'Ta bort VITE_GEMINI_API_KEY helt', completed: false },
            { label: 'Testa i produktion', completed: false }
        ]
    },
    {
        id: 102,
        title: 'Kritiska Enhetstester',
        category: 'Testing',
        phase: 1,
        description: 'Saknas tester för kritiska moduler: geminiService, db, auth. Måste läggas till.',
        detailedDescription: 'Nuvarande testning täcker huvudsakligen E2E för co-working. Kritisk affärslogik i geminiService.ts, db.ts, och auth.ts saknar helt enhetstester vilket skapar hög risk vid ändringar.',
        purpose: 'Säkerställa att kritisk funktionalitet inte går sönder vid ändringar.',
        status: 'planned',
        tech: ['Vitest', 'Mock Service Worker', 'Firebase Emulators'],
        priority: 'high',
        tags: ['Testing', 'Quality', 'Foundation'],
        checklist: [
            { label: 'Tester för geminiService.ts', completed: false },
            { label: 'Tester för db.ts (CRUD)', completed: false },
            { label: 'Tester för auth.ts', completed: false },
            { label: 'Setup Firebase Emulators', completed: false },
            { label: 'CI/CD integration', completed: false }
        ]
    },
    {
        id: 103,
        title: 'Städa prototype_app',
        category: 'Teknisk Skuld',
        phase: 1,
        description: 'Duplicerad kod i prototype_app/ skapar förvirring och underhållsbörda.',
        detailedDescription: 'Mappen prototype_app/ innehåller en äldre version av applikationen med överlappande komponenter och services. Detta leder till förvirring och risk för att ändringar görs på fel ställe.',
        purpose: 'Reducera teknisk skuld och förenkla kodbas.',
        status: 'in-progress',
        tech: ['Git', 'Cleanup'],
        priority: 'medium',
        tags: ['TechDebt', 'Cleanup'],
        checklist: [
            { label: 'Verifiera att allt är migrerat', completed: true },
            { label: 'Ta bort från main', completed: false, inProgress: true },
            { label: 'Verifiera att inga beroenden finns kvar', completed: false },
            { label: 'Uppdatera dokumentation', completed: false }
        ]
    },

    // ============================================
    // DONE FEATURES (Fas markerad men irrelevant)
    // ============================================
    {
        id: 1,
        title: 'Plattforms-arkitektur (SaaS)',
        category: 'Infrastruktur',
        description: 'Vi har byggt om appen från en enkel "en-sidas-app" för en bil till en plattform som hanterar Användare och Flera Projekt.',
        detailedDescription: 'Komplett transformation från statisk single-page app till en fullständig SaaS-plattform. Inkluderar multi-tenant arkitektur, användarhantering, projekthantering, och cloud sync mellan enheter.',
        purpose: 'Grundläggande krav för skalbarhet. Möjliggör synk mellan enheter.',
        status: 'done',
        tech: ['Firebase Auth', 'Firestore', 'Security Rules', 'Multi-tenant'],
        priority: 'high',
        tags: ['Foundation', 'SaaS', 'Auth', 'Database'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (DB & Auth)', completed: true },
            { label: 'Testad (Flera projekt)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 24,
        title: 'Co-working & Teams',
        category: 'Infrastruktur',
        description: 'Bjud in medmekaniker eller familj till dina projekt. Hantera rättigheter och bygg tillsammans i realtid. Fullt testad med Playwright E2E-tester (65 tester över 5 webbläsare).',
        detailedDescription: 'Fullständig team-collaboration feature med inbjudningar via e-post, rollhantering (owner/member), säkerhetsregler i Firestore, och ProjectMembers UI-komponent. Omfattande E2E-testning säkerställer kvalitet.',
        purpose: 'Bilbyggande är ofta en social aktivitet. Appen måste stödja samarbete.',
        status: 'done',
        tech: ['Firestore Security Rules', 'Invite System', 'Playwright', 'E2E Tests'],
        priority: 'high',
        tags: ['Collaboration', 'Testing', 'E2E', 'Security'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (DB & UI)', completed: true },
            { label: 'Säkerhetstestad', completed: true },
            { label: 'E2E-testad (Playwright)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 26,
        title: 'E2E Test Suite med Playwright',
        category: 'Infrastruktur',
        description: 'Komplett automatisk testning av alla kritiska funktioner i appen. Tester körs i Chrome, Firefox, Safari samt mobila enheter.',
        detailedDescription: '65 automatiska tester som verifierar Co-working, UI-komponenter, formulär, dark mode, och responsiv design. Konfigurerad med screenshot-on-failure, video recording, och CI/CD integration.',
        purpose: 'Säkerställa kvalitet och stabilitet vid varje deploy. Förhindra regressions-buggar.',
        status: 'done',
        tech: ['Playwright', 'TypeScript', 'Visual Testing', 'CI/CD'],
        priority: 'high',
        tags: ['Testing', 'Quality', 'Automation', 'CI/CD'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Konfigurerad (Playwright)', completed: true },
            { label: 'Co-working tests (65 tester)', completed: true },
            { label: 'Firebase Auth setup', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 23,
        title: 'Feature Flags & Versionshantering',
        category: 'Infrastruktur',
        description: 'System för att slå på/av funktioner utan att deploya om. Versionshantering av AI-prompter.',
        detailedDescription: 'Config-driven feature flag system som tillåter gradvis utrullning av nya features, A/B-testning, och snabb rollback. Versionering av AI-prompts för att kunna testa och jämföra olika modeller.',
        purpose: 'Säker utrullning och A/B-testning av nya AI-modeller.',
        status: 'done',
        tech: ['Config-based System', 'Feature Toggles'],
        priority: 'medium',
        tags: ['DevOps', 'A/B Testing', 'Configuration'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Config)', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 2,
        title: 'AI Onboarding "Deep Research"',
        category: 'Plattform',
        description: 'Multi-Agent system (Detektiven & Verkmästaren) som söker upp fakta och skapar en plan baserat på RegNr.',
        detailedDescription: 'Avancerat AI-system med två agenter: Detektiven söker teknisk data och kända problem via Google Search och svenska register, medan Verkmästaren skapar en detaljerad projektplan baserat på denna research.',
        purpose: 'Hög precision och slut på gissningar. Hämtar data från svenska register.',
        status: 'done',
        tech: ['Gemini 2.0 Flash', 'Google Search', 'Multi-Agent System', 'Prompt Engineering'],
        priority: 'high',
        tags: ['AI', 'Onboarding', 'Multi-Agent', 'Automation'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Agents & Prompts)', completed: true },
            { label: 'Testad (Live Search)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 17,
        title: 'Auto-genererad Historik & Expertanalys',
        category: 'Plattform',
        description: 'AI:n identifierar "Kända fel" (The Killers), ger tips om modifieringar och analyserar mätarställning.',
        detailedDescription: 'Expertanalys-rapport som genereras automatiskt vid projekt-skapande. Inkluderar kända problem för specifik modell, populära modifieringar, varningar för potentiella kostsamma fel.',
        purpose: 'Ger omedelbart expertkunskap och varnar för dyra fällor.',
        status: 'done',
        tech: ['Gemini 2.0', 'Prompt Engineering', 'Knowledge Base'],
        priority: 'high',
        tags: ['AI', 'Expert Analysis', 'Knowledge', 'Prevention'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 3,
        title: 'Bildigenkänning av Regplåt',
        category: 'AI Core',
        description: 'Fota bilen för att starta projektet. AI:n hittar och läser av registreringsskylten.',
        detailedDescription: 'OCR-funktionalitet med Gemini Vision som automatiskt detekterar och läser av svenska registreringsskyltar från foton.',
        purpose: 'Smidig onboarding utan att behöva knappa in nummer.',
        status: 'done',
        tech: ['Gemini Vision', 'OCR', 'Image Processing'],
        priority: 'high',
        tags: ['Vision', 'OCR', 'Onboarding', 'UX'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 5,
        title: 'Google Search-integration',
        category: 'AI Core',
        description: 'AI:n kan söka på webben efter priser, manualer och fakta i realtid.',
        detailedDescription: 'Real-time sökning via Gemini Tools API. AI:n kan dynamiskt söka efter aktuella priser, tekniska manualer, och forum-diskussioner.',
        purpose: 'Går från gissningar till fakta.',
        status: 'done',
        tech: ['Gemini Tools', 'Google Search API', 'Real-time Data'],
        priority: 'high',
        tags: ['Search', 'Real-time', 'Integration', 'Data'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 7,
        title: 'Dialekter & Personligheter',
        category: 'AI Core',
        description: 'Elton kan prata dalmål, gotländska eller rikssvenska.',
        detailedDescription: 'Konfigurerbar AI-persona med olika svenska dialekter och personligheter. Skapar en roligare och mer personlig upplevelse.',
        purpose: 'Skapar en relation och gör appen roligare.',
        status: 'done',
        tech: ['System Prompts', 'Personality Config', 'Localization'],
        priority: 'low',
        tags: ['Personality', 'UX', 'Localization', 'Fun'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Config & UI)', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 10,
        title: 'Magic Import (Text & Bild)',
        category: 'Projektledning',
        description: 'Klistra in anteckningar eller fota en handskriven lista för att skapa uppgifter.',
        detailedDescription: 'Multimodal import där användare kan klistra in text från forum/manualer eller fotografera handskrivna listor. AI:n extraherar uppgifter med titlar, beskrivningar, och kostnader.',
        purpose: 'Minskar administrationen avsevärt.',
        status: 'done',
        tech: ['Gemini Vision', 'OCR', 'NLP', 'Task Extraction'],
        priority: 'high',
        tags: ['Productivity', 'Vision', 'OCR', 'Automation'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 21,
        title: 'Flexibla Faser & Idébank',
        category: 'Projektledning',
        description: 'Projekt kan nu ha olika typer (Renovering, Bygge, Underhåll) med anpassade faser.',
        detailedDescription: 'Dynamiskt fas-system där olika projekttyper har skräddarsydda work stages. "Drömbank" är en sandbox för idéer.',
        purpose: 'Stödja alla typer av bilägande, inte bara renovering.',
        status: 'done',
        tech: ['Dynamic Types', 'Filtering', 'State Management'],
        priority: 'high',
        tags: ['Project Types', 'Flexibility', 'Organization', 'UX'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 9,
        title: 'Smart Inköpslista & Kvitton',
        category: 'Ekonomi',
        description: 'En separat vy för inköp med kvittoscanning och budgetuppföljning.',
        detailedDescription: 'Komplett shoppinglist-system med receipt scanning via Vision API, automatisk kostnadskoppling till tasks, och budgetuppföljning.',
        purpose: 'Total kontroll på ekonomin.',
        status: 'done',
        tech: ['Firebase Storage', 'Gemini Vision', 'OCR', 'Budget Tracking'],
        priority: 'high',
        tags: ['Shopping', 'Receipts', 'Budget', 'Finance', 'OCR'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 12,
        title: 'Kunskapsbanken & Markdown-läsare',
        category: 'Kunskap',
        description: 'Ett bibliotek med tunga tekniska rapporter (markdown) som AI:n kan läsa och citera.',
        detailedDescription: 'RAG-system där AI:n har tillgång till en kunskapsbas med tekniska guider och service-manualer.',
        purpose: 'Att säkra kvalitén.',
        status: 'done',
        tech: ['RAG', 'React Markdown', 'Knowledge Base'],
        priority: 'high',
        tags: ['RAG', 'Knowledge', 'Markdown', 'Quality'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 13,
        title: 'Tidslinje & Historik',
        category: 'Garage',
        description: 'En visuell tidslinje som visar bilens hela liv.',
        detailedDescription: 'Interactive timeline med Recharts som visualiserar bilens historia från tillverkning till nuvarande status.',
        purpose: 'Att ge perspektiv och hedra bilens historia.',
        status: 'done',
        tech: ['Recharts', 'Timeline UI', 'Data Visualization'],
        priority: 'medium',
        tags: ['History', 'Timeline', 'Visualization', 'UX'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 14,
        title: 'Bränslelogg & Servicebok',
        category: 'Garage',
        description: 'Logga tankningar och service. Visualisera förbrukning och serviceintervall.',
        detailedDescription: 'Fuel log och service book med full CRUD, grafer över förbrukningstrend, och service-påminnelser.',
        purpose: 'Ett praktiskt verktyg för det dagliga ägandet.',
        status: 'done',
        tech: ['Firestore', 'Recharts', 'Analytics', 'Timeline UI'],
        priority: 'medium',
        tags: ['Fuel', 'Service', 'Analytics', 'Maintenance'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'UI-komponenter', completed: true },
            { label: 'Grafer', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 15,
        title: 'Backup & Export',
        category: 'Data',
        description: 'Möjlighet att spara ner hela projektet som en JSON-fil.',
        detailedDescription: 'Full projekt-export som JSON blob. OBS: Import är ännu inte implementerad (se Fas 1).',
        purpose: 'Datasäkerhet och portabilitet.',
        status: 'done',
        tech: ['JSON Export', 'File API', 'Data Portability'],
        priority: 'high',
        tags: ['Data', 'Security', 'Export', 'Backup'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Export utvecklad', completed: true },
            { label: 'Import (se ID 101)', completed: false },
            { label: 'Lanserad', completed: true }
        ]
    },

    // ============================================
    // FAS 2: KORTSIKTIGT - Närmaste 1-2 månader
    // ============================================
    {
        id: 27,
        title: 'Databas-migrering: Sub-collections & Ownership',
        category: 'Infrastruktur',
        phase: 2,
        description: 'Komplett datamodel-uppgradering: Sub-collections, multi-owner, blockers, och Cloud Function triggers.',
        detailedDescription: 'Migrering från monolitisk dokumentstruktur till hierarkisk struktur. Inkluderar: (1) Multi-owner support med ownerIds[], primaryOwnerId, memberIds[], (2) Sub-collections för tasks, shoppingList, serviceLog, fuelLog, knowledgeBase, (3) TaskBlocker-system med dependencies, (4) Cloud Function triggers för automatisk unblocking. Se docs/architecture/DATA_MODEL_MIGRATION.md.',
        purpose: 'Skalbarhet, prestanda, och stöd för samarbete.',
        status: 'done',
        tech: ['Firestore Sub-collections', 'Cloud Functions Triggers', 'Multi-owner Model'],
        priority: 'high',
        tags: ['Database', 'Architecture', 'Scalability', 'Performance'],
        checklist: [
            { label: 'Specad (DATA_MODEL_MIGRATION.md)', completed: true, completedAt: '2025-12-11' },
            { label: 'Fas 1: Ownership-modell (ownerIds, primaryOwnerId)', completed: true, completedAt: '2025-12-11' },
            { label: 'Fas 2: Sub-collections (serviceLog, fuelLog, knowledgeBase)', completed: true, completedAt: '2025-12-11' },
            { label: 'Fas 3: Cloud Function triggers (onTaskComplete, onTaskDelete, onProjectDelete)', completed: true, completedAt: '2025-12-11' },
            { label: 'Firestore Security Rules uppdaterade', completed: true, completedAt: '2025-12-11' },
            { label: 'Testad (TypeScript check)', completed: true, completedAt: '2025-12-11' }
        ]
    },
    {
        id: 107,
        title: 'Transfer Project Ownership',
        category: 'UX/Teams',
        phase: 2,
        description: 'Allows a project owner to transfer ownership to another team member. Replaces the old Import/Export feature.',
        detailedDescription: 'Instead of a file-based import/export, this feature allows a seamless transfer of a project to another user within the platform. This is crucial for when a vehicle is sold or project responsibility changes. Backend-logik (Cloud Function) är klar, UI återstår.',
        purpose: 'Provide a secure and integrated way to hand over project ownership.',
        status: 'in-progress',
        tech: ['Firebase Cloud Functions', 'Firestore Transactions', 'React'],
        priority: 'medium',
        tags: ['UX', 'Teams', 'Ownership', 'Data'],
        checklist: [
            { label: 'Specifikation skriven (PROJECT_TRANSFER_SPEC.md)', completed: true },
            { label: 'Cloud Function (transferProjectOwnership)', completed: true, completedAt: '2025-12-10' },
            { label: 'db.ts helpers (addCoOwner, removeCoOwner, transferPrimaryOwnership)', completed: true, completedAt: '2025-12-11' },
            { label: 'Firestore Security Rules (multi-owner)', completed: true, completedAt: '2025-12-11' },
            { label: 'Implementera UI i Project Settings', completed: false, inProgress: true },
            { label: 'Testa överföringsflödet', completed: false }
        ]
    },
    {
        id: 6,
        title: 'Live Elton (Röst & Video)',
        category: 'AI Core',
        phase: 2,
        description: 'Prata med Elton i realtid via kameran ("Ring upp"). Frontend finns, backend-integration saknas.',
        detailedDescription: 'Real-time video/voice-chat med AI. Kräver WebRTC och Gemini Live API integration.',
        purpose: 'En mekaniker-kompis i fickan när händerna är oljiga.',
        status: 'in-progress',
        tech: ['WebRTC', 'Gemini Live API', 'Video Streaming', 'Voice Recognition'],
        priority: 'high',
        tags: ['WebRTC', 'Voice', 'Video', 'Real-time', 'Diagnostics'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Frontend utvecklad', completed: true },
            { label: 'WebRTC-integration', completed: false, inProgress: true },
            { label: 'Gemini Live API koppling', completed: false },
            { label: 'Testad (Live Connection)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 8,
        title: 'Ljud-Doktorn (Audio Diagnostik)',
        category: 'AI Core',
        phase: 2,
        description: 'AI lyssnar på motorljud och ställer diagnos. Prompt-system klart, frontend-integration saknas.',
        detailedDescription: 'Audio-baserad diagnostik där AI analyserar motorljud. Använder Gemini:s audio processing.',
        purpose: 'Löser problemet "Vad är det som låter?".',
        status: 'in-progress',
        tech: ['Audio Processing', 'Gemini Audio', 'Signal Analysis', 'Web Audio API'],
        priority: 'medium',
        tags: ['Audio', 'Diagnostics', 'AI', 'Analysis'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Prompt utvecklad', completed: true },
            { label: 'Mikrofon-access', completed: false, inProgress: true },
            { label: 'Audio streaming', completed: false },
            { label: 'UI för diagnos', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 28,
        title: 'Elton Inspector (AI Besiktning)',
        category: 'Plattform',
        phase: 2,
        description: 'AI-assisterad fordonsbesiktning ("Snap & Triage") med bild- och ljudanalys.',
        detailedDescription: 'Användaren fotar problemområden och AI:n ger diagnos, allvarlighetsgrad, och åtgärdsförslag. Se docs/features/INSPECTOR_SPEC.md.',
        purpose: 'Professionell bedömning av fordonets skick utan att vara expert.',
        status: 'planned',
        tech: ['Gemini Vision', 'Audio Analysis', 'Investigation Logic Tree'],
        priority: 'medium',
        tags: ['AI', 'Vision', 'Audio', 'Diagnostics', 'Mobile'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Datamodell (Findings)', completed: true },
            { label: 'AI-Prompt (Inspector)', completed: true },
            { label: 'Utvecklad (UI & Logic)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 104,
        title: 'Förbättrad Felhantering',
        category: 'UX',
        phase: 2,
        description: 'Centralisera felmeddelanden, lägg till Error Boundaries, förbättra user feedback.',
        detailedDescription: 'Nuvarande felhantering är inkonsekvent. Behöver centraliserad error handling med Error Boundaries.',
        purpose: 'Bättre användarupplevelse vid fel.',
        status: 'planned',
        tech: ['React Error Boundary', 'Error Tracking', 'Toast System'],
        priority: 'medium',
        tags: ['UX', 'Quality', 'Error Handling'],
        checklist: [
            { label: 'Skapa central error service', completed: false },
            { label: 'Implementera Error Boundaries', completed: false },
            { label: 'Centralisera toast-hantering', completed: false },
            { label: 'Lägg till error tracking', completed: false }
        ]
    },

    // ============================================
    // FAS 3: MEDELSIKTIGT - 2-4 månader
    // ============================================
    {
        id: 108,
        title: 'Revision History & Undo',
        category: 'Data',
        phase: 3,
        description: 'Utreda och implementera versionshistorik för projekt med möjlighet att ångra ändringar.',
        detailedDescription: 'Spara snapshots av projektdata vid viktiga förändringar. Möjliggör ångra-funktion och se historik över ändringar. Tekniska alternativ: (1) Firestore document versions, (2) Snapshot-collection, (3) Event Sourcing. Behöver utredas.',
        purpose: 'Säkerhetsnät för oavsiktliga ändringar och transparent historik.',
        status: 'planned',
        tech: ['Firestore', 'Event Sourcing', 'Data Versioning'],
        priority: 'medium',
        tags: ['Data', 'UX', 'Safety', 'History'],
        checklist: [
            { label: 'Utreda tekniska alternativ', completed: false },
            { label: 'Skriva specifikation', completed: false },
            { label: 'Implementera snapshot-system', completed: false },
            { label: 'Bygga UI för historik-visning', completed: false },
            { label: 'Testa och lansera', completed: false }
        ]
    },
    {
        id: 16,
        title: 'Offline-stöd (PWA)',
        category: 'Infrastruktur',
        phase: 3,
        description: 'Gör appen till en Progressive Web App som fungerar utan nätverk.',
        detailedDescription: 'PWA-implementation med service workers, offline caching, och background sync.',
        purpose: 'Ett garage har ofta dålig täckning. Appen måste fungera offline.',
        status: 'planned',
        tech: ['Vite PWA Plugin', 'Firestore Persistence', 'Service Workers'],
        priority: 'high',
        blockedBy: [27],
        tags: ['PWA', 'Offline', 'Mobile', 'Performance'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Firestore offline persistence', completed: false },
            { label: 'Service Worker setup', completed: false },
            { label: 'App manifest', completed: false },
            { label: 'Testad (Flygplansläge)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 11,
        title: 'Smart Context & Beslutsstöd',
        category: 'Projektledning',
        phase: 3,
        description: 'Visar automatiskt relevant data (t.ex. däckdimensioner) inne på en uppgift.',
        detailedDescription: 'Context-aware UI som visar fordonsdata när man arbetar med specifika uppgifter.',
        purpose: 'Just-in-time information. Slipp leta i papper.',
        status: 'planned',
        tech: ['Context Awareness', 'Smart UI', 'Data Matching'],
        priority: 'medium',
        tags: ['Context', 'AI', 'UX', 'Productivity'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Definiera context-triggers', completed: false },
            { label: 'Utvecklad', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 4,
        title: 'AI-genererad Projektikon (Nano Banana)',
        category: 'AI Core',
        phase: 3,
        description: 'AI ritar en stiliserad flat design-ikon av din bil. BLOCKAD: Väntar på SDK-support.',
        detailedDescription: 'AI-driven bildgenerering. Väntar på @google/genai SDK-stöd för image generation.',
        purpose: 'Personligt och proffsigt utseende på projektet.',
        status: 'blocked',
        tech: ['Gemini Image Generation', 'Flat Design'],
        priority: 'low',
        tags: ['AI', 'Design', 'Image', 'Blocked'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Prompt utvecklad', completed: true },
            { label: 'BLOCKED: SDK-support', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 105,
        title: 'Integrationstester',
        category: 'Testing',
        phase: 3,
        description: 'Komplettera testsviten med integrationstester för hela user flows.',
        detailedDescription: 'Testa hela flöden: Skapa projekt -> Lägg till tasks -> AI-chat -> Export.',
        purpose: 'Säkerställa att alla delar fungerar tillsammans.',
        status: 'planned',
        tech: ['Vitest', 'Firebase Emulators', 'MSW'],
        priority: 'medium',
        tags: ['Testing', 'Quality', 'Integration'],
        checklist: [
            { label: 'Setup Firebase Emulators', completed: false },
            { label: 'Onboarding flow test', completed: false },
            { label: 'AI chat flow test', completed: false },
            { label: 'Co-working flow test', completed: false },
            { label: 'CI/CD integration', completed: false }
        ]
    },

    // ============================================
    // FAS 4: LÅNGSIKTIGT - Framtida utveckling
    // ============================================
    {
        id: 109,
        title: 'Genkit Migration (AI Framework)',
        category: 'AI Core',
        phase: 4,
        description: 'Utvärdera och eventuellt migrera från @google/genai till Genkit för bättre AI-flödeshantering.',
        detailedDescription: 'Genkit är Googles ramverk för AI-applikationer med features som: Dotprompt (prompt-filer med versioning), Developer UI för debugging, multi-model support (Gemini/OpenAI/Anthropic), och inbyggd observability. Nuvarande implementation med @google/genai fungerar väl - migrering är nice-to-have, inte need-to-have. Utvärdera om/när: (1) behov av modellbyte uppstår, (2) debugging blir ett problem, (3) prompt-versioning blir kritiskt.',
        purpose: 'Potentiellt förbättrad AI-utveckling och debugging.',
        status: 'planned',
        tech: ['Genkit', '@genkit-ai/googleai', 'Dotprompt', 'Zod'],
        priority: 'low',
        tags: ['AI', 'Framework', 'DevEx', 'Optional'],
        checklist: [
            { label: 'Utvärdera behov (modellbyte, debugging)', completed: false },
            { label: 'Proof-of-concept med en flow', completed: false },
            { label: 'Migrera aiChat → defineFlow', completed: false },
            { label: 'Migrera aiParse → defineFlow', completed: false },
            { label: 'Migrera aiDeepResearch → defineFlow', completed: false },
            { label: 'Konvertera prompts till Dotprompt', completed: false },
            { label: 'Testa och deploy', completed: false }
        ]
    },
    {
        id: 18,
        title: 'Partner-integration (Auto-korg)',
        category: 'Ekonomi',
        phase: 4,
        description: 'Lägg varor i varukorgen hos partners (t.ex. Autodoc) direkt från appen.',
        detailedDescription: 'Affiliate-integration med bildelarbutiker för direkta köplänkar.',
        purpose: 'Tjäna pengar på plattformen och underlätta köp.',
        status: 'planned',
        tech: ['Affiliate APIs', 'Deep Linking', 'Partner Integration'],
        priority: 'low',
        tags: ['Affiliate', 'Monetization', 'Partners', 'E-commerce'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Partner-kontakt', completed: false },
            { label: 'API-integration', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 25,
        title: 'Admin UI & Feature Flag Dashboard',
        category: 'Infrastruktur',
        phase: 4,
        description: 'Dashboard för att hantera feature flags och övervaka användning i realtid.',
        detailedDescription: 'Admin-interface för att toggle features och analysera användarbeteende.',
        purpose: 'Enkel kontroll av features utan att ändra kod.',
        status: 'planned',
        tech: ['React Admin Dashboard', 'Firestore', 'Analytics'],
        priority: 'low',
        tags: ['Admin', 'Analytics', 'Dashboard', 'Monitoring'],
        checklist: [
            { label: 'Specad', completed: false },
            { label: 'Utvecklad (UI)', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 22,
        title: 'The Garage OS (Multi-Brand Platform)',
        category: 'Strategi',
        phase: 4,
        description: 'Transformation till en "White Label"-motor för olika fordonsgrupper.',
        detailedDescription: 'Plattform som kan anpassas för olika nischer: VanPlan, RaceKoll, ClassicTracker etc.',
        purpose: 'Skalbarhet och nya marknader.',
        status: 'planned',
        tech: ['Config-driven Architecture', 'White Label', 'Multi-tenancy'],
        priority: 'low',
        tags: ['White Label', 'Strategy', 'Scale', 'Platform'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Brand Config System', completed: true },
            { label: 'Dynamiska Teman', completed: false },
            { label: 'Multi-tenant DB', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 106,
        title: 'Mobilapp (React Native)',
        category: 'Plattform',
        phase: 4,
        description: 'Native mobilapp för iOS och Android med bättre kamera- och mikrofon-access.',
        detailedDescription: 'React Native-app som delar business logic med webappen men har native access.',
        purpose: 'Bättre användarupplevelse på mobil.',
        status: 'planned',
        tech: ['React Native', 'Expo', 'Firebase', 'Native APIs'],
        priority: 'low',
        tags: ['Mobile', 'Native', 'iOS', 'Android'],
        checklist: [
            { label: 'Utvärdera React Native vs Flutter', completed: false },
            { label: 'Setup projekt', completed: false },
            { label: 'Bygga native features', completed: false },
            { label: 'App Store submission', completed: false }
        ]
    }
];

// Helper functions
export const getFeaturesByPhase = (phase: 1 | 2 | 3 | 4) =>
    ROADMAP_FEATURES.filter(f => f.phase === phase);

export const getFeaturesByStatus = (status: Feature['status']) =>
    ROADMAP_FEATURES.filter(f => f.status === status);

export const getRoadmapStats = () => {
    const total = ROADMAP_FEATURES.length;
    const done = ROADMAP_FEATURES.filter(f => f.status === 'done').length;
    const inProgress = ROADMAP_FEATURES.filter(f => f.status === 'in-progress').length;
    const planned = ROADMAP_FEATURES.filter(f => f.status === 'planned').length;
    const blocked = ROADMAP_FEATURES.filter(f => f.status === 'blocked').length;

    return {
        total,
        done,
        inProgress,
        planned,
        blocked,
        completionPercentage: Math.round((done / total) * 100)
    };
};
