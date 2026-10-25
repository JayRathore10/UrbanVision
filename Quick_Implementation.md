# ⚡ UrbanVision: 10-Hour Hackathon Winning Execution Plan

This document condenses the entire scope of `PRD.md`, `ARCHITECTURE.md`, `DESIGN.md`, `AGENTS.md`, and `tasks.md` into a surgical **10-hour execution roadmap**. Every feature listed here is **100% functional** (zero dead buttons or half-baked mockups) and tailored to maximize hackathon judging criteria: **Visual Polish, Technical Depth (GeoJSON `$near`), and Closed-Loop Usability.**

---

## ⚠️ Golden Hackathon Rules (From `AGENTS.md` & `DESIGN.md`)
1. **Strict Stack Boundary:** Backend is **100% TypeScript (`.ts`)**. Frontend is **100% JavaScript/JSX (`.jsx`)**. Do not mix them.
2. **Unified API Contract:** Every backend endpoint MUST return `{ success: boolean, data: any, message?: string }`.
3. **Zero Cloud-Upload Headaches:** Do **not** waste 2 hours configuring AWS S3 or Cloudinary IAM roles. Use `multer` to store images in `backend/uploads/` and serve them statically via Express (`app.use('/uploads', express.static('uploads'))`), OR store compressed Base64 strings directly in MongoDB. It works 100% reliably for live demos.
4. **Instant Role-Switching Auth:** Build real JWT creation/verification, plus a **"1-Click Demo Role Switcher"** pill in the Top Nav (`Officer View` ↔ `Worker View` ↔ `Edge AI Truck Simulator`) so judges can experience the entire closed-loop ecosystem in 30 seconds without typing passwords.

---

## ⏱️ Hour-by-Hour Execution Schedule

### 🕐 Hour 1: Infrastructure, Monorepo & Database Setup
*Goal: Get Backend (TS), Frontend (JSX), and MongoDB Atlas talking to each other immediately.*

- [ ] **1.1 MongoDB Atlas:** Create cluster, database `urbanvision_prod`, whitelist IP `0.0.0.0/0` (crucial for hackathon Wi-Fi changes), and grab `MONGO_URI`.
- [ ] **1.2 Backend Init (`/backend`):**
  - Run `npm init -y`
  - Install: `npm i express mongoose cors dotenv jsonwebtoken multer`
  - Install Dev/Types: `npm i -D typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken @types/multer`
  - Create `tsconfig.json` (`target: "ES2022"`, `module: "CommonJS"`, `strict: true`).
- [ ] **1.3 Frontend Init (`/frontend`):**
  - Run `npm create vite@latest frontend -- --template react` (Strictly `.jsx`).
  - Install: `npm i tailwindcss postcss autoprefixer lucide-react recharts leaflet react-leaflet axios react-router-dom`
- [ ] **1.4 Static Image Server:** Create `/backend/uploads` folder and expose it in `server.ts` so uploaded worker photos render immediately on the map.

---

### 🕑 Hour 2: Database Schemas & Geospatial Indexing (`ARCHITECTURE.md`)
*Goal: Build type-safe Mongoose models with hardware-grade GeoJSON support.*

- [ ] **2.1 TypeScript Interfaces (`/src/types/index.ts`):** Define strict interfaces for `IUser`, `IIssue`, `ITask`, and `IVehicle`.
- [ ] **2.2 User & Vehicle Models (`/src/models/User.ts`, `Vehicle.ts`):**
  - `User`: `name`, `role` (`Officer | Worker | Admin`), `email`, `phone`, `avatarUrl`.
  - `Vehicle`: `licensePlate`, `edgeUnitStatus` (`Online | Offline`), `lastKnownLocation` (GeoJSON Point).
- [ ] **2.3 Issue Model (`/src/models/Issue.ts`):**
  - Fields: `type` (`Pothole | Garbage | Drain`), `location: { type: { type: String, enum: ['Point'] }, coordinates: [Number] }` (`[lng, lat]`), `imageUrl`, `severity` (`High | Medium | Low`), `status` (`Pending | Assigned | Resolved`), `detectedAt`, `duplicateCount` (default `1` — great for showing judges how many times trucks saw the same pothole!).
  - **CRITICAL:** Apply `issueSchema.index({ location: "2dsphere" })` and ensure indexes build on startup.
- [ ] **2.4 Task Model (`/src/models/Task.ts`):**
  - Fields: `issueId` (ref `Issue`), `workerId` (ref `User`), `priority` (`High | Medium | Low`), `resolutionProofUrl`, `assignedAt`, `completedAt`.

---

### 🕒 Hour 3: Core API & Spatial Deduplication Engine (`PRD.md`)
*Goal: Complete all REST endpoints, including the signature hackathon-winning `$near` deduplication logic.*

- [ ] **3.1 Auth & Seed Route (`POST /api/auth/login` & `POST /api/seed`):**
  - Build a `/api/seed` route that pre-populates 3 realistic Field Workers, 3 Garbage Trucks (`MP-09-GV-1024`, etc.), and 15 realistic issues across the city so your map and charts look rich from minute one.
- [ ] **3.2 Spatial Deduplication Endpoint (`POST /api/issues`):**
  - Before creating a new issue, execute a Mongoose `$near` query:
    ```ts
    const existingIssue = await Issue.findOne({
      type: req.body.type,
      status: { $ne: 'Resolved' },
      location: {
        $near: {
          $geometry: { type: "Point", coordinates: [lng, lat] },
          $maxDistance: 10 // 10 meters threshold per PRD
        }
      }
    });
    ```
  - **Winning Touch:** If `existingIssue` is found, increment `existingIssue.duplicateCount += 1` and return `{ success: true, deduplicated: true, data: existingIssue, message: "Spatial match within 10m! Merged with existing active issue." }`. If not found, create a new `Issue`.
- [ ] **3.3 Dashboard & Map Feed (`GET /api/issues` & `GET /api/analytics`):**
  - Return all issues populated with assigned worker data, plus aggregated counts (`totalIssues`, `resolvedCount`, `pendingCount`, `deduplicatedSavedCount`, and hourly/weekly bar data).
- [ ] **3.4 Task Dispatch & Resolution (`POST /api/tasks/assign` & `PATCH /api/tasks/:id/resolve`):**
  - `POST /api/tasks/assign`: Creates a `Task` document and updates the linked `Issue.status` to `"Assigned"`.
  - `PATCH /api/tasks/:id/resolve`: Uses `multer` to accept the worker's camera upload, saves `resolutionProofUrl`, sets `completedAt`, and updates `Issue.status` to `"Resolved"`.

---

### 🕓 Hour 4: Bento Design System & Dual-Theme Engine (`DESIGN.md`)
*Goal: Make the UI look like a $10M SaaS product before writing a single page feature.*

- [ ] **4.1 CSS Tokens (`/src/index.css`):**
  - Paste the exact `:root` (Light) and `.dark` (Dark) CSS variables from Section 3 of `DESIGN.md` (`--bg`, `--surface`, `--surface-muted`, `--accent`, `--success`, `--warning`, `--danger`, `--shadow`, `--radius-card: 24px`).
  - Import Google Font **Inter** (`400, 500, 600`) and apply `font-variant-numeric: tabular-nums` to metric classes.
- [ ] **4.2 Tailwind Configuration (`tailwind.config.js`):**
  - Configure `darkMode: "class"` and map all custom colors (`bg`, `surface`, `content`, `accent`, `inverse`, `success`, `warning`, `danger`), `borderRadius: { card: "24px", inner: "16px" }`, and `boxShadow: { card: "var(--shadow)" }`.
- [ ] **4.3 Flash-Free Theme Hook (`/src/hooks/useTheme.js`):**
  - Add the inline `<script>` to `index.html` `<head>` and implement `useTheme.js` (supporting Light, Dark, System) with the rotating 44px Sun/Moon icon button.
- [ ] **4.4 Core Bento Primitives (`/src/components/ui/`):**
  - `Card.jsx`: `<section className="bg-surface rounded-card shadow-card p-6 transition-all">`.
  - `Badge.jsx`: Pill-shaped (`rounded-full px-2.5 py-1 text-xs font-medium`) supporting `success`, `warning`, `danger`, and `delta` variants.
  - `MetricBlock.jsx`: Oversized `56px` display number (`tracking-tight font-medium`), muted `/total` suffix, `13px` muted label, and floating top-right delta badge.
  - `Button.jsx`: Primary CTA pill (`bg-inverse text-inverse-text h-11 px-6 rounded-full`) and AI Insight glowing accent pill.

---

### 🕔 Hour 5: App Shell & 12-Column Bento Analytics Dashboard (`DESIGN.md` + `PRD.md`)
*Goal: Build the sticky pill navigation and the executive city-health Bento dashboard.*

- [ ] **5.1 Sticky Top Nav (`/src/components/layout/TopNav.jsx`):**
  - Follow `DESIGN.md` Section 6 & 7.1 strictly: **No sidebar.**
  - Left: Logo pill (`UrbanVision` + truck radar icon).
  - Center: Pill-nav switching smoothly between `Overview (Bento)`, `Live GIS Map`, `Worker App`, and `Edge AI Simulator`.
  - Right: Search pill (`⌘K`), Theme Toggle button (`44px` circle), and active Persona Avatar pill.
- [ ] **5.2 Bento Grid Layout (`/src/pages/Dashboard.jsx`):**
  - Implement the 12-column CSS grid (`max-w-[1440px] mx-auto p-6 gap-5`):
  - **Cols 1–8 (Hero Card): Municipal Detection & Resolution Overview:**
    - Oversized metrics (`Total Active Issues`, `Spatial Duplicates Prevented`, `Avg Resolution Time`).
    - **Recharts Rounded-Pill Bar Chart:** Weekly issue detection vs. resolution (`radius={999}`, `width={22}`, `fill="var(--accent)"` and `fill="var(--surface-muted)"` so colors switch dynamically with Dark Mode) + dashed average line + `"✨ Get AI City Insight"` button (triggers a smart modal summarizing hotspot wards).
  - **Cols 9–12 (Spans 2 Rows): Fleet & Patrol Schedule Strip:**
    - Week calendar strip with active accent pill + live garbage truck edge-unit status list (`MP-09-GV-1024 • Online • Scanning Ward 4`).
  - **Cols 1–4: Civic Health Score Card:**
    - Oversized `%` score (`94%`) + `"Great!"` `success-soft` pill badge + progress bar.
  - **Cols 5–12: Recent Detections & Worker Dispatches List:**
    - 48px circular thumbnails, issue type, GPS coordinates, assigned worker avatar, and inline status badges (`Pending` in danger-soft, `Assigned` in warning-soft, `Resolved` in success-soft).

---

### 🕕 Hour 6: Interactive GIS Map & Custom Tailwind Markers (`PRD.md` + `implementation_plan.md`)
*Goal: Build the real-time command center map with color-coded pins and smooth fly-to animations.*

- [ ] **6.1 Leaflet Integration (`/src/pages/GisMap.jsx`):**
  - Wrap the map inside a large `rounded-card shadow-card overflow-hidden` Bento container with floating pill filters at the top (`All`, `Potholes`, `Garbage`, `Drains`, `Pending Only`).
  - Use Dark/Light adaptive map tiles (or standard OpenStreetMap with clean CSS dark filter in Dark Mode so the map matches `--bg`).
- [ ] **6.2 Custom HTML Status Markers:**
  - Use `L.divIcon` with Tailwind classes to render glowing, pulsing pins:
    - 🔴 **Red (`#EF5B5B`):** `Pending` Pothole / High-Severity Issue
    - 🟠 **Orange (`#F5B83D`):** `Assigned` / Garbage Issue
    - 🟢 **Green (`#22C58B`):** `Resolved` Issue (Verified)
- [ ] **6.3 Interactive Issue Details Drawer:**
  - Clicking any marker slides open a floating Bento side-card over the map showing:
    - Snapshot captured by the Garbage Truck Edge AI.
    - Exact GeoJSON coordinates (`[lng, lat]`), severity badge, and `Duplicate Detections Merged: X` badge.
    - If `Resolved`, displays a side-by-side **Before (Edge AI) vs. After (Worker Verification)** photo comparison.

---

### 🕖 Hour 7: Officer Task Assignment Workflow (`PRD.md`)
*Goal: Connect the GIS Map to the field workers with a 2-click dispatch loop.*

- [ ] **7.1 Task Dispatch Modal (`/src/components/widgets/AssignTaskModal.jsx`):**
  - Triggered from the Map's Issue Details Drawer when an issue is `Pending`.
  - Officer selects a Field Worker from a dropdown (showing current workload count) and chooses a Priority pill (`High`, `Medium`, `Low`).
- [ ] **7.2 Real-Time State Sync:**
  - Submitting calls `POST /api/tasks/assign`.
  - Immediately updates the pin color on the map and switches the issue badge from `Pending` to `Assigned` without page reload.

---

### 🕗 Hour 8: Mobile-Responsive Worker Interface & Camera Loop (`implementation_plan.md`)
*Goal: Build the `/worker` view so judges can take a live photo on their phone or webcam to resolve an issue on the big screen.*

- [ ] **8.1 Mobile-First Bento Feed (`/src/pages/WorkerView.jsx`):**
  - Constrain container (`max-w-md mx-auto`) when viewed on desktop, or open directly on a mobile phone via local network IP.
  - Displays assigned tasks sorted by priority (`High` first) with a `"Navigate in Maps"` pill button (`https://www.google.com/maps?q=lat,lng`).
- [ ] **8.2 Live Camera & Photo Upload Verification:**
  - Add an `<input type="file" accept="image/*" capture="environment" />` styled as a prominent Primary CTA pill (`"📸 Capture Resolution Proof"`).
  - Also include a `"Use Instant Demo Proof Photo"` fallback button in case the presentation laptop webcam is busy.
  - Submitting hits `PATCH /api/tasks/:id/resolve`, attaches current timestamp + GPS verification badge, and flips the issue on the central map to **Green (`Resolved`)**!

---

### 🕘 Hour 9: The "Hackathon Winner" Secret Weapon — Live Edge AI Truck Simulator
*Goal: Judges love seeing the hardware-to-cloud ingestion AND spatial deduplication happen live in front of their eyes.*

- [ ] **9.1 Edge AI Simulator Widget (`/src/components/widgets/EdgeSimulatorModal.jsx`):**
  - Accessible directly from the Top Nav (`"🚛 Simulate Edge AI"` pill).
  - Shows a simulated Garbage Truck dashcam feed with bounding boxes (`Pothole: 96% confidence`, `Garbage Pile: 91% confidence`).
- [ ] **9.2 Two Live Demo Buttons for Judges:**
  1. **`"📡 Broadcast New Detection"`:** Sends `POST /api/issues` with coordinates near the map center. Map immediately flies to the new red pulsing pin and increments dashboard metrics.
  2. **`"🔁 Simulate 2nd Truck Passing Same Spot (5m away)"`:** Sends `POST /api/issues` with coordinates shifted by `0.00003` degrees (~3 meters).
     - Backend `$near` catches it!
     - UI pops up a celebratory toast: **`"🛡️ Spatial Deduplication Triggered ($near < 10m): Merged with Issue #402 instead of creating duplicate!"`** and increments the `duplicateCount` badge on the map pin. *This guarantees technical points from judges.*

---

### 🕙 Hour 10: Polish, Motion, Seed Data & Pitch Rehearsal
*Goal: Lock in animations, verify Dark/Light mode contrast, and rehearse the 3-minute winning demo.*

- [ ] **10.1 Motion & Polish (`DESIGN.md` Section 9):**
  - Add subtle entry transitions (`animate-in fade-in translate-y-2 duration-300`) to Bento cards.
  - Verify both **Light Mode** (`#EEF0F2` canvas, `#FFFFFF` cards) and **Dark Mode** (`#0B0D12` canvas, `#14171E` cards) have zero hardcoded hex glitches.
- [ ] **10.2 Reset & Seed Script:**
  - Run `/api/seed` once right before judging starts so the database has clean, realistic city metrics.
- [ ] **10.3 The 3-Minute Winning Pitch Flow:**
  1. **0:00–0:45 (The Problem & Bento Dashboard):** Show the Light/Dark Bento Dashboard. Highlight how municipal trucks already drive every street daily. Toggle Dark Mode to flex the `DESIGN.md` token system.
  2. **0:45–1:30 (Live Edge AI + `$near` Deduplication):** Open the GIS Map. Click `"Simulate Edge AI Detection"` → watch a new red pin appear. Click `"Simulate 2nd Truck (5m away)"` → show MongoDB `$near` blocking the duplicate in real time.
  3. **1:30–2:15 (Officer Dispatch):** Click the red pin on the map, inspect the AI snapshot, and assign it to Field Worker "Rajesh Kumar" with `High` priority.
  4. **2:15–3:00 (Closed-Loop Worker Resolution):** Switch to `Worker View`, snap a resolution photo, hit submit, and switch back to the GIS Map to show the pin is now **Green (Resolved)** with Before & After verification photos.

---

## 📁 Final Target Repository Structure (Strictly Compliant with `AGENTS.md`)

```text
urbanvision/
├── backend/                  # STRICTLY TypeScript (.ts)
│   ├── src/
│   │   ├── models/
│   │   │   ├── User.ts
│   │   │   ├── Issue.ts      # Includes 2dsphere index
│   │   │   ├── Task.ts
│   │   │   └── Vehicle.ts
│   │   ├── controllers/
│   │   │   ├── issueController.ts  # Includes $near 10m deduplication
│   │   │   ├── taskController.ts
│   │   │   └── seedController.ts
│   │   ├── routes/
│   │   │   └── apiRoutes.ts
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── server.ts
│   ├── uploads/              # Local static storage for zero-latency demo uploads
│   ├── package.json
│   └── tsconfig.json
│
└── frontend/                 # STRICTLY JavaScript/JSX (.jsx)
    ├── index.html            # Includes flash-free theme script + Leaflet CSS
    ├── tailwind.config.js    # Maps DESIGN.md CSS variables
    └── src/
        ├── index.css         # :root & .dark tokens from DESIGN.md
        ├── hooks/
        │   └── useTheme.js
        ├── context/
        │   └── AppContext.jsx
        ├── components/
        │   ├── layout/
        │   │   └── TopNav.jsx
        │   ├── ui/
        │   │   ├── Card.jsx
        │   │   ├── Badge.jsx
        │   │   ├── Button.jsx
        │   │   └── MetricBlock.jsx
        │   ├── charts/
        │   │   └── IssueResolutionBars.jsx
        │   └── widgets/
        │       ├── AssignTaskModal.jsx
        │       └── EdgeSimulatorModal.jsx
        └── pages/
            ├── Dashboard.jsx # 12-Col Bento Grid
            ├── GisMap.jsx    # React-Leaflet + Custom Tailwind Pins + Drawer
            └── WorkerView.jsx # Mobile Camera Upload & Resolution Loop
```