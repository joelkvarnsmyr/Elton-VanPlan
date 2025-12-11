/**
 * TEST SCRIPT: biluppgifter.se Scraper
 *
 * Tests the scrapeBiluppgifter function locally.
 *
 * Usage:
 *   node scripts/test-biluppgifter.js JSN398 --mock
 */

import * as cheerio from 'cheerio';
import fs from 'fs';

// =============================================================================
// CONFIG
// =============================================================================

const CONFIG = {
    BILUPPGIFTER_BASE_URL: 'https://biluppgifter.se/fordon/',
    USER_AGENT: 'VanPlan/1.0 (Vehicle Project Manager; contact@vanplan.se)',
    FETCH_TIMEOUT_MS: 10000,
    USE_MOCK_HTML: process.argv.includes('--mock'),
    MOCK_HTML_PATH: './scripts/mock-html/biluppgifter-JSN398.html'
};

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function parseSwedishNumber(str) {
    if (!str) return 0;
    const cleaned = str.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}

function parseSwedishDate(str) {
    if (!str) return 'Okänt';
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    const months = {
        'jan': '01', 'feb': '02', 'mar': '03', 'apr': '04',
        'maj': '05', 'jun': '06', 'jul': '07', 'aug': '08',
        'sep': '09', 'okt': '10', 'nov': '11', 'dec': '12'
    };

    const match = str.match(/(\d{1,2})\s+(\w{3})\s+(\d{4})/i);
    if (match) {
        const [, day, monthStr, year] = match;
        const month = months[monthStr.toLowerCase()];
        if (month) {
            return `${year}-${month}-${day.padStart(2, '0')}`;
        }
    }

    return str;
}

// =============================================================================
// SCRAPER FUNCTION
// =============================================================================

async function scrapeBiluppgifter(regNo) {
    let html;

    if (CONFIG.USE_MOCK_HTML) {
        console.log(`📁 Using mock HTML from: ${CONFIG.MOCK_HTML_PATH}`);
        html = fs.readFileSync(CONFIG.MOCK_HTML_PATH, 'utf-8');
    } else {
        const url = `${CONFIG.BILUPPGIFTER_BASE_URL}${regNo.toLowerCase()}/`;
        console.log(`🌐 Fetching: ${url}`);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': CONFIG.USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8'
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.status === 403) {
                console.error(`❌ HTTP 403 - Blocked`);
                return null;
            }

            if (!response.ok) {
                console.error(`❌ HTTP ${response.status}`);
                return null;
            }

            html = await response.text();
        } catch (error) {
            clearTimeout(timeoutId);
            console.error('❌ Fetch error:', error.message);
            return null;
        }
    }

    const $ = cheerio.load(html);

    // Check for CAPTCHA
    if (html.includes('captcha') || html.includes('Verifiera')) {
        console.error('⚠️ CAPTCHA required');
        return null;
    }

    // Helper: Get spec value by label
    const getSpec = (label) => {
        let result = '';
        $('ul.list li').each((_, li) => {
            const $li = $(li);
            const labelEl = $li.find('.label');
            const valueEl = $li.find('.value');

            if (labelEl.text().trim() === label) {
                result = valueEl.clone().find('a').remove().end().text().trim();
                return false;
            }
        });
        return result;
    };

    // Note: H1 on biluppgifter.se contains page title, not vehicle info
    // We get make/model from specs instead

    const vehicleData = {
        regNo: regNo,
        make: '',
        model: '',
        year: 0,
        status: 'Okänt',
        bodyType: '',
        vin: '',
        color: '',
        engine: { fuel: '', power: '', volume: '' },
        gearbox: '',
        wheels: { drive: '', tiresFront: '', tiresRear: '', boltPattern: '' },
        dimensions: { length: 0, width: 0, height: '', wheelbase: 0 },
        weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
        inspection: { last: 'Okänt', next: 'Okänt', mileage: 'Okänt' },
        history: { owners: 0, lastOwnerChange: '' }
    };

    // Extract data - get make/model from specs (not H1)
    vehicleData.vin = getSpec('Chassinr / VIN');
    vehicleData.make = getSpec('Fabrikat');
    vehicleData.model = getSpec('Modell');

    const yearStr = getSpec('Fordonsår / Modellår');
    if (yearStr) {
        const yearMatch = yearStr.match(/(\d{4})/);
        if (yearMatch) vehicleData.year = parseInt(yearMatch[1]);
    }

    vehicleData.status = getSpec('Status');
    vehicleData.color = getSpec('Färg');
    vehicleData.bodyType = getSpec('Kaross');
    vehicleData.history.owners = parseSwedishNumber(getSpec('Antal ägare'));
    vehicleData.history.lastOwnerChange = parseSwedishDate(getSpec('Senaste ägarbyte'));

    vehicleData.inspection.last = parseSwedishDate(getSpec('Senast besiktigad'));
    vehicleData.inspection.next = parseSwedishDate(getSpec('Nästa besiktning senast'));
    vehicleData.inspection.mileage = getSpec('Mätarställning (besiktning)');

    vehicleData.engine.power = getSpec('Motoreffekt');
    vehicleData.engine.volume = getSpec('Motorvolym');
    vehicleData.engine.fuel = getSpec('Drivmedel');
    vehicleData.gearbox = getSpec('Växellåda');

    const fourWheelDrive = getSpec('Fyrhjulsdrift');
    if (fourWheelDrive) {
        vehicleData.wheels.drive = fourWheelDrive.includes('Ja') ? 'Fyrhjulsdrift' : 'Tvåhjulsdrift';
    }

    vehicleData.dimensions.length = parseSwedishNumber(getSpec('Längd'));
    vehicleData.dimensions.width = parseSwedishNumber(getSpec('Bredd'));
    vehicleData.dimensions.height = getSpec('Höjd');
    vehicleData.dimensions.wheelbase = parseSwedishNumber(getSpec('Axelavstånd'));

    vehicleData.weights.curb = parseSwedishNumber(getSpec('Tjänstevikt'));
    vehicleData.weights.total = parseSwedishNumber(getSpec('Totalvikt'));
    vehicleData.weights.load = parseSwedishNumber(getSpec('Lastvikt'));
    vehicleData.weights.trailer = parseSwedishNumber(getSpec('Släpvagnsvikt'));

    vehicleData.wheels.tiresFront = getSpec('Däck fram');
    vehicleData.wheels.tiresRear = getSpec('Däck bak');

    // Calculate load if not set
    if (vehicleData.weights.total && vehicleData.weights.curb && !vehicleData.weights.load) {
        vehicleData.weights.load = vehicleData.weights.total - vehicleData.weights.curb;
    }

    return vehicleData;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const regNo = process.argv[2] || 'JSN398';

    console.log('🚗 biluppgifter.se Scraper Test');
    console.log('='.repeat(50));
    console.log(`📌 RegNo: ${regNo}`);
    console.log('');

    const startTime = Date.now();
    const data = await scrapeBiluppgifter(regNo);
    const duration = Date.now() - startTime;

    if (!data) {
        console.error('\n❌ Scraping failed');
        process.exit(1);
    }

    console.log('\n✅ Scraping successful!');
    console.log(`⏱️  Duration: ${duration}ms`);
    console.log('');
    console.log('📊 Extracted Data:');
    console.log('='.repeat(50));
    console.log(JSON.stringify(data, null, 2));
    console.log('');

    // Summary
    console.log('📈 Summary:');
    console.log(`   Vehicle: ${data.make} ${data.model} (${data.year})`);
    console.log(`   Status: ${data.status}`);
    console.log(`   VIN: ${data.vin || 'Not found'}`);
    console.log(`   Fuel: ${data.engine.fuel}`);
    console.log(`   Power: ${data.engine.power}`);
    console.log(`   Mileage: ${data.inspection.mileage}`);
    console.log(`   Weight: ${data.weights.curb}kg (curb), ${data.weights.total}kg (total)`);
    console.log(`   Owners: ${data.history.owners}`);
    console.log('');

    // Field coverage
    const totalFields = 30;
    const filledFields = Object.values(data).filter(v =>
        v && (typeof v !== 'object' || Object.values(v).some(x => x && x !== 'Okänt' && x !== 0))
    ).length;
    const coverage = Math.round((filledFields / totalFields) * 100);
    console.log(`📋 Field Coverage: ${filledFields}/${totalFields} (~${coverage}%)`);
}

main().catch(console.error);
