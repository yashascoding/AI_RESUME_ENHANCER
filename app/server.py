from __future__ import annotations

from fastapi import FastAPI, Path, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from uuid import uuid4

from .ai_service import ai_service
from .utils.file import save_to_disk
from .db.collections.files import files_collection, FileSchema
from .queue.workers import process_file
from .queue.q import q
from bson import ObjectId

from graph import build_graph
from graph.state import (
    ATSBreakdown,
    ATSReason,
    ATSScore,
    Education,
    ExperienceAnalysis,
    ExperienceEntry,
    FinalReport,
    GapAnalysis,
    HiringReadiness,
    InterviewQuestion,
    InterviewQuestions,
    JDSkills,
    ParsedResume,
    Project,
    Certifications,
    ResumeSkills,
    RewrittenResume,
    RewrittenSection,
)


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ---------------------------------------------------------------------------
# Request / Response models
# ---------------------------------------------------------------------------

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


# ---------------------------------------------------------------------------
# Helpers – serialize Pydantic models to dicts for JSON response
# ---------------------------------------------------------------------------

def _serialize(obj: object) -> object:
    if isinstance(obj, BaseModel):
        return {k: _serialize(v) for k, v in obj.model_dump().items()}
    if isinstance(obj, list):
        return [_serialize(i) for i in obj]
    return obj


# ---------------------------------------------------------------------------
# Routes
# ---------------------------------------------------------------------------

@app.get("/")
def hello():
    return {"status": "Healthy"}


@app.get("/files/{id}")
async def get_file_by_id(id: str = Path(..., description="ID of the file")):
    db_file = await files_collection.find_one({"_id": ObjectId(id)})
    if not db_file:
        return {"error": "File not found"}
    return {
        "_id": str(db_file["_id"]),
        "name": db_file["name"],
        "status": db_file["status"],
        "result": db_file.get("result"),
    }


@app.post("/upload")
async def upload_file(file: UploadFile):
    file_id = str(uuid4())

    db_file = await files_collection.insert_one(
        document=FileSchema(
            name=file.filename,
            status="saving",
        )
    )

    file_path = f"uploads/{file_id}/{file.filename}"
    await save_to_disk(file=await file.read(), path=file_path)

    q.enqueue(process_file, str(db_file.inserted_id), file_path)

    await files_collection.update_one(
        {"_id": db_file.inserted_id},
        {"$set": {"status": "queued"}},
    )

    return {"file id": str(db_file.inserted_id)}


@app.post("/analyze")
async def analyze_resume(req: AnalyzeRequest):
    """Run the full LangGraph resume analysis pipeline and return all node outputs."""
    graph = build_graph(ai_service)

    initial_state = {
        "resume_text": req.resume_text,
        "job_description": req.job_description,
    }

    result = await graph.ainvoke(initial_state)

    response: dict[str, Any] = {}

    for key in [
        "parsed_resume",
        "resume_skills",
        "experience_analysis",
        "jd_skills",
        "ats_score",
        "ats_breakdown",
        "rewritten_resume",
        "interview_questions",
        "hiring_readiness",
        "final_report",
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

    return response


@app.post("/rewrite")
async def rewrite_resume(req: RewriteRequest):
    """Run only the resume rewriter node to enhance a resume."""
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
                skills_score=0,
                projects_score=0,
                experience_score=0,
                keywords_score=0,
                achievements_score=0,
                formatting_score=0,
            ),
            reasons=[],
        )

    state["missing_skills"] = req.missing_skills
    state["missing_keywords"] = req.missing_keywords
    state["weaknesses"] = req.weaknesses

    node_fn = resume_rewriter_node(ai_service)
    new_state = await node_fn(state)

    return _serialize(new_state.get("rewritten_resume"))
