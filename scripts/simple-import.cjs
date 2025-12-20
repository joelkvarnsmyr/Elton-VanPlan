/**
 * Simple Firestore Import Script
 * Manually copies project data to avoid module issues
 * 
 * Run: node scripts/simple-import.cjs
 */

const admin = require('firebase-admin');
const path = require('path');

// Initialize Firebase
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Configuration
const PROJECT_ID = 'elton-jsn398';
const OWNER_ID = 'Js9QpLbTLpUHbFsWRxeH5UvlWBp1';
const OWNER_EMAIL = 'hanna.erixon@hotmail.com';

console.log(`\n🚐 Importing minimal Elton project`);
console.log(`   Owner: ${OWNER_EMAIL}`);
console.log(`   Project ID: ${PROJECT_ID}\n`);

async function importMinimalProject() {
    try {
        const projectRef = db.collection('projects').doc(PROJECT_ID);

        // Create minimal project
        await projectRef.set({
            id: PROJECT_ID,
            name: 'Elton (VW LT31 1976)',
            type: 'conversion',
            brand: 'vanplan',
            ownerIds: [OWNER_ID],
            primaryOwnerId: OWNER_ID,
            ownerId: OWNER_ID,
            ownerEmail: OWNER_EMAIL,
            memberIds: [],
            vehicleData: {
                regNo: 'JSN398',
                make: 'Volkswagen',
                model: 'LT 31',
                year: 1976,
                status: 'I drift',
                estimatedCurrentMileage: 3418,
                annualDriving: 223
            },
            created: new Date().toISOString(),
            lastModified: new Date().toISOString(),
            nickname: 'Elton'
        });

        console.log('✅ Minimal project created!');
        console.log('\n📝 Nu kan du:');
        console.log('   1. Logga in i appen');
        console.log('   2. Projektet "Elton" syns under dina projekt');
        console.log('   3. Använd Magic Import för att lägga till tasks');
        console.log('   4. Eller lägg till tasks manuellt\n');

        return true;
    } catch (error) {
        console.error('❌ Error:', error);
        return false;
    }
}

importMinimalProject()
    .then((success) => {
        if (success) {
            console.log('🎉 Import klar!');
            process.exit(0);
        } else {
            process.exit(1);
        }
    });
