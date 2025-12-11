import { Page, expect } from '@playwright/test';

/**
 * Helper functions for user registration E2E tests
 */

export interface TestUser {
    email: string;
    password: string;
    name: string;
}

/**
 * Generate a unique test user with random email
 */
export function generateTestUser(): TestUser {
    const timestamp = Date.now();
    const randomId = Math.floor(Math.random() * 10000);

    return {
        email: `test-user-${timestamp}-${randomId}@vanplan-test.com`,
        name: `E2E Test User ${randomId}`,
        password: 'TestPassword123!'
    };
}

/**
 * Register a new user account
 */
export async function registerNewUser(page: Page, user: TestUser): Promise<void> {
    console.log(`🆕 Registering user: ${user.email}`);

    // Should be on landing page
    await page.waitForLoadState('networkidle');

    // Wait for auth landing to be visible
    await page.waitForSelector('h1:has-text("The VanPlan")', { timeout: 15000 });

    // Click "Lösenord" tab to switch to password mode
    const passwordTab = page.locator('button:has-text("Lösenord")');
    await expect(passwordTab).toBeVisible({ timeout: 10000 });
    await passwordTab.click();

    await page.waitForTimeout(500);

    // Click "Registrera dig här" link to switch to register mode
    const registerLink = page.locator('text=Inget konto? Registrera dig här.');
    await expect(registerLink).toBeVisible({ timeout: 5000 });
    await registerLink.click();

    // Wait for registration form
    await page.waitForSelector('h2:has-text("Välkommen! Vad heter du?")', { timeout: 5000 });

    // Fill registration form
    await page.locator('input[placeholder="Ditt namn"]').fill(user.name);
    await page.locator('input[type="email"]').fill(user.email);
    await page.locator('input[type="password"]').fill(user.password);

    // Submit registration
    const createButton = page.locator('button:has-text("Skapa konto")');
    await expect(createButton).toBeEnabled();
    await createButton.click();

    // Wait for successful registration (redirects to project selector)
    await page.waitForSelector('h1:has-text("Välkommen")', { timeout: 15000 });

    console.log('✅ User registered successfully!');
}

/**
 * Switch from login mode to registration mode
 */
export async function switchToRegisterMode(page: Page): Promise<void> {
    // Click "Lösenord" tab if not already active
    const passwordTab = page.locator('button:has-text("Lösenord")');
    if (await passwordTab.isVisible({ timeout: 2000 })) {
        await passwordTab.click();
        await page.waitForTimeout(500);
    }

    // Click "Registrera dig här"
    const registerLink = page.locator('text=Inget konto? Registrera dig här.');
    await expect(registerLink).toBeVisible({ timeout: 5000 });
    await registerLink.click();

    // Wait for registration heading
    await expect(page.locator('h2:has-text("Välkommen! Vad heter du?")')).toBeVisible();
}

/**
 * Switch from registration mode to login mode
 */
export async function switchToLoginMode(page: Page): Promise<void> {
    const loginLink = page.locator('text=Har du redan konto? Logga in.');
    await expect(loginLink).toBeVisible({ timeout: 5000 });
    await loginLink.click();

    // Wait for login heading
    await expect(page.locator('h2:has-text("Logga in")')).toBeVisible();
}

/**
 * Logout the current user
 */
export async function logout(page: Page): Promise<void> {
    console.log('🔓 Logging out...');

    // Try to find logout button/link
    // This depends on your UI - adjust selector as needed
    const logoutButton = page.locator('button:has-text("Logga ut")')
        .or(page.locator('text=Logga ut'))
        .first();

    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await logoutButton.click();
        await page.waitForLoadState('networkidle');
        console.log('✅ Logged out');
    } else {
        // Fallback: Clear cookies and reload
        console.log('⚠️  No logout button found, clearing session...');
        await page.context().clearCookies();
        await page.goto('/');
        await page.waitForLoadState('networkidle');
        console.log('✅ Session cleared');
    }
}

/**
 * Login with an existing user (useful after registration)
 */
export async function loginWithUser(page: Page, email: string, password: string): Promise<void> {
    console.log(`🔐 Logging in as: ${email}`);

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Wait for auth landing to be visible
    await page.waitForSelector('h1:has-text("The VanPlan")', { timeout: 15000 });

    // Click "Lösenord" tab
    const passwordTab = page.locator('button:has-text("Lösenord")');
    await expect(passwordTab).toBeVisible({ timeout: 10000 });
    await passwordTab.click();

    await page.waitForTimeout(500);

    // Fill in credentials
    await page.locator('input[type="email"]').fill(email);
    await page.locator('input[type="password"]').fill(password);

    // Click "Logga in"
    const loginButton = page.locator('button:has-text("Logga in")');
    await expect(loginButton).toBeEnabled();
    await loginButton.click();

    // Wait for redirect to project selector
    await page.waitForSelector('h1:has-text("Välkommen")', { timeout: 15000 });

    console.log('✅ Logged in successfully!');
}

/**
 * Register a new user and create their first project
 */
export async function registerUserAndCreateProject(
    page: Page,
    user: TestUser,
    projectOptions: {
        projectType: 'renovation' | 'conversion' | 'maintenance';
        skillLevel: 'beginner' | 'intermediate' | 'expert';
        vehicleDescription: string;
        nickname?: string;
        notes?: string;
    }
): Promise<void> {
    // Register user
    await registerNewUser(page, user);

    console.log('📦 Creating first project...');

    // Click "Nytt Projekt"
    const newProjectCard = page.locator('div.border-dashed:has-text("Nytt Projekt"):has-text("Lägg till en ny van")');
    await expect(newProjectCard).toBeVisible({ timeout: 10000 });
    await newProjectCard.click();

    // Step 1: Fill form
    await page.waitForSelector('text=Starta nytt projekt', { timeout: 5000 });

    const projectTypeMap = {
        renovation: 'Renovering',
        conversion: 'Ombyggnad',
        maintenance: 'Förvaltning'
    };
    await page.locator(`button:has-text("${projectTypeMap[projectOptions.projectType]}")`).click();

    const skillLevelMap = {
        beginner: 'Nybörjare',
        intermediate: 'Hemmameck',
        expert: 'Certifierad'
    };
    await page.locator(`button:has-text("${skillLevelMap[projectOptions.skillLevel]}"`).click();

    await page.locator('textarea[placeholder*="ABC123"]').fill(projectOptions.vehicleDescription);
    await page.locator('button:has-text("Starta Research")').click();

    // Step 2: Wait for AI research
    console.log('🔍 Waiting for AI research...');
    await page.waitForSelector('text=Granska & Komplettera', { timeout: 30000 });

    // Step 3: Complete project
    if (projectOptions.nickname) {
        await page.locator('input[placeholder*="Pärlan"]').fill(projectOptions.nickname);
    }

    if (projectOptions.notes) {
        await page.locator('textarea').last().fill(projectOptions.notes);
    }

    await page.locator('button:has-text("Skapa projekt")').click();

    // Wait for project to load
    await page.waitForLoadState('networkidle');
    await expect(page.locator('h1.font-serif.font-bold')).toBeVisible({ timeout: 15000 });

    console.log('✅ Project created for new user!');
}
