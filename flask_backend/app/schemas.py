from __future__ import annotations

from typing import Any


class ValidationError(ValueError):
    pass


def require_json_object(payload: Any) -> dict[str, Any]:
    if not isinstance(payload, dict):
        raise ValidationError("JSON body must be an object.")
    return payload


def require_non_empty_string(payload: dict[str, Any], key: str, max_length: int = 500) -> str:
    value = payload.get(key)
    if not isinstance(value, str) or not value.strip():
        raise ValidationError(f"{key} is required.")
    value = value.strip()
    if len(value) > max_length:
        raise ValidationError(f"{key} exceeds the maximum length.")
    return value


def parse_percentage(payload: dict[str, Any], key: str) -> int:
    value = payload.get(key)
    if isinstance(value, bool) or not isinstance(value, (int, float)) or not 0 <= value <= 100:
        raise ValidationError(f"{key} must be between 0 and 100.")
    return int(value)


def parse_non_negative_int(payload: dict[str, Any], key: str) -> int:
    value = payload.get(key)
    if isinstance(value, bool) or not isinstance(value, int) or value < 0:
        raise ValidationError(f"{key} must be a non-negative integer.")
    return value


def prediction_response(verdict: str, confidence: int, processing_time_ms: int, explanation: str, linguistic_patterns: str, emotional_tone: str, credibility_signals: str, highlighted_phrases: list[str], signals: list[str]) -> dict[str, Any]:
    return {
        "verdict": verdict,
        "confidence": max(1, min(99, int(confidence))),
        "processingTimeMs": processing_time_ms,
        "explanation": explanation,
        "linguisticPatterns": linguistic_patterns,
        "emotionalTone": emotional_tone,
        "credibilitySignals": credibility_signals,
        "highlightedPhrases": highlighted_phrases,
        "signals": signals,
    }
