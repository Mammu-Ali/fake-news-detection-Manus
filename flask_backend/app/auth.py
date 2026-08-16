from __future__ import annotations

from functools import wraps
from typing import Any, Callable

from flask import jsonify
from flask_jwt_extended import get_jwt, verify_jwt_in_request


def require_auth(view: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(view)
    def wrapped(*args: Any, **kwargs: Any):
        verify_jwt_in_request()
        return view(*args, **kwargs)

    return wrapped


def require_admin(view: Callable[..., Any]) -> Callable[..., Any]:
    @wraps(view)
    def wrapped(*args: Any, **kwargs: Any):
        verify_jwt_in_request()
        claims = get_jwt()
        if claims.get("role") != "admin":
            return jsonify({"error": "Administrator access required."}), 403
        return view(*args, **kwargs)

    return wrapped
