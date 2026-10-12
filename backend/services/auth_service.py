from datetime import datetime, timedelta, timezone
from functools import wraps

import jwt
from flask import current_app, g, request
from werkzeug.security import check_password_hash, generate_password_hash

from models.user import create_user, find_user_by_email, find_user_by_id, update_user_name
from services.response_service import error_response, success_response


def register_user(payload):
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""
    name = (payload.get("name") or "").strip() or None

    if not email or not password:
        raise ValueError("Email and password are required")

    if find_user_by_email(email):
        raise ValueError("Email already exists")

    user = create_user(
        email=email,
        name=name,
        password_hash=generate_password_hash(password),
        created_at=_now_iso(),
    )

    return success_response(
        {
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user.get("name"),
                "created_at": user["created_at"],
            }
        },
        status=201,
    )


def login_user(payload):
    email = (payload.get("email") or "").strip().lower()
    password = payload.get("password") or ""

    if not email or not password:
        raise ValueError("Email and password are required")

    user = find_user_by_email(email)
    if not user or not check_password_hash(user["password_hash"], password):
        raise ValueError("Invalid email or password")

    token = jwt.encode(
        {
            "sub": str(user["id"]),
            "exp": datetime.now(timezone.utc) + timedelta(hours=24),
        },
        current_app.config["SECRET_KEY"],
        algorithm="HS256",
    )

    return success_response(
        {
            "token": token,
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user.get("name"),
            },
        }
    )


def get_current_user(user_id):
    user = find_user_by_id(user_id)
    if not user:
        raise ValueError("User not found")

    return success_response(
        {
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user.get("name"),
                "created_at": user["created_at"],
            }
        }
    )


def update_current_user(user_id, payload):
    name = (payload.get("name") or "").strip()
    if not name:
        raise ValueError("Name is required")

    user = update_user_name(user_id, name)
    return success_response(
        {
            "user": {
                "id": user["id"],
                "email": user["email"],
                "name": user.get("name"),
                "created_at": user["created_at"],
            }
        }
    )


def auth_required(view_func):
    @wraps(view_func)
    def wrapped(*args, **kwargs):
        auth_header = request.headers.get("Authorization", "")
        token = auth_header.removeprefix("Bearer ").strip()

        if not token:
            return error_response("Unauthorized", 401)

        try:
            payload = jwt.decode(
                token,
                current_app.config["SECRET_KEY"],
                algorithms=["HS256"],
            )
            user = find_user_by_id(int(payload["sub"]))
        except (jwt.InvalidTokenError, KeyError, TypeError, ValueError):
            return error_response("Unauthorized", 401)

        if not user:
            return error_response("Unauthorized", 401)

        g.current_user = {"id": user["id"], "email": user["email"], "name": user.get("name")}
        return view_func(*args, **kwargs)

    return wrapped


def _now_iso():
    return datetime.now(timezone.utc).isoformat()
