# Vehicle Scraper Development Scripts

Interaktiva verktyg för att utveckla och testa vehicle data scraper.

## 🎯 Workflow

### Phase 1: HTML Inspection ✅ COMPLETED

**Mål:** Förstå HTML-strukturen på car.info och biluppgifter.se

**Status:** DONE - Real HTML analyzed from user-provided source (JSN398)

#### 1. Kör inspection-scriptet

```bash
cd functions
node scripts/inspect-scraper.js JSN398
```

**Detta kommer:**
- ✅ Öppna en browser med car.info
- ✅ Visa sidan i slow-motion
- ✅ Logga HTML-struktur till console
- ✅ Identifiera CSS-klasser
- ✅ Hitta dt/dd-par (data fields)
- ✅ Ta screenshot (sparas i `scripts/screenshots/`)
- ✅ Pausa så du kan inspektera sidan manuellt

#### 2. Inspektera manuellt

När browser-fönstret är öppet:

1. **Högerklicka → Inspect** på olika element
2. **Dokumentera CSS-selectors** för viktiga fält:
   - Märke (make)
   - Modell (model)
   - År (year)
   - Motor (engine)
   - etc.

3. **Notera data-format:**
   - "2 280 kg" (behöver parseSwedishNumber)
   - "13 aug 2025" (behöver parseSwedishDate)
   - "10W-40" (kan användas direkt)

#### 3. Dokumentera findings

Skapa en fil: `scripts/findings-car-info.md`

```markdown
# car.info Findings

## URL Pattern
https://www.car.info/sv-se/license-plate/S/{REGNO}

## CSS Selectors

### Vehicle Title
- **Selector:** `h1.vehicle-title`
- **Example:** "VOLVO 240 1990"
- **Format:** "{MAKE} {MODEL} {YEAR}"

### Data Fields (dt/dd structure)

| Field | dt selector | dd selector | Example |
|-------|-------------|-------------|---------|
| Märke | dt:contains("Märke") | dt:contains("Märke") + dd | "Volvo" |
| Modell | dt:contains("Modell") | dt:contains("Modell") + dd | "240" |
| Årsmodell | dt:contains("Årsmodell") | dt:contains("Årsmodell") + dd | "1990" |
| ... | ... | ... | ... |

## Notes
- Site uses <dl><dt><dd> structure for specs
- Dates in Swedish format: "13 aug 2025"
- Numbers with spaces: "2 280 kg"
- No CAPTCHA detected
- Fast response (~500ms)
```

### Phase 2: Implement Selectors ✅ COMPLETED

**Status:** DONE - Real selectors implemented based on HTML analysis

Key discoveries from real HTML (findings-car-info-REAL.md):
- ✅ All specs use `.sprow` class with `.sptitle` for labels
- ✅ H1 format: "Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976"
- ✅ All 105 specs already in HTML source (CSS hidden) - NO PLAYWRIGHT NEEDED!
- ✅ Simple Cheerio is sufficient for scraping

Implementation complete in: `functions/src/scraper/vehicleScraper.ts.draft`

```typescript
// Real implementation using verified selectors
const getSpec = (label: string): string => {
    let result = '';
    $('.sprow').each((_, el) => {
        const titleEl = $(el).find('.sptitle');
        if (titleEl.text().trim() === label) {
            const clone = $(el).clone();
            clone.find('.icon_').remove();
            clone.find('.sptitle').remove();
            result = clone.text().trim();
            return false;
        }
    });
    return result;
};
```

### Phase 3: Test Scraper (Current Phase)

#### Local Testing

```bash
cd functions
node scripts/test-scraper.js JSN398
```

This will:
- ✅ Fetch live data from car.info
- ✅ Parse using real selectors
- ✅ Display extracted data with coverage statistics
- ✅ Validate scraper logic without deploying

**Alternative:** Use mock HTML to avoid rate limiting:
```bash
# Edit test-scraper.js and set:
USE_MOCK_HTML: true
```

#### Deploy to Cloud Functions

```bash
# When ready for production
firebase deploy --only functions:scrapeVehicleData

# Test from frontend or via curl
```

## 📸 Screenshots

Alla screenshots sparas i: `functions/scripts/screenshots/`

Använd dessa för att:
- Jämföra olika fordon
- Se förändringar i HTML-struktur över tid
- Dela med team

## 🧪 Test RegNos

Använd dessa regnummer för testning:

| RegNo | Vehicle | Status | Notes |
|-------|---------|--------|-------|
| JSN398 | VW LT31 1976 | ✅ Real | Bra för testning |
| ABC123 | Unknown | ❓ Test | Testar "not found" |
| XYZ999 | Unknown | ❓ Test | Testar edge cases |

## 🚨 Troubleshooting

### Error: "Browser not found"

```bash
cd functions
npx playwright install chromium
```

### Error: "CAPTCHA detected"

- Detta är förväntat för biluppgifter.se
- Använd car.info som primär källa
- Dokumentera CAPTCHA-beteende för framtida fallback-strategi

### Error: "403 Forbidden"

- Site blockerar automated access
- Prova med annan User-Agent
- Lägg till delays mellan requests
- Överväg att kontakta site för API-access

## 📋 Checklist

### car.info
- [x] Run inspection script
- [x] Document CSS selectors (findings-car-info-REAL.md)
- [x] Analyze real HTML from user-provided source
- [x] Discover .sprow pattern for all 105 specs
- [x] Confirm NO PLAYWRIGHT needed (all data in HTML source)
- [x] Document rate limiting ("Kaffepaus" screen)
- [ ] Test with multiple vehicles (pending rate limit cooldown)
- [ ] Screenshot 3-5 different vehicles

### biluppgifter.se
- [ ] Run inspection script (low priority - fallback only)
- [ ] Check for CAPTCHA
- [ ] Document if accessible
- [ ] Compare data with car.info
- [ ] Decide if worth implementing (or skip)

### Implementation
- [x] Update vehicleScraper.ts with real selectors
- [x] Implement getSpec() helper using .sprow pattern
- [x] Add H1 parsing for make/model/year
- [x] Add error handling for missing fields
- [x] Add rate limit detection
- [x] Create test-scraper.js for local testing
- [ ] Test locally with real data (pending rate limit)
- [ ] Create mock HTML file for development
- [ ] Deploy to Cloud Functions
- [ ] Test from frontend
- [ ] Monitor cache hit rates in production

## 🔗 Related Files

### Implementation
- **Scraper:** `functions/src/scraper/vehicleScraper.ts.draft` ✅ UPDATED with real selectors
- **Deep Research v2:** `functions/src/ai/aiDeepResearch_v2.ts.draft` (scraper integration)
- **Types:** `functions/src/types/types.ts`

### Scripts
- **Test Scraper:** `scripts/test-scraper.js` ✅ NEW - Local testing tool
- **HTML Inspector:** `scripts/inspect-scraper.js` (browser automation)

### Documentation
- **Real HTML Analysis:** `scripts/findings-car-info-REAL.md` ✅ CRITICAL - Verified selectors
- **Initial Findings:** `scripts/findings-car-info.md` (preliminary analysis)
- **Next Steps:** `scripts/NEXT_STEPS.md` (strategy & options)
- **Strategy Doc:** `docs/analysis/SCRAPER_STRATEGY_ANALYSIS.md`
- **Feature Spec:** `docs/features/VEHICLE_SCRAPER.md`
