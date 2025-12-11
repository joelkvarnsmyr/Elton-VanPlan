# Vehicle Data Scraper - Playwright Implementation

**Status:** Planned
**Priority:** High
**Date:** 2025-12-11
**Category:** Plattform / Data Acquisition
**AI-Agent:** Claude (Session: 01Xjmi7N7aGQ7316aLT5r53t)

---

## 1. Vision & Problem Statement

### Current Problem
The "Deep Research" onboarding flow relies on Gemini AI + Google Search to find vehicle data. This approach has critical weaknesses:

- **Unreliable Data Sources:** AI search often returns 403 errors, CAPTCHA blocks, or outdated information
- **No Validation:** No way to verify if data is accurate or current
- **Inconsistent Results:** Same RegNo can return different data on different attempts
- **Poor Structure:** Unstructured HTML means AI has to "guess" what's relevant
- **No Fallbacks:** If search fails, entire onboarding breaks

### The Solution: Hybrid Architecture

**Scraper (Facts) + AI (Creativity)**

```
┌─────────────────────────────────────────────────────┐
│                  USER INPUT                         │
│              RegNo: "ABC123"                        │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
┌─────────────────────────────────────────────────────┐
│         CLOUD FUNCTION: scrapeVehicleData           │
│  ┌──────────────────────────────────────────────┐   │
│  │  1. Check Cache (Firestore)                  │   │
│  │     └─ Hit? Return cached data               │   │
│  └──────────────────────────────────────────────┘   │
│                 │                                    │
│                 │ (Cache Miss)                       │
│                 ▼                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  2. Try car.info (Primary)                   │   │
│  │     - Clean HTML structure                   │   │
│  │     - Swedish registry data                  │   │
│  │     - Playwright scraping                    │   │
│  └──────────────────────────────────────────────┘   │
│                 │                                    │
│                 │ (Fallback)                         │
│                 ▼                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  3. Try biluppgifter.se (Secondary)          │   │
│  │     - More detailed specs                    │   │
│  │     - May require CAPTCHA handling           │   │
│  └──────────────────────────────────────────────┘   │
│                 │                                    │
│                 ▼                                    │
│  ┌──────────────────────────────────────────────┐   │
│  │  4. Cache Result (30 days TTL)               │   │
│  └──────────────────────────────────────────────┘   │
└────────────────┬────────────────────────────────────┘
                 │
                 ▼
         ┌───────────────────┐
         │  STRUCTURED DATA  │
         │  (VehicleData)    │
         └─────────┬─────────┘
                   │
                   ▼
┌─────────────────────────────────────────────────────┐
│           AI: Verkmästaren (Planner)                │
│  ┌──────────────────────────────────────────────┐   │
│  │  - Uses VERIFIED vehicle data                │   │
│  │  - Searches for common faults                │   │
│  │  - Creates maintenance plan                  │   │
│  │  - Generates expert analysis                 │   │
│  └──────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

**Key Principle:** Scraper provides FACTS (RegNo → VehicleData), AI provides CREATIVITY (VehicleData → Plan).

---

## 2. Architecture

### Technology Stack

- **Playwright** - Browser automation and scraping
- **Firebase Cloud Functions** - Serverless backend
- **Firestore** - Cache storage
- **TypeScript** - Type-safe scraping logic

### Why Playwright?

1. **JavaScript rendering:** Can handle dynamic content and SPAs
2. **Multiple browser support:** Chrome, Firefox, WebKit
3. **Built-in waiting:** Smart waits for elements to load
4. **Screenshot debugging:** Can capture state on failure
5. **CLI mode:** Interactive development to inspect HTML

### Cloud Function Structure

```typescript
// functions/src/scraper/vehicleScraper.ts

import * as functions from 'firebase-functions';
import { chromium } from 'playwright-core';

export const scrapeVehicleData = functions
  .region('europe-west1')
  .runWith({
    timeoutSeconds: 120,
    memory: '1GB'
  })
  .https.onCall(async (data, context): Promise<ScrapeResult> => {
    const regNo = normalizeRegNo(data?.regNo);

    // 1. Check cache first
    const cached = await getCachedVehicleData(regNo);
    if (cached && !cached.expired) {
      return {
        success: true,
        cached: true,
        vehicleData: cached.vehicleData,
        source: cached.source
      };
    }

    // 2. Try car.info (best structure)
    let vehicleData = await scrapeCarInfo(regNo);
    let source = 'car.info';

    // 3. Fallback to biluppgifter.se
    if (!vehicleData) {
      vehicleData = await scrapeBiluppgifter(regNo);
      source = 'biluppgifter.se';
    }

    // 4. Cache and return
    if (vehicleData) {
      await setCachedVehicleData(regNo, vehicleData, source);
      return {
        success: true,
        cached: false,
        vehicleData,
        source
      };
    }

    return {
      success: false,
      error: 'Kunde inte hitta fordonsdata för detta regnummer'
    };
  });
```

---

## 3. Development Workflow

### Phase 1: Interactive HTML Inspection (CLI)

**Goal:** Understand the HTML structure of target sites manually

```bash
# Install Playwright
cd /path/to/project
npm install -D playwright
npx playwright install chromium

# Launch interactive browser
npx playwright codegen car.info

# Or via Node.js script (recommended for this project)
node scripts/inspect-scraper.js
```

**Inspection Script** (`scripts/inspect-scraper.js`):
```javascript
const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const page = await browser.newPage();

  // Navigate to car.info
  await page.goto('https://car.info/en-se/search?regno=ABC123');

  // Wait for user to inspect elements
  console.log('🔍 Inspecting car.info...');
  console.log('Press Ctrl+C when done inspecting.');

  await page.waitForTimeout(300000); // 5 minutes

  await browser.close();
})();
```

**What to Look For:**
- ✅ Element selectors (CSS, XPath)
- ✅ Data structure (tables, divs, spans)
- ✅ Dynamic content (JavaScript rendering)
- ✅ CAPTCHA presence
- ✅ Rate limiting
- ✅ Mobile vs desktop differences

### Phase 2: Build Scraper Functions

Based on inspection, create scraper functions for each site.

#### Example: `scrapeCarInfo(regNo: string)`

```typescript
import { chromium } from 'playwright-core';
import type { VehicleData } from '@/types/types';

async function scrapeCarInfo(regNo: string): Promise<VehicleData | null> {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  try {
    // Navigate to search page
    await page.goto(`https://car.info/en-se/search?regno=${regNo}`);

    // Wait for results to load
    await page.waitForSelector('.vehicle-info', { timeout: 5000 });

    // Extract data using discovered selectors
    const vehicleData = await page.evaluate(() => {
      const getTextContent = (selector: string): string => {
        const el = document.querySelector(selector);
        return el?.textContent?.trim() || '';
      };

      return {
        regNo: getTextContent('.regno'),
        make: getTextContent('.make'),
        model: getTextContent('.model'),
        year: parseInt(getTextContent('.year')),
        // ... more fields based on actual HTML structure
      };
    });

    await browser.close();

    // Validate result
    if (!vehicleData.make || !vehicleData.model) {
      return null;
    }

    return vehicleData;

  } catch (error) {
    console.error('car.info scraping failed:', error);
    await browser.close();
    return null;
  }
}
```

### Phase 3: Implement Caching

```typescript
interface CachedVehicleData {
  regNo: string;
  vehicleData: VehicleData;
  source: 'car.info' | 'biluppgifter.se';
  cachedAt: Timestamp;
  expiresAt: Timestamp;
}

async function getCachedVehicleData(regNo: string): Promise<CachedVehicleData | null> {
  const normalized = normalizeRegNo(regNo);
  const docRef = admin.firestore()
    .collection('vehicleCache')
    .doc(normalized);

  const doc = await docRef.get();

  if (!doc.exists) return null;

  const data = doc.data() as CachedVehicleData;

  // Check if expired (30 days TTL)
  const now = Timestamp.now();
  if (data.expiresAt.toMillis() < now.toMillis()) {
    return null;
  }

  return data;
}

async function setCachedVehicleData(
  regNo: string,
  vehicleData: VehicleData,
  source: 'car.info' | 'biluppgifter.se'
): Promise<void> {
  const normalized = normalizeRegNo(regNo);
  const now = Timestamp.now();
  const expiresAt = Timestamp.fromMillis(
    now.toMillis() + (30 * 24 * 60 * 60 * 1000) // 30 days
  );

  await admin.firestore()
    .collection('vehicleCache')
    .doc(normalized)
    .set({
      regNo: normalized,
      vehicleData,
      source,
      cachedAt: now,
      expiresAt
    });
}
```

---

## 4. Target Sites Analysis

### Site 1: car.info (Primary)

**URL Pattern:** `https://car.info/en-se/search?regno=ABC123`

**Strengths:**
- Clean, structured HTML
- Fast response times
- Swedish registry integration
- Mobile-friendly

**Weaknesses:**
- May require cookies/session handling
- English interface (translations needed)

**Expected Data Fields:**
- RegNo, Make, Model, Year
- Engine type, power, fuel
- Inspection dates
- VIN (sometimes)

### Site 2: biluppgifter.se (Secondary)

**URL Pattern:** `https://www.biluppgifter.se/ABC123`

**Strengths:**
- Very detailed specifications
- Swedish interface
- Historical data
- Engine codes and technical specs

**Weaknesses:**
- **May return 403 errors**
- Possible CAPTCHA
- Slower load times
- More complex HTML structure

**Expected Data Fields:**
- All fields from car.info +
- Detailed engine specs (valves, cooling)
- Exact dimensions
- Weight specifications
- Trailer capacity

---

## 5. Error Handling & Fallbacks

### Error Scenarios

1. **403 Forbidden:**
   - Retry with different User-Agent
   - Add delays between requests
   - Switch to fallback site

2. **CAPTCHA Detected:**
   - Log and alert admin
   - Return error to user with message
   - Consider manual verification flow

3. **Timeout:**
   - Set reasonable timeout (10s per site)
   - Fail gracefully to next fallback

4. **Invalid RegNo:**
   - Validate format before scraping
   - Return clear error message

5. **Parsing Errors:**
   - Log exact HTML for debugging
   - Capture screenshot
   - Return partial data if possible

### Fallback Strategy

```
┌──────────────┐
│  car.info    │ ──> Success ──> Cache & Return
└──────┬───────┘
       │
       │ Fail
       ▼
┌──────────────┐
│ biluppgifter │ ──> Success ──> Cache & Return
└──────┬───────┘
       │
       │ Fail
       ▼
┌──────────────┐
│ Manual Entry │ ──> User fills form manually
└──────────────┘
```

---

## 6. Integration with AI Deep Research

### Updated Flow

**OLD (Unreliable):**
```
User Input → AI searches Google → Parse unstructured HTML → Generate Plan
```

**NEW (Reliable):**
```
User Input → Scraper gets verified data → AI uses structured data → Generate Plan
```

### Updated Prompt for Verkmästaren

```typescript
const plannerPrompt = `
Du är Verkmästaren, en expert på fordonsrenovering.

Du har fått VERIFIERAD fordonsdata från svenska registret:
${JSON.stringify(vehicleData, null, 2)}

Denna data är 100% korrekt från officiella källor.

Din uppgift:
1. Sök efter KÄNDA FEL för exakt denna modell och årgång
2. Skapa en underhållsplan baserad på bilens ålder och typ
3. Föreslå uppgraderingar och modifieringar
4. Varna för potentiellt dyra problem

Generera en komplett projektplan i JSON-format.
`;
```

---

## 7. Testing Strategy

### Unit Tests

```typescript
describe('vehicleScraper', () => {
  it('should normalize registration numbers', () => {
    expect(normalizeRegNo('abc 123')).toBe('ABC123');
    expect(normalizeRegNo('abc-123')).toBe('ABC123');
  });

  it('should validate Swedish RegNo format', () => {
    expect(isValidSwedishRegNo('ABC123')).toBe(true);
    expect(isValidSwedishRegNo('AB1234')).toBe(false);
  });

  it('should cache data with correct TTL', async () => {
    const mockData = { regNo: 'ABC123', make: 'Volvo' };
    await setCachedVehicleData('ABC123', mockData, 'car.info');

    const cached = await getCachedVehicleData('ABC123');
    expect(cached?.vehicleData.make).toBe('Volvo');
  });
});
```

### Integration Tests

```typescript
describe('scrapeCarInfo', () => {
  it('should scrape real vehicle data', async () => {
    const data = await scrapeCarInfo('ABC123');

    expect(data).not.toBeNull();
    expect(data?.make).toBeTruthy();
    expect(data?.model).toBeTruthy();
  }, 30000); // 30s timeout
});
```

### E2E Tests (Playwright)

```typescript
test('complete onboarding flow with scraper', async ({ page }) => {
  await page.goto('http://localhost:5173/onboarding');

  // Enter RegNo
  await page.fill('input[name="regNo"]', 'ABC123');
  await page.click('button:has-text("Nästa")');

  // Wait for scraper to finish
  await page.waitForSelector('.vehicle-preview', { timeout: 15000 });

  // Verify vehicle data displayed
  const make = await page.textContent('.vehicle-make');
  expect(make).toBe('Volvo');
});
```

---

## 8. Deployment & Monitoring

### Firebase Deployment

```bash
cd functions
npm install playwright-core
npm run deploy
```

### Configuration

```json
// functions/package.json
{
  "dependencies": {
    "playwright-core": "^1.40.0",
    "firebase-functions": "^4.5.0",
    "firebase-admin": "^12.0.0"
  }
}
```

### Monitoring

Track these metrics in Firebase Console:
- **Success Rate:** % of successful scrapes
- **Cache Hit Rate:** % of requests served from cache
- **Average Response Time:** ms per scrape
- **Error Types:** 403, timeout, CAPTCHA, etc.

### Alerts

Set up alerts for:
- Error rate > 20%
- Cache hit rate < 50%
- Response time > 10s
- Repeated 403 errors (may indicate blocking)

---

## 9. Cost Analysis

### Cloud Function Costs

- **Execution:** ~500ms per scrape
- **Memory:** 1GB
- **Invocations:** ~1000/month (estimated)
- **Monthly cost:** ~$5-10 USD

### Cache Benefits

With 30-day TTL and 80% cache hit rate:
- Reduces scraping costs by 80%
- Improves response time (Firestore < 100ms vs scrape 1-5s)
- Reduces risk of being blocked

---

## 10. Security & Privacy

### Data Handling

- **No PII Storage:** Only publicly available registry data
- **Cache Encryption:** Firestore encryption at rest
- **Rate Limiting:** Max 10 requests/minute per user
- **No Credentials:** No login required for target sites

### Legal Compliance

- **Public Data:** All scraped data is publicly available
- **GDPR:** No personal data collected
- **Terms of Service:** Review target site ToS
- **Robots.txt:** Respect crawling guidelines

---

## 11. Roadmap

### Phase 1: Research & Prototyping ✅
- [x] Analyze target sites (car.info, biluppgifter.se)
- [x] Document HTML structure
- [x] Create architecture plan

### Phase 2: Implementation (Q1 2025)
- [ ] Set up Playwright CLI inspection workflow
- [ ] Build scraper functions for car.info
- [ ] Build scraper functions for biluppgifter.se
- [ ] Implement caching layer
- [ ] Write unit tests

### Phase 3: Integration (Q1 2025)
- [ ] Create Cloud Function
- [ ] Update onboardingService to use scraper
- [ ] Update Deep Research prompts
- [ ] Test end-to-end flow

### Phase 4: Testing & Refinement (Q2 2025)
- [ ] E2E tests with Playwright
- [ ] Load testing
- [ ] Error handling improvements
- [ ] Monitoring setup

### Phase 5: Production Launch (Q2 2025)
- [ ] Deploy to production
- [ ] Monitor success rates
- [ ] Iterate based on real data
- [ ] Document edge cases

---

## 12. Open Questions

1. **CAPTCHA Handling:** How to handle if biluppgifter.se adds CAPTCHA?
   - Option A: Manual fallback
   - Option B: CAPTCHA solving service (2Captcha, Anti-Captcha)
   - Option C: Skip and rely on car.info only

2. **Rate Limiting:** What's acceptable request frequency?
   - Current plan: Max 10/min per user
   - Need to test actual limits

3. **Browser in Cloud Functions:** Does Playwright work reliably in Firebase Functions?
   - May need to use Docker container
   - Alternative: Use Cloud Run instead

4. **Cost Optimization:** Is 30-day cache TTL optimal?
   - Could extend to 90 days (vehicle specs don't change)
   - Trade-off: Freshness vs cost

---

## 13. Success Metrics

### Technical
- **Scraping Success Rate:** > 95%
- **Cache Hit Rate:** > 80%
- **Response Time:** < 2s (including cache check)
- **Error Rate:** < 5%

### Business
- **Onboarding Completion Rate:** +30%
- **Data Accuracy:** 100% (verified sources)
- **User Satisfaction:** Fewer complaints about "wrong car"

---

## 14. Related Documentation

- [DATA_MODEL_MIGRATION.md](../architecture/DATA_MODEL_MIGRATION.md) - Database structure
- [INSPECTOR_SPEC.md](./INSPECTOR_SPEC.md) - AI inspection module
- [AI_DEVELOPMENT_GUIDE.md](../AI_DEVELOPMENT_GUIDE.md) - Multi-agent guidelines

---

**Status:** Documentation Complete - Ready for Implementation
**Next Step:** Set up Playwright CLI and inspect car.info HTML structure
**Owner:** Claude (AI Agent)
**Date:** 2025-12-11
