/**
 * TEST SCRIPT: Cloud Function Testing
 *
 * Tests the deployed scrapeVehicleData function
 *
 * Usage:
 *   node scripts/test-cloud-function.js JSN398
 */

import { initializeApp } from 'firebase/app';
import { getFunctions, httpsCallable } from 'firebase/functions';

// Firebase config (from your project)
const firebaseConfig = {
    projectId: 'eltonvanplan',
    // Add other config if needed, but projectId should be enough for functions
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const functions = getFunctions(app, 'europe-west1');

async function testScraper(regNo) {
    console.log('🚗 Testing Cloud Function: scrapeVehicleData');
    console.log('='.repeat(60));
    console.log(`📌 RegNo: ${regNo}`);
    console.log('');

    try {
        const scrapeVehicleData = httpsCallable(functions, 'scrapeVehicleData');

        console.log('⏳ Calling function...');
        const startTime = Date.now();

        const result = await scrapeVehicleData({ regNo });

        const duration = Date.now() - startTime;

        console.log(`✅ Success! (${duration}ms)`);
        console.log('');
        console.log('📊 Result:');
        console.log('='.repeat(60));
        console.log(JSON.stringify(result.data, null, 2));
        console.log('');

        if (result.data.success) {
            const vehicle = result.data.vehicleData;
            console.log('📈 Summary:');
            console.log(`   Source: ${result.data.source}`);
            console.log(`   Cached: ${result.data.cached ? 'YES' : 'NO (fresh scrape)'}`);
            console.log(`   Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year})`);
            console.log(`   VIN: ${vehicle.vin}`);
            console.log(`   Status: ${vehicle.status}`);
            console.log(`   Fuel: ${vehicle.engine.fuel}`);
            console.log(`   Power: ${vehicle.engine.power}`);
            console.log(`   Weight: ${vehicle.weights.curb}kg / ${vehicle.weights.total}kg`);
            console.log(`   Owners: ${vehicle.history.owners}`);
        } else {
            console.log('❌ Error:', result.data.error);
        }

    } catch (error) {
        console.error('❌ Function call failed:');
        console.error(error);
    }
}

const regNo = process.argv[2] || 'JSN398';
testScraper(regNo).catch(console.error);
