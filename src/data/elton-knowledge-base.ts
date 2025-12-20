/**
 * Elton Knowledge Articles
 * External links, guides, and reference documentation
 */

import { KnowledgeArticle, ResourceLink, Contact } from '@/types/types';

// ============================================================================
// EXTERNAL RESOURCE LINKS
// ============================================================================

export const ELTON_RESOURCE_LINKS: ResourceLink[] = [
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

export const ELTON_WORKSHOPS: Contact[] = [
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

export const ELTON_KNOWLEDGE_ARTICLES: KnowledgeArticle[] = [
    // Article 1: Proffstips för Deljakt
    {
        id: 'kb-parts-hunting-tips',
        title: 'Proffstips för Deljakt',
        summary: '4 viktiga tips när du ska köpa reservdelar till VW LT31',
        content: `# Proffstips för Deljakt

## 1. Använd alltid originalnumret (OEM)
När du söker delar på eBay eller hos leverantörer, använd alltid OEM-numret (Original Equipment Manufacturer). Detta garanterar rätt passform.

**Exempel:** Istället för att söka på "bromsskiva VW LT", sök på OEM-numret som t.ex. "357615301".

## 2. Bultmönstret 5x160 är unikt
Fälgar till LT har bultmönster **5x160mm**, vilket är unikt för LT och Ford Transit (Mk1/Mk2). 

⚠️ **VIKTIGT:** Fälgar från andra bilar passar INTE!

## 3. Motordelar = Audi 100
Motordelar till bensinaren (2.0L kod CH) är ofta samma som till **Audi 100** från samma era (1976-1982).

**Pro-tip:** Sök på "Audi 100 C1 2.0" när du letar ventiler, packningar, eller kamrem. Du hittar mycket mer!

## 4. Baklyktor är hårdvaluta
Baklyktor och blinkersglas är extremt svåra att hitta. Var rädd om originaldelarna!

Om du hittar kompletta baklyktor på eBay eller skrot → KÖP DIREKT (även som reserv).`,
        tags: ['Reservdelar', 'Tips', 'eBay', 'OEM']
    },

    // Article 2: Verkstadsanalys Falun/Borlänge
    {
        id: 'kb-workshop-guide-falun',
        title: 'Strategisk Analys: Verkstäder i Falun/Borlänge',
        summary: 'Komplett guide till rätt verkstad för veteranbil i Dalarna',
        content: `# Strategisk Analys: Verkstäder i Falun-Borlänge

## Inledning
Att hitta rätt verkstad för en bil från 1976 är svårt. Moderna kedjor saknar ofta kompetensen för förgasare och ventilshims. Här är de bästa alternativen i din region.

## 1. Avancerad Mekanik & Motorrenovering

### Borlänge Motorrenovering AB
Regionens experter på tunga jobb. Om din motor rasar eller behöver borras, är det hit du går. De kan också ha delar till äldre motorer.

### Hanssons Bil & Motor (Borlänge)
Entusiastens val. Djupt kunnande om äldre teknik och BMW, men bra på allt mekaniskt.

## 2. Veteranbilar & Kaross

### Hallklint Bil (Avesta)
⭐ **Värt resan!** De har specialiserat sig på veteranbilar och "analoga" fordon (MG, Porsche, Land Rover). De förstår förgasare.

### Falu Bilplåt (Falun)
Experter på plåt och rost. De tar sig an äldre bilar och kan även PDR (bucklor).

### Kaptens Motor (Orsa)
Glenn Brus är en expert på äldre teknik (Mazda/Fiat).

## 3. Allmänservice (Bäst omdömen)

### Total Bil (Falun)
Problemlösarna. Kända för att inte ge upp vid felsökning.

### ⚡ Nini Verkstad (Falun)
**Spara detta nummer!** 📞 023-249 00

De har akutjour och drop-in, även lördagar. En räddare i nöden.

### Bil & AC Center (Borlänge)
Ärliga och duktiga, särskilt på AC och allmän service.

---

## Strategiska Rekommendationer

| Situation | Rekommendation |
|-----------|----------------|
| **Veteran-jobb** | Undvik Mekonomen/kedjorna. Åk till Hallklint eller Hanssons. |
| **Akut** | Ring Nini Verkstad 023-249 00 |
| **Delar** | Försök hitta delarna själv och ta med till verkstaden |

---

## ⚠️ Vad du ska UNDVIKA
- Stora kedjor (Mekonomen, Bilia) för motortekniska jobb
- Verkstäder som säger "vi kan allt"
- Platser som bara har OBD-diagnostik (din bil har inget diagnosuttag)`,
        tags: ['Verkstad', 'Dalarna', 'Service', 'Rekommendationer']
    },

    // Article 3: Fordonsteknisk Analys
    {
        id: 'kb-technical-analysis',
        title: 'Fordonsteknisk Analys: VW LT31 (JSN398)',
        summary: 'Djupgående teknisk analys av Eltons specifikationer och systembeskrivning',
        content: `# Fordonsteknisk Analys: Volkswagen LT31 (JSN398)

## Exekutiv Sammanfattning
Denna rapport analyserar ditt fordon JSN398, en Volkswagen LT31 av 1976 års modell. Det är ett tidigt exemplar ("Series 1") utrustad med den vätskekylda 2,0-liters bensinmotorn (kod CH), som den delar med Audi 100 och Porsche 924.

## Avkodning av Identitet

**Chassinummer:** 2862500058

- **28:** VW LT-serien (Typ 28)
- **6:** Modellår 1976
- **500058:** Tillverkad i Hannover. Ett lågt nummer som indikerar att det är en tidig bil.

## Drivlinans Ingenjörskonst: Motor CH (2.0L Bensin)

Hjärtat i JSN398 är bensinmotorn med koden **CH**. Detta är en tekniskt intressant kraftkälla.

### Släktskap
Samma grundmotorblock användes i:
- Audi 100 (C1)
- Porsche 924
  
💡 **Pro-tip:** Sök delar till dessa bilar!

### Ventiljustering
Motorn använder **shims (brickor)** för ventiljustering, inte skruvar. Detta är kritiskt att veta för mekanikern.

### Specifikation
- **Effekt:** 75 hk
- **Ventiler:** SOHC (Single Overhead Camshaft)
- **Drivning:** Kamrem

## Kritisk Underhållsinfo

| Komponent | Specifikation | Notering |
|-----------|---------------|----------|
| **Förgasare** | Solex 35 PDSIT-5 | Känd för problem med automatchoken |
| **Kylsystem** | Vattenkyld | Motorn sitter trångt ("doghouse"). Lufta systemet noga. |
| **Växellåda** | Manuell 4-växlad | ⚠️ Kräver GL-4 olja (EJ GL-5!) |

## Sammanfattande Datatabell för JSN398

| Datapunkt | Specifikation | Notering |
|---|---|---|
| Modell | VW LT31 (Typ 28) | Modellår 1976 |
| Motor | 2.0L Bensin (Kod: CH) | 4-cylindrig radmotor (Audi-design) |
| Ventilspel (Kall) | Insug: 0.15-0.25 / Avgas: 0.35-0.45 | Justeras med shims! |
| Tändstift | Bosch W7DTC | 0.7-0.8 mm |
| Tändning | 7.5° FÖD @ 900 v/min | Vakuum bortkopplad |
| Olja Motor | 10W-40 Mineral | ca 4.5-5 liter |
| Olja Växellåda | SAE 80W-90 GL-4 | ⚠️ EJ GL-5! |

---

## 🔧 Varför är detta viktigt?

### GL-4 vs GL-5 olja
Många moderna verkstäder fyller automatiskt på GL-5 eftersom det är "bättre". Men för äldre växellådor med mässingssynkroniseringar är GL-5 **GIFTIGT** - det äter upp mässingen!

### Shims för ventiljustering
Om en mekaniker säger "jag skruvar bara på justerings-skruvarna" för ventilspelet → **FEL BIL**. De tänker på en luftkyld VW-motor. Din motor har inga skruvar, den kräver shims (brickor).`,
        tags: ['Teknisk Data', 'Motor', 'Specifikationer', 'CH-motor']
    },

    // Article 4: Guide - Hitta Rätt Mekaniker
    {
        id: 'kb-find-mechanic-guide',
        title: 'Guide: Hitta Rätt Mekaniker & Serviceplan',
        summary: 'Komplett guide för att hitta kompetent mekaniker och planera service',
        content: `# Guide: Hitta Rätt Mekaniker & Serviceplan

## 1. Vem ska du leta efter?

❌ **Undvik:** Stora moderna verkstadskedjor. De är duktiga på att koppla in datorer, men din bil har inget diagnosuttag.

✅ **Leta efter:**
- "Gubbverkstäder"
- Veteranbilsspecialister
- Verkstäder som skyltar med "Klassiska VW/Audi"

### Det hemliga tipset
Eftersom din motor (CH) är en **Audi-motor** som också satt i Porsche 924, kan en gammal Porsche-specialist eller en Audi-entusiast ofta vara bättre än en renodlad "Folkabuss-mekaniker" (som är vana vid luftkylda boxermotorer).

---

## 2. "Lackmustestet" – Frågor för att testa mekanikern

När du ringer, ställ dessa frågor för att avgöra om de vet vad de pratar om.

### Fråga 1 (Det viktigaste)
**"Kan ni justera ventilerna på den här motorn? Det är en 2-liters bensinare (CH)."**

✅ **Rätt svar:** "Ja, vi har verktyg för att byta shims (brickor)." Eller: "Har du shims-sats?"

❌ **Fel svar:** "Jadå, vi skruvar bara på justerskruvarna."  
→ Då tror de att det är en gammal Folkabuss-motor. Din motor har inga skruvar, den har brickor.

### Fråga 2
**"Har ni utrustning för att ställa in en förgasare med CO-halt?"**

Många moderna verkstäder har slängt sina gamla avgasanalysatorer. Utan en sådan **gissar** de bara när de ställer in din Solex-förgasare.

---

## 3. Checklista för "Stor Service"

Lämna denna lista till verkstaden. Det sparar tid och minskar risken för missförstånd.

### A. Motorn (Kritiskt)

#### Ventilspel
Kontrollera och justera vid behov.
- **Kall motor:**
  - Insug: 0,15-0,25 mm
  - Avgas: 0,35-0,45 mm

💡 **Tips:** Säg att du kan beställa shims om de saknar rätt storlek (de är samma som till Volvo 240/740 diesel och många VW/Audi).

#### Kamrem
Om du inte vet exakt när den byttes senast – **BYT DEN**. Om den går av rasar motorn.

✅ Byt även spännrullen.

#### Tändning
1. Byt brytarspetsar och kondensator (eller installera brytarlöst system)
2. Ställ tändningen med stroboskop (5° eller 7,5° FÖD med vakuumslang bortkopplad)
3. Byt tändstift (Bosch W7DTC eller motsvarande)

#### Förgasare
- Kontrollera att choken öppnar helt när motorn blir varm
- Justera tomgång och CO-halt

### B. Vätskor (Viktigt med rätt sorter)

#### Växellåda
⚠️ **VARNING:** "Använd absolut inte GL-5 olja, den äter upp synkroniseringen. Det måste vara GL-4 80W-90."

#### Bakaxel
Här ska det vara GL-5 olja.

#### Kylarvätska
Byt om den är brun/grumlig. Använd G11 (Blå/Grön).

### C. Säkerhet

#### Bromsar
- Lufta bromsarna
- Byt all bromsvätska (den drar åt sig vatten och rostar cylindrarna inifrån)
- Eftersom bilen stått sedan 2007 kan hjulcylindrarna bak ha ärjat fast

#### Bränsleslangar
Inspektera alla gummislangar. Dagens bensin med etanol torkar ut gamla slangar snabbt = **brandrisk**!

---

## 4. Strategi för delar

Mekaniker avskyr att leta efter delar till gamla bilar för att det tar tid de inte kan debitera för.

💡 **Lösning:** Erbjud dig att köpa delarna själv.

> "Om ni säger vad som behövs, så beställer jag hem grejerna."

### Var ska du leta?
När du letar delar till motorn, sök på:
- **Audi 100 (C1) 2.0**
- **Porsche 924 2.0**

... på sajter som Autodoc eller Bildelaronline24. Det är ofta lättare att hitta delar "vägen runt" än att söka på VW LT.`,
        tags: ['Service', 'Mekaniker', 'Guide', 'Underhåll']
    }
];
