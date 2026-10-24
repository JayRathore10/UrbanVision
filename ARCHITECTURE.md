# System Architecture & Design

## 1. High-Level System Flow

The platform operates on a decentralized edge-to-cloud model, ingesting data from mobile units into a scalable Node.js/MongoDB backend, consumed by a React frontend.

```mermaid
graph TD
    subgraph Mobile Edge Units [Garbage Trucks]
        C1[Front Camera] --> AI[Edge AI Box]
        C2[Left/Right Cameras] --> AI
        AI -- "Detects Issue (Pothole/Garbage)" --> AI
    end

    subgraph Cloud Backend [Node.js + Express TS]
        API[REST API Router]
        Auth[JWT Authentication]
        Geospatial[Spatial Deduplication Logic]

        AI -- "POST /api/issues (JSON + Image)" --> API
        API --> Auth
        API --> Geospatial
    end

    subgraph Database [MongoDB Atlas]
        Geospatial -- "$near queries" --> DB[(MongoDB Collections)]
    end

    subgraph Client Interfaces [React.js .jsx]
        DB -. "JSON Data" .-> API
        API -- "GET /api/issues" --> Web[Officer Web Dashboard]
        API -- "GET /api/tasks" --> Mobile[Worker Web App]
        Mobile -- "PATCH /api/tasks/resolve (Photo)" --> API
    end
```

## 2. Database Schema (MongoDB / Mongoose)

Using NoSQL Document structures with GeoJSON for location data.

```
erDiagram
    USERS {
        ObjectId _id
        String name
        String role "Officer, Worker, Admin"
        String email
        String phone
    }
    ISSUES {
        ObjectId _id
        String type "Pothole, Garbage, Drain"
        Point location "GeoJSON [lng, lat]"
        String imageUrl
        String severity "High, Medium, Low"
        String status "Pending, Assigned, Resolved"
        Date detectedAt
    }
    TASKS {
        ObjectId _id
        ObjectId issueId "Ref: Issues"
        ObjectId workerId "Ref: Users"
        String resolutionProofUrl
        Date assignedAt
        Date completedAt
    }
    VEHICLES {
        ObjectId _id
        String licensePlate
        String edgeUnitStatus "Online, Offline"
        Point lastKnownLocation
    }

    USERS ||--o{ TASKS : "assigned to"
    ISSUES ||--o{ TASKS : "generates"
```
