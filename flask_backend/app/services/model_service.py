from __future__ import annotations

import re
from dataclasses import dataclass
from time import perf_counter

from flask import current_app

from ..schemas import prediction_response


@dataclass
class ModelResult:
    verdict: str
    confidence: int
    explanation: str
    linguistic_patterns: str
    emotional_tone: str
    credibility_signals: str
    highlighted_phrases: list[str]
    signals: list[str]


def _stub_classify(article_text: str) -> ModelResult:
    sensational_terms = re.findall(r"\b(shocking|secret|urgent|miracle|exposed|guaranteed|overnight|share immediately)\b", article_text, flags=re.I)
    credibility_terms = re.findall(r"\b(study|researchers|university|journal|source|according to|data|report)\b", article_text, flags=re.I)
    fake_score = min(92, 52 + len(sensational_terms) * 7 - len(credibility_terms) * 3)
    verdict = "Fake" if fake_score >= 50 else "Real"
    confidence = fake_score if verdict == "Fake" else 100 - fake_score
    tone = "The text uses urgent or emotionally charged language." if sensational_terms else "The tone is comparatively restrained and informational."
    credibility = "The article contains limited attribution or source detail." if len(credibility_terms) < 2 else "The article includes several attribution or evidence-oriented signals."
    linguistic = "The wording contains attention-seeking claims, absolutes, or calls to immediate sharing." if sensational_terms else "The wording is comparatively measured and descriptive."
    signals = [f"sensational term: {term.lower()}" for term in sensational_terms[:4]] or ["measured phrasing"]
    return ModelResult(verdict, confidence, f"The {verdict.lower()} classification is based on patterns found in the submitted wording, not independent fact verification.", linguistic, tone, credibility, list(dict.fromkeys(sensational_terms[:5])), signals)


def classify_article(article_text: str) -> tuple[dict, int]:
    started = perf_counter()
    # Replace this branch with the trained LSTM/Bi-LSTM inference adapter.
    result = _stub_classify(article_text) if current_app.config["AI_PROVIDER"] == "stub" else _stub_classify(article_text)
    elapsed_ms = int((perf_counter() - started) * 1000)
    payload = prediction_response(result.verdict, result.confidence, elapsed_ms, result.explanation, result.linguistic_patterns, result.emotional_tone, result.credibility_signals, result.highlighted_phrases, result.signals)
    return payload, elapsed_ms
