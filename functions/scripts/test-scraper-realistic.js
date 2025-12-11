/**
 * REALISTIC TEST SCRIPT: Vehicle Scraper
 *
 * Simulates real human usage patterns to avoid triggering anti-bot measures.
 * Tests multiple vehicles with randomized delays and realistic browsing behavior.
 *
 * Usage:
 *   node scripts/test-scraper-realistic.js
 *   node scripts/test-scraper-realistic.js --mock (use mock HTML)
 */

import * as cheerio from 'cheerio';
import fs from 'fs';

// =============================================================================
// CONFIG
// =============================================================================

const CONFIG = {
    CAR_INFO_BASE_URL: 'https://www.car.info/sv-se/license-plate/S/',
    BILUPPGIFTER_BASE_URL: 'https://biluppgifter.se/fordon/',
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    FETCH_TIMEOUT_MS: 10000,
    USE_MOCK_HTML: process.argv.includes('--mock'),

    // Human-like delays (in milliseconds)
    DELAYS: {
        MIN_BETWEEN_REQUESTS: 3000,  // 3 seconds
        MAX_BETWEEN_REQUESTS: 8000,  // 8 seconds
        MIN_BETWEEN_SITES: 5000,     // 5 seconds (switching sites)
        MAX_BETWEEN_SITES: 12000,    // 12 seconds
    },

    // Test vehicles
    TEST_VEHICLES: [
        { regNo: 'JKN330', description: 'Primary test vehicle' },
        { regNo: 'JSN398', description: 'VW LT 1976 - verified HTML' },
        { regNo: 'OHC870', description: 'Additional test vehicle' }
    ]
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

/**
 * Random delay to simulate human behavior
 */
function randomDelay(min, max) {
    const delay = Math.floor(Math.random() * (max - min + 1)) + min;
    return new Promise(resolve => setTimeout(resolve, delay));
}

/**
 * Human-like logging with timestamps
 */
function log(message, type = 'info') {
    const timestamp = new Date().toLocaleTimeString('sv-SE');
    const prefix = type === 'error' ? '❌' : type === 'success' ? '✅' : type === 'wait' ? '⏳' : 'ℹ️';
    console.log(`[${timestamp}] ${prefix} ${message}`);
}

// =============================================================================
// CAR.INFO SCRAPER
// =============================================================================

async function scrapeCarInfo(regNo) {
    const url = `${CONFIG.CAR_INFO_BASE_URL}${regNo}`;

    log(`Besöker car.info för ${regNo}...`);

    let html;
    if (CONFIG.USE_MOCK_HTML) {
        const mockPath = `./scripts/mock-html/car-info-${regNo}.html`;
        if (fs.existsSync(mockPath)) {
            html = fs.readFileSync(mockPath, 'utf-8');
            log(`Använder mock HTML: ${mockPath}`);
        } else {
            log(`Mock fil saknas: ${mockPath}`, 'error');
            return null;
        }
    } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': CONFIG.USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
                    'Referer': 'https://www.google.com/',
                    'DNT': '1'
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (!response.ok) {
                log(`HTTP ${response.status} från car.info`, 'error');
                return null;
            }

            html = await response.text();
        } catch (error) {
            clearTimeout(timeoutId);
            log(`Nätverksfel: ${error.message}`, 'error');
            return null;
        }
    }

    const $ = cheerio.load(html);

    // Check for rate limiting
    if (html.includes('Kaffepaus') || html.includes('förhöjd aktivitet')) {
        log('RATE LIMITED - Kaffepaus screen detekterad!', 'error');
        log('Vänta 60 sekunder innan nästa försök...', 'wait');
        return null;
    }

    // Check if vehicle found
    if (html.includes('Inget fordon hittades') || html.includes('No vehicle found')) {
        log(`Fordon hittades inte: ${regNo}`, 'error');
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
                return false;
            }
        });
        return result;
    };

    // Parse H1
    const h1Text = $('h1 a.ident_name').text().trim();

    const vehicleData = {
        source: 'car.info',
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
// BILUPPGIFTER.SE SCRAPER
// =============================================================================

async function scrapeBiluppgifter(regNo) {
    const url = `${CONFIG.BILUPPGIFTER_BASE_URL}${regNo.toLowerCase()}/`;

    log(`Besöker biluppgifter.se för ${regNo}...`);

    let html;
    if (CONFIG.USE_MOCK_HTML) {
        const mockPath = `./scripts/mock-html/biluppgifter-${regNo}.html`;
        if (fs.existsSync(mockPath)) {
            html = fs.readFileSync(mockPath, 'utf-8');
            log(`Använder mock HTML: ${mockPath}`);
        } else {
            log(`Mock fil saknas: ${mockPath}`, 'error');
            return null;
        }
    } else {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), CONFIG.FETCH_TIMEOUT_MS);

        try {
            const response = await fetch(url, {
                headers: {
                    'User-Agent': CONFIG.USER_AGENT,
                    'Accept': 'text/html,application/xhtml+xml',
                    'Accept-Language': 'sv-SE,sv;q=0.9,en;q=0.8',
                    'Referer': 'https://www.google.com/',
                    'DNT': '1'
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);

            if (response.status === 403) {
                log('Blockerad (403) från biluppgifter.se', 'error');
                return null;
            }

            if (!response.ok) {
                log(`HTTP ${response.status} från biluppgifter.se`, 'error');
                return null;
            }

            html = await response.text();
        } catch (error) {
            clearTimeout(timeoutId);
            log(`Nätverksfel: ${error.message}`, 'error');
            return null;
        }
    }

    // Check for CAPTCHA
    if (html.includes('captcha') || html.includes('Verifiera')) {
        log('CAPTCHA krävs för biluppgifter.se', 'error');
        return null;
    }

    const $ = cheerio.load(html);

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

    // Parse H1
    const h1Text = $('h1').first().text().trim();

    const vehicleData = {
        source: 'biluppgifter.se',
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
        const parts = h1Text.split(' ');
        if (parts.length >= 2) {
            vehicleData.make = parts[0];
            vehicleData.model = parts.slice(1).join(' ');
        }
    }

    // Extract data
    vehicleData.vin = getSpec('Chassinr / VIN');
    if (!vehicleData.make) vehicleData.make = getSpec('Fabrikat');
    if (!vehicleData.model) vehicleData.model = getSpec('Modell');

    const yearStr = getSpec('Fordonsår / Modellår');
    if (yearStr) {
        const yearMatch = yearStr.match(/(\d{4})/);
        if (yearMatch) vehicleData.year = parseInt(yearMatch[1]);
    }

    vehicleData.status = getSpec('Status');
    vehicleData.color = getSpec('Färg');
    vehicleData.bodyType = getSpec('Kaross');
    vehicleData.history.owners = parseSwedishNumber(getSpec('Antal ägare'));
    vehicleData.inspection.mileage = getSpec('Mätarställning (besiktning)');
    vehicleData.inspection.last = parseSwedishDate(getSpec('Senast besiktigad'));
    vehicleData.inspection.next = parseSwedishDate(getSpec('Nästa besiktning senast'));

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
// MAIN TEST RUNNER
// =============================================================================

async function testVehicle(vehicle, siteOrder) {
    console.log('\n' + '='.repeat(70));
    log(`Startar test för ${vehicle.regNo} (${vehicle.description})`);
    console.log('='.repeat(70));

    const results = [];

    for (const site of siteOrder) {
        const startTime = Date.now();
        let data = null;

        try {
            if (site === 'car.info') {
                data = await scrapeCarInfo(vehicle.regNo);
            } else {
                data = await scrapeBiluppgifter(vehicle.regNo);
            }

            const duration = Date.now() - startTime;

            if (data) {
                log(`Data hämtad från ${site} (${duration}ms)`, 'success');
                results.push({ site, success: true, data, duration });

                // Show summary
                console.log(`   → Fordon: ${data.make} ${data.model} (${data.year})`);
                console.log(`   → Status: ${data.status}`);
                console.log(`   → VIN: ${data.vin || 'Ej hittad'}`);
                console.log(`   → Bränsle: ${data.engine.fuel}`);
                console.log(`   → Effekt: ${data.engine.power}`);
                console.log(`   → Mätarställning: ${data.inspection.mileage}`);
                console.log(`   → Vikt: ${data.weights.curb}kg (tjänst), ${data.weights.total}kg (total)`);
                console.log(`   → Ägare: ${data.history.owners}`);
            } else {
                log(`Misslyckades att hämta data från ${site}`, 'error');
                results.push({ site, success: false, data: null, duration });
            }

        } catch (error) {
            const duration = Date.now() - startTime;
            log(`Fel vid scraping från ${site}: ${error.message}`, 'error');
            results.push({ site, success: false, error: error.message, duration });
        }

        // Human-like delay before next site
        if (siteOrder.indexOf(site) < siteOrder.length - 1) {
            const delay = Math.floor(
                Math.random() * (CONFIG.DELAYS.MAX_BETWEEN_SITES - CONFIG.DELAYS.MIN_BETWEEN_SITES + 1)
            ) + CONFIG.DELAYS.MIN_BETWEEN_SITES;
            log(`Väntar ${(delay / 1000).toFixed(1)}s innan nästa källa...`, 'wait');
            await randomDelay(delay, delay);
        }
    }

    return results;
}

async function main() {
    console.log('\n🚗 Realistisk Vehicle Scraper Test');
    console.log('='.repeat(70));
    console.log(`📅 Datum: ${new Date().toLocaleString('sv-SE')}`);
    console.log(`🔧 Mock mode: ${CONFIG.USE_MOCK_HTML ? 'JA' : 'NEJ (live fetching)'}`);
    console.log(`🚦 Fordon att testa: ${CONFIG.TEST_VEHICLES.length}`);
    console.log('='.repeat(70));

    const allResults = [];

    for (let i = 0; i < CONFIG.TEST_VEHICLES.length; i++) {
        const vehicle = CONFIG.TEST_VEHICLES[i];

        // Randomize site order to appear more human
        const siteOrder = Math.random() > 0.5
            ? ['car.info', 'biluppgifter.se']
            : ['biluppgifter.se', 'car.info'];

        const results = await testVehicle(vehicle, siteOrder);
        allResults.push({ vehicle, results });

        // Human-like delay before next vehicle
        if (i < CONFIG.TEST_VEHICLES.length - 1) {
            const delay = Math.floor(
                Math.random() * (CONFIG.DELAYS.MAX_BETWEEN_REQUESTS - CONFIG.DELAYS.MIN_BETWEEN_REQUESTS + 1)
            ) + CONFIG.DELAYS.MIN_BETWEEN_REQUESTS;
            log(`Väntar ${(delay / 1000).toFixed(1)}s innan nästa fordon...`, 'wait');
            await randomDelay(delay, delay);
        }
    }

    // Final summary
    console.log('\n' + '='.repeat(70));
    console.log('📊 SAMMANFATTNING');
    console.log('='.repeat(70));

    let totalTests = 0;
    let successfulTests = 0;

    allResults.forEach(({ vehicle, results }) => {
        console.log(`\n${vehicle.regNo} (${vehicle.description}):`);
        results.forEach(({ site, success, duration }) => {
            totalTests++;
            if (success) successfulTests++;
            const status = success ? '✅' : '❌';
            console.log(`  ${status} ${site}: ${success ? 'OK' : 'MISSLYCKADES'} (${duration}ms)`);
        });
    });

    const successRate = ((successfulTests / totalTests) * 100).toFixed(1);
    console.log(`\n🎯 Framgångsfrekvens: ${successfulTests}/${totalTests} (${successRate}%)`);
    console.log('='.repeat(70));

    if (successfulTests === totalTests) {
        log('Alla tester lyckades!', 'success');
    } else if (successfulTests > 0) {
        log(`${successfulTests} av ${totalTests} tester lyckades`, 'info');
    } else {
        log('Inga tester lyckades', 'error');
    }
}

main().catch(console.error);
