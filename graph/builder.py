from __future__ import annotations

from typing import Any

from langgraph.graph import END, START, StateGraph

from graph.nodes.combined_analysis import combined_analysis_node
from graph.nodes.resume_rewriter import resume_rewriter_node
from graph.nodes.interview_and_report import interview_and_report_node
from graph.router import route_after_ats
from graph.state import GraphState


def build_graph(ai_service: Any) -> StateGraph:
    """Build optimized resume analysis LangGraph.

    Reduces LLM calls from 7-9 to 2-3:
      LLM Call #1: Combined analysis (parse + skills + experience + JD + gap + ATS)
      LLM Call #2: Resume rewrite (conditional, only if ATS < 75)
      LLM Call #3: Interview questions + career report

    Args:
        ai_service: Async AI service implementing
            ``generate(system_prompt, user_prompt, response_model) -> T``.

    Returns:
        Compiled StateGraph ready for ``ainvoke``.
    """
    graph = StateGraph(GraphState)

    # ------------------------------------------------------------------
    # Register nodes (3 nodes instead of 9)
    # ------------------------------------------------------------------
    graph.add_node("combined_analysis", combined_analysis_node(ai_service))
    graph.add_node("resume_rewriter", resume_rewriter_node(ai_service))
    graph.add_node("interview_and_report", interview_and_report_node(ai_service))

    # ------------------------------------------------------------------
    # Edges
    # ------------------------------------------------------------------

    # Start -> Combined Analysis (single LLM call for everything)
    graph.add_edge(START, "combined_analysis")

    # Combined Analysis -> Conditional route
    graph.add_conditional_edges(
        "combined_analysis",
        route_after_ats,
        {
            "resume_rewriter": "resume_rewriter",
            "interview_and_report": "interview_and_report",
        },
    )

    # Resume Rewriter -> Interview + Report
    graph.add_edge("resume_rewriter", "interview_and_report")

    # Interview + Report -> End
    graph.add_edge("interview_and_report", END)

    return graph.compile()
