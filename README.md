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

<img width="989" height="714" alt="image" src="https://github.com/user-attachments/assets/993cbcde-1741-4eed-9e75-9dc7a97215cd" />


| Layer | Components |
|-------|------------|
| **Frontend** | React 19, Vite, Tailwind CSS,  |
| **API** | FastAPI — `/analyze`, `/rewrite`, `/upload`, `/files/{id}` |
| **AI Pipeline** | LangGraph with 3 nodes, conditional routing, parallel execution |
| **LLM** | Groq (`allam-2-7b` for structured JSON; vision model for PDF upload worker) |
| **Storage** | MongoDB (Motor) for file records; local disk for uploads |
| **Queue** | Redis + RQ for async PDF processing |

---

### LangGraph Pipeline

<img width="1349" height="894" alt="image" src="https://github.com/user-attachments/assets/90e9d2ae-f765-4239-8c76-df94fc7da0ee" />


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

<img width="1084" height="955" alt="image" src="https://github.com/user-attachments/assets/67fa85cb-1e27-4c48-928d-b563e1b2ee3c" />


---


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

**Conditional rewriting** — Rewriting runs only when ATS score &lt; 75, saving LLM call for resumes that already score well.

**Separate `/rewrite` endpoint** — Allows on-demand enhancement from the Results page without re-running the full pipeline.
