
import * as cheerio from 'cheerio';

const CONFIG = {
    USER_AGENT: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    SOURCES: {
        BILUPPGIFTER: {
            baseUrl: 'https://biluppgifter.se/fordon/'
        },
        CAR_INFO: {
            baseUrl: 'https://www.car.info/sv-se/license-plate/S/'
        }
    }
};

async function fetchWithTimeout(url: string, timeoutMs: number = 10000) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

    try {
        console.log(`fetching ${url}...`);
        const response = await fetch(url, {
            headers: {
                'User-Agent': CONFIG.USER_AGENT,
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
                'Accept-Language': 'sv-SE,sv;q=0.9,en-US;q=0.8,en;q=0.7'
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

async function scrapeBiluppgifter(regNo: string) {
    const url = `${CONFIG.SOURCES.BILUPPGIFTER.baseUrl}${regNo.toLowerCase()}/`;
    try {
        const response = await fetchWithTimeout(url);
        if (response.status === 403) {
            console.log(`[Biluppgifter] ❌ Blocked (403)`);
            return null;
        }
        if (!response.ok) {
            console.log(`[Biluppgifter] ❌ HTTP ${response.status}`);
            return null;
        }
        const html = await response.text();
        if (html.includes('captcha') || html.includes('Verifiera')) {
            console.log(`[Biluppgifter] ❌ CAPTCHA detected`);
            return null;
        }

        const $ = cheerio.load(html);
        const title = $('h1').text().trim();
        console.log(`[Biluppgifter] ✅ Success! Title: ${title}`);

        // Minimal extraction check
        const vin = $('ul.list li').filter((_, el) => $(el).find('.label').text().trim() === 'Chassinr / VIN').find('.value').text().trim();
        console.log(`[Biluppgifter] VIN: ${vin}`);

        return { title, vin };
    } catch (e) {
        console.log(`[Biluppgifter] Error: ${e}`);
        return null;
    }
}

async function scrapeCarInfo(regNo: string) {
    const url = `${CONFIG.SOURCES.CAR_INFO.baseUrl}${regNo.toUpperCase()}`;
    try {
        const response = await fetchWithTimeout(url);
        if (!response.ok) {
            console.log(`[CarInfo] ❌ HTTP ${response.status}`);
            return null;
        }
        const html = await response.text();
        const $ = cheerio.load(html);

        if (html.includes('Kaffepaus')) {
            console.log(`[CarInfo] ❌ Rate Limited (Kaffepaus)`);
            return null;
        }

        const title = $('h1').text().trim();
        console.log(`[CarInfo] ✅ Success! Title: ${title}`);
        return { title };
    } catch (e) {
        console.log(`[CarInfo] Error: ${e}`);
        return null;
    }
}

async function run() {
    const regNo = process.argv[2] || 'UPR79Z';
    console.log(`Testing scraper for: ${regNo}`);

    console.log('\n--- 1. Biluppgifter ---');
    await scrapeBiluppgifter(regNo);

    console.log('\n--- 2. Car.info ---');
    await scrapeCarInfo(regNo);
}

run();
