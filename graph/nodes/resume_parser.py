from __future__ import annotations

from typing import TYPE_CHECKING, Any

from graph.prompts.parser_prompt import RESUME_PARSER_SYSTEM_PROMPT
from graph.state import GraphState, ParsedResume

if TYPE_CHECKING:
    pass


def resume_parser_node(ai_service: Any):
    """Create a resume parser node with injected AI service."""

    async def node(state: GraphState) -> dict:
        resume_text = state["resume_text"]

        parsed_resume = await ai_service.generate(
            system_prompt=RESUME_PARSER_SYSTEM_PROMPT,
            user_prompt=f"Parse the following resume:\n\n{resume_text}",
            response_model=ParsedResume,
        )

        return {"parsed_resume": parsed_resume}

    return node
