from datetime import datetime, timezone

from models.badge import create_badge_record, list_badges_by_child
from models.child import get_child_for_user
from models.reward import (
    create_reward_record,
    delete_reward_record,
    get_reward_for_child,
    list_rewards_by_child,
    set_reward_claim_status,
    update_reward_record,
)
from models.task import list_tasks_by_child
from services.response_service import success_response


def list_rewards(user_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    rewards = _hydrate_rewards(child_id)
    return success_response({"rewards": rewards, "badges": list_badges_by_child(child_id), "points_total": _points_total(child_id)})


def create_reward(user_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    title = (payload.get("title") or "").strip()
    if not title:
        raise ValueError("Reward title is required")
    reward = create_reward_record(
        child_id=child_id,
        title=title,
        description=(payload.get("description") or "").strip() or None,
        points_required=int(payload.get("points_required") or 50),
        created_at=datetime.now(timezone.utc).isoformat(),
    )
    reward = _apply_reward_status(child_id, reward)
    return success_response({"reward": reward}, status=201)


def update_reward(user_id, reward_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    reward = update_reward_record(
        reward_id,
        child_id,
        (payload.get("title") or "").strip(),
        (payload.get("description") or "").strip() or None,
        int(payload.get("points_required") or 50),
    )
    if not reward:
        raise ValueError("Reward not found for this child")
    reward = _apply_reward_status(child_id, reward)
    return success_response({"reward": reward})


def claim_reward(user_id, reward_id, payload):
    child_id = _parse_child_id(payload.get("child_id"))
    _require_child(user_id, child_id)
    reward = _apply_reward_status(child_id, get_reward_for_child(reward_id, child_id))
    if not reward:
        raise ValueError("Reward not found for this child")
    if not reward["achieved"]:
        raise ValueError("Not enough points to claim this reward yet")
    if reward["claimed"]:
        return success_response({"reward": reward})

    claimed = set_reward_claim_status(
        reward_id=reward_id,
        child_id=child_id,
        achieved=True,
        claimed=True,
        claimed_at=datetime.now(timezone.utc).isoformat(),
    )
    create_badge_record(
        child_id=child_id,
        title=f"{claimed['title']} Claimed",
        description="Celebrated a completed reward goal.",
        icon="🎁",
        earned_at=datetime.now(timezone.utc).isoformat(),
    )
    return success_response({"reward": claimed, "badges": list_badges_by_child(child_id)})


def delete_reward(user_id, reward_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    if not get_reward_for_child(reward_id, child_id):
        raise ValueError("Reward not found for this child")
    delete_reward_record(reward_id, child_id)
    return success_response({"deleted": True, "reward_id": reward_id})


def list_badges(user_id, child_id):
    child_id = _parse_child_id(child_id)
    _require_child(user_id, child_id)
    return success_response({"badges": list_badges_by_child(child_id)})


def _hydrate_rewards(child_id):
    return [_apply_reward_status(child_id, reward) for reward in list_rewards_by_child(child_id)]


def _apply_reward_status(child_id, reward):
    if not reward:
        return None
    achieved = _points_total(child_id) >= reward["points_required"]
    if achieved != reward["achieved"]:
        reward = set_reward_claim_status(
            reward_id=reward["id"],
            child_id=child_id,
            achieved=achieved,
            claimed=reward["claimed"],
            claimed_at=reward.get("claimed_at"),
        )
    return reward


def _points_total(child_id):
    tasks = list_tasks_by_child(child_id)
    return sum(task["points"] for task in tasks if task["completed"])


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
