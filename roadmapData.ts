
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
        purpose: 'Att göra det möjligt för en användare att renovera flera bilar samtidigt (t.ex. en Sprinter och en gammal Volvo) eller att flera användare kan använda tjänsten. Det är grunden för en skalbar produkt.',
        status: 'done', 
        tech: 'Firebase Auth + Firestore (NoSQL)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (DB & Auth)', completed: true },
            { label: 'Testad (Flera projekt)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 16, 
        title: 'Offline-stöd (PWA)',
        category: 'Infrastruktur',
        description: 'Gör appen till en Progressive Web App (PWA) som fungerar utan nätverk. Data synkas när nätet kommer tillbaka.',
        purpose: 'Ett garage har ofta dålig täckning. Appen måste fungera ändå.',
        status: 'planned',
        tech: 'Vite PWA Plugin + Firestore Persistence',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Konfigurerad (Vite)', completed: false },
            { label: 'Testad (Flygplansläge)', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    // 2. PLATTFORM & ANVÄNDARE
    { 
        id: 2, 
        title: 'AI Onboarding & "Research Wizard"', 
        category: 'Plattform',
        description: 'När man skapar ett nytt projekt behöver man bara ange Regnr eller en länk. En "Wizard" startar där AI:n (Gemini) söker upp teknisk data, skapar en serviceplan och letar efter vanliga fel för just den modellen.',
        purpose: 'Att ta bort "tomt papper-ångesten". Användaren får ett projekt som är 80% klart direkt, istället för att behöva skriva in allt manuellt.',
        status: 'done', 
        tech: 'Gemini 2.0 Flash + Google Search Tool',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Gemini Service)', completed: true },
            { label: 'Testad (Sökning & Parsing)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    {
        id: 17, // NEW
        title: 'Auto-genererad Historik & Strategianalys',
        category: 'Plattform',
        description: 'Vid projektstart skriver AI:n en djuplodande "Detektiv-rapport" om bilmodellen, dess historia, kända fel och en strategi för renoveringen. Sparas som en artikel.',
        purpose: 'Ger omedelbart expertkunskap och en "wow-känsla". AI:n förstår kontexten från start.',
        status: 'done',
        tech: 'Gemini 2.0 (Prompt Engineering)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Deep Research Prompt)', completed: true },
            { label: 'Testad (Generering & Spara)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    // 3. AI
    { 
        id: 3, 
        title: 'Bildigenkänning av Regplåt', 
        category: 'AI Core',
        description: 'I Research-guiden kan man ladda upp en bild på bilen. AI:n skannar bilden, hittar registreringsskylten, läser av den och använder numret för att söka fakta.',
        purpose: 'Extremt smidigt för användaren. Man tar ett foto på sin nya bil, och appen vet direkt vad det är.',
        status: 'done', 
        tech: 'Gemini Vision (Multimodal)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Image Upload + OCR)', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    { 
        id: 4, 
        title: 'AI-genererad Projektikon (Nano Banana)', 
        category: 'AI Core',
        description: 'Baserat på bilden man laddar upp, ritar AI:n en stiliserad vektor-ikon av bilen. Vi använder just nu bildanalys för att matcha färger, men full bildgenerering väntar på API-stöd.',
        purpose: 'Att ge varje projekt en unik, personlig och proffsig identitet. Det höjer känslan av kvalitet enormt.',
        status: 'in-progress', 
        tech: 'Gemini Vision + Imagen 3 (Pending)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Stub/Vision-analys)', completed: true },
            { label: 'Testad (Generering)', completed: false },
            { label: 'Lanserad (Fullständig)', completed: false }
        ]
    },
    { 
        id: 5, 
        title: 'Google Search-integration', 
        category: 'AI Core',
        description: 'AI:n har nu tillgång till Google Sök. Den kan kolla aktuella priser på reservdelar, hitta manualer och verifiera teknisk data.',
        purpose: 'Att gå från "gissningar" till "fakta". AI:n kan nu säga "Oljefilter till Sprinter kostar 149 kr på Autodoc" istället för att gissa.',
        status: 'done', 
        tech: 'Gemini Tools (Google Search)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Tool Calling)', completed: true },
            { label: 'Testad (Priskoll)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    { 
        id: 6, 
        title: 'Live Elton (Röst & Video)', 
        category: 'AI Core',
        description: 'En realtids-koppling till Gemini där man kan prata med "Elton" via mikrofon och visa saker via kameran.',
        purpose: 'Att ha en "mekaniker-kompis" i fickan när man ligger under bilen och inte kan skriva på tangentbordet.',
        status: 'planned', 
        tech: 'WebRTC + Gemini Live API',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    { 
        id: 7, 
        title: 'Dialekter & Personligheter', 
        category: 'AI Core',
        description: 'Elton kan ställas in på att prata Dalmål, Gotländska eller Rikssvenska. Olika röstlägen (Fenrir, Charon).',
        purpose: 'Att göra AI:n mänsklig och rolig. Det skapar en relation till bilen och gör appen mer än bara ett verktyg.',
        status: 'planned', 
        tech: 'System Prompts',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    { 
        id: 8, 
        title: 'Ljud-Doktorn', 
        category: 'AI Core',
        description: 'Ett specialläge i Live-vyn där AI:n lyssnar efter specifika motorljud (tickande ventiler, remgnissel) och ger en diagnos.',
        purpose: 'Att utnyttja multimodal AI för att lösa ett klassiskt problem: "Vad är det som låter?".',
        status: 'planned', 
        tech: 'Audio Processing (Gemini)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    // 4. PROJEKTLEDNING
    { 
        id: 10, 
        title: 'Magic Import (Text & Bild)', 
        category: 'Projektledning',
        description: 'Man kan klistra in en rörig anteckning eller ladda upp ett foto på en handskriven lista. AI:n strukturerar om det till uppgifter och inköpsvaror.',
        purpose: 'Att minska administrationen. Det ska vara lätt att få in data i systemet.',
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
        description: 'Inne på en uppgift (t.ex. "Byt däck") visar appen automatiskt relevant data (däckdimensioner) och lagersaldo (har vi köpt däck?).',
        purpose: '"Just-in-time information". Man ska slippa leta i papper när man väl ska jobba.',
        status: 'planned', 
        tech: 'Context Awareness (Frontend)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: false },
            { label: 'Testad', completed: false },
            { label: 'Lanserad', completed: false }
        ]
    },
    // 5. EKONOMI
    { 
        id: 9, 
        title: 'Smart Inköpslista & Kvitton', 
        category: 'Ekonomi',
        description: 'En separat vy för inköp. Man kan fota kvitton, koppla kostnaden till en specifik uppgift (för budgetuppföljning) och se vad som är köpt vs planerat.',
        purpose: 'Total kontroll på ekonomin. Att veta exakt vad renoveringen kostat hittills.',
        status: 'done', 
        tech: 'Firebase Storage + Vision',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Uppladdning & Lista)', completed: true },
            { label: 'Testad (Länka kostnad)', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    // 6. GARAGE & FORDON
    { 
        id: 12, 
        title: 'Kunskapsbanken & Markdown-läsare', 
        category: 'Kunskap',
        description: 'Ett bibliotek med tunga tekniska rapporter (markdown) som AI:n kan läsa och citera. UI för att läsa artiklar snyggt.',
        purpose: 'Att säkra kvalitén. AI:n får inte gissa om kamremsintervaller om vi har facit.',
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
        description: 'En visuell tidslinje som visar bilens hela liv, från tillverkning, genom alla ägare, till dagens projekt.',
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
        purpose: 'Ett praktiskt verktyg för det dagliga ägandet, inte bara bygget.',
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
        purpose: 'Datasäkerhet och portabilitet innan vi har en riktig molndatabas.',
        status: 'done', 
        tech: 'JSON Blob',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    }
];
