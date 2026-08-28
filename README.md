# AI Resume Enhancer

An intelligent resume analysis platform that evaluates resumes against job descriptions using a **LangGraph multi-agent pipeline**. Upload a resume, paste a target job description, and get structured insights — ATS scoring, skills gap analysis, AI-powered resume rewriting, interview prep questions, and a hiring readiness report.

---

## Overview

Job seekers often struggle to tailor resumes for specific roles and understand how Applicant Tracking Systems (ATS) score their applications. This project addresses that by orchestrating **9 specialized AI nodes** into a single analysis pipeline.

Each node handles one focused task — parsing, skill extraction, gap analysis, scoring, rewriting, and more — and passes structured state forward. The output is a comprehensive, job-specific report instead of a generic resume review.

**How it works:**

1. User uploads a resume (PDF or text) and provides a job description
2. FastAPI invokes the LangGraph pipeline
3. Each node calls Groq LLMs with Pydantic-validated structured outputs
4. Results are returned to the React frontend as typed JSON for visualization

---

## Key Features

- **Resume Parsing** — Extracts contact info, education, experience, projects, and skills
- **Skills Extraction** — Categorizes skills (languages, frameworks, cloud, AI tools, soft skills)
- **Experience Analysis** — Evaluates project quality, leadership, quantified achievements, formatting
- **JD Skill Extraction** — Parses required/preferred skills, responsibilities, ATS keywords
- **Gap Analysis** — Compares resume skills against job requirements
- **ATS Scoring** — Scores across 6 dimensions with an overall 0–100 readiness score
- **Resume Rewriting** — Rewrites weak sections when ATS score is below threshold
- **Interview Prep** — Generates technical, behavioral, and project deep-dive questions
- **Career Readiness** — Hiring readiness assessment with suggested roles and improvements

---

## Architecture

### System Overview

> **Add image:** `docs/system-architecture.png`
>
> Draw a high-level component diagram with these boxes and arrows:
> - **React Frontend** (Vite, port 5173) ↔ **FastAPI Backend** (Uvicorn, port 8000) — label the arrow `REST / JSON`
> - FastAPI → **LangGraph Pipeline** (9 nodes) → **Groq API**
> - FastAPI → **MongoDB** (file metadata)
> - FastAPI → **Redis + RQ** → **Background Worker** → Groq (dashed arrow for async PDF upload path)
>
> Save the file as `docs/system-architecture.png`, then add it here:
> `![System Architecture](docs/system-architecture.png)`

| Layer | Components |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS, Recharts, pdfjs-dist |
| **API** | FastAPI — `/analyze`, `/rewrite`, `/upload`, `/files/{id}` |
| **AI Pipeline** | LangGraph with 9 nodes, conditional routing, parallel execution |
| **LLM** | Groq (`allam-2-7b` for structured JSON; vision model for PDF upload worker) |
| **Storage** | MongoDB (Motor) for file records; local disk for uploads |
| **Queue** | Redis + RQ for async PDF processing |

---

### LangGraph Pipeline

Nine specialized nodes run in sequence with parallel branches and conditional routing based on ATS score.

> **Add image:** `docs/langgraph-pipeline.png`
>
> Draw a flowchart showing this exact flow:
> 1. **Start** → `resume_parser`
> 2. Fan out in parallel → `skill_extractor`, `experience_analyzer`, `jd_skill_extractor`
> 3. All three converge → `gap_analysis` → `ats_scoring`
> 4. Conditional split from `ats_scoring`:
>    - score **< 75** → `resume_rewriter` → `interview_generator`
>    - score **≥ 75** → `interview_generator` (skip rewriter)
> 5. `interview_generator` → `career_report` → **End**
>
> Use a diamond or labeled branch at the ATS step to show the `< 75` condition clearly.
>
> Save as `docs/langgraph-pipeline.png`, then add it here:
> `![LangGraph Pipeline](docs/langgraph-pipeline.png)`

| Node | Output |
|------|--------|
| `resume_parser` | `ParsedResume` |
| `skill_extractor` | `ResumeSkills` |
| `experience_analyzer` | `ExperienceAnalysis` |
| `jd_skill_extractor` | `JDSkills` |
| `gap_analysis` | `GapAnalysis` |
| `ats_scoring` | `ATSScore` |
| `resume_rewriter` | `RewrittenResume` *(conditional)* |
| `interview_generator` | `InterviewQuestions` |
| `career_report` | `FinalReport` |

**Routing logic:** If ATS overall score is below **75**, the pipeline runs `resume_rewriter` before interview generation. Stronger resumes skip rewriting.

---

### Data Flow

> **Add image:** `docs/data-flow.png`
>
> Draw a sequence or swimlane diagram for the `/analyze` request:
> 1. **User** → uploads resume + pastes job description
> 2. **Frontend** → extracts PDF text via pdfjs → `POST /analyze`
> 3. **FastAPI** → invokes LangGraph with `resume_text` + `job_description`
> 4. **LangGraph** → loops through 9 nodes, each calling **Groq** and writing to `GraphState`
> 5. **FastAPI** → returns combined JSON response
> 6. **Frontend** → renders Results tabs: Overview, Parsed Resume, Skills, Gap Analysis, Interview, Career
>
> Optionally annotate key `GraphState` keys on the return path: `parsed_resume`, `ats_score`, `interview_questions`, `final_report`.
>
> Save as `docs/data-flow.png`, then add it here:
> `![Data Flow](docs/data-flow.png)`

---

### App Screenshots *(optional)*

> **Add images:** `docs/screenshot-dashboard.png`, `docs/screenshot-results.png`
>
> - **Dashboard** — landing page with feature cards and "Start New Analysis" button
> - **Results** — ATS score gauge, gap analysis table, and interview questions tab
>
> After capturing screenshots, add them under a **Screenshots** section near the top of the README using:
> `![Dashboard](docs/screenshot-dashboard.png)` and `![Results](docs/screenshot-results.png)`

---

## Tech Stack

**Backend:** Python 3.12 · FastAPI · LangGraph · Groq · Pydantic v2 · MongoDB (Motor) · Redis · RQ · pdf2image

**Frontend:** React 19 · TypeScript · Vite · Tailwind CSS v4 · Recharts · Axios

---

## Project Structure

```
AI_RESUME_ENHANCER/
├── app/
│   ├── server.py          # API routes
│   ├── ai_service.py      # Groq client + structured JSON generation
│   ├── db/                # MongoDB collections
│   └── queue/             # Redis/RQ workers
├── graph/
│   ├── builder.py         # LangGraph definition
│   ├── state.py           # GraphState + Pydantic models
│   ├── router.py          # Conditional ATS routing
│   ├── nodes/             # Pipeline node implementations
│   └── prompts/           # Per-node system prompts
├── frontend/
│   └── src/
│       ├── pages/         # Dashboard, Analysis, Results
│       ├── components/    # ATS, skills, interview, career UI
│       ├── hooks/         # Analysis state
│       └── api/           # Backend client
├── requirement.txt
└── run.sh
```

---

## Getting Started

### Prerequisites

- Python 3.12+
- Node.js 18+
- MongoDB on `localhost:27017`
- Redis on `localhost:6379`
- [Poppler](https://poppler.freedesktop.org/) (for PDF upload worker)
- Groq API key from [console.groq.com](https://console.groq.com)

### Setup

```bash
# Clone
git clone <repository-url>
cd AI_RESUME_ENHANCER

# Environment
echo "GROQ_API_KEY=your_key_here" > .env

# Backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirement.txt
pip install pdf2image
./run.sh

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

- Frontend: [http://localhost:5173](http://localhost:5173)
- API: [http://localhost:8000](http://localhost:8000)

### Background worker (optional, for PDF upload)

```bash
source .venv/bin/activate
rq worker
```

---

## API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/` | Health check |
| `POST` | `/analyze` | Run full LangGraph pipeline |
| `POST` | `/rewrite` | Run resume rewriter only |
| `POST` | `/upload` | Upload PDF for async processing |
| `GET` | `/files/{id}` | Poll upload status and result |

**Analyze request:**

```json
{
  "resume_text": "Full resume text...",
  "job_description": "Target job description..."
}
```

**Analyze response:** `parsed_resume`, `resume_skills`, `experience_analysis`, `jd_skills`, `ats_score`, `matched_skills`, `missing_skills`, `interview_questions`, `hiring_readiness`, `final_report`, and more.

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `GROQ_API_KEY` | Yes | Groq API key for LLM calls |

---

## Design Decisions

**LangGraph over a single prompt** — Specialized nodes improve output quality, enable parallel execution, and make each step independently testable.

**Structured outputs (Pydantic)** — Every node returns validated JSON so the frontend can render charts, tables, and tabs reliably.

**Conditional rewriting** — Rewriting runs only when ATS score &lt; 75, saving LLM calls for resumes that already score well.

**Separate `/rewrite` endpoint** — Allows on-demand enhancement from the Results page without re-running the full pipeline.
