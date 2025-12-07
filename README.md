# Elton - VanPlan 🚐💨

The ultimate digital companion for your vanlife build. Plan, track, and budget your conversion with AI assistance. Now with multi-project support and AI-powered onboarding!

## 🚀 Features

*   **Platform Architecture (SaaS):** Manage multiple van builds (projects) under one user account.
*   **AI Onboarding & "Research Wizard":** Create a project by simply entering a RegNo or description. Elton AI fetches technical specs, common issues, and creates a tailored service plan automatically.
*   **Deep Research:** Integrated Google Search allows Elton to find real-time prices for parts and verify technical data.
*   **Project Dashboard:** Real-time overview of budget, progress, and weight.
*   **Task Board:** Kanban-style task management (Todo, In Progress, Done).
*   **Smart Shopping List:** Track purchases, upload receipts (with image hosting), and manage budget vs actual cost.
*   **Elton AI:** Integrated AI assistant (Google Gemini) for build advice, cost estimation, and technical help. Now with Markdown support for rich answers.
*   **Vehicle Specs:** Maintain a detailed log of your vehicle's technical specifications.
*   **Cloud Sync:** Full Firebase integration (Firestore, Auth, Storage) for real-time data sync across devices.
*   **Secure:** Robust Firestore Security Rules ensure data privacy.

## 🛠 Tech Stack

*   **Frontend:** React 18, TypeScript, Vite
*   **Styling:** Tailwind CSS, Lucide React (Icons), `clsx`, `tailwind-merge`
*   **Backend (BaaS):** Google Firebase
    *   **Auth:** Email/Link & Password Authentication
    *   **Firestore:** NoSQL Database for projects, tasks, and items.
    *   **Storage:** Image hosting for receipts.
*   **AI:** Google Gemini (`@google/genai`) with Function Calling & Google Search Tool.
*   **Utilities:**
    *   `recharts`: Data visualization
    *   `date-fns`: Date manipulation
    *   `react-markdown`: Rendering AI responses
    *   `uuid`: Unique identifiers
*   **Testing:** Vitest, Happy-DOM

## 📂 Project Structure

*   `/src`
    *   `/components` - UI Components (Dashboard, TaskBoard, ShoppingList, ProjectSelector etc.)
    *   `/services`
        *   `firebase.ts` - App initialization
        *   `auth.ts` - Authentication logic
        *   `db.ts` - Firestore CRUD operations (Deeply nested subcollections)
        *   `storage.ts` - File upload logic
        *   `geminiService.ts` - AI integration & Deep Research logic
    *   `types.ts` - TypeScript interfaces
    *   `constants.ts` - Static data & configuration

## 🔐 Security

*   **Firestore Rules:** Strict security rules ensure users can only access their own projects.
*   **Storage Rules:** File access is restricted to the file owner.

## 🏃‍♂️ Getting Started

1.  **Install dependencies:**
    ```bash
    npm install
    ```
2.  **Start development server:**
    ```bash
    npm run dev
    ```
3.  **Run tests:**
    ```bash
    npm test
    ```
4.  **Build for production:**
    ```bash
    npm run build
    ```

## 📝 License

Private / Proprietary
