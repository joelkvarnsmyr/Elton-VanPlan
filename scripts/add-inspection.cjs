/**
 * ADD INSPECTION DATA to Elton project
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PROJECT_ID = 'elton-jsn398';

console.log(`\n🔍 Adding inspection data to Elton project...\n`);

async function addInspections() {
    const projectRef = db.collection('projects').doc(PROJECT_ID);

    // Load inspection data
    const inspectionData = JSON.parse(fs.readFileSync(
        path.join(__dirname, '../docs/Elton/inspektionsdata-elton.json'), 'utf8'
    ));

    // Format for the app (as DetailedInspection)
    const detailedInspection = {
        id: 'inspection-2025-12-20',
        date: '2025-12-20',
        inspector: 'Joel & Hanna',
        verdict: 'Godkänd med anmärkningar',
        mileage: 33620,
        summary: '88 observationer: 68 anmärkningar, 20 positiva. Kritiskt: Baklyktor, rostskador på dörrar.',
        expiry: null,
        areas: inspectionData.inspektion.data_per_område.map(area => ({
            id: `area-${area.område_id}`,
            name: area.namn,
            findings: area.punkter.map(p => ({
                id: `finding-${p.id}`,
                inspectionId: 'inspection-2025-12-20',
                date: '2025-12-20',
                category: p.kategori === 'Positivt' ? 'Positive' : 'Issue',
                severity: p.kategori === 'Positivt' ? 'info' :
                    (p.typ?.includes('Rost') ? 'medium' : 'low'),
                area: area.namn,
                title: `${p.typ || 'Observation'}: ${p.beskrivning.substring(0, 50)}...`,
                description: p.beskrivning,
                status: p.kategori === 'Positivt' ? 'verified' : 'identified',
                linkedTaskId: null,
                images: []
            }))
        })),
        statistics: {
            total: inspectionData.inspektion.statistik.totalt_antal_observationer,
            issues: inspectionData.inspektion.statistik.anmärkningar,
            positive: inspectionData.inspektion.statistik.positiva_observationer
        }
    };

    // Update project with inspections array
    await projectRef.update({
        inspections: [detailedInspection],
        detailedInspections: [detailedInspection],
        lastModified: new Date().toISOString()
    });

    console.log('✅ Inspection data added!');
    console.log(`   📊 Total findings: ${detailedInspection.statistics.total}`);
    console.log(`   ⚠️  Issues: ${detailedInspection.statistics.issues}`);
    console.log(`   ✅ Positive: ${detailedInspection.statistics.positive}`);
    console.log(`   📍 Areas: ${detailedInspection.areas.length}`);
    console.log('\n🔄 Be Hanna uppdatera appen!\n');
}

addInspections()
    .then(() => process.exit(0))
    .catch(e => { console.error('❌ Error:', e); process.exit(1); });
