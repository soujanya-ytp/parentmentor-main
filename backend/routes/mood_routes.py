from flask import Blueprint, g, request

from services.auth_service import auth_required
from services.mood_service import create_mood, delete_mood, list_moods
from services.response_service import error_response

mood_bp = Blueprint("mood", __name__)


@mood_bp.get("/moods")
@auth_required
def fetch_moods():
    child_id = request.args.get("child_id", type=int)

    try:
        return list_moods(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@mood_bp.post("/moods")
@auth_required
def add_mood():
    payload = request.get_json(silent=True) or {}

    try:
        return create_mood(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@mood_bp.delete("/moods/<int:mood_id>")
@auth_required
def remove_mood(mood_id):
    child_id = request.args.get("child_id", type=int)

    try:
        return delete_mood(g.current_user["id"], mood_id, child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)
