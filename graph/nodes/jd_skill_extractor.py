from __future__ import annotations

from typing import Any

from graph.prompts.jd_prompt import JD_SKILL_EXTRACTOR_SYSTEM_PROMPT
from graph.state import GraphState, JDSkills


def jd_skill_extractor_node(ai_service: Any):
    """Create a JD skill extractor node with injected AI service."""

    async def node(state: GraphState) -> dict:
        job_description = state["job_description"]

        jd_skills = await ai_service.generate(
            system_prompt=JD_SKILL_EXTRACTOR_SYSTEM_PROMPT,
            user_prompt=f"Analyze the following job description:\n\n{job_description}",
            response_model=JDSkills,
        )

        return {"jd_skills": jd_skills}

    return node
