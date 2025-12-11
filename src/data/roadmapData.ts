
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
    detailedDescription?: string; // Longer description for modal
    purpose: string; // "Tanke"
    tech: string | string[]; // Support both old format and new array
    status: 'done' | 'in-progress' | 'planned';
    checklist: ChecklistItem[];
    category: string;
    priority?: 'high' | 'medium' | 'low';
    estimatedCompletion?: string; // e.g., "Q1 2025"
    tags?: string[];
    demoUrl?: string;
    githubIssue?: string;
}

export const ROADMAP_FEATURES: Feature[] = [
    // 1. INFRASTRUKTUR
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
        id: 27,
        title: 'Databas-migrering: Sub-collections',
        category: 'Infrastruktur',
        description: 'Omstrukturering av databasen för att stödja stora projekt genom att använda Firestore sub-collections istället för stora dokument.',
        detailedDescription: 'Migrering från monolitisk dokumentstruktur till hierarkisk struktur (projects/{id}/tasks). Löser 1MB-begränsningen i Firestore och möjliggör avancerade frågor och bättre prestanda. Se docs/architecture/DATA_MODEL_MIGRATION.md för detaljer.',
        purpose: 'Skalbarhet och prestanda för stora projekt.',
        status: 'planned',
        tech: ['Firestore Sub-collections', 'Data Migration', 'Scalability'],
        priority: 'high',
        tags: ['Database', 'Architecture', 'Scalability', 'Performance'],
        checklist: [
            { label: 'Specad (DATA_MODEL_MIGRATION.md)', completed: true },
            { label: 'Utvecklad (DB Service Layer)', completed: false },
            { label: 'Migrerings-script', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
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
        description: 'Komplett automatisk testning av alla kritiska funktioner i appen. Tester körs i Chrome, Firefox, Safari samt mobila enheter. Inkluderar visual regression testing.',
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
        id: 16,
        title: 'Offline-stöd (PWA)',
        category: 'Infrastruktur',
        description: 'Gör appen till en Progressive Web App (PWA) som fungerar utan nätverk. Data synkas när nätet kommer tillbaka.',
        detailedDescription: 'PWA-implementation med service workers, offline caching, installbar app, och background sync. Användare kan arbeta fullt ut utan internetanslutning och alla ändringar synkas automatiskt när nätet kommer tillbaka.',
        purpose: 'Ett garage har ofta dålig täckning. Appen måste vara pålitlig även offline.',
        status: 'planned',
        tech: ['Vite PWA Plugin', 'Firestore Persistence', 'Service Workers', 'Background Sync'],
        priority: 'medium',
        estimatedCompletion: 'Q2 2025',
        tags: ['PWA', 'Offline', 'Mobile', 'Performance'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Konfigurerad (Vite)', completed: false },
            { label: 'Testad (Flygplansläge)', completed: false },
            { label: 'Lanserad', completed: false }
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
        id: 25,
        title: 'Admin UI & Feature Flag Dashboard',
        category: 'Infrastruktur',
        description: 'Dashboard för att hantera feature flags, se A/B test resultat, och övervaka användning i realtid.',
        detailedDescription: 'Dedikerat admin-interface för att toggle features, analysera användarbeteende, övervaka systemhälsa, och fatta datadrivna beslut om produktutveckling.',
        purpose: 'Enkel kontroll av features utan att ändra kod. Datadrivet beslutsfattande.',
        status: 'planned',
        tech: ['React Admin Dashboard', 'Firestore', 'Analytics'],
        priority: 'low',
        estimatedCompletion: 'Q3 2025',
        tags: ['Admin', 'Analytics', 'Dashboard', 'Monitoring'],
        checklist: [
            { label: 'Specad', completed: false },
            { label: 'Utvecklad (UI)', completed: false },
            { label: 'Testad (Toggle Features)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },

    // 2. PLATTFORM & ANVÄNDARE
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
        id: 28,
        title: 'Elton Inspector (AI Besiktning)',
        category: 'Plattform',
        description: 'AI-assisterad fordonsbesiktning ("Snap & Triage") med bild- och ljudanalys för att diagnostisera rost, motorljud och andra fel.',
        detailedDescription: 'En dedikerad modul där användaren kan genomföra en guidad besiktning av fordonet. Användaren fotar problemområden eller spelar in ljud, och AI:n ger en diagnos, bedömer allvarlighetsgrad och föreslår åtgärder. Se docs/features/INSPECTOR_SPEC.md för fullständig specifikation.',
        purpose: 'Att ge användaren en professionell bedömning av fordonets skick utan att behöva vara expert.',
        status: 'planned',
        tech: ['Gemini Vision', 'Audio Analysis', 'Investigation Logic Tree'],
        priority: 'high',
        tags: ['AI', 'Vision', 'Audio', 'Diagnostics', 'Mobile'],
        checklist: [
            { label: 'Specad (INSPECTOR_SPEC.md)', completed: true },
            { label: 'Datamodell (Findings)', completed: true },
            { label: 'AI-Prompt (Inspector Agent)', completed: true },
            { label: 'Utvecklad (UI & Logic)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 29,
        title: 'Vehicle Data Scraper (Playwright)',
        category: 'Plattform',
        description: 'Pålitlig fordonsdata-scraper som hämtar verifierad information från svenska register (car.info, biluppgifter.se) istället för att förlita sig på AI-sökning.',
        detailedDescription: 'Cloud Function med Playwright som scrapar fordonsdata från car.info och biluppgifter.se. Ersätter opålitlig AI Google Search med strukturerad scraping. Inkluderar caching (30 dagar TTL), fallback-strategi, och felhantering. Hybrid-arkitektur där scraper ger FAKTA (RegNo → VehicleData) och AI ger KREATIVITET (VehicleData → Plan). Se docs/features/VEHICLE_SCRAPER.md för fullständig dokumentation.',
        purpose: 'Ge 100% pålitlig fordonsdata vid onboarding. Eliminera 403-fel, CAPTCHA-problem och felaktig data från AI-sökning.',
        status: 'planned',
        tech: ['Playwright', 'Cloud Functions', 'Web Scraping', 'Firestore Cache', 'TypeScript'],
        priority: 'high',
        estimatedCompletion: 'Q1 2025',
        tags: ['Scraping', 'Data', 'Reliability', 'Onboarding', 'Infrastructure'],
        checklist: [
            { label: 'Specad (VEHICLE_SCRAPER.md)', completed: true },
            { label: 'Playwright CLI-inspektion av car.info', completed: false },
            { label: 'Playwright CLI-inspektion av biluppgifter.se', completed: false },
            { label: 'Scraper-funktion för car.info', completed: false },
            { label: 'Scraper-funktion för biluppgifter.se', completed: false },
            { label: 'Cache-lager (Firestore)', completed: false },
            { label: 'Cloud Function implementation', completed: false },
            { label: 'Integration med onboardingService', completed: false },
            { label: 'Unit & E2E tester', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 17,
        title: 'Auto-genererad Historik & Expertanalys',
        category: 'Plattform',
        description: 'AI:n identifierar "Kända fel" (The Killers), ger tips om modifieringar och analyserar mätarställning (5 vs 6 siffror).',
        detailedDescription: 'Expertanalys-rapport som genereras automatiskt vid projekt-skapande. Inkluderar kända problem för specifik modell, populära modifieringar, varningar för potentiella kostsamma fel, och smart mätarställningsanalys.',
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

    // 3. AI CORE
    {
        id: 3,
        title: 'Bildigenkänning av Regplåt',
        category: 'AI Core',
        description: 'Fota bilen för att starta projektet. AI:n hittar och läser av registreringsskylten.',
        detailedDescription: 'OCR-funktionalitet med Gemini Vision som automatiskt detekterar och läser av svenska registreringsskyltar från foton. Stödjer olika ljusförhållanden och vinklar.',
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
        id: 4,
        title: 'AI-genererad Projektikon (Nano Banana)',
        category: 'AI Core',
        description: 'AI ritar en stiliserad flat design-ikon (PNG) av din bil. PAUSAD: Gemini image generation-modellerna fungerar inte korrekt med Node.js SDK ännu.',
        detailedDescription: 'AI-driven bildgenerering som skapar en unik, stiliserad ikon av användarens fordon i flat design-stil. Implementationen är klar men väntar på att Gemini 3 Pro Image Preview eller Gemini 2.5 Flash Image ska bli fullt tillgängliga via @google/genai SDK. Alternativ: Användare kan ladda upp egna ikoner tills vidare.',
        purpose: 'Personligt och proffsigt utseende på projektet.',
        status: 'planned',
        tech: ['Gemini 3 Pro Image Preview', 'Image Generation', 'Flat Design'],
        priority: 'low',
        estimatedCompletion: 'Q2 2025 (när SDK stödjer modellen)',
        tags: ['AI', 'Design', 'Image', 'Personalization', 'Blocked'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (API Integration)', completed: true },
            { label: 'Testad (Generering)', completed: false },
            { label: 'Blockad: Väntar på SDK-support', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 5,
        title: 'Google Search-integration',
        category: 'AI Core',
        description: 'AI:n kan söka på webben efter priser, manualer och fakta i realtid.',
        detailedDescription: 'Real-time sökning via Gemini Tools API. AI:n kan dynamiskt söka efter aktuella priser, tekniska manualer, forum-diskussioner, och annan relevant information för att ge uppdaterade svar.',
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
        id: 6,
        title: 'Live Elton (Röst & Video)',
        category: 'AI Core',
        description: 'Prata med Elton i realtid via kameran ("Ring upp").',
        detailedDescription: 'Real-time video/voice-chat med AI där användaren kan visa problem via kameran och få direktvägledning. Perfekt för hands-on diagnostik när händerna är oljiga.',
        purpose: 'En mekaniker-kompis i fickan när händerna är oljiga.',
        status: 'in-progress',
        tech: ['WebRTC', 'Gemini Live API', 'Video Streaming', 'Voice Recognition'],
        priority: 'medium',
        estimatedCompletion: 'Q2 2025',
        tags: ['WebRTC', 'Voice', 'Video', 'Real-time', 'Diagnostics'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Frontend & Audio)', completed: true },
            { label: 'Testad (Live Connection)', completed: false, inProgress: true },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 7,
        title: 'Dialekter & Personligheter',
        category: 'AI Core',
        description: 'Elton kan prata dalmål, gotländska eller rikssvenska.',
        detailedDescription: 'Konfigurerbar AI-persona med olika svenska dialekter och personligheter. Skapar en roligare och mer personlig upplevelse samtidigt som det testar Gemini:s flerspråkiga capabilities.',
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
        id: 8,
        title: 'Ljud-Doktorn',
        category: 'AI Core',
        description: 'AI lyssnar på motorljud och ställer diagnos.',
        detailedDescription: 'Audio-baserad diagnostik där AI analyserar motorljud, avgasljud, bromsljud etc. och ger potentiella diagnoser. Använder Gemini:s audio processing capabilities.',
        purpose: 'Löser problemet "Vad är det som låter?".',
        status: 'in-progress',
        tech: ['Audio Processing', 'Gemini Audio', 'Signal Analysis'],
        priority: 'medium',
        estimatedCompletion: 'Q1 2025',
        tags: ['Audio', 'Diagnostics', 'AI', 'Analysis'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Prompt & UI)', completed: true },
            { label: 'Testad (Ljudanalys)', completed: false, inProgress: true },
            { label: 'Lanserad', completed: false }
        ]
    },

    // 4. PROJEKTLEDNING
    {
        id: 10,
        title: 'Magic Import (Text & Bild)',
        category: 'Projektledning',
        description: 'Klistra in anteckningar eller fota en handskriven lista för att skapa uppgifter.',
        detailedDescription: 'Multimodal import där användare kan klistra in text från forum/manualer eller fotografera handskrivna listor. AI:n extraherar uppgifter med titlar, beskrivningar, prioritet, och estimerade kostnader.',
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
        id: 11,
        title: 'Smart Context & Beslutsstöd',
        category: 'Projektledning',
        description: 'Visar automatiskt relevant data (t.ex. däckdimensioner) inne på en uppgift.',
        detailedDescription: 'Context-aware UI som automatiskt visar relevant fordonsdata när man arbetar med specifika uppgifter. T.ex. däckmått vid "Byt däck", motoroljevolym vid "Oljebyte", vridmoment vid "Demontera hjul".',
        purpose: 'Just-in-time information. Slipp leta i papper.',
        status: 'planned',
        tech: ['Context Awareness', 'Smart UI', 'Data Matching'],
        priority: 'medium',
        estimatedCompletion: 'Q2 2025',
        tags: ['Context', 'AI', 'UX', 'Productivity'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    {
        id: 21,
        title: 'Flexibla Faser & Idébank',
        category: 'Projektledning',
        description: 'Projekt kan nu ha olika typer (Renovering, Bygge, Underhåll) med anpassade faser. Idéer har fått en egen "Drömbank" separat från att-göra-listan.',
        detailedDescription: 'Dynamiskt fas-system där olika projekttyper har skräddarsydda work stages. "Drömbank" är en sandbox för idéer som inte är prioriterade ännu men som användaren vill komma ihåg.',
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

    // 5. EKONOMI
    {
        id: 9,
        title: 'Smart Inköpslista & Kvitton',
        category: 'Ekonomi',
        description: 'En separat vy för inköp. Man kan fota kvitton, koppla kostnaden till en specifik uppgift (för budgetuppföljning) och se vad som är köpt vs planerat.',
        detailedDescription: 'Komplett shoppinglist-system med receipt scanning via Vision API, automatisk kostnadskoppling till tasks, och budgetuppföljning. Visar real vs estimated costs för hela projektet.',
        purpose: 'Total kontroll på ekonomin.',
        status: 'done',
        tech: ['Firebase Storage', 'Gemini Vision', 'OCR', 'Budget Tracking'],
        priority: 'high',
        tags: ['Shopping', 'Receipts', 'Budget', 'Finance', 'OCR'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Uppladdning & Lista)', completed: true },
            { label: 'Testad (Länka kostnad)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 18,
        title: 'Partner-integration (Auto-korg)',
        category: 'Ekonomi',
        description: 'Lägg varor i varukorgen hos partners (t.ex. Autodoc) direkt från appen.',
        detailedDescription: 'Affiliate-integration med bildelarbutiker där användare kan klicka på en artikel i inköpslistan och få den direkt tillagd i partner-butikens varukorg. Generar intäkter via affiliate-länkar.',
        purpose: 'Tjäna pengar på plattformen och underlätta köp.',
        status: 'planned',
        tech: ['Affiliate APIs', 'Deep Linking', 'Partner Integration'],
        priority: 'medium',
        estimatedCompletion: 'Q3 2025',
        tags: ['Affiliate', 'Monetization', 'Partners', 'E-commerce'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },

    // 6. KUNSKAP & GARAGE
    {
        id: 12,
        title: 'Kunskapsbanken & Markdown-läsare',
        category: 'Kunskap',
        description: 'Ett bibliotek med tunga tekniska rapporter (markdown) som AI:n kan läsa och citera.',
        detailedDescription: 'RAG-system (Retrieval Augmented Generation) där AI:n har tillgång till en kunskapsbas med tekniska guider, service-manualer, och expertanalys-rapporter. Renderas med React Markdown för snygg formattering.',
        purpose: 'Att säkra kvalitén.',
        status: 'done',
        tech: ['RAG', 'React Markdown', 'Knowledge Base', 'Vector Search'],
        priority: 'high',
        tags: ['RAG', 'Knowledge', 'Markdown', 'Quality'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Markdown + Context)', completed: true },
            { label: 'Testad (Läsare)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 13,
        title: 'Tidslinje & Historik',
        category: 'Garage',
        description: 'En visuell tidslinje som visar bilens hela liv.',
        detailedDescription: 'Interactive timeline med Recharts som visualiserar bilens historia från tillverkning till nuvarande status. Inkluderar alla completed tasks, milstolpar, kostnader, och servicehistorik.',
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
        description: 'Logga tankningar och service. Visualisera förbrukning och serviceintervall. Komplett UI med grafer, påminnelser och timeline-vy.',
        detailedDescription: 'Fuel log och service book som trackar tankningar, förbrukning per mil (L/100km), service-intervaller med automatiska påminnelser, timeline-vy för servicehistorik med årsgrupperingar, och visuella grafer över förbrukningstrend. Full CRUD-funktionalitet med Firestore-integration.',
        purpose: 'Ett praktiskt verktyg för det dagliga ägandet.',
        status: 'done',
        tech: ['Firestore', 'Recharts', 'Analytics', 'Timeline UI', 'React'],
        priority: 'medium',
        tags: ['Fuel', 'Service', 'Analytics', 'Maintenance', 'Completed'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Datastruktur & Input)', completed: true },
            { label: 'UI-komponenter (FuelLog & ServiceBook)', completed: true },
            { label: 'Visualisering/Grafer (Recharts)', completed: true },
            { label: 'Service-påminnelser & besiktningsvarningar', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },

    // 7. DATA
    {
        id: 15,
        title: 'Backup & Export',
        category: 'Data',
        description: 'Möjlighet att spara ner hela projektet som en JSON-fil och återställa den.',
        detailedDescription: 'Full projekt-export som JSON blob, inkluderande alla tasks, shopping items, vehicle data, och metadata. Användare kan återställa projektet på annan enhet eller spara som backup.',
        purpose: 'Datasäkerhet och portabilitet.',
        status: 'done',
        tech: ['JSON Export', 'File API', 'Data Portability'],
        priority: 'high',
        tags: ['Data', 'Security', 'Export', 'Backup'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },

    // 8. STRATEGI
    {
        id: 22,
        title: 'The Garage OS (Multi-Brand Platform)',
        category: 'Strategi',
        description: 'Transformation till en "White Label"-motor för olika fordonsgrupper.',
        detailedDescription: 'Plattformstransformation där core-engine kan anpassas för olika nischer: VanPlan för bussar, RaceKoll för racing, ClassicTracker för veteranbilar etc. Config-driven branding och features.',
        purpose: 'Skalbarhet.',
        status: 'planned',
        tech: ['Config-driven Architecture', 'White Label', 'Multi-tenancy'],
        priority: 'medium',
        estimatedCompletion: 'Q4 2025',
        tags: ['White Label', 'Strategy', 'Scale', 'Platform'],
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Brand Config System', completed: true },
            { label: 'Dynamiska Teman', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    }
];
