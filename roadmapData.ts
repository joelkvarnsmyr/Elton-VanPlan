
export interface ChecklistItem {
    label: string;
    completed: boolean;
}

export interface Feature {
    id: number;
    title: string;
    description: string;
    purpose: string; // "Tanke"
    tech: string;
    status: 'done' | 'in-progress' | 'planned';
    checklist: ChecklistItem[];
    category: string;
}

export const ROADMAP_FEATURES: Feature[] = [
    // 1. INFRASTRUKTUR
    { 
        id: 1, 
        title: 'Plattforms-arkitektur (SaaS)', 
        category: 'Infrastruktur',
        description: 'Vi har byggt om appen från en enkel "en-sidas-app" för en bil till en plattform som hanterar Användare och Flera Projekt.',
        purpose: 'Grundläggande krav för skalbarhet. Möjliggör synk mellan enheter.',
        status: 'done', 
        tech: 'Firebase Auth + Firestore',
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
        description: 'Bjud in medmekaniker eller familj till dina projekt. Hantera rättigheter och bygg tillsammans i realtid.',
        purpose: 'Bilbyggande är ofta en social aktivitet. Appen måste stödja samarbete.',
        status: 'done',
        tech: 'Firestore Security Rules + Invite System',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (DB & UI)', completed: true },
            { label: 'Säkerhetstestad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 16, 
        title: 'Offline-stöd (PWA)',
        category: 'Infrastruktur',
        description: 'Gör appen till en Progressive Web App (PWA) som fungerar utan nätverk. Data synkas när nätet kommer tillbaka.',
        purpose: 'Ett garage har ofta dålig täckning. Appen måste vara pålitlig även offline.',
        status: 'planned',
        tech: 'Vite PWA Plugin + Firestore Persistence',
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
        purpose: 'Säker utrullning och A/B-testning av nya AI-modeller.',
        status: 'in-progress',
        tech: 'Config-baserad',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Config)', completed: true },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    // 2. PLATTFORM & ANVÄNDARE
    { 
        id: 2, 
        title: 'AI Onboarding "Deep Research"', 
        category: 'Plattform',
        description: 'Multi-Agent system (Detektiven & Verkmästaren) som söker upp fakta och skapar en plan baserat på RegNr.',
        purpose: 'Hög precision och slut på gissningar. Hämtar data från svenska register.',
        status: 'done', 
        tech: 'Gemini 2.0 Flash + Google Search + Multi-Agent',
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
        description: 'AI:n identifierar "Kända fel" (The Killers), ger tips om modifieringar och analyserar mätarställning (5 vs 6 siffror).',
        purpose: 'Ger omedelbart expertkunskap och varnar för dyra fällor.',
        status: 'done',
        tech: 'Gemini 2.0 (Prompt Engineering)',
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
        purpose: 'Smidig onboarding utan att behöva knappa in nummer.',
        status: 'done', 
        tech: 'Gemini Vision (Multimodal)',
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
        description: 'AI ritar en stiliserad vektor-ikon (SVG) av din bil baserat på ditt foto.',
        purpose: 'Personligt och proffsigt utseende på projektet.',
        status: 'in-progress', 
        tech: 'Gemini Vision + SVG Gen',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (SVG Prompt)', completed: true },
            { label: 'Testad (Generering)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    { 
        id: 5, 
        title: 'Google Search-integration', 
        category: 'AI Core',
        description: 'AI:n kan söka på webben efter priser, manualer och fakta i realtid.',
        purpose: 'Går från gissningar till fakta.',
        status: 'done', 
        tech: 'Gemini Tools',
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
        purpose: 'En mekaniker-kompis i fickan när händerna är oljiga.',
        status: 'in-progress', 
        tech: 'WebRTC + Gemini Live API',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Frontend & Audio)', completed: true },
            { label: 'Testad (Live Connection)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    { 
        id: 7, 
        title: 'Dialekter & Personligheter', 
        category: 'AI Core',
        description: 'Elton kan prata dalmål, gotländska eller rikssvenska.',
        purpose: 'Skapar en relation och gör appen roligare.',
        status: 'done', 
        tech: 'System Prompts',
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
        purpose: 'Löser problemet "Vad är det som låter?".',
        status: 'in-progress', 
        tech: 'Audio Processing (Gemini)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Prompt & UI)', completed: true },
            { label: 'Testad (Ljudanalys)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    // 4. PROJEKTLEDNING
    { 
        id: 10, 
        title: 'Magic Import (Text & Bild)', 
        category: 'Projektledning',
        description: 'Klistra in anteckningar eller fota en handskriven lista för att skapa uppgifter.',
        purpose: 'Minskar administrationen avsevärt.',
        status: 'done', 
        tech: 'Gemini Vision',
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
        purpose: 'Just-in-time information. Slipp leta i papper.',
        status: 'planned', 
        tech: 'Context Awareness (Frontend)',
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
        purpose: 'Stödja alla typer av bilägande, inte bara renovering.',
        status: 'done',
        tech: 'Dynamic Types & Filtering',
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
        purpose: 'Total kontroll på ekonomin.',
        status: 'done', 
        tech: 'Firebase Storage + Vision',
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
        purpose: 'Tjäna pengar på plattformen och underlätta köp.',
        status: 'planned',
        tech: 'Affiliate APIs',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    // 6. GARAGE & FORDON
    { 
        id: 12, 
        title: 'Kunskapsbanken & Markdown-läsare', 
        category: 'Kunskap',
        description: 'Ett bibliotek med tunga tekniska rapporter (markdown) som AI:n kan läsa och citera.',
        purpose: 'Att säkra kvalitén.',
        status: 'done', 
        tech: 'RAG + React Markdown',
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
        purpose: 'Att ge perspektiv och hedra bilens historia.',
        status: 'done', 
        tech: 'Recharts + Timeline UI',
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
        purpose: 'Ett praktiskt verktyg för det dagliga ägandet.',
        status: 'in-progress', 
        tech: 'Firestore + Recharts',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Datastruktur & Input)', completed: true },
            { label: 'Testad (Spara/Ladda)', completed: true },
            { label: 'Lanserad (Visualisering/Grafer)', completed: false }
        ]
    },
    // 7. DATA
    { 
        id: 15, 
        title: 'Backup & Export', 
        category: 'Data',
        description: 'Möjlighet att spara ner hela projektet som en JSON-fil och återställa den.',
        purpose: 'Datasäkerhet och portabilitet.',
        status: 'done', 
        tech: 'JSON Blob',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    // 9. THE GARAGE OS
    {
        id: 22,
        title: 'The Garage OS (Multi-Brand Platform)',
        category: 'Strategi',
        description: 'Transformation till en "White Label"-motor för olika fordonsgrupper.',
        purpose: 'Skalbarhet.',
        status: 'planned',
        tech: 'Config-driven Architecture',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Brand Config System', completed: true }, 
            { label: 'Dynamiska Teman', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    }
];
