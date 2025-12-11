/**
 * TEST SCRIPT: Vehicle Scraper
 *
 * Tests the scrapeCarInfo function locally without deploying to Cloud Functions.
 *
 * Usage:
 *   node scripts/test-scraper.js JSN398
 */

import * as cheerio from 'cheerio';
import fs from 'fs';

// =============================================================================
// CONFIG
// =============================================================================

const CONFIG = {
    CAR_INFO_BASE_URL: 'https://www.car.info/sv-se/license-plate/S/',
    USER_AGENT: 'VanPlan/1.0 (Vehicle Project Manager; contact@vanplan.se)',
    FETCH_TIMEOUT_MS: 10000,
    USE_MOCK_HTML: false, // Set to true to use saved HTML file
    MOCK_HTML_PATH: './scripts/mock-html/JSN398.html'
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

async function scrapeCarInfo(regNo) {
    let html;

    if (CONFIG.USE_MOCK_HTML) {
        console.log(`📁 Using mock HTML from: ${CONFIG.MOCK_HTML_PATH}`);
        html = fs.readFileSync(CONFIG.MOCK_HTML_PATH, 'utf-8');
    } else {
        const url = `${CONFIG.CAR_INFO_BASE_URL}${regNo}`;
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

    // Check for rate limiting
    if (html.includes('Kaffepaus') || html.includes('förhöjd aktivitet')) {
        console.error('⚠️ RATE LIMITED - "Kaffepaus" screen detected');
        console.error('⏰ Please wait 60 seconds and try again');
        return null;
    }

    // Check if vehicle found
    if (html.includes('Inget fordon hittades') || html.includes('No vehicle found')) {
        console.error('❌ Vehicle not found');
        return null;
    }

    // Helper: Get spec value by label
    const getSpec = (label) => {
        let result = '';
        $('.sprow').each((_, el) => {
            const $el = $(el);
            const titleEl = $el.find('.sptitle');

            if (titleEl.text().trim() === label) {
                const clone = $el.clone();
                clone.find('.icon_').remove();
                clone.find('.sptitle').remove();
                result = clone.text().trim();
                return false; // Break
            }
        });
        return result;
    };

    // Parse H1
    const h1Text = $('h1 a.ident_name').text().trim();
    console.log(`📋 H1: "${h1Text}"`);

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
        dimensions: { length: 0, width: 0, height: '' },
        weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
        inspection: { last: 'Okänt', next: 'Okänt', mileage: 'Okänt' },
        history: { owners: 0 }
    };

    // Parse H1
    if (h1Text) {
        const yearMatch = h1Text.match(/(\d{4})$/);
        if (yearMatch) vehicleData.year = parseInt(yearMatch[1]);

        const makeMatch = h1Text.match(/^(\w+)/);
        if (makeMatch) vehicleData.make = makeMatch[1];

        const modelMatch = h1Text.match(/^\w+\s+([\w\s]+?)(?:\s+Skåpbil|\s+Sedan|\s+Kombi|\s+SUV|,)/);
        if (modelMatch) vehicleData.model = modelMatch[1].trim();
    }

    // Extract specs
    vehicleData.status = getSpec('I trafik').includes('Ja') ? 'I trafik' : 'Avställd';
    vehicleData.color = getSpec('Färg');
    vehicleData.history.owners = parseSwedishNumber(getSpec('Antal ägare'));
    vehicleData.inspection.mileage = getSpec('Mätarställning');
    vehicleData.bodyType = getSpec('Kaross');
    vehicleData.vin = getSpec('Chassinummer (vin)');

    vehicleData.engine.power = getSpec('Effekt');
    vehicleData.engine.volume = getSpec('Motorvolym');
    vehicleData.engine.fuel = getSpec('Bränsle');

    vehicleData.wheels.drive = getSpec('Drivlina');
    vehicleData.gearbox = getSpec('Växellåda');

    vehicleData.dimensions.length = parseSwedishNumber(getSpec('Längd'));
    vehicleData.dimensions.width = parseSwedishNumber(getSpec('Bredd'));
    vehicleData.dimensions.height = getSpec('Höjd');

    vehicleData.weights.curb = parseSwedishNumber(getSpec('Tjänstevikt'));
    vehicleData.weights.total = parseSwedishNumber(getSpec('Totalvikt'));
    vehicleData.weights.trailer = parseSwedishNumber(getSpec('Släpvagnsvikt'));
    vehicleData.weights.trailerB = parseSwedishNumber(getSpec('Släpvagnsvikt obromsad'));

    vehicleData.inspection.last = parseSwedishDate(getSpec('Senaste besiktning'));
    vehicleData.inspection.next = parseSwedishDate(getSpec('Nästa besiktning'));

    vehicleData.wheels.tiresFront = getSpec('Däck fram');
    vehicleData.wheels.tiresRear = getSpec('Däck bak');
    vehicleData.wheels.boltPattern = getSpec('Bultmönster');

    // Calculate load
    if (vehicleData.weights.total && vehicleData.weights.curb) {
        vehicleData.weights.load = vehicleData.weights.total - vehicleData.weights.curb;
    }

    return vehicleData;
}

// =============================================================================
// MAIN
// =============================================================================

async function main() {
    const regNo = process.argv[2] || 'JSN398';

    console.log('🚗 Vehicle Scraper Test');
    console.log('='.repeat(50));
    console.log(`📌 RegNo: ${regNo}`);
    console.log('');

    const startTime = Date.now();
    const data = await scrapeCarInfo(regNo);
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
    const totalFields = 30; // Approximate
    const filledFields = Object.values(data).filter(v =>
        v && (typeof v !== 'object' || Object.values(v).some(x => x && x !== 'Okänt' && x !== 0))
    ).length;
    const coverage = Math.round((filledFields / totalFields) * 100);
    console.log(`📋 Field Coverage: ${filledFields}/${totalFields} (~${coverage}%)`);
}

main().catch(console.error);
