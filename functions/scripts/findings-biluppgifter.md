# biluppgifter.se REAL HTML Structure

**Date:** 2025-12-11
**Test Vehicle:** JSN398 (VW LT 31 Skåp, 1976)
**Source:** Real HTML provided by user

---

## ✅ VERIFIED Structure

### Main Data Pattern: `<ul class="list">` with `<li>` items

ALL vehicle data uses this consistent pattern:

```html
<ul class="list">
    <li>
        <span class="label">FIELD_NAME</span>
        <span class="value">FIELD_VALUE</span>
    </li>
</ul>
```

### Example Fields:

```html
<!-- Simple value -->
<li>
    <span class="label">Registreringsnummer</span>
    <span class="value">JSN398</span>
</li>

<!-- With link -->
<li>
    <span class="label">Försäkring</span>
    <span class="value">
        <a href="..." target="_blank">Jämför försäkring</a>
    </span>
</li>
```

---

## H1 Title Structure

```html
<h1>Volkswagen LT 31 Skåp</h1>
```

Pattern: `{Make} {Model}`

More detailed info in bar summary:
```html
<div class="info">
    <h1>Volkswagen LT 31 Skåp</h1>
    <span>JSN398 - 2862500058</span>
</div>
```

---

## Section IDs

Data is organized in collapsible sections:

- `#vehicle-data` - Fordonsdata (basic vehicle info)
- `#owner-history` - Ägarhistorik (requires login)
- `#meter-history` - Mätarställning (odometer history)
- `#valuation` - Värdering (valuation)
- `#history-log` - Historik (event timeline)
- `#technical-data` - Teknisk data (technical specifications)
- `#test-data` - Testdata (test results)

---

## Field Mappings

### Basic Info (`#vehicle-data`)

| Label | Example Value | Notes |
|-------|---------------|-------|
| Registreringsnummer | JSN398 | |
| Chassinr / VIN | 2862500058 | |
| Fabrikat | Volkswagen | |
| Modell | LT 31 Skåp | |
| Fordonsår / Modellår | 1976 / 1976 | |
| Status | Avställd | |
| Först registrerad | 1978-02-14 | |
| Antal ägare | 22 | |
| Mätarställning (besiktning) | 3 368 mil | |

### Technical Data (`#technical-data`)

| Label | Example Value |
|-------|---------------|
| Motoreffekt | 75 HK / 55 kW |
| Drivmedel | Bensin |
| Växellåda | Manuell |
| Färg | Flerfärgad |
| Längd | 5400 mm |
| Bredd | 1980 mm |
| Tjänstevikt | 2280 kg |
| Totalvikt | 3160 kg |
| Lastvikt | 880 kg |
| Släpvagnsvikt | 1400 kg |

### Meter History (`#meter-history`)

Timeline structure:
```html
<ul id="meter-timeline" class="grow timeline">
    <li class="prediction">
        <h3>Uppskattning<span class="numb">3 386 mil<em>2025-11-04</em></span></h3>
    </li>
    <li class="inspection">
        <h3>Besiktning<span class="numb">3 362 mil<em>2025-08-13</em></span></h3>
    </li>
</ul>
```

Event types: `prediction`, `inspection`, `registration`

### History Log (`#history-log`)

Timeline with event types:
- `changedstatus` - Traffic status changed
- `inspection` - Inspection completed
- `changedowner` - Owner changed
- `register` - First registration
- `preregister` - Pre-registration

---

## Extraction Strategy

### Method 1: Get ALL list items

```typescript
const getSpec = (label: string): string => {
    let result = '';
    $('ul.list li').each((_, li) => {
        const $li = $(li);
        const labelEl = $li.find('.label');
        const valueEl = $li.find('.value');

        if (labelEl.text().trim() === label) {
            // Remove any nested links/icons, get just text
            result = valueEl.clone().find('a').remove().end().text().trim();
            return false; // break
        }
    });
    return result;
};
```

### Method 2: Section-specific extraction

```typescript
// Get data from specific section
const getSpecFromSection = (sectionId: string, label: string): string => {
    let result = '';
    $(`#${sectionId} ul.list li`).each((_, li) => {
        const $li = $(li);
        const labelEl = $li.find('.label');
        const valueEl = $li.find('.value');

        if (labelEl.text().trim() === label) {
            result = valueEl.text().trim();
            return false;
        }
    });
    return result;
};
```

---

## Complete Field List

### From `#vehicle-data`:
- Registreringsnummer
- Chassinr / VIN
- Fabrikat
- Modell
- Fordonsår / Modellår
- Motorkod (requires login)
- Tecdoc ID (requires login)
- Status
- Import / Införsel
- Först registrerad
- Trafik i Sverige
- Antal ägare
- Senaste ägarbyte
- Senast besiktigad
- Mätarställning (besiktning)
- Nästa besiktning senast
- Miljöklass
- Utsläppsklass
- Årlig skatt
- Skattemånad
- Kreditköp
- Leasad

### From `#technical-data`:
- Motoreffekt
- Motorvolym
- Toppfart
- Drivmedel
- Växellåda
- Fyrhjulsdrift
- Ljudnivå körning
- Passagerare
- Draganordning
- Färg
- Kaross
- Längd
- Bredd
- Höjd
- Tjänstevikt
- Totalvikt
- Lastvikt
- Släpvagnsvikt
- Släp totalvikt (B)
- Släp totalvikt (B+)
- Antal axlar
- Axelavstånd
- Däck fram
- Däck bak
- Fordonskategori EU
- Kväveoxider, NOX

---

## Odometer Timeline Extraction

```typescript
interface MeterEvent {
    type: 'prediction' | 'inspection' | 'registration';
    value: number; // in km (multiply mil by 10)
    date: string;
}

const getMeterHistory = (): MeterEvent[] => {
    const events: MeterEvent[] = [];

    $('#meter-timeline li').each((_, li) => {
        const $li = $(li);
        const type = $li.attr('class') as 'prediction' | 'inspection' | 'registration';
        const text = $li.find('h3 .numb').text();

        // Parse "3 362 mil<em>2025-08-13</em>"
        const parts = $li.find('h3 .numb').html().split('<em>');
        const mileage = parts[0].trim(); // "3 362 mil"
        const dateHtml = parts[1]; // "2025-08-13</em>"
        const date = dateHtml.replace('</em>', '').trim();

        // Convert "3 362 mil" to number
        const value = parseInt(mileage.replace(/[^\d]/g, '')) * 10; // km

        events.push({ type, value, date });
    });

    return events;
};
```

---

## Important Notes

1. **NO CAPTCHA detected** in this HTML sample
2. **Login required** for:
   - Ägarhistorik (owner history)
   - Motorkod
   - Tecdoc ID
   - Full servicehistorik

3. **Data availability**:
   - ✅ Basic vehicle info - AVAILABLE
   - ✅ Technical specs - AVAILABLE
   - ✅ Mileage history - AVAILABLE
   - ✅ Event timeline - AVAILABLE
   - ❌ Owner details - REQUIRES LOGIN
   - ❌ Engine code - REQUIRES LOGIN

4. **Comparison with car.info**:
   - biluppgifter.se has MORE structured data
   - Easier to parse (consistent list pattern)
   - Better section organization
   - More detailed mileage history
   - Complete event timeline

---

## Recommended Implementation

```typescript
import * as cheerio from 'cheerio';

async function scrapeBiluppgifter(regNo: string): Promise<Partial<VehicleData> | null> {
    const url = `https://biluppgifter.se/fordon/${regNo.toLowerCase()}/`;

    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    // Check for CAPTCHA or errors
    if (html.includes('captcha') || html.includes('Verifiera')) {
        throw new Error('CAPTCHA_REQUIRED');
    }

    // Helper function
    const getSpec = (label: string): string => {
        let result = '';
        $('ul.list li').each((_, li) => {
            const labelText = $(li).find('.label').text().trim();
            if (labelText === label) {
                result = $(li).find('.value').clone().find('a').remove().end().text().trim();
                return false;
            }
        });
        return result;
    };

    // Parse H1 for make/model
    const h1 = $('h1').first().text().trim(); // "Volkswagen LT 31 Skåp"
    const [make, ...modelParts] = h1.split(' ');

    // Extract data
    const vehicleData: Partial<VehicleData> = {
        regNo: regNo,
        make: make || getSpec('Fabrikat'),
        model: modelParts.join(' ') || getSpec('Modell'),
        vin: getSpec('Chassinr / VIN'),

        // Parse year (format: "1976 / 1976")
        year: parseInt(getSpec('Fordonsår / Modellår').split('/')[0].trim()) || 0,

        status: getSpec('Status'),
        regDate: getSpec('Först registrerad'),
        bodyType: getSpec('Kaross'),
        color: getSpec('Färg'),

        // Engine
        engine: {
            fuel: getSpec('Drivmedel'),
            power: getSpec('Motoreffekt'),
            volume: getSpec('Motorvolym')
        },

        gearbox: getSpec('Växellåda'),

        // Dimensions
        dimensions: {
            length: parseSwedishNumber(getSpec('Längd')),
            width: parseSwedishNumber(getSpec('Bredd')),
            height: getSpec('Höjd'),
            wheelbase: parseSwedishNumber(getSpec('Axelavstånd'))
        },

        // Weights
        weights: {
            curb: parseSwedishNumber(getSpec('Tjänstevikt')),
            total: parseSwedishNumber(getSpec('Totalvikt')),
            load: parseSwedishNumber(getSpec('Lastvikt')),
            trailer: parseSwedishNumber(getSpec('Släpvagnsvikt')),
            trailerB: 0 // Calculate from B-limit
        },

        // History
        history: {
            owners: parseInt(getSpec('Antal ägare')) || 0,
            lastOwnerChange: getSpec('Senaste ägarbyte'),
            events: 0
        },

        // Inspection
        inspection: {
            last: getSpec('Senast besiktigad'),
            next: getSpec('Nästa besiktning senast'),
            mileage: getSpec('Mätarställning (besiktning)')
        }
    };

    return vehicleData;
}
```

---

## Next Steps

1. ✅ Update scrapeBiluppgifter() in vehicleScraper.ts.draft - COMPLETED
2. ✅ Create realistic test script - COMPLETED (test-scraper-realistic.js)
3. ⏳ Test with real data (multiple vehicles)
4. ⏳ Handle edge cases (missing fields, login requirements)
5. ⏳ Compare data quality with car.info
6. ⏳ Decide primary/fallback strategy (currently: car.info primary, biluppgifter.se fallback)

---

**Conclusion:** biluppgifter.se is EASIER to scrape than car.info!
- More consistent structure
- Better organized data
- No CSS-hidden content to worry about
- Clear section IDs
