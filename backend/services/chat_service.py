from datetime import datetime, timezone

from ai.ai_service import generate_parenting_response
from models.chat_history import (
    create_history_record,
    create_thread_record,
    get_thread_for_user,
    list_history_by_user,
    touch_thread,
)
from models.child import get_child_for_user
from models.daily_log import list_logs_by_child
from models.mood_log import list_moods_by_child
from models.routine import list_routines_by_child
from services.response_service import success_response


def create_chat(user, payload):
    user_id = user["id"]
    question = (payload.get("question") or "").strip()
    child_id = payload.get("child_id")
    thread_id = payload.get("thread_id")

    if not question or child_id in (None, ""):
        raise ValueError("Question and child_id are required")

    try:
        child_id = int(child_id)
    except (TypeError, ValueError):
        raise ValueError("child_id must be a number")

    child = get_child_for_user(child_id, user_id)
    if not child:
        raise ValueError("Selected child not found for this user")

    if thread_id not in (None, ""):
        try:
            thread_id = int(thread_id)
        except (TypeError, ValueError):
            raise ValueError("thread_id must be a number")
        thread = get_thread_for_user(thread_id, user_id, child_id)
        if not thread:
            raise ValueError("Selected thread not found for this child")
    else:
        timestamp = datetime.now(timezone.utc).isoformat()
        thread = create_thread_record(
            user_id=user_id,
            child_id=child_id,
            title=_build_thread_title(question),
            created_at=timestamp,
            updated_at=timestamp,
        )
        thread_id = thread["id"]

    routines = list_routines_by_child(child_id)
    latest_routine = next((routine for routine in routines if not routine.get("archived")), None)
    latest_logs = list_logs_by_child(child_id)[:3]
    latest_moods = list_moods_by_child(child_id)[:3]
    recent_history = list_history_by_user(user_id, child_id=child_id, thread_id=thread_id)[:5]

    ai_response = generate_parenting_response(
        question=question,
        parent_name=user.get("name"),
        child_name=child.get("name"),
        child_age=child["age"],
        goal=child.get("goal"),
        mode=child.get("mode"),
        routine_summary=_build_routine_summary(latest_routine),
        latest_logs_summary=_build_logs_summary(latest_logs),
        latest_moods_summary=_build_moods_summary(latest_moods),
        recent_history_summary=_build_history_summary(recent_history),
    )

    created_at = datetime.now(timezone.utc).isoformat()
    history = create_history_record(
        user_id=user_id,
        child_id=child_id,
        thread_id=thread_id,
        question=question,
        response=ai_response,
        created_at=created_at,
    )
    touch_thread(thread_id, created_at)

    return success_response(
        {
            "chat_id": history["id"],
            "child_id": history["child_id"],
            "thread_id": thread_id,
            "thread_title": thread["title"],
            "question": history["question"],
            "response": history["response"],
        }
    )


def _build_routine_summary(routine):
    if not routine:
        return "No routine has been set yet."

    items = routine.get("items") or []
    item_titles = [item.get("title") for item in items if item.get("title")]
    item_text = ", ".join(item_titles[:5]) if item_titles else "No checklist items"

    return (
        f"Routine '{routine.get('title')}' for {routine.get('time_of_day') or 'any time'}, "
        f"goal: {routine.get('goal') or 'not specified'}, items: {item_text}."
    )


def _build_logs_summary(logs):
    if not logs:
        return "No recent daily logs."

    parts = []
    for log in logs:
        parts.append(
            f"{log['date']}: completed={'yes' if log['routine_completed'] else 'no'}, "
            f"food={log.get('food_quality') or 'not noted'}, notes={log.get('notes') or 'none'}"
        )
    return " | ".join(parts)


def _build_moods_summary(moods):
    if not moods:
        return "No recent mood logs."

    parts = []
    for mood in moods:
        parts.append(
            f"{mood['date']}: mood={mood['mood']}, trigger={mood.get('trigger') or 'not noted'}, "
            f"helped={mood.get('what_helped') or 'not noted'}"
        )
    return " | ".join(parts)


def _build_history_summary(history):
    if not history:
        return "No recent coach chat history."

    parts = []
    for item in history:
        parts.append(f"Q: {item['question']}")
    return " | ".join(parts)


def _build_thread_title(question):
    title = question.strip()
    if len(title) <= 60:
        return title
    return f"{title[:57].rstrip()}..."
