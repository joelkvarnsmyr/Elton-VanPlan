import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth-helpers';
import { selectors } from './helpers/selectors';
import {
  openLiveElton,
  waitForConnection,
  selectDialect,
  getStatusMessage
} from './helpers/live-elton-helpers';

/**
 * LiveElton Dialect Switching Tests
 *
 * Verifies that dialect selection works correctly in LiveElton
 */

test.describe('LiveElton: Dialect Selection', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    // Open LiveElton
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should open dialect settings when Settings button is clicked', async ({ page }) => {
    const settingsButton = page.locator(selectors.liveElton.settingsButton);
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Modal should appear
    const modal = page.locator('div.bg-black\\/80');
    await expect(modal).toBeVisible();

    // Title should be visible
    const title = page.locator('h3:has-text("Välj Dialekt")');
    await expect(title).toBeVisible();
  });

  test('should display all 4 dialects in settings', async ({ page }) => {
    const settingsButton = page.locator(selectors.liveElton.settingsButton);
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Check for all dialects
    await expect(page.locator('text=Dala-Elton')).toBeVisible();
    await expect(page.locator('text=Gotlands-Elton')).toBeVisible();
    await expect(page.locator('text=Riks-Elton')).toBeVisible();
    await expect(page.locator('text=Standard')).toBeVisible();
  });

  test('should show dialect descriptions', async ({ page }) => {
    const settingsButton = page.locator(selectors.liveElton.settingsButton);
    await settingsButton.click();
    await page.waitForTimeout(500);

    await expect(page.locator('text=Trygg, gubbig & bred Dalmål')).toBeVisible();
    await expect(page.locator('text=Släpig, melodiös')).toBeVisible();
    await expect(page.locator('text=Tydlig, modern & neutral')).toBeVisible();
  });

  test('should indicate currently selected dialect', async ({ page }) => {
    const settingsButton = page.locator(selectors.liveElton.settingsButton);
    await settingsButton.click();
    await page.waitForTimeout(500);

    // One dialect should have teal background (selected)
    const selectedDialect = page.locator('button.bg-teal-600').first();
    await expect(selectedDialect).toBeVisible();

    // Should have check icon
    const checkIcon = selectedDialect.locator('svg');
    await expect(checkIcon).toBeVisible();
  });

  test('should change dialect to Dala-Elton', async ({ page }) => {
    await selectDialect(page, 'dalmal');

    // Status should update
    const status = await getStatusMessage(page);
    expect(status).toContain('Dala-Elton');
  });

  test('should change dialect to Gotlands-Elton', async ({ page }) => {
    await selectDialect(page, 'gotlandska');

    const status = await getStatusMessage(page);
    expect(status).toContain('Gotlands-Elton');
  });

  test('should change dialect to Riks-Elton', async ({ page }) => {
    await selectDialect(page, 'rikssvenska');

    const status = await getStatusMessage(page);
    expect(status).toContain('Riks-Elton');
  });

  test('should change dialect to Standard', async ({ page }) => {
    // First change to another dialect
    await selectDialect(page, 'dalmal');

    // Then back to Standard
    await selectDialect(page, 'standard');

    const status = await getStatusMessage(page);
    expect(status).toContain('Standard');
  });

  test('should close settings modal with X button', async ({ page }) => {
    const settingsButton = page.locator(selectors.liveElton.settingsButton);
    await settingsButton.click();
    await page.waitForTimeout(500);

    // Click X button
    const closeButton = page.locator('button.p-2.bg-nordic-charcoal.rounded-full').first();
    await closeButton.click();
    await page.waitForTimeout(500);

    // Modal should be closed
    const modal = page.locator('div.bg-black\\/80');
    await expect(modal).not.toBeVisible();
  });

  test('should take screenshot of dialect selector', async ({ page }) => {
    const settingsButton = page.locator(selectors.liveElton.settingsButton);
    await settingsButton.click();
    await page.waitForTimeout(500);

    await page.screenshot({ path: 'e2e/screenshots/live-elton-dialect-selector.png' });
  });
});

test.describe('LiveElton: Dialect Switching - Multiple Changes', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should handle multiple dialect switches in sequence', async ({ page }) => {
    // Switch through all dialects
    await selectDialect(page, 'dalmal');
    expect(await getStatusMessage(page)).toContain('Dala-Elton');

    await selectDialect(page, 'gotlandska');
    expect(await getStatusMessage(page)).toContain('Gotlands-Elton');

    await selectDialect(page, 'rikssvenska');
    expect(await getStatusMessage(page)).toContain('Riks-Elton');

    await selectDialect(page, 'standard');
    expect(await getStatusMessage(page)).toContain('Standard');
  });

  test('should maintain connection through dialect changes', async ({ page }) => {
    // Change dialect multiple times
    for (let i = 0; i < 3; i++) {
      await selectDialect(page, 'dalmal');
      await page.waitForTimeout(500);
      await selectDialect(page, 'standard');
      await page.waitForTimeout(500);
    }

    // Should still be connected
    const status = await getStatusMessage(page);
    expect(status).toBeTruthy();
  });
});
