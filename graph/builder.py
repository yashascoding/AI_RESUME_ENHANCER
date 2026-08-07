from __future__ import annotations

from typing import Any

from langgraph.graph import END, START, StateGraph

from graph.nodes import (
    ats_scoring_node,
    career_report_node,
    experience_analyzer_node,
    gap_analysis_node,
    interview_generator_node,
    jd_skill_extractor_node,
    resume_parser_node,
    resume_rewriter_node,
    skill_extractor_node,
)
from graph.router import route_after_ats
from graph.state import GraphState


def build_graph(ai_service: Any) -> StateGraph:
    """Build and compile the resume analysis LangGraph.

    Args:
        ai_service: Async AI service implementing
            ``generate(system_prompt, user_prompt, response_model) -> T``.

    Returns:
        Compiled StateGraph ready for ``ainvoke``.
    """
    graph = StateGraph(GraphState)

    # ------------------------------------------------------------------
    # Register nodes
    # ------------------------------------------------------------------
    graph.add_node("resume_parser", resume_parser_node(ai_service))
    graph.add_node("skill_extractor", skill_extractor_node(ai_service))
    graph.add_node("experience_analyzer", experience_analyzer_node(ai_service))
    graph.add_node("jd_skill_extractor", jd_skill_extractor_node(ai_service))
    graph.add_node("gap_analysis", gap_analysis_node(ai_service))
    graph.add_node("ats_scoring", ats_scoring_node(ai_service))
    graph.add_node("resume_rewriter", resume_rewriter_node(ai_service))
    graph.add_node("interview_generator", interview_generator_node(ai_service))
    graph.add_node("career_report", career_report_node(ai_service))

    # ------------------------------------------------------------------
    # Edges
    # ------------------------------------------------------------------

    # Start -> Resume Parser
    graph.add_edge(START, "resume_parser")

    # Resume Parser -> Parallel block
    # After parsing, fan out to skill extraction, experience analysis, and JD parsing
    graph.add_edge("resume_parser", "skill_extractor")
    graph.add_edge("resume_parser", "experience_analyzer")
    graph.add_edge("resume_parser", "jd_skill_extractor")

    # Parallel block -> Gap Analysis (all three must complete)
    graph.add_edge("skill_extractor", "gap_analysis")
    graph.add_edge("experience_analyzer", "gap_analysis")
    graph.add_edge("jd_skill_extractor", "gap_analysis")

    # Gap Analysis -> ATS Scoring
    graph.add_edge("gap_analysis", "ats_scoring")

    # ATS Scoring -> Conditional route
    graph.add_conditional_edges(
        "ats_scoring",
        route_after_ats,
        {
            "resume_rewriter": "resume_rewriter",
            "interview_generator": "interview_generator",
        },
    )

    # Resume Rewriter -> Interview Generator (both paths converge here)
    graph.add_edge("resume_rewriter", "interview_generator")

    # Interview Generator -> Career Report
    graph.add_edge("interview_generator", "career_report")

    # Career Report -> End
    graph.add_edge("career_report", END)

    return graph.compile()
