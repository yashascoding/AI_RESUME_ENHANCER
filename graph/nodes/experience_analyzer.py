from __future__ import annotations

from typing import Any

from graph.prompts.experience_prompt import EXPERIENCE_ANALYZER_SYSTEM_PROMPT
from graph.state import GraphState, ExperienceAnalysis


def experience_analyzer_node(ai_service: Any):
    """Create an experience analyzer node with injected AI service."""

    async def node(state: GraphState) -> dict:
        resume_text = state["resume_text"]
        parsed_resume = state.get("parsed_resume")

        context = ""
        if parsed_resume:
            context = (
                f"Parsed resume data:\n"
                f"Education: {[e.degree for e in parsed_resume.education]}\n"
                f"Projects: {[p.name for p in parsed_resume.projects]}\n"
                f"Experience: {[e.title for e in parsed_resume.experience]}\n"
                f"Achievements: {parsed_resume.achievements}\n\n"
            )

        analysis = await ai_service.generate(
            system_prompt=EXPERIENCE_ANALYZER_SYSTEM_PROMPT,
            user_prompt=(
                f"{context}"
                f"Full resume text:\n\n{resume_text}"
            ),
            response_model=ExperienceAnalysis,
        )

        return {
            "experience_analysis": analysis,
            "strengths": analysis.strengths,
            "weaknesses": analysis.weaknesses,
        }

    return node
