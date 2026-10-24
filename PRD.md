# Product Requirements Document (PRD)
**Project Name:** UrbanVision
**Version:** 1.0.0
**Tech Stack:** MERN (MongoDB, Express, React.jsx, Node.js w/ TypeScript)

## 1. Core Problem Statement
Municipal corporations face inefficiencies in identifying and resolving civic issues such as potholes, illegal garbage dumping, and blocked drains. Physical patrols are expensive, reactive, and time-consuming. UrbanVision transforms existing municipal garbage collection vehicles into active mobile inspection units using edge AI, automating issue detection, mapping, and task delegation.

## 2. Target Personas
1. **Municipal Officers / Supervisors:** Use the web dashboard to get a bird's-eye view of city health, view automated reports, and delegate tasks.
2. **Field Workers:** Use a mobile-friendly web app to view assigned tasks, navigate to locations, and upload photo verification of resolved issues.
3. **Fleet Managers:** Monitor the status of edge AI cameras on garbage trucks to ensure maximum area coverage.

## 3. Functional Requirements
* **AI Detection Ingestion:** System must receive and process automated alerts from truck-mounted Edge AI, including issue type, GPS coordinates, severity, and image snapshot.
* **Auto-Deduplication (Spatial):** System must utilize MongoDB geospatial queries (`$near`) to prevent duplicate logging of the same pothole or garbage pile if multiple trucks pass the same location.
* **Interactive GIS Map:** A map interface displaying color-coded issue pins (e.g., Red = Pothole, Orange = Garbage, Green = Resolved) using React Leaflet.
* **Task Assignment Workflow:** Officers can select an issue on the map, assign a worker, and set a priority level.
* **Worker Verification Loop:** Workers can upload timestamped, geolocated photos marking a task as "Resolved," which updates the central map in real-time.
* **Analytics & Reporting:** Dashboard showing issue resolution times, area heatmaps, and worker performance metrics.

## 4. Non-Functional Requirements
* **Tech Stack Boundary:** Frontend is strictly React.js (JavaScript/JSX) for rapid UI development. Backend is strictly Node.js with TypeScript for type-safe API contracts. Database is MongoDB (NoSQL) for flexible GeoJSON storage.
* **Map Rendering Performance:** The GIS map must smoothly render up to 10,000 active points using clustering.
* **Accessibility:** The dashboard must meet WCAG AA standards, featuring high-contrast modes (Dark/Light themes).
* **Low Latency / Edge Resilience:** The API must handle burst traffic when trucks reconnect to cellular networks after passing through dead zones.