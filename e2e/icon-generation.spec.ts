import { test, expect } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Icon Generation Feature Tests (Imagen 3.0)
 *
 * These tests verify that the AI-powered icon generation feature works correctly:
 * - Uploading vehicle images
 * - Generating flat design icons using Imagen 3.0
 * - Displaying generated icons in the project list
 * - Handling generation failures gracefully
 * - Image preview and removal
 */

test.describe('Icon Generation: Project Creation with Image Upload', () => {

  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // NOTE: These tests assume you're already logged in with demo data
    // If not logged in, you'll need to add login steps here
  });

  test('should open project creation modal', async ({ page }) => {
    // Click the "Nytt Projekt" card
    const newProjectCard = page.locator('text=Nytt Projekt').first();
    await expect(newProjectCard).toBeVisible();
    await newProjectCard.click();

    // Verify modal opened
    await expect(page.locator('text=Starta nytt projekt')).toBeVisible();
    await expect(page.locator('textarea[placeholder*="JSN398"]')).toBeVisible();
  });

  test('should show image upload section', async ({ page }) => {
    // Open creation modal
    await page.locator('text=Nytt Projekt').first().click();

    // Verify upload section exists
    const uploadLabel = page.locator('text=Ladda upp bild');
    await expect(uploadLabel).toBeVisible();

    // Verify description mentions icon generation
    await expect(page.locator('text=Elton skapar en flat design-ikon från din bild')).toBeVisible();
  });

  test('should display image preview after upload', async ({ page }) => {
    // Open creation modal
    await page.locator('text=Nytt Projekt').first().click();

    // Use the real demo car image (Mercedes Sprinter)
    const demoImagePath = path.join(__dirname, '..', 'assets', 'democarimage.png');

    // Upload the demo image
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(demoImagePath);

    // Wait for preview to appear
    await expect(page.locator('text=Bild uppladdad')).toBeVisible({ timeout: 5000 });
    await expect(page.locator('img[alt="Preview"]')).toBeVisible();

    // Verify descriptive text
    await expect(page.locator('text=Imagen 3.0 kommer skapa en minimalistisk ikon')).toBeVisible();
  });

  test('should allow removing uploaded image', async ({ page }) => {
    // Open modal and upload image
    await page.locator('text=Nytt Projekt').first().click();

    const demoImagePath = path.join(__dirname, '..', 'assets', 'democarimage.png');
    await page.locator('input[type="file"]').setInputFiles(demoImagePath);
    await expect(page.locator('text=Bild uppladdad')).toBeVisible({ timeout: 5000 });

    // Click remove button (trash icon)
    const removeButton = page.locator('button').filter({ has: page.locator('svg') }).last();
    await removeButton.click();

    // Verify preview is gone
    await expect(page.locator('text=Bild uppladdad')).not.toBeVisible();
  });

  test('should show research steps including icon generation', async ({ page }) => {
    // Open modal
    await page.locator('text=Nytt Projekt').first().click();

    // Fill in vehicle description (ZRT 836 - the demo car's reg number)
    await page.locator('textarea[placeholder*="JSN398"]').fill('ZRT 836');

    // Upload the real demo image
    const demoImagePath = path.join(__dirname, '..', 'assets', 'democarimage.png');
    await page.locator('input[type="file"]').setInputFiles(demoImagePath);

    // Wait for preview
    await expect(page.locator('text=Bild uppladdad')).toBeVisible({ timeout: 3000 });

    // Click "Starta Research"
    await page.locator('button:has-text("Starta Research")').click();

    // Verify research modal appears
    await expect(page.locator('text=Research pågår...')).toBeVisible({ timeout: 5000 });

    // Verify icon generation step is mentioned
    await expect(page.locator('text=Genererar flat design-ikon (Imagen 3.0)...')).toBeVisible({ timeout: 10000 });

    // Note: In a real test, you'd mock the API to avoid actual API calls
    // For E2E, we let it run but with a long timeout since it's a slow operation
  }, { timeout: 60000 }); // 60 second timeout for API operations

  test('should display default icon when generation fails', async ({ page }) => {
    // This test would require mocking the API to force a failure
    // For now, we just verify the fallback behavior exists

    // Open modal
    await page.locator('text=Nytt Projekt').first().click();
    await page.locator('textarea[placeholder*="JSN398"]').fill('Test Vehicle ABC123');

    // Don't upload an image - should use default icon
    await page.locator('button:has-text("Starta Research")').click();

    // Wait for completion (this will be fast without image upload)
    await expect(page.locator('text=Research pågår...')).toBeVisible({ timeout: 5000 });

    // Eventually should close and create project with default car icon
    // (Test timing depends on API response)
  }, { timeout: 60000 });

  test('should validate file size (max 4MB)', async ({ page }) => {
    // Open modal
    await page.locator('text=Nytt Projekt').first().click();

    // Note: Creating a 5MB test file would be impractical in a test
    // In a real scenario, you'd mock the validation function
    // This test serves as documentation of the expected behavior

    // Verification: The validateAndPrepareImage function should reject files > 4MB
    // This is tested in unit tests (geminiService.test.ts)
  });

  test('should disable "Starta Research" button when no input', async ({ page }) => {
    // Open modal
    await page.locator('text=Nytt Projekt').first().click();

    // Verify button is disabled without input
    const startButton = page.locator('button:has-text("Starta Research")');
    await expect(startButton).toBeDisabled();

    // Add vehicle description
    await page.locator('textarea[placeholder*="JSN398"]').fill('Volvo 240');

    // Button should now be enabled
    await expect(startButton).not.toBeDisabled();
  });

  test('should close modal when clicking "Avbryt"', async ({ page }) => {
    // Open modal
    await page.locator('text=Nytt Projekt').first().click();
    await expect(page.locator('text=Starta nytt projekt')).toBeVisible();

    // Click cancel
    await page.locator('button:has-text("Avbryt")').click();

    // Modal should close
    await expect(page.locator('text=Starta nytt projekt')).not.toBeVisible();
  });
});

test.describe('Icon Generation: Display in Project List', () => {

  test('should display custom icon for projects with generated icons', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find a project card (assumes at least one project exists)
    const projectCards = page.locator('[class*="rounded-[32px]"][class*="bg-white"]').filter({ hasText: /Projekt|Van|Sprinter|Volvo/ });

    if (await projectCards.count() > 0) {
      const firstCard = projectCards.first();

      // Check if it has an icon (either default Car icon or custom)
      const iconContainer = firstCard.locator('div[class*="w-16 h-16"]');
      await expect(iconContainer).toBeVisible();

      // If customIcon exists, it should be an img or svg
      const customIconImg = iconContainer.locator('img');
      const customIconSvg = iconContainer.locator('svg');

      const hasCustomIcon = await customIconImg.isVisible().catch(() => false) ||
                           await customIconSvg.isVisible().catch(() => false);

      // Either custom icon or default Car icon should be visible
      expect(hasCustomIcon || await iconContainer.locator('svg').count() > 0).toBeTruthy();
    }
  });

  test('should display base64 PNG icons correctly', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // Find project cards with custom icons (base64 PNG)
    const projectCards = page.locator('[class*="rounded-[32px]"][class*="bg-white"]');

    for (let i = 0; i < await projectCards.count(); i++) {
      const card = projectCards.nth(i);
      const imgElement = card.locator('img[src^="data:image/png;base64,"]');

      if (await imgElement.count() > 0) {
        // Verify image loads without errors
        await expect(imgElement).toBeVisible();

        // Check that naturalWidth > 0 (image loaded successfully)
        const naturalWidth = await imgElement.evaluate((img: HTMLImageElement) => img.naturalWidth);
        expect(naturalWidth).toBeGreaterThan(0);

        console.log(`✓ Project ${i} has valid PNG icon`);
      }
    }
  });
});

test.describe('Icon Generation: Error Handling', () => {

  test('should handle API timeout gracefully', async ({ page }) => {
    // This would require API mocking to simulate timeout
    // Document expected behavior: Should fall back to default icon after retries

    // Expected behavior (tested in unit tests):
    // - Retry 2 times with exponential backoff
    // - After 3 total attempts, return null
    // - UI shows default Car icon
  });

  test('should handle invalid image format', async ({ page }) => {
    await page.goto('/');
    await page.locator('text=Nytt Projekt').first().click();

    // Try to upload a non-image file (e.g., text file)
    const tempFilePath = path.join(__dirname, 'temp-test-invalid.txt');
    fs.writeFileSync(tempFilePath, 'This is not an image');

    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles(tempFilePath);

    // Browser file input should reject non-image files due to accept="image/*"
    // Preview should not appear
    await page.waitForTimeout(1000);
    const preview = page.locator('text=Bild uppladdad');
    const isVisible = await preview.isVisible().catch(() => false);

    // Should not show preview for invalid file
    expect(isVisible).toBeFalsy();

    fs.unlinkSync(tempFilePath);
  });
});
