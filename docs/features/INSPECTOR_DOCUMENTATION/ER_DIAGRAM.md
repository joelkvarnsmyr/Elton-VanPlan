# Elton Inspector - Data Model (ER Diagram)

```mermaid
erDiagram
    USER ||--o{ PROJECT : owns
    PROJECT ||--o{ INSPECTION_FINDING : contains
    VEHICLE ||--o{ PROJECT : has
    INSPECTION_FINDING ||--o| TASK : generates
    INSPECTION_FINDING ||--|| AI_ANALYSIS : has
    INSPECTION_FINDING }o--|| ZONE : "belongs to"
    ZONE ||--o{ CHECKPOINT : contains
    INSPECTION_FINDING }o--o| CHECKPOINT : "captured at"
    TASK }o--|| PROJECT : "belongs to"
    
    USER {
        string id PK
        string email
        string displayName
        date createdAt
        json preferences
    }
    
    VEHICLE {
        string id PK
        string userId FK
        string make
        string model
        int year
        string vin
        json specifications
    }
    
    PROJECT {
        string id PK
        string vehicleId FK
        string userId FK
        string name
        string description
        date startDate
        date targetDate
        enum status
        float budgetTotal
        float budgetSpent
    }
    
    INSPECTION_FINDING {
        string id PK
        string projectId FK
        string userId FK
        string imageUrl
        string audioUrl
        string thumbnailUrl
        date createdAt
        date updatedAt
        enum category
        string zoneId FK
        string checkpointId FK
        string userNotes
        array userTags
        string convertedToTaskId FK
    }
    
    AI_ANALYSIS {
        string findingId PK_FK
        string diagnosis
        string component
        enum severity
        enum urgency
        int confidence
        json condition
        array suggestedActions
        array nextSteps
        array relatedFindings
        bool requiresExpert
        json estimatedCost
        date analyzedAt
        string modelVersion
        int processingTime
    }
    
    ZONE {
        string id PK
        string name
        string icon
        string description
        enum category
        int estimatedTime
        int sortOrder
        date createdAt
    }
    
    CHECKPOINT {
        string id PK
        string zoneId FK
        string name
        string instruction
        enum captureType
        array tips
        array commonIssues
        int sortOrder
    }
    
    TASK {
        string id PK
        string projectId FK
        string userId FK
        string findingId FK
        string title
        string description
        enum priority
        enum status
        date dueDate
        date completedAt
        float estimatedCost
        float actualCost
        int estimatedHours
        int actualHours
        string notes
        array attachments
    }
```

## Entity Descriptions

### USER
Användarkonto i systemet. Äger både fordon och projekt.

### VEHICLE
Fordon som användaren registrerat. Kan ha flera projekt kopplade.

### PROJECT
Ett restaurerings- eller underhållsprojekt för ett specifikt fordon.

### INSPECTION_FINDING
Ett enskilt upptäckt fynd från en inspektion. Innehåller media (bild/ljud) och koppling till AI-analys.

### AI_ANALYSIS
AI-genererad analys av ett fynd. One-to-one med InspectionFinding.

### ZONE
En inspektionszon (t.ex. "Hjulhus Fram Höger"). Gruppering av checkpoints.

### CHECKPOINT
En specifik kontrollpunkt inom en zon (t.ex. "Fota rostskador").

### TASK
En åtgärd som ska utföras, antingen manuellt skapad eller genererad från ett kritiskt fynd.

## Relationships

- En användare kan ha flera fordon och projekt
- Ett projekt innehåller flera inspection findings
- Varje finding har exakt EN AI-analys
- Kritiska findings kan automatiskt generera tasks
- Findings tillhör alltid en zon och kan kopplas till specifik checkpoint
- Tasks kan härröra från findings eller skapas manuellt

## Key Indexes

För optimal performance bör följande indexeras:

```javascript
// Firestore Indexes
inspectionFindings:
  - projectId (ASC), createdAt (DESC)
  - userId (ASC), category (ASC)
  - zoneId (ASC), createdAt (DESC)
  - convertedToTaskId (ASC) // För att hitta findings med tasks

tasks:
  - projectId (ASC), status (ASC), priority (DESC)
  - userId (ASC), dueDate (ASC)
  - findingId (ASC) // För att hitta task från finding

zones:
  - category (ASC), sortOrder (ASC)
```
