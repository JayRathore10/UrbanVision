# UrbanVision Backend

AI-powered municipal road inspection, issue detection, task assignment, and maintenance verification API.

## Architecture

```
backend/
├── server.js                    # Entry point
├── package.json
├── .env.example                 # Environment template
├── dummy_api_response.json      # Sample data for frontend devs
├── src/
│   ├── app.js                   # Express app configuration
│   ├── config/                  # Database, env, multer config
│   ├── models/                  # Mongoose schemas (User, Issue, Task, Camera, Inspection, AuditLog)
│   ├── controllers/             # Route handlers
│   ├── routes/                  # Express routers
│   ├── services/                # Business logic (Gemini AI, detection, verification, assignment)
│   ├── middleware/               # Auth, authorization, validation, error handling
│   ├── validators/              # Joi validation schemas
│   ├── utils/                   # ApiError, asyncHandler, pagination, image utilities
│   ├── scripts/                 # Seed scripts
│   ├── tests/                   # Jest + Supertest tests
│   └── docs/                    # OpenAPI specification
├── uploads/                     # Image/video storage (local dev)
└── logs/                        # Application logs
```

## Requirements

- **Node.js** v18+
- **MongoDB** v6+ (local or Atlas)
- **Google Gemini API Key** (for AI features)

## Quick Start

### 1. Install dependencies
```bash
cd backend
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
# Edit .env with your values:
# - MONGODB_URI (required)
# - JWT_SECRET (required) - generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
# - GEMINI_API_KEY (required for AI features)
```

### 3. Create initial supervisor
```bash
# Via environment variables:
SEED_SUPERVISOR_EMAIL=admin@urbanvision.gov.in SEED_SUPERVISOR_PASSWORD=YourSecurePassword123 SEED_SUPERVISOR_NAME="Admin Supervisor" npm run seed:supervisor

# Or via command arguments:
node src/scripts/seedSupervisor.js admin@urbanvision.gov.in YourSecurePassword123 "Admin Supervisor"
```

### 4. Start the server
```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

### 5. Verify
```bash
curl http://localhost:5000/api/health
```

## Running Tests
```bash
npm test                  # Run all tests
npm run test:coverage     # Run with coverage report
```

Tests use `mongodb-memory-server` — no external MongoDB needed.

## Environment Variables

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `PORT` | No | 5000 | Server port |
| `NODE_ENV` | No | development | Environment |
| `MONGODB_URI` | **Yes** | - | MongoDB connection string |
| `JWT_SECRET` | **Yes** | - | JWT signing secret |
| `JWT_EXPIRES_IN` | No | 15m | Access token expiry |
| `JWT_REFRESH_SECRET` | No | JWT_SECRET | Refresh token secret |
| `JWT_REFRESH_EXPIRES_IN` | No | 7d | Refresh token expiry |
| `GEMINI_API_KEY` | For AI | - | Google Gemini API key |
| `GEMINI_MODEL` | No | gemini-2.0-flash | Gemini model name |
| `CLIENT_ORIGIN` | No | http://localhost:5173 | CORS origin |
| `MAX_IMAGE_SIZE_MB` | No | 10 | Max image upload size |
| `MAX_VIDEO_SIZE_MB` | No | 200 | Max video upload size |
| `AI_MIN_CONFIDENCE` | No | 0.60 | Minimum AI confidence |
| `AI_AUTO_CLOSE_ENABLED` | No | false | Auto-resolve on AI verification |

## API Endpoints

### Authentication
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/auth/register` | No | - | Register worker |
| POST | `/api/auth/login` | No | - | Login |
| POST | `/api/auth/logout` | Yes | Any | Logout |
| GET | `/api/auth/me` | Yes | Any | Current user |
| POST | `/api/auth/refresh` | No | - | Refresh token |

### Camera Ingestion
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/cameras/ingest` | Yes | Supervisor | Upload frame for AI analysis |
| POST | `/api/cameras/video` | Yes | Supervisor | Upload video |
| GET | `/api/cameras/inspection/:id` | Yes | Any | Inspection status |
| GET | `/api/cameras` | Yes | Any | List cameras |

### Issues
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/issues` | Yes | Any | List/filter issues |
| GET | `/api/issues/map` | Yes | Any | GeoJSON map data |
| GET | `/api/issues/:id` | Yes | Any | Issue details |
| PATCH | `/api/issues/:id` | Yes | Supervisor | Update issue |
| PATCH | `/api/issues/:id/status` | Yes | Supervisor | Change status |

### Tasks
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| POST | `/api/assign` | Yes | Supervisor | Assign issue to worker |
| GET | `/api/tasks` | Yes | Any | List tasks |
| GET | `/api/tasks/:id` | Yes | Any | Task details |
| PATCH | `/api/tasks/:id/reassign` | Yes | Supervisor | Reassign task |
| POST | `/api/tasks/:id/cancel` | Yes | Supervisor | Cancel task |
| POST | `/api/tasks/:id/approve` | Yes | Supervisor | Approve resolution |
| POST | `/api/tasks/:id/reject` | Yes | Supervisor | Reject resolution |
| POST | `/api/tasks/:id/accept` | Yes | Worker | Accept task |
| POST | `/api/tasks/:id/start` | Yes | Worker | Start work |
| POST | `/api/tasks/:id/resolve` | Yes | Worker | Submit after-photo |
| POST | `/api/tasks/:id/resubmit` | Yes | Worker | Resubmit evidence |

### Worker
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/worker/tasks` | Yes | Worker | My tasks |
| GET | `/api/worker/tasks/:id` | Yes | Worker | Task detail |
| GET | `/api/worker/history` | Yes | Worker | Completed tasks |
| GET | `/api/worker/stats` | Yes | Worker | My statistics |

### Supervisor
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/supervisor/workers` | Yes | Supervisor | List workers |
| GET | `/api/supervisor/workers/:id` | Yes | Supervisor | Worker detail |
| GET | `/api/supervisor/workers/:id/tasks` | Yes | Supervisor | Worker tasks |
| GET | `/api/supervisor/reviews` | Yes | Supervisor | Pending reviews |
| GET | `/api/supervisor/reviews/:taskId` | Yes | Supervisor | Review detail |

### Dashboard
| Method | Endpoint | Auth | Role | Description |
|--------|----------|------|------|-------------|
| GET | `/api/dashboard/summary` | Yes | Supervisor | Dashboard summary |
| GET | `/api/dashboard/issues-by-type` | Yes | Supervisor | By type |
| GET | `/api/dashboard/issues-by-status` | Yes | Supervisor | By status |
| GET | `/api/dashboard/issues-by-severity` | Yes | Supervisor | By severity |
| GET | `/api/dashboard/detection-trends` | Yes | Supervisor | Trends |
| GET | `/api/dashboard/resolution-metrics` | Yes | Supervisor | Resolution metrics |
| GET | `/api/dashboard/worker-performance` | Yes | Supervisor | Worker performance |

## Example curl Requests

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@urbanvision.gov.in", "password": "YourPassword"}'
```

### Camera Ingest
```bash
curl -X POST http://localhost:5000/api/cameras/ingest \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "image=@photo.jpg" \
  -F "vehicleId=VH-001" \
  -F "cameraId=CAM-F-001" \
  -F "cameraDirection=Front" \
  -F "latitude=22.7196" \
  -F "longitude=75.8577"
```

### Get Issues Map
```bash
curl http://localhost:5000/api/issues/map \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Assign Task
```bash
curl -X POST http://localhost:5000/api/assign \
  -H "Authorization: Bearer SUPERVISOR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"issueId": "ISSUE_ID", "workerId": "WORKER_ID", "priority": "High", "instructions": "Fix the pothole"}'
```

### Submit After-Repair Photo
```bash
curl -X POST http://localhost:5000/api/tasks/TASK_ID/resolve \
  -H "Authorization: Bearer WORKER_TOKEN" \
  -F "image=@after_repair.jpg" \
  -F "workerNotes=Pothole filled with asphalt"
```

## GPS Coordinate Format

All coordinates use **GeoJSON order**: `[longitude, latitude]`.
- Indore example: `[75.8577, 22.7196]`
- Longitude: -180 to 180
- Latitude: -90 to 90

## Error Response Format
```json
{
  "success": false,
  "message": "Description of the error",
  "error": {
    "code": "ERROR_CODE",
    "details": []
  }
}
```

## Security

- Passwords hashed with bcrypt (12 rounds)
- JWT access tokens with configurable expiry
- Helmet security headers
- CORS allowlist
- Rate limiting on auth and AI endpoints
- File upload validation (type, size, count)
- Role-based access control
- Evidence files served through authenticated endpoint
- No secrets in logs or API responses

## Known Limitations

1. **Video frame extraction**: Endpoint accepts video upload but actual FFmpeg frame extraction requires FFmpeg binary and async job processing (documented, not fully implemented).
2. **Real-time streaming**: Not implemented. The system processes discrete frames.
3. **Local file storage**: Uploads stored locally. For production, migrate to cloud object storage (S3/GCS).
4. **Gemini API**: Requires valid API key. AI features gracefully degrade when key is missing.
5. **Transactions**: MongoDB transactions require a replica set. Single-node deployments use application-level consistency.

## Deployment Notes

- Use HTTPS in production (reverse proxy: nginx/Caddy)
- Set `NODE_ENV=production`
- Use a replica set MongoDB deployment for transactions
- Configure cloud object storage for uploads
- Set strong, unique `JWT_SECRET` and `JWT_REFRESH_SECRET`
- Adjust rate limiting for production traffic
- Enable application monitoring and structured logging
