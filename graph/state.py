from __future__ import annotations

from typing import Any, Optional
from typing_extensions import TypedDict

from pydantic import BaseModel, Field


# ---------------------------------------------------------------------------
# Structured output models used by individual nodes
# ---------------------------------------------------------------------------

class Education(BaseModel):
    degree: str = Field(default="", description="Degree or certification name")
    institution: str = Field(default="", description="School or institution name")
    year: Optional[str] = Field(default="", description="Graduation year or range")
    details: Optional[str] = Field(default="", description="Additional details like GPA, honors")


class Project(BaseModel):
    name: str = Field(default="", description="Project name")
    description: str = Field(default="", description="One-line project description")
    technologies: list[str] = Field(default_factory=list, description="Technologies used")
    highlights: list[str] = Field(default_factory=list, description="Key achievements or features")


class ExperienceEntry(BaseModel):
    title: str = Field(default="", description="Job title or role")
    company: str = Field(default="", description="Company or organization name")
    duration: Optional[str] = Field(None, description="Employment duration")
    description: str = Field(default="", description="Role description and responsibilities")
    highlights: list[str] = Field(default_factory=list, description="Key achievements")


class Certifications(BaseModel):
    name: str = Field(default="", description="Certification name")
    issuer: Optional[str] = Field(None, description="Issuing organization")
    year: Optional[str] = Field(None, description="Year obtained")


class ParsedResume(BaseModel):
    name: str = Field(default="", description="Candidate full name")
    email: Optional[str] = Field(None, description="Email address")
    phone: Optional[str] = Field(None, description="Phone number")
    summary: Optional[str] = Field(None, description="Professional summary or objective")
    education: list[Education] = Field(default_factory=list)
    projects: list[Project] = Field(default_factory=list)
    skills: list[str] = Field(default_factory=list, description="Flat list of skills mentioned")
    experience: list[ExperienceEntry] = Field(default_factory=list)
    achievements: list[str] = Field(default_factory=list)
    certifications: list[Certifications] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Skill extraction models
# ---------------------------------------------------------------------------

class ResumeSkills(BaseModel):
    programming_languages: list[str] = Field(default_factory=list)
    frameworks: list[str] = Field(default_factory=list)
    libraries: list[str] = Field(default_factory=list)
    databases: list[str] = Field(default_factory=list)
    cloud: list[str] = Field(default_factory=list)
    ai_tools: list[str] = Field(default_factory=list)
    developer_tools: list[str] = Field(default_factory=list)
    soft_skills: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Experience analysis models
# ---------------------------------------------------------------------------

class ExperienceAnalysis(BaseModel):
    project_quality: str = Field(default="", description="Assessment of project quality")
    internship_relevance: str = Field(default="", description="Relevance of internships")
    open_source: str = Field(default="", description="Open source contributions assessment")
    leadership: str = Field(default="", description="Leadership examples assessment")
    quantified_achievements: str = Field(default="", description="Use of metrics and numbers")
    action_verbs: str = Field(default="", description="Quality of action verbs used")
    business_impact: str = Field(default="", description="Business impact demonstrated")
    readability: str = Field(default="", description="Resume readability assessment")
    formatting: str = Field(default="", description="Formatting quality assessment")
    strengths: list[str] = Field(default_factory=list, description="Identified strengths")
    weaknesses: list[str] = Field(default_factory=list, description="Identified weaknesses")


# ---------------------------------------------------------------------------
# JD skill extraction models
# ---------------------------------------------------------------------------

class JDSkills(BaseModel):
    required_skills: list[str] = Field(default_factory=list)
    preferred_skills: list[str] = Field(default_factory=list)
    responsibilities: list[str] = Field(default_factory=list)
    experience_requirements: list[str] = Field(default_factory=list)
    ats_keywords: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Gap analysis models
# ---------------------------------------------------------------------------

class GapAnalysis(BaseModel):
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    missing_keywords: list[str] = Field(default_factory=list)
    technology_gaps: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# ATS scoring models
# ---------------------------------------------------------------------------

class ATSBreakdown(BaseModel):
    skills_score: float = Field(default=0.0, ge=0, le=100)
    projects_score: float = Field(default=0.0, ge=0, le=100)
    experience_score: float = Field(default=0.0, ge=0, le=100)
    keywords_score: float = Field(default=0.0, ge=0, le=100)
    achievements_score: float = Field(default=0.0, ge=0, le=100)
    formatting_score: float = Field(default=0.0, ge=0, le=100)


class ATSReason(BaseModel):
    category: str = Field(default="", description="Score category name")
    score: float = Field(default=0.0, ge=0, le=100)
    reason: str = Field(default="", description="Explanation for this score")


class ATSScore(BaseModel):
    overall_score: float = Field(default=0.0, ge=0, le=100)
    breakdown: Optional[ATSBreakdown] = None
    reasons: list[ATSReason] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Resume rewrite models
# ---------------------------------------------------------------------------

class RewrittenSection(BaseModel):
    section: str = Field(default="", description="Section name (e.g. summary, projects)")
    original: str = Field(default="", description="Original content")
    improved: str = Field(default="", description="Improved content")
    changes_made: str = Field(default="", description="What was changed and why")


class RewrittenResume(BaseModel):
    rewritten_sections: list[RewrittenSection] = Field(default_factory=list)
    full_improved_resume: str = Field(default="", description="Complete improved resume text")
    changes_summary: str = Field(default="", description="Summary of all changes made")


# ---------------------------------------------------------------------------
# Interview question models
# ---------------------------------------------------------------------------

class InterviewQuestion(BaseModel):
    question: str = Field(default="", description="The interview question")
    category: str = Field(default="", description="Question category")
    difficulty: str = Field(default="", description="easy, medium, or hard")
    focus: str = Field(default="", description="What this question assesses")


class InterviewQuestions(BaseModel):
    resume_questions: list[InterviewQuestion] = Field(default_factory=list)
    technical_questions: list[InterviewQuestion] = Field(default_factory=list)
    behavioral_questions: list[InterviewQuestion] = Field(default_factory=list)
    project_deep_dive: list[InterviewQuestion] = Field(default_factory=list)


# ---------------------------------------------------------------------------
# Hiring readiness models
# ---------------------------------------------------------------------------

class HiringReadiness(BaseModel):
    readiness_score: float = Field(default=0.0, ge=0, le=100)
    top_strengths: list[str] = Field(default_factory=list)
    top_weaknesses: list[str] = Field(default_factory=list)
    high_priority_improvements: list[str] = Field(default_factory=list)
    suggested_roles: list[str] = Field(default_factory=list)
    internship_readiness: str = Field(default="Not Ready", description="Ready / Almost Ready / Not Ready")
    sde1_readiness: str = Field(default="Not Ready", description="Ready / Almost Ready / Not Ready")


# ---------------------------------------------------------------------------
# Final report model
# ---------------------------------------------------------------------------

class FinalReport(BaseModel):
    ats_score: float = Field(default=0.0, ge=0, le=100)
    strengths: list[str] = Field(default_factory=list)
    weaknesses: list[str] = Field(default_factory=list)
    matched_skills: list[str] = Field(default_factory=list)
    missing_skills: list[str] = Field(default_factory=list)
    recommendations: list[str] = Field(default_factory=list)
    improved_resume: Optional[str] = Field(None, description="Improved resume text if rewritten")
    interview_questions: Optional[InterviewQuestions] = Field(None)
    hiring_readiness: Optional[HiringReadiness] = None
    overall_summary: str = Field(default="", description="Comprehensive summary of the analysis")


# ---------------------------------------------------------------------------
# Graph state
# ---------------------------------------------------------------------------

class GraphState(TypedDict, total=False):
    resume_text: str
    job_description: str

    parsed_resume: Optional[ParsedResume]
    resume_skills: Optional[ResumeSkills]
    experience_analysis: Optional[ExperienceAnalysis]
    jd_skills: Optional[JDSkills]

    strengths: list[str]
    weaknesses: list[str]

    matched_skills: list[str]
    missing_skills: list[str]
    missing_keywords: list[str]
    recommendations: list[str]

    ats_score: Optional[ATSScore]
    ats_breakdown: Optional[ATSBreakdown]

    rewritten_resume: Optional[RewrittenResume]
    interview_questions: Optional[InterviewQuestions]

    hiring_readiness: Optional[HiringReadiness]
    final_report: Optional[FinalReport]

    error: Optional[str]


# ---------------------------------------------------------------------------
# Combined models for optimized pipeline (fewer LLM calls)
# ---------------------------------------------------------------------------

class CombinedAnalysis(BaseModel):
    """Single LLM call: parse + skills + experience + JD + gap + ATS."""
    parsed_resume: Optional[ParsedResume] = None
    resume_skills: Optional[ResumeSkills] = None
    experience_analysis: Optional[ExperienceAnalysis] = None
    jd_skills: Optional[JDSkills] = None
    gap: Optional[GapAnalysis] = None
    ats_score: Optional[ATSScore] = None


class InterviewAndReport(BaseModel):
    """Single LLM call: interview questions + career report."""
    interview_questions: Optional[InterviewQuestions] = None
    hiring_readiness: Optional[HiringReadiness] = None
    final_report: Optional[FinalReport] = None
