# Checklist & Feature Tracker

## 1. Project Setup
- [ ] Initialize monorepo (Turborepo or similar) for frontend and backend.
- [ ] Setup ESLint, Prettier, and Husky hooks.
- [ ] Configure environment variables structure (`.env.example`).

## 2. UI & Theming
- [ ] Implement CSS Variables for Light/Dark mode.
- [ ] Configure `tailwind.config.js` with semantic colors (primary, success, warning, alert).
- [ ] Build generic UI components: Pill Buttons, Soft Cards, Map Overlays.

## 3. Backend Development
- [ ] Setup Prisma schema with PostGIS.
- [ ] Create `/api/issues` endpoint (POST for edge devices, GET for dashboard).
- [ ] Create `/api/tasks` endpoint (assignment and status updates).
- [ ] Integrate AWS S3 / Cloudinary for image storage.

## 4. Frontend (Dashboard)
- [ ] Build Layout: Sidebar, Header, Theme Toggle.
- [ ] Build Map View: Integrate Mapbox, plot GeoJSON data.
- [ ] Build Issue List View: Filterable data table of current civic issues.
- [ ] Build Task Assignment Modal.

## 5. Edge AI & Hardware
- [ ] Setup Jetson Nano environment.
- [ ] Write Python script for concurrent 3-camera capture.
- [ ] Integrate YOLOv8 inference loop.
- [ ] Write API client to transmit data over cellular network.