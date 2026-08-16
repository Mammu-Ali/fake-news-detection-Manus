from __future__ import annotations

from flask import Blueprint, jsonify, request
from flask_jwt_extended import create_access_token, get_jwt_identity
from werkzeug.security import check_password_hash, generate_password_hash

from .. import mongo
from ..auth import require_auth
from ..repositories.mongo_repository import create_user, find_user_by_email
from ..schemas import ValidationError, require_json_object, require_non_empty_string

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/register")
def register():
    try:
        payload = require_json_object(request.get_json(silent=True))
        email = require_non_empty_string(payload, "email", 320).lower()
        name = require_non_empty_string(payload, "name", 120)
        password = require_non_empty_string(payload, "password", 200)
        if len(password) < 8:
            raise ValidationError("password must contain at least 8 characters.")
        if find_user_by_email(email):
            return jsonify({"error": "An account already exists for this email."}), 409
        user_id = create_user(email, name, generate_password_hash(password))
        return jsonify({"id": user_id, "email": email, "name": name, "role": "user"}), 201
    except ValidationError as error:
        return jsonify({"error": str(error)}), 400


@auth_bp.post("/login")
def login():
    try:
        payload = require_json_object(request.get_json(silent=True))
        email = require_non_empty_string(payload, "email", 320).lower()
        password = require_non_empty_string(payload, "password", 200)
        user = find_user_by_email(email)
        if not user or not check_password_hash(user.get("passwordHash", ""), password):
            return jsonify({"error": "Invalid credentials."}), 401
        identity = str(user["_id"])
        token = create_access_token(identity=identity, additional_claims={"email": user["email"], "role": user.get("role", "user"), "name": user.get("name", "")})
        return jsonify({"accessToken": token, "user": {"id": identity, "email": user["email"], "name": user.get("name"), "role": user.get("role", "user")}})
    except ValidationError as error:
        return jsonify({"error": str(error)}), 400


@auth_bp.get("/me")
@require_auth
def me():
    from flask_jwt_extended import get_jwt
    claims = get_jwt()
    return jsonify({"id": get_jwt_identity(), "email": claims.get("email"), "name": claims.get("name"), "role": claims.get("role")})
