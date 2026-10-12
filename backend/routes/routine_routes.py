from flask import Blueprint, g, request

from services.auth_service import auth_required
from services.response_service import error_response
from services.routine_service import (
    create_routine,
    delete_routine,
    generate_routine,
    list_routines,
    update_routine,
)

routine_bp = Blueprint("routine", __name__)


@routine_bp.post("/routines")
@auth_required
def create_routine_route():
    payload = request.get_json(silent=True) or {}

    try:
        return create_routine(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@routine_bp.get("/routines")
@auth_required
def fetch_routines():
    child_id = request.args.get("child_id", type=int)

    try:
        return list_routines(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@routine_bp.put("/routines/<int:routine_id>")
@auth_required
def edit_routine(routine_id):
    payload = request.get_json(silent=True) or {}

    try:
        return update_routine(g.current_user["id"], routine_id, payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@routine_bp.delete("/routines/<int:routine_id>")
@auth_required
def remove_routine(routine_id):
    child_id = request.args.get("child_id", type=int)

    try:
        return delete_routine(g.current_user["id"], routine_id, child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@routine_bp.post("/coach/routine")
@auth_required
def generate_routine_route():
    payload = request.get_json(silent=True) or {}

    try:
        return generate_routine(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)
