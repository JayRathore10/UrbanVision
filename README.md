# UrbanVision 🏙️

**AI-Powered Smart Municipal Monitoring System**

🚀 **Live Website:** [https://urbanvision-frontend.pie.host/login](https://urbanvision-frontend.pie.host/login)

UrbanVision transforms existing municipal garbage collection vehicles into active mobile inspection units. Using edge AI, the system automatically detects, maps, and reports civic issues like potholes, scattered garbage, and blocked drains without requiring manual physical patrols.

![Stack](https://img.shields.io/badge/Stack-MERN-blue)
![Frontend](https://img.shields.io/badge/Frontend-React.jsx-61DAFB)
![Backend](https://img.shields.io/badge/Backend-Node.js%20%2B%20TypeScript-3178C6)
![Database](https://img.shields.io/badge/Database-MongoDB-47A248)

---

## 🚀 Key Features

- **Automated AI Detection:** Ingests road conditions from edge AI cameras, detecting potholes, garbage, and drainage issues.
- **Spatial Deduplication:** Prevents duplicate reports of the same issue using MongoDB `$near` geospatial queries.
- **Interactive GIS Dashboard:** Real-time, color-coded React Leaflet map displaying active, assigned, and resolved issues.
- **Task Dispatching:** Command center interface to assign verified issues directly to field workers.
- **Closed-Loop Verification:** Mobile-friendly worker interface for uploading timestamped, geolocated photo proof of resolved tasks.
- **Dual Theme UI:** Soft SaaS Light Mode and high-contrast Command Center Dark Mode.

---

## 🏗️ System Architecture

- **Frontend:** React.js (`.jsx`), Tailwind CSS, React Leaflet.
- **Backend:** Node.js, Express.js, TypeScript (`.ts`).
- **Database:** MongoDB (Atlas or local) with Mongoose ODM and GeoJSON support.
- **Edge Units (Simulated/Hardware):** Python (OpenCV/TensorFlow) passing JSON payloads to the API.

---

## 🛠️ Local Installation & Setup

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas account)
- Git

### 1. Clone the Repository

Replace the example URL with your repository URL.

```bash
git clone https://github.com/your-username/urbanvision.git
cd urbanvision
```

### 2. Backend Setup

Navigate to the backend directory and install dependencies.

```bash
cd backend
npm install
```

**Environment Variables (`backend/.env`):**

Create a `.env` file in the `/backend` directory and add:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/urbanvision
JWT_SECRET=your_super_secret_jwt_key
```

Keep `.env` private. Do not commit database credentials or JWT secrets to version control.

**Run the Backend Server:**

```bash
npm run dev
```

This should run the development server with hot reloading, using a configured tool such as `ts-node-dev` or `tsx`.

### 3. Frontend Setup

Open a new terminal window and navigate to the frontend directory.

```bash
cd frontend
npm install
```

**Environment Variables (`frontend/.env`):**

Create a `.env` file in the `/frontend` directory and add:

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

**Run the Frontend Server:**

```bash
npm run dev
```

---

## 🧑‍💻 Development Guidelines

If you are contributing or using AI agents to generate code for this repository, strictly adhere to the following stack boundaries:

1. **Frontend:** Write in JavaScript/JSX (`.jsx`) only. Do **not** use TypeScript for the React UI. Use Tailwind CSS for all styling.
2. **Backend:** Write in TypeScript (`.ts`). Use explicit types and interfaces for API requests, responses, and Mongoose schemas.
3. **Database:** Use Mongoose ODM. Do not use SQL or Prisma. Utilize MongoDB GeoJSON Points for all location-based data.

---

## 📄 License

This project is licensed under the MIT License.
