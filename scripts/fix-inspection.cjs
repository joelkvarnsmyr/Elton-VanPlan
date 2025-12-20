/**
 * FIX INSPECTION STATISTICS
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PROJECT_ID = 'elton-jsn398';

async function fix() {
    console.log('\n🔧 Fixing inspection statistics...\n');

    const projectRef = db.collection('projects').doc(PROJECT_ID);
    const doc = await projectRef.get();
    const data = doc.data();

    if (!data.inspections || data.inspections.length === 0) {
        console.log('❌ No inspections found!');
        return;
    }

    // Fix the inspection
    const inspection = data.inspections[0];
    console.log('Current statistics:', JSON.stringify(inspection.statistics));

    // Update to use 'negative' instead of 'issues'
    const fixedInspection = {
        ...inspection,
        inspector: inspection.inspector || 'Joel & Hanna',
        inspectors: ['Joel', 'Hanna'],  // Add array version
        statistics: {
            total: inspection.statistics?.total || 88,
            negative: inspection.statistics?.issues || inspection.statistics?.negative || 68,
            positive: inspection.statistics?.positive || 20
        }
    };

    await projectRef.update({
        inspections: [fixedInspection],
        detailedInspections: [fixedInspection]
    });

    console.log('✅ Fixed statistics:', JSON.stringify(fixedInspection.statistics));
    console.log('\n🔄 Reload the app!\n');
}

fix().then(() => process.exit(0));
