from datetime import date as date_type

from models.child import get_child_for_user
from models.daily_log import create_daily_log, list_logs_by_child
from services.response_service import success_response


def create_log(user_id, payload):
    child_id = payload.get("child_id")
    if child_id in (None, ""):
        raise ValueError("child_id is required")

    try:
        child_id = int(child_id)
    except (TypeError, ValueError):
        raise ValueError("child_id must be a number")

    if not get_child_for_user(child_id, user_id):
        raise ValueError("Selected child not found for this user")

    log = create_daily_log(
        child_id=child_id,
        date=(payload.get("date") or date_type.today().isoformat()).strip(),
        routine_completed=bool(payload.get("routine_completed")),
        food_quality=(payload.get("food_quality") or "").strip() or None,
        notes=(payload.get("notes") or "").strip() or None,
    )
    return success_response({"log": log}, status=201)


def get_logs(user_id, child_id):
    if child_id is None:
        raise ValueError("child_id is required")

    if not get_child_for_user(child_id, user_id):
        raise ValueError("Selected child not found for this user")

    return success_response({"logs": list_logs_by_child(child_id)})
