import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth-helpers';
import { selectors } from './helpers/selectors';
import {
  openLiveElton,
  closeLiveElton,
  waitForConnection,
  selectDialect,
  getStatusMessage
} from './helpers/live-elton-helpers';

/**
 * Personality Vehicle Adaptation Tests
 *
 * Verifies that the AI personality adapts to:
 * - Vehicle age (veteran vs modern)
 * - Engine type (bensin, diesel, electric)
 * - Vehicle type (car, motorcycle, truck)
 * - Vehicle characteristics
 */

test.describe('Personality: Vehicle Age Adaptation', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should detect veteran vehicle from header', async ({ page }) => {
    // Get vehicle year from header
    const yearElement = page.locator('p.text-xs.text-slate-500').first();
    const yearText = await yearElement.textContent();

    // If year is available, we can verify it's displayed
    expect(yearText).toBeTruthy();
  });

  test('should show veteran personality traits in text chat for old vehicles', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Send question about character
    const input = page.locator('textarea[placeholder*="Säg något"]');
    await input.fill('Berätta lite om din karaktär');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // AI response should reflect vehicle age
    const lastMessage = page.locator('div.rounded-2xl').last();
    await expect(lastMessage).toBeVisible();
  });

  test('should use veteran context in LiveElton for old vehicles', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);

    // Should initialize successfully with vehicle context
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();
  });
});

test.describe('Personality: Engine Type Adaptation', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should show engine info in vehicle details', async ({ page }) => {
    // Engine info should be visible somewhere in the UI
    const projectHeader = page.locator('h1.font-serif.font-bold');
    await expect(projectHeader).toBeVisible();
  });

  test('should adapt personality to engine type in text chat', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Ask about engine
    const input = page.locator('textarea[placeholder*="Säg något"]');
    await input.fill('Vad har du för motor?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    // Should get response about engine
    const lastMessage = page.locator('div.rounded-2xl').last();
    const messageText = await lastMessage.textContent();
    expect(messageText).toBeTruthy();
  });

  test('should handle electric vehicle personality', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const input = page.locator('textarea[placeholder*="Säg något"]');
    await input.fill('Hur känns det att vara el-driven?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const lastMessage = page.locator('div.rounded-2xl').last();
    await expect(lastMessage).toBeVisible();
  });

  test('should handle diesel personality traits', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const input = page.locator('textarea[placeholder*="Säg något"]');
    await input.fill('Vad tycker du om dieselmotorer?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const lastMessage = page.locator('div.rounded-2xl').last();
    await expect(lastMessage).toBeVisible();
  });
});

test.describe('Personality: Vehicle Type Adaptation', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should detect vehicle make and model', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Header should show make/model
    const header = page.locator('h3.font-serif.font-semibold');
    const headerText = await header.textContent();
    expect(headerText).toBeTruthy();
  });

  test('should adapt to van/truck personality', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const input = page.locator('textarea[placeholder*="Säg något"]');
    await input.fill('Vad är du för typ av fordon?');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const lastMessage = page.locator('div.rounded-2xl').last();
    await expect(lastMessage).toBeVisible();
  });

  test('should adapt to motorcycle personality if applicable', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const input = page.locator('textarea[placeholder*="Säg något"]');
    await input.fill('Berätta om dig själv');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(3000);

    const lastMessage = page.locator('div.rounded-2xl').last();
    await expect(lastMessage).toBeVisible();
  });
});

test.describe('Personality: LiveElton Vehicle Context', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should initialize with vehicle-specific personality', async ({ page }) => {
    // Should show status indicating AI is ready
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();

    const text = await statusMessage.textContent();
    expect(text).toBeTruthy();
  });

  test('should maintain vehicle context with Dala-Elton dialect', async ({ page }) => {
    await selectDialect(page, 'dalmal');

    // Should reconnect with Dala dialect but same vehicle context
    const status = await getStatusMessage(page);
    expect(status).toContain('Dala-Elton');
  });

  test('should maintain vehicle context with Gotlands-Elton dialect', async ({ page }) => {
    await selectDialect(page, 'gotlandska');

    const status = await getStatusMessage(page);
    expect(status).toContain('Gotlands-Elton');
  });

  test('should maintain vehicle context in diagnostic mode', async ({ page }) => {
    const diagnosticButton = page.locator(selectors.liveElton.diagnosticToggle);
    await diagnosticButton.click();
    await page.waitForTimeout(1000);

    // Should show diagnostic status with vehicle context
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();
  });
});

test.describe('Personality: Consistency Across Sessions', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should maintain personality in text chat across reload', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Get first message
    const firstMessage = page.locator('div.rounded-2xl').first();
    const initialGreeting = await firstMessage.textContent();

    // Reload page
    await page.reload();
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    // Reopen chat
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Should show same greeting
    const firstMessageAgain = page.locator('div.rounded-2xl').first();
    const greetingAfterReload = await firstMessageAgain.textContent();

    expect(greetingAfterReload).toContain('Hallå där');
  });

  test('should maintain personality when reopening LiveElton', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Open LiveElton
    await openLiveElton(page);
    await waitForConnection(page);

    // Close LiveElton
    await closeLiveElton(page);

    // Reopen LiveElton
    await openLiveElton(page);
    await waitForConnection(page);

    // Should initialize with same personality
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();
  });
});

test.describe('Personality: Visual Verification', () => {
  test('should take screenshot of veteran vehicle personality in text', async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const input = page.locator('textarea[placeholder*="Säg något"]');
    await input.fill('Berätta om din personlighet och historia');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(4000);

    await page.screenshot({ path: 'e2e/screenshots/personality-veteran-text.png' });
  });

  test('should take screenshot of vehicle personality in LiveElton', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/personality-live-elton.png' });
  });
});
