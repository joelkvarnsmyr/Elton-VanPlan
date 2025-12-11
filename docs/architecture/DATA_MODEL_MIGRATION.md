# Data Model Architecture & Migration Plan

**Status:** Approved Draft v2.0
**Date:** 2025-12-11
**Context:** Transitioning "Elton - The VanPlan" from a monolithic document structure to a scalable Firestore sub-collection architecture.

---

## 1. Vision & Motivation

Currently, a Project is stored as a single large document containing arrays for tasks, shopping items, and history.

**Problems with current approach:**
- **Scalability:** Firestore documents have a 1MB limit. High-res base64 images or long logs will crash the app.
- **Performance:** Loading a project loads *everything*. We want to be able to load just "Shopping List" or just "Active Tasks".
- **Querying:** It's hard to query "All tasks with status TODO" across the system efficiently if they are inside an array.

**Solution:** Use Firestore **Sub-collections**.

---

## 2. New Database Schema

### 2.1 Users Collection (NEW)

```text
📂 users (Collection)
 └── 📄 {userId} (Document)
      │  > email: "joel@example.com"
      │  > displayName: "Joel"
      │  > createdAt: Timestamp
      │  > lastLoginAt: Timestamp
      │  > settings: {
      │      dialectId: "dalmal" | "gotlandska" | "rikssvenska" | "standard",
      │      darkMode: true,
      │      defaultProjectId: "proj_123",
      │      skillLevel: "beginner" | "intermediate" | "expert"
      │  }
      │
      └── 📂 projectAccess (Sub-collection)
           └── 📄 {projectId}
                > role: "owner" | "editor"
                > addedAt: Timestamp
                > addedBy: "userId"
                > lastAccessedAt: Timestamp
```

**Rationale:**
- Quick lookup of all projects a user has access to
- "Recently used" project list
- User-specific settings separated from projects

---

### 2.2 Projects Collection (Refactored)

```text
📂 projects (Collection)
 └── 📄 {projectId} (Document)
      │
      │  // === METADATA ===
      │  > name: "Elton"
      │  > type: "renovation" | "conversion" | "maintenance"
      │  > brand: "vanplan" | "racekoll" | "mcgaraget" | "klassikern"
      │  > created: Timestamp
      │  > lastModified: Timestamp
      │  > isDemo: false
      │
      │  // === OWNERSHIP (Multi-owner support) ===
      │  > ownerIds: ["uid1", "uid2"]      // All owners (e.g., married couple)
      │  > primaryOwnerId: "uid1"          // "Account holder" for billing
      │  > memberIds: ["uid3", "uid4"]     // Editors who don't own
      │  > invitedEmails: ["pending@example.com"]
      │
      │  // === VEHICLE (Lightweight - no sub-collection) ===
      │  > vehicle: {
      │      regNo: "ABC123",
      │      make: "Volkswagen",
      │      model: "LT28",
      │      year: 1984,
      │      vin: "WV2...",
      │      color: "Vit",
      │      engine: { fuel, power, volume, code },
      │      expertAnalysis: { commonFaults, modificationTips, maintenanceNotes }
      │  }
      │
      │  // === USER PREFERENCES ===
      │  > userSkillLevel: "intermediate"
      │  > nickname: "Elansen"             // Vehicle nickname for AI personality
      │  > location: { city, region, country }
      │
      │  // === SUB-COLLECTIONS ===
      │
      ├── 📂 tasks (Sub-collection)
      │    └── 📄 {taskId}
      │         > title: "Byta Kamrem"
      │         > description: "..."
      │         > status: "TODO" | "IN_PROGRESS" | "DONE" | "BLOCKED"
      │         > type: "MAINT" | "BUILD" | "IDEA" | "BUY" | "ADMIN"
      │         > mechanicalPhase: "P1_ENGINE" (if type=MAINT)
      │         > buildPhase: "B2_SYSTEMS" (if type=BUILD)
      │         > priority: "Hög" | "Medel" | "Låg"
      │         > estimatedCostMin: 500
      │         > estimatedCostMax: 1500
      │         > actualCost: 0
      │         > blockers: [
      │             { taskId: "task_xyz", reason: "Måste svetsa först" }
      │           ]
      │         > subtasks: [{ id, title, completed }]
      │         > created: Timestamp
      │         > lastModified: Timestamp
      │
      ├── 📂 shoppingItems (Sub-collection)
      │    └── 📄 {itemId}
      │         > name: "Kamremssats SKF"
      │         > category: "Reservdelar" | "Kemi & Färg" | "Verktyg" | "Inredning" | "Övrigt"
      │         > linkedTaskId: "task_123"
      │         > quantity: "1 st"
      │         > status: "RESEARCH" | "DECIDED" | "BOUGHT"
      │         > selectedOptionId: "opt_1"
      │         > options: [                    // Max 10 vendor options
      │             {
      │               id: "opt_1",
      │               store: "Autodoc",
      │               articleNumber: "CT637K1",
      │               price: 800,
      │               shippingCost: 200,
      │               totalCost: 1000,          // Calculated
      │               deliveryTimeDays: 7,
      │               inStock: true,
      │               url: "https://...",
      │               lastPriceCheck: "2025-12-11"
      │             },
      │             {
      │               id: "opt_2",
      │               store: "Biltema",
      │               articleNumber: "80-275",
      │               price: 1200,
      │               shippingCost: 0,
      │               totalCost: 1200,
      │               deliveryTimeDays: 0,      // Pickup = 0
      │               inStock: true,
      │               shelfLocation: "Gång 4, Hylla 12"
      │             }
      │           ]
      │         > purchaseDate: null | "2025-12-15"
      │         > receiptUrl: null | "gs://..."
      │
      ├── 📂 serviceLog (Sub-collection)
      │    └── 📄 {logId}
      │         > date: "2025-08-13"
      │         > description: "Oljebyte + filter"
      │         > mileage: "12500"
      │         > performer: "Själv"
      │         > type: "Service" | "Reparation" | "Besiktning" | "Övrigt"
      │         > cost: 450
      │         > linkedTaskId: "task_456"
      │
      ├── 📂 fuelLog (Sub-collection)
      │    └── 📄 {logId}
      │         > date: "2025-12-01"
      │         > mileage: 12800
      │         > liters: 45.5
      │         > pricePerLiter: 18.50
      │         > totalCost: 841.75
      │         > fullTank: true
      │
      ├── 📂 knowledgeBase (Sub-collection)
      │    └── 📄 {articleId}
      │         > title: "Guide: Byta Shims på D24"
      │         > summary: "Steg-för-steg guide..."
      │         > content: "## Förberedelser\n..."  // Markdown
      │         > tags: ["motor", "ventiler", "D24"]
      │         > aiGenerated: true
      │         > created: Timestamp
      │
      └── 📂 inspections (Sub-collection)
           └── 📄 {inspectionId}
                > date: "2025-12-10"
                > category: "EXTERIOR" | "ENGINE" | "UNDERCARRIAGE" | "INTERIOR"
                > imageUrl: "gs://..."
                > aiDiagnosis: "Ytrost på höger hjulhus..."
                > severity: "COSMETIC" | "WARNING" | "CRITICAL"
                > confidence: 0.87
                > convertedToTaskId: "task_789" | null
```

---

## 3. Smart Logic Specifications

### 3.1 Dual-Track System (Mechanical + Build)

The system displays tasks in two prioritized tracks:

```
┌─────────────────────────────────────────────────────────────────┐
│  MEKANISKT SPÅR (Prioritet 1)          BYGGSPÅR (Prioritet 2)   │
│  ═══════════════════════════           ═════════════════════    │
│                                                                  │
│  P0: Akut & Säkerhet                   B0: Rivning & Förbered.  │
│    └── Batteri, Däck, Hemtransport       └── Ta ut inredning    │
│                                                                  │
│  P1: Motorräddning         ─────────▶  B1: Skal & Isolering     │
│    └── Kamrem, Service                   └── Hål, Isolering     │
│                                                                  │
│  P2: Rost & Kaross         ─────────▶  B2: System (El/Vatten)   │
│    └── Svetsa balkar (FÖRE inredning!)   └── Kablar, Slang      │
│                                                                  │
│  P3: Löpande Underhåll                 B3: Inredning            │
│    └── Framtida service                  └── Väggar, Möbler     │
│                                                                  │
│                                        B4: Finish & Piff        │
│                                          └── Detaljer           │
└─────────────────────────────────────────────────────────────────┘
```

**Rule:** A task in B2 (El/Vatten) should be blocked if P2 (Rost) tasks aren't DONE.

---

### 3.2 Dependency Engine (Blockers)

**Data Structure:**
```typescript
interface Task {
  blockers?: Array<{
    taskId: string;
    reason?: string;  // "Måste svetsa innan isolering"
  }>;
}
```

**Rendering Logic:**
```typescript
function getTaskDisplayStatus(task: Task, allTasks: Task[]): TaskStatus {
  if (!task.blockers || task.blockers.length === 0) {
    return task.status;
  }

  const blockingTasks = task.blockers
    .map(b => allTasks.find(t => t.id === b.taskId))
    .filter(t => t && t.status !== 'DONE');

  if (blockingTasks.length > 0) {
    return 'BLOCKED';  // Override visual status
  }

  return task.status;
}
```

**UI Behavior:**
- BLOCKED tasks are dimmed/locked
- Tooltip: "Väntar på: [Blocking Task Names]"
- Click shows modal with option to view blocking task

**Orphan Prevention:**
- When a task is deleted, remove it from all `blockers` arrays (Cloud Function)

---

### 3.3 Shopping Intelligence

#### A. Best Deal Algorithm

```typescript
interface VendorOption {
  price: number;
  shippingCost: number;
  totalCost: number;        // = price + shippingCost
  deliveryTimeDays: number;
  inStock: boolean;
}

function sortVendorOptions(
  options: VendorOption[],
  needsUrgent: boolean = false
): VendorOption[] {
  return [...options].sort((a, b) => {
    // 1. If urgent, prioritize in-stock items
    if (needsUrgent) {
      if (a.inStock && !b.inStock) return -1;
      if (!a.inStock && b.inStock) return 1;
    }

    // 2. Sort by total cost
    const costDiff = a.totalCost - b.totalCost;
    if (Math.abs(costDiff) > 50) return costDiff; // Ignore <50 SEK diff

    // 3. Tie-breaker: fastest delivery
    return (a.deliveryTimeDays ?? 99) - (b.deliveryTimeDays ?? 99);
  });
}
```

#### B. Store Mode (Mobile)

When user enables "Store Mode" for a specific store (e.g., Biltema):

1. Filter items where `options[].store === selectedStore`
2. Group by `shelfLocation` (alphabetically)
3. Items without location: sort by `articleNumber`
4. Display `articleNumber` prominently for lookup

```typescript
function groupItemsForStoreMode(
  items: ShoppingItem[],
  store: string
): Map<string, ShoppingItem[]> {
  const groups = new Map<string, ShoppingItem[]>();

  items.forEach(item => {
    const option = item.options?.find(o => o.store === store);
    if (!option) return;

    const location = option.shelfLocation || 'Okänd plats';
    if (!groups.has(location)) groups.set(location, []);
    groups.get(location)!.push(item);
  });

  // Sort locations alphabetically
  return new Map([...groups.entries()].sort());
}
```

---

## 4. TypeScript Type Updates

### 4.1 Project Interface (Breaking Changes)

```typescript
// BEFORE (deprecated)
interface Project {
  ownerId: string;
  ownerEmail: string;
  members?: string[];
}

// AFTER
interface Project {
  // Ownership
  ownerIds: string[];           // All owners
  primaryOwnerId: string;       // Account holder
  memberIds: string[];          // Editors (non-owners)
  invitedEmails: string[];      // Pending invitations

  // Removed:
  // ownerId: string;           // DEPRECATED - use ownerIds[0] for compat
  // ownerEmail: string;        // DEPRECATED - lookup in users collection
  // members?: string[];        // RENAMED to memberIds
}
```

### 4.2 Task Interface Updates

```typescript
interface Task {
  // Existing fields...

  // Updated blockers structure
  blockers?: Array<{
    taskId: string;
    reason?: string;
  }>;

  // Computed (not stored)
  // isBlocked: boolean;        // Calculated at read time
}
```

### 4.3 ShoppingItem Status Enum

```typescript
enum ShoppingItemStatus {
  RESEARCH = 'RESEARCH',   // Still comparing options
  DECIDED = 'DECIDED',     // Option selected, ready to buy
  BOUGHT = 'BOUGHT'        // Purchased
}
```

---

## 5. Firestore Security Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Users can read/write their own profile
    match /users/{userId} {
      allow read, write: if request.auth.uid == userId;

      match /projectAccess/{projectId} {
        allow read, write: if request.auth.uid == userId;
      }
    }

    // Projects: owners and members have access
    match /projects/{projectId} {
      function isOwner() {
        return request.auth.uid in resource.data.ownerIds;
      }

      function isMember() {
        return request.auth.uid in resource.data.memberIds;
      }

      function hasAccess() {
        return isOwner() || isMember();
      }

      allow read: if hasAccess();
      allow write: if isOwner();
      allow update: if hasAccess();  // Members can edit
      allow delete: if isOwner();

      // Sub-collections inherit parent access
      match /tasks/{taskId} {
        allow read, write: if hasAccess();
      }

      match /shoppingItems/{itemId} {
        allow read, write: if hasAccess();
      }

      match /serviceLog/{logId} {
        allow read, write: if hasAccess();
      }

      match /fuelLog/{logId} {
        allow read, write: if hasAccess();
      }

      match /knowledgeBase/{articleId} {
        allow read, write: if hasAccess();
      }

      match /inspections/{inspectionId} {
        allow read, write: if hasAccess();
      }
    }
  }
}
```

---

## 6. Implementation Plan

### Phase 1: Type Definitions ✅ Mostly Done
- [x] `TaskType`, `MechanicalPhase`, `BuildPhase` enums
- [x] `Task` interface with `blockers`
- [x] `VendorOption` interface
- [ ] Update `Project` interface (ownerIds, memberIds)
- [ ] Add `ShoppingItemStatus` enum

### Phase 2: Database Service Layer
- [ ] `getProject(id)` - fetch root doc only
- [ ] `getProjectTasks(id)` - fetch tasks sub-collection
- [ ] `getProjectShoppingItems(id)` - fetch shopping sub-collection
- [ ] `createProject()` - use WriteBatch for root + sub-docs
- [ ] `updateTask()` - point to sub-collection
- [ ] `deleteProject()` - Cloud Function for recursive delete

### Phase 3: Cloud Functions
- [ ] `onTaskComplete` - unblock dependent tasks, send notifications
- [ ] `onTaskDelete` - remove from blockers arrays
- [ ] `onProjectDelete` - recursive delete all sub-collections
- [ ] `syncUserProjectAccess` - keep users/{id}/projectAccess in sync

### Phase 4: UI Adaptation
- [ ] Dashboard: async load task counts
- [ ] TaskBoard: subscribe to tasks sub-collection
- [ ] ShoppingList: subscribe to shoppingItems sub-collection
- [ ] Add "Store Mode" toggle

---

## 7. Migration Strategy

**Since we have no users/data yet:**

1. **New projects only:** All new projects use new schema
2. **Demo project:** Update seed script to use sub-collections
3. **No migration needed:** No existing data to migrate

---

## 8. Future Considerations (Roadmap)

### To Investigate:
- [ ] **Revision History / Undo:** Should tasks support undo? (Firestore doesn't have built-in versioning)
- [ ] **Offline Support:** Firestore offline persistence with sub-collections
- [ ] **Real-time Collaboration:** Multiple users editing same task simultaneously

### Deferred:
- **Viewer Role:** Not needed now, can add later with minimal schema changes
- **Project Templates:** AI generates all data dynamically from online sources

---

## 9. Approval Checklist

- [x] Sub-collection architecture approved
- [x] Multi-owner support (ownerIds array) approved
- [x] Dual-track system (Mechanical + Build) approved
- [x] Blocker/dependency logic approved
- [x] Best Deal pricing algorithm approved
- [ ] **Pending:** Final review of TypeScript types before implementation

---

**Document Version:** 2.0
**Last Updated:** 2025-12-11
**Author:** AI Architecture Review (Claude)
**Approved By:** Joel (Pending)
