/**
 * Authentication helpers for Playwright E2E tests
 *
 * These helpers handle login/logout flows for testing
 */

import { Page, expect } from '@playwright/test';

// Real user credentials for testing
// These should match your actual Firebase account
export const TEST_CREDENTIALS = {
    email: 'joel@kvarnsmyr.se',
    password: 'Appelsin1n!'
};

/**
 * Login to the application using password login
 *
 * This function logs in with real credentials (not demo mode)
 */
export async function loginAsRealUser(page: Page) {
    console.log('🔐 Logging in as:', TEST_CREDENTIALS.email);

    // Go to home page
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Click "Lösenord" tab to switch to password login
    const passwordTab = page.locator('button:has-text("Lösenord")');
    await expect(passwordTab).toBeVisible({ timeout: 10000 });
    await passwordTab.click();

    // Wait for password mode to activate
    await page.waitForTimeout(500);

    // Fill in email
    const emailInput = page.locator('input[type="email"]');
    await expect(emailInput).toBeVisible();
    await emailInput.fill(TEST_CREDENTIALS.email);

    // Fill in password
    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
    await passwordInput.fill(TEST_CREDENTIALS.password);

    // Click "Logga in" button
    const loginButton = page.locator('button:has-text("Logga in")');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    console.log('✅ Login submitted, waiting for redirect...');

    // Wait for project selector or project view to appear
    // This means we're fully logged in and data is loaded
    await page.waitForSelector('h1:has-text("Välkommen")', { timeout: 15000 });

    console.log('✅ Logged in successfully!');
}

/**
 * Logout from the application
 */
export async function logout(page: Page) {
    console.log('🚪 Logging out...');

    // If we're in a project view, go back to project selector first
    const backButton = page.locator('button:has-text("Tillbaka")');
    if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await backButton.click();
        await page.waitForLoadState('networkidle');
    }

    // Click logout button in project selector
    const logoutButton = page.locator('button[aria-label="Logga ut"], button:has-text("Logga ut")');
    await expect(logoutButton).toBeVisible({ timeout: 10000 });
    await logoutButton.click();

    // Wait for redirect to login page
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('button:has-text("Visa Demo")', { timeout: 10000 });

    console.log('✅ Logged out successfully');
}

/**
 * Check if user is currently logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
    try {
        // Check if we can see project selector or active project (signs of being logged in)
        const projectView = page.locator('h1.font-serif.font-bold');
        return await projectView.isVisible({ timeout: 2000 });
    } catch {
        return false;
    }
}

/**
 * Ensure user is logged in before running test
 *
 * Usage:
 * ```typescript
 * test.beforeEach(async ({ page }) => {
 *   await ensureLoggedIn(page);
 * });
 * ```
 */
export async function ensureLoggedIn(page: Page) {
    if (!(await isLoggedIn(page))) {
        await loginAsRealUser(page);
    } else {
        console.log('✅ Already logged in');
    }
}

/**
 * Select a project by name
 * Assumes you're on the project selector page
 */
export async function selectProject(page: Page, projectName: string) {
    console.log('📦 Selecting project:', projectName);

    // Wait for project cards to load
    await page.waitForSelector('[data-testid="project-card"]', { timeout: 10000 });

    // Find and click the project card with matching name
    const projectCard = page.locator(`[data-testid="project-card"]:has-text("${projectName}")`);
    await expect(projectCard).toBeVisible({ timeout: 5000 });
    await projectCard.click();

    // Wait for project to load
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    console.log('✅ Project selected');
}

/**
 * Go back to project selector
 */
export async function goToProjectSelector(page: Page) {
    console.log('🔙 Going to project selector...');

    // Check if we're already at project selector
    const welcomeHeading = page.locator('h1:has-text("Välkommen")');
    const isAtSelector = await welcomeHeading.isVisible({ timeout: 2000 }).catch(() => false);

    if (isAtSelector) {
        console.log('ℹ️  Already at project selector');
        return;
    }

    // We're in a project view - click back button
    const backButton = page.locator('button:has-text("Tillbaka")').or(page.locator('svg.lucide-arrow-left').locator('..')).first();

    if (await backButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await backButton.click();
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('h1:has-text("Välkommen")', { timeout: 10000 });
        console.log('✅ Navigated to project selector');
    } else {
        console.log('⚠️  Could not find back button - trying direct navigation');
        // Fallback: Go directly to root
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        await page.waitForSelector('h1:has-text("Välkommen")', { timeout: 10000 });
        console.log('✅ Navigated to project selector via direct URL');
    }
}

/**
 * Create a test project via onboarding wizard
 *
 * @param projectType - 'renovation', 'conversion', or 'maintenance'
 * @param skillLevel - 'beginner', 'intermediate', or 'expert'
 * @param vehicleDescription - Description of the vehicle
 * @param nickname - Optional nickname for the vehicle
 */
export async function createTestProject(
    page: Page,
    options: {
        projectType: 'renovation' | 'conversion' | 'maintenance';
        skillLevel: 'beginner' | 'intermediate' | 'expert';
        vehicleDescription: string;
        nickname?: string;
        notes?: string;
    }
) {
    console.log('➕ Creating test project:', options);

    // Make sure we're at project selector
    await goToProjectSelector(page);

    // Click "Nytt Projekt" card (the dashed border card)
    const newProjectCard = page.locator('div.border-dashed:has-text("Nytt Projekt"):has-text("Lägg till en ny van")');
    await expect(newProjectCard).toBeVisible({ timeout: 10000 });
    await newProjectCard.click();

    // Step 1: Select project type
    console.log('  📝 Step 1: Selecting project type...');
    await page.waitForSelector('text=Starta nytt projekt', { timeout: 5000 });

    const projectTypeMap = {
        renovation: 'Renovering',
        conversion: 'Ombyggnad',
        maintenance: 'Förvaltning'
    };
    await page.locator(`button:has-text("${projectTypeMap[options.projectType]}")`).click();

    // Select skill level
    const skillLevelMap = {
        beginner: 'Nybörjare',
        intermediate: 'Hemmameck',
        expert: 'Certifierad'
    };
    await page.locator(`button:has-text("${skillLevelMap[options.skillLevel]}")`).click();

    // Enter vehicle description
    await page.locator('textarea[placeholder*="ABC123"]').fill(options.vehicleDescription);

    // Click "Starta Research"
    await page.locator('button:has-text("Starta Research")').click();

    // Step 2: Wait for AI research to complete (this takes ~15-20 seconds)
    console.log('  🔍 Step 2: Waiting for AI research...');
    await page.waitForSelector('text=Granska & Komplettera', { timeout: 30000 });

    // Step 3: Review and complete
    console.log('  ✅ Step 3: Completing...');

    if (options.nickname) {
        const nicknameInput = page.locator('input[placeholder*="Pärlan"]');
        await nicknameInput.fill(options.nickname);
    }

    if (options.notes) {
        const notesTextarea = page.locator('textarea[placeholder*="kamrem"]');
        await notesTextarea.fill(options.notes);
    }

    // Click "Skapa projekt!"
    await page.locator('button:has-text("Skapa projekt")').click();

    // Wait for project to be created and loaded
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    console.log('✅ Test project created!');
}

/**
 * Delete a project (use with caution!)
 * Requires being in the project view
 */
export async function deleteProject(page: Page) {
    console.log('🗑️  Deleting current project...');

    // Go back to project selector
    await goToProjectSelector(page);

    // Find delete button on project card (trash icon)
    // This will need to be implemented based on your UI
    console.warn('⚠️  Delete function not fully implemented - manual cleanup required');
}
