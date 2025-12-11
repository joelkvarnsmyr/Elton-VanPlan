# Migration Guide: LocalStorage to Supabase ☁️

This guide outlines the technical steps required to migrate **The VanPlan** from its current browser-based `localStorage` architecture to a real backend using **Supabase** (PostgreSQL).

This upgrade will enable:
1.  **True Cloud Sync**: Access your projects from any device.
2.  **Collaboration**: Multiple users working on the same van.
3.  **Image Storage**: Upload real receipts and photos (instead of Base64 strings).

---

## 1. Database Schema (PostgreSQL)

The current `Project` JSON structure in `types.ts` needs to be normalized into relational tables.

### Tables

#### `profiles` (Users)
*   `id` (uuid, primary key, references auth.users)
*   `full_name` (text)
*   `avatar_url` (text)
*   `created_at` (timestamp)

#### `projects` (The Vans)
*   `id` (uuid, primary key)
*   `user_id` (uuid, foreign key to profiles.id)
*   `name` (text)
*   `model` (text)
*   `year` (int)
*   `is_demo` (boolean, default false)
*   `created_at` (timestamp)

#### `vehicle_data` (Specs)
*   `id` (uuid, primary key)
*   `project_id` (uuid, foreign key to projects.id)
*   `reg_no` (text)
*   `vin` (text)
*   `weights_curb` (int)
*   `weights_total` (int)
*   `weights_load` (int)
*   ... (map remaining fields from VehicleData interface)

#### `tasks`
*   `id` (uuid, primary key)
*   `project_id` (uuid, foreign key to projects.id)
*   `title` (text)
*   `description` (text)
*   `status` (enum: 'todo', 'in_progress', 'done')
*   `phase` (text)
*   `priority` (text)
*   `estimated_cost_min` (int)
*   `estimated_cost_max` (int)
*   `actual_cost` (int)
*   `subtasks` (jsonb) - *Store checklists as JSON for flexibility*
*   `tags` (text[])

#### `shopping_items`
*   `id` (uuid, primary key)
*   `project_id` (uuid, foreign key to projects.id)
*   `name` (text)
*   `category` (text)
*   `estimated_cost` (int)
*   `actual_cost` (int)
*   `is_purchased` (boolean)
*   `linked_task_id` (uuid, foreign key to tasks.id, nullable)

---

## 2. Row Level Security (RLS) Policies

To ensure users only see their own projects:

```sql
-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view/edit their own projects
CREATE POLICY "Users can manage their own projects" ON projects
    FOR ALL
    USING (auth.uid() = user_id);
```

---

## 3. Code Refactoring Steps

### A. Install Supabase Client
`npm install @supabase/supabase-js`

### B. Create Service Layer
Create `src/services/supabaseClient.ts`:
```typescript
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseKey)
```

### C. Update `App.tsx` Logic
Replace the `useEffect` that loads from `localStorage` with a Supabase query.

**Old (Local):**
```typescript
const [projects, setProjects] = useState(() => JSON.parse(localStorage.getItem('vanplan-projects') || '[]'));
```

**New (Cloud):**
```typescript
useEffect(() => {
  const fetchProjects = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data } = await supabase
        .from('projects')
        .select('*, tasks(*), shopping_items(*)')
        .eq('user_id', user.id);
      setProjects(data);
    }
  };
  fetchProjects();
}, [currentUser]);
```

### D. Update AI Tools (`geminiService.ts`)
The AI currently modifies the local React state.
*   **Action:** Update tools like `addTask` to perform `await supabase.from('tasks').insert(...)`.
*   **Action:** Ensure the UI listens to realtime subscriptions from Supabase to update instantly when the AI makes changes.

---

## 4. Migration Strategy for Existing Data

1.  **Export:** Use the current "Spara Backup" feature in the app to get a JSON file.
2.  **Import Script:** Write a Node.js script that reads this JSON and inserts it into the Supabase tables using the structure defined in Section 1.
