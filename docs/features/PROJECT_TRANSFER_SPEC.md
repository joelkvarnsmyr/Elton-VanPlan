# Specifikation: Project Ownership Transfer & Roadmap Update

**Datum:** 2025-12-12
**Status:** Specifikation
**Författare:** Gemini (AI Agent)

## 1. Sammanfattning

Detta dokument beskriver två huvudsakliga förändringar i projektet:

1.  **Funktionsändring:** Den befintliga "Import/Export"-funktionen (som är trasig) tas bort och ersätts med en "Transfer Ownership"-funktion. Detta är mer i linje med en molnbaserad samarbetsplattform.
2.  **Roadmap-justering:** Roadmapen uppdateras för att reflektera denna ändring, samt för att markera slutförandet av den kritiska säkerhetsuppgiften att flytta API-nycklar till backend.

## 2. Bakgrund & Motivation

Den nuvarande `PROJECT_ANALYSIS_REPORT.md` och `roadmapData.ts` identifierar en trasig "Import"-funktion som en bugg med hög prioritet. Istället för att laga en funktion som uppmuntrar till lokala, osynkroniserade data-dumpar, föreslås en funktion som löser det verkliga användarproblemet: att permanent överlåta ett projekt till en annan användare.

Detta är användbart när:
- En användare säljer ett fordon och vill att den nya ägaren ska ta över projektets digitala historik.
- En användare vill lämna ett team och överlåta ansvaret till någon annan.

## 3. Specifikation: Transfer Ownership

### 3.1 Användarflöde

1.  **Initiera Överföring:**
    - Projektägaren navigerar till projektets inställningssida (`Project Settings`).
    - Under sektionen "Team Members" eller en ny sektion "Project Ownership", finns en knapp: "Transfer Ownership".
    - Ett klick öppnar en modal.

2.  **Välj Ny Ägare:**
    - Modalen visar en lista över befintliga medlemmar i projektet (exklusive den nuvarande ägaren).
    - Ägaren väljer en medlem från listan som ska bli den nya ägaren.
    - En tydlig varningstext visas: _"This action is irreversible. You will lose all ownership rights and become a regular member of this project. Are you sure you want to transfer ownership to [Member Name]?"_

3.  **Bekräfta Överföring:**
    - Ägaren måste bekräfta genom att skriva projektets namn i ett textfält.
    - "Confirm Transfer"-knappen blir aktiv först när namnet är korrekt ifyllt.

4.  **Backend-logik:**
    - En Cloud Function (`transferProjectOwnership`) anropas med `projectId` och `newOwnerId`.
    - **Validering:**
        - Funktionen verifierar att den anropande användaren är den nuvarande ägaren.
        - Funktionen verifierar att den nya ägaren är en befintlig medlem i projektet.
    - **Atomär Operation (Firestore Transaction):**
        - Projektets `ownerId` uppdateras till `newOwnerId`.
        - Den gamla ägarens roll i `members`-arrayen ändras från `owner` till `member`.
        - Den nya ägarens roll i `members`-arrayen ändras från `member` till `owner`.
    - **Notifiering:** (Valfritt, Fas 2) En notifiering skickas till den nya ägaren.

### 3.2 UI-förändringar

- **Project Settings:**
    - Ta bort knappar/sektion för "Import Project" och "Export Project".
    - Lägg till knapp för "Transfer Ownership".
- **Ny Modal:** Skapa en modal för överföringsprocessen.

### 3.3 Databas (Firestore)

- Inga schemaändringar krävs. Logiken hanteras genom att uppdatera fälten `ownerId` och `members` i projektdokumentet.

### 3.4 Säkerhetsregler (Firestore Rules)

- Endast projektägaren (`request.auth.uid == resource.data.ownerId`) får anropa `transferProjectOwnership`-funktionen.

## 4. Specifikation: Roadmap & Cleanup

### 4.1 Uppdatering av `src/data/roadmapData.ts`

1.  **Ta bort "Import-funktionen" (ID 101):**
    - Ta bort hela feature-objektet med `id: 101`.
2.  **Lägg till "Transfer Ownership":**
    - Skapa ett nytt feature-objekt i **Fas 2** (Kortsiktigt).
    - `id: 107` (eller nästa lediga nummer)
    - `title: 'Transfer Project Ownership'`
    - `category: 'UX/Teams'`
    - `description: 'Allows a project owner to transfer ownership to another team member.'`
    - `status: 'planned'`
    - `priority: 'medium'`
3.  **Uppdatera "Säkerhet: Flytta API-nycklar" (ID 100):**
    - Ändra `status` från `'planned'` till `'in-progress'`.
    - Uppdatera `checklist` för att reflektera att arbetet är påbörjat men inte slutfört (p.g.a. `LiveElton`).
    - Markera de första stegen som `completed: true`.
4.  **Uppdatera "Städa prototype_app" (ID 103):**
    - Ändra `status` från `'planned'` till `'in-progress'`.

### 4.2 Borttagning av `prototype_app`

- Mappen `prototype_app/` ska raderas från filsystemet.
- En `git rm -r prototype_app/` ska köras.

## 5. Implementation Plan

1.  **[AI Agent]** Uppdatera `src/data/roadmapData.ts` enligt specifikationen ovan.
2.  **[AI Agent]** Ta bort mappen `prototype_app/`.
3.  **[AI Agent]** Skapa en ny Cloud Function `transferProjectOwnership` i `functions/src/ai/proxy.ts` (eller lämplig fil).
4.  **[AI Agent]** Implementera UI-förändringarna i `src/components/ProjectSettings.tsx` (eller motsvarande).
5.  **[Användare]** Granska och godkänn ändringarna.
6.  **[Användare]** Deploya Cloud Function.
7.  **[AI Agent & Användare]** Testa flödet.

---
