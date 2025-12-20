/**
 * FIX JOEL'S INVITATION - Correct email!
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PROJECT_ID = 'elton-jsn398';
const WRONG_EMAIL = 'joel@kvarnsmyr.com';
const CORRECT_EMAIL = 'joel@kvarnsmyr.se';  // <-- RÄTT EMAIL!

async function fix() {
    console.log('\n🔧 Fixing Joel invite...\n');

    const projectRef = db.collection('projects').doc(PROJECT_ID);

    // Remove wrong, add correct
    await projectRef.update({
        invitedEmails: admin.firestore.FieldValue.arrayRemove(WRONG_EMAIL)
    });
    await projectRef.update({
        invitedEmails: admin.firestore.FieldValue.arrayUnion(CORRECT_EMAIL)
    });

    // Verify
    const doc = await projectRef.get();
    console.log('✅ Updated invitedEmails:', JSON.stringify(doc.data().invitedEmails));
    console.log('\n🔄 Joel kan nu ladda om appen och se inbjudan!\n');
}

fix().then(() => process.exit(0));
