from datetime import date as date_type
from datetime import datetime, timezone

from models.child import get_child_for_user
from models.mood_log import create_mood_record, delete_mood_record, get_mood_by_id, list_moods_by_child
from services.response_service import success_response


def list_moods(user_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    return success_response({"moods": list_moods_by_child(child_id)})


def create_mood(user_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    mood = (payload.get("mood") or "").strip().lower()
    if mood not in {"happy", "calm", "sad", "frustrated", "anxious", "energetic", "tired", "overwhelmed"}:
        raise ValueError("Valid mood is required")
    entry = create_mood_record(
        child_id=child_id,
        mood=mood,
        notes=(payload.get("notes") or "").strip() or None,
        trigger=(payload.get("trigger") or "").strip() or None,
        what_helped=(payload.get("what_helped") or "").strip() or None,
        date=(payload.get("date") or date_type.today().isoformat()).strip(),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    return success_response({"mood": entry}, status=201)


def delete_mood(user_id, mood_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    mood = get_mood_by_id(mood_id)
    if not mood or mood["child_id"] != child_id:
        raise ValueError("Mood log not found for this child")
    delete_mood_record(mood_id, child_id)
    return success_response({"deleted": True, "mood_id": mood_id})


def _parse_child_id(child_id):
    if child_id in (None, ""):
        raise ValueError("child_id is required")
    try:
        return int(child_id)
    except (TypeError, ValueError):
        raise ValueError("child_id must be a number")


def _require_child(user_id, child_id):
    if not get_child_for_user(child_id, user_id):
        raise ValueError("Selected child not found for this user")
