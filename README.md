# The VanPlan Platform 🚐

**The VanPlan** is a specialized project management and budget application designed for DIY van conversions (Vanlife). It features a Scandinavian "Nordic Pastel" design, AI-powered assistance ("Elton"), and specific tools for managing vehicle specs, maintenance, and construction phases.

Current Version: **2.0 (Platform Edition)**

## 🌟 Key Features

*   **Multi-Project Support**: Manage multiple builds (e.g., "The LT31", "The Sprinter") from a single account.
*   **Elton AI (Gemini)**: A context-aware AI project manager that knows your specific vehicle data, reads technical reports, and helps manage your tasks via Text, Voice, and Video.
*   **Agile Planning**: Kanban-style task board with Sprints, Priorities, and subtasks.
*   **Smart Economy**:
    *   **Shopping List**: Track planned vs. actual costs.
    *   **Budget Overview**: Visual graphs of estimated vs. spent budget per phase.
*   **Vehicle Garage**:
    *   **Specs**: Dynamic data based on the active vehicle.
    *   **Service Log**: Digital maintenance history.
    *   **Fuel Log**: Track consumption.
    *   **Weight Watcher**: Live payload calculator.
*   **Knowledge Base**: Integrated technical reports (Markdown) that the AI can read and reference.

## 🏗 Architecture & Tech Stack

The application is currently a **Client-Side SaaS Simulation**. It behaves exactly like a full-stack app but persists data entirely in the browser's `localStorage`.

*   **Frontend**: React 18, TypeScript, Vite.
*   **Styling**: Tailwind CSS (Nordic Theme).
*   **AI**: Google Gemini Pro & Gemini Live API (Multimodal: Text, Audio, Video).
*   **Icons**: Lucide React.
*   **Charts**: Recharts.
*   **Persistence**: LocalStorage (simulating a database with `projects` and `users` collections).

### Folder Structure

```
/
├── index.html              # Entry point & Tailwind Config
├── src/
│   ├── App.tsx             # Main Router & State Manager (Auth/Project Context)
│   ├── types.ts            # TypeScript Interfaces (Project, Task, User, VehicleData)
│   ├── constants.ts        # Initial Data, Demo Project (Elton), Reports
│   ├── services/
│   │   └── geminiService.ts # AI Logic, Tools Definition, Context Injection
│   └── components/
│       ├── AuthLanding.tsx     # Login / Landing Page
│       ├── ProjectSelector.tsx # Dashboard to manage multiple vans
│       ├── Dashboard.tsx       # Project Overview (Charts, Timeline)
│       ├── TaskBoard.tsx       # Kanban Board
│       ├── ShoppingList.tsx    # Economy & Inventory
│       ├── VehicleSpecs.tsx    # Garage, Service Log, Fuel Log
│       ├── AIAssistant.tsx     # Chat Interface
│       └── LiveElton.tsx       # Real-time Voice/Video AI Interface
```

## 🚀 Getting Started

1.  **Clone the repo**.
2.  **Install dependencies**: `npm install`
3.  **Set API Key**:
    *   Create a `.env` file.
    *   Add `API_KEY=your_google_gemini_api_key`.
4.  **Run locally**: `npm run dev`.

## 🔄 Data Management

*   **Demo Mode**: Click "Visa Demo" on the landing page to load the read-only "Elton" project.
*   **Backup**: Go to Profile -> Inställningar -> **Spara Backup** to download a JSON file of all your projects.
*   **Restore**: Use **Återställ Backup** to load data on a new device.

## 🔜 Future Roadmap

*   **Cloud Migration**: Move from LocalStorage to Supabase (See `MIGRATION_GUIDE.md`).
*   **Community**: Share technical reports between users.
*   **Marketplace**: Direct integration with parts suppliers.
