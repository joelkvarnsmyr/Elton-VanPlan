# 🎯 Realistisk Onboarding - Baserat på faktisk data

## Vad kan vi FAKTISKT veta i varje steg?

### **STEG 1: Användarens Input**
*Vad användaren explicit berättar för oss*

```
┌─────────────────────────────────────────────┐
│  🔧  Starta nytt projekt                    │
│  Berätta om ditt fordon                     │
├─────────────────────────────────────────────┤
│                                             │
│  VAD ÄR MÅLET?                              │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   🔧     │  │   🚐     │  │   🍃     │  │
│  │Renovering│  │Ombyggnad │  │Förvaltning│  │
│  │          │  │          │  │          │  │
│  │Restaurera│  │Van→Camper│  │Underhålla│  │
│  │ & Laga   │  │          │  │& Service │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│      [X]           [ ]          [ ]         │
│                                             │
│  📝 FORDONSBESKRIVNING, LÄNK ELLER REGNR    │
│  ┌─────────────────────────────────────┐   │
│  │ ABC123                              │   │
│  │ eller                               │   │
│  │ blocket.se/annons/123456            │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📷 Ladda upp bild                          │
│  [Välj fil] (OCR läser RegNr)              │
│                                             │
│  👤 DIN KUNSKAPSNIVÅ                        │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   🔰     │  │   🔧     │  │   ⭐     │  │
│  │  Nybörjare│  │ Hemmameck│  │Certifierad│  │
│  │          │  │          │  │  Mekaniker│  │
│  │"Rocke"   │  │"Gör själv"│  │"Proffsigt"│  │
│  └──────────┘  └──────────┘  └──────────┘  │
│      [ ]          [X]           [ ]         │
│                                             │
│  💬 Detta påverkar svårighetsgrad på        │
│     uppgifter och Eltons förklaringar      │
│                                             │
│  [Avbryt]           [Nästa: Research →]    │
└─────────────────────────────────────────────┘
```

**Användarens kunskapsnivå påverkar:**
- **Nybörjare**: AI skippar Expert-uppgifter, föreslår verkstad för allt svårt
- **Hemmameck**: Balanserad mix, föreslår verkstad för Expert-uppgifter
- **Certifierad**: Alla uppgifter inkl. Expert, mer tekniska detaljer

---

### **STEG 2: AI Research**
*Vad AI:n kan ta reda på från källor*

**Från biluppgifter.se/car.info:**
- ✅ RegNr, Märke, Modell, År
- ✅ Motor, Drivlina, Vikter
- ✅ **Besiktad/Avställd status**
- ✅ **Senaste besiktning & miltal**
- ✅ Antal ägare

**Från Blocket-annons (om länk ges):**
- ✅ Beskrivning (kan innehålla "rost", "skador", "nybesiktigad")
- ✅ Pris (indikerar skick)
- ✅ Bilder (AI kan se rost/skador visuellt)
- ✅ Säljares kommentarer ("nyservad", "kamrem bytt 2023")

**Från Google Search:**
- ✅ Modell-specifika vanliga problem (generella, ej detta fordon)
- ✅ Servicemanualer
- ✅ Forumstrådar om modellen

**Vad AI INTE kan veta:**
- ❌ Faktiskt tillstånd på DETTA fordon
- ❌ Vad ägaren redan fixat
- ❌ Servicehistorik (såvida inte Blocket-säljaren nämner det)

---

### **STEG 3: Granska & Komplettera**
*AI visar vad den vet, användaren fyller i luckor*

```
┌─────────────────────────────────────────────┐
│  ✨ Granska & Komplettera                   │
│  Hjälp oss förstå ditt fordon               │
├─────────────────────────────────────────────┤
│                                             │
│  PROJEKTNAMN                                │
│  ┌─────────────────────────────────────┐   │
│  │ Volvo 240 - Pärlan              [✏️] │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  SMEKNAMN (Valfritt)                        │
│  ┌─────────────────────────────────────┐   │
│  │ Pärlan                                │   │
│  └─────────────────────────────────────┘   │
│  💬 Påverkar Eltons personlighet!          │
│                                             │
│  ═══════════════════════════════════════════│
│  FORDONSDATA (från biluppgifter.se)         │
│  ═══════════════════════════════════════════│
│                                             │
│  📋 Märke:     Volvo                   [✏️] │
│  📋 Modell:    240 GL                  [✏️] │
│  📋 År:        1988                    [✏️] │
│  📋 RegNr:     ABC123                  [✏️] │
│  📋 Motor:     B230F (2.3L, 115 hk)   [✏️] │
│                                             │
│  📊 STATUS                                  │
│  • Besiktigad: 2024-08-13 (OK)             │
│  • Miltal vid besiktning: 23,400 mil       │
│  • Status: I trafik                        │
│                                             │
│  [▼ Visa alla tekniska detaljer]           │
│                                             │
│  ═══════════════════════════════════════════│
│  KOMPLETTERA MED DET DU VET               │
│  ═══════════════════════════════════════════│
│                                             │
│  📅 RENOVERING: Hur långt har du kommit?   │
│  ┌─────────────────────────────────────┐   │
│  │ ○ Nyligen köpt, inte börjat          │   │
│  │ ● Påbörjad - vissa saker fixade      │   │
│  │ ○ Nästan klar - bara småfix kvar     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📸 HAR DU SERVICEBOKEN?                    │
│  ┌─────────────────────────────────────┐   │
│  │ Fotografera serviceboken så          │   │
│  │ digitaliserar vi den åt dig!         │   │
│  │                                       │   │
│  │  [📷 Ladda upp servicebok-foto]      │   │
│  │                                       │   │
│  │  💡 Vi läser av:                     │   │
│  │  • Servicehistorik (datum & miltal)  │   │
│  │  • Vad som gjorts (kamrem, olja etc) │   │
│  │  • Vad som snart behövs göras        │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📝 FRIA ANTECKNINGAR                       │
│  ┌─────────────────────────────────────┐   │
│  │ Har bytt kamrem 2023.                │   │
│  │ Lite rost i höger bakskärm.          │   │
│  │ Motorn går bra men avgassystemet     │   │
│  │ är lite rostigt.                      │   │
│  └─────────────────────────────────────┘   │
│  💬 Detta skickas till AI:n som kontext   │
│                                             │
│  ═══════════════════════════════════════════│
│  🤖 ELTON KOMMER ATT:                      │
│  ═══════════════════════════════════════════│
│                                             │
│  ✅ Skapa en projektplan baserat på:       │
│     • Projekttyp (Renovering)              │
│     • Fordonets ålder & tillstånd          │
│     • Din kunskapsnivå (Hemmameck)         │
│     • Dina anteckningar                    │
│                                             │
│  ✅ Föreslå uppgifter i rätt fas            │
│     (t.ex. "Akut", "Mekanisk", "Kaross")   │
│                                             │
│  ✅ Hämta modell-specifik information       │
│     (vanliga problem med Volvo 240)        │
│                                             │
│  ✅ Du kan sedan chatta med Elton för att:  │
│     • Få hjälp med planering               │
│     • Skapa fler uppgifter                 │
│     • Analysera foton (rost, skador)       │
│     • Digitalisera kvitton & inköpslistor  │
│                                             │
│  [← Tillbaka]       [Skapa Projekt! 🚀]    │
└─────────────────────────────────────────────┘
```

---

## Vad händer EFTER projektet skapas?

### **Onboarding-flow i själva projektet:**

**Welcome Screen (första gången användaren öppnar projektet):**
```
┌─────────────────────────────────────────────┐
│  👋 Hej! Jag är Pärlan                      │
│  Din digitala projektassistent              │
├─────────────────────────────────────────────┤
│                                             │
│  Jag kan hjälpa dig med:                    │
│                                             │
│  💬 Chatta med mig för att:                 │
│     • Planera uppgifter                     │
│     • Analysera foton (rost, skador)        │
│     • Digitalisera servicebok & kvitton     │
│     • Få råd om reparationer                │
│                                             │
│  📋 Exempel på vad du kan säga:             │
│     • "Hjälp mig planera rostarbetet"       │
│     • "Vad behöver jag för verktyg?"        │
│     • "Analysera denna bild på rost"        │
│     • "Skapa inköpslista för kamremsbyte"   │
│                                             │
│  [Okej, jag förstår!]  [Ta en rundtur →]   │
└─────────────────────────────────────────────┘
```

### **AI skapar GENERELLA uppgifter, användaren specificerar:**

**Exempel på initiala uppgifter för Volvo 240 Renovering:**

```typescript
tasks: [
  {
    title: "Inspektion & Statusbedömning",
    description: "Gör en grundlig genomgång av fordonet",
    phase: "Fas 1: Akut",
    priority: "Hög",
    subtasks: [
      "🔍 Kontrollera rost (trösklar, skärmar, golv)",
      "🚦 Testa bromsar och styrning",
      "💡 Kolla belysning",
      "🌡️ Kontrollera vätskor (olja, kylvätska)",
      "📸 Fotografera allt - chatta sen med Elton för analys"
    ],
    difficultyLevel: "Easy"
  },
  {
    title: "Kamrem & Vattenpump",
    description: "Volvo 240 behöver kamremsbyte var 10:e år eller 20,000 mil",
    phase: "Fas 2: Mekanisk",
    priority: "Hög",
    estimatedCostMin: 800,
    estimatedCostMax: 3000,
    difficultyLevel: "Expert",
    decisionOptions: [
      {
        title: "Gör själv",
        costRange: "800-1200 kr (delar)",
        pros: ["Billigare", "Lärorikt"],
        cons: ["Tar 4-6 timmar", "Kräver specialverktyg", "Risk om fel"],
        recommended: false // pga. användaren är "Hemmameck", inte "Certifierad"
      },
      {
        title: "Leja ut till verkstad",
        costRange: "2500-3500 kr (delar + arbete)",
        pros: ["Snabbt", "Garanti", "Säkert"],
        cons: ["Dyrare"],
        recommended: true
      }
    ],
    subtasks: [] // Tomt! Användaren chattar med Elton för att specificera
  },
  {
    title: "Rostskydd & Karossarbete",
    description: "Åtgärda rost och skydda mot framtida rost",
    phase: "Fas 3: Kaross",
    priority: "Medel",
    subtasks: [
      "📸 Fotografera alla rostställen",
      "💬 Chatta med Elton för att få bedömning",
      "🎯 Prioritera kritiska områden först"
    ],
    difficultyLevel: "Medium"
  }
]
```

**Nyckeln:** Uppgifterna är **MALLAR** som användaren fyller i via CHAT!

---

## Projekt-specifika frågor baserat på typ:

### **OMBYGGNAD (Van → Camper)** ⭐ Det enda vi har!

```
┌─────────────────────────────────────────────┐
│  🚐 OMBYGGNADSFRÅGOR                        │
├─────────────────────────────────────────────┤
│                                             │
│  Antal sovplatser:                          │
│  ┌────┐                                     │
│  │ 2  │ st                                  │
│  └────┘                                     │
│                                             │
│  Vill du ha: (påverkar inköpslista)         │
│  ☑ Solceller & Batteri                      │
│  ☑ Kök (gasolkök/spritkök)                 │
│  ☑ Vattensystem (tank + pump)              │
│  ☐ Toalett (kemtoalett)                    │
│  ☑ Uppvärmning (diesel/gas)                │
│  ☑ Isolering (viktigast!)                  │
│                                             │
│  Budget (ungefär):                          │
│  ○ <50,000 kr (Enkel camper)               │
│  ● 50,000-100,000 kr (Standard)            │
│  ○ >100,000 kr (Lyxig)                     │
│                                             │
│  💬 Baserat på detta skapar vi:            │
│     • Fasindelad plan (Planering, El,       │
│       Isolering, Vatten, Inredning)        │
│     • Inköpslista med uppskattade priser    │
│     • Säkerhetskrav (el-inspektion!)        │
└─────────────────────────────────────────────┘
```

### **FÖRVALTNING (Underhåll)**

```
┌─────────────────────────────────────────────┐
│  🍃 FÖRVALTNINGSFRÅGOR                      │
├─────────────────────────────────────────────┤
│                                             │
│  📅 Senaste service:                        │
│  [2024-06-15] (eller "Vet ej")             │
│                                             │
│  🚗 Nuvarande miltal:                       │
│  [12,500] mil                               │
│                                             │
│  📸 HAR DU SERVICEBOKEN?                    │
│  [📷 Ladda upp foto] → Vi digitaliserar!   │
│                                             │
│  Servicestrategi:                           │
│  ● By-the-book (tillverkarens intervaller) │
│  ○ Förebyggande (mer frekvent)             │
│  ○ Minimalistisk (bara när nödvändigt)     │
│                                             │
│  💬 Vi skapar:                              │
│     • Serviceplan baserat på miltal         │
│     • Påminnelser för kommande service      │
│     • Inköpslista för servicedelar          │
└─────────────────────────────────────────────┘
```

---

## OCR för Servicebok - Teknisk Spec

**Input:** Foto av servicebok-sida
**Output:** Strukturerad data

```typescript
interface ServiceBookEntry {
  date: string;           // "2023-05-12"
  mileage: number;        // 23400
  description: string;    // "Kamrem, vattenpump, 20 servicedelar"
  workshop: string;       // "Mekonomen Falun"
  cost?: number;          // 3500 (om synligt)
  parts: string[];        // ["Kamremssats", "Vattenpump", "Oljefilter"]
}

// AI detekterar också:
nextServiceDue: {
  mileage: 25000,  // Om serviceboken säger "Nästa service: 25k mil"
  items: ["Oljebyte", "Kontroll av bromsar"]
}
```

**Användaren får:**
```
✅ Servicehistorik sparad i projektet
✅ Automatiska påminnelser: "Kamremsbyte gjordes 2023 - bra för 10 år!"
✅ Undvik dubbelarbete: "Oljefiltret byttes för 500 mil sen, skippa det"
```

---

## Kunskapsnivå → Uppgiftsanpassning

| Kunskapsnivå | Vad visas | Vad föreslås | Eltons ton |
|--------------|-----------|--------------|------------|
| **🔰 Nybörjare** | Endast Easy & Medium | Verkstad för allt Expert | "Låt mig förklara steg-för-steg..." |
| **🔧 Hemmameck** | Easy, Medium, vissa Expert | Verkstad för svåra Expert | "Du klarar nog detta själv!" |
| **⭐ Certifierad** | Alla nivåer | DIY rekommenderas | "Jag antar att du vet hur man gör detta..." |

**Exempel på samma uppgift för olika nivåer:**

**Nybörjare:**
```
Title: "Oljebyte - Verkstad rekommenderas"
Subtasks:
  • 🏪 Hitta lokal verkstad
  • 📞 Boka tid
  • 📝 Fråga om syntetisk olja
```

**Hemmameck:**
```
Title: "Oljebyte"
DecisionOptions: [DIY, Verkstad]
Subtasks:
  • 🧰 Ordna rätt verktyg (momentnyckel, oljefat)
  • 🔧 Losssa plugg (kolla att den inte sitter för hårt)
  • 🌡️ Byt filter samtidigt
```

**Certifierad:**
```
Title: "Oljebyte"
Subtasks:
  • B230F: 4L 10W-40, filter: Bosch 0451103033
```

---

## Sammanfattning: Vad vi faktiskt kan veta

| Data | Källa | Tillförlitlighet |
|------|-------|------------------|
| RegNr, Märke, År | Biluppgifter.se | ✅ 100% |
| Motor, Drivlina | Biluppgifter.se | ✅ 95% (ej vid motorbyte) |
| Besiktad/Avställd | Biluppgifter.se | ✅ 100% |
| Senaste besiktning | Biluppgifter.se | ✅ 100% |
| Skador/Rost på DETTA fordon | Blocket-annons text | 🟡 50% (säljaren kan ljuga) |
| Servicehistorik | OCR av servicebok | 🟡 70% (om foto är tydligt) |
| Vanliga fel för MODELLEN | Google Search | ✅ 90% (generellt, ej detta fordon) |
| Faktiskt tillstånd | Användarens anteckningar | ✅ 100% (om användaren är ärlig) |

**Vi kan INTE gissa:**
- ❌ Om kamremmen är bytt (såvida det inte står i servicebok/Blocket)
- ❌ Om det finns rost (måste synas på Blocket-bilder eller användaren berättar)
- ❌ Vad som redan fixats

**Därför:**
1. AI skapar MALLAR baserat på modell + ålder + projekttyp
2. Användaren kompletterar via anteckningar eller servicebok-OCR
3. Användaren chattar med Elton för att specificera uppgifter
4. Elton kan analysera foton och skapa riktade uppgifter

**Next Step:** Implementera stegvis wizard med realistiska förväntningar!
