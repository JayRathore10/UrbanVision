# Product Requirements Document (PRD) - UrbanVision

## 1. Core Problem Statement
Municipal corporations struggle to proactively monitor civic infrastructure (roads, drainage, cleanliness). Physical inspections are time-consuming, resource-heavy, and reactive. Consequently, issues like potholes, scattered garbage, and blocked drains often go unaddressed until citizens complain, leading to degraded urban environments and higher long-term repair costs.

## 2. Target Personas
*   **Municipal Officers (Supervisors/Admins):** Need a high-level overview of city health, automated anomaly detection, and a streamlined way to assign and track maintenance tasks without field visits.
*   **Field Workers:** Need a simple, mobile-friendly interface to receive tasks, navigate to issue locations, and upload proof of resolution (photos).
*   **Fleet Managers:** Need to track the routes and operational status of garbage collection vehicles serving as mobile inspection units.

## 3. Functional Requirements
*   **Edge AI Detection:** The system must process video feeds from three cameras (front, left, right) mounted on garbage trucks to identify: Potholes, scattered garbage, and blocked/overflowing drains.
*   **Auto-Deduplication:** The backend must cluster and deduplicate repeated detections of the same issue from multiple vehicle passes using GPS coordinates and bounding box similarities.
*   **Interactive GIS Map:** A map-based dashboard displaying issues as color-coded pins (Red=Alert/Pothole, Orange=Warning/Garbage) with clustering for high-density areas.
*   **Task Assignment Workflow:** Officers can select an issue on the map, assign it to a specific worker/team, set priorities, and define deadlines.
*   **Worker Resolution & Verification:** Field app allows workers to upload "after" photos with GPS metadata to prove task completion.
*   **Analytics Dashboard:** Metrics on issue resolution time, hot-spot areas, and worker efficiency.

## 4. Non-Functional Requirements
*   **Edge Computing Constraints:** AI models must be optimized (e.g., YOLOv8-nano/TensorRT) to run on low-power edge devices (like NVIDIA Jetson) mounted on vehicles.
*   **Low Latency & Bandwidth:** The edge device should only transmit metadata (Issue Type, GPS, Timestamp) and a single frame/thumbnail to the cloud, rather than streaming continuous video.
*   **Accessibility:** The web dashboard must comply with WCAG 2.1 AA standards for high contrast and keyboard navigability.
*   **Performance:** The GIS map must smoothly render up to 10,000 concurrent data points without UI blocking (utilizing WebGL/Mapbox/Deck.gl).