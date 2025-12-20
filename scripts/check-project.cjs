/**
 * CHECK PROJECT STATUS
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

async function check() {
    console.log('\n📋 Checking project elton-jsn398...\n');

    const doc = await db.collection('projects').doc('elton-jsn398').get();

    if (!doc.exists) {
        console.log('❌ Project does NOT exist!');
        return;
    }

    const data = doc.data();
    console.log('✅ Project exists!');
    console.log(`   Name: ${data.name}`);
    console.log(`   Owner: ${data.ownerEmail}`);
    console.log(`   OwnerIds: ${JSON.stringify(data.ownerIds)}`);
    console.log(`   InvitedEmails: ${JSON.stringify(data.invitedEmails)}`);
    console.log(`   PrimaryOwnerId: ${data.primaryOwnerId}`);

    // Check tasks subcollection
    const tasks = await db.collection('projects').doc('elton-jsn398').collection('tasks').get();
    console.log(`\n   Tasks in subcollection: ${tasks.size}`);

    // Check shopping subcollection
    const shopping = await db.collection('projects').doc('elton-jsn398').collection('shoppingList').get();
    console.log(`   Shopping items: ${shopping.size}`);
}

check().then(() => process.exit(0)).catch(e => { console.error(e); process.exit(1); });
