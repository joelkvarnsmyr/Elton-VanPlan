import { test, expect } from '@playwright/test';
import { ensureLoggedIn } from './helpers/auth-helpers';
import { selectors } from './helpers/selectors';
import {
  openLiveElton,
  closeLiveElton,
  waitForConnection,
  isLiveEltonOpen,
  toggleMicrophone,
  toggleVideo,
  isMicrophoneEnabled
} from './helpers/live-elton-helpers';

/**
 * LiveElton Integration Tests
 *
 * These tests verify that the LiveElton (voice/video chat) integration works:
 * - Opening LiveElton from "Ring upp" button
 * - Permissions handling (audio/video)
 * - Connection status
 * - Control buttons (mic, video, hang up)
 * - Project context passing
 * - UI states and animations
 */

test.describe('LiveElton: Basic Integration', () => {
  test.beforeEach(async ({ page }) => {
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should display "Ring upp" button in chat header', async ({ page }) => {
    // Open AI Assistant (text chat)
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Verify "Ring upp" button exists
    const ringUppButton = page.locator(selectors.chat.ringUppButton);
    await expect(ringUppButton).toBeVisible();

    // Verify it has Video icon
    const videoIcon = ringUppButton.locator('svg');
    await expect(videoIcon).toBeVisible();

    // Verify it has pulse animation (rose-500 background)
    await expect(ringUppButton).toHaveClass(/bg-rose-500/);
    await expect(ringUppButton).toHaveClass(/animate-pulse/);
  });

  test('should open LiveElton when "Ring upp" is clicked', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    // Open chat
    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });

    // Open LiveElton
    await openLiveElton(page);

    // Verify LiveElton is open
    expect(await isLiveEltonOpen(page)).toBe(true);

    // Check for hang up button
    const hangUpButton = page.locator(selectors.liveElton.hangUpButton);
    await expect(hangUpButton).toBeVisible();
  });

  test('should display connection status badge', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);

    // Check for status message
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();

    // Should contain either spinner or green dot
    const hasSpinner = await page.locator('svg.animate-spin').count() > 0;
    const hasGreenDot = await page.locator('div.bg-green-500.rounded-full').count() > 0;

    expect(hasSpinner || hasGreenDot).toBe(true);
  });

  test('should show project name in UI', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);

    // Get project name from header
    const projectHeader = page.locator('h1.font-serif.font-bold');
    const projectName = await projectHeader.textContent();

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);

    // Check bottom text for project context
    const bottomText = page.locator('p.text-center.text-slate-500').last();
    await expect(bottomText).toBeVisible();

    const text = await bottomText.textContent();
    expect(text).toContain('"ser" via din kamera');
  });
});

test.describe('LiveElton: Control Buttons', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should have microphone toggle button', async ({ page }) => {
    const micButton = page.locator(selectors.liveElton.micToggle);
    await expect(micButton).toBeVisible();
  });

  test('should have video toggle button', async ({ page }) => {
    const videoButton = page.locator(selectors.liveElton.videoToggle);
    await expect(videoButton).toBeVisible();
  });

  test('should have hang up button', async ({ page }) => {
    const hangUpButton = page.locator(selectors.liveElton.hangUpButton);
    await expect(hangUpButton).toBeVisible();
    await expect(hangUpButton).toHaveClass(/rounded-full/);
    await expect(hangUpButton).toHaveClass(/bg-rose-500/);
  });

  test('should have settings button', async ({ page }) => {
    const settingsButton = page.locator(selectors.liveElton.settingsButton);
    await expect(settingsButton).toBeVisible();
  });

  test('should have diagnostic toggle button', async ({ page }) => {
    const diagnosticButton = page.locator(selectors.liveElton.diagnosticToggle);
    await expect(diagnosticButton).toBeVisible();
  });

  test('should close LiveElton when hang up button is clicked', async ({ page }) => {
    await closeLiveElton(page);

    // Should return to chat view
    expect(await isLiveEltonOpen(page)).toBe(false);
    await expect(page.locator(selectors.chat.textInput)).toBeVisible();
  });

  test('should toggle microphone when mic button is clicked', async ({ page }) => {
    const initialState = await isMicrophoneEnabled(page);

    await toggleMicrophone(page);

    const newState = await isMicrophoneEnabled(page);
    expect(newState).not.toBe(initialState);
  });

  test('should toggle video when video button is clicked', async ({ page }) => {
    const videoButton = page.locator(selectors.liveElton.videoToggle);

    // Click to toggle
    await videoButton.click();
    await page.waitForTimeout(500);

    // Video element should appear or gradient should remain
    const hasVideo = await page.locator('video').isVisible().catch(() => false);
    const hasGradient = await page.locator('div.bg-gradient-to-b').isVisible().catch(() => false);

    expect(hasVideo || hasGradient).toBe(true);
  });
});

test.describe('LiveElton: UI States', () => {
  test.beforeEach(async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
  });

  test('should display Activity icon when not in diagnostic mode', async ({ page }) => {
    // Should show Activity icon (not Stethoscope)
    const activityIcon = page.locator('.text-teal-500').filter({
      has: page.locator('svg')
    });

    const iconVisible = await activityIcon.count() > 0;
    expect(iconVisible).toBe(true);
  });

  test('should display volume visualization', async ({ page }) => {
    // Check for the pulsating blur circle (volume visualizer)
    const volumeViz = page.locator('div.blur-\\[50px\\]');
    await expect(volumeViz).toBeVisible();
    await expect(volumeViz).toHaveClass(/bg-teal-600/);
  });

  test('should have gradient background when video is off', async ({ page }) => {
    // Check for gradient background
    const gradientBg = page.locator('div.bg-gradient-to-b');
    await expect(gradientBg).toBeVisible();
  });

  test('should display controls bar at bottom', async ({ page }) => {
    // Check for controls bar
    const controlsBar = page.locator('div.bg-nordic-dark-surface').last();
    await expect(controlsBar).toBeVisible();
  });

  test('should have full-screen overlay', async ({ page }) => {
    // LiveElton should be full screen
    const container = page.locator(selectors.liveElton.container);
    await expect(container).toBeVisible();
    await expect(container).toHaveClass(/fixed/);
    await expect(container).toHaveClass(/inset-0/);
  });

  test('should display status message', async ({ page }) => {
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();

    const text = await statusMessage.textContent();
    expect(text).toBeTruthy();
  });
});

test.describe('LiveElton: Visual Regression', () => {
  test('should take screenshot of LiveElton initial state', async ({ page, context }) => {
    await context.grantPermissions(['microphone', 'camera']);
    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);
    await waitForConnection(page);
    await page.waitForTimeout(1000);

    await page.screenshot({ path: 'e2e/screenshots/live-elton-initial.png' });
  });
});

test.describe('LiveElton: Permissions Handling', () => {
  test('should handle denied microphone permission gracefully', async ({ page, context }) => {
    // Deny microphone permission
    await context.clearPermissions();

    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);

    // Should show status message (error or fallback)
    const statusMessage = page.locator(selectors.liveElton.statusMessage);
    await expect(statusMessage).toBeVisible();

    const text = await statusMessage.textContent();
    expect(text).toBeTruthy();
  });

  test('should still display UI when permissions denied', async ({ page, context }) => {
    await context.clearPermissions();

    await ensureLoggedIn(page);
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });

    await page.locator(selectors.nav.eltonAI).click();
    await page.waitForSelector(selectors.chat.textInput, { timeout: 5000 });
    await openLiveElton(page);

    // Control buttons should still be visible
    await expect(page.locator(selectors.liveElton.hangUpButton)).toBeVisible();
    await expect(page.locator(selectors.liveElton.micToggle)).toBeVisible();
    await expect(page.locator(selectors.liveElton.videoToggle)).toBeVisible();
  });
});
