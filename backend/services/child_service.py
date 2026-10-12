from datetime import datetime, timezone

from models.activity import list_activities_by_child
from models.badge import list_badges_by_child
from models.child import (
    create_child_record,
    delete_child_record,
    get_child_for_user,
    list_children_by_user,
    update_child_mode,
    update_child_record,
)
from models.mood_log import list_moods_by_child
from models.reward import list_rewards_by_child
from models.routine import list_routines_by_child
from models.task import list_tasks_by_child
from services.history_service import get_history_payload
from services.response_service import success_response


def create_child(user_id, payload):
    normalized = _normalize_child_payload(payload, require_required=True)
    child = create_child_record(
        user_id=user_id,
        created_at=datetime.now(timezone.utc).isoformat(),
        **normalized,
    )
    return success_response({"child": child}, status=201)


def list_children(user_id):
    return success_response({"children": list_children_by_user(user_id)})


def get_child_detail(user_id, child_id):
    child = _get_child_or_raise(user_id, child_id)
    return success_response(
        {
            "child": child,
            "tasks": list_tasks_by_child(child_id),
            "routines": list_routines_by_child(child_id),
            "activities": list_activities_by_child(child_id),
            "moods": list_moods_by_child(child_id),
            "rewards": list_rewards_by_child(child_id),
            "badges": list_badges_by_child(child_id),
            "history": get_history_payload(user_id, child_id),
        }
    )


def update_child(user_id, child_id, payload):
    _get_child_or_raise(user_id, child_id)
    normalized = _normalize_child_payload(payload, require_required=True)
    child = update_child_record(child_id, user_id, normalized)
    return success_response({"child": child})


def delete_child(user_id, child_id):
    _get_child_or_raise(user_id, child_id)
    delete_child_record(child_id, user_id)
    return success_response({"deleted": True, "child_id": child_id})


def set_child_mode(user_id, payload):
    child_id = payload.get("child_id")
    mode = (payload.get("mode") or "").strip().lower()

    if child_id in (None, "") or mode not in {"parent", "child"}:
        raise ValueError("child_id and valid mode are required")

    try:
        child_id = int(child_id)
    except (TypeError, ValueError):
        raise ValueError("child_id must be a number")

    child = update_child_mode(child_id, user_id, mode)
    if not child:
        raise ValueError("Selected child not found for this user")

    return success_response({"child": child})


def _normalize_child_payload(payload, require_required):
    name = (payload.get("name") or "").strip()
    age = payload.get("age")

    if require_required and (not name or age in (None, "")):
        raise ValueError("Child name and age are required")

    try:
        age = int(age)
    except (TypeError, ValueError):
        raise ValueError("Age must be a number")

    return {
        "name": name,
        "age": age,
        "avatar": (payload.get("avatar") or "").strip() or None,
        "interests": (payload.get("interests") or "").strip() or None,
        "favorite_activities": (payload.get("favorite_activities") or "").strip() or None,
        "strengths": (payload.get("strengths") or "").strip() or None,
        "challenges": (payload.get("challenges") or "").strip() or None,
        "goal": (payload.get("goal") or "").strip() or None,
        "notes": (payload.get("notes") or "").strip() or None,
        "mode": (payload.get("mode") or "parent").strip().lower() if payload.get("mode") else "parent",
    }


def _get_child_or_raise(user_id, child_id):
    if child_id in (None, ""):
        raise ValueError("child_id is required")
    try:
        child_id = int(child_id)
    except (TypeError, ValueError):
        raise ValueError("child_id must be a number")

    child = get_child_for_user(child_id, user_id)
    if not child:
        raise ValueError("Selected child not found for this user")
    return child
