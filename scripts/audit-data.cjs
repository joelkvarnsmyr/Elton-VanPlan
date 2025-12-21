/**
 * FULL DATA AUDIT - Check what's in Firestore vs what should be there
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PROJECT_ID = 'elton-jsn398';

async function audit() {
    console.log('\n📊 DATA IMPORT AUDIT\n');
    console.log('='.repeat(60));

    const projectRef = db.collection('projects').doc(PROJECT_ID);
    const doc = await projectRef.get();
    const data = doc.data();

    console.log('\n📁 PROJECT DOCUMENT FIELDS:\n');
    console.log(`   name: ${data.name}`);
    console.log(`   vehicleData.regNo: ${data.vehicleData?.regNo}`);
    console.log(`   vehicleData.make: ${data.vehicleData?.make}`);
    console.log(`   vehicleData.model: ${data.vehicleData?.model}`);
    console.log(`   vehicleData.year: ${data.vehicleData?.year}`);
    console.log(`   vehicleData.vin: ${data.vehicleData?.vin}`);
    console.log(`   vehicleData.maintenance: ${data.vehicleData?.maintenance ? 'EXISTS' : '❌ MISSING'}`);
    console.log(`   vehicleData.mileageHistory: ${data.vehicleData?.mileageHistory ? data.vehicleData.mileageHistory.length + ' items' : '❌ MISSING'}`);
    console.log(`   vehicleData.historyEvents: ${data.vehicleData?.historyEvents ? data.vehicleData.historyEvents.length + ' items' : '❌ MISSING'}`);
    console.log(`   vehicleData.priceHistory: ${data.vehicleData?.priceHistory ? data.vehicleData.priceHistory.length + ' items' : '❌ MISSING'}`);
    console.log(`   vehicleData.statistics: ${data.vehicleData?.statistics ? 'EXISTS' : '❌ MISSING'}`);

    console.log(`\n   projectMetadata: ${data.projectMetadata ? 'EXISTS' : '❌ MISSING'}`);
    if (data.projectMetadata) {
        console.log(`      - participants: ${data.projectMetadata?.participants?.length || 0}`);
        console.log(`      - strategicDecisions: ${data.projectMetadata?.strategicDecisions?.length || 0}`);
        console.log(`      - unknowns: ${data.projectMetadata?.unknowns?.length || 0}`);
        console.log(`      - constraints: ${data.projectMetadata?.constraints?.length || 0}`);
    }

    console.log(`\n   contacts: ${data.contacts ? data.contacts.length + ' items' : '❌ MISSING'}`);
    console.log(`   inspections: ${data.inspections ? data.inspections.length + ' items' : '❌ MISSING'}`);
    if (data.inspections && data.inspections[0]) {
        console.log(`      - areas: ${data.inspections[0].areas?.length || 0}`);
        console.log(`      - total findings: ${data.inspections[0].statistics?.total || 0}`);
    }

    // Check subcollections
    console.log('\n📂 SUBCOLLECTIONS:\n');

    const tasks = await projectRef.collection('tasks').get();
    console.log(`   tasks: ${tasks.size} documents`);

    const shopping = await projectRef.collection('shoppingList').get();
    console.log(`   shoppingList: ${shopping.size} documents`);

    const serviceLog = await projectRef.collection('serviceLog').get();
    console.log(`   serviceLog: ${serviceLog.size} documents`);

    const knowledgeBase = await projectRef.collection('knowledgeBase').get();
    console.log(`   knowledgeBase: ${knowledgeBase.size} documents`);

    console.log('\n' + '='.repeat(60));
    console.log('\n📋 WHAT\'S IN DATA FILES VS FIRESTORE:\n');

    console.log('| Data Item                    | In File | In Firestore |');
    console.log('|------------------------------|---------|--------------|');
    console.log(`| Tasks                        | 18+5=23 | ${tasks.size.toString().padStart(12)} |`);
    console.log(`| Shopping Items               | 23      | ${shopping.size.toString().padStart(12)} |`);
    console.log(`| Service Log                  | 4       | ${serviceLog.size.toString().padStart(12)} |`);
    console.log(`| Knowledge Articles           | 5       | ${knowledgeBase.size.toString().padStart(12)} |`);
    console.log(`| Mileage History              | 9       | ${(data.vehicleData?.mileageHistory?.length || 0).toString().padStart(12)} |`);
    console.log(`| History Events               | 35+     | ${(data.vehicleData?.historyEvents?.length || 0).toString().padStart(12)} |`);
    console.log(`| Price History                | 5       | ${(data.vehicleData?.priceHistory?.length || 0).toString().padStart(12)} |`);
    console.log(`| Strategic Decisions          | 8       | ${(data.projectMetadata?.strategicDecisions?.length || 0).toString().padStart(12)} |`);
    console.log(`| Inspection Areas             | 10      | ${(data.inspections?.[0]?.areas?.length || 0).toString().padStart(12)} |`);
    console.log(`| Inspection Findings          | 88      | ${(data.inspections?.[0]?.statistics?.total || 0).toString().padStart(12)} |`);
    console.log(`| Contacts/Workshops           | 3       | ${(data.contacts?.length || 0).toString().padStart(12)} |`);

    console.log('\n');
}

audit().then(() => process.exit(0));
