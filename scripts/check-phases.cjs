const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function checkAllProjects() {
    try {
        const snapshot = await db.collection('projects').get();

        console.log(`\nHittade ${snapshot.size} projekt totalt\n`);

        for (const doc of snapshot.docs) {
            const data = doc.data();
            console.log('----------------------------------------');
            console.log('Projekt:', data.name);
            console.log('Ägare:', data.ownerEmail);
            console.log('ID:', doc.id);

            // Check if this is the Elton project
            if (data.name && data.name.toLowerCase().includes('elton')) {
                console.log('\n🎯 DETTA ÄR ELTON-PROJEKTET!\n');

                const tasks = await db.collection('projects')
                    .doc(doc.id)
                    .collection('tasks')
                    .get();

                const phases = {};
                tasks.forEach(t => {
                    const taskData = t.data();
                    const phase = taskData.phase || 'Ingen fas';
                    if (!phases[phase]) {
                        phases[phase] = [];
                    }
                    phases[phase].push(taskData.title);
                });

                console.log('FASER I DATABASEN:\n');
                Object.entries(phases)
                    .sort((a, b) => b[1].length - a[1].length)
                    .forEach(([phase, tasks]) => {
                        console.log(`📋 ${phase} (${tasks.length} uppgifter)`);
                        tasks.slice(0, 3).forEach(t => console.log(`   - ${t}`));
                        if (tasks.length > 3) {
                            console.log(`   ... och ${tasks.length - 3} till`);
                        }
                        console.log('');
                    });
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

checkAllProjects();
