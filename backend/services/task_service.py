from datetime import datetime, timezone

from models.badge import create_badge_record, find_badge_by_title
from models.child import get_child_for_user
from models.task import (
    create_task_record,
    delete_task_record,
    get_task_for_child,
    list_tasks_by_child,
    update_task_completion,
    update_task_record,
)
from services.response_service import success_response


def list_tasks(user_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    return success_response({"tasks": list_tasks_by_child(child_id)})


def create_task(user_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    normalized = _normalize_payload(payload, require_title=True)
    timestamp = datetime.now(timezone.utc).isoformat()
    task = create_task_record(child_id=child_id, created_at=timestamp, **normalized)
    return success_response({"task": task}, status=201)


def update_task(user_id, task_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    normalized = _normalize_payload(payload, require_title=True)
    normalized["updated_at"] = datetime.now(timezone.utc).isoformat()
    task = update_task_record(task_id, child_id, normalized)
    if not task:
        raise ValueError("Task not found for this child")
    return success_response({"task": task})


def toggle_task(user_id, task_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    task = get_task_for_child(task_id, child_id)
    if not task:
        raise ValueError("Task not found for this child")

    completed = bool(payload.get("completed"))
    timestamp = datetime.now(timezone.utc).isoformat()
    date_marker = datetime.now(timezone.utc).date().isoformat()
    history = [entry for entry in (task.get("completion_history") or []) if entry != date_marker]
    if completed:
        history.append(date_marker)

    updated = update_task_completion(
        task_id=task_id,
        child_id=child_id,
        completed=completed,
        streak=_calculate_streak(history),
        history=sorted(history),
        updated_at=timestamp,
        completed_at=timestamp if completed else None,
    )
    _award_badges(child_id, updated)
    return success_response({"task": updated})


def delete_task(user_id, task_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    if not get_task_for_child(task_id, child_id):
        raise ValueError("Task not found for this child")
    delete_task_record(task_id, child_id)
    return success_response({"deleted": True, "task_id": task_id})


def _normalize_payload(payload, require_title):
    title = (payload.get("title") or "").strip()
    if require_title and not title:
        raise ValueError("Task title is required")
    return {
        "title": title,
        "description": (payload.get("description") or "").strip() or None,
        "task_type": (payload.get("type") or "daily").strip().lower(),
        "points": int(payload.get("points") or 10),
        "due_date": (payload.get("due_date") or "").strip() or None,
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
    if not get_child_for_user(child_id, user_id):
        raise ValueError("Selected child not found for this user")


def _calculate_streak(history):
    if not history:
        return 0
    dates = sorted(history, reverse=True)
    streak = 1
    current = datetime.fromisoformat(dates[0]).date()
    for item in dates[1:]:
        next_date = datetime.fromisoformat(item).date()
        if (current - next_date).days == 1:
            streak += 1
            current = next_date
        else:
            break
    return streak


def _award_badges(child_id, task):
    streak = task.get("streak", 0)
    badges = []
    if streak >= 3:
        badges.append(("3-Day Streak", "Stayed consistent for three days.", "🌟"))
    if streak >= 7:
        badges.append(("7-Day Streak", "Built a full week of momentum.", "🏆"))

    for title, description, icon in badges:
        if not find_badge_by_title(child_id, title):
            create_badge_record(
                child_id=child_id,
                title=title,
                description=description,
                icon=icon,
                earned_at=datetime.now(timezone.utc).isoformat(),
            )
