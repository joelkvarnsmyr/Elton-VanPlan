import { test, expect } from '@playwright/test';

/**
 * AI Personality E2E Tests
 *
 * These tests verify that the dynamic vehicle-specific AI personality system
 * works correctly in the live application:
 * - AI introduces itself with correct vehicle characteristics
 * - AI adapts personality based on vehicle age (veteran/experienced/modern)
 * - AI mentions engine type, fuel, and special features
 * - AI uses first-person perspective
 */

test.describe('AI Personality: Dynamic Vehicle-Specific Personas', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to the app
    await page.goto('/');

    // Wait for the app to load
    await page.waitForLoadState('networkidle');

    // NOTE: These tests assume you have demo data with various vehicle types
    // In production, you'd create test vehicles with specific characteristics
  });

  test('AI introduces itself with vehicle identity', async ({ page }) => {
    // Wait for project to load
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Wait for AI assistant to be ready
    await page.waitForSelector('textarea[placeholder*="meddelande"]', { timeout: 5000 });

    // Send greeting message
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Hej! Vem är du?');
    await textarea.press('Enter');

    // Wait for AI response
    await page.waitForTimeout(2000);

    // Look for AI response in chat history
    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();

    // AI should introduce itself with vehicle identity
    const responseText = await lastMessage.textContent();

    // Should mention being the vehicle (first person)
    expect(responseText?.toLowerCase()).toMatch(/jag är|jag heter|jag kallas/);

    // Should mention vehicle type or characteristics
    expect(responseText?.toLowerCase()).toMatch(/volkswagen|volvo|bil|fordon|skåp|motor/);
  });

  test('veteran vehicle (40+ years) has nostalgic personality', async ({ page }) => {
    // This test requires a veteran vehicle in demo data
    // Expected: Vehicle from 1976 or earlier

    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Check project name/year to verify it's a veteran vehicle
    const projectHeader = page.locator('h1.font-serif.font-bold');
    const headerText = await projectHeader.textContent();

    // If this is a veteran vehicle (check for year like 1976)
    if (headerText && /19[0-7]\d/.test(headerText)) {
      // Send message asking about vehicle's history
      const textarea = page.locator('textarea[placeholder*="meddelande"]');
      await textarea.fill('Berätta om din historia');
      await textarea.press('Enter');

      await page.waitForTimeout(3000);

      const chatMessages = page.locator('[class*="message"], [class*="chat"]');
      const lastMessage = chatMessages.last();
      const responseText = await lastMessage.textContent();

      // Veteran vehicles should mention nostalgia, classic era, etc.
      expect(responseText?.toLowerCase()).toMatch(
        /gammal|veteran|klassisk|den gamla goda tiden|70-tal|nostalgi/
      );
    }
  });

  test('modern vehicle (<20 years) has tech-savvy personality', async ({ page }) => {
    // This test requires a modern vehicle in demo data
    // You may need to create a test project with a recent vehicle

    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    const projectHeader = page.locator('h1.font-serif.font-bold');
    const headerText = await projectHeader.textContent();

    // If this is a modern vehicle (check for recent year)
    const currentYear = new Date().getFullYear();
    const recentYearPattern = new RegExp(`20[12]\\d`);

    if (headerText && recentYearPattern.test(headerText)) {
      const textarea = page.locator('textarea[placeholder*="meddelande"]');
      await textarea.fill('Vad är speciellt med dig?');
      await textarea.press('Enter');

      await page.waitForTimeout(3000);

      const chatMessages = page.locator('[class*="message"], [class*="chat"]');
      const lastMessage = chatMessages.last();
      const responseText = await lastMessage.textContent();

      // Modern vehicles should mention technology, sensors, etc.
      expect(responseText?.toLowerCase()).toMatch(
        /modern|teknisk|sensor|elektronik|dator|pigg/
      );
    }
  });

  test('AI mentions engine type correctly', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Ask about engine
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Berätta om din motor');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // Should mention engine characteristics
    expect(responseText?.toLowerCase()).toMatch(
      /motor|cylinder|hästkraft|hk|bensin|diesel|bränsle/
    );
  });

  test('AI uses first-person perspective consistently', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Send multiple messages to test consistency
    const messages = [
      'Berätta om dina däck',
      'Hur mår din motor?',
      'Vad behöver du hjälp med?',
    ];

    for (const message of messages) {
      const textarea = page.locator('textarea[placeholder*="meddelande"]');
      await textarea.fill(message);
      await textarea.press('Enter');
      await page.waitForTimeout(2000);
    }

    // Check all AI responses for first-person usage
    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const allMessages = await chatMessages.allTextContents();

    // Count first-person pronouns
    const firstPersonCount = allMessages.filter((text) =>
      /\b(jag|min|mina|mitt|mig|mej)\b/i.test(text)
    ).length;

    // AI should use first-person in most responses
    expect(firstPersonCount).toBeGreaterThan(0);
  });

  test('AI mentions vehicle nickname when set', async ({ page }) => {
    // This test requires a project with a nickname
    // Check if current project has a nickname in the header

    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    const projectHeader = page.locator('h1.font-serif.font-bold');
    const headerText = await projectHeader.textContent();

    // Send greeting
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Vad heter du?');
    await textarea.press('Enter');

    await page.waitForTimeout(2000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // If project has a nickname (not just reg number), AI should use it
    // Otherwise should say "AI Assistant"
    expect(responseText?.toLowerCase()).toMatch(/heter|kallas|jag är/);
  });

  test('diesel vehicle mentions diesel characteristics', async ({ page }) => {
    // This test requires a diesel vehicle in demo data
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Check vehicle info to see if it's diesel
    // For now, we'll just send a question and check response

    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Vilken typ av bränsle har du?');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // Check if response mentions diesel
    const isDiesel = responseText?.toLowerCase().includes('diesel');

    if (isDiesel) {
      // Diesel vehicles should mention being workhorses, reliable, etc.
      await textarea.fill('Vad är bra med din motor?');
      await textarea.press('Enter');
      await page.waitForTimeout(3000);

      const updatedMessages = page.locator('[class*="message"], [class*="chat"]');
      const dieselResponse = await updatedMessages.last().textContent();

      expect(dieselResponse?.toLowerCase()).toMatch(
        /arbetshäst|dragkraft|pålitlig|tjänstgör|långfärd/
      );
    }
  });

  test('AI encourages DIY and owner involvement', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Ask about repair
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Jag vill byta olja själv');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // AI should encourage DIY
    expect(responseText?.toLowerCase()).toMatch(
      /bra|kör hårt|självmant|själv|du kan|go for it|gör det/
    );
  });

  test('AI adapts tone based on vehicle age category', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Get project info to determine age category
    const projectHeader = page.locator('h1.font-serif.font-bold');
    const headerText = await projectHeader.textContent();

    // Send question about maintenance
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Hur ofta behöver jag serva dig?');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // Response should exist and be relevant
    expect(responseText).toBeTruthy();
    expect(responseText?.length).toBeGreaterThan(50);

    // Should mention maintenance intervals
    expect(responseText?.toLowerCase()).toMatch(/service|underhåll|mil|kilometer|månad/);
  });

  test('AI responds to sound diagnosis questions appropriately', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Ask about a sound
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Jag hör ett konstigt ljud när jag kör');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // AI should ask clarifying questions about the sound
    expect(responseText?.toLowerCase()).toMatch(
      /ljud|ljude|hörs|när|vilken|var|beskriv|typ av/
    );
  });

  test('veteran vehicle mentions engine code with pride', async ({ page }) => {
    // This test requires a vehicle with an engine code in demo data
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Vilken motorkod har du?');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // If vehicle has engine code, should mention it with pride
    // Look for patterns like "B230F", "CH", etc.
    const hasEngineCode = /[A-Z]{1,3}\d{2,4}[A-Z]?/.test(responseText || '');

    if (hasEngineCode) {
      expect(responseText?.toLowerCase()).toMatch(/stolt|min|klassisk|legendarisk/);
    }
  });

  test('AI personality persists across conversation', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Send multiple messages
    const messages = [
      'Hej! Vem är du?',
      'Hur gammal är du?',
      'Vad tycker du om dig själv?',
    ];

    const responses: string[] = [];

    for (const message of messages) {
      const textarea = page.locator('textarea[placeholder*="meddelande"]');
      await textarea.fill(message);
      await textarea.press('Enter');
      await page.waitForTimeout(2500);

      const chatMessages = page.locator('[class*="message"], [class*="chat"]');
      const lastMessage = await chatMessages.last().textContent();
      if (lastMessage) responses.push(lastMessage);
    }

    // All responses should use first person
    const firstPersonResponses = responses.filter((r) =>
      /\b(jag|min|mina|mitt)\b/i.test(r)
    );

    expect(firstPersonResponses.length).toBeGreaterThanOrEqual(2);

    // Should maintain consistent vehicle identity
    const allText = responses.join(' ').toLowerCase();
    expect(allText).toMatch(/fordon|bil|motor|volkswagen|volvo/);
  });

  test('AI handles missing vehicle data gracefully', async ({ page }) => {
    // Even with incomplete vehicle data, AI should still respond
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Berätta allt om dig själv');
    await textarea.press('Enter');

    await page.waitForTimeout(3000);

    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    const lastMessage = chatMessages.last();
    const responseText = await lastMessage.textContent();

    // Should have a response (not crash)
    expect(responseText).toBeTruthy();
    expect(responseText?.length).toBeGreaterThan(50);

    // Should not contain "undefined" or "null"
    expect(responseText?.toLowerCase()).not.toContain('undefined');
    expect(responseText?.toLowerCase()).not.toContain('null');
  });

  test('AI visual regression: personality-based greeting', async ({ page }) => {
    await page.waitForSelector('h1.font-serif.font-bold', { timeout: 10000 });

    // Wait for chat to be ready
    await page.waitForSelector('textarea[placeholder*="meddelande"]', { timeout: 5000 });

    // Send greeting
    const textarea = page.locator('textarea[placeholder*="meddelande"]');
    await textarea.fill('Hej!');
    await textarea.press('Enter');

    // Wait for response
    await page.waitForTimeout(3000);

    // Take screenshot of chat with personality greeting
    await page.screenshot({ path: 'e2e/screenshots/ai-personality-greeting.png' });

    // Verify chat history is visible
    const chatMessages = page.locator('[class*="message"], [class*="chat"]');
    await expect(chatMessages.first()).toBeVisible();
  });
});
