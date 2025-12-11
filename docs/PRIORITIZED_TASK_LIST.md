# Prioriterad Uppgiftslista - Elton VanPlan

**Genererad:** 2025-12-11
**Baserad på:** Omfattande projektgranskning

---

## OMEDELBART: Akuta åtgärder (Vecka 1-2)

### 1. Flytta API-nycklar till Backend
**Prioritet:** KRITISK | **Uppskattad tid:** 2-3 dagar

**Varför akut:** API-nyckeln exponeras i webbläsaren och kan missbrukas.

**Steg:**
1. Skapa Firebase Cloud Function `functions/src/ai/proxy.ts`
2. Flytta Gemini API-nyckel till Google Secret Manager
3. Uppdatera `geminiService.ts` att anropa Cloud Function
4. Ta bort `VITE_GEMINI_API_KEY` från `.env` och kod
5. Testa i staging och produktion

**Filer att ändra:**
- `src/services/geminiService.ts`
- Ny: `functions/src/ai/proxy.ts`
- `.env` / `.env.example`

---

### 2. Fixa Import-funktionen
**Prioritet:** HÖG | **Uppskattad tid:** 1 dag

**Varför akut:** Användare kan inte återställa sina backuper.

**Steg:**
1. Lägg till JSON-schema validering i `handleImportData`
2. Implementera projektimport med `addNewProject`
3. Hantera tasks, shopping items, och service log
4. Lägg till konflikthantering för existerande data
5. Testa full import/export-cykel

**Filer att ändra:**
- `src/App.tsx` (rad 230-231)

---

### 3. Lägg till kritiska enhetstester
**Prioritet:** HÖG | **Uppskattad tid:** 3-4 dagar

**Varför akut:** Inga tester finns för affärskritisk logik.

**Steg:**
1. Skapa `src/services/__tests__/geminiService.test.ts`
2. Skapa `src/services/__tests__/db.test.ts`
3. Skapa `src/services/__tests__/auth.test.ts`
4. Setup Firebase Emulators för lokala tester
5. Integrera i CI/CD pipeline

**Minimum testtäckning:**
- AI-anrop och felhantering
- CRUD-operationer för projekt
- Autentiseringsflöden

---

### 4. Städa prototype_app/
**Prioritet:** MEDEL | **Uppskattad tid:** 0.5 dag

**Varför akut:** Förvirring och risk för ändringar på fel ställe.

**Steg:**
1. Verifiera att alla komponenter finns i `src/`
2. Arkivera i branch `archive/prototype-app`
3. Ta bort från main-branchen
4. Uppdatera README om det behövs

---

## KORTSIKTIGT: Nästa sprint (Vecka 3-8)

### 5. Databasmigrering: Sub-collections
**Prioritet:** HÖG | **Uppskattad tid:** 1 vecka

**Varför viktigt:** 1MB-gräns i Firestore kommer bryta stora projekt.

**Steg:**
1. Implementera `ProjectServiceV2` enligt DATA_MODEL_MIGRATION.md
2. Skapa migreringsscript för befintliga projekt
3. Uppdatera alla komponenter att använda nya queries
4. Parallellkör gamla och nya systemet under övergång
5. Lansera och migrera användare gradvis

**Filer:**
- `src/services/db.ts`
- Ny: `src/services/projectServiceV2.ts`
- `firestore.rules`

---

### 6. Färdigställ Live Elton (WebRTC)
**Prioritet:** HÖG | **Uppskattad tid:** 1-2 veckor

**Status:** Frontend klar, backend saknas.

**Steg:**
1. Integrera WebRTC-bibliotek
2. Koppla till Gemini Live API
3. Implementera röst- och videoströmmar
4. Testa med riktiga användare

---

### 7. Färdigställ Ljud-Doktorn
**Prioritet:** MEDEL | **Uppskattad tid:** 3-5 dagar

**Status:** Prompt klar, frontend-integration saknas.

**Steg:**
1. Implementera mikrofon-access via Web Audio API
2. Skapa UI för inspelning och uppspelning
3. Koppla ljudström till Gemini
4. Visa diagnos-resultat

---

### 8. Förbättra felhantering
**Prioritet:** MEDEL | **Uppskattad tid:** 2-3 dagar

**Steg:**
1. Skapa `src/services/errorService.ts`
2. Implementera React Error Boundaries
3. Konsolidera Toast-hantering
4. Lägg till valfri Sentry-integration

---

## MEDELSIKTIGT: 2-4 månader

### 9. PWA/Offline-stöd
**Prioritet:** HÖG | **Blockerat av:** Databasmigrering (#5)

**Steg:**
1. Aktivera Firestore offline persistence
2. Konfigurera Vite PWA-plugin
3. Skapa service workers
4. Testa offline-scenarion

---

### 10. Elton Inspector (AI Besiktning)
**Prioritet:** MEDEL | **Uppskattad tid:** 1-2 veckor

**Status:** Spec och prompts klara, UI saknas.

**Steg:**
1. Skapa Inspector-komponent
2. Implementera kamera-capture
3. Koppla till Vision API
4. Skapa diagnos-vy

---

### 11. Smart Context & Beslutsstöd
**Prioritet:** MEDEL | **Uppskattad tid:** 1 vecka

**Steg:**
1. Definiera context-triggers (nyckelord till data-mappning)
2. Skapa SmartContext-komponent
3. Integrera i TaskDetail-vy

---

### 12. Integrationstester
**Prioritet:** MEDEL | **Uppskattad tid:** 1 vecka

**Steg:**
1. Setup Firebase Emulators för testning
2. Skapa test för onboarding-flöde
3. Skapa test för AI-chat-flöde
4. Integrera i CI/CD

---

## LÅNGSIKTIGT: Framtida planering

### 13. Partner-integration (Affiliate)
- Kontakta Autodoc, Biltema
- Implementera deep-linking
- Skapa affiliate-tracking

### 14. Admin Dashboard
- Feature flag-hantering
- Analytics
- Användningsstatistik

### 15. Multi-Brand Platform
- Dynamiska teman
- White-label konfiguration
- Multi-tenant databas

### 16. React Native Mobilapp
- Utvärdera stack
- Extrahera delad logik
- Bygga native features

---

## Konkreta nästa steg

**För att komma ur "AI-kaoset" - gör detta FÖRST:**

1. **IDAG:** Skapa en Cloud Function för AI-anrop och flytta API-nyckeln
2. **DENNA VECKA:** Implementera import-funktionen
3. **NÄSTA VECKA:** Skriv tester för geminiService och db
4. **INOM 2 VECKOR:** Arkivera prototype_app och städa kodbas

**När det är klart:**
- Du har en säker applikation
- Backup fungerar fullt ut
- Du kan göra ändringar med förtroende (tack vare tester)
- Kodbasen är renare och enklare att förstå

---

## Teknisk checklista innan lansering

- [ ] API-nycklar i backend (Cloud Functions)
- [ ] Import-funktionen fungerar
- [ ] Kritiska enhetstester finns
- [ ] prototype_app borttagen
- [ ] Error boundaries implementerade
- [ ] Firestore offline persistence aktiverat

---

*Dokument genererat 2025-12-11*
