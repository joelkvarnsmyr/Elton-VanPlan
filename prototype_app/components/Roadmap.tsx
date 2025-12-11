
import React, { useState } from 'react';
import { CheckCircle2, Circle, Clock, Construction, ArrowLeft, ChevronDown, ChevronUp, Beaker, Layers, Zap, PenTool, Database, MessageSquare, Network } from 'lucide-react';

interface ChecklistItem {
    label: string;
    completed: boolean;
}

interface Feature {
    id: number;
    title: string;
    description: string;
    purpose: string; // "Tanke"
    tech: string;
    status: 'done' | 'in-progress' | 'planned';
    checklist: ChecklistItem[];
    category: string;
    spec?: string; // Mermaid or detailed text spec
    detailedSteps?: string[];
}

const FEATURES: Feature[] = [
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
    // 8. FRAMTID & STRATEGI (NY)
    {
        id: 16,
        title: 'Garage OS (Multi-Brand Architecture)',
        category: 'Arkitektur & Strategi',
        description: 'Omvandling av plattformen till en varumärkes-agnostisk motor ("Garage OS") som kan driva olika nischade produkter: VanPlan (Vans), RaceKoll (Motorsport), MC-Garaget (Motorcyklar).',
        purpose: 'Att nå specifika målgrupper (Raceförare, MC-byggare) med skräddarsydda upplevelser utan att bygga om koden. En motor - flera skal.',
        status: 'planned',
        tech: 'Config-driven UI + Theme Abstraction',
        checklist: [
            { label: 'Arkitektur-specifikation', completed: true },
            { label: 'Brand Configuration Layer', completed: false },
            { label: 'AI Persona-växling', completed: false },
            { label: 'Multi-Vehicle Dashboard', completed: false }
        ],
        spec: `graph TD
    User[Användare] --> Dashboard[Multi-Vehicle Dashboard]
    
    subgraph "Core Engine (Garage OS)"
        Logic[Affärslogik]
        DB[(Databas)]
        AI[Gemini Agent]
    end

    Dashboard -->|Väljer Van| ConfigVan[Brand: VanPlan]
    Dashboard -->|Väljer Racebil| ConfigRace[Brand: RaceKoll]
    Dashboard -->|Väljer MC| ConfigMC[Brand: MC-Garaget]

    ConfigVan -->|Tema: Pastell + Elton| AppUI
    ConfigRace -->|Tema: Neon + Roffe| AppUI
    ConfigMC -->|Tema: Krom + Siv| AppUI

    AppUI --> Logic
    Logic --> AI
    Logic --> DB`,
        detailedSteps: [
            "Skapa en konfigurationsfil `brands.ts` som styr färgpalett, terminologi och AI-systemprompt.",
            "Bryt ut CSS-klasser (Tailwind) till semantiska variabler (t.ex. `bg-primary` istället för `bg-nordic-ice`).",
            "Uppdatera `ProjectSelector` för att låta användaren välja fordonstyp (Bil, MC, Husbil) vid start.",
            "Skapa unika AI-personligheter: 'Roffe' (Race-ingenjör) och 'Siv' (MC-expert)."
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
        description: 'Baserat på bilden man laddar upp, ritar AI:n (Gemini Image Generation) en stiliserad vektor-ikon av bilen i appens färgskala.',
        purpose: 'Att ge varje projekt en unik, personlig och proffsig identitet. Det höjer känslan av kvalitet enormt.',
        status: 'in-progress', 
        tech: 'Gemini Image Gen / Imagen 3',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Backend-logik)', completed: true },
            { label: 'Testad (Generering)', completed: false },
            { label: 'Lanserad', completed: false }
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
        status: 'done', 
        tech: 'WebRTC + Gemini Live API',
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
        description: 'Elton kan ställas in på att prata Dalmål, Gotländska eller Rikssvenska. Olika röstlägen (Fenrir, Charon).',
        purpose: 'Att göra AI:n mänsklig och rolig. Det skapar en relation till bilen och gör appen mer än bara ett verktyg.',
        status: 'done', 
        tech: 'System Prompts',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
        ]
    },
    { 
        id: 8, 
        title: 'Ljud-Doktorn', 
        category: 'AI Core',
        description: 'Ett specialläge i Live-vyn där AI:n lyssnar efter specifika motorljud (tickande ventiler, remgnissel) och ger en diagnos.',
        purpose: 'Att utnyttja multimodal AI för att lösa ett klassiskt problem: "Vad är det som låter?".',
        status: 'done', 
        tech: 'Audio Processing (Gemini)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
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
        title: 'Kunskapsbanken', 
        category: 'Kunskap',
        description: 'Ett bibliotek med tunga tekniska rapporter (markdown) som AI:n kan läsa och citera.',
        purpose: 'Att säkra kvalitén. AI:n får inte gissa om kamremsintervaller om vi har facit.',
        status: 'done', 
        tech: 'RAG (Retrieval Augmented Gen)',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Markdown + Context)', completed: true },
            { label: 'Testad', completed: true },
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
        title: 'Bränslelogg & Analys', 
        category: 'Garage',
        description: 'En enkel logg för tankningar som räknar ut snittförbrukning och visualiserar det i en graf.',
        purpose: 'Ett praktiskt verktyg för det dagliga ägandet, inte bara bygget.',
        status: 'done', 
        tech: 'Firestore + Recharts',
        checklist: [
            { label: 'Specad', completed: true },
            { label: 'Utvecklad (Datastruktur)', completed: true },
            { label: 'Testad', completed: true },
            { label: 'Lanserad', completed: true }
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

export const Roadmap: React.FC<{ onClose: () => void }> = ({ onClose }) => {
    const [expandedId, setExpandedId] = useState<number | null>(null);

    const toggleExpand = (id: number) => {
        setExpandedId(expandedId === id ? null : id);
    };

    const StatusBadge = ({ status }: { status: string }) => {
        if (status === 'done') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-teal-100 text-teal-800 text-[10px] font-bold uppercase rounded-md border border-teal-200"><CheckCircle2 size={12} /> Lanserad</span>;
        if (status === 'in-progress') return <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold uppercase rounded-md border border-amber-200"><Construction size={12} /> Pågår</span>;
        return <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-500 text-[10px] font-bold uppercase rounded-md border border-slate-200"><Circle size={12} /> Planerad</span>;
    };

    const CategoryIcon = ({ category }: { category: string }) => {
        switch(category) {
            case 'AI Core': return <Zap size={16} className="text-amber-500" />;
            case 'Plattform': return <Layers size={16} className="text-blue-500" />;
            case 'Ekonomi': return <Circle size={16} className="text-green-500" />;
            case 'Garage': return <Database size={16} className="text-slate-500" />;
            case 'Arkitektur & Strategi': return <Network size={16} className="text-purple-500" />;
            default: return <PenTool size={16} className="text-slate-400" />;
        }
    }

    return (
        <div className="min-h-screen bg-nordic-ice p-6 pb-24">
            <div className="max-w-3xl mx-auto">
                <div className="flex items-center gap-4 mb-8">
                    <button onClick={onClose} className="p-3 bg-white rounded-xl shadow-sm hover:bg-slate-50 text-slate-500 transition-colors">
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="font-serif font-bold text-3xl text-nordic-charcoal">VanPlan Roadmap</h1>
                        <p className="text-slate-500">Visionen & Status för plattformen.</p>
                    </div>
                </div>

                <div className="space-y-4">
                    {FEATURES.map(f => (
                        <div 
                            key={f.id} 
                            className={`bg-white rounded-2xl shadow-sm border transition-all duration-300 overflow-hidden ${
                                f.status === 'done' ? 'border-teal-100/50' : 
                                f.status === 'in-progress' ? 'border-amber-200 shadow-md transform scale-[1.01]' : 
                                'border-slate-100 opacity-90'
                            }`}
                        >
                            <div 
                                onClick={() => toggleExpand(f.id)}
                                className="p-5 flex items-center justify-between cursor-pointer hover:bg-slate-50 transition-colors"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shadow-sm ${
                                        f.status === 'done' ? 'bg-teal-50 text-teal-600' :
                                        f.status === 'in-progress' ? 'bg-amber-50 text-amber-600' :
                                        'bg-slate-50 text-slate-400'
                                    }`}>
                                        {f.id}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <CategoryIcon category={f.category} />
                                            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">{f.category}</span>
                                        </div>
                                        <h3 className={`font-bold text-nordic-charcoal ${f.status === 'planned' ? 'text-slate-500' : ''}`}>{f.title}</h3>
                                        <div className="flex gap-2 mt-1">
                                            <StatusBadge status={f.status} />
                                            {expandedId !== f.id && <span className="text-xs text-slate-400 truncate max-w-[200px] hidden sm:inline border-l border-slate-200 pl-2 ml-1">{f.description}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="text-slate-300">
                                    {expandedId === f.id ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </div>
                            </div>

                            {expandedId === f.id && (
                                <div className="p-6 pt-0 bg-slate-50/30 border-t border-slate-50">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Beskrivning</h4>
                                            <p className="text-sm text-slate-600 mb-4">{f.description}</p>
                                            
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Syfte (Varför?)</h4>
                                            <p className="text-sm text-slate-600 italic border-l-2 border-teal-200 pl-3 mb-6">"{f.purpose}"</p>

                                            {f.spec && (
                                                <div className="mt-4">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Teknisk Specifikation (Draft)</h4>
                                                    <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto shadow-inner border border-slate-800">
                                                        <pre className="text-[10px] font-mono text-teal-300 leading-relaxed whitespace-pre">
                                                            {f.spec}
                                                        </pre>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div>
                                            <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Status & Checklista</h4>
                                            <div className="bg-white rounded-xl border border-slate-100 p-4 space-y-2 shadow-sm">
                                                {f.checklist.map((item, idx) => (
                                                    <div key={idx} className="flex items-center gap-3">
                                                        {item.completed ? (
                                                            <CheckCircle2 size={16} className="text-teal-500" />
                                                        ) : (
                                                            <Circle size={16} className="text-slate-300" />
                                                        )}
                                                        <span className={`text-sm ${item.completed ? 'text-slate-700 font-medium' : 'text-slate-400'}`}>{item.label}</span>
                                                    </div>
                                                ))}
                                            </div>
                                            
                                            {f.detailedSteps && (
                                                <div className="mt-6">
                                                    <h4 className="text-xs font-bold text-slate-400 uppercase mb-2">Implementation</h4>
                                                    <ul className="list-disc pl-4 space-y-1">
                                                        {f.detailedSteps.map((step, idx) => (
                                                            <li key={idx} className="text-xs text-slate-500">{step}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}

                                            <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
                                                <Beaker size={14} />
                                                <span>Teknik: <span className="font-mono text-slate-600">{f.tech}</span></span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
                
                <div className="mt-12 text-center pb-8">
                    <p className="text-slate-400 text-sm">Totalt {FEATURES.length} funktioner definierade.</p>
                    <div className="w-full bg-slate-200 h-2 rounded-full mt-2 overflow-hidden max-w-xs mx-auto">
                        <div 
                            className="bg-teal-500 h-full transition-all duration-1000" 
                            style={{ width: `${(FEATURES.filter(f => f.status === 'done').length / FEATURES.length) * 100}%` }}
                        ></div>
                    </div>
                    <p className="text-teal-600 text-xs font-bold mt-1">
                        {Math.round((FEATURES.filter(f => f.status === 'done').length / FEATURES.length) * 100)}% Klart
                    </p>
                </div>
            </div>
        </div>
    );
};
