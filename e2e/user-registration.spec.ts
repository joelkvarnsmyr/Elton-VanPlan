import { test, expect } from '@playwright/test';

/**
 * User Registration E2E Tests
 *
 * These tests verify the complete user registration flow:
 * - Switching to register mode
 * - Filling in name, email, and password
 * - Creating a new account
 * - Verifying successful login after registration
 *
 * Tests use randomly generated email addresses to avoid conflicts.
 */

test.describe('User Registration', () => {

    test.beforeEach(async ({ page }) => {
        // Navigate to the landing page
        await page.goto('/');
        await page.waitForLoadState('networkidle');

        // Wait for auth landing to be visible
        await page.waitForSelector('h1:has-text("The VanPlan")', { timeout: 15000 });
    });

    test('should show registration form when clicking "Registrera dig här"', async ({ page }) => {
        // Click "Lösenord" tab
        const passwordTab = page.locator('button:has-text("Lösenord")');
        await expect(passwordTab).toBeVisible({ timeout: 10000 });
        await passwordTab.click();

        await page.waitForTimeout(500);

        // Click "Registrera dig här" link
        const registerLink = page.locator('text=Inget konto? Registrera dig här.');
        await expect(registerLink).toBeVisible({ timeout: 5000 });
        await registerLink.click();

        // Should show registration heading
        await expect(page.locator('h2:has-text("Välkommen! Vad heter du?")')).toBeVisible();

        // Should show name input field
        await expect(page.locator('input[placeholder="Ditt namn"]')).toBeVisible();

        // Should show email input field
        await expect(page.locator('input[type="email"]')).toBeVisible();

        // Should show password input field
        await expect(page.locator('input[type="password"]')).toBeVisible();

        // Should show "Skapa konto" button
        await expect(page.locator('button:has-text("Skapa konto")')).toBeVisible();
    });

    test('should validate required fields during registration', async ({ page }) => {
        // Switch to registration mode
        await page.locator('button:has-text("Lösenord")').click();
        await page.waitForTimeout(500);
        await page.locator('text=Inget konto? Registrera dig här.').click();

        // Try to submit without filling anything
        const createButton = page.locator('button:has-text("Skapa konto")');

        // Button should be disabled
        expect(await createButton.isDisabled()).toBe(true);

        // Fill name only
        await page.locator('input[placeholder="Ditt namn"]').fill('Test User');
        expect(await createButton.isDisabled()).toBe(true);

        // Fill email
        await page.locator('input[type="email"]').fill('test@example.com');
        expect(await createButton.isDisabled()).toBe(true);

        // Fill password - now should be enabled
        await page.locator('input[type="password"]').fill('Password123!');
        expect(await createButton.isDisabled()).toBe(false);
    });

    test('should register a new user successfully', async ({ page }) => {
        console.log('🆕 Registering new user...');

        // Generate unique email
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 10000);
        const testEmail = `test-user-${timestamp}-${randomId}@vanplan-test.com`;
        const testName = `E2E Test User ${randomId}`;
        const testPassword = 'TestPassword123!';

        console.log(`📧 Test email: ${testEmail}`);
        console.log(`👤 Test name: ${testName}`);

        // Switch to password login tab
        await page.locator('button:has-text("Lösenord")').click();
        await page.waitForTimeout(500);

        // Click register link
        await page.locator('text=Inget konto? Registrera dig här.').click();
        await page.waitForSelector('h2:has-text("Välkommen! Vad heter du?")', { timeout: 5000 });

        // Fill registration form
        await page.locator('input[placeholder="Ditt namn"]').fill(testName);
        await page.locator('input[type="email"]').fill(testEmail);
        await page.locator('input[type="password"]').fill(testPassword);

        // Submit registration
        await page.locator('button:has-text("Skapa konto")').click();

        // Should redirect to project selector after successful registration
        await expect(page.locator('h1:has-text("Välkommen")')).toBeVisible({ timeout: 15000 });

        console.log('✅ User registered successfully!');
        console.log(`ℹ️  Email: ${testEmail}`);
        console.log(`ℹ️  Password: ${testPassword}`);
        console.log(`ℹ️  You can manually delete this test user from Firebase Console`);
    });

    test('should not allow registration with existing email', async ({ page }) => {
        console.log('🔄 Testing duplicate email registration...');

        // Use Joel's existing email
        const existingEmail = 'joel@kvarnsmyr.se';
        const testPassword = 'SomePassword123!';

        // Switch to registration mode
        await page.locator('button:has-text("Lösenord")').click();
        await page.waitForTimeout(500);
        await page.locator('text=Inget konto? Registrera dig här.').click();

        // Fill form with existing email
        await page.locator('input[placeholder="Ditt namn"]').fill('Test User');
        await page.locator('input[type="email"]').fill(existingEmail);
        await page.locator('input[type="password"]').fill(testPassword);

        // Try to register
        await page.locator('button:has-text("Skapa konto")').click();

        // Should show error message - "Adressen används redan."
        await expect(page.locator('text=/.*används redan.*|.*already in use.*|.*misslyckades.*/i')).toBeVisible({ timeout: 5000 });

        console.log('✅ Duplicate email correctly rejected');
    });

    test('should allow switching between login and register modes', async ({ page }) => {
        // Start in login mode
        await page.locator('button:has-text("Lösenord")').click();
        await page.waitForTimeout(500);

        // Should show "Logga in" heading
        await expect(page.locator('h2:has-text("Logga in")')).toBeVisible();

        // Switch to register
        await page.locator('text=Inget konto? Registrera dig här.').click();
        await expect(page.locator('h2:has-text("Välkommen! Vad heter du?")')).toBeVisible();
        await expect(page.locator('input[placeholder="Ditt namn"]')).toBeVisible();

        // Switch back to login
        await page.locator('text=Har du redan konto? Logga in.').click();
        await expect(page.locator('h2:has-text("Logga in")')).toBeVisible();
        await expect(page.locator('input[placeholder="Ditt namn"]')).not.toBeVisible();
    });

    test('should register user and create their first project', async ({ page }) => {
        test.setTimeout(90000); // 90 seconds for AI research
        console.log('🆕 Registering new user and creating project...');

        // Generate unique user
        const timestamp = Date.now();
        const randomId = Math.floor(Math.random() * 10000);
        const testEmail = `project-test-${timestamp}-${randomId}@vanplan-test.com`;
        const testName = `Project Tester ${randomId}`;
        const testPassword = 'TestPassword123!';

        console.log(`📧 Registering: ${testEmail}`);

        // Register new user
        await page.locator('button:has-text("Lösenord")').click();
        await page.waitForTimeout(500);
        await page.locator('text=Inget konto? Registrera dig här.').click();

        await page.locator('input[placeholder="Ditt namn"]').fill(testName);
        await page.locator('input[type="email"]').fill(testEmail);
        await page.locator('input[type="password"]').fill(testPassword);
        await page.locator('button:has-text("Skapa konto")').click();

        // Wait for project selector
        await expect(page.locator('h1:has-text("Välkommen")')).toBeVisible({ timeout: 15000 });

        console.log('✅ User registered, now creating project...');

        // Create a project
        const newProjectCard = page.locator('div.border-dashed:has-text("Nytt Projekt"):has-text("Lägg till en ny van")');
        await expect(newProjectCard).toBeVisible({ timeout: 10000 });
        await newProjectCard.click();

        // Fill onboarding wizard - Step 1
        await page.waitForSelector('text=Starta nytt projekt', { timeout: 5000 });
        await page.locator('button:has-text("Renovering")').click();
        await page.locator('button:has-text("Nybörjare")').click();
        await page.locator('textarea[placeholder*="ABC123"]').fill('Volvo 240 1990 - Mitt första projekt');
        await page.locator('button:has-text("Starta Research")').click();

        // Wait for AI research - Step 2 (can take up to 60 seconds)
        console.log('🔍 Waiting for AI research...');
        await page.waitForSelector('text=Granska & Komplettera', { timeout: 60000 });

        // Complete project - Step 3
        await page.locator('input[placeholder*="Pärlan"]').fill('Min första bil');
        await page.locator('textarea').last().fill('Skapad vid E2E registreringstest');
        await page.locator('button:has-text("Skapa projekt")').click();

        // Verify project created
        await page.waitForLoadState('networkidle');
        await expect(page.locator('h1.font-serif.font-bold')).toBeVisible({ timeout: 15000 });

        console.log('✅ New user registered and first project created!');
        console.log(`ℹ️  Email: ${testEmail}`);
        console.log(`ℹ️  Password: ${testPassword}`);
        console.log(`ℹ️  You can manually delete this test user from Firebase Console`);
    });

    test('should show validation error for weak password', async ({ page }) => {
        // Switch to registration mode
        await page.locator('button:has-text("Lösenord")').click();
        await page.waitForTimeout(500);
        await page.locator('text=Inget konto? Registrera dig här.').click();

        // Fill form with weak password
        await page.locator('input[placeholder="Ditt namn"]').fill('Test User');
        await page.locator('input[type="email"]').fill('test@example.com');
        await page.locator('input[type="password"]').fill('123'); // Too short

        // Try to register
        await page.locator('button:has-text("Skapa konto")').click();

        // Should show error about password strength
        await expect(page.locator('div.bg-rose-50')).toBeVisible({ timeout: 5000 });
    });

    test.afterEach(async ({ page }) => {
        console.log('ℹ️  Test completed');
        console.log('ℹ️  Note: Test users remain in Firebase Auth for manual cleanup');
    });
});

/**
 * MANUAL CLEANUP INSTRUCTIONS
 *
 * After running these tests, you'll have several test users in Firebase Auth.
 * To clean them up:
 *
 * 1. Go to Firebase Console (https://console.firebase.google.com)
 * 2. Select your project
 * 3. Go to Authentication > Users
 * 4. Look for users with emails like "test-user-*@vanplan-test.com"
 * 5. Delete them manually
 *
 * OR use Firebase CLI:
 * ```bash
 * firebase auth:export users.json
 * # Review users.json and identify test users
 * firebase auth:delete <user-uid>
 * ```
 */
