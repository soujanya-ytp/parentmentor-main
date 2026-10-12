from datetime import datetime, timezone

from models.child import get_child_for_user
from models.routine import (
    create_routine_record,
    delete_routine_record,
    get_routine_for_child,
    list_routines_by_child,
    update_routine_record,
)
from services.ai_service import generate_routine_suggestion
from services.response_service import success_response


def list_routines(user_id, child_id):
    _require_child(user_id, child_id)
    return success_response({"routines": list_routines_by_child(child_id)})


def create_routine(user_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    child = _require_child(user_id, child_id)
    normalized = _normalize_payload(payload, require_title=True)
    timestamp = datetime.now(timezone.utc).isoformat()
    routine = create_routine_record(
        child_id=child_id,
        created_at=timestamp,
        updated_at=timestamp,
        **normalized,
    )
    return success_response({"routine": routine, "child": child}, status=201)


def update_routine(user_id, routine_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    normalized = _normalize_payload(payload, require_title=True)
    normalized["updated_at"] = datetime.now(timezone.utc).isoformat()
    routine = update_routine_record(routine_id, child_id, normalized)
    if not routine:
        raise ValueError("Routine not found for this child")
    return success_response({"routine": routine})


def delete_routine(user_id, routine_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    if not get_routine_for_child(routine_id, child_id):
        raise ValueError("Routine not found for this child")
    delete_routine_record(routine_id, child_id)
    return success_response({"deleted": True, "routine_id": routine_id})


def generate_routine(user_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    child = _require_child(user_id, child_id)
    routine = generate_routine_suggestion(child, payload)
    return success_response({"routine": routine})


def _normalize_payload(payload, require_title):
    title = (payload.get("title") or "").strip()
    if require_title and not title:
        raise ValueError("Routine title is required")

    items = payload.get("items") or []
    if isinstance(items, str):
        items = [item.strip() for item in items.split("\n") if item.strip()]

    return {
        "title": title,
        "routine_type": (payload.get("routine_type") or "").strip() or None,
        "goal": (payload.get("goal") or "").strip() or None,
        "time_of_day": (payload.get("time_of_day") or "").strip() or None,
        "estimated_duration": (payload.get("estimated_duration") or "").strip() or None,
        "structure_level": (payload.get("structure_level") or "").strip() or None,
        "items": items,
        "parent_tips": (payload.get("parent_tips") or "").strip() or None,
        "child_phrase": (payload.get("child_phrase") or "").strip() or None,
        "archived": bool(payload.get("archived")),
        "recurring": bool(payload.get("recurring")),
    }


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
