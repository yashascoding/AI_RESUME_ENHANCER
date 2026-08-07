from __future__ import annotations

from typing import Any

from graph.prompts.interview_prompt import INTERVIEW_GENERATOR_SYSTEM_PROMPT
from graph.state import GraphState, InterviewQuestions


def interview_generator_node(ai_service: Any):
    """Create an interview generator node with injected AI service."""

    async def node(state: GraphState) -> dict:
        resume_text = state["resume_text"]
        job_description = state["job_description"]
        parsed_resume = state.get("parsed_resume")
        resume_skills = state.get("resume_skills")

        context_parts = []
        if parsed_resume:
            context_parts.append(
                f"Candidate: {parsed_resume.name}\n"
                f"Skills: {parsed_resume.skills}\n"
                f"Projects: {[p.name for p in parsed_resume.projects]}\n"
                f"Experience: {[e.title for e in parsed_resume.experience]}\n"
            )
        if resume_skills:
            context_parts.append(
                f"Technical Skills:\n"
                f"  Languages: {resume_skills.programming_languages}\n"
                f"  Frameworks: {resume_skills.frameworks}\n"
                f"  Tools: {resume_skills.developer_tools}\n"
            )

        context = "\n".join(context_parts)

        interview_questions = await ai_service.generate(
            system_prompt=INTERVIEW_GENERATOR_SYSTEM_PROMPT,
            user_prompt=(
                f"{context}\n\n"
                f"Resume Text:\n{resume_text}\n\n"
                f"Job Description:\n{job_description}"
            ),
            response_model=InterviewQuestions,
        )

        return {"interview_questions": interview_questions}

    return node
