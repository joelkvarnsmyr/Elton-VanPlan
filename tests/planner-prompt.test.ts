/**
 * PLANNER PROMPT LOGIC TESTS
 *
 * Verifierar att prompt-byggaren korrekt inkluderar instruktioner baserat på
 * projectType och userSkillLevel.
 *
 * Detta är ett Unit Test (Nivå 1) som endast testar sträng-generering.
 */

import { describe, it, expect } from 'vitest';
import { ACTIVE_PROMPTS } from '../src/config/prompts';

describe('PLANNER Prompt Generation', () => {

    it('should accept projectType and userSkillLevel parameters', () => {
        const vehicleData = JSON.stringify({ make: 'Volvo', model: '240', year: 1990 });
        const projectType = 'renovation';
        const userSkillLevel = 'beginner';

        const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, projectType, userSkillLevel);

        expect(prompt).toContain('PROJEKTTYP: renovation');
        expect(prompt).toContain('ANVÄNDARENS KUNSKAPSNIVÅ: beginner');
    });

    it('should include beginner-specific instructions for nybörjare', () => {
        const vehicleData = '{}';
        const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'renovation', 'beginner');

        expect(prompt).toContain('NYBÖRJARE');
        expect(prompt).toContain('DETALJERADE uppgifter');
        expect(prompt).toContain('minst 5-8 steg per uppgift');
        expect(prompt).toContain('Förklara alla tekniska termer');
        expect(prompt).toContain('själv eller lämna på verkstad');
    });

    it('should include intermediate-specific instructions for hemmameck', () => {
        const vehicleData = '{}';
        const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'renovation', 'intermediate');

        expect(prompt).toContain('HEMMAMECK');
        expect(prompt).toContain('3-5 subtasks');
        expect(prompt).toContain('praktiska tips');
        expect(prompt).toContain('tidsestimat');
    });

    it('should include expert-specific instructions for certifierad', () => {
        const vehicleData = '{}';
        const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'renovation', 'expert');

        expect(prompt).toContain('CERTIFIERAD');
        expect(prompt).toContain('2-3 subtasks');
        expect(prompt).toContain('specs och momentvärden');
        expect(prompt).toContain('Inga förklaringar av grundläggande termer');
    });

    it('should include renovation-specific instructions', () => {
        const vehicleData = '{}';
        const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'renovation', 'intermediate');

        expect(prompt).toContain('RENOVERING');
        expect(prompt).toContain('återställa fordonet till ursprungligt skick');
        expect(prompt).toContain('slitage, rost, defekta delar');
    });

    it('should include conversion-specific instructions', () => {
        const vehicleData = '{}';
        const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'conversion', 'intermediate');

        expect(prompt).toContain('OMBYGGNAD (CAMPER/HUSBIL)');
        expect(prompt).toContain('isolering, sänginredning, el-system, vatten');
        expect(prompt).toContain('viktökningar');
    });

    it('should include maintenance-specific instructions', () => {
        const vehicleData = '{}';
        const prompt = ACTIVE_PROMPTS.agents.planner.text(vehicleData, 'maintenance', 'intermediate');

        expect(prompt).toContain('FÖRVALTNING');
        expect(prompt).toContain('löpande underhåll');
        expect(prompt).toContain('Förebyggande underhåll');
    });

    it('should include conversational decision-making in BASE prompt', () => {
        const basePrompt = ACTIVE_PROMPTS.baseSystemPrompt;

        expect(basePrompt).toContain('KONVERSATIONELLT BESLUTSFATTANDE');
        expect(basePrompt).toContain('Vill du göra det själv eller lämna på verkstad?');
    });
});
