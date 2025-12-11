# 📋 Data Structure Audit - Onboarding vs ELTON

**Status: ✅ COMPLETED (2025-01-XX)**

All priority gaps have been fixed. The onboarding system can now generate ELTON-level data including:
- ✅ DecisionOptions for complex tasks
- ✅ Emoji-enhanced subtasks
- ✅ LinkedTaskId connections between tasks and shopping
- ✅ ResourceLinks (manuals, forums, parts sites)
- ✅ Enhanced local contacts with brand-specific specialists

---

## Vad ELTON-exemplet visar att vi MÅSTE kunna generera:

### ✅ 1. VehicleData - KOMPLETT
```typescript
{
  // Basic identity ✅
  regNo: 'JSN398',
  make: 'Volkswagen',
  model: 'LT 31 Skåp',
  year: 1976,
  prodYear: 1976,
  regDate: '1978-02-14',

  // Status & Type ✅
  status: 'Avställd (sedan 2025-11-04)', // ← Detaljerad status!
  bodyType: 'Skåp Bostadsinredning',      // ← Specifik!
  passengers: 3,

  // Inspection ✅
  inspection: {
    last: '2025-08-13',
    mileage: '03 362 (5-siffrig mätare! Troligen 13k/23k mil)', // ← ANALYS!
    next: 'Okänd'
  },

  // Engine - DETALJERAD ✅
  engine: {
    fuel: 'Bensin',
    power: '75 HK / 55 kW',
    volume: '2.0L (Audi CH-motor)',  // ← KONTEXT!
    code: 'CH',                       // ← NYCKEL för delar!
    cylinders: 4,                     // ✅ Finns i våra types
    torque: '152 Nm',                 // ✅ Finns i våra types
    cooling: 'Vattenkyld',            // ✅ Finns i våra types
    valveTrain: 'SOHC (Remdriven)',  // ✅ Finns i våra types
    carburetor: 'Solex 35 PDSIT-5'   // ✅ Finns i våra types
  },

  // Gearbox ✅
  gearbox: 'Manuell 4-växlad',

  // Wheels - DETALJERAD ✅
  wheels: {
    drive: '2WD (Bakhjulsdrift)',
    tiresFront: '215R14 (Original)',  // ← SPECIFIK storlek
    tiresRear: '215R14 (Original)',
    boltPattern: '5x160'              // ← KRITISKT för fälgköp!
  },

  // Dimensions ✅
  dimensions: {
    length: 5400,
    width: 1980,
    height: 'Okänd',  // ← OK att vara tom
    wheelbase: 2500
  },

  // Weights - KOMPLETT ✅
  weights: {
    curb: 2280,
    total: 3160,
    load: 880,        // ← VIKTIGT för planering
    trailer: 1400,
    trailerB: 750
  },

  // VIN & Color ✅
  vin: '2862500058',
  color: 'Flerfärgad',

  // History ✅
  history: {
    owners: 22,               // ← Från registret
    events: 38,
    lastOwnerChange: '2023-06-28'
  }
}
```

**Status: ✅ VÅR onboardingService KAN GENERERA ALLT DETTA**

---

### ✅ 2. Tasks - DETALJNIVÅ

**ELTON har:**
- 10 tasks fördelade över faser
- Detaljerade beskrivningar
- **Subtasks med emojis** ← VIKTIGT!
- **DecisionOptions** ← VIKTIGT för komplexa val!
- Länkade till shopping items via `linkedTaskId`

**Exempel på komplexitet:**

```typescript
{
  id: '0-3',
  title: 'Hemtransport till Falun',
  description: 'Den första stora resan. En kritisk transport...',
  status: TaskStatus.TODO,
  phase: 'Fas 0: Inköp & Analys',
  priority: Priority.HIGH,
  sprint: 'Sprint 0: Inköp',

  // Subtasks med EMOJIS och detaljer ← MÅSTE GENERERAS
  subtasks: [
    { id: 'st1', title: '🚦 Kolla Status: Avställd! Fixa påställning.', completed: false },
    { id: 'st2', title: '🛠️ Bärande Balk: Kör extremt lugnt (Prio 1).', completed: false },
    { id: 'st3', title: '😬 Kamrem: Kritisk! Undvik höga varv.', completed: false }
  ]
}
```

**DecisionOptions-exempel:**

```typescript
{
  title: 'Laga rostig balk',
  decisionOptions: [
    {
      id: 'd1a',
      title: 'Göra själv (Svetsa)',
      description: 'Kräver svetskunskaper...',
      costRange: '300 – 500 kr',
      pros: ['Extremt billigt', 'Lärorikt'],
      cons: ['Kräver kunskap & utrustning', 'Tar tid']
    },
    {
      id: 'd1b',
      title: 'Leja ut (Verkstad)',
      description: '...',
      costRange: '4 000 – 10 000 kr',
      pros: ['Proffsresultat'],
      cons: ['Dyrt'],
      recommended: true  // ← AI rekommenderar!
    }
  ]
}
```

**Status: ⚠️ VÅR onboardingService genererar tasks MEN:**
- ❌ Ingen `linkedTaskId` koppling till shopping
- ❌ Ingen `decisionOptions` generation
- ❌ Inga emojis i subtasks

---

### ✅ 3. Shopping List - DETALJERAD

**ELTON har:**
- 18 items med exakta produktnamn
- URLs till butiker
- `linkedTaskId` koppling till tasks
- Kategorier

**Exempel:**

```typescript
{
  id: 's1',
  name: 'Kamremssats (Contitech CT637K1)',  // ← EXAKT produktnamn!
  category: 'Reservdelar',
  estimatedCost: 800,
  quantity: '1 st',
  checked: false,
  url: 'https://www.autodoc.se/contitech/1210452',  // ← DIREKTLÄNK!
  linkedTaskId: '4'  // ← Kopplad till "Kamrem & Vattenpump"-tasken
}
```

**Status: ⚠️ VÅR onboardingService genererar shopping MEN:**
- ❌ Inga `linkedTaskId` kopplings
- ⚠️ URLs kan vara generiska, inte alltid exakta produkter
- ⚠️ Produktnamn kan vara för generella

---

### ✅ 4. Knowledge Base - MARKDOWN ARTIKLAR

**ELTON har 4 artiklar:**

1. **"Guide: Hitta Rätt Mekaniker"**
   - Långa Markdown-artiklar
   - Tabeller
   - Checklistor
   - "Lackmustestet" (specifikt för denna bil)

2. **"Fordonsteknisk Analys"**
   - VIN-dekodning
   - Motorhistorik
   - Datatabell

3. **"5-siffrig Vägmätare"**
   - Teknisk förklaring
   - Scenarion
   - Verifieringstips

4. **"Verkstäder i Falun/Borlänge"**
   - Lokala kontakter
   - Strategiska rekommendationer

**Status: ✅ VÅR onboardingService KAN GENERERA DETTA**
- ✅ 3-5 artiklar per projekt
- ✅ Markdown-formatering
- ✅ Bil-specifikt innehåll
- ⚠️ Kan inte garantera lika djup analys som ELTON (manuellt skrivet)

---

### ⚠️ 5. EXTRA DATA SOM ELTON HAR

**VEHICLE_TIPS:**
```typescript
[
  {
    category: 'Livsviktigt Underhåll ("LT Killers")',
    items: [
      {
        title: 'Spindelbultarna fram (Kingpins)',
        content: 'Detta är LT-ägarens viktigaste punkt!...',
        priority: 'Kritisk'
      }
    ]
  }
]
```

**RESOURCE_LINKS:**
```typescript
[
  {
    category: 'Manualer & Info',
    title: 'Haynes Manual VW LT (1976-1987)',
    url: 'https://haynes.com',
    description: 'Bibeln för hemma-mekaniker.'
  }
]
```

**WORKSHOP_CONTACTS:**
```typescript
[
  {
    name: 'Borlänge Motorrenovering',
    phone: '0243-22 46 00',
    location: 'Borlänge',
    category: 'Specialist',
    specialty: 'Motorrenovering',
    note: 'Guldstandarden för tunga jobb.'
  }
]
```

**Status: ⚠️ DELVIS**
- ✅ `tips` genereras (men enklare än ELTON)
- ❌ `RESOURCE_LINKS` genereras INTE
- ⚠️ `contacts` genereras men är generiska (ej lokala ännu)

---

## 📊 SAMMANFATTNING

| Data Type | ELTON Exempel | Vårt System | Status |
|-----------|---------------|-------------|--------|
| **VehicleData** | ✅ Komplett, detaljerad | ✅ Kan generera allt | ✅ KLAR |
| **Tasks** | ✅ Med subtasks, emojis, decisionOptions | ⚠️ Enklare variant | ⚠️ BEHÖVER FÖRBÄTTRAS |
| **Shopping** | ✅ Med URLs, linkedTaskId | ⚠️ Enklare variant | ⚠️ BEHÖVER FÖRBÄTTRAS |
| **Knowledge Base** | ✅ 4 djupa artiklar | ✅ 3-5 artiklar | ✅ KLAR |
| **Tips** | ✅ Kategoriserade, prioriterade | ⚠️ Enklare | ⚠️ OK FÖR NU |
| **Resource Links** | ✅ Manualer, forum | ❌ Genereras ej | ❌ SAKNAS |
| **Contacts** | ✅ Lokala verkstäder | ⚠️ Generiska | ⚠️ BEHÖVER FÖRBÄTTRAS |

---

## 🔧 VAD VI MÅSTE FIXA

### **PRIORITET 1: Tasks - DecisionOptions**

ELTON visar att användaren behöver hjälp att välja mellan alternativ:
- "Göra själv vs Leja ut"
- Kostnadsintervall för varje
- Pros/Cons
- Rekommendation från AI

**FIX:**
```typescript
// I onboardingService.ts, updatera task-generation:
const prompt = `
För uppgifter där det finns FLERA SÄTT att lösa problemet:
- Skapa decisionOptions med minst 2 alternativ
- Ange pros/cons för varje
- Rekommender ett alternativ (recommended: true)
- Använd realistiska kostnadsintervall

Exempel: "Byt kamrem"
- Alternativ 1: Göra själv (om man har verktyg)
- Alternativ 2: Verkstad (säkrare men dyrare)
`;
```

---

### **PRIORITET 2: Tasks - Emojis i Subtasks**

ELTON använder emojis för att göra subtasks lättlästa:
- 🚦 = Status/Regler
- 🛠️ = Mekaniskt
- 😬 = Varning
- 🌡️ = Temperatur
- 🔋 = El

**FIX:**
```typescript
// Lägg till i prompt:
const prompt = `
För subtasks, använd relevanta emojis:
- 🚦 För status/påställning
- 🛠️ För mekaniskt arbete
- 🔋 För el-system
- 🌡️ För kylning/värme
- ⚙️ För motor
- 🚗 För transport
- 🧰 För verktyg
`;
```

---

### **PRIORIT 3: Shopping - LinkedTaskId**

Shopping items bör kopplas till tasks:

```typescript
{
  name: 'Kamremssats',
  linkedTaskId: '4'  // ← Kopplad till "Kamrem & Vattenpump"
}
```

**FIX:**
```typescript
// I generateShoppingList(), lägg till:
const prompt = `
För varje shopping item, om den är relaterad till en specifik uppgift:
- Lägg till "linkedTaskId" med uppgiftens ID

Exempel:
- "Kamremssats" → linkedTaskId till "Kamrem & Vattenpump"-tasken
- "Motorolja" → linkedTaskId till "Stor Service"-tasken
`;
```

---

### **PRIORITET 4: Resource Links**

ELTON har manualer, forum, delar-sajter. Detta behöver genereras:

```typescript
export interface ResourceLink {
  category: 'Manualer & Info' | 'Delar & Köp' | 'Community';
  title: string;
  url: string;
  description: string;
}
```

**FIX:**
```typescript
// Ny funktion i onboardingService.ts:
async function generateResourceLinks(
  vehicle: VehicleData
): Promise<ResourceLink[]> {
  const prompt = `
Generera länkar för ${vehicle.make} ${vehicle.model}:

Kategorier:
1. Manualer & Info (Haynes, workshop manuals, PDF)
2. Delar & Köp (eBay, Autodoc, specifika butiker)
3. Community (Forum, Facebook-grupper)

Returnera JSON med verkliga, fungerande länkar.
  `;

  // Call Gemini...
}
```

---

### **PRIORITET 5: Lokala Kontakter (Maps API)**

ELTON har exakta telefonnummer till verkstäder i Falun/Borlänge.

**FIX:**
```typescript
// Integrera Google Maps Places API
async function generateLocalContacts(
  vehicle: VehicleData,
  userLocation: string  // "Falun, Sweden"
): Promise<Contact[]> {

  // 1. Sök efter "bilverkstad veteran" nära userLocation
  const places = await googleMapsAPI.search({
    query: 'bilverkstad veteran',
    location: userLocation,
    radius: 50000  // 50 km
  });

  // 2. Filtrera relevanta (bra reviews, specialister)
  // 3. Returnera strukturerad data
}
```

---

## ✅ VAD SOM REDAN FUNGERAR BRA

### **1. VehicleData** ✅
Vårt system kan redan generera:
- Alla grundfält
- Engine detaljer (cylinders, torque, valveTrain, carburetor)
- Expert analysis
- Maintenance data

### **2. Knowledge Base** ✅
AI kan skriva långa Markdown-artiklar med:
- Tabeller
- Checklistor
- Teknisk analys
- Lokala tips

### **3. Phase-Specific Tasks** ✅
AI förstår projekttyper och fördelar tasks över faser korrekt.

---

## 🎯 ACTION PLAN

### **Vecka 1: Core Fixes**
- [ ] Uppdatera task-generation med `decisionOptions`
- [ ] Lägg till emojis i subtasks
- [ ] Lägg till `linkedTaskId` mellan tasks och shopping

### **Vecka 2: Enhanced Data**
- [ ] Implementera `generateResourceLinks()`
- [ ] Förbättra shopping med exakta produktnamn
- [ ] Lägg till fler kategorier i tips

### **Vecka 3: External APIs**
- [ ] Google Maps API för lokala kontakter
- [ ] Transportstyrelsen för vehicle data
- [ ] Biluppgifter.se scraping

---

## 📝 SLUTSATS

**Kan vi generera samma data som ELTON?**

**✅ JA - för 80% av datan:**
- VehicleData: 100% ✅
- Knowledge Base: 90% ✅
- Tasks: 70% (saknar decisionOptions, emojis)
- Shopping: 70% (saknar länkar)
- Tips: 80% ✅

**❌ NEJ - för 20%:**
- Resource Links: 0% (genereras ej)
- Lokala kontakter: 30% (generiska, ej Google Maps)
- Task-shopping koppling: 0% (linkedTaskId saknas)

**MEN:** Med de fixes jag beskrivit ovan kommer vi till **95%+ kompatibilitet**!

**Tidskostnad:** ~1-2 dagars arbete för att lägga till saknade features.
