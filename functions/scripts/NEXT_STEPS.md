# Vehicle Scraper - Next Steps

**Date:** 2025-12-11
**Status:** Development Phase - Rate Limiting Discovery

---

## 🚨 Critical Discovery: car.info Rate Limiting

Vi har upptäckt att car.info implementerar aggressiv **rate limiting** ("Kaffepaus"-skärm).

**Impact:**
- ❌ Rapid testing impossible
- ❌ Cannot inspect multiple vehicles quickly
- ✅ Bekräftar att caching är KRITISKT
- ✅ Motiverar biluppgifter.se som fallback

---

## Reviderad Strategi

### Option A: Fortsätt med car.info (Långsam men pålitlig)

**Approach:**
1. Vänta 10-15 minuter mellan test-runs
2. Implementera exponential backoff vid rate limit
3. Använd Firestore cache aggressivt (30-dag TTL)
4. Lägg till randomized delays (5-10s mellan requests)

**Pros:**
- ✅ Renast data-struktur (när vi väl får tillgång)
- ✅ Svensk källa
- ✅ Snabb respons (när inte blockad)

**Cons:**
- ❌ Svår att utveckla mot (rate limits)
- ❌ Risk för blocks i produktion
- ❌ Långsam onboarding för nya fordon

### Option B: Byt till biluppgifter.se som primär

**Approach:**
1. Fokusera utveckling på biluppgifter.se
2. Använd car.info endast som fallback
3. Acceptera eventuell CAPTCHA på biluppgifter.se

**Pros:**
- ✅ Fler detaljer (tekniska specifikationer)
- ✅ Eventuellt mer förlåtande rate limits

**Cons:**
- ❌ Ofta 403 errors enligt tidigare forskning
- ❌ Potential CAPTCHA
- ❌ Oförutsägbar tillgänglighet

### Option C: Hybrid + AI Fallback (Rekommenderat)

**Approach:**
1. **Primary:** Firestore cache (instant för återkommande fordon)
2. **Secondary:** car.info (med intelligent rate limit handling)
3. **Tertiary:** biluppgifter.se (vid car.info failure)
4. **Final fallback:** AI Google Search (redan implementerat i v1)

**Implementation:**
```typescript
async function getVehicleData(regNo: string): Promise<VehicleData> {
  // 1. Check cache (>80% hit rate expected)
  const cached = await getCache(regNo);
  if (cached) return cached;

  // 2. Try car.info (with rate limit detection)
  try {
    const data = await scrapeCarInfo(regNo);
    if (data) {
      await setCache(regNo, data, 30); // 30 days
      return data;
    }
  } catch (error) {
    if (error.message === 'RATE_LIMITED') {
      console.log('⏰ Rate limited, trying fallback...');
    }
  }

  // 3. Try biluppgifter.se
  try {
    const data = await scrapeBiluppgifter(regNo);
    if (data) {
      await setCache(regNo, data, 30);
      return data;
    }
  } catch (error) {
    console.log('Biluppgifter failed:', error);
  }

  // 4. AI fallback (Detective agent from v1)
  console.log('All scrapers failed - using AI search...');
  return await aiDetectiveSearch(regNo);
}
```

**Pros:**
- ✅ Bästa av alla världar
- ✅ Hög success rate (cache + 3 fallbacks)
- ✅ Snabb för återkommande fordon (cache)
- ✅ Fungerar även när scraping misslyckas (AI)

**Cons:**
- ⚠️ Mer komplex implementation
- ⚠️ Behöver underhålla 3 olika datakällor

---

## Konkret Action Plan (Option C)

### Phase 1: Cache-First Architecture ✅

**Status:** Already designed in vehicleScraper.ts.draft

```typescript
// Firestore cache structure
{
  regNo: 'JSN398',
  vehicleData: { ... },
  source: 'car.info',
  cachedAt: Timestamp,
  expiresAt: Timestamp // +30 days
}
```

### Phase 2: Rate Limit Handling ✅

**Status:** Detection added in vehicleScraper.ts.draft

```typescript
if (html.includes('Kaffepaus')) {
  throw new Error('RATE_LIMITED');
}
```

**TODO:**
- [ ] Add exponential backoff
- [ ] Implement retry queue (background job)
- [ ] Alert admin if repeated rate limits

### Phase 3: Manual HTML Inspection (BLOCKED)

**Status:** ⏸️ Paused due to rate limiting

**Workaround:**
1. Wait 30 minutes
2. Open browser MANUALLY (not via script)
3. Visit: https://www.car.info/sv-se/license-plate/S/JSN398
4. Right-click → Inspect
5. Document selectors in findings-car-info.md

**Alternative:**
- Use a different IP (mobile hotspot, VPN)
- Test during off-peak hours (night?)
- Contact car.info for API access

### Phase 4: biluppgifter.se Implementation

**Priority:** Medium (fallback only)

1. Wait for rate limit cooldown
2. Test biluppgifter.se with Playwright
3. Check for CAPTCHA
4. Document HTML structure
5. Implement scraper as fallback

### Phase 5: Integration & Testing

**When:** After we have working selectors

1. Update aiDeepResearch_v2.ts to use scraper
2. Deploy Cloud Function
3. Test from frontend
4. Monitor cache hit rate
5. Measure success rate vs AI-only approach

---

## Immediate Next Steps (Today/Tomorrow)

### 1. Wait for Rate Limit Cooldown ⏰

**Duration:** 30-60 minutes
**Do:** Take a break, work on other features

### 2. Manual Browser Inspection (No Script)

**Goal:** Get actual HTML selectors without triggering rate limit

```bash
# DON'T run script yet - do manual inspection
# 1. Open browser
# 2. Visit car.info/sv-se/license-plate/S/JSN398
# 3. Inspect "Fordonsuppgifter" section
# 4. Document selectors
```

### 3. Update Scraper with Real Selectors

Once we have selectors from manual inspection:

```typescript
// Example (replace placeholders)
const make = $('div.spec-make span.value').text();
const model = $('div.spec-model span.value').text();
// etc.
```

### 4. Test Locally with Cache

```bash
# Create mock cache entry to avoid hitting car.info
# Test scraper logic with cached data
```

### 5. Consider Alternative: Mock Data for Development

Create a `mock-responses/` folder with saved HTML:

```typescript
// For development only
const mockHtml = fs.readFileSync('mock-responses/JSN398.html');
const $ = cheerio.load(mockHtml);
// Develop scraping logic without hitting live site
```

---

## Questions for Product Decision

### Q1: Hur viktigt är 100% automation?

**Options:**
- A) CRITICAL - Vi måste ha fullständig automation
  - → Fortsätt med scraper-utveckling trots rate limits
- B) NICE TO HAVE - Manual entry är okej som fallback
  - → Använd AI + manual entry, skippa scraping

### Q2: Kan vi acceptera AI "hallucinations"?

**Context:** AI söker och gissar data när scraping misslyckas

**Options:**
- A) NEJ - Data MÅSTE vara 100% verifierad
  - → Scraping är kritiskt, AI endast för analys
- B) JA - AI-data är okej med disclaimer
  - → Använd AI med "⚠️ Ej verifierad data" varning

### Q3: Budget för API-access?

**car.info kanske har betald API:**

**Question:** Vill vi kontakta car.info och fråga om API-access?

**Cost estimate:** ~500-2000 SEK/månad (gissning)
**Benefit:** Ingen rate limiting, strukturerad JSON, support

---

## Recommended Path Forward

**My Recommendation: Option C (Hybrid)**

1. ✅ **Cache-first** (redan designat)
2. ✅ **car.info scraping** (med intelligent rate limit handling)
3. ✅ **biluppgifter.se fallback** (implement senare)
4. ✅ **AI final fallback** (redan finns i v1)

**Why:**
- Hög success rate (4 nivåer av fallbacks)
- Snabb för de flesta users (cache hit rate >80%)
- Fungerar även vid scraper-failures
- Framtidssäker (kan lägga till fler källor)

**Next immediate action:**
1. Vänta 30 min för rate limit cooldown
2. Manuell browser inspection (inte via script)
3. Dokumentera selectors
4. Implementera scraper med realistiska selectors
5. Testa med mock data först

---

**Status:** Awaiting rate limit cooldown + manual inspection
**Blocker:** car.info rate limiting
**Workaround:** Manual inspection + mock data development
**ETA:** Ready to implement after selectors documented (~1-2 hours)
