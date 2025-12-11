# Prompt Updates Complete ✅

## Overview
Updated AI prompts to accept and utilize `userSkillLevel` and `projectType` parameters for personalized task generation and chat responses.

## Files Modified

### 1. `config/prompts.ts`
**Changes:**
- Updated `PLANNER` agent to accept `projectType` and `userSkillLevel` parameters
- Added conditional prompt logic based on skill level:
  - **Beginner**: 5-8 detailed subtasks per task, explain all terms, link guides, suggest DIY vs verkstad
  - **Intermediate**: 3-5 subtasks, practical tips, time estimates, balanced recommendations
  - **Expert**: 2-3 subtasks only, technical specs, moment values, no basic explanations
- Added conditional prompt logic based on project type:
  - **Renovation**: Focus on restoring to original condition, identify wear/rust/defects
  - **Conversion (Camper)**: Focus on insulation, beds, electrical, water systems, weight calculations
  - **Maintenance**: Focus on ongoing service, preventive maintenance, service schedule
- Updated `BASE.v1` to include conversational decision-making instruction

**Function Signature:**
```typescript
PLANNER: {
    text: (vehicleDataJson: string, projectType: string, userSkillLevel: string) => `...`
}
```

### 2. `services/geminiService.ts`
**Changes:**

#### `generateProjectProfile()`
- Added optional `projectType` and `userSkillLevel` parameters
- Passes these parameters to the PLANNER agent for personalized task generation
- Uses defaults if not provided: `'renovation'` and `'intermediate'`

**Function Signature:**
```typescript
export const generateProjectProfile = async (
    vehicleDescription: string,
    imageBase64?: string,
    projectType?: ProjectType,
    userSkillLevel?: string
): Promise<any>
```

#### `streamGeminiResponse()`
- Added optional `userSkillLevel` and `projectType` parameters
- Builds dynamic skill level context that affects how Elton communicates
- Builds dynamic project type context for contextual advice
- Injects this context into system instruction for every chat message

**Function Signature:**
```typescript
export const streamGeminiResponse = async (
    history: ...,
    newMessage: string,
    vehicleData: VehicleData,
    currentTasks: Task[],
    currentShoppingList: ShoppingItem[],
    onChunk: (text: string) => void,
    onToolCall: (toolCalls: any[]) => Promise<any[]>,
    imageBase64?: string,
    projectName?: string,
    userSkillLevel?: string,  // NEW
    projectType?: ProjectType  // NEW
)
```

### 3. `components/OnboardingWizard.tsx`
**Changes:**
- Updated `startResearch()` to pass `projectType` and `userSkillLevel` to `generateProjectProfile()`
- AI now generates personalized tasks during onboarding based on user's selected skill level and project type

**Code:**
```typescript
const [aiDataResult, iconResult] = await Promise.allSettled([
    generateProjectProfile(vehicleDesc, base64Data, projectType, userSkillLevel), // Pass new params
    base64Data ? generateVehicleIcon(base64Data, 2) : Promise.resolve(null)
]);
```

### 4. `components/AIAssistant.tsx`
**Changes:**
- Updated `streamGeminiResponse()` call to pass `project.userSkillLevel` and `project.type`
- Elton's chat responses now adapt to user's skill level and project type in real-time

**Code:**
```typescript
await streamGeminiResponse(
    historyForGemini,
    contextualUserMsg,
    project.vehicleData,
    project.tasks,
    project.shoppingItems,
    (chunk) => { ... },
    handleToolCalls,
    userImageBase64 ? userImageBase64.split(',')[1] : undefined,
    project.nickname || project.name,  // Use nickname for personality
    project.userSkillLevel,  // NEW: Pass skill level
    project.type  // NEW: Pass project type
);
```

## How It Works

### During Onboarding (STEG 1 & 2)
1. User selects **Project Type** (Renovering/Ombyggnad/Förvaltning)
2. User selects **Skill Level** (Nybörjare/Hemmameck/Certifierad)
3. Wizard calls AI with these parameters
4. AI generates **personalized initial tasks** based on:
   - User's skill level (more/fewer subtasks, detailed/concise descriptions)
   - Project type (renovation focus vs conversion focus vs maintenance focus)

### During Chat (Ongoing)
1. Every chat message includes user's skill level and project type in system context
2. Elton adapts responses:
   - **Beginner**: Explains terms, suggests DIY vs verkstad, links guides
   - **Intermediate**: Balanced tips, time estimates, practical warnings
   - **Expert**: Technical specs, moment values, concise responses
3. Recommendations match project type:
   - **Renovation**: Safety first, restore to original, address rust/wear
   - **Conversion**: Isolering, inredning, weight calculations, permit advice
   - **Maintenance**: Service schedules, preventive care, wear parts

## Examples

### Beginner + Renovation
**Task generated:**
```
Title: "Byt kamrem"
Description: "Kamremmen driver motorn och MÅSTE bytas enligt servicebok (ca var 10:e år eller 100 000 km).
Vill du göra själv eller lämna på verkstad? (Verkstad rekommenderas för nybörjare - ca 5000-8000 kr)"
Subtasks:
  - Hitta servicebok och kolla när kamrem senast byttes
  - Ta reda på rätt kamremssats för din motor (motorkod: B230F)
  - Ring 3 verkstäder för offert
  - Boka tid (tar ca 3-4 timmar)
  - Byt även spännrulle och vattenpump samtidigt (spar arbete!)
  - Spara kvitto i serviceboken
```

### Expert + Conversion
**Task generated:**
```
Title: "Installera 230V elsystem"
Description: "12V→230V växelriktare + säkringar. Beräkna last, installera jordfelsbrytare."
Subtasks:
  - Dimensionera system (2000W inverter rekommenderat)
  - Dra kablar (6mm² för 230V, jordfelsbrytare obligatorisk)
  - Montera uttag enligt SS 436 40 00
```

### Intermediate + Maintenance
**Chat Example:**
```
User: "Ska snart byta olja, vad ska jag tänka på?"

Elton: "Oljebyte på din Volvo 240 (B230F):
- Använd 10W-40 mineralisk eller 5W-30 syntet
- Oljemängd: 4.0 liter (med filter)
- Moment för plugg: 40 Nm
- Ca 1-1.5h själv, ca 500-800 kr på verkstad

Tips: Byt även oljefilter (Volvo 8251161). Kör motorn varm först så oljan rinner ut lättare!
Vill du att jag skapar en uppgift för detta?"
```

## Testing Checklist

- [x] Prompts updated with new parameters
- [x] geminiService functions accept new parameters
- [x] OnboardingWizard passes parameters to AI
- [x] AIAssistant passes parameters during chat
- [x] No TypeScript compilation errors
- [x] Server running successfully on http://localhost:3002

## What's Next (Future Enhancements)

1. **Test with real users** at different skill levels
2. **Fine-tune prompts** based on feedback
3. **Add "Ask AI" button** in task view ("Vill du göra själv eller lämna på verkstad?")
4. **Store user preference** (DIY vs verkstad) per task type for future recommendations
5. **Create skill-specific guides** in Knowledge Base (linked from tasks)

## Status: ✅ COMPLETE

All prompt updates are implemented and integrated. The onboarding wizard now generates personalized tasks, and Elton's chat persona adapts to user skill level and project type in real-time.
