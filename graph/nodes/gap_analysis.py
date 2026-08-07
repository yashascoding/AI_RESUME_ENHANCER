from __future__ import annotations

from typing import Any

from graph.prompts.gap_prompt import GAP_ANALYSIS_SYSTEM_PROMPT
from graph.state import GraphState, GapAnalysis


def gap_analysis_node(ai_service: Any):
    """Create a gap analysis node with injected AI service."""

    async def node(state: GraphState) -> dict:
        resume_skills = state.get("resume_skills")
        jd_skills = state.get("jd_skills")
        resume_text = state["resume_text"]
        job_description = state["job_description"]

        resume_skills_context = ""
        if resume_skills:
            resume_skills_context = (
                f"Resume Skills:\n"
                f"  Languages: {resume_skills.programming_languages}\n"
                f"  Frameworks: {resume_skills.frameworks}\n"
                f"  Libraries: {resume_skills.libraries}\n"
                f"  Databases: {resume_skills.databases}\n"
                f"  Cloud: {resume_skills.cloud}\n"
                f"  AI Tools: {resume_skills.ai_tools}\n"
                f"  Dev Tools: {resume_skills.developer_tools}\n"
                f"  Soft Skills: {resume_skills.soft_skills}\n"
            )

        jd_skills_context = ""
        if jd_skills:
            jd_skills_context = (
                f"Job Description Skills:\n"
                f"  Required: {jd_skills.required_skills}\n"
                f"  Preferred: {jd_skills.preferred_skills}\n"
                f"  ATS Keywords: {jd_skills.ats_keywords}\n"
            )

        gap = await ai_service.generate(
            system_prompt=GAP_ANALYSIS_SYSTEM_PROMPT,
            user_prompt=(
                f"{resume_skills_context}\n"
                f"{jd_skills_context}\n"
                f"Resume Text:\n{resume_text}\n\n"
                f"Job Description:\n{job_description}"
            ),
            response_model=GapAnalysis,
        )

        return {
            "matched_skills": gap.matched_skills,
            "missing_skills": gap.missing_skills,
            "missing_keywords": gap.missing_keywords,
            "recommendations": gap.recommendations,
        }

    return node
