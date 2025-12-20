"use strict";
/**
 * ELTON DETAILED INSPECTION DATA
 *
 * Converted from inspektionsdata-elton.json to DetailedInspection format
 * Date: 2025-12-20
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELTON_DETAILED_INSPECTION = void 0;
exports.ELTON_DETAILED_INSPECTION = {
    id: 'inspection-elton-2025-12-20',
    projectId: 'elton-jsn398',
    date: '2025-12-20',
    inspectors: ['Joel Kvarnsmyr', 'Hanna Eriksson'],
    type: 'Totalinspektion (Exteriör, Interiör, Mekaniskt)',
    sourceFiles: ['Elton exteriör.m4a', 'Elton interiör.m4a'],
    statistics: {
        total: 88,
        negative: 68,
        positive: 20
    },
    areas: [
        // --- TAK ---
        {
            areaId: 1,
            name: 'Taket',
            actionLabel: 'TÄTA AKUT',
            actionPriority: 'HIGH',
            summary: { negative: 12, positive: 2 },
            findings: [
                { id: 1, category: 'Anmärkning', type: 'Sprickor', description: 'Taket har sprickbildningar på cirka 10 olika ställen.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: '2', category: 'Anmärkning', type: 'Rost/Lacksläpp', description: 'Lacken har rest sig och rost tränger fram på flera ställen.', linkedTaskIds: ['rust-spot-treatment'], severity: 'MEDIUM' },
                { id: '3', category: 'Anmärkning', type: 'Konstruktion', description: 'Det finns osäkra skruvar som misstänks orsaka vattenläckage.', linkedTaskIds: ['rust-roof-seal'], severity: 'HIGH' },
                { id: 4, category: 'Anmärkning', type: 'Struktur', description: 'En svacka i taket har noterats vid vänster framkant.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 5, category: 'Anmärkning', type: 'Spricka', description: 'Kraftig sprickbildning på vänster sida, ungefär en tredjedel från bakre delen.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 6, category: 'Anmärkning', type: 'Rost', description: 'Genomgående rostangrepp runt hela den horisontella listen/vattenrännan.', linkedTaskIds: ['rust-spot-treatment'], severity: 'HIGH' },
                { id: 7, category: 'Anmärkning', type: 'Sprickor', description: 'Sprickor i glasfibern framtill, troligen orsakade av skruvmontering.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 8, category: 'Anmärkning', type: 'Läckage', description: 'Vattenläckage vid markisens infästning på höger sida.', linkedTaskIds: ['awning-remove'], severity: 'HIGH' },
                { id: 9, category: 'Anmärkning', type: 'Rostskada', description: 'Större rostreaktion i glasfibern direkt under markisfästet.', linkedTaskIds: ['awning-remove'], severity: 'HIGH' },
                { id: 10, category: 'Anmärkning', type: 'Spricka', description: 'Kraftig spricka i lacken längst fram ovanför förardörren.', linkedTaskIds: ['rust-roof-seal'], severity: 'MEDIUM' },
                { id: 11, category: 'Anmärkning', type: 'Isolering/Kondens', description: 'Dåligt utförd isolering i taket (baktill), vilket exponerar yttertaket och riskerar kondensproblem.', detail: 'Isoleringen består av 5-7 cm tjocka skivor men verkar vara bristfälligt monterade på vissa ställen.', severity: 'MEDIUM' },
                { id: 12, category: 'Anmärkning', type: 'Kondensrisk', description: 'Synligt yttertak inifrån på grund av bristfällig isolering/täckning.', severity: 'MEDIUM' },
                { id: 13, category: 'Positivt', type: 'Skick', description: 'Taket bedöms i övrigt vara i relativt gott skick.' },
                { id: 14, category: 'Positivt', type: 'Skick', description: 'Endast mindre anmärkningar noterades på bakre delen/toppen.' }
            ]
        },
        // --- VÄNSTER SIDA ---
        {
            areaId: 2,
            name: 'Vänster sida (Förardörr & Kaross)',
            actionLabel: 'BYT UT',
            actionPriority: 'HIGH',
            summary: { negative: 14, positive: 4 },
            findings: [
                { id: 15, category: 'Anmärkning', type: 'Läckage', description: 'Fuktgenomträngning inifrån dörrlisten på förardörren.', linkedTaskIds: ['rust-roof-seal'], severity: 'HIGH' },
                { id: 16, category: 'Anmärkning', type: 'Rost', description: 'Genomrostning inifrån listen på förardörren.', linkedTaskIds: ['door-driver-replace'], severity: 'CRITICAL' },
                { id: 17, category: 'Anmärkning', type: 'Rost', description: 'Kraftiga rostskador längs nederkanten av förardörrens dörrblad.', linkedTaskIds: ['door-driver-replace'], severity: 'CRITICAL' },
                { id: 18, category: 'Anmärkning', type: 'Dåligt arbete', description: 'Bristfällig svetsning vid dörrinsteget (endast punktsvetsat och ej färdigställt).', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 19, category: 'Anmärkning', type: 'Dålagt arbete', description: 'Bristfälligt svetsarbete bakom vänster framhjul (endast övermålat).', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 20, category: 'Anmärkning', type: 'Lacksläpp', description: 'Lacksläpp under det främre fönstret på bodelen.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 21, category: 'Anmärkning', type: 'Rost', description: 'Mindre rostgenomslag under det främre fönstret på bodelen.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 22, category: 'Anmärkning', type: 'Montering', description: 'Fönstret verkar sitta löst och behöver spännas om.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 23, category: 'Anmärkning', type: 'Spricka', description: 'Kraftig spricka i plastdetaljen framför fönstret.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 24, category: 'Anmärkning', type: 'Rost', description: 'Rostgenomslag vid den nedre skärmkanten framför bakdäcket.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 25, category: 'Anmärkning', type: 'Rost', description: 'Rostangrepp vid skärmfästet ovanför bakdäcket.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 26, category: 'Anmärkning', type: 'Lack/Rost', description: 'Lacksläpp och rostangrepp på vänster bakdel.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 27, category: 'Anmärkning', type: 'Rost', description: 'Rostgenomslag i den vertikala sömmen baktill.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 28, category: 'Anmärkning', type: 'Rost/Fukt', position: 'Insida över förardörr', description: 'Fuktinslag och genomrostning i balken ovanför förardörren (insida), misstänkt läckage från takskarven.', linkedTaskIds: ['rust-roof-seal'], severity: 'HIGH' },
                { id: 29, category: 'Positivt', type: 'Material', description: 'Stålet i förardörren bedöms fortfarande vara relativt solitt trots rostskador.' },
                { id: 30, category: 'Positivt', type: 'Skick', description: 'Överkant och sidor runt bodelsfönstret ser bra ut.' },
                { id: 31, category: 'Positivt', type: 'Funktion', description: 'Bodelsfönstret går att stänga ordentligt.' },
                { id: 32, category: 'Positivt', type: 'Skick', description: 'Elintaget ser bra ut och saknar rost.' }
            ]
        },
        // --- BAKSIDA ---
        {
            areaId: 3,
            name: 'Baksidan',
            actionLabel: 'FIXA LJUS',
            actionPriority: 'CRITICAL',
            summary: { negative: 10, positive: 1 },
            findings: [
                { id: 33, category: 'Anmärkning', type: 'Rost', description: 'Rostgenomslag precis ovanför bakfönstret.', linkedTaskIds: ['rear-fixes'], severity: 'MEDIUM' },
                { id: 34, category: 'Anmärkning', type: 'Sprickor', description: 'Lack som spruckit ovanför bakfönstret.', linkedTaskIds: ['rear-fixes'], severity: 'LOW' },
                { id: 35, category: 'Anmärkning', type: 'Lacksläpp', description: 'Lacksläpp under bakfönstret.', linkedTaskIds: ['rear-fixes'], severity: 'LOW' },
                { id: 36, category: 'Anmärkning', type: 'Rost', description: 'Kraftigt rostangrepp på profilstål (troligen fäste för box), verkar vara obehandlat.', linkedTaskIds: ['rear-fixes'], severity: 'HIGH' },
                { id: 37, category: 'Anmärkning', type: 'Saknad del', description: 'Skruvar saknas till vänster baklykta.', linkedTaskIds: ['rear-fixes'], severity: 'MEDIUM' },
                { id: 38, category: 'Anmärkning', type: 'Lacksläpp', description: 'Omfattande lacksläpp runt vänster baklykta.', linkedTaskIds: ['rear-fixes'], severity: 'LOW' },
                { id: 39, category: 'Anmärkning', type: 'Dold skada', description: 'Gummitejp döljer okänt skick i nederkant (möjligtvis bortskuret material), bör inspekteras.', linkedTaskIds: ['rear-fixes'], severity: 'MEDIUM' },
                { id: 40, category: 'Anmärkning', type: 'Dåligt arbete', description: 'Bristfälliga svetsar vid igensvetsad dörr/lucka.', linkedTaskIds: ['rear-fixes'], severity: 'LOW' },
                { id: 41, category: 'Anmärkning', type: 'Defekt/Elfel', description: 'Positionsljus bak fungerar ej (troligen urkopplat). Endast bromsljus och blinkers fungerar.', linkedTaskIds: ['rear-fixes'], severity: 'CRITICAL' },
                { id: 42, category: 'Anmärkning', type: 'Konstruktion', description: 'Öppet in mot baklyktorna inifrån, arbetet verkar oavslutat.', linkedTaskIds: ['rear-fixes'], severity: 'LOW' },
                { id: 43, category: 'Positivt', type: 'Skick', description: 'Bakfönstret bedöms vara i skapligt skick.' }
            ]
        },
        // --- HÖGER SIDA / SKJUTDÖRR ---
        {
            areaId: 4,
            name: 'Höger sida (Passagerarsida & Skjutdörr)',
            actionLabel: 'BYT DÖRR',
            actionPriority: 'HIGH',
            summary: { negative: 11, positive: 4 },
            findings: [
                { id: 44, category: 'Anmärkning', type: 'Kosmetisk', description: 'Märken efter bensin och avvikande lack vid tanklocket.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 45, category: 'Anmärkning', type: 'Skada', description: 'Skrapskador på hjulskärmen orsakade av en feljusterad dörr.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 46, category: 'Anmärkning', type: 'Spackel', description: 'Gammalt och fult spackelarbete framför höger bakdäck.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 47, category: 'Anmärkning', type: 'Rost', description: 'Rostgenomslag framför höger bakdäck.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 48, category: 'Anmärkning', type: 'Slitage', description: 'Lager och hjul i skjutdörrens skena är utslitna, vilket gör att dörren hänger.', linkedTaskIds: ['door-sliding-replace'], severity: 'MEDIUM' },
                { id: 49, category: 'Anmärkning', type: 'Rost', description: 'Kraftiga rostskador på skjutdörrens nedersta 5-10 cm.', linkedTaskIds: ['door-sliding-replace'], severity: 'CRITICAL' },
                { id: 50, category: 'Anmärkning', type: 'Röta', description: 'Konstruktionen i skjutdörrens nederkant är helt rutten och kan behöva bytas.', linkedTaskIds: ['door-sliding-replace'], severity: 'CRITICAL' },
                { id: 51, category: 'Anmärkning', type: 'Fuktskada', description: 'Fuktskada på bänkskivan innanför skjutdörren orsakad av läckage.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 52, category: 'Anmärkning', type: 'Skada', description: 'Listen runt skjutdörren är trasig och behöver bytas.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 53, category: 'Anmärkning', type: 'Dåligt arbete', description: 'Halvfärdig svetslagning bakom höger framhjul.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'LOW' },
                { id: 54, category: 'Anmärkning', type: 'Rost', description: 'Kraftigt rostgenomslag bakom höger framhjul.', linkedTaskIds: ['cosmetic-rust-fixes'], severity: 'MEDIUM' },
                { id: 55, category: 'Positivt', type: 'Skick', description: 'Karosspartiet fram till skjutdörren ser bra ut.' },
                { id: 56, category: 'Positivt', type: 'Skick', description: 'Det bakre hjulhuset ser helt okej ut utan allvarlig rost.' },
                { id: 57, category: 'Positivt', type: 'Skick', description: 'Skjutdörrens överkant, hängning och dörrsteg är i gott skick.' },
                { id: 58, category: 'Positivt', type: 'Skick', description: 'Ingen rost noterades vid den nedre glidskenan.' }
            ]
        },
        // --- PASSAGERARDÖRR ---
        {
            areaId: 5,
            name: 'Passagerardörr (Höger fram)',
            actionLabel: 'LAPPA',
            actionPriority: 'MEDIUM',
            summary: { negative: 2, positive: 3 },
            findings: [
                { id: 59, category: 'Anmärkning', type: 'Hål/Skada', description: 'Hål och skador i plåten vid passagerardörrens insteg, kräver reparation.', linkedTaskIds: ['passenger-door-fixes'], severity: 'HIGH' },
                { id: 60, category: 'Anmärkning', type: 'Justering', description: 'Passagerardörren behöver justeras då vatten rinner in (läcker ej inifrån).', linkedTaskIds: ['passenger-door-fixes'], severity: 'MEDIUM' },
                { id: 61, category: 'Positivt', type: 'Skick', description: 'Dörrens överkant och området runt fönstret är i mycket fint skick.' },
                { id: 62, category: 'Positivt', type: 'Skick', description: 'Dörren saknar i princip rostangrepp.' },
                { id: 63, category: 'Positivt', type: 'Skick', description: 'Gummilisterna bedöms vara i helt okej skick.' }
            ]
        },
        // --- FRAMSIDA ---
        {
            areaId: 6,
            name: 'Framsidan & Hjulhus fram',
            actionLabel: 'ROST',
            actionPriority: 'LOW',
            summary: { negative: 6, positive: 1 },
            findings: [
                { id: 64, category: 'Anmärkning', type: 'Dåligt arbete', description: 'Bristfällig lagning av golvet i hjulhuset (gammal plåt kvarlämnad).', linkedTaskIds: ['front-fixes'], severity: 'MEDIUM' },
                { id: 65, category: 'Anmärkning', type: 'Rost', description: 'Rostgenomslag i nederkanten runt framfönstret.', linkedTaskIds: ['front-fixes'], severity: 'MEDIUM' },
                { id: 66, category: 'Anmärkning', type: 'Rost', description: 'Rostangrepp vid luftintaget.', linkedTaskIds: ['front-fixes'], severity: 'MEDIUM' },
                { id: 67, category: 'Anmärkning', type: 'Kosmetisk', description: 'Fult utfört spackelarbete vid blinkers.', linkedTaskIds: ['front-fixes'], severity: 'LOW' },
                { id: 68, category: 'Anmärkning', type: 'Rost/Lack', description: 'Rost och lacksläpp som rest sig under vindrutan.', linkedTaskIds: ['front-fixes'], severity: 'MEDIUM' },
                { id: 69, category: 'Anmärkning', type: 'Mekanisk', description: 'Fästet till radioantennen sitter löst.', linkedTaskIds: ['front-fixes'], severity: 'LOW' },
                { id: 70, category: 'Positivt', type: 'Skick', description: 'Lyktor och blinkers är fria från rost (nyligen restaurerade).' }
            ]
        },
        // --- UNDERREDE ---
        {
            areaId: 7,
            name: 'Underrede',
            actionLabel: 'SVETSA & SKYDDA',
            actionPriority: 'MEDIUM',
            summary: { negative: 1, positive: 1 },
            findings: [
                { id: 71, category: 'Anmärkning', type: 'Strukturell rost', description: 'Kraftiga rostgenomslag på den tvärgående balken efter hjulhuset, bör bytas.', linkedTaskIds: ['rust-beam-weld'], severity: 'HIGH' },
                { id: 72, category: 'Positivt', type: 'Skick', description: 'Underredet bedöms i övrigt vara i mycket fint skick utan anmärkningar.' }
            ]
        },
        // --- MOTOR ---
        {
            areaId: 8,
            name: 'Motor & Mekaniskt',
            actionLabel: 'SERVICE & UTVÄRDERA',
            actionPriority: 'MEDIUM',
            summary: { negative: 7, positive: 3 },
            findings: [
                { id: 73, category: 'Anmärkning', delkomponent: 'Luftfilter', type: 'Otät', description: 'Luftfiltrets in- och utgångar är inte täta/låsta. Risk för oren luft pga. öppning för startgas.', action: 'Överväg motorbyte eller fullservice.', linkedTaskIds: ['motor-oil-change'], severity: 'MEDIUM' },
                { id: 74, category: 'Anmärkning', delkomponent: 'Bränslesystem', type: 'Montering', description: 'Bränslepump och filterpaket verkar vara "taffligt" eftermonterat framme i motorrummet (borde sitta bak vid tanken).', severity: 'LOW' },
                { id: 75, category: 'Anmärkning', delkomponent: 'Motor/Topplock', type: 'Oljeläckage', description: 'Motorn är oljig överlag, topplocket är helt neroljat. Synliga tecken på tidigare "korrigering" vid tändstiften.', linkedTaskIds: ['motor-oil-change'], severity: 'MEDIUM' },
                { id: 76, category: 'Anmärkning', delkomponent: 'Luftfilterbox', type: 'Rost', description: 'Luftfilterlådan i plåt är rostig och bör åtgärdas.', action: 'Rostbehandla och måla.', severity: 'LOW' },
                { id: 77, category: 'Anmärkning', delkomponent: 'Kamrem', type: 'Oljig', description: 'Kamremmen är hel och utan sprickor, men oljig, vilket bör bevakas.', linkedTaskIds: ['motor-evaluation'], severity: 'MEDIUM' },
                { id: 78, category: 'Anmärkning', delkomponent: 'Motorolja', type: 'Nivåfel', description: 'Oljenivån är något hög, men oljan är fri från bubblor och fukt.', linkedTaskIds: ['motor-oil-change'], severity: 'LOW' },
                { id: 79, category: 'Anmärkning', delkomponent: 'Kylarvatten', type: 'Smuts', description: 'Smuts har samlats på botten av tanken, men kylarvattnet har fin färg.', severity: 'LOW' },
                { id: 80, category: 'Positivt', delkomponent: 'Slangar', description: 'Samtliga slangar ser fräscha ut och saknar sprickor.' },
                { id: 81, category: 'Positivt', delkomponent: 'Oljefilter', description: 'Oljefiltret ser ut att vara nyligen bytt.' },
                { id: 82, category: 'Positivt', delkomponent: 'Motorgång', description: 'Motorn går jämnt och fint, känns trygg att köra.' }
            ]
        },
        // --- ELSYSTEM ---
        {
            areaId: 9,
            name: 'Elsystem & Elektronik',
            actionLabel: 'BYGG OM',
            actionPriority: 'HIGH',
            summary: { negative: 3, positive: 0 },
            findings: [
                { id: 83, category: 'Anmärkning', delkomponent: 'Säkringsskåp', type: 'Dåligt utfört', description: 'Icke fackmannamässiga tillägg i säkringsskåpet, bör göras om.', linkedTaskIds: ['el-temp-battery'], severity: 'MEDIUM' },
                { id: 84, category: 'Anmärkning', delkomponent: 'Batterisystem', type: 'Felkopplat', description: 'Bodel- och motorbatteri är direkt hopkopplade med en switch, vilket innebär risk för urladdning. Kablarna till batterier och startmotor är underdimensionerade.', action: 'Bygg om systemet, separera kretsarna och dimensionera om kablaget.', linkedTaskIds: ['el-temp-battery'], severity: 'HIGH' },
                { id: 85, category: 'Anmärkning', delkomponent: 'Ljudsystem', type: 'Kabeldragning', description: 'Kabeldragningen till högtalare i dörrar och interiör är slarvigt utförd.', severity: 'LOW' }
            ]
        },
        // --- INTERIÖR ---
        {
            areaId: 10,
            name: 'Interiör & Förarhytt',
            actionLabel: 'PIFF',
            actionPriority: 'LOW',
            summary: { negative: 4, positive: 0 },
            findings: [
                { id: 86, category: 'Anmärkning', delkomponent: 'Instrumentpanel', type: 'Ur funktion', description: 'Eftermonterade instrument fungerar ej.', action: 'Ta bort och återställ.', linkedTaskIds: ['interior-fixes'], severity: 'LOW' },
                { id: 87, category: 'Anmärkning', delkomponent: 'Fläktsystem', type: 'Svag funktion', description: 'Kupéfläkten har dålig effekt och reglageknappar saknas.', linkedTaskIds: ['interior-fixes'], severity: 'LOW' },
                { id: 88, category: 'Anmärkning', delkomponent: 'Golv/Mattor', type: 'Slitage', description: 'Golvmattorna är trasiga och golvet vid passagerarsätet är slitet.', linkedTaskIds: ['interior-fixes'], severity: 'LOW' },
                { id: 89, category: 'Anmärkning', delkomponent: 'Lister', type: 'Montering', description: 'Lister i interiören är generellt felmonterade eller sitter dåligt.', linkedTaskIds: ['interior-fixes'], severity: 'LOW' }
            ]
        }
    ]
};
