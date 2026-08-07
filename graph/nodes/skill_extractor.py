from __future__ import annotations

from typing import Any

from graph.prompts.skill_prompt import SKILL_EXTRACTOR_SYSTEM_PROMPT
from graph.state import GraphState, ResumeSkills


def skill_extractor_node(ai_service: Any):
    """Create a skill extractor node with injected AI service."""

    async def node(state: GraphState) -> dict:
        resume_text = state["resume_text"]
        parsed_resume = state.get("parsed_resume")

        context = ""
        if parsed_resume:
            context = (
                f"Parsed resume data:\n"
                f"Skills listed: {parsed_resume.skills}\n"
                f"Projects: {[p.name for p in parsed_resume.projects]}\n"
                f"Experience: {[e.title for e in parsed_resume.experience]}\n\n"
            )

        resume_skills = await ai_service.generate(
            system_prompt=SKILL_EXTRACTOR_SYSTEM_PROMPT,
            user_prompt=(
                f"{context}"
                f"Full resume text:\n\n{resume_text}"
            ),
            response_model=ResumeSkills,
        )

        return {"resume_skills": resume_skills}

    return node
