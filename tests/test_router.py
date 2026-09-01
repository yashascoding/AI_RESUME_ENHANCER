"""Tests for the LangGraph router logic."""
import pytest
from graph.router import route_after_ats
from graph.state import ATSScore, ATSBreakdown, ATSReason


def _make_ats(score: float) -> ATSScore:
    return ATSScore(
        overall_score=score,
        breakdown=ATSBreakdown(
            skills_score=score, projects_score=score, experience_score=score,
            keywords_score=score, achievements_score=score, formatting_score=score,
        ),
        reasons=[],
    )


def test_route_always_goes_to_interview():
    state = {"ats_score": _make_ats(60)}
    assert route_after_ats(state) == "interview_and_report"


def test_route_high_score_goes_to_interview():
    state = {"ats_score": _make_ats(85)}
    assert route_after_ats(state) == "interview_and_report"


def test_route_no_score_goes_to_interview():
    state = {}
    assert route_after_ats(state) == "interview_and_report"
