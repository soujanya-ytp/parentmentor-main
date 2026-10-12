from datetime import datetime, timezone

from models.activity import create_activity_record, delete_activity_record, get_activity_by_id, list_activities_by_child
from models.child import get_child_for_user
from services.ai_service import generate_activity_suggestion
from services.response_service import success_response


def list_activities(user_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    return success_response({"activities": list_activities_by_child(child_id)})


def create_activity(user_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    title = (payload.get("title") or "").strip()
    description = (payload.get("description") or "").strip()
    if not title or not description:
        raise ValueError("Activity title and description are required")
    activity = create_activity_record(
        child_id=child_id,
        title=title,
        category=(payload.get("category") or "screen-free fun").strip(),
        description=description,
        materials=(payload.get("materials") or "").strip() or None,
        duration=(payload.get("duration") or "").strip() or None,
        benefits=(payload.get("benefits") or "").strip() or None,
        parent_tip=(payload.get("parent_tip") or "").strip() or None,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    return success_response({"activity": activity}, status=201)


def generate_activity(user_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    child = _require_child(user_id, child_id)
    return success_response({"activity": generate_activity_suggestion(child, payload)})


def delete_activity(user_id, activity_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    activity = get_activity_by_id(activity_id)
    if not activity or activity["child_id"] != child_id:
        raise ValueError("Activity not found for this child")
    delete_activity_record(activity_id, child_id)
    return success_response({"deleted": True, "activity_id": activity_id})


def _parse_child_id(child_id):
    if child_id in (None, ""):
        raise ValueError("child_id is required")
    try:
        return int(child_id)
    except (TypeError, ValueError):
        raise ValueError("child_id must be a number")


def _require_child(user_id, child_id):
    child = get_child_for_user(child_id, user_id)
    if not child:
        raise ValueError("Selected child not found for this user")
    return child
