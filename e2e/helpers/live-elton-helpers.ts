/**
 * LiveElton E2E Test Helpers
 *
 * Centralized helper functions for testing LiveElton (voice/video chat) functionality
 */

import { Page, expect } from '@playwright/test';

/**
 * Opens LiveElton from the text chat view
 * Assumes you're already logged in and have a project selected
 */
export async function openLiveElton(page: Page) {
  console.log('📞 Opening LiveElton...');

  // Open text chat if not already open
  const chatButton = page.locator('[data-testid="chat-button"]');
  if (await chatButton.isVisible({ timeout: 2000 }).catch(() => false)) {
    await chatButton.click();
    await page.waitForTimeout(500);
  }

  // Wait for chat to be visible
  await page.waitForSelector('textarea[placeholder*="meddelande"]', { timeout: 5000 });

  // Click "Ring upp" button
  const ringUppButton = page.locator('[data-testid="ring-upp-button"]');
  await expect(ringUppButton).toBeVisible({ timeout: 5000 });
  await ringUppButton.click();

  // Wait for LiveElton container to appear
  await page.waitForSelector('[data-testid="live-elton-container"]', { timeout: 5000 });

  console.log('✅ LiveElton opened');
}

/**
 * Closes LiveElton and returns to text chat
 */
export async function closeLiveElton(page: Page) {
  console.log('📴 Closing LiveElton...');

  // Click hang up button
  const hangUpButton = page.locator('[data-testid="hang-up-button"]');
  await expect(hangUpButton).toBeVisible({ timeout: 5000 });
  await hangUpButton.click();

  // Wait for LiveElton to close
  await page.waitForSelector('[data-testid="live-elton-container"]', { state: 'hidden', timeout: 5000 });

  // Verify we're back at text chat
  await page.waitForSelector('textarea[placeholder*="meddelande"]', { timeout: 5000 });

  console.log('✅ LiveElton closed');
}

/**
 * Waits for LiveElton to establish WebSocket connection
 * Returns true if connected within timeout, false otherwise
 */
export async function waitForConnection(page: Page, timeout: number = 10000): Promise<boolean> {
  console.log('⏳ Waiting for LiveElton connection...');

  try {
    // Wait for status message to show "Ansluten" or dialect name (indicates connection)
    const statusMessage = page.locator('[data-testid="status-message"]');
    await expect(statusMessage).toBeVisible({ timeout: 5000 });

    // Wait for either "Ansluten" or dialect name to appear (means warming up or connected)
    await page.waitForFunction(
      () => {
        const status = document.querySelector('[data-testid="status-message"]')?.textContent || '';
        return status.includes('Ansluten') ||
               status.includes('Värmer upp') ||
               status.includes('Dala-Elton') ||
               status.includes('Gotlands-Elton') ||
               status.includes('Riks-Elton') ||
               status.includes('Standard');
      },
      { timeout }
    );

    console.log('✅ LiveElton connected');
    return true;
  } catch (error) {
    console.log('❌ LiveElton connection timeout');
    return false;
  }
}

/**
 * Selects a dialect in LiveElton
 * @param dialectId - 'standard', 'dalmal', 'gotlandska', or 'rikssvenska'
 */
export async function selectDialect(page: Page, dialectId: 'standard' | 'dalmal' | 'gotlandska' | 'rikssvenska') {
  console.log(`🗣️ Selecting dialect: ${dialectId}`);

  const dialectNames = {
    standard: 'Standard',
    dalmal: 'Dala-Elton',
    gotlandska: 'Gotlands-Elton',
    rikssvenska: 'Riks-Elton'
  };

  // Open settings modal
  const settingsButton = page.locator('[data-testid="settings-button"]');
  await expect(settingsButton).toBeVisible({ timeout: 5000 });
  await settingsButton.click();

  // Wait for dialect selector modal
  await page.waitForTimeout(500);

  // Click the dialect button
  const dialectButton = page.locator(`button:has-text("${dialectNames[dialectId]}")`);
  await expect(dialectButton).toBeVisible({ timeout: 5000 });
  await dialectButton.click();

  // Wait for reconnection
  await page.waitForTimeout(2000);

  // Verify status shows new dialect
  const statusMessage = page.locator('[data-testid="status-message"]');
  const statusText = await statusMessage.textContent();
  expect(statusText).toContain(dialectNames[dialectId]);

  console.log(`✅ Dialect changed to ${dialectId}`);
}

/**
 * Toggles diagnostic mode (Ljud-Doktor) on/off
 * @param enable - true to enable, false to disable
 */
export async function toggleDiagnosticMode(page: Page, enable: boolean) {
  console.log(`🩺 ${enable ? 'Enabling' : 'Disabling'} diagnostic mode...`);

  const diagnosticButton = page.locator('[data-testid="diagnostic-toggle"]');
  await expect(diagnosticButton).toBeVisible({ timeout: 5000 });

  // Check current state
  const isCurrentlyActive = await diagnosticButton.evaluate((el) => {
    return el.classList.contains('text-amber-500') || el.classList.contains('bg-amber-500');
  });

  // Only click if we need to change state
  if ((enable && !isCurrentlyActive) || (!enable && isCurrentlyActive)) {
    await diagnosticButton.click();
    await page.waitForTimeout(1000);
  }

  // Verify new state
  const isNowActive = await diagnosticButton.evaluate((el) => {
    return el.classList.contains('text-amber-500') || el.classList.contains('bg-amber-500');
  });

  expect(isNowActive).toBe(enable);

  console.log(`✅ Diagnostic mode ${enable ? 'enabled' : 'disabled'}`);
}

/**
 * Gets the current status message from LiveElton
 */
export async function getStatusMessage(page: Page): Promise<string> {
  const statusMessage = page.locator('[data-testid="status-message"]');
  await expect(statusMessage).toBeVisible({ timeout: 5000 });
  return (await statusMessage.textContent()) || '';
}

/**
 * Checks if LiveElton is in diagnostic mode
 */
export async function isDiagnosticModeActive(page: Page): Promise<boolean> {
  const diagnosticButton = page.locator('[data-testid="diagnostic-toggle"]');
  await expect(diagnosticButton).toBeVisible({ timeout: 5000 });

  return await diagnosticButton.evaluate((el) => {
    return el.classList.contains('text-amber-500') || el.classList.contains('bg-amber-500');
  });
}

/**
 * Checks if microphone is enabled
 */
export async function isMicrophoneEnabled(page: Page): Promise<boolean> {
  const micButton = page.locator('[data-testid="mic-toggle"]');
  await expect(micButton).toBeVisible({ timeout: 5000 });

  // Mic is enabled if button doesn't have muted/disabled styling
  return await micButton.evaluate((el) => {
    return !el.classList.contains('opacity-50');
  });
}

/**
 * Toggles microphone on/off
 */
export async function toggleMicrophone(page: Page) {
  console.log('🎤 Toggling microphone...');

  const micButton = page.locator('[data-testid="mic-toggle"]');
  await expect(micButton).toBeVisible({ timeout: 5000 });
  await micButton.click();
  await page.waitForTimeout(500);

  console.log('✅ Microphone toggled');
}

/**
 * Toggles video on/off
 */
export async function toggleVideo(page: Page) {
  console.log('📹 Toggling video...');

  const videoButton = page.locator('[data-testid="video-toggle"]');
  await expect(videoButton).toBeVisible({ timeout: 5000 });
  await videoButton.click();
  await page.waitForTimeout(500);

  console.log('✅ Video toggled');
}

/**
 * Checks if LiveElton is currently open
 */
export async function isLiveEltonOpen(page: Page): Promise<boolean> {
  try {
    const container = page.locator('[data-testid="live-elton-container"]');
    return await container.isVisible({ timeout: 1000 });
  } catch {
    return false;
  }
}

/**
 * Waits for diagnostic mode status to update
 */
export async function waitForDiagnosticStatus(page: Page, expected: string, timeout: number = 5000) {
  await page.waitForFunction(
    (expectedText) => {
      const status = document.querySelector('[data-testid="status-message"]')?.textContent || '';
      return status.includes(expectedText);
    },
    expected,
    { timeout }
  );
}
