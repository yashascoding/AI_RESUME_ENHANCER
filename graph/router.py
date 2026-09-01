from __future__ import annotations

import logging

from graph.state import GraphState

log = logging.getLogger("graph.router")


def route_after_ats(state: GraphState) -> str:
    """Always route to interview_and_report (skip rewriter for reliability)."""
    ats_score = state.get("ats_score")
    score = ats_score.overall_score if ats_score else 0
    log.info("ATS score %.0f, routing to interview_and_report", score)
    return "interview_and_report"
