from __future__ import annotations

from typing import Any

from graph.prompts.rewrite_prompt import RESUME_REWRITER_SYSTEM_PROMPT
from graph.state import GraphState, RewrittenResume


def resume_rewriter_node(ai_service: Any):
    """Create a resume rewriter node with injected AI service."""

    async def node(state: GraphState) -> dict:
        resume_text = state["resume_text"]
        job_description = state["job_description"]
        ats_score = state.get("ats_score")
        ats_breakdown = state.get("ats_breakdown")
        missing_skills = state.get("missing_skills", [])
        missing_keywords = state.get("missing_keywords", [])
        weaknesses = state.get("weaknesses", [])

        score_context = ""
        if ats_score:
            score_context = (
                f"ATS Score: {ats_score.overall_score}/100\n"
                f"Breakdown:\n"
                f"  Skills: {ats_breakdown.skills_score}\n"
                f"  Projects: {ats_breakdown.projects_score}\n"
                f"  Experience: {ats_breakdown.experience_score}\n"
                f"  Keywords: {ats_breakdown.keywords_score}\n"
                f"  Achievements: {ats_breakdown.achievements_score}\n"
                f"  Formatting: {ats_breakdown.formatting_score}\n"
            )

        rewritten_resume = await ai_service.generate(
            system_prompt=RESUME_REWRITER_SYSTEM_PROMPT,
            user_prompt=(
                f"{score_context}\n"
                f"Missing Skills: {missing_skills}\n"
                f"Missing Keywords: {missing_keywords}\n"
                f"Weaknesses: {weaknesses}\n\n"
                f"Resume Text:\n{resume_text}\n\n"
                f"Job Description:\n{job_description}"
            ),
            response_model=RewrittenResume,
        )

        return {"rewritten_resume": rewritten_resume}

    return node
