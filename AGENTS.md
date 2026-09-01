# AGENTS.md — AI Resume Enhancer

## Quick Start

```bash
# 1. Start MongoDB
mongod --dbpath ~/data/db

# 2. Start Backend (Terminal 1)
cd /home/yashas-bhagwat/AI_RESUME_ENHANCER
source .venv/bin/activate
uvicorn app.server:app --host 0.0.0.0 --port 8001

# 3. Start Frontend (Terminal 2)
cd /home/yashas-bhagwat/AI_RESUME_ENHANCER/frontend
npx vite

# 4. Open http://localhost:5173
```

## Environment Variables

Create `.env` in project root:
```
GROQ_API_KEY=your_groq_api_key_here
```

## Project Structure

```
AI_RESUME_ENHANCER/
├── app/                          # FastAPI backend
│   ├── server.py                 # Routes: /auth/*, /analyze, /analyses/*, /rewrite
│   ├── main.py                   # Uvicorn entry point
│   ├── auth.py                   # JWT auth: register, login, token utils, password hashing
│   ├── ai_service.py             # Groq client with rate limiting, caching, retry, semaphore
│   ├── jd_extractor.py           # Deterministic JD keyword extraction (no LLM)
│   ├── db/
│   │   ├── client.py             # Motor (async MongoDB) client → localhost:27017
│   │   ├── db.py                 # Database: Local_RAG
│   │   └── collections/
│   │       ├── files.py          # files collection
│   │       ├── analyses.py       # analyses collection (user history)
│   │       └── (users created dynamically in auth.py)
│   ├── queue/
│   │   ├── q.py                  # Redis queue setup (localhost:6379)
│   │   └── workers.py            # Background PDF processing worker
│   └── utils/
│       └── file.py               # save_to_disk utility
│
├── graph/                        # LangGraph AI pipeline
│   ├── __init__.py               # Exports build_graph, GraphState
│   ├── builder.py                # Graph definition (2 nodes, 2 LLM calls)
│   ├── state.py                  # All Pydantic models + GraphState TypedDict
│   ├── router.py                 # Always routes to interview_and_report
│   ├── nodes/
│   │   ├── combined_analysis.py  # LLM Call #1: parse + gap analysis (ATS is deterministic)
│   │   ├── interview_and_report.py # LLM Call #2: interview questions + recommendations
│   │   └── resume_rewriter.py    # LLM call for /rewrite endpoint (simplified schema)
│   └── prompts/
│       └── combined_prompt.py    # System prompt (legacy, kept for reference)
│
├── frontend/                     # React + TypeScript + Vite + Tailwind v4
│   ├── src/
│   │   ├── App.tsx               # Router: /, /login, /register, /dashboard, /analyze, /results
│   │   ├── main.tsx              # React root
│   │   ├── index.css             # Tailwind v4 theme (dark mode, Inter font)
│   │   ├── api/
│   │   │   └── client.ts         # Axios + JWT interceptor + auth/analysis/history API
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx        # Auth context (login, register, logout, user)
│   │   │   └── useAnalysis.tsx   # Analysis context (run analysis, load past, results)
│   │   ├── components/
│   │   │   ├── auth/
│   │   │   │   └── ProtectedRoute.tsx  # Route guards (ProtectedRoute, GuestRoute)
│   │   │   ├── layout/
│   │   │   │   ├── AppLayout.tsx  # Outlet wrapper
│   │   │   │   └── Header.tsx     # Sticky nav with user info + logout
│   │   │   ├── ui/               # Design system primitives
│   │   │   │   ├── button.tsx, card.tsx, badge.tsx, tabs.tsx
│   │   │   │   ├── input.tsx, textarea.tsx, progress.tsx
│   │   │   │   ├── separator.tsx, scroll-area.tsx
│   │   │   ├── resume/           # Upload, JD input, parsed resume
│   │   │   ├── interview/        # Interview questions, question cards
│   │   │   └── dashboard/        # ATS gauge, score breakdown, gap table, strengths
│   │   ├── pages/
│   │   │   ├── Landing.tsx       # Public landing page (no Sign In button)
│   │   │   ├── Login.tsx         # Login form
│   │   │   ├── Register.tsx      # Register form
│   │   │   ├── Dashboard.tsx     # Previous analyses + delete + free tier + upgrade modal
│   │   │   ├── Analysis.tsx      # Upload + JD input workspace (protected)
│   │   │   └── Results.tsx       # 4-tab results: Overview, Resume, Gap, Interview
│   │   ├── types/
│   │   │   └── index.ts          # All TypeScript interfaces
│   │   └── lib/
│   │       └── utils.ts          # cn() helper
│   └── package.json
│
├── uploads/                      # Uploaded PDFs (UUID-named folders)
├── tests/                        # 16 tests (ai_service, router, frontend)
├── requirement.txt               # Python dependencies
├── AGENTS.md                     # This file
└── Errors.md                     # Known issues tracker
```

## API Endpoints

### Public
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/` | Health check |

### Auth (public)
| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/auth/register` | Create account → returns JWT + user |
| `POST` | `/auth/login` | Login → returns JWT + user |

### Protected (requires `Authorization: Bearer <token>`)
| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/auth/me` | Get current user |
| `POST` | `/analyze` | Run full analysis (free tier: max 2 per user) |
| `GET` | `/analyses` | List past analyses for current user |
| `GET` | `/analyses/count` | Get analysis count + tier info |
| `GET` | `/analyses/{id}` | Get specific analysis by ID |
| `DELETE` | `/analyses/{id}` | Delete an analysis |
| `POST` | `/rewrite` | Rewrite resume (simplified schema) |
| `POST` | `/upload` | Upload PDF file |
| `GET` | `/files/{id}` | Get file status |

## LangGraph Pipeline (Optimized)

```
START
  │
  ▼
Combined Analysis ─────── LLM Call #1 (parse resume)
  │
  │                       JD Keywords ── extracted deterministically (no LLM)
  │                       ATS Score ──── computed deterministically (no LLM)
  │
  ▼
Interview + Report ────── LLM Call #2 (14 questions + recommendations)
  │
  ▼
 END
```

**2 LLM calls per analysis** (down from 7-9). ATS scoring is deterministic.

## Key Design Decisions

- **JWT auth**: 24h expiry, bcrypt password hashing, MongoDB users collection
- **Rate limiting**: asyncio.Semaphore(3) limits concurrent Groq requests
- **Caching**: SHA256-based in-memory cache (1h) + Redis cache (24h)
- **Retry**: Exponential backoff with retry-after header respect
- **Lazy init**: Groq client initializes on first use (server starts without API key)
- **Dark theme**: #09090b background, Inter font, indigo accent
- **Protected routes**: React context + ProtectedRoute/GuestRoute wrappers
- **Free tier**: 2 analyses per user, then upgrade modal (Pro: ₹100 one-time)
- **JD extraction**: Deterministic keyword extraction (no LLM) handles any-size JDs
- **ATS scoring**: Deterministic based on skills match, keyword coverage, experience, projects
- **Interview questions**: 14 questions distributed across technical/behavioral/project categories
- **History**: MongoDB stores analysis results per user, dashboard shows list with delete

## Testing

```bash
# Backend tests
cd /home/yashas-bhagwat/AI_RESUME_ENHANCER
source .venv/bin/activate
pytest tests/ -v

# Frontend build check
cd frontend
npx tsc --noEmit
npx vite build
```

## Common Issues

- **Port 8000 occupied**: Another app may be using it. Backend runs on 8001.
- **MongoDB lock error**: MongoDB already running. Don't start a second instance.
- **GROQ_API_KEY not set**: Create `.env` file with your API key.
- **Rate limiting**: The pipeline uses semaphore(3) + exponential backoff. If you hit limits, the retry logic handles it automatically.
- **Route ordering**: `/analyses/count` must be defined before `/analyses/{analysis_id}` in FastAPI.
