# Data Model Architecture & Migration Plan

**Status:** Phase 2 Complete ✅
**Date:** 2025-12-11 (Updated)
**Original:** 2025-01-28
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

### Phase 2: Database Service Layer (`src/services/db.ts`) ✅ COMPLETE

**Implemented Functions:**

#### Basic CRUD (Already existed, now documented)
- ✅ `getTasks(projectId)` - Fetch all tasks from sub-collection
- ✅ `addTask(projectId, task)` - Create task in sub-collection
- ✅ `updateTask(projectId, taskId, updates)` - Update specific task
- ✅ `deleteTask(projectId, taskId)` - Delete specific task
- ✅ `getShoppingItems(projectId)` - Fetch shopping items
- ✅ `addShoppingItem(projectId, item)` - Create shopping item
- ✅ `updateShoppingItem(projectId, itemId, updates)` - Update item
- ✅ `deleteShoppingItem(projectId, itemId)` - Delete item

#### NEW: Advanced Loading
- ✅ `getProject(projectId)` - Lightweight: metadata only (no sub-collections)
- ✅ `getProjectFull(projectId)` - Complete: metadata + all sub-collections loaded in parallel

#### NEW: Dependency Engine (Blockers)
- ✅ `getTaskBlockers(projectId, taskId)` - Check if task is blocked + get blocking tasks
- ✅ `getBlockedTasks(projectId)` - Get all currently blocked tasks
- ✅ `getAvailableTasks(projectId)` - Get tasks that can be started now (not blocked, not done)

#### NEW: Shopping Intelligence (Store Mode)
- ✅ `getShoppingItemsByStore(projectId, storeName?)` - Group items by store with smart sorting
  - Items WITH `shelfLocation` sorted alphabetically by shelf
  - Items WITHOUT `shelfLocation` sorted by article number
  - Returns total cost per store
- ✅ `getStoreShoppingList(projectId, storeName)` - Optimized list for in-store shopping

#### NEW: Real-Time Listeners
- ✅ `subscribeToTasks(projectId, callback)` - Real-time task updates
- ✅ `subscribeToShoppingItems(projectId, callback)` - Real-time shopping updates
- ✅ `subscribeToProject(projectId, callback)` - Real-time project metadata
- ✅ `subscribeToProjectFull(projectId, callback)` - Real-time complete project (metadata + sub-collections)

All functions return `Unsubscribe` for proper cleanup.

### Phase 3: AI Service Integration (`src/services/geminiService.ts`) ✅ VERIFIED
The AI generates a big JSON blob. The "Deep Research" logic needs to remain the same (generating the plan), but the **saving logic** needs to handle the split.
*   ✅ **Done:** `createProject` in `db.ts` already handles AI-generated templates and distributes tasks into sub-collections (see lines 241-259)

### Phase 4: UI Adaptation ⚠️ IN PROGRESS
Components expecting a full `Project` object with arrays need to be updated to handle async loading or new hooks.

**Migration Guide for Components:**

```typescript
// OLD WAY (will still work, but loads everything)
const project = await getProject(projectId);
const tasks = project.tasks; // Empty array!

// NEW WAY Option 1: Load everything at once
const project = await getProjectFull(projectId);
const tasks = project.tasks; // ✅ Populated

// NEW WAY Option 2: Load sub-collections separately (more efficient)
const project = await getProject(projectId); // Lightweight
const tasks = await getTasks(projectId); // Only tasks

// NEW WAY Option 3: Real-time updates (recommended for interactive UIs)
useEffect(() => {
  const unsubscribe = subscribeToTasks(projectId, (tasks) => {
    setTasks(tasks);
  });
  return () => unsubscribe();
}, [projectId]);
```

**Components to Update:**
*   ⚠️ **`Dashboard`**: Should use `subscribeToTasks` for real-time stats
*   ⚠️ **`TaskBoard`**: Should use `subscribeToTasks` for live kanban updates
*   ⚠️ **`ShoppingList`**: Should use `subscribeToShoppingItems` or `getShoppingItemsByStore`
*   ⚠️ **`AIAssistant`**: Verify it works with new structure

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

## 7. Implementation Summary (2025-12-11)

### ✅ What's Working
- Sub-collection architecture fully implemented in `db.ts`
- Dependency engine for task blockers
- Shopping intelligence with Store Mode
- Real-time listeners for all data types
- Backward compatible: `Project` type unchanged, `getProjectFull()` makes it look "full"

### ⚠️ Next Steps
1. Update UI components to use new functions (Dashboard, TaskBoard, ShoppingList)
2. Add visual indicators for blocked tasks in TaskBoard
3. Implement Store Mode toggle in ShoppingList component
4. Test with real data and multiple users

### 📊 Performance Benefits
- **Before:** Loading 1 project = 1 large document (could hit 1MB limit with images)
- **After:** Loading 1 project = 1 small doc + parallel sub-collection queries
- **Real-time:** Components can subscribe only to data they need

### 🔧 Developer Experience
```typescript
// Efficient: Load only what you need
const tasks = await getTasks(projectId);

// Complete: Load everything
const project = await getProjectFull(projectId);

// Live: Subscribe to changes
const unsubscribe = subscribeToTasks(projectId, setTasks);
```

---

**Status:** Database layer complete. UI migration pending.
**AI-Agent:** Claude (Session: 01Xjmi7N7aGQ7316aLT5r53t)
**Date:** 2025-12-11
