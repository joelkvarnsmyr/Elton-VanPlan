const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

async function listAllTasks() {
    try {
        const tasks = await db.collection('projects')
            .doc('elton-jsn398')
            .collection('tasks')
            .get();

        const byPhase = {};
        tasks.forEach(t => {
            const data = t.data();
            const phase = data.phase || 'Ingen fas';
            if (!byPhase[phase]) byPhase[phase] = [];
            byPhase[phase].push({
                title: data.title,
                status: data.status,
                priority: data.priority
            });
        });

        console.log('\n=== ALLA UPPGIFTER PER FAS ===\n');

        const phases = ['Fas 1: Vår', 'Fas 2: Vår/Sommar', 'Fas 3: Höst/Vinter', 'Backlog'];
        phases.forEach(phase => {
            if (byPhase[phase]) {
                console.log(`\n📋 ${phase} (${byPhase[phase].length} uppgifter):`);
                byPhase[phase].forEach(t => {
                    const priority = t.priority ? ` [${t.priority}]` : '';
                    console.log(`   [${t.status}]${priority} ${t.title}`);
                });
            }
        });

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

listAllTasks();
