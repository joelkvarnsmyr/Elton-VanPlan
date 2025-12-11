/**
 * TEST: Mileage History Extraction
 *
 * Tests extraction of mileage history from car.info JavaScript data
 *
 * Usage:
 *   node functions/scripts/test-mileage-history.js
 */

import fs from 'fs';

// Read mock HTML
const html = fs.readFileSync('functions/scripts/mock-html/car-info-JSN398.html', 'utf-8');

console.log('🧪 Testing Mileage History Extraction\n');
console.log('📄 Reading mock HTML for JSN398...\n');

try {
    // Extract mileage history from JavaScript data
    const scriptContent = html.match(/var\s+datasetMileageWithoutUnofficial\s*=\s*(\[[\s\S]*?\]);/);

    if (!scriptContent || !scriptContent[1]) {
        console.error('❌ Could not find datasetMileageWithoutUnofficial in HTML');
        process.exit(1);
    }

    console.log('✅ Found mileage dataset in HTML');
    console.log(`📏 Raw data length: ${scriptContent[1].length} characters\n`);

    // Parse the JavaScript array
    const cleanedJson = scriptContent[1]
        .replace(/new Date\("([^"]+)"\)/g, '"$1"')  // Replace new Date("...") with "..."
        .replace(/x:/g, '"x":')
        .replace(/y:/g, '"y":')
        .replace(/label:/g, '"label":')
        .replace(/mileage_formatted:/g, '"mileage_formatted":')
        .replace(/mileage_converted_from_miles:/g, '"mileage_converted_from_miles":')
        .replace(/mileage_corrected_from:/g, '"mileage_corrected_from":')
        .replace(/value_type:/g, '"value_type":')
        .replace(/date:/g, '"date":')
        .replace(/highlight:/g, '"highlight":')
        .replace(/is_traficom:/g, '"is_traficom":');

    const mileageData = JSON.parse(cleanedJson);

    if (!Array.isArray(mileageData)) {
        console.error('❌ Parsed data is not an array');
        process.exit(1);
    }

    console.log(`✅ Successfully parsed ${mileageData.length} mileage entries\n`);

    // Transform to our format
    const mileageHistory = mileageData.map((entry) => ({
        date: entry.label || entry.x,
        mileage: entry.y || 0,
        mileageFormatted: entry.mileage_formatted || `${entry.y || 0}`,
        type: entry.value_type || 'Okänt'
    }));

    console.log('📊 Mileage History:\n');
    console.log('═'.repeat(80));

    mileageHistory.forEach((entry, index) => {
        console.log(`${index + 1}. ${entry.date} - ${entry.mileageFormatted} (${entry.type})`);
    });

    console.log('═'.repeat(80));
    console.log(`\n📈 Summary:`);
    console.log(`   First entry: ${mileageHistory[0].date} - ${mileageHistory[0].mileageFormatted}`);
    console.log(`   Latest entry: ${mileageHistory[mileageHistory.length - 1].date} - ${mileageHistory[mileageHistory.length - 1].mileageFormatted}`);
    console.log(`   Total entries: ${mileageHistory.length}`);

    // Calculate average annual mileage
    const firstYear = parseInt(mileageHistory[0].date.split('-')[0]);
    const lastYear = parseInt(mileageHistory[mileageHistory.length - 1].date.split('-')[0]);
    const firstMileage = mileageHistory[0].mileage;
    const lastMileage = mileageHistory[mileageHistory.length - 1].mileage;
    const yearsDiff = lastYear - firstYear;
    const mileageDiff = lastMileage - firstMileage;

    if (yearsDiff > 0) {
        const avgPerYear = Math.round(mileageDiff / yearsDiff);
        console.log(`   Average per year: ${avgPerYear} mil (${avgPerYear * 10} km)`);
    }

    console.log('\n✅ Test PASSED - Mileage history extraction works!');

} catch (error) {
    console.error('❌ Test FAILED:', error.message);
    console.error(error);
    process.exit(1);
}
