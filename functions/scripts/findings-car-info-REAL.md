# car.info REAL HTML Structure (från faktisk HTML)

**Date:** 2025-12-11
**Test Vehicle:** JSN398 (VW LT Skåpbil 31 2.0, 1976)
**Source:** Real HTML provided by user

---

## ✅ VERIFIED Structure

### "Visa alla fordonsuppgifter" Button

**Selector:**
```css
.expand_list_section[aria-controls="specifications"]
```

**HTML:**
```html
<div class="row expand_list_section mt-1 ms-2"
     role="button"
     aria-expanded="true"
     aria-controls="specifications"
     data-toggle-type="section">
    <div class="btn btn-grey btn-square toggle_expand_btn has_tooltip">
        <span class="icon_toggle_expand"></span>
        <div class="tooltiptext text-nowrap">
            <span class="info_collapsed">Visa alla 105 fordonsuppgifter</span>
            <span class="info_expanded">Dölj alla fordonsuppgifter</span>
        </div>
    </div>
</div>
```

**Playwright Click:**
```typescript
await page.click('.expand_list_section[aria-controls="specifications"]');
```

---

## Main Data Structure: `.sprow`

ALL vehicle specs use this consistent pattern:

```html
<div class="sprow">
    <span class="sptitle">FIELD_NAME</span>
    FIELD_VALUE
    <optional_icon>
</div>
```

### Example Fields:

```html
<!-- Simple text value -->
<div class="sprow">
    <span class="sptitle">Mätarställning</span>
    3&nbsp;362 mil
</div>

<!-- With icon -->
<div class="sprow">
    <span class="sptitle">I trafik</span>
    Nej
    <span class="icon_cross text-danger ms-2"></span>
</div>

<!-- With span wrapper -->
<div class="sprow">
    <span class="sptitle">Effekt</span>
    <span class="ast-i d-inline-flex align-items-center">
        55&nbsp;kW
    </span>
</div>
```

---

## Extraction Strategy

### Method 1: Get ALL .sprow elements

```typescript
const allSpecs = await page.evaluate(() => {
    const specs = [];
    document.querySelectorAll('.sprow').forEach(row => {
        const titleEl = row.querySelector('.sptitle');
        if (!titleEl) return;

        const label = titleEl.textContent.trim();

        // Get value: everything after sptitle, excluding icons
        let value = '';
        const nodes = Array.from(row.childNodes);
        let foundTitle = false;

        for (const node of nodes) {
            if (node === titleEl || node.contains(titleEl)) {
                foundTitle = true;
                continue;
            }
            if (foundTitle) {
                if (node.nodeType === Node.TEXT_NODE) {
                    value += node.textContent.trim() + ' ';
                } else if (node.nodeName === 'SPAN' && !node.classList.contains('icon_')) {
                    value += node.textContent.trim() + ' ';
                }
            }
        }

        value = value.trim();
        if (value) {
            specs.push({ label, value });
        }
    });
    return specs;
});
```

### Method 2: Target Specific Fields

```typescript
// Helper to get spec value by label
function getSpec(label: string): string {
    const rows = document.querySelectorAll('.sprow');
    for (const row of rows) {
        const titleEl = row.querySelector('.sptitle');
        if (titleEl && titleEl.textContent.trim() === label) {
            // Extract value (same logic as above)
            return extractValue(row);
        }
    }
    return '';
}

// Usage:
const make = getSpec('Märke'); // Not directly visible, need H1
const mileage = getSpec('Mätarställning'); // "3 362 mil"
const fuel = getSpec('Bränsle'); // "Bensin"
```

---

## Key Fields Mapping

### Basic Info (Top section)

| Label | Example Value | Selector |
|-------|---------------|----------|
| I trafik | Nej | `.sprow .sptitle:contains("I trafik")` |
| Svensksåld | Ja | `.sprow .sptitle:contains("Svensksåld")` |
| Färg | Flerfärgad | `.sprow .sptitle:contains("Färg")` |
| Antal ägare | 22 | `.sprow .sptitle:contains("Antal ägare")` |
| Mätarställning | 3 362 mil | `.sprow .sptitle:contains("Mätarställning")` |
| Kaross | Lätta nyttofordon | `.sprow .sptitle:contains("Kaross")` |
| Klassificering | Skåpbil | `.sprow .sptitle:contains("Klassificering")` |
| Chassinummer (vin) | 2862500058 | `.sprow .sptitle:contains("Chassinummer")` |

### Motor & Prestanda (Inside #specifications)

| Label | Example Value |
|-------|---------------|
| Effekt | 55 kW |
| Hästkrafter | 75 hk (74 bhp) |
| Motorvolym | 1 984 cc / 2.0 l |
| Motorkod | CH |
| Bränsle | Bensin |
| Tankvolym | 70 l |

### Växellåda & Drivlina

| Label | Example Value |
|-------|---------------|
| Drivlina | Tvåhjulsdrift |
| Växellåda | Manuell, 4-växlad |

### Dimensioner & Vikt

| Label | Example Value |
|-------|---------------|
| Längd | 5 400 mm |
| Bredd | 1 980 mm |
| Tjänstevikt | 2 280 kg |
| Totalvikt | 3 160 kg |

---

## H1 Title (for Make, Model, Year)

```html
<h1 class="my-1 d-inline-block size_h5 fw-normal text-center">
    <span class="licplate license_code_S me-2">
        <span class="plate-country border-1 px-2">S</span>
        <span class="plate-text border-1 px-2 white-plate">JSN398</span>
    </span>
    <a href="..." class="ident_name text-light">
        Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976
    </a>
</h1>
```

**Parsing:**
```typescript
const h1Link = $('h1 a.ident_name').text().trim();
// "Volkswagen LT Skåpbil 31 2.0 Manuell, 75hk, 1976"

// Parse pattern: {Make} {Model} {BodyType} {Variant} {Transmission}, {Power}, {Year}
const match = h1Link.match(/^(\w+)\s+([\w\s]+?)\s+Skåpbil\s+(.*?)\s+(\w+),\s+(\d+)hk,\s+(\d{4})$/);
if (match) {
    const [, make, model, variant, transmission, power, year] = match;
    // make: "Volkswagen"
    // model: "LT"
    // variant: "31 2.0"
    // transmission: "Manuell"
    // power: "75"
    // year: "1976"
}
```

---

## Complete Scraping Function (Cheerio)

```typescript
import * as cheerio from 'cheerio';

async function scrapeCarInfo(regNo: string): Promise<VehicleData | null> {
    const url = `https://www.car.info/sv-se/license-plate/S/${regNo}`;

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Rate limit check
    if (html.includes('Kaffepaus')) {
        throw new Error('RATE_LIMITED');
    }

    // Helper to get spec value
    const getSpec = (label: string): string => {
        let result = '';
        $('.sprow').each((i, el) => {
            const titleEl = $(el).find('.sptitle');
            if (titleEl.text().trim() === label) {
                // Get text content, excluding icons
                const allText = $(el).clone().find('.icon_').remove().end().text();
                result = allText.replace(titleEl.text(), '').trim();
                return false; // break
            }
        });
        return result;
    };

    // Parse H1 for basic info
    const h1Text = $('h1 a.ident_name').text().trim();
    const h1Match = h1Text.match(/^(\w+)\s+([\w\s]+?)\s+Skåpbil\s+(.*?)\s+(\w+),\s+(\d+)hk,\s+(\d{4})$/);

    const vehicleData: VehicleData = {
        regNo: regNo,
        make: h1Match ? h1Match[1] : '',
        model: h1Match ? h1Match[2].trim() : '',
        year: h1Match ? parseInt(h1Match[6]) : 0,

        // From .sprow elements
        mileage: getSpec('Mätarställning'),
        bodyType: getSpec('Kaross'),
        classification: getSpec('Klassificering'),
        vin: getSpec('Chassinummer (vin)'),
        color: getSpec('Färg'),
        fuel: getSpec('Bränsle'),
        gearbox: getSpec('Växellåda'),
        drive: getSpec('Drivlina'),

        // Weights (need parsing)
        curbWeight: parseWeight(getSpec('Tjänstevikt')),
        totalWeight: parseWeight(getSpec('Totalvikt')),

        // etc...
    };

    return vehicleData;
}

function parseWeight(str: string): number {
    // "2 280 kg" -> 2280
    return parseInt(str.replace(/[^\d]/g, '')) || 0;
}
```

---

## Data Cleaning Patterns

### Numbers with Spaces
- `"3 362 mil"` → `3362`
- `"2 280 kg"` → `2280`
- `"55 kW"` → `55`

**Parser:**
```typescript
function parseSwedishNumber(str: string): number {
    const cleaned = str.replace(/[^\d]/g, '');
    return parseInt(cleaned, 10) || 0;
}
```

### Special Characters
- `&nbsp;` appears in HTML
- Cheerio converts to regular spaces automatically

### Multiple Values
- `"Bensin, 2.0 (75 hk)"` → Split by `, ` or ` `

---

## Next Steps

1. ✅ **Button selector confirmed:** `.expand_list_section[aria-controls="specifications"]`
2. ✅ **Data structure confirmed:** All specs in `.sprow` with `.sptitle` pattern
3. ✅ **H1 parsing pattern:** Known format for make/model/year
4. ⏳ **Update vehicleScraper.ts.draft** with real selectors
5. ⏳ **Test with Cheerio** (no need for Playwright browser!)

---

## Critical Discovery: Cheerio is ENOUGH!

**We don't need Playwright headless browser for car.info!**

The "Visa alla 105 fordonsuppgifter" button is **client-side JavaScript** only.
The HTML already contains ALL 105 specs in the source - they're just hidden with CSS!

**Proof:**
Looking at the HTML, ALL `.sprow` elements are present, including those "inside" the collapsed section.

**Implication:**
- ✅ Use simple `fetch()` + Cheerio (FAST, cheap, no browser needed)
- ✅ No need to click button
- ✅ No rate limiting from browser automation detection
- ✅ Simpler deployment (no Chromium binary)

---

## Recommended Implementation

```typescript
// Simple, fast, reliable
import * as cheerio from 'cheerio';

async function scrapeCarInfo(regNo: string): Promise<VehicleData> {
    const response = await fetch(`https://www.car.info/sv-se/license-plate/S/${regNo}`);
    const html = await response.text();
    const $ = cheerio.load(html);

    // All data is already in HTML - no JavaScript needed!
    return extractVehicleData($);
}
```

**No Playwright needed!** 🎉
