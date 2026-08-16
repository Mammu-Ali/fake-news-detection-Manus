from __future__ import annotations

from datetime import datetime, timezone
from typing import Any

from bson import ObjectId

from .. import mongo


def utc_now() -> datetime:
    return datetime.now(timezone.utc)


def serialize_id(value: Any) -> str:
    return str(value)


def get_db():
    return mongo.cx[mongo.db.name]


def find_user_by_email(email: str) -> dict[str, Any] | None:
    return mongo.db.users.find_one({"email": email})


def create_user(email: str, name: str, password_hash: str, role: str = "user") -> str:
    result = mongo.db.users.insert_one({"email": email, "name": name, "passwordHash": password_hash, "role": role, "createdAt": utc_now(), "updatedAt": utc_now()})
    return serialize_id(result.inserted_id)


def insert_prediction(user_id: str, document: dict[str, Any]) -> str:
    record = {**document, "userId": user_id, "createdAt": utc_now()}
    result = mongo.db.predictions.insert_one(record)
    return serialize_id(result.inserted_id)


def list_predictions(user_id: str, query: str = "", verdict: str | None = None, min_confidence: int | None = None, max_confidence: int | None = None) -> list[dict[str, Any]]:
    criteria: dict[str, Any] = {"userId": user_id}
    if query:
        criteria["articleText"] = {"$regex": query, "$options": "i"}
    if verdict in {"Fake", "Real"}:
        criteria["verdict"] = verdict
    if min_confidence is not None or max_confidence is not None:
        criteria["confidence"] = {}
        if min_confidence is not None:
            criteria["confidence"]["$gte"] = min_confidence
        if max_confidence is not None:
            criteria["confidence"]["$lte"] = max_confidence
    records = list(mongo.db.predictions.find(criteria).sort("createdAt", -1))
    for record in records:
        record["id"] = serialize_id(record.pop("_id"))
    return records


def delete_prediction(user_id: str, prediction_id: str) -> bool:
    result = mongo.db.predictions.delete_one({"_id": ObjectId(prediction_id), "userId": user_id})
    return result.deleted_count == 1


def prediction_stats(user_id: str) -> dict[str, Any]:
    records = list(mongo.db.predictions.find({"userId": user_id}, {"verdict": 1}))
    total = len(records)
    fake = sum(1 for record in records if record.get("verdict") == "Fake")
    real = sum(1 for record in records if record.get("verdict") == "Real")
    return {"total": total, "fake": fake, "real": real, "fakePercentage": round(fake / total * 100) if total else 0, "realPercentage": round(real / total * 100) if total else 0}


def insert_dataset(document: dict[str, Any]) -> str:
    result = mongo.db.datasets.insert_one({**document, "createdAt": utc_now()})
    return serialize_id(result.inserted_id)


def list_datasets() -> list[dict[str, Any]]:
    records = list(mongo.db.datasets.find().sort("createdAt", -1))
    for record in records:
        record["id"] = serialize_id(record.pop("_id"))
    return records


def update_dataset_status(dataset_id: str, status: str) -> bool:
    result = mongo.db.datasets.update_one({"_id": ObjectId(dataset_id)}, {"$set": {"status": status, "updatedAt": utc_now()}})
    return result.modified_count == 1


def delete_dataset(dataset_id: str) -> bool:
    result = mongo.db.datasets.delete_one({"_id": ObjectId(dataset_id)})
    return result.deleted_count == 1


def insert_metric(document: dict[str, Any]) -> str:
    result = mongo.db.modelMetrics.insert_one({**document, "evaluatedAt": utc_now()})
    return serialize_id(result.inserted_id)


def list_metrics() -> list[dict[str, Any]]:
    records = list(mongo.db.modelMetrics.find().sort("evaluatedAt", -1))
    for record in records:
        record["id"] = serialize_id(record.pop("_id"))
    return records
