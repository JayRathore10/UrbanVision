# Implementation Strategy

## Phase 1: Environment & Database Setup (Days 1–2)
- [ ] Provision MongoDB Atlas cluster.
- [ ] Create database `urbanvision_prod`.
- [ ] Initialize Node.js backend.
- [ ] Install Express, Mongoose, TypeScript, and configure `tsconfig.json`.
- [ ] Create Mongoose schema definitions for:
  - [ ] Users
  - [ ] Issues (with GeoJSON `2dsphere` index)
  - [ ] Tasks

## Phase 2: Core API & Spatial Logic (Days 3–5)
- [ ] Build JWT authentication for Officers and Workers.
- [ ] Develop `POST /api/issues` endpoint.
- [ ] Implement Mongoose `$near` logic to check if a new issue is within 10 meters of an existing pending issue to prevent duplicates.
- [ ] Set up local file storage or cloud storage (AWS S3 / Cloudinary) for issue image uploads.

## Phase 3: Frontend Foundation & Theming (Days 6–7)
- [ ] Scaffold React frontend using Vite:
  - [ ] Run `npm create vite@latest frontend -- --template react`
- [ ] Install Tailwind CSS.
- [ ] Configure `tailwind.config.js` for the Light/Dark Theme system.
- [ ] Build layout components:
  - [ ] Sidebar Navigation
  - [ ] Header
  - [ ] Theme Toggle switch

## Phase 4: GIS Map & Dashboard Integration (Days 8–10)
- [ ] Install `react-leaflet` and configure map tiles.
- [ ] Connect the map component to `GET /api/issues`.
- [ ] Map MongoDB documents to Leaflet Markers.
- [ ] Create custom HTML markers using Tailwind classes to represent issue types:
  - [ ] Red = Pothole
  - [ ] Orange = Garbage
- [ ] Build the Issue Details Sidebar, triggered on pin click.

## Phase 5: Worker Interface & Task Loop (Days 11–14)
- [ ] Create a mobile-responsive route `/worker/tasks` in React.
- [ ] Implement the browser Camera API to allow workers to capture photos of resolved issues.
- [ ] Connect frontend uploads to `PATCH /api/tasks/:id/resolve`.
- [ ] Update map state after issue resolution.
