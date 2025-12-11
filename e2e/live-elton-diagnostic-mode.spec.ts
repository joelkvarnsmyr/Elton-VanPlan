import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth-helpers';
import { selectors } from './helpers/selectors';
import {
  openLiveElton,
  closeLiveElton,
  waitForConnection,
  toggleDiagnosticMode,
  isDiagnosticModeActive,
  selectDialect,
  getStatusMessage,
  waitForDiagnosticStatus
} from './helpers/live-elton-helpers';

/**
 * LiveElton Diagnostic Mode (Ljud-Doktor) Tests
 *
 * Verifies that diagnostic mode works correctly:
 * - Activating/deactivating with Stethoscope button
 * - UI changes (icon, border, status)
 * - Prompt changes to Sound Doctor mode
 * - Combining with different dialects
 */

test.describe('LiveElton: Diagnostic Mode', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    // Open LiveElton using helper
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should have diagnostic toggle button visible', async ({ page }) => {
    const diagnosticButton = page.locator(selectors.liveElton.diagnosticToggle);
    await expect(diagnosticButton).toBeVisible();
  });

  test('should activate diagnostic mode when toggle is clicked', async ({ page }) => {
    await toggleDiagnosticMode(page, true);

    // Verify button has amber styling
    const diagnosticButton = page.locator(selectors.liveElton.diagnosticToggle);
    await expect(diagnosticButton).toHaveClass(/bg-amber-500/);

    // Verify it's actually active
    expect(await isDiagnosticModeActive(page)).toBe(true);
  });

  test('should show "Lyssnar" status when diagnostic mode active', async ({ page }) => {
    await toggleDiagnosticMode(page, true);
    await waitForDiagnosticStatus(page, 'Lyssnar', 3000);

    const status = await getStatusMessage(page);
    expect(status).toContain('Lyssnar');
  });

  test('should change main icon to Stethoscope when diagnostic mode active', async ({ page }) => {
    await toggleDiagnosticMode(page, true);

    // Check for amber-colored element with SVG (Stethoscope)
    const stethoscopeIcon = page.locator('.text-amber-500').filter({
      has: page.locator('svg')
    });

    await expect(stethoscopeIcon).toBeVisible();
  });

  test('should change border color to amber when diagnostic mode active', async ({ page }) => {
    await toggleDiagnosticMode(page, true);

    // Main content area should have amber border
    const mainContainer = page.locator('div.rounded-3xl.border-4');
    await expect(mainContainer).toHaveClass(/border-amber-500/);
  });

  test('should deactivate diagnostic mode when clicked again', async ({ page }) => {
    // Activate
    await toggleDiagnosticMode(page, true);
    expect(await isDiagnosticModeActive(page)).toBe(true);

    // Deactivate
    await toggleDiagnosticMode(page, false);
    expect(await isDiagnosticModeActive(page)).toBe(false);

    // Should return to normal teal color
    const mainIcon = page.locator('.text-teal-500').filter({
      has: page.locator('svg')
    });
    await expect(mainIcon).toBeVisible();
  });

  test('should return to normal status when diagnostic mode deactivated', async ({ page }) => {
    // Activate then deactivate
    await toggleDiagnosticMode(page, true);
    await page.waitForTimeout(1000);
    await toggleDiagnosticMode(page, false);

    // Wait for status to update
    await page.waitForTimeout(1000);

    // Status should show connected or dialect name
    const status = await getStatusMessage(page);
    expect(status).toMatch(/Ansluten|Värmer upp|Dala-Elton|Gotlands-Elton|Riks-Elton|Standard/);
  });

  test('should work with Dala-Elton dialect', async ({ page }) => {
    // Change to Dala-Elton
    await selectDialect(page, 'dalmal');

    // Activate diagnostic mode
    await toggleDiagnosticMode(page, true);

    // Should show amber Stethoscope
    const stethoscopeIcon = page.locator('.text-amber-500').filter({
      has: page.locator('svg')
    });
    await expect(stethoscopeIcon).toBeVisible();
  });

  test('should work with Gotlands-Elton dialect', async ({ page }) => {
    await selectDialect(page, 'gotlandska');
    await toggleDiagnosticMode(page, true);

    const stethoscopeIcon = page.locator('.text-amber-500').filter({
      has: page.locator('svg')
    });
    await expect(stethoscopeIcon).toBeVisible();
  });

  test('should persist diagnostic mode when changing dialects', async ({ page }) => {
    // Activate diagnostic mode first
    await toggleDiagnosticMode(page, true);

    // Change dialect
    await selectDialect(page, 'rikssvenska');

    // Diagnostic mode should still be active (amber border)
    const mainContainer = page.locator('div.rounded-3xl.border-4');
    await expect(mainContainer).toHaveClass(/border-amber-500/);
  });

  test('should show amber volume visualization in diagnostic mode', async ({ page }) => {
    await toggleDiagnosticMode(page, true);

    // Volume visualizer should be amber instead of teal
    const volumeViz = page.locator('div.blur-\\[50px\\]');
    await expect(volumeViz).toHaveClass(/bg-amber-500/);
  });

  test('should take screenshot of diagnostic mode UI', async ({ page }) => {
    await toggleDiagnosticMode(page, true);
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/live-elton-diagnostic-mode.png' });
  });
});

test.describe('LiveElton: Diagnostic Mode - Dialect Combinations', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should work with diagnostic + Standard dialect', async ({ page }) => {
    await selectDialect(page, 'standard');
    await toggleDiagnosticMode(page, true);

    expect(await isDiagnosticModeActive(page)).toBe(true);
    const status = await getStatusMessage(page);
    expect(status).toBeTruthy();
  });

  test('should work with diagnostic + all dialects in sequence', async ({ page }) => {
    const dialects: Array<'standard' | 'dalmal' | 'gotlandska' | 'rikssvenska'> =
      ['standard', 'dalmal', 'gotlandska', 'rikssvenska'];

    // Enable diagnostic mode
    await toggleDiagnosticMode(page, true);

    // Test each dialect
    for (const dialect of dialects) {
      await selectDialect(page, dialect);

      // Verify diagnostic mode is still active
      expect(await isDiagnosticModeActive(page)).toBe(true);

      // Wait a bit before switching again
      await page.waitForTimeout(500);
    }

    // Diagnostic mode should still be active after all switches
    expect(await isDiagnosticModeActive(page)).toBe(true);
  });
});
