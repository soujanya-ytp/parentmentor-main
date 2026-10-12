from flask import Blueprint, g, request

from services.auth_service import (
    auth_required,
    get_current_user,
    login_user,
    register_user,
    update_current_user,
)
from services.response_service import error_response

auth_bp = Blueprint("auth", __name__)


@auth_bp.post("/auth/register")
def register():
    payload = request.get_json(silent=True) or {}

    try:
        user = register_user(payload)
        return user
    except ValueError as exc:
        return error_response(str(exc), 400)


@auth_bp.post("/auth/login")
def login():
    payload = request.get_json(silent=True) or {}

    try:
        user = login_user(payload)
        return user
    except ValueError as exc:
        return error_response(str(exc), 401)


@auth_bp.get("/auth/me")
@auth_required
def me():
    try:
        return get_current_user(g.current_user["id"])
    except ValueError as exc:
        return error_response(str(exc), 404)


@auth_bp.patch("/auth/me")
@auth_required
def update_me():
    payload = request.get_json(silent=True) or {}

    try:
        return update_current_user(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)
