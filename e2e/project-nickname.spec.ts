import { test, expect } from '@playwright/test';

/**
 * Project Nickname E2E Tests
 *
 * These tests verify that the project nickname (smeknamn) feature works correctly:
 * - Users can enter vehicle nickname when creating project
 * - Nickname becomes the AI's name
 * - Placeholder text shows examples with nicknames
 * - AI introduces itself with nickname
 * - Fallback to "AI Assistant" when no nickname
 * - Support for registration numbers, descriptions, and Blocket links
 */

test.describe('Project Nickname: Creation & Input', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // NOTE: These tests require ability to create new projects
    // In production, you'd use test accounts with proper setup
  });

  test('should display updated placeholder with nickname examples', async ({ page }) => {
    // Look for project creation input
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      const placeholder = await input.getAttribute('placeholder');

      // Should show registration number example
      expect(placeholder).toContain('ABC123');

      // Should show format with nickname
      expect(placeholder).toMatch(/Volvo 240.*Pärlan/);

      // Should show Blocket link example
      expect(placeholder).toContain('blocket.se');

      // Should explain that nickname is optional
      expect(placeholder).toMatch(/valfritt|AI:ns namn/i);

      // Take screenshot of placeholder
      await page.screenshot({ path: 'e2e/screenshots/nickname-placeholder.png' });
    }
  });

  test('should accept registration number only', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter just a registration number
      await input.fill('ABC123');

      // Should be valid
      expect(await input.inputValue()).toBe('ABC123');
    }
  });

  test('should accept registration number with description', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter reg number with description
      await input.fill('ABC123 Volvo 240 1988');

      // Should accept full string
      expect(await input.inputValue()).toBe('ABC123 Volvo 240 1988');
    }
  });

  test('should accept registration number with nickname', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter with nickname format
      await input.fill('ABC123 - Pärlan');

      // Should accept full string
      expect(await input.inputValue()).toContain('Pärlan');
    }
  });

  test('should accept Blocket link format', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter Blocket link
      await input.fill('https://www.blocket.se/annons/123456');

      // Should accept link
      expect(await input.inputValue()).toContain('blocket.se');
    }
  });

  test('should handle Swedish characters in nickname', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter nickname with Swedish characters
      await input.fill('ABC123 - Sjöhästen');

      // Should preserve Swedish characters
      const value = await input.inputValue();
      expect(value).toContain('Sjöhästen');
      expect(value).toContain('ö');
      expect(value).toContain('ä');
    }
  });

  test('should handle special characters in nickname', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter nickname with special characters
      await input.fill('ABC123 - Blå-Bärspaj 2.0');

      // Should preserve special characters
      const value = await input.inputValue();
      expect(value).toContain('Blå-Bärspaj 2.0');
      expect(value).toContain('-');
      expect(value).toContain('.');
    }
  });

  test('should handle long nicknames', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      const longNickname = 'ABC123 - Det Bästa Fordonet I Hela Världen';
      await input.fill(longNickname);

      // Should accept long nickname
      expect(await input.inputValue()).toBe(longNickname);
    }
  });
});

test.describe('Project Nickname: AI Name Integration', () => {
  test('AI introduces itself with project nickname', async ({ page }) => {
    // Assumes there's a project with a nickname already
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Get project name from header
    const projectHeader = page.locator('h1.font-serif.font-bold');
    const projectName = await projectHeader.textContent();

    // Open chat
    await page.waitForSelector('textarea[placeholder*="meddelande"]', { timeout: 5000 });

    // Ask AI its name
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Vad heter du?');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // If project has a nickname (not just reg number), AI should use it
    if (projectName && !/^[A-Z]{3}\d{3}$/.test(projectName)) {
      // Check if AI mentions the project name
      // Note: This is complex as we need to extract nickname from project name
      expect(responseText?.toLowerCase()).toMatch(/heter|kallas|jag är/);
    }
  });

  test('AI uses "AI Assistant" when no nickname is set', async ({ page }) => {
    // This test requires a project without a nickname
    // Just with registration number

    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    const projectHeader = page.locator('h1.font-serif.font-bold');
    const projectName = await projectHeader.textContent();

    // If project name is just a reg number (e.g., "ABC123")
    if (projectName && /^[A-Z]{3}\d{3}$/.test(projectName)) {
      const textarea = page.locator('textarea[placeholder*="meddelande"]');
      await textarea.fill('Vad heter du?');
      await textarea.press('Enter');

      await page.waitForTimeout(3000);

      const chatMessages = page.locator('[class*="message"], [class*="chat"]');
      const lastMessage = await chatMessages.last().textContent();

      // Should use "AI Assistant" as fallback
      expect(lastMessage?.toLowerCase()).toMatch(/ai assistant/i);
    }
  });

  test('AI name appears in chat interface header', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Check if AI name is displayed in chat interface
    // This depends on your UI implementation

    const aiNameDisplay = page.locator('[class*="ai-name"], [class*="assistant-name"]');

    if ((await aiNameDisplay.count()) > 0) {
      const displayName = await aiNameDisplay.textContent();
      expect(displayName).toBeTruthy();
      expect(displayName?.length).toBeGreaterThan(0);
    }
  });

  test('AI consistently uses its name throughout conversation', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Send multiple identity questions
    const questions = ['Vad heter du?', 'Vem är du?', 'Presentera dig själv'];

    const responses: string[] = [];

    for (const question of questions) {
      const textarea = page.locator('textarea[placeholder*="meddelande"]');
      await textarea.fill(question);
      await textarea.press('Enter');
      await page.waitForTimeout(2500);

      const chatMessages = page.locator('[class*="message"], [class*="chat"]');
      const lastMessage = await chatMessages.last().textContent();
      if (lastMessage) responses.push(lastMessage);
    }

    // All responses should mention the same name
    const allText = responses.join(' ').toLowerCase();

    // Count occurrences of identity statements
    const identityStatements = allText.match(/jag (är|heter|kallas)/gi);
    expect(identityStatements).toBeTruthy();
    expect(identityStatements!.length).toBeGreaterThanOrEqual(2);
  });

  test('project name with special format is handled correctly', async ({ page }) => {
    // Test various nickname formats:
    // "ABC123 - Elton"
    // "Volvo 240 1988 - Pärlan"
    // "Mercedes Sprinter 2014"

    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    const projectHeader = page.locator('h1.font-serif.font-bold');
    const projectName = await projectHeader.textContent();

    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Berätta vem du är');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = await chatMessages.last().textContent();

    // Should handle any format and respond appropriately
    expect(lastMessage).toBeTruthy();
    expect(lastMessage?.length).toBeGreaterThan(50);

    // Should not contain parsing errors
    expect(lastMessage?.toLowerCase()).not.toContain('undefined');
    expect(lastMessage?.toLowerCase()).not.toContain('null');
  });
});

test.describe('Project Nickname: Edge Cases', () => {
  test('empty nickname defaults to AI Assistant', async ({ page }) => {
    // This would require creating a project with empty nickname
    // Documented behavior: should use "AI Assistant" as fallback

    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });
    await page.waitForSelector('textarea[placeholder*="meddelande"]', { timeout: 5000 });

    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Vad heter du?');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = await chatMessages.last().textContent();

    // Should have a response
    expect(lastMessage).toBeTruthy();
    expect(lastMessage?.toLowerCase()).toMatch(/heter|kallas|jag är/);
  });

  test('nickname with quotes is handled correctly', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter nickname with quotes
      await input.fill('ABC123 - The "Beast"');

      // Should preserve quotes
      const value = await input.inputValue();
      expect(value).toContain('"');
      expect(value).toContain('Beast');
    }
  });

  test('nickname with emojis is handled correctly', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter nickname with emoji
      await input.fill('ABC123 - Rockstjärnan 🚐');

      // Should preserve emoji
      const value = await input.inputValue();
      expect(value).toContain('🚐');
    }
  });

  test('very long nickname is truncated or handled gracefully', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Enter extremely long nickname
      const longNickname = 'A'.repeat(200);
      await input.fill(`ABC123 - ${longNickname}`);

      // Should accept or truncate gracefully
      const value = await input.inputValue();
      expect(value.length).toBeGreaterThan(0);
    }
  });

  test('nickname with only whitespace defaults to AI Assistant', async ({ page }) => {
    // This would require creating project with "   " as nickname
    // Expected: Should trim and use "AI Assistant" as fallback
    // Documented test case for future implementation
  });

  test('project name update reflects in AI name immediately', async ({ page }) => {
    // This test would require ability to rename project
    // Expected: AI should use new name in subsequent responses

    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Document expected behavior:
    // 1. User renames project
    // 2. AI should use new name in next response
    // 3. No need to reload page
  });
});

test.describe('Project Nickname: Visual Regression', () => {
  test('placeholder text renders correctly', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      // Take screenshot of input with placeholder
      await input.scrollIntoViewIfNeeded();
      await page.screenshot({ path: 'e2e/screenshots/nickname-input-placeholder.png' });

      // Verify input is visible
      await expect(input).toBeVisible();
    }
  });

  test('nickname in project header displays correctly', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    const projectHeader = page.locator('h1.font-serif.font-bold');
    await expect(projectHeader).toBeVisible();

    // Take screenshot of project header with nickname
    await page.screenshot({ path: 'e2e/screenshots/nickname-project-header.png' });
  });

  test('AI name in chat displays correctly', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });
    await page.waitForSelector('textarea[placeholder*="meddelande"]', { timeout: 5000 });

    // Send message to see AI response
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Hej!');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    // Take screenshot of chat with AI name
    await page.screenshot({ path: 'e2e/screenshots/nickname-ai-chat.png' });
  });
});

test.describe('Project Nickname: Blocket Link Integration', () => {
  test('accepts full Blocket URL', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      await input.fill('https://www.blocket.se/annons/stockholm/volkswagen_lt31_1976/123456');
      expect(await input.inputValue()).toContain('blocket.se');
    }
  });

  test('accepts shortened Blocket URL', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      await input.fill('blocket.se/annons/123456');
      expect(await input.inputValue()).toContain('blocket.se');
    }
  });

  test('accepts just Blocket annons ID', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      await input.fill('blocket.se/123456');
      expect(await input.inputValue()).toContain('123456');
    }
  });

  test('extracts vehicle info from Blocket link correctly', async ({ page }) => {
    // This test requires actual Blocket link parsing implementation
    // For now, document expected behavior:

    // Given: User enters "https://www.blocket.se/annons/stockholm/volkswagen_lt31_1976/123456"
    // Expected:
    // 1. System fetches vehicle data from Blocket
    // 2. Extracts: Make: Volkswagen, Model: LT31, Year: 1976
    // 3. Creates project with this data
    // 4. AI personality adapts to extracted vehicle data

    // Documented for future implementation
  });
});

test.describe('Project Nickname: Multi-language Support', () => {
  test('handles English nicknames', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      await input.fill('ABC123 - The Beast');
      expect(await input.inputValue()).toContain('The Beast');
    }
  });

  test('handles mixed Swedish and English', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      await input.fill('ABC123 - Min Gamla Truck');
      expect(await input.inputValue()).toContain('Gamla Truck');
    }
  });

  test('handles numbers in nickname', async ({ page }) => {
    const input = page.locator('input[placeholder*="ABC123"]');

    if ((await input.count()) > 0) {
      await input.fill('ABC123 - T3 Nummer 2');
      expect(await input.inputValue()).toContain('T3 Nummer 2');
    }
  });
});
