# E2E Tests Uppdaterade ✅

## Sammanfattning

Jag har uppdaterat alla Playwright E2E-tester så de nu använder din riktiga användare (**joel@kvarnsmyr.se**) istället för mock/test-credentials. Detta betyder att du kan se exakt vad testerna gör i din faktiska applikation!

## Vad som har gjorts

### 1. **Ny fil: `e2e/helpers/auth-helpers.ts`**
Innehåller alla authentication- och navigation-hjälpfunktioner:

```typescript
// Login med dina riktiga credentials
await ensureLoggedIn(page);

// Skapa testprojekt via onboarding wizard
await createTestProject(page, {
    projectType: 'renovation',
    skillLevel: 'beginner',
    vehicleDescription: 'Volvo 240 1990',
    nickname: 'Testbilen',
    notes: 'E2E test project'
});

// Navigera tillbaka till projektlistan
await goToProjectSelector(page);
```

**Credentials:**
- Email: `joel@kvarnsmyr.se`
- Lösenord: `Appelsin1n!`

### 2. **Ny testfil: `e2e/onboarding-flow.spec.ts`**
Komplett testsuite för onboarding-flödet:

✅ Verifierar att wizard öppnas
✅ Validerar formulärfält i STEG 1
✅ Testar progression genom alla 3 steg
✅ Skapar **riktiga projekt** för olika scenarios:
- Renovering + Nybörjare
- Ombyggnad (Camper) + Hemmameck
- Förvaltning + Certifierad

✅ Verifierar AI-genererad fordonsdata
✅ Testar data persistence (userSkillLevel, nickname)
✅ Testar cancel-funktionalitet

### 3. **Uppdaterad: `e2e/coworking.spec.ts`**
Nu använder auth-helpers istället för att anta inloggning:

```typescript
test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page); // Loggar in automatiskt
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
});
```

### 4. **Dokumentation: `e2e/README.md`**
Komplett guide för hur man:
- Kör tester
- Debuggar tester
- Städar upp testdata
- Använder helpers
- Troubleshooting

## Fördelar

### ✅ Se resultat direkt i din app
När testerna kör kan du öppna din app och se de projekt som skapas:
- "Volvo 240 1990 - E2E Test (Nybörjare)"
- "Mercedes Sprinter 2015 - Camper Conversion Test"
- "Volvo V70 D5 2008"

### ✅ Debugga i Firebase Console
Alla projekt sparas i Firestore under din userId - enkelt att inspektera!

### ✅ Testar mot riktig backend
Inga mocks - vi testar exakt samma flöde som riktiga användare.

### ✅ Enkel att utöka
Lägg till fler tester med samma helpers:

```typescript
test('min nya test', async ({ page }) => {
    await ensureLoggedIn(page);

    await createTestProject(page, {
        projectType: 'conversion',
        skillLevel: 'expert',
        vehicleDescription: 'Min testbil',
        nickname: 'Testern'
    });

    // Verifiera något...
});
```

## Hur man kör testerna

### 1. Installation (om inte redan gjort)
```bash
npm install
npx playwright install
```

### 2. Kör alla tester
```bash
npx playwright test
```

### 3. Kör endast onboarding-tester
```bash
npx playwright test e2e/onboarding-flow.spec.ts
```

### 4. Kör i UI-läge (rekommenderat!)
```bash
npx playwright test --ui
```

Detta öppnar Playwright's UI där du kan:
- Se alla tester
- Köra ett i taget
- Titta på replay
- Se screenshots
- Inspektera DOM

### 5. Kör i headed mode (se webbläsaren)
```bash
npx playwright test --headed
```

### 6. Kör specifikt test
```bash
npx playwright test --grep "should create renovation project"
```

## Vad testerna gör

### Test 1: Validate wizard opens
Klickar på "Nytt Projekt" och verifierar att wizard öppnas med rätt fält.

### Test 2: Validate required fields
Testar att man inte kan gå vidare utan att fylla i alla fält.

### Test 3: Progress through all steps
Går igenom alla 3 steg och verifierar att UI uppdateras korrekt.

### Test 4-6: Create different project types
**VIKTIGA TESTER** - Dessa skapar faktiska projekt:

**Test 4: Renovering + Nybörjare**
```typescript
{
    projectType: 'renovation',
    skillLevel: 'beginner',
    vehicleDescription: 'Volvo 240 1990 - E2E Test (Nybörjare)',
    nickname: 'Testbilen',
    notes: 'Skapad av E2E test - Kan raderas'
}
```

**Test 5: Ombyggnad + Hemmameck**
```typescript
{
    projectType: 'conversion',
    skillLevel: 'intermediate',
    vehicleDescription: 'Mercedes Sprinter 2015 - Camper Conversion Test',
    nickname: 'Äventyraren',
    notes: 'E2E test project - Ombyggnad till camper'
}
```

**Test 6: Förvaltning + Certifierad**
```typescript
{
    projectType: 'maintenance',
    skillLevel: 'expert',
    vehicleDescription: 'Volvo V70 D5 2008',
    nickname: 'Lastbilen',
    notes: 'E2E test - Löpande underhåll'
}
```

### Test 7: Verify AI data
Skapar projekt med riktig bil (Volvo 240) och verifierar att AI hittar fordonsdata.

### Test 8: Data persistence
Verifierar att userSkillLevel och nickname sparas korrekt.

### Test 9: Cancel wizard
Testar att man kan avbryta wizard.

## Städa upp efter tester

### Alternativ 1: Manuellt via UI
1. Logga in på http://localhost:3002
2. Gå till projektlistan
3. Leta efter projekt med "E2E Test" i namnet
4. Klicka papperskorgen för att radera

### Alternativ 2: Firebase Console
1. Öppna Firebase Console
2. Gå till Firestore
3. Navigera till `projects` collection
4. Filtrera: `ownerEmail == "joel@kvarnsmyr.se"`
5. Radera test-projekt

## Debug-tips

### Problem: Test timeout
**Lösning:** AI research kan ta tid (15-20 sek). Testerna har redan 30s timeout, men du kan öka:

```typescript
await expect(page.locator('text=STEG 3')).toBeVisible({ timeout: 60000 });
```

### Problem: Vill se vad som händer
**Lösning:** Kör i headed mode eller använd pause:

```bash
npx playwright test --headed --debug
```

Eller lägg till i testet:
```typescript
await page.pause(); // Pausar här
```

### Problem: Test failar slumpmässigt
**Lösning:** Playwright's auto-waiting borde fixa det, men du kan vänta explicit:

```typescript
await page.waitForLoadState('networkidle');
```

## Framtida förbättringar

- [ ] Automatisk cleanup efter tester (radera testprojekt automatiskt)
- [ ] Separata test-credentials för CI/CD
- [ ] Screenshot-jämförelser (visual regression)
- [ ] Performance-metrics (Lighthouse)
- [ ] Accessibility-tester (axe-core)

## Exempel output

När du kör testerna ser du:

```
🔐 Logging in as: joel@kvarnsmyr.se
✅ Logged in successfully
✅ User data loaded
➕ Creating test project: {projectType: 'renovation', skillLevel: 'beginner', ...}
  📝 STEG 1: Selecting project type...
  🔍 STEG 2: Waiting for AI research...
  ✅ STEG 3: Completing...
✅ Test project created!
✅ Test completed - Check your account for the created project!
```

## Sammanfattning

Nu har du:
- ✅ E2E-tester som använder din riktiga användare
- ✅ Helper-funktioner för att enkelt skapa fler tester
- ✅ Komplett onboarding-testsuite
- ✅ Dokumentation för hur allt fungerar

Testerna skapar riktiga projekt i din databas som du kan inspektera. Detta ger dig:
1. **Verifiering** att onboarding fungerar end-to-end
2. **Testdata** att leka med i utvecklingsmiljön
3. **Debugging** - se exakt vad AI:n genererar för olika scenarios

Kör `npx playwright test --ui` för att testa! 🚀
