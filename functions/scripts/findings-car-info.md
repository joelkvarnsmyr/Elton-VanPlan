# car.info HTML Structure Findings

**Date:** 2025-12-11
**Test Vehicle:** JSN398 (VW LT Skåpbil 31 2.0, 1976)
**URL:** https://www.car.info/sv-se/license-plate/S/JSN398

---

## Page Structure

### Main Heading (H1)
```
SJSN398Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976
```

**Pattern:** `{PREFIX}{REGNO}{Make} {Model} {BodyType} {ModelVariant} {Transmission}, {Power}, {Year}`

**Parsing Strategy:**
```typescript
const h1Text = $('h1').text().trim();
// Need to extract:
// - RegNo after first 'S'
// - Make, Model, Year from rest of string
```

### HTML Structure

car.info uses **TABLE-based layout**, NOT dt/dd definition lists.

**Total tables found:** 2

1. **Table 0** - Vehicle History (Mätarställning, Kontrollbesiktning)
2. **Table 1** - Sales/Market data

**Missing:** The main "Fordonsuppgifter" (vehicle specifications) table is NOT in standard <table> format!

### Likely DOM Structure for Specifications

Based on screenshot, the "Fordonsuppgifter" section appears to be:
- A custom grid layout (CSS grid or flexbox)
- NOT a semantic HTML table
- Possibly using divs with specific classes

**Key Classes to Investigate:**
- `.vehicle-specs`
- `.spec-item`
- `.spec-label` / `.spec-value`
- Or similar naming patterns

---

## Data Extraction Strategy

### Option 1: Parse from H1 Title

The H1 contains most basic info:
```typescript
const h1 = $('h1').text().trim();

// Example: "SJSN398Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976"
const regNo = 'JSN398'; // Extract after first 'S'
const parts = h1.split(/\s+/);

// Make: "Volkswagen"
// Model: "LT"
// Body Type: "Skåpbil"
// Variant: "31 2.0"
// Transmission: "Manuell"
// Power: "75hk"
// Year: "1976"
```

### Option 2: Find Specification Grid/Divs

Need to inspect browser DOM to find:
```typescript
// Possible selectors (need to verify)
const make = $('.spec-make').text();
const model = $('.spec-model').text();
// etc.
```

### Option 3: Use Tables for Historical Data

Tables 0 and 1 contain:
- Inspection history (mileage at each inspection)
- Current estimated mileage
- Sales listings

**Example extraction:**
```typescript
// Table 0: Inspection history
const inspections = [];
$('table').first().find('tr').each((i, row) => {
  const cells = $(row).find('td');
  if (cells.length >= 2) {
    inspections.push({
      event: $(cells[0]).text().trim(),
      mileage: $(cells[1]).text().trim()
    });
  }
});

// Current mileage is usually first row
const currentMileage = inspections[0]?.mileage; // "ca 3 412 mil"
```

---

## Data Format Patterns

### Numbers with Spaces
- `"ca 3 412 mil"` → Need `parseSwedishNumber()` → `3412`
- `"75hk"` → `75`
- `"2 280 kg"` → `2280`

### Dates
- Not found in tables yet
- Likely in Swedish format: `"13 aug 2025"`

### Power/Engine
- `"75hk"` (hästkrafter)
- `"2.0"` (liters)

---

## Missing Data

From inspection, we did NOT find standard table rows for:
- ❌ Märke (Make)
- ❌ Modell (Model)
- ❌ År (Year)
- ❌ Motorvolym (Engine volume)
- ❌ Bränsle (Fuel type)
- ❌ Färg (Color)
- ❌ VIN
- ❌ Besiktningsdatum (Inspection date)

**Conclusion:** These fields are likely in a NON-TABLE layout that we need to find.

---

## Next Steps

### 1. Manual Browser Inspection

**Required:**
- Open browser DevTools
- Find the "Fordonsuppgifter" section
- Inspect actual DOM structure
- Document CSS selectors

**Run:**
```bash
node scripts/inspect-scraper.js JSN398
# When browser opens, right-click "Fordonsuppgifter" → Inspect
```

### 2. Update Scraper Logic

Once selectors are found, update `vehicleScraper.ts.draft`:
```typescript
// Replace placeholder selectors with actual ones
const make = $('ACTUAL_SELECTOR_HERE').text().trim();
const model = $('ACTUAL_SELECTOR_HERE').text().trim();
// etc.
```

### 3. Alternative: Use H1 Parsing

If specification section is too complex, we can extract basics from H1:
```typescript
function parseCarInfoH1(h1Text: string) {
  // Extract: RegNo, Make, Model, Year, Power
  // Good enough for MVP
}
```

### 4. Test with Multiple Vehicles

Test with different vehicles to validate pattern consistency:
- VW LT (JSN398) ✅
- Volvo 240 (different RegNo)
- Modern car (newer than 2000)
- Edge case: Very old car (pre-1970)

---

## Screenshot Analysis

From `car-info-JSN398.png`:

**Visible sections:**
1. **Top blue bar** - License plate "JSN398"
2. **Fordonsuppgifter** - Table-like grid (custom layout?)
3. **Registreringsuppgifter** - Registration info
4. **Graph/Timeline** - Visual history
5. **Detailed specs grid** - Many small boxes with data

**Critical:** The main specs are in a GRID layout, not a <table>.

---

## Recommended Approach

### Short-term (MVP)
Parse H1 + inspection history from tables:
- RegNo, Make, Model, Year, Power from H1
- Current mileage from Table 0
- ✅ Fast to implement
- ✅ Works for most cases

### Long-term (Complete)
Map all grid items using proper selectors:
- Find CSS selectors for each spec field
- Extract all available data
- ✅ More robust
- ❌ More complex

---

## Open Questions

1. **Is car.info structure consistent across all vehicles?**
   - Need to test with 5-10 different cars

2. **Does structure change for old vs new cars?**
   - JSN398 is from 1976 - test with 2020+ car

3. **Are there any CAPTCHA or rate limits?**
   - No CAPTCHA observed so far
   - Need to test 10+ rapid requests

4. **Can we get VIN from this page?**
   - Not visible in current screenshot
   - May be in collapsed section or separate tab

---

**Status:** Ready for manual browser inspection
**Next:** Inspect DOM to find spec grid selectors
