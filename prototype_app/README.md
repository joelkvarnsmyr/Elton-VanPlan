# The VanPlan Platform 🚐

**The VanPlan** is a specialized project management and budget application designed for DIY van conversions (Vanlife). It features a Scandinavian "Nordic Pastel" design, AI-powered assistance ("Elton"), and specific tools for managing vehicle specs, maintenance, and construction phases.

Current Version: **2.0 (Firebase Platform Edition)**

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

The application is built as a scalable SaaS platform.

*   **Frontend**: React 18, TypeScript, Vite.
*   **Styling**: Tailwind CSS (Nordic Theme).
*   **Backend / Cloud**: **Google Firebase**.
    *   **Auth**: User management.
    *   **Firestore**: Realtime NoSQL Database.
    *   **Storage**: Cloud storage for receipts and vehicle photos.
    *   **Hosting**: Global CDN.
*   **AI**: Google Gemini Pro & Gemini Live API (Multimodal: Text, Audio, Video).

### Folder Structure

```
/
├── firebase.json           # Firebase Hosting & Rules config
├── firestore.rules         # Database Security Rules
├── src/
│   ├── App.tsx             # Main Router & State Manager
│   ├── types.ts            # TypeScript Interfaces
│   ├── constants.ts        # Initial Data, Demo Project (Elton)
│   ├── services/
│   │   └── geminiService.ts # AI Logic
│   └── components/
│       ├── AuthLanding.tsx     # Login / Landing Page
│       ├── ProjectSelector.tsx # Dashboard to manage multiple vans
│       ├── Dashboard.tsx       # Project Overview
│       ├── TaskBoard.tsx       # Kanban Board
│       ├── ...
```

## 🚀 Getting Started

1.  **Clone the repo**.
2.  **Install dependencies**: `npm install`
3.  **Set API Keys**:
    *   Create a `.env` file for Gemini `API_KEY`.
    *   Configure `src/services/firebase.ts` (see Migration Guide).
4.  **Run locally**: `npm run dev`.

## 🔄 Data Management

*   **Demo Mode**: Click "Visa Demo" on the landing page to load the read-only "Elton" project (Client-side).
*   **Production**: Create an account to save data to the Firebase Cloud.

