/**
 * TEST INVITED QUERY
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const JOEL_EMAIL = 'joel@kvarnsmyr.com';

async function testQuery() {
    console.log(`\n🔍 Testing Firestore query for invitedEmails containing: ${JOEL_EMAIL}\n`);

    try {
        const query = db.collection('projects')
            .where('invitedEmails', 'array-contains', JOEL_EMAIL);

        const snapshot = await query.get();

        console.log(`📊 Results: ${snapshot.size} project(s) found\n`);

        snapshot.forEach(doc => {
            const data = doc.data();
            console.log(`   ✅ ${doc.id}: "${data.name}"`);
            console.log(`      Owner: ${data.ownerEmail}`);
            console.log(`      InvitedEmails: ${JSON.stringify(data.invitedEmails)}`);
        });

        if (snapshot.size === 0) {
            console.log('   ❌ No projects found with this query!\n');

            // Let's manually check ALL projects and their invitedEmails
            console.log('📋 Checking all projects manually...\n');
            const allProjects = await db.collection('projects').get();
            allProjects.forEach(doc => {
                const data = doc.data();
                if (data.invitedEmails && data.invitedEmails.length > 0) {
                    console.log(`   ${doc.id}: invitedEmails = ${JSON.stringify(data.invitedEmails)}`);
                }
            });
        }

    } catch (error) {
        console.error('❌ Query error:', error.message);
        if (error.code === 9) {
            console.log('\n⚠️ You may need to create a Firestore index for this query!');
        }
    }
}

testQuery().then(() => process.exit(0));
