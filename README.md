# Elton - The VanPlan 🚐💨

The ultimate digital companion for vehicle builders, restorers, and enthusiasts. From planning and budgeting to AI-powered research and diagnostics.

## 🚀 Vision: "The Garage OS"

VanPlan is not just a todo-list. It's a specialized Operating System for your garage projects. Whether you are building a campervan, restoring a classic Volvo, or tuning a drift car, Elton helps you manage the chaos.

### Key Capabilities

*   **🕵️‍♂️ Deep Research Agents:** Creates a complete project plan from a single photo or RegNo. Fetches technical data, service intervals, and known issues ("The Killers") automatically.
*   **🤝 Co-Working:** Invite friends or mechanics to your project. Manage permissions and build together in real-time.
*   **🤖 Elton AI:** A persona-driven assistant (with dialects!) that knows your specific car inside out.
*   **⏳ Visual Timeline:** See your car's history from production day to your latest finished task.
*   **📋 Project Management:** Kanban board with "Smart Context" – relevant data (torque specs, fluid types) appears right where you need it.
*   **💰 Smart Budget:** Tracks estimated vs actual costs, categorizes purchases, and handles receipts.
*   **📚 Knowledge Base:** Stores technical reports, manuals, and AI-generated guides specific to your vehicle.

## 🛠 Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide React, `clsx`, Recharts
*   **Backend (BaaS):** Google Firebase
    *   **Auth:** Passwordless & Email/Password
    *   **Firestore:** NoSQL Database (Projects, Tasks, Users, Invites)
    *   **Storage:** Images & Receipts
*   **AI Core:** Google Gemini 2.0 Flash (`@google/genai`)
    *   **Agents:** Multi-agent system (Detective + Planner)
    *   **Tools:** Google Search, Function Calling
    *   **Vision:** Image analysis for RegNo and parts
*   **Testing:** Vitest, Happy-DOM

## 📂 Project Structure

*   `src/components` - UI Components (Dashboard, TaskBoard, ProjectSelector, Members, etc.)
*   `src/services` - Core logic
    *   `auth.ts` - Firebase Authentication
    *   `db.ts` - Firestore CRUD & Data Models (incl. Co-working logic)
    *   `geminiService.ts` - AI Agents & Tool calling
    *   `storage.ts` - Image upload logic
*   `src/config`
    *   `prompts.ts` - The "Brain". Centralized prompt engineering & personas.
    *   `brands.ts` - Multi-brand configuration (VanPlan, RaceKoll, etc.)
*   `src/types.ts` - TypeScript interfaces

## 🔐 Security & Privacy

*   **Data Isolation:** Strict Firestore Security Rules ensure users can only access projects they own or are invited to.
*   **Private Storage:** Receipts and images are protected via Storage Rules.

## 🚦 Roadmap & Status

See the live **Roadmap** inside the app (Dashboard footer) for real-time status.

**Current Focus:**
1.  ✅ **Platform Architecture:** Multi-project support, Auth, Cloud Sync.
2.  ✅ **Co-Working:** Team support with invites and shared ownership.
3.  ✅ **Deep Research 2.0:** Agent-based onboarding with real-time data fetching & expert analysis.
4.  🚧 **Nano Banana:** AI-generated vehicle icons (SVG generation implemented, full image gen pending API).
5.  🚧 **Live Elton:** Voice/Video interface (Skeleton ready, WebRTC pending).
6.  📅 **Offline Support:** PWA implementation for garage usage without WiFi.

## 🏃‍♂️ Getting Started

1.  **Clone & Install:**
    ```bash
    git clone ...
    npm install
    ```
2.  **Environment Setup:**
    Create a `.env` file with your keys:
    ```
    VITE_GEMINI_API_KEY=your_key_here
    VITE_FIREBASE_CONFIG=... (if needed)
    ```
3.  **Run Development Server:**
    ```bash
    npm run dev
    ```
4.  **Run Tests:**
    ```bash
    npm test
    ```

## 📝 License

Private / Proprietary
