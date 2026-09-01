from __future__ import annotations

import hashlib
import json
import logging
import time
from typing import Any

from fastapi import FastAPI, Path, UploadFile, Depends, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from uuid import uuid4

from .ai_service import ai_service
from .utils.file import save_to_disk
from .db.collections.files import files_collection, FileSchema
from .db.collections.analyses import analyses_collection
from .queue.workers import process_file
from .queue.q import q
from bson import ObjectId

# Redis for analysis result caching
try:
    import redis
    _redis = redis.Redis(host="localhost", port=6379, db=0, decode_responses=True)
    _redis.ping()
    REDIS_AVAILABLE = True
except Exception:
    _redis = None
    REDIS_AVAILABLE = False

ANALYSIS_CACHE_TTL = 86400  # 24 hours

from graph import build_graph
from graph.state import (
    ATSBreakdown, ATSReason, ATSScore, Education, ExperienceAnalysis,
    ExperienceEntry, FinalReport, GapAnalysis, HiringReadiness,
    InterviewQuestion, InterviewQuestions, JDSkills, ParsedResume,
    Project, Certifications, ResumeSkills, RewrittenResume, RewrittenSection,
)

from .auth import (
    UserCreate, UserLogin, TokenResponse, UserPayload,
    hash_password, verify_password, create_access_token,
    get_current_user, users_collection,
)

log = logging.getLogger("app.server")

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ── Request logging middleware ─────────────────────────────────────────────

@app.middleware("http")
async def log_requests(request: Request, call_next):
    start = time.time()
    response = await call_next(request)
    elapsed_ms = (time.time() - start) * 1000
    log.info(
        "%s %s -> %d (%.0fms)",
        request.method, request.url.path, response.status_code, elapsed_ms,
    )
    return response


# ── Global exception handler ───────────────────────────────────────────────

@app.exception_handler(Exception)
async def global_exception_handler(request: Request, exc: Exception):
    log.error("Unhandled exception on %s %s: %s", request.method, request.url.path, exc, exc_info=True)
    return JSONResponse(status_code=500, content={"detail": "Internal server error"})


@app.exception_handler(HTTPException)
async def http_exception_handler(request: Request, exc: HTTPException):
    log.warning("HTTP %d on %s %s: %s", exc.status_code, request.method, request.url.path, exc.detail)
    return JSONResponse(status_code=exc.status_code, content={"detail": exc.detail})


# ── Request models ──────────────────────────────────────────────────────────

class AnalyzeRequest(BaseModel):
    resume_text: str = Field(..., description="Full resume text")
    job_description: str = Field(..., description="Job description text")


class RewriteRequest(BaseModel):
    resume_text: str
    job_description: str
    ats_score: float | None = None
    missing_skills: list[str] = []
    missing_keywords: list[str] = []
    weaknesses: list[str] = []


# ── Serialization helper ───────────────────────────────────────────────────

def _serialize(obj: object) -> object:
    if isinstance(obj, BaseModel):
        return {k: _serialize(v) for k, v in obj.model_dump().items()}
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    return obj


# ═══════════════════════════════════════════════════════════════════════════
# PUBLIC ROUTES
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/")
def hello():
    return {"status": "Healthy"}


# ── Auth: Register ─────────────────────────────────────────────────────────

@app.post("/auth/register", response_model=TokenResponse)
async def register(req: UserCreate):
    log.info("Registration attempt for email=%s name=%s", req.email, req.name)
    existing = await users_collection.find_one({"email": req.email})
    if existing:
        log.warning("Registration failed: email=%s already exists", req.email)
        raise HTTPException(status_code=409, detail="Email already registered")

    user_id = str(uuid4())
    hashed = hash_password(req.password)

    await users_collection.insert_one({
        "_id": user_id,
        "name": req.name,
        "email": req.email,
        "password": hashed,
        "created_at": __import__("datetime").datetime.now(__import__("datetime").timezone.utc).isoformat(),
    })

    token = create_access_token({"sub": user_id, "email": req.email})
    log.info("Registration successful: user_id=%s email=%s", user_id, req.email)
    return TokenResponse(
        access_token=token,
        user={"id": user_id, "name": req.name, "email": req.email},
    )


# ── Auth: Login ────────────────────────────────────────────────────────────

@app.post("/auth/login", response_model=TokenResponse)
async def login(req: UserLogin):
    log.info("Login attempt for email=%s", req.email)
    user = await users_collection.find_one({"email": req.email})
    if not user or not verify_password(req.password, user["password"]):
        log.warning("Login failed for email=%s (bad credentials)", req.email)
        raise HTTPException(status_code=401, detail="Invalid email or password")

    token = create_access_token({"sub": str(user["_id"]), "email": user["email"]})
    log.info("Login successful: user_id=%s email=%s", user["_id"], req.email)
    return TokenResponse(
        access_token=token,
        user={"id": str(user["_id"]), "name": user["name"], "email": user["email"]},
    )


# ── Auth: Get current user ────────────────────────────────────────────────

@app.get("/auth/me", response_model=UserPayload)
async def get_me(user: dict = Depends(get_current_user)):
    return UserPayload(id=user["id"], name=user["name"], email=user["email"])


# ═══════════════════════════════════════════════════════════════════════════
# PROTECTED ROUTES (require JWT)
# ═══════════════════════════════════════════════════════════════════════════

@app.get("/files/{id}")
async def get_file_by_id(id: str = Path(..., description="ID of the file"), _user: dict = Depends(get_current_user)):
    log.info("File lookup: id=%s user=%s", id, _user["email"])
    db_file = await files_collection.find_one({"_id": ObjectId(id)})
    if not db_file:
        log.warning("File not found: id=%s", id)
        return {"error": "File not found"}
    return {
        "_id": str(db_file["_id"]),
        "name": db_file["name"],
        "status": db_file["status"],
        "result": db_file.get("result"),
    }


@app.post("/upload")
async def upload_file(file: UploadFile, _user: dict = Depends(get_current_user)):
    file_id = str(uuid4())
    log.info("Upload: filename=%s user=%s file_id=%s", file.filename, _user["email"], file_id)
    db_file = await files_collection.insert_one(
        document=FileSchema(name=file.filename, status="saving")
    )
    file_path = f"uploads/{file_id}/{file.filename}"
    await save_to_disk(file=await file.read(), path=file_path)
    q.enqueue(process_file, str(db_file.inserted_id), file_path)
    await files_collection.update_one(
        {"_id": db_file.inserted_id}, {"$set": {"status": "queued"}}
    )
    log.info("Upload queued: file_id=%s path=%s", db_file.inserted_id, file_path)
    return {"file id": str(db_file.inserted_id)}


@app.post("/analyze")
async def analyze_resume(req: AnalyzeRequest, _user: dict = Depends(get_current_user)):
    """Run the full LangGraph resume analysis pipeline and return all node outputs."""
    # ── Free tier check ──────────────────────────────────────────────
    analysis_count = await analyses_collection.count_documents({"user_id": _user["id"]})
    FREE_TIER_LIMIT = 2
    if analysis_count >= FREE_TIER_LIMIT:
        log.warning("Free tier limit reached: user=%s count=%d", _user["email"], analysis_count)
        raise HTTPException(
            status_code=403,
            detail=f"Free trial limit reached ({FREE_TIER_LIMIT} analyses). Upgrade to Pro for unlimited analyses and resume generation."
        )

    # ── Check Redis cache ──────────────────────────────────────────────
    cache_key = None
    if REDIS_AVAILABLE:
        raw = f"{req.resume_text}:{req.job_description}"
        cache_key = f"analysis:{hashlib.sha256(raw.encode()).hexdigest()[:32]}"
        try:
            cached = _redis.get(cache_key)
            if cached:
                log.info("Cache hit for analysis: user=%s", _user["email"])
                return json.loads(cached)
        except Exception as e:
            log.warning("Redis read failed: %s", e)

    log.info(
        "Analysis started: user=%s resume_chars=%d jd_chars=%d",
        _user["email"], len(req.resume_text), len(req.job_description),
    )
    graph = build_graph(ai_service)
    initial_state = {
        "resume_text": req.resume_text,
        "job_description": req.job_description,
    }
    try:
        result = await graph.ainvoke(initial_state)
    except ValueError as e:
        log.error("Analysis validation error: user=%s error=%s", _user["email"], e)
        raise HTTPException(status_code=400, detail=str(e))
    except Exception as e:
        log.error("Analysis failed: user=%s error=%s", _user["email"], e, exc_info=True)
        raise HTTPException(status_code=500, detail=f"Analysis failed: {e}")

    response: dict[str, Any] = {}
    for key in [
        "parsed_resume", "resume_skills", "experience_analysis", "jd_skills",
        "ats_score", "ats_breakdown", "rewritten_resume", "interview_questions",
        "hiring_readiness", "final_report",
    ]:
        val = result.get(key)
        if val is not None:
            response[key] = _serialize(val)
    response["matched_skills"] = result.get("matched_skills", [])
    response["missing_skills"] = result.get("missing_skills", [])
    response["missing_keywords"] = result.get("missing_keywords", [])
    response["recommendations"] = result.get("recommendations", [])
    response["strengths"] = result.get("strengths", [])
    response["weaknesses"] = result.get("weaknesses", [])

    # ── Store in Redis cache ───────────────────────────────────────────
    if REDIS_AVAILABLE and cache_key:
        try:
            _redis.setex(cache_key, ANALYSIS_CACHE_TTL, json.dumps(response))
            log.info("Analysis cached in Redis: TTL=%ds", ANALYSIS_CACHE_TTL)
        except Exception as e:
            log.warning("Redis write failed: %s", e)

    # ── Save to MongoDB for history ───────────────────────────────────
    try:
        import datetime
        await analyses_collection.insert_one({
            "user_id": _user["id"],
            "resume_text": req.resume_text[:500],
            "job_description": req.job_description[:500],
            "result": response,
            "created_at": datetime.datetime.now(datetime.timezone.utc).isoformat(),
        })
        log.info("Analysis saved to MongoDB for user=%s", _user["email"])
    except Exception as e:
        log.warning("Failed to save analysis to MongoDB: %s", e, exc_info=True)

    log.info("Analysis complete: user=%s keys=%s", _user["email"], list(response.keys()))
    return response


@app.post("/rewrite")
async def rewrite_resume(req: RewriteRequest, _user: dict = Depends(get_current_user)):
    """Run only the resume rewriter node to enhance a resume."""
    log.info("Rewrite started: user=%s resume_chars=%d", _user["email"], len(req.resume_text))
    from graph.nodes import resume_rewriter_node
    from graph.state import GraphState
    state: GraphState = {
        "resume_text": req.resume_text,
        "job_description": req.job_description,
    }
    if req.ats_score is not None:
        state["ats_score"] = ATSScore(
            overall_score=req.ats_score,
            breakdown=ATSBreakdown(
                skills_score=0, projects_score=0, experience_score=0,
                keywords_score=0, achievements_score=0, formatting_score=0,
            ),
            reasons=[],
        )
    state["missing_skills"] = req.missing_skills
    state["missing_keywords"] = req.missing_keywords
    state["weaknesses"] = req.weaknesses
    node_fn = resume_rewriter_node(ai_service)
    new_state = await node_fn(state)
    log.info("Rewrite complete: user=%s", _user["email"])
    return _serialize(new_state.get("rewritten_resume"))


@app.get("/analyses")
async def list_analyses(_user: dict = Depends(get_current_user)):
    """List all past analyses for the current user."""
    log.info("Listing analyses for user=%s", _user["email"])
    cursor = analyses_collection.find(
        {"user_id": _user["id"]},
        {"result": 0, "resume_text": 0, "job_description": 0}
    ).sort("created_at", -1).limit(20)

    analyses = []
    async for doc in cursor:
        analyses.append({
            "id": str(doc["_id"]),
            "created_at": doc.get("created_at", ""),
            "ats_score": doc.get("result", {}).get("ats_score", {}).get("overall_score", 0),
            "candidate_name": doc.get("result", {}).get("parsed_resume", {}).get("name", "Unknown"),
        })

    log.info("Found %d analyses for user=%s", len(analyses), _user["email"])
    return analyses


@app.get("/analyses/count")
async def get_analysis_count(_user: dict = Depends(get_current_user)):
    """Get the number of analyses for the current user."""
    count = await analyses_collection.count_documents({"user_id": _user["id"]})
    return {"count": count, "limit": 2, "is_pro": count >= 100}


@app.get("/analyses/{analysis_id}")
async def get_analysis(analysis_id: str = Path(...), _user: dict = Depends(get_current_user)):
    """Get a specific analysis by ID."""
    log.info("Getting analysis: id=%s user=%s", analysis_id, _user["email"])
    try:
        doc = await analyses_collection.find_one({"_id": ObjectId(analysis_id), "user_id": _user["id"]})
    except Exception as e:
        log.error("Invalid analysis ID: %s error=%s", analysis_id, e)
        raise HTTPException(status_code=400, detail="Invalid analysis ID")
    if not doc:
        log.warning("Analysis not found: id=%s", analysis_id)
        raise HTTPException(status_code=404, detail="Analysis not found")

    result = doc.get("result", {})
    result["created_at"] = doc.get("created_at", "")
    return result


@app.delete("/analyses/{analysis_id}")
async def delete_analysis(analysis_id: str = Path(...), _user: dict = Depends(get_current_user)):
    """Delete a specific analysis by ID."""
    log.info("Deleting analysis: id=%s user=%s", analysis_id, _user["email"])
    result = await analyses_collection.delete_one({"_id": ObjectId(analysis_id), "user_id": _user["id"]})
    if result.deleted_count == 0:
        log.warning("Analysis not found for deletion: id=%s", analysis_id)
        raise HTTPException(status_code=404, detail="Analysis not found")
    log.info("Analysis deleted: id=%s", analysis_id)
    return {"status": "deleted"}
