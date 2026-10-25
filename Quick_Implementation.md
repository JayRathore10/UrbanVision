# ⚡ UrbanVision: 10-Hour Hackathon Execution Plan (2-Player Co-op)

This execution roadmap is optimized for a 2-person team (1 Backend, 1 Frontend). It parallelizes the workload so neither developer is ever waiting on the other. 

## ⚠️ The "Zero-Blocker" Strategy
* **Hour 0 API Handshake:** Before writing code, agree on a static `dummyData.json` file. The Frontend dev will build the entire UI using this local file while the Backend dev builds the real database.
* **Strict Boundaries:** Backend is **100% TypeScript (`.ts`)**. Frontend is **100% JavaScript/JSX (`.jsx`)**. 
* **Zero Cloud-Upload Headaches:** Backend uses `multer` to store images locally in `backend/uploads/`. No S3 configuration required.

---

## ⏱️ Hour-by-Hour Parallel Execution Schedule

### 🕐 Hour 1: Infrastructure & The Handshake
*Goal: Both environments running locally and the API contract agreed upon.*

* **🤝 Both:** Define `dummy_issues.json` (include at least 1 pothole, 1 garbage, 1 resolved task) so Frontend can start mapping.
* **🛠️ Backend (Dev A):**
  * Create MongoDB Atlas cluster `urbanvision_prod` (whitelist IP `0.0.0.0/0`).
  * `npm init -y` and install: `express mongoose cors dotenv multer` + TS dev dependencies (`typescript tsx @types/node` etc.).
  * Configure `tsconfig.json` and start the `server.ts` boilerplate on port 5000.
* **🎨 Frontend (Dev B):**
  * `npm create vite@latest frontend -- --template react` (Strictly `.jsx`).
  * Install: `tailwindcss lucide-react recharts leaflet react-leaflet axios react-router-dom`.
  * Paste the CSS variables from `DESIGN.md` into `index.css` and configure `tailwind.config.js`.

### 🕑 Hour 2: Schemas vs. App Shell
*Goal: Database shape is locked in; UI layout is established.*

* **🛠️ Backend (Dev A):**
  * Define TS Interfaces (`IUser`, `IIssue`, `ITask`).
  * Build Mongoose Models (`User`, `Issue`, `Task`).
  * **CRITICAL:** Add the geospatial index: `issueSchema.index({ location: "2dsphere" })`.
* **🎨 Frontend (Dev B):**
  * Build the App Shell: Implement the flash-free Dark/Light mode toggle (`useTheme.js`).
  * Build `/components/layout/TopNav.jsx` with the pill-based navigation.
  * Scaffold the 12-column Bento Grid structure in `Dashboard.jsx`.

### 🕒 Hour 3: Core API Logic vs. Dashboard Widgets
*Goal: Backend logic starts working; Dashboard starts looking premium.*

* **🛠️ Backend (Dev A):**
  * Build `POST /api/seed` to instantly generate mock users and issues in the database.
  * Build `GET /api/issues` and `GET /api/analytics` to serve dashboard data.
* **🎨 Frontend (Dev B):**
  * Build Bento Primitives (`Card.jsx`, `Badge.jsx`, `MetricBlock.jsx`).
  * Implement the Recharts Pill Bar chart for issue resolution stats using `dummyData.json`.

### 🕓 Hour 4: The Signature Feature (`$near`) vs. GIS Map
*Goal: The core technical flex of the hackathon takes shape.*

* **🛠️ Backend (Dev A):**
  * Build `POST /api/issues` (Hardware Ingestion Route).
  * Implement the Mongoose `$near` deduplication logic (check for existing issues within 10 meters, increment `duplicateCount` if found).
* **🎨 Frontend (Dev B):**
  * Set up React-Leaflet in `GisMap.jsx`.
  * Create custom HTML Tailwind markers (`L.divIcon`): Red for Pending, Orange for Assigned, Green for Resolved.
  * Render markers on the map using `dummyData.json`.

### 🕔 Hour 5: Task Dispatch Backend vs. Map Interactivity
*Goal: Enable the workflow of assigning issues to workers.*

* **🛠️ Backend (Dev A):**
  * Build `POST /api/tasks/assign` (Links Issue to a Worker, updates status to Assigned).
* **🎨 Frontend (Dev B):**
  * Build the Interactive Issue Details Drawer (slides out when a map pin is clicked).
  * Build the Task Dispatch Modal inside the drawer to allow an Officer to assign a worker.

### 🕕 Hour 6: The Great Integration
*Goal: Connect the React frontend to the Node backend.*

* **🤝 Both:** 
  * Frontend swaps `axios.get(dummyData)` for `axios.get('http://localhost:5000/api/issues')`.
  * Test the `GET` feed, test the Map rendering from real Atlas data, and test the `POST /api/tasks/assign` flow. Fix CORS/Payload bugs.

### 🕖 Hour 7: Worker Photo Uploads (Backend + Frontend)
*Goal: The closed-loop verification system.*

* **🛠️ Backend (Dev A):**
  * Set up `multer` in `server.ts` to save images to `/backend/uploads`.
  * Expose the static folder: `app.use('/uploads', express.static('uploads'))`.
  * Build `PATCH /api/tasks/:id/resolve` to handle the file upload and change Issue status to Resolved.
* **🎨 Frontend (Dev B):**
  * Build `/pages/WorkerView.jsx` (Mobile-responsive view).
  * Implement `<input type="file" accept="image/*" capture="environment" />` to trigger the device camera.

### 🕗 Hour 8: The Hackathon "Wow" Factor
*Goal: Give the judges interactive toys to play with.*

* **🛠️ Backend (Dev A):**
  * Ensure the `$near` response returns a specific flag (`{ deduplicated: true }`) so the frontend can trigger a toast notification.
* **🎨 Frontend (Dev B):**
  * Build the `EdgeSimulatorModal.jsx` (accessible from Top Nav).
  * Add the two live demo buttons: "Broadcast New Detection" and "Simulate 2nd Truck (Trigger $near)".
  * Wire the camera upload form to hit the real Multer endpoint.

### 🕘 Hour 9: Polish & Edge Cases
*Goal: Make it unbreakable for a 3-minute demo.*

* **🛠️ Backend (Dev A):**
  * Add global error handling (no app crashes if the frontend sends bad JSON).
  * Refine the seed script so the demo data is perfectly tailored to the pitch.
* **🎨 Frontend (Dev B):**
  * Fix any Dark/Light mode contrast issues.
  * Add subtle entry animations (`animate-in fade-in`) to the Bento cards.
  * Ensure the map automatically flies (`map.flyTo`) to newly created simulated pins.

### 🕙 Hour 10: Pitch Rehearsal & E2E Testing
*Goal: Rehearse the live demo choreography.*

* **🤝 Both:** 
  * Run the Seed script to wipe the DB clean.
  * Walk through the exact 3-minute pitch:
    1. Show Dashboard (Light/Dark mode).
    2. Open Map -> Trigger Simulator -> Show new pin.
    3. Trigger Simulator again -> Show UI Toast proving `$near` deduplication worked.
    4. Click Map Pin -> Assign to Worker.
    5. Switch to Mobile View -> Snap Photo -> Mark Resolved.
    6. Switch back to Map -> Show Green Pin with Before/After photos.

---

## 📁 Repository Structure (For 2 Devs)

```
urbanvision/
├── backend/                  # Dev A Territory
│   ├── src/
│   │   ├── models/           # Mongoose schemas
│   │   ├── controllers/      # $near logic, Multer handling
│   │   ├── routes/
│   │   └── server.ts
│   └── uploads/              # Stored photos go here
│
└── frontend/                 # Dev B Territory
    ├── src/
    │   ├── components/       # Bento UI, Modals
    │   ├── pages/            # Dashboard, GisMap, WorkerView
    │   └── hooks/            # useTheme
    └── dummyData.json        # Use this for Hours 1-5
```