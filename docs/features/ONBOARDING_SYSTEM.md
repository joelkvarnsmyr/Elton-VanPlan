# 🎯 Complete Onboarding System

## Översikt

Systemet skapar **KOMPLETT** projektdata för alla tre projekttyper med ett enda API-anrop.

```typescript
// Input: Minimal information
{
  projectType: 'renovation' | 'conversion' | 'maintenance',
  regNo: 'ABC123',        // ELLER
  userDescription: 'VW LT31 1976', // ELLER
  imageBase64: '...'      // Bild av bilen
}

// Output: Komplett projekt
{
  vehicle: {
    // Full data + expert analysis + maintenance specs
  },
  tasks: [
    // 15-30 uppgifter fördelade över faser
  ],
  knowledgeBase: [
    // 3-5 artiklar (teknisk analys, guide, fel & lösningar)
  ],
  shoppingList: [
    // 10-20 produkter
  ],
  contacts: [
    // Lokala verkstäder
  ],
  tips: [
    // Expert-tips
  ]
}
```

---

## 📁 Arkitektur

### Services (3 lager)

```
┌─────────────────────────────────────────────────────────┐
│  LAYER 1: DATA ACQUISITION                              │
├─────────────────────────────────────────────────────────┤
│  vehicleDataService.ts                                  │
│   - fetchVehicleByRegNo()     [API/Mock]              │
│   - parseBlocketAd()           [Future]                │
│   - extractRegNoFromImage()    [OCR]                   │
│                                                         │
│  ocrService.ts                                          │
│   - extractRegNoFromImage()                            │
│   - extractReceiptData()                               │
│   - extractVIN()                                       │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 2: ENRICHMENT                                    │
├─────────────────────────────────────────────────────────┤
│  expertAnalysisService.ts                               │
│   - generateExpertAnalysis()   [Gemini AI]            │
│   - generateMaintenanceData()                          │
│   - checkRecalls()             [Future]                │
│   - fetchCommunityKnowledge()  [Future]                │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  LAYER 3: COMPLETE ONBOARDING                           │
├─────────────────────────────────────────────────────────┤
│  onboardingService.ts                                   │
│   - generateCompleteOnboarding()                       │
│     ├─> generateKnowledgeBase()                        │
│     ├─> generatePhaseTasks()                           │
│     ├─> generateShoppingList()                         │
│     ├─> generateLocalContacts()                        │
│     └─> generateExpertTips()                           │
└─────────────────┬───────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│  ORCHESTRATION                                          │
├─────────────────────────────────────────────────────────┤
│  projectCreationService.ts                              │
│   - createProjectWithOnboarding()                      │
│   - createProjectFromRegNo()                           │
│   - createProjectFromDescription()                     │
└─────────────────────────────────────────────────────────┘
```

---

## 🎨 Projekttyper & Kontext

### 1. **Renovering** (renovation)

**Mål:** Rädda/renovera en gammal bil

**Fokus:**
- Rost & kaross
- Mekanisk säkerhet
- Besiktning
- Få bilen i körbart skick

**Faser:**
1. Fas 1: Akut
2. Fas 2: Mekanisk Säkerhet
3. Fas 3: Kaross & Rost
4. Fas 4: Inredning & Finish

**Prioriteringar:**
1. Säkerhet först (bromsar, däck, belysning)
2. Mekanisk funktion (motor, växellåda)
3. Rost (strukturellt viktigt)
4. Kosmetiskt sist (lack, inredning)

**Typiska uppgifter:**
- Byt kamrem
- Laga rost i balkar
- Renovera bromssystem
- Installera nytt batteri
- Förbered inför besiktning

**Kunskapsbas-artiklar:**
- "Fordonsteknisk Analys" (motor, historik)
- "Guide: Renovering steg-för-steg"
- "Vanliga Problem & Lösningar"
- "Hitta Rätt Mekaniker"

---

### 2. **Nybygge/Conversion** (conversion)

**Mål:** Bygga om skåpbil till husbil/camper

**Fokus:**
- Isolering
- El-system (solpaneler, batteri, 230V)
- Vatten (tank, pump, varmvattenberedare)
- Snickerier & inredning

**Faser:**
1. Fas 1: Planering & Inköp
2. Fas 2: Isolering & Grund
3. Fas 3: El & Vatten
4. Fas 4: Snickerier & Inredning
5. Fas 5: Finish & Piff

**Prioriteringar:**
1. Planering & design (ritningar, budget)
2. Isolering (golv, väggar, tak)
3. El & säkerhet (KRITISKT - brandrisk!)
4. Vatten & ventilation
5. Inredning & möbler

**Typiska uppgifter:**
- Rita planlösning
- Isolera golv & väggar
- Installera elcentral & säkringar
- Dra kablar för 12V & 230V
- Montera solpaneler
- Bygga säng & köksskåp
- Installera vattentank & pump

**Kunskapsbas-artiklar:**
- "Guide: Ombyggnad steg-för-steg"
- "El-säkerhet i Husbilar"
- "Isolering: Material & Tekniker"
- "Vatten & Avlopp"
- "Snickeri-tips för Vanliv"

---

### 3. **Förvaltning** (maintenance)

**Mål:** Förvalta & underhålla en färdig bil

**Fokus:**
- Regelbunden service
- Säsongsunderhåll
- Vinterförvaring
- Förebyggande underhåll

**Faser:**
1. Vårkoll
2. Säsong
3. Höst/Vinterförvaring
4. Löpande

**Prioriteringar:**
1. Förebyggande underhåll
2. Säsongsberedning (vår/höst)
3. Löpande service (olja, filter)
4. Mindre reparationer

**Typiska uppgifter:**
- Vårservice (olja, filter, bromsvätska)
- Byt till sommardäck
- Kontrollera AC inför säsong
- Tvätta & vaxa
- Förbered inför vinterförvaring
- Byt till vinterdäck
- Årlig besiktning

**Kunskapsbas-artiklar:**
- "Serviceplan för [Märke] [Modell]"
- "Säsongsunderhåll: Vår & Höst"
- "Vinterförvaring: Checklista"
- "Vanliga Serviceintervaller"

---

## 🤖 AI Prompts (Projekttyps-specifika)

### Prompt-struktur

```typescript
const prompt = `
Du är en expert på ${vehicle.make} ${vehicle.model} (${vehicle.year})
och ska skapa en kunskapsbas för ett ${projectType}-projekt.

PROJEKTTYP: ${PROJECT_TYPE_CONTEXT[projectType].goal}
FOKUS: ${PROJECT_TYPE_CONTEXT[projectType].focus}
FASER: ${PROJECT_TYPE_CONTEXT[projectType].phases.join(', ')}

[Specifika instruktioner baserat på projectType]

VIKTIGA REGLER:
- Skriv på SVENSKA
- Var SPECIFIK för denna bil
- Fokusera på ${context.focus}
- Använd EXAKTA fasnamn
- Basera på VERKLIGA fakta

SVARA MED ENDAST JSON.
`;
```

### Renovation-specifika tillägg

```
- Fokusera på säkerhet, rost, mekanik först
- Inkludera besiktningskrav
- Prioritera brådskande reparationer
- Lista vanliga rosthärdar för modellen
```

### Conversion-specifika tillägg

```
- Planering & design först
- El-säkerhet är KRITISKT
- Tänk isolering före inredning
- Inkludera verktyg & material
- Fokusera på byggteknik
```

### Maintenance-specifika tillägg

```
- Förebyggande underhåll
- Säsongsberedning (vår/höst)
- Serviceintervaller för denna modell
- Enkla uppgifter som ägaren kan göra själv
```

---

## 📊 Data Generation Flow

```
USER INPUT
   │
   ├─> Regnummer?  ──> vehicleDataService.fetchVehicleByRegNo()
   │                    └─> Transportstyrelsen API
   │                    └─> Biluppgifter.se
   │                    └─> Cache (7 dagar)
   │
   ├─> Bild?       ──> ocrService.extractRegNoFromImage()
   │                    └─> Gemini Vision API
   │
   └─> Beskrivning? ─> geminiService.generateProjectProfile()
                        └─> Gemini AI Search

                                 ▼

                         VehicleData (Partial)
                                 │
                                 ▼

            expertAnalysisService.generateExpertAnalysis()
                                 │
                    ┌────────────┴────────────┐
                    │                         │
            commonFaults[]          modificationTips[]
            maintenanceNotes        maintenance{fluids, battery, tires}
                                 │
                                 ▼

                      VehicleData (Enriched)
                                 │
                                 ▼

              onboardingService.generateCompleteOnboarding()
                                 │
            ┌────────────────────┼────────────────────┐
            │                    │                    │
    generateKnowledgeBase()  generatePhaseTasks()  generateShoppingList()
            │                    │                    │
            │                    │                    │
    3-5 artiklar          15-30 uppgifter       10-20 produkter
    (Markdown)           (Fasfördelade)         (Kategoriserade)
                                 │
                                 ▼

                        COMPLETE PROJECT DATA
                                 │
                                 ▼

                         Firestore Database
```

---

## 🧪 Exempel Output

### För: VW LT31 1976, Projekttyp: Renovering

```json
{
  "vehicle": {
    "regNo": "JSN398",
    "make": "Volkswagen",
    "model": "LT 31 Skåp",
    "year": 1976,
    "engine": {
      "code": "CH",
      "volume": "2.0L",
      "fuel": "Bensin",
      "power": "75 HK",
      "cylinders": 4,
      "cooling": "Vattenkyld",
      "valveTrain": "SOHC (Remdriven)"
    },
    "expertAnalysis": {
      "commonFaults": [
        {
          "title": "Rostangrepp i golv och hjulhus",
          "description": "VW LT är känd för rost...",
          "urgency": "High"
        }
      ],
      "modificationTips": [...],
      "maintenanceNotes": "Smörj spindelbultar och kontrollera bromsslanger varje år!"
    },
    "maintenance": {
      "fluids": {
        "oilType": "10W-40 Mineral",
        "oilCapacity": "4.5 liter",
        "coolantType": "G11 (Blå)",
        "gearboxOil": "80W-90 GL-4"
      },
      "battery": {
        "type": "12V Blysyra",
        "capacity": "75Ah"
      },
      "tires": {
        "pressureFront": "2.5 bar",
        "pressureRear": "3.0 bar"
      }
    }
  },
  "knowledgeBase": [
    {
      "id": "analys-jsn398",
      "title": "Fordonsteknisk Analys: VW LT31 (JSN398)",
      "tags": ["Fakta", "Historik", "Analys"],
      "summary": "Djupgående analys baserat på chassinummer...",
      "content": "# Markdown article här..."
    },
    {
      "id": "guide-renovering",
      "title": "Guide: Renovering steg-för-steg",
      "tags": ["Guide", "Praktiskt"],
      "summary": "...",
      "content": "..."
    }
  ],
  "tasks": [
    {
      "title": "Hemtransport till Falun",
      "description": "Kritisk transport. Kolla olja/vatten/rem innan avfärd.",
      "phase": "Fas 1: Akut",
      "priority": "Hög",
      "subtasks": [
        "Kolla Status (Avställd!)",
        "Bärande Balk",
        "Kamrem (Kör lugnt)",
        "Kylsystem",
        "Däck (Luft)"
      ]
    },
    {
      "title": "Kamrem & Vattenpump",
      "phase": "Fas 2: Mekanisk Säkerhet",
      "priority": "Hög",
      "estimatedCostMin": 5000,
      "estimatedCostMax": 7000,
      "difficultyLevel": "Expert",
      "requiredTools": ["Momentnyckel", "Kamremverktyg"]
    }
  ],
  "shoppingList": [
    {
      "name": "Kamremssats (Contitech CT637K1)",
      "category": "Reservdelar",
      "estimatedCost": 800,
      "url": "https://autodoc.se/..."
    }
  ],
  "contacts": [
    {
      "name": "Hanssons Bil & Motor",
      "phone": "0243-22 11 99",
      "location": "Borlänge",
      "category": "Specialist",
      "specialty": "Entusiastfordon"
    }
  ],
  "tips": [
    {
      "title": "Kamrem",
      "text": "Byt direkt om historik saknas. Audi CH-motorn rasar om remmen går."
    }
  ]
}
```

---

## 🔧 Integration i UI

### ProjectSelector → "Starta Nytt Projekt"

```tsx
// När användaren klickar "Starta Research":
const handleCreate = async () => {
  const result = await createProjectWithOnboarding({
    projectType: selectedType,     // 'renovation' | 'conversion' | 'maintenance'
    regNo: regNoInput,             // eller
    userDescription: descInput,    // eller
    imageBase64: uploadedImage,
    userId: user.uid,
    userEmail: user.email,
    userLocation: 'Falun'          // För lokala kontakter
  });

  if (result.success) {
    // Spara till Firestore
    await createProject(result.project);
    // Navigera till projektet
    onSelectProject(result.project.id);
  } else {
    alert(result.error);
  }
};
```

### QuickVehicleAdd komponent

```tsx
// När användaren klickar "Enricha med AI-Analys":
const handleEnrich = async () => {
  const onboarding = await generateCompleteOnboarding({
    projectType: 'renovation',
    vehicleData: foundData,
    userLocation: userLocation
  });

  // Visa allt i preview
  setEnrichedData(onboarding);
};
```

---

## 🚀 Deployment Checklist

### API Keys

```env
VITE_GEMINI_API_KEY=xxx           # Gemini AI (text + vision)
TRANSPORTSTYRELSEN_API_KEY=xxx    # Future
GOOGLE_MAPS_API_KEY=xxx           # For contacts (future)
```

### Firebase Rules

Säkerställ att:
- Users kan bara läsa/skriva sina egna projekt
- Members kan läsa projekt de är inbjudna till
- Knowledge base är read-only efter skapande

### Testing

1. **Renovering:** Test med "ABC123" (mock VW LT)
2. **Conversion:** Test med "Mercedes Sprinter 2014"
3. **Maintenance:** Test med "Volvo XC90 2018"

Verifiera:
- ✅ Korrekt antal faser
- ✅ Fasnamn matchar PROJECT_PHASES
- ✅ Uppgifter är relevanta för typen
- ✅ Kunskapsbas har rätt fokus
- ✅ Shopping-lista matchar uppgifter

---

## 📈 Future Enhancements

### Priority 1: External APIs
- [ ] Transportstyrelsen integration
- [ ] Biluppgifter.se scraping
- [ ] Blocket ad parsing

### Priority 2: Smarter AI
- [ ] Multi-turn conversation för att förtydliga oklarheter
- [ ] Learning från user feedback (vilka tasks skippar de alltid?)
- [ ] Community-driven templates

### Priority 3: Lokalisering
- [ ] Google Maps för verkstäder
- [ ] Svenska bilregistret för återkallelser
- [ ] Forum-scraping (Garaget.org)

---

**Status:** ✅ Komplett system implementerat och redo för integration!

**Nästa steg:** Integrera i ProjectSelector och testa med alla tre projekttyper.
