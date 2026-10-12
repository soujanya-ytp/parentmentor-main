from flask import Blueprint, g, request

from services.activity_service import create_activity, delete_activity, generate_activity, list_activities
from services.auth_service import auth_required
from services.response_service import error_response

activity_bp = Blueprint("activity", __name__)


@activity_bp.get("/activities")
@auth_required
def fetch_activities():
    child_id = request.args.get("child_id", type=int)

    try:
        return list_activities(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@activity_bp.post("/activities")
@auth_required
def add_activity():
    payload = request.get_json(silent=True) or {}

    try:
        return create_activity(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@activity_bp.delete("/activities/<int:activity_id>")
@auth_required
def remove_activity(activity_id):
    child_id = request.args.get("child_id", type=int)

    try:
        return delete_activity(g.current_user["id"], activity_id, child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@activity_bp.post("/coach/activities")
@auth_required
def generate_activity_route():
    payload = request.get_json(silent=True) or {}

    try:
        return generate_activity(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)
