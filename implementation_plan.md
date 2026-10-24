# Step-by-Step Build Strategy

## Phase 1: Core Setup & Infrastructure (Weeks 1-2)
- [ ] Initialize Git repository and CI/CD pipelines.
- [ ] Setup PostgreSQL + PostGIS database.
- [ ] Scaffold Node.js API and define basic CRUD endpoints for Issues and Workers.
- [ ] Scaffold React Frontend and configure Tailwind CSS Theme System.

## Phase 2: GIS Map Integration & Mock Data (Weeks 3-4)
- [ ] Integrate Mapbox GL JS into the dashboard.
- [ ] Create a mock data generator to simulate vehicle routes and issue detections.
- [ ] Plot points on the map with clustering and custom markers based on the Theme System.
- [ ] Implement side-panel for issue details.

## Phase 3: AI Model & Pipeline Simulation (Weeks 5-6)
- [ ] Train/Fine-tune YOLO model on open-source datasets (potholes, garbage).
- [ ] Build the Edge script (Python) to process video, extract frames, append GPS, and hit the Cloud API.
- [ ] Develop the Deduplication Engine (backend) to prevent duplicate reports.

## Phase 4: Task Assignment & Worker Workflow (Weeks 7-8)
- [ ] Build the Task Management UI on the dashboard.
- [ ] Develop the Worker PWA (Mobile-first view) for receiving tasks.
- [ ] Implement camera/photo upload functionality for workers with location verification.

## Phase 5: UI Polishing & Analytics (Weeks 9-10)
- [ ] Finalize Light/Dark mode toggles.
- [ ] Build the Analytics Dashboard (charts for issue resolution rates, ward-wise breakdown).
- [ ] Conduct end-to-end testing and performance optimization for the map.