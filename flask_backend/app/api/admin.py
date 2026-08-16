from __future__ import annotations

import base64

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity

from ..auth import require_admin
from ..repositories.mongo_repository import delete_dataset, insert_dataset, insert_metric, list_datasets, list_metrics, update_dataset_status
from ..schemas import ValidationError, parse_non_negative_int, parse_percentage, require_json_object, require_non_empty_string

admin_bp = Blueprint("admin", __name__)


@admin_bp.get("/datasets")
@require_admin
def datasets():
    return jsonify({"items": list_datasets()})


@admin_bp.post("/datasets")
@require_admin
def create_dataset():
    try:
        payload = require_json_object(request.get_json(silent=True))
        name = require_non_empty_string(payload, "name", 180)
        description = str(payload.get("description", ""))[:2000]
        version = require_non_empty_string(payload, "version", 32)
        file_name = require_non_empty_string(payload, "fileName", 255)
        if not file_name.lower().endswith(".txt"):
            raise ValidationError("Only plain-text .txt datasets are supported.")
        file_content = payload.get("fileContentBase64")
        if not isinstance(file_content, str) or not file_content:
            raise ValidationError("fileContentBase64 is required.")
        try:
            file_bytes = base64.b64decode(file_content, validate=True)
        except ValueError as error:
            raise ValidationError("fileContentBase64 is invalid.") from error
        if len(file_bytes) > current_app.config["MAX_UPLOAD_BYTES"]:
            raise ValidationError("Dataset file is too large.")
        record = {"name": name, "description": description, "fileName": file_name, "version": version, "recordCount": parse_non_negative_int(payload, "recordCount"), "fakeCount": parse_non_negative_int(payload, "fakeCount"), "realCount": parse_non_negative_int(payload, "realCount"), "status": "ready", "uploadedBy": get_jwt_identity(), "storage": {"provider": "managed-storage", "fileSize": len(file_bytes)}}
        return jsonify({"id": insert_dataset(record), **record}), 201
    except ValidationError as error:
        return jsonify({"error": str(error)}), 400


@admin_bp.patch("/datasets/<dataset_id>/archive")
@require_admin
def archive_dataset(dataset_id: str):
    if not update_dataset_status(dataset_id, "archived"):
        return jsonify({"error": "Dataset not found."}), 404
    return jsonify({"success": True, "status": "archived"})


@admin_bp.delete("/datasets/<dataset_id>")
@require_admin
def remove_dataset(dataset_id: str):
    if not delete_dataset(dataset_id):
        return jsonify({"error": "Dataset not found."}), 404
    return jsonify({"success": True})


@admin_bp.get("/metrics")
@require_admin
def metrics():
    return jsonify({"items": list_metrics()})


@admin_bp.post("/metrics")
@require_admin
def create_metric():
    try:
        payload = require_json_object(request.get_json(silent=True))
        record = {"modelName": require_non_empty_string(payload, "modelName", 120), "datasetName": require_non_empty_string(payload, "datasetName", 180), "accuracy": parse_percentage(payload, "accuracy"), "precision": parse_percentage(payload, "precision"), "recall": parse_percentage(payload, "recall"), "f1Score": parse_percentage(payload, "f1Score"), "truePositive": parse_non_negative_int(payload, "truePositive"), "trueNegative": parse_non_negative_int(payload, "trueNegative"), "falsePositive": parse_non_negative_int(payload, "falsePositive"), "falseNegative": parse_non_negative_int(payload, "falseNegative"), "recordedBy": get_jwt_identity()}
        return jsonify({"id": insert_metric(record), **record}), 201
    except ValidationError as error:
        return jsonify({"error": str(error)}), 400
