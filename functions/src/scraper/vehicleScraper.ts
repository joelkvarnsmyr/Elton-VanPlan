/**
 * VEHICLE DATA SCRAPER - Firebase Cloud Function
 *
 * Hämtar fordonsdata från svenska register via scraping.
 * Prioriterar car.info (bäst struktur) med biluppgifter.se som fallback.
 *
 * ANVÄNDNING:
 * POST /scrapeVehicleData
 * Body: { "regNo": "JSN398" }
 *
 * VIKTIGT:
 * - Respektera robots.txt och rate limits
 * - Cacha resultat i Firestore för att undvika överflödiga anrop
 * - Överväg att kontakta car.info för API-access vid hög volym
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as cheerio from 'cheerio';

// Types
import { VehicleData } from '../types/types';

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    // Cache duration in seconds (7 days - fordonsdata ändras sällan)
    CACHE_TTL_SECONDS: 7 * 24 * 60 * 60,

    // Rate limiting
    MAX_REQUESTS_PER_MINUTE: 10,

    // Timeouts
    FETCH_TIMEOUT_MS: 10000,

    // User agent (var ärlig om vem du är)
    USER_AGENT: 'VanPlan/1.0 (Vehicle Project Manager; contact@vanplan.se)',

    // Sources in priority order (biluppgifter.se has more detailed data!)
    SOURCES: {
        BILUPPGIFTER: {
            name: 'biluppgifter.se',
            baseUrl: 'https://biluppgifter.se/fordon/',
            priority: 1  // PRIMARY - Better data quality
        },
        CAR_INFO: {
            name: 'car.info',
            baseUrl: 'https://www.car.info/sv-se/license-plate/S/',
            priority: 2  // FALLBACK - Good but less detailed
        }
    }
};

// =============================================================================
// INTERFACES
// =============================================================================

interface ScrapeResult {
    success: boolean;
    source: string;
    vehicleData: Partial<VehicleData> | null;
    error?: string;
    scrapedAt: string;
    cached: boolean;
}

interface CachedVehicleData {
    vehicleData: VehicleData;
    source: string;
    scrapedAt: admin.firestore.Timestamp;
    expiresAt: admin.firestore.Timestamp;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

/**
 * Normaliserar registreringsnummer (tar bort mellanslag, versaler)
 */
function normalizeRegNo(regNo: string): string {
    return regNo.replace(/\s+/g, '').toUpperCase();
}

/**
 * Fetch med timeout och headers
 */
async function fetchWithTimeout(url: string, timeoutMs: number = CONFIG.FETCH_TIMEOUT_MS): Promise<Response> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

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
        return response;
    } catch (error) {
        clearTimeout(timeoutId);
        throw error;
    }
}

/**
 * Parsar numeriska värden från svenska formaterade strängar
 * "2 280 kg" -> 2280
 */
function parseSwedishNumber(str: string | undefined): number {
    if (!str) return 0;
    const cleaned = str.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}

/**
 * Parsar datum från olika format
 * "2025-08-13" eller "13 aug 2025" -> "2025-08-13"
 */
function parseSwedishDate(str: string | undefined): string {
    if (!str) return 'Okänt';

    // Om redan ISO-format
    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

    // Försök parsa svenska datum
    const months: Record<string, string> = {
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
// CAR.INFO SCRAPER
// =============================================================================

/**
 * Scrapar fordonsdata från car.info
 *
 * Car.info har en väldigt strukturerad sida med .sprow-klasser för alla specs.
 * ALL data finns redan i HTML-källan (CSS-gömd), så vi behöver INTE Playwright!
 *
 * Verifierad struktur (2025-12-11):
 * - Alla specs: <div class="sprow"><span class="sptitle">Label</span> Value</div>
 * - H1 format: "Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976"
 */
async function scrapeCarInfo(regNo: string): Promise<Partial<VehicleData> | null> {
    const url = `${CONFIG.SOURCES.CAR_INFO.baseUrl}${regNo}`;

    console.log(`[CarInfo] Fetching: ${url}`);

    try {
        const response = await fetchWithTimeout(url);

        if (!response.ok) {
            console.log(`[CarInfo] HTTP ${response.status} for ${regNo}`);
            return null;
        }

        const html = await response.text();
        const $ = cheerio.load(html);

        // Kontrollera för rate limiting ("Kaffepaus")
        if (html.includes('Kaffepaus') || html.includes('förhöjd aktivitet')) {
            console.log(`[CarInfo] ⚠️ RATE LIMITED - "Kaffepaus" screen detected`);
            console.log(`[CarInfo] Please wait 60 seconds and try again`);
            throw new Error('RATE_LIMITED');
        }

        // Kontrollera om fordonet hittades
        if (html.includes('Inget fordon hittades') || html.includes('No vehicle found')) {
            console.log(`[CarInfo] Vehicle not found: ${regNo}`);
            return null;
        }

        // Helper: Get spec value by label from .sprow elements
        const getSpec = (label: string): string => {
            let result = '';
            $('.sprow').each((_, el) => {
                const $el = $(el);
                const titleEl = $el.find('.sptitle');

                if (titleEl.text().trim() === label) {
                    // Clone element, remove icons and title, get remaining text
                    const clone = $el.clone();
                    clone.find('.icon_').remove(); // Remove icons (e.g., icon_cross, icon_check)
                    clone.find('.sptitle').remove(); // Remove title
                    result = clone.text().trim();
                    return false as any; // Break loop
                }
            });
            return result;
        };

        // Parse H1 for basic info: "Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976"
        const h1Text = $('h1 a.ident_name').text().trim();
        console.log(`[CarInfo] H1 text: "${h1Text}"`);

        // Initialize vehicleData
        const vehicleData: Partial<VehicleData> = {
            regNo: regNo,
            make: '',
            model: '',
            year: 0,
            prodYear: 0,
            regDate: 'Okänt',
            status: 'Okänt',
            bodyType: '',
            passengers: 0,
            inspection: { last: 'Okänt', next: 'Okänt', mileage: 'Okänt' },
            engine: { fuel: '', power: '', volume: '' },
            gearbox: '',
            wheels: { drive: '', tiresFront: '', tiresRear: '', boltPattern: '' },
            dimensions: { length: 0, width: 0, height: '', wheelbase: 0 },
            weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
            vin: '',
            color: '',
            history: { owners: 0, events: 0, lastOwnerChange: '' }
        };

        // Parse H1 - Example: "Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976"
        // Pattern: {Make} {Model} {BodyType} {Variant} {Transmission}, {Power}, {Year}
        if (h1Text) {
            // Extract year (last 4 digits)
            const yearMatch = h1Text.match(/(\d{4})$/);
            if (yearMatch) {
                vehicleData.year = parseInt(yearMatch[1]);
                vehicleData.prodYear = parseInt(yearMatch[1]);
            }

            // Extract make (first word)
            const makeMatch = h1Text.match(/^(\w+)/);
            if (makeMatch) {
                vehicleData.make = makeMatch[1];
            }

            // Extract model (everything between make and body type or first comma)
            // This is tricky - let's try to extract the model name
            const modelMatch = h1Text.match(/^\w+\s+([\w\s]+?)(?:\s+Skåpbil|\s+Sedan|\s+Kombi|\s+SUV|,)/);
            if (modelMatch) {
                vehicleData.model = modelMatch[1].trim();
            }

            // Extract transmission
            if (h1Text.includes('Manuell')) {
                vehicleData.gearbox = 'Manuell';
            } else if (h1Text.includes('Automat')) {
                vehicleData.gearbox = 'Automat';
            }
        }

        // Extract all specs using .sprow pattern

        // Basic Info
        const inTraffic = getSpec('I trafik');
        if (inTraffic) {
            vehicleData.status = inTraffic.includes('Ja') ? 'I trafik' : 'Avställd';
        }

        const color = getSpec('Färg');
        if (color) vehicleData.color = color;

        const owners = getSpec('Antal ägare');
        if (owners) vehicleData.history!.owners = parseSwedishNumber(owners);

        const mileage = getSpec('Mätarställning');
        if (mileage) vehicleData.inspection!.mileage = mileage;

        const bodyType = getSpec('Kaross');
        if (bodyType) vehicleData.bodyType = bodyType;

        // const classification = getSpec('Klassificering');
        // Classification kan användas som extra info

        const vin = getSpec('Chassinummer (vin)');
        if (vin) vehicleData.vin = vin;

        // Engine & Performance
        const power = getSpec('Effekt');
        if (power) vehicleData.engine!.power = power;

        // const horsePower = getSpec('Hästkrafter');
        // Already have power in kW, this is redundant

        const engineVolume = getSpec('Motorvolym');
        if (engineVolume) vehicleData.engine!.volume = engineVolume;

        const fuel = getSpec('Bränsle');
        if (fuel) vehicleData.engine!.fuel = fuel;

        // const tankVolume = getSpec('Tankvolym');
        // Can add to engine if needed

        // Transmission & Drive
        const drive = getSpec('Drivlina');
        if (drive) vehicleData.wheels!.drive = drive;

        const gearbox = getSpec('Växellåda');
        if (gearbox) vehicleData.gearbox = gearbox;

        // Dimensions & Weights
        const length = getSpec('Längd');
        if (length) vehicleData.dimensions!.length = parseSwedishNumber(length);

        const width = getSpec('Bredd');
        if (width) vehicleData.dimensions!.width = parseSwedishNumber(width);

        const height = getSpec('Höjd');
        if (height) vehicleData.dimensions!.height = height;

        const curbWeight = getSpec('Tjänstevikt');
        if (curbWeight) vehicleData.weights!.curb = parseSwedishNumber(curbWeight);

        const totalWeight = getSpec('Totalvikt');
        if (totalWeight) vehicleData.weights!.total = parseSwedishNumber(totalWeight);

        const trailerWeight = getSpec('Släpvagnsvikt');
        if (trailerWeight) vehicleData.weights!.trailer = parseSwedishNumber(trailerWeight);

        const trailerBWeight = getSpec('Släpvagnsvikt obromsad');
        if (trailerBWeight) vehicleData.weights!.trailerB = parseSwedishNumber(trailerBWeight);

        // Registration info
        const regDate = getSpec('Första registrering');
        if (regDate) vehicleData.regDate = parseSwedishDate(regDate);

        // Inspection
        const lastInspection = getSpec('Senaste besiktning');
        if (lastInspection) vehicleData.inspection!.last = parseSwedishDate(lastInspection);

        const nextInspection = getSpec('Nästa besiktning');
        if (nextInspection) vehicleData.inspection!.next = parseSwedishDate(nextInspection);

        // Tires
        const tiresFront = getSpec('Däck fram');
        if (tiresFront) vehicleData.wheels!.tiresFront = tiresFront;

        const tiresRear = getSpec('Däck bak');
        if (tiresRear) vehicleData.wheels!.tiresRear = tiresRear;

        const boltPattern = getSpec('Bultmönster');
        if (boltPattern) vehicleData.wheels!.boltPattern = boltPattern;

        // Calculate load capacity if not provided
        if (vehicleData.weights!.total && vehicleData.weights!.curb && !vehicleData.weights!.load) {
            vehicleData.weights!.load = vehicleData.weights!.total - vehicleData.weights!.curb;
        }

        console.log(`[CarInfo] Successfully scraped: ${vehicleData.make} ${vehicleData.model} (${vehicleData.year})`);
        console.log(`[CarInfo] Found specs: VIN=${!!vehicleData.vin}, Weight=${vehicleData.weights!.curb}kg, Fuel=${vehicleData.engine!.fuel}`);

        return vehicleData;

    } catch (error) {
        console.error(`[CarInfo] Error scraping ${regNo}:`, error);
        return null;
    }
}

// =============================================================================
// BILUPPGIFTER.SE SCRAPER (FALLBACK)
// =============================================================================

/**
 * Scrapar fordonsdata från biluppgifter.se
 *
 * Verifierad struktur (2025-12-11):
 * - Alla fält: <ul class="list"><li><span class="label">Label</span><span class="value">Value</span></li></ul>
 * - H1 format: "Volkswagen LT 31 Skåp"
 * - Sektioner: #vehicle-data, #technical-data, #meter-history, #history-log
 *
 * OBS: Denna sida kan ha CAPTCHA och blockera automatiserad åtkomst.
 * Använd som fallback till car.info.
 */
async function scrapeBiluppgifter(regNo: string): Promise<Partial<VehicleData> | null> {
    const url = `${CONFIG.SOURCES.BILUPPGIFTER.baseUrl}${regNo.toLowerCase()}/`;

    console.log(`[Biluppgifter] Fetching: ${url}`);

    try {
        const response = await fetchWithTimeout(url);

        // Biluppgifter returnerar ofta 403 eller redirect till CAPTCHA
        if (response.status === 403) {
            console.log(`[Biluppgifter] Blocked (403) for ${regNo}`);
            return null;
        }

        if (!response.ok) {
            console.log(`[Biluppgifter] HTTP ${response.status} for ${regNo}`);
            return null;
        }

        const html = await response.text();

        // Kontrollera om vi fick en CAPTCHA-sida
        if (html.includes('captcha') || html.includes('Verifiera')) {
            console.log(`[Biluppgifter] CAPTCHA required for ${regNo}`);
            return null;
        }

        const $ = cheerio.load(html);

        // Helper: Get spec value by label from <ul class="list"> pattern
        const getSpec = (label: string): string => {
            let result = '';
            $('ul.list li').each((_, li) => {
                const $li = $(li);
                const labelEl = $li.find('.label');
                const valueEl = $li.find('.value');

                if (labelEl.text().trim() === label) {
                    // Remove any nested links/icons, get just text
                    result = valueEl.clone().find('a').remove().end().text().trim();
                    return false as any; // Break
                }
            });
            return result;
        };

        // Note: H1 on biluppgifter.se contains page title, not vehicle info
        // We get make/model from specs instead

        // Initialize vehicleData
        const vehicleData: Partial<VehicleData> = {
            regNo: regNo,
            make: '',
            model: '',
            year: 0,
            prodYear: 0,
            regDate: 'Okänt',
            status: 'Okänt',
            bodyType: '',
            passengers: 0,
            inspection: { last: 'Okänt', next: 'Okänt', mileage: 'Okänt' },
            engine: { fuel: '', power: '', volume: '' },
            gearbox: '',
            wheels: { drive: '', tiresFront: '', tiresRear: '', boltPattern: '' },
            dimensions: { length: 0, width: 0, height: '', wheelbase: 0 },
            weights: { curb: 0, total: 0, load: 0, trailer: 0, trailerB: 0 },
            vin: '',
            color: '',
            history: { owners: 0, events: 0, lastOwnerChange: '' }
        };

        // Extract data from #vehicle-data section
        vehicleData.vin = getSpec('Chassinr / VIN');

        // Get make/model from specs (H1 is not reliable)
        vehicleData.make = getSpec('Fabrikat');
        vehicleData.model = getSpec('Modell');

        // Parse year (format: "1976 / 1976")
        const yearStr = getSpec('Fordonsår / Modellår');
        if (yearStr) {
            const yearMatch = yearStr.match(/(\d{4})/);
            if (yearMatch) {
                vehicleData.year = parseInt(yearMatch[1]);
                vehicleData.prodYear = parseInt(yearMatch[1]);
            }
        }

        vehicleData.status = getSpec('Status');

        const firstReg = getSpec('Först registrerad');
        if (firstReg) vehicleData.regDate = parseSwedishDate(firstReg);

        const owners = getSpec('Antal ägare');
        if (owners) vehicleData.history!.owners = parseSwedishNumber(owners);

        const lastOwnerChange = getSpec('Senaste ägarbyte');
        if (lastOwnerChange) vehicleData.history!.lastOwnerChange = parseSwedishDate(lastOwnerChange);

        const lastInspection = getSpec('Senast besiktigad');
        if (lastInspection) vehicleData.inspection!.last = parseSwedishDate(lastInspection);

        const nextInspection = getSpec('Nästa besiktning senast');
        if (nextInspection) vehicleData.inspection!.next = parseSwedishDate(nextInspection);

        const mileage = getSpec('Mätarställning (besiktning)');
        if (mileage) vehicleData.inspection!.mileage = mileage;

        // Extract data from #technical-data section
        const power = getSpec('Motoreffekt');
        if (power) vehicleData.engine!.power = power;

        const volume = getSpec('Motorvolym');
        if (volume) vehicleData.engine!.volume = volume;

        const fuel = getSpec('Drivmedel');
        if (fuel) vehicleData.engine!.fuel = fuel;

        const gearbox = getSpec('Växellåda');
        if (gearbox) vehicleData.gearbox = gearbox;

        const fourWheelDrive = getSpec('Fyrhjulsdrift');
        if (fourWheelDrive) {
            vehicleData.wheels!.drive = fourWheelDrive.includes('Ja') ? 'Fyrhjulsdrift' : 'Tvåhjulsdrift';
        }

        vehicleData.color = getSpec('Färg');
        vehicleData.bodyType = getSpec('Kaross');

        const length = getSpec('Längd');
        if (length) vehicleData.dimensions!.length = parseSwedishNumber(length);

        const width = getSpec('Bredd');
        if (width) vehicleData.dimensions!.width = parseSwedishNumber(width);

        const height = getSpec('Höjd');
        if (height) vehicleData.dimensions!.height = height;

        const wheelbase = getSpec('Axelavstånd');
        if (wheelbase) vehicleData.dimensions!.wheelbase = parseSwedishNumber(wheelbase);

        const curbWeight = getSpec('Tjänstevikt');
        if (curbWeight) vehicleData.weights!.curb = parseSwedishNumber(curbWeight);

        const totalWeight = getSpec('Totalvikt');
        if (totalWeight) vehicleData.weights!.total = parseSwedishNumber(totalWeight);

        const loadWeight = getSpec('Lastvikt');
        if (loadWeight) vehicleData.weights!.load = parseSwedishNumber(loadWeight);

        const trailerWeight = getSpec('Släpvagnsvikt');
        if (trailerWeight) vehicleData.weights!.trailer = parseSwedishNumber(trailerWeight);

        // Tires
        const tiresFront = getSpec('Däck fram');
        if (tiresFront) vehicleData.wheels!.tiresFront = tiresFront;

        const tiresRear = getSpec('Däck bak');
        if (tiresRear) vehicleData.wheels!.tiresRear = tiresRear;

        // Calculate load capacity if not already set
        if (vehicleData.weights!.total && vehicleData.weights!.curb && !vehicleData.weights!.load) {
            vehicleData.weights!.load = vehicleData.weights!.total - vehicleData.weights!.curb;
        }

        console.log(`[Biluppgifter] Successfully scraped: ${vehicleData.make} ${vehicleData.model} (${vehicleData.year})`);
        console.log(`[Biluppgifter] Found specs: VIN=${!!vehicleData.vin}, Weight=${vehicleData.weights!.curb}kg, Fuel=${vehicleData.engine!.fuel}`);

        return vehicleData;

    } catch (error) {
        console.error(`[Biluppgifter] Error scraping ${regNo}:`, error);
        return null;
    }
}

// =============================================================================
// CACHE LAYER (FIRESTORE)
// =============================================================================

/**
 * Hämtar cachad fordonsdata från Firestore
 */
async function getCachedVehicleData(regNo: string): Promise<CachedVehicleData | null> {
    const db = admin.firestore();
    const docRef = db.collection('vehicleDataCache').doc(regNo);

    try {
        const doc = await docRef.get();

        if (!doc.exists) {
            return null;
        }

        const data = doc.data() as CachedVehicleData;

        // Kontrollera om cachen har gått ut
        if (data.expiresAt.toMillis() < Date.now()) {
            console.log(`[Cache] Expired for ${regNo}`);
            return null;
        }

        console.log(`[Cache] Hit for ${regNo}`);
        return data;

    } catch (error) {
        console.error(`[Cache] Error reading ${regNo}:`, error);
        return null;
    }
}

/**
 * Sparar fordonsdata i Firestore-cache
 */
async function setCachedVehicleData(
    regNo: string,
    vehicleData: VehicleData,
    source: string
): Promise<void> {
    const db = admin.firestore();
    const docRef = db.collection('vehicleDataCache').doc(regNo);

    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + (CONFIG.CACHE_TTL_SECONDS * 1000)
    );

    const cacheData: CachedVehicleData = {
        vehicleData,
        source,
        scrapedAt: now,
        expiresAt
    };

    try {
        await docRef.set(cacheData);
        console.log(`[Cache] Saved ${regNo} from ${source}`);
    } catch (error) {
        console.error(`[Cache] Error saving ${regNo}:`, error);
    }
}

// =============================================================================
// MAIN CLOUD FUNCTION
// =============================================================================

/**
 * Cloud Function: scrapeVehicleData
 *
 * Hämtar fordonsdata via scraping med caching.
 *
 * Request: { regNo: "JSN398" }
 * Response: ScrapeResult
 */
export const scrapeVehicleData = onCall(
    {
        region: 'europe-west1',
        timeoutSeconds: 30,
        memory: '256MiB'
    },
    async (request): Promise<ScrapeResult> => {

        // Validera input
        const regNo = request.data?.regNo;
        if (!regNo || typeof regNo !== 'string') {
            return {
                success: false,
                source: 'none',
                vehicleData: null,
                error: 'Registreringsnummer krävs',
                scrapedAt: new Date().toISOString(),
                cached: false
            };
        }

        const normalizedRegNo = normalizeRegNo(regNo);

        // Validera format (svenska regnummer)
        if (!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(normalizedRegNo)) {
            return {
                success: false,
                source: 'none',
                vehicleData: null,
                error: 'Ogiltigt registreringsnummerformat. Förväntat: ABC123 eller ABC12A',
                scrapedAt: new Date().toISOString(),
                cached: false
            };
        }

        console.log(`[Main] Processing: ${normalizedRegNo}`);

        // 1. Kolla cache först
        const cached = await getCachedVehicleData(normalizedRegNo);
        if (cached) {
            return {
                success: true,
                source: cached.source,
                vehicleData: cached.vehicleData,
                scrapedAt: cached.scrapedAt.toDate().toISOString(),
                cached: true
            };
        }

        // 2. Försök biluppgifter.se först (bäst datakvalitet)
        let vehicleData = await scrapeBiluppgifter(normalizedRegNo);
        let source = CONFIG.SOURCES.BILUPPGIFTER.name;

        // 3. Fallback till car.info
        if (!vehicleData) {
            console.log(`[Main] Falling back to car.info`);
            vehicleData = await scrapeCarInfo(normalizedRegNo);
            source = CONFIG.SOURCES.CAR_INFO.name;
        }

        // 4. Om vi fick data, cacha och returnera
        if (vehicleData) {
            // Fyll i standardvärden för saknade fält
            const completeData = fillDefaultValues(vehicleData);

            // Spara i cache
            await setCachedVehicleData(normalizedRegNo, completeData, source);

            return {
                success: true,
                source,
                vehicleData: completeData,
                scrapedAt: new Date().toISOString(),
                cached: false
            };
        }

        // 5. Ingen data hittades
        return {
            success: false,
            source: 'none',
            vehicleData: null,
            error: 'Kunde inte hitta fordonsdata. Kontrollera registreringsnumret.',
            scrapedAt: new Date().toISOString(),
            cached: false
        };
    });

/**
 * Fyller i standardvärden för saknade fält
 */
function fillDefaultValues(partial: Partial<VehicleData>): VehicleData {
    return {
        regNo: partial.regNo || '',
        make: partial.make || 'Okänt',
        model: partial.model || 'Okänt',
        year: partial.year || 0,
        prodYear: partial.prodYear || partial.year || 0,
        regDate: partial.regDate || 'Okänt',
        status: partial.status || 'Okänt',
        bodyType: partial.bodyType || '',
        passengers: partial.passengers || 0,
        inspection: {
            last: partial.inspection?.last || 'Okänt',
            next: partial.inspection?.next || 'Okänt',
            mileage: partial.inspection?.mileage || 'Okänt'
        },
        engine: {
            fuel: partial.engine?.fuel || '',
            power: partial.engine?.power || '',
            volume: partial.engine?.volume || ''
        },
        gearbox: partial.gearbox || '',
        wheels: {
            drive: partial.wheels?.drive || '',
            tiresFront: partial.wheels?.tiresFront || '',
            tiresRear: partial.wheels?.tiresRear || '',
            boltPattern: partial.wheels?.boltPattern || ''
        },
        dimensions: {
            length: partial.dimensions?.length || 0,
            width: partial.dimensions?.width || 0,
            height: partial.dimensions?.height || '',
            wheelbase: partial.dimensions?.wheelbase || 0
        },
        weights: {
            curb: partial.weights?.curb || 0,
            total: partial.weights?.total || 0,
            load: partial.weights?.load || 0,
            trailer: partial.weights?.trailer || 0,
            trailerB: partial.weights?.trailerB || 0
        },
        vin: partial.vin || '',
        color: partial.color || '',
        history: {
            owners: partial.history?.owners || 0,
            events: partial.history?.events || 0,
            lastOwnerChange: partial.history?.lastOwnerChange || ''
        }
    };
}

// =============================================================================
// ADMIN FUNCTION: CLEAR CACHE
// =============================================================================

/**
 * Rensar cachen för ett specifikt fordon (admin-only)
 */
export const clearVehicleCache = onCall(
    { region: 'europe-west1' },
    async (request) => {
        // Kräv admin-behörighet
        if (!request.auth?.token?.admin) {
            throw new HttpsError(
                'permission-denied',
                'Endast administratörer kan rensa cachen'
            );
        }

        const regNo = normalizeRegNo(request.data?.regNo || '');
        if (!regNo) {
            throw new HttpsError(
                'invalid-argument',
                'Registreringsnummer krävs'
            );
        }

        const db = admin.firestore();
        await db.collection('vehicleDataCache').doc(regNo).delete();

        return { success: true, message: `Cache rensad för ${regNo}` };
    });
