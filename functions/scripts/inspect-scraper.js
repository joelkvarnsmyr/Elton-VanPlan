/**
 * PLAYWRIGHT SCRAPER INSPECTION SCRIPT
 *
 * Interaktivt verktyg för att inspektera HTML-struktur på car.info och biluppgifter.se
 * Använd detta för att identifiera CSS-selektorer innan implementation.
 *
 * USAGE:
 * node scripts/inspect-scraper.js JSN398
 * node scripts/inspect-scraper.js ABC123
 */

const { chromium } = require('playwright');

// Färgkoder för terminal
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m',
    red: '\x1b[31m',
    cyan: '\x1b[36m'
};

async function inspectCarInfo(regNo) {
    console.log(`\n${colors.bright}${colors.blue}🔍 INSPECTING: car.info${colors.reset}`);
    console.log(`${colors.cyan}URL: https://www.car.info/sv-se/license-plate/S/${regNo}${colors.reset}\n`);

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500 // Slow down for easier observation
    });

    const page = await browser.newPage();

    try {
        // Navigate to car.info
        await page.goto(`https://www.car.info/sv-se/license-plate/S/${regNo}`, {
            waitUntil: 'networkidle'
        });

        console.log(`${colors.green}✅ Page loaded successfully${colors.reset}\n`);

        // Look for "Visa alla X fordonsuppgifter" button and click it
        console.log(`${colors.cyan}🔘 Looking for "Visa alla fordonsuppgifter" button...${colors.reset}`);

        try {
            // Try different button selectors
            const buttonSelectors = [
                'button:has-text("Visa alla")',
                'a:has-text("Visa alla")',
                '.show-all-specs',
                'button:has-text("fordonsuppgifter")',
                '[data-toggle="collapse"]'
            ];

            let buttonFound = false;
            for (const selector of buttonSelectors) {
                const button = await page.$(selector).catch(() => null);
                if (button) {
                    const buttonText = await button.textContent();
                    console.log(`  ${colors.green}✅ Found button: "${buttonText.trim()}"${colors.reset}`);

                    // Click the button
                    await button.click();
                    console.log(`  ${colors.green}✅ Clicked! Waiting for content to expand...${colors.reset}`);

                    // Wait for content to load
                    await page.waitForTimeout(1000);
                    buttonFound = true;
                    break;
                }
            }

            if (!buttonFound) {
                console.log(`  ${colors.yellow}⚠️  No expand button found - content may already be visible${colors.reset}`);
            }
        } catch (error) {
            console.log(`  ${colors.yellow}⚠️  Could not click expand button: ${error.message}${colors.reset}`);
        }

        // Scroll down to trigger lazy loading
        console.log(`${colors.cyan}📜 Scrolling page to load all content...${colors.reset}`);
        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight / 2);
        });
        await page.waitForTimeout(500);

        await page.evaluate(() => {
            window.scrollTo(0, document.body.scrollHeight);
        });
        await page.waitForTimeout(1000);

        // Scroll back to top
        await page.evaluate(() => {
            window.scrollTo(0, 0);
        });
        await page.waitForTimeout(500);

        // Extract basic structure
        console.log(`${colors.bright}📋 PAGE STRUCTURE:${colors.reset}`);

        // Get main heading
        const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'Not found');
        console.log(`  H1: ${colors.yellow}${h1}${colors.reset}`);

        // Count tables
        const tableCount = await page.$$eval('table', tables => tables.length);
        console.log(`  Tables found: ${colors.yellow}${tableCount}${colors.reset}`);

        // Count dt/dd pairs (definition lists)
        const dtCount = await page.$$eval('dt', items => items.length);
        console.log(`  <dt> elements: ${colors.yellow}${dtCount}${colors.reset}`);

        // Get all CSS classes used
        const classes = await page.evaluate(() => {
            const allElements = document.querySelectorAll('*');
            const classSet = new Set();
            allElements.forEach(el => {
                if (el.className && typeof el.className === 'string') {
                    el.className.split(' ').forEach(cls => {
                        if (cls) classSet.add(cls);
                    });
                }
            });
            return Array.from(classSet).sort();
        });

        console.log(`\n${colors.bright}🎨 CSS CLASSES (top 20):${colors.reset}`);
        classes.slice(0, 20).forEach(cls => {
            console.log(`  - ${colors.cyan}${cls}${colors.reset}`);
        });

        // Try to find data fields
        console.log(`\n${colors.bright}🔎 LOOKING FOR DATA FIELDS:${colors.reset}`);

        // Look for "Märke" (Make)
        const makeSelectors = ['dt:has-text("Märke")', 'dt:has-text("Make")', '.vehicle-make'];
        for (const selector of makeSelectors) {
            const found = await page.$(selector).catch(() => null);
            if (found) {
                const value = await page.$eval(`${selector} + dd`, el => el?.textContent?.trim()).catch(() => null);
                console.log(`  ✅ Make found: ${colors.green}${value || 'N/A'}${colors.reset} (selector: ${selector})`);
                break;
            }
        }

        // Extract all dt/dd pairs
        const dataFields = await page.evaluate(() => {
            const pairs = [];
            const dtElements = document.querySelectorAll('dt');
            dtElements.forEach(dt => {
                const dd = dt.nextElementSibling;
                if (dd && dd.tagName === 'DD') {
                    pairs.push({
                        label: dt.textContent.trim(),
                        value: dd.textContent.trim()
                    });
                }
            });
            return pairs;
        });

        if (dataFields.length > 0) {
            console.log(`\n${colors.bright}📊 ALL DATA FIELDS (dt/dd pairs):${colors.reset}`);
            dataFields.forEach(({ label, value }) => {
                console.log(`  ${colors.cyan}${label}${colors.reset}: ${colors.yellow}${value}${colors.reset}`);
            });
        }

        // Extract ALL spec data (tables, grids, divs, etc.)
        const allSpecs = await page.evaluate(() => {
            const specs = [];

            // Method 1: Tables
            const tables = document.querySelectorAll('table');
            tables.forEach((table, tableIndex) => {
                const rows = table.querySelectorAll('tr');
                rows.forEach(row => {
                    const cells = row.querySelectorAll('td, th');
                    if (cells.length >= 2) {
                        specs.push({
                            source: `table-${tableIndex}`,
                            label: cells[0].textContent.trim(),
                            value: cells[1].textContent.trim()
                        });
                    }
                });
            });

            // Method 2: Look for spec-like divs (label + value pattern)
            const allDivs = document.querySelectorAll('div');
            allDivs.forEach(div => {
                // Find divs that look like spec containers
                const text = div.textContent.trim();
                if (text.length > 0 && text.length < 200) {
                    // Look for common vehicle spec keywords
                    const keywords = ['Märke', 'Modell', 'År', 'Motor', 'Bränsle', 'Växellåda',
                                     'Färg', 'VIN', 'Besiktning', 'Vikt', 'Längd', 'Bredd'];

                    if (keywords.some(kw => text.includes(kw))) {
                        // Try to split into label:value
                        const children = Array.from(div.children);
                        if (children.length === 2) {
                            specs.push({
                                source: 'div-container',
                                label: children[0].textContent.trim(),
                                value: children[1].textContent.trim()
                            });
                        }
                    }
                }
            });

            // Method 3: Look for dl/dt/dd (if any got expanded)
            const dtElements = document.querySelectorAll('dt');
            dtElements.forEach(dt => {
                const dd = dt.nextElementSibling;
                if (dd && dd.tagName === 'DD') {
                    specs.push({
                        source: 'dl-list',
                        label: dt.textContent.trim(),
                        value: dd.textContent.trim()
                    });
                }
            });

            // Deduplicate based on label
            const unique = [];
            const seen = new Set();
            specs.forEach(spec => {
                const key = `${spec.label}:${spec.value}`;
                if (!seen.has(key) && spec.label && spec.value && spec.label !== spec.value) {
                    seen.add(key);
                    unique.push(spec);
                }
            });

            return unique;
        });

        if (allSpecs.length > 0) {
            console.log(`\n${colors.bright}📊 ALL VEHICLE SPECS (${allSpecs.length} fields found):${colors.reset}`);

            // Group by source
            const bySource = allSpecs.reduce((acc, spec) => {
                if (!acc[spec.source]) acc[spec.source] = [];
                acc[spec.source].push(spec);
                return acc;
            }, {});

            Object.entries(bySource).forEach(([source, specs]) => {
                console.log(`\n  ${colors.bright}${colors.blue}[${source}]${colors.reset}`);
                specs.forEach(({ label, value }) => {
                    console.log(`    ${colors.cyan}${label}${colors.reset}: ${colors.yellow}${value}${colors.reset}`);
                });
            });
        } else {
            console.log(`\n${colors.yellow}⚠️  No specs found - may need to adjust selectors${colors.reset}`);
        }

        // Take screenshot
        const screenshotPath = `./scripts/screenshots/car-info-${regNo}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`\n${colors.green}📸 Screenshot saved: ${screenshotPath}${colors.reset}`);

        console.log(`\n${colors.bright}${colors.yellow}⏸️  PAUSED - Inspect the page manually${colors.reset}`);
        console.log(`${colors.cyan}Press Ctrl+C when done inspecting${colors.reset}\n`);

        // Keep browser open for manual inspection
        await page.waitForTimeout(300000); // 5 minutes

    } catch (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        await page.screenshot({ path: `./scripts/screenshots/error-car-info-${regNo}.png` });
    } finally {
        await browser.close();
    }
}

async function inspectBiluppgifter(regNo) {
    console.log(`\n${colors.bright}${colors.blue}🔍 INSPECTING: biluppgifter.se${colors.reset}`);
    console.log(`${colors.cyan}URL: https://biluppgifter.se/fordon/${regNo}${colors.reset}\n`);

    const browser = await chromium.launch({
        headless: false,
        slowMo: 500
    });

    const page = await browser.newPage();

    try {
        const response = await page.goto(`https://biluppgifter.se/fordon/${regNo}`, {
            waitUntil: 'networkidle',
            timeout: 15000
        });

        console.log(`${colors.green}✅ Page loaded (status: ${response.status()})${colors.reset}\n`);

        // Check for CAPTCHA
        const pageContent = await page.content();
        if (pageContent.includes('captcha') || pageContent.includes('Verifiera')) {
            console.log(`${colors.red}⚠️  CAPTCHA DETECTED - This site requires verification${colors.reset}\n`);
        }

        // Check for 403
        if (response.status() === 403) {
            console.log(`${colors.red}⚠️  403 FORBIDDEN - Site is blocking automated access${colors.reset}\n`);
        }

        await page.waitForTimeout(2000);

        // Basic structure
        console.log(`${colors.bright}📋 PAGE STRUCTURE:${colors.reset}`);

        const h1 = await page.$eval('h1', el => el.textContent.trim()).catch(() => 'Not found');
        console.log(`  H1: ${colors.yellow}${h1}${colors.reset}`);

        const tableCount = await page.$$eval('table', tables => tables.length);
        console.log(`  Tables found: ${colors.yellow}${tableCount}${colors.reset}`);

        // Take screenshot
        const screenshotPath = `./scripts/screenshots/biluppgifter-${regNo}.png`;
        await page.screenshot({ path: screenshotPath, fullPage: true });
        console.log(`\n${colors.green}📸 Screenshot saved: ${screenshotPath}${colors.reset}`);

        console.log(`\n${colors.bright}${colors.yellow}⏸️  PAUSED - Inspect the page manually${colors.reset}`);
        console.log(`${colors.cyan}Press Ctrl+C when done inspecting${colors.reset}\n`);

        await page.waitForTimeout(300000);

    } catch (error) {
        console.error(`${colors.red}❌ Error: ${error.message}${colors.reset}`);
        await page.screenshot({ path: `./scripts/screenshots/error-biluppgifter-${regNo}.png` });
    } finally {
        await browser.close();
    }
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const regNo = process.argv[2];

    if (!regNo) {
        console.error(`${colors.red}❌ Usage: node scripts/inspect-scraper.js <REGNO>${colors.reset}`);
        console.log(`${colors.cyan}Example: node scripts/inspect-scraper.js JSN398${colors.reset}`);
        process.exit(1);
    }

    console.log(`${colors.bright}${colors.green}🚗 VEHICLE SCRAPER INSPECTOR${colors.reset}`);
    console.log(`${colors.cyan}Registration Number: ${regNo}${colors.reset}\n`);

    // Create screenshots directory
    const fs = require('fs');
    if (!fs.existsSync('./scripts/screenshots')) {
        fs.mkdirSync('./scripts/screenshots', { recursive: true });
    }

    try {
        // Inspect both sites sequentially
        await inspectCarInfo(regNo);

        console.log(`\n${colors.cyan}─────────────────────────────────────${colors.reset}\n`);

        const readline = require('readline').createInterface({
            input: process.stdin,
            output: process.stdout
        });

        readline.question(`${colors.yellow}Inspect biluppgifter.se too? (y/n): ${colors.reset}`, async (answer) => {
            if (answer.toLowerCase() === 'y') {
                await inspectBiluppgifter(regNo);
            }

            console.log(`\n${colors.green}✅ Inspection complete!${colors.reset}\n`);
            readline.close();
        });

    } catch (error) {
        console.error(`${colors.red}❌ Fatal error: ${error.message}${colors.reset}`);
        process.exit(1);
    }
}

main();
