# Mock HTML Files

This directory contains saved HTML files for testing scrapers without making live requests to avoid rate limiting during development.

## File Naming Convention

### car.info mock files:
```
car-info-{REGNO}.html
```
Example: `car-info-JSN398.html`

### biluppgifter.se mock files:
```
biluppgifter-{REGNO}.html
```
Example: `biluppgifter-JSN398.html`

## How to Create Mock Files

### Manual Method (Recommended for development):

1. **Visit the site in your browser**
   ```
   https://www.car.info/sv-se/license-plate/S/JSN398
   https://biluppgifter.se/fordon/jsn398/
   ```

2. **Save the page**
   - Right-click → "Save As"
   - Or Ctrl+S / Cmd+S
   - Save as "car-info-JSN398.html" or "biluppgifter-JSN398.html"

3. **Move to mock-html directory**
   ```bash
   mv ~/Downloads/car-info-JSN398.html functions/scripts/mock-html/
   ```

### Programmatic Method (using curl):

```bash
# car.info
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
     -H "Accept-Language: sv-SE,sv;q=0.9" \
     https://www.car.info/sv-se/license-plate/S/JSN398 \
     -o functions/scripts/mock-html/car-info-JSN398.html

# biluppgifter.se
curl -H "User-Agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
     -H "Accept-Language: sv-SE,sv;q=0.9" \
     https://biluppgifter.se/fordon/jsn398/ \
     -o functions/scripts/mock-html/biluppgifter-JSN398.html
```

## Using Mock Files

### With test-scraper.js:
```javascript
// Edit test-scraper.js
const CONFIG = {
    USE_MOCK_HTML: true,
    MOCK_HTML_PATH: './scripts/mock-html/JSN398.html' // Update to match your filename
};
```

### With test-scraper-realistic.js:
```bash
node scripts/test-scraper-realistic.js --mock
```

The script will automatically look for:
- `car-info-{REGNO}.html`
- `biluppgifter-{REGNO}.html`

## Test Vehicles

Current test vehicles that should have mock files:

| RegNo | Vehicle | Priority |
|-------|---------|----------|
| JKN330 | New test vehicle | High |
| JSN398 | VW LT 1976 - Verified HTML | High |
| OHC870 | Additional test | Medium |

## Notes

- Mock files are **not committed to git** (see .gitignore)
- Create fresh mock files periodically as sites may update their HTML structure
- Always test with live data before deploying to production
- Mock files are useful for:
  - Avoiding rate limits during development
  - Testing edge cases (missing fields, different formats)
  - Reproducible test scenarios
  - Offline development

## .gitignore

Add to `.gitignore`:
```
functions/scripts/mock-html/*.html
```

Keep only the README.md in version control.
