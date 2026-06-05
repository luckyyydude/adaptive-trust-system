# Adaptive Trust-Based Decision System

A full-stack security system that dynamically evaluates user trust using behavioral and contextual signals, predicts risk in real time, and adapts platform behavior automatically.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Chart.js, React Router |
| Backend | Python 3.11, FastAPI |
| Database | PostgreSQL 15 |
| Cache | Redis 7 |
| Realtime | WebSocket (FastAPI native) |
| Containerization | Docker + Docker Compose |

---

## Project Structure

```
trust-system/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI entry point
│   │   ├── core/
│   │   │   ├── config.py        # Settings & trust weights
│   │   │   └── database.py      # SQLAlchemy engine
│   │   ├── models/
│   │   │   └── models.py        # DB models (User, Session, TrustScore...)
│   │   ├── schemas/
│   │   │   └── schemas.py       # Pydantic request/response schemas
│   │   ├── services/
│   │   │   └── trust_engine.py  # Core trust evaluation logic
│   │   └── api/
│   │       ├── trust.py         # Trust evaluation endpoints
│   │       ├── users.py         # User management endpoints
│   │       ├── sessions.py      # Session management endpoints
│   │       └── websocket.py     # WebSocket real-time handler
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Root + routing
│   │   ├── hooks/useAuth.js     # Auth context
│   │   ├── utils/api.js         # Axios API calls
│   │   ├── styles/globals.css   # Global design system
│   │   ├── components/
│   │   │   ├── Sidebar.jsx      # Navigation sidebar
│   │   │   ├── TrustRadar.jsx   # Radar chart component
│   │   │   └── TrustScoreCard.jsx # Score display card
│   │   └── pages/
│   │       ├── LoginPage.jsx    # Auth page
│   │       ├── DashboardPage.jsx # Main overview
│   │       ├── SimulatePage.jsx  # Trust simulator + WebSocket
│   │       ├── SessionsPage.jsx  # Session management
│   │       ├── HistoryPage.jsx   # Audit log + charts
│   │       └── AdminPage.jsx     # Admin controls
│   ├── public/index.html
│   ├── package.json
│   └── Dockerfile
├── docs/
│   └── schema.sql               # Manual DB schema reference
└── docker-compose.yml
```

---

## Setup & Run

### Option 1: Docker Compose (Recommended)

```bash
# Clone / extract the project
cd trust-system

# Start everything
docker-compose up --build

# Frontend: http://localhost:3000
# Backend API: http://localhost:8000
# API Docs: http://localhost:8000/docs
```

### Option 2: Manual Setup

**Backend**
```bash
cd backend
pip install -r requirements.txt

# Set up PostgreSQL and create DB
createdb trustdb

# Create .env file
echo "DATABASE_URL=postgresql://your_user:your_pass@localhost:5432/trustdb" > .env

# Run
uvicorn app.main:app --reload --port 8000
```

**Frontend**
```bash
cd frontend
npm install
npm start
```

---

## How It Works

### Trust Evaluation Engine

The system computes a weighted trust score from 4 dimensions:

| Dimension | Weight | What it measures |
|-----------|--------|-----------------|
| Behavioral | 30% | Click frequency, navigation, inactivity |
| Contextual | 25% | IP, device fingerprint, country, ISP |
| Historical | 25% | Past sessions, flagged ratio |
| Session Stability | 20% | Session age, event burst, new device |

### Trust Actions

| Score Range | Action |
|-------------|--------|
| 80–100 | Full access (ALLOW) |
| 50–79 | OTP/verification required (REQUIRE_OTP) |
| 20–49 | Restricted access (RESTRICT) |
| Below 20 | Session terminated + account locked (TERMINATE) |

### Real-time WebSocket

The Simulate page supports live trust evaluation via WebSocket. Signals are sent every 3 seconds and the trust score updates in real time.

---

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /api/users/register | Register user |
| POST | /api/users/login | Login |
| POST | /api/sessions/create | Create session |
| POST | /api/trust/evaluate | Evaluate trust |
| GET | /api/trust/history/{user_id} | Trust history |
| GET | /api/trust/latest/{session_id} | Latest trust score |
| WS | /ws/trust/{session_id} | Real-time trust stream |

Full interactive docs available at: `http://localhost:8000/docs`

---

## Features

- Dynamic trust scoring with 4 weighted dimensions
- Predictive risk detection before actions complete
- Explainable trust output (positives, negatives, suggestion)
- Radar chart visualization of trust dimensions
- Kill switch: auto-terminates session + locks account at critical trust
- WebSocket real-time trust updates
- 5 built-in user personas for testing
- Full session audit log
- Admin panel for user management

---

## Built for BCA Final Year / Internship Portfolio
