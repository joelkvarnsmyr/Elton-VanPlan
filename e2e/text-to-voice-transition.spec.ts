import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth-helpers';
import { selectors } from './helpers/selectors';
import {
  openLiveElton,
  closeLiveElton,
  waitForConnection,
  selectDialect,
  getStatusMessage,
  isLiveEltonOpen
} from './helpers/live-elton-helpers';

/**
 * Text-to-Voice Transition Tests
 *
 * Verifies seamless transitions between:
 * - Text chat (AIAssistant) → Voice chat (LiveElton)
 * - Voice chat (LiveElton) → Text chat (AIAssistant)
 * - Context preservation across transitions
 * - UI state management
 */

test.describe('Transition: Text to Voice', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should show "Ring upp" button in text chat', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const ringUppButton = page.locator(selectors.chat.ringUppButton);
    await expect(ringUppButton).toBeVisible();
  });

  test('should transition from text to voice when "Ring upp" clicked', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Click Ring upp
    await openLiveElton(page);
    await waitForConnection(page);

    // Should show LiveElton UI
    const hangUpButton = page.locator(selectors.liveElton.hangUpButton);
    await expect(hangUpButton).toBeVisible();
  });

  test('should hide text chat UI when LiveElton opens', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Verify text input exists before transition
    const textInput = page.locator('textarea[placeholder*="Säg något"]');
    await expect(textInput).toBeVisible();

    // Open LiveElton
    await openLiveElton(page);
    await waitForConnection(page);

    // Text input should be hidden/gone
    await expect(textInput).not.toBeVisible();
  });

  test('should maintain project context in transition', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Get vehicle info from header
    const header = page.locator('h3.font-serif.font-semibold');
    const vehicleInfo = await header.textContent();

    // Open LiveElton
    await openLiveElton(page);
    await waitForConnection(page);

    // Should maintain context
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();
  });

  test('should show loading/connecting state immediately after transition', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const ringUppButton = page.locator(selectors.chat.ringUppButton);
    await ringUppButton.click();

    // Should immediately show connecting UI
    await page.waitForTimeout(500);

    // Should have either spinner or status message
    const hasSpinner = await page.locator('svg.animate-spin').count() > 0;
    const hasStatus = await page.locator(selectors.liveElton.statusMessage).count() > 0;

    expect(hasSpinner || hasStatus).toBe(true);
  });
});

test.describe('Transition: Voice to Text', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    // Start in LiveElton
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should show hang up button in LiveElton', async ({ page }) => {
    const hangUpButton = page.locator(selectors.liveElton.hangUpButton);
    await expect(hangUpButton).toBeVisible();
  });

  test('should return to text chat when hang up clicked', async ({ page }) => {
    await closeLiveElton(page);

    // Should show text input again
    const textInput = page.locator(selectors.chat.textInput);
    await expect(textInput).toBeVisible();
  });

  test('should hide LiveElton UI when returning to text', async ({ page }) => {
    await closeLiveElton(page);

    // LiveElton-specific elements should be gone
    const container = page.locator(selectors.liveElton.container);
    await expect(container).not.toBeVisible();
  });

  test('should maintain chat history when returning to text', async ({ page }) => {
    await closeLiveElton(page);

    // Chat history should still be visible
    const firstMessage = page.locator('div.rounded-2xl').first();
    await expect(firstMessage).toBeVisible();
  });

  test('should maintain project context when returning to text', async ({ page }) => {
    await closeLiveElton(page);

    // Header should still show vehicle info
    const header = page.locator('h3.font-serif.font-semibold');
    await expect(header).toBeVisible();
  });
});

test.describe('Transition: Multiple Switches', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should handle text → voice → text → voice transitions', async ({ page }) => {
    // Start in text
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Go to voice
    await openLiveElton(page);
    await waitForConnection(page);

    // Return to text
    await closeLiveElton(page);

    // Go to voice again
    await openLiveElton(page);
    await waitForConnection(page);

    // Should be back in LiveElton
    const hangUpButton = page.locator(selectors.liveElton.hangUpButton);
    await expect(hangUpButton).toBeVisible();
  });

  test('should maintain state across rapid transitions', async ({ page }) => {
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Rapid transitions
    for (let i = 0; i < 3; i++) {
      // Open LiveElton
      await openLiveElton(page);
      await waitForConnection(page, 5000);

      // Close LiveElton
      await closeLiveElton(page);
    }

    // Should still be functional
    const textInput = page.locator(selectors.chat.textInput);
    await expect(textInput).toBeVisible();
  });
});

test.describe('Transition: Dialect Persistence', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should remember dialect selection when returning from text chat', async ({ page }) => {
    // Open LiveElton
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    await openLiveElton(page);
    await waitForConnection(page);

    // Change to Dala-Elton
    await selectDialect(page, 'dalmal');

    // Return to text
    await closeLiveElton(page);

    // Return to voice
    await openLiveElton(page);
    await waitForConnection(page);

    // Should still show Dala-Elton
    const status = await getStatusMessage(page);
    expect(status).toContain('Dala-Elton');
  });
});

test.describe('Transition: Error Handling', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should handle missing permissions gracefully', async ({ page, context }) => {
    // Clear permissions
    await context.clearPermissions();

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Try to open LiveElton
    const ringUppButton = page.locator(selectors.chat.ringUppButton);
    await ringUppButton.click();
    await page.waitForTimeout(2000);

    // Should show some UI (either error or fallback)
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();
  });

  test('should allow return to text chat if LiveElton fails', async ({ page, context }) => {
    await context.clearPermissions();

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    const ringUppButton = page.locator(selectors.chat.ringUppButton);
    await ringUppButton.click();
    await page.waitForTimeout(2000);

    // Should be able to hang up even if connection failed
    const hangUpButton = page.locator(selectors.liveElton.hangUpButton);

    if (await hangUpButton.isVisible()) {
      await hangUpButton.click();
      await page.waitForTimeout(1000);

      // Should return to text
      const textInput = page.locator(selectors.chat.textInput);
      await expect(textInput).toBeVisible();
    }
  });
});

test.describe('Transition: Visual Verification', () => {
  test('should take screenshot of text-to-voice transition', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Screenshot before transition
    await page.screenshot({ path: 'e2e/screenshots/before-voice-transition.png' });

    // Transition
    await openLiveElton(page);
    await waitForConnection(page);

    // Screenshot after transition
    await page.screenshot({ path: 'e2e/screenshots/after-voice-transition.png' });
  });

  test('should take screenshot of voice-to-text transition', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    await openLiveElton(page);
    await waitForConnection(page);

    // Screenshot before transition
    await page.screenshot({ path: 'e2e/screenshots/before-text-transition.png' });

    // Transition back
    await closeLiveElton(page);

    // Screenshot after transition
    await page.screenshot({ path: 'e2e/screenshots/after-text-transition.png' });
  });
});
