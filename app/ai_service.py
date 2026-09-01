from __future__ import annotations

import json
import logging
import os
import re
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from groq import Groq, RateLimitError
from pydantic import BaseModel

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

log = logging.getLogger(__name__)


def _compact_schema(model: type[BaseModel]) -> str:
    """Generate a compact field description from a Pydantic model."""
    lines = []
    for name, field in model.model_fields.items():
        ann = field.annotation
        result = _describe_type(ann)
        suffix = ""
        if result.startswith("OPT:"):
            result = result[4:]
            suffix = " (optional)"
        lines.append(f"  {name}: {result}{suffix}")
    return "\n".join(lines)


def _describe_type(ann: Any) -> str:
    raw = str(ann)
    clean = raw.replace("typing.", "").replace("typing_extensions.", "")

    if clean.startswith("Optional["):
        inner = clean[9:-1]
        return f"OPT:{_describe_type_str(inner)}"

    if "None |" in clean or "| None" in clean:
        parts = [p.strip() for p in clean.split("|") if p.strip() != "None"]
        if parts:
            return f"OPT:{_describe_type_str(parts[0])}"

    return _describe_type_str(clean)


def _describe_type_str(t: str) -> str:
    t = t.strip()
    t = t.replace("<class '", "").replace("'>", "")
    t = t.replace("typing.", "").replace("typing_extensions.", "")

    if t.startswith("list["):
        inner = t[5:-1]
        model = _resolve_model(inner)
        if model:
            return f"list[{{{_nested_fields(model)}}}]"
        return f"list[{inner}]"
    if t.startswith("List["):
        inner = t[5:-1]
        model = _resolve_model(inner)
        if model:
            return f"list[{{{_nested_fields(model)}}}]"
        return f"list[{inner}]"

    model = _resolve_model(t)
    if model:
        return f"{{{_nested_fields(model)}}}"

    return t


def _resolve_model(name: str) -> type[BaseModel] | None:
    from graph import state
    cls = getattr(state, name, None)
    if cls and isinstance(cls, type) and issubclass(cls, BaseModel):
        return cls
    short = name.rsplit(".", 1)[-1] if "." in name else name
    cls = getattr(state, short, None)
    if cls and isinstance(cls, type) and issubclass(cls, BaseModel):
        return cls
    return None


def _nested_fields(model: type[BaseModel]) -> str:
    parts = []
    for n, f in model.model_fields.items():
        desc = _describe_type(f.annotation)
        suffix = ""
        if desc.startswith("OPT:"):
            desc = desc[4:]
            suffix = "(opt)"
        parts.append(f"{n}:{desc}{suffix}")
    return ", ".join(parts)


def _extract_json(text: str) -> str | None:
    """Extract a JSON object from potentially noisy LLM output."""
    # Strip thinking tags
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()

    # Strip markdown fences
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[: text.rfind("```")]
        text = text.strip()

    # If it starts with { try directly
    if text.startswith("{"):
        # Try parsing directly first
        try:
            json.loads(text)
            return text
        except json.JSONDecodeError:
            pass

    # Find first { and last }
    first = text.find("{")
    last = text.rfind("}")
    if first != -1 and last != -1 and last > first:
        candidate = text[first : last + 1]
        try:
            json.loads(candidate)
            return candidate
        except json.JSONDecodeError:
            pass

    # Try to find any {...} block by counting braces
    depth = 0
    start = -1
    for i, ch in enumerate(text):
        if ch == "{":
            if depth == 0:
                start = i
            depth += 1
        elif ch == "}":
            depth -= 1
            if depth == 0 and start != -1:
                candidate = text[start : i + 1]
                try:
                    json.loads(candidate)
                    return candidate
                except json.JSONDecodeError:
                    start = -1

    return None


def _sanitize_nulls(data: dict, model: type[BaseModel]) -> None:
    """Convert null values to [] for list fields and null to '' for str fields."""
    for name, field in model.model_fields.items():
        if name not in data:
            continue
        ann = str(field.annotation) if field.annotation else ""
        if data[name] is None:
            if "list" in ann.lower():
                data[name] = []
            elif "str" in ann:
                data[name] = ""
        elif isinstance(data[name], dict) and hasattr(field.annotation, "model_fields"):
            _sanitize_nulls(data[name], field.annotation)


class AIService:
    """Groq-based AI service implementing the interface expected by LangGraph nodes."""

    def __init__(self) -> None:
        self._client = None
        self.model = "allam-2-7b"
        self._schema_cache: dict[str, str] = {}

    @property
    def client(self):
        if self._client is None:
            api_key = os.environ.get("GROQ_API_KEY", "")
            if not api_key:
                raise ValueError("GROQ_API_KEY not set. Check your .env file.")
            self._client = Groq(api_key=api_key)
        return self._client

    async def generate(
        self,
        system_prompt: str,
        user_prompt: str,
        response_model: type[BaseModel],
        retries: int = 5,
    ) -> BaseModel:
        model_key = response_model.__name__
        if model_key not in self._schema_cache:
            self._schema_cache[model_key] = _compact_schema(response_model)

        compact = self._schema_cache[model_key]

        full_system = (
            f"{system_prompt}\n\n"
            f"Respond with a SINGLE JSON object using these fields:\n"
            f"{compact}\n\n"
            f"Rules:\n"
            f"- Return ONLY the raw JSON object\n"
            f"- No markdown fences, no extra text, no thinking\n"
            f"- Use null for missing optional fields\n"
            f"- Use [] for empty arrays\n"
        )

        last_error = None
        for attempt in range(retries):
            try:
                response = self.client.chat.completions.create(
                    model=self.model,
                    messages=[
                        {"role": "system", "content": full_system},
                        {"role": "user", "content": user_prompt},
                    ],
                    temperature=0.3,
                    max_tokens=4096,
                )

                raw = response.choices[0].message.content
                log.debug("LLM raw response (attempt %d): %s", attempt + 1, raw[:500])

                if not raw:
                    raise ValueError("Empty response from LLM")

                json_str = _extract_json(raw)
                if json_str is None:
                    log.warning("Could not extract JSON from response: %s", raw[:200])
                    raise ValueError(f"No JSON found in LLM response: {raw[:200]}")

                parsed = json.loads(json_str)
                _sanitize_nulls(parsed, response_model)
                return response_model.model_validate(parsed)

            except RateLimitError as e:
                last_error = e
                wait = 30 * (attempt + 1)
                log.warning("Rate limited (attempt %d/%d), waiting %ds...", attempt + 1, retries, wait)
                time.sleep(wait)
            except Exception as e:
                last_error = e
                log.warning("Attempt %d/%d failed: %s", attempt + 1, retries, e)
                if attempt < retries - 1:
                    time.sleep(2 * (attempt + 1))

        raise RuntimeError(f"Failed after {retries} attempts: {last_error}")


ai_service = AIService()
