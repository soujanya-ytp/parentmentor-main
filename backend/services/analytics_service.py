from datetime import datetime, timedelta, timezone

from models.activity import list_activities_by_child
from models.badge import list_badges_by_child
from models.child import get_child_for_user
from models.mood_log import list_moods_by_child
from models.reward import list_rewards_by_child
from models.routine import list_routines_by_child
from models.task import list_tasks_by_child
from models.weekly_insight import upsert_weekly_insight
from services.ai_service import generate_weekly_summary
from services.response_service import success_response

MOOD_SCORES = {
    "overwhelmed": 1,
    "anxious": 2,
    "sad": 3,
    "frustrated": 4,
    "tired": 5,
    "calm": 7,
    "happy": 8,
    "energetic": 9,
}


def get_dashboard(user_id, child_id):
    child = _require_child(user_id, child_id)
    tasks = list_tasks_by_child(child_id)
    moods = list_moods_by_child(child_id)
    rewards = list_rewards_by_child(child_id)
    badges = list_badges_by_child(child_id)
    routines = list_routines_by_child(child_id)
    activities = list_activities_by_child(child_id)

    completion_rate = _completion_rate(tasks)
    streak = max((task["streak"] for task in tasks), default=0)
    points_total = sum(task["points"] for task in tasks if task["completed"])
    today_tasks = [task for task in tasks if not task["completed"]]
    mood_summary = _mood_summary(moods)
    insights = _build_weekly_summary(child, tasks, moods)

    return success_response(
        {
            "child": child,
            "stats": {
                "today_tasks": len(today_tasks),
                "current_streak": streak,
                "reward_points": points_total,
                "mood_trend": mood_summary["trend_label"],
                "completion_rate": completion_rate,
                "quick_recommendation": insights["recommendation"],
            },
            "tasks": {
                "today": today_tasks,
                "completed": [task for task in tasks if task["completed"]],
                "upcoming": [task for task in tasks if not task["completed"] and task.get("due_date")],
            },
            "mood_summary": mood_summary,
            "weekly_summary": insights,
            "rewards": rewards,
            "badges": badges,
            "routines": routines[:3],
            "activities": activities[:3],
        }
    )


def get_analytics(user_id, child_id):
    child = _require_child(user_id, child_id)
    tasks = list_tasks_by_child(child_id)
    moods = list_moods_by_child(child_id)
    summary = _build_weekly_summary(child, tasks, moods)
    mood_summary = _mood_summary(moods)

    return success_response(
        {
            "completion_rate": _completion_rate(tasks),
            "insights": [
                summary["summary"],
                f"Focus area for next week: {summary['focus_area_next_week']}",
                summary["recommendation"],
            ],
            "mood_summary": mood_summary,
            "task_breakdown": _task_breakdown(tasks),
        }
    )


def get_insights(user_id, child_id):
    child = _require_child(user_id, child_id)
    tasks = list_tasks_by_child(child_id)
    moods = list_moods_by_child(child_id)
    rewards = list_rewards_by_child(child_id)
    routines = list_routines_by_child(child_id)

    summary = _build_weekly_summary(child, tasks, moods)
    return success_response(
        {
            "completion_rate": _completion_rate(tasks),
            "habit_consistency": max((task["streak"] for task in tasks), default=0),
            "streak_highlights": [task["title"] for task in tasks if task["streak"] >= 3][:3],
            "recent_mood_trend": _mood_summary(moods),
            "strongest_habit": summary["strongest_habit"],
            "challenge_area": summary["challenge_area"],
            "focus_area_next_week": summary["focus_area_next_week"],
            "recommendation": summary["recommendation"],
            "weekly_summary": summary["summary"],
            "reward_progress": {
                "points_total": sum(task["points"] for task in tasks if task["completed"]),
                "available_rewards": len(rewards),
                "active_routines": len([routine for routine in routines if not routine["archived"]]),
            },
        }
    )


def _completion_rate(tasks):
    if not tasks:
        return 0
    completed = sum(1 for task in tasks if task["completed"])
    return round((completed / len(tasks)) * 100, 1)


def _task_breakdown(tasks):
    return {
        "completed": len([task for task in tasks if task["completed"]]),
        "pending": len([task for task in tasks if not task["completed"]]),
        "recurring": len([task for task in tasks if task["recurring"]]),
    }


def _mood_summary(moods):
    if not moods:
        return {"recent": [], "trend_label": "No mood logs yet", "average_score": 0}

    recent = moods[:7]
    scores = [MOOD_SCORES.get(entry["mood"], 5) for entry in recent]
    average = round(sum(scores) / len(scores), 1)
    if average >= 7:
        trend = "Mostly positive"
    elif average >= 5:
        trend = "Mixed but stable"
    else:
        trend = "Needs more support"
    return {"recent": recent, "trend_label": trend, "average_score": average}


def _build_weekly_summary(child, tasks, moods):
    strongest_habit = _strongest_habit(tasks)
    challenge_area = _challenge_area(tasks, moods)
    completion_rate = _completion_rate(tasks)
    mood_trend = _mood_summary(moods)["trend_label"].lower()
    ai_summary = generate_weekly_summary(
        child,
        {
            "completion_rate": completion_rate,
            "mood_trend": mood_trend,
            "strongest_habit": strongest_habit,
            "challenge_area": challenge_area,
        },
    )
    ai_summary["strongest_habit"] = strongest_habit
    ai_summary["challenge_area"] = challenge_area
    upsert_weekly_insight(
        child_id=child["id"],
        week_start=_current_week_start(),
        summary=ai_summary,
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    return ai_summary


def _strongest_habit(tasks):
    if not tasks:
        return "No habit data yet"
    top = max(tasks, key=lambda task: (task["streak"], task["points"]))
    return top["title"]


def _challenge_area(tasks, moods):
    if moods and moods[0]["mood"] in {"frustrated", "overwhelmed", "anxious"}:
        return "emotional regulation after difficult moments"
    incomplete = [task for task in tasks if not task["completed"]]
    if incomplete:
        return incomplete[0]["title"]
    return "keeping momentum steady"


def _current_week_start():
    today = datetime.now(timezone.utc).date()
    start = today - timedelta(days=today.weekday())
    return start.isoformat()


def _require_child(user_id, child_id):
    if child_id is None:
        raise ValueError("child_id is required")
    child = get_child_for_user(child_id, user_id)
    if not child:
        raise ValueError("Selected child not found for this user")
    return child
