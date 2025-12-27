/**
 * Voice Inspection Service
 * 
 * Transcribes audio recordings (.m4a) and structures them into
 * DetailedInspection format matching the manual inspection schema.
 */

import { getAI, getGenerativeModel, GoogleAIBackend } from 'firebase/ai';
import { app } from './firebase';
import type { DetailedInspection, DetailedInspectionArea, DetailedInspectionFinding } from '@/types/inspection';
import { v4 as uuidv4 } from 'uuid';

const ai = getAI(app, { backend: new GoogleAIBackend() });

/**
 * Standard inspection areas based on manual inspection template
 */
const INSPECTION_AREAS = [
    { id: 1, name: 'Taket' },
    { id: 2, name: 'Vänster sida (Förardörr & Kaross)' },
    { id: 3, name: 'Baksidan' },
    { id: 4, name: 'Höger sida (Passagerarsida & Skjutdörr)' },
    { id: 5, name: 'Passagerardörr (Höger fram)' },
    { id: 6, name: 'Framsidan & Hjulhus fram' },
    { id: 7, name: 'Underrede' },
    { id: 8, name: 'Motor & Mekaniskt' },
    { id: 9, name: 'Elsystem & Elektronik' },
    { id: 10, name: 'Interiör & Förarhytt' }
];

/**
 * Common finding types for classification
 */
const FINDING_TYPES = [
    'Sprickor', 'Rost', 'Lacksläpp', 'Läckage', 'Rostskada', 'Konstruktion',
    'Struktur', 'Isolering', 'Kondens', 'Dåligt arbete', 'Montering', 'Slitage',
    'Fuktskada', 'Röta', 'Hål/Skada', 'Justering', 'Defekt/Elfel', 'Saknad del',
    'Dold skada', 'Mekanisk', 'Oljeläckage', 'Nivåfel', 'Felkopplat', 'Ur funktion',
    'Kosmetisk', 'Spackel', 'Skick'
];

const VOICE_INSPECTION_PROMPT = `Du är en expert på att transkribera och strukturera fordonsbesiktningar.

Du kommer få en ljudfil från en inspektion av ett fordon. Din uppgift är att:
1. Transkribera det som sägs
2. Strukturera all information till ett JSON-objekt

OMRÅDEN ATT KATEGORISERA UNDER:
${INSPECTION_AREAS.map(a => `${a.id}. ${a.name}`).join('\n')}

TYPER AV OBSERVATIONER:
${FINDING_TYPES.join(', ')}

VIKTIGT:
- Varje observation ska kategoriseras som "Anmärkning" (problem) eller "Positivt"
- Ge varje observation en specifik typ
- Inkludera position om det nämns ("Insida över förardörr", "Vänster bakdel")
- Om en åtgärd föreslås, inkludera den
- Om extra detalj nämns, inkludera den

SVARA MED EXAKT DETTA JSON-FORMAT:
{
  "inspektionstyp": "Totalinspektion (Exteriör, Interiör, Mekaniskt)",
  "områden": [
    {
      "namn": "Taket",
      "observationer": [
        {
          "kategori": "Anmärkning",
          "typ": "Sprickor",
          "beskrivning": "Taket har sprickbildningar på cirka 10 olika ställen.",
          "position": null,
          "detalj": null,
          "åtgärd": null
        },
        {
          "kategori": "Positivt",
          "typ": "Skick",
          "beskrivning": "Taket bedöms i övrigt vara i relativt gott skick."
        }
      ]
    }
  ],
  "varningar": [
    {
      "titel": "⚠️ Varning: Titel",
      "innehåll": "Kritisk information som nämndes"
    }
  ]
}

ENDAST JSON, INGEN ANNAN TEXT.`;

export interface VoiceInspectionResult {
    inspection: DetailedInspection;
    warnings: Array<{
        title: string;
        content: string;
        condition?: string;
    }>;
    transcriptionSummary: string;
}

/**
 * Transcribe and structure an audio inspection recording
 */
export async function transcribeVoiceInspection(
    audioFile: File,
    projectId: string,
    inspectorName: string = 'Användare'
): Promise<VoiceInspectionResult> {

    const model = getGenerativeModel(ai, {
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.3, // Lower for more consistent JSON
            maxOutputTokens: 8192,
        }
    });

    // Convert file to base64
    const arrayBuffer = await audioFile.arrayBuffer();
    const base64 = btoa(
        new Uint8Array(arrayBuffer).reduce((data, byte) => data + String.fromCharCode(byte), '')
    );

    // Determine mime type
    const mimeType = audioFile.type || 'audio/mp4';

    const result = await model.generateContent([
        { text: VOICE_INSPECTION_PROMPT },
        {
            inlineData: {
                mimeType,
                data: base64
            }
        }
    ]);

    const responseText = result.response.text();

    // Parse JSON from response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        throw new Error('Failed to parse inspection JSON from transcription');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Transform to DetailedInspection format
    const areas: DetailedInspectionArea[] = [];
    let totalFindings = 0;
    let negativeCount = 0;
    let positiveCount = 0;

    for (const area of parsed.områden || []) {
        const findings: DetailedInspectionFinding[] = [];

        for (const obs of area.observationer || []) {
            const finding: DetailedInspectionFinding = {
                id: totalFindings + 1,
                category: obs.kategori === 'Positivt' ? 'Positivt' : 'Anmärkning',
                type: obs.typ || 'Övrigt',
                description: obs.beskrivning,
                position: obs.position || undefined,
                detail: obs.detalj || undefined,
                action: obs.åtgärd || undefined,
                status: 'open'
            };

            findings.push(finding);
            totalFindings++;

            if (finding.category === 'Anmärkning') {
                negativeCount++;
            } else {
                positiveCount++;
            }
        }

        // Find matching area ID
        const areaConfig = INSPECTION_AREAS.find(a =>
            a.name.toLowerCase().includes(area.namn.toLowerCase()) ||
            area.namn.toLowerCase().includes(a.name.split(' ')[0].toLowerCase())
        );

        areas.push({
            areaId: areaConfig?.id || areas.length + 1,
            name: area.namn,
            findings,
            summary: {
                negative: findings.filter(f => f.category === 'Anmärkning').length,
                positive: findings.filter(f => f.category === 'Positivt').length
            }
        });
    }

    const inspection: DetailedInspection = {
        id: uuidv4(),
        projectId,
        date: new Date().toISOString().split('T')[0],
        inspectors: [inspectorName],
        type: parsed.inspektionstyp || 'Totalinspektion',
        sourceFiles: [audioFile.name],
        areas,
        statistics: {
            total: totalFindings,
            negative: negativeCount,
            positive: positiveCount
        }
    };

    const warnings = (parsed.varningar || []).map((w: any) => ({
        title: w.titel,
        content: w.innehåll,
        condition: w.villkor
    }));

    return {
        inspection,
        warnings,
        transcriptionSummary: `Transkriberade ${audioFile.name}: ${totalFindings} observationer (${negativeCount} anmärkningar, ${positiveCount} positiva) över ${areas.length} områden.`
    };
}

/**
 * Generate strategic decisions from inspection findings
 */
export async function generateStrategicDecisions(
    inspection: DetailedInspection
): Promise<Record<string, any>> {

    const model = getGenerativeModel(ai, {
        model: 'gemini-2.5-flash',
        generationConfig: {
            temperature: 0.5,
            maxOutputTokens: 4096,
        }
    });

    const findingsSummary = inspection.areas.map(area => {
        const issues = area.findings
            .filter(f => f.category === 'Anmärkning')
            .map(f => `- ${f.type}: ${f.description}`)
            .join('\n');
        return `### ${area.name}\n${issues || 'Inga anmärkningar'}`;
    }).join('\n\n');

    const prompt = `Baserat på denna fordonsinspektions-data, skapa strategiska beslut för varje viktigt område.

INSPEKTIONSDATA:
${findingsSummary}

SKAPA STRATEGISKA BESLUT FÖR RELEVANTA OMRÅDEN (tex motor, dörrar, tak, elsystem).
Varje beslut ska ha:
- decision: kort beslutskod (tex "REPLACE_WITH_USED", "MINIMAL_SERVICE_NOW", "TEMPORARY_SEAL_NOW")
- reasoning: varför detta beslut
- actionNow: vad som ska göras nu
- actionFuture: vad som ska göras senare

VIKTIGT:
- Var praktisk - fokusera på vad som faktiskt behöver göras
- Prioritera säkerhet och körsäkerhet
- Balansera kostnad mot nytta

SVARA ENDAST MED JSON:
{
  "decisions": {
    "motor": { "decision": "...", "reasoning": "...", "actionNow": "...", "actionFuture": "..." },
    ...
  },
  "criticalWarnings": [
    { "id": "...", "title": "⚠️ Viktigt:", "content": "..." }
  ]
}`;

    const result = await model.generateContent([{ text: prompt }]);
    const responseText = result.response.text();

    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
        return { decisions: {}, criticalWarnings: [] };
    }

    return JSON.parse(jsonMatch[0]);
}
