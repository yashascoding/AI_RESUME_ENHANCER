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
│   ├── server.py                 # Routes: /auth/*, /analyze, /rewrite, /upload, /files/{id}
│   ├── main.py                   # Uvicorn entry point
│   ├── auth.py                   # JWT auth: register, login, token utils, password hashing
│   ├── ai_service.py             # Groq client with rate limiting, caching, retry, semaphore
│   ├── db/
│   │   ├── client.py             # Motor (async MongoDB) client → localhost:27017
│   │   ├── db.py                 # Database: Local_RAG
│   │   └── collections/
│   │       ├── files.py          # files collection
│   │       └── (users created dynamically in auth.py)
│   ├── queue/
│   │   ├── q.py                  # Redis queue setup (localhost:6379)
│   │   └── workers.py            # Background PDF processing worker
│   └── utils/
│       └── file.py               # save_to_disk utility
│
├── graph/                        # LangGraph AI pipeline
│   ├── __init__.py               # Exports build_graph, GraphState
│   ├── builder.py                # Graph definition (3 nodes, 2-3 LLM calls)
│   ├── state.py                  # All Pydantic models + GraphState TypedDict
│   ├── router.py                 # Conditional routing (ATS < 75 → rewrite)
│   ├── nodes/
│   │   ├── combined_analysis.py  # LLM Call #1: parse+skills+experience+JD+gap+ATS
│   │   ├── resume_rewriter.py    # LLM Call #2: rewrite (conditional)
│   │   ├── interview_and_report.py # LLM Call #3: interview+career report
│   │   ├── resume_parser.py      # (legacy, kept for /rewrite endpoint)
│   │   ├── skill_extractor.py    # (legacy)
│   │   ├── experience_analyzer.py # (legacy)
│   │   ├── jd_skill_extractor.py # (legacy)
│   │   ├── gap_analysis.py       # (legacy)
│   │   ├── ats_scoring.py        # (legacy)
│   │   └── career_report.py      # (legacy)
│   └── prompts/
│       ├── combined_prompt.py    # System prompt for combined analysis
│       ├── parser_prompt.py      # (legacy)
│       ├── skill_prompt.py       # (legacy)
│       ├── experience_prompt.py  # (legacy)
│       ├── jd_prompt.py          # (legacy)
│       ├── gap_prompt.py         # (legacy)
│       ├── ats_prompt.py         # (legacy)
│       ├── rewrite_prompt.py     # (legacy)
│       ├── interview_prompt.py   # (legacy)
│       └── report_prompt.py      # (legacy)
│
├── frontend/                     # React + TypeScript + Vite + Tailwind v4
│   ├── src/
│   │   ├── App.tsx               # Router: /, /login, /register, /dashboard, /analyze, /results
│   │   ├── main.tsx              # React root
│   │   ├── index.css             # Tailwind v4 theme (dark mode, Inter font)
│   │   ├── api/
│   │   │   └── client.ts         # Axios + JWT interceptor + auth/analysis API functions
│   │   ├── hooks/
│   │   │   ├── useAuth.tsx        # Auth context (login, register, logout, user)
│   │   │   └── useAnalysis.tsx   # Analysis context (run analysis, rewrite, results)
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
│   │   │   ├── resume/           # Upload, JD input, parsed resume, experience, editor
│   │   │   ├── skills/           # Skills overview, JD skills card
│   │   │   ├── interview/        # Interview questions, question cards
│   │   │   ├── career/           # Hiring readiness, overall summary
│   │   │   └── dashboard/        # ATS gauge, score breakdown, gap table, strengths
│   │   ├── pages/
│   │   │   ├── Landing.tsx       # Public landing page
│   │   │   ├── Login.tsx         # Login form
│   │   │   ├── Register.tsx      # Register form
│   │   │   ├── Dashboard.tsx     # App dashboard (protected)
│   │   │   ├── Analysis.tsx      # Upload + JD input workspace (protected)
│   │   │   └── Results.tsx       # 9-tab results dashboard (protected)
│   │   ├── types/
│   │   │   └── index.ts          # All TypeScript interfaces
│   │   └── lib/
│   │       └── utils.ts          # cn() helper
│   └── package.json
│
├── uploads/                      # Uploaded PDFs (UUID-named folders)
├── requirement.txt               # Python dependencies
└── run.sh                        # Backend start script
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
| `POST` | `/analyze` | Run full analysis pipeline |
| `POST` | `/rewrite` | Rewrite resume sections |
| `POST` | `/upload` | Upload PDF file |
| `GET` | `/files/{id}` | Get file status |

## LangGraph Pipeline (Optimized)

```
START
  │
  ▼
Combined Analysis ─────── LLM Call #1 (parse + skills + experience + JD + gap + ATS)
  │
  ├── if ATS < 75 ──→ Resume Rewrite ──→ LLM Call #2
  │                                            │
  ├── if ATS >= 75 ────────────────────────────┤
  │                                            │
  ▼                                            ▼
Interview + Report ────── LLM Call #3 (interview questions + career report)
  │
  ▼
 END
```

**2-3 LLM calls per analysis** (down from 7-9).

## Key Design Decisions

- **JWT auth**: 24h expiry, bcrypt password hashing, MongoDB users collection
- **Rate limiting**: asyncio.Semaphore(3) limits concurrent Groq requests
- **Caching**: SHA256-based in-memory cache, 1h TTL
- **Retry**: Exponential backoff with retry-after header respect
- **Lazy init**: Groq client initializes on first use (server starts without API key)
- **Dark theme**: #09090b background, Inter font, indigo accent
- **Protected routes**: React context + ProtectedRoute/GuestRoute wrappers

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
