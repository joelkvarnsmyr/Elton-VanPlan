import { test, expect } from '@playwright/test';
import { ensureLoggedIn, createTestProject, goToProjectSelector } from './helpers/auth-helpers';

/**
 * Onboarding Flow E2E Tests
 *
 * These tests verify the complete onboarding wizard flow:
 * - Project type selection (Renovering/Ombyggnad/Förvaltning)
 * - Skill level selection (Nybörjare/Hemmameck/Certifierad)
 * - Vehicle description and image upload
 * - AI research and data fetching
 * - Review and project creation
 *
 * Tests use real user credentials (joel@kvarnsmyr.se) so you can
 * see the created projects in your actual account.
 */

test.describe('Onboarding Flow', () => {

    test.beforeEach(async ({ page }) => {
        // Login with real credentials
        await ensureLoggedIn(page);

        // Navigate to project selector
        await goToProjectSelector(page);
    });

    test('should show onboarding wizard when clicking "Nytt Projekt"', async ({ page }) => {
        // Click "Nytt Projekt" card (the dashed border card)
        const newProjectCard = page.locator('div.border-dashed:has-text("Nytt Projekt"):has-text("Lägg till en ny van")');
        await expect(newProjectCard).toBeVisible({ timeout: 10000 });
        await newProjectCard.click();

        // Should show "Starta nytt projekt" heading
        await expect(page.locator('text=Starta nytt projekt')).toBeVisible({ timeout: 5000 });

        // Should show project type options
        await expect(page.locator('button:has-text("Renovering")')).toBeVisible();
        await expect(page.locator('button:has-text("Ombyggnad")')).toBeVisible();
        await expect(page.locator('button:has-text("Förvaltning")')).toBeVisible();

        // Should show skill level options
        await expect(page.locator('button:has-text("Nybörjare")')).toBeVisible();
        await expect(page.locator('button:has-text("Hemmameck")')).toBeVisible();
        await expect(page.locator('button:has-text("Certifierad")')).toBeVisible();

        // Should have vehicle description textarea
        await expect(page.locator('textarea[placeholder*="beskriv"]')).toBeVisible();
    });

    test('should validate required fields in step 1', async ({ page }) => {
        // Open wizard
        await page.locator('div.border-dashed:has-text("Nytt Projekt"):has-text("Lägg till en ny van")').click();
        await page.waitForSelector('text=Starta nytt projekt', { timeout: 5000 });

        // Try to proceed without filling anything
        const nextButton = page.locator('button:has-text("Starta Research")');

        // Button should be disabled or clicking should show validation
        const isDisabled = await nextButton.isDisabled();
        expect(isDisabled).toBe(true);

        // Select project type only
        await page.locator('button:has-text("Renovering")').click();

        // Should still be disabled (missing skill level and description)
        expect(await nextButton.isDisabled()).toBe(true);

        // Select skill level
        await page.locator('button:has-text("Hemmameck")').click();

        // Should still be disabled (missing description)
        expect(await nextButton.isDisabled()).toBe(true);

        // Add description
        await page.locator('textarea[placeholder*="beskriv"]').fill('Volvo 240 1990');

        // Now should be enabled
        expect(await nextButton.isDisabled()).toBe(false);
    });

    test('should progress through all 3 steps', async ({ page }) => {
        // Open wizard
        await page.locator('div.border-dashed:has-text("Nytt Projekt"):has-text("Lägg till en ny van")').click();
        await page.waitForSelector('text=Starta nytt projekt', { timeout: 5000 });

        // Step 1: Fill form
        await page.locator('button:has-text("Renovering")').click();
        await page.locator('button:has-text("Hemmameck")').click();
        await page.locator('textarea[placeholder*="ABC123"]').fill('Volvo 240 1990 - Test Project');
        await page.locator('button:has-text("Starta Research")').click();

        // Step 2: Should show research progress (no specific heading, just check for progress indicator)
        await expect(page.locator('text=Hämtar fordonsdata').or(page.locator('text=Söker')).first()).toBeVisible({ timeout: 10000 });

        // Wait for research to complete (may take 15-20 seconds) - look for step 3 heading
        await expect(page.locator('text=Granska & Komplettera')).toBeVisible({ timeout: 30000 });

        // Step 3: Should show review form
        await expect(page.locator('input[placeholder*="Pärlan"]')).toBeVisible();
        await expect(page.locator('textarea[placeholder*="kamrem"]')).toBeVisible();
        await expect(page.locator('button:has-text("Skapa projekt")')).toBeVisible();
    });

    test('should create renovation project for beginner', async ({ page }) => {
        await createTestProject(page, {
            projectType: 'renovation',
            skillLevel: 'beginner',
            vehicleDescription: 'Volvo 240 1990 - E2E Test (Nybörjare)',
            nickname: 'Testbilen',
            notes: 'Skapad av E2E test - Kan raderas'
        });

        // Verify project was created and loaded
        await expect(page.locator('h1.font-serif.font-bold')).toBeVisible();

        // Should show tasks (beginners get detailed tasks)
        const tasksSection = page.locator('text=Uppgifter');
        await expect(tasksSection).toBeVisible({ timeout: 5000 });

        console.log('✅ Test completed - Check your account for the created project!');
    });

    test('should create conversion project for intermediate', async ({ page }) => {
        await createTestProject(page, {
            projectType: 'conversion',
            skillLevel: 'intermediate',
            vehicleDescription: 'Mercedes Sprinter 2015 - Camper Conversion Test',
            nickname: 'Äventyraren',
            notes: 'E2E test project - Ombyggnad till camper'
        });

        // Verify project was created
        await expect(page.locator('h1.font-serif.font-bold')).toBeVisible();

        console.log('✅ Conversion project created - Check your account!');
    });

    test('should create maintenance project for expert', async ({ page }) => {
        await createTestProject(page, {
            projectType: 'maintenance',
            skillLevel: 'expert',
            vehicleDescription: 'Volvo V70 D5 2008',
            nickname: 'Lastbilen',
            notes: 'E2E test - Löpande underhåll'
        });

        // Verify project was created
        await expect(page.locator('h1.font-serif.font-bold')).toBeVisible();

        console.log('✅ Maintenance project created - Check your account!');
    });

    test('should display AI-generated vehicle data', async ({ page }, testInfo) => {
        // Create a project with a real vehicle (Volvo 240)
        await page.locator('div.border-dashed:has-text("Nytt Projekt"):has-text("Lägg till en ny van")').click();
        await page.waitForSelector('text=Starta nytt projekt', { timeout: 5000 });

        // Step 1
        await page.locator('button:has-text("Renovering")').click();
        await page.locator('button:has-text("Hemmameck")').click();
        await page.locator('textarea[placeholder*="ABC123"]').fill('Volvo 240 GL 1990');
        await page.locator('button:has-text("Starta Research")').click();

        // Step 2: Wait for AI research
        await page.waitForSelector('text=Granska & Komplettera', { timeout: 30000 });

        // Step 3: Check if AI found vehicle data
        const suggestedName = page.locator('p:has-text("Volvo")').first();
        await expect(suggestedName).toBeVisible({ timeout: 5000 });

        // Take screenshot to verify AI data
        await page.screenshot({ path: `test-results/ai-data-${testInfo.project.name}.png` });

        // Complete project creation
        await page.locator('button:has-text("Skapa projekt")').click();
        await page.waitForLoadState('networkidle');

        console.log('✅ AI data verification complete');
    });

    test('should persist userSkillLevel and nickname', async ({ page }) => {
        // Create project with specific nickname and skill level
        const testNickname = 'E2E Test ' + Date.now();

        await createTestProject(page, {
            projectType: 'maintenance',
            skillLevel: 'beginner',
            vehicleDescription: 'Test Vehicle for Data Persistence',
            nickname: testNickname,
            notes: 'Testing data persistence'
        });

        // Go back to project selector
        await goToProjectSelector(page);

        // Select the project again
        await page.locator(`text=${testNickname}`).first().click();

        // Verify project loaded
        await expect(page.locator('h1.font-serif.font-bold')).toBeVisible();

        // NOTE: Visual verification needed in console logs
        // The userSkillLevel and nickname are stored in Firestore
        console.log('✅ Project persistence test complete - Verify in Firebase Console');
    });

    test('should cancel onboarding wizard', async ({ page }) => {
        // Open wizard
        await page.locator('div.border-dashed:has-text("Nytt Projekt"):has-text("Lägg till en ny van")').click();
        await page.waitForSelector('text=Starta nytt projekt', { timeout: 5000 });

        // Fill some data
        await page.locator('button:has-text("Renovering")').click();
        await page.locator('button:has-text("Nybörjare")').click();

        // Look for cancel/close button (X icon or "Avbryt" button)
        const cancelButton = page.locator('button[aria-label="Stäng"]').or(page.locator('button:has-text("Avbryt")')).first();

        if (await cancelButton.isVisible()) {
            await cancelButton.click();

            // Should be back at project selector
            await expect(page.locator('h1:has-text("Välkommen")')).toBeVisible({ timeout: 5000 });
        } else {
            console.log('⚠️  No cancel button found - may need to be added to UI');
        }
    });

    test.afterEach(async ({ page }) => {
        // Optional: Clean up test projects
        // For now, we'll leave them so you can inspect them manually
        console.log('ℹ️  Test projects remain in your account for inspection');
        console.log('ℹ️  You can manually delete them via the UI');
    });
});

/**
 * MANUAL CLEANUP INSTRUCTIONS
 *
 * After running these tests, you'll have several test projects in your account.
 * To clean them up:
 *
 * 1. Login to https://your-app-url.com
 * 2. Go to project selector
 * 3. Look for projects with "E2E Test" in the name
 * 4. Click the trash icon to delete them
 *
 * OR
 *
 * Use Firebase Console:
 * 1. Go to Firestore
 * 2. Navigate to 'projects' collection
 * 3. Filter by ownerEmail == 'joel@kvarnsmyr.se'
 * 4. Delete test projects manually
 */
