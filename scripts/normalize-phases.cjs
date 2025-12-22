const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
});

const db = admin.firestore();

// Phase normalization mapping
const CANONICAL_PHASES = {
    'Fas 1: Vår': ['vår', 'spring', 'januari', 'january', 'nu', 'fas 1'],
    'Fas 2: Vår/Sommar': ['sommar', 'summer', 'vår/sommar', 'fas 2'],
    'Fas 3: Höst/Vinter': ['höst', 'vinter', 'fall', 'winter', 'gotland', 'garage', 'fas 3'],
    'Backlog': ['backlog', 'senare', 'framtid', 'future']
};

function normalizePhase(input) {
    if (!input) return 'Backlog';

    const lower = input.toLowerCase().trim();

    // Check each canonical phase
    for (const [canonical, keywords] of Object.entries(CANONICAL_PHASES)) {
        if (keywords.some(kw => lower.includes(kw))) {
            return canonical;
        }
    }

    // Fallback to Backlog
    console.warn(`⚠️ Unknown phase "${input}" normalized to Backlog`);
    return 'Backlog';
}

async function migratePhases(dryRun = true) {
    try {
        console.log('\n========================================');
        console.log('PHASE NORMALIZATION MIGRATION');
        console.log(`Mode: ${dryRun ? 'DRY RUN' : 'EXECUTE'}`);
        console.log('========================================\n');

        // Find Elton project
        const snapshot = await db.collection('projects')
            .where('name', '>=', 'Elton')
            .where('name', '<=', 'Elton\uf8ff')
            .get();

        if (snapshot.empty) {
            console.log('❌ No Elton project found');
            process.exit(1);
        }

        for (const doc of snapshot.docs) {
            const projectData = doc.data();
            console.log(`\n📋 Project: ${projectData.name}`);
            console.log(`   Owner: ${projectData.ownerEmail || 'N/A'}`);
            console.log(`   ID: ${doc.id}\n`);

            const tasksRef = db.collection('projects').doc(doc.id).collection('tasks');
            const tasks = await tasksRef.get();

            const changes = [];
            const phaseCounts = {};

            tasks.forEach(taskDoc => {
                const task = taskDoc.data();
                const oldPhase = task.phase || 'Ingen fas';
                const newPhase = normalizePhase(oldPhase);

                // Track phase counts
                phaseCounts[newPhase] = (phaseCounts[newPhase] || 0) + 1;

                if (oldPhase !== newPhase) {
                    changes.push({
                        id: taskDoc.id,
                        title: task.title,
                        oldPhase,
                        newPhase
                    });
                }
            });

            console.log('PHASE DISTRIBUTION AFTER MIGRATION:');
            Object.entries(phaseCounts)
                .sort((a, b) => b[1] - a[1])
                .forEach(([phase, count]) => {
                    console.log(`  ✓ ${phase}: ${count} uppgifter`);
                });

            if (changes.length === 0) {
                console.log('\n✅ No changes needed - all phases are already canonical!');
                continue;
            }

            console.log(`\n📝 CHANGES TO BE MADE (${changes.length} tasks):\n`);
            changes.forEach(change => {
                console.log(`  "${change.title}"`);
                console.log(`    ${change.oldPhase} → ${change.newPhase}\n`);
            });

            if (!dryRun) {
                console.log('💾 Applying changes...');
                const batch = db.batch();

                changes.forEach(change => {
                    const taskRef = tasksRef.doc(change.id);
                    batch.update(taskRef, { phase: change.newPhase });
                });

                await batch.commit();
                console.log(`✅ Successfully updated ${changes.length} tasks!`);
            } else {
                console.log('ℹ️  DRY RUN - No changes were made.');
                console.log('   Run with --execute flag to apply changes.');
            }
        }

        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

// Check for --execute flag
const dryRun = !process.argv.includes('--execute');
migratePhases(dryRun);
