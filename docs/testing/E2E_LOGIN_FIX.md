# E2E Test Login Fix ✅

## Problem
Playwright-testerna timeoutade när de försökte logga in. De letade efter en "Demo Login"-knapp som inte finns.

## Orsak
`auth-helpers.ts` hade fel login-flöde. Applikationen använder:
- **"Magisk Länk"** tab (passwordless)
- **"Lösenord"** tab (email + password)
- **"Visa Demo (Elton)"** button (demo mode)

Men testerna letade efter "Demo Login" som inte existerar.

## Lösning
Uppdaterade `e2e/helpers/auth-helpers.ts` att använda **password login**-flödet:

```typescript
export async function loginAsRealUser(page: Page) {
    // Go to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click "Lösenord" tab
    const passwordTab = page.locator('button:has-text("Lösenord")');
    await passwordTab.click();

    // Fill in credentials
    await page.locator('input[type="email"]').fill('joel@kvarnsmyr.se');
    await page.locator('input[type="password"]').fill('Appelsin1n!');

    // Click "Logga in"
    await page.locator('button:has-text("Logga in")').click();

    // Wait for project selector
    await page.waitForSelector('h1:has-text("Välkommen")');
}
```

## Status: ✅ Fixat

Testerna borde nu kunna logga in korrekt.

## Testa

### Kör testerna igen
```bash
npm run test:e2e:ui
```

### Vad som borde hända:
1. Browser öppnas
2. Går till `/`
3. Klickar på "Lösenord" tab
4. Fyller i email + password
5. Klickar "Logga in"
6. Väntar på "Välkommen, Joel"
7. ✅ Fortsätter med test

### Om problemet kvarstår:

#### Problem 1: Felaktigt lösenord
**Symptom:** Login-knappen klickas men ingen redirect

**Lösning:** Verifiera credentials:
```typescript
export const TEST_CREDENTIALS = {
    email: 'joel@kvarnsmyr.se',
    password: 'Appelsin1n!'  // Kontrollera att detta är rätt
};
```

#### Problem 2: Firebase inte redo
**Symptom:** "Firebase not initialized" eller liknande

**Lösning:** Vänta längre på networkidle:
```typescript
await page.waitForLoadState('networkidle', { timeout: 30000 });
```

#### Problem 3: Selector matchar inte
**Symptom:** Timeout waiting for selector

**Lösning:** Inspektera DOM manuellt:
```bash
# Kör i debug mode
npx playwright test --debug e2e/onboarding-flow.spec.ts
```

Använd Playwright Inspector för att hitta rätt selector.

## Vad som ändrades

### Före:
```typescript
// Leta efter knapp som inte finns
const demoLoginButton = page.locator('button:has-text("Demo Login")');
await demoLoginButton.click();
```

### Efter:
```typescript
// Använd password login-flödet
const passwordTab = page.locator('button:has-text("Lösenord")');
await passwordTab.click();

await page.locator('input[type="email"]').fill(TEST_CREDENTIALS.email);
await page.locator('input[type="password"]').fill(TEST_CREDENTIALS.password);

const loginButton = page.locator('button:has-text("Logga in")');
await loginButton.click();
```

## Alternativ: Använd Demo-knappen istället

Om du föredrar att använda demo-mode i testerna:

```typescript
export async function loginAsDemo(page: Page) {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click "Visa Demo (Elton)" button
    const demoButton = page.locator('button:has-text("Visa Demo")');
    await expect(demoButton).toBeVisible({ timeout: 10000 });
    await demoButton.click();

    // Wait for demo login to complete
    await page.waitForSelector('h1:has-text("Välkommen")', { timeout: 15000 });
}
```

**Men:** Demo-mode använder inte din riktiga användare, så projekten sparas inte till joel@kvarnsmyr.se.

**Rekommendation:** Använd password login för att se faktiska projekt i din databas.

## Nästa steg

1. Kör testerna igen
2. Verifiera att login fungerar
3. Låt testerna skapa projekt
4. Kolla i Firebase Console att projekten skapas med rätt ownerId
