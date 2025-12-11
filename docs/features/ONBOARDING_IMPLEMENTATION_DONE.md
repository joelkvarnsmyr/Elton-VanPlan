# ✅ Onboarding Implementation - KLAR!

## Sammanfattning

Vi har nu implementerat en helt ny **3-stegs onboarding wizard** med:
- Projekttyps-väljare (Renovering, Ombyggnad, Förvaltning)
- Kunskapsnivå-väljare (Nybörjare, Hemmameck, Certifierad)
- Smeknamn-fält för personlig touch
- Fria anteckningar som kontext till AI

---

## ✅ Vad som är implementerat:

### 1. **Nya TypeScript Types** (types.ts)
```typescript
export type UserSkillLevel = 'beginner' | 'intermediate' | 'expert';

// I Project interface:
userSkillLevel?: UserSkillLevel;
nickname?: string;
```

### 2. **OnboardingWizard Komponent** (components/OnboardingWizard.tsx)

**STEG 1: Val av projekttyp & kunskapsnivå**
- 3 projekttyps-knappar:
  - 🔧 Renovering (Restaurera & Laga)
  - 🚐 Ombyggnad (Van → Camper)
  - 🍃 Förvaltning (Underhålla & Service)

- 3 kunskapsnivå-knappar:
  - 🔰 Nybörjare ("Aldrig fixat")
  - 🔧 Hemmameck ("Gör själv")
  - ⭐ Certifierad ("Proffsig")

- Fordonsbeskrivning textarea
- Bild-upload (för OCR av RegNr + ikon-generering)
- Dynamisk förklaring baserat på kunskapsnivå

**STEG 2: Research (Loading State)**
- Animated spinner
- 6 stegvis progress-indikator
- Kontextbaserad text (visar vald projekttyp)

**STEG 3: Granska & Komplettera**
- Projektnamn (redigerbart)
- ⭐ **Smeknamn-fält** (påverkar Eltons personlighet!)
- ⭐ **Fria anteckningar** (skickas som kontext till AI)
- Info-box som förklarar vad Elton kommer göra

### 3. **Uppdaterad ProjectSelector** (components/ProjectSelector.tsx)

**Städat bort:**
- ❌ Gammal modal med isResearching state
- ❌ vehicleDesc, selectedImage, handleImageUpload states
- ❌ Alla gamla form-hanterare

**Nytt:**
- ✅ Import av OnboardingWizard
- ✅ handleOnboardingComplete som tar emot komplett data från wizarden
- ✅ Skickar userSkillLevel och nickname till projektet
- ✅ Använder data.projectType istället för AI-gissning

### 4. **Data Flow**

```
User → OnboardingWizard STEG 1
     → Väljer: ProjectType, UserSkillLevel, Beskrivning, Bild

↓ Klickar "Starta Research"

OnboardingWizard STEG 2
     → Loading screen (simulerat just nu, ska kopplas till AI)

↓ Research klar

OnboardingWizard STEG 3
     → Granska AI-förslag
     → Lägg till smeknamn
     → Lägg till anteckningar

↓ Klickar "Skapa Projekt!"

ProjectSelector.handleOnboardingComplete(data: OnboardingData)
     → Anropar generateProjectProfile(desc, img, projectType, skillLevel)
     → Skapar Project med userSkillLevel & nickname
     → onCreateProject(newProject)
```

---

## 🚧 Vad som återstår:

### 1. **Koppla in riktiga AI-anrop i OnboardingWizard** (NÄSTA STEG)

Just nu simulerar vi med `setTimeout(15000)` i OnboardingWizard.tsx rad 72-89.

**Behöver göras:**
```typescript
// I OnboardingWizard.tsx, rad 72:
const startResearch = async () => {
    setIsResearching(true);

    // ✅ TODO: Anropa riktiga AI-funktioner här
    const [aiDataResult, iconResult] = await Promise.allSettled([
        generateProjectProfile(vehicleDesc, imageBase64),
        imageBase64 ? generateVehicleIcon(imageBase64, 2) : Promise.resolve(null)
    ]);

    // Sätt AI-suggestions för STEG 3
    setAiSuggestions(aiDataResult.status === 'fulfilled' ? aiDataResult.value : null);
    setIsResearching(false);
    setStep(3);
};
```

### 2. **Uppdatera AI-prompts** (prompts.ts)

Prompterna behöver ta emot `projectType` och `userSkillLevel` för att:

**Exempel:**
```typescript
// I prompts.ts - PLANNER prompt:
text: (vehicleDataJson: string, projectType: ProjectType, userSkillLevel: UserSkillLevel) => `
    ROLL: Du är "Verkmästaren" för ett ${projectType}-projekt.

    ANVÄNDARENS KUNSKAPSNIVÅ: ${userSkillLevel}

    ${userSkillLevel === 'beginner'
        ? 'Skapa DETALJERADE uppgifter med många subtasks. Länka guider. Rekommendera verkstad för Expert-nivå.'
        : userSkillLevel === 'intermediate'
        ? 'Balansera mellan DIY och verkstad. Ge praktiska tips.'
        : 'Kortfattade uppgifter. Teknisk info. Användaren vet vad de gör.'
    }

    ...
`
```

**Uppdatera dessa filer:**
- `config/prompts.ts` - Lägg till projectType och userSkillLevel parametrar
- `services/geminiService.ts` - Passa nya parametrar till AI
- `services/onboardingService.ts` - Använd userSkillLevel för att anpassa output

### 3. **Visa AI-förslag i STEG 3**

Just nu är STEG 3 statisk. Behöver visa:
- ✅ AI-detekterat märke/modell/år
- ✅ AI:ns förslag på projektnamn
- ✅ (Valfritt) Redigera fordonsdata om AI missade något

### 4. **Conversational Decision-Making** (chat)

Detta kommer i nästa fas - när användaren chattar med Elton:
```
User: "Jag behöver byta kamrem"

Elton: [Kollar userSkillLevel]
       [Om beginner]: "Detta är en Expert-uppgift. Jag rekommenderar starkt verkstad..."
       [Om intermediate]: "Har du bytt kamrem förr? Har du verktyg?"
       [Om expert]: "B230F: Kamremssats Contitech CT637K1, Vattenpump Aisin WPV-804..."
```

---

## 📊 Status

| Feature | Status | Fil |
|---------|--------|-----|
| **UserSkillLevel type** | ✅ KLAR | types.ts |
| **Project.userSkillLevel** | ✅ KLAR | types.ts |
| **Project.nickname** | ✅ KLAR | types.ts |
| **OnboardingWizard STEG 1** | ✅ KLAR | OnboardingWizard.tsx |
| **OnboardingWizard STEG 2** | 🟡 SIMULERAD | OnboardingWizard.tsx |
| **OnboardingWizard STEG 3** | ✅ KLAR | OnboardingWizard.tsx |
| **ProjectSelector integration** | ✅ KLAR | ProjectSelector.tsx |
| **AI-anrop i wizard** | ❌ TODO | OnboardingWizard.tsx |
| **Uppdatera prompts** | ❌ TODO | prompts.ts, geminiService.ts |
| **Conversational chat** | ❌ TODO | geminiService.ts (nytt verktyg) |

---

## 🎯 Nästa steg (i ordning):

1. **Koppla in riktiga AI-anrop i OnboardingWizard** (30 min)
   - Ersätt setTimeout med generateProjectProfile + generateVehicleIcon
   - Visa AI-suggestions i STEG 3

2. **Uppdatera prompts för projectType & userSkillLevel** (45 min)
   - Uppdatera PLANNER prompt i prompts.ts
   - Passa parametrar genom geminiService
   - Testa att uppgifter anpassas efter kunskapsnivå

3. **Implementera conversational decision-making** (2h)
   - Lägg till nytt AI-verktyg `askUserPreference`
   - Uppdatera chat-logic för att ställa frågor innan uppgifter skapas
   - Testa "Byt kamrem" scenario för olika kunskapsnivåer

4. **Testa hela flödet** (30 min)
   - Skapa projekt som Nybörjare → Verifiera detaljerade guider
   - Skapa projekt som Hemmameck → Verifiera balans
   - Skapa projekt som Certifierad → Verifiera teknisk info

---

## 💻 Testinstruktioner

### Test 1: Basic onboarding flow
```
1. npm run dev
2. Navigera till http://localhost:3002
3. Klicka "Nytt Projekt"
4. Välj projekttyp (t.ex. Renovering)
5. Välj kunskapsnivå (t.ex. Nybörjare)
6. Skriv "ABC123" i beskrivning
7. Klicka "Starta Research"
8. Vänta 15 sekunder (simulerad)
9. STEG 3: Lägg till smeknamn "Pärlan"
10. Klicka "Skapa Projekt!"
11. Verifiera att projektet skapas med userSkillLevel="beginner" och nickname="Pärlan"
```

### Test 2: Med bild-upload
```
1. Välj projekttyp & kunskapsnivå
2. Ladda upp bild av bil
3. Klicka "Starta Research"
4. Verifiera att OCR läser RegNr från bild (när AI är kopplad)
5. Verifiera att ikon genereras (när AI är kopplad)
```

### Test 3: Med anteckningar
```
1. Välj projekttyp & kunskapsnivå
2. I STEG 3: Lägg till anteckningar "Har bytt kamrem 2023, lite rost i bakskärm"
3. Skapa projekt
4. Verifiera att anteckningar används av AI för att skapa relevanta uppgifter
```

---

## 🎨 UX Förbättringar

**Vad användaren nu får:**
- ✅ Tydlig val av projekttyp (vet vad som kommer hända)
- ✅ AI anpassar sig efter kunskapsnivå
- ✅ Kan ge fordonet ett smeknamn
- ✅ Kan ge kontext via anteckningar
- ✅ Ser progress under research
- ✅ Kan granska innan projektet skapas

**Före:**
- ❌ AI gissade projekttyp (ofta fel)
- ❌ Alla fick samma detaljnivå
- ❌ Inget smeknamn
- ❌ Ingen chans att ge kontext
- ❌ Projekt skapades direkt utan granskning

---

## 🚀 Deployment Checklist

Innan detta går live:
- [ ] Koppla in riktiga AI-anrop (inte simulering)
- [ ] Uppdatera prompts med userSkillLevel
- [ ] Testa alla 3 kunskapsnivåer
- [ ] Testa alla 3 projekttyper
- [ ] Test med OCR av RegNr
- [ ] Test med ikon-generering
- [ ] Error handling om AI fails
- [ ] Loading states är tydliga
- [ ] Mobile responsiveness

---

**Status: 🟡 80% KLART**
**Servern kör på: http://localhost:3002**
**Redo för nästa steg: Koppla in AI-anrop!**
