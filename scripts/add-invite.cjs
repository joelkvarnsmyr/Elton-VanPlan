/**
 * ADD JOEL AS INVITED USER
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PROJECT_ID = 'elton-jsn398';
const JOEL_EMAIL = 'joel@kvarnsmyr.com'; // Joel's email

async function addInvite() {
    const projectRef = db.collection('projects').doc(PROJECT_ID);

    // First, let's see what's currently in the project
    const doc = await projectRef.get();
    const data = doc.data();

    console.log('\n📋 Current project state:');
    console.log(`   Owner: ${data.ownerEmail}`);
    console.log(`   OwnerIds: ${JSON.stringify(data.ownerIds)}`);
    console.log(`   InvitedEmails: ${JSON.stringify(data.invitedEmails)}`);
    console.log(`   MemberIds: ${JSON.stringify(data.memberIds)}`);

    // Add Joel to invitedEmails
    const currentInvited = data.invitedEmails || [];
    if (!currentInvited.includes(JOEL_EMAIL)) {
        await projectRef.update({
            invitedEmails: admin.firestore.FieldValue.arrayUnion(JOEL_EMAIL)
        });
        console.log(`\n✅ Added ${JOEL_EMAIL} to invitedEmails!`);
    } else {
        console.log(`\n⚠️ ${JOEL_EMAIL} is already invited`);
    }

    // Verify
    const updated = await projectRef.get();
    console.log(`\n📋 Updated invitedEmails: ${JSON.stringify(updated.data().invitedEmails)}`);
    console.log('\n🔄 Joel should now see the invitation when he refreshes!\n');
}

addInvite()
    .then(() => process.exit(0))
    .catch(e => { console.error(e); process.exit(1); });
