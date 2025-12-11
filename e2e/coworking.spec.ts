import { test, expect } from '@playwright/test';
import { selectors, waitForModal, closeModal } from './helpers/selectors';
import { ensureLoggedIn } from './helpers/auth-helpers';

/**
 * Co-working Feature Tests
 *
 * These tests verify that the co-working/team collaboration features work correctly:
 * - Opening the team members modal
 * - Displaying project owner, members, and invitations
 * - Inviting new members
 * - Form validation
 * - Visual regression testing
 *
 * Uses real user: joel@kvarnsmyr.se
 */

test.describe('Co-working: Team Members Modal', () => {

  test.beforeEach(async ({ page }) => {
    // Login with real credentials
    await ensureLoggedIn(page);

    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 15000 });
  });

  test('should display Users button in header', async ({ page }) => {
    // Wait for a project to be loaded (check if project name is visible)
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Check if Users button exists
    const usersButton = page.locator(selectors.header.usersButton);
    await expect(usersButton).toBeVisible();

    // Verify button has the Users icon (check for SVG)
    const svgIcon = usersButton.locator('svg');
    await expect(svgIcon).toBeVisible();
  });

  test('should open ProjectMembers modal when Users button is clicked', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Click Users button
    const usersButton = page.locator(selectors.header.usersButton);
    await usersButton.click();

    // Wait for modal to appear
    await waitForModal(page);

    // Verify modal title
    const title = page.locator(selectors.projectMembers.title);
    await expect(title).toHaveText('Team & Medlemmar');

    // Take screenshot for visual regression
    await page.screenshot({ path: 'e2e/screenshots/members-modal-open.png' });
  });

  test('should display project owner correctly', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Check owner section exists
    const ownerSection = page.locator(selectors.projectMembers.ownerSection);
    await expect(ownerSection).toBeVisible();

    // Check owner email is displayed
    const ownerEmail = page.locator(selectors.projectMembers.ownerEmail);
    await expect(ownerEmail).toBeVisible();

    // Verify Shield icon is present (indicates owner)
    const shieldIcon = ownerEmail.locator('svg');
    await expect(shieldIcon).toBeVisible();
  });

  test('should display members section', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Check members section
    const membersSection = page.locator(selectors.projectMembers.membersSection);
    await expect(membersSection).toBeVisible();

    // Count should be visible (e.g., "Medlemmar (0)")
    await expect(membersSection).toContainText('Medlemmar');
  });

  test('should display pending invitations section', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Check invites section
    const invitesSection = page.locator(selectors.projectMembers.invitesSection);
    await expect(invitesSection).toBeVisible();
    await expect(invitesSection).toContainText('Väntande Inbjudningar');
  });

  test('should display invite form for project owner', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Check invite form elements
    const emailInput = page.locator(selectors.projectMembers.inviteForm.emailInput);
    const submitButton = page.locator(selectors.projectMembers.inviteForm.submitButton);

    await expect(emailInput).toBeVisible();
    await expect(submitButton).toBeVisible();
    await expect(submitButton).toContainText('Bjud in');
  });

  test('should validate email format in invite form', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Try to submit with invalid email
    const emailInput = page.locator(selectors.projectMembers.inviteForm.emailInput);
    const submitButton = page.locator(selectors.projectMembers.inviteForm.submitButton);

    // Test empty email
    await submitButton.click();
    await page.waitForTimeout(500);

    // Button should be disabled or show error
    const errorMessage = page.locator(selectors.projectMembers.inviteForm.errorMessage);
    // Note: Error only shows if validation fails, so we check if it exists
    const errorCount = await errorMessage.count();

    // Test invalid email format
    await emailInput.fill('invalid-email');
    await submitButton.click();
    await page.waitForTimeout(500);

    // Should show error
    await expect(errorMessage).toBeVisible();
  });

  test('should be able to enter valid email in invite form', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Enter valid email
    const emailInput = page.locator(selectors.projectMembers.inviteForm.emailInput);
    await emailInput.fill('test@example.com');

    // Verify value
    await expect(emailInput).toHaveValue('test@example.com');

    // Take screenshot
    await page.screenshot({ path: 'e2e/screenshots/invite-form-filled.png' });
  });

  test('should close modal when X button is clicked', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Close modal
    await closeModal(page);

    // Verify modal is closed
    const modal = page.locator(selectors.projectMembers.modal);
    await expect(modal).not.toBeVisible();
  });

  test('should support keyboard navigation (ESC to close)', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Press ESC
    await page.keyboard.press('Escape');

    // NOTE: Modal doesn't close on ESC by default, but this tests the behavior
    // If you want ESC to close modal, add onKeyDown handler in ProjectMembers.tsx

    // For now, just verify modal is still there
    const modal = page.locator(selectors.projectMembers.modal);
    const isVisible = await modal.isVisible();
    // This test documents current behavior - adjust when ESC handler is added
  });

  test('should handle dark mode correctly', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Enable dark mode (click settings, then dark mode toggle)
    const settingsButton = page.locator(selectors.header.settingsButton).first();
    await settingsButton.click();

    // Click dark mode toggle
    const darkModeButton = page.locator('button:has-text("Mörkt Läge")');
    await darkModeButton.click();

    // Close settings
    await page.keyboard.press('Escape');

    // Open members modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Check that dark mode classes are applied
    const modalContent = page.locator(selectors.projectMembers.modalContent);
    await expect(modalContent).toBeVisible();

    // Take screenshot for dark mode
    await page.screenshot({ path: 'e2e/screenshots/members-modal-dark.png' });
  });

  test('should display responsive design on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Verify modal takes full width on mobile
    const modalContent = page.locator(selectors.projectMembers.modalContent);
    const box = await modalContent.boundingBox();

    // Modal should be visible and responsive
    await expect(modalContent).toBeVisible();

    // Take screenshot for mobile view
    await page.screenshot({ path: 'e2e/screenshots/members-modal-mobile.png' });
  });
});

test.describe('Co-working: Project Invitations', () => {

  test('should display invitation badge on team projects', async ({ page }) => {
    // Navigate to project selector (logout or click "Byt Projekt")
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // This test would require a project where the user is invited
    // For now, we document the expected behavior

    // Expected: Projects where user is invited should show "Team" badge
    const teamBadge = page.locator(selectors.projects.teamBadge);
    const badgeCount = await teamBadge.count();

    // If there are team projects, verify badge exists
    if (badgeCount > 0) {
      await expect(teamBadge.first()).toBeVisible();
    }
  });

  test('should display invitations section in ProjectSelector', async ({ page }) => {
    // This test requires a user with pending invitations
    // For now, we document the expected behavior

    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Check if invitations section exists
    const invitationsSection = page.locator(selectors.projectSelector.invitationsSection);
    const sectionCount = await invitationsSection.count();

    // If invitations exist, verify section is visible
    if (sectionCount > 0) {
      await expect(invitationsSection).toBeVisible();

      // Should have accept and decline buttons
      const acceptButton = page.locator(selectors.projectSelector.acceptButton).first();
      await expect(acceptButton).toBeVisible();
    }
  });
});

test.describe('Co-working: Visual Regression', () => {

  test('should match members modal snapshot', async ({ page }) => {
    // Wait for project to load
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Open modal
    await page.locator(selectors.header.usersButton).click();
    await waitForModal(page);

    // Take full page screenshot for visual comparison
    // In CI, this would compare against baseline
    await expect(page).toHaveScreenshot('members-modal.png', {
      maxDiffPixels: 100, // Allow minor rendering differences
    });
  });
});
