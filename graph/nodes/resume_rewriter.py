from __future__ import annotations

import logging
import time
from typing import Any

from graph.state import GraphState, RewrittenResume, RewrittenSection

log = logging.getLogger("graph.resume_rewriter")


def resume_rewriter_node(ai_service: Any):
    """Create a resume rewriter node with injected AI service."""

    async def node(state: GraphState) -> dict:
        resume_text = state["resume_text"]
        job_description = state["job_description"]
        ats_score = state.get("ats_score")
        missing_skills = state.get("missing_skills", [])
        missing_keywords = state.get("missing_keywords", [])
        weaknesses = state.get("weaknesses", [])

        score_val = ats_score.overall_score if ats_score else "N/A"
        log.info("Resume rewrite started: ats_score=%s missing_skills=%d", score_val, len(missing_skills))
        start = time.time()

        # Build context for the rewriter
        score_context = f"Current ATS Score: {score_val}/100\n" if score_val != "N/A" else ""
        gaps_context = ""
        if missing_skills:
            gaps_context += f"Missing Skills: {', '.join(missing_skills[:5])}\n"
        if missing_keywords:
            gaps_context += f"Missing Keywords: {', '.join(missing_keywords[:5])}\n"
        if weaknesses:
            gaps_context += f"Weaknesses: {'; '.join(weaknesses[:3])}\n"

        from pydantic import BaseModel, Field

        class SimpleRewrite(BaseModel):
            improved_resume: str = Field(default="", description="The complete improved resume text")
            summary: str = Field(default="", description="Brief summary of changes made")

        result = await ai_service.generate(
            system_prompt=(
                "You are a professional resume writer. Improve the resume to better match the job description.\n"
                "Focus on:\n"
                "- Adding missing skills/keywords naturally\n"
                "- Strengthening weak sections\n"
                "- Improving action verbs and quantification\n"
                "- Keeping the original structure\n\n"
                "Return JSON: {\"improved_resume\": \"full improved resume text\", \"summary\": \"1-2 sentence summary of changes\"}\n"
                "Return ONLY the JSON object."
            ),
            user_prompt=(
                f"{score_context}"
                f"{gaps_context}\n"
                f"Original Resume:\n{resume_text}\n\n"
                f"Job Description:\n{job_description}"
            ),
            response_model=SimpleRewrite,
        )

        # Convert to the expected format
        rewritten = RewrittenResume(
            full_improved_resume=result.improved_resume,
            changes_summary=result.summary,
            rewritten_sections=[
                RewrittenSection(
                    section="full_resume",
                    original=resume_text[:500],
                    improved=result.improved_resume[:500],
                    changes_made=result.summary,
                )
            ] if result.improved_resume else [],
        )

        elapsed = time.time() - start
        log.info("Resume rewrite complete: %.1fs", elapsed)

        return {"rewritten_resume": rewritten}

    return node
