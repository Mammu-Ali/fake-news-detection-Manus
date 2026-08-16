from __future__ import annotations

from dataclasses import dataclass, field
from datetime import datetime
from typing import Any


@dataclass(slots=True)
class User:
    email: str
    name: str
    password_hash: str
    role: str = "user"
    id: str | None = None
    created_at: datetime | None = None

    def to_document(self) -> dict[str, Any]:
        return {"email": self.email, "name": self.name, "passwordHash": self.password_hash, "role": self.role, "createdAt": self.created_at}


@dataclass(slots=True)
class Prediction:
    user_id: str
    article_text: str
    verdict: str
    confidence: int
    processing_time_ms: int
    explanation: str
    linguistic_patterns: str
    emotional_tone: str
    credibility_signals: str
    highlighted_phrases: list[str] = field(default_factory=list)
    signals: list[str] = field(default_factory=list)
    id: str | None = None

    def to_document(self) -> dict[str, Any]:
        return {"userId": self.user_id, "articleText": self.article_text, "verdict": self.verdict, "confidence": self.confidence, "processingTimeMs": self.processing_time_ms, "explanation": self.explanation, "linguisticPatterns": self.linguistic_patterns, "emotionalTone": self.emotional_tone, "credibilitySignals": self.credibility_signals, "highlightedPhrases": self.highlighted_phrases, "signals": self.signals}


@dataclass(slots=True)
class Dataset:
    name: str
    description: str
    file_name: str
    version: str
    record_count: int
    fake_count: int
    real_count: int
    uploaded_by: str
    status: str = "ready"
    id: str | None = None

    def to_document(self) -> dict[str, Any]:
        return {"name": self.name, "description": self.description, "fileName": self.file_name, "version": self.version, "recordCount": self.record_count, "fakeCount": self.fake_count, "realCount": self.real_count, "uploadedBy": self.uploaded_by, "status": self.status}


@dataclass(slots=True)
class ModelMetric:
    model_name: str
    dataset_name: str
    accuracy: int
    precision: int
    recall: int
    f1_score: int
    true_positive: int
    true_negative: int
    false_positive: int
    false_negative: int
    recorded_by: str
    id: str | None = None

    def to_document(self) -> dict[str, Any]:
        return {"modelName": self.model_name, "datasetName": self.dataset_name, "accuracy": self.accuracy, "precision": self.precision, "recall": self.recall, "f1Score": self.f1_score, "truePositive": self.true_positive, "trueNegative": self.true_negative, "falsePositive": self.false_positive, "falseNegative": self.false_negative, "recordedBy": self.recorded_by}
