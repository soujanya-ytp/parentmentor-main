from flask import Blueprint, g, request

from services.auth_service import auth_required
from services.child_service import (
    create_child,
    delete_child,
    get_child_detail,
    list_children,
    set_child_mode,
    update_child,
)
from services.response_service import error_response

child_bp = Blueprint("child", __name__)


@child_bp.post("/child")
@auth_required
def add_child():
    payload = request.get_json(silent=True) or {}

    try:
        return create_child(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@child_bp.get("/child")
@auth_required
def get_children():
    return list_children(g.current_user["id"])


@child_bp.get("/children/<int:child_id>")
@auth_required
def get_child(child_id):
    try:
        return get_child_detail(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 404)


@child_bp.post("/children")
@auth_required
def add_child_v2():
    payload = request.get_json(silent=True) or {}

    try:
        return create_child(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@child_bp.get("/children")
@auth_required
def get_children_v2():
    return list_children(g.current_user["id"])


@child_bp.put("/children/<int:child_id>")
@auth_required
def edit_child(child_id):
    payload = request.get_json(silent=True) or {}

    try:
        return update_child(g.current_user["id"], child_id, payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@child_bp.delete("/children/<int:child_id>")
@auth_required
def remove_child(child_id):
    try:
        return delete_child(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 404)


@child_bp.patch("/child/mode")
@auth_required
def patch_child_mode():
    payload = request.get_json(silent=True) or {}

    try:
        return set_child_mode(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)
