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
    - [x] Pill navigation tabs: Dashboard, Map, Worker App
    - [x] ThemeToggle button (Sun/Moon dropdown)
    - [x] "Edge AI Simulator" pill button trigger
  - [x] Set up `react-router-dom` routes: `/`, `/map`, `/worker`.

---

## 🕒 Phase 2: Bento Dashboard & GIS Map (Hours 3–5)

- [ ] **2.1 Bento UI Primitives**
  - [ ] `Card.jsx` (24px radius, subtle borderless shadow, surface background).
  - [ ] `Badge.jsx` (Pill badges: Success, Warning, Danger, Delta).
  - [ ] `MetricBlock.jsx` (Oversized display numbers 40–56px, muted labels).
- [ ] **2.2 Dashboard View (`src/pages/Dashboard.jsx`)**
  - [ ] 12-column Bento Grid matching `DESIGN.md`.
  - [ ] **Issue Analytics Card:** Large metric display + Recharts rounded-pill bar chart (`radius: [999, 999, 0, 0]`) reading theme variables.
  - [ ] **City Health & Fleet Cards:** Active fleet count, total potholes detected, resolved ratio with badges.
  - [ ] **Recent Detections List:** Row items with custom status chips and timestamps.
- [ ] **2.3 Leaflet GIS Map (`src/pages/GisMap.jsx`)**
  - [ ] Mount `MapContainer` with CartoDB / OpenStreetMap tile layer.
  - [ ] Implement custom HTML Tailwind markers (`L.divIcon`):
    - [ ] 🔴 Red pulse = Pothole (Pending)
    - [ ] 🟠 Orange pulse = Garbage (Assigned)
    - [ ] 🟢 Green pin = Resolved
  - [ ] Add category filter pills (All, Potholes, Garbage, High Severity).
- [ ] **2.4 Slide-Over Drawer & Worker Dispatch Modal**
  - [ ] Clicking a map marker slides open `IssueDrawer.jsx`.
  - [ ] Display snapshot image, location coordinate text, severity badge, and status.
  - [ ] "Dispatch Task" modal allowing selection of a field worker and setting priority.

---

## 🕒 Phase 3: Integration & Worker App (Hours 6–7)

- [ ] **3.1 API Integration Layer**
  - [ ] Create `src/services/api.js` using Axios pointing to `VITE_API_BASE_URL` (with fallback to mock data if offline).
  - [ ] Wire `GisMap.jsx` to fetch live issues from `GET /api/issues`.
  - [ ] Wire Task Dispatch to `POST /api/tasks/assign`.
- [ ] **3.2 Mobile-First Worker Interface (`src/pages/WorkerView.jsx`)**
  - [ ] Responsive container optimized for smartphone viewports.
  - [ ] Assigned tasks queue displaying target location and issue snapshot.
  - [ ] Native camera trigger via `<input type="file" accept="image/*" capture="environment" />`.
  - [ ] Resolution form sending multipart form-data to `PATCH /api/tasks/:id/resolve`.
  - [ ] Instant optimistic update turning task badge to "Resolved".

---

## 🕒 Phase 4: Hackathon Demo Supercharger (Hours 8–10)

- [ ] **4.1 Interactive Edge AI Truck Simulator (`src/components/EdgeSimulatorModal.jsx`)**
  - [ ] Interactive modal mimicking a truck's dashcam Edge AI box.
  - [ ] **Button 1 ("Broadcast New Detection"):** Sends a new coordinate to `POST /api/issues` -> Map animates and adds a red marker.
  - [ ] **Button 2 ("Simulate 2nd Truck - Trigger $near"):** Sends GPS coordinates within 5 meters of an existing pin -> Triggers a visual Toast: *"Spatial deduplication: duplicate issue clustered & ignored ($near < 10m)"*.
- [ ] **4.2 Micro-Interactions & Pitch Polish**
  - [ ] Auto-center Leaflet map (`map.flyTo`) when a simulated detection triggers.
  - [ ] Light/Dark theme smoothness test (zero unstyled flash or invisible text).
  - [ ] Before & After photo slider for resolved issues inside the drawer.
- [ ] **4.3 End-to-End Walkthrough Verification**
  - [ ] Flow 1: Officer Dashboard overview check.
  - [ ] Flow 2: Simulator trigger -> Map live update.
  - [ ] Flow 3: Dispatch modal -> Worker assign.
  - [ ] Flow 4: Worker view camera upload -> Status becomes Resolved.