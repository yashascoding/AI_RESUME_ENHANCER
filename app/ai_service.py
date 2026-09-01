from __future__ import annotations

import asyncio
import hashlib
import json
import logging
import os
import re
import time
from pathlib import Path
from typing import Any

from dotenv import load_dotenv
from groq import Groq, RateLimitError, APITimeoutError, APIConnectionError
from pydantic import BaseModel

load_dotenv(Path(__file__).resolve().parent.parent / ".env")

log = logging.getLogger("app.ai_service")


# ── Rate limiting ───────────────────────────────────────────────────────────
# Semaphore limits concurrent Groq requests (tune based on your tier)
_groq_semaphore = asyncio.Semaphore(3)

# In-memory cache: {cache_key: (result, timestamp)}
_cache: dict[str, tuple[Any, float]] = {}
CACHE_TTL = 3600  # 1 hour

# Groq allam-2-7b free tier limits
GROQ_TPM_LIMIT = 6000  # tokens per minute
GROQ_RPM_LIMIT = 30    # requests per minute (approximate)


def _cache_key(system_prompt: str, user_prompt: str, model_name: str) -> str:
    raw = f"{model_name}:{system_prompt}:{user_prompt}"
    return hashlib.sha256(raw.encode()).hexdigest()[:32]


def _is_token_limit_error(e: RateLimitError) -> bool:
    """Check if the error is a 413 / token-too-large error (won't resolve by retrying)."""
    err_str = str(e).lower()
    # Check error code in response body
    if hasattr(e, "response"):
        resp = e.response
        body = ""
        if hasattr(resp, "text"):
            body = resp.text.lower()
        elif hasattr(resp, "json"):
            try:
                body = json.dumps(resp.json()).lower()
            except Exception:
                pass
        if "rate_limit_exceeded" in body and "too large" in body:
            return True
        if '"code": "rate_limit_exceeded"' in body and "tpm" in body:
            return True
    # Fallback string checks
    if "request too large" in err_str:
        return True
    if "413" in err_str:
        return True
    return False


def _log_rate_headers(response: Any, attempt: int) -> None:
    """Log Groq rate-limit headers for monitoring."""
    if not hasattr(response, "headers"):
        return
    headers = response.headers
    remaining_tpm = headers.get("x-ratelimit-remaining-tokens", "?")
    limit_tpm = headers.get("x-ratelimit-limit-tokens", "?")
    remaining_rpm = headers.get("x-ratelimit-remaining-requests", "?")
    reset_tokens = headers.get("x-ratelimit-reset-tokens", "?")
    log.info(
        "Groq response attempt=%d | remaining_tpm=%s/%s remaining_rpm=%s reset_tokens=%s",
        attempt + 1, remaining_tpm, limit_tpm, remaining_rpm, reset_tokens,
    )


# ── JSON extraction helpers ─────────────────────────────────────────────────

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


def _fix_json_string(s: str) -> str:
    """Fix common JSON string issues from LLMs: unescaped quotes, newlines, backticks, etc."""
    # Remove control characters except \n, \t
    s = re.sub(r'[\x00-\x08\x0b\x0c\x0e-\x1f]', '', s)
    # Fix trailing commas before } or ]
    s = re.sub(r',\s*([}\]])', r'\1', s)
    # Replace backtick-wrapped strings with regular strings: `text` -> "text"
    s = re.sub(r'`([^`]*)`', r'"\1"', s)
    return s


def _fix_truncated_string_values(text: str) -> str:
    """Fix truncated JSON where string values are cut off mid-word.
    
    Examples:
        "skills": ["python", "java", "micr -> "skills": ["python", "java"]
        "name": "John Do -> "name": "John"
        "summary": "CS student with strong fo -> "summary": "CS student"
    """
    result = text
    
    # Pattern 1: Truncated array item - find last complete item
    # Match: ..., "last_complete_item"] or ..., last_complete_item]
    # before a cutoff like , "incomplete" or , incomplete
    result = re.sub(
        r',\s*"[^"]*$',   # truncated string at end like: , "micr
        ']',
        result
    )
    result = re.sub(
        r',\s*[a-zA-Z_][a-zA-Z0-9_]*$',  # truncated unquoted value at end
        ']',
        result
    )
    
    # Pattern 2: Truncated object value - find last complete key-value pair
    # Match: ..., "key": "value" or ..., "key": 123
    # before cutoff like: , "key": "incomplete
    result = re.sub(
        r',\s*"[^"]*"\s*:\s*"[^"]*$',  # truncated: , "key": "partial
        '',
        result
    )
    result = re.sub(
        r',\s*"[^"]*"\s*:\s*[0-9]+[.\d]*$',  # truncated: , "key": 123
        '',
        result
    )
    result = re.sub(
        r',\s*"[^"]*"\s*:\s*[a-zA-Z_][a-zA-Z0-9_]*$',  # truncated: , "key": true/false/null
        '',
        result
    )
    
    # Pattern 3: Truncated at start of a value
    # Match: "key": "value", "next_key": "trunca -> remove the truncated part
    result = re.sub(
        r',\s*"[^"]*"\s*:\s*"[^"]*$',  # last incomplete kv pair
        '',
        result
    )
    
    return result


def _extract_json(text: str) -> str | None:
    """Extract a JSON object from potentially noisy or truncated LLM output."""
    # Remove <think>...</think> blocks
    text = re.sub(r"<think>.*?</think>", "", text, flags=re.DOTALL).strip()
    # Remove markdown fences
    if text.startswith("```"):
        text = text.split("\n", 1)[1]
        if text.endswith("```"):
            text = text[: text.rfind("```")]
        text = text.strip()

    # Pre-process: replace backtick-wrapped values with proper JSON strings
    # Pattern: {"key": `value`} -> {"key": "value"}
    # Handle multi-line backtick strings
    if '`' in text:
        # Replace backticks with double quotes (simple approach)
        text = text.replace('`', '"')

    # Try direct parse first
    if text.startswith("{"):
        try:
            json.loads(text)
            return text
        except json.JSONDecodeError:
            pass
        # Try fixing common issues
        fixed = _fix_json_string(text)
        try:
            json.loads(fixed)
            return fixed
        except json.JSONDecodeError:
            pass

    # Find the outermost { ... } block
    first = text.find("{")
    last = text.rfind("}")
    if first != -1 and last != -1 and last > first:
        candidate = text[first : last + 1]
        try:
            json.loads(candidate)
            return candidate
        except json.JSONDecodeError:
            pass
        # Try fixing
        fixed = _fix_json_string(candidate)
        try:
            json.loads(fixed)
            return fixed
        except json.JSONDecodeError:
            pass

    # Depth-based extraction
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
                    # Try fixing
                    fixed = _fix_json_string(candidate)
                    try:
                        json.loads(fixed)
                        return fixed
                    except json.JSONDecodeError:
                        start = -1

    # Last resort: try to fix truncated JSON by closing open brackets
    if first != -1:
        truncated = text[first:]

        # Handle truncated strings: find last complete value before cutoff
        # e.g., "missing_skills": ["a", "b", "microse" -> close array at "b"
        fixed_truncated = _fix_truncated_string_values(truncated)
        if fixed_truncated != truncated:
            opens = fixed_truncated.count("{") - fixed_truncated.count("}")
            opens_arr = fixed_truncated.count("[") - fixed_truncated.count("]")
            attempt = _fix_json_string(fixed_truncated) + "]" * max(0, opens_arr) + "}" * max(0, opens)
            try:
                json.loads(attempt)
                log.info("Fixed truncated JSON with string recovery")
                return attempt
            except json.JSONDecodeError:
                pass

        # Count open brackets and close them
        opens = truncated.count("{") - truncated.count("}")
        opens_arr = truncated.count("[") - truncated.count("]")
        fixed = _fix_json_string(truncated) + "]" * max(0, opens_arr) + "}" * max(0, opens)
        try:
            json.loads(fixed)
            log.info("Fixed truncated JSON (added %d '}' and %d ']')", max(0, opens), max(0, opens_arr))
            return fixed
        except json.JSONDecodeError:
            pass

        # Try progressively shorter substrings to find valid JSON
        for end in range(len(truncated) - 1, first, -50):
            candidate = truncated[:end]
            # Close any open brackets
            o = candidate.count("{") - candidate.count("}")
            a = candidate.count("[") - candidate.count("]")
            attempt = _fix_json_string(candidate) + "]" * max(0, a) + "}" * max(0, o)
            try:
                json.loads(attempt)
                log.info("Found valid JSON by trimming to %d chars (from %d)", len(attempt), len(truncated))
                return attempt
            except json.JSONDecodeError:
                continue

    log.warning("All JSON extraction methods failed for response of %d chars", len(text))
    return None


def _coerce_list_item(item: Any, target_type: Any) -> Any:
    """Coerce a list item to the target type. Handles dicts→strings, etc."""
    if target_type is str:
        if isinstance(item, dict):
            # Extract the most meaningful value from the dict
            for key in ("achievement_title", "title", "name", "description", "value"):
                if key in item and item[key] and str(item[key]).lower() not in ("null", "none", ""):
                    return str(item[key])
            # Fallback: join all non-null values
            parts = [str(v) for v in item.values() if v and str(v).lower() not in ("null", "none", "")]
            return " - ".join(parts) if parts else str(item)
        if item is None:
            return ""
        return str(item)
    return item


def _sanitize_nulls(data: dict, model: type[BaseModel]) -> None:
    """Recursively convert null/missing/string-null values to safe defaults."""
    for name, field in model.model_fields.items():
        if name not in data:
            continue
        val = data[name]
        ann = str(field.annotation) if field.annotation else ""

        # Unwrap Optional[...] to get the inner type
        inner_model = None
        if hasattr(field.annotation, "model_fields"):
            inner_model = field.annotation
        elif hasattr(field.annotation, "__args__"):
            for arg in field.annotation.__args__:
                if arg is not type(None) and hasattr(arg, "model_fields"):
                    inner_model = arg
                    break

        # Handle None AND string "null"
        is_null = val is None or (isinstance(val, str) and val.strip().lower() in ("null", "none", ""))
        if is_null:
            if "list" in ann.lower():
                data[name] = []
            elif "str" in ann:
                data[name] = ""
            elif "float" in ann or "int" in ann:
                data[name] = 0.0
            elif inner_model:
                data[name] = {}
            continue

        # Recurse into nested models
        if isinstance(val, dict) and inner_model:
            _sanitize_nulls(val, inner_model)

        # Recurse into list items
        elif isinstance(val, list) and inner_model:
            for item in val:
                if isinstance(item, dict):
                    _sanitize_nulls(item, inner_model)

        # Coerce list[str] items — if LLM returns dicts instead of strings
        elif isinstance(val, list) and "list[str]" in ann.replace(" ", ""):
            data[name] = [_coerce_list_item(item, str) for item in val if item is not None]


class AIService:
    """Groq-based AI service with rate limiting, caching, and retry logic."""

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
        retries: int = 3,
        max_tokens: int = 4096,
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

        # ── Estimate token count (rough: 1 token ≈ 4 chars) ───────────
        est_input_tokens = (len(full_system) + len(user_prompt)) // 4
        if est_input_tokens > GROQ_TPM_LIMIT - 500:
            log.warning(
                "Estimated input tokens %d approaches limit %d. Model=%s",
                est_input_tokens, GROQ_TPM_LIMIT, self.model,
            )

        # ── Check cache ────────────────────────────────────────────────
        ck = _cache_key(full_system, user_prompt, self.model)
        now = time.time()
        if ck in _cache:
            cached_result, cached_time = _cache[ck]
            if now - cached_time < CACHE_TTL:
                log.info("Cache hit for %s (age=%.0fs)", model_key, now - cached_time)
                return cached_result
            else:
                del _cache[ck]

        # ── Call with semaphore + retry ────────────────────────────────
        last_error = None
        for attempt in range(retries):
            try:
                async with _groq_semaphore:
                    loop = asyncio.get_event_loop()
                    t0 = time.time()
                    response = await loop.run_in_executor(
                        None,
                        lambda: self.client.chat.completions.create(
                            model=self.model,
                            messages=[
                                {"role": "system", "content": full_system},
                                {"role": "user", "content": user_prompt},
                            ],
                            temperature=0.3,
                            max_tokens=max_tokens,
                        ),
                    )
                    latency_ms = (time.time() - t0) * 1000

                # Log rate-limit headers
                _log_rate_headers(response, attempt)
                log.info(
                    "Groq call OK: model=%s attempt=%d latency=%.0fms tokens_in=%s tokens_out=%s",
                    self.model, attempt + 1, latency_ms,
                    getattr(response.usage, "prompt_tokens", "?"),
                    getattr(response.usage, "completion_tokens", "?"),
                )

                raw = response.choices[0].message.content
                finish = getattr(response.choices[0], "finish_reason", "unknown")
                log.info(
                    "Groq raw response: length=%d finish_reason=%s first_100=%s",
                    len(raw) if raw else 0, finish, (raw[:100] if raw else "empty"),
                )
                if not raw:
                    raise ValueError("Empty response from LLM")

                json_str = _extract_json(raw)
                if json_str is None:
                    log.warning("No JSON found (attempt %d), response length=%d", attempt + 1, len(raw))
                    # On JSON extraction failure, retry with shorter input
                    if attempt < retries - 1:
                        # Shorten the user prompt for next attempt
                        shorter_prompt = user_prompt[:len(user_prompt)//2] + "\n\n[Response was truncated - please provide shorter, more concise output]"
                        user_prompt = shorter_prompt
                        log.info("Retrying with shorter input (%d chars)", len(user_prompt))
                        continue
                    raise ValueError(f"No JSON found in LLM response: {raw[:200]}")

                try:
                    parsed = json.loads(json_str)
                except json.JSONDecodeError as je:
                    log.error("JSON decode error: %s\nJSON string: %s", je, json_str[:500])
                    raise ValueError(f"Invalid JSON from LLM: {je}") from je
                _sanitize_nulls(parsed, response_model)
                result = response_model.model_validate(parsed)

                # ── Store in cache ─────────────────────────────────────
                _cache[ck] = (result, time.time())
                return result

            except RateLimitError as e:
                last_error = e
                # 413 / token-too-large: don't retry, fail immediately
                if _is_token_limit_error(e):
                    log.error(
                        "Token limit exceeded (model=%s, limit=%d TPM). Input too large.",
                        self.model, GROQ_TPM_LIMIT,
                    )
                    raise ValueError(
                        f"Your input is too long for the AI model ({self.model}). "
                        f"Please shorten your resume to under 1500 words and keep the job description under 500 words."
                    ) from e

                # 429 rate limit: respect retry-after header
                wait = min(30, 2 ** (attempt + 1))
                if hasattr(e, "response") and hasattr(e.response, "headers"):
                    ra = e.response.headers.get("retry-after")
                    if ra:
                        try:
                            wait = min(60, float(ra))
                        except ValueError:
                            pass
                log.warning("Rate limited (attempt %d/%d), waiting %.1fs...", attempt + 1, retries, wait)
                await asyncio.sleep(wait)

            except (APITimeoutError, APIConnectionError) as e:
                last_error = e
                wait = min(15, 2 ** attempt)
                log.warning("Connection/timeout error (attempt %d/%d), waiting %.1fs: %s", attempt + 1, retries, wait, e)
                await asyncio.sleep(wait)

            except ValueError:
                raise  # Re-raise validation/parse errors immediately

            except Exception as e:
                last_error = e
                log.warning("Attempt %d/%d failed: %s", attempt + 1, retries, e)
                if attempt < retries - 1:
                    await asyncio.sleep(min(5, 2 * attempt))

        raise RuntimeError(f"Failed after {retries} attempts: {last_error}")


ai_service = AIService()
