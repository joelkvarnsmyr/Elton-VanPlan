# Data Model Architecture & Migration Plan

**Status:** Draft
**Date:** 2025-01-28
**Context:** Transitioning "Elton - The VanPlan" from a monolithic document structure to a scalable Firestore sub-collection architecture.

---

## 1. Vision & Motivation

Currently, a Project is stored as a single large document containing arrays for tasks, shopping items, and history.
**Problems with current approach:**
*   **Scalability:** Firestore documents have a 1MB limit. High-res base64 images or long logs will crash the app.
*   **Performance:** Loading a project loads *everything*. We want to be able to load just "Shopping List" or just "Active Tasks".
*   **Querying:** It's hard to query "All tasks with status TODO" across the system efficiently if they are inside an array.

**Solution:** Use Firestore **Sub-collections**.

## 2. New Database Schema

Hierarchical structure for `projects` collection:

```text
📂 projects (Collection)
 └── 📄 {projectId} (Document)
      │  > name: "Elton"
      │  > type: "conversion"
      │  > ownerIds: ["uid1", "uid2"]
      │  > vehicle: { regNo, make, year, engineCode... } (Lightweight Map)
      │  > created: Timestamp
      │
      ├── 📂 tasks (Sub-collection)
      │    └── 📄 {taskId}
      │         > title: "Byta Kamrem"
      │         > type: "MAINT"
      │         > status: "TODO"
      │         > mechanicalPhase: "P1_ENGINE"
      │         > blockers: ["taskId_X"]
      │
      ├── 📂 shoppingItems (Sub-collection)
      │    └── 📄 {itemId}
      │         > name: "Kamremssats"
      │         > linkedTaskId: "{taskId}" (Foreign Key)
      │         > quantity: 1
      │         > status: "RESEARCH" | "DECIDED" | "BOUGHT"
      │         > selectedOptionId: "opt_1"
      │         > options: [  // Array of VendorOptions
      │             { 
      │               id: "opt_1", 
      │               store: "Autodoc", 
      │               price: 800, 
      │               shipping: 200,
      │               deliveryTimeDays: 7,
      │               articleNumber: "CT637K1",
      │               url: "..."
      │             },
      │             {
      │               id: "opt_2",
      │               store: "Biltema",
      │               price: 1200,
      │               shipping: 0,
      │               shelfLocation: "Gång 4, Hylla 12", // Store Mode key!
      │               inStock: true
      │             }
      │           ]
      │
      ├── 📂 historyLog (Sub-collection)
      │    └── 📄 {eventId}
      │         > date: "2025-08-13"
      │         > event: "Besiktning"
      │
      └── 📂 knowledgeBase (Sub-collection)
           └── 📄 {articleId}
                > title: "Guide: Byta Shims"
                > content: "..."
```

## 3. Implementation Plan

### Phase 1: Type Definitions (Done)
Ensure `src/types/types.ts` reflects the atomic nature of the data.
*   ✅ `TaskType`, `MechanicalPhase`, `BuildPhase` enums added.
*   ✅ `Task` interface updated with `blockers` and `phases`.
*   [ ] Verify `ShoppingItem` includes `options` array with `shelfLocation`.

### Phase 2: Database Service Layer (`src/services/db.ts`)
We need to rewrite data access patterns. Instead of `getDoc(project)`, we need composite loaders.

**Key Changes Required:**
1.  **`getProject(id)`**: Should fetch the *root* document (metadata + vehicle info), but NOT all sub-collections by default.
2.  **`getProjectTasks(id)`**: New function to fetch from `projects/{id}/tasks`.
3.  **`createProject(...)`**: Needs to use `WriteBatch` to create the root doc AND iterate through template tasks/items to create individual documents in sub-collections.
4.  **`updateTask(...)`**: Point to specific document in `tasks` sub-collection.

### Phase 3: AI Service Integration (`src/services/geminiService.ts`)
The AI generates a big JSON blob. The "Deep Research" logic needs to remain the same (generating the plan), but the **saving logic** needs to handle the split.
*   **Action:** Ensure `createProject` in `db.ts` handles the JSON blob from AI and distributes it into sub-collections.

### Phase 4: UI Adaptation
Components expecting a full `Project` object with arrays need to be updated to handle async loading or new hooks.
*   **`Dashboard`**: Needs to subscribe to `tasks` sub-collection count/stats.
*   **`TaskBoard`**: Needs to fetch/subscribe to `tasks`.
*   **`ShoppingList`**: Needs to fetch/subscribe to `shoppingItems`.

## 4. Smart Logic Specs

### A. Shopping Intelligence ("Store Mode")
The `ShoppingList` component must support a "Store Mode" toggle when viewing on mobile.
**Logic:**
1.  Filter by specific store (e.g. "Biltema").
2.  Group items by `shelfLocation` (alphabetically).
3.  Sort items without location by `articleNumber`.
4.  Display `articleNumber` prominently for easy lookup.

### B. Dependency Engine ("Blockers")
The `TaskBoard` must visualize blockers.
**Logic:**
1.  Check `task.blockers` array.
2.  If any linked task is NOT `DONE` -> Render task as **Locked/Dimmed**.
3.  Show tooltip: "Waiting for [Task Name]".

## 5. Migration Strategy (Old Projects)

Since we are in pre-production/alpha:
1.  **Strategy:** "Nuke & Pave" (Preferred for dev) or "Lazy Migration".
2.  **Recommendation:** Update `createProject` to use the new structure. Old projects might break in the UI. We can either:
    *   Delete old projects manually.
    *   Write a script to migrate them.
    *   For now: **Focus on new projects created with the new structure.**

## 6. Future Proofing (Cloud Functions)

With sub-collections, we unlock:
*   **Cloud Functions triggers:** `onCreate` for a task can trigger specific notifications.
*   **Recursive Delete:** Deleting a project requires a Cloud Function to delete all sub-collections (client-side delete of sub-collections is hard).

---

**Approval Needed:**
- Confirm moving to Sub-collections.
- Confirm `Project` type update in frontend to still look "full" but be populated via multiple queries.
