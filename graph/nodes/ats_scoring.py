from __future__ import annotations

from typing import Any

from graph.prompts.ats_prompt import ATS_SCORING_SYSTEM_PROMPT
from graph.state import ATSScore, GraphState


def ats_scoring_node(ai_service: Any):
    """Create an ATS scoring node with injected AI service."""

    async def node(state: GraphState) -> dict:
        resume_text = state["resume_text"]
        job_description = state["job_description"]
        parsed_resume = state.get("parsed_resume")
        resume_skills = state.get("resume_skills")
        jd_skills = state.get("jd_skills")
        matched_skills = state.get("matched_skills", [])
        missing_skills = state.get("missing_skills", [])

        context_parts = []
        if parsed_resume:
            context_parts.append(
                f"Parsed Resume:\n"
                f"  Name: {parsed_resume.name}\n"
                f"  Skills: {parsed_resume.skills}\n"
                f"  Projects: {[p.name for p in parsed_resume.projects]}\n"
                f"  Experience: {[e.title for e in parsed_resume.experience]}\n"
                f"  Achievements: {parsed_resume.achievements}\n"
            )
        if resume_skills:
            context_parts.append(
                f"Resume Skills:\n"
                f"  Languages: {resume_skills.programming_languages}\n"
                f"  Frameworks: {resume_skills.frameworks}\n"
            )
        if jd_skills:
            context_parts.append(
                f"JD Requirements:\n"
                f"  Required: {jd_skills.required_skills}\n"
                f"  Preferred: {jd_skills.preferred_skills}\n"
                f"  Keywords: {jd_skills.ats_keywords}\n"
            )

        context = "\n".join(context_parts)

        ats_score = await ai_service.generate(
            system_prompt=ATS_SCORING_SYSTEM_PROMPT,
            user_prompt=(
                f"{context}\n"
                f"Matched Skills: {matched_skills}\n"
                f"Missing Skills: {missing_skills}\n\n"
                f"Resume Text:\n{resume_text}\n\n"
                f"Job Description:\n{job_description}"
            ),
            response_model=ATSScore,
        )

        return {
            "ats_score": ats_score,
            "ats_breakdown": ats_score.breakdown,
        }

    return node
