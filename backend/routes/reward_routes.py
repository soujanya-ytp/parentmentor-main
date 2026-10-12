from flask import Blueprint, g, request

from services.auth_service import auth_required
from services.response_service import error_response
from services.reward_service import (
    claim_reward,
    create_reward,
    delete_reward,
    list_badges,
    list_rewards,
    update_reward,
)

reward_bp = Blueprint("reward", __name__)


@reward_bp.get("/rewards")
@auth_required
def fetch_rewards():
    child_id = request.args.get("child_id", type=int)

    try:
        return list_rewards(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@reward_bp.post("/rewards")
@auth_required
def add_reward():
    payload = request.get_json(silent=True) or {}

    try:
        return create_reward(g.current_user["id"], payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@reward_bp.put("/rewards/<int:reward_id>")
@auth_required
def edit_reward(reward_id):
    payload = request.get_json(silent=True) or {}

    try:
        return update_reward(g.current_user["id"], reward_id, payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@reward_bp.patch("/rewards/<int:reward_id>/claim")
@auth_required
def claim_reward_route(reward_id):
    payload = request.get_json(silent=True) or {}

    try:
        return claim_reward(g.current_user["id"], reward_id, payload)
    except ValueError as exc:
        return error_response(str(exc), 400)


@reward_bp.delete("/rewards/<int:reward_id>")
@auth_required
def remove_reward(reward_id):
    child_id = request.args.get("child_id", type=int)

    try:
        return delete_reward(g.current_user["id"], reward_id, child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)


@reward_bp.get("/badges")
@auth_required
def fetch_badges():
    child_id = request.args.get("child_id", type=int)

    try:
        return list_badges(g.current_user["id"], child_id)
    except ValueError as exc:
        return error_response(str(exc), 400)
