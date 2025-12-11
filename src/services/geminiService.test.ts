
import { describe, it, expect, vi } from 'vitest';
import { generateProjectProfile } from './geminiService';
import { ACTIVE_PROMPTS } from '@/config/prompts';

// Mocking GoogleGenAI to prevent API calls during standard testing
// To run LIVE tests, remove this mock and ensure VITE_GEMINI_API_KEY is set
vi.mock('@google/genai', () => {
    return {
        GoogleGenAI: class {
            constructor() {}
            get chats() { return { create: () => ({ sendMessageStream: async () => [] }) } }
            get models() {
                return {
                    generateContent: async () => ({
                        // In the actual SDK, text is sometimes a method, but in the code being tested it is accessed as a property.
                        // Assuming the code relies on a specific version or wrapper where .text is a property string.
                        text: JSON.stringify({
                            projectName: "Simulated Volvo 240",
                            vehicleData: { 
                                year: 1990,
                                prodYear: 1990,
                                weights: { curb: 1500, load: 400, total: 1900, trailer: 1500, trailerB: 750 },
                                dimensions: { length: 4800, width: 1700, height: "1400", wheelbase: 2600 },
                                engine: { fuel: "Bensin", power: "115hk", volume: "2.3" },
                                inspection: { last: "", next: "", mileage: "" },
                                wheels: { drive: "2WD", tiresFront: "", tiresRear: "", boltPattern: "" },
                                history: { owners: 3, events: 10, lastOwnerChange: "" },
                                expertAnalysis: {
                                    commonFaults: [{ title: "Rost i trösklar", description: "Klassiskt fel på 240", urgency: "High" }],
                                    modificationTips: [{ title: "Turbo-konvertering", description: "Använd B230FK blocket" }],
                                    maintenanceNotes: "Byt olja var 1000:e mil."
                                }
                            },
                            initialTasks: [],
                            analysisReport: { 
                                title: "Simulated Analysis", 
                                summary: "This is a mock response.", 
                                content: "# Test Report\nEverything looks good." 
                            }
                        })
                    })
                }
            }
        },
        Type: { OBJECT: 'OBJECT', STRING: 'STRING', NUMBER: 'NUMBER', ARRAY: 'ARRAY' }
    }
});

describe('AI Simulator & Prompt Validation', () => {
    
    it('Prompt Registry should return valid strings', () => {
        const prompt = ACTIVE_PROMPTS.deepResearch.text("Volvo 240", false);
        expect(prompt).toContain("Volvo 240");
        expect(prompt).toContain("JSON ONLY");
        expect(prompt).toContain("expertAnalysis"); // Check that prompt asks for expert analysis
        expect(prompt).toContain("site:biluppgifter.se"); // Check for smart search strategy
    });

    it('Deep Research (Simulated) should return valid schema', async () => {
        const result = await generateProjectProfile("Volvo 240");
        
        // Schema Validation (The most important part of LLMOps)
        expect(result).toHaveProperty('projectName');
        expect(result.projectName).toBe("Simulated Volvo 240");
        
        expect(result).toHaveProperty('vehicleData');
        expect(typeof result.vehicleData.year).toBe('number');
        expect(typeof result.vehicleData.weights.total).toBe('number');
        
        expect(result).toHaveProperty('analysisReport');
        expect(result.analysisReport.title).toBe("Simulated Analysis");
    });

    it('Should include Expert Analysis data structure', async () => {
        const result = await generateProjectProfile("Volvo 240");
        
        expect(result.vehicleData.expertAnalysis).toBeDefined();
        expect(result.vehicleData.expertAnalysis?.commonFaults).toHaveLength(1);
        expect(result.vehicleData.expertAnalysis?.commonFaults[0].title).toBe("Rost i trösklar");
        expect(result.vehicleData.expertAnalysis?.commonFaults[0].urgency).toBe("High");
        expect(result.vehicleData.expertAnalysis?.maintenanceNotes).toContain("Byt olja");
    });

});
