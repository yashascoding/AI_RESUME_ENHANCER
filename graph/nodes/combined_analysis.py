from __future__ import annotations

import logging
import time
from typing import Any

from app.jd_extractor import (
    extract_jd_keywords, compute_match_score, compute_keyword_coverage,
)
from graph.state import (
    GraphState, ParsedResume, ExperienceAnalysis,
    JDSkills, ATSScore, ATSBreakdown, ATSReason,
)

log = logging.getLogger("graph.combined_analysis")

_MAX_RESUME_CHARS = 2000


def _truncate(text: str, limit: int) -> str:
    if len(text) <= limit:
        return text
    return text[:limit] + "\n\n[truncated]"


# ── LLM Call #1: Parse resume ─────────────────────────────────────────────

_PARSE_SYSTEM = """Extract resume data as a JSON object. Return ONLY valid JSON.

{
  "name": "full name",
  "email": "email or null",
  "phone": "phone or null",
  "summary": "brief summary or null",
  "education": [{"degree":"", "institution":"", "year":""}],
  "projects": [{"name":"", "description":"", "technologies":[""]}],
  "skills": ["skill1", "skill2"],
  "experience": [{"title":"", "company":"", "duration":"", "highlights":[""]}],
  "achievements": [],
  "certifications": []
}

Rules: null for missing, [] for empty. Only what's in the resume."""


# ── LLM Call #2: Gap analysis only (no ATS scoring — that's deterministic) ─

_GAP_SYSTEM = """Compare the candidate's skills against the job keywords. Return ONLY valid JSON.

{
  "matched_skills": ["skill in both resume and JD"],
  "missing_skills": ["skill in JD but not resume"],
  "missing_keywords": ["keyword from JD not in resume"],
  "recommendations": ["actionable advice"],
  "strengths": ["candidate strength"],
  "weaknesses": ["candidate weakness"]
}

Rules:
- Be honest about gaps
- Only 3-5 items per list
- Return ONLY the JSON object"""


def _compute_ats_breakdown(
    resume_text: str,
    resume_skills: list[str],
    jd_keywords: list[str],
    education: list[Any],
    projects: list[Any],
    experience: list[Any],
    achievements: list[str],
) -> ATSBreakdown:
    """Compute ATS breakdown scores deterministically based on resume/JD match."""

    # Skills score: % of JD keywords matched in resume skills
    skills_score = compute_match_score(resume_skills, jd_keywords) if jd_keywords else 50.0

    # Keywords score: % of JD keywords found anywhere in resume text
    keywords_score = compute_keyword_coverage(resume_text, jd_keywords) if jd_keywords else 50.0

    # Experience score: based on number of experience entries and description length
    exp_count = len(experience) if experience else 0
    exp_details = sum(
        len(e.get("description", "") or "") + sum(len(h) for h in (e.get("highlights") or []))
        for e in (experience or []) if isinstance(e, dict)
    )
    experience_score = min(100.0, 30.0 + exp_count * 15.0 + min(exp_details / 50, 25.0))

    # Projects score: based on number of projects and detail
    proj_count = len(projects) if projects else 0
    proj_techs = sum(
        len(p.get("technologies", []) or [])
        for p in (projects or []) if isinstance(p, dict)
    )
    projects_score = min(100.0, 25.0 + proj_count * 20.0 + proj_techs * 5.0)

    # Achievements score: based on count and detail
    ach_count = len(achievements) if achievements else 0
    achievements_score = min(100.0, 30.0 + ach_count * 15.0)

    # Formatting score: heuristic checks
    fmt_score = 50.0
    if "@" in resume_text:
        fmt_score += 10.0
    if any(c.isdigit() for c in resume_text[:200]):
        fmt_score += 5.0
    sections = ["education", "experience", "skills", "projects", "summary"]
    fmt_score += sum(5.0 for s in sections if s.lower() in resume_text.lower())
    formatting_score = min(100.0, fmt_score)

    # Weighted overall
    overall = round(
        skills_score * 0.25
        + keywords_score * 0.20
        + experience_score * 0.20
        + projects_score * 0.15
        + achievements_score * 0.10
        + formatting_score * 0.10,
        1,
    )

    return ATSBreakdown(
        skills_score=round(skills_score, 1),
        keywords_score=round(keywords_score, 1),
        experience_score=round(experience_score, 1),
        projects_score=round(projects_score, 1),
        achievements_score=round(achievements_score, 1),
        formatting_score=round(formatting_score, 1),
    )


def combined_analysis_node(ai_service: Any):
    """Two LLM calls: (1) parse resume, (2) JD gap analysis.
    ATS scoring is computed deterministically (no LLM)."""

    async def node(state: GraphState) -> dict:
        raw_resume_len = len(state["resume_text"])
        raw_jd_len = len(state["job_description"])
        resume_text = _truncate(state["resume_text"], _MAX_RESUME_CHARS)
        job_description = state["job_description"]  # Don't truncate — we extract keywords

        log.info(
            "Combined analysis: resume %d->%d chars, jd %d chars",
            raw_resume_len, len(resume_text), raw_jd_len,
        )

        # ── Extract JD keywords deterministically (no LLM) ───────────
        jd_keywords = extract_jd_keywords(job_description)
        log.info("JD keywords extracted: %d keywords — %s", len(jd_keywords), jd_keywords[:5])

        # ── LLM Call #1: Parse resume ────────────────────────────────
        log.info("LLM Call #1: Parsing resume...")
        t1 = time.time()

        from pydantic import BaseModel, Field
        class SimpleResume(BaseModel):
            name: str = Field(default="")
            email: str | None = None
            phone: str | None = None
            summary: str | None = None
            education: list[Any] = Field(default_factory=list)
            projects: list[Any] = Field(default_factory=list)
            skills: list[Any] = Field(default_factory=list)
            experience: list[Any] = Field(default_factory=list)
            achievements: list[Any] = Field(default_factory=list)
            certifications: list[Any] = Field(default_factory=list)

        call1 = await ai_service.generate(
            system_prompt=_PARSE_SYSTEM,
            user_prompt=f"Resume:\n\n{resume_text}",
            response_model=SimpleResume,
        )
        log.info("LLM Call #1 done in %.1fs, skills=%s", time.time() - t1, call1.skills[:5])

        # ── LLM Call #2: Gap analysis (send JD keywords, not full JD) ──
        log.info("LLM Call #2: Gap analysis...")
        t2 = time.time()

        class GapResult(BaseModel):
            matched_skills: list[str] = Field(default_factory=list)
            missing_skills: list[str] = Field(default_factory=list)
            missing_keywords: list[str] = Field(default_factory=list)
            recommendations: list[str] = Field(default_factory=list)
            strengths: list[str] = Field(default_factory=list)
            weaknesses: list[str] = Field(default_factory=list)

        call2 = await ai_service.generate(
            system_prompt=_GAP_SYSTEM,
            user_prompt=(
                f"Candidate: {call1.name}\n"
                f"Skills: {call1.skills}\n"
                f"Experience: {[e.get('title','') if isinstance(e,dict) else '' for e in call1.experience]}\n"
                f"Projects: {[p.get('name','') if isinstance(p,dict) else '' for p in call1.projects]}\n\n"
                f"Job Keywords: {jd_keywords}"
            ),
            response_model=GapResult,
        )
        log.info("LLM Call #2 done in %.1fs", time.time() - t2)

        # ── Build response ────────────────────────────────────────────
        def _to_str_list(items: list[Any]) -> list[str]:
            """Convert a list of mixed items to list[str]."""
            result = []
            for item in items:
                if isinstance(item, str) and item.strip():
                    result.append(item.strip())
                elif isinstance(item, dict):
                    # Try common keys
                    for key in ("achievement_title", "title", "name", "description", "value", "text"):
                        if key in item and item[key] and str(item[key]).lower() not in ("null", "none", ""):
                            result.append(str(item[key]).strip())
                            break
                    else:
                        parts = [str(v) for v in item.values() if v and str(v).lower() not in ("null", "none", "")]
                        if parts:
                            result.append(" - ".join(parts))
                elif item is not None and str(item).strip().lower() not in ("null", "none", ""):
                    result.append(str(item).strip())
            return result

        parsed_resume = ParsedResume(
            name=call1.name if isinstance(call1.name, str) else str(call1.name),
            email=call1.email,
            phone=call1.phone,
            summary=call1.summary,
            skills=_to_str_list(call1.skills),
            achievements=_to_str_list(call1.achievements),
        )
        from graph.state import Education, Project, ExperienceEntry, Certifications
        for e in call1.education:
            if isinstance(e, dict):
                parsed_resume.education.append(Education(
                    degree=e.get("degree") or "",
                    institution=e.get("institution") or "",
                    year=e.get("year") or "",
                ))
            elif isinstance(e, str) and e:
                parsed_resume.education.append(Education(degree=e))
        for p in call1.projects:
            if isinstance(p, dict):
                parsed_resume.projects.append(Project(
                    name=p.get("name") or "",
                    description=p.get("description") or "",
                    technologies=p.get("technologies") or [],
                ))
            elif isinstance(p, str) and p:
                parsed_resume.projects.append(Project(name=p))
        for exp in call1.experience:
            if isinstance(exp, dict):
                parsed_resume.experience.append(ExperienceEntry(
                    title=exp.get("title") or "",
                    company=exp.get("company") or "",
                    duration=exp.get("duration") or "",
                    description=exp.get("description") or "",
                    highlights=exp.get("highlights") or [],
                ))
            elif isinstance(exp, str) and exp:
                parsed_resume.experience.append(ExperienceEntry(title=exp))
        for c in call1.certifications:
            if isinstance(c, dict):
                parsed_resume.certifications.append(Certifications(
                    name=c.get("name") or "",
                    issuer=c.get("issuer") or "",
                    year=c.get("year") or "",
                ))
            elif isinstance(c, str) and c:
                parsed_resume.certifications.append(Certifications(name=c))

        # ── Compute ATS scores deterministically ──────────────────────
        breakdown = _compute_ats_breakdown(
            resume_text=resume_text,
            resume_skills=call1.skills,
            jd_keywords=jd_keywords,
            education=call1.education,
            projects=call1.projects,
            experience=call1.experience,
            achievements=call1.achievements,
        )

        # Build reasons explaining each score
        reasons = []
        if jd_keywords:
            reasons.append(ATSReason(
                category="Skills Match",
                score=breakdown.skills_score,
                reason=f"{round(breakdown.skills_score)}% of required JD keywords found in resume skills",
            ))
            reasons.append(ATSReason(
                category="Keyword Match",
                score=breakdown.keywords_score,
                reason=f"{round(breakdown.keywords_score)}% of JD keywords found in resume text",
            ))
        reasons.append(ATSReason(
            category="Experience",
            score=breakdown.experience_score,
            reason=f"{len(call1.experience)} experience entries found",
        ))
        reasons.append(ATSReason(
            category="Projects",
            score=breakdown.projects_score,
            reason=f"{len(call1.projects)} projects found",
        ))
        reasons.append(ATSReason(
            category="Achievements",
            score=breakdown.achievements_score,
            reason=f"{len(call1.achievements)} achievements listed",
        ))

        ats_score = ATSScore(
            overall_score=breakdown.skills_score * 0.25
            + breakdown.keywords_score * 0.20
            + breakdown.experience_score * 0.20
            + breakdown.projects_score * 0.15
            + breakdown.achievements_score * 0.10
            + breakdown.formatting_score * 0.10,
            breakdown=breakdown,
            reasons=reasons,
        )

        jd_skills = JDSkills(required_skills=jd_keywords)

        return {
            "parsed_resume": parsed_resume,
            "resume_skills": None,
            "experience_analysis": None,
            "jd_skills": jd_skills,
            "matched_skills": call2.matched_skills,
            "missing_skills": call2.missing_skills,
            "missing_keywords": call2.missing_keywords,
            "recommendations": call2.recommendations,
            "strengths": call2.strengths,
            "weaknesses": call2.weaknesses,
            "ats_score": ats_score,
            "ats_breakdown": ats_score.breakdown,
        }

    return node
