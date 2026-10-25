# UrbanVision Master Task List

## Infrastructure & Backend Setup
- [ ] Setup MongoDB Atlas cluster and acquire connection string.
- [ ] Run `npm init -y` and `npm install -D typescript ts-node @types/node @types/express`.
- [ ] Configure `tsconfig.json` (Target: ES2022, Module: CommonJS).
- [ ] Create Mongoose schemas (Issue, Task, User) and apply `2dsphere` index on Issue `location`.

## API Development
- [ ] Implement global error handler and async wrapper in Express.
- [ ] Build `/auth/login` and JWT middleware.
- [ ] Build `POST /api/issues` (Hardware Ingestion Route).
- [ ] Implement spatial deduplication logic in Issue controller.
- [ ] Build `GET /api/issues` (Map Population Route).
- [ ] Build `PATCH /api/tasks/:id/resolve` (Worker resolution with Multer for image upload).

## Frontend Setup (React.jsx + Tailwind)
- [ ] Initialize Vite project: `npm create vite@latest frontend -- --template react`.
- [ ] Setup Tailwind CSS, `postcss.config.js`, and `tailwind.config.js`.
- [ ] Implement CSS Variables for Dark/Light mode in `index.css`.
- [ ] Setup React Router (`/dashboard`, `/map`, `/worker`).

## Frontend Features
- [ ] Build Global Layout (Sidebar, Top Nav).
- [ ] Integrate React Leaflet map.
- [ ] Fetch and render MongoDB GeoJSON points on map.
- [ ] Build Issue Details Panel.
- [ ] Build Task Assignment Modal.
- [ ] Build Mobile Worker view for image uploading.





<!-- 

also make a backend_task_completion. file that take  track of task that are completing -->