/**
 * CHECK JOEL'S USER PROFILE
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function checkJoel() {
    console.log('\n🔍 Looking for Joel in users collection...\n');

    // Get all users with email containing "joel"
    const users = await db.collection('users').get();

    users.forEach(doc => {
        const data = doc.data();
        if (data.email?.toLowerCase().includes('joel') || data.name?.toLowerCase().includes('joel')) {
            console.log(`👤 Found user:
   UID: ${doc.id}
   Name: ${data.name}
   Email in profile: ${data.email}
`);
        }
    });

    // Also list ALL users
    console.log('\n📋 All users in database:\n');
    users.forEach(doc => {
        const data = doc.data();
        console.log(`   ${doc.id} -> ${data.email} (${data.name})`);
    });
}

checkJoel().then(() => process.exit(0));
