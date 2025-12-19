
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';
import path from 'path';

// Load environment variables with explicit path
const envPath = path.resolve(process.cwd(), '.env');
dotenv.config({ path: envPath });

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
    console.error("❌ GEMINI_API_KEY (or VITE_GEMINI_API_KEY) not found in .env");
    console.error(`📂 Checked file: ${envPath}`);
    process.exit(1);
}

console.log(`✅ API Key found (${apiKey.substring(0, 4)}...). Initializing Gemini...`);

const ai = new GoogleGenAI({ apiKey });

// Copied from src/config/prompts.ts to avoid alias issues
const detectivePrompt = (vehicleDescription: string, hasImage?: boolean) => `
═══════════════════════════════════════════════════════════════════════════════
ROLL: DETEKTIVEN - Fordonsdata & Tekniska Fakta
═══════════════════════════════════════════════════════════════════════════════

Du är "Detektiven". Din ENDA uppgift är att hitta HÅRDA FAKTA och TEKNISK DATA om fordonet.
ALDRIG gissa. ALDRIG hitta på. Markera alltid saknad data som "Okänt".

FORDONSBESKRIVNING: "${vehicleDescription}"
${hasImage ? `
┌─────────────────────────────────────────────────────────────────────────────┐
│ 📸 BILD BIFOGAD - PRIORITET 1: LÄS AV REGISTRERINGSNUMRET                 │
│ Svenska regnummer har formatet: ABC123, ABC 123, eller ABC12A             │
│ Titta på bilens fram- eller baksida efter skylten                          │
└─────────────────────────────────────────────────────────────────────────────┘
` : ""}

⚠️ KRITISKT SPRÅKKRAV:
- SVARA ENDAST PÅ SVENSKA
- INGA engelska ord eller fraser (inte ens tekniska termer)
- Översätt ALLT: "Engine" → "Motor", "Brake" → "Broms", "Tire" → "Däck"

═══════════════════════════════════════════════════════════════════════════════
SÖKSTRATEGI (I PRIORITETSORDNING)
═══════════════════════════════════════════════════════════════════════════════

STEG 1: IDENTIFIERA FORDONET
─────────────────────────────
Om RegNr hittades (text eller bild):
  → Gå till STEG 2
Om endast märke/modell/år:
  → Gå till STEG 3

STEG 2: REGISTERDATA (OM REGNR FINNS)
─────────────────────────────────────
⚠️ VIKTIGT: Dessa sidor kan ha CAPTCHA eller kräva inloggning. Försök ändå.

A) Primär sökning:
   Sökfras: "{REGNR} fordon tekniska data"
   Alternativ: "{REGNR} biluppgifter" eller "{REGNR} bilinfo"

B) Om sidor blockar åtkomst, försök:
   - Transportstyrelsen offentliga data
   - Svenska forum som Garaget.org eller Jagrullar.se
   - Privatannonser (Blocket, Bytbil) som ofta listar specs

C) Data att extrahera från registerdata:
   ┌──────────────────────────────────────────────────────────────────────────┐
   │ OBLIGATORISKA FÄLT (försök hitta alla):                                  │
   │ • Status: I trafik / Avställd                                           │
   │ • Första registrering (regDate)                                          │
   │ • Senaste besiktning + mätarställning                                   │
   │ • Motor: Effekt (HK + kW), Volym, Bränsle                               │
   │ • Vikter: Tjänstevikt, Totalvikt, Maxlast, Släpvagnsvikt               │
   │ • Mått: Längd, Bredd, Hjulbas (mm)                                      │
   │ • Däck: Dimension (t.ex. 215R14), Bultmönster                           │
   │ • Växellåda: Manuell/Automat                                            │
   │ • Antal ägare, senaste ägarbyte                                         │
   └──────────────────────────────────────────────────────────────────────────┘

STEG 3: MODELLSPECIFIK DATA (ALLTID)
───────────────────────────────────
Sök efter modellspecifik information:
   Sökfras: "{Märke} {Modell} {År} tekniska data"
   Sökfras: "{Märke} {Modell} motorkod specifikationer"
   
   Hitta:
   • Motorkod (t.ex. B230F, D24, AAZ, CH) - KRITISKT för reservdelar
   • Oljetyp och volym
   • Kylvätska
   • Växellådsolja (⚠️ OBS! Äldre bilar kan kräva GL-4, EJ GL-5!)
   • Däcktryck

STEG 4: VANLIGA FEL & TIPS (VIKTIGT!)
────────────────────────────────────
Sök på svenska forum:
   Sökfras: "{Märke} {Modell} vanliga fel"
   Sökfras: "{Märke} {Modell} köpråd problem"
   Sökfras: "{Märke} {Modell} rostställen"

   Källor att prioritera:
   • Garaget.org (Svenska entusiaster)
   • Jagrullar.se (Volvo-fokus men bra generellt)
   • TheSamba.com (VW-klassiker)
   • Facebook-grupper för specifika märken
   • Svenska Wikisidor om modellen

═══════════════════════════════════════════════════════════════════════════════
SPECIALREGLER FÖR VETERANFORDON (>30 ÅR)
═══════════════════════════════════════════════════════════════════════════════

Äldre fordon har ofta:
• 5-siffrig mätare (kan ha "rullat över" - t.ex. 3362 mil kan vara 13362 eller 23362)
• Ofullständig digital data - kompensera med forum-research
• Modellspecifika kända problem som MÅSTE noteras:
  
  VW LT (1975-1996):
  ├─ Spindelbultar (kingpins) - MÅSTE smörjas var 500:e mil, annars skär de fast
  ├─ Bensinmotor = Audi CH 2.0L (samma som Porsche 924)
  ├─ Dieselmotor D24 = Samma som Volvo 240/740
  └─ Växellåda kräver GL-4 olja (GL-5 förstör synkronringarna!)

  Volvo 240/740:
  ├─ B230-motorer är "odödliga" men oljebyte viktigt
  ├─ Kontrollera bärarmsbussningar
  └─ Rost i innervinkel bakskärm/tröskel

  VW T3 (Caravelle/Transporter):
  ├─ Luftkyld motor = Kräver oljekylare som fungerar
  ├─ Motorlucka-tätningar läcker ofta
  └─ Framvagnsbussningar slits snabbt

═══════════════════════════════════════════════════════════════════════════════
DATA-VALIDERING (INNAN OUTPUT)
═══════════════════════════════════════════════════════════════════════════════

KVALITETSKONTROLL:
✓ Numeriska fält: Använd 0 ENDAST om data verkligen saknas
✓ Textfält: Använd "Okänt" om data saknas
✓ GISSA ALDRIG tekniska specifikationer
✓ Om du hittade <5 datapunkter från register, notera detta i analysrapporten

KONSISTENSKONTROLL:
✓ Motor + Effekt måste matcha (t.ex. 2.0L ≠ 150 HK på gammal bil)
✓ Viktuppgifter: Totalvikt > Tjänstevikt
✓ Mått: Längd > Bredd > Höjd (för de flesta bilar)

═══════════════════════════════════════════════════════════════════════════════
OUTPUT-FORMAT (STRIKT JSON)
═══════════════════════════════════════════════════════════════════════════════

Returnera ENDAST giltig JSON. Inga markdown-block (\`\`\`json), inga kommentarer.

{
  "projectName": "String (T.ex. 'Volvo 240 1990' eller 'VW LT31 - Elton')",
  "dataQuality": {
    "registryDataFound": Boolean,
    "forumDataFound": Boolean,
    "missingCriticalData": ["String lista över saknade viktiga fält"],
    "notes": "String (t.ex. 'Biluppgifter.se blockerade, använde alternativa källor')"
  },
  "vehicleData": {
    "regNo": "String",
    "make": "String",
    "model": "String",
    "year": Number,
    "prodYear": Number,
    "regDate": "String",
    "status": "String (I trafik/Avställd)",
    "bodyType": "String",
    "passengers": Number,
    "inspection": { "last": "String", "next": "String", "mileage": "String" },
    "engine": {
      "fuel": "String",
      "power": "String",
      "volume": "String",
      "code": "String (om känd, annars 'Okänt')"
    },
    "gearbox": "String",
    "wheels": {
      "drive": "String",
      "tiresFront": "String",
      "tiresRear": "String",
      "boltPattern": "String"
    },
    "dimensions": {
      "length": Number,
      "width": Number,
      "height": "String",
      "wheelbase": Number
    },
    "weights": {
      "curb": Number,
      "total": Number,
      "load": Number,
      "trailer": Number,
      "trailerB": Number
    },
    "vin": "String",
    "color": "String",
    "history": { "owners": Number, "events": Number, "lastOwnerChange": "String" },
    "maintenance": {
      "fluids": {
        "oilType": "String",
        "oilCapacity": "String",
        "coolantType": "String",
        "gearboxOil": "String"
      },
      "battery": { "type": "String", "capacity": "String" },
      "tires": { "pressureFront": "String", "pressureRear": "String" }
    }
  },
  "expertAnalysis": {
    "commonFaults": [
      { "title": "String", "description": "String", "urgency": "High/Medium/Low" }
    ],
    "modificationTips": [
      { "title": "String", "description": "String" }
    ],
    "maintenanceNotes": "String (Övergripande noteringar, t.ex. om 5-siffrig mätare)"
  }
}`;

async function runTest(regNo: string) {
    console.log(`\n🔍 Testing 'Detective' agent with RegNo: ${regNo}`);
    const prompt = detectivePrompt(regNo, false);


    try {
        console.log("🚀 Sending request to Gemini (with Google Search tool)...");
        const result = await ai.models.generateContent({
            model: "gemini-2.0-flash-exp",
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                tools: [{ googleSearch: {} }]
            }
        });

        const text = result.text || "";

        console.log("\n📦 Raw Response Preview (first 500 chars):");
        console.log(text.substring(0, 500) + "...");

        try {
            // Attempt to clean markdown json code blocks if present
            let jsonStr = text;
            if (jsonStr.includes("```json")) {
                jsonStr = jsonStr.split("```json")[1].split("```")[0];
            } else if (jsonStr.includes("```")) {
                jsonStr = jsonStr.split("```")[1].split("```")[0];
            }

            const data = JSON.parse(jsonStr.trim());
            console.log("\n✅ Valid JSON Parsed!");
            console.log(`- Project Name: ${data.projectName}`);
            console.log(`- Make/Model: ${data.vehicleData?.make} ${data.vehicleData?.model}`);
            console.log(`- Year: ${data.vehicleData?.year}`);
            console.log(`- RegNo: ${data.vehicleData?.regNo}`);

            if (data.vehicleData?.regNo?.replace(/\s/g, '') === regNo) {
                console.log("🎉 SUCCESS: Returned RegNo matches input!");
            } else {
                console.warn("⚠️ WARNING: Returned RegNo does not match input (or was generic).");
            }

        } catch (e) {
            console.error("\n❌ Failed to parse JSON response:", e);
        }

    } catch (error) {
        console.error("\n💥 AI Request Failed:", error);
    }
}

// Run test
runTest("UPR79Z");
