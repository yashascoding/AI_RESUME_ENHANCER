from __future__ import annotations

import logging
import time
from typing import Any

from app.jd_extractor import extract_jd_keywords
from graph.state import GraphState, InterviewQuestion, InterviewQuestions

log = logging.getLogger("graph.interview_and_report")

_MAX_RESUME_CHARS = 2000


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "\n\n[truncated]"


def interview_and_report_node(ai_service: Any):
    """Generate interview questions and career report."""

    async def node(state: GraphState) -> dict:
        resume_text = _truncate(state["resume_text"], _MAX_RESUME_CHARS)
        job_description = state.get("job_description", "")
        parsed_resume = state.get("parsed_resume")
        matched = state.get("matched_skills", [])
        missing = state.get("missing_skills", [])

        # Extract JD keywords (deterministic, no LLM)
        jd_keywords = extract_jd_keywords(job_description)

        log.info("Interview + report started")
        start = time.time()

        from pydantic import BaseModel, Field

        class InterviewResult(BaseModel):
            questions: list[str] = Field(default_factory=list)
            strengths: list[str] = Field(default_factory=list)
            weaknesses: list[str] = Field(default_factory=list)
            recommendations: list[str] = Field(default_factory=list)
            summary: str = Field(default="")

        candidate_name = parsed_resume.name if parsed_resume else "the candidate"
        skills = parsed_resume.skills if parsed_resume else []

        result = await ai_service.generate(
            system_prompt=(
                "You are a career coach. Based on the candidate's resume and job keywords:\n"
                "1. Generate 14 interview questions (mix of technical, behavioral, and project-based)\n"
                "2. List 3 strengths\n"
                "3. List 3 weaknesses\n"
                "4. Give 3 actionable recommendations\n"
                "5. Write a 2-sentence overall summary\n\n"
                'Return JSON: {"questions":["q1","q2",...],"strengths":["s1",...],"weaknesses":["w1",...],"recommendations":["r1",...],"summary":"..."}\n'
                "Return ONLY the JSON object."
            ),
            user_prompt=(
                f"Candidate: {candidate_name}\n"
                f"Skills: {skills}\n"
                f"Matched with JD: {matched}\n"
                f"Missing for JD: {missing}\n"
                f"Job Keywords: {jd_keywords}\n\n"
                f"Resume:\n{resume_text}"
            ),
            response_model=InterviewResult,
        )

        elapsed = time.time() - start
        log.info("Interview + report done: %d questions, %.1fs", len(result.questions), elapsed)

        # Distribute questions into categories
        technical = []
        behavioral = []
        project = []
        for i, q in enumerate(result.questions):
            q_lower = q.lower()
            is_technical = any(kw in q_lower for kw in [
                "technical", "code", "algorithm", "system", "design", "implement",
                "debug", "test", "architecture", "database", "api", "stack",
                "framework", "language", "project", "experience with",
            ])
            is_project = any(kw in q_lower for kw in [
                "project", "built", "created", "developed", "implemented",
                "describe a time", "tell me about a project",
            ])
            iq = InterviewQuestion(
                question=q,
                category="technical" if is_technical else "behavioral",
                difficulty="medium",
                focus="technical skills" if is_technical else "soft skills",
            )
            if is_project:
                project.append(iq)
            elif is_technical:
                technical.append(iq)
            else:
                behavioral.append(iq)

        # Ensure all categories have at least some questions
        all_qs = technical + behavioral + project
        if not all_qs:
            all_qs = [InterviewQuestion(question=q, category="general", difficulty="medium", focus="general") for q in result.questions]

        # If a category is empty, fill from the largest category
        if not behavioral and technical:
            move = technical[len(technical) // 2:]
            technical = technical[:len(technical) // 2]
            behavioral = move
        elif not technical and behavioral:
            move = behavioral[len(behavioral) // 2:]
            behavioral = behavioral[:len(behavioral) // 2]
            technical = move

        if not project and len(all_qs) > 2:
            project = [all_qs[-1]]

        # If resume_questions is empty, put remaining there
        resume_qs = [] if technical or behavioral else all_qs

        interview_qs = InterviewQuestions(
            resume_questions=resume_qs,
            technical_questions=technical,
            behavioral_questions=behavioral,
            project_deep_dive=project,
        )

        return {
            "interview_questions": interview_qs,
            "hiring_readiness": None,
            "final_report": None,
            "recommendations": result.recommendations or state.get("recommendations", []),
            "strengths": result.strengths or state.get("strengths", []),
            "weaknesses": result.weaknesses or state.get("weaknesses", []),
        }

    return node
