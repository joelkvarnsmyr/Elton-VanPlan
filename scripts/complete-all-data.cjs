/**
 * COMPLETE DATA IMPORT - ALL MISSING DATA
 */

const admin = require('firebase-admin');
const serviceAccount = require('../firebase-service-account.json');
admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
const db = admin.firestore();

const PROJECT_ID = 'elton-jsn398';

console.log('\n🚀 COMPLETE DATA IMPORT - Adding ALL missing data\n');
console.log('='.repeat(60));

async function importAllMissingData() {
    const projectRef = db.collection('projects').doc(PROJECT_ID);

    // ===== 1. MILEAGE HISTORY (9 points) =====
    const mileageHistory = [
        { id: 'mr-1978-02-14', date: '1978-02-14', mileage: 0, source: 'Registrering', eventType: 'Registrerad', verified: true },
        { id: 'mr-2015-03-24', date: '2015-03-24', mileage: 1385, source: 'Besiktning', eventType: 'Kontrollbesiktning', verified: true },
        { id: 'mr-2017-07-19', date: '2017-07-19', mileage: 1973, source: 'Besiktning', eventType: 'Kontrollbesiktning', verified: true },
        { id: 'mr-2019-05-29', date: '2019-05-29', mileage: 2273, source: 'Besiktning', eventType: 'Kontrollbesiktning', verified: true },
        { id: 'mr-2019-06-25', date: '2019-06-25', mileage: 2281, source: 'Efterkontroll', eventType: 'Efterkontroll-besiktning', verified: true },
        { id: 'mr-2019-11-08', date: '2019-11-08', mileage: 2500, source: 'Annons', verified: false },
        { id: 'mr-2021-06-28', date: '2021-06-28', mileage: 2668, source: 'Besiktning', eventType: 'Kontrollbesiktning', verified: true },
        { id: 'mr-2023-05-11', date: '2023-05-11', mileage: 3098, source: 'Besiktning', eventType: 'Kontrollbesiktning', verified: true },
        { id: 'mr-2025-08-13', date: '2025-08-13', mileage: 3362, source: 'Besiktning', eventType: 'Kontrollbesiktning', verified: true }
    ];
    console.log(`\n📊 Mileage History: ${mileageHistory.length} points`);

    // ===== 2. HISTORY EVENTS (38 events) =====
    const historyEvents = [
        { id: 'ev-2025-12-10', date: '2025-12-10', type: 'registration', title: 'I trafik' },
        { id: 'ev-2025-12-05', date: '2025-12-05', type: 'owner_change', title: 'Ägarbyte', description: 'Köpt av Hanna Erixon!' },
        { id: 'ev-2025-11-04', date: '2025-11-04', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2025-10-23', date: '2025-10-23', type: 'advertisement', title: 'Privatannons', price: 50000 },
        { id: 'ev-2025-08-13', date: '2025-08-13', type: 'inspection', title: 'Kontrollbesiktning', mileage: 3362 },
        { id: 'ev-2025-07-03', date: '2025-07-03', type: 'registration', title: 'I trafik' },
        { id: 'ev-2024-12-10', date: '2024-12-10', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2024-04-28', date: '2024-04-28', type: 'registration', title: 'I trafik' },
        { id: 'ev-2023-10-22', date: '2023-10-22', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2023-06-28', date: '2023-06-28', type: 'owner_change', title: 'Ägarbyte', description: 'Till en person' },
        { id: 'ev-2023-05-11', date: '2023-05-11', type: 'inspection', title: 'Kontrollbesiktning', mileage: 3098 },
        { id: 'ev-2023-05-03', date: '2023-05-03', type: 'advertisement', title: 'Privatannons', price: 70000 },
        { id: 'ev-2023-04-20', date: '2023-04-20', type: 'registration', title: 'I trafik' },
        { id: 'ev-2023-04-19', date: '2023-04-19', type: 'owner_change', title: 'Ägarbyte', description: 'Till en person i Umeå kommun', location: 'Umeå kommun' },
        { id: 'ev-2023-03-12', date: '2023-03-12', type: 'advertisement', title: 'Privatannons', price: 85000 },
        { id: 'ev-2022-09-30', date: '2022-09-30', type: 'advertisement', title: 'Privatannons', price: 95000 },
        { id: 'ev-2022-08-10', date: '2022-08-10', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2022-06-09', date: '2022-06-09', type: 'registration', title: 'I trafik' },
        { id: 'ev-2021-10-28', date: '2021-10-28', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2021-06-28', date: '2021-06-28', type: 'inspection', title: 'Kontrollbesiktning', mileage: 2668 },
        { id: 'ev-2021-06-01', date: '2021-06-01', type: 'registration', title: 'I trafik' },
        { id: 'ev-2020-12-16', date: '2020-12-16', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2020-06-11', date: '2020-06-11', type: 'owner_change', title: 'Ägarbyte', location: 'Sundsvall kommun' },
        { id: 'ev-2019-09-07', date: '2019-09-07', type: 'advertisement', title: 'Privatannons', price: 20000, mileage: 2500 },
        { id: 'ev-2019-07-21', date: '2019-07-21', type: 'owner_change', title: 'Ägarbyte', location: 'Luleå kommun' },
        { id: 'ev-2019-06-25', date: '2019-06-25', type: 'inspection', title: 'Efterkontroll-besiktning', mileage: 2281 },
        { id: 'ev-2019-05-29', date: '2019-05-29', type: 'inspection', title: 'Kontrollbesiktning', mileage: 2273 },
        { id: 'ev-2019-05-27', date: '2019-05-27', type: 'registration', title: 'I trafik' },
        { id: 'ev-2018-10-07', date: '2018-10-07', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2018-05-01', date: '2018-05-01', type: 'registration', title: 'I trafik' },
        { id: 'ev-2017-09-27', date: '2017-09-27', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2017-07-19', date: '2017-07-19', type: 'inspection', title: 'Kontrollbesiktning', mileage: 1973 },
        { id: 'ev-2017-05-04', date: '2017-05-04', type: 'registration', title: 'I trafik' },
        { id: 'ev-2016-09-27', date: '2016-09-27', type: 'deregistration', title: 'Avställd' },
        { id: 'ev-2016-04-09', date: '2016-04-09', type: 'registration', title: 'I trafik' },
        { id: 'ev-2015-08-01', date: '2015-08-01', type: 'owner_change', title: 'Ägarbyte', location: 'Skellefteå kommun' },
        { id: 'ev-2015-04-02', date: '2015-04-02', type: 'owner_change', title: 'Ägarbyte', location: 'Norrbotten län' },
        { id: 'ev-1978-02-14', date: '1978-02-14', type: 'registration', title: 'Registrerad', description: 'JSN398' }
    ];
    console.log(`📜 History Events: ${historyEvents.length} events`);

    // ===== 3. PRICE HISTORY (5 points) =====
    const priceHistory = [
        { date: '2019-09-07', estimatedPrice: 20000, source: 'annons', mileage: 2500 },
        { date: '2022-09-30', estimatedPrice: 95000, source: 'annons', change: 75000 },
        { date: '2023-03-12', estimatedPrice: 85000, source: 'annons', change: -10000 },
        { date: '2023-05-03', estimatedPrice: 70000, source: 'annons', change: -15000, mileage: 3098 },
        { date: '2025-10-23', estimatedPrice: 50000, source: 'annons', change: -20000, mileage: 3362 }
    ];
    console.log(`💰 Price History: ${priceHistory.length} data points`);

    // ===== 4. VEHICLE STATISTICS =====
    const statistics = {
        totalInSweden: 395,
        sameEngineType: 265,
        model: 'Volkswagen LT Panel Van 31',
        yearRange: '1975 - 1983',
        lastUpdated: '2025-12-16'
    };
    console.log(`📈 Vehicle Statistics: Added`);

    // ===== 5. MAINTENANCE DATA =====
    const maintenance = {
        fluids: {
            oilType: '10W-40 Mineral',
            oilCapacity: '6.0 liter',
            coolantType: 'Glykol blå (G11)',
            gearboxOil: 'API GL-4 (Gulmetallsäker)'
        },
        battery: {
            type: 'Startbatteri 12V 100Ah',
            cca: 800,
            installed: '2025-12-03'
        },
        criticalNotes: [
            'OBS: 5-siffrig mätare. Verklig sträcka 13k, 23k eller 33k mil.',
            'Motor har körts med startgas - okänt slitage',
            'Kamrem är oljig men hel',
            'Växellåda: Använd ENDAST GL-4 olja (ej GL-5!)'
        ],
        maintenanceNotes: 'OBS: 5-siffrig mätare. Verklig sträcka troligen 13 362, 23 362 eller 33 362 mil.'
    };
    console.log(`🔧 Maintenance Data: Added`);

    // ===== 6. STRATEGIC DECISIONS (8) =====
    const projectMetadata = {
        projectId: 'elton-jsn398',
        participants: [
            { name: 'Joel Kvarnsmyr', role: 'Tekniskt ansvarig', competenceProfile: 'Erfaren (totalrenovering, svets, el)', assets: 'Garage på Gotland' },
            { name: 'Hanna Eriksson', role: 'Ägare & Lärling', competenceProfile: 'Nybörjare', assets: 'Ägare av fordonet' }
        ],
        context: {
            location: 'Saknar fast garage/verkstad. Verktyg hyrs via Ramirent.',
            seasonGoal: 'Körbar bil sommaren. Större jobb höst/vinter.',
            travelPlans: 'Gotland i sommar'
        },
        strategicDecisions: [
            { id: 'D1', area: 'motor', decision: 'MINIMAL_SERVICE_NOW', actionNow: 'Oljebyte, luftfiltertätning', actionFuture: 'Utvärdera efter sommaren', decidedDate: '2025-12-20' },
            { id: 'D2', area: 'doors', decision: 'REPLACE_WITH_USED', actionNow: 'Leta begagnade dörrar (Blocket, eBay.de)', actionFuture: 'Byt båda dörrarna', decidedDate: '2025-12-20' },
            { id: 'D3', area: 'roofLeak', decision: 'TEMPORARY_SEAL_NOW', actionNow: 'Sikaflex-tätning av takskarv', actionFuture: 'Ordentlig reparation höst/vinter', decidedDate: '2025-12-20' },
            { id: 'D4', area: 'roofHatch', decision: 'REPLACE_WITH_MODERN', actionNow: 'Beställa Fiamma Vent 40x40cm', actionFuture: 'Montera i sommar', decidedDate: '2025-12-20' },
            { id: 'D5', area: 'awning', decision: 'REMOVE_FOR_INSPECTION', actionNow: 'Demontera markis', actionFuture: 'Beslut efter inspektion av glasfibertak', decidedDate: '2025-12-20' },
            { id: 'D6', area: 'insulation', decision: 'KEEP_FOR_SUMMER', actionNow: 'Lev med befintlig isolering', actionFuture: 'Göra om isolering förarhytt höst/vinter', decidedDate: '2025-12-20' },
            { id: 'D7', area: 'electrical', decision: 'TEMPORARY_LIFEPO4', actionNow: 'Bygg ~300Ah LiFePO4 separat', actionFuture: 'Komplett Victron-system senare', decidedDate: '2025-12-20' },
            { id: 'D8', area: 'repaint', decision: 'NOT_YET', actionNow: 'Punktbehandla rost', actionFuture: 'Omlackering om 2-3 år', decidedDate: '2025-12-20' }
        ],
        unknowns: [
            { item: 'Mätarställning', status: 'Okänd', theory: 'Mätaren slår om vid 10k. Verklig: 13k, 23k eller 33k mil.' },
            { item: 'Isolering i väggar', status: 'Okänd', theory: 'Misstänkt dålig' },
            { item: 'Växellådsolja & Nav', status: 'Okänd status' }
        ],
        constraints: [
            { type: 'resource', description: 'Saknar garage (begränsar stora jobb vintertid).' },
            { type: 'knowledge', description: 'Kompetensöverföring (Hanna lärs upp).' },
            { type: 'access', description: 'Garage på Gotland först höst/vinter.' }
        ]
    };
    console.log(`📋 Strategic Decisions: ${projectMetadata.strategicDecisions.length} decisions`);

    // ===== 7. CONTACTS / WORKSHOPS (8) =====
    const contacts = [
        { id: 'workshop-borlange-motor', name: 'Borlänge Motorrenovering AB', location: 'Borlänge', category: 'Specialist', specialty: 'Motorrenovering', note: 'Regionens experter på tunga jobb.' },
        { id: 'workshop-hanssons', name: 'Hanssons Bil & Motor', location: 'Borlänge', category: 'Veteran & Kaross', specialty: 'Äldre teknik, BMW', note: 'Entusiastens val.' },
        { id: 'workshop-hallklint', name: 'Hallklint Bil', location: 'Avesta', category: 'Veteran & Kaross', specialty: 'Veteranbilar (MG, Porsche)', note: 'Värt resan.' },
        { id: 'workshop-falu-bilplat', name: 'Falu Bilplåt', location: 'Falun', category: 'Veteran & Kaross', specialty: 'Plåt och rost', note: 'Experter på plåt.' },
        { id: 'workshop-kaptens', name: 'Kaptens Motor', location: 'Orsa', category: 'Specialist', specialty: 'Äldre teknik (Mazda/Fiat)', note: 'Glenn Brus expert.' },
        { id: 'workshop-total-bil', name: 'Total Bil', location: 'Falun', category: 'Service & Akut', specialty: 'Felsökning', note: 'Problemlösarna.' },
        { id: 'workshop-nini', name: 'Nini Verkstad', phone: '023-249 00', location: 'Falun', category: 'Service & Akut', specialty: 'Akutjour & drop-in', note: 'AKUTNUMMER! Även lördagar.' },
        { id: 'workshop-bil-ac', name: 'Bil & AC Center', location: 'Borlänge', category: 'Service & Akut', specialty: 'AC och allmän service', note: 'Ärliga och duktiga.' }
    ];
    console.log(`🔧 Workshops/Contacts: ${contacts.length} contacts`);

    // ===== UPDATE VEHICLE DATA =====
    const doc = await projectRef.get();
    const currentData = doc.data();

    const updatedVehicleData = {
        ...currentData.vehicleData,
        mileageHistory: mileageHistory,
        historyEvents: historyEvents,
        priceHistory: priceHistory,
        statistics: statistics,
        maintenance: maintenance
    };

    // ===== SAVE TO FIRESTORE =====
    await projectRef.update({
        vehicleData: updatedVehicleData,
        projectMetadata: projectMetadata,
        contacts: contacts,
        lastModified: new Date().toISOString()
    });
    console.log('\n✅ Project document updated!');

    // ===== 8. KNOWLEDGE ARTICLES (4) =====
    const knowledgeRef = projectRef.collection('knowledgeBase');

    const articles = [
        {
            id: 'kb-parts-hunting',
            title: 'Proffstips för Deljakt',
            summary: '4 viktiga tips för att hitta reservdelar till VW LT31',
            content: '# Proffstips\n\n1. **Använd OEM-nummer** vid sökning\n2. **Bultmönster 5x160** är unikt för LT\n3. **Motordelar = Audi 100** (samma motor CH)\n4. **Baklyktor är hårdvaluta** - köp om du ser!',
            tags: ['Reservdelar', 'Tips', 'eBay', 'OEM']
        },
        {
            id: 'kb-workshop-guide',
            title: 'Verkstadsguide Falun/Borlänge',
            summary: 'Komplett guide till rätt verkstad för veteranbil i Dalarna',
            content: '# Verkstäder\n\n## Avancerat\n- Borlänge Motorrenovering\n- Hanssons Bil\n\n## Veteran/Kaross\n- Hallklint Bil (Avesta) ⭐\n- Falu Bilplåt\n\n## Akut\n- Nini Verkstad: 023-249 00',
            tags: ['Verkstad', 'Dalarna', 'Service']
        },
        {
            id: 'kb-technical-analysis',
            title: 'Fordonsteknisk Analys',
            summary: 'Djupgående teknisk analys av VW LT31 JSN398',
            content: '# Motor CH (2.0L Bensin)\n\nSamma motor som:\n- Audi 100 (C1)\n- Porsche 924\n\n## Viktigt\n- Ventiljustering med **shims** (ej skruvar!)\n- Växellåda: **GL-4** olja (ej GL-5!)\n- Effekt: 75 hk',
            tags: ['Teknisk Data', 'Motor', 'CH-motor']
        },
        {
            id: 'kb-find-mechanic',
            title: 'Guide: Hitta Rätt Mekaniker',
            summary: 'Hur man testar om mekanikern passar för veteranbil',
            content: '# Lackmustestet\n\n**Fråga:** "Kan ni justera ventilerna?"\n\n✅ Rätt: "Ja, vi har shims-verktyg"\n❌ Fel: "Vi skruvar på justerskruvarna"',
            tags: ['Service', 'Mekaniker', 'Guide']
        }
    ];

    for (const article of articles) {
        await knowledgeRef.doc(article.id).set(article);
    }
    console.log(`📚 Knowledge Articles: ${articles.length} added`);

    console.log('\n' + '='.repeat(60));
    console.log('🎉 ALL MISSING DATA IMPORTED!');
    console.log('='.repeat(60));
    console.log('\n📋 SUMMARY:');
    console.log('   ✅ Mileage History: 9 data points');
    console.log('   ✅ History Events: 38 events');
    console.log('   ✅ Price History: 5 data points');
    console.log('   ✅ Vehicle Statistics');
    console.log('   ✅ Maintenance Data');
    console.log('   ✅ Strategic Decisions: 8 decisions');
    console.log('   ✅ Workshops/Contacts: 8 contacts');
    console.log('   ✅ Knowledge Articles: 4 articles');
    console.log('\n📱 Ladda om appen för att se allt!\n');
}

importAllMissingData()
    .then(() => process.exit(0))
    .catch(e => { console.error('❌ Error:', e); process.exit(1); });
