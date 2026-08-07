from __future__ import annotations

from graph.state import GraphState


def route_after_ats(state: GraphState) -> str:
    """Route based on ATS score threshold.

    If ATS score < 75, go to resume rewrite.
    Otherwise, go to interview generation.
    """
    ats_score = state.get("ats_score")

    if ats_score is None:
        return "interview_generator"

    if ats_score.overall_score < 75:
        return "resume_rewriter"

    return "interview_generator"
