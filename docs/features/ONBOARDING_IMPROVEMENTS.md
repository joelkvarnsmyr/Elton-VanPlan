# 🎯 Förbättrad Onboarding - Design Spec

## Nuvarande problem:
1. ❌ Användaren har ingen kontroll över projekttyp (AI gissar)
2. ❌ Ingen möjlighet att ge smeknamn explicit
3. ❌ Ingen chans att granska/korrigera AI:ns gissningar innan projekt skapas
4. ❌ Allt händer i ett steg → ingen möjlighet att justera

---

## Föreslagen Stegvis Onboarding (Multi-Step Wizard)

### **STEG 1: Vad är målet?**
*Användaren väljer projekttyp FÖRST*

```
┌─────────────────────────────────────────────┐
│  🔧  Starta nytt projekt                    │
│  Berätta om ditt fordon                     │
├─────────────────────────────────────────────┤
│                                             │
│  VAD ÄR MÅLET?                              │
│                                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   🔧     │  │   🏗️     │  │   🍃     │  │
│  │Renovering│  │ Nybygge  │  │Förvaltning│  │
│  │          │  │          │  │          │  │
│  │Restaurera│  │Bygga om  │  │Underhålla│  │
│  │ & Laga   │  │till husbil│  │& Service │  │
│  └──────────┘  └──────────┘  └──────────┘  │
│      [X]           [ ]          [ ]         │
│                                             │
│  📝 FORDONSBESKRIVNING, LÄNK ELLER REGNR    │
│  ┌─────────────────────────────────────┐   │
│  │ t.ex. 'ABC123' eller 'Volvo 240'    │   │
│  │                                     │   │
│  └─────────────────────────────────────┘   │
│                                             │
│  📷 Ladda upp bild                          │
│  [Välj fil] (Valfritt - läser av regnr)    │
│                                             │
│  [Avbryt]           [Nästa: Research →]    │
└─────────────────────────────────────────────┘
```

**Fördelar:**
- Användaren bestämmer projekttyp explicit
- AI:n får bättre kontext för sin analys
- Tydligare UX - användaren vet vad som händer

---

### **STEG 2: AI Research (Loading Screen)**
*Samma som nu, men med valt projekttyp som input*

```
┌─────────────────────────────────────────────┐
│  🔍  Research pågår...                      │
│  Elton letar data hos Transportstyrelsen    │
├─────────────────────────────────────────────┤
│                                             │
│         🔄 [Spinner Animation]              │
│                                             │
│  ✅ Analyserar fordonsmodell & Regnr       │
│  🔄 Hämtar tekniska specifikationer        │
│  ⏳ Letar efter vanliga fel & manualer     │
│  ⏳ Skapar RENOVERINGS-plan & uppgifter    │
│     ^ BASERAT PÅ VALD PROJEKTTYP           │
│  ⏳ Skriver djuplodande analys             │
│  ⏳ Genererar flat design-ikon             │
│                                             │
└─────────────────────────────────────────────┘
```

---

### **STEG 3: Granska & Redigera** ⭐ **NYTT!**
*Användaren kan justera AI:ns förslag innan projekt skapas*

```
┌─────────────────────────────────────────────┐
│  ✨ Granska ditt projekt                    │
│  Justera det som behövs                     │
├─────────────────────────────────────────────┤
│                                             │
│  PROJEKTNAMN                                │
│  ┌─────────────────────────────────────┐   │
│  │ Volvo 240 - Pärlan              [✏️] │   │
│  └─────────────────────────────────────┘   │
│  💡 AI-förslag: "Volvo 240 GL 1988"        │
│                                             │
│  SMEKNAMN (Valfritt)                        │
│  ┌─────────────────────────────────────┐   │
│  │ Pärlan                                │   │
│  └─────────────────────────────────────┘   │
│  💬 Detta blir Eltons personlighet!        │
│                                             │
│  PROJEKTTYP                                 │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │   🔧     │  │   🏗️     │  │   🍃     │  │
│  │Renovering│  │ Nybygge  │  │Förvaltning│  │
│  └──────────┘  └──────────┘  └──────────┘  │
│      [X]           [ ]          [ ]         │
│  💡 AI rekommenderar: Renovering (pga. ålder)│
│                                             │
│  ═══════════════════════════════════════════│
│  FORDONSDATA (AI-analyserad)                │
│  ═══════════════════════════════════════════│
│                                             │
│  📋 Märke:     Volvo                   [✏️] │
│  📋 Modell:    240 GL                  [✏️] │
│  📋 År:        1988                    [✏️] │
│  📋 RegNr:     ABC123                  [✏️] │
│  📋 Motor:     B230F (2.3L, 115 hk)   [✏️] │
│  📋 Drivlina:  RWD, M46 manuell        [✏️] │
│                                             │
│  [▼ Visa mer detaljer]                     │
│                                             │
│  ═══════════════════════════════════════════│
│  AI HAR HITTAT 3 VANLIGA FEL               │
│  ═══════════════════════════════════════════│
│                                             │
│  ⚠️  Kamremsbyte (varje 10 år)             │
│      Urgency: HIGH                          │
│      [ ] Skapa uppgift automatiskt          │
│                                             │
│  ⚠️  Bakaxeltätningar läcker ofta          │
│      Urgency: MEDIUM                        │
│      [✓] Skapa uppgift automatiskt          │
│                                             │
│  ⚠️  Rost i bakskärmar                     │
│      Urgency: LOW                           │
│      [✓] Skapa uppgift automatiskt          │
│                                             │
│  ═══════════════════════════════════════════│
│  INITIALA UPPGIFTER (8 st)                 │
│  ═══════════════════════════════════════════│
│                                             │
│  [▼ Visa lista] (kollapsad som default)    │
│                                             │
│  [← Tillbaka]       [Skapa Projekt! 🚀]    │
└─────────────────────────────────────────────┘
```

**Vad händer här:**
1. ✅ Användaren ser AI:ns gissningar INNAN projektet skapas
2. ✅ Kan lägga till smeknamn explicit
3. ✅ Kan ändra projekttyp om AI gissade fel
4. ✅ Kan välja vilka "vanliga fel"-uppgifter som ska skapas
5. ✅ Kan redigera fordonsdata (om AI missade något)

---

## Tekniska Förbättringar

### 1. **AI Confidence Score** (förslag till framtiden)
När AI:n gissar projekttyp, ge ett "confidence score":

```typescript
{
  projectType: 'renovation',
  projectTypeConfidence: 0.85, // 85% säker
  projectTypeReasoning: 'Årsmodell 1988 + beskrivning innehåller "renovera" + fordonets ålder'
}
```

Om `confidence < 0.7` → visa varning i STEG 3:
```
⚠️ Osäker projekttyp
AI:n är bara 65% säker på att detta är en Renovering.
Dubbelkolla så det stämmer.
```

---

### 2. **Fler Redigeringsmöjligheter i STEG 3**

| Fält | Kan redigeras? | Varför? |
|------|---------------|---------|
| **Projektnamn** | ✅ JA | Användaren vill kanske ha "Pärlan" istället för "Volvo 240 GL" |
| **Smeknamn** | ✅ JA (nytt fält!) | Eltons personlighet baseras på detta |
| **Projekttyp** | ✅ JA | AI kan ha gissat fel |
| **Märke/Modell/År** | ✅ JA | Registerdata kan vara felaktiga |
| **Motor/Drivlina** | ✅ JA | Motorbyten är vanliga |
| **RegNr** | ✅ JA | OCR kan läsa fel |
| **Vanliga fel** | ✅ Checkboxar | Kanske redan fixat kamremmen? |
| **Initiala uppgifter** | 🔄 Visa lista | Användaren kan se vad som kommer skapas |

---

### 3. **Smart Nickname → Persona Mapping**

Om användaren ger smeknamn, använd det för personlighet:

```typescript
const nicknamePersonaMapping = {
  // Tuffa smeknamn
  'besten': 'tough',
  'odjuret': 'tough',
  'tanken': 'tough',

  // Gulliga smeknamn
  'pärlan': 'friendly',
  'gullvivan': 'friendly',
  'putten': 'friendly',

  // Retro smeknamn
  'veteranen': 'nostalgic',
  'oldtimern': 'nostalgic',

  // Arbetssmeknamn
  'arbetshästen': 'practical',
  'packåsnan': 'practical'
};

// Fallback: basera på ålder
if (!nickname) {
  persona = year < 1990 ? 'nostalgic' : 'modern';
}
```

Detta påverkar Eltons chatpersonlighet:
- **Tough**: "Jag är ingen pucko. Kör för fan!"
- **Friendly**: "Hej vännen! Jag mår bra idag ☺️"
- **Nostalgic**: "På min tid rullade vi utan ABS..."

---

### 4. **Conditional Fields Based on Project Type**

I STEG 3, visa olika fält beroende på projekttyp:

**RENOVATION:**
```
┌─────────────────────────────────────────┐
│ ⚠️ RENOVERINGSFRÅGOR                    │
├─────────────────────────────────────────┤
│ Är bilen besiktigad?                    │
│ ○ Ja  ● Nej  ○ Avställd                │
│                                         │
│ Finns det kända rost-problem?           │
│ ☐ Trösklar  ☐ Skärmar  ☐ Golv          │
│                                         │
│ Målbild:                                │
│ ○ Körbar inom 3 mån                     │
│ ● Restaurera till originalskick         │
│ ○ Bara säkerhet/besiktning              │
└─────────────────────────────────────────┘
```

**CONVERSION (Nybygge):**
```
┌─────────────────────────────────────────┐
│ 🏗️ OMBYGGNADSFRÅGOR                    │
├─────────────────────────────────────────┤
│ Vad ska byggas?                         │
│ ● Husbil/Camper                         │
│ ○ Verkstadsbil                          │
│ ○ Foodtruck                             │
│                                         │
│ Sovplatser:                             │
│ [2] st                                  │
│                                         │
│ Vill du ha:                             │
│ ☑ Solceller  ☑ Kök  ☐ Toalett  ☑ Vatten│
└─────────────────────────────────────────┘
```

**MAINTENANCE (Förvaltning):**
```
┌─────────────────────────────────────────┐
│ 🍃 UNDERHÅLLSFRÅGOR                     │
├─────────────────────────────────────────┤
│ Senaste service:                        │
│ [2024-06-15]                            │
│                                         │
│ Nuvarande miltal:                       │
│ [12,500] mil                            │
│                                         │
│ Servicestrategi:                        │
│ ● By-the-book (enligt tillverkarens plan)│
│ ○ Förebyggande (extra noggrann)        │
│ ○ Minimalistisk (bara nödvändigt)      │
└─────────────────────────────────────────┘
```

**Varför?**
- Ger AI:n MER kontext för att skapa bättre uppgifter
- Användaren ser att systemet förstår deras behov
- Skapar mer personaliserade projekt

---

## Sammanfattning av Förbättringar

| Förbättring | Prioritet | Komplexitet | Impact |
|------------|-----------|-------------|--------|
| **Steg 1: Projekttyp-väljare** | 🔴 HIGH | Low | HIGH - Användaren får kontroll |
| **Steg 3: Granska & Redigera** | 🔴 HIGH | Medium | HIGH - Förhindrar fel |
| **Smeknamn-fält** | 🟡 MEDIUM | Low | MEDIUM - Bättre personlighet |
| **Redigera fordonsdata** | 🟡 MEDIUM | Low | MEDIUM - Korrigera OCR-fel |
| **Vanliga fel → checkboxar** | 🟡 MEDIUM | Low | HIGH - Undvik dup. uppgifter |
| **Conditional fields (typ-spec. frågor)** | 🟢 LOW | Medium | MEDIUM - Mer kontext |
| **AI Confidence Score** | 🟢 LOW | Low | LOW - Nice-to-have |

---

## Implementation Plan

### Fas 1: Basic Multi-Step Wizard (1-2h)
```typescript
// New state in ProjectSelector.tsx
const [onboardingStep, setOnboardingStep] = useState(1); // 1, 2, or 3
const [selectedProjectType, setSelectedProjectType] = useState<ProjectType | null>(null);
const [aiSuggestions, setAiSuggestions] = useState<any>(null);

// Step 1: Projekttyp + input
// Step 2: Research (loading)
// Step 3: Review & Edit
```

### Fas 2: Editable Fields (1h)
- Lägg till edit-knappar för fordonsdata
- Lägg till smeknamn-fält
- Lägg till checkboxar för "vanliga fel"

### Fas 3: Conditional Questions (2h)
- Skapa olika formulär för varje projekttyp
- Skicka svaren till AI:n som extra kontext

---

## Vad tycker du?

Vilka delar vill du ha implementerade först?

1. **Quick Win**: Steg 1 (projekttyp-väljare) + Smeknamn-fält
2. **Full Flow**: Alla 3 steg med granska & redigera
3. **Advanced**: Conditional questions baserat på projekttyp

Säg till så börjar jag koda! 🚀
