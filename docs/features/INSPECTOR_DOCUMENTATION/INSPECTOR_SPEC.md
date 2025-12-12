# Elton Inspector - AI-Assisted Vehicle Inspection Spec

**Status:** Planned
**Module:** Elton Inspector
**Purpose:** Enable users to document and diagnose vehicle condition via photo/audio with AI analysis.

---

## 1. Concept: "Snap & Triage"

Users shouldn't write long reports.
1.  **Capture:** Take photo of rust or record engine sound.
2.  **Upload:** File to Firebase Storage.
3.  **Analyze:** AI (Gemini 2.5 Flash) analyzes visual/audio data.
4.  **Result:** Diagnosis, Severity (1-10), Suggested Task.

## 2. Data Model

### InspectionFinding
```typescript
export interface InspectionFinding {
  id: string;
  imageUrl?: string;
  audioUrl?: string;
  date: string;
  category: 'EXTERIOR' | 'ENGINE' | 'UNDERCARRIAGE' | 'INTERIOR';
  
  // AI Analysis
  aiDiagnosis: string;    // "Kraftig korrosion på längsgående balk..."
  severity: 'COSMETIC' | 'WARNING' | 'CRITICAL'; 
  confidence: number;     // 0-100%
  
  // System Link
  suggestedTask?: Task;   
  convertedToTaskId?: string; 
}
```

## 3. AI Prompts

### The Mechanic Prompt (Inspector Agent)
"Du är en expertmekaniker specialiserad på veteranbilar. Analysera bild/ljud.
Identifiera komponent. Bedöm skick (rost, sprickor). Bedöm allvarlighetsgrad.
Regler: Var pessimistisk gällande rost på bärande delar. Om osäker, föreslå manuell inspektion."

### The Logic Engine (Investigation Tree)
Dynamic escalation logic:
*   **Level 1 (Non-Invasive):** Look/Listen.
*   **Level 2 (Minor):** Poke/Measure. Triggered by Level 1 findings.
*   **Level 3 (Major):** Disassemble. Triggered by confirmed Level 2 faults.

## 4. Inspection Zones (Deep Scan 360°)

### ZONE 1: EXTERIOR ("Skalet")
*   Glas, Gummilister, Lack, Rostfällor (Hjulhus, Fotsteg).

### ZONE 2: ENGINE ("Hjärtat")
*   Vätskor (Olja, Kylvätska - "Majonnäs"-koll).
*   Mekanisk Hälsa (Remmar, Slangar).
*   Elmotorer (Torkare, Fläkt).

### ZONE 3: UNDERCARRIAGE ("Skelettet")
*   Balkar (Rost), Avgassystem, Bromsrör.

### ZONE 4: INTERIOR ("Kontoret")
*   Instrument, Golv (Fukt), Dörrar.

## 5. Workflow

1.  User selects Zone (e.g., Engine).
2.  App provides Checklist (e.g., "Fota oljestickan").
3.  User uploads photo.
4.  AI analyzes and returns `InspectionFinding` (e.g., "Water in oil - Critical").
5.  Finding is added to Project Report.
6.  Critical findings are converted to `Tasks` automatically or via one-click.

## 6. Logic Scenarios (Examples)

**Scenario A: Seam Rust**
1.  User sees bubbles -> AI asks "Poke it".
2.  User pokes -> "It crunches" -> AI creates Critical Task: "Rust Repair Seam".

**Scenario B: Engine Sound**
1.  User records sound -> AI hears ticking.
2.  AI asks "Follows RPM?" -> User says Yes -> AI Diagnosis: "Valve adjustment needed".

---
*Based on user input 2025-01-29*
