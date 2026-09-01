"""
Deterministic JD keyword extraction — no LLM required.
Reduces any-size job description to a compact set of ~30 relevant keywords.
"""

from __future__ import annotations

import re

# Common stop words (not useful for matching)
_STOP_WORDS = frozenset({
    "a", "an", "the", "and", "or", "but", "in", "on", "at", "to", "for",
    "of", "with", "by", "from", "as", "is", "was", "are", "were", "be",
    "been", "being", "have", "has", "had", "do", "does", "did", "will",
    "would", "could", "should", "may", "might", "can", "shall", "must",
    "not", "no", "nor", "so", "if", "then", "than", "that", "this",
    "these", "those", "it", "its", "we", "our", "you", "your", "they",
    "their", "he", "she", "his", "her", "i", "my", "me", "who", "which",
    "what", "where", "when", "how", "all", "each", "every", "both",
    "few", "more", "most", "other", "some", "such", "only", "own",
    "same", "too", "very", "just", "about", "above", "after", "again",
    "also", "am", "an", "any", "because", "before", "below", "between",
    "come", "day", "even", "find", "first", "get", "give", "go", "here",
    "high", "into", "know", "last", "let", "like", "long", "look",
    "make", "many", "may", "new", "now", "old", "one", "out", "over",
    "own", "part", "put", "run", "see", "still", "take", "tell",
    "thing", "think", "through", "under", "up", "us", "use", "way",
    "well", "work", "year", "years",
})

# Tech keywords to always keep (common in JDs)
_TECH_PATTERNS = re.compile(
    r"\b(python|java|javascript|typescript|react|node|angular|vue|django|flask|fastapi|"
    r"aws|azure|gcp|docker|kubernetes|k8s|linux|sql|nosql|mongodb|postgres|mysql|redis|"
    r"git|github|gitlab|ci[/-]cd|jenkins|terraform|ansible|"
    r"machine.learning|deep.learning|nlp|computer.vision|ai|ml|llm|"
    r"html|css|sass|tailwind|bootstrap|"
    r"rest|graphql|grpc|api|microservices|"
    r"agile|scrum|jira|confluence|"
    r"c\+\+|c#|go|rust|ruby|php|swift|kotlin|scala|r\b|matlab|"
    r"tensorflow|pytorch|keras|scikit|pandas|numpy|"
    r"spark|hadoop|kafka|airflow|dbt|"
    r"figma|sketch|adobe|photoshop|illustrator|"
    r"salesforce|hubspot|tableau|power.bi|excel)",
    re.IGNORECASE,
)


def extract_jd_keywords(job_description: str, max_keywords: int = 30) -> list[str]:
    """Extract key terms from a job description deterministically.

    Strategy:
    1. Find tech terms via regex (high priority)
    2. Find capitalized multi-word phrases (likely proper nouns / skill names)
    3. Find remaining meaningful words (filter stop words)
    4. Deduplicate and return top N by position (earlier = more important)
    """
    if not job_description or not job_description.strip():
        return []

    text_lower = job_description.lower()
    keywords: list[str] = []
    seen: set[str] = set()

    # 1. Extract tech terms
    for match in _TECH_PATTERNS.finditer(text_lower):
        term = match.group().strip().lower()
        if term not in seen and len(term) > 1:
            keywords.append(term)
            seen.add(term)

    # 2. Extract capitalized phrases (2-3 words, likely skill/role names)
    cap_phrases = re.findall(r"\b([A-Z][a-z]+(?:\s+[A-Z][a-z]+)+)\b", job_description)
    for phrase in cap_phrases:
        normalized = phrase.lower().strip()
        if normalized not in seen and not any(w in _STOP_WORDS for w in normalized.split()):
            keywords.append(normalized)
            seen.add(normalized)

    # 3. Extract single meaningful words
    words = re.findall(r"\b[a-zA-Z][a-zA-Z+#]{2,}\b", text_lower)
    for word in words:
        if word not in seen and word not in _STOP_WORDS and len(word) > 2:
            keywords.append(word)
            seen.add(word)

    # 4. Extract quoted or hyphenated terms
    quoted = re.findall(r'["\']([^"\']+)["\']', job_description)
    for q in quoted:
        normalized = q.lower().strip()
        if normalized not in seen and len(normalized) > 1:
            keywords.append(normalized)
            seen.add(normalized)

    # 5. Extract requirement phrases (must have, required, etc.)
    req_phrases = re.findall(
        r"(?:must|should|required|experience\s+(?:with|in)|proficiency\s+(?:in|with))\s+([a-zA-Z][a-zA-Z+#\s]{1,30})",
        text_lower,
    )
    for phrase in req_phrases:
        normalized = phrase.strip().rstrip(",.")
        if normalized not in seen and len(normalized) > 1:
            keywords.append(normalized)
            seen.add(normalized)

    return keywords[:max_keywords]


def compute_match_score(resume_skills: list[str], jd_keywords: list[str]) -> float:
    """Compute a 0-100 score for how many JD keywords appear in resume skills."""
    if not jd_keywords:
        return 70.0  # No JD = baseline score

    resume_lower = {s.lower().strip() for s in resume_skills if s}
    if not resume_lower:
        return 20.0  # No skills in resume = low score

    matched = 0
    for kw in jd_keywords:
        kw_lower = kw.lower().strip()
        # Exact match or substring match
        if any(kw_lower in skill or skill in kw_lower for skill in resume_lower):
            matched += 1

    return round((matched / len(jd_keywords)) * 100, 1)


def compute_keyword_coverage(resume_text: str, jd_keywords: list[str]) -> float:
    """Compute 0-100 score for how many JD keywords appear anywhere in resume text."""
    if not jd_keywords:
        return 70.0

    text_lower = resume_text.lower()
    found = sum(1 for kw in jd_keywords if kw.lower() in text_lower)
    return round((found / len(jd_keywords)) * 100, 1)
