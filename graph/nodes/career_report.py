from __future__ import annotations

from typing import Any

from graph.prompts.report_prompt import CAREER_REPORT_SYSTEM_PROMPT
from graph.state import FinalReport, GraphState


def career_report_node(ai_service: Any):
    """Create a career report node with injected AI service."""

    async def node(state: GraphState) -> dict:
        ats_score = state.get("ats_score")
        strengths = state.get("strengths", [])
        weaknesses = state.get("weaknesses", [])
        matched_skills = state.get("matched_skills", [])
        missing_skills = state.get("missing_skills", [])
        recommendations = state.get("recommendations", [])
        rewritten_resume = state.get("rewritten_resume")
        interview_questions = state.get("interview_questions")
        hiring_readiness = state.get("hiring_readiness")
        resume_text = state["resume_text"]
        job_description = state["job_description"]

        context = (
            f"ATS Score: {ats_score.overall_score if ats_score else 'N/A'}/100\n"
            f"Strengths: {strengths}\n"
            f"Weaknesses: {weaknesses}\n"
            f"Matched Skills: {matched_skills}\n"
            f"Missing Skills: {missing_skills}\n"
            f"Recommendations: {recommendations}\n"
            f"Resume Rewritten: {rewritten_resume is not None}\n"
            f"Interview Questions Generated: {interview_questions is not None}\n"
        )

        final_report = await ai_service.generate(
            system_prompt=CAREER_REPORT_SYSTEM_PROMPT,
            user_prompt=(
                f"{context}\n\n"
                f"Resume Text:\n{resume_text}\n\n"
                f"Job Description:\n{job_description}"
            ),
            response_model=FinalReport,
        )

        return {"final_report": final_report}

    return node
