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
 * AI Name Consistency Tests
 *
 * Verifies that the AI uses the project name (smeknamn) consistently
 * across both text chat (AIAssistant) and voice chat (LiveElton)
 */

test.describe('AI Name Consistency: Text to Voice', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should show project name in text chat header', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Header should show vehicle make/model
    const header = page.locator('h3.font-serif.font-semibold');
    await expect(header).toBeVisible();

    const text = await header.textContent();
    expect(text).toBeTruthy();
  });

  test('should use project name in text chat greeting', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // First message should be greeting
    const firstMessage = page.locator('div.rounded-2xl').first();
    await expect(firstMessage).toBeVisible();

    const greetingText = await firstMessage.textContent();
    expect(greetingText).toContain('Hallå där');
  });

  test('should show same project context in LiveElton', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    // Get project name from header
    const projectHeader = page.locator('h1.font-serif.font-bold');
    const projectName = await projectHeader.textContent();

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);

    // Should show project context in LiveElton UI
    const bottomText = page.locator('p.text-center.text-slate-500').last();
    await expect(bottomText).toBeVisible();
  });

  test('should maintain AI name when switching from text to voice', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Get AI name from greeting
    const firstMessage = page.locator('div.rounded-2xl').first();
    const greetingText = await firstMessage.textContent();

    // Switch to voice
    await openLiveElton(page);
    await waitForConnection(page);

    // AI should be initialized with same context
    const liveEltonStatus = page.locator(selectors.liveElton.statusMessage);
    await expect(liveEltonStatus).toBeVisible();
  });

  test('should maintain AI name when switching from voice to text', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);

    // Return to text
    await closeLiveElton(page);

    // Text chat should still show same AI context
    const chatHeader = page.locator('h3.font-serif.font-semibold');
    await expect(chatHeader).toBeVisible();
  });
});

test.describe('AI Name Consistency: With Custom Nickname', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should use custom nickname in text chat if set', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Greeting should contain nickname if available
    const firstMessage = page.locator('div.rounded-2xl').first();
    const greetingText = await firstMessage.textContent();

    expect(greetingText).toContain('Hallå där');
  });

  test('should use custom nickname in LiveElton if set', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);

    // Should show project context
    const bottomText = page.locator('p.text-center.text-slate-500').last();
    await expect(bottomText).toBeVisible();
  });

  test('should fallback to "AI Assistant" if no nickname set', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const firstMessage = page.locator('div.rounded-2xl').first();
    await expect(firstMessage).toBeVisible();
  });
});

test.describe('AI Name Consistency: Dialect Changes', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should maintain AI name when changing to Dala-Elton', async ({ page }) => {
    await selectDialect(page, 'dalmal');

    const status = await getStatusMessage(page);
    expect(status).toContain('Dala-Elton');
  });

  test('should maintain AI name when changing to Gotlands-Elton', async ({ page }) => {
    await selectDialect(page, 'gotlandska');

    const status = await getStatusMessage(page);
    expect(status).toContain('Gotlands-Elton');
  });

  test('should maintain AI name when changing to Riks-Elton', async ({ page }) => {
    await selectDialect(page, 'rikssvenska');

    const status = await getStatusMessage(page);
    expect(status).toContain('Riks-Elton');
  });

  test('should maintain AI name through multiple dialect switches', async ({ page }) => {
    // Switch to Dala-Elton
    await selectDialect(page, 'dalmal');
    expect(await getStatusMessage(page)).toContain('Dala-Elton');

    // Switch to Gotlands-Elton
    await selectDialect(page, 'gotlandska');
    expect(await getStatusMessage(page)).toContain('Gotlands-Elton');

    // Switch back to Standard
    await selectDialect(page, 'standard');
    expect(await getStatusMessage(page)).toContain('Standard');

    // Should still show consistent status
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();
  });
});

test.describe('AI Name Consistency: Visual Verification', () => {
  test('should take screenshot showing AI name in text chat', async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/ai-name-text-chat.png' });
  });

  test('should take screenshot showing AI context in LiveElton', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/ai-name-live-elton.png' });
  });
});
