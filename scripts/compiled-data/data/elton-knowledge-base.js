"use strict";
/**
 * Elton Knowledge Articles
 * External links, guides, and reference documentation
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.ELTON_KNOWLEDGE_ARTICLES = exports.ELTON_WORKSHOPS = exports.ELTON_RESOURCE_LINKS = void 0;
// ============================================================================
// EXTERNAL RESOURCE LINKS
// ============================================================================
exports.ELTON_RESOURCE_LINKS = [
    // Manualer & Info
    {
        category: 'Manualer & Info',
        title: 'Haynes Manual VW LT (1976-1987)',
        url: 'https://www.haynes.com/en-gb/volkswagen/lt',
        description: 'Bibeln för hemma-mekaniker. Ett måste i handskfacket.'
    },
    {
        category: 'Manualer & Info',
        title: 'LT-Freunde (Tyskt Forum)',
        url: 'https://www.lt-freunde.de',
        description: 'Världens största kunskapsbank för LT1. Använd Google Translate.'
    },
    // Delar & Köp
    {
        category: 'Delar & Köp',
        title: 'Bildelsbasen',
        url: 'https://www.bildelsbasen.se',
        description: 'Sök på begagnade delar i Sverige. Bra för dörrar och kaross.'
    },
    {
        category: 'Delar & Köp',
        title: 'Brickwerks (UK)',
        url: 'https://www.brickwerks.co.uk',
        description: 'Specialister på VW-bussar. Har ofta svåra delar till LT.'
    },
    {
        category: 'Delar & Köp',
        title: 'VW Classic Parts',
        url: 'http://www.vw-classic-parts.de',
        description: 'Volkswagens egna lager för veteranbilar.'
    },
    {
        category: 'Delar & Köp',
        title: 'eBay Tyskland (eBay.de)',
        url: 'https://www.ebay.de',
        description: 'Sök på "VW LT 31" här. Tyskland har mest.'
    }
];
// ============================================================================
// WORKSHOPS / CONTACTS (Falun/Borlänge region)
// ============================================================================
exports.ELTON_WORKSHOPS = [
    // Avancerad Mekanik
    {
        id: 'workshop-borlange-motor',
        name: 'Borlänge Motorrenovering AB',
        phone: '',
        email: '',
        location: 'Borlänge',
        category: 'Specialist',
        specialty: 'Motorrenovering och tunga jobb',
        note: 'Regionens experter på tunga jobb. Om din motor rasar eller behöver borras, är det hit du går.'
    },
    {
        id: 'workshop-hanssons',
        name: 'Hanssons Bil & Motor',
        phone: '',
        email: '',
        location: 'Borlänge',
        category: 'Veteran & Kaross',
        specialty: 'Äldre teknik, BMW, veteranbilar',
        note: 'Entusiastens val. Djupt kunnande om äldre teknik.'
    },
    // Veteranbilar & Kaross
    {
        id: 'workshop-hallklint',
        name: 'Hallklint Bil',
        phone: '',
        email: '',
        location: 'Avesta',
        category: 'Veteran & Kaross',
        specialty: 'Veteranbilar (MG, Porsche, Land Rover)',
        note: 'Värt resan. De förstår förgasare och analoga fordon.'
    },
    {
        id: 'workshop-falu-bilplat',
        name: 'Falu Bilplåt',
        phone: '',
        email: '',
        location: 'Falun',
        category: 'Veteran & Kaross',
        specialty: 'Plåt och rost',
        note: 'Experter på plåt och rost. De tar sig an äldre bilar och kan även PDR.'
    },
    {
        id: 'workshop-kaptens',
        name: 'Kaptens Motor',
        phone: '',
        email: '',
        location: 'Orsa',
        category: 'Specialist',
        specialty: 'Äldre teknik (Mazda/Fiat)',
        note: 'Glenn Brus är en expert på äldre teknik.'
    },
    // Allmänservice
    {
        id: 'workshop-total-bil',
        name: 'Total Bil',
        phone: '',
        email: '',
        location: 'Falun',
        category: 'Service & Akut',
        specialty: 'Felsökning',
        note: 'Problemlösarna. Kända för att inte ge upp vid felsökning.'
    },
    {
        id: 'workshop-nini',
        name: 'Nini Verkstad',
        phone: '023-249 00',
        email: '',
        location: 'Falun',
        category: 'Service & Akut',
        specialty: 'Akutjour & drop-in',
        note: 'AKUTNUMMER! De har akutjour och drop-in, även lördagar. En räddare i nöden.'
    },
    {
        id: 'workshop-bil-ac',
        name: 'Bil & AC Center',
        phone: '',
        email: '',
        location: 'Borlänge',
        category: 'Service & Akut',
        specialty: 'AC och allmän service',
        note: 'Ärliga och duktiga, särskilt på AC.'
    }
];
// ============================================================================
// KNOWLEDGE ARTICLES
// ============================================================================
exports.ELTON_KNOWLEDGE_ARTICLES = [
    // Article 1: Proffstips för Deljakt
    {
        id: 'kb-parts-hunting-tips',
        title: 'Proffstips för Deljakt',
        summary: '4 viktiga tips när du ska köpa reservdelar till VW LT31',
        content: "# Proffstips f\u00F6r Deljakt\n\n## 1. Anv\u00E4nd alltid originalnumret (OEM)\nN\u00E4r du s\u00F6ker delar p\u00E5 eBay eller hos leverant\u00F6rer, anv\u00E4nd alltid OEM-numret (Original Equipment Manufacturer). Detta garanterar r\u00E4tt passform.\n\n**Exempel:** Ist\u00E4llet f\u00F6r att s\u00F6ka p\u00E5 \"bromsskiva VW LT\", s\u00F6k p\u00E5 OEM-numret som t.ex. \"357615301\".\n\n## 2. Bultm\u00F6nstret 5x160 \u00E4r unikt\nF\u00E4lgar till LT har bultm\u00F6nster **5x160mm**, vilket \u00E4r unikt f\u00F6r LT och Ford Transit (Mk1/Mk2). \n\n\u26A0\uFE0F **VIKTIGT:** F\u00E4lgar fr\u00E5n andra bilar passar INTE!\n\n## 3. Motordelar = Audi 100\nMotordelar till bensinaren (2.0L kod CH) \u00E4r ofta samma som till **Audi 100** fr\u00E5n samma era (1976-1982).\n\n**Pro-tip:** S\u00F6k p\u00E5 \"Audi 100 C1 2.0\" n\u00E4r du letar ventiler, packningar, eller kamrem. Du hittar mycket mer!\n\n## 4. Baklyktor \u00E4r h\u00E5rdvaluta\nBaklyktor och blinkersglas \u00E4r extremt sv\u00E5ra att hitta. Var r\u00E4dd om originaldelarna!\n\nOm du hittar kompletta baklyktor p\u00E5 eBay eller skrot \u2192 K\u00D6P DIREKT (\u00E4ven som reserv).",
        tags: ['Reservdelar', 'Tips', 'eBay', 'OEM']
    },
    // Article 2: Verkstadsanalys Falun/Borlänge
    {
        id: 'kb-workshop-guide-falun',
        title: 'Strategisk Analys: Verkstäder i Falun/Borlänge',
        summary: 'Komplett guide till rätt verkstad för veteranbil i Dalarna',
        content: "# Strategisk Analys: Verkst\u00E4der i Falun-Borl\u00E4nge\n\n## Inledning\nAtt hitta r\u00E4tt verkstad f\u00F6r en bil fr\u00E5n 1976 \u00E4r sv\u00E5rt. Moderna kedjor saknar ofta kompetensen f\u00F6r f\u00F6rgasare och ventilshims. H\u00E4r \u00E4r de b\u00E4sta alternativen i din region.\n\n## 1. Avancerad Mekanik & Motorrenovering\n\n### Borl\u00E4nge Motorrenovering AB\nRegionens experter p\u00E5 tunga jobb. Om din motor rasar eller beh\u00F6ver borras, \u00E4r det hit du g\u00E5r. De kan ocks\u00E5 ha delar till \u00E4ldre motorer.\n\n### Hanssons Bil & Motor (Borl\u00E4nge)\nEntusiastens val. Djupt kunnande om \u00E4ldre teknik och BMW, men bra p\u00E5 allt mekaniskt.\n\n## 2. Veteranbilar & Kaross\n\n### Hallklint Bil (Avesta)\n\u2B50 **V\u00E4rt resan!** De har specialiserat sig p\u00E5 veteranbilar och \"analoga\" fordon (MG, Porsche, Land Rover). De f\u00F6rst\u00E5r f\u00F6rgasare.\n\n### Falu Bilpl\u00E5t (Falun)\nExperter p\u00E5 pl\u00E5t och rost. De tar sig an \u00E4ldre bilar och kan \u00E4ven PDR (bucklor).\n\n### Kaptens Motor (Orsa)\nGlenn Brus \u00E4r en expert p\u00E5 \u00E4ldre teknik (Mazda/Fiat).\n\n## 3. Allm\u00E4nservice (B\u00E4st omd\u00F6men)\n\n### Total Bil (Falun)\nProbleml\u00F6sarna. K\u00E4nda f\u00F6r att inte ge upp vid fels\u00F6kning.\n\n### \u26A1 Nini Verkstad (Falun)\n**Spara detta nummer!** \uD83D\uDCDE 023-249 00\n\nDe har akutjour och drop-in, \u00E4ven l\u00F6rdagar. En r\u00E4ddare i n\u00F6den.\n\n### Bil & AC Center (Borl\u00E4nge)\n\u00C4rliga och duktiga, s\u00E4rskilt p\u00E5 AC och allm\u00E4n service.\n\n---\n\n## Strategiska Rekommendationer\n\n| Situation | Rekommendation |\n|-----------|----------------|\n| **Veteran-jobb** | Undvik Mekonomen/kedjorna. \u00C5k till Hallklint eller Hanssons. |\n| **Akut** | Ring Nini Verkstad 023-249 00 |\n| **Delar** | F\u00F6rs\u00F6k hitta delarna sj\u00E4lv och ta med till verkstaden |\n\n---\n\n## \u26A0\uFE0F Vad du ska UNDVIKA\n- Stora kedjor (Mekonomen, Bilia) f\u00F6r motortekniska jobb\n- Verkst\u00E4der som s\u00E4ger \"vi kan allt\"\n- Platser som bara har OBD-diagnostik (din bil har inget diagnosuttag)",
        tags: ['Verkstad', 'Dalarna', 'Service', 'Rekommendationer']
    },
    // Article 3: Fordonsteknisk Analys
    {
        id: 'kb-technical-analysis',
        title: 'Fordonsteknisk Analys: VW LT31 (JSN398)',
        summary: 'Djupgående teknisk analys av Eltons specifikationer och systembeskrivning',
        content: "# Fordonsteknisk Analys: Volkswagen LT31 (JSN398)\n\n## Exekutiv Sammanfattning\nDenna rapport analyserar ditt fordon JSN398, en Volkswagen LT31 av 1976 \u00E5rs modell. Det \u00E4r ett tidigt exemplar (\"Series 1\") utrustad med den v\u00E4tskekylda 2,0-liters bensinmotorn (kod CH), som den delar med Audi 100 och Porsche 924.\n\n## Avkodning av Identitet\n\n**Chassinummer:** 2862500058\n\n- **28:** VW LT-serien (Typ 28)\n- **6:** Modell\u00E5r 1976\n- **500058:** Tillverkad i Hannover. Ett l\u00E5gt nummer som indikerar att det \u00E4r en tidig bil.\n\n## Drivlinans Ingenj\u00F6rskonst: Motor CH (2.0L Bensin)\n\nHj\u00E4rtat i JSN398 \u00E4r bensinmotorn med koden **CH**. Detta \u00E4r en tekniskt intressant kraftk\u00E4lla.\n\n### Sl\u00E4ktskap\nSamma grundmotorblock anv\u00E4ndes i:\n- Audi 100 (C1)\n- Porsche 924\n  \n\uD83D\uDCA1 **Pro-tip:** S\u00F6k delar till dessa bilar!\n\n### Ventiljustering\nMotorn anv\u00E4nder **shims (brickor)** f\u00F6r ventiljustering, inte skruvar. Detta \u00E4r kritiskt att veta f\u00F6r mekanikern.\n\n### Specifikation\n- **Effekt:** 75 hk\n- **Ventiler:** SOHC (Single Overhead Camshaft)\n- **Drivning:** Kamrem\n\n## Kritisk Underh\u00E5llsinfo\n\n| Komponent | Specifikation | Notering |\n|-----------|---------------|----------|\n| **F\u00F6rgasare** | Solex 35 PDSIT-5 | K\u00E4nd f\u00F6r problem med automatchoken |\n| **Kylsystem** | Vattenkyld | Motorn sitter tr\u00E5ngt (\"doghouse\"). Lufta systemet noga. |\n| **V\u00E4xell\u00E5da** | Manuell 4-v\u00E4xlad | \u26A0\uFE0F Kr\u00E4ver GL-4 olja (EJ GL-5!) |\n\n## Sammanfattande Datatabell f\u00F6r JSN398\n\n| Datapunkt | Specifikation | Notering |\n|---|---|---|\n| Modell | VW LT31 (Typ 28) | Modell\u00E5r 1976 |\n| Motor | 2.0L Bensin (Kod: CH) | 4-cylindrig radmotor (Audi-design) |\n| Ventilspel (Kall) | Insug: 0.15-0.25 / Avgas: 0.35-0.45 | Justeras med shims! |\n| T\u00E4ndstift | Bosch W7DTC | 0.7-0.8 mm |\n| T\u00E4ndning | 7.5\u00B0 F\u00D6D @ 900 v/min | Vakuum bortkopplad |\n| Olja Motor | 10W-40 Mineral | ca 4.5-5 liter |\n| Olja V\u00E4xell\u00E5da | SAE 80W-90 GL-4 | \u26A0\uFE0F EJ GL-5! |\n\n---\n\n## \uD83D\uDD27 Varf\u00F6r \u00E4r detta viktigt?\n\n### GL-4 vs GL-5 olja\nM\u00E5nga moderna verkst\u00E4der fyller automatiskt p\u00E5 GL-5 eftersom det \u00E4r \"b\u00E4ttre\". Men f\u00F6r \u00E4ldre v\u00E4xell\u00E5dor med m\u00E4ssingssynkroniseringar \u00E4r GL-5 **GIFTIGT** - det \u00E4ter upp m\u00E4ssingen!\n\n### Shims f\u00F6r ventiljustering\nOm en mekaniker s\u00E4ger \"jag skruvar bara p\u00E5 justerings-skruvarna\" f\u00F6r ventilspelet \u2192 **FEL BIL**. De t\u00E4nker p\u00E5 en luftkyld VW-motor. Din motor har inga skruvar, den kr\u00E4ver shims (brickor).",
        tags: ['Teknisk Data', 'Motor', 'Specifikationer', 'CH-motor']
    },
    // Article 4: Guide - Hitta Rätt Mekaniker
    {
        id: 'kb-find-mechanic-guide',
        title: 'Guide: Hitta Rätt Mekaniker & Serviceplan',
        summary: 'Komplett guide för att hitta kompetent mekaniker och planera service',
        content: "# Guide: Hitta R\u00E4tt Mekaniker & Serviceplan\n\n## 1. Vem ska du leta efter?\n\n\u274C **Undvik:** Stora moderna verkstadskedjor. De \u00E4r duktiga p\u00E5 att koppla in datorer, men din bil har inget diagnosuttag.\n\n\u2705 **Leta efter:**\n- \"Gubbverkst\u00E4der\"\n- Veteranbilsspecialister\n- Verkst\u00E4der som skyltar med \"Klassiska VW/Audi\"\n\n### Det hemliga tipset\nEftersom din motor (CH) \u00E4r en **Audi-motor** som ocks\u00E5 satt i Porsche 924, kan en gammal Porsche-specialist eller en Audi-entusiast ofta vara b\u00E4ttre \u00E4n en renodlad \"Folkabuss-mekaniker\" (som \u00E4r vana vid luftkylda boxermotorer).\n\n---\n\n## 2. \"Lackmustestet\" \u2013 Fr\u00E5gor f\u00F6r att testa mekanikern\n\nN\u00E4r du ringer, st\u00E4ll dessa fr\u00E5gor f\u00F6r att avg\u00F6ra om de vet vad de pratar om.\n\n### Fr\u00E5ga 1 (Det viktigaste)\n**\"Kan ni justera ventilerna p\u00E5 den h\u00E4r motorn? Det \u00E4r en 2-liters bensinare (CH).\"**\n\n\u2705 **R\u00E4tt svar:** \"Ja, vi har verktyg f\u00F6r att byta shims (brickor).\" Eller: \"Har du shims-sats?\"\n\n\u274C **Fel svar:** \"Jad\u00E5, vi skruvar bara p\u00E5 justerskruvarna.\"  \n\u2192 D\u00E5 tror de att det \u00E4r en gammal Folkabuss-motor. Din motor har inga skruvar, den har brickor.\n\n### Fr\u00E5ga 2\n**\"Har ni utrustning f\u00F6r att st\u00E4lla in en f\u00F6rgasare med CO-halt?\"**\n\nM\u00E5nga moderna verkst\u00E4der har sl\u00E4ngt sina gamla avgasanalysatorer. Utan en s\u00E5dan **gissar** de bara n\u00E4r de st\u00E4ller in din Solex-f\u00F6rgasare.\n\n---\n\n## 3. Checklista f\u00F6r \"Stor Service\"\n\nL\u00E4mna denna lista till verkstaden. Det sparar tid och minskar risken f\u00F6r missf\u00F6rst\u00E5nd.\n\n### A. Motorn (Kritiskt)\n\n#### Ventilspel\nKontrollera och justera vid behov.\n- **Kall motor:**\n  - Insug: 0,15-0,25 mm\n  - Avgas: 0,35-0,45 mm\n\n\uD83D\uDCA1 **Tips:** S\u00E4g att du kan best\u00E4lla shims om de saknar r\u00E4tt storlek (de \u00E4r samma som till Volvo 240/740 diesel och m\u00E5nga VW/Audi).\n\n#### Kamrem\nOm du inte vet exakt n\u00E4r den byttes senast \u2013 **BYT DEN**. Om den g\u00E5r av rasar motorn.\n\n\u2705 Byt \u00E4ven sp\u00E4nnrullen.\n\n#### T\u00E4ndning\n1. Byt brytarspetsar och kondensator (eller installera brytarl\u00F6st system)\n2. St\u00E4ll t\u00E4ndningen med stroboskop (5\u00B0 eller 7,5\u00B0 F\u00D6D med vakuumslang bortkopplad)\n3. Byt t\u00E4ndstift (Bosch W7DTC eller motsvarande)\n\n#### F\u00F6rgasare\n- Kontrollera att choken \u00F6ppnar helt n\u00E4r motorn blir varm\n- Justera tomg\u00E5ng och CO-halt\n\n### B. V\u00E4tskor (Viktigt med r\u00E4tt sorter)\n\n#### V\u00E4xell\u00E5da\n\u26A0\uFE0F **VARNING:** \"Anv\u00E4nd absolut inte GL-5 olja, den \u00E4ter upp synkroniseringen. Det m\u00E5ste vara GL-4 80W-90.\"\n\n#### Bakaxel\nH\u00E4r ska det vara GL-5 olja.\n\n#### Kylarv\u00E4tska\nByt om den \u00E4r brun/grumlig. Anv\u00E4nd G11 (Bl\u00E5/Gr\u00F6n).\n\n### C. S\u00E4kerhet\n\n#### Bromsar\n- Lufta bromsarna\n- Byt all bromsv\u00E4tska (den drar \u00E5t sig vatten och rostar cylindrarna inifr\u00E5n)\n- Eftersom bilen st\u00E5tt sedan 2007 kan hjulcylindrarna bak ha \u00E4rjat fast\n\n#### Br\u00E4nsleslangar\nInspektera alla gummislangar. Dagens bensin med etanol torkar ut gamla slangar snabbt = **brandrisk**!\n\n---\n\n## 4. Strategi f\u00F6r delar\n\nMekaniker avskyr att leta efter delar till gamla bilar f\u00F6r att det tar tid de inte kan debitera f\u00F6r.\n\n\uD83D\uDCA1 **L\u00F6sning:** Erbjud dig att k\u00F6pa delarna sj\u00E4lv.\n\n> \"Om ni s\u00E4ger vad som beh\u00F6vs, s\u00E5 best\u00E4ller jag hem grejerna.\"\n\n### Var ska du leta?\nN\u00E4r du letar delar till motorn, s\u00F6k p\u00E5:\n- **Audi 100 (C1) 2.0**\n- **Porsche 924 2.0**\n\n... p\u00E5 sajter som Autodoc eller Bildelaronline24. Det \u00E4r ofta l\u00E4ttare att hitta delar \"v\u00E4gen runt\" \u00E4n att s\u00F6ka p\u00E5 VW LT.",
        tags: ['Service', 'Mekaniker', 'Guide', 'Underhåll']
    }
];
