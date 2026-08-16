from __future__ import annotations

from flask import Blueprint, current_app, jsonify, request
from flask_jwt_extended import get_jwt_identity

from ..auth import require_auth
from ..repositories.mongo_repository import delete_prediction, insert_prediction, list_predictions, prediction_stats
from ..schemas import ValidationError, require_json_object, require_non_empty_string
from ..services.model_service import classify_article

predictions_bp = Blueprint("predictions", __name__)


@predictions_bp.post("/analyze")
@require_auth
def analyze():
    try:
        payload = require_json_object(request.get_json(silent=True))
        article_text = require_non_empty_string(payload, "articleText", current_app.config["MAX_ARTICLE_CHARS"])
        if len(article_text) < 40:
            raise ValidationError("articleText must contain at least 40 characters.")
        result, _elapsed_ms = classify_article(article_text)
        prediction_id = insert_prediction(get_jwt_identity(), {"articleText": article_text, **result})
        return jsonify({"id": prediction_id, **result}), 201
    except ValidationError as error:
        return jsonify({"error": str(error)}), 400


@predictions_bp.get("")
@require_auth
def history():
    query = request.args.get("q", "", type=str)
    verdict = request.args.get("verdict", None, type=str)
    min_confidence = request.args.get("minConfidence", None, type=int)
    max_confidence = request.args.get("maxConfidence", None, type=int)
    sort = request.args.get("sort", "newest", type=str)
    records = list_predictions(get_jwt_identity(), query, verdict, min_confidence, max_confidence)
    if sort == "oldest":
        records.reverse()
    elif sort == "confidence":
        records.sort(key=lambda record: record.get("confidence", 0), reverse=True)
    return jsonify({"items": records})


@predictions_bp.get("/stats")
@require_auth
def stats():
    return jsonify(prediction_stats(get_jwt_identity()))


@predictions_bp.delete("/<prediction_id>")
@require_auth
def remove(prediction_id: str):
    if not delete_prediction(get_jwt_identity(), prediction_id):
        return jsonify({"error": "Prediction not found or not owned by the current user."}), 404
    return jsonify({"success": True})
