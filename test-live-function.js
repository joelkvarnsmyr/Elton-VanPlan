// Quick test of live deployed function
const admin = require('firebase-admin');

// Initialize Firebase Admin (will use your credentials from firebase login)
admin.initializeApp({
  projectId: 'eltonvanplan'
});

const functions = admin.functions();

async function testLiveFunction(regNo) {
  console.log(`🧪 Testing LIVE deployed function: scrapeVehicleData`);
  console.log(`📌 RegNo: ${regNo}`);
  console.log('');

  try {
    // Call the deployed function
    const result = await functions
      .httpsCallable('scrapeVehicleData')({ regNo });

    console.log('✅ SUCCESS!');
    console.log('');
    console.log('📊 Result:');
    console.log(JSON.stringify(result, null, 2));

    if (result.success) {
      const vehicle = result.vehicleData;
      console.log('');
      console.log('📈 Summary:');
      console.log(`   Source: ${result.source}`);
      console.log(`   Cached: ${result.cached ? 'YES' : 'NO (fresh scrape)'}`);
      console.log(`   Vehicle: ${vehicle.make} ${vehicle.model} (${vehicle.year})`);
      console.log(`   VIN: ${vehicle.vin}`);
      console.log(`   Status: ${vehicle.status}`);
      console.log(`   Weight: ${vehicle.weights.curb}kg / ${vehicle.weights.total}kg`);
      console.log(`   Owners: ${vehicle.history.owners}`);
    }

  } catch (error) {
    console.error('❌ ERROR:');
    console.error(error);
  }
}

const regNo = process.argv[2] || 'JSN398';
testLiveFunction(regNo);
