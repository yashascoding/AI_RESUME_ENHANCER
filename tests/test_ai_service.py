"""Tests for the AI service utilities (no API key needed)."""
import pytest
from app.ai_service import (
    _extract_json,
    _compact_schema,
    _sanitize_nulls,
    _cache_key,
)
from graph.state import ParsedResume, ATSScore


class TestExtractJson:
    def test_clean_json(self):
        text = '{"name": "John", "age": 30}'
        assert _extract_json(text) == '{"name": "John", "age": 30}'

    def test_json_in_markdown(self):
        text = '```json\n{"name": "John"}\n```'
        result = _extract_json(text)
        assert result is not None
        assert '"name"' in result

    def test_json_with_prefix(self):
        text = 'Here is the result: {"name": "John"}'
        result = _extract_json(text)
        assert result is not None
        assert '"name"' in result

    def test_no_json(self):
        text = "This is just plain text with no JSON"
        assert _extract_json(text) is None

    def test_nested_json(self):
        text = '{"a": {"b": 1}, "c": [1, 2]}'
        result = _extract_json(text)
        assert result is not None


class TestCompactSchema:
    def test_parsed_resume_schema(self):
        schema = _compact_schema(ParsedResume)
        assert "name" in schema
        assert "email" in schema
        assert "education" in schema

    def test_ats_score_schema(self):
        schema = _compact_schema(ATSScore)
        assert "overall_score" in schema
        assert "breakdown" in schema


class TestSanitizeNulls:
    def test_null_list_becomes_empty(self):
        data = {"skills": None, "name": "John"}
        _sanitize_nulls(data, ParsedResume)
        assert data["skills"] == []

    def test_none_name_becomes_string(self):
        data = {"name": None, "skills": []}
        _sanitize_nulls(data, ParsedResume)
        assert data["name"] == ""


class TestCacheKey:
    def test_same_input_same_key(self):
        k1 = _cache_key("sys", "user", "model")
        k2 = _cache_key("sys", "user", "model")
        assert k1 == k2

    def test_different_input_different_key(self):
        k1 = _cache_key("sys1", "user", "model")
        k2 = _cache_key("sys2", "user", "model")
        assert k1 != k2
