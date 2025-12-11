# Vehicle Scraper Development Scripts

Interaktiva verktyg för att utveckla och testa vehicle data scraper.

## 🎯 Workflow

### Phase 1: HTML Inspection (Current Phase)

**Mål:** Förstå HTML-strukturen på car.info och biluppgifter.se

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

### Phase 2: Implement Selectors

Efter du dokumenterat selectors, uppdatera:
`functions/src/scraper/vehicleScraper.ts.draft`

```typescript
// Replace placeholder selectors with actual ones from findings
const make = $('dt:contains("Märke")').next('dd').text().trim();
const model = $('dt:contains("Modell")').next('dd').text().trim();
// etc.
```

### Phase 3: Test Scraper

```bash
# Deploy Cloud Function
firebase deploy --only functions:scrapeVehicleData

# Test from frontend
# (eller via curl/Postman)
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
- [ ] Run inspection script
- [ ] Document CSS selectors
- [ ] Test with multiple vehicles
- [ ] Note edge cases (missing data, old vehicles)
- [ ] Screenshot 3-5 different vehicles

### biluppgifter.se
- [ ] Run inspection script
- [ ] Check for CAPTCHA
- [ ] Document if accessible
- [ ] Compare data with car.info
- [ ] Decide if worth implementing (or skip)

### Implementation
- [ ] Update vehicleScraper.ts with real selectors
- [ ] Add error handling for missing fields
- [ ] Test locally
- [ ] Deploy to Cloud Functions
- [ ] Test from frontend

## 🔗 Related Files

- Implementation: `functions/src/scraper/vehicleScraper.ts.draft`
- Types: `functions/src/types/types.ts`
- Deep Research v2: `functions/src/ai/aiDeepResearch_v2.ts.draft`
- Strategy Doc: `docs/analysis/SCRAPER_STRATEGY_ANALYSIS.md`
- Feature Spec: `docs/features/VEHICLE_SCRAPER.md`
