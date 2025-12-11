# 🔍 Prompt-Analys & Förbättringar
## VanPlan / Elton AI-system

**Analyserad:** 2025-12-11  
**Version:** 2.0

---

## 📋 Sammanfattning

Jag har analyserat ditt prompt-system och identifierat flera förbättringsområden. De viktigaste upptäckterna:

### Problem med nuvarande implementation

1. **Datakällor är opålitliga**
   - `biluppgifter.se` returnerar ofta 403 (kräver CAPTCHA/inloggning)
   - `car.info` har liknande begränsningar
   - Äldre fordon (pre-1990) har ofta ofullständig digital data

2. **Prompterna saknar fallback-strategier**
   - Om primär datakälla misslyckas finns ingen plan B
   - Resulterar i ofullständig data eller AI-hallucinationer

3. **Beroende-hantering (blockers) är otydlig**
   - Viktigt för vanlife-byggen där rost MÅSTE fixas före isolering
   - Nuvarande prompt nämner det men strukturerar det inte tydligt

4. **Kostnadsuppskattningar är för vaga**
   - Saknar kontext (DIY vs verkstad)
   - Inga 2025-priser som referens

---

## 🔧 Förbättringar i nya prompterna

### 1. Detective Agent (Fordansdata)

**Före:**
```
Sök EXAKT på: 'site:biluppgifter.se {REGNR}'
```

**Efter:**
```
STEG 2: REGISTERDATA (OM REGNR FINNS)
⚠️ VIKTIGT: Dessa sidor kan ha CAPTCHA eller kräva inloggning. Försök ändå.

A) Primär sökning:
   Sökfras: "{REGNR} fordon tekniska data"
   Alternativ: "{REGNR} biluppgifter" eller "{REGNR} bilinfo"

B) Om sidor blockar åtkomst, försök:
   - Transportstyrelsen offentliga data
   - Svenska forum som Garaget.org eller Jagrullar.se
   - Privatannonser (Blocket, Bytbil) som ofta listar specs
```

**Nytt: Veteranfordon-specialregler**
```
VW LT (1975-1996):
├─ Spindelbultar (kingpins) - MÅSTE smörjas var 500:e mil
├─ Bensinmotor = Audi CH 2.0L (samma som Porsche 924)
├─ Dieselmotor D24 = Samma som Volvo 240/740
└─ Växellåda kräver GL-4 olja (GL-5 förstör synkronringarna!)
```

### 2. Planner Agent (Projektplanering)

**Nytt: Beroende-hantering**
```
⛔ HÅRDA BEROENDEN:
• Rostlagning → FÖRE Isolering
• Rostlagning → FÖRE Målning
• El-dragning → FÖRE Väggpaneler
• Vatten-dragning → FÖRE Inredning
• Golv → FÖRE Möbelbygge
```

**Nytt: Kostnadsstöd**
```
Typiska kostnader (2025):
• Enkel service (olja+filter): 500-1000 kr (DIY) / 2000-4000 kr (verkstad)
• Kamremsbyte: 1500-3000 kr (DIY) / 5000-10000 kr (verkstad)
• Isolering (Armaflex): 2000-5000 kr
• Solpanel + Regulator: 3000-10000 kr
```

### 3. Inspector Agent (Bildanalys)

**Förbättrad rostbedömning:**
```
SÄRSKILT OM ROST:
• Bärande delar = Alltid allvarligt
• Ytrost på plåt = Ofta endast kosmetiskt
• Genomrostning nära svetsfogar = Risk för spridning
• "Bubblor" under lack = Rost under ytan, större än det ser ut
```

---

## 📊 Validering

### JSON-struktur

Jag har lagt till valideringsfunktioner:

```typescript
validateDetectiveOutput(json) // Kontrollerar vehicleData
validatePlannerOutput(json)   // Kontrollerar tasks
```

**Valideringsregler:**
- Kritiska fält måste finnas (make, model, year)
- Logiska kontroller (totalvikt > tjänstevikt)
- Rimlighetskontroller (årtal 1900-2026)

### Språkkontroll

Prompterna är nu explicit tydliga om:
- ALL output ska vara på SVENSKA
- Engelska termer ska översättas (Engine → Motor, Brake → Broms)
- Varning om att output refuseras vid engelska

---

## 🏗️ Arkitekturförbättringar

### TaskType-kategorier

Tydligare kategorisering:

| Type | Beskrivning | Exempel |
|------|-------------|---------|
| MAINTENANCE | Måste göras | Kamremsbyte, Service |
| BUILD | Vill göra | Isolering, Solpanel |
| PURCHASE | Inköp | Däck, Delar |
| ADMIN | Papper | Försäkring, Besiktning |
| IDEA | Research | Motorbytesalternativ |

### Fas-system för Vanlife

Dubbla parallella spår:

```
MEKANISKT SPÅR (Prioritet 1)    BYGGSPÅR (Prioritet 2)
├─ P0_ACUTE                     ├─ B0_DEMO
├─ P1_ENGINE                    ├─ B1_SHELL
├─ P2_RUST ─────────blocker────→├─ B2_SYSTEMS
└─ P3_FUTURE                    ├─ B3_INTERIOR
                                └─ B4_FINISH
```

---

## 🎯 Rekommendationer

### Kortsiktigt (nu)

1. **Byt ut prompts.ts** mot den förbättrade versionen
2. **Lägg till fallback-logik** i `aiDeepResearch` för när biluppgifter.se misslyckas
3. **Testa med JSN398** för att validera VW LT-specifika regler

### Medelsiktigt

1. **Cachning av fordonsdata** - Spara lyckade API-anrop för att undvika upprepade sökningar
2. **Modell-kunskapsbas** - Bygg upp en lokal databas med vanliga fel per modell
3. **A/B-test av persona** - Testa dalmal vs rikssvenska för användarengagemang

### Långsiktigt

1. **Fine-tuning** - Träna en modell specifikt för svenska veteranfordon
2. **Community-data** - Låt användare bidra med fordonsspecifik kunskap
3. **Integrationer** - Direktkoppling till Autodoc, Biltema för priser

---

## 📁 Levererade filer

1. **prompts_improved.ts** - Komplett förbättrad promptfil
2. **PROMPT_ANALYSIS.md** - Denna analysrapport

---

## 🔗 Källor använda i analysen

- Wikipedia: Volkswagen LT (tekniska specifikationer)
- Surfzone.se: VW LT-forum (vanliga problem)
- 4x4sweden.se: VW LT-tråd (köpråd)
- Biluppgifter.se: Testad tillgänglighet (403-error)
- Din befintliga kod: types.ts, constants.ts, promptTemplates.ts

---

*Skapad av Claude för VanPlan/Elton-projektet*
