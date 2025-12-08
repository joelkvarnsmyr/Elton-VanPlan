
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { generateProjectProfile } from './geminiService';

// We need a mock that can return different values for sequential calls (Detective -> Planner)
const mockGenerateContent = vi.fn();

vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            constructor() {}
            get chats() { return { create: () => ({ sendMessageStream: async () => [] }) } }
            get models() {
                return {
                    generateContent: mockGenerateContent
                }
            }
        },
        Type: { OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', ARRAY: 'ARRAY' }
    }
});

describe('Real World Simulation: VW LT31 (JSN398)', () => {

    beforeEach(() => {
        mockGenerateContent.mockReset();
    });

    it('Should successfully onboard "JSN398" with deep technical data and expert analysis', async () => {
        // --- MOCK DATA SETUP ---
        
        // 1. Detective Response (Facts)
        const detectiveResponse = {
            projectName: "Volkswagen LT31 - JSN398",
            vehicleData: {
                regNo: "JSN398",
                make: "Volkswagen",
                model: "LT 31",
                year: 1976,
                prodYear: 1976,
                regDate: "1978-02-14",
                status: "Avställd",
                bodyType: "Skåp - Bostadsinredning", // Important for conversion detection
                engine: { 
                    fuel: "Bensin", 
                    power: "75 hk", 
                    volume: "2.0",
                    code: "CH" // Crucial for old cars
                },
                gearbox: "Manuell",
                wheels: { drive: "2WD", tiresFront: "215R14", tiresRear: "215R14", boltPattern: "5x160" },
                dimensions: { length: 5400, width: 2020, height: "2500", wheelbase: 2500 },
                weights: { curb: 2280, total: 3160, load: 880, trailer: 2000, trailerB: 750 },
                vin: "2862XXXXXX",
                color: "Flerfärgad",
                history: { owners: 22, events: 0, lastOwnerChange: "2024" },
                maintenance: {
                    fluids: {
                        oilType: "10W-40 Mineral",
                        oilCapacity: "6.0 liter",
                        coolantType: "Glykol blå"
                    },
                    battery: { type: "Startbatteri", capacity: "88Ah" },
                    tires: { pressureFront: "3.5 bar", pressureRear: "4.5 bar" }
                }
            }
        };

        // 2. Planner Response (Strategy)
        const plannerResponse = {
            projectType: "conversion", // Detected based on "Bostadsinredning"
            initialTasks: [
                {
                    title: "Smörj Spindelbultar (Kingpins)",
                    description: "Kritiskt underhåll för framvagnen på VW LT. Om dessa skär krävs press.",
                    priority: "High",
                    phase: "Fas 1: Akut",
                    difficultyLevel: "Medium",
                    requiredTools: ["Fettspruta", "Pallbockar"],
                    estimatedCostMin: 100,
                    estimatedCostMax: 300
                },
                {
                    title: "Kamremsbyte & Service",
                    description: "Motor CH har rem. Okänd historik = byt direkt.",
                    priority: "High",
                    difficultyLevel: "Expert",
                    requiredTools: ["Momentnyckel", "Kamremsverktyg"],
                    estimatedCostMin: 1500,
                    estimatedCostMax: 3000
                }
            ],
            expertAnalysis: {
                commonFaults: [
                    { 
                        title: "Spindelbultar skär", 
                        description: "Detta är 'The LT Killer'. Måste smörjas var 500:e mil.", 
                        urgency: "High" 
                    }
                ],
                modificationTips: [
                    { title: "Motorbyte D24", description: "Populärt att byta till dieselsexan." }
                ],
                maintenanceNotes: "OBS: 5-siffrig mätare! 3000 mil är troligen 13000 eller 23000."
            },
            analysisReport: {
                title: "Analys av JSN398",
                summary: "Ett klassiskt objekt.",
                content: "# Rapport..."
            }
        };

        // Setup the mock to return Detective first, then Planner
        mockGenerateContent
            .mockResolvedValueOnce({ text: JSON.stringify(detectiveResponse) }) // First call
            .mockResolvedValueOnce({ text: JSON.stringify(plannerResponse) }); // Second call

        // --- EXECUTION ---
        console.log("🚀 Starting Simulation for JSN398...");
        const result = await generateProjectProfile("JSN398");

        // --- VALIDATION ---
        
        // 1. Basic Identity
        expect(result.projectName).toContain("LT31");
        expect(result.vehicleData.regNo).toBe("JSN398");
        expect(result.vehicleData.year).toBe(1976);

        // 2. Deep Tech Data (New fields)
        expect(result.vehicleData.engine.code).toBe("CH");
        expect(result.vehicleData.maintenance).toBeDefined();
        expect(result.vehicleData.maintenance?.fluids.oilType).toContain("10W-40");

        // 3. Intelligent Planning
        expect(result.projectType).toBe("conversion");
        expect(result.initialTasks.length).toBeGreaterThan(0);
        
        const kingpinTask = result.initialTasks.find((t: any) => t.title.includes("Spindelbultar"));
        expect(kingpinTask).toBeDefined();
        expect(kingpinTask.priority).toBe("High"); // Safety first!
        expect(kingpinTask.difficultyLevel).toBe("Medium");
        expect(kingpinTask.requiredTools).toContain("Fettspruta");

        // 4. Expert Analysis
        expect(result.vehicleData.expertAnalysis).toBeDefined();
        expect(result.vehicleData.expertAnalysis.commonFaults[0].urgency).toBe("High");
        expect(result.vehicleData.expertAnalysis.maintenanceNotes).toContain("5-siffrig");

        console.log("✅ Simulation Passed: Elton successfully diagnosed the LT31.");
    });
});
