# 📋 UrbanVision: Frontend Task Completion Tracker

**Tech Stack Rule (Strict):** React.js (`.jsx` only, **no TypeScript**), Tailwind CSS, Lucide Icons, Leaflet/React-Leaflet, Recharts.  
**Theme:** Full Light/Dark mode compliance matching `DESIGN.md` CSS variable tokens.

---

## 🕒 Phase 1: Setup & Foundations (Hours 1–2)

- [x] **1.1 Project Initialization & Dependencies**
  - [x] Initialize Vite React project (`npm create vite@latest frontend -- --template react`).
  - [x] Install packages: `lucide-react`, `recharts`, `leaflet`, `react-leaflet`, `axios`, `react-router-dom`, `clsx`, `tailwind-merge`.
  - [x] Configure `index.html` with anti-flash inline theme script.
- [x] **1.2 Styling & Theming (`DESIGN.md`)**
  - [x] Add `:root` (light) and `.dark` (dark) CSS variables to `src/index.css`.
  - [x] Configure `tailwind.config.js` to map CSS variables (`bg`, `surface`, `accent`, `border`, etc.).
  - [x] Create `src/hooks/useTheme.js` supporting `'light' | 'dark' | 'system'`.
- [x] **1.3 Mock Data Layer**
  - [x] Create `src/data/dummyData.json` containing mock issues (potholes, garbage, resolved), active workers, and weekly stats.
- [x] **1.4 App Shell & Navigation**
  - [x] Create `src/components/layout/TopNav.jsx` with pill layout:
    - [x] Logo pill (left)
    - [x] Pill navigation tabs: Dashboard, Map, Worker App, Supervisor
    - [x] ThemeToggle button (Sun/Moon dropdown)
    - [x] "Edge AI Simulator" pill button trigger
  - [x] Set up `react-router-dom` routes: `/`, `/map`, `/worker`, `/supervisor`.

---

## 🕒 Phase 2: Bento Dashboard & GIS Map (Hours 3–5)

- [x] **2.1 Bento UI Primitives**
  - [x] `Card.jsx` (24px radius, subtle borderless shadow, surface background).
  - [x] `Badge.jsx` (Pill badges: Success, Warning, Danger, Delta, Neutral, Accent).
  - [x] `MetricBlock.jsx` (Oversized display numbers 40–56px, muted labels, delta badges).
  - [x] `LoadingSpinner.jsx`, `EmptyState.jsx`, `ConfirmDialog.jsx`, `Toast.jsx` notification system.
- [x] **2.2 Dashboard View (`src/pages/Dashboard.jsx`)**
  - [x] 12-column Bento Grid matching `DESIGN.md` (responsive 12-col desktop, 6-col tablet, 1-col mobile).
  - [x] **Issue Analytics Card:** Large metric display + Recharts rounded-pill bar chart (`radius: [999, 999, 0, 0]`) reading theme variables.
  - [x] **City Health & Fleet Cards:** Active fleet count, total potholes detected, resolved ratio with badges.
  - [x] **Recent Detections List:** Row items with custom status chips, timestamps, and category icons.
  - [x] **Integrated APIs:** `GET /api/dashboard/summary`, `GET /api/dashboard/issues-by-type`, `GET /api/dashboard/issues-by-severity`, `GET /api/dashboard/detection-trends`, `GET /api/dashboard/resolution-metrics`.
- [x] **2.3 Leaflet GIS Map (`src/pages/GisMap.jsx`)**
  - [x] Mount `MapContainer` with CartoDB / OpenStreetMap tile layer.
  - [x] Implement custom HTML Tailwind markers (`L.divIcon`):
    - [x] 🔴 Red pulse = Pothole / Unassigned (Pending)
    - [x] 🟠 Orange pulse = In Progress / Assigned
    - [x] 🟢 Green pin = Resolved
  - [x] Add category filter pills (All, Potholes, Garbage, Drains, High Severity, Resolved).
  - [x] Integrated API: `GET /api/issues` and `GET /api/issues/map` with resilient fallback.
- [x] **2.4 Slide-Over Drawer & Worker Dispatch Modal**
  - [x] Clicking a map marker slides open side inspection drawer with defect specs, coordinates, and photo evidence.
  - [x] Display snapshot image, location coordinate text, severity badge, and status.
  - [x] "Dispatch Task" modal allowing selection of a field worker and setting priority.
  - [x] Integrated API: `POST /api/assign` (or `POST /api/tasks/assign`) with optimistic state updates.

---

## 🕒 Phase 3: Integration & Worker App (Hours 6–7)

- [x] **3.1 API Integration Layer**
  - [x] Create `src/services/api.js` using Axios pointing to `VITE_API_BASE_URL` with JWT token management, 401 interceptors, and non-blocking token refresh logic.
  - [x] Complete domain services: `authService.js`, `issueService.js`, `taskService.js`, `workerService.js`, `supervisorService.js`, `dashboardService.js`, `cameraService.js`, `evidenceService.js`.
  - [x] State management & context: `AuthContext.jsx` with session restore and `useApi.js` hook with race-condition prevention.
  - [x] Wire `GisMap.jsx` to fetch live issues from `GET /api/issues` / `GET /api/issues/map`.
  - [x] Wire Task Dispatch to `POST /api/assign` / `POST /api/tasks/assign`.
- [x] **3.2 Mobile-First Worker Interface (`src/pages/WorkerView.jsx`)**
  - [x] Responsive container optimized for smartphone viewports.
  - [x] Assigned tasks queue displaying target location and issue snapshot (`GET /api/worker/tasks`).
  - [x] Task lifecycle progression: Accept task (`POST /api/tasks/:id/accept`), Start work (`POST /api/tasks/:id/start`).
  - [x] Native camera trigger via `<input type="file" accept="image/*" capture="environment" />`.
  - [x] Resolution form sending multipart form-data to `POST /api/tasks/:id/resolve` (or `PATCH /api/tasks/:id/resolve`).
  - [x] Instant optimistic update turning task badge to "Resolved".
  - [x] Worker history (`GET /api/worker/history`) and personal stats leaderboard (`GET /api/worker/stats`).
- [x] **3.3 Supervisor Operations Station (`src/pages/SupervisorView.jsx`)**
  - [x] Review queue for completed tasks awaiting QA (`GET /api/supervisor/reviews`).
  - [x] Side-by-side photographic comparison (Before Defect vs After Repair).
  - [x] Supervisor approval (`POST /api/tasks/:id/approve`) and rejection with rework notes (`POST /api/tasks/:id/reject`).
  - [x] Worker directory and live workload distribution (`GET /api/supervisor/workers`).

---

## 🕒 Phase 4: Hackathon Demo Supercharger (Hours 8–10)

- [x] **4.1 Interactive Edge AI Truck Simulator (`src/components/EdgeSimulatorModal.jsx`)**
  - [x] Interactive modal mimicking a truck's dashcam Edge AI box with Tri-Lens switching (Front, Left, Right).
  - [x] **Button 1 ("Broadcast New Detection"):** Sends coordinate/frame to `POST /api/cameras/ingest` or dispatches event -> Map animates and adds a new marker with `map.flyTo`.
  - [x] **Button 2 ("Simulate 2nd Truck - Trigger $near"):** Sends GPS coordinates within 5 meters of an existing pin -> Triggers visual Toast: *"Spatial deduplication: duplicate issue clustered & ignored ($near < 10m threshold matched)!"*.
  - [x] Inspection video upload with progress indicator (`POST /api/cameras/video`).
- [x] **4.2 Micro-Interactions & Pitch Polish**
  - [x] Auto-center Leaflet map (`map.flyTo`) when a simulated detection triggers or pin is clicked.
  - [x] Light/Dark theme smoothness test (zero unstyled flash or invisible text).
  - [x] Before & After photo comparison view for resolved issues inside the drawer and supervisor view.
- [x] **4.3 End-to-End Walkthrough Verification**
  - [x] Flow 1: Officer Dashboard overview check (metrics, Recharts pill bar chart, category donut).
  - [x] Flow 2: Simulator trigger -> Map live update with pulsing pins.
  - [x] Flow 3: Dispatch modal -> Worker assign.
  - [x] Flow 4: Worker view camera upload -> Status becomes Resolved & Verified.
  - [x] Flow 5: Supervisor QA side-by-side review -> Approve / Reject.
