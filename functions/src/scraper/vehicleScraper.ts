/**
 * VEHICLE DATA SCRAPER - Firebase Cloud Function
 *
 * Hämtar fordonsdata från svenska register via parallell scraping från flera källor.
 * Använder AI för att intelligent slå ihop data från alla källor.
 *
 * ARKITEKTUR:
 * 1. Parallell fetch från alla konfigurerade källor (car.info, biluppgifter.se, etc.)
 * 2. AI Merge - Gemini slår ihop och väljer bästa värden
 * 3. Adapter - Mappar till VehicleData schema
 * 4. Cache - Sparar i Firestore
 *
 * ANVÄNDNING:
 * POST /scrapeVehicleData
 * Body: { "regNo": "JSN398" }
 */

import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { defineSecret } from 'firebase-functions/params';
import * as admin from 'firebase-admin';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';

// Types
import { VehicleData } from '../types/types';

// Gemini API key from Secret Manager
const geminiApiKey = defineSecret('GEMINI_API_KEY');

// =============================================================================
// CONFIGURATION
// =============================================================================

const CONFIG = {
    // Cache duration in seconds (7 days - fordonsdata ändras sällan)
    CACHE_TTL_SECONDS: 7 * 24 * 60 * 60,

    // Timeouts
    FETCH_TIMEOUT_MS: 8000,
    AI_MERGE_TIMEOUT_MS: 15000,

    // User agent
    USER_AGENT: 'VanPlan/1.0 (Vehicle Project Manager; contact@vanplan.se)',

    // AI Model for merging (fast model for speed)
    AI_MODEL: 'gemini-2.0-flash',

    // Sources configuration - lätt att lägga till fler!
    SOURCES: [
        {
            id: 'car_info',
            name: 'car.info',
            enabled: true,
            buildUrl: (regNo: string) => `https://www.car.info/sv-se/license-plate/S/${regNo}`
        },
        {
            id: 'biluppgifter',
            name: 'biluppgifter.se',
            enabled: true,
            buildUrl: (regNo: string) => `https://biluppgifter.se/fordon/${regNo.toLowerCase()}/`
        },
        {
            id: 'transportstyrelsen',
            name: 'Transportstyrelsen',
            enabled: true,
            buildUrl: (regNo: string) => `https://fordon-fu-regnr.transportstyrelsen.se/UppgifterAnnatFordon?LicensePlate=${regNo}`
        }
        // Framtida källor (kräver API-nyckel):
        // { id: 'carfax', name: 'Carfax', enabled: false, ... }
        // { id: 'autodata', name: 'Autodata', enabled: false, ... }
    ]
};

// =============================================================================
// INTERFACES
// =============================================================================

/**
 * Rå data från en källa - source-agnostisk struktur
 * Alla fält är optional eftersom olika källor har olika data
 */
interface RawVehicleData {
    // Identifiering
    regNo?: string;
    vin?: string;

    // Grundinfo
    make?: string;
    model?: string;
    variant?: string;
    year?: number;
    modelYear?: number;
    firstRegistered?: string;

    // Status
    status?: string;
    inTraffic?: boolean;

    // Kaross
    bodyType?: string;
    color?: string;
    passengers?: number;
    doors?: number;

    // Motor
    fuelType?: string;
    enginePower?: string;
    engineVolume?: string;
    cylinders?: number;

    // Transmission
    gearbox?: string;
    gearCount?: number;
    driveType?: string;

    // Dimensioner (alla i mm)
    length?: number;
    width?: number;
    height?: number;
    wheelbase?: number;

    // Vikter (alla i kg)
    curbWeight?: number;
    totalWeight?: number;
    loadCapacity?: number;
    trailerWeightBraked?: number;
    trailerWeightUnbraked?: number;

    // Däck & Hjul
    tiresFront?: string;
    tiresRear?: string;
    boltPattern?: string;

    // Besiktning
    lastInspection?: string;
    nextInspection?: string;
    mileageAtInspection?: string;

    // Historik
    ownerCount?: number;
    lastOwnerChange?: string;
    mileageHistory?: Array<{
        date: string;
        mileage: number;
        mileageFormatted?: string;
        type?: string;
    }>;

    // Extra data som kan finnas
    extras?: Record<string, string>;
}

/**
 * Resultat från en källa
 */
interface SourceResult {
    sourceId: string;
    sourceName: string;
    success: boolean;
    data: RawVehicleData | null;
    error?: string;
    fetchTimeMs: number;
}

/**
 * Slutresultat från scrapeVehicleData
 */
interface ScrapeResult {
    success: boolean;
    sources: string[];
    vehicleData: VehicleData | null;
    error?: string;
    scrapedAt: string;
    cached: boolean;
    debug?: {
        sourceResults: Array<{
            source: string;
            success: boolean;
            error?: string;
            fetchTimeMs: number;
        }>;
        mergeTimeMs?: number;
    };
}

interface CachedVehicleData {
    vehicleData: VehicleData;
    sources: string[];
    scrapedAt: admin.firestore.Timestamp;
    expiresAt: admin.firestore.Timestamp;
}

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function normalizeRegNo(regNo: string): string {
    return regNo.replace(/\s+/g, '').toUpperCase();
}

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

function parseSwedishNumber(str: string | undefined): number {
    if (!str) return 0;
    const cleaned = str.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}

function parseSwedishDate(str: string | undefined): string {
    if (!str) return '';

    if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;

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
// SOURCE SCRAPERS
// =============================================================================

/**
 * Scrapar car.info och returnerar RawVehicleData
 */
async function scrapeCarInfo(regNo: string): Promise<RawVehicleData | null> {
    const source = CONFIG.SOURCES.find(s => s.id === 'car_info')!;
    const url = source.buildUrl(regNo);

    console.log(`[CarInfo] Fetching: ${url}`);

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
        console.log(`[CarInfo] HTTP ${response.status} for ${regNo}`);
        return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for rate limiting or not found
    if (html.includes('Kaffepaus') || html.includes('förhöjd aktivitet')) {
        throw new Error('RATE_LIMITED');
    }
    if (html.includes('Inget fordon hittades') || html.includes('No vehicle found')) {
        return null;
    }

    // Helper to get spec by label
    const getSpec = (label: string): string => {
        let result = '';
        $('.sprow').each((_, el) => {
            const $el = $(el);
            const titleEl = $el.find('.sptitle');
            if (titleEl.text().trim() === label) {
                const clone = $el.clone();
                clone.find('.icon_').remove();
                clone.find('.sptitle').remove();
                result = clone.text().trim();
                return false as any;
            }
        });
        return result;
    };

    const data: RawVehicleData = {
        regNo: regNo,
        extras: {}
    };

    // Parse H1: "Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976"
    const h1Text = $('h1 a.ident_name').text().trim();
    if (h1Text) {
        const yearMatch = h1Text.match(/(\d{4})$/);
        if (yearMatch) data.year = parseInt(yearMatch[1]);

        const makeMatch = h1Text.match(/^(\w+)/);
        if (makeMatch) data.make = makeMatch[1];

        const modelMatch = h1Text.match(/^\w+\s+([\w\s]+?)(?:\s+Skåpbil|\s+Sedan|\s+Kombi|\s+SUV|,)/);
        if (modelMatch) data.model = modelMatch[1].trim();

        if (h1Text.includes('Manuell')) data.gearbox = 'Manuell';
        else if (h1Text.includes('Automat')) data.gearbox = 'Automat';
    }

    // Extract specs
    const inTraffic = getSpec('I trafik');
    if (inTraffic) {
        data.inTraffic = inTraffic.includes('Ja');
        data.status = data.inTraffic ? 'I trafik' : 'Avställd';
    }

    data.color = getSpec('Färg') || undefined;
    data.ownerCount = parseSwedishNumber(getSpec('Antal ägare')) || undefined;
    data.mileageAtInspection = getSpec('Mätarställning') || undefined;
    data.bodyType = getSpec('Kaross') || undefined;
    data.vin = getSpec('Chassinummer (vin)') || undefined;
    data.enginePower = getSpec('Effekt') || undefined;
    data.engineVolume = getSpec('Motorvolym') || undefined;
    data.fuelType = getSpec('Bränsle') || undefined;
    data.driveType = getSpec('Drivlina') || undefined;

    const gearbox = getSpec('Växellåda');
    if (gearbox) data.gearbox = gearbox;

    data.length = parseSwedishNumber(getSpec('Längd')) || undefined;
    data.width = parseSwedishNumber(getSpec('Bredd')) || undefined;
    data.height = parseSwedishNumber(getSpec('Höjd')) || undefined;
    data.curbWeight = parseSwedishNumber(getSpec('Tjänstevikt')) || undefined;
    data.totalWeight = parseSwedishNumber(getSpec('Totalvikt')) || undefined;
    data.trailerWeightBraked = parseSwedishNumber(getSpec('Släpvagnsvikt')) || undefined;
    data.trailerWeightUnbraked = parseSwedishNumber(getSpec('Släpvagnsvikt obromsad')) || undefined;

    const regDate = getSpec('Första registrering');
    if (regDate) data.firstRegistered = parseSwedishDate(regDate);

    const lastInsp = getSpec('Senaste besiktning');
    if (lastInsp) data.lastInspection = parseSwedishDate(lastInsp);

    const nextInsp = getSpec('Nästa besiktning');
    if (nextInsp) data.nextInspection = parseSwedishDate(nextInsp);

    data.tiresFront = getSpec('Däck fram') || undefined;
    data.tiresRear = getSpec('Däck bak') || undefined;
    data.boltPattern = getSpec('Bultmönster') || undefined;

    // Calculate load capacity
    if (data.totalWeight && data.curbWeight) {
        data.loadCapacity = data.totalWeight - data.curbWeight;
    }

    // Extract mileage history from JavaScript
    try {
        const scriptContent = html.match(/var\s+datasetMileageWithoutUnofficial\s*=\s*(\[[\s\S]*?\]);/);
        if (scriptContent && scriptContent[1]) {
            const cleanedJson = scriptContent[1]
                .replace(/new Date\("([^"]+)"\)/g, '"$1"')
                .replace(/x:/g, '"x":')
                .replace(/y:/g, '"y":')
                .replace(/label:/g, '"label":')
                .replace(/mileage_formatted:/g, '"mileage_formatted":')
                .replace(/value_type:/g, '"value_type":');

            const mileageData = JSON.parse(cleanedJson);
            if (Array.isArray(mileageData) && mileageData.length > 0) {
                data.mileageHistory = mileageData.map((entry: any) => ({
                    date: entry.label || entry.x,
                    mileage: entry.y || 0,
                    mileageFormatted: entry.mileage_formatted,
                    type: entry.value_type
                }));
            }
        }
    } catch (error) {
        console.warn(`[CarInfo] Failed to extract mileage history:`, error);
    }

    console.log(`[CarInfo] Scraped: ${data.make} ${data.model} (${data.year})`);
    return data;
}

/**
 * Scrapar biluppgifter.se och returnerar RawVehicleData
 */
async function scrapeBiluppgifter(regNo: string): Promise<RawVehicleData | null> {
    const source = CONFIG.SOURCES.find(s => s.id === 'biluppgifter')!;
    const url = source.buildUrl(regNo);

    console.log(`[Biluppgifter] Fetching: ${url}`);

    const response = await fetchWithTimeout(url);

    if (response.status === 403) {
        console.log(`[Biluppgifter] Blocked (403) for ${regNo}`);
        return null;
    }

    if (!response.ok) {
        console.log(`[Biluppgifter] HTTP ${response.status} for ${regNo}`);
        return null;
    }

    const html = await response.text();

    if (html.includes('captcha') || html.includes('Verifiera')) {
        console.log(`[Biluppgifter] CAPTCHA required for ${regNo}`);
        return null;
    }

    const $ = cheerio.load(html);

    // Helper to get spec by label
    const getSpec = (label: string): string => {
        let result = '';
        $('ul.list li').each((_, li) => {
            const $li = $(li);
            const labelEl = $li.find('.label');
            const valueEl = $li.find('.value');
            if (labelEl.text().trim() === label) {
                result = valueEl.clone().find('a').remove().end().text().trim();
                return false as any;
            }
        });
        return result;
    };

    const data: RawVehicleData = {
        regNo: regNo,
        extras: {}
    };

    data.vin = getSpec('Chassinr / VIN') || undefined;
    data.make = getSpec('Fabrikat') || undefined;
    data.model = getSpec('Modell') || undefined;

    const yearStr = getSpec('Fordonsår / Modellår');
    if (yearStr) {
        const yearMatch = yearStr.match(/(\d{4})/);
        if (yearMatch) {
            data.year = parseInt(yearMatch[1]);
            // Try to get model year too
            const allYears = yearStr.match(/(\d{4})\s*\/\s*(\d{4})/);
            if (allYears) {
                data.year = parseInt(allYears[1]);
                data.modelYear = parseInt(allYears[2]);
            }
        }
    }

    data.status = getSpec('Status') || undefined;

    const firstReg = getSpec('Först registrerad');
    if (firstReg) data.firstRegistered = parseSwedishDate(firstReg);

    data.ownerCount = parseSwedishNumber(getSpec('Antal ägare')) || undefined;

    const lastOwner = getSpec('Senaste ägarbyte');
    if (lastOwner) data.lastOwnerChange = parseSwedishDate(lastOwner);

    const lastInsp = getSpec('Senast besiktigad');
    if (lastInsp) data.lastInspection = parseSwedishDate(lastInsp);

    const nextInsp = getSpec('Nästa besiktning senast');
    if (nextInsp) data.nextInspection = parseSwedishDate(nextInsp);

    data.mileageAtInspection = getSpec('Mätarställning (besiktning)') || undefined;
    data.enginePower = getSpec('Motoreffekt') || undefined;
    data.engineVolume = getSpec('Motorvolym') || undefined;
    data.fuelType = getSpec('Drivmedel') || undefined;
    data.gearbox = getSpec('Växellåda') || undefined;

    const fourWD = getSpec('Fyrhjulsdrift');
    if (fourWD) {
        data.driveType = fourWD.includes('Ja') ? 'Fyrhjulsdrift' : 'Tvåhjulsdrift';
    }

    data.color = getSpec('Färg') || undefined;
    data.bodyType = getSpec('Kaross') || undefined;
    data.length = parseSwedishNumber(getSpec('Längd')) || undefined;
    data.width = parseSwedishNumber(getSpec('Bredd')) || undefined;
    data.height = parseSwedishNumber(getSpec('Höjd')) || undefined;
    data.wheelbase = parseSwedishNumber(getSpec('Axelavstånd')) || undefined;
    data.curbWeight = parseSwedishNumber(getSpec('Tjänstevikt')) || undefined;
    data.totalWeight = parseSwedishNumber(getSpec('Totalvikt')) || undefined;
    data.loadCapacity = parseSwedishNumber(getSpec('Lastvikt')) || undefined;
    data.trailerWeightBraked = parseSwedishNumber(getSpec('Släpvagnsvikt')) || undefined;
    data.tiresFront = getSpec('Däck fram') || undefined;
    data.tiresRear = getSpec('Däck bak') || undefined;

    console.log(`[Biluppgifter] Scraped: ${data.make} ${data.model} (${data.year})`);
    return data;
}

/**
 * Scrapar Transportstyrelsen och returnerar RawVehicleData
 *
 * Officiell källa från myndigheten. Använder accordion-struktur.
 * URL: https://fordon-fu-regnr.transportstyrelsen.se/UppgifterAnnatFordon?LicensePlate=XXX
 */
async function scrapeTransportstyrelsen(regNo: string): Promise<RawVehicleData | null> {
    const source = CONFIG.SOURCES.find(s => s.id === 'transportstyrelsen')!;
    const url = source.buildUrl(regNo);

    console.log(`[Transportstyrelsen] Fetching: ${url}`);

    const response = await fetchWithTimeout(url);

    if (!response.ok) {
        console.log(`[Transportstyrelsen] HTTP ${response.status} for ${regNo}`);
        return null;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for "not found" scenarios
    if (html.includes('Inga uppgifter hittades') || html.includes('Fordonet finns inte')) {
        console.log(`[Transportstyrelsen] Vehicle not found: ${regNo}`);
        return null;
    }

    const data: RawVehicleData = {
        regNo: regNo,
        extras: {}
    };

    // Helper: Get all key-value pairs from a section
    // Structure: <div id="ts-XXXCollapse"> contains <div class="col-sm-6"><strong>Label</strong> Value</div>
    const getAllFromSection = (sectionId: string): Record<string, string> => {
        const pairs: Record<string, string> = {};
        $(`#${sectionId} .row`).each((_, row) => {
            $(row).find('.col-sm-6, .col-xs-12').each((__, col) => {
                const $col = $(col);
                const label = $col.find('strong').text().trim().replace(':', '');
                const fullText = $col.text().trim();
                const value = fullText.replace($col.find('strong').text(), '').trim();
                if (label && value) {
                    pairs[label] = value;
                }
            });
        });
        return pairs;
    };

    // Try to extract from "Sammanfattning" section
    const summary = getAllFromSection('ts-sammanfattningCollapse');

    // Try "Fordonsidentitet" section
    const identity = getAllFromSection('ts-fordonsidentitetCollapse');

    // Try "Tekniska data" section
    const technical = getAllFromSection('ts-tekniskadataCollapse');

    // Try "Besiktning" section
    const inspection = getAllFromSection('ts-besiktningCollapse');

    // Map extracted data to RawVehicleData
    // From summary
    data.make = summary['Fabrikat'] || summary['Märke'] || undefined;
    data.model = summary['Modell'] || summary['Handelsbenämning'] || undefined;
    data.status = summary['Status'] || undefined;

    if (summary['I trafik']) {
        data.inTraffic = summary['I trafik'].toLowerCase().includes('ja');
    }

    // From identity
    data.vin = identity['Chassinummer'] || identity['VIN'] || identity['Identifieringsnummer'] || undefined;

    const yearStr = identity['Årsmodell'] || identity['Fordonsår'] || '';
    if (yearStr) {
        const match = yearStr.match(/(\d{4})/);
        if (match) data.year = parseInt(match[1]);
    }

    const firstRegStr = identity['Första registrering'] || identity['I trafik första gången'] || '';
    if (firstRegStr) data.firstRegistered = parseSwedishDate(firstRegStr);

    data.color = identity['Färg'] || identity['Karosserifärg'] || undefined;
    data.bodyType = identity['Karosseri'] || identity['Karosstyp'] || undefined;

    // From technical
    data.fuelType = technical['Drivmedel'] || technical['Bränsle'] || undefined;
    data.enginePower = technical['Motoreffekt'] || technical['Effekt'] || undefined;
    data.engineVolume = technical['Slagvolym'] || technical['Motorvolym'] || undefined;
    data.gearbox = technical['Växellåda'] || undefined;

    data.curbWeight = parseSwedishNumber(technical['Tjänstevikt']) || undefined;
    data.totalWeight = parseSwedishNumber(technical['Totalvikt']) || undefined;
    data.trailerWeightBraked = parseSwedishNumber(technical['Släpvagnsvikt bromsad']) ||
                               parseSwedishNumber(technical['Släpvagnsvikt']) || undefined;
    data.trailerWeightUnbraked = parseSwedishNumber(technical['Släpvagnsvikt obromsad']) || undefined;

    data.length = parseSwedishNumber(technical['Längd']) || undefined;
    data.width = parseSwedishNumber(technical['Bredd']) || undefined;

    // From inspection
    const lastInspStr = inspection['Senast godkänd'] || inspection['Senaste besiktning'] || '';
    if (lastInspStr) data.lastInspection = parseSwedishDate(lastInspStr);

    const nextInspStr = inspection['Ska besiktas senast'] || inspection['Nästa besiktning'] || '';
    if (nextInspStr) data.nextInspection = parseSwedishDate(nextInspStr);

    data.mileageAtInspection = inspection['Mätarställning'] || undefined;

    // Calculate load capacity
    if (data.totalWeight && data.curbWeight) {
        data.loadCapacity = data.totalWeight - data.curbWeight;
    }

    // Log what we found
    const fieldsFound = Object.entries(data).filter(([k, v]) => v !== undefined && k !== 'extras').length;
    console.log(`[Transportstyrelsen] Scraped: ${data.make || '?'} ${data.model || '?'} (${data.year || '?'}), ${fieldsFound} fields`);

    // Only return if we got meaningful data
    if (!data.make && !data.model && !data.vin) {
        console.log(`[Transportstyrelsen] No meaningful data extracted`);
        return null;
    }

    return data;
}

// =============================================================================
// PARALLEL FETCH
// =============================================================================

/**
 * Hämtar data från alla aktiverade källor parallellt
 */
async function fetchAllSources(regNo: string): Promise<SourceResult[]> {
    const enabledSources = CONFIG.SOURCES.filter(s => s.enabled);

    console.log(`[Parallel] Fetching from ${enabledSources.length} sources...`);

    const scraperMap: Record<string, (regNo: string) => Promise<RawVehicleData | null>> = {
        'car_info': scrapeCarInfo,
        'biluppgifter': scrapeBiluppgifter,
        'transportstyrelsen': scrapeTransportstyrelsen
    };

    const fetchPromises = enabledSources.map(async (source): Promise<SourceResult> => {
        const startTime = Date.now();

        try {
            const scraper = scraperMap[source.id];
            if (!scraper) {
                throw new Error(`No scraper for source: ${source.id}`);
            }

            const data = await scraper(regNo);
            const fetchTimeMs = Date.now() - startTime;

            return {
                sourceId: source.id,
                sourceName: source.name,
                success: data !== null,
                data,
                fetchTimeMs
            };
        } catch (error: any) {
            const fetchTimeMs = Date.now() - startTime;
            console.error(`[${source.name}] Error:`, error.message);

            return {
                sourceId: source.id,
                sourceName: source.name,
                success: false,
                data: null,
                error: error.message,
                fetchTimeMs
            };
        }
    });

    const results = await Promise.all(fetchPromises);

    const successCount = results.filter(r => r.success).length;
    console.log(`[Parallel] Completed: ${successCount}/${results.length} sources succeeded`);

    return results;
}

// =============================================================================
// AI MERGE
// =============================================================================

/**
 * Använder Gemini för att intelligent slå ihop data från flera källor
 */
async function aiMergeVehicleData(
    regNo: string,
    sourceResults: SourceResult[],
    apiKey: string
): Promise<VehicleData> {
    const successfulSources = sourceResults.filter(r => r.success && r.data);

    if (successfulSources.length === 0) {
        throw new Error('Ingen källa returnerade data');
    }

    // Om bara en källa, använd direkt adapter utan AI
    if (successfulSources.length === 1) {
        console.log(`[AI Merge] Only one source, using direct adapter`);
        return adaptToVehicleData(successfulSources[0].data!, [successfulSources[0].sourceName]);
    }

    console.log(`[AI Merge] Merging data from ${successfulSources.length} sources with AI...`);

    const ai = new GoogleGenAI({ apiKey });

    // Bygg prompt med all data
    const sourcesData = successfulSources.map(s => ({
        source: s.sourceName,
        data: s.data
    }));

    const prompt = `Du är en expert på att slå ihop fordonsdata från flera svenska källor.

UPPGIFT:
Slå ihop följande fordonsdata från ${successfulSources.length} källor till ett enhetligt JSON-objekt.

REGLER:
1. Välj det mest trovärdiga/kompletta värdet för varje fält
2. Om värden skiljer sig, prioritera:
   - Transportstyrelsen är OFFICIELL KÄLLA - prioritera för: status, besiktning, vikter, VIN
   - VIN: Transportstyrelsen > biluppgifter.se > car.info
   - Tekniska specs: Transportstyrelsen > car.info > biluppgifter.se
   - Historik (mileageHistory): car.info har bäst historikdata
   - Ägarhistorik: biluppgifter.se har ofta mer detaljer
3. Behåll mileageHistory om det finns (viktig historik)
4. Normalisera datum till YYYY-MM-DD format
5. Vikter ska vara i kg (heltal)
6. Dimensioner ska vara i mm (heltal)

KÄLLDATA:
${JSON.stringify(sourcesData, null, 2)}

RETURNERA JSON enligt detta schema (inga kommentarer, bara valid JSON):
{
  "regNo": "${regNo}",
  "make": "string",
  "model": "string",
  "year": number,
  "prodYear": number,
  "regDate": "YYYY-MM-DD",
  "status": "I trafik | Avställd | Okänt",
  "bodyType": "string",
  "passengers": number,
  "inspection": {
    "last": "YYYY-MM-DD",
    "next": "YYYY-MM-DD",
    "mileage": "string"
  },
  "engine": {
    "fuel": "string",
    "power": "string",
    "volume": "string"
  },
  "gearbox": "string",
  "wheels": {
    "drive": "string",
    "tiresFront": "string",
    "tiresRear": "string",
    "boltPattern": "string"
  },
  "dimensions": {
    "length": number,
    "width": number,
    "height": "string",
    "wheelbase": number
  },
  "weights": {
    "curb": number,
    "total": number,
    "load": number,
    "trailer": number,
    "trailerB": number
  },
  "vin": "string",
  "color": "string",
  "history": {
    "owners": number,
    "events": number,
    "lastOwnerChange": "YYYY-MM-DD",
    "mileageHistory": []
  }
}`;

    try {
        const result = await ai.models.generateContent({
            model: CONFIG.AI_MODEL,
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            config: {
                responseMimeType: 'application/json'
            }
        });

        const jsonText = result.text;
        if (!jsonText) {
            throw new Error('AI returned empty response');
        }

        const merged = JSON.parse(jsonText) as VehicleData;

        // Ensure regNo is set correctly
        merged.regNo = regNo;

        console.log(`[AI Merge] Successfully merged: ${merged.make} ${merged.model}`);
        return merged;

    } catch (error: any) {
        console.error(`[AI Merge] Error:`, error.message);
        // Fallback: use direct adapter with first successful source
        console.log(`[AI Merge] Falling back to direct adapter`);
        return adaptToVehicleData(
            successfulSources[0].data!,
            successfulSources.map(s => s.sourceName)
        );
    }
}

/**
 * Direkt adapter från RawVehicleData till VehicleData (utan AI)
 */
function adaptToVehicleData(raw: RawVehicleData, sources: string[]): VehicleData {
    return {
        regNo: raw.regNo || '',
        make: raw.make || 'Okänt',
        model: raw.model || 'Okänt',
        year: raw.year || 0,
        prodYear: raw.modelYear || raw.year || 0,
        regDate: raw.firstRegistered || 'Okänt',
        status: raw.status || (raw.inTraffic ? 'I trafik' : 'Okänt'),
        bodyType: raw.bodyType || '',
        passengers: raw.passengers || 0,
        inspection: {
            last: raw.lastInspection || 'Okänt',
            next: raw.nextInspection || 'Okänt',
            mileage: raw.mileageAtInspection || 'Okänt'
        },
        engine: {
            fuel: raw.fuelType || '',
            power: raw.enginePower || '',
            volume: raw.engineVolume || ''
        },
        gearbox: raw.gearbox || '',
        wheels: {
            drive: raw.driveType || '',
            tiresFront: raw.tiresFront || '',
            tiresRear: raw.tiresRear || '',
            boltPattern: raw.boltPattern || ''
        },
        dimensions: {
            length: raw.length || 0,
            width: raw.width || 0,
            height: raw.height ? String(raw.height) : '',
            wheelbase: raw.wheelbase || 0
        },
        weights: {
            curb: raw.curbWeight || 0,
            total: raw.totalWeight || 0,
            load: raw.loadCapacity || 0,
            trailer: raw.trailerWeightBraked || 0,
            trailerB: raw.trailerWeightUnbraked || 0
        },
        vin: raw.vin || '',
        color: raw.color || '',
        history: {
            owners: raw.ownerCount || 0,
            events: 0,
            lastOwnerChange: raw.lastOwnerChange || '',
            mileageHistory: raw.mileageHistory?.map(m => ({
                date: m.date,
                mileage: m.mileage,
                mileageFormatted: m.mileageFormatted || String(m.mileage),
                type: m.type || 'Okänt'
            }))
        }
    };
}

// =============================================================================
// CACHE LAYER
// =============================================================================

async function getCachedVehicleData(regNo: string): Promise<CachedVehicleData | null> {
    const db = admin.firestore();
    const docRef = db.collection('vehicleDataCache').doc(regNo);

    try {
        const doc = await docRef.get();
        if (!doc.exists) return null;

        const data = doc.data() as CachedVehicleData;
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

async function setCachedVehicleData(
    regNo: string,
    vehicleData: VehicleData,
    sources: string[]
): Promise<void> {
    const db = admin.firestore();
    const docRef = db.collection('vehicleDataCache').doc(regNo);

    const now = admin.firestore.Timestamp.now();
    const expiresAt = admin.firestore.Timestamp.fromMillis(
        now.toMillis() + (CONFIG.CACHE_TTL_SECONDS * 1000)
    );

    try {
        await docRef.set({
            vehicleData,
            sources,
            scrapedAt: now,
            expiresAt
        });
        console.log(`[Cache] Saved ${regNo} from ${sources.join(', ')}`);
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
 * Hämtar fordonsdata via parallell scraping från flera källor.
 * Använder AI för att slå ihop data intelligent.
 */
export const scrapeVehicleData = onCall(
    {
        secrets: [geminiApiKey],
        region: 'europe-west1',
        timeoutSeconds: 45,
        memory: '512MiB',
        cors: true,
        invoker: 'public'
    },
    async (request): Promise<ScrapeResult> => {
        const startTime = Date.now();
        console.log('[Main] Function started (v2.0 - Parallel + AI Merge)');

        try {
            // Validate input
            const regNo = request.data?.regNo;
            if (!regNo || typeof regNo !== 'string') {
                return {
                    success: false,
                    sources: [],
                    vehicleData: null,
                    error: 'Registreringsnummer krävs',
                    scrapedAt: new Date().toISOString(),
                    cached: false
                };
            }

            const normalizedRegNo = normalizeRegNo(regNo);

            // Validate format
            if (!/^[A-Z]{3}\d{2}[A-Z0-9]$/.test(normalizedRegNo)) {
                return {
                    success: false,
                    sources: [],
                    vehicleData: null,
                    error: 'Ogiltigt registreringsnummerformat. Förväntat: ABC123 eller ABC12A',
                    scrapedAt: new Date().toISOString(),
                    cached: false
                };
            }

            console.log(`[Main] Processing: ${normalizedRegNo}`);

            // 1. Check cache
            const cached = await getCachedVehicleData(normalizedRegNo);
            if (cached) {
                return {
                    success: true,
                    sources: cached.sources,
                    vehicleData: cached.vehicleData,
                    scrapedAt: cached.scrapedAt.toDate().toISOString(),
                    cached: true
                };
            }

            // 2. Parallel fetch from all sources
            const sourceResults = await fetchAllSources(normalizedRegNo);

            const successfulSources = sourceResults.filter(r => r.success);
            if (successfulSources.length === 0) {
                return {
                    success: false,
                    sources: [],
                    vehicleData: null,
                    error: 'Kunde inte hämta data från någon källa',
                    scrapedAt: new Date().toISOString(),
                    cached: false,
                    debug: {
                        sourceResults: sourceResults.map(r => ({
                            source: r.sourceName,
                            success: r.success,
                            error: r.error,
                            fetchTimeMs: r.fetchTimeMs
                        }))
                    }
                };
            }

            // 3. AI Merge (or direct adapter if only one source)
            const mergeStartTime = Date.now();
            const apiKey = geminiApiKey.value();

            let vehicleData: VehicleData;
            if (apiKey && successfulSources.length > 1) {
                vehicleData = await aiMergeVehicleData(normalizedRegNo, sourceResults, apiKey);
            } else {
                // No API key or single source - use direct adapter
                vehicleData = adaptToVehicleData(
                    successfulSources[0].data!,
                    successfulSources.map(s => s.sourceName)
                );
            }
            const mergeTimeMs = Date.now() - mergeStartTime;

            // 4. Cache result
            const usedSources = successfulSources.map(s => s.sourceName);
            await setCachedVehicleData(normalizedRegNo, vehicleData, usedSources);

            const totalTimeMs = Date.now() - startTime;
            console.log(`[Main] Completed in ${totalTimeMs}ms (merge: ${mergeTimeMs}ms)`);

            return {
                success: true,
                sources: usedSources,
                vehicleData,
                scrapedAt: new Date().toISOString(),
                cached: false,
                debug: {
                    sourceResults: sourceResults.map(r => ({
                        source: r.sourceName,
                        success: r.success,
                        error: r.error,
                        fetchTimeMs: r.fetchTimeMs
                    })),
                    mergeTimeMs
                }
            };

        } catch (error: any) {
            console.error('[Main] CRITICAL ERROR:', error);
            return {
                success: false,
                sources: [],
                vehicleData: null,
                error: `Serverfel: ${error.message || 'Okänt fel'}`,
                scrapedAt: new Date().toISOString(),
                cached: false
            };
        }
    }
);

// =============================================================================
// ADMIN FUNCTION: CLEAR CACHE
// =============================================================================

export const clearVehicleCache = onCall(
    { region: 'europe-west1' },
    async (request) => {
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
    }
);
