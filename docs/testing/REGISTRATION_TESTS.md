# User Registration E2E Tests 🆕

**Skapad:** 2025-12-09
**Status:** ✅ Redo för testning

## Översikt

Nya E2E-tester för att verifiera att användarregistreringen fungerar korrekt:
- Registrera nya användare med hittepå-konton
- Validera formulärfält
- Testa duplikathantering
- Verifiera att nya användare kan skapa projekt direkt efter registrering

## Skapade filer

### 1. `e2e/user-registration.spec.ts` ✅
**8 omfattande tester:**

1. **"should show registration form when clicking 'Registrera dig här'"**
   - Verifierar att registreringsformuläret visas
   - Kontrollerar att alla fält finns (namn, email, lösenord)

2. **"should validate required fields during registration"**
   - Testar att "Skapa konto"-knappen är disabled utan ifyllda fält
   - Verifierar stegvis validering (namn → email → lösenord)

3. **"should register a new user successfully"** ⭐
   - Registrerar en helt ny användare med unikt email
   - Verifierar omdirigering till projektväljarvy
   - Använder pattern: `test-user-{timestamp}-{random}@vanplan-test.com`

4. **"should not allow registration with existing email"**
   - Försöker registrera med joel@kvarnsmyr.se (existerande)
   - Verifierar att felmeddelande visas

5. **"should allow switching between login and register modes"**
   - Testar växling mellan "Logga in" och "Registrera dig"
   - Verifierar att namn-fältet visas/döljs korrekt

6. **"should register user and create their first project"** ⭐⭐
   - Registrerar ny användare
   - Skapar deras första projekt direkt efter registrering
   - Verifierar hela flödet från registrering till projekt

7. **"should show validation error for weak password"**
   - Testar med för kort lösenord (t.ex. "123")
   - Verifierar att felmeddelande visas

8. **Cleanup notifications**
   - Efter varje test skrivs information om skapade användare
   - Inkluderar email och lösenord för manuell cleanup

### 2. `e2e/helpers/registration-helpers.ts` ✅
**Hjälpfunktioner för registrering:**

#### `generateTestUser()`
Genererar unika testanvändare:
```typescript
{
  email: 'test-user-1733757123456-7890@vanplan-test.com',
  name: 'E2E Test User 7890',
  password: 'TestPassword123!'
}
```

#### `registerNewUser(page, user)`
Komplett registreringsflöde:
1. Klickar "Lösenord"-tab
2. Klickar "Registrera dig här"
3. Fyller i namn, email, lösenord
4. Klickar "Skapa konto"
5. Väntar på omdirigering

#### `switchToRegisterMode(page)`
Växlar från login till registrering

#### `switchToLoginMode(page)`
Växlar från registrering till login

#### `logout(page)`
Loggar ut nuvarande användare

#### `loginWithUser(page, email, password)`
Loggar in med befintlig användare

#### `registerUserAndCreateProject(page, user, options)`
Komplett flöde: registrera + skapa första projekt

## Användning

### Kör alla registreringstester:
```bash
npx playwright test e2e/user-registration.spec.ts
```

### Kör med UI mode:
```bash
npx playwright test e2e/user-registration.spec.ts --ui
```

### Kör specifikt test:
```bash
npx playwright test -g "should register a new user successfully"
```

### Kör endast test som skapar projekt:
```bash
npx playwright test -g "create their first project"
```

## Email-pattern för testanvändare

Alla testanvändare använder detta pattern:
```
test-user-{timestamp}-{randomId}@vanplan-test.com
```

**Exempel:**
- `test-user-1733757123456-7890@vanplan-test.com`
- `project-test-1733757234567-1234@vanplan-test.com`

Detta garanterar:
✅ Unika email-adresser för varje test
✅ Lätt att identifiera testanvändare i Firebase Console
✅ Inga konflikter mellan test-runs

## Cleanup - Radera testanvändare

### Manuell cleanup via Firebase Console:
1. Gå till https://console.firebase.google.com
2. Välj ditt projekt
3. Gå till **Authentication > Users**
4. Filtrera/sök efter `@vanplan-test.com`
5. Radera testanvändare manuellt

### Via Firebase CLI:
```bash
# Lista alla användare
firebase auth:export users.json

# Radera specifik användare (behöver UID)
firebase auth:delete <user-uid>
```

### Via script (framtida förbättring):
```typescript
// TODO: Skapa cleanup-script som:
// 1. Läser alla användare med @vanplan-test.com
// 2. Raderar dem automatiskt
// 3. Raderar deras projekt från Firestore
```

## Testdata som skapas

Efter en fullständig testkörning har du:
- **~7 nya användare** i Firebase Auth
- **1-2 projekt** i Firestore (från "create first project"-testerna)
- Alla med email-pattern: `*@vanplan-test.com`

## Förväntade resultat

### ✅ Vad som BÖR fungera:
1. Registreringsformulär visas korrekt
2. Validering av obligatoriska fält
3. Nya användare skapas i Firebase Auth
4. Användarprofil sparas i Firestore (med namn)
5. Omdirigering till projektväljarvy efter registrering
6. Nya användare kan skapa projekt direkt

### ❌ Vad som KAN misslyckas:
1. **Duplikattest:** Om joel@kvarnsmyr.se inte finns i databasen
2. **Svaga lösenord:** Beroende på Firebase Auth-regler
3. **AI research timeout:** Om Gemini API är långsam (>30 sek)
4. **Nätverksproblem:** Om internet är instabilt

## Integration med befintliga tester

### Kombinera med onboarding-tester:
```typescript
import { registerNewUser, generateTestUser } from './helpers/registration-helpers';

test('new user should complete onboarding', async ({ page }) => {
    const user = generateTestUser();

    await page.goto('/');
    await registerNewUser(page, user);

    // Nu är användaren inloggad, fortsätt med onboarding...
});
```

### Använd i coworking-tester:
```typescript
import { registerNewUser } from './helpers/registration-helpers';

test('new user should see empty coworking list', async ({ page }) => {
    const user = generateTestUser();
    await page.goto('/');
    await registerNewUser(page, user);

    // Verifiera att coworking-listan är tom för ny användare
});
```

## Tekniska detaljer

### Selectors som används:
```typescript
// Tabs
'button:has-text("Lösenord")'

// Links
'text=Inget konto? Registrera dig här.'
'text=Har du redan konto? Logga in.'

// Headings
'h2:has-text("Välkommen! Vad heter du?")'
'h2:has-text("Logga in")'

// Form fields
'input[placeholder="Ditt namn"]'
'input[type="email"]'
'input[type="password"]'

// Buttons
'button:has-text("Skapa konto")'
'button:has-text("Logga in")'

// Success
'h1:has-text("Välkommen")' // Project selector heading
```

### Timeouts:
- **Form transitions:** 500ms
- **Button visibility:** 5000ms (5 sek)
- **Registration redirect:** 15000ms (15 sek)
- **AI research:** 30000ms (30 sek)

### Random data:
- **Timestamp:** `Date.now()` (millisekunder sedan 1970)
- **Random ID:** `Math.floor(Math.random() * 10000)` (0-9999)

## Säkerhetsnoteringar

⚠️ **Lösenord i klartext:**
Testlösenordet `TestPassword123!` är hårdkodat i testerna. Detta är OK för E2E-tester men:
- Använd ALDRIG riktiga lösenord i test-kod
- Testa endast mot development/staging-miljöer
- Radera testanvändare regelbundet

⚠️ **Email-domän:**
Vi använder `@vanplan-test.com` som är en påhittad domän. Detta är säkert eftersom:
- Inga riktiga email skickas
- Firebase Auth tillåter registrering utan email-verifiering (i dev)
- Lätt att identifiera och radera testanvändare

## Framtida förbättringar

### 1. Automatisk cleanup
```typescript
// Lägg till i playwright.config.ts
globalTeardown: './e2e/cleanup-test-users.ts'
```

### 2. Email-verifiering
Testa hela flödet med email-verifiering (kräver email-tjänst för testning)

### 3. Social login
Lägg till tester för Google/Facebook-inloggning (kräver mock OAuth)

### 4. Lösenordsåterställning
Testa "Glömt lösenord"-flödet

### 5. Profiluppdatering
Testa att nya användare kan uppdatera sin profil efter registrering

## Sammanfattning

**Status:** ✅ 8 tester skapade och redo för körning

**Filer:**
1. ✅ `e2e/user-registration.spec.ts` - 8 tester
2. ✅ `e2e/helpers/registration-helpers.ts` - Hjälpfunktioner
3. ✅ `REGISTRATION_TESTS.md` - Denna dokumentation

**Nästa steg:**
```bash
npx playwright test e2e/user-registration.spec.ts --ui
```

**Förväntad tid:** ~2-5 minuter för alla 8 tester (beroende på AI research-hastighet)

**Cleanup:** Manuell radering av testanvändare via Firebase Console efter testning
