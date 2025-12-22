const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

// Check if already initialized
if (!admin.apps.length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
    });
}

const db = admin.firestore();

async function addMissingTasks() {
    try {
        console.log('\n=== LÄGGER TILL SAKNADE UPPGIFTER ===\n');

        const projectRef = db.collection('projects').doc('elton-jsn398');
        const tasksRef = projectRef.collection('tasks');

        // Saknade uppgifter från ursprunglig plan
        const missingTasks = [
            {
                title: 'Motorservice (olja, filter, tätning luftfilterlådan, kamremsspänning)',
                description: 'Komplett motorservice innan sommarsäsongen. Inkluderar:\n- Byt motorolja och oljefilter\n- Byt luftfilter och täta luftfilterlådan\n- Kontrollera och justera kamremsspänning\n- Kontrollera kylvätska och bromsvätskenivåer',
                phase: 'Fas 1: Vår',
                priority: 'Hög',
                status: 'TODO',
                estimatedCostMin: 1000,
                estimatedCostMax: 2000,
                tags: ['Motor', 'Service', 'Akut'],
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            },
            {
                title: 'Installera dieselvärmare 5kW',
                description: 'Installera dieselvärmare för vinterbruk. Gör det möjligt att värma bilen innan körning och hålla den varm under vintern.',
                phase: 'Fas 1: Vår',
                priority: 'Medel',
                status: 'TODO',
                estimatedCostMin: 8000,
                estimatedCostMax: 12000,
                tags: ['Värme', 'Vinter', 'Komfort'],
                created: new Date().toISOString(),
                lastModified: new Date().toISOString()
            }
        ];

        console.log(`Lägger till ${missingTasks.length} uppgifter...\n`);

        for (const task of missingTasks) {
            const docRef = tasksRef.doc();
            await docRef.set({
                id: docRef.id,
                ...task
            });
            console.log(`✅ Lade till: "${task.title}"`);
            console.log(`   Fas: ${task.phase}`);
            console.log(`   Prioritet: ${task.priority}`);
            console.log(`   Kostnad: ${task.estimatedCostMin}-${task.estimatedCostMax} kr\n`);
        }

        console.log('✅ Klart! Alla saknade uppgifter har lagts till.\n');
        process.exit(0);
    } catch (error) {
        console.error('❌ Fel:', error);
        process.exit(1);
    }
}

addMissingTasks();
