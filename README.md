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
*   **Testing:**
    *   **Unit Tests:** Vitest, Happy-DOM
    *   **E2E Tests:** Playwright (Chrome, Firefox, Safari, Mobile)

## 📂 Project Structure

*   `src/components` - UI Components (Dashboard, TaskBoard, ProjectSelector, ProjectMembers, etc.)
*   `src/services` - Core logic
    *   `auth.ts` - Firebase Authentication
    *   `db.ts` - Firestore CRUD & Data Models (incl. Co-working logic)
    *   `geminiService.ts` - AI Agents & Tool calling
    *   `storage.ts` - Image upload logic
*   `src/config`
    *   `prompts.ts` - The "Brain". Centralized prompt engineering & personas.
    *   `brands.ts` - Multi-brand configuration (VanPlan, RaceKoll, etc.)
*   `src/types.ts` - TypeScript interfaces
*   `e2e/` - Playwright E2E tests
    *   `coworking.spec.ts` - Co-working feature tests (65 tests)
    *   `helpers/selectors.ts` - Reusable test selectors
    *   `README.md` - Test documentation

## 🔐 Security & Privacy

*   **Data Isolation:** Strict Firestore Security Rules ensure users can only access projects they own or are invited to.
*   **Private Storage:** Receipts and images are protected via Storage Rules.

## 🚦 Roadmap & Status

See the live **Roadmap** inside the app (Dashboard footer) for real-time status.

**Current Focus:**
1.  ✅ **Platform Architecture:** Multi-project support, Auth, Cloud Sync.
2.  ✅ **Co-Working:** Team support with invites and shared ownership. Fully tested with Playwright (65 E2E tests).
3.  ✅ **E2E Test Suite:** Automated testing across all major browsers and mobile devices.
4.  ✅ **Deep Research 2.0:** Agent-based onboarding with real-time data fetching & expert analysis.
5.  🚧 **Nano Banana:** AI-generated vehicle icons (SVG generation implemented, full image gen pending API).
6.  🚧 **Live Elton:** Voice/Video interface (Skeleton ready, WebRTC pending).
7.  📅 **Offline Support:** PWA implementation for garage usage without WiFi.

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
    # Unit tests
    npm test

    # E2E tests (all browsers)
    npm run test:e2e

    # E2E tests with UI (recommended for development)
    npm run test:e2e:ui

    # Debug specific test
    npm run test:e2e:debug
    ```
5.  **Firebase Setup:**
    - Add `localhost` to Authorized domains in Firebase Console → Authentication → Settings
    - This is required for E2E tests to authenticate properly

## 🧪 Testing

VanPlan has comprehensive test coverage to ensure quality and stability:

### E2E Tests (Playwright)
- **65 automated tests** covering Co-working functionality
- **5 browser configurations:** Chrome, Firefox, Safari, Mobile Chrome, Mobile Safari
- **Test coverage:**
  - Users button visibility and interaction
  - ProjectMembers modal opening/closing
  - Team owner, members, and invitations display
  - Email validation in invite forms
  - Dark mode support
  - Responsive design (mobile/desktop)
  - Visual regression testing

### Running Tests
```bash
# Run all E2E tests (headless)
npm run test:e2e

# Interactive UI mode (recommended for development)
npm run test:e2e:ui

# Debug mode with step-by-step execution
npm run test:e2e:debug

# View last test report
npm run test:e2e:report

# Run specific test
npx playwright test -g "should display Users button"

# Run only on Chrome
npx playwright test --project=chromium
```

### Test Files
- `e2e/coworking.spec.ts` - Co-working feature tests
- `e2e/helpers/selectors.ts` - Reusable test selectors and helpers
- `e2e/README.md` - Detailed test documentation
- `playwright.config.ts` - Playwright configuration

### CI/CD
Tests are configured for continuous integration with:
- Automatic retry on failure (2x)
- Screenshot and video capture on failure
- Visual regression testing with baseline comparison

For more details, see `e2e/README.md`.

## 📝 License

Private / Proprietary
